const imba1 = require('./bootstrap.compiler.js');
const imba2 = require('./bootstrap.compiler2.js');
const chokidar = require('chokidar');

let helpers = imba2.helpers;
let time = 0;
let argv = helpers.parseArgs(process.argv.slice(2),{
	alias: {w: 'watch'}
})

let meta = Symbol();
let compileCache = {};

function plugin(build){
	// console.log('setting up plugin',build,this);
	let options = this.options;
	let watcher = this.watcher;
	let fs = require('fs');

	build.onLoad({ filter: /\.imba1/ }, async (args) => {
		// console.log('loading imba',args);
		if(watcher) watcher.add(args.path);

		let key = `${args.path}:${options.platform}`
		let raw = await fs.promises.readFile(args.path, 'utf8');
		let cached = compileCache[key];

		if(cached && cached.input == raw){
			// console.log('found cached version',key);
			return {contents: cached.output};
		}
		
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
		compileCache[key] = {input: raw, output: body.js};
		return {contents: body.js}
	})

	build.onLoad({ filter: /\.imba/ }, async (args) => {
		// console.log('loading imba',args);
		if(watcher) watcher.add(args.path);
		let raw = await fs.promises.readFile(args.path, 'utf8');
		let key = `${args.path}:${options.platform}`
		let cached = compileCache[key];

		if(cached && cached.input == raw){
			// console.log('found cached version',key);
			return {contents: cached.output};
		}

		let t0 = Date.now();
		let body = imba2.compile(raw,{
			platform: options.platform || 'browser',
			format: 'esm',
			sourcePath: args.path,
			imbaPath: null
		});

		time += (Date.now() - t0);
		compileCache[key] = {input: raw, output: body.js};

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
	let input = options.entryPoints[0];
	let entry = {options: options}
	let watcher = entry.watcher = argv.watch && chokidar.watch([]);

	options.plugins = [{name: 'imba', setup: plugin.bind(entry)}];
	options.resolveExtensions = ['.imba','.imba1','.ts','.mjs','.cjs','.js','.css','.json','.tests'];
	options.target = options.target || ['es2019']; // ['chrome58', 'firefox57', 'safari11', 'edge16'];
	options.bundle = true;
	options.incremental = !!watcher;
	options.logLevel = 'info';
	
	let result = await require('esbuild').build(options);
	if(watcher){
		watcher.on('change',async ()=>{
			console.log('rebuilding',input);
			let rebuilt = await result.rebuild();
			console.log('rebuilt',input);
		})
	}
	console.log(`built ${input}`);
}

// 

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