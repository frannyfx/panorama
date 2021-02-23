<template>
	<div class="page nav no-select">
		<div class="content container">
			<h2>{{$route.params.owner}}/{{$route.params.repo}}</h2>
			<div class="files">
				
			</div>
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

// Components
import RepositoryFileListItem from "../components/RepositoryFileListItem.vue";

export default Vue.extend({
	components: {
		RepositoryFileListItem
	},
	methods: {
		async loadFiles(path : string) {
			console.log(`Loading files for repository ${this.$route.params.owner}/${this.$route.params.repo} in path '${path}'...`);
		}
	},
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
			//vm.loadFiles("/");
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

.files {
	width: 100%;
	margin: 20px 0px;
	border: 1px solid rgba(black, .1);
	border-radius: 16px;
	box-sizing: border-box;
	overflow: hidden;
}
</style>