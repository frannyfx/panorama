// Imports
import { Data } from "../../../shared/Result";
import { toUser, User } from "./User";

export interface Repository {
	id: number,
	name: string,
	fullName: string,
	owner: User,
	private: boolean,
	description: string,
	contributors: User[],
	updated_at: Date,
	content: {
		loaded: boolean,
		root?: File
	}
};

export interface RepositoryObject {
	[key: string]: Repository
};

export function toRepository(input: Data, contributors: Data[]) : Repository {
	return {
		id: input.id!,
		name: input.name!,
		fullName: input.full_name!,
		owner: toUser(input.owner!),
		private: input.private!,
		description: input.description!,
		contributors: contributors.map(c => toUser(c)),
		updated_at: new Date(input.pushed_at!),
		content: {
			loaded: false
		}
	};
}