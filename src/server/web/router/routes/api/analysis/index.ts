/**
 * @file Routes handling requests to analyse repositories.
 * @author Francesco Compagnoni
 */

// Imports
import Joi from "joi";
import crypto from "crypto";

// Modules
import { Method } from "../../../../../../shared/Method";
import { Request, Route } from "../../../Route";
import { Codes, send } from "../../../API";
import queue from "../../../../../analysis/queue";
import cache from "../../../../../analysis/cache";
import { getRepository } from "../../../../../github";
import ticket from "../../../../../crypto/ticket";

// Models
import DatabaseAnalysis, { DatabaseAnalysisStatus, DatabaseAnalysis as Analysis } from "../../../../../database/models/Analysis";
import DatabaseRepository from "../../../../../database/models/Repository";
import DatabaseUser, { DatabaseUser as User } from "../../../../../database/models/User";
import DatabaseAnalysedItem from "../../../../../database/models/AnalysedItem";
import DatabaseAnalysisContributor from "../../../../../database/models/AnalysisContributor";
import { AnalysedItem } from "../../../../../analysis/Item";
import { getRepoName, sleep } from "../../../../../../shared/utils";
import database from "../../../../../database";

/**
 * Validate a user's ticket to access an analysis.
 * @param analysisId The ID of the analysis data being requested.
 * @param accessToken The user's access tkoen.
 * @param userTicket The user's ticket.
 * @returns Whether the validation was successful.
 */
async function verifyTicket(analysisId: number, accessToken: string, userTicket: string) : Promise<boolean> {
	// Check ticket to prevent checking ownership every time.
	let ticketValidation = await ticket.verify(userTicket);
	if (!ticketValidation.ok) return false;

	// Check ticket information matches requested analysis ID and access token.
	return ticketValidation.decoded!.analysisId == analysisId && ticketValidation.decoded!.accessTokenHash == crypto.createHash("sha256").update(accessToken).digest("hex");
}

