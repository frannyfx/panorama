/**
 * @file Vue app entry point.
 * @author Francesco Compagnoni
 */

// Imports
import Vue from "vue";
import VueRouter from "vue-router";

// Force import icons
import Icons from "./icons";
Icons;

// Routes
import Index from "./routes/Index.vue";
const Test = () => import("./routes/Test.vue");

// Set up the client-side routes.
Vue.use(VueRouter);
const routes = [
	{ path: "/", component: Index, name: "home" },
	{ path: "/test", component: Test, name: "test" }
];

const router = new VueRouter({ routes });

// Set up the app.
const app = new Vue({
	router
}).$mount("#app");