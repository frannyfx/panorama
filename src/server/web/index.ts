/**
 * @file The web server.
 * @author Francesco Compagnoni
 */

// Imports
import path from "path";
import fastify, { FastifyInstance } from "fastify";

// Config
import loadConfig, { Config } from "../Config";
const config : Config = loadConfig();

// Modules
import getRoot from "../utils/root";
import { Auth, Request } from "./router/Route";
import { checkAuth } from "../github";
const logger = require("../utils/logger")("web");

// Web-server
var webServer : FastifyInstance;

// Constants
const validLocales = ["en", "it", "es"];

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
		verifyAuth
	});

	let address = await webServer.listen(config.web.port, config.web.address);
	logger.success(`Started web server at ${address}.`);
}

/**
 * Validate the authentication of a user with a request.
 * @param request The request containing the authentication details to be validated.
 */
async function verifyAuth(request: any) : Promise<Auth> {
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
 * Return the valid locales for the routes.
 */
export function getValidLocales() {
	return validLocales; 
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