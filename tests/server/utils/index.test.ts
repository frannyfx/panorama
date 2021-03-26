// Imports
import { promises as fs } from "fs";
import { tmpdir } from "os";
import path from "path";
import { v4 as uuid } from "uuid";


// File imports
import { walkDir, processFilePath, areSetsEqual, humanTimeIntervalToMillis } from "../../../src/server/utils/index";

describe("walkDir", () => {
	it("returns an empty array with an invalid directory", async () => {
		let result = await walkDir("/this-folder-does-not-exist", /./);
		expect(result).toEqual([]);
	});

	it("returns an empty array with an empty folder", async () => {
		// Set-up
		let pathDir = path.join(tmpdir(), uuid());
		await fs.mkdir(pathDir);

		// Test
		let result = await walkDir(pathDir, /./);
		expect(result).toEqual([]);

		// Teardown
		await fs.rmdir(pathDir);
	});

	it("returns the correct files in the folder", async () => {
		// Set-up
		let pathDir = path.join(tmpdir(), uuid());
		let fileDir = path.join(pathDir, "testfile.json");
		await fs.mkdir(pathDir);
		await fs.writeFile(fileDir, "hello");

		// Test
		let result = await walkDir(pathDir, /./);
		expect(result).toEqual([fileDir]);

		// Teardown
		await fs.unlink(fileDir);
		await fs.rmdir(pathDir);
	});

	it("returns only files matching the regex", async () => {
		// Set-up
		let pathDir = path.join(tmpdir(), uuid());
		let fileDir = path.join(pathDir, "testfile.json");
		let matchingFileDir = path.join(pathDir, "testfile.js");
		await fs.mkdir(pathDir);
		await fs.writeFile(fileDir, "hello");
		await fs.writeFile(matchingFileDir, "hello");

		// Test
		let result = await walkDir(pathDir, /([a-zA-Z0-9\s_\\.\-\(\):])+(.js)$/);
		expect(result).toEqual([matchingFileDir]);

		// Teardown
		await fs.unlink(fileDir);
		await fs.unlink(matchingFileDir);
		await fs.rmdir(pathDir);
	});
});

describe("processFilePath", () => {
	it("processes empty strings", () => {
		expect(processFilePath("")).toEqual("");
	});

	it("processes paths with a leading slash", () => {
		expect(processFilePath("/")).toEqual("");
		expect(processFilePath("/web")).toEqual("web/");
		expect(processFilePath("/web/")).toEqual("web/");
		expect(processFilePath("/web/server")).toEqual("web/server/");
	});

	it("processes paths without a leading slash", () => {
		expect(processFilePath("web")).toEqual("web/");
		expect(processFilePath("web/")).toEqual("web/");
		expect(processFilePath("/web/server")).toEqual("web/server/");
	});
});

describe("areSetsEqual", () => {
	it("returns true with empty sets", () => {
		expect(areSetsEqual(new Set<number>(), new Set<number>())).toEqual(true);
	});

	it("returns false with different sets", () => {
		expect(areSetsEqual(new Set<number>([1]), new Set<number>([]))).toEqual(false);
		expect(areSetsEqual(new Set<number>([]), new Set<number>([1]))).toEqual(false);
		expect(areSetsEqual(new Set<number>([2]), new Set<number>([1]))).toEqual(false);
		expect(areSetsEqual(new Set<number>([1, 2]), new Set<number>([1]))).toEqual(false);
		expect(areSetsEqual(new Set<number>([1, 2, 3]), new Set<number>([1, 2, 3, 4]))).toEqual(false);
	});

	it("returns true with equal sets", () => {
		expect(areSetsEqual(new Set<number>([1]), new Set<number>([1]))).toEqual(true);
		expect(areSetsEqual(new Set<number>([1, 2]), new Set<number>([1, 2]))).toEqual(true);
		expect(areSetsEqual(new Set<number>([1, 2]), new Set<number>([2, 1]))).toEqual(true);
		expect(areSetsEqual(new Set<number>([4, 1, 3, 2]), new Set<number>([1, 2, 3, 4]))).toEqual(true);
	});
});

describe("humanTimeIntervalToMillis", () => {
	it("returns -1 with an invalid input", () => {
		expect(humanTimeIntervalToMillis("")).toEqual(-1);
		expect(humanTimeIntervalToMillis("1")).toEqual(-1);
		expect(humanTimeIntervalToMillis("-1h")).toEqual(-1);
		expect(humanTimeIntervalToMillis("1x")).toEqual(-1);
		expect(humanTimeIntervalToMillis("ABCDEFG")).toEqual(-1);
	});

	it("parses zero", () => {
		expect(humanTimeIntervalToMillis("0d")).toEqual(0);
		expect(humanTimeIntervalToMillis("0h")).toEqual(0);
		expect(humanTimeIntervalToMillis("0m")).toEqual(0);
		expect(humanTimeIntervalToMillis("0s")).toEqual(0);
	});

	it("parses days", () => {
		expect(humanTimeIntervalToMillis("1d")).toEqual(1 * 24 * 60 * 60 * 1000);
		expect(humanTimeIntervalToMillis("2d")).toEqual(2 * 24 * 60 * 60 * 1000);
		expect(humanTimeIntervalToMillis("1000d")).toEqual(1000 * 24 * 60 * 60 * 1000);
	});

	it("parses hours", () => {
		expect(humanTimeIntervalToMillis("1h")).toEqual(1 * 60 * 60 * 1000);
		expect(humanTimeIntervalToMillis("2h")).toEqual(2 * 60 * 60 * 1000);
		expect(humanTimeIntervalToMillis("1000h")).toEqual(1000 * 60 * 60 * 1000);
	});

	it("parses minutes", () => {
		expect(humanTimeIntervalToMillis("1m")).toEqual(1 * 60 * 1000);
		expect(humanTimeIntervalToMillis("2m")).toEqual(2 * 60 * 1000);
		expect(humanTimeIntervalToMillis("1000m")).toEqual(1000 * 60 * 1000);
	});

	it("parses seconds", () => {
		expect(humanTimeIntervalToMillis("1s")).toEqual(1 * 1000);
		expect(humanTimeIntervalToMillis("2s")).toEqual(2 * 1000);
		expect(humanTimeIntervalToMillis("1000s")).toEqual(1000 * 1000);
	});
});