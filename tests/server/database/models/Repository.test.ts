// Override config.
import { loadConfig } from "../../../../src/server/Config";
loadConfig(undefined, true);

// File imports
import { getConnection, stop } from "../../../../src/server/database";
import Analysis, { DatabaseAnalysisStatus } from "../../../../src/server/database/models/Analysis";
import Repository, { DatabaseRepository } from "../../../../src/server/database/models/Repository";

/**
 * Global clean-up.
 */
afterAll(async done => {
	await stop();
	done();
});

describe("insertOrUpdate", () => {
	it("inserts a new repo", async () => {
		// Insert repo.
		let result = await Repository.insertOrUpdate({
			repositoryId: -3,
			name: "test-repo",
			ownerId: -1
		});

		expect(result).toEqual(true);

		// Verify insertion.
		if (result) {
			let connection = await getConnection();
			if (connection) {
				let repository : DatabaseRepository = await connection("Repository").where({ repositoryId: -3 }).first();
				expect(repository).not.toBeNull();
				expect(repository.repositoryId).toEqual(-3);

				// Clean-up.
				await Repository.delete(-3);
			}
		}
		
	});

	it("updates an existing repo", async () => {
		// Insert repo.
		let result = await Repository.insertOrUpdate({
			repositoryId: -4,
			name: "test-repo",
			ownerId: -1
		});

		expect(result).toEqual(true);

		// Verify insertion.
		if (result) {
			let connection = await getConnection();
			if (connection) {
				let repository : DatabaseRepository = await connection("Repository").where({ repositoryId: -4 }).first();
				expect(repository).not.toBeNull();
				expect(repository.repositoryId).toEqual(-4);

				// Update it.
				let updateResult = await Repository.insertOrUpdate({
					repositoryId: -4,
					name: "new-name",
					ownerId: -1
				});

				expect(updateResult).toEqual(true);

				// Verify update.
				if (updateResult) {
					let updatedRepository : DatabaseRepository = await connection("Repository").where({ repositoryId: -4 }).first();
					expect(updatedRepository).not.toBeNull();
					expect(updatedRepository.repositoryId).toEqual(-4);
					expect(updatedRepository.name).toEqual("new-name");
				}

				// Clean-up.
				await Repository.delete(-4);
			}
			
		}
	});
});

describe("delete", () => {
	it("returns true with a non-existent repository", async () => {
		let result = await Repository.delete(-100);
		expect(result).toBe(true);
	});

	it("returns true with a valid repository", async () => {
		// Insert repo.
		await Repository.insertOrUpdate({
			repositoryId: -5,
			name: "test-repo",
			ownerId: -1
		});

		let result = await Repository.delete(-5);
		expect(result).toBe(true);
	});
});