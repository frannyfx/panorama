/**
 * @file API code definitions.
 * @author Francesco Compagnoni
 */

// Imports
import { Response } from "../../../shared/Response";
import { Data } from "../../../shared/Result";

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
	},
	GenericError: {
		ok: false,
		httpCode: 200,
		apiCode: 1001,
		message: "An unknown error has occurred. Please try again later."
	},
	BadRequest: {
		ok: false,
		httpCode: 400,
		apiCode: 1002,
		message: "Invalid payload."
	},
	NoAuth: {
		ok: false,
		httpCode: 401,
		apiCode: 1003,
		message: "Authentication failed."
	}
};

//export default Codes;

/**
 * Send a formatted API response.
 * @param reply The Fastify reply object to send it with.
 * @param code The API code to return.
 * @param payload The optional payload to send along with the response.
 */
export function send(reply: any, code: Code, payload: Data | undefined = undefined, errorDescription: string | undefined = undefined) {
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

	// Add specific details if available.
	if (response.status.error && errorDescription) response.status.error.description = errorDescription;

	// Send the response.
	reply.code(code.httpCode).header("Content-Type", "application/json").send(response);
}