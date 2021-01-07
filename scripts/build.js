const imba1 = require('./bootstrap.compiler.js');
const imba2 = require('./bootstrap.compiler2.js');
const chokidar = require('chokidar');
const fs = require('fs');
const np = require('path');

let helpers = imba2.helpers;
let time = 0;
let argv = helpers.parseArgs(process.argv.slice(2),{
	alias: {w: 'watch'}
})

let meta = Symbol();
let compileCache = {};

let defaults = {
	paths: {

	}
}

function plugin(build){
	// console.log('setting up plugin',build,this);
	let options = this.options;
	let self = this;
	let watcher = this.watcher;
	let fs = require('fs');
	let basedir = np.resolve(__dirname,'..');
	let outdir = options.outdir || np.dirname(options.outfile);
	let distdir = np.resolve(__dirname,'..','dist')
	let distrel = './' + np.relative(distdir,outdir);
	let absoutdir = np.resolve(__dirname,'..',outdir);

	function relative(path){
		let res = np.relative(absoutdir,np.resolve(basedir,path));
		if(res[0] != '.') res = './' + res;
		return res;
	}

	build.onResolve({filter: /^dist\//}, (p) => {
		return {path: relative(p.path), external: true}
	});

	build.onResolve({filter: /^compiler1?$/}, (p) => {
		// find the output dir
		console.log('resolve compiler?',p,options);
		let src = p.path == 'compiler1' ? "../scripts/bootstrap.compiler.js" : "./compiler.cjs";
		return {path: src, external: true}
	});

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
		let body = imba2.compile(raw,Object.assign({
			platform: options.platform || 'browser',
			format: 'esm',
			sourcePath: args.path,
		},self.imbaOptions));

		time += (Date.now() - t0);
		compileCache[key] = {input: raw, output: body.js};

		return {
			contents: body.js
		}
	})
}

async function bundle(o){
	if(o instanceof Array){
		for(let config of o){
			bundle(config);
		}
		return;
	}
	let input = o.entryPoints[0];
	let entry = {options: o}
	let watcher = entry.watcher = argv.watch && chokidar.watch([]);
	let name = np.basename(input).replace(/\.imba1?$/,'');

	if(name == 'index'){
		name = np.basename(np.dirname(input));
	}

	entry.imbaOptions = o.options || {};

	o.plugins = [{name: 'imba', setup: plugin.bind(entry)}];

	if(o.platform == 'node'){
		o.resolveExtensions = ['.node.imba','.imba','.imba1','.ts','.mjs','.cjs','.js','.css','.json'];
	} else {
		o.resolveExtensions = ['.web.imba','.imba','.imba1','.ts','.mjs','.cjs','.js','.css','.json'];
	}

	if(!o.outdir && !o.outfile){
		o.outdir = `dist/${o.platform}`;
	}
	

	o.target = o.target || ['es2019'];
	if(o.bundle == undefined) o.bundle = true;
	o.loader = {'.txt':'text'}
	o.incremental = !!watcher;
	o.logLevel = 'info';

	delete o.options;
	
	let result = await require('esbuild').build(o);
	if(watcher){
		watcher.on('change',async ()=>{
			console.log('rebuilding',input);
			let rebuilt = await result.rebuild();
			console.log('rebuilt',input);
		})
	}
	console.log(`built ${input} to ${o.outfile}`);
}

let universal = function(entrypoint,name){
	let versions = [];

	let add = function(o){
		let ext = o.format == 'esm' ? 'mjs' : 'js';

		versions.push({
			entryPoints: [entrypoint],
			outfile: `dist/${o.platform}/${name}.${ext}`,
			format: o.format,
			platform: o.platform
		})
	}
	
	add({platform: 'node', format: 'esm'});
	add({platform: 'node', format: 'cjs'});
	add({platform: 'browser', format: 'esm'});
	add({platform: 'browser', format: 'cjs'});
	
	return versions;
}

let bundles = [{
// 	entryPoints: ['src/compiler/compiler.imba1'],
// 	outfile: 'dist/compiler.cjs',
// 	format: 'cjs',
// 	platform: 'browser'
// },{
// 	entryPoints: ['src/compiler/compiler.imba1'],
// 	outfile: 'dist/compiler.mjs',
// 	format: 'esm',
// 	platform: 'browser',
// },{
// 	entryPoints: ['src/compiler/compiler.imba1'],
// 	outfile: 'dist/compiler.js',
// 	format: 'iife',
// 	globalName: 'imbac',
// 	platform: 'browser',
// },{
// 	entryPoints: ['src/compiler/compiler.imba1'],
// 	outfile: 'dist/browser/compiler.js',
// 	format: 'esm',
// 	platform: 'browser'
// },{
	entryPoints: ['src/imba/imba.imba'],
	outfile: 'dist/browser/imba.iife.js',
	format: 'iife',
	globalName: 'imba',
	platform: 'browser'
},{
	entryPoints: ['src/imba/imba.imba'],
	outfile: 'dist/browser/imba.js',
	format: 'esm',
	globalName: 'imba',
	platform: 'browser',
	minify: false
},{
	entryPoints: ['src/imba/imba.imba'],
	outfile: 'dist/node/imba.js',
	format: 'cjs',
	platform: 'node',
	minify: false
},{

	entryPoints: ['test/spec.imba'],
	outfile: 'dist/browser/spec.js',
	minify: false,
	format: 'esm',
	bundle: false,
	options: {runtime: './imba.js'},
	platform: 'browser'
},{
	entryPoints: ['src/bundler/worker.imba'],
	outfile: 'dist/compiler-worker.js',
	minify: false,

	format: 'cjs',
	external: ['chokidar','esbuild'],
	platform: 'node'
},{
	entryPoints: ['src/bin/imba.imba'],
	outbase: 'src/bin',
	outdir: 'dist/bin',
	minify: false,
	sourcemap: false,
	format: 'cjs',
	external: ['chokidar','esbuild'],
	platform: 'node'
},{
	entryPoints: ['register.imba'],
	outdir: '.',
	sourcemap: false,
	format: 'cjs',
	external: ['imba'],
	platform: 'node'
}];

bundles.push(...universal('src/program/index.imba','program'));

bundles.push(...universal('src/compiler/compiler.imba1','compiler'));


bundle(bundles)