/**
 * @file Module to access the back-end Panorama API.
 * @author Francesco Compagnoni
 */

// Imports
import { Method } from "../../shared/Method";
import { Response, isResponse } from "../../shared/Response";
import Store from "../store";

// Interfaces
interface Params {
	[key: string]: string
};

// Constants
const defaultResponse : Response = {
	status: {
		ok: false,
		error: {
			code: 0,
			message: "An unknown error has occurred. Please try again later."
		}
	}
};

/**
 * Load the saved access token from local storage.
 */
export function loadAccessToken() {
	let accessToken = window.localStorage.getItem("accessToken");
	Store.commit("setAccessToken", accessToken ? accessToken : "");
}

/**
 * Save the newly received access token to local storage.
 * @param data The data being saved. 
 */
export function saveAccessToken(accessToken: string) {
	Store.commit("setAccessToken", accessToken ? accessToken : "");
	window.localStorage.setItem("accessToken", accessToken);
}

/**
 * Remove saved access token.
 */
export function clearAuthenticationData() {
	Store.commit("setAccessToken", "");
	Store.commit("setAuthStatus", false);

	// Clear it from local storage.
	window.localStorage.removeItem("accessToken");
}

/**
 * Test whether the authentication to GitHub is valid.
 */
export async function testAuthentication() : Promise<Boolean> {
	// Test by getting auth route.
	let response = await send(Method.GET, "auth");
	
	// Set auth value.
	Store.commit("setAuthStatus", response.status.ok);

	// Remove authentication data if found to be invalid.
	if (!response.status.ok) clearAuthenticationData();
	return response.status.ok;
}

/**
 * Send an API request.
 * @param method The method of the request.
 * @param url The URL of the request, not including /api/.
 * @param payload An optional payload to send as the body of the request.
 */
export async function send(method: Method, url: string, payload: Object | null = null) : Promise<Response> {
	try {
		// Create options object.
		let options : any = {
			method: Method[method],
			headers: {
				"Authorization": Store.state.auth.accessToken != "" ? `Bearer ${Store.state.auth.accessToken}` : ""
			} 
		};

		// Add payload if appropriate.
		if (payload && method != Method.GET) {
			options.headers["Content-Type"] = "application/json";
			options.body = JSON.stringify(payload);	
		}

		// Join paths.
		url = `/api${url[0] == "/" ? "" : "/"}${url}`;

		// Send request.
		let result = (await (await fetch(url, options)).json());

		// Check whether the response is valid, otherwise return default response.
		if (!isResponse(result)) throw new Error();
		return result;
	} catch (e) {
		return defaultResponse;
	}
}

/**
 * Inject parameters in a URL format.
 * @param url The URL.
 * @param params The parameters to inject.
 * @return The formatted URL.
 */
export function formatURL(url: string, params: Params) : string {
	// Create match array & vars.
	var match;
	let matches : Array<any> = [];
	const regex = /:[A-Za-z0-9\-]*/g;

	// Loop through matches.
	while((match = regex.exec(url)) !== null) {
		matches.push({
			index: match.index,
			string: match[0]
		});
	}

	// Create new URL.
	var newURL = url;
	matches.map(match => {
		let parameter = encodeURIComponent(params[match.string.substr(1)]);
		newURL = newURL.substr(0, match.index + newURL.length - url.length) + parameter + newURL.substr(match.index + match.string.length + newURL.length - url.length);
	});

	return newURL;
}