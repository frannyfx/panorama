<template>
	<div class="file-viewer-wrapper">
		<div class="list-item first margins header">
			<div class="file-icon" v-tooltip="{ 
				theme: 'panorama', 
				content: fileType ? $t('components.fileViewer.fileOfType', [fileType.name]) : $t('components.fileViewer.file')
			}">
				<img :src="iconPath">
			</div>
			<div class="details">
				<span>{{ file.name }}</span>
			</div>
			<div class="actions">
				<button class="action clean"
					:class="{ enabled: viewSource.enabled }"
					@click="toggleViewSource"
					:disabled="!canViewSource || !canNotViewSource"
					v-tooltip="{ theme: 'panorama', content: $t('components.fileViewer.viewSource') }">
					<font-awesome-icon icon="code"/>
				</button>
				<button class="action clean" 
					:class="{ enabled: viewStats.enabled }"
					@click="toggleViewStats"
					:disabled="!canViewStats"
					v-tooltip="{ theme: 'panorama', content: $t('components.fileViewer.viewStats') }">
					<font-awesome-icon icon="eye"/>
				</button>
			</div>
		</div>
		<div class="file-viewer list-item">
			<markdown-renderer class="markdown-renderer" v-if="fileType && fileType.name == 'Markdown' && !viewSource.enabled" :source="file.content.data" :relativeLinkRoot="rawLink"/>
			<div class="image-viewer" v-else-if="fileType && fileType.name == 'Image'">
				<a :href="fileLink" target="_blank"><img :src="`${rawLink}/${file.path}`"></a>
				<a :href="fileLink" target="_blank" class="title">{{ file.name }}</a>
				<a :href="fileLink" target="_blank" class="subtitle">{{ $t('components.fileViewer.fileOfType', [fileType.name]) }}</a>
			</div>			
			<div class="code-viewer" v-else-if="fileType && file.content.data && file.content.data != ''">
				<table class="line-table">
					<tr v-for="(line, index) in file.content.data.split('\n')" :key="index">
						<td class="line-number">{{ index + 1}}</td>
						<td class="code"><pre>{{line}}</pre></td>
					</tr>
				</table>
			</div>
			<div class="icon-preview" v-else-if="file.content.loaded">
				<a :href="fileLink" target="_blank"><img :src="iconPath"></a>
				<a :href="fileLink" target="_blank" class="title">{{ file.name }}</a>
				<a :href="fileLink" target="_blank" class="subtitle">{{ fileType ? $t('components.fileViewer.fileOfType', [fileType.name]) : $t('components.fileViewer.file') }}</a>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue, { PropType } from "vue";

// Modules
import config from "../config";
import { getFileContent } from "../modules/GitHub";
import { File } from "../modules/models/File";
import { Repository } from "../modules/models/Repository";
import Extensions from "../store/modules/Extensions";
import { FileType } from "../../shared/models/FileType";

// Components
import MarkdownRenderer from "../components/MarkdownRenderer.vue";
import { FontAwesomeIcon }  from "@fortawesome/vue-fontawesome";

