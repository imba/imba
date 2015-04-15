
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
		var x = 1000
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

		console.time("tokenize:rewrite") if opts:profile

		step("removeLeadingNewlines")
		step("removeMidExpressionNewlines")
		step("moveMidExpressionComments")
		step("tagDefArguments")
		step("closeOpenCalls")
		step("closeOpenIndexes")
		step("closeOpenTags")
		step("closeOpenRawIndexes")
		step("closeOpenTagAttrLists")
		step("addImplicitIndentation")
		step("tagPostfixConditionals")
		step("addImplicitBraces")
		step("addImplicitParentheses")

		console.timeEnd("tokenize:rewrite") if opts:profile

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
			if levels is 0 and condition.call(this,token,i,starts)
				return action.call(self, token, i)
			if not token or levels < 0
				return action.call(self, token, i - 1)

			t = T.typ(token)

			if t in EXPRESSION_START
				starts.push(i) if levels == 0
				levels += 1
			elif t in EXPRESSION_END
				levels -= 1
			i += 1
		i - 1

	# Leading newlines would introduce an ambiguity in the grammar, so we
	# dispatch them here.
	def removeLeadingNewlines
		var at = 0
		for token,i in @tokens
			if T.typ(token) != 'TERMINATOR'
				break at = i

		@tokens.splice 0, at

	# Some blocks occur in the middle of expressions -- when we're expecting
	# this, remove their trailing newlines.
	def removeMidExpressionNewlines
		scanTokens do |token,i,tokens| # do |token,i,tokens|
			var next = tokenType(i + 1)

			return 1 unless T.typ(token) is 'TERMINATOR' and next in EXPRESSION_CLOSE
			return 1 if next == 'OUTDENT'
			tokens.splice i, 1
			0

	def moveMidExpressionComments
		# console.log "moveMidExpressionComments"
		var terminator = -1

		scanTokens do |token,i,tokens|
			var t = T.typ(token)
			# console.log(token[0])
			if t is 'TERMINATOR'
				# console.log "found terminator at",i
				terminator = i
				return 1

			if t is 'INLINECOMMENT'
				@tokens.splice i, 1
				return 0 if terminator == -1 # hmm

				@tokens.splice terminator + 1, 0, T.token('HERECOMMENT',T.val(token)), T.token('TERMINATOR','\n')
				# console.log("found inline comment!",terminator)
				return 2
			return 1

	def tagDefArguments
		yes

	# The lexer has tagged the opening parenthesis of a method call. Match it with
	# its paired close. We have the mis-nested outdent case included here for
	# calls that close on the same line, just before their outdent.
	def closeOpenCalls
		var condition = do |token,i|
			var t = T.typ(token)
			t in [')', 'CALL_END'] || t is 'OUTDENT' and tokenType(i - 1) is ')'

		var action = do |token, i|
			var t = T.typ(token)
			var tok = @tokens[t == 'OUTDENT' ? i - 1 : i]
			T.setTyp(tok,'CALL_END')
			# [0] = 'CALL_END'

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

	# The lexer has tagged the opening parenthesis of an indexing operation call.
	# Match it with its paired close.
	def closeOpenRawIndexes
		var condition = do |token, i| T.typ(token) in ['}', 'RAW_INDEX_END']
		var action    = do |token, i| T.setTyp(token,'RAW_INDEX_END')

		scanTokens do |token,i|
			detectEnd i + 1, condition, action if T.typ(token) is 'RAW_INDEX_START'
			return 1
	
	def closeOpenTagAttrLists
		var condition = do |token, i| T.typ(token) in [')', 'TAG_ATTRS_END']
		var action    = do |token, i| T.setTyp(token,'TAG_ATTRS_END') # 'TAG_ATTRS_END'

		scanTokens do |token,i|
			detectEnd i + 1, condition, action if T.typ(token) is 'TAG_ATTRS_START'
			return 1
	
	# The lexer has tagged the opening parenthesis of an indexing operation call.
	# Match it with its paired close.
	def closeOpenTags
		var condition = do |token, i| T.typ(token) in ['>', 'TAG_END']
		var action    = do |token, i| T.setTyp(token,'TAG_END') # token[0] = 'TAG_END'

		scanTokens do |token,i|
			detectEnd i + 1, condition, action if T.typ(token) is 'TAG_START'
			return 1
		
	def addImplicitCommas
		return

	def addImplicitBlockCalls
		scanTokens do |token,i,tokens|
			var prev = tokens[i - 1] or []
			var t = T.typ(prev)
			var v = T.val(prev)
			# next = tokens[i+1]

			if t == 'DO' and v in ['RAW_INDEX_END','INDEX_END','IDENTIFIER','NEW']
				# if token[0] == 'DO' and prev and prev[0] not in ['CALL_END','=','DEF_BODY','(','CALL_START',',',':','RETURN']
				# console.log 'added implicit blocs!!'
				tokens.splice i, 0, T.token('CALL_END',')')
				tokens.splice i, 0, T.token('CALL_START','(')
				return 2
			return 1

	# Object literals may be written with implicit braces, for simple cases.
	# Insert the missing braces here, so that the parser doesn't have to.
	def addImplicitBraces
		var stack       = []
		var start       = null
		var startIndent = 0
		var startIdx = null

		var scope = do 
			stack[stack:length - 1] or []

		var action = do |token,i|
			# messy
			var tok = T.token('}', '}',T.loc(token))
			tok:generated = yes
			@tokens.splice i, 0, tok

		var open = do |token,i|
			# FIX 
			var value = String.new('{')
			value:generated = yes # drop this?!
			var tok = T.token('{', value,T.loc(token))
			# T.setLoc(tok,T.loc(token)) # , token[2]]
			tok:generated = yes
			@tokens.splice i, 0, tok

			# s = ["{",i]
			# s:generated = true
			# stack.push(s)

		var close = do |token,i|
			var tok = T.token('}', '}',T.loc(token))
			tok:generated = yes
			@tokens.splice i, 0, tok

		var stackToken = do |a,b|
			return [a,b]
			# var ctx = scope() #  hmmm??

		scanTokens do |token,i,tokens|
			var type = T.typ(token)
			var v = T.val(token)
			var ctx = stack[stack:length - 1] or []
			var idx

			

			if v == '?'
				# console.log('TERNARY OPERATOR!')
				stack.push stackToken('TERNARY',i)
				return 1
			
			if type in EXPRESSION_START
				# console.log('expression start',type)
				if type == 'INDENT' and tokenType(i - 1) == '{'
					# stack ?!? no token
					stack.push stackToken('{', i) # should not autogenerate another?
				else
					stack.push stackToken(type, i)
				return 1

			if type in EXPRESSION_END
				if ctx[0] == 'TERNARY' # FIX?
					stack.pop

				start = stack.pop
				unless start
					console.log "NO STACK!!"
				start[2] = i

				# console.log('the end-expression was',start[0])

				# if start[0] == 'INDENT'
				#   console.log('was indent?')

				# seems like the stack should use tokens, no?)
				if start[0] == '{' and start:generated #  # type != '}' # and start:generated
					# console.log('inside curly-braces!')
					# console.log('the expression is',type)
					close(token,i)
					# hmm - are we sure that we should only return one here?
					return 1

				return 1
			

			if ctx[0] == 'TERNARY' and type in ['TERMINATOR','OUTDENT']
				# really?
				stack.pop
				return 1


			if type == ','
				# automatically add an ending here if inside:generated scope?
				# it is important that this is:generated(!)
				if scope()[0] == '{' and scope():generated
					action.call(this,token,i)
					stack.pop
					# console.log('scope was curly braces')
					return 2
				else
					return 1
				true

			# found a type
			if type == ':' and ctx[0] not in ['{','TERNARY']
				# could just check if the end was right before this?
				
				if start and start[2] == i - 1
					# console.log('this expression was just ending before colon!')
					idx = start[1] - 1 # these are the stackTokens
				else
					# console.log "rewrite here? #{i}"
					idx = i - 2 # if start then start[1] - 1 else i - 2
					# idx = idx - 1 if tokenType(idx) is 'TERMINATOR'

				idx -= 2 while tokenType(idx - 1) is 'HERECOMMENT'

				# idx -= 1 if tokenType(idx - 1) is ','
				var t0 = @tokens[idx - 1]
				# t1 = ago = @tokens[idx]
				# console.log(idx,t0,t1)
				# t = @tokens
				# console.log(t[i-4],t[i-3],t[i-2],t[i-1])

				if t0 and T.typ(t0) == '}' and t0:generated
					# console.log('already inside the:generated token!')
					# console.log(t0,t1,idx,i)
					# removing this
					@tokens.splice(idx - 1,1)
					var s = stackToken('{')
					s:generated = yes
					stack.push s
					return 0

				# hacky edgecase for indents
				else if t0 and T.typ(t0) == ',' and tokenType(idx - 2) == '}'
					@tokens.splice(idx - 2,1)
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
				if prev in ['NUMBER','STRING','REGEX','SYMBOL',']','}',')']

					var tok = T.token(',', ',')
					tok:generated = yes
					@tokens.splice(i,0,tok)

					if ctx:generated
						close(token,i)
						stack.pop
						return 2

			if type in ['TERMINATOR','OUTDENT','DEF_BODY'] and ctx:generated
				close(token,i)
				stack.pop
				return 2

			return 1

	# Methods may be optionally called without parentheses, for simple cases.
	# Insert the implicit parentheses here, so that the parser doesn't have to
	# deal with them.
	# Practically everything will now be callable this way (every identifier)
	def addImplicitParentheses
		var noCall = no
		var noCallTag = ['CLASS', 'IF','UNLESS','TAG','WHILE','FOR','UNTIL','CATCH','FINALLY','MODULE','LEADING_WHEN']
		
		var action = do |token,i|
			@tokens.splice i, 0, T.token('CALL_END', ')', T.loc(token))

		# console.log "adding implicit parenthesis" # ,self:scanTokens

		scanTokens do |token,i,tokens|
			# console.log "detect end??"
			var type = T.typ(token)
			
			# Never make these tags implicitly call
			if type in noCallTag
				noCall  = yes

			var prev    = tokens[i - 1]
			var current = tokens[i]
			var next    = tokens[i + 1]

			var pt = prev and T.typ(prev)
			var nt = next and T.typ(next)
			# [prev, current, next] = tokens[i - 1 .. i + 1]

			# check for comments
			# console.log "detect end??"
			var callObject  = !noCall and type is 'INDENT' and next and ((next:generated and nt is '{') or (nt in IMPLICIT_CALL)) and prev and pt in IMPLICIT_FUNC
			# new test
			var callIndent = !noCall and type is 'INDENT' and next and nt in IMPLICIT_CALL and prev and pt in IMPLICIT_FUNC

			var seenSingle  = no
			var seenControl = no
			# Hmm ?
			# this is not correct if this is inside a block,no?
			noCall      = no if type in ['TERMINATOR','OUTDENT','INDENT']

			token:call  = yes if prev and !prev:spaced and type is '?'

			# where does fromThem come from?
			return 1 if token:fromThen
			# here we deal with :spaced and :newLine
			return 1 unless callObject or callIndent or (prev and prev:spaced) and (prev:call or pt in IMPLICIT_FUNC) and (type in IMPLICIT_CALL or not (token:spaced or token:newLine) and type in IMPLICIT_UNSPACED_CALL)

			tokens.splice i, 0, T.token('CALL_START', '(', T.loc(token))

			var cond = do |token,i|
				var type = T.typ(token)
				return yes if not seenSingle and token:fromThen
				seenSingle  = yes if type in ['IF', 'UNLESS', 'ELSE', 'CATCH', '->', '=>']
				seenControl = yes if type in ['IF', 'UNLESS', 'ELSE', 'SWITCH', 'TRY']
				var prev = tokenType(i - 1)

				return yes if type in ['.', '?.','::'] and prev is 'OUTDENT'

				var post = @tokens[i + 1]
				var postTyp = post and T.typ(post)
				# WTF
				return !token:generated and prev isnt ',' and (type in IMPLICIT_END or (type is 'INDENT' and !seenControl) or (type is 'DOS' and prev not in ['='])) and (type isnt 'INDENT' or (tokenType(i - 2) isnt 'CLASS' and prev not in IMPLICIT_BLOCK and not (post and ((post:generated and postTyp is '{') or postTyp in IMPLICIT_CALL))))

			# The action for detecting when the call should end
			# console.log "detect end??"
			detectEnd(i + 1, cond, action)
			if T.typ(prev) == '?'
				T.setTyp(prev,'FUNC_EXIST')
				# prev[0] = 'FUNC_EXIST' 
			2

	# Because our grammar is LALR(1), it can't handle some single-line
	# expressions that lack ending delimiters. The **Rewriter** adds the implicit
	# blocks, so it doesn't need to. ')' can close a single-line block,
	# but we need to make sure it's balanced.
	def addImplicitIndentation

		scanTokens do |token,i,tokens|
			var type = T.typ(token)
			var next = tokenType(i + 1)

			if type is 'TERMINATOR' and next is 'THEN'
				tokens.splice i, 1
				return 0

			if type is 'CATCH' and tokenType(i + 2) in ['OUTDENT', 'TERMINATOR', 'FINALLY']
				tokens.splice i + 2, 0, *indentation(token) # hmm ...
				return 4

			if type in SINGLE_LINERS and next not in ['INDENT','BLOCK_PARAM_START'] and not (type == 'ELSE' and next == 'IF') and type != 'ELIF'

				var starter = type

				var indent, outdent = indentation(token)
				indent:fromThen   = true if starter is 'THEN'
				indent:generated  = outdent:generated = true
				tokens.splice i + 1, 0, indent

				# outerStarter = starter
				# outerOutdent = outdent

				var condition = do |token,i|
					var t = T.typ(token)
					T.val(token) != ';' and t in SINGLE_CLOSERS and not (t == 'ELSE' and starter not in ['IF', 'THEN'])

				var action = do |token,i|
					var idx = tokenType(i - 1) is ',' ? i - 1 : i
					@tokens.splice idx, 0, outdent

				detectEnd(i + 2, condition, action)
				tokens.splice i, 1 if type is 'THEN'
				return 1
			return 1

	# Tag postfix conditionals as such, so that we can parse them with a
	# different precedence.
	def tagPostfixConditionals
		var condition = do |token,i| T.typ(token) in ['TERMINATOR', 'INDENT']

		scanTokens do |token, i|
			return 1 unless T.typ(token) == 'IF'
			var original = token
			detectEnd(i + 1, condition) do |token,i|
				T.setTyp(original, 'POST_' + T.typ(original)) if T.typ(token) != 'INDENT'
				# original[0] = 'POST_' + original[0] if token[0] isnt 'INDENT'
			1

	# Generate the indentation tokens, based on another token on the same line.
	def indentation token
		[T.token('INDENT', 2, T.loc(token)), T.token('OUTDENT', 2, T.loc(token))]

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
	['INDENT', 'OUTDENT'],
	['CALL_START', 'CALL_END']
	['PARAM_START', 'PARAM_END']
	['INDEX_START', 'INDEX_END']
	['RAW_INDEX_START', 'RAW_INDEX_END']
	['TAG_START','TAG_END']
	['TAG_PARAM_START','TAG_PARAM_END']
	['TAG_ATTRS_START','TAG_ATTRS_END']
	['BLOCK_PARAM_START','BLOCK_PARAM_END']
]

