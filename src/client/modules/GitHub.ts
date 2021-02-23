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
import { Data, Result } from "../../shared/Result";
import { Repository, toRepository } from "./models/Repository";
import { User } from "./models/User";
import { File, toFile } from "./models/File";

// Variables
var instance : Octokit | null = null;

/**
 * Get the current instance of Octokit.
 */
async function getOctokit() : Promise<Octokit> {
	// Return instance if it already exists.
	if (instance) return instance;

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

export function getRedirectURI() : string {
	return `${window.location.protocol}//${window.location.host}/api/github/callback`;
}

export async function getRepositories() : Promise<Repository[]> {
	// Get repos.
	let result = await (await getOctokit()).repos.listForAuthenticatedUser({
		per_page: 10,
		affiliation: "owner,collaborator",
		sort: "updated",
		direction: "desc"
	});

	if (result.status != 200) return [];

	// Get contributors.
	let reposWithContributors : Repository[] = await Promise.all(result.data.map(async repo => {
		// Get contributors and convert them to User instances.
		let contributorsResult = await (await getOctokit()).repos.listContributors({
			owner: repo.owner!.login,
			repo: repo.name,
			per_page: 5
		});

		let contributors : Data[] = contributorsResult.status == 200 ? contributorsResult.data : [];
		return toRepository(repo, contributors);
	}));

	reposWithContributors.sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime());
	return reposWithContributors;
}

export async function getFiles(repository: Repository, path: string) : Promise<File[]> {
	// Get files.
	let result = await (await getOctokit()).repos.getContent({
		owner: repository.owner.login,
		repo: repository.name,
		path
	});

	if (result.status != 200) return [];

	// Convert to file interfaces.
	//let files : File[] = [].concat(result.data!).map(file => toFile(file));
	//return files;
	return [];
}