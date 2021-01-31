<template>
	<div class="page center"><h1>Test</h1></div>
</template>
<script lang="ts">
import Vue from 'vue'
import { sleep } from '../../shared/utils';
export default Vue.extend({
	async beforeRouteEnter(to, from, next) {
		await sleep(500);
		
		next(vm => {
			vm.$store.commit("setLoading", false);
		});
	}
});
</script>