# The inverse mappings of `BALANCED_PAIRS` we're trying to fix up, so we can
# look things up from either end.
export var INVERSES = {}

# The tokens that signal the start/end of a balanced pair.
EXPRESSION_START = []
EXPRESSION_END   = []

for pair in BALANCED_PAIRS
	var left = pair[0]
	var rite = pair[1]
	EXPRESSION_START.push INVERSES[rite] = left
	EXPRESSION_END.push INVERSES[left] = rite

var IDENTIFIERS = ['IDENTIFIER', 'GVAR', 'IVAR', 'CVAR', 'CONST', 'ARGVAR']

# Tokens that indicate the close of a clause of an expression.
var EXPRESSION_CLOSE = ['CATCH', 'WHEN', 'ELSE', 'FINALLY'].concat EXPRESSION_END

# Tokens that, if followed by an `IMPLICIT_CALL`, indicate a function invocation.
var IMPLICIT_FUNC    = ['IDENTIFIER', 'SUPER', ')', ']', 'INDEX_END', #  'CALL_END',
	'@', 'THIS','SELF', 'EVENT','TRIGGER','RAW_INDEX_END','TAG_END', 'IVAR', 
	'GVAR', 'CONST', 'ARGVAR', 'NEW', 'BREAK', 'CONTINUE','RETURN'
]

