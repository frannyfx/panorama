// Imports
import Vue from "vue";
import Vuex from "vuex";

// Use plugin
Vue.use(Vuex);

// Define debug constant
const debug = process.env.NODE_ENV !== "production";
export default new Vuex.Store({
	state: {
		loading: true as boolean
	},
	mutations: {
		setLoading(state, loading) {
			state.loading = loading;
		}
	},
	strict: debug
});