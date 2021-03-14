/**
 * @file Analysis data model.
 * @author Francesco Compagnoni
 */

// Imports
import { Data } from "../../../shared/Result";

// Interfaces
export interface Analysis {
	contributorList: string[],
	contributorObject: ContributorMap,
	aggregateLineStats: AggregateLineStats,
	numLines: number
};

export interface AnalysisMap {
	[key: string]: Analysis
};

export interface ContributorMap {
	[key: string]: AnalysisContributor
}

export interface AnalysisContributor {
	contributorId: string,
	numLines: number,
	percentage: number,
	aggregateLineStats: AggregateLineStats
}

export interface AggregateLineStats {
	[key: string]: {
		numLines: number,
		percentage: number
	}
}

/**
 * Convert raw data to the Analysis data model.
 * @param input The input data to convert to an Analysis.
 * @returns An Analysis object representing the input data.
 */
export function toAnalysis(input: Data) : Analysis {
	// Process contributors.
	let contributorList = Object.keys(input.contributors);

	return {
		contributorList,
		contributorObject: input.contributors,
		aggregateLineStats: input.aggregateLineStats,
		numLines: input.numLines
	};
}