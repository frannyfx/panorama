<template>
	<component :is="tag">
		<slot/>
	</component>	
</template>
<script lang="ts">
import Vue from "vue";
import smoothReflow from "vue-smooth-reflow";

export default Vue.extend({
	mixins: [smoothReflow],
	props: {
		tag: {
			type: String,
			default: "div"
		}
	},
	mounted() {
		this.$smoothReflow!({
			property: ["height"],
			transition: "height 1s"
		});
	}
});
</script>