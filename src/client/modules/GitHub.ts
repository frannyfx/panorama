/**
 * @file GitHub API module.
 * @author Francesco Compagnoni
 */

// Imports
import { Octokit } from "@octokit/rest";
import { createTokenAuth }from "@octokit/auth-token";
import { AuthInterface, GetResponseDataTypeFromEndpointMethod } from "@octokit/types";
import { paths, components } from "@octokit/openapi-types";

// Modules
import Store from "../store";
import Users from "../store/modules/Users";
import config from "../config";
import { buildResult, Data, Result } from "../../shared/Result";
import { Repository, toRepository } from "./models/Repository";
import { toUser, User } from "./models/User";
import { File, toFile } from "./models/File";
import { send } from "./API";
import { Method } from "../../shared/Method";

// Types
type ContentFile = components["schemas"]["content-file"];

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
 * Retrieve a user's data.
 * @param username The username of the user to retrieve.
 * @returns The user's information.
 */
export async function getUser(username: string) : Promise<Data | null> {
	// Fetch the user information.
	let result = await getOctokit().users.getByUsername({ username });
	if (result.status != 200) return null;

	// Return the user.
	return result.data;
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
	return toRepository(repository, contributors, analysis.result);
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
		path,
		ref: repository.analysis.commitId ? repository.analysis.commitId : undefined
	});

	if (result.status != 200) return [];

	// Get parent file directory.
	let parent = repository.content.files[path];

	// Convert to file interfaces.
	let files : File[] = Array.isArray(result.data) ? [...result.data!].map(file => toFile(file, undefined, parent)) : [];
	return files;
}

/**
 * Find which data about a repository's contributors is unknown and fetch it appropriately.
 * @param repository The repository whose contributors need to be fetched.
 * @returns Whether the request executed successfully.
 */
export async function getEnrichedRepositoryContributors(repository: Repository) : Promise<boolean> {
	// Check the repository has a valid analysis available.
	if (repository.analysis.id == -1) return false;

	// Get all analysed contributors from repository.
	let contributorData = await send(Method.GET, `analysis/${repository.analysis.id}/contributors`);
	if (!contributorData.status.ok) return false;

	// Handle anonymous user.
	if (contributorData.result!["Anonymous"] && contributorData.result!["Anonymous"].userId == -1) toUser({ id: -1, login: "Anonymous" }, contributorData.result!["Anonymous"]);

	// Check which contributors have not had their GitHub data fetched.
	let unknownUserLogins = Object.keys(contributorData.result!).filter(login => Users.state.list.indexOf(login) == -1);

	// Get contributors that need to be updated with enriched data.
	let unenrichedUserLogins = Users.state.list.filter(login => !Users.state.object[login].enrichedData && contributorData.result![login]);

	// If there are unknown contributors, fetch them.
	let contributors : User[] = [];
	if (unknownUserLogins.length != 0) {
		// Add new users to the array.
		let fetchedUsers : (User | null)[] = await Promise.all(unknownUserLogins.map(async login => {
			// Request base user data from GitHub.
			let userData = await getUser(login);
			if (!userData) return null;

			// Combine with Panorama data and return as a User model.
			return toUser(userData, contributorData.result![login]);
		}));

		// Filter out failed entities and add them to contributors.
		contributors.push(...<User[]>fetchedUsers.filter(user => user != null));
	}

	// Update unenriched users.
	unenrichedUserLogins.map(login => {
		Store.commit("Users/update", { login, enrichedData: contributorData.result![login]});
		contributors.push(Users.state.object[login]);
	});

	// Now add all contributors (the store will take care of deduping).
	Store.commit("Repositories/updateContributors", { repository, contributors });
	return true;
}

/**
 * Fetch a file's content for it to be displayed by the file viewer.
 * @param repository The repository the file resides in.
 * @param file The file whose content needs to be fetched.
 * @returns Either a string representation of the file's content or null.
 */
export async function getFileContent(repository: Repository, file: File) : Promise<string | null> {
	// Prevent retrieving content if it's not a file or if it's too large.
	if (file.type != "file" || file.size > config.files.maxSize) return null;

	// Get file content.
	let content = await getOctokit().repos.getContent({
		owner: repository.owner.login,
		repo: repository.name,
		path: file.path,
		ref: repository.analysis.commitId ? repository.analysis.commitId : undefined
	});

	// If fetching failed, return null, otherwise return the file's contents encoded in base64.
	if (content.status != 200 || Array.isArray(content.data)) return null;
	
	try {
		// Try to decode text file, but this might fail as it could be a blob.
		return decodeURIComponent(escape(atob((content.data as ContentFile).content)));	
	} catch (e) {
		return null;
	}	
}