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
	output: { filename: "./imba.js" },
	plugins: [minify]
}),pkg({
	entry: "./test/index.imba",
	output: { filename: "./test/client.js"}
})]

