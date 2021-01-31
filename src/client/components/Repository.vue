<template>
	<div class="repo">
		<font-awesome-icon class="repo-icon" :icon="repo.private ? 'lock' : 'book'"/>
		<div class="details">
			<div class="title">
				<span class="owner">{{repo.owner.login}}/</span><span class="name">{{repo.name}}</span>
			</div>
			<div class="subtitle">
				Last updated <span class="strong">{{updatedAt}}</span>.
			</div>
		</div>
		<div class="contributors hide-small" v-if="repo.contributors.length > 0">
			<div v-for="(contributor, index) in repo.contributors" :key="contributor.id" class="contributor"  :style="{'background-image':`url('${contributor.avatarUrl}')`, 'z-index': 5 - index}"></div>
		</div>
		<div class="actions">
			<button><font-awesome-icon icon="chart-bar"/>Analyse</button>
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue, { PropType } from "vue";
import moment from "moment";

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
		}
	},
	mounted: function () {
		this.updatedAt = moment(this.repo.updated_at).fromNow();
	}
});
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.repo {
	border-bottom: 1px solid rgba(black, .1);
	padding: 10px 0px;
	box-sizing: border-box;
	height: 70px;

	display: flex;
	align-items: center;
	justify-content: flex-start;

	> *:not(:last-child) {
		margin-right: 20px;
	}

	.repo-icon {
		font-size: 0.8em;
		color: #aaa;
	}

	.details {
		display: flex;
		flex-direction: column;
		width: 500px;

		.title {
			font-size: 1em;
			font-weight: 600;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;

			.owner {
				font-weight: 700;
			}
		}

		.subtitle {
			font-size: 0.7em;
			color: #aaa;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}

		
	}

	.contributors {
		display: flex;
		flex-direction: row;
		
		.contributor {
			width: 20px;
			height: 20px;

			background-size: cover;
			background-position: center;
			border: 2px solid white;
			border-radius: 30px;

			transition: transform 0.3s;

			&:not(:first-child) {
				margin-left: -8px;
			}

			&:hover {
				transform: scale(2);
				z-index: 10 !important;
			}
		}
	}

	.actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex-grow: 1;
	}
}
</style>