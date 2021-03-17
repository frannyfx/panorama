<template>
	<div class="repo-wrapper">
		<div class="repo list-item margins clickable" :class="{ 'first': index == 0 }">
			<font-awesome-icon v-tooltip="{ theme: 'panorama', content: repo.private ? $t('components.repositoryListItem.private') : $t('components.repositoryListItem.public') }" class="repo-icon" :icon="repo.private ? 'lock' : 'book'"/>
			<div class="details">
				<div class="title">
					<span class="owner">{{repo.owner.login}}</span>
					<span class="slash">/</span>
					<span class="name">{{repo.name}}</span>
					<span class="analysed" v-show="repo.analysis.id != -1" v-tooltip="{ theme: 'panorama', content: $t('components.repositoryListItem.analysed') }">
						<font-awesome-icon icon="check"/>
					</span>
				</div>
				<div class="subtitle" v-html="$t('components.repositoryListItem.lastUpdated', [`<span class='strong'>${updatedAt}</span>`])">
				</div>
			</div>
			<div class="contributors hide-small">
				<div class="contributors-row" v-if="repo.contributors.list.length > 0">
					<div v-tooltip="{ theme: 'panorama', content: contributor.login }" v-for="(contributor, index) in repo.contributors.list" :key="contributor.id" class="contributor" :style="{ 'z-index': 5 - index }">
						<div class="image" :style="{'background-image': `url('${contributor.avatarUrl}')`}"></div>
					</div>
				</div>
				<div class="subtitle" v-else>
					{{ $t("components.repositoryListItem.noContributors") }}
				</div>
			</div>
			<div class="actions">
				<font-awesome-icon icon="chevron-right"/>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue, { PropType } from "vue";
const moment = () => import("moment");

// Components
import { FontAwesomeIcon }  from "@fortawesome/vue-fontawesome";
import { Repository } from "../modules/models/Repository";

export default Vue.extend({
	components: {
		FontAwesomeIcon
	},
	data() {
		return {
			updatedAt: ""
		};
	},
	props: {
		repo: {
			type: Object as PropType<Repository>,
			required: true
		},
		index: {
			type: Number,
			required: true,
			default: -1
		}
	},
	mounted: async function () {
		let m = await moment();
		this.updatedAt = m.default(this.repo.updatedAt).locale(this.$i18n.locale).fromNow();
	}
});
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.repo {
	display: flex;
	align-items: center;
	justify-content: flex-start;

	box-sizing: border-box;
	padding: 10px 0px;
	height: 70px;

	.repo-icon {
		font-size: 0.8em;
		color: #aaa;
	}

	.details {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		flex-shrink: 1;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;

		.title {
			font-size: 1em;
			font-weight: 600;
			display: flex;
			flex-direction: row;
			align-items: center;

			.owner, .name {
				color: $blue;
			}

			.slash {
				margin: 0px 4px;
				font-size: 1.3em;
				font-weight: 400;
			}

			.name {
				font-weight: 700;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			}

			.analysed {
				color: $blue;
				font-size: 0.8em;
				margin-left: 6px;
			}
		}
	}

	.subtitle {
		font-size: 0.7em;
		color: #aaa;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.contributors {
		.contributors-row {
			display: flex;
			flex-direction: row;
			
			.contributor {
				width: 30px;
				height: 30px;
				background-color: white;
				overflow: hidden;
				border-radius: 30px;
				border: 3px solid white;

				.image {
					width: 100%;
					height: 100%;
					background-size: cover;
					background-position: center;
				}

				&:not(:first-child) {
					margin-left: -10px;
				}
			}
		}
	}
	
	.actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex-grow: 0;
		flex-shrink: 0;

		color: #aaa;
		font-size: 0.9em;
	}
}
</style>