/**
 * @file Defines the structure of the config file loaded by the server.
 * @author Francesco Compagnoni
 */

// Imports
import { promises as fs } from "fs";
import path from "path";

// Modules
import getRoot from "./utils/root";

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
		router: {
			routeDirs: Array<string>	// Directories to scan to find routes.
		},
		publicDir: string,				// Static assets folder.
		address: string,				// Address to bind to.
		port: number					// Port to run the HTTP server on.
	},
	redis: {
		url: string						// URL to connect to Redis server.
	},
	analysis: {
		cache: {
			dir: string,				// Caching directory.
			manifestFilename: string,	// SQLite manifest file name.
			purgeThreshold: string,		// The time interval a repository must remain untouched for it to be evicted from the cache.
			purgePeriodLength: string	// The time interval between each cache purge.
		},
		lexing: {
			langDirs: Array<string>			// Directories to scan to find languages.
		},
	},
	crypto: {
		keyDir: string					// The path where the private key is stored.
	}
};

export default () : Config => {
	// Check if config.json exists before loading the default.
	try {
		return require(path.join(getRoot(), "config.json"));
	} catch (e) {
		return require(path.join(getRoot(), "config.default.json"));
	}
};