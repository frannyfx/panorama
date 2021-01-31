<template>
	<div class="page nav">
		<div class="content container">
			<h2>
				<font-awesome-icon icon="folder"/>
				<span>Repositories</span>
			</h2>
			<div class="repos">
				<repository v-for="repo in $store.state.repos.list" :key="repo.id" :repo="repo"/>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue from "vue";
import Store from "../store";

// Modules
import { getProfile, getRepositories } from "../modules/GitHub";

// Components
import Repository from "../components/Repository.vue";
import { FontAwesomeIcon }  from "@fortawesome/vue-fontawesome";
import { waitForAuth } from "../modules/API";

export default Vue.extend({
	components: {
		FontAwesomeIcon,
		Repository
	},
	async beforeRouteEnter (to, from, next) {
		// Prevent loading if auth is invalid.
		await waitForAuth();
		if (!Store.state.auth.status) return next({
			name: "sign-in"
		});

		// Load repos and navigate.
		let repos = await getRepositories();
		next(vm => {
			vm.$store.commit("setRepositories", repos);
			vm.$store.commit("setLoading", false);
		});
	},
	async beforeRouteUpdate (to, from, next) {
		console.log("Dashboard route update", to, from);
	},
	mounted: async function () {

	}
});
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.page {
	background-color: white;
	color: black;
}

h2 {
	display: flex;
	align-items: center;
	svg {
		margin-right: 10px;
		font-size: 0.8em;
		color: $blue;
	}
}

.repos {
	width: 100%;
	margin: 20px 0px;
}
</style>