/**
 * @file Analysis data model.
 * @author Francesco Compagnoni
 */

// Imports
import { Data } from "../../../shared/Result";

// Interfaces
export interface Analysis {
	analysisId: number
};

/**
 * Convert raw data to the Analysis data model.
 * @param input The input data to convert to an Analysis.
 * @returns An Analysis object representing the input data.
 */
export function toAnalysis(input: Data) : Analysis {
	return {
		analysisId: input.analysisId
	};
}