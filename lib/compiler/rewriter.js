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
	
	var T = require('./token');
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
		if(opts === undefined) opts = {};
		this._tokens = tokens;
		this._options = opts;
		
		// console.log "tokens in: " + tokens:length
		if (opts.profile) { console.time("tokenize:rewrite") };
		
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

})()