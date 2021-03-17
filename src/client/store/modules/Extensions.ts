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
	typeMap: ExtensionMap,
	unknown: string[]
};

// Default state.
const state : ExtensionsState = {
	map: {},
	typeMap: {},
	unknown: []
};

const getters = { };

const actions = { };

const mutations : MutationTree<ExtensionsState> = {
	add(state: ExtensionsState, data: { map: ExtensionMap, unknown: string[] }) {
		// Add to extension map.
		Object.keys(data.map).map(extension => {
			state.map[extension] = data.map[extension];
			state.typeMap[data.map[extension].typeId] = data.map[extension];
		});

		// Add unknown extensions.
		state.unknown.push(...data.unknown);
	},
	addTypes(state: ExtensionsState, types: ExtensionMap) {
		// Add to type map.
		Object.keys(types).map(type => {
			state.typeMap[type] = types[type];
		});
	},
	clear(state: ExtensionsState) {
		// Dynamically delete keys.
		Object.keys(state.map).map(extension => {
			delete state.map[extension];
			delete state.typeMap[extension];
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