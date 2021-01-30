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
	async mounted() {
		// Get client id.
		let clientIdResponse : Response = await send(Method.GET, "/github/client-id");
		if (clientIdResponse.status.ok) this.$store.commit("setClientId", clientIdResponse.result?.clientId);
		else {
			// TODO: Show error.
			console.warn("Unable to retrieve client ID.")
			return;
		}

		// Check cached GitHub authentication info.
		loadAccessToken();
		if (this.$store.state.auth.accessToken == "") {
			// Navigate back to login since we're not signed in.
			if (this.$route.name != "login") this.$router.replace({ name: "login"});

			this.$store.commit("setAuthStatus", false);
			this.$store.commit("setLoading", false);
		} else {
			// Check whether cached auth info is valid.
			let auth = await testAuthentication();
			this.$store.commit("setAuthStatus", auth);

			// If auth is successful, set access token to store.
			if (auth) {
				if (this.$route.name == "login") this.$router.replace({ name: "dashboard" });
				this.$store.commit("setLoading", false);
			}
		}

		
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