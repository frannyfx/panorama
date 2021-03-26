// Override config.
import { loadConfig } from "../../../../src/server/Config";
loadConfig(undefined, true);

// File imports
import { stop } from "../../../../src/server/database";
import FileType from "../../../../src/server/database/models/FileType";

/**
 * Global clean-up.
 */
afterAll(async done => {
	await stop();
	done();
});

describe("lookupExtensions", () => {
	it("returns an empty object for an empty set of extensions", async () => {
		let result = await FileType.lookupExtensions([]);
		expect(Object.keys(result).length).toEqual(0);
	});

	it("handles invalid items", async () => {
		let result = await FileType.lookupExtensions(["", "1", "-1", "asdasd"]);
		expect(Object.keys(result).length).toEqual(0);
	});

	it("returns extensions", async () => {
		let result = await FileType.lookupExtensions(["js", "ts"]);
		expect(Object.keys(result).length).toEqual(2);
		expect(result["js"].name).toEqual("JavaScript");
		expect(result["ts"].name).toEqual("TypeScript");
	});

	it("handles duplicates", async () => {
		let result = await FileType.lookupExtensions(["js", "ts", "js"]);
		expect(Object.keys(result).length).toEqual(2);
		expect(result["js"].name).toEqual("JavaScript");
		expect(result["ts"].name).toEqual("TypeScript");
	});
});

describe("lookupTypes", () => {
	it("returns an empty object for an empty set of types", async () => {
		let result = await FileType.lookupTypes([]);
		expect(Object.keys(result).length).toEqual(0);
	});

	it("handles invalid items", async () => {
		let result = await FileType.lookupTypes(["", "-1", "asdasd"]);
		expect(Object.keys(result).length).toEqual(0);
	});

	it("returns types", async () => {
		let result = await FileType.lookupTypes(["1", "2"]);
		expect(Object.keys(result).length).toEqual(2);
		expect(result["1"].name).toEqual("JavaScript");
		expect(result["2"].name).toEqual("TypeScript");
	});

	it("handles duplicates", async () => {
		let result = await FileType.lookupTypes(["1", "2", "1"]);
		expect(Object.keys(result).length).toEqual(2);
		expect(result["1"].name).toEqual("JavaScript");
		expect(result["2"].name).toEqual("TypeScript");
	});
});