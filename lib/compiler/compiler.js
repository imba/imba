(function(){
	var parser, lex, Rewriter;
	
	var fs = require('fs');
	var path = require('path');
	
	// var imba = require '../imba'
	var T = require('./token');
	var lexer = require('./lexer');
	var rewriter = require('./rewriter');
	module.exports.parser = parser = require('./parser').parser;
	var ast = require('./nodes');
	
	// Instantiate a Lexer for our use here.
	module.exports.lex = lex = new lexer.Lexer();
	module.exports.Rewriter = Rewriter = rewriter.Rewriter;
	
	// The real Lexer produces a generic stream of tokens. This object provides a
	// thin wrapper around it, compatible with the Jison API. We can then pass it
	// directly as a "Jison lexer".
	
	var Highlighter=require('./highlighter').Highlighter;
	
	
	parser.lexer = lex.jisonBridge();
	parser.yy = ast; // everything is exported right here now
	
	function tokenize(code,o){
		if(o === undefined) o = {};
		try {
			lex.reset();
			return lex.tokenize(code,o);
		} catch (err) {
			throw err;
		};
	}; exports.tokenize = tokenize;
	
	function rewrite(tokens,o){
		if(o === undefined) o = {};
		var rewriter = new Rewriter();
		try {
			return rewriter.rewrite(tokens,o);
		} catch (err) {
			throw err;
		};
	}; exports.rewrite = rewrite;
	
	
	function parse(code,o){
		if(o === undefined) o = {};
		var tokens = code instanceof Array ? (code) : (tokenize(code,o));
		try {
			// console.log("Tokens",tokens)
			o._tokens = tokens;
			return parser.parse(tokens);
		} catch (err) {
			// console.log("ERROR",err)
			// err:message = "In {o:filename}, {err:message}" if o:filename
			if (o.filename) { err._filename = o.filename };
			throw err;
		};
	}; exports.parse = parse;
	
	
	function compile(code,o){
		if(o === undefined) o = {};
		var ast = parse(code,o);
		try {
			return ast.compile(o);
		} catch (err) {
			if (o.filename) { err._filename = o.filename };
			// err:message = "In {o:filename}, {err:message}" if o:filename
			throw err;
		};
	}; exports.compile = compile;
	
	
	function highlight(code,o){
		
		if(o === undefined) o = {};
		var tokens = o.tokens || tokenize(code,o);
		var ast = o.ast || parse(tokens,o);
		var hl = new Highlighter(code,tokens,ast,o);
		return hl.process();
		// try
		// 	return ast.compile(o)
		// catch err
		// 	err:_filename = o:filename if o:filename
		// 	# err:message = "In {o:filename}, {err:message}" if o:filename
		// 	throw err
	}; exports.highlight = highlight;
	
	
	
	function run(code,pars){
		if(!pars||pars.constructor !== Object) pars = {};
		var filename = pars.filename !== undefined ? pars.filename : null;
		var main = require.main;
		main.filename = process.argv[1] = (filename ? (fs.realpathSync(filename)) : ('.'));
		main.moduleCache && (main.moduleCache = {}); // removing all cache?!?
		
		var Module = require('module').Module;
		main.paths = Module._nodeModulePaths(path.dirname(filename));
		
		if (path.extname(main.filename) != '.imba' || require.extensions) {
			var content = compile(code,arguments[1]);
			return main._compile((content.js || content),main.filename);
		} else {
			return main._compile(code,main.filename);
		};
	}; exports.run = run;
	
	if (require.extensions) {
		require.extensions['.imba'] = function(mod,filename) {
			var content = compile(fs.readFileSync(filename,'utf8'),{filename: filename});
			return mod._compile((content.js || content),filename);
		};
	};
	
	

})()