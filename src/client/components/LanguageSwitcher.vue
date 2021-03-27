<template>
	<div class="language-switcher">
		<span class="switcher" ref="switcher" @click="toggleList">{{ $t("general.locale") }}</span>
		<transition name="language-list">
			<div class="language-list" v-show="showList">
				<div class="language" @click="() => switchLanguage('en')">🇬🇧</div>
				<div class="language" @click="() => switchLanguage('es')">🇪🇸</div>
				<div class="language" @click="() => switchLanguage('it')">🇮🇹</div>
			</div>
		</transition>
	</div>
</template>
<script lang="ts">
// Imports
import Vue from "vue";
import { loadLanguageAsync } from "../i18n";

export default Vue.extend({
	data() {
		return {
			showList: false,
		};
	},
	methods: {
		async toggleList() {
			this.showList = !this.showList;
		},
		async switchLanguage(locale: string) {
			// Get the params and switch the locale.
			let { ...params } = this.$route.params;
			params.locale = locale;

			// Load the locale asynchronously.
			await loadLanguageAsync(locale);

			// Replace the current route.
			this.$router.replace({
				name: this.$route.name ?? undefined,
				params: params,
				query: this.$route.query
			});
		}
	},
	mounted() {
		// If the user clicks anywhere, the list should close.
		document.addEventListener("click", (e) => {
			if (e.target != this.$refs.switcher) this.showList = false	
		});
	}
});
</script>
<style lang="scss" scoped>
.language-switcher {
	position: relative;
	.switcher {
		cursor: pointer;
		transition: color 0.3s;
		&:hover {
			color: white;
		}
	}

	.language-list {
		position: absolute;
		bottom: 30px;
		padding: 15px 20px;
		background-color: rgba(black, .4);
		box-shadow: 0px 4px 15px rgba(black, .2);
		font-size: 2em;
		border-radius: 16px;
		left: 50%;
		transform: translateX(-50%);
		backdrop-filter: blur(5px) saturate(150%);
		-webkit-backdrop-filter: blur(5px) saturate(150%);

		transition: opacity .5s, bottom .5s;

		display: flex;
		flex-direction: row;

		.language {
			cursor: pointer;
			transition: transform .3s;
			color: white;

			&:hover {
				transform: scale(1.2);
			}

			&:not(:last-child) {
				margin-right: 15px;
			}
		}
	}
}

.language-list-enter-active, .language-list-leave-active {
	&.language-list-enter, &.language-list-leave-to {
		opacity: 0;
		bottom: 0px;
	}
}
</style>