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
	
	
	var T = require('./token');
	var Token = T.Token;
	
	var INVERSES = require('./constants').INVERSES;
	
	var K = 0;
	
	var ERR = require('./errors');
	
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
		'when','def','tag','do','elif','begin','var','let','self','await','import','require'
	];
	
	var IMBA_CONTEXTUAL_KEYWORDS = ['extend','static','local','export','global','prop'];
	
	// should not rewrite the actual tokens
	var IMBA_ALIAS_MAP = {
		'and': '&&',
		'or': '||',
		'is': '==',
		'isnt': '!='
	};
	
	var IMBA_ALIASES = Object.keys(IMBA_ALIAS_MAP);
	IMBA_KEYWORDS = IMBA_KEYWORDS.concat(IMBA_ALIASES);
	
	// FixedArray for performance
	// var ALL_KEYWORDS = JS_KEYWORDS.concat(IMBA_KEYWORDS)
	var ALL_KEYWORDS = exports.ALL_KEYWORDS = [
		'true','false','null','this',
		'delete','typeof','in','instanceof',
		'throw','break','continue','debugger',
		'if','else','switch','for','while','do','try','catch','finally',
		'class','extends','super','return',
		'undefined','then','unless','until','loop','of','by',
		'when','def','tag','do','elif','begin','var','let','self','await','import',
		'and','or','is','isnt','not','yes','no','isa','case','nil','require'
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
	
	var SYMBOL = /^\:((([\*\@$\w\x7f-\uffff]+)+([\-\\\:][\w\x7f-\uffff]+)*)|==|\<=\>)/;
	
	
	var NUMBER = /^0x[\da-f]+|^0b[01]+|^\d*\.?\d+(?:e[+-]?\d+)?/i;
	
	var HEREDOC = /^("""|''')([\s\S]*?)(?:\n[^\n\S]*)?\1/;
	
	var OPERATOR = /^(?:[-=]=>|===|->|=>|!==|[-+*\/%<>&|^!?=]=|=<|>>>=?|([-+:])\1|([&|<>])\2=?|\?\.|\?\:|\.{2,3}|\*(?=[a-zA-Z\_]))/;
	
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
	
	var ENV_FLAG = /^\$\w+\$/;
	
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
	
	// optimize for FixedArray
	var INDEXABLE = [
		'IDENTIFIER','STRING','REGEX',')',']','THIS','SUPER','TAG_END','IVAR','GVAR','SELF','CONST','NEW','ARGVAR','SYMBOL','RETURN',
		'NUMBER','BOOL','TAG_SELECTOR','ARGUMENTS','}','TAG_TYPE','TAGID'
	];
	
	var NOT_KEY_AFTER = ['.','?','?.','UNARY','?:','+','-','*'];
	
	var GLOBAL_IDENTIFIERS = ['global','exports'];
	
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
		
		this._indentStyle = null;
		this._inTag = false;
		
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
		
		var m;
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
		this._indentStyle = o.indentation || null;
		
		// if the very first line is indented, take this as a gutter
		if (m = code.match(/^([\ \t]*)[^\n\s\t]/)) {
			this._state.gutter = m[1];
		};
		
		if (o.gutter !== undefined) {
			this._state.gutter = o.gutter;
		};
		
		o._tokens = this._tokens;
		
		this.parse(code);
		
		if (!o.inline) this.closeIndentation();
		
		if (!o.silent && this._ends.length) {
			console.log(this._ends);
			this.error(("missing " + (this._ends.pop())));
		};
		
		return this._tokens;
	};
	
	Lexer.prototype.parse = function (code){
		var i = 0;
		var pi = 0;
		this._loc = this._locOffset + i;
		
		while (this._chunk = code.slice(i)){
			if (this._context && this._context.pop) {
				if (this._context.pop.test(this._chunk)) {
					this.popEnd();
				};
			};
			
			pi = (this._end == 'TAG' && this.tagDefContextToken()) || (this._inTag && this.tagContextToken()) || this.basicContext();
			i += pi;
			this._loc = this._locOffset + i;
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
	
	Lexer.prototype.pushEnd = function (val,ctx){
		this._ends.push(val);
		this._contexts.push(this._context = (ctx || {}));
		this._end = val;
		this.refreshScope();
		
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
			ctx.end = new Token(ctx.id + '_END',popped,this._last.region()[1],0);
			ctx.end._start = ctx.start;
			ctx.start._end = ctx.end;
			this._tokens.push(ctx.end);
		};
		
		this._contexts.pop();
		this._context = this._contexts[this._contexts.length - 1];
		
		this.refreshScope();
		return this;
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
			
			if (tT(prev) == 'DEF_FRAGMENT') {
				true;
			} else if (tT(prev) == 'TERMINATOR') {
				var n = this._tokens.pop();
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
		var match;
		if (this._chunk[0] == '#') {
			this.token('#','#',1);
			return 1;
		};
		
		if (match = TAG_ATTR.exec(this._chunk)) {
			var l = match[0].length;
			
			this.token('TAG_ATTR',match[1],l - 1); // add to loc?
			this._loc += l - 1;
			this.token('=','=',1);
			this.pushEnd('TAG_ATTR',{id: 'VALUE',pop: /^[\s\n\>]/}); //  [' ','\n','>']
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
			var chr = this._chunk[0];
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
			this.pushEnd('%');
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
	
	// is this really needed? Should be possible to
	// parse the identifiers and = etc i jison?
	// what is special about methodNameToken? really?
	// this whole step should be removed - it's a huge mess
	Lexer.prototype.methodNameToken = function (){
		// we can optimize this by after a def simply
		// fetching all the way after the def until a space or (
		// and then add this to the def-token itself (as with fragment)
		if (this._chunk[0] == ' ') { return 0 };
		
		var match;
		
		if (this._end == ')') {
			if (this._ends.length > 1) {
				var outerctx = this._ends[this._ends.length - 2];
				if (outerctx == '%' && (match = TAG_ATTR.exec(this._chunk))) {
					this.token('TAG_ATTR_SET',match[1]);
					return match[0].length;
				};
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
			// this is wrong -- in the case of <div value=Date.new>
			// we are basically in a nested scope until the next space or >
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
				this.token('BLOCK_PARAM_START',id,1);
				return length;
			} else if (ltyp == 'DO' || ltyp == '{') {
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
		} else if (pre == '#') {
			typ = 'TAGID';
		} else if (CONST_IDENTIFIER.test(pre) || id == 'global' || id == 'exports') {
			// really? seems very strange
			// console.log('global!!',typ,id)
			typ = 'CONST';
		};
		
		// what is this really for?
		if (match[5] && ['IDENTIFIER','CONST','GVAR','CVAR','IVAR','SELF','THIS',']','}',')','NUMBER','STRING'].indexOf(ltyp) >= 0) {
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
		
		var ctx0 = this._ends.length > 0 ? (this._ends[this._ends.length - 1]) : (null);
		var ctx1 = this._ends.length > 1 ? (this._ends[this._ends.length - 2]) : (null);
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
			typ = 'KEY';
			
			this.token(typ,id,id.length);
			this.moveCaret(id.length);
			this.token(':',':',match[3].length);
			this.moveCaret(-id.length);
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
		} else if (typ == '$' && ENV_FLAG.test(id)) {
			typ = 'ENV_FLAG';
			id = id.toUpperCase().slice(1,-1);
		} else if (typ == '@') {
			typ = 'IVAR';
			// id:reserved = yes if colon
		} else if (typ == '#') {
			typ = 'TAGID';
		} else if (typ == '@@') {
			typ = 'CVAR';
		} else if (typ == '$' && !colon) {
			typ = 'IDENTIFIER';
			// typ = 'GVAR'
		} else if (CONST_IDENTIFIER.test(id) || id == 'global' || id == 'exports') {
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
					
					if (prev._type == 'UNARY') {
						prev._type = 'NOT';
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
			
			if (this._lastVal == 'export' && id == 'default') {
				// console.log 'id is default!!!'
				tTs(prev,'EXPORT');
				typ = 'DEFAULT';
			};
			
			// could use lookup-hash instead
			if (isKeyword && IMBA_ALIASES.indexOf(id) >= 0) { id = IMBA_ALIAS_MAP[id] };
			// these really should not go here?!?
			switch (id) {
				case '!':
				case 'not':
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
				if (idx$(ctrl,IMBA_CONTEXTUAL_KEYWORDS) >= 0) {
					tTs(prev,ctrl.toUpperCase());
				} else {
					break;
				};
			};
		} else if (typ == 'IF') {
			this.queueScope(typ);
		} else if (typ == 'IMPORT') {
			// could manually parse the whole ting here?
			this.pushEnd('IMPORT');
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
			// console.log 'colon',colon,typ
			if (typ == 'IDENTIFIER' && NOT_KEY_AFTER.indexOf(this._lastTyp) == -1) {
				typ = 'KEY';
			};
			
			this.token(typ,id,idlen);
			this.moveCaret(idlen);
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
		symbol = match[0];
		prev = last(this._tokens);
		
		// is this a property-access?
		// should invert this -- only allow when prev IS .. 
		// : should be a token itself, with a specification of spacing (LR,R,L,NONE)
		if (prev && !prev.spaced && idx$(tT(prev),['(','{','[','.','CALL_START','INDEX_START',',','=','INDENT','TERMINATOR']) == -1) {
			this.token('.:',':',1);
			var access = symbol.split(':')[1]; // really?
			this.token('IDENTIFIER',access,access.length,1);
			return access.length + 1;
		} else {
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
		var whitespace = indent.substr(indent.lastIndexOf('\n') + 1);
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
				// if this is the end of code we're okay
				true;
			} else {
				this.warn('incorrect indentation');
				// console.log "GUTTER IS INCORRECT!!",JSON.stringify(indent),JSON.stringify(@chunk[indent:length]),@last # @chunk[indent:length - 1]
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
					if (!this._opts.silent) {
						return this.error(("inconsistent " + (this._indentStyle) + " indentation"));
					};
				};
			};
			
			size = indentSize;
		};
		
		
		if ((size - this._indebt) == this._indent) {
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
				return indent.length;
			};
			
			var diff = size - this._indent + this._outdebt;
			this.closeDef();
			
			var immediate = last(this._tokens);
			
			if (immediate && tT(immediate) == 'TERMINATOR') {
				tTs(immediate,'INDENT');
				// should add terminator inside indent?
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
				// prev.@s = match[0]
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
		
		// while lastTokenValue == ';'
		//	@tokens.pop
		
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
				tVs(prev,pv + '='); // need to change the length as well
				prev._len = this._loc - prev._loc + value.length;
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
		} else if (value == '=>' && inTag) {
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
			if (value == '(' && idx$(pt,CALLABLE) >= 0) {
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
		if (this.context() == 'IMPORT') { this.pair(this.context()) };
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
			if (letter == '\\') {
				i += 1;
				continue;
			};
			
			if (letter == '\n' && indent) {
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
		if (LINE_CONTINUER.test(this._chunk)) { return true };
		return UNFINISHED.indexOf(this._lastTyp) >= 0;
	};
	
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
	
	Lexer.prototype.warn = function (message){
		var ary = this._tokens.warnings || (this._tokens.warnings = []);
		ary.push(message);
		console.warn(message);
		return this;
	};
	return Lexer;
	

})();