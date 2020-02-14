var fs = require('fs');
var path = require('path');
var compiler = require('./bootstrap.compiler');
const webpack = require('webpack');
var dist = path.resolve(__dirname,'..','dist');
var tmp = path.resolve(__dirname,'..','build');
var src = path.resolve(__dirname,'..','src');

let showHelp = process.argv.filter(x => x.includes('--help') || x.includes('-h')).length > 0

if (showHelp) {
	console.log(`The Imba bootstraping script

	USAGE
		node ./scripts/bootstrap.sh

	ENVIRONMENT VARIABLES
	By default they are not set so setting them to something is enough to turn them on.
		- VERBOSE=false - make the script be more silent set.
    		- IGNORE_FS_ERRORS=false - don't show fs exceptions.
    		- RESET=false - destroy the dist directory.
`)
	process.exit(0);
}

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

const inform = (arguments) => {
	if (!process.env.VERBOSE) {
		return;
	}
	console.log('INFO', arguments);
}

const ensureExists = (thePath) => {
	if (!fs.existsSync(thePath)) {
		try{ 
			fs.mkdirSync(thePath); 
		} catch(e) {
			console.error(e);

			if (process.env.IGNORE_FS_ERRORS != false) {
				process.exit(1);
			}
		}
	}

}

async function main(){
	inform('checking for the dist path', dist);
	if(fs.existsSync(dist)) { 
		inform('dist directory already present');
		if (!process.env.RESET) {
			inform('aborting, to override run with environment RESET=true');
			process.exit(0); 
		} else {
			console.log('removing the dist path', dist)
			/* Note the below only works as of 12.10.0 */
			// Reference: https://stackoverflow.com/questions/18052762/remove-directory-which-is-not-empty
			fs.rmdirSync(dist, { recursive: true })
		}
	}

	inform('creating the dist directory', dist);
	ensureExists(dist);
	inform('creating the tmp directory', tmp);
	ensureExists(tmp);

	inform('make sure we generate the initial parser and all that');
	inform('compile grammar')
	var res = await pack({
		entry: src + "/compiler/grammar.imba1",
		mode: 'none',
		output: {filename: './grammar.js', path: tmp}
	});

	inform('Generate the parser');
	var parser = require(tmp + '/grammar.js').parser
	fs.writeFileSync(tmp + "/parser.js", parser.generate());

	await pack({
		entry: src + "/compiler/compiler.imba1",
		output: {filename: './compiler.js'}
	});

	process.exit(0);
}

main();
