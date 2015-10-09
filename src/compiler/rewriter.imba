
# The Imba language has a good deal of optional syntax, implicit syntax,
# and shorthand syntax. This can greatly complicate a grammar and bloat
# the resulting parse table. Instead of making the parser handle it all, we take
# a series of passes over the token stream, using this **Rewriter** to convert
# shorthand into the unambiguous long form, add implicit indentation and
# parentheses, and generally clean things up.

var T = require './token'
var Token = T.Token

# Based on the original rewriter.coffee from CoffeeScript
export class Rewriter
	
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
		@tokens  = tokens
		@options = opts

		# console.log "tokens in: " + tokens:length
		console.time("tokenize:rewrite") if opts:profile

		step("ensureFirstLine")
		step("removeLeadingNewlines")
		step("removeMidExpressionNewlines")
		step("tagDefArguments")
		step("closeOpenCalls")
		step("closeOpenIndexes")
		step("closeOpenTags")
		step("closeOpenTagAttrLists")
		step("addImplicitIndentation")
		step("tagPostfixConditionals")
		step("addImplicitBraces")
		step("addImplicitParentheses")

		console.timeEnd("tokenize:rewrite") if opts:profile
		# console.log "tokens out: " + @tokens:length
		@tokens

	def step fn
		if @options:profile
			console.log "---- starting {fn} ---- "
			console.time(fn)

		this[fn]()

		if @options:profile
			console.timeEnd(fn)
			console.log "\n\n"
		return

	# Rewrite the token stream, looking one token ahead and behind.
	# Allow the return value of the block to tell us how many tokens to move
	# forwards (or backwards) in the stream, to make sure we don't miss anything
	# as tokens are inserted and removed, and the stream changes length under
	# our feet.
	def scanTokens block
		var tokens = @tokens

		var i = 0
		while var token = tokens[i]
			i += block.call(self, token, i, tokens)

		true

	def detectEnd i, condition, action
		var tokens = @tokens
		var levels = 0
		var starts = []
		var token
		var t,v

		while token = tokens[i]
			if levels == 0 and condition.call(this,token,i,starts)
				return action.call(self, token, i)
			if !token or levels < 0
				return action.call(self, token, i - 1)

			t = T.typ(token)

			if EXPRESSION_START.indexOf(t) >= 0
				starts.push(i) if levels == 0
				levels += 1
			elif EXPRESSION_END.indexOf(t) >= 0
				levels -= 1
			i += 1
		i - 1

	def ensureFirstLine
		var tok = @tokens[0]

		if T.typ(tok) == 'TERMINATOR'
			# console.log "adding bodystart"
			@tokens = [T.token('BODYSTART','BODYSTART')].concat(@tokens)
			# T.setTyp(tok,'HEADER')
		return

	# Leading newlines would introduce an ambiguity in the grammar, so we
	# dispatch them here.
	def removeLeadingNewlines
		var at = 0

		for token,i in @tokens
			if T.typ(token) != 'TERMINATOR'
				break at = i
		
		@tokens.splice(0, at) if at

		return

	# Some blocks occur in the middle of expressions -- when we're expecting
	# this, remove their trailing newlines.
	def removeMidExpressionNewlines
		scanTokens do |token,i,tokens| # do |token,i,tokens|
			var next = tokenType(i + 1)

			return 1 unless T.typ(token) is 'TERMINATOR' and EXPRESSION_CLOSE.indexOf(next) >= 0
			return 1 if next == 'OUTDENT'
			tokens.splice(i, 1)
			0


	def tagDefArguments
		yes

	# The lexer has tagged the opening parenthesis of a method call. Match it with
	# its paired close. We have the mis-nested outdent case included here for
	# calls that close on the same line, just before their outdent.
	def closeOpenCalls
		var condition = do |token,i|
			var t = T.typ(token)
			(t == ')' or t == 'CALL_END') || t == 'OUTDENT' and tokenType(i - 1) == ')'

		var action = do |token, i|
			var t = T.typ(token)
			var tok = @tokens[t == 'OUTDENT' ? i - 1 : i]
			T.setTyp(tok,'CALL_END')

		scanTokens do |token,i|
			detectEnd(i + 1, condition, action) if T.typ(token) is 'CALL_START'
			return 1

	# The lexer has tagged the opening parenthesis of an indexing operation call.
	# Match it with its paired close.
	def closeOpenIndexes
		var condition = do |token, i| T.typ(token) in [']', 'INDEX_END']
		var action    = do |token, i| T.setTyp(token,'INDEX_END')
		
		scanTokens do |token,i|
			detectEnd i + 1, condition, action if T.typ(token) is 'INDEX_START'
			return 1

	
	def closeOpenTagAttrLists
		var condition = do |token, i| T.typ(token) in [')', 'TAG_ATTRS_END']
		var action    = do |token, i| T.setTyp(token,'TAG_ATTRS_END') # 'TAG_ATTRS_END'

		scanTokens do |token,i|
			detectEnd i + 1, condition, action if T.typ(token) is 'TAG_ATTRS_START'
			return 1
	
	# The lexer has tagged the opening parenthesis of an indexing operation call.
	# Match it with its paired close. Should be done in lexer directly
	def closeOpenTags
		var condition = do |token, i| T.typ(token) in ['>', 'TAG_END']
		var action    = do |token, i| T.setTyp(token,'TAG_END') # token[0] = 'TAG_END'

		scanTokens do |token,i|
			detectEnd i + 1, condition, action if T.typ(token) is 'TAG_START'
			return 1
		
	def addImplicitCommas
		return

	def addImplicitBlockCalls
		var i = 1
		var tokens = @tokens

		while var token = tokens[i]
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
	def addImplicitBraces
		var stack       = []
		var start       = null
		var startIndent = 0
		var startIdx = null

		var noBraceTag = ['CLASS', 'IF','UNLESS','TAG','WHILE','FOR','UNTIL','CATCH','FINALLY','MODULE','LEADING_WHEN']
		var noBraceContext = ['IF','TERNARY','FOR']

		var noBrace = no

		var scope = do 
			stack[stack:length - 1] or []

		var action = do |token,i|
			@tokens.splice i, 0, T.RBRACKET

		var open = do |token,i|
			@tokens.splice i, 0, T.LBRACKET

		var close = do |token,i|
			@tokens.splice i, 0, T.RBRACKET

		var stackToken = do |a,b|
			return [a,b]

		scanTokens do |token,i,tokens|
			var type = T.typ(token)
			var v = T.val(token)
			var ctx = stack[stack:length - 1] or []
			var idx

			if noBraceContext.indexOf(type) >= 0
				# console.log "found noBraceTag {type}"
				stack.push stackToken(type,i)
				return 1

			if v == '?'
				# console.log('TERNARY OPERATOR!')
				stack.push stackToken('TERNARY',i)
				return 1
			
			# no need to test for this here as well as in
			if EXPRESSION_START.indexOf(type) >= 0
				if type == 'INDENT' and noBraceContext.indexOf(ctx[0]) >= 0
					stack.pop

				# console.log('expression start',type,ctx[0])
				if type == 'INDENT' and tokenType(i - 1) == '{'
					# stack ?!? no token
					stack.push stackToken('{', i) # should not autogenerate another?
				else
					stack.push stackToken(type, i)
				return 1

			if EXPRESSION_END.indexOf(type) >= 0
				# console.log "EXPRESSION_END at {type} - stack is {ctx[0]}"
				if ctx[0] == 'TERNARY' # FIX?
					stack.pop

				start = stack.pop
				unless start
					console.log "NO STACK!!"
				start[2] = i

				# seems like the stack should use tokens, no?)
				if start[0] == '{' and start:generated #  # type != '}' # and start:generated
					close(token,i)
					return 1

				return 1
			
			# is this correct? same for if/class etc?
			if ctx[0] == 'TERNARY' and (type == 'TERMINATOR' or type == 'OUTDENT')
				stack.pop
				return 1

			if noBraceContext.indexOf(ctx[0]) >= 0 and type == 'INDENT'
				console.log "popping noBraceContext"
				stack.pop
				return 1


			if type == ','
				# automatically add an ending here if inside:generated scope?
				# it is important that this is:generated(!)
				if ctx[0] == '{' and ctx:generated
					tokens.splice(i, 0, T.RBRACKET)
					stack.pop
					return 2
				else
					return 1
				true

			# found a type
			if type == ':' and ctx[0] != '{' and ctx[0] != 'TERNARY' and (noBraceContext.indexOf(ctx[0]) == -1)
				# could just check if the end was right before this?
				
				if start and start[2] == i - 1
					# console.log('this expression was just ending before colon!')
					idx = start[1] - 1 # these are the stackTokens
				else
					# console.log "rewrite here? #{i}"
					idx = i - 2 # if start then start[1] - 1 else i - 2
					# idx = idx - 1 if tokenType(idx) is 'TERMINATOR'

				idx -= 2 while tokenType(idx - 1) is 'HERECOMMENT'

				var t0 = tokens[idx - 1]

				if t0 and T.typ(t0) == '}' and t0:generated
					tokens.splice(idx - 1,1)
					var s = stackToken('{')
					s:generated = yes
					stack.push s
					return 0

				# hacky edgecase for indents
				elif t0 and T.typ(t0) == ',' and tokenType(idx - 2) == '}'
					tokens.splice(idx - 2,1)
					var s = stackToken('{')
					s:generated = yes
					stack.push s
					return 0

				else
					var s = stackToken('{')
					s:generated = yes
					stack.push s
					open(token,idx + 1)
					return 2

			# we probably need to run through autocall first?!

			if type == 'DO' # and ctx:generated
				var prev = T.typ(tokens[i - 1]) # [0]
				if ['NUMBER','STRING','REGEX','SYMBOL',']','}',')','STRING_END'].indexOf(prev) >= 0

					var tok = T.token(',', ',')
					tok:generated = yes
					tokens.splice(i,0,tok)

					if ctx:generated
						close(token,i)
						stack.pop
						return 2

			if (type == 'TERMINATOR' or type == 'OUTDENT' or type == 'DEF_BODY') and ctx:generated
				close(token,i)
				stack.pop
				return 2

			return 1

	# Methods may be optionally called without parentheses, for simple cases.
	# Insert the implicit parentheses here, so that the parser doesn't have to
	# deal with them.
	# Practically everything will now be callable this way (every identifier)
	def addImplicitParentheses
		
		var noCallTag = ['CLASS', 'IF','UNLESS','TAG','WHILE','FOR','UNTIL','CATCH','FINALLY','MODULE','LEADING_WHEN']


		
		var action = do |token,i|
			@tokens.splice i, 0, T.token('CALL_END', ')')

		# console.log "adding implicit parenthesis" # ,self:scanTokens
		var tokens = @tokens

		var noCall = no
		var seenFor = no
		var endCallAtTerminator = no

		var i = 0
		while var token = tokens[i]
			# console.log "detect end??"
			var type = token.@type

			var prev    = tokens[i - 1]
			var current = tokens[i]
			var next    = tokens[i + 1]

			var pt = prev and prev.@type
			var nt = next and next.@type

			# if pt == 'WHEN'
			# Never make these tags implicitly call
			if (pt == ')' or pt == ']') and type == 'INDENT'
				noCall = yes

			if noCallTag.indexOf(pt) >= 0
				# console.log("seen nocall tag {pt} ({pt} {type} {nt})")
				endCallAtTerminator = yes
				noCall  = yes
				seenFor = yes if pt == 'FOR'
				

			var callObject = no
			var callIndent = no

			# [prev, current, next] = tokens[i - 1 .. i + 1]

			# check for comments
			# console.log "detect end??"
			if !noCall and type == 'INDENT' and next
				var prevImpFunc = pt and IMPLICIT_FUNC.indexOf(pt) >= 0
				var nextImpCall = nt and IMPLICIT_CALL.indexOf(nt) >= 0
				callObject = ((next:generated and nt is '{') or nextImpCall) and prevImpFunc
				callIndent = nextImpCall and prevImpFunc

			var seenSingle  = no
			var seenControl = no
			# Hmm ?

			# this is not correct if this is inside a block,no?
			if (type == 'TERMINATOR' or type == 'OUTDENT' or type == 'INDENT')
				endCallAtTerminator = no
				noCall = no 

			token:call  = yes if type is '?' and prev and !prev:spaced

			# where does fromThem come from?
			if token:fromThen
				continue i += 1 
			# here we deal with :spaced and :newLine
			unless callObject or callIndent or (prev and prev:spaced) and (prev:call or IMPLICIT_FUNC.indexOf(pt) >= 0) and (IMPLICIT_CALL.indexOf(type) >= 0 or !(token:spaced or token:newLine) and IMPLICIT_UNSPACED_CALL.indexOf(type) >= 0)
				continue i += 1


			tokens.splice i, 0, T.token('CALL_START', '(')
			# console.log "added ( {prev}"
			var cond = do |token,i|
				var type = T.typ(token)
				return yes if !seenSingle and token:fromThen
				var ifelse = type == 'IF' or type == 'UNLESS' or type == 'ELSE'
				seenSingle  = yes if ifelse or type == 'CATCH'
				seenControl = yes if ifelse or type == 'SWITCH' or type == 'TRY'
				var prev = tokenType(i - 1)

				return yes if (type == '.' or type == '?.' or type == '::') and prev is 'OUTDENT'
				return yes if endCallAtTerminator and (type == 'INDENT' or type == 'TERMINATOR')
				if (type == 'WHEN' or type == 'BY') and !seenFor
					# console.log "dont close implicit call outside for"
					return no 

				var post = tokens[i + 1]
				var postTyp = post and T.typ(post)
				# WTF
				return !token:generated and prev isnt ',' and (IMPLICIT_END.indexOf(type) >= 0 or (type is 'INDENT' and !seenControl) or (type is 'DOS' and prev != '=')) and (type isnt 'INDENT' or (tokenType(i - 2) isnt 'CLASS' and IMPLICIT_BLOCK.indexOf(prev) == -1 and not (post and ((post:generated and postTyp is '{') or IMPLICIT_CALL.indexOf(postTyp) >= 0))))

			# The action for detecting when the call should end
			# console.log "detect end??"
			detectEnd(i + 1, cond, action)
			T.setTyp(prev,'FUNC_EXIST') if T.typ(prev) == '?'
			i += 2
			# need to reset after a match
			endCallAtTerminator = no
			noCall = no
			seenFor = no


		return

	# Because our grammar is LALR(1), it can't handle some single-line
	# expressions that lack ending delimiters. The **Rewriter** adds the implicit
	# blocks, so it doesn't need to. ')' can close a single-line block,
	# but we need to make sure it's balanced.
	def addImplicitIndentation

		
		var i = 0
		var tokens = @tokens
		while var token = tokens[i]
			var type = T.typ(token)
			var next = tokenType(i + 1)

			# why are we removing terminators after then? should be able to handle
			if type == 'TERMINATOR' and next == 'THEN'
				tokens.splice(i, 1)
				continue

			if type is 'CATCH' and tokenType(i + 2) in ['OUTDENT', 'TERMINATOR', 'FINALLY']
				tokens.splice i + 2, 0, *indentation(token)
				continue i += 4

			if SINGLE_LINERS.indexOf(type) >= 0 and (next != 'INDENT' and next != 'BLOCK_PARAM_START') and not (type == 'ELSE' and next == 'IF') and type != 'ELIF'

				var starter = type

				var indent = T.token('INDENT', '2')
				var outdent = T.OUTDENT
				# var indent, outdent = indentation(token)
				indent:fromThen   = true if starter is 'THEN' # setting special values for these -- cannot really reuse?
				indent:generated  = true
				# outdent:generated = true
				tokens.splice i + 1, 0, indent

				var condition = do |token,i|
					var t = T.typ(token)
					T.val(token) != ';' and SINGLE_CLOSERS.indexOf(t) >= 0 and not (t == 'ELSE' and starter != 'IF' and starter != 'THEN')

				var action = do |token,i|
					var idx = tokenType(i - 1) is ',' ? i - 1 : i
					tokens.splice idx, 0, outdent

				detectEnd(i + 2, condition, action)
				tokens.splice i, 1 if type is 'THEN'
			
			i++

		return

	# Tag postfix conditionals as such, so that we can parse them with a
	# different precedence.
	def tagPostfixConditionals
		var condition = do |token,i| T.typ(token) in ['TERMINATOR', 'INDENT']

		scanTokens do |token, i|
			var typ = T.typ(token)
			return 1 unless typ == 'IF' or typ == 'FOR'
			var original = token
			detectEnd(i + 1, condition) do |token,i|
				T.setTyp(original, 'POST_' + T.typ(original)) if T.typ(token) != 'INDENT'
			1

	# Generate the indentation tokens, based on another token on the same line.
	def indentation token
		[T.token('INDENT', '2'), T.token('OUTDENT', '2')]

	# Look up a type by token index.
	def type i 
		# if i < 0 then return null
		var tok = @tokens[i]
		tok and T.typ(tok)
		# if tok then tok[0] else null

	def tokenType i 
		var tok = @tokens[i]
		tok and T.typ(tok)
		# return tok and tok[0]

