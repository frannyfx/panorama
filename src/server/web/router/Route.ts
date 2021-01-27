/**
 * @file Route interface.
 * @author Francesco Compagnoni
 */

// Imports
import Joi from "joi";

// Modules
import { Method } from "../../../shared/Method";
import { Data } from "../../../shared/Result";

// The interface for the processed request payload.
export interface Request {
	query?: Data,
	params?: Data,
	body?: Data,
	auth?: Auth
	request: any
};

// The interface for authentication data.
export interface Auth {
	ok: boolean,
	payload?: Data
}

// The interface for the route handler function.
export interface Handler {
	(request: Request, response: any): void
};

// The interface for the route.
export interface Route {
	method: Method,
	url: string,
	auth?: Boolean,
	handler: Handler,
	schemas?: {
		params?: Joi.ObjectSchema,
		body?: Joi.ObjectSchema,
		query?: Joi.ObjectSchema
	}
};