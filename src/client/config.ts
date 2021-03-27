export default {
	repositories: {
		extensions: {
			icons: {
				path: "/icons/material",
				extension: "svg"
			}
		},	
		pageSize: 10
	},
	store: {
		lazyDataPurgeDelay: 5000,
		sessionEndClearDelay: 1000
	},
	files: {
		maxSize: 131072
	}
};