/**
 * @file Operations for the User database model.
 * @author Francesco Compagnoni
 */

// Imports
import Knex from "knex";
import { getConnection } from "../";

// Interfaces
/**
 * The interface matching the User table in the database.
 */
export interface DatabaseUser {
	userId: number,
	login: string,
	lastAccess?: Date,
	lastUpdated?: Date,
	colour?: string
};

/**
 * Insert a user into the database.
 * @param user The user to insert.
 */
export async function insertOrUpdate(user: DatabaseUser, transaction: Knex.Transaction | undefined = undefined) : Promise<boolean> {
	// Get connection.
	let connection = transaction ?? await getConnection();
	if (!connection) return false;

	// Check if the user already exists.
	let userResult = await connection("User").select("userId").where({userId: user.userId}).limit(1);
	if (userResult.length == 0)
		await connection("User").insert({...user, lastUpdated: new Date()});
	else {
		// Update the existing user.
		await connection("User").where({ userId: user.userId }).update({
			login: user.login,
			lastAccess: user.lastAccess ? user.lastAccess : undefined,
			lastUpdated: new Date(),
			colour: user.colour
		});
	}

	return true;
}

export default {
	insertOrUpdate
};