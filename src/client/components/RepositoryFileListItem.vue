<template>
	<div class="file-wrapper">
		<div class="list-item file" :class="{ 'first': index == 0 }">
			<div class="file-icon" v-tooltip="{ theme: 'panorama', content: $t(`components.repositoryFileListItem.${file.type == 'dir' ? 'directory' : 'file'}`)}">
				<img :src="iconPath">
			</div>
			<span>{{ overrideName ? overrideName : file.name }}</span>
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue, { PropType } from "vue";

// Modules
import config from "../config";

// Components
import { FontAwesomeIcon }  from "@fortawesome/vue-fontawesome";
import { Repository } from "../modules/models/Repository";
import { File } from "../modules/models/File";

export default Vue.extend({
	components: {
		FontAwesomeIcon
	},
	computed: {
		iconPath() : string {
			if (this.file.type == "dir") return `${config.repositories.extensions.icons.path}/folder.${config.repositories.extensions.icons.extension}`;
			return "/icons/material/file.svg";
		},
		file() : File {
			return this.repo.content.files[this.path];
		}
	},
	props: {
		repo: {
			type: Object as PropType<Repository>,
			required: true
		},
		path: {
			type: String,
			required: true 
		},
		index: {
			type: Number,
			required: true,
			default: -1
		},
		overrideName: {
			type: String,
			required: false
		}
	}
	
});
</script>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.file {
	display: flex;
	align-items: center;
	justify-content: flex-start;

	box-sizing: border-box;
	padding: 10px 0px;
	height: 50px;

	font-size: 0.85em;

	.file-icon {
		display: flex;
		align-items: center;

		> img {
			width: 20px;
		}
	}

	> *:not(:last-child) {
		margin-right: 20px;
	}
}
</style>