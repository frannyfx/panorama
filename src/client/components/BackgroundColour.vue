<template>
	<transition name="colour">
		<div class="background" v-show="$route.name != 'sign-in' && $route.name != 'error'"></div>
	</transition>
</template>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.background {
	background-color: $deep;
}

.colour-enter-active, .colour-leave-active {
	transition: opacity 1s;
}

.colour-enter, .colour-leave-to {
	opacity: 0;
}
</style>