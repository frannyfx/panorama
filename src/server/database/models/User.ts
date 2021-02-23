/**
 * @file Operations for the User database model.
 * @author Francesco Compagnoni
 */

// Imports
import { getConnection } from "../";

// Interfaces
export interface DatabaseUser {
	userId: number,
	login: string,
	lastAccess: Date
};

/**
 * Insert a user into the database.
 * @param user The user to insert.
 */
export async function insert(user: DatabaseUser) {
	let database = await getConnection();
	// ...	
	/*let userId = database!.insert(user);
	return userId;*/
}