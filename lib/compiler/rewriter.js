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