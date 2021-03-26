// File imports
import { stop } from "../../../../src/server/database";
import Analysis, { DatabaseAnalysisStatus } from "../../../../src/server/database/models/Analysis";
import Repository from "../../../../src/server/database/models/Repository";

beforeAll(async done => {
	// Insert the repository necessary for the foreign key constraints to be valid.
	let repositoryResult = await Repository.insertOrUpdate({
		repositoryId: -1,
		name: "test-repo",
		ownerId: -1
	});

	if (!repositoryResult) return done.fail();
	done();
});

afterAll(async done => {
	await Repository.delete(-1);
	await stop();
	done();
});

describe("insert", () => {
	it("can insert a valid analysis", async () => {
		// Insert analysis.
		let analysisResult = await Analysis.insert({
			repositoryId: -1,
			requestedBy: -1,
			status: DatabaseAnalysisStatus.QUEUED,
			queuedAt: new Date()
		});

		expect(analysisResult.analysisId).not.toBeNull();

		// If previous test was successful, attempt to retrieve the newly inserted analysis.
		if (analysisResult.analysisId) {
			// Check analysis was inserted.
			let analysis = await Analysis.get(analysisResult.analysisId);
			expect(analysis).not.toBeNull();
			expect(analysis!.analysisId).toEqual(analysisResult.analysisId!);

			// Clean-up.
			await Analysis.delete(analysisResult.analysisId);
		}
	});

	it("throws when an analysis with an invalid repository is given", async () => {
		await expect(Analysis.insert({
			repositoryId: -2,
			requestedBy: -1,
			status: DatabaseAnalysisStatus.QUEUED,
			queuedAt: new Date()
		})).rejects.toThrowError();
	});

	it("throws when an analysis with an invalid requester is given", async () => {
		await expect(Analysis.insert({
			repositoryId: -1,
			requestedBy: -2,
			status: DatabaseAnalysisStatus.QUEUED,
			queuedAt: new Date()
		})).rejects.toThrowError();
	});
});

describe("update", () => {
	it("can update an analysis", async () => {
		// Set-up.
		let analysisResult = await Analysis.insert({
			repositoryId: -1,
			requestedBy: -1,
			status: DatabaseAnalysisStatus.QUEUED,
			queuedAt: new Date()
		});

		// Update the analysis.
		analysisResult.status = DatabaseAnalysisStatus.FAILED;
		let updateResult = await Analysis.update(analysisResult);
		expect(updateResult).toEqual(true);

		// If last test was successful...
		if (updateResult) {
			// Fetch analysis to verify.
			let analysis = await Analysis.get(analysisResult.analysisId!);
			expect(analysis).not.toBeNull();

			// Check status updated successfully.
			if (analysis) expect(analysis.status).toEqual(DatabaseAnalysisStatus[DatabaseAnalysisStatus.FAILED]);
		}

		// Clean-up.
		await Analysis.delete(analysisResult.analysisId!);
	});

	it("throws if update is invalid", async () => {
		// Set-up.
		let analysisResult = await Analysis.insert({
			repositoryId: -1,
			requestedBy: -1,
			status: DatabaseAnalysisStatus.QUEUED,
			queuedAt: new Date()
		});

		// Update the analysis.
		analysisResult.requestedBy = -2;
		await expect(Analysis.update(analysisResult)).rejects.toThrowError();

		// Clean-up.
		await Analysis.delete(analysisResult.analysisId!);
	});
});

describe("getRawWithJobId", () => {
	it("gets analysis with corresponding jobId", async () => {
		// Set-up.
		let analysisResult = await Analysis.insert({
			repositoryId: -1,
			requestedBy: -1,
			jobId: "test",
			status: DatabaseAnalysisStatus.QUEUED,
			queuedAt: new Date()
		});

		// Test the function.
		let result = await Analysis.getRawWithJobId("test");
		expect(result).not.toBeNull();
		if (result) expect(result.analysisId).toBe(analysisResult.analysisId!);

		// Clean-up.
		await Analysis.delete(analysisResult.analysisId!);
	});

	it("returns null with an invalid jobId", async () => {
		let result = await Analysis.getRawWithJobId("does_not_exist");
		expect(result).toBeNull();
	});
});

describe("getLatest", () => {
	it("gets the latest analysis of a repo", async () => {
		// Set-up.
		let analysis1 = await Analysis.insert({
			repositoryId: -1,
			requestedBy: -1,
			status: DatabaseAnalysisStatus.QUEUED,
			queuedAt: new Date()
		});

		let analysis2 = await Analysis.insert({
			repositoryId: -1,
			requestedBy: -1,
			status: DatabaseAnalysisStatus.QUEUED,
			queuedAt: new Date(new Date().getTime() + 1000)
		});

		// Test the function.
		let result = await Analysis.getLatest("Anonymous", "test-repo");
		expect(result).not.toBeNull();
		if (result) expect(result.analysisId).toEqual(analysis2.analysisId!);

		// Clean-up.
		await Analysis.delete(analysis1.analysisId!);
		await Analysis.delete(analysis2.analysisId!);
	});

	it("filters analyses by status", async () => {
		// Set-up.
		let analysis1 = await Analysis.insert({
			repositoryId: -1,
			requestedBy: -1,
			status: DatabaseAnalysisStatus.FAILED,
			queuedAt: new Date()
		});

		let analysis2 = await Analysis.insert({
			repositoryId: -1,
			requestedBy: -1,
			status: DatabaseAnalysisStatus.QUEUED,
			queuedAt: new Date(new Date().getTime() + 1000)
		});

		// Test the function.
		let result = await Analysis.getLatest("Anonymous", "test-repo", DatabaseAnalysisStatus.FAILED);
		expect(result).not.toBeNull();
		if (result) expect(result.analysisId).toEqual(analysis1.analysisId!);

		// Clean-up.
		await Analysis.delete(analysis1.analysisId!);
		await Analysis.delete(analysis2.analysisId!);
	});
});

describe("get", () => {
	it("returns an analysis by id", async () => {
		// Set-up.
		let analysisResult = await Analysis.insert({
			repositoryId: -1,
			requestedBy: -1,
			jobId: "test",
			status: DatabaseAnalysisStatus.QUEUED,
			queuedAt: new Date()
		});

		// Test the function.
		let result = await Analysis.get(analysisResult.analysisId!);
		expect(result).not.toBeNull();
		if (result) {
			expect(result.analysisId).toEqual(analysisResult.analysisId!);
			expect(result.repositoryName).toEqual("test-repo");	
			expect(result.owner).toEqual("Anonymous");
		}

		// Clean-up.
		await Analysis.delete(analysisResult.analysisId!);
	});
});