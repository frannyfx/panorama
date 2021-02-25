/**
 * @file Implementation of Christian Urban's POSIX lexer using derivatives of regular expressions.
 * @author Francesco Compagnoni
 */

// TODO: Refactor different lexers into their own files.

// Modules
const logger = require("../../utils/logger")("lexer");
import { ARExp, Bit, C, S, Z } from "./AnnotatedRegex";
import { Alt, Char, CharSet, NTimes, One, Optional, Plus, Range, Rec, RExp, Seq, Simplification, Star } from "./Regex";
import { Character, Empty, Left, RecV, Right, Sequence, Stars, Value } from "./Value";

// Enums
export enum TokenType {
	Documentation,
	Code,
	Whitespace
};

// Interfaces
export interface Token {
	type: TokenType,
	match: string,
	position?: {
		start: number,
		end: number
	}
};

export interface Lexer {
	extensions: string[],
	expression: RExp
};

/**
 * Inject characters of the string back into the values.
 * @param r The regular expression.
 * @param c The character to inject.
 * @param v The value in which to inject the character.
 */
export function inject(r: RExp, c: string, v: Value) : Value {
	if (r.constructor == Char && v.constructor == Empty)
		return new Character(c);

	if (r.constructor == Alt) {
		let alt = <Alt>r;
		if (v.constructor == Left) {
			let left = <Left>v;
			return new Left(inject(alt.left, c, left.value));
		}
		
		if (v.constructor == Right) {
			let right = <Right>v;
			return new Right(inject(alt.right, c, right.value));
		}
	}

	if (r.constructor == Seq) {
		let seq = <Seq>r;
		if (v.constructor == Sequence) {
			let sequence = <Sequence>v;
			return new Sequence(inject(seq.left, c, sequence.value1), sequence.value2);
		}

		if (v.constructor == Left) {
			let left = <Left>v;
			if (left.value.constructor == Sequence) {
				let sequence = <Sequence>left.value;
				return new Sequence(inject(seq.left, c, sequence.value1), sequence.value2);
			}
		}

		if (v.constructor == Right) {
			let right = <Right>v;
			return new Sequence(seq.left.mkeps(), inject(seq.right, c, right.value));
		}
	}

	if (r.constructor == Star) {
		let star = <Star>r;
		if (v.constructor == Sequence) {
			let sequence = <Sequence>v;
			if (sequence.value2.constructor == Stars) {
				let stars = <Stars>sequence.value2;
				return new Stars([inject(star.exp, c, sequence.value1)].concat(stars.values));
			}
		}
	}

	if (r.constructor == Rec) {
		let rec = <Rec>r;
		return new RecV(rec.type, inject(rec.exp, c, v));
	}

	if (r.constructor == Range)
		return new Character(c);

	if (r.constructor == Plus) {
		let plus = <Plus>r;
		if (v.constructor == Sequence) {
			let sequence = <Sequence>v;
			if (sequence.value2.constructor == Stars) {
				let stars = <Stars>sequence.value2;
				return new Stars([inject(plus.exp, c, sequence.value1)].concat(stars.values));
			}
		}
	}

	if (r.constructor == NTimes) {
		let nTimes = <NTimes>r;
		if (v.constructor == Sequence) {
			let sequence = <Sequence>v;
			if (sequence.value2.constructor == Stars) {
				let stars = <Stars>sequence.value2;
				return new Stars([inject(nTimes.exp, c, sequence.value1)].concat(stars.values));
			}
		}
	}

	if (r.constructor == Optional) {
		let optional = <Optional>r;
		return inject(optional.exp, c, v);
	}

	throw new Error(`Unhandled combination of regular expression, character and value in inject function: (${r.constructor.name}, ${c}, ${v.constructor.name}).`);
}

/**
 * Recursively lex a string.
 * @deprecated
 * @param r The regular expression to use to lex the string.
 * @param input The string to lex.
 */
export function lex(r: RExp, input: string) : Value {
	// Base case.
	if (input.length == 0) {
		if (r.nullable()) {
			let result = r.mkeps();
			return result;
		} else throw new Error("Invalid character in input. " + input);	
	}

	// Simplify and lex.
	let simplification : Simplification = r.derivative(input[0]).simplify();
	return inject(r, input[0], simplification.simplify(lex(simplification.regex, input.substr(1))));
}

/**
 * Iteratively lex a string.
 * @param r The regular expression to use to lex the string.
 * @param input The input.
 */
export function lexIterative(r: RExp, input: string) : Value {
	// Generate the derivatives based on the characters in the input.
	let simplifications : Simplification[] = [];
	for (var i = 0; i < input.length; i++) {
		let regex = simplifications.length == 0 ? r : simplifications[i - 1].regex;
		simplifications.push(regex.derivative(input[i]).simplify());
	}

	// Store an array of values.
	let values : Value[] = [];

	// If the final simplified regex is not nullable, the input is invalid.
	if (simplifications[simplifications.length - 1].regex.nullable())
		values.push(simplifications[simplifications.length - 1].regex.mkeps());
	else throw new Error("Invalid character in input.");

	// Apply the injections.
	for (var i = simplifications.length - 1; i >= 0; i--) {
		// Apply the current simplification to the last value added.
		let simplified = simplifications[i].simplify(values[values.length - 1]);

		// Inject the current character into the previous regex.
		values.push(inject(i == 0 ? r : simplifications[i - 1].regex, input[i], simplified));
	}

	// Return the final value.
	return values[values.length - 1];
}

