import * as T from './token.mjs';
import { INVERSES, BALANCED_PAIRS, TOK } from './constants.mjs';
function idx$(a,b){
	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
};
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
// imba$inlineHelpers=1
// imba$v2=0
// The Imba language has a good deal of optional syntax, implicit syntax,
// and shorthand syntax. This can greatly complicate a grammar and bloat
// the resulting parse table. Instead of making the parser handle it all, we take
// a series of passes over the token stream, using this **Rewriter** to convert
// shorthand into the unambiguous long form, add implicit indentation and
// parentheses, and generally clean things up.

var Token = T.Token;

// var TERMINATOR = TERMINATOR

var TERMINATOR = 'TERMINATOR';
var INDENT = 'INDENT';
var OUTDENT = 'OUTDENT';
var DEF_BODY = 'DEF_BODY';
var THEN = 'THEN';
var CATCH = 'CATCH';
var EOF = {_type: 'EOF',_value: ''};

var arrayToHash = function(ary) {
	var hash = {};
	for (let i = 0, items = iter$(ary), len = items.length; i < len; i++) {
		hash[items[i]] = 1;
	};
	return hash;
};

var closerIndex = function(tokens,token) {
	var closer = token._closer;
	if (!closer) { return -1 };
	var idx = token._closerIndex;
	if (idx != null && tokens[idx] === closer) { return idx };
	return token._closerIndex = tokens.indexOf(closer);
};

var tokenTypeAt = function(tokens,i) {
	if (i < 0 || i >= tokens.length) { return null };
	var tok = tokens[i];
	return tok && tok._type;
};

// Tokens that indicate the close of a clause of an expression.
var EXPRESSION_CLOSE = [')',']','}','STYLE_END','OUTDENT','CALL_END','PARAM_END','INDEX_END','BLOCK_PARAM_END','STRING_END','}}','TAG_END','CATCH','WHEN','ELSE','FINALLY'];

var EXPRESSION_CLOSE_HASH = arrayToHash(EXPRESSION_CLOSE);

var EXPRESSION_START = {
	'(': 1,
	'[': 1,
	'{': 1,
	'{{': 1,
	'INDENT': 1,
	'CALL_START': 1,
	'PARAM_START': 1,
	'INDEX_START': 1,
	'BLOCK_PARAM_START': 1,
	'STRING_START': 1,
	'TAG_START': 1
};

var EXPRESSION_END = {
	')': 1,
	']': 1,
	'}': 1,
	'}}': 1,
	'OUTDENT': 1,
	'CALL_END': 1,
	'PARAM_END': 1,
	'INDEX_END': 1,
	'BLOCK_PARAM_END': 1,
	'STRING_END': 1,
	'TAG_END': 1
};

var NO_IMPLICIT_REWRITE = 'STYLE_START';

var SINGLE_LINERS = {
	ELSE: 1,
	TRY: 1,
	FINALLY: 1,
	THEN: 1,
	BLOCK_PARAM_END: 1,
	DO: 1,
	BEGIN: 1,
	CATCH_VAR: 1
};

var SINGLE_CLOSERS_MAP = {
	TERMINATOR: true,
	CATCH: true,
	FINALLY: true,
	ELSE: true,
	OUTDENT: true,
	LEADING_WHEN: true
};

var IMPLICIT_FUNC_MAP = {
	'IDENTIFIER': 1,
	'TYPE': 1,
	'SYMBOLID': 1,
	'SUPER': 1,
	'THIS': 1,
	'SELF': 1,
	'TAG_END': 1,
	'IVAR': 1,
	'CVAR': 1,
	'ARGVAR': 1,
	'BREAK': 1,
	'CONTINUE': 1,
	'RETURN': 1,
	'YIELD': 1,
	'INDEX_END': 1,
	']': 1,
	'BANG': 1
};

