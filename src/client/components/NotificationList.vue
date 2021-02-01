<template>
	<transition-group name="notification" tag="div" class="notifications" :class="{ shifted: hasNavbar }">
		<notification v-for="notification in $store.state.Notifications.list" :key="notification.id" :notification="notification"/>
	</transition-group>
</template>
<script lang="ts">
// Imports
import Vue from "vue";

// Components
import Notification from "./Notification.vue";

export default Vue.extend({
	components: {
		Notification
	},
	computed: {
		hasNavbar() {
			return this.$route.name == "dashboard";
		}
	}
})
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
$notifications-margin: 20px;

.notifications {
	position: absolute;
	top: $notifications-margin;
	right: $notifications-margin;
	bottom: $notifications-margin;
	margin-left: 10px;
	width: 350px;
	max-width: calc(100vw - #{$notifications-margin * 2});
	z-index: 400;
	pointer-events: none;
	
	display: flex;
	flex-direction: column;

	transition: top 1s;

	&.shifted {
		top: #{$navbar-height + $notifications-margin};
	}

	> :not(:last-child) {
		margin-bottom: 10px;
	}
}

/* Notification transition animations */
.notification-enter-active {
	transition: transform .5s .1s, opacity .5s .1s, max-height .5s, margin-bottom .5s;
}

.notification-leave-active {
	transition: transform .5s, opacity .5s, max-height .5s .2s, margin-bottom .5s .2s;
}

.notification-enter, .notification-leave-to {
	transform: translateX(380px);
	opacity: 0;
	max-height: 0px;
	margin-bottom: 0px !important;
}

.notification-enter-to, .notification-leave {
	max-height: 87px;
	margin-bottom: 10px;
}
</style>