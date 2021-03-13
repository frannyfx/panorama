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
	map: ExtensionMap,
	unknown: string[]
};

// Default state.
const state : ExtensionsState = {
	map: {},
	unknown: []
};

const getters = { };

const actions = { };

const mutations : MutationTree<ExtensionsState> = {
	add(state: ExtensionsState, data: { map: ExtensionMap, unknown: string[] }) {
		// Add to extension map.
		Object.keys(data.map).map(extension => {
			state.map[extension] = data.map[extension];
		});

		// Add unknown extensions.
		state.unknown.push(...data.unknown);
	},
	clear(state: ExtensionsState) {
		// Dynamically delete keys.
		Object.keys(state.map).map(extension => {
			delete state.map[extension];
		});

		// Remove unknown extensions.
		state.unknown.splice(0, state.unknown.length);
	}
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};