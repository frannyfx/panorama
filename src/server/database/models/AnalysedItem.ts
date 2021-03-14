/**
 * @file Database operations for the AnalysisItem model as well as all its children.
 */

// Imports
import { getConnection } from "../";
import { ContributorMap } from "../../analysis/blame";
import { AdvancedLineStats, AnalysedItem, ContributorStats, ContributorStatsMap } from "../../analysis/Item";
import { processFilePath } from "../../utils";
import { DatabaseAnalysis } from "./Analysis";

// Models
import FileType from "./FileType";

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
 * The interface matching the AnalysedItemContributor table in the database.
 */
export interface DatabaseAnalysedItemContributor {
	analysisId: number,
	path: string,
	contributorId: number,
	numLines: number,
	percentage: number
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
 * The interface matching the ANalysedItemAggregateFileType table in the database.
 */
export interface DatabaseAnalysedItemAggregateFileType {
	analysisId: number,
	path: string,
	fileType: number,
	numLines: number,
	percentage: number
};

/**
 * Convert a list of AnalysedItems to their database representation and insert them.
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

	// Lookup all file extensions.
	let types = await FileType.lookupExtensions([...fileExtensions]);

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
			type: item.isFile && itemExtension && types[itemExtension] ? types[itemExtension].typeId : undefined 
		};
	});

	// Insert the analysis items.
	await connection("AnalysedItem").insert(convertedAnalysedItems);
	return true;
}

/**
 * Convert a list of AggregateStats to their database representation and insert them.
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
 * Convert the chunks from a list of AnalysedItems into their database representation and insert them.
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
 * Convert the contributor map in the analysed items to its database representation and insert the results.
 * @param analysis Parent analysis data.
 * @param analysedItems The analysed items from the repository to convert.
 * @param contributorMap Maps commit emails to contributors.
 * @returns Whether the query was successful.
 */
async function convertAndInsertAnalysedItemContributors(analysis: DatabaseAnalysis, analysedItems: AnalysedItem[], contributorMap: ContributorMap) : Promise<boolean> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return false;

	// Create lists to hold the contributors and the aggregate stats.
	let contributors : DatabaseAnalysedItemContributor[] = [];
	let contributorAggregateStats : DatabaseAnalysedItemContributorAggregateStats[] = [];

