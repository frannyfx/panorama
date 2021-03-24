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
 * - Swift
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
		"dart",

		// Swift
		"swift"
	],
	definitions: [{
		type: TokenType.Documentation,
		expression: /^((\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/)|(\/\/[^\r\n]*?(?=$|\r|\n)))/
	}, {
		type: TokenType.Whitespace,
		expression: /^(\r|\n)\s*/
	}, {
		type: TokenType.Code,
		expression: /^[^\r\n]+?(?=\/\/|\/\*|"|'|`|\r|\n|$)/
	}, {
		type: TokenType.String,
		expression: /^(("(?:[^"\\\n]|\\.)*")|('(?:[^'\\\n]|\\.)*')|(`(?:[^`\\\n]|\\.)*`))/
	}]
};

export default lexer;