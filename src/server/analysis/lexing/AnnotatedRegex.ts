/**
 * @file Annotated regular expression engine with more advanced simplifications and derivatives.
 * @author Francesco Compagnoni
 */

// Modules
import { Alt, CharSet, One, Rec, RExp, Seq, Star, Zero } from "./Regex";

/**
 * Bit codes with additional information about matched characters.
 */
export abstract class Bit {
	abstract toString() : string ;
}

export class Z extends Bit {
	toString() : string {
		return "Z";
	}
};

export class S extends Bit {
	toString() : string {
		return "S";
	}
};

export class C extends Bit {
	char: string;
	constructor(char: string) {
		super();
		this.char = char;
	}

	toString() : string {
		return `C(${this.char})`;
	}
}

/**
 * Simplification utility functions.
 */

function flts(expressions: ARExp[]) : ARExp[] {
	let flattenedExpressions : ARExp[] = [];
	expressions.map(expression => {
		// Push child expressions in alternatives.
		if (expression.constructor == AAlt) {
			let alt = <AAlt>expression;
			let alternatives = alt.alternatives.map(alternative => alternative.fuse(alt.bits));
			flattenedExpressions.push(...alternatives);
		}

		// Remove AZeros.
		if (expression.constructor != AZero) flattenedExpressions.push(expression);
	});

	return flattenedExpressions;
}



/**
 * Base annotated regular expression abstract class.
 */
export abstract class ARExp {
	abstract erase() : RExp;
	abstract fuse(bits: Bit[]) : ARExp;
	abstract nullable() : boolean;
	mkeps() : Bit[] {
		throw new Error(`Cannot call mkeps on non-nullable annotated regular expression '${this.constructor.name}'.`);
	}

	abstract derivative(char: string) : ARExp;
	simplify() : ARExp {
		return this;
	}

	abstract toString() : string;
}

export class AZero extends ARExp {
	erase() : RExp {
		return new Zero();
	}

	fuse(bits: Bit[]) : ARExp {
		return this;
	}

	nullable() {
		return false;
	}

	derivative(char: string) : ARExp {
		return this;
	}

	toString() {
		return "AZero";
	}
}

export class AOne extends ARExp {
	bits: Bit[];
	constructor(bits: Bit[]) {
		super();
		this.bits = bits;
	}

	erase() : RExp {
		return new One();
	}

	fuse(bits: Bit[]) : ARExp {
		return new AOne(bits.concat(this.bits));
	}

	nullable() {
		return true;
	}

	mkeps() : Bit[] {
		return this.bits;
	}

	derivative(char: string) : ARExp {
		return new AZero();
	}

	toString() {
		return `AOne(bits: [${this.bits.map(bit => bit.toString()).join(", ")}])`;
	}
}

export class AAlt extends ARExp {
	bits: Bit[];
	alternatives: ARExp[];
	constructor(bits: Bit[], alternatives: ARExp[]) {
		super();
		this.bits = bits;
		this.alternatives = alternatives;
	}

	erase() : RExp {
		if (this.alternatives.length == 0) return new Zero();
		if (this.alternatives.length == 1) return this.alternatives[0].erase();
		return new Alt(this.alternatives[0].erase(), new AAlt(this.bits, this.alternatives.slice(1)).erase());
	}

	fuse(bits: Bit[]) : ARExp {
		return new AAlt(bits.concat(this.bits), this.alternatives);
	}

	nullable() {
		return this.alternatives.map(alternative => alternative.nullable()).filter(nullable => nullable).length > 0;
	}

	mkeps() : Bit[] {
		if (this.alternatives.length == 0) throw new Error("Cannot run mkeps on AAlt with no children.");
		if (this.alternatives.length == 1 || this.alternatives[0].nullable()) return this.bits.concat(this.alternatives[0].mkeps());
		return new AAlt(this.bits, this.alternatives.slice(1)).mkeps();
	}

	derivative(char: string) : ARExp {
		return new AAlt(this.bits, this.alternatives.map(alternative => alternative.derivative(char)));
	}

