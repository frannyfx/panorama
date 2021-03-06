<template>
	<div class="navbar no-select">
		<div class="container nav-inner">
			<a @click="navigateToDashboard" class="title">
				<font-awesome-icon icon="eye"/>
			</a>
			<div class="nav-content">
				<a class="profile" rel="noreferrer" :href="`https://github.com/${$store.state.user.login}/`" target="_blank">
					<div class="profile-picture">
						<div class="image" :style="{'background-image': this.$store.state.user.avatarUrl != '' ? `url('${this.$store.state.user.avatarUrl}')` : ''}">
							<font-awesome-icon v-if="this.$store.state.user.avatarUrl == ''" icon="user"/>
						</div>
					</div>
					<span class="username hide-small">{{username}}</span>
				</a>
				<a class="nav-link" @click="signOut">
					<font-awesome-icon icon="sign-out-alt"/>
					{{ $t("components.navbar.signOut") }}
				</a>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue from "vue";

// Components
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { endSession } from "../modules/API";

export default Vue.extend({
	components: {
		FontAwesomeIcon
	},
	computed: {
		username() : string {
			if (this.$store.state.user.name != "") return this.$store.state.user.name;
			if (this.$store.state.user.login != "") return this.$store.state.user.login;
			return "Unknown";
		}	
	},
	methods: {
		navigateToDashboard() {
			if (this.$route.name != "dashboard") this.$router.replace({ name: "dashboard", params: { locale: this.$i18n.locale } });
		},
		signOut() {
			endSession();
			this.$router.replace({ name: "sign-in", params: { locale: this.$i18n.locale } });
		}
	}
})
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.navbar {
	/* Layout */
	width: 100%;
	height: $navbar-height;
	line-height: $navbar-height;
	position: absolute;
	top: 0; left: 0;
	z-index: 100;

	/* Appearance */
	background-color: $deep;
	color: white;

	.nav-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;

		.title {
			font-size: 1.2em;
		}

		.nav-content {
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 0.8em;

			color: rgba(white, 0.7);
			> * {
				transition: color 0.3s;
			}

			> *:hover {
				color: white;
			}

			> *:not(:last-child) {
				margin-right: 20px;
			}

			.nav-link {
				> svg {
					margin-right: 5px;
				}
			}
		}
	}
}

.profile {
	display: flex;
	align-items: center;
	
	.profile-picture {
		overflow: hidden;
		border-radius: 100px;
		width: 25px; height: 25px;
		background-color: white;
		border: 2px solid white;
		
		margin-right: 10px;
		@include sm {
			margin-right: 0px;
		}

		.image {
			width: 100%;
			height: 100%;
			background-size: cover;
			background-position: center;
			display: flex;
			align-items: flex-end;
			justify-content: center;

			svg {
				color: $deep;
				font-size: 1.6em;
			}
		}
	}

	.username {
		
	}
}

/* Animations */
.navbar-enter-active, .navbar-leave-active {
	transition: top .7s .1s, opacity .7s .1s;

	.title > svg {
		transition: opacity .4s .2s, margin-top .4s .2s;
	}

	.nav-inner > .nav-content > * {
		@for $i from 1 through 2 {
			&:nth-child(#{$i}) {
				transition: opacity .4s, margin-top .4s;
				transition-delay: #{$i * .2 + .2}s;
			}
		}
	}
}

.navbar-enter, .navbar-leave-to {
	top: #{-1 * $navbar-height};
	
	.title > svg, .nav-inner > .nav-content > * {
		margin-top: -10px;
		opacity: 0;
	}
}

.navbar-enter-to, .navbar-leave {
	top: 0;

	.title > svg, .nav-inner > .nav-content > * {
		margin-top: 0;
		opacity: 1;
	}
}
</style>