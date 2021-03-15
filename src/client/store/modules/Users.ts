/**
 * @file Store module that contains user data.
 * @author Francesco Compagnoni
 */

// Imports
import { MutationTree } from "vuex";

// Modules
import { User, UserObject } from "../../modules/models/User";
import config from "../../config";
import { Data } from "../../../shared/Result";

// State interface.
export interface UsersState {
	list: string[],
	object: UserObject
};

// Default state.
const state : UsersState = {
	list: [] as string[],
	object: {} as UserObject
};

const getters = { };

const actions = { };

const mutations : MutationTree<UsersState> = {
	add(state: UsersState, users: User[]) {
		// Loop through the users.
		users.map(user => {
			// Add user to the list if it does not already exist. 
			if (state.list.indexOf(user.login) == -1) {
				state.list.push(user.login);
				state.object[user.login] = user;
			}
		});
	},
	addSingle(state: UsersState, user: User) {
		// Add user to the list if it does not already exist. 
		if (state.list.indexOf(user.login) == -1) {
			state.list.push(user.login);
			state.object[user.login] = user;
		}
	},
	update(state: UsersState, data: { login: string, enrichedData: Data }) {
		// Add enriched data to existing user.
		state.object[data.login].enrichedData = data.enrichedData == undefined ? undefined : {
			colour: data.enrichedData.colour
		};
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