let route : Route[] = [{
	method: Method.GET,
	url: "/api/repo/:owner/:repo/analysis",
	auth: true,
	schemas: {
		params: Joi.object({
			owner: Joi.string(),
			repo: Joi.string()
		})
	},
	handler: async (request, reply) => {
		// Check the user can access the repo.
		let repository = await getRepository(`${request.params!.owner}/${request.params!.repo}`, request.auth!.token!);
		if (!repository.status.ok) return send(reply, Codes.Forbidden);

		// Get the latest ID for the repository.
		let analysis = await DatabaseAnalysis.getLatest(request.params!.owner, request.params!.repo, DatabaseAnalysisStatus.COMPLETED);

		// Return -1 as the ID if a suitable analysis was not found.
		if (!analysis) return send(reply, Codes.OK, {
			analysisId: -1,
		});
		
		// Return the analysis ID and the analysed commit.
		send(reply, Codes.OK, analysis);
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
	handler: async (request, reply) => {
		// Get the requested analysis.
		let analysis = await DatabaseAnalysis.get(request.params!.id);

		// If the analysis does not exist, return 404. 
		if (!analysis) return send(reply, Codes.NotFound);

		// Check if the user can access the analysis.
		let repository = await getRepository(`${analysis.owner}/${analysis.repositoryName}`, request.auth!.token!);
		if (!repository.status.ok) return send(reply, Codes.Forbidden);

		// Get contributors.
		let contributors = await DatabaseAnalysisContributor.getFromAnalysis(request.params!.id);
		if (!contributors) return send(reply, Codes.ServerError);

		// Create an object that maps logins to each user.
		let contributorObject : {[key: string]: User} = {};
		contributors.map(contributor => contributorObject[contributor.login] = contributor);
		return send(reply, Codes.OK, contributorObject);
	}
}, {
	method: Method.GET,
	url: "/api/analysis/:id/ticket",
	auth: true,
	schemas: {
		params: Joi.object({
			id: Joi.number()
		})
	},
	handler: async (request, reply) => {
		// Get the requested analysis.
		let analysis = await DatabaseAnalysis.get(request.params!.id);

		// If the analysis does not exist, return 404. 
		if (!analysis) return send(reply, Codes.NotFound);

		// Check if the user can access the analysis.
		let repository = await getRepository(`${analysis.owner}/${analysis.repositoryName}`, request.auth!.token!);
		if (!repository.status.ok) return send(reply, Codes.Forbidden);

		// Generate ticket.
		let analysisTicket = await ticket.sign({
			analysisId: request.params!.id,
			accessTokenHash: crypto.createHash("sha256").update(request.auth!.token!).digest("hex")
		});

		// If the ticket generation failed, send server error, otherwise send ticket.
		if (!analysisTicket) return send(reply, Codes.ServerError);
		return send(reply, Codes.OK, {
			ticket: analysisTicket!
		});
	}
}, {
	method: Method.GET,
	url: "/api/analysis/:id/items",
	auth: true,
	schemas: {
		params: Joi.object({
			id: Joi.number()
		}),
		query: Joi.object({
			path: Joi.string().required(),
			ticket: Joi.string().required()
		})
	},
	handler: async (request, reply) => {
		// Verify the ticket provided.
		if (!await verifyTicket(request.params!.id, request.auth!.token!, request.query!.ticket)) return send(reply, Codes.Forbidden);

		// Get the files in the current folder.
		let analysisItems = await DatabaseAnalysedItem.getItemsInFolder(request.params!.id, request.query!.path);
		
		// Create an object that maps paths to the analysed item.
		let analysisObject : {[key: string]: AnalysedItem} = {};
		analysisItems.map(item => analysisObject[item.path] = item);

		// Return the object.
		send(reply, Codes.OK, analysisObject);
	}
}, {
	method: Method.GET,
	url: "/api/analysis/:id/chunks",
	auth: true,
	schemas: {
		params: Joi.object({
			id: Joi.number()
		}),
		query: Joi.object({
			path: Joi.string().required(),
			ticket: Joi.string().required()
		})
	},
	handler: async (request, reply) => {
		// Verify the ticket provided.
		if (!await verifyTicket(request.params!.id, request.auth!.token!, request.query!.ticket)) return send(reply, Codes.Forbidden);

		// Get the file's analysis chunks.
		let fileChunks = await DatabaseAnalysedItem.getChunks(request.params!.id, request.query!.path);
		if (!fileChunks) return send(reply, Codes.BadRequest);
		send(reply, Codes.OK, fileChunks);
	}
}, {
	method: Method.GET,
	url: "/api/analysis/:id/tokens",
	auth: true,
	schemas: {
		params: Joi.object({
			id: Joi.number()
		}),
		query: Joi.object({
			path: Joi.string().required(),
			ticket: Joi.string().required()
		})
	},
	handler: async (request, reply) => {
		// Verify the ticket provided.
		if (!await verifyTicket(request.params!.id, request.auth!.token!, request.query!.ticket)) return send(reply, Codes.Forbidden);

		// Get the file's chunk tokens.
		let fileTokens = await DatabaseAnalysedItem.getTokens(request.params!.id, request.query!.path);
		if (!fileTokens) return send(reply, Codes.BadRequest);
		send(reply, Codes.OK, fileTokens);
	}
}, {
	method: Method.PUT,
	url: "/api/analysis/queue",
	auth: true,
	schemas: {
		body: Joi.object({
			name: Joi.string()
		})
	},
	handler: async (request, reply) => {
		// Check validity of the name passed.
		let repoName = getRepoName(request.body!.name);
		if (!repoName) return send(reply, Codes.BadRequest);

		// Get latest analysis of repository.
		let analysis = await DatabaseAnalysis.getLatest(repoName.owner, repoName.repo);

		// Get repository information.
		let repositoryResult = await getRepository(request.body!.name, request.auth!.token!);
		if (!repositoryResult.status.ok) return send(reply, Codes.Forbidden);

		// Check that an analysis for that repository is not already in progress.
		if (analysis && (analysis.status == DatabaseAnalysisStatus[DatabaseAnalysisStatus.QUEUED] || analysis.status == DatabaseAnalysisStatus[DatabaseAnalysisStatus.STARTED])) {
			// Check that the analysis has a jobId set.
			if (!analysis.jobId) return send(reply, Codes.OK, { jobId: null, ticket: null });

			// Generate ticket to listen to job events.
			let jobTicket = await ticket.sign({ jobId: analysis.jobId, accessTokenHash: crypto.createHash("sha256").update(request.auth!.token!).digest("hex") });
			return send(reply, Codes.OK, { jobId: analysis.jobId, ticket: jobTicket });
		}

		// If the last analysis was performed after the repository was last updated, then return OK.
		if (analysis && analysis.status == DatabaseAnalysisStatus[DatabaseAnalysisStatus.COMPLETED] && new Date(analysis.startedAt) >= new Date(repositoryResult.result!.pushed_at))
			return send(reply, Codes.OK, { jobId: null, ticket: null });

		// Create job.
		try {
			// Get the database connection.
			let connection = await database.getConnection();
			if (!connection) throw new Error("No database connection.");

			// Create database analysis.
			let databaseAnalysis : Analysis | undefined;
			await connection.transaction(async transaction => {
				// Insert user requesting.
				await DatabaseUser.insertOrUpdate({
					userId: request.auth!.payload!.id,
					login: request.auth!.payload!.login,
					lastAccess: new Date()
				}, transaction);

				// Insert repository owner.
				await DatabaseUser.insertOrUpdate({
					userId: repositoryResult.result!.owner!.id,
					login: repositoryResult.result!.owner!.login
				}, transaction);

				// Insert repository.
				await DatabaseRepository.insertOrUpdate({
					repositoryId: repositoryResult.result!.id,
					name: repositoryResult.result!.name,
					ownerId: repositoryResult.result!.owner!.id,
					lastAnalysed: new Date()
				}, transaction);

				// Insert analysis.
				databaseAnalysis = await DatabaseAnalysis.insert({
					repositoryId: repositoryResult.result!.id,
					requestedBy: request.auth!.payload!.id,
					status: DatabaseAnalysisStatus.QUEUED,
					queuedAt: new Date()
				}, transaction);
			});

			// Must have database analysis.
			if (!databaseAnalysis || !databaseAnalysis.analysisId) throw new Error("Transaction failed.");

			// Add the job to the queue.
			let job = await queue.getRepoQueue()!.createJob({
				repository: repositoryResult.result!,
				analysis: databaseAnalysis,
				access_token: request.auth!.token!
			}).save();

			// Update analysis with job ID.
			databaseAnalysis.jobId = job.id;
			await DatabaseAnalysis.update(databaseAnalysis);

			// Generate ticket to listen to job events.
			let jobTicket = await ticket.sign({ jobId: job.id, accessTokenHash: crypto.createHash("sha256").update(request.auth!.token!).digest("hex") });
			send(reply, Codes.OK, {
				jobId: job.id,
				ticket: jobTicket
			});
		} catch (e) {
			console.log(e);
			// If anything goes wrong in the process, return internal server error.
			return send(reply, Codes.ServerError);
		}
	}
}];

export default route;