/**
 * @file Routes handling requests to analyse repositories.
 * @author Francesco Compagnoni
 */

// Imports
import Joi from "joi";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Config
import loadConfig, { Config } from "../../../../../Config";
const config : Config = loadConfig();

// Modules
import { Method } from "../../../../../../shared/Method";
import { Request, Route } from "../../../Route";
import { Codes, send } from "../../../API";
import queue from "../../../../../analysis/queue";
import cache from "../../../../../analysis/cache";
import { getRepository } from "../../../../../github";
import ticket from "../../../../../crypto/ticket";

// Models
import DatabaseAnalysis from "../../../../../database/models/Analysis";
import DatabaseRepository from "../../../../../database/models/Repository";
import DatabaseUser, { DatabaseUser as User } from "../../../../../database/models/User";
import DatabaseAnalysedItem from "../../../../../database/models/AnalysedItem";
import DatabaseAnalysisContributor from "../../../../../database/models/AnalysisContributor";
import { AnalysedItem } from "../../../../../analysis/Item";

let route : Array<Route> = [{
	method: Method.GET,
	url: "/api/repo/:owner/:repo/analysis",
	auth: true,
	schemas: {
		params: Joi.object({
			owner: Joi.string(),
			repo: Joi.string()
		})
	},
	handler: async (request: Request, response: any) => {
		// Check the user can access the repo.
		let repository = await getRepository(`${request.params!.owner}/${request.params!.repo}`, request.auth!.token!);
		if (!repository.status.ok) return send(response, Codes.Forbidden);

		// Get the latest ID for the repository.
		let analysisId = await DatabaseAnalysis.getLatestId(request.params!.owner, request.params!.repo);
		send(response, Codes.OK, {
			analysisId
		});
	}
}, {
	method: Method.GET,
	url: "/api/analysis/:id/contributors",
	auth: true,
	schemas: {
		params: Joi.object({
			id: Joi.number()
		})
	},
	handler: async (request: Request, response: any) => {
		// Get the requested analysis.
		let analysis = await DatabaseAnalysis.get(request.params!.id);

		// If the analysis does not exist, return 404. 
		if (!analysis) return send(response, Codes.NotFound);

		// Check if the user can access the analysis.
		let repository = await getRepository(`${analysis.owner}/${analysis.repositoryName}`, request.auth!.token!);
		if (!repository.status.ok) return send(response, Codes.Forbidden);

		// Get contributors.
		let contributors = await DatabaseAnalysisContributor.getFromAnalysis(request.params!.id);
		if (!contributors) return send(response, Codes.ServerError);

		// Create an object that maps logins to each user.
		let contributorObject : {[key: string]: User} = {};
		contributors.map(contributor => contributorObject[contributor.login] = contributor);
		return send(response, Codes.OK, contributorObject);
	}
}, {
	method: Method.GET,
	url: "/api/analysis/:id",
	auth: true,
	schemas: {
		params: Joi.object({
			id: Joi.number()
		}),
		query: Joi.object({
			path: Joi.string().required()
		})
	},
	handler: async (request: Request, response: any) => {
		// Get the requested analysis.
		let analysis = await DatabaseAnalysis.get(request.params!.id);

		// If the analysis does not exist, return 404. 
		if (!analysis) return send(response, Codes.NotFound);

		// Check if the user can access the analysis.
		let repository = await getRepository(`${analysis.owner}/${analysis.repositoryName}`, request.auth!.token!);
		if (!repository.status.ok) return send(response, Codes.Forbidden);

		// Get the files in the current folder.
		let analysisItems = await DatabaseAnalysedItem.getItemsInFolder(request.params!.id, request.query!.path);

		// Create an object that maps paths to the analysed item.
		let analysisObject : {[key: string]: AnalysedItem} = {};
		analysisItems.map(item => analysisObject[item.path] = item);

		// Return the object.
		send(response, Codes.OK, analysisObject);
	}
}, {
	method: Method.PUT,
	url: "/api/repo/queue",
	auth: true,
	schemas: {
		body: Joi.object({
			name: Joi.string()
		})
	},
	handler: async (request: Request, response: any) => {
		// TODO: Check if the repo is already enqueued.
		// Get repository information.
		let repositoryResult = await getRepository(request.body!.name, request.auth!.token!);
		if (!repositoryResult.status.ok) return send(response, Codes.BadRequest);

		// Create job.
		try {
			// Insert data into the database and return a server error if any of those inserts fail.
			// TODO: MySQL transaction.
			// TODO: Just use throw for the errors since we're in a try/catch block.
			// TODO: Look into MySQL TCP connection timeout (might just be due to connection from localhost to fran.codes)
			// - Requesting user.
			if (!(await DatabaseUser.insertOrUpdate({
				userId: request.auth!.payload!.id,
				login: request.auth!.payload!.login,
				lastAccess: new Date()
			}))) return send(response, Codes.ServerError);
			
			// - Repository owner.
			if (!(await DatabaseUser.insertOrUpdate({
				userId: repositoryResult.result!.owner!.id,
				login: repositoryResult.result!.owner!.login
			}))) return send(response, Codes.ServerError);

			// - Repository.
			if (!(await DatabaseRepository.insertOrUpdate({
				repositoryId: repositoryResult.result!.id,
				name: repositoryResult.result!.name,
				ownerId: repositoryResult.result!.owner!.id,
				lastAnalysis: new Date()
			}))) return send(response, Codes.ServerError);

			// - Analysis
			let databaseAnalysis = await DatabaseAnalysis.insert({
				repositoryId: repositoryResult.result!.id,
				requestedBy: request.auth!.payload!.id,
				queuedAt: new Date()
			});

			if (!databaseAnalysis.analysisId) return send(response, Codes.ServerError);

			// Add the job to the queue.
			let job = await queue.getRepoQueue()!.createJob({
				repository: repositoryResult.result!,
				analysis: databaseAnalysis,
				access_token: request.auth!.token!
			}).save();

			// Generate ticket to listen to job events.
			let jobTicket = await ticket.sign({
				jobId: job.id,
				accessTokenHash: crypto.createHash("sha256").update(request.auth!.token!).digest("hex")
			});

			// TODO: Handle failed job ticket generation.

			// Send the job ID and the ticket to the user.
			send(response, Codes.OK, {
				jobId: job.id,
				ticket: jobTicket
			});
		} catch (e) {
			// If anything goes wrong in the process, return internal server error.
			console.log(e);
			return send(response, Codes.ServerError);
		}
	}
}];

export default route;