/**
 * @file Value class which describes how a regular expression was matches.
 * @author Francesco Compagnoni
 */

// Interfaces
export interface Token {
	name: string,
	match: string
};

/**
 * Abstract value class.
 */
export abstract class Value {
	abstract flatten() : string;
	abstract env() : Token[];
}

export class Empty extends Value {
	flatten() {
		return "";
	}

	env() {
		return [];
	}
}

export class Character extends Value {
	char: string;
	constructor(char: string) {
		super();
		this.char = char;
	}

	flatten() {
		return this.char;
	}

	env() {
		return [];
	}
}

export class Sequence extends Value {
	value1: Value;
	value2: Value;
	constructor(value1: Value, value2: Value) {
		super();
		this.value1 = value1;
		this.value2 = value2;
	}

	flatten() {
		return this.value1.flatten() + this.value2.flatten();
	}

	env() {
		return this.value1.env().concat(this.value2.env());
	}
}

export class Left extends Value {
	value: Value;
	constructor(value: Value) {
		super();
		this.value = value;
	}

	flatten() {
		return this.value.flatten();
	}

	env() {
		return this.value.env();
	}
}

export class Right extends Value {
	value: Value;
	constructor(value: Value) {
		super();
		this.value = value;
	}

	flatten() {
		return this.value.flatten();
	}

	env() {
		return this.value.env();
	}
}

export class Stars extends Value {
	values: Value[];
	constructor(values: Value[]) {
		super();
		this.values = values;
	}

	flatten() {
		return this.values.map(value => value.flatten()).join("");
	}

	env() {
		return this.values.flatMap(value => value.env());
	}
}

export class RecV extends Value {
	comment: string;
	value: Value;
	constructor(comment: string, value: Value) {
		super();
		this.comment = comment;
		this.value = value;
	}

	flatten() {
		return this.value.flatten();
	}

	env() {
		let token : Token = {
			name: this.comment,
			match: this.value.flatten()
		};

		return [token].concat(this.value.env());
	}
}