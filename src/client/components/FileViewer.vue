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
				<span class="name">{{ file.name }}</span>
				<span class="size" v-tooltip="{ theme: 'panorama', content: $t('components.fileViewer.fileSize')}">{{humanFileSize}}</span>
			</div>
			<div class="actions">
				<div v-tooltip="{ theme: 'panorama', content: $t('components.fileViewer.viewSource') }">
					<button class="action"
						:class="{ enabled: viewSource.enabled }"
						@click="toggleViewSource"
						:disabled="!canViewSource || !canNotViewSource">
						<font-awesome-icon icon="code"/>
					</button>
				</div>
				<div v-tooltip="{ theme: 'panorama', content: $t('components.fileViewer.viewStats') }">
					<button class="action" 
						:class="{ enabled: viewStats.enabled }"
						@click="toggleViewStats">
						<font-awesome-icon icon="eye"/>
					</button>
				</div>
			</div>
		</div>
		<analysis-stats :show="viewStats.enabled" :repo="repo" :path="path"/>
		<smooth-height>
			<div class="file-viewer list-item">
				<markdown-renderer class="markdown-renderer" v-if="fileType && fileType.name == 'Markdown' && !viewSource.enabled && canNotViewSource" :source="file.content.data" :relativeLinkRoot="rawLink"/>
				<div class="image-viewer" v-else-if="fileType && fileType.name == 'Image'">
					<a :href="fileLink" target="_blank"><img :src="`${rawLink}/${file.path}`"></a>
					<a :href="fileLink" target="_blank" class="title">{{ file.name }}</a>
					<a :href="fileLink" target="_blank" class="subtitle">{{ $t('components.fileViewer.fileOfType', [fileType.name]) }} &bull; {{humanFileSize}}</a>
				</div>			
				<div class="code-viewer" v-else-if="fileType && file.content.data && file.content.data != '' && canViewSource">
					<table class="line-table">
						<tr v-for="(line, index) in highlightedLines" :key="index">
							<td class="line-number no-select">{{ index + 1}}</td>
							<td
								v-if="file.analysis.available && file.analysis.data.chunks.loaded && file.analysis.data.chunks.object[index + 1]"
								class="analysis-chunk no-select"
								:class="{ last: file.analysis.data.chunks.object[index + 1].index == file.analysis.data.chunks.list.length - 1 }"
								:rowspan="file.analysis.data.chunks.object[index + 1].index == file.analysis.data.chunks.list.length - 1 ? highlightedLines.length - index + 1 : (file.analysis.data.chunks.object[index + 1].end - file.analysis.data.chunks.object[index + 1].start) + 1">
								<div class="details">
									<span>{{ file.analysis.data.chunks.object[index + 1].login || $t("components.fileViewer.anonymous") }}</span>
								</div>
							</td>
							<td 
								v-if="file.analysis.available && file.analysis.data.tokens.loaded && file.analysis.data.tokens.object[index + 1]"
								class="token no-select"
								:class="{ last: file.analysis.data.tokens.object[index + 1].index == file.analysis.data.tokens.list.length - 1 }"
								v-tooltip="{ theme: 'panorama', content: file.analysis.data.tokens.object[index + 1].tokens.map(token => $t(`tokens.${$store.state.Tokens.map[token].name}`)).join(', ') }"
								:rowspan="file.analysis.data.tokens.object[index + 1].index == file.analysis.data.tokens.list.length - 1 ? highlightedLines.length - index + 1 : (file.analysis.data.tokens.object[index + 1].end - file.analysis.data.tokens.object[index + 1].start) + 1">
								<div class="dots">
									<div class="dot-indicator" v-for="token in file.analysis.data.tokens.object[index + 1].tokens" :key="token" :style="{
										'background-color': `#${$store.state.Tokens.map[token].colour}`
									}"></div>
								</div>
							</td>
							<td class="code"><pre v-html="line"></pre></td>
						</tr>
					</table>
				</div>
				<div class="icon-preview" v-else-if="file.content.loaded">
					<a :href="fileLink" target="_blank"><img :src="iconPath"></a>
					<a :href="fileLink" target="_blank" class="title">{{ file.name }}</a>
					<a :href="fileLink" target="_blank" class="subtitle">{{ fileType ? $t('components.fileViewer.fileOfType', [fileType.name]) : $t('components.fileViewer.file') }} &bull; {{humanFileSize}}</a>
				</div>
			</div>
		</smooth-height>
	</div>
