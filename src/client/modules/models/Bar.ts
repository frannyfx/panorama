/**
 * 
 */

export interface BarItem {
	data: {
		id: string,
		percentage: number
	},
	view: {
		colour?: string,
		image?: string,
		label: string,
		description?: string
	}
}

export interface BarViewOptions {
	precision: number
};