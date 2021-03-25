/**
 * @file Callback pop-up entry point.
 * @author Francesco Compagnoni
 */

// Imports
import Vue from "vue";
import VTooltip from "v-tooltip";

// Modules
import { i18n } from "../i18n";

// Force import icons
import Icons from "../icons";
Icons;

// Routes
import PrivacyPolicy from "../routes/PrivacyPolicy.vue";

// Set up plugins.
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


// Set up the app.
const app = new Vue({
	el: "#app",
	i18n,
	render: h => h(PrivacyPolicy)
});