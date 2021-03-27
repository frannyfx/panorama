/**
 * @file Route interface.
 * @author Francesco Compagnoni
 */

// Imports
import { FastifyReply, FastifyRequest } from "fastify";
import { SocketStream } from "fastify-websocket";
import Joi from "joi";

// Modules
import { Method } from "../../../shared/Method";
import { Data } from "../../../shared/Result";
import { User } from "../../github";

// The interface for the processed request payload.
export interface Request {
	query?: Data,
	params?: Data,
	body?: Data,
	auth?: Auth,
	request?: FastifyRequest,
	connection?: SocketStream,
	locale?: string
};

// The interface for authentication data.
export interface Auth {
	ok: boolean,
	token?: string,
	payload?: User
}

// The interface for the route handler function.
export type Handler = (request: Request, reply: FastifyReply) => Promise<unknown>;

// The interface for the route.
export interface Route {
	method: Method,
	url: string,
	auth?: Boolean,
	handler?: Handler,
	schemas?: {
		params?: Joi.ObjectSchema,
		body?: Joi.ObjectSchema,
		query?: Joi.ObjectSchema
	},
	on?: {
		open: Function,
		message: Function,
		close: Function
	}
};