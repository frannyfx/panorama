/**
 * @file Callback pop-up entry point.
 * @author Francesco Compagnoni
 */

// Imports
import Vue from "vue";

// Force import icons
import Icons from "../icons";
Icons;

// Routes
import Callback from "../routes/Callback.vue";

// Set up the app.
const app = new Vue({
	el: "#app",
	render: h => h(Callback)
});