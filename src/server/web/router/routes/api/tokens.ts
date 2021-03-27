/**
 * @file Routes handling token lookup requests.
 * @author Francesco Compagnoni
 */

// Imports
import Joi from "joi";

// Modules
import { Method } from "../../../../../shared/Method";
import { Request, Route } from "../../Route";
import { Codes, send } from "../../API";

// Models
import DatabaseToken from "../../../../database/models/Token";

let route : Array<Route> = [{
	method: Method.GET,
	url: "/api/tokens",
	schemas: {
		query: Joi.object({
			list: Joi.string()
		})
	},
	handler: async (request, reply) => {
		// Split extensions by commas.
		let tokens : number[] = request.query!.list.split(",").map((token : string) => parseInt(token)).filter((token : number) => !isNaN(token));

		// Lookup extensions.
		let tokenMap = await DatabaseToken.lookupTokens(tokens);
		send(reply, Codes.OK, tokenMap);
	}
}];

export default route;