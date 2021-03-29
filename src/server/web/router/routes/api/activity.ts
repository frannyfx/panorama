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
import DatabaseAnalysis from "../../../../database/models/Analysis";
import { Activity, ActivityType } from "../../../../../shared/models/Activity";

let route : Array<Route> = [{
	method: Method.GET,
	url: "/api/activity",
	auth: true,
	handler: async (request, reply) => {
		let activity : Activity[] = (await DatabaseAnalysis.getRecentByUser(request.auth!.payload!.id)).map((analysis) => {
			let { completedAt, ...data } = analysis;
			return {
				type: ActivityType.ANALYSIS,
				data,
				date: completedAt
			};
		});
		send(reply, Codes.OK, activity);
	}
}];

export default route;