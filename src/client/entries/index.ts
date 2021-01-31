/**
 * @file Main app entry point.
 * @author Francesco Compagnoni
 */

// Imports
import Vue from "vue";
import VueRouter from "vue-router";
import Store from "../store";

// Components
import App from "../routes/App.vue";

// Force import icons
import Icons from "../icons";
Icons;

// Routes
const SignIn = () => import/* webpackChunkName: "sign-in" */ ("../routes/SignIn.vue");
const Dashboard = () => import(/* webpackChunkName: "dashboard" */ "../routes/Dashboard.vue");
const Test = () => import(/* webpackChunkName: "test" */ "../routes/Test.vue");

// Set up the client-side routes.
Vue.use(VueRouter);

const routes = [{
	path: "/",
	component: SignIn,
	name: "sign-in"
}, {
	path: "/dashboard",
	component: Dashboard,
	name: "dashboard"
}, {
	path: "/test",
	component: Test,
	name: "test"
}];

const router = new VueRouter({
	mode: "history",
	routes
});

// Set up the app.
const app = new Vue({
	el: "#app",
	router,
	store: Store,
	render: h => h(App)
});