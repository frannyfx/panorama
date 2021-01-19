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
		ok: Boolean,
		message?: string
	},
	result?: Data
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