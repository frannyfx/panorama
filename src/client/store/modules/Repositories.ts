/**
 * @file Store module that contains repository data.
 * @author Francesco Compagnoni
 */

// Imports
import { MutationTree } from "vuex";

// Modules
import { Repository, RepositoryObject } from "../../modules/models/Repository";

export interface RepositoryState {
	loaded: boolean,
	list: Repository[],
	object: RepositoryObject
};

const state : RepositoryState = {
	loaded: false,
	list: [] as Repository[],
	object: {} as RepositoryObject
};

const getters = { };

const actions = { };

const mutations : MutationTree<RepositoryState> = {
	setRepositories(state, repos: Repository[]) {
		// ...
	}
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};