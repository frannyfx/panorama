/**
 * @file Create signed tickets using JWT and an RSA private key.
 * @author Francesco Compagnoni
 */

// Imports
import jwt from "jsonwebtoken";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

// Logger
import createLogger from "../utils/logger";
const logger = createLogger("cryp_tk");

// Config
import { loadConfig } from "../Config";
const config = loadConfig();

// Modules
import getRoot from "../utils/root";
import { Data } from "../../shared/Result";

// Constants
var privateKey : string = "";
var publicKey : string = "";

// Interfaces
export interface TicketVerificationResult {
	ok: boolean,
	decoded?: Data
};

/**
 * Cache the private key and return it.
 * @return The private key.
 */
async function getPrivateKey() : Promise<string | null> {
	// Load cached private key.
	if (privateKey != "") return privateKey;

	// Otherwise, load it from assets directory.
	try {
		privateKey = (await fs.readFile(path.join(getRoot(), config.crypto.keyDir))).toString("utf-8");
		return privateKey;
	} catch (e) {
		logger.error(`Failed to load private key - ${e}`);
		return null;
	}
}

/**
 * Extract the public key from the private key, cache it and return it.
 * @return The public key.
 */
async function getPublicKey() : Promise<string | null> {
	// Load cached public key
	if (publicKey != "") return publicKey;
	
	// Load private key.
	let pk = await getPrivateKey();
	if (!pk) return null;

	try {
		publicKey = crypto.createPublicKey({
			key: pk, format: "pem"
		}).export({format: "pem", type: "spki"}).toString("utf-8");
		return publicKey;
	} catch (e) {
		logger.error(`Failed to extract public key from private key - ${e}`);
		return null;
	}
}

/**
 * Sign a piece of data. 
 * @param data The string to sign.
 */
export function sign(data: Data) : Promise<string | null> {
	// Have to use promises since JWT does not support async/await.
	return new Promise(async resolve => {
		// Get the private key.
		let key = await getPrivateKey();
		if (!key || key == "") return null;

		// Sign the content.
		jwt.sign(data, key, { algorithm: "RS256" }, (err, token) => {
			// Fail gracefully.
			if (err || !token) {
				logger.error(`Unable to sign data. Error: ${err}`);
				return resolve(null);
			}

			resolve(token);
		});
	});
}

/**
 * Verify the signature of a signed piece of data.
 * @param data The signed data.
 */
export function verify(data: string) : Promise<TicketVerificationResult> {
	// Have to use promises since JWT does not support async/await.
	return new Promise(async resolve => {
		// Get the public key.
		let key = await getPublicKey();
		if (!key || key == "") return null;

		// Verify the token.
		jwt.verify(data, key, (err, decoded) => {
			if (err || !decoded) return resolve({ ok: false });
			resolve({ ok: true, decoded });
		});
	});
}

export default {
	sign, verify
};