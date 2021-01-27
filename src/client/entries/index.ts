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
const Login = () => import("../routes/Login.vue");
const Dashboard = () => import("../routes/Dashboard.vue");

// Set up the client-side routes.
Vue.use(VueRouter);

const routes = [{
	path: "/",
	component: Login,
	name: "login"
}, {
	path: "/dashboard",
	component: Dashboard,
	name: "dashboard"
}];

const router = new VueRouter({ routes });

// Set up the app.
const app = new Vue({
	el: "#app",
	router,
	store: Store,
	render: h => h(App)
});