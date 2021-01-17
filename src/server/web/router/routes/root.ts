import { Method } from "../Method";
import { Route } from "../Route";

let route : Array<Route> = [{
	method: Method.GET,
	url: "/",
	handler: (request: any, response: any) => {
		response.send("OK");
	}
}];

export default route;