var self = {};
// imba$inlineHelpers=1
// imba$v2=0

// var imba = require '../imba'
var T = require('./token');
var util = require('./helpers');
var lexer = require('./lexer');
var rewriter = require('./rewriter');
var parser = exports.parser = require('../../lib/compiler/parser').parser;
var ast = require('./nodes');

var ImbaParseError = require('./errors').ImbaParseError;

// Instantiate a Lexer for our use here.
var lex = exports.lex = new (lexer.Lexer)();
var Rewriter = exports.Rewriter = rewriter.Rewriter;
rewriter = new Rewriter();

parser.lexer = lex.jisonBridge();
parser.yy = ast; // everything is exported right here now


exports.tokenize = self.tokenize = function (code,o){
	if(o === undefined) o = {};
	try {
		// console.log('tokenize') if o:profile
		if (o.profile) { console.time('tokenize') };
		o._source = code;
		lex.reset();
		var tokens = lex.tokenize(code,o);
		if (o.profile) { console.timeEnd('tokenize') };
		
		if (o.rewrite !== false) {
			tokens = rewriter.rewrite(tokens,o);
		};
		return tokens;
	} catch (err) {
		throw err;
	};
};

exports.rewrite = self.rewrite = function (tokens,o){
	if(o === undefined) o = {};
	try {
		if (o.profile) { console.time('rewrite') };
		tokens = rewriter.rewrite(tokens,o);
		if (o.profile) { console.timeEnd('rewrite') };
	} catch (err) {
		throw err;
	};
	return tokens;
};


exports.parse = self.parse = function (code,o){
	if(o === undefined) o = {};
	var tokens = (code instanceof Array) ? code : self.tokenize(code,o);
	try {
		if (tokens != code) o._source || (o._source = code);
		o._tokens = tokens;
		return parser.parse(tokens);
	} catch (err) {
		err._code = code;
		if (o.filename) { err._filename = o.filename };
		throw err;
	};
};

exports.compile = self.compile = function (code,o){
	if(o === undefined) o = {};
	try {
		// check if code is completely blank
		if (!/\S/.test(code)) {
			return {
				js: "",
				toString: function() { return this.js; }
			};
		};
		var tokens = self.tokenize(code,o);
		var ast = self.parse(tokens,o);
		return ast.compile(o);
	} catch (err) {
		err._code = code;
		if (o.filename) { err._filename = o.filename };
		if (o.evaling) {
			console.log(("error compiling " + (o.filename)));
			if (err.excerpt) {
				console.log("   " + err.excerpt({colors: true}));
			} else {
				console.log("   " + err.message);
				console.log("   " + ("in file " + (err._filename)));
				if (err.stack) { console.log(err.stack) };
			};
			// console.log "error during compile",o:filename
		} else {
			console.log(("error compiling " + (o.filename)));
		};
		
		throw err;
	};
};

exports.analyze = self.analyze = function (code,o){
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
