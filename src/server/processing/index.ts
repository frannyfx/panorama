/**
 * @file Repository processing system.
 * @author Francesco Compagnoni
 */

// Imports
import BeeQueue from "bee-queue";

// Modules
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
	console.log(`Processing job ${job.data.repoId}.`);
	done(null, {
		result: 12345
	});
}

export function stop() {
	queue.stop();
}

export default {
	start, stop
};