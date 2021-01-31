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
import { sleep } from "../../shared/utils";

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

/**
 * Handler for processing a queued repository.
 * @param job The job queued and the repository's data.
 * @param done Callback for when the job is complete.
 */
export async function handleRepoJob(job : BeeQueue.Job<RepoJob>, done : BeeQueue.DoneCallback<RepoJobResult>) {
	// Test progress reporting (TODO)
	logger.info(`Processing repository '${job.data.repository.name}' with access token '${job.data.access_token.substr(0, 10)}...'.`);
	await sleep(10000);
	job.reportProgress(0.25);
	await sleep(1000);
	job.reportProgress(0.5);
	await sleep(1000);
	job.reportProgress(0.75);
	await sleep(1000);
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