/**
 * @file Handle notification storage and delivery.
 * @author Francesco Compagnoni
 */

// Imports
import Store from "../store";

// Interfaces
export interface NotificationData {
	type: "NORMAL" | "PROGRESS",
	icon: string[],
	title: string,
	description: string,
	dismissable: boolean,
	progress?: {
		value: number,
		status: string
	}
};

export interface Notification {
	id: string,
	expiry: {
		enabled: boolean,
		status: "NORMAL" | "FADING" | "EXPIRED",
		fadeTs: number,
		expiryTs: number
	},
	data: NotificationData
};

export interface NotificationObject {
	[key: string]: Notification
};

// Constants
const NOTIFICATION_DURATION = 8000;
const NOTIFICATION_FADE_BEGIN = 6000;

// - Icons
const INFO_ICON = ["fas", "info-circle"];
const WARNING_ICON = ["fas", "exclamation-circle"];


// Variables
var notificationCounter = 0;
var notificationTimeouts = {}; // TODO: Implement notifications fading.

/**
 * Add a notification to the store.
 * @param notificationData The content of the notification.
 * @return The ID of the notification.
 */
export function addNotification(notificationData : NotificationData) : string {
	// Create unique ID for the notification.
	let notificationId = `notif_${notificationCounter++}`;
	
	// Generate expiry dates.
	let creationDate = new Date();
	let fadeTs = new Date(creationDate).getTime() + NOTIFICATION_FADE_BEGIN;
	let expiryTs = new Date(creationDate).getTime() + NOTIFICATION_DURATION;

	// Create notification.
	let notification : Notification = {
		id: notificationId,
		expiry: {
			enabled: true,
			status: "NORMAL",
			fadeTs,
			expiryTs
		},
		data: notificationData
	};

	// Create timeouts.
	// ...
	//setTimeout(() => Store.commit("Notifications/setExpiryState", { id: notificationId, status: "FADING" }), NOTIFICATION_FADE_BEGIN);
	//setTimeout(() => Store.commit("Notifications/setExpiryState", { id: notificationId, status: "EXPIRED" }), NOTIFICATION_DURATION);

	console.log("Created notification", notification);
	Store.commit("Notifications/add", notification);
	return notificationId;
}

/**
 * Remove a notification from the store.
 * @param notification The notification to remove.
 */
export function removeNotification(notification: Notification) {
	console.log(notification);
	Store.commit("Notifications/remove", notification);
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
		dismissable: true
	});
}