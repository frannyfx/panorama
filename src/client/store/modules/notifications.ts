/**
 * @file Store module that contains notification data.
 * @author Francesco Compagnoni
 */

// Imports
import { MutationTree } from "vuex";

// Modules
import { Notification, NotificationObject} from "../../modules/Notifications";

export interface NotificationsState {
	list: Notification[],
	object: NotificationObject
};

const state : NotificationsState = {
	list: [] as Notification[],
	object: {} as NotificationObject
};

const getters = {

};

const actions = {

};

const mutations : MutationTree<NotificationsState> = {
	add(state, notification : Notification) {
		state.list.unshift(notification);
		state.object[notification.id] = notification;
	},
	remove(state, notification: Notification) {
		state.list.splice(state.list.indexOf(notification), 1);
		delete state.object[notification.id];
	},
	setExpiryState(state, data) {
		state.object[data.id].expiry.status = data.status;
	}
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};