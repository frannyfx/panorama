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
			<h2>{{ $t("routes.dashboard.test") }}</h2>
			<a @click="testAlert">Test alert</a>
			<a @click="testModal">Test normal modal</a>
			<a @click="testDestructiveModal">Test destructive modal</a>
			<a @click="testMultipleModals">Test multiple modals</a>
			<a @click="testProgress">Test progress notification</a>
			<a @click="testAnalysis">Test analysis</a>
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
import { addNotification, createAlert } from "../modules/Notifications";
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
		testAlert() {
			createAlert("INFO", "Test notification.", "This is the notification's content.");
		},
		testModal() {
			createModal(OK_CANCEL, "Not analysed", "The repository frannyfx/panorama-test has not yet been analysed. Would you like to analyse it?");
		},
		testDestructiveModal() {
			createModal(OK_CANCEL_DESTRUCTIVE, "Are you sure?", "If you quit now, all your unsaved changes will be lost!");
		},
		testMultipleModals() {
			createModal(OK, "Welcome to Panorama", "Thank you for being a user. Your support is highly appreciated.");
			setTimeout(() => createModal(OK_CANCEL, "Not analysed", "The repository frannyfx/panorama-test has not yet been analysed. Would you like to analyse it?"), 1000);
		},
		testProgress() {
			addNotification({
				type: "PROGRESS",
				icon: ["fab", "github"],
				title: "Analysing repo frannyfx/ether...",
				description: "",
				dismissable: false,
				expiry: false,
				progress: {
					value: 0.3,
					status: "Cloning repo..."
				}
			});
		},
		async testAnalysis() {
			// Ask for a ticket to subscribe to this repository's analysis.
			let ticketResponse = await send(Method.PUT, "repo/queue", {
				name: "frannyfx/panorama-test"
			});

			// If the request failed, show an error.
			if (!ticketResponse.status.ok || !ticketResponse.result?.ticket) return createAlert("WARNING", "Failed", "Yada yada");
			
			// Use the ticket to subscribe to the events.
			subscribeToJobProgress("frannyfx/panorama-test", ticketResponse.result!.jobId, ticketResponse.result!.ticket, this.$store.state.auth.accessToken);
		},
		getRepo(repo: Repository) {
			// Create a modal if the repository has not yet been analysed.
			if (repo.lastAnalysis.id == -1) {
				createCustomModal({
					title: this.$i18n.t("modals.custom.repoNotAnalysed.title").toString(),
					description: this.$i18n.t("modals.custom.repoNotAnalysed.description", [repo.fullName]).toString(),
					icon: ["fab", "github"],
					theme: "NORMAL",
					actions: [{
						type: "NORMAL",
						id: "CANCEL",
						icon: ["fas", "chevron-left"],
						content: () => this.$i18n.t("modals.custom.repoNotAnalysed.actions.cancel").toString(),
					}, {
						type: "PRIMARY",
						id: "OK",
						icon: ["fas", "check"],
						content: () => this.$i18n.t("modals.custom.repoNotAnalysed.actions.analyseRepo").toString()
					}]
				}, (modal : Modal, actionId: string) => {
					// If user does not want to analyse the repo, return.
					if (actionId != "OK") return;
					
					// Otherwise, push the repo onto the router and analyse it.
					// TODO: Send analysis request.
					this.$router.push({ name: "repo", params: { locale: this.$i18n.locale, owner: repo.owner.login, repo: repo.name }});
				});
			} else {
				this.$router.push({ name: "repo", params: { locale: this.$i18n.locale, owner: repo.owner.login, repo: repo.name }});
			}
		},
		async loadMoreRepos() {
			// Check and set flag.
			if (this.repos.fetching) return;
			this.repos.fetching = true;

			// Fetch more repos and handle error.
			let repos : Repository[] | null = await getRepositories(this.$store.state.Repositories.page + 1);
			if (!repos) return createAlert("WARNING", this.$i18n.t("alerts.repoFetchFailed.title").toString(), this.$i18n.t("alerts.repoFetchFailed.description").toString());

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
				createAlert("WARNING", i18n.t("alerts.repoFetchFailed.title").toString(), i18n.t("alerts.repoFetchFailed.description").toString());
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