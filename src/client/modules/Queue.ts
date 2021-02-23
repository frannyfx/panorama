/**
 * @file Module to subscribe to live job progress events.
 * @author Francesco Compagnoni
 */

// Modules
import { addNotification, createAlert, Notification, NotificationData, toggleNotificationExpiry } from "./Notifications";
import { i18n } from "../i18n";
import { Response } from "../../shared/Response";
import Store from "../store";
import Notifications from "../store/modules/Notifications";
import { AnalysisStage, RepoJobProgress } from "../../shared/Queue";

// Interfaces
interface NotificationMap {
	[key: string]: string
};

interface QueueJob {
	jobId: string,
	repositoryName: string,
	notificationId: string,
};

interface JobMap {
	[key: string]: QueueJob
};

// Variables
let socket : WebSocket | null = null;
let subscribedJobs : JobMap = {};

/**
 * Get the URL of the socket depending on the current protocol used to load the page.
 */
function getSocketURL() : string {
	return `${window.location.protocol == "https:" ? "wss:" : "ws:"}//${window.location.host}/api/queue/updates`;
}

/**
 * Connect the socket.
 */
async function connect() : Promise<void> {
	return new Promise((resolve, reject) => {
		socket = new WebSocket(getSocketURL());
		socket.onopen = () => resolve();
		socket.onmessage = (event: MessageEvent<any>) => onMessage(event);
		socket.onclose = () => reject();
	});
}

/**
 * Handle progress reporting.
 * @param event The message event received by the socket.
 */
async function onMessage(event : MessageEvent) {
	// Serialise data from socket.
	var data : Response | null = null;
	try {
		data = JSON.parse(event.data);
	} catch (e) {
		console.warn("Invalid data received from server.");
	}

	console.log("New progress", data);

	// Fail if data was invalid.
	if (!data || !data.status.ok || !subscribedJobs[data.result!.jobId]) return;

	// Get the job information.
	let job = subscribedJobs[data.result!.jobId];

	// Get the notification.
	let notification = Notifications.state.object[job.notificationId];

	// Make the notification expire and dismissable if the job has terminated.
	if (data.result!.status == "succeeded" || data.result!.status == "failed") {
		// Make dismissable and enable the expiry in the data section to prevent hoevering from glitching out.
		Store.commit("Notifications/setDismissable", { id: notification.id, dismissable: true });
		Store.commit("Notifications/setDataExpiry", { id: notification.id, expiry: true });

		// Toggle expiry.
		toggleNotificationExpiry(notification, true);

		// Remove the job from the list of subscribed jobs.
		delete subscribedJobs[job.jobId];
	}

	// Check if the job has failed.
	if (data.result!.status == "failed") {
		console.warn("Job failed!", job.jobId);
		
		// Create localised alert.
		createAlert("WARNING", i18n.t("alerts.analysisFailed.title").toString(), i18n.t("alerts.analysisFailed.description", [job.repositoryName]).toString());
		return;
	}

	// Parse progress.
	let progress : RepoJobProgress = data.result!.progress;
	if (!progress) return;

	// Get i18n strings.
	let statusString = i18n.t(`alerts.analysis.progress.${AnalysisStage[progress.stage]}`).toString();

	// Parse socket data.
	Store.commit("Notifications/updateNotificationProgress", {
		id: notification.id,
		progress: {
			value: progress.value,
			status: statusString
		}
	});
}

/**
 * Either connect to the socket or return the existing connected socket.
 */
async function getSocket() : Promise<WebSocket | null> {
	// If socket is null or not connected, create new socket.
	if (!socket || socket.readyState != 1)
		await connect();

	// Return socket.
	return socket;
}

/**
 * Subscribe to job events using the generated job ticket and the user's access token.
 * @param name The name of the repository being analysed.
 * @param jobId The ID of the job in the queue.
 * @param ticket The ticket to access the job information.
 * @param accessToken The user's access token.
 */
export async function subscribeToJobProgress(name: string, jobId: string, ticket: string, accessToken: string) {
	// Connect the WebSocket. If failure occurs, show error.
	let socket = await getSocket();
	if (!socket) return createAlert("WARNING", i18n.t("analysis.jobProgressSubscriptionFailed.title").toString(), i18n.t("analysis.jobProgressSubscriptionFailed.description").toString());
	
	// Send ticket and access token over the socket.
	socket.send(JSON.stringify({
		ticket, accessToken
	}));

	// Create notification.
	let notificationId = addNotification({
		type: "PROGRESS",
		title: i18n.t("alerts.analysis.title", [name]).toString(),
		dismissable: false,
		expiry: false,
		progress: {
			value: 0,
			status: i18n.t("alerts.analysis.progress.Starting").toString()
		},
		icon: ["fab", "github"]
	});

	// Map the job ID to the ID of the notification representing its progress.
	subscribedJobs[jobId] = {
		jobId,
		repositoryName: name,
		notificationId
	};
}