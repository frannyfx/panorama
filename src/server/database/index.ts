/**
 * @file Database module.
 * @author Francesco Compagnoni
 */

// Imports
import knex from "knex";

// Logger
import createLogger from "../utils/logger";
const logger = createLogger("db");

// Config
import { loadConfig } from "../Config";
const config = loadConfig();

// Modules
import { humanTimeIntervalToMillis } from "../utils";
import { DatabaseAnalysisStatus } from "./models/Analysis";

// Variables
var databaseConnection : knex | null = null;
var purgeTimeout : NodeJS.Timeout | null = null;

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
			connection: config.database.connection,
			useNullAsDefault: true
		});

		// Test the connection.
		await databaseConnection.raw("SELECT 1");
		logger.success("Opened database connection.");
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

	// Run purge.
	await performPurge();
}

/**
 * Stop the database module.
 */
export async function stop() {
	// Prevent the purge timeout from running.
	if (purgeTimeout) clearTimeout(purgeTimeout);

	// Disconnect.
	await resetConnection();
}

/**
 * Purge data from the database that is beyond its purge threhsold.
 */
async function performPurge() {
	// Get database connection.
	let connection = await getConnection();

	// If retrieving connection failed, schedule a purge and hopefully by then the database connection will be valid.
	if (!connection) return schedulePurge();

	// Get thresholds & convert them.
	const analysisThreshold = humanTimeIntervalToMillis(config.database.purge.analysisThreshold);
	const analysisGlitchThreshold = humanTimeIntervalToMillis(config.database.purge.analysisGlitchThreshold);
	const repositoryThreshold = humanTimeIntervalToMillis(config.database.purge.repositoryThreshold);
	const userThreshold = humanTimeIntervalToMillis(config.database.purge.userThreshold);

	// If threshold conversions fail, do not schedule a new purge since the config will be invalid until restart.
	if (analysisThreshold == -1 || repositoryThreshold == -1 || userThreshold == -1) return;

	try {
		// - Analysis.
		let analysisDeletionCount = await connection("Analysis")
			.where("completedAt", "<", new Date(new Date().getTime() - analysisThreshold))
			.del();

		let analysisGlitchDeletionCount = await connection("Analysis")
			.whereNotIn("status", [DatabaseAnalysisStatus.COMPLETED, DatabaseAnalysisStatus.FAILED])
			.andWhere("queuedAt", "<", new Date(new Date().getTime() - analysisGlitchThreshold))
			.del();

		// - Repository.
		// -- Get repositories first (need to delete one-by-one to prevent references from stopping).
		let repositoriesToDelete = await connection("Repository")
			.where("lastAnalysed", "<", new Date(new Date().getTime() - repositoryThreshold));

		// -- Delete the repositories.
		var repositoryDeletionCount = 0;
		for (var repository of repositoriesToDelete) {
			try {
				await connection("Repository").where({ "repositoryId": repository.repositoryId }).del();
				repositoryDeletionCount++;
			} catch {}
		}

		// - User.
		// -- Get users first (need to delete one-by-one to prevent references from stopping).
		let usersToDelete = await connection("User")
			.where("lastUpdated", "<", new Date(new Date().getTime() - userThreshold))
			.andWhereNot({ "userId": -1 });

		// -- Delete the users.
		var userDeletionCount = 0;
		for (var user of usersToDelete) {
			try {
				await connection("User").where({ "userId": user.userId }).del();
				userDeletionCount++;
			} catch {}
		}

		// If anything was evicted, log the results.
		if (analysisDeletionCount + analysisGlitchDeletionCount + repositoryDeletionCount + userDeletionCount > 0)
			logger.info(`Purged ${analysisDeletionCount + analysisGlitchDeletionCount} analyses, ${repositoryDeletionCount}/${repositoriesToDelete.length} repositories and ${userDeletionCount}/${usersToDelete.length} users.`);
	} catch (e) {
		logger.warn(`Error during purge. ${e}`);
	}

	// Schedule a purge.
	schedulePurge();
}

/**
 * Schedule a cache purge job.
 */
function schedulePurge() {
	// Convert config file human period to milliseconds.
	let purgePeriod = humanTimeIntervalToMillis(config.database.purge.periodLength);

	// If conversion failed, do not set the loop.
	if (purgePeriod == -1) return;

	// Set the loop.
	purgeTimeout = setTimeout(() => performPurge(), purgePeriod);
}

export default {
	start, stop, getConnection
};