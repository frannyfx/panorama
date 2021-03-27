<template>
	<div class="panel-wrapper" :class="{ hide: !shouldShow }">
		<div class="panel">
			<div class="margin"></div>
			<slot/>
			<div class="margin"></div>
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue from "vue";
import smoothReflow from "vue-smooth-reflow";

// Components
import SmoothHeight from "./SmoothHeight.vue";

export default Vue.extend({
	components: {
		SmoothHeight
	},
	mixins: [smoothReflow],
	props: {
		tag: {
			type: String,
			default: "div"
		},
		show: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			shouldShow: false,
			shouldUpdate: false
		};
	},
	watch: {
		show(to: boolean) {
			if (this.shouldUpdate) this.shouldShow = to;
		}
	},
	mounted() {
		// Reflow the content smoothly.
		this.$smoothReflow!({
			property: ["height"],
			transition: "height 1s"
		});

		// Delay initial display to prevent reflow issues.
		setTimeout(() => {
			this.shouldShow = this.show;
			this.shouldUpdate = true;	
		}, 700);
	}
});
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.panel-wrapper {
	.panel {
		display: flex;
		flex-direction: column;
		background-color: white;
		padding: 0px 40px;
		overflow: hidden;
		border-top: 1px solid $grey-tinted;
		transition: border-top-color 1s;

		.margin {
			height: 30px;
			flex-grow: 0;
			flex-shrink: 0;
		}
	}

	.panel-content {
		transition: opacity 1s;
	}

	&.hide {
		height: 0px;
		pointer-events: none;

		.panel-content {
			opacity: 0;
		}

		.panel {
			border-top-color: rgba($grey-tinted, 0);
		}
	}
}
</style>