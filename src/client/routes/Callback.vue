<template>
	<div class="wrapper">
		<div class="container">
			<h1 class="title"><font-awesome-icon icon="eye"/>Panorama</h1>
			<!-- Spinner -->
			<transition name="height">
				<div class="animate-height" v-show="status == null">
					<spinner/>
				</div>
			</transition>
			<transition name="height">
				<p class="animate-height subtitle" v-show="status != null">
					<font-awesome-icon :icon="status ? 'check-circle' : 'exclamation-circle'"/>
					<span>
						{{status ? "You have successfully logged in." : "Something went wrong. Please try again later."}}
					</span>
				</p>
			</transition>
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue from 'vue';

// Components
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import Spinner from "../components/Spinner.vue";

// API imports
import { send, formatURL } from "../modules/API";
import { Method } from "../../shared/Method";
import { Response } from "../../shared/Response";
import { Result, buildResult } from '../../shared/Result';

export default Vue.extend({
	components: {
		FontAwesomeIcon,
		Spinner
	},
	data() {
		return {
			status: null as boolean | null
		};
	},
	methods: {
		async getAccessToken() : Promise<Result> {
			// Parse URL params.
			let urlParams = new URLSearchParams(window.location.search);
			let code = urlParams.get("code");
			if (!code) return buildResult(false);

			// Fetch GitHub access token.
			let accessTokenResponse : Response = await send(Method.GET, formatURL("/github/access-token/:code", { code }));
			if (!accessTokenResponse.status.ok) return buildResult(false);

			// Return the access token data.
			return buildResult(true, accessTokenResponse.result);
		},
		sleep(time: number) : Promise<void> {
			return new Promise(resolve => {
				setTimeout(resolve, time);
			});
		}
	},
	mounted: async function() {
		// Wait to start for HCI reasons.
		await this.sleep(1000);
		
		// Get access token and set status.
		let accessToken = await this.getAccessToken();
		this.status = accessToken.status.ok;

		// Wait so the user understands what's happening.
		await this.sleep(2000);

		// Post the result and close.
		window.opener.postMessage(accessToken);
		window.close();
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

	.container {
		text-align: center;

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
			font-size: 0.8em;
			display: flex;
			align-items: center;

			svg {
				margin-right: 8px;
				font-size: 1.2em;
			}
		}
	}
}

/* Animations */
.animate-height {
	margin: 0; padding: 0;
}

.height-enter-active, .height-leave-active {
	transition: max-height 0.5s, opacity 0.5s, transform 0.5s;
}

.height-enter, .height-leave-to {
	transform: scale(0);
	max-height: 0;
	opacity: 0;
}

.height-enter-to, .height-leave {
	transform: scale(1);
	max-height: 40px;
	opacity: 1;
}
</style>