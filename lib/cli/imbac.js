function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var self = {};
var helpers = require("../compiler/helpers");
var compiler = require("../compiler/compiler");

var path = require("path");
var fs = require("fs");
var stdin = process.stdin;
var stdout = process.stdout;
var ansi = helpers.ansi;
var package = require('../../package.json');

var parseOpts = {
	alias: {
		o: 'output',
		h: 'help',
		s: 'stdio',
		p: 'print',
		m: 'sourceMap',
		a: 'analyze',
		t: 'tokenize',
		v: 'version',
		w: 'watch'
	},
	
	schema: {
		output: {type: 'string'},
		target: {type: 'string'}
	},
	
	group: ['source-map']
};


var help = "\nUsage: imbac [options] path/to/script.imba\n\n  -a, --analyze          print out the scopes and variables of your script\n      --es5              compile without native let/var/await\n  -h, --help             display this help message\n  -m, --source-map       generate source map and add inline to .js files\n      --inline-helpers   inline helpers to not depend on imba.js\n      --inline-css       inline css declared in sfc css blocks\n  -o, --output [dir]     set the output directory for compiled JavaScript\n  -p, --print            print out the compiled JavaScript\n  -s, --stdio            listen for and compile scripts over stdio\n  -t, --tokenize         print out the tokens that the lexer/rewriter produce\n      --target [target]  explicitly compile for node/web/webworker\n  -v, --version          display the version number\n      --silent			 only print out errors (skip warnings)\n  -w, --watch            recompile files on change\n      --wrap             compile with top-level function wrapper\n      --experimental     compile with experimental features (Imba 2.0)\n      --native-props     compile props to native es6 getters and setters\n      --explicit-parens  require explicit parens to call functions\n";


function CLI(options){
	if(options === undefined) options = {};
	this._options = options;
	this._sources = [];
	this._current = null;
	this;
};


CLI.prototype.sources = function(v){ return this._sources; }
CLI.prototype.setSources = function(v){ this._sources = v; return this; };

CLI.prototype.ensureDir = function (src){
	if (fs.existsSync(src)) { return true };
	var parts = path.normalize(src).split(path.sep);
	for (var i = 0, items = iter$(parts), len = items.length, part; i < len; i++) {
		part = items[i];
		if (i < 1) { continue; };
		// what about relative paths here? no good? might be important for symlinks etc no?
		var dir = parts.slice(0,i + 1).join(path.sep);
		
		if (fs.existsSync(dir)) {
			var stat = fs.statSync(dir);
		} else if (part.match(/\.(imba|js)$/)) {
			true;
		} else {
			fs.mkdirSync(dir);
			console.log(ansi.green(("+ mkdir " + dir)));
		};
	};
	return;
};

CLI.prototype.findRecursive = function (root,pattern){
	if(pattern === undefined) pattern = /\.imba$/;
	var results = [];
	root = path.relative(process.cwd(),root);
	root = path.normalize(root);
	
	var read = function(src,depth) {
		src = path.normalize(src);
		var stat = fs.statSync(src);
		
		if (stat.isDirectory() && depth > 0) {
			var files = fs.readdirSync(src);
			var res = [];
			for (var i = 0, items = iter$(files), len = items.length; i < len; i++) {
				res.push(read(src + '/' + items[i],depth - 1));
			};
			return res;
		} else if (src.match(pattern)) {
			return results.push(src);
		};
	};
	
	if (root.match(/\/\*\.imba$/)) {
		root = root.slice(0,-7);
		read(root,1);
	} else {
		read(root,10);
	};
	
	return results;
};

CLI.prototype.pathToSource = function (src,coll,o,root){
	if(root === undefined) root = null;
	var abs = path.resolve(process.cwd(),src);
	var stat = fs.statSync(abs);
	
	if (stat.isDirectory()) {
		// console.log "is directory",findRecursive(abs)
		var files = this.findRecursive(abs);
		for (var i = 0, items = iter$(files), len = items.length; i < len; i++) {
			this.pathToSource(items[i],coll,o,abs);
		};
		return;
	};
	
	var file = {
		filename: path.basename(src),
		sourcePath: abs,
		sourceBody: fs.readFileSync(abs,'utf8')
	};
	
	if (o.output) {
		var rel = root ? path.relative(root,abs) : file.filename;
		file.targetPath = path.resolve(o.output,rel);
	} else if (!o.stdio) {
		file.targetPath = file.sourcePath;
	};
	
	if (file.targetPath) {
		file.targetPath = file.targetPath.replace(/\.imba$/,'.js');
	};
	
	return coll.push(file);
};


