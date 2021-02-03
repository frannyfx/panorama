<template>
	<div class="page center no-select">		
		<div class="content">
			<h1 class="title"><font-awesome-icon icon="eye"/>{{ $t("general.title")}}</h1>
			<button @click="signIn" class="transparent blur" :disabled="$store.state.auth.status || $store.state.auth.clientId == ''">
				<font-awesome-icon :icon="['fab', 'github']"/>{{ $t("routes.signIn.signInWithGitHub") }}
			</button>
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue from "vue";
import Store from "../store";

// Components
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import CommitCanvas from "../components/CommitCanvas.vue";

// API imports
import { saveAccessToken, send, testAuthentication, waitForAuth } from "../modules/API";
import { Method } from "../../shared/Method";
import { Response } from "../../shared/Response";
import { isResult } from '../../shared/Result';
import { getProfile, getRedirectURI } from '../modules/GitHub';
import { createAlert } from "../modules/Notifications";

export default Vue.extend({
	components: {
		FontAwesomeIcon,
		CommitCanvas
	},
	data() {
		return {
			popup: {
				window: null as Window | null,
				width: 450,
				height: 820,
			} 
		};
	},
	methods: {
		async signIn() {
			// Get redirect URI with locale.
			let redirectURI = getRedirectURI() + `/${this.$i18n.locale}`;

			// Navigate to dashboard.
			this.popup.window = window.open(
				`https://github.com/login/oauth/authorize?client_id=${this.$store.state.auth.clientId}&redirect_uri=${redirectURI}&scope=repo`,
				"GitHub Authentication",
				"menubar=no,location=no,resizable=no,scrollbars=no,status=no," + 
				`width=${this.popup.width},height=${this.popup.height},` +
				`left=${((window.outerWidth - this.popup.width) / 2) + window.screenX},top=${((window.outerHeight - this.popup.height) / 2) + window.screenY}`
			);
		},
		async fetchProfileData() {
			console.log("Fetching profile data...");
		},
		async onReceiveMessage(event: MessageEvent) {
			// Perform type check on the result.
			var result;
			if (isResult(event.data)) result = event.data;
			if (result == undefined) return;

			// If authentication was not successful, show alert.
			if (!result.status.ok) return createAlert("INFO", this.$i18n.t("alerts.signInFailed.title").toString(), this.$i18n.t("alerts.signInFailed.description").toString());

			// If successful, save the data.
			saveAccessToken(result.result?.accessToken);

			// Fetch initial data.
			this.$store.commit("setAuthStatus", true);
			
			// Retrieve user data.
			let profileResult = await getProfile();

			// Save user data to store.
			this.$store.commit("setUser", profileResult.result);

			// If unable to retrieve user data, show error.
			if (!profileResult.status.ok) return createAlert("WARNING", this.$i18n.t("alerts.profileFetchFailed.title").toString(), this.$i18n.t("alerts.profileFetchFailed.description").toString());

			// Navigate to dashboard.
			this.$router.replace({ name: "dashboard", params: { locale: this.$i18n.locale } });
		}
	},
	async beforeRouteEnter (to, from, next) {
		// Wait for initial auth.
		await waitForAuth();

		// Set loading.
		if (!Store.state.auth.loaded) Store.commit("setLoading", true);

		// If we're authenticated, redirect to dashboard.
		if (Store.state.auth.status) return next({ name: "dashboard"});
		next(vm => {
			vm.$store.commit("setLoading", false);
		});
	},
	mounted: async function() {
		// Add event listener to receive data from pop-up.
		window.addEventListener("message", this.onReceiveMessage);
	}
});
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.content {
	text-align: center;

	/* Children */
	.title {
		svg {
			margin-right: 10px;
		}

		color: white;
		margin-bottom: 10px;
		filter: drop-shadow(0px 4px 8px rgba(black, 0.3));
	}
}
</style>