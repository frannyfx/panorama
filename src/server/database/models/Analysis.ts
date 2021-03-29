/**
 * @file Database operations for the Analysis model.
 * @author Francesco Compagnoni
 */

// Imports
import Knex from "knex";
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
async function insert(analysis: DatabaseAnalysis, transaction: Knex.Transaction | undefined = undefined) : Promise<DatabaseAnalysis> {
	// Get connection.
	let connection = transaction ?? await getConnection();
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
 * Lookup an analysis using its corresponding job ID.
 * @param jobId The ID of the bee-queue job.
 * @returns The ID of the matching analysis.
 */
async function getRawWithJobId(jobId: string) : Promise<DatabaseAnalysis | null> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return null;

	// Get ID
	let analysis : DatabaseAnalysis = await connection("Analysis").where({ jobId }).first();
	return analysis ?? null;
}

/**
 * Get the latest analysis of a repository.
 * @param owner The owner of the repository.
 * @param repo The name of the repository.
 * @returns The information about the latest analysis of that repository.
 */
async function getLatest(owner: string, repo: string, status: DatabaseAnalysisStatus | undefined = undefined) : Promise<Data | null> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return null;

	// Conditions
	let conditions : Data = {
		"User.login": owner,
		"Repository.name": repo
	};

	// Add the status condition if set.
	if (status) conditions["Analysis.status"] = status;

	// Get analysis with repo name and owner ID.
	let analysisRow = await connection("Analysis")
		.where(conditions)
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

/**
 * Delete an analysis.
 * @param analysisId The ID of the analysis to delete.
 * @returns Whether the analysis was deleted successfully.
 */
async function deleteAnalysis(analysisId: number) : Promise<boolean> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return false;

	try {
		await connection("Analysis").where({ analysisId }).del();
		return true;
	} catch (e) {
		return false;
	}
}

/**
 * Get the most recent analyses requested by a user.
 * @param userId The ID of the user requesting the analyses.
 * @returns A list of recent anlyses.
 */
async function getRecentByUser(userId: number) : Promise<Data[]> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return [];

	// Get the most recent analyses by the user, grouping by repository ID and omitting
	// previous analyses.
	let recentAnalysisIDs = await connection("Analysis")
		.where({ requestedBy: userId, status: DatabaseAnalysisStatus.COMPLETED })
		.groupBy("Analysis.repositoryId")
		.max({"analysisId": "Analysis.analysisId"})
		.orderBy("analysisId", "desc")
		.limit(3);

	// If there are no IDs matching the criteria, return an empty array.
	if (recentAnalysisIDs.length == 0) return [];

	// Join the analysis IDs with relevant data.
	let recentAnalyses = await connection("Analysis")
		.whereIn("Analysis.analysisId", recentAnalysisIDs.map(row => row.analysisId))
		.join("Repository", { "Analysis.repositoryId": "Repository.repositoryId"})
		.join("User", { "Repository.ownerId": "User.userId"})
		.select(
			"Analysis.analysisId",
			"Repository.name as repositoryName",
			"User.login as owner",
			"Analysis.completedAt"
		)
		.orderBy("Analysis.completedAt", "desc");
		
	return recentAnalyses;
}

export default {
	insert, update, getLatest, get, getRawWithJobId, delete: deleteAnalysis, getRecentByUser
};