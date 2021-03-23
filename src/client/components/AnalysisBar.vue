<template>
	<div class="analysis-bar">
		<div class="bar">
			<div 
				class="segment" 
				v-for="item in items" :key="item.data.id" 
				v-tooltip="{ theme: 'panorama', content: item.view.label }"
				:style="{ 
					'width': `${Math.round(item.data.percentage * 10**precision) / 10**precision}%`,
					'background-color': `#${item.view.colour}`
				}">
			</div>
		</div>
		<div class="labels">
			<div
				class="label"
				v-for="item in items" :key="item.data.id"
				:style="{
					'flex-grow': `${Math.floor(item.data.percentage)}`
				}">
				<div
					class="icon"
					:style="{
						'background-color': `#${item.view.colour}`		
					}">
				</div>
				<div class="details">
					<div class="label">{{item.view.label}}</div>
					<div class="description">{{item.view.description}}</div>
				</div>
			</div>
		</div>
	</div>	
</template>
<script lang="ts">
// Imports
import Vue, { PropOptions, PropType } from "vue";

// Models
import { BarItem, BarViewOptions } from "../modules/models/Bar";

export default Vue.extend({
	props: {
		items: <PropOptions<BarItem[]>> {
			type: Array
		},
		viewOptions: {
			type: Object as PropType<BarViewOptions>
		}
	},
	computed: {
		precision() : number {
			return this.viewOptions?.precision ?? 2;
		}
	},
	methods: {
		
	}
});
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.analysis-bar {
	display: flex;
	flex-direction: column;
	align-items: stretch;

	.bar, .labels {
		width: 100%;
		display: flex;
		flex-direction: row;
		align-items: stretch;
		justify-content: flex-start;
	}

	.bar {
		height: 40px;
		border-radius: 20px;
		background-color: $light-grey-blue;
		overflow: hidden;

		.segment {
			height: 100%;
			min-width: 2%;
			transition: width 1s;
			flex-shrink: 1;
		}
	}

	.labels {
		margin-top: 10px;
		/*justify-content: space-between;*/
		
		.label {
			display: flex;
			align-items: center;
			/*min-width: 90px;*/
			transition: width 1s;

			.icon {
				width: 6px;
				height: 6px;
				border-radius: 50%;
				background-color: $grey-blue;
				margin-left: 15px;
				margin-right: 15px;
				flex-shrink: 0;
			}

			.details {
				display: flex;
				flex-direction: column;
				align-items: flex-start;

				.label {
					font-size: 0.8em;
					font-weight: 600;
					color: $grey-blue;
				}

				.description {
					font-size: 0.7em;
					font-weight: 400;
					color: $light-grey-blue;
				}
			}

			flex-shrink: 1;
			overflow: hidden;
		}
	}

	
}
</style>