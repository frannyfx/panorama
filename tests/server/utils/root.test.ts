// Imports
import path from "path";

// File imports
import root from "../../../src/server/utils/root";

describe("root", () => {
	it("finds the root folder", () => {
		expect(root()).toBe(path.join(__dirname, "../../../src/server"));
	});
});