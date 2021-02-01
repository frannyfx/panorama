/**
 * @file Vuex store.
 * @author Francesco Compagnoni
 */

// Imports
import Vue from "vue";
import Vuex, { MutationTree } from "vuex";
import { Data } from "../../shared/Result";
import { Repository } from "../modules/models/Repository";

// Modules
import Notifications from "./modules/notifications";

// Use plugin
Vue.use(Vuex);

// State interface.
export interface RootState {
	loading: boolean,
	auth: {
		loaded: boolean,
		status: boolean,
		clientId: string,
		accessToken: string,
	},
	user: {
		id: number,
		login: string,
		avatarUrl: string,
		name: string,
		email: string
	},
	repos: {
		loaded: boolean,
		list: Repository[]
	}
};

// Initial state.
const state : RootState = {
	loading: true,
	auth: {
		loaded: false,
		status: false,
		clientId: "",
		accessToken: ""
	},
	user: {
		id: -1,
		login: "",
		avatarUrl: "",
		name: "",
		email: ""
	},
	repos: {
		loaded: false,
		list: []
	}
};

// Store mutations.
const mutations : MutationTree<RootState> = {
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
};

// Define debug constant
const debug = process.env.NODE_ENV !== "production";
export default new Vuex.Store<RootState>({
	state,
	mutations,
	modules: {
		Notifications
	},
	strict: debug
});