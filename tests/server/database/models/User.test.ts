// Override config.
import { loadConfig } from "../../../../src/server/Config";
loadConfig(undefined, true);

// File imports
import { getConnection, stop } from "../../../../src/server/database";
import User, { DatabaseUser } from "../../../../src/server/database/models/User";

/**
 * Global clean-up.
 */
afterAll(async done => {
	await stop();
	done();
});

describe("insertOrUpdate", () => {
	it("inserts a new user", async () => {
		// Insert the user.
		let result = await User.insertOrUpdate({
			userId: -4,
			login: "test-user-4"
		});

		// Check result.
		expect(result).toEqual(true);
		if (result) {
			// Connect to database.
			let connection = await getConnection();
			if (connection) {
				// Check insertion.
				let user : DatabaseUser = await connection("User").where({userId: -4}).first();
				expect(user).not.toBeNull();
				expect(user.login).toEqual("test-user-4");

				// Clean-up.
				await connection("User").where({userId: -4}).del();
			}
		}
	});

	it("updates an existing user", async () => {
		// Insert the user.
		let result = await User.insertOrUpdate({
			userId: -5,
			login: "test-user-5"
		});

		// Check result.
		expect(result).toEqual(true);
		if (result) {
			// Connect to database.
			let connection = await getConnection();
			if (connection) {
				// Check insertion.
				let user : DatabaseUser = await connection("User").where({userId: -5}).first();
				expect(user).not.toBeNull();
				if (user) {
					// Update the user.
					let updateResult = await User.insertOrUpdate({
						userId: -5,
						login: "test-user-5-new-name"
					});

					expect(updateResult).toEqual(true);
					if (updateResult) {
						// Check update.
						let user : DatabaseUser = await connection("User").where({userId: -5}).first();
						expect(user).not.toBeNull();
						expect(user.login).toEqual("test-user-5-new-name");
					}

					// Clean-up.
					await connection("User").where({userId: -5}).del();
				}
			}
		}
	});
});