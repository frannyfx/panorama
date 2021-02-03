/**
 * @file Route handling homepage requests.
 * @author Francesco Compagnoni
 */

// Imports
import fs from "fs";
import path from "path";
import Joi from "joi";

// Config
import loadConfig, { Config } from "../../../Config";
const config : Config = loadConfig();

// Modules
import getRoot from "../../../utils/root";
import { Method } from "../../../../shared/Method";
import { Route } from "../Route";
import { getValidLocales } from "../..";

/**
 * Return the homepage so Vue history mode works with all pages.
 * @param request The request.
 * @param response The response.
 */
function getIndex(request: any, response: any) {
	// Create read stream for index.html.
	const index = fs.createReadStream(path.join(getRoot(), config.general.assetsDir, "/pages/index.html"));
	response.type("text/html").send(index);
}

let routes : Array<Route> = [{
	method: Method.GET,
	url: "/",
	handler: (request, response) => {
		response.redirect("/en");
	}
}, {
	method: Method.GET,
	url: "/:locale",
	schemas: {
		params: Joi.object({
			locale: Joi.string().valid(...getValidLocales())
		})
	},
	handler: getIndex
}, {
	method: Method.GET,
	url: "/:locale/dashboard",
	schemas: {
		params: Joi.object({
			locale: Joi.string().valid(...getValidLocales())
		})
	},
	handler: getIndex
}, {
	method: Method.GET,
	url: "/:locale/repo/:owner/:repo",
	schemas: {
		params: Joi.object({
			locale: Joi.string().valid(...getValidLocales()),
			owner: Joi.string(),
			repo: Joi.string()
		})
	},
	handler: getIndex
}];

export default routes;