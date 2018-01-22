var path = require('path');
var webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

var minify = new UglifyJsPlugin({
	uglifyOptions: {
		ecma: 6,
		minimize: true,
		compress: { warnings: false },
		output: {
			semicolons: false,
			indent_level: 0
		}
	}
	
});

module.exports = [{
	module: {
		rules: [
			{
				test: /.imba$/,
				loader: path.join(__dirname, "./loader"),
				options: {es5: true}
			}
		]
	},
	resolve: {extensions: ['*', '.imba', '.js']},
	entry: "./src/imba/index.imba",
	output: {
		filename: "./imba.js",
		library: {
			root: "Imba",
			amd: "imba",
			commonjs: "imba"
		},
		libraryTarget: "umd"
	},
	node: {fs: false, process: false, global: false},
	plugins: [minify]
},{
	module: {
		rules: [
			{
				test: /.imba$/,
				loader: path.join(__dirname, "./loader")
			}
		]
	},
	resolve: {extensions: ['*', '.imba', '.js']},
	entry: "./test/index.imba",
	output: { filename: "./test/client.js"},
	node: {fs: false, process: false, global: false}
}]
