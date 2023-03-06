const imba1 = require('./bootstrap.compiler.js');
// const imba2 = require('./bootstrap.compiler2.js');
const fs = require('fs');

function plugin(build){
	let options = this;
	let fs = require('fs');

	build.onLoad({ filter: /\.imba1/ }, async (args) => {
		let raw = await fs.promises.readFile(args.path, 'utf8');
		let target = {
			browser: 'web',
			worker: 'webworker'
		}[options.platform] || options.platform || 'web';
		let body = imba1.compile(raw,{
			target: target,
			filename: args.path,
			sourcePath: args.path
		});
		return {contents: body.js}
	})

	build.onLoad({ filter: /\.imba/ }, async (args) => {
		// console.log('loading imba',args);
		let raw = await fs.promises.readFile(args.path, 'utf8');
		let t0 = Date.now();
		let body = imba2.compile(raw,{
			platform: 'browser',
			sourcePath: args.path
		});
		return {
			contents: body.js
		}
	})
}

async function bundle(options){
	options.plugins = [{name: 'imba', setup: plugin.bind(options)}];
	options.resolveExtensions = ['.imba','.imba1','.ts','.mjs','.cjs','.js','.css','.json'];
	options.target = options.target || ['es2020']; // ['chrome58', 'firefox57', 'safari11', 'edge16'];
	options.bundle = true;

	let res = await require('esbuild').build(options);
    var parser = require('../build/grammar.js').parser;
    fs.writeFileSync(__dirname + "/../build/parser.js", parser.generate());
    console.log('built parser');

}

bundle({
	entryPoints: ['src/compiler/grammar.imba1'],
	outfile: 'build/grammar.js',
	sourcemap: false,
	format: 'cjs',
	platform: 'node'
})