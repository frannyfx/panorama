/**
 * @file Route handling homepage requests.
 * @author Francesco Compagnoni
 */

// Imports
import fs from "fs";
import path from "path";
import Joi from "joi";

// Config
import { loadConfig } from "../../../Config";
const config = loadConfig();

// Modules
import getRoot from "../../../utils/root";
import { Method } from "../../../../shared/Method";
import { Request, Route } from "../Route";
import { getSupportedLocales } from "../..";
import { FastifyReply } from "fastify";

/**
 * Return the homepage so Vue history mode works with all pages.
 * @param request The request.
 * @param reply The reply.
 */
async function getIndex(request: Request, reply: FastifyReply, code: number = 200) {
	// Check locale only if we're not currently loading the error page.
	if (getSupportedLocales().indexOf(request.params?.locale) == -1) {
		return reply.redirect(`/${request.locale!}/error/NotFound`);
	}

	// Create read stream for index.html.
	const index = fs.createReadStream(path.join(getRoot(), config.general.assetsDir, "/pages/index.html"));
	reply.code(code).type("text/html").send(index);
}

let routes : Array<Route> = [{
	method: Method.GET,
	url: "/",
	handler: async (request, reply) => {
		reply.redirect(`/${request.locale!}`);
	}
}, {
	method: Method.GET,
	url: "/:locale",
	schemas: {
		params: Joi.object({
			locale: Joi.string()
		})
	},
	handler: getIndex
}, {
	method: Method.GET,
	url: "/:locale/dashboard",
	schemas: {
		params: Joi.object({
			locale: Joi.string()
		})
	},
	handler: getIndex
}, {
	method: Method.GET,
	url: "/:locale/repo/:owner/:repo",
	schemas: {
		params: Joi.object({
			locale: Joi.string(),
			owner: Joi.string(),
			repo: Joi.string()
		})
	},
	handler: getIndex
}, {
	method: Method.GET,
	url: "/:locale/error",
	schemas: {
		params: Joi.object({
			locale: Joi.string()
		})
	},
	handler: async (request, reply) => {
		reply.redirect(`/${request.params!.locale}`);
	}
}, {
	method: Method.GET,
	url: "/privacy-policy",
	handler: async (request, reply) => {
		const index = fs.createReadStream(path.join(getRoot(), config.general.assetsDir, "/pages/privacy-policy.html"));
		reply.type("text/html").send(index);
	}
}, {
	method: Method.GET,
	url: "/error/:code",
	schemas: {
		params: Joi.object({
			code: Joi.string()
		})
	},
	handler: async (request, reply) => {
		reply.redirect(`/${request.locale!}/error/${request.params!.code}`);
	}
}, {
	method: Method.GET,
	url: "/:locale/error/:code",
	schemas: {
		params: Joi.object({
			locale: Joi.string(),
			code: Joi.string()
		})
	},
	handler: (request, reply) => getIndex(request, reply, 404)
}];

export default routes;