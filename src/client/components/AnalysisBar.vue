<template>
	<div class="analysis-bar" :class="{ 'to-scale': toScale }">
		<transition-group class="bar" tag="div" name="segment" @before-enter="beforeSegmentEnter" @enter="segmentEnter">
			<div 
				class="segment" 
				:class="{ other: item.view.other }"
				v-for="(item, index) in processedItems" :key="item.data.id"
				v-tooltip="{ theme: 'panorama', content: item.view.label }"
				:data-index="index"
				:style="{ 
					'width': getItemSegmentWidth(item),
					'background-color': `#${item.view.colour}`
				}">
			</div>
		</transition-group>
		<transition-group class="labels" tag="div" name="label" @before-leave="beforeLabelLeave">
			<div
				class="label"
				v-for="item in processedItems" :key="item.data.id"
				:style="{
					'flex-grow': `${Math.floor(item.data.percentage)}`
				}">
				<div
					class="dot-indicator"
					:style="{
						'background-color': `#${item.view.colour}`		
					}">
				</div>
				<div class="details">
					<div class="title">{{item.view.label}}</div>
					<div class="description">{{descriptionKey ? $tc(descriptionKey, item.data.value, [item.data.value]) : item.description}}</div>
				</div>
			</div>
		</transition-group>
	</div>	
</template>
<script lang="ts">
// Imports
import Vue, { PropOptions, PropType } from "vue";

// Models
import { BarItem } from "../modules/models/Bar";

export default Vue.extend({
	props: {
		items: <PropOptions<BarItem[]>> {
			type: Array
		},
		precision: {
			type: Number,
			required: false,
			default: 2
		},
		toScale: {
			type: Boolean,
			required: false,
			default: false
		},
		descriptionKey: {
			type: String,
			required: false,
			default: false
		},
		othersKey: {
			type: String,
			required: false
		},
		maxItems: {
			type: Number,
			required: false,
			default: -1
		}
	},
	computed: {
		processedItems() : BarItem[] {
			// No limit, display all the items. Add 1 to the number of max items since we don't want "1 other".
			if (this.maxItems == -1 || this.items.length <= this.maxItems + 1) return this.items;

			// Get all the items that will remain untouched.
			let items = this.items.slice(0, this.maxItems);

			// Create "other" bar item.
			let others = this.items.slice(this.maxItems).reduce((previous: BarItem, current: BarItem) => {
				previous.data.value += current.data.value;
				previous.data.percentage += current.data.percentage;
				return previous;
			}, {
				data: {
					id: "Others",
					percentage: 0,
					value: 0
				},
				view: {
					label: this.$i18n.tc(this.othersKey ?? "components.analysisBar.others", this.items.length - this.maxItems, [this.items.length - this.maxItems]),
					other: true
				}
			});

			// Return the limited list of items.
			return [...items, others];
		}
	},
	methods: {
		getItemSegmentWidth(item: BarItem) : string {
			return `${Math.round(item.data.percentage * 10**this.precision) / 10**this.precision}%`;
		},
		beforeSegmentEnter(el: any) {
			el.style.width = "0%";
		},
		segmentEnter(el: HTMLElement) {
			// @ts-ignore
			let itemData = this.items[el.dataset.index];
			setTimeout(() => el.style.width = this.getItemSegmentWidth(itemData), 16);
		},
		beforeLabelLeave(el: HTMLElement) {
			let rect = el.getBoundingClientRect();
			el.style.maxWidth = `${rect.width}px`;
		}
	}
});
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.analysis-bar {
	display: flex;
	flex-direction: column;
	align-items: stretch;

	&.to-scale .bar .segment {
		min-width: 0%;
	}

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
		position: relative;

		.segment {
			height: 100%;
			min-width: 2%;
			transition: width 1s, min-width 1s;
			flex-shrink: 1;

			&.other {
				background-color: $grey-blue;
			}

			&:last-child {
				flex-grow: 1;
			}
		}
	}

	.labels {
		margin-top: 15px;
		align-items: center;

		@include sm {
			height: auto !important;
			justify-content: center;
			flex-wrap: wrap;

			> .label {
				flex-grow: 0 !important;
				margin: 10px;

				.dot-indicator {
					margin-left: 0px !important;
				}
			}
		}
		
		.label {
			display: flex;
			align-items: center;
			transition: flex-grow 1s;
			max-height: 33px;

			.dot-indicator {
				margin: 0px 15px;
			}

			.details {
				display: flex;
				flex-direction: column;
				align-items: flex-start;

				.title {
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
			height: 100%;
		}
	}	
}

/* Transitions */
.segment-enter-active, .segment-leave-active {
	transition: width 1s, min-width 1s !important;
	&.segment-enter, &.segment-leave-to {
		min-width: 0% !important;
	}

	&.segment-leave-to {
		width: 0% !important;
	}
}

.segment-move {
	transition: width 1s, min-width 1s, transform 1s !important
}

/* --- */
.label-enter-active, .label-leave-active {
	transition: flex-grow 1s, opacity 1s, max-width 1s, transform 1s !important;
	&.label-enter, &.label-leave-to {
		flex-grow: 0 !important;
		max-width: 0px !important;
		opacity: 0 !important;
		transform: scale(0);
	}
}

.label-move {
	transition: flex-grow 1s, opacity 1s, max-width 1s, transform 1s !important;
}
</style>