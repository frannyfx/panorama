/**
 * @file Route handling homepage requests.
 * @author Francesco Compagnoni
 */

// Imports
import fs from "fs";
import path from "path";

// Modules
import { Config } from "../../../Config";
import getRoot from "../../../utils/root";
const config : Config = require("../../../config.json");
import { Method } from "../Method";
import { Route } from "../Route";

let route : Array<Route> = [{
	method: Method.GET,
	url: "/",
	handler: (request: any, response: any) => {
		// Create read stream for index.html.
		const index = fs.createReadStream(path.join(getRoot(), config.web.assetsDir, "index.html"));
		response.type("text/html").send(index);
	}
}];

export default route;