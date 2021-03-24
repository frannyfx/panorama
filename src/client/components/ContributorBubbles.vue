<template>
	<div class="bubbles-wrapper">
		<transition-group class="list" tag="div" name="contributor-bubble">
			<contributor-bubble v-for="login in contributorList" :key="login" :login="login"/>
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