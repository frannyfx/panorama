/**
 * @file Lexer definitions for langauges that have Java-like comments.
 * - Java
 * - JavaScript
 * - TypeScript
 * - Scala
 * - C
 * - C++
 * - C#
 * - Dart
 */

// Modules
import { Lexer, TokenType } from "../Lexer";

const lexer : Lexer = {
	extensions: [
		// Java
		"java",
		
		// JavaScript and TypeScript
		"js",
		"ts",
		
		// Scala
		"scala",
		"sc",
		
		// C
		"c",
		"h",

		// C++
		"cpp",
		"hpp",
		"cc",

		// C#
		"cs",

		// Dart
		"dart"
	],
	definitions: [{
		type: TokenType.Documentation,
		expression: /^((\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/)|(\/\/[^\n]*?(?=$|\n)))/
	}, {
		type: TokenType.Whitespace,
		expression: /^\n\s*/
	}, {
		type: TokenType.Code,
		expression: /^.+?(?=\/\/|\/\*|\n|$)/
	}]
};

export default lexer;