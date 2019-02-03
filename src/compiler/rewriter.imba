# imba$inlineHelpers=1
# The Imba language has a good deal of optional syntax, implicit syntax,
# and shorthand syntax. This can greatly complicate a grammar and bloat
# the resulting parse table. Instead of making the parser handle it all, we take
# a series of passes over the token stream, using this **Rewriter** to convert
# shorthand into the unambiguous long form, add implicit indentation and
# parentheses, and generally clean things up.


var T = require './token'
var Token = T.Token

var v8
if $v8prof$
	v8 = require 'v8-natives'	

import INVERSES,BALANCED_PAIRS,TOK from './constants'

# var TERMINATOR = TERMINATOR

var TERMINATOR = 'TERMINATOR'
var INDENT = 'INDENT'
var OUTDENT = 'OUTDENT'
var DEF_BODY = 'DEF_BODY'
var THEN = 'THEN'
var CATCH = 'CATCH'

var arrayToHash = do |ary|
	var hash = {}
	for item in ary
		hash[item] = 1
	return hash

# var EXPRESSION_START = ['(','[','{','INDENT','CALL_START','PARAM_START','INDEX_START','BLOCK_PARAM_START','STRING_START','{{', 'TAG_START']
# var EXPRESSION_END   = [')',']','}','OUTDENT','CALL_END','PARAM_END','INDEX_END','BLOCK_PARAM_END','STRING_END','}}', 'TAG_END']
# Tokens that indicate the close of a clause of an expression.
var EXPRESSION_CLOSE = [')',']','}','OUTDENT','CALL_END','PARAM_END','INDEX_END','BLOCK_PARAM_END','STRING_END','}}', 'TAG_END','CATCH', 'WHEN', 'ELSE', 'FINALLY']

var EXPRESSION_CLOSE_HASH = arrayToHash(EXPRESSION_CLOSE)

var EXPRESSION_START =
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

var EXPRESSION_END =
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

var SINGLE_LINERS =
	ELSE: 1
	TRY: 1
	FINALLY: 1
	THEN: 1
	BLOCK_PARAM_END: 1
	DO: 1
	BEGIN: 1
	CATCH_VAR: 1

var SINGLE_CLOSERS_MAP = 
	TERMINATOR: yes
	CATCH: yes
	FINALLY: yes
	ELSE: yes
	OUTDENT: yes
	LEADING_WHEN: yes

var IMPLICIT_FUNC_MAP =
	'IDENTIFIER': 1
	'SUPER': 1
	'@': 1
	'THIS': 1
	'SELF': 1
	'TAG_END': 1
	'IVAR': 1
	'GVAR': 1
	'CVAR': 1
	'DECORATOR': 1
	'CONST_ID': 1
	'ARGVAR': 1
	'NEW': 1
	'BREAK': 1
	'CONTINUE': 1
	'RETURN': 1

var IMPLICIT_CALL_MAP =
	'SELECTOR': 1
	'IDENTIFIER': 1
	'NUMBER': 1
	'STRING': 1
	'SYMBOL': 1
	'JS': 1
	'REGEX': 1
	'NEW': 1
	'CLASS': 1
	'IF': 1
	'UNLESS': 1
	'TRY': 1
	'SWITCH': 1
	'THIS': 1
	'BOOL': 1
	'TRUE': 1
	'FALSE': 1
	'NULL': 1
	'UNDEFINED': 1
	'UNARY': 1
	'SUPER': 1
	'IVAR': 1
	'GVAR': 1
	'CONST_ID': 1
	'ARGVAR': 1
	'SELF': 1
	'@': 1
	'[': 1
	'(': 1
	'{': 1
	'--': 1
	'++': 1
	'TAGID': 1
	'#': 1
	'TAG_START': 1
	'PARAM_START': 1
	'SELECTOR_START': 1
	'STRING_START': 1
	'IDREF': 1
	'SPLAT': 1
	'DO': 1
	'BLOCK_ARG': 1
	'FOR': 1
	'CONTINUE': 1
	'BREAK': 1


