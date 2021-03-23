<template>
	<div class="analysis-stats list-item">
		<div class="header">
			<div class="file-icon">
				<img :src="iconPath">
			</div>
			<div class="details">
				<h3 class="file-name">
					<span v-if="file.type == 'file' || file.path != ''">{{file.name}}</span>
					<span v-else>{{repo.name}}</span>
				</h3>
				<p class="file-info">
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
				</p>
			</div>
			<div class="contributors" v-if="file.analysis">
				<div class="list">
					<contributor-bubble v-for="login in file.analysis.contributorList.slice(0, 3)" :key="login" :login="login"/>
				</div>
				<div class="list">
					<contributor-bubble v-for="login in file.analysis.contributorList.slice(3, 8)" :key="login" :login="login" :small="true"/>
				</div>
			</div>
		</div>
		<div class="contributor-stats">
			<div class="stats-header">
				<div class="details">
					<h3>Contributors</h3>
				</div>
				<div class="actions"></div>
			</div>
			<analysis-bar :items="contributorBarItems"/>
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue, { PropType } from "vue";
import { FileType } from "../../shared/models/FileType";
import { File, getIconPath } from "../modules/models/File";
import { Repository } from "../modules/models/Repository";

// Components
import ContributorBubble from "./ContributorBubble.vue";
import AnalysisBar from "./AnalysisBar.vue";
import { BarItem } from "../modules/models/Bar";

export default Vue.extend({
	components: {
		ContributorBubble,
		AnalysisBar
	},
	props: {
		repo: {
			type: Object as PropType<Repository>,
			required: true
		},
		path: {
			type: String,
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
			return this.file.analysis!.contributorList.map(login => {
				// Get contributor and contributor stats.
				let contributor = this.$store.state.Users.object[login];
				let contributorStats = this.file.analysis!.contributorObject[login];
				
				// Convert the available data to a bar item.
				return {
					data: {
						id: contributorStats.contributorId,
						percentage: contributorStats.percentage * 100
					},
					view: {
						label: contributor.id == -1 ? this.$i18n.t("components.analysisStats.anonymous").toString() : contributor.login,
						colour: contributor.enrichedData.colour,
						description: this.$i18n.tc("components.analysisStats.linesOfCode", contributorStats.numLines, [contributorStats.numLines]).toString()
					}
				}
			});
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
		padding: 30px 40px;

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
				font-size: 0.8em;
				font-weight: 600;
				color: $light-grey-blue;
				margin: 0;
			}
		}
		
		.contributors {
			display: flex;
			align-items: center;
			flex-direction: column;

			.list {
				display: flex;
				align-items: center;
				flex-direction: row;
			}

			> :not(:last-child) {
				margin-bottom: 8px;
			}
		}
	}

	.contributor-stats {
		border-top: 1px solid $grey-tinted;
		box-sizing: border-box;
		padding: 30px 40px;

		.stats-header {
			margin-bottom: 20px;

			.details {
				flex-grow: 1;
				h3 {
					color: $grey-blue;
				}
			}
		}

		
	}
}
</style>