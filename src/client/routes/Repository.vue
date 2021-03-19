<template>
	<div class="page nav no-select">
		<div class="content container">
			<div class="header">
				<div class="title">
					<h3>
						<font-awesome-icon v-tooltip="{ theme: 'panorama', content: repo.private ? $t('routes.repo.private') : $t('routes.repo.public') }" class="repo-icon" :icon="repo.private ? 'lock' : 'book'"/>
						<span class="minor">{{$route.params.owner}}</span>
						<span class="separator">/</span>
						<span class="major">{{$route.params.repo}}</span>
					</h3>
					<p class="description">{{repo.description && repo.description.trim().length != 0 ? repo.description : $t("routes.repo.noDescription")}}</p>
				</div>
				<div class="actions">
					<button class="primary" @click="analyseRepo" :disabled="(!canBeReAnalysed && repo.analysis.id != -1) || repo.analysis.inProgress">
						<font-awesome-icon :icon="repo.analysis.inProgress ? 'sync' : repo.analysis.id == -1 || canBeReAnalysed ? 'chevron-right' : 'check'" :spin="repo.analysis.inProgress"/>
						<span v-if="repo.analysis.inProgress">{{$t("routes.repo.analysisInProgress")}}</span>
						<span v-else-if="repo.analysis.id == -1">{{$t("routes.repo.analyse")}}</span>
						<span v-else-if="canBeReAnalysed">{{$t("routes.repo.reAnalyse")}}</span>
						<span v-else>{{$t("routes.repo.analysed")}}</span>
					</button>
				</div>
			</div>
			
			<div class="files">
				<div class="list-item first header margins file-header">
					<div class="breadcrumbs">
						<transition-group name="breadcrumb">
							<span v-for="(component, index) in breadcrumbs" :key="index + component">
								<span
									:class="{ minor: index != 0, major: index == 0, current: index == breadcrumbs.length - 1, clickable: index != breadcrumbs.length - 1 }"
									@click="() => index != breadcrumbs.length - 1 ? setPath(breadcrumbs.slice(1, index + 1).join('/')) : ''"
								>{{component}}</span>	
								<span class="separator" :class="{ visible : index != breadcrumbs.length - 1 }"><font-awesome-icon icon="chevron-right"/></span>
							</span>
						</transition-group>
					</div>
					<transition-group name="type" tag="div" class="extensions">
						<div v-for="type in repo.content.files[currentPath].analysis ? repo.content.files[currentPath].analysis.typeList : []" :key="type" class="extension" v-tooltip="{ theme: 'panorama', content: $store.state.Extensions.typeMap[type] ? $store.state.Extensions.typeMap[type].name : '' }">
							<div class="extension-icon">
								<img :src="$store.state.Extensions.typeMap[type] ? `${config.repositories.extensions.icons.path}/${$store.state.Extensions.typeMap[type].icon}.${config.repositories.extensions.icons.extension}` : ''">
							</div>
							<span class="percentage">{{Math.round(repo.content.files[currentPath].analysis.typeObject[type].percentage * 100)}}%</span>
						</div>
					</transition-group>
				</div>
				<transition name="list">
					<repository-file-list-item
						v-show="($route.query.path || '') != ''"
						:repo="repo"
						:path="parentPath"
						@click.native="() => setPath(parentPath)"
						:overrideName="'..'"
						:index="1"
					/>
				</transition>
				<transition-group name="list">
					<repository-file-list-item
						v-for="(path, index) in currentFiles"
						:key="path"
						@click.native="() => setPath(path)"
						:repo="repo" :path="path"
						:index="currentPath == '' ? index + 1 : index + 2"
					/>
				</transition-group>
			</div>
			<file-viewer :repo="repo" v-if="selectedFile != ''" :path="selectedFile"/>
			<content-footer/>
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue from "vue";
import Store from "../store";

// Modules
import config from "../config";
import { analyseRepo, send, waitForAuth } from "../modules/API";
import { i18n } from "../i18n";
import { getEnrichedRepositoryContributors, getFiles, getRepository } from "../modules/GitHub";
import Repositories from "../store/modules/Repositories";
import { Repository } from "../modules/models/Repository";
import { Method } from "../../shared/Method";
import Extensions from "../store/modules/Extensions";
import { File } from "../modules/models/File";
import { dedupe, sleep } from "../../shared/utils";
import { Analysis, AnalysisMap, toAnalysis } from "../modules/models/Analysis";

