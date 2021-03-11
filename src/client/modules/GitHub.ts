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
import config from "../config";
import { Data, Result } from "../../shared/Result";
import { Repository, toRepository } from "./models/Repository";
import { User } from "./models/User";
import { File, toFile } from "./models/File";

// Variables
var instance : Octokit | null = null;

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

	// Get contributors.
	let reposWithContributors : Repository[] = await Promise.all(result.data.map(async repo => {
		// Get contributors and convert them to User instances.
		let contributorsResult = await getOctokit().repos.listContributors({
			owner: repo.owner!.login,
			repo: repo.name,
			per_page: 5
		});

		let contributors : Data[] = contributorsResult.status == 200 ? contributorsResult.data : [];
		return toRepository(repo, contributors);
	}));

	// TODO: Get latest analysis ID for each repository.
	// ...

	reposWithContributors.sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime());
	return reposWithContributors;
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

	// Convert to file interfaces.
	let files : File[] = Array.isArray(result.data) ? [...result.data!].map(file => toFile(file)) : [];
	return files;
}