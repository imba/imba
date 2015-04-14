(function(){


	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	var lex;
	var fs = require('fs');
	var path = require('path');
	// var promise = require 'bluebird'
	
	var lexer = require('./lexer');
	var parser = require('./parser').parser;
	
	// var vm = require 'vm'
	// require files needed to run imba
	// whole runtime - no?
	
	// should this really happen up here?
	
	// require '../imba/node'
	
	require('../imba/imba');
	require('../imba/core.events');
	
	require('../imba/dom');
	require('../imba/dom.server');
	
	// setting up the actual compiler
	require('./ast/ast');
	
	// Instantiate a Lexer for our use here.
	module.exports.lex = lex = new lexer.Lexer();
	
	
	// The real Lexer produces a generic stream of tokens. This object provides a
	// thin wrapper around it, compatible with the Jison API. We can then pass it
	// directly as a "Jison lexer".
	
	parser.lexer = {
		options: {
			ranges: true
		},
		
		lex: function (){
			var ary;
			var token = this.tokens[(this.pos)++];
			var ttag;
			
			if(token) {
				var ary=iter$(token);ttag = ary[(0)];this.yytext = ary[(1)];this.yylloc = ary[(2)];
				
				if(this.yylloc) {
					this.currloc = this.yylloc;
				} else {
					this.yylloc = this.currloc;
				};
				this.yylineno = this.yylloc && this.yylloc.first_line;
			} else {
				ttag = '';
			};
			
			return ttag;
		},
		
		setInput: function (tokens){
			this.tokens = tokens;
			return this.pos = 0;
		},
		
		upcomingInput: function (){
			return "";
		}
	};
	
	parser.yy = AST;// require './../nodes'
	
	function tokenize(code,o){
		if(o === undefined) o = {};
		try {
			// console.log("tokenize code",code)
			return lex.tokenize(code,o);
		}
		catch (err) {
			return console.log("ERROR1",err);
		}
		;
	}; exports.tokenize = tokenize;
	
	
	function parse(code,o){
		try {
			var tokens = tokenize(code);
			// console.log("Tokens",tokens)
			return parser.parse(tokens);
		}
		catch (err) {
			// console.log("ERROR",err)
			if(o.filename) {
				err.message = ("In " + (o.filename) + ", " + (err.message));
			};
			throw err;
		}
		;
	}; exports.parse = parse;
	
	
	function compile(code,o){
		if(o === undefined) o = {};
		try {
			var ast = parse(code,o);
			return ast.compile(o);
		}
		catch (err) {
			if(o.filename) {
				err.message = ("In " + (o.filename) + ", " + (err.message));
			};
			throw err;
		}
		;
	}; exports.compile = compile;
	
	
	function run(code,pars){
		if(!pars||pars.constructor !== Object) pars = {};
		var filename = pars.filename !== undefined ? pars.filename : null;
		var main = require.main;
		// hmmmmmm
		// hmmm -- why are we chging process:argv
		// console.log "should run!"
		main.filename = process.argv[1] = ((filename) ? (fs.realpathSync(filename)) : ('.'));
		main.moduleCache && (main.moduleCache = {});
		
		
		// dir = if options.filename
		//     path.dirname fs.realpathSync options.filename
		//   else
		//     fs.realpathSync '.'
		//   mainModule.paths = require('module')._nodeModulePaths dir
		// 	# console.log "run! {filename}"
		// if process.binding('natives'):module
		// hmm -- should be local variable
		var Module = require('module').Module;
		main.paths = Module._nodeModulePaths(path.dirname(filename));
		
		return (path.extname(main.filename) != '.imba' || require.extensions) ? (
			// console.log("compile the code {main:filename}")
			main._compile(compile(code,arguments[1]),main.filename)
		) : (
			main._compile(code,main.filename)
		);
		// self
	}; exports.run = run;
	
	if(require.extensions) {
		require.extensions['.imba'] = function (mod,filename){
			// console.log "require with extension! {filename}"
			var content = compile(fs.readFileSync(filename,'utf8'),{filename: filename});
			return mod._compile(content,filename);
		};
	} else if(require.registerExtension) {
		require.registerExtension('.imba',function (content){
			// console.log "in registerExtension!"
			return compile(content);
		});
	};
	
	
	// really?
	// wrapper for files?
	/* @class SourceFile */
	function SourceFile(path){
		this._path = path;
		this._code = null;
		this._js = null;
		this;
	};
	
	exports.SourceFile = SourceFile; // export class 
	
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
		return this._tokens || (this._tokens = tokenize(this.code()));
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
		return fs.writeFile(outpath,this.js(),cb);
	};
	
	SourceFile.prototype.dirty = function (){
		// console.log "marking file as dirty!"
		// simply removing all info abou tfiles
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
		return run(this.code(),{filename: this._path});
	};
	


}())