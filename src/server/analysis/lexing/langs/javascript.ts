// Imports
// ...

// Modules
import { Lexer } from "../Lexer";
import { Alt, Char, Range, Rec, RExp, Seq, Star } from "../Regex";

// Constants
let acceptableCharacters : string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890()[]{}-_$.,:;\"'=+`\t ";
let asterisk : string = "*";
let slash : string  = "/";
let newLineCharacters : string = "\r\n";
let comment : RExp = new Seq(new Char("/"), new Seq(new Char("*"), new Seq(new Star(new Alt(new Range(acceptableCharacters + newLineCharacters), new Seq(new Char(asterisk), new Range(acceptableCharacters + asterisk + newLineCharacters)))), new Seq(new Char("*"), new Char("/")))));

// Implement lexer.
const lexer : Lexer = {
	extensions: ["js"],
	expression: new Star(
		new Alt(
			new Alt(
				new Rec("Comment", comment),
				new Rec("Code", new Star(new Range(acceptableCharacters + asterisk + slash)))
			),
			new Rec("Break", new Star(new Range(newLineCharacters)))
		)
	)
};

export default lexer;