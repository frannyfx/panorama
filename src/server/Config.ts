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
	database?: {
		host: string,
		user: string,
		password: string,
		name: string
	},
	github?: {
		clientId: string,
		clientSecret: string
	},
	web: {
		router: {
			routeDirs: Array<string>
		},
		publicDir: string,
		assetsDir: string,
		address: string,
		port: number
	},
	lexing: {
		langDirs: Array<string>
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