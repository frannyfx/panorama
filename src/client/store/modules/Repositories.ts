/**
 * @file Store module that contains repository data.
 * @author Francesco Compagnoni
 */

// Imports
import { MutationTree } from "vuex";

// Modules
import { Repository, RepositoryObject } from "../../modules/models/Repository";
import config from "../../config";
import { File } from "../../modules/models/File";
import { AnalysisMap } from "../../modules/models/Analysis";
import { User } from "../../modules/models/User";

// State interface.
export interface RepositoriesState {
	page: number,
	canLoadMore: boolean,
	list: Repository[],
	object: RepositoryObject
};

// Default state.
const state : RepositoriesState = {
	page: -1,
	canLoadMore: true as boolean,
	list: [] as Repository[],
	object: {} as RepositoryObject
};

const getters = { };

const actions = { };

const mutations : MutationTree<RepositoriesState> = {
	add(state: RepositoriesState, data: { repositories: Repository[], page: number }) {
		// Get IDs of repositories already in the list (need to ensure the list and the object contain the same objects).
		let repoIds = state.list.map(repo => repo.id);

		// Add repositories to the list and the object.
		data.repositories.map(repository => {
			// Remove the old version of the repository if a new one is contained in the list to be added.
			let repoIndex = repoIds.indexOf(repository.id);
			if (repoIndex != -1) {
				state.list.splice(repoIndex, 1, repository);
			} else state.list.push(repository);

			// Add to the object.
			state.object[repository.fullName] = repository;
		});

		// Set the page accordingly.
		state.page = data.page;

		// We can't load more if we returned less than the configured page size or if an empty data set was returned.
		state.canLoadMore = data.repositories.length == config.repositories.pageSize;
	},
	addSingle(state: RepositoriesState, repository: Repository) {
		state.object[repository.fullName] = repository;
	},
	addFileChildren(state: RepositoriesState, data: { repository: Repository, path: string, files: File[], analysis: AnalysisMap }) {
		// Sort children.
		let sortedFiles = data.files.sort((a: File, b: File) => {
			if (a.type == "dir" && b.type != "dir") return -1;
			if (a.type != "dir" && b.type == "dir") return 1;
			if (a.type == b.type) return a.name < b.name ? -1 : 1;
			return 0;
		});

		// Get file paths and add them to the file's children.
		data.repository.content.files[data.path].children.loaded = true;
		data.repository.content.files[data.path].children.list.push(...sortedFiles.map(file => file.path));

		// Add the files to the repository and set the analysis data.
		data.files.map(file => {
			file.analysis = data.analysis[file.path];
			data.repository.content.files[file.path] = file;
		});

		// Set analysis for the directory whose children we added.
		if (data.analysis[data.path]) data.repository.content.files[data.path].analysis = data.analysis[data.path];
	},
	updateContributors(state: RepositoriesState, data: { repository: Repository, contributors: User[] }) {
		// Dedupe contributors.
		let logins = data.repository.contributors.list.map(user => user.login);
		data.contributors.map(contributor => {
			// Add contributor.
			if (logins.indexOf(contributor.login) == -1) data.repository.contributors.list.push(contributor);
		});
	},
	clear(state: RepositoriesState) {
		// Dynamically delete keys (Vue components will react accordingly).
		Object.keys(state.object).map(key => {
			delete state.object[key];
		});

		// Remove all elements from the list.
		state.list.splice(0, state.list.length);

		// Reset page counter.
		state.page = -1;
	}
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};