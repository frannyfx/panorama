<template>
	<div class="page center">
		<spinner/>
	</div>
</template>
<script lang="ts">
// Imports
import Vue from "vue";
import { sleep } from "../../shared/utils";

// Components
import Spinner from "../components/Spinner.vue";
import { clearAuthenticationData, performAuth, waitForAuth } from "../modules/API";

export default Vue.extend({
	components: {
		Spinner
	},
	methods: {
		navigateToSignIn() {
			this.$router.replace({ name: "sign-in", params: { locale: this.$i18n.locale } });
		}
	},
	mounted: async function() {
		await waitForAuth();
		await sleep(500);
		if (!this.$store.state.auth.status) this.navigateToSignIn();
		else this.$router.replace({ name: "dashboard", params: { locale: this.$i18n.locale } }, undefined, () => {
			clearAuthenticationData();
			this.navigateToSignIn()
		});
	}
});
</script>