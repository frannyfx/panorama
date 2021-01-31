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

// Interfaces
interface User {
	id: number,
	login: string,
	avatarUrl: string,
	name: string,
	email: string
};

export interface Repository {
	id: number,
	name: string,
	private: boolean,
	description: string,
	contributors: User[],
	updated_at: Date
};

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
		per_page: 5,
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

		let contributors : User[] = [];
		if (contributorsResult.status == 200) {
			contributorsResult.data.map(user => {
				contributors.push({
					id: user.id!,
					login: user.login!,
					avatarUrl: user.avatar_url!,
					name: user.name!,
					email: user.email!
				});
			});
		} 

		return {
			id: repo.id!,
			name: repo.full_name!,
			private: repo.private!,
			description: repo.description!,
			contributors,
			updated_at: new Date(repo.pushed_at!)
		};
	}));

	reposWithContributors.sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime());
	return reposWithContributors;
}