/**
 * @file Repository processing system.
 * @author Francesco Compagnoni
 */

// Imports
import BeeQueue from "bee-queue";

// Modules
const logger = require("../utils/logger")("repo_prc");
import cache from "./cache";
import queue, { RepoJob, RepoJobResult } from "./queue";

export async function start() {
	// Initialise caching system.
	await cache.start();

	// Initialise queue system.
	await queue.start();

	// Get queue.
	let repoQueue = queue.getRepoQueue();
	if (!repoQueue) throw new Error("Unable to get queue.");

	// Set queue handlers.
	repoQueue.process(handleRepoJob);
}

export async function handleRepoJob(job : BeeQueue.Job<RepoJob>, done : BeeQueue.DoneCallback<RepoJobResult>) {
	// ...
	logger.info(`Processing repository '${job.data.repository.name}' with access token '${job.data.access_token.substr(0, 10)}...'.`);
	done(null, {
		result: 12345
	});
}

export async function stop() {
	await queue.stop();
	await cache.stop();
}

export default {
	start, stop
};