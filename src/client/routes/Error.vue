<template>
	<div class="page center no-select">
		<div class="content error">
			<div class="icon"><font-awesome-icon icon="exclamation-circle"/></div>
			<h1 class="title">{{ $t(`errors.${$store.state.error.name}.title`) }}</h1>
			<p class="description">{{ $t(`errors.${$store.state.error.name}.description`) }}</p>
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
export default Vue.extend({
	components: {
		FontAwesomeIcon
	},
	methods: {
		refresh() {
			window.location.href = `/${this.$i18n.locale}`;
		}
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
		font-size: 3em;
	}
	
	.title {
		margin-top: 10px;
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