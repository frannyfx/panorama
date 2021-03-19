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
import Extensions from "./modules/Extensions";
import Users from "./modules/Users";
import { Error } from "../modules/Error";

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
		accessToken: ""
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
	setLoading(state : RootState, loading : boolean) {
		state.loading = loading;
	},
	setAuthLoaded(state : RootState, loaded: boolean) {
		state.auth.loaded = loaded;
	},
	setAuthStatus(state : RootState, status : boolean) {
		state.auth.status = status;
	},
	setClientId(state : RootState, clientId: string) {
		state.auth.clientId = clientId;
	},
	setAccessToken(state : RootState, accessToken: string) {
		state.auth.accessToken = accessToken;
	},
	setUser(state : RootState, user: Data) {
		state.user.id = user.id;
		state.user.login = user.login;
		state.user.avatarUrl = user.avatar_url;
		state.user.name = user.name;
		state.user.email = user.email;
	},
	setError(state: RootState, error: Error) {
		state.error.name = error;
	},
	clear(state : RootState) {
		// TODO: ...
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
		Users
	},
	strict: debug
});