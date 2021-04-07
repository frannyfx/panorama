/**
 * @file Routes handling authentication.
 * @author Francesco Compagnoni
 */

// Modules
import { Method } from "../../../../../shared/Method";
import { Route } from "../../Route";
import { Codes, send } from "../../API";

let route : Route[] = [{
	method: Method.GET,
	url: "/api/auth",
	auth: true,
	handler: async (request, reply) => {
		send(reply, Codes.OK);
	}
}];

export default route;