CLI.prototype.cwd = function (){
	return process.cwd();
};

CLI.prototype.run = function (){
	var self = this, o_, main_;
	(o_ = self.o()).target || (o_.target = 'node');
	
	if (self.o().output) {
		self.o().output = path.normalize(path.resolve(self.cwd(),self.o().output));
	};
	
	var paths = ((typeof (main_ = self.o().main)=='string'||main_ instanceof String)) ? [self.o().main] : ((self.o().main || []));
	for (var i = 0, items = iter$(paths), len = items.length; i < len; i++) {
		self.pathToSource(items[i],self._sources,self._options);
	};
	
	if (self.o().stdio) {
		if (!self.o().output) { self.o().print = true };
		var chunks = [];
		stdin.resume();
		stdin.setEncoding('utf8');
		stdin.on('data',function(chunk) { return chunks.push(chunk); });
		stdin.on('end',function() {
			self.sources().push({filename: 'stdin',sourceBody: chunks.join()});
			return self.finish();
		});
	} else {
		self.finish();
	};
	return self;
};

CLI.prototype.o = function (){
	return this._options;
};

CLI.prototype.traverse = function (cb){
	for (var i = 0, items = iter$(this.sources()), len = items.length, src; i < len; i++) {
		src = items[i];
		this._current = src;
		cb(src);
	};
	return this;
};

CLI.prototype.log = function (message){
	if (!this.o().print) { console.log(message) };
	return this;
};

CLI.prototype.b = function (text){
	return this.o().colors ? ansi.bold(text) : text;
};

CLI.prototype.gray = function (text){
	return this.o().colors ? ansi.gray(text) : text;
};

CLI.prototype.red = function (text){
	return this.o().colors ? ansi.red(text) : text;
};

CLI.prototype.green = function (text){
	return this.o().colors ? ansi.green(text) : text;
};

CLI.prototype.yellow = function (text){
	return this.o().colors ? ansi.yellow(text) : text;
};

CLI.prototype.rel = function (src){
	src = src.sourcePath || src;
	return path.relative(process.cwd(),src);
};

CLI.prototype.present = function (data){
	if (this.o().print) {
		process.stdout.write(data);
	};
	return this;
};

CLI.prototype.analyze = function (){
	var self = this;
	return self.traverse(function(src) {
		var o2 = Object.create(self.o());
		o2.filename = src.filename;
		o2.entities = true;
		var out = compiler.analyze(src.sourceBody,o2);
		src.analysis = out;
		return self.present(JSON.stringify(out,null,2));
	});
};

CLI.prototype.tokenize = function (){
	// should prettyprint tokens
	var self = this;
	return self.traverse(function(src) {
		var o2 = Object.create(self.o());
		o2.filename = src.filename;
		o2.rewrite = self.o().rewrite;
		var out = compiler.tokenize(src.sourceBody,o2);
		src.tokens = out;
		
		var res = [];
		for (var i = 0, items = iter$(src.tokens), len = items.length, t; i < len; i++) {
			t = items[i];
			var typ = t._type;
			var id = t._value;
			var s;
			if (typ == 'TERMINATOR') {
				s = "[" + self.b(id.replace(/\n/g,"\\n")) + "]\n";
			} else if (typ == 'IDENTIFIER') {
				s = id;
			} else if (typ == 'NUMBER') {
				s = id;
			} else if (id == typ) {
				s = "[" + self.b(id) + "]";
			} else {
				s = self.b(("[" + typ + " " + id + "]"));
			};
			
			if (t._loc != -1 && self.o().sourceMap) {
				s = ("(" + (t._loc) + ":" + (t._len) + ")") + s; // chalk.bold(s)
			};
			
			res.push(s);
		};
		var strings = res;
		
		return process.stdout.write(strings.join(' ') + '\n');
	});
};

CLI.prototype.compile = function (){
	var self = this;
	return self.traverse(function(src) { return self.compileFile(src); });
};

