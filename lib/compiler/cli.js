(function(){


	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	var cli = require('commander');
	var fs = require('fs');
	var path = require('path');
	var chalk = require('chalk');
	
	var tasks = require('./tasks');
	var compiler = require('./compiler');
	
	var fspath = path;
	
	var T = require('./token');
	
	var parser = compiler.parser;
	
	
	// really?
	// wrapper for files?
	/* @class SourceFile */
	function SourceFile(path){
		this._path = path;
		this._code = null;
		this._js = null;
		this;
	};
	
	
	SourceFile.prototype.__path = {};
	SourceFile.prototype.path = function(v){ return this._path; }
	SourceFile.prototype.setPath = function(v){ this._path = v; return this; };
	// prop code
	// prop tokens
	// prop ast
	
	SourceFile.prototype.__meta = {};
	SourceFile.prototype.meta = function(v){ return this._meta; }
	SourceFile.prototype.setMeta = function(v){ this._meta = v; return this; };
	// prop js
	
	
	
	SourceFile.prototype.name = function (){
		return path.split("/").pop();// for testing
	};
	
	SourceFile.prototype.code = function (){
		return this._code || (this._code = fs.readFileSync(this._path,"utf8"));
	};
	
	SourceFile.prototype.tokens = function (){
		return this._tokens || (this._tokens = compiler.tokenize(this.code()));
	};
	
	SourceFile.prototype.ast = function (){
		return this._ast || (this._ast = parser.parse(this.tokens()));
	};
	
	SourceFile.prototype.js = function (o){
		if(o === undefined) o = {};
		return this._js || (this._js = this.ast().compile(o));
	};
	
	SourceFile.prototype.write = function (outpath,cb){
		return fs.writeFile(outpath,this.js(),cb);
	};
	
	SourceFile.prototype.dirty = function (){
		this._code = this._js = this._tokens = this._ast = this._meta = null;
		this._read = this._tokenize = this._compile = this._parse = this._analyze = null;
		return this;
	};
	
	// could analyze with different options - caching promise might not be the
	// best approach for this.
	SourceFile.prototype.analyze = function (cb){
		if(this._meta) {
			cb && cb(this._meta);
			return this._meta;
		};
		
		STACK._loglevel = 0;// not here?
		var errors = [];
		var err = null;
		var data = {};
		
		try {
			this._meta = this.ast().analyze({});
			cb && cb(this._meta);
			// resolve(self.meta)
		}
		catch (e) {
			console.log(("ERROR " + (e.message)));
		}
		;
		
		return this._meta;
	};
	
	SourceFile.prototype.run = function (){
		return compiler.run(this.code(),{filename: this._path});
	};
	
	
	
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
		for(var i=0, ary=iter$(tokens), len=ary.length, t, res=[]; i < len; i++) {
			t = ary[i];var typ = T.typ(t);
			var id = T.val(t);
			
			if(typ == 'TERMINATOR') {
				res.push("[" + chalk.yellow(id.replace(/\n/g,"\\n")) + "]");continue;
			};
			
			res.push((id == typ) ? (
				"[" + chalk.red(id) + "]"
			) : (
				id = chalk.white(id),
				chalk.grey(("[" + typ + " " + id + "]"))
			));
		};var strings = res;
		
		return log(strings.join(' '));
	};
	
	
	function ensureDir(path){
		if(fs.existsSync(path)) {
			return true;
		};
		var parts = path.split(fspath.sep);
		for(var i=0, ary=iter$(parts), len=ary.length; i < len; i++) {
			var path = fspath.sep + fspath.join.apply(fspath,parts.slice(0,i + 1));
			if(fs.existsSync(path)) {
				var stat = fs.statSync(path);
			} else if(ary[i].match(/\.(imba|js)$/)) {
				true;
			} else {
				fs.mkdirSync(path);
				log(chalk.green(("+ mkdir " + path)));
			};
		};
		return;
	};
	
	
	function sourcefileForPath(path){
		path = fspath.resolve(process.cwd(),path);
		return new SourceFile(path);
	};
	
	function writeFile(source,outpath){
		ensureDir(outpath);
		// var outpath = source.path.replace(/\.imba$/,'.js')
		// destpath = destpath.replace(basedir,outdir)
		source.dirty();
		
		var srcp = fspath.relative(process.cwd(),source.path());
		var outp = fspath.relative(process.cwd(),outpath);
		
		log(ts(),chalk.dim.grey(("compile " + (b(chalk.white(srcp))) + " to " + (b(chalk.white(outp))))));
		
		// log "made dirty"
		// log ts, chalk:dim.grey "will compile {source.path}"
		return source.write(outpath,function (err,res){
			return true;
			// var srcp = fspath.relative(process.cwd,source.path)
			// var outp = fspath.relative(process.cwd,outpath)
			// log ts, chalk:dim.grey "compiled {b chalk.white srcp} to {b chalk.white outp}"
		});
	};
	
	
	// shared action for compile and watch
	function cliCompile(root,o,pars){
		if(!pars||pars.constructor !== Object) pars = {};
		var watch = pars.watch !== undefined ? pars.watch : false;
		var chokidar = require('chokidar');
		
		var base = fspath.resolve(process.cwd(),root);
		var basedir = base;
		var exists = fs.existsSync(base);
		var stat = fs.statSync(base);
		var isFile = false;
		
		if(stat.isDirectory()) {
			log(("dirname " + (fspath.dirname(base)) + " " + base));
			// base += fspath:sep unless fspath.dirname(base) == base
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
		
		// what if it does not exist
		// log "stat",stat
		
		var dirs = basedir.split(fspath.sep);
		var out = (o.output) ? (fspath.resolve(process.cwd(),o.output)) : (basedir);
		var outdir = out;
		
		if(!(o.output)) {
			var srcIndex = dirs.indexOf('src');
			if(srcIndex >= 0) {
				dirs[srcIndex] = 'lib';
				var libPath = fspath.sep + fspath.join.apply(fspath,dirs);
				// absolute paths here?
				var libExists = fs.existsSync(libPath);
				outdir = out = libPath;
				if(watch) {
					log(chalk.blue(("--- found dir: " + (b(libPath)))));
				};
			};
		};
		
		log(chalk.blue(("--- write dir: " + (b(out)))));
		// log chalk:bold.blue "--- write dir: {out}"
		// want to respect the output-place
		var sources = {};
		
		var watcher = chokidar.watch(base,{ignored: /[\/\\]\./,persistent: watch});
		
		watcher.on('all',function (event,path){
			var realpath, source, $1, destpath;
			return (path.match(/\.imba$/) && event == 'add' || event == 'change') && (
				realpath = fspath.resolve(process.cwd(),path),
				source = sources[($1=realpath)] || (sources[$1] = sourcefileForPath(realpath)),
				destpath = source.path().replace(/\.imba$/,'.js'),
				destpath = destpath.replace(basedir,outdir),
				// should supply the dir
				// log "write file {destpath}"
				writeFile(source,destpath)
			);
		});
		return this;
	};
	
	
	cli.version('0.7.2').option('--join [FILE]','concatenate the source Imba before compiling').option('-v, --version','display the version number');
	
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
	
	// .option('--poll', 'useful for successfully watching files over a network')
	
	cli.command('analyze <path>').description('get information about scopes, variables and more').option('-v, --verbose','return detailed output').option('-t, --tokens','return detailed output').action(function (path,opts){
		var file = sourcefileForPath(path);
		
		return (opts.tokens) ? (
			printTokens(file.tokens())
		) : (
			file.analyze(function (meta){
				return log(JSON.stringify(meta));
			})
		);
	});
	
	// .option('-f, --format <format>', 'format of output', 'json', /^(json|plain|html)$/i)	
	
	cli.command('dev <task>').description('commands for imba-development').action(function (cmd,o){
		return (tasks[cmd] instanceof Function) ? (
			tasks[cmd](o)
		) : (
			log(chalk.red(("could not find task " + (b(cmd)))))
		);
	});
	
	// .option('--poll', 'useful for successfully watching files over a network')
	
	
	
	function run(argv){
		var res;
		return res = cli.parse(argv);
		// console.log(cli.name)
		// console.log res.name
		// console.log "herel"
	}; exports.run = run;


}())