var IMPLICIT_CALL_MAP = {
	'SELECTOR': 1,
	'IDENTIFIER': 1,
	'SYMBOLID': 1,
	'NUMBER': 1,
	'STRING': 1,
	'SYMBOL': 1,
	'JS': 1,
	'REGEX': 1,
	'NEW': 1,
	'CLASS': 1,
	'IF': 1,
	'AWAIT': 1,
	'UNLESS': 1,
	'TRY': 1,
	'SWITCH': 1,
	'THIS': 1,
	'BOOL': 1,
	'TRUE': 1,
	'FALSE': 1,
	'NULL': 1,
	'UNDEFINED': 1,
	'UNARY': 1,
	'SUPER': 1,
	'IVAR': 1,
	'ARGVAR': 1,
	'SELF': 1,
	'[': 1,
	'(': 1,
	'{': 1,
	'--': 1,
	'++': 1,
	'---': 1,
	'+++': 1,
	'#': 1,
	'TAG_START': 1,
	'PARAM_START': 1,
	'SELECTOR_START': 1,
	'STRING_START': 1,
	'IDREF': 1,
	'SPLAT': 1,
	'DO': 1,
	'AMPER_REF': 1,
	'BLOCK_ARG': 1,
	'FOR': 1,
	'CONTINUE': 1,
	'BREAK': 1,
	'LET': 1,
	'VAR': 1,
	'CONST': 1,
	'CSS': 1,
	'ENV_FLAG': 1
};

var IDENTIFIERS = ['IDENTIFIER','IVAR','DECORATOR','ARGVAR'];

// Tokens that, if followed by an `IMPLICIT_CALL`, indicate a function invocation.
var IMPLICIT_FUNC = ['IDENTIFIER','SYMBOLID','SUPER','@','THIS','SELF','EVENT','TRIGGER','TAG_END','IVAR','CVAR',
'ARGVAR','BREAK','CONTINUE','RETURN','BANG','YIELD'];

var IMPLICIT_INDENT_CALL = [
	'FOR'
];
// is not do an implicit call??

var IMPLICIT_UNSPACED_CALL_MAP = {
	'+': 1,
	'-': 1
};

// Tokens indicating that the implicit call must enclose a block of expressions.
var IMPLICIT_BLOCK = ['{','[',',','BLOCK_PARAM_END','DO']; // '->', '=>',

var IMPLICIT_BLOCK_MAP = arrayToHash(IMPLICIT_BLOCK);

var CONDITIONAL_ASSIGN = ['||=','&&=','?=','&=','|='];
var COMPOUND_ASSIGN = ['-=','+=','/=','*=','%=','||=','&&=','?=','<<=','>>=','>>>=','&=','^=','|=','**='];
var UNARY = ['!','~','NEW','TYPEOF','DELETE'];
var LOGIC = ['&&','||','&','|','^'];

// optimize for fixed arrays
var NO_IMPLICIT_BLOCK_CALL = [
	'CALL_END','=','DEF_BODY','(','CALL_START',',',':','RETURN','DEF_EMPTY','YIELD',
	'-=','+=','/=','*=','%=','||=','&&=','?=','<<=','>>=','>>>=','&=','^=','|=','**='
]; // .concat(COMPOUND_ASSIGN)

var NO_CALL_TAG = ['CLASS','IF','UNLESS','TAG','WHILE','FOR','UNTIL','CATCH','FINALLY','MODULE','LEADING_WHEN','STRUCT'];

var NO_CALL_TAG_MAP = arrayToHash(NO_CALL_TAG);

// console.log NO_IMPLICIT_BLOCK_CALL:length
// NO_IMPLICIT_BLOCK_CALL
// IMPLICIT_COMMA = ['->', '=>', '{', '[', 'NUMBER', 'STRING', 'SYMBOL', 'IDENTIFIER','DO']

var IMPLICIT_COMMA = ['DO'];

// Tokens that always mark the end of an implicit call for single-liners.
var IMPLICIT_END = ['POST_IF','POST_UNLESS','POST_FOR','WHILE','UNTIL','WHEN','BY','LOOP','TERMINATOR','DEF_BODY','DEF_EMPTY'];

var IMPLICIT_END_MAP = {
	POST_IF: true,
	POST_UNLESS: true,
	POST_FOR: true,
	WHILE: true,
	UNTIL: true,
	WHEN: true,
	BY: true,
	LOOP: true,
	TERMINATOR: true,
	DEF_BODY: true,
	DEF_EMPTY: true
};

