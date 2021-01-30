<template>
	<div class="app">
		<div class="backgrounds">
			<commit-canvas/>
			<div class="background fade"></div>
		</div>
		<transition name="zoom" mode="out-in" tag="div">
			<router-view v-if="!$store.state.loading"></router-view>
		</transition>
		<transition name="zoom" mode="out-in" tag="div">
			<div class="page center" v-show="$store.state.loading">
				<spinner/>
			</div>
		</transition>
		<transition name="navbar">
			<navbar v-if="navbarVisible"/>
		</transition>
		<transition name="credits">
			<div class="credits" v-show="$route.name == 'login' && !$store.state.loading">
				<p>
					<span>frannyfx &copy; 2021</span>
					<span>&bull;</span>
					<a href="https://github.com/frannyfx" target="_blank"><font-awesome-icon :icon="['fab', 'github']"/></a>
					<span>&bull;</span>
					<a href="/privacy-policy">Privacy Policy</a>
				</p>
			</div>
		</transition>
	</div>
</template>
<script lang="ts">
// Imports
import Vue from "vue";

// Components
import Spinner from "../components/Spinner.vue";
import CommitCanvas from "../components/CommitCanvas.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import Navbar from "../components/Navbar.vue";

// Modules
import { loadAccessToken, send, testAuthentication } from "../modules/API";
import { Response } from "../../shared/Response";
import { Method } from "../../shared/Method";
import { getProfile } from "../modules/GitHub";

export default Vue.extend({
	components: {
		Spinner,
		CommitCanvas,
		FontAwesomeIcon,
		Navbar
	},
	computed: {
		navbarVisible() : boolean {
			return this.$route.name == "dashboard" && !this.$store.state.loading;
		}
	},
	methods: {
		notAuthenticated() {
			// Navigate back to login since we're not signed in.
			if (this.$route.name != "login") this.$router.replace({ name: "login"});
			this.$store.commit("setAuthStatus", false);
			this.$store.commit("setAccessToken", "");
			this.$store.commit("setLoading", false);
		}
	},
	mounted: async function () {
		// Get client ID.
		let clientIdResponse : Response = await send(Method.GET, "/github/client-id");
		if (clientIdResponse.status.ok) this.$store.commit("setClientId", clientIdResponse.result?.clientId);
		else {
			// TODO: Show error.
			console.warn("Unable to retrieve client ID.")
			return;
		}

		// Load cached auth info.
		loadAccessToken();

		// If there is no info, fail.
		if (this.$store.state.auth.accessToken == "") {
			this.notAuthenticated();
			return;
		}

		// Check validity of cached info.
		let auth = await testAuthentication();

		// If invalid, fail.
		if (!auth) {
			console.log("Cached credentials failed.", auth);
			this.notAuthenticated();
			return;
		}
		
		// If auth is successful, retrieve user data and navigate to dashboard.
		let profileResult = await getProfile();

		// If unable to retrieve user data, fail.
		if (!profileResult.status.ok) {
			this.notAuthenticated();
			return;
		}

		// Save user data to store.
		this.$store.commit("setUser", profileResult.result);

		// Navigate to dashboard if attempting to load login page.
		if (this.$route.name == "login") this.$router.replace({ name: "dashboard" });
		this.$store.commit("setLoading", false);
	}
})
</script>
<style lang="scss">
@import "../stylesheets/globals.scss";
</style>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.app {
	width: 100%;
	height: 100%;
}

.background.fade {
	background: linear-gradient(to bottom, rgba($blue, 0), rgba($blue, 0.4));
}

.credits {
	position: absolute;
	left: 0; right: 0; bottom: 0;
	text-align: center;
	font-size: 0.7em;
	z-index: 10;

	> p {
		color: rgba(white, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;

		a {
			transition: color 0.3s;
			&:hover {
				color: white;
			}
		}

		svg {
			font-size: 1.4em;
		}

		> *:not(:last-child) {
			margin-right: 5px;
		}
	}
}
</style>