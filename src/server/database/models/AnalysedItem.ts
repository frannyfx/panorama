/**
 * @file Database operations for the AnalysisItem model as well as all its children.
 */

// Imports
import { getConnection } from "../";
import { ContributorMap } from "../../analysis/blame";
import { AnalysedItem } from "../../analysis/Item";
import { DatabaseAnalysis } from "./Analysis";

// Interfaces
/**
 * The interface matching the AnalysedItem table in the database.
 */
export interface DatabaseAnalysedItem {
	analysisId: number,
	path: string,
	isFile: boolean,
	numLines: number,
	type?: number
};

/**
 * The interface matching the AnalysedItemAggregateStats table in the database.
 */
export interface DatabaseAnalysedItemAggregateStats {
	analysisId: number,
	path: string,
	token: number,
	numLines: number,
	percentage: number
};

/**
 * The interface matching the AnalysedItemChunk table in the database.
 */
export interface DatabaseAnalysedItemChunk {
	analysisId: number,
	path: string,
	start: number,
	end: number,
	contributorId: number
};

/**
 * The interface matching the AnalysedItemChunkToken table in the database.
 */
export interface DatabaseAnalysedItemChunkToken {
	analysisId: number,
	path: string,
	start: number,
	tokenType: number,
	numLines: number
};

/**
 * The interface matching the AnalysedItemContributorAggregateStats table in the database.
 */
export interface DatabaseAnalysedItemContributorAggregateStats {
	analysisId: number,
	path: string,
	contributorId: number,
	tokenType: number,
	numLines: number,
	percentage: number
};

/**
 * Convert a list of AnalysedItems to their database representation.
 * @param analysis Parent analysis data.
 * @param analysedItems The analysed items from the repository to convert.
 * @returns Whether the query was successful.
 */
async function convertAndInsertAnalysedItems(analysis: DatabaseAnalysis, analysedItems: AnalysedItem[]) : Promise<boolean> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return false;

	// Get all the extensions of all the files.
	let fileExtensions = new Set(analysedItems.filter(item => item.isFile).map(item => item.path.split(".").pop() || "").filter(extension => extension != ""));

	// Lookup all these file extensions and add them to a (Extension -> TypeId) map.
	let types : {[key: string]: number} = {};
	(await connection("FileTypeExtension").whereIn("extension", [...fileExtensions])).map(row => {
		let extension = <string>row.extension;
		types[extension] = row.typeId;
	});

	// Convert base structure to DatabaseAnalysedItem.
	let convertedAnalysedItems : DatabaseAnalysedItem[] = analysedItems.map(item => {
		// Get the extension
		let itemExtension = item.path.split(".").pop();

		// Return the new object.
		return {
			analysisId: analysis.analysisId!,
			path: item.path,
			isFile: item.isFile,
			numLines: item.numLines,
			type: item.isFile && itemExtension && types[itemExtension] ? types[itemExtension] : undefined 
		};
	});

	// Insert the analysis items.
	await connection("AnalysedItem").insert(convertedAnalysedItems);
	return true;
}

/**
 * Convert a list of AggregateStats to their database representation.
 * @param analysis Parent analysis data.
 * @param analysedItems The analysed items from the repository to convert.
 * @returns Whether the query was successful.
 */
async function convertAndInsertAggregateStats(analysis: DatabaseAnalysis, analysedItems: AnalysedItem[]) : Promise<boolean> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return false;

	// Create a list to hold the aggregate stats.
	let convertedAggregateStats : DatabaseAnalysedItemAggregateStats[] = [];
	analysedItems.map(item => {
		Object.keys(item.aggregateLineStats).map(token => {
			// Convert the token to get around TypeScript quirks (TODO)
			let convertedToken = parseInt(token);

			// Push item.
			convertedAggregateStats.push({
				analysisId: analysis.analysisId!,
				path: item.path,
				token: parseInt(token),
				numLines: item.aggregateLineStats[convertedToken].numLines,
				percentage: item.aggregateLineStats[convertedToken].percentage
			});
		});
	});

	// Insert the converted aggregate stats.
	await connection("AnalysedItemAggregateStats").insert(convertedAggregateStats);
	return true;
}

/**
 * Convert the chunks from a list of AnalysedItems into their database representation.
 * @param analysis Parent analysis data.
 * @param analysedItems The analysed items from the repository to convert.
 * @param contributorMap Maps commit emails to contributors.
 * @returns Whether the query was successful.
 */