// Single-line flavors of block expressions that have unclosed endings.
// The grammar can't disambiguate them, so we insert the implicit indentation.
// var SINGLE_LINERS    = ['ELSE', 'TRY', 'FINALLY', 'THEN','BLOCK_PARAM_END','DO','BEGIN','CATCH_VAR'] # '->', '=>', really?
var SINGLE_CLOSERS = ['TERMINATOR','CATCH','FINALLY','ELSE','OUTDENT','LEADING_WHEN'];
var LINEBREAKS = ['TERMINATOR','INDENT','OUTDENT']; // Tokens that end a line.

var IMPLICIT_BRACE_NO_CONTEXT = {
	IF: 1,
	TERNARY: 1,
	FOR: 1,
	DEF: 1
};

var IMPLICIT_BRACE_OBJECT_SCOPE = {
	CLASS: 1,
	DEF: 1,
	MODULE: 1,
	TAG: 1,
	STRUCT: 1
};

var IMPLICIT_BRACE_AUTO_CLOSE_PREV = {
	INDENT: 1,
	TERMINATOR: 1
};

var IMPLICIT_BRACE_DO_COMMA_PREV = {
	NUMBER: 1,
	STRING: 1,
	REGEX: 1,
	SYMBOL: 1,
	']': 1,
	'}': 1,
	')': 1,
	STRING_END: 1
};

var CALLCOUNT = 0;
// Based on the original rewriter.coffee from CoffeeScript
function Rewriter(){
	this._tokens = [];
	this._options = {};
	this._len = 0;
	this._starter = null;
	this;
};


Rewriter.prototype.reset = function (){
	this._starter = null;
	this._len = 0;
	return this;
};

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
	this.reset();
	
	this._tokens = tokens;
	this._options = opts;
	this._platform = opts.platform || opts.target;
	
	var i = 0;
	var k = tokens.length;
	// flag empty methods
	while (i < (k - 1)){
		var token = tokens[i];
		
		if (token._type == 'DEF_BODY') {
			var next = tokens[i + 1];
			if (next && next._type == TERMINATOR) {
				token._type = 'DEF_EMPTY';
			};
		};
		i++;
	};
	
	this.all();
	if (CALLCOUNT) { console.log(CALLCOUNT) };
	return this._tokens;
};

Rewriter.prototype.all = function (){
	this.ensureFirstLine();
	this.removeLeadingNewlines();
	if (this._platform == 'tsc') {
		this.addPlaceholderIdentifiers();
	};
	
	this.removeMidExpressionNewlines();
	this.tagDefArguments();
	this.closeOpenTags();
	this.addImplicitIndentation();
	this.tagPostfixConditionals();
	this.addImplicitBraces();
	return this.addImplicitParentheses();
};

Rewriter.prototype.step = function (fn){
	this[fn]();
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
	while (i < tokens.length){
		i += block(tokens[i],i,tokens);
	};
	return true;
};

Rewriter.prototype.detectEnd = function (i,condition,action,state){
	
	if(state === undefined) state = {};
	var tokens = this._tokens;
	var levels = 0;
	var token;
	var t,v;
	
	while (i < tokens.length){
		token = tokens[i];
		
		if (levels == 0 && condition.call(this,token,i,tokens,state)) {
			return action.call(this,token,i,tokens,state);
		};
		
		if (!token || levels < 0) {
			return action.call(this,token,i - 1,tokens,state);
		};
		
		t = token._type;
		
		if (EXPRESSION_START[t]) {
			levels += 1;
		} else if (EXPRESSION_END[t]) {
			levels -= 1;
		};
		i += 1;
	};
	
	return i - 1;
};

Rewriter.prototype.ensureFirstLine = function (){
	var token = this._tokens[0];
	
	if (!token || token._type === TERMINATOR) {
		this._tokens.unshift(T.token('BODYSTART','BODYSTART'));
		// @tokens = [T.token('BODYSTART','BODYSTART')].concat(@tokens)
	};
	return;
};