# If preceded by an `IMPLICIT_FUNC`, indicates a function invocation.
var IMPLICIT_CALL    = [
	'SELECTOR','IDENTIFIER', 'NUMBER', 'STRING', 'SYMBOL', 'JS', 'REGEX', 'NEW', 'PARAM_START', 'CLASS'
	'IF', 'UNLESS', 'TRY', 'SWITCH', 'THIS', 'BOOL', 'UNARY', 'SUPER', 'IVAR', 'GVAR', 'CONST', 'ARGVAR','SELF', 
	'NEW', '@', '[', '(', '{', '--', '++','SELECTOR', 'TAG_START', 'TAGID', '#', 'SELECTOR_START', 'IDREF', 'SPLAT', 'DO', 'BLOCK_ARG'
] # '->', '=>', why does it not work with symbol?
# is not do an implicit call??

var IMPLICIT_UNSPACED_CALL = ['+', '-']

# Tokens indicating that the implicit call must enclose a block of expressions.
var IMPLICIT_BLOCK   = ['{', '[', ',','BLOCK_PARAM_END', 'DO'] # '->', '=>', 

var CONDITIONAL_ASSIGN = ['||=', '&&=', '?=', '&=', '|=']
var COMPOUND_ASSIGN = ['-=', '+=', '/=', '*=', '%=', '||=', '&&=', '?=', '<<=', '>>=', '>>>=', '&=', '^=', '|=']
var UNARY = ['!', '~', 'NEW', 'TYPEOF', 'DELETE']
var LOGIC   = ['&&', '||', '&', '|', '^']

