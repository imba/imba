const imba2 = require('../dist/compiler.cjs');
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
	let self = this;
	let watcher = this.watcher;
	let fs = require('fs');

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
			imbaPath: self.imbaPath || null
		});

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

	entry.imbaPath = o.imbaPath;
	o.plugins = [{name: 'imba', setup: plugin.bind(entry)}];
	o.target = o.target || ['es2019'];
	o.bundle = true;
	o.loader = {'.txt':'text'}
	o.incremental = !!watcher;
	o.logLevel = 'info';

	delete o.imbaPath;
	
	let result = await require('esbuild').build(o);
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
	entryPoints: ['runtime/index.imba'],
	outfile: 'dist/runtime.web.mjs',
	sourcemap: false,
	format: 'esm',
	resolveExtensions: ['.web.imba','.imba','.ts','.mjs','.cjs','.js'],
	platform: 'browser'
},{
	entryPoints: ['runtime/index.imba'],
	outfile: 'dist/runtime.node.cjs',
	resolveExtensions: ['.node.imba','.imba','.ts','.mjs','.cjs','.js'],
	sourcemap: false,
	format: 'cjs',
	platform: 'node'
},{
	entryPoints: ['runtime/index.imba'],
	outfile: 'dist/runtime.node.mjs',
	resolveExtensions: ['.node.imba','.imba','.ts','.mjs','.cjs','.js'],
	sourcemap: false,
	format: 'esm',
	platform: 'node'
}])