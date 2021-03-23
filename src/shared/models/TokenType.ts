/**
 * @file Interfaces for Token data.
 * @author Francesco Compagnoni
 */

// Interfaces
/**
 * The interface matching the Token table in the database.
 */
export interface TokenType {
	tokenId: number,
	name: string,
	colour?: string
};

/**
 * Interface which maps an extension to a FileType.
 */
export interface TokenMap {
	[key: string]: TokenType
};