/**
 * @file GitHub API module.
 * @author Francesco Compagnoni
 */

// Imports
import axios from "axios";

// Config
import loadConfig, { Config } from "../Config";
const config : Config = loadConfig();

// Modules
import { Method } from "../../shared/Method";
import { Result, buildResult } from "../../shared/Result";

// Constants
// ...


export async function send(method: "GET" | "POST" | "PUT" | "DELETE", url: string, payload: Object | null) : Promise<Result> {
	try {
		let result = await axios({
			method,
			headers: {
				"Accept": "application/json"
			},
			url,
			data: payload,
			responseType: "json"
		});

		return buildResult(true, result.data);
	} catch (e) {
		return buildResult(false);
	}
}

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