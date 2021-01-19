/**
 * @file Route handling homepage requests.
 * @author Francesco Compagnoni
 */

// Imports
import fs from "fs";
import path from "path";

// Config
import loadConfig, { Config } from "../../../Config";
const config : Config = loadConfig();

// Modules
import getRoot from "../../../utils/root";
import { Method } from "../../../../shared/Method";
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