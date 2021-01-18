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
const logger = require("../utils/logger")("web");

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
		directories: config.web.router.routeDirs.map(dir => path.join(getRoot(), dir))
	});

	let address = await webServer.listen(config.web.port, config.web.address);
	logger.success(`Successfully started web server at ${address}.`);
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