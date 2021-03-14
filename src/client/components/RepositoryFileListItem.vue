<template>
	<div class="file-wrapper">
		<div class="list-item clickable file" :class="{ 'first': index == 0 }">
			<div class="file-icon" v-tooltip="{ 
				theme: 'panorama', 
				content: file.type == 'dir' ? $t('components.repositoryFileListItem.directory') : fileType ? $t('components.repositoryFileListItem.fileOfType', [fileType.name]) : $t('components.repositoryFileListItem.file')
			}">
				<img :src="iconPath">
			</div>
			<div class="details">
				<span>{{ overrideName ? overrideName : file.name }}</span>
			</div>
			<div class="statistics">
				<file-percentage/>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue, { PropType } from "vue";

// Modules
import config from "../config";
import Extensions from "../store/modules/Extensions";
import { Repository } from "../modules/models/Repository";
import { File } from "../modules/models/File";
import { FileType } from "../../shared/models/FileType";

// Components
import { FontAwesomeIcon }  from "@fortawesome/vue-fontawesome";
import FilePercentage from "./FilePercentage.vue";

export default Vue.extend({
	components: {
		FontAwesomeIcon,
		FilePercentage
	},
	computed: {
		extension() : string {
			return this.file.name.split(".").pop()!;
		},
		fileType() : FileType {
			return Extensions.state.map[this.file.name.split(".").pop()!];
		},
		iconPath() : string {
			// Return folder icon.
			if (this.file.type == "dir") return `${config.repositories.extensions.icons.path}/folder.${config.repositories.extensions.icons.extension}`;

			// Get extension information
			if (this.fileType) return `${config.repositories.extensions.icons.path}/${this.fileType.icon}.${config.repositories.extensions.icons.extension}`;

			// No extension information, return default file icon.
			return `${config.repositories.extensions.icons.path}/file.${config.repositories.extensions.icons.extension}`;
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

	.details {
		flex-grow: 1;

		
	}

	> *:not(:last-child) {
		margin-right: 20px;
	}
}
</style>