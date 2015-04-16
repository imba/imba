(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.imbalang = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(){


	require('../imba');
	
	var compiler = require('./compiler');
	var parser = compiler.parser;
	
	function tokenize(code,o){
		if(o === undefined) o = {};
		return compiler.tokenize(code,o);
	}; exports.tokenize = tokenize;
	
	function rewrite(code,o){
		if(o === undefined) o = {};
		return compiler.rewrite(code,o);
	}; exports.rewrite = rewrite;
	
	function parse(code,o){
		return compiler.parse(code,o);
	}; exports.parse = parse;
	
	function compile(code,o){
		if(o === undefined) o = {};
		return compiler.compile(code,o);
	}; exports.compile = compile;


}())
},{"../imba":15,"./compiler":2}],2:[function(require,module,exports){
(function (process){
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
}).call(this,require('_process'))
},{"../imba":15,"./lexer":4,"./nodes":5,"./parser":6,"./rewriter":7,"./token":8,"_process":19,"fs":17,"module":17,"path":18}],3:[function(require,module,exports){
(function(){


	function brace(str){
		var lines = str.match(/\n/);
		// what about indentation?
		
		return (lines) ? (
			'{' + str + '\n}'
		) : (
			'{\n' + str + '\n}'
		);
	}; exports.brace = brace;
	
	function flatten(arr){
		var out = [];
		arr.forEach(function (v){
			return (v instanceof Array) ? (out.push.apply(out,flatten(v))) : (out.push(v));
		});
		return out;
	}; exports.flatten = flatten;
	
	
	function pascalCase(str){
		return str.replace(/(^|[\-\_\s])(\w)/g,function (m,v,l){
			return l.toUpperCase();
		});
	}; exports.pascalCase = pascalCase;
	
	function camelCase(str){
		return String(str).replace(/([\-\_\s])(\w)/g,function (m,v,l){
			return l.toUpperCase();
		});
	}; exports.camelCase = camelCase;
	
	function snakeCase(str){
		var str = str.replace(/([\-\s])(\w)/g,'_');
		return str.replace(/()([A-Z])/g,"_$1",function (m,v,l){
			return l.toUpperCase();
		});
	}; exports.snakeCase = snakeCase;
	
	function setterSym(sym){
		return camelCase(("set-" + sym));
	}; exports.setterSym = setterSym;
	
	function quote(str){
		return '"' + str + '"';
	}; exports.quote = quote;
	
	function singlequote(str){
		return "'" + str + "'";
	}; exports.singlequote = singlequote;
	
	function symbolize(str){
		var sym = String(str).replace(/(.+)\=$/,"set-$1");
		sym = sym.replace(/(.+)\?$/,"is-$1");
		sym = sym.replace(/([\-\s])(\w)/g,function (m,v,l){
			return l.toUpperCase();
		});
		return sym;
	}; exports.symbolize = symbolize;
	
	function indent(str){
		return String(str).replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
	}; exports.indent = indent;
	
	function bracketize(str,ind){
		if(ind === undefined) ind = true;
		if(ind) {
			str = "\n" + indent(str) + "\n";
		};
		return '{' + str + '}';
	}; exports.bracketize = bracketize;
	
	function parenthesize(str){
		return '(' + String(str) + ')';
	}; exports.parenthesize = parenthesize;


}())
},{}],4:[function(require,module,exports){
(function(){


	// helper for subclassing
	function subclass$(obj,sup) {
		for (var k in sup) {
			if (sup.hasOwnProperty(k)) obj[k] = sup[k];
		};
		// obj.__super__ = sup;
		obj.prototype = Object.create(sup.prototype);
		obj.__super__ = obj.prototype.__super__ = sup.prototype;
		obj.prototype.initialize = obj.prototype.constructor = obj;
	};
	
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	function idx$(a,b){
		return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
	};
	
	// externs;
	
	var T = require('./token');
	var Token = T.Token;
	
	var rw = require('./rewriter');
	var Rewriter = rw.Rewriter;
	var INVERSES = rw.INVERSES;
	
	/* @class LexerError */
	function LexerError(message,file,line){
		this.message = message;
		this.file = file;
		this.line = line;
		return this;
	};
	
	subclass$(LexerError,SyntaxError);
	exports.LexerError = LexerError; // export class 
	
	
	
	function starts(string,literal,start){
		return string.substr(start,literal.length) == literal;
		// could rather write as string.indexOf(literal) == 0
	};
	
	function last(array,back){
		if(back === undefined) back = 0;
		return array[array.length - back - 1];
	};
	
	function count(str,substr){
		var num = 0;
		var pos = 0;
		if(!(substr.length)) {
			return 1 / 0;
		};
		
		while(pos = 1 + str.indexOf(substr,pos)){
			num++;
		};
		return num;
	};
	
	// def tV tok
	// 	tok.@value
	// 
	// def tVs tok, v
	// 	tok.@value = v
	// 	return
	// 
	// def tT tok
	// 	tok.@type
	// 
	// def tTs tok, v
	// 	tok.@type = v
	// 	return
	
	// def tV tok
	// 	tok[1]
	// 
	// def tVs tok, v
	// 	tok[1] = v
	// 	return
	// 
	// def tT tok
	// 	tok[0]
	// 
	// def tTs tok, v
	// 	tok[0] = v
	// 	return
	
	var tT = T.typ;
	var tV = T.val;
	var tTs = T.setTyp;
	var tVs = T.setVal;
	
	// The Lexer class reads a stream of Imba and divvies it up into tokidged
	// tokens. Some potential ambiguity in the grammar has been avoided by
	// pushing some extra smarts into the Lexer.
	
	// Based on the original lexer.coffee from CoffeeScript
	/* @class Lexer */
	function Lexer(){ };
	
	exports.Lexer = Lexer; // export class 
	Lexer.prototype.tokenize = function (code,o){
		var tok;
		if(o === undefined) o = {};
		if(WHITESPACE.test(code)) {
			code = ("\n" + code);
		};
		
		// this makes us lose the loc-info, no?
		code = code.replace(/\r/g,'').replace(TRAILING_SPACES,'');
		
		this._last = null;
		this._lastTyp = null;
		this._lastVal = null;
		
		this._code = code;// The remainder of the source code.
		this._opts = o;
		this._line = o.line || 0;// The current line.
		this._indent = 0;// The current indentation level.
		this._indebt = 0;// The over-indentation at the current level.
		this._outdebt = 0;// The under-outdentation at the current level.
		this._indents = [];// The stack of all current indentation levels.
		this._ends = [];// The stack for pairing up tokens.
		this._tokens = [];// Stream of parsed tokens in the form `['TYPE', value, line]`.
		this._char = null;
		this._locOffset = o.loc || 0;
		
		if(o.profile) {
			console.time("tokenize:lexer");
		};
		
		var contexts = {
			TAG: this.tagContextToken
		};
		
		var fn = null;
		var i = 0;
		
		while(this._chunk = code.slice(i)){
			this._loc = this._locOffset + i;
			this._end = this._ends[this._ends.length - 1];
			var chr = this._char = this._chunk[0];
			fn = contexts[this._end];
			
			if(chr == '@') {
				i += this.identifierToken() || this.literalToken();
			} else {
				i += fn && fn.call(this) || this.basicContext();// selectorToken || symbolToken || methodNameToken || identifierToken || whitespaceToken || lineToken || commentToken || heredocToken || tagToken || stringToken || numberToken || regexToken || jsToken || literalToken
			};
		};
		
		this.closeIndentation();
		if(tok = this._ends.pop()) {
			this.error(("missing " + tok));
		};
		if(o.profile) {
			console.timeEnd("tokenize:lexer");
		};
		
		// compatibility
		this.tokens = this._tokens;
		
		if(o.rewrite == false || o.norewrite) {
			return this._tokens;
		};
		this._tokens;
		
		return new Rewriter().rewrite(this._tokens,o);
	};
	
	
	Lexer.prototype.basicContext = function (){
		return this.selectorToken() || this.symbolToken() || this.methodNameToken() || this.identifierToken() || this.whitespaceToken() || this.lineToken() || this.commentToken() || this.heredocToken() || this.tagToken() || this.stringToken() || this.numberToken() || this.regexToken() || this.jsToken() || this.literalToken();
	};
	
	
	Lexer.prototype.context = function (opt){
		var o;
		var i = this._ends.length - 1;
		return (opt) ? (
			o = this._ends["_" + i],
			o && o[opt]
		) : (
			this._ends[i]
		);
	};
	
	
	Lexer.prototype.pushEnd = function (val){
		this._ends.push(val);
		return this;
	};
	
	
	Lexer.prototype.scope = function (sym,opts){
		var len = this._ends.push(sym);
		// console.log "scoping",sym,opts,@ends,len
		
		if(opts) {
			this._ends["_" + (len - 1)] = opts;
		};
		
		return sym;
	};
	
	
	Lexer.prototype.closeSelector = function (){
		return (this.context() == '%') && (this.pair('%'));
	};
	
	
	Lexer.prototype.openDef = function (){
		return this._ends.push('DEF');
	};
	
	
	Lexer.prototype.closeDef = function (){
		if(this.context() == 'DEF') {
			var pop;
			var prev = last(this._tokens);
			// console.log "close def {prev}"
			// console.log('closeDef with last>',prev)
			if(tT(prev) == 'DEF_FRAGMENT') {
				true;
			} else {
				if(tT(prev) == 'TERMINATOR') {
					pop = this._tokens.pop();
				};
				
				this.token('DEF_BODY','DEF_BODY');
				if(pop) {
					this._tokens.push(pop);
				};
			};
			
			
			this.pair('DEF');
		};
		return;
	};
	
	
	
	Lexer.prototype.tagContextToken = function (){
		var match;
		if(match = TAG_TYPE.exec(this._chunk)) {
			this.token('TAG_TYPE',match[0]);
			return match[0].length;
		};
		
		if(match = TAG_ID.exec(this._chunk)) {
			var input = match[0];
			this.token('TAG_ID',input);
			return input.length;
		};
		
		return 0;
	};
	
	
	Lexer.prototype.tagToken = function (){
		var match, ary;
		if(!(match = TAG.exec(this._chunk))) {
			return 0;
		};
		var ary=iter$(match);var input = ary[(0)],type = ary[(1)],identifier = ary[(2)];
		
		if(type == '<') {
			this.token('TAG_START','<');
			this._ends.push(INVERSES.TAG_START);
			
			if(identifier) {
				if(identifier.substr(0,1) == '{') {
					return type.length;
				} else {
					this.token('TAG_NAME',input.substr(1));
				};
			};
		};
		
		return input.length;
	};
	
	
	Lexer.prototype.selectorToken = function (){
		var ary, string;
		var match;
		
		// special handling if we are in this context
		if(this.context() == '%') {
			var chr = this._chunk.charAt(0);
			
			if(match = SELECTOR_COMBINATOR.exec(this._chunk)) {
				if(this.context('open')) {
					this.pair('%');
					return 0;
				};
				this.token('SELECTOR_COMBINATOR',match[1] || " ");
				return match[0].length;
			} else if(match = SELECTOR_PART.exec(this._chunk)) {
				var type = match[1];
				var id = match[2];
				
				switch(type) {
					case '.':
						tokid = 'SELECTOR_CLASS';break;
					
					case '#':
						tokid = 'SELECTOR_ID';break;
					
					case ':':
						tokid = 'SELECTOR_PSEUDO_CLASS';break;
					
					case '::':
						tokid = 'SELECTOR_PSEUDO_CLASS';break;
					
					default:
					
						var tokid = 'SELECTOR_TAG';
				
				};
				
				this.token(tokid,match[2]);
				return match[0].length;
			} else if(chr == '[') {
				this.token('[','[');
				this._ends.push(']');
				if(match = SELECTOR_ATTR.exec(this._chunk)) {
					this.token('IDENTIFIER',match[1]);
					this.token('SELECTOR_ATTR_OP',match[2]);
					return match[0].length;
				};
				return 1;
			} else if(chr == '|') {
				var tok = this._tokens[this._tokens.length - 1];
				tTs(tok,'SELECTOR_NS');
				// tok[0] = 'SELECTOR_NS' # FIX
				return 1;
			} else if(chr == ',') {
				if(this.context('open')) {
					this.pair('%');
					return 0;
				};
				
				this.token('SELECTOR_GROUP',',');
				return 1;
			} else if(chr == '*') {
				this.token('UNIVERSAL_SELECTOR','*');
				return 1;
			} else if(idx$(chr,[')','}',']','']) >= 0) {
				this.pair('%');
				return 0;
			};
			
			// how to get out of the scope?
		};
		
		
		if(!(match = SELECTOR.exec(this._chunk))) {
			return 0;
		};
		var ary=iter$(match);var input = ary[(0)],id = ary[(1)],kind = ary[(2)];
		
		// this is a closed selector
		if(kind == '(') {
			this.token('(','(');
			this.token('SELECTOR_START',id);
			this._ends.push(')');
			this._ends.push('%');
			return id.length + 1;
		} else if(id == '%') {
			if(this.context() == '%') {
				return 1;
			};
			this.token('SELECTOR_START',id);
			// get into the selector-scope
			this.scope('%',{open: true});
			// @ends.push '%'
			// make sure a terminator breaks out
			return id.length;
		} else {
			return 0;
		};
		
		if(idx$(id,['%','$']) >= 0 && idx$(chr,['%','$','@','(','[']) >= 0) {
			var idx = 2;
			
			
			// VERY temporary way of solving this
			if(idx$(chr,['%','$','@']) >= 0) {
				id += chr;
				idx = 3;
				chr = this._chunk.charAt(2);
			};
			
			
			if(chr == '(') {
				if(!(string = this.balancedSelector(this._chunk,')'))) {
					return 0;
				};
				if(0 < string.indexOf('{',1)) {
					this.token('SELECTOR',id);
					this.interpolateSelector(string.slice(idx,-1));
					return string.length;
				} else {
					this.token('SELECTOR',id);
					this.token('(','(');
					this.token('STRING','"' + string.slice(idx,-1) + '"');
					this.token(')',')');
					return string.length;
				};
			} else if(chr == '[') {
				this.token('SELECTOR',id);
				return 1;
				// token '[','['
				// @ends.push ''
			};
		} else {
			return 0;
		};
	};
	
	// is this really needed? Should be possible to
	// parse the identifiers and = etc i jison?
	// what is special about methodNameToken? really?
	Lexer.prototype.methodNameToken = function (){
		if(this._char == ' ') {
			return 0;
		};
		
		var match;
		
		var outerctx = this._ends[this._ends.length - 2];
		var innerctx = this._ends[this._ends.length - 1];
		
		if(outerctx == '%' && innerctx == ')') {
			if(match = TAG_ATTR.exec(this._chunk)) {
				this.token('TAG_ATTR_SET',match[1]);
				return match[0].length;
			};
		};
		
		if(!(match = METHOD_IDENTIFIER.exec(this._chunk))) {
			return 0;
		};
		// var prev = last @tokens
		var length = match[0].length;
		
		var id = match[0];
		var typ = 'IDENTIFIER';
		var pre = id.substr(0,1);
		var space = false;
		
		if(!(idx$(this._lastTyp,['.','DEF']) >= 0 || idx$(match[4],['!','?']) >= 0 || match[5])) {
			return 0;
		};
		
		if(idx$(id.toUpperCase(),['SELF','THIS']) >= 0) {
			return 0;
		};
		
		if(id == 'super') {
			return 0;
		};
		
		if(id == 'new') {
			typ = 'NEW';
		};
		
		if(id == '...' && idx$(this._lastTyp,[',','(','CALL_START','BLOCK_PARAM_START','PARAM_START']) >= 0) {
			return 0;
		};
		
		if(id == '|') {
			if(idx$(this._lastTyp,['(','CALL_START']) >= 0) {
				this.token('DO','DO');
				this._ends.push('|');
				this.token('BLOCK_PARAM_START',id);
				return length;
			} else if(idx$(this._lastTyp,['DO','{']) >= 0) {
				this._ends.push('|');
				this.token('BLOCK_PARAM_START',id);
				return length;
			} else if(this._ends[this._ends.length - 1] == '|') {
				this.token('BLOCK_PARAM_END','|');
				this.pair('|');
				return length;
			} else {
				return 0;
			};
		};
		
		// whaat?
		// console.log("method identifier",id)
		if((idx$(id,['&','^','<<','<<<','>>']) >= 0 || (id == '|' && this.context() != '|'))) {
			return 0;
		};
		
		if(idx$(id,OP_METHODS) >= 0) {
			space = true;
		};
		
		if(pre == '@') {
			typ = 'IVAR';
		} else if(pre == '$') {
			typ = 'GVAR';
		} else if(pre == '#') {
			typ = 'TAGID';
		} else if(CONST_IDENTIFIER.test(pre) || idx$(id,GLOBAL_IDENTIFIERS) >= 0) {
			typ = 'CONST';
		};
		
		// if match[4] or match[5] or id == 'eval' or id == 'arguments' or id in JS_FORBIDDEN
		// 	console.log('got here')
		// 	true
		
		if(match[5] && idx$(this._lastTyp,['IDENTIFIER','CONST','GVAR','CVAR','IVAR','SELF','THIS',']','}',')','NUMBER','STRING','IDREF']) >= 0) {
			this.token('.','.');
		};
		
		this.token(typ,id);
		
		if(space) {
			last(this._tokens).spaced = true;
		};
		
		return length;
	};
	
	
	Lexer.prototype.inTag = function (){
		var ctx1 = this._ends[this._ends.length - 2];
		var ctx0 = this._ends[this._ends.length - 1];
		return ctx0 == 'TAG_END' || (ctx1 == 'TAG_END' && ctx0 == 'OUTDENT');
	};
	
	// Matches identifying literals: variables, keywords, method names, etc.
	// Check to ensure that JavaScript reserved words aren't being used as
	// identifiers. Because Imba reserves a handful of keywords that are
	// allowed in JavaScript, we're careful not to tokid them as keywords when
	// referenced as property names here, so you can still do `jQuery.is()` even
	// though `is` means `===` otherwise.
	Lexer.prototype.identifierToken = function (){
		var ary;
		var match;
		
		var ctx1 = this._ends[this._ends.length - 2];
		var ctx0 = this._ends[this._ends.length - 1];
		var innerctx = ctx0;
		var typ;
		var reserved = false;
		
		var addLoc = false;
		var inTag = ctx0 == 'TAG_END' || (ctx1 == 'TAG_END' && ctx0 == 'OUTDENT');
		
		// console.log ctx1,ctx0
		
		if(inTag && (match = TAG_ATTR.exec(this._chunk))) {
			if(this._lastTyp != 'TAG_NAME') {
				if(this._lastTyp == 'TERMINATOR') {
					true;
				} else {
					this.token(",",",");
				};
			};
			
			this.token('TAG_ATTR',match[1]);
			this.token('=','=');
			return match[0].length;
		};
		
		// see if this is a plain object-key
		// way too much logic going on here?
		// the ast should normalize whether keys
		// are accessable as keys or strings etc
		if(match = OBJECT_KEY.exec(this._chunk)) {
			var id = match[1];
			typ = 'IDENTIFIER';
			
			this.token(typ,id);
			this.token(':',':');
			
			return match[0].length;
		};
		
		if(!(match = IDENTIFIER.exec(this._chunk))) {
			return 0;
		};
		
		var ary=iter$(match);var input = ary[(0)],id = ary[(1)],typ = ary[(2)],m3 = ary[(3)],m4 = ary[(4)],colon = ary[(5)];
		
		// What is the logic here?
		if(id == 'own' && this.tokid() == 'FOR') {
			this.token('OWN',id);
			return id.length;
		};
		
		var prev = last(this._tokens);
		var lastTyp = this._lastTyp;
		// should we force this to be an identifier even if it is a reserved word?
		// this should only happen for when part of object etc
		// will prev ever be @???
		var forcedIdentifier;
		
		forcedIdentifier = colon || lastTyp == '.' || lastTyp == '?.';// in ['.', '?.'
		
		
		// temp hack! need to solve for other keywords etc as well
		// problem appears with ternary conditions.
		
		// well -- it should still be an indentifier if in object?
		// forcedIdentifier = no if id in ['undefined','break']
		
		if(colon && lastTyp == '?') {
			forcedIdentifier = false;
		};// for ternary
		
		// if we are not at the top level? -- hacky
		if(id == 'tag' && this._chunk.indexOf("tag(") == 0) {
			forcedIdentifier = true;
		};
		
		// console.log "match",match
		// console.log "typ is {typ}"
		// little reason to check for this right here? but I guess it is only a simple check
		if(typ == '$' && ARGVAR.test(id)) {
			if(id == '$0') {
				typ = 'ARGUMENTS';
			} else {
				typ = 'ARGVAR';
				id = id.substr(1);
			};
		} else if(typ == '@') {
			typ = 'IVAR';
			
			// id:reserved = yes if colon
		} else if(typ == '#') {
			typ = 'IDENTIFIER';
			this.token('#','#');
			id = id.substr(1);
		} else if(typ == '@@') {
			typ = 'CVAR';
		} else if(typ == '$' && !colon) {
			typ = 'GVAR';
		} else if(CONST_IDENTIFIER.test(id) || idx$(id,GLOBAL_IDENTIFIERS) >= 0) {
			typ = 'CONST';
		} else if(id == 'elif') {
			this.token('ELSE','else');
			this.token('IF','if');
			return id.length;
		} else {
			typ = 'IDENTIFIER';
		};
		
		if(!forcedIdentifier && (idx$(id,JS_KEYWORDS) >= 0 || idx$(id,IMBA_KEYWORDS) >= 0)) {
			typ = id.toUpperCase();
			addLoc = true;
			
			if(typ == 'TAG') {
				this._ends.push('TAG');
			};
			// FIXME @ends is not used the way it is supposed to..
			// what we want is a context-stack
			if(typ == 'DEF') {
				this.openDef();
			} else if(typ == 'DO') {
				if(this.context() == 'DEF') {
					this.closeDef();
				};
			} else if(typ == 'WHEN' && idx$(this.tokid(),LINE_BREAK) >= 0) {
				typ = 'LEADING_WHEN';
			} else if(typ == 'FOR') {
				this._seenFor = true;
			} else if(typ == 'UNLESS') {
				typ = 'IF';// WARN
			} else if(idx$(typ,UNARY) >= 0) {
				typ = 'UNARY';
			} else if(idx$(typ,RELATION) >= 0) {
				if(idx$(typ,['INSTANCEOF','ISA']) == -1 && this._seenFor) {
					typ = 'FOR' + typ;// ?
					this._seenFor = false;
				} else {
					typ = 'RELATION';
					if(this.value().toString() == '!') {
						this._tokens.pop();// is fucked up??!
						// WARN we need to keep the loc, no?
						id = '!' + id;
					};
				};
			};
		};
		
		if(id == 'super') {
			typ = 'SUPER';
		} else if(id == 'eval' || id == 'arguments' || idx$(id,JS_FORBIDDEN) >= 0) {
			if(forcedIdentifier) {
				typ = 'IDENTIFIER';
				reserved = true;
			} else if(idx$(id,RESERVED) >= 0) {
				reserved = true;
			};
		};
		
		if(!forcedIdentifier) {
			if(idx$(id,IMBA_ALIASES) >= 0) {
				id = IMBA_ALIAS_MAP[id];
			};
			switch(id) {
				case '√':
					typ = 'SQRT';break;
				
				case 'ƒ':
					typ = 'FUNC';break;
				
				case '!':
					typ = 'UNARY';break;
				
				case '==':
				case '!=':
				case '===':
				case '!==':
					typ = 'COMPARE';break;
				
				case '&&':
				case '||':
					typ = 'LOGIC';break;
				
				case '∪':
				case '∩':
					typ = 'MATH';break;
				
				case 'true':
				case 'false':
				case 'null':
				case 'nil':
				case 'undefined':
					typ = 'BOOL';break;
				
				case 'break':
				case 'continue':
				case 'debugger':
				case 'arguments':
					typ = id.toUpperCase();break;
			
			};
		};
		
		// prev = last @tokens
		var len = input.length;
		
		// should be strict about the order, check this manually instead
		if(typ == 'CLASS' || typ == 'DEF' || typ == 'TAG' || typ == 'VAR') {
			var i = this._tokens.length;
			// console.log("FOUND CLASS/DEF",i)
			while(i){
				var prev = this._tokens[--i];
				var ctrl = "" + tV(prev);
				// console.log("ctrl is {ctrl}")
				// need to coerce to string because of stupid CS ===
				// console.log("prev is",prev[0],prev[1])
				if(idx$(ctrl,IMBA_CONTEXTUAL_KEYWORDS) >= 0) {
					tTs(prev,ctrl.toUpperCase());
					// prev[0] = ctrl.toUpperCase # FIX
				} else {
					break;
				};
			};
		};
		
		if(typ == 'IMPORT') {
			this._ends.push('IMPORT');
		} else if(id == 'from' && ctx0 == 'IMPORT') {
			typ = 'FROM';
			this.pair('IMPORT');
		} else if(id == 'as' && ctx0 == 'IMPORT') {
			typ = 'AS';
			this.pair('IMPORT');
		};
		
		if(typ == 'IDENTIFIER') {
			if(lastTyp == 'CATCH') {
				typ = 'CATCH_VAR';
			};
			this.token(typ,id,len);// what??
		} else if(addLoc) {
			this.token(typ,id,len,true);
		} else {
			this.token(typ,id);
		};
		
		if(colon) {
			this.token(':',':');
		};// _what_?
		return len;
	};
	
	// Matches numbers, including decimals, hex, and exponential notation.
	// Be careful not to interfere with ranges-in-progress.
	Lexer.prototype.numberToken = function (){
		var binaryLiteral;
		var match,number,lexedLength;
		
		if(!(match = NUMBER.exec(this._chunk))) {
			return 0;
		};
		
		number = match[0];
		lexedLength = number.length;
		
		if(binaryLiteral = /0b([01]+)/.exec(number)) {
			number = (parseInt(binaryLiteral[1],2)).toString();
		};
		
		var prev = last(this._tokens);
		
		if(match[0][0] == '.' && prev && !(prev.spaced) && idx$(tT(prev),['IDENTIFIER',')','}',']','NUMBER']) >= 0) {
			this.token(".",".");
			number = number.substr(1);
		};
		
		this.token('NUMBER',number);
		return lexedLength;
	};
	
	Lexer.prototype.symbolToken = function (){
		var match,symbol,prev;
		
		if(!(match = SYMBOL.exec(this._chunk))) {
			return 0;
		};
		symbol = match[0].substr(1);
		prev = last(this._tokens);
		
		// is this a property-access?
		// should invert this -- only allow when prev IS .. 
		// hmm, symbols not be quoted initially
		// : should be a token itself, with a specification of spacing (LR,R,L,NONE)
		
		// FIX
		if(prev && !(prev.spaced) && idx$(tT(prev),['(','{','[','.','RAW_INDEX_START','CALL_START','INDEX_START',',','=','INDENT','TERMINATOR']) == -1) {
			this.token('.','.');
			symbol = symbol.split(/[\:\\\/]/)[0];// really?
			// token 'SYMBOL', "'#{symbol}'"
			this.token('SYMBOL',symbol);
			return symbol.length + 1;
		} else {
			this.token('SYMBOL',symbol);
			return match[0].length;
		};
	};
	
	// Matches strings, including multi-line strings. Ensures that quotation marks
	// are balanced within the string's contents, and within nested interpolations.
	Lexer.prototype.stringToken = function (){
		var match,string;
		
		switch(this._chunk.charAt(0)) {
			case "'":
				if(!(match = SIMPLESTR.exec(this._chunk))) {
					return 0;
				};
				this.token('STRING',(string = match[0]).replace(MULTILINER,'\\\n'));
				break;
			
			case '"':
				if(!(string = this.balancedString(this._chunk,'"'))) {
					return 0;
				};
				if(string.indexOf('{') >= 0) {
					this.interpolateString(string.slice(1,-1));
				} else {
					this.token('STRING',this.escapeLines(string));
				};
				break;
			
			default:
			
				return 0;
		
		};
		this._line += count(string,'\n');
		
		return string.length;
	};
	
	// Matches heredocs, adjusting indentation to the correct level, as heredocs
	// preserve whitespace, but ignore indentation to the left.
	Lexer.prototype.heredocToken = function (){
		var match,heredoc,quote,doc;
		
		if(!(match = HEREDOC.exec(this._chunk))) {
			return 0;
		};
		
		heredoc = match[0];
		quote = heredoc.charAt(0);
		doc = this.sanitizeHeredoc(match[2],{quote: quote,indent: null});
		
		if(quote == '"' && 0 <= doc.indexOf('{')) {
			this.interpolateString(doc,{heredoc: true});
		} else {
			this.token('STRING',this.makeString(doc,quote,true));
		};
		
		this._line += count(heredoc,'\n');
		
		return heredoc.length;
	};
	
	// Matches and consumes comments.
	Lexer.prototype.commentToken = function (){
		var match,length,comment,indent,prev;
		
		var typ = 'HERECOMMENT';
		
		if(match = this._chunk.match(INLINE_COMMENT)) {
			length = match[0].length;
			comment = match[2];
			indent = match[1];
			// console.log "match inline token (#{indent}) indent",comment,@indent,indent:length
			// ADD / FIX INDENTATION? 
			prev = last(this._tokens);
			var pt = prev && tT(prev);
			var note = '// ' + comment.substr(2);
			
			if(pt && idx$(pt,['INDENT','TERMINATOR']) == -1) {
				this.token('TERMINATOR',note);// + '\n' # hmmm // hmmm
				// not sure about this
				return length;
			} else {
				if(pt == 'TERMINATOR') {
					tVs(prev,tV(prev) + note);
					// prev[1] += note
				} else if(pt == 'INDENT') {
					this.addLinebreaks(1,note);
				} else {
					this.token(typ,comment.substr(2));// are we sure?
				};
				// addLinebreaks(5)
				false;
				// maybe add a linebreak here?
				// addLinebreaks(0)
				// token 'TERMINATOR', '\\n' # hmm
			};
			
			return length;// disable now while compiling
		};
		
		// should use exec?
		if(!(match = this._chunk.match(COMMENT))) {
			return 0;
		};
		
		comment = match[0];
		var here = match[1];
		
		if(here) {
			this.token('HERECOMMENT',this.sanitizeHeredoc(here,{herecomment: true,indent: Array(this._indent + 1).join(' ')}));
			this.token('TERMINATOR','\n');
		} else {
			this.token('HERECOMMENT',comment);
			this.token('TERMINATOR','\n');
		};
		
		this._line += count(comment,'\n');
		
		return comment.length;
	};
	
	// Matches JavaScript interpolated directly into the source via backticks.
	Lexer.prototype.jsToken = function (){
		var match,script;
		
		if(!(this._chunk.charAt(0) == '`' && (match = JSTOKEN.exec(this._chunk)))) {
			return 0;
		};
		this.token('JS',(script = match[0]).slice(1,-1));
		return script.length;
	};
	
	// Matches regular expression literals. Lexing regular expressions is difficult
	// to distinguish from division, so we borrow some basic heuristics from
	// JavaScript and Ruby.
	Lexer.prototype.regexToken = function (){
		var ary;
		var match,length,prev;
		
		if(this._chunk.charAt(0) != '/') {
			return 0;
		};
		if(match = HEREGEX.exec(this._chunk)) {
			length = this.heregexToken(match);
			this._line += count(match[0],'\n');
			return length;
		};
		
		prev = last(this._tokens);
		// FIX
		if(prev && (idx$(tT(prev),((prev.spaced) ? (
			NOT_REGEX
		) : (
			NOT_SPACED_REGEX
		))) >= 0)) {
			return 0;
		};
		if(!(match = REGEX.exec(this._chunk))) {
			return 0;
		};
		var ary=iter$(match);var m = ary[(0)],regex = ary[(1)],flags = ary[(2)];
		
		// FIXME
		// if regex[..1] is '/*'
		// error 'regular expressions cannot begin with `*`'
		
		if(regex == '//') {
			regex = '/(?:)/';
		};
		
		this.token('REGEX',("" + regex + flags));
		return m.length;
	};
	
	// Matches multiline extended regular expressions.
	Lexer.prototype.heregexToken = function (match){
		var ary;
		var ary=iter$(match);var heregex = ary[(0)],body = ary[(1)],flags = ary[(2)];
		
		if(0 > body.indexOf('#{')) {
			var re = body.replace(HEREGEX_OMIT,'').replace(/\//g,'\\/');
			
			if(re.match(/^\*/)) {
				this.error('regular expressions cannot begin with `*`');
			};
			
			this.token('REGEX',("/" + (re || '(?:)'
			) + "/" + flags));
			return heregex.length;
		};
		
		this.token('CONST','RegExp');
		this._tokens.push(T.token('CALL_START','('));
		var tokens = [];
		
		for(var i=0, items=iter$(this.interpolateString(body,{regex: true})), len=items.length, pair; i < len; i++) {
			pair = items[i];var tokid = tT(pair);// FIX
			var value = tV(pair);// FIX
			
			if(tokid == 'TOKENS') {
				tokens.push.apply(tokens,value);
			} else {
				if(!(value = value.replace(HEREGEX_OMIT,''))) {
					continue;
				};
				
				value = value.replace(/\\/g,'\\\\');
				tokens.push(T.token('STRING',this.makeString(value,'"',true)));// FIX
			};
			tokens.push(T.token('+','+'));// FIX
		};
		
		tokens.pop();
		
		// FIX
		if(!(tokens[0] && tT(tokens[0]) == 'STRING')) {
			this._tokens.push(T.token('STRING','""'),T.token('+','+'));
		};
		
		this._tokens.push.apply(this._tokens,tokens);// what is this?
		// FIX
		if(flags) {
			this._tokens.push(T.token(',',','),T.token('STRING','"' + flags + '"'));
		};
		this.token(')',')');
		
		return heregex.length;
	};
	
	// Matches newlines, indents, and outdents, and determines which is which.
	// If we can detect that the current line is continued onto the the next line,
	// then the newline is suppressed:
	// 	#     elements
	//       .each( ... )
	//       .map( ... )
	// 	# Keeps track of the level of indentation, because a single outdent token
	// can close multiple indents, so we need to know how far in we happen to be.
	Lexer.prototype.lineToken = function (){
		var match;
		
		if(!(match = MULTI_DENT.exec(this._chunk))) {
			return 0;
		};
		
		if(this._ends[this._ends.length - 1] == '%') {
			this.pair('%');
		};
		
		var indent = match[0];
		var brCount = count(indent,'\n');
		
		this._line += brCount;
		this._seenFor = false;
		
		var prev = last(this._tokens,1);
		var size = indent.length - 1 - indent.lastIndexOf('\n');
		var noNewlines = this.unfinished();
		
		// console.log "noNewlines",noNewlines
		// console.log "lineToken -- ",@chunk.substr(0,10),"--"
		if(this._chunk.match(/^\n#\s/)) {
			this.addLinebreaks(1);
			// console.log "add terminator"
			return 0;
		};
		
		if(size - this._indebt == this._indent) {
			if(noNewlines) {
				this.suppressNewlines();
			} else {
				this.newlineToken(indent);
			};
			return indent.length;
		};
		
		if(size > this._indent) {
			if(noNewlines) {
				this._indebt = size - this._indent;
				this.suppressNewlines();
				return indent.length;
			};
			
			if(this.inTag()) {
				return indent.length;
			};
			
			
			var diff = size - this._indent + this._outdebt;
			this.closeDef();
			
			var immediate = last(this._tokens);
			
			if(immediate && tT(immediate) == 'TERMINATOR') {
				var node = new Number(diff);
				node.pre = immediate[1];
				// FIX
				tTs(immediate,'INDENT');
				tVs(immediate,node);
				// immediate[0] = 'INDENT'
				// immediate[1] = node # {count: diff, pre: immediate[0]}
			} else {
				this.token('INDENT',diff);
			};
			
			// console.log "indenting", prev, last(@tokens,1)
			// if prev and prev[0] == 'TERMINATOR'
			//   console.log "terminator before indent??"
			
			// check for comments as well ?
			
			this._indents.push(diff);
			this._ends.push('OUTDENT');
			this._outdebt = this._indebt = 0;
			this.addLinebreaks(brCount);
		} else {
			this._indebt = 0;
			this.outdentToken(this._indent - size,noNewlines,brCount);
			this.addLinebreaks(brCount - 1);
			// console.log "outdent",noNewlines,tokid()
		};
		
		this._indent = size;
		return indent.length;
	};
	
	// Record an outdent token or multiple tokens, if we happen to be moving back
	// inwards past several recorded indents.
	Lexer.prototype.outdentToken = function (moveOut,noNewlines,newlineCount){
		var dent = 0;
		while(moveOut > 0){
			var len = this._indents.length - 1;
			if(this._indents[len] == undefined) {
				moveOut = 0;
			} else if(this._indents[len] == this._outdebt) {
				moveOut -= this._outdebt;
				this._outdebt = 0;
			} else if(this._indents[len] < this._outdebt) {
				this._outdebt -= this._indents[len];
				moveOut -= this._indents[len];
			} else {
				dent = this._indents.pop() - this._outdebt;
				moveOut -= dent;
				this._outdebt = 0;
				
				if(!noNewlines) {
					this.addLinebreaks(1);
				};// hmm
				
				this.pair('OUTDENT');
				this.token('OUTDENT',dent);
			};
		};
		
		if(dent) {
			this._outdebt -= moveOut;
		};
		while(this.value() == ';'){
			this._tokens.pop();
		};
		// console.log "outdenting",tokid() 
		
		// addLinebreaks(1) unless noNewlines
		// really?
		if(!(this.tokid() == 'TERMINATOR' || noNewlines)) {
			this.token('TERMINATOR','\n');
		};
		
		var ctx = this.context();
		if(idx$(ctx,['%','TAG']) >= 0) {
			this.pair(ctx);
		};
		this.closeDef();
		return this;
	};
	
	// Matches and consumes non-meaningful whitespace. tokid the previous token
	// as being "spaced", because there are some cases where it makes a difference.
	Lexer.prototype.whitespaceToken = function (){
		var match,nline,prev;
		if(!((match = WHITESPACE.exec(this._chunk)) || (nline = this._chunk.charAt(0) == '\n'))) {
			return 0;
		};
		prev = last(this._tokens);
		
		// FIX - why oh why?
		if(prev) {
			if(match) {
				prev.spaced = true;
				return match[0].length;
			} else {
				prev.newLine = true;
				return 0;
			};
		};
	};
	
	Lexer.prototype.addNewline = function (){
		return this.token('TERMINATOR','\n');
	};
	
	Lexer.prototype.addLinebreaks = function (count,raw){
		var prev,br;
		
		if(!raw && count == 0) {
			return this;
		};// no terminators?
		
		prev = last(this._tokens);
		br = new Array(count + 1).join('\n');
		
		// FIX
		if(prev) {
			var t = tT(prev);
			var v = tV(prev);
			
			if(t == 'INDENT') {
				if(typeof v == 'object') {
					v.post = (v.post || "") + (raw || br);// FIX
					// console.log "adding terminator after indent"
				} else {
					tVs(prev,("" + v + "_" + count));// FIX
				};
				return this;
			};
			
			if(t == 'TERMINATOR') {
				tVs(prev,v + br);
				return this;
			};
		};
		
		this.token('TERMINATOR',br);
		return this;
	};
	
	// Generate a newline token. Consecutive newlines get merged together.
	Lexer.prototype.newlineToken = function (chunk){
		while(this.value() == ';'){
			this._tokens.pop();
		};// hmm
		var prev = last(this._tokens);
		
		var t = this.tokid();
		var lines = count(chunk,'\n');
		
		this.addLinebreaks(lines);
		
		var ctx = this.context();
		// WARN now import cannot go over multiple lines
		if(idx$(ctx,['%','TAG','IMPORT']) >= 0) {
			this.pair(ctx);
		};
		
		this.closeDef();
		
		return this;
	};
	
	// Use a `\` at a line-ending to suppress the newline.
	// The slash is removed here once its job is done.
	Lexer.prototype.suppressNewlines = function (){
		if(this.value() == '\\') {
			this._tokens.pop();
		};
		return this;
	};
	
	// We treat all other single characters as a token. E.g.: `( ) , . !`
	// Multi-character operators are also literal tokens, so that Jison can assign
	// the proper order of operations. There are some symbols that we tokid specially
	// here. `;` and newlines are both treated as a `TERMINATOR`, we distinguish
	// parentheses that indicate a method call from regular parentheses, and so on.
	Lexer.prototype.literalToken = function (){
		var match,value;
		if(match = OPERATOR.exec(this._chunk)) {
			value = match[0];
			if(CODE.test(value)) {
				this.tagParameters();
			};
		} else {
			value = this._chunk.charAt(0);
		};
		
		var end1 = this._ends[this._ends.length - 1];
		var end2 = this._ends[this._ends.length - 2];
		
		var inTag = end1 == 'TAG_END' || end1 == 'OUTDENT' && end2 == 'TAG_END';
		
		var tokid = value;
		var prev = last(this._tokens);
		var pt = prev && tT(prev);
		var pv = prev && tV(prev);
		var length = value.length;
		
		// is this needed?
		if(value == '=' && prev) {
			if(!(prev.reserved) && idx$(pv,JS_FORBIDDEN) >= 0) {
				this.error(("reserved word \"" + (value()) + "\" can't be assigned"));
			};
			
			// FIX
			if(idx$(pv,['||','&&']) >= 0) {
				tTs(prev,'COMPOUND_ASSIGN');
				tVs(prev,pv + '=');
				// prev[0] = 'COMPOUND_ASSIGN'
				// prev[1] += '='
				return value.length;
			};
		};
		
		if(value == ';') {
			this._seenFor = false;
			tokid = 'TERMINATOR';
		} else if(value == '(' && inTag && pt != '=' && prev.spaced) {
			this.token(',',',');
		} else if(value == '->' && inTag) {
			tokid = 'TAG_END';
			this.pair('TAG_END');
		} else if(value == '/>' && inTag) {
			tokid = 'TAG_END';
			this.pair('TAG_END');
		} else if(value == '>' && inTag) {
			tokid = 'TAG_END';
			this.pair('TAG_END');
		} else if(value == '>' && this.context() == 'DEF') {
			tokid = 'DEF_FRAGMENT';
		} else if(value == 'TERMINATOR' && end1 == '%') {
			this.closeSelector();
		} else if(value == 'TERMINATOR' && end1 == 'DEF') {
			this.closeDef();
		} else if(value == '&' && this.context() == 'DEF') {
			tokid = 'BLOCK_ARG';
			// change the next identifier instead?
		} else if(value == '*' && this._chunk.charAt(1).match(/[A-Za-z\_\@\[]/) && (prev.spaced || idx$(pv,[',','(','[','{','|','\n','\t']) >= 0)) {
			tokid = "SPLAT";
		} else if(value == '√') {
			tokid = 'SQRT';
		} else if(value == 'ƒ') {
			tokid = 'FUNC';
		} else if(idx$(value,MATH) >= 0) {
			tokid = 'MATH';
		} else if(idx$(value,COMPARE) >= 0) {
			tokid = 'COMPARE';
		} else if(idx$(value,COMPOUND_ASSIGN) >= 0) {
			tokid = 'COMPOUND_ASSIGN';
		} else if(idx$(value,UNARY) >= 0) {
			tokid = 'UNARY';
		} else if(idx$(value,SHIFT) >= 0) {
			tokid = 'SHIFT';
		} else if(idx$(value,LOGIC) >= 0) {
			tokid = 'LOGIC';// or value is '?' and prev?:spaced 
		} else if(prev && !(prev.spaced)) {
			if(value == '(' && end1 == '%') {
				tokid = 'TAG_ATTRS_START';
			} else if(value == '(' && idx$(pt,CALLABLE) >= 0) {
				tokid = 'CALL_START';
			} else if(value == '[' && idx$(pt,INDEXABLE) >= 0) {
				tokid = 'INDEX_START';
				if(pt == '?') {
					tTs(prev,'INDEX_SOAK');
				};
				// prev[0] = 'INDEX_SOAK' if prev[0] == '?'
			} else if(value == '{' && idx$(pt,INDEXABLE) >= 0) {
				tokid = 'RAW_INDEX_START';
			};
		};
		
		switch(value) {
			case '(':
			case '{':
			case '[':
				this._ends.push(INVERSES[value]);break;
			
			case ')':
			case '}':
			case ']':
				this.pair(value);break;
		
		};
		
		// hacky rule to try to allow for tuple-assignments in blocks
		// if value is ',' and prev[0] is 'IDENTIFIER' and @tokens[@tokens:length - 2][0] in ['TERMINATOR','INDENT']
		//   # token "TUPLE", "tuple" # should rather insert it somewhere else, no?
		//   console.log("found comma")
		
		this.token(tokid,value);
		return value.length;
	};
	
	// Token Manipulators
	// ------------------
	
	// Sanitize a heredoc or herecomment by
	// erasing all external indentation on the left-hand side.
	Lexer.prototype.sanitizeHeredoc = function (doc,options){
		var match;
		var indent = options.indent;
		var herecomment = options.herecomment;
		
		if(herecomment) {
			if(HEREDOC_ILLEGAL.test(doc)) {
				this.error("block comment cannot contain \"*/\", starting");
			};
			if(doc.indexOf('\n') <= 0) {
				return doc;
			};
		} else {
			var length_;
			while(match = HEREDOC_INDENT.exec(doc)){
				var attempt = match[1];
				if(indent == null || 0 < (length_=attempt.length) && length_ < indent.length) {
					indent = attempt;
				};
			};
		};
		
		if(indent) {
			doc = doc.replace(RegExp("\\n" + indent,"g"),'\n');
		};
		if(!herecomment) {
			doc = doc.replace(/^\n/,'');
		};
		return doc;
	};
	
	// A source of ambiguity in our grammar used to be parameter lists in function
	// definitions versus argument lists in function calls. Walk backwards, tokidging
	// parameters specially in order to make things easier for the parser.
	Lexer.prototype.tagParameters = function (){
		if(this.tokid() != ')') {
			return this;
		};
		var stack = [];
		var tokens = this._tokens;
		var i = tokens.length;
		
		tTs(tokens[--i],'PARAM_END');
		
		var tok;
		while(tok = tokens[--i]){
			var t = tT(tok);
			switch(t) {
				case ')':
					stack.push(tok);
					break;
				
				case '(':
				case 'CALL_START':
					if(stack.length) {
						stack.pop();
					} else if(t == '(') {
						tTs(tok,'PARAM_START');
						return this;
					} else {
						return this;
					};
					break;
			
			};
		};
		
		return this;
	};
	
	// Close up all remaining open blocks at the end of the file.
	Lexer.prototype.closeIndentation = function (){
		this.closeDef();
		this.closeSelector();
		return this.outdentToken(this._indent);
	};
	
	// Matches a balanced group such as a single or double-quoted string. Pass in
	// a series of delimiters, all of which must be nested correctly within the
	// contents of the string. This method allows us to have strings within
	// interpolations within strings, ad infinitum.
	Lexer.prototype.balancedString = function (str,end){
		var match,letter,prev;
		
		// console.log 'balancing string!', str, end
		var stack = [end];
		var i = 0;
		
		
		// had to fix issue after later versions of coffee-script broke old loop type
		// should submit bugreport to coffee-script
		while(i < (str.length - 1)){
			i++;
			var letter = str.charAt(i);
			switch(letter) {
				case '\\':
					i++;
					continue;
					break;
				
				case end:
					stack.pop();
					if(!(stack.length)) {
						var v = str.slice(0,i + 1);
						return v;
					};
					end = stack[stack.length - 1];
					continue;
					break;
			
			};
			
			
			if(end == '}' && idx$(letter,['"',"'"]) >= 0) {
				stack.push(end = letter);
			} else if(end == '}' && letter == '/' && (match = (HEREGEX.exec(str.slice(i)) || REGEX.exec(str.slice(i))))) {
				i += match[0].length - 1;
			} else if(end == '}' && letter == '{') {
				stack.push(end = '}');
			} else if(end == '"' && letter == '{') {
				stack.push(end = '}');
			};
			prev = letter;
		};
		
		return this.error(("missing " + (stack.pop()
		) + ", starting"));
	};
	
	// Expand variables and expressions inside double-quoted strings using
	// Ruby-like notation for substitution of arbitrary expressions.
	// 	#     "Hello #{name.capitalize()}."
	// 	# If it encounters an interpolation, this method will recursively create a
	// new Lexer, tokenize the interpolated contents, and merge them into the
	// token stream.
	Lexer.prototype.interpolateString = function (str,options){
		var interpolated;
		if(options === undefined) options = {};
		var heredoc = options.heredoc;
		var regex = options.regex;
		var prefix = options.prefix;
		
		
		var tokens = [];
		var pi = 0;
		var i = -1;
		
		var letter;
		var expr;
		
		var len;
		while(letter = str.charAt(i += 1)){
			if(letter == '\\') {
				i += 1;
				continue;
			};
			if(!(str.charAt(i) == '{' && (expr = this.balancedString(str.slice(i),'}')))) {
				continue;
			};
			
			if(pi < i) {
				tokens.push(T.token('NEOSTRING',str.slice(pi,i)));
			};
			var inner = expr.slice(1,-1);
			// console.log 'inner is',inner
			
			if(inner.length) {
				var nested = new Lexer().tokenize(inner,{line: this._line,rewrite: false,loc: this._loc + i + 2});
				nested.pop();
				
				if(nested[0] && tT(nested[0]) == 'TERMINATOR') {
					nested.shift();
				};
				
				if(len = nested.length) {
					if(len > 1) {
						nested.unshift(T.token('(','('));
						nested.push(T.token(')',')'));
					};
					// FIX FIX -- must change format
					tokens.push(T.token('TOKENS',nested));// hmmm --
				};
			};
			i += expr.length - 1;
			pi = i + 1;
		};
		
		if(i > pi && pi < str.length) {
			tokens.push(T.token('NEOSTRING',str.slice(pi)));
		};
		
		if(regex) {
			return tokens;
		};
		
		if(!(tokens.length)) {
			return this.token('STRING','""');
		};
		
		if(!(tT(tokens[0]) == 'NEOSTRING')) {
			tokens.unshift(T.token('',''));
		};
		
		if(interpolated = tokens.length > 1) {
			this.token('(','(');
		};
		
		for(var k=0, ary=iter$(tokens), len=ary.length, v; k < len; k++) {
			v = ary[k];var typ = tT(v);
			var value = tV(v);
			
			if(k) {
				this.token('+','+');
			};
			
			if(typ == 'TOKENS') {
				this._tokens.push.apply(this._tokens,value);
			} else {
				this.token('STRING',this.makeString(value,'"',heredoc));
			};
		};
		
		if(interpolated) {
			this.token(')',')');
		};
		return tokens;
	};
	
	// Matches a balanced group such as a single or double-quoted string. Pass in
	// a series of delimiters, all of which must be nested correctly within the
	// contents of the string. This method allows us to have strings within
	// interpolations within strings, ad infinitum.
	Lexer.prototype.balancedSelector = function (str,end){
		var prev;
		var letter;
		var stack = [end];
		// FIXME
		for(var len=str.length, i=1; i < len; i++) {
			switch(letter = str.charAt(i)) {
				case '\\':
					i++;
					continue;
					break;
				
				case end:
					stack.pop();
					if(!(stack.length)) {
						return str.slice(0,i + 1);
					};
					
					end = stack[stack.length - 1];
					continue;
					break;
			
			};
			if(end == '}' && letter == [')']) {
				stack.push(end = letter);
			} else if(end == '}' && letter == '{') {
				stack.push(end = '}');
			} else if(end == ')' && letter == '{') {
				stack.push(end = '}');
			};
			prev = letter;// what, why?
		};
		
		return this.error(("missing " + (stack.pop()
		) + ", starting"));
	};
	
	// Expand variables and expressions inside double-quoted strings using
	// Ruby-like notation for substitution of arbitrary expressions.
	// 	#     "Hello #{name.capitalize()}."
	// 	# If it encounters an interpolation, this method will recursively create a
	// new Lexer, tokenize the interpolated contents, and merge them into the
	// token stream.
	
	// should handle some other way
	Lexer.prototype.interpolateSelector = function (str,options){
		var interpolated;
		if(options === undefined) options = {};
		var heredoc = options.heredoc;
		var regex = options.regex;
		var prefix = options.prefix;
		
		var tokens = [];
		var pi = 0;
		var i = -1;
		
		var letter,expr,nested;
		
		var len;
		while(letter = str.charAt(i += 1)){
			if(!(letter == '{' && (expr = this.balancedSelector(str.slice(i),'}')))) {
				continue;
			};
			
			if(pi < i) {
				tokens.push(T.token('NEOSTRING',str.slice(pi,i)));
			};
			var inner = expr.slice(1,-1);
			
			if(inner.length) {
				nested = new Lexer().tokenize(inner,{line: this._line,rewrite: false});
				nested.pop();
				if(nested[0] && tT(nested[0]) == 'TERMINATOR') {
					nested.shift();
				};
				
				if(len = nested.length) {
					if(len > 1) {
						nested.unshift(T.token('(','('));
						nested.push(T.token(')',')'));
					};
					tokens.push(T.token('TOKENS',nested));// FIX
				};
			};
			i += expr.length - 1;
			pi = i + 1;
		};
		
		if(i > pi && pi < str.length) {
			tokens.push(T.token('NEOSTRING',str.slice(pi)));
		};
		if(regex) {
			return tokens;
		};
		if(!(tokens.length)) {
			return this.token('STRING','""');
		};
		
		if(!(tT(tokens[0]) == 'NEOSTRING')) {
			tokens.unshift(T.token('',''));
		};
		if(interpolated = tokens.length > 1) {
			this.token('(','(');
		};
		
		for(var i1=0, ary=iter$(tokens), len=ary.length, v; i1 < len; i1++) {
			v = ary[i1];var tokid = tT(v);
			var value = tV(v);
			
			if(i1) {
				this.token(',',',');
			};
			
			if(tokid == 'TOKENS') {
				this._tokens.push.apply(this._tokens,value);
			} else {
				this.token('STRING',this.makeString(value,'"',heredoc));
			};
		};
		if(interpolated) {
			this.token(')',')');
		};
		return tokens;
	};
	
	// Pairs up a closing token, ensuring that all listed pairs of tokens are
	// correctly balanced throughout the course of the token stream.
	Lexer.prototype.pair = function (tokid){
		var wanted = last(this._ends);
		if(!(tokid == wanted)) {
			if(!('OUTDENT' == wanted)) {
				this.error(("unmatched " + tokid));
			};
			// Auto-close INDENT to support syntax like this:
			// 			#     el.click((event) ->
			//       el.hide())
			// 			var size = last(@indents)
			this._indent -= this.size();
			this.outdentToken(this.size(),true);
			return this.pair(tokid);
		};
		// FIXME move into endSelector
		if(tokid == '%') {
			this.token('SELECTOR_END','%');
		};
		
		// remove possible options for context. hack
		// console.log "pairing tokid",tokid,@ends:length - 1,@ends["_" + (@ends:length - 1)]
		this._ends["_" + (this._ends.length - 1)] = undefined;
		return this._ends.pop();
	};
	
	// Helpers
	// -------
	
	// Add a token to the results, taking note of the line number.
	Lexer.prototype.token = function (id,value,len){
		var region = null;
		
		if(len) {
			this._region = [this._loc,this._loc + len];
		};
		
		this._lastTyp = id;
		this._lastVal = value;
		
		var tok = this._last = new Token(id,value,this._line,this._region);
		
		return this._tokens.push(tok);// @last		
	};
	
	
	// Peek at a tokid in the current token stream.
	Lexer.prototype.tokid = function (index,val){
		var tok;
		if(tok = last(this._tokens,index)) {
			if(val) {
				tTs(tok,val);
			};
			return tT(tok);
			// tok.@type = tokid if tokid # why?
			// tok.@type
		} else {
			return null;
		};
	};
	
	// Peek at a value in the current token stream.
	Lexer.prototype.value = function (index,val){
		var tok;
		if(tok = last(this._tokens,index)) {
			if(val) {
				tVs(tok,val);
			};
			return tV(tok);
			// tok.@value = val if val # why?
			// tok.@value
		} else {
			return null;
		};
	};
	
	
	// Are we in the midst of an unfinished expression?
	Lexer.prototype.unfinished = function (){
		if(LINE_CONTINUER.test(this._chunk)) {
			return true;
		};
		
		// no, no, no -- should never be possible to continue a statement without an indent
		// return false
		// this is _really_ messy.. it should possibly work if there is indentation after the initial
		// part of this, but not for the regular cases. Still, removing it breaks too much stuff.
		// Fix when we replace the lexer and rewriter
		// return false
		var tokens = ['\\','.','?.','UNARY','MATH','+','-','SHIFT','RELATION','COMPARE','LOGIC','COMPOUND_ASSIGN','THROW','EXTENDS'];
		return idx$(this.tokid(),tokens) >= 0;
	};
	
	
	// Converts newlines for string literals.
	Lexer.prototype.escapeLines = function (str,heredoc){
		return str.replace(MULTILINER,((heredoc) ? ('\\n') : ('')));
	};
	
	// Constructs a string token by escaping quotes and newlines.
	Lexer.prototype.makeString = function (body,quote,heredoc){
		if(!body) {
			return quote + quote;
		};
		body = body.replace(/\\([\s\S])/g,function (match,contents){
			return (idx$(contents,['\n',quote]) >= 0) ? (contents) : (match);
		});
		body = body.replace(RegExp("" + quote,"g"),'\\$&');
		return quote + this.escapeLines(body,heredoc) + quote;
	};
	
	// Throws a syntax error on the current `@line`.
	Lexer.prototype.error = function (message,len){
		var msg = ("" + message + " on line " + this._line);
		
		if(len) {
			msg += (" [" + this._loc + ":" + (this._loc + len) + "]");
		};
		
		var err = new SyntaxError(msg);
		err.line = this._line;
		throw err;
	};
	
	
	// Constants
	// ---------
	
	// Keywords that Imba shares in common with JavaScript.
	var JS_KEYWORDS = [
		'true','false','null','this',
		'new','delete','typeof','in','instanceof',
		'throw','break','continue','debugger',
		'if','else','switch','for','while','do','try','catch','finally',
		'class','extends','super','module','return'
	];
	
	// We want to treat return like any regular call for now
	// Must be careful to throw the exceptions in AST, since the parser
	// wont
	
	// Imba-only keywords. var should move to JS_Keywords
	// some words (like tokid) should be context-specific
	var IMBA_KEYWORDS = [
		'undefined','then','unless','until','loop','of','by',
		'when','def','tag','do','elif','begin','prop','var','let','self','await','import'
	];
	
	var IMBA_CONTEXTUAL_KEYWORDS = ['extend','static','local','export','global'];
	
	var IMBA_ALIAS_MAP = {
		'and': '&&',
		'or': '||',
		'is': '==',
		'isnt': '!=',
		'not': '!',
		'yes': 'true',
		'no': 'false',
		'isa': 'instanceof',
		'case': 'switch',
		'nil': 'null'
	};
	
	var o=IMBA_ALIAS_MAP, key, res=[];
	for(var key in o){
		res.push(key);
	};var IMBA_ALIASES = res;
	IMBA_KEYWORDS = IMBA_KEYWORDS.concat(IMBA_ALIASES);// .concat(IMBA_CONTEXTUAL_KEYWORDS)
	
	
	// The list of keywords that are reserved by JavaScript, but not used, or are
	// used by Imba internally. We throw an error when these are encountered,
	// to avoid having a JavaScript error at runtime.  # 'var', 'let', - not inside here
	var RESERVED = ['case','default','function','void','with','const','enum','native'];
	var STRICT_RESERVED = ['case','function','void','const'];
	
	// The superset of both JavaScript keywords and reserved words, none of which may
	// be used as identifiers or properties.
	var JS_FORBIDDEN = JS_KEYWORDS.concat(RESERVED);
	// export var RESERVED = RESERVED.concat(JS_KEYWORDS).concat(IMBA_KEYWORDS)
	
	// really?
	exports.RESERVED = RESERVED.concat(JS_KEYWORDS).concat(IMBA_KEYWORDS);
	
	var METHOD_IDENTIFIER = /^((([\x23]?[\$A-Za-z_\x7f-\uffff][$\-\w\x7f-\uffff]*)([\=\?\!]?))|(<=>|\|(?![\|=])))/;
	// removed ~=|~| |&(?![&=])
	
	// Token matching regexes.
	// added hyphens to identifiers now - to test
	// hmmm
	var IDENTIFIER = /^((\$|@@|@|\#)[\wA-Za-z_\-\x7f-\uffff][$\w\x7f-\uffff]*(\-[$\w\x7f-\uffff]+)*|[$A-Za-z_][$\w\x7f-\uffff]*(\-[$\w\x7f-\uffff]+)*)([^\n\S]*:(?![\*\=:$\w\x7f-\uffff]))?/;
	
	var OBJECT_KEY = /^((\$|@@|@|)[$A-Za-z_\x7f-\uffff\-][$\w\x7f-\uffff\-]*)([^\n\S\s]*:(?![\*\=:$\w\x7f-\uffff]))/;
	
	
	var OBJECT_KEY_ESCAPE = /[\-\@\$]/;
	
	
	var PROPERTY = /^((set|get|on)\s+)?([$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff\:]*)([^\n\S]*:\s)/;
	
	
	var TAG = /^(\<|%)(?=[A-Za-z\#\.\{\@])/;
	
	var TAG_TYPE = /^(\w[\w\d]*:)?(\w[\w\d]*)(-[\w\d]+)*/;
	var TAG_ID = /^#((\w[\w\d]*)(-[\w\d]+)*)/;
	
	var TAG_ATTR = /^([\.]?[\w\_]+([\-\:][\w]+)*)(\s)*\=/;
	
	var SELECTOR = /^([%\$]{1,2})([\(\w\#\.\[])/;
	var SELECTOR_PART = /^(\#|\.|:|::)?([\w]+(\-[\w]+)*)/;
	var SELECTOR_COMBINATOR = /^ (\+|\>|\~)*\s*(?=[\w\.\#\:\{\*\[])/;
	
	var SELECTOR_PSEUDO_CLASS = /^(::?)([\w]+(\-[\w]+)*)/;
	var SELECTOR_ATTR_OP = /^(\$=|\~=|\^=|\*=|\|=|=|\!=)/;
	var SELECTOR_ATTR = /^\[([\w\_\-]+)(\$=|\~=|\^=|\*=|\|=|=|\!=)/;
	
	var SYMBOL = /^\:((([\*\@$\w\x7f-\uffff]+)+([\-\\/\\\:][\w\x7f-\uffff]+)*[!\?\=]?)|==|\<=\>|\[\]|\[\]\=|\*|[\\/,\\])/;
	
	
	var NUMBER = /^0x[\da-f]+|^0b[01]+|^\d*\.?\d+(?:e[+-]?\d+)?/i;
	
	var HEREDOC = /^("""|''')([\s\S]*?)(?:\n[^\n\S]*)?\1/;
	
	var OPERATOR = /^(?:[-=]=>|===|!==|[-+*\/%<>&|^!?=]=|=<|>>>=?|([-+:])\1|([&|<>])\2=?|\?\.|\.{2,3}|\*(?=[a-zA-Z\_]))/;
	
	// FIXME splat should only be allowed when the previous thing is spaced or inside call?
	
	var WHITESPACE = /^[^\n\S]+/;
	
	var COMMENT = /^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)/;
	// COMMENT    = /^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)|^(?:\s*(#\s.*|#\s*$))+/
	var INLINE_COMMENT = /^(\s*)(#\s(.*)|#\s?$)+/;// hmm
	
	var CODE = /^[-=]=>/;
	
	var MULTI_DENT = /^(?:\n[^\n\S]*)+/;
	
	var SIMPLESTR = /^'[^\\']*(?:\\.[^\\']*)*'/;
	
	var JSTOKEN = /^`[^\\`]*(?:\\.[^\\`]*)*`/;
	
	// Regex-matching-regexes.
	var REGEX = /^(\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)([imgy]{0,4})(?!\w)/;
	
	var HEREGEX = /^\/{3}([\s\S]+?)\/{3}([imgy]{0,4})(?!\w)/;
	
	var HEREGEX_OMIT = /\s+(?:#.*)?/g;
	
	// Token cleaning regexes.
	var MULTILINER = /\n/g;
	
	var HEREDOC_INDENT = /\n+([^\n\S]*)/g;
	
	var HEREDOC_ILLEGAL = /\*\//;
	
	var LINE_CONTINUER = /^\s*(?:,|\??\.(?![.\d])|::)/;
	
	var TRAILING_SPACES = /\s+$/;
	
	var CONST_IDENTIFIER = /^[A-Z]/;
	
	var ARGVAR = /^\$\d$/;
	
	// CONDITIONAL_ASSIGN = ['||=', '&&=', '?=', '&=', '|=', '!?=']
	
	// Compound assignment tokens.
	var COMPOUND_ASSIGN = ['-=','+=','/=','*=','%=','||=','&&=','?=','<<=','>>=','>>>=','&=','^=','|=','=<'];
	
	// Unary tokens.
	var UNARY = ['!','~','NEW','TYPEOF','DELETE'];
	
	// Logical tokens.
	var LOGIC = ['&&','||','&','|','^'];
	
	// Bit-shifting tokens.
	var SHIFT = ['<<','>>','>>>'];
	
	// Comparison tokens.
	var COMPARE = ['===','!==','==','!=','<','>','<=','>=','===','!=='];
	
	// Overideable methods
	var OP_METHODS = ['<=>','<<','..'];// hmmm
	
	// Mathematical tokens.
	var MATH = ['*','/','%','∪','∩','√'];
	
	// Relational tokens that are negatable with `not` prefix.
	var RELATION = ['IN','OF','INSTANCEOF','ISA'];
	
	// Boolean tokens.
	var BOOL = ['TRUE','FALSE','NULL','UNDEFINED'];
	
	// Tokens which a regular expression will never immediately follow, but which
	// a division operator might.
	// # See: http://www.mozilla.org/js/language/js20-2002-04/rationale/syntax.html#regular-expressions
	// # Our list is shorter, due to sans-parentheses method calls.
	var NOT_REGEX = ['NUMBER','REGEX','BOOL','++','--',']'];
	
	// If the previous token is not spaced, there are more preceding tokens that
	// force a division parse:
	var NOT_SPACED_REGEX = NOT_REGEX.concat(')','}','THIS','SELF','IDENTIFIER','STRING');
	
	// Tokens which could legitimately be invoked or indexed. An opening
	// parentheses or bracket following these tokens will be recorded as the start
	// of a function invocation or indexing operation.
	// really?!
	
	// } should not be callable anymore!!! '}', '::',
	var CALLABLE = ['IDENTIFIER','STRING','REGEX',')',']','THIS','SUPER','TAG_END','IVAR','GVAR','SELF','CONST','NEW','ARGVAR','SYMBOL','RETURN'];
	var INDEXABLE = CALLABLE.concat('NUMBER','BOOL','TAG_SELECTOR','IDREF','ARGUMENTS','}');
	
	var GLOBAL_IDENTIFIERS = ['global','exports','require'];
	
	// STARTS = [']',')','}','TAG_ATTRS_END']
	// ENDS = [']',')','}','TAG_ATTRS_END']
	
	// Tokens that, when immediately preceding a `WHEN`, indicate that the `WHEN`
	// occurs at the start of a line. We disambiguate these from trailing whens to
	// avoid an ambiguity in the grammar.
	var LINE_BREAK = ['INDENT','OUTDENT','TERMINATOR'];


}())
},{"./rewriter":7,"./token":8}],5:[function(require,module,exports){
(function(){


	function idx$(a,b){
		return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
	};
	
	// helper for subclassing
	function subclass$(obj,sup) {
		for (var k in sup) {
			if (sup.hasOwnProperty(k)) obj[k] = sup[k];
		};
		// obj.__super__ = sup;
		obj.prototype = Object.create(sup.prototype);
		obj.__super__ = obj.prototype.__super__ = sup.prototype;
		obj.prototype.initialize = obj.prototype.constructor = obj;
	};
	
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	var AST, OP, OP_COMPOUND, SPLAT, BR, BR2, SELF, SUPER, TRUE, FALSE, ARGUMENTS, EMPTY, NULL, RESERVED, RESERVED_REGEX, UNION, INTERSECT, CLASSDEF, TAGDEF, NEWTAG;
	// TODO Create Expression - make all expressions inherit from these?
	
	// externs;
	
	var helpers = require('./helpers');
	
	module.exports.AST = AST = {};
	
	// Helpers for operators
	module.exports.OP = OP = function (op,left,right,opts){
		var opstr = String(op);
		
		if(opstr == '.') {
			if((typeof right=='string'||right instanceof String)) {
				right = new Identifier(right);
			};
			
			return new Access(op,left,right);
		} else if(opstr == '=') {
			if(left instanceof Tuple) {
				return new TupleAssign(op,left,right);
			};
			return new Assign(op,left,right);
		} else {
			return (idx$(opstr,['?=','||=','&&=']) >= 0) ? (
				new ConditionalAssign(op,left,right)
			) : ((idx$(opstr,['+=','-=','*=','/=','^=','%=']) >= 0) ? (
				new CompoundAssign(op,left,right)
			) : ((opstr == 'instanceof') ? (
				new InstanceOf(op,left,right)
			) : ((opstr == 'in') ? (
				new In(op,left,right)
			) : ((opstr == 'typeof') ? (
				new TypeOf(op,left,right)
			) : ((opstr == 'delete') ? (
				new Delete(op,left,right)
			) : ((idx$(opstr,['--','++','!','√']) >= 0) ? (
				new UnaryOp(op,left,right)
			) : ((idx$(opstr,['>','<','>=','<=','==','===','!=','!==']) >= 0) ? (
				new ComparisonOp(op,left,right)
			) : ((idx$(opstr,['∩','∪']) >= 0) ? (
				new MathOp(op,left,right)
			) : ((idx$(opstr,['..','...']) >= 0) ? (
				new Range(op,left,right)
			) : (
				new Op(op,left,right)
			))))))))))
		};
	};
	
	module.exports.OP_COMPOUND = OP_COMPOUND = function (sym,op,l,r){
		if(sym == '?=' || sym == '||=' || sym == '&&=') {
			return new ConditionalAssign(op,l,r);
		} else {
			return new CompoundAssign(op,l,r);
		};
	};
	
	LIT = function (val){
		return new Literal(val);
	};
	
	SYM = function (val){
		return new Symbol(val);
	};
	
	IF = function (cond,body,alt){
		var node = new If(cond,body);
		if(alt) {
			node.addElse(alt);
		};
		return node;
	};
	
	FN = function (pars,body){
		return new Func(pars,body);
	};
	
	CALL = function (callee,pars){
		if(pars === undefined) pars = [];
		return new Call(callee,pars);
	};
	
	CALLSELF = function (name,pars){
		if(pars === undefined) pars = [];
		var ref = new Identifier(name);
		return new Call(OP('.',SELF,ref),pars);
	};
	
	BLOCK = function (){
		return Block.wrap([].slice.call(arguments));
	};
	
	WHILE = function (test,code){
		return new While(test).addBody(code);
	};
	
	module.exports.SPLAT = SPLAT = function (value){
		if(value instanceof Assign) {
			value.setLeft(new Splat(value.left()));
			return value;
		} else {
			return new Splat(value);
			// not sure about this
		};
	};
	
	OP.ASSIGNMENT = ["=","+=","-=","*=","/=","%=","<<=",">>=",">>>=","|=","^=","&="];
	OP.LOGICAL = ["||","&&"];
	OP.UNARY = ["++","--"];
	
	LOC = function (loc){
		return this;
	};
	
	// hmmm
	function c__(obj){
		return (typeof obj == 'string') ? (obj) : (obj.c());
	};
	
	function num__(num){
		return new Num(num);
	};
	
	function str__(str){
		return new Str(str);
	};
	
	function blk__(obj){
		return (obj instanceof Array) ? (Block.wrap(obj)) : (obj);
	};
	
	function sym__(obj){
		return helpers.symbolize(String(obj));
	};
	
	function cary__(ary){
		return ary.map(function (v){
			return (typeof v == 'string') ? (v) : (v.c());
		});
	};
	
	AST.dump = function (obj,key){
		return (obj instanceof Array) ? (
			obj.map(function (v){
				return (v && v.dump) ? (v.dump(key)) : (v);
			})
		) : ((obj && obj.dump) && (
			obj.dump()
		));
	};
	
	
	function compact__(ary){
		if(ary instanceof ListNode) {
			return ary.compact();
		};
		
		return ary.filter(function (v){
			return v != undefined && v != null;
		});
	};
	
	function flatten__(ary,compact){
		if(compact === undefined) compact = false;
		var out = [];
		ary.forEach(function (v){
			return (v instanceof Array) ? (out.push.apply(out,flatten__(v))) : (out.push(v));
		});
		return out;
	};
	
	AST.parse = function (str,opts){
		if(opts === undefined) opts = {};
		var indent = str.match(/\t+/)[0];
		return Imba.parse(str,opts);
	};
	
	AST.inline = function (str,opts){
		if(opts === undefined) opts = {};
		return this.parse(str,opts).body();
	};
	
	AST.node = function (typ,pars){
		return (typ == 'call') && (
			(pars[0].c() == 'return') && (
				pars[0] = 'tata'
			),
			new Call(pars[0],pars[1],pars[2])
		);
	};
	
	
	AST.escapeComments = function (str){
		if(!str) {
			return '';
		};
		return str;
		// var v = str.replace(/\\n/g,'\n')
		// v.split("\n").join("\n")
		// v.split("\n").map(|v| v ? "// {v}" : v).join("\n")
	};
	
	/* @class Indentation */
	function Indentation(a,b){
		this._open = a || 1;
		this._close = b || 1;
		this;
	};
	
	exports.Indentation = Indentation; // export class 
	
	Indentation.prototype.__open = {};
	Indentation.prototype.open = function(v){ return this._open; }
	Indentation.prototype.setOpen = function(v){ this._open = v; return this; };
	
	Indentation.prototype.__close = {};
	Indentation.prototype.close = function(v){ return this._close; }
	Indentation.prototype.setClose = function(v){ this._close = v; return this; };
	
	
	
	// should rather parse and extract the comments, no?
	Indentation.prototype.wrap = function (str,o){
		var pre = this._open.pre;
		var post = this._open.post;
		var esc = AST.escapeComments;
		
		// the first newline should not be indented?
		str = esc(post).replace(/^\n/,'') + str;
		str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
		
		str = esc(pre) + '\n' + str;
		// only add br if needed
		if(!(str[str.length - 1] == '\n')) {
			str = str + '\n';
		};
		// if o and o:braces
		// 	str = '{' + str + '}'
		
		return str;
	};
	
	
	INDENT = new Indentation();
	
	/* @class Stack */
	function Stack(){
		this._nodes = [];
		this._scoping = [];
		this._scopes = [];// for analysis - should rename
		this._loglevel = 3;
	};
	
	exports.Stack = Stack; // export class 
	
	Stack.prototype.__loglevel = {};
	Stack.prototype.loglevel = function(v){ return this._loglevel; }
	Stack.prototype.setLoglevel = function(v){ this._loglevel = v; return this; };
	
	Stack.prototype.__nodes = {};
	Stack.prototype.nodes = function(v){ return this._nodes; }
	Stack.prototype.setNodes = function(v){ this._nodes = v; return this; };
	
	Stack.prototype.__scopes = {};
	Stack.prototype.scopes = function(v){ return this._scopes; }
	Stack.prototype.setScopes = function(v){ this._scopes = v; return this; };
	
	
	
	Stack.prototype.addScope = function (scope){
		this._scopes.push(scope);
		return this;
	};
	
	Stack.prototype.traverse = function (node){
		return this;
	};
	
	Stack.prototype.push = function (node){
		this._nodes.push(node);
		// not sure if we have already defined a scope?
		return this;
	};
	
	Stack.prototype.pop = function (node){
		this._nodes.pop(node);
		return this;
	};
	
	Stack.prototype.parent = function (){
		return this._nodes[this._nodes.length - 2];
	};
	
	Stack.prototype.current = function (){
		return this._nodes[this._nodes.length - 1];
	};
	
	Stack.prototype.up = function (test){
		test || (test = function (v){
			return !(v instanceof VarOrAccess);
		});
		
		if(test.prototype instanceof Node) {
			var typ = test;
			test = function (v){
				return v instanceof typ;
			};
		};
		
		var i = this._nodes.length - 1;
		while(i >= 0){
			var node = this._nodes[i];
			if(test(node)) {
				return node;
			};
			i -= 1;
		};
		return null;
	};
	
	Stack.prototype.relative = function (node,offset){
		if(offset === undefined) offset = 0;
		var idx = this._nodes.indexOf(node);
		return (idx >= 0) ? (this._nodes[idx + offset]) : (null);
	};
	
	Stack.prototype.scope = function (lvl){
		if(lvl === undefined) lvl = 0;
		var i = this._nodes.length - 1 - lvl;
		while(i >= 0){
			var node = this._nodes[i];
			if(node._scope) {
				return node._scope;
			};
			i -= 1;
		};
		return null;
	};
	
	Stack.prototype.scopes = function (){
		var scopes = [];
		var i = this._nodes.length - 1;
		while(i >= 0){
			var node = this._nodes[i];
			if(node._scope) {
				scopes.push(node._scope);
			};
			i -= 1;
		};
		return scopes;
	};
	
	Stack.prototype.method = function (){
		return this.up(MethodDeclaration);
	};
	
	Stack.prototype.isExpression = function (){
		var i = this._nodes.length - 1;
		while(i >= 0){
			var node = this._nodes[i];
			// why are we not using isExpression here as well?
			if((node instanceof Code) || (node instanceof Loop)) {
				return false;
			};
			if(node.isExpression()) {
				return true;
			};
			// probably not the right test - need to be more explicit
			i -= 1;
		};
		return false;
	};
	
	Stack.prototype.toString = function (){
		return "Stack(" + (this._nodes.join(" -> ")) + ")";
	};
	
	Stack.prototype.scoping = function (){
		return this._nodes.filter(function (n){
			return n._scope;
		}).map(function (n){
			return n._scope;
		});
	};
	
	
	// Lots of globals -- really need to deal with one stack per file / context
	STACK = new Stack();
	
	/* @class Node */
	function Node(){
		this;
	};
	
	exports.Node = Node; // export class 
	
	Node.prototype.__o = {};
	Node.prototype.o = function(v){ return this._o; }
	Node.prototype.setO = function(v){ this._o = v; return this; };
	
	Node.prototype.__options = {};
	Node.prototype.options = function(v){ return this._options; }
	Node.prototype.setOptions = function(v){ this._options = v; return this; };
	
	Node.prototype.__traversed = {};
	Node.prototype.traversed = function(v){ return this._traversed; }
	Node.prototype.setTraversed = function(v){ this._traversed = v; return this; };
	
	Node.prototype.__statement = {};
	Node.prototype.statement = function(v){ return this._statement; }
	Node.prototype.setStatement = function(v){ this._statement = v; return this; };
	
	Node.prototype.safechain = function (){
		return false;
	};
	
	Node.prototype.dom = function (){
		var name = "ast_" + this.constructor.name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase();
		// p "try to get the dom-node for this ast-node",name
		if(Imba.TAGS[name]) {
			var node = Imba.tag(name);
			node.bind(this).build();
			return node;
		} else {
			return ("[" + name + "]");
		};
	};
	
	Node.prototype.p = function (){
		if(STACK.loglevel() > 0) {
			console.log.apply(console,arguments);
		};
		return this;
	};
	
	
	
	Node.prototype.set = function (obj){
		this._options || (this._options = {});
		for(var o=obj, i=0, keys=Object.keys(o), l=keys.length; i < l; i++){
			this._options[keys[i]] = o[keys[i]];
		};
		return this;
	};
	
	// get and set
	Node.prototype.option = function (key,val){
		if(val != undefined) {
			this._options || (this._options = {});
			this._options[key] = val;
			return this;
		};
		
		return this._options && this._options[key];
	};
	
	Node.prototype.configure = function (obj){
		return this.set(obj);
	};
	
	Node.prototype.region = function (){
		return [];
	};
	
	Node.prototype.loc = function (){
		return [];
	};
	
	Node.prototype.toAST = function (){
		return this;
	};
	
	Node.prototype.compile = function (){
		return this;
	};
	
	Node.prototype.visit = function (){
		return this;
	};
	
	Node.prototype.stack = function (){
		return STACK;
	};
	
	Node.prototype.traverse = function (o,up,key,index){
		var $0 = arguments, i = $0.length;
		if(i < 1) o = {};
		if(this._traversed) {
			return this;
		};
		this._traversed = true;
		STACK.push(this);
		this.visit(STACK);
		STACK.pop(this);
		return this;
	};
	
	Node.prototype.inspect = function (){
		return {type: this.constructor.toString()};
	};
	
	Node.prototype.js = function (){
		return "NODE";
	};
	
	Node.prototype.toString = function (){
		return "" + (this.constructor.name);
	};
	
	// swallow might be better name
	Node.prototype.consume = function (node){
		if(node instanceof PushAssign) {
			return new PushAssign(node.op(),node.left(),this);
		};
		
		if(node instanceof Assign) {
			return OP(node.op(),node.left(),this);
		} else if(node instanceof Op) {
			return OP(node.op(),node.left(),this);
		} else if(node instanceof Return) {
			return new Return(this);
		};
		return this;
	};
	
	Node.prototype.toExpression = function (){
		this._expression = true;
		return this;
	};
	
	Node.prototype.forceExpression = function (){
		this._expression = true;
		return this;
	};
	
	Node.prototype.isExpressable = function (){
		return true;
	};
	
	Node.prototype.isExpression = function (){
		return this._expression || false;
	};
	
	Node.prototype.hasSideEffects = function (){
		return true;
	};
	
	Node.prototype.isUsed = function (){
		return true;
	};
	
	Node.prototype.shouldParenthesize = function (){
		return false;
	};
	
	Node.prototype.block = function (){
		throw new SyntaxError("dont call");
		return Block.wrap([this]);
	};
	
	Node.prototype.node = function (){
		return this;
	};
	
	Node.prototype.scope__ = function (){
		return STACK.scope();
	};
	
	Node.prototype.up = function (){
		return STACK.parent();
	};
	
	Node.prototype.util = function (){
		return Util;
	};
	
	Node.prototype.receiver = function (){
		return this;
	};
	
	Node.prototype.addExpression = function (expr){
		var node = new ExpressionBlock([this]);
		return node.addExpression(expr);
	};
	
	
	Node.prototype.indented = function (a,b){
		if(b instanceof Array) {
			this.add(b[0]);
			b = b[1];
		};
		
		// if indent and indent.match(/\:/)
		this._indented = [a,b];
		this._indentation || (this._indentation = (a && b) ? (new Indentation(a,b)) : (INDENT));
		return this;
	};
	
	Node.prototype.prebreak = function (term){
		if(term === undefined) term = '\n';
		return this;
	};
	
	Node.prototype.invert = function (){
		return OP('!',this);
	};
	
	Node.prototype.cache = function (o){
		if(o === undefined) o = {};
		this._cache = o;
		o.var = this.scope__().temporary(this,o);
		o.lookups = 0;
		// o:lookups = 0
		return this;
	};
	
	Node.prototype.cachevar = function (){
		return this._cache && this._cache.var;
	};
	
	Node.prototype.decache = function (){
		if(this._cache) {
			this.cachevar().free();
			this._cache = null;// hmm, removing the cache WARN
		};
		return this;
	};
	
	// is this without side-effects? hmm - what does it even do?
	Node.prototype.predeclare = function (){
		if(this._cache) {
			this.scope__().vars().swap(this._cache.var,this);
		};
		return this;
	};
	
	// the "name-suggestion" for nodes if they need to be cached
	Node.prototype.alias = function (){
		return null;
	};
	
	Node.prototype.warn = function (text,opts){
		if(opts === undefined) opts = {};
		opts.message = text;
		opts.loc || (opts.loc = this.loc());
		this.scope__().root().warn(opts);
		return this;
	};
	
	Node.prototype.c = function (o){
		var indent;
		var s = STACK;
		var ch = this._cache;
		if(ch && ch.cached) {
			return this.c_cached(ch);
		};
		
		s.push(this);
		if(o && o.expression) {
			this.forceExpression();
		};
		
		if(o && o.indent) {
			this._indentation || (this._indentation = INDENT);
		};
		
		var out = this.js(s,o);
		
		var paren = this.shouldParenthesize();
		
		if(indent = this._indentation) {
			out = indent.wrap(out,o);
		};
		
		if(paren) {
			out = ("(" + out + ")");
		};
		if(o && o.braces) {
			out = '{' + out + '}';
		};
		
		s.pop(this);
		
		if(ch = this._cache) {
			if(!(ch.manual)) {
				out = ("" + (ch.var.c()) + "=" + out);
			};
			var par = s.current();
			if((par instanceof Access) || (par instanceof Op)) {
				out = '(' + out + ')';
			};// others? # 
			ch.cached = true;
		};
		
		// most of these should never be needed?
		// where?!?
		if(this._temporary && this._temporary.length) {
			this._temporary.map(function (temp){
				return temp.decache();
			});
		};
		
		return out;
	};
	
	Node.prototype.c_cached = function (cache){
		(cache.lookups)++;
		if(cache.uses == cache.lookups) {
			cache.var.free();
		};
		return cache.var.c();// recompile every time??
	};
	
	
	
	/* @class Expression */
	function Expression(){ Node.apply(this,arguments) };
	
	subclass$(Expression,Node);
	exports.Expression = Expression; // export class 
	
	
	/* @class ValueNode */
	function ValueNode(value){
		this._value = this.load(value);
	};
	
	subclass$(ValueNode,Node);
	exports.ValueNode = ValueNode; // export class 
	
	ValueNode.prototype.__value = {};
	ValueNode.prototype.value = function(v){ return this._value; }
	ValueNode.prototype.setValue = function(v){ this._value = v; return this; };
	
	
	
	ValueNode.prototype.load = function (value){
		return value;
	};
	
	ValueNode.prototype.js = function (){
		return (typeof this._value == 'string') ? (this._value) : (this._value.c());
	};
	
	ValueNode.prototype.visit = function (){
		if(this._value instanceof Node) {
			this._value.traverse();
		};//  && @value:traverse
		return this;
	};
	
	ValueNode.prototype.region = function (){
		return this._value._region;
	};
	
	
	/* @class Statement */
	function Statement(){ ValueNode.apply(this,arguments) };
	
	subclass$(Statement,ValueNode);
	exports.Statement = Statement; // export class 
	Statement.prototype.isExpressable = function (){
		return false;
	};
	
	Statement.prototype.statement = function (){
		return true;
	};
	
	
	
	/* @class Meta */
	function Meta(){ ValueNode.apply(this,arguments) };
	
	subclass$(Meta,ValueNode);
	exports.Meta = Meta; // export class 
	
	
	/* @class Comment */
	function Comment(){ Meta.apply(this,arguments) };
	
	subclass$(Comment,Meta);
	exports.Comment = Comment; // export class 
	Comment.prototype.c = function (o){
		var v = this._value._value;// hmm 
		return (o && o.expression || v.match(/\n/)) ? (
			("/*" + v + "*/")
		) : (
			("// " + v)
		);
	};
	
	
	
	/* @class Terminator */
	function Terminator(){ Meta.apply(this,arguments) };
	
	subclass$(Terminator,Meta);
	exports.Terminator = Terminator; // export class 
	Terminator.prototype.c = function (){
		return this._value.c();
		// var v = value.replace(/\\n/g,'\n')
		return this.v();// .split()
		// v.split("\n").map(|v| v ? " // {v}" : v).join("\n")
	};
	
	
	/* @class Newline */
	function Newline(v){
		this._value = v || '\n';
	};
	
	subclass$(Newline,Terminator);
	exports.Newline = Newline; // export class 
	
	
	Newline.prototype.c = function (){
		return this._value.c();
	};
	
	
	
	// weird place?
	/* @class Index */
	function Index(){ ValueNode.apply(this,arguments) };
	
	subclass$(Index,ValueNode);
	exports.Index = Index; // export class 
	Index.prototype.js = function (){
		return this._value.c();
	};
	
	
	/* @class ListNode */
	function ListNode(list,options){
		if(list === undefined) list = [];
		if(options === undefined) options = {};
		this._nodes = this.load(list);
		this._options = options;
	};
	
	subclass$(ListNode,Node);
	exports.ListNode = ListNode; // export class 
	
	ListNode.prototype.__nodes = {};
	ListNode.prototype.nodes = function(v){ return this._nodes; }
	ListNode.prototype.setNodes = function(v){ this._nodes = v; return this; };
	
	
	
	// PERF acces @nodes directly?
	ListNode.prototype.list = function (){
		return this._nodes;
	};
	
	ListNode.prototype.compact = function (){
		this._nodes = compact__(this._nodes);
		return this;
	};
	
	ListNode.prototype.load = function (list){
		return list;
	};
	
	ListNode.prototype.concat = function (other){
		this._nodes = this.nodes().concat((other instanceof Array) ? (other) : (other.nodes()));
		return this;
	};
	
	ListNode.prototype.swap = function (item,other){
		var idx = this.indexOf(item);
		if(idx >= 0) {
			this.nodes()[idx] = other;
		};
		return this;
	};
	
	ListNode.prototype.push = function (item){
		this.nodes().push(item);
		return this;
	};
	
	ListNode.prototype.unshift = function (item,br){
		if(br) {
			this.nodes().unshift(BR);
		};
		this.nodes().unshift(item);
		return this;
	};
	
	// test
	ListNode.prototype.slice = function (a,b){
		return new this.constructor(this._nodes.slice(a,b));
	};
	
	ListNode.prototype.add = function (item){
		this.push(item);
		return this;
	};
	
	ListNode.prototype.break = function (br,pre){
		if(pre === undefined) pre = false;
		if(typeof br == 'string') {
			br = new Terminator(br);
		};// hmmm?
		if(pre) {
			this.unshift(br);
		} else {
			this.push(br);
		};
		return this;
	};
	
	ListNode.prototype.some = function (cb){
		return this.nodes().some(cb);
	};
	
	ListNode.prototype.every = function (cb){
		return this.nodes().every(cb);
	};
	
	ListNode.prototype.filter = function (cb){
		if(cb.prototype instanceof Node) {
			var ary = [];
			this.nodes().forEach(function (n){
				return (n instanceof cb) && (ary.push(n));
			});
			return ary;
		};
		
		return this.nodes().filter(cb);
	};
	
	ListNode.prototype.pluck = function (cb){
		var item = this.filter(cb)[0];
		if(item) {
			this.remove(item);
		};
		return item;
	};
	
	ListNode.prototype.indexOf = function (item){
		return this.nodes().indexOf(item);
	};
	
	ListNode.prototype.index = function (i){
		return this.nodes()[i];
	};
	
	ListNode.prototype.remove = function (item){
		var idx = this.list().indexOf(item);
		if(idx >= 0) {
			this.list().splice(idx,1);
		};
		return this;
	};
	
	ListNode.prototype.first = function (){
		return this.list()[0];
	};
	
	// def last
	// list[list:length - 1]
	
	ListNode.prototype.last = function (){
		var i = this._nodes.length;
		while(i){
			i = i - 1;
			var v = this._nodes[i];
			if(!((v instanceof Meta))) {
				return v;
			};
		};
		return null;
	};
	
	ListNode.prototype.map = function (fn){
		return this.list().map(fn);
	};
	
	ListNode.prototype.forEach = function (fn){
		return this.list().forEach(fn);
	};
	
	ListNode.prototype.remap = function (fn){
		this._nodes = this.map(fn);
		return this;
	};
	
	ListNode.prototype.count = function (){
		return this.list().length;
	};
	
	ListNode.prototype.replace = function (original,replacement){
		var idx = this.nodes().indexOf(original);
		if(idx >= 0) {
			this.nodes()[idx] = replacement;
		};
		return this;
	};
	
	
	ListNode.prototype.visit = function (){
		this._nodes.forEach(function (node){
			return node.traverse();
		});
		return this;
	};
	
	ListNode.prototype.isExpressable = function (){
		if(!this.nodes().every(function (v){
			return v.isExpressable();
		})) {
			return false;
		};
		return true;
	};
	
	ListNode.prototype.toArray = function (){
		return this._nodes;
	};
	
	ListNode.prototype.delimiter = function (){
		return this._delimiter || ",";
	};
	
	ListNode.prototype.js = function (o,pars){
		if(!pars||pars.constructor !== Object) pars = {};
		var delim = pars.delim !== undefined ? pars.delim : this.delimiter();
		var indent = pars.indent !== undefined ? pars.indent : this._indentation;
		var nodes = pars.nodes !== undefined ? pars.nodes : this.nodes();
		var express = delim != ';';
		var shouldDelim = false;
		var nodes = compact__(nodes);
		var last = this.last();
		var realLast = nodes[nodes.length - 1];
		// need to find the last node that is not a comment or newline?
		
		var parts = nodes.map(function (arg){
			var out = (typeof arg == 'string') ? (arg) : (arg.c({expression: express}));
			// if var br = arg.@prebreak
			// 	indent = yes # force indentation if one item is indented for now
			// 	out = br.replace(/\\n/g,"\n") + out #  '\n' + arg.@prebreak + out 
			// 	console.log "prebreak!!"
			// out = delim + out if shouldDelim
			// else
			// out = delim + " " + out if shouldDelim
			
			if(arg instanceof Meta) {
				true;
				// console.log "argument is a comment!"
				// shouldDelim = no
			} else {
				if(!express || arg != last) {
					out = out + delim;
				};
			};
			return out;
		});
		
		return parts.join("");
	};
	
	
	
	/* @class ArgList */
	function ArgList(){ ListNode.apply(this,arguments) };
	
	subclass$(ArgList,ListNode);
	exports.ArgList = ArgList; // export class 
	ArgList.prototype.hasSplat = function (){
		return this.list().some(function (v){
			return v instanceof Splat;
		});
	};
	
	ArgList.prototype.delimiter = function (){
		return ",";
	};
	
	
	
	/* @class AssignList */
	function AssignList(){ ArgList.apply(this,arguments) };
	
	subclass$(AssignList,ArgList);
	exports.AssignList = AssignList; // export class 
	AssignList.prototype.concat = function (other){
		if(this._nodes.length == 0 && (other instanceof AssignList)) {
			return other;
		} else {
			AssignList.__super__.concat.apply(this,arguments);
		};
		// need to store indented content as well?
		// @nodes = nodes.concat(other isa Array ? other : other.nodes)
		return this;
	};
	
	
	
	/* @class Block */
	function Block(expr){
		var v_;
		if(expr === undefined) expr = [];
		(this.setNodes(v_=compact__(flatten__(expr)) || []),v_);
	};
	
	subclass$(Block,ListNode);
	exports.Block = Block; // export class 
	
	Block.prototype.__head = {};
	Block.prototype.head = function(v){ return this._head; }
	Block.prototype.setHead = function(v){ this._head = v; return this; };
	
	
	Block.wrap = function (ary){
		if(!((ary instanceof Array))) {
			throw new SyntaxError("what");
		};
		return (ary.length == 1 && (ary[0] instanceof Block)) ? (ary[0]) : (new Block(ary));
	};
	
	
	// def visit
	// 	# @indentation ||= INDENT
	// 	
	// 	if @prebreak # hmm
	// 		# are we sure?
	// 		# console.log "PREBREAK IN BLOCK SHOULD THROW"
	// 		first and first.prebreak(@prebreak)
	// 	super
	
	
	Block.prototype.push = function (item){
		this.nodes().push(item);
		return this;
	};
	
	
	Block.prototype.block = function (){
		return this;
	};
	
	
	Block.prototype.loc = function (){
		var opt, a, b;
		return (opt = this.option('ends')) ? (
			a = opt[0].loc(),
			b = opt[1].loc(),
			
			(!a) && (this.p(("no loc for " + (opt[0])))),
			(!b) && (this.p(("no loc for " + (opt[1])))),
			
			[a[0],b[1]]
		) : (
			[0,0]
		);
	};
	
	
	
	
	
	// go through children and unwrap inner nodes
	Block.prototype.unwrap = function (){
		var ary = [];
		for(var i=0, items=iter$(this.nodes()), len=items.length, node; i < len; i++) {
			node = items[i];if(node instanceof Block) {
				ary.push.apply(ary,node.unwrap());
			} else {
				ary.push(node);
			};
		};
		return ary;
	};
	
	
	// This is just to work as an inplace replacement of nodes.coffee
	// After things are working okay we'll do bigger refactorings
	Block.prototype.compile = function (o){
		if(o === undefined) o = {};
		var root = new Root(this,o);
		return root.compile(o);
	};
	
	
	// Not sure if we should create a separate block?
	Block.prototype.analyze = function (o){
		if(o === undefined) o = {};
		return this;
	};
	
	
	Block.prototype.js = function (o,opts){
		var $1;
		var l = this.nodes().length;
		// var filter = 
		var filter = (function (n){
			return n != null && n != undefined && n != EMPTY;
		});
		var ast = compact__(flatten__(this.nodes())).filter(function (n){
			return n != null && n != undefined && n != EMPTY;
		});
		var express = this.isExpression() || o.isExpression() || (this.option('express') && this.isExpressable());
		if(ast.length == 0) {
			return null;
		};
		
		// return super(o, delim: ';', indent: no)
		
		if(express) {
			return Block.__super__.js.call(this,o,{delim: ',',nodes: ast});
		};
		
		// should probably delegate to super for ; as well
		// else
		// 	return super(o,delim: ';', nodes: ast)
		// return ast.c.flatten__.compact.join(", ")
		
		var compile = function (node,i){
			var out = (typeof node == 'string') ? (node) : (((node) ? (node.c()) : ("")));
			if(out == "") {
				return null;
			};
			
			// FIXME should never happen
			// we need to handle it in a better way - results in ugly output
			if(out instanceof Array) {
				out = compact__(flatten__(out)).filter(filter).join(";\n");
			};
			// console.log "compiled {node} {out}"
			var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/);// out[out:length - 1] == ";"
			
			if(!(hasSemiColon || (node instanceof Meta))) {
				out += ";";
			};
			
			// if var br = node.@prebreak
			// 	console.log "br prebreak"
			// 	out = br.replace(/\\n/g,"\n") + out
			// hmm
			return out;
		};
		
		ast = ast.map(compile);
		
		// now add the head items as well
		if(this._head) {
			var prefix = [];
			flatten__(this._head).forEach(function (item){
				var out = compile(item);
				return (out) && (prefix.push(out + '\n'));
			});
			
			ast = prefix.concat(ast);
			// var ln = node.@newlines or 1
			// c += Array(ln + 1).join("\n") # "\n"
		};
		
		return ast = compact__(ast).filter(filter).join("");// .replace(/[\s\n]+$/,'')  # hmm really?
		
		// @indentation ? @indentation.wrap(ast,opts) : ast
	};
	
	
	// Should this create the function as well?
	Block.prototype.defers = function (original,replacement){
		var idx = this.nodes().indexOf(original);
		if(idx >= 0) {
			this.nodes()[idx] = replacement;
		};
		// now return the nodes after this
		replacement._prebreak || (replacement._prebreak = original._prebreak);// hacky
		var rest = this.nodes().splice(idx + 1);
		return rest;
	};
	
	
	Block.prototype.consume = function (node){
		var v_, before;
		if(node instanceof TagTree) {
			this.setNodes(this.nodes().map(function (child){
				return child.consume(node);
			}));
			// then wrap ourselves in an array as well(!)
			// nodes = [Arr.new(nodes)] if nodes:length > 1
			if(this.nodes().length > 1) {
				(this.setNodes(v_=[new Arr(new ArgList(this.nodes()))]),v_);
			};
			
			// hmmm
			return this;
		};
		
		// can also return super if it is expressable, but should we really?
		if(before = this.last()) {
			var after = before.consume(node);
			if(after != before) {
				this.replace(before,after);
			};
		};
		// really?
		return this;
	};
	
	
	Block.prototype.isExpressable = function (){
		if(!this.nodes().every(function (v){
			return v.isExpressable();
		})) {
			return false;
		};
		return true;
	};
	
	
	Block.prototype.isExpression = function (){
		return this.option('express') || Block.__super__.isExpression.call(this);
	};
	
	
	
	// this is almost like the old VarDeclarations but without the values
	/* @class VarBlock */
	function VarBlock(){ ListNode.apply(this,arguments) };
	
	subclass$(VarBlock,ListNode);
	exports.VarBlock = VarBlock; // export class 
	VarBlock.prototype.addExpression = function (expr){
		if(expr instanceof Assign) {
			this.addExpression(expr.left());// make sure this is a valid thing?
			// make this into a tuple instead
			// possibly fix this as well?!?
			// does not need to be a tuple?
			return new TupleAssign('=',new Tuple(this.nodes()),expr.right());
		} else if(expr instanceof VarOrAccess) {
			this.push(new VarReference(expr.value()));
		} else if((expr instanceof Splat) && (expr.node() instanceof VarOrAccess)) {
			expr.setValue(new VarReference(expr.node().value()));
			this.push(expr);
		} else {
			throw "VarBlock does not allow non-variable expressions";
		};
		return this;
	};
	
	
	VarBlock.prototype.isExpressable = function (){
		return false;
	};
	
	
	VarBlock.prototype.js = function (o){
		var code = compact__(flatten__(cary__(this.nodes())));
		code = code.filter(function (n){
			return n != null && n != undefined && n != EMPTY;
		});
		return ("var " + (code.join(",")));
	};
	
	
	VarBlock.prototype.consume = function (node){
		return this;
	};
	
	
	
	// Could inherit from valueNode
	/* @class Parens */
	function Parens(){ ValueNode.apply(this,arguments) };
	
	subclass$(Parens,ValueNode);
	exports.Parens = Parens; // export class 
	Parens.prototype.js = function (o){
		var par = this.up();
		var v = this._value;
		// p "Parens up {par} {o.isExpression}"
		
		if(par instanceof Block) {
			if(!(o.isExpression())) {
				this._noparen = true;
			};
			return (v instanceof Array) ? (cary__(v)) : (v.c({expression: o.isExpression()}));
		} else {
			return (v instanceof Array) ? (cary__(v)) : (v.c({expression: true}));
		};
	};
	
	
	Parens.prototype.shouldParenthesize = function (){
		if(this._noparen) {
			return false;
		};//  or par isa ArgList
		return true;
	};
	
	
	Parens.prototype.prebreak = function (br){
		var $1;
		Parens.__super__.prebreak.call(this,br);
		// hmm
		if(this._value) {
			this._value.prebreak(br);
		};
		return this;
	};
	
	
	Parens.prototype.isExpressable = function (){
		return this.value().isExpressable();
	};
	
	
	Parens.prototype.consume = function (node){
		return this.value().consume(node);
	};
	
	
	
	
	// Could inherit from valueNode
	// an explicit expression-block (with parens) is somewhat different
	// can be used to return after an expression
	/* @class ExpressionBlock */
	function ExpressionBlock(){ ListNode.apply(this,arguments) };
	
	subclass$(ExpressionBlock,ListNode);
	exports.ExpressionBlock = ExpressionBlock; // export class 
	ExpressionBlock.prototype.visit = function (){
		this.map(function (item){
			return item.traverse();
		});
		return this;
	};
	
	
	ExpressionBlock.prototype.c = function (){
		return this.map(function (item){
			return item.c();
		}).join(",");
	};
	
	
	ExpressionBlock.prototype.consume = function (node){
		return this.value().consume(node);
	};
	
	
	ExpressionBlock.prototype.addExpression = function (expr){
		if(expr.node() instanceof Assign) {
			this.push(expr.left());
			// make this into a tuple instead
			// possibly fix this as well?!?
			return new TupleAssign('=',new Tuple(this.nodes()),expr.right());
		} else {
			this.push(expr);
		};
		return this;
	};
	
	
	
	
	// STATEMENTS
	
	/* @class Return */
	function Return(v){
		this._value = ((v instanceof ArgList) && v.count() == 1) ? (v.last()) : (v);
		// @prebreak = v and v.@prebreak # hmmm
		// console.log "return?!? {v}",@prebreak
		// if v isa ArgList and v.count == 1
		return this;
	};
	
	subclass$(Return,Statement);
	exports.Return = Return; // export class 
	
	Return.prototype.__value = {};
	Return.prototype.value = function(v){ return this._value; }
	Return.prototype.setValue = function(v){ this._value = v; return this; };
	
	
	
	Return.prototype.visit = function (){
		return (this._value && this._value.traverse) && (this._value.traverse());
	};
	
	Return.prototype.js = function (){
		var v = this._value;
		
		if(v instanceof ArgList) {
			return ("return [" + (v.c({expression: true})) + "]");
		} else if(v) {
			return ("return " + (v.c({expression: true})));
		} else {
			return "return";
		};
	};
	
	Return.prototype.c = function (){
		if(!this.value() || this.value().isExpressable()) {
			return Return.__super__.c.apply(this,arguments);
		};
		// p "return must cascade into value".red
		return this.value().consume(this).c();
	};
	
	Return.prototype.consume = function (node){
		return this;
	};
	
	
	/* @class ImplicitReturn */
	function ImplicitReturn(){ Return.apply(this,arguments) };
	
	subclass$(ImplicitReturn,Return);
	exports.ImplicitReturn = ImplicitReturn; // export class 
	
	
	/* @class GreedyReturn */
	function GreedyReturn(){ ImplicitReturn.apply(this,arguments) };
	
	subclass$(GreedyReturn,ImplicitReturn);
	exports.GreedyReturn = GreedyReturn; // export class 
	
	
	// cannot live inside an expression(!)
	/* @class Throw */
	function Throw(){ Statement.apply(this,arguments) };
	
	subclass$(Throw,Statement);
	exports.Throw = Throw; // export class 
	Throw.prototype.js = function (){
		return "throw " + (this.value().c());
	};
	
	Throw.prototype.consume = function (node){
		return this;
	};
	
	
	
	/* @class LoopFlowStatement */
	function LoopFlowStatement(lit,expr){
		this.setLiteral(lit);
		(this.setExpression(expr),expr);// && ArgList.new(expr) # really?
	};
	
	subclass$(LoopFlowStatement,Statement);
	exports.LoopFlowStatement = LoopFlowStatement; // export class 
	
	LoopFlowStatement.prototype.__literal = {};
	LoopFlowStatement.prototype.literal = function(v){ return this._literal; }
	LoopFlowStatement.prototype.setLiteral = function(v){ this._literal = v; return this; };
	
	LoopFlowStatement.prototype.__expression = {};
	LoopFlowStatement.prototype.expression = function(v){ return this._expression; }
	LoopFlowStatement.prototype.setExpression = function(v){ this._expression = v; return this; };
	
	
	
	LoopFlowStatement.prototype.visit = function (){
		return (this.expression()) && (this.expression().traverse());
	};
	
	LoopFlowStatement.prototype.consume = function (node){
		return this;
	};
	
	LoopFlowStatement.prototype.c = function (){
		var copy;
		if(!this.expression()) {
			return LoopFlowStatement.__super__.c.apply(this,arguments);
		};
		// get up to the outer loop
		var _loop = STACK.up(Loop);
		// p "found loop?",_loop
		
		// need to fix the grammar for this. Right now it 
		// is like a fake call, but should only care about the first argument
		var expr = this.expression();
		
		return (_loop.catcher()) ? (
			expr = expr.consume(_loop.catcher()),
			copy = new this.constructor(this.literal()),
			BLOCK(expr,copy).c()
		) : ((expr) ? (
			copy = new this.constructor(this.literal()),
			BLOCK(expr,copy).c()
		) : (
			LoopFlowStatement.__super__.c.apply(this,arguments)
		));
		// return "loopflow"
	};
	
	
	
	/* @class BreakStatement */
	function BreakStatement(){ LoopFlowStatement.apply(this,arguments) };
	
	subclass$(BreakStatement,LoopFlowStatement);
	exports.BreakStatement = BreakStatement; // export class 
	BreakStatement.prototype.js = function (){
		return "break";
	};
	
	
	/* @class ContinueStatement */
	function ContinueStatement(){ LoopFlowStatement.apply(this,arguments) };
	
	subclass$(ContinueStatement,LoopFlowStatement);
	exports.ContinueStatement = ContinueStatement; // export class 
	ContinueStatement.prototype.js = function (){
		return "continue";
	};
	
	
	/* @class DebuggerStatement */
	function DebuggerStatement(){ Statement.apply(this,arguments) };
	
	subclass$(DebuggerStatement,Statement);
	exports.DebuggerStatement = DebuggerStatement; // export class 
	
	
	
	
	
	
	// PARAMS
	
	/* @class Param */
	function Param(name,defaults,typ){
		this._name = name;// .value # this is an identifier(!)
		this._defaults = defaults;
		this._typ = typ;
		this._variable = null;
	};
	
	subclass$(Param,Node);
	exports.Param = Param; // export class 
	
	Param.prototype.__name = {};
	Param.prototype.name = function(v){ return this._name; }
	Param.prototype.setName = function(v){ this._name = v; return this; };
	
	Param.prototype.__index = {};
	Param.prototype.index = function(v){ return this._index; }
	Param.prototype.setIndex = function(v){ this._index = v; return this; };
	
	Param.prototype.__defaults = {};
	Param.prototype.defaults = function(v){ return this._defaults; }
	Param.prototype.setDefaults = function(v){ this._defaults = v; return this; };
	
	Param.prototype.__splat = {};
	Param.prototype.splat = function(v){ return this._splat; }
	Param.prototype.setSplat = function(v){ this._splat = v; return this; };
	
	Param.prototype.__variable = {};
	Param.prototype.variable = function(v){ return this._variable; }
	Param.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	// what about object-params?
	
	
	
	Param.prototype.js = function (){
		if(this._variable) {
			return this._variable.c();
		};
		
		return (this.defaults()) && (
			("if(" + (this.name().c()) + " == null) " + (this.name().c()) + " = " + (this.defaults().c()))
		);
		// see if this is the initial declarator?
	};
	
	Param.prototype.visit = function (){
		var variable_, v_;
		if(this._defaults) {
			this._defaults.traverse();
		};
		(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(this.name(),this)),v_));
		return this;
	};
	
	Param.prototype.assignment = function (){
		return OP('=',this.variable().accessor(),this.defaults());
	};
	
	Param.prototype.isExpressable = function (){
		return !this.defaults() || this.defaults().isExpressable();
		// p "visiting param!!!"
	};
	
	Param.prototype.dump = function (){
		return {loc: this.loc()};
	};
	
	Param.prototype.loc = function (){
		return this._name && this._name.region();
	};
	
	
	
	/* @class SplatParam */
	function SplatParam(){ Param.apply(this,arguments) };
	
	subclass$(SplatParam,Param);
	exports.SplatParam = SplatParam; // export class 
	SplatParam.prototype.loc = function (){
		var r = this.name().region();
		return [r[0] - 1,r[1]];
	};
	
	
	/* @class BlockParam */
	function BlockParam(){ Param.apply(this,arguments) };
	
	subclass$(BlockParam,Param);
	exports.BlockParam = BlockParam; // export class 
	BlockParam.prototype.c = function (){
		return "blockparam";
	};
	
	BlockParam.prototype.loc = function (){
		var r = this.name().region();
		return [r[0] - 1,r[1]];
	};
	
	
	
	/* @class OptionalParam */
	function OptionalParam(){ Param.apply(this,arguments) };
	
	subclass$(OptionalParam,Param);
	exports.OptionalParam = OptionalParam; // export class 
	
	
	/* @class NamedParam */
	function NamedParam(){ Param.apply(this,arguments) };
	
	subclass$(NamedParam,Param);
	exports.NamedParam = NamedParam; // export class 
	
	
	/* @class RequiredParam */
	function RequiredParam(){ Param.apply(this,arguments) };
	
	subclass$(RequiredParam,Param);
	exports.RequiredParam = RequiredParam; // export class 
	
	
	/* @class NamedParams */
	function NamedParams(){ ListNode.apply(this,arguments) };
	
	subclass$(NamedParams,ListNode);
	exports.NamedParams = NamedParams; // export class 
	
	NamedParams.prototype.__index = {};
	NamedParams.prototype.index = function(v){ return this._index; }
	NamedParams.prototype.setIndex = function(v){ this._index = v; return this; };
	
	NamedParams.prototype.__variable = {};
	NamedParams.prototype.variable = function(v){ return this._variable; }
	NamedParams.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	NamedParams.prototype.load = function (list){
		var load = (function (k){
			return new NamedParam(k.key(),k.value());
		});
		return (list instanceof Obj) ? (list.value().map(load)) : (list);
	};
	
	NamedParams.prototype.visit = function (){
		var s = this.scope__();
		this._variable || (this._variable = s.temporary(this,{type: 'keypars'}));
		this._variable.predeclared();
		
		// this is a listnode, which will automatically traverse
		// and visit all children
		NamedParams.__super__.visit.apply(this,arguments);
		// register the inner variables as well(!)
		return this;
	};
	
	NamedParams.prototype.name = function (){
		return this.variable().c();
	};
	
	NamedParams.prototype.js = function (){
		return "namedpar";
	};
	
	
	/* @class IndexedParam */
	function IndexedParam(){ Param.apply(this,arguments) };
	
	subclass$(IndexedParam,Param);
	exports.IndexedParam = IndexedParam; // export class 
	
	IndexedParam.prototype.__parent = {};
	IndexedParam.prototype.parent = function(v){ return this._parent; }
	IndexedParam.prototype.setParent = function(v){ this._parent = v; return this; };
	
	IndexedParam.prototype.__subindex = {};
	IndexedParam.prototype.subindex = function(v){ return this._subindex; }
	IndexedParam.prototype.setSubindex = function(v){ this._subindex = v; return this; };
	
	IndexedParam.prototype.visit = function (){
		var variable_, v_;
		(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(this.name(),this)),v_));
		this.variable().proxy(this.parent().variable(),this.subindex());
		return this;
	};
	
	
	
	/* @class ArrayParams */
	function ArrayParams(){ ListNode.apply(this,arguments) };
	
	subclass$(ArrayParams,ListNode);
	exports.ArrayParams = ArrayParams; // export class 
	
	ArrayParams.prototype.__index = {};
	ArrayParams.prototype.index = function(v){ return this._index; }
	ArrayParams.prototype.setIndex = function(v){ this._index = v; return this; };
	
	ArrayParams.prototype.__variable = {};
	ArrayParams.prototype.variable = function(v){ return this._variable; }
	ArrayParams.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	ArrayParams.prototype.visit = function (){
		var s = this.scope__();
		this._variable || (this._variable = s.temporary(this,{type: 'keypars'}));
		this._variable.predeclared();
		
		// now when we loop through these inner params - we create the pars
		// with the correct name, but bind them to the parent
		return ArrayParams.__super__.visit.apply(this,arguments);
	};
	
	ArrayParams.prototype.name = function (){
		return this.variable().c();
	};
	
	ArrayParams.prototype.load = function (list){
		var self=this;
		if(!((list instanceof Arr))) {
			return null;
		};
		// p "loading arrayparams"
		// try the basic first
		return (!(list.splat())) && (
			list.value().map(function (v,i){
				var name = v;
				if(v instanceof VarOrAccess) {
					name = v.value().value();
					// this is accepted
				};
				return self.parse(name,v,i);
			})
		);
	};
	
	ArrayParams.prototype.parse = function (name,child,i){
		var param = new IndexedParam(name,null);
		
		param.setParent(this);
		param.setSubindex(i);
		return param;
	};
	
	ArrayParams.prototype.head = function (ast){
		return this;
	};
	
	
	/* @class ParamList */
	function ParamList(){ ListNode.apply(this,arguments) };
	
	subclass$(ParamList,ListNode);
	exports.ParamList = ParamList; // export class 
	
	ParamList.prototype.__splat = {};
	ParamList.prototype.splat = function(v){ return this._splat; }
	ParamList.prototype.setSplat = function(v){ this._splat = v; return this; };
	
	ParamList.prototype.__block = {};
	ParamList.prototype.block = function(v){ return this._block; }
	ParamList.prototype.setBlock = function(v){ this._block = v; return this; };
	
	ParamList.prototype.at = function (index,force,name){
		if(force === undefined) force = false;
		if(name === undefined) name = null;
		if(force) {
			while(this.count() <= index){
				this.add(new Param(this.count() == index && name || ("_" + this.count())));
			};
			// need to visit at the same time, no?
		};
		return this.list()[index];
	};
	
	ParamList.prototype.visit = function (){
		this._splat = this.filter(function (par){
			return par instanceof SplatParam;
		})[0];
		var blk = this.filter(BlockParam);
		
		if(blk.length > 1) {
			blk[1].warn("a method can only have one &block parameter");
		} else if(blk[0] && blk[0] != this.last()) {
			blk[0].warn("&block must be the last parameter of a method");
			// warn "&block must be the last parameter of a method", blk[0]
		};
		
		// add more warnings later(!)
		// should probably throw error as well to stop compilation
		
		// need to register the required-pars as variables
		return ParamList.__super__.visit.apply(this,arguments);
	};
	
	ParamList.prototype.js = function (o){
		if(this.count() == 0) {
			return EMPTY;
		};
		if(o.parent() instanceof Block) {
			return this.head(o);
		};
		
		// items = map(|arg| arg.name.c ).compact
		// return null unless items[0]
		
		if(o.parent() instanceof Code) {
			var pars = this.nodes();
			// pars = filter(|arg| arg != @splat && !(arg isa BlockParam)) if @splat
			if(this._splat) {
				pars = this.filter(function (arg){
					return (arg instanceof RequiredParam) || (arg instanceof OptionalParam);
				});
			};
			return compact__(pars.map(function (arg){
				return c__(arg.name());
			})).join(",");
		} else {
			throw "not implemented paramlist js";
			return "ta" + compact__(this.map(function (arg){
				return arg.c();
			})).join(",");
		};
	};
	
	ParamList.prototype.head = function (o){
		var reg = [];
		var opt = [];
		var blk = null;
		var splat = null;
		var named = null;
		var arys = [];
		var signature = [];
		var idx = 0;
		
		this.nodes().forEach(function (par,i){
			par.setIndex(idx);
			if(par instanceof NamedParams) {
				signature.push('named');
				named = par;
			} else if(par instanceof OptionalParam) {
				signature.push('opt');
				opt.push(par);
			} else if(par instanceof BlockParam) {
				signature.push('blk');
				blk = par;
			} else if(par instanceof SplatParam) {
				signature.push('splat');
				splat = par;
				idx -= 1;// this should really be removed from the list, no?
			} else if(par instanceof ArrayParams) {
				arys.push(par);
				signature.push('ary');
			} else {
				signature.push('reg');
				reg.push(par);
			};
			return idx++;
		});
		
		if(named) {
			var namedvar = named.variable();
		};
		
		// var opt = nodes.filter(|n| n isa OptionalParam)
		// var blk = nodes.filter(|n| n isa BlockParam)[0]
		// var splat = nodes.filter(|n| n isa SplatParam)[0]
		
		// simple situation where we simply switch
		// can probably optimize by not looking at arguments at all
		var ast = [];
		var isFunc = function (js){
			return "typeof " + js + " == 'function'";
		};
		
		// This is broken when dealing with iframes anc XSS scripting
		// but for now it is the best test for actual arguments
		// can also do constructor.name == 'Object'
		var isObj = function (js){
			return "" + js + ".constructor === Object";
		};
		var isntObj = function (js){
			return "" + js + ".constructor !== Object";
		};
		// should handle some common cases in a cleaner (less verbose) manner
		// does this work with default params after optional ones? Is that even worth anything?
		// this only works in one direction now, unlike TupleAssign
		
		// we dont really check the length etc now -- so it is buggy for lots of arguments
		
		// if we have optional params in the regular order etc we can go the easy route
		// slightly hacky now. Should refactor all of these to use the signature?
		if(!named && !splat && !blk && opt.length > 0 && signature.join(" ").match(/opt$/)) {
			for(var i=0, ary=iter$(opt), len_=ary.length, par; i < len_; i++) {
				par = ary[i];ast.push(("if(" + (par.name().c()) + " === undefined) " + (par.name().c()) + " = " + (par.defaults().c())));
			};
		} else if(named && !splat && !blk && opt.length == 0) {
			ast.push(("if(!" + (namedvar.c()) + "||" + (isntObj(namedvar.c())) + ") " + (namedvar.c()) + " = \{\}"));
		} else if(blk && opt.length == 1 && !splat && !named) {
			var op = opt[0];
			var opn = op.name().c();
			var bn = blk.name().c();
			ast.push(("if(" + bn + "==undefined && " + (isFunc(opn)) + ") " + bn + " = " + opn + "," + opn + " = " + (op.defaults().c())));
		} else if(blk && named && opt.length == 0 && !splat) {
			bn = blk.name().c();
			ast.push(("if(" + bn + "==undefined && " + (isFunc(namedvar.c())) + ") " + bn + " = " + (namedvar.c()) + "," + (namedvar.c()) + " = \{\}"));
			ast.push(("else if(!" + (namedvar.c()) + "||" + (isntObj(namedvar.c())) + ") " + (namedvar.c()) + " = \{\}"));
		} else if(opt.length > 0 || splat) {
			var argvar = this.scope__().temporary(this,{type: 'arguments'}).predeclared().c();
			var len = this.scope__().temporary(this,{type: 'counter'}).predeclared().c();
			
			var last = ("" + argvar + "[" + len + "-1]");
			var pop = ("" + argvar + "[--" + len + "]");
			ast.push(("var " + argvar + " = arguments, " + len + " = " + argvar + ".length"));
			
			if(blk) {
				bn = blk.name().c();
				if(splat) {
					ast.push(("var " + bn + " = " + (isFunc(last)) + " ? " + pop + " : null"));
				} else if(reg.length > 0) {
					ast.push(("var " + bn + " = " + len + " > " + (reg.length) + " && " + (isFunc(last)) + " ? " + pop + " : null"));
				} else {
					ast.push(("var " + bn + " = " + (isFunc(last)) + " ? " + pop + " : null"));
				};
			};
			
			// if we have named params - look for them before splat
			// should probably loop through pars in the same order they were added
			// should it be prioritized above optional objects??
			if(named) {
				ast.push(("var " + (namedvar.c()) + " = " + last + "&&" + (isObj(last)) + " ? " + pop + " : \{\}"));
			};
			
			for(var i=0, ary=iter$(opt), len_=ary.length, par; i < len_; i++) {
				par = ary[i];ast.push(("if(" + len + " < " + (par.index() + 1) + ") " + (par.name().c()) + " = " + (par.defaults().c())));
			};
			
			// add the splat
			if(splat) {
				var sn = splat.name().c();
				var si = splat.index();
				
				if(si == 0) {
					ast.push(("var " + sn + " = new Array(" + len + ">" + si + " ? " + len + " : 0)"));
					ast.push(("while(" + len + ">" + si + ") " + sn + "[" + len + "-1] = " + pop));
				} else {
					ast.push(("var " + sn + " = new Array(" + len + ">" + si + " ? " + len + "-" + si + " : 0)"));
					ast.push(("while(" + len + ">" + si + ") " + sn + "[--" + len + " - " + si + "] = " + argvar + "[" + len + "]"));
				};
			};
			
			// if named
			// 	for k,i in named.nodes
			// 		# OP('.',namedvar) <- this is the right way, with invalid names etc
			// 		var op = OP('.',namedvar,k.key).c
			// 		ast.push "var {k.key.c} = {op} !== undefined ? {op} : {k.value.c}"
			
			// if named
			
			// return ast.join(";\n") + ";"
			// return "if({opt[0].name.c} instanceof Function) {blk.c} = {opt[0].c};"
		} else if(opt.length > 0) {
			for(var i=0, ary=iter$(opt), len_=ary.length, par; i < len_; i++) {
				par = ary[i];ast.push(("if(" + (par.name().c()) + " === undefined) " + (par.name().c()) + " = " + (par.defaults().c())));
			};
		};
		
		// now set stuff if named params(!)
		
		if(named) {
			for(var i=0, ary=iter$(named.nodes()), len_=ary.length, k; i < len_; i++) {
				k = ary[i];var op = OP('.',namedvar,k.c()).c();
				ast.push(("var " + (k.c()) + " = " + op + " !== undefined ? " + op + " : " + (k.defaults().c())));
			};
		};
		
		if(arys.length) {
			for(var i=0, ary=iter$(arys), len_=ary.length; i < len_; i++) {
				this.p("adding arrayparams");
				ary[i].head(o,ast,this);
				// ast.push v.c
			};
		};
		
		
		
		// if opt:length == 0
		return (ast.length > 0) ? ((ast.join(";\n") + ";")) : (EMPTY);
	};
	
	
	
	// Legacy. Should move away from this?
	/* @class VariableDeclaration */
	function VariableDeclaration(){ ListNode.apply(this,arguments) };
	
	subclass$(VariableDeclaration,ListNode);
	exports.VariableDeclaration = VariableDeclaration; // export class 
	
	VariableDeclaration.prototype.__kind = {};
	VariableDeclaration.prototype.kind = function(v){ return this._kind; }
	VariableDeclaration.prototype.setKind = function(v){ this._kind = v; return this; };
	
	VariableDeclaration.prototype.visit = function (){
		return this.map(function (item){
			return item.traverse();
		});
	};
	
	// we want to register these variables in
	VariableDeclaration.prototype.add = function (name,init){
		var vardec = new VariableDeclarator(name,init);
		this.push(vardec);
		return vardec;
		// TODO (target) << (node) rewrites to a caching push which returns node
	};
	
	// def remove item
	// 	if item isa Variable
	// 		map do |v,i|
	// 			if v.variable == item
	// 				p "found variable to remove"
	// 				super.remove(v)
	// 	else
	// 		super.remove(item)
	// 	self
	
	
	VariableDeclaration.prototype.load = function (list){
		return list.map(function (par){
			return new VariableDeclarator(par.name(),par.defaults(),par.splat());
		});
	};
	
	VariableDeclaration.prototype.isExpressable = function (){
		return this.list().every(function (item){
			return item.isExpressable();
		});
	};
	
	VariableDeclaration.prototype.js = function (){
		if(this.count() == 0) {
			return EMPTY;
		};
		
		if(this.count() == 1 && !this.isExpressable()) {
			this.p("SHOULD ALTER VARDEC!!!".cyan());
			this.first().variable().autodeclare();
			var node = this.first().assignment();
			return node.c();
		};
		
		// unless right.isExpressable
		// 	p "Assign.consume!".blue
		// ast = right.consume(self)
		// return ast.c
		// vars = map|arg| arg.c )
		// single declarations should be useable as/in expressions
		// when they are - we need to declare the variables at the top of scope
		// should do more generic check to find out if variable should be listed
		// var args = filter(|arg| !arg.variable.@proxy )
		return "var " + compact__(cary__(this.nodes())).join(", ") + "";
	};
	
	
	/* @class VariableDeclarator */
	function VariableDeclarator(){ Param.apply(this,arguments) };
	
	subclass$(VariableDeclarator,Param);
	exports.VariableDeclarator = VariableDeclarator; // export class 
	VariableDeclarator.prototype.visit = function (){
		var variable_, v_;
		(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(this.name(),null)),v_));
		if(this.defaults()) {
			this.defaults().traverse();
		};
		this.variable().setDeclarator(this);
		this.variable().addReference(this.name());
		return this;
	};
	
	// needs to be linked up to the actual scoped variables, no?
	VariableDeclarator.prototype.js = function (){
		if(this.variable()._proxy) {
			return null;
		};
		
		var defs = this.defaults();
		// FIXME need to deal with var-defines within other statements etc
		// FIXME need better syntax for this
		return (defs != null && defs != undefined) ? (
			(defs instanceof Node) && (defs = defs.c({expression: true})),// hmmm
			
			("" + (this.variable().c()) + "=" + defs)
		) : (
			("" + (this.variable().c()))
		);
	};
	
	VariableDeclarator.prototype.accessor = function (){
		return this;
	};
	
	
	
	// TODO clean up and refactor all the different representations of vars
	// VarName, VarReference, LocalVarAccess?
	/* @class VarName */
	function VarName(a,b){
		VarName.__super__.constructor.apply(this,arguments);
		this._splat = b;
	};
	
	subclass$(VarName,ValueNode);
	exports.VarName = VarName; // export class 
	
	VarName.prototype.__variable = {};
	VarName.prototype.variable = function(v){ return this._variable; }
	VarName.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	VarName.prototype.__splat = {};
	VarName.prototype.splat = function(v){ return this._splat; }
	VarName.prototype.setSplat = function(v){ this._splat = v; return this; };
	
	
	
	VarName.prototype.visit = function (){
		var variable_, v_;
		(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(this.value().c(),null)),v_));
		this.variable().setDeclarator(this);
		this.variable().addReference(this.value());
		return this;
	};
	
	VarName.prototype.js = function (){
		return this.variable().c();
	};
	
	VarName.prototype.c = function (){
		return this.variable().c();
	};
	
	
	
	/* @class VarList */
	function VarList(t,l,r){
		this._type = this.type();
		this._left = l;
		this._right = r;
	};
	
	subclass$(VarList,Node);
	exports.VarList = VarList; // export class 
	
	VarList.prototype.__type = {};
	VarList.prototype.type = function(v){ return this._type; }
	VarList.prototype.setType = function(v){ this._type = v; return this; };// let / var / const
	
	VarList.prototype.__left = {};
	VarList.prototype.left = function(v){ return this._left; }
	VarList.prototype.setLeft = function(v){ this._left = v; return this; };
	
	VarList.prototype.__right = {};
	VarList.prototype.right = function(v){ return this._right; }
	VarList.prototype.setRight = function(v){ this._right = v; return this; };
	
	// format :type, :left, :right
	
	// should throw error if there are more values on right than left
	
	
	
	VarList.prototype.visit = function (){
		for(var i=0, ary=iter$(this.left()), len=ary.length; i < len; i++) {
			ary[i].traverse();// this should really be a var-declaration
			if((this.setR(this.right()[($1=i)]),this.right()[$1])) {
				this.r().traverse();
			};
		};
		return this;
	};
	
	VarList.prototype.js = function (){
		var pairs = [];
		var ll = this.left().length;
		var rl = this.right().length;
		var v = null;
		
		// splatting here we come
		if(ll > 1 && rl == 1) {
			this.p("multiassign!");
			var r = this.right()[0];
			r.cache();
			for(var i=0, ary=iter$(this.left()), len=ary.length, l; i < len; i++) {
				l = ary[i];if(l.splat()) {
					throw "not supported?";
					this.p("splat");// FIX reimplement slice?
					if(i == ll - 1) {
						v = this.util().slice(r,i);
						this.p("last");
					} else {
						v = this.util().slice(r,i,-(ll - i) + 1);
					};
				} else {
					v = OP('.',r,num__(i));
				};
				
				pairs.push(OP('=',l,v));
			};
		} else {
			for(var i=0, ary=iter$(this.left()), len=ary.length, l; i < len; i++) {
				l = ary[i];var r = this.right()[i];
				pairs.push((r) ? (OP('=',l.variable().accessor(),r)) : (l));
			};
		};
		
		return ("var " + (pairs.c()));
	};
	
	
	
	// CODE
	
	/* @class Code */
	function Code(){ Node.apply(this,arguments) };
	
	subclass$(Code,Node);
	exports.Code = Code; // export class 
	
	Code.prototype.__head = {};
	Code.prototype.head = function(v){ return this._head; }
	Code.prototype.setHead = function(v){ this._head = v; return this; };
	
	Code.prototype.__body = {};
	Code.prototype.body = function(v){ return this._body; }
	Code.prototype.setBody = function(v){ this._body = v; return this; };
	
	Code.prototype.__scope = {};
	Code.prototype.scope = function(v){ return this._scope; }
	Code.prototype.setScope = function(v){ this._scope = v; return this; };
	
	Code.prototype.__params = {};
	Code.prototype.params = function(v){ return this._params; }
	Code.prototype.setParams = function(v){ this._params = v; return this; };
	
	Code.prototype.scopetype = function (){
		return Scope;
	};
	
	Code.prototype.visit = function (){
		if(this._scope) {
			this._scope.visit();
		};
		// @scope.parent = STACK.scope(1) if @scope
		return this;
	};
	
	
	// Rename to Program?
	/* @class Root */
	function Root(body,opts){
		var v_;
		this.setBody(blk__(body));
		(this.setScope(v_=new FileScope(this,null)),v_);
	};
	
	subclass$(Root,Code);
	exports.Root = Root; // export class 
	
	
	Root.prototype.visit = function (){
		this.scope().visit();
		return this.body().traverse();
	};
	
	Root.prototype.compile = function (){
		this.traverse();
		return this.c();
	};
	
	Root.prototype.js = function (){
		return '(function(){\n\n' + this.scope().c({indent: true}) + '\n\n}())';
	};
	
	Root.prototype.analyze = function (){
		this.traverse();
		return this.scope().dump();
	};
	
	Root.prototype.inspect = function (){
		return true;
	};
	
	
	/* @class ClassDeclaration */
	function ClassDeclaration(name,superclass,body){
		this._name = name;
		this._superclass = superclass;
		this._scope = new ClassScope(this);
		this._body = blk__(body);
	};
	
	subclass$(ClassDeclaration,Code);
	exports.ClassDeclaration = ClassDeclaration; // export class 
	
	ClassDeclaration.prototype.__name = {};
	ClassDeclaration.prototype.name = function(v){ return this._name; }
	ClassDeclaration.prototype.setName = function(v){ this._name = v; return this; };
	
	ClassDeclaration.prototype.__superclass = {};
	ClassDeclaration.prototype.superclass = function(v){ return this._superclass; }
	ClassDeclaration.prototype.setSuperclass = function(v){ this._superclass = v; return this; };
	
	ClassDeclaration.prototype.__initor = {};
	ClassDeclaration.prototype.initor = function(v){ return this._initor; }
	ClassDeclaration.prototype.setInitor = function(v){ this._initor = v; return this; };
	
	
	
	ClassDeclaration.prototype.visit = function (){
		this.scope().visit();
		
		// local is the default -- should it really be referenced?
		// if option(:local)
		// self.name = scope.parent.register(name,self)
		
		return this.body().traverse();
	};
	
	ClassDeclaration.prototype.js = function (){
		this.scope().virtualize();
		this.scope().context().setValue(this.name());
		
		// should probably also warn about stuff etc
		if(this.option('extension')) {
			return this.body().c();
		};
		
		var o = this._options || {};
		var cname = (this.name() instanceof Access) ? (this.name().right()) : (this.name());
		var namespaced = this.name() != cname;
		
		var sup = this.superclass();
		var initor = this.body().pluck(function (c){
			return (c instanceof MethodDeclaration) && c.type() == 'constructor';
		});
		// compile the cname
		if(!(typeof cname == 'string')) {
			cname = cname.c();
		};
		
		var cpath = (typeof this.name() == 'string') ? (this.name()) : (this.name().c());
		
		if(!initor) {
			if(sup) {
				initor = ("function " + cname + "()\{ " + (sup.c()) + ".apply(this,arguments) \}");
			} else {
				initor = ("function " + cname + "()") + '{ }';
			};
		} else {
			initor.setName(cname);
			initor = initor.c();
		};
		
		// if we are defining a class inside a namespace etc -- how should we set up the class?
		var head = [];
		
		if(namespaced) {
			initor = ("" + cpath + " = " + initor);// OP('=',name,initor) # hmm
		};
		
		head.push(("/* @class " + cname + " */\n" + initor + ";\n\n"));
		
		if(sup) {
			head.push(new Util.Subclass([this.name(),sup]));
		};
		
		// only if it is not namespaced
		if(o.global && !namespaced) {
			head.push(("global." + cname + " = " + cpath + "; // global class \n"))
		};
		
		if(o.export && !namespaced) {
			head.push(("exports." + cname + " = " + cpath + "; // export class \n"))
		};
		
		// FIXME
		// if namespaced and (o:local or o:export)
		// 	console.log "namespaced classes are implicitly local/global depending on the namespace"
		
		
		for(var i=0, ary=iter$(head.reverse()), len=ary.length; i < len; i++) {
			this.body().unshift(ary[i]);
		};
		this.body()._indentation = null;
		var out = this.body().c();
		
		return out;
	};
	
	
	
	/* @class TagDeclaration */
	function TagDeclaration(name,superclass,body){
		this._name = name;
		this._superclass = superclass;
		this._scope = new TagScope(this);
		this._body = blk__(body || []);
	};
	
	subclass$(TagDeclaration,Code);
	exports.TagDeclaration = TagDeclaration; // export class 
	
	TagDeclaration.prototype.__name = {};
	TagDeclaration.prototype.name = function(v){ return this._name; }
	TagDeclaration.prototype.setName = function(v){ this._name = v; return this; };
	
	TagDeclaration.prototype.__superclass = {};
	TagDeclaration.prototype.superclass = function(v){ return this._superclass; }
	TagDeclaration.prototype.setSuperclass = function(v){ this._superclass = v; return this; };
	
	TagDeclaration.prototype.__initor = {};
	TagDeclaration.prototype.initor = function(v){ return this._initor; }
	TagDeclaration.prototype.setInitor = function(v){ this._initor = v; return this; };
	
	
	
	TagDeclaration.prototype.visit = function (){
		this.scope().visit();
		return this.body().traverse();
	};
	
	TagDeclaration.prototype.id = function (){
		return this.name().id();
	};
	
	TagDeclaration.prototype.js = function (){
		if(this.option('extension')) {
			this.scope().context().setValue(this.name());
			return this.body().c();
		};
		
		// should disallow initialize for tags?
		var sup = this.superclass() && "," + helpers.singlequote(this.superclass().func()) || "";
		
		var out = (this.name().id()) ? (
			("Imba.defineSingletonTag('" + (this.name().id()) + "',function " + (this.name().func()) + "(d)\{this.setDom(d)\}" + sup + ")")
		) : (
			("Imba.defineTag('" + (this.name().func()) + "',function " + (this.name().func()) + "(d)\{this.setDom(d)\}" + sup + ")")
		);
		
		// if the body is empty we can return this directly
		// console.log "here"
		if(this.body().count() == 0) {
			return out;
		};
		
		// create closure etc
		// again, we should really use the included system
		// FIXME should consolidate the way we generate all code - this
		// is going down a route of more direct conversion, which is less
		// flexible.
		
		// WARN should fix
		this.body()._indentation = null;
		
		out = ("var tag = " + out + ";");
		this.scope().context().setValue(new Const('tag'));
		out += ("\n" + (this.body().c()));
		
		return '(function()' + helpers.bracketize(out,true) + ')()';
	};
	
	
	/* @class Func */
	function Func(params,body,name,target,o){
		var typ = this.scopetype();
		this._scope || (this._scope = (o && o.scope) || new typ(this));
		this._scope.setParams(this._params = new ParamList(params));
		this._body = blk__(body);
		this._name = name || '';
		this._target = target;
		this._options = o;
		this._type = 'function';
		this;
	};
	
	subclass$(Func,Code);
	exports.Func = Func; // export class 
	
	Func.prototype.__name = {};
	Func.prototype.name = function(v){ return this._name; }
	Func.prototype.setName = function(v){ this._name = v; return this; };
	
	Func.prototype.__params = {};
	Func.prototype.params = function(v){ return this._params; }
	Func.prototype.setParams = function(v){ this._params = v; return this; };
	
	Func.prototype.__target = {};
	Func.prototype.target = function(v){ return this._target; }
	Func.prototype.setTarget = function(v){ this._target = v; return this; };
	
	Func.prototype.__options = {};
	Func.prototype.options = function(v){ return this._options; }
	Func.prototype.setOptions = function(v){ this._options = v; return this; };
	
	Func.prototype.__type = {};
	Func.prototype.type = function(v){ return this._type; }
	Func.prototype.setType = function(v){ this._type = v; return this; };
	
	Func.prototype.__context = {};
	Func.prototype.context = function(v){ return this._context; }
	Func.prototype.setContext = function(v){ this._context = v; return this; };
	
	Func.prototype.scopetype = function (){
		return FunctionScope;
	};
	
	
	
	Func.prototype.visit = function (){
		this.scope().visit();
		this._context = this.scope().parent();
		this._params.traverse();
		return this._body.traverse();// so soon?
	};
	
	
	Func.prototype.js = function (o){
		if(!this.option('noreturn')) {
			this.body().consume(new ImplicitReturn());
		};
		var code = this.scope().c({indent: true,braces: true});
		// args = params.map do |par| par.name
		// head = params.map do |par| par.c
		// code = [head,body.c(expression: no)].flatten__.compact.join("\n").wrap
		// FIXME creating the function-name this way is prone to create naming-collisions
		// will need to wrap the value in a FunctionName which takes care of looking up scope
		// and possibly dealing with it
		var name = (typeof this._name == 'string') ? (this._name) : (this._name.c());
		name = name.replace(/\./g,'_');
		var out = ("function " + name + "(" + (this.params().c()) + ")") + code;
		if(this.option('eval')) {
			out = ("(" + out + ")()");
		};
		return out;
	};
	
	Func.prototype.shouldParenthesize = function (){
		return (this.up() instanceof Call) && this.up().callee() == this;
		// if up as a call? Only if we are 
	};
	
	
	/* @class Lambda */
	function Lambda(){ Func.apply(this,arguments) };
	
	subclass$(Lambda,Func);
	exports.Lambda = Lambda; // export class 
	Lambda.prototype.scopetype = function (){
		return LambdaScope;
	};
	// MethodDeclaration
	// Create a shared body?
	;
	
	/* @class MethodDeclaration */
	function MethodDeclaration(){ Func.apply(this,arguments) };
	
	subclass$(MethodDeclaration,Func);
	exports.MethodDeclaration = MethodDeclaration; // export class 
	
	MethodDeclaration.prototype.__variable = {};
	MethodDeclaration.prototype.variable = function(v){ return this._variable; }
	MethodDeclaration.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	MethodDeclaration.prototype.scopetype = function (){
		return MethodScope;
	};
	
	MethodDeclaration.prototype.visit = function (){
		var v_;
		if(String(this.name()) == 'initialize') {
			(this.setType(v_='constructor'),v_);
		};
		
		if(this.body().expressions) {
			this.set({greedy: true});
			// p "BODY EXPRESSIONS!! This is a fragment"
			var tree = new TagTree();
			this._body = this.body().consume(tree);
			// body.nodes = [Arr.new(body.nodes)] # hmm
		};
		
		this.scope().visit();
		this._context = this.scope().parent();
		this._params.traverse();
		
		if(this.target() instanceof Self) {
			this._target = this._scope.parent().context();
			this.set({static: true});
		};
		
		if(this.context() instanceof ClassScope) {
			true;
		} else if(!(this._target)) {
			(this.setVariable(v_=this.context().register(this.name(),this,{type: 'meth'})),v_);
		};
		
		// hmm?
		this._target || (this._target = this._scope.parent().context());
		
		this._body.traverse();// so soon?
		
		// p "method target {@target} {@context}"
		return this;
	};
	
	MethodDeclaration.prototype.supername = function (){
		return (this.type() == 'constructor') ? (this.type()) : (this.name());
	};
	
	
	// FIXME export global etc are NOT valid for methods inside any other scope than
	// the outermost scope (root)
	
	MethodDeclaration.prototype.js = function (){
		if(!(this.type() == 'constructor' || this.option('noreturn'))) {
			if(this.option('greedy')) {
				this.body().consume(new GreedyReturn());
			} else {
				this.body().consume(new ImplicitReturn());
			};
		};
		var code = this.scope().c({indent: true,braces: true});
		
		// same for Func -- should generalize
		var name = (typeof this._name == 'string') ? (this._name) : (this._name.c());
		name = name.replace(/\./g,'_');
		
		// var name = self.name.c.replace(/\./g,'_') # WHAT?
		var foot = [];
		
		var left = "";
		var func = ("(" + (this.params().c()) + ")") + code;// .wrap
		var target = this.target();
		var decl = !this.option('global') && !this.option('export');
		
		if(target instanceof ScopeContext) {
			target = null;// hmm -- 
		};
		
		var ctx = this.context();
		var out = "";
		// if ctx 
		
		
		
		var fname = sym__(this.name());
		// console.log "symbolize {self.name} -- {fname}"
		var fdecl = fname;// decl ? fname : ''
		
		if((ctx instanceof ClassScope) && !target) {
			if(this.type() == 'constructor') {
				out = ("function " + fname + func);
			} else if(this.option('static')) {
				out = ("" + (ctx.context().c()) + "." + fname + " = function " + func);
			} else {
				out = ("" + (ctx.context().c()) + ".prototype." + fname + " = function " + func);
			};
		} else if((ctx instanceof FileScope) && !target) {
			out = ("function " + fdecl + func);
		} else if(target && this.option('static')) {
			out = ("" + (target.c()) + "." + fname + " = function " + func);
		} else if(target) {
			out = ("" + (target.c()) + ".prototype." + fname + " = function " + func);
		} else {
			out = ("function " + fdecl + func);
		};
		
		if(this.option('global')) {
			out = ("" + fname + " = " + out);
		};
		
		if(this.option('export')) {
			out = ("" + out + "; exports." + fname + " = " + fname + ";");
		};
		
		return out;
	};
	
	
	
	/* @class TagFragmentDeclaration */
	function TagFragmentDeclaration(){ MethodDeclaration.apply(this,arguments) };
	
	subclass$(TagFragmentDeclaration,MethodDeclaration);
	exports.TagFragmentDeclaration = TagFragmentDeclaration; // export class 
	
	
	
	var propTemplate = '${headers}\n${path}.__${getter} = ${options};\n${path}.${getter} = function(v){ return ${get}; }\n${path}.${setter} = function(v){ ${set}; return this; }\n${init}';
	
	var propWatchTemplate = '${headers}\n${path}.__${getter} = ${options};\n${path}.${getter} = function(v){ return ${get}; }\n${path}.${setter} = function(v){\n	var a = this.${getter}();\n	if(v != a) { v = ${set}; }\n	if(v != a) { ${ondirty} }\n	return this;\n}\n${init}';
	
	/* @class PropertyDeclaration */
	function PropertyDeclaration(name,options){
		this._name = name;
		this._options = options || new Obj(new AssignList());
	};
	
	subclass$(PropertyDeclaration,Expression);
	exports.PropertyDeclaration = PropertyDeclaration; // export class 
	
	PropertyDeclaration.prototype.__name = {};
	PropertyDeclaration.prototype.name = function(v){ return this._name; }
	PropertyDeclaration.prototype.setName = function(v){ this._name = v; return this; };
	
	PropertyDeclaration.prototype.__options = {};
	PropertyDeclaration.prototype.options = function(v){ return this._options; }
	PropertyDeclaration.prototype.setOptions = function(v){ this._options = v; return this; };
	
	
	
	PropertyDeclaration.prototype.visit = function (){
		this._options.traverse();
		return this;
	};
	
	// This will soon support bindings / listeners etc, much more
	// advanced generated code based on options passed in.
	PropertyDeclaration.prototype.c = function (){
		var v_;
		var o = this.options();
		var ast = "";
		var key = this.name().c();
		var gets = ("@" + key);
		var sets = ("@" + key + " = v");
		var scope = STACK.scope();
		
		var deflt = this.options().key('default');
		var init = (deflt) ? (("self:prototype.@" + key + " = " + (deflt.value().c()))) : ("");
		
		// var pars =
		// 	watch: o.key(:watch)
		// 	delegate: o.key(:delegate)
		
		var pars = o.hash();
		
		var js = {
			key: key,
			getter: key,
			setter: sym__(("set-" + key)),
			scope: ("" + (scope.context().c())),
			path: '${scope}.prototype',
			set: ("this._" + key + " = v"),
			get: ("this._" + key),
			init: "",
			headers: "",
			ondirty: ""
		};
		
		var tpl = propTemplate;
		
		if(pars.watch) {
			if(!((pars.watch instanceof Bool) && !(pars.watch.truthy()))) {
				tpl = propWatchTemplate;
			};
			var wfn = ("" + key + "DidSet");
			
			if(pars.watch instanceof Symbol) {
				wfn = pars.watch;
			} else if(pars.watch instanceof Bool) {
				(o.key('watch').setValue(v_=new Symbol(("" + key + "DidSet"))),v_);
			};
			
			// should check for the function first, no?
			// HACK
			// o.key(:watch).value = Symbol
			var fn = OP('.',new This(),wfn);
			js.ondirty = OP('&&',fn,CALL(fn,['v','a',("this.__" + key)])).c();// CALLSELF(wfn,[]).c
			// js:ondirty = "if(this.{wfn}) this.{wfn}(v,a,this.__{key});"
		};
		
		if(o.key('dom') || o.key('attr')) {
			js.set = ("this.setAttribute('" + key + "',v)");
			js.get = ("this.getAttribute('" + key + "')");
		} else if(o.key('delegate')) {
			js.set = ("this.__" + key + ".delegate.set(this,'" + key + "',v,this.__" + key + ")");
			js.get = ("this.__" + key + ".delegate.get(this,'" + key + "',this.__" + key + ")");
		};
		
		if(deflt) {
			if(o.key('dom')) {
				js.init = ("" + (js.scope) + ".dom().setAttribute('" + key + "'," + (deflt.value().c()) + ");");
			} else {
				js.init = ("" + (js.scope) + ".prototype._" + key + " = " + (deflt.value().c()) + ";");
			};
		};
		
		if(o.key('chainable')) {
			js.get = ("v !== undefined ? (this." + (js.setter) + "(v),this) : " + (js.get));
		};
		
		js.options = o.c();
		
		var reg = /\$\{(\w+)\}/gm;
		// var tpl = o.key(:watch) ? propWatchTemplate : propTemplate
		var out = tpl.replace(reg,function (m,a){
			return js[a];
		});
		// run another time for nesting. hacky
		out = out.replace(reg,function (m,a){
			return js[a];
		});
		out = out.replace(/\n\s*$/,'');
		
		// if o.key(:v)
		return out;
	};
	
	
	
	
	
	// Literals should probably not inherit from the same parent
	// as arrays, tuples, objects would be better off inheriting
	// from listnode.
	
	/* @class Literal */
	function Literal(v){
		this._value = v;
	};
	
	subclass$(Literal,ValueNode);
	exports.Literal = Literal; // export class 
	
	
	// hmm
	Literal.prototype.toString = function (){
		return "" + this.value();
	};
	
	Literal.prototype.hasSideEffects = function (){
		return false;
	};
	
	
	
	/* @class Bool */
	function Bool(v){
		this._value = v;
		this._raw = (String(v) == "true") ? (true) : (false);
	};
	
	subclass$(Bool,Literal);
	exports.Bool = Bool; // export class 
	
	
	Bool.prototype.cache = function (){
		return this;
	};
	
	Bool.prototype.truthy = function (){
		return String(this.value()) == "true";
		// yes
	};
	
	Bool.prototype.js = function (){
		return String(this._value);
	};
	
	Bool.prototype.c = function (){
		return String(this._value);
		// @raw ? "true" : "false"
	};
	
	
	
	/* @class True */
	function True(){ Bool.apply(this,arguments) };
	
	subclass$(True,Bool);
	exports.True = True; // export class 
	True.prototype.raw = function (){
		return true;
	};
	
	True.prototype.c = function (){
		console.log("compile True");
		return "true";
	};
	
	
	/* @class False */
	function False(){ Bool.apply(this,arguments) };
	
	subclass$(False,Bool);
	exports.False = False; // export class 
	False.prototype.raw = function (){
		return false;
	};
	
	False.prototype.c = function (){
		return "false";
	};
	
	
	/* @class Num */
	function Num(v){
		this._value = v;
	};
	
	subclass$(Num,Literal);
	exports.Num = Num; // export class 
	
	
	Num.prototype.toString = function (){
		return String(this._value);
	};
	
	Num.prototype.shouldParenthesize = function (){
		return this.up() instanceof Access;
	};
	
	
	Num.prototype.js = function (){
		var num = String(this._value);
		// console.log "compiled num to {num}"
		return num;
	};
	
	Num.prototype.c = function (o){
		var $1;
		if(this._cache) {
			return Num.__super__.c.call(this,o);
		};
		var js = String(this._value);
		var paren = (STACK.current() instanceof Access);// hmmm
		// console.log "should paren?? {shouldParenthesize}"
		return (paren) ? ("(" + js + ")") : (js);
		// @cache ? super(o) : String(@value)
	};
	
	// def cache
	// 	p "cache num"
	// 	self
	
	Num.prototype.raw = function (){
		return JSON.parse(String(this.value()));
	};
	
	
	// should be quoted no?
	// what about strings in object-literals?
	// we want to be able to see if the values are allowed
	/* @class Str */
	function Str(v){
		this._value = v;
		// should grab the actual value immediately?
	};
	
	subclass$(Str,Literal);
	exports.Str = Str; // export class 
	
	
	Str.prototype.raw = function (){
		return this._raw || (this._raw = String(this.value()).slice(1,-1));// incredibly stupid solution
	};
	
	Str.prototype.isValidIdentifier = function (){
		return (this.raw().match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/)) ? (true) : (false);
	};
	
	Str.prototype.js = function (){
		return String(this._value);// hmm
	};
	
	Str.prototype.c = function (o){
		var $1;
		return (this._cache) ? (Str.__super__.c.call(this,o)) : (String(this._value));
	};
	
	
	// Currently not used - it would be better to use this
	// for real interpolated strings though, than to break
	// them up into their parts before parsing
	/* @class InterpolatedString */
	function InterpolatedString(){ ListNode.apply(this,arguments) };
	
	subclass$(InterpolatedString,ListNode);
	exports.InterpolatedString = InterpolatedString; // export class 
	InterpolatedString.prototype.js = function (){
		return "interpolated string";
	};
	
	
	
	/* @class Tuple */
	function Tuple(){ ListNode.apply(this,arguments) };
	
	subclass$(Tuple,ListNode);
	exports.Tuple = Tuple; // export class 
	Tuple.prototype.c = function (){
		return new Arr(this.nodes()).c();
	};
	
	Tuple.prototype.hasSplat = function (){
		return this.filter(function (v){
			return v instanceof Splat;
		})[0];
	};
	
	Tuple.prototype.consume = function (node){
		if(this.count() == 1) {
			return this.first().consume(node);
		} else {
			throw "multituple cannot consume";
		};
	};
	
	
	
	// Because we've dropped the Str-wrapper it is kinda difficult
	/* @class Symbol */
	function Symbol(){ Literal.apply(this,arguments) };
	
	subclass$(Symbol,Literal);
	exports.Symbol = Symbol; // export class 
	Symbol.prototype.isValidIdentifier = function (){
		return (this.raw().match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/)) ? (true) : (false);
	};
	
	Symbol.prototype.raw = function (){
		return this._raw || (this._raw = sym__(this.value()));
	};
	
	Symbol.prototype.js = function (){
		return "'" + (sym__(this.value())) + "'";
	};
	
	
	/* @class RegExp */
	function RegExp(){ Literal.apply(this,arguments) };
	
	subclass$(RegExp,Literal);
	exports.RegExp = RegExp; // export class 
	
	
	// Should inherit from ListNode - would simplify
	/* @class Arr */
	function Arr(){ Literal.apply(this,arguments) };
	
	subclass$(Arr,Literal);
	exports.Arr = Arr; // export class 
	Arr.prototype.load = function (value){
		return (value instanceof Array) ? (new ArgList(value)) : (value);
	};
	
	Arr.prototype.push = function (item){
		this.value().push(item);
		return this;
	};
	
	Arr.prototype.count = function (){
		return this.value().length;
	};
	
	Arr.prototype.nodes = function (){
		return this.value();
	};
	
	Arr.prototype.splat = function (){
		return this.value().some(function (v){
			return v instanceof Splat;
		});
	};
	
	Arr.prototype.visit = function (){
		if(this._value && this._value.traverse) {
			this._value.traverse();
		};
		return this;
	};
	
	Arr.prototype.js = function (){
		var slices, group, v;
		var splat = this.value().some(function (v){
			return v instanceof Splat;
		});
		
		return (splat) ? (
			"SPLATTED ARRAY!",
			// if we know for certain that the splats are arrays we can drop the slice?
			slices = [],
			group = null,
			this.value().forEach(function (v){
				return (v instanceof Splat) ? (
					slices.push(v),
					group = null
				) : (
					(!group) && (slices.push(group = new Arr([]))),
					group.push(v)
				);
			}),
			
			("[].concat(" + (cary__(slices).join(", ")) + ")")
		) : (
			v = this.value(),
			v = (v instanceof Array) ? (cary__(v)) : (v.c()),// hmmm
			("[" + v + "]")
		);
	};
	
	// def indented
	// 	var o = @options ||= {}
	// 	o:indent = yes
	// 	self
	
	Arr.prototype.hasSideEffects = function (){
		return this.value().some(function (v){
			return v.hasSideEffects();
		});
	};
	
	Arr.prototype.toString = function (){
		return "Arr";
	};
	
	
	Arr.wrap = function (val){
		return new Arr(val);
	};
	
	
	// should not be cklassified as a literal?
	/* @class Obj */
	function Obj(){ Literal.apply(this,arguments) };
	
	subclass$(Obj,Literal);
	exports.Obj = Obj; // export class 
	Obj.prototype.load = function (value){
		return (value instanceof Array) ? (new AssignList(value)) : (value);
	};
	
	Obj.prototype.visit = function (){
		if(this._value) {
			this._value.traverse();
		};
		// for v in value
		// 	v.traverse
		return this;
	};
	
	Obj.prototype.js = function (){
		var dyn = this.value().filter(function (v){
			return (v instanceof ObjAttr) && (v.key() instanceof Op);
		});
		
		if(dyn.length > 0) {
			var idx = this.value().indexOf(dyn[0]);
			// p "dynamic keys! {dyn}"
			// create a temp variable
			
			var tmp = this.scope__().temporary(this);
			// set the temporary object to the same
			var first = this.value().slice(0,idx);
			var obj = new Obj(first);
			var ast = [OP('=',tmp,obj)];
			
			this.value().slice(idx).forEach(function (atr){
				return ast.push(OP('=',OP('.',tmp,atr.key()),atr.value()));
			});
			ast.push(tmp);// access the tmp at in the last part
			return new Parens(ast).c();
		};
		
		
		// var body = value.map do |v|
		// 	var out = v.c
		// 	out = '\n' + out if v.@pbr # hmmm 
		// 	out
		
		// if @indented
		// 	# should be more generalized?
		// 	body = '\n' + body.join(',').indent + '\n' # hmmm
		// else
		// 	body.join(',')
		
		// for objects with expression-keys we need to think differently
		return '{' + this.value().c() + '}';
	};
	
	Obj.prototype.add = function (k,v){
		var kv = new ObjAttr(k,v);
		this.value().push(kv);
		return kv;
	};
	
	Obj.prototype.hash = function (){
		var hash = {};
		for(var i=0, ary=iter$(this.value()), len=ary.length, k; i < len; i++) {
			k = ary[i];if(k instanceof ObjAttr) {
				hash[k.key().symbol()] = k.value();
			};
		};
		return hash;
		// return k if k.key.symbol == key
	};
	
	// add method for finding properties etc?
	Obj.prototype.key = function (key){
		for(var i=0, ary=iter$(this.value()), len=ary.length, k; i < len; i++) {
			k = ary[i];if((k instanceof ObjAttr) && k.key().symbol() == key) {
				return k;
			};
		};
		return null;
	};
	
	Obj.prototype.indented = function (a,b){
		this._value.indented(a,b);
		return this;
	};
	
	Obj.prototype.hasSideEffects = function (){
		return this.value().some(function (v){
			return v.hasSideEffects();
		});
	};
	
	// for converting a real object into an ast-representation
	Obj.wrap = function (obj){
		var attrs = [];
		for(var o=obj, v, i=0, keys=Object.keys(o), l=keys.length; i < l; i++){
			v = o[keys[i]];if(v instanceof Array) {
				v = Arr.wrap(v);
			} else if(v.constructor == Object) {
				v = Obj.wrap(v);
			};
			attrs.push(new ObjAttr(keys[i],v));
		};
		return new Obj(attrs);
	};
	
	Obj.prototype.toString = function (){
		return "Obj";
	};
	
	
	/* @class ObjAttr */
	function ObjAttr(key,value){
		this._key = key;
		this._value = value;
		this._dynamic = (key instanceof Op);
	};
	
	subclass$(ObjAttr,Node);
	exports.ObjAttr = ObjAttr; // export class 
	
	ObjAttr.prototype.__key = {};
	ObjAttr.prototype.key = function(v){ return this._key; }
	ObjAttr.prototype.setKey = function(v){ this._key = v; return this; };
	
	ObjAttr.prototype.__value = {};
	ObjAttr.prototype.value = function(v){ return this._value; }
	ObjAttr.prototype.setValue = function(v){ this._value = v; return this; };
	
	ObjAttr.prototype.__options = {};
	ObjAttr.prototype.options = function(v){ return this._options; }
	ObjAttr.prototype.setOptions = function(v){ this._options = v; return this; };
	
	
	
	ObjAttr.prototype.visit = function (){
		this.key().traverse();
		return this.value().traverse();
	};
	
	ObjAttr.prototype.js = function (){
		return "" + (this.key().c()) + ": " + (this.value().c());
	};
	
	ObjAttr.prototype.hasSideEffects = function (){
		return true;
	};
	
	
	
	
	/* @class ArgsReference */
	function ArgsReference(){ Node.apply(this,arguments) };
	
	subclass$(ArgsReference,Node);
	exports.ArgsReference = ArgsReference; // export class 
	ArgsReference.prototype.c = function (){
		return "arguments";
	};
	
	
	// should be a separate Context or something
	/* @class Self */
	function Self(scope){
		this._scope = scope;
	};
	
	subclass$(Self,Literal);
	exports.Self = Self; // export class 
	
	Self.prototype.__scope = {};
	Self.prototype.scope = function(v){ return this._scope; }
	Self.prototype.setScope = function(v){ this._scope = v; return this; };
	
	
	
	Self.prototype.cache = function (){
		return this;
	};
	
	Self.prototype.reference = function (){
		return this;
	};
	
	Self.prototype.c = function (){
		var s = this.scope__();
		return (s) ? (s.context().c()) : ("this");
	};
	
	
	/* @class ImplicitSelf */
	function ImplicitSelf(){ Self.apply(this,arguments) };
	
	subclass$(ImplicitSelf,Self);
	exports.ImplicitSelf = ImplicitSelf; // export class 
	
	
	/* @class This */
	function This(){ Self.apply(this,arguments) };
	
	subclass$(This,Self);
	exports.This = This; // export class 
	This.prototype.cache = function (){
		return this;
	};
	
	This.prototype.reference = function (){
		return this;
	};
	
	This.prototype.c = function (){
		return "this";
	};
	
	
	
	
	
	// OPERATORS
	
	/* @class Op */
	function Op(o,l,r){
		this._invert = false;
		this._op = o && o._value || o;// hmmmm
		this._left = l;
		this._right = r;
		return this;
	};
	
	subclass$(Op,Node);
	exports.Op = Op; // export class 
	
	Op.prototype.__op = {};
	Op.prototype.op = function(v){ return this._op; }
	Op.prototype.setOp = function(v){ this._op = v; return this; };
	
	Op.prototype.__left = {};
	Op.prototype.left = function(v){ return this._left; }
	Op.prototype.setLeft = function(v){ this._left = v; return this; };
	
	Op.prototype.__right = {};
	Op.prototype.right = function(v){ return this._right; }
	Op.prototype.setRight = function(v){ this._right = v; return this; };
	
	
	
	Op.prototype.visit = function (){
		if(this._right) {
			this._right.traverse();
		};
		if(this._left) {
			this._left.traverse();
		};
		return this;
	};
	
	Op.prototype.isExpressable = function (){
		return !this.right() || this.right().isExpressable();
	};
	
	Op.prototype.js = function (){
		var out = null;
		var op = this._op;
		
		var l = this._left;
		var r = this._right;
		
		// hmmmm?
		if(l instanceof Node) {
			l = l.c();
		};// hmmm
		if(r instanceof Node) {
			r = r.c();
		};
		
		if(l && r) {
			out = ("" + l + " " + op + " " + r);
		} else if(l) {
			out = ("" + op + l);
		};
		// out = out.parenthesize if up isa Op # really?
		return out;
	};
	
	Op.prototype.shouldParenthesize = function (){
		return this.option('parens');
	};
	
	Op.prototype.precedence = function (){
		return 10;
	};
	
	Op.prototype.consume = function (node){
		if(this.isExpressable()) {
			return Op.__super__.consume.apply(this,arguments);
		};
		
		// TODO can rather use global caching?
		var tmpvar = this.scope__().declare('tmp',null,{system: true});
		var clone = OP(this.op(),this.left(),null);
		var ast = this.right().consume(clone);
		if(node) {
			ast.consume(node);
		};
		return ast;
	};
	
	
	/* @class ComparisonOp */
	function ComparisonOp(){ Op.apply(this,arguments) };
	
	subclass$(ComparisonOp,Op);
	exports.ComparisonOp = ComparisonOp; // export class 
	ComparisonOp.prototype.invert = function (){
		var op = this._op;
		var pairs = ["==","!=","===","!==",">","<=","<",">="];
		var idx = pairs.indexOf(op);
		idx += ((idx % 2) ? (-1) : (1));
		
		// p "inverted comparison(!) {idx} {op} -> {pairs[idx]}"
		this.setOp(pairs[idx]);
		this._invert = !(this._invert);
		return this;
	};
	
	ComparisonOp.prototype.c = function (){
		return (this.left() instanceof ComparisonOp) ? (
			this.left().right().cache(),
			OP('&&',this.left(),OP(this.op(),this.left().right(),this.right())).c()
		) : (
			ComparisonOp.__super__.c.apply(this,arguments)
		);
	};
	
	ComparisonOp.prototype.js = function (){
		var op = this._op;
		var l = this._left;
		var r = this._right;
		
		// hmmmm?
		if(l instanceof Node) {
			l = l.c();
		};// hmmm
		if(r instanceof Node) {
			r = r.c();
		};
		return ("" + l + " " + op + " " + r);
	};
	
	
	
	/* @class MathOp */
	function MathOp(){ Op.apply(this,arguments) };
	
	subclass$(MathOp,Op);
	exports.MathOp = MathOp; // export class 
	MathOp.prototype.c = function (){
		if(this.op() == '∪') {
			return this.util().union(this.left(),this.right()).c();
		} else if(this.op() == '∩') {
			return this.util().intersect(this.left(),this.right()).c();
		};
	};
	
	
	
	/* @class UnaryOp */
	function UnaryOp(){ Op.apply(this,arguments) };
	
	subclass$(UnaryOp,Op);
	exports.UnaryOp = UnaryOp; // export class 
	UnaryOp.prototype.invert = function (){
		if(this.op() == '!') {
			return this.left();
		} else {
			return UnaryOp.__super__.invert.apply(this,arguments);// regular invert
		};
	};
	
	UnaryOp.prototype.js = function (){
		var l = this._left;
		var r = this._right;
		// all of this could really be done i a much
		// cleaner way.
		if(l) {
			l.set({parens: true});
		};
		if(r) {
			r.set({parens: true});
		};
		
		return (this.op() == '!') ? (
			l.set({parens: true}),
			("" + this.op() + (l.c()))
		) : ((this.op() == '√') ? (
			("Math.sqrt(" + (l.c()) + ")")
		) : ((this.left()) ? (
			("" + (l.c()) + this.op())
		) : (
			("" + this.op() + (r.c()))
		)));
	};
	
	UnaryOp.prototype.normalize = function (){
		if(this.op() == '!' || this.op() == '√') {
			return this;
		};
		var node = (this.left() || this.right()).node();
		// for property-accessors we need to rewrite the ast
		if(!((node instanceof PropertyAccess))) {
			return this;
		};
		
		// ask to cache the path
		if((node instanceof Access) && node.left()) {
			node.left().cache();
		};
		
		var num = new Num(1);
		var ast = OP('=',node,OP(this.op()[0],node,num));
		if(this.left()) {
			ast = OP((this.op()[0] == '-') ? ('+') : ('-'),ast,num);
		};
		
		return ast;
	};
	
	UnaryOp.prototype.consume = function (node){
		var norm = this.normalize();
		return (norm == this) ? (UnaryOp.__super__.consume.apply(this,arguments)) : (norm.consume(node));
	};
	
	UnaryOp.prototype.c = function (){
		var norm = this.normalize();
		return (norm == this) ? (UnaryOp.__super__.c.apply(this,arguments)) : (norm.c());
	};
	
	
	/* @class InstanceOf */
	function InstanceOf(){ Op.apply(this,arguments) };
	
	subclass$(InstanceOf,Op);
	exports.InstanceOf = InstanceOf; // export class 
	InstanceOf.prototype.js = function (o){
		if(this.right() instanceof Const) {
			var name = c__(this.right().value());
			var obj = this.left().node();
			// TODO also check for primitive-constructor
			if(idx$(name,['String','Number','Boolean']) >= 0) {
				if(!((obj instanceof LocalVarAccess))) {
					obj.cache();
				};
				// need a double check for these (cache left) - possibly
				return ("(typeof " + (obj.c()) + "=='" + (name.toLowerCase()) + "'||" + (obj.c()) + " instanceof " + name + ")");
				
				// convert
			};
		};
		var out = ("" + (this.left().c()) + " " + this.op() + " " + (this.right().c()));
		
		// should this not happen in #c?
		if(o.parent() instanceof Op) {
			out = helpers.parenthesize(out);
		};
		return out;
	};
	
	
	/* @class TypeOf */
	function TypeOf(){ Op.apply(this,arguments) };
	
	subclass$(TypeOf,Op);
	exports.TypeOf = TypeOf; // export class 
	TypeOf.prototype.js = function (){
		return "typeof " + (this.left().c());
	};
	
	
	/* @class Delete */
	function Delete(){ Op.apply(this,arguments) };
	
	subclass$(Delete,Op);
	exports.Delete = Delete; // export class 
	Delete.prototype.js = function (){
		var l = this.left();
		var tmp = this.scope__().temporary(this,{type: 'val'});
		var o = OP('=',tmp,l);
		// FIXME
		return ("(" + (o.c()) + ",delete " + (l.c()) + ", " + (tmp.c()) + ")");// oh well
		// var ast = [OP('=',tmp,left),"delete {left.c}",tmp]
		// should parenthesize directly no?
		// ast.c
	};
	
	Delete.prototype.shouldParenthesize = function (){
		return true;
	};
	
	
	/* @class In */
	function In(){ Op.apply(this,arguments) };
	
	subclass$(In,Op);
	exports.In = In; // export class 
	In.prototype.invert = function (){
		this._invert = !(this._invert);
		return this;
	};
	
	In.prototype.js = function (){
		var cond = (this._invert) ? ("== -1") : (">= 0");
		var idx = Util.indexOf(this.left(),this.right());
		return "" + (idx.c()) + " " + cond;
	};
	
	
	
	
	
	// ACCESS
	
	/* @class Access */
	function Access(){ Op.apply(this,arguments) };
	
	subclass$(Access,Op);
	exports.Access = Access; // export class 
	Access.prototype.clone = function (left,right){
		var ctor = this.constructor;
		return new ctor(this.op(),left,right);
	};
	
	Access.prototype.js = function (){
		var raw = null;
		var rgt = this.right();
		
		// is this right? Should not the index compile the brackets
		// or value is a symbol -- should be the same, no?
		if((rgt instanceof Index) && ((rgt.value() instanceof Str) || (rgt.value() instanceof Symbol))) {
			rgt = rgt.value();
		};
		
		// TODO do the identifier-validation in a central place instead
		if((rgt instanceof Str) && rgt.isValidIdentifier()) {
			raw = rgt.raw();
		} else if((rgt instanceof Symbol) && rgt.isValidIdentifier()) {
			raw = rgt.raw();
		} else if((rgt instanceof Identifier) && rgt.isValidIdentifier()) {
			raw = rgt.c();
		};
		
		// really?
		var ctx = (this.left() || this.scope__().context());
		
		if(ctx instanceof RootScopeContext) {
			return ((raw) ? (raw) : (("global[" + (rgt.c()) + "]")));
		};
		
		// see if it needs quoting
		if(raw) {
			return (ctx) ? (("" + (ctx.c()) + "." + raw)) : (raw);
		} else {
			var r = (rgt instanceof Node) ? (rgt.c({expression: true})) : (rgt);
			return ("" + (ctx.c()) + "[" + r + "]");
		};
	};
	
	Access.prototype.visit = function (){
		if(this.left()) {
			this.left().traverse();
		};
		if(this.right()) {
			this.right().traverse();
		};
		return;
	};
	
	Access.prototype.isExpressable = function (){
		return true;// ?
	};
	
	Access.prototype.isExpressable = function (){
		return true;
	};
	
	Access.prototype.alias = function (){
		return (this.right() instanceof Identifier) ? (sym__(this.right())) : (Access.__super__.alias.apply(this,arguments));
	};
	
	Access.prototype.safechain = function (){
		return this.right().safechain();
	};
	
	
	
	// Should change this to just refer directly to the variable? Or VarReference
	/* @class LocalVarAccess */
	function LocalVarAccess(){ Access.apply(this,arguments) };
	
	subclass$(LocalVarAccess,Access);
	exports.LocalVarAccess = LocalVarAccess; // export class 
	
	LocalVarAccess.prototype.__safechain = {};
	LocalVarAccess.prototype.safechain = function(v){ return this._safechain; }
	LocalVarAccess.prototype.setSafechain = function(v){ this._safechain = v; return this; };
	
	LocalVarAccess.prototype.js = function (){
		if((this.right() instanceof Variable) && this.right().type() == 'meth') {
			if(!((this.up() instanceof Call))) {
				return ("" + (this.right().c()) + "()");
			};
		};
		
		return this.right().c();
	};
	
	LocalVarAccess.prototype.variable = function (){
		return this.right();
	};
	
	LocalVarAccess.prototype.cache = function (o){
		if(o === undefined) o = {};
		if(o.force) {
			LocalVarAccess.__super__.cache.apply(this,arguments);
		};// hmm
		return this;
	};
	
	LocalVarAccess.prototype.alias = function (){
		return this.variable()._alias || LocalVarAccess.__super__.alias.apply(this,arguments);// if resolved?
	};
	
	
	
	/* @class GlobalVarAccess */
	function GlobalVarAccess(){ ValueNode.apply(this,arguments) };
	
	subclass$(GlobalVarAccess,ValueNode);
	exports.GlobalVarAccess = GlobalVarAccess; // export class 
	GlobalVarAccess.prototype.js = function (){
		return this.value().c();
	};
	
	
	
	/* @class ObjectAccess */
	function ObjectAccess(){ Access.apply(this,arguments) };
	
	subclass$(ObjectAccess,Access);
	exports.ObjectAccess = ObjectAccess; // export class 
	
	
	
	/* @class PropertyAccess */
	function PropertyAccess(){ Access.apply(this,arguments) };
	
	subclass$(PropertyAccess,Access);
	exports.PropertyAccess = PropertyAccess; // export class 
	PropertyAccess.prototype.js = function (o){
		var rec;
		if(rec = this.receiver()) {
			var ast = CALL(OP('.',this.left(),this.right()),[]);
			ast.setReceiver(rec);
			return ast.c();
		};
		
		// really need to fix this - for sure
		var js = ("" + PropertyAccess.__super__.js.apply(this,arguments));
		if(!((this.up() instanceof Call) || (this.up() instanceof Util.IsFunction))) {
			js += "()";
		};
		return js;
	};
	
	PropertyAccess.prototype.receiver = function (){
		return ((this.left() instanceof SuperAccess) || (this.left() instanceof Super)) ? (
			SELF
		) : (
			null
		);
	};
	
	
	
	/* @class IvarAccess */
	function IvarAccess(){ Access.apply(this,arguments) };
	
	subclass$(IvarAccess,Access);
	exports.IvarAccess = IvarAccess; // export class 
	IvarAccess.prototype.cache = function (){
		return this;
	};
	
	
	
	/* @class ConstAccess */
	function ConstAccess(){ Access.apply(this,arguments) };
	
	subclass$(ConstAccess,Access);
	exports.ConstAccess = ConstAccess; // export class 
	
	
	
	/* @class IndexAccess */
	function IndexAccess(){ Access.apply(this,arguments) };
	
	subclass$(IndexAccess,Access);
	exports.IndexAccess = IndexAccess; // export class 
	IndexAccess.prototype.cache = function (o){
		if(o === undefined) o = {};
		if(o.force) {
			return IndexAccess.__super__.cache.apply(this,arguments);
		};
		this.right().cache();
		return this;
	};
	
	
	
	/* @class SuperAccess */
	function SuperAccess(){ Access.apply(this,arguments) };
	
	subclass$(SuperAccess,Access);
	exports.SuperAccess = SuperAccess; // export class 
	SuperAccess.prototype.js = function (o){
		var m = o.method();
		var up = o.parent();
		var deep = (o.parent() instanceof Access);
		
		var out = ("" + (this.left().c()) + ".__super__");
		
		if(!((up instanceof Access))) {
			out += ("." + (m.supername().c()));
			if(!((up instanceof Call))) {
				out += (".apply(" + (m.scope().context().c()) + ",arguments)");
			};
		};
		
		return out;
	};
	
	SuperAccess.prototype.receiver = function (){
		return SELF;
	};
	
	
	
	/* @class VarOrAccess */
	function VarOrAccess(){ ValueNode.apply(this,arguments) };
	
	subclass$(VarOrAccess,ValueNode);
	exports.VarOrAccess = VarOrAccess; // export class 
	VarOrAccess.prototype.visit = function (){
		var v_;
		this._identifier = this.value();// this is not a real identifier?
		// console.log "VarOrAccess {@identifier}"
		
		var scope = this.scope__();
		var variable = scope.lookup(this.value());
		
		if(variable && variable.declarator()) {
			variable.addReference(this);// hmm
			
			this.setValue(variable.accessor(this));
			(this.value().setSafechain(v_=this.safechain()),v_);// hmm
		} else if(this.value().symbol().indexOf('$') >= 0) {
			(this.setValue(v_=new GlobalVarAccess(this.value())),v_);
		} else {
			(this.setValue(v_=new PropertyAccess(".",scope.context(),this.value())),v_);
		};
		
		return this._value.traverse();
	};
	
	VarOrAccess.prototype.c = function (){
		return this.value().c();
	};
	
	VarOrAccess.prototype.node = function (){
		return this.value();
	};
	
	VarOrAccess.prototype.symbol = function (){
		return this.value() && this.value().symbol();
	};
	
	VarOrAccess.prototype.cache = function (o){
		if(o === undefined) o = {};
		return this.value().cache(o);
	};
	
	VarOrAccess.prototype.decache = function (){
		this.value().decache();
		return this;
	};
	
	VarOrAccess.prototype.dom = function (){
		return this.value().dom();
	};
	
	VarOrAccess.prototype.safechain = function (){
		return this._identifier.safechain();// hmm
	};
	
	VarOrAccess.prototype.dump = function (){
		return {loc: this.loc()};
	};
	
	VarOrAccess.prototype.loc = function (){
		var loc = this._identifier.region();
		return loc || [0,0];
	};
	
	VarOrAccess.prototype.toString = function (){
		return "VarOrAccess(" + this.value() + ")";
	};
	
	
	
	/* @class VarReference */
	function VarReference(){ ValueNode.apply(this,arguments) };
	
	subclass$(VarReference,ValueNode);
	exports.VarReference = VarReference; // export class 
	
	VarReference.prototype.__variable = {};
	VarReference.prototype.variable = function(v){ return this._variable; }
	VarReference.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	VarReference.prototype.js = function (o){
		var ref = this._variable;
		var out = ref.c();
		
		if(ref && !ref.option('declared')) {
			if(o.up(VarBlock)) {
				ref.set({declared: true});
			} else if(o.isExpression() || this.option('export')) {
				ref.autodeclare();
			} else {
				out = ("var " + out);
				ref.set({declared: true});
			};
		};
		
		// need to think the export through -- like registering somehow
		// should register in scope - export on analysis++
		if(this.option('export')) {
			out = ("module.exports." + (ref.c()) + " = " + (ref.c()));
		};
		
		return out;
	};
	
	VarReference.prototype.declare = function (){
		return this;
	};
	
	VarReference.prototype.consume = function (node){
		this._variable && this._variable.autodeclare();
		return this;
	};
	
	VarReference.prototype.visit = function (){
		var variable_, v_;
		var name = this.value().c();
		// what about looking up? - on register we want to mark
		(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(name,null)),v_));
		// FIXME -- should not simply override the declarator here(!)
		this.variable().setDeclarator(this);// hmm, cannot be certain, but ok for now
		this.variable().addReference(this.value());// is this the first reference?
		return this;
	};
	
	VarReference.prototype.refnr = function (){
		return this.variable().references().indexOf(this.value());
	};
	
	// convert this into a list of references
	VarReference.prototype.addExpression = function (expr){
		return new VarBlock([this]).addExpression(expr);
	};
	
	
	
	
	
	// ASSIGN
	
	/* @class Assign */
	function Assign(){ Op.apply(this,arguments) };
	
	subclass$(Assign,Op);
	exports.Assign = Assign; // export class 
	Assign.prototype.isExpressable = function (){
		return !this.right() || this.right().isExpressable();
	};
	
	Assign.prototype.isUsed = function (){
		if((this.up() instanceof Block) && this.up().last() != this) {
			return false;
		};
		return true;
	};
	
	Assign.prototype.js = function (o){
		if(!(this.right().isExpressable())) {
			return this.right().consume(this).c();
		};
		
		// p "assign left {left:contrstru}"
		var l = this.left().node();
		
		// We are setting self(!)
		// TODO document functionality
		if(l instanceof Self) {
			var ctx = this.scope__().context();
			l = ctx.reference();
		};
		
		
		if(l instanceof PropertyAccess) {
			var ast = CALL(OP('.',l.left(),l.right().setter()),[this.right()]);
			ast.setReceiver(l.receiver());
			
			if(this.isUsed()) {
				if(!(this.right().cachevar())) {
					this.right().cache({type: 'val',uses: 1});
				};// 
				// this is only when used.. should be more clever about it
				ast = new Parens(blk__([ast,this.right()]));
			};
			
			// should check the up-value no?
			return ast.c({expression: true});
		};
		
		// FIXME -- does not always need to be an expression?
		var out = ("" + (l.c()) + " " + this.op() + " " + (this.right().c({expression: true})));
		
		return out;
	};
	
	Assign.prototype.shouldParenthesize = function (){
		return (this.up() instanceof Op) && this.up().op() != '=';
	};
	
	
	Assign.prototype.consume = function (node){
		if(this.isExpressable()) {
			this.forceExpression();
			return Assign.__super__.consume.apply(this,arguments);
		};
		
		var ast = this.right().consume(this);
		return ast.consume(node);
	};
	
	
	
	/* @class PushAssign */
	function PushAssign(){ Assign.apply(this,arguments) };
	
	subclass$(PushAssign,Assign);
	exports.PushAssign = PushAssign; // export class 
	PushAssign.prototype.js = function (){
		return "" + (this.left().c()) + ".push(" + (this.right().c()) + ")";
	};
	
	PushAssign.prototype.consume = function (node){
		return this;
	};
	
	
	
	/* @class ConditionalAssign */
	function ConditionalAssign(){ Assign.apply(this,arguments) };
	
	subclass$(ConditionalAssign,Assign);
	exports.ConditionalAssign = ConditionalAssign; // export class 
	ConditionalAssign.prototype.consume = function (node){
		return this.normalize().consume(node);
	};
	
	ConditionalAssign.prototype.normalize = function (){
		var l = this.left().node();
		var ls = l;
		
		if(l instanceof Access) {
			if(l.left()) {
				l.left().cache();
			};
			ls = l.clone(l.left(),l.right());// this should still be cached?
			if(l instanceof PropertyAccess) {
				l.cache();
			};// correct now, to a certain degree
			if(l instanceof IndexAccess) {
				l.right().cache();
			};
			
			// we should only cache the value itself if it is dynamic?
			// l.cache # cache the value as well -- we cannot use this in assigns them
		};
		
		// some ops are less messy
		// need op to support consume then?
		var expr = this.right().isExpressable();
		var ast = null;
		// here we should use ast = if ...
		if(expr && this.op() == '||=') {
			ast = OP('||',l,OP('=',ls,this.right()));
		} else if(expr && this.op() == '&&=') {
			ast = OP('&&',l,OP('=',ls,this.right()));
		} else {
			ast = IF(this.condition(),OP('=',ls,this.right()),l);
		};
		if(ast.isExpressable()) {
			ast.toExpression();
		};// hmm
		return ast;
	};
	
	
	ConditionalAssign.prototype.c = function (){
		return this.normalize().c();
	};
	
	ConditionalAssign.prototype.condition = function (){
		return (this.op() == '?=') ? (
			OP('==',this.left(),NULL)
		) : ((this.op() == '||=') ? (
			OP('!',this.left())
		) : ((this.op() == '&&=') ? (
			this.left()
		) : ((this.op() == '!?=') ? (
			OP('!=',this.left(),NULL)
		) : (
			this.left()
		))));
	};
	
	ConditionalAssign.prototype.js = function (){
		var ast = IF(this.condition(),OP('=',this.left(),this.right()),this.left());
		if(ast.isExpressable()) {
			ast.toExpression();
		};
		return ast.c();
	};
	
	
	/* @class CompoundAssign */
	function CompoundAssign(){ Assign.apply(this,arguments) };
	
	subclass$(CompoundAssign,Assign);
	exports.CompoundAssign = CompoundAssign; // export class 
	CompoundAssign.prototype.consume = function (node){
		if(this.isExpressable()) {
			return CompoundAssign.__super__.consume.apply(this,arguments);
		};
		
		var ast = this.normalize();
		if(!(ast == this)) {
			return ast.consume(node);
		};
		
		ast = this.right().consume(this);
		return ast.consume(node);
	};
	
	CompoundAssign.prototype.normalize = function (){
		var ln = this.left().node();
		// we dont need to change this at all
		if(!((ln instanceof PropertyAccess))) {
			return this;
		};
		
		if(ln instanceof Access) {
			if(ln.left()) {
				ln.left().cache();
			};
		};
		// TODO FIXME we want to cache the context of the assignment
		// p "normalize compound assign {left}"
		var ast = OP('=',this.left(),OP(this.op()[0],this.left(),this.right()));
		if(ast.isExpressable()) {
			ast.toExpression();
		};
		
		return ast;
	};
	
	CompoundAssign.prototype.c = function (){
		var ast = this.normalize();
		if(ast == this) {
			return CompoundAssign.__super__.c.apply(this,arguments);
		};
		
		// otherwise it is important that we actually replace this node in the outer block
		// whenever we normalize and override c it is important that we can pass on caching
		// etc -- otherwise there WILL be issues.
		var up = STACK.current();
		if(up instanceof Block) {
			up.replace(this,ast);
		};
		return ast.c();
	};
	
	
	
	/* @class AsyncAssign */
	function AsyncAssign(){ Assign.apply(this,arguments) };
	
	subclass$(AsyncAssign,Assign);
	exports.AsyncAssign = AsyncAssign; // export class 
	
	
	
	/* @class TupleAssign */
	function TupleAssign(a,b,c){
		this._op = a;
		this._left = b;
		this._right = c;
		this._temporary = [];
	};
	
	subclass$(TupleAssign,Assign);
	exports.TupleAssign = TupleAssign; // export class 
	
	TupleAssign.prototype.__op = {};
	TupleAssign.prototype.op = function(v){ return this._op; }
	TupleAssign.prototype.setOp = function(v){ this._op = v; return this; };
	
	TupleAssign.prototype.__left = {};
	TupleAssign.prototype.left = function(v){ return this._left; }
	TupleAssign.prototype.setLeft = function(v){ this._left = v; return this; };
	
	TupleAssign.prototype.__right = {};
	TupleAssign.prototype.right = function(v){ return this._right; }
	TupleAssign.prototype.setRight = function(v){ this._right = v; return this; };
	
	TupleAssign.prototype.__type = {};
	TupleAssign.prototype.type = function(v){ return this._type; }
	TupleAssign.prototype.setType = function(v){ this._type = v; return this; };
	
	
	
	TupleAssign.prototype.isExpressable = function (){
		return this.right().isExpressable();
	};
	
	TupleAssign.prototype.addExpression = function (expr){
		var v_;
		if(this.right() instanceof Tuple) {
			this.right().push(expr);
		} else {
			(this.setRight(v_=new Tuple([this.right(),expr])),v_);
		};
		
		return this;
	};
	
	TupleAssign.prototype.visit = function (){
		var v_;
		if(this.left().first().node() instanceof VarReference) {
			(this.setType(v_='var'),v_);
			// NOTE can improve.. should rather make the whole left be a VarBlock or TupleVarBlock
			// p "type is var -- skip the rest"
		};
		
		this.right().traverse();
		this.left().traverse();
		return this;
	};
	
	TupleAssign.prototype.js = function (){
		var self=this;
		if(!(self.right().isExpressable())) {
			return self.right().consume(self).c();
		};
		
		//  a,b,c = arguments 
		
		// - direct. no matter if lvalues are variables or not. Make fake arguments up to the same count as tuple
		
		//  a,*b,b = arguments 
		
		// Need to convert arguments to an array. IF arguments is not referenced anywhere else in scope, 
		// we can do the assignment directly while rolling through arguments
		
		//  a,b = b,a 
		
		// ideally we only need to cache the first value (or n - 1), assign directly when possible.
		
		//  a,b,c = (method | expression) 
		
		// convert res into array, assign from array. Can cache the variable when assigning first value
		
		// First we need to find out whether we are required to store the result in an array before assigning
		// If this needs to be an expression (returns?, we need to fall back to the CS-wa)
		
		var ast = new Block();
		var lft = self.left();
		var rgt = self.right();
		var typ = self.type();
		var via = null;
		
		var li = 0;
		var ri = lft.count();
		var llen = ri;
		
		
		
		// if we have a splat on the left it is much more likely that we need to store right
		// in a temporary array, but if the right side has a known length, it should still not be needed
		var lsplat = lft.filter(function (v){
			return v instanceof Splat;
		})[0];
		
		// if right is an array without any splats (or inner tuples?), normalize it to tuple
		if((rgt instanceof Arr) && !(rgt.splat())) {
			rgt = new Tuple(rgt.nodes());
		};
		var rlen = (rgt instanceof Tuple) ? (rgt.count()) : (null);
		
		// if any values are statements we need to handle this before continuing
		
		//  a,b,c = 10,20,ary 
		
		// ideally we only need to cache the first value (or n - 1), assign directly when possible.
		// only if the variables are not predefined or predeclared can be we certain that we can do it without caching
		// if rlen && typ == 'var' && !lsplat
		// 	# this can be dangerous in edgecases that are very hard to detect
		// 	# if it becomes an issue, fall back to simpler versions
		// 	# does not even matter if there is a splat?
		
		// special case for arguments(!)
		if(!lsplat && rgt == ARGUMENTS) {
			var pars = self.scope__().params();
			// p "special case with arguments {pars}"
			// forcing the arguments to be named
			// p "got here??? {pars}"
			lft.map(function (l,i){
				return ast.push(OP('=',l.node(),pars.at(i,true).visit().variable()));
			});// s.params.at(value - 1,yes)
		} else if(rlen) {
			var pre = [];
			var rest = [];
			
			var pairs = lft.map(function (l,i){
				var v = null;
				// determine if this needs to be precached?
				// if l isa VarReference
				// 	# this is the first time the variable is referenced
				// 	# should also count even if it is predeclared at the top
				// 	if l.refnr == 0
				
				if(l == lsplat) {
					v = [];
					var to = (rlen - (ri - i));
					// p "assing splat at index {i} to slice {li} - {to}".cyan
					while(li <= to){
						v.push(rgt.index(li++));
					};
					v = new Arr(v);
					// ast.push OP('=',l.node,Arr.new(v))
				} else {
					v = rgt.index(li++);
				};
				return [l.node(),v];
				
				// if l isa VarReference && l.refnr 
			});
			var clean = true;
			
			pairs.map(function (v,i){
				var l = v[0];
				var r = v[1];
				
				if(clean) {
					if((l instanceof VarReference) && l.refnr() == 0) {
						clean = true;
					} else {
						clean = false;
						// p "now cache"
						pairs.slice(i).map(function (part){
							return (part[1].hasSideEffects()) && (
								self._temporary.push(part[1]),// need a generalized way to do this type of thing
								ast.push(part[1].cache({force: true,type: 'swap',declared: typ == 'var'}))
							);
						});
						// p "from {i} - cache all remaining with side-effects"
					};
				};
				
				// if the previous value in ast is a reference to our value - the caching was not needed
				return (ast.last() == r) ? (
					r.decache(),
					// p "was cached - not needed"
					ast.replace(r,OP('=',l,r))
				) : (
					ast.push(OP('=',l,r))
				);
			});
			
			// WARN FIXME Is there not an issue with VarBlock vs not here?
		} else {
			var top = new VarBlock();
			var iter = self.util().iterable(rgt,true);
			// could set the vars inside -- most likely
			ast.push(top);
			top.push(iter);
			
			if(lsplat) {
				var len = self.util().len(iter,true);
				var idx = self.util().counter(0,true);
				// cache the length of the array
				top.push(len);// preassign the length
				// cache counter to loop through
				top.push(idx);
			};
			
			// only if the block is variable based, no?
			// ast.push(blk = VarBlock.new)
			// blk = nil
			
			var blktype = (typ == 'var') ? (VarBlock) : (Block);
			var blk = new blktype();
			// blk = top if typ == 'var'
			ast.push(blk);
			
			// if the lvals are not variables - we need to preassign
			// can also use slice here for simplicity, but try with while now			
			lft.map(function (l,i){
				var lvar, rem, arr, test, set;
				return (l == lsplat) ? (
					lvar = l.node(),
					rem = llen - i - 1,// remaining after splat
					
					(typ != 'var') ? (
						arr = self.util().array(OP('-',len,num__(i + rem)),true),
						top.push(arr),
						lvar = arr.cachevar()
					) : (
						(!blk) && (ast.push(blk = new blktype())),
						arr = self.util().array(OP('-',len,num__(i + rem))),
						blk.push(OP('=',lvar,arr))
					),
					
					// if !lvar:variable || !lvar.variable # lvar = 
					// 	top.push()
					// p "has variable - no need to create a temp"
					// blk.push(OP('=',lvar,Arr.new([]))) # dont precalculate size now
					// max = to = (rlen - (llen - i))
					
					
					test = (rem) ? (OP('-',len,rem)) : (len),
					
					set = OP('=',OP('.',lvar,OP('-',idx,num__(i))),
					OP('.',iter,OP('++',idx))),
					
					ast.push(WHILE(OP('<',idx,test),set)),
					
					(typ != 'var') ? (
						ast.push(blk = new Block()),
						blk.push(OP('=',l.node(),lvar))
					) : (
						blk = null
					)
					
					// not if splat was last?
					// ast.push(blk = VarBlock.new)
				) : ((lsplat) ? (
					(!blk) && (ast.push(blk = new blktype())),
					// we could cache the raw code of this node for better performance
					blk.push(OP('=',l,OP('.',iter,OP('++',idx))))
				) : (
					(!blk) && (ast.push(blk = new blktype())),
					blk.push(OP('=',l,OP('.',iter,num__(i))))
				));
			});
		};
		
		
		if(ast.isExpressable()) {
			var out = ast.c({expression: true});
			if(typ) {
				out = ("" + typ + " " + out);
			};
			return out;
		} else {
			return ast.c();
		};
	};
	
	
	
	// IDENTIFIERS
	
	// really need to clean this up
	/* @class Identifier */
	function Identifier(){ ValueNode.apply(this,arguments) };
	
	subclass$(Identifier,ValueNode);
	exports.Identifier = Identifier; // export class 
	
	Identifier.prototype.__safechain = {};
	Identifier.prototype.safechain = function(v){ return this._safechain; }
	Identifier.prototype.setSafechain = function(v){ this._safechain = v; return this; };
	
	Identifier.prototype.load = function (v){
		var val = ((v instanceof Identifier) ? (v.value()) : (v));
		var len = val.length;
		// experimental way to include reserved-info
		// if v.match()
		
		// no?
		if(val[len - 1] == '?') {
			throw "Identifier#load";
			// console.log "nonono --"
			// p "safechain identifier?!"
			this.setSafechain(true);
			val = val.substr(0,len - 1);
		};
		
		return val;
	};
	
	Identifier.prototype.isValidIdentifier = function (){
		return true;
	};
	
	Identifier.prototype.isReserved = function (){
		return this._value.reserved;
	};
	
	Identifier.prototype.symbol = function (){
		return this._symbol || (this._symbol = sym__(this.value()));
	};
	
	Identifier.prototype.setter = function (){
		return this._setter || (this._setter = new Identifier(("set-" + (this.value().c()))));
	};
	
	Identifier.prototype.toString = function (){
		return String(this._value);
	};
	
	Identifier.prototype.js = function (){
		return sym__(this._value);
	};
	
	Identifier.prototype.c = function (){
		return sym__(this._value);
	};
	
	Identifier.prototype.dump = function (){
		return {loc: this.region(),value: this.value()};
	};
	
	
	
	/* @class TagId */
	function TagId(){ Identifier.apply(this,arguments) };
	
	subclass$(TagId,Identifier);
	exports.TagId = TagId; // export class 
	TagId.prototype.c = function (){
		return "id$('" + (this.value().c()) + "')";
	};
	
	
	// This is not an identifier - it is really a string
	// Is this not a literal?
	
	// FIXME Rename to IvarLiteral? or simply Literal with type Ivar
	/* @class Ivar */
	function Ivar(){ Identifier.apply(this,arguments) };
	
	subclass$(Ivar,Identifier);
	exports.Ivar = Ivar; // export class 
	Ivar.prototype.name = function (){
		return helpers.camelCase(this._value).replace(/^@/,'');
		// value.c.camelCase.replace(/^@/,'')
	};
	
	// the @ should possibly be gone from the start?
	Ivar.prototype.js = function (){
		return '_' + this.name();
	};
	
	Ivar.prototype.c = function (){
		return '_' + helpers.camelCase(this._value).replace(/^@/,'');
	};
	
	
	// Ambiguous - We need to be consistent about Const vs ConstAccess
	// Becomes more important when we implement typeinference and code-analysis
	/* @class Const */
	function Const(){ Identifier.apply(this,arguments) };
	
	subclass$(Const,Identifier);
	exports.Const = Const; // export class 
	
	
	
	/* @class TagTypeIdentifier */
	function TagTypeIdentifier(){ Identifier.apply(this,arguments) };
	
	subclass$(TagTypeIdentifier,Identifier);
	exports.TagTypeIdentifier = TagTypeIdentifier; // export class 
	
	TagTypeIdentifier.prototype.__name = {};
	TagTypeIdentifier.prototype.name = function(v){ return this._name; }
	TagTypeIdentifier.prototype.setName = function(v){ this._name = v; return this; };
	
	TagTypeIdentifier.prototype.__ns = {};
	TagTypeIdentifier.prototype.ns = function(v){ return this._ns; }
	TagTypeIdentifier.prototype.setNs = function(v){ this._ns = v; return this; };
	
	TagTypeIdentifier.prototype.load = function (val){
		this._str = ("" + val);
		var parts = this._str.split(":");
		this._raw = val;
		this._name = parts.pop();
		this._ns = parts.shift();// if any?
		return this._str;
	};
	
	TagTypeIdentifier.prototype.js = function (){
		return ("IMBA_TAGS." + (this._str.replace(":","$")));
	};
	
	TagTypeIdentifier.prototype.c = function (){
		return this.js();
	};
	
	TagTypeIdentifier.prototype.func = function (){
		var name = this._name.replace(/-/g,'_').replace(/\#/,'');// hmm
		if(this._ns) {
			name += ("$" + (this._ns.toLowerCase()));
		};
		return name;
	};
	
	TagTypeIdentifier.prototype.id = function (){
		var m = this._str.match(/\#([\w\-\d\_]+)\b/);
		return (m) ? (m[1]) : (null);
	};
	
	
	TagTypeIdentifier.prototype.flag = function (){
		return "_" + this.name().replace(/--/g,'_').toLowerCase();
	};
	
	TagTypeIdentifier.prototype.sel = function (){
		return "." + this.flag();// + name.replace(/-/g,'_').toLowerCase
	};
	
	TagTypeIdentifier.prototype.string = function (){
		return this.value();
	};
	
	
	
	/* @class Argvar */
	function Argvar(){ ValueNode.apply(this,arguments) };
	
	subclass$(Argvar,ValueNode);
	exports.Argvar = Argvar; // export class 
	Argvar.prototype.c = function (){
		var v = parseInt(String(this.value()));
		// FIXME Not needed anymore? I think the lexer handles this
		if(v == 0) {
			return "arguments";
		};
		
		var s = this.scope__();
		// params need to go up to the closeste method-scope
		var par = s.params().at(v - 1,true);
		return "" + (c__(par.name()));// c
	};
	
	
	
	// CALL
	
	/* @class Call */
	function Call(callee,args,opexists){
		if(callee instanceof VarOrAccess) {
			var str = callee.value().symbol();
			// p "Call callee {callee} - {str}"
			if(str == 'extern') {
				return new ExternDeclaration(args);
			};
			if(str == 'tag') {
				return new TagWrapper((args && args.index) ? (args.index(0)) : (args[0]));// hmmm
			};
			if(str == 'export') {
				return new ExportStatement(args);// hmmm
			};
		};
		
		this._callee = callee;
		this._args = args || new ArgList([]);// hmmm
		
		if(args instanceof Array) {
			this._args = new ArgList(args);
			// console.log "ARGUMENTS IS ARRAY - error {args}"
		};
		// p "call opexists {opexists}"
		this;
	};
	
	subclass$(Call,Expression);
	exports.Call = Call; // export class 
	
	Call.prototype.__callee = {};
	Call.prototype.callee = function(v){ return this._callee; }
	Call.prototype.setCallee = function(v){ this._callee = v; return this; };
	
	Call.prototype.__receiver = {};
	Call.prototype.receiver = function(v){ return this._receiver; }
	Call.prototype.setReceiver = function(v){ this._receiver = v; return this; };
	
	Call.prototype.__args = {};
	Call.prototype.args = function(v){ return this._args; }
	Call.prototype.setArgs = function(v){ this._args = v; return this; };
	
	Call.prototype.__block = {};
	Call.prototype.block = function(v){ return this._block; }
	Call.prototype.setBlock = function(v){ this._block = v; return this; };
	
	
	
	Call.prototype.visit = function (){
		this.args().traverse();
		this.callee().traverse();
		
		return this._block && this._block.traverse();
	};
	
	Call.prototype.addBlock = function (block){
		var pos = this._args.filter(function (n,i){
			return n == '&';
		})[0];
		// idx = i if n == '&'
		// p "FOUND LOGIC"
		// p "node in args {i} {n}"
		if(pos) {
			this.args().replace(pos,block);
		} else {
			this.args().push(block);
		};
		// args.push(block)
		return this;
	};
	
	Call.prototype.receiver = function (){
		return this._receiver || (this._receiver = ((this.callee() instanceof Access) && this.callee().left() || NULL));
	};
	
	// check if all arguments are expressions - otherwise we have an issue
	
	Call.prototype.safechain = function (){
		return this.callee().safechain();// really?
	};
	
	Call.prototype.c = function (){
		return Call.__super__.c.apply(this,arguments);
	};
	
	Call.prototype.js = function (){
		var opt = {expression: true};
		var rec = null;
		var args = compact__(this.args());
		var splat = args.some(function (v){
			return v instanceof Splat;
		});
		var out = null;
		var lft = null;
		var rgt = null;
		var wrap = null;
		
		var callee = this._callee = this._callee.node();// drop the var or access?
		
		// p "{self} - {@callee}"
		
		if((callee instanceof Call) && callee.safechain()) {
			true;
			// we need to specify that the _result_ of
		};
		
		if(callee instanceof Access) {
			lft = callee.left();
			rgt = callee.right();
		};
		
		if((callee instanceof Super) || (callee instanceof SuperAccess)) {
			this._receiver = this.scope__().context();
			// return "supercall"
		};
		
		// never call the property-access directly?
		if(callee instanceof PropertyAccess) {
			this._receiver = callee.receiver();
			callee = this._callee = OP('.',callee.left(),callee.right());
			// console.log "unwrapping the propertyAccess"
		};
		
		
		if(lft && lft.safechain()) {
			lft.cache();
			// we want to 
			// wrap = ["{}"]
			// p "Call should not cache whole result - only the result of the call".red
		};
		
		
		if(callee.safechain()) {
			if(lft) {
				lft.cache();
			};
			// the outer safechain should not cache the whole call - only ask to cache
			// the result? -- chain onto
			// p "Call safechain {callee} {lft}.{rgt}"
			var isfn = new Util.IsFunction([callee]);
			wrap = [("" + (isfn.c()) + " && "),""];
		};
		
		// if callee.right
		// if calle is PropertyAccess we should convert it first
		// to keep the logic in call? 
		// 
		
		// if 
		
		// should just force expression from the start, no?
		if(splat) {
			var ary = ((args.count() == 1) ? (new ValueNode(args.first().value())) : (new Arr(args.list())));
			this.receiver().cache();// need to cache the target
			out = ("" + (callee.c({expression: true})) + ".apply(" + (this.receiver().c()) + "," + (ary.c({expression: true})) + ")");
		} else if(this._receiver) {
			this._receiver.cache();
			args.unshift(this.receiver());
			// should rather rewrite to a new call?
			out = ("" + (callee.c({expression: true})) + ".call(" + (args.c({expression: true})) + ")");
		} else {
			out = ("" + (callee.c({expression: true})) + "(" + (args.c({expression: true})) + ")");
		};
		
		if(wrap) {
			if(this._cache) {
				this._cache.manual = true;
				out = ("(" + (this.cachevar().c()) + "=" + out + ")");
			};
			
			out = [wrap[0],out,wrap[1]].join("");
		};
		
		return out;
	};
	
	
	
	
	
	/* @class ImplicitCall */
	function ImplicitCall(){ Call.apply(this,arguments) };
	
	subclass$(ImplicitCall,Call);
	exports.ImplicitCall = ImplicitCall; // export class 
	ImplicitCall.prototype.js = function (){
		return "" + (this.callee().c()) + "()";
	};
	
	
	
	
	/* @class New */
	function New(){ Call.apply(this,arguments) };
	
	subclass$(New,Call);
	exports.New = New; // export class 
	New.prototype.js = function (o){
		var out = ("new " + (this.callee().c()));
		if(!((o.parent() instanceof Call))) {
			out += '()';
		};
		return out;
		// "{callee.c}()"
	};
	
	
	
	
	/* @class SuperCall */
	function SuperCall(){ Call.apply(this,arguments) };
	
	subclass$(SuperCall,Call);
	exports.SuperCall = SuperCall; // export class 
	SuperCall.prototype.js = function (o){
		var m = o.method();
		this.setReceiver(SELF);
		this.setCallee(("" + (m.target().c()) + ".super$.prototype." + (m.name().c())));
		return SuperCall.__super__.js.apply(this,arguments);
	};
	
	
	
	
	/* @class ExternDeclaration */
	function ExternDeclaration(){ ListNode.apply(this,arguments) };
	
	subclass$(ExternDeclaration,ListNode);
	exports.ExternDeclaration = ExternDeclaration; // export class 
	ExternDeclaration.prototype.visit = function (){
		this.setNodes(this.map(function (item){
			return item.node();
		}));// drop var or access really
		// only in global scope?
		var root = this.scope__();
		this.nodes().map(function (item){
			var variable = root.register(item.symbol(),item,{type: 'global'});// hmmmm
			return variable.addReference(item);
		});
		return this;
	};
	
	ExternDeclaration.prototype.c = function (){
		return "// externs";
		// register :global, self, type: 'global'
	};
	
	
	
	
	// FLOW
	
	/* @class ControlFlow */
	function ControlFlow(){ Node.apply(this,arguments) };
	
	subclass$(ControlFlow,Node);
	exports.ControlFlow = ControlFlow; // export class 
	
	
	
	
	/* @class ControlFlowStatement */
	function ControlFlowStatement(){ ControlFlow.apply(this,arguments) };
	
	subclass$(ControlFlowStatement,ControlFlow);
	exports.ControlFlowStatement = ControlFlowStatement; // export class 
	ControlFlowStatement.prototype.isExpressable = function (){
		return false;
	};
	
	
	
	
	/* @class If */
	function If(cond,body,o){
		if(o === undefined) o = {};
		this._test = ((o.type == 'unless') ? (OP('!',cond)) : (cond));
		this._body = body;
	};
	
	subclass$(If,ControlFlow);
	exports.If = If; // export class 
	
	If.prototype.__test = {};
	If.prototype.test = function(v){ return this._test; }
	If.prototype.setTest = function(v){ this._test = v; return this; };
	
	If.prototype.__body = {};
	If.prototype.body = function(v){ return this._body; }
	If.prototype.setBody = function(v){ this._body = v; return this; };
	
	If.prototype.__alt = {};
	If.prototype.alt = function(v){ return this._alt; }
	If.prototype.setAlt = function(v){ this._alt = v; return this; };
	
	
	If.prototype.addElse = function (add){
		if(this.alt() && (this.alt() instanceof If)) {
			this.alt().addElse(add);
		} else {
			(this.setAlt(add),add);
		};
		return this;
	};
	
	
	
	
	
	If.prototype.visit = function (){
		if(this.test()) {
			this.test().traverse();
		};
		if(this.body()) {
			this.body().traverse();
		};
		return (this.alt()) && (this.alt().traverse());
	};
	
	
	If.prototype.js = function (o){
		var brace = {braces: true,indent: true};
		
		var cond = this.test().c({expression: true});// the condition is always an expression
		
		
		if(o.isExpression()) {
			var code = this.body().c();// (braces: yes)
			// is expression!
			if(this.alt()) {
				return ("(" + cond + ") ? (" + code + ") : (" + (this.alt().c()) + ")");
			} else {
				return ("(" + cond + ") && (" + code + ")");
			};
		} else {
			code = this.body().c(brace);// (braces: yes)
			// don't wrap if it is only a single expression?
			var out = ("if(" + cond + ") ") + code;// ' {' + code + '}' # '{' + code + '}'
			if(this.alt()) {
				out += (" else " + (this.alt().c((this.alt() instanceof If) ? ({}) : (brace))));
			};
			return out;
		};
	};
	
	
	If.prototype.consume = function (node){
		if(node instanceof TagTree) {
			this._body = this.body().consume(node);
			if(this.alt()) {
				this._alt = this.alt().consume(node);
			};
			return this;
		};
		
		if(this.isExpressable()) {
			this.toExpression();// mark as expression(!)
			return If.__super__.consume.apply(this,arguments);
		} else {
			this._body = this.body().consume(node);
			if(this.alt()) {
				this._alt = this.alt().consume(node);
			};
		};
		return this;
	};
	
	
	If.prototype.isExpressable = function (){
		var exp = this.body().isExpressable() && (!this.alt() || this.alt().isExpressable());
		// if exp
		// 	p "if is expressable".green
		// else
		// 	p "if is not expressable".red
		return exp;
	};
	
	
	
	
	/* @class Loop */
	function Loop(options){
		if(options === undefined) options = {};
		this.setOptions(options);
		this;
	};
	
	subclass$(Loop,Statement);
	exports.Loop = Loop; // export class 
	
	Loop.prototype.__scope = {};
	Loop.prototype.scope = function(v){ return this._scope; }
	Loop.prototype.setScope = function(v){ this._scope = v; return this; };
	
	Loop.prototype.__options = {};
	Loop.prototype.options = function(v){ return this._options; }
	Loop.prototype.setOptions = function(v){ this._options = v; return this; };
	
	Loop.prototype.__body = {};
	Loop.prototype.body = function(v){ return this._body; }
	Loop.prototype.setBody = function(v){ this._body = v; return this; };
	
	Loop.prototype.__catcher = {};
	Loop.prototype.catcher = function(v){ return this._catcher; }
	Loop.prototype.setCatcher = function(v){ this._catcher = v; return this; };
	
	
	
	
	
	Loop.prototype.set = function (obj){
		this._options || (this._options = {});
		var keys = Object.keys(obj);
		for(var i=0, ary=iter$(keys), len=ary.length, k; i < len; i++) {
			k = ary[i];this._options[k] = obj[k];
		};
		return this;
	};
	
	
	Loop.prototype.addBody = function (body){
		this.setBody(blk__(body));
		return this;
	};
	
	
	Loop.prototype.c = function (o){
		if(this.stack().isExpression() || this.isExpression()) {
			var ast = CALL(FN([],[this]),[]);
			return ast.c(o);
		} else if(this.stack().current() instanceof Block) {
			return Loop.__super__.c.call(this,o);
		} else {
			ast = CALL(FN([],[this]),[]);
			return ast.c(o);
			// need to wrap in function
		};
	};
	
	
	
	
	/* @class While */
	function While(test,opts){
		this._test = test;
		this._scope = new WhileScope(this);
		if(opts) {
			this.set(opts);
		};
		// p "invert test for while? {@test}"
		if(this.option('invert')) {
			this._test = test.invert();
		};
		// invert the test
	};
	
	subclass$(While,Loop);
	exports.While = While; // export class 
	
	While.prototype.__test = {};
	While.prototype.test = function(v){ return this._test; }
	While.prototype.setTest = function(v){ this._test = v; return this; };
	
	
	
	
	
	While.prototype.visit = function (){
		this.scope().visit();
		if(this.test()) {
			this.test().traverse();
		};
		return (this.body()) && (this.body().traverse());
	};
	
	
	// TODO BUG -- when we declare a var like: while var y = ...
	// the variable will be declared in the WhileScope which never
	// force-declares the inner variables in the scope
	
	While.prototype.consume = function (node){
		if(this.isExpressable()) {
			return While.__super__.consume.apply(this,arguments);
		};
		
		if(node instanceof TagTree) {
			this.scope().context().reference();
			return CALL(FN([],[this]),[]);
		};
		
		var reuse = false;
		// WARN Optimization - might have untended side-effects
		// if we are assigning directly to a local variable, we simply
		// use said variable for the inner res
		// if reuse
		// 	resvar = scope.declare(node.left.node.variable,Arr.new([]),proxy: yes)
		// 	node = null
		// 	p "consume variable declarator!?".cyan
		// else
		// declare the variable we will use to soak up results
		// p "Creating value to store the result of loop".cyan
		// TODO Use a special vartype for this?
		var resvar = this.scope().declare('res',new Arr([]),{system: true});
		// WHAT -- fix this --
		this._catcher = new PushAssign("push",resvar,null);// the value is not preset # what
		this.body().consume(this._catcher);// should still return the same body
		
		// scope vars must not be compiled before this -- this is important
		var ast = BLOCK(this,resvar.accessor());// should be varaccess instead? # hmmm?
		return ast.consume(node);
		// NOTE Here we can find a way to know wheter or not we even need to 
		// return the resvar. Often it will not be needed
		// FIXME what happens if there is no node?!?
	};
	
	
	While.prototype.js = function (){
		var out = ("while(" + (this.test().c({expression: true})) + ")") + this.body().c({braces: true,indent: true});// .wrap
		
		if(this.scope().vars().count() > 0) {
			return [this.scope().vars().c(),out];
		};
		return out;
	};
	
	
	
	
	// This should define an open scope
	// should rather 
	/* @class For */
	function For(o){
		if(o === undefined) o = {};
		this._options = o;
		this._scope = new ForScope(this);
	};
	
	subclass$(For,Loop);
	exports.For = For; // export class 
	
	
	
	For.prototype.visit = function (){
		this.scope().visit();
		this.declare();
		// should be able to toggle whether to keep the results here already(!)
		this.body().traverse();
		return this.options().source.traverse();// what about awakening the vars here?
	};
	
	
	For.prototype.declare = function (){
		var scope = this.scope();
		var src = this.options().source;
		var vars = this.options().vars = {};
		var oi = this.options().index;
		
		
		// var i = vars:index = oi ? scope.declare(oi,0) : util.counter(0,yes).predeclare
		
		if(src instanceof Range) {
			vars.len = scope.declare('len',src.right());// util.len(o,yes).predeclare
			vars.index = scope.declare(this.options().name,src.left());
			vars.value = vars.index;
		} else {
			var i = vars.index = (oi) ? (scope.declare(oi,0,{let: true})) : (this.util().counter(0,true,scope).predeclare());
			vars.source = this.util().iterable(src,true).predeclare();// hmm
			vars.len = this.util().len(vars.source,true).predeclare();// hmm
			vars.value = scope.declare(this.options().name,null,{let: true});
			vars.value.addReference(this.options().name);// adding reference!
			if(oi) {
				i.addReference(oi);
			};
		};
		
		return this;
	};
	
	
	For.prototype.consume = function (node){
		if(this.isExpressable()) {
			return For.__super__.consume.apply(this,arguments);
		};
		
		// other cases as well, no?
		if(node instanceof TagTree) {
			this.scope().context().reference();
			return CALL(new Lambda([],[this]),[]);
		};
		
		
		var resvar = null;
		var reuseable = (node instanceof Assign) && (node.left().node() instanceof LocalVarAccess);
		
		// WARN Optimization - might have untended side-effects
		// if we are assigning directly to a local variable, we simply
		// use said variable for the inner res
		if(reuseable) {
			resvar = this.scope().declare(node.left().node().variable(),new Arr([]),{proxy: true});
			node = null;
			// p "consume variable declarator!?".cyan
		} else {
			resvar = this.scope().declare('res',new Arr([]),{system: true});
		};
		
		// p "GOT HERE TO PUSH ASSIGN",PushAssign
		this._catcher = new PushAssign("push",resvar,null);// the value is not preset
		this.body().consume(this._catcher);// should still return the same body
		
		var ast = BLOCK(this,resvar.accessor());// should be varaccess instead?
		if(node) {
			ast.consume(node);
		};
		// this is never an expression (for now -- but still)
		return ast;
	};
	
	
	For.prototype.js = function (){
		var v_;
		var vars = this.options().vars;
		var i = vars.index;
		var val = vars.value;
		var cond = OP('<',i,vars.len);
		var src = this.options().source;
		
		// p "references for value",val.references:length
		
		var final = (this.options().step) ? (
			OP('=',i,OP('+',i,this.options().step))
		) : (
			OP('++',i)
		);
		
		// if there are few references to the value - we can drop
		// the actual variable and instead make it proxy through the index
		if(src instanceof Range) {
			if(src.inclusive()) {
				(cond.setOp(v_='<='),v_);
			};
		} else if(val.refcount() < 3) {
			val.proxy(vars.source,i);
		} else {
			this.body().unshift(OP('=',val,OP('.',vars.source,i)));
			// body.unshift(head)
			// TODO check lengths - intelligently decide whether to brace and indent
		};
		var head = ("for(" + (this.scope().vars().c()) + "; " + (cond.c()) + "; " + (final.c()) + ") ");
		return head + this.body().c({braces: true,indent: true});// .wrap
	};
	
	
	For.prototype.head = function (){
		var vars = this.options().vars;
		return OP('=',vars.value,OP('.',vars.source,vars.index));
	};
	
	
	
	
	/* @class ForIn */
	function ForIn(){ For.apply(this,arguments) };
	
	subclass$(ForIn,For);
	exports.ForIn = ForIn; // export class 
	
	
	
	
	/* @class ForOf */
	function ForOf(){ For.apply(this,arguments) };
	
	subclass$(ForOf,For);
	exports.ForOf = ForOf; // export class 
	ForOf.prototype.declare = function (){
		var vars = this.options().vars = {};
		
		var o = vars.source = this.scope().declare('o',this.options().source,{system: true});
		if(this.options().index) {
			var v = vars.value = this.scope().declare(this.options().index,null,{let: true});
		};
		
		if(this.options().own) {
			var i = vars.index = this.scope().declare('i',0,{system: true});
			var keys = vars.keys = this.scope().declare('keys',Util.keys(o.accessor()),{system: true});
			var l = vars.len = this.scope().declare('l',Util.len(keys.accessor()),{system: true});
			var k = vars.key = this.scope().declare(this.options().name,null,{system: true});
		} else {
			k = vars.key = this.scope().declare(this.options().name,null,{system: true});
		};
		
		// TODO use util - why add references already? Ah -- this is for the highlighting
		if(v && this.options().index) {
			v.addReference(this.options().index);
		};
		if(k && this.options().name) {
			k.addReference(this.options().name);
		};
		
		return this;
	};
	
	ForOf.prototype.js = function (){
		var vars = this.options().vars;
		
		var o = vars.source;
		var k = vars.key;
		var v = vars.value;
		var i = vars.index;
		
		
		if(v) {
			if(v.refcount() < 3) {
				v.proxy(o,k);
			} else {
				this.body().unshift(OP('=',v,OP('.',o,k)));
			};
		};
		
		if(this.options().own) {
			if(k.refcount() < 3) {
				k.proxy(vars.keys,i);
			} else {
				this.body().unshift(OP('=',k,OP('.',vars.keys,i)));
			};
			
			var head = ("for(" + (this.scope().vars().c()) + "; " + (OP('<',i,vars.len).c()) + "; " + (OP('++',i).c()) + ")");
			return head + this.body().c({indent: true,braces: true});// .wrap
		};
		
		var code = this.body().c({braces: true,indent: true});
		// it is really important that this is a treated as a statement
		return [this.scope().vars().c(),("for(var " + (k.c()) + " in " + (o.c()) + ")") + code];
	};
	
	ForOf.prototype.head = function (){
		var v = this.options().vars;
		
		return [
			OP('=',v.key,OP('.',v.keys,v.index)),
			(v.value) && (OP('=',v.value,OP('.',v.source,v.key)))
		];
	};
	
	
	
	
	/* @class Begin */
	function Begin(body){
		this._nodes = blk__(body).nodes();
	};
	
	subclass$(Begin,Block);
	exports.Begin = Begin; // export class 
	
	
	
	Begin.prototype.shouldParenthesize = function (){
		return this.isExpression();// hmmm
	};
	
	
	
	
	/* @class Switch */
	function Switch(a,b,c){
		this._source = a;
		this._cases = b;
		this._fallback = c;
	};
	
	subclass$(Switch,ControlFlowStatement);
	exports.Switch = Switch; // export class 
	
	Switch.prototype.__source = {};
	Switch.prototype.source = function(v){ return this._source; }
	Switch.prototype.setSource = function(v){ this._source = v; return this; };
	
	Switch.prototype.__cases = {};
	Switch.prototype.cases = function(v){ return this._cases; }
	Switch.prototype.setCases = function(v){ this._cases = v; return this; };
	
	Switch.prototype.__fallback = {};
	Switch.prototype.fallback = function(v){ return this._fallback; }
	Switch.prototype.setFallback = function(v){ this._fallback = v; return this; };
	
	
	
	
	
	Switch.prototype.visit = function (){
		this.cases().map(function (item){
			return item.traverse();
		});
		if(this.fallback()) {
			this.fallback().visit();
		};
		return (this.source()) && (this.source().visit());
	};
	
	
	Switch.prototype.consume = function (node){
		this._cases = this._cases.map(function (item){
			return item.consume(node);
		});
		if(this._fallback) {
			this._fallback = this._fallback.consume(node);
		};
		return this;
	};
	
	
	Switch.prototype.js = function (){
		var body = [];
		
		for(var i=0, ary=iter$(this.cases()), len=ary.length, part; i < len; i++) {
			part = ary[i];part.autobreak();
			body.push(part);
		};
		
		if(this.fallback()) {
			body.push("default:\n" + this.fallback().c({indent: true}));
		};
		
		return ("switch(" + (this.source().c()) + ") ") + helpers.bracketize(cary__(body).join("\n"),true);
	};
	
	
	
	
	/* @class SwitchCase */
	function SwitchCase(test,body){
		this._test = test;
		this._body = blk__(body);
	};
	
	subclass$(SwitchCase,ControlFlowStatement);
	exports.SwitchCase = SwitchCase; // export class 
	
	SwitchCase.prototype.__test = {};
	SwitchCase.prototype.test = function(v){ return this._test; }
	SwitchCase.prototype.setTest = function(v){ this._test = v; return this; };
	
	SwitchCase.prototype.__body = {};
	SwitchCase.prototype.body = function(v){ return this._body; }
	SwitchCase.prototype.setBody = function(v){ this._body = v; return this; };
	
	
	
	
	SwitchCase.prototype.visit = function (){
		return this.body().traverse();
	};
	
	
	SwitchCase.prototype.consume = function (node){
		this.body().consume(node);
		return this;
	};
	
	
	SwitchCase.prototype.autobreak = function (){
		if(!((this.body().last() instanceof BreakStatement))) {
			this.body().push(new BreakStatement());
		};
		return this;
	};
	
	
	SwitchCase.prototype.js = function (){
		if(!((this._test instanceof Array))) {
			this._test = [this._test];
		};
		var cases = this._test.map(function (item){
			return "case " + (item.c()) + ":";
		});
		return cases.join("\n") + this.body().c({indent: true});// .indent
	};
	
	
	
	
	/* @class Try */
	function Try(body,c,f){
		this._body = blk__(body);
		this._catch = c;
		this._finally = f;
	};
	
	subclass$(Try,ControlFlowStatement);
	exports.Try = Try; // export class 
	
	Try.prototype.__body = {};
	Try.prototype.body = function(v){ return this._body; }
	Try.prototype.setBody = function(v){ this._body = v; return this; };
	// prop ncatch
	// prop nfinally
	
	
	
	
	Try.prototype.consume = function (node){
		this._body = this._body.consume(node);
		if(this._catch) {
			this._catch = this._catch.consume(node);
		};
		if(this._finally) {
			this._finally = this._finally.consume(node);
		};
		return this;
	};
	
	
	Try.prototype.visit = function (){
		this._body.traverse();
		if(this._catch) {
			this._catch.traverse();
		};
		return (this._finally) && (this._finally.traverse());
		// no blocks - add an empty catch
	};
	
	
	Try.prototype.js = function (){
		var out = "try " + this.body().c({braces: true,indent: true}) + "\n";
		if(this._catch) {
			out += this._catch.c();
		};
		if(this._finally) {
			out += this._finally.c();
		};
		
		if(!(this._catch || this._finally)) {
			out += "catch(e)\{\}";
		};
		return out;
	};
	
	
	
	
	/* @class Catch */
	function Catch(body,varname){
		this._body = blk__(body);
		this._scope = new CatchScope(this);
		this._varname = varname;
	};
	
	subclass$(Catch,ControlFlowStatement);
	exports.Catch = Catch; // export class 
	
	
	
	Catch.prototype.consume = function (node){
		this._body = this._body.consume(node);
		return this;
	};
	
	
	Catch.prototype.visit = function (){
		this._scope.visit();
		this._variable = this._scope.register(this._varname,this,{type: 'catchvar'});
		return this._body.traverse();
	};
	
	
	Catch.prototype.js = function (){
		return ("catch (" + (this._variable.c()) + ") ") + this._body.c({braces: true,indent: true}) + "\n";
	};
	
	
	
	// repeating myself.. don't deal with it until we move to compact tuple-args
	// for all astnodes
	
	
	/* @class Finally */
	function Finally(body){
		this._body = blk__(body);
	};
	
	subclass$(Finally,ControlFlowStatement);
	exports.Finally = Finally; // export class 
	
	
	
	Finally.prototype.visit = function (){
		return this._body.traverse();
	};
	
	
	Finally.prototype.consume = function (node){
		return this;
	};
	
	
	Finally.prototype.js = function (){
		return "finally " + this._body.c({braces: true,indent: true});
	};
	
	
	
	// RANGE
	
	/* @class Range */
	function Range(){ Op.apply(this,arguments) };
	
	subclass$(Range,Op);
	exports.Range = Range; // export class 
	Range.prototype.inclusive = function (){
		return this.op() == '..';
	};
	
	Range.prototype.c = function (){
		return "range";
	};
	
	
	
	/* @class Splat */
	function Splat(){ ValueNode.apply(this,arguments) };
	
	subclass$(Splat,ValueNode);
	exports.Splat = Splat; // export class 
	Splat.prototype.js = function (){
		var par = this.stack().parent();
		return (par instanceof Arr) ? (
			("[].slice.call(" + (this.value().c()) + ")")
		) : (
			"SPLAT"
		);
	};
	
	Splat.prototype.node = function (){
		return this.value();
	};
	
	
	
	
	
	
	// TAGS
	
	
	TAG_TYPES = {};
	TAG_ATTRS = {};
	
	
	TAG_TYPES.HTML = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");
	
	TAG_TYPES.SVG = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");
	
	TAG_ATTRS.HTML = "accept accessKey action allowFullScreen allowTransparency alt async autoComplete autoFocus autoPlay cellPadding cellSpacing charSet checked className cols colSpan content contentEditable contextMenu controls coords crossOrigin data dateTime defer dir disabled download draggable encType form formNoValidate frameBorder height hidden href hrefLang htmlFor httpEquiv icon id label lang list loop max maxLength mediaGroup method min multiple muted name noValidate pattern placeholder poster preload radioGroup readOnly rel required role rows rowSpan sandbox scope scrollLeft scrolling scrollTop seamless selected shape size span spellCheck src srcDoc srcSet start step style tabIndex target title type useMap value width wmode";
	
	TAG_ATTRS.SVG = "cx cy d dx dy fill fillOpacity fontFamily fontSize fx fy gradientTransform gradientUnits markerEnd markerMid markerStart offset opacity patternContentUnits patternUnits points preserveAspectRatio r rx ry spreadMethod stopColor stopOpacity stroke strokeDasharray strokeLinecap strokeOpacity strokeWidth textAnchor transform version viewBox x1 x2 x y1 y2 y";
	
	
	/* @class TagDesc */
	function TagDesc(){
		this.p('TagDesc!!!',arguments);
	};
	
	subclass$(TagDesc,Node);
	exports.TagDesc = TagDesc; // export class 
	
	
	TagDesc.prototype.classes = function (){
		this.p('TagDescClasses',arguments);
		return this;
	};
	
	
	/* @class Tag */
	function Tag(o){
		if(o === undefined) o = {};
		this._parts = [];
		o.classes || (o.classes = []);
		o.attributes || (o.attributes = []);
		o.classes || (o.classes = []);
		this._options = o;
	};
	
	subclass$(Tag,Expression);
	exports.Tag = Tag; // export class 
	
	Tag.prototype.__parts = {};
	Tag.prototype.parts = function(v){ return this._parts; }
	Tag.prototype.setParts = function(v){ this._parts = v; return this; };
	
	Tag.prototype.__object = {};
	Tag.prototype.object = function(v){ return this._object; }
	Tag.prototype.setObject = function(v){ this._object = v; return this; };
	
	Tag.prototype.__reactive = {};
	Tag.prototype.reactive = function(v){ return this._reactive; }
	Tag.prototype.setReactive = function(v){ this._reactive = v; return this; };
	
	Tag.prototype.__parent = {};
	Tag.prototype.parent = function(v){ return this._parent; }
	Tag.prototype.setParent = function(v){ this._parent = v; return this; };
	
	Tag.prototype.__tree = {};
	Tag.prototype.tree = function(v){ return this._tree; }
	Tag.prototype.setTree = function(v){ this._tree = v; return this; };
	
	
	
	Tag.prototype.set = function (obj){
		for(var o=obj, v, i=0, keys=Object.keys(o), l=keys.length, k; i < l; i++){
			k = keys[i];v = o[k];if(k == 'attributes') {
				for(var j=0, ary=iter$(v), len=ary.length; j < len; j++) {
					this.addAttribute(ary[j]);
				};
				continue;
			};
			
			this._options[k] = v;
		};
		return this;
	};
	
	Tag.prototype.addClass = function (node){
		if(!((node instanceof TagFlag))) {
			node = new TagFlag(node);
		};
		this._options.classes.push(node);
		this._parts.push(node);
		
		// p "add class!!!"
		return this;
	};
	
	Tag.prototype.addIndex = function (node){
		this._parts.push(node);
		// hmm
		this._object = node;
		// must be the first part?
		return this;
	};
	
	Tag.prototype.addSymbol = function (node){
		if(this._parts.length == 0) {
			this._parts.push(node);
			this._options.ns = node;
		};
		return this;
	};
	
	
	Tag.prototype.addAttribute = function (atr){
		this._parts.push(atr);// what?
		this._options.attributes.push(atr);
		return this;
	};
	
	Tag.prototype.type = function (){
		return this._options.type || 'div';
	};
	
	Tag.prototype.consume = function (node){
		if(node instanceof TagTree) {
			this.setReactive(node.reactive() || !(!this.option('ivar')));// hmm
			this.setParent(node.root());// hmm
			return this;
		} else {
			return Tag.__super__.consume.apply(this,arguments);
		};
	};
	
	Tag.prototype.visit = function (){
		var o = this._options;
		if(o.body) {
			o.body.map(function (v){
				return v.traverse();
			});
		};
		
		// id should also be a regular part
		// hmm?
		if(o.id) {
			o.id.traverse();
		};
		
		for(var i=0, ary=iter$(this._parts), len=ary.length; i < len; i++) {
			ary[i].traverse();
		};
		
		// for atr in @options:attributes
		// 	atr.traverse
		
		return this;
	};
	
	Tag.prototype.reference = function (){
		return this._reference || (this._reference = this.scope__().temporary(this,{type: 'tag'}).resolve());
	};
	
	// should this not happen in js?
	Tag.prototype.js = function (){
		var body;
		var o = this._options;
		var a = {};
		
		var setup = [];
		var calls = [];
		var statics = [];
		
		var scope = this.scope__();
		var commit = "end";
		
		var isSelf = (this.type() instanceof Self);
		
		for(var i=0, ary=iter$(o.attributes), len=ary.length, atr; i < len; i++) {
			atr = ary[i];a[atr.key()] = atr.value();// .populate(obj)
		};
		
		var quote = function (str){
			return helpers.singlequote(str);
		};
		
		var id = (o.id instanceof Node) ? (o.id.c()) : ((o.id && quote(o.id.c())));
		
		
		
		//  "scope is", !!scope
		// p "type is {type}"
		var out = (isSelf) ? (
			commit = "synced",
			// p "got here"
			// setting correct context directly
			this.setReactive(true),
			this._reference = scope.context(),
			// hmm, not sure about this
			scope.context().c()
		) : ((o.id) ? (
			("ti$('" + (this.type().func()) + "'," + id + ")")
		) : (
			("t$('" + (this.type().func()) + "')")
		));
		
		// this is reactive if it has an ivar
		if(o.ivar) {
			this.setReactive(true);
			statics.push((".setRef(" + (quote(o.ivar.name())) + "," + (scope.context().c()) + ")"));
		};
		
		// hmmm
		var tree = new TagTree(o.body,{root: this,reactive: this.reactive()}).resolve();
		this.setTree(tree);
		
		
		for(var i=0, ary=iter$(this._parts), len=ary.length, part; i < len; i++) {
			part = ary[i];if(part instanceof TagAttr) {
				var akey = String(part.key());
				
				// the attr should compile itself instead -- really
				
				if(akey[0] == '.') {
					calls.push((".flag(" + (quote(akey.substr(1))) + "," + (part.value().c()) + ")"));
				} else {
					calls.push(("." + (helpers.setterSym(akey)) + "(" + (part.value().c()) + ")"));
				};
			} else if(part instanceof TagFlag) {
				calls.push(part.c());
			};
		};
		
		if(this.object()) {
			calls.push((".setObject(" + (this.object().c()) + ")"));
		};
		
		// p "tagtree is static? {tree.static}"
		
		// we need to trigger our own reference before the body does
		if(this.reactive()) {
			this.reference();// hmm
		};
		
		if(body = tree.c({expression: true})) {
			calls.push(((isSelf) ? ((".setChildren([" + body + "])")) : ((".setContent([" + body + "])"))));
			// out += ".body({body})"
		};
		
		// if o:attributes:length # or -- always?
		// adds lots of extra calls - but okay for now
		calls.push(("." + commit + "()"));
		
		if(statics.length) {
			out = out + statics.join("");
		};
		
		// hmm - hack much
		if((o.ivar || this.reactive()) && !(this.type() instanceof Self)) {
			var par = this.parent();
			var ctx = !(o.ivar) && par && par.reference() || scope.context();
			var key = o.ivar || par && par.tree().indexOf(this);
			
			// need the context -- might be better to rewrite it for real?
			// parse the whole thing into calls etc
			var acc = OP('.',ctx,key).c();
			
			out = ("(" + (this.reference().c()) + " = " + acc + " || (" + acc + " = " + out + "))");
		};
		
		// should we not add references to the outer ones first?
		
		// now work on the refereces?
		
		// free variable
		if(this._reference instanceof Variable) {
			this._reference.free();
		};
		// if setup:length
		// out += ".setup({setup.join(",")})"
		
		return out + calls.join("");
	};
	
	
	// This is a helper-node
	/* @class TagTree */
	function TagTree(){ ListNode.apply(this,arguments) };
	
	subclass$(TagTree,ListNode);
	exports.TagTree = TagTree; // export class 
	TagTree.prototype.load = function (list){
		return (list instanceof ListNode) ? (
			this._indentation || (this._indentation = list._indentation),
			list.nodes()
		) : (
			compact__((list instanceof Array) ? (list) : ([list]))
		);
	};
	
	TagTree.prototype.root = function (){
		return this.option('root');
	};
	
	TagTree.prototype.reactive = function (){
		return this.option('reactive');
	};
	
	TagTree.prototype.resolve = function (){
		var self=this;
		this.remap(function (c){
			return c.consume(self);
		});
		return self;
	};
	
	TagTree.prototype.static = function (){
		return (this._static == null) ? (this._static = this.every(function (c){
			return c instanceof Tag;
		})) : (this._static);
	};
	
	TagTree.prototype.c = function (){
		return TagTree.__super__.c.apply(this,arguments);
		
		// p "TagTree.c {nodes}"	
		var l = this.nodes().length;
		return (l == 1) ? (
			this.map(function (v){
				return v.c({expression: true});
			})
			// nodes.c(expression: yes)
		) : ((l > 1) && (
			this.nodes().c({expression: true})
		));
	};
	
	
	
	/* @class TagWrapper */
	function TagWrapper(){ ValueNode.apply(this,arguments) };
	
	subclass$(TagWrapper,ValueNode);
	exports.TagWrapper = TagWrapper; // export class 
	TagWrapper.prototype.visit = function (){
		if(this.value() instanceof Array) {
			this.value().map(function (v){
				return v.traverse();
			});
		} else {
			this.value().traverse();
		};
		return this;
	};
	
	TagWrapper.prototype.c = function (){
		return "tag$wrap(" + (this.value().c({expression: true})) + ")";
	};
	
	
	
	/* @class TagAttributes */
	function TagAttributes(){ ListNode.apply(this,arguments) };
	
	subclass$(TagAttributes,ListNode);
	exports.TagAttributes = TagAttributes; // export class 
	TagAttributes.prototype.get = function (name){
		for(var i=0, ary=iter$(this.nodes()), len=ary.length, node, res=[]; i < len; i++) {
			node = ary[i];if(node.key() == name) {
				return node;
			};
		};return res;
	};
	
	
	
	/* @class TagAttr */
	function TagAttr(k,v){
		this._key = k;
		this._value = v;
	};
	
	subclass$(TagAttr,Node);
	exports.TagAttr = TagAttr; // export class 
	
	TagAttr.prototype.__key = {};
	TagAttr.prototype.key = function(v){ return this._key; }
	TagAttr.prototype.setKey = function(v){ this._key = v; return this; };
	
	TagAttr.prototype.__value = {};
	TagAttr.prototype.value = function(v){ return this._value; }
	TagAttr.prototype.setValue = function(v){ this._value = v; return this; };
	
	TagAttr.prototype.visit = function (){
		if(this.value()) {
			this.value().traverse();
		};
		return this;
	};
	
	
	
	TagAttr.prototype.populate = function (obj){
		obj.add(this.key(),this.value());
		return this;
	};
	
	TagAttr.prototype.c = function (){
		return "attribute";
	};
	
	
	
	/* @class TagFlag */
	function TagFlag(value){
		this._value = value;
		this;
	};
	
	subclass$(TagFlag,Node);
	exports.TagFlag = TagFlag; // export class 
	
	TagFlag.prototype.__value = {};
	TagFlag.prototype.value = function(v){ return this._value; }
	TagFlag.prototype.setValue = function(v){ this._value = v; return this; };
	
	TagFlag.prototype.__toggler = {};
	TagFlag.prototype.toggler = function(v){ return this._toggler; }
	TagFlag.prototype.setToggler = function(v){ this._toggler = v; return this; };
	
	
	
	TagFlag.prototype.visit = function (){
		if(!((typeof this._value=='string'||this._value instanceof String))) {
			this._value.traverse();
		};
		return this;
	};
	
	TagFlag.prototype.c = function (){
		return (this.value() instanceof Node) ? (
			(".flag(" + (this.value().c()) + ")")
		) : (
			(".flag(" + (helpers.singlequote(this.value())) + ")")
		);
	};
	
	
	
	
	
	
	
	// SELECTORS
	
	
	/* @class Selector */
	function Selector(){ ListNode.apply(this,arguments) };
	
	subclass$(Selector,ListNode);
	exports.Selector = Selector; // export class 
	Selector.prototype.add = function (part,typ){
		this.push(part);
		return this;
	};
	
	Selector.prototype.query = function (){
		var str = "";
		var ary = [];
		
		for(var i=0, items=iter$(this.nodes()), len=items.length; i < len; i++) {
			var val = items[i].c();
			if((typeof val=='string'||val instanceof String)) {
				str = ("" + str + val);
			};
		};
		
		return "'" + str + "'";
	};
	
	
	Selector.prototype.js = function (o){
		var typ = this.option('type');
		var q = c__(this.query());
		
		// var scoped = typ == '%' or typ == '%%'
		// var all = typ == '$' or typ == '%'
		
		return (typ == '%') ? (
			("q$(" + q + "," + (o.scope().context().c({explicit: true})) + ")")// explicit context
		) : ((typ == '%%') ? (
			("q$$(" + q + "," + (o.scope().context().c()) + ")")
		) : (
			("q" + typ + "(" + q + ")")
		));
		
		// return "{typ} {scoped} - {all}"
	};
	
	
	
	/* @class SelectorPart */
	function SelectorPart(){ ValueNode.apply(this,arguments) };
	
	subclass$(SelectorPart,ValueNode);
	exports.SelectorPart = SelectorPart; // export class 
	SelectorPart.prototype.c = function (){
		return c__(this._value);
		// "{value.c}"
	};
	
	
	/* @class SelectorType */
	function SelectorType(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorType,SelectorPart);
	exports.SelectorType = SelectorType; // export class 
	SelectorType.prototype.c = function (){
		var name = this.value().name();
		// hmm - what about svg? do need to think this through.
		// at least be very conservative about which tags we
		// can drop the tag for?
		// out in TAG_TYPES.HTML ? 
		return (idx$(name,TAG_TYPES.HTML) >= 0) ? (name) : (this.value().sel());
	};
	
	
	
	/* @class SelectorUniversal */
	function SelectorUniversal(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorUniversal,SelectorPart);
	exports.SelectorUniversal = SelectorUniversal; // export class 
	
	
	/* @class SelectorNamespace */
	function SelectorNamespace(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorNamespace,SelectorPart);
	exports.SelectorNamespace = SelectorNamespace; // export class 
	
	
	/* @class SelectorClass */
	function SelectorClass(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorClass,SelectorPart);
	exports.SelectorClass = SelectorClass; // export class 
	SelectorClass.prototype.c = function (){
		return "." + (c__(this._value));
	};
	
	
	/* @class SelectorId */
	function SelectorId(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorId,SelectorPart);
	exports.SelectorId = SelectorId; // export class 
	SelectorId.prototype.c = function (){
		return "#" + (c__(this._value));
	};
	
	
	/* @class SelectorCombinator */
	function SelectorCombinator(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorCombinator,SelectorPart);
	exports.SelectorCombinator = SelectorCombinator; // export class 
	SelectorCombinator.prototype.c = function (){
		return "" + (c__(this._value));
	};
	
	
	/* @class SelectorPseudoClass */
	function SelectorPseudoClass(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorPseudoClass,SelectorPart);
	exports.SelectorPseudoClass = SelectorPseudoClass; // export class 
	
	
	/* @class SelectorAttribute */
	function SelectorAttribute(left,op,right){
		this._left = left;
		this._op = op;
		this._right = this._value = right;
	};
	
	subclass$(SelectorAttribute,SelectorPart);
	exports.SelectorAttribute = SelectorAttribute; // export class 
	
	
	SelectorAttribute.prototype.c = function (){
		return (this._right instanceof Str) ? (
			("[" + (this._left.c()) + this._op + (this._right.c()) + "]")
		) : ((this._right) ? (
			("[" + (this._left.c()) + this._op + "\"'+" + (c__(this._right)) + "+'\"]")
		) : (
			("[" + (this._left.c()) + "]")
			
			// ...
		));
	};
	
	
	
	
	
	// DEFER
	
	/* @class Await */
	function Await(){ ValueNode.apply(this,arguments) };
	
	subclass$(Await,ValueNode);
	exports.Await = Await; // export class 
	
	Await.prototype.__func = {};
	Await.prototype.func = function(v){ return this._func; }
	Await.prototype.setFunc = function(v){ this._func = v; return this; };
	
	Await.prototype.js = function (){
		return CALL(OP('.',new Util.Promisify([this.value()]),'then').prebreak(),[this.func()]).c();
		// value.c
	};
	
	Await.prototype.visit = function (o){
		var self=this;
		self.value().traverse();
		
		var block = o.up(Block);// or up to the closest FUNCTION?
		var outer = o.relative(block,1);
		var par = o.relative(self,-1);
		
		// p "Block {block} {outer} {par}"
		
		self.setFunc(new AsyncFunc([],[]));
		// now we move this node up to the block
		self.func().body().setNodes(block.defers(outer,self));
		
		// if the outer is a var-assignment, we can simply set the params
		if(par instanceof Assign) {
			par.left().traverse();
			var lft = par.left().node();
			// p "Async assignment {par} {lft}"
			// Can be a tuple as well, no?
			if(lft instanceof VarReference) {
				self.func().params().at(0,true,lft.variable().name());
			} else if(lft instanceof Tuple) {
				if(par.type() == 'var' && !(lft.hasSplat())) {
					lft.map(function (el,i){
						return self.func().params().at(i,true,el.value());
					});
				} else {
					par.setRight(ARGUMENTS);
					self.func().body().unshift(par);
				};
			} else {
				par.setRight(self.func().params().at(0,true));
				self.func().body().unshift(par);
			};
		};
		
		
		
		// If it is an advance tuple or something, it should be possible to
		// feed in the paramlist, and let the tuple handle it as if it was any
		// other value
		
		// CASE If this is a tuple / multiset with more than one async value
		// we need to think differently.
		
		// now we need to visit the function as well
		self.func().traverse();
		// pull the outer in
		return self;
	};
	
	
	/* @class AsyncFunc */
	function AsyncFunc(params,body,name,target,options){
		AsyncFunc.__super__.constructor.apply(this,arguments);
	};
	
	subclass$(AsyncFunc,Func);
	exports.AsyncFunc = AsyncFunc; // export class 
	
	
	AsyncFunc.prototype.scopetype = function (){
		return LambdaScope;
	};
	
	// need to override, since we wont do implicit returns
	// def js
	// 	var code = scope.c
	// 	return "function ({params.c})" + code.wrap
	;
	
	
	
	// IMPORTS
	
	/* @class ImportStatement */
	function ImportStatement(imports,source,ns){
		this._imports = imports;
		this._source = source;
		this._ns = ns;
		this;
	};
	
	subclass$(ImportStatement,Statement);
	exports.ImportStatement = ImportStatement; // export class 
	
	ImportStatement.prototype.__ns = {};
	ImportStatement.prototype.ns = function(v){ return this._ns; }
	ImportStatement.prototype.setNs = function(v){ this._ns = v; return this; };
	
	ImportStatement.prototype.__imports = {};
	ImportStatement.prototype.imports = function(v){ return this._imports; }
	ImportStatement.prototype.setImports = function(v){ this._imports = v; return this; };
	
	ImportStatement.prototype.__source = {};
	ImportStatement.prototype.source = function(v){ return this._source; }
	ImportStatement.prototype.setSource = function(v){ this._source = v; return this; };
	
	
	
	
	
	ImportStatement.prototype.visit = function (){
		if(this._ns) {
			this._nsvar || (this._nsvar = this.scope__().register(this._ns,this));
		};
		return this;
	};
	
	
	ImportStatement.prototype.js = function (){
		var req = CALL(new Identifier("require"),[this.source()]);
		
		if(this._ns) {
			return ("var " + (this._nsvar.c()) + " = " + (req.c()));
		} else if(this._imports) {
			var out = [req.cache().c()];
			
			for(var i=0, ary=iter$(this._imports), len=ary.length, imp; i < len; i++) {
				imp = ary[i];var o = OP('=',imp,OP('.',req,imp));
				out.push(("var " + (o.c())));
			};
			
			return out;
		} else {
			return req.c();
		};
	};
	
	
	
	ImportStatement.prototype.consume = function (node){
		return this;
	};
	
	
	
	// EXPORT 
	
	/* @class ExportStatement */
	function ExportStatement(){ ValueNode.apply(this,arguments) };
	
	subclass$(ExportStatement,ValueNode);
	exports.ExportStatement = ExportStatement; // export class 
	ExportStatement.prototype.js = function (){
		true;
		var nodes = this._value.map(function (arg){
			return "module.exports." + (arg.c()) + " = " + (arg.c()) + ";\n";
		});
		return nodes.join("");
	};
	
	
	
	// UTILS
	
	/* @class Util */
	function Util(args){
		this._args = args;
	};
	
	subclass$(Util,Node);
	exports.Util = Util; // export class 
	
	Util.prototype.__args = {};
	Util.prototype.args = function(v){ return this._args; }
	Util.prototype.setArgs = function(v){ this._args = v; return this; };
	
	
	
	// this is how we deal with it now
	Util.extend = function (a,b){
		return new Util.Extend([a,b]);
	};
	
	Util.repeat = function (str,times){
		var res = '';
		while(times > 0){
			if(times % 2 == 1) {
				res += str;
			};
			str += str;
			times >>= 1;
		};
		return res;
	};
	
	
	
	Util.keys = function (obj){
		var l = new Const("Object");
		var r = new Identifier("keys");
		return CALL(OP('.',l,r),[obj]);
	};
	
	Util.len = function (obj,cache){
		var r = new Identifier("length");
		var node = OP('.',obj,r);
		if(cache) {
			node.cache({force: true,type: 'len'});
		};
		return node;
	};
	
	Util.indexOf = function (lft,rgt){
		var node = new Util.IndexOf([lft,rgt]);
		// node.cache(force: yes, type: 'iter') if cache
		return node;
	};
	
	Util.slice = function (obj,a,b){
		var slice = new Identifier("slice");
		console.log(("slice " + a + " " + b));
		return CALL(OP('.',obj,slice),compact__([a,b]));
	};
	
	Util.iterable = function (obj,cache){
		var node = new Util.Iterable([obj]);
		if(cache) {
			node.cache({force: true,type: 'iter'});
		};
		return node;
	};
	
	
	
	Util.union = function (a,b){
		return new Util.Union([a,b]);
		// CALL(UNION,[a,b])
	};
	
	Util.intersect = function (a,b){
		return new Util.Intersect([a,b]);
		// CALL(INTERSECT,[a,b])
	};
	
	Util.counter = function (start,cache){
		var node = new Num(start);// make sure it really is a number
		if(cache) {
			node.cache({force: true,type: 'counter'});
		};
		return node;
	};
	
	Util.array = function (size,cache){
		var node = new Util.Array([size]);
		if(cache) {
			node.cache({force: true,type: 'list'});
		};
		return node;
	};
	
	Util.defineTag = function (type,ctor,supr){
		return CALL(TAGDEF,[type,ctor,supr]);
	};
	
	// hmm
	Util.defineClass = function (name,supr,initor){
		return CALL(CLASSDEF,[name || initor,this.sup()]);
	};
	
	
	Util.toAST = function (obj){
		return this;
	};
	
	Util.prototype.js = function (){
		return "helper";
	};
	
	
	/* @class Union */
	Util.Union = function Union(){ Util.apply(this,arguments) };
	
	subclass$(Util.Union,Util);
	Util.Union.prototype.helper = function (){
		return 'function union$(a,b){\n	if(a && a.__union) return a.__union(b);\n\n	var u = a.slice(0);\n	for(var i=0,l=b.length;i<l;i++) if(u.indexOf(b[i]) == -1) u.push(b[i]);\n	return u;\n};\n';
	};
	
	
	Util.Union.prototype.js = function (){
		this.scope__().root().helper(this,this.helper());
		// When this is triggered, we need to add it to the top of file?
		return "union$(" + (this.args().map(function (v){
			return v.c();
		}).join(',')) + ")";
	};
	
	
	/* @class Intersect */
	Util.Intersect = function Intersect(){ Util.apply(this,arguments) };
	
	subclass$(Util.Intersect,Util);
	Util.Intersect.prototype.helper = function (){
		return 'function intersect$(a,b){\n	if(a && a.__intersect) return a.__intersect(b);\n	var res = [];\n	for(var i=0, l=a.length; i<l; i++) {\n		var v = a[i];\n		if(b.indexOf(v) != -1) res.push(v);\n	}\n	return res;\n};\n';
	};
	
	Util.Intersect.prototype.js = function (){
		this.scope__().root().helper(this,this.helper());
		return "intersect$(" + (this.args().map(function (v){
			return v.c();
		}).join(',')) + ")";
	};
	
	
	/* @class Extend */
	Util.Extend = function Extend(){ Util.apply(this,arguments) };
	
	subclass$(Util.Extend,Util);
	Util.Extend.prototype.js = function (){
		return "extend$(" + (compact__(cary__(this.args())).join(',')) + ")";
	};
	
	
	/* @class IndexOf */
	Util.IndexOf = function IndexOf(){ Util.apply(this,arguments) };
	
	subclass$(Util.IndexOf,Util);
	Util.IndexOf.prototype.helper = function (){
		return 'function idx$(a,b){\n	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);\n};\n';
	};
	
	
	Util.IndexOf.prototype.js = function (){
		this.scope__().root().helper(this,this.helper());
		// When this is triggered, we need to add it to the top of file?
		return "idx$(" + (this.args().map(function (v){
			return v.c();
		}).join(',')) + ")";
	};
	
	
	/* @class Subclass */
	Util.Subclass = function Subclass(){ Util.apply(this,arguments) };
	
	subclass$(Util.Subclass,Util);
	Util.Subclass.prototype.helper = function (){
		return '// helper for subclassing\nfunction subclass$(obj,sup) {\n	for (var k in sup) {\n		if (sup.hasOwnProperty(k)) obj[k] = sup[k];\n	};\n	// obj.__super__ = sup;\n	obj.prototype = Object.create(sup.prototype);\n	obj.__super__ = obj.prototype.__super__ = sup.prototype;\n	obj.prototype.initialize = obj.prototype.constructor = obj;\n};\n';
	};
	
	Util.Subclass.prototype.js = function (){
		this.scope__().root().helper(this,this.helper());
		return "subclass$(" + (this.args().map(function (v){
			return v.c();
		}).join(',')) + ");\n";
	};
	
	
	/* @class Promisify */
	Util.Promisify = function Promisify(){ Util.apply(this,arguments) };
	
	subclass$(Util.Promisify,Util);
	Util.Promisify.prototype.helper = function (){
		return "function promise$(a)\{ return a instanceof Array ? Promise.all(a) : (a && a.then ? a : Promise.resolve(a)); \}";
	};
	
	Util.Promisify.prototype.js = function (){
		this.scope__().root().helper(this,this.helper());
		return "promise$(" + (this.args().map(function (v){
			return v.c();
		}).join(',')) + ")";
	};
	
	
	/* @class Class */
	Util.Class = function Class(){ Util.apply(this,arguments) };
	
	subclass$(Util.Class,Util);
	Util.Class.prototype.js = function (){
		return "class$(" + (this.args().map(function (v){
			return v.c();
		}).join(',')) + ")";
	};
	
	
	/* @class Iterable */
	Util.Iterable = function Iterable(){ Util.apply(this,arguments) };
	
	subclass$(Util.Iterable,Util);
	Util.Iterable.prototype.helper = function (){
		return "function iter$(a)\{ return a ? (a.toArray ? a.toArray() : a) : []; \};";
	};
	
	Util.Iterable.prototype.js = function (){
		if(this.args()[0] instanceof Arr) {
			return this.args()[0].c();
		};// or if we know for sure that it is an array
		// only wrap if it is not clear that this is an array?
		this.scope__().root().helper(this,this.helper());
		return ("iter$(" + (this.args()[0].c()) + ")");
	};
	
	
	/* @class IsFunction */
	Util.IsFunction = function IsFunction(){ Util.apply(this,arguments) };
	
	subclass$(Util.IsFunction,Util);
	Util.IsFunction.prototype.js = function (){
		return "" + (this.args()[0].c());
		// "isfn$({args[0].c})"
		// "typeof {args[0].c} == 'function'"
	};
	
	
	
	/* @class Array */
	Util.Array = function Array(){ Util.apply(this,arguments) };
	
	subclass$(Util.Array,Util);
	Util.Array.prototype.js = function (){
		return "new Array(" + (this.args().map(function (v){
			return v.c();
		})) + ")";
	};
	
	
	
	
	
	
	
	// SCOPES
	
	// handles local variables, self etc. Should create references to outer scopes
	// when needed etc.
	
	// should move the whole context-thingie right into scope
	/* @class Scope */
	function Scope(node,parent){
		this._head = [];
		this._node = node;
		this._parent = parent;
		this._vars = new VariableDeclaration([]);
		this._virtual = false;
		this._counter = 0;
		this._varmap = {};
		this._varpool = [];
	};
	
	exports.Scope = Scope; // export class 
	
	Scope.prototype.__level = {};
	Scope.prototype.level = function(v){ return this._level; }
	Scope.prototype.setLevel = function(v){ this._level = v; return this; };
	
	Scope.prototype.__context = {};
	Scope.prototype.context = function(v){ return this._context; }
	Scope.prototype.setContext = function(v){ this._context = v; return this; };
	
	Scope.prototype.__node = {};
	Scope.prototype.node = function(v){ return this._node; }
	Scope.prototype.setNode = function(v){ this._node = v; return this; };
	
	Scope.prototype.__parent = {};
	Scope.prototype.parent = function(v){ return this._parent; }
	Scope.prototype.setParent = function(v){ this._parent = v; return this; };
	
	Scope.prototype.__varmap = {};
	Scope.prototype.varmap = function(v){ return this._varmap; }
	Scope.prototype.setVarmap = function(v){ this._varmap = v; return this; };
	
	Scope.prototype.__varpool = {};
	Scope.prototype.varpool = function(v){ return this._varpool; }
	Scope.prototype.setVarpool = function(v){ this._varpool = v; return this; };
	
	Scope.prototype.__params = {};
	Scope.prototype.params = function(v){ return this._params; }
	Scope.prototype.setParams = function(v){ this._params = v; return this; };
	
	Scope.prototype.__head = {};
	Scope.prototype.head = function(v){ return this._head; }
	Scope.prototype.setHead = function(v){ this._head = v; return this; };
	
	Scope.prototype.__vars = {};
	Scope.prototype.vars = function(v){ return this._vars; }
	Scope.prototype.setVars = function(v){ this._vars = v; return this; };
	
	Scope.prototype.__counter = {};
	Scope.prototype.counter = function(v){ return this._counter; }
	Scope.prototype.setCounter = function(v){ this._counter = v; return this; };
	
	
	
	Scope.prototype.context = function (){
		return this._context || (this._context = new ScopeContext(this));
	};
	
	Scope.prototype.traverse = function (){
		return this;
	};
	
	Scope.prototype.visit = function (){
		this._parent = STACK.scope(1);// the parent scope
		this._level = STACK.scopes().length - 1;// hmm
		
		// p "parent is",@parent
		
		STACK.addScope(this);
		this.root().scopes().push(this);
		return this;
	};
	
	// called for scopes that are not real scopes in js
	// must ensure that the local variables inside of the scopes do not
	// collide with variables in outer scopes -- rename if needed
	Scope.prototype.virtualize = function (){
		return this;
	};
	
	
	Scope.prototype.root = function (){
		var scope = this;
		while(scope){
			if(scope instanceof FileScope) {
				return scope;
			};
			scope = scope.parent();
		};
		return null;
	};
	
	Scope.prototype.register = function (name,decl,o){
		if(decl === undefined) decl = null;
		if(o === undefined) o = {};
		name = helpers.symbolize(name);
		
		// also look at outer scopes if this is not closed?
		var existing = this._varmap.hasOwnProperty(name) && this._varmap[name];
		if(existing) {
			return existing;
		};
		
		var item = new Variable(this,name,decl,o);
		// need to check for duplicates, and handle this gracefully -
		// going to refactor later
		this._varmap[name] = item;
		return item;
	};
	// declares a variable (has no real declaration beforehand)
	
	// change these values, no?
	Scope.prototype.temporary = function (refnode,o,name){
		if(o === undefined) o = {};
		if(name === undefined) name = null;
		if(o.type) {
			for(var i=0, ary=iter$(this._varpool), len=ary.length, v; i < len; i++) {
				v = ary[i];if(v.type() == o.type && v.declarator() == null) {
					return v.reuse(refnode);
				};
			};
		};
		
		// should only 'register' as ahidden variable, no?
		// if there are real nodes inside that tries to refer to vars
		// defined in outer scopes, we need to make sure they are not named after this
		var item = new SystemVariable(this,name,refnode,o);
		this._varpool.push(item);// WHAT? It should not be in the pool unless explicitly put there?
		this._vars.push(item);// WARN variables should not go directly into a declaration-list
		return item;
		// return register(name || "__",nil,system: yes, temporary: yes)
	};
	
	Scope.prototype.declare = function (name,init,options){
		if(init === undefined) init = null;
		if(options === undefined) options = {};
		name = helpers.symbolize(name);
		this._vars.add(name,init);// .last
		var decl = this._vars.last();
		// item = Variable.new(self,name,decl)
		var item = new Variable(this,name,decl,options);
		decl.setVariable(item);
		return item.resolve();
		// should be possible to force-declare for this scope, no?
		// if this is a system-variable 
	};
	
	Scope.prototype.lookup = function (name){
		var g;
		var ret = null;
		name = helpers.symbolize(name);
		if(this._varmap.hasOwnProperty(name)) {
			ret = this._varmap[name];
		} else {
			ret = this.parent() && this.parent().lookup(name);
		};
		ret || (ret = ((g = this.root()) && (g.lookup(name))));
		// g = root
		return ret;
	};
	
	Scope.prototype.free = function (variable){
		variable.free();// :owner = nil
		// @varpool.push(variable)
		return this;
	};
	
	Scope.prototype.isClosed = function (){
		return false;
	};
	
	Scope.prototype.finalize = function (){
		return this;
	};
	
	Scope.prototype.klass = function (){
		var scope = this;
		while(scope){
			scope = scope.parent();
			if(scope instanceof ClassScope) {
				return scope;
			};
		};
		return null;
	};
	
	Scope.prototype.head = function (){
		return [this._vars,this._params];
	};
	
	Scope.prototype.c = function (o){
		var body;
		if(o === undefined) o = {};
		o.expression = false;
		// need to fix this
		this.node().body().setHead(this.head());
		return body = this.node().body().c(o);
		
		// var head = [@vars,@params].block.c(expression: no)
		// p "head from scope is ({head})"
		// var out = [head or nil,body].flatten__.compact.join("\n")
		// out
		// out = '{' + out + 
	};
	
	Scope.prototype.dump = function (){
		var self=this;
		var vars = Object.keys(self._varmap).map(function (k){
			var v = self._varmap[k];
			return (v.references().length) ? (self.dump(v)) : (null);
		});
		
		return {type: self.constructor.name,
		level: (self.level() || 0),
		vars: compact__(vars),
		loc: self.node().body().region()};
	};
	
	Scope.prototype.toString = function (){
		return "" + (this.constructor.name);
	};
	
	
	// FileScope is wrong? Rather TopScope or ProgramScope
	/* @class FileScope */
	function FileScope(){
		FileScope.__super__.constructor.apply(this,arguments);
		// really? makes little sense
		this.register('global',this,{type: 'global'});
		this.register('exports',this,{type: 'global'});
		this.register('console',this,{type: 'global'});
		this.register('process',this,{type: 'global'});
		this.register('setTimeout',this,{type: 'global'});
		this.register('setInterval',this,{type: 'global'});
		this.register('clearTimeout',this,{type: 'global'});
		this.register('clearInterval',this,{type: 'global'});
		this.register('__dirname',this,{type: 'global'});
		// preregister global special variables here
		this._warnings = [];
		this._scopes = [];
		this._helpers = [];
	};
	
	subclass$(FileScope,Scope);
	exports.FileScope = FileScope; // export class 
	
	FileScope.prototype.__warnings = {};
	FileScope.prototype.warnings = function(v){ return this._warnings; }
	FileScope.prototype.setWarnings = function(v){ this._warnings = v; return this; };
	
	FileScope.prototype.__scopes = {};
	FileScope.prototype.scopes = function(v){ return this._scopes; }
	FileScope.prototype.setScopes = function(v){ this._scopes = v; return this; };
	
	
	
	FileScope.prototype.context = function (){
		return this._context || (this._context = new RootScopeContext(this));
	};
	
	FileScope.prototype.lookup = function (name){
		name = helpers.symbolize(name);
		return (this._varmap.hasOwnProperty(name)) && (this._varmap[name]);
	};
	
	FileScope.prototype.visit = function (){
		STACK.addScope(this);
		return this;
	};
	
	FileScope.prototype.helper = function (typ,value){
		if(this._helpers.indexOf(value) == -1) {
			this._helpers.push(value);
		};
		return this;
	};
	
	FileScope.prototype.head = function (){
		return [this._helpers,this._params,this._vars];
	};
	
	FileScope.prototype.warn = function (data){
		data.node = null;
		// p "warning",JSON.stringify(data)
		this._warnings.push(data);
		return this;
	};
	
	FileScope.prototype.dump = function (){
		var scopes = this._scopes.map(function (s){
			return s.dump();
		});
		scopes.unshift(FileScope.__super__.dump.call(this));
		
		var obj = {
			warnings: this.dump(this._warnings),
			scopes: scopes
		};
		
		return obj;
	};
	
	
	
	
	/* @class ClassScope */
	function ClassScope(){ Scope.apply(this,arguments) };
	
	subclass$(ClassScope,Scope);
	exports.ClassScope = ClassScope; // export class 
	ClassScope.prototype.virtualize = function (){
		var up = this.parent();
		for(var o=this._varmap, i=0, keys=Object.keys(o), l=keys.length; i < l; i++){
			true;
			o[keys[i]].resolve(up,true);// force new resolve
		};
		return this;
	};
	
	
	/* @class TagScope */
	function TagScope(){ ClassScope.apply(this,arguments) };
	
	subclass$(TagScope,ClassScope);
	exports.TagScope = TagScope; // export class 
	
	
	/* @class ClosureScope */
	function ClosureScope(){ Scope.apply(this,arguments) };
	
	subclass$(ClosureScope,Scope);
	exports.ClosureScope = ClosureScope; // export class 
	
	
	/* @class FunctionScope */
	function FunctionScope(){ Scope.apply(this,arguments) };
	
	subclass$(FunctionScope,Scope);
	exports.FunctionScope = FunctionScope; // export class 
	
	
	/* @class MethodScope */
	function MethodScope(){ Scope.apply(this,arguments) };
	
	subclass$(MethodScope,Scope);
	exports.MethodScope = MethodScope; // export class 
	MethodScope.prototype.isClosed = function (){
		return true;
	};
	
	
	/* @class LambdaScope */
	function LambdaScope(){ Scope.apply(this,arguments) };
	
	subclass$(LambdaScope,Scope);
	exports.LambdaScope = LambdaScope; // export class 
	LambdaScope.prototype.context = function (){
		return this._context || (this._context = this.parent().context().reference(this));
	};
	
	
	/* @class FlowScope */
	function FlowScope(){ Scope.apply(this,arguments) };
	
	subclass$(FlowScope,Scope);
	exports.FlowScope = FlowScope; // export class 
	FlowScope.prototype.params = function (){
		return (this._parent) && (this._parent.params());
	};
	
	FlowScope.prototype.context = function (){
		return this.parent().context();
	};
	// 	# usually - if the parent scope is a closed scope we dont really need
	// 	# to force a reference
	// 	# @context ||= parent.context.reference(self)
	;
	
	/* @class CatchScope */
	function CatchScope(){ FlowScope.apply(this,arguments) };
	
	subclass$(CatchScope,FlowScope);
	exports.CatchScope = CatchScope; // export class 
	
	
	/* @class WhileScope */
	function WhileScope(){ FlowScope.apply(this,arguments) };
	
	subclass$(WhileScope,FlowScope);
	exports.WhileScope = WhileScope; // export class 
	
	
	/* @class ForScope */
	function ForScope(){ FlowScope.apply(this,arguments) };
	
	subclass$(ForScope,FlowScope);
	exports.ForScope = ForScope; // export class 
	
	
	// lives in scope
	/* @class Variable */
	function Variable(scope,name,decl,options){
		this._scope = scope;
		this._name = name;
		this._alias = null;
		this._declarator = decl;
		this._autodeclare = false;
		this._declared = true;
		this._resolved = false;
		this._options = options || {};
		this._type = this._options.type || 'var';
		this._export = false;// hmmmm
		// @declarators = [] # not used now
		this._references = [];// should probably be somewhere else, no?
	};
	
	subclass$(Variable,Node);
	exports.Variable = Variable; // export class 
	
	Variable.prototype.__scope = {};
	Variable.prototype.scope = function(v){ return this._scope; }
	Variable.prototype.setScope = function(v){ this._scope = v; return this; };
	
	Variable.prototype.__name = {};
	Variable.prototype.name = function(v){ return this._name; }
	Variable.prototype.setName = function(v){ this._name = v; return this; };
	
	Variable.prototype.__alias = {};
	Variable.prototype.alias = function(v){ return this._alias; }
	Variable.prototype.setAlias = function(v){ this._alias = v; return this; };
	
	Variable.prototype.__type = {};
	Variable.prototype.type = function(v){ return this._type; }
	Variable.prototype.setType = function(v){ this._type = v; return this; };
	
	Variable.prototype.__options = {};
	Variable.prototype.options = function(v){ return this._options; }
	Variable.prototype.setOptions = function(v){ this._options = v; return this; };
	
	Variable.prototype.__declarator = {};
	Variable.prototype.declarator = function(v){ return this._declarator; }
	Variable.prototype.setDeclarator = function(v){ this._declarator = v; return this; };
	
	Variable.prototype.__autodeclare = {};
	Variable.prototype.autodeclare = function(v){ return this._autodeclare; }
	Variable.prototype.setAutodeclare = function(v){ this._autodeclare = v; return this; };
	
	Variable.prototype.__references = {};
	Variable.prototype.references = function(v){ return this._references; }
	Variable.prototype.setReferences = function(v){ this._references = v; return this; };
	
	Variable.prototype.__export = {};
	Variable.prototype.export = function(v){ return this._export; }
	Variable.prototype.setExport = function(v){ this._export = v; return this; };
	
	
	
	
	Variable.prototype.resolve = function (scope,force){
		var item;
		if(scope === undefined) scope = this.scope();
		if(force === undefined) force = false;
		if(this._resolved && !force) {
			return this;
		};
		
		this._resolved = true;
		// p "need to resolve!".cyan
		if(item = scope.lookup(this.name())) {
			if(item.scope() != scope && this.options().let) {
				scope.varmap()[this.name()] = this;
			};
			
			// different rules for different variables?
			if(this._options.proxy) {
				true;
			} else {
				var i = 0;
				var orig = this._name;
				while(scope.lookup(this._name)){
					this._name = ("" + orig + (i += 1));
				};
			};
		};
		
		scope.varmap()[this.name()] = this;
		return this;
		// p "resolve variable".cyan
	};
	
	Variable.prototype.reference = function (){
		return this;
	};
	
	Variable.prototype.free = function (ref){
		this._declarator = null;
		return this;
	};
	
	Variable.prototype.reuse = function (ref){
		this._declarator = ref;
		return this;
	};
	
	Variable.prototype.proxy = function (par,index){
		this._proxy = [par,index];
		return this;
	};
	
	Variable.prototype.refcount = function (){
		return this._references.length;
	};
	
	Variable.prototype.c = function (){
		if(this._c) {
			return this._c;
		};
		
		if(this._proxy) {
			this._c = ("" + (this._proxy[0].c()) + "[" + (this._proxy[1].c()) + "]");
		} else {
			var v = (this.alias() || this.name());
			this._c = (typeof v == 'string') ? (v) : (v.c());
			// allow certain reserved words
			// should warn on others though (!!!)
			if(RESERVED_REGEX.test(this._c)) {
				this._c = ("" + this.c() + "$");
			};// @c.match(/^(default)$/)
		};
		return this._c;
	};
	
	// variables should probably inherit from node(!)
	Variable.prototype.consume = function (node){
		return this;
	};
	
	// this should only generate the accessors - not dael with references
	Variable.prototype.accessor = function (ref){
		var node = new LocalVarAccess(".",null,this);// this is just wrong .. should not be a regular accessor
		// @references.push([ref,el]) if ref # weird temp format
		return node;
	};
	
	Variable.prototype.addReference = function (ref){
		this._references.push(ref);
		return this;
	};
	
	Variable.prototype.autodeclare = function (){
		if(this.option('declared')) {
			return this;
		};
		// p "variable should autodeclare(!)"
		this._autodeclare = true;
		
		// WARN
		// if scope isa WhileScope
		// 	p "should do different autodeclare!!"
		// 	# or we should simply add them
		
		this.scope().vars().push(this);// only if it does not exist here!!!
		this.set({declared: true});
		return this;
	};
	
	Variable.prototype.toString = function (){
		return String(this.name());
	};
	
	Variable.prototype.dump = function (typ){
		return {
			type: this.type(),
			name: this.name(),
			refs: this.dump(this._references,typ)
		};
	};
	
	
	/* @class SystemVariable */
	function SystemVariable(){ Variable.apply(this,arguments) };
	
	subclass$(SystemVariable,Variable);
	exports.SystemVariable = SystemVariable; // export class 
	SystemVariable.prototype.predeclared = function (){
		this.scope().vars().remove(this);
		return this;
	};
	
	SystemVariable.prototype.resolve = function (){
		var alias, v_;
		if(this._resolved || this._name) {
			return this;
		};
		// p "RESOLVE SYSTEM VARIABLE".red
		this._resolved = true;
		// unless @name
		// adds a very random initial name
		// the auto-magical goes last, or at least, possibly reuse other names
		// "${Math.floor(Math.random * 1000)}"
		
		var typ = this._options.type;
		var names = [].concat(this._options.names);
		var alt = null;
		var node = null;
		
		var scope = this.scope();
		
		if(typ == 'tag') {
			var i = 0;
			while(!(this._name)){
				var alt = ("t" + (i++));
				if(!scope.lookup(alt)) {
					this._name = alt;
				};
			};
		} else if(typ == 'iter') {
			names = ['ary__','ary_','coll','array','items','ary'];
		} else if(typ == 'val') {
			names = ['v_'];
		} else if(typ == 'arguments') {
			names = ['$_','$0'];
		} else if(typ == 'keypars') {
			names = ['opts','options','pars'];
		} else if(typ == 'counter') {
			names = ['i__','i_','k','j','i'];
		} else if(typ == 'len') {
			names = ['len__','len_','len'];
		} else if(typ == 'list') {
			names = ['tmplist_','tmplist','tmp'];
		};
		// or if type placeholder / cacher (add 0)
		
		while(!(this._name) && (alt = names.pop())){
			if(!scope.lookup(alt)) {
				this._name = alt;
			};
		};
		
		if(!(this._name)) {
			if(node = this.declarator().node()) {
				if(alias = node.alias()) {
					names.push(alias + "_");
				};
			};
		};
		
		while(!(this._name) && (alt = names.pop())){
			if(!scope.lookup(alt)) {
				this._name = alt;
			};
		};
		
		// p "suggested names {names.join(" , ")} {node}".cyan
		//  Math.floor(Math.random * 1000)
		this._name || (this._name = ("$" + ((scope.setCounter(v_=scope.counter() + 1),v_))));
		// p "name for variable is {@name}"
		scope.varmap()[this._name] = this;
		return this;
	};
	
	SystemVariable.prototype.name = function (){
		this.resolve();
		return this._name;
	};
	
	
	
	/* @class ScopeContext */
	function ScopeContext(scope,value){
		this._scope = scope;
		this._value = value;
		this._reference = null;
		this;
	};
	
	subclass$(ScopeContext,Node);
	exports.ScopeContext = ScopeContext; // export class 
	
	ScopeContext.prototype.__scope = {};
	ScopeContext.prototype.scope = function(v){ return this._scope; }
	ScopeContext.prototype.setScope = function(v){ this._scope = v; return this; };
	
	ScopeContext.prototype.__value = {};
	ScopeContext.prototype.value = function(v){ return this._value; }
	ScopeContext.prototype.setValue = function(v){ this._value = v; return this; };
	
	
	
	// instead of all these references we should probably
	// just register when it is accessed / looked up from
	// a deeper function-scope, and when it is, we should
	// register the variable in scope, and then start to
	// use that for further references. Might clean things
	// up for the cases where we have yet to decide the
	// name of the variable etc?
	
	ScopeContext.prototype.reference = function (){
		return this._reference || (this._reference = this.scope().declare("self",new This()));
	};
	
	ScopeContext.prototype.c = function (){
		var val = this._value || this._reference;
		return (val) ? (val.c()) : ("this");
	};
	
	
	/* @class RootScopeContext */
	function RootScopeContext(){ ScopeContext.apply(this,arguments) };
	
	subclass$(RootScopeContext,ScopeContext);
	exports.RootScopeContext = RootScopeContext; // export class 
	RootScopeContext.prototype.reference = function (scope){
		return this;
	};
	
	RootScopeContext.prototype.c = function (o){
		if(o && o.explicit) {
			return "";
		};
		var val = this._value || this._reference;
		return (val) ? (val.c()) : ("this");
		// should be the other way around, no?
		// o and o:explicit ? super : ""
	};
	
	
	/* @class Super */
	function Super(){ Node.apply(this,arguments) };
	
	subclass$(Super,Node);
	exports.Super = Super; // export class 
	Super.prototype.c = function (){
		var m = STACK.method();
		var out = null;
		var up = STACK.current();
		var deep = (up instanceof Access);
		
		// TODO optimization for later - problematic if there is a different reference in the end
		if(false && m && m.type() == 'constructor') {
			out = ("" + (m.target().c()) + ".superclass");
			if(!deep) {
				out += (".apply(" + (m.scope().context().c()) + ",arguments)");
			};
		} else {
			out = ("" + (m.target().c()) + ".__super__");
			if(!((up instanceof Access))) {
				out += ("." + (c__(m.supername())));
				if(!((up instanceof Call))) {
					out += (".apply(" + (m.scope().context().c()) + ",arguments)");
				};
			};
		};
		return out;
	};
	
	
	// constants
	
	module.exports.BR = BR = new Newline('\n');
	module.exports.BR2 = BR2 = new Newline('\n\n');
	module.exports.SELF = SELF = new Self();
	module.exports.SUPER = SUPER = new Super();
	module.exports.TRUE = TRUE = new True('true');
	module.exports.FALSE = FALSE = new False('false');
	module.exports.ARGUMENTS = ARGUMENTS = new ArgsReference('arguments');
	module.exports.EMPTY = EMPTY = '';
	module.exports.NULL = NULL = 'null';
	
	module.exports.RESERVED = RESERVED = ['default','native','enum','with'];
	module.exports.RESERVED_REGEX = RESERVED_REGEX = /^(default|native|enum|with)$/;
	
	module.exports.UNION = UNION = new Const('union$');
	module.exports.INTERSECT = INTERSECT = new Const('intersect$');
	module.exports.CLASSDEF = CLASSDEF = new Const('imba$class');
	module.exports.TAGDEF = TAGDEF = new Const('Imba.Tag.define');
	module.exports.NEWTAG = NEWTAG = new Identifier("tag$");


}())
},{"./helpers":3}],6:[function(require,module,exports){
(function (process){
/* parser generated by jison 0.4.17 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,5],$V1=[1,32],$V2=[1,33],$V3=[1,34],$V4=[1,35],$V5=[1,74],$V6=[1,109],$V7=[1,119],$V8=[1,114],$V9=[1,115],$Va=[1,116],$Vb=[1,113],$Vc=[1,117],$Vd=[1,122],$Ve=[1,108],$Vf=[1,79],$Vg=[1,80],$Vh=[1,81],$Vi=[1,72],$Vj=[1,111],$Vk=[1,90],$Vl=[1,86],$Vm=[1,83],$Vn=[1,70],$Vo=[1,64],$Vp=[1,107],$Vq=[1,85],$Vr=[1,82],$Vs=[1,28],$Vt=[1,29],$Vu=[1,91],$Vv=[1,89],$Vw=[1,71],$Vx=[1,120],$Vy=[1,66],$Vz=[1,67],$VA=[1,112],$VB=[1,10],$VC=[1,121],$VD=[1,77],$VE=[1,37],$VF=[1,43],$VG=[1,65],$VH=[1,106],$VI=[1,68],$VJ=[1,84],$VK=[1,118],$VL=[1,58],$VM=[1,73],$VN=[1,101],$VO=[1,102],$VP=[1,103],$VQ=[1,104],$VR=[1,62],$VS=[1,100],$VT=[1,50],$VU=[1,51],$VV=[1,52],$VW=[1,53],$VX=[1,54],$VY=[1,55],$VZ=[1,124],$V_=[1,6,10,124],$V$=[1,126],$V01=[1,6,10,13,124],$V11=[1,135],$V21=[1,136],$V31=[1,138],$V41=[1,130],$V51=[1,132],$V61=[1,131],$V71=[1,133],$V81=[1,134],$V91=[1,137],$Va1=[1,141],$Vb1=[1,6,9,10,13,21,79,86,95,100,112,122,124,134,156,183,184,195,196,197,202,210,219,220,223,224,227,228,229],$Vc1=[2,254],$Vd1=[1,147],$Ve1=[1,148],$Vf1=[1,150],$Vg1=[1,153],$Vh1=[1,155],$Vi1=[1,154],$Vj1=[1,6,9,10,13,21,79,86,124],$Vk1=[1,6,10,13,124,195,197,202,219],$Vl1=[1,6,9,10,13,20,21,62,77,79,86,95,99,100,112,122,124,134,156,179,183,184,195,196,197,202,210,219,220,223,224,227,228,229],$Vm1=[2,219],$Vn1=[1,169],$Vo1=[1,167],$Vp1=[1,6,9,10,13,20,21,62,77,79,86,95,99,100,104,112,122,124,134,156,179,183,184,195,196,197,202,210,219,220,223,224,227,228,229],$Vq1=[2,215],$Vr1=[6,13,53,54,77,80,95,99,103],$Vs1=[1,201],$Vt1=[1,206],$Vu1=[1,6,9,10,13,20,21,62,77,79,86,95,99,100,104,112,122,124,134,156,179,183,184,195,196,197,202,210,219,220,223,224,225,226,227,228,229,230],$Vv1=[1,216],$Vw1=[1,213],$Vx1=[1,218],$Vy1=[6,9,13,79],$Vz1=[2,231],$VA1=[1,246],$VB1=[1,236],$VC1=[1,265],$VD1=[1,266],$VE1=[74,75,76,77,80,81,82,83,84,85,89,91],$VF1=[1,274],$VG1=[1,6,9,10,13,20,21,53,54,62,77,79,80,86,95,99,100,103,104,112,122,124,134,156,179,183,184,195,196,197,202,210,219,220,223,224,225,226,227,228,229,230],$VH1=[1,6,9,10,13,20,21,77,78,79,86,95,99,100,112,122,124,131,134,156,179,183,184,190,191,195,196,197,202,210,213,215,218,219,220,223,224,227,228,229],$VI1=[1,306],$VJ1=[1,307],$VK1=[1,6,9,10,13,20,21,77,78,79,86,95,99,100,112,122,124,131,134,156,179,183,184,195,196,197,202,210,219,220,223,224,227,228,229],$VL1=[1,6,9,10,13,21,79,86,95,100,122,124,134,183,184,195,196,197,202,210,219],$VM1=[1,326],$VN1=[1,330],$VO1=[1,6,10,13,21,79,86,95,100,112,122,124,134,156,183,184,195,196,197,202,210,219,220,223,224,227,228,229],$VP1=[6,13,95],$VQ1=[1,339],$VR1=[1,6,9,10,13,20,21,78,79,86,95,100,112,122,124,134,156,183,184,195,196,197,202,210,219,220,223,224,227,228,229],$VS1=[13,27],$VT1=[1,6,9,10,13,20,21,27,62,77,79,86,95,99,100,104,112,122,124,134,156,179,183,184,195,196,197,202,210,219,220,223,224,225,226,227,228,229,230],$VU1=[2,275],$VV1=[1,6,9,10,13,20,21,62,77,79,86,95,99,100,104,112,122,124,134,156,179,183,184,195,196,197,202,208,209,210,219,220,223,224,227,228,229],$VW1=[2,171],$VX1=[1,354],$VY1=[6,9,10,13,21,86],$VZ1=[13,134],$V_1=[2,173],$V$1=[1,367],$V02=[1,364],$V12=[1,365],$V22=[1,366],$V32=[1,371],$V42=[6,9,10,13,79],$V52=[6,9,10,13,79,122],$V62=[1,6,9,10,13,21,79,86,95,100,122,124,134,183,184,210,219],$V72=[1,6,9,10,13,21,79,86,95,100,122,124,134,183,184,196,210,219],$V82=[208,209],$V92=[13,208,209],$Va2=[1,6,10,13,21,79,86,95,100,122,124,134,156,183,184,195,196,197,202,210,219,220,223,224,227,228,229],$Vb2=[77,80],$Vc2=[20,77,80,147,149],$Vd2=[1,6,9,10,13,21,79,86,95,100,112,122,124,134,156,183,184,195,196,197,202,210,219,220,223,224,228,229],$Ve2=[1,6,9,10,13,21,79,86,95,100,122,124,134,183,184,196,210],$Vf2=[18,19,22,23,25,31,51,53,54,56,58,60,62,64,66,67,68,69,72,78,80,85,92,100,109,110,117,123,130,131,135,139,141,142,143,160,165,166,169,173,174,175,180,181,187,193,195,197,199,202,211,217,221,222,223,224,225,226],$Vg2=[1,6,9,10,13,21,79,86,95,100,112,122,124,134,156,183,184,195,196,197,202,210,213,218,219,220,223,224,227,228,229],$Vh2=[10,213,215],$Vi2=[1,436],$Vj2=[2,172],$Vk2=[6,9,10],$Vl2=[1,444],$Vm2=[13,21,134],$Vn2=[1,452],$Vo2=[1,6,9,10,13,21,79,86,95,100,122,124,134,183,184,195,197,202,210,219],$Vp2=[51,58,78],$Vq2=[13,21],$Vr2=[1,476],$Vs2=[9,13],$Vt2=[1,526],$Vu2=[6,9];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"Root":3,"Body":4,"Block":5,"TERMINATOR":6,"Line":7,"Terminator":8,"INDENT":9,"OUTDENT":10,"Splat":11,"Expression":12,",":13,"Comment":14,"Statement":15,"Return":16,"Throw":17,"STATEMENT":18,"BREAK":19,"CALL_START":20,"CALL_END":21,"CONTINUE":22,"DEBUGGER":23,"ImportStatement":24,"IMPORT":25,"ImportArgList":26,"FROM":27,"ImportFrom":28,"AS":29,"ImportArg":30,"STRING":31,"VarIdentifier":32,"Await":33,"Value":34,"Invocation":35,"Code":36,"Operation":37,"Assign":38,"If":39,"Ternary":40,"Try":41,"While":42,"For":43,"Switch":44,"Class":45,"Module":46,"TagDeclaration":47,"Tag":48,"Property":49,"Identifier":50,"IDENTIFIER":51,"Ivar":52,"IVAR":53,"CVAR":54,"Gvar":55,"GVAR":56,"Const":57,"CONST":58,"Argvar":59,"ARGVAR":60,"Symbol":61,"SYMBOL":62,"AlphaNumeric":63,"NUMBER":64,"Literal":65,"JS":66,"REGEX":67,"BOOL":68,"RETURN":69,"Arguments":70,"TagSelector":71,"SELECTOR_START":72,"TagSelectorType":73,"SELECTOR_NS":74,"SELECTOR_ID":75,"SELECTOR_CLASS":76,".":77,"{":78,"}":79,"#":80,"SELECTOR_COMBINATOR":81,"SELECTOR_PSEUDO_CLASS":82,"SELECTOR_GROUP":83,"UNIVERSAL_SELECTOR":84,"[":85,"]":86,"SELECTOR_ATTR_OP":87,"TagSelectorAttrValue":88,"SELECTOR_TAG":89,"Selector":90,"SELECTOR_END":91,"TAG_START":92,"TagOptions":93,"TagAttributes":94,"TAG_END":95,"TagBody":96,"TagTypeName":97,"Self":98,"INDEX_START":99,"INDEX_END":100,"TagAttr":101,"OptComma":102,"TAG_ATTR":103,"=":104,"TagAttrValue":105,"ArgList":106,"TagTypeDef":107,"TagDeclarationBlock":108,"EXTEND":109,"TAG":110,"TagType":111,"COMPARE":112,"TagDeclKeywords":113,"TAG_TYPE":114,"TAG_ID":115,"TagId":116,"IDREF":117,"Assignable":118,"Outdent":119,"AssignObj":120,"ObjAssignable":121,":":122,"(":123,")":124,"HERECOMMENT":125,"COMMENT":126,"Method":127,"Do":128,"Begin":129,"BEGIN":130,"DO":131,"BLOCK_PARAM_START":132,"ParamList":133,"BLOCK_PARAM_END":134,"PROP":135,"PropertyIdentifier":136,"Object":137,"TupleAssign":138,"VAR":139,"MethodDeclaration":140,"GLOBAL":141,"EXPORT":142,"DEF":143,"MethodScope":144,"MethodScopeType":145,"MethodIdentifier":146,"DEF_BODY":147,"MethodBody":148,"DEF_FRAGMENT":149,"MethodReceiver":150,"This":151,"Param":152,"Array":153,"ParamVar":154,"SPLAT":155,"LOGIC":156,"BLOCK_ARG":157,"Reference":158,"VarReference":159,"LET":160,"SimpleAssignable":161,"NEW":162,"Super":163,"IndexValue":164,"SUPER":165,"AWAIT":166,"Parenthetical":167,"Range":168,"ARGUMENTS":169,"Slice":170,"AssignList":171,"ClassStart":172,"LOCAL":173,"CLASS":174,"MODULE":175,"OptFuncExist":176,"SuperCall":177,"SuperAccess":178,"FUNC_EXIST":179,"THIS":180,"SELF":181,"RangeDots":182,"..":183,"...":184,"Arg":185,"SimpleArgs":186,"TRY":187,"Catch":188,"Finally":189,"FINALLY":190,"CATCH":191,"CATCH_VAR":192,"THROW":193,"WhileSource":194,"WHILE":195,"WHEN":196,"UNTIL":197,"Loop":198,"LOOP":199,"ForBody":200,"ForBlock":201,"FOR":202,"ForStart":203,"ForSource":204,"ForVariables":205,"OWN":206,"ForValue":207,"FORIN":208,"FOROF":209,"BY":210,"SWITCH":211,"Whens":212,"ELSE":213,"When":214,"LEADING_WHEN":215,"IfBlock":216,"IF":217,"ELIF":218,"POST_IF":219,"?":220,"UNARY":221,"SQRT":222,"-":223,"+":224,"--":225,"++":226,"MATH":227,"SHIFT":228,"RELATION":229,"COMPOUND_ASSIGN":230,"$accept":0,"$end":1},
terminals_: {2:"error",6:"TERMINATOR",9:"INDENT",10:"OUTDENT",13:",",18:"STATEMENT",19:"BREAK",20:"CALL_START",21:"CALL_END",22:"CONTINUE",23:"DEBUGGER",25:"IMPORT",27:"FROM",29:"AS",31:"STRING",51:"IDENTIFIER",53:"IVAR",54:"CVAR",56:"GVAR",58:"CONST",60:"ARGVAR",62:"SYMBOL",64:"NUMBER",66:"JS",67:"REGEX",68:"BOOL",69:"RETURN",72:"SELECTOR_START",74:"SELECTOR_NS",75:"SELECTOR_ID",76:"SELECTOR_CLASS",77:".",78:"{",79:"}",80:"#",81:"SELECTOR_COMBINATOR",82:"SELECTOR_PSEUDO_CLASS",83:"SELECTOR_GROUP",84:"UNIVERSAL_SELECTOR",85:"[",86:"]",87:"SELECTOR_ATTR_OP",89:"SELECTOR_TAG",91:"SELECTOR_END",92:"TAG_START",95:"TAG_END",99:"INDEX_START",100:"INDEX_END",103:"TAG_ATTR",104:"=",109:"EXTEND",110:"TAG",112:"COMPARE",114:"TAG_TYPE",115:"TAG_ID",117:"IDREF",122:":",123:"(",124:")",125:"HERECOMMENT",126:"COMMENT",130:"BEGIN",131:"DO",132:"BLOCK_PARAM_START",134:"BLOCK_PARAM_END",135:"PROP",139:"VAR",141:"GLOBAL",142:"EXPORT",143:"DEF",147:"DEF_BODY",149:"DEF_FRAGMENT",155:"SPLAT",156:"LOGIC",157:"BLOCK_ARG",160:"LET",162:"NEW",165:"SUPER",166:"AWAIT",169:"ARGUMENTS",173:"LOCAL",174:"CLASS",175:"MODULE",179:"FUNC_EXIST",180:"THIS",181:"SELF",183:"..",184:"...",187:"TRY",190:"FINALLY",191:"CATCH",192:"CATCH_VAR",193:"THROW",195:"WHILE",196:"WHEN",197:"UNTIL",199:"LOOP",202:"FOR",206:"OWN",208:"FORIN",209:"FOROF",210:"BY",211:"SWITCH",213:"ELSE",215:"LEADING_WHEN",217:"IF",218:"ELIF",219:"POST_IF",220:"?",221:"UNARY",222:"SQRT",223:"-",224:"+",225:"--",226:"++",227:"MATH",228:"SHIFT",229:"RELATION",230:"COMPOUND_ASSIGN"},
productions_: [0,[3,0],[3,1],[3,2],[4,1],[4,3],[4,2],[8,1],[5,2],[5,3],[5,4],[7,1],[7,1],[7,3],[7,3],[7,1],[7,1],[15,1],[15,1],[15,1],[15,1],[15,4],[15,1],[15,4],[15,1],[15,1],[24,4],[24,4],[24,2],[28,1],[26,1],[26,3],[30,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[50,1],[52,1],[52,1],[55,1],[57,1],[59,1],[61,1],[63,1],[63,1],[63,1],[65,1],[65,1],[65,1],[65,1],[16,2],[16,2],[16,1],[71,1],[71,2],[71,2],[71,2],[71,2],[71,5],[71,5],[71,2],[71,2],[71,2],[71,2],[71,4],[71,6],[73,1],[90,2],[88,1],[88,1],[88,3],[48,4],[48,5],[48,5],[97,1],[97,1],[97,0],[93,1],[93,3],[93,4],[93,3],[93,5],[93,3],[93,2],[93,5],[94,0],[94,1],[94,3],[94,4],[101,1],[101,3],[105,1],[96,3],[96,3],[107,1],[107,3],[47,1],[47,2],[108,2],[108,3],[108,4],[108,5],[113,0],[113,1],[111,1],[111,1],[116,1],[116,2],[38,3],[38,5],[120,1],[120,3],[120,5],[120,1],[121,1],[121,1],[121,1],[121,1],[121,1],[121,3],[14,1],[14,1],[36,1],[36,1],[36,1],[129,2],[128,2],[128,5],[128,6],[49,3],[49,5],[49,2],[136,1],[136,3],[138,4],[127,1],[127,2],[127,2],[140,9],[140,6],[140,7],[140,4],[140,9],[140,6],[140,7],[140,4],[145,1],[145,1],[146,1],[146,1],[146,3],[148,1],[148,1],[144,1],[144,1],[144,1],[144,1],[102,0],[102,1],[133,0],[133,1],[133,3],[152,1],[152,1],[152,1],[152,2],[152,2],[152,2],[152,3],[154,1],[11,2],[158,2],[159,3],[159,2],[159,2],[159,3],[159,2],[32,1],[32,1],[161,1],[161,1],[161,1],[161,1],[161,1],[161,1],[161,1],[161,1],[161,3],[161,3],[161,3],[161,3],[161,3],[161,3],[161,3],[161,3],[161,3],[161,3],[161,3],[161,4],[161,4],[163,1],[118,1],[118,1],[118,1],[33,2],[34,1],[34,1],[34,1],[34,1],[34,1],[34,1],[34,1],[34,1],[34,1],[164,1],[164,1],[137,4],[171,0],[171,1],[171,3],[171,4],[171,6],[45,1],[45,2],[45,2],[45,2],[45,2],[45,3],[172,2],[172,3],[172,4],[172,5],[46,2],[46,3],[35,3],[35,3],[35,2],[177,1],[177,2],[178,2],[176,0],[176,1],[70,2],[70,4],[151,1],[98,1],[153,2],[153,4],[182,1],[182,1],[168,5],[170,3],[170,2],[170,2],[106,1],[106,3],[106,4],[106,4],[106,6],[119,2],[119,1],[185,1],[185,1],[185,1],[185,1],[186,1],[186,3],[41,2],[41,3],[41,3],[41,4],[189,2],[188,3],[17,2],[167,3],[167,5],[194,2],[194,4],[194,2],[194,4],[42,2],[42,2],[42,2],[42,1],[198,2],[198,2],[43,2],[43,2],[43,2],[201,2],[200,2],[200,2],[203,2],[203,3],[207,1],[207,1],[207,1],[205,1],[205,3],[204,2],[204,2],[204,4],[204,4],[204,4],[204,6],[204,6],[44,5],[44,7],[44,4],[44,6],[212,1],[212,2],[214,3],[214,4],[216,3],[216,5],[216,4],[216,3],[39,1],[39,3],[39,3],[40,5],[37,2],[37,2],[37,2],[37,2],[37,2],[37,2],[37,2],[37,2],[37,2],[37,3],[37,3],[37,3],[37,3],[37,3],[37,3],[37,3],[37,3],[37,5]],
performAction: function performAction(self, yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */) {
/* self == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
return self.$ = new yy.Root([]);
break;
case 2:
return self.$ = new yy.Root($$[$0]);
break;
case 3:
return self.$ = $$[$0-1];
break;
case 4:
self.$ = yy.Block.wrap([$$[$0]]);
break;
case 5:
self.$ = $$[$0-2].break($$[$0-1]).add($$[$0]);
break;
case 6:
self.$ = $$[$0-1].break($$[$0]);
break;
case 7:
self.$ = new yy.Terminator($$[$0]);
break;
case 8:
self.$ = new yy.Block([]).indented($$[$0-1],$$[$0]);
break;
case 9: case 106:
self.$ = $$[$0-1].indented($$[$0-2],$$[$0]);
break;
case 10:
self.$ = $$[$0-1].prebreak($$[$0-2]).indented($$[$0-3],$$[$0]);
break;
case 11: case 12: case 15: case 16: case 17: case 18: case 25: case 29: case 32: case 33: case 34: case 35: case 36: case 37: case 38: case 39: case 40: case 41: case 42: case 43: case 44: case 45: case 46: case 47: case 48: case 49: case 59: case 60: case 82: case 83: case 88: case 105: case 110: case 116: case 127: case 128: case 129: case 130: case 131: case 132: case 136: case 137: case 138: case 146: case 149: case 162: case 163: case 165: case 167: case 168: case 169: case 170: case 171: case 172: case 183: case 191: case 192: case 193: case 195: case 196: case 197: case 199: case 200: case 215: case 216: case 217: case 219: case 220: case 221: case 222: case 223: case 225: case 226: case 227: case 236: case 253: case 274: case 275: case 276: case 277: case 278: case 279: case 297: case 306: case 308: case 324: case 332:
self.$ = $$[$0];
break;
case 13: case 14:
self.$ = $$[$0-2].addExpression($$[$0]);
break;
case 19: case 61:
self.$ = new yy.Literal($$[$0]);
break;
case 20:
self.$ = new yy.BreakStatement($$[$0]);
break;
case 21:
self.$ = new yy.BreakStatement($$[$0-3],$$[$0-1]);
break;
case 22:
self.$ = new yy.ContinueStatement($$[$0]);
break;
case 23:
self.$ = new yy.ContinueStatement($$[$0-3],$$[$0-1]);
break;
case 24:
self.$ = new yy.DebuggerStatement($$[$0]);
break;
case 26:
self.$ = new yy.ImportStatement($$[$0-2],$$[$0]);
break;
case 27:
self.$ = new yy.ImportStatement(null,$$[$0-2],$$[$0]);
break;
case 28:
self.$ = new yy.ImportStatement(null,$$[$0]);
break;
case 30: case 100: case 174: case 311:
self.$ = [$$[$0]];
break;
case 31: case 101: case 175:
self.$ = $$[$0-2].concat($$[$0]);
break;
case 50:
self.$ = new yy.Identifier($$[$0]);
break;
case 51: case 52:
self.$ = new yy.Ivar($$[$0]);
break;
case 53:
self.$ = new yy.Gvar($$[$0]);
break;
case 54:
self.$ = new yy.Const($$[$0]);
break;
case 55:
self.$ = new yy.Argvar($$[$0]);
break;
case 56:
self.$ = new yy.Symbol($$[$0]);
break;
case 57:
self.$ = new yy.Num($$[$0]);
break;
case 58:
self.$ = new yy.Str($$[$0]);
break;
case 62:
self.$ = new yy.RegExp($$[$0]);
break;
case 63:
self.$ = new yy.Bool($$[$0]);
break;
case 64: case 65:
self.$ = new yy.Return($$[$0]);
break;
case 66:
self.$ = new yy.Return();
break;
case 67:
self.$ = new yy.Selector([],{type: $$[$0]});
break;
case 68:
self.$ = $$[$0-1].add(new yy.SelectorType($$[$0]),'tag');
break;
case 69:
self.$ = $$[$0-1].add(new yy.SelectorNamespace($$[$0]),'ns');
break;
case 70:
self.$ = $$[$0-1].add(new yy.SelectorId($$[$0]),'id');
break;
case 71:
self.$ = $$[$0-1].add(new yy.SelectorClass($$[$0]),'class');
break;
case 72:
self.$ = $$[$0-4].add(new yy.SelectorClass($$[$0-1]),'class');
break;
case 73:
self.$ = $$[$0-4].add(new yy.SelectorId($$[$0-1]),'id');
break;
case 74:
self.$ = $$[$0-1].add(new yy.SelectorCombinator($$[$0]),'sep');
break;
case 75:
self.$ = $$[$0-1].add(new yy.SelectorPseudoClass($$[$0]),'pseudoclass');
break;
case 76:
self.$ = $$[$0-1].group();
break;
case 77:
self.$ = $$[$0-1].add(new yy.SelectorUniversal($$[$0]),'universal');
break;
case 78:
self.$ = $$[$0-3].add(new yy.SelectorAttribute($$[$0-1]),'attr');
break;
case 79:
self.$ = $$[$0-5].add(new yy.SelectorAttribute($$[$0-3],$$[$0-2],$$[$0-1]),'attr');
break;
case 80: case 89: case 118: case 119:
self.$ = new yy.TagTypeIdentifier($$[$0]);
break;
case 81: case 84: case 107: case 133: case 147: case 164:
self.$ = $$[$0-1];
break;
case 85:
self.$ = $$[$0-2].set({attributes: $$[$0-1]});
break;
case 86:
self.$ = $$[$0-3].set({attributes: $$[$0-2],body: $$[$0]});
break;
case 87:
self.$ = new yy.TagWrapper($$[$0-2],$$[$0-4],$$[$0]);
break;
case 90:
self.$ = new yy.TagTypeIdentifier('div');
break;
case 91:
self.$ = new yy.Tag({type: $$[$0]});
break;
case 92:
self.$ = $$[$0-2].addSymbol($$[$0]);
break;
case 93:
self.$ = $$[$0-3].addIndex($$[$0-1]);
break;
case 94:
self.$ = $$[$0-2].addClass($$[$0]);
break;
case 95:
self.$ = $$[$0-4].addClass($$[$0-1]);
break;
case 96:
self.$ = $$[$0-2].set({id: $$[$0]});
break;
case 97:
self.$ = $$[$0-1].set({ivar: $$[$0]});
break;
case 98:
self.$ = $$[$0-4].set({id: $$[$0-1]});
break;
case 99: case 173:
self.$ = [];
break;
case 102:
self.$ = $$[$0-3].concat($$[$0]);
break;
case 103:
self.$ = new yy.TagAttr($$[$0],$$[$0]);
break;
case 104:
self.$ = new yy.TagAttr($$[$0-2],$$[$0]);
break;
case 108:
self.$ = new yy.TagDesc($$[$0]);
break;
case 109:
self.$ = $$[$0-2].classes($$[$0]);
break;
case 111:
self.$ = $$[$0].set({extension: true});
break;
case 112:
self.$ = new yy.TagDeclaration($$[$0]);
break;
case 113:
self.$ = new yy.TagDeclaration($$[$0-1],null,$$[$0]);
break;
case 114:
self.$ = new yy.TagDeclaration($$[$0-2],$$[$0]);
break;
case 115:
self.$ = new yy.TagDeclaration($$[$0-3],$$[$0-1],$$[$0]);
break;
case 117:
self.$ = ['yy.extend'];
break;
case 120: case 121:
self.$ = new yy.TagId($$[$0]);
break;
case 122:
self.$ = new yy.Assign("=",$$[$0-2],$$[$0]);
break;
case 123:
self.$ = new yy.Assign("=",$$[$0-4],$$[$0-1].indented($$[$0-2],$$[$0]));
break;
case 124:
self.$ = new yy.ObjAttr($$[$0]);
break;
case 125:
self.$ = new yy.ObjAttr($$[$0-2],$$[$0],'object');
break;
case 126:
self.$ = new yy.ObjAttr($$[$0-4],$$[$0-1].indented($$[$0-2],$$[$0]),'object');
break;
case 134:
self.$ = new yy.Comment($$[$0],true);
break;
case 135:
self.$ = new yy.Comment($$[$0],false);
break;
case 139:
self.$ = new yy.Begin($$[$0]);
break;
case 140:
self.$ = new yy.Lambda([],$$[$0],null,null,{bound: true});
break;
case 141:
self.$ = new yy.Lambda($$[$0-2],$$[$0],null,null,{bound: true});
break;
case 142:
self.$ = new yy.Lambda($$[$0-3],$$[$0-1],null,null,{bound: true});
break;
case 143:
self.$ = new yy.PropertyDeclaration($$[$0-1],$$[$0],$$[$0-2]);
break;
case 144:
self.$ = (function (_0){
				return new yy.PropertyDeclaration($$[$0-3],$$[$0-1],_0);
			}());
break;
case 145:
self.$ = new yy.PropertyDeclaration($$[$0],null,$$[$0-1]);
break;
case 148:
self.$ = $$[$0-3];
break;
case 150: case 239:
self.$ = $$[$0].set({global: $$[$0-1]});
break;
case 151: case 190: case 240:
self.$ = $$[$0].set({export: $$[$0-1]});
break;
case 152:
self.$ = new yy.MethodDeclaration($$[$0-3],$$[$0],$$[$0-5],$$[$0-7],$$[$0-6]);
break;
case 153:
self.$ = new yy.MethodDeclaration([],$$[$0],$$[$0-2],$$[$0-4],$$[$0-3]);
break;
case 154:
self.$ = new yy.MethodDeclaration($$[$0-3],$$[$0],$$[$0-5],null);
break;
case 155:
self.$ = new yy.MethodDeclaration([],$$[$0],$$[$0-2],null);
break;
case 156:
self.$ = (function (){
				$$[$0].expressions = [new yy.Arr($$[$0].expressions)];
				return new yy.MethodDeclaration($$[$0-3],$$[$0],$$[$0-5],$$[$0-7],$$[$0-6]);
			}());
break;
case 157:
self.$ = (function (){
				$$[$0].expressions = [new yy.Arr($$[$0].expressions)];
				return new yy.MethodDeclaration([],$$[$0],$$[$0-2],$$[$0-4],$$[$0-3]);
			}());
break;
case 158:
self.$ = (function (){
				$$[$0].expressions = [new yy.Arr($$[$0].expressions)];
				return new yy.MethodDeclaration($$[$0-3],$$[$0],$$[$0-5],null);
			}());
break;
case 159:
self.$ = (function (){
				$$[$0].expressions = [new yy.Arr($$[$0].expressions)];
				return new yy.MethodDeclaration([],$$[$0],$$[$0-2],null);
			}());
break;
case 160:
self.$ = {static: true};
break;
case 161:
self.$ = {};
break;
case 166:
self.$ = $$[$0].body();
break;
case 176:
self.$ = new yy.NamedParams($$[$0]);
break;
case 177:
self.$ = new yy.ArrayParams($$[$0]);
break;
case 178:
self.$ = new yy.RequiredParam($$[$0]);
break;
case 179:
self.$ = new yy.SplatParam($$[$0],null,$$[$0-1]);
break;
case 180: case 181:
self.$ = new yy.BlockParam($$[$0],null,$$[$0-1]);
break;
case 182:
self.$ = new yy.OptionalParam($$[$0-2],$$[$0],$$[$0-1]);
break;
case 184:
self.$ = yy.SPLAT($$[$0]);
break;
case 185:
self.$ = new yy.Reference($$[$0-1],$$[$0]);
break;
case 186: case 189:
self.$ = yy.SPLAT(new yy.VarReference($$[$0],$$[$0-2]),$$[$0-1]);
break;
case 187: case 188:
self.$ = new yy.VarReference($$[$0],$$[$0-1]);
break;
case 194:
self.$ = new yy.IvarAccess('.',null,$$[$0]);
break;
case 198:
self.$ = new yy.VarOrAccess($$[$0]);
break;
case 201:
self.$ = new yy.New($$[$0-2]);
break;
case 202:
self.$ = new yy.SuperAccess('.',$$[$0-2],$$[$0]);
break;
case 203: case 208:
self.$ = new yy.PropertyAccess('.',$$[$0-2],$$[$0]);
break;
case 204: case 211:
self.$ = new yy.IvarAccess('.',$$[$0-2],$$[$0]);
break;
case 205: case 209:
self.$ = new yy.ObjectAccess('.',$$[$0-2],new yy.Identifier($$[$0].value()));
break;
case 206: case 210:
self.$ = new yy.ConstAccess('.',$$[$0-2],$$[$0]);
break;
case 207:
self.$ = yy.OP('.',$$[$0-2],new yy.Num($$[$0]));
break;
case 212: case 213:
self.$ = new yy.IndexAccess('.',$$[$0-3],$$[$0-1]);
break;
case 214:
self.$ = yy.SUPER;
break;
case 218:
self.$ = new yy.Await($$[$0]);
break;
case 224:
self.$ = yy.ARGUMENTS;
break;
case 228:
self.$ = new yy.Index($$[$0]);
break;
case 229:
self.$ = new yy.Slice($$[$0]);
break;
case 230:
self.$ = new yy.Obj($$[$0-2],$$[$0-3].generated);
break;
case 231:
self.$ = new yy.AssignList([]);
break;
case 232:
self.$ = new yy.AssignList([$$[$0]]);
break;
case 233: case 269:
self.$ = $$[$0-2].add($$[$0]);
break;
case 234: case 270:
self.$ = $$[$0-3].add($$[$0-1]).add($$[$0]);
break;
case 235:
self.$ = (function (){
				return $$[$0-5].concat($$[$0-2].indented($$[$0-3],$$[$0]));// hmmm
			}());
break;
case 237:
self.$ = $$[$0].set({extension: $$[$0-1]});
break;
case 238:
self.$ = $$[$0].set({local: $$[$0-1]});
break;
case 241:
self.$ = $$[$0].set({export: $$[$0-2],local: $$[$0-1]});
break;
case 242:
self.$ = new yy.ClassDeclaration($$[$0],null,[]);
break;
case 243:
self.$ = new yy.ClassDeclaration($$[$0-1],null,$$[$0]);
break;
case 244:
self.$ = new yy.ClassDeclaration($$[$0-2],$$[$0],[]);
break;
case 245:
self.$ = new yy.ClassDeclaration($$[$0-3],$$[$0-1],$$[$0]);
break;
case 246:
self.$ = new yy.Module($$[$0]);
break;
case 247:
self.$ = new yy.Module($$[$0-1],null,$$[$0]);
break;
case 248: case 249:
self.$ = new yy.Call($$[$0-2],$$[$0],$$[$0-1]);
break;
case 250:
self.$ = (function (){
				$$[$0-1].addBlock($$[$0]);
				return $$[$0-1];
			}());
break;
case 251:
self.$ = new yy.SuperReference(yy.SUPER);
break;
case 252:
self.$ = $$[$0-1].access($$[$01]);
break;
case 254:
self.$ = false;
break;
case 255:
self.$ = true;
break;
case 256:
self.$ = new yy.ArgList([]);
break;
case 257:
self.$ = $$[$0-2];
break;
case 258:
self.$ = new yy.This($$[$0]);
break;
case 259:
self.$ = new yy.Self($$[$0]);
break;
case 260:
self.$ = new yy.Arr(new yy.ArgList([]));
break;
case 261:
self.$ = new yy.Arr($$[$0-2]);
break;
case 262:
self.$ = '..';
break;
case 263:
self.$ = '...';
break;
case 264:
self.$ = yy.OP($$[$0-2],$$[$0-3],$$[$0-1]);
break;
case 265:
self.$ = new yy.Range($$[$0-2],$$[$0],$$[$0-1]);
break;
case 266:
self.$ = new yy.Range($$[$0-1],null,$$[$0]);
break;
case 267:
self.$ = new yy.Range(null,$$[$0],$$[$0-1]);
break;
case 268:
self.$ = new yy.ArgList([$$[$0]]);
break;
case 271:
self.$ = $$[$0-2].indented($$[$0-3],$$[$0]);
break;
case 272:
self.$ = $$[$0-5].concat($$[$0-2]);
break;
case 273:
self.$ = [$$[$0-1],$$[$0]];
break;
case 280:
self.$ = [].concat($$[$0-2],$$[$0]);
break;
case 281:
self.$ = new yy.Try($$[$0]);
break;
case 282:
self.$ = new yy.Try($$[$0-1],$$[$0]);
break;
case 283:
self.$ = new yy.Try($$[$0-1],null,$$[$0]);
break;
case 284:
self.$ = new yy.Try($$[$0-2],$$[$0-1],$$[$0]);
break;
case 285:
self.$ = new yy.Finally($$[$0]);
break;
case 286:
self.$ = new yy.Catch($$[$0],$$[$0-1]);
break;
case 287:
self.$ = new yy.Throw($$[$0]);
break;
case 288:
self.$ = new yy.Parens($$[$0-1]);
break;
case 289:
self.$ = new yy.Parens($$[$0-2]);
break;
case 290:
self.$ = new yy.While($$[$0]);
break;
case 291:
self.$ = new yy.While($$[$0-2],{guard: $$[$0]});
break;
case 292:
self.$ = new yy.While($$[$0],{invert: true});
break;
case 293:
self.$ = new yy.While($$[$0-2],{invert: true,guard: $$[$0]});
break;
case 294: case 302: case 303:
self.$ = $$[$0-1].addBody($$[$0]);
break;
case 295: case 296:
self.$ = $$[$0].addBody(yy.Block.wrap([$$[$0-1]]));
break;
case 298:
self.$ = new yy.While(new yy.Literal('true')).addBody($$[$0]);
break;
case 299:
self.$ = new yy.While(new yy.Literal('true')).addBody(yy.Block.wrap([$$[$0]]));
break;
case 300: case 301:
self.$ = $$[$0].addBody([$$[$0-1]]);
break;
case 304:
self.$ = {source: new yy.ValueNode($$[$0])};
break;
case 305:
self.$ = $$[$0].configure({own: $$[$0-1].own,name: $$[$0-1][0],index: $$[$0-1][1]});
break;
case 307:
self.$ = (function (){
				$$[$0].own = true;
				return $$[$0];
			}());
break;
case 309: case 310:
self.$ = new yy.ValueNode($$[$0]);
break;
case 312:
self.$ = [$$[$0-2],$$[$0]];
break;
case 313:
self.$ = new yy.ForIn({source: $$[$0]});
break;
case 314:
self.$ = new yy.ForOf({source: $$[$0],object: true});
break;
case 315:
self.$ = new yy.ForIn({source: $$[$0-2],guard: $$[$0]});
break;
case 316:
self.$ = new yy.ForOf({source: $$[$0-2],guard: $$[$0],object: true});
break;
case 317:
self.$ = new yy.ForIn({source: $$[$0-2],step: $$[$0]});
break;
case 318:
self.$ = new yy.ForIn({source: $$[$0-4],guard: $$[$0-2],step: $$[$0]});
break;
case 319:
self.$ = new yy.ForIn({source: $$[$0-4],step: $$[$0-2],guard: $$[$0]});
break;
case 320:
self.$ = new yy.Switch($$[$0-3],$$[$0-1]);
break;
case 321:
self.$ = new yy.Switch($$[$0-5],$$[$0-3],$$[$0-1]);
break;
case 322:
self.$ = new yy.Switch(null,$$[$0-1]);
break;
case 323:
self.$ = new yy.Switch(null,$$[$0-3],$$[$0-1]);
break;
case 325:
self.$ = $$[$0-1].concat($$[$0]);
break;
case 326:
self.$ = [new yy.SwitchCase($$[$0-1],$$[$0])];
break;
case 327:
self.$ = [new yy.SwitchCase($$[$0-2],$$[$0-1])];
break;
case 328:
self.$ = new yy.If($$[$0-1],$$[$0],{type: $$[$0-2]});
break;
case 329:
self.$ = $$[$0-4].addElse(new yy.If($$[$0-1],$$[$0],{type: $$[$0-2]}));
break;
case 330:
self.$ = $$[$0-3].addElse(new yy.If($$[$0-1],$$[$0],{type: $$[$0-2]}));
break;
case 331:
self.$ = $$[$0-2].addElse($$[$0]);
break;
case 333: case 334:
self.$ = new yy.If($$[$0],yy.Block.wrap([$$[$0-2]]),{type: $$[$0-1],statement: true});
break;
case 335:
self.$ = (function (){
				var ifblock = new yy.If($$[$0-4],yy.Block.wrap([$$[$0-2]]),{type: 'if'});
				ifblock.addElse(yy.Block.wrap([$$[$0]]));
				return ifblock;
			}());
break;
case 336: case 337:
self.$ = yy.OP($$[$0-1],$$[$0]);
break;
case 338:
self.$ = new yy.Op('-',$$[$0]);
break;
case 339:
self.$ = new yy.Op('+',$$[$0]);
break;
case 340:
self.$ = new yy.UnaryOp('--',null,$$[$0]);
break;
case 341:
self.$ = new yy.UnaryOp('++',null,$$[$0]);
break;
case 342:
self.$ = new yy.UnaryOp('--',$$[$0-1],null,true);
break;
case 343:
self.$ = new yy.UnaryOp('++',$$[$0-1],null,true);
break;
case 344:
self.$ = new yy.Existence($$[$0-1]);
break;
case 345:
self.$ = new yy.Op('+',$$[$0-2],$$[$0]);
break;
case 346:
self.$ = new yy.Op('-',$$[$0-2],$$[$0]);
break;
case 347: case 348: case 349: case 350:
self.$ = yy.OP($$[$0-1],$$[$0-2],$$[$0]);
break;
case 351:
self.$ = ($$[$0-1].charAt(0) == '!') ? (
					yy.OP($$[$0-1].slice(1),$$[$0-2],$$[$0]).invert()// hmm, really?
				) : (
					yy.OP($$[$0-1],$$[$0-2],$$[$0])
				);
break;
case 352:
self.$ = yy.OP_COMPOUND($$[$0-1]._value,$$[$0-1],$$[$0-2],$$[$0]);
break;
case 353:
self.$ = yy.OP_COMPOUND($$[$0-3]._value,$$[$0-4],$$[$0-1].indented($$[$0-2],$$[$0]));
break;
}
},
table: [{1:[2,1],3:1,4:2,5:3,7:4,9:$V0,11:6,12:7,14:8,15:9,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,125:$Vs,126:$Vt,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,155:$VB,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{1:[3]},{1:[2,2],6:$VZ,8:123},{6:[1,125]},o($V_,[2,4],{13:$V$}),{4:128,6:[1,129],7:4,10:[1,127],11:6,12:7,14:8,15:9,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,125:$Vs,126:$Vt,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,155:$VB,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($V01,[2,11]),o($V01,[2,12],{203:105,194:139,200:140,112:$V11,156:$V21,195:$VN,197:$VO,202:$VQ,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),o($V01,[2,15]),o($V01,[2,16],{203:105,194:142,200:143,195:$VN,197:$VO,202:$VQ,219:$Va1}),{12:144,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($Vb1,[2,33]),o($Vb1,[2,34],{176:146,61:149,20:$Vc1,62:$Vd,77:$Vd1,99:$Ve1,179:$Vf1}),o($Vb1,[2,35],{176:151,128:152,20:$Vc1,77:$Vg1,78:$Vh1,99:$Vi1,131:$Vv,179:$Vf1}),o($Vb1,[2,36]),o($Vb1,[2,37]),o($Vb1,[2,38]),o($Vb1,[2,39]),o($Vb1,[2,40]),o($Vb1,[2,41]),o($Vb1,[2,42]),o($Vb1,[2,43]),o($Vb1,[2,44]),o($Vb1,[2,45]),o($Vb1,[2,46]),o($Vb1,[2,47]),o($Vb1,[2,48]),o($Vb1,[2,49]),o($Vj1,[2,134]),o($Vj1,[2,135]),o($Vk1,[2,17]),o($Vk1,[2,18]),o($Vk1,[2,19]),o($Vk1,[2,20],{20:[1,156]}),o($Vk1,[2,22],{20:[1,157]}),o($Vk1,[2,24]),o($Vk1,[2,25]),{12:158,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($Vl1,$Vm1,{104:[1,159]}),o($Vl1,[2,220]),o($Vl1,[2,221]),o($Vl1,[2,222]),o($Vl1,[2,223]),o($Vl1,[2,224]),o($Vl1,[2,225]),o($Vl1,[2,226]),o($Vl1,[2,227]),o($Vb1,[2,136]),o($Vb1,[2,137]),o($Vb1,[2,138]),{12:160,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{12:161,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{12:162,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{12:163,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{31:$V6,34:165,35:166,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,71:87,72:$Vj,78:$Vn1,80:$Vl,85:$Vm,90:46,98:96,116:45,117:$Vq,118:168,123:$Vr,137:76,139:$Vx,142:$Vo1,151:44,153:75,158:99,159:98,160:$VC,161:164,163:39,165:$VD,167:41,168:42,169:$VF,180:$VJ,181:$VK},{31:$V6,34:165,35:166,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,71:87,72:$Vj,78:$Vn1,80:$Vl,85:$Vm,90:46,98:96,116:45,117:$Vq,118:168,123:$Vr,137:76,139:$Vx,142:$Vo1,151:44,153:75,158:99,159:98,160:$VC,161:170,163:39,165:$VD,167:41,168:42,169:$VF,180:$VJ,181:$VK},o($Vp1,$Vq1,{225:[1,171],226:[1,172],230:[1,173]}),o($Vb1,[2,332],{213:[1,174],218:[1,175]}),{5:176,9:$V0},{5:177,9:$V0},o($Vb1,[2,297]),{5:178,9:$V0},{9:[1,180],12:179,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($Vb1,[2,236]),{108:182,110:$Vp,172:181,174:$VH},{172:183,174:$VH},{140:185,143:$VA,172:184,174:$VH},{139:$Vx,140:188,142:$Vo1,143:$VA,159:189,160:$VC,172:186,173:[1,187],174:$VH},{31:$V6,34:165,35:166,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,71:87,72:$Vj,78:$Vn1,80:$Vl,85:$Vm,90:46,98:96,116:45,117:$Vq,118:168,123:$Vr,137:76,139:$Vx,142:$Vo1,151:44,153:75,158:99,159:98,160:$VC,161:190,163:39,165:$VD,167:41,168:42,169:$VF,180:$VJ,181:$VK},o($Vb1,[2,110]),o($Vr1,[2,90],{93:191,97:193,98:194,51:[1,195],78:[1,192],181:$VK}),{50:197,51:$V7,78:[1,198],136:196},o($Vk1,[2,66],{33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,16:30,17:31,24:36,118:38,163:39,65:40,167:41,168:42,151:44,116:45,90:46,127:47,128:48,129:49,161:56,216:57,194:59,198:60,200:61,172:63,108:69,153:75,137:76,63:78,71:87,140:88,57:92,52:93,55:94,59:95,98:96,50:97,159:98,158:99,203:105,61:110,15:145,12:199,70:200,18:$V1,19:$V2,20:$Vs1,22:$V3,23:$V4,25:$V5,31:$V6,51:$V7,53:$V8,54:$V9,56:$Va,58:$Vb,60:$Vc,62:$Vd,64:$Ve,66:$Vf,67:$Vg,68:$Vh,69:$Vi,72:$Vj,78:$Vk,80:$Vl,85:$Vm,92:$Vn,109:$Vo,110:$Vp,117:$Vq,123:$Vr,130:$Vu,131:$Vv,135:$Vw,139:$Vx,141:$Vy,142:$Vz,143:$VA,160:$VC,165:$VD,166:$VE,169:$VF,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,199:$VP,211:$VR,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY}),{12:202,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{26:203,28:204,30:205,31:$Vt1,32:207,50:209,51:$V7,57:208,58:$Vb},o($Vp1,[2,216]),o($Vp1,[2,217]),o($Vu1,[2,214]),o($Vl1,[2,60]),o($Vl1,[2,61]),o($Vl1,[2,62]),o($Vl1,[2,63]),{4:210,7:4,9:[1,211],11:6,12:7,14:8,15:9,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,125:$Vs,126:$Vt,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,155:$VB,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{9:$Vv1,11:217,12:212,14:219,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,86:$Vw1,90:46,92:$Vn,98:96,106:214,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,125:$Vs,126:$Vt,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,155:$VB,156:$Vx1,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,185:215,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o([1,6,9,10,13,20,21,62,77,79,80,86,95,99,100,112,122,124,134,156,179,183,184,195,196,197,202,210,219,220,223,224,227,228,229],[2,258]),o($Vl1,[2,120]),{50:220,51:$V7},{73:222,74:[1,223],75:[1,224],76:[1,225],77:[1,226],80:[1,227],81:[1,228],82:[1,229],83:[1,230],84:[1,231],85:[1,232],89:[1,233],91:[1,221]},o($Vb1,[2,149]),{5:234,9:$V0,132:[1,235]},o($Vy1,$Vz1,{61:110,171:237,120:238,121:239,14:240,50:241,57:242,63:243,52:244,55:245,31:$V6,51:$V7,53:$V8,54:$V9,56:$Va,58:$Vb,62:$Vd,64:$Ve,123:$VA1,125:$Vs,126:$Vt,132:$VB1}),{5:247,9:$V0},o($Vu1,[2,193]),o($Vu1,[2,194]),o($Vu1,[2,195]),o($Vu1,[2,196]),o($Vu1,[2,197]),o($Vu1,[2,198]),o($Vu1,[2,199]),o($Vu1,[2,200]),{12:248,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{12:249,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{12:250,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{5:251,9:$V0,12:252,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{50:257,51:$V7,78:$Vn1,85:$Vm,137:259,153:258,168:253,205:254,206:[1,255],207:256},{204:260,208:[1,261],209:[1,262]},{31:$V6,34:165,35:166,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,71:87,72:$Vj,78:$Vn1,80:$Vl,85:$Vm,90:46,98:96,116:45,117:$Vq,118:168,123:$Vr,137:76,139:$Vx,142:$Vo1,151:44,153:75,158:99,159:98,160:$VC,161:263,163:39,165:$VD,167:41,168:42,169:$VF,180:$VJ,181:$VK},{111:264,114:$VC1,115:$VD1},o($Vl1,[2,57]),o($Vl1,[2,58]),o($Vl1,[2,59]),o($VE1,[2,67]),{50:272,51:$V7,55:271,56:$Va,57:273,58:$Vb,78:$VF1,98:270,144:267,146:268,151:269,180:$VJ,181:$VK},o([1,6,9,10,13,20,21,27,62,77,79,80,86,95,99,100,104,112,122,124,134,147,149,156,179,183,184,195,196,197,202,210,219,220,223,224,225,226,227,228,229,230],[2,54]),o($VG1,[2,51]),o($VG1,[2,52]),o([1,6,9,10,13,20,21,62,77,79,80,86,95,99,100,104,112,122,124,134,156,179,183,184,195,196,197,202,210,219,220,223,224,225,226,227,228,229,230],[2,53]),o($Vu1,[2,55]),o($VG1,[2,259]),o([1,6,9,10,13,20,21,27,62,77,78,79,80,86,87,95,99,100,104,112,122,124,134,147,149,156,179,183,184,195,196,197,202,208,209,210,219,220,223,224,225,226,227,228,229,230],[2,50]),{32:276,50:209,51:$V7,57:208,58:$Vb,155:[1,275]},{32:277,50:209,51:$V7,57:208,58:$Vb,155:[1,278]},o($Vu1,[2,56]),o($V_,[2,6],{11:6,12:7,14:8,15:9,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,16:30,17:31,24:36,118:38,163:39,65:40,167:41,168:42,151:44,116:45,90:46,127:47,128:48,129:49,161:56,216:57,194:59,198:60,200:61,172:63,108:69,153:75,137:76,63:78,71:87,140:88,57:92,52:93,55:94,59:95,98:96,50:97,159:98,158:99,203:105,61:110,7:279,18:$V1,19:$V2,22:$V3,23:$V4,25:$V5,31:$V6,51:$V7,53:$V8,54:$V9,56:$Va,58:$Vb,60:$Vc,62:$Vd,64:$Ve,66:$Vf,67:$Vg,68:$Vh,69:$Vi,72:$Vj,78:$Vk,80:$Vl,85:$Vm,92:$Vn,109:$Vo,110:$Vp,117:$Vq,123:$Vr,125:$Vs,126:$Vt,130:$Vu,131:$Vv,135:$Vw,139:$Vx,141:$Vy,142:$Vz,143:$VA,155:$VB,160:$VC,165:$VD,166:$VE,169:$VF,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,195:$VN,197:$VO,199:$VP,202:$VQ,211:$VR,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY}),o([1,6,10,18,19,22,23,25,31,51,53,54,56,58,60,62,64,66,67,68,69,72,78,80,85,92,109,110,117,123,124,125,126,130,131,135,139,141,142,143,155,156,160,165,166,169,173,174,175,180,181,187,193,195,197,199,202,211,217,221,222,223,224,225,226],[2,7]),{1:[2,3]},{11:281,12:280,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,155:$VB,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($VH1,[2,8]),{6:$VZ,8:123,10:[1,282]},{4:283,7:4,11:6,12:7,14:8,15:9,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,125:$Vs,126:$Vt,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,155:$VB,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o([1,6,9,10,13,21,79,86,95,100,112,122,124,134,156,183,184,195,196,197,202,210,219,220,227,228,229],[2,344],{33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,16:30,17:31,24:36,118:38,163:39,65:40,167:41,168:42,151:44,116:45,90:46,127:47,128:48,129:49,161:56,216:57,194:59,198:60,200:61,172:63,108:69,153:75,137:76,63:78,71:87,140:88,57:92,52:93,55:94,59:95,98:96,50:97,159:98,158:99,203:105,61:110,15:145,12:284,18:$V1,19:$V2,22:$V3,23:$V4,25:$V5,31:$V6,51:$V7,53:$V8,54:$V9,56:$Va,58:$Vb,60:$Vc,62:$Vd,64:$Ve,66:$Vf,67:$Vg,68:$Vh,69:$Vi,72:$Vj,78:$Vk,80:$Vl,85:$Vm,92:$Vn,109:$Vo,110:$Vp,117:$Vq,123:$Vr,130:$Vu,131:$Vv,135:$Vw,139:$Vx,141:$Vy,142:$Vz,143:$VA,160:$VC,165:$VD,166:$VE,169:$VF,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,199:$VP,211:$VR,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY}),{12:285,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{12:286,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{12:287,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{12:288,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{12:289,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{12:290,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{12:291,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{12:292,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($Vb1,[2,296]),o($Vb1,[2,301]),{12:293,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($Vb1,[2,295]),o($Vb1,[2,300]),o([1,6,9,10,13,21,86,124],[2,184],{203:105,194:139,200:140,112:$V11,156:$V21,195:$VN,197:$VO,202:$VQ,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),{194:142,195:$VN,197:$VO,200:143,202:$VQ,203:105,219:$Va1},{20:$Vs1,70:294},{50:297,51:$V7,52:298,53:$V8,54:$V9,57:300,58:$Vb,61:299,62:$Vd,64:[1,301],162:[1,295],163:296,165:$VD},{12:303,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,164:302,165:$VD,166:$VE,167:41,168:42,169:$VF,170:304,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,182:305,183:$VI1,184:$VJ1,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($Vu1,[2,185]),{20:[2,255]},{20:$Vs1,70:308},o($VK1,[2,250]),{50:309,51:$V7,52:312,53:$V8,54:$V9,57:311,58:$Vb,61:310,62:$Vd},{12:303,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,164:313,165:$VD,166:$VE,167:41,168:42,169:$VF,170:304,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,182:305,183:$VI1,184:$VJ1,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{132:$VB1},{12:314,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{12:315,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($VL1,[2,218],{203:105,194:139,200:140,112:$V11,156:$V21,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),{9:[1,317],12:316,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($Vb1,[2,336],{203:105,194:139,200:140}),o($Vb1,[2,337],{203:105,194:139,200:140}),o($Vb1,[2,338],{203:105,194:139,200:140}),o($Vb1,[2,339],{203:105,194:139,200:140}),o($Vb1,[2,340],{20:$Vq1,62:$Vq1,77:$Vq1,99:$Vq1,179:$Vq1}),{20:$Vc1,61:149,62:$Vd,77:$Vd1,99:$Ve1,176:146,179:$Vf1},{20:$Vc1,77:$Vg1,78:$Vh1,99:$Vi1,128:152,131:$Vv,176:151,179:$Vf1},{139:$Vx,142:$Vo1,159:189,160:$VC},o([20,62,77,99,179],$Vm1),o($Vy1,$Vz1,{61:110,171:237,120:238,121:239,14:240,50:241,57:242,63:243,52:244,55:245,31:$V6,51:$V7,53:$V8,54:$V9,56:$Va,58:$Vb,62:$Vd,64:$Ve,123:$VA1,125:$Vs,126:$Vt}),o($Vb1,[2,341],{20:$Vq1,62:$Vq1,77:$Vq1,99:$Vq1,179:$Vq1}),o($Vb1,[2,342]),o($Vb1,[2,343]),{9:[1,319],12:318,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{5:321,9:$V0,217:[1,320]},{12:322,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($Vb1,[2,281],{188:323,189:324,190:$VM1,191:[1,325]}),o($Vb1,[2,294]),o($Vb1,[2,302]),{9:[1,327],112:$V11,156:$V21,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},{212:328,214:329,215:$VN1},o($Vb1,[2,237]),o($Vb1,[2,111]),o($Vb1,[2,238]),o($Vb1,[2,239]),o($Vb1,[2,150]),o($Vb1,[2,240]),{172:331,174:$VH},o($Vb1,[2,151]),o($Vu1,[2,190]),o($VO1,[2,246],{5:332,9:$V0,20:$Vq1,62:$Vq1,77:$Vq1,99:$Vq1,179:$Vq1}),o($VP1,[2,99],{94:333,52:337,101:338,53:$V8,54:$V9,77:[1,334],80:[1,336],99:[1,335],103:$VQ1}),{12:340,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($Vr1,[2,91]),o($Vr1,[2,88]),o($Vr1,[2,89]),o($Vb1,[2,145],{137:341,20:[1,342],78:$Vn1}),o($VR1,[2,146]),{12:343,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($Vk1,[2,64],{203:105,194:139,200:140,112:$V11,156:$V21,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),o($Vk1,[2,65]),{9:$Vv1,11:217,12:346,14:219,15:145,16:30,17:31,18:$V1,19:$V2,21:[1,344],22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,106:345,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,125:$Vs,126:$Vt,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,155:$VB,156:$Vx1,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,185:215,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($Vk1,[2,287],{203:105,194:139,200:140,112:$V11,156:$V21,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),{13:[1,348],27:[1,347]},o($Vk1,[2,28],{29:[1,349]}),o($VS1,[2,30]),o([1,6,10,13,29,124,195,197,202,219],[2,29]),o([1,6,10,13,27,124,195,197,202,219],[2,32]),o($VT1,[2,191]),o($VT1,[2,192]),{6:$VZ,8:123,124:[1,350]},{4:351,7:4,11:6,12:7,14:8,15:9,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,125:$Vs,126:$Vt,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,155:$VB,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o([6,9,13,86],$VU1,{203:105,194:139,200:140,182:352,112:$V11,156:$V21,183:$VI1,184:$VJ1,195:$VN,197:$VO,202:$VQ,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),o($VV1,[2,260]),o([6,9,86],$VW1,{102:353,13:$VX1}),o($VY1,[2,268]),{9:$Vv1,11:217,12:346,14:219,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,106:355,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,125:$Vs,126:$Vt,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,155:$VB,156:$Vx1,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,185:215,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($VY1,[2,276]),o($VY1,[2,277]),o($VY1,[2,278]),o($Vl1,[2,121]),o($Vl1,[2,81]),o($VE1,[2,68]),o($VE1,[2,69]),o($VE1,[2,70]),o($VE1,[2,71]),{78:[1,356]},{78:[1,357]},o($VE1,[2,74]),o($VE1,[2,75]),o($VE1,[2,76]),o($VE1,[2,77]),{50:358,51:$V7},o($VE1,[2,80]),o($VK1,[2,140]),o($VZ1,$V_1,{133:359,152:360,137:361,153:362,154:363,50:368,51:$V7,78:$Vn1,85:$V$1,155:$V02,156:$V12,157:$V22}),o($VZ1,$V_1,{152:360,137:361,153:362,154:363,50:368,133:369,51:$V7,78:$Vn1,85:$V$1,155:$V02,156:$V12,157:$V22}),o([6,9,79],$VW1,{102:370,13:$V32}),o($V42,[2,232]),o($V42,[2,124],{122:[1,372]}),o($V42,[2,127]),o($V52,[2,128]),o($V52,[2,129]),o($V52,[2,130]),o($V52,[2,131]),o($V52,[2,132]),{12:373,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($Vb1,[2,139]),{5:374,9:$V0,112:$V11,156:$V21,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},o($V62,[2,290],{203:105,194:139,200:140,112:$V11,156:$V21,195:$VN,196:[1,375],197:$VO,202:$VQ,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),o($V62,[2,292],{203:105,194:139,200:140,112:$V11,156:$V21,195:$VN,196:[1,376],197:$VO,202:$VQ,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),o($Vb1,[2,298]),o($V72,[2,299],{203:105,194:139,200:140,112:$V11,156:$V21,195:$VN,197:$VO,202:$VQ,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),o($Vb1,[2,304]),o($V82,[2,306]),{50:257,51:$V7,78:$Vn1,85:$V$1,137:259,153:258,205:377,207:256},o($V82,[2,311],{13:[1,378]}),o($V92,[2,308]),o($V92,[2,309]),o($V92,[2,310]),o($Vb1,[2,305]),{12:379,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{12:380,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($Va2,[2,242],{5:381,9:$V0,20:$Vq1,62:$Vq1,77:$Vq1,99:$Vq1,179:$Vq1,112:[1,382]}),o($Va2,[2,112],{5:383,9:$V0,112:[1,384]}),o($Vb1,[2,118]),o($Vb1,[2,119]),{77:[1,386],80:[1,387],145:385},o($Vb2,[2,167],{20:[1,388],147:[1,389],149:[1,390]}),o($Vb2,[2,168]),o($Vb2,[2,169]),o($Vb2,[2,170]),o($Vc2,[2,162]),o($Vc2,[2,163]),{12:391,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{32:392,50:209,51:$V7,57:208,58:$Vb},o($Vu1,[2,187]),o($Vu1,[2,188]),{32:393,50:209,51:$V7,57:208,58:$Vb},o($V_,[2,5],{13:$V$}),o($V01,[2,13],{203:105,194:139,200:140,112:$V11,156:$V21,195:$VN,197:$VO,202:$VQ,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),o($V01,[2,14]),o($VH1,[2,9]),{6:$VZ,8:123,10:[1,394]},{112:$V11,122:[1,395],156:$V21,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},o($Vd2,[2,345],{203:105,194:139,200:140,227:$V71}),o($Vd2,[2,346],{203:105,194:139,200:140,227:$V71}),o($Vb1,[2,347],{203:105,194:139,200:140}),o([1,6,9,10,13,21,79,86,95,100,112,122,124,134,156,183,184,195,196,197,202,210,219,220,228,229],[2,348],{203:105,194:139,200:140,223:$V51,224:$V61,227:$V71}),o([1,6,9,10,13,21,79,86,95,100,112,122,124,134,156,183,184,195,196,197,202,210,219,220],[2,349],{203:105,194:139,200:140,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),o([1,6,9,10,13,21,79,86,95,100,122,124,134,156,183,184,195,196,197,202,210,219,220],[2,350],{203:105,194:139,200:140,112:$V11,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),o([1,6,9,10,13,21,79,86,95,100,112,122,124,134,156,183,184,195,196,197,202,210,219,220,229],[2,351],{203:105,194:139,200:140,223:$V51,224:$V61,227:$V71,228:$V81}),o($Ve2,[2,334],{203:105,194:139,200:140,112:$V11,156:$V21,195:$VN,197:$VO,202:$VQ,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),o($Ve2,[2,333],{203:105,194:139,200:140,112:$V11,156:$V21,195:$VN,197:$VO,202:$VQ,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),o($VK1,[2,248]),o($Vu1,[2,201]),o($Vu1,[2,202]),o($Vu1,[2,203]),o($Vu1,[2,204]),o($Vu1,[2,205]),o($Vu1,[2,206]),o($Vu1,[2,207]),{100:[1,396]},{100:[2,228],112:$V11,156:$V21,182:397,183:$VI1,184:$VJ1,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},{100:[2,229]},{12:398,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($Vf2,[2,262]),o($Vf2,[2,263]),o($VK1,[2,249]),o($Vu1,[2,208]),o($Vu1,[2,209]),o($Vu1,[2,210]),o($Vu1,[2,211]),{100:[1,399]},{21:[1,400],112:$V11,156:$V21,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},{21:[1,401],112:$V11,156:$V21,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},o($VL1,[2,122],{203:105,194:139,200:140,112:$V11,156:$V21,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),{12:402,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($VL1,[2,352],{203:105,194:139,200:140,112:$V11,156:$V21,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),{12:403,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{12:404,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($Vg2,[2,331]),{5:405,9:$V0,112:$V11,156:$V21,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},o($Vb1,[2,282],{189:406,190:$VM1}),o($Vb1,[2,283]),{192:[1,407]},{5:408,9:$V0},{212:409,214:329,215:$VN1},{10:[1,410],213:[1,411],214:412,215:$VN1},o($Vh2,[2,324]),{12:414,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,186:413,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($Vb1,[2,241]),o($Vb1,[2,247]),{6:$VW1,13:[1,416],95:[1,415],102:417},{51:[1,419],62:[1,418],78:[1,420]},{12:421,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{51:[1,422],78:[1,423]},o($Vr1,[2,97]),o($VP1,[2,100]),o($VP1,[2,103],{104:[1,424]}),{79:[1,425],112:$V11,156:$V21,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},o($Vb1,[2,143]),{78:$Vn1,137:426},{79:[1,427],112:$V11,156:$V21,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},o($VK1,[2,256]),o([6,9,21],$VW1,{102:428,13:$VX1}),o($VY1,$VU1,{203:105,194:139,200:140,112:$V11,156:$V21,195:$VN,197:$VO,202:$VQ,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),{28:429,31:$Vt1},{30:430,32:207,50:209,51:$V7,57:208,58:$Vb},{30:431,32:207,50:209,51:$V7,57:208,58:$Vb},o($Vl1,[2,288]),{6:$VZ,8:123,10:[1,432]},{12:433,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{6:$VZ,8:435,9:$Vi2,86:[1,434]},o([6,9,10,21,86],$Vj2,{33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,16:30,17:31,24:36,118:38,163:39,65:40,167:41,168:42,151:44,116:45,90:46,127:47,128:48,129:49,161:56,216:57,194:59,198:60,200:61,172:63,108:69,153:75,137:76,63:78,71:87,140:88,57:92,52:93,55:94,59:95,98:96,50:97,159:98,158:99,203:105,61:110,15:145,11:217,14:219,12:346,185:437,18:$V1,19:$V2,22:$V3,23:$V4,25:$V5,31:$V6,51:$V7,53:$V8,54:$V9,56:$Va,58:$Vb,60:$Vc,62:$Vd,64:$Ve,66:$Vf,67:$Vg,68:$Vh,69:$Vi,72:$Vj,78:$Vk,80:$Vl,85:$Vm,92:$Vn,109:$Vo,110:$Vp,117:$Vq,123:$Vr,125:$Vs,126:$Vt,130:$Vu,131:$Vv,135:$Vw,139:$Vx,141:$Vy,142:$Vz,143:$VA,155:$VB,156:$Vx1,160:$VC,165:$VD,166:$VE,169:$VF,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,195:$VN,197:$VO,199:$VP,202:$VQ,211:$VR,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY}),o($Vk2,$VW1,{102:438,13:$VX1}),{12:439,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{12:440,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{86:[1,441],87:[1,442]},{13:$Vl2,134:[1,443]},o($Vm2,[2,174]),o($Vm2,[2,176]),o($Vm2,[2,177]),o($Vm2,[2,178],{104:[1,445]}),{50:368,51:$V7,154:446},{50:368,51:$V7,154:447},{50:368,51:$V7,154:448},{9:$Vv1,11:217,12:346,14:219,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,86:$Vw1,90:46,92:$Vn,98:96,106:214,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,125:$Vs,126:$Vt,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,155:$VB,156:$Vx1,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,185:215,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o([13,21,104,134],[2,183]),{13:$Vl2,134:[1,449]},{6:$VZ,8:451,9:$Vn2,79:[1,450]},o([6,9,10,79],$Vj2,{61:110,121:239,14:240,50:241,57:242,63:243,52:244,55:245,120:453,31:$V6,51:$V7,53:$V8,54:$V9,56:$Va,58:$Vb,62:$Vd,64:$Ve,123:$VA1,125:$Vs,126:$Vt}),{9:[1,455],12:454,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{112:$V11,124:[1,456],156:$V21,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},o($Vg2,[2,328]),{12:457,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{12:458,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($V82,[2,307]),{50:257,51:$V7,78:$Vn1,85:$V$1,137:259,153:258,207:459},o([1,6,9,10,13,21,79,86,95,100,122,124,134,183,184,195,197,202,219],[2,313],{203:105,194:139,200:140,112:$V11,156:$V21,196:[1,460],210:[1,461],220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),o($Vo2,[2,314],{203:105,194:139,200:140,112:$V11,156:$V21,196:[1,462],220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),o($Vb1,[2,243]),{12:463,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($Vb1,[2,113]),{111:464,114:$VC1,115:$VD1},{50:272,51:$V7,57:273,58:$Vb,78:$VF1,146:465},o($Vp2,[2,160]),o($Vp2,[2,161]),o($Vq2,$V_1,{152:360,137:361,153:362,154:363,50:368,133:466,51:$V7,78:$Vn1,85:$V$1,155:$V02,156:$V12,157:$V22}),{5:468,9:$V0,78:$Vh1,128:469,131:$Vv,148:467},{5:468,9:$V0,78:$Vh1,128:469,131:$Vv,148:470},{79:[1,471],112:$V11,156:$V21,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},o($Vu1,[2,186]),o($Vu1,[2,189]),o($VH1,[2,10]),{12:472,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($Vu1,[2,212]),{12:473,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,100:[2,266],108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{100:[2,267],112:$V11,156:$V21,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},o($Vu1,[2,213]),o($Vk1,[2,21]),o($Vk1,[2,23]),{6:$VZ,8:475,10:$Vr2,112:$V11,119:474,156:$V21,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},{6:$VZ,8:475,10:$Vr2,112:$V11,119:477,156:$V21,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},{5:478,9:$V0,112:$V11,156:$V21,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},o($Vg2,[2,330]),o($Vb1,[2,284]),{5:479,9:$V0},o($Vb1,[2,285]),{10:[1,480],213:[1,481],214:412,215:$VN1},o($Vb1,[2,322]),{5:482,9:$V0},o($Vh2,[2,325]),{5:483,9:$V0,13:[1,484]},o($Vs2,[2,279],{203:105,194:139,200:140,112:$V11,156:$V21,195:$VN,197:$VO,202:$VQ,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),o($VO1,[2,85],{96:485,9:[1,486],20:[1,487]}),{6:$Vj2,101:488,103:$VQ1},{6:[1,489]},o($Vr1,[2,92]),o($Vr1,[2,94]),{12:490,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{100:[1,491],112:$V11,156:$V21,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},o($Vr1,[2,96]),{12:492,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{12:494,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,105:493,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{95:[1,495]},{21:[1,496]},o($VR1,[2,147]),{6:$VZ,8:435,9:$Vi2,21:[1,497]},o($Vk1,[2,26]),o($VS1,[2,31]),o($Vk1,[2,27]),{124:[1,498]},{86:[1,499],112:$V11,156:$V21,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},o($VV1,[2,261]),{11:217,12:346,14:219,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,125:$Vs,126:$Vt,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,155:$VB,156:$Vx1,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,185:500,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{9:$Vv1,11:217,12:346,14:219,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,106:501,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,125:$Vs,126:$Vt,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,155:$VB,156:$Vx1,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,185:215,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($VY1,[2,269]),{6:$VZ,8:503,9:$Vi2,10:$Vr2,119:502},{79:[1,504],112:$V11,156:$V21,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},{79:[1,505],112:$V11,156:$V21,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},o($VE1,[2,78]),{31:$V6,51:[1,507],61:110,62:$Vd,63:508,64:$Ve,78:[1,509],88:506},{5:510,9:$V0},{50:368,51:$V7,78:$Vn1,85:$V$1,137:361,152:511,153:362,154:363,155:$V02,156:$V12,157:$V22},{12:512,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($Vm2,[2,179]),o($Vm2,[2,180]),o($Vm2,[2,181]),{5:513,9:$V0},o($VV1,[2,230]),{14:240,31:$V6,50:241,51:$V7,52:244,53:$V8,54:$V9,55:245,56:$Va,57:242,58:$Vb,61:110,62:$Vd,63:243,64:$Ve,120:514,121:239,123:$VA1,125:$Vs,126:$Vt},o([6,9,10,13],$Vz1,{61:110,120:238,121:239,14:240,50:241,57:242,63:243,52:244,55:245,171:515,31:$V6,51:$V7,53:$V8,54:$V9,56:$Va,58:$Vb,62:$Vd,64:$Ve,123:$VA1,125:$Vs,126:$Vt}),o($V42,[2,233]),o($V42,[2,125],{203:105,194:139,200:140,112:$V11,156:$V21,195:$VN,197:$VO,202:$VQ,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),{12:516,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($V52,[2,133]),o($V72,[2,291],{203:105,194:139,200:140,112:$V11,156:$V21,195:$VN,197:$VO,202:$VQ,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),o($V72,[2,293],{203:105,194:139,200:140,112:$V11,156:$V21,195:$VN,197:$VO,202:$VQ,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),o($V82,[2,312]),{12:517,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{12:518,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{12:519,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o([1,6,10,13,21,79,86,95,100,122,124,134,183,184,196,210,219],[2,244],{203:105,194:139,200:140,5:520,9:$V0,112:$V11,156:$V21,195:$VN,197:$VO,202:$VQ,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),o($VO1,[2,114],{5:521,9:$V0}),{20:[1,522],147:[1,523],149:[1,524]},{13:$Vl2,21:[1,525]},o($Vb1,[2,155]),o($Vb1,[2,165]),o($Vb1,[2,166]),o($Vb1,[2,159]),o($Vc2,[2,164]),o([1,6,9,10,13,21,79,86,95,100,122,124,134,183,184,195,196,197,202,210,219,220],[2,335],{203:105,194:139,200:140,112:$V11,156:$V21,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),{100:[2,265],112:$V11,156:$V21,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},o($Vb1,[2,123]),{10:$Vt2},o($Vb1,[2,274]),o($Vb1,[2,353]),o($Vg2,[2,329]),o([1,6,9,10,13,21,79,86,95,100,112,122,124,134,156,183,184,190,195,196,197,202,210,219,220,223,224,227,228,229],[2,286]),o($Vb1,[2,320]),{5:527,9:$V0},{10:[1,528]},o($Vh2,[2,326],{6:[1,529]}),{12:530,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($Vb1,[2,86]),{9:$Vv1,11:217,12:346,14:219,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,106:531,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,125:$Vs,126:$Vt,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,155:$VB,156:$Vx1,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,185:215,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{9:$Vv1,11:217,12:346,14:219,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,106:532,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,125:$Vs,126:$Vt,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,155:$VB,156:$Vx1,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,185:215,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($VP1,[2,101]),{101:533,103:$VQ1},{79:[1,534],112:$V11,156:$V21,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},o($Vr1,[2,93]),{79:[1,535],112:$V11,156:$V21,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},o($VP1,[2,104]),o($VP1,[2,105],{203:105,194:139,200:140,112:$V11,156:$V21,195:$VN,197:$VO,202:$VQ,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),o($Vb1,[2,87]),o($Vb1,[2,144]),o($VK1,[2,257]),o($Vl1,[2,289]),o($Vl1,[2,264]),o($VY1,[2,270]),o($Vk2,$VW1,{102:536,13:$VX1}),o($VY1,[2,271]),{10:$Vt2,11:217,12:346,14:219,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,125:$Vs,126:$Vt,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,155:$VB,156:$Vx1,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,185:500,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($VE1,[2,72]),o($VE1,[2,73]),{86:[1,537]},{86:[2,82]},{86:[2,83]},{12:538,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},o($VK1,[2,141]),o($Vm2,[2,175]),o($Vm2,[2,182],{203:105,194:139,200:140,112:$V11,156:$V21,195:$VN,197:$VO,202:$VQ,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),{79:[1,539]},o($V42,[2,234]),o($Vk2,$VW1,{102:540,13:$V32}),{6:$VZ,8:475,10:$Vr2,112:$V11,119:541,156:$V21,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},o([1,6,9,10,13,21,79,86,95,100,122,124,134,183,184,195,196,197,202,219],[2,315],{203:105,194:139,200:140,112:$V11,156:$V21,210:[1,542],220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),o($Vo2,[2,317],{203:105,194:139,200:140,112:$V11,156:$V21,196:[1,543],220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),o($VL1,[2,316],{203:105,194:139,200:140,112:$V11,156:$V21,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),o($Vb1,[2,245]),o($Vb1,[2,115]),o($Vq2,$V_1,{152:360,137:361,153:362,154:363,50:368,133:544,51:$V7,78:$Vn1,85:$V$1,155:$V02,156:$V12,157:$V22}),{5:468,9:$V0,78:$Vh1,128:469,131:$Vv,148:545},{5:468,9:$V0,78:$Vh1,128:469,131:$Vv,148:546},{147:[1,547],149:[1,548]},o($Vb1,[2,273]),{6:$VZ,8:475,10:$Vr2,119:549},o($Vb1,[2,323]),o($Vh2,[2,327]),o($Vs2,[2,280],{203:105,194:139,200:140,112:$V11,156:$V21,195:$VN,197:$VO,202:$VQ,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),o($Vu2,$VW1,{102:551,10:[1,550],13:$VX1}),o($Vu2,$VW1,{102:551,13:$VX1,21:[1,552]}),o($VP1,[2,102]),o($Vr1,[2,95]),o($Vr1,[2,98]),{6:$VZ,8:503,9:$Vi2,10:$Vr2,119:553},o($VE1,[2,79]),{79:[1,554],112:$V11,156:$V21,194:139,195:$VN,197:$VO,200:140,202:$VQ,203:105,219:$V31,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91},o($VK1,[2,142]),{6:$VZ,8:556,9:$Vn2,10:$Vr2,119:555},o($V42,[2,126]),{12:557,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{12:558,15:145,16:30,17:31,18:$V1,19:$V2,22:$V3,23:$V4,24:36,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:97,51:$V7,52:93,53:$V8,54:$V9,55:94,56:$Va,57:92,58:$Vb,59:95,60:$Vc,61:110,62:$Vd,63:78,64:$Ve,65:40,66:$Vf,67:$Vg,68:$Vh,69:$Vi,71:87,72:$Vj,78:$Vk,80:$Vl,85:$Vm,90:46,92:$Vn,98:96,108:69,109:$Vo,110:$Vp,116:45,117:$Vq,118:38,123:$Vr,127:47,128:48,129:49,130:$Vu,131:$Vv,135:$Vw,137:76,139:$Vx,140:88,141:$Vy,142:$Vz,143:$VA,151:44,153:75,158:99,159:98,160:$VC,161:56,163:39,165:$VD,166:$VE,167:41,168:42,169:$VF,172:63,173:$VG,174:$VH,175:$VI,180:$VJ,181:$VK,187:$VL,193:$VM,194:59,195:$VN,197:$VO,198:60,199:$VP,200:61,202:$VQ,203:105,211:$VR,216:57,217:$VS,221:$VT,222:$VU,223:$VV,224:$VW,225:$VX,226:$VY},{13:$Vl2,21:[1,559]},o($Vb1,[2,153]),o($Vb1,[2,157]),{5:468,9:$V0,78:$Vh1,128:469,131:$Vv,148:560},{5:468,9:$V0,78:$Vh1,128:469,131:$Vv,148:561},o($Vb1,[2,321]),o($Vb1,[2,106]),{6:$VZ,8:435,9:$Vi2},o($Vb1,[2,107]),o($VY1,[2,272]),{86:[2,84]},o($V42,[2,235]),{10:$Vt2,14:240,31:$V6,50:241,51:$V7,52:244,53:$V8,54:$V9,55:245,56:$Va,57:242,58:$Vb,61:110,62:$Vd,63:243,64:$Ve,120:514,121:239,123:$VA1,125:$Vs,126:$Vt},o($VL1,[2,318],{203:105,194:139,200:140,112:$V11,156:$V21,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),o($VL1,[2,319],{203:105,194:139,200:140,112:$V11,156:$V21,220:$V41,223:$V51,224:$V61,227:$V71,228:$V81,229:$V91}),{147:[1,562],149:[1,563]},o($Vb1,[2,154]),o($Vb1,[2,158]),{5:468,9:$V0,78:$Vh1,128:469,131:$Vv,148:564},{5:468,9:$V0,78:$Vh1,128:469,131:$Vv,148:565},o($Vb1,[2,152]),o($Vb1,[2,156])],
defaultActions: {125:[2,3],150:[2,255],304:[2,229],507:[2,82],508:[2,83],554:[2,84]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {

    // For Imba we are going to drop most of the features that are not used
    // Locations are provided by the tokens from the lexer directly - so drop yylloc
    // We dont really need the shared state (it seems)

    var self = this,
        stack = [0],
        tstack = [], // token stack
        vstack = [null], // semantic value stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    // var args = lstack.slice.call(arguments, 1);
    //this.reductionCount = this.shiftCount = 0;

    var lexer = Object.create(this.lexer);
    var yy = this.yy;

    lexer.setInput(input,yy);

    if (typeof yy.parseError === 'function') {
        this.parseError = yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError; // what?
    }

    function popStack (n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
    }

_token_stack:
    function lex() {
        var token = lexer.lex() || EOF;
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }

    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;


    function handleError(){
        var error_rule_depth;
        var errStr = '';

        // Return the rule stack depth where the nearest error rule can be found.
        // Return FALSE when no error recovery rule was found.
        // we have no rules now
        function locateNearestErrorRecoveryRule(state) {
            console.log('locateNearestErrorRecoveryRule');
            var stack_probe = stack.length - 1;
            var depth = 0;

            // try to recover from error
            for(;;) {
                // check for error recovery rule in this state
                if ((TERROR.toString()) in table[state]) {
                    return depth;
                }
                if (state === 0 || stack_probe < 2) {
                    return false; // No suitable error recovery rule available.
                }
                stack_probe -= 2; // popStack(1): [symbol, action]
                state = stack[stack_probe];
                ++depth;
            }
        }

        if (!recovering) {
            // first see if there's any chance at hitting an error recovery rule:
            error_rule_depth = locateNearestErrorRecoveryRule(state);

            // Report error
            expected = [];

            // Remove for v8 optim - could move out to separate fn
            // for (p in table[state]) {
            //     if (this.terminals_[p] && p > TERROR) {
            //         expected.push("'"+this.terminals_[p]+"'");
            //     }
            // }

            if (lexer.showPosition) {
                errStr = 'Parse error on line '+(yylineno+1)+":\n"+lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + (self.terminals_[symbol] || symbol)+ "'";
            } else {
                errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " + (symbol == EOF ? "end of input" : ("'"+(self.terminals_[symbol] || symbol)+"'"));
            }

            self.parseError(errStr, {
                text: lexer.match,
                token: self.terminals_[symbol] || symbol,
                line: lexer.yylineno,
                expected: expected,
                recoverable: (error_rule_depth !== false)
            });
        } else if (preErrorSymbol !== EOF) {
            error_rule_depth = locateNearestErrorRecoveryRule(state);
        }

        // just recovered from another error
        if (recovering == 3) {
            if (symbol === EOF || preErrorSymbol === EOF) {
                throw new Error(errStr || 'Parsing halted while starting to recover from another error.');
            }

            // discard current lookahead and grab another
            yyleng = lexer.yyleng;
            yytext = lexer.yytext;
            yylineno = lexer.yylineno;
            symbol = lex();
        }

        // try to recover from error
        if (error_rule_depth === false) {
            throw new Error(errStr || 'Parsing halted. No suitable error recovery rule available.');
        }
        popStack(error_rule_depth);
        preErrorSymbol = (symbol == TERROR ? null : symbol); // save the lookahead token
        symbol = TERROR;         // insert generic error symbol as new lookahead
        state = stack[stack.length-1];
        action = table[state] && table[state][TERROR];
        recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
    }


    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length - 1];

        // use default actions if available
        // if (this.defaultActions[state]) {
        //     action = this.defaultActions[state];
        // } else {
        if (symbol === null || typeof symbol == 'undefined') {
            symbol = lex();
        }
        // read action for current state and first input
        action = table[state] && table[state][symbol];
        // }

_handle_error:
        // handle parse error
        if (typeof action === 'undefined' || !action.length || !action[0]) {
            handleError();
        }

        // this shouldn't happen, unless resolve defaults are off
        // if (action[0] instanceof Array && action.length > 1) {
        //     throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        // }

        switch (action[0]) {
            case 1: // shift
                //this.shiftCount++;

                stack.push(symbol);
                vstack.push(lexer.yytext);
                // lstack.push(lexer.yylloc);
                stack.push(action[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = lexer.yyleng;
                    yytext = lexer.yytext;
                    yylineno = lexer.yylineno;
                    if (recovering > 0) {
                        recovering--;
                    }
                } else {
                    // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2:
                // reduce
                //this.reductionCount++;

                len = this.productions_[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1

                // default location, uses first token for firsts, last for lasts
                // yyval._$ = {
                //     first_line: lstack[lstack.length-(len||1)].first_line,
                //     last_line: lstack[lstack.length-1].last_line,
                //     first_column: lstack[lstack.length-(len||1)].first_column,
                //     last_column: lstack[lstack.length-1].last_column
                // };
                // if (ranges) {
                //   yyval._$.range = [lstack[lstack.length-(len||1)].range[0], lstack[lstack.length-1].range[1]];
                // }

                // We dont use most of the args supplied by jison
                // r = this.performAction.apply(yyval, [yytext, yyleng, yylineno, sharedState.yy, action[1], vstack, lstack].concat(args));
                r = this.performAction(yyval, yytext, yyleng, yylineno, yy, action[1], vstack);

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                    // lstack = lstack.slice(0, -1*len);
                }

                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                // lstack.push(yyval._$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3:
                // accept
                return true;
        }

    }

    return true;
}};

function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
}).call(this,require('_process'))
},{"_process":19,"fs":17,"path":18}],7:[function(require,module,exports){
(function(){


	function idx$(a,b){
		return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
	};
	
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	var INVERSES;
	var T = require('./token');
	var Token = T.Token;
	
	// Based on the original rewriter.coffee from CoffeeScript
	/* @class Rewriter */
	function Rewriter(){ };
	
	exports.Rewriter = Rewriter; // export class 
	Rewriter.prototype.tokens = function (){
		var x = 1000;
		return this._tokens;
	};
	
	// Helpful snippet for debugging:
	//     console.log (t[0] + '/' + t[1] for t in @tokens).join ' '
	// Rewrite the token stream in multiple passes, one logical filter at
	// a time. This could certainly be changed into a single pass through the
	// stream, with a big ol' efficient switch, but it's much nicer to work with
	// like this. The order of these passes matters -- indentation must be
	// corrected before implicit parentheses can be wrapped around blocks of code.
	Rewriter.prototype.rewrite = function (tokens,opts){
		if(opts === undefined) opts = {};
		this._tokens = tokens;
		this._options = opts;
		
		if(opts.profile) {
			console.time("tokenize:rewrite");
		};
		
		this.step("removeLeadingNewlines");
		this.step("removeMidExpressionNewlines");
		this.step("moveMidExpressionComments");
		this.step("tagDefArguments");
		this.step("closeOpenCalls");
		this.step("closeOpenIndexes");
		this.step("closeOpenTags");
		this.step("closeOpenRawIndexes");
		this.step("closeOpenTagAttrLists");
		this.step("addImplicitIndentation");
		this.step("tagPostfixConditionals");
		this.step("addImplicitBraces");
		this.step("addImplicitParentheses");
		
		if(opts.profile) {
			console.timeEnd("tokenize:rewrite");
		};
		
		return this._tokens;
	};
	
	Rewriter.prototype.step = function (fn){
		if(this._options.profile) {
			console.log(("---- starting " + fn + " ---- "));
			console.time(fn);
		};
		
		this[fn]();
		
		if(this._options.profile) {
			console.timeEnd(fn);
			console.log("\n\n");
		};
		return;
	};
	
	// Rewrite the token stream, looking one token ahead and behind.
	// Allow the return value of the block to tell us how many tokens to move
	// forwards (or backwards) in the stream, to make sure we don't miss anything
	// as tokens are inserted and removed, and the stream changes length under
	// our feet.
	Rewriter.prototype.scanTokens = function (block){
		var tokens = this._tokens;
		
		var i = 0;
		var token;
		while(token = tokens[i]){
			i += block.call(this,token,i,tokens);
		};
		
		return true;
	};
	
	Rewriter.prototype.detectEnd = function (i,condition,action){
		var tokens = this._tokens;
		var levels = 0;
		var starts = [];
		var token;
		var t,v;
		
		while(token = tokens[i]){
			if(levels == 0 && condition.call(this,token,i,starts)) {
				return action.call(this,token,i);
			};
			if(!token || levels < 0) {
				return action.call(this,token,i - 1);
			};
			
			t = T.typ(token);
			
			if(idx$(t,EXPRESSION_START) >= 0) {
				if(levels == 0) {
					starts.push(i);
				};
				levels += 1;
			} else if(idx$(t,EXPRESSION_END) >= 0) {
				levels -= 1;
			};
			i += 1;
		};
		return i - 1;
	};
	
	// Leading newlines would introduce an ambiguity in the grammar, so we
	// dispatch them here.
	Rewriter.prototype.removeLeadingNewlines = function (){
		var at = 0;
		for(var i=0, ary=iter$(this._tokens), len=ary.length; i < len; i++) {
			if(T.typ(ary[i]) != 'TERMINATOR') {
				at = i;break;
			};
		};
		
		return this._tokens.splice(0,at);
	};
	
	// Some blocks occur in the middle of expressions -- when we're expecting
	// this, remove their trailing newlines.
	Rewriter.prototype.removeMidExpressionNewlines = function (){
		var self=this;
		return self.scanTokens(function (token,i,tokens){
			var next = self.tokenType(i + 1);
			
			if(!(T.typ(token) == 'TERMINATOR' && idx$(next,EXPRESSION_CLOSE) >= 0)) {
				return 1;
			};
			if(next == 'OUTDENT') {
				return 1;
			};
			tokens.splice(i,1);
			return 0;
		});
	};
	
	Rewriter.prototype.moveMidExpressionComments = function (){
		var self=this;
		var terminator = -1;
		
		return this.scanTokens(function (token,i,tokens){
			var t = T.typ(token);
			// console.log(token[0])
			if(t == 'TERMINATOR') {
				terminator = i;
				return 1;
			};
			
			if(t == 'INLINECOMMENT') {
				self._tokens.splice(i,1);
				if(terminator == -1) {
					return 0;
				};// hmm
				
				self._tokens.splice(terminator + 1,0,T.token('HERECOMMENT',T.val(token)),T.token('TERMINATOR','\n'));
				// console.log("found inline comment!",terminator)
				return 2;
			};
			return 1;
		});
	};
	
	Rewriter.prototype.tagDefArguments = function (){
		return true;
	};
	
	// The lexer has tagged the opening parenthesis of a method call. Match it with
	// its paired close. We have the mis-nested outdent case included here for
	// calls that close on the same line, just before their outdent.
	Rewriter.prototype.closeOpenCalls = function (){
		var self=this;
		var condition = function (token,i){
			var t = T.typ(token);
			return idx$(t,[')','CALL_END']) >= 0 || t == 'OUTDENT' && self.tokenType(i - 1) == ')';
		};
		
		var action = function (token,i){
			var t = T.typ(token);
			var tok = self._tokens[(t == 'OUTDENT') ? (i - 1) : (i)];
			return T.setTyp(tok,'CALL_END');
			// [0] = 'CALL_END'
		};
		
		return self.scanTokens(function (token,i){
			if(T.typ(token) == 'CALL_START') {
				self.detectEnd(i + 1,condition,action);
			};
			return 1;
		});
	};
	
	// The lexer has tagged the opening parenthesis of an indexing operation call.
	// Match it with its paired close.
	Rewriter.prototype.closeOpenIndexes = function (){
		var self=this;
		var condition = function (token,i){
			return idx$(T.typ(token),[']','INDEX_END']) >= 0;
		};
		var action = function (token,i){
			return T.setTyp(token,'INDEX_END');
		};
		
		return self.scanTokens(function (token,i){
			if(T.typ(token) == 'INDEX_START') {
				self.detectEnd(i + 1,condition,action);
			};
			return 1;
		});
	};
	
	// The lexer has tagged the opening parenthesis of an indexing operation call.
	// Match it with its paired close.
	Rewriter.prototype.closeOpenRawIndexes = function (){
		var self=this;
		var condition = function (token,i){
			return idx$(T.typ(token),['}','RAW_INDEX_END']) >= 0;
		};
		var action = function (token,i){
			return T.setTyp(token,'RAW_INDEX_END');
		};
		
		return self.scanTokens(function (token,i){
			if(T.typ(token) == 'RAW_INDEX_START') {
				self.detectEnd(i + 1,condition,action);
			};
			return 1;
		});
	};
	
	Rewriter.prototype.closeOpenTagAttrLists = function (){
		var self=this;
		var condition = function (token,i){
			return idx$(T.typ(token),[')','TAG_ATTRS_END']) >= 0;
		};
		var action = function (token,i){
			return T.setTyp(token,'TAG_ATTRS_END');
		};// 'TAG_ATTRS_END'
		
		return self.scanTokens(function (token,i){
			if(T.typ(token) == 'TAG_ATTRS_START') {
				self.detectEnd(i + 1,condition,action);
			};
			return 1;
		});
	};
	
	// The lexer has tagged the opening parenthesis of an indexing operation call.
	// Match it with its paired close.
	Rewriter.prototype.closeOpenTags = function (){
		var self=this;
		var condition = function (token,i){
			return idx$(T.typ(token),['>','TAG_END']) >= 0;
		};
		var action = function (token,i){
			return T.setTyp(token,'TAG_END');
		};// token[0] = 'TAG_END'
		
		return self.scanTokens(function (token,i){
			if(T.typ(token) == 'TAG_START') {
				self.detectEnd(i + 1,condition,action);
			};
			return 1;
		});
	};
	
	Rewriter.prototype.addImplicitCommas = function (){
		return;
	};
	
	Rewriter.prototype.addImplicitBlockCalls = function (){
		return this.scanTokens(function (token,i,tokens){
			var prev = tokens[i - 1] || [];
			var t = T.typ(prev);
			var v = T.val(prev);
			// next = tokens[i+1]
			
			if(t == 'DO' && idx$(v,['RAW_INDEX_END','INDEX_END','IDENTIFIER','NEW']) >= 0) {
				tokens.splice(i,0,T.token('CALL_END',')'));
				tokens.splice(i,0,T.token('CALL_START','('));
				return 2;
			};
			return 1;
		});
	};
	
	// Object literals may be written with implicit braces, for simple cases.
	// Insert the missing braces here, so that the parser doesn't have to.
	Rewriter.prototype.addImplicitBraces = function (){
		var self=this;
		var stack = [];
		var start = null;
		var startIndent = 0;
		var startIdx = null;
		
		var scope = function (){
			return stack[stack.length - 1] || [];
		};
		
		var action = function (token,i){
			var tok = T.token('}','}',T.loc(token));
			tok.generated = true;
			return self._tokens.splice(i,0,tok);
		};
		
		var open = function (token,i){
			var value = new String('{');
			value.generated = true;// drop this?!
			var tok = T.token('{',value,T.loc(token));
			// T.setLoc(tok,T.loc(token)) # , token[2]]
			tok.generated = true;
			return self._tokens.splice(i,0,tok);
			
			// s = ["{",i]
			// s:generated = true
			// stack.push(s)
		};
		
		var close = function (token,i){
			var tok = T.token('}','}',T.loc(token));
			tok.generated = true;
			return self._tokens.splice(i,0,tok);
		};
		
		var stackToken = function (a,b){
			return [a,b];
			// var ctx = scope() #  hmmm??
		};
		
		return self.scanTokens(function (token,i,tokens){
			var type = T.typ(token);
			var v = T.val(token);
			var ctx = stack[stack.length - 1] || [];
			var idx;
			
			
			
			if(v == '?') {
				stack.push(stackToken('TERNARY',i));
				return 1;
			};
			
			if(idx$(type,EXPRESSION_START) >= 0) {
				if(type == 'INDENT' && self.tokenType(i - 1) == '{') {
					stack.push(stackToken('{',i));// should not autogenerate another?
				} else {
					stack.push(stackToken(type,i));
				};
				return 1;
			};
			
			if(idx$(type,EXPRESSION_END) >= 0) {
				if(ctx[0] == 'TERNARY') {
					stack.pop();
				};
				
				start = stack.pop();
				if(!start) {
					console.log("NO STACK!!");
				};
				start[2] = i;
				
				// console.log('the end-expression was',start[0])
				
				// if start[0] == 'INDENT'
				//   console.log('was indent?')
				
				// seems like the stack should use tokens, no?)
				if(start[0] == '{' && start.generated) {
					close(token,i);
					// hmm - are we sure that we should only return one here?
					return 1;
				};
				
				return 1;
			};
			
			
			if(ctx[0] == 'TERNARY' && idx$(type,['TERMINATOR','OUTDENT']) >= 0) {
				stack.pop();
				return 1;
			};
			
			
			if(type == ',') {
				if(scope()[0] == '{' && scope().generated) {
					action.call(this,token,i);
					stack.pop();
					// console.log('scope was curly braces')
					return 2;
				} else {
					return 1;
				};
				true;
			};
			
			// found a type
			if(type == ':' && idx$(ctx[0],['{','TERNARY']) == -1) {
				if(start && start[2] == i - 1) {
					idx = start[1] - 1;// these are the stackTokens
				} else {
					idx = i - 2;// if start then start[1] - 1 else i - 2
					// idx = idx - 1 if tokenType(idx) is 'TERMINATOR'
				};
				
				while(self.tokenType(idx - 1) == 'HERECOMMENT'){
					idx -= 2;
				};
				
				// idx -= 1 if tokenType(idx - 1) is ','
				var t0 = self._tokens[idx - 1];
				// t1 = ago = @tokens[idx]
				// console.log(idx,t0,t1)
				// t = @tokens
				// console.log(t[i-4],t[i-3],t[i-2],t[i-1])
				
				if(t0 && T.typ(t0) == '}' && t0.generated) {
					self._tokens.splice(idx - 1,1);
					var s = stackToken('{');
					s.generated = true;
					stack.push(s);
					return 0;
				} else if(t0 && T.typ(t0) == ',' && self.tokenType(idx - 2) == '}') {
					self._tokens.splice(idx - 2,1);
					s = stackToken('{');
					s.generated = true;
					stack.push(s);
					return 0;
				} else {
					s = stackToken('{');
					s.generated = true;
					stack.push(s);
					open(token,idx + 1);
					return 2;
				};
			};
			
			// we probably need to run through autocall first?!
			
			if(type == 'DO') {
				var prev = T.typ(tokens[i - 1]);// [0]
				if(idx$(prev,['NUMBER','STRING','REGEX','SYMBOL',']','}',')']) >= 0) {
					var tok = T.token(',',',');
					tok.generated = true;
					self._tokens.splice(i,0,tok);
					
					if(ctx.generated) {
						close(token,i);
						stack.pop();
						return 2;
					};
				};
			};
			
			if(idx$(type,['TERMINATOR','OUTDENT','DEF_BODY']) >= 0 && ctx.generated) {
				close(token,i);
				stack.pop();
				return 2;
			};
			
			return 1;
		});
	};
	
	// Methods may be optionally called without parentheses, for simple cases.
	// Insert the implicit parentheses here, so that the parser doesn't have to
	// deal with them.
	// Practically everything will now be callable this way (every identifier)
	Rewriter.prototype.addImplicitParentheses = function (){
		var self=this;
		var noCall = false;
		var noCallTag = ['CLASS','IF','UNLESS','TAG','WHILE','FOR','UNTIL','CATCH','FINALLY','MODULE','LEADING_WHEN'];
		
		var action = function (token,i){
			return self._tokens.splice(i,0,T.token('CALL_END',')',T.loc(token)));
		};
		
		// console.log "adding implicit parenthesis" # ,self:scanTokens
		
		return self.scanTokens(function (token,i,tokens){
			var type = T.typ(token);
			
			// Never make these tags implicitly call
			if(idx$(type,noCallTag) >= 0) {
				noCall = true;
			};
			
			var prev = tokens[i - 1];
			var current = tokens[i];
			var next = tokens[i + 1];
			
			var pt = prev && T.typ(prev);
			var nt = next && T.typ(next);
			// [prev, current, next] = tokens[i - 1 .. i + 1]
			
			// check for comments
			// console.log "detect end??"
			var callObject = !noCall && type == 'INDENT' && next && ((next.generated && nt == '{') || (idx$(nt,IMPLICIT_CALL) >= 0)) && prev && idx$(pt,IMPLICIT_FUNC) >= 0;
			// new test
			var callIndent = !noCall && type == 'INDENT' && next && idx$(nt,IMPLICIT_CALL) >= 0 && prev && idx$(pt,IMPLICIT_FUNC) >= 0;
			
			var seenSingle = false;
			var seenControl = false;
			// Hmm ?
			// this is not correct if this is inside a block,no?
			if(idx$(type,['TERMINATOR','OUTDENT','INDENT']) >= 0) {
				noCall = false;
			};
			
			if(prev && !(prev.spaced) && type == '?') {
				token.call = true;
			};
			
			// where does fromThem come from?
			if(token.fromThen) {
				return 1;
			};
			// here we deal with :spaced and :newLine
			if(!(callObject || callIndent || (prev && prev.spaced) && (prev.call || idx$(pt,IMPLICIT_FUNC) >= 0) && (idx$(type,IMPLICIT_CALL) >= 0 || !(token.spaced || token.newLine) && idx$(type,IMPLICIT_UNSPACED_CALL) >= 0))) {
				return 1;
			};
			
			tokens.splice(i,0,T.token('CALL_START','(',T.loc(token)));
			
			var cond = function (token,i){
				var type = T.typ(token);
				if(!seenSingle && token.fromThen) {
					return true;
				};
				if(idx$(type,['IF','UNLESS','ELSE','CATCH','->','=>']) >= 0) {
					seenSingle = true;
				};
				if(idx$(type,['IF','UNLESS','ELSE','SWITCH','TRY']) >= 0) {
					seenControl = true;
				};
				var prev = self.tokenType(i - 1);
				
				if(idx$(type,['.','?.','::']) >= 0 && prev == 'OUTDENT') {
					return true;
				};
				
				var post = self._tokens[i + 1];
				var postTyp = post && T.typ(post);
				// WTF
				return !(token.generated) && prev != ',' && (idx$(type,IMPLICIT_END) >= 0 || (type == 'INDENT' && !seenControl) || (type == 'DOS' && idx$(prev,['=']) == -1)) && (type != 'INDENT' || (self.tokenType(i - 2) != 'CLASS' && idx$(prev,IMPLICIT_BLOCK) == -1 && !(post && ((post.generated && postTyp == '{') || idx$(postTyp,IMPLICIT_CALL) >= 0))));
			};
			
			// The action for detecting when the call should end
			// console.log "detect end??"
			self.detectEnd(i + 1,cond,action);
			if(T.typ(prev) == '?') {
				T.setTyp(prev,'FUNC_EXIST');
				// prev[0] = 'FUNC_EXIST' 
			};
			return 2;
		});
	};
	
	// Because our grammar is LALR(1), it can't handle some single-line
	// expressions that lack ending delimiters. The **Rewriter** adds the implicit
	// blocks, so it doesn't need to. ')' can close a single-line block,
	// but we need to make sure it's balanced.
	Rewriter.prototype.addImplicitIndentation = function (){
		var self=this;
		return self.scanTokens(function (token,i,tokens){
			var ary;
			var type = T.typ(token);
			var next = self.tokenType(i + 1);
			
			if(type == 'TERMINATOR' && next == 'THEN') {
				tokens.splice(i,1);
				return 0;
			};
			
			if(type == 'CATCH' && idx$(self.tokenType(i + 2),['OUTDENT','TERMINATOR','FINALLY']) >= 0) {
				tokens.splice.apply(tokens,[].concat([i + 2,0], [].slice.call(self.indentation(token))));// hmm ...
				return 4;
			};
			
			if(idx$(type,SINGLE_LINERS) >= 0 && idx$(next,['INDENT','BLOCK_PARAM_START']) == -1 && !(type == 'ELSE' && next == 'IF') && type != 'ELIF') {
				var starter = type;
				
				var ary=iter$(self.indentation(token));var indent = ary[(0)],outdent = ary[(1)];
				if(starter == 'THEN') {
					indent.fromThen = true;
				};
				indent.generated = outdent.generated = true;
				tokens.splice(i + 1,0,indent);
				
				// outerStarter = starter
				// outerOutdent = outdent
				
				var condition = function (token,i){
					var t = T.typ(token);
					return T.val(token) != ';' && idx$(t,SINGLE_CLOSERS) >= 0 && !(t == 'ELSE' && idx$(starter,['IF','THEN']) == -1);
				};
				
				var action = function (token,i){
					var idx = (self.tokenType(i - 1) == ',') ? (i - 1) : (i);
					return self._tokens.splice(idx,0,outdent);
				};
				
				self.detectEnd(i + 2,condition,action);
				if(type == 'THEN') {
					tokens.splice(i,1);
				};
				return 1;
			};
			return 1;
		});
	};
	
	// Tag postfix conditionals as such, so that we can parse them with a
	// different precedence.
	Rewriter.prototype.tagPostfixConditionals = function (){
		var self=this;
		var condition = function (token,i){
			return idx$(T.typ(token),['TERMINATOR','INDENT']) >= 0;
		};
		
		return self.scanTokens(function (token,i){
			if(!(T.typ(token) == 'IF')) {
				return 1;
			};
			var original = token;
			self.detectEnd(i + 1,condition,function (token,i){
				return (T.typ(token) != 'INDENT') && (T.setTyp(original,'POST_' + T.typ(original)));
				// original[0] = 'POST_' + original[0] if token[0] isnt 'INDENT'
			});
			return 1;
		});
	};
	
	// Generate the indentation tokens, based on another token on the same line.
	Rewriter.prototype.indentation = function (token){
		return [T.token('INDENT',2,T.loc(token)),T.token('OUTDENT',2,T.loc(token))];
	};
	
	// Look up a type by token index.
	Rewriter.prototype.type = function (i){
		var tok = this._tokens[i];
		return tok && T.typ(tok);
		// if tok then tok[0] else null
	};
	
	Rewriter.prototype.tokenType = function (i){
		var tok = this._tokens[i];
		return tok && T.typ(tok);
		// return tok and tok[0]
	};
	
	
	// Constants
	// ---------
	
	// List of the token pairs that must be balanced.
	var BALANCED_PAIRS = [
		['(',')'],
		['[',']'],
		['{','}'],
		['INDENT','OUTDENT'],
		['CALL_START','CALL_END'],
		['PARAM_START','PARAM_END'],
		['INDEX_START','INDEX_END'],
		['RAW_INDEX_START','RAW_INDEX_END'],
		['TAG_START','TAG_END'],
		['TAG_PARAM_START','TAG_PARAM_END'],
		['TAG_ATTRS_START','TAG_ATTRS_END'],
		['BLOCK_PARAM_START','BLOCK_PARAM_END']
	];
	
	// The inverse mappings of `BALANCED_PAIRS` we're trying to fix up, so we can
	// look things up from either end.
	module.exports.INVERSES = INVERSES = {};
	
	// The tokens that signal the start/end of a balanced pair.
	EXPRESSION_START = [];
	EXPRESSION_END = [];
	
	for(var i=0, ary=iter$(BALANCED_PAIRS), len=ary.length, pair; i < len; i++) {
		pair = ary[i];var left = pair[0];
		var rite = pair[1];
		EXPRESSION_START.push(INVERSES[rite] = left);
		EXPRESSION_END.push(INVERSES[left] = rite);
	};
	
	var IDENTIFIERS = ['IDENTIFIER','GVAR','IVAR','CVAR','CONST','ARGVAR'];
	
	// Tokens that indicate the close of a clause of an expression.
	var EXPRESSION_CLOSE = ['CATCH','WHEN','ELSE','FINALLY'].concat(EXPRESSION_END);
	
	// Tokens that, if followed by an `IMPLICIT_CALL`, indicate a function invocation.
	var IMPLICIT_FUNC = ['IDENTIFIER','SUPER',')',']','INDEX_END','@','THIS','SELF','EVENT','TRIGGER','RAW_INDEX_END','TAG_END','IVAR',
	'GVAR','CONST','ARGVAR','NEW','BREAK','CONTINUE','RETURN'];
	
	// If preceded by an `IMPLICIT_FUNC`, indicates a function invocation.
	var IMPLICIT_CALL = [
		'SELECTOR','IDENTIFIER','NUMBER','STRING','SYMBOL','JS','REGEX','NEW','PARAM_START','CLASS',
		'IF','UNLESS','TRY','SWITCH','THIS','BOOL','UNARY','SUPER','IVAR','GVAR','CONST','ARGVAR','SELF',
		'NEW','@','[','(','{','--','++','SELECTOR','TAG_START','TAGID','#','SELECTOR_START','IDREF','SPLAT','DO','BLOCK_ARG'
	];// '->', '=>', why does it not work with symbol?
	// is not do an implicit call??
	
	var IMPLICIT_UNSPACED_CALL = ['+','-'];
	
	// Tokens indicating that the implicit call must enclose a block of expressions.
	var IMPLICIT_BLOCK = ['{','[',',','BLOCK_PARAM_END','DO'];// '->', '=>', 
	
	var CONDITIONAL_ASSIGN = ['||=','&&=','?=','&=','|='];
	var COMPOUND_ASSIGN = ['-=','+=','/=','*=','%=','||=','&&=','?=','<<=','>>=','>>>=','&=','^=','|='];
	var UNARY = ['!','~','NEW','TYPEOF','DELETE'];
	var LOGIC = ['&&','||','&','|','^'];
	
	var NO_IMPLICIT_BLOCK_CALL = ['CALL_END','=','DEF_BODY','(','CALL_START',',',':','RETURN'].concat(COMPOUND_ASSIGN);
	// NO_IMPLICIT_BLOCK_CALL
	// IMPLICIT_COMMA = ['->', '=>', '{', '[', 'NUMBER', 'STRING', 'SYMBOL', 'IDENTIFIER','DO']
	
	var IMPLICIT_COMMA = ['DO'];
	
	// Tokens that always mark the end of an implicit call for single-liners.
	var IMPLICIT_END = ['POST_IF','POST_UNLESS','FOR','WHILE','UNTIL','WHEN','BY','LOOP','TERMINATOR','DEF_BODY','DEF_FRAGMENT'];
	
	// Single-line flavors of block expressions that have unclosed endings.
	// The grammar can't disambiguate them, so we insert the implicit indentation.
	var SINGLE_LINERS = ['ELSE','TRY','FINALLY','THEN','BLOCK_PARAM_END','DO','BEGIN','CATCH_VAR'];// '->', '=>', really?
	var SINGLE_CLOSERS = ['TERMINATOR','CATCH','FINALLY','ELSE','OUTDENT','LEADING_WHEN'];
	
	// Tokens that end a line.
	var LINEBREAKS = ['TERMINATOR','INDENT','OUTDENT'];


}())
},{"./token":8}],8:[function(require,module,exports){
(function(){


	/* @class Token */
	function Token(type,value,line,region){
		this._type = type;
		this._value = value;
		this._line = line || 0;
		this._region = region;
		return this;
	};
	
	exports.Token = Token; // export class 
	
	
	Token.prototype.type = function (){
		return this._type;
	};
	
	Token.prototype.value = function (){
		return this._value;
	};
	
	Token.prototype.loc = function (){
		return this._region;
	};
	
	Token.prototype.traverse = function (){
		return;
	};
	
	Token.prototype.c = function (){
		return "" + this._value;
	};
	
	Token.prototype.toString = function (){
		return "" + this._value;
	};
	
	// added for legacy reasons
	Token.prototype.charAt = function (i){
		return this._value.charAt(i);
	};
	
	Token.prototype.slice = function (i){
		return this._value.slice(i);
	};
	
	
	
	function lex(){
		var line;
		var token = this.tokens[(this.pos)++];
		var ttag,loc;
		
		if(token) {
			ttag = token._type;
			this.yytext = token;// .@value
			
			if(line = token._line) {
				this.yylineno = line;
				// this.yylloc.first_line = line;
				// this.yylloc.last_line = line;
			};
		} else {
			ttag = '';
		};
		
		return ttag;
	}; exports.lex = lex;
	
	
	function token(typ,val,line,region){
		return new Token(typ,val,line,region);
	}; exports.token = token;// [null,typ,val,loc]
	function typ(tok){
		return tok._type;
	}; exports.typ = typ;
	function val(tok){
		return tok._value;
	}; exports.val = val;// tok[offset + 1]
	function loc(tok){
		return tok._region;
	}; exports.loc = loc;// tok[offset + 2]
	
	function setTyp(tok,v){
		return tok._type = v;
	}; exports.setTyp = setTyp;
	function setVal(tok,v){
		return tok._value = v;
	}; exports.setVal = setVal;
	function setLoc(tok,v){
		return tok._region = v;
	}; exports.setLoc = setLoc;


}())
},{}],9:[function(require,module,exports){
(function(){


	function emit__(event,args,cbs){
		var node,prev,cb,ret;
		node = cbs[event];
		
		while((prev = node) && (node = node.next)){
			if(cb = node.callback) {
				ret = cb.apply(node,args);
			};
			
			if(node.times && --(node.times) <= 0) {
				prev.next = node.next;
				node.callback = null;
			};
		};
		return;
	};
	
	// method for registering a listener on object
	Imba.listen = function (obj,event,callback){
		var $1;
		var cbs,list,tail;
		cbs = obj.__callbacks__ || (obj.__callbacks__ = {});
		list = cbs[($1=event)] || (cbs[$1] = {});
		tail = list.tail || (list.tail = (list.next = {}));
		tail.callback = callback;
		list.tail = tail.next = {};
		return tail;
	};
	
	Imba.once = function (obj,event,callback){
		var tail = Imba.listen(obj,event,callback);
		tail.times = 1;
		return tail;
	};
	
	Imba.unlisten = function (obj,event,cb){
		var node,prev;
		var meta = obj.__callbacks__;
		if(!meta) {
			return;
		};
		
		if(node = meta[event]) {
			while((prev = node) && (node = node.next)){
				if(node == cb || node.callback == cb) {
					prev.next = node.next;
					node.callback = null;
					break;
				};
			};
		};
		return;
	};
	
	Imba.emit = function (obj,event,params){
		var cb = obj.__callbacks__;
		if(cb) {
			emit__(event,params,cb);
		};
		if(cb) {
			emit__('all',[event,params],cb);
		};
		return;
	};


}())
},{}],10:[function(require,module,exports){
(function (global){
(function(){


	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	// externs;
	
	
	var doc = global.document;
	var win = global.window;
	
	// hmm -- this is probably wrong
	var hasTouchEvents = win && win.ontouchstart !== undefined;// .hasOwnProperty('ontouchstart')
	
	
	// Ringbuffer for events?
	
	/* @class RingBuffer */
	Imba.RingBuffer = function RingBuffer(len){
		if(len === undefined) len = 10;
		this._array = [];
		this._keep = len;
		this._head = 0;
		this;
	};
	
	
	Imba.RingBuffer.prototype.__head = {};
	Imba.RingBuffer.prototype.head = function(v){ return this._head; }
	Imba.RingBuffer.prototype.setHead = function(v){ this._head = v; return this; };
	
	
	
	Imba.RingBuffer.prototype.push = function (obj){
		var i = (this._head)++;
		this._array[i % this._keep] = obj;
		return i;
	};
	
	Imba.RingBuffer.prototype.last = function (){
		return this._array[this._head % this._keep];
	};
	
	
	// button-states. Normalize ringbuffer to contain reuseable
	// normalized events?
	
	// really more like a pointer?
	/* @class Pointer */
	Imba.Pointer = function Pointer(){
		this.setButton(-1);
		this.setEvents(new Imba.RingBuffer(10));
		this;
	};
	
	
	Imba.Pointer.prototype.__phase = {};
	Imba.Pointer.prototype.phase = function(v){ return this._phase; }
	Imba.Pointer.prototype.setPhase = function(v){ this._phase = v; return this; };// change: update
	
	Imba.Pointer.prototype.__prevEvent = {};
	Imba.Pointer.prototype.prevEvent = function(v){ return this._prevEvent; }
	Imba.Pointer.prototype.setPrevEvent = function(v){ this._prevEvent = v; return this; };
	
	Imba.Pointer.prototype.__button = {};
	Imba.Pointer.prototype.button = function(v){ return this._button; }
	Imba.Pointer.prototype.setButton = function(v){ this._button = v; return this; };
	
	Imba.Pointer.prototype.__event = {};
	Imba.Pointer.prototype.event = function(v){ return this._event; }
	Imba.Pointer.prototype.setEvent = function(v){ this._event = v; return this; };
	
	Imba.Pointer.prototype.__dirty = {};
	Imba.Pointer.prototype.dirty = function(v){ return this._dirty; }
	Imba.Pointer.prototype.setDirty = function(v){ this._dirty = v; return this; };
	
	Imba.Pointer.prototype.__events = {};
	Imba.Pointer.prototype.events = function(v){ return this._events; }
	Imba.Pointer.prototype.setEvents = function(v){ this._events = v; return this; };
	
	Imba.Pointer.prototype.__touch = {};
	Imba.Pointer.prototype.touch = function(v){ return this._touch; }
	Imba.Pointer.prototype.setTouch = function(v){ this._touch = v; return this; };
	
	
	
	Imba.Pointer.prototype.update = function (e){
		this.setEvent(e);
		// normalize the event / touch?
		this.events().push(e);
		this.setDirty(true);
		return this;
	};
	
	// this is just for regular mouse now
	Imba.Pointer.prototype.process = function (){
		var e0, e1;
		var phase = this.phase();
		var e0 = this.prevEvent(),e1 = this.event();
		
		if(this.dirty()) {
			this.setPrevEvent(e1);
			this.setDirty(false);
			// button should only change on mousedown etc
			if(e1.type == 'mousedown') {
				this.setButton(e1.button);
				// console.log('button-state changed!!!',button)
				this.setTouch(new Imba.Touch(e1,this));
				this.touch().mousedown(e1,e1);
				// trigger pointerdown
			} else if(e1.type == 'mousemove') {
				if(this.touch()) {
					this.touch().mousemove(e1,e1);
				};
			} else if(e1.type == 'mouseup') {
				this.setButton(-1);
				// console.log('button-state changed!!!',button)
				if(this.touch()) {
					this.touch().mouseup(e1,e1);
				};
				(this.setTouch(null),null);// reuse?
				// trigger pointerup
			};
			
			// if !e0 || e0:button != e1:button
			// 	console.log('button-state changed!!!',e0,e1)
			// see if button has transitioned?
			// console.log e:type
		} else {
			if(this.touch()) {
				this.touch().idle();
			};
		};
		
		
		return this;
	};
	
	Imba.Pointer.prototype.emit = function (name,target,pars){
		if(!pars||pars.constructor !== Object) pars = {};
		var bubble = pars.bubble !== undefined ? pars.bubble : true;
		return true;
	};
	
	
	Imba.Pointer.prototype.cleanup = function (){
		return Imba.POINTERS;
	};
	
	Imba.Pointer.prototype.x = function (){
		return this.event().x;
	};
	Imba.Pointer.prototype.y = function (){
		return this.event().y;
	};
	
	Imba.Pointer.update = function (){
		for(var i=0, ary=iter$(Imba.POINTERS), len=ary.length; i < len; i++) {
			ary[i].process();
		};
		// need to be able to prevent the default behaviour of touch, no?
		win.requestAnimationFrame(Imba.Pointer.update);
		
		return this;
	};
	
	
	
	// Imba.Touch
	// Began	A finger touched the screen.
	// Moved	A finger moved on the screen.
	// Stationary	A finger is touching the screen but hasn't moved.
	// Ended	A finger was lifted from the screen. This is the final phase of a touch.
	// Canceled The system cancelled tracking for the touch.
	/* @class Touch */
	Imba.Touch = function Touch(e,ptr){
		var v_;
		this.setEvent(e);
		this.setData({});
		this.setActive(true);
		this.setBubble(false);
		this.setPointer(ptr);
		(this.setUpdates(v_=0),v_);
	};
	
	var multi = true;
	var touches = [];
	var count = 0;
	var identifiers = {};
	
	Imba.Touch.count = function (){
		return count;
	};
	
	Imba.Touch.lookup = function (item){
		return item && (item.__touch__ || identifiers[item.identifier]);
		// look for lookup
		// var id = item:identifier
		// if id != undefined and (touch = IMBA_TOUCH_IDENTIFIERS{id})
		// 	return touch 
	};
	
	Imba.Touch.release = function (item,touch){
		var v_, $1;
		(((v_ = identifiers[item.identifier]),delete identifiers[item.identifier], v_));
		((($1 = item.__touch__),delete item.__touch__, $1));
		return;
	};
	
	Imba.Touch.ontouchstart = function (e){
		this.log("ontouchstart",e);
		for(var i=0, ary=iter$(e.changedTouches), len=ary.length, t; i < len; i++) {
			t = ary[i];if(this.lookup(t)) {
				continue;
			};
			var touch = identifiers[t.identifier] = new this(e);// (e)
			t.__touch__ = touch;
			touches.push(touch);
			count++;
			touch.touchstart(e,t);
		};
		return this;
	};
	
	Imba.Touch.ontouchmove = function (e){
		for(var i=0, ary=iter$(e.changedTouches), len=ary.length, t; i < len; i++) {
			t = ary[i];if(touch = this.lookup(t)) {
				touch.touchmove(e,t);
			};
		};
		
		return this;
	};
	
	Imba.Touch.ontouchend = function (e){
		for(var i=0, ary=iter$(e.changedTouches), len=ary.length, t; i < len; i++) {
			t = ary[i];if(touch = this.lookup(t)) {
				touch.touchend(e,t);
				this.release(t,touch);
				count--;
				// not always supported!
				// touches = touches.filter(||)
			};
		};
		return this;
	};
	
	Imba.Touch.ontouchcancel = function (e){
		for(var i=0, ary=iter$(e.changedTouches), len=ary.length, t; i < len; i++) {
			t = ary[i];if(touch = this.lookup(t)) {
				touch.touchcancel(e,t);
				this.release(t,touch);
				count--;
			};
		};
		return this;
	};
	
	
	
	
	Imba.Touch.prototype.__phase = {};
	Imba.Touch.prototype.phase = function(v){ return this._phase; }
	Imba.Touch.prototype.setPhase = function(v){ this._phase = v; return this; };
	
	Imba.Touch.prototype.__active = {};
	Imba.Touch.prototype.active = function(v){ return this._active; }
	Imba.Touch.prototype.setActive = function(v){ this._active = v; return this; };
	
	Imba.Touch.prototype.__event = {};
	Imba.Touch.prototype.event = function(v){ return this._event; }
	Imba.Touch.prototype.setEvent = function(v){ this._event = v; return this; };
	
	Imba.Touch.prototype.__pointer = {};
	Imba.Touch.prototype.pointer = function(v){ return this._pointer; }
	Imba.Touch.prototype.setPointer = function(v){ this._pointer = v; return this; };
	
	Imba.Touch.prototype.__target = {};
	Imba.Touch.prototype.target = function(v){ return this._target; }
	Imba.Touch.prototype.setTarget = function(v){ this._target = v; return this; };// if 'safe' we can cache multiple uses
	
	Imba.Touch.prototype.__handler = {};
	Imba.Touch.prototype.handler = function(v){ return this._handler; }
	Imba.Touch.prototype.setHandler = function(v){ this._handler = v; return this; };
	
	Imba.Touch.prototype.__updates = {};
	Imba.Touch.prototype.updates = function(v){ return this._updates; }
	Imba.Touch.prototype.setUpdates = function(v){ this._updates = v; return this; };
	
	Imba.Touch.prototype.__data = {};
	Imba.Touch.prototype.data = function(v){ return this._data; }
	Imba.Touch.prototype.setData = function(v){ this._data = v; return this; };
	
	Imba.Touch.prototype.__bubble = {chainable: true};
	Imba.Touch.prototype.bubble = function(v){ return v !== undefined ? (this.setBubble(v),this) : this._bubble; }
	Imba.Touch.prototype.setBubble = function(v){ this._bubble = v; return this; };
	
	
	Imba.Touch.prototype.__gestures = {};
	Imba.Touch.prototype.gestures = function(v){ return this._gestures; }
	Imba.Touch.prototype.setGestures = function(v){ this._gestures = v; return this; };
	// prop preventDefault
	
	
	Imba.Touch.prototype.__x0 = {};
	Imba.Touch.prototype.x0 = function(v){ return this._x0; }
	Imba.Touch.prototype.setX0 = function(v){ this._x0 = v; return this; };
	
	Imba.Touch.prototype.__y0 = {};
	Imba.Touch.prototype.y0 = function(v){ return this._y0; }
	Imba.Touch.prototype.setY0 = function(v){ this._y0 = v; return this; };
	
	// duration etc -- important
	
	
	
	Imba.Touch.prototype.preventDefault = function (){
		this.event() && this.event().preventDefault();
		// pointer.event.preventDefault
		return this;
	};
	
	Imba.Touch.prototype.extend = function (gesture){
		this._gestures || (this._gestures = []);
		this._gestures.push(gesture);// hmmm
		return this;
	};
	
	Imba.Touch.prototype.redirect = function (target){
		this._redirect = target;
		return this;
	};
	
	Imba.Touch.prototype.suppress = function (){
		this._active = false;
		return this;
	};
	
	Imba.Touch.prototype.touchstart = function (e,t){
		this._touch = t;
		this._x = t.clientX;
		this._y = t.clientY;
		this.began();
		return this;
	};
	
	Imba.Touch.prototype.touchmove = function (e,t){
		this._x = t.clientX;
		this._y = t.clientY;
		this.update();
		return this;
	};
	
	Imba.Touch.prototype.touchend = function (e,t){
		this._x = t.clientX;
		this._y = t.clientY;
		this.ended();
		return this;
	};
	
	Imba.Touch.prototype.touchcancel = function (e,t){
		return this;
	};
	
	
	Imba.Touch.prototype.mousedown = function (e,t){
		this._x = t.clientX;
		this._y = t.clientY;
		this.began();
		return this;
	};
	
	Imba.Touch.prototype.mousemove = function (e,t){
		this._x = t.clientX;
		this._y = t.clientY;
		this.update();
		return this;
	};
	
	Imba.Touch.prototype.mouseup = function (e,t){
		this._x = t.clientX;
		this._y = t.clientY;
		this.ended();
		return this;
	};
	
	Imba.Touch.prototype.idle = function (){
		return this.update();
	};
	
	Imba.Touch.prototype.began = function (){
		this._x0 = this._x;
		this._y0 = this._y;
		
		var e = this.event();
		// var ptr = pointer # hmmm
		var dom = this.event().target;
		var node = null;
		// need to find the 
		while(dom){
			node = tag$wrap(dom);
			if(node && node.ontouchstart) {
				this._bubble = false;
				this.setTarget(node);
				this.target().ontouchstart(this);
				if(!(this._bubble)) {
					break;
				};
			};
			dom = dom.parentNode;
		};
		
		// console.log('target??',target)
		(this._updates)++;
		// if target
		// 	target.ontouchstart(self)
		// 	# ptr.event.preventDefault unless @native
		// 	# prevent default?
		
		//  = e:clientX
		//  = e:clientY
		return this;
	};
	
	Imba.Touch.prototype.update = function (){
		if(!(this._active)) {
			return this;
		};
		// catching a touch-redirect?!?
		if(this._redirect) {
			if(this._target && this._target.ontouchcancel) {
				this._target.ontouchcancel(this);
			};
			this.setTarget(this._redirect);
			this._redirect = null;
			if(this.target().ontouchstart) {
				this.target().ontouchstart(this);
			};
		};
		
		
		(this._updates)++;
		if(this._gestures) {
			for(var i=0, ary=iter$(this._gestures), len=ary.length; i < len; i++) {
				ary[i].ontouchupdate(this);
			};
		};
		
		if(this.target() && this.target().ontouchupdate) {
			this.target().ontouchupdate(this);
		};
		return this;
	};
	
	Imba.Touch.prototype.ended = function (){
		if(!(this._active)) {
			return this;
		};
		
		(this._updates)++;
		
		if(this._gestures) {
			for(var i=0, ary=iter$(this._gestures), len=ary.length; i < len; i++) {
				ary[i].ontouchend(this);
			};
		};
		
		if(this.target() && this.target().ontouchend) {
			this.target().ontouchend(this);
		};
		
		// simulate tap -- need to be careful about this(!)
		// must look at timing and movement(!)
		if(this._touch) {
			ED.trigger('tap',this.event().target);
		};
		return this;
	};
	
	Imba.Touch.prototype.cancelled = function (){
		return this;
	};
	
	Imba.Touch.prototype.dx = function (){
		return this._x - this._x0;
		// pointer.x - @x0
	};
	
	Imba.Touch.prototype.dy = function (){
		return this._y - this._y0;
		// pointer.y - @y0
	};
	
	Imba.Touch.prototype.x = function (){
		return this._x;
	};// pointer.x
	Imba.Touch.prototype.y = function (){
		return this._y;
	};// pointer.y
	
	Imba.Touch.prototype.button = function (){
		return (this._pointer) ? (this._pointer.button()) : (0);
	};// hmmmm
	
	
	
	/* @class TouchGesture */
	Imba.TouchGesture = function TouchGesture(){ };
	
	
	Imba.TouchGesture.prototype.__active = {default: false};
	Imba.TouchGesture.prototype.active = function(v){ return this._active; }
	Imba.TouchGesture.prototype.setActive = function(v){ this._active = v; return this; }
	Imba.TouchGesture.prototype._active = false;
	
	Imba.TouchGesture.prototype.ontouchstart = function (e){
		return this;
	};
	
	Imba.TouchGesture.prototype.ontouchupdate = function (e){
		return this;
	};
	
	Imba.TouchGesture.prototype.ontouchend = function (e){
		return this;
	};
	
	
	
	
	// should be possible
	// def Imba.Pointer.update
	
	
	// A Touch-event is created on mousedown (always)
	// and while it exists, mousemove and mouseup will
	// be delegated to this active event.
	Imba.POINTER = new Imba.Pointer();
	Imba.POINTERS = [Imba.POINTER];
	
	
	Imba.Pointer.update();
	
	
	
	// regular event stuff
	Imba.KEYMAP = {
		"8": 'backspace',
		"9": 'tab',
		"13": 'enter',
		"16": 'shift',
		"17": 'ctrl',
		"18": 'alt',
		"19": 'break',
		"20": 'caps',
		"27": 'esc',
		"32": 'space',
		"35": 'end',
		"36": 'home',
		"37": 'larr',
		"38": 'uarr',
		"39": 'rarr',
		"40": 'darr',
		"45": 'insert',
		"46": 'delete',
		"107": 'plus',
		"106": 'mult',
		"91": 'meta'
	};
	
	Imba.CHARMAP = {
		"%": 'modulo',
		"*": 'multiply',
		"+": 'add',
		"-": 'sub',
		"/": 'divide',
		".": 'dot'
	};
	
	
	/* @class Event */
	Imba.Event = function Event(e){
		this.setEvent(e);
		(this.setBubble(true),true);
	};
	
	
	Imba.Event.prototype.__event = {};
	Imba.Event.prototype.event = function(v){ return this._event; }
	Imba.Event.prototype.setEvent = function(v){ this._event = v; return this; };
	
	Imba.Event.prototype.__target = {};
	Imba.Event.prototype.target = function(v){ return this._target; }
	Imba.Event.prototype.setTarget = function(v){ this._target = v; return this; };
	
	Imba.Event.prototype.__prefix = {};
	Imba.Event.prototype.prefix = function(v){ return this._prefix; }
	Imba.Event.prototype.setPrefix = function(v){ this._prefix = v; return this; };
	
	Imba.Event.prototype.__data = {};
	Imba.Event.prototype.data = function(v){ return this._data; }
	Imba.Event.prototype.setData = function(v){ this._data = v; return this; };
	
	Imba.Event.prototype.__source = {};
	Imba.Event.prototype.source = function(v){ return this._source; }
	Imba.Event.prototype.setSource = function(v){ this._source = v; return this; };
	
	Imba.Event.prototype.__bubble = {};
	Imba.Event.prototype.bubble = function(v){ return this._bubble; }
	Imba.Event.prototype.setBubble = function(v){ this._bubble = v; return this; };// getset: yes
	
	Imba.Event.wrap = function (e){
		return new this(e);
	};
	
	
	
	Imba.Event.prototype.name = function (){
		return this.event().type.toLowerCase().replace(/\:/g,'');
	};
	
	// mimc getset
	Imba.Event.prototype.bubble = function (v){
		if(v != undefined) {
			this.setBubble(v);
			return this;
		};
		return this._bubble;
	};
	
	Imba.Event.prototype.halt = function (){
		this.setBubble(false);
		return this;
	};
	
	Imba.Event.prototype.cancel = function (){
		if(this.event().preventDefault) {
			this.event().preventDefault();
		};
		return this;
	};
	
	Imba.Event.prototype.target = function (){
		return tag$wrap(this.event()._target || this.event().target);
	};
	
	Imba.Event.prototype.redirect = function (node){
		this._redirect = node;
		return this;
	};
	
	Imba.Event.prototype.keychar = function (){
		if(this.event() instanceof TextEvent) {
			return this.event().data;
		};
		
		if(this.event() instanceof KeyboardEvent) {
			var ki = this.event().keyIdentifier;
			var sym = Imba.KEYMAP[this.event().keyCode];
			
			// p 'keysym!',ki,sym
			
			if(!sym && ki.substr(0,2) == "U+") {
				sym = String.fromCharCode(global.parseInt(ki.substr(2),16));
			};
			return sym;
		};
		
		return null;
	};
	
	Imba.Event.prototype.keycombo = function (){
		var sym;
		if(!(sym = this.keychar())) {
			return;
		};
		sym = Imba.CHARMAP[sym] || sym;
		var combo = [];
		if(this.event().ctrlKey) {
			combo.push('ctrl');
		};
		if(this.event().shiftKey) {
			combo.push('shift');
		};
		if(this.event().altKey) {
			combo.push('alt');
		};
		if(this.event().metaKey) {
			combo.push('cmd');
		};
		combo.push(sym);
		return combo.join("_").toLowerCase();
	};
	
	Imba.Event.prototype.process = function (){
		var meth = ("on" + (this._prefix || '') + this.name());
		var domtarget = this.event()._target || this.event().target;
		// var node = <{domtarget:_responder or domtarget}> # hmm
		
		var domnode = domtarget._responder || domtarget;
		// need to stop infinite redirect-rules here??!?
		while(domnode){
			this._redirect = null;
			var node = tag$wrap(domnode);
			if(node && (node[meth] instanceof Function)) {
				node[meth](this,this.data());
			};
			// log "hit?",domnode
			if(!(this.bubble() && (domnode = (this._redirect || ((node) ? (node.parent()) : (domnode.parentNode)))))) {
				break;
			};
		};
		
		return this;
	};
	
	Imba.Event.prototype.x = function (){
		return this.event().x;
	};
	Imba.Event.prototype.y = function (){
		return this.event().y;
	};
	
	
	
	/* @class EventManager */
	Imba.EventManager = function EventManager(node,pars){
		var self=this;
		if(!pars||pars.constructor !== Object) pars = {};
		var events = pars.events !== undefined ? pars.events : [];
		self.setRoot(node);
		self.setListeners([]);
		self.setDelegators({});
		self.setDelegator(function (e){
			self.delegate(e);
			return true;
		});
		
		for(var i=0, ary=iter$(events), len=ary.length; i < len; i++) {
			self.register(ary[i]);
		};
		self;
	};
	
	
	Imba.EventManager.prototype.__root = {};
	Imba.EventManager.prototype.root = function(v){ return this._root; }
	Imba.EventManager.prototype.setRoot = function(v){ this._root = v; return this; };
	
	Imba.EventManager.prototype.__enabled = {default: false,watch: 'enabledDidSet'};
	Imba.EventManager.prototype.enabled = function(v){ return this._enabled; }
	Imba.EventManager.prototype.setEnabled = function(v){
		var a = this.enabled();
		if(v != a) { v = this._enabled = v; }
		if(v != a) { this.enabledDidSet && this.enabledDidSet(v,a,this.__enabled) }
		return this;
	}
	Imba.EventManager.prototype._enabled = false;
	
	Imba.EventManager.prototype.__listeners = {};
	Imba.EventManager.prototype.listeners = function(v){ return this._listeners; }
	Imba.EventManager.prototype.setListeners = function(v){ this._listeners = v; return this; };
	
	Imba.EventManager.prototype.__delegators = {};
	Imba.EventManager.prototype.delegators = function(v){ return this._delegators; }
	Imba.EventManager.prototype.setDelegators = function(v){ this._delegators = v; return this; };
	
	Imba.EventManager.prototype.__delegator = {};
	Imba.EventManager.prototype.delegator = function(v){ return this._delegator; }
	Imba.EventManager.prototype.setDelegator = function(v){ this._delegator = v; return this; };
	
	Imba.EventManager.prototype.enabledDidSet = function (bool){
		if(bool) {
			this.onenable();
		} else {
			this.ondisable();
		};
		return this;
	};
	
	
	
	
	Imba.EventManager.prototype.register = function (name,handler){
		if(handler === undefined) handler = true;
		if(name instanceof Array) {
			for(var i=0, ary=iter$(name), len=ary.length; i < len; i++) {
				this.register(ary[i],handler);
			};
			return this;
		};
		
		if(this.delegators()[name]) {
			return this;
		};
		// console.log("register for event {name}")
		var fn = this.delegators()[name] = (handler instanceof Function) ? (handler) : (this.delegator());
		return (this.enabled()) && (this.root().addEventListener(name,fn,true));
	};
	
	Imba.EventManager.prototype.listen = function (name,handler,capture){
		if(capture === undefined) capture = true;
		this.listeners().push([name,handler,capture]);
		if(this.enabled()) {
			this.root().addEventListener(name,handler,capture);
		};
		return this;
	};
	
	Imba.EventManager.prototype.delegate = function (e){
		var event = Imba.Event.wrap(e);
		// console.log "delegate event {e:type}"
		event.process();
		// name = e:type.toLowerCase.replace(/\:/g,'')
		// create our own event here?
		return this;
	};
	
	Imba.EventManager.prototype.create = function (type,target,pars){
		if(!pars||pars.constructor !== Object) pars = {};
		var data = pars.data !== undefined ? pars.data : null;
		var source = pars.source !== undefined ? pars.source : null;
		var event = Imba.Event.wrap({type: type,target: target});
		if(data) {
			(event.setData(data),data);
		};
		if(source) {
			(event.setSource(source),source);
		};
		return event;
	};
	
	// use create instead?
	Imba.EventManager.prototype.trigger = function (type,target,pars){
		if(!pars||pars.constructor !== Object) pars = {};
		var data = pars.data !== undefined ? pars.data : null;
		var source = pars.source !== undefined ? pars.source : null;
		var event = Imba.Event.wrap({type: type,target: target});
		if(data) {
			(event.setData(data),data);
		};
		if(source) {
			(event.setSource(source),source);
		};
		return event.process();
	};
	
	Imba.EventManager.prototype.emit = function (obj,event,data,pars){
		if(!pars||pars.constructor !== Object) pars = {};
		var dom = pars.dom !== undefined ? pars.dom : true;
		var ns = pars.ns !== undefined ? pars.ns : 'object';
		var fn = ("on" + ns);
		var nodes = DOC.querySelectorAll(("." + (obj.uid())));
		for(var i=0, ary=iter$(nodes), len=ary.length, node; i < len; i++) {
			node = ary[i];if(node._tag && node._tag[fn]) {
				node._tag[fn](event,data);
			};
			// now we simply link to onobject event
		};
		return this;
	};
	
	Imba.EventManager.prototype.onenable = function (){
		for(var o=this.delegators(), i=0, keys=Object.keys(o), l=keys.length; i < l; i++){
			this.root().addEventListener(keys[i],o[keys[i]],true);
		};
		
		for(var i=0, ary=iter$(this.listeners()), len=ary.length, item; i < len; i++) {
			item = ary[i];this.root().addEventListener(item[0],item[1],item[2]);
		};
		return this;
	};
	
	Imba.EventManager.prototype.ondisable = function (){
		for(var o=this.delegators(), i=0, keys=Object.keys(o), l=keys.length; i < l; i++){
			this.root().removeEventListener(keys[i],o[keys[i]],true);
		};
		
		for(var i=0, ary=iter$(this.listeners()), len=ary.length, item; i < len; i++) {
			item = ary[i];this.root().removeEventListener(item[0],item[1],item[2]);
		};
		return this;
	};
	
	
	
	
	ED = new Imba.EventManager(document,{events: [
		'keydown','keyup','keypress','textInput','input',
		'focusin','focusout','contextmenu','submit',
		'mousedown','mouseup'
	]});
	
	
	if(hasTouchEvents) {
		ED.listen('touchstart',function (e){
			return Imba.Touch.ontouchstart(e);
		});
		ED.listen('touchmove',function (e){
			return Imba.Touch.ontouchmove(e);
		});
		ED.listen('touchend',function (e){
			return Imba.Touch.ontouchend(e);
		});
		ED.listen('touchcancel',function (e){
			return Imba.Touch.ontouchcancel(e);
		});
	} else {
		ED.listen('click',function (e){
			return ED.trigger('tap',e.target);
		});
		
		
		ED.listen('mousedown',function (e){
			return (Imba.POINTER) && (Imba.POINTER.update(e).process());
		});
		
		ED.listen('mousemove',function (e){
			return (Imba.POINTER) && (Imba.POINTER.update(e));// .process if touch # should not happen? We process through 
		});
		
		ED.listen('mouseup',function (e){
			return (Imba.POINTER) && (Imba.POINTER.update(e).process());
		});
	};


}())
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(require,module,exports){
(function (global){
(function(){


	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	// helper for subclassing
	function subclass$(obj,sup) {
		for (var k in sup) {
			if (sup.hasOwnProperty(k)) obj[k] = sup[k];
		};
		// obj.__super__ = sup;
		obj.prototype = Object.create(sup.prototype);
		obj.__super__ = obj.prototype.__super__ = sup.prototype;
		obj.prototype.initialize = obj.prototype.constructor = obj;
	};
	
	function idx$(a,b){
		return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
	};
	
	var doc;
	var svgSupport = true;
	
	if(doc = global.document) {
		Imba.doc = doc;
		svgSupport = doc.createElementNS && doc.createElementNS('http://www.w3.org/2000/svg',"svg").createSVGRect;
	};
	
	// This is VERY experimental. Using Imba for serverside templates
	// is not recommended unless you're ready for a rough ride. It is
	// a priority to get this fast and stable.
	
	// room for lots of optimization to serverside nodes. can be much more
	// clever when it comes to the classes etc
	
	/* @class ElementTag */
	function ElementTag(){ };
	
	
	ElementTag.prototype.__object = {};
	ElementTag.prototype.object = function(v){ return this._object; }
	ElementTag.prototype.setObject = function(v){ this._object = v; return this; };
	
	ElementTag.prototype.dom = function (){
		return this._dom;
	};
	
	ElementTag.prototype.setDom = function (dom){
		dom._tag = this;
		this._dom = dom;
		return this;
	};
	
	ElementTag.prototype.setRef = function (ref){
		this.flag(this._ref = ref);
		return this;
	};
	
	ElementTag.prototype.setAttribute = function (key,v){
		if(v != null && v !== false) {
			this.dom().setAttribute(key,v);
		} else {
			this.removeAttribute(key);
		};
		return v;// non-obvious that we need to return the value here, no?
	};
	
	ElementTag.prototype.removeAttribute = function (key){
		return this.dom().removeAttribute(key);
	};
	
	ElementTag.prototype.getAttribute = function (key){
		var val = this.dom().getAttribute(key);
		return val;
	};
	
	ElementTag.prototype.object = function (v){
		if(arguments.length) {
			return (this.setObject(v),this);
		};
		return this._object;// hmm
	};
	
	ElementTag.prototype.body = function (v){
		if(arguments.length) {
			return (this.setBody(v),this);
		};
		return this;
	};
	
	ElementTag.prototype.setBody = function (body){
		if(this._empty) {
			this.append(body);
		} else {
			this.empty().append(body);
		};
		return this;
	};
	
	ElementTag.prototype.setContent = function (content){
		this.setChildren(content);// override?
		return this;
	};
	
	ElementTag.prototype.setChildren = function (nodes){
		if(this._empty) {
			this.append(nodes);
		} else {
			this.empty().append(nodes);
		};
		return this;
	};
	
	ElementTag.prototype.text = function (v){
		if(arguments.length) {
			return (this.setText(v),this);
		};
		return this._dom.textContent;
	};
	
	ElementTag.prototype.setText = function (txt){
		this._empty = false;
		this._dom.textContent = (txt == null) ? (txt = "") : (txt);
		return this;
	};
	
	ElementTag.prototype.empty = function (){
		while(this._dom.firstChild){
			this._dom.removeChild(this._dom.firstChild);
		};
		this._empty = true;
		return this;
	};
	
	ElementTag.prototype.remove = function (node){
		var par = this.dom();
		var el = node && node.dom();
		if(el && el.parentNode == par) {
			par.removeChild(el);
		};
		return this;
	};
	
	
	ElementTag.prototype.parent = function (){
		return tag$wrap(this.dom().parentNode);
	};
	
	// def first sel
	// 	# want to filter
	// 	var el = tag(dom:firstChild)
	// 	if sel and el and !el.matches(sel)
	// 		return el.next(sel)
	// 	return el
	
	ElementTag.prototype.log = function (){
		var $0 = arguments, i = $0.length;
		var args = new Array(i>0 ? i : 0);
		while(i>0) args[i-1] = $0[--i];
		args.unshift(console);
		Function.prototype.call.apply(console.log,args);
		// console.log(*arguments)
		return this;
	};
	
	
	// def emit name, data: nil, bubble: yes
	// 	ED.trigger name, self, data: data, bubble: bubble
	// 	return self
	
	ElementTag.prototype.css = function (key,val){
		if(key instanceof Object) {
			for(var o=key, i=0, keys=Object.keys(o), l=keys.length; i < l; i++){
				this.css(keys[i],o[keys[i]]);
			};
		} else if(val == null) {
			this.dom().style.removeProperty(key);
		} else if(val == undefined) {
			return this.dom().style[key];
		} else {
			if((typeof val=='number'||val instanceof Number) && key.match(/width|height|left|right|top|bottom/)) {
				val = val + "px";
			};
			this.dom().style[key] = val;
		};
		return this;
	};
	
	// selectors / traversal
	ElementTag.prototype.find = function (sel){
		return new ImbaSelector(sel,this);
	};
	
	ElementTag.prototype.first = function (sel){
		return (sel) ? (this.find(sel).first()) : (tag$wrap(this.dom().firstElementChild));
	};
	
	ElementTag.prototype.last = function (sel){
		return (sel) ? (this.find(sel).last()) : (tag$wrap(this.dom().lastElementChild));
	};
	
	ElementTag.prototype.child = function (i){
		return tag$wrap(this.dom().children[i || 0]);
	};
	
	ElementTag.prototype.children = function (sel){
		var nodes = new ImbaSelector(null,this,this._dom.children);
		return (sel) ? (nodes.filter(sel)) : (nodes);
	};
	
	ElementTag.prototype.orphanize = function (){
		var par;
		if(par = this.dom().parentNode) {
			par.removeChild(this._dom);
		};
		return this;
	};
	
	ElementTag.prototype.matches = function (sel){
		var fn;
		if(sel instanceof Function) {
			return sel(this);
		};
		
		if(sel.query) {
			sel = sel.query();
		};
		if(fn = (this._dom.webkitMatchesSelector || this._dom.matches)) {
			return fn.call(this._dom,sel);
		};
		// TODO support other browsers etc?
	};
	
	ElementTag.prototype.closest = function (sel){
		if(!sel) {
			return this.parent();
		};// should return self?!
		var node = this;
		if(sel.query) {
			sel = sel.query();
		};
		
		while(node){
			if(node.matches(sel)) {
				return node;
			};
			node = node.parent();
		};
		return null;
	};
	
	ElementTag.prototype.contains = function (node){
		return this.dom().contains(node && node._dom || node);
	};
	
	ElementTag.prototype.index = function (){
		var i = 0;
		var el = this.dom();
		while(el.previousSibling){
			el = el.previousSibling;
			i++;
		};
		
		return i;
	};
	
	ElementTag.prototype.up = function (sel){
		if(!sel) {
			return this.parent();
		};
		return this.parent() && this.parent().closest(sel);
	};
	
	ElementTag.prototype.siblings = function (sel){
		var par, self=this;
		if(!(par = this.parent())) {
			return [];
		};// FIXME
		var ary = this.dom().parentNode.children;
		var nodes = new ImbaSelector(null,this,ary);
		return nodes.filter(function (n){
			return n != self && (!sel || n.matches(sel));
		});
	};
	
	ElementTag.prototype.next = function (sel){
		if(sel) {
			var el = this;
			while(el = el.next()){
				if(el.matches(sel)) {
					return el;
				};
			};
			return null;
		};
		return tag$wrap(this.dom().nextElementSibling);
	};
	
	ElementTag.prototype.prev = function (sel){
		if(sel) {
			var el = this;
			while(el = el.prev()){
				if(el.matches(sel)) {
					return el;
				};
			};
			return null;
		};
		return tag$wrap(this.dom().previousElementSibling);
	};
	
	ElementTag.prototype.insert = function (node,pars){
		if(!pars||pars.constructor !== Object) pars = {};
		var before = pars.before !== undefined ? pars.before : null;
		var after = pars.after !== undefined ? pars.after : null;
		if(after) {
			before = after.next();
		};
		if(node instanceof Array) {
			node = (t$('fragment').setContent([node]).end());
		};
		if(before) {
			this.dom().insertBefore(node.dom(),before.dom());
		} else {
			this.append(node);
		};
		return this;
	};
	
	// bind / present
	ElementTag.prototype.bind = function (obj){
		this.setObject(obj);
		if(this._built) {
			this.render(obj);
		};// hmm
		return this;
	};
	
	ElementTag.prototype.build = function (){
		return this;
	};
	
	ElementTag.prototype.commit = function (){
		return this;
	};
	
	ElementTag.prototype.synced = function (){
		return this;
	};
	
	ElementTag.prototype.focus = function (){
		this.dom().focus();
		return this;
	};
	
	ElementTag.prototype.blur = function (){
		this.dom().blur();
		return this;
	};
	
	ElementTag.prototype.end = function (){
		if(this._built) {
			this.commit();
		} else {
			this._built = true;
			this.build();
		};
		return this;
	};
	
	ElementTag.prototype.render = function (par){
		this.setBody(this.template(par || this._object));
		return this;
	};
	
	// called when the node is awakened in the dom - either automatically
	// upon attachment to the dom-tree, or the first time imba needs the
	// tag for a domnode that has been rendered on the server
	ElementTag.prototype.awake = function (){
		return this;
	};
	
	ElementTag.prototype.template = function (){
		return null;
	};
	
	ElementTag.prototype.prepend = function (item){
		return this.insert(item,{before: this.first()});
	};
	
	
	ElementTag.prototype.append = function (item){
		if(!item) {
			return this;
		};
		
		if(item instanceof Array) {
			for(var i=0, ary=iter$(item), len=ary.length, member; i < len; i++) {
				member = ary[i];member && this.append(member);
			};
		} else if((typeof item=='string'||item instanceof String) || (typeof item=='number'||item instanceof Number)) {
			var node = Imba.doc.createTextNode(item);
			this._dom.appendChild(node);
			if(this._empty) {
				this._empty = false;
			};
		} else {
			this._dom.appendChild(item._dom || item);
			if(this._empty) {
				this._empty = false;
			};
		};
		
		return this;
	};
	
	ElementTag.prototype.toString = function (){
		return this._dom.toString();// really?
	};
	
	ElementTag.flag = function (flag){
		var dom = this.dom();
		dom.classList.add(flag);
		// dom:className += " " + flag
		return this;
	};
	
	ElementTag.unflag = function (flag){
		this.dom().classList.remove(flag);
		return this;
	};
	
	ElementTag.prototype.classes = function (){
		return this.dom().classList;
	};
	
	ElementTag.prototype.flag = function (ref,toggle){
		if(arguments.length == 2) {
			if(toggle) {
				this.classes().add(ref);
			} else {
				this.classes().remove(ref);
			};
		} else {
			this.classes().add(ref);
		};
		return this;
	};
	
	ElementTag.prototype.unflag = function (ref){
		this.classes().remove(ref);
		return this;
	};
	
	ElementTag.prototype.hasFlag = function (ref){
		return this.classes().contains(ref);
	};
	
	
	
	/* @class HTMLElementTag */
	function HTMLElementTag(){ ElementTag.apply(this,arguments) };
	
	subclass$(HTMLElementTag,ElementTag);
	HTMLElementTag.dom = function (){
		if(this._dom) {
			return this._dom;
		};
		
		var dom;
		var sup = this.__super__.constructor;
		
		// should clone the parent no?
		if(this._isNative) {
			dom = Imba.doc.createElement(this._nodeType);
		} else if(this._nodeType != sup._nodeType) {
			console.log("custom dom type(!)");
			dom = Imba.doc.createElement(this._nodeType);
			for(var i=0, ary=iter$(sup.dom()), len=ary.length, atr; i < len; i++) {
				atr = ary[i];dom.setAttribute(atr.name,atr.value);
			};
			// dom:className = sup.dom:className
			// what about default attributes?
		} else {
			dom = sup.dom().cloneNode(false);
		};
		
		// should be a way to use a native domtype without precreating the doc
		// and still keeping the classes?
		
		if(this._domFlags) {
			for(var i=0, ary=iter$(this._domFlags), len=ary.length; i < len; i++) {
				dom.classList.add(ary[i]);
			};
		};
		
		// include the super?!
		// dom:className = @nodeClass or ""
		return this._dom = dom;
	};
	
	// we really ought to optimize this
	HTMLElementTag.createNode = function (flags,id){
		var proto = this._dom || this.dom();
		var dom = proto.cloneNode(false);
		
		if(id) {
			dom.id = id;
		};
		
		if(flags) {
			this.p("SHOULD NEVER GET HERE?!");
			var nc = dom.className;
			dom.className = (nc && flags) ? ((nc + " " + flags)) : ((nc || flags));
		};
		
		return dom;
	};
	
	
	HTML_TAGS = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");
	HTML_TAGS_UNSAFE = "article aside header section".split(" ");
	
	SVG_TAGS = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");
	
	IMBA_TAGS = {
		element: ElementTag,
		htmlelement: HTMLElementTag
	};
	
	Imba.SINGLETONS = {};
	Imba.TAGS = IMBA_TAGS;
	
	function extender(obj,sup){
		for(var o=sup, i=0, keys=Object.keys(o), l=keys.length; i < l; i++){
			obj[keys[i]] = o[keys[i]];
		};
		
		obj.prototype = Object.create(sup.prototype);
		obj.__super__ = obj.prototype.__super__ = sup.prototype;
		obj.prototype.initialize = obj.prototype.constructor = obj;
		return obj;
	};
	
	Imba.defineTag = function (name,func,supr){
		var ary;
		var ary=iter$(name.split("$"));var name = ary[(0)],ns = ary[(1)];
		supr || (supr = ((idx$(name,HTML_TAGS) >= 0)) ? ('htmlelement') : ('div'));
		
		var suprklass = IMBA_TAGS[supr];
		var klass = func;// imba$class(func,suprklass)
		
		extender(klass,suprklass);
		
		klass._nodeType = suprklass._nodeType || name;
		
		klass._name = name;
		klass._ns = ns;
		
		// add the classes -- if this is not a basic native node?
		if(klass._nodeType != name) {
			klass._nodeFlag = "_" + name.replace(/_/g,'-');
			var nc = suprklass._nodeClass;
			nc = (nc) ? (nc.split(/\s+/g)) : ([]);
			var c = null;
			if(ns && idx$(c,nc) == -1) {
				nc.push(c = ("" + ns + "_"));
			};
			if(!(idx$(c,nc) >= 0)) {
				nc.push(c = klass._nodeFlag);
			};
			klass._nodeClass = nc.join(" ");
			klass._domFlags = nc;
			klass._isNative = false;
		} else {
			klass._isNative = true;
		};
		
		klass._dom = null;
		klass.prototype._dom = null;
		klass.prototype._built = false;
		klass.prototype._empty = true;
		
		tag$[name] = Imba.basicTagSpawner(klass,klass._nodeType);
		
		// add the default flags / classes for ns etc
		// if namespaced -- this is dangerous
		if(!ns) {
			IMBA_TAGS[name] = klass;
		};
		IMBA_TAGS[("" + name + "$" + (ns || 'html'))] = klass;
		
		// create the global shortcut for tag init as well
		return klass;
	};
	
	Imba.defineSingletonTag = function (id,func,supr){
		var superklass = Imba.TAGS[supr || 'div'];
		// do we really want a class for singletons?
		// var klass = imba$class(func,superklass)
		var klass = extender(func,superklass);
		
		klass._id = id;
		klass._ns = superklass._ns;
		klass._nodeType = superklass._nodeType;
		klass._nodeClass = superklass._nodeClass;
		klass._domFlags = superklass._domFlags;
		klass._isNative = false;
		
		klass._dom = null;
		klass._instance = null;
		klass.prototype._dom = null;
		klass.prototype._built = false;
		klass.prototype._empty = true;
		
		// add the default flags / classes for ns etc
		// if namespaced -- this is dangerous
		// console.log('registered singleton')
		Imba.SINGLETONS[id] = klass;
		return klass;
	};
	
	Imba.tag = function (name){
		var typ = IMBA_TAGS[name];
		return new typ(typ.createNode());
	};
	
	// tags are a big and important part of Imba. It is critical to make this as
	// fast as possible. Since most engines really like functions they can optimize
	// we use several different functions for generating tags, depending on which
	// parts are supplied (classes, id, attributes, ...)
	Imba.basicTagSpawner = function (type){
		return function (){
			return new type(type.createNode());
		};
	};
	
	Imba.tagWithId = function (name,id){
		var typ = IMBA_TAGS[name];
		var dom = typ.createNode();
		dom.id = id;
		return new typ(dom);
	};
	
	tag$ = Imba.tag;
	
	t$ = Imba.tag;
	tc$ = Imba.tagWithFlags;
	ti$ = Imba.tagWithId;
	tic$ = Imba.tagWithIdAndFlags;
	
	
	Imba.getTagSingleton = function (id){
		var type,node,dom;
		
		if(type = Imba.SINGLETONS[id]) {
			if(type && type.Instance) {
				return type.Instance;
			};
			// no instance - check for element
			if(dom = Imba.doc.getElementById(id)) {
				node = type.Instance = new type(dom);
				node.awake();// should only awaken
				return node;
			};
			
			dom = type.createNode();
			dom.id = id;
			// console.log('creating the singleton',id,type)
			node = type.Instance = new type(dom);
			node.end().awake();
			return node;
		} else if(dom = Imba.doc.getElementById(id)) {
			return Imba.getTagForDom(dom);
		};
	};
	
	id$ = Imba.getTagSingleton;
	
	Imba.getTagForDom = function (dom){
		var m;
		if(!dom) {
			return null;
		};
		if(dom._dom) {
			return dom;
		};// could use inheritance instead
		if(dom._tag) {
			return dom._tag;
		};
		if(!(dom.nodeName)) {
			return null;
		};// better check?
		
		var ns = null;
		var id = dom.id;
		var type = dom.nodeName.toLowerCase();
		var cls = dom.className;
		
		if(id && Imba.SINGLETONS[id]) {
			return Imba.getTagSingleton(id);
		};
		// look for id - singleton
		
		// need better test here
		if(svgSupport && (dom instanceof SVGElement)) {
			ns = "svg";
			cls = dom.className.baseVal;
		};
		
		if(cls) {
			if(m = cls.match(/\b_([a-z\-]+)\b(?!\s*_[a-z\-]+)/)) {
				type = m[1].replace(/-/g,'_');// hmm -should not do that here?
			};
			
			if(m = cls.match(/\b([a-z]+)_\b/)) {
				ns = m[1];
			};
		};
		
		var spawner = IMBA_TAGS[type];
		// console.log("tag for dom?!",ns,type,cls,spawner)
		return (spawner) ? (new spawner(dom)) : (null);
	};
	
	tag$wrap = Imba.getTagForDom;
	// predefine all supported html tags
	
	
	
		
		IMBA_TAGS.htmlelement.prototype.__id = {dom: true};
		IMBA_TAGS.htmlelement.prototype.id = function(v){ return this.getAttribute('id'); }
		IMBA_TAGS.htmlelement.prototype.setId = function(v){ this.setAttribute('id',v); return this; };
		
		IMBA_TAGS.htmlelement.prototype.__tabindex = {dom: true};
		IMBA_TAGS.htmlelement.prototype.tabindex = function(v){ return this.getAttribute('tabindex'); }
		IMBA_TAGS.htmlelement.prototype.setTabindex = function(v){ this.setAttribute('tabindex',v); return this; };
		
		IMBA_TAGS.htmlelement.prototype.__title = {dom: true};
		IMBA_TAGS.htmlelement.prototype.title = function(v){ return this.getAttribute('title'); }
		IMBA_TAGS.htmlelement.prototype.setTitle = function(v){ this.setAttribute('title',v); return this; };
		
		IMBA_TAGS.htmlelement.prototype.__role = {dom: true};
		IMBA_TAGS.htmlelement.prototype.role = function(v){ return this.getAttribute('role'); }
		IMBA_TAGS.htmlelement.prototype.setRole = function(v){ this.setAttribute('role',v); return this; };
		
		// def log *params
		// 	console.log(*params)
		// 	self
	;
	
	(function(){
		var tag = Imba.defineTag('fragment',function fragment(d){this.setDom(d)},'htmlelement');
		tag.createNode = function (){
			return global.document.createDocumentFragment();
		};
	
	})();
	
	(function(){
		var tag = Imba.defineTag('a',function a(d){this.setDom(d)});
		
		tag.prototype.__href = {dom: true};
		tag.prototype.href = function(v){ return this.getAttribute('href'); }
		tag.prototype.setHref = function(v){ this.setAttribute('href',v); return this; };
	
	})();
	
	Imba.defineTag('abbr',function abbr(d){this.setDom(d)});
	Imba.defineTag('address',function address(d){this.setDom(d)});
	Imba.defineTag('area',function area(d){this.setDom(d)});
	Imba.defineTag('article',function article(d){this.setDom(d)});
	Imba.defineTag('aside',function aside(d){this.setDom(d)});
	Imba.defineTag('audio',function audio(d){this.setDom(d)});
	Imba.defineTag('b',function b(d){this.setDom(d)});
	Imba.defineTag('base',function base(d){this.setDom(d)});
	Imba.defineTag('bdi',function bdi(d){this.setDom(d)});
	Imba.defineTag('bdo',function bdo(d){this.setDom(d)});
	Imba.defineTag('big',function big(d){this.setDom(d)});
	Imba.defineTag('blockquote',function blockquote(d){this.setDom(d)});
	Imba.defineTag('body',function body(d){this.setDom(d)});
	Imba.defineTag('br',function br(d){this.setDom(d)});
	(function(){
		var tag = Imba.defineTag('button',function button(d){this.setDom(d)});
		
		tag.prototype.__type = {dom: true};
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
		
		tag.prototype.__disabled = {dom: true};
		tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
		tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
	
	})();
	
	Imba.defineTag('canvas',function canvas(d){this.setDom(d)});
	Imba.defineTag('caption',function caption(d){this.setDom(d)});
	Imba.defineTag('cite',function cite(d){this.setDom(d)});
	Imba.defineTag('code',function code(d){this.setDom(d)});
	Imba.defineTag('col',function col(d){this.setDom(d)});
	Imba.defineTag('colgroup',function colgroup(d){this.setDom(d)});
	Imba.defineTag('data',function data(d){this.setDom(d)});
	Imba.defineTag('datalist',function datalist(d){this.setDom(d)});
	Imba.defineTag('dd',function dd(d){this.setDom(d)});
	Imba.defineTag('del',function del(d){this.setDom(d)});
	Imba.defineTag('details',function details(d){this.setDom(d)});
	Imba.defineTag('dfn',function dfn(d){this.setDom(d)});
	Imba.defineTag('div',function div(d){this.setDom(d)});
	Imba.defineTag('dl',function dl(d){this.setDom(d)});
	Imba.defineTag('dt',function dt(d){this.setDom(d)});
	Imba.defineTag('em',function em(d){this.setDom(d)});
	Imba.defineTag('embed',function embed(d){this.setDom(d)});
	Imba.defineTag('fieldset',function fieldset(d){this.setDom(d)});
	Imba.defineTag('figcaption',function figcaption(d){this.setDom(d)});
	Imba.defineTag('figure',function figure(d){this.setDom(d)});
	Imba.defineTag('footer',function footer(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('form',function form(d){this.setDom(d)});
		
		tag.prototype.__method = {dom: true};
		tag.prototype.method = function(v){ return this.getAttribute('method'); }
		tag.prototype.setMethod = function(v){ this.setAttribute('method',v); return this; };
		
		tag.prototype.__action = {dom: true};
		tag.prototype.action = function(v){ return this.getAttribute('action'); }
		tag.prototype.setAction = function(v){ this.setAttribute('action',v); return this; };
	
	})();
	
	Imba.defineTag('h1',function h1(d){this.setDom(d)});
	Imba.defineTag('h2',function h2(d){this.setDom(d)});
	Imba.defineTag('h3',function h3(d){this.setDom(d)});
	Imba.defineTag('h4',function h4(d){this.setDom(d)});
	Imba.defineTag('h5',function h5(d){this.setDom(d)});
	Imba.defineTag('h6',function h6(d){this.setDom(d)});
	Imba.defineTag('head',function head(d){this.setDom(d)});
	Imba.defineTag('header',function header(d){this.setDom(d)});
	Imba.defineTag('hr',function hr(d){this.setDom(d)});
	Imba.defineTag('html',function html(d){this.setDom(d)});
	Imba.defineTag('i',function i(d){this.setDom(d)});
	Imba.defineTag('iframe',function iframe(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('img',function img(d){this.setDom(d)});
		
		tag.prototype.__src = {dom: true};
		tag.prototype.src = function(v){ return this.getAttribute('src'); }
		tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
	
	})();
	
	(function(){
		var tag = Imba.defineTag('input',function input(d){this.setDom(d)});
		
		tag.prototype.__name = {dom: true};
		tag.prototype.name = function(v){ return this.getAttribute('name'); }
		tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
		
		tag.prototype.__type = {dom: true};
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
		
		tag.prototype.__value = {dom: true};
		tag.prototype.value = function(v){ return this.getAttribute('value'); }
		tag.prototype.setValue = function(v){ this.setAttribute('value',v); return this; };// dom property - NOT attribute -- hmm
		
		tag.prototype.__required = {dom: true};
		tag.prototype.required = function(v){ return this.getAttribute('required'); }
		tag.prototype.setRequired = function(v){ this.setAttribute('required',v); return this; };
		
		tag.prototype.__disabled = {dom: true};
		tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
		tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
		
		tag.prototype.__placeholder = {dom: true};
		tag.prototype.placeholder = function(v){ return this.getAttribute('placeholder'); }
		tag.prototype.setPlaceholder = function(v){ this.setAttribute('placeholder',v); return this; };
		
		tag.prototype.value = function (){
			return this.dom().value;
		};
		
		tag.prototype.setValue = function (v){
			this.dom().value = v;
			return this;
		};
	
	})();
	
	Imba.defineTag('ins',function ins(d){this.setDom(d)});
	Imba.defineTag('kbd',function kbd(d){this.setDom(d)});
	Imba.defineTag('keygen',function keygen(d){this.setDom(d)});
	Imba.defineTag('label',function label(d){this.setDom(d)});
	Imba.defineTag('legend',function legend(d){this.setDom(d)});
	Imba.defineTag('li',function li(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('link',function link(d){this.setDom(d)});
		
		tag.prototype.__rel = {dom: true};
		tag.prototype.rel = function(v){ return this.getAttribute('rel'); }
		tag.prototype.setRel = function(v){ this.setAttribute('rel',v); return this; };
		
		tag.prototype.__type = {dom: true};
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
		
		tag.prototype.__href = {dom: true};
		tag.prototype.href = function(v){ return this.getAttribute('href'); }
		tag.prototype.setHref = function(v){ this.setAttribute('href',v); return this; };
		
		tag.prototype.__media = {dom: true};
		tag.prototype.media = function(v){ return this.getAttribute('media'); }
		tag.prototype.setMedia = function(v){ this.setAttribute('media',v); return this; };
	
	})();
	
	Imba.defineTag('main',function main(d){this.setDom(d)});
	Imba.defineTag('map',function map(d){this.setDom(d)});
	Imba.defineTag('mark',function mark(d){this.setDom(d)});
	Imba.defineTag('menu',function menu(d){this.setDom(d)});
	Imba.defineTag('menuitem',function menuitem(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('meta',function meta(d){this.setDom(d)});
		
		tag.prototype.__name = {dom: true};
		tag.prototype.name = function(v){ return this.getAttribute('name'); }
		tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
		
		tag.prototype.__content = {dom: true};
		tag.prototype.content = function(v){ return this.getAttribute('content'); }
		tag.prototype.setContent = function(v){ this.setAttribute('content',v); return this; };
		
		tag.prototype.__charset = {dom: true};
		tag.prototype.charset = function(v){ return this.getAttribute('charset'); }
		tag.prototype.setCharset = function(v){ this.setAttribute('charset',v); return this; };
	
	})();
	
	Imba.defineTag('meter',function meter(d){this.setDom(d)});
	Imba.defineTag('nav',function nav(d){this.setDom(d)});
	Imba.defineTag('noscript',function noscript(d){this.setDom(d)});
	Imba.defineTag('object',function object(d){this.setDom(d)});
	Imba.defineTag('ol',function ol(d){this.setDom(d)});
	Imba.defineTag('optgroup',function optgroup(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('option',function option(d){this.setDom(d)});
		
		tag.prototype.__value = {dom: true};
		tag.prototype.value = function(v){ return this.getAttribute('value'); }
		tag.prototype.setValue = function(v){ this.setAttribute('value',v); return this; };
	
	})();
	
	Imba.defineTag('output',function output(d){this.setDom(d)});
	Imba.defineTag('p',function p(d){this.setDom(d)});
	Imba.defineTag('param',function param(d){this.setDom(d)});
	Imba.defineTag('pre',function pre(d){this.setDom(d)});
	Imba.defineTag('progress',function progress(d){this.setDom(d)});
	Imba.defineTag('q',function q(d){this.setDom(d)});
	Imba.defineTag('rp',function rp(d){this.setDom(d)});
	Imba.defineTag('rt',function rt(d){this.setDom(d)});
	Imba.defineTag('ruby',function ruby(d){this.setDom(d)});
	Imba.defineTag('s',function s(d){this.setDom(d)});
	Imba.defineTag('samp',function samp(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('script',function script(d){this.setDom(d)});
		
		tag.prototype.__src = {dom: true};
		tag.prototype.src = function(v){ return this.getAttribute('src'); }
		tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
		
		tag.prototype.__type = {dom: true};
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
	
	})();
	
	Imba.defineTag('section',function section(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('select',function select(d){this.setDom(d)});
		
		tag.prototype.__multiple = {dom: true};
		tag.prototype.multiple = function(v){ return this.getAttribute('multiple'); }
		tag.prototype.setMultiple = function(v){ this.setAttribute('multiple',v); return this; };
	
	})();
	
	
	Imba.defineTag('small',function small(d){this.setDom(d)});
	Imba.defineTag('source',function source(d){this.setDom(d)});
	Imba.defineTag('span',function span(d){this.setDom(d)});
	Imba.defineTag('strong',function strong(d){this.setDom(d)});
	Imba.defineTag('style',function style(d){this.setDom(d)});
	Imba.defineTag('sub',function sub(d){this.setDom(d)});
	Imba.defineTag('summary',function summary(d){this.setDom(d)});
	Imba.defineTag('sup',function sup(d){this.setDom(d)});
	Imba.defineTag('table',function table(d){this.setDom(d)});
	Imba.defineTag('tbody',function tbody(d){this.setDom(d)});
	Imba.defineTag('td',function td(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('textarea',function textarea(d){this.setDom(d)});
		
		tag.prototype.__name = {dom: true};
		tag.prototype.name = function(v){ return this.getAttribute('name'); }
		tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
		
		tag.prototype.__disabled = {dom: true};
		tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
		tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
		
		tag.prototype.__required = {dom: true};
		tag.prototype.required = function(v){ return this.getAttribute('required'); }
		tag.prototype.setRequired = function(v){ this.setAttribute('required',v); return this; };
		
		tag.prototype.__placeholder = {dom: true};
		tag.prototype.placeholder = function(v){ return this.getAttribute('placeholder'); }
		tag.prototype.setPlaceholder = function(v){ this.setAttribute('placeholder',v); return this; };
		
		tag.prototype.__value = {dom: true};
		tag.prototype.value = function(v){ return this.getAttribute('value'); }
		tag.prototype.setValue = function(v){ this.setAttribute('value',v); return this; };
		
		tag.prototype.__rows = {dom: true};
		tag.prototype.rows = function(v){ return this.getAttribute('rows'); }
		tag.prototype.setRows = function(v){ this.setAttribute('rows',v); return this; };
		
		tag.prototype.__cols = {dom: true};
		tag.prototype.cols = function(v){ return this.getAttribute('cols'); }
		tag.prototype.setCols = function(v){ this.setAttribute('cols',v); return this; };
		
		tag.prototype.value = function (){
			return this.dom().value;
		};
		
		tag.prototype.setValue = function (v){
			this.dom().value = v;
			return this;
		};
	
	})();
	
	Imba.defineTag('tfoot',function tfoot(d){this.setDom(d)});
	Imba.defineTag('th',function th(d){this.setDom(d)});
	Imba.defineTag('thead',function thead(d){this.setDom(d)});
	Imba.defineTag('time',function time(d){this.setDom(d)});
	Imba.defineTag('title',function title(d){this.setDom(d)});
	Imba.defineTag('tr',function tr(d){this.setDom(d)});
	Imba.defineTag('track',function track(d){this.setDom(d)});
	Imba.defineTag('u',function u(d){this.setDom(d)});
	Imba.defineTag('ul',function ul(d){this.setDom(d)});
	Imba.defineTag('video',function video(d){this.setDom(d)});
	Imba.defineTag('wbr',function wbr(d){this.setDom(d)});


}())
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(require,module,exports){
(function (global){
(function(){


	var $1;
	// could create a fake document 
	/* @class ImbaServerDocument */
	function ImbaServerDocument(){ };
	
	global.ImbaServerDocument = ImbaServerDocument; // global class 
	ImbaServerDocument.prototype.createElement = function (type){
		return new ImbaServerElement(type);
	};
	
	ImbaServerDocument.prototype.createElementNS = function (ns,type){
		return new ImbaServerElement(type);
	};
	
	ImbaServerDocument.prototype.createTextNode = function (value){
		return value;// hmm
	};
	
	
	
	// could optimize by using a dictionary in addition to keys
	// where we cache the indexes?
	/* @class ImbaNodeClassList */
	function ImbaNodeClassList(dom,classes){
		this._classes = classes || [];
		this._dom = dom;
	};
	
	global.ImbaNodeClassList = ImbaNodeClassList; // global class 
	
	
	ImbaNodeClassList.prototype.add = function (flag){
		if(!(this._classes.indexOf(flag) >= 0)) {
			this._classes.push(flag);
		};
		return this;
	};
	
	ImbaNodeClassList.prototype.remove = function (flag){
		var idx = this._classes.indexOf(flag);
		if(idx >= 0) {
			this._classes[idx] = '';
		};
		return this;
	};
	
	ImbaNodeClassList.prototype.toggle = function (flag){
		return this;
	};
	
	ImbaNodeClassList.prototype.clone = function (dom){
		var clone = new ImbaNodeClassList(dom,this._classes.slice(0));
		return clone;
	};
	
	ImbaNodeClassList.prototype.toString = function (){
		return this._classes.join(" ");
	};
	
	
	
	/* @class ImbaServerElement */
	function ImbaServerElement(type){
		this._nodeType = type;
		this.nodeName = type;
		this.classList = new ImbaNodeClassList(this);
		this;
	};
	
	global.ImbaServerElement = ImbaServerElement; // global class 
	
	
	ImbaServerElement.prototype.cloneNode = function (deep){
		var el = new ImbaServerElement(this._nodeType);
		el.classList = this.classList.clone(this);
		// FIXME clone the attributes as well
		// el:className = self:className
		return el;
	};
	
	ImbaServerElement.prototype.appendChild = function (child){
		this.children || (this.children = []);
		return this.children.push(child);// hmmmm
	};
	
	// should implement at some point
	// should also use shortcut to wipe
	// def firstChild
	// 	nil
	// 
	// def removeChild
	// 	nil
	
	ImbaServerElement.prototype.setAttribute = function (key,value){
		this._attributes || (this._attributes = []);
		this._attributes.push(("" + key + "=\"" + value + "\""));
		this._attributes[key] = value;
		return this;
	};
	
	ImbaServerElement.prototype.getAttribute = function (key){
		return (this._attributes) ? (this._attributes[key]) : (undefined);
	};
	
	ImbaServerElement.prototype.removeAttribute = function (key){
		console.log("removeAttribute not implemented on server");
		return true;
	};
	
	ImbaServerElement.prototype.__innerHTML = function (){
		var ary;
		return this.innerHTML || this.textContent || (this.children && this.children.join("")) || '';
		// hmmm
		var str = this.innerHTML || this.textContent || '';
		if(str) {
			return str;
		};
		
		if(ary = this.children) {
			var i = 0;
			var l = ary.length;
			var item;
			while(i < l){
				if(item = ary[i++]) {
					str += item.toString();
				};
			};
		};
		
		return str;
	};
	
	ImbaServerElement.prototype.__outerHTML = function (){
		var v;
		var typ = this._nodeType;
		var sel = ("" + typ);
		// difficult with all the attributes etc?
		// iterating through keys is slow (as tested) -
		// the whole point is to not need this on the server either
		// but it can surely be fixed later
		// and what if we use classList etc?
		// we do instead want to make it happen directly
		// better to use setAttribute or something, so we can get the
		// order and everything. It might not even matter though - fast
		// no matter what.
		if(v = this.id) {
			sel += (" id='" + v + "'");
		};
		if(v = this.classList.toString()) {
			sel += (" class='" + v + "'");
		};
		if(v = this._attributes) {
			sel += (" " + (this._attributes.join(" ")));
		};
		
		// var inner = self:innerHTML || self:textContent || (self:children and self:children.join("")) or ''
		return ("<" + sel + ">" + this.__innerHTML() + "</" + typ + ">");// hmm
		// if self:innerHTML
		// 
		// if self:children
		// 	"<{sel}>{inner}</{typ}>"
		// elif self:textContent
		// 	"<{sel}>{self:textContent}</{typ}>"
		// # what about self-closing?
		// else
		// 	"<{sel}></{typ}>"
	};
	
	ImbaServerElement.prototype.toString = function (){
		if(this._tag && this._tag.toNodeString) {
			return this._tag.toNodeString();
			// return @tag.toNodeString
		};
		return this.__outerHTML();
	};
	
	
	
		IMBA_TAGS.htmlelement.prototype.toString = function (){
			return this.dom().toString();// hmmm
		};
	
	
	
		IMBA_TAGS.html.prototype.doctype = function (){
			return this._doctype || "<!doctype html>";
		};
		
		IMBA_TAGS.html.prototype.toString = function (){
			return this.doctype() + IMBA_TAGS.html.__super__.toString.apply(this,arguments);
			// <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
		};
	
	
	
		IMBA_TAGS.style.prototype.toString = function (){
			return "<style/>";
		};
	
	
	// hmm
	Imba.doc = global.document || new ImbaServerDocument();
	global.document || (global.document = Imba.doc);


}())
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],13:[function(require,module,exports){
(function(){


	
		IMBA_TAGS.htmlelement.prototype.setChildren = function (nodes){
			var al, bl;
			var prev = this._children;
			
			if((typeof nodes=='string'||nodes instanceof String) || (typeof nodes=='number'||nodes instanceof Number)) {
				this.setText(nodes);
				return this;
			};
			
			// console.log 'set content!',nodes
			if(prev != null) {
				if(nodes == prev) {
					return this;
				};
				
				var aa = (prev instanceof Array);
				var ba = (nodes instanceof Array);
				
				if(!aa && !ba) {
					IMBA_TAGS.htmlelement.__super__.setChildren.apply(this,arguments);// just replace the element
				} else if(aa && ba) {
					var al = prev.length,bl = nodes.length;
					var l = Math.max(al,bl);
					var i = 0;
					
					var a, b;
					while(i < l){
						var a = prev[i],b = nodes[i];
						if(b && b != a) {
							this.append(b);
							
							// should not remove if another has just been added
							// only if it does not exist in b
							if(a) {
								this.remove(a);
							};
						} else if(a && a != b) {
							this.remove(a);
							true;
						};
						i++;
					};
				} else {
					console.log("was array - is single -- confused=!!!!");
					this.empty();
					IMBA_TAGS.htmlelement.__super__.setChildren.apply(this,arguments);
				};
			} else {
				this.empty();
				IMBA_TAGS.htmlelement.__super__.setChildren.apply(this,arguments);
			};
			
			this._children = nodes;// update the cached children?
			return this;
		};
		
		IMBA_TAGS.htmlelement.prototype.content = function (){
			return this._content || this.children().toArray();
		};
		
		IMBA_TAGS.htmlelement.prototype.setText = function (text){
			if(text != this._children) {
				this.dom().textContent = this._children = text;// hmmmm
			};
			return this;
		};
	


}())
},{}],14:[function(require,module,exports){
(function(){


	Imba = {};


}())
},{}],15:[function(require,module,exports){
(function(){


	// externs;
	
	// console.log("required imba/lib/imba/index")
	require('./imba');
	require('./core.events');
	require('./dom');
	
	if(typeof window === 'undefined') {
		require('./dom.server');// hmm -- dont require events?
	} else {
		require('./dom.events');
		require('./dom.virtual');
	};
	
	require('./selector');


}())
},{"./core.events":9,"./dom":11,"./dom.events":10,"./dom.server":12,"./dom.virtual":13,"./imba":14,"./selector":16}],16:[function(require,module,exports){
(function (global){
(function(){


	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	/* @class ImbaSelector */
	function ImbaSelector(sel,scope,nodes){
		this._query = (sel instanceof ImbaSelector) ? (sel.query()) : (sel);
		this._context = scope;
		
		if(nodes) {
			for(var i=0, ary=iter$(nodes), len=ary.length, res=[]; i < len; i++) {
				res.push(tag$wrap(ary[i]));
			};this._nodes = res;
		};
		
		this._lazy = !nodes;
		return this;
	};
	
	global.ImbaSelector = ImbaSelector; // global class 
	
	ImbaSelector.prototype.__query = {};
	ImbaSelector.prototype.query = function(v){ return this._query; }
	ImbaSelector.prototype.setQuery = function(v){ this._query = v; return this; };
	
	
	
	ImbaSelector.prototype.reload = function (){
		this._nodes = null;
		return this;
	};
	
	ImbaSelector.prototype.scope = function (){
		var ctx;
		if(this._scope) {
			return this._scope;
		};
		if(!(ctx = this._context)) {
			return global.document;
		};
		return this._scope = (ctx.toScope) ? (ctx.toScope()) : (ctx);
	};
	
	ImbaSelector.prototype.first = function (){
		return (this._lazy) ? (
			tag$wrap(this._first || (this._first = this.scope().querySelector(this.query())))
		) : (
			this.nodes()[0]
		);
	};
	
	ImbaSelector.prototype.last = function (){
		return this.nodes()[this._nodes.length - 1];
	};
	
	ImbaSelector.prototype.nodes = function (){
		if(this._nodes) {
			return this._nodes;
		};
		var items = this.scope().querySelectorAll(this.query());
		for(var i=0, ary=iter$(items), len=ary.length, res=[]; i < len; i++) {
			res.push(tag$wrap(ary[i]));
		};this._nodes = res;
		this._lazy = false;
		return this._nodes;
	};
	
	ImbaSelector.prototype.count = function (){
		return this.nodes().length;
	};
	ImbaSelector.prototype.len = function (){
		return this.nodes().length;
	};
	ImbaSelector.prototype.any = function (){
		return this.count();
	};
	
	ImbaSelector.prototype.at = function (idx){
		return this.nodes()[idx];
	};
	
	ImbaSelector.prototype.forEach = function (block){
		this.nodes().forEach(block);
		return this;
	};
	
	ImbaSelector.prototype.map = function (block){
		return this.nodes().map(block);
	};
	
	ImbaSelector.prototype.toArray = function (){
		return this.nodes();
	};
	
	// Get the first element that matches the selector, 
	// beginning at the current element and progressing up through the DOM tree
	ImbaSelector.prototype.closest = function (sel){
		this._nodes = this.map(function (node){
			return node.closest(sel);
		});
		return this;
	};
	
	// Get the siblings of each element in the set of matched elements, 
	// optionally filtered by a selector.
	// TODO remove duplicates?
	ImbaSelector.prototype.siblings = function (sel){
		this._nodes = this.map(function (node){
			return node.siblings(sel);
		});
		return this;
	};
	
	// Get the descendants of each element in the current set of matched 
	// elements, filtered by a selector.
	ImbaSelector.prototype.find = function (sel){
		this._nodes = this.__query__(sel.query(),this.nodes());
		return this;
	};
	
	// TODO IMPLEMENT
	// Get the children of each element in the set of matched elements, 
	// optionally filtered by a selector.
	ImbaSelector.prototype.children = function (sel){
		return true;
	};
	
	// TODO IMPLEMENT
	// Reduce the set of matched elements to those that have a descendant that
	// matches the selector or DOM element.
	ImbaSelector.prototype.has = function (){
		return true;
	};
	
	// TODO IMPLEMENT
	ImbaSelector.prototype.__union = function (){
		this.p("called ImbaSelector.__union");
		return this;
	};
	
	// TODO IMPLEMENT
	ImbaSelector.prototype.__intersect = function (){
		this.p("called ImbaSelector.__union");
		return this;
	};
	
	ImbaSelector.prototype.reject = function (blk){
		return this.filter(blk,false);
	};
	
	ImbaSelector.prototype.filter = function (blk,bool){
		if(bool === undefined) bool = true;
		var fn = (blk instanceof Function) && blk || (function (n){
			return n.matches(blk);
		});
		var ary = this.nodes().filter(function (n){
			return fn(n) == bool;
		});// hmm -- not sure about this?
		// if we want to return a new selector for this, we should do that for
		// others as well
		return new ImbaSelector("",this._scope,ary);
	};
	
	// hmm - what is this even for?
	ImbaSelector.prototype.__query__ = function (query,contexts){
		var nodes, i, l;
		var nodes = [],i = 0,l = contexts.length;
		
		while(i < l){
			nodes.push.apply(nodes,contexts[i++].querySelectorAll(query));
		};
		return nodes;
	};
	
	ImbaSelector.prototype.__matches__ = function (){
		return true;
	};
	
	// Proxies
	ImbaSelector.prototype.flag = function (flag){
		return this.forEach(function (n){
			return n.flag(flag);
		});
	};
	
	ImbaSelector.prototype.unflag = function (flag){
		return this.forEach(function (n){
			return n.unflag(flag);
		});
	};
	
	ImbaSelector.prototype.call = function (meth,args){
		var self=this;
		if(args === undefined) args = [];
		return self.forEach(function (n){
			var $1;
			return ((self.setFn(n[($1=meth)]),n[$1])) && (self.fn().apply(n,args));
		});
	};
	
	
	// hmm
	q$ = function (sel,scope){
		return new ImbaSelector(sel,scope);
	};
	
	q$$ = function (sel,scope){
		var el = (scope || global.document).querySelector(sel);
		return el && tag$wrap(el) || null;
	};
	
	// extending tags with query-methods
	// must be a better way to reopen classes
	
		IMBA_TAGS.element.prototype.querySelectorAll = function (q){
			return this._dom.querySelectorAll(q);
		};
		IMBA_TAGS.element.prototype.querySelector = function (q){
			return this._dom.querySelector(q);
		};
		IMBA_TAGS.element.prototype.find = function (sel){
			return new ImbaSelector(sel,this);
		};
	


}())
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],17:[function(require,module,exports){

},{}],18:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":19}],19:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1])(1)
});