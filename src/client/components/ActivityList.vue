<template>
	<scroller>
		<div class="activities">
			<activity :activity="$store.state.Activity.list[0] || null"/>
			<activity :activity="$store.state.Activity.list[1] || null"/>
			<activity :activity="$store.state.Activity.list[2] || null"/>
		</div>
	</scroller>
</template>
<script lang="ts">
// Imports
import Vue from "vue";

// Components
import Scroller from "./Scroller.vue";
import Activity from "./Activity.vue";

export default Vue.extend({
	components: {
		Scroller,
		Activity
	}
});
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.activities {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;

	> * {
		flex-shrink: 0;

		&:not(:last-child) {
			margin-right: 20px;
		}
	}
}
</style>