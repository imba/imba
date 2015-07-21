(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.imbalang = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(){


	// everything should be moved to this file instead
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
	
	function highlight(code,o){
		if(o === undefined) o = {};
		return compiler.highlight(code,o);
	}; exports.highlight = highlight;


}())
},{"./compiler":2}],2:[function(require,module,exports){
(function (process){
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
	
	var highlighter$=require('./highlighter'), Highlighter=highlighter$.Highlighter;
	
	
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
		var tokens = code instanceof Array ? (code) : (tokenize(code,o));
		try {
			// console.log("Tokens",tokens)
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
		var tokens = tokenize(code,o);
		var ast = parse(tokens,o);
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
		// console.log "should run!"
		main.filename = process.argv[1] = (filename ? (fs.realpathSync(filename)) : ('.'));
		main.moduleCache && (main.moduleCache = {}); // removing all cache?!?
		
		var Module = require('module').Module;
		main.paths = Module._nodeModulePaths(path.dirname(filename));
		
		if (path.extname(main.filename) != '.imba' || require.extensions) {
			return main._compile(compile(code,arguments[1]),main.filename);
		} else {
			return main._compile(code,main.filename);
		};
	}; exports.run = run;
	
	if (require.extensions) {
		require.extensions['.imba'] = function(mod,filename) {
			var content = compile(fs.readFileSync(filename,'utf8'),{filename: filename});
			return mod._compile(content,filename);
		};
	};


}())
}).call(this,require('_process'))
},{"./highlighter":5,"./lexer":6,"./nodes":7,"./parser":8,"./rewriter":9,"./token":10,"_process":13,"fs":11,"module":11,"path":12}],3:[function(require,module,exports){
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
	
	// create separate error-types with all the logic
	
	/* @class ImbaParseError */
	function ImbaParseError(e,o){
		this.error = e;
		this.message = e.message;
		this.filename = e.filename;
		this.line = e.line;
		this._options = o || {};
		this;
	};
	
	subclass$(ImbaParseError,Error);
	exports.ImbaParseError = ImbaParseError; // export class 
	ImbaParseError.wrap = function (err){
		// what about the stacktrace?
		return new ImbaParseError(err);
	};
	
	
	
	ImbaParseError.prototype.set = function (opts){
		this._options || (this._options = {});
		for (var i=0, keys=Object.keys(opts), l=keys.length; i < l; i++){
			this._options[keys[i]] = opts[keys[i]];
		};
		return this;
	};
	
	ImbaParseError.prototype.start = function (){
		var o = this._options;
		var idx = o.pos - 1;
		var tok = o.tokens && o.tokens[idx];
		while (tok && tok._col == -1){
			tok = o.tokens[--idx];
		};
		return tok;
	};
	
	
	ImbaParseError.prototype.toJSON = function (){
		var o = this._options;
		var tok = this.start();
		// var tok = o:tokens and o:tokens[o:pos - 1]
		// var loc = tok and [tok.@loc,tok.@loc + (tok.@len or tok.@value:length)] or [0,0]
		return {warn: true,message: this.message,loc: tok.region(),col: tok._col,line: tok._line};
	};
	


}())
},{}],4:[function(require,module,exports){
(function(){


	function brace(str){
		var lines = str.match(/\n/);
		// what about indentation?
		
		if (lines) {
			return '{' + str + '\n}';
		} else {
			return '{\n' + str + '\n}';
		};
	}; exports.brace = brace;
	
	function flatten(arr){
		var out = [];
		arr.forEach(function(v) {
			return v instanceof Array ? (out.push.apply(out,flatten(v))) : (out.push(v));
		});
		return out;
	}; exports.flatten = flatten;
	
	
	function pascalCase(str){
		return str.replace(/(^|[\-\_\s])(\w)/g,function(m,v,l) {
			return l.toUpperCase();
		});
	}; exports.pascalCase = pascalCase;
	
	function camelCase(str){
		str = String(str);
		// should add shortcut out
		return str.replace(/([\-\_\s])(\w)/g,function(m,v,l) {
			return l.toUpperCase();
		});
	}; exports.camelCase = camelCase;
	
	function snakeCase(str){
		var str = str.replace(/([\-\s])(\w)/g,'_');
		return str.replace(/()([A-Z])/g,"_$1",function(m,v,l) {
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
		str = String(str);
		var end = str.charAt(str.length - 1);
		
		if (end == '=') {
			str = 'set' + str[0].toUpperCase() + str.slice(1,-1);
		};
		
		if (str.indexOf("-") >= 0) {
			str = str.replace(/([\-\s])(\w)/g,function(m,v,l) {
				return l.toUpperCase();
			});
		};
		
		return str;
	}; exports.symbolize = symbolize;
	
	
	function indent(str){
		return String(str).replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
	}; exports.indent = indent;
	
	function bracketize(str,ind){
		if(ind === undefined) ind = true;
		if (ind) { str = "\n" + indent(str) + "\n" };
		return '{' + str + '}';
	}; exports.bracketize = bracketize;
	
	function parenthesize(str){
		return '(' + String(str) + ')';
	}; exports.parenthesize = parenthesize;


}())
},{}],5:[function(require,module,exports){
(function(){


	var lexer = require('./lexer');
	
	/* @class Highlighter */
	function Highlighter(code,tokens,ast,options){
		if(options === undefined) options = {};
		this._code = code;
		this._tokens = tokens;
		this._ast = ast;
		this._options = options;
		return this;
	};
	
	exports.Highlighter = Highlighter; // export class 
	
	Highlighter.prototype.__options = {name: 'options'};
	Highlighter.prototype.options = function(v){ return this._options; }
	Highlighter.prototype.setOptions = function(v){ this._options = v; return this; };
	
	
	
	Highlighter.prototype.process = function (){
		var tok, m;
		var marked = require('marked');
		var str = this._code;
		var pos = this._tokens.length;
		
		var sections = [];
		
		try {
			this._ast.analyze({});
		} catch (e) {
			null;
		};
		
		var res = "";
		// should rather add onto another string instead of reslicing the same string on every iteration
		
		if (false) {
			while (tok = this._tokens[--pos]){
				if (tok._col == -1) { continue };
				var loc = tok._loc;
				var len = tok._len || tok._value.length;
				true;
				console.log(("token " + loc));
				str = str.substring(0,loc - 1) + '<a>' + str.substr(loc,len) + '</a>' + str.slice(loc + len);
			};
		};
		
		pos = 0;
		var caret = 0;
		
		var classes = {
			'+': 'op add math',
			'-': 'op sub math',
			'=': 'op eq',
			'/': 'op div math',
			'*': 'op mult math',
			'?': 'op ternary',
			',': 'comma',
			':': 'colon',
			'[': ['s','sbl'],
			']': ['s','sbr'],
			'math': 'op math',
			'forin': 'keyword in',
			'string': 'str',
			'compare': 'op compare',
			'herecomment': ['blockquote','comment'],
			'relation': 'keyword relation',
			'from': 'keyword from',
			'logic': 'keyword logic',
			'post_if': 'keyword if'
		};
		
		var OPEN = {
			'tag_start': 'tag',
			'selector_start': 'sel',
			'indent': '_indent',
			'(': 'paren',
			'{': 'curly',
			'[': 'square',
			'("': 'str'
		};
		
		var CLOSE = {
			'tag_end': 'tag',
			'selector_end': 'sel',
			'outdent': '_indent',
			')': 'paren',
			']': 'square',
			'}': 'curly',
			'")': 'str'
		};
		
		var open,close;
		
		function comments(sub){
			return sub.replace(/(\#)([^\n]*)/g,function(m,s,q) {
				// q = marked(q)
				// q = 
				return "<q><s>" + s + "</s>" + q + "</q>";
			});
		};
		
		function split(){
			this.groups().push({html: res});
			return res = "";
		};
		
		function addSection(content,pars){
			// if type == 'code'
			//	content = '<pre><code>' + content + '</code></pre>'
			if(!pars||pars.constructor !== Object) pars = {};
			var type = pars.type !== undefined ? pars.type : 'code';
			var reset = pars.reset !== undefined ? pars.reset : true;
			var section = {content: content,type: type};
			sections.push(section);
			if (reset) { res = "" };
			return section;
		};
		
		while (tok = this._tokens[pos++]){
			var next = this._tokens[pos];
			
			if (close) {
				res += "</i>";
				close = null;
			};
			
			var typ = tok._type.toLowerCase();
			loc = tok._loc;
			var val = tok._value;
			len = tok._len; // or tok.@value:length
			
			if (loc > caret) {
				var add = str.substring(caret,loc);
				res += comments(add);
				caret = loc;
			};
			
			
			close = CLOSE[typ];
			
			if (open = OPEN[typ]) {
				open = OPEN[val] || open;
				res += ("<i class='" + open + "'>");
			};
			
			// elif var close = CLOSE[typ]
			//	res += "</i>"
			//	# should close after?
			//	# either on the next 
			
			// adding some interpolators
			// if loc and val == '("'
			// 	res += '<i>'
			// elif loc and val == '")'
			// 	res += '</i>'
			
			if (len == 0 || typ == 'terminator' || typ == 'indent' || typ == 'outdent') {
				continue;
			};
			
			if (tok._col == -1) {
				continue;
			};
			
			var node = 'span';
			var content = str.substr(loc,len);
			var cls = classes[typ] || typ;
			
			if (cls instanceof Array) {
				node = cls[0];
				cls = cls[1];
			};
			
			cls = cls.split(" ");
			// console.log "adding token {tok.@type}"
			if (lexer.ALL_KEYWORDS.indexOf(typ) >= 0) {
				cls.unshift('keyword');
			};
			
			caret = loc + len;
			
			if (typ == 'identifier') {
				if (tok._variable) {
					// console.log "IS VARIABLEREF",tok.@value
					cls.push('_lvar');
					cls.push("ref-" + tok._variable._ref);
				} else if (m = tok._meta) {
					// console.log "META"
					if (m.type == 'ACCESS') { cls.push('access') };
				};
			};
			
			
			if (typ == 'herecomment') {
				addSection(res); // resetting
				content = content.replace(/(^\s*###\n*|\n*###\s*$)/g,'<s>$1</s>');
				// content = marked(content)
			};
			
			if (typ == 'string') {
				content = content.replace(/(^['"]|['"]$)/g,function(m) {
					return '<s>' + m + '</s>';
				});
			};
			
			res += ("<" + node + " class='" + (cls.join(" ")) + "'>") + content + ("</" + node + ">");
			
			if (typ == 'herecomment') {
				addSection(res,{type: 'comment'}); // reset here as well
			};
			
			// true
			// console.log "token {loc}"
			// str = str.substring(0,loc - 1) + '<a>' + str.substr(loc,len) + '</a>' + str.slice(loc + len)
		};
		
		if (caret < str.length - 1) {
			res += comments(str.slice(caret));
		};
		
		// split # convert to group?
		
		var json = {sections: []};
		
		addSection(res,{type: 'code'});
		
		var html = '';
		html += '<code>';
		
		for (var i=0, len_=sections.length, section; i < len_; i++) {
			section = sections[i];var out = section.content;
			html += ("<div class='" + (section.type) + " imbalang'>") + out + '</div>';
			// html += section:content # '<pre><code>' + group:html + '</code></pre>'
		};
		html += '</code>';
		
		if (!(this.options().bare)) {
			html = '<link rel="stylesheet" href="imba.css" media="screen"></link><script src="imba.js"></script>' + html + '<script src="hl.js"></script>';
		};
		
		return html;
	};
	


}())
},{"./lexer":6,"marked":14}],6:[function(require,module,exports){
(function(){


	function idx$(a,b){
		return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
	};
	
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
	
	var ALL_KEYWORDS;
	// externs;
	
	var T = require('./token');
	var Token = T.Token;
	
	var rw = require('./rewriter');
	var Rewriter = rw.Rewriter;
	var INVERSES = rw.INVERSES;
	
	var K = 0;
	
	var ERR = require('./errors');
	
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
		'when','def','tag','do','elif','begin','var','let','self','await','import'
	];
	
	var IMBA_CONTEXTUAL_KEYWORDS = ['extend','static','local','export','global','prop'];
	
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
	
	var IMBA_ALIASES = Object.keys(IMBA_ALIAS_MAP);
	IMBA_KEYWORDS = IMBA_KEYWORDS.concat(IMBA_ALIASES); // .concat(IMBA_CONTEXTUAL_KEYWORDS)
	// var ALL_KEYWORDS = JS_KEYWORDS.concat(IMBA_KEYWORDS)
	// FixedArray for performance
	module.exports.ALL_KEYWORDS = ALL_KEYWORDS = [
		'true','false','null','this',
		'new','delete','typeof','in','instanceof',
		'throw','break','continue','debugger',
		'if','else','switch','for','while','do','try','catch','finally',
		'class','extends','super','module','return',
		'undefined','then','unless','until','loop','of','by',
		'when','def','tag','do','elif','begin','var','let','self','await','import',
		'and','or','is','isnt','not','yes','no','isa','case','nil'
	];
	
	// The list of keywords that are reserved by JavaScript, but not used, or are
	// used by Imba internally. We throw an error when these are encountered,
	// to avoid having a JavaScript error at runtime.  # 'var', 'let', - not inside here
	var RESERVED = ['case','default','function','void','with','const','enum','native'];
	var STRICT_RESERVED = ['case','function','void','const'];
	
	// The superset of both JavaScript keywords and reserved words, none of which may
	// be used as identifiers or properties.
	var JS_FORBIDDEN = JS_KEYWORDS.concat(RESERVED);
	
	var METHOD_IDENTIFIER = /^((([\x23]?[\$A-Za-z_\x7f-\uffff][$\-\w\x7f-\uffff]*)([\=\!]?))|(<=>|\|(?![\|=])))/;
	// removed ~=|~| |&(?![&=])
	
	// Token matching regexes.
	// added hyphens to identifiers now - to test
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
	
	var OPERATOR = /^(?:[-=]=>|===|->|!==|[-+*\/%<>&|^!?=]=|=<|>>>=?|([-+:])\1|([&|<>])\2=?|\?\.|\?\:|\.{2,3}|\*(?=[a-zA-Z\_]))/;
	
	// FIXME splat should only be allowed when the previous thing is spaced or inside call?
	
	var WHITESPACE = /^[^\n\S]+/;
	
	var COMMENT = /^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)/;
	// COMMENT    = /^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)|^(?:\s*(#\s.*|#\s*$))+/
	var INLINE_COMMENT = /^(\s*)(#[ \t](.*)|#[ \t]?(?=\n|$))+/;
	
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
	
	// expensive?
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
	var OP_METHODS = ['<=>','<<','..'];
	
	// Mathematical tokens.
	var MATH = ['*','/','%','∪','∩','√'];
	
	// Relational tokens that are negatable with `not` prefix.
	var RELATION = ['IN','OF','INSTANCEOF','ISA'];
	
	// Boolean tokens.
	var BOOL = ['TRUE','FALSE','NULL','UNDEFINED'];
	
	// Our list is shorter, due to sans-parentheses method calls.
	var NOT_REGEX = ['NUMBER','REGEX','BOOL','TRUE','FALSE','++','--',']'];
	
	// If the previous token is not spaced, there are more preceding tokens that
	// force a division parse:
	var NOT_SPACED_REGEX = ['NUMBER','REGEX','BOOL','TRUE','FALSE','++','--',']',')','}','THIS','SELF','IDENTIFIER','STRING'];
	
	// Tokens which could legitimately be invoked or indexed. An opening
	// parentheses or bracket following these tokens will be recorded as the start
	// of a function invocation or indexing operation.
	// really?!
	
	var UNFINISHED = ['\\','.','?.','?:','UNARY','MATH','+','-','SHIFT','RELATION','COMPARE','LOGIC','COMPOUND_ASSIGN','THROW','EXTENDS'];
	
	// } should not be callable anymore!!! '}', '::',
	var CALLABLE = ['IDENTIFIER','STRING','REGEX',')',']','THIS','SUPER','TAG_END','IVAR','GVAR','SELF','CONST','NEW','ARGVAR','SYMBOL','RETURN'];
	// var INDEXABLE = CALLABLE.concat 'NUMBER', 'BOOL', 'TAG_SELECTOR', 'IDREF', 'ARGUMENTS','}' # are booleans indexable? really?
	// optimize for FixedArray
	var INDEXABLE = [
		'IDENTIFIER','STRING','REGEX',')',']','THIS','SUPER','TAG_END','IVAR','GVAR','SELF','CONST','NEW','ARGVAR','SYMBOL','RETURN',
		'NUMBER','BOOL','TAG_SELECTOR','IDREF','ARGUMENTS','}'
	];
	
	// console.log NOT_SPACED_REGEX:length
	
	var GLOBAL_IDENTIFIERS = ['global','exports','require'];
	
	// STARTS = [']',')','}','TAG_ATTRS_END']
	// ENDS = [']',')','}','TAG_ATTRS_END']
	
	// Tokens that, when immediately preceding a `WHEN`, indicate that the `WHEN`
	// occurs at the start of a line. We disambiguate these from trailing whens to
	// avoid an ambiguity in the grammar.
	var LINE_BREAK = ['INDENT','OUTDENT','TERMINATOR'];
	
	
	/* @class LexerError */
	function LexerError(message,file,line){
		this.message = message;
		this.file = file;
		this.line = line;
		return this;
	};
	
	subclass$(LexerError,SyntaxError);
	exports.LexerError = LexerError; // export class 
	
	
	
	
	function last(array,back){
		if(back === undefined) back = 0;
		return array[array.length - back - 1];
	};
	
	function countOld(str,substr){
		console.log(("count number of in strin " + (str.length)));
		var num = 0;
		var pos = 0;
		if (!(substr.length)) {
			return 1 / 0;
		};
		
		while (pos = 1 + str.indexOf(substr,pos)){
			num++;
		};
		return num;
	};
	
	function count(str,substr){
		return str.split(substr).length - 1;
	};
	
	function repeatString(str,times){
		var res = '';
		while (times > 0){
			if (times % 2 == 1) {
				res += str;
			};
			str += str;
			times >>= 1;
		};
		return res;
	};
	
	var tT = T.typ;
	var tV = T.val;
	var tTs = T.setTyp;
	var tVs = T.setVal;
	
	// The Lexer class reads a stream of Imba and divvies it up into tokidged
	// tokens. Some potential ambiguity in the grammar has been avoided by
	// pushing some extra smarts into the Lexer.
	
	// Based on the original lexer.coffee from CoffeeScript
	/* @class Lexer */
	function Lexer(){
		this.reset();
		this;
	};
	
	exports.Lexer = Lexer; // export class 
	
	
	Lexer.prototype.reset = function (){
		this._code = null;
		this._chunk = null; // The remainder of the source code.
		this._opts = null;
		
		this._indent = 0; // The current indentation level.
		this._indebt = 0; // The over-indentation at the current level.
		this._outdebt = 0; // The under-outdentation at the current level.
		
		this._indents = []; // The stack of all current indentation levels.
		this._ends = []; // The stack for pairing up tokens.
		this._contexts = []; // suplements @ends
		this._scopes = [];
		this._nextScope = null; // the scope to add on the next indent
		// should rather make it like a statemachine that moves from CLASS_DEF to CLASS_BODY etc
		// Things should compile differently when you are in a CLASS_BODY than when in a DEF_BODY++
		
		this._tokens = []; // Stream of parsed tokens in the form `['TYPE', value, line]`.
		this._seenFor = false;
		
		this._line = 0; // The current line.
		this._col = 0;
		this._loc = 0;
		this._locOffset = 0;
		
		this._end = null;
		this._char = null;
		this._bridge = null;
		this._last = null;
		this._lastTyp = '';
		this._lastVal = null;
		return this;
	};
	
	Lexer.prototype.jisonBridge = function (jison){
		return this._bridge = {
			lex: T.lex,
			setInput: function(tokens) {
				this.tokens = tokens;
				return this.pos = 0;
			},
			
			upcomingInput: function() {
				return "";
			}
		};
	};
	
	
	Lexer.prototype.tokenize = function (code,o){
		
		var tok;
		if(o === undefined) o = {};
		if (code.length == 0) {
			return [];
		};
		// console.log "code is {code}"
		// if true # !o:inline
		if (WHITESPACE.test(code)) {
			// console.log "is empty?"
			code = ("\n" + code);
			if (code.match(/^\s*$/g)) { return [] };
		};
		
		code = code.replace(/\r/g,'').replace(TRAILING_SPACES,'');
		
		this._last = null;
		this._lastTyp = null;
		this._lastVal = null;
		
		this._code = code; // The remainder of the source code.
		this._opts = o;
		this._line = o.line || 0; // The current line.
		this._locOffset = o.loc || 0;
		// what about col here?
		
		// @indent  = 0 # The current indentation level.
		// @indebt  = 0 # The over-indentation at the current level.
		// @outdebt = 0 # The under-outdentation at the current level.
		// @indents = [] # The stack of all current indentation levels.
		// @ends    = [] # The stack for pairing up tokens.
		// @tokens  = [] # Stream of parsed tokens in the form `['TYPE', value, line]`.
		// @char = nil
		
		if (o.profile) { console.time("tokenize:lexer") };
		this.parse(code);
		if (!(o.inline)) this.closeIndentation();
		if (tok = this._ends.pop()) { this.error(("missing " + tok)) };
		if (o.profile) { console.timeEnd("tokenize:lexer") };
		if (o.rewrite == false || o.norewrite) { return this._tokens };
		return new Rewriter().rewrite(this._tokens,o);
	};
	
	Lexer.prototype.parse = function (code){
		var i = 0;
		var pi = 0;
		var ln = this._line;
		// @chunk = code
		
		while (this._chunk = code.slice(i)){
			if (this._line != ln) {
				this._col = this._colOffset || 0;
				ln = this._line;
			};
			
			this._loc = this._locOffset + i;
			pi = (this._end == 'TAG' && this.tagContextToken()) || this.basicContext();
			this._col += pi;
			i += pi;
		};
		
		return;
	};
	
	
	Lexer.prototype.basicContext = function (){
		return this.selectorToken() || this.symbolToken() || this.methodNameToken() || this.identifierToken() || this.whitespaceToken() || this.lineToken() || this.commentToken() || this.heredocToken() || this.tagToken() || this.stringToken() || this.numberToken() || this.regexToken() || this.jsToken() || this.literalToken() || 0;
	};
	
	
	Lexer.prototype.context = function (){
		return this._ends[this._ends.length - 1];
	};
	
	Lexer.prototype.inContext = function (key){
		var o = this._contexts[this._contexts.length - 1];
		return o && o[key];
	};
	
	Lexer.prototype.pushEnd = function (val){
		// console.log "pushing end",val
		this._ends.push(val);
		this._contexts.push(null);
		this._end = val;
		return this;
	};
	
	Lexer.prototype.popEnd = function (val){
		this._ends.pop();
		this._contexts.pop();
		this._end = this._ends[this._ends.length - 1];
		return this;
	};
	
	Lexer.prototype.queueScope = function (val){
		// console.log("pushing scope {val} - {@indents} {@indents:length}")
		// @scopes.push(val) # no no
		this._scopes[this._indents.length] = val;
		return this;
	};
	
	Lexer.prototype.popScope = function (val){
		this._scopes.pop();
		return this;
	};
	
	Lexer.prototype.getScope = function (){
		return this._scopes[this._indents.length - 1];
	};
	
	Lexer.prototype.scope = function (sym,opts){
		var len = this._ends.push(this._end = sym);
		this._contexts.push(opts || null);
		return sym;
	};
	
	
	Lexer.prototype.closeSelector = function (){
		if (this._end == '%') {
			this.token('SELECTOR_END','%',0);
			return this.pair('%');
		};
	};
	
	
	Lexer.prototype.openDef = function (){
		return this.pushEnd('DEF');
	};
	
	
	Lexer.prototype.closeDef = function (){
		if (this.context() == 'DEF') {
			var pop;
			var prev = last(this._tokens);
			// console.log "close def {prev}"
			// console.log('closeDef with last>',prev)
			if (tT(prev) == 'DEF_FRAGMENT') {
				true;
			} else {
				if (tT(prev) == 'TERMINATOR') {
					// console.log "here?!??"
					pop = this._tokens.pop();
				};
				
				this.token('DEF_BODY','DEF_BODY',0);
				if (pop) { this._tokens.push(pop) };
			};
			
			
			this.pair('DEF');
		};
		return;
	};
	
	
	
	Lexer.prototype.tagContextToken = function (){
		var match;
		if (match = TAG_TYPE.exec(this._chunk)) {
			this.token('TAG_TYPE',match[0],match[0].length);
			return match[0].length;
		};
		
		if (match = TAG_ID.exec(this._chunk)) {
			var input = match[0];
			this.token('TAG_ID',input,input.length);
			return input.length;
		};
		
		return 0;
	};
	
	
	Lexer.prototype.tagToken = function (){
		var match, ary;
		if (!(match = TAG.exec(this._chunk))) { return 0 };
		var ary=iter$(match);var input = ary[0],type = ary[1],identifier = ary[2];
		
		if (type == '<') {
			this.token('TAG_START','<',1);
			this.pushEnd(INVERSES.TAG_START);
			
			if (identifier) {
				if (identifier.substr(0,1) == '{') {
					return type.length;
				} else {
					this.token('TAG_NAME',input.substr(1),0);
				};
			};
		};
		
		return input.length;
	};
	
	
	Lexer.prototype.selectorToken = function (){
		var ary, string;
		var match;
		
		// special handling if we are in this context
		if (this._end == '%') {
			var chr = this._chunk.charAt(0);
			var open = this.inContext('open');
			
			// should add for +, ~ etc
			// should maybe rather look for the correct type of character?
			
			if (open && (chr == ' ' || chr == '\n' || chr == ',' || chr == '+' || chr == '~' || chr == ')' || chr == ']')) {
				// console.log "close this selector directly"
				this.token('SELECTOR_END','%',0);
				this.pair('%');
				return 0;
			};
			
			if (match = SELECTOR_COMBINATOR.exec(this._chunk)) {
				
				this.token('SELECTOR_COMBINATOR',match[1] || " ");
				return match[0].length;
			} else if (match = SELECTOR_PART.exec(this._chunk)) {
				var type = match[1];
				var id = match[2];
				
				switch (type) {
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
				
				this.token(tokid,match[2],match[0].length);
				return match[0].length;
			} else if (chr == '[') {
				this.token('[','[',1);
				this.pushEnd(']');
				if (match = SELECTOR_ATTR.exec(this._chunk)) {
					this.token('IDENTIFIER',match[1],0);
					this.token('SELECTOR_ATTR_OP',match[2],0);
					return match[0].length;
				};
				return 1;
			} else if (chr == '|') {
				var tok = this._tokens[this._tokens.length - 1];
				tTs(tok,'SELECTOR_NS');
				// tok[0] = 'SELECTOR_NS' # FIX
				return 1;
			} else if (chr == ',') {
				this.token('SELECTOR_GROUP',',',1);
				return 1;
			} else if (chr == '*') {
				this.token('UNIVERSAL_SELECTOR','*',1);
				return 1;
			} else if (chr == ')') {
				this.pair('%');
				this.token('SELECTOR_END',')',1);
				return 1;
			} else if (idx$(chr,[')','}',']','']) >= 0) {
				// console.log "here, no??? {chr}"
				// should we pair it BEFORE the closing ')'
				this.pair('%');
				return 0;
			};
			
			// how to get out of the scope?
		};
		
		
		if (!(match = SELECTOR.exec(this._chunk))) { return 0 };
		var ary=iter$(match);var input = ary[0],id = ary[1],kind = ary[2];
		
		// this is a closed selector
		if (kind == '(') {
			// token '(','('
			this.token('SELECTOR_START',id);
			// self.pushEnd(')') # are we so sure about this?
			this.pushEnd('%');
			
			// @ends.push ')'
			// @ends.push '%'
			return id.length + 1;
		} else if (id == '%') {
			// we are already scoped in on a selector
			if (this.context() == '%') { return 1 };
			this.token('SELECTOR_START',id);
			// this is a separate - scope. Full selector should rather be $, and keep the single selector as %
			
			this.scope('%',{open: true});
			// @ends.push '%'
			// make sure a terminator breaks out
			return id.length;
		} else {
			return 0;
		};
		
		if ((id == '%' || id == '$') && ['%','$','@','(','['].indexOf(chr) >= 0) {
			var idx = 2;
			
			
			// VERY temporary way of solving this
			if ((chr == '%' || chr == '$' || chr == '@')) {
				id += chr;
				idx = 3;
				chr = this._chunk.charAt(2);
			};
			
			
			if (chr == '(') {
				if (!(string = this.balancedSelector(this._chunk,')'))) { return 0 };
				if (0 < string.indexOf('{',1)) {
					this.token('SELECTOR',id);
					this.interpolateString(string.slice(idx,-1));
					return string.length;
				} else {
					this.token('SELECTOR',id);
					this.token('(','(');
					this.token('STRING','"' + string.slice(idx,-1) + '"');
					this.token(')',')');
					return string.length;
				};
			} else if (chr == '[') {
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
		// we can optimize this by after a def simply
		// fetching all the way after the def until a space or (
		// and then add this to the def-token itself (as with fragment)
		
		if (this._chunk.charAt(0) == ' ') { return 0 };
		
		var match;
		// var outerctx = @ends[@ends:length - 2]
		// var innerctx = @ends[@ends:length - 1]
		
		if (this._end == ')') {
			var outerctx = this._ends[this._ends.length - 2];
			// weird assumption, no?
			// console.log 'context is inside!!!'
			if (outerctx == '%' && (match = TAG_ATTR.exec(this._chunk))) {
				this.token('TAG_ATTR_SET',match[1]);
				return match[0].length;
			};
		};
		
		if (!(match = METHOD_IDENTIFIER.exec(this._chunk))) {
			return 0;
		};
		// var prev = last @tokens
		var length = match[0].length;
		
		var id = match[0];
		var ltyp = this._lastTyp;
		var typ = 'IDENTIFIER';
		var pre = id.charAt(0);
		var space = false;
		
		var m4 = match[4]; // might be out of bounds? should rather check charAt
		// drop match 4??
		
		// should this not quit here in practically all cases?
		if (!((ltyp == '.' || ltyp == 'DEF') || (m4 == '!' || m4 == '?') || match[5])) {
			return 0;
		};
		
		// again, why?
		if (id == 'self' || id == 'this' || id == 'super') { // in ['SELF','THIS']
			return 0;
		};
		
		if (id == 'new') {
			typ = 'NEW';
		};
		
		if (id == '...' && [',','(','CALL_START','BLOCK_PARAM_START','PARAM_START'].indexOf(ltyp) >= 0) {
			return 0;
		};
		
		if (id == '|') {
			// hacky way to implement this
			// with new lexer we'll use { ... } instead, and assume object-context,
			// then go back and correct when we see the context is invalid
			if (ltyp == '(' || ltyp == 'CALL_START') {
				this.token('DO','DO',0);
				this.pushEnd('|');
				// @ends.push '|'
				this.token('BLOCK_PARAM_START',id,0);
				return length;
			} else if (ltyp == 'DO' || ltyp == '{') {
				// @ends.push '|'
				this.pushEnd('|');
				this.token('BLOCK_PARAM_START',id,0);
				return length;
			} else if (this._ends[this._ends.length - 1] == '|') {
				this.token('BLOCK_PARAM_END','|',0);
				this.pair('|');
				return length;
			} else {
				return 0;
			};
		};
		
		// whaat?
		// console.log("method identifier",id)
		if ((['&','^','<<','<<<','>>'].indexOf(id) >= 0 || (id == '|' && this.context() != '|'))) {
			return 0;
		};
		
		if (OP_METHODS.indexOf(id) >= 0) {
			space = true;
		};
		
		// not even anything we should use?!?
		if (pre == '@') {
			typ = 'IVAR';
		} else if (pre == '$') {
			typ = 'GVAR';
		} else if (pre == '#') {
			typ = 'TAGID';
		} else if (CONST_IDENTIFIER.test(pre) || id == 'require' || id == 'global' || id == 'exports') {
			// really? seems very strange
			// console.log('global!!',typ,id)
			typ = 'CONST';
		};
		
		// what is this really for?
		if (match[5] && ['IDENTIFIER','CONST','GVAR','CVAR','IVAR','SELF','THIS',']','}',')','NUMBER','STRING','IDREF'].indexOf(ltyp) >= 0) {
			this.token('.','.',0);
		};
		
		this.token(typ,id,length);
		
		if (space) {
			this._last.spaced = true;
		};
		
		return length;
	};
	
	
	Lexer.prototype.inTag = function (){
		var len = this._ends.length;
		if (len > 0) {
			var ctx0 = this._ends[len - 1];
			var ctx1 = len > 1 ? (this._ends[len - 2]) : (ctx0);
			return ctx0 == 'TAG_END' || (ctx1 == 'TAG_END' && ctx0 == 'OUTDENT');
		};
		return false;
	};
	
	Lexer.prototype.isKeyword = function (id){
		if ((id == 'attr' || id == 'prop')) {
			var scop = this.getScope();
			var incls = scop == 'CLASS' || scop == 'TAG';
			// var scopes = @indents.map(|ind,i| @scopes[i] or 'NONE')
			// console.log "id is prop: {scopes.join(" -> ")} | {@indents.join(" -> ")}"
			if (incls) { return true };
		};
		
		// if incls and (id == 'attr' or id == 'prop')
		// 	return true
		
		// if id == 'prop' or id == 'attr'
		// 	# console.log "is prop keyword?? {scop}"
		// 	return false unless scop == 'CLASS' or scop == 'TAG'
		
		return ALL_KEYWORDS.indexOf(id) >= 0;
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
		
		var ctx0 = this._ends[this._ends.length - 1];
		var ctx1 = this._ends[this._ends.length - 2];
		var innerctx = ctx0;
		var typ;
		var reserved = false;
		
		var addLoc = false;
		var inTag = ctx0 == 'TAG_END' || (ctx1 == 'TAG_END' && ctx0 == 'OUTDENT');
		
		// console.log ctx1,ctx0
		
		if (inTag && (match = TAG_ATTR.exec(this._chunk))) {
			// console.log 'TAG_ATTR IN tokid'
			// var prev = last @tokens
			// if the prev is a terminator, we dont really need to care?
			if (this._lastTyp != 'TAG_NAME') {
				if (this._lastTyp == 'TERMINATOR') {
					// console.log('prev was terminator -- drop it?')
					true;
				} else {
					this.token(",",",");
				};
			};
			
			var l = match[0].length;
			
			this.token('TAG_ATTR',match[1],l - 1); // add to loc?
			this._loc += l - 1;
			this.token('=','=',1);
			return l;
		};
		
		// see if this is a plain object-key
		// way too much logic going on here?
		// the ast should normalize whether keys
		// are accessable as keys or strings etc
		if (match = OBJECT_KEY.exec(this._chunk)) {
			var id = match[1];
			typ = 'IDENTIFIER';
			
			this.token(typ,id,match[0].length);
			this.token(':',':');
			
			return match[0].length;
		};
		
		if (!(match = IDENTIFIER.exec(this._chunk))) {
			return 0;
		};
		
		var ary=iter$(match);var input = ary[0],id = ary[1],typ = ary[2],m3 = ary[3],m4 = ary[4],colon = ary[5];
		
		// What is the logic here?
		if (id == 'own' && this.lastTokenType() == 'FOR') {
			this.token('OWN',id);
			return id.length;
		};
		
		var prev = last(this._tokens);
		var lastTyp = this._lastTyp;
		
		// should we force this to be an identifier even if it is a reserved word?
		// this should only happen for when part of object etc
		// will prev ever be @???
		var forcedIdentifier;
		
		// again
		forcedIdentifier = colon || lastTyp == '.' || lastTyp == '?.'; // in ['.', '?.'
		
		
		// temp hack! need to solve for other keywords etc as well
		// problem appears with ternary conditions.
		
		// well -- it should still be an indentifier if in object?
		// forcedIdentifier = no if id in ['undefined','break']
		
		if (colon && lastTyp == '?') { forcedIdentifier = false }; // for ternary
		
		// if we are not at the top level? -- hacky
		if (id == 'tag' && this._chunk.indexOf("tag(") == 0) { // @chunk.match(/^tokid\(/)
			forcedIdentifier = true;
		};
		
		var isKeyword = false;
		
		// console.log "match",match
		// console.log "typ is {typ}"
		// little reason to check for this right here? but I guess it is only a simple check
		if (typ == '$' && ARGVAR.test(id)) { // id.match(/^\$\d$/)
			// console.log "TYP $"
			if (id == '$0') {
				typ = 'ARGUMENTS';
			} else {
				typ = 'ARGVAR';
				id = id.substr(1);
			};
		} else if (typ == '@') {
			typ = 'IVAR';
			
			// id:reserved = yes if colon
		} else if (typ == '#') {
			// we are trying to move to generic tokens,
			// so we are starting to splitting up the symbols and the items
			// we'll see if that works
			typ = 'IDENTIFIER';
			this.token('#','#');
			id = id.substr(1);
		} else if (typ == '@@') {
			typ = 'CVAR';
		} else if (typ == '$' && !colon) {
			typ = 'GVAR';
		} else if (CONST_IDENTIFIER.test(id) || id == 'require' || id == 'global' || id == 'exports') {
			// should not hardcode this
			typ = 'CONST';
		} else if (id == 'elif') {
			this.token('ELSE','else');
			this.token('IF','if');
			return id.length;
		} else {
			typ = 'IDENTIFIER';
		};
		
		
		
		// this catches all 
		if (!forcedIdentifier && (isKeyword = this.isKeyword(id))) {
			// (id in JS_KEYWORDS or id in IMBA_KEYWORDS)
			typ = id.toUpperCase();
			addLoc = true;
			
			// clumsy - but testing performance
			if (typ == 'YES') {
				typ = 'TRUE';
			} else if (typ == 'NO') {
				typ = 'FALSE';
			} else if (typ == 'NIL') {
				typ = 'NULL';
			} else if (typ == 'VAR') {
				if (this._lastVal == 'export') {
					tTs(prev,'EXPORT');
				};
			} else if (typ == 'IF' || typ == 'ELSE' || typ == 'TRUE' || typ == 'FALSE' || typ == 'NULL') {
				true;
			} else if (typ == 'TAG') {
				this.pushEnd('TAG');
				// @ends.push('TAG')
			} else if (typ == 'DEF') {
				// should probably shift context and optimize this
				this.openDef();
			} else if (typ == 'DO') {
				if (this.context() == 'DEF') this.closeDef();
			} else if (typ == 'WHEN' && LINE_BREAK.indexOf(this.lastTokenType()) >= 0) {
				typ = 'LEADING_WHEN';
			} else if (typ == 'FOR') {
				this._seenFor = true;
			} else if (typ == 'UNLESS') {
				typ = 'IF'; // WARN
			} else if (UNARY.indexOf(typ) >= 0) {
				typ = 'UNARY';
			} else if (RELATION.indexOf(typ) >= 0) {
				if (typ != 'INSTANCEOF' && typ != 'ISA' && this._seenFor) {
					typ = 'FOR' + typ; // ?
					this._seenFor = false;
				} else {
					typ = 'RELATION';
					if (this.value().toString() == '!') {
						this._tokens.pop(); // is fucked up??!
						// WARN we need to keep the loc, no?
						id = '!' + id;
					};
				};
			};
		};
		
		if (id == 'super') {
			typ = 'SUPER';
		};
		
		// do we really want to check this here
		if (!forcedIdentifier) {
			// should already have dealt with this
			
			if (isKeyword && IMBA_ALIASES.indexOf(id) >= 0) { id = IMBA_ALIAS_MAP[id] };
			// these really should not go here?!?
			switch (id) {
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
		if (typ == 'CLASS' || typ == 'DEF' || typ == 'TAG') {
			this.queueScope(typ);
			
			var i = this._tokens.length;
			
			while (i){
				prev = this._tokens[--i];
				var ctrl = "" + tV(prev);
				// console.log("ctrl is {ctrl}")
				// need to coerce to string because of stupid CS ===
				// console.log("prev is",prev[0],prev[1])
				if (idx$(ctrl,IMBA_CONTEXTUAL_KEYWORDS) >= 0) {
					tTs(prev,ctrl.toUpperCase());
					// prev[0] = ctrl.toUpperCase # FIX
				} else {
					break;
				};
			};
		} else if (typ == 'IF') {
			this.queueScope(typ);
		} else if (typ == 'IMPORT') {
			// could manually parse the whole ting here?
			this.pushEnd('IMPORT');
			// @ends.push 'IMPORT'
		} else if (id == 'from' && ctx0 == 'IMPORT') {
			typ = 'FROM';
			this.pair('IMPORT');
		} else if (id == 'as' && ctx0 == 'IMPORT') {
			typ = 'AS';
			this.pair('IMPORT');
		};
		
		if (typ == 'IDENTIFIER') {
			// see if previous was catch -- belongs in rewriter?
			if (lastTyp == 'CATCH') {
				typ = 'CATCH_VAR';
			};
		};
		
		this.token(typ,id,len);
		if (colon) { this.token(':',':',0) }; // _what_?
		
		return len;
	};
	
	// Matches numbers, including decimals, hex, and exponential notation.
	// Be careful not to interfere with ranges-in-progress.
	Lexer.prototype.numberToken = function (){
		var binaryLiteral;
		var match,number,lexedLength;
		
		if (!(match = NUMBER.exec(this._chunk))) { return 0 };
		
		number = match[0];
		lexedLength = number.length;
		
		if (binaryLiteral = /0b([01]+)/.exec(number)) {
			
			number = "" + parseInt(binaryLiteral[1],2);
		};
		
		var prev = last(this._tokens);
		
		if (match[0][0] == '.' && prev && !(prev.spaced) && ['IDENTIFIER',')','}',']','NUMBER'].indexOf(tT(prev)) >= 0) {
			console.log("got here");
			this.token(".",".");
			number = number.substr(1);
		};
		
		
		this.token('NUMBER',number,lexedLength);
		return lexedLength;
	};
	
	Lexer.prototype.symbolToken = function (){
		var match,symbol,prev;
		
		if (!(match = SYMBOL.exec(this._chunk))) { return 0 };
		symbol = match[0].substr(1);
		prev = last(this._tokens);
		
		// is this a property-access?
		// should invert this -- only allow when prev IS .. 
		
		// : should be a token itself, with a specification of spacing (LR,R,L,NONE)
		
		// FIX
		if (prev && !(prev.spaced) && idx$(tT(prev),['(','{','[','.','CALL_START','INDEX_START',',','=','INDENT','TERMINATOR']) == -1) {
			this.token('.','.');
			symbol = symbol.split(/[\:\\\/]/)[0]; // really?
			// token 'SYMBOL', "'#{symbol}'"
			this.token('SYMBOL',symbol);
			return symbol.length + 1;
		} else {
			// token 'SYMBOL', "'#{symbol}'"
			this.token('SYMBOL',symbol);
			return match[0].length;
		};
	};
	
	// Matches strings, including multi-line strings. Ensures that quotation marks
	// are balanced within the string's contents, and within nested interpolations.
	Lexer.prototype.stringToken = function (){
		var match,string;
		
		switch (this._chunk.charAt(0)) {
			case "'":
				if (!(match = SIMPLESTR.exec(this._chunk))) { return 0 };
				this.token('STRING',(string = match[0]).replace(MULTILINER,'\\\n'),string.length);
				break;
			
			case '"':
				if (!(string = this.balancedString(this._chunk,'"'))) { return 0 };
				
				if (string.indexOf('{') >= 0) {
					this.interpolateString(string.slice(1,-1));
				} else {
					this.token('STRING',this.escapeLines(string),string.length);
				};
				break;
			
			default:
			
				return 0;
		
		};
		
		this.moveHead(string);
		// var br = count(string, '\n')
		// @line += br
		
		return string.length;
	};
	
	// Matches heredocs, adjusting indentation to the correct level, as heredocs
	// preserve whitespace, but ignore indentation to the left.
	Lexer.prototype.heredocToken = function (){
		var match,heredoc,quote,doc;
		
		if (!(match = HEREDOC.exec(this._chunk))) { return 0 };
		
		heredoc = match[0];
		quote = heredoc.charAt(0);
		doc = this.sanitizeHeredoc(match[2],{quote: quote,indent: null});
		// console.log "found heredoc {match[0]:length} {doc:length}"
		
		if (quote == '"' && doc.indexOf('{') >= 0) {
			this.interpolateString(doc,{heredoc: true});
		} else {
			this.token('STRING',this.makeString(doc,quote,true),0);
		};
		
		this.moveHead(heredoc);
		// var br = count heredoc, '\n'
		// @line += br
		
		return heredoc.length;
	};
	
	// Matches and consumes comments.
	Lexer.prototype.commentToken = function (){
		var match,length,comment,indent,prev;
		
		var typ = 'HERECOMMENT';
		
		if (match = INLINE_COMMENT.exec(this._chunk)) { // .match(INLINE_COMMENT)
			length = match[0].length;
			indent = match[1];
			comment = match[2];
			
			prev = last(this._tokens);
			var pt = prev && tT(prev);
			var note = '//' + comment.substr(1);
			
			if (this._last && this._last.spaced) {
				note = ' ' + note;
				// console.log "the previous node was SPACED"
			};
			// console.log "comment {note} - indent({indent}) - {length} {comment:length}"
			
			if (pt && pt != 'INDENT' && pt != 'TERMINATOR') {
				// console.log "skip comment"
				// token 'INLINECOMMENT', comment.substr(2)
				// console.log "adding as terminator"
				this.token('TERMINATOR',note,length); // + '\n'
			} else {
				// console.log "add comment ({note})"
				if (pt == 'TERMINATOR') {
					tVs(prev,tV(prev) + note);
					// prev[1] += note
				} else if (pt == 'INDENT') {
					// console.log "adding comment to INDENT: {note}" # why not add directly here?
					this.addLinebreaks(1,note);
				} else {
					// console.log "comment here"
					// should we ever get here?
					this.token(typ,comment.substr(2),length); // are we sure?
				};
			};
			
			return length; // disable now while compiling
		};
		
		// should use exec?
		if (!(match = COMMENT.exec(this._chunk))) { return 0 };
		
		comment = match[0];
		var here = match[1];
		
		if (here) {
			this.token('HERECOMMENT',this.sanitizeHeredoc(here,{herecomment: true,indent: Array(this._indent + 1).join(' ')}),comment.length);
			this.token('TERMINATOR','\n');
		} else {
			this.token('HERECOMMENT',comment,comment.length);
			this.token('TERMINATOR','\n'); // auto? really?
		};
		
		this.moveHead(comment);
		// var br = count(comment,'\n')
		// @line += br
		
		return comment.length;
	};
	
	// Matches JavaScript interpolated directly into the source via backticks.
	Lexer.prototype.jsToken = function (){
		var match,script;
		
		if (!(this._chunk.charAt(0) == '`' && (match = JSTOKEN.exec(this._chunk)))) { return 0 };
		this.token('JS',(script = match[0]).slice(1,-1));
		return script.length;
	};
	
	// Matches regular expression literals. Lexing regular expressions is difficult
	// to distinguish from division, so we borrow some basic heuristics from
	// JavaScript and Ruby.
	Lexer.prototype.regexToken = function (){
		var ary;
		var match,length,prev;
		
		if (this._chunk.charAt(0) != '/') { return 0 };
		if (match = HEREGEX.exec(this._chunk)) {
			length = this.heregexToken(match);
			this.moveHead(match[0]);
			// var br = count(match[0], '\n')
			// @line += br
			return length;
		};
		
		prev = last(this._tokens);
		// FIX
		if (prev && (idx$(tT(prev),(prev.spaced ? (
			NOT_REGEX
		) : (
			NOT_SPACED_REGEX
		))) >= 0)) { return 0 };
		if (!(match = REGEX.exec(this._chunk))) { return 0 };
		var ary=iter$(match);var m = ary[0],regex = ary[1],flags = ary[2];
		
		// FIXME
		// if regex[..1] is '/*'
		//	error 'regular expressions cannot begin with `*`'
		
		if (regex == '//') {
			regex = '/(?:)/';
		};
		
		this.token('REGEX',("" + regex + flags));
		return m.length;
	};
	
	// Matches multiline extended regular expressions.
	Lexer.prototype.heregexToken = function (match){
		var ary;
		var ary=iter$(match);var heregex = ary[0],body = ary[1],flags = ary[2];
		
		if (0 > body.indexOf('#{')) {
			
			var re = body.replace(HEREGEX_OMIT,'').replace(/\//g,'\\/');
			
			if (re.match(/^\*/)) {
				this.error('regular expressions cannot begin with `*`');
			};
			
			this.token('REGEX',("/" + (re || '(?:)') + "/" + flags));
			return heregex.length;
		};
		
		this.token('CONST','RegExp');
		this._tokens.push(T.token('CALL_START','(',0));
		var tokens = [];
		
		for (var i=0, items=iter$(this.interpolateString(body,{regex: true})), len=items.length, pair; i < len; i++) {
			
			pair = items[i];var tok = tT(pair); // FIX
			var value = tV(pair); // FIX
			
			if (tok == 'TOKENS') {
				// FIXME what is this?
				tokens.push.apply(tokens,value);
			} else {
				if (!value) {
					console.log("what??");
				};
				
				if (!(value = value.replace(HEREGEX_OMIT,''))) { continue };
				
				value = value.replace(/\\/g,'\\\\');
				tokens.push(T.token('STRING',this.makeString(value,'"',true),0)); // FIX
			};
			
			tokens.push(T.token('+','+',0)); // FIX
		};
		
		tokens.pop();
		
		// FIX
		if (!(tokens[0] && tT(tokens[0]) == 'STRING')) {
			// FIX
			this._tokens.push(T.token('STRING','""'),T.token('+','+'));
		};
		
		this._tokens.push.apply(this._tokens,tokens); // what is this?
		// FIX
		
		if (flags) {
			this._tokens.push(T.token(',',',',0));
			this._tokens.push(T.token('STRING','"' + flags + '"',0));
		};
		
		this.token(')',')',0);
		
		return heregex.length;
	};
	
	// Matches newlines, indents, and outdents, and determines which is which.
	// If we can detect that the current line is continued onto the the next line,
	// then the newline is suppressed:
	//
	//     elements
	//       .each( ... )
	//       .map( ... )
	//
	// Keeps track of the level of indentation, because a single outdent token
	// can close multiple indents, so we need to know how far in we happen to be.
	Lexer.prototype.lineToken = function (){
		var match;
		
		if (!(match = MULTI_DENT.exec(this._chunk))) { return 0 };
		// should it not pair by itself token('SELECTOR_END','%',0)
		// if @end == '%'
		// 	console.log "pairing selector in lineToken {@chunk.substr(0,10)}"
		// 	# should not need to add anything here?
		// 	pair('%')
		
		var indent = match[0];
		// var brCount = count indent, '\n'
		var brCount = this.moveHead(indent);
		// @line += brCount
		this._seenFor = false;
		// reset column as well?
		
		var prev = last(this._tokens,1);
		var size = indent.length - 1 - indent.lastIndexOf('\n');
		var noNewlines = this.unfinished();
		
		// console.log "noNewlines",noNewlines
		// console.log "lineToken -- ",@chunk.substr(0,10),"--"
		if ((/^\n#\s/).test(this._chunk)) {
			this.addLinebreaks(1);
			return 0;
		};
		
		if (size - this._indebt == this._indent) {
			if (noNewlines) {
				this.suppressNewlines();
			} else {
				this.newlineToken(brCount);
			};
			return indent.length;
		};
		
		if (size > this._indent) {
			if (noNewlines) {
				this._indebt = size - this._indent;
				this.suppressNewlines();
				return indent.length;
			};
			
			if (this.inTag()) {
				// console.log "indent inside tokid?!?"
				// @indebt = size - @indent
				// suppressNewlines()
				return indent.length;
			};
			
			
			var diff = size - this._indent + this._outdebt;
			this.closeDef();
			
			var immediate = last(this._tokens);
			
			if (immediate && tT(immediate) == 'TERMINATOR') {
				tTs(immediate,'INDENT');
				immediate._meta || (immediate._meta = {pre: tV(immediate),post: ''});
				
				// should rather add to meta somehow?!?
				// tVs(immediate,tV(immediate) + '%|%') # crazy
			} else {
				this.token('INDENT',"" + diff,0);
			};
			
			// console.log "indenting", prev, last(@tokens,1)
			// if prev and prev[0] == 'TERMINATOR'
			//   console.log "terminator before indent??"
			
			// check for comments as well ?
			
			this._indents.push(diff);
			this.pushEnd('OUTDENT');
			// @ends.push 'OUTDENT'
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
		// here we should also take care to pop / reset the scope-body
		// or context-type for indentation 
		var dent = 0;
		while (moveOut > 0){
			var len = this._indents.length - 1;
			if (this._indents[len] == undefined) {
				moveOut = 0;
			} else if (this._indents[len] == this._outdebt) {
				moveOut -= this._outdebt;
				this._outdebt = 0;
			} else if (this._indents[len] < this._outdebt) {
				this._outdebt -= this._indents[len];
				moveOut -= this._indents[len];
			} else {
				dent = this._indents.pop() - this._outdebt;
				moveOut -= dent;
				this._outdebt = 0;
				
				if (!noNewlines) { this.addLinebreaks(1) };
				
				this.pair('OUTDENT');
				this.token('OUTDENT',"" + dent,0);
			};
		};
		
		if (dent) { this._outdebt -= moveOut };
		
		while (this.lastTokenValue() == ';'){
			this._tokens.pop();
		};
		
		if (!(this.lastTokenType() == 'TERMINATOR' || noNewlines)) { this.token('TERMINATOR','\n',0) };
		
		// capping scopes so they dont hang around 
		this._scopes.length = this._indents.length;
		
		var ctx = this.context();
		if (ctx == '%' || ctx == 'TAG') { this.pair(ctx) }; // really?
		this.closeDef();
		return this;
	};
	
	// Matches and consumes non-meaningful whitespace. tokid the previous token
	// as being "spaced", because there are some cases where it makes a difference.
	Lexer.prototype.whitespaceToken = function (){
		var match,nline,prev;
		if (!((match = WHITESPACE.exec(this._chunk)) || (nline = this._chunk.charAt(0) == '\n'))) { return 0 };
		prev = last(this._tokens);
		
		// FIX - why oh why?
		if (prev) {
			if (match) {
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
	
	Lexer.prototype.moveHead = function (str){
		var br = count(str,'\n');
		this._line += br;
		
		
		if (br > 0) {
			var idx = str.length;
			var col = 0;
			while (idx > 0 && str[--idx] != '\n'){
				col++;
			};
			this._col = this._colOffset = col;
		};
		
		return br;
	};
	
	
	Lexer.prototype.addLinebreaks = function (count,raw){
		var br;
		
		if (!raw && count == 0) { return this }; // no terminators?
		
		var prev = this._last;
		
		if (!raw) {
			if (count == 1) {
				br = '\n';
			} else if (count == 2) {
				br = '\n\n';
			} else if (count == 3) {
				br = '\n\n\n';
			} else {
				br = repeatString('\n',count);
			};
		};
		// FIX
		if (prev) {
			var t = prev._type; // @lastTyp
			var v = tV(prev);
			
			// we really want to add this
			if (t == 'INDENT') {
				// TODO we want to add to the indent
				// console.log "add the comment to the indent -- pre? {raw} {br}"
				
				var meta = prev._meta || (prev._meta = {pre: '',post: ''});
				meta.post += (raw || br);
				// tVs(v + (raw or br))
				return this;
			} else if (t == 'TERMINATOR') {
				// console.log "already exists terminator {br} {raw}"
				tVs(prev,v + (raw || br));
				return this;
			};
		};
		
		this.token('TERMINATOR',br,0);
		return;
	};
	
	// Generate a newline token. Consecutive newlines get merged together.
	Lexer.prototype.newlineToken = function (lines){
		// console.log "newlineToken"
		while (this._lastVal == ';'){
			console.log("pop token");
			this._tokens.pop();
		};
		
		this.addLinebreaks(lines);
		
		var ctx = this.context();
		// WARN now import cannot go over multiple lines
		if (ctx == 'TAG' || ctx == 'IMPORT') { this.pair(ctx) };
		this.closeDef(); // close def -- really?
		return this;
	};
	
	// Use a `\` at a line-ending to suppress the newline.
	// The slash is removed here once its job is done.
	Lexer.prototype.suppressNewlines = function (){
		if (this.value() == '\\') { this._tokens.pop() };
		return this;
	};
	
	// We treat all other single characters as a token. E.g.: `( ) , . !`
	// Multi-character operators are also literal tokens, so that Jison can assign
	// the proper order of operations. There are some symbols that we tokid specially
	// here. `;` and newlines are both treated as a `TERMINATOR`, we distinguish
	// parentheses that indicate a method call from regular parentheses, and so on.
	Lexer.prototype.literalToken = function (){
		var match,value;
		if (match = OPERATOR.exec(this._chunk)) {
			value = match[0];
			if (CODE.test(value)) this.tagParameters();
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
		if (value == '=' && prev) {
			
			if (pv == '||' || pv == '&&') { // in ['||', '&&']
				tTs(prev,'COMPOUND_ASSIGN');
				tVs(prev,pv + '=');
				// prev[0] = 'COMPOUND_ASSIGN'
				// prev[1] += '='
				return value.length;
			};
		};
		
		if (value == ';') {
			this._seenFor = false;
			tokid = 'TERMINATOR';
		} else if (value == '(' && inTag && pt != '=' && prev.spaced) { // FIXed
			// console.log 'spaced before ( in tokid'
			// FIXME - should rather add a special token like TAG_PARAMS_START
			this.token(',',',');
		} else if (value == '->' && inTag) {
			tokid = 'TAG_END';
			this.pair('TAG_END');
		} else if (value == '/>' && inTag) {
			tokid = 'TAG_END';
			this.pair('TAG_END');
		} else if (value == '>' && inTag) {
			tokid = 'TAG_END';
			this.pair('TAG_END');
		} else if (value == '>' && this.context() == 'DEF') {
			// console.log('picked up >!!')
			tokid = 'DEF_FRAGMENT';
			
			// elif value is 'TERMINATOR' and end1 is '%' 
			// 	closeSelector()
		} else if (value == 'TERMINATOR' && end1 == 'DEF') {
			this.closeDef();
		} else if (value == '&' && this.context() == 'DEF') {
			// console.log("okay!")
			tokid = 'BLOCK_ARG';
			// change the next identifier instead?
		} else if (value == '*' && this._chunk.charAt(1).match(/[A-Za-z\_\@\[]/) && (prev.spaced || [',','(','[','{','|','\n','\t'].indexOf(pv) >= 0)) {
			tokid = "SPLAT";
		} else if (value == '√') {
			tokid = 'SQRT';
		} else if (value == 'ƒ') {
			tokid = 'FUNC';
		} else if (idx$(value,MATH) >= 0) {
			tokid = 'MATH';
		} else if (idx$(value,COMPARE) >= 0) {
			tokid = 'COMPARE';
		} else if (idx$(value,COMPOUND_ASSIGN) >= 0) {
			tokid = 'COMPOUND_ASSIGN';
		} else if (idx$(value,UNARY) >= 0) {
			tokid = 'UNARY';
		} else if (idx$(value,SHIFT) >= 0) {
			tokid = 'SHIFT';
		} else if (idx$(value,LOGIC) >= 0) {
			tokid = 'LOGIC'; // or value is '?' and prev?:spaced 
		} else if (prev && !(prev.spaced)) {
			// need a better way to do these
			if (value == '(' && end1 == '%') {
				tokid = 'TAG_ATTRS_START';
			} else if (value == '(' && idx$(pt,CALLABLE) >= 0) {
				// not using this ???
				// prev[0] = 'FUNC_EXIST' if prev[0] is '?'
				tokid = 'CALL_START';
			} else if (value == '[' && idx$(pt,INDEXABLE) >= 0) {
				tokid = 'INDEX_START';
				if (pt == '?') { tTs(prev,'INDEX_SOAK') };
				// prev[0] = 'INDEX_SOAK' if prev[0] == '?'
			};
		};
		
		switch (value) {
			case '(':
			case '{':
			case '[':
				this.pushEnd(INVERSES[value]);break;
			
			case ')':
			case '}':
			case ']':
				this.pair(value);break;
		
		};
		
		// hacky rule to try to allow for tuple-assignments in blocks
		// if value is ',' and prev[0] is 'IDENTIFIER' and @tokens[@tokens:length - 2][0] in ['TERMINATOR','INDENT']
		//   # token "TUPLE", "tuple" # should rather insert it somewhere else, no?
		//   console.log("found comma")
		
		this.token(tokid,value,value.length);
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
		
		if (herecomment) {
			if (HEREDOC_ILLEGAL.test(doc)) {
				this.error("block comment cannot contain '*/' starting");
			};
			if (doc.indexOf('\n') <= 0) { return doc };
		} else {
			while (match = HEREDOC_INDENT.exec(doc)){
				var attempt = match[1];
				if (indent == null || 0 < (length_=attempt.length) && length_ < indent.length) {
					indent = attempt;
				};
			};
		};
		
		if (indent) { doc = doc.replace(RegExp("\\n" + indent,"g"),'\n') };
		if (!herecomment) { doc = doc.replace(/^\n/,'') };
		return doc;
	};
	
	// A source of ambiguity in our grammar used to be parameter lists in function
	// definitions versus argument lists in function calls. Walk backwards, tokidging
	// parameters specially in order to make things easier for the parser.
	Lexer.prototype.tagParameters = function (){
		var tok;
		if (this.lastTokenType() != ')') { return this };
		var stack = [];
		var tokens = this._tokens;
		var i = tokens.length;
		
		tTs(tokens[--i],'PARAM_END');
		
		while (tok = tokens[--i]){
			var t = tT(tok);
			switch (t) {
				case ')':
					stack.push(tok);
					break;
				
				case '(':
				case 'CALL_START':
					if (stack.length) {
						stack.pop();
					} else if (t == '(') {
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
		// ctx = context
		// pair(ctx) if ctx in ['%','DEF']
		this.closeDef();
		this.closeSelector();
		return this.outdentToken(this._indent,false,0);
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
		
		// could it not happen here?
		while (i < (str.length - 1)){
			i++;
			letter = str.charAt(i);
			switch (letter) {
				case '\\':
					i++;
					continue;
					break;
				
				case end:
					stack.pop();
					if (!(stack.length)) {
						var v = str.slice(0,i + 1);
						return v;
					};
					end = stack[stack.length - 1];
					continue;
					break;
			
			};
			
			if (end == '}' && (letter == '"' || letter == "'")) {
				stack.push(end = letter);
			} else if (end == '}' && letter == '/' && (match = (HEREGEX.exec(str.slice(i)) || REGEX.exec(str.slice(i))))) {
				i += match[0].length - 1;
			} else if (end == '}' && letter == '{') {
				stack.push(end = '}');
			} else if (end == '"' && letter == '{') {
				stack.push(end = '}');
			};
			prev = letter;
		};
		
		return this.error(("missing " + (stack.pop()) + ", starting"));
	};
	
	// Expand variables and expressions inside double-quoted strings using
	// Ruby-like notation for substitution of arbitrary expressions.
	//
	//     "Hello #{name.capitalize()}."
	//
	// If it encounters an interpolation, this method will recursively create a
	// new Lexer, tokenize the interpolated contents, and merge them into the
	// token stream.
	Lexer.prototype.interpolateString = function (str,options){
		// console.log "interpolate string"
		var len, interpolated;
		if(options === undefined) options = {};
		var heredoc = options.heredoc;
		var regex = options.regex;
		var prefix = options.prefix;
		
		var startLoc = this._loc;
		var tokens = [];
		var pi = 0;
		var i = -1;
		var strlen = str.length;
		var letter;
		var expr;
		// out of bounds
		while (letter = str.charAt(i += 1)){
			if (letter == '\\') {
				i += 1;
				continue;
			};
			
			if (!(str.charAt(i) == '{' && (expr = this.balancedString(str.slice(i),'}')))) {
				continue;
			};
			
			// these have no real sense of location or anything?
			// what is this conditino really?
			if (pi < i) {
				// this is the prefix-string - before any item
				var tok = T.token('NEOSTRING',str.slice(pi,i));
				tok._loc = this._loc + pi;
				tok._len = i - pi + 2;
				tokens.push(tok);
			};
			
			var inner = expr.slice(1,-1);
			// console.log 'inner is',inner
			// remove leading spaces 
			inner = inner.replace(/^[^\n\S]+/,'');
			
			if (inner.length) {
				// we need to remember the loc we start at
				// console.log('interpolate from loc',@loc,i)
				// really? why not just add to the stack??
				// what about the added 
				// should share with the selector no?
				// console.log "tokenize inner parts of string",inner
				var spaces = 0;
				var offset = this._loc + i + (expr.length - inner.length);
				var nested = new Lexer().tokenize(inner,{inline: true,line: this._line,rewrite: false,loc: offset});
				// console.log nested.pop
				
				if (nested[0] && tT(nested[0]) == 'TERMINATOR') {
					nested.shift();
				};
				
				// drop the automatic terminator at the end as well?
				// console.log "last token from lexer ",nested[nested:length - 1]
				
				if (len = nested.length) {
					if (len > 1) {
						// what about here?!?
						nested.unshift(new Token('(','(',this._line,0,0));
						nested.push(new Token(')',')',this._line,0,0)); // very last line?
					};
					tokens.push(T.token('TOKENS',nested,0));
					// tokens.push nested
				};
			};
			
			// should rather add the amount by which our lexer has moved?
			i += expr.length - 1;
			pi = i + 1;
		};
		
		// adding the last part of the string here
		if (i > pi && pi < str.length) {
			// set the length as well - or?
			// the string after?
			
			tokens.push(T.token('NEOSTRING',str.slice(pi),0));
		};
		
		if (regex) { return tokens };
		
		if (!(tokens.length)) { return this.token('STRING','""') };
		
		if (tT(tokens[0]) != 'NEOSTRING') {
			// adding a blank string to the very beginning
			// 
			tokens.unshift(T.token('','',0));
		};
		
		if (interpolated = tokens.length > 1) {
			this.token('(','("',0);
		};
		
		for (var k=0, len_=tokens.length, v; k < len_; k++) {
			v = tokens[k];if (k) { this.token('+','+',0) };
			
			// if v isa Array
			// 	@tokens.push(iv) for iv in v
			// 	continue
			
			var typ = tT(v);
			var value = tV(v);
			
			if (typ == 'TOKENS') {
				// console.log 'got here'
				
				for (var j=0, ary=iter$(value), len__=ary.length, inner1; j < len__; j++) {
					// console.log "token {inner.@type} {inner.@loc}"
					inner1 = ary[j];this._tokens.push(inner1);
					this._loc = inner1._loc + inner1._len;
				};
				// @tokens.push *value
			} else {
				if (typ == 'NEOSTRING') {
					// console.log "WAS NEOSTRING {value} - {value:length}"
					this._loc = v._loc;
					// just change the string?
				};
				
				this.token('STRING',this.makeString(value,'"',heredoc)); // , v.@len # , value:length
				this._loc += v._len;
			};
		};
		
		if (interpolated) {
			this._loc += 2; // really?
			this._loc = startLoc + str.length + 2;
			this.token(')','")',0);
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
		for (var len=str.length, i = 1; i < len; i++) {
			switch (letter = str.charAt(i)) {
				case '\\':
					i++;
					continue;
					break;
				
				case end:
					stack.pop();
					if (!(stack.length)) {
						return str.slice(0,i + 1);
					};
					
					end = stack[stack.length - 1];
					continue;
					break;
			
			};
			if (end == '}' && letter == [')']) {
				stack.push(end = letter);
			} else if (end == '}' && letter == '{') {
				stack.push(end = '}');
			} else if (end == ')' && letter == '{') {
				stack.push(end = '}');
			};
			prev = letter; // what, why?
		};
		
		return this.error(("missing " + (stack.pop()) + ", starting"));
	};
	
	// Pairs up a closing token, ensuring that all listed pairs of tokens are
	// correctly balanced throughout the course of the token stream.
	Lexer.prototype.pair = function (tok){
		var wanted = last(this._ends);
		if (tok != wanted) {
			if ('OUTDENT' != wanted) { this.error(("unmatched " + tok)) };
			var size = last(this._indents);
			this._indent -= size;
			this.outdentToken(size,true,0);
			return this.pair(tok);
		};
		// FIXME move into endSelector
		if (false && tok == '%') { // move outside?
			// have not added to the loc just yet
			this.token('SELECTOR_END','%',0);
		};
		// @ends["_" + (@ends:length - 1)] = undefined
		return this.popEnd();
		// @contexts.pop
		// @ends.pop
	};
	
	
	// Helpers
	// -------
	
	// Add a token to the results, taking note of the line number.
	Lexer.prototype.token = function (id,value,len){ // , addLoc
		this._lastTyp = id;
		this._lastVal = value;
		
		var tok = this._last = new Token(id,value,this._line,this._loc,len || 0);
		tok._col = this._col;
		this._tokens.push(tok); // @last
		return;
	};
	
	Lexer.prototype.lastTokenType = function (){
		var token = this._tokens[this._tokens.length - 1];
		return token ? (tT(token)) : ('NONE');
	};
	
	Lexer.prototype.lastTokenValue = function (){
		var token = this._tokens[this._tokens.length - 1];
		return token ? (token._value) : ('');
	};
	
	// Peek at a tokid in the current token stream.
	Lexer.prototype.tokid = function (index,val){
		var tok;
		if (tok = last(this._tokens,index)) {
			if (val) { tTs(tok,val) };
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
		if (tok = last(this._tokens,index)) {
			if (val) { tVs(tok,val) };
			return tV(tok);
			// tok.@value = val if val # why?
			// tok.@value
		} else {
			return null;
		};
	};
	
	
	// Are we in the midst of an unfinished expression?
	Lexer.prototype.unfinished = function (){
		if (LINE_CONTINUER.test(this._chunk)) { return true };
		return UNFINISHED.indexOf(this._lastTyp) >= 0;
	};
	
	// var tokens = ['\\','.', '?.', 'UNARY', 'MATH', '+', '-', 'SHIFT', 'RELATION', 'COMPARE', 'LOGIC', 'COMPOUND_ASSIGN', 'THROW', 'EXTENDS']
	
	// Converts newlines for string literals.
	Lexer.prototype.escapeLines = function (str,heredoc){
		return str.replace(MULTILINER,(heredoc ? ('\\n') : ('')));
	};
	
	// Constructs a string token by escaping quotes and newlines.
	Lexer.prototype.makeString = function (body,quote,heredoc){
		if (!body) { return quote + quote };
		body = body.replace(/\\([\s\S])/g,function(match,contents) {
			return (contents == '\n' || contents == quote) ? (contents) : (match);
		});
		
		body = body.replace(RegExp("" + quote,"g"),'\\$&');
		return quote + this.escapeLines(body,heredoc) + quote;
	};
	
	// Throws a syntax error on the current `@line`.
	Lexer.prototype.error = function (message,len){
		var msg = ("" + message + " on line " + this._line);
		
		if (len) {
			msg += (" [" + this._loc + ":" + (this._loc + len) + "]");
		};
		
		var err = new SyntaxError(msg);
		err.line = this._line;
		// err:columnNumber
		err = new ERR.ImbaParseError(err,{tokens: this._tokens,pos: this._tokens.length});
		throw err;
	};
	


}())
},{"./errors":3,"./rewriter":9,"./token":10}],7:[function(require,module,exports){
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
	var AST, OP, OP_COMPOUND, NODES, SPLAT, STACK, K_IVAR, K_SYM, K_STR, K_PROP, BR, BR2, SELF, SUPER, TRUE, FALSE, UNDEFINED, NIL, ARGUMENTS, EMPTY, NULL, RESERVED, RESERVED_REGEX, UNION, INTERSECT, CLASSDEF, TAGDEF, NEWTAG;
	// TODO Create Expression - make all expressions inherit from these?
	
	// externs;
	
	var helpers = require('./helpers');
	var v8 = null; // require 'v8-natives'
	
	var T = require('./token');
	var Token = T.Token;
	
	
	module.exports.AST = AST = {};
	
	// Helpers for operators
	module.exports.OP = OP = function(op,l,r) {
		var o = String(op);
		// console.log "operator",o
		switch (o) {
			case '.':
				if ((typeof r=='string'||r instanceof String)) { r = new Identifier(r) };
				// r = r.value if r isa VarOrAccess
				return new Access(op,l,r);
				break;
			
			case '=':
				if (l instanceof Tuple) { return new TupleAssign(op,l,r) };
				return new Assign(op,l,r);
				break;
			
			case '?=':
			case '||=':
			case '&&=':
				return new ConditionalAssign(op,l,r);
				break;
			
			case '+=':
			case '-=':
			case '*=':
			case '/=':
			case '^=':
			case '%=':
				return new CompoundAssign(op,l,r);
				break;
			
			case '?.':
				if (r instanceof VarOrAccess) {
					// console.log "is var or access"
					r = r.value();
				};
				// depends on the right side - this is wrong
				return new PropertyAccess(op,l,r);
				break;
			
			case 'instanceof':
				return new InstanceOf(op,l,r);
				break;
			
			case 'in':
				return new In(op,l,r);
				break;
			
			case 'typeof':
				return new TypeOf(op,l,r);
				break;
			
			case 'delete':
				return new Delete(op,l,r);
				break;
			
			case '--':
			case '++':
			case '!':
			case '√':
				return new UnaryOp(op,l,r);
				break;
			
			case '>':
			case '<':
			case '>=':
			case '<=':
			case '==':
			case '===':
			case '!=':
			case '!==':
				return new ComparisonOp(op,l,r);
				break;
			
			case '∩':
			case '∪':
				return new MathOp(op,l,r);
				break;
			
			case '..':
			case '...':
				return new Range(op,l,r);
				break;
			
			default:
			
				return new Op(op,l,r);
		
		};
	};
	
	module.exports.OP_COMPOUND = OP_COMPOUND = function(sym,op,l,r) {
		// console.log "?. soak operator",sym
		if (sym == '?.') {
			console.log("?. soak operator");
			return null;
		};
		if (sym == '?=' || sym == '||=' || sym == '&&=') {
			return new ConditionalAssign(op,l,r);
		} else {
			return new CompoundAssign(op,l,r);
		};
	};
	
	var OPTS = {};
	
	module.exports.NODES = NODES = [];
	
	var LIT = function(val) {
		return new Literal(val);
	};
	
	var SYM = function(val) {
		return new Symbol(val);
	};
	
	var IF = function(cond,body,alt) {
		var node = new If(cond,body);
		if (alt) { node.addElse(alt) };
		return node;
	};
	
	var FN = function(pars,body) {
		return new Func(pars,body);
	};
	
	var CALL = function(callee,pars) {
		// possibly return instead(!)
		if(pars === undefined) pars = [];
		return new Call(callee,pars);
	};
	
	var CALLSELF = function(name,pars) {
		if(pars === undefined) pars = [];
		var ref = new Identifier(name);
		return new Call(OP('.',SELF,ref),pars);
	};
	
	var BLOCK = function() {
		return Block.wrap([].slice.call(arguments));
	};
	
	var WHILE = function(test,code) {
		return new While(test).addBody(code);
	};
	
	module.exports.SPLAT = SPLAT = function(value) {
		if (value instanceof Assign) {
			// p "WARN"
			value.setLeft(new Splat(value.left()));
			return value;
		} else {
			return new Splat(value);
			// not sure about this
		};
	};
	
	// OP.ASSIGNMENT = [ "=" , "+=" , "-=" , "*=" , "/=" , "%=", "<<=" , ">>=" , ">>>=", "|=" , "^=" , "&=" ]
	// OP.LOGICAL = [ "||" , "&&" ]
	// OP.UNARY = [ "++" , "--" ]
	
	var SEMICOLON_TEST = /;(\s*\/\/.*)?[\n\s\t]*$/;
	
	
	function parseError(str,o){
		// console.log "parseError {str}"
		if (o.lexer) {
			var token = o.lexer.yytext;
			// console.log token.@col
			str = ("[" + (token._loc) + ":" + (token._len || String(token).length) + "] " + str);
		};
		var e = new Error(str);
		e.lexer = o.lexer;
		throw e;
	}; exports.parseError = parseError;
	
	function c__(obj){
		return typeof obj == 'string' ? (obj) : (obj.c());
	};
	
	function num__(num){
		return new Num(num);
	};
	
	function str__(str){
		// should pack in token?!?
		return new Str(str);
	};
	
	function blk__(obj){
		return obj instanceof Array ? (Block.wrap(obj)) : (obj);
	};
	
	function sym__(obj){
		// console.log "sym {obj}"
		return helpers.symbolize(String(obj));
	};
	
	function cary__(ary){
		return ary.map(function(v) {
			return typeof v == 'string' ? (v) : (v.c());
		});
	};
	
	function dump__(obj,key){
		if (obj instanceof Array) {
			return obj.map(function(v) {
				return v && v.dump ? (v.dump(key)) : (v);
			});
		} else if (obj && obj.dump) {
			return obj.dump();
		};
	};
	
	function compact__(ary){
		if (ary instanceof ListNode) {
			return ary.compact();
		};
		
		return ary.filter(function(v) {
			return v != undefined && v != null;
		});
	};
	
	function reduce__(res,ary){
		for (var i=0, items=iter$(ary), len=items.length, v; i < len; i++) {
			v = items[i];v instanceof Array ? (reduce__(res,v)) : (res.push(v));
		};
		return;
	};
	
	function flatten__(ary,compact){
		if(compact === undefined) compact = false;
		var out = [];
		for (var i=0, items=iter$(ary), len=items.length, v; i < len; i++) {
			v = items[i];v instanceof Array ? (reduce__(out,v)) : (out.push(v));
		};
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
		if (typ == 'call') {
			if (pars[0].c() == 'return') {
				pars[0] = 'tata';
			};
			return new Call(pars[0],pars[1],pars[2]);
		};
	};
	
	
	AST.escapeComments = function (str){
		if (!str) { return '' };
		return str;
	};
	
	/* @class Indentation */
	function Indentation(a,b){
		this._open = a;
		this._close = b;
		this;
	};
	
	exports.Indentation = Indentation; // export class 
	
	Indentation.prototype.__open = {name: 'open'};
	Indentation.prototype.open = function(v){ return this._open; }
	Indentation.prototype.setOpen = function(v){ this._open = v; return this; };
	
	Indentation.prototype.__close = {name: 'close'};
	Indentation.prototype.close = function(v){ return this._close; }
	Indentation.prototype.setClose = function(v){ this._close = v; return this; };
	
	
	
	// should rather parse and extract the comments, no?
	Indentation.prototype.wrap = function (str){
		// var pre, post
		
		// console.log "INDENT {@open and JSON.stringify(@open.@meta)}"
		// console.log "OUTDENT {@close}"
		// var ov = @open and @open.@value
		// if ov and ov:length > 1
		// 	console.log "value for indent",ov
		// 	if ov.indexOf('%|%')
		// 		pre = ov.substr
		var om = this._open && this._open._meta;
		var pre = om && om.pre || '';
		var post = om && om.post || '';
		var esc = AST.escapeComments;
		var out = this._close;
		
		// the first newline should not be indented?
		str = post.replace(/^\n/,'') + str;
		str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n");
		
		str = pre + '\n' + str;
		if (out instanceof Terminator) { str += out.c() };
		if (str[str.length - 1] != '\n') { str = str + '\n' };
		return str;
	};
	
	
	var INDENT = new Indentation({},{});
	
	/* @class Stack */
	function Stack(){
		this.reset();
	};
	
	exports.Stack = Stack; // export class 
	
	Stack.prototype.__loglevel = {name: 'loglevel'};
	Stack.prototype.loglevel = function(v){ return this._loglevel; }
	Stack.prototype.setLoglevel = function(v){ this._loglevel = v; return this; };
	
	Stack.prototype.__nodes = {name: 'nodes'};
	Stack.prototype.nodes = function(v){ return this._nodes; }
	Stack.prototype.setNodes = function(v){ this._nodes = v; return this; };
	
	Stack.prototype.__scopes = {name: 'scopes'};
	Stack.prototype.scopes = function(v){ return this._scopes; }
	Stack.prototype.setScopes = function(v){ this._scopes = v; return this; };
	
	
	
	Stack.prototype.reset = function (){
		this._nodes = [];
		this._scoping = [];
		this._scopes = []; // for analysis - should rename
		this._loglevel = 3;
		this._counter = 0;
		return this;
	};
	
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
		this._nodes.pop(); // (node)
		return this;
	};
	
	Stack.prototype.parent = function (){
		return this._nodes[this._nodes.length - 2];
	};
	
	Stack.prototype.current = function (){
		return this._nodes[this._nodes.length - 1];
	};
	
	Stack.prototype.up = function (test){
		test || (test = function(v) {
			return !(v instanceof VarOrAccess);
		});
		
		if (test.prototype instanceof Node) {
			var typ = test;
			test = function(v) {
				return v instanceof typ;
			};
		};
		
		var i = this._nodes.length - 2; // key
		while (i >= 0){
			var node = this._nodes[i];
			if (test(node)) { return node };
			i -= 1;
		};
		return null;
	};
	
	Stack.prototype.relative = function (node,offset){
		if(offset === undefined) offset = 0;
		var idx = this._nodes.indexOf(node);
		return idx >= 0 ? (this._nodes[idx + offset]) : (null);
	};
	
	Stack.prototype.scope = function (lvl){
		if(lvl === undefined) lvl = 0;
		var i = this._nodes.length - 1 - lvl;
		while (i >= 0){
			var node = this._nodes[i];
			if (node._scope) { return node._scope };
			i -= 1;
		};
		return null;
	};
	
	Stack.prototype.scopes = function (){
		// include deeper scopes as well?
		var scopes = [];
		var i = this._nodes.length - 1;
		while (i >= 0){
			var node = this._nodes[i];
			if (node._scope) { scopes.push(node._scope) };
			i -= 1;
		};
		return scopes;
	};
	
	Stack.prototype.method = function (){
		return this.up(MethodDeclaration);
	};
	
	Stack.prototype.isExpression = function (){
		var i = this._nodes.length - 1;
		while (i >= 0){
			var node = this._nodes[i];
			// why are we not using isExpression here as well?
			if ((node instanceof Code) || (node instanceof Loop)) {
				return false;
			};
			if (node.isExpression()) {
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
		return this._nodes.filter(function(n) {
			return n._scope;
		}).map(function(n) {
			return n._scope;
		});
	};
	
	
	// Lots of globals -- really need to deal with one stack per file / context
	module.exports.STACK = STACK = new Stack();
	
	GLOBSTACK = STACK;
	
	// use a bitmask for these
	
	/* @class Node */
	function Node(){
		this.setup();
		this;
	};
	
	exports.Node = Node; // export class 
	
	Node.prototype.__o = {name: 'o'};
	Node.prototype.o = function(v){ return this._o; }
	Node.prototype.setO = function(v){ this._o = v; return this; };
	
	Node.prototype.__options = {name: 'options'};
	Node.prototype.options = function(v){ return this._options; }
	Node.prototype.setOptions = function(v){ this._options = v; return this; };
	
	Node.prototype.__traversed = {name: 'traversed'};
	Node.prototype.traversed = function(v){ return this._traversed; }
	Node.prototype.setTraversed = function(v){ this._traversed = v; return this; };
	
	Node.prototype.safechain = function (){
		return false;
	};
	
	Node.prototype.dom = function (){
		var name = "ast_" + this.constructor.name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase();
		// p "try to get the dom-node for this ast-node",name
		if (Imba.TAGS[name]) {
			var node = Imba.tag(name);
			node.bind(this).build();
			return node;
		} else {
			return ("[" + name + "]");
		};
	};
	
	Node.prototype.p = function (){
		
		// allow controlling this from commandline
		if (STACK.loglevel() > 0) {
			console.log.apply(console,arguments);
		};
		return this;
	};
	
	
	
	Node.prototype.setup = function (){
		this._expression = false;
		this._traversed = false;
		this._parens = false;
		this._cache = null;
		this._value = null;
		return this;
	};
	
	Node.prototype.set = function (obj){
		// console.log "setting options {JSON.stringify(obj)}"
		this._options || (this._options = {});
		for (var i=0, keys=Object.keys(obj), l=keys.length; i < l; i++){
			this._options[keys[i]] = obj[keys[i]];
		};
		return this;
	};
	
	// get and set
	Node.prototype.option = function (key,val){
		if (val != undefined) {
			// console.log "setting option {key} {val}"
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
		return [0,0];
	};
	
	Node.prototype.loc = function (){
		return [0,0];
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
	
	// should rather do traversals
	// o = {}, up, key, index
	Node.prototype.traverse = function (){
		if (this._traversed) {
			return this;
		};
		// NODES.push(self)
		this._traversed = true;
		STACK.push(this);
		this.visit(STACK);
		STACK.pop(this);
		return this;
	};
	
	Node.prototype.inspect = function (){
		return {type: this.constructor.toString()};
	};
	
	Node.prototype.js = function (o){
		return "NODE";
	};
	
	Node.prototype.toString = function (){
		return "" + (this.constructor.name);
	};
	
	// swallow might be better name
	Node.prototype.consume = function (node){
		if (node instanceof PushAssign) {
			return new PushAssign(node.op(),node.left(),this);
		};
		
		if (node instanceof Assign) {
			// p "consume assignment".cyan
			// node.right = self
			return OP(node.op(),node.left(),this);
		} else if (node instanceof Op) {
			return OP(node.op(),node.left(),this);
		} else if (node instanceof Return) {
			// p "consume return".cyan
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
		// might be better to nest this up after parsing is done?
		// p "addExpression {self} <- {expr}"
		var node = new ExpressionBlock([this]);
		return node.addExpression(expr);
	};
	
	
	Node.prototype.indented = function (a,b){
		// this is a _BIG_ hack
		if (b instanceof Array) {
			this.add(b[0]);
			b = b[1];
		};
		
		// if indent and indent.match(/\:/)
		this._indentation || (this._indentation = a && b ? (new Indentation(a,b)) : (INDENT));
		return this;
	};
	
	Node.prototype.prebreak = function (term){
		// in options instead?
		// console.log "prebreak!!!!"
		// @prebreak = @prebreak or term
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
		return this;
	};
	
	Node.prototype.cachevar = function (){
		return this._cache && this._cache.var;
	};
	
	Node.prototype.decache = function (){
		if (this._cache) {
			this.cachevar().free();
			this._cache = null;
		};
		return this;
	};
	
	// is this without side-effects? hmm - what does it even do?
	Node.prototype.predeclare = function (){
		if (this._cache) {
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
		if (ch && ch.cached) { return this.c_cached(ch) };
		
		s.push(this);
		if (o && o.expression) this.forceExpression();
		
		v8 && console.log(v8.hasFastObjectElements(this));
		
		if (o && o.indent) {
			this._indentation || (this._indentation = INDENT);
		};
		
		var out = this.js(s,o);
		
		// really? why not call this somewhere else?
		var paren = this.shouldParenthesize();
		
		if (indent = this._indentation) {
			out = indent.wrap(out,o);
		};
		
		// should move this somewhere else really
		if (paren) { out = ("(" + out + ")") };
		if (o && o.braces) {
			if (indent) {
				out = '{' + out + '}';
			} else {
				out = '{ ' + out + ' }';
			};
		};
		
		s.pop(this);
		
		if (ch = this._cache) {
			if (!(ch.manual)) { out = ("" + (ch.var.c()) + "=" + out) };
			var par = s.current();
			if ((par instanceof Access) || (par instanceof Op)) { out = '(' + out + ')' }; // others? # 
			ch.cached = true;
		};
		return out;
	};
	
	Node.prototype.c_cached = function (cache){
		cache.lookups++;
		if (cache.uses == cache.lookups) { cache.var.free() };
		return cache.var.c(); // recompile every time??
	};
	
	
	/* @class ValueNode */
	function ValueNode(value){
		this.setup();
		this._value = this.load(value);
	};
	
	subclass$(ValueNode,Node);
	exports.ValueNode = ValueNode; // export class 
	
	ValueNode.prototype.__value = {name: 'value'};
	ValueNode.prototype.value = function(v){ return this._value; }
	ValueNode.prototype.setValue = function(v){ this._value = v; return this; };
	
	
	
	ValueNode.prototype.load = function (value){
		return value;
	};
	
	ValueNode.prototype.js = function (o){
		return typeof this._value == 'string' ? (this._value) : (this._value.c());
	};
	
	ValueNode.prototype.visit = function (){
		
		if (this._value instanceof Node) { this._value.traverse() }; //  && @value:traverse
		return this;
	};
	
	ValueNode.prototype.region = function (){
		return [this._value._loc,this._value._loc + this._value._len];
	};
	
	
	
	/* @class Statement */
	function Statement(){ ValueNode.apply(this,arguments) };
	
	subclass$(Statement,ValueNode);
	exports.Statement = Statement; // export class 
	Statement.prototype.isExpressable = function (){
		return false;
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
		var v = this._value._value;
		if (o && o.expression || v.match(/\n/)) { // multiline?
			return "/*" + v + "*/";
		} else {
			return "// " + v;
		};
	};
	
	
	
	/* @class Terminator */
	function Terminator(v){
		this._value = v;
		this;
	};
	
	subclass$(Terminator,Meta);
	exports.Terminator = Terminator; // export class 
	
	
	Terminator.prototype.traverse = function (){
		return this;
	};
	
	Terminator.prototype.c = function (){
		return this._value.c();
		// var v = value.replace(/\\n/g,'\n')
		return this.v(); // .split()
		// v.split("\n").map(|v| v ? " // {v}" : v).join("\n")
	};
	
	
	/* @class Newline */
	function Newline(v){
		this._traversed = false;
		this._value = v || '\n';
	};
	
	subclass$(Newline,Terminator);
	exports.Newline = Newline; // export class 
	
	
	Newline.prototype.c = function (){
		return c__(this._value);
	};
	
	
	
	// weird place?
	/* @class Index */
	function Index(){ ValueNode.apply(this,arguments) };
	
	subclass$(Index,ValueNode);
	exports.Index = Index; // export class 
	Index.prototype.js = function (o){
		return this._value.c();
	};
	
	
	/* @class ListNode */
	function ListNode(list){
		this.setup();
		this._nodes = this.load(list || []);
		this._indentation = null;
	};
	
	subclass$(ListNode,Node);
	exports.ListNode = ListNode; // export class 
	
	ListNode.prototype.__nodes = {name: 'nodes'};
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
		// need to store indented content as well?
		this._nodes = this.nodes().concat(other instanceof Array ? (other) : (other.nodes()));
		return this;
	};
	
	ListNode.prototype.swap = function (item,other){
		var idx = this.indexOf(item);
		if (idx >= 0) { this.nodes()[idx] = other };
		return this;
	};
	
	ListNode.prototype.push = function (item){
		this._nodes.push(item);
		return this;
	};
	
	ListNode.prototype.add = function (item){
		this._nodes.push(item);
		return this;
	};
	
	ListNode.prototype.unshift = function (item,br){
		if (br) { this._nodes.unshift(BR) };
		this._nodes.unshift(item);
		return this;
	};
	
	// test
	ListNode.prototype.slice = function (a,b){
		return new this.constructor(this._nodes.slice(a,b));
	};
	
	
	
	ListNode.prototype.break = function (br,pre){
		if(pre === undefined) pre = false;
		if (typeof br == 'string') { br = new Terminator(br) };
		pre ? (this.unshift(br)) : (this.push(br));
		return this;
	};
	
	ListNode.prototype.some = function (cb){
		for (var i=0, ary=iter$(this._nodes), len=ary.length; i < len; i++) {
			if (cb(ary[i])) { return true };
		};
		return false;
	};
	
	ListNode.prototype.every = function (cb){
		for (var i=0, ary=iter$(this._nodes), len=ary.length; i < len; i++) {
			if (!cb(ary[i])) { return false };
		};
		return true;
	};
	
	ListNode.prototype.filter = function (cb){
		return this._nodes.filter(cb);
	};
	
	ListNode.prototype.pluck = function (cb){
		var item = this.filter(cb)[0];
		if (item) { this.remove(item) };
		return item;
	};
	
	ListNode.prototype.indexOf = function (item){
		return this._nodes.indexOf(item);
	};
	
	ListNode.prototype.index = function (i){
		return this._nodes[i];
	};
	
	ListNode.prototype.remove = function (item){
		var idx = this._nodes.indexOf(item);
		if (idx >= 0) { this._nodes.splice(idx,1) };
		return this;
	};
	
	ListNode.prototype.replace = function (original,replacement){
		var idx = this._nodes.indexOf(original);
		if (idx >= 0) {
			if (replacement instanceof Array) {
				// p "replaceing with array of items"
				this._nodes.splice.apply(this._nodes,[].concat([idx,1], [].slice.call(replacement)));
			} else {
				this._nodes[idx] = replacement;
			};
		};
		return this;
	};
	
	ListNode.prototype.first = function (){
		return this._nodes[0];
	};
	
	ListNode.prototype.last = function (){
		var i = this._nodes.length;
		while (i){
			i = i - 1;
			var v = this._nodes[i];
			if (!((v instanceof Meta))) { return v };
		};
		return null;
	};
	
	ListNode.prototype.map = function (fn){
		return this._nodes.map(fn);
	};
	
	ListNode.prototype.forEach = function (fn){
		return this._nodes.forEach(fn);
	};
	
	ListNode.prototype.remap = function (fn){
		this._nodes = this.map(fn);
		return this;
	};
	
	ListNode.prototype.count = function (){
		return this._nodes.length;
	};
	
	ListNode.prototype.realCount = function (){
		var k = 0;
		for (var i=0, ary=iter$(this._nodes), len=ary.length, node; i < len; i++) {
			node = ary[i];if (node && !(node instanceof Meta)) { k++ };
		};
		return k;
	};
	
	ListNode.prototype.visit = function (){
		for (var i=0, ary=iter$(this._nodes), len=ary.length, node; i < len; i++) {
			node = ary[i];node && node.traverse();
		};
		return this;
	};
	
	ListNode.prototype.isExpressable = function (){
		for (var i=0, ary=iter$(this.nodes()), len=ary.length, node; i < len; i++) {
			node = ary[i];if (node && !(node.isExpressable())) { return false };
		};
		// return no unless nodes.every(|v| v.isExpressable )
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
		var nodes = pars.nodes !== undefined ? pars.nodes : this._nodes;
		var delim = ',';
		var express = delim != ';';
		var last = this.last();
		
		var i = 0;
		var l = nodes.length;
		var str = "";
		
		for (var j=0, ary=iter$(nodes), len=ary.length, arg; j < len; j++) {
			arg = ary[j];var part = typeof arg == 'string' ? (arg) : ((arg ? (arg.c({expression: express})) : ('')));
			str += part;
			if (part && (!express || arg != last) && !(arg instanceof Meta)) { str += delim };
		};
		
		return str;
	};
	
	
	
	/* @class ArgList */
	function ArgList(){ ListNode.apply(this,arguments) };
	
	subclass$(ArgList,ListNode);
	exports.ArgList = ArgList; // export class 
	ArgList.prototype.indented = function (a,b){
		this._indentation || (this._indentation = a && b ? (new Indentation(a,b)) : (INDENT));
		return this;
	};
	
	
	// def hasSplat
	// 	@nodes.some do |v| v isa Splat
	// def delimiter
	// 	","
	
	
	/* @class AssignList */
	function AssignList(){ ArgList.apply(this,arguments) };
	
	subclass$(AssignList,ArgList);
	exports.AssignList = AssignList; // export class 
	AssignList.prototype.concat = function (other){
		if (this._nodes.length == 0 && (other instanceof AssignList)) {
			return other;
		} else {
			AssignList.__super__.concat.call(this,other);
		};
		// need to store indented content as well?
		// @nodes = nodes.concat(other isa Array ? other : other.nodes)
		return this;
	};
	
	
	
	/* @class Block */
	function Block(list){
		this.setup();
		// @nodes = compact__(flatten__(list)) or []
		this._nodes = list || [];
		this._head = null;
		this._indentation = null;
	};
	
	subclass$(Block,ListNode);
	exports.Block = Block; // export class 
	
	Block.prototype.__head = {name: 'head'};
	Block.prototype.head = function(v){ return this._head; }
	Block.prototype.setHead = function(v){ this._head = v; return this; };
	
	
	
	Block.wrap = function (ary){
		if (!((ary instanceof Array))) {
			throw new SyntaxError("what");
		};
		return ary.length == 1 && (ary[0] instanceof Block) ? (ary[0]) : (new Block(ary));
	};
	
	Block.prototype.visit = function (){
		if (this._scope) { this._scope.visit() };
		
		for (var i=0, ary=iter$(this._nodes), len=ary.length, node; i < len; i++) {
			node = ary[i];node && node.traverse();
		};
		return this;
	};
	
	Block.prototype.block = function (){
		return this;
	};
	
	Block.prototype.indented = function (a,b){
		this._indentation || (this._indentation = a && b ? (new Indentation(a,b)) : (INDENT));
		return this;
	};
	
	Block.prototype.loc = function (){
		// rather indents, no?
		var opt;
		if (opt = this.option('ends')) {
			// p "location is",opt
			var a = opt[0].loc();
			var b = opt[1].loc();
			
			if (!a) { this.p(("no loc for " + (opt[0]))) };
			if (!b) { this.p(("no loc for " + (opt[1]))) };
			
			return [a[0],b[1]];
		} else {
			return [0,0];
		};
	};
	
	// go through children and unwrap inner nodes
	Block.prototype.unwrap = function (){
		var ary = [];
		for (var i=0, items=iter$(this.nodes()), len=items.length, node; i < len; i++) {
			node = items[i];if (node instanceof Block) {
				// p "unwrapping inner block"
				ary.push.apply(ary,node.unwrap());
			} else {
				ary.push(node);
			};
		};
		return ary;
	};
	
	Block.prototype.push = function (item){
		this._nodes.push(item);
		return this;
	};
	
	Block.prototype.add = function (item){
		this._nodes.push(item);
		return this;
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
		// p "analyzing block!!!",o
		if(o === undefined) o = {};
		return this;
	};
	
	Block.prototype.cpart = function (node){
		var out = typeof node == 'string' ? (node) : ((node ? (node.c()) : ("")));
		if (out == null || out == undefined || out == "") { return "" };
		
		if (out instanceof Array) {
			var str = "";
			var l = out.length;
			var i = 0;
			while (i < l){
				str += this.cpart(out[i++]);
			};
			return str;
		};
		
		var hasSemiColon = SEMICOLON_TEST.test(out);
		if (!(hasSemiColon || (node instanceof Meta))) { out += ";" };
		return out;
	};
	
	Block.prototype.js = function (o,opts){
		var ast = this._nodes;
		var l = ast.length;
		// really?
		var express = this.isExpression() || o.isExpression() || (this.option('express') && this.isExpressable());
		if (ast.length == 0) { return null };
		
		if (express) {
			return Block.__super__.js.call(this,o,{nodes: ast});
		};
		
		var str = "";
		for (var i=0, ary=iter$(ast), len=ary.length; i < len; i++) {
			str += this.cpart(ary[i]);
		};
		
		// now add the head items as well
		if (this._head && this._head.length > 0) {
			var prefix = "";
			for (var i=0, ary=iter$(this._head), len=ary.length; i < len; i++) {
				var hv = this.cpart(ary[i]);
				if (hv) { prefix += hv + '\n' };
			};
			str = prefix + str;
		};
		return str;
	};
	
	
	// Should this create the function as well?
	Block.prototype.defers = function (original,replacement){
		var idx = this._nodes.indexOf(original);
		if (idx >= 0) { this._nodes[idx] = replacement };
		var rest = this._nodes.splice(idx + 1);
		return rest;
	};
	
	Block.prototype.consume = function (node){
		var before;
		if (node instanceof TagTree) { // special case?!?
			this._nodes = this._nodes.map(function(child) {
				return child.consume(node);
			});
			if (this._nodes.length > 1) { this._nodes = [new Arr(new ArgList(this._nodes))] };
			
			
			return this;
		};
		
		// can also return super if it is expressable, but should we really?
		if (before = this.last()) {
			var after = before.consume(node);
			if (after != before) {
				// p "replace node in block {before} -> {after}"
				if (after instanceof Block) {
					// p "replaced with block -- should basically add it instead?"
					after = after.nodes();
				};
				
				this.replace(before,after);
			};
		};
		// really?
		return this;
	};
	
	
	Block.prototype.isExpressable = function (){
		if (!this._nodes.every(function(v) {
			return v.isExpressable();
		})) { return false };
		return true;
	};
	
	Block.prototype.isExpression = function (){
		
		return this.option('express') || this._expression;
	};
	
	
	
	// this is almost like the old VarDeclarations but without the values
	/* @class VarBlock */
	function VarBlock(){ ListNode.apply(this,arguments) };
	
	subclass$(VarBlock,ListNode);
	exports.VarBlock = VarBlock; // export class 
	VarBlock.prototype.load = function (list){
		var first = list[0];
		
		if (first instanceof Assign) {
			this._type = first.left()._type;
		} else if (first instanceof VarReference) {
			this._type = first._type;
		};
		// p "here {list[0]} - {@type}"
		// @type = list[0] and list[0].type
		return list;
	};
	
	// TODO All these inner items should rather be straight up literals
	// or basic localvars - without any care whatsoever about adding var to the
	// beginning etc. 
	VarBlock.prototype.addExpression = function (expr){
		// p "VarBlock.addExpression {self} <- {expr}"
		
		if (expr instanceof Assign) {
			// make sure the left-side is a var-reference
			// this should be a different type of assign, no?
			if (expr.left() instanceof VarOrAccess) {
				expr.setLeft(new VarReference(expr.left().value(),this._type));
			};
			
			this.push(expr);
		} else if (expr instanceof Assign) {
			this.addExpression(expr.left()); // make sure this is a valid thing?
			// make this into a tuple instead
			// does not need to be a tuple?
			return new TupleAssign('=',new Tuple(this.nodes()),expr.right());
		} else if (expr instanceof VarOrAccess) {
			// this is really a VarReference
			this.push(new VarReference(expr.value(),this._type));
		} else if ((expr instanceof Splat) && (expr.node() instanceof VarOrAccess)) {
			// p "is a splat - only allowed in tuple-assignment"
			// what?
			expr.setValue(new VarReference(expr.node().value(),this._type));
			this.push(expr);
		} else {
			this.p(("VarBlock.addExpression " + this + " <- " + expr));
			throw "VarBlock does not allow non-variable expressions";
		};
		return this;
	};
	
	
	VarBlock.prototype.isExpressable = function (){
		// we would need to force-drop the variables, makes little sense
		// but, it could be, could just push the variables out?
		return false;
	};
	
	VarBlock.prototype.js = function (o){
		// p "VarBlock"
		// for n in @nodes
		// 	p "VarBlock child {n}"
		var code = compact__(flatten__(cary__(this.nodes())));
		code = code.filter(function(n) {
			return n != null && n != undefined && n != EMPTY;
		});
		var out = code.join(",");
		// we just need to trust that the variables have been autodeclared beforehand
		// if we are inside an expression
		if (!(o.isExpression())) { out = "var " + out };
		return out;
	};
	
	
	VarBlock.prototype.consume = function (node){
		// It doesnt make much sense for a VarBlock to consume anything
		// it should probably return void for methods
		return this;
	};
	
	
	
	// Could inherit from valueNode
	/* @class Parens */
	function Parens(){ ValueNode.apply(this,arguments) };
	
	subclass$(Parens,ValueNode);
	exports.Parens = Parens; // export class 
	Parens.prototype.load = function (value){
		this._noparen = false;
		return (value instanceof Block) && value.count() == 1 ? (value.first()) : (value);
	};
	
	Parens.prototype.js = function (o){
		
		var par = this.up();
		var v = this._value;
		
		if (v instanceof Func) { this._noparen = true };
		// p "compile parens {v} {v isa Block and v.count}"
		// p "Parens up {par} {o.isExpression}"
		if (par instanceof Block) {
			// is it worth it?
			if (!(o.isExpression())) { this._noparen = true };
			return v instanceof Array ? (cary__(v)) : (v.c({expression: o.isExpression()}));
		} else {
			return v instanceof Array ? (cary__(v)) : (v.c({expression: true}));
		};
	};
	
	Parens.prototype.set = function (obj){
		var $1;
		console.log(("Parens set " + (JSON.stringify(obj))));
		return Parens.__super__.set.call(this,obj);
	};
	
	
	Parens.prototype.shouldParenthesize = function (){
		// no need to parenthesize if this is a line in a block
		if (this._noparen) { return false }; //  or par isa ArgList
		return true;
	};
	
	
	Parens.prototype.prebreak = function (br){
		var $1;
		Parens.__super__.prebreak.call(this,br);
		console.log("PREBREAK");
		if (this._value) { this._value.prebreak(br) };
		return this;
	};
	
	
	Parens.prototype.isExpressable = function (){
		return this._value.isExpressable();
	};
	
	Parens.prototype.consume = function (node){
		return this._value.consume(node);
	};
	
	
	
	// Could inherit from valueNode
	// an explicit expression-block (with parens) is somewhat different
	// can be used to return after an expression
	/* @class ExpressionBlock */
	function ExpressionBlock(){ ListNode.apply(this,arguments) };
	
	subclass$(ExpressionBlock,ListNode);
	exports.ExpressionBlock = ExpressionBlock; // export class 
	ExpressionBlock.prototype.c = function (){
		return this.map(function(item) {
			return item.c();
		}).join(",");
	};
	
	ExpressionBlock.prototype.consume = function (node){
		return this.value().consume(node);
	};
	
	ExpressionBlock.prototype.addExpression = function (expr){
		// Need to take care of the splat here to.. hazzle
		if (expr.node() instanceof Assign) {
			// p "is assignment!"
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
		this._traversed = false;
		this._value = (v instanceof ArgList) && v.count() == 1 ? (v.last()) : (v);
		// @prebreak = v and v.@prebreak
		// console.log "return?!? {v}",@prebreak
		// if v isa ArgList and v.count == 1
		return this;
	};
	
	subclass$(Return,Statement);
	exports.Return = Return; // export class 
	
	Return.prototype.__value = {name: 'value'};
	Return.prototype.value = function(v){ return this._value; }
	Return.prototype.setValue = function(v){ this._value = v; return this; };
	
	
	
	Return.prototype.visit = function (){
		if (this._value && this._value.traverse) { return this._value.traverse() };
	};
	
	Return.prototype.js = function (o){
		var v = this._value;
		
		if (v instanceof ArgList) {
			return ("return [" + (v.c({expression: true})) + "]");
		} else if (v) {
			return ("return " + (v.c({expression: true})));
		} else {
			return "return";
		};
	};
	
	Return.prototype.c = function (){
		if (!this.value() || this.value().isExpressable()) { return Return.__super__.c.apply(this,arguments) };
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
	Throw.prototype.js = function (o){
		return "throw " + (this.value().c());
	};
	
	Throw.prototype.consume = function (node){
		// ROADMAP should possibly consume to the value of throw and then throw?
		return this;
	};
	
	
	
	/* @class LoopFlowStatement */
	function LoopFlowStatement(lit,expr){
		this.setLiteral(lit);
		this.setExpression(expr); // && ArgList.new(expr) # really?
	};
	
	subclass$(LoopFlowStatement,Statement);
	exports.LoopFlowStatement = LoopFlowStatement; // export class 
	
	LoopFlowStatement.prototype.__literal = {name: 'literal'};
	LoopFlowStatement.prototype.literal = function(v){ return this._literal; }
	LoopFlowStatement.prototype.setLiteral = function(v){ this._literal = v; return this; };
	
	LoopFlowStatement.prototype.__expression = {name: 'expression'};
	LoopFlowStatement.prototype.expression = function(v){ return this._expression; }
	LoopFlowStatement.prototype.setExpression = function(v){ this._expression = v; return this; };
	
	
	
	LoopFlowStatement.prototype.visit = function (){
		if (this.expression()) { return this.expression().traverse() };
	};
	
	LoopFlowStatement.prototype.consume = function (node){
		// p "break/continue should consume?!"
		return this;
	};
	
	LoopFlowStatement.prototype.c = function (){
		if (!this.expression()) { return LoopFlowStatement.__super__.c.apply(this,arguments) };
		// get up to the outer loop
		var _loop = STACK.up(Loop);
		// p "found loop?",_loop
		
		// need to fix the grammar for this. Right now it 
		// is like a fake call, but should only care about the first argument
		var expr = this.expression();
		
		if (_loop.catcher()) {
			expr = expr.consume(_loop.catcher());
			var copy = new this.constructor(this.literal());
			return new Block([expr,copy]).c();
		} else if (expr) {
			copy = new this.constructor(this.literal());
			return new Block([expr,copy]).c();
		} else {
			return LoopFlowStatement.__super__.c.apply(this,arguments);
		};
		// return "loopflow"
	};
	
	
	
	/* @class BreakStatement */
	function BreakStatement(){ LoopFlowStatement.apply(this,arguments) };
	
	subclass$(BreakStatement,LoopFlowStatement);
	exports.BreakStatement = BreakStatement; // export class 
	BreakStatement.prototype.js = function (o){
		return "break";
	};
	
	
	/* @class ContinueStatement */
	function ContinueStatement(){ LoopFlowStatement.apply(this,arguments) };
	
	subclass$(ContinueStatement,LoopFlowStatement);
	exports.ContinueStatement = ContinueStatement; // export class 
	ContinueStatement.prototype.js = function (o){
		return "continue";
	};
	
	
	/* @class DebuggerStatement */
	function DebuggerStatement(){ Statement.apply(this,arguments) };
	
	subclass$(DebuggerStatement,Statement);
	exports.DebuggerStatement = DebuggerStatement; // export class 
	
	
	
	// PARAMS
	
	/* @class Param */
	function Param(name,defaults,typ){
		// could have introduced bugs by moving back to identifier here
		this._traversed = false;
		this._name = name; // .value # this is an identifier(!)
		this._defaults = defaults;
		this._typ = typ;
		this._variable = null;
	};
	
	subclass$(Param,Node);
	exports.Param = Param; // export class 
	
	Param.prototype.__name = {name: 'name'};
	Param.prototype.name = function(v){ return this._name; }
	Param.prototype.setName = function(v){ this._name = v; return this; };
	
	Param.prototype.__index = {name: 'index'};
	Param.prototype.index = function(v){ return this._index; }
	Param.prototype.setIndex = function(v){ this._index = v; return this; };
	
	Param.prototype.__defaults = {name: 'defaults'};
	Param.prototype.defaults = function(v){ return this._defaults; }
	Param.prototype.setDefaults = function(v){ this._defaults = v; return this; };
	
	Param.prototype.__splat = {name: 'splat'};
	Param.prototype.splat = function(v){ return this._splat; }
	Param.prototype.setSplat = function(v){ this._splat = v; return this; };
	
	Param.prototype.__variable = {name: 'variable'};
	Param.prototype.variable = function(v){ return this._variable; }
	Param.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	// what about object-params?
	
	
	
	Param.prototype.js = function (o){
		if (this._variable) { return this._variable.c() };
		
		if (this.defaults()) {
			return "if(" + (this.name().c()) + " == null) " + (this.name().c()) + " = " + (this.defaults().c());
		};
		// see if this is the initial declarator?
	};
	
	Param.prototype.visit = function (){
		var variable_, v_;
		if (this._defaults) { this._defaults.traverse() };
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
		// hacky.. cannot know for sure that this is right?
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
		// hacky.. cannot know for sure that this is right?
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
	
	NamedParams.prototype.__index = {name: 'index'};
	NamedParams.prototype.index = function(v){ return this._index; }
	NamedParams.prototype.setIndex = function(v){ this._index = v; return this; };
	
	NamedParams.prototype.__variable = {name: 'variable'};
	NamedParams.prototype.variable = function(v){ return this._variable; }
	NamedParams.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	NamedParams.prototype.load = function (list){
		var load = function(k) {
			return new NamedParam(k.key(),k.value());
		};
		return list instanceof Obj ? (list.value().map(load)) : (list);
	};
	
	NamedParams.prototype.visit = function (){
		var s = this.scope__();
		this._variable || (this._variable = s.temporary(this,{pool: 'keypars'}));
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
	
	NamedParams.prototype.js = function (o){
		return "namedpar";
	};
	
	
	/* @class IndexedParam */
	function IndexedParam(){ Param.apply(this,arguments) };
	
	subclass$(IndexedParam,Param);
	exports.IndexedParam = IndexedParam; // export class 
	
	IndexedParam.prototype.__parent = {name: 'parent'};
	IndexedParam.prototype.parent = function(v){ return this._parent; }
	IndexedParam.prototype.setParent = function(v){ this._parent = v; return this; };
	
	IndexedParam.prototype.__subindex = {name: 'subindex'};
	IndexedParam.prototype.subindex = function(v){ return this._subindex; }
	IndexedParam.prototype.setSubindex = function(v){ this._subindex = v; return this; };
	
	IndexedParam.prototype.visit = function (){
		// p "VISIT PARAM {name}!"
		// ary.[-1] # possible
		// ary.(-1) # possible
		// str(/ok/,-1)
		// scope.register(@name,self)
		// BUG The defaults should probably be looked up like vars
		var variable_, v_;
		(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(this.name(),this)),v_));
		this.variable().proxy(this.parent().variable(),this.subindex());
		return this;
	};
	
	
	
	/* @class ArrayParams */
	function ArrayParams(){ ListNode.apply(this,arguments) };
	
	subclass$(ArrayParams,ListNode);
	exports.ArrayParams = ArrayParams; // export class 
	
	ArrayParams.prototype.__index = {name: 'index'};
	ArrayParams.prototype.index = function(v){ return this._index; }
	ArrayParams.prototype.setIndex = function(v){ this._index = v; return this; };
	
	ArrayParams.prototype.__variable = {name: 'variable'};
	ArrayParams.prototype.variable = function(v){ return this._variable; }
	ArrayParams.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	ArrayParams.prototype.visit = function (){
		var s = this.scope__();
		this._variable || (this._variable = s.temporary(this,{pool: 'keypars'}));
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
		if (!((list instanceof Arr))) { return null };
		// p "loading arrayparams"
		// try the basic first
		if (!(list.splat())) {
			return list.value().map(function(v,i) {
				// must make sure the params are supported here
				// should really not parse any array at all(!)
				var name = v;
				if (v instanceof VarOrAccess) {
					// p "varoraccess {v.value}"
					// FIX?
					name = v.value().value();
					// this is accepted
				};
				return self.parse(name,v,i);
			});
		};
	};
	
	ArrayParams.prototype.parse = function (name,child,i){
		var param = new IndexedParam(name,null);
		
		param.setParent(this);
		param.setSubindex(i);
		return param;
	};
	
	ArrayParams.prototype.head = function (ast){
		// "arrayparams"
		return this;
	};
	
	
	/* @class ParamList */
	function ParamList(){ ListNode.apply(this,arguments) };
	
	subclass$(ParamList,ListNode);
	exports.ParamList = ParamList; // export class 
	
	ParamList.prototype.__splat = {name: 'splat'};
	ParamList.prototype.splat = function(v){ return this._splat; }
	ParamList.prototype.setSplat = function(v){ this._splat = v; return this; };
	
	ParamList.prototype.__block = {name: 'block'};
	ParamList.prototype.block = function(v){ return this._block; }
	ParamList.prototype.setBlock = function(v){ this._block = v; return this; };
	
	ParamList.prototype.at = function (index,force,name){
		if(force === undefined) force = false;
		if(name === undefined) name = null;
		if (force) {
			while (this.count() <= index){
				this.add(new Param(this.count() == index && name || ("_" + this.count())));
			};
			// need to visit at the same time, no?
		};
		return this.list()[index];
	};
	
	ParamList.prototype.visit = function (){
		this._splat = this.filter(function(par) {
			return par instanceof SplatParam;
		})[0];
		var blk = this.filter(function(par) {
			return par instanceof BlockParam;
		});
		
		if (blk.length > 1) {
			blk[1].warn("a method can only have one &block parameter");
		} else if (blk[0] && blk[0] != this.last()) {
			blk[0].warn("&block must be the last parameter of a method");
			// warn "&block must be the last parameter of a method", blk[0]
		};
		
		// add more warnings later(!)
		// should probably throw error as well to stop compilation
		
		// need to register the required-pars as variables
		return ParamList.__super__.visit.apply(this,arguments);
	};
	
	ParamList.prototype.js = function (o){
		if (this.count() == 0) { return EMPTY };
		if (o.parent() instanceof Block) { return this.head(o) };
		
		// items = map(|arg| arg.name.c ).compact
		// return null unless items[0]
		
		if (o.parent() instanceof Code) {
			// remove the splat, for sure.. need to handle the other items as well
			// this is messy with references to argvars etc etc. Fix
			var pars = this.nodes();
			// pars = filter(|arg| arg != @splat && !(arg isa BlockParam)) if @splat
			if (this._splat) { pars = this.filter(function(arg) {
				return (arg instanceof RequiredParam) || (arg instanceof OptionalParam);
			}) };
			return compact__(pars.map(function(arg) {
				return c__(arg.name());
			})).join(",");
		} else {
			throw "not implemented paramlist js";
			return "ta" + compact__(this.map(function(arg) {
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
		
		this.nodes().forEach(function(par,i) {
			par.setIndex(idx);
			if (par instanceof NamedParams) {
				signature.push('named');
				named = par;
			} else if (par instanceof OptionalParam) {
				signature.push('opt');
				opt.push(par);
			} else if (par instanceof BlockParam) {
				signature.push('blk');
				blk = par;
			} else if (par instanceof SplatParam) {
				signature.push('splat');
				splat = par;
				idx -= 1; // this should really be removed from the list, no?
			} else if (par instanceof ArrayParams) {
				arys.push(par);
				signature.push('ary');
			} else {
				signature.push('reg');
				reg.push(par);
			};
			return idx++;
		});
		
		if (named) {
			var namedvar = named.variable();
		};
		
		// var opt = nodes.filter(|n| n isa OptionalParam)
		// var blk = nodes.filter(|n| n isa BlockParam)[0]
		// var splat = nodes.filter(|n| n isa SplatParam)[0]
		
		// simple situation where we simply switch
		// can probably optimize by not looking at arguments at all
		var ast = [];
		var isFunc = function(js) {
			return "typeof " + js + " == 'function'";
		};
		
		// This is broken when dealing with iframes anc XSS scripting
		// but for now it is the best test for actual arguments
		// can also do constructor.name == 'Object'
		var isObj = function(js) {
			return "" + js + ".constructor === Object";
		};
		var isntObj = function(js) {
			return "" + js + ".constructor !== Object";
		};
		// should handle some common cases in a cleaner (less verbose) manner
		// does this work with default params after optional ones? Is that even worth anything?
		// this only works in one direction now, unlike TupleAssign
		
		// we dont really check the length etc now -- so it is buggy for lots of arguments
		
		// if we have optional params in the regular order etc we can go the easy route
		// slightly hacky now. Should refactor all of these to use the signature?
		if (!named && !splat && !blk && opt.length > 0 && signature.join(" ").match(/opt$/)) {
			for (var i=0, len_=opt.length, par; i < len_; i++) {
				par = opt[i];ast.push(("if(" + (par.name().c()) + " === undefined) " + (par.name().c()) + " = " + (par.defaults().c())));
			};
		} else if (named && !splat && !blk && opt.length == 0) { // and no block?!
			// different shorthands
			// if named
			ast.push(("if(!" + (namedvar.c()) + "||" + (isntObj(namedvar.c())) + ") " + (namedvar.c()) + " = \{\}"));
		} else if (blk && opt.length == 1 && !splat && !named) {
			var op = opt[0];
			var opn = op.name().c();
			var bn = blk.name().c();
			ast.push(("if(" + bn + "==undefined && " + (isFunc(opn)) + ") " + bn + " = " + opn + "," + opn + " = " + (op.defaults().c())));
		} else if (blk && named && opt.length == 0 && !splat) {
			bn = blk.name().c();
			ast.push(("if(" + bn + "==undefined && " + (isFunc(namedvar.c())) + ") " + bn + " = " + (namedvar.c()) + "," + (namedvar.c()) + " = \{\}"));
			ast.push(("else if(!" + (namedvar.c()) + "||" + (isntObj(namedvar.c())) + ") " + (namedvar.c()) + " = \{\}"));
		} else if (opt.length > 0 || splat) { // && blk  # && !splat
			
			var argvar = this.scope__().temporary(this,{pool: 'arguments'}).predeclared().c();
			var len = this.scope__().temporary(this,{pool: 'counter'}).predeclared().c();
			
			var last = ("" + argvar + "[" + len + "-1]");
			var pop = ("" + argvar + "[--" + len + "]");
			ast.push(("var " + argvar + " = arguments, " + len + " = " + argvar + ".length"));
			
			if (blk) {
				bn = blk.name().c();
				if (splat) {
					ast.push(("var " + bn + " = " + (isFunc(last)) + " ? " + pop + " : null"));
				} else if (reg.length > 0) {
					// ast.push "// several regs really?"
					ast.push(("var " + bn + " = " + len + " > " + (reg.length) + " && " + (isFunc(last)) + " ? " + pop + " : null"));
				} else {
					ast.push(("var " + bn + " = " + (isFunc(last)) + " ? " + pop + " : null"));
				};
			};
			
			// if we have named params - look for them before splat
			// should probably loop through pars in the same order they were added
			// should it be prioritized above optional objects??
			if (named) {
				// should not include it when there is a splat?
				ast.push(("var " + (namedvar.c()) + " = " + last + "&&" + (isObj(last)) + " ? " + pop + " : \{\}"));
			};
			
			for (var i1=0, len_=opt.length, par1; i1 < len_; i1++) {
				par1 = opt[i1];ast.push(("if(" + len + " < " + (par1.index() + 1) + ") " + (par1.name().c()) + " = " + (par1.defaults().c())));
			};
			
			// add the splat
			if (splat) {
				var sn = splat.name().c();
				var si = splat.index();
				
				if (si == 0) {
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
		} else if (opt.length > 0) {
			for (var i2=0, len_=opt.length, par2; i2 < len_; i2++) {
				par2 = opt[i2];ast.push(("if(" + (par2.name().c()) + " === undefined) " + (par2.name().c()) + " = " + (par2.defaults().c())));
			};
		};
		
		// now set stuff if named params(!)
		
		if (named) {
			for (var i3=0, ary=iter$(named.nodes()), len_=ary.length, k; i3 < len_; i3++) {
				// console.log "named var {k.c}"
				k = ary[i3];op = OP('.',namedvar,k.c()).c();
				ast.push(("var " + (k.c()) + " = " + op + " !== undefined ? " + op + " : " + (k.defaults().c())));
			};
		};
		
		if (arys.length) {
			for (var i4=0, len_=arys.length; i4 < len_; i4++) {
				// create tuples
				this.p("adding arrayparams");
				arys[i4].head(o,ast,this);
				// ast.push v.c
			};
		};
		
		
		
		// if opt:length == 0
		return ast.length > 0 ? ((ast.join(";\n") + ";")) : (EMPTY);
	};
	
	
	
	// Legacy. Should move away from this?
	/* @class VariableDeclaration */
	function VariableDeclaration(){ ListNode.apply(this,arguments) };
	
	subclass$(VariableDeclaration,ListNode);
	exports.VariableDeclaration = VariableDeclaration; // export class 
	
	VariableDeclaration.prototype.__kind = {name: 'kind'};
	VariableDeclaration.prototype.kind = function(v){ return this._kind; }
	VariableDeclaration.prototype.setKind = function(v){ this._kind = v; return this; };
	
	// we want to register these variables in
	VariableDeclaration.prototype.add = function (name,init,pos){
		if(pos === undefined) pos = -1;
		var vardec = new VariableDeclarator(name,init);
		if (name instanceof Variable) { (vardec.setVariable(name),name) };
		pos == 0 ? (this.unshift(vardec)) : (this.push(vardec));
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
		// temporary solution!!!
		return list.map(function(par) {
			return new VariableDeclarator(par.name(),par.defaults(),par.splat());
		});
	};
	
	VariableDeclaration.prototype.isExpressable = function (){
		return this.nodes().every(function(item) {
			return item.isExpressable();
		});
	};
	
	VariableDeclaration.prototype.js = function (o){
		if (this.count() == 0) { return EMPTY };
		
		if (this.count() == 1 && !this.isExpressable()) {
			// p "SHOULD ALTER VARDEC!!!".cyan
			this.first().variable().autodeclare();
			var node = this.first().assignment();
			return node.c();
		};
		
		// FIX PERFORMANCE
		var out = compact__(cary__(this.nodes())).join(", ");
		return out ? (("var " + out)) : ("");
		// "var " + compact__(cary__(nodes)).join(", ") + ""
	};
	
	
	/* @class VariableDeclarator */
	function VariableDeclarator(){ Param.apply(this,arguments) };
	
	subclass$(VariableDeclarator,Param);
	exports.VariableDeclarator = VariableDeclarator; // export class 
	VariableDeclarator.prototype.visit = function (){
		// even if we should traverse the defaults as if this variable does not exist
		// we need to preregister it and then activate it later
		var variable_, v_;
		(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(this.name(),null)),v_));
		if (this.defaults()) { this.defaults().traverse() };
		// WARN what if it is already declared?
		this.variable().setDeclarator(this);
		this.variable().addReference(this.name());
		return this;
	};
	
	// needs to be linked up to the actual scoped variables, no?
	VariableDeclarator.prototype.js = function (o){
		if (this.variable()._proxy) { return null };
		
		var defs = this.defaults();
		// FIXME need to deal with var-defines within other statements etc
		// FIXME need better syntax for this
		if (defs != null && defs != undefined) {
			// console.log "defaults is {defaults}"
			if (defs instanceof Node) { defs = defs.c({expression: true}) };
			
			return "" + (this.variable().c()) + "=" + defs;
		} else {
			return "" + (this.variable().c());
		};
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
	
	VarName.prototype.__variable = {name: 'variable'};
	VarName.prototype.variable = function(v){ return this._variable; }
	VarName.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	VarName.prototype.__splat = {name: 'splat'};
	VarName.prototype.splat = function(v){ return this._splat; }
	VarName.prototype.setSplat = function(v){ this._splat = v; return this; };
	
	
	
	VarName.prototype.visit = function (){
		// p "visiting varname(!)", value.c
		// should we not lookup instead?
		var variable_, v_;
		(variable_=this.variable()) || ((this.setVariable(v_=this.scope__().register(this.value().c(),null)),v_));
		this.variable().setDeclarator(this);
		this.variable().addReference(this.value());
		return this;
	};
	
	VarName.prototype.js = function (o){
		return this.variable().c();
	};
	
	VarName.prototype.c = function (){
		return this.variable().c();
	};
	
	
	
	/* @class VarList */
	function VarList(t,l,r){
		this._traversed = false;
		this._type = this.type();
		this._left = l;
		this._right = r;
	};
	
	subclass$(VarList,Node);
	exports.VarList = VarList; // export class 
	
	VarList.prototype.__type = {name: 'type'};
	VarList.prototype.type = function(v){ return this._type; }
	VarList.prototype.setType = function(v){ this._type = v; return this; }; // let / var / const
	
	VarList.prototype.__left = {name: 'left'};
	VarList.prototype.left = function(v){ return this._left; }
	VarList.prototype.setLeft = function(v){ this._left = v; return this; };
	
	VarList.prototype.__right = {name: 'right'};
	VarList.prototype.right = function(v){ return this._right; }
	VarList.prototype.setRight = function(v){ this._right = v; return this; };
	
	// format :type, :left, :right
	
	// should throw error if there are more values on right than left
	
	
	
	VarList.prototype.visit = function (){
		
		// we need to carefully traverse children in the right order
		// since we should be able to reference
		var r;
		for (var i=0, ary=iter$(this.left()), len=ary.length; i < len; i++) {
			ary[i].traverse(); // this should really be a var-declaration
			if (r = this.right()[i]) { r.traverse() };
		};
		return this;
	};
	
	VarList.prototype.js = function (o){
		// for the regular items 
		var pairs = [];
		var ll = this.left().length;
		var rl = this.right().length;
		var v = null;
		
		// splatting here we come
		if (ll > 1 && rl == 1) {
			this.p("multiassign!");
			var r = this.right()[0];
			r.cache();
			for (var i=0, ary=iter$(this.left()), len=ary.length, l; i < len; i++) {
				l = ary[i];if (l.splat()) {
					throw "not supported?";
					this.p("splat"); // FIX reimplement slice?
					if (i == ll - 1) {
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
			for (var i1=0, ary=iter$(this.left()), len=ary.length, l1; i1 < len; i1++) {
				l1 = ary[i1];r = this.right()[i1];
				pairs.push(r ? (OP('=',l1.variable().accessor(),r)) : (l1));
			};
		};
		
		return ("var " + (pairs.c()));
	};
	
	
	
	// CODE
	
	/* @class Code */
	function Code(){ Node.apply(this,arguments) };
	
	subclass$(Code,Node);
	exports.Code = Code; // export class 
	
	Code.prototype.__head = {name: 'head'};
	Code.prototype.head = function(v){ return this._head; }
	Code.prototype.setHead = function(v){ this._head = v; return this; };
	
	Code.prototype.__body = {name: 'body'};
	Code.prototype.body = function(v){ return this._body; }
	Code.prototype.setBody = function(v){ this._body = v; return this; };
	
	Code.prototype.__scope = {name: 'scope'};
	Code.prototype.scope = function(v){ return this._scope; }
	Code.prototype.setScope = function(v){ this._scope = v; return this; };
	
	Code.prototype.__params = {name: 'params'};
	Code.prototype.params = function(v){ return this._params; }
	Code.prototype.setParams = function(v){ this._params = v; return this; };
	
	Code.prototype.scopetype = function (){
		return Scope;
	};
	
	Code.prototype.visit = function (){
		if (this._scope) { this._scope.visit() };
		// @scope.parent = STACK.scope(1) if @scope
		return this;
	};
	
	
	// Rename to Program?
	/* @class Root */
	function Root(body,opts){
		// p "create root!"
		this._traversed = false;
		this._body = blk__(body);
		this._scope = new FileScope(this,null);
	};
	
	subclass$(Root,Code);
	exports.Root = Root; // export class 
	
	
	
	Root.prototype.visit = function (){
		this.scope().visit();
		return this.body().traverse();
	};
	
	Root.prototype.compile = function (o){
		STACK.reset(); // -- nested compilation does not work now
		STACK._options = o;
		OPTS = o;
		this.traverse();
		var out = this.c();
		// STACK.reset
		// console.log "copmiled",STACK.@counter
		return out;
	};
	
	Root.prototype.js = function (o){
		return '(function(){\n\n' + this.scope().c({indent: true}) + '\n\n}())';
	};
	
	Root.prototype.analyze = function (pars){
		if(!pars||pars.constructor !== Object) pars = {};
		var loglevel = pars.loglevel !== undefined ? pars.loglevel : 0;
		STACK.setLoglevel(loglevel);
		STACK._analyzing = true;
		this.traverse();
		STACK._analyzing = false;
		return this.scope().dump();
	};
	
	Root.prototype.inspect = function (){
		return true;
	};
	
	
	/* @class ClassDeclaration */
	function ClassDeclaration(name,superclass,body){
		// what about the namespace?
		this._traversed = false;
		this._name = name;
		this._superclass = superclass;
		this._scope = new ClassScope(this);
		this._body = blk__(body);
		this;
	};
	
	subclass$(ClassDeclaration,Code);
	exports.ClassDeclaration = ClassDeclaration; // export class 
	
	ClassDeclaration.prototype.__name = {name: 'name'};
	ClassDeclaration.prototype.name = function(v){ return this._name; }
	ClassDeclaration.prototype.setName = function(v){ this._name = v; return this; };
	
	ClassDeclaration.prototype.__superclass = {name: 'superclass'};
	ClassDeclaration.prototype.superclass = function(v){ return this._superclass; }
	ClassDeclaration.prototype.setSuperclass = function(v){ this._superclass = v; return this; };
	
	ClassDeclaration.prototype.__initor = {name: 'initor'};
	ClassDeclaration.prototype.initor = function(v){ return this._initor; }
	ClassDeclaration.prototype.setInitor = function(v){ this._initor = v; return this; };
	
	
	
	ClassDeclaration.prototype.visit = function (){
		// replace with some advanced lookup?
		this.scope().visit();
		this.body().traverse();
		return this;
	};
	
	ClassDeclaration.prototype.js = function (o){
		this.scope().virtualize();
		this.scope().context().setValue(this.name());
		
		// should probably also warn about stuff etc
		if (this.option('extension')) {
			return this.body().c();
		};
		
		var o = this._options || {};
		var cname = this.name() instanceof Access ? (this.name().right()) : (this.name());
		var namespaced = this.name() != cname;
		
		var sup = this.superclass();
		var initor = this.body().pluck(function(c) {
			return (c instanceof MethodDeclaration) && c.type() == 'constructor';
		});
		// compile the cname
		if (typeof cname != 'string') { cname = cname.c() };
		
		var cpath = typeof this.name() == 'string' ? (this.name()) : (this.name().c());
		
		if (!initor) {
			if (sup) {
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
		
		if (namespaced) {
			initor = ("" + cpath + " = " + initor); // OP('=',name,initor)
		};
		
		head.push(("/* @class " + cname + " */\n" + initor + ";\n\n"));
		
		if (sup) {
			// console.log "deal with superclass!"
			// head.push("// extending the superclass\nimba$class({name.c},{sup.c});\n\n")
			head.push(new Util.Subclass([this.name(),sup]));
		};
		
		// only if it is not namespaced
		if (o.global && !namespaced) { // option(:global)
			head.push(("global." + cname + " = " + cpath + "; // global class \n"))
		};
		
		if (o.export && !namespaced) {
			head.push(("exports." + cname + " = " + cpath + "; // export class \n"))
		};
		
		// FIXME
		// if namespaced and (o:local or o:export)
		// 	console.log "namespaced classes are implicitly local/global depending on the namespace"
		
		
		for (var i=0, ary=iter$(head.reverse()), len=ary.length; i < len; i++) {
			this.body().unshift(ary[i]);
		};
		this.body()._indentation = null;
		var out = this.body().c();
		
		return out;
	};
	
	
	
	/* @class TagDeclaration */
	function TagDeclaration(name,superclass,body){
		// what about the namespace?
		// @name = TagTypeRef.new(name)
		this._traversed = false;
		this._name = name;
		this._superclass = superclass;
		this._scope = new TagScope(this);
		this._body = blk__(body || []);
	};
	
	subclass$(TagDeclaration,Code);
	exports.TagDeclaration = TagDeclaration; // export class 
	
	TagDeclaration.prototype.__name = {name: 'name'};
	TagDeclaration.prototype.name = function(v){ return this._name; }
	TagDeclaration.prototype.setName = function(v){ this._name = v; return this; };
	
	TagDeclaration.prototype.__superclass = {name: 'superclass'};
	TagDeclaration.prototype.superclass = function(v){ return this._superclass; }
	TagDeclaration.prototype.setSuperclass = function(v){ this._superclass = v; return this; };
	
	TagDeclaration.prototype.__initor = {name: 'initor'};
	TagDeclaration.prototype.initor = function(v){ return this._initor; }
	TagDeclaration.prototype.setInitor = function(v){ this._initor = v; return this; };
	
	
	
	TagDeclaration.prototype.visit = function (){
		// replace with some advanced lookup?
		this.scope().visit();
		return this.body().traverse();
	};
	
	TagDeclaration.prototype.id = function (){
		return this.name().id();
	};
	
	TagDeclaration.prototype.js = function (o){
		
		if (this.option('extension')) {
			// check if we have an initialize etc - not allowed?
			this.scope().context().setValue(this.name());
			return this.body().c();
		};
		
		// should disallow initialize for tags?
		var sup = this.superclass() && "," + helpers.singlequote(this.superclass().func()) || "";
		
		var out = this.name().id() ? (
			("Imba.defineSingletonTag('" + (this.name().id()) + "',function " + (this.name().func()) + "(d)\{this.setDom(d)\}" + sup + ")")
		) : (
			("Imba.defineTag('" + (this.name().func()) + "',function " + (this.name().func()) + "(d)\{this.setDom(d)\}" + sup + ")")
		);
		
		// if the body is empty we can return this directly
		// console.log "here"
		if (this.body().count() == 0) {
			
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
		// p "INIT Function!!",params,body,name
		var typ = this.scopetype();
		this._traversed = false;
		this._body = blk__(body);
		this._scope || (this._scope = (o && o.scope) || new typ(this));
		this._scope.setParams(this._params = new ParamList(params));
		this._name = name || '';
		this._target = target;
		this._options = o;
		this._type = 'function';
		this._variable = null;
		this;
	};
	
	subclass$(Func,Code);
	exports.Func = Func; // export class 
	
	Func.prototype.__name = {name: 'name'};
	Func.prototype.name = function(v){ return this._name; }
	Func.prototype.setName = function(v){ this._name = v; return this; };
	
	Func.prototype.__params = {name: 'params'};
	Func.prototype.params = function(v){ return this._params; }
	Func.prototype.setParams = function(v){ this._params = v; return this; };
	
	Func.prototype.__target = {name: 'target'};
	Func.prototype.target = function(v){ return this._target; }
	Func.prototype.setTarget = function(v){ this._target = v; return this; };
	
	Func.prototype.__options = {name: 'options'};
	Func.prototype.options = function(v){ return this._options; }
	Func.prototype.setOptions = function(v){ this._options = v; return this; };
	
	Func.prototype.__type = {name: 'type'};
	Func.prototype.type = function(v){ return this._type; }
	Func.prototype.setType = function(v){ this._type = v; return this; };
	
	Func.prototype.__context = {name: 'context'};
	Func.prototype.context = function(v){ return this._context; }
	Func.prototype.setContext = function(v){ this._context = v; return this; };
	
	Func.prototype.scopetype = function (){
		return FunctionScope;
	};
	
	
	
	Func.prototype.visit = function (){
		this.scope().visit();
		this._context = this.scope().parent();
		this._params.traverse();
		return this._body.traverse(); // so soon?
	};
	
	
	Func.prototype.js = function (o){
		if (!this.option('noreturn')) { this.body().consume(new ImplicitReturn()) };
		var code = this.scope().c({indent: true,braces: true});
		// args = params.map do |par| par.name
		// head = params.map do |par| par.c
		// code = [head,body.c(expression: no)].flatten__.compact.join("\n").wrap
		// FIXME creating the function-name this way is prone to create naming-collisions
		// will need to wrap the value in a FunctionName which takes care of looking up scope
		// and possibly dealing with it
		var name = typeof this._name == 'string' ? (this._name) : (this._name.c());
		name = name ? (' ' + name.replace(/\./g,'_')) : ('');
		var out = ("function" + name + "(" + (this.params().c()) + ") ") + code;
		if (this.option('eval')) { out = ("(" + out + ")()") };
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
	
	
	/* @class TagFragmentFunc */
	function TagFragmentFunc(){ Func.apply(this,arguments) };
	
	subclass$(TagFragmentFunc,Func);
	exports.TagFragmentFunc = TagFragmentFunc; // export class 
	
	
	// MethodDeclaration
	// Create a shared body?
	
	/* @class MethodDeclaration */
	function MethodDeclaration(){ Func.apply(this,arguments) };
	
	subclass$(MethodDeclaration,Func);
	exports.MethodDeclaration = MethodDeclaration; // export class 
	
	MethodDeclaration.prototype.__variable = {name: 'variable'};
	MethodDeclaration.prototype.variable = function(v){ return this._variable; }
	MethodDeclaration.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	MethodDeclaration.prototype.scopetype = function (){
		return MethodScope;
	};
	
	MethodDeclaration.prototype.visit = function (){
		// prebreak # make sure this has a break?
		this.scope().visit();
		
		if (String(this.name()) == 'initialize') {
			this.setType('constructor');
		};
		
		if (this.option('greedy')) {
			// set(greedy: true)
			// p "BODY EXPRESSIONS!! This is a fragment"
			var tree = new TagTree();
			this._body = this.body().consume(tree);
			// body.nodes = [Arr.new(body.nodes)]
		};
		
		
		this._context = this.scope().parent();
		this._params.traverse();
		
		if (this.target() instanceof Self) {
			this._target = this._scope.parent().context();
			this.set({static: true});
		};
		
		if (this.context() instanceof ClassScope) {
			// register as class-method?
			// should register for this
			// console.log "context is classscope {@name}"
			true;
		} else if (!(this._target)) {
			this._variable = this.context().register(this.name(),this,{type: 'meth'});
		};
		this._target || (this._target = this._scope.parent().context());
		
		this._body.traverse(); // so soon?
		
		// p "method target {@target} {@context}"
		return this;
	};
	
	MethodDeclaration.prototype.supername = function (){
		return this.type() == 'constructor' ? (this.type()) : (this.name());
	};
	
	
	// FIXME export global etc are NOT valid for methods inside any other scope than
	// the outermost scope (root)
	
	MethodDeclaration.prototype.js = function (o){
		// FIXME Do this in the grammar - remnants of old implementation
		if (!(this.type() == 'constructor' || this.option('noreturn'))) {
			if (this.option('greedy')) {
				// haaack
				this.body().consume(new GreedyReturn());
			} else {
				this.body().consume(new ImplicitReturn());
			};
		};
		var code = this.scope().c({indent: true,braces: true});
		
		// same for Func -- should generalize
		var name = typeof this._name == 'string' ? (this._name) : (this._name.c());
		name = name.replace(/\./g,'_');
		
		// var name = self.name.c.replace(/\./g,'_') # WHAT?
		var foot = [];
		
		var left = "";
		var func = ("(" + (this.params().c()) + ")") + code; // .wrap
		var target = this.target();
		var decl = !this.option('global') && !this.option('export');
		
		if (target instanceof ScopeContext) {
			// the target is a scope context
			target = null;
		};
		
		var ctx = this.context();
		var out = "";
		// if ctx 
		
		
		
		var fname = sym__(this.name());
		// console.log "symbolize {self.name} -- {fname}"
		var fdecl = fname; // decl ? fname : ''
		
		if ((ctx instanceof ClassScope) && !target) {
			if (this.type() == 'constructor') {
				out = ("function " + fname + func);
			} else if (this.option('static')) {
				out = ("" + (ctx.context().c()) + "." + fname + " = function " + func);
			} else {
				out = ("" + (ctx.context().c()) + ".prototype." + fname + " = function " + func);
			};
		} else if ((ctx instanceof FileScope) && !target) {
			// register method as a root-function, but with auto-call? hmm
			// should probably set using variable directly instead, no?
			out = ("function " + fdecl + func);
		} else if (target && this.option('static')) {
			out = ("" + (target.c()) + "." + fname + " = function " + func);
		} else if (target) {
			out = ("" + (target.c()) + ".prototype." + fname + " = function " + func);
		} else {
			out = ("function " + fdecl + func);
		};
		
		if (this.option('global')) {
			out = ("" + fname + " = " + out);
		};
		
		if (this.option('export')) {
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
	function PropertyDeclaration(name,options,token){
		this._token = token;
		this._traversed = false;
		this._name = name;
		this._options = options || new Obj(new AssignList());
	};
	
	subclass$(PropertyDeclaration,Node);
	exports.PropertyDeclaration = PropertyDeclaration; // export class 
	
	PropertyDeclaration.prototype.__name = {name: 'name'};
	PropertyDeclaration.prototype.name = function(v){ return this._name; }
	PropertyDeclaration.prototype.setName = function(v){ this._name = v; return this; };
	
	PropertyDeclaration.prototype.__options = {name: 'options'};
	PropertyDeclaration.prototype.options = function(v){ return this._options; }
	PropertyDeclaration.prototype.setOptions = function(v){ this._options = v; return this; };
	
	
	
	PropertyDeclaration.prototype.visit = function (){
		this._options.traverse();
		return this;
	};
	
	// This will soon support bindings / listeners etc, much more
	// advanced generated code based on options passed in.
	PropertyDeclaration.prototype.c = function (){
		var o = this.options();
		var ast = "";
		var key = this.name().c();
		var gets = ("@" + key);
		var sets = ("@" + key + " = v");
		var scope = STACK.scope();
		
		var deflt = this.options().key('default');
		var init = deflt ? (("self:prototype.@" + key + " = " + (deflt.value().c()))) : ("");
		
		// var pars =
		// 	watch: o.key(:watch)
		// 	delegate: o.key(:delegate)
		
		var pars = o.hash();
		
		var isAttr = (this._token && String(this._token) == 'attr') || o.key('attr');
		
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
		
		o.add('name',new Symbol(key));
		
		if (pars.watch) {
			// p "watch is a property {pars:watch}"
			if (!((pars.watch instanceof Bool) && !(pars.watch.truthy()))) { tpl = propWatchTemplate };
			var wfn = ("" + key + "DidSet");
			
			if (pars.watch instanceof Symbol) {
				wfn = pars.watch;
			} else if (pars.watch instanceof Bool) {
				o.key('watch').setValue(new Symbol(("" + key + "DidSet")));
			};
			
			// should check for the function first, no?
			// HACK
			// o.key(:watch).value = Symbol
			var fn = OP('.',new This(),wfn);
			js.ondirty = OP('&&',fn,CALL(fn,['v','a',("this.__" + key)])).c(); // CALLSELF(wfn,[]).c
			// js:ondirty = "if(this.{wfn}) this.{wfn}(v,a,this.__{key});"
		};
		
		if (pars.observe) {
			if (pars.observe instanceof Bool) {
				o.key('observe').setValue(new Symbol(("" + key + "DidEmit")));
			};
			
			tpl = propWatchTemplate;
			js.ondirty = ("Imba.observeProperty(this,'" + key + "'," + (o.key('observe').value().c()) + ",v,a);") + (js.ondirty || '');
			// OP('&&',fn,CALL(fn,['v','a',"this.__{key}"])).c
		};
		
		if ((this._token && String(this._token) == 'attr') || o.key('dom') || o.key('attr')) {
			// need to make sure o has a key for attr then - so that the delegate can know?
			js.set = ("this.setAttribute('" + key + "',v)");
			js.get = ("this.getAttribute('" + key + "')");
		} else if (o.key('delegate')) {
			// if we have a delegate
			js.set = ("this.__" + key + ".delegate.set(this,'" + key + "',v,this.__" + key + ")");
			js.get = ("this.__" + key + ".delegate.get(this,'" + key + "',this.__" + key + ")");
		};
		
		
		
		if (deflt) {
			// add better default-support here - go through class-method setAttribute instead
			if (o.key('dom')) {
				js.init = ("" + (js.scope) + ".dom().setAttribute('" + key + "'," + (deflt.value().c()) + ");");
			} else {
				js.init = ("" + (js.scope) + ".prototype._" + key + " = " + (deflt.value().c()) + ";");
			};
		};
		
		if (o.key('chainable')) {
			js.get = ("v !== undefined ? (this." + (js.setter) + "(v),this) : " + (js.get));
		};
		
		js.options = o.c();
		
		var reg = /\$\{(\w+)\}/gm;
		// var tpl = o.key(:watch) ? propWatchTemplate : propTemplate
		var out = tpl.replace(reg,function(m,a) {
			return js[a];
		});
		// run another time for nesting. hacky
		out = out.replace(reg,function(m,a) {
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
		this._traversed = false;
		this._expression = true;
		this._cache = null;
		this._raw = null;
		this._value = v;
	};
	
	subclass$(Literal,ValueNode);
	exports.Literal = Literal; // export class 
	
	
	Literal.prototype.toString = function (){
		return "" + this.value();
	};
	
	Literal.prototype.hasSideEffects = function (){
		return false;
	};
	
	
	
	/* @class Bool */
	function Bool(v){
		this._value = v;
		this._raw = String(v) == "true" ? (true) : (false);
	};
	
	subclass$(Bool,Literal);
	exports.Bool = Bool; // export class 
	
	
	Bool.prototype.cache = function (){
		return this;
	};
	
	Bool.prototype.truthy = function (){
		// p "bool is truthy? {value}"
		return String(this.value()) == "true";
		// yes
	};
	
	Bool.prototype.js = function (o){
		return String(this._value);
	};
	
	Bool.prototype.c = function (){
		STACK._counter += 1;
		// undefined should not be a bool
		return String(this._value);
		// @raw ? "true" : "false"
	};
	
	
	/* @class Undefined */
	function Undefined(){ Literal.apply(this,arguments) };
	
	subclass$(Undefined,Literal);
	exports.Undefined = Undefined; // export class 
	Undefined.prototype.c = function (){
		return "undefined";
	};
	
	
	/* @class Nil */
	function Nil(){ Literal.apply(this,arguments) };
	
	subclass$(Nil,Literal);
	exports.Nil = Nil; // export class 
	Nil.prototype.c = function (){
		return "null";
	};
	
	
	/* @class True */
	function True(){ Bool.apply(this,arguments) };
	
	subclass$(True,Bool);
	exports.True = True; // export class 
	True.prototype.raw = function (){
		return true;
	};
	
	True.prototype.c = function (){
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
		this._traversed = false;
		this._value = v;
	};
	
	subclass$(Num,Literal);
	exports.Num = Num; // export class 
	
	
	Num.prototype.toString = function (){
		return String(this._value);
	};
	
	Num.prototype.shouldParenthesize = function (){
		var par = this.up();
		return (par instanceof Access) && par.left() == this;
	};
	
	Num.prototype.js = function (o){
		var num = String(this._value);
		// console.log "compiled num to {num}"
		return num;
	};
	
	Num.prototype.c = function (o){
		if (this._cache) { return Num.__super__.c.call(this,o) };
		var js = String(this._value);
		var par = STACK.current();
		var paren = (par instanceof Access) && par.left() == this;
		// only if this is the right part of teh acces
		// console.log "should paren?? {shouldParenthesize}"
		return paren ? ("(" + js + ")") : (js);
		// @cache ? super(o) : String(@value)
	};
	
	// def cache
	// 	p "cache num"
	// 	self
	
	Num.prototype.raw = function (){
		// really?
		return JSON.parse(String(this.value()));
	};
	
	
	// should be quoted no?
	// what about strings in object-literals?
	// we want to be able to see if the values are allowed
	/* @class Str */
	function Str(v){
		this._traversed = false;
		this._expression = true;
		this._cache = null;
		this._value = v;
		// should grab the actual value immediately?
	};
	
	subclass$(Str,Literal);
	exports.Str = Str; // export class 
	
	
	Str.prototype.raw = function (){
		// JSON.parse requires double-quoted strings,
		// while eval also allows single quotes. 
		// NEXT eval is not accessible like this
		// WARNING TODO be careful! - should clean up
		
		return this._raw || (this._raw = String(this.value()).slice(1,-1)); // incredibly stupid solution
	};
	
	Str.prototype.isValidIdentifier = function (){
		// there are also some values we cannot use
		return this.raw().match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/) ? (true) : (false);
	};
	
	Str.prototype.js = function (o){
		return String(this._value);
	};
	
	Str.prototype.c = function (o){
		return this._cache ? (Str.__super__.c.call(this,o)) : (String(this._value));
	};
	
	
	// Currently not used - it would be better to use this
	// for real interpolated strings though, than to break
	// them up into their parts before parsing
	/* @class InterpolatedString */
	function InterpolatedString(){ ListNode.apply(this,arguments) };
	
	subclass$(InterpolatedString,ListNode);
	exports.InterpolatedString = InterpolatedString; // export class 
	InterpolatedString.prototype.js = function (o){
		return "interpolated string";
	};
	
	
	
	/* @class Tuple */
	function Tuple(){ ListNode.apply(this,arguments) };
	
	subclass$(Tuple,ListNode);
	exports.Tuple = Tuple; // export class 
	Tuple.prototype.c = function (){
		// compiles as an array
		return new Arr(this.nodes()).c();
	};
	
	Tuple.prototype.hasSplat = function (){
		return this.filter(function(v) {
			return v instanceof Splat;
		})[0];
	};
	
	Tuple.prototype.consume = function (node){
		if (this.count() == 1) {
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
		return this.raw().match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/) ? (true) : (false);
	};
	
	Symbol.prototype.raw = function (){
		return this._raw || (this._raw = sym__(this.value()));
	};
	
	Symbol.prototype.js = function (o){
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
		return value instanceof Array ? (new ArgList(value)) : (value);
	};
	
	Arr.prototype.push = function (item){
		this.value().push(item);
		return this;
	};
	
	Arr.prototype.count = function (){
		return this.value().length;
	};
	
	Arr.prototype.nodes = function (){
		var val = this.value();
		return val instanceof Array ? (val) : (val.nodes());
	};
	
	Arr.prototype.splat = function (){
		return this.value().some(function(v) {
			return v instanceof Splat;
		});
	};
	
	Arr.prototype.visit = function (){
		if (this._value && this._value.traverse) { this._value.traverse() };
		return this;
	};
	
	Arr.prototype.js = function (o){
		
		var val = this._value;
		if (!val) { return "[]" };
		
		var splat = this.splat();
		var nodes = val instanceof Array ? (val) : (val.nodes());
		// p "value of array isa {@value}"
		
		// for v in @value
		// 	break splat = yes if v isa Splat
		// var splat = value.some(|v| v isa Splat)
		
		if (splat) {
			// "SPLATTED ARRAY!"
			// if we know for certain that the splats are arrays we can drop the slice?
			// p "array is splat?!?"
			var slices = [];
			var group = null;
			
			for (var i=0, ary=iter$(nodes), len=ary.length, v; i < len; i++) {
				v = ary[i];if (v instanceof Splat) {
					slices.push(v);
					group = null;
				} else {
					if (!group) { slices.push(group = new Arr([])) };
					group.push(v);
				};
			};
			
			return "[].concat(" + (cary__(slices).join(", ")) + ")";
		} else {
			// very temporary. need a more generic way to prettify code
			// should depend on the length of the inner items etc
			// if @indented or option(:indent) or value.@indented
			//	"[\n{value.c.join(",\n").indent}\n]"
			var out = val instanceof Array ? (cary__(val)) : (val.c());
			return "[" + out + "]";
		};
	};
	
	Arr.prototype.hasSideEffects = function (){
		return this.value().some(function(v) {
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
		return value instanceof Array ? (new AssignList(value)) : (value);
	};
	
	Obj.prototype.visit = function (){
		if (this._value) { this._value.traverse() };
		// for v in value
		// 	v.traverse
		return this;
	};
	
	Obj.prototype.js = function (o){
		var dyn = this.value().filter(function(v) {
			return (v instanceof ObjAttr) && (v.key() instanceof Op);
		});
		
		if (dyn.length > 0) {
			var idx = this.value().indexOf(dyn[0]);
			// p "dynamic keys! {dyn}"
			// create a temp variable
			
			var tmp = this.scope__().temporary(this);
			// set the temporary object to the same
			var first = this.value().slice(0,idx);
			var obj = new Obj(first);
			var ast = [OP('=',tmp,obj)];
			
			this.value().slice(idx).forEach(function(atr) {
				return ast.push(OP('=',OP('.',tmp,atr.key()),atr.value()));
			});
			ast.push(tmp); // access the tmp at in the last part
			return new Parens(ast).c();
		};
		
		// for objects with expression-keys we need to think differently
		return '{' + this.value().c() + '}';
	};
	
	Obj.prototype.add = function (k,v){
		if ((typeof k=='string'||k instanceof String)) { k = new Identifier(k) };
		var kv = new ObjAttr(k,v);
		this.value().push(kv);
		return kv;
	};
	
	Obj.prototype.hash = function (){
		var hash = {};
		for (var i=0, ary=iter$(this.value()), len=ary.length, k; i < len; i++) {
			k = ary[i];if (k instanceof ObjAttr) { hash[k.key().symbol()] = k.value() };
		};
		return hash;
		// return k if k.key.symbol == key
	};
	
	// add method for finding properties etc?
	Obj.prototype.key = function (key){
		for (var i=0, ary=iter$(this.value()), len=ary.length, k; i < len; i++) {
			k = ary[i];if ((k instanceof ObjAttr) && k.key().symbol() == key) { return k };
		};
		return null;
	};
	
	Obj.prototype.indented = function (a,b){
		this._value.indented(a,b);
		return this;
	};
	
	Obj.prototype.hasSideEffects = function (){
		return this.value().some(function(v) {
			return v.hasSideEffects();
		});
	};
	
	// for converting a real object into an ast-representation
	Obj.wrap = function (obj){
		var attrs = [];
		for (var v, i=0, keys=Object.keys(obj), l=keys.length; i < l; i++){
			v = obj[keys[i]];if (v instanceof Array) {
				v = Arr.wrap(v);
			} else if (v.constructor == Object) {
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
		this._traversed = false;
		this._key = key;
		this._value = value;
		this._dynamic = (key instanceof Op);
		this;
	};
	
	subclass$(ObjAttr,Node);
	exports.ObjAttr = ObjAttr; // export class 
	
	ObjAttr.prototype.__key = {name: 'key'};
	ObjAttr.prototype.key = function(v){ return this._key; }
	ObjAttr.prototype.setKey = function(v){ this._key = v; return this; };
	
	ObjAttr.prototype.__value = {name: 'value'};
	ObjAttr.prototype.value = function(v){ return this._value; }
	ObjAttr.prototype.setValue = function(v){ this._value = v; return this; };
	
	ObjAttr.prototype.__options = {name: 'options'};
	ObjAttr.prototype.options = function(v){ return this._options; }
	ObjAttr.prototype.setOptions = function(v){ this._options = v; return this; };
	
	
	
	ObjAttr.prototype.visit = function (){
		// should probably traverse key as well, unless it is a dead simple identifier
		this.key().traverse();
		return this.value().traverse();
	};
	
	ObjAttr.prototype.js = function (o){
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
	
	Self.prototype.__scope = {name: 'scope'};
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
		return s ? (s.context().c()) : ("this");
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
		// p "referencing this"
		return this;
	};
	
	This.prototype.c = function (){
		return "this";
	};
	
	
	
	
	
	// OPERATORS
	
	/* @class Op */
	function Op(o,l,r){
		// set expression yes, no?
		this._expression = false;
		this._traversed = false;
		this._parens = false;
		this._cache = null;
		this._invert = false;
		this._op = o && o._value || o;
		this._left = l;
		this._right = r;
		return this;
	};
	
	subclass$(Op,Node);
	exports.Op = Op; // export class 
	
	Op.prototype.__op = {name: 'op'};
	Op.prototype.op = function(v){ return this._op; }
	Op.prototype.setOp = function(v){ this._op = v; return this; };
	
	Op.prototype.__left = {name: 'left'};
	Op.prototype.left = function(v){ return this._left; }
	Op.prototype.setLeft = function(v){ this._left = v; return this; };
	
	Op.prototype.__right = {name: 'right'};
	Op.prototype.right = function(v){ return this._right; }
	Op.prototype.setRight = function(v){ this._right = v; return this; };
	
	
	
	Op.prototype.visit = function (){
		if (this._right) { this._right.traverse() };
		if (this._left) { this._left.traverse() };
		return this;
	};
	
	Op.prototype.isExpressable = function (){
		// what if right is a string?!?
		return !this.right() || this.right().isExpressable();
	};
	
	Op.prototype.js = function (o){
		var out = null;
		var op = this._op;
		
		var l = this._left;
		var r = this._right;
		
		if (l instanceof Node) { l = l.c() };
		if (r instanceof Node) { r = r.c() };
		
		if (l && r) {
			out = ("" + l + " " + op + " " + r);
		} else if (l) {
			out = ("" + op + l);
		};
		// out = out.parenthesize if up isa Op # really?
		return out;
	};
	
	Op.prototype.shouldParenthesize = function (){
		return this._parens;
		// option(:parens)
	};
	
	Op.prototype.precedence = function (){
		return 10;
	};
	
	Op.prototype.consume = function (node){
		// p "Op.consume {node}".cyan
		if (this.isExpressable()) { return Op.__super__.consume.apply(this,arguments) };
		
		// TODO can rather use global caching?
		var tmpvar = this.scope__().declare('tmp',null,{system: true});
		var clone = OP(this.op(),this.left(),null);
		var ast = this.right().consume(clone);
		if (node) { ast.consume(node) };
		return ast;
	};
	
	
	/* @class ComparisonOp */
	function ComparisonOp(){ Op.apply(this,arguments) };
	
	subclass$(ComparisonOp,Op);
	exports.ComparisonOp = ComparisonOp; // export class 
	ComparisonOp.prototype.invert = function (){
		// are there other comparison ops?
		// what about a chain?
		var op = this._op;
		var pairs = ["==","!=","===","!==",">","<=","<",">="];
		var idx = pairs.indexOf(op);
		idx += (idx % 2 ? (-1) : (1));
		
		// p "invert {@op}"
		// p "inverted comparison(!) {idx} {op} -> {pairs[idx]}"
		this.setOp(pairs[idx]);
		this._invert = !(this._invert);
		return this;
	};
	
	ComparisonOp.prototype.c = function (){
		if (this.left() instanceof ComparisonOp) {
			this.left().right().cache();
			return OP('&&',this.left(),OP(this.op(),this.left().right(),this.right())).c();
		} else {
			return ComparisonOp.__super__.c.apply(this,arguments);
		};
	};
	
	ComparisonOp.prototype.js = function (o){
		var op = this._op;
		var l = this._left;
		var r = this._right;
		
		if (l instanceof Node) { l = l.c() };
		if (r instanceof Node) { r = r.c() };
		return ("" + l + " " + op + " " + r);
	};
	
	
	
	/* @class MathOp */
	function MathOp(){ Op.apply(this,arguments) };
	
	subclass$(MathOp,Op);
	exports.MathOp = MathOp; // export class 
	MathOp.prototype.c = function (){
		if (this.op() == '∪') {
			return this.util().union(this.left(),this.right()).c();
		} else if (this.op() == '∩') {
			return this.util().intersect(this.left(),this.right()).c();
		};
	};
	
	
	
	/* @class UnaryOp */
	function UnaryOp(){ Op.apply(this,arguments) };
	
	subclass$(UnaryOp,Op);
	exports.UnaryOp = UnaryOp; // export class 
	UnaryOp.prototype.invert = function (){
		if (this.op() == '!') {
			return this.left();
		} else {
			return UnaryOp.__super__.invert.apply(this,arguments); // regular invert
		};
	};
	
	UnaryOp.prototype.js = function (o){
		var l = this._left;
		var r = this._right;
		// all of this could really be done i a much
		// cleaner way.
		// l.set(parens: yes) if l # are we really sure about this?
		// r.set(parens: yes) if r
		
		if (this.op() == '!') {
			l._parens = true;
			// l.set(parens: yes) # sure?
			return "" + this.op() + (l.c());
		} else if (this.op() == '√') {
			return "Math.sqrt(" + (l.c()) + ")";
		} else if (this.left()) {
			return "" + (l.c()) + this.op();
		} else {
			return "" + this.op() + (r.c());
		};
	};
	
	UnaryOp.prototype.normalize = function (){
		if (this.op() == '!' || this.op() == '√') { return this };
		var node = (this.left() || this.right()).node();
		// for property-accessors we need to rewrite the ast
		if (!((node instanceof PropertyAccess))) { return this };
		
		// ask to cache the path
		if ((node instanceof Access) && node.left()) { node.left().cache() };
		
		var num = new Num(1);
		var ast = OP('=',node,OP(this.op()[0],node,num));
		if (this.left()) { ast = OP(this.op()[0] == '-' ? ('+') : ('-'),ast,num) };
		
		return ast;
	};
	
	UnaryOp.prototype.consume = function (node){
		var norm = this.normalize();
		return norm == this ? (UnaryOp.__super__.consume.apply(this,arguments)) : (norm.consume(node));
	};
	
	UnaryOp.prototype.c = function (){
		var norm = this.normalize();
		return norm == this ? (UnaryOp.__super__.c.apply(this,arguments)) : (norm.c());
	};
	
	
	/* @class InstanceOf */
	function InstanceOf(){ Op.apply(this,arguments) };
	
	subclass$(InstanceOf,Op);
	exports.InstanceOf = InstanceOf; // export class 
	InstanceOf.prototype.js = function (o){
		// fix checks for String and Number
		// p right.inspect
		
		if (this.right() instanceof Const) {
			// WARN otherwise - what do we do? does not work with dynamic
			// classes etc? Should probably send to utility function isa$
			var name = c__(this.right().value());
			var obj = this.left().node();
			// TODO also check for primitive-constructor
			if (idx$(name,['String','Number','Boolean']) >= 0) {
				if (!((obj instanceof LocalVarAccess))) {
					obj.cache();
				};
				// need a double check for these (cache left) - possibly
				return ("(typeof " + (obj.c()) + "=='" + (name.toLowerCase()) + "'||" + (obj.c()) + " instanceof " + name + ")");
				
				// convert
			};
		};
		var out = ("" + (this.left().c()) + " " + this.op() + " " + (this.right().c()));
		
		// should this not happen in #c?
		if (o.parent() instanceof Op) { out = helpers.parenthesize(out) };
		return out;
	};
	
	
	/* @class TypeOf */
	function TypeOf(){ Op.apply(this,arguments) };
	
	subclass$(TypeOf,Op);
	exports.TypeOf = TypeOf; // export class 
	TypeOf.prototype.js = function (o){
		return "typeof " + (this.left().c());
	};
	
	
	/* @class Delete */
	function Delete(){ Op.apply(this,arguments) };
	
	subclass$(Delete,Op);
	exports.Delete = Delete; // export class 
	Delete.prototype.js = function (o){
		// TODO this will execute calls several times if the path is not directly to an object
		// need to cache the receiver
		var l = this.left();
		var tmp = this.scope__().temporary(this,{pool: 'val'});
		var o = OP('=',tmp,l);
		// FIXME
		return ("(" + (o.c()) + ",delete " + (l.c()) + ", " + (tmp.c()) + ")"); // oh well
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
	
	In.prototype.js = function (o){
		var cond = this._invert ? ("== -1") : (">= 0");
		var idx = Util.indexOf(this.left(),this.right());
		return "" + (idx.c()) + " " + cond;
	};
	
	
	
	
	
	
	
	
	// ACCESS
	
	module.exports.K_IVAR = K_IVAR = 1;
	module.exports.K_SYM = K_SYM = 2;
	module.exports.K_STR = K_STR = 3;
	module.exports.K_PROP = K_PROP = 4;
	
	/* @class Access */
	function Access(o,l,r){
		// set expression yes, no?
		this._expression = false;
		this._traversed = false;
		this._parens = false;
		this._cache = null;
		this._invert = false;
		this._op = o && o._value || o;
		this._left = l;
		this._right = r;
		return this;
	};
	
	subclass$(Access,Op);
	exports.Access = Access; // export class 
	
	
	Access.prototype.clone = function (left,right){
		var ctor = this.constructor;
		return new ctor(this.op(),left,right);
	};
	
	Access.prototype.js = function (o){
		var r;
		var raw = null;
		var rgt = this.right();
		var ctx = (this.left() || this.scope__().context());
		var pre = "";
		
		if (this.safechain()) {
			this.p(("Access is safechained " + (rgt.c())));
		};
		
		if (rgt instanceof Num) {
			return ctx.c() + "[" + rgt.c() + "]";
		};
		
		// is this right? Should not the index compile the brackets
		// or value is a symbol -- should be the same, no?
		if ((rgt instanceof Index) && ((rgt.value() instanceof Str) || (rgt.value() instanceof Symbol))) {
			rgt = rgt.value();
		};
		
		// TODO do the identifier-validation in a central place instead
		if ((rgt instanceof Str) && rgt.isValidIdentifier()) {
			raw = rgt.raw();
		} else if ((rgt instanceof Symbol) && rgt.isValidIdentifier()) {
			raw = rgt.raw();
		} else if ((rgt instanceof Identifier) && rgt.isValidIdentifier()) {
			raw = rgt.c();
		};
		
		if (this.safechain() && ctx) {
			ctx.cache({force: true});
			pre = ctx.c() + " && ";
		};
		
		// really?
		// var ctx = (left || scope__.context)
		var out = ctx instanceof RootScopeContext ? (
			// this is a hacky workaround
			(raw ? (raw) : (("global[" + (rgt.c()) + "]")))
		) : (raw ? (
			// see if it needs quoting
			// need to check to see if it is legal
			ctx ? (("" + (ctx.c()) + "." + raw)) : (raw)
		) : (
			r = rgt instanceof Node ? (rgt.c({expression: true})) : (rgt),
			("" + (ctx.c()) + "[" + r + "]")
		));
		
		// if safechain and ctx
		// 	out = "{ctx.c} && {out}"
		
		return pre + out;
	};
	
	Access.prototype.visit = function (){
		if (this.left()) { this.left().traverse() };
		if (this.right()) { this.right().traverse() };
		return;
	};
	
	Access.prototype.isExpressable = function (){
		return true;
	};
	
	Access.prototype.alias = function (){
		return this.right() instanceof Identifier ? (this.right().alias()) : (Access.__super__.alias.call(this));
	};
	
	Access.prototype.safechain = function (){
		// right.safechain
		return String(this._op) == '?.' || String(this._op) == '?:';
	};
	
	Access.prototype.cache = function (o){
		return ((this.right() instanceof Ivar) && !this.left()) ? (this) : (Access.__super__.cache.call(this,o));
	};
	
	
	
	
	// Should change this to just refer directly to the variable? Or VarReference
	/* @class LocalVarAccess */
	function LocalVarAccess(){ Access.apply(this,arguments) };
	
	subclass$(LocalVarAccess,Access);
	exports.LocalVarAccess = LocalVarAccess; // export class 
	
	LocalVarAccess.prototype.__safechain = {name: 'safechain'};
	LocalVarAccess.prototype.safechain = function(v){ return this._safechain; }
	LocalVarAccess.prototype.setSafechain = function(v){ this._safechain = v; return this; };
	
	LocalVarAccess.prototype.js = function (o){
		if ((this.right() instanceof Variable) && this.right().type() == 'meth') {
			if (!((this.up() instanceof Call))) { return ("" + (this.right().c()) + "()") };
		};
		
		return this.right().c();
	};
	
	LocalVarAccess.prototype.variable = function (){
		return this.right();
	};
	
	LocalVarAccess.prototype.cache = function (o){
		if(o === undefined) o = {};
		if (o.force) { LocalVarAccess.__super__.cache.call(this,o) };
		return this;
	};
	
	LocalVarAccess.prototype.alias = function (){
		var $1;
		return this.variable()._alias || LocalVarAccess.__super__.alias.call(this);
	};
	
	
	
	/* @class GlobalVarAccess */
	function GlobalVarAccess(){ ValueNode.apply(this,arguments) };
	
	subclass$(GlobalVarAccess,ValueNode);
	exports.GlobalVarAccess = GlobalVarAccess; // export class 
	GlobalVarAccess.prototype.js = function (o){
		return this.value().c();
	};
	
	
	
	/* @class ObjectAccess */
	function ObjectAccess(){ Access.apply(this,arguments) };
	
	subclass$(ObjectAccess,Access);
	exports.ObjectAccess = ObjectAccess; // export class 
	
	
	
	/* @class PropertyAccess */
	function PropertyAccess(o,l,r){
		this._traversed = false;
		this._invert = false;
		this._parens = false;
		this._expression = false; // yes?
		this._cache = null;
		this._op = o;
		this._left = l;
		this._right = r;
		return this;
	};
	
	subclass$(PropertyAccess,Access);
	exports.PropertyAccess = PropertyAccess; // export class 
	
	
	PropertyAccess.prototype.visit = function (){
		if (this._right) { this._right.traverse() };
		if (this._left) { this._left.traverse() };
		return this;
	};
	
	// right in c we should possibly override
	// to create a call and regular access instead
	
	PropertyAccess.prototype.js = function (o){
		
		var rec, $1;
		if (rec = this.receiver()) {
			// p "converting to call"
			var ast = CALL(OP('.',this.left(),this.right()),[]); // convert to ArgList or null
			ast.setReceiver(rec);
			return ast.c();
		};
		
		var up = this.up();
		
		if (!((up instanceof Call))) {
			// p "convert to call instead"
			ast = CALL(new Access(this.op(),this.left(),this.right()),[]);
			return ast.c();
		};
		
		// really need to fix this - for sure
		// should be possible for the function to remove this this instead?
		var js = ("" + (PropertyAccess.__super__.js.call(this,o)));
		
		if (!((up instanceof Call) || (up instanceof Util.IsFunction))) {
			// p "Called"
			js += "()";
		};
		
		return js;
	};
	
	
	PropertyAccess.prototype.receiver = function (){
		if ((this.left() instanceof SuperAccess) || (this.left() instanceof Super)) {
			return SELF;
		} else {
			return null;
		};
	};
	
	
	
	/* @class IvarAccess */
	function IvarAccess(){ Access.apply(this,arguments) };
	
	subclass$(IvarAccess,Access);
	exports.IvarAccess = IvarAccess; // export class 
	IvarAccess.prototype.cache = function (){
		// WARN hmm, this is not right... when accessing on another object it will need to be cached
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
		if (o.force) { return IndexAccess.__super__.cache.apply(this,arguments) };
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
		
		if (!((up instanceof Access))) {
			out += ("." + (m.supername().c()));
			if (!((up instanceof Call))) { // autocall?
				out += (".apply(" + (m.scope().context().c()) + ",arguments)");
			};
		};
		
		return out;
	};
	
	SuperAccess.prototype.receiver = function (){
		return SELF;
	};
	
	
	
	/* @class VarOrAccess */
	function VarOrAccess(value){
		// should rather call up to valuenode?
		this._traversed = false;
		this._parens = false;
		this._value = value;
		this._identifier = value;
		this._token = value._value;
		this._variable = null;
		this;
	};
	
	subclass$(VarOrAccess,ValueNode);
	exports.VarOrAccess = VarOrAccess; // export class 
	
	
	// Shortcircuit traverse so that it is not added to the stack?!
	VarOrAccess.prototype.visit = function (){
		// @identifier = value # this is not a real identifier?
		// console.log "VarOrAccess {@identifier}"
		// p "visit {self}"
		
		
		var scope = this.scope__();
		
		// p "look for variable named {value} in {scope}"
		
		var variable = scope.lookup(this.value());
		
		// does not really need to have a declarator already? -- tricky
		if (variable && variable.declarator()) {
			// var decl = variable.declarator
			
			// if the variable is not initialized just yet and we are
			// in the same scope - we should not treat this as a var-lookup
			// ie.  var x = x would resolve to var x = this.x() if x
			// was not previously defined
			
			if (variable._initialized || scope != variable.scope()) {
				this._variable = variable;
				variable.addReference(this);
				this._value = variable; // variable.accessor(self)
				this._token._variable = variable;
				return this;
			};
			
			// p "var is not yet initialized!"
			// p "declarator for var {decl.@declared}"
			// FIX
			// @value.safechain = safechain
		};
		
		// TODO deprecate and remove
		if (this.value().symbol().indexOf('$') >= 0) {
			// big hack - should disable
			// major hack here, no?
			console.log("GlobalVarAccess");
			
			this._value = new GlobalVarAccess(this.value());
			return this;
		};
		
		// really? what about just mimicking the two diffrent instead?
		// Should we not return a call directly instead?
		this._value = new PropertyAccess(".",scope.context(),this.value());
		// mark the scope / context -- so we can show correct implicit
		this._token._meta = {type: 'ACCESS'};
		// @value.traverse # nah
		return this;
	};
	
	VarOrAccess.prototype.c = function (){
		return this._variable ? (VarOrAccess.__super__.c.call(this)) : (this.value().c());
	};
	
	VarOrAccess.prototype.js = function (o){
		
		var v;
		if (v = this._variable) {
			var out = v.c();
			if (v._type == 'meth' && !(o.up() instanceof Call)) { out += "()" };
			return out;
		};
		return "NONO";
	};
	
	VarOrAccess.prototype.node = function (){
		return this._variable ? (this) : (this.value());
	};
	
	VarOrAccess.prototype.symbol = function (){
		return this._identifier.symbol();
		// value and value.symbol
	};
	
	VarOrAccess.prototype.cache = function (o){
		if(o === undefined) o = {};
		return this._variable ? ((o.force && VarOrAccess.__super__.cache.call(this,o))) : (this.value().cache(o));
		// should we really cache this?
		// value.cache(o)
	};
	
	VarOrAccess.prototype.decache = function (){
		this._variable ? (VarOrAccess.__super__.decache.call(this)) : (this.value().decache());
		return this;
	};
	
	VarOrAccess.prototype.dom = function (){
		return this.value().dom();
	};
	
	VarOrAccess.prototype.safechain = function (){
		return this._identifier.safechain();
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
	
	
	//	def js
	//		if right isa Variable and right.type == 'meth'
	//			return "{right.c}()" unless up isa Call
	//
	//		right.c
	//
	//	def variable
	//		right
	//
	//	def cache o = {}
	//		super if o:force
	//		self
	//
	//	def alias
	//		variable.@alias or super # if resolved?
	//
	
	/* @class VarReference */
	function VarReference(value,type){
		
		// for now - this can happen
		// if value isa Arr
		
		var $1;
		VarReference.__super__.constructor.call(this,value);
		this._export = false;
		this._type = type && String(type);
		this._variable = null;
		this._declared = true; // just testing now
	};
	
	subclass$(VarReference,ValueNode);
	exports.VarReference = VarReference; // export class 
	
	VarReference.prototype.__variable = {name: 'variable'};
	VarReference.prototype.variable = function(v){ return this._variable; }
	VarReference.prototype.setVariable = function(v){ this._variable = v; return this; };
	
	VarReference.prototype.__declared = {name: 'declared'};
	VarReference.prototype.declared = function(v){ return this._declared; }
	VarReference.prototype.setDeclared = function(v){ this._declared = v; return this; };
	
	VarReference.prototype.__type = {name: 'type'};
	VarReference.prototype.type = function(v){ return this._type; }
	VarReference.prototype.setType = function(v){ this._type = v; return this; };
	
	
	
	
	VarReference.prototype.set = function (o){
		// hack - workaround for hidden classes perf
		if (o.export) { this._export = true };
		return this;
	};
	
	VarReference.prototype.js = function (o){
		// experimental fix
		
		// what about resolving?
		var ref = this._variable;
		var out = ref.c();
		
		// p "VarReference {out} - {o.up} {o.up == self}\n{o}"
		
		if (ref && !(ref._declared)) { // .option(:declared)
			if (o.up(VarBlock)) { // up varblock??
				ref._declared = true;
				
				// ref.set(declared: yes)
			} else if (o.isExpression() || this._export) { // why?
				// p "autodeclare"
				ref.autodeclare();
			} else {
				// 
				out = ("var " + out);
				ref._declared = true;
				// ref.set(declared: yes)
			};
		};
		
		// need to think the export through -- like registering somehow
		// should register in scope - export on analysis++
		if (this._export) {
			out = ("module.exports." + (ref.c()) + " = " + (ref.c()));
		};
		
		return out;
	};
	
	VarReference.prototype.declare = function (){
		return this;
	};
	
	VarReference.prototype.consume = function (node){
		// really? the consumed node dissappear?
		this._variable && this._variable.autodeclare();
		return this;
	};
	
	VarReference.prototype.visit = function (){
		// p "visit vardecl"
		// console.log "value type for VarReference {@value} {@value.@loc} {@value:constructor}"
		
		// should be possible to have a VarReference without a name as well? for a system-variable
		var name = this.value().c();
		
		// what about looking up? - on register we want to mark
		var v = this._variable || (this._variable = this.scope__().register(name,null,{type: this._type}));
		// FIXME -- should not simply override the declarator here(!)
		
		if (!(v.declarator())) {
			v.setDeclarator(this);
		};
		
		if (this._value) { v.addReference(this._value) }; // is this the first reference?
		
		// only needed when analyzing?
		this._value._value._variable = v;
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
	function Assign(o,l,r){
		
		// workaround until we complete transition from lua-style assignments
		// to always use explicit tuples - then we can move assignments out etc
		// this will not be needed after we remove support for var a,b,c = 1,2,3
		if ((l instanceof VarReference) && (l.value() instanceof Arr)) {
			// p "case with var!!"
			// converting all nodes to var-references ?
			// do we need to keep it in a varblock at all?
			var vars = l.value().nodes().map(function(v) {
				// what about inner tuples etc?
				// keep the splats -- clumsy but true
				if (v instanceof Splat) {
					// p "value is a splat!!"
					if (!((v.value() instanceof VarReference))) { (v.setValue(v_=new VarReference(v.value(),l.type())),v_) };
				} else if (v instanceof VarReference) {
					true;
				} else {
					v = new VarReference(v,l.type());
				};
				
				return v;
				
				// v isa VarReference ? v : VarReference.new(v)
			});
			return new TupleAssign(o,new Tuple(vars),r);
		};
		
		if (l instanceof Arr) {
			return new TupleAssign(o,new Tuple(l.nodes()),r);
			// p "left is array in assign - in init"
		};
		
		
		// set expression yes, no?
		this._expression = false;
		this._traversed = false;
		this._parens = false;
		this._cache = null;
		this._invert = false;
		this._op = o && o._value || o;
		this._left = l;
		this._right = r;
		return this;
	};
	
	subclass$(Assign,Op);
	exports.Assign = Assign; // export class 
	
	
	Assign.prototype.isExpressable = function (){
		return !this.right() || this.right().isExpressable();
	};
	
	Assign.prototype.isUsed = function (){
		// really?
		// if up is a block in general this should not be used -- since it should already have received implicit self?
		if (this.up() instanceof Block) { // && up.last != self
			return false;
		};
		return true;
	};
	
	// FIXME optimize
	Assign.prototype.visit = function (){
		var l = this._left;
		var r = this._right;
		
		if (l instanceof Arr) {
			this.p("assigning to array!!");
		};
		
		// WARNING - slightly undefined
		// MARK THE STACK
		if (l) { l.traverse() };
		
		var lvar = (l instanceof VarReference) && l.variable();
		
		// this should probably be done in a different manner
		if (lvar && lvar.declarator() == l) {
			// p "lvar is first declared in this assign"
			lvar._initialized = false;
			if (r) { r.traverse() };
			lvar._initialized = true;
		} else {
			if (r) { r.traverse() };
		};
		
		if ((l instanceof VarReference) || l._variable) {
			l._variable.assigned(r);
		};
		
		return this;
	};
	
	Assign.prototype.c = function (o){
		var $1;
		if (!(this.right().isExpressable())) {
			// p "Assign#c right is not expressable "
			return this.right().consume(this).c(o);
		};
		// testing this
		return Assign.__super__.c.call(this,o);
	};
	
	Assign.prototype.js = function (o){
		if (!(this.right().isExpressable())) {
			this.p("Assign#js right is not expressable ");
			// here this should be go out of the stack(!)
			// it should already be consumed?
			return this.right().consume(this).c();
		};
		
		// p "assign left {left:contrstru}"
		var l = this.left().node();
		var r = this.right();
		
		// We are setting self(!)
		// TODO document functionality
		if (l instanceof Self) {
			var ctx = this.scope__().context();
			l = ctx.reference();
		};
		
		
		if (l instanceof PropertyAccess) {
			var ast = CALL(OP('.',l.left(),l.right().setter()),[this.right()]);
			ast.setReceiver(l.receiver());
			
			if (this.isUsed()) {
				// p "Assign is used {stack}"
				// dont cache it again if it is already cached(!)
				if (!(this.right().cachevar())) { this.right().cache({pool: 'val',uses: 1}) }; // 
				// this is only when used.. should be more clever about it
				ast = new Parens(blk__([ast,this.right()]));
			};
			
			// should check the up-value no?
			return ast.c({expression: true});
		};
		
		// if l isa VarReference
		// 	p "assign var-ref"
		// 	l.@variable.assigned(r)
		
		// FIXME -- does not always need to be an expression?
		var out = ("" + (l.c()) + " " + this.op() + " " + (this.right().c({expression: true})));
		
		return out;
	};
	
	// FIXME op is a token? _FIX_
	Assign.prototype.shouldParenthesize = function (){
		return (this.up() instanceof Op) && this.up().op() != '=';
	};
	
	Assign.prototype.consume = function (node){
		if (this.isExpressable()) {
			this.forceExpression();
			return Assign.__super__.consume.call(this,node);
		};
		
		var ast = this.right().consume(this);
		return ast.consume(node);
	};
	
	// more workaround during transition away from a,b,c = 1,2,3 style assign
	Assign.prototype.addExpression = function (expr){
		var typ = ExpressionBlock;
		if (this._left && (this._left instanceof VarReference)) {
			typ = VarBlock;
		};
		// might be better to nest this up after parsing is done?
		// p "Assign.addExpression {self} <- {expr}"
		var node = new typ([this]);
		return node.addExpression(expr);
	};
	
	
	
	/* @class PushAssign */
	function PushAssign(){ Assign.apply(this,arguments) };
	
	subclass$(PushAssign,Assign);
	exports.PushAssign = PushAssign; // export class 
	PushAssign.prototype.js = function (o){
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
		
		if (l instanceof Access) {
			// p "conditional-assign {l} {l.left} {l.right}"
			if (l.left()) {
				// p "cache l.left {l.left:constructor}̋"
				l.left().cache();
			};
			ls = l.clone(l.left(),l.right()); // this should still be cached?
			if (l instanceof PropertyAccess) { l.cache() }; // correct now, to a certain degree
			if (l instanceof IndexAccess) {
				// p "cache the right side of indexAccess!!! {l.right}"
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
		if (expr && this.op() == '||=') {
			ast = OP('||',l,OP('=',ls,this.right()));
		} else if (expr && this.op() == '&&=') {
			ast = OP('&&',l,OP('=',ls,this.right()));
		} else {
			ast = IF(this.condition(),OP('=',ls,this.right()),l); // do we need a scope for these?
			ast.setScope(null);
			// drop the scope
			// touch scope -- should probably visit the whole thing?
			// ast.scope.visit
		};
		if (ast.isExpressable()) { ast.toExpression() };
		return ast;
	};
	
	
	ConditionalAssign.prototype.c = function (){
		// WARN what if we return the same?
		return this.normalize().c();
	};
	
	ConditionalAssign.prototype.condition = function (){
		
		// use switch instead to cache op access
		if (this.op() == '?=') {
			return OP('==',this.left(),NULL);
		} else if (this.op() == '||=') {
			return OP('!',this.left());
		} else if (this.op() == '&&=') {
			return this.left();
		} else if (this.op() == '!?=') {
			return OP('!=',this.left(),NULL);
		} else {
			return this.left();
		};
	};
	
	ConditionalAssign.prototype.js = function (o){
		// p "ConditionalAssign.js".red
		var ast = IF(this.condition(),OP('=',this.left(),this.right()),this.left());
		ast.setScope(null); // not sure about this
		if (ast.isExpressable()) { ast.toExpression() }; // forced expression already
		return ast.c();
	};
	
	
	/* @class CompoundAssign */
	function CompoundAssign(){ Assign.apply(this,arguments) };
	
	subclass$(CompoundAssign,Assign);
	exports.CompoundAssign = CompoundAssign; // export class 
	CompoundAssign.prototype.consume = function (node){
		if (this.isExpressable()) { return CompoundAssign.__super__.consume.apply(this,arguments) };
		
		var ast = this.normalize();
		if (ast != this) { return ast.consume(node) };
		
		ast = this.right().consume(this);
		return ast.consume(node);
	};
	
	CompoundAssign.prototype.normalize = function (){
		var ln = this.left().node();
		// we dont need to change this at all
		if (!((ln instanceof PropertyAccess))) {
			return this;
		};
		
		if (ln instanceof Access) {
			// left might be zero?!?!
			if (ln.left()) { ln.left().cache() };
		};
		// TODO FIXME we want to cache the context of the assignment
		// p "normalize compound assign {left}"
		var ast = OP('=',this.left(),OP(this.op()[0],this.left(),this.right()));
		if (ast.isExpressable()) { ast.toExpression() };
		
		return ast;
	};
	
	CompoundAssign.prototype.c = function (){
		var ast = this.normalize();
		if (ast == this) { return CompoundAssign.__super__.c.apply(this,arguments) };
		
		// otherwise it is important that we actually replace this node in the outer block
		// whenever we normalize and override c it is important that we can pass on caching
		// etc -- otherwise there WILL be issues.
		var up = STACK.current();
		if (up instanceof Block) {
			// p "parent is block, should replace!"
			// an alternative would be to just pass
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
		this._traversed = false;
		this._op = a;
		this._left = b;
		this._right = c;
		this._temporary = [];
	};
	
	subclass$(TupleAssign,Assign);
	exports.TupleAssign = TupleAssign; // export class 
	
	TupleAssign.prototype.__op = {name: 'op'};
	TupleAssign.prototype.op = function(v){ return this._op; }
	TupleAssign.prototype.setOp = function(v){ this._op = v; return this; };
	
	TupleAssign.prototype.__left = {name: 'left'};
	TupleAssign.prototype.left = function(v){ return this._left; }
	TupleAssign.prototype.setLeft = function(v){ this._left = v; return this; };
	
	TupleAssign.prototype.__right = {name: 'right'};
	TupleAssign.prototype.right = function(v){ return this._right; }
	TupleAssign.prototype.setRight = function(v){ this._right = v; return this; };
	
	TupleAssign.prototype.__type = {name: 'type'};
	TupleAssign.prototype.type = function(v){ return this._type; }
	TupleAssign.prototype.setType = function(v){ this._type = v; return this; };
	
	
	
	TupleAssign.prototype.isExpressable = function (){
		return this.right().isExpressable();
	};
	
	TupleAssign.prototype.addExpression = function (expr){
		if (this.right() instanceof Tuple) {
			this.right().push(expr);
		} else {
			// p "making child become a tuple?"
			this.setRight(new Tuple([this.right(),expr]));
		};
		
		return this;
	};
	
	TupleAssign.prototype.visit = function (){
		// if the first left-value is a var-reference, then
		// all the variables should be declared as variables.
		// but if we have complex items in the other list - it does become much harder
		
		// if the first is a var-reference, they should all be(!) .. or splats?
		// this is really a hacky wao to do it though
		if (this.left().first().node() instanceof VarReference) {
			this.setType('var');
			// should possibly allow real vars as well, no?
			this._vars = this.left().nodes().filter(function(n) {
				return n instanceof VarReference;
			});
			// collect the vars for tuple for easy access
			
			// NOTE can improve.. should rather make the whole left be a VarBlock or TupleVarBlock
			// p "type is var -- skip the rest"
		};
		
		this.right().traverse();
		this.left().traverse();
		return this;
	};
	
	TupleAssign.prototype.js = function (o){
		// only for actual inner expressions, otherwise cache the whole array, no?
		var self=this;
		if (!(self.right().isExpressable())) {
			// p "TupleAssign.consume! {right}".blue
			
			return self.right().consume(self).c();
		};
		
		// p "TUPLE {type}"
		
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
		
		var ast = new Block([]);
		var lft = self.left();
		var rgt = self.right();
		var typ = self.type();
		var via = null;
		
		var li = 0;
		var ri = lft.count();
		var llen = ri;
		
		
		// if @vars
		// 	p "tuple has {@vars:length} vars"
		
		// if we have a splat on the left it is much more likely that we need to store right
		// in a temporary array, but if the right side has a known length, it should still not be needed
		var lsplat = lft.filter(function(v) {
			return v instanceof Splat;
		})[0];
		
		// if right is an array without any splats (or inner tuples?), normalize it to tuple
		if ((rgt instanceof Arr) && !(rgt.splat())) { rgt = new Tuple(rgt.nodes()) };
		var rlen = rgt instanceof Tuple ? (rgt.count()) : (null);
		
		// if any values are statements we need to handle this before continuing
		
		//  a,b,c = 10,20,ary 
		
		// ideally we only need to cache the first value (or n - 1), assign directly when possible.
		// only if the variables are not predefined or predeclared can be we certain that we can do it without caching
		// if rlen && typ == 'var' && !lsplat
		// 	# this can be dangerous in edgecases that are very hard to detect
		// 	# if it becomes an issue, fall back to simpler versions
		// 	# does not even matter if there is a splat?
		
		// special case for arguments(!)
		if (!lsplat && rgt == ARGUMENTS) {
			
			var pars = self.scope__().params();
			// p "special case with arguments {pars}"
			// forcing the arguments to be named
			// p "got here??? {pars}"
			lft.map(function(l,i) {
				return ast.push(OP('=',l.node(),pars.at(i,true).visit().variable()));
			}); // s.params.at(value - 1,yes)
		} else if (rlen) {
			// we have several items in the right part. what about splats here?
			
			// pre-evaluate rvalues that might be reference from other assignments
			// we need to check if the rightside values has no side-effects. Cause if
			// they dont, we really do not need temporary variables.
			
			// some of these optimizations are quite petty - makes things more complicated
			// in the compiler only to get around adding a few temp-variables here and there
			
			// var firstUnsafe = 0
			// lft.map do |v,i|
			// 	if v isa VarReference
			// 		p "left side {i} {v} {v.refnr}"
			
			// rgt.map do |v,i|
			// 	if v.hasSideEffects
			// 		# return if i == 0 or !v.hasSideEffects
			// 		# return if v isa Num || v isa Str || i == 0
			// 		# we could explicitly create a temporary variable and adding nodes for accessing etc
			// 		# but the builtin caching should really take care of this for us
			// 		# we need to really force the caching though -- since we need a copy of it even if it is a local
			// 		# we need to predeclare the variables at the top of scope if this does not take care of it
			// 		
			// 		# these are the declarations -- we need to add them somewhere smart
			// 		@temporary.push(v) # need a generalized way to do this type of thing
			// 		ast.push(v.cache(force: yes, type: 'swap', declared: typ == 'var'))
			// 		# they do need to be declared, no?
			
			// now we can free the cached variables
			// ast.map do |n| n.decache
			
			var pre = [];
			var rest = [];
			
			var pairs = lft.map(function(l,i) {
				var v = null;
				// determine if this needs to be precached?
				// if l isa VarReference
				// 	# this is the first time the variable is referenced
				// 	# should also count even if it is predeclared at the top
				// 	if l.refnr == 0
				
				if (l == lsplat) {
					v = new ArgList([]);
					var to = (rlen - (ri - i));
					// p "assing splat at index {i} to slice {li} - {to}".cyan
					while (li <= to){
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
			
			pairs.map(function(v,i) {
				var l = v[0];
				var r = v[1];
				
				if (clean) {
					if ((l instanceof VarReference) && l.refnr() == 0) {
						// still clean
						clean = true;
					} else {
						clean = false;
						// p "now cache"
						pairs.slice(i).map(function(part) {
							if (part[1].hasSideEffects()) {
								self._temporary.push(part[1]); // need a generalized way to do this type of thing
								return ast.push(part[1].cache({force: true,pool: 'swap',declared: typ == 'var'}));
							};
						});
						// p "from {i} - cache all remaining with side-effects"
					};
				};
				
				// if the previous value in ast is a reference to our value - the caching was not needed
				if (ast.last() == r) {
					r.decache();
					// p "was cached - not needed"
					// simple assign
					return ast.replace(r,OP('=',l,r));
				} else {
					return ast.push(OP('=',l,r));
				};
			});
			
			// WARN FIXME Is there not an issue with VarBlock vs not here?
		} else {
			// this is where we need to cache the right side before assigning
			// if the right side is a for loop, we COULD try to be extra clever, but
			// for now it is not worth the added compiler complexity
			
			// iter.cache(force: yes, type: 'iter')
			var top = new VarBlock();
			var iter = self.util().iterable(rgt,true);
			// could set the vars inside -- most likely
			ast.push(top);
			top.push(iter);
			
			if (lsplat) {
				var len = self.util().len(iter,true);
				var idx = self.util().counter(0,true);
				// cache the length of the array
				top.push(len); // preassign the length
				// cache counter to loop through
				top.push(idx);
			};
			
			// only if the block is variable based, no?
			// ast.push(blk = VarBlock.new)
			// blk = null
			
			var blktype = typ == 'var' ? (VarBlock) : (Block);
			var blk = new blktype([]);
			// blk = top if typ == 'var'
			ast.push(blk);
			
			// if the lvals are not variables - we need to preassign
			// can also use slice here for simplicity, but try with while now			
			lft.map(function(l,i) {
				if (l == lsplat) {
					var lvar = l.node();
					var rem = llen - i - 1; // remaining after splat
					
					if (typ != 'var') {
						var arr = self.util().array(OP('-',len,num__(i + rem)),true);
						top.push(arr);
						lvar = arr.cachevar();
					} else {
						if (!blk) { ast.push(blk = new blktype()) };
						arr = self.util().array(OP('-',len,num__(i + rem)));
						blk.push(OP('=',lvar,arr));
					};
					
					// if !lvar:variable || !lvar.variable # lvar = 
					// 	top.push()
					//	p "has variable - no need to create a temp"
					// blk.push(OP('=',lvar,Arr.new([]))) # dont precalculate size now
					// max = to = (rlen - (llen - i))
					
					
					var test = rem ? (OP('-',len,rem)) : (len);
					
					var set = OP('=',OP('.',lvar,OP('-',idx,num__(i))),
					OP('.',iter,OP('++',idx)));
					
					ast.push(WHILE(OP('<',idx,test),set));
					
					if (typ != 'var') {
						ast.push(blk = new Block());
						return blk.push(OP('=',l.node(),lvar));
					} else {
						return blk = null;
					};
					
					// not if splat was last?
					// ast.push(blk = VarBlock.new)
				} else if (lsplat) {
					if (!blk) { ast.push(blk = new blktype()) };
					// we could cache the raw code of this node for better performance
					return blk.push(OP('=',l,OP('.',iter,OP('++',idx))));
				} else {
					if (!blk) { ast.push(blk = new blktype()) };
					return blk.push(OP('=',l,OP('.',iter,num__(i))));
				};
			});
		};
		
		// if we are in an expression we really need to 
		if (o.isExpression() && self._vars) {
			// p "tuple is expression" # variables MUST be autodeclared outside of the expression
			for (var i=0, ary=iter$(self._vars), len_=ary.length; i < len_; i++) {
				ary[i].variable().autodeclare();
			};
		} else if (self._vars) {
			for (var i=0, ary=iter$(self._vars), len_=ary.length; i < len_; i++) {
				// p "predeclare variable before compilation"
				ary[i].variable().predeclared();
			};
		};
		
		// is there any reason to make it into an expression?
		if (ast.isExpressable()) { // NO!
			// p "express"
			// if this is an expression
			var out = ast.c({expression: true});
			if (typ && !(o.isExpression())) { out = ("" + typ + " " + out) }; // not in expression
			return out;
		} else {
			out = ast.c();
			// if this is a varblock 
			return out;
		};
	};
	
	
	TupleAssign.prototype.c = function (o){
		var $1;
		var out = TupleAssign.__super__.c.call(this,o);
		// this is only used in tuple -- better to let the tuple hav a separate #c
		if (this._temporary && this._temporary.length) {
			this._temporary.map(function(temp) {
				return temp.decache();
			});
		};
		return out;
	};
	
	
	
	
	// IDENTIFIERS
	
	// really need to clean this up
	// Drop the token?
	/* @class Identifier */
	function Identifier(value){
		this._value = this.load(value);
		this._symbol = null;
		this._setter = null;
		
		if (("" + value).indexOf("?") >= 0) {
			this.p("Identifier is safechained?");
			this._safechain = true;
		};
		// @safechain = ("" + value).indexOf("?") >= 0
		this;
	};
	
	subclass$(Identifier,Node);
	exports.Identifier = Identifier; // export class 
	
	Identifier.prototype.__safechain = {name: 'safechain'};
	Identifier.prototype.safechain = function(v){ return this._safechain; }
	Identifier.prototype.setSafechain = function(v){ this._safechain = v; return this; };
	
	Identifier.prototype.__value = {name: 'value'};
	Identifier.prototype.value = function(v){ return this._value; }
	Identifier.prototype.setValue = function(v){ this._value = v; return this; };
	
	
	
	Identifier.prototype.load = function (v){
		return (v instanceof Identifier ? (v.value()) : (v));
	};
	
	Identifier.prototype.traverse = function (){
		// NODES.push(self)
		return this;
	};
	
	Identifier.prototype.visit = function (){
		
		if (this._value instanceof Node) {
			// console.log "IDENTIFIER VALUE IS NODE"
			this._value.traverse();
		};
		return this;
	};
	
	Identifier.prototype.region = function (){
		return [this._value._loc,this._value._loc + this._value._len];
	};
	
	Identifier.prototype.isValidIdentifier = function (){
		return true;
	};
	
	Identifier.prototype.isReserved = function (){
		
		return this._value.reserved;
	};
	
	Identifier.prototype.symbol = function (){
		// console.log "Identifier#symbol {value}"
		return this._symbol || (this._symbol = sym__(this.value()));
	};
	
	Identifier.prototype.setter = function (){
		// console.log "Identifier#setter"
		return this._setter || (this._setter = new Identifier(("set-" + (this.value().c()))));
	};
	
	Identifier.prototype.toString = function (){
		return String(this._value);
	};
	
	Identifier.prototype.alias = function (){
		return sym__(this._value);
	};
	
	Identifier.prototype.js = function (o){
		return this.symbol();
	};
	
	Identifier.prototype.c = function (){
		return this.symbol();
	};
	
	Identifier.prototype.dump = function (){
		return {loc: this.region()};
	};
	
	
	
	/* @class TagId */
	function TagId(v){
		this._value = v instanceof Identifier ? (v.value()) : (v);
		this;
	};
	
	subclass$(TagId,Identifier);
	exports.TagId = TagId; // export class 
	
	
	TagId.prototype.c = function (){
		return "id$('" + (this.value().c()) + "')";
	};
	
	
	// This is not an identifier - it is really a string
	// Is this not a literal?
	
	// FIXME Rename to IvarLiteral? or simply Literal with type Ivar
	/* @class Ivar */
	function Ivar(v){
		this._value = v instanceof Identifier ? (v.value()) : (v);
		this;
	};
	
	subclass$(Ivar,Identifier);
	exports.Ivar = Ivar; // export class 
	
	
	Ivar.prototype.name = function (){
		return helpers.camelCase(this._value).replace(/^@/,'');
		// value.c.camelCase.replace(/^@/,'')
	};
	
	Ivar.prototype.alias = function (){
		return '_' + this.name();
	};
	
	// the @ should possibly be gone from the start?
	Ivar.prototype.js = function (o){
		return '_' + this.name();
	};
	
	Ivar.prototype.c = function (){
		return '_' + helpers.camelCase(this._value).slice(1); // .replace(/^@/,'')
	};
	
	
	// Ambiguous - We need to be consistent about Const vs ConstAccess
	// Becomes more important when we implement typeinference and code-analysis
	/* @class Const */
	function Const(){ Identifier.apply(this,arguments) };
	
	subclass$(Const,Identifier);
	exports.Const = Const; // export class 
	Const.prototype.symbol = function (){
		// console.log "Identifier#symbol {value}"
		return this._symbol || (this._symbol = sym__(this.value()));
	};
	
	Const.prototype.js = function (o){
		return this.symbol();
	};
	
	Const.prototype.c = function (){
		return this.symbol();
	};
	
	
	/* @class TagTypeIdentifier */
	function TagTypeIdentifier(value){
		this._value = this.load(value);
		this;
	};
	
	subclass$(TagTypeIdentifier,Identifier);
	exports.TagTypeIdentifier = TagTypeIdentifier; // export class 
	
	TagTypeIdentifier.prototype.__name = {name: 'name'};
	TagTypeIdentifier.prototype.name = function(v){ return this._name; }
	TagTypeIdentifier.prototype.setName = function(v){ this._name = v; return this; };
	
	TagTypeIdentifier.prototype.__ns = {name: 'ns'};
	TagTypeIdentifier.prototype.ns = function(v){ return this._ns; }
	TagTypeIdentifier.prototype.setNs = function(v){ this._ns = v; return this; };
	
	
	
	TagTypeIdentifier.prototype.load = function (val){
		this._str = ("" + val);
		var parts = this._str.split(":");
		this._raw = val;
		this._name = parts.pop();
		this._ns = parts.shift(); // if any?
		return this._str;
	};
	
	TagTypeIdentifier.prototype.js = function (o){
		// p "tagtypeidentifier.js {self}"
		return ("IMBA_TAGS." + (this._str.replace(":","$")));
	};
	
	TagTypeIdentifier.prototype.c = function (){
		return this.js();
	};
	
	TagTypeIdentifier.prototype.func = function (){
		var name = this._name.replace(/-/g,'_').replace(/\#/,'');
		if (this._ns) { name += ("$" + (this._ns.toLowerCase())) };
		return name;
	};
	
	TagTypeIdentifier.prototype.id = function (){
		var m = this._str.match(/\#([\w\-\d\_]+)\b/);
		return m ? (m[1]) : (null);
	};
	
	
	TagTypeIdentifier.prototype.flag = function (){
		return "_" + this.name().replace(/--/g,'_').toLowerCase();
	};
	
	TagTypeIdentifier.prototype.sel = function (){
		return "." + this.flag(); // + name.replace(/-/g,'_').toLowerCase
	};
	
	TagTypeIdentifier.prototype.string = function (){
		return this.value();
	};
	
	
	
	/* @class Argvar */
	function Argvar(){ ValueNode.apply(this,arguments) };
	
	subclass$(Argvar,ValueNode);
	exports.Argvar = Argvar; // export class 
	Argvar.prototype.c = function (){
		// NEXT -- global.parseInt or Number.parseInt (better)
		var v = parseInt(String(this.value()));
		// FIXME Not needed anymore? I think the lexer handles this
		if (v == 0) { return "arguments" };
		
		var s = this.scope__();
		// params need to go up to the closeste method-scope
		var par = s.params().at(v - 1,true);
		return "" + (c__(par.name())); // c
	};
	
	
	
	// CALL
	
	/* @class Call */
	function Call(callee,args,opexists){
		this._traversed = false;
		this._expression = false;
		this._parens = false;
		this._cache = null;
		this._receiver = null;
		this._opexists = opexists;
		// some axioms that share the same syntax as calls will be redirected from here
		
		if (callee instanceof VarOrAccess) {
			var str = callee.value().symbol();
			// p "Call callee {callee} - {str}"
			if (str == 'extern') {
				// p "returning extern instead!"
				return new ExternDeclaration(args);
			};
			if (str == 'tag') {
				// console.log "ERROR - access args by some method"
				return new TagWrapper(args && args.index ? (args.index(0)) : (args[0]));
			};
			if (str == 'export') {
				return new ExportStatement(args);
			};
		};
		
		this._callee = callee;
		this._args = args || new ArgList([]);
		
		if (args instanceof Array) {
			this._args = new ArgList(args);
			// console.log "ARGUMENTS IS ARRAY - error {args}"
		};
		// p "call opexists {opexists}"
		this;
	};
	
	subclass$(Call,Node);
	exports.Call = Call; // export class 
	
	Call.prototype.__callee = {name: 'callee'};
	Call.prototype.callee = function(v){ return this._callee; }
	Call.prototype.setCallee = function(v){ this._callee = v; return this; };
	
	Call.prototype.__receiver = {name: 'receiver'};
	Call.prototype.receiver = function(v){ return this._receiver; }
	Call.prototype.setReceiver = function(v){ this._receiver = v; return this; };
	
	Call.prototype.__args = {name: 'args'};
	Call.prototype.args = function(v){ return this._args; }
	Call.prototype.setArgs = function(v){ this._args = v; return this; };
	
	Call.prototype.__block = {name: 'block'};
	Call.prototype.block = function(v){ return this._block; }
	Call.prototype.setBlock = function(v){ this._block = v; return this; };
	
	
	
	Call.prototype.visit = function (){
		// console.log "visit args {args}"
		this.args().traverse();
		this.callee().traverse();
		
		// if the callee is a PropertyAccess - better to immediately change it
		
		return this._block && this._block.traverse();
	};
	
	Call.prototype.addBlock = function (block){
		var pos = this._args.filter(function(n,i) {
			return n == '&';
		})[0]; // WOULD BE TOKEN - CAREFUL
		pos ? (this.args().replace(pos,block)) : (this.args().push(block));
		return this;
	};
	
	Call.prototype.receiver = function (){
		return this._receiver || (this._receiver = ((this.callee() instanceof Access) && this.callee().left() || NULL));
	};
	
	// check if all arguments are expressions - otherwise we have an issue
	
	Call.prototype.safechain = function (){
		return this.callee().safechain(); // really?
	};
	
	Call.prototype.js = function (o){
		var opt = {expression: true};
		var rec = null;
		// var args = compact__(args) # really?
		var args = this.args();
		
		// drop this?
		
		var splat = args.some(function(v) {
			return v instanceof Splat;
		});
		
		var out = null;
		var lft = null;
		var rgt = null;
		var wrap = null;
		
		var callee = this._callee = this._callee.node(); // drop the var or access?
		
		// p "{self} - {@callee}"
		
		if (this.safechain()) {
			this.p("this is safechained");
		};
		
		if ((callee instanceof Call) && callee.safechain()) {
			this.p("the outer call is safechained");
			true;
			// we need to specify that the _result_ of
		};
		
		if (callee instanceof Access) {
			lft = callee.left();
			rgt = callee.right();
		};
		
		if ((callee instanceof Super) || (callee instanceof SuperAccess)) {
			this._receiver = this.scope__().context();
			// return "supercall"
		};
		
		// never call the property-access directly?
		if (callee instanceof PropertyAccess) { // && rec = callee.receiver
			// p "unwrapping property-access in call"
			this._receiver = callee.receiver();
			callee = this._callee = new Access(callee.op(),callee.left(),callee.right());
			// p "got here? {callee}"
			// console.log "unwrapping the propertyAccess"
		};
		
		if (lft && lft.safechain()) {
			this.p(("Call[left] is safechain " + lft));
			// lft.cache
			// we want to 
			// wrap = ["{}"]
			// p "Call should not cache whole result - only the result of the call".red
		};
		
		if (callee.safechain()) {
			this.p("callee is safechained?!?");
			// if lft isa Call
			// if lft isa Call # could be a property access as well - it is the same?
			// if it is a local var access we simply check if it is a function, then call
			// but it should be safechained outside as well?
			// lft.cache if lft
			// the outer safechain should not cache the whole call - only ask to cache
			// the result? -- chain onto
			// p "Call safechain {callee} {lft}.{rgt}"
			var isfn = new Util.IsFunction([callee]);
			wrap = [("" + (isfn.c()) + "  &&  "),""];
			callee = OP('.',callee.left(),callee.right());
			// callee should already be cached now - 
		};
		
		
		// should just force expression from the start, no?
		if (splat) {
			// important to wrap the single value in a value, to keep implicit call
			// this is due to the way we check for an outer Call without checking if
			// we are the receiver (in PropertyAccess). Should rather wrap in CallArguments
			var ary = (args.count() == 1 ? (new ValueNode(args.first().value())) : (new Arr(args.list())));
			this.receiver().cache(); // need to cache the target
			out = ("" + (callee.c({expression: true})) + ".apply(" + (this.receiver().c()) + "," + (ary.c({expression: true})) + ")");
		} else if (this._receiver) {
			this._receiver.cache();
			args.unshift(this.receiver());
			// should rather rewrite to a new call?
			out = ("" + (callee.c({expression: true})) + ".call(" + (args.c({expression: true})) + ")");
		} else {
			out = ("" + (callee.c({expression: true})) + "(" + (args.c({expression: true})) + ")");
		};
		
		if (wrap) {
			// we set the cachevar inside
			// p "special caching for call"
			if (this._cache) {
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
	ImplicitCall.prototype.js = function (o){
		return "" + (this.callee().c()) + "()";
	};
	
	
	/* @class New */
	function New(){ Call.apply(this,arguments) };
	
	subclass$(New,Call);
	exports.New = New; // export class 
	New.prototype.js = function (o){
		// 
		var out = ("new " + (this.callee().c()));
		if (!((o.parent() instanceof Call))) { out += '()' };
		return out;
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
		// p "visiting externdeclaration"
		this.setNodes(this.map(function(item) {
			return item.node();
		})); // drop var or access really
		// only in global scope?
		var root = this.scope__();
		for (var i=0, ary=iter$(this.nodes()), len=ary.length, item; i < len; i++) {
			item = ary[i];var variable = root.register(item.symbol(),item,{type: 'global'});
			variable.addReference(item);
		};
		return this;
	};
	
	ExternDeclaration.prototype.c = function (){
		return "// externs";
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
		this.setup();
		this._test = cond; // (o:type == 'unless' ? UnaryOp.new('!',cond,null) : cond)
		this._body = body;
		this._alt = null;
		this._type = o.type;
		if (this._type == 'unless') this.invert();
		this._scope = new IfScope(this);
		this;
	};
	
	subclass$(If,ControlFlow);
	exports.If = If; // export class 
	
	If.prototype.__test = {name: 'test'};
	If.prototype.test = function(v){ return this._test; }
	If.prototype.setTest = function(v){ this._test = v; return this; };
	
	If.prototype.__body = {name: 'body'};
	If.prototype.body = function(v){ return this._body; }
	If.prototype.setBody = function(v){ this._body = v; return this; };
	
	If.prototype.__alt = {name: 'alt'};
	If.prototype.alt = function(v){ return this._alt; }
	If.prototype.setAlt = function(v){ this._alt = v; return this; };
	
	If.prototype.__scope = {name: 'scope'};
	If.prototype.scope = function(v){ return this._scope; }
	If.prototype.setScope = function(v){ this._scope = v; return this; };
	
	If.ternary = function (cond,body,alt){
		// prefer to compile it this way as well
		var obj = new If(cond,new Block([body]),{type: '?'});
		obj.addElse(new Block([alt]));
		return obj;
	};
	
	If.prototype.addElse = function (add){
		// p "add else!",add
		if (this.alt() && (this.alt() instanceof If)) {
			// p 'add to the inner else(!)',add
			this.alt().addElse(add);
		} else {
			this.setAlt(add);
		};
		return this;
	};
	
	
	
	
	If.prototype.invert = function (){
		if (this._test instanceof ComparisonOp) {
			return this._test = this._test.invert();
		} else {
			return this._test = new UnaryOp('!',this._test,null);
		};
	};
	
	If.prototype.visit = function (){
		var alt = this.alt();
		
		if (this._scope) { this._scope.visit() };
		if (this.test()) { this.test().traverse() };
		if (this.body()) { this.body().traverse() };
		
		// should skip the scope in alt.
		if (alt) {
			// p "scoping {STACK.scopes:length}"
			STACK.pop(this);
			alt._scope || (alt._scope = new BlockScope(alt));
			alt.traverse();
			STACK.push(this);
			
			// if alt isa If
			// 	# alt.@scope.visit if alt.@scope
			// 	true
			// else
			// 	
			// 	p "else-block isa {alt}"
			
			// popping ourselves from stack while we
			// traverse the alternate route
		};
		
		// force it as expression?
		if (this._type == '?' && this.isExpressable()) this.toExpression();
		return this;
	};
	
	
	If.prototype.js = function (o){
		var body = this.body();
		// would possibly want to look up / out 
		var brace = {braces: true,indent: true};
		
		var cond = this.test().c({expression: true}); // the condition is always an expression
		
		if (o.isExpression()) {
			var code = body.c(); // (braces: yes)
			code = '(' + code + ')'; // if code.indexOf(',') >= 0
			// is expression!
			if (this.alt()) {
				// console.log "type of ternary {test}"
				// be safe - wrap condition as well
				// ask for parens
				return ("" + cond + " ? " + code + " : (" + (this.alt().c()) + ")");
			} else {
				// again - we need a better way to decide what needs parens
				// maybe better if we rewrite this to an OP('&&'), and put
				// the parens logic there
				// cond should possibly have parens - but where do we decide?
				return ("(" + cond + ") && " + code);
			};
		} else {
			// if there is only a single item - and it is an expression?
			code = null;
			// if body.count == 1 # dont indent by ourselves?
			
			if ((body instanceof Block) && body.count() == 1) {
				body = body.first();
			};
			
			// if body.count == 1
			//	p "one item only!"
			//	body = body.first
			
			code = body.c({braces: true}); // (braces: yes)
			// don't wrap if it is only a single expression?
			var out = ("if (" + cond + ") ") + code; // ' {' + code + '}' # '{' + code + '}'
			if (this.alt()) { out += (" else " + (this.alt().c(this.alt() instanceof If ? ({}) : (brace)))) };
			return out;
		};
	};
	
	
	If.prototype.consume = function (node){
		// p 'assignify if?!'
		// if it is possible, convert into expression
		if (node instanceof TagTree) {
			this._body = this._body.consume(node);
			if (this._alt) { this._alt = this._alt.consume(node) };
			return this;
		};
		
		// special case for If created from conditional assign as well?
		// @type == '?' and 
		// ideally we dont really want to make any expression like this by default
		var isRet = (node instanceof Return);
		
		// might have been forced to expression already
		// if it was originally a ternary - why not
		if (this._expression || ((!isRet || this._type == '?') && this.isExpressable())) {
			this.toExpression(); // mark as expression(!) - is this needed?
			return If.__super__.consume.call(this,node);
		} else {
			this._body = this._body.consume(node);
			if (this._alt) { this._alt = this._alt.consume(node) };
		};
		return this;
	};
	
	
	If.prototype.isExpressable = function (){
		// process:stdout.write 'x'
		var exp = this.body().isExpressable() && (!this.alt() || this.alt().isExpressable());
		return exp;
	};
	
	
	
	
	/* @class Loop */
	function Loop(options){
		if(options === undefined) options = {};
		this._traversed = false;
		this._options = options;
		this._body = null;
		this;
	};
	
	subclass$(Loop,Statement);
	exports.Loop = Loop; // export class 
	
	Loop.prototype.__scope = {name: 'scope'};
	Loop.prototype.scope = function(v){ return this._scope; }
	Loop.prototype.setScope = function(v){ this._scope = v; return this; };
	
	Loop.prototype.__options = {name: 'options'};
	Loop.prototype.options = function(v){ return this._options; }
	Loop.prototype.setOptions = function(v){ this._options = v; return this; };
	
	Loop.prototype.__body = {name: 'body'};
	Loop.prototype.body = function(v){ return this._body; }
	Loop.prototype.setBody = function(v){ this._body = v; return this; };
	
	Loop.prototype.__catcher = {name: 'catcher'};
	Loop.prototype.catcher = function(v){ return this._catcher; }
	Loop.prototype.setCatcher = function(v){ this._catcher = v; return this; };
	
	
	
	
	
	Loop.prototype.set = function (obj){
		// p "configure for!"
		this._options || (this._options = {});
		var keys = Object.keys(obj);
		for (var i=0, ary=iter$(keys), len=ary.length, k; i < len; i++) {
			k = ary[i];this._options[k] = obj[k];
		};
		return this;
	};
	
	
	Loop.prototype.addBody = function (body){
		this.setBody(blk__(body));
		return this;
	};
	
	
	Loop.prototype.c = function (o){
		
		var s = this.stack();
		var curr = s.current();
		// p "Loop.c - {isExpressable} {stack} {stack.isExpression}"
		// p "stack is expression? {o} {isExpression}"
		
		
		
		if (this.stack().isExpression() || this.isExpression()) {
			// p "the stack is an expression for loop now(!)"
			// what the inner one should not be an expression though?
			// this will resut in an infinite loop, no?!?
			var ast = CALL(FN([],[this]),[]);
			return ast.c(o);
		} else if ((this.stack().current() instanceof Block) || ((s.up() instanceof Block) && s.current()._consumer == this)) {
			
			// p "what is the current stack of loop? {stack.current}"
			return Loop.__super__.c.call(this,o);
		} else {
			// p "Should never get here?!?"
			ast = CALL(FN([],[this]),[]);
			return ast.c(o);
			// need to wrap in function
		};
	};
	
	
	
	
	/* @class While */
	function While(test,opts){
		this._traversed = false;
		this._test = test;
		this._options = opts || {};
		this._scope = new WhileScope(this);
		// set(opts) if opts
		// p "invert test for while? {@test}"
		if (this.option('invert')) {
			// "invert test for while {@test}"
			this._test = test.invert();
		};
		// invert the test
	};
	
	subclass$(While,Loop);
	exports.While = While; // export class 
	
	While.prototype.__test = {name: 'test'};
	While.prototype.test = function(v){ return this._test; }
	While.prototype.setTest = function(v){ this._test = v; return this; };
	
	
	
	
	
	While.prototype.visit = function (){
		this.scope().visit();
		if (this.test()) { this.test().traverse() };
		if (this.body()) { return this.body().traverse() };
	};
	
	
	// TODO BUG -- when we declare a var like: while var y = ...
	// the variable will be declared in the WhileScope which never
	// force-declares the inner variables in the scope
	
	While.prototype.consume = function (node){
		// p "While.consume {node}".cyan
		// This is never expressable, but at some point
		// we might want to wrap it in a function (like CS)
		if (this.isExpressable()) { return While.__super__.consume.apply(this,arguments) };
		
		if (node instanceof TagTree) {
			// WARN this is a hack to allow references coming through the wrapping scope 
			// will result in unneeded self-declarations and other oddities
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
		this._catcher = new PushAssign("push",resvar,null); // the value is not preset # what
		this.body().consume(this._catcher); // should still return the same body
		
		// scope vars must not be compiled before this -- this is important
		var ast = new Block([this,resvar.accessor()]); // should be varaccess instead?
		return ast.consume(node);
		// NOTE Here we can find a way to know wheter or not we even need to 
		// return the resvar. Often it will not be needed
		// FIXME what happens if there is no node?!?
	};
	
	
	While.prototype.js = function (o){
		var out = ("while (" + (this.test().c({expression: true})) + ")") + this.body().c({braces: true,indent: true}); // .wrap
		
		if (this.scope().vars().count() > 0) {
			// p "while-block has declared variables(!)"
			return [this.scope().vars().c(),out];
		};
		return out;
	};
	
	
	
	
	// This should define an open scope
	// should rather 
	/* @class For */
	function For(o){
		if(o === undefined) o = {};
		this._traversed = false;
		this._options = o;
		this._scope = new ForScope(this);
		this._catcher = null;
	};
	
	subclass$(For,Loop);
	exports.For = For; // export class 
	
	
	For.prototype.visit = function (){
		this.scope().visit();
		this.options().source.traverse(); // what about awakening the vars here?
		this.declare();
		// should be able to toggle whether to keep the results here already(!)
		return this.body().traverse();
	};
	
	For.prototype.isBare = function (src){
		return src && src._variable && src._variable._isArray;
	};
	
	For.prototype.declare = function (){
		var o = this.options();
		var scope = this.scope();
		var src = o.source;
		var vars = o.vars = {};
		var oi = o.index;
		
		var bare = this.isBare(src);
		// p "source is a {src} - {bare}"
		// var i = vars:index = oi ? scope.declare(oi,0) : util.counter(0,yes).predeclare
		
		// what about a range where we also include an index?
		if (src instanceof Range) {
			// p "range for-loop"
			
			// really? declare? 
			// are we sure? _really_?
			vars.len = scope.declare('len',src.right()); // util.len(o,yes).predeclare
			// make the scope be the declarator
			vars.index = scope.register(o.name,scope,{type: 'let',declared: true});
			// p "registered {vars:index:constructor}"
			// p "index-var is declareod?!?! {vars:index.@declared}"
			scope.vars().push(vars.index.assignment(src.left()));
			// scope.declare(options:name,src.left)
			vars.value = vars.index;
		} else {
			// vars:value = scope.declare(options:name,null,let: yes)
			// we are using automatic caching far too much here
			
			// we should simply change how declare works
			var i = vars.index = oi ? (scope.declare(oi,0,{type: 'let'})) : (this.util().counter(0,true,scope).predeclare());
			
			vars.source = bare ? (src) : (this.util().iterable(src,true).predeclare());
			vars.len = this.util().len(vars.source,true).predeclare();
			
			vars.value = scope.declare(o.name,null,{type: 'let'});
			vars.value.addReference(o.name); // adding reference!
			if (oi) { i.addReference(oi) };
		};
		
		return this;
	};
	
	
	For.prototype.consume = function (node){
		// p "Loop consume? {node} - {isExpressable}"
		// if node isa ImplicitReturn
		// 	return self
		
		// p "For.consume {node}".cyan
		var receiver;
		if (this.isExpressable()) { return For.__super__.consume.apply(this,arguments) };
		
		// other cases as well, no?
		if (node instanceof TagTree) {
			// WARN this is a hack to allow references coming through the wrapping scope 
			// will result in unneeded self-declarations and other oddities
			// scope.parent.context.reference
			this.scope().context().reference();
			return CALL(new Lambda([],[this]),[]);
		};
		
		
		if (this._resvar) {
			this.p(("already have a resvar -- change consume? " + node));
			var ast = new Block([this,BR,this._resvar.accessor()]);
			ast.consume(node);
			return ast;
		};
		
		// if node isa return -- do something else
		
		var resvar = null;
		var reuseable = false; // node isa Assign && node.left.node isa LocalVarAccess
		var assignee = null;
		// might only work for locals?
		if (node instanceof Assign) {
			if (receiver = node.left()) {
				assignee = receiver._variable;
				if (receiver._variable) {
					// assignee
					reuseable = true;
				};
			};
		};
		
		// p "reusable?!?! {node} {node}"
		
		// WARN Optimization - might have untended side-effects
		// if we are assigning directly to a local variable, we simply
		// use said variable for the inner res
		if (reuseable && assignee) {
			// instead of declaring it in the scope - why not declare it outside?
			// it might already exist in the outer scope no?
			// p "reuseable {assignee} {scope} {scope.parent.lookup(assignee)}"
			// assignee.resolve
			// should probably instead alter the assign-node to set value to a blank array
			// resvar = scope.parent.declare(assignee,Arr.new([]),proxy: yes,pos: 0)
			
			// this variable should really not be redeclared inside here at all
			assignee.resolve();
			// resvar = @resvar = scope.declare(assignee,Arr.new([]),proxy: yes)
			
			// dont declare it - simply push an assign into the vardecl of scope
			this.scope().vars().unshift(OP('=',assignee,new Arr([])));
			resvar = this._resvar = assignee;
			
			node._consumer = this;
			node = null;
			
			// p "consume variable declarator!?".cyan
		} else {
			// declare the variable we will use to soak up results
			// p "Creating value to store the result of loop".cyan
			// what about a pool here?
			resvar = this._resvar = this.scope().declare('res',new Arr([]),{system: true});
		};
		
		this._catcher = new PushAssign("push",resvar,null); // the value is not preset
		this.body().consume(this._catcher); // should still return the same body
		
		
		
		if (node) {
			// p "returning new ast where Loop is first"
			ast = new Block([this,BR,resvar.accessor().consume(node)]);
			return ast;
		};
		// var ast = Block.new([self,BR,resvar.accessor])
		// ast.consume(node) if node
		// return ast
		// p "Loop did consume successfully"
		return this;
		
		// this is never an expression (for now -- but still)
		// return ast
	};
	
	
	For.prototype.js = function (o){
		var vars = this.options().vars;
		var i = vars.index;
		var val = vars.value;
		var cond = OP('<',i,vars.len);
		var src = this.options().source;
		
		// p "references for value",val.references:length
		
		var final = this.options().step ? (
			OP('=',i,OP('+',i,this.options().step))
		) : (
			OP('++',i)
		);
		
		// if there are few references to the value - we can drop
		// the actual variable and instead make it proxy through the index
		if (src instanceof Range) {
			if (src.inclusive()) { (cond.setOp(v_='<='),v_) };
		} else if (val.refcount() < 3) {
			// p "should proxy value-variable instead"
			val.proxy(vars.source,i);
		} else {
			this.body().unshift(OP('=',val,OP('.',vars.source,i)));
			// body.unshift(head)
			// TODO check lengths - intelligently decide whether to brace and indent
		};
		var head = ("for (" + (this.scope().vars().c()) + "; " + (cond.c()) + "; " + (final.c()) + ") ");
		return head + this.body().c({braces: true,indent: true}); // .wrap
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
		var o = this.options();
		var vars = o.vars = {};
		
		// see if 
		
		// p "ForOf source isa {o:source}"
		
		// if o:source is a variable -- refer directly
		var src = vars.source = o.source._variable || this.scope().declare('o',o.source,{system: true});
		if (o.index) { var v = vars.value = this.scope().declare(o.index,null,{let: true}) };
		
		// p "ForOf o:index {o:index} o:name {o:name}"
		// if o:index
		
		// possibly proxy the index-variable?
		
		if (o.own) {
			var i = vars.index = this.scope().declare('i',0,{system: true}); // mark as a counter?
			// systemvariable -- should not really be added to the map
			var keys = vars.keys = this.scope().declare('keys',Util.keys(src.accessor()),{system: true,type: 'let'}); // the outer one should resolve first
			var l = vars.len = this.scope().declare('l',Util.len(keys.accessor()),{system: true});
			var k = vars.key = this.scope().register(o.name,o.name,{type: 'let'}); // scope.declare(o:name,null,system: yes)
		} else {
			// we set the var -- why even declare it
			// no need to declare -- it will declare itself in the loop - no?
			k = vars.key = this.scope().register(o.name,o.name,{type: 'let'});
		};
		
		// TODO use util - why add references already? Ah -- this is for the highlighting
		if (v && o.index) { v.addReference(o.index) };
		if (k && o.name) { k.addReference(o.name) };
		
		return this;
	};
	
	ForOf.prototype.js = function (o){
		var vars = this.options().vars;
		
		var o = vars.source;
		var k = vars.key;
		var v = vars.value;
		var i = vars.index;
		
		
		if (v) {
			// set value as proxy of object[key]
			// possibly make it a ref? what is happening?
			v.refcount() < 3 ? (v.proxy(o,k)) : (this.body().unshift(OP('=',v,OP('.',o,k))));
		};
		
		if (this.options().own) {
			
			if (k.refcount() < 3) { // should probably adjust these
				k.proxy(vars.keys,i);
			} else {
				this.body().unshift(OP('=',k,OP('.',vars.keys,i)));
			};
			
			var head = ("for (" + (this.scope().vars().c()) + "; " + (OP('<',i,vars.len).c()) + "; " + (OP('++',i).c()) + ")");
			return head + this.body().c({indent: true,braces: true}); // .wrap
		};
		
		var code = this.body().c({braces: true,indent: true});
		// it is really important that this is a treated as a statement
		return this.scope().vars().c() + (";\nfor (var " + (k.c()) + " in " + (o.c()) + ")") + code;
	};
	
	ForOf.prototype.head = function (){
		var v = this.options().vars;
		
		return [
			OP('=',v.key,OP('.',v.keys,v.index)),
			(v.value) && (OP('=',v.value,OP('.',v.source,v.key)))
		];
	};
	
	
	// NO NEED?
	/* @class Begin */
	function Begin(body){
		this._nodes = blk__(body).nodes();
	};
	
	subclass$(Begin,Block);
	exports.Begin = Begin; // export class 
	
	
	
	Begin.prototype.shouldParenthesize = function (){
		return this.isExpression();
	};
	
	
	
	
	/* @class Switch */
	function Switch(a,b,c){
		this._traversed = false;
		this._source = a;
		this._cases = b;
		this._fallback = c;
	};
	
	subclass$(Switch,ControlFlowStatement);
	exports.Switch = Switch; // export class 
	
	Switch.prototype.__source = {name: 'source'};
	Switch.prototype.source = function(v){ return this._source; }
	Switch.prototype.setSource = function(v){ this._source = v; return this; };
	
	Switch.prototype.__cases = {name: 'cases'};
	Switch.prototype.cases = function(v){ return this._cases; }
	Switch.prototype.setCases = function(v){ this._cases = v; return this; };
	
	Switch.prototype.__fallback = {name: 'fallback'};
	Switch.prototype.fallback = function(v){ return this._fallback; }
	Switch.prototype.setFallback = function(v){ this._fallback = v; return this; };
	
	
	
	
	
	Switch.prototype.visit = function (){
		for (var i=0, ary=iter$(this.cases()), len=ary.length; i < len; i++) {
			ary[i].traverse();
		};
		if (this.fallback()) { this.fallback().visit() };
		if (this.source()) { this.source().visit() };
		return;
	};
	
	
	Switch.prototype.consume = function (node){
		this._cases = this._cases.map(function(item) {
			return item.consume(node);
		});
		if (this._fallback) { this._fallback = this._fallback.consume(node) };
		return this;
	};
	
	
	Switch.prototype.js = function (o){
		var body = [];
		
		for (var i=0, ary=iter$(this.cases()), len=ary.length, part; i < len; i++) {
			part = ary[i];part.autobreak();
			body.push(part);
		};
		
		if (this.fallback()) {
			body.push("default:\n" + this.fallback().c({indent: true}));
		};
		
		return ("switch (" + (this.source().c()) + ") ") + helpers.bracketize(cary__(body).join("\n"),true);
	};
	
	
	
	
	/* @class SwitchCase */
	function SwitchCase(test,body){
		this._traversed = false;
		this._test = test;
		this._body = blk__(body);
	};
	
	subclass$(SwitchCase,ControlFlowStatement);
	exports.SwitchCase = SwitchCase; // export class 
	
	SwitchCase.prototype.__test = {name: 'test'};
	SwitchCase.prototype.test = function(v){ return this._test; }
	SwitchCase.prototype.setTest = function(v){ this._test = v; return this; };
	
	SwitchCase.prototype.__body = {name: 'body'};
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
		if (!((this.body().last() instanceof BreakStatement))) { this.body().push(new BreakStatement()) };
		return this;
	};
	
	
	SwitchCase.prototype.js = function (o){
		if (!((this._test instanceof Array))) { this._test = [this._test] };
		var cases = this._test.map(function(item) {
			return "case " + (item.c()) + ":";
		});
		return cases.join("\n") + this.body().c({indent: true}); // .indent
	};
	
	
	
	
	/* @class Try */
	function Try(body,c,f){
		this._traversed = false;
		this._body = blk__(body);
		this._catch = c;
		this._finally = f;
	};
	
	subclass$(Try,ControlFlowStatement);
	exports.Try = Try; // export class 
	
	Try.prototype.__body = {name: 'body'};
	Try.prototype.body = function(v){ return this._body; }
	Try.prototype.setBody = function(v){ this._body = v; return this; };
	// prop ncatch
	// prop nfinally
	
	
	
	
	Try.prototype.consume = function (node){
		this._body = this._body.consume(node);
		if (this._catch) { this._catch = this._catch.consume(node) };
		if (this._finally) { this._finally = this._finally.consume(node) };
		return this;
	};
	
	
	Try.prototype.visit = function (){
		this._body.traverse();
		if (this._catch) { this._catch.traverse() };
		if (this._finally) { return this._finally.traverse() };
		// no blocks - add an empty catch
	};
	
	
	Try.prototype.js = function (o){
		var out = "try " + this.body().c({braces: true,indent: true});
		if (this._catch) { out += " " + this._catch.c() };
		if (this._finally) { out += " " + this._finally.c() };
		
		if (!(this._catch || this._finally)) {
			out += " catch (e) \{ \}";
		};
		out += ";";
		return out;
	};
	
	
	
	
	/* @class Catch */
	function Catch(body,varname){
		this._traversed = false;
		this._body = blk__(body || []);
		this._scope = new CatchScope(this);
		this._varname = varname;
		this;
	};
	
	subclass$(Catch,ControlFlowStatement);
	exports.Catch = Catch; // export class 
	
	Catch.prototype.__body = {name: 'body'};
	Catch.prototype.body = function(v){ return this._body; }
	Catch.prototype.setBody = function(v){ this._body = v; return this; };
	
	
	
	Catch.prototype.consume = function (node){
		this._body = this._body.consume(node);
		return this;
	};
	
	
	Catch.prototype.visit = function (){
		this._scope.visit();
		this._variable = this._scope.register(this._varname,this,{pool: 'catchvar'});
		return this._body.traverse();
	};
	
	
	Catch.prototype.js = function (o){
		// only indent if indented by default?
		return ("catch (" + (this._variable.c()) + ") ") + this._body.c({braces: true,indent: true});
	};
	
	
	
	// repeating myself.. don't deal with it until we move to compact tuple-args
	// for all astnodes
	
	
	/* @class Finally */
	function Finally(body){
		this._traversed = false;
		this._body = blk__(body || []);
	};
	
	subclass$(Finally,ControlFlowStatement);
	exports.Finally = Finally; // export class 
	
	
	
	Finally.prototype.visit = function (){
		return this._body.traverse();
	};
	
	
	Finally.prototype.consume = function (node){
		// swallow silently
		return this;
	};
	
	
	Finally.prototype.js = function (o){
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
	Splat.prototype.js = function (o){
		var par = this.stack().parent();
		if ((par instanceof ArgList) || (par instanceof Arr)) {
			return "[].slice.call(" + (this.value().c()) + ")";
		} else {
			this.p(("what is the parent? " + par));
			return "SPLAT";
		};
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
		this;
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
		this._traversed = false;
		this._parts = [];
		o.classes || (o.classes = []);
		o.attributes || (o.attributes = []);
		o.classes || (o.classes = []);
		this._options = o;
		this._reference = null;
		this._object = null;
		this._tree = null;
		this;
	};
	
	subclass$(Tag,Node);
	exports.Tag = Tag; // export class 
	
	Tag.prototype.__parts = {name: 'parts'};
	Tag.prototype.parts = function(v){ return this._parts; }
	Tag.prototype.setParts = function(v){ this._parts = v; return this; };
	
	Tag.prototype.__object = {name: 'object'};
	Tag.prototype.object = function(v){ return this._object; }
	Tag.prototype.setObject = function(v){ this._object = v; return this; };
	
	Tag.prototype.__reactive = {name: 'reactive'};
	Tag.prototype.reactive = function(v){ return this._reactive; }
	Tag.prototype.setReactive = function(v){ this._reactive = v; return this; };
	
	Tag.prototype.__parent = {name: 'parent'};
	Tag.prototype.parent = function(v){ return this._parent; }
	Tag.prototype.setParent = function(v){ this._parent = v; return this; };
	
	Tag.prototype.__tree = {name: 'tree'};
	Tag.prototype.tree = function(v){ return this._tree; }
	Tag.prototype.setTree = function(v){ this._tree = v; return this; };
	
	
	
	Tag.prototype.set = function (obj){
		for (var v, i=0, keys=Object.keys(obj), l=keys.length; i < l; i++){
			k = keys[i];v = obj[k];if (k == 'attributes') {
				// p "attributs!"
				for (var j=0, ary=iter$(v), len=ary.length; j < len; j++) {
					this.addAttribute(ary[j]);
				};
				continue;
			};
			
			this._options[k] = v;
		};
		return this;
	};
	
	Tag.prototype.addClass = function (node){
		if (!((node instanceof TagFlag))) {
			node = new TagFlag(node);
		};
		this._options.classes.push(node);
		this._parts.push(node);
		
		// p "add class!!!"
		return this;
	};
	
	Tag.prototype.addIndex = function (node){
		this._parts.push(node);
		this._object = node;
		return this;
	};
	
	Tag.prototype.addSymbol = function (node){
		// p "addSymbol to the tag",node
		if (this._parts.length == 0) {
			this._parts.push(node);
			this._options.ns = node;
		};
		return this;
	};
	
	
	Tag.prototype.addAttribute = function (atr){
		// p "add attribute!!!", key, value
		this._parts.push(atr); // what?
		this._options.attributes.push(atr);
		return this;
	};
	
	Tag.prototype.enclosing = function (){
		return this._options.close && this._options.close.value();
	};
	
	Tag.prototype.type = function (){
		return this._options.type || 'div';
	};
	
	Tag.prototype.consume = function (node){
		if (node instanceof TagTree) {
			// p "tag consume tagtree? {node.reactive}"
			this.setReactive(node.reactive() || !(!this.option('ivar')));
			this.setParent(node.root());
			return this;
		} else {
			return Tag.__super__.consume.apply(this,arguments);
		};
	};
	
	Tag.prototype.visit = function (){
		var o = this._options;
		var typ = this.enclosing();
		if (typ == '->' || typ == '=>') {
			// console.log "tag is template?!? {typ}"
			this._tree = new TagTree(o.body,{root: this,reactive: this.reactive()});
			o.body = new TagFragmentFunc([],Block.wrap([this._tree]));
			// console.log "made o body a function?"
		};
		
		if (o.body) {
			o.body.traverse();
		};
		
		// id should also be a regular part
		
		if (o.id) { o.id.traverse() };
		
		for (var i=0, ary=iter$(this._parts), len=ary.length; i < len; i++) {
			ary[i].traverse();
		};
		
		// for atr in @options:attributes
		// 	atr.traverse
		
		return this;
	};
	
	Tag.prototype.reference = function (){
		return this._reference || (this._reference = this.scope__().temporary(this,{pool: 'tag'}).resolve());
	};
	
	// should this not happen in js?
	// should this not happen in js?
	Tag.prototype.js = function (o){
		// p JSON.stringify(@options)
		// var attrs = TagAttributes.new(o:attributes)
		// p "got here?"
		var body;
		var o = this._options;
		var a = {};
		var enc = this.enclosing();
		
		var setup = [];
		var calls = [];
		var statics = [];
		
		var scope = this.scope__();
		var commit = "end";
		var content = o.body;
		
		var isSelf = (this.type() instanceof Self);
		var bodySetter = isSelf ? ("setChildren") : ("setContent");
		
		for (var i=0, ary=iter$(o.attributes), len=ary.length, atr; i < len; i++) {
			atr = ary[i];a[atr.key()] = atr.value(); // .populate(obj)
		};
		
		var quote = function(str) {
			return helpers.singlequote(str);
		};
		var id = o.id instanceof Node ? (o.id.c()) : ((o.id && quote(o.id.c())));
		var tree = this._tree || null;
		
		
		//  "scope is", !!scope
		// p "type is {type}"
		var out = isSelf ? (
			commit = "synced",
			// p "got here"
			// setting correct context directly
			this.setReactive(true),
			this._reference = scope.context(),
			
			scope.context().c()
		) : (o.id ? (
			("ti$('" + (this.type().func()) + "'," + id + ")")
		) : (
			("t$('" + (this.type().func()) + "')")
		));
		
		// this is reactive if it has an ivar
		if (o.ivar) {
			this.setReactive(true);
			statics.push((".setRef(" + (quote(o.ivar.name())) + "," + (scope.context().c()) + ")"));
		};
		
		if (o.body instanceof Func) {
			// console.log "o:body isa function!"
			bodySetter = "setTemplate";
		} else if (o.body) {
			tree = new TagTree(o.body,{root: this,reactive: this.reactive()});
			content = tree;
			this.setTree(tree);
		};
		
		if (tree) {
			tree.resolve();
		};
		
		for (var i=0, ary=iter$(this._parts), len=ary.length, part; i < len; i++) {
			part = ary[i];if (part instanceof TagAttr) {
				var akey = String(part.key());
				
				// the attr should compile itself instead -- really
				
				if (akey[0] == '.') { // should check in a better way
					calls.push((".flag(" + (quote(akey.substr(1))) + "," + (part.value().c()) + ")"));
				} else {
					calls.push(("." + (helpers.setterSym(akey)) + "(" + (part.value().c()) + ")"));
				};
			} else if (part instanceof TagFlag) {
				calls.push(part.c());
			};
		};
		
		if (this.object()) {
			calls.push((".setObject(" + (this.object().c()) + ")"));
		};
		
		// p "tagtree is static? {tree.static}"
		
		// we need to trigger our own reference before the body does
		// but we do not need a reference if we have no body (no nodes will refer it)
		if (this.reactive() && tree && tree.hasTags()) {
			this.reference();
		};
		
		
		if (body = content && content.c({expression: true})) { // force it to be an expression, no?
			calls.push(("." + bodySetter + "(" + body + ")"));
			
			// out += ".body({body})"
		};
		
		// if o:attributes:length # or -- always?
		// adds lots of extra calls - but okay for now
		calls.push(("." + commit + "()"));
		
		if (statics.length) {
			out = out + statics.join("");
		};
		
		
		if ((o.ivar || this.reactive()) && !(this.type() instanceof Self)) {
			// if this is an ivar, we should set the reference relative
			// to the outer reference, or possibly right on context?
			var par = this.parent();
			var ctx = !(o.ivar) && par && par.reference() || scope.context();
			var key = o.ivar || par && par.tree().indexOf(this);
			
			// need the context -- might be better to rewrite it for real?
			// parse the whole thing into calls etc
			var acc = OP('.',ctx,key).c();
			
			if (this._reference) {
				out = ("(" + (this.reference().c()) + " = " + acc + " || (" + acc + " = " + out + "))");
			} else {
				out = ("(" + acc + " || (" + acc + " = " + out + "))");
			};
		};
		
		
		// should we not add references to the outer ones first?
		
		// now work on the refereces?
		
		// free variable
		if (this._reference instanceof Variable) { this._reference.free() };
		// if setup:length
		//	out += ".setup({setup.join(",")})"
		
		return out + calls.join("");
	};
	
	
	// This is a helper-node
	// Should probably use the same type of listnode everywhere - and simply flag the type as TagTree instead
	/* @class TagTree */
	function TagTree(list,options){
		if(options === undefined) options = {};
		this._nodes = this.load(list);
		this._options = options;
		this;
	};
	
	subclass$(TagTree,ListNode);
	exports.TagTree = TagTree; // export class 
	
	
	TagTree.prototype.load = function (list){
		if (list instanceof ListNode) {
			// p "is a list node!! {list.count}"
			// we still want the indentation if we are not in a template
			// or, rather - we want the block to get the indentation - not the tree
			if (list.count() > 1) this._indentation || (this._indentation = list._indentation);
			return list.nodes();
		} else {
			return compact__(list instanceof Array ? (list) : ([list]));
		};
	};
	
	TagTree.prototype.root = function (){
		return this.option('root');
	};
	
	TagTree.prototype.reactive = function (){
		return this.option('reactive');
	};
	
	TagTree.prototype.resolve = function (){
		var self=this;
		this.remap(function(c) {
			return c.consume(self);
		});
		return self;
	};
	
	TagTree.prototype.static = function (){
		return this._static == null ? (this._static = this.every(function(c) {
			return c instanceof Tag;
		})) : (this._static);
	};
	
	TagTree.prototype.hasTags = function (){
		return this.some(function(c) {
			return c instanceof Tag;
		});
	};
	
	TagTree.prototype.c = function (o){
		// FIXME TEST what about comments???
		var $1;
		var single = this.count() == 1;
		var out = TagTree.__super__.c.call(this,o);
		if (!single) { out = "[" + out + "]" };
		return out;
	};
	
	
	/* @class TagWrapper */
	function TagWrapper(){ ValueNode.apply(this,arguments) };
	
	subclass$(TagWrapper,ValueNode);
	exports.TagWrapper = TagWrapper; // export class 
	TagWrapper.prototype.visit = function (){
		if (this.value() instanceof Array) {
			this.value().map(function(v) {
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
		for (var i=0, ary=iter$(this.nodes()), len=ary.length, node, res=[]; i < len; i++) {
			node = ary[i];if (node.key() == name) { return node };
		};
		return res;
	};
	
	
	
	/* @class TagAttr */
	function TagAttr(k,v){
		// p "init TagAttribute", $0
		this._traversed = false;
		this._key = k;
		this._value = v;
	};
	
	subclass$(TagAttr,Node);
	exports.TagAttr = TagAttr; // export class 
	
	TagAttr.prototype.__key = {name: 'key'};
	TagAttr.prototype.key = function(v){ return this._key; }
	TagAttr.prototype.setKey = function(v){ this._key = v; return this; };
	
	TagAttr.prototype.__value = {name: 'value'};
	TagAttr.prototype.value = function(v){ return this._value; }
	TagAttr.prototype.setValue = function(v){ this._value = v; return this; };
	
	TagAttr.prototype.visit = function (){
		if (this.value()) { this.value().traverse() };
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
		this._traversed = false;
		this._value = value;
		this;
	};
	
	subclass$(TagFlag,Node);
	exports.TagFlag = TagFlag; // export class 
	
	TagFlag.prototype.__value = {name: 'value'};
	TagFlag.prototype.value = function(v){ return this._value; }
	TagFlag.prototype.setValue = function(v){ this._value = v; return this; };
	
	TagFlag.prototype.__toggler = {name: 'toggler'};
	TagFlag.prototype.toggler = function(v){ return this._toggler; }
	TagFlag.prototype.setToggler = function(v){ this._toggler = v; return this; };
	
	
	
	TagFlag.prototype.visit = function (){
		if (!((typeof this._value=='string'||this._value instanceof String))) {
			this._value.traverse();
		};
		return this;
	};
	
	TagFlag.prototype.c = function (){
		if (this.value() instanceof Node) {
			return ".flag(" + (this.value().c()) + ")";
		} else {
			return ".flag(" + (helpers.singlequote(this.value())) + ")";
		};
	};
	
	
	
	
	
	
	
	// SELECTORS
	
	
	/* @class Selector */
	function Selector(list,options){
		this._nodes = list || [];
		this._options = options;
	};
	
	subclass$(Selector,ListNode);
	exports.Selector = Selector; // export class 
	
	
	Selector.prototype.add = function (part,typ){
		// p "select add!",part,typ
		// mark if special?
		this.push(part);
		return this;
	};
	
	Selector.prototype.group = function (){
		// console.log "grouped!"
		// for now we simply add a comma
		// how would this work for dst?
		this._nodes.push(new SelectorGroup(","));
		return this;
	};
	
	Selector.prototype.query = function (){
		var str = "";
		var ary = [];
		
		for (var i=0, items=iter$(this.nodes()), len=items.length; i < len; i++) {
			var val = items[i].c();
			if ((typeof val=='string'||val instanceof String)) {
				str = ("" + str + val);
			};
		};
		
		return "'" + str + "'";
	};
	
	
	Selector.prototype.js = function (o){
		var typ = this.option('type');
		var q = c__(this.query());
		
		if (typ == '%') {
			return "q$(" + q + "," + (o.scope().context().c({explicit: true})) + ")"; // explicit context
		} else if (typ == '%%') {
			return "q$$(" + q + "," + (o.scope().context().c({explicit: true})) + ")";
		} else {
			return "q" + typ + "(" + q + ")";
		};
		
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
	
	
	/* @class SelectorGroup */
	function SelectorGroup(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorGroup,SelectorPart);
	exports.SelectorGroup = SelectorGroup; // export class 
	SelectorGroup.prototype.c = function (){
		return ",";
	};
	
	
	/* @class SelectorType */
	function SelectorType(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorType,SelectorPart);
	exports.SelectorType = SelectorType; // export class 
	SelectorType.prototype.c = function (){
		// support
		// p "selectortype {value}"
		// var out = value.c
		var name = this.value().name();
		
		// at least be very conservative about which tags we
		// can drop the tag for?
		// out in TAG_TYPES.HTML ? 
		return idx$(name,TAG_TYPES.HTML) >= 0 ? (name) : (this.value().sel());
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
		if (this._value instanceof Node) {
			return ".'+" + (this._value.c()) + "+'";
		} else {
			return "." + (c__(this._value));
		};
	};
	
	
	/* @class SelectorId */
	function SelectorId(){ SelectorPart.apply(this,arguments) };
	
	subclass$(SelectorId,SelectorPart);
	exports.SelectorId = SelectorId; // export class 
	SelectorId.prototype.c = function (){
		if (this._value instanceof Node) {
			return "#'+" + (this._value.c()) + "+'";
		} else {
			return "#" + (c__(this._value));
		};
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
		// TODO possibly support .toSel or sel$(v) for items inside query
		// could easily do it with a helper-function that is added to the top of the filescope
		if (this._right instanceof Str) {
			return "[" + (this._left.c()) + this._op + (this._right.c()) + "]";
		} else if (this._right) {
			// this is not at all good
			return "[" + (this._left.c()) + this._op + "\"'+" + (c__(this._right)) + "+'\"]";
		} else {
			return "[" + (this._left.c()) + "]";
			
			// ...
		};
	};
	
	
	
	
	
	// DEFER
	
	/* @class Await */
	function Await(){ ValueNode.apply(this,arguments) };
	
	subclass$(Await,ValueNode);
	exports.Await = Await; // export class 
	
	Await.prototype.__func = {name: 'func'};
	Await.prototype.func = function(v){ return this._func; }
	Await.prototype.setFunc = function(v){ this._func = v; return this; };
	
	Await.prototype.js = function (o){
		// introduce a util here, no?
		return CALL(OP('.',new Util.Promisify([this.value()]),'then'),[this.func()]).c();
		// value.c
	};
	
	Await.prototype.visit = function (o){
		// things are now traversed in a somewhat chaotic order. Need to tighten
		// Create await function - push this value up to block, take the outer
		var self=this;
		self.value().traverse();
		
		var block = o.up(Block); // or up to the closest FUNCTION?
		var outer = o.relative(block,1);
		var par = o.relative(self,-1);
		
		// p "Block {block} {outer} {par}"
		
		self.setFunc(new AsyncFunc([],[]));
		// now we move this node up to the block
		self.func().body().setNodes(block.defers(outer,self));
		
		// if the outer is a var-assignment, we can simply set the params
		if (par instanceof Assign) {
			par.left().traverse();
			var lft = par.left().node();
			// p "Async assignment {par} {lft}"
			// Can be a tuple as well, no?
			if (lft instanceof VarReference) {
				// the param is already registered?
				// should not force the name already??
				// beware of bugs
				self.func().params().at(0,true,lft.variable().name());
			} else if (lft instanceof Tuple) {
				// if this an unfancy tuple, with only vars
				// we can just use arguments
				
				if (par.type() == 'var' && !(lft.hasSplat())) {
					// p "SIMPLIFY! {lft.nodes[0]}"
					lft.map(function(el,i) {
						return self.func().params().at(i,true,el.value());
					});
				} else {
					// otherwise, do the whole tuple
					// make sure it is a var assignment?
					par.setRight(ARGUMENTS);
					self.func().body().unshift(par);
				};
			} else {
				// regular setters
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
		var $1;
		AsyncFunc.__super__.constructor.call(this,params,body,name,target,options);
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
		this._traversed = false;
		this._imports = imports;
		this._source = source;
		this._ns = ns;
		this;
	};
	
	subclass$(ImportStatement,Statement);
	exports.ImportStatement = ImportStatement; // export class 
	
	ImportStatement.prototype.__ns = {name: 'ns'};
	ImportStatement.prototype.ns = function(v){ return this._ns; }
	ImportStatement.prototype.setNs = function(v){ this._ns = v; return this; };
	
	ImportStatement.prototype.__imports = {name: 'imports'};
	ImportStatement.prototype.imports = function(v){ return this._imports; }
	ImportStatement.prototype.setImports = function(v){ this._imports = v; return this; };
	
	ImportStatement.prototype.__source = {name: 'source'};
	ImportStatement.prototype.source = function(v){ return this._source; }
	ImportStatement.prototype.setSource = function(v){ this._source = v; return this; };
	
	
	
	
	ImportStatement.prototype.visit = function (){
		if (this._ns) {
			this._nsvar || (this._nsvar = this.scope__().register(this._ns,this));
		} else {
			var src = this.source().c();
			var m = src.match(/(\w+)(\.js|imba)?[\"\']$/);
			this._alias = m ? (m[1] + '$') : ('mod$');
		};
		
		// should also register the imported items, no?
		if (this._imports) {
			// p "ImportStatement has imports {@imports:cont}"
			this._declarations = new VariableDeclaration([]);
			this._moduledecl = this._declarations.add(this._alias,CALL(new Identifier("require"),[this.source()]));
			this._moduledecl.traverse();
			
			for (var i=0, ary=iter$(this._imports), len=ary.length, imp; i < len; i++) {
				imp = ary[i];this._declarations.add(imp,OP('.',this._moduledecl.variable(),imp));
			};
			
			this._declarations.traverse();
		};
		return this;
	};
	
	
	ImportStatement.prototype.js = function (o){
		var fname;
		var req = CALL(new Identifier("require"),[this.source()]);
		
		if (this._ns) {
			// must register ns as a real variable
			return ("var " + (this._nsvar.c()) + " = " + (req.c()));
		};
		
		if (this._declarations) {
			return this._declarations.c();
		} else if (this._imports) {
			
			var src = this.source().c();
			var alias = [];
			var vars = new VarBlock([]);
			
			if (fname = src.match(/(\w+)(\.js|imba)?[\"\']$/)) {
				alias.push(fname[1]);
			};
			
			// var alias = src.match(/(\w+)(\.js|imba)?[\"\']$/)
			// p "source type {source}"
			// create a require for the source, with a temporary name?
			var out = [req.cache({names: alias}).c()];
			
			for (var i=0, ary=iter$(this._imports), len=ary.length, imp; i < len; i++) {
				// we also need to register these imports as variables, no?
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
	ExportStatement.prototype.js = function (o){
		true;
		var nodes = this._value.map(function(arg) {
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
	
	Util.prototype.__args = {name: 'args'};
	Util.prototype.args = function(v){ return this._args; }
	Util.prototype.setArgs = function(v){ this._args = v; return this; };
	
	
	
	// this is how we deal with it now
	Util.extend = function (a,b){
		return new Util.Extend([a,b]);
	};
	
	Util.repeat = function (str,times){
		var res = '';
		while (times > 0){
			if (times % 2 == 1) {
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
		// p "LEN HELPER".green
		var r = new Identifier("length");
		var node = OP('.',obj,r);
		if (cache) { node.cache({force: true,pool: 'len'}) };
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
		if (cache) { node.cache({force: true,pool: 'iter'}) };
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
		// should it not rather be a variable?!?
		var node = new Num(start); // make sure it really is a number
		if (cache) { node.cache({force: true,pool: 'counter'}) };
		return node;
	};
	
	Util.array = function (size,cache){
		var node = new Util.Array([size]);
		if (cache) { node.cache({force: true,pool: 'list'}) };
		return node;
	};
	
	Util.defineTag = function (type,ctor,supr){
		return CALL(TAGDEF,[type,ctor,supr]);
	};
	
	
	Util.defineClass = function (name,supr,initor){
		return CALL(CLASSDEF,[name || initor,this.sup()]);
	};
	
	Util.prototype.js = function (o){
		return "helper";
	};
	
	
	/* @class Union */
	Util.Union = function Union(){ Util.apply(this,arguments) };
	
	subclass$(Util.Union,Util);
	Util.Union.prototype.helper = function (){
		return 'function union$(a,b){\n	if(a && a.__union) return a.__union(b);\n\n	var u = a.slice(0);\n	for(var i=0,l=b.length;i<l;i++) if(u.indexOf(b[i]) == -1) u.push(b[i]);\n	return u;\n};\n';
	};
	
	
	Util.Union.prototype.js = function (o){
		this.scope__().root().helper(this,this.helper());
		// When this is triggered, we need to add it to the top of file?
		return "union$(" + (this.args().map(function(v) {
			return v.c();
		}).join(',')) + ")";
	};
	
	
	/* @class Intersect */
	Util.Intersect = function Intersect(){ Util.apply(this,arguments) };
	
	subclass$(Util.Intersect,Util);
	Util.Intersect.prototype.helper = function (){
		return 'function intersect$(a,b){\n	if(a && a.__intersect) return a.__intersect(b);\n	var res = [];\n	for(var i=0, l=a.length; i<l; i++) {\n		var v = a[i];\n		if(b.indexOf(v) != -1) res.push(v);\n	}\n	return res;\n};\n';
	};
	
	Util.Intersect.prototype.js = function (o){
		// When this is triggered, we need to add it to the top of file?
		this.scope__().root().helper(this,this.helper());
		return "intersect$(" + (this.args().map(function(v) {
			return v.c();
		}).join(',')) + ")";
	};
	
	
	/* @class Extend */
	Util.Extend = function Extend(){ Util.apply(this,arguments) };
	
	subclass$(Util.Extend,Util);
	Util.Extend.prototype.js = function (o){
		// When this is triggered, we need to add it to the top of file?
		return "extend$(" + (compact__(cary__(this.args())).join(',')) + ")";
	};
	
	
	/* @class IndexOf */
	Util.IndexOf = function IndexOf(){ Util.apply(this,arguments) };
	
	subclass$(Util.IndexOf,Util);
	Util.IndexOf.prototype.helper = function (){
		return 'function idx$(a,b){\n	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);\n};\n';
	};
	
	
	Util.IndexOf.prototype.js = function (o){
		this.scope__().root().helper(this,this.helper());
		// When this is triggered, we need to add it to the top of file?
		return "idx$(" + (this.args().map(function(v) {
			return v.c();
		}).join(',')) + ")";
	};
	
	
	/* @class Subclass */
	Util.Subclass = function Subclass(){ Util.apply(this,arguments) };
	
	subclass$(Util.Subclass,Util);
	Util.Subclass.prototype.helper = function (){
		// should also check if it is a real promise
		return '// helper for subclassing\nfunction subclass$(obj,sup) {\n	for (var k in sup) {\n		if (sup.hasOwnProperty(k)) obj[k] = sup[k];\n	};\n	// obj.__super__ = sup;\n	obj.prototype = Object.create(sup.prototype);\n	obj.__super__ = obj.prototype.__super__ = sup.prototype;\n	obj.prototype.initialize = obj.prototype.constructor = obj;\n};\n';
	};
	
	Util.Subclass.prototype.js = function (o){
		// When this is triggered, we need to add it to the top of file?
		this.scope__().root().helper(this,this.helper());
		return "subclass$(" + (this.args().map(function(v) {
			return v.c();
		}).join(',')) + ");\n";
	};
	
	
	/* @class Promisify */
	Util.Promisify = function Promisify(){ Util.apply(this,arguments) };
	
	subclass$(Util.Promisify,Util);
	Util.Promisify.prototype.helper = function (){
		// should also check if it is a real promise
		return "function promise$(a)\{ return a instanceof Array ? Promise.all(a) : (a && a.then ? a : Promise.resolve(a)); \}";
	};
	
	Util.Promisify.prototype.js = function (o){
		// When this is triggered, we need to add it to the top of file?
		this.scope__().root().helper(this,this.helper());
		return "promise$(" + (this.args().map(function(v) {
			return v.c();
		}).join(',')) + ")";
	};
	
	
	/* @class Class */
	Util.Class = function Class(){ Util.apply(this,arguments) };
	
	subclass$(Util.Class,Util);
	Util.Class.prototype.js = function (o){
		// When this is triggered, we need to add it to the top of file?
		return "class$(" + (this.args().map(function(v) {
			return v.c();
		}).join(',')) + ")";
	};
	
	
	/* @class Iterable */
	Util.Iterable = function Iterable(){ Util.apply(this,arguments) };
	
	subclass$(Util.Iterable,Util);
	Util.Iterable.prototype.helper = function (){
		// now we want to allow null values as well - just return as empty collection
		// should be the same for for own of I guess
		return "function iter$(a)\{ return a ? (a.toArray ? a.toArray() : a) : []; \};";
	};
	
	Util.Iterable.prototype.js = function (o){
		if (this.args()[0] instanceof Arr) { return this.args()[0].c() }; // or if we know for sure that it is an array
		// only wrap if it is not clear that this is an array?
		this.scope__().root().helper(this,this.helper());
		return ("iter$(" + (this.args()[0].c()) + ")");
	};
	
	
	/* @class IsFunction */
	Util.IsFunction = function IsFunction(){ Util.apply(this,arguments) };
	
	subclass$(Util.IsFunction,Util);
	Util.IsFunction.prototype.js = function (o){
		// p "IS FUNCTION {args[0]}"
		// just plain check for now
		return "" + (this.args()[0].c());
		// "isfn$({args[0].c})"
		// "typeof {args[0].c} == 'function'"
	};
	
	
	
	/* @class Array */
	Util.Array = function Array(){ Util.apply(this,arguments) };
	
	subclass$(Util.Array,Util);
	Util.Array.prototype.js = function (o){
		// When this is triggered, we need to add it to the top of file?
		return "new Array(" + (this.args().map(function(v) {
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
		this._closure = this;
		this._virtual = false;
		this._counter = 0;
		this._varmap = {};
		this._varpool = [];
	};
	
	exports.Scope = Scope; // export class 
	
	Scope.prototype.__level = {name: 'level'};
	Scope.prototype.level = function(v){ return this._level; }
	Scope.prototype.setLevel = function(v){ this._level = v; return this; };
	
	Scope.prototype.__context = {name: 'context'};
	Scope.prototype.context = function(v){ return this._context; }
	Scope.prototype.setContext = function(v){ this._context = v; return this; };
	
	Scope.prototype.__node = {name: 'node'};
	Scope.prototype.node = function(v){ return this._node; }
	Scope.prototype.setNode = function(v){ this._node = v; return this; };
	
	Scope.prototype.__parent = {name: 'parent'};
	Scope.prototype.parent = function(v){ return this._parent; }
	Scope.prototype.setParent = function(v){ this._parent = v; return this; };
	
	Scope.prototype.__varmap = {name: 'varmap'};
	Scope.prototype.varmap = function(v){ return this._varmap; }
	Scope.prototype.setVarmap = function(v){ this._varmap = v; return this; };
	
	Scope.prototype.__varpool = {name: 'varpool'};
	Scope.prototype.varpool = function(v){ return this._varpool; }
	Scope.prototype.setVarpool = function(v){ this._varpool = v; return this; };
	
	Scope.prototype.__params = {name: 'params'};
	Scope.prototype.params = function(v){ return this._params; }
	Scope.prototype.setParams = function(v){ this._params = v; return this; };
	
	Scope.prototype.__head = {name: 'head'};
	Scope.prototype.head = function(v){ return this._head; }
	Scope.prototype.setHead = function(v){ this._head = v; return this; };
	
	Scope.prototype.__vars = {name: 'vars'};
	Scope.prototype.vars = function(v){ return this._vars; }
	Scope.prototype.setVars = function(v){ this._vars = v; return this; };
	
	Scope.prototype.__counter = {name: 'counter'};
	Scope.prototype.counter = function(v){ return this._counter; }
	Scope.prototype.setCounter = function(v){ this._counter = v; return this; };
	
	Scope.prototype.p = function (){
		if (STACK.loglevel() > 0) {
			console.log.apply(console,arguments);
		};
		return this;
	};
	
	
	
	Scope.prototype.context = function (){
		return this._context || (this._context = new ScopeContext(this));
	};
	
	Scope.prototype.traverse = function (){
		return this;
	};
	
	Scope.prototype.visit = function (){
		if (this._parent) { return this };
		// p "visited scope!"
		this._parent = STACK.scope(1); // the parent scope
		this._level = STACK.scopes().length - 1;
		
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
		while (scope){
			if (scope instanceof FileScope) { return scope };
			scope = scope.parent();
		};
		return null;
	};
	
	Scope.prototype.register = function (name,decl,o){
		
		// FIXME re-registering a variable should really return the existing one
		// Again, here we should not really have to deal with system-generated vars
		// But again, it is important
		
		// p "registering {name}"
		if(decl === undefined) decl = null;
		if(o === undefined) o = {};
		name = helpers.symbolize(name);
		
		// also look at outer scopes if this is not closed?
		var existing = this._varmap.hasOwnProperty(name) && this._varmap[name];
		if (existing) { return existing };
		
		var item = new Variable(this,name,decl,o);
		// need to check for duplicates, and handle this gracefully -
		// going to refactor later
		if (!(o.system)) { this._varmap[name] = item }; // dont even add to the varmap if it is a sysvar
		return item;
	};
	
	// just like register, but we automatically 
	Scope.prototype.declare = function (name,init,o){
		var declarator_;
		if(init === undefined) init = null;
		if(o === undefined) o = {};
		var variable = this.register(name,null,o);
		// TODO create the variabledeclaration here instead?
		var dec = this._vars.add(variable,init);
		(declarator_=variable.declarator()) || ((variable.setDeclarator(dec),dec));
		return variable;
		
		this.p(("declare variable " + name + " " + o));
		// if name isa Variable
		// p "SCOPE declare var".green
		name = helpers.symbolize(name);
		// we will see here
		this._vars.add(name,init); // .last -- 
		var decl = this._vars.last(); // bug(!)
		var item;
		// item = Variable.new(self,name,decl)
		
		// if o:system
		// 	item = SystemVariable.new(self,name,decl,o)
		// 	decl.variable = item
		// else
		item = new Variable(this,name,decl,o);
		decl.setVariable(item);
		item.resolve(); // why on earth should it resolve immediately?
		
		// decl.variable = item
		// item.resolve # why on earth should it resolve immediately?
		return item;
		
		// should be possible to force-declare for this scope, no?
		// if this is a system-variable 
	};
	
	// declares a variable (has no real declaration beforehand)
	
	
	// what are the differences here? omj
	// we only need a temporary thing with defaults -- that is all
	// change these values, no?
	Scope.prototype.temporary = function (refnode,o,name){
		
		// p "registering temporary {refnode} {name}"
		// reuse variables -- hmm
		if(o === undefined) o = {};
		if(name === undefined) name = null;
		if (o.pool) {
			for (var i=0, ary=iter$(this._varpool), len=ary.length, v; i < len; i++) {
				v = ary[i];if (v.pool() == o.pool && v.declarator() == null) {
					return v.reuse(refnode);
				};
			};
		};
		
		// should only 'register' as ahidden variable, no?
		// if there are real nodes inside that tries to refer to vars
		// defined in outer scopes, we need to make sure they are not named after this
		var item = new SystemVariable(this,name,refnode,o);
		this._varpool.push(item); // WHAT? It should not be in the pool unless explicitly put there?
		this._vars.push(item); // WARN variables should not go directly into a declaration-list
		return item;
		// return register(name || "__",null,system: yes, temporary: yes)
	};
	
	
	
	Scope.prototype.lookup = function (name){
		var ret = null;
		name = helpers.symbolize(name);
		if (this._varmap.hasOwnProperty(name)) {
			ret = this._varmap[name];
		} else {
			// look up any parent scope ?? seems okay
			// !isClosed && 
			ret = this.parent() && this.parent().lookup(name);
			// or -- not all scopes have a parent?
		};
		
		// should this not happen by itself?
		// if !ret and 
		//	ret = 
		// ret ||= (g.lookup(name) if var g = root)
		// g = root
		return ret;
	};
	
	Scope.prototype.autodeclare = function (variable){
		return this.vars().push(variable); // only if it does not exist here!!!
	};
	
	Scope.prototype.free = function (variable){
		// p "free variable"
		variable.free(); // :owner = null
		// @varpool.push(variable)
		return this;
	};
	
	Scope.prototype.isClosed = function (){
		return false;
	};
	
	Scope.prototype.closure = function (){
		return this._closure;
	};
	
	Scope.prototype.finalize = function (){
		return this;
	};
	
	Scope.prototype.klass = function (){
		var scope = this;
		while (scope){
			scope = scope.parent();
			if (scope instanceof ClassScope) { return scope };
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
		// var out = [head or null,body].flatten__.compact.join("\n")
		// out
		// out = '{' + out + 
	};
	
	Scope.prototype.region = function (){
		return this.node().body().region();
	};
	
	Scope.prototype.dump = function (){
		var self=this;
		var vars = Object.keys(this._varmap).map(function(k) {
			var v = self._varmap[k];
			return v.references().length ? (dump__(v)) : (null);
		});
		
		return {type: self.constructor.name,
		level: (self.level() || 0),
		vars: compact__(vars),
		loc: self.region()};
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
		this._head = [this._vars];
	};
	
	subclass$(FileScope,Scope);
	exports.FileScope = FileScope; // export class 
	
	FileScope.prototype.__warnings = {name: 'warnings'};
	FileScope.prototype.warnings = function(v){ return this._warnings; }
	FileScope.prototype.setWarnings = function(v){ this._warnings = v; return this; };
	
	FileScope.prototype.__scopes = {name: 'scopes'};
	FileScope.prototype.scopes = function(v){ return this._scopes; }
	FileScope.prototype.setScopes = function(v){ this._scopes = v; return this; };
	
	
	
	FileScope.prototype.context = function (){
		return this._context || (this._context = new RootScopeContext(this));
	};
	
	FileScope.prototype.lookup = function (name){
		// p "lookup filescope"
		name = helpers.symbolize(name);
		if (this._varmap.hasOwnProperty(name)) { return this._varmap[name] };
	};
	
	FileScope.prototype.visit = function (){
		STACK.addScope(this);
		return this;
	};
	
	FileScope.prototype.helper = function (typ,value){
		// log "add helper",typ,value
		if (this._helpers.indexOf(value) == -1) {
			this._helpers.push(value);
			this._head.unshift(value);
		};
		
		return this;
	};
	
	FileScope.prototype.head = function (){
		return this._head;
	};
	
	FileScope.prototype.warn = function (data){
		// hacky
		data.node = null;
		// p "warning",JSON.stringify(data)
		this._warnings.push(data);
		return this;
	};
	
	FileScope.prototype.dump = function (){
		var scopes = this._scopes.map(function(s) {
			return s.dump();
		});
		scopes.unshift(FileScope.__super__.dump.call(this));
		
		var obj = {
			warnings: dump__(this._warnings),
			scopes: scopes
		};
		
		return obj;
	};
	
	
	
	/* @class ClassScope */
	function ClassScope(){ Scope.apply(this,arguments) };
	
	subclass$(ClassScope,Scope);
	exports.ClassScope = ClassScope; // export class 
	ClassScope.prototype.virtualize = function (){
		// console.log "virtualizing ClassScope"
		var up = this.parent();
		for (var o=this._varmap, i=0, keys=Object.keys(o), l=keys.length; i < l; i++){
			true;
			o[keys[i]].resolve(up,true); // force new resolve
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
		
		// when accessing the outer context we need to make sure that it is cached
		// so this is wrong - but temp okay
		return this._context || (this._context = this.parent().context().reference(this));
	};
	
	
	/* @class FlowScope */
	function FlowScope(){ Scope.apply(this,arguments) };
	
	subclass$(FlowScope,Scope);
	exports.FlowScope = FlowScope; // export class 
	FlowScope.prototype.params = function (){
		if (this._parent) { return this._parent.params() };
	};
	
	FlowScope.prototype.register = function (name,decl,o){
		if(decl === undefined) decl = null;
		if(o === undefined) o = {};
		if (o.type != 'let') {
			// p "FlowScope register var -- do it right in the outer scope"
			return this.parent().register(name,decl,o);
		} else {
			// p "Register local variable for FlowScope {name}"
			// o:closure = parent
			// p "FlowScope register", arguments
			return FlowScope.__super__.register.call(this,name,decl,o);
		};
	};
	
	FlowScope.prototype.autodeclare = function (variable){
		return this.parent().autodeclare(variable);
	};
	
	FlowScope.prototype.closure = function (){
		// rather all the way?
		return this._parent.closure(); // this is important?
	};
	
	FlowScope.prototype.context = function (){
		// if we are wrapping in an expression - we do need to add a reference
		// @referenced = yes
		return this.parent().context();
		// usually - if the parent scope is a closed scope we dont really need
		// to force a reference
		// @context ||= parent.context.reference(self)
	};
	
	
	/* @class CatchScope */
	function CatchScope(){ FlowScope.apply(this,arguments) };
	
	subclass$(CatchScope,FlowScope);
	exports.CatchScope = CatchScope; // export class 
	
	
	/* @class WhileScope */
	function WhileScope(){ FlowScope.apply(this,arguments) };
	
	subclass$(WhileScope,FlowScope);
	exports.WhileScope = WhileScope; // export class 
	WhileScope.prototype.autodeclare = function (variable){
		return this.vars().push(variable);
	};
	
	
	/* @class ForScope */
	function ForScope(){ FlowScope.apply(this,arguments) };
	
	subclass$(ForScope,FlowScope);
	exports.ForScope = ForScope; // export class 
	ForScope.prototype.autodeclare = function (variable){
		return this.vars().push(variable);
		// parent.autodeclare(variable)
	};
	
	
	/* @class IfScope */
	function IfScope(){ FlowScope.apply(this,arguments) };
	
	subclass$(IfScope,FlowScope);
	exports.IfScope = IfScope; // export class 
	
	
	/* @class BlockScope */
	function BlockScope(){ FlowScope.apply(this,arguments) };
	
	subclass$(BlockScope,FlowScope);
	exports.BlockScope = BlockScope; // export class 
	BlockScope.prototype.region = function (){
		return this.node().region();
	};
	
	
	// lives in scope -- really a node???
	/* @class Variable */
	function Variable(scope,name,decl,o){
		this._ref = STACK._counter++;
		this._c = null;
		this._scope = scope;
		this._name = name;
		this._alias = null;
		this._initialized = true;
		this._declarator = decl;
		this._autodeclare = false;
		this._declared = o && o.declared || false;
		this._resolved = false;
		this._options = o || {};
		this._type = o && o.type || 'var'; // what about let here=
		this._export = false;
		this._references = []; // only needed when profiling
		this;
	};
	
	subclass$(Variable,Node);
	exports.Variable = Variable; // export class 
	
	Variable.prototype.__scope = {name: 'scope'};
	Variable.prototype.scope = function(v){ return this._scope; }
	Variable.prototype.setScope = function(v){ this._scope = v; return this; };
	
	Variable.prototype.__name = {name: 'name'};
	Variable.prototype.name = function(v){ return this._name; }
	Variable.prototype.setName = function(v){ this._name = v; return this; };
	
	Variable.prototype.__alias = {name: 'alias'};
	Variable.prototype.alias = function(v){ return this._alias; }
	Variable.prototype.setAlias = function(v){ this._alias = v; return this; };
	
	Variable.prototype.__type = {name: 'type'};
	Variable.prototype.type = function(v){ return this._type; }
	Variable.prototype.setType = function(v){ this._type = v; return this; };
	
	Variable.prototype.__options = {name: 'options'};
	Variable.prototype.options = function(v){ return this._options; }
	Variable.prototype.setOptions = function(v){ this._options = v; return this; };
	
	Variable.prototype.__initialized = {name: 'initialized'};
	Variable.prototype.initialized = function(v){ return this._initialized; }
	Variable.prototype.setInitialized = function(v){ this._initialized = v; return this; };
	
	Variable.prototype.__declared = {name: 'declared'};
	Variable.prototype.declared = function(v){ return this._declared; }
	Variable.prototype.setDeclared = function(v){ this._declared = v; return this; };
	
	Variable.prototype.__declarator = {name: 'declarator'};
	Variable.prototype.declarator = function(v){ return this._declarator; }
	Variable.prototype.setDeclarator = function(v){ this._declarator = v; return this; };
	
	Variable.prototype.__autodeclare = {name: 'autodeclare'};
	Variable.prototype.autodeclare = function(v){ return this._autodeclare; }
	Variable.prototype.setAutodeclare = function(v){ this._autodeclare = v; return this; };
	
	Variable.prototype.__references = {name: 'references'};
	Variable.prototype.references = function(v){ return this._references; }
	Variable.prototype.setReferences = function(v){ this._references = v; return this; };
	
	Variable.prototype.__export = {name: 'export'};
	Variable.prototype.export = function(v){ return this._export; }
	Variable.prototype.setExport = function(v){ this._export = v; return this; };
	
	Variable.prototype.pool = function (){
		return null;
	};
	
	
	
	Variable.prototype.closure = function (){
		return this._scope.closure();
	};
	
	// Here we can collect lots of type-info about variables
	// and show warnings / give advice if variables are ambiguous etc
	Variable.prototype.assigned = function (val){
		// p "Variable was assigned {val}"
		if (val instanceof Arr) {
			// just for testing really
			this._isArray = true;
		} else {
			this._isArray = false;
		};
		return this;
	};
	
	Variable.prototype.resolve = function (scope,force){
		if(scope === undefined) scope = this.scope();
		if(force === undefined) force = false;
		if (this._resolved && !force) { return this };
		
		this._resolved = true;
		var closure = this._scope.closure();
		var item = scope.lookup(this._name);
		
		// if this is a let-definition inside a virtual scope we do need
		// 
		if (this._scope != closure && this._type == 'let') { // or if it is a system-variable
			// p "scope is not the closure -- need to resolve {@name}"
			item = closure.lookup(this._name);
			
			// we now need to ensure that this variable is unique inside
			// the whole closure.
			scope = closure;
		};
		
		// p "scope is not the closure -- need to resolve {@name} {@type}"
		
		if (item == this) {
			scope.varmap()[this._name] = this;
			return this;
		} else if (item) {
			// p "variable already exists {@name}"
			
			// possibly redefine this inside, use it only in this scope
			// if the item is defined in an outer scope - we reserve the
			if (item.scope() != scope && (this.options().let || this._type == 'let')) {
				// p "override variable inside this scope {@name}"
				scope.varmap()[this._name] = this;
			};
			
			// different rules for different variables?
			if (this._options.proxy) {
				// p "is proxy -- no need to change name!!! {name}".cyan
				true;
			} else {
				var i = 0;
				var orig = this._name;
				// it is the closure that we should use
				while (scope.lookup(this._name)){
					this._name = ("" + orig + (i += 1));
				};
			};
		};
		
		// inefficient double setting
		scope.varmap()[this._name] = this;
		closure.varmap()[this._name] = this;
		return this;
		// p "resolve variable".cyan
	};
	
	Variable.prototype.reference = function (){
		return this;
	};
	
	Variable.prototype.node = function (){
		return this;
	};
	
	Variable.prototype.traverse = function (){
		// NODES.push(self)
		return this;
	};
	
	Variable.prototype.free = function (ref){
		// p "free variable!"
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
		if (this._c) { return this._c };
		// options - proxy??
		if (this._proxy) {
			// p "var is proxied!",@proxy
			this._c = this._proxy[0].c() + '[' + this._proxy[1].c() + ']';
		} else {
			if (!(this._resolved)) this.resolve();
			var v = (this.alias() || this.name());
			this._c = typeof v == 'string' ? (v) : (v.c());
			// allow certain reserved words
			// should warn on others though (!!!)
			if (RESERVED_REGEX.test(this._c)) { this._c = ("" + this.c() + "$") }; // @c.match(/^(default)$/)
		};
		return this._c;
	};
	
	// variables should probably inherit from node(!)
	Variable.prototype.consume = function (node){
		// p "variable assignify!!!"
		return this;
	};
	
	// this should only generate the accessors - not dael with references
	Variable.prototype.accessor = function (ref){
		var node = new LocalVarAccess(".",null,this); // this is just wrong .. should not be a regular accessor
		// @references.push([ref,el]) if ref # weird temp format
		return node;
	};
	
	Variable.prototype.assignment = function (val){
		return new Assign('=',this,val);
	};
	
	Variable.prototype.addReference = function (ref){
		this._references.push(ref);
		return this;
	};
	
	Variable.prototype.autodeclare = function (){
		if (this._declared) { return this };
		// p "variable should autodeclare(!) {name}"
		this._autodeclare = true;
		this.scope().autodeclare(this);
		
		// WARN
		// if scope isa WhileScope
		// 	p "should do different autodeclare!!"
		// 	# or we should simply add them
		this._declared = true;
		return this;
	};
	
	Variable.prototype.predeclared = function (){
		this._declared = true;
		return this;
	};
	
	
	Variable.prototype.toString = function (){
		return String(this.name());
	};
	
	Variable.prototype.dump = function (typ){
		var name = this.name();
		if (name[0].match(/[A-Z]/)) { return null };
		// console.log "dump variable of type {type} - {name}"
		return {
			type: this.type(),
			name: name,
			refs: dump__(this._references,typ)
		};
	};
	
	
	
	/* @class SystemVariable */
	function SystemVariable(){ Variable.apply(this,arguments) };
	
	subclass$(SystemVariable,Variable);
	exports.SystemVariable = SystemVariable; // export class 
	SystemVariable.prototype.pool = function (){
		return this._options.pool;
	};
	
	// weird name for this
	SystemVariable.prototype.predeclared = function (){
		// p "remove var from scope(!)"
		this.scope().vars().remove(this);
		return this;
	};
	
	SystemVariable.prototype.resolve = function (){
		var alias, v_;
		if (this._resolved || this._name) { return this };
		// p "RESOLVE SYSTEM VARIABLE".red
		this._resolved = true;
		// unless @name
		// adds a very random initial name
		// the auto-magical goes last, or at least, possibly reuse other names
		// "${Math.floor(Math.random * 1000)}"
		
		var typ = this._options.pool;
		var names = [].concat(this._options.names);
		var alt = null;
		var node = null;
		
		var scope = this.scope();
		
		if (typ == 'tag') {
			var i = 0;
			while (!(this._name)){
				alt = ("t" + (i++));
				if (!scope.lookup(alt)) { this._name = alt };
			};
		} else if (typ == 'iter') {
			names = ['ary__','ary_','coll','array','items','ary'];
		} else if (typ == 'val') {
			names = ['v_'];
		} else if (typ == 'arguments') {
			names = ['$_','$0'];
		} else if (typ == 'keypars') {
			names = ['opts','options','pars'];
		} else if (typ == 'counter') {
			names = ['i__','i_','k','j','i'];
		} else if (typ == 'len') {
			names = ['len__','len_','len'];
		} else if (typ == 'list') {
			names = ['tmplist_','tmplist','tmp'];
		};
		// or if type placeholder / cacher (add 0)
		
		while (!(this._name) && (alt = names.pop())){
			if (!scope.lookup(alt)) { this._name = alt };
		};
		
		if (!(this._name) && this._declarator) {
			if (node = this.declarator().node()) {
				if (alias = node.alias()) { names.push(alias + "_") };
			};
		};
		
		while (!(this._name) && (alt = names.pop())){
			if (!scope.lookup(alt)) { this._name = alt };
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
	
	ScopeContext.prototype.__scope = {name: 'scope'};
	ScopeContext.prototype.scope = function(v){ return this._scope; }
	ScopeContext.prototype.setScope = function(v){ this._scope = v; return this; };
	
	ScopeContext.prototype.__value = {name: 'value'};
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
		// p "p reference {STACK.scoping}"
		// should be a special context-variable!!!
		return this._reference || (this._reference = this.scope().declare("self",new This()));
	};
	
	ScopeContext.prototype.c = function (){
		var val = this._value || this._reference;
		return val ? (val.c()) : ("this");
	};
	
	
	/* @class RootScopeContext */
	function RootScopeContext(){ ScopeContext.apply(this,arguments) };
	
	subclass$(RootScopeContext,ScopeContext);
	exports.RootScopeContext = RootScopeContext; // export class 
	RootScopeContext.prototype.reference = function (scope){
		return this;
	};
	
	RootScopeContext.prototype.c = function (o){
		if (o && o.explicit) { return "" };
		var val = this._value || this._reference;
		return val ? (val.c()) : ("this");
		// should be the other way around, no?
		// o and o:explicit ? super : ""
	};
	
	
	/* @class Super */
	function Super(){ Node.apply(this,arguments) };
	
	subclass$(Super,Node);
	exports.Super = Super; // export class 
	Super.prototype.c = function (){
		// need to find the stuff here
		// this is really not that good8
		var m = STACK.method();
		var out = null;
		var up = STACK.current();
		var deep = (up instanceof Access);
		
		// TODO optimization for later - problematic if there is a different reference in the end
		if (false && m && m.type() == 'constructor') {
			out = ("" + (m.target().c()) + ".superclass");
			if (!deep) { out += (".apply(" + (m.scope().context().c()) + ",arguments)") };
		} else {
			out = ("" + (m.target().c()) + ".__super__");
			if (!((up instanceof Access))) {
				out += ("." + (c__(m.supername())));
				if (!((up instanceof Call))) { // autocall?
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
	module.exports.UNDEFINED = UNDEFINED = new Undefined();
	module.exports.NIL = NIL = new Nil();
	
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
},{"./helpers":4,"./token":10}],8:[function(require,module,exports){
(function (process){
/* parser generated by jison-fork */
var parser = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,5],$V1=[1,31],$V2=[1,32],$V3=[1,33],$V4=[1,34],$V5=[1,74],$V6=[1,114],$V7=[1,126],$V8=[1,119],$V9=[1,120],$Va=[1,121],$Vb=[1,118],$Vc=[1,122],$Vd=[1,127],$Ve=[1,113],$Vf=[1,79],$Vg=[1,80],$Vh=[1,81],$Vi=[1,82],$Vj=[1,83],$Vk=[1,84],$Vl=[1,85],$Vm=[1,72],$Vn=[1,116],$Vo=[1,94],$Vp=[1,90],$Vq=[1,87],$Vr=[1,70],$Vs=[1,64],$Vt=[1,110],$Vu=[1,89],$Vv=[1,86],$Vw=[1,27],$Vx=[1,28],$Vy=[1,95],$Vz=[1,93],$VA=[1,111],$VB=[1,112],$VC=[1,124],$VD=[1,66],$VE=[1,67],$VF=[1,117],$VG=[1,10],$VH=[1,125],$VI=[1,77],$VJ=[1,36],$VK=[1,42],$VL=[1,65],$VM=[1,109],$VN=[1,68],$VO=[1,88],$VP=[1,123],$VQ=[1,58],$VR=[1,73],$VS=[1,104],$VT=[1,105],$VU=[1,106],$VV=[1,107],$VW=[1,62],$VX=[1,103],$VY=[1,50],$VZ=[1,51],$V_=[1,52],$V$=[1,53],$V01=[1,54],$V11=[1,55],$V21=[1,129],$V31=[1,6,10,127],$V41=[1,131],$V51=[1,6,10,13,127],$V61=[1,140],$V71=[1,141],$V81=[1,143],$V91=[1,135],$Va1=[1,137],$Vb1=[1,136],$Vc1=[1,138],$Vd1=[1,139],$Ve1=[1,142],$Vf1=[1,146],$Vg1=[1,6,9,10,13,21,82,89,98,103,115,125,127,137,161,190,191,202,203,204,209,217,226,227,230,231,234,235,236],$Vh1=[2,254],$Vi1=[1,153],$Vj1=[1,158],$Vk1=[1,156],$Vl1=[1,155],$Vm1=[1,159],$Vn1=[1,157],$Vo1=[1,6,9,10,13,21,82,89,127],$Vp1=[1,6,10,13,127,202,204,209,226],$Vq1=[1,6,9,10,13,20,21,80,81,82,89,98,102,103,115,125,127,134,137,161,170,172,186,190,191,202,203,204,209,217,226,227,230,231,234,235,236],$Vr1=[2,222],$Vs1=[1,172],$Vt1=[1,170],$Vu1=[1,6,9,10,13,20,21,80,81,82,89,98,102,103,107,115,125,127,134,137,161,170,172,186,190,191,202,203,204,209,217,226,227,230,231,234,235,236],$Vv1=[2,218],$Vw1=[6,13,52,53,80,83,98,102,106],$Vx1=[1,204],$Vy1=[1,209],$Vz1=[1,6,9,10,13,20,21,80,81,82,89,98,102,103,107,115,125,127,134,137,161,170,172,186,190,191,202,203,204,209,217,226,227,230,231,232,233,234,235,236,237],$VA1=[1,219],$VB1=[1,216],$VC1=[1,221],$VD1=[6,9,13,82],$VE1=[2,235],$VF1=[1,249],$VG1=[1,239],$VH1=[1,268],$VI1=[1,269],$VJ1=[50,81],$VK1=[77,78,79,80,83,84,85,86,87,88,92,94],$VL1=[1,277],$VM1=[1,6,9,10,13,20,21,52,53,80,81,82,83,89,98,102,103,106,107,115,125,127,134,137,161,170,172,186,190,191,202,203,204,209,217,226,227,230,231,232,233,234,235,236,237],$VN1=[1,283],$VO1=[1,6,9,10,13,20,21,80,81,82,89,98,102,103,115,125,127,134,137,161,170,172,186,190,191,197,198,202,203,204,209,217,220,222,225,226,227,230,231,234,235,236],$VP1=[50,52,53,57],$VQ1=[1,313],$VR1=[1,314],$VS1=[1,6,9,10,13,21,82,89,98,103,125,127,137,190,191,202,203,204,209,217,226],$VT1=[1,327],$VU1=[1,331],$VV1=[1,6,10,13,21,82,89,98,103,115,125,127,137,161,190,191,202,203,204,209,217,226,227,230,231,234,235,236],$VW1=[6,13,98],$VX1=[1,340],$VY1=[1,6,9,10,13,20,21,81,82,89,98,103,115,125,127,137,161,190,191,202,203,204,209,217,226,227,230,231,234,235,236],$VZ1=[13,27],$V_1=[1,6,10,13,27,127,202,204,209,226],$V$1=[2,275],$V02=[1,6,9,10,13,20,21,80,81,82,89,98,102,103,107,115,125,127,134,137,161,170,172,186,190,191,202,203,204,209,215,216,217,226,227,230,231,232,233,234,235,236,237],$V12=[2,176],$V22=[1,355],$V32=[6,9,10,13,21,89],$V42=[13,137],$V52=[2,178],$V62=[1,365],$V72=[1,366],$V82=[1,367],$V92=[1,371],$Va2=[6,9,10,13,82],$Vb2=[6,9,10,13,82,125],$Vc2=[1,6,9,10,13,21,82,89,98,103,125,127,137,190,191,217,226],$Vd2=[1,6,9,10,13,21,82,89,98,103,125,127,137,190,191,203,217,226],$Ve2=[215,216],$Vf2=[13,215,216],$Vg2=[1,6,10,13,21,82,89,98,103,125,127,137,161,190,191,202,203,204,209,217,226,227,230,231,234,235,236],$Vh2=[80,83],$Vi2=[20,80,83,152,154],$Vj2=[1,6,9,10,13,21,82,89,98,103,115,125,127,137,161,190,191,202,203,204,209,217,226,227,230,231,235,236],$Vk2=[1,6,9,10,13,21,82,89,98,103,125,127,137,190,191,203,217],$Vl2=[18,19,22,23,25,31,50,52,53,55,57,59,61,63,65,66,67,68,69,70,71,72,75,81,83,88,95,103,112,113,120,126,133,134,141,142,144,146,147,148,165,173,174,177,182,183,184,187,188,194,200,202,204,206,209,218,224,228,229,230,231,232,233],$Vm2=[1,6,9,10,13,21,82,89,98,103,115,125,127,137,161,190,191,202,203,204,209,217,220,225,226,227,230,231,234,235,236],$Vn2=[10,220,222],$Vo2=[1,435],$Vp2=[2,177],$Vq2=[6,9,10],$Vr2=[1,443],$Vs2=[13,21,137],$Vt2=[1,451],$Vu2=[1,6,9,10,13,21,82,89,98,103,125,127,137,190,191,202,204,209,217,226],$Vv2=[50,57,81],$Vw2=[13,21],$Vx2=[1,475],$Vy2=[9,13],$Vz2=[1,525],$VA2=[6,9];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"Root":3,"Body":4,"Block":5,"TERMINATOR":6,"Line":7,"Terminator":8,"INDENT":9,"OUTDENT":10,"Splat":11,"Expression":12,",":13,"Comment":14,"Statement":15,"Return":16,"Throw":17,"STATEMENT":18,"BREAK":19,"CALL_START":20,"CALL_END":21,"CONTINUE":22,"DEBUGGER":23,"ImportStatement":24,"IMPORT":25,"ImportArgList":26,"FROM":27,"ImportFrom":28,"AS":29,"ImportArg":30,"STRING":31,"VarIdentifier":32,"Await":33,"Value":34,"Code":35,"Operation":36,"Assign":37,"If":38,"Ternary":39,"Try":40,"While":41,"For":42,"Switch":43,"Class":44,"Module":45,"TagDeclaration":46,"Tag":47,"Property":48,"Identifier":49,"IDENTIFIER":50,"Ivar":51,"IVAR":52,"CVAR":53,"Gvar":54,"GVAR":55,"Const":56,"CONST":57,"Argvar":58,"ARGVAR":59,"Symbol":60,"SYMBOL":61,"AlphaNumeric":62,"NUMBER":63,"Literal":64,"JS":65,"REGEX":66,"BOOL":67,"TRUE":68,"FALSE":69,"NULL":70,"UNDEFINED":71,"RETURN":72,"Arguments":73,"TagSelector":74,"SELECTOR_START":75,"TagSelectorType":76,"SELECTOR_NS":77,"SELECTOR_ID":78,"SELECTOR_CLASS":79,".":80,"{":81,"}":82,"#":83,"SELECTOR_COMBINATOR":84,"SELECTOR_PSEUDO_CLASS":85,"SELECTOR_GROUP":86,"UNIVERSAL_SELECTOR":87,"[":88,"]":89,"SELECTOR_ATTR_OP":90,"TagSelectorAttrValue":91,"SELECTOR_TAG":92,"Selector":93,"SELECTOR_END":94,"TAG_START":95,"TagOptions":96,"TagAttributes":97,"TAG_END":98,"TagBody":99,"TagTypeName":100,"Self":101,"INDEX_START":102,"INDEX_END":103,"TagAttr":104,"OptComma":105,"TAG_ATTR":106,"=":107,"TagAttrValue":108,"ArgList":109,"TagTypeDef":110,"TagDeclarationBlock":111,"EXTEND":112,"TAG":113,"TagType":114,"COMPARE":115,"TagDeclKeywords":116,"TAG_TYPE":117,"TAG_ID":118,"TagId":119,"IDREF":120,"Assignable":121,"Outdent":122,"AssignObj":123,"ObjAssignable":124,":":125,"(":126,")":127,"HERECOMMENT":128,"COMMENT":129,"Method":130,"Do":131,"Begin":132,"BEGIN":133,"DO":134,"BLOCK_PARAM_START":135,"ParamList":136,"BLOCK_PARAM_END":137,"PropType":138,"PropertyIdentifier":139,"Object":140,"PROP":141,"ATTR":142,"TupleAssign":143,"VAR":144,"MethodDeclaration":145,"GLOBAL":146,"EXPORT":147,"DEF":148,"MethodScope":149,"MethodScopeType":150,"MethodIdentifier":151,"DEF_BODY":152,"MethodBody":153,"DEF_FRAGMENT":154,"MethodReceiver":155,"This":156,"Param":157,"Array":158,"ParamVar":159,"SPLAT":160,"LOGIC":161,"BLOCK_ARG":162,"VarReference":163,"VarAssignable":164,"LET":165,"SimpleAssignable":166,"NEW":167,"Super":168,"SoakableOp":169,"?:":170,"IndexValue":171,"?.":172,"SUPER":173,"AWAIT":174,"Parenthetical":175,"Range":176,"ARGUMENTS":177,"Invocation":178,"Slice":179,"AssignList":180,"ClassStart":181,"LOCAL":182,"CLASS":183,"MODULE":184,"OptFuncExist":185,"FUNC_EXIST":186,"THIS":187,"SELF":188,"RangeDots":189,"..":190,"...":191,"Arg":192,"SimpleArgs":193,"TRY":194,"Catch":195,"Finally":196,"FINALLY":197,"CATCH":198,"CATCH_VAR":199,"THROW":200,"WhileSource":201,"WHILE":202,"WHEN":203,"UNTIL":204,"Loop":205,"LOOP":206,"ForBody":207,"ForBlock":208,"FOR":209,"ForStart":210,"ForSource":211,"ForVariables":212,"OWN":213,"ForValue":214,"FORIN":215,"FOROF":216,"BY":217,"SWITCH":218,"Whens":219,"ELSE":220,"When":221,"LEADING_WHEN":222,"IfBlock":223,"IF":224,"ELIF":225,"POST_IF":226,"?":227,"UNARY":228,"SQRT":229,"-":230,"+":231,"--":232,"++":233,"MATH":234,"SHIFT":235,"RELATION":236,"COMPOUND_ASSIGN":237,"$accept":0,"$end":1},
terminals_: {2:"error",6:"TERMINATOR",9:"INDENT",10:"OUTDENT",13:",",18:"STATEMENT",19:"BREAK",20:"CALL_START",21:"CALL_END",22:"CONTINUE",23:"DEBUGGER",25:"IMPORT",27:"FROM",29:"AS",31:"STRING",50:"IDENTIFIER",52:"IVAR",53:"CVAR",55:"GVAR",57:"CONST",59:"ARGVAR",61:"SYMBOL",63:"NUMBER",65:"JS",66:"REGEX",67:"BOOL",68:"TRUE",69:"FALSE",70:"NULL",71:"UNDEFINED",72:"RETURN",75:"SELECTOR_START",77:"SELECTOR_NS",78:"SELECTOR_ID",79:"SELECTOR_CLASS",80:".",81:"{",82:"}",83:"#",84:"SELECTOR_COMBINATOR",85:"SELECTOR_PSEUDO_CLASS",86:"SELECTOR_GROUP",87:"UNIVERSAL_SELECTOR",88:"[",89:"]",90:"SELECTOR_ATTR_OP",92:"SELECTOR_TAG",94:"SELECTOR_END",95:"TAG_START",98:"TAG_END",102:"INDEX_START",103:"INDEX_END",106:"TAG_ATTR",107:"=",112:"EXTEND",113:"TAG",115:"COMPARE",117:"TAG_TYPE",118:"TAG_ID",120:"IDREF",125:":",126:"(",127:")",128:"HERECOMMENT",129:"COMMENT",133:"BEGIN",134:"DO",135:"BLOCK_PARAM_START",137:"BLOCK_PARAM_END",141:"PROP",142:"ATTR",144:"VAR",146:"GLOBAL",147:"EXPORT",148:"DEF",152:"DEF_BODY",154:"DEF_FRAGMENT",160:"SPLAT",161:"LOGIC",162:"BLOCK_ARG",165:"LET",167:"NEW",170:"?:",172:"?.",173:"SUPER",174:"AWAIT",177:"ARGUMENTS",182:"LOCAL",183:"CLASS",184:"MODULE",186:"FUNC_EXIST",187:"THIS",188:"SELF",190:"..",191:"...",194:"TRY",197:"FINALLY",198:"CATCH",199:"CATCH_VAR",200:"THROW",202:"WHILE",203:"WHEN",204:"UNTIL",206:"LOOP",209:"FOR",213:"OWN",215:"FORIN",216:"FOROF",217:"BY",218:"SWITCH",220:"ELSE",222:"LEADING_WHEN",224:"IF",225:"ELIF",226:"POST_IF",227:"?",228:"UNARY",229:"SQRT",230:"-",231:"+",232:"--",233:"++",234:"MATH",235:"SHIFT",236:"RELATION",237:"COMPOUND_ASSIGN"},
productions_: [0,[3,0],[3,1],[3,2],[4,1],[4,3],[4,2],[8,1],[5,2],[5,3],[5,4],[7,1],[7,1],[7,3],[7,3],[7,1],[7,1],[15,1],[15,1],[15,1],[15,1],[15,4],[15,1],[15,4],[15,1],[15,1],[24,4],[24,4],[24,2],[28,1],[26,1],[26,3],[30,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[49,1],[51,1],[51,1],[54,1],[56,1],[58,1],[60,1],[62,1],[62,1],[62,1],[64,1],[64,1],[64,1],[64,1],[64,1],[64,1],[64,1],[64,1],[16,2],[16,2],[16,1],[74,1],[74,2],[74,2],[74,2],[74,2],[74,5],[74,5],[74,2],[74,2],[74,2],[74,2],[74,4],[74,6],[76,1],[93,2],[91,1],[91,1],[91,3],[47,4],[47,5],[47,5],[100,1],[100,1],[100,0],[96,1],[96,3],[96,4],[96,3],[96,5],[96,3],[96,2],[96,5],[97,0],[97,1],[97,3],[97,4],[104,1],[104,3],[108,1],[99,3],[99,3],[110,1],[110,3],[46,1],[46,2],[111,2],[111,3],[111,4],[111,5],[116,0],[116,1],[114,1],[114,1],[119,1],[119,2],[37,3],[37,5],[123,1],[123,3],[123,5],[123,1],[124,1],[124,1],[124,1],[124,1],[124,1],[124,3],[14,1],[14,1],[35,1],[35,1],[35,1],[132,2],[131,2],[131,5],[131,6],[48,3],[48,5],[48,2],[138,1],[138,1],[139,1],[139,3],[143,4],[130,1],[130,2],[130,2],[145,9],[145,6],[145,7],[145,4],[145,9],[145,6],[145,7],[145,4],[150,1],[150,1],[151,1],[151,1],[151,3],[153,1],[153,1],[149,1],[149,1],[149,1],[149,1],[105,0],[105,1],[136,0],[136,1],[136,3],[157,1],[157,1],[157,1],[157,2],[157,2],[157,2],[157,3],[159,1],[11,2],[163,3],[163,2],[163,2],[163,3],[163,2],[32,1],[32,1],[164,1],[164,1],[164,1],[166,1],[166,1],[166,1],[166,1],[166,1],[166,1],[166,1],[166,3],[166,3],[166,3],[166,3],[166,3],[166,3],[166,3],[166,4],[169,1],[169,1],[168,1],[121,1],[121,1],[121,1],[33,2],[34,1],[34,1],[34,1],[34,1],[34,1],[34,1],[34,1],[34,1],[34,1],[34,1],[171,1],[171,1],[140,4],[180,0],[180,1],[180,3],[180,4],[180,6],[44,1],[44,2],[44,2],[44,2],[44,2],[44,3],[181,2],[181,3],[181,4],[181,5],[45,2],[45,3],[178,3],[178,2],[185,0],[185,1],[73,2],[73,4],[156,1],[101,1],[158,2],[158,4],[189,1],[189,1],[176,5],[179,3],[179,2],[179,2],[109,1],[109,3],[109,4],[109,4],[109,6],[122,2],[122,1],[192,1],[192,1],[192,1],[192,1],[193,1],[193,3],[40,2],[40,3],[40,3],[40,4],[196,2],[195,3],[17,2],[175,3],[175,5],[201,2],[201,4],[201,2],[201,4],[41,2],[41,2],[41,2],[41,1],[205,2],[205,2],[42,2],[42,2],[42,2],[208,2],[207,2],[207,2],[210,2],[210,3],[214,1],[214,1],[214,1],[212,1],[212,3],[211,2],[211,2],[211,4],[211,4],[211,4],[211,6],[211,6],[43,5],[43,7],[43,4],[43,6],[219,1],[219,2],[221,3],[221,4],[223,3],[223,5],[223,4],[223,3],[38,1],[38,3],[38,3],[39,5],[36,2],[36,2],[36,2],[36,2],[36,2],[36,2],[36,2],[36,2],[36,2],[36,3],[36,3],[36,3],[36,3],[36,3],[36,3],[36,3],[36,3],[36,5]],
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
self.$ = new yy.Block([$$[$0]]);
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
case 9: case 109:
self.$ = $$[$0-1].indented($$[$0-2],$$[$0]);
break;
case 10:
self.$ = $$[$0-1].prebreak($$[$0-2]).indented($$[$0-3],$$[$0]);
break;
case 11: case 12: case 15: case 16: case 17: case 18: case 25: case 29: case 32: case 33: case 34: case 35: case 36: case 37: case 38: case 39: case 40: case 41: case 42: case 43: case 44: case 45: case 46: case 47: case 48: case 58: case 59: case 85: case 86: case 91: case 108: case 113: case 119: case 130: case 131: case 132: case 133: case 134: case 135: case 139: case 140: case 141: case 149: case 150: case 151: case 154: case 167: case 168: case 170: case 172: case 173: case 174: case 175: case 176: case 177: case 188: case 195: case 196: case 197: case 198: case 199: case 200: case 202: case 203: case 204: case 205: case 218: case 219: case 220: case 222: case 223: case 224: case 225: case 226: case 228: case 229: case 230: case 231: case 240: case 274: case 275: case 276: case 277: case 278: case 279: case 297: case 306: case 308: case 324: case 332:
self.$ = $$[$0];
break;
case 13: case 14:
self.$ = $$[$0-2].addExpression($$[$0]);
break;
case 19: case 60:
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
case 30: case 103: case 179: case 311:
self.$ = [$$[$0]];
break;
case 31: case 104: case 180:
self.$ = $$[$0-2].concat($$[$0]);
break;
case 49:
self.$ = new yy.Identifier($$[$0]);
break;
case 50: case 51:
self.$ = new yy.Ivar($$[$0]);
break;
case 52:
self.$ = new yy.Gvar($$[$0]);
break;
case 53:
self.$ = new yy.Const($$[$0]);
break;
case 54:
self.$ = new yy.Argvar($$[$0]);
break;
case 55:
self.$ = new yy.Symbol($$[$0]);
break;
case 56:
self.$ = new yy.Num($$[$0]);
break;
case 57:
self.$ = new yy.Str($$[$0]);
break;
case 61:
self.$ = new yy.RegExp($$[$0]);
break;
case 62:
self.$ = new yy.Bool($$[$0]);
break;
case 63:
self.$ = yy.TRUE;
break;
case 64:
self.$ = yy.FALSE;
break;
case 65:
self.$ = yy.NIL;
break;
case 66:
self.$ = yy.UNDEFINED;
break;
case 67: case 68:
self.$ = new yy.Return($$[$0]);
break;
case 69:
self.$ = new yy.Return();
break;
case 70:
self.$ = new yy.Selector([],{type: $$[$0]});
break;
case 71:
self.$ = $$[$0-1].add(new yy.SelectorType($$[$0]),'tag');
break;
case 72:
self.$ = $$[$0-1].add(new yy.SelectorNamespace($$[$0]),'ns');
break;
case 73:
self.$ = $$[$0-1].add(new yy.SelectorId($$[$0]),'id');
break;
case 74:
self.$ = $$[$0-1].add(new yy.SelectorClass($$[$0]),'class');
break;
case 75:
self.$ = $$[$0-4].add(new yy.SelectorClass($$[$0-1]),'class');
break;
case 76:
self.$ = $$[$0-4].add(new yy.SelectorId($$[$0-1]),'id');
break;
case 77:
self.$ = $$[$0-1].add(new yy.SelectorCombinator($$[$0]),'sep');
break;
case 78:
self.$ = $$[$0-1].add(new yy.SelectorPseudoClass($$[$0]),'pseudoclass');
break;
case 79:
self.$ = $$[$0-1].group();
break;
case 80:
self.$ = $$[$0-1].add(new yy.SelectorUniversal($$[$0]),'universal');
break;
case 81:
self.$ = $$[$0-3].add(new yy.SelectorAttribute($$[$0-1]),'attr');
break;
case 82:
self.$ = $$[$0-5].add(new yy.SelectorAttribute($$[$0-3],$$[$0-2],$$[$0-1]),'attr');
break;
case 83: case 92: case 121: case 122:
self.$ = new yy.TagTypeIdentifier($$[$0]);
break;
case 84: case 87: case 110: case 136: case 152: case 169: case 273:
self.$ = $$[$0-1];
break;
case 88:
self.$ = $$[$0-2].set({attributes: $$[$0-1],open: $$[$0-3],close: $$[$0]});
break;
case 89:
self.$ = $$[$0-3].set({attributes: $$[$0-2],body: $$[$0],open: $$[$0-4],close: $$[$0-1]});
break;
case 90:
self.$ = new yy.TagWrapper($$[$0-2],$$[$0-4],$$[$0]);
break;
case 93:
self.$ = new yy.TagTypeIdentifier('div');
break;
case 94:
self.$ = new yy.Tag({type: $$[$0]});
break;
case 95:
self.$ = $$[$0-2].addSymbol($$[$0]);
break;
case 96:
self.$ = $$[$0-3].addIndex($$[$0-1]);
break;
case 97:
self.$ = $$[$0-2].addClass($$[$0]);
break;
case 98:
self.$ = $$[$0-4].addClass($$[$0-1]);
break;
case 99:
self.$ = $$[$0-2].set({id: $$[$0]});
break;
case 100:
self.$ = $$[$0-1].set({ivar: $$[$0]});
break;
case 101:
self.$ = $$[$0-4].set({id: $$[$0-1]});
break;
case 102: case 178:
self.$ = [];
break;
case 105:
self.$ = $$[$0-3].concat($$[$0]);
break;
case 106:
self.$ = new yy.TagAttr($$[$0],$$[$0]);
break;
case 107:
self.$ = new yy.TagAttr($$[$0-2],$$[$0]);
break;
case 111:
self.$ = new yy.TagDesc($$[$0]);
break;
case 112:
self.$ = $$[$0-2].classes($$[$0]);
break;
case 114:
self.$ = $$[$0].set({extension: true});
break;
case 115:
self.$ = new yy.TagDeclaration($$[$0]);
break;
case 116:
self.$ = new yy.TagDeclaration($$[$0-1],null,$$[$0]);
break;
case 117:
self.$ = new yy.TagDeclaration($$[$0-2],$$[$0]);
break;
case 118:
self.$ = new yy.TagDeclaration($$[$0-3],$$[$0-1],$$[$0]);
break;
case 120:
self.$ = ['yy.extend'];
break;
case 123: case 124:
self.$ = new yy.TagId($$[$0]);
break;
case 125:
self.$ = new yy.Assign("=",$$[$0-2],$$[$0]);
break;
case 126:
self.$ = new yy.Assign("=",$$[$0-4],$$[$0-1].indented($$[$0-2],$$[$0]));
break;
case 127:
self.$ = new yy.ObjAttr($$[$0]);
break;
case 128:
self.$ = new yy.ObjAttr($$[$0-2],$$[$0],'object');
break;
case 129:
self.$ = new yy.ObjAttr($$[$0-4],$$[$0-1].indented($$[$0-2],$$[$0]),'object');
break;
case 137:
self.$ = new yy.Comment($$[$0],true);
break;
case 138:
self.$ = new yy.Comment($$[$0],false);
break;
case 142:
self.$ = new yy.Begin($$[$0]);
break;
case 143:
self.$ = new yy.Lambda([],$$[$0],null,null,{bound: true});
break;
case 144:
self.$ = new yy.Lambda($$[$0-2],$$[$0],null,null,{bound: true});
break;
case 145:
self.$ = new yy.Lambda($$[$0-3],$$[$0-1],null,null,{bound: true});
break;
case 146:
self.$ = new yy.PropertyDeclaration($$[$0-1],$$[$0],$$[$0-2]);
break;
case 147:
self.$ = new yy.PropertyDeclaration($$[$0-3],$$[$0-1],$$[$0-4]);
break;
case 148:
self.$ = new yy.PropertyDeclaration($$[$0],null,$$[$0-1]);
break;
case 153:
self.$ = $$[$0-3];
break;
case 155: case 243:
self.$ = $$[$0].set({global: $$[$0-1]});
break;
case 156: case 194: case 244:
self.$ = $$[$0].set({export: $$[$0-1]});
break;
case 157:
self.$ = new yy.MethodDeclaration($$[$0-3],$$[$0],$$[$0-5],$$[$0-7],$$[$0-6]);
break;
case 158:
self.$ = new yy.MethodDeclaration([],$$[$0],$$[$0-2],$$[$0-4],$$[$0-3]);
break;
case 159:
self.$ = new yy.MethodDeclaration($$[$0-3],$$[$0],$$[$0-5],null);
break;
case 160:
self.$ = new yy.MethodDeclaration([],$$[$0],$$[$0-2],null);
break;
case 161:
self.$ = new yy.MethodDeclaration($$[$0-3],$$[$0],$$[$0-5],$$[$0-7],$$[$0-6]).set({greedy: true});
break;
case 162:
self.$ = new yy.MethodDeclaration([],$$[$0],$$[$0-2],$$[$0-4],$$[$0-3]).set({greedy: true});
break;
case 163:
self.$ = new yy.MethodDeclaration($$[$0-3],$$[$0],$$[$0-5],null).set({greedy: true});
break;
case 164:
self.$ = new yy.MethodDeclaration([],$$[$0],$$[$0-2],null).set({greedy: true});
break;
case 165:
self.$ = {static: true};
break;
case 166:
self.$ = {};
break;
case 171:
self.$ = $$[$0].body();
break;
case 181:
self.$ = new yy.NamedParams($$[$0]);
break;
case 182:
self.$ = new yy.ArrayParams($$[$0]);
break;
case 183:
self.$ = new yy.RequiredParam($$[$0]);
break;
case 184:
self.$ = new yy.SplatParam($$[$0],null,$$[$0-1]);
break;
case 185: case 186:
self.$ = new yy.BlockParam($$[$0],null,$$[$0-1]);
break;
case 187:
self.$ = new yy.OptionalParam($$[$0-2],$$[$0],$$[$0-1]);
break;
case 189:
self.$ = yy.SPLAT($$[$0]);
break;
case 190: case 193:
self.$ = yy.SPLAT(new yy.VarReference($$[$0],$$[$0-2]),$$[$0-1]);
break;
case 191: case 192:
self.$ = new yy.VarReference($$[$0],$$[$0-1]);
break;
case 201:
self.$ = new yy.IvarAccess('.',null,$$[$0]);
break;
case 206:
self.$ = new yy.VarOrAccess($$[$0]);
break;
case 207:
self.$ = new yy.New($$[$0-2]);
break;
case 208:
self.$ = new yy.SuperAccess('.',$$[$0-2],$$[$0]);
break;
case 209:
self.$ = new yy.PropertyAccess($$[$0-1],$$[$0-2],$$[$0]);
break;
case 210: case 211: case 213:
self.$ = new yy.Access($$[$0-1],$$[$0-2],$$[$0]);
break;
case 212:
self.$ = new yy.Access('.',$$[$0-2],new yy.Identifier($$[$0].value()));
break;
case 214:
self.$ = new yy.IndexAccess('.',$$[$0-3],$$[$0-1]);
break;
case 217:
self.$ = yy.SUPER;
break;
case 221:
self.$ = new yy.Await($$[$0]);
break;
case 227:
self.$ = yy.ARGUMENTS;
break;
case 232:
self.$ = new yy.Index($$[$0]);
break;
case 233:
self.$ = new yy.Slice($$[$0]);
break;
case 234:
self.$ = new yy.Obj($$[$0-2],$$[$0-3].generated);
break;
case 235:
self.$ = new yy.AssignList([]);
break;
case 236:
self.$ = new yy.AssignList([$$[$0]]);
break;
case 237: case 269:
self.$ = $$[$0-2].add($$[$0]);
break;
case 238: case 270:
self.$ = $$[$0-3].add($$[$0-1]).add($$[$0]);
break;
case 239:
self.$ = $$[$0-5].concat($$[$0-2].indented($$[$0-3],$$[$0]));
break;
case 241:
self.$ = $$[$0].set({extension: $$[$0-1]});
break;
case 242:
self.$ = $$[$0].set({local: $$[$0-1]});
break;
case 245:
self.$ = $$[$0].set({export: $$[$0-2],local: $$[$0-1]});
break;
case 246:
self.$ = new yy.ClassDeclaration($$[$0],null,[]);
break;
case 247:
self.$ = new yy.ClassDeclaration($$[$0-1],null,$$[$0]);
break;
case 248:
self.$ = new yy.ClassDeclaration($$[$0-2],$$[$0],[]);
break;
case 249:
self.$ = new yy.ClassDeclaration($$[$0-3],$$[$0-1],$$[$0]);
break;
case 250:
self.$ = new yy.Module($$[$0]);
break;
case 251:
self.$ = new yy.Module($$[$0-1],null,$$[$0]);
break;
case 252:
self.$ = new yy.Call($$[$0-2],$$[$0],$$[$0-1]);
break;
case 253:
self.$ = $$[$0-1].addBlock($$[$0]);
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
self.$ = ($$[$0].own = true) && $$[$0];
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
case 333:
self.$ = new yy.If($$[$0],new yy.Block([$$[$0-2]]),{type: $$[$0-1],statement: true});
break;
case 334:
self.$ = new yy.If($$[$0],new yy.Block([$$[$0-2]]),{type: $$[$0-1]});
break;
case 335:
self.$ = yy.If.ternary($$[$0-4],$$[$0-2],$$[$0]);
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
self.$ = (function () {
				if ($$[$0-1].charAt(0) == '!') {
					return yy.OP($$[$0-1].slice(1),$$[$0-2],$$[$0]).invert(); // hmm, really?
				} else {
					return yy.OP($$[$0-1],$$[$0-2],$$[$0]);
				};
			}());
break;
case 352:
self.$ = yy.OP_COMPOUND($$[$0-1]._value,$$[$0-1],$$[$0-2],$$[$0]);
break;
case 353:
self.$ = yy.OP_COMPOUND($$[$0-3]._value,$$[$0-4],$$[$0-1].indented($$[$0-2],$$[$0]));
break;
}
},
table: [{1:[2,1],3:1,4:2,5:3,7:4,9:$V0,11:6,12:7,14:8,15:9,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,128:$Vw,129:$Vx,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,160:$VG,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{1:[3]},{1:[2,2],6:$V21,8:128},{6:[1,130]},o($V31,[2,4],{13:$V41}),{4:133,6:[1,134],7:4,10:[1,132],11:6,12:7,14:8,15:9,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,128:$Vw,129:$Vx,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,160:$VG,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($V51,[2,11]),o($V51,[2,12],{210:108,201:144,207:145,115:$V61,161:$V71,202:$VS,204:$VT,209:$VV,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),o($V51,[2,15]),o($V51,[2,16],{210:108,201:147,207:148,202:$VS,204:$VT,209:$VV,226:$Vf1}),{12:149,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($Vg1,[2,33]),o($Vg1,[2,34],{185:151,131:152,169:154,20:$Vh1,80:$Vi1,81:$Vj1,102:$Vk1,134:$Vz,170:$Vl1,172:$Vm1,186:$Vn1}),o($Vg1,[2,35]),o($Vg1,[2,36]),o($Vg1,[2,37]),o($Vg1,[2,38]),o($Vg1,[2,39]),o($Vg1,[2,40]),o($Vg1,[2,41]),o($Vg1,[2,42]),o($Vg1,[2,43]),o($Vg1,[2,44]),o($Vg1,[2,45]),o($Vg1,[2,46]),o($Vg1,[2,47]),o($Vg1,[2,48]),o($Vo1,[2,137]),o($Vo1,[2,138]),o($Vp1,[2,17]),o($Vp1,[2,18]),o($Vp1,[2,19]),o($Vp1,[2,20],{20:[1,160]}),o($Vp1,[2,22],{20:[1,161]}),o($Vp1,[2,24]),o($Vp1,[2,25]),{12:162,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($Vq1,$Vr1,{107:[1,163]}),o($Vq1,[2,223]),o($Vq1,[2,224]),o($Vq1,[2,225]),o($Vq1,[2,226]),o($Vq1,[2,227]),o($Vq1,[2,228]),o($Vq1,[2,229]),o($Vq1,[2,230]),o($Vq1,[2,231]),o($Vg1,[2,139]),o($Vg1,[2,140]),o($Vg1,[2,141]),{12:164,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{12:165,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{12:166,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{12:167,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{31:$V6,34:169,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,74:91,75:$Vn,81:$Vs1,83:$Vp,88:$Vq,93:45,101:100,119:44,120:$Vu,121:171,126:$Vv,140:76,144:$VC,147:$Vt1,156:43,158:75,163:101,165:$VH,166:168,168:38,173:$VI,175:40,176:41,177:$VK,178:46,187:$VO,188:$VP},{31:$V6,34:169,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,74:91,75:$Vn,81:$Vs1,83:$Vp,88:$Vq,93:45,101:100,119:44,120:$Vu,121:171,126:$Vv,140:76,144:$VC,147:$Vt1,156:43,158:75,163:101,165:$VH,166:173,168:38,173:$VI,175:40,176:41,177:$VK,178:46,187:$VO,188:$VP},o($Vu1,$Vv1,{232:[1,174],233:[1,175],237:[1,176]}),o($Vg1,[2,332],{220:[1,177],225:[1,178]}),{5:179,9:$V0},{5:180,9:$V0},o($Vg1,[2,297]),{5:181,9:$V0},{9:[1,183],12:182,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($Vg1,[2,240]),{111:185,113:$Vt,181:184,183:$VM},{181:186,183:$VM},{145:188,148:$VF,181:187,183:$VM},{144:$VC,145:191,147:$Vt1,148:$VF,163:192,165:$VH,181:189,182:[1,190],183:$VM},{31:$V6,34:169,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,74:91,75:$Vn,81:$Vs1,83:$Vp,88:$Vq,93:45,101:100,119:44,120:$Vu,121:171,126:$Vv,140:76,144:$VC,147:$Vt1,156:43,158:75,163:101,165:$VH,166:193,168:38,173:$VI,175:40,176:41,177:$VK,178:46,187:$VO,188:$VP},o($Vg1,[2,113]),o($Vw1,[2,93],{96:194,100:196,101:197,50:[1,198],81:[1,195],188:$VP}),{49:200,50:$V7,81:[1,201],139:199},o($Vp1,[2,69],{33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,16:29,17:30,24:35,121:37,168:38,64:39,175:40,176:41,156:43,119:44,93:45,178:46,130:47,131:48,132:49,166:56,223:57,201:59,205:60,207:61,181:63,111:69,138:71,158:75,140:76,62:78,74:91,145:92,56:96,51:97,54:98,58:99,101:100,163:101,49:102,210:108,60:115,15:150,12:202,73:203,18:$V1,19:$V2,20:$Vx1,22:$V3,23:$V4,25:$V5,31:$V6,50:$V7,52:$V8,53:$V9,55:$Va,57:$Vb,59:$Vc,61:$Vd,63:$Ve,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,75:$Vn,81:$Vo,83:$Vp,88:$Vq,95:$Vr,112:$Vs,113:$Vt,120:$Vu,126:$Vv,133:$Vy,134:$Vz,141:$VA,142:$VB,144:$VC,146:$VD,147:$VE,148:$VF,165:$VH,173:$VI,174:$VJ,177:$VK,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,206:$VU,218:$VW,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11}),{12:205,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{26:206,28:207,30:208,31:$Vy1,32:210,49:212,50:$V7,56:211,57:$Vb},o($Vu1,[2,219]),o($Vu1,[2,220]),o($Vz1,[2,217]),o($Vq1,[2,59]),o($Vq1,[2,60]),o($Vq1,[2,61]),o($Vq1,[2,62]),o($Vq1,[2,63]),o($Vq1,[2,64]),o($Vq1,[2,65]),o($Vq1,[2,66]),{4:213,7:4,9:[1,214],11:6,12:7,14:8,15:9,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,128:$Vw,129:$Vx,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,160:$VG,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{9:$VA1,11:220,12:215,14:222,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,89:$VB1,93:45,95:$Vr,101:100,109:217,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,128:$Vw,129:$Vx,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,160:$VG,161:$VC1,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,192:218,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o([1,6,9,10,13,20,21,80,81,82,83,89,98,102,103,115,125,127,134,137,161,170,172,186,190,191,202,203,204,209,217,226,227,230,231,234,235,236],[2,258]),o($Vq1,[2,123]),{49:223,50:$V7},{76:225,77:[1,226],78:[1,227],79:[1,228],80:[1,229],83:[1,230],84:[1,231],85:[1,232],86:[1,233],87:[1,234],88:[1,235],92:[1,236],94:[1,224]},o($Vg1,[2,154]),{5:237,9:$V0,135:[1,238]},o($VD1,$VE1,{60:115,180:240,123:241,124:242,14:243,49:244,56:245,62:246,51:247,54:248,31:$V6,50:$V7,52:$V8,53:$V9,55:$Va,57:$Vb,61:$Vd,63:$Ve,126:$VF1,128:$Vw,129:$Vx,135:$VG1}),{5:250,9:$V0},o($Vz1,[2,200]),o($Vz1,[2,201]),o($Vz1,[2,202]),o($Vz1,[2,203]),o($Vz1,[2,204]),o($Vz1,[2,205]),o($Vz1,[2,206]),{12:251,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{12:252,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{12:253,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{5:254,9:$V0,12:255,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{49:260,50:$V7,81:$Vs1,88:$Vq,140:262,158:261,176:256,212:257,213:[1,258],214:259},{211:263,215:[1,264],216:[1,265]},{31:$V6,34:169,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,74:91,75:$Vn,81:$Vs1,83:$Vp,88:$Vq,93:45,101:100,119:44,120:$Vu,121:171,126:$Vv,140:76,144:$VC,147:$Vt1,156:43,158:75,163:101,165:$VH,166:266,168:38,173:$VI,175:40,176:41,177:$VK,178:46,187:$VO,188:$VP},{114:267,117:$VH1,118:$VI1},o($VJ1,[2,149]),o($VJ1,[2,150]),o($Vq1,[2,56]),o($Vq1,[2,57]),o($Vq1,[2,58]),o($VK1,[2,70]),{49:275,50:$V7,54:274,55:$Va,56:276,57:$Vb,81:$VL1,101:273,149:270,151:271,156:272,187:$VO,188:$VP},o([1,6,9,10,13,20,21,27,80,81,82,83,89,98,102,103,107,115,125,127,134,137,152,154,161,170,172,186,190,191,202,203,204,209,217,226,227,230,231,232,233,234,235,236,237],[2,53]),o($VM1,[2,50]),o($VM1,[2,51]),o([1,6,9,10,13,20,21,80,81,82,83,89,98,102,103,107,115,125,127,134,137,161,170,172,186,190,191,202,203,204,209,217,226,227,230,231,232,233,234,235,236,237],[2,52]),o($Vz1,[2,54]),o($VM1,[2,259]),{49:281,50:$V7,56:280,57:$Vb,88:$VN1,158:282,160:[1,278],164:279},{49:281,50:$V7,56:280,57:$Vb,88:$VN1,158:282,160:[1,285],164:284},o([1,6,9,10,13,20,21,27,80,81,82,83,89,90,98,102,103,107,115,125,127,134,137,152,154,161,170,172,186,190,191,202,203,204,209,215,216,217,226,227,230,231,232,233,234,235,236,237],[2,49]),o($Vz1,[2,55]),o($V31,[2,6],{11:6,12:7,14:8,15:9,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,16:29,17:30,24:35,121:37,168:38,64:39,175:40,176:41,156:43,119:44,93:45,178:46,130:47,131:48,132:49,166:56,223:57,201:59,205:60,207:61,181:63,111:69,138:71,158:75,140:76,62:78,74:91,145:92,56:96,51:97,54:98,58:99,101:100,163:101,49:102,210:108,60:115,7:286,18:$V1,19:$V2,22:$V3,23:$V4,25:$V5,31:$V6,50:$V7,52:$V8,53:$V9,55:$Va,57:$Vb,59:$Vc,61:$Vd,63:$Ve,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,75:$Vn,81:$Vo,83:$Vp,88:$Vq,95:$Vr,112:$Vs,113:$Vt,120:$Vu,126:$Vv,128:$Vw,129:$Vx,133:$Vy,134:$Vz,141:$VA,142:$VB,144:$VC,146:$VD,147:$VE,148:$VF,160:$VG,165:$VH,173:$VI,174:$VJ,177:$VK,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,202:$VS,204:$VT,206:$VU,209:$VV,218:$VW,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11}),o([1,6,10,18,19,22,23,25,31,50,52,53,55,57,59,61,63,65,66,67,68,69,70,71,72,75,81,83,88,95,112,113,120,126,127,128,129,133,134,141,142,144,146,147,148,160,161,165,173,174,177,182,183,184,187,188,194,200,202,204,206,209,218,224,228,229,230,231,232,233],[2,7]),{1:[2,3]},{11:288,12:287,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,160:$VG,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($VO1,[2,8]),{6:$V21,8:128,10:[1,289]},{4:290,7:4,11:6,12:7,14:8,15:9,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,128:$Vw,129:$Vx,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,160:$VG,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o([1,6,9,10,13,21,82,89,98,103,115,125,127,137,161,190,191,202,203,204,209,217,226,227,234,235,236],[2,344],{33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,16:29,17:30,24:35,121:37,168:38,64:39,175:40,176:41,156:43,119:44,93:45,178:46,130:47,131:48,132:49,166:56,223:57,201:59,205:60,207:61,181:63,111:69,138:71,158:75,140:76,62:78,74:91,145:92,56:96,51:97,54:98,58:99,101:100,163:101,49:102,210:108,60:115,15:150,12:291,18:$V1,19:$V2,22:$V3,23:$V4,25:$V5,31:$V6,50:$V7,52:$V8,53:$V9,55:$Va,57:$Vb,59:$Vc,61:$Vd,63:$Ve,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,75:$Vn,81:$Vo,83:$Vp,88:$Vq,95:$Vr,112:$Vs,113:$Vt,120:$Vu,126:$Vv,133:$Vy,134:$Vz,141:$VA,142:$VB,144:$VC,146:$VD,147:$VE,148:$VF,165:$VH,173:$VI,174:$VJ,177:$VK,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,206:$VU,218:$VW,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11}),{12:292,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{12:293,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{12:294,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{12:295,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{12:296,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{12:297,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{12:298,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{12:299,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($Vg1,[2,296]),o($Vg1,[2,301]),{12:300,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($Vg1,[2,295]),o($Vg1,[2,300]),o([1,6,9,10,13,21,89,127],[2,189],{210:108,201:144,207:145,115:$V61,161:$V71,202:$VS,204:$VT,209:$VV,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),{201:147,202:$VS,204:$VT,207:148,209:$VV,210:108,226:$Vf1},{20:$Vx1,73:301},o($Vq1,[2,253]),o($VP1,[2,215],{168:303,60:304,61:$Vd,167:[1,302],173:$VI}),{49:305,50:$V7,51:306,52:$V8,53:$V9,56:307,57:$Vb},{49:308,50:$V7},{12:310,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,171:309,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,179:311,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,189:312,190:$VQ1,191:$VR1,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{20:[2,255]},{135:$VG1},o($VP1,[2,216]),{12:315,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{12:316,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($VS1,[2,221],{210:108,201:144,207:145,115:$V61,161:$V71,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),{9:[1,318],12:317,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($Vg1,[2,336],{210:108,201:144,207:145}),o($Vg1,[2,337],{210:108,201:144,207:145}),o($Vg1,[2,338],{210:108,201:144,207:145}),o($Vg1,[2,339],{210:108,201:144,207:145}),o($Vg1,[2,340],{20:$Vv1,80:$Vv1,81:$Vv1,102:$Vv1,134:$Vv1,170:$Vv1,172:$Vv1,186:$Vv1}),{20:$Vh1,80:$Vi1,81:$Vj1,102:$Vk1,131:152,134:$Vz,169:154,170:$Vl1,172:$Vm1,185:151,186:$Vn1},{144:$VC,147:$Vt1,163:192,165:$VH},o([20,80,81,102,134,170,172,186],$Vr1),o($VD1,$VE1,{60:115,180:240,123:241,124:242,14:243,49:244,56:245,62:246,51:247,54:248,31:$V6,50:$V7,52:$V8,53:$V9,55:$Va,57:$Vb,61:$Vd,63:$Ve,126:$VF1,128:$Vw,129:$Vx}),o($Vg1,[2,341],{20:$Vv1,80:$Vv1,81:$Vv1,102:$Vv1,134:$Vv1,170:$Vv1,172:$Vv1,186:$Vv1}),o($Vg1,[2,342]),o($Vg1,[2,343]),{9:[1,320],12:319,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{5:322,9:$V0,224:[1,321]},{12:323,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($Vg1,[2,281],{195:324,196:325,197:$VT1,198:[1,326]}),o($Vg1,[2,294]),o($Vg1,[2,302]),{9:[1,328],115:$V61,161:$V71,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},{219:329,221:330,222:$VU1},o($Vg1,[2,241]),o($Vg1,[2,114]),o($Vg1,[2,242]),o($Vg1,[2,243]),o($Vg1,[2,155]),o($Vg1,[2,244]),{181:332,183:$VM},o($Vg1,[2,156]),o($Vz1,[2,194]),o($VV1,[2,250],{5:333,9:$V0,20:$Vv1,80:$Vv1,81:$Vv1,102:$Vv1,134:$Vv1,170:$Vv1,172:$Vv1,186:$Vv1}),o($VW1,[2,102],{97:334,51:338,104:339,52:$V8,53:$V9,80:[1,335],83:[1,337],102:[1,336],106:$VX1}),{12:341,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($Vw1,[2,94]),o($Vw1,[2,91]),o($Vw1,[2,92]),o($Vg1,[2,148],{140:342,20:[1,343],81:$Vs1}),o($VY1,[2,151]),{12:344,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($Vp1,[2,67],{210:108,201:144,207:145,115:$V61,161:$V71,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),o($Vp1,[2,68]),{9:$VA1,11:220,12:347,14:222,15:150,16:29,17:30,18:$V1,19:$V2,21:[1,345],22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,109:346,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,128:$Vw,129:$Vx,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,160:$VG,161:$VC1,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,192:218,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($Vp1,[2,287],{210:108,201:144,207:145,115:$V61,161:$V71,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),{13:[1,349],27:[1,348]},o($Vp1,[2,28],{29:[1,350]}),o($VZ1,[2,30]),o([1,6,10,13,29,127,202,204,209,226],[2,29]),o($V_1,[2,32]),o($V_1,[2,195]),o($V_1,[2,196]),{6:$V21,8:128,127:[1,351]},{4:352,7:4,11:6,12:7,14:8,15:9,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,128:$Vw,129:$Vx,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,160:$VG,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o([6,9,13,89],$V$1,{210:108,201:144,207:145,189:353,115:$V61,161:$V71,190:$VQ1,191:$VR1,202:$VS,204:$VT,209:$VV,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),o($V02,[2,260]),o([6,9,89],$V12,{105:354,13:$V22}),o($V32,[2,268]),{9:$VA1,11:220,12:347,14:222,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,109:356,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,128:$Vw,129:$Vx,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,160:$VG,161:$VC1,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,192:218,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($V32,[2,276]),o($V32,[2,277]),o($V32,[2,278]),o($Vq1,[2,124]),o($Vq1,[2,84]),o($VK1,[2,71]),o($VK1,[2,72]),o($VK1,[2,73]),o($VK1,[2,74]),{81:[1,357]},{81:[1,358]},o($VK1,[2,77]),o($VK1,[2,78]),o($VK1,[2,79]),o($VK1,[2,80]),{49:359,50:$V7},o($VK1,[2,83]),o($Vq1,[2,143]),o($V42,$V52,{136:360,157:361,140:362,158:363,159:364,49:368,50:$V7,81:$Vs1,88:$VN1,160:$V62,161:$V72,162:$V82}),o($V42,$V52,{157:361,140:362,158:363,159:364,49:368,136:369,50:$V7,81:$Vs1,88:$VN1,160:$V62,161:$V72,162:$V82}),o([6,9,82],$V12,{105:370,13:$V92}),o($Va2,[2,236]),o($Va2,[2,127],{125:[1,372]}),o($Va2,[2,130]),o($Vb2,[2,131]),o($Vb2,[2,132]),o($Vb2,[2,133]),o($Vb2,[2,134]),o($Vb2,[2,135]),{12:373,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($Vg1,[2,142]),{5:374,9:$V0,115:$V61,161:$V71,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},o($Vc2,[2,290],{210:108,201:144,207:145,115:$V61,161:$V71,202:$VS,203:[1,375],204:$VT,209:$VV,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),o($Vc2,[2,292],{210:108,201:144,207:145,115:$V61,161:$V71,202:$VS,203:[1,376],204:$VT,209:$VV,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),o($Vg1,[2,298]),o($Vd2,[2,299],{210:108,201:144,207:145,115:$V61,161:$V71,202:$VS,204:$VT,209:$VV,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),o($Vg1,[2,304]),o($Ve2,[2,306]),{49:260,50:$V7,81:$Vs1,88:$VN1,140:262,158:261,212:377,214:259},o($Ve2,[2,311],{13:[1,378]}),o($Vf2,[2,308]),o($Vf2,[2,309]),o($Vf2,[2,310]),o($Vg1,[2,305]),{12:379,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{12:380,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($Vg2,[2,246],{5:381,9:$V0,20:$Vv1,80:$Vv1,81:$Vv1,102:$Vv1,134:$Vv1,170:$Vv1,172:$Vv1,186:$Vv1,115:[1,382]}),o($Vg2,[2,115],{5:383,9:$V0,115:[1,384]}),o($Vg1,[2,121]),o($Vg1,[2,122]),{80:[1,386],83:[1,387],150:385},o($Vh2,[2,172],{20:[1,388],152:[1,389],154:[1,390]}),o($Vh2,[2,173]),o($Vh2,[2,174]),o($Vh2,[2,175]),o($Vi2,[2,167]),o($Vi2,[2,168]),{12:391,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{49:281,50:$V7,56:280,57:$Vb,88:$VN1,158:282,164:392},o($Vz1,[2,191]),o($Vz1,[2,197]),o($Vz1,[2,198]),o($Vz1,[2,199]),{9:$VA1,11:220,12:347,14:222,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,89:$VB1,93:45,95:$Vr,101:100,109:217,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,128:$Vw,129:$Vx,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,160:$VG,161:$VC1,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,192:218,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($Vz1,[2,192]),{49:281,50:$V7,56:280,57:$Vb,88:$VN1,158:282,164:393},o($V31,[2,5],{13:$V41}),o($V51,[2,13],{210:108,201:144,207:145,115:$V61,161:$V71,202:$VS,204:$VT,209:$VV,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),o($V51,[2,14]),o($VO1,[2,9]),{6:$V21,8:128,10:[1,394]},{115:$V61,125:[1,395],161:$V71,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},o($Vj2,[2,345],{210:108,201:144,207:145,234:$Vc1}),o($Vj2,[2,346],{210:108,201:144,207:145,234:$Vc1}),o($Vg1,[2,347],{210:108,201:144,207:145}),o([1,6,9,10,13,21,82,89,98,103,115,125,127,137,161,190,191,202,203,204,209,217,226,227,235,236],[2,348],{210:108,201:144,207:145,230:$Va1,231:$Vb1,234:$Vc1}),o([1,6,9,10,13,21,82,89,98,103,115,125,127,137,161,190,191,202,203,204,209,217,226,227],[2,349],{210:108,201:144,207:145,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),o([1,6,9,10,13,21,82,89,98,103,125,127,137,161,190,191,202,203,204,209,217,226,227],[2,350],{210:108,201:144,207:145,115:$V61,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),o([1,6,9,10,13,21,82,89,98,103,115,125,127,137,161,190,191,202,203,204,209,217,226,227,236],[2,351],{210:108,201:144,207:145,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1}),o($Vk2,[2,334],{210:108,201:144,207:145,115:$V61,161:$V71,202:$VS,204:$VT,209:$VV,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),o($Vk2,[2,333],{210:108,201:144,207:145,115:$V61,161:$V71,202:$VS,204:$VT,209:$VV,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),o($Vq1,[2,252]),o($Vz1,[2,207]),o($Vz1,[2,208]),o($Vz1,[2,212]),o($Vz1,[2,209]),o($Vz1,[2,211]),o($Vz1,[2,213]),o($Vz1,[2,210]),{103:[1,396]},{103:[2,232],115:$V61,161:$V71,189:397,190:$VQ1,191:$VR1,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},{103:[2,233]},{12:398,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($Vl2,[2,262]),o($Vl2,[2,263]),{21:[1,399],115:$V61,161:$V71,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},{21:[1,400],115:$V61,161:$V71,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},o($VS1,[2,125],{210:108,201:144,207:145,115:$V61,161:$V71,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),{12:401,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($VS1,[2,352],{210:108,201:144,207:145,115:$V61,161:$V71,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),{12:402,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{12:403,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($Vm2,[2,331]),{5:404,9:$V0,115:$V61,161:$V71,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},o($Vg1,[2,282],{196:405,197:$VT1}),o($Vg1,[2,283]),{199:[1,406]},{5:407,9:$V0},{219:408,221:330,222:$VU1},{10:[1,409],220:[1,410],221:411,222:$VU1},o($Vn2,[2,324]),{12:413,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,193:412,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($Vg1,[2,245]),o($Vg1,[2,251]),{6:$V12,13:[1,415],98:[1,414],105:416},{50:[1,418],61:[1,417],81:[1,419]},{12:420,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{50:[1,421],81:[1,422]},o($Vw1,[2,100]),o($VW1,[2,103]),o($VW1,[2,106],{107:[1,423]}),{82:[1,424],115:$V61,161:$V71,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},o($Vg1,[2,146]),{81:$Vs1,140:425},{82:[1,426],115:$V61,161:$V71,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},o($Vq1,[2,256]),o([6,9,21],$V12,{105:427,13:$V22}),o($V32,$V$1,{210:108,201:144,207:145,115:$V61,161:$V71,202:$VS,204:$VT,209:$VV,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),{28:428,31:$Vy1},{30:429,32:210,49:212,50:$V7,56:211,57:$Vb},{30:430,32:210,49:212,50:$V7,56:211,57:$Vb},o($Vq1,[2,288]),{6:$V21,8:128,10:[1,431]},{12:432,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{6:$V21,8:434,9:$Vo2,89:[1,433]},o([6,9,10,21,89],$Vp2,{33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,16:29,17:30,24:35,121:37,168:38,64:39,175:40,176:41,156:43,119:44,93:45,178:46,130:47,131:48,132:49,166:56,223:57,201:59,205:60,207:61,181:63,111:69,138:71,158:75,140:76,62:78,74:91,145:92,56:96,51:97,54:98,58:99,101:100,163:101,49:102,210:108,60:115,15:150,11:220,14:222,12:347,192:436,18:$V1,19:$V2,22:$V3,23:$V4,25:$V5,31:$V6,50:$V7,52:$V8,53:$V9,55:$Va,57:$Vb,59:$Vc,61:$Vd,63:$Ve,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,75:$Vn,81:$Vo,83:$Vp,88:$Vq,95:$Vr,112:$Vs,113:$Vt,120:$Vu,126:$Vv,128:$Vw,129:$Vx,133:$Vy,134:$Vz,141:$VA,142:$VB,144:$VC,146:$VD,147:$VE,148:$VF,160:$VG,161:$VC1,165:$VH,173:$VI,174:$VJ,177:$VK,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,202:$VS,204:$VT,206:$VU,209:$VV,218:$VW,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11}),o($Vq2,$V12,{105:437,13:$V22}),{12:438,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{12:439,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{89:[1,440],90:[1,441]},{13:$Vr2,137:[1,442]},o($Vs2,[2,179]),o($Vs2,[2,181]),o($Vs2,[2,182]),o($Vs2,[2,183],{107:[1,444]}),{49:368,50:$V7,159:445},{49:368,50:$V7,159:446},{49:368,50:$V7,159:447},o([13,21,107,137],[2,188]),{13:$Vr2,137:[1,448]},{6:$V21,8:450,9:$Vt2,82:[1,449]},o([6,9,10,82],$Vp2,{60:115,124:242,14:243,49:244,56:245,62:246,51:247,54:248,123:452,31:$V6,50:$V7,52:$V8,53:$V9,55:$Va,57:$Vb,61:$Vd,63:$Ve,126:$VF1,128:$Vw,129:$Vx}),{9:[1,454],12:453,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{115:$V61,127:[1,455],161:$V71,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},o($Vm2,[2,328]),{12:456,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{12:457,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($Ve2,[2,307]),{49:260,50:$V7,81:$Vs1,88:$VN1,140:262,158:261,214:458},o([1,6,9,10,13,21,82,89,98,103,125,127,137,190,191,202,204,209,226],[2,313],{210:108,201:144,207:145,115:$V61,161:$V71,203:[1,459],217:[1,460],227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),o($Vu2,[2,314],{210:108,201:144,207:145,115:$V61,161:$V71,203:[1,461],227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),o($Vg1,[2,247]),{12:462,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($Vg1,[2,116]),{114:463,117:$VH1,118:$VI1},{49:275,50:$V7,56:276,57:$Vb,81:$VL1,151:464},o($Vv2,[2,165]),o($Vv2,[2,166]),o($Vw2,$V52,{157:361,140:362,158:363,159:364,49:368,136:465,50:$V7,81:$Vs1,88:$VN1,160:$V62,161:$V72,162:$V82}),{5:467,9:$V0,81:$Vj1,131:468,134:$Vz,153:466},{5:467,9:$V0,81:$Vj1,131:468,134:$Vz,153:469},{82:[1,470],115:$V61,161:$V71,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},o($Vz1,[2,190]),o($Vz1,[2,193]),o($VO1,[2,10]),{12:471,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($Vz1,[2,214]),{12:472,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,103:[2,266],111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{103:[2,267],115:$V61,161:$V71,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},o($Vp1,[2,21]),o($Vp1,[2,23]),{6:$V21,8:474,10:$Vx2,115:$V61,122:473,161:$V71,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},{6:$V21,8:474,10:$Vx2,115:$V61,122:476,161:$V71,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},{5:477,9:$V0,115:$V61,161:$V71,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},o($Vm2,[2,330]),o($Vg1,[2,284]),{5:478,9:$V0},o($Vg1,[2,285]),{10:[1,479],220:[1,480],221:411,222:$VU1},o($Vg1,[2,322]),{5:481,9:$V0},o($Vn2,[2,325]),{5:482,9:$V0,13:[1,483]},o($Vy2,[2,279],{210:108,201:144,207:145,115:$V61,161:$V71,202:$VS,204:$VT,209:$VV,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),o($VV1,[2,88],{99:484,9:[1,485],20:[1,486]}),{6:$Vp2,104:487,106:$VX1},{6:[1,488]},o($Vw1,[2,95]),o($Vw1,[2,97]),{12:489,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{103:[1,490],115:$V61,161:$V71,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},o($Vw1,[2,99]),{12:491,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{12:493,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,108:492,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{98:[1,494]},{21:[1,495]},o($VY1,[2,152]),{6:$V21,8:434,9:$Vo2,21:[1,496]},o($Vp1,[2,26]),o($VZ1,[2,31]),o($Vp1,[2,27]),{127:[1,497]},{89:[1,498],115:$V61,161:$V71,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},o($V02,[2,261]),{11:220,12:347,14:222,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,128:$Vw,129:$Vx,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,160:$VG,161:$VC1,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,192:499,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{9:$VA1,11:220,12:347,14:222,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,109:500,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,128:$Vw,129:$Vx,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,160:$VG,161:$VC1,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,192:218,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($V32,[2,269]),{6:$V21,8:502,9:$Vo2,10:$Vx2,122:501},{82:[1,503],115:$V61,161:$V71,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},{82:[1,504],115:$V61,161:$V71,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},o($VK1,[2,81]),{31:$V6,50:[1,506],60:115,61:$Vd,62:507,63:$Ve,81:[1,508],91:505},{5:509,9:$V0},{49:368,50:$V7,81:$Vs1,88:$VN1,140:362,157:510,158:363,159:364,160:$V62,161:$V72,162:$V82},{12:511,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($Vs2,[2,184]),o($Vs2,[2,185]),o($Vs2,[2,186]),{5:512,9:$V0},o([1,6,9,10,13,20,21,80,81,82,89,98,102,103,107,115,125,127,134,137,161,170,172,186,190,191,202,203,204,209,215,216,217,226,227,230,231,234,235,236],[2,234]),{14:243,31:$V6,49:244,50:$V7,51:247,52:$V8,53:$V9,54:248,55:$Va,56:245,57:$Vb,60:115,61:$Vd,62:246,63:$Ve,123:513,124:242,126:$VF1,128:$Vw,129:$Vx},o([6,9,10,13],$VE1,{60:115,123:241,124:242,14:243,49:244,56:245,62:246,51:247,54:248,180:514,31:$V6,50:$V7,52:$V8,53:$V9,55:$Va,57:$Vb,61:$Vd,63:$Ve,126:$VF1,128:$Vw,129:$Vx}),o($Va2,[2,237]),o($Va2,[2,128],{210:108,201:144,207:145,115:$V61,161:$V71,202:$VS,204:$VT,209:$VV,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),{12:515,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($Vb2,[2,136]),o($Vd2,[2,291],{210:108,201:144,207:145,115:$V61,161:$V71,202:$VS,204:$VT,209:$VV,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),o($Vd2,[2,293],{210:108,201:144,207:145,115:$V61,161:$V71,202:$VS,204:$VT,209:$VV,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),o($Ve2,[2,312]),{12:516,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{12:517,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{12:518,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o([1,6,10,13,21,82,89,98,103,125,127,137,190,191,203,217,226],[2,248],{210:108,201:144,207:145,5:519,9:$V0,115:$V61,161:$V71,202:$VS,204:$VT,209:$VV,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),o($VV1,[2,117],{5:520,9:$V0}),{20:[1,521],152:[1,522],154:[1,523]},{13:$Vr2,21:[1,524]},o($Vg1,[2,160]),o($Vg1,[2,170]),o($Vg1,[2,171]),o($Vg1,[2,164]),o($Vi2,[2,169]),o([1,6,9,10,13,21,82,89,98,103,125,127,137,190,191,202,203,204,209,217,226,227],[2,335],{210:108,201:144,207:145,115:$V61,161:$V71,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),{103:[2,265],115:$V61,161:$V71,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},o($Vg1,[2,126]),{10:$Vz2},o($Vg1,[2,274]),o($Vg1,[2,353]),o($Vm2,[2,329]),o([1,6,9,10,13,21,82,89,98,103,115,125,127,137,161,190,191,197,202,203,204,209,217,226,227,230,231,234,235,236],[2,286]),o($Vg1,[2,320]),{5:526,9:$V0},{10:[1,527]},o($Vn2,[2,326],{6:[1,528]}),{12:529,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($Vg1,[2,89]),{9:$VA1,11:220,12:347,14:222,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,109:530,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,128:$Vw,129:$Vx,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,160:$VG,161:$VC1,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,192:218,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{9:$VA1,11:220,12:347,14:222,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,109:531,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,128:$Vw,129:$Vx,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,160:$VG,161:$VC1,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,192:218,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($VW1,[2,104]),{104:532,106:$VX1},{82:[1,533],115:$V61,161:$V71,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},o($Vw1,[2,96]),{82:[1,534],115:$V61,161:$V71,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},o($VW1,[2,107]),o($VW1,[2,108],{210:108,201:144,207:145,115:$V61,161:$V71,202:$VS,204:$VT,209:$VV,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),o($Vg1,[2,90]),o($Vg1,[2,147]),o($Vq1,[2,257]),o($Vq1,[2,289]),o($Vq1,[2,264]),o($V32,[2,270]),o($Vq2,$V12,{105:535,13:$V22}),o($V32,[2,271]),{10:$Vz2,11:220,12:347,14:222,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,128:$Vw,129:$Vx,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,160:$VG,161:$VC1,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,192:499,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($VK1,[2,75]),o($VK1,[2,76]),{89:[1,536]},{89:[2,85]},{89:[2,86]},{12:537,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},o($Vq1,[2,144]),o($Vs2,[2,180]),o($Vs2,[2,187],{210:108,201:144,207:145,115:$V61,161:$V71,202:$VS,204:$VT,209:$VV,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),{82:[1,538]},o($Va2,[2,238]),o($Vq2,$V12,{105:539,13:$V92}),{6:$V21,8:474,10:$Vx2,115:$V61,122:540,161:$V71,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},o([1,6,9,10,13,21,82,89,98,103,125,127,137,190,191,202,203,204,209,226],[2,315],{210:108,201:144,207:145,115:$V61,161:$V71,217:[1,541],227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),o($Vu2,[2,317],{210:108,201:144,207:145,115:$V61,161:$V71,203:[1,542],227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),o($VS1,[2,316],{210:108,201:144,207:145,115:$V61,161:$V71,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),o($Vg1,[2,249]),o($Vg1,[2,118]),o($Vw2,$V52,{157:361,140:362,158:363,159:364,49:368,136:543,50:$V7,81:$Vs1,88:$VN1,160:$V62,161:$V72,162:$V82}),{5:467,9:$V0,81:$Vj1,131:468,134:$Vz,153:544},{5:467,9:$V0,81:$Vj1,131:468,134:$Vz,153:545},{152:[1,546],154:[1,547]},o($Vg1,[2,273]),{6:$V21,8:474,10:$Vx2,122:548},o($Vg1,[2,323]),o($Vn2,[2,327]),o($Vy2,[2,280],{210:108,201:144,207:145,115:$V61,161:$V71,202:$VS,204:$VT,209:$VV,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),o($VA2,$V12,{105:550,10:[1,549],13:$V22}),o($VA2,$V12,{105:550,13:$V22,21:[1,551]}),o($VW1,[2,105]),o($Vw1,[2,98]),o($Vw1,[2,101]),{6:$V21,8:502,9:$Vo2,10:$Vx2,122:552},o($VK1,[2,82]),{82:[1,553],115:$V61,161:$V71,201:144,202:$VS,204:$VT,207:145,209:$VV,210:108,226:$V81,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1},o($Vq1,[2,145]),{6:$V21,8:555,9:$Vt2,10:$Vx2,122:554},o($Va2,[2,129]),{12:556,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{12:557,15:150,16:29,17:30,18:$V1,19:$V2,22:$V3,23:$V4,24:35,25:$V5,31:$V6,33:11,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:102,50:$V7,51:97,52:$V8,53:$V9,54:98,55:$Va,56:96,57:$Vb,58:99,59:$Vc,60:115,61:$Vd,62:78,63:$Ve,64:39,65:$Vf,66:$Vg,67:$Vh,68:$Vi,69:$Vj,70:$Vk,71:$Vl,72:$Vm,74:91,75:$Vn,81:$Vo,83:$Vp,88:$Vq,93:45,95:$Vr,101:100,111:69,112:$Vs,113:$Vt,119:44,120:$Vu,121:37,126:$Vv,130:47,131:48,132:49,133:$Vy,134:$Vz,138:71,140:76,141:$VA,142:$VB,144:$VC,145:92,146:$VD,147:$VE,148:$VF,156:43,158:75,163:101,165:$VH,166:56,168:38,173:$VI,174:$VJ,175:40,176:41,177:$VK,178:46,181:63,182:$VL,183:$VM,184:$VN,187:$VO,188:$VP,194:$VQ,200:$VR,201:59,202:$VS,204:$VT,205:60,206:$VU,207:61,209:$VV,210:108,218:$VW,223:57,224:$VX,228:$VY,229:$VZ,230:$V_,231:$V$,232:$V01,233:$V11},{13:$Vr2,21:[1,558]},o($Vg1,[2,158]),o($Vg1,[2,162]),{5:467,9:$V0,81:$Vj1,131:468,134:$Vz,153:559},{5:467,9:$V0,81:$Vj1,131:468,134:$Vz,153:560},o($Vg1,[2,321]),o($Vg1,[2,109]),{6:$V21,8:434,9:$Vo2},o($Vg1,[2,110]),o($V32,[2,272]),{89:[2,87]},o($Va2,[2,239]),{10:$Vz2,14:243,31:$V6,49:244,50:$V7,51:247,52:$V8,53:$V9,54:248,55:$Va,56:245,57:$Vb,60:115,61:$Vd,62:246,63:$Ve,123:513,124:242,126:$VF1,128:$Vw,129:$Vx},o($VS1,[2,318],{210:108,201:144,207:145,115:$V61,161:$V71,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),o($VS1,[2,319],{210:108,201:144,207:145,115:$V61,161:$V71,227:$V91,230:$Va1,231:$Vb1,234:$Vc1,235:$Vd1,236:$Ve1}),{152:[1,561],154:[1,562]},o($Vg1,[2,159]),o($Vg1,[2,163]),{5:467,9:$V0,81:$Vj1,131:468,134:$Vz,153:563},{5:467,9:$V0,81:$Vj1,131:468,134:$Vz,153:564},o($Vg1,[2,157]),o($Vg1,[2,161])],
defaultActions: {130:[2,3],157:[2,255],311:[2,233],506:[2,85],507:[2,86],553:[2,87]},
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

    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;

    function handleError(){
        var error_rule_depth;
        var errStr = '';

        // Return the rule stack depth where the nearest error rule can be found.
        // Return FALSE when no error recovery rule was found.
        // we have no rules now
        function locateNearestErrorRecoveryRule(state) {
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

            if (lexer.showPosition) {
                errStr = 'Parse error on line '+(yylineno+1)+":\n"+lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + (self.terminals_[symbol] || symbol)+ "'";
            } else {
                errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " + (symbol == EOF ? "end of input" : ("'"+(self.terminals_[symbol] || symbol)+"'"));
            }

            self.parseError(errStr, {
                lexer: lexer,
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
            // symbol = lex();
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


    var __sym = this.symbols_;
    var __prod = this.productions_;

    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length - 1];

        if (symbol === null || typeof symbol == 'undefined') {
            symbol = __sym[lexer.lex()] || EOF;
        }
        action = table[state] && table[state][symbol];

_handle_error:
        if (typeof action === 'undefined' || !action.length || !action[0]) {
            handleError();
        }

        switch (action[0]) {
            case 1: // shift
                stack.push(symbol);
                stack.push(action[1]); // push state
                vstack.push(lexer.yytext);
                
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    // yyleng = lexer.yyleng;
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
                len = __prod[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1

                r = this.performAction(yyval, yytext, yyleng, yylineno, yy, action[1], vstack);

                if (typeof r !== 'undefined') {
                    return r;
                }

                while(len > 0) {
                    stack.pop();
                    stack.pop();
                    vstack.pop();
                    len--;
                }

                stack.push(__prod[action[1]][0]);
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                vstack.push(yyval.$);
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
},{"_process":13,"fs":11,"path":12}],9:[function(require,module,exports){
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
		
		// console.log "tokens in: " + tokens:length
		if (opts.profile) { console.time("tokenize:rewrite") };
		
		this.step("removeLeadingNewlines");
		this.step("removeMidExpressionNewlines");
		this.step("tagDefArguments");
		this.step("closeOpenCalls");
		this.step("closeOpenIndexes");
		this.step("closeOpenTags");
		this.step("closeOpenTagAttrLists");
		this.step("addImplicitIndentation");
		this.step("tagPostfixConditionals");
		this.step("addImplicitBraces");
		this.step("addImplicitParentheses");
		
		if (opts.profile) { console.timeEnd("tokenize:rewrite") };
		// console.log "tokens out: " + @tokens:length
		return this._tokens;
	};
	
	Rewriter.prototype.step = function (fn){
		if (this._options.profile) {
			console.log(("---- starting " + fn + " ---- "));
			console.time(fn);
		};
		
		this[fn]();
		
		if (this._options.profile) {
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
		var token;
		var tokens = this._tokens;
		
		var i = 0;
		while (token = tokens[i]){
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
		
		while (token = tokens[i]){
			if (levels == 0 && condition.call(this,token,i,starts)) {
				return action.call(this,token,i);
			};
			if (!token || levels < 0) {
				return action.call(this,token,i - 1);
			};
			
			t = T.typ(token);
			
			if (EXPRESSION_START.indexOf(t) >= 0) {
				if (levels == 0) { starts.push(i) };
				levels += 1;
			} else if (EXPRESSION_END.indexOf(t) >= 0) {
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
		for (var i=0, ary=iter$(this._tokens), len=ary.length; i < len; i++) {
			if (T.typ(ary[i]) != 'TERMINATOR') {
				at = i;break;
			};
		};
		
		if (at) { this._tokens.splice(0,at) };
		return;
	};
	
	// Some blocks occur in the middle of expressions -- when we're expecting
	// this, remove their trailing newlines.
	Rewriter.prototype.removeMidExpressionNewlines = function (){
		var self=this;
		return self.scanTokens(function(token,i,tokens) { // do |token,i,tokens|
			var next = self.tokenType(i + 1);
			
			if (!(T.typ(token) == 'TERMINATOR' && EXPRESSION_CLOSE.indexOf(next) >= 0)) { return 1 };
			if (next == 'OUTDENT') { return 1 };
			tokens.splice(i,1);
			return 0;
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
		var condition = function(token,i) {
			var t = T.typ(token);
			return (t == ')' || t == 'CALL_END') || t == 'OUTDENT' && self.tokenType(i - 1) == ')';
		};
		
		var action = function(token,i) {
			var t = T.typ(token);
			var tok = self._tokens[t == 'OUTDENT' ? (i - 1) : (i)];
			return T.setTyp(tok,'CALL_END');
		};
		
		return self.scanTokens(function(token,i) {
			if (T.typ(token) == 'CALL_START') { self.detectEnd(i + 1,condition,action) };
			return 1;
		});
	};
	
	// The lexer has tagged the opening parenthesis of an indexing operation call.
	// Match it with its paired close.
	Rewriter.prototype.closeOpenIndexes = function (){
		var self=this;
		var condition = function(token,i) {
			return idx$(T.typ(token),[']','INDEX_END']) >= 0;
		};
		var action = function(token,i) {
			return T.setTyp(token,'INDEX_END');
		};
		
		return self.scanTokens(function(token,i) {
			if (T.typ(token) == 'INDEX_START') { self.detectEnd(i + 1,condition,action) };
			return 1;
		});
	};
	
	
	Rewriter.prototype.closeOpenTagAttrLists = function (){
		var self=this;
		var condition = function(token,i) {
			return idx$(T.typ(token),[')','TAG_ATTRS_END']) >= 0;
		};
		var action = function(token,i) {
			return T.setTyp(token,'TAG_ATTRS_END');
		}; // 'TAG_ATTRS_END'
		
		return self.scanTokens(function(token,i) {
			if (T.typ(token) == 'TAG_ATTRS_START') { self.detectEnd(i + 1,condition,action) };
			return 1;
		});
	};
	
	// The lexer has tagged the opening parenthesis of an indexing operation call.
	// Match it with its paired close. Should be done in lexer directly
	Rewriter.prototype.closeOpenTags = function (){
		var self=this;
		var condition = function(token,i) {
			return idx$(T.typ(token),['>','TAG_END']) >= 0;
		};
		var action = function(token,i) {
			return T.setTyp(token,'TAG_END');
		}; // token[0] = 'TAG_END'
		
		return self.scanTokens(function(token,i) {
			if (T.typ(token) == 'TAG_START') { self.detectEnd(i + 1,condition,action) };
			return 1;
		});
	};
	
	Rewriter.prototype.addImplicitCommas = function (){
		return;
	};
	
	Rewriter.prototype.addImplicitBlockCalls = function (){
		var token;
		var i = 1;
		var tokens = this._tokens;
		
		while (token = tokens[i]){
			var t = token._type;
			var v = token._value;
			// hmm
			if (t == 'DO' && (v == 'INDEX_END' || v == 'IDENTIFIER' || v == 'NEW')) {
				tokens.splice(i + 1,0,T.token('CALL_END',')'));
				tokens.splice(i + 1,0,T.token('CALL_START','('));
				i++;
			};
			i++;
		};
		
		return;
	};
	
	// Object literals may be written with implicit braces, for simple cases.
	// Insert the missing braces here, so that the parser doesn't have to.
	Rewriter.prototype.addImplicitBraces = function (){
		var self=this;
		var stack = [];
		var start = null;
		var startIndent = 0;
		var startIdx = null;
		
		var scope = function() {
			return stack[stack.length - 1] || [];
		};
		
		var action = function(token,i) {
			return self._tokens.splice(i,0,T.RBRACKET);
		};
		
		var open = function(token,i) {
			return self._tokens.splice(i,0,T.LBRACKET);
		};
		
		var close = function(token,i) {
			return self._tokens.splice(i,0,T.RBRACKET);
		};
		
		var stackToken = function(a,b) {
			return [a,b];
		};
		
		return self.scanTokens(function(token,i,tokens) {
			var type = T.typ(token);
			var v = T.val(token);
			var ctx = stack[stack.length - 1] || [];
			var idx;
			
			if (v == '?') {
				// console.log('TERNARY OPERATOR!')
				stack.push(stackToken('TERNARY',i));
				return 1;
			};
			
			// no need to test for this here as well as in
			if (EXPRESSION_START.indexOf(type) >= 0) {
				// console.log('expression start',type)
				if (type == 'INDENT' && self.tokenType(i - 1) == '{') {
					// stack ?!? no token
					stack.push(stackToken('{',i)); // should not autogenerate another?
				} else {
					stack.push(stackToken(type,i));
				};
				return 1;
			};
			
			if (EXPRESSION_END.indexOf(type) >= 0) {
				if (ctx[0] == 'TERNARY') { // FIX?
					stack.pop();
				};
				
				start = stack.pop();
				if (!start) {
					console.log("NO STACK!!");
				};
				start[2] = i;
				
				// seems like the stack should use tokens, no?)
				if (start[0] == '{' && start.generated) { //  # type != '}' # and start:generated
					close(token,i);
					return 1;
				};
				
				return 1;
			};
			
			
			if (ctx[0] == 'TERNARY' && (type == 'TERMINATOR' || type == 'OUTDENT')) {
				stack.pop();
				return 1;
			};
			
			
			if (type == ',') {
				// automatically add an ending here if inside:generated scope?
				// it is important that this is:generated(!)
				if (ctx[0] == '{' && ctx.generated) {
					tokens.splice(i,0,T.RBRACKET);
					stack.pop();
					return 2;
				} else {
					return 1;
				};
				true;
			};
			
			// found a type
			if (type == ':' && ctx[0] != '{' && ctx[0] != 'TERNARY') {
				// could just check if the end was right before this?
				
				if (start && start[2] == i - 1) {
					// console.log('this expression was just ending before colon!')
					idx = start[1] - 1; // these are the stackTokens
				} else {
					// console.log "rewrite here? #{i}"
					idx = i - 2; // if start then start[1] - 1 else i - 2
					// idx = idx - 1 if tokenType(idx) is 'TERMINATOR'
				};
				
				while (self.tokenType(idx - 1) == 'HERECOMMENT'){
					idx -= 2;
				};
				
				var t0 = tokens[idx - 1];
				
				if (t0 && T.typ(t0) == '}' && t0.generated) {
					tokens.splice(idx - 1,1);
					var s = stackToken('{');
					s.generated = true;
					stack.push(s);
					return 0;
				} else if (t0 && T.typ(t0) == ',' && self.tokenType(idx - 2) == '}') {
					tokens.splice(idx - 2,1);
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
			
			if (type == 'DO') { // and ctx:generated
				var prev = T.typ(tokens[i - 1]); // [0]
				if (['NUMBER','STRING','REGEX','SYMBOL',']','}',')'].indexOf(prev) >= 0) {
					
					var tok = T.token(',',',');
					tok.generated = true;
					tokens.splice(i,0,tok);
					
					if (ctx.generated) {
						close(token,i);
						stack.pop();
						return 2;
					};
				};
			};
			
			if ((type == 'TERMINATOR' || type == 'OUTDENT' || type == 'DEF_BODY') && ctx.generated) {
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
		var self=this, token;
		var noCall = false;
		var noCallTag = ['CLASS','IF','UNLESS','TAG','WHILE','FOR','UNTIL','CATCH','FINALLY','MODULE','LEADING_WHEN'];
		
		var action = function(token,i) {
			return self._tokens.splice(i,0,T.token('CALL_END',')'));
		};
		
		// console.log "adding implicit parenthesis" # ,self:scanTokens
		var tokens = self._tokens;
		
		
		var endCallAtTerminator = false;
		
		var i = 0;
		while (token = tokens[i]){
			// console.log "detect end??"
			var type = token._type;
			
			// Never make these tags implicitly call
			if (noCallTag.indexOf(type) >= 0) {
				// console.log("is nocall {type}")
				endCallAtTerminator = true;
				noCall = true;
			};
			
			var prev = tokens[i - 1];
			var current = tokens[i];
			var next = tokens[i + 1];
			
			var pt = prev && prev._type;
			var nt = next && next._type;
			
			var callObject = false;
			var callIndent = false;
			
			// [prev, current, next] = tokens[i - 1 .. i + 1]
			
			// check for comments
			// console.log "detect end??"
			if (!noCall && type == 'INDENT' && next) {
				var prevImpFunc = pt && IMPLICIT_FUNC.indexOf(pt) >= 0;
				var nextImpCall = nt && IMPLICIT_CALL.indexOf(nt) >= 0;
				callObject = ((next.generated && nt == '{') || nextImpCall) && prevImpFunc;
				callIndent = nextImpCall && prevImpFunc;
			};
			
			var seenSingle = false;
			var seenControl = false;
			// Hmm ?
			
			// this is not correct if this is inside a block,no?
			if ((type == 'TERMINATOR' || type == 'OUTDENT' || type == 'INDENT')) {
				endCallAtTerminator = false;
				noCall = false;
			};
			
			if (type == '?' && prev && !(prev.spaced)) { token.call = true };
			
			// where does fromThem come from?
			if (token.fromThen) {
				i += 1;continue;
			};
			// here we deal with :spaced and :newLine
			if (!(callObject || callIndent || (prev && prev.spaced) && (prev.call || IMPLICIT_FUNC.indexOf(pt) >= 0) && (IMPLICIT_CALL.indexOf(type) >= 0 || !(token.spaced || token.newLine) && IMPLICIT_UNSPACED_CALL.indexOf(type) >= 0))) {
				i += 1;continue;
			};
			
			
			tokens.splice(i,0,T.token('CALL_START','('));
			
			var cond = function(token,i) {
				var type = T.typ(token);
				if (!seenSingle && token.fromThen) { return true };
				var ifelse = type == 'IF' || type == 'UNLESS' || type == 'ELSE';
				if (ifelse || type == 'CATCH') { seenSingle = true };
				if (ifelse || type == 'SWITCH' || type == 'TRY') { seenControl = true };
				var prev = self.tokenType(i - 1);
				
				if ((type == '.' || type == '?.' || type == '::') && prev == 'OUTDENT') { return true };
				if (endCallAtTerminator && (type == 'INDENT' || type == 'TERMINATOR')) { return true };
				
				var post = tokens[i + 1];
				var postTyp = post && T.typ(post);
				// WTF
				return !(token.generated) && prev != ',' && (IMPLICIT_END.indexOf(type) >= 0 || (type == 'INDENT' && !seenControl) || (type == 'DOS' && prev != '=')) && (type != 'INDENT' || (self.tokenType(i - 2) != 'CLASS' && IMPLICIT_BLOCK.indexOf(prev) == -1 && !(post && ((post.generated && postTyp == '{') || IMPLICIT_CALL.indexOf(postTyp) >= 0))));
			};
			
			// The action for detecting when the call should end
			// console.log "detect end??"
			self.detectEnd(i + 1,cond,action);
			if (T.typ(prev) == '?') { T.setTyp(prev,'FUNC_EXIST') };
			i += 2;
		};
		
		return;
	};
	
	// Because our grammar is LALR(1), it can't handle some single-line
	// expressions that lack ending delimiters. The **Rewriter** adds the implicit
	// blocks, so it doesn't need to. ')' can close a single-line block,
	// but we need to make sure it's balanced.
	Rewriter.prototype.addImplicitIndentation = function (){
		
		
		var self=this, token;
		var i = 0;
		var tokens = self._tokens;
		while (token = tokens[i]){
			var type = T.typ(token);
			var next = self.tokenType(i + 1);
			
			// why are we removing terminators after then? should be able to handle
			if (type == 'TERMINATOR' && next == 'THEN') {
				tokens.splice(i,1);
				continue;
			};
			
			if (type == 'CATCH' && idx$(self.tokenType(i + 2),['OUTDENT','TERMINATOR','FINALLY']) >= 0) {
				tokens.splice.apply(tokens,[].concat([i + 2,0], [].slice.call(self.indentation(token))));
				i += 4;continue;
			};
			
			if (SINGLE_LINERS.indexOf(type) >= 0 && (next != 'INDENT' && next != 'BLOCK_PARAM_START') && !(type == 'ELSE' && next == 'IF') && type != 'ELIF') {
				
				var starter = type;
				
				var indent = T.token('INDENT','2');
				var outdent = T.OUTDENT;
				// var indent, outdent = indentation(token)
				if (starter == 'THEN') { indent.fromThen = true }; // setting special values for these -- cannot really reuse?
				indent.generated = true;
				// outdent:generated = true
				tokens.splice(i + 1,0,indent);
				
				var condition = function(token,i) {
					var t = T.typ(token);
					return T.val(token) != ';' && SINGLE_CLOSERS.indexOf(t) >= 0 && !(t == 'ELSE' && starter != 'IF' && starter != 'THEN');
				};
				
				var action = function(token,i) {
					var idx = self.tokenType(i - 1) == ',' ? (i - 1) : (i);
					return tokens.splice(idx,0,outdent);
				};
				
				self.detectEnd(i + 2,condition,action);
				if (type == 'THEN') { tokens.splice(i,1) };
			};
			
			i++;
		};
		
		return;
	};
	
	// Tag postfix conditionals as such, so that we can parse them with a
	// different precedence.
	Rewriter.prototype.tagPostfixConditionals = function (){
		var self=this;
		var condition = function(token,i) {
			return idx$(T.typ(token),['TERMINATOR','INDENT']) >= 0;
		};
		
		return self.scanTokens(function(token,i) {
			if (T.typ(token) != 'IF') { return 1 };
			var original = token;
			self.detectEnd(i + 1,condition,function(token,i) {
				if (T.typ(token) != 'INDENT') { return T.setTyp(original,'POST_' + T.typ(original)) };
			});
			return 1;
		});
	};
	
	// Generate the indentation tokens, based on another token on the same line.
	Rewriter.prototype.indentation = function (token){
		return [T.token('INDENT','2'),T.token('OUTDENT','2')];
	};
	
	// Look up a type by token index.
	Rewriter.prototype.type = function (i){
		// if i < 0 then return null
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
		['TAG_START','TAG_END'],
		['TAG_PARAM_START','TAG_PARAM_END'],
		['TAG_ATTRS_START','TAG_ATTRS_END'],
		['BLOCK_PARAM_START','BLOCK_PARAM_END']
	];
	
	// The inverse mappings of `BALANCED_PAIRS` we're trying to fix up, so we can
	// look things up from either end.
	module.exports.INVERSES = INVERSES = {};
	
	// The tokens that signal the start/end of a balanced pair.
	// var EXPRESSION_START = []
	// var EXPRESSION_END   = []
	
	for (var i=0, ary=iter$(BALANCED_PAIRS), len=ary.length, pair; i < len; i++) {
		pair = ary[i];var left = pair[0];
		var rite = pair[1];
		INVERSES[rite] = left;
		INVERSES[left] = rite;
	};
	
	var EXPRESSION_START = ['(','[','{','INDENT','CALL_START','PARAM_START','INDEX_START','TAG_PARAM_START','BLOCK_PARAM_START'];
	var EXPRESSION_END = [')',']','}','OUTDENT','CALL_END','PARAM_END','INDEX_END','TAG_PARAM_END','BLOCK_PARAM_END'];
	
	var IDENTIFIERS = ['IDENTIFIER','GVAR','IVAR','CVAR','CONST','ARGVAR'];
	
	// Tokens that indicate the close of a clause of an expression.
	var EXPRESSION_CLOSE = ['CATCH','WHEN','ELSE','FINALLY'].concat(EXPRESSION_END);
	
	// Tokens that, if followed by an `IMPLICIT_CALL`, indicate a function invocation.
	var IMPLICIT_FUNC = ['IDENTIFIER','SUPER',')',']','INDEX_END','@','THIS','SELF','EVENT','TRIGGER','TAG_END','IVAR',
	'GVAR','CONST','ARGVAR','NEW','BREAK','CONTINUE','RETURN'];
	
	// If preceded by an `IMPLICIT_FUNC`, indicates a function invocation.
	var IMPLICIT_CALL = [
		'SELECTOR','IDENTIFIER','NUMBER','STRING','SYMBOL','JS','REGEX','NEW','PARAM_START','CLASS',
		'IF','UNLESS','TRY','SWITCH','THIS','BOOL','TRUE','FALSE','NULL','UNDEFINED','UNARY','SUPER','IVAR','GVAR','CONST','ARGVAR','SELF',
		'NEW','@','[','(','{','--','++','SELECTOR','TAG_START','TAGID','#','SELECTOR_START','IDREF','SPLAT','DO','BLOCK_ARG'
	]; // '->', '=>', why does it not work with symbol?
	// is not do an implicit call??
	
	var IMPLICIT_UNSPACED_CALL = ['+','-'];
	
	// Tokens indicating that the implicit call must enclose a block of expressions.
	var IMPLICIT_BLOCK = ['{','[',',','BLOCK_PARAM_END','DO']; // '->', '=>', 
	
	var CONDITIONAL_ASSIGN = ['||=','&&=','?=','&=','|='];
	var COMPOUND_ASSIGN = ['-=','+=','/=','*=','%=','||=','&&=','?=','<<=','>>=','>>>=','&=','^=','|='];
	var UNARY = ['!','~','NEW','TYPEOF','DELETE'];
	var LOGIC = ['&&','||','&','|','^'];
	
	// optimize for fixed arrays
	var NO_IMPLICIT_BLOCK_CALL = [
		'CALL_END','=','DEF_BODY','(','CALL_START',',',':','RETURN',
		'-=','+=','/=','*=','%=','||=','&&=','?=','<<=','>>=','>>>=','&=','^=','|='
	]; // .concat(COMPOUND_ASSIGN)
	
	
	// console.log NO_IMPLICIT_BLOCK_CALL:length
	// NO_IMPLICIT_BLOCK_CALL
	// IMPLICIT_COMMA = ['->', '=>', '{', '[', 'NUMBER', 'STRING', 'SYMBOL', 'IDENTIFIER','DO']
	
	var IMPLICIT_COMMA = ['DO'];
	
	// Tokens that always mark the end of an implicit call for single-liners.
	var IMPLICIT_END = ['POST_IF','POST_UNLESS','FOR','WHILE','UNTIL','WHEN','BY','LOOP','TERMINATOR','DEF_BODY','DEF_FRAGMENT'];
	
	// Single-line flavors of block expressions that have unclosed endings.
	// The grammar can't disambiguate them, so we insert the implicit indentation.
	var SINGLE_LINERS = ['ELSE','TRY','FINALLY','THEN','BLOCK_PARAM_END','DO','BEGIN','CATCH_VAR']; // '->', '=>', really?
	var SINGLE_CLOSERS = ['TERMINATOR','CATCH','FINALLY','ELSE','OUTDENT','LEADING_WHEN'];
	
	// Tokens that end a line.
	var LINEBREAKS = ['TERMINATOR','INDENT','OUTDENT'];


}())
},{"./token":10}],10:[function(require,module,exports){
(function(){


	var TOK, LBRACKET, RBRACKET, LPAREN, RPAREN, INDENT, OUTDENT;
	module.exports.TOK = TOK = {};
	var TTERMINATOR = TOK.TERMINATOR = 1;
	var TIDENTIFIER = TOK.IDENTIFIER = 2;
	TIDENTIFIER = TOK.IVAR = 2;
	var CONST = TOK.CONST = 3;
	var VAR = TOK.VAR = 4;
	var IF = TOK.IF = 5;
	var ELSE = TOK.ELSE = 6;
	var DEF = TOK.DEF = 7;
	
	
	
	/* @class Token */
	function Token(type,value,line,loc,len){
		this._type = type;
		this._value = value;
		this._meta = null;
		this._line = line || 0;
		this._col = -1;
		this._loc = loc || 0;
		this._len = len || 0;
		this.generated = false;
		this.newLine = false;
		this.spaced = false;
		return this;
	};
	
	exports.Token = Token; // export class 
	
	
	Token.prototype.type = function (){
		return this._type;
	};
	
	Token.prototype.value = function (){
		return this._value;
	};
	
	Token.prototype.traverse = function (){
		return;
	};
	
	Token.prototype.c = function (){
		return "" + this._value;
	};
	
	Token.prototype.toString = function (){
		return this._value;
	};
	
	Token.prototype.charAt = function (i){
		return this._value.charAt(i);
	};
	
	Token.prototype.slice = function (i){
		return this._value.slice(i);
	};
	
	Token.prototype.region = function (){
		return [this._loc,this._loc + (this._len || this._value.length)];
	};
	
	
	
	function lex(){
		var line;
		var token = this.tokens[this.pos++];
		var ttag;
		
		if (token) {
			ttag = token._type;
			this.yytext = token;
			
			if (line = token._line) {
				this.yylineno = line;
			};
		} else {
			ttag = '';
		};
		
		return ttag;
	}; exports.lex = lex;
	
	
	// export def token typ, val, line, col, len do Token.new(typ,val,line, col or 0, len or 0) # [null,typ,val,loc]
	function token(typ,val){
		return new Token(typ,val,0,0,0);
	}; exports.token = token;
	
	function typ(tok){
		return tok._type;
	}; exports.typ = typ;
	function val(tok){
		return tok._value;
	}; exports.val = val; // tok[offset + 1]
	function line(tok){
		return tok._line;
	}; exports.line = line; // tok[offset + 2]
	function loc(tok){
		return tok._loc;
	}; exports.loc = loc; // tok[offset + 2]
	
	function setTyp(tok,v){
		return tok._type = v;
	}; exports.setTyp = setTyp;
	function setVal(tok,v){
		return tok._value = v;
	}; exports.setVal = setVal;
	function setLine(tok,v){
		return tok._line = v;
	}; exports.setLine = setLine;
	function setLoc(tok,v){
		return tok._loc = v;
	}; exports.setLoc = setLoc;
	
	
	module.exports.LBRACKET = LBRACKET = new Token('{','{',0,0,0);
	module.exports.RBRACKET = RBRACKET = new Token('}','}',0,0,0);
	
	module.exports.LPAREN = LPAREN = new Token('(','(',0,0,0);
	module.exports.RPAREN = RPAREN = new Token(')',')',0,0,0);
	
	LBRACKET.generated = true;
	RBRACKET.generated = true;
	LPAREN.generated = true;
	RPAREN.generated = true;
	
	module.exports.INDENT = INDENT = new Token('INDENT','2',0,0,0);
	module.exports.OUTDENT = OUTDENT = new Token('OUTDENT','2',0,0,0);


}())
},{}],11:[function(require,module,exports){

},{}],12:[function(require,module,exports){
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
},{"_process":13}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
(function (global){
/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
  ('def', '\\n+(?=' + block.def.source + ')')
  ();

block.blockquote = replace(block.blockquote)
  ('def', block.def)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top, bq) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3]
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top, true);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false, bq);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style',
        text: cap[0]
      });
      continue;
    }

    // def
    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;
  this.renderer.options = this.options;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (!this.inLink && (cap = this.rules.url.exec(src))) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += this.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      if (!this.inLink && /^<a /i.test(cap[0])) {
        this.inLink = true;
      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
        this.inLink = false;
      }
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? escape(cap[0])
        : cap[0];
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      this.inLink = true;
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      this.inLink = false;
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      this.inLink = true;
      out += this.outputLink(cap, link);
      this.inLink = false;
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[2], true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += escape(this.smartypants(cap[0]));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/--/g, '\u2014')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw) {
  return '<h'
    + level
    + ' id="'
    + this.options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return '';
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
      return '';
    }
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options, this.renderer);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text);
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        flags = { header: true, align: this.token.align[i] };
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescape(html) {
  return html.replace(/&([#\w]+);/g, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {
  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function(err) {
      if (err) {
        opt.highlight = highlight;
        return callback(err);
      }

      var out;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (err) return done(err);
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer,
  xhtml: false
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (typeof module !== 'undefined' && typeof exports === 'object') {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});