# Constants
# ---------

# List of the token pairs that must be balanced.
var BALANCED_PAIRS = [
	['(', ')']
	['[', ']']
	['{', '}']
	['{{', '}}']
	['INDENT', 'OUTDENT'],
	['CALL_START', 'CALL_END']
	['PARAM_START', 'PARAM_END']
	['INDEX_START', 'INDEX_END']
	['TAG_START','TAG_END']
	['TAG_PARAM_START','TAG_PARAM_END']
	['TAG_ATTRS_START','TAG_ATTRS_END']
	['BLOCK_PARAM_START','BLOCK_PARAM_END']
]

# The inverse mappings of `BALANCED_PAIRS` we're trying to fix up, so we can
# look things up from either end.
export var INVERSES = {}

# The tokens that signal the start/end of a balanced pair.
# var EXPRESSION_START = []
# var EXPRESSION_END   = []

for pair in BALANCED_PAIRS
	var left = pair[0]
	var rite = pair[1]
	INVERSES[rite] = left
	INVERSES[left] = rite

var EXPRESSION_START = ['(','[','{','INDENT','CALL_START','PARAM_START','INDEX_START','TAG_PARAM_START','BLOCK_PARAM_START','STRING_START','{{', 'TAG_START']
var EXPRESSION_END = [')',']','}','OUTDENT','CALL_END','PARAM_END','INDEX_END','TAG_PARAM_END','BLOCK_PARAM_END','STRING_END','}}', 'TAG_END']

