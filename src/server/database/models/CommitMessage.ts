/**
 * @file Operations for the CommitMessage database model.
 * @author Francesco Compagnoni
 */

// Imports
import { getConnection } from "../";

// Interfaces
/**
 * The interface matching the User table in the database.
 */
export interface CommitMessage {
	commitId: string,
	message: string
};

/**
 * Insert a user into the database.
 * @param user The user to insert.
 */
export async function insert(messages: CommitMessage[]) : Promise<boolean> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return false;

	// Prevent insertion for the messages that are already present.
	// ...

	// Filter the messages.
	// ...

	// Insert the messages.
	// ...

	return true;
}

/**
 * Get a random sample of commit messages.
 * @param number The number of messages to retrieve.
 * @returns The message values.
 */
export async function get(number: string) : Promise<string[]> {
	return [];
}

export default {
	insert
};