<template>
	<div class="file-percentage">
		<transition-group name="progress" tag="div" class="progress-bar">
			<div class="progress"
				v-tooltip="{ theme: 'panorama', content: login }"
				v-for="login in analysis.contributorList"
				:key="login"
				:style="{ 
					'background-color': `#${$store.state.Users.object[login].enrichedData.colour}`, 
					'width': `${Math.round(analysis.contributorObject[login].percentage * 100)}%`
				}"
			></div>
		</transition-group>
		<!--<div class="contributors">
			<div class="contributor" v-for="login in analysis.contributorList" :key="login">
				<div class="contributor-image"
					:style="{
						'background-color': `#${$store.state.Users.object[login].enrichedData.colour}`
					}"
				>
				</div>
				<span class="username" :style="{ 'color': `#${$store.state.Users.object[login].enrichedData.colour}`}">{{ login }}</span>
				<span class="percentage">{{`${Math.round(analysis.contributorObject[login].percentage * 100)}%`}}</span>
			</div>
		</div>-->
	</div>
</template>
<script lang="ts">
// Imports
import Vue, { PropType } from "vue";
import { Analysis } from "../modules/models/Analysis";
import { File } from "../modules/models/File"

export default Vue.extend({
	props: {
		analysis: {
			type: Object as PropType<Analysis>,
			required: true
		},
	}
})
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.file-percentage {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 200px;

	.progress-bar {
		width: 100%;
		height: 6px;
		border-radius: 10px;
		background-color: rgba($deep, .2);
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: flex-start;

		> :last-child {
			flex-grow: 1;
		}

		.progress {
			height: 100%;
			box-sizing: border-box;
			transition: width .5s, margin-right .2s;

			&:not(:last-child) {
				margin-right: 2px;
			}
		}
	}

	.contributors {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;

		.contributor {
			display: flex;
			align-items: center;

			&:not(:last-child) {
				margin-right: 10px;
			}

			.contributor-image {
				width: 10px;
				height: 10px;
				border-radius: 10px;
				margin-right: 5px;

				/*
				overflow: hidden;
				border: 2px solid transparent;

				.image {
					background-size: cover;
					background-position: center;
					width: 100%;
					height: 100%;
				}*/
			}

			.username {
				font-weight: 700;
				font-size: 0.8em;	
				margin-right: 5px;
			}

			.percentage {
				font-weight: 400;
				font-size: 0.8em;
				color: $grey-blue;
			}
		}
	}
}

.progress-enter-active, .progress-leave-active {
	transition: all .5s;
}

.progress-enter, .progress-leave-to {
	width: 0px !important;
	flex-grow: 0 !important;
}

.progress-move {
	position: absolute;
}

</style>