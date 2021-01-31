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
const Loader = () => import(/* webpackChunkName: "loader" */ "../routes/Loader.vue");
const SignIn = () => import/* webpackChunkName: "sign-in" */ ("../routes/SignIn.vue");
const Dashboard = () => import(/* webpackChunkName: "dashboard" */ "../routes/Dashboard.vue");

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