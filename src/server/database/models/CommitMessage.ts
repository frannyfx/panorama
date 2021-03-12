/**
 * @file Operations for the CommitMessage database model.
 * @author Francesco Compagnoni
 */

// Imports
import { getConnection } from "../";

// Interfaces
/**
 * The interface matching the CommitMessage table in the database.
 */
export interface DatabaseCommitMessage {
	commitId: string,
	message: string
};

/**
 * Insert many commit messages into the database.
 * @param messages The messages to insert.
 */
export async function insert(messages: DatabaseCommitMessage[]) : Promise<boolean> {
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