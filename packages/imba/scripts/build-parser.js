const fs = require('fs');

async function bundle(options){
	options.resolveExtensions = ['.mjs','.imba','.ts','.cjs','.js','.css','.json'];
	options.target = options.target || ['es2020']; // ['chrome58', 'firefox57', 'safari11', 'edge16'];
	options.bundle = true;

	let res = await require('esbuild').build(options);
    var parser = require('../build/grammar.js').parser;
    fs.writeFileSync(__dirname + "/../build/parser.js", parser.generate());
    console.log('built parser');

}

bundle({
	entryPoints: ['src/compiler/grammar.mjs'],
	outfile: 'build/grammar.js',
	sourcemap: false,
	format: 'cjs',
	platform: 'node'
})
