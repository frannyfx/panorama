/**
 * @file File and directory data model.
 * @author Francesco Compagnoni
 */

// Imports
import { Data } from "../../../shared/Result";
import { Analysis, toAnalysis } from "./Analysis";
import config from "../../config";
import Extensions from "../../store/modules/Extensions";

// Interfaces
export interface File {
	type: "file" | "dir",
	name: string,
	path: string,
	parent?: File,
	size: number,
	children: {
		loaded: boolean,
		loading: boolean,
		list: string[]
	},
	content: {
		loaded: boolean,
		loading: boolean,
		data: string
	},
	analysis: {
		available: boolean,
		data?: Analysis
	}
};

/**
 * Convert raw data to the File data model.
 * @param input The input data to convert to a File.
 * @returns A File object representing the input data.
 */
export function toFile(input: Data, analysis: Data | undefined = undefined, parent: File | undefined = undefined) : File {
	return {
		type: input.type,
		name: input.name,
		path: input.path,
		parent,
		size: input.size,
		children: {
			loaded: false,
			loading: false,
			list: []
		},
		content: {
			loaded: false,
			loading: false,
			data: ""
		},
		analysis: {
			available: analysis != undefined,
			data: analysis ? toAnalysis(analysis) : undefined
		}
	};
}

export function getIconPath(file: File) : string {
	// Return folder icon.
	let icon = "file";
	if (file.type == "dir") {
		icon = file.path == "" ? "folder-github": "folder";	
	}
	else {
		// Get extension information
		let extension = file.name.split(".").pop()!;
		let fileType = Extensions.state.map[extension];
		if (fileType) icon = fileType.icon;
	}
	
	// No extension information, return default file icon.
	return `${config.repositories.extensions.icons.path}/${icon}.${config.repositories.extensions.icons.extension}`;
}