/**
 * @file Database operations for the AnalysisItem model as well as all its children.
 */

// Imports
import { getConnection } from "../";
import { AnalysedItem } from "../../analysis/Item";
import { DatabaseAnalysis } from "./Analysis";

// Interfaces
export interface DatabaseAnalysedItem {
	analysisId: number,
	path: string,
	isFile: boolean,
	numLines: number,
	type?: number
};

export interface DatabaseAnalysedItemAggregateStats {
	analysisId: number,
	path: number,
	token: number,
	numLines: number,
	percentage: number
};

async function convertAndInsert(analysis: DatabaseAnalysis, analysedItems: AnalysedItem[]) : Promise<boolean> {
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
	let result = await connection("AnalysedItem").insert(convertedAnalysedItems);
	
	// Convert aggregate stats.
	// ...

	return true;
}

export default {
	convertAndInsert
};