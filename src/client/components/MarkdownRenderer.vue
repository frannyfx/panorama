<template>
	<div class="markdown-body" v-html="html"></div>
</template>
<script lang="ts">
// Imports
import Vue from "vue";
import MarkdownIt from "markdown-it";

export default Vue.extend({
	computed: {
		html() : string {
			if (!this.md) return "";
			return this.md.render(this.source);
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
		// Create MarkdownIt instance.
		// @ts-ignore
		this.md = MarkdownIt({
			replaceLink: (url: string, env: any) => this.replaceLink(url, env),
			html: true,
		})	.use(require("markdown-it-replace-link"))
			.use(require("markdown-it-highlightjs"), { auto: false })
			.use(require("markdown-it-link-attributes"), { attrs: { target: "_blank", rel: "noreferrer" }});
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
.markdown-body {
	padding: 30px 40px 40px 40px;
	
	img {
		border-radius: 5px;
	}
}
</style>