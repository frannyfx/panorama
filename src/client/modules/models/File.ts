/**
 * @file File and directory data model.
 * @author Francesco Compagnoni
 */

// Imports
import { Data } from "../../../shared/Result";

// Interfaces
export interface File {
	type: "file" | "dir",
	name: string,
	path: string,
	parent?: File,
	children?: File[]
};

/**
 * Convert raw data to the File data model.
 * @param input The input data to convert to a File.
 * @returns A File object representing the input data.
 */
export function toFile(input: Data) : File {
	return {
		type: input.type,
		name: input.name,
		path: input.path
	};
}