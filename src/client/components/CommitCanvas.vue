<template>
	<div class="background">
		<canvas :class="{ visible: shouldDraw }" id="commitCanvas"></canvas>
	</div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Method } from '../../shared/Method';
import { send } from '../modules/API';

// Particle class
class Particle {
	// Particle params.
	size : number;
	text : string;
	x : number;
	y : number;
	speed : number;
	desiredSpeed : number;
	calculatedSize: TextMetrics;

	constructor(size : number, text : string, x : number, y : number, speed : number, context: CanvasRenderingContext2D, maxFontSize : number) {
		this.size = size;
		this.text = text;
		this.x = x;
		this.y = y;
		this.speed = this.desiredSpeed = speed;

		context.font = `${Math.floor(maxFontSize * this.size * window.devicePixelRatio)}px Open Sans`;
		this.calculatedSize = context.measureText(text);
	}

	isVisible() {
		return this.x + this.calculatedSize.width > -200;
	}

	flush(speed : number) {
		this.desiredSpeed = speed;
	}
}

export default Vue.extend({
	data() {
		return {
			canvas: null as HTMLCanvasElement | null,
			context: null as CanvasRenderingContext2D | null,
			lastTs: undefined as number | undefined,
			particleTexts: [] as Array<string>,
			particles: [] as Array<Particle>,
			count: 13,
			speed: 0.2,
			maxFontSize: 40,
			maxAlpha: 0.3,
			shouldDraw: true,
			visibilitySwitchTimeout: null as NodeJS.Timeout | null
		};
	},
	computed: {
		visible() : boolean {
			return this.$route.name == "sign-in" || this.$store.state.loading;
		}
	},
	watch: {
		visible(newValue : boolean) {
			// Clear previous timeouts.
			if (this.visibilitySwitchTimeout)
				clearTimeout(this.visibilitySwitchTimeout);

			// Delay stopping drawing so the canvas is hidden.
			this.visibilitySwitchTimeout = setTimeout(() => {
				console.log(`Commit canvas is ${newValue ? '' : 'not '}visible.`);
				this.shouldDraw = newValue;
				if (this.shouldDraw) {
					this.lastTs = undefined;
					requestAnimationFrame(ts => this.draw(0));	
				}
			}, newValue ? 0 : 1500);
			
		}
	},
	methods: {
		resize() {
			this.canvas!.width = window.innerWidth * window.devicePixelRatio;
			this.canvas!.height = window.innerHeight * window.devicePixelRatio;
			this.draw();
		},
		draw(ts : number | undefined = undefined) {
			// Calculate delta time.
			var delta = 0;
			if (this.lastTs && ts)
				delta = ts - this.lastTs;

			this.lastTs = ts;

			// Spawn particles.
			for (var i = 0; i < Math.random() * (this.count - this.particles.length); i++) {
				let particle = new Particle(
					Math.random(), 
					this.particleTexts[Math.floor(Math.random() * this.particleTexts.length)],
					this.canvas!.width + (Math.random() * this.canvas!.width / 3),
					this.canvas!.height * Math.random(),
					this.speed,
					this.context!,
					this.maxFontSize
				);

				this.particles.push(particle);
			}

			// Clear the canvas.
			this.context!.clearRect(0, 0, this.canvas!.width, this.canvas!.height);

			// Move & draw the particles.
			this.particles.map(particle => {
				// Move the particle.
				particle.x = particle.x - (particle.speed * delta * particle.size);

				// Draw the particle.
				this.context!.globalAlpha = particle.size * this.maxAlpha;
				this.context!.fillStyle = "white";
				this.context!.font = `${Math.floor(this.maxFontSize * particle.size * window.devicePixelRatio)}px Open Sans`;
				this.context!.fillText(particle.text, particle.x, particle.y);
			});

			// Despawn particles.
			this.particles = this.particles.filter(particle => particle.isVisible());

			// Loop if we are still drawing.
			if (this.shouldDraw) {
				requestAnimationFrame(ts => this.draw(ts));
			}
		}
	},
	mounted: async function() {
		// Get commits.
		let commitsResponse = await send(Method.GET, "fx/commits");
		if (!commitsResponse.status.ok) 
			return;

		this.particleTexts = commitsResponse.result?.commits;

		// Set the canvas.
		this.canvas = <HTMLCanvasElement> document.getElementById("commitCanvas");
		this.context = this.canvas?.getContext("2d");

		// Add resize handler.
		window.addEventListener("resize", () => this.resize());
		this.resize();
	}
});
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
canvas {
	width: 100%;
	height: 100%;
	opacity: 0;
	transition: opacity 1s;

	&.visible {
		filter: blur(2px);
		opacity: 1;
	}
	
}
</style>