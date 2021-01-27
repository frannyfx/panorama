<template>
	<div class="page">
		
		<div class="wrapper">
			<div class="container">
				<h1 class="title"><font-awesome-icon icon="eye"/>Panorama</h1>
				<button @click="signIn" class="transparent blur" :disabled="auth == null || auth || (!auth && clientId == '')">
					<font-awesome-icon :icon="['fab', 'github']"/>Sign in with GitHub
				</button>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue from 'vue';

// Components
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import CommitCanvas from "../components/CommitCanvas.vue";

// API imports
import { send, loadAuthenticationData, AuthenticationData, saveAuthenticationData, testAuthentication } from "../modules/API";
import { Method } from "../../shared/Method";
import { Response } from "../../shared/Response";
import { isResult } from '../../shared/Result';

export default Vue.extend({
	components: {
		FontAwesomeIcon,
		CommitCanvas
	},
	data() {
		return {
			clientId: "",
			auth: null as Boolean | null,
			popup: {
				window: null as Window | null,
				width: 450,
				height: 820
			} 
		};
	},
	methods: {
		async signIn() {
			this.popup.window = window.open(
				`https://github.com/login/oauth/authorize?client_id=${this.clientId}`,
				/*"http://localhost:8080/api/github/callback?code=123",*/
				"GitHub Authentication",
				"menubar=no,location=no,resizable=no,scrollbars=no,status=no," + 
				`width=${this.popup.width},height=${this.popup.height},` +
				`left=${((window.outerWidth - this.popup.width) / 2) + window.screenX},top=${((window.outerHeight - this.popup.height) / 2) + window.screenY}`
			);
		},
		async setClientId() {
			// Fetch GitHub client ID.
			let clientIdResponse : Response = await send(Method.GET, "/github/client-id");
			if (clientIdResponse.status.ok) this.clientId = clientIdResponse.result?.clientId;
		},
		async fetchProfileData() {
			console.log("Fetching profile data...");
		},
		async onReceiveMessage(event: MessageEvent) {
			// Perform type check on the result.
			var result;
			if (isResult(event.data)) result = event.data;
			if (result == undefined) return;

			// If successful, save the data.
			if (result.status.ok) {
				saveAuthenticationData({
					accessToken: result.result?.accessToken,
					scope: result.result?.scope,
					tokenType: result.result?.tokenType
				});

				// Fetch initial data.
				this.auth = true;
				await this.fetchProfileData();
			}
		}
	},
	mounted: async function() {
		// Add event listener to receive data from pop-up.
		window.addEventListener("message", this.onReceiveMessage);

		// Check cached GitHub authentication info.
		let authenticationData = loadAuthenticationData();
		if (!authenticationData.accessToken) {
			// TODO: Put authentication into Vuex store.
			this.auth = false;
			await this.setClientId();
		} else {
			// Check whether cached auth info is valid.
			this.auth = await testAuthentication();
		}

		this.$store.commit("setLoading", false);
	}, /*
	beforeRouteEnter (to, from, next) {
		next(async vm => {
			

			
		});
	} */
});
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.wrapper {
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0; left: 0;
	z-index: 1;

	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;

	.container {
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
}
</style>