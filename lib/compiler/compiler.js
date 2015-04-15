(function(){


	var parser, lex, Rewriter;
	var fs = require('fs');
	var path = require('path');
	
	var imba = require('../imba');
	var lexer = require('./lexer');
	var rewriter = require('./rewriter');
	module.exports.parser = parser = require('./parser').parser;
	var ast = require('./nodes');
	
	var T = require('./token');
	
	// Instantiate a Lexer for our use here.
	module.exports.lex = lex = new lexer.Lexer();
	module.exports.Rewriter = Rewriter = rewriter.Rewriter;
	
	// The real Lexer produces a generic stream of tokens. This object provides a
	// thin wrapper around it, compatible with the Jison API. We can then pass it
	// directly as a "Jison lexer".
	
	parser.lexer = {
		yyloc: {
			first_column: 0,
			first_line: 1,
			last_line: 1,
			last_column: 0
		},
		
		lex: T.lex,
		
		setInput: function (tokens){
			this.yylloc = this.yyloc;
			this.tokens = tokens;
			return this.pos = 0;
		},
		
		upcomingInput: function (){
			return "";
		}
	};
	
	parser.yy = ast;// everything is exported right here now
	
	function tokenize(code,o){
		if(o === undefined) o = {};
		try {
			return lex.tokenize(code,o);
		}
		catch (err) {
			console.log("ERROR1",err);
			throw err;
		}
		;
	}; exports.tokenize = tokenize;
	
	function rewrite(tokens,o){
		if(o === undefined) o = {};
		var rewriter = new Rewriter();
		try {
			return rewriter.rewrite(tokens,o);
		}
		catch (err) {
			console.log("ERROR rewriting",err);
			throw err;
		}
		;
	}; exports.rewrite = rewrite;
	
	
	function parse(code,o){
		try {
			var tokens = (code instanceof Array) ? (code) : (tokenize(code));
			// console.log("Tokens",tokens)
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
			main._compile(compile(code,arguments[1]),main.filename)
		) : (
			main._compile(code,main.filename)
		);
		// self
	}; exports.run = run;
	
	if(require.extensions) {
		require.extensions['.imba'] = function (mod,filename){
			var content = compile(fs.readFileSync(filename,'utf8'),{filename: filename});
			return mod._compile(content,filename);
		};
	} else if(require.registerExtension) {
		require.registerExtension('.imba',function (content){
			return compile(content);
		});
	};


}())