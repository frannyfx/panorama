/**
 * @file Module to subscribe to live job progress events.
 * @author Francesco Compagnoni
 */

// Modules
import { createAlert } from "./Notifications";
import { i18n } from "../i18n";

// Variables
let socket : WebSocket | null = null;

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
		socket.onclose = () => reject();
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
 * @param ticket The ticket to access the job information.
 * @param accessToken The user's access token.
 */
export async function subscribeToJobProgress(ticket: number, accessToken: string) {
	// Connect the WebSocket. If failure occurs, show error.
	let socket = await getSocket();
	if (!socket) return createAlert("WARNING", i18n.t("analysis.jobProgressSubscriptionFailed.title").toString(), i18n.t("analysis.jobProgressSubscriptionFailed.description").toString());
	
	// Send ticket and access token over the socket.
	socket.send(JSON.stringify({
		ticket, accessToken
	}));

	// ...
}