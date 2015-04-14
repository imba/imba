
extern parseInt, parseFloat

var rw = require './rewriter'
var Rewriter = rw.Rewriter
var INVERSES = rw.INVERSES

export class LexerError < SyntaxError
	
	def initialize message, file, line
		self:message = message
		self:file = file
		self:line = line
		return self

def starts string, literal, start
	string.substr(start,literal:length) == literal
	# could rather write as string.indexOf(literal) == 0

def last array, back = 0
	array[array:length - back - 1]

def count str, substr
	var num = 0
	var pos = 0
	unless substr:length
		return 1 / 0

	while pos = 1 + str.indexOf(substr,pos)
		num++ 
	num


# The Lexer class reads a stream of Imba and divvies it up into tokidged
# tokens. Some potential ambiguity in the grammar has been avoided by
# pushing some extra smarts into the Lexer.

# Based on the original lexer.coffee from CoffeeScript
export class Lexer


	def tokenize code, o = {}
		code     = "\n{code}" if WHITESPACE.test code

		# this makes us lose the loc-info, no?
		code     = code.replace(/\r/g, '').replace TRAILING_SPACES, ''

		@last    = nil
		@lastTyp = nil
		@lastVal = nil

		@code    = code           # The remainder of the source code.
		@opts    = o
		@line    = o:line or 0    # The current line.
		@indent  = 0              # The current indentation level.
		@indebt  = 0              # The over-indentation at the current level.
		@outdebt = 0              # The under-outdentation at the current level.
		@indents = []             # The stack of all current indentation levels.
		@ends    = []             # The stack for pairing up tokens.
		@tokens  = []             # Stream of parsed tokens in the form `['TYPE', value, line]`.
		@char 	 = nil
		@locOffset = o:loc or 0

		console.time("tokenize:lexer") if o:profile

		var contexts = {
			TAG: self:tagContextToken
		}

		var fn = nil
		var i = 0

		while @chunk = code.slice(i)
			@loc = @locOffset + i
			@end = @ends[@ends:length - 1]
			var chr = @char = @chunk[0]
			fn = contexts[@end]

			if chr == '@'
				i += identifierToken || literalToken
			else
				i += fn && fn.call(this) || basicContext # selectorToken || symbolToken || methodNameToken || identifierToken || whitespaceToken || lineToken || commentToken || heredocToken || tagToken || stringToken || numberToken || regexToken || jsToken || literalToken

		closeIndentation
		error "missing {tok}" if var tok = @ends.pop
		console.timeEnd("tokenize:lexer") if o:profile

		# compatibility
		self:tokens = @tokens

		return @tokens if o:rewrite == no or o:norewrite
		@tokens

		return Rewriter.new.rewrite @tokens, o


	def basicContext
		return selectorToken || symbolToken || methodNameToken || identifierToken || whitespaceToken || lineToken || commentToken || heredocToken || tagToken || stringToken || numberToken || regexToken || jsToken || literalToken


	def context opt
		var i = @ends:length - 1
		if opt
			var o = @ends["_" + i]
			o and o[opt]
		else
			@ends[i]


	def pushEnd val
		# console.log "pushing end",val
		@ends.push(val)
		self


	def scope sym, opts
		# need to rewrite the whole ends to not use characters
		var len = @ends.push(sym)
		# console.log "scoping",sym,opts,@ends,len

		if opts
			@ends["_" + (len - 1)] = opts

		return sym
	

	def closeSelector
		pair('%') if context == '%'
	

	def openDef
		@ends.push('DEF')


	def closeDef
		if context is 'DEF'
			var prev = last(@tokens)
			# console.log('closeDef with last>',prev)
			if prev[0] == 'DEF_FRAGMENT'
				true
			else
				if prev[0] == 'TERMINATOR'
					var pop = @tokens.pop

				token('DEF_BODY', 'DEF_BODY')
				@tokens.push(pop) if pop

			pair('DEF')
		return



	def tagContextToken
		if var match = TAG_TYPE.exec(@chunk)
			token 'TAG_TYPE', match[0]
			return match[0]:length

		if var match = TAG_ID.exec(@chunk)
			var input = match[0]
			token 'TAG_ID', input
			return input:length

		return 0


	def tagToken
		return 0 unless var match = TAG.exec(@chunk)
		var input, type, identifier = match

		if type == '<'
			token 'TAG_START', '<'
			@ends.push INVERSES['TAG_START']

			if identifier
				if identifier.substr(0,1) == '{'
					return type:length
				else
					token 'TAG_NAME', input.substr(1)

		return input:length


	def selectorToken
		var match

		# special handling if we are in this context
		if context == '%'
			var chr = @chunk.charAt(0)

			if match = SELECTOR_COMBINATOR.exec(@chunk)
				# console.log 'selector match', match
				if context('open')
					# console.log 'should close the scope!!!'
					pair '%'
					return 0
				token 'SELECTOR_COMBINATOR', match[1] || " "
				return match[0]:length
			
			elif match = SELECTOR_PART.exec(@chunk)
				var type = match[1]
				var id = match[2]

				var tokid = switch type
					when '.' then 'SELECTOR_CLASS'
					when '#' then 'SELECTOR_ID'
					when ':' then 'SELECTOR_PSEUDO_CLASS'
					when '::' then 'SELECTOR_PSEUDO_CLASS'
					else 'SELECTOR_TAG'

				token tokid, match[2]
				return match[0]:length

			# elif match = SELECTOR_PSEUDO_CLASS.exec(@chunk)
			#  token tokid, match[2]
			#  return match[0]:length
			
			elif chr == '['
				token '[','['
				@ends.push ']'
				if match = SELECTOR_ATTR.exec(@chunk)
					token 'IDENTIFIER', match[1]
					token 'SELECTOR_ATTR_OP', match[2]
					return match[0]:length
				return 1

			elif chr == '|'
				var tok = @tokens[@tokens:length - 1]
				tok[0] = 'SELECTOR_NS'
				return 1

			elif chr == ','
				if context('open')
					pair '%'
					return 0

				token 'SELECTOR_GROUP',','
				return 1
			elif chr == '*'
				token 'UNIVERSAL_SELECTOR','*'
				return 1
			
			# what, really?
			elif chr in [')','}',']','']
				pair '%'
				return 0

			# how to get out of the scope?


		return 0 unless match = SELECTOR.exec(@chunk)
		var input, id, kind = match

		# this is a closed selector
		if kind == '('
			token '(','('
			token 'SELECTOR_START', id
			@ends.push ')'
			@ends.push '%'
			return id:length + 1

		elif id == '%'
			# we are already scoped in on a selector
			return 1 if context == '%'
			token 'SELECTOR_START', id
			# get into the selector-scope
			scope('%', open: yes)
			# @ends.push '%'
			# make sure a terminator breaks out
			return id:length
		else
			return 0

		if id in ['%','$'] and chr in ['%','$','@','(','[']
			var idx = 2
			

			# VERY temporary way of solving this
			if chr in ['%','$','@']
				id += chr
				idx = 3
				chr = @chunk.charAt(2)


			if chr == '('
				return 0 unless var string = balancedSelector(@chunk, ')')
				if 0 < string.indexOf('{', 1)
					token 'SELECTOR',id
					interpolateSelector(string.slice idx, -1)
					return string:length
				else
					token 'SELECTOR',id
					token '(','('
					token 'STRING', '"'+string.slice(idx,-1)+'"'
					token ')',')'
					return string:length

			elif chr == '['
				token 'SELECTOR',id
				return 1
				# token '[','['
				# @ends.push ''
		else
			return 0
	
	# is this really needed? Should be possible to
	# parse the identifiers and = etc i jison?
	# what is special about methodNameToken? really?
	def methodNameToken
		return 0 if @char == ' '

		var match

		var outerctx = @ends[@ends:length - 2]
		var innerctx = @ends[@ends:length - 1]

		if outerctx == '%' and innerctx == ')'
			# console.log 'context is inside!!!'
			if match = TAG_ATTR.exec(@chunk)
				token 'TAG_ATTR_SET',match[1]
				return match[0]:length

		return 0 unless match = METHOD_IDENTIFIER.exec(@chunk)
		# var prev = last @tokens
		var length = match[0]:length
		
		var id = match[0]
		var typ = 'IDENTIFIER'
		var pre = id.substr(0,1)
		var space = no

		unless @lastTyp in ['.','DEF'] or match[4] in ['!','?'] or match[5]
			return 0

		if id.toUpperCase() in ['SELF','THIS']
			return 0

		if id == 'super'
			return 0

		if id == 'new'
			typ = 'NEW'

		if id == '...' and @lastTyp in [',','(','CALL_START','BLOCK_PARAM_START','PARAM_START']
			return 0

		if id == '|'
			# hacky way to implement this
			# with new lexer we'll use { ... } instead, and assume object-context,
			# then go back and correct when we see the context is invalid
			if @lastTyp in ['(','CALL_START']
				token 'DO', 'DO'
				@ends.push '|'
				token 'BLOCK_PARAM_START', id
				return length

			elif @lastTyp in ['DO','{']
				@ends.push '|'
				token 'BLOCK_PARAM_START', id
				return length
				
			elif @ends[@ends:length - 1] == '|'
				token 'BLOCK_PARAM_END', '|'
				pair '|'
				return length

			else
				return 0

		# whaat?
		# console.log("method identifier",id)
		if (id in ['&','^','<<','<<<','>>'] or (id == '|' and context != '|'))
			return 0

		if id in OP_METHODS
			space = yes

		if pre == '@'
			typ = 'IVAR'
			id  = String.new id
			id:wrap = yes

		elif pre == '$'
			typ = 'GVAR'

		elif pre == '#'
			typ = 'TAGID'

		elif CONST_IDENTIFIER.test(pre) or id in GLOBAL_IDENTIFIERS
			# console.log('global!!',typ,id)
			typ = 'CONST'

		if match[4] or match[5] or id == 'eval' or id == 'arguments' or id in JS_FORBIDDEN
			# console.log('got here')
			id = String.new(id)
			id:wrap = yes
		
		if match[5] and @lastTyp in ['IDENTIFIER','CONST','GVAR','CVAR','IVAR','SELF','THIS',']','}',')','NUMBER','STRING','IDREF']
			token '.','.'
	
		token typ, id

		if space
			# console.log("add space here")
			last(@tokens):spaced = yes 
			# token ' ', ' '

		return length


	def inTag
		var ctx1 = @ends[@ends:length - 2]
		var ctx0 = @ends[@ends:length - 1]
		return ctx0 == 'TAG_END' or (ctx1 == 'TAG_END' and ctx0 == 'OUTDENT')

	# Matches identifying literals: variables, keywords, method names, etc.
	# Check to ensure that JavaScript reserved words aren't being used as
	# identifiers. Because Imba reserves a handful of keywords that are
	# allowed in JavaScript, we're careful not to tokid them as keywords when
	# referenced as property names here, so you can still do `jQuery.is()` even
	# though `is` means `===` otherwise.
	def identifierToken
		var match

		var ctx1 = @ends[@ends:length - 2]
		var ctx0 = @ends[@ends:length - 1]
		var innerctx = ctx0
		var typ

		var addLoc = false
		var inTag = ctx0 == 'TAG_END' or (ctx1 == 'TAG_END' and ctx0 == 'OUTDENT')

		# console.log ctx1,ctx0
	
		if inTag && match = TAG_ATTR.exec(@chunk)
			# console.log 'TAG_ATTR IN tokid'
			# var prev = last @tokens
			# if the prev is a terminator, we dont really need to care?
			if @lastTyp != 'TAG_NAME' # hmm - it will never be tokidname now?
				if @lastTyp == 'TERMINATOR'
					# console.log('prev was terminator -- drop it?')
					true
				else
					token(",", ",")

			token 'TAG_ATTR',match[1]
			token '=','='
			return match[0]:length

		# see if this is a plain object-key
		# way too much logic going on here?
		# the ast should normalize whether keys
		# are accessable as keys or strings etc
		if match = OBJECT_KEY.exec(@chunk)
			var id = match[1]
			var typ = 'IDENTIFIER'

			token typ, id
			token ':', ':'

			return match[0]:length

		unless match = IDENTIFIER.exec(@chunk)
			return 0

		var input, id, typ, m3, m4, colon = match

		# What is the logic here?
		if id is 'own' and tokid() is 'FOR'
			token 'OWN', id
			return id:length

		var prev = last @tokens
		var lastTyp = @lastTyp
		# should we force this to be an identifier even if it is a reserved word?
		# this should only happen for when part of object etc
		# will prev ever be @???
		var forcedIdentifier

		forcedIdentifier = colon || lastTyp == '.' or lastTyp == '?.' # in ['.', '?.'


		# temp hack! need to solve for other keywords etc as well
		# problem appears with ternary conditions.

		# well -- it should still be an indentifier if in object?
		# forcedIdentifier = no if id in ['undefined','break']

		forcedIdentifier = no if colon and lastTyp == '?' # for ternary

		# if we are not at the top level? -- hacky
		if id == 'tag' and @chunk.indexOf("tag(") == 0 # @chunk.match(/^tokid\(/)
			forcedIdentifier = yes

		# little reason to check for this right here? but I guess it is only a simple check
		if typ == '$' and ARGVAR.test(id) # id.match(/^\$\d$/)
			if id == '$0'
				typ = 'ARGUMENTS'
			else
				typ = 'ARGVAR'
				id = id.substr(1)

		elif typ == '@'
			typ = 'IVAR'
			id  = String.new id
			id:wrap = yes

			# id:reserved = yes if colon
		elif typ == '#'
			# we are trying to move to generic tokens,
			# so we are starting to splitting up the symbols and the items
			# we'll see if that works
			typ = 'IDENTIFIER'
			token '#', '#'
			id = id.substr(1)

		elif typ == '@@'
			id  = String.new id
			id:wrap = yes
			typ = 'CVAR'

		elif typ == '$' and not colon
			typ = 'GVAR'

		elif CONST_IDENTIFIER.test(id) or id in GLOBAL_IDENTIFIERS
			typ = 'CONST'

		elif id == 'elif'
			token 'ELSE', 'else'
			token 'IF', 'if'
			return id:length

		else
			typ = 'IDENTIFIER'

		if not forcedIdentifier and (id in JS_KEYWORDS or id in IMBA_KEYWORDS)
			typ = id.toUpperCase
			addLoc = true

			if typ == 'TAG'

				@ends.push('TAG')
			# FIXME @ends is not used the way it is supposed to..
			# what we want is a context-stack
			if typ == 'DEF'
				openDef

			elif typ == 'DO'
				closeDef if context == 'DEF'

			elif typ is 'WHEN' and tokid() in LINE_BREAK
				typ = 'LEADING_WHEN'

			elif typ is 'FOR'
				@seenFor = yes

			elif typ is 'UNLESS'
				typ = 'IF' # WARN

			elif typ in UNARY
				typ = 'UNARY'

			elif typ in RELATION
				if typ not in ['INSTANCEOF','ISA'] and @seenFor
					typ = 'FOR' + typ # ?
					@seenFor = no
				else
					typ = 'RELATION'
					if value().toString() is '!'
						@tokens.pop # is fucked up??!
						# WARN we need to keep the loc, no?
						id = '!' + id

		if id == 'super'
			typ = 'SUPER'

		elif id == 'eval' or id == 'arguments' or id in JS_FORBIDDEN

			if forcedIdentifier 
				typ = 'IDENTIFIER'
				# console.log('got here')
				# wrapping strings do create problems
				# it might actually be better to append some special info
				# directly to the string -- and then parse that in the ast
				id = String.new id
				id:reserved = yes

			elif id in RESERVED

				# if id in STRICT_RESERVED
				# 	error "reserved word \"{id}\"", id:length

				id = String.new id
				id:reserved = yes

		unless forcedIdentifier
			id  = IMBA_ALIAS_MAP[id] if id in IMBA_ALIASES
			switch id
				when '√'                                  then typ = 'SQRT'
				when 'ƒ'                                  then typ = 'FUNC'
				when '!'                                  then typ = 'UNARY'
				when '==', '!=', '===', '!=='             then typ = 'COMPARE'
				when '&&', '||'                           then typ = 'LOGIC'
				when '∪', '∩'                             then typ = 'MATH'
				when 'true', 'false', 'null', 'nil', 'undefined' then typ = 'BOOL'
				when 'break', 'continue', 'debugger','arguments' then typ = id.toUpperCase

		# prev = last @tokens
		var len = input:length

		# should be strict about the order, check this manually instead
		if typ == 'CLASS' or typ == 'DEF' or typ == 'TAG' or typ == 'VAR'
			var i = @tokens:length
			# console.log("FOUND CLASS/DEF",i)
			while i
				var prev = @tokens[--i]
				var ctrl = prev && ( "" + prev[1] )
				# need to coerce to string because of stupid CS ===
				# console.log("prev is",prev[0],prev[1])
				if ctrl in IMBA_CONTEXTUAL_KEYWORDS
					prev[0] = ctrl.toUpperCase # what?
				else
					break

		if typ == 'IMPORT'
			@ends.push 'IMPORT'

		elif id == 'from' and ctx0 == 'IMPORT'
			typ = 'FROM'
			pair 'IMPORT'

		# will be much cleaner with the new handmade combined lexer+parser
		# for now we need to do some testing
		elif id == 'as' and ctx0 == 'IMPORT'
			typ = 'AS'
			pair 'IMPORT'

		if typ == 'IDENTIFIER'
			# see if previous was catch -- belongs in rewriter?
			if lastTyp == 'CATCH'
				typ = 'CATCH_VAR'
			token typ, id, len # hmm

		elif addLoc
			token typ, id, len, true
		else
			token typ, id

		token ':', ':' if colon # _what_?
		return len

	# Matches numbers, including decimals, hex, and exponential notation.
	# Be careful not to interfere with ranges-in-progress.
	def numberToken
		var match, number, lexedLength

		return 0 unless match = NUMBER.exec(@chunk)

		number = match[0]
		lexedLength = number:length

		if var binaryLiteral = /0b([01]+)/.exec(number)
			number = (parseInt binaryLiteral[1], 2).toString

		var prev = last(@tokens)

		if match[0][0] == '.' && prev && !prev:spaced && prev[0] in ['IDENTIFIER',')','}',']','NUMBER']
			# console.log('FIX NUM')
			token ".","."
			number = number.substr(1)

		token 'NUMBER', number
		lexedLength
	
	def symbolToken
		var match, symbol, prev

		return 0 unless match = SYMBOL.exec(@chunk)
		symbol = match[0].substr(1)
		prev = last(@tokens)

		# is this a property-access?
		# should invert this -- only allow when prev IS .. 
		# hmm, symbols not be quoted initially
		# : should be a token itself, with a specification of spacing (LR,R,L,NONE)
		if prev and !prev:spaced and prev[0] not in ['(','{','[','.','RAW_INDEX_START','CALL_START','INDEX_START',',','=','INDENT','TERMINATOR']
			token '.','.'
			symbol = symbol.split(/[\:\\\/]/)[0] # really?
			# token 'SYMBOL', "'#{symbol}'"
			token 'SYMBOL', symbol
			return symbol:length+1
		else
			# token 'SYMBOL', "'#{symbol}'"
			token 'SYMBOL', symbol
			match[0]:length

	# Matches strings, including multi-line strings. Ensures that quotation marks
	# are balanced within the string's contents, and within nested interpolations.
	def stringToken
		var match, string

		switch @chunk.charAt 0
			when "'"
				return 0 unless match = SIMPLESTR.exec(@chunk)
				token 'STRING', (string = match[0]).replace(MULTILINER, '\\\n')
			when '"'
				return 0 unless string = balancedString(@chunk, '"')
				if string.indexOf('{') >= 0
					interpolateString(string.slice 1, -1)
				else
					token 'STRING', escapeLines(string)
			else
				return 0
		@line += count(string, '\n')

		return string:length

	# Matches heredocs, adjusting indentation to the correct level, as heredocs
	# preserve whitespace, but ignore indentation to the left.
	def heredocToken
		var match, heredoc, quote, doc

		return 0 unless match = HEREDOC.exec(@chunk)

		heredoc = match[0]
		quote = heredoc.charAt 0
		doc = sanitizeHeredoc(match[2], quote: quote, indent: null)

		if quote == '"' && 0 <= doc.indexOf('{')
			interpolateString(doc, heredoc: yes)
		else
			token 'STRING', makeString(doc, quote, yes)

		@line += count heredoc, '\n'

		return heredoc:length

	# Matches and consumes comments.
	def commentToken
		var match, length, comment, indent, prev

		var typ = 'HERECOMMENT'

		if match = @chunk.match(INLINE_COMMENT)
			length = match[0]:length
			comment = match[2]
			indent = match[1]
			# console.log "match inline token (#{indent}) indent",comment,@indent,indent:length
			# ADD / FIX INDENTATION? 
			prev = last(@tokens)
			var pt = prev and prev[0]
			var note = '// ' + comment.substr(2)

			if pt and pt not in ['INDENT','TERMINATOR']
				# console.log "skip comment"
				# token 'INLINECOMMENT', comment.substr(2)
				token 'TERMINATOR', note # + '\n' # hmmm // hmmm
				# not sure about this
				return length
			#  return match[0]:length
			else
				if pt == 'TERMINATOR'
					prev[1] += note
				elif pt == 'INDENT'
					addLinebreaks(1,note)
				else
					# console.log "comment here"
					token typ, comment.substr(2) # are we sure?
				# addLinebreaks(5)
				false
				# maybe add a linebreak here?
				# addLinebreaks(0)
				# token 'TERMINATOR', '\\n' # hmm
			
			return length # disable now while compiling

		# should use exec?
		return 0 unless match = @chunk.match COMMENT

		var comment = match[0]
		var here = match[1]

		if here
			token 'HERECOMMENT', sanitizeHeredoc(here, herecomment: true, indent: Array(@indent + 1).join(' '))
			token 'TERMINATOR', '\n'
		else
			# console.log "FOUND COMMENT",comment
			token 'HERECOMMENT', comment
			token 'TERMINATOR', '\n'

		@line += count comment, '\n'

		return comment:length

	# Matches JavaScript interpolated directly into the source via backticks.
	def jsToken
		var match, script

		return 0 unless @chunk.charAt(0) is '`' and match = JSTOKEN.exec(@chunk)
		token 'JS', (script = match[0]).slice 1, -1
		script:length

	# Matches regular expression literals. Lexing regular expressions is difficult
	# to distinguish from division, so we borrow some basic heuristics from
	# JavaScript and Ruby.
	def regexToken
		var match, length, prev

		return 0 if @chunk.charAt(0) isnt '/'
		if match = HEREGEX.exec(@chunk)
			length = heregexToken(match)
			@line += count match[0], '\n'
			return length

		prev = last @tokens
		return 0 if prev and (prev[0] in (if prev:spaced then NOT_REGEX else NOT_SPACED_REGEX))
		return 0 unless match = REGEX.exec(@chunk)
		var m, regex, flags = match

		# FIXME
		# if regex[..1] is '/*'
		#	error 'regular expressions cannot begin with `*`'

		if regex == '//'
			regex = '/(?:)/'

		token 'REGEX', "{regex}{flags}"
		m:length

	# Matches multiline extended regular expressions.
	def heregexToken match
		var heregex, body, flags = match

		if 0 > body.indexOf('#{')

			var re = body.replace(HEREGEX_OMIT, '').replace(/\//g, '\\/')

			if re.match(/^\*/)
				error 'regular expressions cannot begin with `*`'

			token 'REGEX', "/{ re or '(?:)' }/{flags}"
			return heregex:length

		token 'CONST', 'RegExp'
		@tokens.push ['CALL_START', '(']
		var tokens = []

		for pair in interpolateString(body, regex: yes)
			var tokid = pair[0]
			var value = pair[1]

			if tokid == 'TOKENS'
				# FIXME what is this?
				tokens.push *value
			else
				continue unless value = value.replace(HEREGEX_OMIT, '')

				value = value.replace /\\/g, '\\\\'
				tokens.push ['STRING', makeString(value, '"', yes)]
			tokens.push ['+', '+']

		tokens.pop

		unless tokens[0] and tokens[0][0] is 'STRING'
			@tokens.push ['STRING', '""'], ['+', '+']

		@tokens.push *tokens # what is this?
		@tokens.push [',', ','], ['STRING', '"' + flags + '"'] if flags
		token ')', ')'

		return heregex:length

	# Matches newlines, indents, and outdents, and determines which is which.
	# If we can detect that the current line is continued onto the the next line,
	# then the newline is suppressed:
	#
	#     elements
	#       .each( ... )
	#       .map( ... )
	#
	# Keeps track of the level of indentation, because a single outdent token
	# can close multiple indents, so we need to know how far in we happen to be.
	def lineToken
		var match

		return 0 unless match = MULTI_DENT.exec(@chunk)

		pair('%') if @ends[@ends:length - 1] is '%'
		
		var indent = match[0]
		var brCount = count indent, '\n'

		@line += brCount
		@seenFor = no

		var prev = last @tokens, 1
		var size = indent:length - 1 - indent.lastIndexOf '\n'
		var noNewlines = self.unfinished

		# console.log "noNewlines",noNewlines
		# console.log "lineToken -- ",@chunk.substr(0,10),"--"
		if @chunk.match(/^\n#\s/)
		 #  console.log "comment on outermost line"
			# token 'TERMINATOR','\\n'
			addLinebreaks(1)
			# console.log "add terminator"
			return 0

		if size - @indebt is @indent
			if noNewlines
				suppressNewlines()
			else
				newlineToken(indent)
			return indent:length

		if size > @indent
			if noNewlines
				@indebt = size - @indent
				suppressNewlines
				return indent:length

			if inTag()
				# console.log "indent inside tokid?!?"
				# @indebt = size - @indent
				# suppressNewlines()
				return indent:length


			var diff = size - @indent + @outdebt
			closeDef()

			var immediate = last(@tokens)

			if immediate and immediate[0] == 'TERMINATOR'
				# console.log "terminator before indent??"
				var node = Number.new(diff)
				node:pre = immediate[1]
				immediate[0] = 'INDENT'
				immediate[1] = node # {count: diff, pre: immediate[0]}

			else
				token 'INDENT', diff

			# console.log "indenting", prev, last(@tokens,1)
			# if prev and prev[0] == 'TERMINATOR'
			#   console.log "terminator before indent??"

			# check for comments as well ?

			@indents.push diff
			@ends   .push 'OUTDENT'
			@outdebt = @indebt = 0
			addLinebreaks(brCount)
		else
			@indebt = 0
			outdentToken @indent - size, noNewlines, brCount
			addLinebreaks(brCount - 1)
			# console.log "outdent",noNewlines,tokid()

		@indent = size
		return indent:length

	# Record an outdent token or multiple tokens, if we happen to be moving back
	# inwards past several recorded indents.
	def outdentToken moveOut, noNewlines, newlineCount
		var dent = 0
		while moveOut > 0
			var len = @indents:length - 1
			if @indents[len] is undefined
				moveOut = 0
			elif @indents[len] is @outdebt
				moveOut -= @outdebt
				@outdebt = 0
			elif @indents[len] < @outdebt
				@outdebt -= @indents[len]
				moveOut  -= @indents[len]
			else
				dent = @indents.pop - @outdebt
				moveOut -= dent
				@outdebt = 0

				addLinebreaks(1) unless noNewlines # hmm

				pair 'OUTDENT'
				token 'OUTDENT', dent

		@outdebt -= moveOut if dent
		@tokens.pop() while value() is ';'
		# console.log "outdenting",tokid() 

		# addLinebreaks(1) unless noNewlines
		# really?
		token 'TERMINATOR', '\n' unless tokid() is 'TERMINATOR' or noNewlines


		var ctx = context
		pair(ctx) if ctx in ['%','TAG']
		closeDef
		return this

	# Matches and consumes non-meaningful whitespace. tokid the previous token
	# as being "spaced", because there are some cases where it makes a difference.
	def whitespaceToken
		var match, nline, prev
		return 0 unless (match = WHITESPACE.exec(@chunk)) || (nline = @chunk.charAt(0) is '\n')
		prev = last @tokens

		# console.log('whitespace?',match,nline,prev && prev[0])
		# if nline
		#  console.log('whitespace newline',prev)
		# else

		# PERF
		prev[match ? 'spaced' : 'newLine'] = true if prev
		match ? match[0]:length : 0

	def addNewline
		token 'TERMINATOR', '\n'

	def addLinebreaks count, raw
		var prev, br

		return this if !raw and count == 0 # no terminators?

		prev = last @tokens
		br = Array.new(count + 1).join('\n')

		if prev and prev[0] == 'INDENT'
			if typeof prev[1] == 'object' # hmmm
				# console.log 'add to indent directly'
				prev[1]:post = (prev[1]:post || "") + (raw or br)
				# console.log "adding terminator after indent"
			else
				prev[1] = "{prev[1]}_{count}" # br
			return this

		if prev and prev[0] == 'TERMINATOR'
			# console.log "already exists terminator"
			prev[1] = prev[1] + br
			return this
		
		token 'TERMINATOR', br
		this

	# Generate a newline token. Consecutive newlines get merged together.
	def newlineToken chunk
		# console.log "newlineToken"
		@tokens.pop while value() is ';' # hmm
		var prev = last @tokens

		# console.log "newline token"

		# if prev and prev[0] is 'TERMINATOR'
		#   console.log('multiple newlines?')
		# console.log('newline',tokid())
		# console.log('newline!')
		var t = tokid()
		# arr = ['\\n']
		
		# i = 0
		# arr.push('\\n') until (++i) == lines
		var lines = count(chunk, '\n')
		
		addLinebreaks(lines)

		# if false
		#   unless t is 'TERMINATOR'
		#     token 'TERMINATOR', arr.join("") 
		#   else
		#     console.log "already a terminator!!"
		
		# pair('%') if context is '%'
		# pair('%') if context is '%'
		var ctx = context
		# Ghost?
		# WARN now import cannot go over multiple lines
		pair(ctx) if ctx in ['%','TAG','IMPORT']

		closeDef()

		this

	# Use a `\` at a line-ending to suppress the newline.
	# The slash is removed here once its job is done.
	def suppressNewlines
		@tokens.pop() if value() is '\\'
		this

	# We treat all other single characters as a token. E.g.: `( ) , . !`
	# Multi-character operators are also literal tokens, so that Jison can assign
	# the proper order of operations. There are some symbols that we tokid specially
	# here. `;` and newlines are both treated as a `TERMINATOR`, we distinguish
	# parentheses that indicate a method call from regular parentheses, and so on.
	def literalToken
		var match, value
		if match = OPERATOR.exec(@chunk)
			value = match[0]
			tagParameters if CODE.test(value)
		else
			value = @chunk.charAt 0
		
		var end1 = @ends[@ends:length - 1]
		var end2 = @ends[@ends:length - 2]

		var inTag = end1 == 'TAG_END' or end1  == 'OUTDENT' and end2 == 'TAG_END'

		var tokid  = value
		var prev = last @tokens
		var length = value:length

		# is this needed?
		if value is '=' and prev

			if not prev[1]:reserved and prev[1] in JS_FORBIDDEN
				@error "reserved word \"#{value()}\" can't be assigned"

			if prev[1] in ['||', '&&']
				prev[0] = 'COMPOUND_ASSIGN'
				prev[1] += '='
				return value:length

		if value is ';'             
			@seenFor = no
			tokid = 'TERMINATOR'

		elif value is '(' and inTag and prev[0] != '=' and prev:spaced
			# console.log 'spaced before ( in tokid'
			# FIXME - should rather add a special token like TAG_PARAMS_START
			token ',',','

		elif value is '->' and inTag
			tokid = 'TAG_END'
			pair 'TAG_END'

		elif value is '/>' and inTag
			tokid = 'TAG_END'
			pair 'TAG_END'

		elif value is '>' and inTag
			tokid = 'TAG_END'
			pair 'TAG_END'

		# this is a tokid-method
		elif value is '>' and context == 'DEF'
			# console.log('picked up >!!')
			tokid = 'DEF_FRAGMENT'
	
		elif value is 'TERMINATOR' and end1 is '%' 
			closeSelector()

		elif value is 'TERMINATOR' and end1 is 'DEF'
			closeDef()

		# TODO BLOCK PARAM BUG
		# really+
		elif value is '&' and context == 'DEF'
			# console.log("okay!")
			tokid = 'BLOCK_ARG'
			# change the next identifier instead?

		# elif value.match()
		elif value == '*' and @chunk.charAt(1).match(/[A-Za-z\_\@\[]/) and (prev:spaced or prev[1] in [',','(','[','{','|','\n','\t'])
			tokid = "SPLAT"

		elif value == '√'
			tokid = 'SQRT'
		elif value == 'ƒ'
			tokid = 'FUNC'
		elif value in MATH
			tokid = 'MATH'
		elif value in COMPARE
			tokid = 'COMPARE'
		elif value in COMPOUND_ASSIGN
			tokid = 'COMPOUND_ASSIGN'
		elif value in UNARY
			tokid = 'UNARY'
		elif value in SHIFT
			tokid = 'SHIFT'
		elif value in LOGIC
			tokid = 'LOGIC' # or value is '?' and prev?:spaced 

		elif prev and !prev:spaced
			# need a better way to do these
			if value is '(' and end1 == '%'
				tokid = 'TAG_ATTRS_START'

			elif value is '(' and prev[0] in CALLABLE
				# not using this ???
				# prev[0] = 'FUNC_EXIST' if prev[0] is '?'
				tokid = 'CALL_START'

			elif value is '[' and prev[0] in INDEXABLE
				tokid = 'INDEX_START'
				prev[0] = 'INDEX_SOAK' if prev[0] == '?'

			elif value is '{' and prev[0] in INDEXABLE
				tokid = 'RAW_INDEX_START'

		switch value
			when '(', '{', '[' then @ends.push INVERSES[value]
			when ')', '}', ']' then pair value

		# hacky rule to try to allow for tuple-assignments in blocks
		# if value is ',' and prev[0] is 'IDENTIFIER' and @tokens[@tokens:length - 2][0] in ['TERMINATOR','INDENT']
		#   # token "TUPLE", "tuple" # should rather insert it somewhere else, no?
		#   console.log("found comma")

		token tokid, value
		return value:length

	# Token Manipulators
	# ------------------

	# Sanitize a heredoc or herecomment by
	# erasing all external indentation on the left-hand side.
	def sanitizeHeredoc doc, options
		var match
		var indent = options:indent
		var herecomment = options:herecomment

		if herecomment
			if HEREDOC_ILLEGAL.test(doc)
				error "block comment cannot contain \"*/\", starting"
			return doc if doc.indexOf('\n') <= 0
		else
			while match = HEREDOC_INDENT.exec(doc)
				var attempt = match[1]
				if indent is null or 0 < attempt:length < indent:length
					indent = attempt

		doc = doc.replace /// \n #{indent} ///g, '\n' if indent
		doc = doc.replace /^\n/, '' unless herecomment
		return doc

	# A source of ambiguity in our grammar used to be parameter lists in function
	# definitions versus argument lists in function calls. Walk backwards, tokidging
	# parameters specially in order to make things easier for the parser.
	def tagParameters
		return this if tokid() isnt ')'
		var stack = []
		var tokens = @tokens
		var i = tokens:length

		tokens[--i][0] = 'PARAM_END'

		while var tok = tokens[--i]
			switch tok[0]
				when ')'
					stack.push tok
				when '(', 'CALL_START'
					if stack:length
						stack.pop
					elif tok[0] is '('
						tok[0] = 'PARAM_START'
						return this
					else
						return this

		return this

	# Close up all remaining open blocks at the end of the file.
	def closeIndentation
		# ctx = context
		# pair(ctx) if ctx in ['%','DEF']
		closeDef
		closeSelector
		outdentToken @indent

	# Matches a balanced group such as a single or double-quoted string. Pass in
	# a series of delimiters, all of which must be nested correctly within the
	# contents of the string. This method allows us to have strings within
	# interpolations within strings, ad infinitum.
	def balancedString str, end
		var match, letter, prev

		# console.log 'balancing string!', str, end
		var stack = [end]
		var i = 0

		
		# had to fix issue after later versions of coffee-script broke old loop type
		# should submit bugreport to coffee-script
		while i < (str:length - 1)
			i++
			var letter = str.charAt(i)
			switch letter
				when '\\'
					i++
					continue
				when end
					stack.pop
					unless stack:length
						var v = str.slice(0, i + 1)
						return v
					end = stack[stack:length - 1]
					continue


			if end is '}' and letter in ['"', "'"]
				stack.push(end = letter)

			elif end is '}' and letter is '/' and match = (HEREGEX.exec(str.slice i) or REGEX.exec(str.slice i))
				i += match[0]:length - 1

			elif end is '}' and letter is '{'
				stack.push end = '}'
			elif end is '"' and letter is '{'
				stack.push end = '}'
			prev = letter

		error "missing { stack.pop }, starting"

	# Expand variables and expressions inside double-quoted strings using
	# Ruby-like notation for substitution of arbitrary expressions.
	#
	#     "Hello #{name.capitalize()}."
	#
	# If it encounters an interpolation, this method will recursively create a
	# new Lexer, tokenize the interpolated contents, and merge them into the
	# token stream.
	def interpolateString str, options = {}

		var heredoc = options:heredoc
		var regex = options:regex
		var prefix = options:prefix


		var tokens = []
		var pi = 0
		var i  = -1

		var letter
		var expr

		while letter = str.charAt(i += 1)
			if letter is '\\'
				i += 1
				continue
			unless str.charAt(i) is '{' and (expr = balancedString(str.slice(i), '}'))
				continue

			tokens.push ['NEOSTRING', str.slice(pi, i)] if pi < i
			var inner = expr.slice(1, -1)
			# console.log 'inner is',inner

			if inner:length
				# we need to remember the loc we start at
				# console.log('interpolate from loc',@loc,i)
				var nested = Lexer.new.tokenize inner, line: @line, rewrite: no, loc: @loc + i + 2
				nested.pop

				if nested[0] and nested[0][0] == 'TERMINATOR'
					nested.shift

				if var len = nested:length
					if len > 1
						nested.unshift ['(', '(']
						nested.push    [')', ')']
					tokens.push ['TOKENS', nested]
			i += expr:length - 1
			pi = i + 1

		if i > pi < str:length
			tokens.push ['NEOSTRING', str.slice pi] 

		return tokens if regex

		return token 'STRING', '""' unless tokens:length

		tokens.unshift ['', ''] unless tokens[0][0] is 'NEOSTRING'

		if var interpolated = tokens:length > 1
			token '(', '('

		for v, k in tokens
			var typ = v[0]
			var value = v[1]

			token '+', '+' if k

			if typ is 'TOKENS'
				@tokens.push *value
			else
				token 'STRING', makeString(value, '"', heredoc)

		token ')', ')' if interpolated
		return tokens

	# Matches a balanced group such as a single or double-quoted string. Pass in
	# a series of delimiters, all of which must be nested correctly within the
	# contents of the string. This method allows us to have strings within
	# interpolations within strings, ad infinitum.
	def balancedSelector str, end
		var prev
		var letter
		var stack = [end]
		# FIXME
		for i in [1...str:length]
			switch letter = str.charAt(i)
				when '\\'
					i++
					continue
				when end
					stack.pop()
					unless stack:length
						return str.slice(0, i + 1)

					end = stack[stack:length - 1]
					continue
			if end is '}' and letter is [')']
				stack.push end = letter
			elif end is '}' and letter is '{'
				stack.push end = '}'
			elif end is ')' and letter is '{'
				stack.push end = '}'
			prev = letter # what, why?

		error "missing { stack.pop() }, starting"

	# Expand variables and expressions inside double-quoted strings using
	# Ruby-like notation for substitution of arbitrary expressions.
	#
	#     "Hello #{name.capitalize()}."
	#
	# If it encounters an interpolation, this method will recursively create a
	# new Lexer, tokenize the interpolated contents, and merge them into the
	# token stream.
	def interpolateSelector str, options = {}

		var heredoc = options:heredoc
		var regex = options:regex
		var prefix = options:prefix

		var tokens = []
		var pi = 0
		var i  = -1

		var letter, expr, nested

		while letter = str.charAt(i += 1)
			unless letter is '{' and (expr = balancedSelector(str.slice(i), '}'))
				continue

			tokens.push ['NEOSTRING', str.slice(pi, i)] if pi < i
			var inner = expr.slice(1, -1)

			if inner:length
				nested = Lexer.new.tokenize(inner, line: @line, rewrite: no)
				nested.pop
				nested.shift if nested[0] and nested[0][0] is 'TERMINATOR'

				if var len = nested:length
					if len > 1
						nested.unshift ['(', '(']
						nested.push    [')', ')']
					tokens.push ['TOKENS', nested]
			i += expr:length - 1
			pi = i + 1

		tokens.push ['NEOSTRING', str.slice pi] if i > pi < str:length
		return tokens if regex
		return token 'STRING', '""' unless tokens:length

		tokens.unshift ['', ''] unless tokens[0][0] is 'NEOSTRING'
		token '(', '(' if var interpolated = tokens:length > 1

		for v, i in tokens
			var tokid = v[0]
			var value = v[1]

			token ',', ',' if i

			if tokid is 'TOKENS'
				@tokens.push *value
			else
				token 'STRING', makeString(value, '"', heredoc)
		token ')', ')' if interpolated
		tokens

	# Pairs up a closing token, ensuring that all listed pairs of tokens are
	# correctly balanced throughout the course of the token stream.
	def pair tokid
		var wanted = last(@ends)
		unless tokid == wanted
			error "unmatched {tokid}" unless 'OUTDENT' is wanted
			# Auto-close INDENT to support syntax like this:
			#
			#     el.click((event) ->
			#       el.hide())
			#
			var size = last(@indents)
			@indent -= size
			outdentToken size, true
			return pair(tokid)
		# FIXME move into endSelector
		token('SELECTOR_END','%') if tokid == '%'

		# remove possible options for context. hack
		# console.log "pairing tokid",tokid,@ends:length - 1,@ends["_" + (@ends:length - 1)]
		@ends["_" + (@ends:length - 1)] = undefined
		@ends.pop

	# Helpers
	# -------

	# Add a token to the results, taking note of the line number.
	def token id, value, len, addLoc
		# console.log(@line)
		var loc = {first_line: @line, first_column: 2, last_line: @line, last_column: 2, range: [@loc,1000]}

		# if len and addLoc
		#   # console.log('addLoc',value)
		#   if typeof value == 'string'
		#     value = value + "$#{@loc}$$#{len}"
		#   else
		#     value:_region = [@loc, @loc + len]

		if len and addLoc
			# console.log('no loc')
			true

		elif len
			# value = value + "_" + len
			# POC - not optimized at all
			# Might be better to just use jison for this
			if typeof value == 'string'
				value = String.new(value) # are we so sure about this?
			value:_region = [@loc, @loc + len]

		if id == 'INDENT' || id == 'OUTDENT'
			# console.log(value)
			value = Number.new(value) # real
			value:_region = [@loc,@loc]
		# loc = {range: [10,1000]}

		@lastTyp = id
		@lastVal = value
		@last = [id, value, loc]
		@tokens.push @last		


	# Peek at a tokid in the current token stream.
	def tokid index, tokid
		if var tok = last(@tokens, index)
			tok[0] = tokid if tokid # why?
			tok[0]
		else null

	# Peek at a value in the current token stream.
	def value index, val
		if var tok = last(@tokens, index)
			tok[1] = val if val # why?
			tok[1]
		else null
		

	# Are we in the midst of an unfinished expression?
	def unfinished
		# only if indented -- possibly not even
		# console.log("is unfinished?!?",tokid());
		return true if LINE_CONTINUER.test(@chunk)

		# no, no, no -- should never be possible to continue a statement without an indent
		# return false
		# this is _really_ messy.. it should possibly work if there is indentation after the initial
		# part of this, but not for the regular cases. Still, removing it breaks too much stuff.
		# Fix when we replace the lexer and rewriter
		# return false
		var tokens = ['\\','.', '?.', 'UNARY', 'MATH', '+', '-', 'SHIFT', 'RELATION', 'COMPARE', 'LOGIC', 'COMPOUND_ASSIGN', 'THROW', 'EXTENDS']
		return self.tokid in tokens
		

	# Converts newlines for string literals.
	def escapeLines str, heredoc
		str.replace MULTILINER, (heredoc ? '\\n' : '')

	# Constructs a string token by escaping quotes and newlines.
	def makeString body, quote, heredoc
		return quote + quote unless body
		body = body.replace(/\\([\s\S])/g) do |match, contents|
			contents in ['\n', quote] ? contents : match
		body = body.replace /// #{quote} ///g, '\\$&'
		quote + escapeLines(body, heredoc) + quote
		
	# Throws a syntax error on the current `@line`.
	def error message, len
		var msg = "{message} on line {@line}"

		if len
			msg += " [{@loc}:{@loc + len}]"

		var err = SyntaxError.new msg
		err:line = @line
		throw err

# Constants
# ---------

# Keywords that Imba shares in common with JavaScript.
var JS_KEYWORDS = [
	'true', 'false', 'null', 'this',
	'new', 'delete', 'typeof', 'in', 'instanceof'
	'throw', 'break', 'continue', 'debugger'
	'if', 'else', 'switch', 'for', 'while', 'do', 'try', 'catch', 'finally'
	'class', 'extends', 'super', 'module', 'return'
]

# We want to treat return like any regular call for now
# Must be careful to throw the exceptions in AST, since the parser
# wont

# Imba-only keywords. var should move to JS_Keywords
# some words (like tokid) should be context-specific
var IMBA_KEYWORDS = [
	'undefined', 'then', 'unless', 'until', 'loop', 'of', 'by',
	'when','def','tag','do','elif','begin','prop','var','let','self','await','import'
]

var IMBA_CONTEXTUAL_KEYWORDS = ['extend','static','local','export','global']

var IMBA_ALIAS_MAP =
	'and'  : '&&'
	'or'   : '||'
	'is'   : '=='
	'isnt' : '!='
	'not'  : '!'
	'yes'  : 'true'
	'no'   : 'false'
	'isa'  : 'instanceof'
	'case' : 'switch'
	'nil'  : 'null'

var IMBA_ALIASES  = (key for key of IMBA_ALIAS_MAP)
var IMBA_KEYWORDS = IMBA_KEYWORDS.concat(IMBA_ALIASES) # .concat(IMBA_CONTEXTUAL_KEYWORDS)


# The list of keywords that are reserved by JavaScript, but not used, or are
# used by Imba internally. We throw an error when these are encountered,
# to avoid having a JavaScript error at runtime.  # 'var', 'let', - not inside here
var RESERVED = ['case', 'default', 'function', 'void', 'with', 'const', 'enum', 'native']
var STRICT_RESERVED = ['case','function','void','const']

# The superset of both JavaScript keywords and reserved words, none of which may
# be used as identifiers or properties.
var JS_FORBIDDEN = JS_KEYWORDS.concat RESERVED
# export var RESERVED = RESERVED.concat(JS_KEYWORDS).concat(IMBA_KEYWORDS)

# really?
exports:RESERVED = RESERVED.concat(JS_KEYWORDS).concat(IMBA_KEYWORDS)

var METHOD_IDENTIFIER = /// ^
	( 
		(([\x23]?[\$A-Za-z_\x7f-\uffff][$\-\w\x7f-\uffff]*)([\=\?\!]?)) | 
		(<=>|\|(?![\|=]))
	)
///
# removed ~=|~| |&(?![&=])

# Token matching regexes.
# added hyphens to identifiers now - to test
var IDENTIFIER = /// ^
	(
		(\$|@@|@|\#)[A-Za-z_\-\x7f-\uffff][$\w\x7f-\uffff]* (\-[$\w\x7f-\uffff]+)* |
		[$A-Za-z_][$\w\x7f-\uffff]* (\-[$\w\x7f-\uffff]+)*
	)
	( [^\n\S]* : (?![\*\=:$\w\x7f-\uffff]) )?  # Is this a property name?
///

var OBJECT_KEY = /// ^
	( (\$|@@|@|)[$A-Za-z_\x7f-\uffff\-][$\w\x7f-\uffff\-]*)
	( [^\n\S\s]* : (?![\*\=:$\w\x7f-\uffff]) )  # Is this a property name?
///


var OBJECT_KEY_ESCAPE = ///
	[\-\@\$]
///


var PROPERTY = /// ^
	((set|get|on)\s+)?
	( [$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff\:]* )
	( [^\n\S]* :\s)  # Is this a property name?
///


var TAG = /// ^
	(\<|%)(?=[A-Za-z\#\.\{\@])
///

var TAG_TYPE = /^(\w[\w\d]*:)?(\w[\w\d]*)(-[\w\d]+)*/
var TAG_ID = /^#((\w[\w\d]*)(-[\w\d]+)*)/

var TAG_ATTR = /^([\.]?[\w\_]+([\-\:][\w]+)*)(\s)*\=/

var SELECTOR = /^([%\$]{1,2})([\(\w\#\.\[])/
var SELECTOR_PART = /^(\#|\.|:|::)?([\w]+(\-[\w]+)*)/
var SELECTOR_COMBINATOR = /^ (\+|\>|\~)*\s*(?=[\w\.\#\:\{\*\[])/

var SELECTOR_PSEUDO_CLASS = /^(::?)([\w]+(\-[\w]+)*)/
var SELECTOR_ATTR_OP = /^(\$=|\~=|\^=|\*=|\|=|=|\!=)/
var SELECTOR_ATTR = /^\[([\w\_\-]+)(\$=|\~=|\^=|\*=|\|=|=|\!=)/

var SYMBOL = ///^
	\:(
		(
			([\*\@$\w\x7f-\uffff]+)+([\-\/\\\:][\w\x7f-\uffff]+)*
			[!\?\=]?
		)|==|\<=\>|\[\]|\[\]\=|\*|[\/,\\]
	)
///


var NUMBER = ///
	^ 0x[\da-f]+ |                              # hex
	^ 0b[01]+ |                              # binary
	^ \d*\.?\d+ (?:e[+-]?\d+)?  # decimal
///i

var HEREDOC = /// ^ ("""|''') ([\s\S]*?) (?:\n[^\n\S]*)? \1 ///

var OPERATOR = /// ^ (
	?: [-=]=>             # function - what
	 | ===
	 | !==
	 | [-+*/%<>&|^!?=]=  # compound assign / compare
	 | =<
	 | >>>=?             # zero-fill right shift
	 | ([-+:])\1         # doubles
	 | ([&|<>])\2=?      # logic / shift
	 | \?\.              # soak access
	 | \.{2,3}           # range or splat
	 | \*(?=[a-zA-Z\_])   # splat -- 
) ///

# FIXME splat should only be allowed when the previous thing is spaced or inside call?

var WHITESPACE = /^[^\n\S]+/

var COMMENT    = /^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)/
# COMMENT    = /^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)|^(?:\s*(#\s.*|#\s*$))+/
var INLINE_COMMENT = /^(\s*)(#\s(.*)|#\s?$)+/ # hmm

var CODE       = /^[-=]=>/

var MULTI_DENT = /^(?:\n[^\n\S]*)+/

var SIMPLESTR  = /^'[^\\']*(?:\\.[^\\']*)*'/

var JSTOKEN    = /^`[^\\`]*(?:\\.[^\\`]*)*`/

# Regex-matching-regexes.
var REGEX = /// ^
	(/ (?! [\s=] )   # disallow leading whitespace or equals signs
	[^ [ / \n \\ ]*  # every other thing
	(?:
		(?: \\[\s\S]   # anything escaped
			| \[         # character class
					 [^ \] \n \\ ]*
					 (?: \\[\s\S] [^ \] \n \\ ]* )*
				 ]
		) [^ [ / \n \\ ]*
	)*
	/) ([imgy]{0,4}) (?!\w)
///

var HEREGEX      = /// ^ /{3} ([\s\S]+?) /{3} ([imgy]{0,4}) (?!\w) ///

var HEREGEX_OMIT = /\s+(?:#.*)?/g

# Token cleaning regexes.
var MULTILINER      = /\n/g

var HEREDOC_INDENT  = /\n+([^\n\S]*)/g

var HEREDOC_ILLEGAL = /\*\//

var LINE_CONTINUER  = /// ^ \s* (?: , | \??\.(?![.\d]) | :: ) ///

var TRAILING_SPACES = /\s+$/

var CONST_IDENTIFIER = /^[A-Z]/

var ARGVAR = /^\$\d$/

# CONDITIONAL_ASSIGN = ['||=', '&&=', '?=', '&=', '|=', '!?=']

# Compound assignment tokens.
var COMPOUND_ASSIGN = [ '-=', '+=', '/=', '*=', '%=', '||=', '&&=', '?=', '<<=', '>>=', '>>>=', '&=', '^=', '|=','=<']

# Unary tokens.
var UNARY = ['!', '~', 'NEW', 'TYPEOF', 'DELETE']

# Logical tokens.
var LOGIC   = ['&&', '||', '&', '|', '^']

# Bit-shifting tokens.
var SHIFT   = ['<<', '>>', '>>>']

# Comparison tokens.
var COMPARE = ['===', '!==', '==', '!=', '<', '>', '<=', '>=','===','!==']

# Overideable methods
var OP_METHODS = ['<=>','<<','..'] # hmmm

# Mathematical tokens.
var MATH = ['*', '/', '%', '∪', '∩','√']

# Relational tokens that are negatable with `not` prefix.
var RELATION = ['IN', 'OF', 'INSTANCEOF','ISA']

# Boolean tokens.
var BOOL = ['TRUE', 'FALSE', 'NULL', 'UNDEFINED']

# Tokens which a regular expression will never immediately follow, but which
# a division operator might.
#
# See: http://www.mozilla.org/js/language/js20-2002-04/rationale/syntax.html#regular-expressions
#
# Our list is shorter, due to sans-parentheses method calls.
var NOT_REGEX = ['NUMBER', 'REGEX', 'BOOL', '++', '--', ']']

# If the previous token is not spaced, there are more preceding tokens that
# force a division parse:
var NOT_SPACED_REGEX = NOT_REGEX.concat ')', '}', 'THIS', 'SELF' , 'IDENTIFIER', 'STRING'

# Tokens which could legitimately be invoked or indexed. An opening
# parentheses or bracket following these tokens will be recorded as the start
# of a function invocation or indexing operation.
# really?!

# } should not be callable anymore!!! '}', '::',
var CALLABLE  = ['IDENTIFIER', 'STRING', 'REGEX', ')', ']', 'THIS', 'SUPER', 'TAG_END', 'IVAR', 'GVAR','SELF','CONST','NEW','ARGVAR','SYMBOL','RETURN']
var INDEXABLE = CALLABLE.concat 'NUMBER', 'BOOL', 'TAG_SELECTOR', 'IDREF', 'ARGUMENTS','}'

var GLOBAL_IDENTIFIERS = ['global','exports','require']

# STARTS = [']',')','}','TAG_ATTRS_END']
# ENDS = [']',')','}','TAG_ATTRS_END']

# Tokens that, when immediately preceding a `WHEN`, indicate that the `WHEN`
# occurs at the start of a line. We disambiguate these from trailing whens to
# avoid an ambiguity in the grammar.
var LINE_BREAK = ['INDENT', 'OUTDENT', 'TERMINATOR']
