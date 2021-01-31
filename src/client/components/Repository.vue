<template>
	<div class="repo">
		<!--<font-awesome-icon class="repo-icon" icon="code"/>-->
		<div class="details">
			<div class="title">{{repo.name}}</div>
			<div class="subtitle">Updated {{updatedAt}}</div>
		</div>
		<div class="contributors">
			<div v-for="(contributor, index) in repo.contributors" :key="contributor.id" class="contributor"  :style="{'background-image':`url('${contributor.avatarUrl}')`, 'z-index': 5 - index}"></div>
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue, { PropType } from "vue";
import moment from "moment";

// Components
import { FontAwesomeIcon }  from "@fortawesome/vue-fontawesome";
import { Repository } from "../modules/GitHub";

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
	padding: 10px 20px;
	box-sizing: border-box;

	display: flex;
	align-items: center;
	justify-content: flex-start;

	> *:not(:last-child) {
		margin-right: 20px;
	}

	.repo-icon {
		color: $blue;
	}

	.details {
		display: flex;
		flex-direction: column;
		flex-grow: 1;

		.title {
			font-size: 0.9em;
			font-weight: 600;
		}

		.subtitle {
			font-size: 0.7em;
			color: #aaa;
		}

		
	}

	.contributors {
		display: flex;
		flex-direction: row;
		
		.contributor {
			width: 25px;
			height: 25px;

			background-size: cover;
			background-position: center;
			border: 2px solid white;
			border-radius: 30px;

			&:not(:first-child) {
				margin-left: -10px;
			}
		}
	}
	
}
</style>