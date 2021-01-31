// Imports
import Vue from "vue";
import Vuex from "vuex";
import { Data } from "../../shared/Result";
import { Repository } from "../modules/models/Repository";

// Use plugin
Vue.use(Vuex);

// Define debug constant
const debug = process.env.NODE_ENV !== "production";
export default new Vuex.Store({
	state: {
		loading: true as boolean,
		auth: {
			loaded: false as boolean,
			status: false as boolean,
			clientId: "" as string,
			accessToken: "" as string
		},
		user: { // TODO: Make this follow the interface.
			id: -1 as number,
			login: "" as string,
			avatarUrl: "" as string,
			name: "" as string,
			email: "" as string,
		},
		repos: {
			loaded: false as boolean,
			list: [] as Repository[]	
		}
	},
	mutations: {
		setLoading(state, loading : boolean) {
			state.loading = loading;
		},
		setAuthLoaded(state, loaded: boolean) {
			state.auth.loaded = loaded;
		},
		setAuthStatus(state, status : boolean) {
			state.auth.status = status;
		},
		setClientId(state, clientId: string) {
			state.auth.clientId = clientId;
		},
		setAccessToken(state, accessToken: string) {
			state.auth.accessToken = accessToken;
		},
		setUser(state, user: Data) {
			state.user.id = user.id;
			state.user.login = user.login;
			state.user.avatarUrl = user.avatar_url;
			state.user.name = user.name;
			state.user.email = user.email;
		},
		setRepositories(state, repos: Repository[]) {
			// Remove all elements.
			state.repos.loaded = true;
			state.repos.list.splice(0, state.repos.list.length);
			state.repos.list.push(...repos);
		}
	},
	strict: debug
});