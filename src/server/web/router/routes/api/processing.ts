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

let route : Array<Route> = [{
	method: Method.POST,
	url: "/api/repo",
	handler: async (request: Request, response: any) => {
		// Add repo to queue to be processed.
		let job = await queue.getRepoQueue()?.createJob({
			repoId: 123
		}).save();

		// Add job event handlers
		// ...
		
		// Generate ticket to listen to job events.
		// sign(job.id | user.auth)

		// Send OK with ticket.
		send(response, Codes.OK);
	}
}, {
	method: Method.GET,
	url: "/api/test",
	auth: true,
	handler: async (request: Request, response: any) => {
		send(response, Codes.OK);
	}
}];

export default route;