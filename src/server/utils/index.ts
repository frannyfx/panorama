// Imports
import { promises as fs } from "fs";
import path from "path";

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