var IDENTIFIERS = ['IDENTIFIER', 'GVAR', 'IVAR', 'CVAR', 'CONST', 'ARGVAR']

# Tokens that indicate the close of a clause of an expression.
var EXPRESSION_CLOSE = ['CATCH', 'WHEN', 'ELSE', 'FINALLY'].concat EXPRESSION_END

# Tokens that, if followed by an `IMPLICIT_CALL`, indicate a function invocation.
var IMPLICIT_FUNC    = ['IDENTIFIER', 'SUPER', ')', 'INDEX_END', #  'CALL_END',
	'@', 'THIS','SELF', 'EVENT','TRIGGER','TAG_END', 'IVAR', 
	'GVAR', 'CONST', 'ARGVAR', 'NEW', 'BREAK', 'CONTINUE','RETURN'
]

# If preceded by an `IMPLICIT_FUNC`, indicates a function invocation.
var IMPLICIT_CALL    = [
	'SELECTOR','IDENTIFIER', 'NUMBER', 'STRING', 'SYMBOL', 'JS', 'REGEX', 'NEW', 'PARAM_START', 'CLASS'
	'IF', 'UNLESS', 'TRY', 'SWITCH', 'THIS', 'BOOL', 'TRUE','FALSE', 'NULL', 'UNDEFINED', 'UNARY', 'SUPER', 'IVAR', 'GVAR', 'CONST', 'ARGVAR','SELF', 
	'@', '[', '(', '{', '--', '++','SELECTOR', 'TAG_START', 'TAGID', '#', 'SELECTOR_START', 'IDREF', 'SPLAT', 'DO', 'BLOCK_ARG'
	'FOR', 'STRING_START','CONTINUE','BREAK'
] # '->', '=>', why does it not work with symbol?

