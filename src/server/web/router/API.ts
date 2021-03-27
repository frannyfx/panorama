/**
 * @file API code definitions.
 * @author Francesco Compagnoni
 */

// Imports
import { FastifyReply } from "fastify";
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
	},
	ServerError: {
		ok: false,
		httpCode: 500,
		apiCode: 1004,
		message: "Something went wrong on our end. Please try again later."
	},
	Forbidden: {
		ok: false,
		httpCode: 403,
		apiCode: 1005,
		message: "You are not allowed to view this content."
	},
	NotFound: {
		ok: false,
		httpCode: 404,
		apiCode: 1006,
		message: "This content cannot be found."
	}
};

//export default Codes;

/**
 * Send a formatted API response.
 * @param reply The Fastify reply object to send it with.
 * @param code The API code to return.
 * @param payload The optional payload to send along with the response.
 */
export function send(reply: FastifyReply, code: Code, payload: Data | undefined = undefined, errorDescription: string | undefined = undefined) {
	let response = buildResponse(code, payload, errorDescription);
	reply.code(code.httpCode).header("Content-Type", "application/json").send(response);
}

/**
 * Build a formatted API response.
 * @param reply The Fastify reply object to send it with.
 * @param code The API code to return.
 * @param payload The optional payload to send along with the response.
 */
export function buildResponse(code: Code, payload: Data | undefined = undefined, errorDescription: string | undefined = undefined) : Response {
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
	return response;
}