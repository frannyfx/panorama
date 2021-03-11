<template>
	<div class="modal-wrapper">
		<transition name="modal-internal">
			<div class="modal" v-show="first">
				<div class="modal-content" :class="{ destructive: modal.data.theme == 'DESTRUCTIVE' }">
					<span class="icon"><font-awesome-icon :icon="modal.data.icon"/></span>
					<h2 class="title" v-html="modal.data.title"></h2>
					<p class="description" v-html="modal.data.description"></p>
					<div class="actions">
						<button class="button" :class="{ 'primary': action.type == 'PRIMARY', 'normal' : action.type == 'NORMAL' }" v-for="action in modal.data.actions" :key="action.id" @click="() => action.handler(modal)">
							<font-awesome-icon v-if="action.icon != undefined" :icon="action.icon"/> 
							{{action.content()}}
						</button>
					</div>
				</div>
			</div>
		</transition>
	</div>	
</template>
<script lang="ts">
// Imports
import Vue, { PropType } from "vue";

// Components
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// Modules
import { Modal } from "../modules/Modal";

export default Vue.extend({
	components: {
		FontAwesomeIcon
	},
	props: {
		modal: {
			type: Object as PropType<Modal>,
			required: true	
		},
		first: {
			type: Boolean,
			required: true
		}
	}
})
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.modal-wrapper {
	position: absolute;
	top: 0; left: 0; right: 0; bottom: 0;

	.modal {
		position: absolute;
		top: 0; left: 0; right: 0; bottom: 0;
	}

	.modal-content {
		pointer-events: all;
		background-color: white;
		padding: 40px 50px;
		box-sizing: border-box;
		color: black;
		z-index: 801;

		position: absolute;
		top: 50%;
		left: 50%;
		transform: translateX(-50%) translateY(-50%);
		max-width: 500px;

		border-radius: 10px;
		text-align: center;
		box-shadow: 0 22px 70px 4px rgba(0, 0, 0, 0.3);

		> .icon {
			font-size: 2em;
			color: $blue;
		}

		> .title {
			color: $blue;
			margin: 0;
			font-weight: 400;
		}

		> .description {
			font-size: .8em;
		}

		> .actions {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-wrap: wrap;
			
			> * {
				margin: 5px;
			}
		}

		/* Themes */
		&.destructive {
			> .icon {
				color: $red;
			}

			> .title {
				color: $red;
			}

			> .actions {
				> .primary {
					background-color: $red;
				}

				> .normal {
					background-color: $grey-red;
				}
			}
		}
	}
}

/* Transition used when a modal is overshadowed by a new modal. */
.modal-internal-enter-active, .modal-internal-leave-active {
	transition: opacity .3s, transform .3s;
}

.modal-internal-enter-active  {
	transition-delay: .3s;
}

.modal-internal-enter, .modal-internal-leave-to {
	transform: scale(0.8) translateZ(0) perspective(1px);
	opacity: 0;
}

.modal-internal-enter-to, .modal-internal-leave {
	transform: scale(1) translateZ(0) perspective(1px);
	opacity: 1;
}
</style>