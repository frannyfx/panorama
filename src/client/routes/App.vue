<template>
	<div class="app">
		<div class="backgrounds">
			<commit-canvas/>
			<div class="background fade"></div>
		</div>
		<transition name="zoom" mode="out-in" tag="div">
			<router-view class="foreground" v-show="!$store.state.loading"></router-view>
		</transition>
		<transition name="zoom" mode="out-in" tag="div">
			<div class="loader foreground" v-show="$store.state.loading">
				<spinner/>
			</div>
		</transition>
		<transition name="credits">
			<div class="credits" v-show="$route.name == 'login' && !$store.state.loading">
				<p>
					<span>frannyfx &copy; 2021</span>
					<span>&bull;</span>
					<a href="https://github.com/frannyfx" target="_blank"><font-awesome-icon :icon="['fab', 'github']"/></a>
					<span>&bull;</span>
					<a href="/privacy-policy">Privacy Policy</a>
				</p>
			</div>
		</transition>
	</div>
</template>
<script lang="ts">
// Imports
import Vue from "vue";

// Components
import Spinner from "../components/Spinner.vue";
import CommitCanvas from "../components/CommitCanvas.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

export default Vue.extend({
	components: {
		Spinner,
		CommitCanvas,
		FontAwesomeIcon
	}
})
</script>
<style lang="scss">
@import "../stylesheets/globals.scss";
</style>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.app {
	width: 100%;
	height: 100%;
}

.loader {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.background.fade {
	background: linear-gradient(to bottom, rgba($blue, 0), rgba($blue, 0.4));
}

.foreground {
	position: absolute;
	top: 0; left: 0;
	width: 100%; height: 100%;
}

.credits {
	position: absolute;
	left: 0; right: 0; bottom: 0;
	text-align: center;
	font-size: 0.7em;
	z-index: 10;

	> p {
		color: rgba(white, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;

		a {
			transition: color 0.3s;
			&:hover {
				color: white;
			}
		}

		svg {
			font-size: 1.4em;
		}

		> *:not(:last-child) {
			margin-right: 5px;
		}
	}
}
</style>