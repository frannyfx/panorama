/**
 * @file Callback pop-up entry point.
 * @author Francesco Compagnoni
 */

// Imports
import Vue from "vue";

// Modules
import { i18n } from "../i18n";

// Force import icons
import Icons from "../icons";
Icons;

// Routes
import Callback from "../routes/Callback.vue";

// Set up the app.
const app = new Vue({
	el: "#app",
	i18n,
	render: h => h(Callback)
});