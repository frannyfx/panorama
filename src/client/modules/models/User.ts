// Imports
import { Data } from "../../../shared/Result";

export interface User {
	id: number,
	login: string,
	avatarUrl: string,
	name: string,
	email: string
};

export function toUser(input: Data) : User {
	return {
		id: input.id!,
		login: input.login!,
		avatarUrl: input.avatar_url!,
		name: input.name!,
		email: input.email!
	};
}