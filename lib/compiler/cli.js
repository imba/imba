(function(){


	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	// externs;
	
	var fs = require('fs');
	var path = require('path');
	var cli = require('commander');
	var chalk = require('chalk');
	
	var orig = cli.helpInformation;
	var cliproto = cli.constructor.prototype;
	
	var ERR = require('./errors');
	
	cliproto.helpInformation = function (){
		var str = orig.call(this);
		
		str = str.replace(/(Options|Usage|Examples|Commands)\:/g,function(m) {
			return chalk.bold(m);
		});
		return str;
		// return "TTOT {str}"
	};
	
	// override cli to add color
	cli.optionHelp2 = function (){
		var out;
		var width = this.largestOptionLength();
		// Prepend the help information
		return out = "TATATA";
		// return [pad('-h, --help', width) + '  ' + 'output usage information']
		//   .concat(this.options.map(function(option) {
		//     return pad(option.flags, width) + '  ' + option.description;
		//     }))
		//   .join('\n');
	};
	
	
	
	// console.time("compiler")
	var tasks = require('./tasks');
	var compiler = require('./compiler');
	var fspath = path;
	var T = require('./token');
	// console.timeEnd("compiler")
	
	var parser = compiler.parser;
	
	// really?
	// wrapper for files?
	// this caches an awful lot now - no need before we introduce a shared worker++
	/* @class SourceFile */
	function SourceFile(path){
		this._path = path;
		this._code = null;
		this._js = null;
		this;
	};
	
	
	SourceFile.prototype.__path = {name: 'path'};
	SourceFile.prototype.path = function(v){ return this._path; }
	SourceFile.prototype.setPath = function(v){ this._path = v; return this; };
	
	SourceFile.prototype.__meta = {name: 'meta'};
	SourceFile.prototype.meta = function(v){ return this._meta; }
	SourceFile.prototype.setMeta = function(v){ this._meta = v; return this; };
	
	
	
	SourceFile.prototype.name = function (){
		return path.split("/").pop(); // for testing
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
		// promise.new do |resolve|
		// await self.compile
		return fs.writeFileSync(outpath,this.js());
	};
	
	SourceFile.prototype.dirty = function (){
		// console.log "marking file as dirty!"
		// simply removing all info abou tfiles
		this._prevcode = this._code;
		this._code = this._js = this._tokens = this._ast = this._meta = null;
		this._read = this._tokenize = this._compile = this._parse = this._analyze = null;
		return this;
	};
	
	// could analyze with different options - caching promise might not be the
	// best approach for this.
	SourceFile.prototype.analyze = function (cb){
		if (this._meta) {
			cb && cb(this._meta);
			return this._meta;
		};
		
		// STACK:_loglevel = 0 # not here?
		var errors = [];
		var err = null;
		var data = {};
		
		try {
			this._meta = this.ast().analyze({loglevel: 0});
			cb && cb(this._meta);
			// resolve(self.meta)
		} catch (e) {
			// console.log "something wrong {e:message}"
			if (!((e instanceof ERR.ImbaParseError))) {
				if (e.lexer) {
					e = new ERR.ImbaParseError(e,{tokens: e.lexer.tokens,pos: e.lexer.pos});
				} else {
					throw e;
					// e = {message: e:message}
				};
			};
			
			
			this._meta = {warnings: [e]};
			cb && cb(this._meta);
		};
		
		return this._meta;
	};
	
	SourceFile.prototype.run = function (){
		return compiler.run(this.code(),{filename: this._path});
	};
	
	SourceFile.prototype.htmlify = function (){
		var out = compiler.highlight(this.code(),{filename: this._path});
		fs.writeFileSync(this._path.replace(/\.imba$/,'.html'),out);
		console.log("htmlify code",out);
		return out;
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
	
	function dim(){
		return chalk.dim;
	};
	
	function puts(str){
		return process.stdout.write(str);
	};
	
	function print(str){
		return process.stdout.write(str);
	};
	
	
	function printTokens(tokens){
		for (var strings = [], i=0, ary=iter$(tokens), len=ary.length, t; i < len; i++) {
			t = ary[i];var typ = T.typ(t);
			var id = T.val(t);
			
			if (typ == 'TERMINATOR') {
				strings.push("[" + chalk.yellow(id.replace(/\n/g,"\\n")) + "]");continue;
			};
			
			strings.push(id == typ ? (
				"[" + chalk.red(id) + "]"
			) : (
				id = chalk.white(id),
				chalk.grey(("[" + typ + " " + id + "]"))
			));
		};
		
		return log(strings.join(' '));
	};
	
	
	function ensureDir(path){
		if (fs.existsSync(path)) { return true };
		var parts = path.split(fspath.sep);
		for (var i=0, ary=iter$(parts), len=ary.length; i < len; i++) {
			// what about relative paths here? no good? might be important for symlinks etc no?
			var path = fspath.sep + fspath.join.apply(fspath,parts.slice(0,i + 1));
			if (fs.existsSync(path)) {
				var stat = fs.statSync(path);
			} else if (ary[i].match(/\.(imba|js)$/)) {
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
	
	function printCompilerError(e,pars){
		//  return printError(e,source: source)
		if(!pars||pars.constructor !== Object) pars = {};
		var source = pars.source !== undefined ? pars.source : null;
		console.log(("error " + e));
		var lex = e.lexer;
		var tok = lex && lex.yytext;
		var src = source && source.code();
		var lines = src && src.split(/\n/g);
		var tokens = lex && lex.tokens;
		
		// log "OH NOH"
		
		var lnum = function(l,color) {
			if(color === undefined) color = 'grey';
			var s = String(l + 1);
			while (s.length < 6){
				s = ' ' + s;
			};
			return dim()[color]('    ' + s + '  ');
		};
		
		
		function printLn(nr,errtok){
			var tok, fmt;
			var pos = lex.pos;
			var ln = lines[nr];
			var prefix = lnum(nr,errtok ? ('red') : ('grey'));
			
			if (!ln) { return log(prefix) };
			
			// log lnum(nr)
			
			var colors = {
				NUMBER: chalk.blue,
				STRING: chalk.green,
				KEYWORD: chalk.gray,
				PUNCTUATION: chalk.white,
				IDENTIFIER: chalk.bold,
				ERR: chalk.bold.red.underline
			};
			
			// first get the pos up to the wanted line
			while (tok = tokens[++pos]){
				if (tok._line > nr) { break };
			};
			
			while (tok = tokens[--pos]){
				if (tok._col == -1) { continue }; // generated
				
				var l = tok._line;
				// log "looping token {tok.@line} {tok.@col}"
				if (l > nr) { continue };
				if (l < nr) { break };
				// log "breakign at line {tok.@line}"
				// log "highlight {tok.@type}"
				var typ = tok._type;
				var col = tok._col;
				var len = tok._len || tok._value.length;
				
				if (typ.length > 1 && typ == tok._value.toUpperCase()) { typ = 'KEYWORD' };
				if (typ.match(/^[\[\]\{\}\(\)\,]/)) { typ = 'PUNCTUATION' };
				if (tok == errtok) {
					typ = 'ERR';
				};
				
				if (fmt = colors[typ]) {
					ln = ln.substr(0,col) + fmt(ln.substr(col,len)) + ln.slice(col + len);
				};
			};
			
			log(prefix + ln);
			
			return;
		};
		
		
		
		// select the lines to show
		// go backwards in tokenlist and colorize the string if type
		// try first on the single line
		// var character = src.charAt(tok.@loc)
		// var c2 = lines[tok.@line].charAt(tok.@col + 1)
		
		log(" - " + chalk.red(e.message)); // + character + c2
		
		
		if (tok && src) {
			log(chalk.grey("    ------") + "  ------------------");
			lines = src.split(/\n/g);
			
			// find the closest non-generated token to show error
			var tpos = tokens.indexOf(tok);
			while (tok && tok._col == -1){
				tok = tokens[--tpos];
			};
			
			var ln = tok._line;
			var col = tok._col;
			
			printLn(ln - 3);
			printLn(ln - 2);
			printLn(ln - 1);
			printLn(ln,tok);
			printLn(ln + 1);
			log(chalk.grey("    ------") + "  ------------------");
			// log ln,col
		};
		return;
	};
	
	
	
	function writeFile(source,outpath){
		ensureDir(outpath);
		// var outpath = source.path.replace(/\.imba$/,'.js')
		// destpath = destpath.replace(basedir,outdir)
		if (!(source.dirty())) { return };
		
		var srcp = fspath.relative(process.cwd(),source.path());
		var outp = fspath.relative(process.cwd(),outpath);
		
		var str = ts() + " " + chalk.dim.grey(("compile " + (b(chalk.white(srcp))) + " to " + (b(chalk.white(outp)))));
		// console.log ts, str
		print(str);
		
		// log "made dirty"
		// log ts, chalk:dim.grey "will compile {source.path}"
		try {
			var start = Date.now();
			var code = compiler.compile(source.code(),{filename: source.path()});
			var time = Date.now() - start;
			print(" - " + chalk.dim.grey(("" + time + "ms")) + "\n");
			fs.writeFileSync(outpath,code);
		} catch (e) {
			// print " - " + chalk:dim.red("failed") + "\n"
			printCompilerError(e,{source: source}); // e:message + "\n"
		};
		return;
		
		//  do |err,res|
		// 	log "compiled \r"
		// 	true
		// 	# var srcp = fspath.relative(process.cwd,source.path)
		// 	# var outp = fspath.relative(process.cwd,outpath)
		// 	# log ts, chalk:dim.grey "compiled {b chalk.white srcp} to {b chalk.white outp}"
	};
	
	
	// shared action for compile and watch
	function cliCompile(root,o,pars){
		
		if(!pars||pars.constructor !== Object) pars = {};
		var watch = pars.watch !== undefined ? pars.watch : false;
		var base = fspath.resolve(process.cwd(),root);
		var basedir = base;
		var exists = fs.existsSync(base);
		var stat = fs.statSync(base);
		var isFile = false;
		
		if (stat.isDirectory()) {
			log(("dirname " + (fspath.dirname(base)) + " " + base));
			// base += fspath:sep unless fspath.dirname(base) == base
			if (watch) { log(chalk.magenta(("--- watch dir: " + (b(base))))) };
		} else {
			isFile = true;
			basedir = fspath.dirname(base);
			if (watch) { log(chalk.magenta(("--- watch file: " + (b(base))))) };
		};
		
		// what if it does not exist
		// log "stat",stat
		
		var dirs = basedir.split(fspath.sep);
		var out = o.output ? (fspath.resolve(process.cwd(),o.output)) : (basedir);
		var outdir = out;
		
		if (!(o.output)) {
			var srcIndex = dirs.indexOf('src');
			if (srcIndex >= 0) {
				dirs[srcIndex] = 'lib';
				var libPath = fspath.sep + fspath.join.apply(fspath,dirs);
				// absolute paths here?
				var libExists = fs.existsSync(libPath);
				outdir = out = libPath;
				// log chalk.blue "--- found dir: {b libPath}" if watch
			};
		};
		
		// compiling a single file - no need to require chokidar at all
		if (isFile && !watch) {
			var source = sourcefileForPath(base);
			var destpath = source.path().replace(/\.imba$/,'.js').replace(basedir,outdir);
			writeFile(source,destpath);
			return;
		};
		
		log(chalk.blue(("--- write dir: " + (b(out)))));
		
		var sources = {};
		
		// it is bad practice to require modules inside methods, but chokidar takes
		// some time to load, and we really dont want that for single-file compiles
		var chokidar = require('chokidar');
		var watcher = chokidar.watch(base,{ignored: /[\/\\]\./,persistent: watch});
		
		watcher.on('all',function(event,path) {
			// need to fix on remove as well!
			// log "watcher {event} {path}"
			if (path.match(/\.imba$/) && (event == 'add' || event == 'change')) {
				var realpath = fspath.resolve(process.cwd(),path);
				var source = sources[($1=realpath)] || (sources[$1] = sourcefileForPath(realpath));
				var destpath = source.path().replace(/\.imba$/,'.js');
				destpath = destpath.replace(basedir,outdir);
				// should supply the dir
				// log "write file {destpath}"
				return writeFile(source,destpath);
			};
		});
		return;
	};
	
	
	cli.version('0.8.0');
	
	cli.command('* <path>').usage('<path>').description('run imba').action(function(path,o) {
		var file = sourcefileForPath(path);
		return file.run();
	});
	
	
	cli.command('compile <path>').description('compile scripts').option('-o, --output [dest]','set the output directory for compiled JavaScript').action(function(path,o) {
		return cliCompile(path,o,{watch: false});
	});
	
	cli.command('watch <path>').description('listen for changes and compile scripts').option('-o, --output [dest]','set the output directory for compiled JavaScript').action(function(root,o) {
		return cliCompile(root,o,{watch: true});
	});
	
	cli.command('analyze <path>').description('get information about scopes, variables and more').option('-v, --verbose','return detailed output').option('-t, --tokens','return detailed output').action(function(path,opts) {
		var file = sourcefileForPath(path);
		
		if (opts.tokens) {
			// log "tokens"
			return printTokens(file.tokens());
		} else {
			return file.analyze(function(meta) {
				return log(JSON.stringify(meta));
			});
		};
	});
	
	cli.command('export <path>').description('create highlighted snippet of script').option('-v, --verbose','return detailed output').option('-t, --tokens','return detailed output').action(function(path,opts) {
		var file = sourcefileForPath(path);
		var out = file.htmlify(); // do |meta| log JSON.stringify(meta)
		log(JSON.stringify(out));
		return;
	});
	
	
	// .option('-f, --format <format>', 'format of output', 'json', /^(json|plain|html)$/i)	
	
	cli.command('dev <task>').description('commands for imba-development').action(function(cmd,o) {
		if (tasks[cmd] instanceof Function) {
			return tasks[cmd](o);
		} else {
			return log(chalk.red(("could not find task " + (b(cmd)))));
		};
	});
	
	// .option('--poll', 'useful for successfully watching files over a network')
	
	// cli.on('--help') do
	// 	console.log('  Examples:')
	// 	console.log('')
	// 	console.log('    $ custom-help --help')
	// 	console.log('    $ custom-help -h')
	// 	console.log('')
	
	function run(argv){
		var res = cli.parse(argv);
		
		if (!(process.argv.slice(2).length)) {
			return cli.outputHelp();
		};
		
		// console.log(cli.name)
		// console.log res.name
		// console.log "herel"
	}; exports.run = run;


}())