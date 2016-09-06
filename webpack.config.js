var path = require('path');
var webpack = require('webpack');

var minify = new webpack.optimize.UglifyJsPlugin({
	minimize: true, compress: { warnings: false }
});

var loaders = [{
	"test": /\.imba$/,
	"loader": path.join(__dirname, "./loader")
	}];

function pkg(options){
	var pkg = {
		module: {loaders: loaders},
		resolveLoader: {alias: { "path": "path-browserify" }},
		resolve: {extensions: ['', '.imba', '.js']},
		entry: "./src/imba/index.imba",
		target: 'web',
		output: { filename: "./dist/imba.js" },
		node: {fs: "empty", process: "empty", global: false}
	}

	Object.keys(options).map(function(key){
		pkg[key] = options[key];
	})

	return pkg;
}

module.exports = [pkg({
	entry: "./src/imba/index.imba",
	output: { filename: "./dist/imba.dev.js" },
	debug: true
}),pkg({
	entry: "./src/imba/index.imba",
	output: { filename: "./dist/imba.js" }
}),pkg({
	entry: "./src/imba/index.imba",
	output: { filename: "./dist/imba.min.js" },
	plugins: [minify]
}),pkg({
	entry: "./src/imba/index.imba",
	output: { filename: "./dist/imba.edge.js" },
	loader: {env: {drop_deprecated: true}}
}),pkg({
	entry: "./src/imba/index.imba",
	output: { filename: "./dist/imba.edge.min.js" },
	loader: {env: {drop_deprecated: true}},
	plugins: [minify]
}),pkg({
	entry: "./test/index.imba",
	output: { filename: "./test/client.js"}
})]

