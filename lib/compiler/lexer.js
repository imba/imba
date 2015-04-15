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