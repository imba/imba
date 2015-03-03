(function(){
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; }
function promise$(a){ return a instanceof Array ? Promise.all(a) : (a && a.then ? a : Promise.resolve(a)); }
var fs = require('fs');
var path = require('path');
var promise = require('bluebird');

var lexer = require('./lexer');
var parser = require('./parser').parser;

var vm = require('vm');

require('../imba/node');
require('../imba/imba');
require('../imba/core.events');

require('../imba/dom');
require('../imba/dom.server');
require('./ast/ast');
var lex = new lexer.Lexer();

parser.lexer = {options: {ranges: true},lex: function (){
	var ary;
	var token = this.tokens[(this.pos)++];
	var ttag;
	
	if(token) {
		var ary=iter$(token);
		ttag = ary[(0)];
		this.yytext = ary[(1)];
		this.yylloc = ary[(2)];
		
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
},setInput: function (tokens){
	this.tokens = tokens;
	return this.pos = 0;
},upcomingInput: function (){
	return "";
}};
parser.yy = AST;


function tokenize(code,o){
	if(o === undefined) o = {};
	try {
		return lex.tokenize(code);
	}
	catch (err) {
		return console.log("ERROR1",err);
	}
	;
}; exports.tokenize = tokenize;
function parse(code,o){
	try {
		var tokens = tokenize(code);
		return parser.parse(tokens);
	}
	catch (err) {
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
			(err.setMessage(v_=("In " + (o.filename) + ", " + (err.message))), v_);
		};
		throw err;
	}
	;
}; exports.compile = compile;
function run(code,pars){
	if(!pars||pars.constructor !== Object) pars = {};
	var filename = pars.filename !== undefined ? pars.filename : null;
	var main = require.main;
	main.filename = process.argv[1] = ((filename) ? (fs.realpathSync(filename)) : ('.'));
	main.moduleCache && (main.moduleCache = {});
	if(process.binding('natives').module) {
		Module = require('module').Module;
		main.paths = Module._nodeModulePaths(path.dirname(filename));
	};
	return (path.extname(main.filename) != '.imba' || require.extensions) ? (main._compile(compile(code,arguments[1]),main.filename)) : (main._compile(code,main.filename));
}; exports.run = run;
if(require.extensions) {
	require.extensions['.imba'] = function (mod,filename){
		var content = compile(fs.readFileSync(filename,'utf8'),{filename: filename});
		return mod._compile(content,filename);
	};
} else {
	if(require.registerExtension) {
		require.registerExtension('.imba',function (content){
			return compile(content);
		});
	}
};
SourceFile = imba$class(function SourceFile(path){
	this._path = path;
	this._code = null;
	this._js = null;
	this;
});
exports.SourceFile = SourceFile;

SourceFile.prototype.__path = {};
SourceFile.prototype.path = function(v){ return this._path; }
SourceFile.prototype.setPath = function(v){ this._path = v; return this; }
;

SourceFile.prototype.__code = {};
SourceFile.prototype.code = function(v){ return this._code; }
SourceFile.prototype.setCode = function(v){ this._code = v; return this; }
;

SourceFile.prototype.__tokens = {};
SourceFile.prototype.tokens = function(v){ return this._tokens; }
SourceFile.prototype.setTokens = function(v){ this._tokens = v; return this; }
;

SourceFile.prototype.__ast = {};
SourceFile.prototype.ast = function(v){ return this._ast; }
SourceFile.prototype.setAst = function(v){ this._ast = v; return this; }
;

SourceFile.prototype.__meta = {};
SourceFile.prototype.meta = function(v){ return this._meta; }
SourceFile.prototype.setMeta = function(v){ this._meta = v; return this; }
;

SourceFile.prototype.__js = {};
SourceFile.prototype.js = function(v){ return this._js; }
SourceFile.prototype.setJs = function(v){ this._js = v; return this; }
;

SourceFile.prototype.name = function (){
	return path.split("/").pop();
};
SourceFile.prototype.read = function (){
	var self=this;
	return this._read || (this._read = new promise(function (resolve){
		return fs.readFile(self._path,function (err,res){
			self._code = res.toString();
			return resolve(self);
		});
	}));
};
SourceFile.prototype.tokenize = function (){
	var self=this;
	return this._tokenize || (this._tokenize = new promise(function (resolve){
		return promise$(self.read()).then(function (){
			self._tokens = tokenize(self._code);
			return resolve(self);
		});
	}));
};
SourceFile.prototype.parse = function (){
	var self=this;
	return this._parse || (this._parse = new promise(function (resolve){
		return promise$(self.tokenize()).then(function (){
			self._ast = parser.parse(self._tokens);
			return resolve(self);
		});
	}));
};
SourceFile.prototype.write = function (outpath){
	var self=this;
	return new promise(function (resolve){
		return promise$(self.compile()).then(function (){
			return fs.writeFile(outpath,self._js,function (err,res){
				return resolve(self);
			});
		});
	});
};
SourceFile.prototype.compile = function (options){
	var self=this;
	return this._compile || (this._compile = new promise(function (resolve){
		return promise$(self.parse()).then(function (){
			self._js = self._ast.compile(options || {});
			return resolve(self);
		});
	}));
};
SourceFile.prototype.dirty = function (){
	this._code = this._js = this._tokens = this._ast = this._meta = null;
	this._read = this._tokenize = this._compile = this._parse = this._analyze = null;
	return this;
};
SourceFile.prototype.analyze = function (){
	var self=this;
	return self._analyze || (self._analyze = new promise(function (resolve){
		STACK._loglevel = 0;
		var errors = [];
		var err = null;
		var data = {};
		
		try {
			return promise$(self.parse()).then(function (){
				self.setMeta(self.ast().analyze({}));
				return resolve(self.meta());
			});
		}
		catch (e) {
			return console.log(("ERROR " + (e.message)));
		}
		;
	}));
};
SourceFile.prototype.run = function (){
	var self=this;
	return promise$(this.read()).then(function (){
		return run(self._code,{filename: self._path});
	});
};
}())