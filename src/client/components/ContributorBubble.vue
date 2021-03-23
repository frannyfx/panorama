<template>
	<div 
		class="contributor"
		:class="{ small, anonymous: isAnonymous }" 
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
		},
		small: {
			type: Boolean,
			required: false,
			default: false
		}
	}	
});
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.contributor {
	width: 40px;
	height: 40px;
	border: 3px solid white;
	box-shadow: 0px 0px 15px rgba(black, 0.2);
	border-radius: 50%;
	overflow: hidden;
	transition: transform .3s;

	&.small {
		width: 20px;
		height: 20px;
		border: none;

		&.anonymous {
			.contributor-image {
				font-size: 0.7em;
			}
		}
	}

	&:hover {
		transform: scale(1.4);
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

	&:not(:last-child) {
		margin-right: 10px;
	}
}
</style>