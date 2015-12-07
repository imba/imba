(function(){
	// externs;
	
	var ERR = require('./errors');
	var lexer = require('./lexer');
	var rewriter = require('./rewriter');
	var parser = require('./parser').parser;
	var ast = require('./nodes');
	
	// Instantiate a Lexer for our use here.
	var lex = new (lexer.Lexer)();
	var Rewriter = rewriter.Rewriter;
	
	parser.lexer = lex.jisonBridge();
	parser.yy = ast; // everything is exported right here now
	
	var api = {};
	
	api.tokenize = function (code,o){
		if(o === undefined) o = {};
		try {
			o._source = code;
			lex.reset();
			return lex.tokenize(code,o);
		} catch (err) {
			// makes no sense?
			throw err;
		};
	};
	
	api.parse = function (code,o){
		// code will never be an array in worker?
		if(o === undefined) o = {};
		var tokens = code instanceof Array ? (code) : (api.tokenize(code,o));
		
		try {
			o._source = code;
			o._tokens = tokens;
			return parser.parse(tokens);
		} catch (err) {
			if (o.filename) { err._filename = o.filename };
			throw err;
		};
	};
	
	
	api.compile = function (code,o){
		if(o === undefined) o = {};
		try {
			var ast = api.parse(code,o);
			var res = ast.compile(o);
			return {code: res.toString(),sourcemap: res.sourcemap};
		} catch (e) {
			// normalize somewhere else
			if (!((e instanceof ERR.ImbaParseError))) {
				if (e.lexer) {
					e = new ERR.ImbaParseError(e,{tokens: e.lexer.tokens,pos: e.lexer.pos});
				} else {
					e = {message: e.message};
				};
			};
			
			if (e instanceof ERR.ImbaParseError) { e = e.toJSON() };
			
			return {error: e};
		};
	};
	
	api.analyze = function (code,o){
		if(o === undefined) o = {};
		var meta;
		try {
			var ast = this.parse(code,o);
			meta = ast.analyze({loglevel: 0});
		} catch (e) {
			// console.log "something wrong {e:message}"
			if (!((e instanceof ERR.ImbaParseError))) {
				if (e.lexer) {
					e = new ERR.ImbaParseError(e,{tokens: e.lexer.tokens,pos: e.lexer.pos});
				} else {
					e = {message: e.message};
				};
			};
			
			if (e instanceof ERR.ImbaParseError) { e = e.toJSON() };
			
			meta = {warnings: [e]};
		};
		return meta;
	};
	
	
	return onmessage = function onmessage(e){
		var params = e.data;
		var id = params.id;
		
		if (api[params[0]] instanceof Function) {
			var fn = api[params[0]];
			var result = fn.apply(api,params.slice(1));
			return postMessage({id: id,data: result});
		};
	};
	
	

})()