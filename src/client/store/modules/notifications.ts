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
		// If it's already been deleted, return.
		if (!state.object[notification.id]) return;

		// Find the index of the notification with the ID of the one to delete.
		let notificationIndex = state.list.map(notification => notification.id).indexOf(notification.id);
		if (notificationIndex == -1)
			return;

		// Remove the notification from the list and set the removed flag.
		// (!) We don't actually delete the notification data here as it may still be visible in Vue.
		// Deletion of the data is lazy and deferred until later.
		state.list.splice(state.list.indexOf(notification), 1);
		state.object[notification.id].removed = true;
	},
	deleteData(state, notification: Notification) {
		delete state.object[notification.id];
	},
	setExpiryEnabled(state, data) {
		state.object[data.id].expiry.enabled = data.enabled;
	},
	setExpiryStatus(state, data) {
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