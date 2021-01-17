/**
 * @file Route interface.
 * @author Francesco Compagnoni <compfrancesco@gmail.com>
 */

// Imports
import Joi from "joi";
import { IncomingMessage } from "http";

// Modules
import { Method } from "./Method";

/**
 * The interface for the route handler function.
 */
export interface Handler {
	(request: IncomingMessage, response: any): void
};

/**
 * The interface for the route.
 */
export interface Route {
	method: Method,
	url: string,
	auth?: Boolean,
	handler: Handler,
	schemas?: {
		params?: Joi.ObjectSchema,
		body?: Joi.ObjectSchema
	}
};