// Components
import { FontAwesomeIcon }  from "@fortawesome/vue-fontawesome";
import RepositoryFileListItem from "../components/RepositoryFileListItem.vue";
import FileViewer from "../components/FileViewer.vue";
import ContentFooter from "../components/Footer.vue";

/**
 * Get analysis data for a path.
 * @param repository The repository to fetch analysis data from.
 * @param path The path to fetch data for.
 */
async function getAnalysisData(repository: Repository, path: string) : Promise<AnalysisMap> {
	// Get analysis data for the current folder.
	let analysis : AnalysisMap = {};
	if (repository.analysis.id != -1) {
		// Send request
		let analysisResult = await send(Method.GET, `analysis/${repository.analysis.id}/items?path=${path == '' ? '/' : path}&ticket=${repository.analysis.ticket!}`);

		// If the request was successful, add converted analysis data to the object.
		if (analysisResult.status.ok) {
			Object.keys(analysisResult.result!).map(path => analysis[path] = toAnalysis(analysisResult.result![path]));

			// Lookup unknown file types.
			let typeSet : Set<string> = new Set();
			Object.keys(analysis).map(path => analysis[path].typeList.map(type => typeSet.add(type)));
			
			// Remove known types.
			let types = Array.from(typeSet).filter(type => !Extensions.state.typeMap[type]);

			// Request types and add to store.
			if (types.length > 0) {
				let typeData = await send(Method.GET, `files/types?list=${types.join(",")}`);
				if (typeData.status.ok) Store.commit("Extensions/addTypes", typeData.result!);
			}
		}
	}

	return analysis;
}

/**
 * 
 */
async function getTicket(repository: Repository) : Promise<boolean> {
	// Request analysis ticket for repository.
	let ticketResponse = await send(Method.GET, `analysis/${repository.analysis.id}/ticket`);
	if (!ticketResponse.status.ok) return false;

	// Set the ticket on the repository.
	Store.commit("Repositories/setTicket", { repository, ticket: ticketResponse.result!.ticket });
	return true;
}

/**
 * Load children for a path.
 */
async function addFileChildren(owner: string, repo: string, path: string) : Promise<boolean> {
	// Get the repository.
	let repository = Repositories.state.object[`${owner}/${repo}`];
	if (!repository) return false;

	// If the directory does not yet exist, fetch upwards until necessary.
	// TODO: This may not necessarily be required.
	let parentDirectory = repository.content.files[path];
	if (!parentDirectory) {
		let pathSplit = path.split("/");
		let parentPath = pathSplit.slice(0, pathSplit.length - 1).join("/");
		await addFileChildren(owner, repo, parentPath);
		parentDirectory = repository.content.files[path]
	}

	// If the directory's children have already been loaded, return true.
	if (parentDirectory.children.loaded) return true;

	// Get the files.
	let files = await getFiles(repository, path);

	// Extract the extensions that we don't yet have in the map.
	let validExtensions : string[] = files.filter(file => file.type == "file").map(file => file.name.split(".").pop()!).filter(extension => extension && !Extensions.state.map[extension] && Extensions.state.unknown.indexOf(extension) == -1);

	// If there are extensions to request, process them and request them.
	if (validExtensions.length != 0) {
		// Remove duplicates.
		let extensionSet = dedupe(validExtensions, (a: string, b: string) => a == b);

		// Get the extension data.
		let extensionData = await send(Method.GET, `files/extensions?list=${extensionSet.join(",")}`);

		// If the extension data was returned successfully, add them.
		if (extensionData.status.ok) {
			// Subtract returned extensions from the requested ones to get the unknown extensions.
			let unknownExtensions : string[] = [];
			let returnedExtensions : string[] = Object.keys(extensionData.result!);

			// Add each extension to the list of unknown extension if it was not returned.
			extensionSet.map(requestedExtension => {
				if (returnedExtensions.indexOf(requestedExtension) == -1) unknownExtensions.push(requestedExtension);
			});
			
			// Add the new extensions to the map.
			Store.commit("Extensions/add", {
				map: extensionData.result!,
				unknown: unknownExtensions	
			});
		}
	}

	// Get analysis data for the current children.
	let analysis = await getAnalysisData(repository, path);

	// Add to store.
	Store.commit("Repositories/addFileChildren", { repository, path, files, analysis });
	return true;
}

