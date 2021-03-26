// Override config.
import { loadConfig } from "../../../../src/server/Config";
loadConfig(undefined, true);

// File imports
import { stop } from "../../../../src/server/database";
import Token from "../../../../src/server/database/models/Token";

/**
 * Global clean-up.
 */
afterAll(async done => {
	await stop();
	done();
});

describe("lookupTokens", () => {
	it("returns an empty object for an empty set of tokens", async () => {
		let result = await Token.lookupTokens([]);
		expect(Object.keys(result).length).toEqual(0);
	});

	it("handles invalid items", async () => {
		let result = await Token.lookupTokens([NaN, -1, 1.23]);
		expect(Object.keys(result).length).toEqual(0);
	});

	it("returns tokens", async () => {
		let result = await Token.lookupTokens([0, 1]);
		expect(Object.keys(result).length).toEqual(2);
		expect(result[0].name).toEqual("Documentation");
		expect(result[1].name).toEqual("Code");
	});

	it("handles duplicates", async () => {
		let result = await Token.lookupTokens([0, 1, 1]);
		expect(Object.keys(result).length).toEqual(2);
		expect(result[0].name).toEqual("Documentation");
		expect(result[1].name).toEqual("Code");
	});
});