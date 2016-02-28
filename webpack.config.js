var path = require('path');
var webpack = require('webpack');

var prodDefines = new webpack.DefinePlugin({
	"Imba.CLIENT": true
})

var prod = [
	new webpack.DefinePlugin({
		"Imba.CLIENT": true
	}),
	new webpack.optimize.UglifyJsPlugin({
		minimize: true,
		compress: { warnings: false }
	})
]

var dev = [
	new webpack.DefinePlugin({
		"Imba.DEBUG": true,
		"Imba.CLIENT": true
	})
]

var loaderPath = path.join(__dirname, "./loader");
var loaders = [{ "test": /\.imba$/, "loader": loaderPath}];

var resolveLoader = {
	alias: { "path": "path-browserify" }
}

function pkg(options){
	var pkg = {
		module: {loaders: loaders},
		resolveLoader: resolveLoader,
		resolve: {extensions: ['', '.imba', '.js']},
		entry: "./src/imba/index.imba",
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
	plugins: dev
}),pkg({
	entry: "./src/imba/index.imba",
	output: { filename: "./dist/imba.js" },
	plugins: [prodDefines]
}),pkg({
	entry: "./src/imba/index.imba",
	output: { filename: "./dist/imba.min.js" },
	plugins: prod
}),pkg({
	entry: "./src/compiler/compiler.imba",
	output: { filename: "./dist/imbac.dev.js", library: "Imbac" },
	target: 'web',
	node: {fs: "empty"},
	plugins: dev
}),pkg({
	entry: "./src/compiler/compiler.imba",
	output: { filename: "./dist/imbac.js", library: "Imbac" },
	target: 'web',
	node: {fs: "empty"},
	plugins: prod
}),pkg({
	entry: "./test/index.imba",
	output: { filename: "./test/client.js"},
	target: 'web',
	node: {fs: "empty"},
	plugins: dev
})]

