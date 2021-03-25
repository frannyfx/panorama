// Imports
let path = require("path");
let webpack = require("webpack");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

// Configuration
module.exports = {
	entry: {
		"main": "./src/client/entries/index.ts",
		"callback": "./src/client/entries/callback.ts",
		"privacy-policy": "./src/client/entries/privacy-policy.ts"
	},
	output: {
		path: path.resolve(__dirname, "dist/public/js"),
		filename: "[name].bundle.js",
		chunkFilename: "[id].chunk.js"
	},
	module: {
		rules: [{
			test: /\.vue$/,
			include: [
				path.resolve(__dirname, "src/client/"),
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
			options: { 
				appendTsSuffixTo: [/\.vue$/],
				configFile: "tsconfig.webpack.json"
			}
		}]
	},
	plugins: [
		new VueLoaderPlugin(),
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
	],
	resolve: {
		extensions: [".js", ".ts", ".tsx", ".scss"],
		alias: {
			vue: "vue/dist/vue.common.js"
		}
	}
};