/**
 * @file Blame processing.
 * @author Francesco Compagnoni
 */

// Imports
import Git from "nodegit";
import { Data } from "../../../shared/Result";
import { getCommitAuthor } from "../../github";

// Modules
const logger = require("../../utils/logger")("blame");

// Interfaces
/**
 * A chunk of code written by a specific contributor.
 */
export interface BlameGroup {
	start: number,
	end: number,
	contributorId: string
};

export interface ContributorMap {
	[key: string]: Data
};

/**
 * Get the list of blame groups.
 * @param repository The repository to get the blames form.
 * @param file The relative path of the file.
 */
export async function generateBlameGroups(owner: string, repo: string, accessToken: string, repository: Git.Repository, file: string, contributorMap: ContributorMap = {}) : Promise<BlameGroup[]> {
	// Get blames.
	let blame = await Git.Blame.file(repository, file);
	
	// Map contributor emails to BlameContributors.
	let blameGroups : BlameGroup[] = [];
	for (var i = 0; i < blame.getHunkCount(); i++) {
		// Get hunk data.
		let hunk = blame.getHunkByIndex(i);
		let ref = hunk.finalCommitId().tostrS();
		let start = hunk.finalStartLineNumber();
		let lineCount = hunk.linesInHunk();
		let end = start + lineCount - 1;

		// Get contributor data.
		let contributorEmail = hunk.finalSignature().email();
		var contributorId : string | null = null;

		// Look-up the email in the contributor map.
		if (contributorMap[contributorEmail]) contributorId = contributorEmail;
		else {
			// Fetch the commit.
			let authorResult = await getCommitAuthor(owner, repo, ref, accessToken);
			if (!authorResult.status.ok) contributorId = "";
			else {
				contributorId = contributorEmail;
				contributorMap[contributorEmail] = authorResult.result || { id: null };
			}
		}

		// Get the previous group.
		let previousGroup : BlameGroup | null = blameGroups.length > 0 ? blameGroups[blameGroups.length - 1] : null;

		// Try to merge with the previous group if appropriate.
		if (previousGroup && previousGroup.end == start - 1 && previousGroup.contributorId == contributorId) blameGroups[blameGroups.length - 1].end = end;
		else blameGroups.push({
			start, end, contributorId
		});		
	}

	return blameGroups;
}