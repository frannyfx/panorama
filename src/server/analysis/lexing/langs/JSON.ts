/**
 * @file Lexer definitions for JSON.
 */

// Modules
import { Lexer, TokenType } from "../Lexer";

const lexer : Lexer = {
	extensions: ["json"],
	definitions: [{
		type: TokenType.Whitespace,
		expression: /^(\r|\n)\s*/
	}, {
		type: TokenType.Code,
		expression: /^.+?(?=\n|$)/
	}]
};

export default lexer;