	// Loop through the items.
	analysedItems.map(item => {
		Object.keys(item.contributors).map(contributorId => {
			// TODO: Handle anonymous contributors.
			if (!contributorMap[contributorId].id) return;

			// Add the contributor for the item.
			contributors.push({
				analysisId: analysis.analysisId!,
				path: item.path,
				contributorId: contributorMap[contributorId].id,
				numLines: item.contributors[contributorId].numLines,
				percentage: item.contributors[contributorId].percentage
			});

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

	// Insert the contributors and the aggregate stats.
	await connection("AnalysedItemContributor").insert(contributors);
	await connection("AnalysedItemContributorAggregateStats").insert(contributorAggregateStats);
	return true;
}

/**
 * Convert the extension map in the analysed items to its database representation and insert the results.
 * @param analysis Parent analysis data.
 * @param analysedItems The analysed items from the repository to convert.
 * @returns Whether the query was successful.
 */
async function convertAndInsertAnalysedItemAggregateFileType(analysis: DatabaseAnalysis, analysedItems: AnalysedItem[]) : Promise<boolean> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return false;

	// Filter out items that are not directories.
	let folders = analysedItems.filter(item => !item.isFile && item.extensions);

	// Add all extensions to a set.
	let extensions = new Set<string>();
	folders.map(folder => {
		let folderExtensions = Object.keys(folder.extensions!);
		folderExtensions.map(extension => extensions.add(extension));
	});

	// Look-up all extensions to get the relevant file types.
	let types = await FileType.lookupExtensions([...extensions]);
	
	// Create a list to hold aggregate file types.
	let aggregateFileTypes : DatabaseAnalysedItemAggregateFileType[] = [];

	// Loop through the folders and create the file type rows.
	folders.map(folder => {
		for (let extension of Object.keys(folder.extensions!)) {
			aggregateFileTypes.push({
				analysisId: analysis.analysisId!,
				path: folder.path,
				fileType: types[extension].typeId,
				numLines: folder.extensions![extension].numLines,
				percentage: folder.extensions![extension].percentage
			});
		}
	});

	// Insert the aggregate file types.
	await connection("AnalysedItemAggregateFileType").insert(aggregateFileTypes);
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
	// TODO: Check result of each / use transaction.
	// Convert base AnalysedItem data.
	await convertAndInsertAnalysedItems(analysis, analysedItems);
	
	// Convert AnalysedItem aggregate stats.
	await convertAndInsertAggregateStats(analysis, analysedItems);

	// Convert AnalysedItemChunk and AnalysedItemChunkToken data.
	await convertAndInsertAnalysedItemChunks(analysis, analysedItems, contributorMap);

	// Convert contributors data.
	await convertAndInsertAnalysedItemContributors(analysis, analysedItems, contributorMap);

	// Convert extension data.
	await convertAndInsertAnalysedItemAggregateFileType(analysis, analysedItems);
	
	return true;
}

/**
 * Get the list of analysed path names in a folder.
 * @param analysisId The analysis to get the analysed files from.
 * @param path The path to search for files.
 * @returns The list of analysed child items and sub-directories of the path.
 */
async function getPathsInFolder(analysisId: number, path: string) : Promise<string[]> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return [];

	// Process path.
	path = processFilePath(path);

	// Get one layer deep files and folders.
	let results = await connection("AnalysedItem").where({analysisId}).andWhere("path", "like", `${path}%`).andWhereNot("path", "like", `${path}%/%`).select("path");

	// TODO: Return results.
	return results.map(row => row.path).filter(path => path != "");
}

/**
 * Get the list of analysed items in a folder.
 * @param analysisId The analysis to get the analysed files from.
 * @param path The path to search for files.
 * @returns The list of analysed child items and sub-directories of the path.
 */
async function getItemsInFolder(analysisId: number, path: string) : Promise<AnalysedItem[]> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return [];

	// Process path.
	path = processFilePath(path);

	// Get items in the folder.
	let itemsInFolder : DatabaseAnalysedItem[] = await connection("AnalysedItem").where({analysisId}).andWhere("path", "like", `${path}%`).andWhereNot("path", "like", `${path}%/%`);
	let pathsInFolder : string[] = itemsInFolder.map(row => row.path);

	// Get AnalysedItemContributors for the files in the folder.
	let contributors : any[] = await connection("AnalysedItemContributor").where({analysisId}).whereIn("path", pathsInFolder).join("User", { "AnalysedItemContributor.contributorId": "User.userId"});

	// Get ContributorAggregateStats for the files in the folder.
	let contributorAggregateStats : DatabaseAnalysedItemContributorAggregateStats[] = await connection("AnalysedItemContributorAggregateStats").where({analysisId}).whereIn("path", pathsInFolder);
	
	// Get AggregateStats for the files in the folder.
	let aggregateStats : DatabaseAnalysedItemAggregateStats[] = await connection("AnalysedItemAggregateStats").where({analysisId}).whereIn("path", pathsInFolder);

	// Loop through the items in the folder and aggregate each with the relevant data.
	let results : AnalysedItem[] = itemsInFolder.map(item => {
		// Create all the sub-items for the current item.
		let itemContributorStats : ContributorStatsMap = {};
		let itemAggregateStats : AdvancedLineStats = {};
		
		// Get contributor data for the current item.
		let itemContributorData = contributors.filter(contributor => contributor.path == item.path);
		let itemAggregateStatsData = aggregateStats.filter(aggregate => aggregate.path == item.path);

		// Loop through the contributors for this item.
		itemContributorData.map(contributor => {
			// Get aggregate stats for current path and current contributor.
			let itemContributorAggregateStatsData = contributorAggregateStats.filter(aggregateStats => aggregateStats.path == item.path && aggregateStats.contributorId == contributor.contributorId);
			
			// Create advanced line stats for the current path and current contributor.
			let aggregateStats : AdvancedLineStats = {};
			itemContributorAggregateStatsData.map(aggregate => {
				aggregateStats[aggregate.tokenType] = {
					numLines: aggregate.numLines,
					percentage: aggregate.percentage
				};
			});

			// Get existing contributor stats or create new.
			itemContributorStats[contributor.login] = {
				contributorId: contributor.login,
				numLines: contributor.numLines,
				percentage: contributor.percentage,
				aggregateLineStats: aggregateStats
			};
		});

		// Loop through the aggregate stats for this item.
		itemAggregateStatsData.map(aggregate => {
			itemAggregateStats[aggregate.token] = {
				numLines: aggregate.numLines,
				percentage: aggregate.percentage
			};
		});

		return {
			path: item.path,
			contributors: itemContributorStats,
			aggregateLineStats: itemAggregateStats,
			numLines: item.numLines,
			isFile: item.isFile == true
		};
	});

	return results;
}

export default {
	convertAndInsert,
	getPathsInFolder,
	getItemsInFolder
};