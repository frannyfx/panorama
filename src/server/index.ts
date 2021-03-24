/**
 * @file Server entry point.
 * @author Francesco Compagnoni
 */

// Imports
import figlet from "figlet";

// Logger and config
const logger = require("./utils/logger")("main");
import loadConfig, { Config } from "./Config";
const config : Config = loadConfig();

// Modules
import web from "./web";
import analysis from "./analysis";
import queue from "./analysis/queue";
import database from "./database";

/**
 * Initialise the backend with the selected sub-modules.
 */
async function start() {
	writeHeader();
	try {
		logger.info(`Initialising with web server ${config.web.enabled ? "enabled" : "disabled"}, analysis ${config.analysis.enabled ? "enabled" : "disabled"}.`);

		// Initialise required modules.
		await database.start();
		await queue.start();

		// Enable/disable web-server according to the config file.
		config.web.enabled && await web.start();

		// Enable/disable analysis according to the config file.
		config.analysis.enabled && await analysis.start();
		logger.success("Initialisation complete.");
	} catch (e) {
		logger.error("Unable to initialise Panorama.");
		logger.error(e);
		logger.error("Exiting.");
		process.exit(0);
	}
}

/**
 * Stop Panorama's submodules.
 */
async function stop() {
	await database.stop();
	config.web.enabled && await web.stop();
	config.analysis.enabled && await analysis.stop();
	await queue.stop();
}

/**
 * Output the Panorama header to STDOUT.
 */
function writeHeader() {
	console.log(figlet.textSync("panorama", {
		font: "Standard"
	}) + "\n\n");
}

// Initialise the backend.
start();

// Catch SIGINT (CTRL+C).
process.on("SIGINT", async () => {
	// Print out the log on the next line.
	console.log("");
	logger.info("Received CTRL+C. Exiting...");

	// Allow modules to shut down.
	await stop();

	// Exit.
	logger.info("Bye!");
	process.exit();
});

// Catch uncaught exceptions.
process.on("uncaughtException", (err : Error) => {
	logger.error(`Uncaught exception: ${err.stack}\nExiting.`);
	process.exit(0);
});

// Catch unhandled promise rejections.
process.on("unhandledRejection", (err) => {
	logger.error(`Unhandled promise rejection: ${err}\nExiting.`);
	process.exit(0);
});