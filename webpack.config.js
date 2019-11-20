var path = require('path');
var webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

var package = require('./package.json');
var loader = path.join(__dirname, "./loader");

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
		rules: [{test: /\.imba$/, loader: loader, options: {es5: true}}]
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
		globalObject: 'typeof self !== \'undefined\' ? self : this',
		path: path.resolve(__dirname),
		libraryTarget: "umd"
	},
	node: {fs: false, process: false, global: false},
	plugins: [minify]
//},{
//	module: {
//		rules: [{test: /\.imba$/, loader: 'imba/imba', options: {es5: true}}]
//	},
//	resolve: {extensions: ['*', '.imba', '.js']},
//	entry: "./src/compiler/compiler.imba",
//	output: {
//		filename: "./imbac.js",
//		library: "imbac",
//		libraryTarget: "umd",
//		globalObject: 'typeof self !== \'undefined\' ? self : this',
//		path: path.resolve(__dirname)
//	},
//	node: {fs: false, process: false, global: false},
//	plugins: [minify]
// },{
// 	module: {
// 		rules: [{test: /\.imba$/, loader: loader}]
// 	},
// 	resolve: {extensions: ['*', '.imba', '.js']},
// 	entry: "./test/index.imba",
// 	output: {
// 		filename: "./test/client.js",
// 		globalObject: 'typeof self !== \'undefined\' ? self : this',
// 		path: path.resolve(__dirname)
// 	},
// 	node: {fs: false, process: false, global: false}
}]
