<template>
	<div class="activity">
		<div class="activity-content" :class="{ invisible: !activity }">
			<span class="activity-icon"><font-awesome-icon :icon="activityIcon"/></span>
			<div class="details">
				<span class="description ellipsis" v-html="activityDescription"></span>
				<span class="action" v-if="activityHasAction">
					<font-awesome-icon class="action-icon" icon="chevron-right"/>
					<span>{{activityAction}}</span>
				</span>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue, { PropType } from "vue";
const moment = () => import("moment");

// Modules
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { Activity, ActivityType } from "../../shared/models/Activity";

export default Vue.extend({
	components: {
		FontAwesomeIcon
	},
	props: {
		activity: {
			type: Object as PropType<Activity>,
			required: false,
			default: null
		}
	},
	data() {
		return {
			activityDate: ""
		};
	},
	watch: {
		activity() {
			this.updateActivityDate();
		}	
	},
	computed: {
		activityIcon() : string[] | string {
			if (this.activity?.type == ActivityType.ANALYSIS) return ["fab", "github"];
			return "eye";
		},
		activityTitle() : string {
			if (this.activity?.type == ActivityType.ANALYSIS) return this.$i18n.t("activity.analysis.title").toString();
			return "";
		},
		activityDescription() : string {
			if (this.activity?.type == ActivityType.ANALYSIS) return this.$i18n.t("activity.analysis.description", [`${this.activity.data.owner}/${this.activity.data.repositoryName}`]).toString();
			return "";
		},
		activityHasAction() : boolean {
			return true;
		},
		activityAction() : string {
			if (this.activity?.type == ActivityType.ANALYSIS) return this.$i18n.t("activity.analysis.action").toString();
			return "";
		}
	},
	methods: {
		async updateActivityDate() {
			if (this.activity?.date) {
				let m = await moment();
				this.activityDate = m.default(this.activity.date).locale(this.$i18n.locale).fromNow();
				this.activityDate = `${this.activityDate.charAt(0).toUpperCase()}${this.activityDate.substr(1)}`;
			}
		}
	},
	mounted() {
		this.updateActivityDate();
	}
});
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.activity {
	max-width: 290px;
	height: 100px;
	border-radius: 16px;
	background-color: $grey-tinted;
	overflow: hidden;

	.activity-content {
		width: 100%;
		height: 100%;
		background: linear-gradient(to bottom right, $blue, $purple);
		color: white;
		box-sizing: border-box;
		padding: 20px 30px;
		transition: opacity 1s;
		display: flex;
		align-items: center;

		&.invisible {
			opacity: 0;
		}

		.activity-icon {
			font-size: 2.5em;
			margin-right: 10px;
		}

		.description {
			font-size: 0.85em;
			color: white;
		}

		.header {
			display: flex;
			align-items: center;
		}

		.details {
			display: flex;
			align-items: stretch;
			flex-direction: column;
			overflow: hidden;

			.action {
				cursor: pointer;
				transition: color .3s;
				color: rgba(white, .7);
				font-size: 0.75em;
				width: 100%;
				box-sizing: border-box;

				&:hover {
					color: white;
				}

				.action-icon {
					margin-right: 5px;
				}
			}
		}
	}
}
</style>