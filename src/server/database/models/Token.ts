/**
 * @file Operations for the Token database model.
 * @author Francesco Compagnoni
 */

// Imports
import { getConnection } from "../";

// Models
import { TokenType, TokenMap } from "../../../shared/models/TokenType";

/**
 * Get an object mapping extensions to file types.
 * @param extensions The extensions to map file types to.
 * @returns The extension map.
 */
async function lookupTokens(tokens: number[]) : Promise<TokenMap> {
	// Get connection.
	let connection = await getConnection();
	if (!connection) return {};

	// Get tokens.
	let matchingTokens : TokenType[] = await connection.select("*").from("TokenType").whereIn("tokenId", tokens);

	// Map token ID to token.
	let tokenMap : TokenMap = {};
	matchingTokens.map(tokenType => {
		tokenMap[tokenType.tokenId] = {
			tokenId: tokenType.tokenId,
			name: tokenType.name,
			colour: tokenType.colour
		};
	});

	return tokenMap;
}

export default {
	lookupTokens
};