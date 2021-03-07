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

export function dedupe(list: any[], comparator: (a: any, b: any) => boolean) {
	return list.filter((v, i, a) => a.findIndex(t => comparator(t, v)) === i);
}