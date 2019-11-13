var path = require('path');

module.exports = {
	module: {
		rules: [{test: /\.imba$/, loader: '../../loader'}]
	},
	resolve: {extensions: ['*', '.imba', '.js']},
	entry: "../../src/imba/index.imba",
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
}