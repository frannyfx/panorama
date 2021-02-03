<template>
	<div class="page nav no-select">
		<div class="content container">
			<h2>{{$route.params.owner}}/{{$route.params.repo}}</h2>
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue from "vue";
import Store from "../store";

// Modules
import { waitForAuth } from "../modules/API";
import { sleep } from "../../shared/utils";
import { i18n } from "../i18n";

export default Vue.extend({
	async beforeRouteEnter(to, from, next) {
		// Set loading.
		Store.commit("setLoading", true);
		
		// Prevent loading if auth is invalid.
		await waitForAuth();
		if (!Store.state.auth.status) return next({
			name: "sign-in",
			params: {
				locale: i18n.locale
			}
		});

		// Load repo...
		await sleep(1000);
		next(vm => {
			vm.$store.commit("setLoading", false);
		});
	}
});
</script>
<style lang="scss" scoped>
.page {
	background-color: white;
	color: black;
}
</style>