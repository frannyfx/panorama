/**
 * @file Database module.
 * @author Francesco Compagnoni
 */

// Imports
import knex from "knex";

// Config
import loadConfig, { Config } from "../Config";
const config : Config = loadConfig();

// Modules
const logger = require("../utils/logger")("db");

// Variables
var databaseConnection : knex | null = null;

// - Connection & lifecycle management.

/**
 * Return the existing database connection or create a new one and test it works correctly.
 * @return The database connection or null if there is an error.
 */
export async function getConnection() : Promise<knex | null> {
	if (databaseConnection) return databaseConnection;
	try {
		// Create connection.
		databaseConnection = knex({
			client: "mysql",
			connection: config.database,
			pool: {
				min: 1
			},
			useNullAsDefault: true
		});

		// Test the connection.
		await databaseConnection.raw("SELECT 1");
		logger.success("Opened database connection successfully.");
		return databaseConnection;
	} catch (e) {
		return null;
	}
}

/**
 * Destroy the connection to the manifest.
 */
async function resetConnection() {
	// Don't destroy the connection if it already does not exist.
	if (!databaseConnection) return;

	// Destroy the connection.
	try {
		await databaseConnection.destroy();
		logger.info("Closed database connection.");
	} catch (e) {
		// Fail gracefully.
		logger.error("Unable to close database connection.");
	}
	
	// Set the database connection to null to be able to create a new one.
	databaseConnection = null;
}


/**
 * Start the database module.
 */
export async function start() {
	// Connect to manifest.
	let connection = await getConnection();
	if (!connection) throw new Error("Failed to connect to the database.");
}

/**
 * Stop the database module.
 */
export async function stop() {
	await resetConnection();
}

export default {
	start, stop, getConnection
};