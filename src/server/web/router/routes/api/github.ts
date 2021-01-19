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
import { Method } from "../../../../../shared/Method";
import { Route } from "../../Route";
import { Codes, send } from "../../API";
import Joi from "joi";

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
	schemas: {
		params: Joi.object({
			code: Joi.string()
		})
	},
	handler: (request: any, response: any) => {
		console.log("Request params:", request.params);
		send(response, Codes.OK);
	}
}];

export default route;