/**
 * @file Interfaces for FileType data.
 * @author Francesco Compagnoni
 */

// Interfaces
/**
 * The interface matching the FileType table in the database.
 */
export interface FileType {
	typeId: number,
	name: string,
	icon: string
};

/**
 * Interface which maps an extension to a FileType.
 */
export interface ExtensionMap {
	[key: string]: FileType
};