/**
 * @file Store module that contains repository data.
 * @author Francesco Compagnoni
 */

// Imports
import { MutationTree } from "vuex";

// Modules
import { Repository, RepositoryObject } from "../../modules/models/Repository";
import config from "../../config";

export interface RepositoryState {
	page: number,
	canLoadMore: boolean,
	list: Repository[],
	object: RepositoryObject
};

const state : RepositoryState = {
	page: -1,
	canLoadMore: true as boolean,
	list: [] as Repository[],
	object: {} as RepositoryObject
};

const getters = { };

const actions = { };

const mutations : MutationTree<RepositoryState> = {
	add(state : RepositoryState, data: { repositories: Repository[], page: number }) {
		// Add repositories to the list and the object.
		data.repositories.map(repository => {
			state.list.push(repository);
			state.object[repository.id] = repository;
		});

		// Set the page accordingly.
		state.page = data.page;

		// We can't load more if we returned less than the configured page size or if an empty data set was returned.
		state.canLoadMore = data.repositories.length == config.repositories.pageSize;
	},
	clear(state : RepositoryState) {
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