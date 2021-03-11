<template>
	<div class="notification no-select" :class="{ 'dragging': down && deltaX != 0 }">
		<div class="notification-content" :style="{'transform': `translateX(${deltaX}px)`}" :class="{ 'elastic': !down, 'fading': notification.expiry.status == 'FADING' }"
			@mousedown="(e) => e.button == 0 ? dragstart(e.clientX) : null"
			@mousemove="(e) => drag(e.clientX)"
			@mouseup="(e) => dragend(e.clientX)"
			@mouseleave="(e) => { dragend(e.clientX); toggleExpiry(true) }"
			@touchstart="touchstart"
			@touchmove="touchmove"
			@touchend="touchend"
			@mouseenter="() => toggleExpiry(false)">
			<div class="icon">
				<font-awesome-icon :icon="notification.data.icon"/>
			</div>
			<div class="content">
				<div class="title" v-html="notification.data.title"></div>
				<div class="description">
					{{notification.data.description}}
					<div v-if="notification.data.type == 'PROGRESS'" class="progress-container">
						<div class="progress-bar">
							<div class="progress" :style="{ width: `${notification.data.progress.value * 100}%`}"></div>
						</div>
						<div class="progress-status">
							{{notification.data.progress.status}}
						</div>
					</div>
				</div>
			</div>
		</div>
		<div v-if="notification.data.dismissable" class="close-button" @click="remove">
			<font-awesome-icon icon="times"/>
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue, { PropType } from "vue";

// Components
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { Notification, removeNotification, toggleNotificationExpiry } from "../modules/Notifications";

// Constants
const MAX_RUBBER_DELTA = 80; // The maximum distance a user can drag the notification in the wrong direction.
const MIN_SWIPE_DELTA = 80; // The minimum distance a user needs to swipe the notification before it should be dismissed.

export default Vue.extend({
	components: {
		FontAwesomeIcon
	},
	data() {
		return {
			down: false,
			startX: 0,
			deltaX: 0
		};
	},
	methods: {
		remove() {
			removeNotification(this.notification);
		},
		dragstart(clientX: number) {
			this.down = true;
			this.startX = clientX;
		},
		drag(clientX : number) {
			if (!this.down) return;
			let deltaX = clientX - this.startX;
			
			// Rubber-banding to prevent from swiping the wrong way.
			if (deltaX < 0 || !this.notification.data.dismissable) {
				let rubberDeltaX = MAX_RUBBER_DELTA * (Math.pow(Math.E, (1 / MAX_RUBBER_DELTA) * Math.abs(deltaX) * -1) - 1);	
				this.deltaX = deltaX > 0 ? rubberDeltaX * -1 : rubberDeltaX;
			}
			else this.deltaX = deltaX;
		},
		dragend(clientX : number | undefined = undefined) {
			if (!this.down || !this.notification.data.dismissable) {
				this.down = false;
				this.startX = 0;
				this.deltaX = 0;
				return;
			}

			let deltaX = clientX ? clientX - this.startX : this.deltaX;
			if (deltaX > MIN_SWIPE_DELTA) this.remove();

			this.down = false;
			this.startX = 0;
			this.deltaX = 0;
		},
		touchstart(e: TouchEvent) {
			this.dragstart(e.touches[0].clientX);
		},
		touchmove(e: TouchEvent) {
			this.drag(e.touches[0].clientX);
		},
		touchend(e: TouchEvent) {
			this.dragend();
		},
		toggleExpiry(enabled: boolean) {
			if (!this.notification.data.expiry) return;
			toggleNotificationExpiry(this.notification, enabled);
		}
	},
	props: {
		notification: {
			type: Object as PropType<Notification>,
			required: true
		}
	}
})
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.notification-content {
	border-radius: 16px;
	background-color: rgba(white, .7);
	color: black;
	box-shadow: 0px 4px 15px rgba(black, .2);
	backdrop-filter: blur(10px) saturate(150%);
	-webkit-backdrop-filter: blur(10px) saturate(150%);

	width: 100%;
	height: 88px;
	box-sizing: border-box;
	padding: 20px 25px;

	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
	cursor: pointer;
	transition: opacity 2s;

	&.elastic {
		transition: transform .3s, opacity 2s;
	}

	&.fading {
		opacity: 0;
	}

	&:hover {
		transition: opacity .3s;

		&.elastic {
			transition: opacity .3s, transform .3s;
		}
	}

	> :not(:last-child) {
		margin-right: 10px;
	}

	> .icon {
		color: $blue;
		font-size: 1.7em;
		margin-right: 15px;
	}

	> .content {
		flex-grow: 1;
		
		.title {
			font-size: .85em;
			font-weight: 600;

			.repo-name {
				font-weight: 700;
			}
		}

		.description {
			font-size: .7em;
			font-weight: 400;

			.progress-container {
				margin-top: 6px;

				.progress-bar {
					width: 100%;
					height: 5px;
					border-radius: 5px;
					background-color: rgba($deep, .2);
					overflow: hidden;

					.progress {
						width: 75%;
						transition: width 1s;
						height: 100%;
						border-radius: 5px;
						background-color: $blue;
					}
				}

				.progress-status {
					margin-top: 3px;

					> svg {
						color: $blue;
					}
				}
			}
		}
	}
}

.notification {
	position: relative;
	pointer-events: all;
	
	.close-button {
		border-radius: 30px;
		width: 20px;
		height: 20px;
		position: absolute;
		top: -5px; right: -5px;
		background-color: rgba(white, .7);
		box-shadow: 0px 2px 10px rgba(black, .2);
		color: rgba(black, .6);
		font-size: 10px;
		backdrop-filter: blur(15px) saturate(150%);
		-webkit-backdrop-filter: blur(15px) saturate(150%);
		cursor: pointer;

		display: flex;
		align-items: center;
		justify-content: center;

		transition: opacity .3s, background-color .1s, color .1s, transform .3s;
		opacity: 0;

		&:hover {
			transform: scale(1.2);
		}

		&:active {
			transition: opacity .3s, background-color .1s, color .1s, transform .1s;
			color: rgba(white, .6);
			transform: scale(.95);
			background-color: rgba(black, .4);
		}
	}

	@include sm {
		.close-button {
			display: none;
		}
	}

	&:hover {
		&:not(.dragging) {
			.close-button {
				opacity: 1;
				transition: opacity .3s .5s, background-color .1s, color .1s, transform .3s;
			}
		}	
	}
}

</style>