<template>
	<div class="page center no-select">
		<div class="content error">
			<div class="icon"><font-awesome-icon icon="exclamation-circle"/></div>
			<h1 class="title">{{ $t(`errors.${errorName}.title`) }}</h1>
			<p class="description">{{ $t(`errors.${errorName}.description`) }}</p>
			<button @click="refresh" class="transparent blur">
				<font-awesome-icon icon="sync"/><span>{{ $t("routes.error.refresh") }}</span>
			</button>
		</div>
	</div>	
</template>
<script lang="ts">
// Imports
import Vue from "vue";

// Components
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { Error } from "../modules/Error";

export default Vue.extend({
	components: {
		FontAwesomeIcon
	},
	computed: {
		errorName() : string {
			// If this is a client-side error, return the store error.
			if (this.$route.name == "error") return this.$store.state.error.name;

			// If the URL error name is valid, return it.
			// @ts-ignore
			if (Object.values(Error).includes(this.$route.params.name)) return this.$route.params.name;

			// Return general error.
			return Error.General.toString();
		}
	},
	methods: {
		refresh() {
			window.location.href = `/${this.$i18n.locale}`;
		}
	},
	async beforeRouteEnter (to, from, next) {
		next(vm => vm.$store.commit("setLoading", false));
	}
})
</script>
<style lang="scss" scoped>
.error {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	.icon {
		font-size: 2.6em;
	}
	
	.title {
		margin-top: 0px;
		margin-bottom: 0px;
	}

	.description {
		font-size: 0.85em;
		margin: 5px 0px;
	}

	button {
		margin-top: 15px;
	}
}
</style>