var path = require('path');
var package = require('./package.json');
var loader = path.join(__dirname, "loader");

var umd = {
	filename: "./dist/[name].js",
	libraryTarget: "umd",
	globalObject: 'typeof self !== \'undefined\' ? self : this',
	path: path.resolve(__dirname)
};

module.exports = (env, argv) =>[{
	entry: "./src/compiler/compiler.imba1",
	output: Object.assign({library: 'imbac'},umd,{filename: `./dist/compiler.js`}),
	node: {fs: false, process: false, global: false},
},{
	entry: "./src/imba/index.imba",
	output: Object.assign({library: 'imba'},umd,{filename: `./dist/imba.js`}),
	node: {fs: false, process: false, global: false},
},{
	entry: "./src/compiler/grammar.imba1",
	output: Object.assign({library: 'grammar'},umd,{filename: `./build/grammar.js`}),
	node: {fs: false, process: false, global: false},
},{
	entry: "./test/index.imba",
	output: {filename: `./test/index.js`, path: __dirname}
}]