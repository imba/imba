var Imbac =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	(function(){
		var parser, lex, Rewriter;
		
		// var imba = require '../imba'
		var T = __webpack_require__(1);
		var util = __webpack_require__(2);
		var lexer = __webpack_require__(3);
		var rewriter = __webpack_require__(4);
		module.exports.parser = parser = __webpack_require__(6).parser;
		var ast = __webpack_require__(7);
		
		var ImbaParseError = __webpack_require__(5).ImbaParseError;
		
		// Instantiate a Lexer for our use here.
		module.exports.lex = lex = new (lexer.Lexer)();
		module.exports.Rewriter = Rewriter = rewriter.Rewriter;
		
		parser.lexer = lex.jisonBridge();
		parser.yy = ast; // everything is exported right here now
		
		
		function tokenize(code,o){
			if(o === undefined) o = {};
			try {
				o._source = code;
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
				if (tokens != code) o._source || (o._source = code);
				o._tokens = tokens;
				return parser.parse(tokens);
			} catch (err) {
				if (o.filename) { err._filename = o.filename };
				throw err;
			};
		}; exports.parse = parse;
		
		
		function compile(code,o){
			if(o === undefined) o = {};
			try {
				var tokens = tokenize(code,o);
				var ast = parse(tokens,o);
				return ast.compile(o);
			} catch (err) {
				if (o.filename) { err._filename = o.filename };
				tokens || (tokens = o._tokens);
				
				if (tokens && (err instanceof ImbaParseError)) {
					try {
						var tok = err.start();
					} catch (e) {
						throw err;
					};
					
					var locmap = util.locationToLineColMap(code);
					var lines = code.split(/\n/g);
					
					var lc = locmap[tok._loc] || [0,0];
					var ln = lc[0];
					var col = lc[1];
					var line = lines[ln];
					
					var message = err.message + ("\n\n" + ln) + ("\n" + (ln + 1) + " " + line) + ("\n" + (ln + 2));
					var reducer = function(s,c,i) {
						return s += i == col ? ("^") : ((c == "\t" ? (c) : (" ")));
					};
					message += line.split('').reduce(reducer,"");
					
					err.message = message;
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
				// console.log "something wrong {e:message}"
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

/***/ },
/* 1 */
/***/ function(module, exports) {

	(function(){
		var TOK, LBRACKET, RBRACKET, LPAREN, RPAREN, INDENT, OUTDENT;
		
		
		module.exports.TOK = TOK = {};
		var TTERMINATOR = TOK.TERMINATOR = 1;
		var TIDENTIFIER = TOK.IDENTIFIER = TOK.IVAR = 2;
		var CONST = TOK.CONST = 3;
		var VAR = TOK.VAR = 4;
		var IF = TOK.IF = 5;
		var ELSE = TOK.ELSE = 6;
		var DEF = TOK.DEF = 7;
		
		function Token(type,value,loc,len){
			this._type = type;
			this._value = value;
			this._loc = loc != null ? (loc) : (-1);
			this._len = len || 0;
			this._meta = null;
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
		
		Token.prototype.sourceMapMarker = function (){
			return this._loc == -1 ? (':') : (("%$" + (this._loc) + "$%"));
			// @col == -1 ? '' : "%%{@line}${@col}%%"
		};
		
		
		function lex(){
			var token = this.tokens[this.pos++];
			var ttag;
			
			if (token) {
				ttag = token._type;
				this.yytext = token;
			} else {
				ttag = '';
			};
			
			return ttag;
		}; exports.lex = lex;
		
		
		// export def token typ, val, line, col, len do Token.new(typ,val,line, col or 0, len or 0) # [null,typ,val,loc]
		function token(typ,val){
			return new Token(typ,val,-1,0);
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
		return module.exports.OUTDENT = OUTDENT = new Token('OUTDENT','2',0,0,0);

	})();

/***/ },
/* 2 */
/***/ function(module, exports) {

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
		
		function normalizeIndentation(str){
			var m;
			var reg = /\n+([^\n\S]*)/g;
			var ind = null;
			
			var length_;while (m = reg.exec(str)){
				var attempt = m[1];
				if (ind == null || 0 < (length_ = attempt.length) && length_ < ind.length) {
					ind = attempt;
				};
			};
			
			if (ind) { str = str.replace(RegExp(("\\n" + ind),"g"),'\n') };
			return str;
		}; exports.normalizeIndentation = normalizeIndentation;
		
		
		function flatten(arr){
			var out = [];
			arr.forEach(function(v) { return v instanceof Array ? (out.push.apply(out,flatten(v))) : (out.push(v)); });
			return out;
		}; exports.flatten = flatten;
		
		
		function pascalCase(str){
			return str.replace(/(^|[\-\_\s])(\w)/g,function(m,v,l) { return l.toUpperCase(); });
		}; exports.pascalCase = pascalCase;
		
		function camelCase(str){
			str = String(str);
			// should add shortcut out
			return str.replace(/([\-\_\s])(\w)/g,function(m,v,l) { return l.toUpperCase(); });
		}; exports.camelCase = camelCase;
		
		function snakeCase(str){
			var str = str.replace(/([\-\s])(\w)/g,'_');
			return str.replace(/()([A-Z])/g,"_$1",function(m,v,l) { return l.toUpperCase(); });
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
				str = str.replace(/([\-\s])(\w)/g,function(m,v,l) { return l.toUpperCase(); });
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
		
		function locationToLineColMap(code){
			var lines = code.split(/\n/g);
			var map = [];
			
			var chr;
			var loc = 0;
			var col = 0;
			var line = 0;
			
			while (chr = code[loc]){
				map[loc] = [line,col];
				
				if (chr == '\n') {
					line++;
					col = 0;
				} else {
					col++;
				};
				
				loc++;
			};
			
			return map;
		}; exports.locationToLineColMap = locationToLineColMap;
		
		function markLineColForTokens(tokens,code){
			return this;
		}; exports.markLineColForTokens = markLineColForTokens;; return markLineColForTokens;

	})();

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

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
		
		var T = __webpack_require__(1);
		var Token = T.Token;
		
		var rw = __webpack_require__(4);
		var Rewriter = rw.Rewriter;
		var INVERSES = rw.INVERSES;
		
		var K = 0;
		
		var ERR = __webpack_require__(5);
		
		// Constants
		// ---------
		
		// Keywords that Imba shares in common with JavaScript.
		var JS_KEYWORDS = [
			'true','false','null','this',
			'delete','typeof','in','instanceof',
			'throw','break','continue','debugger',
			'if','else','switch','for','while','do','try','catch','finally',
			'class','extends','super','return'
		];
		
		// new can be used as a keyword in imba, since object initing is done through
		// MyObject.new. new is a very useful varname.
		
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
		IMBA_KEYWORDS = IMBA_KEYWORDS.concat(IMBA_ALIASES);
		
		// FixedArray for performance
		// var ALL_KEYWORDS = JS_KEYWORDS.concat(IMBA_KEYWORDS)
		module.exports.ALL_KEYWORDS = ALL_KEYWORDS = [
			'true','false','null','this',
			'delete','typeof','in','instanceof',
			'throw','break','continue','debugger',
			'if','else','switch','for','while','do','try','catch','finally',
			'class','extends','super','return',
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
		
		var METHOD_IDENTIFIER = /^((([\x23]?[\$A-Za-z_\x7f-\uffff][$\-\w\x7f-\uffff]*)([\=]?))|(<=>|\|(?![\|=])))/;
		// removed ~=|~| |&(?![&=])
		
		// Token matching regexes.
		// added hyphens to identifiers now - to test
		var IDENTIFIER = /^((\$|@@|@|\#)[\wA-Za-z_\-\x7f-\uffff][$\w\x7f-\uffff]*(\-[$\w\x7f-\uffff]+)*|[$A-Za-z_][$\w\x7f-\uffff]*(\-[$\w\x7f-\uffff]+)*)([^\n\S]*:(?![\*\=:$\w\x7f-\uffff]))?/;
		
		var OBJECT_KEY = /^((\$|@@|@|)[$A-Za-z_\x7f-\uffff\-][$\w\x7f-\uffff\-]*)([^\n\S\s]*:(?![\*\=:$\w\x7f-\uffff]))/;
		
		var TAG = /^(\<|%)(?=[A-Za-z\#\.\{\@\>])/;
		
		var TAG_TYPE = /^(\w[\w\d]*:)?(\w[\w\d]*)(-[\w\d]+)*/;
		var TAG_ID = /^#((\w[\w\d]*)(-[\w\d]+)*)/;
		
		var TAG_ATTR = /^([\.\:]?[\w\_]+([\-\:][\w]+)*)(\s)*\=/;
		
		var SELECTOR = /^([%\$]{1,2})([\(\w\#\.\[])/;
		var SELECTOR_PART = /^(\#|\.|:|::)?([\w]+(\-[\w]+)*)/;
		var SELECTOR_COMBINATOR = /^ (\+|\>|\~)*\s*(?=[\w\.\#\:\{\*\[])/;
		
		var SELECTOR_PSEUDO_CLASS = /^(::?)([\w]+(\-[\w]+)*)/;
		var SELECTOR_ATTR_OP = /^(\$=|\~=|\^=|\*=|\|=|=|\!=)/;
		var SELECTOR_ATTR = /^\[([\w\_\-]+)(\$=|\~=|\^=|\*=|\|=|=|\!=)/;
		
		var SYMBOL = /^\:((([\*\@$\w\x7f-\uffff]+)+([\-\\/\\\:][\w\x7f-\uffff]+)*)|==|\<=\>|\[\]|\[\]\=|\*|[\\/,\\])/;
		
		
		var NUMBER = /^0x[\da-f]+|^0b[01]+|^\d*\.?\d+(?:e[+-]?\d+)?/i;
		
		var HEREDOC = /^("""|''')([\s\S]*?)(?:\n[^\n\S]*)?\1/;
		
		var OPERATOR = /^(?:[-=]=>|===|->|!==|[-+*\/%<>&|^!?=]=|=<|>>>=?|([-+:])\1|([&|<>])\2=?|\?\.|\?\:|\.{2,3}|\*(?=[a-zA-Z\_]))/;
		
		// FIXME splat should only be allowed when the previous thing is spaced or inside call?
		
		var WHITESPACE = /^[^\n\S]+/;
		
		var COMMENT = /^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)/;
		// COMMENT    = /^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)|^(?:\s*(#\s.*|#\s*$))+/
		var INLINE_COMMENT = /^(\s*)(#[ \t\!](.*)|#[ \t]?(?=\n|$))+/;
		
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
			'NUMBER','BOOL','TAG_SELECTOR','IDREF','ARGUMENTS','}','TAG_TYPE'
		];
		
		var GLOBAL_IDENTIFIERS = ['global','exports','require'];
		
		// Tokens that, when immediately preceding a `WHEN`, indicate that the `WHEN`
		// occurs at the start of a line. We disambiguate these from trailing whens to
		// avoid an ambiguity in the grammar.
		var LINE_BREAK = ['INDENT','OUTDENT','TERMINATOR'];
		
		
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
			
			this._indentStyle = null;
			
			this._tokens = []; // Stream of parsed tokens in the form `['TYPE', value, line]`.
			this._seenFor = false;
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
				
				upcomingInput: function() { return ""; }
			};
		};
		
		
		Lexer.prototype.tokenize = function (code,o){
			
			if(o === undefined) o = {};
			if (code.length == 0) {
				return [];
			};
			
			if (!o.inline) {
				if (WHITESPACE.test(code)) {
					code = ("\n" + code);
					if (code.match(/^\s*$/g)) { return [] };
				};
				
				code = code.replace(/\r/g,'').replace(/[\t ]+$/g,'');
			};
			
			this._last = null;
			this._lastTyp = null;
			this._lastVal = null;
			
			this._code = code;
			this._opts = o;
			this._locOffset = o.loc || 0;
			
			o.indent || (o.indent = {style: null,size: null});
			// add a reference to the options object
			o._tokens = this._tokens;
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
			if (!o.inline) this.closeIndentation();
			if (!o.silent && this._ends.length) {
				this.error(("missing " + (this._ends.pop())));
			};
			
			if (o.profile) { console.timeEnd("tokenize:lexer") };
			if (o.rewrite == false || o.norewrite) { return this._tokens };
			return new Rewriter().rewrite(this._tokens,o);
		};
		
		Lexer.prototype.parse = function (code){
			var i = 0;
			var pi = 0;
			
			while (this._chunk = code.slice(i)){
				this._loc = this._locOffset + i;
				pi = (this._end == 'TAG' && this.tagDefContextToken()) || (this._inTag && this.tagContextToken()) || this.basicContext();
				i += pi;
			};
			
			return;
		};
		
		Lexer.prototype.basicContext = function (){
			return this.selectorToken() || this.symbolToken() || this.methodNameToken() || this.identifierToken() || this.whitespaceToken() || this.lineToken() || this.commentToken() || this.heredocToken() || this.tagToken() || this.stringToken() || this.numberToken() || this.regexToken() || this.jsToken() || this.literalToken() || 0;
		};
		
		Lexer.prototype.moveCaret = function (i){
			return this._loc += i;
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
			this.refreshScope();
			return this;
		};
		
		Lexer.prototype.popEnd = function (val){
			this._ends.pop();
			this._contexts.pop();
			this._end = this._ends[this._ends.length - 1];
			this.refreshScope();
			return this;
		};
		
		Lexer.prototype.refreshScope = function (){
			var ctx0 = this._ends[this._ends.length - 1];
			var ctx1 = this._ends[this._ends.length - 2];
			return this._inTag = ctx0 == 'TAG_END' || (ctx1 == 'TAG_END' && ctx0 == 'OUTDENT');
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
				var prev = last(this._tokens);
				// console.log "close def {prev}"
				// console.log('closeDef with last>',prev)
				if (tT(prev) == 'DEF_FRAGMENT') {
					true;
				} else if (tT(prev) == 'TERMINATOR') {
					// console.log "here?!??"
					var n = this._tokens.pop();
					// console.log n
					this.token('DEF_BODY','DEF_BODY',0);
					// token('TERMINATOR', '',0) unless n.@value.indexOf('//') >= 0
					this._tokens.push(n);
				} else {
					this.token('DEF_BODY','DEF_BODY',0);
				};
				
				this.pair('DEF');
			};
			return;
		};
		
		Lexer.prototype.tagContextToken = function (){
			var match;
			if (this._chunk[0] == '#') {
				this.token('#','#',1);
				return 1;
			};
			
			if (match = TAG_ATTR.exec(this._chunk)) {
				// console.log 'TAG_SDDSATTR IN tokid',match
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
			return 0;
		};
		
		Lexer.prototype.tagDefContextToken = function (){
			// console.log "tagContextToken"
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
			
			if (this._chunk[0] == '\n') {
				this.pair('TAG');
			};
			
			return 0;
		};
		
		
		Lexer.prototype.tagToken = function (){
			var match, ary;
			if (!(match = TAG.exec(this._chunk))) { return 0 };
			var ary = iter$(match);var input = ary[0],type = ary[1],identifier = ary[2];
			
			if (type == '<') {
				this.token('TAG_START','<',1);
				this.pushEnd(INVERSES.TAG_START);
				
				if (match = TAG_TYPE.exec(this._chunk.substr(1,40))) {
					// special case should probably be handled in AST
					if (match[0] != 'self') {
						this.token('TAG_TYPE',match[0],match[0].length,1);
						return input.length + match[0].length;
					};
				};
				
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
			var ary;
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
					// spaces between? -- include the whole
					this.token('SELECTOR_COMBINATOR',match[1] || " ",match[0].length);
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
						// fuck this length shit
						var idoffset = match[0].indexOf(match[1]);
						var opoffset = match[0].indexOf(match[2]);
						this.token('IDENTIFIER',match[1],match[1].length,idoffset);
						this.token('SELECTOR_ATTR_OP',match[2],match[2].length,opoffset);
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
					this.pair('%');
					return 0;
				};
			};
			
			if (!(match = SELECTOR.exec(this._chunk))) { return 0 };
			var ary = iter$(match);var input = ary[0],id = ary[1],kind = ary[2];
			
			// this is a closed selector
			if (kind == '(') {
				// token '(','('
				this.token('SELECTOR_START',id,id.length + 1);
				// self.pushEnd(')') # are we so sure about this?
				this.pushEnd('%');
				
				// @ends.push ')'
				// @ends.push '%'
				return id.length + 1;
			} else if (id == '%') {
				// we are already scoped in on a selector
				if (this.context() == '%') { return 1 };
				this.token('SELECTOR_START',id,id.length);
				// this is a separate - scope. Full selector should rather be $, and keep the single selector as %
				
				this.scope('%',{open: true});
				// @ends.push '%'
				// make sure a terminator breaks out
				return id.length;
			} else {
				return 0;
			};
		};
		
		// is this really needed? Should be possible to
		// parse the identifiers and = etc i jison?
		// what is special about methodNameToken? really?
		// this whole step should be removed - it's a huge mess
		Lexer.prototype.methodNameToken = function (){
			// we can optimize this by after a def simply
			// fetching all the way after the def until a space or (
			// and then add this to the def-token itself (as with fragment)
			if (this._chunk.charAt(0) == ' ') { return 0 };
			
			var match;
			
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
			if (!((ltyp == '.' || ltyp == 'DEF') || (m4 == '!') || match[5])) {
				return 0;
			};
			
			// again, why?
			if (id == 'self' || id == 'this' || id == 'super') { // in ['SELF','THIS']
				return 0;
			};
			
			if (id == 'new') {
				// console.log 'NEW here?'
				if (!(ltyp == '.' && this.inTag())) { typ = 'NEW' };
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
					this.token('BLOCK_PARAM_START',id,1);
					return length;
				} else if (ltyp == 'DO' || ltyp == '{') {
					// @ends.push '|'
					this.pushEnd('|');
					this.token('BLOCK_PARAM_START',id,1);
					return length;
				} else if (this._ends[this._ends.length - 1] == '|') {
					this.token('BLOCK_PARAM_END','|',1);
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
				true;
				// typ = 'GVAR'
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
				if (incls) { return true };
			};
			
			if (this._lastTyp == 'ATTR' || this._lastTyp == 'PROP') {
				return false;
			};
			
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
				// console.log 'TAG_ATTR IN tokid',match
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
				
				// FIXME loc of key includes colon
				// moveCaret(id:length)
				// console.log "ok"
				if (true) {
					// console.log "got here? {match}"
					this.token(typ,id,id.length);
					this.moveCaret(id.length);
					this.token(':',':',match[3].length);
					this.moveCaret(-id.length);
					// moveCaret(match[3]:length)
					return match[0].length;
				};
				
				// moveCaret(match[2]:length)
				// return 0
				// console.log match[3]:length
				this.token(typ,id,match[0].length);
				this.token(':',':',1);
				return match[0].length;
			};
			
			if (!(match = IDENTIFIER.exec(this._chunk))) {
				return 0;
			};
			
			var ary = iter$(match);var input = ary[0],id = ary[1],typ = ary[2],m3 = ary[3],m4 = ary[4],colon = ary[5];
			var idlen = id.length;
			
			// What is the logic here?
			if (id == 'own' && this.lastTokenType() == 'FOR') {
				this.token('OWN',id,id.length);
				return id.length;
			};
			
			var prev = last(this._tokens);
			var lastTyp = this._lastTyp;
			
			if (lastTyp == '#') {
				this.token('IDENTIFIER',id,idlen);
				return idlen;
			};
			
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
				typ = 'IDENTIFIER';
				// typ = 'GVAR'
			} else if (CONST_IDENTIFIER.test(id) || id == 'require' || id == 'global' || id == 'exports') {
				// thous should really be handled by the ast instead
				typ = 'CONST';
			} else if (id == 'elif') {
				this.token('ELSE','elif',id.length);
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
						if (String(this.value()) == '!') {
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
			
			if (colon) {
				this.token(typ,id,idlen);
				this.moveCaret(idlen);
				// console.log "add colon?"
				this.token(':',':',colon.length);
				this.moveCaret(-idlen);
			} else {
				this.token(typ,id,idlen);
			};
			
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
			
			if (match[0][0] == '.' && prev && !prev.spaced && ['IDENTIFIER',')','}',']','NUMBER'].indexOf(tT(prev)) >= 0) {
				// console.log "got here"
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
			if (prev && !prev.spaced && idx$(tT(prev),['(','{','[','.','CALL_START','INDEX_START',',','=','INDENT','TERMINATOR']) == -1) {
				this.token('.:',':',1);
				var sym = symbol.split(/[\:\\\/]/)[0]; // really?
				// token 'SYMBOL', "'#{symbol}'"
				this.token('IDENTIFIER',sym,sym.length,1);
				return (sym.length + 1);
			} else {
				// token 'SYMBOL', "'#{symbol}'"
				this.token('SYMBOL',symbol,match[0].length);
				return match[0].length;
			};
		};
		
		Lexer.prototype.escapeStr = function (str,heredoc,q){
			str = str.replace(MULTILINER,(heredoc ? ('\\n') : ('')));
			if (q) {
				var r = RegExp(("\\\\[" + q + "]"),"g");
				str = str.replace(r,q);
				str = str.replace(RegExp(("" + q),"g"),'\\$&');
			};
			return str;
			
			// str = str.replace(MULTILINER, '\\n')
			// str = str.replace(/\t/g, '\\t')
		};
		// Matches strings, including multi-line strings. Ensures that quotation marks
		// are balanced within the string's contents, and within nested interpolations.
		Lexer.prototype.stringToken = function (){
			var match,string;
			
			switch (this._chunk.charAt(0)) {
				case "'":
					if (!(match = SIMPLESTR.exec(this._chunk))) { return 0 };
					string = match[0];
					this.token('STRING',this.escapeStr(string),string.length);
					// token 'STRING', (string = match[0]).replace(MULTILINER, '\\\n'), string:length
					break;
				
				case '"':
					if (!(string = this.balancedString(this._chunk,'"'))) { return 0 };
					// what about tripe quoted strings?
					
					if (string.indexOf('{') >= 0) {
						var len = string.length;
						// if this has no interpolation?
						// we are now messing with locations - beware
						this.token('STRING_START',string.charAt(0),1);
						this.interpolateString(string.slice(1,-1));
						this.token('STRING_END',string.charAt(len - 1),1,string.length - 1);
					} else {
						len = string.length;
						// string = string.replace(MULTILINER, '\\\n')
						this.token('STRING',this.escapeStr(string),len);
					};
					break;
				
				default:
				
					return 0;
			
			};
			
			this.moveHead(string);
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
				var open = match[1];
				// console.log doc.substr(0,3),match[1]
				this.token('STRING_START',open,open.length);
				this.interpolateString(doc,{heredoc: true,offset: open.length,quote: quote});
				this.token('STRING_END',open,open.length,heredoc.length - open.length);
			} else {
				this.token('STRING',this.makeString(doc,quote,true),0);
			};
			
			this.moveHead(heredoc);
			return heredoc.length;
		};
		
		// Matches and consumes comments.
		Lexer.prototype.commentToken = function (){
			var match,length,comment,indent,prev;
			
			var typ = 'HERECOMMENT';
			
			if (match = INLINE_COMMENT.exec(this._chunk)) { // .match(INLINE_COMMENT)
				// console.log "match inline comment"
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
				
				if ((pt && pt != 'INDENT' && pt != 'TERMINATOR') || !pt) {
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
			var ary = iter$(match);var m = ary[0],regex = ary[1],flags = ary[2];
			
			// FIXME
			// if regex[..1] is '/*'
			//	error 'regular expressions cannot begin with `*`'
			
			if (regex == '//') {
				regex = '/(?:)/';
			};
			
			this.token('REGEX',("" + regex + flags),m.length);
			return m.length;
		};
		
		// Matches multiline extended regular expressions.
		// The escaping should rather happen in AST - possibly as an additional flag?
		Lexer.prototype.heregexToken = function (match){
			var ary;
			var ary = iter$(match);var heregex = ary[0],body = ary[1],flags = ary[2];
			
			if (0 > body.indexOf('#{')) {
				
				var re = body.replace(HEREGEX_OMIT,'').replace(/\//g,'\\/');
				
				if (re.match(/^\*/)) {
					this.error('regular expressions cannot begin with `*`');
				};
				
				this.token('REGEX',("/" + (re || '(?:)') + "/" + flags),heregex.length);
				return heregex.length;
			};
			
			// use more basic regex type
			
			this.token('CONST','RegExp');
			this._tokens.push(T.token('CALL_START','(',0));
			var tokens = [];
			
			for (var i = 0, items = iter$(this.interpolateString(body,{regex: true})), len = items.length, pair; i < len; i++) {
				
				pair = items[i];
				var tok = tT(pair); // FIX
				var value = tV(pair); // FIX
				
				if (tok == 'TOKENS') {
					// FIXME what is this?
					tokens.push.apply(tokens,value);
				} else {
					
					// if !value
					//	throw error?
					
					if (!(value = value.replace(HEREGEX_OMIT,''))) { continue; };
					
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
			
			var indent = match[0];
			var brCount = this.moveHead(indent);
			
			this._seenFor = false;
			// reset column as well?
			
			var prev = last(this._tokens,1);
			var whitespace = indent.substr(indent.lastIndexOf('\n') + 1);
			var size = whitespace.length;
			var noNewlines = this.unfinished();
			
			if ((/^\n#\s/).test(this._chunk)) {
				this.addLinebreaks(1);
				return 0;
			};
			
			if (size > 0) {
				if (!this._indentStyle) {
					this._opts.indent = this._indentStyle = whitespace;
				};
				
				var indentSize = 0;
				var offset = 0;
				
				while (true){
					var idx = whitespace.indexOf(this._indentStyle,offset);
					if (idx == offset) {
						indentSize++;
						offset += this._indentStyle.length;
					} else if (offset == whitespace.length) {
						break;
					} else if (this._opts.silent) {
						break;
					} else {
						// workaround to report correct location
						this._loc += indent.length - whitespace.length;
						this.token('INDENT',whitespace,whitespace.length);
						return this.error('inconsistent indentation');
					};
				};
				
				size = indentSize;
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
			
			while (this.lastTokenValue() == ';'){
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
				tokid = 'DO';
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
			} else if (prev && !prev.spaced) {
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
				var length_;while (match = HEREDOC_INDENT.exec(doc)){
					var attempt = match[1];
					if (indent == null || 0 < (length_ = attempt.length) && length_ < indent.length) {
						indent = attempt;
					};
				};
			};
			
			if (indent) { doc = doc.replace(RegExp(("\\n" + indent),"g"),'\n') };
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
						if (!stack.length) {
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
			
			if (!this._opts.silent) { return this.error(("missing " + (stack.pop()) + ", starting")) };
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
			if(options === undefined) options = {};
			var heredoc = options.heredoc;
			var quote = options.quote;
			var regex = options.regex;
			var prefix = options.prefix;
			
			var startLoc = this._loc;
			var tokens = [];
			var pi = 0;
			var i = -1;
			var locOffset = options.offset || 1;
			var strlen = str.length;
			var letter;
			var expr;
			
			var isInterpolated = false;
			// out of bounds
			while (letter = str.charAt(i += 1)){
				if (letter == '\\') {
					i += 1;
					continue;
				};
				
				if (!(str.charAt(i) == '{' && (expr = this.balancedString(str.slice(i),'}')))) {
					continue;
				};
				
				isInterpolated = true;
				
				// these have no real sense of location or anything?
				if (pi < i) {
					// this is the prefix-string - before any item
					var tok = new Token('NEOSTRING',this.escapeStr(str.slice(pi,i),heredoc,quote),this._loc + pi + locOffset,i - pi);
					// tok.@loc = @loc + pi
					// tok.@len = i - pi + 2
					tokens.push(tok);
				};
				
				tokens.push(new Token('{{','{',this._loc + i + locOffset,1));
				
				var inner = expr.slice(1,-1);
				// console.log 'inner is',inner
				// remove leading spaces 
				// need to keep track of how much whitespace we dropped from the start
				inner = inner.replace(/^[^\n\S]+/,'');
				
				if (inner.length) {
					// we need to remember the loc we start at
					// console.log('interpolate from loc',@loc,i)
					// really? why not just add to the stack??
					// what about the added 
					// should share with the selector no?
					// console.log "tokenize inner parts of string",inner
					var spaces = 0;
					var offset = this._loc + i + (expr.length - inner.length) - 1;
					// why create a whole new lexer? Should rather reuse one
					// much better to simply move into interpolation mode where
					// we continue parsing until we meet unpaired }
					var nested = new Lexer().tokenize(inner,{inline: true,rewrite: false,loc: offset + locOffset});
					// console.log nested.pop
					
					if (nested[0] && tT(nested[0]) == 'TERMINATOR') {
						nested.shift();
					};
					
					if (nested.length) {
						tokens.push.apply(tokens,nested); // T.token('TOKENS',nested,0)
					};
				};
				
				// should rather add the amount by which our lexer has moved?
				i += expr.length - 1;
				tokens.push(new Token('}}','}',this._loc + i + locOffset,1));
				pi = i + 1;
			};
			
			// adding the last part of the string here
			if (i >= pi && pi < str.length) {
				// set the length as well - or?
				// the string after?
				// console.log 'push neostring'
				tokens.push(new Token('NEOSTRING',this.escapeStr(str.slice(pi),heredoc,quote),this._loc + pi + locOffset,str.length - pi));
			};
			
			// console.log tokens:length
			if (regex) { return tokens };
			
			if (!tokens.length) { return this.token('NEOSTRING','""') };
			
			for (var j = 0, len = tokens.length; j < len; j++) {
				this._tokens.push(tokens[j]);
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
			for (var len = str.length, i = 1; i < len; i++) {
				switch (letter = str.charAt(i)) {
					case '\\':
						i++;
						continue;
						break;
					
					case end:
						stack.pop();
						if (!stack.length) {
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
			return this.popEnd();
		};
		
		
		// Helpers
		// -------
		
		// Add a token to the results, taking note of the line number.
		Lexer.prototype.token = function (id,value,len,offset){
			this._lastTyp = id;
			this._lastVal = value;
			var tok = this._last = new Token(id,value,this._loc + (offset || 0),len || 0);
			this._tokens.push(tok);
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
			// Does not work now
			body = body.replace(RegExp(("" + quote),"g"),'\\$&');
			return quote + this.escapeLines(body,heredoc) + quote;
		};
		
		// Throws a syntax error on the current `@line`.
		Lexer.prototype.error = function (message,len){
			if ((typeof this._line=='number'||this._line instanceof Number)) { message = ("" + message + " on line " + (this._line)) };
			
			if (len) {
				message += (" [" + (this._loc) + ":" + (this._loc + len) + "]");
			};
			
			var err = new SyntaxError(message);
			err.line = this._line;
			// err:columnNumber
			err = new ERR.ImbaParseError(err,{tokens: this._tokens,pos: this._tokens.length});
			err.region = [this._loc,this._loc + (len || 0)];
			throw err;
		};
		return Lexer;

	})();

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	(function(){
		function idx$(a,b){
			return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
		};
		
		function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
		var INVERSES, LINEBREAKS;
		
		// The Imba language has a good deal of optional syntax, implicit syntax,
		// and shorthand syntax. This can greatly complicate a grammar and bloat
		// the resulting parse table. Instead of making the parser handle it all, we take
		// a series of passes over the token stream, using this **Rewriter** to convert
		// shorthand into the unambiguous long form, add implicit indentation and
		// parentheses, and generally clean things up.
		
		var T = __webpack_require__(1);
		var Token = T.Token;
		
		// Based on the original rewriter.coffee from CoffeeScript
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
			var token;
			if(opts === undefined) opts = {};
			this._tokens = tokens;
			this._options = opts;
			
			// console.log "tokens in: " + tokens:length
			if (opts.profile) { console.time("tokenize:rewrite") };
			
			var i = 0;
			// flag empty methods
			while (token = tokens[i]){
				var next = tokens[i + 1];
				if (token._type == 'DEF_BODY' && next && next._type == 'TERMINATOR') {
					token._type = 'DEF_EMPTY';
				};
				i++;
			};
			
			this.step("ensureFirstLine");
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
		
		Rewriter.prototype.ensureFirstLine = function (){
			var tok = this._tokens[0];
			
			if (T.typ(tok) == 'TERMINATOR') {
				// console.log "adding bodystart"
				this._tokens = [T.token('BODYSTART','BODYSTART')].concat(this._tokens);
				// T.setTyp(tok,'HEADER')
			};
			return;
		};
		
		// Leading newlines would introduce an ambiguity in the grammar, so we
		// dispatch them here.
		Rewriter.prototype.removeLeadingNewlines = function (){
			var at = 0;
			
			for (var i = 0, ary = iter$(this._tokens), len = ary.length; i < len; i++) {
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
			var self = this;
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
			var self = this;
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
			var self = this;
			var condition = function(token,i) { return idx$(T.typ(token),[']','INDEX_END']) >= 0; };
			var action = function(token,i) { return T.setTyp(token,'INDEX_END'); };
			
			return self.scanTokens(function(token,i) {
				if (T.typ(token) == 'INDEX_START') { self.detectEnd(i + 1,condition,action) };
				return 1;
			});
		};
		
		
		Rewriter.prototype.closeOpenTagAttrLists = function (){
			var self = this;
			var condition = function(token,i) { return idx$(T.typ(token),[')','TAG_ATTRS_END']) >= 0; };
			var action = function(token,i) { return T.setTyp(token,'TAG_ATTRS_END'); }; // 'TAG_ATTRS_END'
			
			return self.scanTokens(function(token,i) {
				if (T.typ(token) == 'TAG_ATTRS_START') { self.detectEnd(i + 1,condition,action) };
				return 1;
			});
		};
		
		// The lexer has tagged the opening parenthesis of an indexing operation call.
		// Match it with its paired close. Should be done in lexer directly
		Rewriter.prototype.closeOpenTags = function (){
			var self = this;
			var condition = function(token,i) { return idx$(T.typ(token),['>','TAG_END']) >= 0; };
			var action = function(token,i) { return T.setTyp(token,'TAG_END'); }; // token[0] = 'TAG_END'
			
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
			var self = this;
			var stack = [];
			var start = null;
			var startIndent = 0;
			var startIdx = null;
			
			var noBraceTag = ['CLASS','IF','UNLESS','TAG','WHILE','FOR','UNTIL','CATCH','FINALLY','MODULE','LEADING_WHEN'];
			var noBraceContext = ['IF','TERNARY','FOR'];
			
			var noBrace = false;
			
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
				
				if (noBraceContext.indexOf(type) >= 0) {
					// console.log "found noBraceTag {type}"
					stack.push(stackToken(type,i));
					return 1;
				};
				
				if (v == '?') {
					// console.log('TERNARY OPERATOR!')
					stack.push(stackToken('TERNARY',i));
					return 1;
				};
				
				// no need to test for this here as well as in
				if (EXPRESSION_START.indexOf(type) >= 0) {
					if (type == 'INDENT' && noBraceContext.indexOf(ctx[0]) >= 0) {
						stack.pop();
					};
					
					// console.log('expression start',type,ctx[0])
					if (type == 'INDENT' && self.tokenType(i - 1) == '{') {
						// stack ?!? no token
						stack.push(stackToken('{',i)); // should not autogenerate another?
					} else {
						stack.push(stackToken(type,i));
					};
					return 1;
				};
				
				if (EXPRESSION_END.indexOf(type) >= 0) {
					// console.log "EXPRESSION_END at {type} - stack is {ctx[0]}"
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
				
				// is this correct? same for if/class etc?
				if (ctx[0] == 'TERNARY' && (type == 'TERMINATOR' || type == 'OUTDENT')) {
					stack.pop();
					return 1;
				};
				
				if (noBraceContext.indexOf(ctx[0]) >= 0 && type == 'INDENT') {
					console.log("popping noBraceContext");
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
				if (type == ':' && ctx[0] != '{' && ctx[0] != 'TERNARY' && (noBraceContext.indexOf(ctx[0]) == -1)) {
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
					if (['NUMBER','STRING','REGEX','SYMBOL',']','}',')','STRING_END'].indexOf(prev) >= 0) {
						
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
			
			var self = this, token;
			var noCallTag = ['CLASS','IF','UNLESS','TAG','WHILE','FOR','UNTIL','CATCH','FINALLY','MODULE','LEADING_WHEN'];
			
			var action = function(token,i) {
				return self._tokens.splice(i,0,T.token('CALL_END',')'));
			};
			
			// console.log "adding implicit parenthesis" # ,self:scanTokens
			var tokens = self._tokens;
			
			var noCall = false;
			var seenFor = false;
			var endCallAtTerminator = false;
			
			var i = 0;
			while (token = tokens[i]){
				
				// to handle cases like:
				// if a(do yes).test
				// 	yes
				// we need to keep a stack for balanced pairs
				// until then you must explicitly end the call like
				// if a(do yes).test()
				// 	yes
				
				var type = token._type;
				
				var prev = tokens[i - 1];
				var current = tokens[i];
				var next = tokens[i + 1];
				
				var pt = prev && prev._type;
				var nt = next && next._type;
				
				// if pt == 'WHEN'
				// Never make these tags implicitly call
				// should we not just remove these from IMPLICIT_FUNC?
				if ((pt == ')' || pt == ']') && type == 'INDENT') {
					noCall = true;
				};
				
				if (noCallTag.indexOf(pt) >= 0) {
					// console.log("seen nocall tag {pt} ({pt} {type} {nt})")
					endCallAtTerminator = true;
					noCall = true;
					if (pt == 'FOR') { seenFor = true };
				};
				
				
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
				
				if (type == '?' && prev && !prev.spaced) { token.call = true };
				
				// where does fromThem come from?
				if (token.fromThen) {
					i += 1;continue;
				};
				// here we deal with :spaced and :newLine
				if (!(callObject || callIndent || (prev && prev.spaced) && (prev.call || IMPLICIT_FUNC.indexOf(pt) >= 0) && (IMPLICIT_CALL.indexOf(type) >= 0 || !(token.spaced || token.newLine) && IMPLICIT_UNSPACED_CALL.indexOf(type) >= 0))) {
					i += 1;continue;
				};
				
				
				tokens.splice(i,0,T.token('CALL_START','('));
				// console.log "added ( {prev}"
				var cond = function(token,i) {
					var type = T.typ(token);
					if (!seenSingle && token.fromThen) { return true };
					var ifelse = type == 'IF' || type == 'UNLESS' || type == 'ELSE';
					if (ifelse || type == 'CATCH') { seenSingle = true };
					if (ifelse || type == 'SWITCH' || type == 'TRY') { seenControl = true };
					var prev = self.tokenType(i - 1);
					
					if ((type == '.' || type == '?.' || type == '::') && prev == 'OUTDENT') { return true };
					if (endCallAtTerminator && (type == 'INDENT' || type == 'TERMINATOR')) { return true };
					if ((type == 'WHEN' || type == 'BY') && !seenFor) {
						// console.log "dont close implicit call outside for"
						return false;
					};
					
					var post = tokens[i + 1];
					var postTyp = post && T.typ(post);
					// WTF
					return !token.generated && prev != ',' && (IMPLICIT_END.indexOf(type) >= 0 || (type == 'INDENT' && !seenControl) || (type == 'DOS' && prev != '=')) && (type != 'INDENT' || (self.tokenType(i - 2) != 'CLASS' && IMPLICIT_BLOCK.indexOf(prev) == -1 && !(post && ((post.generated && postTyp == '{') || IMPLICIT_CALL.indexOf(postTyp) >= 0))));
				};
				
				// The action for detecting when the call should end
				// console.log "detect end??"
				self.detectEnd(i + 1,cond,action);
				if (T.typ(prev) == '?') { T.setTyp(prev,'FUNC_EXIST') };
				i += 2;
				// need to reset after a match
				endCallAtTerminator = false;
				noCall = false;
				seenFor = false;
			};
			
			
			return;
		};
		
		// Because our grammar is LALR(1), it can't handle some single-line
		// expressions that lack ending delimiters. The **Rewriter** adds the implicit
		// blocks, so it doesn't need to. ')' can close a single-line block,
		// but we need to make sure it's balanced.
		Rewriter.prototype.addImplicitIndentation = function (){
			
			
			var self = this, token;
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
			var self = this;
			var condition = function(token,i) { return idx$(T.typ(token),['TERMINATOR','INDENT']) >= 0; };
			
			return self.scanTokens(function(token,i) {
				var typ = T.typ(token);
				if (!(typ == 'IF' || typ == 'FOR')) { return 1 };
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
			['{{','}}'],
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
		
		for (var i = 0, ary = iter$(BALANCED_PAIRS), len = ary.length, pair; i < len; i++) {
			pair = ary[i];
			var left = pair[0];
			var rite = pair[1];
			INVERSES[rite] = left;
			INVERSES[left] = rite;
		};
		
		var EXPRESSION_START = ['(','[','{','INDENT','CALL_START','PARAM_START','INDEX_START','TAG_PARAM_START','BLOCK_PARAM_START','STRING_START','{{','TAG_START'];
		var EXPRESSION_END = [')',']','}','OUTDENT','CALL_END','PARAM_END','INDEX_END','TAG_PARAM_END','BLOCK_PARAM_END','STRING_END','}}','TAG_END'];
		
		var IDENTIFIERS = ['IDENTIFIER','GVAR','IVAR','CVAR','CONST','ARGVAR'];
		
		// Tokens that indicate the close of a clause of an expression.
		var EXPRESSION_CLOSE = ['CATCH','WHEN','ELSE','FINALLY'].concat(EXPRESSION_END);
		
		// Tokens that, if followed by an `IMPLICIT_CALL`, indicate a function invocation.
		var IMPLICIT_FUNC = ['IDENTIFIER','SUPER','@','THIS','SELF','EVENT','TRIGGER','TAG_END','IVAR',
		'GVAR','CONST','ARGVAR','NEW','BREAK','CONTINUE','RETURN'];
		
		// If preceded by an `IMPLICIT_FUNC`, indicates a function invocation.
		var IMPLICIT_CALL = [
			'SELECTOR','IDENTIFIER','NUMBER','STRING','SYMBOL','JS','REGEX','NEW','PARAM_START','CLASS',
			'IF','UNLESS','TRY','SWITCH','THIS','BOOL','TRUE','FALSE','NULL','UNDEFINED','UNARY','SUPER','IVAR','GVAR','CONST','ARGVAR','SELF',
			'@','[','(','{','--','++','SELECTOR','TAG_START','TAGID','#','SELECTOR_START','IDREF','SPLAT','DO','BLOCK_ARG',
			'FOR','STRING_START','CONTINUE','BREAK'
		]; // '->', '=>', why does it not work with symbol?
		
		var IMPLICIT_INDENT_CALL = [
			'FOR'
		];
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
		var IMPLICIT_END = ['POST_IF','POST_UNLESS','POST_FOR','WHILE','UNTIL','WHEN','BY','LOOP','TERMINATOR','DEF_BODY','DEF_FRAGMENT'];
		
		// Single-line flavors of block expressions that have unclosed endings.
		// The grammar can't disambiguate them, so we insert the implicit indentation.
		var SINGLE_LINERS = ['ELSE','TRY','FINALLY','THEN','BLOCK_PARAM_END','DO','BEGIN','CATCH_VAR']; // '->', '=>', really?
		var SINGLE_CLOSERS = ['TERMINATOR','CATCH','FINALLY','ELSE','OUTDENT','LEADING_WHEN'];
		
		// Tokens that end a line.
		return LINEBREAKS = ['TERMINATOR','INDENT','OUTDENT'];

	})();

/***/ },
/* 5 */
/***/ function(module, exports) {

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
			for (var i = 0, keys = Object.keys(opts), l = keys.length; i < l; i++){
				this._options[keys[i]] = opts[keys[i]];
			};
			return this;
		};
		
		ImbaParseError.prototype.start = function (){
			var o = this._options;
			var idx = o.pos - 1;
			var tok = o.tokens && o.tokens[idx];
			while (tok && tok._loc == -1){
				tok = o.tokens[--idx];
			};
			return tok;
		};
		
		ImbaParseError.prototype.desc = function (){
			var o = this._options;
			var msg = this.message;
			if (o.token && o.token._loc == -1) {
				return 'Syntax Error';
			} else {
				return msg;
			};
		};
		
		ImbaParseError.prototype.loc = function (){
			var start_;
			return (start_ = this.start()) && start_.region  &&  start_.region();
		};
		
		ImbaParseError.prototype.toJSON = function (){
			var o = this._options;
			var tok = this.start();
			// var tok = o:tokens and o:tokens[o:pos - 1]
			// var loc = tok and [tok.@loc,tok.@loc + (tok.@len or tok.@value:length)] or [0,0]
			// , col: tok.@col, line: tok.@line
			// get the token itself?
			return {warn: true,message: this.desc(),loc: this.loc()};
		};
		return ImbaParseError;

	})();

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* parser generated by jison-fork */
	var parser = (function(){
	var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,4],$V1=[1,6],$V2=[1,32],$V3=[1,33],$V4=[1,34],$V5=[1,35],$V6=[1,75],$V7=[1,115],$V8=[1,128],$V9=[1,121],$Va=[1,122],$Vb=[1,123],$Vc=[1,120],$Vd=[1,124],$Ve=[1,131],$Vf=[1,114],$Vg=[1,132],$Vh=[1,80],$Vi=[1,81],$Vj=[1,82],$Vk=[1,83],$Vl=[1,84],$Vm=[1,85],$Vn=[1,86],$Vo=[1,73],$Vp=[1,118],$Vq=[1,113],$Vr=[1,91],$Vs=[1,88],$Vt=[1,71],$Vu=[1,65],$Vv=[1,66],$Vw=[1,110],$Vx=[1,90],$Vy=[1,87],$Vz=[1,28],$VA=[1,29],$VB=[1,95],$VC=[1,94],$VD=[1,111],$VE=[1,112],$VF=[1,126],$VG=[1,67],$VH=[1,68],$VI=[1,119],$VJ=[1,11],$VK=[1,127],$VL=[1,78],$VM=[1,37],$VN=[1,43],$VO=[1,109],$VP=[1,69],$VQ=[1,89],$VR=[1,125],$VS=[1,59],$VT=[1,74],$VU=[1,104],$VV=[1,105],$VW=[1,106],$VX=[1,129],$VY=[1,130],$VZ=[1,63],$V_=[1,103],$V$=[1,51],$V01=[1,52],$V11=[1,53],$V21=[1,54],$V31=[1,55],$V41=[1,56],$V51=[1,134],$V61=[1,6,11,137],$V71=[1,136],$V81=[1,6,11,14,137],$V91=[1,144],$Va1=[1,145],$Vb1=[1,147],$Vc1=[1,148],$Vd1=[1,141],$Ve1=[1,140],$Vf1=[1,142],$Vg1=[1,143],$Vh1=[1,146],$Vi1=[1,151],$Vj1=[1,6,10,11,14,22,71,90,97,106,112,126,135,137,147,171,200,201,212,213,214,219,220,229,238,239,242,243,246,247,248],$Vk1=[2,263],$Vl1=[1,158],$Vm1=[1,162],$Vn1=[1,160],$Vo1=[1,161],$Vp1=[1,164],$Vq1=[1,163],$Vr1=[1,6,10,11,14,22,90,97,137],$Vs1=[1,6,11,14,137,212,214,219,220,238],$Vt1=[1,6,10,11,14,21,22,71,88,90,97,106,111,112,126,135,137,144,147,171,180,181,183,196,200,201,212,213,214,219,220,229,238,239,242,243,246,247,248],$Vu1=[2,231],$Vv1=[1,175],$Vw1=[1,6,10,11,14,21,22,71,88,90,97,106,111,112,117,126,135,137,144,147,171,180,181,183,196,200,201,212,213,214,219,220,229,238,239,242,243,246,247,248],$Vx1=[2,227],$Vy1=[6,14,53,54,88,91,106,111,113,116],$Vz1=[1,210],$VA1=[1,215],$VB1=[1,6,10,11,14,21,22,71,88,90,97,106,111,112,117,126,135,137,144,147,171,180,181,183,196,200,201,212,213,214,219,220,229,238,239,242,243,244,245,246,247,248,249],$VC1=[1,225],$VD1=[1,222],$VE1=[1,227],$VF1=[1,263],$VG1=[1,264],$VH1=[51,89],$VI1=[2,244],$VJ1=[1,274],$VK1=[85,86,87,88,91,92,93,94,95,96,100,102],$VL1=[1,286],$VM1=[1,6,10,11,14,21,22,53,54,71,88,90,91,97,106,111,112,113,116,117,126,135,137,144,147,171,180,181,183,196,200,201,212,213,214,219,220,229,238,239,242,243,244,245,246,247,248,249],$VN1=[1,292],$VO1=[51,89,96,225],$VP1=[1,6,10,11,14,21,22,67,69,70,71,88,90,97,106,111,112,126,135,137,144,147,171,180,181,183,196,200,201,212,213,214,219,220,229,238,239,242,243,246,247,248],$VQ1=[1,6,10,11,14,21,22,71,88,90,97,106,111,112,126,135,137,144,147,171,180,181,183,196,200,201,207,208,212,213,214,219,220,229,232,234,237,238,239,242,243,246,247,248],$VR1=[51,53,54,58],$VS1=[1,323],$VT1=[1,324],$VU1=[1,6,10,11,14,22,71,90,97,106,112,135,137,147,200,201,212,213,214,219,220,229,238],$VV1=[1,337],$VW1=[1,341],$VX1=[1,6,11,14,22,71,90,97,106,112,126,135,137,147,171,200,201,212,213,214,219,220,229,238,239,242,243,246,247,248],$VY1=[6,14,106],$VZ1=[1,351],$V_1=[1,6,10,11,14,21,22,71,89,90,97,106,112,126,135,137,147,171,200,201,212,213,214,219,220,229,238,239,242,243,246,247,248],$V$1=[14,28],$V02=[1,6,11,14,28,137,212,214,219,220,238],$V12=[2,284],$V22=[1,6,10,11,14,21,22,71,88,90,97,106,111,112,117,126,135,137,144,147,171,180,181,183,196,200,201,212,213,214,219,220,227,228,229,238,239,242,243,244,245,246,247,248,249],$V32=[2,184],$V42=[1,366],$V52=[6,10,11,14,22,97],$V62=[2,186],$V72=[1,376],$V82=[1,377],$V92=[1,378],$Va2=[1,6,10,11,14,22,71,90,97,106,112,135,137,147,200,201,220,229,238],$Vb2=[1,6,10,11,14,22,71,90,97,106,112,135,137,147,200,201,213,220,229,238],$Vc2=[227,228],$Vd2=[14,227,228],$Ve2=[1,6,11,14,22,71,90,97,106,112,135,137,147,171,200,201,212,213,214,219,220,229,238,239,242,243,246,247,248],$Vf2=[1,392],$Vg2=[6,10,11,14,90],$Vh2=[6,10,11,14,90,135],$Vi2=[88,91],$Vj2=[1,402],$Vk2=[1,403],$Vl2=[21,88,91,164,165],$Vm2=[1,6,10,11,14,22,71,90,97,106,112,126,135,137,147,171,200,201,212,213,214,219,220,229,238,239,242,243,247,248],$Vn2=[1,6,10,11,14,22,71,90,97,106,112,135,137,147,200,201,213,229],$Vo2=[19,20,23,24,26,32,51,53,54,56,58,60,62,64,66,73,74,75,76,77,78,79,80,83,89,91,96,103,112,122,123,124,130,136,143,144,151,152,154,156,157,158,175,184,185,188,193,194,197,198,204,210,212,214,216,219,220,230,236,240,241,242,243,244,245],$Vp2=[1,6,10,11,14,22,71,90,97,106,112,126,135,137,147,171,200,201,212,213,214,219,220,229,232,237,238,239,242,243,246,247,248],$Vq2=[11,232,234],$Vr2=[1,450],$Vs2=[2,185],$Vt2=[6,10,11],$Vu2=[1,458],$Vv2=[14,22,147],$Vw2=[1,6,10,11,14,22,71,90,97,106,112,135,137,147,200,201,212,214,219,220,229,238],$Vx2=[1,473],$Vy2=[51,58,89],$Vz2=[14,22],$VA2=[1,488],$VB2=[10,14],$VC2=[1,537],$VD2=[6,10];
	var parser = {trace: function trace() { },
	yy: {},
	symbols_: {"error":2,"Root":3,"Body":4,"Block":5,"TERMINATOR":6,"BODYSTART":7,"Line":8,"Terminator":9,"INDENT":10,"OUTDENT":11,"Splat":12,"Expression":13,",":14,"Comment":15,"Statement":16,"Return":17,"Throw":18,"STATEMENT":19,"BREAK":20,"CALL_START":21,"CALL_END":22,"CONTINUE":23,"DEBUGGER":24,"ImportStatement":25,"IMPORT":26,"ImportArgList":27,"FROM":28,"ImportFrom":29,"AS":30,"ImportArg":31,"STRING":32,"VarIdentifier":33,"Await":34,"Value":35,"Code":36,"Operation":37,"Assign":38,"If":39,"Ternary":40,"Try":41,"While":42,"For":43,"Switch":44,"Class":45,"Module":46,"TagDeclaration":47,"Tag":48,"Property":49,"Identifier":50,"IDENTIFIER":51,"Ivar":52,"IVAR":53,"CVAR":54,"Gvar":55,"GVAR":56,"Const":57,"CONST":58,"Argvar":59,"ARGVAR":60,"Symbol":61,"SYMBOL":62,"AlphaNumeric":63,"NUMBER":64,"InterpolatedString":65,"STRING_START":66,"NEOSTRING":67,"Interpolation":68,"STRING_END":69,"{{":70,"}}":71,"Literal":72,"JS":73,"REGEX":74,"BOOL":75,"TRUE":76,"FALSE":77,"NULL":78,"UNDEFINED":79,"RETURN":80,"Arguments":81,"TagSelector":82,"SELECTOR_START":83,"TagSelectorType":84,"SELECTOR_NS":85,"SELECTOR_ID":86,"SELECTOR_CLASS":87,".":88,"{":89,"}":90,"#":91,"SELECTOR_COMBINATOR":92,"SELECTOR_PSEUDO_CLASS":93,"SELECTOR_GROUP":94,"UNIVERSAL_SELECTOR":95,"[":96,"]":97,"SELECTOR_ATTR_OP":98,"TagSelectorAttrValue":99,"SELECTOR_TAG":100,"Selector":101,"SELECTOR_END":102,"TAG_START":103,"TagOptions":104,"TagAttributes":105,"TAG_END":106,"TagBody":107,"TagTypeName":108,"Self":109,"TAG_TYPE":110,"INDEX_START":111,"INDEX_END":112,"@":113,"TagAttr":114,"OptComma":115,"TAG_ATTR":116,"=":117,"TagAttrValue":118,"ArgList":119,"TagTypeDef":120,"TagDeclarationBlock":121,"EXTEND":122,"LOCAL":123,"TAG":124,"TagType":125,"COMPARE":126,"TagDeclKeywords":127,"TAG_ID":128,"TagId":129,"IDREF":130,"Assignable":131,"Outdent":132,"AssignObj":133,"ObjAssignable":134,":":135,"(":136,")":137,"HERECOMMENT":138,"COMMENT":139,"Method":140,"Do":141,"Begin":142,"BEGIN":143,"DO":144,"BLOCK_PARAM_START":145,"ParamList":146,"BLOCK_PARAM_END":147,"PropType":148,"PropertyIdentifier":149,"Object":150,"PROP":151,"ATTR":152,"TupleAssign":153,"VAR":154,"MethodDeclaration":155,"GLOBAL":156,"EXPORT":157,"DEF":158,"MethodScope":159,"MethodScopeType":160,"MethodIdentifier":161,"MethodBody":162,"MethodReceiver":163,"DEF_BODY":164,"DEF_EMPTY":165,"This":166,"Param":167,"Array":168,"ParamVar":169,"SPLAT":170,"LOGIC":171,"BLOCK_ARG":172,"VarReference":173,"VarAssignable":174,"LET":175,"SimpleAssignable":176,"NEW":177,"Super":178,"SoakableOp":179,"?:":180,".:":181,"IndexValue":182,"?.":183,"SUPER":184,"AWAIT":185,"Parenthetical":186,"Range":187,"ARGUMENTS":188,"Invocation":189,"Slice":190,"AssignList":191,"ClassStart":192,"CLASS":193,"MODULE":194,"OptFuncExist":195,"FUNC_EXIST":196,"THIS":197,"SELF":198,"RangeDots":199,"..":200,"...":201,"Arg":202,"SimpleArgs":203,"TRY":204,"Catch":205,"Finally":206,"FINALLY":207,"CATCH":208,"CATCH_VAR":209,"THROW":210,"WhileSource":211,"WHILE":212,"WHEN":213,"UNTIL":214,"Loop":215,"LOOP":216,"ForBody":217,"ForKeyword":218,"FOR":219,"POST_FOR":220,"ForBlock":221,"ForStart":222,"ForSource":223,"ForVariables":224,"OWN":225,"ForValue":226,"FORIN":227,"FOROF":228,"BY":229,"SWITCH":230,"Whens":231,"ELSE":232,"When":233,"LEADING_WHEN":234,"IfBlock":235,"IF":236,"ELIF":237,"POST_IF":238,"?":239,"UNARY":240,"SQRT":241,"-":242,"+":243,"--":244,"++":245,"MATH":246,"SHIFT":247,"RELATION":248,"COMPOUND_ASSIGN":249,"$accept":0,"$end":1},
	terminals_: {2:"error",6:"TERMINATOR",7:"BODYSTART",10:"INDENT",11:"OUTDENT",14:",",19:"STATEMENT",20:"BREAK",21:"CALL_START",22:"CALL_END",23:"CONTINUE",24:"DEBUGGER",26:"IMPORT",28:"FROM",30:"AS",32:"STRING",51:"IDENTIFIER",53:"IVAR",54:"CVAR",56:"GVAR",58:"CONST",60:"ARGVAR",62:"SYMBOL",64:"NUMBER",66:"STRING_START",67:"NEOSTRING",69:"STRING_END",70:"{{",71:"}}",73:"JS",74:"REGEX",75:"BOOL",76:"TRUE",77:"FALSE",78:"NULL",79:"UNDEFINED",80:"RETURN",83:"SELECTOR_START",85:"SELECTOR_NS",86:"SELECTOR_ID",87:"SELECTOR_CLASS",88:".",89:"{",90:"}",91:"#",92:"SELECTOR_COMBINATOR",93:"SELECTOR_PSEUDO_CLASS",94:"SELECTOR_GROUP",95:"UNIVERSAL_SELECTOR",96:"[",97:"]",98:"SELECTOR_ATTR_OP",100:"SELECTOR_TAG",102:"SELECTOR_END",103:"TAG_START",106:"TAG_END",110:"TAG_TYPE",111:"INDEX_START",112:"INDEX_END",113:"@",116:"TAG_ATTR",117:"=",122:"EXTEND",123:"LOCAL",124:"TAG",126:"COMPARE",128:"TAG_ID",130:"IDREF",135:":",136:"(",137:")",138:"HERECOMMENT",139:"COMMENT",143:"BEGIN",144:"DO",145:"BLOCK_PARAM_START",147:"BLOCK_PARAM_END",151:"PROP",152:"ATTR",154:"VAR",156:"GLOBAL",157:"EXPORT",158:"DEF",164:"DEF_BODY",165:"DEF_EMPTY",170:"SPLAT",171:"LOGIC",172:"BLOCK_ARG",175:"LET",177:"NEW",180:"?:",181:".:",183:"?.",184:"SUPER",185:"AWAIT",188:"ARGUMENTS",193:"CLASS",194:"MODULE",196:"FUNC_EXIST",197:"THIS",198:"SELF",200:"..",201:"...",204:"TRY",207:"FINALLY",208:"CATCH",209:"CATCH_VAR",210:"THROW",212:"WHILE",213:"WHEN",214:"UNTIL",216:"LOOP",219:"FOR",220:"POST_FOR",225:"OWN",227:"FORIN",228:"FOROF",229:"BY",230:"SWITCH",232:"ELSE",234:"LEADING_WHEN",236:"IF",237:"ELIF",238:"POST_IF",239:"?",240:"UNARY",241:"SQRT",242:"-",243:"+",244:"--",245:"++",246:"MATH",247:"SHIFT",248:"RELATION",249:"COMPOUND_ASSIGN"},
	productions_: [0,[3,0],[3,1],[3,2],[4,1],[4,1],[4,3],[4,2],[9,1],[5,2],[5,3],[5,4],[8,1],[8,1],[8,3],[8,3],[8,1],[8,1],[16,1],[16,1],[16,1],[16,1],[16,4],[16,1],[16,4],[16,1],[16,1],[25,4],[25,4],[25,2],[29,1],[27,1],[27,3],[31,1],[13,1],[13,1],[13,1],[13,1],[13,1],[13,1],[13,1],[13,1],[13,1],[13,1],[13,1],[13,1],[13,1],[13,1],[13,1],[13,1],[50,1],[52,1],[52,1],[55,1],[57,1],[59,1],[61,1],[63,1],[63,1],[63,1],[63,1],[65,1],[65,2],[65,2],[65,2],[68,2],[68,3],[72,1],[72,1],[72,1],[72,1],[72,1],[72,1],[72,1],[72,1],[17,2],[17,2],[17,1],[82,1],[82,2],[82,2],[82,2],[82,2],[82,5],[82,5],[82,2],[82,2],[82,2],[82,2],[82,4],[82,6],[84,1],[101,2],[99,1],[99,1],[99,3],[48,4],[48,5],[48,5],[108,1],[108,1],[108,1],[108,0],[104,1],[104,3],[104,4],[104,3],[104,3],[104,5],[104,5],[104,3],[104,2],[104,5],[105,0],[105,1],[105,3],[105,4],[114,1],[114,3],[118,1],[107,3],[107,3],[120,1],[120,3],[47,1],[47,2],[47,2],[121,2],[121,3],[121,4],[121,5],[127,0],[127,1],[125,1],[125,1],[129,1],[129,2],[38,3],[38,5],[133,1],[133,3],[133,5],[133,1],[134,1],[134,1],[134,1],[134,1],[134,1],[134,3],[15,1],[15,1],[36,1],[36,1],[36,1],[142,2],[141,2],[141,5],[49,3],[49,5],[49,2],[148,1],[148,1],[149,1],[149,3],[153,4],[140,1],[140,2],[140,2],[155,8],[155,5],[155,6],[155,3],[160,1],[160,1],[161,1],[161,1],[161,3],[162,2],[162,2],[162,1],[159,1],[159,1],[159,1],[159,1],[115,0],[115,1],[146,0],[146,1],[146,3],[167,1],[167,1],[167,1],[167,2],[167,2],[167,2],[167,3],[169,1],[12,2],[173,3],[173,2],[173,2],[173,3],[173,2],[33,1],[33,1],[174,1],[174,1],[174,1],[176,1],[176,1],[176,1],[176,1],[176,1],[176,1],[176,1],[176,3],[176,3],[176,3],[176,3],[176,3],[176,3],[176,3],[176,3],[176,4],[179,1],[179,1],[178,1],[131,1],[131,1],[131,1],[34,2],[35,1],[35,1],[35,1],[35,1],[35,1],[35,1],[35,1],[35,1],[35,1],[35,1],[182,1],[182,1],[150,4],[191,0],[191,1],[191,3],[191,4],[191,6],[45,1],[45,2],[45,2],[45,2],[45,2],[45,3],[192,2],[192,3],[192,4],[192,5],[46,2],[46,3],[189,3],[189,2],[195,0],[195,1],[81,2],[81,4],[166,1],[109,1],[168,2],[168,4],[199,1],[199,1],[187,5],[190,3],[190,2],[190,2],[119,1],[119,3],[119,4],[119,4],[119,6],[132,2],[132,1],[202,1],[202,1],[202,1],[202,1],[203,1],[203,3],[41,2],[41,3],[41,3],[41,4],[206,2],[205,3],[18,2],[186,3],[186,5],[211,2],[211,4],[211,2],[211,4],[42,2],[42,2],[42,2],[42,1],[215,2],[215,2],[43,2],[43,2],[43,2],[218,1],[218,1],[221,2],[217,2],[217,2],[222,2],[222,3],[226,1],[226,1],[226,1],[224,1],[224,3],[223,2],[223,2],[223,4],[223,4],[223,4],[223,6],[223,6],[44,5],[44,7],[44,4],[44,6],[231,1],[231,2],[233,3],[233,4],[235,3],[235,5],[235,4],[235,3],[39,1],[39,3],[39,3],[40,5],[37,2],[37,2],[37,2],[37,2],[37,2],[37,2],[37,2],[37,2],[37,3],[37,3],[37,3],[37,3],[37,3],[37,3],[37,3],[37,3],[37,5]],
	performAction: function performAction(self, yytext, yy, yystate /* action[1] */, $$ /* vstack */) {
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
	self.$ = new yy.Block([]);
	break;
	case 5:
	self.$ = new yy.Block([$$[$0]]);
	break;
	case 6:
	self.$ = $$[$0-2].break($$[$0-1]).add($$[$0]);
	break;
	case 7:
	self.$ = $$[$0-1].break($$[$0]);
	break;
	case 8:
	self.$ = new yy.Terminator($$[$0]);
	break;
	case 9:
	self.$ = new yy.Block([]).indented($$[$0-1],$$[$0]);
	break;
	case 10: case 120:
	self.$ = $$[$0-1].indented($$[$0-2],$$[$0]);
	break;
	case 11:
	self.$ = $$[$0-1].prebreak($$[$0-2]).indented($$[$0-3],$$[$0]);
	break;
	case 12: case 13: case 16: case 17: case 18: case 19: case 26: case 30: case 33: case 34: case 35: case 36: case 37: case 38: case 39: case 40: case 41: case 42: case 43: case 44: case 45: case 46: case 47: case 48: case 49: case 59: case 60: case 67: case 93: case 94: case 99: case 119: case 124: case 131: case 142: case 143: case 144: case 145: case 146: case 147: case 151: case 152: case 153: case 160: case 161: case 162: case 165: case 174: case 175: case 177: case 180: case 181: case 182: case 183: case 184: case 185: case 196: case 203: case 204: case 205: case 206: case 207: case 208: case 210: case 211: case 212: case 213: case 227: case 228: case 229: case 231: case 232: case 233: case 234: case 235: case 237: case 238: case 239: case 240: case 249: case 283: case 284: case 285: case 286: case 287: case 288: case 306: case 312: case 313: case 319: case 335: case 343:
	self.$ = $$[$0];
	break;
	case 14: case 15:
	self.$ = $$[$0-2].addExpression($$[$0]);
	break;
	case 20: case 68:
	self.$ = new yy.Literal($$[$0]);
	break;
	case 21:
	self.$ = new yy.BreakStatement($$[$0]);
	break;
	case 22:
	self.$ = new yy.BreakStatement($$[$0-3],$$[$0-1]);
	break;
	case 23:
	self.$ = new yy.ContinueStatement($$[$0]);
	break;
	case 24:
	self.$ = new yy.ContinueStatement($$[$0-3],$$[$0-1]);
	break;
	case 25:
	self.$ = new yy.DebuggerStatement($$[$0]);
	break;
	case 27:
	self.$ = new yy.ImportStatement($$[$0-2],$$[$0]);
	break;
	case 28:
	self.$ = new yy.ImportStatement(null,$$[$0-2],$$[$0]);
	break;
	case 29:
	self.$ = new yy.ImportStatement(null,$$[$0]);
	break;
	case 31: case 114: case 187: case 322:
	self.$ = [$$[$0]];
	break;
	case 32: case 115: case 188:
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
	case 61:
	self.$ = new yy.InterpolatedString([],{open: $$[$0]});
	break;
	case 62:
	self.$ = $$[$0-1].add($$[$0]);
	break;
	case 63:
	self.$ = $$[$0] ? ($$[$0-1].add($$[$0])) : ($$[$0-1]);
	break;
	case 64:
	self.$ = $$[$0-1].option('close',$$[$0]);
	break;
	case 65:
	self.$ = null;
	break;
	case 66: case 92: case 95: case 121: case 148: case 163: case 176: case 282:
	self.$ = $$[$0-1];
	break;
	case 69:
	self.$ = new yy.RegExp($$[$0]);
	break;
	case 70:
	self.$ = new yy.Bool($$[$0]);
	break;
	case 71:
	self.$ = yy.TRUE;
	break;
	case 72:
	self.$ = yy.FALSE;
	break;
	case 73:
	self.$ = yy.NIL;
	break;
	case 74:
	self.$ = yy.UNDEFINED;
	break;
	case 75: case 76:
	self.$ = new yy.Return($$[$0]);
	break;
	case 77:
	self.$ = new yy.Return();
	break;
	case 78:
	self.$ = new yy.Selector([],{type: $$[$0]});
	break;
	case 79:
	self.$ = $$[$0-1].add(new yy.SelectorType($$[$0]),'tag');
	break;
	case 80:
	self.$ = $$[$0-1].add(new yy.SelectorNamespace($$[$0]),'ns');
	break;
	case 81:
	self.$ = $$[$0-1].add(new yy.SelectorId($$[$0]),'id');
	break;
	case 82:
	self.$ = $$[$0-1].add(new yy.SelectorClass($$[$0]),'class');
	break;
	case 83:
	self.$ = $$[$0-4].add(new yy.SelectorClass($$[$0-1]),'class');
	break;
	case 84:
	self.$ = $$[$0-4].add(new yy.SelectorId($$[$0-1]),'id');
	break;
	case 85:
	self.$ = $$[$0-1].add(new yy.SelectorCombinator($$[$0]),'sep');
	break;
	case 86:
	self.$ = $$[$0-1].add(new yy.SelectorPseudoClass($$[$0]),'pseudoclass');
	break;
	case 87:
	self.$ = $$[$0-1].group();
	break;
	case 88:
	self.$ = $$[$0-1].add(new yy.SelectorUniversal($$[$0]),'universal');
	break;
	case 89:
	self.$ = $$[$0-3].add(new yy.SelectorAttribute($$[$0-1]),'attr');
	break;
	case 90:
	self.$ = $$[$0-5].add(new yy.SelectorAttribute($$[$0-3],$$[$0-2],$$[$0-1]),'attr');
	break;
	case 91: case 100: case 101: case 133: case 134:
	self.$ = new yy.TagTypeIdentifier($$[$0]);
	break;
	case 96:
	self.$ = $$[$0-2].set({attributes: $$[$0-1],open: $$[$0-3],close: $$[$0]});
	break;
	case 97:
	self.$ = $$[$0-3].set({attributes: $$[$0-2],body: $$[$0],open: $$[$0-4],close: $$[$0-1]});
	break;
	case 98:
	self.$ = new yy.TagWrapper($$[$0-2],$$[$0-4],$$[$0]);
	break;
	case 102:
	self.$ = new yy.TagTypeIdentifier('div');
	break;
	case 103:
	self.$ = new yy.Tag({type: $$[$0]});
	break;
	case 104:
	self.$ = $$[$0-2].addSymbol($$[$0]);
	break;
	case 105:
	self.$ = $$[$0-3].addIndex($$[$0-1]);
	break;
	case 106: case 107:
	self.$ = $$[$0-2].addClass($$[$0]);
	break;
	case 108:
	self.$ = $$[$0-4].addClass($$[$0-1]);
	break;
	case 109:
	self.$ = $$[$0-4].set({key: $$[$0-1]});
	break;
	case 110:
	self.$ = $$[$0-2].set({id: $$[$0]});
	break;
	case 111:
	self.$ = $$[$0-1].set({ivar: $$[$0]});
	break;
	case 112:
	self.$ = $$[$0-4].set({id: $$[$0-1]});
	break;
	case 113: case 179: case 186:
	self.$ = [];
	break;
	case 116:
	self.$ = $$[$0-3].concat($$[$0]);
	break;
	case 117:
	self.$ = new yy.TagAttr($$[$0],$$[$0]);
	break;
	case 118:
	self.$ = new yy.TagAttr($$[$0-2],$$[$0],$$[$0-1]);
	break;
	case 122:
	self.$ = new yy.TagDesc($$[$0]);
	break;
	case 123:
	self.$ = $$[$0-2].classes($$[$0]);
	break;
	case 125:
	self.$ = $$[$0].set({extension: true});
	break;
	case 126:
	self.$ = $$[$0].set({local: true});
	break;
	case 127:
	self.$ = new yy.TagDeclaration($$[$0]).set({keyword: $$[$0-1]});
	break;
	case 128:
	self.$ = new yy.TagDeclaration($$[$0-1],null,$$[$0]).set({keyword: $$[$0-2]});
	break;
	case 129:
	self.$ = new yy.TagDeclaration($$[$0-2],$$[$0]).set({keyword: $$[$0-3]});
	break;
	case 130:
	self.$ = new yy.TagDeclaration($$[$0-3],$$[$0-1],$$[$0]).set({keyword: $$[$0-4]});
	break;
	case 132:
	self.$ = ['yy.extend'];
	break;
	case 135: case 136:
	self.$ = new yy.TagId($$[$0]);
	break;
	case 137:
	self.$ = new yy.Assign($$[$0-1],$$[$0-2],$$[$0]);
	break;
	case 138:
	self.$ = new yy.Assign($$[$0-3],$$[$0-4],$$[$0-1].indented($$[$0-2],$$[$0]));
	break;
	case 139:
	self.$ = new yy.ObjAttr($$[$0]);
	break;
	case 140:
	self.$ = new yy.ObjAttr($$[$0-2],$$[$0],'object');
	break;
	case 141:
	self.$ = new yy.ObjAttr($$[$0-4],$$[$0-1].indented($$[$0-2],$$[$0]),'object');
	break;
	case 149:
	self.$ = new yy.Comment($$[$0],true);
	break;
	case 150:
	self.$ = new yy.Comment($$[$0],false);
	break;
	case 154:
	self.$ = new yy.Begin($$[$0]);
	break;
	case 155:
	self.$ = new yy.Lambda([],$$[$0],null,null,{bound: true,keyword: $$[$0-1]});
	break;
	case 156:
	self.$ = new yy.Lambda($$[$0-2],$$[$0],null,null,{bound: true,keyword: $$[$0-4]});
	break;
	case 157:
	self.$ = new yy.PropertyDeclaration($$[$0-1],$$[$0],$$[$0-2]);
	break;
	case 158:
	self.$ = new yy.PropertyDeclaration($$[$0-3],$$[$0-1],$$[$0-4]);
	break;
	case 159:
	self.$ = new yy.PropertyDeclaration($$[$0],null,$$[$0-1]);
	break;
	case 164:
	self.$ = $$[$0-3];
	break;
	case 166: case 252:
	self.$ = $$[$0].set({global: $$[$0-1]});
	break;
	case 167: case 202: case 253:
	self.$ = $$[$0].set({export: $$[$0-1]});
	break;
	case 168:
	self.$ = new yy.MethodDeclaration($$[$0-2],$$[$0],$$[$0-4],$$[$0-6],$$[$0-5]).set({def: $$[$0-7]});
	break;
	case 169:
	self.$ = new yy.MethodDeclaration([],$$[$0],$$[$0-1],$$[$0-3],$$[$0-2]).set({def: $$[$0-4]});
	break;
	case 170:
	self.$ = new yy.MethodDeclaration($$[$0-2],$$[$0],$$[$0-4],null).set({def: $$[$0-5]});
	break;
	case 171:
	self.$ = new yy.MethodDeclaration([],$$[$0],$$[$0-1],null).set({def: $$[$0-2]});
	break;
	case 172:
	self.$ = {static: true};
	break;
	case 173:
	self.$ = {};
	break;
	case 178:
	self.$ = $$[$0].body();
	break;
	case 189:
	self.$ = new yy.NamedParams($$[$0]);
	break;
	case 190:
	self.$ = new yy.ArrayParams($$[$0]);
	break;
	case 191:
	self.$ = new yy.RequiredParam($$[$0]);
	break;
	case 192:
	self.$ = new yy.SplatParam($$[$0],null,$$[$0-1]);
	break;
	case 193: case 194:
	self.$ = new yy.BlockParam($$[$0],null,$$[$0-1]);
	break;
	case 195:
	self.$ = new yy.OptionalParam($$[$0-2],$$[$0],$$[$0-1]);
	break;
	case 197:
	self.$ = yy.SPLAT($$[$0]);
	break;
	case 198: case 201:
	self.$ = yy.SPLAT(new yy.VarReference($$[$0],$$[$0-2]),$$[$0-1]);
	break;
	case 199: case 200:
	self.$ = new yy.VarReference($$[$0],$$[$0-1]);
	break;
	case 209:
	self.$ = new yy.IvarAccess('.',null,$$[$0]);
	break;
	case 214:
	self.$ = new yy.VarOrAccess($$[$0]);
	break;
	case 215:
	self.$ = new yy.New($$[$0-2]);
	break;
	case 216:
	self.$ = new yy.SuperAccess('.',$$[$0-2],$$[$0]);
	break;
	case 217:
	self.$ = new yy.PropertyAccess($$[$0-1],$$[$0-2],$$[$0]);
	break;
	case 218: case 219: case 220: case 222:
	self.$ = new yy.Access($$[$0-1],$$[$0-2],$$[$0]);
	break;
	case 221:
	self.$ = new yy.Access('.',$$[$0-2],new yy.Identifier($$[$0].value()));
	break;
	case 223:
	self.$ = new yy.IndexAccess('.',$$[$0-3],$$[$0-1]);
	break;
	case 226:
	self.$ = yy.SUPER;
	break;
	case 230:
	self.$ = new yy.Await($$[$0]).set({keyword: $$[$0-1]});
	break;
	case 236:
	self.$ = yy.ARGUMENTS;
	break;
	case 241:
	self.$ = new yy.Index($$[$0]);
	break;
	case 242:
	self.$ = new yy.Slice($$[$0]);
	break;
	case 243:
	self.$ = new yy.Obj($$[$0-2],$$[$0-3].generated);
	break;
	case 244:
	self.$ = new yy.AssignList([]);
	break;
	case 245:
	self.$ = new yy.AssignList([$$[$0]]);
	break;
	case 246: case 278:
	self.$ = $$[$0-2].add($$[$0]);
	break;
	case 247: case 279:
	self.$ = $$[$0-3].add($$[$0-1]).add($$[$0]);
	break;
	case 248:
	self.$ = $$[$0-5].concat($$[$0-2].indented($$[$0-3],$$[$0]));
	break;
	case 250:
	self.$ = $$[$0].set({extension: $$[$0-1]});
	break;
	case 251:
	self.$ = $$[$0].set({local: $$[$0-1]});
	break;
	case 254:
	self.$ = $$[$0].set({export: $$[$0-2],local: $$[$0-1]});
	break;
	case 255:
	self.$ = new yy.ClassDeclaration($$[$0],null,[]).set({keyword: $$[$0-1]});
	break;
	case 256:
	self.$ = new yy.ClassDeclaration($$[$0-1],null,$$[$0]).set({keyword: $$[$0-2]});
	break;
	case 257:
	self.$ = new yy.ClassDeclaration($$[$0-2],$$[$0],[]).set({keyword: $$[$0-3]});
	break;
	case 258:
	self.$ = new yy.ClassDeclaration($$[$0-3],$$[$0-1],$$[$0]).set({keyword: $$[$0-4]});
	break;
	case 259:
	self.$ = new yy.Module($$[$0]);
	break;
	case 260:
	self.$ = new yy.Module($$[$0-1],null,$$[$0]);
	break;
	case 261:
	self.$ = new yy.Call($$[$0-2],$$[$0],$$[$0-1]);
	break;
	case 262:
	self.$ = $$[$0-1].addBlock($$[$0]);
	break;
	case 263:
	self.$ = false;
	break;
	case 264:
	self.$ = true;
	break;
	case 265:
	self.$ = new yy.ArgList([]);
	break;
	case 266:
	self.$ = $$[$0-2];
	break;
	case 267:
	self.$ = new yy.This($$[$0]);
	break;
	case 268:
	self.$ = new yy.Self($$[$0]);
	break;
	case 269:
	self.$ = new yy.Arr(new yy.ArgList([]));
	break;
	case 270:
	self.$ = new yy.Arr($$[$0-2]);
	break;
	case 271:
	self.$ = '..';
	break;
	case 272:
	self.$ = '...';
	break;
	case 273:
	self.$ = yy.OP($$[$0-2],$$[$0-3],$$[$0-1]);
	break;
	case 274:
	self.$ = new yy.Range($$[$0-2],$$[$0],$$[$0-1]);
	break;
	case 275:
	self.$ = new yy.Range($$[$0-1],null,$$[$0]);
	break;
	case 276:
	self.$ = new yy.Range(null,$$[$0],$$[$0-1]);
	break;
	case 277:
	self.$ = new yy.ArgList([$$[$0]]);
	break;
	case 280:
	self.$ = $$[$0-2].indented($$[$0-3],$$[$0]);
	break;
	case 281:
	self.$ = $$[$0-5].concat($$[$0-2]);
	break;
	case 289:
	self.$ = [].concat($$[$0-2],$$[$0]);
	break;
	case 290:
	self.$ = new yy.Try($$[$0]);
	break;
	case 291:
	self.$ = new yy.Try($$[$0-1],$$[$0]);
	break;
	case 292:
	self.$ = new yy.Try($$[$0-1],null,$$[$0]);
	break;
	case 293:
	self.$ = new yy.Try($$[$0-2],$$[$0-1],$$[$0]);
	break;
	case 294:
	self.$ = new yy.Finally($$[$0]);
	break;
	case 295:
	self.$ = new yy.Catch($$[$0],$$[$0-1]);
	break;
	case 296:
	self.$ = new yy.Throw($$[$0]);
	break;
	case 297:
	self.$ = new yy.Parens($$[$0-1],$$[$0-2],$$[$0]);
	break;
	case 298:
	self.$ = new yy.Parens($$[$0-2],$$[$0-4],$$[$0]);
	break;
	case 299:
	self.$ = new yy.While($$[$0]);
	break;
	case 300:
	self.$ = new yy.While($$[$0-2],{guard: $$[$0]});
	break;
	case 301:
	self.$ = new yy.While($$[$0],{invert: true});
	break;
	case 302:
	self.$ = new yy.While($$[$0-2],{invert: true,guard: $$[$0]});
	break;
	case 303: case 311: case 314:
	self.$ = $$[$0-1].addBody($$[$0]);
	break;
	case 304: case 305:
	self.$ = $$[$0].addBody(yy.Block.wrap([$$[$0-1]]));
	break;
	case 307:
	self.$ = new yy.While(new yy.Literal('true')).addBody($$[$0]);
	break;
	case 308:
	self.$ = new yy.While(new yy.Literal('true')).addBody(yy.Block.wrap([$$[$0]]));
	break;
	case 309: case 310:
	self.$ = $$[$0].addBody([$$[$0-1]]);
	break;
	case 315:
	self.$ = {source: new yy.ValueNode($$[$0])};
	break;
	case 316:
	self.$ = $$[$0].configure({own: $$[$0-1].own,name: $$[$0-1][0],index: $$[$0-1][1],keyword: $$[$0-1].keyword});
	break;
	case 317:
	self.$ = ($$[$0].keyword = $$[$0-1]) && $$[$0];
	break;
	case 318:
	self.$ = ($$[$0].own = true) && ($$[$0].keyword = $$[$0-2]) && $$[$0];
	break;
	case 320: case 321:
	self.$ = new yy.ValueNode($$[$0]);
	break;
	case 323:
	self.$ = [$$[$0-2],$$[$0]];
	break;
	case 324:
	self.$ = new yy.ForIn({source: $$[$0]});
	break;
	case 325:
	self.$ = new yy.ForOf({source: $$[$0],object: true});
	break;
	case 326:
	self.$ = new yy.ForIn({source: $$[$0-2],guard: $$[$0]});
	break;
	case 327:
	self.$ = new yy.ForOf({source: $$[$0-2],guard: $$[$0],object: true});
	break;
	case 328:
	self.$ = new yy.ForIn({source: $$[$0-2],step: $$[$0]});
	break;
	case 329:
	self.$ = new yy.ForIn({source: $$[$0-4],guard: $$[$0-2],step: $$[$0]});
	break;
	case 330:
	self.$ = new yy.ForIn({source: $$[$0-4],step: $$[$0-2],guard: $$[$0]});
	break;
	case 331:
	self.$ = new yy.Switch($$[$0-3],$$[$0-1]);
	break;
	case 332:
	self.$ = new yy.Switch($$[$0-5],$$[$0-3],$$[$0-1]);
	break;
	case 333:
	self.$ = new yy.Switch(null,$$[$0-1]);
	break;
	case 334:
	self.$ = new yy.Switch(null,$$[$0-3],$$[$0-1]);
	break;
	case 336:
	self.$ = $$[$0-1].concat($$[$0]);
	break;
	case 337:
	self.$ = [new yy.SwitchCase($$[$0-1],$$[$0])];
	break;
	case 338:
	self.$ = [new yy.SwitchCase($$[$0-2],$$[$0-1])];
	break;
	case 339:
	self.$ = new yy.If($$[$0-1],$$[$0],{type: $$[$0-2]});
	break;
	case 340:
	self.$ = $$[$0-4].addElse(new yy.If($$[$0-1],$$[$0],{type: $$[$0-2]}));
	break;
	case 341:
	self.$ = $$[$0-3].addElse(new yy.If($$[$0-1],$$[$0],{type: $$[$0-2]}));
	break;
	case 342:
	self.$ = $$[$0-2].addElse($$[$0]);
	break;
	case 344:
	self.$ = new yy.If($$[$0],new yy.Block([$$[$0-2]]),{type: $$[$0-1],statement: true});
	break;
	case 345:
	self.$ = new yy.If($$[$0],new yy.Block([$$[$0-2]]),{type: $$[$0-1]});
	break;
	case 346:
	self.$ = yy.If.ternary($$[$0-4],$$[$0-2],$$[$0]);
	break;
	case 347: case 348:
	self.$ = yy.OP($$[$0-1],$$[$0]);
	break;
	case 349:
	self.$ = new yy.Op('-',$$[$0]);
	break;
	case 350:
	self.$ = new yy.Op('+',$$[$0]);
	break;
	case 351:
	self.$ = new yy.UnaryOp('--',null,$$[$0]);
	break;
	case 352:
	self.$ = new yy.UnaryOp('++',null,$$[$0]);
	break;
	case 353:
	self.$ = new yy.UnaryOp('--',$$[$0-1],null,true);
	break;
	case 354:
	self.$ = new yy.UnaryOp('++',$$[$0-1],null,true);
	break;
	case 355: case 356:
	self.$ = new yy.Op($$[$0-1],$$[$0-2],$$[$0]);
	break;
	case 357: case 358: case 359: case 360:
	self.$ = yy.OP($$[$0-1],$$[$0-2],$$[$0]);
	break;
	case 361:
	self.$ = (function () {
					if ($$[$0-1].charAt(0) == '!') {
						return yy.OP($$[$0-1].slice(1),$$[$0-2],$$[$0]).invert();
					} else {
						return yy.OP($$[$0-1],$$[$0-2],$$[$0]);
					};
				}());
	break;
	case 362:
	self.$ = yy.OP_COMPOUND($$[$0-1]._value,$$[$0-1],$$[$0-2],$$[$0]);
	break;
	case 363:
	self.$ = yy.OP_COMPOUND($$[$0-3]._value,$$[$0-4],$$[$0-1].indented($$[$0-2],$$[$0]));
	break;
	}
	},
	table: [{1:[2,1],3:1,4:2,5:3,7:$V0,8:5,10:$V1,12:7,13:8,15:9,16:10,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,138:$Vz,139:$VA,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,170:$VJ,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{1:[3]},{1:[2,2],6:$V51,9:133},{6:[1,135]},o($V61,[2,4]),o($V61,[2,5],{14:$V71}),{4:138,6:[1,139],7:$V0,8:5,11:[1,137],12:7,13:8,15:9,16:10,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,138:$Vz,139:$VA,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,170:$VJ,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($V81,[2,12]),o($V81,[2,13],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,212:$VU,214:$VV,219:$VX,220:$VY,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o($V81,[2,16]),o($V81,[2,17],{218:107,222:108,211:152,217:153,212:$VU,214:$VV,219:$VX,220:$VY,238:$Vi1}),{13:154,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($Vj1,[2,34]),o($Vj1,[2,35],{195:156,141:157,179:159,21:$Vk1,88:$Vl1,111:$Vm1,144:$VC,180:$Vn1,181:$Vo1,183:$Vp1,196:$Vq1}),o($Vj1,[2,36]),o($Vj1,[2,37]),o($Vj1,[2,38]),o($Vj1,[2,39]),o($Vj1,[2,40]),o($Vj1,[2,41]),o($Vj1,[2,42]),o($Vj1,[2,43]),o($Vj1,[2,44]),o($Vj1,[2,45]),o($Vj1,[2,46]),o($Vj1,[2,47]),o($Vj1,[2,48]),o($Vj1,[2,49]),o($Vr1,[2,149]),o($Vr1,[2,150]),o($Vs1,[2,18]),o($Vs1,[2,19]),o($Vs1,[2,20]),o($Vs1,[2,21],{21:[1,165]}),o($Vs1,[2,23],{21:[1,166]}),o($Vs1,[2,25]),o($Vs1,[2,26]),{13:167,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($Vt1,$Vu1,{117:[1,168]}),o($Vt1,[2,232]),o($Vt1,[2,233]),o($Vt1,[2,234]),o($Vt1,[2,235]),o($Vt1,[2,236]),o($Vt1,[2,237]),o($Vt1,[2,238]),o($Vt1,[2,239]),o($Vt1,[2,240]),o($Vj1,[2,151]),o($Vj1,[2,152]),o($Vj1,[2,153]),{13:169,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{13:170,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{13:171,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{13:172,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{32:$V7,35:174,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,109:100,129:45,130:$Vx,131:176,136:$Vy,150:77,154:$VF,157:$Vv1,166:44,168:76,173:101,175:$VK,176:173,178:39,184:$VL,186:41,187:42,188:$VN,189:47,197:$VQ,198:$VR},{32:$V7,35:174,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,109:100,129:45,130:$Vx,131:176,136:$Vy,150:77,154:$VF,157:$Vv1,166:44,168:76,173:101,175:$VK,176:177,178:39,184:$VL,186:41,187:42,188:$VN,189:47,197:$VQ,198:$VR},o($Vw1,$Vx1,{244:[1,178],245:[1,179],249:[1,180]}),o($Vj1,[2,343],{232:[1,181],237:[1,182]}),{5:183,10:$V1},{5:184,10:$V1},o($Vj1,[2,306]),{5:185,10:$V1},{10:[1,187],13:186,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($Vj1,[2,249]),{121:189,124:$Vw,192:188,193:$VO},{121:191,124:$Vw,192:190,193:$VO},{155:193,158:$VI,192:192,193:$VO},{123:[1,195],154:$VF,155:196,157:$Vv1,158:$VI,173:197,175:$VK,192:194,193:$VO},{32:$V7,35:174,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,109:100,129:45,130:$Vx,131:176,136:$Vy,150:77,154:$VF,157:$Vv1,166:44,168:76,173:101,175:$VK,176:198,178:39,184:$VL,186:41,187:42,188:$VN,189:47,197:$VQ,198:$VR},o($Vj1,[2,124]),o($Vy1,[2,102],{104:199,108:201,109:202,51:[1,203],89:[1,200],110:[1,204],198:$VR}),{50:206,51:$V8,89:[1,207],149:205},o($Vs1,[2,77],{34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,17:30,18:31,25:36,131:38,178:39,72:40,186:41,187:42,166:44,129:45,101:46,189:47,140:48,141:49,142:50,176:57,235:58,211:60,215:61,217:62,192:64,121:70,148:72,168:76,150:77,63:79,82:92,155:93,57:96,52:97,55:98,59:99,109:100,173:101,50:102,218:107,222:108,61:116,65:117,16:155,13:208,81:209,19:$V2,20:$V3,21:$Vz1,23:$V4,24:$V5,26:$V6,32:$V7,51:$V8,53:$V9,54:$Va,56:$Vb,58:$Vc,60:$Vd,62:$Ve,64:$Vf,66:$Vg,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,83:$Vp,89:$Vq,91:$Vr,96:$Vs,103:$Vt,122:$Vu,123:$Vv,124:$Vw,130:$Vx,136:$Vy,143:$VB,144:$VC,151:$VD,152:$VE,154:$VF,156:$VG,157:$VH,158:$VI,175:$VK,184:$VL,185:$VM,188:$VN,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,216:$VW,230:$VZ,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41}),{13:211,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{27:212,29:213,31:214,32:$VA1,33:216,50:218,51:$V8,57:217,58:$Vc},o($Vw1,[2,228]),o($Vw1,[2,229]),o($VB1,[2,226]),o($Vt1,[2,67]),o($Vt1,[2,68]),o($Vt1,[2,69]),o($Vt1,[2,70]),o($Vt1,[2,71]),o($Vt1,[2,72]),o($Vt1,[2,73]),o($Vt1,[2,74]),{4:219,7:$V0,8:5,10:[1,220],12:7,13:8,15:9,16:10,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,138:$Vz,139:$VA,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,170:$VJ,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{10:$VC1,12:226,13:221,15:228,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,97:$VD1,101:46,103:$Vt,109:100,119:223,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,138:$Vz,139:$VA,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,170:$VJ,171:$VE1,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,202:224,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o([1,6,10,11,14,21,22,71,88,90,91,97,106,111,112,126,135,137,144,147,171,180,181,183,196,200,201,212,213,214,219,220,229,238,239,242,243,246,247,248],[2,267]),o($Vt1,[2,135]),{50:229,51:$V8},{84:231,85:[1,232],86:[1,233],87:[1,234],88:[1,235],91:[1,236],92:[1,237],93:[1,238],94:[1,239],95:[1,240],96:[1,241],100:[1,242],102:[1,230]},o($Vj1,[2,165]),{5:243,10:$V1,145:[1,244]},{5:245,10:$V1},o($VB1,[2,208]),o($VB1,[2,209]),o($VB1,[2,210]),o($VB1,[2,211]),o($VB1,[2,212]),o($VB1,[2,213]),o($VB1,[2,214]),{13:246,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{13:247,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{13:248,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{5:249,10:$V1,13:250,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{50:255,51:$V8,89:$Vq,96:$Vs,150:257,168:256,187:251,224:252,225:[1,253],226:254},{223:258,227:[1,259],228:[1,260]},{32:$V7,35:174,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,109:100,129:45,130:$Vx,131:176,136:$Vy,150:77,154:$VF,157:$Vv1,166:44,168:76,173:101,175:$VK,176:261,178:39,184:$VL,186:41,187:42,188:$VN,189:47,197:$VQ,198:$VR},{110:$VF1,125:262,128:$VG1},o($VH1,[2,160]),o($VH1,[2,161]),o([6,10,14,90],$VI1,{61:116,65:117,191:265,133:266,134:267,15:268,50:269,57:270,63:271,52:272,55:273,32:$V7,51:$V8,53:$V9,54:$Va,56:$Vb,58:$Vc,62:$Ve,64:$Vf,66:$Vg,136:$VJ1,138:$Vz,139:$VA}),o($Vt1,[2,57]),o($Vt1,[2,58]),o($Vt1,[2,59]),o($Vt1,[2,60],{68:276,67:[1,275],69:[1,277],70:[1,278]}),o($VK1,[2,78]),{50:284,51:$V8,55:283,56:$Vb,57:285,58:$Vc,89:$VL1,109:282,159:279,161:280,166:281,197:$VQ,198:$VR},o([1,6,10,11,14,21,22,28,71,88,90,91,97,106,111,112,117,126,135,137,144,147,164,165,171,180,181,183,196,200,201,212,213,214,219,220,229,238,239,242,243,244,245,246,247,248,249],[2,54]),o($VM1,[2,51]),o($VM1,[2,52]),o([1,6,10,11,14,21,22,71,88,90,91,97,106,111,112,117,126,135,137,144,147,171,180,181,183,196,200,201,212,213,214,219,220,229,238,239,242,243,244,245,246,247,248,249],[2,53]),o($VB1,[2,55]),o($VM1,[2,268]),{50:290,51:$V8,57:289,58:$Vc,96:$VN1,168:291,170:[1,287],174:288},{50:290,51:$V8,57:289,58:$Vc,96:$VN1,168:291,170:[1,294],174:293},o([1,6,10,11,14,21,22,28,71,88,89,90,91,97,98,106,111,112,117,126,135,137,144,147,164,165,171,180,181,183,196,200,201,212,213,214,219,220,227,228,229,238,239,242,243,244,245,246,247,248,249],[2,50]),o($VO1,[2,312]),o($VO1,[2,313]),o($VB1,[2,56]),o($VP1,[2,61]),o($V61,[2,7],{12:7,13:8,15:9,16:10,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,17:30,18:31,25:36,131:38,178:39,72:40,186:41,187:42,166:44,129:45,101:46,189:47,140:48,141:49,142:50,176:57,235:58,211:60,215:61,217:62,192:64,121:70,148:72,168:76,150:77,63:79,82:92,155:93,57:96,52:97,55:98,59:99,109:100,173:101,50:102,218:107,222:108,61:116,65:117,8:295,19:$V2,20:$V3,23:$V4,24:$V5,26:$V6,32:$V7,51:$V8,53:$V9,54:$Va,56:$Vb,58:$Vc,60:$Vd,62:$Ve,64:$Vf,66:$Vg,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,83:$Vp,89:$Vq,91:$Vr,96:$Vs,103:$Vt,122:$Vu,123:$Vv,124:$Vw,130:$Vx,136:$Vy,138:$Vz,139:$VA,143:$VB,144:$VC,151:$VD,152:$VE,154:$VF,156:$VG,157:$VH,158:$VI,170:$VJ,175:$VK,184:$VL,185:$VM,188:$VN,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,212:$VU,214:$VV,216:$VW,219:$VX,220:$VY,230:$VZ,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41}),o([1,6,11,19,20,23,24,26,32,51,53,54,56,58,60,62,64,66,73,74,75,76,77,78,79,80,83,89,91,96,103,122,123,124,130,136,137,138,139,143,144,151,152,154,156,157,158,170,171,175,184,185,188,193,194,197,198,204,210,212,214,216,219,220,230,236,240,241,242,243,244,245],[2,8]),{1:[2,3]},{12:297,13:296,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,170:$VJ,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($VQ1,[2,9]),{6:$V51,9:133,11:[1,298]},{4:299,7:$V0,8:5,12:7,13:8,15:9,16:10,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,138:$Vz,139:$VA,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,170:$VJ,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{13:300,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{13:301,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{13:302,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{13:303,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{13:304,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{13:305,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{13:306,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{13:307,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{13:308,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($Vj1,[2,305]),o($Vj1,[2,310]),{13:309,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($Vj1,[2,304]),o($Vj1,[2,309]),o([1,6,10,11,14,22,97,137],[2,197],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,212:$VU,214:$VV,219:$VX,220:$VY,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),{211:152,212:$VU,214:$VV,217:153,218:107,219:$VX,220:$VY,222:108,238:$Vi1},{21:$Vz1,81:310},o($Vt1,[2,262]),o($VR1,[2,224],{178:312,61:313,62:$Ve,177:[1,311],184:$VL}),{50:314,51:$V8,52:315,53:$V9,54:$Va,57:316,58:$Vc},{50:317,51:$V8},{50:318,51:$V8},{13:320,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,182:319,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,190:321,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,199:322,200:$VS1,201:$VT1,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{21:[2,264]},o($VR1,[2,225]),{13:325,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{13:326,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($VU1,[2,230],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),{10:[1,328],13:327,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($Vj1,[2,347],{218:107,222:108,211:149,217:150}),o($Vj1,[2,348],{218:107,222:108,211:149,217:150}),o($Vj1,[2,349],{218:107,222:108,211:149,217:150}),o($Vj1,[2,350],{218:107,222:108,211:149,217:150}),o($Vj1,[2,351],{21:$Vx1,88:$Vx1,111:$Vx1,144:$Vx1,180:$Vx1,181:$Vx1,183:$Vx1,196:$Vx1}),{21:$Vk1,88:$Vl1,111:$Vm1,141:157,144:$VC,179:159,180:$Vn1,181:$Vo1,183:$Vp1,195:156,196:$Vq1},{154:$VF,157:$Vv1,173:197,175:$VK},o([21,88,111,144,180,181,183,196],$Vu1),o($Vj1,[2,352],{21:$Vx1,88:$Vx1,111:$Vx1,144:$Vx1,180:$Vx1,181:$Vx1,183:$Vx1,196:$Vx1}),o($Vj1,[2,353]),o($Vj1,[2,354]),{10:[1,330],13:329,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{5:332,10:$V1,236:[1,331]},{13:333,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($Vj1,[2,290],{205:334,206:335,207:$VV1,208:[1,336]}),o($Vj1,[2,303]),o($Vj1,[2,311]),{10:[1,338],126:$V91,171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},{231:339,233:340,234:$VW1},o($Vj1,[2,250]),o($Vj1,[2,125]),o($Vj1,[2,251]),o($Vj1,[2,126]),o($Vj1,[2,252]),o($Vj1,[2,166]),o($Vj1,[2,253]),{192:342,193:$VO},o($Vj1,[2,167]),o($VB1,[2,202]),o($VX1,[2,259],{5:343,10:$V1,21:$Vx1,88:$Vx1,111:$Vx1,144:$Vx1,180:$Vx1,181:$Vx1,183:$Vx1,196:$Vx1}),o($VY1,[2,113],{105:344,52:349,114:350,53:$V9,54:$Va,88:[1,345],91:[1,348],111:[1,346],113:[1,347],116:$VZ1}),{13:352,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($Vy1,[2,103]),o($Vy1,[2,99]),o($Vy1,[2,100]),o($Vy1,[2,101]),o($Vj1,[2,159],{150:353,21:[1,354],89:$Vq}),o($V_1,[2,162]),{13:355,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($Vs1,[2,75],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o($Vs1,[2,76]),{10:$VC1,12:226,13:358,15:228,16:155,17:30,18:31,19:$V2,20:$V3,22:[1,356],23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,119:357,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,138:$Vz,139:$VA,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,170:$VJ,171:$VE1,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,202:224,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($Vs1,[2,296],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),{14:[1,360],28:[1,359]},o($Vs1,[2,29],{30:[1,361]}),o($V$1,[2,31]),o([1,6,11,14,30,137,212,214,219,220,238],[2,30]),o($V02,[2,33]),o($V02,[2,203]),o($V02,[2,204]),{6:$V51,9:133,137:[1,362]},{4:363,7:$V0,8:5,12:7,13:8,15:9,16:10,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,138:$Vz,139:$VA,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,170:$VJ,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o([6,10,14,97],$V12,{218:107,222:108,211:149,217:150,199:364,126:$V91,171:$Va1,200:$VS1,201:$VT1,212:$VU,214:$VV,219:$VX,220:$VY,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o($V22,[2,269]),o([6,10,97],$V32,{115:365,14:$V42}),o($V52,[2,277]),{10:$VC1,12:226,13:358,15:228,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,119:367,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,138:$Vz,139:$VA,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,170:$VJ,171:$VE1,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,202:224,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($V52,[2,285]),o($V52,[2,286]),o($V52,[2,287]),o($Vt1,[2,136]),o($Vt1,[2,92]),o($VK1,[2,79]),o($VK1,[2,80]),o($VK1,[2,81]),o($VK1,[2,82]),{89:[1,368]},{89:[1,369]},o($VK1,[2,85]),o($VK1,[2,86]),o($VK1,[2,87]),o($VK1,[2,88]),{50:370,51:$V8},o($VK1,[2,91]),o($Vt1,[2,155]),o([14,147],$V62,{146:371,167:372,150:373,168:374,169:375,50:379,51:$V8,89:$Vq,96:$VN1,170:$V72,171:$V82,172:$V92}),o($Vj1,[2,154]),{5:380,10:$V1,126:$V91,171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},o($Va2,[2,299],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,212:$VU,213:[1,381],214:$VV,219:$VX,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o($Va2,[2,301],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,212:$VU,213:[1,382],214:$VV,219:$VX,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o($Vj1,[2,307]),o($Vb2,[2,308],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,212:$VU,214:$VV,219:$VX,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o($Vj1,[2,315]),o($Vc2,[2,317]),{50:255,51:$V8,89:$Vq,96:$VN1,150:257,168:256,224:383,226:254},o($Vc2,[2,322],{14:[1,384]}),o($Vd2,[2,319]),o($Vd2,[2,320]),o($Vd2,[2,321]),o($Vj1,[2,316]),{13:385,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{13:386,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($Ve2,[2,255],{5:387,10:$V1,21:$Vx1,88:$Vx1,111:$Vx1,144:$Vx1,180:$Vx1,181:$Vx1,183:$Vx1,196:$Vx1,126:[1,388]}),o($Ve2,[2,127],{5:389,10:$V1,126:[1,390]}),o($Vj1,[2,133]),o($Vj1,[2,134]),o([6,10,90],$V32,{115:391,14:$Vf2}),o($Vg2,[2,245]),o($Vg2,[2,139],{135:[1,393]}),o($Vg2,[2,142]),o($Vh2,[2,143]),o($Vh2,[2,144]),o($Vh2,[2,145]),o($Vh2,[2,146]),o($Vh2,[2,147]),{13:394,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($VP1,[2,62]),o($VP1,[2,63]),o($VP1,[2,64]),{13:396,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,71:[1,395],72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{88:[1,398],91:[1,399],160:397},o($Vi2,[2,180],{162:401,21:[1,400],164:$Vj2,165:$Vk2}),o($Vi2,[2,181]),o($Vi2,[2,182]),o($Vi2,[2,183]),o($Vl2,[2,174]),o($Vl2,[2,175]),{13:404,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{50:290,51:$V8,57:289,58:$Vc,96:$VN1,168:291,174:405},o($VB1,[2,199]),o($VB1,[2,205]),o($VB1,[2,206]),o($VB1,[2,207]),{10:$VC1,12:226,13:358,15:228,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,97:$VD1,101:46,103:$Vt,109:100,119:223,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,138:$Vz,139:$VA,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,170:$VJ,171:$VE1,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,202:224,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($VB1,[2,200]),{50:290,51:$V8,57:289,58:$Vc,96:$VN1,168:291,174:406},o($V61,[2,6],{14:$V71}),o($V81,[2,14],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,212:$VU,214:$VV,219:$VX,220:$VY,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o($V81,[2,15]),o($VQ1,[2,10]),{6:$V51,9:133,11:[1,407]},o($Vm2,[2,355],{218:107,222:108,211:149,217:150,246:$Vf1}),o($Vm2,[2,356],{218:107,222:108,211:149,217:150,246:$Vf1}),o($Vj1,[2,357],{218:107,222:108,211:149,217:150}),o([1,6,10,11,14,22,71,90,97,106,112,126,135,137,147,171,200,201,212,213,214,219,220,229,238,239,247,248],[2,358],{218:107,222:108,211:149,217:150,242:$Vd1,243:$Ve1,246:$Vf1}),o([1,6,10,11,14,22,71,90,97,106,112,126,135,137,147,171,200,201,212,213,214,219,220,229,238,239],[2,359],{218:107,222:108,211:149,217:150,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o([1,6,10,11,14,22,71,90,97,106,112,135,137,147,171,200,201,212,213,214,219,220,229,238,239],[2,360],{218:107,222:108,211:149,217:150,126:$V91,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o([1,6,10,11,14,22,71,90,97,106,112,126,135,137,147,171,200,201,212,213,214,219,220,229,238,239,248],[2,361],{218:107,222:108,211:149,217:150,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1}),o($Vn2,[2,345],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,212:$VU,214:$VV,219:$VX,220:$VY,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),{126:$V91,135:[1,408],171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},o($Vn2,[2,344],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,212:$VU,214:$VV,219:$VX,220:$VY,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o($Vt1,[2,261]),o($VB1,[2,215]),o($VB1,[2,216]),o($VB1,[2,221]),o($VB1,[2,217]),o($VB1,[2,220]),o($VB1,[2,222]),o($VB1,[2,218]),o($VB1,[2,219]),{112:[1,409]},{112:[2,241],126:$V91,171:$Va1,199:410,200:$VS1,201:$VT1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},{112:[2,242]},{13:411,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($Vo2,[2,271]),o($Vo2,[2,272]),{22:[1,412],126:$V91,171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},{22:[1,413],126:$V91,171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},o($VU1,[2,137],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),{13:414,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($VU1,[2,362],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),{13:415,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{13:416,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($Vp2,[2,342]),{5:417,10:$V1,126:$V91,171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},o($Vj1,[2,291],{206:418,207:$VV1}),o($Vj1,[2,292]),{209:[1,419]},{5:420,10:$V1},{231:421,233:340,234:$VW1},{11:[1,422],232:[1,423],233:424,234:$VW1},o($Vq2,[2,335]),{13:426,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,203:425,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($Vj1,[2,254]),o($Vj1,[2,260]),{6:$V32,14:[1,428],106:[1,427],115:429},{51:[1,431],58:[1,432],62:[1,430],89:[1,433]},{13:434,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{89:[1,435]},{51:[1,436],89:[1,437]},o($Vy1,[2,111]),o($VY1,[2,114]),o($VY1,[2,117],{117:[1,438]}),{90:[1,439],126:$V91,171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},o($Vj1,[2,157]),{89:$Vq,150:440},{90:[1,441],126:$V91,171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},o($Vt1,[2,265]),o([6,10,22],$V32,{115:442,14:$V42}),o($V52,$V12,{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,212:$VU,214:$VV,219:$VX,220:$VY,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),{29:443,32:$VA1},{31:444,33:216,50:218,51:$V8,57:217,58:$Vc},{31:445,33:216,50:218,51:$V8,57:217,58:$Vc},o($Vt1,[2,297]),{6:$V51,9:133,11:[1,446]},{13:447,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{6:$V51,9:449,10:$Vr2,97:[1,448]},o([6,10,11,22,97],$Vs2,{34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,17:30,18:31,25:36,131:38,178:39,72:40,186:41,187:42,166:44,129:45,101:46,189:47,140:48,141:49,142:50,176:57,235:58,211:60,215:61,217:62,192:64,121:70,148:72,168:76,150:77,63:79,82:92,155:93,57:96,52:97,55:98,59:99,109:100,173:101,50:102,218:107,222:108,61:116,65:117,16:155,12:226,15:228,13:358,202:451,19:$V2,20:$V3,23:$V4,24:$V5,26:$V6,32:$V7,51:$V8,53:$V9,54:$Va,56:$Vb,58:$Vc,60:$Vd,62:$Ve,64:$Vf,66:$Vg,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,83:$Vp,89:$Vq,91:$Vr,96:$Vs,103:$Vt,122:$Vu,123:$Vv,124:$Vw,130:$Vx,136:$Vy,138:$Vz,139:$VA,143:$VB,144:$VC,151:$VD,152:$VE,154:$VF,156:$VG,157:$VH,158:$VI,170:$VJ,171:$VE1,175:$VK,184:$VL,185:$VM,188:$VN,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,212:$VU,214:$VV,216:$VW,219:$VX,220:$VY,230:$VZ,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41}),o($Vt2,$V32,{115:452,14:$V42}),{13:453,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{13:454,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{97:[1,455],98:[1,456]},{14:$Vu2,147:[1,457]},o($Vv2,[2,187]),o($Vv2,[2,189]),o($Vv2,[2,190]),o($Vv2,[2,191],{117:[1,459]}),{50:379,51:$V8,169:460},{50:379,51:$V8,169:461},{50:379,51:$V8,169:462},o([14,22,117,147],[2,196]),o($Vp2,[2,339]),{13:463,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{13:464,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($Vc2,[2,318]),{50:255,51:$V8,89:$Vq,96:$VN1,150:257,168:256,226:465},o([1,6,10,11,14,22,71,90,97,106,112,135,137,147,200,201,212,214,219,220,238],[2,324],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,213:[1,466],229:[1,467],239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o($Vw2,[2,325],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,213:[1,468],239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o($Vj1,[2,256]),{13:469,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($Vj1,[2,128]),{110:$VF1,125:470,128:$VG1},{6:$V51,9:472,10:$Vx2,90:[1,471]},o([6,10,11,90],$Vs2,{61:116,65:117,134:267,15:268,50:269,57:270,63:271,52:272,55:273,133:474,32:$V7,51:$V8,53:$V9,54:$Va,56:$Vb,58:$Vc,62:$Ve,64:$Vf,66:$Vg,136:$VJ1,138:$Vz,139:$VA}),{10:[1,476],13:475,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{126:$V91,137:[1,477],171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},o($VP1,[2,65]),{71:[1,478],126:$V91,171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},{50:284,51:$V8,57:285,58:$Vc,89:$VL1,161:479},o($Vy2,[2,172]),o($Vy2,[2,173]),o($Vz2,$V62,{167:372,150:373,168:374,169:375,50:379,146:480,51:$V8,89:$Vq,96:$VN1,170:$V72,171:$V82,172:$V92}),o($Vj1,[2,171]),{5:481,10:$V1,141:482,144:$VC},o($Vj1,[2,179]),{90:[1,483],126:$V91,171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},o($VB1,[2,198]),o($VB1,[2,201]),o($VQ1,[2,11]),{13:484,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($VB1,[2,223]),{13:485,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,112:[2,275],121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{112:[2,276],126:$V91,171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},o($Vs1,[2,22]),o($Vs1,[2,24]),{6:$V51,9:487,11:$VA2,126:$V91,132:486,171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},{6:$V51,9:487,11:$VA2,126:$V91,132:489,171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},{5:490,10:$V1,126:$V91,171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},o($Vp2,[2,341]),o($Vj1,[2,293]),{5:491,10:$V1},o($Vj1,[2,294]),{11:[1,492],232:[1,493],233:424,234:$VW1},o($Vj1,[2,333]),{5:494,10:$V1},o($Vq2,[2,336]),{5:495,10:$V1,14:[1,496]},o($VB2,[2,288],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,212:$VU,214:$VV,219:$VX,220:$VY,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o($VX1,[2,96],{107:497,10:[1,498],21:[1,499]}),{6:$Vs2,114:500,116:$VZ1},{6:[1,501]},o($Vy1,[2,104]),o($Vy1,[2,106]),o($Vy1,[2,107]),{13:502,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{112:[1,503],126:$V91,171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},{13:504,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($Vy1,[2,110]),{13:505,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{13:507,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,118:506,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{106:[1,508]},{22:[1,509]},o($V_1,[2,163]),{6:$V51,9:449,10:$Vr2,22:[1,510]},o($Vs1,[2,27]),o($V$1,[2,32]),o($Vs1,[2,28]),{137:[1,511]},{97:[1,512],126:$V91,171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},o($V22,[2,270]),{12:226,13:358,15:228,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,138:$Vz,139:$VA,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,170:$VJ,171:$VE1,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,202:513,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{10:$VC1,12:226,13:358,15:228,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,119:514,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,138:$Vz,139:$VA,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,170:$VJ,171:$VE1,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,202:224,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($V52,[2,278]),{6:$V51,9:516,10:$Vr2,11:$VA2,132:515},{90:[1,517],126:$V91,171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},{90:[1,518],126:$V91,171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},o($VK1,[2,89]),{32:$V7,51:[1,520],61:116,62:$Ve,63:521,64:$Vf,65:117,66:$Vg,89:[1,522],99:519},{5:523,10:$V1},{50:379,51:$V8,89:$Vq,96:$VN1,150:373,167:524,168:374,169:375,170:$V72,171:$V82,172:$V92},{13:525,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($Vv2,[2,192]),o($Vv2,[2,193]),o($Vv2,[2,194]),o($Vb2,[2,300],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,212:$VU,214:$VV,219:$VX,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o($Vb2,[2,302],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,212:$VU,214:$VV,219:$VX,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o($Vc2,[2,323]),{13:526,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{13:527,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{13:528,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o([1,6,11,14,22,71,90,97,106,112,135,137,147,200,201,213,220,229,238],[2,257],{218:107,222:108,211:149,217:150,5:529,10:$V1,126:$V91,171:$Va1,212:$VU,214:$VV,219:$VX,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o($VX1,[2,129],{5:530,10:$V1}),o([1,6,10,11,14,21,22,71,88,90,97,106,111,112,117,126,135,137,144,147,171,180,181,183,196,200,201,212,213,214,219,220,227,228,229,238,239,242,243,246,247,248],[2,243]),{15:268,32:$V7,50:269,51:$V8,52:272,53:$V9,54:$Va,55:273,56:$Vb,57:270,58:$Vc,61:116,62:$Ve,63:271,64:$Vf,65:117,66:$Vg,133:531,134:267,136:$VJ1,138:$Vz,139:$VA},o([6,10,11,14],$VI1,{61:116,65:117,133:266,134:267,15:268,50:269,57:270,63:271,52:272,55:273,191:532,32:$V7,51:$V8,53:$V9,54:$Va,56:$Vb,58:$Vc,62:$Ve,64:$Vf,66:$Vg,136:$VJ1,138:$Vz,139:$VA}),o($Vg2,[2,246]),o($Vg2,[2,140],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,212:$VU,214:$VV,219:$VX,220:$VY,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),{13:533,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($Vh2,[2,148]),o($VP1,[2,66]),{21:[1,534],162:535,164:$Vj2,165:$Vk2},{14:$Vu2,22:[1,536]},o($Vj1,[2,177]),o($Vj1,[2,178]),o($Vl2,[2,176]),o([1,6,10,11,14,22,71,90,97,106,112,135,137,147,200,201,212,213,214,219,220,229,238,239],[2,346],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),{112:[2,274],126:$V91,171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},o($Vj1,[2,138]),{11:$VC2},o($Vj1,[2,283]),o($Vj1,[2,363]),o($Vp2,[2,340]),o([1,6,10,11,14,22,71,90,97,106,112,126,135,137,147,171,200,201,207,212,213,214,219,220,229,238,239,242,243,246,247,248],[2,295]),o($Vj1,[2,331]),{5:538,10:$V1},{11:[1,539]},o($Vq2,[2,337],{6:[1,540]}),{13:541,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($Vj1,[2,97]),{10:$VC1,12:226,13:358,15:228,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,119:542,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,138:$Vz,139:$VA,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,170:$VJ,171:$VE1,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,202:224,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{10:$VC1,12:226,13:358,15:228,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,119:543,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,138:$Vz,139:$VA,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,170:$VJ,171:$VE1,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,202:224,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($VY1,[2,115]),{114:544,116:$VZ1},{90:[1,545],126:$V91,171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},o($Vy1,[2,105]),{90:[1,546],126:$V91,171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},{90:[1,547],126:$V91,171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},o($VY1,[2,118]),o($VY1,[2,119],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,212:$VU,214:$VV,219:$VX,220:$VY,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o($Vj1,[2,98]),o($Vj1,[2,158]),o($Vt1,[2,266]),o($Vt1,[2,298]),o($Vt1,[2,273]),o($V52,[2,279]),o($Vt2,$V32,{115:548,14:$V42}),o($V52,[2,280]),{11:$VC2,12:226,13:358,15:228,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,138:$Vz,139:$VA,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,170:$VJ,171:$VE1,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,202:513,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($VK1,[2,83]),o($VK1,[2,84]),{97:[1,549]},{97:[2,93]},{97:[2,94]},{13:550,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},o($Vt1,[2,156]),o($Vv2,[2,188]),o($Vv2,[2,195],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,212:$VU,214:$VV,219:$VX,220:$VY,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o([1,6,10,11,14,22,71,90,97,106,112,135,137,147,200,201,212,213,214,219,220,238],[2,326],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,229:[1,551],239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o($Vw2,[2,328],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,213:[1,552],239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o($VU1,[2,327],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o($Vj1,[2,258]),o($Vj1,[2,130]),o($Vg2,[2,247]),o($Vt2,$V32,{115:553,14:$Vf2}),{6:$V51,9:487,11:$VA2,126:$V91,132:554,171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},o($Vz2,$V62,{167:372,150:373,168:374,169:375,50:379,146:555,51:$V8,89:$Vq,96:$VN1,170:$V72,171:$V82,172:$V92}),o($Vj1,[2,169]),{162:556,164:$Vj2,165:$Vk2},o($Vj1,[2,282]),{6:$V51,9:487,11:$VA2,132:557},o($Vj1,[2,334]),o($Vq2,[2,338]),o($VB2,[2,289],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,212:$VU,214:$VV,219:$VX,220:$VY,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o($VD2,$V32,{115:559,11:[1,558],14:$V42}),o($VD2,$V32,{115:559,14:$V42,22:[1,560]}),o($VY1,[2,116]),o($Vy1,[2,108]),o($Vy1,[2,109]),o($Vy1,[2,112]),{6:$V51,9:516,10:$Vr2,11:$VA2,132:561},o($VK1,[2,90]),{90:[1,562],126:$V91,171:$Va1,211:149,212:$VU,214:$VV,217:150,218:107,219:$VX,220:$VY,222:108,238:$Vb1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1},{13:563,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{13:564,16:155,17:30,18:31,19:$V2,20:$V3,23:$V4,24:$V5,25:36,26:$V6,32:$V7,34:12,35:13,36:14,37:15,38:16,39:17,40:18,41:19,42:20,43:21,44:22,45:23,46:24,47:25,48:26,49:27,50:102,51:$V8,52:97,53:$V9,54:$Va,55:98,56:$Vb,57:96,58:$Vc,59:99,60:$Vd,61:116,62:$Ve,63:79,64:$Vf,65:117,66:$Vg,72:40,73:$Vh,74:$Vi,75:$Vj,76:$Vk,77:$Vl,78:$Vm,79:$Vn,80:$Vo,82:92,83:$Vp,89:$Vq,91:$Vr,96:$Vs,101:46,103:$Vt,109:100,121:70,122:$Vu,123:$Vv,124:$Vw,129:45,130:$Vx,131:38,136:$Vy,140:48,141:49,142:50,143:$VB,144:$VC,148:72,150:77,151:$VD,152:$VE,154:$VF,155:93,156:$VG,157:$VH,158:$VI,166:44,168:76,173:101,175:$VK,176:57,178:39,184:$VL,185:$VM,186:41,187:42,188:$VN,189:47,192:64,193:$VO,194:$VP,197:$VQ,198:$VR,204:$VS,210:$VT,211:60,212:$VU,214:$VV,215:61,216:$VW,217:62,218:107,219:$VX,220:$VY,222:108,230:$VZ,235:58,236:$V_,240:$V$,241:$V01,242:$V11,243:$V21,244:$V31,245:$V41},{6:$V51,9:566,10:$Vx2,11:$VA2,132:565},o($Vg2,[2,141]),{14:$Vu2,22:[1,567]},o($Vj1,[2,170]),o($Vj1,[2,332]),o($Vj1,[2,120]),{6:$V51,9:449,10:$Vr2},o($Vj1,[2,121]),o($V52,[2,281]),{97:[2,95]},o($VU1,[2,329],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o($VU1,[2,330],{218:107,222:108,211:149,217:150,126:$V91,171:$Va1,239:$Vc1,242:$Vd1,243:$Ve1,246:$Vf1,247:$Vg1,248:$Vh1}),o($Vg2,[2,248]),{11:$VC2,15:268,32:$V7,50:269,51:$V8,52:272,53:$V9,54:$Va,55:273,56:$Vb,57:270,58:$Vc,61:116,62:$Ve,63:271,64:$Vf,65:117,66:$Vg,133:531,134:267,136:$VJ1,138:$Vz,139:$VA},{162:568,164:$Vj2,165:$Vk2},o($Vj1,[2,168])],
	defaultActions: {135:[2,3],163:[2,264],321:[2,242],520:[2,93],521:[2,94],562:[2,95]},
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

	            var tsym = lexer.yytext;
	            var tok = self.terminals_[symbol] || symbol;
	            var tloc = tsym ? tsym._loc : -1;
	            var tpos = tloc != -1 ? "[" + tsym._loc + ":" + tsym._len + "]" : '[0:0]';

	            if (lexer.showPosition) {
	                errStr = 'Parse error at '+(tpos)+":\n"+lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + (self.terminals_[symbol] || symbol)+ "'";
	            } else {
	                errStr = 'Parse error at '+(tpos)+": Unexpected " + (symbol == EOF ? "end of input" : ("'"+(tok)+"'"));
	            }

	            self.parseError(errStr, {
	                lexer: lexer,
	                text: lexer.match,
	                token: tok,
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
	            yytext = lexer.yytext;
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
	                    yytext = lexer.yytext;
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
	                yyval.$ = vstack[vstack.length-len];
	                r = this.performAction(yyval, yytext, yy, action[1], vstack);
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


	if (true) {
	exports.parser = parser;
	exports.Parser = parser.Parser;
	exports.parse = function () { return parser.parse.apply(parser, arguments); };
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

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
		
		var helpers = __webpack_require__(2);
		var ERR = __webpack_require__(5);
		var v8 = null; // require 'v8-natives'
		
		var T = __webpack_require__(1);
		var Token = T.Token;
		
		var SourceMap = __webpack_require__(8).SourceMap;
		
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
		var ROOT = null;
		
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
				value.setLeft(new Splat(value.left()));
				return value;
			} else {
				return new Splat(value);
			};
		};
		
		var SEMICOLON_TEST = /;(\s*\/\/.*)?[\n\s\t]*$/;
		var RESERVED_TEST = /^(default|char)$/;
		
		// captures error from parser
		function parseError(str,o){
			// find nearest token
			var err;
			
			if (o.lexer) {
				var token = o.lexer.yytext;
				// console.log o:lexer:pos,token.@loc
				err = new ERR.ImbaParseError({message: str},{
					pos: o.lexer.pos,
					tokens: o.lexer.tokens,
					token: o.lexer.yytext,
					meta: o
				});
				
				throw err;
				
				// should find the closest token with actual position
				// str = "[{token.@loc}:{token.@len || String(token):length}] {str}"
			};
			var e = new Error(str);
			e.lexer = o.lexer;
			e.options = o;
			throw e;
		}; exports.parseError = parseError;
		
		function c__(obj){
			return typeof obj == 'string' ? (obj) : (obj.c());
		};
		
		function mark__(tok){
			if (tok && (OPTS.sourceMapInline || OPTS.sourceMap) && tok.sourceMapMarker) {
				return tok.sourceMapMarker();
			} else {
				return '';
			};
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
			return ary.map(function(v) { return typeof v == 'string' ? (v) : (v.c()); });
		};
		
		function dump__(obj,key){
			if (obj instanceof Array) {
				return obj.map(function(v) { return v && v.dump ? (v.dump(key)) : (v); });
			} else if (obj && obj.dump) {
				return obj.dump();
			};
		};
		
		function compact__(ary){
			if (ary instanceof ListNode) {
				return ary.compact();
			};
			
			return ary.filter(function(v) { return v != undefined && v != null; });
		};
		
		function reduce__(res,ary){
			for (var i = 0, items = iter$(ary), len = items.length, v; i < len; i++) {
				v = items[i];
				v instanceof Array ? (reduce__(res,v)) : (res.push(v));
			};
			return;
		};
		
		function flatten__(ary,compact){
			if(compact === undefined) compact = false;
			var out = [];
			for (var i = 0, items = iter$(ary), len = items.length, v; i < len; i++) {
				v = items[i];
				v instanceof Array ? (reduce__(out,v)) : (out.push(v));
			};
			return out;
		};
		
		AST.parse = function (str,opts){
			if(opts === undefined) opts = {};
			var indent = str.match(/\t+/)[0];
			// really? Require the compiler, not this
			return Imbac.parse(str,opts);
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
		
		function Indentation(a,b){
			this._open = a;
			this._close = b;
			this;
		};
		
		exports.Indentation = Indentation; // export class 
		Indentation.prototype.open = function(v){ return this._open; }
		Indentation.prototype.setOpen = function(v){ this._open = v; return this; };
		Indentation.prototype.close = function(v){ return this._close; }
		Indentation.prototype.setClose = function(v){ this._close = v; return this; };
		
		Indentation.prototype.isGenerated = function (){
			return this._open && this._open.generated;
		};
		
		Indentation.prototype.aloc = function (){
			return this._open && this._open._loc || 0;
		};
		
		Indentation.prototype.bloc = function (){
			return this._close && this._close._loc || 0;
		};
		
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
		
		function Stash(){
			this._entities = [];
		};
		
		Stash.prototype.add = function (item){
			this._entities.unshift(item);
			return this;
		};
		
		Stash.prototype.pluck = function (item){
			var match = null;
			for (var i = 0, ary = iter$(this._entities), len = ary.length, entity; i < len; i++) {
				entity = ary[i];
				if (entity == item || (entity instanceof item)) {
					match = entity;
					this._entities.splice(i,1);
					return match;
				};
			};
			return null;
		};
		
		
		function Stack(){
			this.reset();
		};
		
		exports.Stack = Stack; // export class 
		Stack.prototype.loglevel = function(v){ return this._loglevel; }
		Stack.prototype.setLoglevel = function(v){ this._loglevel = v; return this; };
		Stack.prototype.nodes = function(v){ return this._nodes; }
		Stack.prototype.setNodes = function(v){ this._nodes = v; return this; };
		Stack.prototype.scopes = function(v){ return this._scopes; }
		Stack.prototype.setScopes = function(v){ this._scopes = v; return this; };
		
		Stack.prototype.reset = function (){
			this._nodes = [];
			this._scoping = [];
			this._scopes = []; // for analysis - should rename
			this._stash = new Stash(this);
			this._loglevel = 3;
			this._counter = 0;
			this._counters = {};
			return this;
		};
		
		Stack.prototype.incr = function (name){
			var $1;
			this._counters[($1 = name)] || (this._counters[$1] = 0);
			return this._counters[name] += 1;
		};
		
		Stack.prototype.stash = function (){
			return this._stash;
		};
		
		Stack.prototype.option = function (key){
			return this._options && this._options[key];
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
			test || (test = function(v) { return !(v instanceof VarOrAccess); });
			
			if (test.prototype instanceof Node) {
				var typ = test;
				test = function(v) { return v instanceof typ; };
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
		
		Stack.prototype.block = function (){
			return this.up(Block);
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
			return ("Stack(" + this._nodes.join(" -> ") + ")");
		};
		
		Stack.prototype.scoping = function (){
			return this._nodes.filter(function(n) { return n._scope; }).map(function(n) { return n._scope; });
		};
		
		// Lots of globals -- really need to deal with one stack per file / context
		module.exports.STACK = STACK = new Stack();
		
		GLOBSTACK = STACK;
		
		// use a bitmask for these
		
		function Node(){
			this.setup();
			this;
		};
		
		exports.Node = Node; // export class 
		Node.prototype.o = function(v){ return this._o; }
		Node.prototype.setO = function(v){ this._o = v; return this; };
		Node.prototype.options = function(v){ return this._options; }
		Node.prototype.setOptions = function(v){ this._options = v; return this; };
		Node.prototype.traversed = function(v){ return this._traversed; }
		Node.prototype.setTraversed = function(v){ this._traversed = v; return this; };
		
		Node.prototype.safechain = function (){
			return false;
		};
		
		Node.prototype.p = function (){
			// allow controlling this from CLI
			if (STACK.loglevel() > 0) {
				console.log.apply(console,arguments);
			};
			return this;
		};
		
		Node.prototype.typeName = function (){
			return this.constructor.name;
		};
		
		Node.prototype.namepath = function (){
			return this.typeName();
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
			for (var i = 0, keys = Object.keys(obj), l = keys.length; i < l; i++){
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
		
		Node.prototype.token = function (){
			return null;
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
		
		Node.prototype.isString = function (){
			return false;
		};
		
		Node.prototype.isPrimitive = function (deep){
			return false;
		};
		
		Node.prototype.isReserved = function (){
			return false;
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
			return ("" + (this.constructor.name));
		};
		
		// swallow might be better name
		Node.prototype.consume = function (node){
			if (node instanceof PushAssign) {
				return new PushAssign(node.op(),node.left(),this);
			};
			
			if (node instanceof Assign) {
				// node.right = self
				return OP(node.op(),node.left(),this);
			} else if (node instanceof Op) {
				return OP(node.op(),node.left(),this);
			} else if (node instanceof Return) {
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
			var node = new ExpressionBlock([this]);
			return node.addExpression(expr);
		};
		
		
		Node.prototype.indented = function (a,b){
			
			if (a instanceof Indentation) {
				this._indentation = a;
				return this;
			};
			
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
				if (!ch.manual) { out = ("" + (ch.var.c()) + " = " + out) };
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
		
		function ValueNode(value){
			this.setup();
			this._value = this.load(value);
		};
		
		subclass$(ValueNode,Node);
		exports.ValueNode = ValueNode; // export class 
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
		
		
		function Statement(){ return ValueNode.apply(this,arguments) };
		
		subclass$(Statement,ValueNode);
		exports.Statement = Statement; // export class 
		Statement.prototype.isExpressable = function (){
			return false;
		};
		
		
		function Meta(){ return ValueNode.apply(this,arguments) };
		
		subclass$(Meta,ValueNode);
		exports.Meta = Meta; // export class 
		Meta.prototype.isPrimitive = function (deep){
			return true;
		};
		
		function Comment(){ return Meta.apply(this,arguments) };
		
		subclass$(Comment,Meta);
		exports.Comment = Comment; // export class 
		Comment.prototype.visit = function (){
			var block, next;
			if (block = this.up()) {
				var idx = block.indexOf(this) + 1;
				if (block.index(idx) instanceof Terminator) { idx += 1 };
				if (next = block.index(idx)) {
					next._desc = this;
				};
			};
			
			return this;
		};
		
		Comment.prototype.toDoc = function (){
			return helpers.normalizeIndentation("" + this._value._value);
		};
		
		Comment.prototype.toJSON = function (){
			return helpers.normalizeIndentation("" + this._value._value);
		};
		
		Comment.prototype.c = function (o){
			var v = this._value._value;
			if (o && o.expression || v.match(/\n/) || this._value.type() == 'HERECOMMENT') { // multiline?
				return ("/*" + v + "*/");
			} else {
				return ("// " + v);
			};
		};
		
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
			// TODO this can contain several newlines
			// for sourcemaps it would be nice to parse this
			// and fix it up mark__(@value) + 
			return this._value.c();
			// var v = value.replace(/\\n/g,'\n')
			// v # .split()
			// v.split("\n").map(|v| v ? " // {v}" : v).join("\n")
		};
		
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
		function Index(){ return ValueNode.apply(this,arguments) };
		
		subclass$(Index,ValueNode);
		exports.Index = Index; // export class 
		Index.prototype.js = function (o){
			return this._value.c();
		};
		
		function ListNode(list){
			this.setup();
			this._nodes = this.load(list || []);
			this._indentation = null;
		};
		
		// PERF acces @nodes directly?
		subclass$(ListNode,Node);
		exports.ListNode = ListNode; // export class 
		ListNode.prototype.nodes = function(v){ return this._nodes; }
		ListNode.prototype.setNodes = function(v){ this._nodes = v; return this; };
		
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
		
		ListNode.prototype.pop = function (){
			var end = this._nodes.pop();
			return end;
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
			for (var i = 0, ary = iter$(this._nodes), len = ary.length; i < len; i++) {
				if (cb(ary[i])) { return true };
			};
			return false;
		};
		
		ListNode.prototype.every = function (cb){
			for (var i = 0, ary = iter$(this._nodes), len = ary.length; i < len; i++) {
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
		
		ListNode.prototype.removeAt = function (idx){
			var item = this._nodes[idx];
			if (idx >= 0) { this._nodes.splice(idx,1) };
			return item;
		};
		
		
		ListNode.prototype.replace = function (original,replacement){
			var idx = this._nodes.indexOf(original);
			if (idx >= 0) {
				if (replacement instanceof Array) {
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
			for (var i = 0, ary = iter$(this._nodes), len = ary.length, node; i < len; i++) {
				node = ary[i];
				if (node && !(node instanceof Meta)) { k++ };
			};
			return k;
		};
		
		ListNode.prototype.visit = function (){
			for (var i = 0, ary = iter$(this._nodes), len = ary.length, node; i < len; i++) {
				node = ary[i];
				node && node.traverse();
			};
			return this;
		};
		
		ListNode.prototype.isExpressable = function (){
			for (var i = 0, ary = iter$(this.nodes()), len = ary.length, node; i < len; i++) {
				node = ary[i];
				if (node && !node.isExpressable()) { return false };
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
			
			for (var j = 0, ary = iter$(nodes), len = ary.length, arg; j < len; j++) {
				arg = ary[j];
				var part = typeof arg == 'string' ? (arg) : ((arg ? (arg.c({expression: express})) : ('')));
				str += part;
				if (part && (!express || arg != last) && !(arg instanceof Meta)) { str += delim };
			};
			
			return str;
		};
		
		ListNode.prototype.indented = function (a,b){
			if (a instanceof Indentation) {
				this._indentation = a;
				return this;
			};
			
			this._indentation || (this._indentation = a && b ? (new Indentation(a,b)) : (INDENT));
			return this;
		};
		
		
		function ArgList(){ return ListNode.apply(this,arguments) };
		
		subclass$(ArgList,ListNode);
		exports.ArgList = ArgList; // export class 
		
		
		//	def indented a,b
		//		if a isa Indentation
		//			@indentation = a
		//			return self
		//
		//		@indentation ||= a and b ? Indentation.new(a,b) : INDENT
		//		self
		
		// def hasSplat
		// 	@nodes.some do |v| v isa Splat
		// def delimiter
		// 	","
		
		
		function AssignList(){ return ArgList.apply(this,arguments) };
		
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
		
		
		function Block(list){
			this.setup();
			// @nodes = compact__(flatten__(list)) or []
			this._nodes = list || [];
			this._head = null;
			this._indentation = null;
		};
		
		subclass$(Block,ListNode);
		exports.Block = Block; // export class 
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
			
			for (var i = 0, ary = iter$(this._nodes), len = ary.length, node; i < len; i++) {
				node = ary[i];
				node && node.traverse();
			};
			return this;
		};
		
		Block.prototype.block = function (){
			return this;
		};
		
		// def indented a,b
		// 	@indentation ||= a and b ? Indentation.new(a,b) : INDENT
		// 	self
		
		Block.prototype.loc = function (){
			// rather indents, no?
			var opt, ind;
			if (opt = this.option('ends')) {
				var a = opt[0].loc();
				var b = opt[1].loc();
				
				if (!a) { this.p(("no loc for " + (opt[0]))) };
				if (!b) { this.p(("no loc for " + (opt[1]))) };
				
				return [a[0],b[1]];
			} else if (ind = this._indentation) {
				return [ind.aloc(),ind.bloc()];
			} else {
				return [0,0];
			};
		};
		
		// go through children and unwrap inner nodes
		Block.prototype.unwrap = function (){
			var ary = [];
			for (var i = 0, items = iter$(this.nodes()), len = items.length, node; i < len; i++) {
				node = items[i];
				if (node instanceof Block) {
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
			if (ast.length == 0) { return '' };
			
			if (express) {
				return Block.__super__.js.call(this,o,{nodes: ast});
			};
			
			var str = "";
			for (var i = 0, ary = iter$(ast), len = ary.length; i < len; i++) {
				str += this.cpart(ary[i]);
			};
			
			// now add the head items as well
			if (this._head && this._head.length > 0) {
				var prefix = "";
				for (var i = 0, ary = iter$(this._head), len = ary.length; i < len; i++) {
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
		
		Block.prototype.expressions = function (){
			var expressions = [];
			for (var i = 0, ary = iter$(this.nodes()), len = ary.length, node; i < len; i++) {
				node = ary[i];
				if (!((node instanceof Terminator))) { expressions.push(node) };
			};
			return expressions;
		};
		
		
		Block.prototype.consume = function (node){
			var before;
			if (node instanceof TagTree) { // special case?!?
				this._nodes = this._nodes.map(function(child) {
					return child.consume(node);
				});
				
				var real = this.expressions();
				// FIXME should not include terminators and comments when counting
				// should only wrap the content in array (returning all parts)
				// for if/else blocks -- not loops
				
				// we need to compare the real length
				if (!node._loop && real.length > 1) {
					var nr = node.blocks().push(this);
					var arr = new Arr(new ArgList(this._nodes));
					arr.indented(this._indentation);
					this._indentation = null;
					
					if (node.reactive()) {
						this._nodes = [Util.callImba("static",[arr,new Num(nr)])];
					} else {
						this._nodes = [arr];
					};
				};
				
				
				
				return this;
			};
			
			// can also return super if it is expressable, but should we really?
			if (before = this.last()) {
				var after = before.consume(node);
				if (after != before) {
					if (after instanceof Block) {
						after = after.nodes();
					};
					
					this.replace(before,after);
				};
			};
			// really?
			return this;
		};
		
		
		Block.prototype.isExpressable = function (){
			if (!this._nodes.every(function(v) { return v.isExpressable(); })) { return false };
			return true;
		};
		
		Block.prototype.isExpression = function (){
			
			return this.option('express') || this._expression;
		};
		
		
		// this is almost like the old VarDeclarations but without the values
		function VarBlock(){ return ListNode.apply(this,arguments) };
		
		subclass$(VarBlock,ListNode);
		exports.VarBlock = VarBlock; // export class 
		VarBlock.prototype.load = function (list){
			var first = list[0];
			
			if (first instanceof Assign) {
				this._type = first.left()._type;
			} else if (first instanceof VarReference) {
				this._type = first._type;
			};
			// @type = list[0] and list[0].type
			return list;
		};
		
		// TODO All these inner items should rather be straight up literals
		// or basic localvars - without any care whatsoever about adding var to the
		// beginning etc. 
		VarBlock.prototype.addExpression = function (expr){
			
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
			var code = compact__(flatten__(cary__(this.nodes())));
			code = code.filter(function(n) { return n != null && n != undefined && n != EMPTY; });
			var out = code.join(",");
			// we just need to trust that the variables have been autodeclared beforehand
			// if we are inside an expression
			if (!o.isExpression()) { out = "var " + out };
			return out;
		};
		
		
		VarBlock.prototype.consume = function (node){
			// It doesnt make much sense for a VarBlock to consume anything
			// it should probably return void for methods
			return this;
		};
		
		
		// Could inherit from valueNode
		function Parens(value,open,close){
			this.setup();
			this._open = open;
			this._close = close;
			this._value = this.load(value);
		};
		
		subclass$(Parens,ValueNode);
		exports.Parens = Parens; // export class 
		Parens.prototype.load = function (value){
			this._noparen = false;
			return (value instanceof Block) && value.count() == 1 ? (value.first()) : (value);
		};
		
		Parens.prototype.isString = function (){
			// checking if this is an interpolated string
			return this._open && String(this._open) == '("' || this.value().isString();
		};
		
		Parens.prototype.js = function (o){
			
			var par = this.up();
			var v = this._value;
			var str = null;
			
			if (v instanceof Func) { this._noparen = true };
			
			if (par instanceof Block) {
				// is it worth it?
				if (!o.isExpression()) { this._noparen = true };
				str = v instanceof Array ? (cary__(v)) : (v.c({expression: o.isExpression()}));
			} else {
				str = v instanceof Array ? (cary__(v)) : (v.c({expression: true}));
			};
			
			// check if we really need parens here?
			return str;
		};
		
		Parens.prototype.set = function (obj){
			console.log(("Parens set " + JSON.stringify(obj)));
			return Parens.__super__.set.call(this,obj);
		};
		
		
		Parens.prototype.shouldParenthesize = function (){
			// no need to parenthesize if this is a line in a block
			if (this._noparen) { return false }; //  or par isa ArgList
			return true;
		};
		
		
		Parens.prototype.prebreak = function (br){
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
		function ExpressionBlock(){ return ListNode.apply(this,arguments) };
		
		subclass$(ExpressionBlock,ListNode);
		exports.ExpressionBlock = ExpressionBlock; // export class 
		ExpressionBlock.prototype.c = function (){
			return this.map(function(item) { return item.c(); }).join(",");
		};
		
		ExpressionBlock.prototype.consume = function (node){
			return this.value().consume(node);
		};
		
		ExpressionBlock.prototype.addExpression = function (expr){
			// Need to take care of the splat here to.. hazzle
			if (expr.node() instanceof Assign) {
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
		Return.prototype.value = function(v){ return this._value; }
		Return.prototype.setValue = function(v){ this._value = v; return this; };
		
		Return.prototype.visit = function (){
			if (this._value && this._value.traverse) { return this._value.traverse() };
		};
		
		Return.prototype.js = function (o){
			var v = this._value;
			
			if (v instanceof ArgList) {
				return ("return [" + v.c({expression: true}) + "]");
			} else if (v) {
				return ("return " + v.c({expression: true}));
			} else {
				return "return";
			};
		};
		
		Return.prototype.c = function (){
			if (!(this.value()) || this.value().isExpressable()) { return Return.__super__.c.apply(this,arguments) };
			return this.value().consume(this).c();
		};
		
		Return.prototype.consume = function (node){
			return this;
		};
		
		function ImplicitReturn(){ return Return.apply(this,arguments) };
		
		subclass$(ImplicitReturn,Return);
		exports.ImplicitReturn = ImplicitReturn; // export class 
		
		
		function GreedyReturn(){ return ImplicitReturn.apply(this,arguments) };
		
		subclass$(GreedyReturn,ImplicitReturn);
		exports.GreedyReturn = GreedyReturn; // export class 
		
		
		// cannot live inside an expression(!)
		function Throw(){ return Statement.apply(this,arguments) };
		
		subclass$(Throw,Statement);
		exports.Throw = Throw; // export class 
		Throw.prototype.js = function (o){
			return ("throw " + (this.value().c()));
		};
		
		Throw.prototype.consume = function (node){
			// ROADMAP should possibly consume to the value of throw and then throw?
			return this;
		};
		
		
		function LoopFlowStatement(lit,expr){
			this.setLiteral(lit);
			this.setExpression(expr); // && ArgList.new(expr) # really?
		};
		
		subclass$(LoopFlowStatement,Statement);
		exports.LoopFlowStatement = LoopFlowStatement; // export class 
		LoopFlowStatement.prototype.literal = function(v){ return this._literal; }
		LoopFlowStatement.prototype.setLiteral = function(v){ this._literal = v; return this; };
		LoopFlowStatement.prototype.expression = function(v){ return this._expression; }
		LoopFlowStatement.prototype.setExpression = function(v){ this._expression = v; return this; };
		
		LoopFlowStatement.prototype.visit = function (){
			if (this.expression()) { return this.expression().traverse() };
		};
		
		LoopFlowStatement.prototype.consume = function (node){
			return this;
		};
		
		LoopFlowStatement.prototype.c = function (){
			if (!(this.expression())) { return LoopFlowStatement.__super__.c.apply(this,arguments) };
			// get up to the outer loop
			var _loop = STACK.up(Loop);
			
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
		
		
		function BreakStatement(){ return LoopFlowStatement.apply(this,arguments) };
		
		subclass$(BreakStatement,LoopFlowStatement);
		exports.BreakStatement = BreakStatement; // export class 
		BreakStatement.prototype.js = function (o){
			return "break";
		};
		
		function ContinueStatement(){ return LoopFlowStatement.apply(this,arguments) };
		
		subclass$(ContinueStatement,LoopFlowStatement);
		exports.ContinueStatement = ContinueStatement; // export class 
		ContinueStatement.prototype.js = function (o){
			return "continue";
		};
		
		function DebuggerStatement(){ return Statement.apply(this,arguments) };
		
		subclass$(DebuggerStatement,Statement);
		exports.DebuggerStatement = DebuggerStatement; // export class 
		
		
		
		// PARAMS
		
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
		Param.prototype.name = function(v){ return this._name; }
		Param.prototype.setName = function(v){ this._name = v; return this; };
		Param.prototype.index = function(v){ return this._index; }
		Param.prototype.setIndex = function(v){ this._index = v; return this; };
		Param.prototype.defaults = function(v){ return this._defaults; }
		Param.prototype.setDefaults = function(v){ this._defaults = v; return this; };
		Param.prototype.splat = function(v){ return this._splat; }
		Param.prototype.setSplat = function(v){ this._splat = v; return this; };
		Param.prototype.variable = function(v){ return this._variable; }
		Param.prototype.setVariable = function(v){ this._variable = v; return this; };
		
		// what about object-params?
		
		Param.prototype.varname = function (){
			return this._variable ? (this._variable.c()) : (this.name());
		};
		
		Param.prototype.js = function (o){
			if (this._variable) { return this._variable.c() };
			
			if (this.defaults()) {
				// should not include any source-mapping here?
				return ("if(" + (this.name().c()) + " == null) " + (this.name().c()) + " = " + (this.defaults().c()));
			};
			// see if this is the initial declarator?
		};
		
		Param.prototype.visit = function (){
			var variable_, v_;
			if (this._defaults) { this._defaults.traverse() };
			(variable_ = this.variable()) || ((this.setVariable(v_ = this.scope__().register(this.name(),this)),v_));
			
			if (this._name instanceof Identifier) {
				// change type here?
				if (this._name._value) { this._name._value._type = "PARAMVAR" };
				this._name.references(this._variable);
				// console.log "got here!! {@name:constructor}"
				// @name.@token.@variable = @variable if @name.@token
			};
			
			return this;
		};
		
		Param.prototype.assignment = function (){
			return OP('=',this.variable().accessor(),this.defaults());
		};
		
		Param.prototype.isExpressable = function (){
			return !(this.defaults()) || this.defaults().isExpressable();
		};
		
		Param.prototype.dump = function (){
			return {loc: this.loc()};
		};
		
		Param.prototype.loc = function (){
			return this._name && this._name.region();
		};
		
		Param.prototype.toJSON = function (){
			return {
				type: this.typeName(),
				name: this.name(),
				defaults: this.defaults()
			};
		};
		
		
		function SplatParam(){ return Param.apply(this,arguments) };
		
		subclass$(SplatParam,Param);
		exports.SplatParam = SplatParam; // export class 
		SplatParam.prototype.loc = function (){
			// hacky.. cannot know for sure that this is right?
			var r = this.name().region();
			return [r[0] - 1,r[1]];
		};
		
		function BlockParam(){ return Param.apply(this,arguments) };
		
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
		
		
		function OptionalParam(){ return Param.apply(this,arguments) };
		
		subclass$(OptionalParam,Param);
		exports.OptionalParam = OptionalParam; // export class 
		
		
		function NamedParam(){ return Param.apply(this,arguments) };
		
		subclass$(NamedParam,Param);
		exports.NamedParam = NamedParam; // export class 
		
		
		function RequiredParam(){ return Param.apply(this,arguments) };
		
		subclass$(RequiredParam,Param);
		exports.RequiredParam = RequiredParam; // export class 
		
		
		function NamedParams(){ return ListNode.apply(this,arguments) };
		
		subclass$(NamedParams,ListNode);
		exports.NamedParams = NamedParams; // export class 
		NamedParams.prototype.index = function(v){ return this._index; }
		NamedParams.prototype.setIndex = function(v){ this._index = v; return this; };
		NamedParams.prototype.variable = function(v){ return this._variable; }
		NamedParams.prototype.setVariable = function(v){ this._variable = v; return this; };
		
		NamedParams.prototype.load = function (list){
			var load = function(k) { return new NamedParam(k.key(),k.value()); };
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
		
		
		NamedParams.prototype.varname = function (){
			return this.variable().c();
		};
		
		NamedParams.prototype.name = function (){
			return this.varname();
		};
		
		NamedParams.prototype.js = function (o){
			return "namedpar";
		};
		
		NamedParams.prototype.toJSON = function (){
			return {
				type: this.typeName(),
				nodes: this.filter(function(v) { return v instanceof NamedParam; })
			};
		};
		
		
		function IndexedParam(){ return Param.apply(this,arguments) };
		
		subclass$(IndexedParam,Param);
		exports.IndexedParam = IndexedParam; // export class 
		IndexedParam.prototype.parent = function(v){ return this._parent; }
		IndexedParam.prototype.setParent = function(v){ this._parent = v; return this; };
		IndexedParam.prototype.subindex = function(v){ return this._subindex; }
		IndexedParam.prototype.setSubindex = function(v){ this._subindex = v; return this; };
		
		IndexedParam.prototype.visit = function (){
			// ary.[-1] # possible
			// ary.(-1) # possible
			// str(/ok/,-1)
			// scope.register(@name,self)
			// BUG The defaults should probably be looked up like vars
			var variable_, v_;
			(variable_ = this.variable()) || ((this.setVariable(v_ = this.scope__().register(this.name(),this)),v_));
			this.variable().proxy(this.parent().variable(),this.subindex());
			return this;
		};
		
		
		function ArrayParams(){ return ListNode.apply(this,arguments) };
		
		subclass$(ArrayParams,ListNode);
		exports.ArrayParams = ArrayParams; // export class 
		ArrayParams.prototype.index = function(v){ return this._index; }
		ArrayParams.prototype.setIndex = function(v){ this._index = v; return this; };
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
			var self = this;
			if (!((list instanceof Arr))) { return null };
			// try the basic first
			if (!list.splat()) {
				return list.value().map(function(v,i) {
					// must make sure the params are supported here
					// should really not parse any array at all(!)
					var name = v;
					if (v instanceof VarOrAccess) {
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
		
		function ParamList(){ return ListNode.apply(this,arguments) };
		
		subclass$(ParamList,ListNode);
		exports.ParamList = ParamList; // export class 
		ParamList.prototype.splat = function(v){ return this._splat; }
		ParamList.prototype.setSplat = function(v){ this._splat = v; return this; };
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
		
		ParamList.prototype.metadata = function (){
			return this.filter(function(par) { return !(par instanceof Meta); });
		};
		
		ParamList.prototype.toJSON = function (){
			return this.metadata();
		};
		
		ParamList.prototype.visit = function (){
			this._splat = this.filter(function(par) { return par instanceof SplatParam; })[0];
			var blk = this.filter(function(par) { return par instanceof BlockParam; });
			
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
				if (this._splat) { pars = this.filter(function(arg) { return (arg instanceof RequiredParam) || (arg instanceof OptionalParam); }) };
				return compact__(pars.map(function(arg) { return c__(arg.varname()); })).join(",");
			} else {
				throw "not implemented paramlist js";
				return "ta" + compact__(this.map(function(arg) { return arg.c(); })).join(",");
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
			var isFunc = function(js) { return ("typeof " + js + " == 'function'"); };
			
			// This is broken when dealing with iframes anc XSS scripting
			// but for now it is the best test for actual arguments
			// can also do constructor.name == 'Object'
			var isObj = function(js) { return ("" + js + ".constructor === Object"); };
			var isntObj = function(js) { return ("" + js + ".constructor !== Object"); };
			// should handle some common cases in a cleaner (less verbose) manner
			// does this work with default params after optional ones? Is that even worth anything?
			// this only works in one direction now, unlike TupleAssign
			
			// we dont really check the length etc now -- so it is buggy for lots of arguments
			
			// if we have optional params in the regular order etc we can go the easy route
			// slightly hacky now. Should refactor all of these to use the signature?
			if (!named && !splat && !blk && opt.length > 0 && signature.join(" ").match(/opt$/)) {
				for (var i = 0, len_ = opt.length, par; i < len_; i++) {
					par = opt[i];
					ast.push(("if(" + (par.name().c()) + " === undefined) " + (par.name().c()) + " = " + (par.defaults().c())));
				};
			} else if (named && !splat && !blk && opt.length == 0) { // and no block?!
				// different shorthands
				// if named
				ast.push(("if(!" + (namedvar.c()) + "||" + isntObj(namedvar.c()) + ") " + (namedvar.c()) + " = \{\}"));
			} else if (blk && opt.length == 1 && !splat && !named) {
				var op = opt[0];
				var opn = op.name().c();
				var bn = blk.name().c();
				ast.push(("if(" + bn + "==undefined && " + isFunc(opn) + ") " + bn + " = " + opn + "," + opn + " = " + (op.defaults().c())));
				ast.push(("if(" + opn + "==undefined) " + opn + " = " + (op.defaults().c())));
			} else if (blk && named && opt.length == 0 && !splat) {
				bn = blk.name().c();
				ast.push(("if(" + bn + "==undefined && " + isFunc(namedvar.c()) + ") " + bn + " = " + (namedvar.c()) + "," + (namedvar.c()) + " = \{\}"));
				ast.push(("else if(!" + (namedvar.c()) + "||" + isntObj(namedvar.c()) + ") " + (namedvar.c()) + " = \{\}"));
			} else if (opt.length > 0 || splat) { // && blk  # && !splat
				
				var argvar = this.scope__().temporary(this,{pool: 'arguments'}).predeclared().c();
				var len = this.scope__().temporary(this,{pool: 'counter'}).predeclared().c();
				
				var last = ("" + argvar + "[" + len + "-1]");
				var pop = ("" + argvar + "[--" + len + "]");
				ast.push(("var " + argvar + " = arguments, " + len + " = " + argvar + ".length"));
				
				if (blk) {
					bn = blk.name().c();
					if (splat) {
						ast.push(("var " + bn + " = " + isFunc(last) + " ? " + pop + " : null"));
					} else if (reg.length > 0) {
						// ast.push "// several regs really?"
						ast.push(("var " + bn + " = " + len + " > " + (reg.length) + " && " + isFunc(last) + " ? " + pop + " : null"));
					} else {
						ast.push(("var " + bn + " = " + isFunc(last) + " ? " + pop + " : null"));
					};
				};
				
				// if we have named params - look for them before splat
				// should probably loop through pars in the same order they were added
				// should it be prioritized above optional objects??
				if (named) {
					// should not include it when there is a splat?
					ast.push(("var " + (namedvar.c()) + " = " + last + "&&" + isObj(last) + " ? " + pop + " : \{\}"));
				};
				
				for (var i1 = 0, len_ = opt.length, par1; i1 < len_; i1++) {
					par1 = opt[i1];
					ast.push(("if(" + len + " < " + (par1.index() + 1) + ") " + (par1.name().c()) + " = " + (par1.defaults().c())));
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
				for (var i2 = 0, len_ = opt.length, par2; i2 < len_; i2++) {
					par2 = opt[i2];
					ast.push(("if(" + (par2.name().c()) + " === undefined) " + (par2.name().c()) + " = " + (par2.defaults().c())));
				};
			};
			
			// now set stuff if named params(!)
			
			if (named) {
				for (var i3 = 0, ary = iter$(named.nodes()), len_ = ary.length, k; i3 < len_; i3++) {
					// console.log "named var {k.c}"
					k = ary[i3];
					op = OP('.',namedvar,k.c()).c();
					ast.push(("var " + (k.c()) + " = " + op + " !== undefined ? " + op + " : " + (k.defaults().c())));
				};
			};
			
			if (arys.length) {
				for (var i4 = 0, len_ = arys.length; i4 < len_; i4++) {
					// create tuples
					arys[i4].head(o,ast,this);
					// ast.push v.c
				};
			};
			
			
			
			// if opt:length == 0
			return ast.length > 0 ? ((ast.join(";\n") + ";")) : (EMPTY);
		};
		
		
		// Legacy. Should move away from this?
		function VariableDeclaration(){ return ListNode.apply(this,arguments) };
		
		subclass$(VariableDeclaration,ListNode);
		exports.VariableDeclaration = VariableDeclaration; // export class 
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
			return list.map(function(par) { return new VariableDeclarator(par.name(),par.defaults(),par.splat()); });
		};
		
		VariableDeclaration.prototype.isExpressable = function (){
			return this.nodes().every(function(item) { return item.isExpressable(); });
		};
		
		VariableDeclaration.prototype.js = function (o){
			if (this.count() == 0) { return EMPTY };
			
			if (this.count() == 1 && !(this.isExpressable())) {
				this.first().variable().autodeclare();
				var node = this.first().assignment();
				return node.c();
			};
			
			// FIX PERFORMANCE
			var out = compact__(cary__(this.nodes())).join(", ");
			return out ? (("var " + out)) : ("");
			// "var " + compact__(cary__(nodes)).join(", ") + ""
		};
		
		function VariableDeclarator(){ return Param.apply(this,arguments) };
		
		subclass$(VariableDeclarator,Param);
		exports.VariableDeclarator = VariableDeclarator; // export class 
		VariableDeclarator.prototype.visit = function (){
			// even if we should traverse the defaults as if this variable does not exist
			// we need to preregister it and then activate it later
			var variable_, v_;
			(variable_ = this.variable()) || ((this.setVariable(v_ = this.scope__().register(this.name(),null)),v_));
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
				
				return ("" + (this.variable().c()) + " = " + defs);
			} else {
				return ("" + (this.variable().c()));
			};
		};
		
		VariableDeclarator.prototype.accessor = function (){
			return this;
		};
		
		
		// TODO clean up and refactor all the different representations of vars
		// VarName, VarReference, LocalVarAccess?
		function VarName(a,b){
			VarName.__super__.constructor.apply(this,arguments);
			this._splat = b;
		};
		
		subclass$(VarName,ValueNode);
		exports.VarName = VarName; // export class 
		VarName.prototype.variable = function(v){ return this._variable; }
		VarName.prototype.setVariable = function(v){ this._variable = v; return this; };
		VarName.prototype.splat = function(v){ return this._splat; }
		VarName.prototype.setSplat = function(v){ this._splat = v; return this; };
		
		VarName.prototype.visit = function (){
			// should we not lookup instead?
			// FIXME p "register value {value.c}"
			var variable_, v_;
			(variable_ = this.variable()) || ((this.setVariable(v_ = this.scope__().register(this.value().c(),null)),v_));
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
		
		
		function VarList(t,l,r){
			this._traversed = false;
			this._type = this.type();
			this._left = l;
			this._right = r;
		};
		
		subclass$(VarList,Node);
		exports.VarList = VarList; // export class 
		VarList.prototype.type = function(v){ return this._type; }
		VarList.prototype.setType = function(v){ this._type = v; return this; }; // let / var / const
		VarList.prototype.left = function(v){ return this._left; }
		VarList.prototype.setLeft = function(v){ this._left = v; return this; };
		VarList.prototype.right = function(v){ return this._right; }
		VarList.prototype.setRight = function(v){ this._right = v; return this; };
		
		// format :type, :left, :right
		
		// should throw error if there are more values on right than left
		
		VarList.prototype.visit = function (){
			
			// we need to carefully traverse children in the right order
			// since we should be able to reference
			var r;
			for (var i = 0, ary = iter$(this.left()), len = ary.length; i < len; i++) {
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
				for (var i = 0, ary = iter$(this.left()), len = ary.length, l; i < len; i++) {
					l = ary[i];
					if (l.splat()) {
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
				for (var i1 = 0, ary = iter$(this.left()), len = ary.length, l1; i1 < len; i1++) {
					l1 = ary[i1];
					r = this.right()[i1];
					pairs.push(r ? (OP('=',l1.variable().accessor(),r)) : (l1));
				};
			};
			
			return ("var " + (pairs.c()));
		};
		
		
		// CODE
		
		function Code(){ return Node.apply(this,arguments) };
		
		subclass$(Code,Node);
		exports.Code = Code; // export class 
		Code.prototype.head = function(v){ return this._head; }
		Code.prototype.setHead = function(v){ this._head = v; return this; };
		Code.prototype.body = function(v){ return this._body; }
		Code.prototype.setBody = function(v){ this._body = v; return this; };
		Code.prototype.scope = function(v){ return this._scope; }
		Code.prototype.setScope = function(v){ this._scope = v; return this; };
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
		function Root(body,opts){
			this._traversed = false;
			this._body = blk__(body);
			this._scope = new RootScope(this,null);
			this._options = {};
		};
		
		subclass$(Root,Code);
		exports.Root = Root; // export class 
		Root.prototype.visit = function (){
			ROOT = STACK.ROOT = this._scope;
			this.scope().visit();
			return this.body().traverse();
		};
		
		Root.prototype.compile = function (o){
			STACK.reset(); // -- nested compilation does not work now
			OPTS = STACK._options = this._options = o || {};
			
			this.traverse();
			
			var out = this.c();
			var result = {
				js: out,
				ast: this,
				warnings: this.scope().warnings(),
				options: o,
				toString: function() { return this.js; }
			};
			if (o.sourceMapInline || o.sourceMap) {
				result.sourcemap = new SourceMap(result).generate();
			};
			
			return result;
		};
		
		Root.prototype.js = function (o){
			var out;
			if (this._options.bare) {
				out = this.scope().c();
			} else {
				this.body().consume(new ImplicitReturn());
				out = this.scope().c({indent: true});
				out = out.replace(/^\n?/,'\n');
				out = out.replace(/\n?$/,'\n\n');
				out = '(function(){' + out + '})();';
			};
			
			// find and replace shebangs
			var shebangs = [];
			out = out.replace(/^[ \t]*\/\/(\!.+)$/mg,function(m,shebang) {
				shebang = shebang.replace(/\bimba\b/g,'node');
				shebangs.push(("#" + shebang + "\n"));
				return "";
			});
			
			out = shebangs.join('') + out;
			
			return out;
		};
		
		
		Root.prototype.analyze = function (pars){
			if(!pars||pars.constructor !== Object) pars = {};
			var loglevel = pars.loglevel !== undefined ? pars.loglevel : 0;
			var entities = pars.entities !== undefined ? pars.entities : false;
			var scopes = pars.scopes !== undefined ? pars.scopes : true;
			STACK.setLoglevel(loglevel);
			STACK._analyzing = true;
			ROOT = STACK.ROOT = this._scope;
			
			OPTS = {
				analysis: {
					entities: entities,
					scopes: scopes
				}
			};
			
			this.traverse();
			STACK._analyzing = false;
			
			return this.scope().dump();
		};
		
		Root.prototype.inspect = function (){
			return true;
		};
		
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
		ClassDeclaration.prototype.name = function(v){ return this._name; }
		ClassDeclaration.prototype.setName = function(v){ this._name = v; return this; };
		ClassDeclaration.prototype.superclass = function(v){ return this._superclass; }
		ClassDeclaration.prototype.setSuperclass = function(v){ this._superclass = v; return this; };
		ClassDeclaration.prototype.initor = function(v){ return this._initor; }
		ClassDeclaration.prototype.setInitor = function(v){ this._initor = v; return this; };
		
		ClassDeclaration.prototype.consume = function (node){
			if (node instanceof Return) {
				this.option('return',true);
				return this;
			};
			return ClassDeclaration.__super__.consume.apply(this,arguments);
		};
		
		ClassDeclaration.prototype.namepath = function (){
			return this._namepath || (this._namepath = ("" + (this.name().c())));
		};
		
		ClassDeclaration.prototype.metadata = function (){
			var superclass_;
			return {
				type: 'class',
				namepath: this.namepath(),
				inherits: (superclass_ = this.superclass()) && superclass_.namepath  &&  superclass_.namepath(),
				path: this.name().c().toString(),
				desc: this._desc,
				loc: this.loc()
			};
		};
		
		ClassDeclaration.prototype.toJSON = function (){
			return this.metadata();
		};
		
		ClassDeclaration.prototype.visit = function (){
			// replace with some advanced lookup?
			ROOT.entities().add(this.namepath(),this);
			this.scope().visit();
			this.body().traverse();
			return this;
		};
		
		ClassDeclaration.prototype.js = function (o){
			this.scope().virtualize(); // is this always needed?
			this.scope().context().setValue(this.name());
			this.scope().context().setReference(this.name());
			// should probably also warn about stuff etc
			if (this.option('extension')) {
				return this.body().c();
			};
			
			var head = [];
			var o = this._options || {};
			var cname = this.name() instanceof Access ? (this.name().right()) : (this.name());
			var namespaced = this.name() != cname;
			var initor = null;
			var sup = this.superclass();
			
			var bodyindex = -1;
			var spaces = this.body().filter(function(item) { return item instanceof Terminator; });
			var mark = mark__(this.option('keyword'));
			
			this.body().map(function(c,i) {
				if ((c instanceof MethodDeclaration) && c.type() == 'constructor') {
					return bodyindex = i;
				};
			});
			
			if (bodyindex >= 0) {
				initor = this.body().removeAt(bodyindex);
			};
			
			// var initor = body.pluck do |c| c isa MethodDeclaration && c.type == :constructor
			// compile the cname
			if (typeof cname != 'string') { cname = cname.c() };
			
			var cpath = typeof this.name() == 'string' ? (this.name()) : (this.name().c());
			
			if (!initor) {
				if (sup) {
					initor = ("" + mark + "function " + cname + "()\{ return " + (sup.c()) + ".apply(this,arguments) \};\n\n");
				} else {
					initor = ("" + mark + "function " + cname + "()") + '{ };\n\n';
				};
			} else {
				initor.setName(cname);
				initor = initor.c() + ';';
			};
			
			// if we are defining a class inside a namespace etc -- how should we set up the class?
			
			if (namespaced) {
				// should use Nodes to build this instead
				initor = ("" + cpath + " = " + initor); // OP('=',name,initor)
			};
			
			head.push(initor); // // @class {cname}\n
			
			if (bodyindex >= 0) {
				// add the space after initor?
				if (this.body().index(bodyindex) instanceof Terminator) {
					head.push(this.body().removeAt(bodyindex));
				};
			} else {
				// head.push(Terminator.new('\n\n'))
				true;
			};
			
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
			
			if (this.option('return')) {
				this.body().push(("return " + cpath + ";"));
			};
			
			for (var i = 0, ary = iter$(head.reverse()), len = ary.length; i < len; i++) {
				this.body().unshift(ary[i]);
			};
			this.body()._indentation = null;
			var end = this.body().index(this.body().count() - 1);
			if ((end instanceof Terminator) && end.c().length == 1) { this.body().pop() };
			
			var out = this.body().c();
			
			return out;
		};
		
		
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
		TagDeclaration.prototype.name = function(v){ return this._name; }
		TagDeclaration.prototype.setName = function(v){ this._name = v; return this; };
		TagDeclaration.prototype.superclass = function(v){ return this._superclass; }
		TagDeclaration.prototype.setSuperclass = function(v){ this._superclass = v; return this; };
		TagDeclaration.prototype.initor = function(v){ return this._initor; }
		TagDeclaration.prototype.setInitor = function(v){ this._initor = v; return this; };
		
		TagDeclaration.prototype.namepath = function (){
			return ("<" + this.name() + ">");
		};
		
		TagDeclaration.prototype.toJSON = function (){
			return {
				type: 'tag',
				namepath: this.namepath(),
				inherits: this.superclass() ? (("<" + (this.superclass().name()) + ">")) : (null),
				loc: this.loc(),
				desc: this._desc
			};
		};
		
		TagDeclaration.prototype.visit = function (){
			if (String(this.name()).match(/^[A-Z]/)) {
				this.set({isClass: true});
			};
			
			ROOT.entities().register(this); // what if this is not local?
			
			for (var i = 0, ary = iter$(STACK.scopes()), len = ary.length, scope; i < len; i++) {
				scope = ary[i];
				if (i > 0 && (scope instanceof TagScope)) {
					// register inside here?
					scope.node().option('hasLocalTags',true);
					this.option('parent',scope.node());
					break;
					// console.log "tag is local!!!"
				};
			};
			// replace with some advanced lookup?
			this.scope().visit();
			return this.body().traverse();
		};
		
		TagDeclaration.prototype.id = function (){
			return this.name().id();
		};
		
		TagDeclaration.prototype.tagspace = function (){
			var ctx = this.scope().closure().tagContextPath();
			return this.name().ns() ? (("" + ctx + ".ns(" + helpers.singlequote(this.name().ns()) + ")")) : (ctx);
		};
		
		TagDeclaration.prototype.js = function (o){
			this.scope().context().setValue(this._ctx = this.scope().declare('tag',null,{system: true}));
			
			var ns = this.name().ns();
			var mark = mark__(this.option('keyword'));
			
			var params = [helpers.singlequote(this.name().name())];
			var cbody = this.body().c();
			// var outbody = body.count ? ", function({@ctx.c})\{{cbody}\}" : ''
			
			if (this.superclass()) {
				// WARN what if the superclass has a namespace?
				params.push(helpers.singlequote(this.superclass().name()));
			};
			
			if (this.body().count()) {
				if (this.option('hasLocalTags')) {
					params.push(("function(" + (this._ctx.c()) + "," + (this.scope().closure().tagContextPath()) + ")\{" + cbody + "\}"));
				} else {
					params.push(("function(" + (this._ctx.c()) + ")\{" + cbody + "\}"));
				};
			};
			
			var meth = this.option('extension') ? ('extendTag') : ('defineTag');
			// return "{mark}{tagspace}.extendTag('{name.name}'{outbody})"
			
			// var sup = superclass and "," + helpers.singlequote(superclass.func) or ""
			
			// var out = if name.id
			//	"{mark}{tagspace}.defineSingleton('{name.name}'{sup}{outbody})"
			// else
			
			return ("" + mark + this.tagspace() + "." + meth + "(" + params.join(', ') + ")");
			
			// return out
		};
		
		function Func(params,body,name,target,o){
			this._options = o;
			var typ = this.scopetype();
			this._traversed = false;
			this._body = blk__(body);
			this._scope || (this._scope = (o && o.scope) || new typ(this));
			this._scope.setParams(this._params = new ParamList(params));
			this._name = name || '';
			this._target = target;
			this._type = 'function';
			this._variable = null;
			this;
		};
		
		subclass$(Func,Code);
		exports.Func = Func; // export class 
		Func.prototype.name = function(v){ return this._name; }
		Func.prototype.setName = function(v){ this._name = v; return this; };
		Func.prototype.params = function(v){ return this._params; }
		Func.prototype.setParams = function(v){ this._params = v; return this; };
		Func.prototype.target = function(v){ return this._target; }
		Func.prototype.setTarget = function(v){ this._target = v; return this; };
		Func.prototype.options = function(v){ return this._options; }
		Func.prototype.setOptions = function(v){ this._options = v; return this; };
		Func.prototype.type = function(v){ return this._type; }
		Func.prototype.setType = function(v){ this._type = v; return this; };
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
			var ind = this.body()._indentation;
			// var s = ind and ind.@open
			if (ind && ind.isGenerated()) { this.body()._indentation = null };
			var code = this.scope().c({indent: (!ind || !ind.isGenerated()),braces: true});
			
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
		
		Func.prototype.shouldParenthesize = function (par){
			if(par === undefined) par = this.up();
			return (par instanceof Call) && par.callee() == this;
			// if up as a call? Only if we are 
		};
		
		function Lambda(){ return Func.apply(this,arguments) };
		
		subclass$(Lambda,Func);
		exports.Lambda = Lambda; // export class 
		Lambda.prototype.scopetype = function (){
			var k = this.option('keyword');
			return (k && k._value == 'ƒ') ? ((MethodScope)) : ((LambdaScope));
		};
		
		function TagFragmentFunc(){ return Func.apply(this,arguments) };
		
		subclass$(TagFragmentFunc,Func);
		exports.TagFragmentFunc = TagFragmentFunc; // export class 
		
		
		// MethodDeclaration
		// Create a shared body?
		
		function MethodDeclaration(){ return Func.apply(this,arguments) };
		
		subclass$(MethodDeclaration,Func);
		exports.MethodDeclaration = MethodDeclaration; // export class 
		MethodDeclaration.prototype.variable = function(v){ return this._variable; }
		MethodDeclaration.prototype.setVariable = function(v){ this._variable = v; return this; };
		
		MethodDeclaration.prototype.scopetype = function (){
			return MethodScope;
		};
		
		MethodDeclaration.prototype.consume = function (node){
			if (node instanceof Return) {
				this.option('return',true);
				return this;
			};
			return MethodDeclaration.__super__.consume.apply(this,arguments);
		};
		
		MethodDeclaration.prototype.metadata = function (){
			return {
				type: "method",
				name: "" + this.name(),
				namepath: this.namepath(),
				params: this._params.metadata(),
				desc: this._desc,
				scopenr: this.scope()._nr,
				loc: this.loc()
			};
		};
		
		MethodDeclaration.prototype.loc = function (){
			var d;
			if (d = this.option('def')) {
				return [d._loc,this.body().loc()[1]];
			} else {
				return [0,0];
			};
		};
		
		
		MethodDeclaration.prototype.toJSON = function (){
			return this.metadata();
		};
		
		MethodDeclaration.prototype.namepath = function (){
			if (this._namepath) { return this._namepath };
			
			var name = String(this.name());
			var sep = (this.option('static') ? ('.') : ('#'));
			if (this.target()) {
				return this._namepath = this._target.namepath() + sep + name;
			} else {
				return this._namepath = '&' + name;
			};
		};
		
		MethodDeclaration.prototype.visit = function (){
			// @desc = stack.stash.pluck(Comment)
			// @desc = stack.stash.pluck(Comment)
			// prebreak # make sure this has a break?
			var variable;
			this.scope().visit();
			
			if (String(this.name()).match(/\=$/)) {
				this.set({chainable: true});
			};
			
			if (this.option('greedy')) {
				this.warn("deprecated");
				// set(greedy: true)
				var tree = new TagTree();
				this._body = this.body().consume(tree);
				// body.nodes = [Arr.new(body.nodes)]
			};
			
			this._context = this.scope().parent().closure();
			this._params.traverse();
			
			if (String(this.name()) == 'initialize') {
				if ((this.context() instanceof ClassScope) && !(this.context() instanceof TagScope)) {
					this.setType('constructor');
				};
			};
			
			if (this.target() instanceof Self) {
				this._target = this._context.context();
				this.set({static: true});
			};
			
			if (this.context() instanceof ClassScope) {
				this.context().annotate(this);
				this._target || (this._target = this.context().context());
				// register as class-method?
				// should register for this
				// console.log "context is classscope {@name}"
			};
			
			if (!this._target) {
				// should not be registered on the outermost closure?
				this._variable = this.context().register(this.name(),this,{type: 'meth'});
			};
			
			if (this.target() instanceof Identifier) {
				if (variable = this.scope().lookup(this.target().toString())) {
					this.setTarget(variable);
				};
			};
			
			ROOT.entities().add(this.namepath(),this);
			this._body.traverse(); // so soon?
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
				if (this.option('chainable')) {
					this.body().add(new ImplicitReturn(this.scope().context()));
				} else if (this.option('greedy')) {
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
			var mark = mark__(this.option('def'));
			// if ctx 
			
			var fname = sym__(this.name());
			// console.log "symbolize {self.name} -- {fname}"
			var fdecl = fname; // decl ? fname : ''
			
			if ((ctx instanceof ClassScope) && !target) {
				if (this.type() == 'constructor') {
					out = ("" + mark + "function " + fname + func);
				} else if (this.option('static')) {
					out = ("" + mark + (ctx.context().c()) + "." + fname + " = function " + func);
				} else {
					out = ("" + mark + (ctx.context().c()) + ".prototype." + fname + " = function " + func);
				};
			} else if ((ctx instanceof RootScope) && !target) {
				// register method as a root-function, but with auto-call? hmm
				// should probably set using variable directly instead, no?
				out = ("" + mark + "function " + fdecl + func);
			} else if (target && this.option('static')) {
				out = ("" + mark + (target.c()) + "." + fname + " = function " + func);
			} else if (target) {
				out = ("" + mark + (target.c()) + ".prototype." + fname + " = function " + func);
			} else {
				out = ("" + mark + "function " + fdecl + func);
			};
			
			if (this.option('global')) {
				out = ("" + fname + " = " + out);
			};
			
			if (this.option('export')) {
				out = ("" + out + "; exports." + fname + " = " + fname + ";");
				if (this.option('return')) { out = ("" + out + "; return " + fname + ";") };
			} else if (this.option('return')) {
				out = ("return " + out);
			};
			
			return out;
		};
		
		
		function TagFragmentDeclaration(){ return MethodDeclaration.apply(this,arguments) };
		
		subclass$(TagFragmentDeclaration,MethodDeclaration);
		exports.TagFragmentDeclaration = TagFragmentDeclaration; // export class 
		
		
		
		function PropertyDeclaration(name,options,token){
			this._token = token;
			this._traversed = false;
			this._name = name;
			this._options = options || new Obj(new AssignList());
		};
		
		subclass$(PropertyDeclaration,Node);
		exports.PropertyDeclaration = PropertyDeclaration; // export class 
		var propTemplate = '${headers}\n${path}.${getter} = function(v){ return ${get}; }\n${path}.${setter} = function(v){ ${set}; return this; }\n${init}';
		
		var propWatchTemplate = '${headers}\n${path}.${getter} = function(v){ return ${get}; }\n${path}.${setter} = function(v){\n	var a = this.${getter}();\n	if(v != a) { ${set}; }\n	if(v != a) { ${ondirty} }\n	return this;\n}\n${init}';
		
		PropertyDeclaration.prototype.name = function(v){ return this._name; }
		PropertyDeclaration.prototype.setName = function(v){ this._name = v; return this; };
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
			var key = this.name().js();
			var scope = STACK.scope();
			
			var addDesc = o.keys().length;
			
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
			
			
			if (pars.inline) {
				if ((pars.inline instanceof Bool) && !pars.inline.truthy()) {
					o.remove('inline');
					return ("Imba." + (this._token) + "(" + (js.scope) + ",'" + (this.name().value()) + "'," + (o.c()) + ")").replace(',{})',')');
				};
			};
			
			var tpl = propTemplate;
			
			o.add('name',new Symbol(key));
			
			if (pars.watch) {
				if (!((pars.watch instanceof Bool) && !pars.watch.truthy())) { tpl = propWatchTemplate };
				var wfn = ("" + key + "DidSet");
				
				if (pars.watch instanceof Symbol) {
					wfn = pars.watch;
				} else if (pars.watch instanceof Str) {
					wfn = pars.watch;
				} else if (pars.watch instanceof Bool) {
					o.key('watch').setValue(new Symbol(("" + key + "DidSet")));
				} else {
					wfn = null;
				};
				
				if (wfn) {
					var fn = OP('.',new This(),wfn);
					js.ondirty = OP('&&',fn,CALL(fn,['v','a',("this.__" + key)])).c();
				} else {
					js.ondirty = ("Imba.propDidSet(this,this.__" + key + ",v,a)");
				};
			};
			
			
			if (pars.observe) {
				if (pars.observe instanceof Bool) {
					o.key('observe').setValue(new Symbol(("" + key + "DidEmit")));
				};
				
				tpl = propWatchTemplate;
				js.ondirty = ("Imba.observeProperty(this,'" + key + "'," + (o.key('observe').value().c()) + ",v,a);") + (js.ondirty || '');
				// OP('&&',fn,CALL(fn,['v','a',"this.__{key}"])).c
			};
			
			if (!isAttr && o.key('dom')) {
				js.set = ("if (v != this.dom()." + (this.name().value()) + ") \{ this.dom()." + (this.name().value()) + " = v \}");
				js.get = ("this.dom()." + (this.name().value()));
			};
			
			if (isAttr) { // (@token and String(@token) == 'attr') or o.key(:dom) or o.key(:attr)
				var attrKey = o.key('dom') instanceof Str ? (o.key('dom')) : (this.name().value());
				// need to make sure o has a key for attr then - so that the delegate can know?
				js.set = ("this.setAttribute('" + attrKey + "',v)");
				js.get = ("this.getAttribute('" + attrKey + "')");
			} else if (o.key('delegate')) {
				// if we have a delegate
				js.set = ("v = this.__" + key + ".delegate.set(this,'" + key + "',v,this.__" + key + ")");
				js.get = ("this.__" + key + ".delegate.get(this,'" + key + "',this.__" + key + ")");
			};
			
			
			
			if (pars.default) {
				if (o.key('dom')) {
					// FIXME go through class-method setAttribute instead
					js.init = ("" + (js.scope) + ".dom().setAttribute('" + key + "'," + (pars.default.c()) + ");");
				} else {
					// if this is not a primitive - it MUST be included in the
					// getter / setter instead
					// FIXME throw warning if the default is not a primitive object
					js.init = ("" + (js.scope) + ".prototype._" + key + " = " + (pars.default.c()) + ";");
				};
			};
			
			if (o.key('chainable')) {
				js.get = ("v !== undefined ? (this." + (js.setter) + "(v),this) : " + (js.get));
			};
			
			
			js.options = o.c();
			
			if (addDesc) {
				js.headers = ("" + (js.path) + ".__" + (js.getter) + " = " + (js.options) + ";");
			};
			
			var reg = /\$\{(\w+)\}/gm;
			// var tpl = o.key(:watch) ? propWatchTemplate : propTemplate
			var out = tpl.replace(reg,function(m,a) { return js[a]; });
			// run another time for nesting. hacky
			out = out.replace(reg,function(m,a) { return js[a]; });
			// out = out.replace(/\n\s*$/,'')
			out = out.replace(/^\s+|\s+$/g,'');
			
			// if o.key(:v)
			return out;
		};
		
		
		
		// Literals should probably not inherit from the same parent
		// as arrays, tuples, objects would be better off inheriting
		// from listnode.
		
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
		
		
		function Bool(v){
			this._value = v;
			this._raw = String(v) == "true" ? (true) : (false);
		};
		
		subclass$(Bool,Literal);
		exports.Bool = Bool; // export class 
		Bool.prototype.cache = function (){
			return this;
		};
		
		Bool.prototype.isPrimitive = function (){
			return true;
		};
		
		Bool.prototype.truthy = function (){
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
		
		Bool.prototype.toJSON = function (){
			return {type: 'Bool',value: this._value};
		};
		
		function Undefined(){ return Literal.apply(this,arguments) };
		
		subclass$(Undefined,Literal);
		exports.Undefined = Undefined; // export class 
		Undefined.prototype.isPrimitive = function (){
			return true;
		};
		
		Undefined.prototype.c = function (){
			return mark__(this._value) + "undefined";
		};
		
		function Nil(){ return Literal.apply(this,arguments) };
		
		subclass$(Nil,Literal);
		exports.Nil = Nil; // export class 
		Nil.prototype.isPrimitive = function (){
			return true;
		};
		
		Nil.prototype.c = function (){
			return mark__(this._value) + "null";
		};
		
		function True(){ return Bool.apply(this,arguments) };
		
		subclass$(True,Bool);
		exports.True = True; // export class 
		True.prototype.raw = function (){
			return true;
		};
		
		True.prototype.c = function (){
			return mark__(this._value) + "true";
		};
		
		function False(){ return Bool.apply(this,arguments) };
		
		subclass$(False,Bool);
		exports.False = False; // export class 
		False.prototype.raw = function (){
			return false;
		};
		
		False.prototype.c = function (){
			return mark__(this._value) + "false";
		};
		
		function Num(v){
			this._traversed = false;
			this._value = v;
		};
		
		subclass$(Num,Literal);
		exports.Num = Num; // export class 
		Num.prototype.toString = function (){
			return String(this._value);
		};
		
		Num.prototype.isPrimitive = function (deep){
			return true;
		};
		
		Num.prototype.shouldParenthesize = function (par){
			if(par === undefined) par = this.up();
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
			return paren ? (("(" + mark__(this._value)) + js + ")") : ((mark__(this._value) + js));
			// @cache ? super(o) : String(@value)
		};
		
		Num.prototype.cache = function (o){
			if (!(o && (o.cache || o.pool))) { return this };
			return Num.__super__.cache.call(this,o);
		};
		
		Num.prototype.raw = function (){
			// really?
			return JSON.parse(String(this.value()));
		};
		
		Num.prototype.toJSON = function (){
			return {type: this.typeName(),value: this.raw()};
		};
		
		// should be quoted no?
		// what about strings in object-literals?
		// we want to be able to see if the values are allowed
		function Str(v){
			this._traversed = false;
			this._expression = true;
			this._cache = null;
			this._value = v;
			// should grab the actual value immediately?
		};
		
		subclass$(Str,Literal);
		exports.Str = Str; // export class 
		Str.prototype.isString = function (){
			return true;
		};
		
		Str.prototype.isPrimitive = function (deep){
			return true;
		};
		
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
		
		
		function Interpolation(){ return ValueNode.apply(this,arguments) };
		
		subclass$(Interpolation,ValueNode);
		exports.Interpolation = Interpolation; // export class 
		
		
		// Currently not used - it would be better to use this
		// for real interpolated strings though, than to break
		// them up into their parts before parsing
		function InterpolatedString(nodes,o){
			if(o === undefined) o = {};
			this._nodes = nodes;
			this._options = o;
			this;
		};
		
		subclass$(InterpolatedString,Node);
		exports.InterpolatedString = InterpolatedString; // export class 
		InterpolatedString.prototype.add = function (part){
			if (part) { this._nodes.push(part) };
			return this;
		};
		
		InterpolatedString.prototype.visit = function (){
			for (var i = 0, ary = iter$(this._nodes), len = ary.length; i < len; i++) {
				ary[i].traverse();
			};
			return this;
		};
		
		InterpolatedString.prototype.escapeString = function (str){
			// var idx = 0
			// var len = str:length
			// var chr
			// while chr = str[idx++]
			return str = str.replace(/\n/g,'\\\n');
		};
		
		InterpolatedString.prototype.js = function (o){
			// creating the string
			var self = this;
			var parts = [];
			var str = '(';
			
			self._nodes.map(function(part,i) {
				if ((part instanceof Token) && part._type == 'NEOSTRING') {
					// esca
					return parts.push('"' + self.escapeString(part._value) + '"');
				} else if (part) {
					if (i == 0) {
						// force first part to be string
						parts.push('""');
					};
					part._parens = true;
					return parts.push(part.c({expression: true}));
				};
			});
			
			str += parts.join(" + ");
			str += ')';
			return str;
		};
		
		
		function Tuple(){ return ListNode.apply(this,arguments) };
		
		subclass$(Tuple,ListNode);
		exports.Tuple = Tuple; // export class 
		Tuple.prototype.c = function (){
			// compiles as an array
			return new Arr(this.nodes()).c();
		};
		
		Tuple.prototype.hasSplat = function (){
			return this.filter(function(v) { return v instanceof Splat; })[0];
		};
		
		Tuple.prototype.consume = function (node){
			if (this.count() == 1) {
				return this.first().consume(node);
			} else {
				throw "multituple cannot consume";
			};
		};
		
		
		// Because we've dropped the Str-wrapper it is kinda difficult
		function Symbol(){ return Literal.apply(this,arguments) };
		
		subclass$(Symbol,Literal);
		exports.Symbol = Symbol; // export class 
		Symbol.prototype.isValidIdentifier = function (){
			return this.raw().match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/) ? (true) : (false);
		};
		
		Symbol.prototype.isPrimitive = function (deep){
			return true;
		};
		
		Symbol.prototype.raw = function (){
			return this._raw || (this._raw = sym__(this.value()));
		};
		
		Symbol.prototype.js = function (o){
			return ("'" + sym__(this.value()) + "'");
		};
		
		function RegExp(){ return Literal.apply(this,arguments) };
		
		subclass$(RegExp,Literal);
		exports.RegExp = RegExp; // export class 
		RegExp.prototype.isPrimitive = function (){
			return true;
		};
		
		// def toString
		// 	"" + value
		;
		
		// Should inherit from ListNode - would simplify
		function Arr(){ return Literal.apply(this,arguments) };
		
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
			return this.value().some(function(v) { return v instanceof Splat; });
		};
		
		Arr.prototype.visit = function (){
			if (this._value && this._value.traverse) { this._value.traverse() };
			return this;
		};
		
		Arr.prototype.isPrimitive = function (deep){
			return !this.value().some(function(v) { return !v.isPrimitive(true); });
		};
		
		Arr.prototype.js = function (o){
			
			var val = this._value;
			if (!val) { return "[]" };
			
			var splat = this.splat();
			var nodes = val instanceof Array ? (val) : (val.nodes());
			
			// for v in @value
			// 	break splat = yes if v isa Splat
			// var splat = value.some(|v| v isa Splat)
			
			if (splat) {
				// "SPLATTED ARRAY!"
				// if we know for certain that the splats are arrays we can drop the slice?
				var slices = [];
				var group = null;
				
				for (var i = 0, ary = iter$(nodes), len = ary.length, v; i < len; i++) {
					v = ary[i];
					if (v instanceof Splat) {
						slices.push(v);
						group = null;
					} else {
						if (!group) { slices.push(group = new Arr([])) };
						group.push(v);
					};
				};
				
				return ("[].concat(" + cary__(slices).join(", ") + ")");
			} else {
				// very temporary. need a more generic way to prettify code
				// should depend on the length of the inner items etc
				// if @indented or option(:indent) or value.@indented
				//	"[\n{value.c.join(",\n").indent}\n]"
				var out = val instanceof Array ? (cary__(val)) : (val.c());
				return ("[" + out + "]");
			};
		};
		
		Arr.prototype.hasSideEffects = function (){
			return this.value().some(function(v) { return v.hasSideEffects(); });
		};
		
		Arr.prototype.toString = function (){
			return "Arr";
		};
		
		Arr.prototype.indented = function (a,b){
			this._value.indented(a,b);
			return this;
		};
		
		Arr.wrap = function (val){
			return new Arr(val);
		};
		
		// should not be cklassified as a literal?
		function Obj(){ return Literal.apply(this,arguments) };
		
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
			var dyn = this.value().filter(function(v) { return (v instanceof ObjAttr) && ((v.key() instanceof Op) || (v.key() instanceof InterpolatedString)); });
			
			if (dyn.length > 0) {
				var idx = this.value().indexOf(dyn[0]);
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
		
		Obj.prototype.remove = function (key){
			for (var i = 0, ary = iter$(this.value()), len = ary.length, k; i < len; i++) {
				k = ary[i];
				if (k.key().symbol() == key) { this.value().remove(k) };
			};
			return this;
		};
		
		Obj.prototype.keys = function (){
			return Object.keys(this.hash());
		};
		
		Obj.prototype.hash = function (){
			var hash = {};
			for (var i = 0, ary = iter$(this.value()), len = ary.length, k; i < len; i++) {
				k = ary[i];
				if (k instanceof ObjAttr) { hash[k.key().symbol()] = k.value() };
			};
			return hash;
			// return k if k.key.symbol == key
		};
		
		// add method for finding properties etc?
		Obj.prototype.key = function (key){
			for (var i = 0, ary = iter$(this.value()), len = ary.length, k; i < len; i++) {
				k = ary[i];
				if ((k instanceof ObjAttr) && k.key().symbol() == key) { return k };
			};
			return null;
		};
		
		Obj.prototype.indented = function (a,b){
			this._value.indented(a,b);
			return this;
		};
		
		Obj.prototype.hasSideEffects = function (){
			return this.value().some(function(v) { return v.hasSideEffects(); });
		};
		
		// for converting a real object into an ast-representation
		Obj.wrap = function (obj){
			var attrs = [];
			for (var v, i = 0, keys = Object.keys(obj), l = keys.length; i < l; i++){
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
		
		function ObjAttr(key,value){
			this._traversed = false;
			this._key = key;
			this._value = value;
			this._dynamic = (key instanceof Op);
			this;
		};
		
		subclass$(ObjAttr,Node);
		exports.ObjAttr = ObjAttr; // export class 
		ObjAttr.prototype.key = function(v){ return this._key; }
		ObjAttr.prototype.setKey = function(v){ this._key = v; return this; };
		ObjAttr.prototype.value = function(v){ return this._value; }
		ObjAttr.prototype.setValue = function(v){ this._value = v; return this; };
		ObjAttr.prototype.options = function(v){ return this._options; }
		ObjAttr.prototype.setOptions = function(v){ this._options = v; return this; };
		
		ObjAttr.prototype.visit = function (){
			// should probably traverse key as well, unless it is a dead simple identifier
			this.key().traverse();
			return this.value().traverse();
		};
		
		ObjAttr.prototype.js = function (o){
			var k = this.key().isReserved() ? (("'" + (this.key().c()) + "'")) : (this.key().c());
			return ("" + k + ": " + (this.value().c()));
		};
		
		ObjAttr.prototype.hasSideEffects = function (){
			return true;
		};
		
		
		
		function ArgsReference(){ return Node.apply(this,arguments) };
		
		subclass$(ArgsReference,Node);
		exports.ArgsReference = ArgsReference; // export class 
		ArgsReference.prototype.c = function (){
			return "arguments";
		};
		
		// should be a separate Context or something
		function Self(scope){
			this._scope = scope;
		};
		
		subclass$(Self,Literal);
		exports.Self = Self; // export class 
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
		
		function ImplicitSelf(){ return Self.apply(this,arguments) };
		
		subclass$(ImplicitSelf,Self);
		exports.ImplicitSelf = ImplicitSelf; // export class 
		
		
		function This(){ return Self.apply(this,arguments) };
		
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
		
		function Op(o,l,r){
			// set expression yes, no?
			this._expression = false;
			this._traversed = false;
			this._parens = false;
			this._cache = null;
			this._invert = false;
			this._opToken = o;
			this._op = o && o._value || o;
			this._left = l;
			this._right = r;
			return this;
		};
		
		subclass$(Op,Node);
		exports.Op = Op; // export class 
		Op.prototype.op = function(v){ return this._op; }
		Op.prototype.setOp = function(v){ this._op = v; return this; };
		Op.prototype.left = function(v){ return this._left; }
		Op.prototype.setLeft = function(v){ this._left = v; return this; };
		Op.prototype.right = function(v){ return this._right; }
		Op.prototype.setRight = function(v){ this._right = v; return this; };
		
		Op.prototype.visit = function (){
			if (this._right) { this._right.traverse() };
			if (this._left) { this._left.traverse() };
			return this;
		};
		
		Op.prototype.isExpressable = function (){
			// what if right is a string?!?
			return !(this.right()) || this.right().isExpressable();
		};
		
		Op.prototype.js = function (o){
			var out = null;
			var op = this._op;
			
			var l = this._left;
			var r = this._right;
			
			if (l instanceof Node) { l = l.c() };
			if (r instanceof Node) { r = r.c() };
			
			if (l && r) {
				out = ("" + l + " " + mark__(this._opToken) + op + " " + r);
			} else if (l) {
				out = ("" + mark__(this._opToken) + op + l);
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
			// if it is possible, convert into expression
			if (node instanceof TagTree) {
				if (this._left) { this._left.consume(node) };
				if (this._right) { this._right.consume(node) };
				// @body = @body.consume(node)
				// @alt = @alt.consume(node) if @alt
				return this;
			};
			if (this.isExpressable()) { return Op.__super__.consume.apply(this,arguments) };
			
			// TODO can rather use global caching?
			var tmpvar = this.scope__().declare('tmp',null,{system: true});
			var clone = OP(this.op(),this.left(),null);
			var ast = this.right().consume(clone);
			if (node) { ast.consume(node) };
			return ast;
		};
		
		function ComparisonOp(){ return Op.apply(this,arguments) };
		
		subclass$(ComparisonOp,Op);
		exports.ComparisonOp = ComparisonOp; // export class 
		ComparisonOp.prototype.invert = function (){
			// are there other comparison ops?
			// what about a chain?
			var op = this._op;
			var pairs = ["==","!=","===","!==",">","<=","<",">="];
			var idx = pairs.indexOf(op);
			idx += (idx % 2 ? (-1) : (1));
			this.setOp(pairs[idx]);
			this._invert = !this._invert;
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
			return ("" + l + " " + mark__(this._opToken) + op + " " + r);
		};
		
		
		function MathOp(){ return Op.apply(this,arguments) };
		
		subclass$(MathOp,Op);
		exports.MathOp = MathOp; // export class 
		MathOp.prototype.c = function (){
			if (this.op() == '∪') {
				return this.util().union(this.left(),this.right()).c();
			} else if (this.op() == '∩') {
				return this.util().intersect(this.left(),this.right()).c();
			};
		};
		
		
		function UnaryOp(){ return Op.apply(this,arguments) };
		
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
				// l.@parens = yes
				var str = l.c();
				var paren = l.shouldParenthesize(this);
				// FIXME this is a very hacky workaround. Need to handle all this
				// in the child instead, problems arise due to automatic caching
				if (!(str.match(/^\!?([\w\.]+)$/) || (l instanceof Parens) || paren || (l instanceof Access) || (l instanceof Call))) { str = '(' + str + ')' };
				// l.set(parens: yes) # sure?
				return ("" + this.op() + str);
			} else if (this.op() == '√') {
				return ("Math.sqrt(" + (l.c()) + ")");
			} else if (this.left()) {
				return ("" + (l.c()) + this.op());
			} else {
				return ("" + this.op() + (r.c()));
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
		
		function InstanceOf(){ return Op.apply(this,arguments) };
		
		subclass$(InstanceOf,Op);
		exports.InstanceOf = InstanceOf; // export class 
		InstanceOf.prototype.js = function (o){
			// fix checks for String and Number
			
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
		
		function TypeOf(){ return Op.apply(this,arguments) };
		
		subclass$(TypeOf,Op);
		exports.TypeOf = TypeOf; // export class 
		TypeOf.prototype.js = function (o){
			return ("typeof " + (this.left().c()));
		};
		
		function Delete(){ return Op.apply(this,arguments) };
		
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
		
		function In(){ return Op.apply(this,arguments) };
		
		subclass$(In,Op);
		exports.In = In; // export class 
		In.prototype.invert = function (){
			this._invert = !this._invert;
			return this;
		};
		
		In.prototype.js = function (o){
			var cond = this._invert ? ("== -1") : (">= 0");
			var idx = Util.indexOf(this.left(),this.right());
			return ("" + (idx.c()) + " " + cond);
		};
		
		
		
		
		
		
		
		// ACCESS
		
		module.exports.K_IVAR = K_IVAR = 1;
		module.exports.K_SYM = K_SYM = 2;
		module.exports.K_STR = K_STR = 3;
		module.exports.K_PROP = K_PROP = 4;
		
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
			var mark = '';
			
			// if safechain
			//	p "Access is safechained {rgt.c}"
			
			
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
				mark = mark__(rgt._value);
				raw = rgt.c();
			};
			
			if (this.safechain() && ctx) {
				ctx.cache({force: true});
				pre = ctx.c() + " && ";
			};
			
			// really?
			// var ctx = (left || scope__.context)
			var out = raw ? (
				// see if it needs quoting
				// need to check to see if it is legal
				ctx ? (("" + (ctx.c()) + "." + mark + raw)) : (raw)
			) : (
				r = rgt instanceof Node ? (rgt.c({expression: true})) : (rgt),
				("" + (ctx.c()) + "[" + r + "]")
			);
			
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
			return ((this.right() instanceof Ivar) && !(this.left())) ? (this) : (Access.__super__.cache.call(this,o));
		};
		
		
		
		// Should change this to just refer directly to the variable? Or VarReference
		function LocalVarAccess(){ return Access.apply(this,arguments) };
		
		subclass$(LocalVarAccess,Access);
		exports.LocalVarAccess = LocalVarAccess; // export class 
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
			return this.variable()._alias || LocalVarAccess.__super__.alias.call(this);
		};
		
		
		function GlobalVarAccess(){ return ValueNode.apply(this,arguments) };
		
		subclass$(GlobalVarAccess,ValueNode);
		exports.GlobalVarAccess = GlobalVarAccess; // export class 
		GlobalVarAccess.prototype.js = function (o){
			return this.value().c();
		};
		
		
		function ObjectAccess(){ return Access.apply(this,arguments) };
		
		subclass$(ObjectAccess,Access);
		exports.ObjectAccess = ObjectAccess; // export class 
		
		
		
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
			
			var rec;
			if (rec = this.receiver()) {
				var ast = CALL(OP('.',this.left(),this.right()),[]); // convert to ArgList or null
				ast.setReceiver(rec);
				return ast.c();
			};
			
			var up = this.up();
			
			if (!((up instanceof Call))) {
				ast = CALL(new Access(this.op(),this.left(),this.right()),[]);
				return ast.c();
			};
			
			// really need to fix this - for sure
			// should be possible for the function to remove this this instead?
			var js = ("" + PropertyAccess.__super__.js.call(this,o));
			
			if (!((up instanceof Call) || (up instanceof Util.IsFunction))) {
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
		
		
		function IvarAccess(){ return Access.apply(this,arguments) };
		
		subclass$(IvarAccess,Access);
		exports.IvarAccess = IvarAccess; // export class 
		IvarAccess.prototype.cache = function (){
			// WARN hmm, this is not right... when accessing on another object it will need to be cached
			return this;
		};
		
		
		function ConstAccess(){ return Access.apply(this,arguments) };
		
		subclass$(ConstAccess,Access);
		exports.ConstAccess = ConstAccess; // export class 
		
		
		
		function IndexAccess(){ return Access.apply(this,arguments) };
		
		subclass$(IndexAccess,Access);
		exports.IndexAccess = IndexAccess; // export class 
		IndexAccess.prototype.cache = function (o){
			if(o === undefined) o = {};
			if (o.force) { return IndexAccess.__super__.cache.apply(this,arguments) };
			this.right().cache();
			return this;
		};
		
		
		function SuperAccess(){ return Access.apply(this,arguments) };
		
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
		
		// Shortcircuit traverse so that it is not added to the stack?!
		subclass$(VarOrAccess,ValueNode);
		exports.VarOrAccess = VarOrAccess; // export class 
		VarOrAccess.prototype.visit = function (){
			// @identifier = value # this is not a real identifier?
			// console.log "VarOrAccess {@identifier}"
			
			
			var scope = this.scope__();
			
			var variable = scope.lookup(this.value());
			
			// does not really need to have a declarator already? -- tricky
			if (variable && variable.declarator()) {
				// var decl = variable.declarator
				
				// if the variable is not initialized just yet and we are
				// in the same scope - we should not treat this as a var-lookup
				// ie.  var x = x would resolve to var x = this.x() if x
				// was not previously defined
				
				// should do this even if we are not in the same scope?
				// we only need to be in the same closure(!)
				
				if (variable._initialized || (scope.closure() != variable.scope().closure())) {
					this._variable = variable;
					variable.addReference(this);
					this._value = variable; // variable.accessor(self)
					this._token._variable = variable;
					return this;
				};
				// FIX
				// @value.safechain = safechain
			};
			
			// TODO deprecate and remove
			if (this.value().symbol().indexOf('$') >= 0) {
				// big hack - should disable
				// major hack here, no?
				// console.log "GlobalVarAccess"
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
			return mark__(this._token) + (this._variable ? (VarOrAccess.__super__.c.call(this)) : (this.value().c()));
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
		
		VarOrAccess.prototype.region = function (){
			return this._identifier.region();
		};
		
		VarOrAccess.prototype.toString = function (){
			return ("VarOrAccess(" + this.value() + ")");
		};
		
		VarOrAccess.prototype.toJSON = function (){
			return {type: this.typeName(),value: this._identifier.toString()};
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
		
		function VarReference(value,type){
			if (value instanceof VarOrAccess) {
				value = value.value();
			};
			// for now - this can happen
			VarReference.__super__.constructor.call(this,value);
			this._export = false;
			this._type = type && String(type);
			this._variable = null;
			this._declared = true; // just testing now
		};
		
		
		subclass$(VarReference,ValueNode);
		exports.VarReference = VarReference; // export class 
		VarReference.prototype.variable = function(v){ return this._variable; }
		VarReference.prototype.setVariable = function(v){ this._variable = v; return this; };
		VarReference.prototype.declared = function(v){ return this._declared; }
		VarReference.prototype.setDeclared = function(v){ this._declared = v; return this; };
		VarReference.prototype.type = function(v){ return this._type; }
		VarReference.prototype.setType = function(v){ this._type = v; return this; };
		
		VarReference.prototype.loc = function (){
			return this._value.region();
		};
		
		VarReference.prototype.set = function (o){
			// hack - workaround for hidden classes perf
			if (o.export) { this._export = true };
			return this;
		};
		
		VarReference.prototype.js = function (o){
			// experimental fix
			
			// what about resolving?
			var ref = this._variable;
			var out = ("" + mark__(this._value) + (ref.c()));
			
			if (ref && !ref._declared) { // .option(:declared)
				if (o.up(VarBlock)) { // up varblock??
					ref._declared = true;
					
					// ref.set(declared: yes)
				} else if (o.isExpression() || this._export) { // why?
					ref.autodeclare();
				} else {
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
			
			// console.log "value type for VarReference {@value} {@value.@loc} {@value:constructor}"
			
			// should be possible to have a VarReference without a name as well? for a system-variable
			// name should not set this way.
			var name = this.value().c();
			
			// what about looking up? - on register we want to mark
			var v = this._variable || (this._variable = this.scope__().register(name,this,{type: this._type}));
			// FIXME -- should not simply override the declarator here(!)
			
			if (!v.declarator()) {
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
		
		function Assign(o,l,r){
			
			// workaround until we complete transition from lua-style assignments
			// to always use explicit tuples - then we can move assignments out etc
			// this will not be needed after we remove support for var a,b,c = 1,2,3
			if ((l instanceof VarReference) && (l.value() instanceof Arr)) {
				// converting all nodes to var-references ?
				// do we need to keep it in a varblock at all?
				var vars = l.value().nodes().map(function(v) {
					// what about inner tuples etc?
					// keep the splats -- clumsy but true
					var v_;
					if (v instanceof Splat) {
						if (!((v.value() instanceof VarReference))) { (v.setValue(v_ = new VarReference(v.value(),l.type())),v_) };
					} else if (v instanceof VarReference) {
						true;
					} else {
						// what about retaining location?
						// v = v.value if v isa VarOrAccess
						v = new VarReference(v,l.type());
					};
					
					return v;
					
					// v isa VarReference ? v : VarReference.new(v)
				});
				return new TupleAssign(o,new Tuple(vars),r);
			};
			
			if (l instanceof Arr) {
				return new TupleAssign(o,new Tuple(l.nodes()),r);
			};
			
			
			// set expression yes, no?
			this._expression = false;
			this._traversed = false;
			this._parens = false;
			this._cache = null;
			this._invert = false;
			this._opToken = o;
			this._op = o && o._value || o;
			this._left = l;
			this._right = r;
			return this;
		};
		
		subclass$(Assign,Op);
		exports.Assign = Assign; // export class 
		Assign.prototype.isExpressable = function (){
			return !(this.right()) || this.right().isExpressable();
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
			
			// WARNING - slightly undefined
			// MARK THE STACK
			if (l) { l.traverse() };
			
			var lvar = (l instanceof VarReference) && l.variable();
			
			// how does this work with constants that are really var references?
			// should work when things are not described as well - but this is for testing
			// but if it refers to something else 
			if (!lvar && this._desc) {
				// entities should be able to extract the needed info instead
				ROOT.entities().add(l.namepath(),{namepath: l.namepath(),type: r.typeName(),desc: this._desc});
			};
			
			// this should probably be done in a different manner
			if (lvar && lvar.declarator() == l) {
				lvar._initialized = false;
				if (r) { r.traverse() };
				lvar._initialized = true;
			} else {
				if (r) { r.traverse() };
			};
			
			if ((l instanceof VarReference) || l._variable) {
				l._variable.assigned(r,this);
			};
			
			return this;
		};
		
		Assign.prototype.c = function (o){
			if (!this.right().isExpressable()) {
				return this.right().consume(this).c(o);
			};
			// testing this
			return Assign.__super__.c.call(this,o);
		};
		
		Assign.prototype.js = function (o){
			if (!this.right().isExpressable()) {
				this.p("Assign#js right is not expressable ");
				// here this should be go out of the stack(!)
				// it should already be consumed?
				return this.right().consume(this).c();
			};
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
					// dont cache it again if it is already cached(!)
					if (!this.right().cachevar()) { this.right().cache({pool: 'val',uses: 1}) }; // 
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
			var out = ("" + (l.c()) + " " + mark__(this._opToken) + this.op() + " " + this.right().c({expression: true}));
			
			return out;
		};
		
		// FIXME op is a token? _FIX_
		// this (and similar cases) is broken when called from
		// another position in the stack, since 'up' is dynamic
		// should maybe freeze up?
		Assign.prototype.shouldParenthesize = function (par){
			if(par === undefined) par = this.up();
			return this._parens || (par instanceof Op) && par.op() != '=';
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
			var node = new typ([this]);
			return node.addExpression(expr);
		};
		
		
		function PushAssign(){ return Assign.apply(this,arguments) };
		
		subclass$(PushAssign,Assign);
		exports.PushAssign = PushAssign; // export class 
		PushAssign.prototype.js = function (o){
			return ("" + (this.left().c()) + ".push(" + (this.right().c()) + ")");
		};
		
		PushAssign.prototype.consume = function (node){
			return this;
		};
		
		
		function ConditionalAssign(){ return Assign.apply(this,arguments) };
		
		subclass$(ConditionalAssign,Assign);
		exports.ConditionalAssign = ConditionalAssign; // export class 
		ConditionalAssign.prototype.consume = function (node){
			return this.normalize().consume(node);
		};
		
		ConditionalAssign.prototype.normalize = function (){
			var l = this.left().node();
			var ls = l;
			
			if (l instanceof Access) {
				if (l.left()) {
					l.left().cache();
				};
				ls = l.clone(l.left(),l.right()); // this should still be cached?
				if (l instanceof PropertyAccess) { l.cache() }; // correct now, to a certain degree
				if (l instanceof IndexAccess) {
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
			var ast = IF(this.condition(),OP('=',this.left(),this.right()),this.left());
			ast.setScope(null); // not sure about this
			if (ast.isExpressable()) { ast.toExpression() }; // forced expression already
			return ast.c();
		};
		
		function CompoundAssign(){ return Assign.apply(this,arguments) };
		
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
				// an alternative would be to just pass
				up.replace(this,ast);
			};
			return ast.c();
		};
		
		
		function AsyncAssign(){ return Assign.apply(this,arguments) };
		
		subclass$(AsyncAssign,Assign);
		exports.AsyncAssign = AsyncAssign; // export class 
		
		
		
		function TupleAssign(a,b,c){
			this._traversed = false;
			this._op = a;
			this._left = b;
			this._right = c;
			this._temporary = [];
		};
		
		subclass$(TupleAssign,Assign);
		exports.TupleAssign = TupleAssign; // export class 
		TupleAssign.prototype.op = function(v){ return this._op; }
		TupleAssign.prototype.setOp = function(v){ this._op = v; return this; };
		TupleAssign.prototype.left = function(v){ return this._left; }
		TupleAssign.prototype.setLeft = function(v){ this._left = v; return this; };
		TupleAssign.prototype.right = function(v){ return this._right; }
		TupleAssign.prototype.setRight = function(v){ this._right = v; return this; };
		TupleAssign.prototype.type = function(v){ return this._type; }
		TupleAssign.prototype.setType = function(v){ this._type = v; return this; };
		
		TupleAssign.prototype.isExpressable = function (){
			return this.right().isExpressable();
		};
		
		TupleAssign.prototype.addExpression = function (expr){
			if (this.right() instanceof Tuple) {
				this.right().push(expr);
			} else {
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
				this._vars = this.left().nodes().filter(function(n) { return n instanceof VarReference; });
				// collect the vars for tuple for easy access
				
				// NOTE can improve.. should rather make the whole left be a VarBlock or TupleVarBlock
			};
			
			this.right().traverse();
			this.left().traverse();
			return this;
		};
		
		TupleAssign.prototype.js = function (o){
			// only for actual inner expressions, otherwise cache the whole array, no?
			var self = this;
			if (!self.right().isExpressable()) {
				
				return self.right().consume(self).c();
			};
			
			/* a,b,c = arguments */
			
			// - direct. no matter if lvalues are variables or not. Make fake arguments up to the same count as tuple
			
			/* a,*b,b = arguments */
			
			// Need to convert arguments to an array. IF arguments is not referenced anywhere else in scope, 
			// we can do the assignment directly while rolling through arguments
			
			/* a,b = b,a */
			
			// ideally we only need to cache the first value (or n - 1), assign directly when possible.
			
			/* a,b,c = (method | expression) */
			
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
			var lsplat = lft.filter(function(v) { return v instanceof Splat; })[0];
			
			// if right is an array without any splats (or inner tuples?), normalize it to tuple
			if ((rgt instanceof Arr) && !rgt.splat()) { rgt = new Tuple(rgt.nodes()) };
			var rlen = rgt instanceof Tuple ? (rgt.count()) : (null);
			
			// if any values are statements we need to handle this before continuing
			
			/* a,b,c = 10,20,ary */
			
			// ideally we only need to cache the first value (or n - 1), assign directly when possible.
			// only if the variables are not predefined or predeclared can be we certain that we can do it without caching
			// if rlen && typ == 'var' && !lsplat
			// 	# this can be dangerous in edgecases that are very hard to detect
			// 	# if it becomes an issue, fall back to simpler versions
			// 	# does not even matter if there is a splat?
			
			// special case for arguments(!)
			if (!lsplat && rgt == ARGUMENTS) {
				
				var pars = self.scope__().params();
				// forcing the arguments to be named
				lft.map(function(l,i) { return ast.push(OP('=',l.node(),pars.at(i,true).visit().variable())); }); // s.params.at(value - 1,yes)
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
							pairs.slice(i).map(function(part) {
								if (part[1].hasSideEffects()) {
									self._temporary.push(part[1]); // need a generalized way to do this type of thing
									return ast.push(part[1].cache({force: true,pool: 'swap',declared: typ == 'var'}));
								};
							});
						};
					};
					
					// if the previous value in ast is a reference to our value - the caching was not needed
					if (ast.last() == r) {
						r.decache();
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
				for (var i = 0, ary = iter$(self._vars), len_ = ary.length; i < len_; i++) {
					ary[i].variable().autodeclare();
				};
			} else if (self._vars) {
				for (var i = 0, ary = iter$(self._vars), len_ = ary.length; i < len_; i++) {
					ary[i].variable().predeclared();
				};
			};
			
			// is there any reason to make it into an expression?
			if (ast.isExpressable()) { // NO!
				// if this is an expression
				var out = ast.c({expression: true});
				if (typ && !o.isExpression()) { out = ("" + typ + " " + out) }; // not in expression
				return out;
			} else {
				out = ast.c();
				// if this is a varblock 
				return out;
			};
		};
		
		
		TupleAssign.prototype.c = function (o){
			var out = TupleAssign.__super__.c.call(this,o);
			// this is only used in tuple -- better to let the tuple hav a separate #c
			if (this._temporary && this._temporary.length) {
				this._temporary.map(function(temp) { return temp.decache(); });
			};
			return out;
		};
		
		
		
		// IDENTIFIERS
		
		// really need to clean this up
		// Drop the token?
		function Identifier(value){
			this._value = this.load(value);
			this._symbol = null;
			this._setter = null;
			
			if (("" + value).indexOf("?") >= 0) {
				this._safechain = true;
			};
			// @safechain = ("" + value).indexOf("?") >= 0
			this;
		};
		
		subclass$(Identifier,Node);
		exports.Identifier = Identifier; // export class 
		Identifier.prototype.safechain = function(v){ return this._safechain; }
		Identifier.prototype.setSafechain = function(v){ this._safechain = v; return this; };
		Identifier.prototype.value = function(v){ return this._value; }
		Identifier.prototype.setValue = function(v){ this._value = v; return this; };
		
		Identifier.prototype.references = function (variable){
			if (this._value) { this._value._variable = variable };
			return this;
		};
		
		Identifier.prototype.sourceMapMarker = function (){
			return this._value.sourceMapMarker();
		};
		
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
			return this._value.reserved || RESERVED_TEST.test(String(this._value));
		};
		
		Identifier.prototype.symbol = function (){
			// console.log "Identifier#symbol {value}"
			return this._symbol || (this._symbol = sym__(this.value()));
		};
		
		Identifier.prototype.setter = function (){
			// console.log "Identifier#setter"
			var tok;
			return this._setter || (this._setter = (true) && (
				tok = new Token('IDENTIFIER',sym__('set-' + this._value),this._value._loc || -1),
				new Identifier(tok)
				// Identifier.new("set-{symbol}")
			));
		};
		
		Identifier.prototype.toString = function (){
			return String(this._value);
		};
		
		Identifier.prototype.toJSON = function (){
			return this.toString();
		};
		
		Identifier.prototype.alias = function (){
			return sym__(this._value);
		};
		
		Identifier.prototype.js = function (o){
			return this.symbol();
		};
		
		Identifier.prototype.c = function (){
			return '' + this.symbol(); // mark__(@value) + 
		};
		
		Identifier.prototype.dump = function (){
			return {loc: this.region()};
		};
		
		Identifier.prototype.namepath = function (){
			return this.toString();
		};
		
		function TagId(v){
			this._value = v instanceof Identifier ? (v.value()) : (v);
			this;
		};
		
		subclass$(TagId,Identifier);
		exports.TagId = TagId; // export class 
		TagId.prototype.c = function (){
			return ("id$('" + (this.value().c()) + "')");
		};
		
		// This is not an identifier - it is really a string
		// Is this not a literal?
		
		// FIXME Rename to IvarLiteral? or simply Literal with type Ivar
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
			return '_' + helpers.camelCase(this._value).slice(1); // .replace(/^@/,'') # mark__(@value) + 
		};
		
		
		
		// Ambiguous - We need to be consistent about Const vs ConstAccess
		// Becomes more important when we implement typeinference and code-analysis
		function Const(){ return Identifier.apply(this,arguments) };
		
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
			return mark__(this._value) + this.symbol();
		};
		
		function TagTypeIdentifier(value){
			this._value = this.load(value);
			this;
		};
		
		subclass$(TagTypeIdentifier,Identifier);
		exports.TagTypeIdentifier = TagTypeIdentifier; // export class 
		TagTypeIdentifier.prototype.name = function(v){ return this._name; }
		TagTypeIdentifier.prototype.setName = function(v){ this._name = v; return this; };
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
			return ("Imba.TAGS." + this._str.replace(":","$"));
		};
		
		TagTypeIdentifier.prototype.c = function (){
			return this.js();
		};
		
		TagTypeIdentifier.prototype.func = function (){
			var name = this._name.replace(/-/g,'_').replace(/\#/,'');
			if (this._ns) { name += ("$" + (this._ns.toLowerCase())) };
			return name;
		};
		
		TagTypeIdentifier.prototype.isClass = function (){
			return this._name[0] == this._name[0].toUpperCase();
		};
		
		TagTypeIdentifier.prototype.spawner = function (){
			if (this._ns) {
				return ("" + (this._ns.toUpperCase()) + ".$" + this._name.replace(/-/g,'_'));
			} else {
				return ("$" + this._name.replace(/-/g,'_'));
			};
		};
		
		TagTypeIdentifier.prototype.id = function (){
			var m = this._str.match(/\#([\w\-\d\_]+)\b/);
			return m ? (m[1]) : (null);
		};
		
		
		TagTypeIdentifier.prototype.flag = function (){
			return "_" + this.name().replace(/--/g,'_').toLowerCase();
		};
		
		TagTypeIdentifier.prototype.sel = function (){
			return ("." + this.flag()); // + name.replace(/-/g,'_').toLowerCase
		};
		
		TagTypeIdentifier.prototype.string = function (){
			return this.value();
		};
		
		
		function Argvar(){ return ValueNode.apply(this,arguments) };
		
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
			return ("" + c__(par.name())); // c
		};
		
		
		// CALL
		
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
				if (str == 'extern') {
					callee.value().value()._type = 'EXTERN';
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
			this;
		};
		
		subclass$(Call,Node);
		exports.Call = Call; // export class 
		Call.prototype.callee = function(v){ return this._callee; }
		Call.prototype.setCallee = function(v){ this._callee = v; return this; };
		Call.prototype.receiver = function(v){ return this._receiver; }
		Call.prototype.setReceiver = function(v){ this._receiver = v; return this; };
		Call.prototype.args = function(v){ return this._args; }
		Call.prototype.setArgs = function(v){ this._args = v; return this; };
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
			var pos = this._args.filter(function(n,i) { return n == '&'; })[0]; // WOULD BE TOKEN - CAREFUL
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
			
			var splat = args.some(function(v) { return v instanceof Splat; });
			
			var out = null;
			var lft = null;
			var rgt = null;
			var wrap = null;
			
			var callee = this._callee = this._callee.node(); // drop the var or access?
			
			// if callee isa Call && callee.safechain
			//	yes
			
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
				this._receiver = callee.receiver();
				callee = this._callee = new Access(callee.op(),callee.left(),callee.right());
				// console.log "unwrapping the propertyAccess"
			};
			
			if (callee.safechain()) {
				// if lft isa Call
				// if lft isa Call # could be a property access as well - it is the same?
				// if it is a local var access we simply check if it is a function, then call
				// but it should be safechained outside as well?
				// lft.cache if lft
				// the outer safechain should not cache the whole call - only ask to cache
				// the result? -- chain onto
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
				var rec1 = this.receiver();
				var ary = (args.count() == 1 ? (new ValueNode(args.first().value())) : (new Arr(args.list())));
				
				rec1.cache(); // need to cache the context as it will be referenced in apply
				out = ("" + callee.c({expression: true}) + ".apply(" + (rec1.c()) + "," + ary.c({expression: true}) + ")");
			} else if (this._receiver) {
				// quick workaround
				if (!((this._receiver instanceof ScopeContext))) { this._receiver.cache() };
				args.unshift(this.receiver());
				// should rather rewrite to a new call?
				out = ("" + callee.c({expression: true}) + ".call(" + args.c({expression: true}) + ")");
			} else {
				out = ("" + callee.c({expression: true}) + "(" + args.c({expression: true}) + ")");
			};
			
			if (wrap) {
				// we set the cachevar inside
				if (this._cache) {
					this._cache.manual = true;
					out = ("(" + (this.cachevar().c()) + "=" + out + ")");
				};
				
				out = [wrap[0],out,wrap[1]].join("");
			};
			
			return out;
		};
		
		
		
		
		function ImplicitCall(){ return Call.apply(this,arguments) };
		
		subclass$(ImplicitCall,Call);
		exports.ImplicitCall = ImplicitCall; // export class 
		ImplicitCall.prototype.js = function (o){
			return ("" + (this.callee().c()) + "()");
		};
		
		function New(){ return Call.apply(this,arguments) };
		
		subclass$(New,Call);
		exports.New = New; // export class 
		New.prototype.js = function (o){
			var target = this.callee();
			
			while (target instanceof Access){
				var left = target.left();
				
				if ((left instanceof PropertyAccess) || (left instanceof VarOrAccess)) {
					this.callee()._parens = true;
					break;
				};
				
				target = left;
			};
			
			var out = ("new " + (this.callee().c()));
			if (!((o.parent() instanceof Call))) { out += '()' };
			return out;
		};
		
		function SuperCall(){ return Call.apply(this,arguments) };
		
		subclass$(SuperCall,Call);
		exports.SuperCall = SuperCall; // export class 
		SuperCall.prototype.js = function (o){
			var m = o.method();
			this.setReceiver(SELF);
			this.setCallee(("" + (m.target().c()) + ".super$.prototype." + (m.name().c())));
			return SuperCall.__super__.js.apply(this,arguments);
		};
		
		
		
		function ExternDeclaration(){ return ListNode.apply(this,arguments) };
		
		subclass$(ExternDeclaration,ListNode);
		exports.ExternDeclaration = ExternDeclaration; // export class 
		ExternDeclaration.prototype.visit = function (){
			this.setNodes(this.map(function(item) { return item.node(); })); // drop var or access really
			// only in global scope?
			var root = this.scope__();
			for (var i = 0, ary = iter$(this.nodes()), len = ary.length, item; i < len; i++) {
				item = ary[i];
				var variable = root.register(item.symbol(),item,{type: 'global'});
				variable.addReference(item);
			};
			return this;
		};
		
		ExternDeclaration.prototype.c = function (){
			return "// externs";
		};
		
		
		// FLOW
		
		function ControlFlow(){ return Node.apply(this,arguments) };
		
		subclass$(ControlFlow,Node);
		exports.ControlFlow = ControlFlow; // export class 
		
		
		
		
		function ControlFlowStatement(){ return ControlFlow.apply(this,arguments) };
		
		subclass$(ControlFlowStatement,ControlFlow);
		exports.ControlFlowStatement = ControlFlowStatement; // export class 
		ControlFlowStatement.prototype.isExpressable = function (){
			return false;
		};
		
		
		
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
		If.prototype.test = function(v){ return this._test; }
		If.prototype.setTest = function(v){ this._test = v; return this; };
		If.prototype.body = function(v){ return this._body; }
		If.prototype.setBody = function(v){ this._body = v; return this; };
		If.prototype.alt = function(v){ return this._alt; }
		If.prototype.setAlt = function(v){ this._alt = v; return this; };
		If.prototype.scope = function(v){ return this._scope; }
		If.prototype.setScope = function(v){ this._scope = v; return this; };
		
		If.ternary = function (cond,body,alt){
			// prefer to compile it this way as well
			var obj = new If(cond,new Block([body]),{type: '?'});
			obj.addElse(new Block([alt]));
			return obj;
		};
		
		If.prototype.addElse = function (add){
			if (this.alt() && (this.alt() instanceof If)) {
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
				STACK.pop(this);
				alt._scope || (alt._scope = new BlockScope(alt));
				alt.traverse();
				STACK.push(this);
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
					if (this._tagtree) {
						return ("(" + cond + ") ? " + code + " : void(0)");
					} else {
						return ("(" + cond + ") && " + code);
					};
				};
			} else {
				// if there is only a single item - and it is an expression?
				code = null;
				// if body.count == 1 # dont indent by ourselves?
				
				if ((body instanceof Block) && body.count() == 1 && !(body.first() instanceof LoopFlowStatement)) {
					body = body.first();
				};
				
				// if body.count == 1
				//	p "one item only!"
				//	body = body.first
				
				code = body.c({braces: true}); // (braces: yes)
				
				// don't wrap if it is only a single expression?
				var out = ("" + mark__(this._type) + "if (" + cond + ") ") + code; // ' {' + code + '}' # '{' + code + '}'
				if (this.alt()) { out += (" else " + this.alt().c(this.alt() instanceof If ? ({}) : (brace))) };
				return out;
			};
		};
		
		If.prototype.sourceMapMarker = function (){
			return this;
		};
		
		If.prototype.consume = function (node){
			// if it is possible, convert into expression
			if (node instanceof TagTree) {
				this._body = this._body.consume(node);
				if (this._alt) { this._alt = this._alt.consume(node) };
				this._tagtree = node;
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
			var exp = this.body().isExpressable() && (!(this.alt()) || this.alt().isExpressable());
			return exp;
		};
		
		
		
		function Loop(options){
			if(options === undefined) options = {};
			this._traversed = false;
			this._options = options;
			this._body = null;
			this;
		};
		
		
		subclass$(Loop,Statement);
		exports.Loop = Loop; // export class 
		Loop.prototype.scope = function(v){ return this._scope; }
		Loop.prototype.setScope = function(v){ this._scope = v; return this; };
		Loop.prototype.options = function(v){ return this._options; }
		Loop.prototype.setOptions = function(v){ this._options = v; return this; };
		Loop.prototype.body = function(v){ return this._body; }
		Loop.prototype.setBody = function(v){ this._body = v; return this; };
		Loop.prototype.catcher = function(v){ return this._catcher; }
		Loop.prototype.setCatcher = function(v){ this._catcher = v; return this; };
		
		
		Loop.prototype.set = function (obj){
			this._options || (this._options = {});
			var keys = Object.keys(obj);
			for (var i = 0, ary = iter$(keys), len = ary.length, k; i < len; i++) {
				k = ary[i];
				this._options[k] = obj[k];
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
			
			
			
			if (this.stack().isExpression() || this.isExpression()) {
				// what the inner one should not be an expression though?
				// this will resut in an infinite loop, no?!?
				var ast = CALL(FN([],[this]),[]);
				this.scope().context().reference();
				return ast.c(o);
			} else if ((this.stack().current() instanceof Block) || ((s.up() instanceof Block) && s.current()._consumer == this)) {
				return Loop.__super__.c.call(this,o);
			} else {
				ast = CALL(FN([],[this]),[]);
				this.scope().context().reference();
				return ast.c(o);
				// need to wrap in function
			};
		};
		
		
		
		function While(test,opts){
			this._traversed = false;
			this._test = test;
			this._options = opts || {};
			this._scope = new WhileScope(this);
			// set(opts) if opts
			if (this.option('invert')) {
				// "invert test for while {@test}"
				this._test = test.invert();
			};
			// invert the test
		};
		
		
		subclass$(While,Loop);
		exports.While = While; // export class 
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
			var out = ("while (" + this.test().c({expression: true}) + ")") + this.body().c({braces: true,indent: true}); // .wrap
			
			if (this.scope().vars().count() > 0) {
				return [this.scope().vars().c(),out];
			};
			return out;
		};
		
		
		
		// This should define an open scope
		// should rather 
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
			
			// add guard to body
			if (this.options().guard) {
				var op = IF(this.options().guard.invert(),Block.wrap([new ContinueStatement("continue")]));
				this.body().unshift(op,BR);
			};
			
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
			
			// what about a range where we also include an index?
			if (src instanceof Range) {
				
				vars.len = scope.declare('len',src.right()); // util.len(o,yes).predeclare
				// make the scope be the declarator
				// TODO would like to be able to have counter in range as well
				vars.index = scope.register(o.name,scope,{type: 'let',declared: true});
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
			
			var receiver;
			if (this.isExpressable()) {
				return For.__super__.consume.apply(this,arguments);
			};
			
			// other cases as well, no?
			if (node instanceof TagTree) {
				this.scope().context().reference();
				var ref = node.root().reference();
				node._loop = this;
				
				// Should not be consumed the same way
				this.body().consume(node);
				node._loop = null;
				var fn = new Lambda([new Param(ref)],[this]);
				fn.scope().wrap(this.scope());
				// TODO Scope of generated lambda should be added into stack for
				// variable naming / resolution
				return CALL(fn,[ref]);
			};
			
			
			if (this._resvar) {
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
					if (assignee = receiver._variable) {
						// we can only pull the var reference into the scope
						// if we know that the variable is declared in this scope
						reuseable = (receiver instanceof VarReference);
					};
				};
			};
			
			// WARN Optimization - might have untended side-effects
			// if we are assigning directly to a local variable, we simply
			// use said variable for the inner res
			if (reuseable && assignee) {
				// instead of declaring it in the scope - why not declare it outside?
				// it might already exist in the outer scope no?
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
			} else {
				// declare the variable we will use to soak up results
				// what about a pool here?
				resvar = this._resvar = this.scope().declare('res',new Arr([]),{system: true});
			};
			
			this._catcher = new PushAssign("push",resvar,null); // the value is not preset
			this.body().consume(this._catcher); // should still return the same body
			
			
			
			if (node) {
				ast = new Block([this,BR,resvar.accessor().consume(node)]);
				return ast;
			};
			// var ast = Block.new([self,BR,resvar.accessor])
			// ast.consume(node) if node
			// return ast
			return this;
			
			// this is never an expression (for now -- but still)
			// return ast
		};
		
		
		For.prototype.js = function (o){
			var v_;
			var vars = this.options().vars;
			var i = vars.index;
			var val = vars.value;
			var cond = OP('<',i,vars.len);
			var src = this.options().source;
			
			var final = this.options().step ? (
				OP('=',i,OP('+',i,this.options().step))
			) : (
				OP('++',i)
			);
			
			// if there are few references to the value - we can drop
			// the actual variable and instead make it proxy through the index
			if (src instanceof Range) {
				if (src.inclusive()) { (cond.setOp(v_ = '<='),v_) };
			} else if (val.refcount() < 3 && val.assignments().length == 0) {
				val.proxy(vars.source,i);
			} else {
				this.body().unshift(OP('=',val,OP('.',vars.source,i)),BR);
				// body.unshift(head)
				// TODO check lengths - intelligently decide whether to brace and indent
			};
			var head = ("" + mark__(this.options().keyword) + "for (" + (this.scope().vars().c()) + "; " + (cond.c()) + "; " + (final.c()) + ") ");
			return head + this.body().c({braces: true,indent: true}); // .wrap
		};
		
		
		For.prototype.head = function (){
			var vars = this.options().vars;
			return OP('=',vars.value,OP('.',vars.source,vars.index));
		};
		
		
		
		function ForIn(){ return For.apply(this,arguments) };
		
		subclass$(ForIn,For);
		exports.ForIn = ForIn; // export class 
		
		
		
		
		function ForOf(){ return For.apply(this,arguments) };
		
		subclass$(ForOf,For);
		exports.ForOf = ForOf; // export class 
		ForOf.prototype.declare = function (){
			var o = this.options();
			var vars = o.vars = {};
			
			var src = vars.source = o.source._variable || this.scope().declare('o',o.source,{system: true,type: 'let'});
			if (o.index) { var v = vars.value = this.scope().declare(o.index,null,{let: true}) };
			
			// possibly proxy the index-variable?
			
			if (o.own) {
				// var i = vars:index = scope.declare('i',0,system: true, type: 'let') # mark as a counter?
				var i = vars.index = this.util().counter(0,true,this.scope()).predeclare();
				// systemvariable -- should not really be added to the map
				var keys = vars.keys = this.scope().declare('keys',Util.keys(src.accessor()),{system: true,type: 'let'}); // the outer one should resolve first
				var l = vars.len = this.scope().declare('l',Util.len(keys.accessor()),{system: true,type: 'let'});
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
				
				var head = ("" + mark__(this.options().keyword) + "for (" + (this.scope().vars().c()) + "; " + (OP('<',i,vars.len).c()) + "; " + (OP('++',i).c()) + ")");
				return head + this.body().c({indent: true,braces: true}); // .wrap
			};
			
			var code = this.body().c({braces: true,indent: true});
			// it is really important that this is a treated as a statement
			return this.scope().vars().c() + (";\n" + mark__(this.options().keyword) + "for (var " + (k.c()) + " in " + (o.c()) + ")") + code;
		};
		
		ForOf.prototype.head = function (){
			var v = this.options().vars;
			
			return [
				OP('=',v.key,OP('.',v.keys,v.index)),
				(v.value) && (OP('=',v.value,OP('.',v.source,v.key)))
			];
		};
		
		// NO NEED?
		function Begin(body){
			this._nodes = blk__(body).nodes();
		};
		
		
		subclass$(Begin,Block);
		exports.Begin = Begin; // export class 
		Begin.prototype.shouldParenthesize = function (){
			return this.isExpression();
		};
		
		
		
		function Switch(a,b,c){
			this._traversed = false;
			this._source = a;
			this._cases = b;
			this._fallback = c;
		};
		
		
		subclass$(Switch,ControlFlowStatement);
		exports.Switch = Switch; // export class 
		Switch.prototype.source = function(v){ return this._source; }
		Switch.prototype.setSource = function(v){ this._source = v; return this; };
		Switch.prototype.cases = function(v){ return this._cases; }
		Switch.prototype.setCases = function(v){ this._cases = v; return this; };
		Switch.prototype.fallback = function(v){ return this._fallback; }
		Switch.prototype.setFallback = function(v){ this._fallback = v; return this; };
		
		
		Switch.prototype.visit = function (){
			for (var i = 0, ary = iter$(this.cases()), len = ary.length; i < len; i++) {
				ary[i].traverse();
			};
			if (this.fallback()) { this.fallback().visit() };
			if (this.source()) { this.source().visit() };
			return;
		};
		
		
		Switch.prototype.consume = function (node){
			// TODO work inside tags (like loops)
			this._cases = this._cases.map(function(item) { return item.consume(node); });
			if (this._fallback) { this._fallback = this._fallback.consume(node) };
			return this;
		};
		
		Switch.prototype.c = function (o){
			if (this.stack().isExpression() || this.isExpression()) {
				var ast = CALL(FN([],[this]),[]);
				return ast.c(o);
			};
			
			return Switch.__super__.c.call(this,o);
		};
		
		
		Switch.prototype.js = function (o){
			var body = [];
			
			for (var i = 0, ary = iter$(this.cases()), len = ary.length, part; i < len; i++) {
				part = ary[i];
				part.autobreak();
				body.push(part);
			};
			
			if (this.fallback()) {
				body.push("default:\n" + this.fallback().c({indent: true}));
			};
			
			return ("switch (" + (this.source().c()) + ") ") + helpers.bracketize(cary__(body).join("\n"),true);
		};
		
		
		
		function SwitchCase(test,body){
			this._traversed = false;
			this._test = test;
			this._body = blk__(body);
		};
		
		subclass$(SwitchCase,ControlFlowStatement);
		exports.SwitchCase = SwitchCase; // export class 
		SwitchCase.prototype.test = function(v){ return this._test; }
		SwitchCase.prototype.setTest = function(v){ this._test = v; return this; };
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
			var cases = this._test.map(function(item) { return ("case " + (item.c()) + ":"); });
			return cases.join("\n") + this.body().c({indent: true}); // .indent
		};
		
		
		
		function Try(body,c,f){
			this._traversed = false;
			this._body = blk__(body);
			this._catch = c;
			this._finally = f;
		};
		
		
		subclass$(Try,ControlFlowStatement);
		exports.Try = Try; // export class 
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
				out += (" catch (e) \{ \}");
			};
			out += ";";
			return out;
		};
		
		
		
		function Catch(body,varname){
			this._traversed = false;
			this._body = blk__(body || []);
			this._scope = new CatchScope(this);
			this._varname = varname;
			this;
		};
		
		subclass$(Catch,ControlFlowStatement);
		exports.Catch = Catch; // export class 
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
		
		function Range(){ return Op.apply(this,arguments) };
		
		subclass$(Range,Op);
		exports.Range = Range; // export class 
		Range.prototype.inclusive = function (){
			return this.op() == '..';
		};
		
		Range.prototype.c = function (){
			return "range";
		};
		
		
		function Splat(){ return ValueNode.apply(this,arguments) };
		
		subclass$(Splat,ValueNode);
		exports.Splat = Splat; // export class 
		Splat.prototype.js = function (o){
			var par = this.stack().parent();
			if ((par instanceof ArgList) || (par instanceof Arr)) {
				return ("[].slice.call(" + (this.value().c()) + ")");
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
		Tag.prototype.parts = function(v){ return this._parts; }
		Tag.prototype.setParts = function(v){ this._parts = v; return this; };
		Tag.prototype.object = function(v){ return this._object; }
		Tag.prototype.setObject = function(v){ this._object = v; return this; };
		Tag.prototype.reactive = function(v){ return this._reactive; }
		Tag.prototype.setReactive = function(v){ this._reactive = v; return this; };
		Tag.prototype.parent = function(v){ return this._parent; }
		Tag.prototype.setParent = function(v){ this._parent = v; return this; };
		Tag.prototype.tree = function(v){ return this._tree; }
		Tag.prototype.setTree = function(v){ this._tree = v; return this; };
		
		Tag.prototype.set = function (obj){
			for (var v, i = 0, keys = Object.keys(obj), l = keys.length; i < l; i++){
				k = keys[i];v = obj[k];if (k == 'attributes') {
					for (var j = 0, ary = iter$(v), len = ary.length; j < len; j++) {
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
			return this;
		};
		
		Tag.prototype.addIndex = function (node){
			this._parts.push(node);
			this._object = node;
			return this;
		};
		
		Tag.prototype.addSymbol = function (node){
			if (this._parts.length == 0) {
				this._parts.push(node);
				this._options.ns = node;
			};
			return this;
		};
		
		
		Tag.prototype.addAttribute = function (atr){
			this._parts.push(atr);
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
			var o = this._options;
			
			
			if (node instanceof TagTree) {
				this.setParent(node.root());
				
				if (node._loop) {
					// alwatys make items in loop reactive
					this.setReactive(node.reactive() || this.option('key'));
					this.option('loop',node._loop);
					
					if (this.option('ivar')) {
						this.warn(("Tag inside loop can not have a static reference " + this.option('ivar')),{type: 'error',token: this.option('ivar').value()});
					};
				} else {
					this.setReactive(node.reactive() || !(!this.option('ivar')));
				};
				
				return this;
			};
			
			return Tag.__super__.consume.apply(this,arguments);
		};
		
		
		Tag.prototype.visit = function (){
			
			var o = this._options;
			
			if (o.ivar || o.key) {
				this.setReactive(true);
			};
			
			var typ = this.enclosing();
			
			if (typ == '->' || typ == '=>') {
				this._tree = new TagTree(this,o.body,{root: this,reactive: this.reactive()});
				o.body = new TagFragmentFunc([],Block.wrap([this._tree]));
			};
			
			if (o.key) { o.key.traverse() };
			if (o.body) { o.body.traverse() };
			if (o.id) { o.id.traverse() };
			
			for (var i = 0, ary = iter$(this._parts), len = ary.length; i < len; i++) {
				ary[i].traverse();
			};
			
			return this;
		};
		
		Tag.prototype.reference = function (){
			return this._reference || (this._reference = this.scope__().closure().temporary(this,{pool: 'tag'}).resolve());
		};
		
		Tag.prototype.js = function (o){
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
			
			// should not cache statics if the node itself is not cached
			// that would only mangle the order in which we set the properties
			var cacheStatics = true;
			
			for (var i = 0, ary = iter$(o.attributes), len = ary.length, atr; i < len; i++) {
				atr = ary[i];
				a[atr.key()] = atr.value();
			};
			
			var quote = function(str) { return helpers.singlequote(str); };
			var id = o.id instanceof Node ? (o.id.c()) : ((o.id && quote(o.id.c())));
			var tree = this._tree || null;
			var parent = this.parent();
			
			var out = isSelf ? (
				commit = "synced",
				this.setReactive(true),
				this._reference = scope.context(),
				scope.context().c()
			) : (this.type().isClass() ? (
				("" + mark__(o.open) + (this.type().name()) + ".build()")
			) : (
				("" + mark__(o.open) + (scope.tagContextPath()) + "." + (this.type().spawner()) + "()")
			));
			
			if (o.id) {
				statics.push((".setId(" + quote(o.id) + ")"));
			};
			
			// this is reactive if it has an ivar
			if (o.ivar) {
				this.setReactive(true);
				statics.push((".setRef(" + quote(o.ivar.name()) + "," + (scope.context().c()) + ")"));
			};
			
			if (o.body instanceof Func) {
				bodySetter = "setTemplate";
			} else if (o.body) {
				if ((o.body instanceof ArgList) && o.body.count() == 1 && o.body.first().isString()) {
					bodySetter = "setText";
				} else {
					// would probably be better to convert to a tagtree during the initial visit
					tree = new TagTree(this,o.body,{root: this,reactive: this.reactive()});
					content = tree;
					this.setTree(tree);
				};
			};
			
			if (tree) {
				// this is the point where we traverse the inner nodes with our tree
				// should rather happen in visit - long before.
				tree.resolve();
			};
			
			var dynamicFlagIndex = isSelf ? (1) : (0);
			
			for (var i = 0, ary = iter$(this._parts), len = ary.length, part; i < len; i++) {
				part = ary[i];
				var pjs;
				var pcache = false;
				
				if (part instanceof TagAttr) {
					var akey = String(part.key());
					var aval = part.value();
					
					pcache = aval.isPrimitive();
					
					if (akey[0] == '.') {
						pcache = false;
						pjs = (".flag(" + quote(akey.substr(1)) + "," + (aval.c()) + ")");
					} else if (akey[0] == ':') {
						// TODO need to analyze whether this is static or not
						pjs = (".setHandler(" + quote(akey.substr(1)) + "," + (aval.c()) + "," + (scope.context().c()) + ")");
					} else if (akey.substr(0,5) == 'data-') {
						pjs = (".dataset('" + akey.slice(5) + "'," + (aval.c()) + ")");
					} else {
						pjs = ("." + mark__(part.key()) + helpers.setterSym(akey) + "(" + (aval.c()) + ")");
					};
				} else if (part instanceof TagFlag) {
					if (part.value() instanceof Node) {
						if (this.reactive()) {
							var idx = dynamicFlagIndex;
							pjs = (".setFlag(" + idx + "," + (part.value().c()) + ")");
							dynamicFlagIndex = idx + 2;
						} else {
							pjs = part.c();
						};
					} else {
						pjs = part.c();
						pcache = true;
					};
				};
				
				if (pjs) {
					cacheStatics && pcache ? (statics.push(pjs)) : (calls.push(pjs));
				};
			};
			
			if (this.object()) {
				calls.push((".setObject(" + (this.object().c()) + ")"));
			};
			
			// we need to trigger our own reference before the body does
			// but we do not need a reference if we have no body
			if (this.reactive() && tree) {
				this.reference();
			};
			
			if (this.reactive() && parent && parent.tree()) {
				o.treeRef = parent.tree().nextCacheKey(this);
			};
			
			if (body = content && content.c({expression: true})) {
				var typ = 0;
				
				if (tree) {
					if (tree.static()) {
						typ = 2;
					} else if (this.reactive() || tree.reactive()) {
						if (!tree.single() || (tree.single() instanceof If)) {
							typ = 1;
						} else {
							typ = 3;
						};
					};
				};
				
				
				if (bodySetter == 'setChildren' || bodySetter == 'setContent') {
					calls.push(("." + bodySetter + "(" + body + "," + typ + ")"));
				} else {
					calls.push(("." + bodySetter + "(" + body + ")"));
				};
			};
			
			calls.push(("." + commit + "()"));
			
			if (statics.length) {
				out = out + statics.join("");
			};
			
			if ((o.ivar || o.key || this.reactive()) && !(this.type() instanceof Self)) {
				// if this is an ivar, we should set the reference relative
				// to the outer reference, or possibly right on context?
				var ctx,key;
				var partree = parent && parent.tree();
				
				if (o.key) {
					// closest tag
					// TODO if the dynamic key starts with a static string we should
					// just prepend _ to the string instead of wrapping in OP
					ctx = parent && parent.reference();
					key = OP('+',new Str("'_'"),o.key);
				} else if (o.ivar) {
					ctx = scope.context();
					key = o.ivar;
				} else {
					ctx = parent && parent.reference();
					// ctx = partree.cacher
					key = o.treeRef || partree && partree.nextCacheKey();
					// key = tree and tree.nextCacheKey
					if (o.loop) {
						var idx1 = o.loop.option('vars').index;
						key = OP('+',"'" + key + "'",idx1);
					};
				};
				
				// need the context -- might be better to rewrite it for real?
				// parse the whole thing into calls etc
				var acc = OP('.',ctx,key).c();
				
				if (this._reference) {
					out = ("(" + (this.reference().c()) + " = " + acc + "=" + acc + " || " + out + ")");
				} else {
					out = ("(" + acc + " = " + acc + " || " + out + ")");
				};
			};
			
			return out + calls.join("");
		};
		
		// This is a helper-node
		// Should probably use the same type of listnode everywhere
		// and simply flag the type as TagTree instead
		function TagTree(owner,list,options){
			if(options === undefined) options = {};
			this._owner = owner;
			this._nodes = this.load(list);
			this._options = options;
			this._conditions = [];
			this._blocks = [this];
			this._counter = 0;
			this;
		};
		
		subclass$(TagTree,ListNode);
		exports.TagTree = TagTree; // export class 
		TagTree.prototype.counter = function(v){ return this._counter; }
		TagTree.prototype.setCounter = function(v){ this._counter = v; return this; };
		TagTree.prototype.conditions = function(v){ return this._conditions; }
		TagTree.prototype.setConditions = function(v){ this._conditions = v; return this; };
		TagTree.prototype.blocks = function(v){ return this._blocks; }
		TagTree.prototype.setBlocks = function(v){ this._blocks = v; return this; };
		TagTree.prototype.cacher = function(v){ return this._cacher; }
		TagTree.prototype.setCacher = function(v){ this._cacher = v; return this; };
		
		TagTree.prototype.parent = function (){
			return this._parent || (this._parent = this._owner.parent());
		};
		
		TagTree.prototype.nextCacheKey = function (){
			var root = this._owner;
			
			// if we want to cache everything on root
			var num = ++this._counter;
			var base = "A".charCodeAt(0);
			var str = "";
			
			while (true){
				num -= 1;
				str = String.fromCharCode(base + (num % 26)) + str;
				num = Math.floor(num / 26);
				if (num <= 0) { break; };
			};
			
			str = (this._owner.type() instanceof Self ? ("$") : ("$$")) + str.toLowerCase();
			return str;
			return num;
		};
		
		TagTree.prototype.load = function (list){
			if (list instanceof ListNode) {
				// we still want the indentation if we are not in a template
				// or, rather - we want the block to get the indentation - not the tree
				this._indentation || (this._indentation = list._indentation); // if list.count > 1
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
			var self = this;
			this.remap(function(c) { return c.consume(self); });
			return self;
		};
		
		TagTree.prototype.static = function (){
			// every real node
			return this._static == null ? (this._static = this.every(function(c) { return (c instanceof Tag) || (c instanceof Str) || (c instanceof Meta); })) : (this._static);
		};
		
		TagTree.prototype.single = function (){
			return this._single == null ? (this._single = (this.realCount() == 1 ? (this.last()) : (false))) : (this._single);
		};
		
		TagTree.prototype.hasTags = function (){
			return this.some(function(c) { return c instanceof Tag; });
		};
		
		TagTree.prototype.c = function (o){
			// FIXME TEST what about comments???
			var single = this.single();
			
			// no indentation if this should return
			if (single && (STACK.current() instanceof Return)) {
				this._indentation = null;
			};
			
			var out = TagTree.__super__.c.call(this,o);
			
			if (!single || (single instanceof If)) {
				return ("[" + out + "]");
			} else {
				return out;
			};
		};
		
		function TagWrapper(){ return ValueNode.apply(this,arguments) };
		
		subclass$(TagWrapper,ValueNode);
		exports.TagWrapper = TagWrapper; // export class 
		TagWrapper.prototype.visit = function (){
			if (this.value() instanceof Array) {
				this.value().map(function(v) { return v.traverse(); });
			} else {
				this.value().traverse();
			};
			return this;
		};
		
		TagWrapper.prototype.c = function (){
			return ("tag$wrap(" + this.value().c({expression: true}) + ")");
		};
		
		
		function TagAttributes(){ return ListNode.apply(this,arguments) };
		
		subclass$(TagAttributes,ListNode);
		exports.TagAttributes = TagAttributes; // export class 
		TagAttributes.prototype.get = function (name){
			for (var i = 0, ary = iter$(this.nodes()), len = ary.length, node, res = []; i < len; i++) {
				node = ary[i];
				if (node.key() == name) { return node };
			};
			return res;
		};
		
		
		function TagAttr(k,v){
			this._traversed = false;
			this._key = k;
			this._value = v;
		};
		
		subclass$(TagAttr,Node);
		exports.TagAttr = TagAttr; // export class 
		TagAttr.prototype.key = function(v){ return this._key; }
		TagAttr.prototype.setKey = function(v){ this._key = v; return this; };
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
		
		
		function TagFlag(value){
			this._traversed = false;
			this._value = value;
			this;
		};
		
		subclass$(TagFlag,Node);
		exports.TagFlag = TagFlag; // export class 
		TagFlag.prototype.value = function(v){ return this._value; }
		TagFlag.prototype.setValue = function(v){ this._value = v; return this; };
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
				return (".flag(" + (this.value().c()) + ")");
			} else {
				return (".flag(" + helpers.singlequote(this.value()) + ")");
			};
		};
		
		
		
		// SELECTORS
		
		
		function Selector(list,options){
			this._nodes = list || [];
			this._options = options;
		};
		
		subclass$(Selector,ListNode);
		exports.Selector = Selector; // export class 
		Selector.prototype.add = function (part,typ){
			this.push(part);
			return this;
		};
		
		Selector.prototype.group = function (){
			// for now we simply add a comma
			// how would this work for dst?
			this._nodes.push(new SelectorGroup(","));
			return this;
		};
		
		Selector.prototype.query = function (){
			var str = "";
			var ary = [];
			
			for (var i = 0, items = iter$(this.nodes()), len = items.length; i < len; i++) {
				var val = items[i].c();
				if ((typeof val=='string'||val instanceof String)) {
					str = ("" + str + val);
				};
			};
			
			return ("'" + str + "'");
		};
		
		
		Selector.prototype.js = function (o){
			var typ = this.option('type');
			var q = c__(this.query());
			
			if (typ == '%') {
				return ("q$(" + q + "," + o.scope().context().c({explicit: true}) + ")"); // explicit context
			} else if (typ == '%%') {
				return ("q$$(" + q + "," + o.scope().context().c({explicit: true}) + ")");
			} else {
				return ("q" + typ + "(" + q + ")");
			};
			
			// return "{typ} {scoped} - {all}"
		};
		
		
		function SelectorPart(){ return ValueNode.apply(this,arguments) };
		
		subclass$(SelectorPart,ValueNode);
		exports.SelectorPart = SelectorPart; // export class 
		SelectorPart.prototype.c = function (){
			return c__(this._value);
		};
		
		function SelectorGroup(){ return SelectorPart.apply(this,arguments) };
		
		subclass$(SelectorGroup,SelectorPart);
		exports.SelectorGroup = SelectorGroup; // export class 
		SelectorGroup.prototype.c = function (){
			return ",";
		};
		
		function SelectorType(){ return SelectorPart.apply(this,arguments) };
		
		subclass$(SelectorType,SelectorPart);
		exports.SelectorType = SelectorType; // export class 
		SelectorType.prototype.c = function (){
			var name = this.value().name();
			
			// at least be very conservative about which tags we
			// can drop the tag for?
			// out in TAG_TYPES.HTML ? 
			return idx$(name,TAG_TYPES.HTML) >= 0 ? (name) : (this.value().sel());
		};
		
		
		function SelectorUniversal(){ return SelectorPart.apply(this,arguments) };
		
		subclass$(SelectorUniversal,SelectorPart);
		exports.SelectorUniversal = SelectorUniversal; // export class 
		
		
		function SelectorNamespace(){ return SelectorPart.apply(this,arguments) };
		
		subclass$(SelectorNamespace,SelectorPart);
		exports.SelectorNamespace = SelectorNamespace; // export class 
		
		
		function SelectorClass(){ return SelectorPart.apply(this,arguments) };
		
		subclass$(SelectorClass,SelectorPart);
		exports.SelectorClass = SelectorClass; // export class 
		SelectorClass.prototype.c = function (){
			if (this._value instanceof Node) {
				return (".'+" + (this._value.c()) + "+'");
			} else {
				return ("." + c__(this._value));
			};
		};
		
		function SelectorId(){ return SelectorPart.apply(this,arguments) };
		
		subclass$(SelectorId,SelectorPart);
		exports.SelectorId = SelectorId; // export class 
		SelectorId.prototype.c = function (){
			if (this._value instanceof Node) {
				return ("#'+" + (this._value.c()) + "+'");
			} else {
				return ("#" + c__(this._value));
			};
		};
		
		function SelectorCombinator(){ return SelectorPart.apply(this,arguments) };
		
		subclass$(SelectorCombinator,SelectorPart);
		exports.SelectorCombinator = SelectorCombinator; // export class 
		SelectorCombinator.prototype.c = function (){
			return ("" + c__(this._value));
		};
		
		function SelectorPseudoClass(){ return SelectorPart.apply(this,arguments) };
		
		subclass$(SelectorPseudoClass,SelectorPart);
		exports.SelectorPseudoClass = SelectorPseudoClass; // export class 
		
		
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
				return ("[" + (this._left.c()) + (this._op) + (this._right.c()) + "]");
			} else if (this._right) {
				// this is not at all good
				return ("[" + (this._left.c()) + (this._op) + "\"'+" + c__(this._right) + "+'\"]");
			} else {
				return ("[" + (this._left.c()) + "]");
				
				// ...
			};
		};
		
		
		
		
		// DEFER
		
		function Await(){ return ValueNode.apply(this,arguments) };
		
		subclass$(Await,ValueNode);
		exports.Await = Await; // export class 
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
			var self = this;
			self.value().traverse();
			
			var block = o.up(Block); // or up to the closest FUNCTION?
			var outer = o.relative(block,1);
			var par = o.relative(self,-1);
			
			self.setFunc(new AsyncFunc([],[]));
			// now we move this node up to the block
			self.func().body().setNodes(block.defers(outer,self));
			
			// if the outer is a var-assignment, we can simply set the params
			if (par instanceof Assign) {
				par.left().traverse();
				var lft = par.left().node();
				// Can be a tuple as well, no?
				if (lft instanceof VarReference) {
					// the param is already registered?
					// should not force the name already??
					// beware of bugs
					self.func().params().at(0,true,lft.variable().name());
				} else if (lft instanceof Tuple) {
					// if this an unfancy tuple, with only vars
					// we can just use arguments
					
					if (par.type() == 'var' && !lft.hasSplat()) {
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
		
		function AsyncFunc(params,body,name,target,options){
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
		
		function ImportStatement(imports,source,ns){
			this._traversed = false;
			this._imports = imports;
			this._source = source;
			this._ns = ns;
			this;
		};
		
		subclass$(ImportStatement,Statement);
		exports.ImportStatement = ImportStatement; // export class 
		ImportStatement.prototype.ns = function(v){ return this._ns; }
		ImportStatement.prototype.setNs = function(v){ this._ns = v; return this; };
		ImportStatement.prototype.imports = function(v){ return this._imports; }
		ImportStatement.prototype.setImports = function(v){ this._imports = v; return this; };
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
				var dec = this._declarations = new VariableDeclaration([]);
				
				if (this._imports.length == 1) {
					this._alias = this._imports[0];
					dec.add(this._alias,OP('.',CALL(new Identifier("require"),[this.source()]),this._alias));
					dec.traverse();
					return this;
					
					// dec.add(@alias,CALL(Identifier.new("require"),[source]))
				};
				
				// @declarations = VariableDeclaration.new([])
				this._moduledecl = dec.add(this._alias,CALL(new Identifier("require"),[this.source()]));
				this._moduledecl.traverse();
				
				
				if (this._imports.length > 1) {
					for (var i = 0, ary = iter$(this._imports), len = ary.length, imp; i < len; i++) {
						imp = ary[i];
						this._declarations.add(imp,OP('.',this._moduledecl.variable(),imp));
					};
				};
				
				dec.traverse();
			};
			return this;
		};
		
		
		ImportStatement.prototype.js = function (o){
			
			var fname;
			if (this._declarations) {
				return this._declarations.c();
			};
			
			var req = CALL(new Identifier("require"),[this.source()]);
			
			if (this._ns) {
				// must register ns as a real variable
				return ("var " + (this._nsvar.c()) + " = " + (req.c()));
			};
			
			if (this._imports) {
				
				var src = this.source().c();
				var alias = [];
				var vars = new VarBlock([]);
				
				if (fname = src.match(/(\w+)(\.js|imba)?[\"\']$/)) {
					alias.push(fname[1]);
				};
				
				// var alias = src.match(/(\w+)(\.js|imba)?[\"\']$/)
				// create a require for the source, with a temporary name?
				var out = [req.cache({names: alias}).c()];
				
				for (var i = 0, ary = iter$(this._imports), len = ary.length, imp; i < len; i++) {
					// we also need to register these imports as variables, no?
					imp = ary[i];
					var o = OP('=',imp,OP('.',req,imp));
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
		
		function ExportStatement(){ return ValueNode.apply(this,arguments) };
		
		subclass$(ExportStatement,ValueNode);
		exports.ExportStatement = ExportStatement; // export class 
		ExportStatement.prototype.js = function (o){
			var nodes = this._value.map(function(arg) { return ("module.exports." + (arg.c()) + " = " + (arg.c())); });
			
			if (nodes.length > 1 && (this.up() instanceof Return)) {
				return '[' + nodes.join(',') + ']';
			} else {
				return nodes.join(';\n') + ';';
			};
		};
		
		
		// UTILS
		
		function Util(args){
			this._args = args;
		};
		
		// this is how we deal with it now
		subclass$(Util,Node);
		exports.Util = Util; // export class 
		Util.prototype.args = function(v){ return this._args; }
		Util.prototype.setArgs = function(v){ this._args = v; return this; };
		
		Util.extend = function (a,b){
			return new Util.Extend([a,b]);
		};
		
		Util.callImba = function (meth,args){
			return CALL(OP('.',new Const("Imba"),new Identifier(meth)),args);
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
		};
		
		Util.intersect = function (a,b){
			return new Util.Intersect([a,b]);
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
		
		Util.prototype.isStandalone = function (){
			return OPTS.standalone !== false;
		};
		
		Util.prototype.js = function (o){
			return "helper";
		};
		
		// TODO Deprecate and remove
		Util.Union = function Union(){ return Util.apply(this,arguments) };
		
		subclass$(Util.Union,Util);
		Util.Union.prototype.helper = function (){
			return 'function union$(a,b){\n	if(a && a.__union) return a.__union(b);\n\n	var u = a.slice(0);\n	for(var i=0,l=b.length;i<l;i++) if(u.indexOf(b[i]) == -1) u.push(b[i]);\n	return u;\n};\n';
		};
		
		Util.Union.prototype.js = function (o){
			this.scope__().root().helper(this,this.helper());
			// When this is triggered, we need to add it to the top of file?
			return ("union$(" + this.args().map(function(v) { return v.c(); }).join(',') + ")");
		};
		
		// TODO Deprecate and remove
		Util.Intersect = function Intersect(){ return Util.apply(this,arguments) };
		
		subclass$(Util.Intersect,Util);
		Util.Intersect.prototype.helper = function (){
			return 'function intersect$(a,b){\n	if(a && a.__intersect) return a.__intersect(b);\n	var res = [];\n	for(var i=0, l=a.length; i<l; i++) {\n		var v = a[i];\n		if(b.indexOf(v) != -1) res.push(v);\n	}\n	return res;\n};\n';
		};
		
		Util.Intersect.prototype.js = function (o){
			// When this is triggered, we need to add it to the top of file?
			this.scope__().root().helper(this,this.helper());
			return ("intersect$(" + this.args().map(function(v) { return v.c(); }).join(',') + ")");
		};
		
		Util.Extend = function Extend(){ return Util.apply(this,arguments) };
		
		subclass$(Util.Extend,Util);
		Util.Extend.prototype.js = function (o){
			// When this is triggered, we need to add it to the top of file?
			return ("extend$(" + compact__(cary__(this.args())).join(',') + ")");
		};
		
		Util.IndexOf = function IndexOf(){ return Util.apply(this,arguments) };
		
		subclass$(Util.IndexOf,Util);
		Util.IndexOf.prototype.helper = function (){
			return 'function idx$(a,b){\n	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);\n};\n';
		};
		
		Util.IndexOf.prototype.js = function (o){
			if (this.isStandalone()) {
				this.scope__().root().helper(this,this.helper());
				// When this is triggered, we need to add it to the top of file?
				return ("idx$(" + this.args().map(function(v) { return v.c(); }).join(',') + ")");
			} else {
				return ("Imba.indexOf(" + this.args().map(function(v) { return v.c(); }).join(',') + ")");
			};
		};
		
		
		Util.Subclass = function Subclass(){ return Util.apply(this,arguments) };
		
		subclass$(Util.Subclass,Util);
		Util.Subclass.prototype.helper = function (){
			// should also check if it is a real promise
			return '// helper for subclassing\nfunction subclass$(obj,sup) {\n	for (var k in sup) {\n		if (sup.hasOwnProperty(k)) obj[k] = sup[k];\n	};\n	// obj.__super__ = sup;\n	obj.prototype = Object.create(sup.prototype);\n	obj.__super__ = obj.prototype.__super__ = sup.prototype;\n	obj.prototype.initialize = obj.prototype.constructor = obj;\n};\n';
		};
		
		Util.Subclass.prototype.js = function (o){
			if (this.isStandalone()) {
				// When this is triggered, we need to add it to the top of file?
				this.scope__().root().helper(this,this.helper());
				return ("subclass$(" + this.args().map(function(v) { return v.c(); }).join(',') + ");\n");
			} else {
				return ("Imba.subclass(" + this.args().map(function(v) { return v.c(); }).join(',') + ");\n");
			};
		};
		
		Util.Promisify = function Promisify(){ return Util.apply(this,arguments) };
		
		subclass$(Util.Promisify,Util);
		Util.Promisify.prototype.helper = function (){
			// should also check if it is a real promise
			return ("function promise$(a)\{ return a instanceof Array ? Promise.all(a) : (a && a.then ? a : Promise.resolve(a)); \}");
		};
		
		Util.Promisify.prototype.js = function (o){
			if (this.isStandalone()) {
				// When this is triggered, we need to add it to the top of file?
				this.scope__().root().helper(this,this.helper());
				return ("promise$(" + this.args().map(function(v) { return v.c(); }).join(',') + ")");
			} else {
				return ("Imba.await(" + this.args().map(function(v) { return v.c(); }).join(',') + ")");
			};
		};
		
		// TODO deprecated: can remove
		Util.Class = function Class(){ return Util.apply(this,arguments) };
		
		subclass$(Util.Class,Util);
		Util.Class.prototype.js = function (o){
			// When this is triggered, we need to add it to the top of file?
			return ("class$(" + this.args().map(function(v) { return v.c(); }).join(',') + ")");
		};
		
		Util.Iterable = function Iterable(){ return Util.apply(this,arguments) };
		
		subclass$(Util.Iterable,Util);
		Util.Iterable.prototype.helper = function (){
			// now we want to allow null values as well - just return as empty collection
			// should be the same for for own of I guess
			return ("function iter$(a)\{ return a ? (a.toArray ? a.toArray() : a) : []; \};");
		};
		
		Util.Iterable.prototype.js = function (o){
			if (this.args()[0] instanceof Arr) { return this.args()[0].c() }; // or if we know for sure that it is an array
			
			if (this.isStandalone()) {
				this.scope__().root().helper(this,this.helper());
				return ("iter$(" + (this.args()[0].c()) + ")");
			} else {
				return ("Imba.iterable(" + (this.args()[0].c()) + ")");
			};
		};
		
		Util.IsFunction = function IsFunction(){ return Util.apply(this,arguments) };
		
		subclass$(Util.IsFunction,Util);
		Util.IsFunction.prototype.js = function (o){
			return ("" + (this.args()[0].c()));
		};
		
		Util.Array = function Array(){ return Util.apply(this,arguments) };
		
		subclass$(Util.Array,Util);
		Util.Array.prototype.js = function (o){
			// When this is triggered, we need to add it to the top of file?
			return ("new Array(" + this.args().map(function(v) { return v.c(); }) + ")");
		};
		
		
		
		
		function Entities(root){
			this._root = root;
			this._map = {};
			return this;
		};
		
		Entities.prototype.add = function (path,object){
			this._map[path] = object;
			return this;
		};
		
		Entities.prototype.register = function (entity){
			var $1;
			var path = entity.namepath();
			this._map[($1 = path)] || (this._map[$1] = entity);
			return this;
		};
		
		Entities.prototype.plain = function (){
			return JSON.parse(JSON.stringify(this._map));
		};
		
		Entities.prototype.toJSON = function (){
			return this._map;
		};
		
		// SCOPES
		
		// handles local variables, self etc. Should create references to outer scopes
		// when needed etc.
		
		// add class for annotations / registering methods, etc?
		// class Interface
		
		// should move the whole context-thingie right into scope
		function Scope(node,parent){
			this._nr = STACK.incr('scopes');
			this._head = [];
			this._node = node;
			this._parent = parent;
			this._vars = new VariableDeclaration([]);
			this._meta = {};
			this._annotations = [];
			this._closure = this;
			this._virtual = false;
			this._counter = 0;
			this._varmap = {};
			this._varpool = [];
		};
		
		exports.Scope = Scope; // export class 
		Scope.prototype.level = function(v){ return this._level; }
		Scope.prototype.setLevel = function(v){ this._level = v; return this; };
		Scope.prototype.context = function(v){ return this._context; }
		Scope.prototype.setContext = function(v){ this._context = v; return this; };
		Scope.prototype.node = function(v){ return this._node; }
		Scope.prototype.setNode = function(v){ this._node = v; return this; };
		Scope.prototype.parent = function(v){ return this._parent; }
		Scope.prototype.setParent = function(v){ this._parent = v; return this; };
		Scope.prototype.varmap = function(v){ return this._varmap; }
		Scope.prototype.setVarmap = function(v){ this._varmap = v; return this; };
		Scope.prototype.varpool = function(v){ return this._varpool; }
		Scope.prototype.setVarpool = function(v){ this._varpool = v; return this; };
		Scope.prototype.params = function(v){ return this._params; }
		Scope.prototype.setParams = function(v){ this._params = v; return this; };
		Scope.prototype.head = function(v){ return this._head; }
		Scope.prototype.setHead = function(v){ this._head = v; return this; };
		Scope.prototype.vars = function(v){ return this._vars; }
		Scope.prototype.setVars = function(v){ this._vars = v; return this; };
		Scope.prototype.counter = function(v){ return this._counter; }
		Scope.prototype.setCounter = function(v){ this._counter = v; return this; };
		
		Scope.prototype.p = function (){
			if (STACK.loglevel() > 0) {
				console.log.apply(console,arguments);
			};
			return this;
		};
		
		Scope.prototype.stack = function (){
			return STACK;
		};
		
		Scope.prototype.meta = function (key,value){
			if (value != undefined) {
				this._meta[key] = value;
				return this;
			};
			return this._meta[key];
		};
		
		Scope.prototype.namepath = function (){
			return '?';
		};
		
		Scope.prototype.tagContextPath = function (){
			// bypassing for now
			return this._tagContextPath || (this._tagContextPath = "tag$"); // parent.tagContextPath
		};
		
		Scope.prototype.context = function (){
			return this._context || (this._context = new ScopeContext(this));
		};
		
		Scope.prototype.traverse = function (){
			return this;
		};
		
		Scope.prototype.visit = function (){
			if (this._parent) { return this };
			this._parent = STACK.scope(1); // the parent scope
			this._level = STACK.scopes().length - 1;
			
			STACK.addScope(this);
			this.root().scopes().push(this);
			return this;
		};
		
		Scope.prototype.wrap = function (scope){
			this._parent = scope._parent;
			scope._parent = this;
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
				if (scope instanceof RootScope) { return scope };
				scope = scope.parent();
			};
			return null;
		};
		
		Scope.prototype.register = function (name,decl,o){
			// FIXME re-registering a variable should really return the existing one
			// Again, here we should not really have to deal with system-generated vars
			// But again, it is important
			
			if(decl === undefined) decl = null;
			if(o === undefined) o = {};
			name = helpers.symbolize(name);
			
			// also look at outer scopes if this is not closed?
			var existing = this._varmap.hasOwnProperty(name) && this._varmap[name];
			if (existing) { return existing };
			
			var item = new Variable(this,name,decl,o);
			// need to check for duplicates, and handle this gracefully -
			// going to refactor later
			if (!o.system) { this._varmap[name] = item }; // dont even add to the varmap if it is a sysvar
			return item;
		};
		
		Scope.prototype.annotate = function (obj){
			this._annotations.push(obj);
			return this;
		};
		
		// just like register, but we automatically 
		Scope.prototype.declare = function (name,init,o){
			var declarator_;
			if(init === undefined) init = null;
			if(o === undefined) o = {};
			var variable = this.register(name,null,o);
			// TODO create the variabledeclaration here instead?
			// if this is a sysvar we need it to be renameable
			var dec = this._vars.add(variable,init);
			(declarator_ = variable.declarator()) || ((variable.setDeclarator(dec),dec));
			return variable;
		};
		
		// what are the differences here? omj
		// we only need a temporary thing with defaults -- that is all
		// change these values, no?
		Scope.prototype.temporary = function (refnode,o,name){
			
			if(o === undefined) o = {};
			if(name === undefined) name = null;
			if (o.pool) {
				for (var i = 0, ary = iter$(this._varpool), len = ary.length, v; i < len; i++) {
					v = ary[i];
					if (v.pool() == o.pool && v.declarator() == null) {
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
		};
		
		Scope.prototype.lookup = function (name){
			var ret = null;
			name = helpers.symbolize(name);
			if (this._varmap.hasOwnProperty(name)) {
				ret = this._varmap[name];
			} else {
				ret = this.parent() && this.parent().lookup(name);
				// or -- not all scopes have a parent?
			};
			return ret;
		};
		
		Scope.prototype.autodeclare = function (variable){
			return this.vars().push(variable); // only if it does not exist here!!!
		};
		
		Scope.prototype.free = function (variable){
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
		};
		
		Scope.prototype.region = function (){
			return this.node().body().region();
		};
		
		Scope.prototype.loc = function (){
			return this.node().loc();
		};
		
		Scope.prototype.dump = function (){
			var self = this;
			var vars = Object.keys(this._varmap).map(function(k) {
				var v = self._varmap[k];
				return v.references().length ? (dump__(v)) : (null);
			});
			
			var desc = {
				nr: self._nr,
				type: self.constructor.name,
				level: (self.level() || 0),
				vars: compact__(vars),
				loc: self.loc()
			};
			
			return desc;
		};
		
		Scope.prototype.toJSON = function (){
			return this.dump();
		};
		
		Scope.prototype.toString = function (){
			return ("" + (this.constructor.name));
		};
		
		
		// RootScope is wrong? Rather TopScope or ProgramScope
		function RootScope(){
			RootScope.__super__.constructor.apply(this,arguments);
			
			this.register('global',this,{type: 'global'});
			this.register('module',this,{type: 'global'});
			this.register('window',this,{type: 'global'});
			this.register('document',this,{type: 'global'});
			this.register('exports',this,{type: 'global'});
			this.register('console',this,{type: 'global'});
			this.register('process',this,{type: 'global'});
			this.register('parseInt',this,{type: 'global'});
			this.register('parseFloat',this,{type: 'global'});
			this.register('setTimeout',this,{type: 'global'});
			this.register('setInterval',this,{type: 'global'});
			this.register('clearTimeout',this,{type: 'global'});
			this.register('clearInterval',this,{type: 'global'});
			this.register('__dirname',this,{type: 'global'});
			this.register('_',this,{type: 'global'});
			
			
			// preregister global special variables here
			this._warnings = [];
			this._scopes = [];
			this._helpers = [];
			this._entities = new Entities(this);
			this._head = [this._vars];
		};
		
		subclass$(RootScope,Scope);
		exports.RootScope = RootScope; // export class 
		RootScope.prototype.warnings = function(v){ return this._warnings; }
		RootScope.prototype.setWarnings = function(v){ this._warnings = v; return this; };
		RootScope.prototype.scopes = function(v){ return this._scopes; }
		RootScope.prototype.setScopes = function(v){ this._scopes = v; return this; };
		RootScope.prototype.entities = function(v){ return this._entities; }
		RootScope.prototype.setEntities = function(v){ this._entities = v; return this; };
		
		RootScope.prototype.context = function (){
			return this._context || (this._context = new RootScopeContext(this));
		};
		
		RootScope.prototype.tagContextPath = function (){
			return this._tagContextPath || (this._tagContextPath = "tag$");
		};
		
		RootScope.prototype.lookup = function (name){
			name = helpers.symbolize(name);
			if (this._varmap.hasOwnProperty(name)) { return this._varmap[name] };
		};
		
		RootScope.prototype.visit = function (){
			STACK.addScope(this);
			return this;
		};
		
		RootScope.prototype.helper = function (typ,value){
			// log "add helper",typ,value
			if (this._helpers.indexOf(value) == -1) {
				this._helpers.push(value);
				this._head.unshift(value);
			};
			
			return this;
		};
		
		RootScope.prototype.head = function (){
			return this._head;
		};
		
		RootScope.prototype.warn = function (data){
			// hacky
			data.node = null;
			this._warnings.push(data);
			return this;
		};
		
		RootScope.prototype.dump = function (){
			var obj = {warnings: dump__(this._warnings)};
			
			if (OPTS.analysis.scopes) {
				var scopes = this._scopes.map(function(s) { return s.dump(); });
				scopes.unshift(RootScope.__super__.dump.call(this));
				obj.scopes = scopes;
			};
			
			if (OPTS.analysis.entities) {
				obj.entities = this._entities;
			};
			
			return obj;
		};
		
		
		function ClassScope(){ return Scope.apply(this,arguments) };
		
		subclass$(ClassScope,Scope);
		exports.ClassScope = ClassScope; // export class 
		ClassScope.prototype.namepath = function (){
			return this._node.namepath();
		};
		
		
		// called for scopes that are not real scopes in js
		// must ensure that the local variables inside of the scopes do not
		// collide with variables in outer scopes -- rename if needed
		ClassScope.prototype.virtualize = function (){
			// console.log "virtualizing ClassScope"
			var up = this.parent();
			for (var o = this._varmap, i = 0, keys = Object.keys(o), l = keys.length; i < l; i++){
				true;
				o[keys[i]].resolve(up,true); // force new resolve
			};
			return this;
		};
		
		ClassScope.prototype.isClosed = function (){
			return true;
		};
		
		function TagScope(){ return ClassScope.apply(this,arguments) };
		
		subclass$(TagScope,ClassScope);
		exports.TagScope = TagScope; // export class 
		
		
		function ClosureScope(){ return Scope.apply(this,arguments) };
		
		subclass$(ClosureScope,Scope);
		exports.ClosureScope = ClosureScope; // export class 
		
		
		function FunctionScope(){ return Scope.apply(this,arguments) };
		
		subclass$(FunctionScope,Scope);
		exports.FunctionScope = FunctionScope; // export class 
		
		
		function MethodScope(){ return Scope.apply(this,arguments) };
		
		subclass$(MethodScope,Scope);
		exports.MethodScope = MethodScope; // export class 
		MethodScope.prototype.isClosed = function (){
			return true;
		};
		
		function LambdaScope(){ return Scope.apply(this,arguments) };
		
		subclass$(LambdaScope,Scope);
		exports.LambdaScope = LambdaScope; // export class 
		LambdaScope.prototype.context = function (){
			
			// when accessing the outer context we need to make sure that it is cached
			// so this is wrong - but temp okay
			return this._context || (this._context = this.parent().context().reference(this));
		};
		
		function FlowScope(){ return Scope.apply(this,arguments) };
		
		subclass$(FlowScope,Scope);
		exports.FlowScope = FlowScope; // export class 
		FlowScope.prototype.params = function (){
			if (this._parent) { return this._parent.params() };
		};
		
		FlowScope.prototype.register = function (name,decl,o){
			var found;
			if(decl === undefined) decl = null;
			if(o === undefined) o = {};
			if (o.type != 'let' && (this.closure() != this)) {
				if (found = this.lookup(name)) {
					if (found.type() == 'let') {
						this.p(("" + name + " already exists as a block-variable " + decl));
						// TODO should throw error instead
						if (decl) { decl.warn("Variable already exists in block") };
						// root.warn message: "Holy shit"
					};
				};
				
				return this.closure().register(name,decl,o);
			} else {
				return FlowScope.__super__.register.call(this,name,decl,o);
			};
		};
		
		// FIXME should override temporary as well
		
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
		
		function CatchScope(){ return FlowScope.apply(this,arguments) };
		
		subclass$(CatchScope,FlowScope);
		exports.CatchScope = CatchScope; // export class 
		
		
		function WhileScope(){ return FlowScope.apply(this,arguments) };
		
		subclass$(WhileScope,FlowScope);
		exports.WhileScope = WhileScope; // export class 
		WhileScope.prototype.autodeclare = function (variable){
			return this.vars().push(variable);
		};
		
		function ForScope(){ return FlowScope.apply(this,arguments) };
		
		subclass$(ForScope,FlowScope);
		exports.ForScope = ForScope; // export class 
		ForScope.prototype.autodeclare = function (variable){
			return this.vars().push(variable);
		};
		
		function IfScope(){ return FlowScope.apply(this,arguments) };
		
		subclass$(IfScope,FlowScope);
		exports.IfScope = IfScope; // export class 
		IfScope.prototype.temporary = function (refnode,o,name){
			if(o === undefined) o = {};
			if(name === undefined) name = null;
			return this.parent().temporary(refnode,o,name);
		};
		
		function BlockScope(){ return FlowScope.apply(this,arguments) };
		
		subclass$(BlockScope,FlowScope);
		exports.BlockScope = BlockScope; // export class 
		BlockScope.prototype.temporary = function (refnode,o,name){
			if(o === undefined) o = {};
			if(name === undefined) name = null;
			return this.parent().temporary(refnode,o,name);
		};
		
		BlockScope.prototype.region = function (){
			return this.node().region();
		};
		
		// lives in scope -- really a node???
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
			this._assignments = [];
			this;
		};
		
		subclass$(Variable,Node);
		exports.Variable = Variable; // export class 
		Variable.prototype.scope = function(v){ return this._scope; }
		Variable.prototype.setScope = function(v){ this._scope = v; return this; };
		Variable.prototype.name = function(v){ return this._name; }
		Variable.prototype.setName = function(v){ this._name = v; return this; };
		Variable.prototype.alias = function(v){ return this._alias; }
		Variable.prototype.setAlias = function(v){ this._alias = v; return this; };
		Variable.prototype.type = function(v){ return this._type; }
		Variable.prototype.setType = function(v){ this._type = v; return this; };
		Variable.prototype.options = function(v){ return this._options; }
		Variable.prototype.setOptions = function(v){ this._options = v; return this; };
		Variable.prototype.initialized = function(v){ return this._initialized; }
		Variable.prototype.setInitialized = function(v){ this._initialized = v; return this; };
		Variable.prototype.declared = function(v){ return this._declared; }
		Variable.prototype.setDeclared = function(v){ this._declared = v; return this; };
		Variable.prototype.declarator = function(v){ return this._declarator; }
		Variable.prototype.setDeclarator = function(v){ this._declarator = v; return this; };
		Variable.prototype.autodeclare = function(v){ return this._autodeclare; }
		Variable.prototype.setAutodeclare = function(v){ this._autodeclare = v; return this; };
		Variable.prototype.references = function(v){ return this._references; }
		Variable.prototype.setReferences = function(v){ this._references = v; return this; };
		Variable.prototype.export = function(v){ return this._export; }
		Variable.prototype.setExport = function(v){ this._export = v; return this; };
		
		Variable.prototype.pool = function (){
			return null;
		};
		
		Variable.prototype.closure = function (){
			return this._scope.closure();
		};
		
		Variable.prototype.assignments = function (){
			return this._assignments;
		};
		
		// Here we can collect lots of type-info about variables
		// and show warnings / give advice if variables are ambiguous etc
		Variable.prototype.assigned = function (val,source){
			this._assignments.push(val);
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
				item = closure.lookup(this._name);
				
				// we now need to ensure that this variable is unique inside
				// the whole closure.
				scope = closure;
			};
			
			if (item == this) {
				scope.varmap()[this._name] = this;
				return this;
			} else if (item) {
				// possibly redefine this inside, use it only in this scope
				// if the item is defined in an outer scope - we reserve the
				if (item.scope() != scope && (this.options().let || this._type == 'let')) {
					scope.varmap()[this._name] = this;
				};
				
				// different rules for different variables?
				if (this._options.proxy) {
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
		};
		
		Variable.prototype.reference = function (){
			return this;
		};
		
		Variable.prototype.node = function (){
			return this;
		};
		
		Variable.prototype.traverse = function (){
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
			if (this._c) { return this._c };
			// options - proxy??
			if (this._proxy) {
				this._c = this._proxy[0].c() + '[' + this._proxy[1].c() + ']';
			} else {
				if (!this._resolved) this.resolve();
				var v = (this.alias() || this.name());
				this._c = typeof v == 'string' ? (v) : (v.c());
				// allow certain reserved words
				// should warn on others though (!!!)
				// if @c == 'new'
				// 	@c = '_new'
				// 	# should happen at earlier stage to
				// 	# get around naming conventions
				if (RESERVED_REGEX.test(this._c)) { this._c = ("" + this.c() + "$") }; // @c.match(/^(default)$/)
			};
			return this._c;
		};
		
		// variables should probably inherit from node(!)
		Variable.prototype.consume = function (node){
			return this;
		};
		
		// this should only generate the accessors - not dael with references
		Variable.prototype.accessor = function (ref){
			var node = new LocalVarAccess(".",null,this);
			// this is just wrong .. should not be a regular accessor
			// @references.push([ref,el]) if ref # weird temp format
			return node;
		};
		
		Variable.prototype.assignment = function (val){
			return new Assign('=',this,val);
		};
		
		Variable.prototype.addReference = function (ref){
			if (ref instanceof Identifier) {
				ref.references(this);
			};
			
			if (ref.region && ref.region()) {
				this._references.push(ref);
			};
			
			return this;
		};
		
		Variable.prototype.autodeclare = function (){
			if (this._declared) { return this };
			this._autodeclare = true;
			this.scope().autodeclare(this);
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
			
			return {
				type: this.type(),
				name: name,
				refs: dump__(this._references,typ)
			};
		};
		
		
		function SystemVariable(){ return Variable.apply(this,arguments) };
		
		subclass$(SystemVariable,Variable);
		exports.SystemVariable = SystemVariable; // export class 
		SystemVariable.prototype.pool = function (){
			return this._options.pool;
		};
		
		// weird name for this
		SystemVariable.prototype.predeclared = function (){
			this.scope().vars().remove(this);
			return this;
		};
		
		SystemVariable.prototype.resolve = function (){
			var alias, v_;
			if (this._resolved || this._name) { return this };
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
				while (!this._name){
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
			
			while (!this._name && (alt = names.pop())){
				if (!scope.lookup(alt)) { this._name = alt };
			};
			
			if (!this._name && this._declarator) {
				if (node = this.declarator().node()) {
					if (alias = node.alias()) { names.push(alias + "_") };
				};
			};
			
			while (!this._name && (alt = names.pop())){
				if (!scope.lookup(alt)) { this._name = alt };
			};
			
			this._name || (this._name = ("$" + (scope.setCounter(v_ = scope.counter() + 1),v_)));
			scope.varmap()[this._name] = this;
			return this;
		};
		
		SystemVariable.prototype.name = function (){
			this.resolve();
			return this._name;
		};
		
		
		function ScopeContext(scope,value){
			this._scope = scope;
			this._value = value;
			this._reference = null;
			this;
		};
		
		subclass$(ScopeContext,Node);
		exports.ScopeContext = ScopeContext; // export class 
		ScopeContext.prototype.scope = function(v){ return this._scope; }
		ScopeContext.prototype.setScope = function(v){ this._scope = v; return this; };
		ScopeContext.prototype.value = function(v){ return this._value; }
		ScopeContext.prototype.setValue = function(v){ this._value = v; return this; };
		ScopeContext.prototype.reference = function(v){ return this._reference; }
		ScopeContext.prototype.setReference = function(v){ this._reference = v; return this; };
		
		ScopeContext.prototype.namepath = function (){
			return this._scope.namepath();
		};
		
		// instead of all these references we should probably
		// just register when it is accessed / looked up from
		// a deeper function-scope, and when it is, we should
		// register the variable in scope, and then start to
		// use that for further references. Might clean things
		// up for the cases where we have yet to decide the
		// name of the variable etc?
		
		ScopeContext.prototype.reference = function (){
			// should be a special context-variable!!!
			return this._reference || (this._reference = this.scope().declare("self",new This()));
		};
		
		ScopeContext.prototype.c = function (){
			var val = this._value || this._reference;
			return val ? (val.c()) : ("this");
		};
		
		ScopeContext.prototype.cache = function (){
			return this;
		};
		
		function RootScopeContext(){ return ScopeContext.apply(this,arguments) };
		
		subclass$(RootScopeContext,ScopeContext);
		exports.RootScopeContext = RootScopeContext; // export class 
		RootScopeContext.prototype.c = function (o){
			// return "" if o and o:explicit
			var val = this._value || this._reference;
			return (val && val != this) ? (val.c()) : ("this");
			// should be the other way around, no?
			// o and o:explicit ? super : ""
		};
		
		function Super(){ return Node.apply(this,arguments) };
		
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
			if (false) {
				out = ("" + (m.target().c()) + ".superclass");
				if (!deep) { out += (".apply(" + (m.scope().context().c()) + ",arguments)") };
			} else {
				out = ("" + (m.target().c()) + ".__super__");
				if (!((up instanceof Access))) {
					out += ("." + c__(m.supername()));
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
		module.exports.RESERVED_REGEX = RESERVED_REGEX = /^(default|native|enum|with|new|char)$/;
		
		module.exports.UNION = UNION = new Const('union$');
		module.exports.INTERSECT = INTERSECT = new Const('intersect$');
		module.exports.CLASSDEF = CLASSDEF = new Const('imba$class');
		module.exports.TAGDEF = TAGDEF = new Const('Imba.TAGS.define');
		return module.exports.NEWTAG = NEWTAG = new Identifier("tag$");
		
		
		
		
		
		
		
		
		
		

	})();

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	(function(){
		function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
		
		var path = __webpack_require__(9);
		var util = __webpack_require__(2);
		
		function SourceMap(source){
			this._source = source;
			this._maps = [];
			this._map = "";
			this._js = "";
		};
		
		exports.SourceMap = SourceMap; // export class 
		SourceMap.prototype.source = function (){
			return this._source;
		};
		
		SourceMap.prototype.options = function (){
			return this._source;
		};
		
		SourceMap.prototype.filename = function (){
			return this.options().options.filename;
		};
		
		SourceMap.prototype.sourceCode = function (){
			return this.options().options._source;
		};
		
		SourceMap.prototype.targetPath = function (){
			return this.options().options.targetPath;
		};
		
		SourceMap.prototype.sourcePath = function (){
			return this.options().options.sourcePath;
		};
		
		SourceMap.prototype.sourceName = function (){
			return path.basename(this.sourcePath());
		};
		
		SourceMap.prototype.targetName = function (){
			return path.basename(this.targetPath());
		};
		
		
		SourceMap.prototype.sourceFiles = function (){
			return [this.sourceName()];
		};
		
		SourceMap.prototype.parse = function (){
			var self = this;
			var matcher = /\%\$(\d*)\$\%/;
			var replacer = /^(.*?)\%\$(\d*)\$\%/;
			var lines = this.options().js.split(/\n/g); // what about js?
			// return self
			var locmap = util.locationToLineColMap(this.sourceCode());
			this._maps = [];
			
			// console.log options:js
			
			var match;
			// split the code in lines. go through each line 
			// go through the code looking for LOC markers
			// remove markers along the way and keep track of
			// console.log source:js
			
			for (var i = 0, ary = iter$(lines), len = ary.length, line; i < len; i++) {
				// could split on these?
				line = ary[i];
				var col = 0;
				var caret = 0;
				
				this._maps[i] = [];
				while (line.match(matcher)){
					line = line.replace(replacer,function(m,pre,loc) {
						var lc = locmap[parseInt(loc)];
						caret = pre.length;
						var mapping = [[lc[0],lc[1]],[i,caret]]; // source and output
						self._maps[i].push(mapping);
						return pre;
					});
				};
				lines[i] = line;
			};
			
			
			self.source().js = lines.join('\n');
			return self;
		};
		
		SourceMap.prototype.generate = function (){
			this.parse();
			
			var lastColumn = 0;
			var lastSourceLine = 0;
			var lastSourceColumn = 0;
			var buffer = "";
			
			for (var lineNumber = 0, ary = iter$(this._maps), len = ary.length; lineNumber < len; lineNumber++) {
				lastColumn = 0;
				
				for (var nr = 0, items = iter$(ary[lineNumber]), len_ = items.length, map1; nr < len_; nr++) {
					map1 = items[nr];
					if (nr != 0) { buffer += ',' };
					var src = map1[0];
					var dest = map1[1];
					
					buffer += this.encodeVlq(dest[1] - lastColumn);
					lastColumn = dest[1];
					// add index
					buffer += this.encodeVlq(0);
					
					// The starting line in the original source, relative to the previous source line.
					buffer += this.encodeVlq(src[0] - lastSourceLine);
					lastSourceLine = src[0];
					// The starting column in the original source, relative to the previous column.
					buffer += this.encodeVlq(src[1] - lastSourceColumn);
					lastSourceColumn = src[1];
				};
				
				buffer += ";";
			};
			
			
			var rel = path.relative(path.dirname(this.targetPath()),this.sourcePath());
			
			var map = {
				version: 3,
				file: this.sourceName().replace(/\.imba/,'.js') || '',
				sourceRoot: this.options().sourceRoot || '',
				sources: [rel],
				sourcesContent: [this.sourceCode()],
				names: [],
				mappings: buffer
			};
			
			// source:sourcemap = sourcemap
			// var base64 = Buffer.new(JSON.stringify(map)).toString("base64")
			// source:js += "\n//# sourceMappingURL=data:application/json;base64,{base64}"
			return map;
		};
		
		VLQ_SHIFT = 5;
		VLQ_CONTINUATION_BIT = 1 << VLQ_SHIFT;
		VLQ_VALUE_MASK = VLQ_CONTINUATION_BIT - 1;
		BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
		
		// borrowed from CoffeeScript
		SourceMap.prototype.encodeVlq = function (value){
			var answer = '';
			// Least significant bit represents the sign.
			var signBit = value < 0 ? (1) : (0);
			var nextChunk;
			// The next bits are the actual value.
			var valueToEncode = (Math.abs(value) << 1) + signBit;
			// Make sure we encode at least one character, even if valueToEncode is 0.
			while (valueToEncode || !answer){
				nextChunk = valueToEncode & VLQ_VALUE_MASK;
				valueToEncode = valueToEncode >> VLQ_SHIFT;
				if (valueToEncode) {
					nextChunk |= VLQ_CONTINUATION_BIT;
				};
				
				answer += this.encodeBase64(nextChunk);
			};
			
			return answer;
		};
		
		SourceMap.prototype.encodeBase64 = function (value){
			return BASE64_CHARS[value]; // or throw Error.new("Cannot Base64 encode value: {value}")
		};
		return SourceMap;
		
		

	})();

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
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

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10)))

/***/ },
/* 10 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
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

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }
/******/ ]);