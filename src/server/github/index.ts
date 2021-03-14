/**
 * @file GitHub API module.
 * @author Francesco Compagnoni
 */

// Imports
import { Octokit } from "@octokit/rest";
import { createOAuthAppAuth } from "@octokit/auth-oauth-app";
import { GetResponseDataTypeFromEndpointMethod } from "@octokit/types";

// Config
import loadConfig, { Config } from "../Config";
const config : Config = loadConfig();

// Modules
import { Result, buildResult, Data } from "../../shared/Result";

// Types
let octokitForTypes = new Octokit();
export type Repository = GetResponseDataTypeFromEndpointMethod<typeof octokitForTypes.repos.get>;
export type User = GetResponseDataTypeFromEndpointMethod<typeof octokitForTypes.users.getAuthenticated>;
export type Contributors = GetResponseDataTypeFromEndpointMethod<typeof octokitForTypes.repos.listContributors>;

// Constants
const octokitAuth = createOAuthAppAuth({
	clientId: config.github!.clientId,
	clientSecret: config.github!.clientSecret
});

// Variables
var octokitInstance : Octokit | null = null;

/**
 * Get the current instance of Octokit.
 */
async function getOctokit() : Promise<Octokit> {
	if (!octokitInstance) octokitInstance = new Octokit({ auth: await octokitAuth({ type: "oauth-app" }) });
	return octokitInstance;
}

/**
 * Check a user's authentication token.
 * @param accessToken The access token whose auth needs to bechecked.
 * @returns A result containing the user's information.
 */
export async function checkAuth(accessToken: string) : Promise<Result<User>> {
	let octokit = new Octokit({
		auth: accessToken
	});

	let result = await octokit.users.getAuthenticated();
	return buildResult(result.status == 200, result.data);
}

/**
 * Complete the authentication process with GitHub.
 * @param code The code received by the user.
 * @returns A result containing the access token.
 */
export async function getAccessToken(code: string) : Promise<Result<string>> {
	try {
		let authentication = await octokitAuth({
			type: "token",
			code
		});

		return buildResult(true, (<Data>authentication).token);
	} catch (e) {
		return buildResult(false);
	}
}

/**
 * Get a repository.
 * @param name The full name of the repository.
 * @param accessToken The user's access token.
 * @returns A result containing the requested repository.
 */
export async function getRepository(name: string, accessToken: string) : Promise<Result<Repository>> {
	// Build new Octokit with the provided access token.
	let octokit = new Octokit({
		auth: accessToken
	});

	// Get owner and repo name.
	let split = name.split("/");
	if (split.length != 2) return buildResult(false);

	// Get repository.
	try {
		let result = await octokit.repos.get({
			owner: split[0],
			repo: split[1]
		});
		
		return buildResult(result.status == 200, result.data);
	} catch (e) {
		return buildResult(false);
	}
}

export async function getRepositoryContributors(name: string, accessToken: string) : Promise<Result<Contributors>> {
	// Build new Octokit with the provided access token.
	let octokit = new Octokit({
		auth: accessToken
	});

	// Get owner and repo name.
	let split = name.split("/");
	if (split.length != 2) return buildResult(false);

	let result = await octokit.repos.listContributors({
		owner: split[0],
		repo: split[1]
	});

	return buildResult(result.status == 200, result.data);
}

export async function getCommitAuthor(owner: string, repo: string, ref: string, accessToken: string) : Promise<Result> {
	// Build new Octokit with the provided access token.
	let octokit = new Octokit({
		auth: accessToken
	});

	// Get commit
	try {
		let result = await octokit.repos.getCommit({
			owner, repo, ref
		});
	
		return buildResult(result.status == 200, result.status == 200 && result.data.author ? result.data.author : undefined);
	} catch (e) {
		return buildResult(false);
	}
}