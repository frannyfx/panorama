/**
 * @file Defines the structure of the config file loaded by the server and handles loading config files.
 * @author Francesco Compagnoni
 */

// Imports
import { ArgumentParser } from "argparse";
import path from "path";
import { Data } from "shared/Result";

// Modules
import getRoot from "./utils/root";

// Argument parser
const parser = new ArgumentParser();
parser.add_argument("-c", "--config");
const configPath = parser.parse_args()["config"];

// Loaded config
let config : Config | null = null;

/**
 * The interface specifying the format of the config file.
 */
export interface Config {
	general: {
		assetsDir: string,				// Static private assets folder.
	},
	database: {
		connection: {
			host: string,				// Host to connect to.
			user: string,				// MySQL username.
			password: string,			// MySQL password.
			name: string,				// Database name.
			charset: string				// Database charset.
		},
		purge: {
			analysisThreshold: string,	// The time interval that must pass since its completion date for an analysis to be evicted from the DB.
			analysisGlitchThreshold: string, // The time interval that must pass for a non-completed analysis since its queue date for it to be considered "glitched".
			repositoryThreshold: string,// The time interval that must pass since its last analysis for a repository to be evicted from the DB.
			userThreshold: string,		// The time interval a user must remain untouched for it to be evicted from the DB.
			periodLength: string		// The time interval between each DB purge.
		}
	},
	github?: {
		clientId: string,				// GitHub App client ID.
		clientSecret: string			// GitHub App secret.
	},
	web: {
		enabled: boolean,				// Whether to enable the web-server.
		router: {
			routeDirs: string[]	// Directories to scan to find routes.
		},
		supportedLocales: string[],		// The list of locales supported by the server.
		publicDir: string,				// Static assets folder.
		address: string,				// Address to bind to.
		port: number					// Port to run the HTTP server on.
	},
	redis: {
		url: string						// URL to connect to Redis server.
	},
	analysis: {
		enabled: boolean,				// Whether to consume analysis jobs.
		cache: {
			dir: string,				// Caching directory.
			manifestFilename: string,	// SQLite manifest file name.
			purgeThreshold: string,		// The time interval a repository must remain untouched for it to be evicted from the cache.
			purgePeriodLength: string	// The time interval between each cache purge.
		},
		lexing: {
			langDirs: string[]			// Directories to scan to find languages.
		},
	},
	crypto: {
		keyDir: string					// The path where the private key is stored.
	}
};

export function loadConfig(configOverride: Data | undefined = undefined, loadTestConfig : boolean = false) : Config {
	// Allow for tests to override the config loaded.
	if (configOverride) config = <Config>configOverride;

	// Return config if it has already been loaded.
	if (config) return config;

	// If the user has specified a config file, return it.
	if (configPath) config = require(path.isAbsolute(configPath) ? configPath : path.join(process.cwd(), configPath));

	// Load test config if flag is true.
	if (loadTestConfig) {
		try {
			config = require(path.join(getRoot(), "panorama.test.json"));
			return config!;
		} catch { 
			console.log("Unable to find panorama.test.json file in the server root directory. Your tests may fail.");
		}
	}

	// Check if config.json exists before loading the default.
	try {
		config = require(path.join(getRoot(), "panorama.json"));
	} catch (e) {
		config = require(path.join(getRoot(), "panorama.default.json"));
	}

	return config!;
};