var NO_IMPLICIT_BLOCK_CALL = ['CALL_END','=','DEF_BODY','(','CALL_START',',',':','RETURN'].concat(COMPOUND_ASSIGN)
# NO_IMPLICIT_BLOCK_CALL
# IMPLICIT_COMMA = ['->', '=>', '{', '[', 'NUMBER', 'STRING', 'SYMBOL', 'IDENTIFIER','DO']

var IMPLICIT_COMMA = ['DO']

# Tokens that always mark the end of an implicit call for single-liners.
var IMPLICIT_END     = ['POST_IF', 'POST_UNLESS', 'FOR', 'WHILE', 'UNTIL', 'WHEN', 'BY', 'LOOP', 'TERMINATOR','DEF_BODY','DEF_FRAGMENT']

# Single-line flavors of block expressions that have unclosed endings.
# The grammar can't disambiguate them, so we insert the implicit indentation.
var SINGLE_LINERS    = ['ELSE', 'TRY', 'FINALLY', 'THEN','BLOCK_PARAM_END','DO','BEGIN','CATCH_VAR'] # '->', '=>', really?
var SINGLE_CLOSERS   = ['TERMINATOR', 'CATCH', 'FINALLY', 'ELSE', 'OUTDENT', 'LEADING_WHEN']

# Tokens that end a line.
var LINEBREAKS       = ['TERMINATOR', 'INDENT', 'OUTDENT']
