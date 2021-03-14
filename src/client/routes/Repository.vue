<template>
	<div class="page nav no-select">
		<div class="content container">
			<h2 class="title">
				<font-awesome-icon v-tooltip="{ theme: 'panorama', content: repo.private ? $t('routes.repo.private') : $t('routes.repo.public') }" class="repo-icon" :icon="repo.private ? 'lock' : 'book'"/>
				<span class="minor">{{$route.params.owner}}</span>
				<span class="separator">/</span>
				<span class="major">{{$route.params.repo}}</span>
			</h2>
			<p class="description">{{repo.description && repo.description.trim().length != 0 ? repo.description : $t("routes.repo.noDescription")}}</p>
			<div class="files">
				<div class="list-item first header">
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
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue from "vue";
import Store from "../store";

// Modules
import { send, waitForAuth } from "../modules/API";
import { i18n } from "../i18n";
import { getFiles, getRepository } from "../modules/GitHub";
import Repositories from "../store/modules/Repositories";
import { Repository } from "../modules/models/Repository";
import { Method } from "../../shared/Method";
import Extensions from "../store/modules/Extensions";
import { File } from "../modules/models/File";
import { dedupe } from "../../shared/utils";

// Components
import { FontAwesomeIcon }  from "@fortawesome/vue-fontawesome";
import RepositoryFileListItem from "../components/RepositoryFileListItem.vue";


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
	let validExtensions : string[] = files
		.filter(file => file.type == "file")
		.map(file => file.name.split(".").pop()!)
		.filter(extension => extension && !Extensions.state.map[extension] && Extensions.state.unknown.indexOf(extension) == -1);

	// If there are extensions to request, process them and request them.
	if (validExtensions.length != 0) {
		// Remove duplicates.
		let extensionSet = dedupe(validExtensions, (a: string, b: string) => a == b);

		// Get the extension data.
		let extensionData = await send(Method.GET, `extensions?list=${extensionSet.join(",")}`);

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
	

	// Add to store.
	Store.commit("Repositories/addFileChildren", {
		repository,
		path, files
	});

	return true;
}

export default Vue.extend({
	components: {
		FontAwesomeIcon,
		RepositoryFileListItem
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
			if (file && file.type != "dir") return;

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

.title {
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
	font-size: 0.85em;
	color: $grey-blue;
	margin-top: 0px;
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