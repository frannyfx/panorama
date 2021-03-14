/**
 * @file Combine analysis results into a cohesive item structure that includes both lexical data
 * and blame data from the repository.
 * @author Francesco Compagnoni
 */

// Modules
import { BlameGroup } from "./blame";
import { TokenGroup } from "./lexing/Lexer";

// Interfaces
/**
 * The interface for an item in the repository that has been analysed.
 */
export interface AnalysedItem {
	path: string,
	contributors: ContributorStatsMap,
	aggregateLineStats: AdvancedLineStats,
	numLines: number,
	analysis?: AnalysisGroup[],
	extensions?: ExtensionMap,
	isFile: boolean
};

/**
 * Maps a token type to the number of lines corresponding to it.
 */
interface LineStats {
	[key: number]: number
};

/**
 * Counts lines for a specific item.
 */
 interface AdvancedLineCount {
	numLines: number,
	percentage: number
}

/**
 * Maps a token type to the number of lines and percentage corresponding to it.
 */
export interface AdvancedLineStats {
	[key: number]: AdvancedLineCount
}

/**
 * Code chunk representing blame and lexical analysis combined together.
 */
export interface AnalysisGroup {
	start: number,
	end: number,
	contributorId: string,
	lineStats: LineStats
};

/**
 * Line statistics and percentages for a specific contributor.
 */
export interface ContributorStats {
	contributorId: string,
	numLines: number,
	percentage: number,
	aggregateLineStats: AdvancedLineStats
};

/**
 * Maps contributor identifiers to the corresponding ContributorStats object.
 */
export interface ContributorStatsMap {
	[key: string]: ContributorStats
};

/**
 * Maps file extensions to aggregate line stats.
 */
export interface ExtensionMap {
	[key: string]: AdvancedLineCount
};

/**
 * Maps a folder to an array of its analysed children.
 */
interface FolderFileMap {
	[key: string]: AnalysedItem[]
}

/**
 * Calculate how many lines of the child token groups overlap with a blame group and group the statistics
 * by token type.
 * @param start The start line of the blame group.
 * @param end The end line of the blame group.
 * @param tokenGroups The child groups that overlap with it.
 */
export function countLines(start: number, end: number, tokenGroups: TokenGroup[]) : LineStats {
	// Create line stats.
	let lineStats : LineStats = {};

	// Loop through the child token groups.
	for (var i = 0; i < tokenGroups.length; i++) {
		// Get group.
		let currentGroup = tokenGroups[i];
		
		// Calculate region overlap
		let overlap = Math.max(0, Math.min(end, currentGroup.end) - Math.max(start, currentGroup.start) + 1);

		// Increment the types.
		[...currentGroup.lineData].map(type => lineStats[type] = (lineStats[type] || 0) + overlap);
	}

	return lineStats;
}

/**
 * Combine two sets of groups into a single cohesive analysis group list.
 * @param tokenGroups The groups of tokens.
 * @param blameGroups The groups of lines of code grouped by contributor ID.
 */
function getAnalysisGroups(tokenGroups: TokenGroup[], blameGroups: BlameGroup[]) : AnalysisGroup[] {
	// Create an array to hold the data.
	let analysisGroups : AnalysisGroup[] = [];

	// Pointers to token groups.
	var lastTokenIndex = 0;

	// Loop through the blame groups and combine them with the token information.
	for (var i = 0; i < blameGroups.length; i++) {
		// Get the blame group.
		let blameGroup = blameGroups[i];
		
		// Get the set of token groups in the blame group space.
		let childTokenGroups : TokenGroup[] = [];
		while (lastTokenIndex < tokenGroups.length) {
			// Get current token.
			let currentGroup = tokenGroups[lastTokenIndex];

			// Skip token groups until we get to the start of our line.
			if (currentGroup.end < blameGroup.start) {
				lastTokenIndex++;
				continue;
			}

			// Exit the loop if the start of the token group is past the end of our blame group.
			if (currentGroup.start > blameGroup.end) break;

			// Add the token to the groups.
			childTokenGroups.push(currentGroup);

			// Increment the token index.
			lastTokenIndex++;
		}

		// No tokens, we have to break.
		if (childTokenGroups.length == 0) break;

		// Make sure tokens are full used up.
		if (childTokenGroups[childTokenGroups.length - 1].end >= blameGroup.end) lastTokenIndex--;

		// Count the lines and push the group to the list.
		analysisGroups.push({
			start: blameGroup.start,
			end: blameGroup.end,
			contributorId: blameGroup.contributorId,
			lineStats: countLines(blameGroup.start, blameGroup.end, tokenGroups)
		});
	}

	return analysisGroups;
}

