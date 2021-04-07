<template>
	<div class="app" :class="[theme]">
		<div class="page nav">
			<div class="content container">
				<div class="title">
					<div class="eye"><font-awesome-icon icon="eye"/></div>
					<!--<button @click="switchTheme">
						<font-awesome-icon icon="eye"/>
						<span>Switch theme</span>
					</button>-->
				</div>
				<h1>Privacy Policy</h1>
				<p><i>Last updated April 7<sup>th</sup> 2021.</i></p>
				<p>
					<b>Panorama</b> ("Panorama", "we", or "us") is committed to protecting your privacy.
					This Privacy Policy explains the methods and reasons we collect, use, disclose, transfer and store your information.<br>
					By using Panorama and its features you agree to have read and understood the contents of this policy, give us permission to collect, use, disclose, transfer and store your information as described
					and agree to follow the guidelines described in this policy.<br>
					If you have any questions about the contents of this policy, please contact us.<br>
				</p>
				<p>This policy may be subject to changes as the requirements, features and capabilities of our service evolve.</p>
				<h2>Information collected</h2>
				<h3>Personal information</h3>
				<p>
					We collect and store your personal information when you choose to sign in to our service using GitHub.
					The scope of the information collected is as follows:
				</p>
				<ul>
					<li>Your GitHub account's unique identifier;</li>
					<li>Your GitHub username;</li>
					<li>The last time you used Panorama to analyse a repository;</li>
					<li>Metadata about your GitHub profile picture.</li>
				</ul>
				<p>
					It's important to note that the personal information of people who either own or have contributed to GitHub repositories that you have analysed using Panorama will also be collected in the same way.<br>
					Before analysing a repository, you must ensure to have permission from all the repository's contributors to perform the analysis.<br>
					Additionally, during analysis, Panorama will temporarily process the email addresses and Git commit information of all repository contributors, though this data 
					is never stored.
				</p>
				<h3>Information about repositories</h3>
				<p>
					Panorama will store metadata about the repositories that you have analysed using our service. 
					This includes the following information:
				</p>
				<ul>
					<li>The GitHub repository's unique identifier;</li>
					<li>The name of the repository;</li>
					<li>The last time the repository was analysed;</li>
					<li>Analysis metadata and code analysis metrics tied to each contributor.</li>
				</ul>
				<p>
					Additionally, when Panorama analyses a repository, its entire Git file structure and metadata is saved to one of our analysis servers.
					Though it is not stored in a database, it is cached locally and may be retained for a period of time for performance reasons.
				</p>
				<h2>Storage of information</h2>
				<p>
					Your information is securely stored in our cloud servers, and it may be distributed and utilised across several of our servers and databases.
				</p>
				<h3>Data retention</h3>
				<p>
					Our systems have a rigorous data eviction policy, which means that personal information and other data stored will be permanently and irreversibly deleted
					from our systems once it has been deemed unnecessary.<br><br>
					If a repository has not been analysed for a certain period of time (at most 30 days), its analysis data and all the personal information related to it
					is permanently and irreversibly deleted.<br><br>
					If a user has not used Panorama and its services for a certain period of time (at most 30 days), and their information is not related to
					any repositories or analyses still present in the system, it will be permanently and irreversibly deleted.
				</p>
				<h2>Your rights</h2>
				<p>
					Under data protection law, you have rights including:
				</p>
				<ul>
					<li>
						<i>Right of access</i>: You have the right to ask us for copies of your personal information.
					</li>
					<li>
						<i>Right to rectification</i>: You have the right to ask us to rectify personal information you think is inaccurate.
						You also have the right to ask us to complete information you think is incomplete.
					</li>
					<li>
						<i>Right to erasure</i>: You have the right to ask us to erase your personal information in certain circumstances.
					</li>
					<li>
						<i>Right to restriction of processing</i>: You have the right to ask us to restrict the processing of your personal information
						in certain circumstances.
					</li>
					<li>
						<i>Right to object to processing</i>: You have the right to object to the processing of your personal information
						in certain circumstsances.
					</li>
					<li>
						<i>Right to data portability</i>: You have the right to ask that we transfer the personal information you gave us to another
						organisation, or to you, in certain circumstances.
					</li>
				</ul>
				<p>You are not required to pay any charge for exercising your rights. If you make a request, please allow for a reasonable amount of time for us to respond.</p>
				<h2>Contact us</h2>
				<p>To make an inquiry, please contact us at <a href="mailto:francesco.compagnoni@kcl.ac.uk"><b>francesco.compagnoni@kcl.ac.uk</b></a>.</p>
				<br>
				<content-footer/>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
// Imports
import Vue from "vue";

// Components
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import ContentFooter from "../components/Footer.vue";

export default Vue.extend({
	components: {
		FontAwesomeIcon,
		ContentFooter
	},
	data() {
		return {
			theme: "light"
		};
	},
	methods: {
		switchTheme() {
			this.theme = this.theme == "dark" ? "light" : "dark";
		}
	},
	mounted() {
		// Get query to check whether the user prefers dark mode.
		let mql = window.matchMedia('(prefers-color-scheme: dark)');

		// Listen for changes
		mql.addEventListener("change", (e) => {
			//this.theme = e.matches ? "dark" : "light";
		});

		// Set initial value.
		//this.theme = mql.matches ? "dark" : "light";
	}
});
</script>
<style lang="scss">
@import "../stylesheets/globals.scss";
</style>
<style lang="scss" scoped>
@import "../stylesheets/globals.scss";
.app {
	width: 100vw;
	height: 100vh;
	transition: background-color 1s, color 1s;

	.background {
		width: 100vw;
		height: 100vh;
		
		background-size: cover;
		background-position: center;
	}

	&.dark {
		background-color: #040a1c !important;
		color: $white-blue !important;

		h1, h2, h3, .eye {
			color: $very-white-blue !important;
		}
	}

	&.light {
		background-color: white !important;
		color: #040a1c !important;

		h1, h2, h3, .eye {
			color: $deep !important;
		}
	}

	.title {
		display: flex;
		align-items: center;

		.eye {
			flex-grow: 1;
		}
	}
	
	h1, h2, h3, .eye {
		font-weight: 400;
		transition: color 1s;
	}

	p, ul {
		font-size: 0.9em;
	}

	a {
		color: $blue;
		text-decoration: underline;
	}

	.content {
		padding: 0px 40px;
	}

	.eye {
		font-size: 4em;
	}
}
</style>