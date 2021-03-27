/**
 * @file Routes handling extension lookup requests.
 * @author Francesco Compagnoni
 */

// Imports
import Joi from "joi";

// Modules
import { Method } from "../../../../../shared/Method";
import { Request, Route } from "../../Route";
import { Codes, send } from "../../API";

// Models
import DatabaseFileType from "../../../../database/models/FileType";

let route : Array<Route> = [{
	method: Method.GET,
	url: "/api/files/extensions",
	schemas: {
		query: Joi.object({
			list: Joi.string()
		})
	},
	handler: async (request, reply) => {
		// Split extensions by commas.
		let extensions = request.query!.list.split(",");

		// Lookup extensions.
		let extensionsMap = await DatabaseFileType.lookupExtensions(extensions);
		send(reply, Codes.OK, extensionsMap);
	}
}, {
	method: Method.GET,
	url: "/api/files/types",
	schemas: {
		query: Joi.object({
			list: Joi.string()
		})
	},
	handler: async (request: Request, reply) => {
		// Split types by commas.
		let types = request.query!.list.split(",");

		// Lookup types.
		let typeMap = await DatabaseFileType.lookupTypes(types);
		send(reply, Codes.OK, typeMap);
	}
}];

export default route;