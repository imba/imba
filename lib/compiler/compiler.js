(function(){
	
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
	
	
	function tokenize(code,o){
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
	}; exports.tokenize = tokenize;
	
	function rewrite(tokens,o){
		if(o === undefined) o = {};
		try {
			if (o.profile) { console.time('rewrite') };
			tokens = rewriter.rewrite(tokens,o);
			if (o.profile) { console.timeEnd('rewrite') };
		} catch (err) {
			throw err;
		};
		return tokens;
	}; exports.rewrite = rewrite;
	
	
	function parse(code,o){
		if(o === undefined) o = {};
		var tokens = (code instanceof Array) ? code : tokenize(code,o);
		try {
			if (tokens != code) o._source || (o._source = code);
			o._tokens = tokens;
			return parser.parse(tokens);
		} catch (err) {
			err._code = code;
			if (o.filename) { err._filename = o.filename };
			throw err;
		};
	}; exports.parse = parse;
	
	
	function compile(code,o){
		if(o === undefined) o = {};
		try {
			// check if code is completely blank
			if (!/\S/.test(code)) {
				return {js: ""};
			};
			
			var tokens = tokenize(code,o);
			var ast = parse(tokens,o);
			return ast.compile(o);
		} catch (err) {
			err._code = code;
			if (o.filename) { err._filename = o.filename };
			if (o.evaling) {
				console.log("error during compile",o.filename);
			};
			throw err;
		};
	}; exports.compile = compile;
	
	function analyze(code,o){
		if(o === undefined) o = {};
		var meta;
		try {
			var ast = parse(code,o);
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
	}; exports.analyze = analyze;; return analyze;

})();