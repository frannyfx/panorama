import { Data } from "../../../shared/Result";

export interface File {
	type: "file" | "dir",
	name: string,
	path: string
}

export function toFile(input: Data) : File {
	return {
		type: input.type,
		name: input.name,
		path: input.path
	};
}