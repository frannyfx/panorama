/**
 * @file Blame processing.
 * @author Francesco Compagnoni
 */

// Imports
import Git from "nodegit";

// Modules
const logger = require("../../utils/logger")("blame");

// Interfaces
interface LineHunk {
	commit: string,
	startLine: number,
	endLine: number
};

interface BlameContributor {
	name: string,
	email: string,
	lines: {
		count: number,
		percentage?: number,
		hunks: LineHunk[]
	},
};

interface ContributorMap {
	[key: string]: BlameContributor
}

interface FileBlame {
	file: string,
	contributors: ContributorMap,

};

/**
 * Calculate blame and percentages for a specific file.
 * @param repository The repository to process the file from.
 * @param file The path of the file to process.
 */
async function blameFile(repository: Git.Repository, file: string) : Promise<FileBlame> {
	let blame = await Git.Blame.file(repository, file);

	// Map contributor emails to BlameContributors.
	let contributors : ContributorMap = {};
	var linesProcessed = 0;

	for (var i = 0; i < blame.getHunkCount(); i++) {
		// Get hunk data.
		let hunk = blame.getHunkByIndex(i);
		let commitId = hunk.origCommitId().toString();
		let startLine = hunk.finalStartLineNumber();
		let lineCount = hunk.linesInHunk();
		let endLine = startLine + lineCount - 1;

		// Update num lines processed.
		linesProcessed += lineCount;

		// Put hunk data in a LineHunk object.
		let lineHunk : LineHunk = {
			commit: commitId,
			startLine, endLine
		};
		
		// Get contributor data.
		let name = hunk.finalSignature().name();
		let email = hunk.finalSignature().email();

		// Look up contributor or create new contributor.
		let contributor = contributors[email] ? contributors[email] : {
			name, email, lines: {
				count: 0,
				percentage: 0,
				hunks: []
			}
		};

		// Update contributor data.
		contributor.lines.count += lineCount;
		contributor.lines.hunks.push(lineHunk);
		contributors[email] = contributor;
	}

	// Calculate the percentages.
	Object.keys(contributors).map((email : string) => {
		contributors[email].lines.percentage = contributors[email].lines.count / linesProcessed;
	});

	return {
		file,
		contributors: contributors
	};
}

/**
 * Compute blames for all the files specified in the list for a given repository.
 * @param repository The repository to generate the blames for.
 * @param files The files to be processed.
 */
export async function computeRepoBlame(repository: Git.Repository, files: string[]) : Promise<FileBlame[]>{
	let fileBlames = await Promise.all(files.map(file => blameFile(repository, file)));
	return fileBlames;
}