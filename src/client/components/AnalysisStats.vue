<template>
	<div class="analysis-stats" :class="{ first: !show }">
		<panel key="header" :show="show">
			<div class="panel-content header">
				<div class="file">
					<div class="file-icon">
						<img :src="iconPath">
					</div>
					<div class="details">
						<h3 class="file-name">
							<span v-if="file.type == 'file' || file.path != ''">{{file.name}}</span>
							<span v-else>{{repo.name}}</span>
						</h3>
						<div class="file-info">
							<div v-if="file.type == 'file'" class="dot-indicator" :style="{
								'background-color': fileType ? `#${fileType.colour}` : undefined
							}"></div>
							<span v-if="file.type == 'file'">
								<span v-if="fileType && file.parent.path != ''">{{$t("components.analysisStats.fileOfTypeInFolder", [fileType.name, file.parent.path])}}</span>
								<span v-else-if="!fileType && file.parent.path != ''">{{$t("components.analysisStats.fileInFolder", [file.parent.path])}}</span>
								<span v-else-if="fileType && file.parent.path == ''">{{$t("components.analysisStats.fileOfTypeInRoot", [fileType.name])}}</span>
								<span v-else>{{$t("components.analysisStats.fileInRoot")}}</span>
							</span>
							<span v-else>
								<span v-if="file.path != '' && file.parent.path == ''">{{$t("components.analysisStats.folderInRoot")}}</span>
								<span v-else-if="file.path != ''">{{$t("components.analysisStats.folderInFolder", [file.parent.path])}}</span>
								<span v-else>{{$t("components.analysisStats.gitRepo")}}</span>
							</span>
						</div>
					</div>
				</div>
				<div class="contributors">
					<contributor-bubbles key="contributor-bubbles" :contributor-list="file.analysis.available ? file.analysis.data.contributorList : []" :max-items="5"/>
				</div>
			</div>
		</panel>
		<panel key="contributor-stats" :show="show && file.analysis.available">
			<div class="panel-content contributor-stats">
				<div class="stats-header">
					<div class="details">
						<h3>{{$t("components.analysisStats.contributors")}}</h3>
					</div>
					<div class="actions">
						<div v-tooltip="{ theme: 'panorama', content: $t('components.analysisStats.viewToScale') }">
							<button class="action" 
								:class="{ enabled: contributorStats.toScale.enabled }"
								@click="() => toggleToScale('contributorStats')">
								<font-awesome-icon icon="chart-pie"/>
							</button>
						</div>
					</div>
				</div>
				<analysis-bar :items="file.analysis.available ? contributorBarItems : []" :to-scale="contributorStats.toScale.enabled" description-key="components.analysisStats.linesOfCode" :max-items="5"/>
			</div>
		</panel>
		<panel key="file-type-stats" :show="show && file.analysis.available && file.type == 'dir'">
			<div class="panel-content file-type-stats">
				<div class="stats-header">
					<div class="details">
						<h3>{{$t("components.analysisStats.fileTypes")}}</h3>
					</div>
					<div class="actions">
						<div v-tooltip="{ theme: 'panorama', content: $t('components.analysisStats.viewToScale') }">
							<button class="action" 
								:class="{ enabled: fileTypeStats.toScale.enabled }"
								@click="() => toggleToScale('fileTypeStats')">
								<font-awesome-icon icon="chart-pie"/>
							</button>
						</div>
					</div>
				</div>
				<analysis-bar :items="file.analysis.available && file.type == 'dir' ? fileTypeBarItems : []" :to-scale="fileTypeStats.toScale.enabled" description-key="components.analysisStats.linesOfCode"/>
			</div>
		</panel>
		<panel key="token-stats" :show="show && file.analysis.available">
			<div class="panel-content token-stats">
				<div class="stats-header">
					<div class="details">
						<h3>{{$t("components.analysisStats.codeClassification")}}</h3>
					</div>
					<div class="actions">
						<div v-tooltip="{ theme: 'panorama', content: $t('components.analysisStats.viewToScale') }">
							<button class="action" 
								:class="{ enabled: tokenStats.toScale.enabled }"
								@click="() => toggleToScale('tokenStats')">
								<font-awesome-icon icon="chart-pie"/>
							</button>
						</div>
					</div>
				</div>
				<analysis-bar :items="file.analysis.available ? codeClassificationBarItems : []" :to-scale="tokenStats.toScale.enabled" description-key="components.analysisStats.linesOfCode"/>
			</div>
		</panel>
	</div>