CLI.prototype.compileFile = function (src){
	var self = this;
	var opts = Object.create(self.o());
	opts.filename = src.filename;
	opts.sourcePath = src.sourcePath;
	var out = {};
	var t = Date.now();
	var at = new Date().toTimeString().substr(0,8);
	var srcp = self.o().stdio ? src.filename : path.relative(process.cwd(),src.sourcePath);
	var dstp = src.targetPath && path.relative(process.cwd(),src.targetPath);
	
	var srcpAbs = path.resolve(srcp);
	var dstpAbs = path.resolve(dstp);
	
	if (srcp.indexOf("../") >= 0) {
		srcp = srcpAbs;
		dstp = dstpAbs;
	};
	
	try {
		out = compiler.compile(src.sourceBody,opts);
	} catch (e) {
		out = {error: e};
	};
	
	out.compileTime = Date.now() - t;
	
	if (self.o().sourceMap && out.sourcemap) {
		var base64 = new Buffer(JSON.stringify(out.sourcemap)).toString("base64");
		out.js = out.js + "\n//# sourceMappingURL=data:application/json;base64," + base64;
	};
	
	src.output = out;
	
	var status = ("" + self.gray(("" + at + " compile")) + " " + srcp + " " + self.gray("to") + " " + dstp + " " + self.green(out.compileTime + "ms"));
	
	if (out.error) {
		status += self.red(" [1 error]");
	};
	
	if (out.warnings && out.warnings.length) {
		var count = out.warnings.length;
		status += self.yellow((" [" + count + " warning" + ((count > 1) ? 's' : '') + "]"));
	};
	
	if (src.targetPath && out.js !== undefined && !self.o().print) {
		self.ensureDir(src.targetPath);
		fs.writeFileSync(src.targetPath,out.js,'utf8');
		if (!self.o().print) { self.log(status) };
		
		// log "{gray("{at} compile")} {srcp} {gray("to")} {dstp} {green(out:compileTime + "ms")}"
	} else if (out.error) {
		if (!self.o().print) {
			self.log(status);
			// log "{gray("{at} compile")} {srcp} {gray("to")} {dstp} {red(out:compileTime + "ms")}"
			if (out.error.excerpt) {
				self.log("   " + out.error.excerpt({colors: self.o().colors}));
			} else {
				self.log("   " + out.error.message);
				self.log("   " + ("in file " + srcp));
				if (out.error.stack) { self.log(out.error.stack) };
			};
		};
	};
	
	if (out.warnings && !self.o().silent && !self.o().print) {
		// log "   {out:warnings:length} warnings"
		for (var i = 0, items = iter$(out.warnings), len = items.length, warn; i < len; i++) {
			warn = items[i];
			var hl = self.o().colors && 'whiteBright';
			var excerpt = helpers.printExcerpt(src.sourceBody,warn.loc,{hl: hl,type: 'warn',pad: 1});
			var msg = self.b(("" + self.yellow('warn: '))) + self.yellow(warn.message);
			self.log("   " + msg);
			self.log(self.gray(excerpt));
		};
		
		// helpers
	};
	
	
	if (self.o().watch && !src.watcher) {
		var now = Date.now();
		src.watcher = fs.watch(src.sourcePath,function(type,filename) {
			if (type == 'change') {
				return setTimeout(function() {
					return fs.readFile(src.sourcePath,'utf8',function(err,body) {
						if (body != src.sourceBody) {
							src.sourceBody = body;
							return self.compileFile(src);
						};
					});
				},100);
			};
		});
	};
	
	
	if (self.o().print && out.js) {
		process.stdout.write(out.js);
	};
	return self;
};

CLI.prototype.finish = function (){
	try {
		if (this.o().analyze) {
			this.o().print = true;
			this.analyze(this.sources(),this.o());
		} else if (this.o().tokenize) {
			this.o().print = true;
			this.tokenize(this.sources(),this.o());
		} else {
			this.compile(this.sources(),this.o());
		};
	} catch (e) {
		if (this._current) {
			this.log(("ERROR in " + this.b(this.rel(this._current))));
		};
		if (e.excerpt) {
			this.log(e.excerpt({colors: true}));
		} else {
			throw e;
		};
	};
	return this;
};


exports.run = self.run = function (){
	var o = helpers.parseArgs(process.argv.slice(2),parseOpts);
	
	(o.colors == null) ? (o.colors = true) : o.colors;
	
	if (o.version) {
		return console.log(package.version);
	} else if (!(o.main || o.stdio) || o.help) {
		return console.log(help);
	} else {
		return new CLI(o).run();
	};
};
