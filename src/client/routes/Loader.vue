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
import { performAuth, waitForAuth } from "../modules/API";

export default Vue.extend({
	components: {
		Spinner
	},
	mounted: async function() {
		await waitForAuth();
		await sleep(500);
		if (!this.$store.state.auth.status) this.$router.replace({ name: "sign-in"});
		else this.$router.replace({ name: "dashboard" });
	}
});
</script>