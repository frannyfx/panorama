/**
 * @file Routes handling GitHub requests.
 * @author Francesco Compagnoni
 */

// Imports
import Joi from "joi";
import fs from "fs";
import path from "path";

// Config
import { loadConfig } from "../../../../Config";
const config = loadConfig();

// Modules
import getRoot from "../../../../utils/root";
import { Method } from "../../../../../shared/Method";
import { Route } from "../../Route";
import { Codes, send } from "../../API";
import { getAccessToken } from "../../../../github";

let route : Route[] = [{
	method: Method.GET,
	url: "/api/github/client-id",
	handler: async (request, reply) => {
		send(reply, Codes.OK, {
			clientId: config.github?.clientId
		});
	}
}, {
	method: Method.GET,
	url: "/api/github/callback",
	handler: async (request, reply) => {
		// Create read stream for callback.html.
		const callback = fs.createReadStream(path.join(getRoot(), config.general.assetsDir, "/pages/callback.html"));
		reply.type("text/html").send(callback);
	}
}, {
	method: Method.GET,
	url: "/api/github/access-token/:code",
	schemas: {
		params: Joi.object({
			code: Joi.string()
		})
	},
	handler: async (request, reply) => {
		// Get access token and return it.
		let result = await getAccessToken(request.params!.code);
		if (!result.status.ok) return send(reply, Codes.GenericError);
		send(reply, Codes.OK, { accessToken: result.result });
	}
}];

export default route;