/**
 * @file Lexing module.
 * @author Francesco Compagnoni
 */

// Imports
import { promises as fs } from "fs";
import path from "path";

// Modules
const logger = require("../../utils/logger")("lexing");
import { Lexer, getTokens, Token } from "./Lexer";
import { walkDir } from "../../utils";
import getRoot from "../../utils/root";

// Config
import loadConfig, { Config } from "../../Config";
const config : Config = loadConfig();

// Interfaces
interface LexerMap {
	[key: string]: Lexer
};

export interface LexingResult {
	ok: boolean,
	path: string,
	extension?: string,
	tokens?: Token[]
};

// Constants
const jsRegex = /([a-zA-Z0-9\s_\\.\-\(\):])+(.js)$/;
const registeredLexers : LexerMap = {};

/**
 * TypeScript type checker for lexers.
 * @param lexer The object to validate as a lexer.
 */
function isLexer(lexer: any): lexer is Lexer {
	return lexer; // TODO: Validate the lexers.
}

/**
 * Register the lexers in the given folders.
 */
export async function registerLexers() {
	// Scan lexer directories.
	let root = getRoot();
	let lexerPaths = (await Promise.all(config.analysis.lexing.langDirs.map(dir => walkDir(path.join(root, dir), jsRegex)))).flat();

	// Import lexers.
	let lexers : Lexer[] = (await Promise.all(lexerPaths.map(async (lexerPath : string) => (await import(lexerPath)).default))).filter(lexer => isLexer(lexer));
	
	// Register the lexers.
	lexers.map(lexer => {
		lexer.extensions.map(extension => registeredLexers[extension] = lexer);
	});
}

/**
 * Lex a file in a repository.
 * @param repoPath The absolute path of the repository the file is located in.
 * @param filePath The relative path of the file inside the repository.
 */
export async function lexFile(repoPath: string, filePath: string) : Promise<LexingResult> {
	// Get file extension.
	let extension = filePath.split(".").pop();
	if (!extension)
		return { ok: false, path: filePath };

	// Don't load file if we don't have an appropriate lexer.
	if (!registeredLexers[extension])
		return { ok: false, path: filePath, extension };

	// Get file contents.
	var contents : string = "";
	
	try {
		contents = (await fs.readFile(path.join(repoPath, filePath))).toString("utf-8");
	} catch (e) {
		logger.error(`Unable to open file ${path}`);
		return { ok: false, path: filePath, extension };
	}

	try {
		return {
			ok: true,
			path: filePath, extension,
			tokens: getTokens(registeredLexers[extension].expression, contents)
		};
	} catch (e) {
		logger.error(`Unable to lex file '${path}': ${e}`);
		return { ok: false, path: filePath, extension };
	}
}

export default {
	registerLexers
};