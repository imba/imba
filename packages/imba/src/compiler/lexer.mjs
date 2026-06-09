import * as T from './token.mjs';
import { INVERSES as INVERSES } from './constants.mjs';
import { Compilation } from './compilation.mjs';
import * as ERR from './errors.mjs';
import * as helpers from './helpers.mjs';
function len$(a){
	return a && (a.len instanceof Function ? a.len() : a.length) || 0;
};
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
function map$(list){
	var map = Object.create(null);
	for (let i = 0, items = iter$(list), len = items.length; i < len; i++) {
		map[items[i]] = 1;
	};
	return map;
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

// imba$inlineHelpers=1
// imba$v2=0

var Token = T.Token;

var K = 0;

// Constants
// ---------

// Keywords that Imba shares in common with JavaScript.
var JS_KEYWORDS = [
	'true','false','null','this',
	'delete','typeof','in','instanceof',
	'throw','break','continue','debugger',
	'if','else','switch','for','while','do','try','catch','finally',
	'class','extends','super','return','yield'
];

var TSC_CARET_BEFORE = {
	',': 1,
	'\n': 1,
	')': 1,
	']': 1,
	'}': 1,
	'>': 1,
	' ': 1
};

var TYPE_GENERICS_AFTER = /\w|\]|\)$/;

// new can be used as a keyword in imba, since object initing is done through
// MyObject.new. new is a very useful varname.

// We want to treat return like any regular call for now
// Must be careful to throw the exceptions in AST, since the parser
// wont

// Imba-only keywords. var should move to JS_Keywords
// some words (like tokid) should be context-specific
var IMBA_KEYWORDS = [
	'undefined','then','unless','until','loop','of','by',
	'when','def','tag','do','elif','begin','var','let','const','await','import','module','export','static','extend','yield'
];

var IMBA_CONTEXTUAL_KEYWORDS = ['extend','local','global','prop'];

var CONTEXTUAL_KEYWORDS = {
	LET: {'global': 1,'declare': 1,static: 1},
	CONST: {'global': 1,'declare': 1,static: 1},
	VAR: {'global': 1,'declare': 1,static: 1},
	CLASS: {'global': 1,'declare': 1,static: 1,extend: 1,strict: 1,abstract: 1,mixin: 1},
	MIXIN: {'global': 1,'declare': 1,extend: 1,strict: 1,abstract: 1},
	INTERFACE: {'global': 1,'declare': 1,extend: 1,strict: 1,mixin: 1},
	TAG: {'global': 1,'declare': 1,'local': 1,extend: 1,strict: 1,abstract: 1},
	DEF: {'global': 1,'declare': 1,protected: 1},
	PROP: {'static': 1},
	ATTR: {'static': 1},
	CSS: {'global': 1,export: 1}
};

var MEMBER_KEYWORDS = {
	DEF: 1,
	PROP: 1,
	ATTR: 1
};

