/**
 * @file Routes handling requests to process repositories.
 * @author Francesco Compagnoni
 */

// Imports
import Joi from "joi";
import fs from "fs";
import path from "path";

// Config
import loadConfig, { Config } from "../../../../Config";
const config : Config = loadConfig();

// Modules
import { Method } from "../../../../../shared/Method";
import { Request, Route } from "../../Route";
import { Codes, send } from "../../API";
import queue from "../../../../processing/queue";
import cache from "../../../../processing/cache";
import { getRepository, Repository } from "../../../../github";

let route : Array<Route> = [{
	method: Method.PUT,
	url: "/api/queue/repo", // TODO: Make RESTified.
	auth: true,
	schemas: {
		body: Joi.object({
			name: Joi.string()
		})
	},
	handler: async (request: Request, response: any) => {
		/*
		// Add repo to queue to be processed.
		let job = await queue.getRepoQueue()?.createJob({
			repoId: 123
		}).save();

		// Add job event handlers
		// ...
		
		// Generate ticket to listen to job events.
		// sign(job.id | user.auth)

		// Send OK with ticket.
		send(response, Codes.OK);*/

		// TODO: Implement rate limiting.
		// Get repository data with GitHub.
		let repositoryResult = await getRepository(request.body!.name, request.auth!.token!);
		if (!repositoryResult.status.ok) return send(response, Codes.BadRequest);

		// Create job.
		try {
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
				access_token: request.auth!.token!
			}).save();

			// Send ID.
			send(response, Codes.OK, {
				id: job.id
			});
		} catch {
			// If anything goes wrong in the process, return internal server error.
			return send(response, Codes.ServerError);
		}
	}
}];

export default route;