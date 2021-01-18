/**
 * @file Routes handling GitHub requests.
 * @author Francesco Compagnoni
 */

// Imports
// ...

// Config
import loadConfig, { Config } from "../../../../Config";
const config : Config = loadConfig();

// Modules
import { Method } from "../../Method";
import { Route } from "../../Route";
import { Codes, send } from "../../API";

let route : Array<Route> = [{
	method: Method.GET,
	url: "/api/github/client-id",
	handler: (request: any, response: any) => {
		send(response, Codes.OK, {
			clientId: config.github?.clientId
		});
	}
}, {
	method: Method.GET,
	url: "/api/github/callback",
	handler: (request: any, response: any) => {
		
	}
}];

export default route;