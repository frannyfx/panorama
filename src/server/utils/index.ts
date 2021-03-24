/**
 * @file Server-side utility functions.
 * @author Francesco Compagnoni
 */

// Imports
import { promises as fs } from "fs";
import path from "path";

/**
 * Get all of a folder's children.
 * @param directory The directory to find children from.
 * @param fileRegex The regex the file name has to match in order to be counted.
 * @returns A list of all the children's paths.
 */
export async function walkDir(directory: string, fileRegex: RegExp) : Promise<Array<string>> {
	// Read the directory.
	var entities;
	try {
		entities = await fs.readdir(directory, { withFileTypes: true });
	} catch (e) {
		// If we fail to read the directory, return an empty array.
		return [];
	}

	// Find the sub-directories and recursively search them.
	let recursive: Array<string> = (await Promise.all(entities.filter(entity => entity.isDirectory()).map(dir => {
		return walkDir(path.join(directory, dir.name), fileRegex);
	}))).flat();

	// Filter out files that do not match the provided RegEx.
	let files = entities.filter(entity => entity.isFile() && entity.name.match(fileRegex)).map(dir => path.join(directory, dir.name));
	return files.concat(recursive);
}

/**
 * Process a path so it can match in the database.
 * @param path The input path.
 * @returns The processed path.
 */
export function processFilePath(path: string) : string {
	// Create new path.
	let processedPath = path;

	// Prevent an empty path.
	if (path.length == 0) processedPath = "/";

	// Remove trailing slash at the beginning of the path.
	if (processedPath[0] == "/") processedPath = processedPath.substr(1);
	
	// Ensure trailing slash at the end of path as it prevents non-folders from being specified.
	if (processedPath.length >= 1 && processedPath[processedPath.length - 1] != "/") processedPath += "/";

	// Return the final processed path.
	return processedPath;
}

/**
 * Check if two sets are equal.
 * @param a The first set.
 * @param b The second set.
 * @returns Whether the sets are equal.
 */
export function areSetsEqual<T>(a: Set<T>, b: Set<T>) : boolean {
	if (a.size != b.size) return false;
	for (var i of a) if (!b.has(i)) return false;
	return true;
}

/**
 * Convert human time interval string to milliseconds.
 * @param input The time interval string.
 * @returns The equivalent time interval in milliseconds or -1 if something went wrong.
 */
export function humanTimeIntervalToMillis(input: string) : number {
	// Array of conversions from unit to milliseconds.
	const unitConversions : {[key: string]: number} = { "d": 24 * 60 * 60 * 1000, "h": 60 * 60 * 1000, "m": 60 * 1000, "s": 1000 };

	// Match a series of numbers at the start.
	let match = input.match(/^[0-9]*(\.[0-9]*)?/);
	if (!match) return -1;

	// Get the value.
	let unit = input.substr(match[0].length);
	let value = parseFloat(match[0]);
	if (!unit || isNaN(value)) return -1;

	// Return the converted value.
	return value * unitConversions[unit];
}