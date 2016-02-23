(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	
	var fs = require('fs');
	var path = require('path');
	var cli = require('commander');
	var chalk = require('chalk');
	
	var orig = cli.helpInformation;
	var cliproto = cli.constructor.prototype;
	
	var package = require('../../package.json');
	var ERR = require('./errors');
	
	cliproto.helpInformation = function (){
		var str = orig.call(this);
		
		str = str.replace(/(Options|Usage|Examples|Commands)\:/g,function(m) { return chalk.bold(m); });
		return str;
	};
	
	Imbac = require('./index');
	var compiler = require('./compiler');
	var fspath = path;
	var T = require('./token');
	
	var parser = compiler.parser;
	var util = require('./helpers');
	
	// this caches an awful lot now - no need before we introduce a shared worker++
	function SourceFile(path){
		this._path = path;
		this._code = null;
		this._js = null;
		this;
	};
	
	SourceFile.prototype.path = function(v){ return this._path; }
	SourceFile.prototype.setPath = function(v){ this._path = v; return this; };
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
	SourceFile.prototype.analyze = function (o,cb){
		if (this._meta) {
			cb && cb(this._meta);
			return this._meta;
		};
		
		// STACK:_loglevel = 0 # not here?
		var errors = [];
		var err = null;
		var data = {};
		
		try {
			this._meta = this.ast().analyze({loglevel: 0,entities: o.entities,scopes: true});
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
		process.argv.shift();
		process.argv[0] = 'imba';
		return Imbac.run(this.code(),{filename: this._path});
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
		for (var strings = [], i = 0, ary = iter$(tokens), len = ary.length, t; i < len; i++) {
			t = ary[i];
			var typ = T.typ(t);
			var id = T.val(t);
			var s;
			if (typ == 'TERMINATOR') {
				strings.push("[" + chalk.yellow(id.replace(/\n/g,"\\n")) + "]");continue;
			};
			
			if (id == typ) {
				s = "[" + chalk.red(id) + "]";
			} else {
				id = chalk.white(id);
				s = chalk.grey(("[" + typ + " " + id + "]"));
			};
			
			if (t._loc != -1) {
				s = ("(" + (t._loc) + ":" + (t._len) + ")") + s; // chalk.bold(s)
			};
			strings.push(s);
		};
		
		return log(strings.join(' '));
	};
	
	
	function isDir(path){
		try {
			return fs.statSync(path).isDirectory();
		} catch (e) {
			return false;
		};
	};
	
	
	function copyFile(source,dest){
		var data = fs.readFileSync(source,'utf-8');
		return fs.writeFileSync(dest,data);
	};
	
	function ensureDir(path){
		if (fs.existsSync(path)) { return true };
		var parts = fspath.normalize(path).split(fspath.sep);
		for (var i = 0, ary = iter$(parts), len = ary.length; i < len; i++) {
			if (i < 1) { continue; };
			// what about relative paths here? no good? might be important for symlinks etc no?
			var dir = parts.slice(0,i + 1).join(fspath.sep);
			
			if (fs.existsSync(dir)) {
				var stat = fs.statSync(dir);
			} else if (ary[i].match(/\.(imba|js)$/)) {
				true;
			} else {
				fs.mkdirSync(dir);
				log(chalk.green(("+ mkdir " + dir)));
			};
		};
		return;
	};
	
	
	function sourcefileForPath(path){
		path = fspath.resolve(process.cwd(),path);
		if (isDir(path)) {
			var f = fspath.join(path,'index.imba');
			if (fs.existsSync(f)) {
				path = f;
			} else {
				// throw error & exit here
			};
		};
		return new SourceFile(path);
	};
	
	function printCompilerError(e,pars){
		//  return printError(e,source: source)
		
		if(!pars||pars.constructor !== Object) pars = {};
		var source = pars.source !== undefined ? pars.source : null;
		var tok = pars.tok !== undefined ? pars.tok : null;
		var tokens = pars.tokens !== undefined ? pars.tokens : null;
		var lex = e.lexer;
		
		tok || (tok = lex && lex.yytext);
		tokens || (tokens = lex && lex.tokens);
		
		var src = source && source.code();
		var locmap = util.locationToLineColMap(src);
		var lines = src && src.split(/\n/g);
		
		var ln0,ln1,gutter;
		
		
		var lnum = function(l,color) {
			if(color === undefined) color = 'grey';
			var s = String(l + 1);
			if (s.length < String(ln1).length) {
				s = ' ' + s;
			};
			// while s:length < String(ln1)
			
			return dim()[color]('    ' + s + ' |  ');
		};
		
		
		function printLn(nr,errtok){
			var tok, fmt;
			var pos = lex && lex.pos || 0;
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
				var tloc = locmap[tok._loc];
				if (tloc && tloc[0] > nr) { break; };
			};
			
			while (tok = tokens[--pos]){
				if (tok._loc == -1) { continue; }; // generated
				
				var typ = tok._type;
				var loc = locmap[tok._loc];
				var col = loc && loc[1] || 0;
				var len = tok._len || tok._value.length;
				var l = loc[0];
				
				if (l > nr) { continue; };
				if (l < nr) { break; };
				
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
		
		log("    " + chalk.red(e.message.split('\n').shift())); // + character + c2
		
		if (tok && src) {
			log(chalk.grey("    ") + "------------------------------------");
			
			// find the closest non-generated token to show error
			var tpos = tokens.indexOf(tok);
			while (tok && tok._loc == -1){
				tok = tokens[--tpos];
			};
			
			var lc = locmap[tok._loc] || [0,0];
			var ln = lc[0];
			var col = lc[1];
			
			ln0 = Math.max(0,ln - 3);
			ln1 = ln0 + 4;
			gutter = ("" + ln1).length;
			
			for (var len = 5, i = 0; i < len; i++) {
				var n = ln0 + i;
				printLn(n,n == ln ? (tok) : (null));
			};
			
			log(chalk.grey("    ") + "------------------------------------");
			log('');
		};
		return;
	};
	
	
	
	function writeFile(source,outpath,options){
		if(options === undefined) options = {};
		ensureDir(outpath);
		// var outpath = source.path.replace(/\.imba$/,'.js')
		// destpath = destpath.replace(basedir,outdir)
		if (!source.dirty()) { return };
		
		var srcp = fspath.relative(process.cwd(),source.path());
		var outp = fspath.relative(process.cwd(),outpath);
		
		var str = ts() + " " + chalk.dim("compile ") + srcp + chalk.dim(" to ") + outp;
		
		print(str);
		
		options.filename || (options.filename = source.path());
		options.sourcePath = source.path();
		options.targetPath = outpath;
		
		if (options.sourceMapInline) {
			options.sourceMap || (options.sourceMap = {});
			options.sourceMap.inline = true;
		};
		
		// if options:standalone
		// 	options:hasRuntime = no
		
		try {
			var start = Date.now();
			var code = compiler.compile(source.code(),options);
			var time = Date.now() - start;
			var ok = true;
			print(" " + chalk.bold.green("✔ ") + chalk.dim.grey(("" + time + "ms")) + "\n");
			
			if (code.warnings) {
				for (var i = 0, ary = iter$(code.warnings), len = ary.length, warn; i < len; i++) {
					// print String(warn:token)
					warn = ary[i];
					if (warn.type == 'error') {
						ok = false;
						printCompilerError(warn,{source: source,tok: warn.token,tokens: code.options._tokens});
					} else {
						print(chalk.yellow(("    " + b('warning') + ": " + (warn.message))));
					};
				};
			};
			
			if (ok) {
				var js = code.js || code;
				if (options.sourceMapInline && code.sourcemap) {
					var base64 = new Buffer(JSON.stringify(code.sourcemap)).toString("base64");
					js += ("\n//# sourceMappingURL=data:application/json;base64," + base64);
				};
				fs.writeFileSync(outpath,js);
			};
		} catch (e) {
			var toks = options._tokens;
			print(" " + chalk.bold.red("✘") + "\n");
			
			if (e instanceof ERR.ImbaParseError) {
				try {
					var tok = e.start();
				} catch (e) {
					tok = null;
				};
				printCompilerError(e,{source: source,tok: tok,tokens: toks}); // e:message + "\n"
			} else {
				print(" - " + e.message + "\n");
			};
		};
		
		return;
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
			log(("dirname " + fspath.dirname(base) + " " + base));
			// base += fspath:sep unless fspath.dirname(base) == base
			if (watch) { log(chalk.magenta(("--- watch dir: " + b(base)))) };
		} else {
			isFile = true;
			basedir = fspath.dirname(base);
			if (watch) { log(chalk.magenta(("--- watch file: " + b(base)))) };
		};
		
		var out = o.output ? (fspath.resolve(process.cwd(),o.output)) : (basedir);
		var outdir = out;
		
		if (!o.output) {
			var sep = fspath.sep;
			var idx = (basedir + sep).lastIndexOf(sep + 'src' + sep);
			
			if (idx >= 1) {
				var replace = sep + 'lib';
				var pre = basedir.substr(0,idx);
				var rest = basedir.substr(idx + replace.length);
				var dest = pre + replace + rest;
				
				if (fs.existsSync(pre + replace)) {
					outdir = out = dest;
				} else {
					print(("" + chalk.dim('--- warn:') + " " + (pre + (chalk.bold(replace)) + rest) + " "));
					log(chalk.dim("not found - compiling to /src"));
				};
			};
		};
		
		// compiling a single file - no need to require chokidar at all
		if (isFile && !watch) {
			var source = sourcefileForPath(base);
			var destpath = source.path().replace(/\.imba$/,'.js').replace(basedir,outdir);
			writeFile(source,destpath,o);
			return;
		};
		
		log(chalk.blue(("--- write dir: " + b(out))));
		
		var sources = {};
		
		// it is bad practice to require modules inside methods, but chokidar takes
		// some time to load, and we really dont want that for single-file compiles
		var chokidar = require('chokidar');
		var watcher = chokidar.watch(base,{ignored: /[\/\\]\./,persistent: watch});
		
		watcher.on('all',function(event,path) {
			// need to fix on remove as well!
			// log "watcher {event} {path}"
			var $1;
			if (path.match(/\.imba$/) && (event == 'add' || event == 'change')) {
				var realpath = fspath.resolve(process.cwd(),path);
				var source = sources[($1 = realpath)] || (sources[$1] = sourcefileForPath(realpath));
				var destpath = source.path().replace(/\.imba$/,'.js');
				destpath = destpath.replace(basedir,outdir);
				// should supply the dir
				// log "write file {destpath}"
				return writeFile(source,destpath,o);
			};
		});
		return;
	};
	
	cli.version(package.version);
	
	cli.command('* <path>').description('run imba').usage('<path>').action(function(path,o) {
		var file = sourcefileForPath(path);
		return file.run();
	});
	
	
	cli.command('compile <path>').description('compile scripts').option('-m, --source-map-inline','Embed inline sourcemap in compiled JavaScript').option('-s, --standalone','Embed utils from Imba runtime').option('-b, --bare','Skipp wrapping code in outer closure').option('-o, --output [dest]','set the output directory for compiled JavaScript').action(function(path,o) { return cliCompile(path,o,{watch: false}); });
	
	cli.command('watch <path>').description('listen for changes and compile scripts').option('-m, --source-map-inline','Embed inline sourcemap in compiled JavaScript').option('-s, --standalone','Embed utils from Imba runtime').option('-b, --bare','Skipp wrapping code in outer closure').option('-o, --output [dest]','set the output directory for compiled JavaScript').action(function(root,o) { return cliCompile(root,o,{watch: true}); });
	
	cli.command('analyze <path>').description('get information about scopes, variables and more').option('-t, --tokens','print the raw tokens').option('-e, --entities','print the raw tokens').action(function(path,opts) {
		var file = sourcefileForPath(path);
		
		if (opts.tokens) {
			// log "tokens"
			return printTokens(file.tokens());
		} else {
			return file.analyze(opts,function(meta) {
				return log(JSON.stringify(meta,null,4));
			});
		};
	});
	
	cli.command('export-runtime <path>').description('export the imba.js runtime to <path>').option('-m, --min','minified version').action(function(path,opts) {
		var filename = (opts.min ? ('imba.min.js') : ('imba.js'));
		var rel = '../../dist/' + filename;
		var lib = fspath.resolve(__dirname,rel);
		var out = fspath.resolve(process.cwd(),path);
		
		if (isDir(out)) {
			var dir = fspath.resolve(out,filename);
			log(("write runtime to " + b(dir)));
			copyFile(lib,dir);
		} else if (out.match(/\.js$/)) {
			log(("write runtime to " + b(out)));
			copyFile(lib,out);
		} else {
			log(chalk.red(("" + b(out) + " is not a directory")));
		};
		
		return;
	});
	
	
	function run(argv){
		if (process.argv.length < 3) {
			return cli.outputHelp();
		} else if (process.argv.length == 3 && process.argv[2] == '-v') {
			return log(package.version);
		};
		
		return cli.parse(argv);
	}; exports.run = run;; return run;

})()