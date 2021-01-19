/**
 * @file Generic interface for passing data between functions.
 * @author Francesco Compagnoni
 */

// Generic payload interface.
export interface Data {
	[key: string]: any
};

// Result interface.
export interface Result {
	status: {
		ok: boolean,
		message?: string
	},
	result?: Data
}

/**
 * Type guard for Result objects.
 * @param obj The object to determine whether it is a Result.
 */
export function isResult(obj: any): obj is Result {
	// Validate status.
	if (!obj.status || typeof obj.status != "object") return false;

	// Validate OK.
	if (obj.status.ok === undefined || typeof obj.status.ok != "boolean") return false;

	// Validate message.
	if (obj.status.message && typeof obj.status.message != "string") return false;

	// No need to validate the payload, hence return true.
	return true;
}

/**
 * Build a result.
 * @param ok Whether the request returned successfully.
 * @param result The payload.
 * @param message A string associated with the possible error.
 */
export function buildResult(ok: boolean, result: Data | undefined = undefined, message: string | undefined = undefined) : Result {
	return {
		status: {
			ok,
			message
		},
		result
	};
}