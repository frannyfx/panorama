<template>
	<div class="modal-list">
		<transition name="fade">
			<div class="modal-backdrop" v-show="$store.state.Modals.list.length > 0" :class="{ hidden: $store.state.Modals.list.length == 0 }"></div>
		</transition>
		<transition-group name="modal" tag="div" class="modal-container">
			<modal v-for="(modal, index) in $store.state.Modals.list" :modal="modal" :first="index == 0" :key="modal.id"/>
		</transition-group>
	</div>
</template>
<script lang="ts">
// Imports
import Vue from "vue";

// Components
import Modal from "./Modal.vue";

// Modules
export default Vue.extend({
	components: {
		Modal
	}
})
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";

.modal-list {
	pointer-events: none;
	position: absolute;
	width: 100vw;
	height: 100vh;
	top: 0; right: 0; left: 0; bottom: 0;
	z-index: 800;

	.modal-backdrop {
		background-color: rgba($deep, 0.5);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		position: absolute;
		top: 0; right: 0; left: 0; bottom: 0;
		width: 100%;
		height: 100%;
		pointer-events: all;

		&.hidden {
			pointer-events: none;
		}
	}

	.modal-container {

	}
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
	transition: opacity .5s;
}

.fade-enter-active {
	transition-delay: .2s;
}

.fade-enter, .fade-leave-to {
	opacity: 0;
}

.fade-enter-to, .fade-leave {
	opacity: 1;
}

/* --- */
.modal-enter-active {
	transition: transform .3s, opacity .3s;
	transition-delay: .3s;
}

.modal-leave-active {
	transition: transform .3s, opacity .3s;
}

.modal-enter {
	transform: scale(1.2) translateZ(0) perspective(1px);
	opacity: 0;
}

.modal-enter-to, .modal-leave {
	transform: scale(1) translateZ(0) perspective(1px);
	opacity: 1;
}

.modal-leave-to {
	transform: scale(1.2) translateZ(0) perspective(1px);
	opacity: 0;
}
</style>