// FixedArray for performance
// var ALL_KEYWORDS = JS_KEYWORDS.concat(IMBA_KEYWORDS)
var ALL_KEYWORDS = [
	'true','false','null','this','self',
	'delete','typeof','in','instanceof',
	'throw','break','continue','debugger',
	'if','else','switch','for','while','do','try','catch','finally',
	'class','extends','super','return',
	'undefined','then','unless','until','loop','of','by',
	'when','def','tag','do','elif','begin','var','let','const','await','import',
	'and','or','is','isnt','not','yes','no','isa','case','nil','module','export','static','extend',
	'yield'
];
var ALL_KEYWORDS_MAP = map$(ALL_KEYWORDS);
var KEYWORD_CANDIDATE_MAP = map$(ALL_KEYWORDS.concat(['mixin','guard','alter','watch','css','interface','attr','prop','get','set','constructor','declare']));
var SPECIAL_IDENTIFIER_MAP = map$(['default','type','from','as','new','arguments']);

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
var IDENTIFIER = /^((\$|##|#|@@|@|\%)[\$\wA-Za-z_\-\x7f-\uffff][$\w\x7f-\uffff]*(\-[$\w\x7f-\uffff]+)*[\?]?|[$A-Za-z_][$\w\x7f-\uffff]*(\-[$\w\x7f-\uffff]+)*[\?]?)([^\n\S]*:)?/;

var IMPORTS = /^import\s+(\{?[^\"\'\}]+\}?)(?=\s+from\s+)/;

var OBJECT_KEY = /^((\$?)[$A-Za-z_\x7f-\uffff\-][$\w\x7f-\uffff\-]*)([^\n\S\s]*:(?![\*\=:$A-Za-z\_\x7f-\uffff]))/;

var TAG = /^(\<)(?=[A-Za-z\#\.\%\$\[\{\@\>\(])/;

var TAG_TYPE = /^(\w[\w\d]*:)?(\w[\w\d]*)(-[\w\d]+)*/;
var TAG_ID = /^#((\w[\w\d]*)(-[\w\d]+)*)/;
var TAG_PART = /^[\:\.\#]?([A-Za-z\_][\w\-]*)(\:[A-Za-z\_][\w\-]*)?/;
var TAG_ATTR = /^([\.\:]?[\w\_]+([\-\:\.][\w]+)*)(\s)*\=(?!\>)/;

var SELECTOR = /^([%\$]{1,2})([\(])/;
var SELECTOR_PART = /^(\#|\.|:|::)?([\w]+(\-[\w]+)*)/;
var SELECTOR_COMBINATOR = /^ (\+|\>|\~)*\s*(?=[\w\.\#\:\{\*\[])/;

var SELECTOR_PSEUDO_CLASS = /^(::?)([\w]+(\-[\w]+)*)/;
var SELECTOR_ATTR_OP = /^(\$=|\~=|\^=|\*=|\|=|=|\!=)/;
var SELECTOR_ATTR = /^\[([\w\_\-]+)(\$=|\~=|\^=|\*=|\|=|=|\!=)/;

var SYMBOL = /^\:((([\*\@$\w\x7f-\uffff]+)+([\-\\\:][\w\x7f-\uffff]+)*)|==|\<=\>)/;

var STYLE_HEX = /^\#[\w\-]+/;

var STYLE_NUMERIC = /^(\-?\d*\.?\d+)([A-Za-z]+|\%)?(?![\d\w])/;

var STYLE_IDENTIFIER = /^[\w\-\$]*\w[\w\-\$]*/;

var STYLE_URL = /^url\(([^\)]*)\)/;

var STYLE_PROPERTY = /^(\^?[\w\-\$\@\.\!\#\^]+)(?=\:([^\:]|$)|\s*\=)/;

var STYLE_MODIFIERS = /^(\@?[\w\-\$]*\w[\w\-\$]*)([\.\@][\w\-\$]*\w[\w\-\$]*)*(\@[\w\-\$]*\w[\w\-\$]*)*(?=\:)/;

var isStyleWordCode = function(code) {
	return (code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code == 95;
};

var isStylePropertyCode = function(code) {
	return isStyleWordCode(code) || code == 45 || code == 36 || code == 64 || code == 46 || code == 33 || code == 35 || code == 94;
};

var isStyleSpaceCode = function(code) {
	return (code >= 9 && code <= 13) || code == 32 || code == 160 || code == 5760 || code == 65279 || code == 8232 || code == 8233 || code == 8239 || code == 8287 || code == 12288 || (code >= 8192 && code <= 8202);
};

var stylePropertyLengthAt = function(str,start) {
	if(start === undefined) start = 0;
	var i = start;
	var len = str.length;
	while (i < len && isStylePropertyCode(str.charCodeAt(i))) {
		i++;
	};
	if (i == start) { return 0 };
	if (str.charCodeAt(i) == 58 && str.charCodeAt(i + 1) != 58) {
		return i - start;
	};
	var j = i;
	while (j < len && isStyleSpaceCode(str.charCodeAt(j))) {
		j++;
	};
	return str.charCodeAt(j) == 61 ? i - start : 0;
};

var canStartStyleSelector = function(str,chr) {
	var code = chr.charCodeAt(0);
	if (isStyleWordCode(code) || code == 94 || code == 37 || code == 42 || code == 38 || code == 36 || code == 62 || code == 47 || code == 46 || code == 91 || code == 64 || code == 33) {
		return true;
	};
	if (code == 35) {
		let next = str.charCodeAt(1);
		return isStyleWordCode(next) || next == 45;
	};
	return code == 58 && str.charCodeAt(1) == 58;
};

var NUMBER = /^0x[\da-f_]+|^0b[01_]+|^0o[\d_]+|^[\-]?(?:\d[_\d]*)\.?\d[_\d]*(?:e[+-]?\d+)?|^[\-]?\d*\.?\d+(?:e[+-]?\d+)?/i;

var HEREDOC = /^("""|''')([\s\S]*?)(?:\n[^\n\S]*)?\1/;

var OPERATOR = /^(?:[-=]=>|!&(?=[\s\n])|[&|~^]?=\?|[&|~^]=|\?\?=|===|---|->|=>|\/>|!==|\*\*=?|[-+*\/%<>&|^!?=]=|=<|>>>=?|([-+:])\1|([&|<>])\2=?|\?\.|\?\?|\.{2,3}|\*(?=[a-zA-Z\_]))/;

// FIXME splat should only be allowed when the previous thing is spaced or inside call?

var WHITESPACE = /^[^\n\S]+/;

var COMMENT = /^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)/;
var JS_COMMENT = /^\/\*([\s\S]*?)\*\//;
// var INLINE_COMMENT = /^(\s*)((#[ \t\!]||\/\/)(.*)|#[ \t]?(?=\n|$))+/
var INLINE_COMMENT = /^(\s*)((#[ \t\!]|\/\/(?!\/))(.*)|#[ \t]?(?=\n|$))+/;

var CODE = /^[-=]=>/;

var MULTI_DENT = /^(?:\n[^\n\S]*)+/;

var SIMPLESTR = /^'[^\\']*(?:\\.[^\\']*)*'/;

var JSTOKEN = /^`[^\\`]*(?:\\.[^\\`]*)*`/;

// Regex-matching-regexes.
var REGEX = /^(\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)([a-z]{0,8})(?!\w)/;

var HEREGEX = /^\/{3}([\s\S]+?)\/{3}([a-z]{0,8})(?!\w)/;

var HEREGEX_OMIT = /\s+(?:#.*)?/g;

// Token cleaning regexes.
var MULTILINER = /\n/g;

var HEREDOC_INDENT = /\n+([^\n\S]*)/g;

var HEREDOC_ILLEGAL = /\*\//;

// expensive?
var LINE_CONTINUER = /^\s*(?:,|\??\.(?![.\d])|(?:&&|\|\||and|or)[\n\s])/;

var TRAILING_SPACES = /\s+$/;

var ENV_FLAG = /^\$\w+\$/;

var ARGVAR = /^\$\d$/;

// Compound assignment tokens.
var COMPOUND_ASSIGN = [
	'-=','+=','/=','*=','%=','||=','&&=','?=','??=',
	'<<=','>>=','>>>=','&=','^=','|=','~=','=<','**=',
	'=?','~=?','|=?','&=?','^=?'
];
var COMPOUND_ASSIGN_MAP = map$(COMPOUND_ASSIGN);

// Unary tokens.
var UNARY = ['!','~','NEW','TYPEOF','DELETE'];
var UNARY_MAP = map$(UNARY);

// Logical tokens.
var LOGIC = ['&&','||','??','and','or'];
var LOGIC_MAP = map$(LOGIC);

// Bit-shifting tokens.
var SHIFT = ['<<','>>','>>>'];
var SHIFT_MAP = map$(SHIFT);

// Comparison tokens.
var COMPARE = ['===','!==','==','!=','<','>','<=','>=','===','!==','&','|','^','!&'];
var COMPARE_MAP = map$(COMPARE);

// Mathematical tokens.
var MATH = ['*','/','%','∪','∩','√'];
var MATH_MAP = map$(MATH);

// Relational tokens that are negatable with `not` prefix.
var RELATION = ['IN','OF','INSTANCEOF','ISA'];
var RELATION_MAP = map$(RELATION);

// Boolean tokens.
var BOOL = ['TRUE','FALSE','NULL','UNDEFINED'];

// Our list is shorter, due to sans-parentheses method calls.
var NOT_REGEX = ['NUMBER','REGEX','BOOL','TRUE','FALSE','++','--',']'];
var NOT_REGEX_MAP = map$(NOT_REGEX);

// If the previous token is not spaced, there are more preceding tokens that
// force a division parse:
var NOT_SPACED_REGEX = ['NUMBER','REGEX','BOOL','TRUE','FALSE','++','--',']',')','}','THIS','SELF','IDENTIFIER','STRING'];
var NOT_SPACED_REGEX_MAP = map$(NOT_SPACED_REGEX);

// Tokens which could legitimately be invoked or indexed. An opening
// parentheses or bracket following these tokens will be recorded as the start
// of a function invocation or indexing operation.
// really?!

var UNFINISHED = ['\\','.','UNARY','MATH','EXP','+','-','SHIFT','RELATION','COMPARE','THROW','EXTENDS'];
var UNFINISHED_MAP = map$(UNFINISHED);

// } should not be callable anymore!!! '}', '::',
var CALLABLE = ['IDENTIFIER','SYMBOLID','STRING','REGEX',')',']','INDEX_END','THIS','SUPER','TAG_END','IVAR','SELF','NEW','ARGVAR','SYMBOL','RETURN','INDEX_END','CALL_END','DECORATOR','@','GENERICS'];
var CALLABLE_MAP = map$(CALLABLE);

// optimize for FixedArray
var INDEXABLE = [
	'IDENTIFIER','SYMBOLID','STRING','REGEX',')',']','THIS','SUPER','TAG_END','IVAR','SELF','NEW','ARGVAR','SYMBOL','RETURN','BANG',
	'NUMBER','BOOL','TAG_SELECTOR','ARGUMENTS','}','TAG_TYPE','TAG_REF','INDEX_END','CALL_END','DO_VALUE'
];
var INDEXABLE_MAP = map$(INDEXABLE);

var NOT_KEY_AFTER = ['.','?','?.','UNARY','??','+','-','*'];

var GLOBAL_IDENTIFIERS = ['global','exports'];

// Tokens that, when immediately preceding a `WHEN`, indicate that the `WHEN`
// occurs at the start of a line. We disambiguate these from trailing whens to
// avoid an ambiguity in the grammar.
var LINE_BREAK = ['INDENT','OUTDENT','TERMINATOR'];
var LINE_BREAK_MAP = map$(LINE_BREAK);

var DECLARE_START_MAP = map$(['INDENT','TERMINATOR','DECORATOR']);
var TAG_DECLARATION_START_MAP = map$(['INDENT','OUTDENT','TERMINATOR','EXPORT','DEFAULT','DECLARE','GLOBAL','LOCAL','EXTEND','ABSTRACT','STRICT','DECORATOR']);
var TAG_DECLARATION_PREFIX_MAP = map$(['global','declare','local','extend','abstract','strict']);
var PROPERTY_ACCESS_PREV_MAP = map$(['IDENTIFIER',')','}',']','NUMBER']);
var SYMBOL_STRING_PREV_MAP = map$(['(','[','=']);
var SPLAT_PREV_VALUE_MAP = map$([',','(','[','{','|','\n','\t']);
var AMPER_REF_TIGHT_TOKENS = map$(['COMPARE','.','(','[']);

function LexerError(message,file,line){
	this.message = message;
	this.file = file;
	this.line = line;
	return this;
};
subclass$(LexerError,SyntaxError);



var last = function(array,back) {
	if(back === undefined) back = 0;
	return array[array.length - back - 1];
};

var countLineBreaks = function(str) {
	var count = 0;
	for (let i = 0, len = str.length; i < len; i++) {
		if (str.charCodeAt(i) == 10) count++;
	};
	return count;
};

var repeatString = function(str,times) {
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


Lexer.prototype.reset = function (){
	this._code = null;
	this._chunk = null; // The remainder of the source code.
	this._opts = null;
	this._state = {};
	
	this._indent = 0; // The current indentation level.
	this._indebt = 0; // The over-indentation at the current level.
	this._outdebt = 0; // The under-outdentation at the current level.
	
	this._indents = []; // The stack of all current indentation levels.
	this._ends = []; // The stack for pairing up tokens.
	this._contexts = []; // suplements @ends
	this._scopes = [];
	this._nextScope = null; // the scope to add on the next indent
	this._context = null;
	// should rather make it like a statemachine that moves from CLASS_DEF to CLASS_BODY etc
	// Things should compile differently when you are in a CLASS_BODY than when in a DEF_BODY++
	
	this._indentStyle = '\t';
	this._inTag = false;
	this._inStyle = 0;
	
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
	this._script = null;
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

Lexer.prototype.tokenize = function (code,o,script){
	
	var m;
	if(script === undefined) script = null;
	if (code.length == 0) {
		return [];
	};
	
	if (!o.inline) {
		if (WHITESPACE.test(code)) {
			code = ("\n" + code);
			if (code.match(/^\s*$/g)) { return [] };
		};
		
		if (code.indexOf('\r') >= 0) {
			code = code.replace(/\r/g,'');
		};
		let lastCode = code.charCodeAt(code.length - 1);
		if (lastCode == 9 || lastCode == 32) {
			code = code.replace(/[\t ]+$/g,'');
		};
	};
	
	this._last = null;
	this._lastTyp = null;
	this._lastVal = null;
	
	this._script = script;
	this._code = code;
	this._opts = o;
	this._locOffset = o.loc || 0;
	this._platform = o.platform || o.target;
	this._indentStyle = '\t';
	
	// if the very first line is indented, take this as a gutter
	if (m = code.match(/^([\ \t]*)[^\n\s\t]/)) {
		this._state.gutter = m[1];
	};
	
	if (o.gutter !== undefined) {
		this._state.gutter = o.gutter;
	};
	
	if (this._script && !o.inline) {
		this._script.tokens = this._tokens;
	};
	
	this.parse(code);
	if (!o.inline) this.closeIndentation();
	
	
	
	if (this._ends.length) {
		this.error(("missing " + (this._ends.pop())));
	};
	
	if (this._platform == 'tsc') {
		for (let i = 0, items = iter$(this._tokens), len = items.length, token; i < len; i++) {
			token = items[i];
			if (token._type == 'SYMBOLID') {
				token._type = 'IDENTIFIER';
				// token.@value = token.@value.replace(/#/g,'_$SYM$_')
			};
		};
	};
	
	return this._tokens;
};

Lexer.prototype.parse = function (code){
	var i = 0;
	var pi = 0;
	
	this._loc = this._locOffset + i;
	
	while (this._chunk = code.slice(i)){
		let ctx = this._context;
		if (ctx && ctx.pop) {
			if (ctx.pop.test(this._chunk)) {
				this.popEnd();
			};
		};
		
		// we should let the current context decide which methods to call
		pi = (ctx && ctx.lexer && ctx.lexer.call(this)) || (this._end == 'TAG' && this.tagDefContextToken()) || (this._inTag && this.tagContextToken()) || (this._inStyle2 && this.lexStyleBody()) || this.basicContext();
		i += pi;
		this._loc = this._locOffset + i;
	};
	
	return;
};

Lexer.prototype.basicContext = function (){
	var chr = this._chunk.charAt(0);

	if (this._end == '%') {
		return this.selectorToken() || this.symbolToken() || this.identifierToken() || this.whitespaceToken() || this.lineToken() || this.commentToken() || this.heredocToken() || this.tagToken() || this.stringToken() || this.numberToken() || this.regexToken() || this.literalToken() || 0;
	};

	switch (chr) {
		case ' ':
		case '\t': {
			return this.whitespaceToken() || this.commentToken() || this.literalToken() || 0;
		}
		case '\n': {
			return this.whitespaceToken() || this.lineToken() || this.commentToken() || this.literalToken() || 0;
		}
		case '$':
		case '%': {
			return this.selectorToken() || this.identifierToken() || this.literalToken() || 0;
		}
		case '#': {
			return this.identifierToken() || this.commentToken() || this.literalToken() || 0;
		}
		case '@': {
			return this.identifierToken() || this.literalToken() || 0;
		}
		case ':': {
			return this.symbolToken() || this.literalToken() || 0;
		}
		case '"':
		case "'": {
			return this.heredocToken() || this.stringToken() || this.literalToken() || 0;
		}
		case '`': {
			return this.stringToken() || this.literalToken() || 0;
		}
		case '/': {
			return this.commentToken() || this.regexToken() || this.literalToken() || 0;
		}
		case '<': {
			return this.tagToken() || this.literalToken() || 0;
		}
		case '.':
		case '-': {
			return this.numberToken() || this.literalToken() || 0;
		}
	};

	var code = chr.charCodeAt(0);
	if ((code > 127 || code == 11 || code == 12 || code == 13) && WHITESPACE.test(this._chunk)) {
		return this.whitespaceToken() || this.commentToken() || this.literalToken() || 0;
	};

	if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122) || chr == '_') {
		return this.identifierToken() || this.literalToken() || 0;
	};

	if (code >= 48 && code <= 57) {
		return this.numberToken() || this.literalToken() || 0;
	};

	return this.literalToken() || 0;
};

Lexer.prototype.prevChars = function (n){
	if(n === undefined) n = 1;
	return (n == 1) ? this._code[this._loc - 1] : this._code.slice(this._loc - n,this._loc);
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

Lexer.prototype.pushEnd = function (val,ctx){
	let prev = this._context;
	this._ends.push(val);
	this._contexts.push(this._context = (ctx || {}));
	this._end = val;
	this.refreshScope();
	
	if (ctx && (ctx.closeType == 'STYLE_END' || ctx.style)) {
		ctx.lexer = this.lexStyleBody;
		ctx.style = true;
		this._inStyle++;
	};
	
	if (prev && prev.style && val != '}') {
		ctx.lexer = this.lexStyleBody;
		ctx.style = true;
	};
	
	if (ctx && ctx.id) {
		ctx.start = new Token(ctx.id + '_START',val,this._last.region()[1],0);
		this._tokens.push(ctx.start);
	};
	return this;
};

Lexer.prototype.popEnd = function (val){
	var popped = this._ends.pop();
	this._end = this._ends[this._ends.length - 1];
	
	// automatically adding a closer if this is defined
	var ctx = this._context;
	if (ctx && ctx.start) {
		ctx.end = new Token(ctx.closeType || ctx.id + '_END',popped,this._last.region()[1],0);
		ctx.end._start = ctx.start;
		ctx.start._end = ctx.end;
		this._tokens.push(ctx.end);
	};
	
	if (ctx && (ctx.closeType == 'STYLE_END' || ctx.style)) {
		this._inStyle--;
	};
	
	this._contexts.pop();
	this._context = this._contexts[this._contexts.length - 1];
	
	this.refreshScope();
	return [popped,ctx];
};

Lexer.prototype.refreshScope = function (){
	var ctx0 = this._ends[this._ends.length - 1];
	var ctx1 = this._ends[this._ends.length - 2];
	return this._inTag = ctx0 == 'TAG_END' || (ctx1 == 'TAG_END' && ctx0 == 'OUTDENT');
};

Lexer.prototype.queueScope = function (val){
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
		
		if (tT(prev) == 'TERMINATOR') {
			let n = this._tokens.pop();
			this.token('DEF_BODY','DEF_BODY',0);
			this._tokens.push(n);
		} else {
			this.token('DEF_BODY','DEF_BODY',0);
		};
		
		this.pair('DEF');
	};
	return;
};

Lexer.prototype.tagContextToken = function (){
	let chr = this._chunk[0];
	let chr2 = this._chunk[1];
	
	// let m = TAG_PART.exec(@chunk)
	let m = /^([A-Za-z\_\-\$\%\#][\w\-\$]*(\:[A-Za-z\_\-\$]+)*)/.exec(this._chunk); // (\:[A-Za-z\_][\w\-]*)
	
	if (m) { // and false
		let tok = m[1];
		let typ = 'TAG_LITERAL';
		let len = m[0].length;
		
		if (tok == 'self' && this._lastVal == '<') {
			typ = 'SELF';
		};
		
		if (chr == '$' && (this._lastTyp == 'TAG_TYPE' || this._lastTyp == 'TAG_START')) {
			typ = 'TAG_REF';
		};
		
		if (chr == '%') {
			typ = 'CSS_MIXIN';
		};
		
		if (chr == '#') {
			typ = 'TAG_SYMBOL_ID';
			if (tok.length == 1) {
				return 0;
			};
		};
		
		this.token(typ,tok,len);
		return len;
	};
	
	if (chr == '/' && chr2 == '>') {
		this.token("TAG_END",'/>',2);
		this.pair('TAG_END');
		return 2;
	};
	
	if (chr == '%' || chr == ':' || chr == '.' || chr == '@') {
		this.token(("T" + chr),chr,1);
		
		if (chr == '.' && (!chr2 || TSC_CARET_BEFORE[chr2]) && this._platform == 'tsc') {
			this.token('TAG_LITERAL','$CARET$',0,1);
		};
		return 1;
	} else if (chr == ' ' || chr == '\n' || chr == '\t') {
		// add whitespace inside tag
		let m = /^[\n\s\t]+/.exec(this._chunk);
		this.token('TAG_WS',m[0],m[0].length);
		return m[0].length;
	} else if (chr == '=' && this._chunk[1] != '>') {
		this.token('=','=',1);
		this.pushEnd('TAG_ATTR',{id: 'VALUE',pop: /^([\s\n\>]|\/\>)/});
		return 1;
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

Lexer.prototype.findTypeAnnotation = function (str,autoend){
	if(autoend === undefined) autoend = false;
	var stack = [];
	var i = 0;
	var replaces = [];
	var ending = /[\=\n\ \t\.\,\:\+]/;
	// could it not happen here?
	while (i < str.length){
		var chr = str.charAt(i);
		let end = stack[0];
		let instr = end == '"' || end == "'";
		
		if (chr && chr == end) {
			stack.shift();
			if (autoend && stack.length == 0) {
				i++;break;
			};
		} else if (!end && (chr == ')' || chr == ']' || chr == '}' || chr == '>')) {
			break;
		} else if (chr == '(') {
			stack.unshift(')');
		} else if (chr == '[') {
			stack.unshift(']');
		} else if (chr == '{') {
			stack.unshift('}');
		} else if (chr == '<') {
			stack.unshift('>');
		} else if (chr == '"') {
			stack.unshift('"');
		} else if (chr == "'") {
			stack.unshift("'");
		} else if (!end && ending.test(chr)) {
			break;
		};
		i++;
	};
	
	if (i == 0) { return null };
	return str.slice(0,i);
};

Lexer.prototype.findBalancedSelector = function (str){
	var stack = [];
	var i = 0;
	var replaces = [];
	// could it not happen here?
	while (i < (str.length - 1)){
		var letter = str.charAt(i);
		
		let end = stack[0];
		let instr = end == '"' || end == "'";
		
		if (letter && letter == end) {
			stack.shift();
		} else if (!instr && (letter == ')' || letter == ']' || letter == '}')) {
			console.log('out of balance!!');
			break;
		} else if (letter == '/') {
			replaces.unshift([i,1,':']);
		} else if (letter == '(' && !instr) {
			stack.unshift(')');
		} else if (letter == '[' && !instr) {
			stack.unshift(']');
		} else if (letter == '"') {
			stack.unshift('"');
		} else if (letter == "'") {
			stack.unshift("'");
		};
		
		if (!end && (letter == '=' || letter == '\n' || letter == '{')) {
			break;
		};
		
		if (!end && letter == ' ') {
			if (stylePropertyLengthAt(str,i + 1)) {
				break;
			};
			
			let after = str.slice(i + 1);
			if (INLINE_COMMENT.exec(after)) {
				break;
			};
		};
		
		// console.log 'try',letter,i,end,str.substr(i,5)
		i++;
	};
	
	if (i == 0) { return null };
	
	let sel = str.slice(0,i);
	if (replaces.length) {
		sel = sel.split('');
		for (let j = 0, len = replaces.length; j < len; j++) {
			sel.splice.apply(sel,replaces[j]);
		};
		sel = sel.join('');
	};
	
	return sel;
};

Lexer.prototype.lexStyleRule = function (offset,force){
	// when we meet = enter into style context?
	if(offset === undefined) offset = 0;
	if(force === undefined) force = false;
	let chunk = offset ? this._chunk.slice(offset) : this._chunk;
	let sel = this.findBalancedSelector(chunk);
	
	if (sel || force) {
		let len = sel ? sel.length : 0;
		this.token('CSS_SEL',sel || '',len,offset);
		let seltoken = this._last;
		let next = chunk[len];
		
		if (next == '=') {
			len++;
		};
		
		// if @context
		//	@context:lexer = null
		
		this._indents.push(1);
		this._outdebt = this._indebt = 0;
		this.token('INDENT',"1",0,1);
		this.pushEnd('OUTDENT',{lexer: this.lexStyleBody,opener: seltoken,style: true});
		this._indent++;
		return len;
	};
	
	return 0;
};

Lexer.prototype.lexStyleBody = function (){
	if (this._end == '%') { return 0 };
	// return 0
	let chr = this._chunk[0];
	var m;
	
	let styleprop = stylePropertyLengthAt(this._chunk);
	let ltyp = this._lastTyp;
	
	if (!styleprop && (ltyp == 'TERMINATOR' || ltyp == 'INDENT') && canStartStyleSelector(this._chunk,chr)) {
		let sel = this.findBalancedSelector(this._chunk);
		if (sel) { return this.lexStyleRule(0) };
	};
	
	if (styleprop) {
		// what is the last one?
		this.token('CSSPROP',this._chunk.slice(0,styleprop),styleprop);
		return styleprop;
	};
	
	if (chr[0] == '#' && (m = STYLE_HEX.exec(this._chunk))) {
		let next = this._chunk[m[0].length];
		let typ = (next == '(') ? 'COLORMIX' : 'COLOR';
		this.token(typ,m[0],m[0].length);
		return m[0].length;
	};
	
	if (chr == '/' && !this._last.spaced) {
		// console.log '!!!'
		this.token('/',chr,1);
		return 1;
	};
	
	if (m = STYLE_NUMERIC.exec(this._chunk)) {
		let len = m[0].length;
		let typ = 'NUMBER';
		
		if (m[2] == '%') {
			typ = 'PERCENTAGE';
			// if @chunk[len]
		} else if (m[2]) {
			typ = 'DIMENSION';
		};
		
		if (this._lastTyp == 'COMPARE' && !this._last.spaced) {
			true;
		};
		this.token(typ,m[0],len);
		return len;
	} else if (m = STYLE_URL.exec(this._chunk)) {
		// console.log 'matching style url',m
		let len = m[0].length;
		this.token('CSSURL',m[0],len);
		return m[0].length;
	} else if (m = STYLE_IDENTIFIER.exec(this._chunk)) {
		let id = 'CSSIDENTIFIER';
		let val = m[0];
		let len = val.length;
		if (val[0] == '-' && val[1] == '-') {
			id = 'CSSVAR';
		} else if (this._last && !this._last.spaced && (ltyp == '}' || ltyp == ')')) {
			id = 'CSSUNIT';
		};
		
		if (this._chunk[len] == '(') {
			id = 'CSSFUNCTION';
		};
		
		this.token(id,val,len);
		
		return len;
	} else if (this._last && !this._last.spaced && (ltyp == '}' || ltyp == ')') && chr == '%') {
		this.token('CSSUNIT',chr,1);
		return 1;
	};
	
	return 0;
};

Lexer.prototype.importsToken = function (){
	var match;
	if (match = IMPORTS.exec(this._chunk)) {
		this.token('IMPORTS',match[1],match[1].length,7);
		return match[0].length;
	};
	return 0;
};

Lexer.prototype.tagToken = function (){
	var match, ary;
	if (!(match = TAG.exec(this._chunk))) { return 0 };
	var ary = iter$(match);var input = ary[0],type = ary[1],identifier = ary[2];
	
	
	if (type == '<') {
		if (TYPE_GENERICS_AFTER.test(this.prevChars(1) || '')) {
			return 0;
		};
		// if @last and !@last:spaced and @lastTyp != 'TERMINATOR' and @lastTyp != 'INDENT'
		//	return 0
		
		this.token('TAG_START','<',1);
		this.pushEnd(INVERSES.TAG_START);
		
		if (match = TAG_TYPE.exec(this._chunk.substr(1,40))) {
			let next = this._chunk[match[0].length + 1];
			
			if (match[0] != 'self' && (next != '{' && next != '-')) {
				this.token('TAG_TYPE',match[0],match[0].length,1);
				return input.length + match[0].length;
			};
		} else if (this._chunk[1] == '>') {
			this.token('TAG_TYPE','fragment',0,0);
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
		var chr = this._chunk[0];
		var ctx = this._context;
		
		var i = 0;
		var part = '';
		var ending = false;
		
		while (chr = this._chunk[i++]){
			if (chr == ')' && ctx.parens == 0) {
				ending = true;
				break;
			} else if (chr == '(') {
				ctx.parens++;
				part += '(';
			} else if (chr == ')') {
				ctx.parens--;
				part += ')';
			} else if (chr == '{') {
				break;
			} else {
				part += chr;
			};
		};
		
		if (part) {
			this.token('SELECTOR_PART',part,i - 1);
		};
		if (ending) {
			this.token('SELECTOR_END',')',1,i - 1);
			this.pair('%');
			return i;
		};
		return i - 1;
	};
	
	if (!(match = SELECTOR.exec(this._chunk))) { return 0 };
	
	var ary = iter$(match);var input = ary[0],id = ary[1],kind = ary[2];
	
	// this is a closed selector
	if (kind == '(') {
		// token '(','('
		this.token('SELECTOR_START',id,id.length + 1);
		this.pushEnd('%',{parens: 0});
		return id.length + 1;
	} else if (id == '%') {
		// we are already scoped in on a selector
		if (this.context() == '%') { return 1 };
		this.token('SELECTOR_START',id,id.length);
		// this is a separate - scope. Full selector should rather be $, and keep the single selector as %
		
		this.pushEnd('%',{open: true});
		// @ends.push '%'
		// make sure a terminator breaks out
		return id.length;
	} else {
		return 0;
	};
};

Lexer.prototype.inTag = function (){
	var len = this._ends.length;
	if (len > 0) {
		var ctx0 = this._ends[len - 1];
		var ctx1 = (len > 1) ? this._ends[len - 2] : ctx0;
		return ctx0 == 'TAG_END' || (ctx1 == 'TAG_END' && ctx0 == 'OUTDENT');
	};
	return false;
};

Lexer.prototype.isKeyword = function (id,next){
	var m;
	if(next === undefined) next = '';
	if (id == 'tag') {
		return this.isTagDeclarationKeyword();
	};

	if (id == 'mixin' && (!next || next == ' ')) {
		if (MEMBER_KEYWORDS[this._lastTyp]) { return false };
		return true;
	};
	
	if (this._lastTyp == 'ATTR' || this._lastTyp == 'PROP' || this._lastTyp == 'DEF') {
		return false;
	};
	
	// hack to allow imba.when to be exported with tree-shaking
	if (id == 'when' && this._lastTyp == 'CONST') {
		return false;
	};
	
	if (id == 'get' || id == 'set') {
		if (m = this._chunk.match(/^[gs]et ([\$\w\-]+|\[)/)) { // ( (do)|\n(\t+))
			let ctx = this._contexts[this._contexts.length - 1] || {};
			let before = ctx.opener && this._tokens[this._tokens.indexOf(ctx.opener) - 1];
			
			if (this._lastTyp == 'TERMINATOR' || this._lastTyp == 'INDENT') {
				if (before && (before._type == '=' || before._type == '{')) {
					return true;
				};
			};
		};
	};
	
	if ((id == 'guard' || id == 'alter' || id == 'watch') && (this.getScope() == 'PROP')) {
		// TODO Remove
		return true;
	};
	
	if (id == 'css') {
		// experimental css inside tag trees - making css keyword everywhere
		return true;
		
		if ((this._lastTyp == 'TERMINATOR' || !this._lastTyp)) {
			return true;
		};
		
		if ((this._lastVal == 'global' || this._lastVal == 'local' || this._lastVal == 'export' || this._lastVal == 'default')) {
			return true;
		};
		
		if ((this._lastTyp == '=')) {
			return true;
		};
	};
	
	if (id == 'interface') {
		if ((this._lastVal == 'global' || this._lastVal == 'export' || this._lastVal == 'default' || this._lastVal == 'declare')) {
			return true;
		};
	};
	
	if ((id == 'attr' || id == 'prop' || id == 'get' || id == 'set' || id == 'css' || id == 'constructor' || id == 'declare')) {
		
		var scop = this.getScope();
		var incls = scop == 'CLASS' || scop == 'TAG' || scop == 'EXTEND';
		
		// if id == 'css' and !@context and (@lastTyp in ['TERMINATOR'] or !@lastTyp)
		// 	return true
		
		// if id == 'css' and (@lastVal in ['global','local','export'])
		// 	return true
		
		if (id == 'declare') {
			return incls && DECLARE_START_MAP[this._lastTyp] == 1;
		};
		
		if (id == 'constructor') {
			return incls && DECLARE_START_MAP[this._lastTyp] == 1;
		};
		
		if (incls) { return true };
	};
	
	return ALL_KEYWORDS_MAP[id] == 1;
};

Lexer.prototype.isTagDeclarationKeyword = function (){
	var ltyp = this._lastTyp;
	var lval = this._lastVal;
	var atDeclarationStart = !ltyp || TAG_DECLARATION_START_MAP[ltyp] == 1 || (ltyp == 'IDENTIFIER' && TAG_DECLARATION_PREFIX_MAP[lval] == 1);
	return atDeclarationStart && /^tag[^\n\S]+(\w[\w\d]*:)?(\w[\w\d]*)(-[\w\d]+)*/.test(this._chunk);
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
	var typ;
	
	if (!(match = IDENTIFIER.exec(this._chunk))) {
		return 0;
	};
	
	var ary = iter$(match);var input = ary[0],id = ary[1],typ = ary[2],m3 = ary[3],m4 = ary[4],colon = ary[5];
	var idlen = id.length;
	
	// What is the logic here?
	if (id === 'own' && this.lastTokenType() == 'FOR') {
		this.token('OWN',id,id.length);
		return id.length;
	};
	
	var prev = last(this._tokens);
	var lastTyp = this._lastTyp;
	
	if (lastTyp == '#') {
		this.token('IDENTIFIER',id,idlen);
		return idlen;
	};
	
	var forcedIdentifier = colon || lastTyp == '.' || lastTyp == '?.';
	
	if (colon && lastTyp == '?') { forcedIdentifier = false }; // for ternary
	
	if (!typ && !colon && (lastTyp == '.' || lastTyp == '?.')) {
		this.token('IDENTIFIER',id,idlen);
		return idlen;
	};

	if (id == 'css' && (/css\s\:\:/).exec(this._chunk)) {
		input = id + ' ';
		colon = null;
		forcedIdentifier = false;
	};
	
	var isKeyword = false;
	
	// little reason to check for this right here? but I guess it is only a simple check
	if (typ == '$' && ARGVAR.test(id)) {
		// console.log "TYP $"
		// if id == '$0'
		// 	typ = 'ARGUMENTS'
		// else
		typ = 'ARGVAR';
		id = id.substr(1);
	} else if (typ == '$' && ENV_FLAG.test(id)) {
		typ = 'ENV_FLAG';
		id = id.toUpperCase(); // .slice(1, -1)
	} else if (typ == '@') {
		if (lastTyp == '.') {
			typ = 'IDENTIFIER';
		} else {
			typ = 'DECORATOR';
		};
	} else if (typ == '#') {
		typ = 'SYMBOLID';
	} else if (typ == '##') {
		typ = 'SYMBOLID';
	} else if (typ == '%') {
		// use for something else
		let ltyp = this._lastTyp;
		if (ltyp == 'TERMINATOR' || ltyp == 'INDENT' || ltyp == 'EXPORT') {
			this.token('CSS',id,0);
			this.queueScope('CSS');
			return this.lexStyleRule(0,true);
		};
		typ = 'CSS_MIXIN';
	} else if (typ == '$' && !colon) {
		typ = 'IDENTIFIER';
	} else if (id == 'elif' && !forcedIdentifier) {
		this.token('ELSE','elif',id.length);
		this.token('IF','if');
		return id.length;
	} else {
		typ = 'IDENTIFIER';
	};
	
	if (typ == 'IDENTIFIER' && !colon && !KEYWORD_CANDIDATE_MAP[id] && !SPECIAL_IDENTIFIER_MAP[id] && lastTyp != 'CATCH' && !(lastTyp == 'IDENTIFIER' && this._lastVal == 'protected') && !((lastTyp == 'NUMBER' || lastTyp == ')') && prev && !prev.spaced) && this._end != 'IMPORT' && this._end != 'EXPORT' && lastTyp != 'IMPORT') {
		this.token('IDENTIFIER',id,idlen);
		return idlen;
	};

	var ctx0 = this._end;

	// this catches all
	if (!forcedIdentifier && KEYWORD_CANDIDATE_MAP[id] && (isKeyword = this.isKeyword(id,this._chunk[id.length]))) {
		// (id in JS_KEYWORDS or id in IMBA_KEYWORDS)
		
		if (typeof isKeyword == 'string') {
			typ = isKeyword;
		} else {
			typ = id.toUpperCase();
		};
		
		if (typ == 'MODULE') {
			if (!(/^module [a-zA-Z]/).test(this._chunk) || ctx0 == 'TAG_ATTR') {
				typ = 'IDENTIFIER';
			};
		};
		
		// clumsy - but testing performance
		if (typ == 'YES') {
			typ = 'TRUE';
		} else if (typ == 'NO') {
			typ = 'FALSE';
		} else if (typ == 'NIL') {
			typ = 'NULL';
		} else if ((typ == 'MIXIN' || typ == 'INTERFACE')) {
			typ = 'CLASS';
		} else if (typ == 'VAR' || typ == 'CONST' || typ == 'LET') {
			let ltyp = this._lastTyp;
			
			// extremely flakey - comma separated declaration blocks are inherently
			// ambiguous in the current syntax
			// if ltyp != 'TERMINATOR' and ltyp != 'INDENT' and ltyp != 'EXPORT' and ltyp
			//	typ = "INLINE_{typ}"
			
			// if @lastVal == 'export'
			//	tTs(prev,'EXPORT_VAR')
		} else if (typ == 'IF' || typ == 'ELSE' || typ == 'TRUE' || typ == 'FALSE' || typ == 'NULL') {
			true;
		} else if (typ == 'TAG') {
			this.pushEnd('TAG');
		} else if ((typ == 'DEF' || typ == 'GET' || typ == 'SET')) {
			typ = 'DEF';
			this.openDef();
		} else if ((typ == 'CONSTRUCTOR')) {
			this.token('DEF','',0);
			typ = 'IDENTIFIER';
			this.openDef();
		} else if (typ == 'DO') {
			if (this.context() == 'DEF') this.closeDef();
		} else if (typ === 'WHEN' && LINE_BREAK_MAP[this.lastTokenType()] == 1) {
			typ = 'LEADING_WHEN';
		} else if (typ === 'FOR') {
			this._seenFor = true;
		} else if (typ === 'UNLESS') {
			typ = 'IF'; // WARN
		} else if (UNARY_MAP[typ] == 1) {
			typ = 'UNARY';
		} else if (RELATION_MAP[typ] == 1) {
			if (typ != 'INSTANCEOF' && typ != 'ISA' && this._seenFor) {
				typ = 'FOR' + typ; // ?
				this._seenFor = false;
			} else {
				typ = 'RELATION';
				
				if (prev._type == 'UNARY') {
					prev._type = 'NOT';
				};
			};
		};
	};
	
	// do we really want to check this here
	if (!forcedIdentifier) {
		// should already have dealt with this
		
		if (this._lastVal == 'export' && id == 'default') {
			// console.log 'id is default!!!'
			tTs(prev,'EXPORT');
			typ = 'DEFAULT';
		};
		
		// these really should not go here?!?
		switch (id) {
			case '!': 
			case 'not': {
				typ = 'UNARY';break;
			}
			case '==': 
			case '!=': 
			case '===': 
			case '!==': 
			case 'is': 
			case 'isnt': {
				typ = 'COMPARE';break;
			}
			case '&&': 
			case '||': 
			case 'and': 
			case 'or': 
			case '??': {
				typ = 'LOGIC';break;
			}
			case 'super': 
			case 'break': 
			case 'continue': 
			case 'debugger': 
			case 'arguments': {
				typ = id.toUpperCase();break;
			}
		};
	};
	
	// prev = last @tokens
	var len = input.length;
	
	// if typ == 'CONST' or typ == 'LET'
	//	if @lastVal == 'global' or @lastVal == 'declare'
	//		tTs(prev,@lastVal.toUpperCase)
	
	
	// should be strict about the order, check this manually instead
	if (typ == 'CLASS' || typ == 'DEF' || typ == 'TAG' || typ == "PROP" || typ == 'CSS') {
		this.queueScope(typ);
	};
	
	if (isKeyword && CONTEXTUAL_KEYWORDS[typ]) {
		var i = this._tokens.length;
		var alts = CONTEXTUAL_KEYWORDS[typ];
		
		while (i){
			prev = this._tokens[--i];
			var ctrl = "" + tV(prev);
			if (alts[ctrl]) {
				tTs(prev,ctrl.toUpperCase());
			} else {
				break;
			};
		};
	} else if (typ == 'IF') {
		this.queueScope(typ);
	} else if (typ == 'EXTEND' && !this._chunk.match(/^extend (class|tag|interface|mixin)(\s|\n|$)/)) {
		this.queueScope(typ);
	} else if (typ == 'IMPORT') {
		// console.log 'import last type',lastTyp,@chunk[idlen]
		let next = this._chunk[idlen];
		if (lastTyp == 'AWAIT' || next == '(' || next == '.') {
			typ = 'IDENTIFIER';
		} else {
			this.pushEnd('IMPORT');
			this.token(typ,id,idlen);
			// return importsToken or len
			return len;
		};
	} else if (id == 'type' && lastTyp == 'IMPORT') {
		this.token('TYPEIMPORT',id,idlen);
		// return importsToken or len
		return len;
	} else if (typ == 'EXPORT') {
		this.pushEnd('EXPORT');
		this.token(typ,id,idlen);
		return len;
	} else if (id == 'from' && ctx0 == 'IMPORT') {
		typ = 'FROM';
		this.pair('IMPORT');
	} else if (id == 'from' && ctx0 == 'EXPORT') {
		typ = 'FROM';
		this.pair('EXPORT');
	} else if (id == 'as' && (ctx0 == 'IMPORT' || this._lastTyp == 'IDENTIFIER' || ctx0 == 'EXPORT')) {
		typ = 'AS';
	};
	
	// if id == 'new'
	//	console.log 'new keyword', @chunk.slice(0,5),@chunk.match(/^new\s+[\w\$\(]/)
	
	if (id == 'new' && (this._lastTyp != '.' && this._chunk.match(/^new\s+[\w\$\(\<\#]/)) && this._lastTyp != 'DEF') {
		typ = 'NEW';
	};
	
	if (typ == 'IDENTIFIER') {
		// see if previous was catch -- belongs in rewriter?
		if (lastTyp == 'CATCH') {
			typ = 'CATCH_VAR';
		};
		
		if (this._lastVal == 'protected' && lastTyp == 'IDENTIFIER') {
			tTs(prev,'PROTECTED');
		};
	};
	
	if ((lastTyp == 'NUMBER' || lastTyp == ')') && !prev.spaced && (typ == 'IDENTIFIER' || id == '%')) {
		typ = 'UNIT';
	};
	
	if (colon) {
		this.token(typ,id,idlen);
		var colonOffset = colon.indexOf(':');
		
		this.moveCaret(idlen + colonOffset);
		
		this.token(':',':',1);
		this.moveCaret(-(idlen + colonOffset));
	} else {
		this.token(typ,id,idlen);
	};
	
	if (typ == 'CSS') {
		return len + this.lexStyleRule(len,true);
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
	
	if (binaryLiteral = /0b([01_]+)/.exec(number)) {
		
		number = "" + parseInt(binaryLiteral[1].replace(/_/g,''),2);
	};
	
	var prev = last(this._tokens);
	
	if (match[0][0] == '.' && prev && !prev.spaced && PROPERTY_ACCESS_PREV_MAP[tT(prev)] == 1) {
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
	symbol = match[0];
	prev = last(this._tokens);
	
	if (!prev || prev.spaced || SYMBOL_STRING_PREV_MAP[this._prevVal] == 1) {
		let sym = helpers.dashToCamelCase(symbol.slice(1));
		this.token('STRING','"' + sym + '"',match[0].length);
		return match[0].length;
	};
	return 0;
};

Lexer.prototype.escapeStr = function (str,heredoc,q){
	str = str.replace(MULTILINER,(heredoc ? '\\n' : ''));
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
		case "'": {
			if (!(match = SIMPLESTR.exec(this._chunk))) { return 0 };
			string = match[0];
			this.token('STRING',this.escapeStr(string),string.length);
			// token 'STRING', (string = match[0]).replace(MULTILINER, '\\\n'), string:length
			break;
		}
		case '"': {
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
		}
		case '`': {
			if (!(string = this.balancedString(this._chunk,'`'))) { return 0 };
			
			if (string.indexOf('{') >= 0) {
				len = string.length;
				// if this has no interpolation?
				// we are now messing with locations - beware
				this.token('STRING_START',string.charAt(0),1);
				this.interpolateString(string.slice(1,-1),{heredoc: true});
				this.token('STRING_END',string.charAt(len - 1),1,string.length - 1);
			} else {
				len = string.length;
				// string = string.replace(MULTILINER, '\\\n')
				this.token('STRING',this.escapeStr(string,true),len);
			};
			break;
		}
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
	var opts = {quote: quote,indent: null,offset: 0};
	doc = this.sanitizeHeredoc(match[2],opts);
	// doc = match[2]
	// console.log "found heredoc {match[0]:length} {doc:length}"
	
	if (quote == '"' && doc.indexOf('{') >= 0) {
		var open = match[1];
		// console.log doc.substr(0,3),match[1]
		// console.log 'heredoc here',open:length,open
		
		this.token('STRING_START',open,open.length);
		this.interpolateString(doc,{heredoc: true,offset: (open.length + opts.offset),quote: quote,indent: opts.realIndent});
		this.token('STRING_END',open,open.length,heredoc.length - open.length);
	} else {
		this.token('STRING',this.makeString(doc,quote,true),0);
	};
	
	this.moveHead(heredoc);
	return heredoc.length;
};

Lexer.prototype.parseMagicalOptions = function (str){
	var self = this;
	if (str.indexOf('imba$') >= 0) {
		str.replace(/imba\$(\w+)\=(\S*)\b/g,function(m,name,val) {
			if ((/^\d+$/).test(val)) {
				val = parseInt(val);
			};
			return self._opts[name] = val;
		});
	};
	return self;
};

// Matches and consumes comments.
Lexer.prototype.commentToken = function (){
	var match,length,comment,indent,prev;
	
	var typ = 'HERECOMMENT';
	
	if (match = JS_COMMENT.exec(this._chunk)) {
		this.token('HERECOMMENT',match[1],match[1].length);
		this.token('TERMINATOR','\n');
		return match[0].length;
	};
	
	if (match = INLINE_COMMENT.exec(this._chunk)) { // .match(INLINE_COMMENT)
		// console.log "match inline comment"
		length = match[0].length;
		indent = match[1];
		comment = match[2];
		let commentBody = (match[4] || '');
		if (comment[0] == '#') {
			commentBody = ' ' + commentBody;
		};
		
		prev = last(this._tokens);
		var pt = prev && tT(prev);
		var note = '//' + commentBody; // comment.substr(1)
		
		this.parseMagicalOptions(note);
		
		if (this._last && this._last.spaced) {
			note = ' ' + note;
			// console.log "the previous node was SPACED"
		};
		// console.log "comment {note} - indent({indent}) - {length} {comment:length}"
		if (note.match(/^\/\/ \@(type|param)/)) {
			note = '/**' + commentBody + '*/';
		} else if (note.match(/^\/\/ \<(reference)/)) {
			note = '///' + commentBody;
		};
		
		if ((pt && pt != 'INDENT' && pt != 'TERMINATOR') || !pt) {
			// console.log "skip comment"
			// token 'INLINECOMMENT', comment.substr(2)
			// console.log "adding as terminator"
			this.token('TERMINATOR',note,length); // + '\n'
		} else {
			if (pt == 'TERMINATOR') {
				tVs(prev,tV(prev) + note);
				// prev[1] += note
			} else if (pt == 'INDENT') {
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
	if (prev && ((prev.spaced ? 
		NOT_REGEX_MAP
	 : 
		NOT_SPACED_REGEX_MAP
	)[tT(prev)] == 1)) { return 0 };
	if (!(match = REGEX.exec(this._chunk))) { return 0 };
	var ary = iter$(match);var m = ary[0],regex = ary[1],flags = ary[2];
	
	this.token('REGEX',("" + regex + flags),m.length);
	return m.length;
};

// Matches multiline extended regular expressions.
// The escaping should rather happen in AST - possibly as an additional flag?
Lexer.prototype.heregexToken = function (match){
	var ary;
	var ary = iter$(match);var heregex = ary[0],body = ary[1],flags = ary[2];
	this.token('REGEX',heregex,heregex.length);
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
	var gutter;
	var match;
	
	if (!(match = MULTI_DENT.exec(this._chunk))) { return 0 };
	
	var indent = match[0];
	var brCount = this.moveHead(indent);
	
	this._seenFor = false;
	// reset column as well?
	var prev = last(this._tokens,1);
	let whitespace = indent.substr(indent.lastIndexOf('\n') + 1);
	var noNewlines = this.unfinished();
	
	if ((/^\n#\s/).test(this._chunk)) {
		this.addLinebreaks(1);
		return 0;
	};
	
	// decide the general line-prefix by the very first line with characters
	
	// if gutter is undefined - we create it on the very first chance we have
	if (this._state.gutter == undefined) {
		this._state.gutter = whitespace;
	};
	
	// if we have a gutter -- remove it
	if (gutter = this._state.gutter || this._opts.gutter) {
		if (whitespace.indexOf(gutter) == 0) {
			whitespace = whitespace.slice(gutter.length);
		} else if (this._chunk[indent.length] === undefined) {
			true;
		} else {
			this.error('incorrect indentation');
		};
		
		// should throw error otherwise?
	};
	
	var size = whitespace.length;
	
	if (this._opts.dropIndentation) {
		return size;
	};
	
	if (size > 0) {
		// seen indent?
		
		if (!this._indentStyle) {
			this._opts.indent = this._indentStyle = whitespace;
			this._indentRegex = new RegExp(whitespace,'g');
		};
		
		let indentSize = 0;
		let offset = 0;
		let offsetLoc = this._loc;
		
		while (true){
			let idx = whitespace.indexOf(this._indentStyle,offset);
			if (idx == offset) {
				indentSize++;
				offset += this._indentStyle.length;
			} else if (offset == whitespace.length) {
				break;
			} else {
				// workaround to report correct location
				this._loc += indent.length - whitespace.length;
				let start = this._loc;
				this.token('INDENT',whitespace,whitespace.length);
				
				this.error("Use tabs for indentation",{
					offset: start + offset,
					length: whitespace.length - offset
				});
			};
		};
		
		size = indentSize;
	};
	
	if ((size - this._indebt) == this._indent) {
		this._scopes.length = this._indents.length;
		
		if (noNewlines) {
			this.suppressNewlines();
		} else {
			this.newlineToken(brCount,indent);
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
			return indent.length;
		};
		
		var diff = size - this._indent + this._outdebt;
		this.closeDef();
		
		var expectScope = this._scopes[this._indents.length];
		var immediate = last(this._tokens);
		
		if (immediate && tT(immediate) == 'TERMINATOR') {
			tTs(immediate,'INDENT');
			// should add terminator inside indent?
			immediate._meta || (immediate._meta = {pre: tV(immediate),post: ''});
			immediate.scope = expectScope;
		} else {
			// console.log "set indent {expectScope}"
			this.token('INDENT',"" + diff,0);
			this._last.scope = expectScope;
		};
		
		this._indents.push(diff);
		this.pushEnd('OUTDENT',{opener: this._last});
		this._outdebt = this._indebt = 0;
		this.addLinebreaks(brCount);
	} else if (true) {
		this._indebt = 0;
		
		let moveOut = this._indent - size;
		let currIndent = this._indent;
		let useTabs = this._indentStyle == '\t';
		let lines = indent.replace().split('\n');
		
		let levels = [];
		let k = lines.length;
		let lvl = 0;
		while (k > 0){
			let ln = lines[--k];
			let lnlvl = useTabs ? ln.length : ln.replace(this._indentRegex,'\t').length;
			if (lnlvl > lvl) {
				lvl = lnlvl;
			};
			
			levels[k] = lvl;
		};
		
		levels[0] = currIndent;
		
		// TODO track position as well
		
		let i = 0;
		let toks = [];
		let pre = "";
		for (let idx = 0, items = iter$(lines), len = items.length; idx < len; idx++) {
			let lvl = levels[idx];
			
			while (currIndent > lvl){
				if (pre) {
					this.terminatorToken(pre);
					pre = "";
				} else {
					this.terminatorToken('');
				};
				
				moveOut--;
				this.outdentToken(1,true);
				currIndent--;
			};
			
			pre += '\n' + items[idx];
		};
		
		if (pre) {
			this.terminatorToken(pre);
		};
		
		while (moveOut > 0){
			this.outdentToken(1,true);
			moveOut--;
		};
	};
	
	this._indent = size;
	return indent.length;
};

// Record an outdent token or multiple tokens, if we happen to be moving back
// inwards past several recorded indents.
Lexer.prototype.outdentToken = function (moveOut,noNewlines,newlineCount){
	// here we should also take care to pop / reset the scope-body
	// or context-type for indentation
	// console.log 'outdent!',@chunk,@loc,context == 'DEF'
	if (this.context() == 'DEF') {
		this.closeDef();
	};
	
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
			
			let paired = this.pair('OUTDENT');
			this.token('OUTDENT',"" + dent,0);
			if (paired[1] && paired[1].opener) {
				let opener = paired[1].opener;
				
				this._last._opener = opener;
				opener._closer = this._last;
				opener._closerIndex = this._tokens.length - 1;
				if (opener._type == 'CSS_SEL') {
					this.token('CSS_END',"",0);
				};
				// console.log 'paired now!!',opener,@tokens.indexOf(opener),@tokens:length - 1
			};
		};
	};
	
	if (dent) { this._outdebt -= moveOut };
	
	while (this.lastTokenValue() == ';'){
		this._tokens.pop();
	};
	
	if (!(this.lastTokenType() == 'TERMINATOR' || noNewlines)) { this.token('TERMINATOR','\n',0) };
	// capping scopes so they dont hang around
	this._scopes.length = this._indents.length;
	
	this.closeDef();
	var ctx = this.context();
	if (ctx == '%' || ctx == 'TAG' || ctx == 'IMPORT' || ctx == 'EXPORT') { this.pair(ctx) }; // or ctx == 'CSS' # really?
	return this;
};

// Matches and consumes non-meaningful whitespace. tokid the previous token
// as being "spaced", because there are some cases where it makes a difference.
Lexer.prototype.whitespaceToken = function (type){
	var match,nline,prev;
	if (!((match = WHITESPACE.exec(this._chunk)) || (nline = this._chunk.charAt(0) === '\n'))) { return 0 };
	prev = last(this._tokens);
	
	// FIX - why oh why?
	if (prev) {
		if (match) {
			prev.spaced = true;
			// prev.@s = match[0]
			// console.log 'whitespace',JSON.stringify(match[0]),prev
			return match[0].length;
		} else {
			prev.newLine = true;
			return 0;
		};
	};
};

Lexer.prototype.moveHead = function (str){
	var br = countLineBreaks(str);
	return br;
};

Lexer.prototype.terminatorToken = function (content,loc){
	if (this._lastTyp == 'TERMINATOR') {
		return this._last._value += content;
		// add location info as well?
	} else {
		return this.token('TERMINATOR',content,loc);
	};
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
	
	this.token('TERMINATOR',(raw || br),0);
	return;
};

// Generate a newline token. Consecutive newlines get merged together.
Lexer.prototype.newlineToken = function (lines,raw){
	
	// while lastTokenValue == ';'
	//	@tokens.pop
	
	this.addLinebreaks(lines,raw);
	// WARN now import cannot go over multiple lines
	this.closeDef(); // close def -- really?
	var ctx = this.context();
	if (ctx == 'TAG' || ctx == 'IMPORT' || ctx == 'EXPORT') { this.pair(ctx) };
	// closeDef()  # close def -- really?
	return this;
};

// Use a `\` at a line-ending to suppress the newline.
// The slash is removed here once its job is done.
Lexer.prototype.suppressNewlines = function (){
	if (this.value() === '\\') { this._tokens.pop() };
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
			tVs(prev,pv + '='); // need to change the length as well
			prev._len = this._loc - prev._loc + value.length;
			return value.length;
		};
	};
	
	if (value == 'ƒ') {
		tokid = 'DO';
	};
	
	if (value == '|') {
		// hacky way to implement this
		// with new lexer we'll use { ... } instead, and assume object-context,
		// then go back and correct when we see the context is invalid
		if (pv == '(') {
			this.token('DO','DO',0);
			this.pushEnd('|');
			this.token('BLOCK_PARAM_START',value,1);
			return length;
		} else if (pt == 'DO') {
			this.pushEnd('|');
			this.token('BLOCK_PARAM_START',value,1);
			return length;
		} else if (end1 == '|') {
			this.token('BLOCK_PARAM_END',value,1);
			this.pair('|');
			return length;
		};
	};
	
	if (value === ';') {
		this._seenFor = false;
		tokid = 'TERMINATOR';
	};
	
	if (value == '(' && pt == 'T.') {
		tokid = 'STYLE_START';
	} else if (value == '[' && inTag) {
		tokid = 'STYLE_START';
	} else if (value === '(' && inTag && pt != '=' && prev.spaced) { // FIXed
		// console.log 'spaced before ( in tokid'
		// FIXME - should rather add a special token like TAG_PARAMS_START
		this.token(',',',');
	} else if (value === '->' && inTag) {
		tokid = 'TAG_END';
		this.pair('TAG_END');
	} else if (value === '=>' && inTag) {
		tokid = 'TAG_END';
		this.pair('TAG_END');
	} else if (value === '/>' && inTag) {
		tokid = 'TAG_END';
		this.pair('TAG_END');
	} else if (value === '>' && inTag) {
		tokid = 'TAG_END';
		this.pair('TAG_END');
	} else if (value === 'TERMINATOR' && end1 === 'DEF') {
		this.closeDef();
	} else if (value === '&' && this.context() == 'DEF') {
		// console.log("okay!")
		tokid = 'BLOCK_ARG';
		// change the next identifier instead?
	} else if (value == '---') {
		tokid = 'SEPARATOR';
	} else if (value == '-' && pt == 'TERMINATOR' && this._chunk.match(/^\-\s*\n/)) {
		tokid = 'SEPARATOR';
	} else if (value == '*' && this._chunk.charAt(1).match(/[A-Za-z\_\@\[]/) && (prev.spaced || SPLAT_PREV_VALUE_MAP[pv] == 1)) {
		tokid = "SPLAT";
	} else if (value == '*' && (this.context() == 'IMPORT' || this.context() == 'EXPORT')) {
		tokid = ("" + this.context() + "_ALL");
	} else if (value == ',' && this.context() == 'IMPORT') {
		tokid = "IMPORT_COMMA";
	} else if (value == '!' && prev && !prev.spaced && ((pv == ']' || pv == ')') || (pt == 'IDENTIFIER' || pt == 'SYMBOLID' || pt == 'SUPER'))) {
		tokid = 'BANG';
	} else if (value == '&' && this._chunk.match(/^\&\s*[,\)\}\]]/)) {
		tokid = 'DO_PLACEHOLDER';
	} else if (value == '&' && this._chunk.match(/^\&(\s*[\.\>\<\=\%\^]|\s+(is|isnt|in|not|isa)\b|[\[\(])/)) {
		tokid = 'AMPER_REF';
	} else if (value == '**') {
		tokid = 'EXP';
	} else if (value == '%' && (pt == 'NUMBER' || pt == ')') && !prev.spaced) {
		tokid = 'UNIT';
	} else if (MATH_MAP[value] == 1) {
		tokid = 'MATH';
	} else if (COMPARE_MAP[value] == 1) {
		tokid = 'COMPARE';
	} else if (COMPOUND_ASSIGN_MAP[value] == 1) {
		tokid = 'COMPOUND_ASSIGN';
	} else if (UNARY_MAP[value] == 1) {
		tokid = 'UNARY';
	} else if (SHIFT_MAP[value] == 1) {
		tokid = 'SHIFT';
	} else if (LOGIC_MAP[value] == 1) {
		tokid = 'LOGIC'; // or value is '?' and prev?:spaced
	} else if (prev && !prev.spaced) {
		if (value == '{' && pt == 'IDENTIFIER') {
			tokid = '{{';
		} else if (value == '{' && pt == '#') {
			tokid = '{{';
		};
		
		if (value === '(' && CALLABLE_MAP[pt] == 1) {
			tokid = 'CALL_START';
		} else if (value === '(' && pt == 'DO') {
			tokid = 'BLOCK_PARAM_START';
		} else if (value === '[' && INDEXABLE_MAP[pt] == 1) {
			tokid = 'INDEX_START';
			if (pt == '?') { tTs(prev,'INDEX_SOAK') };
		};
	};
	
	if (pv == '&' && pt != 'AMPER_REF') {
		if (!prev.spaced && AMPER_REF_TIGHT_TOKENS[tokid] == 1) {
			tTs(prev,pt = 'AMPER_REF');
		} else if (prev.spaced && tokid == 'COMPARE') {
			tTs(prev,pt = 'AMPER_REF');
		};
	};
	
	
	let opener = null;
	
	switch (value) {
		case '(': 
		case '{': 
		case '[': {
			this.pushEnd(INVERSES[value],{closeType: INVERSES[tokid],i: this._tokens.length});
			break;
		}
		case ')': 
		case '}': 
		case ']': {
			let paired = this.pair(value);
			if (paired && paired[1].closeType) {
				tokid = paired[1].closeType;
				let other = this._tokens[paired[1].i];
				opener = this._tokens[paired[1].i];
			};
			break;
		}
	};
	
	if (value == '\\') {
		tokid = 'TYPE';
		let annotation = this.findTypeAnnotation(this._chunk.slice(1));
		if (annotation) {
			value = value + annotation;
		};
	};
	
	// Add unspaced <> gemneric annotation?
	if (value == '<' && TYPE_GENERICS_AFTER.test(this.prevChars(1))) {
		
		let typ = this.findTypeAnnotation(this._chunk,true);
		if (typ) {
			tokid = 'GENERICS';
			value = typ;
		};
	};
	
	if (value == '..' && !prev.spaced) {
		tokid = '?.';
		value = '?.';
	};
	
	if (value == ':' && end1 == 'TAG_RULE') {
		tokid = 'T:';
	};
	
	if ((tokid == '-' || tokid == '+')) {
		if (/\w|\(|\$/.test(this._chunk[1]) && (!prev || prev.spaced)) {
			tokid = tokid + tokid + tokid;
		};
	};
	
	this.token(tokid,value,value.length);
	
	if (opener) {
		opener._closer = this._last;
		opener._closerIndex = this._tokens.length - 1;
	};
	
	if (this._platform == 'tsc') {
		let next = this._chunk[1] || '';
		if (value == '.' && (!next || TSC_CARET_BEFORE[next])) {
			this.token('IDENTIFIER','$CARET$',0,1);
		} else if (value == '@' && (!next || (/[^\$\@\-\.\w]/).test(next)) && false) {
			this.token('IDENTIFIER','$CARET$',0,1);
		};
	};
	
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
			if (indent === null || 0 < (length_ = attempt.length) && length_ < indent.length) {
				indent = attempt;
			};
		};
	};
	
	if (indent) { doc = doc.replace(RegExp(("\\n" + indent),"g"),'\n') };
	if (!herecomment) {
		if (doc[0] == '\n') {
			options.offset = indent.length + 1;
		};
		doc = doc.replace(/^\n/,'');
	};
	options.realIndent = indent;
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
			case ')': {
				stack.push(tok);
				break;
			}
			case '(': 
			case 'CALL_START': {
				if (stack.length) {
					stack.pop();
				} else if (t === '(') {
					tTs(tok,'PARAM_START');
					return this;
				} else {
					return this;
				};
				break;
			}
		};
	};
	
	return this;
};

// Close up all remaining open blocks at the end of the file.
Lexer.prototype.closeIndentation = function (){
	while (true){
		var ctx = this.context();
		if (ctx == 'TAG' || ctx == 'IMPORT' || ctx == 'EXPORT') {
			this.pair(ctx);
		} else {
			break;
		};
	};
	// pair(context) if context == 'IMPORT' or context == 'EXPORT'
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
	
	var stack = [end];
	var i = 0;
	
	// could it not happen here?
	while (i < (str.length - 1)){
		i++;
		letter = str.charAt(i);
		switch (letter) {
			case '\\': {
				i++;
				continue;
				break;
			}
			case end: {
				stack.pop();
				if (!stack.length) {
					var v = str.slice(0,i + 1);
					return v;
				};
				end = stack[stack.length - 1];
				continue;
				break;
			}
		};
		
		if (end === '}' && (letter == '"' || letter == "'" || letter == "`")) {
			stack.push(end = letter);
		} else if (end === '}' && letter === '/' && (match = (HEREGEX.exec(str.slice(i)) || REGEX.exec(str.slice(i))))) {
			i += match[0].length - 1;
		} else if (end === '}' && letter === '{') {
			stack.push(end = '}');
		} else if (end === '"' && letter === '{') {
			stack.push(end = '}');
		} else if (end === '`' && letter === '{') {
			stack.push(end = '}');
		};
		prev = letter;
	};
	
	return this.error(("missing " + (stack.pop()) + ", starting"));
};

// Expand variables and expressions inside double-quoted strings using
// braces for substitution of arbitrary expressions.
//
//     "Hello {name.capitalize}."
//
// If it encounters an interpolation, this method will recursively create a
// new Lexer, tokenize the interpolated contents, and merge them into the
// token stream.
Lexer.prototype.interpolateString = function (str,options){
	
	if(options === undefined) options = {};
	var heredoc = options.heredoc;
	var quote = options.quote;
	var regex = options.regex;
	var prefix = options.prefix;
	var indent = options.indent;
	
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
	
	while (letter = str[i += 1]){
		if (letter === '\\') {
			i += 1;
			continue;
		};
		
		if (letter === '\n' && indent) {
			locOffset += indent.length;
		};
		
		if (!(str[i] == '{' && (expr = this.balancedString(str.slice(i),'}')))) {
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
			var nested = new Lexer().tokenize(inner,{inline: true,rewrite: false,loc: offset + locOffset},this._script);
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
	
	for (let j = 0, len = tokens.length; j < len; j++) {
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
	for (let len = str.length, i = 1, rd = len - i; (rd > 0) ? (i < len) : (i > len); (rd > 0) ? (i++) : (i--)) {
		switch (letter = str.charAt(i)) {
			case '\\': {
				i++;
				continue;
				break;
			}
			case end: {
				stack.pop();
				if (!stack.length) {
					return str.slice(0,i + 1);
				};
				
				end = stack[stack.length - 1];
				continue;
				break;
			}
		};
		if (end === '}' && letter === ')') {
			stack.push(end = letter);
		} else if (end === '}' && letter === '{') {
			stack.push(end = '}');
		} else if (end === ')' && letter === '{') {
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
		if (!('OUTDENT' === wanted)) {
			this.error(("unmatched " + tok),{length: tok.length});
		};
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
	return token ? tT(token) : 'NONE';
};

Lexer.prototype.lastTokenValue = function (){
	var token = this._tokens[this._tokens.length - 1];
	return token ? token._value : '';
};

// Peek at a tokid in the current token stream.
Lexer.prototype.tokid = function (index,val){
	var tok;
	if (tok = last(this._tokens,index)) {
		if (val) { tTs(tok,val) };
		return tT(tok);
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
	} else {
		return null;
	};
};

// Are we in the midst of an unfinished expression?
Lexer.prototype.unfinished = function (){
	if (LINE_CONTINUER.test(this._chunk) && (!this._context || !this._context.style)) { return true };
	return (UNFINISHED_MAP[this._lastTyp] == 1 && this._platform != 'tsc');
};

// Converts newlines for string literals.
Lexer.prototype.escapeLines = function (str,heredoc){
	return str.replace(MULTILINER,(heredoc ? '\\n' : ''));
};

// Constructs a string token by escaping quotes and newlines.
Lexer.prototype.makeString = function (body,quote,heredoc){
	if (!body) { return quote + quote };
	body = body.replace(/\\([\s\S])/g,function(match,contents) {
		return (contents == '\n' || contents == quote) ? contents : match;
	});
	// Does not work now
	body = body.replace(RegExp(("" + quote),"g"),'\\$&');
	return quote + this.escapeLines(body,heredoc) + quote;
};

// Throws a syntax error on the current `@line`.
Lexer.prototype.error = function (message,params){ // len = 0
	if(params === undefined) params = {};
	let loc = params.offset || this._loc;
	let err = this._script.addDiagnostic('error',{
		message: message,
		source: params.source || 'imba-lexer',
		range: params.range || this._script.rangeAt(loc,loc + (params.length || len$(this)))
	});
	throw err.toError();
};

export { ALL_KEYWORDS, Lexer, LexerError };
