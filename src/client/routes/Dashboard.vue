<template>
	<div class="page nav no-select">
		<div class="content container">
			<div class="header">
				<font-awesome-icon icon="chart-bar"/>
				<h2>{{ $t("routes.dashboard.recentActivity") }}</h2>
				<button class="action" @click="refreshActivity">
					<font-awesome-icon icon="sync" :spin="activity.fetching"/>
				</button>
			</div>
			<activity-list :fetching="activity.fetching"/>
			<div class="header">
				<font-awesome-icon icon="book"/>
				<h2>{{ $t("routes.dashboard.repositories") }}</h2>
			</div>
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
import Activity from "../store/modules/Activity";

// Modules
import { getRepositories } from "../modules/GitHub";
import { i18n } from "../i18n";
import { endSession, send, waitForAuth } from "../modules/API";
import { createI18NAlert } from "../modules/Notifications";
import { Repository } from "../modules/models/Repository";
import { Method } from "../../shared/Method";
import config from "../config";

// Components
import { FontAwesomeIcon }  from "@fortawesome/vue-fontawesome";
import ActivityList from "../components/ActivityList.vue";
import RepositoryListItem from "../components/RepositoryListItem.vue";
import ContentFooter from "../components/Footer.vue";

export default Vue.extend({
	components: {
		FontAwesomeIcon,
		ActivityList,
		RepositoryListItem,
		ContentFooter
	},
	data() {
		return {
			activity: {
				fetching: false
			},
			repos: {
				fetching: false
			}
		};
	},
	methods: {
		getRepo(repo: Repository) {
			this.$router.push({ name: "repo", params: { locale: this.$i18n.locale, owner: repo.owner.login, repo: repo.name }});
		},
		async refreshActivity() {
			// Prevent activity from being fetched simultaneously.
			if (this.activity.fetching) return;

			// Set fetching flag.
			this.activity.fetching = true;

			// Get IDs of current activity and schedule lazy activity deletion.
			let activityIds = [...this.$store.state.Activity.list];
			setTimeout(() => this.$store.commit("Activity/deleteData", activityIds), config.store.lazyDataPurgeDelay);

			// Clear store.
			this.$store.commit("Activity/clear");

			// Fetch activity.
			let activity = await send(Method.GET, "activity");
			if (!activity.status.ok) createI18NAlert("WARNING", "activityFetchFailed");

			// Add to store.
			Store.commit("Activity/add", activity.result!);

			// Remove fetching flag.
			setTimeout(() => this.activity.fetching = false, config.activity.fetchingDelay);
		},
		async loadMoreRepos() {
			// Check and set flag.
			if (this.repos.fetching) return;
			this.repos.fetching = true;

			// Fetch more repos and handle error.
			let repos : Repository[] | null = await getRepositories(this.$store.state.Repositories.page + 1);
			if (!repos) return createI18NAlert("WARNING", "reposFetchFailed");

			// Add the loaded repositories to the store.
			this.$store.commit("Repositories/add", { repositories: repos, page: this.$store.state.Repositories.page + 1 });

			// Set flag.
			this.repos.fetching = false;
		}
	},
	async beforeRouteEnter (to, from, next) {
		// Prevent loading if auth is invalid.
		await waitForAuth();
		if (!Store.state.auth.status) return next({ name: "sign-in", params: { locale: i18n.locale } });

		// Load activity if it has not yet been loaded.
		if (!Activity.state.loaded) {
			// Set loading and load activity.
			Store.commit("setLoading", true);
			let activity = await send(Method.GET, "activity");
			if (!activity.status.ok) {
				createI18NAlert("WARNING", "activityFetchFailed");
				endSession();
				return next({ name: "sign-in", params: { locale: i18n.locale} });
			}

			// Add the loaded activity.
			Store.commit("Activity/add", activity.result!);
		}

		// Load repos if they have not yet been loaded.
		if (Repositories.state.page == -1) {
			// Set loading and load repos.
			Store.commit("setLoading", true);
			let repos = await getRepositories();

			// Handle repo fetch error.
			if (!repos) {
				createI18NAlert("WARNING", "reposFetchFailed");
				endSession();
				return next({ name: "sign-in", params: { locale: i18n.locale } });
			}

			// Add the loaded repositories.
			Store.commit("Repositories/add", {
				repositories: repos,
				page: 1
			});
		}
		
		// Navigate once the repositories have been added.
		next(vm => vm.$store.commit("setLoading", false));
	}
});
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.page {
	background-color: white;
	color: black;
}

.header {
	display: flex;
	align-items: center;
	color: $mariana;

	h2 {
		flex-grow: 1;
	}

	> svg {
		margin-right: 15px;
	}
}

.repos {
	width: 100%;
	margin: 20px 0px;
	border: 1px solid $grey-tinted;
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