	simplify() : ARExp {
		// Remove duplicates.
		let uniqueRepresentations : string[] = [];
		let uniqueARExps : ARExp[] = [];

		// Flatten the alternatives.
		let flattened = flts(this.alternatives.map(alternative => alternative.simplify()));
		flattened.map(expression => {
			let rexp = expression.erase();
			let representation = rexp.toString();
			if (uniqueRepresentations.indexOf(representation) == -1) {
				uniqueRepresentations.push(representation);
				uniqueARExps.push(expression);
			}
		});

		// Return simplifications.
		if (uniqueARExps.length == 0) return new AZero();
		if (uniqueARExps.length == 1) return uniqueARExps[0].fuse(this.bits);

		// Simplification cannot be applied, return self.
		return new AAlt(this.bits, uniqueARExps);
	}

	toString() {
		return `AAlt(bits: [${this.bits.map(bit => bit.toString()).join(", ")}], alternatives: [${this.alternatives.map(alternative => alternative.toString()).join(", ")}])`;
	}
}

export class ASeq extends ARExp {
	bits: Bit[];
	left: ARExp;
	right: ARExp;
	constructor(bits: Bit[], left: ARExp, right: ARExp) {
		super();
		this.bits = bits;
		this.left = left;
		this.right = right;
	}

	erase() : RExp {
		return new Seq(this.left.erase(), this.right.erase());
	}

	fuse(bits: Bit[]) : ARExp {
		return new ASeq(bits.concat(this.bits), this.left, this.right);
	}

	nullable() {
		return this.left.nullable() && this.right.nullable();
	}

	mkeps() : Bit[] {
		return this.bits.concat(this.left.mkeps()).concat(this.right.mkeps());
	}

	derivative(char: string) : ARExp {
		if (this.left.nullable()) return new AAlt(this.bits, [new ASeq([], this.left.derivative(char), this.right), this.right.derivative(char).fuse(this.left.mkeps())]);
		return new ASeq(this.bits, this.left.derivative(char), this.right);
	}

	simplify() : ARExp {
		let left = this.left.simplify();
		let right = this.right.simplify();
		
		if (left.constructor == AZero || right.constructor == AZero) return new AZero();
		if (left.constructor == AOne) {
			let one = <AOne>left;
			return this.right.fuse(this.bits.concat(one.bits));
		}
		if (left.constructor == AAlt) {
			let alt = <AAlt>left;
			return new AAlt(this.bits.concat(alt.bits), alt.alternatives.map(alternative => new ASeq([], alternative, right)));
		}
		return new ASeq(this.bits, left, right);
	}

	toString() {
		return `ASeq(bits: [${this.bits.map(bit => bit.toString()).join(", ")}], left: ${this.left.toString()}, right: ${this.right.toString()})`;
	}
}

export class AStar extends ARExp {
	bits: Bit[];
	expression: ARExp;
	constructor(bits: Bit[], expression: ARExp) {
		super();
		this.bits = bits;
		this.expression = expression;
	}

	erase() : RExp {
		return new Star(this.expression.erase());
	}

	fuse(bits: Bit[]) : ARExp {
		return new AStar(bits.concat(this.bits), this.expression);
	}

	nullable() {
		return true;
	}

	mkeps() : Bit[] {
		return this.bits.concat([new S()]);
	}

	derivative(char: string) : ARExp {
		return new ASeq(this.bits, this.expression.derivative(char).fuse([new Z()]), new AStar([], this.expression));
	}

	toString() {
		return `AStar(bits: [${this.bits.map(bit => bit.toString()).join(", ")}], exp: ${this.expression.toString()})`;
	}
}

export class ACharSet extends ARExp {
	bits: Bit[];
	charFunction: (_: string) => boolean;
	constructor(bits: Bit[], charFunction : (_: string) => boolean) {
		super();
		this.bits = bits;
		this.charFunction = charFunction;
	}

	erase() : RExp {
		return new CharSet(this.charFunction);
	}

	fuse(bits: Bit[]) : ARExp {
		return new ACharSet(bits.concat(this.bits), this.charFunction);
	}

	nullable() {
		return false;
	}

	mkeps() : Bit[] {
		throw new Error("Cannot run mkeps on ACharSet.");
	}

	derivative(char: string) : ARExp {
		if (this.charFunction(char)) return new AOne(this.bits.concat([new C(char)]));
		return new AZero();
	}

	toString() {
		return `ACharSet(bits: [${this.bits.map(bit => bit.toString()).join(", ")}], charFunction: ${this.charFunction.toString()})`;
	}
}