export default Vue.extend({
	components: {
		FontAwesomeIcon,
		RepositoryFileListItem,
		FileViewer,
		ContentFooter
	},
	watch: {
		"repo.analysis.id": async function (to: number, from: number) {
			// Analysis completed successfully.
			if (to != -1) {
				// Reset repository content data.
				Store.commit("Repositories/resetChildren", this.repo);

				// Fetch analysis ticket.
				await getTicket(this.repo);

				// Get enriched collaborators.
				await getEnrichedRepositoryContributors(this.repo);

				// Fetch children for the current path again.
				await this.getChildren(this.repo.content.files[this.currentPath], this.currentPath);
			}
		}
	},
	computed: {
		currentPath() : string {
			return <string>this.$route.query.path || "";
		},
		breadcrumbs() : string[] {
			let breadcrumbs = [this.$route.params.repo];
			breadcrumbs.push(...this.currentPath.split("/").filter(component => component.length != 0));
			return breadcrumbs;
		},
		repoFullName() : string {
			return `${this.$route.params.owner}/${this.$route.params.repo}`;
		},
		repo() : Repository {
			return this.$store.state.Repositories.object[this.repoFullName];
		},
		parentPath() : string {
			let pathSplit = this.currentPath.split("/");
			let parentPath = pathSplit.slice(0, pathSplit.length - 1).join("/");
			return parentPath;
		},
		currentFiles() : string[] {
			let files : string[] = this.repo.content.files[this.currentPath].children.list;
			return files;
		},
		config() {
			return config;
		},
		selectedFile() : string {
			// Get the current selected file.
			let currentFile = <string>this.$route.query.file || "";

			// If a file is set, return it.
			if (currentFile != "") return currentFile;

			// If there isn't a specific file selected, see if the current folder contains a README.md.
			let readmePath = `${this.currentPath}${this.currentPath == '' ? '' : '/'}README.md`;
			if (currentFile == "" && this.repo.content.files[readmePath]) return readmePath;

			// Otherwise, return an empty string.
			return "";
		},
		canBeReAnalysed() : boolean {
			// If it has not been analysed in the first place then return true.
			if (this.repo.analysis.id == -1 || !this.repo.analysis.startedAt) return true;

			// If the repo was updated after the last analysis started, we know the content has changed.
			return this.repo.updatedAt >= this.repo.analysis.startedAt;
		}
	},
	methods: {
		async setPath(path: string) {
			// Get file for selected path and prevent navigation if it is not a directory.
			let file = this.repo.content.files[path];

			// Show selected file if it's not a directory.
			if (file && file.type != "dir") {
				// Avoid redundant navigation.
				if (path == this.selectedFile) return;

				// Otherwise, push the route.
				this.$router.push({ name: "repo", params: this.$route.params, query: { path: this.$route.query.path || "", file: file.path } });
				return;
			}
			
			// Get children.
			await this.getChildren(file, path);			

			// Push update.
			this.$router.push({ name: "repo", params: this.$route.params, query: { path } });
		},
		async getChildren(file: File, path: string) {
			// Set the folder's children loading state to true, which will play an animation.
			this.$store.commit("Repositories/setFileChildrenLoading", { file, loading: true });

			// Fetch the children folder's children.
			await addFileChildren(this.$router.currentRoute.params.owner, this.$router.currentRoute.params.repo, path || "");

			// Loading done, end the animation.
			this.$store.commit("Repositories/setFileChildrenLoading", { file, loading: false });
		},
		async analyseRepo() {
			// Unset selected file before analysing.
			if (this.$route.query.file) this.$router.push({ name: "repo", params: this.$route.params, query: { path: this.$route.query.path || "" } });
			
			// Go back to root directory if we're currently exploring outdated files.
			if (this.repo.analysis.id != -1 && this.currentPath != "") this.$router.push({name: "repo", params: this.$route.params });

			// Send a request to analyse the repo.
			await analyseRepo(this.repo);
		}
	},
	async beforeRouteEnter(to: any, from: any, next: Function) {
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

		// Check if repository already exists in the Repositories state object.
		var repository = Repositories.state.object[`${to.params.owner}/${to.params.repo}`];
		if (!repository) {
			// Fetch the requested repository. (TODO: Handle failure).
			let fetchedRepository = await getRepository(to.params.owner, to.params.repo);
			if (!fetchedRepository) return next(false);
			repository = fetchedRepository;

			// Add the repository to the store.
			Store.commit("Repositories/addSingle", repository);
		}

		// Check if ticket has not yet been requested.
		if (!repository.analysis.ticket && repository.analysis.id != -1) {
			if (!await getTicket(repository)) return next(false);
		}

		// Check if enriched contributors have been fetched for the repository.
		if (!repository.contributors.enriched && repository.analysis.id != -1) {
			if (!await getEnrichedRepositoryContributors(repository)) {
				// TODO: Handle failure.
				return next(false);
			}
		}

		// Load files from the root directory if necessary.
		let addFileChildrenResult = await addFileChildren(to.params.owner, to.params.repo, to.query.path ? to.query.path : "");
		if (!addFileChildrenResult) return next(false);

		// Set loading to false.
		next((vm: any) => {
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

.header {
	display: flex;
	align-items: center;

	> .title {
		flex-grow: 1;

		h3 {
			display: flex;
			align-items: center;
			font-weight: 600;

			.repo-icon {
				color: $grey-blue;
				font-size: 0.7em;
				margin-right: 15px;
			}

			.minor, .major {
				font-size: 0.9em;
				color: $blue;
			}

			.minor {
				font-weight: 300;
			}

			.separator {
				color: $grey-blue;
				margin: 0px 5px;
				font-weight: 400;
			}
		}

		.description {
			font-size: 0.8em;
			color: $grey-blue;
			margin: 0px;
		}
	}

	> .details {

	}
}




.breadcrumbs {
	display: flex;
	align-items: center;
	font-weight: 600;

	> *, & {
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}

	.major, .minor {
		color: $blue;
		text-decoration: underline solid transparent;
		transition: color .3s, text-decoration-color .3s;
	}

	.separator {
		margin: 0px 15px;
		font-weight: 400;
		font-size: 0.8em;
		color: $grey-blue;
		opacity: 0;
		transition: opacity 0.3s;

		&.visible {
			opacity: 1;
		}
	}

	.minor {
		font-weight: 300;
	}

	.clickable {
		cursor: pointer;
		
		&:hover {
			text-decoration-color: $blue;
		}
	}

	:not(.separator):not(.clickable) {
		color: $grey-blue;
	}
}

/* Transitions */
.breadcrumb-enter-active, .breadcrumb-leave-active {
	transition: opacity .3s, transform .3s;
	display: inline-block;
}

.breadcrumb-enter, .breadcrumb-leave-to {
	transform: translateY(-10px);
	opacity: 0;
}

.breadcrumb-enter-to, .breadcrumb-leave {
	opacity: 1;
}

.type-enter-active, .type-leave-active, .type-move {
	transition: all .5s;

	* {
		transition: margin-right .5s;
	}
}

.type-enter, .type-leave-to {
	opacity: 0;
	max-width: 0;
	margin-right: 0px !important;
	transform: scale(0);

	* {
		margin-right: 0px;
	}
}

.type-enter-to, .type-leave {
	opacity: 1;
	max-width: 63px;
}

.extensions {
	display: flex;
	align-items: center;

	.extension {
		display: flex;
		align-items: center;

		&:not(:last-child) {
			margin-right: 10px;
		}

		.extension-icon {
			width: 20px;
			height: 20px;
			margin-right: 10px;
			position: relative;
		}

		img {
			position: absolute;
			margin-right: 10px;
			width: 20px;
		}

		.percentage {
			color: $grey-blue;
			font-size: 0.8em;
			font-weight: 600;
		}
	}
}

.file-header {
	.breadcrumbs {
		flex-grow: 1;
	}
}

.files {
	width: 100%;
	margin: 20px 0px;
	border: 1px solid rgba($deep, .1);
	border-radius: 16px;
	box-sizing: border-box;
	overflow: hidden;

	.list-item.header {
		display: flex;
		align-items: center;
		height: 50px;
		border: none;
	}
}
</style>