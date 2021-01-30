<template>
	<div class="page nav">
		<div class="content container">
			<h1>Dashboard</h1>
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue from "vue";

// Modules
import { getProfile } from "../modules/GitHub";

export default Vue.extend({
	components: {

	},
	beforeRouteEnter (to, from, next) {
		next(async vm => {
			
		});
	}
})
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.page {
	background-color: white;
	color: black;
}
</style>