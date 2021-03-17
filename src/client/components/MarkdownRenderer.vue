<template>
	<div class="markdown-body" v-html="html"></div>
</template>
<script lang="ts">
// Imports
import Vue, { PropType } from "vue";
import MarkdownIt from "markdown-it";

// Replacement function.
var replacementFunction : (url: string, env: any) => string = (url, env) => url;

// MarkdownIt instance.
// @ts-ignore
const md = MarkdownIt({
	replaceLink: (url: string, env: any) => replacementFunction(url, env),
	html: true
}).use(require("markdown-it-replace-link"));

export default Vue.extend({
	computed: {
		html() {
			return md.render(this.source);
		}
	},
	data() {
		return {
			md: null as MarkdownIt | null
		}
	},
	methods: {
		replaceLink(url: string, env: any) : string {
			// If there is no replacement set then simply return the link.
			if (!this.relativeLinkRoot) return url;

			// Check if the link is relative.
			try {
				new URL(url);
				return url;
			} catch (e) {
				// Parsing URL failed, which means it must be a relative path.
				let strippedPath = url.length > 0 && url[0] == "/" ? url.slice(1) : url;
				return `${this.relativeLinkRoot}/${strippedPath}`;
			}
		}
	},
	mounted() {
		// Set link replacement function.
		replacementFunction = this.replaceLink;
	},
	props: {
		source: {
			type: String,
			required: true
		},
		relativeLinkRoot: {
			type: String,
			required: false
		}
	}
})
</script>
<style lang="scss">
@import "~github-markdown-css";

</style>