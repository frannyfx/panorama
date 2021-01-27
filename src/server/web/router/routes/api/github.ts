/**
 * @file Routes handling GitHub requests.
 * @author Francesco Compagnoni
 */

// Imports
import Joi from "joi";
import fs from "fs";
import path from "path";

// Config
import loadConfig, { Config } from "../../../../Config";
const config : Config = loadConfig();

// Modules
import getRoot from "../../../../utils/root";
import { Method } from "../../../../../shared/Method";
import { Request, Route } from "../../Route";
import { Codes, send } from "../../API";
import { getAccessToken } from "../../../../github";

let route : Array<Route> = [{
	method: Method.GET,
	url: "/api/github/client-id",
	handler: (request: Request, response: any) => {
		send(response, Codes.OK, {
			clientId: config.github?.clientId
		});
	}
}, {
	method: Method.GET,
	url: "/api/github/callback",
	handler: async (request: Request, response: any) => {
		// Create read stream for callback.html.
		const callback = fs.createReadStream(path.join(getRoot(), config.web.assetsDir, "callback.html"));
		response.type("text/html").send(callback);
	}
}, {
	method: Method.GET,
	url: "/api/github/access-token/:code",
	schemas: {
		params: Joi.object({
			code: Joi.string()
		})
	},
	handler: async (request: Request, response: any) => {
		// Get access token and return it.
		let result = await getAccessToken(request.params!.code);
		if (!result.status.ok) return send(response, Codes.GenericError);
		send(response, Codes.OK, result.result);
	}
}];

export default route;