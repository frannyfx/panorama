/**
 * @file Route interface.
 * @author Francesco Compagnoni <compfrancesco@gmail.com>
 */

import Joi from "joi";
import { IncomingMessage } from "http";
import { Method } from "./Method";

export interface Handler {
	(request: IncomingMessage, response: any): void
};

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