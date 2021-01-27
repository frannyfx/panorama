/**
 * @file GitHub API module.
 * @author Francesco Compagnoni
 */

// Imports
import axios, { AxiosBasicCredentials } from "axios";

// Config
import loadConfig, { Config } from "../Config";
const config : Config = loadConfig();

// Modules
import { Method } from "../../shared/Method";
import { Result, buildResult } from "../../shared/Result";

// Constants
// ...

/**
 * 
 * @param method 
 * @param url 
 * @param payload 
 * @param auth 
 */
export async function send(method: "GET" | "POST" | "PUT" | "DELETE", url: string, payload: Object | undefined = undefined, auth: AxiosBasicCredentials | undefined = undefined) : Promise<Result> {
	try {
		let result = await axios({
			method,
			auth,
			headers: {
				"Accept": "application/json"
			},
			url,
			data: payload,
			responseType: "json"
		});

		return buildResult(true, result.data);
	} catch (e) {
		return buildResult(false, e.response);
	}
}

/**
 * 
 * @param accessToken 
 */
export async function checkAuth(accessToken: string) : Promise<Result> {
	// Get data associated with the access token from GitHub.
	let response = await send("POST", `https://api.github.com/applications/${config.github!.clientId}/token`, {
		access_token: accessToken
	}, {
		username: config.github!.clientId,
		password: config.github!.clientSecret
	});

	// Check if an error has occurred in checking the auth.
	if (!response.status.ok) return buildResult(false);

	// Check that the returned token is the same.
	if (accessToken != response.result?.token) return buildResult(false);
	return buildResult(true, response.result);
}

/**
 * 
 * @param code 
 */
export async function getAccessToken(code: string) : Promise<Result> {
	// Get response data.
	let response = await send("POST", "https://github.com/login/oauth/access_token", {
		client_id: config.github?.clientId,
		client_secret: config.github?.clientSecret,
		code
	});

	// Check if an error has occurred.
	if (!response.status.ok)
		return response;

	// Check if GitHub returned an error.
	if (response.result?.error)
		return buildResult(false, undefined, response.result?.error);

	// Return the token.
	let result = {
		accessToken: response.result?.access_token,
		scope: response.result?.scope,
		tokenType: response.result?.token_type
	};

	return buildResult(true, result);
}