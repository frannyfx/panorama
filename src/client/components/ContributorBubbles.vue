<template>
	<div class="bubbles-wrapper">
		<transition-group class="list" tag="div" name="contributor-bubble">
			<contributor-bubble v-for="login in processedList" :key="login" :login="login"/>
			<contributor-bubble v-show="numOthers != 0" key="_limited" login="" :num-others="numOthers"/> 
		</transition-group>
	</div>
</template>
<script lang="ts">
// Imports
import Vue, { PropOptions } from 'vue'

// Components
import ContributorBubble from "./ContributorBubble.vue";

export default Vue.extend({
	components: {
		ContributorBubble
	},
	props: {
		contributorList: <PropOptions<string[]>> {
			type: Array,
			required: true
		},
		maxItems: {
			type: Number,
			required: false,
			default: -1
		}
	},
	computed: {
		processedList() : string[] {
			// No limit, display all contributors. Add 1 to the number of max items since we don't want "1 other".
			if (this.maxItems == -1 || this.contributorList.length <= this.maxItems + 1) return this.contributorList;
			return this.contributorList.slice(0, this.maxItems);
		},
		numOthers() : number {
			return this.maxItems == -1 || this.contributorList.length <= this.maxItems + 1 ? 0 : this.contributorList.length - this.maxItems;
		}
	}
});
</script>
<style lang="scss" scoped>
.list {
	display: flex;
	align-items: center;
	flex-direction: row;
	justify-content: center;
	flex-wrap: wrap;
	width: 100%;

	> * {
		margin: 5px;
	}
}

/* Transitions */
.contributor-bubble-enter-active, .contributor-bubble-leave-active {
	transition: all .8s;

	&.contributor-bubble-enter, &.contributor-bubble-leave-to {
		width: 0px;
		height: 0px;
		box-shadow: 0px 0px 0px rgba(black, 0);
		margin: 0px !important;
		border-width: 0px !important;
		opacity: 0;
	}
}

.contributor-bubble-move {
	transition: transform .8s, width .3s;
}
</style>