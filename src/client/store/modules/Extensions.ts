/**
 * @file Store module that contains extension map data.
 * @author Francesco Compagnoni
 */

// Imports
import { MutationTree } from "vuex";

// Models
import { ExtensionMap } from "../../../shared/models/FileType";

// State interface.
export interface ExtensionsState {
	map: ExtensionMap
};

// Default state.
const state : ExtensionsState = {
	map: {}
};

const getters = { };

const actions = { };

const mutations : MutationTree<ExtensionsState> = {
	add(state: ExtensionsState, map: ExtensionMap) {
		// Add to extension map.
		Object.keys(map).map(extension => {
			state.map[extension] = map[extension];
		});
	},
	clear(state: ExtensionsState) {
		// Dynamically delete keys.
		Object.keys(state.map).map(extension => {
			delete state.map[extension];
		});
	}
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};