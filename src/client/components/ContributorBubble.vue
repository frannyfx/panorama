<template>
	<div 
		class="contributor"
		:class="{ anonymous: isAnonymous }" 
		v-tooltip="{ theme: 'panorama', content: isAnonymous ? $t('components.contributorBubble.anonymous') : login }">
		<div class="contributor-image" :style="{ 'background-image': !isAnonymous ? `url('${$store.state.Users.object[login].avatarUrl}')` : undefined }">
			<font-awesome-icon v-if="isAnonymous" icon="question"/>
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue from "vue";

// Components
import { FontAwesomeIcon }  from "@fortawesome/vue-fontawesome";
export default Vue.extend({
	components: {
		FontAwesomeIcon
	},
	computed: {
		isAnonymous() : boolean {
			return this.login == "Anonymous" && this.$store.state.Users.object[this.login].id == -1;
		}
	},
	props: {
		login: {
			type: String,
			required: true
		}
	}	
});
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.contributor {
	width: 50px;
	height: 50px;
	box-sizing: border-box;
	border-radius: 50%;
	overflow: hidden;
	transition: transform .3s, -webkit-transform .3s, -moz-transform .3s, width .3s, height .3s;

	&:hover {
		transform: translate3d(0, 0, 0) scale(1.2);
		-moz-transform: translate3d(0, 0, 0) scale(1.2);
		-webkit-transform: translate3d(0, 0, 0) scale(1.2);
	}
	
	.contributor-image {
		width: 100%;
		height: 100%;
		background-size: cover;
		background-position: center;
	}

	&.anonymous {
		.contributor-image {
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: $blue;
			color: white;
		}
	}
}
</style>