async function convertAndInsertAnalysedItemChunks(analysis: DatabaseAnalysis, analysedItems: AnalysedItem[], contributorMap: ContributorMap) : Promise<boolean> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return false;

	// Create a list to hold the chunks.
	let convertedChunks : DatabaseAnalysedItemChunk[] = [];
	let convertedChunksTokens : DatabaseAnalysedItemChunkToken[] = [];

	// Filter in only the files since folders do not have chunks.
	analysedItems.filter(item => item.isFile).map(item => {
		for (let chunk of item.analysis || []) {
			// Push the chunk.
			convertedChunks.push({
				analysisId: analysis.analysisId!,
				path: item.path,
				start: chunk.start,
				end: chunk.end,
				contributorId: contributorMap[chunk.contributorId].id
			});

			// Push the tokens inside the chunk.
			Object.keys(chunk.lineStats).map(tokenType => {
				// Convert string token to number token.
				let token = parseInt(tokenType);
				
				// Don't insert the token if there are no lines related to it.
				if (chunk.lineStats[token] == 0) return;

				// Push the token information.
				convertedChunksTokens.push({
					analysisId: analysis.analysisId!,
					path: item.path,
					start: chunk.start,
					tokenType: token,
					numLines: chunk.lineStats[token]
				});
			});
		}
	});

	// Insert the converted chunks and chunk tokens.
	await connection("AnalysedItemChunk").insert(convertedChunks);
	await connection("AnalysedItemChunkToken").insert(convertedChunksTokens);
	return true;
}

/**
 * 
 * @param analysis Parent analysis data.
 * @param analysedItems The analysed items from the repository to convert.
 * @param contributorMap Maps commit emails to contributors.
 * @returns Whether the query was successful.
 */
async function convertAndInsertAnalysedItemContributorAggregateStats(analysis: DatabaseAnalysis, analysedItems: AnalysedItem[], contributorMap: ContributorMap) : Promise<boolean> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return false;

	// Create a list to hold the aggregate stats.
	let contributorAggregateStats : DatabaseAnalysedItemContributorAggregateStats[] = [];

	// Loop through the items.
	analysedItems.map(item => {
		Object.keys(item.contributors).map(contributorId => {
			// TODO: Handle anonymous contributors.
			if (!contributorMap[contributorId].id) return;

			// Get the aggregate stats for the contributor.
			Object.keys(item.contributors[contributorId].aggregateLineStats).map(tokenType => {
				// Convert string token to number token.
				let token = parseInt(tokenType);

				// Push token information.
				contributorAggregateStats.push({
					analysisId: analysis.analysisId!,
					path: item.path,
					contributorId: contributorMap[contributorId].id,
					tokenType: token,
					numLines: item.contributors[contributorId].aggregateLineStats[token].numLines,
					percentage: item.contributors[contributorId].aggregateLineStats[token].percentage,
				});
			});
		});
	});

	// Insert the aggregate stats.
	await connection("AnalysedItemContributorAggregateStats").insert(contributorAggregateStats);
	return true;
}

/**
 * Convert a list of AnalysedItems to a broken down relational representation.
 * @param analysis Parent analysis data.
 * @param analysedItems The analysed items from the repository to convert.
 * @param contributorMap Maps commit emails to contributors.
 * @returns Whether the query was successful.
 */
async function convertAndInsert(analysis: DatabaseAnalysis, analysedItems: AnalysedItem[], contributorMap: ContributorMap) : Promise<boolean> {
	// Convert base AnalysedItem data.
	await convertAndInsertAnalysedItems(analysis, analysedItems);
	
	// Convert AnalysedItem aggregate stats.
	await convertAndInsertAggregateStats(analysis, analysedItems);

	// Convert AnalysedItemChunk and AnalysedItemChunkToken data.
	await convertAndInsertAnalysedItemChunks(analysis, analysedItems, contributorMap);

	// Convert contributors stats data.
	await convertAndInsertAnalysedItemContributorAggregateStats(analysis, analysedItems, contributorMap);
	return true;
}

/**
 * Get the list of analysed items in a folder.
 * @param analysisId The analysis to get the analysed files from.
 * @param path The path to search for files.
 * @returns The list of analysed child items and sub-directories of the path.
 */
async function getItemsInFolder(analysisId: number, path: string) : Promise<any[]> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return [];

	// Prevent an empty path.
	if (path.length == 0) path = "/";

	// Remove trailing slash at the beginning of the path.
	if (path[0] == "/") path = path.substr(1);
	
	// Ensure trailing slash at the end of path as it prevents non-folders from being specified.
	if (path.length >= 1 && path[path.length - 1] != "/") path += "/";

	// Get one layer deep files and folders.
	let results = await connection("AnalysedItem").where({analysisId}).andWhere("path", "like", `${path}%`).andWhereNot("path", "like", `${path}%/%`).select("path");

	// TODO: Return results.
	return results.map(row => row.path).filter(path => path != "");
}

export default {
	convertAndInsert,
	getItemsInFolder
};