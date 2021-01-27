/**
 * @file Routes handling authentication.
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
import { Request, Route } from "../../Route";
import { Codes, send } from "../../API";

let route : Array<Route> = [{
	method: Method.GET,
	url: "/api/auth",
	auth: true,
	handler: async (request: Request, response: any) => {
		send(response, Codes.OK);
	}
}];

export default route;