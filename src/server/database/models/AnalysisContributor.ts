/**
 * @file Operations for the AnalysisContributor database model.
 * @author Francesco Compagnoni
 */

// Imports
import { getConnection } from "../";
import Analysis from "./Analysis";

// Models
import { DatabaseUser, insertOrUpdate as insertOrUpdateUser } from "./User";

// Interfaces
/**
 * The interface matching the AnalysisContributor in the database.
 */
export interface DatabaseAnalysisContributor {
	analysisId: number,
	userId: number
};

/**
 * Insert an AnalysisContributor and potentially insert a user into the database.
 * @param analysisId The parent analysis of the contributor.
 * @param user The user model.
 */
export async function insertOrUpdate(analysisId: number, user: DatabaseUser) : Promise<boolean> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return false;

	// Insert or update the user.
	await insertOrUpdateUser(user);
	await connection("AnalysisContributor").insert({
		analysisId, userId: user.userId
	});

	return true;
}

/**
 * Get contributor information from an analysis.
 * @param analysisId The analysis ID of the contributors.
 * @returns A list of contributors.
 */
export async function getFromAnalysis(analysisId: number) : Promise<DatabaseUser[] | null> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return null;

	// Get contributors.
	let users : DatabaseUser[] = await connection("AnalysisContributor").where({ analysisId }).join("User", { "AnalysisContributor.userId": "User.userId" }).select("User.userId", "User.login", "User.colour");
	return users;
}

export default {
	insertOrUpdate, getFromAnalysis
};