</template>
<script lang="ts">
// Imports
import Vue, { PropType } from "vue";
import { encode as encodeHTMLEntities } from "html-entities";

// Modules
import config from "../config";
import { getFileContent } from "../modules/GitHub";
import { File, getIconPath } from "../modules/models/File";
import { Repository } from "../modules/models/Repository";
import { FileType } from "../../shared/models/FileType";
import hljs from "highlight.js";
import { humanFileSize } from "../../shared/utils";
import { send } from "../modules/API";
import { Method } from "../../shared/Method";

// Components
import { FontAwesomeIcon }  from "@fortawesome/vue-fontawesome";
import MarkdownRenderer from "../components/MarkdownRenderer.vue";
import AnalysisStats from "./AnalysisStats.vue";
import SmoothHeight from "./SmoothHeight.vue";

export default Vue.extend({
	components: {
		FontAwesomeIcon,
		MarkdownRenderer,
		AnalysisStats,
		SmoothHeight
	},
	watch: {
		path(to, from) {
			// Watch for changes on the path so new content can be loaded.
			this.loadContent();
		},
		"file.content.loaded": function (to: boolean, from: boolean) {
			if (!to) this.loadContent();
		},
		"viewSource.enabled": function (to: boolean, from: boolean) {
			// Get current query string and add new view source value to it.
			let {...query} = this.$route.query;
			query["view-file-source"] = to ? "1" : "0";

			// Prevent duplicate navigation.
			if (query["view-file-source"] == this.$route.query["view-file-source"]) return;

			// Replace current route with view source route.
			this.$router.replace({
				name: this.$route.name!,
				params: this.$route.params,
				query
			});
		},
		"viewStats.enabled": function (to: boolean, from: boolean) {
			// Get current query string and add new stats value to it.
			let {...query} = this.$route.query;
			query["view-file-stats"] = to ? "1" : "0";

			// Prevent duplicate navigation.
			if (query["view-file-stats"] == this.$route.query["view-file-stats"]) return;

			// Replace current route with stats route.
			this.$router.replace({
				name: this.$route.name!,
				params: this.$route.params,
				query
			});
		}
	},
	computed: {
		file() : File {
			return this.$store.state.Repositories.object[this.repo.fullName].content.files[this.path];
		},
		extension() : string {
			return this.file.name.split(".").pop()!;
		},
		fileType() : FileType {
			return this.$store.state.Extensions.map[this.extension];
		},
		iconPath() : string {
			return getIconPath(this.file);
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
			return this.fileType && this.fileType.name == "Markdown";
		},
		highlightedLines() : string[] {
			// Get language from file type.
			let language = this.fileType ? this.fileType.language : undefined;

			// If there's no file type or the language is not supported, escape HTML and split by line.
			if (!language) return encodeHTMLEntities(this.content).split("\n");

			// Store state generated by the previous line.
			var state : Language | CompiledMode | undefined = undefined;

			// Loop through the lines.
			let lines = this.content.split("\n").map(line => {
				// Highlight the current line using the previous state as context.
				let result = hljs.highlight(language!, line, true, state);
				state = result.top;

				// Return the highlighted HTML code.
				return result.value;
			});
			
			// Return the list of highlighted lines.
			return lines;
		},
		humanFileSize() : string {
			return humanFileSize(this.file.size);
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
			if (this.file.content.loading) return;

			// If the file has not had its content loaded, fetch the content from GitHub.
			if (!this.file.content.loaded) {
				// Set loading animation.
				this.$store.commit("Repositories/setFileContentLoading", { file: this.file, loading: true });

				// Fetch the file.
				let content = await getFileContent(this.repo, this.file);
				if (!content) console.log(`File ${this.file.path} from ${this.repo.fullName} failed to load.`);

				// Set the content
				this.$store.commit("Repositories/setFileContent", { file: this.file, content });
			}

			// Fetch chunk content for the file if possible & necessary.
			if (this.repo.analysis.id != -1 && this.file.analysis.available && !this.file.analysis.data!.chunks.loaded && this.repo.analysis.ticket) {
				// Set loading animation.
				if (!this.file.content.loading) this.$store.commit("Repositories/setFileContentLoading", { file: this.file, loading: true });

				// Fetch the file chunks.
				let chunks = await send(Method.GET, `analysis/${this.repo.analysis.id}/chunks?path=${this.file.path}&ticket=${this.repo.analysis.ticket!}`);
				if (!chunks.status.ok) console.log(`Chunks for file ${this.file.path} from ${this.repo.fullName} failed to load.`);

				// Set the chunks.
				this.$store.commit("Repositories/setFileChunks", { file: this.file, chunks: chunks.result! });
			}

			// Fetch token content for the file if possible & necessary.
			if (this.repo.analysis.id != -1 && this.file.analysis.available && !this.file.analysis.data!.tokens.loaded && this.repo.analysis.ticket) {
				// Set loading animation
				if (!this.file.content.loading) this.$store.commit("Repositories/setFileContentLoading", { file: this.file, loading: true });

				// Fetch the file tokens.
				let tokens = await send(Method.GET, `analysis/${this.repo.analysis.id}/tokens?path=${this.file.path}&ticket=${this.repo.analysis.ticket!}`);
				if (!tokens.status.ok) console.log(`Tokens for file ${this.file.path} from ${this.repo.fullName} failed to load.`);

				// Set the tokens.
				this.$store.commit("Repositories/setFileTokens", { file: this.file, tokens: tokens.result! });
			}

			// Stop loading animation.
			this.$store.commit("Repositories/setFileContentLoading", { file: this.file, loading: false });

			// Remember the user's preferences with viewing the source code and viewing the stats, but adjust them on whether it is possible.
			this.viewSource.enabled = this.$route.query["view-file-source"] == "1" || (this.canViewSource && !this.canNotViewSource);
			this.viewStats.enabled = this.$route.query["view-file-stats"] == "1";
		},
		toggleViewSource() {
			if (!this.canViewSource) return;
			this.viewSource.enabled = !this.viewSource.enabled;
		},
		toggleViewStats() {
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
	border: 1px solid $grey-tinted;
	border-radius: 16px;
	box-sizing: border-box;
	overflow: hidden;

	.list-item.header {
		display: flex;
		align-items: center;
		justify-content: flex-start;

		box-sizing: border-box;
		padding: 10px 30px;
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

			display: flex;
			align-items: center;

			.name {
				flex-grow: 1;
			}

			.size {
				color: $light-grey-blue;
				font-size: 0.9em;
			}
		}

		.actions {
			display: flex;

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
	padding: 30px 40px 40px 40px;
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
		margin-top: 15px;
	}

	.subtitle {
		margin-top: 5px;
		font-size: 0.8em;
		font-weight: 600;
	}
	
	img {
		max-width: 100%;
	}
}

.image-viewer {
	img {
		border-radius: 5px;
	}
}

.icon-preview {
	img {
		width: 100px;
	}
}

.code-viewer {
	overflow-x: auto;
	width: 100%;

	.line-table {	
		border-collapse: collapse;
		table-layout: fixed;
		
		tr {
			&:first-child {
				> .line-number {
					padding-top: 8px;
				}
			}

			&:last-child {
				> .line-number {
					padding-bottom: 8px;
				}
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
				box-shadow: inset -1px 0px 0 $grey-tinted;
			}

			.analysis-chunk {
				text-align: center;
				font-size: 0.8em;
				font-weight: 600;
				color: $grey-blue;
				z-index: 100;

				> .details {
					display: flex;
					align-items: center;
					justify-content: center;
				}
			}

			.token > .dots {
				display: flex;
				align-items: center;
				justify-content: center;

				> :not(:last-child) {
					margin-right: 5px;
				}
			}

			.analysis-chunk, .token {
				border-right: 1px solid $grey-tinted;
				padding: 0px 10px;

				&:not(.last) {
					border-bottom: 1px solid $grey-tinted;
				}
			}

			.code {
				padding: 5px 20px;

				pre {
					margin: 0;
				}
			}
		}
	}
}
</style>
<style lang="scss">
@import "~highlight.js/scss/mono-blue.scss";
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap');
pre, .markdown-body pre code {
	font-family: 'Roboto Mono', monospace;
}

.code-viewer pre {
	font-size: 0.8em;
}

.code {
	.hljs {
		background: transparent !important;
	}
}
</style>