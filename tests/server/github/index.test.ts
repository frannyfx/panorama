// Test imports
import nock from "nock";

// File imports
import { checkAuth, getAccessToken, getRepository, getRepositoryContributors, getCommitAuthor } from "../../../src/server/github";

// Constants
const apiURL = "https://api.github.com/";

describe("checkAuth", () => {
	it("returns true if access token is valid", async () => {
		// Mock the request.
		let scope = nock(apiURL).get("/user").reply(200, { id: 123 });

		// Request with a valid token.
		let result = await checkAuth("valid_token");

		// Check status and result.
		expect(result.status.ok).toEqual(true);
		expect(result.result!.id).toEqual(123);
		scope.done();
	});

	it("returns false if access token is invalid", async () => {
		// Mock the request.
		let scope = nock(apiURL).get("/user").reply(401, {});

		// Request with a valid token.
		let result = await checkAuth("invalid_token");

		// Check status and result.
		expect(result.status.ok).toEqual(false);
		scope.done();
	});
});

describe("getAccessToken", () => {
	it("returns true for a valid access token", async () => {
		// Mock the request.
		let scope = nock("https://github.com/").post("/login/oauth/access_token").reply(200, {
			access_token: "valid_token",
			scope: "repo",
			token_type: "bearer"
		});

		// Request with a valid token.
		let result = await getAccessToken("github_code");

		// Check status and result.
		expect(result.status.ok).toEqual(true);
		expect(result.result!).toEqual("valid_token");
		scope.done();
	});

	it("returns false for an invalid access token", async () => {
		// Mock the request.
		let scope = nock("https://github.com/").post("/login/oauth/access_token").reply(401);

		// Request with a valid token.
		let result = await getAccessToken("github_code");

		// Check status and result.
		expect(result.status.ok).toEqual(false);
		scope.done();
	});
});

describe("getRepository", () => {
	// ...
});

describe("getRepositoryContributors", () => {
	// ...
});

describe("getCommitAuthor", () => {
	// ...
});