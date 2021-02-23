<template>
	<div class="file" :class="{ 'first': index == 0 }">
		<span>File</span>
	</div>
</template>
<script lang="ts">
// Imports
import Vue, { PropType } from "vue";
const moment = () => import("moment");

// Components
import { FontAwesomeIcon }  from "@fortawesome/vue-fontawesome";

export default Vue.extend({
	components: {
		FontAwesomeIcon
	},
	data() {
		return {
			updatedAt: ""
		};
	},
	props: {
		index: {
			type: Number,
			required: true,
			default: -1
		}
	},
	mounted: async function () {

	}
});
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.repo {
	display: flex;
	align-items: center;
	justify-content: flex-start;

	box-sizing: border-box;
	padding: 10px 0px;
	height: 50px;

	cursor: pointer;
	border-top: 1px solid rgba(black, .1);
	
	&.first {
		border-top: none !important;
	}
	
	transition: background-color 0.3s;

	&:hover {
		background-color: rgba($blue, .05);
	}

	> :first-child {
		margin-left: 30px;
	}

	> :last-child {
		margin-right: 30px;
	}

	> *:not(:last-child) {
		margin-right: 30px;
	}
}
</style>