/**
 * @file Database operations for the Analysis model.
 * @author Francesco Compagnoni
 */

// Imports
import { getConnection } from "../";

// Interfaces
/**
 * The interface matching the Analysis table in the database.
 */
export interface DatabaseAnalysis {
	analysisId?: number,
	repositoryId: number,
	requestedBy: number,
	queuedAt: Date,
	startedAt?: Date,
	completedAt?: Date
};

/**
 * Inserts an analysis in the Analysis table.
 * @param analysis The analysis data to insert.
 * @returns The database analysis with the new analysisId set.
 */
async function insert(analysis: DatabaseAnalysis) : Promise<DatabaseAnalysis> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return analysis;

	// Insert the analysis and update the ID in the object.
	let analysisId : number[] = await connection("Analysis").insert(analysis);
	analysis.analysisId = analysisId[0];
	return analysis;
}

/**
 * Updates an analysis in the Analysis table.
 * @param analysis The updated analysis data.
 * @returns Whether the update was successful.
 */
async function update(analysis: DatabaseAnalysis) : Promise<boolean> {
	// Get connection.
	let connection = await getConnection();
	if (!connection || !analysis.analysisId) return false;

	// Update the analysis row.
	await connection("Analysis").where({ analysisId: analysis.analysisId }).update({
		repositoryId: analysis.repositoryId,
		requestedBy: analysis.requestedBy,
		queuedAt: analysis.queuedAt,
		startedAt: analysis.startedAt!,
		completedAt: analysis.completedAt!
	});
	return true;
}

export default {
	insert, update
};