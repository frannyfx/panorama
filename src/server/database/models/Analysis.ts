/**
 * @file Database operations for the Analysis model.
 * @author Francesco Compagnoni
 */

// Imports
import { getConnection } from "../";
import { Data } from "../../../shared/Result";

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

/**
 * Get the ID of the latest analysis of a repository.
 * @param owner The owner of the repository.
 * @param repo The name of the repository.
 * @returns The ID of the latest analysis of that repository or -1.
 */
async function getLatestId(owner: string, repo: string) : Promise<number> {
	// TODO: Use a join.
	// Get connection.
	let connection = await getConnection();
	if (!connection) return -1;

	// Get owner ID.
	let ownerRow = await connection("User").where({ login: owner }).select("userId").first();
	if (!ownerRow) return -1;

	// Get repository ID.
	let repositoryRow = await connection("Repository").where({ ownerId: ownerRow.userId, name: repo }).select("repositoryId").first();
	if (!repositoryRow) return -1;

	// Get analysis with repo name and owner ID.
	let analysisRow = await connection("Analysis").where({ repositoryId: repositoryRow.repositoryId }).select("analysisId").orderBy("completedAt", "desc").first();
	if (!analysisRow) return -1;
	return analysisRow.analysisId;
}

/**
 * Returns base analysis data with joined owner and repository information.
 * @param analysisId The ID of the analysis to retrieve.
 */
async function get(analysisId: number) : Promise<Data | null> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return null;

	// Get the row.
	let analysisRow = await connection("Analysis")
		.where({ analysisId })
		.join("Repository", { "Analysis.repositoryId": "Repository.repositoryId"})
		.join("User", { "Repository.ownerId": "User.userId"})
		.select("Analysis.*", "Repository.name as repositoryName", "User.login as owner").first();
	return analysisRow;
}

export default {
	insert, update, getLatestId, get
};