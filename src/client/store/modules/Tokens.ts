/**
 * @file Store module that contains token map data.
 * @author Francesco Compagnoni
 */

// Imports
import { MutationTree } from "vuex";

// Models
import { TokenMap } from "../../../shared/models/TokenType";

// State interface.
export interface TokensState {
	map: TokenMap
};

// Default state.
const state : TokensState = {
	map: {}
};

const getters = { };

const actions = { };

const mutations : MutationTree<TokensState> = {
	add(state: TokensState, data: { map: TokenMap }) {
		// Add to token map.
		Object.keys(data.map).map(token => {
			state.map[token] = data.map[token];
		});
	},
	clear(state: TokensState) {
		// Dynamically delete keys.
		Object.keys(state.map).map(token => {
			delete state.map[token];
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