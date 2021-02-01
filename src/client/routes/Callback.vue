<template>
	<div class="page center">
		<div class="content">
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
						{{status ? "Signed in." : "Not signed in."}}
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
import { sleep } from '../../shared/utils';

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
		}
	},
	mounted: async function() {	
		// Wait for HCI reasons.
		await sleep(800);

		// Get access token and set status.
		let accessToken = await this.getAccessToken();
		this.status = accessToken.status.ok;

		// Wait so the user understands what's happening.
		await sleep(2000);

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
.page {
	background: linear-gradient(to bottom, rgba($blue, 0), rgba($blue, 0.4));

	/* Children */
	.title {
		svg {
			margin-right: 10px;
		}

		color: white;
		margin-bottom: 10px;
		filter: drop-shadow(0px 4px 8px rgba(black, 0.3));
	}

	.subtitle {
		margin-top: 0;
		font-size: 0.8em;
		display: flex;
		align-items: center;
		justify-content: center;

		svg {
			margin-right: 8px;
			font-size: 1.2em;
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