Rewriter.prototype.addPlaceholderIdentifiers = function (){
	let nextTest = /^([\,\]\)\}]|\}\})$/;
	return this.scanTokens(function(token,i,tokens) { // do |token,i,tokens|
		var prev = tokens[i - 1] || EOF;
		var next = tokens[i + 1] || EOF;
		// var after = tokens[i + 2] or EOF
		if (prev._type == '=' || prev._type == ':') {
			if ((token._type === TERMINATOR && next._type != 'INDENT') || token._type == ',' || token._type == 'DEF_BODY') {
				tokens.splice(i,0,new Token('IDENTIFIER','$CARET$',token._loc,0));
				return 2;
			};
		} else if (prev._type == '.') {
			if ((token._type === TERMINATOR && next._type != 'INDENT') || nextTest.test(token._value)) {
				tokens.splice(i,0,new Token('IDENTIFIER','$CARET$',token._loc,0));
				return 2;
			};
		};
		
		return 1;
	});
};

// Leading newlines would introduce an ambiguity in the grammar, so we
// dispatch them here.
Rewriter.prototype.removeLeadingNewlines = function (){
	var at = 0;
	
	var i = 0; // @tokens:length
	var tokens = this._tokens;
	var token;
	var l = tokens.length;
	
	while (i < l){
		token = tokens[i];
		if (token._type !== TERMINATOR) {
			at = i;break;
		};
		i++;
	};
	
	if (at) { tokens.splice(0,at) };
	return;
};

// Some blocks occur in the middle of expressions -- when we're expecting
// this, remove their trailing newlines.
Rewriter.prototype.removeMidExpressionNewlines = function (){
	
	return this.scanTokens(function(token,i,tokens) { // do |token,i,tokens|
		var next = (tokens.length > (i + 1)) ? tokens[i + 1] : null;
		if (!(token._type === TERMINATOR && next && EXPRESSION_CLOSE_HASH[next._type])) { return 1 }; // .indexOf(next) >= 0
		if (next && next._type == OUTDENT) { return 1 };
		// return 1
		tokens.splice(i,1);
		return 0;
	});
};

Rewriter.prototype.tagDefArguments = function (){
	return true;
};

// The lexer has tagged the opening parenthesis of an indexing operation call.
// Match it with its paired close. Should be done in lexer directly
Rewriter.prototype.closeOpenTags = function (){
	var self = this;
	var condition = function(token,i) { return token._type == '>' || token._type == 'TAG_END'; };
	var action = function(token,i) { return token._type = 'TAG_END'; };
	
	return self.scanTokens(function(token,i,tokens) {
		if (token._type === 'TAG_START') { self.detectEnd(i + 1,condition,action) };
		return 1;
	});
};

