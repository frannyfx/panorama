// Imports
let path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

// Configuration
module.exports = {
	entry: "./src/client/index.ts",
	output: {
		path: path.resolve(__dirname, "dist/public/js"),
		filename: "[name].bundle.js"
	},
	module: {
		rules: [{
			test: /\.vue$/,
			include: [
				path.resolve(__dirname, "src/client/components"),
				path.resolve(__dirname, "src/client/routes")
			],
			use: "vue-loader"
		}, {
			test: /\.scss$/,
			use: [
				"style-loader",
				"css-loader",
				"sass-loader"
			]
		}, {
			test: /\.tsx?$/,
			loader: "ts-loader",
			exclude: /node_modules/,
			options: { appendTsSuffixTo: [/\.vue$/] }
		}]
	},
	plugins: [
		new VueLoaderPlugin()
	],
	resolve: {
		extensions: [".js", ".ts", ".tsx", ".scss"],
		alias: {
			vue: "vue/dist/vue.common.js"
		}
	}
};