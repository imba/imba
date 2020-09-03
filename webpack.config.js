var path = require('path');
var package = require('./package.json');
var loader = path.join(__dirname, "loader");

var umd = {
	filename: "./dist/[name].js",
	libraryTarget: "umd",
	globalObject: 'typeof self !== \'undefined\' ? self : this',
	path: path.resolve(__dirname)
};

var modules = {
  rules: [
    { test: /\.imba$/, use: {loader: './loader.js',options:{imbaPath: null}} , exclude: /test\/\w+\// },
    { test: /\.imba1$/, use: './scripts/bootstrap.loader.js' },
    { test: /\.html$/, use: 'raw-loader' }
  ]
}

module.exports = (env, argv) =>[{
	entry: "./src/compiler/compiler.imba1",
	resolve: { extensions: [".imba1",".imba",".js",".json"] },
	module: modules,
	output: Object.assign({library: 'imbac'},umd,{filename: `./dist/compiler.js`}),
	node: {fs: false, process: false, global: false},
},{
	entry: "./src/compiler/grammar.imba1",
	resolve: { extensions: [".imba1",".js"] },
	module: modules,
	output: Object.assign({library: 'grammar'},umd,{filename: `./build/grammar.js`}),
	node: {fs: false, process: false, global: false},
},{
	entry: "./test/index.imba",
	resolve: { extensions: [".imba",".imba1",".js",".json"] },
	module: modules,
	output: {filename: `./test/index.js`, path: __dirname}
}]