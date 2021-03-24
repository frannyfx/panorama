/**
 * @file Lexer definitions for langauges that have HTML-like comments.
 * - HTML
 * - XML
 * - Handlebars
 * - Vue
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
		"hbs",

		// Vue.js
		"vue"
	],
	definitions: [{
		type: TokenType.Documentation,
		expression: /^(<!--.*-->)/
	}, {
		type: TokenType.Whitespace,
		expression: /^(\r|\n)\s*/
	}, {
		type: TokenType.Code,
		expression: /^[^\r\n]+?(?=(<!--)|\r|\n|$)/
	}]
};

export default lexer;