var IDENTIFIERS = ['IDENTIFIER', 'GVAR', 'IVAR', 'DECORATOR', 'CONST_ID', 'ARGVAR']



# Tokens that, if followed by an `IMPLICIT_CALL`, indicate a function invocation.
var IMPLICIT_FUNC    = ['IDENTIFIER', 'SUPER', # ')', 'INDEX_END', #  'CALL_END',
	'@', 'THIS','SELF', 'EVENT','TRIGGER','TAG_END', 'IVAR', 'DECORATOR', 'CVAR',
	'GVAR', 'CONST_ID', 'ARGVAR', 'NEW', 'BREAK', 'CONTINUE','RETURN'
]

# If preceded by an `IMPLICIT_FUNC`, indicates a function invocation.
var IMPLICIT_CALL    = [
	'SELECTOR','IDENTIFIER', 'NUMBER', 'STRING', 'SYMBOL', 'JS', 'REGEX', 'NEW', 'PARAM_START', 'CLASS',
	'IF', 'UNLESS', 'TRY', 'SWITCH', 'THIS', 'BOOL', 'TRUE','FALSE', 'NULL', 'UNDEFINED', 'UNARY', 'SUPER', 'IVAR', 'GVAR', 'CONST_ID', 'ARGVAR','SELF', 
	'@', '[', '(', '{', '--', '++','SELECTOR', 'TAG_START', 'TAGID', '#', 'SELECTOR_START', 'IDREF', 'SPLAT', 'DO', 'BLOCK_ARG',
	'FOR', 'STRING_START','CONTINUE','BREAK'
] # '->', '=>', why does it not work with symbol?

var IMPLICIT_INDENT_CALL = [
	'FOR'
]
# is not do an implicit call??

var IMPLICIT_UNSPACED_CALL = ['+', '-']

# Tokens indicating that the implicit call must enclose a block of expressions.
var IMPLICIT_BLOCK   = ['{', '[', ',','BLOCK_PARAM_END', 'DO'] # '->', '=>', 

var IMPLICIT_BLOCK_MAP = arrayToHash(IMPLICIT_BLOCK)

var CONDITIONAL_ASSIGN = ['||=', '&&=', '?=', '&=', '|=']
var COMPOUND_ASSIGN = ['-=', '+=', '/=', '*=', '%=', '||=', '&&=', '?=', '<<=', '>>=', '>>>=', '&=', '^=', '|=']
var UNARY = ['!', '~', 'NEW', 'TYPEOF', 'DELETE']
var LOGIC   = ['&&', '||', '&', '|', '^']

# optimize for fixed arrays
var NO_IMPLICIT_BLOCK_CALL = [
	'CALL_END','=','DEF_BODY','(','CALL_START',',',':','RETURN'
	'-=', '+=', '/=', '*=', '%=', '||=', '&&=', '?=', '<<=', '>>=', '>>>=', '&=', '^=', '|='
] # .concat(COMPOUND_ASSIGN)

var NO_CALL_TAG = ['CLASS', 'IF','UNLESS','TAG','WHILE','FOR','UNTIL','CATCH','FINALLY','MODULE','LEADING_WHEN']

var NO_CALL_TAG_MAP = arrayToHash(NO_CALL_TAG)


# console.log NO_IMPLICIT_BLOCK_CALL:length
# NO_IMPLICIT_BLOCK_CALL
# IMPLICIT_COMMA = ['->', '=>', '{', '[', 'NUMBER', 'STRING', 'SYMBOL', 'IDENTIFIER','DO']

var IMPLICIT_COMMA = ['DO']

# Tokens that always mark the end of an implicit call for single-liners.
var IMPLICIT_END     = ['POST_IF', 'POST_UNLESS', 'POST_FOR', 'WHILE', 'UNTIL', 'WHEN', 'BY', 'LOOP', 'TERMINATOR','DEF_BODY','DEF_FRAGMENT']

var IMPLICIT_END_MAP =
	POST_IF: yes
	POST_UNLESS: yes
	POST_FOR: yes
	WHILE: yes
	UNTIL: yes
	WHEN: yes
	BY: yes
	LOOP: yes
	TERMINATOR: yes
	DEF_BODY: yes
	DEF_FRAGMENT: yes

