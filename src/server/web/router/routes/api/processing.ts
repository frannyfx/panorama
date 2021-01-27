/**
 * @file Routes handling requests to process repositories.
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
import { Method } from "../../../../../shared/Method";
import { Route } from "../../Route";
import { Codes, send } from "../../API";

let route : Array<Route> = [{
	method: Method.POST,
	url: "/api/repo",
	handler: (request: any, response: any) => {
		send(response, Codes.OK, {
			clientId: config.github?.clientId
		});
	}
}];

export default route;