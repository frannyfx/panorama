/**
 * @file Repository caching module.
 * @author Francesco Compagnoni
 */

// Imports
import { promises as fs } from "fs";
import path from "path";
import knex from "knex";

// Config
import loadConfig, { Config } from "../../Config";
const config : Config = loadConfig();

// Modules
const logger = require("../../utils/logger")("cache");
import getRoot from "../../utils/root";

// Interfaces
interface CacheStatus {
	manifest: boolean,
	path: boolean
}

// Constants
const cacheDir = path.join(getRoot(), config.processing.cache.dir);
const manifestFilename = path.join(cacheDir, config.processing.cache.manifestFilename);

// Variables
var manifestConnection : knex | null = null;

export async function getManifestConnection() : Promise<knex | null> {
	if (manifestConnection) return manifestConnection;
	try {
		// Create connection.
		manifestConnection = knex({
			client: "sqlite3",
			connection: {
				filename: manifestFilename
			}
		});

		// Test the connection.
		await manifestConnection.raw("SELECT 1");
		logger.success("Opened cache manifest successfully.");
		return manifestConnection;
	} catch (e) {
		return null;
	}
}

export async function resetManifestConnection() {
	// Don't destroy the connection if it already does not exist.
	if (!manifestConnection) return;

	// Destroy the connection.
	try {
		await manifestConnection.destroy();
		logger.warn("Closed cache manifest.");
	} catch (e) {
		// Fail gracefully.
		logger.error("Unable to close cache manifest.");
	}
	
	// Set the manifest connection to null to be able to create a new one.
	manifestConnection = null;
}

/**
 * 
 */
export async function verifyCacheIntegrity() : Promise<CacheStatus> {
	// Attempt to read path.
	try {
		await fs.readdir(cacheDir);
	} catch (e) {
		return {
			manifest: false,
			path: false
		};
	}

	// Check manifest.
	// ...
	return {
		manifest: true,
		path: true
	};
}

/**
 * 
 */
export async function purgeCache() {
	try {
		await fs.unlink(cacheDir);
	} catch (e) {
		console.log(e);
	}
}

/**
 * 
 */
export async function initialiseCache() {
	// Create cache directory.
	await fs.mkdir(cacheDir, { recursive: true });
	
	// Create manifest.
	let connection = await getManifestConnection();
	if (!connection) throw new Error("Unable to create cache manifest.");
}

/**
 * 
 */
export async function start() {
	// Check cache integrity.
	let cacheStatus = await verifyCacheIntegrity();
	if (!cacheStatus.manifest || !cacheStatus.path) {
		logger.warn("Cache integrity verification failed. Purging and rebuilding cache.");

		// Rebuild cache.
		await purgeCache();
		await initialiseCache();
	}

	logger.info("Reading cache...");
}

export default {
	start
};