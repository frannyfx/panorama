<template>
	<div class="activity">
		<div class="activity-content" :class="{ invisible: !loaded }">
			<span class="activity-icon"><font-awesome-icon :icon="activityIcon"/></span>
			<div class="details">
				<span class="description ellipsis" v-html="activityDescription"></span>
				<span class="action" v-if="activityHasAction" @click="performAction">
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
import smoothReflow from "vue-smooth-reflow";

// Modules
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { Activity, ActivityType } from "../../shared/models/Activity";

export default Vue.extend({
	mixins: [smoothReflow],
	components: {
		FontAwesomeIcon
	},
	props: {
		activity: {
			type: Object as PropType<Activity>,
			required: false,
			default: null
		},
		loaded: {
			type: Boolean
		}
	},
	data() {
		return {
			activityDate: ""
		};
	},
	computed: {
		activityIcon() : string[] | string {
			if (this.activity?.type == ActivityType.ANALYSIS) return ["fab", "github"];
			return "eye";
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
		performAction() : void {
			if (this.activity?.type == ActivityType.ANALYSIS) {
				this.$router.push({
					name: "repo",
					params: {
						locale: this.$i18n.locale,
						owner: this.activity.data.owner,
						repo: this.activity.data.repositoryName
					}
				});

				return;
			}
		}
	},
	mounted() {
		// Reflow the content smoothly.
		this.$smoothReflow!({
			property: ["width"],
			transition: "width 1s"
		});
	}
});
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.activity {
	min-width: 290px;
	height: 120px;
	border-radius: 16px;
	background-color: $grey-tinted;
	overflow: hidden;

	/* Animation delay */
	@for $i from 1 through 3{
		&:nth-child(#{$i}) > .activity-content {
			transition-delay: ($i - 1) * .1s;
		}
	}

	.activity-content {
		width: 100%;
		height: 100%;
		background: linear-gradient(to bottom right, $blue, $purple);
		color: white;
		box-sizing: border-box;
		padding: 20px 30px;
		transition: opacity .6s;
		display: flex;
		align-items: center;

		&.invisible {
			opacity: 0;
		}

		.activity-icon {
			font-size: 2.5em;
			margin-right: 20px;
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