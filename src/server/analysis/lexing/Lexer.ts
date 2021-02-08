/**
 * @file Implementation of Christian Urban's POSIX lexer using derivatives of regular expressions.
 * @author Francesco Compagnoni
 */

// Modules
const logger = require("../../utils/logger")("lexer");
import { Alt, Char, NTimes, Optional, Plus, Range, Rec, RExp, Seq, Simplification, Star } from "./Regex";
import { Character, Empty, Left, RecV, Right, Sequence, Stars, Value } from "./Value";

// Enums
export enum LineCategory {
	Documentation,
	Code
};

// Interfaces
export interface Lexer {
	extensions: string[],
	expression: RExp
};

export interface Token {
	name: string,
	match: string
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
				return new Stars(stars.values.concat(inject(star.exp, c, sequence.value1)));
			}
		}
	}

	if (r.constructor == Rec) {
		let rec = <Rec>r;
		return new RecV(rec.comment, inject(rec.exp, c, v));
	}

	if (r.constructor == Range)
		return new Character(c);

	if (r.constructor == Plus) {
		let plus = <Plus>r;
		if (v.constructor == Sequence) {
			let sequence = <Sequence>v;
			if (sequence.value2.constructor == Stars) {
				let stars = <Stars>sequence.value2;
				return new Stars(stars.values.concat(inject(plus.exp, c, sequence.value1)));
			}
		}
	}

	if (r.constructor == NTimes) {
		let nTimes = <NTimes>r;
		if (v.constructor == Sequence) {
			let sequence = <Sequence>v;
			if (sequence.value2.constructor == Stars) {
				let stars = <Stars>sequence.value2;
				return new Stars(stars.values.concat(inject(nTimes.exp, c, sequence.value1)));
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
 * Test the performance of the two methods of lexing.
 */
export function testLexing() {
	try {
		logger.info("Running performance test...");
		// Set up test language.
		let language : RExp = new Rec("Comment", new Seq(new Seq(new Char("/"), new Char("*")), new Seq(
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

			// Add new line.
			console.log("");
		}
	} catch (e) {
		logger.error(`An error occurred while running performance test: ${e}.`);
	}
}