/**
 * @file Lexing module.
 * @author Francesco Compagnoni
 */

// Imports
import { promises as fs } from "fs";
import path from "path";

// Modules
const logger = require("../../utils/logger")("lexing");
import { Lexer, Token, lex, isLexer } from "./Lexer";
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
	tokens?: Token[],
	numLines?: number
};

// Constants
const jsRegex = /([a-zA-Z0-9\s_\\.\-\(\):])+(.js)$/;
const registeredLexers : LexerMap = {};

/**
 * Register the lexers in the given folders.
 */
export async function registerLexers() {
	logger.info("Registering lexers...");

	// Scan lexer directories.
	let root = getRoot();
	let lexerPaths = (await Promise.all(config.analysis.lexing.langDirs.map(dir => walkDir(path.join(root, dir), jsRegex)))).flat();

	// Import lexers.
	let lexers : Lexer[] = (await Promise.all(lexerPaths.map(async (lexerPath : string) => (await import(lexerPath)).default))).filter(lexer => isLexer(lexer));

	// Register the lexers.
	lexers.map(lexer => {
		logger.info(`Lexer for extensions ${lexer.extensions.join(", ")} registered.`);
		lexer.extensions.map(extension => registeredLexers[extension] = lexer);
	});
}

/**
 * Get the map of registered lexers.
 * @deprecated
 */
export function getRegisteredLexers() : LexerMap {
	return registeredLexers;
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
		let result = lex(registeredLexers[extension], contents);

		return {
			ok: true,
			path: filePath, extension,
			tokens: result,
			numLines: result.length > 0 ? result[result.length - 1].position!.end : 0
		};
	} catch (e) {
		logger.error(`Unable to lex file "${filePath}". ${e}`);
		return { ok: false, path: filePath, extension };
	}
}

export default {
	registerLexers
};