Rewriter.prototype.addImplicitBlockCalls = function (){
	var i = 1;
	var tokens = this._tokens;
	
	// can use shared states for these
	while (i < tokens.length){
		
		var token = tokens[i];
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

Rewriter.prototype.addLeftBrace = function (){
	return this;
};

Rewriter.prototype.addImplicitBraces = function (){
	// Worst mess every written. Shuold be redone
	var self = this;
	var stack = [];
	var prevStack = null;
	var start = null;
	var baseCtx = ['ROOT',0];
	
	var defType = 'DEF';
	var noBraceContext = IMPLICIT_BRACE_NO_CONTEXT;
	
	// anchor generated braces at the token they are inserted around, so
	// errors involving them point to the right place rather than offset 0
	var anchorLoc = function(token) {
		return (token && token._loc >= 0) ? token._loc : -1;
	};

	var open = function(token,i,scope) {
		let tok = new Token('{','{',anchorLoc(token),0,0); // : T.LBRACKET
		tok.generated = true;
		tok.scope = scope;
		return self._tokens.splice(i,0,tok); // T.LBRACKET
	};

	var close = function(token,i,scope) {
		let tok = new Token('}','}',anchorLoc(token),0,0); // : T.LBRACKET
		tok.generated = true;
		tok.scope = scope;
		return self._tokens.splice(i,0,tok); // T.RBRACKET
	};
	
	var stackToken = function(a,b) {
		return [a,b];
	};
	
	var indents = [];
	var balancedStack = [];
	var currPair = null;
	
	// method is called so many times
	return self.scanTokens(function(token,i,tokens) {
		var type = token._type;
		var v = token._value;
		
		if (type == 'CSS_SEL' && token._closer) {
			let idx = closerIndex(tokens,token);
			// console.log 'CSS jump to',i,idx,idx - i,tokens[idx - i]
			if (idx >= 0) { return idx - i + 1 };
		};
		
		if (type == 'STYLE_START' && token._closer) {
			let idx = closerIndex(tokens,token);
			if (idx >= 0) { return idx - i };
		};
		
		if (BALANCED_PAIRS[type]) {
			balancedStack.push(currPair = type);
		} else if (INVERSES[type] && INVERSES[type] == currPair) {
			balancedStack.pop();
			currPair = balancedStack[balancedStack.length - 1];
		};
		
		if (currPair === NO_IMPLICIT_REWRITE) {
			return 1;
		};
		
		var ctx = stack.length ? stack[stack.length - 1] : baseCtx;
		var idx;
		
		if (type == 'INDENT') {
			indents.unshift(token.scope);
		} else if (type == 'OUTDENT') {
			indents.shift();
		};
		
		if (noBraceContext[type] && type != defType) {
			stack.push(stackToken(type,i));
			return 1;
		};
		
		if (v == '?') {
			stack.push(stackToken('TERNARY',i));
			return 1;
		};
		
		// if type == 'DEF'
		// 	let prevTyp = T.typ(tokens[i - 1])
		// 	console.log "found def -- should push to stack!",prevTyp,ctx[0]
		// 	stack.push(stackToken('DEF',i))
		
		// no need to test for this here as well as in
		if (EXPRESSION_START[type]) {
			if (type === INDENT && noBraceContext[ctx[0]]) {
				stack.pop();
			};
			
			let tt = tokenTypeAt(tokens,i - 1);
			
			if (type === INDENT && (tt == '{' || tt == 'STYLE_START')) {
				stack.push(stackToken('{',i)); // should not autogenerate another?
			} else {
				stack.push(stackToken(type,i));
			};
			return 1;
		};
		
		if (EXPRESSION_END[type]) {
			if (ctx[0] == 'TERNARY') {
				stack.pop();
			};
			
			start = stack.pop();
			start[2] = i;
			
			// seems like the stack should use tokens, no?)
			if (start[0] == '{' && start.generated) {
				close(token,i);
				return 1;
			};
			
			return 1;
		};
		
		// is this correct? same for if/class etc?
		if (ctx[0] == 'TERNARY' && (type === TERMINATOR || type === OUTDENT)) {
			stack.pop();
			return 1;
		};
		
		if (noBraceContext[ctx[0]] && type === INDENT) {
			stack.pop();
			return 1;
		};
		
		if (type == ',') {
			if (ctx[0] == '{' && ctx.generated) {
				close(token,i,stack.pop());
				return 2;
			} else {
				return 1;
			};
			true;
		};
		
		// found a type
		let isDefInObject = (type == defType) && !IMPLICIT_BRACE_OBJECT_SCOPE[indents[0]];
		// isDefInObject = isDefInObject and
		if ((type == ':' || isDefInObject) && ctx[0] != '{' && ctx[0] != 'TERNARY' && (!noBraceContext[ctx[0]] || ctx[0] == defType)) {
			// could just check if the end was right before this?
			
			var tprev = tokens[i - 2];
			let autoClose = false;
			
			if (type == defType) {
				idx = i - 1;
				tprev = tokens[idx];
			} else if (start && start[2] == i - 1) {
				idx = start[1] - 1; // these are the stackTokens
			} else {
				idx = i - 2; // if start then start[1] - 1 else i - 2
			};
			
			while (tokenTypeAt(tokens,idx - 1) === 'HERECOMMENT'){
				idx -= 2;
			};
			
			var t0 = tokens[idx - 1];
			var t1 = tokens[idx];
			
			// console.log "{tokens[i - 1].@value} : (after {t0.@value}) ({tokenType(i - 2)}) [{indents[0]}] {t0 and t0:scope and t0:scope:autoClose} {t1.@type}"
			
			// now what about interpolated stuff?
			// different for def
			if (!tprev || !IMPLICIT_BRACE_AUTO_CLOSE_PREV[tprev._type]) {
				autoClose = true;
			};
			
			if (indents[0] && IMPLICIT_BRACE_OBJECT_SCOPE[indents[0]]) {
				autoClose = true;
			};
			
			if (t0 && t0._type == '}' && t0.generated && ((t1._type == ',' && !t1.generated) || !(t0.scope && t0.scope.autoClose))) { //  and !autoClose
				// console.log "merge with previous"
				// if we find a closing token inserted here -- move it
				tokens.splice(idx - 1,1);
				var s = stackToken('{',i - 1);
				s.generated = true;
				
				stack.push(s);
				if (type == defType) {
					stack.push(stackToken(defType,i));
					return 1;
				};
				return 0;
			} else if (t0 && t0._type == ',' && tokenTypeAt(tokens,idx - 2) == '}') {
				// console.log "comma",tokens[idx - 2]:scope
				tokens.splice(idx - 2,1);
				s = stackToken('{');
				s.generated = true;
				// s:autoClose =
				stack.push(s);
				
				if (type == defType) {
					stack.push(stackToken(defType,i));
					return 1;
				};
				
				return 0;
			} else {
				if (type == defType && (!t0 || t0._type != '=')) {
					stack.push(stackToken(defType,i));
					return 1;
				};
				
				s = stackToken('{');
				s.generated = true;
				s.autoClose = autoClose;
				stack.push(s);
				open(token,idx + 1); // should rather open at i - 2?
				
				if (type == defType) {
					stack.push(stackToken(defType,i));
					return 3;
				};
				
				return 2;
			};
		};
		
		// we probably need to run through autocall first?!
		
		if (type == 'DO') { // and ctx:generated"
			var prev = tokenTypeAt(tokens,i - 1);
			if (IMPLICIT_BRACE_DO_COMMA_PREV[prev]) {
				
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
		
		if (ctx.generated && (type === TERMINATOR || type === OUTDENT || type === 'DEF_BODY')) {
			prevStack = stack.pop();
			close(token,i,prevStack);
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
	var self = this;
	var tokens = self._tokens;
	
	var noCall = false;
	var seenFor = false;
	var seenTagClose = false;
	var endCallAtTerminator = false;
	
	var seenSingle = false;
	var seenControl = false;
	
	var callObject = false;
	var callIndent = false;
	
	var i = 0;
	let stack = [];
	let currPair = null;
	
	var parensAction = function(token,i,tokens) {
		let tok = new Token('CALL_END',')',-1,0);
		tok.generated = true;
		return tokens.splice(i,0,tok);
	};
	
	// function will not be optimized in single run
	// could tro to move this out
	var parensCond = function(token,i,tokens) {
		
		var type = token._type;
		
		if (!seenSingle && token.fromThen) {
			return true;
		};
		
		var ifelse = type == 'IF' || type == 'UNLESS' || type == 'ELSE';
		
		if (ifelse || type === 'CATCH') {
			seenSingle = true;
		};
		
		if (ifelse || type === 'SWITCH' || type == 'TRY') {
			seenControl = true;
		};
		
		var prev = tokenTypeAt(tokens,i - 1);
		
		if ((type == '.' || type == '?.' || type == '::') && prev === OUTDENT) {
			return true;
		};
		
		if (type == ':' && stack[stack.length - 1] == '?' && tokens[i - 1].spaced) {
			return true;
		};
		
		if (endCallAtTerminator && (type === INDENT || type === TERMINATOR)) {
			return true;
		};
		
		if ((type == 'WHEN' || type == 'BY') && !seenFor) {
			// console.log "dont close implicit call outside for"
			return false;
		};
		
		var post = (tokens.length > (i + 1)) ? tokens[i + 1] : null;
		var postTyp = post && post._type;
		
		if (token.generated || prev === ',') {
			return false;
		};
		
		var cond1 = (IMPLICIT_END_MAP[type] || (type == INDENT && !seenControl) || (type == 'DOS' && prev != '='));
		
		if (!cond1) {
			return false;
		};
		
		if (type !== INDENT) {
			return true;
		};
		
		if (!IMPLICIT_BLOCK_MAP[prev] && tokenTypeAt(tokens,i - 2) != 'CLASS' && !(post && ((post.generated && postTyp == '{') || IMPLICIT_CALL_MAP[postTyp]))) {
			return true;
		};
		
		return false;
	};
	
	while (tokens.length > (i + 1)){
		var token = tokens[i];
		var type = token._type;
		// ternary
		if (type == '?') {
			stack.push(type);
		};
		
		if ((type == 'STYLE_START' || type == 'CSS_SEL') && token._closer) {
			let idx = closerIndex(tokens,token);
			if (idx >= 0) {
				i = idx + 1;
				continue;
			};
		};
		
		if (BALANCED_PAIRS[type]) {
			stack.push(currPair = type);
		} else if (INVERSES[type] && INVERSES[type] == currPair) {
			stack.pop();
			currPair = stack[stack.length - 1];
		};
		
		if (currPair === NO_IMPLICIT_REWRITE) {
			i++;
			continue;
		};
		
		if (type == ':' && tokens[i - 1].spaced && stack[stack.length - 1] == '?') {
			stack.pop();
		};
		
		var prev = (i > 0) ? tokens[i - 1] : null;
		var next = tokens[i + 1];
		
		var pt = prev && prev._type;
		var nt = next && next._type;
		
		if (type === INDENT && (pt == ')' || pt == ']')) {
			noCall = true;
		};
		
		if (pt == INDENT) {
			seenTagClose = false;
		};
		
		if (pt == 'TAG_END') {
			seenTagClose = prev;
		};
		
		if (NO_CALL_TAG_MAP[pt]) { // .indexOf(pt) >= 0
			// CALLCOUNT++
			// console.log("seen nocall tag {pt} ({pt} {type} {nt})")
			endCallAtTerminator = true;
			noCall = true;
			if (pt == 'FOR') {
				seenFor = true;
			};
		};
		
		callObject = false;
		callIndent = false;
		
		if (!noCall && type == INDENT && next) {
			var prevImpFunc = pt && IMPLICIT_FUNC_MAP[pt];
			var nextImpCall = nt && IMPLICIT_CALL_MAP[nt];
			
			callObject = ((next.generated && nt == '{') || nextImpCall) && prevImpFunc;
			callIndent = nextImpCall && prevImpFunc;
			
			if (nt == 'TAG_START' && pt != 'TAG_END' && nextImpCall) {
				callIndent = false;
			};
		};
		
		seenSingle = false;
		seenControl = false;
		
		// this is not correct if this is inside a block,no?
		if ((type == TERMINATOR || type == OUTDENT || type == INDENT)) {
			endCallAtTerminator = false;
			noCall = false;
		};
		
		if (type == TERMINATOR) {
			seenTagClose = false;
		};
		
		if (type == '?' && prev && !prev.spaced) {
			token.call = true;
		};
		
		// where does fromThem come from?
		if (token.fromThen) {
			i += 1;continue;
		};
		
		// here we deal with :spaced and :newLine
		if (!(callObject || callIndent || (prev && prev.spaced) && (prev.call || IMPLICIT_FUNC_MAP[pt]) && (IMPLICIT_CALL_MAP[type] || !(token.spaced || token.newLine) && IMPLICIT_UNSPACED_CALL_MAP[type]))) {
			i += 1;continue;
		};
		
		if (type === INDENT && nt == 'TAG_START' && IMPLICIT_FUNC_MAP[pt] && pt != 'TAG_END') {
			i += 1;continue;
		};
		
		if (seenTagClose && nt !== 'TAG_START' && pt !== 'TAG_END') {
			if (type === INDENT) {
				i += 1;continue;
			};
			endCallAtTerminator = true;
		};
		
		// cache where we want to splice -- add them later
		let callStart = new Token('CALL_START','(',-1,0);
		callStart.generated = true;
		tokens.splice(i,0,callStart);
		// CALLCOUNT++
		
		self.detectEnd(i + 1,parensCond,parensAction);
		
		if (prev._type == '?') {
			prev._type = 'FUNC_EXIST';
		};
		
		i += 2;
		
		// need to reset after a match
		endCallAtTerminator = false;
		noCall = false;
		seenFor = false;
	};
	
	return;
};

Rewriter.prototype.indentCondition = function (token,i,tokens){
	var t = token._type;
	return SINGLE_CLOSERS_MAP[t] && token._value !== ';' && !(t == 'ELSE' && this._starter != 'IF' && this._starter != 'THEN');
};

Rewriter.prototype.indentAction = function (token,i,tokens){
	var idx = (this.tokenType(i - 1) === ',') ? ((i - 1)) : i;
	tokens.splice(idx,0,T.OUTDENT);
	return;
};

// Because our grammar is LALR(1), it can't handle some single-line
// expressions that lack ending delimiters. The **Rewriter** adds the implicit
// blocks, so it doesn't need to. ')' can close a single-line block,
// but we need to make sure it's balanced.
Rewriter.prototype.addImplicitIndentation = function (){
	
	var lookup1 = {
		OUTDENT: 1,
		TERMINATOR: 1,
		FINALLY: 1
	};
	
	var i = 0;
	var tokens = this._tokens;
	var starter;
	
	while (i < tokens.length){
		var token = tokens[i];
		var type = token._type;
		var next = this.tokenType(i + 1);
		
		// why are we removing terminators after then? should be able to handle
		if (type === TERMINATOR && next === THEN) {
			tokens.splice(i,1);
			continue;
		};
		
		if ((type === CATCH || type === 'CATCH_VAR') && lookup1[this.tokenType(i + 1)]) {
			tokens.splice(i + 1,0,T.token(INDENT,'2'),T.token(OUTDENT,'2'));
			i += 3;
			continue;
		};
		
		if (SINGLE_LINERS[type] && (next != INDENT && next != 'BLOCK_PARAM_START') && !(type == 'ELSE' && next == 'IF') && type != 'ELIF') {
			this._starter = starter = type;
			var indent = T.token(INDENT,'2');
			if (starter === THEN) { indent.fromThen = true };
			indent.generated = true;
			tokens.splice(i + 1,0,indent);
			this.detectEnd(i + 2,this.indentCondition,this.indentAction);
			if (type === THEN) { tokens.splice(i,1) };
		};
		i++;
	};
	
	return;
};

// Tag postfix conditionals as such, so that we can parse them with a
// different precedence.
Rewriter.prototype.tagPostfixConditionals = function (){
	var self = this;
	var condition = function(token,i,tokens) { return token._type === TERMINATOR || token._type === INDENT; };
	var action = function(token,i,tokens,s) {
		if (token._type != INDENT) {
			if (s.unfinished) {
				let tok = T.token('EMPTY_BLOCK','');
				return tokens.splice(i,0,tok);
				// T.setTyp(s:original, 'POST_' + s:original.@type)
			} else {
				return T.setTyp(s.original,'POST_' + s.original._type);
			};
		};
	};
	
	return self.scanTokens(function(token,i,tokens) {
		var typ = token._type;
		if (!(typ == 'IF' || typ == 'FOR')) { return 1 };
		let unfinished = tokens[i - 1] && condition(tokens[i - 1]);
		self.detectEnd(i + 1,condition,action,{original: token,unfinished: unfinished});
		return 1;
	});
};

// Look up a type by token index.
Rewriter.prototype.type = function (i){
	// if i < 0 then return null
	throw "deprecated";
	var tok = this._tokens[i];
	return tok && tok._type;
};

Rewriter.prototype.injectToken = function (index,token){
	return this;
};

Rewriter.prototype.tokenType = function (i){
	if (i < 0 || i >= this._tokens.length) {
		// CALLCOUNT++
		return null;
	};
	
	var tok = this._tokens[i];
	return tok && tok._type;
};

// Constants
// ---------

export { Rewriter };
