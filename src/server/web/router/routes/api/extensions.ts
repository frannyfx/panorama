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
	url: "/api/extensions",
	schemas: {
		query: Joi.object({
			list: Joi.string()
		})
	},
	handler: async (request: Request, response: any) => {
		// Split extensions by commas.
		let extensions = request.query!.list.split(",");

		// Lookup extensions.
		let extensionsMap = await DatabaseFileType.lookupExtensions(extensions);
		send(response, Codes.OK, extensionsMap);
	}
}];

export default route;