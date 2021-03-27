<template>
	<transition name="blobs">
		<div class="background blobs" v-show="!$store.state.loading && ($route.name == 'sign-in' || $route.name == 'error' || $route.name == 'named-error')" style="background-image: url('/img/blobs.svg')"></div>
	</transition>
</template>
<style lang="scss" scoped>
.background.blobs {
	background-size: cover;
	background-position: center;
}

.blobs-enter-active, .blobs-leave-active {
	transition: opacity 1s, transform 1s;
}

.blobs-enter, .blobs-leave-to {
	opacity: 0;
	transform: scale(2);
}
</style>