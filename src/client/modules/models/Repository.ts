/**
 * @file Repository data model.
 * @author Francesco Compagnoni
 */

// Imports
import { Data } from "../../../shared/Result";
import { toUser, User } from "./User";
import { File } from "./File";

// Interfaces
export interface Repository {
	id: number,
	name: string,
	fullName: string,
	owner: User,
	private: boolean,
	description: string,
	contributors: {
		enriched: boolean,
		list: User[]	
	},
	updatedAt: Date,
	lastAnalysis: {
		id: number
	},
	content: {
		loaded: boolean,
		files: {
			[key: string]: File
		},
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
	// Generate root directory file.
	let root : File = {
		type: "dir",
		name: "root",
		path: "",
		children: {
			loaded: false,
			list: []
		}
	};

	// Return the converted repository.
	return {
		id: input.id!,
		name: input.name!,
		fullName: input.full_name!,
		owner: toUser(input.owner!),
		private: input.private!,
		description: input.description!,
		contributors: {
			enriched: false,
			list: contributors.map(c => toUser(c))
		},
		updatedAt: new Date(input.pushed_at!),
		lastAnalysis: {
			id: analysisId
		},
		content: {
			loaded: false,
			files: { "": root },
			root
		}
	};
}