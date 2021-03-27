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
import { Analysis, AnalysisChunk, AnalysisMap, AnalysisToken } from "../../modules/models/Analysis";
import { User } from "../../modules/models/User";
import Vue from "vue";
import { Data } from "../../../shared/Result";

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
			Vue.set(state.object, repository.fullName, repository);
		});

		// Set the page accordingly.
		state.page = data.page;

		// We can't load more if we returned less than the configured page size or if an empty data set was returned.
		state.canLoadMore = data.repositories.length == config.repositories.pageSize;
	},
	addSingle(state: RepositoriesState, repository: Repository) {
		Vue.set(state.object, repository.fullName, repository);
	},
	setFileChildrenLoading(state: RepositoriesState, data: { file: File, loading: boolean }) {
		data.file.children.loading = data.loading;
	},
	setFileContentLoading(state: RepositoriesState, data: { file: File, loading: boolean }) {
		data.file.content.loading = data.loading;
	},
	setAnalysisInProgress(state: RepositoriesState, data: { repository: Repository, inProgress: boolean }) {
		data.repository.analysis.inProgress = data.inProgress;
	},
	setAnalysis(state: RepositoriesState, data: { repository: Repository, analysis: Data }) {
		data.repository.analysis.id = data.analysis.analysisId;
		data.repository.analysis.commitId = data.analysis.commitId;
		data.repository.analysis.startedAt = data.analysis.startedAt;
	},
	resetChildren(state: RepositoriesState, repository: Repository) {
		Object.keys(repository.content.files).map(file => {
			// Reset children.
			repository.content.files[file].children.loaded = false;
			repository.content.files[file].analysis.available = false;
			repository.content.files[file].analysis.data = undefined;
			repository.content.files[file].children.list.splice(0, repository.content.files[file].children.list.length);

			// Reset content.
			repository.content.files[file].content.loaded = false;
		});
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
			file.analysis.available = data.analysis[file.path] != undefined;
			file.analysis.data = data.analysis[file.path];
			Vue.set(data.repository.content.files, file.path, file);
		});

		// Set analysis for the directory whose children we added.
		if (data.analysis[data.path]) {
			data.repository.content.files[data.path].analysis.available = true;
			data.repository.content.files[data.path].analysis.data = data.analysis[data.path];	
		}
	},
	updateContributors(state: RepositoriesState, data: { repository: Repository, contributors: User[] }) {
		// Dedupe contributors.
		let logins = data.repository.contributors.list.map(user => user.login);
		data.contributors.map(contributor => {
			// Add contributor.
			if (logins.indexOf(contributor.login) == -1) data.repository.contributors.list.push(contributor);
		});
	},
	setTicket(state: RepositoriesState, data: { repository: Repository, ticket: string }) {
		// Set analysis data retrieval ticket for repository.
		data.repository.analysis.ticket = data.ticket;
	},
	setFileContent(state: RepositoriesState, data: { file: File, content: string }) {
		// Set the file's content.
		data.file.content.loaded = true;
		data.file.content.data = data.content;
	},
	setFileChunks(state: RepositoriesState, data: { file: File, chunks: AnalysisChunk[] }) {
		// Set the loaded flag to true.
		data.file.analysis.data!.chunks.loaded = true;

		// The analysis chunks need to have an index so the table can display them properly.
		let chunkList : AnalysisChunk[] = [];
		for (var i = 0; i < data.chunks.length; i++) {
			chunkList.push({ ...data.chunks[i], index: i });
		}

		// Set the list.
		data.file.analysis.data!.chunks.list = chunkList;

		// Map the start of each chunk to the chunk itself as it allows for easier rendering.
		chunkList.map(chunk => data.file.analysis.data!.chunks.object[chunk.start] = chunk);
	},
	setFileTokens(state: RepositoriesState, data: { file: File, tokens: AnalysisToken[] }) {
		// Set the loaded flag to true.
		data.file.analysis.data!.tokens.loaded = true;

		// The analysis tokens need to have an index so the table can display them properly.
		let tokenList : AnalysisToken[] = [];
		for (var i = 0; i < data.tokens.length; i++) {
			tokenList.push({ ...data.tokens[i], index: i});
		}

		// Set the list.
		data.file.analysis.data!.tokens.list = tokenList;

		// Map the start of each token to the token itself as it allows for easier rendering.
		tokenList.map(token => data.file.analysis.data!.tokens.object[token.start] = token);
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
		state.canLoadMore = true;
	}
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};