var IMPLICIT_INDENT_CALL = [
	'FOR'
]
# is not do an implicit call??

var IMPLICIT_UNSPACED_CALL = ['+', '-']

# Tokens indicating that the implicit call must enclose a block of expressions.
var IMPLICIT_BLOCK   = ['{', '[', ',','BLOCK_PARAM_END', 'DO'] # '->', '=>', 

var CONDITIONAL_ASSIGN = ['||=', '&&=', '?=', '&=', '|=']
var COMPOUND_ASSIGN = ['-=', '+=', '/=', '*=', '%=', '||=', '&&=', '?=', '<<=', '>>=', '>>>=', '&=', '^=', '|=']
var UNARY = ['!', '~', 'NEW', 'TYPEOF', 'DELETE']
var LOGIC   = ['&&', '||', '&', '|', '^']

# optimize for fixed arrays
var NO_IMPLICIT_BLOCK_CALL = [
	'CALL_END','=','DEF_BODY','(','CALL_START',',',':','RETURN'
	'-=', '+=', '/=', '*=', '%=', '||=', '&&=', '?=', '<<=', '>>=', '>>>=', '&=', '^=', '|='
] # .concat(COMPOUND_ASSIGN)


# console.log NO_IMPLICIT_BLOCK_CALL:length
# NO_IMPLICIT_BLOCK_CALL
# IMPLICIT_COMMA = ['->', '=>', '{', '[', 'NUMBER', 'STRING', 'SYMBOL', 'IDENTIFIER','DO']

var IMPLICIT_COMMA = ['DO']

# Tokens that always mark the end of an implicit call for single-liners.
var IMPLICIT_END     = ['POST_IF', 'POST_UNLESS', 'POST_FOR', 'WHILE', 'UNTIL', 'WHEN', 'BY', 'LOOP', 'TERMINATOR','DEF_BODY','DEF_FRAGMENT']

# Single-line flavors of block expressions that have unclosed endings.
# The grammar can't disambiguate them, so we insert the implicit indentation.
var SINGLE_LINERS    = ['ELSE', 'TRY', 'FINALLY', 'THEN','BLOCK_PARAM_END','DO','BEGIN','CATCH_VAR'] # '->', '=>', really?
var SINGLE_CLOSERS   = ['TERMINATOR', 'CATCH', 'FINALLY', 'ELSE', 'OUTDENT', 'LEADING_WHEN']

# Tokens that end a line.
var LINEBREAKS       = ['TERMINATOR', 'INDENT', 'OUTDENT']
