/**
 * @file Native lexer based on the JavaScript regular expression engine.
 * @author Francesco Compagnoni
 */

// Modules
const logger = require("../../utils/logger")("lexer");

// Enums
/**
 * The type of code that a token has matched.
 */
export enum TokenType {
	Documentation = 0,
	Code = 1,
	Whitespace = 2,
	String = 3
};

// Interfaces
/**
 * A matched token containing its type, string matched and position in the text.
 */
export interface Token {
	type: TokenType,
	match: string,
	position?: {
		start: number,
		end: number
	}
};

/**
 * Linking a token type to a regular expression.
 */
export interface TokenDefinition {
	type: TokenType,
	expression: RegExp
};

/**
 * Interface that lexers must export.
 */
export interface Lexer {
	extensions: string[],
	definitions: TokenDefinition[]
};

/**
 * The match result for a specific token type.
 */
interface MatchResult {
	type: TokenType,
	match: RegExpMatchArray | null
};

/**
 * A group of tokens spanning various lines.
 */
export interface TokenGroup {
	start: number,
	end: number,
	lineData: Set<number>
}

/**
 * TypeScript type checker for lexers.
 * @param lexer The object to validate as a lexer.
 */
export function isLexer(lexer: any): lexer is Lexer {
	return true; // TODO: Do proper type checking.
}


/**
 * Break a string down into tokens.
 * @param lexer The lexer containing the rules on how to lex the input.
 * @param input The input to be lexed.
 */
export function lex(lexer: Lexer, input: string) : Token[] {
	// Create an list to store the lexed tokens.
	let tokens : Token[] = [];

	// The current character being processed.
	var i = 0;

	// Calculate line number as the string is being lexed.
	var lineNumber = 1;

	// Loop through the entire string.
	while (i < input.length) {
		// Slice the string by the current index.
		let inputString = input.slice(i);

		// Run all the regular expressions.
		let results : MatchResult[] = lexer.definitions.map(definition => {
			return {
				type: definition.type,
				match: definition.expression.exec(inputString)
			};
		});
		
		// Check if any matches were successful.
		let successfulResults = results.filter(result => result.match != null && result.match[0].length != 0);
		if (successfulResults.length == 0) throw new Error(`Unexpected symbol '${input[i]}' on line ${lineNumber}, file index ${i}.`);
		
		// Sort successful matches by longest, following the maximal munch principle.
		let bestMatch = successfulResults.sort((a : MatchResult, b: MatchResult) => b.match![0].length - a.match![0].length)[0];

		// Count the number of new lines in the match for line number calculations.
		let numLines = (bestMatch.match![0].match(/\n/g)||[]).length;

		// Add token to list of tokens.
		tokens.push({
			type: bestMatch.type,
			match: bestMatch.match![0],
			position: {
				start: lineNumber,
				end: lineNumber + numLines
			}
		});

		// Increment the character pointer by the number of characters matched, skipping the characters that were matched.
		i += bestMatch.match![0].length;

		// Increment the line number by the number of new line characters in the matched token.
		lineNumber += numLines;
	}

	return tokens;
}

/**
 * Group tokens together based on the lines in which they appear.
 * @param tokens The tokens to put into groups.
 */
export function generateTokenGroups(tokens: Token[]) : TokenGroup[] {
	// Create an array to store the groups.
	let groups : TokenGroup[] = [];

	// Filter out whitespaces that are one line in length.
	let filteredTokens : Token[] = tokens.filter(token => token.type != TokenType.Whitespace || (token.position!.end - token.position!.start) > 1);
	for (var i = 0; i < filteredTokens.length; i++) {
		// Get the current token.
		let token = filteredTokens[i];
		let nextToken : Token | null = i < filteredTokens.length - 1 ? filteredTokens[i + 1] : null;

		// Just add the first item.
		if (groups.length == 0) {
			groups.push({
				start: token.position!.start,
				end: token.position!.end,
				lineData: new Set([token.type])
			});
			continue;
		}

		// Calculate the number of lines the token takes up.
		let tokenLength = (token.position!.end - token.position!.start) + 1;
		let lastGroup : TokenGroup = groups[groups.length - 1];

		// The current token starts on the same line as the previous group.
		// Do not merge any whitespace groups.
		if (token.position!.start == lastGroup.end && token.type != TokenType.Whitespace && !lastGroup.lineData.has(TokenType.Whitespace)) {
			// Add the first line part to the last group.
			lastGroup.lineData.add(token.type);

			// Create new group to house the new section.
			if (tokenLength > 1) {
				groups.push({
					start: token.position!.start + 1,
					end: token.position!.end,
					lineData: new Set([token.type])
				});
			}
		} else if (token.type != TokenType.Whitespace && lastGroup.lineData.has(token.type) && lastGroup.lineData.size == 1 && token.position!.start == lastGroup.end + 1 && 
				(!nextToken || nextToken!.type == token.type || nextToken.position!.start != token.position!.end)) { // Perform lookahead to avoid wrong attribution of token types.
			// Expand the previous group if it only contains the current token type and we're on the next line.
			lastGroup.end = token.position!.end;
		} else {
			// The token starts after the end of the previous group.
			// Whitespaces must be treated differently for the line count to be accurate.
			groups.push({
				start: token.type == TokenType.Whitespace ? token.position!.start + 1 : token.position!.start,
				end: token.type == TokenType.Whitespace ? token.position!.end - 1 : token.position!.end,
				lineData: new Set([token.type])
			});
		}
	}

	// Remove whitespace from groups that have more than one token type.
	groups.map(group => {
		if (group.lineData.size > 1 && group.lineData.has(TokenType.Whitespace)) {
			group.lineData.delete(TokenType.Whitespace);
		}
	});
	
	return groups;
}