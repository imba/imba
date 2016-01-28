var path = require('path');
var webpack = require('webpack');

var prodDefines = new webpack.DefinePlugin({
	"Imba.SERVER": false,
	"Imba.DEBUG": false,
	"Imba.CLIENT": true
})

var prod = [
	new webpack.DefinePlugin({
		"Imba.SERVER": false,
		"Imba.DEBUG": false,
		"Imba.CLIENT": true
	}),
	new webpack.optimize.UglifyJsPlugin({minimize: true})
]

var dev = [
	new webpack.DefinePlugin({
		"Imba.SERVER": false,
		"Imba.DEBUG": true,
		"Imba.CLIENT": true
	})
]

var resolveLoader = {
	// root: path.join(__dirname, "node_modules")
	alias: {
		"imba-loader": path.join(__dirname, "./loader"),
		"path": "path-browserify"
	}
}

module.exports = [{
	module: {loaders: [{ "test": /\.imba$/, "loader": 'imba-loader'}]},
	resolveLoader: resolveLoader,
	resolve: {extensions: ['', '.imba', '.js']},
	entry: "./src/imba/index.imba",
	output: { filename: "./dist/imba.dev.js" },
	plugins: dev
},{
	module: {loaders: [{ "test": /\.imba$/, "loader": 'imba-loader'}]},
	resolveLoader: resolveLoader,
	resolve: {extensions: ['', '.imba','.js']},
	entry: "./src/imba/index.imba",
	output: { filename: "./dist/imba.js" },
	plugins: [prodDefines]
},{
	module: {loaders: [{ "test": /\.imba$/, "loader": 'imba-loader'}]},
	resolveLoader: resolveLoader,
	resolve: {extensions: ['', '.imba','.js']},
	entry: "./src/imba/index.imba",
	output: { filename: "./dist/imba.min.js" },
	plugins: prod
},{
	module: {loaders: [{ "test": /\.imba$/, "loader": 'imba-loader'}]},
	resolveLoader: resolveLoader,
	resolve: {extensions: ['', '.js', '.imba']},
	entry: "./src/compiler/compiler.imba",
	output: { filename: "./dist/imbac.dev.js", library: "Imbac" },
	target: 'web',
	node: {fs: "empty"},
	plugins: dev
},{
	module: {loaders: [{ "test": /\.imba$/, "loader": 'imba-loader'}]},
	resolveLoader: resolveLoader,
	resolve: {extensions: ['', '.js', '.imba']},
	entry: "./src/compiler/compiler.imba",
	output: { filename: "./dist/imbac.js", library: "Imbac" },
	target: 'web',
	node: {fs: "empty"},
	plugins: prod
},{
	module: {loaders: [{ "test": /\.imba$/, "loader": 'imba-loader'}]},
	resolveLoader: resolveLoader,
	resolve: {extensions: ['', '.js', '.imba']},
	entry: "./test/src/index.imba",
	output: { filename: "./test/client.js"},
	target: 'web',
	node: {fs: "empty"},
	plugins: dev
}]

