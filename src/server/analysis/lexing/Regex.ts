/**
 * @file Regular expression engine with derivatives.
 * @author Francesco Compagnoni
 */

// Modules
import { Empty, Left, RecV, Right, Sequence, Stars, Value } from "./Value";

// Simplification
export interface Simplification {
	regex: RExp,
	simplify: (_ : Value) => Value
};

// Simplification functions.
/**
 * Identity function for simplifications.
 * @param v The value to simplify.
 */
function simplifyID(v: Value) : Value {
	return v;
}

/**
 * Error function to prevent invalid states.
 * @param v The value to simplify.
 */
function simplifyError(v: Value) : Value {
	throw new Error("Simplification error.");
}

/**
 * Regular expression base abstract class.
 */
export abstract class RExp {
	/**
	 * Whether the regular expression can match the empty string.
	 */
	abstract nullable() : boolean;

	/**
	 * Generate the derivative of the regular expression with respect to a character.
	 * @param char The character for which to generate the derivative.
	 */
	abstract derivative(char: string) : RExp;

	/**
	 * The mkeps implementation for the current regular expression.
	 */
	mkeps() : Value {
		throw new Error(`Unhandled regular expression for mkeps: '${this.constructor.name}'.`);
	}

	/**
	 * Simplify the regular expression.
	 */
	simplify() : Simplification {
		return {
			regex: this,
			simplify: simplifyID
		};
	}

	/**
	 * Return a string representation of the regular expression.
	 */
	abstract toString() : string;
}

// Regular expression base cases.
/**
 * Regular expression that matches nothing.
 */
export class Zero extends RExp {
	nullable() {
		return false;
	}

	derivative(char: string) : RExp {
		return new Zero();
	}

	toString() {
		return "Zero";
	}
};

/**
 * Regular expression that matches only the empty string.
 */
export class One extends RExp {
	nullable() {
		return true;
	}

	derivative(char: string) : RExp {
		return new Zero();
	}

	mkeps() : Value {
		return new Empty();
	}

	toString() {
		return "One";
	}
};

/**
 * Regular expression that matches a character.
 */
export class Char extends RExp {
	char: string;
	constructor(char : string) {
		super();
		this.char = char;
	}

	nullable() {
		return false;
	}

	derivative(char: string) : RExp {
		if (this.char == char) return new One();
		return new Zero();
	}

	toString() {
		return `Char(${this.char})`;
	}
}

/**
 * Regular expression that matches either the first regular expression or the second.
 */
export class Alt extends RExp {
	left: RExp;
	right: RExp;
	constructor(left: RExp, right: RExp) {
		super();
		this.left = left;
		this.right = right;
	}

	nullable() {
		return this.left.nullable() || this.right.nullable();
	
	}

	derivative(char: string) : RExp {
		return new Alt(this.left.derivative(char), this.right.derivative(char));
	}

	mkeps() : Value {
		if (this.left.nullable()) return new Left(this.left.mkeps());
		return new Right(this.right.mkeps());
	}

	simplify() : Simplification {
		let simpLeft = this.left.simplify();
		let simpRight = this.right.simplify();

		if (simpLeft.regex.constructor == Zero)
			return {
				regex: simpRight.regex,
				simplify: (v : Value) => {
					return new Right(simpRight.simplify(v));
				}
			};

		if (simpRight.regex.constructor == Zero)
			return {
				regex: simpLeft.regex,
				simplify: (v: Value) => {
					return new Left(simpLeft.simplify(v));
				}
			};

		if (simpLeft.regex.toString() == simpRight.regex.toString())
			return {
				regex: simpLeft.regex,
				simplify: (v: Value) => {
					return new Left(simpLeft.simplify(v));
				}
			};
		else return {
			regex: new Alt(simpLeft.regex, simpRight.regex),
			simplify: (v: Value) => {
				if (v.constructor == Right) {
					let right = <Right>v;
					return new Right(simpRight.simplify(right.value));
				}

				if (v.constructor == Left) {
					let left = <Left>v;
					return new Left(simpLeft.simplify(left.value));
				}

				return v;
			}
		};
	}

	toString() {
		return `Alt(${this.left.toString()},${this.right.toString()})`;
	}
}

/**
 * Regular expression that matches the first regular expression followed by the second.
 */
export class Seq extends RExp {
	left: RExp;
	right: RExp;
	constructor(left: RExp, right: RExp) {
		super();
		this.left = left;
		this.right = right;
	}

	nullable() {
		return this.left.nullable() && this.right.nullable();
	}

	derivative(char: string) : RExp {
		if (this.left.nullable()) return new Alt(new Seq(this.left.derivative(char), this.right), this.right.derivative(char));
		return new Seq(this.left.derivative(char), this.right);
	}

