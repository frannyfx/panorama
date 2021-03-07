/**
 * @file Operations for the AnalysisContributor database model.
 * @author Francesco Compagnoni
 */

// Imports
import { getConnection } from "../";

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

export default {
	insertOrUpdate
};