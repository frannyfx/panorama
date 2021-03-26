// File imports
import { dedupe, getRepoName, humanFileSize, lerp } from "../../src/shared/utils";

describe("dedupe", () => {
	it("handles empty lists", () => {
		expect(dedupe([], (a: any, b: any) => a == b).length).toEqual(0);
	});

	it("removes duplicates", () => {
		let result1 = dedupe([1, 1, 1], (a: number, b: number) => a == b);
		expect(result1.length).toEqual(1);
		expect(result1[0]).toEqual(1);

		let result2 = dedupe([1, 1, 2, 2, 3, 3], (a: number, b: number) => a == b);
		expect(result2.length).toEqual(3);
		expect(result2.indexOf(1)).not.toEqual(-1);
		expect(result2.indexOf(2)).not.toEqual(-1);
		expect(result2.indexOf(3)).not.toEqual(-1);
	});
});

describe("lerp", () => {
	it("calculates linear interpolation", () => {
		expect(lerp(0, 0, 0)).toEqual(0);
		expect(lerp(0, 1, 0)).toEqual(0);
		expect(lerp(1, 0, 0)).toEqual(0);
		expect(lerp(0, 1, 0.5)).toEqual(0.5);
		expect(lerp(1, 0, 0.5)).toEqual(0.5);
		expect(lerp(50, 100, 0.5)).toEqual(75);
	});
});

describe("humanFileSize", () => {
	it("handles negative values", () => {
		expect(humanFileSize(-1)).toEqual("-1 B");
	});

	it("converts values correctly", () => {
		expect(humanFileSize(1000)).toEqual("1000 B");
		expect(humanFileSize(1024)).toEqual("1 KiB");
		expect(humanFileSize(1025)).toEqual("1 KiB");
		expect(humanFileSize(1024 * 10)).toEqual("10 KiB");
		expect(humanFileSize(2**20)).toEqual("1 MiB");
		expect(humanFileSize(2**21)).toEqual("2 MiB");
		expect(humanFileSize(2**30)).toEqual("1 GiB");
		expect(humanFileSize(2**40)).toEqual("1 TiB");
	});
});

describe("getRepoName", () => {
	it("handles invalid names", () => {
		expect(getRepoName("")).toBeNull();
		expect(getRepoName("hello")).toBeNull();
	});

	it("handles valid names", () => {
		let result = getRepoName("frannyfx/panorama");
		expect(result!.owner).toEqual("frannyfx");
		expect(result!.repo).toEqual("panorama");
	});
});