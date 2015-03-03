(function(){
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; }
function promise$(a){ return a instanceof Array ? Promise.all(a) : (a && a.then ? a : Promise.resolve(a)); }
var cli = require('commander');
var fs = require('fs');
var path = require('path');
var compiler = require('./compiler');
var chalk = require('chalk');
var chokidar = require('chokidar');


var tasks = require('./tasks');


var fspath = path;

function log(){
	var $0 = arguments, i = $0.length;
	var pars = new Array(i>0 ? i : 0);
	while(i>0) pars[i-1] = $0[--i];
	return console.log.apply(console,pars);
};
function ts(){
	var d = new Date().toISOString().substr(11,8);
	return chalk.dim(d);
};
function b(){
	var $0 = arguments, i = $0.length;
	var pars = new Array(i>0 ? i : 0);
	while(i>0) pars[i-1] = $0[--i];
	return chalk.bold.apply(chalk,pars);
};
function printTokens(tokens){
	for(var i=0, ary=iter$(tokens), len=ary.length, t, res=[]; i < len; i++){
		t = ary[i];
		var typ = t[0];
		var id = t[1];
		
		if(id == '\n') {
			res.push("\n");
			continue;
		};
		res.push((id == typ) ? (chalk.red(id)) : (id = chalk.white(id), chalk.grey(("[" + typ + " " + id + "]"))));
	};
	var strings = res;
	return log(strings.join(' '));
};
function ensureDir(path){
	if(fs.existsSync(path)) {
		return true;
	};
	var parts = path.split(fspath.sep);
	for(var i=0, ary=iter$(parts), len=ary.length; i < len; i++){
		var path = fspath.sep + fspath.join.apply(fspath,parts.slice(0,i + 1));
		if(fs.existsSync(path)) {
			var stat = fs.statSync(path);
		} else {
			if(ary[i].match(/\.(imba|js)$/)) {
				true;
			} else {
				fs.mkdirSync(path);
				log(chalk.green(("+ mkdir " + path)));
			}
		};
	};
	return;
};
function sourcefileForPath(path){
	path = fspath.resolve(process.cwd(),path);
	return new compiler.SourceFile(path);
};
function writeFile(source,outpath){
	ensureDir(outpath);
	source.dirty();
	return source.write(outpath).then(function (){
		var srcp = fspath.relative(process.cwd(),source.path());
		var outp = fspath.relative(process.cwd(),outpath);
		return log(ts(),chalk.dim.grey(("compiled " + (b(chalk.white(srcp))) + " to " + (b(chalk.white(outp))))));
	});
};
function cliCompile(root,o,pars){
	if(!pars||pars.constructor !== Object) pars = {};
	var watch = pars.watch !== undefined ? pars.watch : false;
	var base = fspath.resolve(process.cwd(),root);
	var basedir = base;
	var exists = fs.existsSync(base);
	var stat = fs.statSync(base);
	var isFile = false;
	
	if(stat.isDirectory()) {
		log(("dirname " + (fspath.dirname(base)) + " " + base));
		if(watch) {
			log(chalk.magenta(("--- watch dir: " + (b(base)))));
		};
	} else {
		isFile = true;
		basedir = fspath.dirname(base);
		if(watch) {
			log(chalk.magenta(("--- watch file: " + (b(base)))));
		};
	};
	var dirs = basedir.split(fspath.sep);
	var out = (o.output) ? (fspath.resolve(process.cwd(),o.output)) : (basedir);
	var outdir = out;
	
	if(!(o.output)) {
		var srcIndex = dirs.indexOf('src');
		if(srcIndex >= 0) {
			dirs[srcIndex] = 'lib';
			var libPath = fspath.sep + fspath.join.apply(fspath,dirs);
			var libExists = fs.existsSync(libPath);
			outdir = out = libPath;
			if(watch) {
				log(chalk.blue(("--- found dir: " + (b(libPath)))));
			};
		};
	};
	log(chalk.blue(("--- write dir: " + (b(out)))));
	var sources = {};
	
	var watcher = chokidar.watch(base,{ignored: /[\/\\]\./,persistent: watch});
	
	watcher.on('all',function (event,path){
		var realpath, source, $1, destpath;
		return (path.match(/\.imba$/)) && (realpath = fspath.resolve(process.cwd(),path), source = sources[($1=realpath)] || (sources[$1] = sourcefileForPath(realpath)), destpath = source.path().replace(/\.imba$/,'.js'), destpath = destpath.replace(basedir,outdir), writeFile(source,destpath));
	});
	return this;
};
cli.version('0.6.0').option('--join [FILE]','concatenate the source Imba before compiling').option('-v, --version','display the version number');
cli.command('* <path>').usage('<path>').description('run imba').action(function (path,o){
	var file = sourcefileForPath(path);
	return file.run();
});
cli.command('compile <path>').description('compile scripts').option('-o, --output [dest]','set the output directory for compiled JavaScript').action(function (path,o){
	return cliCompile(path,o,{watch: false});
});
cli.command('watch <path>').description('listen for changes and compile scripts').option('-o, --output [dest]','set the output directory for compiled JavaScript').action(function (root,o){
	return cliCompile(root,o,{watch: true});
});
cli.command('analyze <path>').description('get information about scopes, variables and more').option('-v, --verbose','return detailed output').action(function (path,opts){
	var file = sourcefileForPath(path);
	return promise$(file.analyze()).then(function (meta){
		return log(JSON.stringify(meta));
	});
});
cli.command('dev <task>').description('commands for imba-development').action(function (cmd,o){
	return (tasks[cmd] instanceof Function) ? (tasks[cmd](o)) : (log(chalk.red(("could not find task " + (b(cmd))))));
});
function run(argv){
	var res;
	return res = cli.parse(argv);
}; exports.run = run;
}())