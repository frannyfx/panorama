<template>
	<div class="wrapper">
		<div class="container">
			<h1 class="title"><font-awesome-icon icon="eye"/>Panorama</h1>
			<!--<p class="subtitle">Code contribution assessment</p>-->
			<button @click="signIn" class="transparent">
				<font-awesome-icon :icon="['fab', 'github']"/>Sign in with GitHub
			</button>
		</div>
		<!--<p class="credits">Bottom text</p>-->
	</div>
</template>
<script lang="ts">
// Imports
import Vue from 'vue';

// Components
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// API imports
import { send } from "../modules/API";
import { Method } from "../../shared/Method";
import { Response } from "../../shared/Response";

export default Vue.extend({
	components: {
		FontAwesomeIcon
	},
	data() {
		return {
			clientId: "",
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
				"GitHub Authentication",
				"menubar=no,location=no,resizable=no,scrollbars=no,status=no," + 
				`width=${this.popup.width},height=${this.popup.height},` +
				`left=${((window.outerWidth - this.popup.width) / 2) + window.screenX},top=${((window.outerHeight - this.popup.height) / 2) + window.screenY}`
			);
		}
	},
	mounted: async function() {
		// Fetch GitHub client ID.
		let clientIdResponse : Response = await send(Method.GET, "/github/client-id");
		if (clientIdResponse.status.ok) this.clientId = clientIdResponse.result?.clientId;
	}
});
</script>
<style lang="scss">
@import "../stylesheets/globals.scss";
</style>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.wrapper {
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;

	.credits {
		position: absolute;
		left: 0; right: 0; bottom: 0;
		text-align: center;
		font-size: 0.8em;
	}

	.container {
		/* Dimensions 
		width: 500px;
		height: 400px;
		padding: 40px;
		box-sizing: border-box;*/

		@include sm {
			/*width: 100%;*/
		}

		/* Appearance 
		background-color: rgba(white, 0.95);
		border-radius: 16px;
		box-shadow: 0 19px 38px rgba(black, 0.15), 0 15px 12px rgba(black, 0.11);*/

		text-align: center;

		/* Animations */
		transition: width 0.5s, margin-left 0.5s, margin-right 0.5s;

		/* Children */
		.title {
			svg {
				margin-right: 10px;
			}

			color: white;
			text-shadow: 0px 3px rgba(black, 0.2);
			margin-bottom: 10px;
		}

		.subtitle {
			margin-top: 0;
			margin-bottom: 20px;
			font-size: 0.8em;
		}
	}
}
</style>