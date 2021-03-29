/**
 * @file Store module that contains activity data.
 * @author Francesco Compagnoni
 */

// Imports
import { MutationTree } from "vuex";

// Models
import { Activity } from "../../../shared/models/Activity";

// State interface.
export interface ActivityState {
	loaded: boolean,
	list: Activity[]
};

// Default state.
const state : ActivityState = {
	loaded: false,
	list: []
};

const getters = { };

const actions = { };

const mutations : MutationTree<ActivityState> = {
	add(state, data: Activity[]) {
		state.loaded = true;
		state.list.push(...data);
	},
	clear(state) {
		state.loaded = false;
		state.list.splice(0, state.list.length);
	}
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};