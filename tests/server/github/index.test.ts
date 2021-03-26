// Test imports
import nock from "nock";

// File imports
import { checkAuth, getAccessToken, getRepository, getRepositoryContributors, getCommitAuthor } from "../../../src/server/github";

// Constants
const githubURL = "https://github.com/";
const apiURL = "https://api.github.com/";

describe("checkAuth", () => {
	it("returns user if access token is valid", async () => {
		// Mock the request.
		let scope = nock(apiURL).get("/user").reply(200, { id: 123 });

		// Request with a valid token.
		let result = await checkAuth("valid_token");

		// Check status and result.
		expect(result.status.ok).toEqual(true);
		expect(result.result!.id).toEqual(123);

		// Clean-up.
		scope.done();
	});

	it("returns not ok if access token is invalid", async () => {
		// Mock the request.
		let scope = nock(apiURL).get("/user").reply(401, {});

		// Request with an invalid token.
		let result = await checkAuth("invalid_token");

		// Check status.
		expect(result.status.ok).toEqual(false);

		// Clean-up.
		scope.done();
	});
});

describe("getAccessToken", () => {
	it("returns token for a valid auth code", async () => {
		// Mock the request.
		let scope = nock(githubURL).post("/login/oauth/access_token").reply(200, {
			access_token: "valid_token",
			scope: "repo",
			token_type: "bearer"
		});

		// Request with a valid auth code.
		let result = await getAccessToken("github_code");

		// Check status and result.
		expect(result.status.ok).toEqual(true);
		expect(result.result!).toEqual("valid_token");

		// Clean-up.
		scope.done();
	});

	it("returns not ok for an invalid auth code", async () => {
		// Mock the request.
		let scope = nock(githubURL).post("/login/oauth/access_token").reply(401);

		// Request with an invalid auth code.
		let result = await getAccessToken("github_code");

		// Check status.
		expect(result.status.ok).toEqual(false);

		// Clean-up.
		scope.done();
	});
});

describe("getRepository", () => {
	it("returns repo for an existing repo with a valid token", async () => {
		// Mock the request.
		let scope = nock(apiURL).get("/repos/frannyfx/panorama").reply(200, {
			id: 123,
		});

		// Request with a valid token.
		let result = await getRepository("frannyfx/panorama", "valid_token");

		// Check status and result.
		expect(result.status.ok).toEqual(true);
		expect(result.result!.id).toEqual(123);

		// Clean-up.
		scope.done();
	});

	it("returns not ok for a non-existent repository", async () => {
		// Mock the request.
		let scope = nock(apiURL).get("/repos/frannyfx/panorama").reply(404);

		// Request with a valid token.
		let result = await getRepository("frannyfx/panorama", "valid_token");

		// Check status.
		expect(result.status.ok).toEqual(false);

		// Clean-up.
		scope.done();
	});

	it("returns not ok with an invalid token", async () => {
		// Mock the request.
		let scope = nock(apiURL).get("/repos/frannyfx/panorama").reply(401);

		// Request with an valid token.
		let result = await getRepository("frannyfx/panorama", "invalid_token");

		// Check status.
		expect(result.status.ok).toEqual(false);

		// Clean-up.
		scope.done();
	});
});

describe("getRepositoryContributors", () => {
	it("returns contributors for an existing repo with a valid token", async () => {
		// Mock the request.
		let scope = nock(apiURL).get("/repos/frannyfx/panorama/contributors").reply(200, [{
			id: 1,
			login: "alice"
		}, {
			id: 2,
			login: "bob"
		}]);

		// Request with a valid token.
		let result = await getRepositoryContributors("frannyfx/panorama", "valid_token");

		// Check status and result.
		expect(result.status.ok).toEqual(true);
		expect(result.result![0].id).toEqual(1);
		expect(result.result![0].login).toEqual("alice");
		expect(result.result![1].id).toEqual(2);
		expect(result.result![1].login).toEqual("bob");

		// Clean-up.
		scope.done();
	});

	it("returns not ok for an non-existent repo", async () => {
		// Mock the request.
		let scope = nock(apiURL).get("/repos/frannyfx/panorama/contributors").reply(404);

		// Request with a valid token.
		let result = await getRepositoryContributors("frannyfx/panorama", "valid_token");

		// Check status.
		expect(result.status.ok).toEqual(false);

		// Clean-up.
		scope.done();
	});

	it("returns not ok with an invalid token", async () => {
		// Mock the request.
		let scope = nock(apiURL).get("/repos/frannyfx/panorama/contributors").reply(401);

		// Request with an invalid token.
		let result = await getRepositoryContributors("frannyfx/panorama", "");

		// Check status.
		expect(result.status.ok).toEqual(false);

		// Clean-up.
		scope.done();
	});
});

describe("getCommitAuthor", () => {
	it("returns author for an existing repo with a valid commit ref and a valid token", async () => {
		// Mock the request.
		let scope = nock(apiURL).get("/repos/frannyfx/panorama/commits/abc123").reply(200, {
			sha: "abc123",
			author: {
				login: "frannyfx",
				id: 123
			}
		});

		// Request with a valid token.
		let result = await getCommitAuthor("frannyfx", "panorama", "abc123", "valid_token");

		// Check status and result.
		expect(result.status.ok).toEqual(true);
		expect(result.result!.login).toEqual("frannyfx");
		expect(result.result!.id).toEqual(123);

		// Clean-up.
		scope.done();
	});

	it("returns not ok for a non-existent repo or non-existent commit ref", async () => {
		// Mock the request.
		let scope = nock(apiURL).get("/repos/frannyfx/panorama/commits/abc123").reply(404);

		// Request with a valid token.
		let result = await getCommitAuthor("frannyfx", "panorama", "abc123", "valid_token");

		// Check status.
		expect(result.status.ok).toEqual(false);

		// Clean-up.
		scope.done();
	});

	it("returns not ok with an invalid token", async () => {
		// Mock the request.
		let scope = nock(apiURL).get("/repos/frannyfx/panorama/commits/abc123").reply(401);

		// Request with an invalid token.
		let result = await getCommitAuthor("frannyfx", "panorama", "abc123", "invalid_token");

		// Check status.
		expect(result.status.ok).toEqual(false);

		// Clean-up.
		scope.done();
	});
});