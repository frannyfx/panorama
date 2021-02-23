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
const Test = () => import(/* webpackChunkName: "test" */ /* webpackMode: "lazy" */  "../routes/Test.vue");
const Repository = () => import(/* webpackChunkName: "repository" */ /* webpackMode: "lazy" */ "../routes/Repository.vue");

// Set up plugins.
Vue.use(VueRouter);
Vue.use(VTooltip, {
	themes: {
		panorama: {
			"$extend": "tooltip",
			placement: "top",
			delay: {
				show: 100,
				hide: 0
			}
		},
	},
});

// Set up routes.
const routes = [{
	path: "/:locale",
	component: SignIn,
	name: "sign-in"
}, {
	path: "/:locale/dashboard",
	component: Dashboard,
	name: "dashboard"
}, {
	path: "/test",
	component: Test,
	name: "test"
}, {
	path: "/:locale/repo/:owner/:repo",
	component: Repository,
	name: "repo"
}/*, {
	path: "/:locale/repo/:owner/:repo/path/",
	component: Repository,
	name: "repo-path",
	props: (route : any) => ({ query: route.query.q })
}*/];

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