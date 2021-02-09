/**
 * @file Lexing module.
 * @author Francesco Compagnoni
 */

// Imports
import { promises as fs } from "fs";
import path from "path";

// Modules
const logger = require("../../utils/logger")("lexing");
import { Lexer, lexIterative, Token } from "./Lexer";
import { walkDir } from "../../utils";
import getRoot from "../../utils/root";

// Config
import loadConfig, { Config } from "../../Config";
import { buildResult, Result } from "../../../shared/Result";
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

function isLexer(lexer: any): lexer is Lexer {
	return lexer; // TODO: Validate the lexers.
}

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

export async function lexFile(path: string) : Promise<LexingResult> {
	// Get file extension.
	let extension = path.split(".").pop();
	if (!extension)
		return { ok: false, path: path };

	// Don't load file if we don't have an appropriate lexer.
	if (!registeredLexers[extension])
		return { ok: false, path, extension };

	// Get file contents.
	var contents : string = "";
	
	try {
		contents = (await fs.readFile(path)).toString("utf-8");
	} catch (e) {
		logger.error(`Unable to open file ${path}`);
		return { ok: false, path, extension };
	}

	try {
		return {
			ok: true,
			path, extension,
			tokens: lexIterative(registeredLexers[extension].expression, contents).env()
		};
	} catch (e) {
		logger.error(`Unable to lex file '${path}': ${e}`);
		return { ok: false, path, extension };
	}
}

export default {
	registerLexers
};