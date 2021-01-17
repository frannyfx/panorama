/**
 * @file Defines the structure of the config file loaded by the server.
 * @author Francesco Compagnoni
 */

export interface Config {
	database?: {
		host: string,
		user: string,
		password: string,
		name: string
	},
	web: {
		router: {
			routeDirs: Array<string>
		},
		publicDir: string,
		address: string,
		port: number
	},
	lexing: {
		langDirs: Array<string>
	}
};

