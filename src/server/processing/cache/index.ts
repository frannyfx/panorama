/**
 * @file Repository cache module which handles disk operations.
 * @author Francesco Compagnoni
 */

// Imports
import { promises as fs } from "fs";
import path from "path";

// Config
import loadConfig, { Config } from "../../Config";
const config : Config = loadConfig();

// Modules
const logger = require("../../utils/logger")("cache");
import getRoot from "../../utils/root";
import manifest from "./manifest";

// Constants
const cacheDir = path.join(getRoot(), config.processing.cache.dir);

// Interfaces
export interface CacheRepository {
	id: number,
	name: string,
	path: string,
	updated_at: string,
	size: number
};


/**
 * Start cache module.
 */
export async function start() {
	// Create cache directory if it does not exist.
	try {
		await fs.readdir(cacheDir);
	} catch {
		logger.info("Cache directory does not exist.");
	}

	// Do not catch error. If this operation fails, Panorama needs to exit.
	await fs.mkdir(cacheDir, { recursive: true });
		
	// Start manifest.
	await manifest.start();
	logger.success("Cache initialised successfully.");
}

/**
 * Stop cache module.
 */
export async function stop() {
	await manifest.stop();
	logger.info("Stopped cache.");
}

export async function getRepository(id: number) : Promise<CacheRepository | null> {
	// Get the manifest connection.
	let connection = await manifest.getConnection();
	if (!connection) return null;
	
	// Lookup item.
	let result = await connection("Repository").select("*").where({ id });
	if (result.length == 0) return null;
	return result[0];
}

export default {
	start, stop, getRepository
};