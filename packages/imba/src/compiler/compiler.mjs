import * as __T_module_0 from './token.mjs';
import * as __util_module_1 from './helpers.mjs';
import * as __lexer_module_2 from './lexer.mjs';
import * as __rewriter_module_3 from './rewriter.mjs';
import * as __parser_module_4 from '../../build/parser.js';
import * as __ast_module_5 from './nodes.mjs';
import * as __resolveConfigFile_module_6 from './imbaconfig.imba';
import { ImbaParseError as ImbaParseError } from './errors.mjs';
import * as __compilation$_module_7 from './compilation.imba';
var self = {};
// imba$inlineHelpers=1
// imba$v2=0

// var imba = require '../imba'
var T = __T_module_0;
var util = __util_module_1;
var lexer = __lexer_module_2;
var rewriter = __rewriter_module_3;
var parser = __parser_module_4.parser;
var ast = __ast_module_5;

var resolveConfigFile = __resolveConfigFile_module_6.resolveConfigFile;

var Compilation = __compilation$_module_7.Compilation;

// Instantiate a Lexer for our use here.
var lex = new (lexer.Lexer)();
var Rewriter = rewriter.Rewriter;
var helpers = util;
rewriter = new Rewriter();

parser.lexer = lex.jisonBridge();
parser.yy = ast; // everything is exported right here now

Compilation.prototype.lexer = lex;
Compilation.prototype.rewriter = rewriter;
Compilation.prototype.parser = parser;

// normalize compiler options, resolve imbaconfig.json++
var resolveConfig = self.resolveConfig = function (o){
	if(o === undefined) o = {};
	let path = o.sourcePath;
	o.config || (o.config = resolveConfigFile(path,o) || {});
	return o;
};

var deserialize = self.deserialize = function (data,options){
	if(options === undefined) options = {};
	return Compilation.deserialize(data,options);
};

var tokenize = self.tokenize = function (code,options){
	if(options === undefined) options = {};
	let script = new Compilation(code,options);
	return script.tokenize();
};

var rewrite = self.rewrite = function (tokens,o){
	if(o === undefined) o = {};
	return rewriter.rewrite(tokens,o);
};

var parse = self.parse = function (code,o){
	if(o === undefined) o = {};
	o = self.resolveConfig(o);
	var tokens = (code instanceof Array) ? code : self.tokenize(code,o);
	try {
		return parser.parse(tokens);
	} catch (err) {
		err._code = code;
		if (o.sourcePath) { err._sourcePath = o.sourcePath };
		throw err;
	};
};

var compile = self.compile = function (code,o){
	if(o === undefined) o = {};
	let compilation = new Compilation(code,self.resolveConfig(o));
	return compilation.compile();
};

var resolve = self.resolve = function (code,o){
	if(o === undefined) o = {};
	let compilation = new Compilation(code,self.resolveConfig(o));
	return compilation.compile();
};

var analyze = self.analyze = function (code,o){
	if(o === undefined) o = {};
	var meta;
	try {
		var ast = self.parse(code,o);
		meta = ast.analyze(o);
	} catch (e) {
		if (!((e instanceof ImbaParseError))) {
			if (e.lexer) {
				e = new ImbaParseError(e,{tokens: e.lexer.tokens,pos: e.lexer.pos});
			} else {
				throw e;
			};
		};
		meta = {warnings: [e]};
	};
	return meta;
};

export { Rewriter, analyze, compile, deserialize, helpers, lex, parse, parser, resolve, resolveConfig, rewrite, tokenize };
