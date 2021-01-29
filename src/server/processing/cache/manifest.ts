/**
 * @file Cache manifest management module.
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
const logger = require("../../utils/logger")("cache_db");
import getRoot from "../../utils/root";

// Interfaces
export interface CacheRepository {
	id: number,
	name: string,
	path: string,
	updated_at: string,
	size: number
};

// Constants
const cacheDir = path.join(getRoot(), config.processing.cache.dir);
const manifestFilename = path.join(cacheDir, config.processing.cache.manifestFilename);

// Variables
var manifestConnection : knex | null = null;

// - Connection & lifecycle management.

/**
 * Return the existing manifest connection or create a new one and test it works correctly.
 * @return The manifest connection or null if there is an error.
 */
export async function getManifestConnection() : Promise<knex | null> {
	if (manifestConnection) return manifestConnection;
	try {
		// Create connection.
		manifestConnection = knex({
			client: "sqlite3",
			connection: {
				filename: manifestFilename
			},
			useNullAsDefault: true
		});

		// Test the connection.
		await manifestConnection.raw("SELECT 1");
		logger.success("Opened cache manifest successfully.");
		return manifestConnection;
	} catch (e) {
		return null;
	}
}

/**
 * Destroy the connection to the manifest.
 */
async function resetManifestConnection() {
	// Don't destroy the connection if it already does not exist.
	if (!manifestConnection) return;

	// Destroy the connection.
	try {
		await manifestConnection.destroy();
		logger.info("Closed cache manifest.");
	} catch (e) {
		// Fail gracefully.
		logger.error("Unable to close cache manifest.");
	}
	
	// Set the manifest connection to null to be able to create a new one.
	manifestConnection = null;
}

/**
 * Verify the manifest exists and is valid.
 * @return Whether the manifest is valid.
 */
async function verifyManifestIntegrity() : Promise<boolean> {
	// Check manifest exists.
	try {
		await fs.stat(manifestFilename);
	} catch (e) {
		return false;
	}

	// TODO: Verify validity of the manifest.
	return true;
}

/**
 * Delete all files and manifest within the cache directory.
 */
async function purgeCache() {
	try {
		// TODO: Handle permissions.
		await fs.rmdir(cacheDir, { recursive: true });
	} catch (e) {
		// ...
		console.log(e);
	}
}

/**
 * Initialise a brand new cache.
 */
async function initialiseCache() {
	// Create cache directory.
	await fs.mkdir(cacheDir, { recursive: true });
	
	// Create manifest.
	let connection = await getManifestConnection();
	if (!connection) throw new Error("Unable to create cache manifest.");

	// Create schema.
	await connection.schema.createTable("Repository", table => {
		// Add columns.
		table.integer("id");
		table.string("name");
		table.string("path");
		table.dateTime("updated_at");
		table.integer("size");

		// Add keys and indexes.
		table.primary(["id"]);
		table.index(["name"]);
	});
}

/**
 * Start the cache manifest module.
 */
export async function start() {
	// Check cache integrity.
	if (!(await verifyManifestIntegrity())) {
		logger.warn("Cache manifest is invalid.");
		logger.info("Initialising new manifest...");

		// Rebuild cache.
		await purgeCache();
		await initialiseCache();
	}

	// Connect to manifest.
	await getManifestConnection();
}

/**
 * Stop the cache manifest module.
 */
export async function stop() {
	await resetManifestConnection();
}

export default {
	start, stop, getManifestConnection
};