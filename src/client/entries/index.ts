/**
 * @file Main app entry point.
 * @author Francesco Compagnoni
 */

// Imports
import Vue from "vue";
import VueRouter from "vue-router";
import VTooltip from "v-tooltip";
import Store from "../store";

// Components
import App from "../routes/App.vue";

// Modules
import { i18n } from "../i18n";

// Force import icons
import Icons from "../icons";
Icons;

// Routes - loaded asynchronously.
const SignIn = () => import(/* webpackChunkName: "sign-in" */ /* webpackMode: "lazy" */ "../routes/SignIn.vue");
const Dashboard = () => import(/* webpackChunkName: "dashboard" */ /* webpackMode: "lazy" */  "../routes/Dashboard.vue");
const Repository = () => import(/* webpackChunkName: "repository" */ /* webpackMode: "lazy" */ "../routes/Repository.vue");
const Error = () => import(/* webpackChunkName: "error" */ /* webpackMode: "lazy" */ "../routes/Error.vue");

// Set up plugins.
Vue.use(VueRouter);
Vue.use(VTooltip, {
	defaultHtml: false,
	themes: {
		panorama: {
			"$extend": "tooltip",
			placement: "top",
			delay: {
				show: 100,
				hide: 0
			}
		},
	}
});

// Set up routes.
const routes = [{
	path: "/:locale",
	component: SignIn,
	name: "sign-in",
	meta: {
		title: "routes.signIn.title"
	}
}, {
	path: "/:locale/dashboard",
	component: Dashboard,
	name: "dashboard",
	meta: {
		title: "routes.dashboard.title"
	}
}, {
	path: "/:locale/repo/:owner/:repo/",
	component: Repository,
	name: "repo",
	meta: {
		title: "routes.repo.title"
	}
}, {
	path: "/:locale/error",
	component: Error,
	name: "error",
	meta: {
		title: "routes.error.title"
	}
}, {
	path: "/:locale/error/:name",
	component: Error,
	name: "named-error",
	meta: {
		title: "routes.error.title"
	}
}];

const router = new VueRouter({
	mode: "history",
	routes
});

// Set up the app.
const app = new Vue({
	el: "#app",
	router,
	i18n,
	store: Store,
	render: h => h(App)
});