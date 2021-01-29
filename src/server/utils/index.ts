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