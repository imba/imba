const imba1 = require('./bootstrap.compiler.js');
const imba2 = require('./bootstrap.compiler2.js');
let time = 0;

function plugin(build){
	// console.log('setting up plugin',build,this);
	let options = this;

	let fs = require('fs');

	build.onLoad({ filter: /\.imba1/ }, async (args) => {
		// console.log('loading imba',args);
		let raw = await fs.promises.readFile(args.path, 'utf8');
		let target = {
			browser: 'web',
			worker: 'webworker'
		}[options.platform] || options.platform || 'web';
		let t0 = Date.now();

		let body = imba1.compile(raw,{
			target: target,
			filename: args.path,
			sourcePath: args.path
		});
		time += (Date.now() - t0);
		return {contents: body.js}
	})

	build.onLoad({ filter: /\.imba/ }, async (args) => {
		// console.log('loading imba',args);
		let raw = await fs.promises.readFile(args.path, 'utf8');
		let t0 = Date.now();
		let body = imba2.compile(raw,{
			platform: options.platform || 'browser',
			sourcePath: args.path,
			imbaPath: null
		});

		time += (Date.now() - t0);
		return {
			contents: body.js
		}
	})
}

async function bundle(options){
	if(options instanceof Array){
		for(let config of options){
			bundle(config);
		}
		return;
	}
	options.plugins = [{name: 'imba', setup: plugin.bind(options)}];
	options.resolveExtensions = ['.imba','.imba1','.ts','.mjs','.cjs','.js','.css','.json','.tests'];
	options.target = options.target || ['es2019']; // ['chrome58', 'firefox57', 'safari11', 'edge16'];
	options.bundle = true;

	let res = await require('esbuild').build(options);
	console.log('result from bundle',res);
	console.log('imba took',time);
}

bundle([{
	entryPoints: ['src/compiler/compiler.imba1'],
	outfile: 'dist/compiler.cjs',
	sourcemap: false,
	format: 'cjs',
	platform: 'browser'
},{
	entryPoints: ['src/compiler/compiler.imba1'],
	outfile: 'dist/compiler.mjs',
	sourcemap: false,
	format: 'esm',
	platform: 'browser',
},{
	entryPoints: ['src/compiler/compiler.imba1'],
	outfile: 'dist/compiler.js',
	sourcemap: false,
	format: 'iife',
	globalName: 'imbac',
	platform: 'browser',
},{
	entryPoints: ['src/imba/index.imba'],
	outfile: 'dist/imba.js',
	sourcemap: false,
	format: 'iife',
	platform: 'browser'
},{
	entryPoints: ['src/imba/index.imba'],
	outfile: 'dist/imba.mjs',
	sourcemap: false,
	format: 'esm',
	platform: 'browser'
},{
	entryPoints: ['src/imba/index.imba'],
	outfile: 'dist/imba.min.js',
	minify: true,
	sourcemap: false,
	format: 'iife',
	platform: 'browser'
},{
	entryPoints: ['src/imba/router/router.imba'],
	outfile: 'dist/imba.router.js',
	minify: true,
	sourcemap: false,
	format: 'iife',
	platform: 'browser'
},{
	entryPoints: ['test/spec.imba'],
	outfile: 'dist/imba.spec.js',
	minify: false,
	sourcemap: false,
	format: 'iife',
	platform: 'browser'
}])