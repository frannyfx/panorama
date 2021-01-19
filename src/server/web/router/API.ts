/**
 * @file API code definitions.
 * @author Francesco Compagnoni
 */

// Imports
import { Response } from "../../../shared/Response";

// API code interface.
export interface Code {
	ok: Boolean,
	httpCode: number,
	apiCode: number,
	message: string
};

// API codes dictionary interface.
export interface API {
	[key: string]: Code
};

// API codes definition.
export const Codes : API = {
	OK: {
		ok: true,
		httpCode: 200,
		apiCode: 1000,
		message: ""
	}
};

/**
 * Send a formatted API response.
 * @param reply The Fastify reply object to send it with.
 * @param code The API code to return.
 * @param payload The optional payload to send along with the response.
 */
export function send(reply: any, code: Code, payload: Object | null = null) {
	// Build response.
	let response : Response = {
		status: {
			ok: code.ok,
		}
	};
	
	// Set payload if not undefined.
	if (payload) response.result = payload;

	// Set error if code is not OK.
	if (!code.ok) response.status.error = {
		code: code.apiCode,
		message: code.message
	};

	// Send the response.
	reply.code(code.httpCode).header("Content-Type", "application/json").send(response);
}