/**
 * @file Database operations for the Analysis model.
 * @author Francesco Compagnoni
 */

// Imports
import { getConnection } from "../";
import { Data } from "../../../shared/Result";

// Interfaces
/**
 * The enum matching the 'status' parameter in an Analysis row in the database.
 */
export enum DatabaseAnalysisStatus {
	QUEUED = 1,
	STARTED = 2,
	COMPLETED = 3,
	FAILED = 4
};

/**
 * The interface matching the Analysis table in the database.
 */
export interface DatabaseAnalysis {
	analysisId?: number,
	repositoryId: number,
	requestedBy: number,
	commitId?: string,
	status: DatabaseAnalysisStatus,
	jobId?: string,
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
		commitId: analysis.commitId,
		jobId: analysis.jobId,
		status: analysis.status,
		queuedAt: analysis.queuedAt,
		startedAt: analysis.startedAt!,
		completedAt: analysis.completedAt!
	});
	return true;
}

/**
 * Get the latest analysis of a repository.
 * @param owner The owner of the repository.
 * @param repo The name of the repository.
 * @returns The information about the latest analysis of that repository.
 */
async function getLatest(owner: string, repo: string) : Promise<Data | null> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return null;

	// Get analysis with repo name and owner ID.
	let analysisRow = await connection("Analysis")
		.where({ "User.login": owner, "Repository.name": repo })
		.orderBy("queuedAt", "desc")
		.join("Repository", { "Analysis.repositoryId": "Repository.repositoryId"})
		.join("User", { "Repository.ownerId": "User.userId"})
		.select(
			"Analysis.analysisId",
			"Analysis.commitId",
			"Analysis.status",
			"Analysis.jobId",
			"Analysis.queuedAt",
			"Analysis.startedAt",
			"Analysis.completedAt",
			"Repository.name as repositoryName",
			"User.login as owner"
		).first();

	return analysisRow;
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
		.select(
			"Analysis.analysisId",
			"Analysis.commitId",
			"Analysis.status",
			"Analysis.jobId",
			"Analysis.queuedAt",
			"Analysis.startedAt",
			"Analysis.completedAt",
			"Repository.name as repositoryName",
			"User.login as owner"
		).first();
		
	return analysisRow;
}

export default {
	insert, update, getLatest, get
};