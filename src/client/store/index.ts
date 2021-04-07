/**
 * @file Vuex store.
 * @author Francesco Compagnoni
 */

// Imports
import Vue from "vue";
import Vuex, { MutationTree } from "vuex";
import { Data } from "../../shared/Result";

// Modules
import { Error } from "../modules/Error";

// Store modules
import Notifications from "./modules/Notifications";
import Repositories from "./modules/Repositories";
import Modals from "./modules/Modals";
import Extensions from "./modules/Extensions";
import Users from "./modules/Users";
import Tokens from "./modules/Tokens";
import Activity from "./modules/Activity";

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
		canSignIn: boolean
	},
	user: {
		id: number,
		login: string,
		avatarUrl: string,
		name: string,
		email: string
	},
	error: {
		name?: Error
	}
};

// Initial state.
const state : RootState = {
	loading: true,
	auth: {
		loaded: false,
		status: false,
		clientId: "",
		accessToken: "",
		canSignIn: true
	},
	user: {
		id: -1,
		login: "",
		avatarUrl: "",
		name: "",
		email: ""
	},
	error: {}
};

// Store mutations.
const mutations : MutationTree<RootState> = {
	setLoading(state, loading: boolean) {
		state.loading = loading;
	},
	setAuthLoaded(state, loaded: boolean) {
		state.auth.loaded = loaded;
	},
	setAuthStatus(state, status: boolean) {
		state.auth.status = status;
	},
	setClientId(state, clientId: string) {
		state.auth.clientId = clientId;
	},
	setAccessToken(state, accessToken: string) {
		state.auth.accessToken = accessToken;
	},
	setCanSignIn(state, canSignIn: boolean) {
		state.auth.canSignIn = canSignIn;
	},
	setUser(state, user: Data) {
		state.user.id = user.id;
		state.user.login = user.login;
		state.user.avatarUrl = user.avatar_url;
		state.user.name = user.name;
		state.user.email = user.email;
	},
	setError(state, error: Error) {
		state.error.name = error;
	},
	clear(state) {
		state.user.id = -1;
		state.user.login = "";
		state.user.avatarUrl = "";
		state.user.name = "";
		state.user.email = "";
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
		Modals,
		Extensions,
		Users,
		Tokens,
		Activity
	},
	strict: debug
});