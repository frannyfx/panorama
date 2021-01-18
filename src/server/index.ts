/**
 * @file Server entry point.
 * @author Francesco Compagnoni
 */

import web from "./web";

// Imports
const logger = require("./utils/logger")("main");

/**
 * Initialise the backend.
 */
async function initialise() {
	logger.info("Initialising...");
	await web.start();
	logger.success("Initialisation complete.");
}

// Initialise the backend.
initialise();

// Catch uncaught exceptions.
process.on("uncaughtException", (err : Error) => {
	logger.error(`Uncaught exception: ${err.stack}\nExiting.`);
	process.exit(1);
});

// Catch unhandled promise rejections.
process.on("unhandledRejection", (err : Error) => {
	logger.error(`Unhandled promise rejection: ${err.stack}\nExiting.`);
	process.exit(1);
});