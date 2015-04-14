(function(){


	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	var lex;
	require('../imba');
	
	var lexer = require('./lexer');
	var parser = require('./parser').parser;
	var ast = require('./ast');
	// var vm = require 'vm'
	// require files needed to run imba
	// whole runtime - no?
	
	// should this really happen up here?
	
	// require '../imba/node'
	
	
	// setting up the actual compiler
	
	
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
			console.log("ERROR1",err);
			throw err;
		}
		;
	}; exports.tokenize = tokenize;
	
	
	function parse(code,o){
		try {
			// hmmm
			var tokens = (code instanceof Array) ? (code) : (tokenize(code));
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


}())