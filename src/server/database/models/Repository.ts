/**
 * @file Database operations for the Repository model.
 * @author Francesco Compagnoni
 */

// Imports
import Knex from "knex";
import { getConnection } from "../";

// Interfaces
/**
 * The interface matching the Repository table in the database.
 */
export interface DatabaseRepository {
	repositoryId: number,
	name: string,
	ownerId: number,
	lastAnalysis?: Date
};

/**
 * Inserts a repository in the Repository table.
 * @param repository The repository data.
 * @returns Whether the function executed successfully.
 */
async function insertOrUpdate(repository: DatabaseRepository, transaction: Knex.Transaction | undefined = undefined) : Promise<boolean> {
	// Get connection.
	let connection = transaction ?? await getConnection();
	if (!connection) return false;

	// Check if the repository already exists.
	let repositoryResult = await connection("Repository").select("repositoryId").where({repositoryId: repository.repositoryId}).limit(1);
	if (repositoryResult.length == 0)
		await connection("Repository").insert(repository);
	else {
		// Update the existing repository.
		await connection("Repository").where({ repositoryId: repository.repositoryId }).update({
			name: repository.name,
			ownerId: repository.ownerId,
			lastAnalysis: repository.lastAnalysis
		});
	}

	return true;
}

export default {
	insertOrUpdate
};