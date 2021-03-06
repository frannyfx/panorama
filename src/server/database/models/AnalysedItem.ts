/**
 * @file Database operations for the AnalysisItem model as well as all its children.
 */

// Imports
import { getConnection } from "../";
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

export interface DatabaseAnalysedItemChunk {
	analysisId: number,
	path: string,
	start: number,
	end: number,
	contributorId: number
}

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
 * @returns Whether the query was successful.
 */
async function convertAndInsertAnalysedItemChunks(analysis: DatabaseAnalysis, analysedItems: AnalysedItem[]) : Promise<boolean> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return false;

	// Create a list to hold the chunks.
	let convertedChunks : DatabaseAnalysedItemChunk[] = [];
	analysedItems.filter(item => item.isFile).map(item => {
		for (let chunk in item.analysis || []) {

		}
	});
}

/**
 * Convert a list of AnalysedItems to a broken down relational representation.
 * @param analysis Parent analysis data.
 * @param analysedItems The analysed items from the repository to convert.
 * @returns Whether the query was successful.
 */
async function convertAndInsert(analysis: DatabaseAnalysis, analysedItems: AnalysedItem[]) : Promise<boolean> {
	// Convert base AnalysedItem data.
	await convertAndInsertAnalysedItems(analysis, analysedItems);
	
	// Convert AnalysedItem aggregate stats.
	await convertAndInsertAggregateStats(analysis, analysedItems);

	// Convert AnalysedItemChunk data.
	await convertAndInsertAnalysedItemChunks(analysis, analysedItems);

	return true;
}

export default {
	convertAndInsert
};