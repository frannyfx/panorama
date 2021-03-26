/**
 * @file Modular Fastify router.
 * @author Francesco Compagnoni
 */

// Imports
import { promises as fs } from "fs";
import { ObjectSchema } from "joi";
import path from "path";
import websocket from "fastify-websocket";

// Logger
import createLogger from "../../utils/logger";
const logger = createLogger("router");

// Modules
import { Method } from "../../../shared/Method";
import { buildResult, Data, Result } from "../../../shared/Result";
import { Auth, Handler, Request, Route } from "./Route";
import { Codes, send } from "./API";
import { SocketStream } from "fastify-websocket";

// Constants
const jsRegex = /([a-zA-Z0-9\s_\\.\-\(\):])+(.js)$/;

export interface Options {
	directories: Array<string>,
	verifyAuth?: (request: any) => Promise<Auth>
};

async function verifySchema(schema: ObjectSchema, payload: Data) : Promise<Result> {
	try {
		let validated = await schema.validateAsync(payload);
		return buildResult(true, validated);
	} catch (e) {
		return buildResult(false, undefined, e.details[0].message);
	}
}

/**
 * Validate the schemas detailing the structure of the parameters and body in the route using Joi.
 * @param route The route being validated.
 * @param request The request containing the payload to be validated.
 * @returns 
 */
async function verifySchemas(route: Route, request: any) : Promise<Result> {
	// Validate all schemas.
	let query, params, body;
	if (route.schemas?.query)
		query = await verifySchema(route.schemas?.query, request.query);

	if (route.schemas?.params)
		params = await verifySchema(route.schemas?.params, request.params);
	
	if (route.schemas?.body)
		body = await verifySchema(route.schemas?.body, request.body);

	// Return errors.
	if (query && !query.status.ok)
		return query;

	if (params && !params.status.ok)
		return params;

	if (body && !body.status.ok)
		return body;

	// Otherwise, return validated data.
	return buildResult(true, {
		query: query?.result, params: params?.result, body: body?.result
	});
}

/**
 * Register a route to Fastify.
 * @param fastify The Fastify instance to register the route to.
 * @param route The route being registered.
 */
function registerRoute(fastify: any, route: Route, options: Options) {
	// Select the correct Fastify register function.
	var register : Function | null;
	
	switch (route.method) {
	case Method.GET: {
		register = (url: string, handler: Handler) => fastify.get(url, handler);
		break;
	}
	case Method.POST: {
		register = (url: string, handler: Handler) => fastify.post(url, handler);
		break;
	}
	case Method.DELETE: {
		register = (url: string, handler: Handler) => fastify.delete(url, handler);
		break;
	}
	case Method.PUT: {
		register = (url: string, handler: Handler) => fastify.put(url, handler);
		break;
	}
	case Method.WS: {
		register = (url: string, handler: Handler) => fastify.get(url, { websocket: true }, handler);
		break;
	}
	default: {
		register = null;
		logger.warn(`Unsupported route method ${Method[route.method]} for route ${route.url}.`);
		break;
	}
	}

	// Prevent continuing if register was not selected.
	if (!register) return;

	// Register the route.
	logger.info(`${Method[route.method]} ${route.url}`);
	register(route.url, wrapRoute(route, options));
}

/**
 * Wrap a route in a function that handles all verification specified.
 * @param route The route to wrap.
 */
function wrapRoute(route : Route, options: Options) : Function {
	return async (request : any, response : any) => {
		// Create a new request payload, setting the old payload as the original request.
		let newRequest : Request = {};

		// Verify authentication.
		if (options.verifyAuth && route.auth! === true) {
			// Call the verify auth function specified in the options.
			let auth = await options.verifyAuth(request);
			if (!auth.ok) {
				return send(response, Codes.NoAuth);
			}

			// Set the auth field in the request.
			newRequest.auth = auth;
		}
			

		// Verify rate limiting.
		// ...

		// Verify schemas.
		if (route.schemas) {
			// Call the verify schemas function.
			let schemasResult = await verifySchemas(route, request);
			if (!schemasResult.status.ok) {
				return send(response, Codes.BadRequest, undefined, schemasResult.status.message);
			}

			// Set schemas in the new request to the results of the validated schemas.
			newRequest.query = schemasResult.result?.query;
			newRequest.params = schemasResult.result?.params;
			newRequest.body = schemasResult.result?.body;
		}
		
		// Handle exceptions thrown inside route handlers.
		try {
			// Handle WS.
			if (route.method == Method.WS) {
				// Rename parameters.
				let connection : SocketStream = request;
				request = response;
	
				// Set parameters
				newRequest.connection = connection;
				newRequest.request = request;
	
				// Call open event immediately.
				route.on!.open(connection, newRequest);

				// Set other events.
				if (route.on?.message) connection.socket.on("message", (message : string) => route.on!.message(connection, message));
				if (route.on?.close) connection.socket.on("close", (event: any) => route.on!.close(connection, event));
			} else {
				// Call regular HTTP requests.
				newRequest.request = request;
				
				// Ensure the handler is awaited if it's a promise, otherwise we won't catch exceptions.
				await route.handler!(newRequest, response);
			}
		} catch (e) {
			logger.error(`Unhandled error at route ${Method[route.method]} ${route.url} - ${e.message}.`);
			send(response, Codes.ServerError);
		}
	};
}

/**
 * Check if an object is actually a route.
 * @param route The route to validate.
 */
function isRoute(route: any): route is Route {
	return route; // TODO: Validate the routes.
}

/**
 * Recursively load all valid routes in a directory.
 * @param directory The directory to search.
 */
async function loadRoutes(directory: string) : Promise<Array<Route>> {
	// Read the directory.
	var entities;
	try {
		entities = await fs.readdir(directory, { withFileTypes: true });
	} catch (e) {
		// If we fail to read the directory, return an empty array.
		return [];
	}

	// Find the sub-directories and recursively search them.
	let recursive: Array<Array<Route>> = await Promise.all(entities.filter(entity => entity.isDirectory()).map(dir => {
		return loadRoutes(path.join(directory, dir.name));
	}));

	// Filter out non-JS files and invalid routes.
	let routes = await Promise.all(entities.filter(entity => entity.isFile() && entity.name.match(jsRegex)).map(async file => {
		// Validate the route and flatten sub-routes.
		var route = (await import(path.join(directory, file.name))).default;
		if (!Array.isArray(route))
			route = [route];

		return route.filter((subRoute: any) => isRoute(subRoute));
	}));

	// Expand the sub-arrays of routes.
	let final: Array<Route> = [];
	let expandedRoutes: Array<Array<Route>> = routes.filter(route => !Array.isArray(route));
	routes.filter(route => Array.isArray(route)).map(routeArray => expandedRoutes.push(...routeArray));
	return final.concat.apply(expandedRoutes, recursive);
}

export default async function (fastify: any, options: Options, done: Function) {
	// Load dependencies
	await fastify.register(websocket);

	// Load the routes.
	let routes = (await Promise.all(options.directories.map(directory => loadRoutes(directory)))).flat();

	// Register the routes.
	logger.info("Registering routes...");
	routes.map(route => registerRoute(fastify, route, options));
	done();
}