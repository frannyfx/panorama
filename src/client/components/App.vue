<template>
	<div class="wrapper">
		<div class="container">
			<h1>Panorama</h1>
		</div>
	</div>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
	
});
</script>
<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap');
html, body {
	margin: 0; padding: 0;
	background-color: #222;
	font-family: 'Open Sans', sans-serif;
	width: 100vw; height: 100vh;
}
</style>
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

	.container {
		h1 {
			margin: 0; padding: 0;
		}
	}
}
</style>