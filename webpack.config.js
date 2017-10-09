var path = require('path');
var webpack = require('webpack');

var minify = new webpack.optimize.UglifyJsPlugin({
	minimize: true, compress: { warnings: false }, output: {
    semicolons: false,
    indent_level: 0
  }
});

var loaders = [{
	"test": /\.imba$/,
	"loader": path.join(__dirname, "./loader")
}];

module.exports = [{
	module: {loaders: loaders},
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
	node: {fs: false, process: false, global: false}
	// plugins: [minify]
},{
	module: {loaders: loaders},
	resolve: {extensions: ['*', '.imba', '.js']},
	entry: "./test/index.imba",
	output: { filename: "./test/client.js"},
	node: {fs: false, process: false, global: false}
}]
