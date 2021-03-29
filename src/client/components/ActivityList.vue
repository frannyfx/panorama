<template>
	<scroller>
		<div class="activities">
			<activity v-for="(activity, index) in activityList" :key="index" :activity="$store.state.Activity.map[activity]" :loaded="loaded && $store.state.Activity.map[activity] != null"/>
		</div>
	</scroller>
</template>
<script lang="ts">
// Imports
import Vue from "vue";

// Modules
import config from "../config";

// Components
import Scroller from "./Scroller.vue";
import Activity from "./Activity.vue";

export default Vue.extend({
	components: {
		Scroller,
		Activity
	},
	props: {
		fetching: {
			type: Boolean,
			default: true
		}
	},
	data() {
		return {
			activityList: [] as string[],
			loaded: false,
			timeout: null as NodeJS.Timeout | null
		};
	},
	watch: {
		"$store.state.Activity.list"(list: string[]) {
			// Set loaded to false if there are no elements.
			if (list.length == 0) this.loaded = false;

			// Clear the current timeout and set a new one to update the list.
			if (this.timeout) clearTimeout(this.timeout);
			this.timeout = setTimeout(() => this.updateList(), config.activity.fetchingDelay);
		}
	},
	methods: {
		updateList() {
			// Ensure the activity list always has at least 3 elements.
			this.activityList = [...this.$store.state.Activity.list, "0", "1", "2"].slice(0, 3);
			this.loaded = true;
		}
	},
	mounted() {
		// Update the list.
		this.updateList();
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