var path = require('path');
var webpack = require('webpack');

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
	}),
	new webpack.SourceMapDevToolPlugin({})
]

if(false){
	module.exports = [{
		module: {loaders: [{ "test": /\.imba$/, "loader": 'imba-loader'}]},
		// resolveLoader: { root: path.join(__dirname, "node_modules") },
		resolve: {extensions: ['', '.js', '.imba']},
		entry: "./tmp/src/bug.imba",
		output: { filename: "./dist/imbac.dev.js", library: "Imbac" },
		plugins: dev
	}]
} else {
	module.exports = [{
	// 	module: {loaders: [{ "test": /\.imba$/, "loader": 'imba-loader'}]},
	// 	// resolveLoader: { root: path.join(__dirname, "node_modules") },
	// 	resolve: {extensions: ['', '.js', '.imba']},
	// 	entry: "./src/imba/browser.imba",
	// 	output: { filename: "./dist/imba.js" },
	// 	plugins: [
	// 		new webpack.DefinePlugin({
	// 			"Imba.SERVER": false,
	// 			"Imba.DEBUG": false,
	// 			"Imba.CLIENT": true
	// 		}),
	// 		new webpack.optimize.UglifyJsPlugin({minimize: true})
	// 	]
	// },{
	// 	module: {loaders: [{ "test": /\.imba$/, "loader": 'imba-loader'}]},
	// 	// resolveLoader: { root: path.join(__dirname, "node_modules") },
	// 	resolve: {extensions: ['', '.js', '.imba']},
	// 	entry: "./src/imba/browser.imba",
	// 	output: { filename: "./dist/imba.dev.js" },
	// 	plugins: [
	// 		new webpack.DefinePlugin({
	// 			"Imba.SERVER": false,
	// 			"Imba.DEBUG": true,
	// 			"Imba.CLIENT": true
	// 		}),
	// 		new webpack.SourceMapDevToolPlugin({})
	// 	]
	// },{
		module: {loaders: [{ "test": /\.imba$/, "loader": 'imba-loader'}]},
		// resolveLoader: { root: path.join(__dirname, "node_modules") },
		resolve: {extensions: ['', '.js', '.imba']},
		entry: "./src/compiler/compiler.imba",
		output: { filename: "./dist/imbac.dev.js", library: "Imbac" },
		target: 'web',
		node: {
			fs: "empty",
			path: "empty"
		},
		plugins: dev
	},{
		module: {loaders: [{ "test": /\.imba$/, "loader": 'imba-loader'}]},
		// resolveLoader: { root: path.join(__dirname, "node_modules") },
		resolve: {extensions: ['', '.js', '.imba']},
		entry: "./src/compiler/compiler.imba",
		output: { filename: "./dist/imbac.js", library: "Imbac" },
		target: 'web',
		node: {
			fs: "empty",
			path: "empty"
		},
		plugins: prod
	},{
		module: {loaders: [{ "test": /\.imba$/, "loader": 'imba-loader'}]},
		// resolveLoader: { root: path.join(__dirname, "node_modules") },
		resolve: {extensions: ['', '.js', '.imba']},
		entry: "./src/compiler/worker.imba",
		output: { filename: "./dist/imbac.worker.js", library: "ImbaWorker"},
		target: 'webworker',
		plugins: prod
	},{
		module: {loaders: [{ "test": /\.imba$/, "loader": 'imba-loader'}]},
		// resolveLoader: { root: path.join(__dirname, "node_modules") },
		resolve: {extensions: ['', '.js', '.imba']},
		entry: "./src/compiler/worker.imba",
		output: { filename: "./dist/imbac.worker.js", library: "ImbaWorker"},
		target: 'webworker',
		plugins: prod
	},{
		module: {loaders: [{ "test": /\.imba$/, "loader": 'imba-loader'}]},
		// resolveLoader: { root: path.join(__dirname, "node_modules") },
		resolve: {extensions: ['', '.js', '.imba']},
		entry: "./src/compiler/worker.imba",
		output: { filename: "./dist/imbac.worker.dev.js", library: "ImbaWorker"},
		target: 'webworker',
		plugins: dev
	}]
}


/*

*/