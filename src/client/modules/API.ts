/**
 * @file Module to access the back-end Panorama API.
 * @author Francesco Compagnoni
 */

// Imports
import { Method } from "../../shared/Method";
import { Response, isResponse } from "../../shared/Response";

// Interfaces
interface Params {
	[key: string]: string
};

export interface AuthenticationData {
	accessToken : string | null,
	scope : string | null,
	tokenType: string | null
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

// Token data
let authenticationData : AuthenticationData = {
	accessToken: null, scope: null, tokenType: null
};

/**
 * Load the saved authentication data from local storage.
 */
export function loadAuthenticationData() : AuthenticationData {
	console.log("Loading authentication data...");
	authenticationData.accessToken = window.localStorage.getItem("accessToken");
	authenticationData.scope = window.localStorage.getItem("scope");
	authenticationData.tokenType = window.localStorage.getItem("tokenType");

	console.log(authenticationData);
	return authenticationData;
}

/**
 * Save the newly received authentication data to local storage.
 * @param data The data being saved. 
 */
export function saveAuthenticationData(data: AuthenticationData) {
	console.log("Saved authentication data.");
	authenticationData = data;
	window.localStorage.setItem("accessToken", data.accessToken!);
	window.localStorage.setItem("scope", data.scope!);
	window.localStorage.setItem("tokenType", data.tokenType!);
}

/**
 * Get the current authentication data.
 */
export function getAuthenticationData() : AuthenticationData {
	return authenticationData;
}

/**
 * Send an API request.
 * @param method The method of the request.
 * @param url The URL of the request, not including /api/.
 * @param payload An optional payload to send as the body of the request.
 */
export async function send(method: Method, url: string, payload: Object | null = null) : Promise<Response> {
	try {
		// Create options dict.
		let options : any = {
			method: Method[method]
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