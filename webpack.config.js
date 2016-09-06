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
		output: { filename: "./dist/imba.js" }
	}

	Object.keys(options).map(function(key){
		pkg[key] = options[key];
	})

	return pkg;
}

module.exports = [pkg({
	entry: "./src/imba/index.imba",
	output: { filename: "./dist/imba.dev.js" },
	target: 'web', debug: true,
	node: {fs: "empty", process: "empty", global: false}
}),pkg({
	entry: "./src/imba/index.imba",
	output: { filename: "./dist/imba.js" },
	target: 'web',
	node: {fs: "empty", process: "empty", global: false}
}),pkg({
	entry: "./src/imba/index.imba",
	output: { filename: "./dist/imba.min.js" },
	target: 'web',
	node: {fs: "empty", process: "empty", global: false},
	plugins: [minify]
}),pkg({
	entry: "./test/index.imba",
	output: { filename: "./test/client.js"},
	target: 'web',
	node: {fs: "empty", process: "empty", global: false}
})]

