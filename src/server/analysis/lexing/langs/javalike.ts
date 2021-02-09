/**
 * @file Lexer for Java-like languages.
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
import { Lexer } from "../Lexer";
import { Alt, Char, Range, Rec, RExp, Seq, Star } from "../Regex";

// Constants
let acceptableCharacters : string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890()[]{}-_$.,:;\"'=+`!?\t\\@|~%^£€&#>< ";
let asterisk : string = "*";
let slash : string  = "/";
let newLineCharacters : string = "\r\n";
let comment : RExp = new Alt(
	new Seq(new Char("/"), new Seq(new Char("*"), new Seq(new Star(new Alt(new Range(acceptableCharacters + newLineCharacters + slash), new Seq(new Char(asterisk), new Range(acceptableCharacters + asterisk + newLineCharacters)))), new Seq(new Char("*"), new Char("/"))))),
	new Seq(new Char("/"), new Seq(new Char("/"), new Seq(new Star(new Range(acceptableCharacters + asterisk + slash)), new Star(new Range(newLineCharacters)))))	
);

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
				new Rec("Comment", comment),
				new Rec("Code", new Star(new Range(acceptableCharacters + asterisk + slash)))
			),
			new Rec("Whitespace", new Star(new Range(newLineCharacters + "\t ")))
		)
	)
};

export default lexer;