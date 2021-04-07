/**
 * @file The web server.
 * @author Francesco Compagnoni
 */

// Imports
import path from "path";
import fastify, { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

// Logger
import createLogger from "../utils/logger";
const logger = createLogger("web");

// Config
import { loadConfig } from "../Config";
const config = loadConfig();

// Modules
import getRoot from "../utils/root";
import { Auth } from "./router/Route";
import { checkAuth } from "../github";

// Web-server
var webServer : FastifyInstance;

/**
 * Start the web server.
 */
async function start() {
	// Create web server.
	webServer = fastify({
		trustProxy: true,
		ignoreTrailingSlash: true
	});

	// Load static routes.
	await webServer.register(require("fastify-static"), {
		root: path.join(getRoot(), config.web.publicDir)
	});

	// Load dynamic routes.
	await webServer.register(require("./router"), {
		directories: config.web.router.routeDirs.map(dir => path.join(getRoot(), dir)),
		supportedLocales: config.web.supportedLocales,
		notFoundHandler,
		errorHandler,
		verifyAuth
	});

	let address = await webServer.listen(config.web.port, config.web.address);
	logger.success(`Started web server at ${address}.`);
}

/**
 * Validate the authentication of a user with a request.
 * @param request The request containing the authentication details to be validated.
 */
async function verifyAuth(request: FastifyRequest) : Promise<Auth> {
	// Get the Authorization header and check it is formatted properly.
	let header = request.headers.authorization;
	if (!header || typeof header != "string" || header.trim().length == 0)
		return { ok: false };

	try {
		// Extract the token.
		let token = header.split("Bearer")[1].trim();

		// Check whether GitHub recognises the token.
		let authResponse = await checkAuth(token);
		if (!authResponse.status.ok) throw new Error();

		return {
			ok: true,
			token,
			payload: authResponse.result
		};
	} catch (e) {
		return { ok: false };
	}
}

/**
 * The handler for when the router cannot match a request with a route.
 * @param request The request.
 * @param reply The reply.
 */
async function notFoundHandler(request: FastifyRequest, reply: FastifyReply) {
	reply.redirect("/error/notFound");
}

/**
 * General route error handler.
 * @param error The error.
 * @param request The request.
 * @param reply The reply.
 */
async function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
	reply.redirect("/error/general");
}

/**
 * Stop the web server.
 */
async function stop() {
	if (!webServer) return logger.warn("Attempted to stop web server but it not running.");
	await webServer.close();
	logger.info("Stopped web server.");
}

export default {
	start, stop
};