/**
 * Iteratively lex a string using a more advanced lexing method.
 * @param r The regular expression to use to lex the string.
 * @param input The input.
 */
export function lexAdvanced(r: RExp, input: string) {
	// Convert regular expression to annotated regular expression.
	let internalised : ARExp = r.internalise();

	// Generate the derivatives based on the characters in the input.
	let derivatives : ARExp[] = [];
	for (var i = 0; i < input.length; i++) {
		let regex = derivatives.length == 0 ? internalised : derivatives[i - 1];
		derivatives.push(regex.derivative(input[i]).simplify());
	}

	// If the final derivative is not nullable, the lexing process failed.
	let finalDerivative = derivatives[derivatives.length - 1];
	if (!finalDerivative.nullable()) throw new Error("Invalid character in input.");

	// Decode the final derivative.
	let tokens = decode([r], finalDerivative.mkeps());
	return tokens;
}

/**
 * Bit decoding function.
 */
function decode(expressions: RExp[], bits: Bit[]) : Token[] {
	// List of tokens to store values in.
	let tokens : Token[] = [];

	// Infinite loop prevention.
	let lastExpression = "", lastBit = "";
	while(expressions.length > 0 && bits.length > 0) {
		// Prevent an infinite loop from occurring (this should not happen but it's here for debugging purposes).
		if (expressions[0].toString() == lastExpression && bits[0].toString() == lastBit)
			throw new Error("Infinite loop detected in decode function.");

		lastExpression = expressions[0].toString();
		lastBit = bits[0].toString();

		// Get the current expression.
		let expression = expressions[0];

		// ONE - Remove the current expression.
		if (expression.constructor == One) {
			expressions = expressions.slice(1);
			continue;
		}

		// ALT.
		if (expression.constructor == Alt) {
			let alt = <Alt>expression;

			// Switch bits.
			if (bits[0].constructor == Z) {
				expressions = [alt.left].concat(expressions.slice(1));
				bits = bits.slice(1);
				continue;
			}

			if (bits[0].constructor == S) {
				expressions = [alt.right].concat(expressions.slice(1));
				bits = bits.slice(1);
				continue;
			}
		}

		// SEQ.
		if (expression.constructor == Seq) {
			let seq = <Seq>expression;
			expressions = [seq.left, seq.right].concat(expressions.slice(1));
			continue;
		}

		// STAR.
		if (expression.constructor == Star) {
			let star = <Star>expression;

			if (bits[0].constructor == Z) {
				expressions = [star.exp, star].concat(expressions.slice(1));
				bits = bits.slice(1);
				continue;
			}

			if (bits[0].constructor == S) {
				expressions = expressions.slice(1);
				bits = bits.slice(1);
				continue;
			}
		}

		// REC.
		if (expression.constructor == Rec) {
			let rec = <Rec>expression;
			expressions = [rec.exp].concat(expressions.slice(1));
			tokens.unshift({
				type: rec.type,
				match: ""
			});
		}

		// Characters.
		if (bits[0].constructor == C && (expression.constructor == Char || expression.constructor == CharSet || expression.constructor == Range)) {
			// Get the character and remove the first expression and bit.
			let charBit = <C>bits[0];
			expressions = expressions.slice(1);
			bits = bits.slice(1);

			// Add the new character to the latest token.
			tokens[0].match = charBit.char + tokens[0].match;
			continue;
		}
	}

	return tokens.reverse();
}

/**
 * Get the series of tokens from lexing the string including the line numbers where each token begins and ends.
 * @param r The regular expression to lex the string with.
 * @param input The string to lex.
 */
export function getTokens(r: RExp, input: string) : Token[] {
	let result = lexIterative(r, input).env();

	// Calculate line numbers.
	var currentLineNumber = 1;
	result.map(token => {
		// Find number of new-line characters in the token.
		let numLines = (token.match.match(/\n/g)||[]).length;

		// Write the position to the token.
		token.position = {
			start: currentLineNumber,
			end: currentLineNumber + numLines
		};

		// Update the counter.
		currentLineNumber += numLines;
	});

	return result;
}

/**
 * Test the performance of different lexing methods.
 */
export function testLexing() {
	try {
		logger.info("Running performance test...");
		// Set up test language.
		let language : RExp = new Rec(TokenType.Documentation, new Seq(new Seq(new Char("/"), new Char("*")), new Seq(
			new Star(new Char("1")),
			new Seq(
				new Char("*"), new Char("/")
			))
		));

		// Loop through lengths of strings to match.
		for (var i = 0; i <= 2000; i += 250) {
			// Make the test string.
			let string = `/*${"1".repeat(i)}*/`;

			// Test iterative.
			console.time(`iter_${i}`);
			lexIterative(language, string);
			console.timeEnd(`iter_${i}`);

			// Test recursive.
			console.time(`recur_${i}`);
			lex(language, string);
			console.timeEnd(`recur_${i}`);

			console.time(`advanced_${i}`);
			lexAdvanced(language, string);
			console.timeEnd(`advanced_${i}`);

			// Add new line.
			console.log("");
		}
		
	} catch (e) {
		logger.error(`An error occurred while running performance test: ${e}.`);
	}
}