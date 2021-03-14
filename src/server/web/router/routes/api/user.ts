/**
 * @file Routes handling user lookups.
 * @author Francesco Compagnoni
 */

// Imports
import Joi from "joi";

// Modules
import { Method } from "../../../../../shared/Method";
import { Request, Route } from "../../Route";
import { Codes, send } from "../../API";

// Models
import DatabaseUser from "../../../../database/models/User";

let route : Array<Route> = [{
	method: Method.GET,
	url: "/api/user/:login",
	schemas: {
		params: Joi.object({
			login: Joi.string()
		})
	},
	handler: async (request: Request, response: any) => {
		// TODO: ...
		send(response, Codes.OK);
	}
}];

export default route;