</template>
<script lang="ts">
// Imports
import Vue, { PropType } from "vue";
import { FileType } from "../../shared/models/FileType";
import { File, getIconPath } from "../modules/models/File";
import { Repository } from "../modules/models/Repository";
import { BarItem } from "../modules/models/Bar";

// Components
import { FontAwesomeIcon }  from "@fortawesome/vue-fontawesome";
import ContributorBubbles from "./ContributorBubbles.vue";
import AnalysisBar from "./AnalysisBar.vue";
import Panel from "./Panel.vue";

export default Vue.extend({
	components: {
		FontAwesomeIcon,
		ContributorBubbles,
		AnalysisBar,
		Panel
	},
	props: {
		repo: {
			type: Object as PropType<Repository>,
			required: true
		},
		path: {
			type: String,
			required: true
		},
		show: {
			type: Boolean,
			required: true
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
		contributorBarItems() : BarItem[] {
			return this.file.analysis.data!.contributorList.map(login => {
				// Get contributor and contributor stats.
				let contributor = this.$store.state.Users.object[login];
				let contributorStats = this.file.analysis.data!.contributorObject[login];
				
				// Convert the available data to a bar item.
				return {
					data: {
						id: contributorStats.contributorId,
						percentage: contributorStats.percentage * 100,
						value: contributorStats.numLines
					},
					view: {
						label: contributor.id == -1 ? this.$i18n.t("components.analysisStats.anonymous").toString() : contributor.login,
						colour: contributor.enrichedData.colour
					}
				}
			});
		},
		fileTypeBarItems() : BarItem[] {
			return this.file.analysis.data!.typeList.map(type => {
				// Get file type and file type stats.
				let fileType = this.$store.state.Extensions.typeMap[type];
				let fileTypeStats = this.file.analysis.data!.typeObject[type];

				// Convert the available data to a bar item.
				return {
					data: {
						id: fileType.typeId,
						percentage: fileTypeStats.percentage * 100,
						value: fileTypeStats.numLines
					},
					view: {
						label: fileType.name,
						colour: fileType.colour
					}
				};
			});
		},
		codeClassificationBarItems() : BarItem[] {
			return this.file.analysis.data!.tokenList.map(token => {
				// Get token and token stats.
				let tokenData = this.$store.state.Tokens.map[token];
				let tokenStats = this.file.analysis.data!.tokenObject[token];

				return {
					data: {
						id: token,
						percentage: tokenStats.percentage * 100,
						value: tokenStats.numLines
					},
					view: {
						colour: tokenData.colour,
						label: this.$i18n.t(`tokens.${tokenData.name}`).toString()
					}
				}
			});
		}
	},
	data() {
		return {
			contributorStats: {
				toScale: {
					enabled: false
				}
			},
			fileTypeStats: {
				toScale: {
					enabled: false
				}
			},
			tokenStats: {
				toScale: {
					enabled: false
				}
			}
		};
	},
	methods: {
		toggleToScale(key: "contributorStats" | "fileTypeStats" | "tokenStats") {
			this[key].toScale.enabled = !this[key].toScale.enabled;
		}
	}
});
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.analysis-stats {
	box-sizing: border-box;

	.header {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;

		.file {
			display: flex;
			align-items: center;
			flex-grow: 100;

			@include sm {
				flex-grow: 0;

				.details {
					flex-grow: 0;
				}
			}

			.file-icon {
				display: flex;
				align-items: center;

				img {
					height: 60px;
				}
			}

			.details {
				margin-left: 20px;
				flex-grow: 1;

				.file-name {
					font-size: 1.3em;
					color: $grey-blue;
					margin: 0;
				}

				.file-info {
					display: flex;
					align-items: center;

					.dot-indicator {
						margin-right: 8px;
					}

					font-size: 0.8em;
					font-weight: 400;
					color: $light-grey-blue;
					margin: 0;
				}
			}
		}

		.contributors {
			flex-shrink: 1;
			flex-grow: 1;

			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;
			padding: 10px;
		}
	}

	.stats-header {
		width: 100%;
		display: flex;
		align-items: center;
		margin-bottom: 20px;

		.details {
			flex-grow: 1;

			h3 {
				color: $grey-blue;
			}
		}
	}
}
</style>