	mkeps() : Value {
		return new Sequence(this.left.mkeps(), this.right.mkeps());
	}

	simplify() : Simplification {
		let simpLeft = this.left.simplify();
		let simpRight = this.right.simplify();

		if (simpLeft.regex.constructor == Zero || simpRight.regex.constructor == Zero)
			return {
				regex: new Zero(),
				simplify: simplifyError
			};

		if (simpLeft.regex.constructor == One)
			return {
				regex: simpRight.regex,
				simplify: (v: Value) => {
					return new Sequence(simpLeft.simplify(new Empty()), simpRight.simplify(v));
				}
			};

		if (simpRight.regex.constructor == One)
			return {
				regex: simpLeft.regex,
				simplify: (v: Value) => {
					return new Sequence(simpLeft.simplify(v), simpRight.simplify(new Empty()));
				}
			};

		return {
			regex: new Seq(simpLeft.regex, simpRight.regex),
			simplify: (v: Value) => {
				if (v.constructor == Sequence) {
					let sequence = <Sequence>v;
					return new Sequence(simpLeft.simplify(sequence.value1), simpRight.simplify(sequence.value2));
				}

				return v;
			}
		};
	}

	toString() {
		return `Seq(${this.left.toString()},${this.right.toString()})`;
	}
}

/**
 * Regular expression that matches zero or more of a regular expression.
 */
export class Star extends RExp {
	exp: RExp;
	constructor(exp: RExp) {
		super();
		this.exp = exp;
	}

	nullable() {
		return true;
	}

	derivative(char: string) : RExp {
		return new Seq(this.exp.derivative(char), new Star(this.exp));
	}

	mkeps() : Value {
		return new Stars([]);
	}

	toString() {
		return `Star(${this.exp.toString()})`;
	}
}

/**
 * Regular expression that matches a range of characters.
 */
export class Range extends RExp {
	range: string;
	constructor(range: string) {
		super();
		this.range = range;
	}

	nullable() {
		return false;
	}

	derivative(char: string) {
		if (this.range.indexOf(char) != -1) return new One();
		return new Zero();
	}

	toString() {
		return `Range(${this.range})`;
	}
}

/**
 * Regular expression that matches a regular expression one or more times.
 */
export class Plus extends RExp {
	exp: RExp;
	constructor(exp: RExp) {
		super();
		this.exp = exp;
	}

	nullable() {
		return this.exp.nullable();
	}

	derivative(char : string) {
		return new Seq(this.exp.derivative(char), new Star(this.exp));
	}

	mkeps() : Value {
		return new Stars([]);
	}

	toString() {
		return `Plus(${this.exp.toString()})`;
	}
}

/**
 * Regular expression that makes its child regular expression optional.
 */
export class Optional extends RExp {
	exp: RExp;

	constructor(exp: RExp) {
		super();
		this.exp = exp;
	}

	nullable() {
		return true;
	}

	derivative(char : string) {
		return this.exp.derivative(char);
	}

	mkeps() : Value {
		return new Empty();
	}

	toString() {
		return `Opt(${this.exp.toString()})`;
	}
}

/**
 * Regular expression that matches a regular expression n times.
 */
export class NTimes extends RExp {
	exp: RExp;
	count: number;

	constructor(exp: RExp, count: number) {
		super();
		this.exp = exp;
		this.count = count;
	}

	nullable() {
		if (this.count == 0) return true;
		return this.exp.nullable();
	}

	derivative(char: string) : RExp {
		if (this.count == 0) return new Zero();
		return new Seq(this.exp.derivative(char), new NTimes(this.exp, this.count - 1));
	}

	mkeps() : Value {
		if (this.count == 0) return new Stars([]);
		return new Stars([this.exp.mkeps()]);
	}

	toString() {
		return `(${this.exp.toString()}){${this.count}}`;
	}
}

/**
 * Regular expression that matches what its child regular expression doesn't.
 */
export class Not extends RExp {
	exp: RExp;

	constructor(exp: RExp) {
		super();
		this.exp = exp;
	}

	nullable() {
		return !this.exp.nullable();
	}

	derivative(char: string) {
		return new Not(this.exp.derivative(char));
	}

	toString() {
		return `~(${this.exp.toString()})`;
	}
}

/**
 * Regular expression for debugging that includes a comment along with a regular expression.
 */
export class Rec extends RExp {
	comment: string;
	exp: RExp;
	constructor(comment: string, exp: RExp) {
		super();
		this.comment = comment;
		this.exp = exp;
	}

	nullable() {
		return this.exp.nullable();
	}

	derivative(char: string) {
		return this.exp.derivative(char);
	}

	mkeps() {
		return new RecV(this.comment, this.exp.mkeps());
	}

	toString() {
		return `(${this.comment}, ${this.exp.toString()})`;
	}
}

export default {

};