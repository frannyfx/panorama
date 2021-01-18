<template>
	<div @click="change" class="wrapper">
		<div class="container">
			<h1>Test</h1>
		</div>
	</div>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
	methods: {
		change() {
			this.$router.replace({name: "home"});
		}
	}
});
</script>
<style lang="scss" scoped>
h1 {
	color: white;
}

.wrapper {
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;

	.container {
		h1 {
			margin: 0; padding: 0;
		}
	}
}
</style>