/**
 * @file Response definitions.
 * @author Francesco Compagnoni
 */

// Imports
import { Data } from "./Result";

export interface Response {
	status: {
		ok: Boolean,
		error?: {
			code: number,
			message: string,
			description?: string
		}
	},
	result?: Data	
};

/**
 * Type guard for Response objects.
 * @param obj The object to determine whether it is a Response.
 */
export function isResponse(obj: any): obj is Response {
	// Validate status.
	if (!obj.status || typeof obj.status != "object") return false;

	// Validate OK.
	if (obj.status.ok === undefined || typeof obj.status.ok != "boolean") return false;

	// Validate error.
	if (obj.status.error && (obj.status.error.code === undefined || typeof obj.status.error.code != "number" || !obj.status.error.message || typeof obj.status.error.message != "string")) return false;

	// No need to validate the payload, hence return true.
	return true;
}