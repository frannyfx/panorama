/**
 * @file Server entry point.
 * @author Francesco Compagnoni
 */

// Imports
import figlet from "figlet";

// Modules
const logger = require("./utils/logger")("main");
import web from "./web";
import processing from "./processing";

/**
 * Initialise the backend.
 */
async function initialise() {
	writeHeader();
	try {
		logger.info("Initialising...");
		await web.start();
		await processing.start();
		logger.success("Initialisation complete.");
	} catch (e) {
		logger.error("Unable to initialise Panorama.\nExiting.");
		process.exit(0);
	}
}

async function destroy() {
	await web.stop();
	await processing.stop();
}

/**
 * Output the Panorama header to STDOUT.
 */
function writeHeader() {
	console.log(figlet.textSync("panorama", {
		font: "Small"
	}).trimEnd() + " version 1.0\n\n");
}


// Initialise the backend.
initialise();

// Catch SIGINT (CTRL+C).
process.on("SIGINT", async () => {
	// Print out the log on the next line.
	console.log("");
	logger.info("Received CTRL+C. Exiting...");

	// Allow modules to shut down.
	await destroy();

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