<template>
	<div class="file-percentage">
		<div class="progress-bar">
			<div class="progress"></div>
			<div class="progress"></div>
			<div class="progress"></div>
		</div>
		<div class="contributors">
			<div class="contributor">
				<div class="contributor-image">
					<div class="image"></div>
				</div>
				<div class="details">

				</div>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
	
})
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.file-percentage {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 200px;

	.progress-bar {
		width: 100%;
		height: 6px;
		border-radius: 10px;
		background-color: rgba($deep, .2);
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: flex-start;

		> :last-child {
			flex-grow: 1;
		}

		.progress {
			height: 100%;
			box-sizing: border-box;

			&:not(:last-child) {
				border-right: 2px white solid;
			}

			&:nth-child(1) {
				width: 60%;
				background-color: $blue;
			}

			&:nth-child(2) {
				width: 30%;
				background-color: $red;
			}

			&:nth-child(3) {
				width: 10%;
				background-color: $deep;
			}
		}
	}
}
</style>