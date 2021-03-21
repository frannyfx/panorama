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
	typeList: string[],
	typeObject: {
		[key: string]: AggregateLineStats
	}
	numLines: number,
	chunks: {
		loaded: boolean,
		list: AnalysisChunk[],
		object: {
			[key: string]: AnalysisChunk
		}
	}
};

export interface AnalysisChunk {
	login?: string,
	start: number,
	end: number
}

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
	let contributorList = Object.keys(input.contributors).sort((a: string, b: string) => input.contributors[b].percentage - input.contributors[a].percentage);
	let typeList = Object.keys(input.extensions).sort((a: string, b: string) => input.extensions[b].percentage - input.extensions[a].percentage);

	return {
		contributorList,
		contributorObject: input.contributors,
		aggregateLineStats: input.aggregateLineStats,
		typeList: typeList,
		typeObject: input.extensions,
		numLines: input.numLines,
		chunks: {
			loaded: false,
			list: [],
			object: {}
		}		
	};
}