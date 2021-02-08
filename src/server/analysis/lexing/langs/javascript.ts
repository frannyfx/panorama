// Imports
// ...

// Modules
import { Lexer } from "../Lexer";
import { Char, Star } from "../Regex";

// Implement lexer.
const lexer : Lexer = {
	extensions: ["js"],
	expression: new Star(new Char("x"))
};

export default lexer;