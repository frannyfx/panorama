// Imports
import Vue from "vue";
import Vuex from "vuex";

// Use plugin
Vue.use(Vuex);

// Define debug constant
const debug = process.env.NODE_ENV !== "production";
export default new Vuex.Store({
	state: {
		loading: true as boolean,
		auth: {
			status: false as boolean,
			clientId: "" as string,
			accessToken: "" as string
		}
	},
	mutations: {
		setLoading(state, loading : boolean) {
			state.loading = loading;
		},
		setAuthStatus(state, status : boolean) {
			state.auth.status = status;
		},
		setClientId(state, clientId: string) {
			state.auth.clientId = clientId;
		},
		setAccessToken(state, accessToken: string) {
			state.auth.accessToken = accessToken;
		}
	},
	strict: debug
});