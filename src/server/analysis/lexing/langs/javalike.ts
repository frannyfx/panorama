/**
 * @file Lexer for languages that have Java-like comments.
 * The languages include:
 * - Java
 * - JavaScript
 * - TypeScript
 * - Scala
 * - C
 * - C++
 * - C#
 */

// Imports
// ...

// Modules
import { Lexer, TokenType } from "../Lexer";
import { Alt, Char, Range, Rec, RExp, Seq, Star } from "../Regex";

// Constants
const ACCEPTABLE_CHARS : string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890()[]{}-_$.,:;\"'=+`!?\t\\@|~%^£€&#>< "; // TODO: Be able to define Unicode ranges for character lists.
const ASTERISK : string = "*";
const SLASH : string  = "/";
const NEWLINE_CHARS : string = "\r\n";

// Tokens
const DOCUMENTATION_TOKEN : RExp = new Alt(
	new Seq(new Char("/"), new Seq(new Char("*"), new Seq(new Star(new Alt(new Range(ACCEPTABLE_CHARS + NEWLINE_CHARS + SLASH), new Seq(new Char(ASTERISK), new Range(ACCEPTABLE_CHARS + ASTERISK + NEWLINE_CHARS)))), new Seq(new Char("*"), new Char("/"))))),
	new Seq(new Char("/"), new Seq(new Char("/"), new Seq(new Star(new Range(ACCEPTABLE_CHARS + ASTERISK + SLASH)), new Star(new Range(NEWLINE_CHARS)))))	
);

const CODE_TOKEN : RExp = new Star(new Range(ACCEPTABLE_CHARS + ASTERISK + SLASH));
const WHITESPACE_TOKEN : RExp = new Star(new Range(NEWLINE_CHARS + "\t "));

// Implement lexer.
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
		"cs"
	],
	expression: new Star(
		new Alt(
			new Alt(
				new Rec(TokenType.Documentation, DOCUMENTATION_TOKEN),
				new Rec(TokenType.Code, CODE_TOKEN)
			),
			new Rec(TokenType.Whitespace, WHITESPACE_TOKEN)
		)
	)
};

export default lexer;