/**
 * @file Operations for the FileType and FileTypeExtension database models.
 * @author Francesco Compagnoni
 */

// Imports
import { getConnection } from "../";

// Models
import { ExtensionMap } from "../../../shared/models/FileType";

/**
 * Get an object mapping extensions to file types.
 * @param extensions The extensions to map file types to.
 * @returns The extension map.
 */
async function lookupExtensions(extensions: string[]) : Promise<ExtensionMap> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return {};

	// Join extensions.
	let matchingExtensions = await connection.select("*").from("FileTypeExtension").whereIn("extension", extensions).join("FileType", {"FileType.typeId": "FileTypeExtension.typeId"});

	// Map extension to FileType.
	let extensionMap : ExtensionMap = {};
	matchingExtensions.map(extension => {
		extensionMap[extension.extension] = {
			typeId: extension.typeId,
			name: extension.name,
			icon: extension.icon
		};
	});

	return extensionMap;
}

export default {
	lookupExtensions
};