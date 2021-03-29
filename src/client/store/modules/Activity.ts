/**
 * @file Store module that contains activity data.
 * @author Francesco Compagnoni
 */

// Imports
import { MutationTree } from "vuex";

// Models
import { Activity, ActivityMap } from "../../../shared/models/Activity";

// State interface.
export interface ActivityState {
	loaded: boolean,
	list: string[],
	map: ActivityMap
};

// Default state.
const state : ActivityState = {
	loaded: false,
	list: [],
	map: {}
};

const getters = { };

const actions = { };

const mutations : MutationTree<ActivityState> = {
	add(state, data: Activity[]) {
		state.loaded = true;
		data.map(activity => {
			// Map activity ID to activity.
			state.map[activity.id] = activity;

			// Push activity IDs.
			state.list.push(activity.id);
		});
	},
	clear(state) {
		// Set loaded to false.
		state.loaded = false;
		state.list.splice(0, state.list.length);
	},
	deleteData(state, activityIds: string[]) {
		// Lazy delete data to prevent it from disappearing from the UI.
		activityIds.map(activityId => delete state.map[activityId]);
	},
	deleteAll(state) {
		// Delete keys.
		Object.keys(state.map).map(activityId => delete state.map[activityId]);
	}
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};