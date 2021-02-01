<template>
	<div class="notification no-select" :class="{ 'dragging': down && deltaX != 0 }">
		<div class="notification-content" :style="{'transform': `translateX(${deltaX}px)`}" :class="{ 'elastic': !down }"
			@mousedown="(e) => dragstart(e.clientX)"
			@mousemove="(e) => drag(e.clientX)"
			@mouseup="(e) => dragend(e.clientX)"
			@mouseleave="(e) => dragend(e.clientX)"
			@touchstart="touchstart"
			@touchmove="touchmove"
			@touchend="touchend">
			<div class="icon">
				<font-awesome-icon :icon="notification.data.icon"/>
			</div>
			<!--
			<div class="content">
				<div class="title">Analysing repo <span class="repo-name">frannyfx/ether...</span></div>
				<div class="description">
					<div class="progress-bar">
						<div class="progress"></div>
					</div>
					<div class="progress-status">
						<font-awesome-icon icon="check-circle"/>
						Cloning repo...
					</div>
				</div>
			</div>-->
			<div class="content">
				<div class="title">{{notification.data.title}}</div>
				<div class="description">
					{{notification.data.description}}
				</div>
			</div>
		</div>
		<div class="close-button" @click="remove">
			<font-awesome-icon icon="times"/>
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue, { PropType } from "vue";

// Components
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { Notification, removeNotification } from "../modules/Notifications";

// Constants
const MAX_NEGATIVE_DELTA = 80; // The maximum distance a user can drag the notification in the wrong direction.
const MIN_SWIPE_DELTA = 80;

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
			if (deltaX < 0) this.deltaX = MAX_NEGATIVE_DELTA * (Math.pow(Math.E, (1 / MAX_NEGATIVE_DELTA) * deltaX) - 1);
			else this.deltaX = deltaX;
		},
		dragend(clientX : number | undefined = undefined) {
			if (!this.down) return;

			let deltaX = clientX ? clientX - this.startX : this.deltaX;
			if (deltaX > MIN_SWIPE_DELTA) {
				console.log("Removing notification", this.notification.id);
				this.remove();
			}

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
	box-shadow: 0px 2px 10px rgba(black, .2);
	backdrop-filter: blur(10px) saturate(150%);
	-webkit-backdrop-filter: blur(10px) saturate(150%);

	width: 100%;
	height: auto;
	box-sizing: border-box;
	padding: 20px;

	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
	cursor: pointer;

	&.elastic {
		transition: transform .3s;
	}

	> :not(:last-child) {
		margin-right: 10px;
	}

	> .icon {
		color: $blue;
		font-size: 1.7em;
		padding: 0px 5px;
	}

	> .content {
		flex-grow: 1;
		height: 100%;
		
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

			/*
			.progress-status {
				margin-top: 3px;

				> svg {
					color: $blue;
				}
			}*/
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
		backdrop-filter: blur(5px) saturate(150%);
		-webkit-backdrop-filter: blur(5px) saturate(150%);
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
			background-color: rgba(black, .7);
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