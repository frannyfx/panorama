/**
 * @file Route interface.
 * @author Francesco Compagnoni
 */

// Imports
import { FastifyRequest } from "fastify";
import { SocketStream } from "fastify-websocket";
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
	request?: FastifyRequest
	connection?: SocketStream
};

// The interface for authentication data.
export interface Auth {
	ok: boolean,
	token?: string,
	payload?: Data
}

// The interface for the route handler function.
export interface Handler {
	(request: Request, response: any): void
};

/*
export interface EventHandler {
	(connection: SocketStream, request: FastifyRequest): void
}*/

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