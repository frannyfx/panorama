<template>
	<div class="page nav no-select">
		<div class="content container">
			<h2>{{ $t("routes.dashboard.activity") }}</h2>
			<div class="activities">
				<div class="activity"></div>
				<div class="activity"></div>
				<div class="activity"></div>
			</div>
			<h2>{{ $t("routes.dashboard.repositories") }}</h2>
			<div class="repos">
				<transition-group name="list">
					<repository-list-item @click.native="() => getRepo(repo)" v-for="(repo, index) in $store.state.Repositories.list" :key="repo.id" :repo="repo" :index="index"/>
				</transition-group>
				<transition name="list">
					<div @click="() => loadMoreRepos()" v-show="$store.state.Repositories.canLoadMore">
						<div class="repo-loader list-item" :class="{ clickable : !repos.fetching }">
							<font-awesome-icon :icon="repos.fetching ? ['fas', 'sync'] : ['fas', 'chevron-right']" :spin="repos.fetching"/>
							<span class="view-more">
								{{ $t("routes.dashboard.viewMore") }}
							</span>
						</div>
					</div>
				</transition>
			</div>
			<content-footer/>
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue from "vue";
import Store from "../store";
import Repositories from "../store/modules/Repositories";

// Modules
import { getRepositories } from "../modules/GitHub";
import { i18n } from "../i18n";
import { send, waitForAuth } from "../modules/API";
import { addNotification, createI18NAlert } from "../modules/Notifications";
import { Repository } from "../modules/models/Repository";
import { Method } from "../../shared/Method";
import { subscribeToJobProgress } from "../modules/Queue";
import { createCustomModal, createModal, Modal, OK, OK_CANCEL, OK_CANCEL_DESTRUCTIVE } from "../modules/Modal";

// Components
import RepositoryListItem from "../components/RepositoryListItem.vue";
import { FontAwesomeIcon }  from "@fortawesome/vue-fontawesome";
import ContentFooter from "../components/Footer.vue";

export default Vue.extend({
	components: {
		FontAwesomeIcon,
		RepositoryListItem,
		ContentFooter
	},
	data() {
		return {
			repos: {
				fetching: false
			}
		};
	},
	methods: {
		getRepo(repo: Repository) {
			this.$router.push({ name: "repo", params: { locale: this.$i18n.locale, owner: repo.owner.login, repo: repo.name }});
		},
		async loadMoreRepos() {
			// Check and set flag.
			if (this.repos.fetching) return;
			this.repos.fetching = true;

			// Fetch more repos and handle error.
			let repos : Repository[] | null = await getRepositories(this.$store.state.Repositories.page + 1);
			if (!repos) return createI18NAlert("WARNING", "repoFetchFailed");

			// Add the loaded repositories to the store.
			this.$store.commit("Repositories/add", { repositories: repos, page: this.$store.state.Repositories.page + 1 });

			// Set flag.
			this.repos.fetching = false;
		}
	},
	async beforeRouteEnter (to, from, next) {
		// Prevent loading if auth is invalid.
		await waitForAuth();
		if (!Store.state.auth.status) return next({
			name: "sign-in",
			params: {
				locale: i18n.locale
			}
		});

		// Load repos if they have not yet been loaded.
		var repos : Repository[] | null = null;
		if (Repositories.state.page == -1) {
			// Set loading and load repos.
			Store.commit("setLoading", true);
			repos = await getRepositories();

			// Handle repo fetch error.
			if (!repos) {
				createI18NAlert("WARNING", "repoFetchFailed");
				next(false);
				return;
			}

			// Add the loaded repositories.
			Store.commit("Repositories/add", {
				repositories: repos,
				page: 1
			});
		}
		
		// Navigate once the repositories have been added.
		next(vm => {
			vm.$store.commit("setLoading", false);
		});
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

.activities {
	width: 100%;
	margin: 20px 0px;

	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;

	.activity {
		width: 300px;
		height: 180px;
		border-radius: 16px;
		background-color: rgba($deep, .1);

		&:not(:last-child) {
			margin-right: 20px;
		}
	}
}

.repos {
	width: 100%;
	margin: 20px 0px;
	border: 1px solid rgba($deep, .1);
	border-radius: 16px;
	box-sizing: border-box;
	overflow: hidden;

	.repo-loader {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 0.9em;
		height: 50px;
		color: $blue;
		font-weight: 600;

		> svg {
			margin: 0px;
			margin-right: 10px;
		}
	}
}
</style>