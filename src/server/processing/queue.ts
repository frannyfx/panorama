/**
 * @file Central queue handler.
 * @author Francesco Compagnoni
 */

// Imports
import Queue from "bee-queue";
import redis, { RedisClient } from "redis";

// Modules
const logger = require("../utils/logger")("queue");

// Config
import loadConfig, { Config } from "../Config";
const config : Config = loadConfig();

// Interfaces
export interface RepoJob {
	repoId: number
}

export interface RepoJobResult {
	result: number
}

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

	// Log status.
	logger.success("Queue initialised successfully.");
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