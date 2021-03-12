<template>
	<div class="page nav no-select">
		<div class="content container">
			<h2>{{$route.params.owner}}/{{$route.params.repo}}</h2>
			<div class="files">
				<transition name="list">
					<repository-file-list-item
						v-show="($route.query.path || '') != ''"
						:repo="$store.state.Repositories.object[repoFullName]"
						:path="parentPath"
						@click.native="() => setPath(parentPath)"
						:overrideName="'..'"
						:index="0"
					/>
				</transition>
				<transition-group name="list">
					<repository-file-list-item
						v-for="(path, index) in currentFiles"
						:key="path"
						@click.native="() => setPath(path)"
						:repo="$store.state.Repositories.object[repoFullName]" :path="path"
						:index="currentPath == '' ? index : index + 1"
					/>
				</transition-group>
				
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
import { i18n } from "../i18n";
import { getFiles, getRepository } from "../modules/GitHub";
import Repositories from "../store/modules/Repositories";
import { Repository } from "../modules/models/Repository";

// Components
import RepositoryFileListItem from "../components/RepositoryFileListItem.vue";
import { File } from "../modules/models/File";

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

	// Add to store.
	Store.commit("Repositories/addFileChildren", {
		repository,
		path, files
	});

	return true;
}

export default Vue.extend({
	components: {
		RepositoryFileListItem
	},
	computed: {
		currentPath() : string {
			return <string>this.$route.query.path || "";
		},
		repoFullName() : string {
			return `${this.$route.params.owner}/${this.$route.params.repo}`;
		},
		parentPath() : string {
			let pathSplit = this.currentPath.split("/");
			let parentPath = pathSplit.slice(0, pathSplit.length - 1).join("/");
			return parentPath;
		},
		currentFiles() : string[] {
			let files : string[] = this.$store.state.Repositories.object[this.repoFullName].content.files[this.currentPath].children.list;
			return files;
		}
	},
	methods: {
		async setPath(path: string) {
			// Get current repository.
			let repository : Repository = this.$store.state.Repositories.object[this.repoFullName];

			// Get file for selected path and prevent navigation if it is not a directory.
			let file = repository.content.files[path];
			if (file.type != "dir") return;

			// Fetch the children first, before navigating. This allows the UI to update.
			await addFileChildren(this.$router.currentRoute.params.owner, this.$router.currentRoute.params.repo, path || "");

			// Push update.
			this.$router.push({
				name: "repo",
				params: this.$route.params,
				query: {
					path
				}
			});
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
		let existingRepository = Repositories.state.object[`${to.params.owner}/${to.params.repo}`];
		if (!existingRepository) {
			// Fetch the requested repository.
			let repository = await getRepository(to.params.owner, to.params.repo);
			if (!repository) {
				// TODO: Handle failure.
				return next(false);
			}

			// Add the repository to the store.
			Store.commit("Repositories/addSingle", repository);
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

.files {
	width: 100%;
	margin: 20px 0px;
	border: 1px solid rgba(black, .1);
	border-radius: 16px;
	box-sizing: border-box;
	overflow: hidden;
}
</style>