/**
 * Update data structures once all lines have been tallied to reflect the correct percentages.
 * @param numLines The total number of lines of code in the file/folder.
 * @param aggregateLineStats The advanced line stats whose percentages need to be updated.
 * @param contributorStatsMap The contributor stats map whose percentages need to be updated.
 * @param extensionMap The extension map whose percentages need to be updated.
 */
function computeItemPercentages(numLines: number, aggregateLineStats: AdvancedLineStats, contributorStatsMap : ContributorStatsMap, extensionMap : ExtensionMap | undefined = undefined) {
	// Generate sums of aggregate line stats (they may not be the same as numLines since a line can be counted twice).
	let aggregateLineStatsTypes = Object.keys(aggregateLineStats).map(type => parseInt(type));
	let aggregatesSum = 0;
	for (var tokenType of aggregateLineStatsTypes) {
		aggregatesSum += aggregateLineStats[tokenType].numLines;
	}

	// Compute percentages for the aggregate line stats.
	for (var tokenType of aggregateLineStatsTypes) {
		aggregateLineStats[tokenType].percentage = aggregateLineStats[tokenType].numLines / aggregatesSum;
	}

	// Loop through contributors to compute percentages.
	for (let contributorId of Object.keys(contributorStatsMap)) {
		// File percentages.
		contributorStatsMap[contributorId].percentage = contributorStatsMap[contributorId].numLines / numLines;

		// Advanced stats map percentages.
		let tokenTypes = Object.keys(contributorStatsMap[contributorId].aggregateLineStats).map(type => parseInt(type));
		tokenTypes.map(type => {
			contributorStatsMap[contributorId].aggregateLineStats[type].percentage = contributorStatsMap[contributorId].aggregateLineStats[type].numLines / aggregateLineStats[type].numLines;
		});
	}

	// Compute extension map percentages.
	if (extensionMap) {
		for (let extension of Object.keys(extensionMap)) {
			extensionMap[extension].percentage = extensionMap[extension].numLines / numLines;
		}
	}
}

/**
 * Combine all analysis into a cohesive data structure and calculate counts and percentages.
 * @param path The path of the file.
 * @param tokenGroups The groups of tokens.
 * @param blameGroups The groups of lines of code grouped by contributor ID.
 */
export function processFileAnalysis(path: string, tokenGroups: TokenGroup[], blameGroups: BlameGroup[]) : AnalysedItem {
	// Combine the two group sets into a single list of analysis groups.
	let analysisGroups = getAnalysisGroups(tokenGroups, blameGroups);

	// Run statistics on the groups by grouping the analysis group together by contributor ID.
	let aggregateLineStats : AdvancedLineStats = {};
	let contributorStatsMap : ContributorStatsMap = {};
	let numLines = 0;

	// Loop through the analysis groups.
	for (let group of analysisGroups) {
		// Get contributor or create one.
		let contributorStats : ContributorStats = contributorStatsMap[group.contributorId] || {
			contributorId: group.contributorId,
			numLines: 0,
			percentage: 0,
			aggregateLineStats: {}
		};

		// Get all the token types in the current group.
		let tokenTypes = Object.keys(group.lineStats).map(type => parseInt(type));

		// Increment all the aggregates.
		tokenTypes.map(type => {
			// Increment the aggregate line stats.	
			aggregateLineStats[type] = {
				numLines: aggregateLineStats[type] ? aggregateLineStats[type].numLines + group.lineStats[type] : group.lineStats[type],
				percentage: 0
			};

			// Increment the aggregate contributor line stats.
			contributorStats.aggregateLineStats[type] = {
				numLines: contributorStats.aggregateLineStats[type] ? contributorStats.aggregateLineStats[type].numLines + group.lineStats[type] : group.lineStats[type],
				percentage: 0
			};
		});
		
		// Increment line count.
		let groupLength = (group.end - group.start) + 1;
		numLines += groupLength;
		contributorStats.numLines += groupLength;

		// Set the contributor in case it was null.
		contributorStatsMap[group.contributorId] = contributorStats;
	}

	// Compute the percentages for the file.
	computeItemPercentages(numLines, aggregateLineStats, contributorStatsMap);

	return {
		path: `${path}`,
		contributors: contributorStatsMap,
		numLines,
		aggregateLineStats,
		analysis: analysisGroups,
		isFile: true
	};
}

