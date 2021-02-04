/**
 * @file Lexer interfaces.
 * @author Francesco Compagnoni
 */

// Enums
export enum LineCategory {
	Documentation,
	Code
};

// Interfaces
export interface Lexer {
	extensions: string[],
};