# Single-line flavors of block expressions that have unclosed endings.
# The grammar can't disambiguate them, so we insert the implicit indentation.
# var SINGLE_LINERS    = ['ELSE', 'TRY', 'FINALLY', 'THEN','BLOCK_PARAM_END','DO','BEGIN','CATCH_VAR'] # '->', '=>', really?
var SINGLE_CLOSERS   = ['TERMINATOR', 'CATCH', 'FINALLY', 'ELSE', 'OUTDENT', 'LEADING_WHEN']
var LINEBREAKS       = ['TERMINATOR', 'INDENT', 'OUTDENT'] # Tokens that end a line.

var CALLCOUNT = 0
# Based on the original rewriter.coffee from CoffeeScript
export class Rewriter
	
	def initialize
		@tokens = []
		@options = {}
		@len = 0
		@starter = null
		self

	def reset
		@starter = null
		@len = 0
		self
	
	def tokens
		@tokens
		
	# Helpful snippet for debugging:
	#     console.log (t[0] + '/' + t[1] for t in @tokens).join ' '
	# Rewrite the token stream in multiple passes, one logical filter at
	# a time. This could certainly be changed into a single pass through the
	# stream, with a big ol' efficient switch, but it's much nicer to work with
	# like this. The order of these passes matters -- indentation must be
	# corrected before implicit parentheses can be wrapped around blocks of code.
	def rewrite tokens, opts = {}
		reset

		@tokens  = tokens
		@options = opts

		var i = 0
		var k = tokens:length
		# flag empty methods
		while i < (k - 1)
			var token = tokens[i]
			
			if token.@type == 'DEF_BODY'
				var next = tokens[i + 1]
				if next and next.@type == TERMINATOR
					token.@type = 'DEF_EMPTY'
			i++

		step("all")
		console.log(CALLCOUNT) if CALLCOUNT
		return @tokens

	def all
		step("ensureFirstLine")
		step("removeLeadingNewlines")
		step("removeMidExpressionNewlines")
		step("tagDefArguments")
		step("closeOpenCalls")
		step("closeOpenIndexes")
		step("closeOpenTags")
		step("addImplicitIndentation")
		step("tagPostfixConditionals")
		step("addImplicitBraces")
		step("addImplicitParentheses")

	def step fn
		if $imbac_profile$
			console.time(fn)

		this[fn]()

		if v8
			var opt = v8.getOptimizationStatus(this[fn])
			if opt != 1
				process:stdout.write "{fn}: {opt}\n" 
				v8.optimizeFunctionOnNextCall(this[fn])

			# if opt == 2
			# v8.optimizeFunctionOnNextCall(this[fn])
			#	v8:helpers.printStatus(this[fn])
			# console.log v8.getOptimizationStatus(this[fn])

		if $imbac_profile$
			console.timeEnd(fn)

		return

	# Rewrite the token stream, looking one token ahead and behind.
	# Allow the return value of the block to tell us how many tokens to move
	# forwards (or backwards) in the stream, to make sure we don't miss anything
	# as tokens are inserted and removed, and the stream changes length under
	# our feet.
	def scanTokens block
		var tokens = @tokens

		var i = 0
		while i < tokens:length
			i += block.call(self, tokens[i], i, tokens)
		true

	def detectEnd i, condition, action, state = {}

		var tokens = @tokens
		var levels = 0
		var token
		var t,v
 
		while i < tokens:length
			token = tokens[i]

			if levels == 0 and condition.call(this,token,i,tokens,state)
				return action.call(self, token, i,tokens,state)

			if !token or levels < 0
				return action.call(self, token, i - 1,tokens,state)

			t = token.@type

			if EXPRESSION_START[t]
				levels += 1

			elif EXPRESSION_END[t]
				levels -= 1
			i += 1

		i - 1

	def ensureFirstLine
		var token = @tokens[0]

		if token.@type === TERMINATOR
			@tokens.unshift(T.token('BODYSTART','BODYSTART'))
			# @tokens = [T.token('BODYSTART','BODYSTART')].concat(@tokens)
		return

	# Leading newlines would introduce an ambiguity in the grammar, so we
	# dispatch them here.
	def removeLeadingNewlines
		var at = 0

		var i = 0 # @tokens:length
		var tokens = @tokens
		var token
		var l = tokens:length

		while i < l
			token = tokens[i]
			if token.@type !== TERMINATOR
				break at = i
			i++
		
		tokens.splice(0, at) if at
		return

	# Some blocks occur in the middle of expressions -- when we're expecting
	# this, remove their trailing newlines.
	def removeMidExpressionNewlines

		scanTokens do |token,i,tokens| # do |token,i,tokens|
			var next = tokens:length > (i + 1) ? tokens[i + 1] : null
			return 1 unless token.@type === TERMINATOR and next and EXPRESSION_CLOSE_HASH[next.@type] # .indexOf(next) >= 0
			return 1 if next and next.@type == OUTDENT
			# return 1
			tokens.splice(i, 1)
			0


	def tagDefArguments
		yes

	# The lexer has tagged the opening parenthesis of a method call. Match it with
	# its paired close. We have the mis-nested outdent case included here for
	# calls that close on the same line, just before their outdent.
	def closeOpenCalls
		var condition = do |token,i,tokens|
			var t = token.@type
			(t == ')' or t == 'CALL_END') || t == OUTDENT and this.tokenType(i - 1) == ')'

		var action = do |token, i, tokens|
			var t = token.@type
			token = tokens[i - 1] if t === OUTDENT
			# var tok = @tokens[t == OUTDENT ? i - 1 : i]
			token.@type = 'CALL_END'
			return
			# T.setTyp(tok,'CALL_END')

		scanTokens do |token,i,tokens|
			this.detectEnd(i + 1, condition, action) if token.@type === 'CALL_START'
			return 1

		return

	# The lexer has tagged the opening parenthesis of an indexing operation call.
	# Match it with its paired close.
	def closeOpenIndexes
		# why differentiate between index and []
		var condition = do |token, i| token.@type === ']' or token.@type === 'INDEX_END'
		var action    = do |token, i| token.@type = 'INDEX_END'
		
		scanTokens do |token,i,tokens|
			detectEnd(i + 1, condition, action) if token.@type === 'INDEX_START'
			return 1

	# The lexer has tagged the opening parenthesis of an indexing operation call.
	# Match it with its paired close. Should be done in lexer directly
	def closeOpenTags
		var condition = do |token, i| token.@type == '>' or token.@type == 'TAG_END'
		var action    = do |token, i| token.@type = 'TAG_END'

		scanTokens do |token,i,tokens|
			detectEnd(i + 1, condition, action) if token.@type === 'TAG_START'
			return 1

	def addImplicitBlockCalls
		var i = 1
		var tokens = @tokens

		# can use shared states for these
		while i < tokens:length

			var token = tokens[i]
			var t = token.@type
			var v = token.@value
			# hmm
			if t == 'DO' and (v == 'INDEX_END' or v == 'IDENTIFIER' or v == 'NEW')
				tokens.splice i + 1, 0, T.token('CALL_END',')')
				tokens.splice i + 1, 0, T.token('CALL_START','(')
				i++
			i++

		return

	# Object literals may be written with implicit braces, for simple cases.
	# Insert the missing braces here, so that the parser doesn't have to.

	def addLeftBrace
		self
		
	def addImplicitBraces
		# Worst mess every written. Shuold be redone
		var stack       = []
		var prevStack = null
		var start       = null
		var startIndent = 0
		var startIdx = null
		var baseCtx = ['ROOT',0]
		
		var defType = 'DEF'
		var noBraceContext = ['IF','TERNARY','FOR',defType]

		var noBrace = no

		var action = do |token,i|
			@tokens.splice i, 0, T.RBRACKET

		var open = do |token,i,scope|
			let tok = Token.new('{','{',0,0,0) # : T.LBRACKET
			tok:generated = yes
			tok:scope = scope
			@tokens.splice i, 0, tok # T.LBRACKET

		var close = do |token,i,scope|
			let tok = Token.new('}','}',0,0,0) # : T.LBRACKET
			tok:generated = yes
			tok:scope = scope
			@tokens.splice i, 0, tok # T.RBRACKET

		var stackToken = do |a,b|
			return [a,b]
			
		var indents = []

		# method is called so many times
		scanTokens do |token,i,tokens|
			var type = token.@type
			var v = token.@value

			var ctx = stack:length ? stack[stack:length - 1] : baseCtx
			var idx
			
			
			if type == 'INDENT'
				indents.unshift(token:scope)
			
			elif type == 'OUTDENT'
				indents.shift

			if noBraceContext.indexOf(type) >= 0 and type != defType
				stack.push stackToken(type,i)
				return 1

			if v == '?'
				stack.push stackToken('TERNARY',i)
				return 1
				
			# if type == 'DEF'
			# 	let prevTyp = T.typ(tokens[i - 1])
			# 	console.log "found def -- should push to stack!",prevTyp,ctx[0]
			# 	stack.push(stackToken('DEF',i))
			
			# no need to test for this here as well as in
			if EXPRESSION_START[type]
				if type === INDENT and noBraceContext.indexOf(ctx[0]) >= 0
					stack.pop

				if type === INDENT and tokenType(i - 1) == '{'
					stack.push stackToken('{', i) # should not autogenerate another?
				else
					stack.push stackToken(type, i)
				return 1

			if EXPRESSION_END[type]
				if ctx[0] == 'TERNARY'
					stack.pop

				start = stack.pop
				start[2] = i

				# seems like the stack should use tokens, no?)
				if start[0] == '{' and start:generated
					close(token,i)
					return 1

				return 1
			
			# is this correct? same for if/class etc?
			if ctx[0] == 'TERNARY' and (type === TERMINATOR or type === OUTDENT)
				stack.pop
				return 1

			if noBraceContext.indexOf(ctx[0]) >= 0 and type === INDENT
				stack.pop
				return 1


			if type == ','
				if ctx[0] == '{' and ctx:generated
					close(token,i,stack.pop)
					return 2
				else
					return 1
				true
			
			

			# found a type
			let isDefInObject = (type == defType) and indents[0] not in ['CLASS','DEF','MODULE','TAG']
			# isDefInObject = isDefInObject and 
			if (type == ':' or isDefInObject) and ctx[0] != '{' and ctx[0] != 'TERNARY' and (noBraceContext.indexOf(ctx[0]) == -1 or ctx[0] == defType)
				# could just check if the end was right before this?
				
				var tprev = tokens[i - 2]
				let autoClose = no
				
				if type == defType
					idx = i - 1
					tprev = tokens[idx]

				elif start and start[2] == i - 1
					idx = start[1] - 1 # these are the stackTokens
				else
					idx = i - 2 # if start then start[1] - 1 else i - 2

				while tokenType(idx - 1) === 'HERECOMMENT'
					idx -= 2

				var t0 = tokens[idx - 1]
				var t1 = tokens[idx]
				
				# console.log "{tokens[i - 1].@value} : (after {t0.@value}) ({tokenType(i - 2)}) [{indents[0]}] {t0 and t0:scope and t0:scope:autoClose} {t1.@type}"
				
				# now what about interpolated stuff?
				# different for def
				if !tprev or (tprev.@type not in ['INDENT','TERMINATOR'])
					autoClose = yes
					
				if indents[0] and indents[0] in ['CLASS','DEF','MODULE','TAG']
					autoClose = yes

				if t0 and T.typ(t0) == '}' and t0:generated and ((t1.@type == ',' and !t1:generated) or !(t0:scope and t0:scope:autoClose)) #  and !autoClose
					# console.log "merge with previous"
					# if we find a closing token inserted here -- move it
					tokens.splice(idx - 1,1)
					var s = stackToken('{',i - 1)
					s:generated = yes
					
					stack.push s
					if type == defType
						stack.push stackToken(defType,i)
						return 1
					return 0

				# hacky edgecase for indents
				elif t0 and T.typ(t0) == ',' and tokenType(idx - 2) == '}'
					# console.log "comma",tokens[idx - 2]:scope
					tokens.splice(idx - 2,1)
					var s = stackToken('{')
					s:generated = yes
					# s:autoClose = 
					stack.push s
					
					if type == defType
						stack.push stackToken(defType,i)
						return 1

					return 0

				else
					if type == defType and (!t0 or t0.@type != '=')
						stack.push stackToken(defType,i)
						return 1
					
					var s = stackToken('{')
					s:generated = yes
					s:autoClose = autoClose
					stack.push s
					open(token,idx + 1) # should rather open at i - 2?
					
					if type == defType
						stack.push stackToken(defType,i)
						return 3

					return 2

			# we probably need to run through autocall first?!

			if type == 'DO' # and ctx:generated"
				var prev = T.typ(tokens[i - 1])
				if ['NUMBER','STRING','REGEX','SYMBOL',']','}',')','STRING_END'].indexOf(prev) >= 0

					var tok = T.token(',', ',')
					tok:generated = yes
					tokens.splice(i,0,tok)

					if ctx:generated
						close(token,i)
						stack.pop
						return 2

			if ctx:generated and (type === TERMINATOR or type === OUTDENT or type === 'DEF_BODY')
				prevStack = stack.pop
				close(token,i,prevStack)
				return 2

			return 1

	# Methods may be optionally called without parentheses, for simple cases.
	# Insert the implicit parentheses here, so that the parser doesn't have to
	# deal with them.
	# Practically everything will now be callable this way (every identifier)
	def addImplicitParentheses
		var tokens = @tokens

		var noCall = no
		var seenFor = no
		var endCallAtTerminator = no

		var seenSingle  = no
		var seenControl = no

		var callObject = no
		var callIndent = no

		var parensAction = do |token,i,tokens|
			tokens.splice i, 0, T.token('CALL_END', ')')

		# function will not be optimized in single run
		# could tro to move this out
		var parensCond = do |token,i,tokens|
			
			var type = token.@type

			if !seenSingle and token:fromThen
				return yes

			var ifelse = type == 'IF' or type == 'UNLESS' or type == 'ELSE'

			if ifelse or type === 'CATCH'
				seenSingle  = yes

			if ifelse or type === 'SWITCH' or type == 'TRY'
				seenControl = yes 

			var prev = tokenType(i - 1)

			if (type == '.' or type == '?.' or type == '::') and prev === OUTDENT
				return yes

			if endCallAtTerminator and (type === INDENT or type === TERMINATOR)
				return yes

			if (type == 'WHEN' or type == 'BY') and !seenFor
				# console.log "dont close implicit call outside for"
				return no 

			var post = tokens:length > (i + 1) ? tokens[i + 1] : null
			var postTyp = post and post.@type

			if token:generated or prev === ','
				return no

			var cond1 = (IMPLICIT_END_MAP[type] or (type == INDENT and !seenControl) or (type == 'DOS' and prev != '='))

			unless cond1
				return no

			if type !== INDENT
				return yes

			if !IMPLICIT_BLOCK_MAP[prev] && tokenType(i - 2) != 'CLASS' && !(post && ((post:generated && postTyp == '{') || IMPLICIT_CALL_MAP[postTyp]))
				return yes

			return no

		var i = 0

		while tokens:length > (i + 1)
			var token = tokens[i]
			var type = token.@type

			var prev    = i > 0 ? tokens[i - 1] : null
			var next    = tokens[i + 1]

			var pt = prev and prev.@type
			var nt = next and next.@type

			if type === INDENT and (pt == ')' or pt == ']')
				noCall = yes

			if NO_CALL_TAG_MAP[pt] # .indexOf(pt) >= 0
				# CALLCOUNT++
				# console.log("seen nocall tag {pt} ({pt} {type} {nt})")
				endCallAtTerminator = yes
				noCall  = yes
				if pt == 'FOR'
					seenFor = yes

			callObject = no
			callIndent = no

			if !noCall and type == INDENT and next
				var prevImpFunc = pt and IMPLICIT_FUNC_MAP[pt]
				var nextImpCall = nt and IMPLICIT_CALL_MAP[nt]

				callObject = ((next:generated and nt == '{') or nextImpCall) and prevImpFunc
				callIndent = nextImpCall and prevImpFunc

			seenSingle  = no
			seenControl = no

			# this is not correct if this is inside a block,no?
			if (type == TERMINATOR or type == OUTDENT or type == INDENT)
				endCallAtTerminator = no
				noCall = no 

			if type == '?' and prev and !prev:spaced
				token:call = yes

			# where does fromThem come from?
			if token:fromThen
				continue i += 1 

			# here we deal with :spaced and :newLine
			unless callObject or callIndent or (prev and prev:spaced) and (prev:call or IMPLICIT_FUNC_MAP[pt]) and (IMPLICIT_CALL_MAP[type] or !(token:spaced or token:newLine) and IMPLICIT_UNSPACED_CALL.indexOf(type) >= 0)
				continue i += 1

			# cache where we want to splice -- add them later
			tokens.splice i, 0, T.token('CALL_START', '(')
			# CALLCOUNT++

			detectEnd(i + 1, parensCond, parensAction)

			if prev.@type == '?'
				prev.@type  = 'FUNC_EXIST'

			i += 2

			# need to reset after a match
			endCallAtTerminator = no
			noCall = no
			seenFor = no

		return



	def indentCondition token,i,tokens
		var t = token.@type
		SINGLE_CLOSERS_MAP[t] and token.@value !== ';' and not (t == 'ELSE' and @starter != 'IF' and @starter != 'THEN')

	def indentAction token, i, tokens
		var idx = tokenType(i - 1) === ',' ? (i - 1) : i
		tokens.splice idx, 0, T.OUTDENT
		return


	# Because our grammar is LALR(1), it can't handle some single-line
	# expressions that lack ending delimiters. The **Rewriter** adds the implicit
	# blocks, so it doesn't need to. ')' can close a single-line block,
	# but we need to make sure it's balanced.
	def addImplicitIndentation

		var lookup1 =
			OUTDENT: 1
			TERMINATOR: 1
			FINALLY: 1

		var i = 0
		var tokens = @tokens
		var starter 

		while i < tokens:length
			var token = tokens[i]
			var type = token.@type
			var next = tokenType(i + 1)

			# why are we removing terminators after then? should be able to handle
			if type === TERMINATOR and next === THEN
				tokens.splice(i, 1)
				continue

			if type === CATCH and lookup1[tokenType(i + 2)]
				tokens.splice i + 2, 0, T.token(INDENT, '2'), T.token(OUTDENT, '2')
				i += 4
				continue

			if SINGLE_LINERS[type] and (next != INDENT and next != 'BLOCK_PARAM_START') and !(type == 'ELSE' and next == 'IF') and type != 'ELIF'
				@starter = starter = type

				var indent = T.token(INDENT, '2')
				indent:fromThen   = true if starter === THEN
				indent:generated  = true
				tokens.splice i + 1, 0, indent
				detectEnd(i + 2, self:indentCondition, self:indentAction)
				tokens.splice i, 1 if type === THEN
			i++

		return

	# Tag postfix conditionals as such, so that we can parse them with a
	# different precedence.
	def tagPostfixConditionals
		var condition = do |token,i,tokens| token.@type === TERMINATOR or token.@type === INDENT
		var action = do |token,i,tokens,s|
			T.setTyp(s:original, 'POST_' + s:original.@type) if token.@type != INDENT

		scanTokens do |token, i, tokens|
			var typ = token.@type
			return 1 unless typ == 'IF' or typ == 'FOR'
			detectEnd(i + 1, condition,action,original: token)
			1

	# Look up a type by token index.
	def type i 
		# if i < 0 then return null
		throw "deprecated"
		var tok = @tokens[i]
		tok and tok.@type

	def injectToken index, token
		self

	def tokenType i
		if i < 0 or i >= @tokens:length
			# CALLCOUNT++
			return null

		var tok = @tokens[i]
		tok and tok.@type

# Constants
# ---------
