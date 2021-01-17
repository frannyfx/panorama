// Imports
import Vue from "vue";
import Vuex from "vuex";

// Use plugin
Vue.use(Vuex);

// Define debug constant
const debug = process.env.NODE_ENV !== "production";
export default new Vuex.Store({
	strict: debug
});