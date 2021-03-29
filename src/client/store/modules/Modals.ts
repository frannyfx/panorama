/**
 * @file Store module that contains modals (pop-ups).
 * @author Francesco Compagnoni
 */

// Imports
import { MutationTree } from "vuex";
import { Modal, ModalsObject } from "../../modules/Modal";

// Modules
// ...

// State interface.
export interface ModalsState {
	list: Modal[],
	object: ModalsObject
};

// Default state.
const state : ModalsState = {
	list: [] as Modal[],
	object: {} as ModalsObject
};

const getters = { };

const actions = { };

const mutations : MutationTree<ModalsState> = {
	add(state, modal : Modal) {
		state.list.unshift(modal);
		state.object[modal.id] = modal;
	},
	remove(state, modal: Modal) {
		// If it's already been deleted, return.
		if (!state.object[modal.id]) return;

		// Find the index of the modal with the ID of the one to delete.
		let modalIndex = state.list.map(modal => modal.id).indexOf(modal.id);
		if (modalIndex == -1)
			return;

		// Remove the modal from the list.
		// (!) Lazy deletion is used here just like in the Notifications Vuex module to allow animations to play before 
		// the data about the modal is removed.
		state.list.splice(modalIndex, 1);
	},
	removeAll(state) {
		state.list.splice(0, state.list.length);
	},
	deleteData(state, modal: Modal) {
		delete state.object[modal.id];
	},
	deleteAllData(state) {
		Object.keys(state.object).map(modalId => delete state.object[modalId]);
	}
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};