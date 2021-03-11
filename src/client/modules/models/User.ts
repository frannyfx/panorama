/**
 * @file User data model.
 * @author Francesco Compagnoni
 */

// Imports
import { Data } from "../../../shared/Result";

// Interfaces
export interface User {
	id: number,
	login: string,
	avatarUrl: string,
	name: string,
	email: string
};

/**
 * Convert raw data to the User data model.
 * @param input The input data to convert to a User.
 * @returns A User object representing the input data.
 */
export function toUser(input: Data) : User {
	return {
		id: input.id!,
		login: input.login!,
		avatarUrl: input.avatar_url!,
		name: input.name!,
		email: input.email!
	};
}