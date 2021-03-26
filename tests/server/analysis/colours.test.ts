// File imports
import { extractVibrant } from "../../../src/server/analysis/colours";

// Constants
const testImageURL = "https://raw.githubusercontent.com/frannyfx/panorama/master/docs/img/panorama.jpg";

describe("extractVibrant", () => {
	it("returns null with an invalid image url", async () => {
		let result = await extractVibrant("");
		expect(result).toBeNull();
	});

	it("returns a hex colour with a valid image url", async () => {
		let result = await extractVibrant(testImageURL);
		expect(result).not.toBeNull();
		expect(typeof result).toEqual("string");
		expect(result!.length).toEqual(6);
	});
});