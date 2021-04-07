/**
 * @file Database operations for the AnalysedItem model as well as all its children.
 */

// Imports
import Knex from "knex";
import { getConnection } from "../";
import { Data } from "../../../shared/Result";
import { ContributorMap } from "../../analysis/blame";
import { AdvancedLineStats, AnalysedItem, ContributorStats, ContributorStatsMap, ExtensionMap } from "../../analysis/Item";
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
	end: number
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
 * @param transaction The transaction to use to perform the insertion.
 * @returns Whether the query was successful.
 */
async function convertAndInsertAnalysedItems(analysis: DatabaseAnalysis, analysedItems: AnalysedItem[], transaction: Knex.Transaction) : Promise<void> {
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
	await transaction("AnalysedItem").insert(convertedAnalysedItems);
}

/**
 * Convert a list of AggregateStats to their database representation and insert them.
 * @param analysis Parent analysis data.
 * @param analysedItems The analysed items from the repository to convert.
 * @param transaction The transaction to use to perform the insertion.
 * @returns Whether the query was successful.
 */
async function convertAndInsertAggregateStats(analysis: DatabaseAnalysis, analysedItems: AnalysedItem[], transaction: Knex.Transaction) : Promise<void> {
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
	await transaction("AnalysedItemAggregateStats").insert(convertedAggregateStats);
}

/**
 * Convert the chunks from a list of AnalysedItems into their database representation and insert them.
 * @param analysis Parent analysis data.
 * @param analysedItems The analysed items from the repository to convert.
 * @param contributorMap Maps commit emails to contributors.
 * @param transaction The transaction to use to perform the insertion.
 * @returns Whether the query was successful.
 */
async function convertAndInsertAnalysedItemChunks(analysis: DatabaseAnalysis, analysedItems: AnalysedItem[], contributorMap: ContributorMap, transaction: Knex.Transaction) : Promise<void> {
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
		}

		// Add raw token groups.
		for (let tokenGroup of item.tokens || []) {
			tokenGroup.lineData.forEach(tokenType => {
				convertedChunksTokens.push({
					analysisId: analysis.analysisId!,
					path: item.path,
					start: tokenGroup.start,
					tokenType,
					end: tokenGroup.end
				});
			});
		}
	});

	// Insert the converted chunks and chunk tokens.
	await transaction("AnalysedItemChunk").insert(convertedChunks);
	await transaction("AnalysedItemChunkToken").insert(convertedChunksTokens);
}

/**
 * Convert the contributor map in the analysed items to its database representation and insert the results.
 * @param analysis Parent analysis data.
 * @param analysedItems The analysed items from the repository to convert.
 * @param contributorMap Maps commit emails to contributors.
 * @param transaction The transaction to use to perform the insertion.
 * @returns Whether the query was successful.
 */
async function convertAndInsertAnalysedItemContributors(analysis: DatabaseAnalysis, analysedItems: AnalysedItem[], contributorMap: ContributorMap, transaction: Knex.Transaction) : Promise<void> {
	// Create lists to hold the contributors and the aggregate stats.
	let contributors : DatabaseAnalysedItemContributor[] = [];
	let contributorAggregateStats : DatabaseAnalysedItemContributorAggregateStats[] = [];
	let insertAnonymous = false;

	// Loop through the items.
	analysedItems.map(item => {
		Object.keys(item.contributors).map(contributorId => {
			// If we have anonymous contributions, insert anyonymous.
			if (!contributorMap[contributorId].id) insertAnonymous = true;

			// Add the contributor for the item.
			contributors.push({
				analysisId: analysis.analysisId!,
				path: item.path,
				contributorId: contributorMap[contributorId].id ? contributorMap[contributorId].id : -1,
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
					contributorId: contributorMap[contributorId].id ? contributorMap[contributorId].id : -1,
					tokenType: token,
					numLines: item.contributors[contributorId].aggregateLineStats[token].numLines,
					percentage: item.contributors[contributorId].aggregateLineStats[token].percentage,
				});
			});
		});
	});

	// Insert an anonymous analysis contributor.
	if (insertAnonymous) {
		await transaction("AnalysisContributor").insert({ analysisId: analysis.analysisId!, userId: -1 });
	}

	// Insert the contributors and the aggregate stats.
	await transaction("AnalysedItemContributor").insert(contributors);
	await transaction("AnalysedItemContributorAggregateStats").insert(contributorAggregateStats);
}

/**
 * Convert the extension map in the analysed items to its database representation and insert the results.
 * @param analysis Parent analysis data.
 * @param analysedItems The analysed items from the repository to convert.
 * @param transaction The transaction to use to perform the insertion.
 * @returns Whether the query was successful.
 */
async function convertAndInsertAnalysedItemAggregateFileType(analysis: DatabaseAnalysis, analysedItems: AnalysedItem[], transaction: Knex.Transaction) : Promise<void> {
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
			// If the extension was not found, do not add it.
			if (!types[extension]) continue;

			// Otherwise, add the item.
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
	await transaction("AnalysedItemAggregateFileType").insert(aggregateFileTypes);
}

