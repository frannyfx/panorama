/**
 * @file User data model.
 * @author Francesco Compagnoni
 */

// Imports
import { Data } from "../../../shared/Result";
import Store from "../../store";
import Users from "../../store/modules/Users";

// Interfaces
export interface User {
	id: number,
	login: string,
	avatarUrl: string,
	name: string,
	email: string,
	enrichedData?: {
		colour?: string
	}
};

export interface UserObject {
	[key: string]: User
};

/**
 * Convert raw data to the User data model and add it to the Users store.
 * @param input The input data to convert to a User.
 * @returns A User object representing the input data.
 */
export function toUser(input: Data, enrichedData: Data | undefined = undefined) : User {
	// Check if a user object already exists.
	if (Users.state.object[input.login]) {
		// Update the user if it does not have enriched data.
		if (!Users.state.object[input.login].enrichedData && enrichedData != undefined) Store.commit("Users/update", { login: input.login, enrichedData });
		return Users.state.object[input.login];
	}

	// Create a new user if it does not already exist.
	let user : User = {
		id: input.id!,
		login: input.login!,
		avatarUrl: input.avatar_url!,
		name: input.name!,
		email: input.email!,
		enrichedData: enrichedData == undefined ? undefined : {
			colour: enrichedData.colour
		}
	};

	// In this model, we add users directly to the store to keep track of them.
	Store.commit("Users/addSingle", user);
	return user;
}