export default Vue.extend({
	components: {
		MarkdownRenderer,
		FontAwesomeIcon
	},
	watch: {
		path(to, from) {
			// Watch for changes on the path so new content can be loaded.
			this.loadContent();
		},
	},
	computed: {
		file() : File {
			return this.$store.state.Repositories.object[this.repo.fullName].content.files[this.path];
		},
		fileType() : FileType {
			return Extensions.state.map[this.file.name.split(".").pop()!];
		},
		iconPath() : string {
			// Return folder icon.
			if (this.file.type == "dir") return `${config.repositories.extensions.icons.path}/folder.${config.repositories.extensions.icons.extension}`;

			// Get extension information
			if (this.fileType) return `${config.repositories.extensions.icons.path}/${this.fileType.icon}.${config.repositories.extensions.icons.extension}`;

			// No extension information, return default file icon.
			return `${config.repositories.extensions.icons.path}/file.${config.repositories.extensions.icons.extension}`;
		},
		content() : string {
			return this.file.content.loaded ? this.file.content.data : "";
		},
		rawLink() : string {
			return `https://github.com/${this.repo.owner.login}/${this.repo.name}/raw/${this.repo.analysis.id != -1 ? this.repo.analysis.commitId : this.repo.defaultBranch}`;
		},
		fileLink() : string {
			return `${this.rawLink}/${this.file.path}`;
		},
		canViewSource() : boolean {
			return this.file.content.data != null && this.file.content.data != "";
		},
		canNotViewSource() : boolean {
			return this.fileType.name == "Markdown";
		},
		canViewStats() : boolean {
			return this.file.analysis != null;
		}
	},
	data() {
		return {
			viewSource: {
				enabled: false
			},
			viewStats: {
				enabled: false
			}
		};
	},
	methods: {
		async loadContent() {
			// If the file has not had its content loaded, fetch the content from GitHub.
			if (!this.file.content.loaded) {
				// Set loading animation.
				this.$store.commit("Repositories/setFileContentLoading", { file: this.file, loading: true });

				// Fetch the file.
				let content = await getFileContent(this.repo, this.file);
				if (!content) console.log(`File ${this.file.path} from ${this.repo.fullName} failed to load.`);

				// Set the content
				this.$store.commit("Repositories/setFileContentLoading", { file: this.file, loading: false });
				this.$store.commit("Repositories/setFileContent", { file: this.file, content });
			}

			// If the file is not Markdown and the data loaded successfully, then enable viewSource.
			this.viewSource.enabled = this.canViewSource && !this.canNotViewSource;
		},
		toggleViewSource() {
			if (!this.canViewSource) return;
			this.viewSource.enabled = !this.viewSource.enabled;
		},
		toggleViewStats() {
			if (!this.canViewStats) return;
			this.viewStats.enabled = !this.viewStats.enabled;
		}
	},
	props: {
		path: {
			type: String,
			required: true
		},
		repo: {
			type: Object as PropType<Repository>,
			required: true
		}
	},
	mounted() {
		this.loadContent();
	}
});
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.file-viewer-wrapper {
	width: 100%;
	margin: 20px 0px;
	border: 1px solid rgba($deep, .1);
	border-radius: 16px;
	box-sizing: border-box;
	overflow: hidden;

	.list-item.header {
		display: flex;
		align-items: center;
		justify-content: flex-start;

		box-sizing: border-box;
		padding: 10px 0px;
		height: 50px;

		font-size: 0.85em;

		> *:not(:last-child) {
			margin-right: 20px;
		}

		.file-icon {
			display: flex;
			align-items: center;

			> img {
				width: 20px;
			}
		}

		.details {
			color: $grey-blue;
			font-weight: 600;
			flex-grow: 1;
		}

		.actions {
			display: flex;

			.action {
				color: $grey-blue;
				width: 30px;
				height: 30px;
				border-radius: 30px;
				font-size: 1.1em;
				
				display: flex;
				align-items: center;
				justify-content: center;
				transition: transform .3s, background-color .3s, color .3s, opacity .3s;

				&:disabled {
					opacity: .4;
				}

				&:not(:disabled) {
					&:hover {
						transform: scale(1.1);
					}
				}
			}

			.action.enabled {
				background-color: $blue;
				color: white;
			}

			> :not(:last-child) {
				margin-right: 10px;
			}
		}
	}
	
	.file-viewer {
		margin: 0 !important;
	}
}

.markdown-renderer {
	padding: 40px;
}

.image-viewer, .icon-preview {
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40px;
	box-sizing: border-box;
	color: $grey-blue;

	.title {
		font-size: 1.3em;
		margin-top: 10px;
	}

	.subtitle {
		font-size: 0.85em;
		font-weight: 600;
	}
	
	img {
		max-width: 100%;
	}
}

.icon-preview {
	img {
		width: 150px;
	}
}

.code-viewer {
	overflow-x: auto;
	width: 100%;

	.line-table {	
		border-collapse: collapse;
		table-layout: fixed;
		
		tr {
			&:first-child > .line-number {
				padding-top: 8px;
			}

			&:last-child > .line-number {
				padding-bottom: 8px;
			}

			> :first-child {
				left: 0;
				position: sticky;
				z-index: 100;
			}

			.line-number {
				text-align: right;
				font-size: 0.8em;
				font-weight: 600;
				min-width: 30px;
				background-color: white;
				color: $grey-blue;
				padding: 4px 8px;

				/* Use box-shadow for border since border gets cut off when sticky */
				box-shadow: inset -1px 0px 0 rgba($deep, .1);
			}

			.code {
				padding: 0px 20px;

				pre {
					margin: 0;
				}
			}
		}
	}
}

</style>