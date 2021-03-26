// Override config.
import { loadConfig } from "../../../../src/server/Config";
loadConfig(undefined, true);

// File imports
import { getConnection, stop } from "../../../../src/server/database";
import Analysis, { DatabaseAnalysisStatus } from "../../../../src/server/database/models/Analysis";
import Repository from "../../../../src/server/database/models/Repository";
import AnalysisContributor from "../../../../src/server/database/models/AnalysisContributor";

// Variables
let analysisId = -1;

/**
 * Global set-up.
 */
beforeAll(async done => {
	// Insert the repository necessary for the foreign key constraints to be valid.
	let repositoryResult = await Repository.insertOrUpdate({
		repositoryId: -2,
		name: "test-repo",
		ownerId: -1
	});

	if (!repositoryResult) return done.fail();

	// Insert the analysis.
	let analysisResult = await Analysis.insert({
		repositoryId: -2,
		requestedBy: -1,
		status: DatabaseAnalysisStatus.QUEUED,
		queuedAt: new Date()
	});

	analysisId = analysisResult.analysisId ?? -1;
	if (analysisId == -1) return done.fail();
	done();
});

/**
 * Global clean-up.
 */
afterAll(async done => {
	await Analysis.delete(analysisId);
	await Repository.delete(-2);
	await stop();
	done();
});

describe("insertOrUpdate", () => {
	it("inserts a contributor and user with valid data", async () => {
		// Need an analysis ID.
		if (analysisId == -1) return fail();

		// Insert the contributor.
		let insertionResult = await AnalysisContributor.insertOrUpdate(analysisId, {
			userId: -2,
			login: "test-user"
		});

		// Check insertion successful.
		expect(insertionResult).toBe(true);

		// If insertion is successful...
		if (insertionResult) {
			// Check if it was actually inserted.
			let analysisContributors = await AnalysisContributor.getFromAnalysis(analysisId);
			expect(analysisContributors).not.toBeNull();
			if(analysisContributors) {
				expect(analysisContributors.length).toEqual(1);
				expect(analysisContributors[0].userId).toEqual(-2);
			}

			// Clean-up.
			let connection = await getConnection();
			if (connection) {
				await connection("AnalysisContributor").where({userId: -2}).del();
				await connection("User").where({userId: -2}).del();
			}
		}
	});

	it("returns false if analysis id is invalid", async () => {
		let result = await AnalysisContributor.insertOrUpdate(-100, { userId: -3, login: "test-user" });
		expect(result).toEqual(false);
	});
});

describe("getFromAnalysis", () => {
	it("gets contributors for an analysis", async () => {
		// Need an analysis ID.
		if (analysisId == -1) return fail();

		// Set-up.
		let insertionResult = await AnalysisContributor.insertOrUpdate(analysisId, {
			userId: -3,
			login: "test-user"
		});

		expect(insertionResult).toBe(true);

		// Test.
		if (insertionResult) {
			let analysisContributors = await AnalysisContributor.getFromAnalysis(analysisId);
			expect(analysisContributors).not.toBe(null);
			if (analysisContributors) {
				expect(analysisContributors.length).toEqual(1);
				expect(analysisContributors[0].userId).toEqual(-3);
			}
			
			// Clean-up.
			let connection = await getConnection();
			if (connection) {
				await connection("AnalysisContributor").where({userId: -3}).del();
				await connection("User").where({userId: -3}).del();
			}
		}
	});
});