var path = require('path');
var package = require('./package.json');
var loader = path.join(__dirname, "loader");

module.exports = [{
	module: {
		rules: [{test: /\.imba$/, use: loader}]
	},
	resolve: {extensions: ['*', '.imba', '.js']},
	entry: "./index.imba",
	output: {
		filename: "./dist/imba.development.js",
		library: {
			root: "Imba",
			amd: "imba",
			commonjs: "imba"
		},
		globalObject: 'typeof self !== \'undefined\' ? self : this',
		path: path.resolve(__dirname),
		libraryTarget: "umd"
	},
	node: {fs: false, process: false, global: false}
},{
	resolve: {extensions: ['.js']},
	entry: "./lib/compiler/compiler.js",
	output: {
		filename: "./dist/imbac.js",
		library: "imbac",
		libraryTarget: "umd",
		globalObject: 'typeof self !== \'undefined\' ? self : this',
		path: path.resolve(__dirname)
	},
	node: {fs: false, process: false, global: false},
}]