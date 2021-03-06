<template>
	<div class="app">
		<div class="backgrounds">
			<background-blobs/>
			<background-colour/>
			<div class="background fade"></div>
		</div>
		<transition :name="$store.state.loading ? 'zoom' : ''" mode="out-in">
			<div class="route" v-show="!$store.state.loading">
				<transition name="zoom" mode="out-in" tag="div">
					<router-view></router-view>
				</transition>
			</div>
		</transition>
		<transition name="zoom" mode="out-in" tag="div">
			<div class="page center" v-show="$store.state.loading">
				<spinner/>
			</div>
		</transition>
		<transition name="navbar">
			<navbar v-if="navbarVisible"/>
		</transition>
		<transition name="credits">
			<div class="credits no-select" v-show="$route.name == 'sign-in'">
				<p>
					<span>frannyfx &copy; {{currentYear}}</span>
					<span>&bull;</span>
					<a href="https://github.com/frannyfx" rel="noreferrer" target="_blank"><font-awesome-icon :icon="['fab', 'github']"/></a>
					<span>&bull;</span>
					<language-switcher/>
					<span>&bull;</span>
					<a href="/privacy-policy" target="_blank">{{ $t("general.privacyPolicy") }}</a>
				</p>
			</div>
		</transition>
		<notification-list/>
		<modal-list/>
	</div>
</template>
<script lang="ts">
// Imports
import Vue from "vue";

// Components
import Spinner from "../components/Spinner.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import Navbar from "../components/Navbar.vue";
import NotificationList from "../components/NotificationList.vue";
import ModalList from "../components/ModalList.vue";
import BackgroundBlobs from "../components/BackgroundBlobs.vue";
import BackgroundColour from "../components/BackgroundColour.vue";
import LanguageSwitcher from "../components/LanguageSwitcher.vue";

// Modules
import { loadLanguageAsync } from "../i18n";
import { performAuth } from "../modules/API";
import { Error, showError } from "../modules/Error";

export default Vue.extend({
	components: {
		Spinner,
		FontAwesomeIcon,
		Navbar,
		NotificationList,
		ModalList,
		BackgroundBlobs,
		BackgroundColour,
		LanguageSwitcher
	},
	computed: {
		navbarVisible() : boolean {
			return this.$route.name == "dashboard" || this.$route.name == "repo";
		}
	},
	watch: {
		$route(to, from) {
			// Do not overwrite specific route titles.
			if (to.name == from.name && to.params.locale == from.params.locale) return;

			this.setTitle();
		},
		"$i18n.locale"() {
			this.setTitle();
		}
	},
	data() {
		return {
			currentYear: new Date().getFullYear()
		};
	},
	methods: {
		showGenericError() {
			showError(Error.General);
			this.$router.replace({
				name: "error",
				params: {
					locale: this.$route.params.locale
				}
			});
		},
		setTitle() {
			// Change title depending on the route.
			document.title = this.$route.meta?.title ? this.$i18n.t(this.$route.meta.title).toString() : "Panorama";
		}
	},
	mounted: async function () {
		// Load locale.
		let locale = window.location.pathname.split("/")[1];
		await loadLanguageAsync(locale);

		// Perform initial authentication.
		await performAuth();

		// Add error event handler.
		window.addEventListener("unhandledrejection", () => this.showGenericError)
		window.addEventListener("error", () => this.showGenericError);
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

.background.fade {
	background: linear-gradient(to bottom, rgba($deep, 0), rgba($deep, 0.4));
}

.route {
	position: absolute;
	top: 0; left: 0;
	width: 100vw;
	height: 100%;

	&.zoom-leave-active {
		border-radius: 10px;
		overflow: hidden;
	}
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