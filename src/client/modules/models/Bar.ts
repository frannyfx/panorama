/**
 * @file Interface for analysis bar items.
 * @author Francesco Compagnoni
 */

export interface BarItem {
	data: {
		id: string,
		percentage: number,
		value: number
	},
	view: {
		colour?: string,
		image?: string,
		label: string
	}
}