/**
 * @file Client configuration file.
 * @author Francesco Compagnoni
 */

export default {
	activity: {
		fetchingDelay: 790
	},
	repositories: {
		extensions: {
			icons: {
				path: "/icons/material",
				extension: "svg"
			}
		},	
		pageSize: 12
	},
	notifications: {
		duration: 8000,
		fadeStart: 6000
	},
	store: {
		lazyDataPurgeDelay: 5000,
		sessionEndClearDelay: 1000
	},
	files: {
		maxSize: 131072
	}
};