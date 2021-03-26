// Imports
import { promises as fs } from "fs";
import { tmpdir } from "os";
import path from "path";
import { generateKeyPair, RSAKeyPairOptions } from "crypto";
import { v4 as uuid } from "uuid";

// Constants
const testDir = path.join(tmpdir(), uuid());
const privateKeyDir = path.join(testDir, "key.pem");
const keyGenerationSettings : RSAKeyPairOptions<"pem", "pem"> = {
	modulusLength: 4096,
	publicKeyEncoding: {
		type: "spki",
		format: "pem"
	},
	privateKeyEncoding: {
		type: "pkcs8",
		format: "pem"
	}
};

beforeAll(async done => {
	// Create private key.
	generateKeyPair("rsa", keyGenerationSettings, async (err: any, publicKey: string, privateKey: string) => {
		// If an error occurred while generating the key, fail.
		if (err) return done.fail();
		
		// Write private key somewhere.
		await fs.mkdir(testDir, { recursive: true });
		await fs.writeFile(privateKeyDir, privateKey);
		done();
	});
});

afterAll(async done => {
	await fs.unlink(privateKeyDir);
	await fs.rmdir(testDir);
	done();
});

// Test set-up
beforeEach(() => {
	jest.resetModules();
});

describe("ticket", () => {
	it("sign returns null with an invalid config file", async () => {
		// Mock config file.
		let config = await import("../../../src/server/Config");
		config.loadConfig({ crypto: {} });

		// Import module.
		let ticket = await import("../../../src/server/crypto/ticket");
		await expect(ticket.sign({ hello: "world" })).resolves.toBeNull();
	});

	it("verify returns null with an invalid config file", async () => {
		// Mock config file.
		let config = await import("../../../src/server/Config");
		config.loadConfig({ crypto: {} });

		// Import module.
		let ticket = await import("../../../src/server/crypto/ticket");

		// Test verification.
		let verifyResult = await ticket.verify("");
		expect(verifyResult.ok).toEqual(false);
	});

	it("generates valid JWTs with a valid config file", async () => {
		// Mock config file.
		let config = await import("../../../src/server/Config");
		config.loadConfig({ crypto: { keyDir: privateKeyDir } });

		// Import module.
		let ticket = await import("../../../src/server/crypto/ticket");

		// Test signature.
		let signedResult = await ticket.sign({ hello: "world" });
		expect(signedResult).not.toBeNull();

		// Test verification.
		let verifyResult = await ticket.verify(signedResult!);
		expect(verifyResult.ok).toEqual(true);
		expect(verifyResult.decoded!.hello).toEqual("world");
	});
});