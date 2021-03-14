/**
 * @file Lexer definitions for langauges that have HTML-like comments.
 * - HTML
 * - XML
 * - Handlebars
 */

// Modules
import { Lexer, TokenType } from "../Lexer";

const lexer : Lexer = {
	extensions: [
		// HTML
		"html",
		"htm",
		
		// XML
		"xml",

		// Handlebars
		"hbs"
	],
	definitions: [{
		type: TokenType.Documentation,
		expression: /^<!--.+-->/
	}, {
		type: TokenType.Whitespace,
		expression: /^\n\s*/
	}, {
		type: TokenType.Code,
		expression: /^.+?(?=(<!--)|\n|$)/
	}]
};

export default lexer;