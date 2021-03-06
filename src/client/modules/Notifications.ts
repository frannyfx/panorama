/**
 * @file Handle notification storage and delivery.
 * @author Francesco Compagnoni
 */

// Imports
import Store from "../store";

// Modules
import config from "../config";
import { i18n } from "../i18n";

// Interfaces
/**
 * Notification interfaces.
 */
export interface NotificationData {
	type: "NORMAL" | "PROGRESS",
	icon: string[],
	title: string,
	description?: string,
	dismissable: boolean,
	expiry: boolean,
	progress?: {
		value: number,
		status: string
	}
};

export interface Notification {
	id: string,
	expiry: {
		enabled: boolean,
		status: "NORMAL" | "FADING" | "EXPIRED"
	},
	removed: boolean,
	data: NotificationData
};

/**
 * Vuex interfaces.
 */
export interface NotificationsObject {
	[key: string]: Notification
};

/**
 * Internal timeouts interfaces.
 */
export interface NotificationTimeouts {
	fade?: NodeJS.Timeout,
	expiry?: NodeJS.Timeout
};

export interface NotificationTimeoutsObject {
	[key: string]: NotificationTimeouts
};

// - Icons
const INFO_ICON = ["fas", "info-circle"];
const WARNING_ICON = ["fas", "exclamation-circle"];


// Variables
var notificationCounter = 0;
var notificationTimeouts : NotificationTimeoutsObject = {};

/**
 * Add a notification to the store.
 * @param notificationData The content of the notification.
 * @return The ID of the notification.
 */
export function addNotification(notificationData : NotificationData) : string {
	// Create unique ID for the notification.
	let notificationId = `notif_${notificationCounter++}`;

	// Create notification.
	let notification : Notification = {
		id: notificationId,
		expiry: {
			enabled: notificationData.expiry,
			status: "NORMAL"
		},
		removed: false,
		data: notificationData
	};

	// Add to store.
	Store.commit("Notifications/add", notification);

	// Create timeouts.
	toggleNotificationExpiry(notification, notification.expiry.enabled);
	return notificationId;
}

/**
 * Remove a notification from the store.
 * @param notification The notification to remove.
 */
export function removeNotification(notification: Notification) {
	// Clear the notification's timeouts.
	let timeouts = notificationTimeouts[notification.id];
	if (timeouts) {
		if (timeouts.fade) clearTimeout(timeouts.fade);
		if (timeouts.expiry) clearTimeout(timeouts.expiry);
		delete notificationTimeouts[notification.id];
	}
	
	// Remove the notification.
	Store.commit("Notifications/remove", notification);

	// Lazy delete the notification data.
	setTimeout(() => Store.commit("Notifications/deleteData", notification), config.store.lazyDataPurgeDelay);
}

/**
 * Remove all notifications from the store.
 */
export function removeAllNotifications() {
	// Clear and remove timeouts.
	Object.keys(notificationTimeouts).map(notificationId => {
		// Get timeout.
		let timeout = notificationTimeouts[notificationId];

		// Clear timeouts.
		if (timeout.fade) clearTimeout(timeout.fade);
		if (timeout.expiry) clearTimeout(timeout.expiry);

		// Delete key.
		delete notificationTimeouts[notificationId];
	});

	// Remove all notifications.
	Store.commit("Notifications/removeAll");

	// Lazy delete the notification data.
	setTimeout(() => Store.commit("Notifications/deleteAllData"), config.store.lazyDataPurgeDelay);
}

/**
 * Add an alert notification to the store.
 * @param type The type of alert.
 * @param title The title of the alert.
 * @param description The description of the alert.
 */
export function createAlert(type: "INFO" | "WARNING", title: string, description: string) {
	let icon = type == "INFO" ? INFO_ICON : WARNING_ICON;
	return addNotification({
		type: "NORMAL",
		icon,
		title,
		description,
		dismissable: true,
		expiry: true
	});
}

/**
 * Create an internationalised alert.
 * @param type The type of alert.
 * @param alert The i18n domain of the alert.
 */
export function createI18NAlert(type: "INFO" | "WARNING", alert: string, titleStrings: string[] = [], descriptionStrings: string[] = []) {
	return createAlert(type, i18n.t(`alerts.${alert}.title`, titleStrings).toString(), i18n.t(`alerts.${alert}.description`, descriptionStrings).toString());
}

/**
 * Toggle the expiry of a notification, useful for disabling expiry during mouseover events.
 * @param notification The notification to toggle the expiry for.
 * @param enabled Whether expiry will become enabled or disabled.
 */
export function toggleNotificationExpiry(notification: Notification, enabled: boolean) {
	// Prevent accidental re-enabling of the notification by checking the removed flag.
	// This would be triggered by the mouse leaving the notification component in Vue after deletion.
	if (notification.removed) return;
	
	// Get the notification timeouts.
	var timeouts : NotificationTimeouts = notificationTimeouts[notification.id];
	if (!timeouts) timeouts = {
		fade: undefined,
		expiry: undefined
	};	

	// Clear previous timeouts to prevent duplicates.
	if (timeouts.fade) clearTimeout(timeouts.fade);
	if (timeouts.expiry) clearTimeout(timeouts.expiry);

	// Re-enable the timeouts.
	if (enabled) {
		timeouts.fade = setTimeout(() => Store.commit("Notifications/setExpiryStatus", { id: notification.id, status: "FADING" }), config.notifications.fadeStart);
		timeouts.expiry = setTimeout(() => removeNotification(notification), config.notifications.duration);
	} else Store.commit("Notifications/setExpiryStatus", { id: notification.id, status: "NORMAL" });

	// Update the notification in the store.
	if (enabled != notification.expiry.enabled) Store.commit("Notifications/setExpiryEnabled", { id: notification.id, enabled });

	// Set it back in the object.
	notificationTimeouts[notification.id] = timeouts;
}