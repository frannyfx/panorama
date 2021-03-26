/**
 * @file Repository cache module which handles disk operations.
 * @author Francesco Compagnoni
 */

// Imports
import { promises as fs } from "fs";
import path from "path";

// Logger
import createLogger from "../../utils/logger";
const logger = createLogger("cache");

// Config
import { loadConfig } from "../../Config";
const config = loadConfig();

// Modules
import { humanTimeIntervalToMillis } from "../../utils";
import getRoot from "../../utils/root";
import manifest from "./manifest";

// Constants
const cacheDir = path.join(getRoot(), config.analysis.cache.dir);

// Variables
var purgeTimeout : NodeJS.Timeout | null = null;

// Interfaces
export interface CacheRepository {
	id: number,
	name: string,
	path: string,
	updatedAt: Date,
	lastAnalysedAt: Date,
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
		
	// Connect the manifest.
	await manifest.start();

	// Run purge.
	await performPurge();
	logger.success("Cache initialised.");
}

/**
 * Stop cache module.
 */
export async function stop() {
	// Prevent the purge timeout from running.
	if (purgeTimeout) clearTimeout(purgeTimeout);

	// Disconnect the manifest.
	await manifest.stop();
	logger.info("Stopped cache.");
}

/**
 * Purge old repositories that were last analysed beyond the threshold.
 */
async function performPurge() {
	// Get manifest connection.
	let connection = await manifest.getConnection();

	// If retrieving connection failed, schedule a purge and hopefully by then the cache manifest will be valid.
	if (!connection) return schedulePurge();

	// Convert config file human period to milliseconds.
	// If this fails, do not schedule a new purge since the config will be invalid until restart.
	const purgeThreshold = humanTimeIntervalToMillis(config.analysis.cache.purgeThreshold);
	if (purgeThreshold == -1) return;

	try {
		// Select all cache jobs that have not been analysed in longer than the purge threshold.
		let cacheRepositories : CacheRepository[] = await connection("Repository").select("id")
			.where("lastAnalysedAt", "<", new Date().getTime() - purgeThreshold);

		// Log and remove the repositories.
		if (cacheRepositories.length > 0) {
			logger.info(`Purged ${cacheRepositories.length} repositories from cache.`);
			await Promise.all(cacheRepositories.map(cacheRepository => removeRepository(cacheRepository.id, false)));
		}
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
	let purgePeriod = humanTimeIntervalToMillis(config.analysis.cache.purgePeriodLength);

	// If conversion failed, do not set the loop.
	if (purgePeriod == -1) return;

	// Set the loop.
	purgeTimeout = setTimeout(() => performPurge(), purgePeriod);
}

/**
 * Retrieve a repository from the manifest.
 * @param id The ID of the repository to fetch.
 * @returns The cached repository or null.
 */
export async function getRepository(id: number) : Promise<CacheRepository | null> {
	// Get the manifest connection.
	let connection = await manifest.getConnection();
	if (!connection) return null;
	
	// Lookup item.
	let result = await connection("Repository").select("*").where({ id });
	if (result.length == 0) return null;
	return result[0];
}

/**
 * Insert a repository into the cache manifest.
 * @param repository The repository to insert.
 * @returns Whether the query executed successfully.
 */
export async function insertRepository(repository: CacheRepository) : Promise<boolean> {
	// Get the manifest connection.
	let connection = await manifest.getConnection();
	if (!connection) return false;

	// Insert item.
	try {
		await connection("Repository").insert(repository);
		logger.success(`Inserted repository ${repository.name} into the cache.`);
		return true;
	} catch (e) {
		logger.warn(`Failed to insert repository into the cache. ${e}`);
		return false;
	}
}

/**
 * Update a repository's information in the manifest.
 * @param repository The repository to update.
 * @returns Whether the query executed successfully.
 */
export async function updateRepository(repository: CacheRepository) : Promise<boolean> {
	// Get the manifest connection.
	let connection = await manifest.getConnection();
	if (!connection) return false;

	try {
		await connection("Repository").update({
			name: repository.name,
			path: repository.path,
			updatedAt: repository.updatedAt,
			lastAnalysedAt: repository.lastAnalysedAt,
			size: repository.size
		}).where({id: repository.id});
		logger.success(`Updated repository ${repository.id} in cache.`);
		return true;
	} catch (e) {
		logger.warn(`Failed to update repository ${repository.id} in cache. ${e}`);
		return false;
	}
}

/**
 * Delete a repository from the manifest.
 * @param id The ID of the repository to delete.
 * @param log Whether to log the deletion (prevents log spam during large cache purges).
 * @returns Whether the query executed successfully.
 */
export async function removeRepository(id: number, log: boolean = true) : Promise<boolean> {
	// Get the manifest connection.
	let connection = await manifest.getConnection();
	if (!connection) return false;

	try {
		// Get the repository information and if it is not present in the cache, there's no need to remove.
		let repository = await getRepository(id);
		if (!repository) return true;

		// Delete the repository in the manifest.
		await connection("Repository").where({ id }).del();

		// Delete the repository data from filesystem.
		await fs.rmdir(repository.path, { recursive: true });

		// Delete parent directory too if it is empty.
		let parentPath = path.join(repository.path, "..");
		let parentFiles = await fs.readdir(parentPath);
		if (parentFiles.length == 0) await fs.rmdir(parentPath);

		// Log if enabled.
		log && logger.info(`Removed repository ${ id } from the cache.`);
		return true;
	} catch (e) {
		return false;
	}
}

/**
 * Return the cache directory.
 */
export function getCacheDir() {
	return cacheDir;
}

export default {
	start, stop, getRepository
};