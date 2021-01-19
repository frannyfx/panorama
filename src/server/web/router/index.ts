/**
 * @file Modular Fastify router.
 * @author Francesco Compagnoni
 */

// Imports
import { promises as fs } from "fs";
import { ObjectSchema } from "joi";
import path from "path";

// Modules
const logger = require("../../utils/logger")("router");
import { Method } from "../../../shared/Method";
import { buildResult, Data, Result } from "../../../shared/Result";
import { Handler, Route } from "./Route";
import route from "./routes/root";
import { Codes, send } from "./API";

// Constants
const jsRegex = /([a-zA-Z0-9\s_\\.\-\(\):])+(.js)$/;

// Interfaces
export interface Options {
	directories: Array<string>
};

/**
 * Validate the authentication of a user with a request.
 * @param request The request containing the authentication details to be validated.
 */
function verifyAuth(request : any) {
	// TODO: Verify authentication.
}

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
function registerRoute(fastify: any, route: Route) {
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
	default: {
		register = null;
		logger.warn(`Unsupported route method ${Method[route.method]} for route ${route.url}.`);
		break;
	}
	}

	// Prevent continuing if register was not selected.
	if (!register) return;

	// Register the route.
	logger.success(`Route ${Method[route.method]} ${route.url} registered successfully.`);
	register(route.url, wrapRoute(route));
}

/**
 * Wrap a route in a function that handles all verification specified.
 * @param route The route to wrap.
 */
function wrapRoute(route : Route) : Function {
	return async (request : any, response : any) => {
		// Verify authentication.
		// ...

		// Verify rate limiting.
		// ...

		// Verify schemas.
		let schemasResult = await verifySchemas(route, request);
		if (!schemasResult.status.ok) {
			return send(response, Codes.BadRequest, undefined, schemasResult.status.message);
		}

		// - Set existing schemas to validated schemas.
		request.query = schemasResult.result?.query;
		request.params = schemasResult.result?.params;
		request.body = schemasResult.result?.body;

		// Call route handler.
		try {
			route.handler(request, response);
		} catch (e) {
			logger.error(`Unhandled error at route ${Method[route.method]} ${route.url} - ${e.message}.`);
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
	// Load the routes.
	let routes = (await Promise.all(options.directories.map(directory => loadRoutes(directory)))).flat();

	// Register the routes.
	routes.map(route => registerRoute(fastify, route));
	done();
}