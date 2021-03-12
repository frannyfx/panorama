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