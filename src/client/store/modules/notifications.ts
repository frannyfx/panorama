/**
 * @file Store module that contains notification data.
 * @author Francesco Compagnoni
 */

// Imports
import { MutationTree } from "vuex";

// Modules
import { Notification, NotificationData, NotificationsObject} from "../../modules/Notifications";

// State interface.
export interface NotificationsState {
	list: Notification[],
	object: NotificationsObject
};

// Default state.
const state : NotificationsState = {
	list: [] as Notification[],
	object: {} as NotificationsObject
};

const getters = { };

const actions = { };

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
		state.list.splice(notificationIndex, 1);
		state.object[notification.id].removed = true;
	},
	removeAll(state) {
		state.list.splice(0, state.list.length - 1);
	},
	updateNotificationProgress(state, data : any) {
		// The notification does not exist, return.
		if (!state.object[data.id] || state.object[data.id].data.type != "PROGRESS") return;

		// Replace the data inside the notification with the new data.
		state.object[data.id].data.progress = data.progress;
	},
	deleteData(state, notification: Notification) {
		delete state.object[notification.id];
	},
	deleteAllData(state) {
		Object.keys(state.object).map(notificationId => delete state.object[notificationId]);
	},
	setExpiryEnabled(state, data) {
		state.object[data.id].expiry.enabled = data.enabled;
	},
	setExpiryStatus(state, data) {
		state.object[data.id].expiry.status = data.status;
	},
	setDismissable(state, data) {
		state.object[data.id].data.dismissable = data.dismissable;
	},
	setDataExpiry(state, data) {
		state.object[data.id].data.expiry = data.expiry;
	}
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};