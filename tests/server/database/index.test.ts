// Test imports
import mockKnex from "mock-knex";

// Constants
const purge = {
	analysisThreshold: "",
	repositoryThreshold: "",
	userThreshold: "",
	periodLength: "12h"
};

const invalidDatabase = {
	purge
};

const validDatabase = {
	connection: {
		host: "ensembldb.ensembl.org",
		user: "anonymous",
		password: ""
	},
	purge
};

describe("getConnection", () => {
	beforeEach(() => {
		jest.resetModules();
	});

	it("returns null when invalid connection details are provided", async () => {
		// Mock config file.
		let config = await import("../../../src/server/Config");
		config.loadConfig({ database: invalidDatabase });

		// Import database.
		let database = await import("../../../src/server/database");

		// Run test.
		let result = await database.getConnection();
		expect(result).toBeNull();
	});

	it("returns not null when valid connection details are provided", async () => {
		// Mock config file.
		let config = await import("../../../src/server/Config");
		config.loadConfig({ database: validDatabase });

		// Import database.
		let database = await import("../../../src/server/database");

		// Run test.
		let result = await database.getConnection();
		expect(result).not.toBeNull();

		// Clean up.
		await database.stop();
	});
});

describe("start", () => {
	beforeEach(() => {
		jest.resetModules();
	});

	it("throws when invalid connection details are provided", async () => {
		// Mock config file.
		let config = await import("../../../src/server/Config");
		config.loadConfig({ database: invalidDatabase });

		// Import database.
		let database = await import("../../../src/server/database");

		// Run test.
		await expect(database.start()).rejects.toThrowError();
	});

	it("does not throw when valid connection details are provided", async () => {
		// Mock config file.
		let config = await import("../../../src/server/Config");
		config.loadConfig({ database: validDatabase });

		// Import database.
		let database = await import("../../../src/server/database");

		// Run test.
		await expect(database.start()).resolves.not.toThrow();

		// Clean up.
		await database.stop();
	});
});

describe("stop", () => {
	beforeEach(() => {
		jest.resetModules();
	});

	it("resolves when there is no connection", async () => {
		// Import database.
		let database = await import("../../../src/server/database");

		// Run test.
		await expect(database.stop()).resolves.not.toThrow();
	});

	it("resolves when there is a valid connection", async () => {
		// Mock config file.
		let config = await import("../../../src/server/Config");
		config.loadConfig({ database: validDatabase });

		// Import database and connect.
		let database = await import("../../../src/server/database");
		await database.start();

		// Run test.
		await expect(database.stop()).resolves.not.toThrow();
	});
});
