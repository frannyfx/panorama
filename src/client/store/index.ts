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
import Notifications from "./modules/Notifications";
import Repositories from "./modules/Repositories";
import Modals from "./modules/Modals";

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
	}
};

// Define debug constant.
const debug = process.env.NODE_ENV !== "production";

// Export state.
export default new Vuex.Store<RootState>({
	state,
	mutations,
	modules: {
		Notifications,
		Repositories,
		Modals
	},
	strict: debug
});