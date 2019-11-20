var path = require('path')

module.exports = [{
	module: {
		rules: [{test: /\.imba$/, loader: '../loader', options: {es5: true}}]
	},
	resolve: {extensions: ['*', '.imba', '.js']},
	entry: "../src/imba/index.imba",
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
	node: {fs: false, process: false, global: false}
},{
	resolve: {extensions: ['.js']},
	entry: "../lib/compiler/compiler.js",
	output: {
		filename: "./imbac.js",
		library: "imbac",
		libraryTarget: "umd",
		globalObject: 'typeof self !== \'undefined\' ? self : this',
		path: path.resolve(__dirname)
	},
	node: {fs: false, process: false, global: false},
	// plugins: [minify]
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