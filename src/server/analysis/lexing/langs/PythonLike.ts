/**
 * @file Lexer definitions for langauges that have Python-like comments.
 * - Python
 */

// Modules
import { Lexer, TokenType } from "../Lexer";

const lexer : Lexer = {
	extensions: [
		// Python
		"py"
	],
	definitions: [{
		type: TokenType.Documentation,
		expression: /^((#[^\r\n]*?(?=$|\r|\n))|('''((.|\r|\n)*?)''')|("""((.|\r|\n)*?)"""))/
	}, {
		type: TokenType.Whitespace,
		expression: /^(\r|\n)\s*/
	}, {
		type: TokenType.Code,
		expression: /^[^\r\n]+?(?=#|"|'|\r|\n|$)/
	}, {
		type: TokenType.String,
		expression: /^(("(?:[^"\\\n]|\\.)*")|('(?:[^'\\\n]|\\.)*'))/
	}]
};

export default lexer;