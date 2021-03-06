/**
 * @file GitHub API module.
 * @author Francesco Compagnoni
 */

// Imports
import { Octokit } from "@octokit/rest";
import { createOAuthAppAuth } from "@octokit/auth-oauth-app";
import { GetResponseDataTypeFromEndpointMethod } from "@octokit/types";

// Config
import { loadConfig } from "../Config";
const config = loadConfig();

// Modules
import { Result, buildResult, Data } from "../../shared/Result";
import { getRepoName } from "../../shared/utils";

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
	// Build new Octokit with the provided access token.
	let octokit = new Octokit({ auth: accessToken });
	try {
		// Get user details.
		let result = await octokit.users.getAuthenticated();
		return buildResult(result.status == 200, result.data);
	} catch (e) {
		return buildResult(false);
	}
}

/**
 * Complete the authentication process with GitHub.
 * @param code The code received by the user.
 * @returns A result containing the access token.
 */
export async function getAccessToken(code: string) : Promise<Result<string>> {
	try {
		// Authenticate user and get bearer token.
		let authentication = await octokitAuth({ type: "token", code });
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
	let octokit = new Octokit({ auth: accessToken });

	// Get owner and repo name.
	let split = getRepoName(name);
	if (!split) return buildResult(false);

	try {
		// Get repository.
		let result = await octokit.repos.get({ owner: split.owner, repo: split.repo });
		return buildResult(result.status == 200, result.data);
	} catch (e) {
		return buildResult(false);
	}
}

/**
 * Get a repository's contributors.
 * @param name The full name of the repository.
 * @param accessToken The user's access token.
 * @returns A result containing the repository's contributors.
 */
export async function getRepositoryContributors(name: string, accessToken: string) : Promise<Result<Contributors>> {
	// Build new Octokit with the provided access token.
	let octokit = new Octokit({ auth: accessToken });

	// Get owner and repo name.
	let split = getRepoName(name);
	if (!split) return buildResult(false);

	try {
		// Get contributors.
		let result = await octokit.repos.listContributors({ owner: split.owner, repo: split.repo });
		return buildResult(result.status == 200, result.data);
	} catch (e) {
		return buildResult(false);
	}
}

/**
 * Get the details about a commit's author.
 * @param owner The owner of the repository.
 * @param repo The name of the repository.
 * @param ref The reference of the commit.
 * @param accessToken The user's access token.
 * @returns The commit's author.
 */
export async function getCommitAuthor(owner: string, repo: string, ref: string, accessToken: string) : Promise<Result> {
	// Build new Octokit with the provided access token.
	let octokit = new Octokit({ auth: accessToken });

	try {
		// Get commit.
		let result = await octokit.repos.getCommit({ owner, repo, ref });
		return buildResult(result.status == 200, result.status == 200 && result.data.author ? result.data.author : undefined);
	} catch (e) {
		return buildResult(false);
	}
}