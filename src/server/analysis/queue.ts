/**
 * @file Central queue handler.
 * @author Francesco Compagnoni
 */

// Imports
import Queue, { Job } from "bee-queue";
import redis, { RedisClient } from "redis";

// Logger
import createLogger from "../utils/logger";
const logger = createLogger("queue");

// Config
import { loadConfig } from "../Config";
const config = loadConfig();

// Modules
import { Data } from "../../shared/Result";

// Models
import Analysis, { DatabaseAnalysis, DatabaseAnalysisStatus } from "../database/models/Analysis";
import { Repository } from "../github";

// Interfaces
export interface RepoJob {
	repository: Repository,
	analysis: DatabaseAnalysis,
	access_token: string
};

export interface RepoJobResult {
	analysis: Data
};

// Connection and queue
var redisClient : RedisClient | null = null;
var repoQueue : Queue<RepoJob> | null = null;

/**
 * Initialise the queueing system.
 */
export function start() : Promise<void> {
	return new Promise((resolve, reject) => {
		if (redisClient && repoQueue) return resolve();

		// Connect to Redis.
		redisClient = redis.createClient(config.redis.url);

		// On Redis connected, create queue.
		redisClient.on("ready", () => {
			// Create repository queue.
			createQueue();
			resolve();
		});

		// On Redis connection error, reject.
		redisClient.on("error", (e) => {
			logger.warn(`Failed to connect to Redis server: ${e.code}.`);
			reject();
		});
	});
}

/**
 * Create the queue.
 */
function createQueue() {
	// Create queue.
	repoQueue = new Queue("REPO_QUEUE", {
		redis: redisClient!
	});

	// Handle job failure by writing the new status of the job to the database.
	repoQueue.on("job failed", async (jobId, err) => {
		// Log error.
		logger.error(`Job ${jobId} failed. ${err}`);

		// Get the analysis with the specified job ID.
		let analysis = await Analysis.getRawWithJobId(jobId);
		if (!analysis) {
			logger.warn(`Unable to update database analysis status for job ${jobId}.`);
			return;
		}

		// Update the analysis status.
		analysis.status = DatabaseAnalysisStatus.FAILED;
		await Analysis.update(analysis);
	});

	// Log status.
	logger.success("Queue initialised.");
}

/**
 * Cleanly stop the queueing system.
 */
export async function stop() {
	if (!redisClient || !repoQueue) return;
	try {
		await repoQueue.close();
		redisClient.quit();
		repoQueue = null;
		redisClient = null;
	} catch (e) {
		logger.error("Failed to shut down queue gracefully.");
	}
}

/**
 * Get the shared repo queue instance.
 */
export function getRepoQueue() : Queue<RepoJob> | null {
	return repoQueue;
}

export default {
	start, stop, getRepoQueue
};