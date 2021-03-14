/**
 * @file GitHub API module.
 * @author Francesco Compagnoni
 */

// Imports
import { Octokit } from "@octokit/rest";
import { createTokenAuth }from "@octokit/auth-token";
import { AuthInterface, GetResponseDataTypeFromEndpointMethod } from "@octokit/types";

// Modules
import Store from "../store";
import config from "../config";
import { Data, Result } from "../../shared/Result";
import { Repository, toRepository } from "./models/Repository";
import { toUser, User } from "./models/User";
import { File, toFile } from "./models/File";
import { send } from "./API";
import { Method } from "../../shared/Method";

// Variables
var instance : Octokit | null = null;

// Types
//let octokitForTypes = new Octokit();
//export type GithubRepository = GetResponseDataTypeFromEndpointMethod<typeof octokitForTypes.repos.get>;

/**
 * Get the current instance of Octokit.
 */
function getOctokit() : Octokit {
	// Create instance if it does not exist.
	if (!instance) instance = new Octokit({ auth: Store.state.auth.accessToken });

	// Return instance.
	return instance;
}

/**
 * Get the authenticated user's details.
 * @returns The profile of the authenticated user.
 */
export async function getProfile() : Promise<Result> {
	let result = await getOctokit().users.getAuthenticated();
	
	return {
		status: {
			ok: result.status == 200
		},
		result: result.data
	};
}

/**
 * Get the OAUTH redirect URI depending on the current location.
 * @returns The redirect URI to use for the OAUTH flow.
 */
export function getRedirectURI() : string {
	return `${window.location.protocol}//${window.location.host}/api/github/callback`;
}

/**
 * Retrieve a user's data.
 * @param username The username of the user to retrieve.
 * @returns The user's information.
 */
export async function getUser(username: string) : Promise<User | null> {
	let result = await getOctokit().users.getByUsername({ username });
	if (result.status != 200) return null;
	let user = toUser(result.data);

	// Enrich user.
	let userData = await send(Method.GET, `user/${username}`);
	if (userData.status.ok) {
		user.colour = userData.result!.colour;
	}

	return user;
}

/**
 * Get the list of repositories.
 * @returns The list of repositories the user has access to.
 */
export async function getRepositories(page: number = 1) : Promise<Repository[] | null> {
	// Get repos.
	let result = await getOctokit().repos.listForAuthenticatedUser({
		page,
		per_page: config.repositories.pageSize,
		affiliation: "owner,collaborator",
		sort: "updated",
		direction: "desc"
	});

	// Return null if we failed to fetch the repositories.
	if (result.status != 200) return null;

	// Enrich repositories.
	let enrichedRepositories : Repository[] = await Promise.all(result.data.map(repo => enrichRepository(repo)));

	// Sort by time updated.
	enrichedRepositories.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
	return enrichedRepositories;
}

/**
 * Get a single repository from GitHub.
 * @param owner The owner of the repository.
 * @param repo The name of the repository.
 * @returns The requested repository.
 */
export async function getRepository(owner: string, repo: string) : Promise<Repository | null> {
	// Get repo.
	let result = await getOctokit().repos.get({
		owner, repo
	});

	// Return null if fetching the repository failed.
	if (result.status != 200) return null;

	// Enrich repository and return result.
	return await enrichRepository(result.data);
}

/**
 * Fetch additional data for a repository.
 * @param repository The repository data returned by GitHub.
 * @returns A Panorama Repository model of the data.
 */
export async function enrichRepository(repository: any) : Promise<Repository> {
	// Get contributors and convert them to User instances.
	let contributorsResult = await getOctokit().repos.listContributors({
		owner: repository.owner!.login,
		repo: repository.name,
		per_page: 5
	});

	let contributors : Data[] = contributorsResult.status == 200 ? contributorsResult.data : [];
	
	// Get analysis data.
	let analysis = await send(Method.GET, `repo/${repository.full_name}/analysis`);
	return toRepository(repository, contributors, analysis.status.ok ? analysis.result!.analysisId : -1);
}

/**
 * Get the contents of a directory.
 * @param repository The repository to get the files from.
 * @param path The path of the folder to get files from.
 * @returns The files in the folder.
 */
export async function getFiles(repository: Repository, path: string) : Promise<File[]> {
	// Get files.
	let result = await getOctokit().repos.getContent({
		owner: repository.owner.login,
		repo: repository.name,
		path
	});

	if (result.status != 200) return [];

	// Get parent file directory.
	let parent = repository.content.files[path];

	// Convert to file interfaces.
	let files : File[] = Array.isArray(result.data) ? [...result.data!].map(file => toFile(file, undefined, parent)) : [];
	return files;
}