/**
 * @file GitHub API module.
 * @author Francesco Compagnoni
 */

// Imports
import { Octokit } from "@octokit/rest";
import { createTokenAuth }from "@octokit/auth-token";
import { AuthInterface } from "@octokit/types";

// Modules
import Store from "../store";
import { Result } from "../../shared/Result";

// Variables
var instance : Octokit | null = null;

async function getOctokit() : Promise<Octokit> {
	// Return instance if it already exists.
	if (instance) return instance;
	
	// TODO: Handle no auth.

	// Otherwise, create instance.
	instance = new Octokit({
		auth: Store.state.auth.accessToken
	});
	return instance;
}

export async function getProfile() : Promise<Result> {
	let result = await (await getOctokit()).users.getAuthenticated();
	
	return {
		status: {
			ok: result.status == 200
		},
		result: result.data
	};
}