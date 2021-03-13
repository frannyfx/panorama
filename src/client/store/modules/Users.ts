/**
 * @file Store module that contains user data.
 * @author Francesco Compagnoni
 */

// Imports
import { MutationTree } from "vuex";

// Modules
import { User, UserObject } from "../../modules/models/User";
import config from "../../config";

// State interface.
export interface UsersState {
	list: User[],
	object: UserObject
};

// Default state.
const state : UsersState = {
	list: [] as User[],
	object: {} as UserObject
};

const getters = { };

const actions = { };

const mutations : MutationTree<UsersState> = {
	add(state: UsersState, data: User[]) {
		
	},
	clear(state: UsersState) {
		// Dynamically delete keys (Vue components will react accordingly).
		Object.keys(state.object).map(key => {
			delete state.object[key];
		});

		// Remove all elements from the list.
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