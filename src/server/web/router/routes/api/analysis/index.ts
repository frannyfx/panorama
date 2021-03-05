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
import { getRepository, Repository } from "../../../../../github";
import ticket from "../../../../../crypto/ticket";

// Models
import DatabaseAnalysis from "../../../../../database/models/Analysis";
import DatabaseRepository from "../../../../../database/models/Repository";
import DatabaseUser from "../../../../../database/models/User";

let route : Array<Route> = [{
	method: Method.PUT,
	url: "/api/queue/repo",
	auth: true,
	schemas: {
		body: Joi.object({
			name: Joi.string()
		})
	},
	handler: async (request: Request, response: any) => {
		// Get repository information.
		let repositoryResult = await getRepository(request.body!.name, request.auth!.token!);
		if (!repositoryResult.status.ok) return send(response, Codes.BadRequest);

		// Create job.
		try {
			// Insert data into the database and return a server error if any of those inserts fail.
			// TODO: MySQL transaction.
			// TODO: Just use throw for the errors since we're in a try/catch block.
			// - Requesting user.
			if (!(await DatabaseUser.insertOrUpdate({
				userId: request.auth!.payload!.id,
				login: request.auth!.payload!.login,
				lastAccess: new Date()
			}))) return send(response, Codes.ServerError);
			
			// - Repository owner.
			if (!(await DatabaseUser.insertOrUpdate({
				userId: repositoryResult.result!.owner.id,
				login: repositoryResult.result!.owner.login
			}))) return send(response, Codes.ServerError);

			// - Repository.
			if (!(await DatabaseRepository.insertOrUpdate({
				repositoryId: repositoryResult.result!.id,
				name: repositoryResult.result!.name,
				ownerId: repositoryResult.result!.owner.id,
				lastAnalysis: new Date()
			}))) return send(response, Codes.ServerError);

			// - Analysis
			let databaseAnalysis = await DatabaseAnalysis.insert({
				repositoryId: repositoryResult.result!.id,
				requestedBy: request.auth!.payload!.id,
				queuedAt: new Date()
			});

			if (!databaseAnalysis.analysisId) return send(response, Codes.ServerError);

			// Create repository item with only the necessary data.
			let repository : Repository = {
				id: repositoryResult.result!.id,
				name: repositoryResult.result!.full_name,
				size: repositoryResult.result!.size,
				updated_at: new Date(repositoryResult.result!.updated_at)
			};

			// Add the job to the queue.
			let job = await queue.getRepoQueue()!.createJob({
				repository,
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
		} catch {
			// If anything goes wrong in the process, return internal server error.
			return send(response, Codes.ServerError);
		}
	}
}];

export default route;