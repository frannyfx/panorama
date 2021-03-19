<template>
	<div class="footer no-select">
		<div class="line"></div>
		<font-awesome-icon icon="eye"/>
		<div class="line"></div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue from "vue"

// Components
import { FontAwesomeIcon }  from "@fortawesome/vue-fontawesome";
export default Vue.extend({
	components: {
		FontAwesomeIcon
	}
})
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.footer {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px 20px;
	box-sizing: border-box;

	.line {
		background-color: $white-blue;
		height: 1px;
		flex-grow: 1;
	}
	
	svg {
		color: $light-grey-blue;
		font-size: 1.4em;
	}

	> :not(:last-child) {
		margin-right: 20px;
	}
}
</style>