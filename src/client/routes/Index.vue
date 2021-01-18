<template>
	<div @click="change" class="wrapper">
		<div class="container">
			<h1>Panorama</h1>
		</div>
	</div>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
	methods: {
		change() {
			this.$router.replace({name: "test"});
		}
	}
});
</script>
<style lang="scss">
/* Global styles */
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap');
html, body, #app {
	margin: 0; padding: 0;
	background-color: #222;
	font-family: 'Open Sans', sans-serif;
	width: 100vw; height: 100vh;
}

/* Transitions */
.zoom-enter-active, .zoom-leave-active {
	transition: transform 0.5s, opacity 0.5s;
}

.zoom-enter {
	opacity: 0;
	transform: scale(2);
}

.zoom-enter-to, .zoom-leave-from {
	opacity: 1;
	transform: scale(1);
}

.zoom-leave-to {
	opacity: 0;
	transform: scale(0.5);
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
	cursor: pointer;

	.container {
		h1 {
			margin: 0; padding: 0;
		}
	}
}
</style>