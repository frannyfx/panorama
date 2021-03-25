<template>
	<div class="scroller-wrapper" ref="scrollWrapper" :class="{ 'scroll-left': scrollLeft, 'scroll-right': scrollRight}">
		<div class="scroller-content" ref="scrollContent" @scroll="scroll">
			<slot/>
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue from "vue";
export default Vue.extend({
	computed: {
		scrollLeft() : boolean {
			return this.scrollX > 0;
		},
		scrollRight() : boolean {
			return this.containerWidth == 0 || this.scrollWidth - this.scrollX != this.containerWidth;
		}
	},
	data() {
		return {
			scrollX: 0,
			containerWidth: 0,
			scrollWidth: 0
		};
	},
	methods: {
		scroll(e: MouseEvent) {
			this.updateValues();
		},
		updateValues() {
			// @ts-ignore
			this.containerWidth = this.$refs.scrollContent.clientWidth;

			// @ts-ignore
			this.scrollWidth = this.$refs.scrollContent.scrollWidth;

			// @ts-ignore
			this.scrollX = this.$refs.scrollContent.scrollLeft;
		}
	},
	mounted() {
		// Wait a tick and update the values once the scroller has been drawn.
		setTimeout(() => this.updateValues(), 0);

		// On resize update values.
		window.addEventListener("resize", () => this.updateValues());
	}
});
</script>
<style lang="scss" scoped>
.scroller-wrapper {
	width: 100%;
	margin: 20px 0px;
	position: relative;
	display: flex;

	/* Hide scrollbar */
	-ms-overflow-style: none;
	scrollbar-width: none; 
	::-webkit-scrollbar {
		display: none;
	}

	&.scroll-left {
		&:before {
			opacity: 1;
		}
	}

	&.scroll-right {
		&:after {
			opacity: 1;
		}
	}

	&:before, &:after {
		content: '';
		position: absolute;
		height: 100%;
		width: 50px;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.1s;
	}

	&:before {
		left: 0;
		background: linear-gradient(to left, transparent, white);
	}

	&:after {
		right: 0;
		background: linear-gradient(to right, transparent, white);
	}

	.scroller-content {
		overflow-x: auto;
	}
}
</style>