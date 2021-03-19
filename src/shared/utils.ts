/**
 * @file General utils.
 * @author Francesco Compagnoni
 */

/**
 * Asynchronously wait.
 * @param length The length of time in milliseconds to sleep for.
 */
export function sleep(length: number) : Promise<void> {
	return new Promise(resolve => setTimeout(resolve, length));	
}

/**
 * Remove duplicates from a list.
 * @param list The list to filter the duplicates from.
 * @param comparator A function with returns equality of two items.
 * @returns The list with duplicate items removed.
 */
export function dedupe<T>(list: T[], comparator: (a: T, b: T) => boolean) : T[] {
	return list.filter((v, i, a) => a.findIndex(t => comparator(t, v)) === i);
}

/**
 * Linear interpolation function.
 * @param a 
 * @param b 
 * @param amount 
 * @returns 
 */
export function lerp(a: number, b: number, amount: number) {
	amount = amount < 0 ? 0 : amount;
	amount = amount > 1 ? 1 : amount;
	return a + (b - a) * amount;
}

/**
 * Convert file size to a human readable string with an appropriate unit.
 * @param bytes The number of bytes.
 * @param decimalPlaces The number of decimal places to show.
 * @returns The string representation of a file size.
 */
export function humanFileSize(bytes: number, decimalPlaces: number = 0) : string {
	// Units array.
	const units = ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
	const r = 10**decimalPlaces;

	// Do not deal with sizes less than 1024 bytes.
	if (bytes < 1024) return `${bytes} B`;

	// Loop through the units.
	let finalIndex = 0;
	for (var i = 0; i < units.length; i++) {
		bytes /= 1024;
		finalIndex = i;
		if (Math.round(Math.abs(bytes) * r) / r < 1024) break;
	}

	return `${bytes.toFixed(decimalPlaces)} ${units[finalIndex]}`;
}

/**
 * The repo name interface.
 */
export interface RepoName {
	owner: string,
	repo: string
};

/**
 * Split a repository's name into owner and repo.
 * @param name The name of the repository to split.
 * @returns The split name.
 */
export function getRepoName(name: string) : RepoName | null {
	let split = name.split("/");
	if (split.length != 2) null;
	return { owner: split[0], repo: split[1] };
}