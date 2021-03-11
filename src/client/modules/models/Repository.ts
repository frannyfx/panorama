/**
 * @file Repository data model.
 * @author Francesco Compagnoni
 */

// Imports
import { Data } from "../../../shared/Result";
import { Analysis } from "./Analysis";
import { toUser, User } from "./User";

// Interfaces
export interface Repository {
	id: number,
	name: string,
	fullName: string,
	owner: User,
	private: boolean,
	description: string,
	contributors: User[],
	updatedAt: Date,
	lastAnalysis: {
		id: number,
		analysis?: Analysis
	},
	content: {
		loaded: boolean,
		root?: File
	}
};

export interface RepositoryObject {
	[key: string]: Repository
};

/**
 * Convert raw data to the Repository data model.
 * @param input The input data to convert to a Repository.
 * @param contributors Set of loaded contributors to show.
 * @returns A Repository object representing the input data.
 */
export function toRepository(input: Data, contributors: Data[], analysisId: number) : Repository {
	return {
		id: input.id!,
		name: input.name!,
		fullName: input.full_name!,
		owner: toUser(input.owner!),
		private: input.private!,
		description: input.description!,
		contributors: contributors.map(c => toUser(c)),
		updatedAt: new Date(input.pushed_at!),
		lastAnalysis: {
			id: analysisId
		},
		content: {
			loaded: false
		}
	};
}