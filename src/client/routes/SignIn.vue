<template>
	<div class="page center no-select">		
		<div class="content">
			<h1 class="title"><font-awesome-icon icon="eye"/>{{ $t("general.title")}}</h1>
			<button @click="signIn" class="transparent blur" :disabled="$store.state.auth.status || $store.state.auth.clientId == '' || !$store.state.auth.canSignIn">
				<font-awesome-icon :icon="['fab', 'github']"/><span>{{ $t("routes.signIn.signInWithGitHub") }}</span>
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

// Modules
import { endSession, saveAccessToken, waitForAuth } from "../modules/API";
import { isResult } from '../../shared/Result';
import { getProfile, getRedirectURI } from '../modules/GitHub';
import { createI18NAlert } from "../modules/Notifications";
import { i18n } from "../i18n";
import { createModal, OK_CANCEL } from "../modules/Modal";

export default Vue.extend({
	components: {
		FontAwesomeIcon
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
		createAuthPopUp() {
			// Open authentication window.
			this.popup.window = window.open(
				`https://github.com/login/oauth/authorize?client_id=${this.$store.state.auth.clientId}&redirect_uri=${getRedirectURI()}&scope=repo`,
				"GitHub Authentication",
				"menubar=no,location=no,resizable=no,scrollbars=no,status=no," + 
				`width=${this.popup.width},height=${this.popup.height},` +
				`left=${((window.outerWidth - this.popup.width) / 2) + window.screenX},top=${((window.outerHeight - this.popup.height) / 2) + window.screenY}`
			);
		},
		async signIn() {
			// Get whether the privacy policy notice was shown to the user from local storage.
			let privacyPolicyNoticeShown = window.localStorage.getItem("privacyPolicyNoticeShown");

			// If pop-up not shown, create modal, otherwise show authentication window.
			if (!privacyPolicyNoticeShown || parseInt(privacyPolicyNoticeShown) == 0) {
				createModal(
					OK_CANCEL,
					this.$i18n.t("modals.custom.privacyPolicyNotice.title").toString(),
					this.$i18n.t("modals.custom.privacyPolicyNotice.description").toString(),
					undefined, (modal: any, actionId: string) => {
						// If user has agreed, shown pop-up.
						if (actionId == "OK") {
							// Set privacy policy read value.
							window.localStorage.setItem("privacyPolicyNoticeShown", "1");
							this.createAuthPopUp();
						} 
					}
				);
			} else this.createAuthPopUp();
		},
		async onReceiveMessage(event: MessageEvent) {
			console.log(event);
			
			// Check origin of the message.
			if (event.source != this.popup.window) return;
			
			// Perform type check on the result.
			var result;
			if (isResult(event.data)) result = event.data;
			if (result == undefined) return;

			// If authentication was not successful, show alert.
			if (!result.status.ok) return createI18NAlert("INFO", "signInFailed");

			// If successful, save the data and set authentication to true.
			saveAccessToken(result.result?.accessToken);
			this.$store.commit("setAuthStatus", true);
			
			// Retrieve and save user data.
			let profileResult = await getProfile();
			this.$store.commit("setUser", profileResult.result);

			// If unable to retrieve user data, show error.
			if (!profileResult.status.ok) return createI18NAlert("WARNING", "profileFetchFailed");

			// Navigate to dashboard.
			this.$router.replace({ name: "dashboard", params: { locale: this.$i18n.locale } }).catch(() => {
				endSession();
			});
		}
	},
	async beforeRouteEnter (to, from, next) {
		// Wait for initial auth.
		await waitForAuth();

		// Set loading.
		if (!Store.state.auth.loaded) Store.commit("setLoading", true);

		// If we're authenticated, redirect to dashboard.
		if (Store.state.auth.status) return next({ name: "dashboard", params: { locale: i18n.locale } });
		next(vm => vm.$store.commit("setLoading", false));
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