/**
 * Generate folder entries that aggregate results of analysed children together.
 * @param items The analysed files in the repository.
 */
export function generateFolderEntries(items: AnalysedItem[]) : AnalysedItem[] {
	// Create map to group files together by folder.
	let folderFileMap : FolderFileMap = { "": [] };
	for (let item of items) {
		// Add file to the root folder.
		folderFileMap[""].push(item);

		// Split file path by slashes.
		let pathComponents = item.path.split("/");
		
		// If the file is in the root directory, skip it.
		if (pathComponents.length == 1) continue;

		// Loop through all path components except the last (as that is the file name).
		for (var i = 0; i < pathComponents.length - 1; i++) {
			// Reconstruct the path name
			let folderName = pathComponents.slice(0, i + 1).join("/");

			// Add the file to the folder.
			if (!folderFileMap[folderName]) folderFileMap[folderName] = [];
			folderFileMap[folderName].push(item);
		}
	}

	// Map each folder to the aggregate analysis of that folder.
	let folders : AnalysedItem[] = Object.keys(folderFileMap).map(folder => {
		// Get the files for this folder.
		let files = folderFileMap[folder];

		// Aggregate counters.
		let aggregateLineStats : AdvancedLineStats = {};
		let contributorStatsMap : ContributorStatsMap = {};
		let extensionMap : ExtensionMap = {};
		let numLines = 0;

		// Loop through the children of the current folder.
		for (let file of files) {
			// Add lines.
			numLines += file.numLines;
			
			// Loop through file contributors.
			Object.keys(file.contributors).map(contributorId => {
				// Get current contributor.
				let contributor = file.contributors[contributorId];

				// Get aggregate contributor or create one.
				let aggregateContributor : ContributorStats = contributorStatsMap[contributorId] || {
					contributorId: contributorId,
					numLines: 0,
					percentage: 0,
					aggregateLineStats: {}
				};

				// Get all the token types in the current contributor's line stats.
				let tokenTypes = Object.keys(contributor.aggregateLineStats).map(type => parseInt(type));

				// Increment the contributor aggregates.
				tokenTypes.map(type => {
					// Increment the aggregate contributor line stats.
					aggregateContributor.aggregateLineStats[type] = {
						numLines: aggregateContributor.aggregateLineStats[type] ? aggregateContributor.aggregateLineStats[type].numLines + contributor.aggregateLineStats[type].numLines : contributor.aggregateLineStats[type].numLines,
						percentage: 0
					};
				});

				// Increment aggregate contributor line count.
				aggregateContributor.numLines += contributor.numLines;

				// Set the contributor to the new aggregate contributor.
				contributorStatsMap[contributorId] = aggregateContributor;
			});

			// Get token types from the file aggregate line stats.
			let tokenTypes = Object.keys(file.aggregateLineStats).map(type => parseInt(type));

			// Loop through the token types and increment the aggregate line stats.
			tokenTypes.map(type => {
				// Increment the folder aggregate line stats.
				aggregateLineStats[type] = {
					numLines: aggregateLineStats[type] ? aggregateLineStats[type].numLines + file.aggregateLineStats[type].numLines : file.aggregateLineStats[type].numLines,
					percentage: 0
				};
			});

			// Get file extension and aggregate it.
			let fileExtension = file.path.split(".").pop() || "";
			if (fileExtension != "") {
				// Get existing object or create new line stats for the extension.
				let extensionLineCount : AdvancedLineCount = extensionMap[fileExtension] || {
					numLines: 0,
					percentage: 0
				};

				// Add lines for this file extension.
				extensionLineCount.numLines += file.numLines;

				// Set the line count to the new line count.
				extensionMap[fileExtension] = extensionLineCount;
			}
		}

		// Compute the percentages for the current folder.
		computeItemPercentages(numLines, aggregateLineStats, contributorStatsMap, extensionMap);

		// Return item.
		return {
			path: folder,
			contributors: contributorStatsMap,
			numLines,
			aggregateLineStats,
			extensions: extensionMap,
			isFile: false
		};
	});

	return folders;
}