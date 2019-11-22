var fs = require('fs');
var path = require('path');
var compiler = require('./bootstrap.compiler');
const webpack = require('webpack');
var dist = path.resolve(__dirname,'..','dist');
var tmp = path.resolve(__dirname,'..','build');
var src = path.resolve(__dirname,'..','src');



function pack(opts){
	return new Promise(function(resolve,reject){
		opts = Object.assign({
			module: {rules: [{test: /\.imba1$/, use: __dirname + '/bootstrap.loader.js' }]},
			resolve: {extensions: ['.imba1','.js','.json']},
			node: {fs: false, process: false, global: false}
		},opts);

		opts.output = Object.assign({
			libraryTarget: "umd",
			globalObject: 'typeof self !== \'undefined\' ? self : this',
			path: dist
		},opts.output);
		webpack(opts).run(function(err,stats){
			resolve();
		});
	});
}
async function main(){
	if(fs.existsSync(dist)){ process.exit(0); };
	try{ fs.mkdirSync(dist); } catch(e) {}
	try{ fs.mkdirSync(tmp); } catch(e) {}
	// make sure we generate the initial parser and all that
	if(!fs.existsSync(dist) || true){
		try{ fs.mkdirSync(dist); } catch(e) {}

		// compile grammar
		var res = await pack({
			entry: src + "/compiler/grammar.imba1",
			mode: 'none',
			output: {filename: './grammar.js', path: tmp}
		});

		// Generate the parser
		var parser = require(tmp + '/grammar.js').parser
		fs.writeFileSync(tmp + "/parser.js", parser.generate());

		await pack({
			entry: src + "/compiler/compiler.imba1",
			output: {filename: './compiler.js'}
		});

		process.exit(0);
	};
}

main();
