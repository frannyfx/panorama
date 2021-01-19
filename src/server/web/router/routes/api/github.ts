/**
 * @file Routes handling GitHub requests.
 * @author Francesco Compagnoni
 */

// Imports
import Joi from "joi";

// Config
import loadConfig, { Config } from "../../../../Config";
const config : Config = loadConfig();

// Modules
import { Method } from "../../../../../shared/Method";
import { Route } from "../../Route";
import { Codes, send } from "../../API";
import { getAccessToken } from "../../../../github";

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
		query: Joi.object({
			code: Joi.string()
		})
	},
	handler: async (request: any, response: any) => {
		let result = await getAccessToken(request.query.code);
		if (!result.status.ok) return send(response, Codes.GenericError);
		send(response, Codes.OK, result.result);
	}
}];

export default route;