/**
 * Convert a list of AnalysedItems to a broken down relational representation.
 * @param analysis Parent analysis data.
 * @param analysedItems The analysed items from the repository to convert.
 * @param contributorMap Maps commit emails to contributors.
 * @param transaction The transaction to use to perform the insertion.
 * @returns Whether the query was successful.
 */
async function convertAndInsert(analysis: DatabaseAnalysis, analysedItems: AnalysedItem[], contributorMap: ContributorMap, transaction: Knex.Transaction) : Promise<void> {
	// Convert base AnalysedItem data.
	await convertAndInsertAnalysedItems(analysis, analysedItems, transaction);
			
	// Convert AnalysedItem aggregate stats.
	await convertAndInsertAggregateStats(analysis, analysedItems, transaction);

	// Convert AnalysedItemChunk and AnalysedItemChunkToken data.
	await convertAndInsertAnalysedItemChunks(analysis, analysedItems, contributorMap, transaction);

	// Convert contributors data.
	await convertAndInsertAnalysedItemContributors(analysis, analysedItems, contributorMap, transaction);

	// Convert extension data.
	await convertAndInsertAnalysedItemAggregateFileType(analysis, analysedItems, transaction);
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
	let contributors : any[] = await connection("AnalysedItemContributor").where({analysisId}).whereIn("path", pathsInFolder).leftJoin("User", { "AnalysedItemContributor.contributorId": "User.userId"});

	// Get ContributorAggregateStats for the files in the folder.
	let contributorAggregateStats : DatabaseAnalysedItemContributorAggregateStats[] = await connection("AnalysedItemContributorAggregateStats").where({analysisId}).whereIn("path", pathsInFolder);
	
	// Get AggregateStats for the files in the folder.
	let aggregateStats : DatabaseAnalysedItemAggregateStats[] = await connection("AnalysedItemAggregateStats").where({analysisId}).whereIn("path", pathsInFolder);

	// Get AggregateFileTypes for the sub-folders.
	let aggregateFileTypes : DatabaseAnalysedItemAggregateFileType[] = await connection("AnalysedItemAggregateFileType").where({analysisId}).whereIn("path", pathsInFolder);

	// Loop through the items in the folder and aggregate each with the relevant data.
	let results : AnalysedItem[] = itemsInFolder.map(item => {
		// Create all the sub-items for the current item.
		let itemContributorStats : ContributorStatsMap = {};
		let itemAggregateStats : AdvancedLineStats = {};
		let itemExtensionMap : ExtensionMap = {};
		
		// Get data for the current item.
		let itemContributorData = contributors.filter(contributor => contributor.path == item.path);
		let itemAggregateStatsData = aggregateStats.filter(aggregate => aggregate.path == item.path);
		let itemAggregateFileTypeData = aggregateFileTypes.filter(type => type.path == item.path);

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

		// Loop through the file types for this item.
		if (!item.isFile) itemAggregateFileTypeData.map(type => {
			itemExtensionMap[type.fileType] = {
				numLines: type.numLines,
				percentage: type.percentage
			};
		});

		// Return complete AnalysedItem.
		return {
			path: item.path,
			contributors: itemContributorStats,
			aggregateLineStats: itemAggregateStats,
			extensions: itemExtensionMap,
			numLines: item.numLines,
			isFile: item.isFile == true
		};
	});

	return results;
}

/**
 * Get code chunks.
 * @param analysisId The ID of the analysis where to fetch the file from.
 * @param path The path of the file.
 * @returns The code chunks.
 */
async function getChunks(analysisId: number, path: string) : Promise<Data[] | null> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return null;

	// Get the item's chunks in order.
	let chunks = await connection("AnalysedItemChunk")
		.where({ analysisId, path })
		.orderBy("start", "asc")
		.leftJoin("User", { "AnalysedItemChunk.contributorId": "User.userId" })
		.select(
			"AnalysedItemChunk.start",
			"AnalysedItemChunk.end",
			"User.login"
		);

	// Return the chunks.
	return chunks;
}

/**
 * Get token groups.
 * @param analysisId The ID of the analysis where to fetch the file from.
 * @param path The path of the file.
 * @returns The token groups.
 */
async function getTokens(analysisId: number, path: string) : Promise<Data[] | null> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return null;

	// Get the item's chunks in order.
	let token : DatabaseAnalysedItemChunkToken[] = await connection("AnalysedItemChunkToken")
		.where({ analysisId, path })
		.orderBy("start", "asc")
		.select(
			"AnalysedItemChunkToken.start",
			"AnalysedItemChunkToken.end",
			"AnalysedItemChunkToken.tokenType"
		);

	// Group tokens together when they start on the same line.
	let groupedTokens : {[key: string]: Data} = {};
	token.map(token => {
		// If there's already a token that starts on that line, push the token type.
		if (groupedTokens[token.start]) groupedTokens[token.start].tokens.push(token.tokenType);
		else groupedTokens[token.start] = {
			start: token.start,
			end: token.end,
			tokens: [token.tokenType]
		};
	});

	// Return the chunks.
	return Object.keys(groupedTokens).map(start => groupedTokens[start]);
}

export default {
	convertAndInsert,
	getPathsInFolder,
	getItemsInFolder,
	getChunks,
	getTokens
};