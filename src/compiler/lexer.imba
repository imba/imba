
var T = require './token'
var Token = T.Token

import INVERSES from './constants'

var K = 0

var ERR = require './errors'

# Constants
# ---------

# Keywords that Imba shares in common with JavaScript.
var JS_KEYWORDS = [
	'true', 'false', 'null', 'this'
	'delete', 'typeof', 'in', 'instanceof'
	'throw', 'break', 'continue', 'debugger'
	'if', 'else', 'switch', 'for', 'while', 'do', 'try', 'catch', 'finally'
	'class', 'extends', 'super', 'return'
]

# new can be used as a keyword in imba, since object initing is done through
# MyObject.new. new is a very useful varname.

# We want to treat return like any regular call for now
# Must be careful to throw the exceptions in AST, since the parser
# wont

# Imba-only keywords. var should move to JS_Keywords
# some words (like tokid) should be context-specific
var IMBA_KEYWORDS = [
	'undefined', 'then', 'unless', 'until', 'loop', 'of', 'by',
	'when','def','tag','do','elif','begin','var','let','self','await','import','require'
]

var IMBA_CONTEXTUAL_KEYWORDS = ['extend','static','local','export','global','prop']

# should not rewrite the actual tokens
var IMBA_ALIAS_MAP =
	'and'  : '&&'
	'or'   : '||'
	'is'   : '=='
	'isnt' : '!='
	'case' : 'switch'

var IMBA_ALIASES  = Object.keys(IMBA_ALIAS_MAP)
IMBA_KEYWORDS = IMBA_KEYWORDS.concat(IMBA_ALIASES)

# FixedArray for performance
# var ALL_KEYWORDS = JS_KEYWORDS.concat(IMBA_KEYWORDS)
export var ALL_KEYWORDS = [
	'true', 'false', 'null', 'this',
	'delete', 'typeof', 'in', 'instanceof',
	'throw', 'break', 'continue', 'debugger',
	'if', 'else', 'switch', 'for', 'while', 'do', 'try', 'catch', 'finally',
	'class', 'extends', 'super', 'return',
	'undefined', 'then', 'unless', 'until', 'loop', 'of', 'by',
	'when','def','tag','do','elif','begin','var','let','self','await','import',
	'and','or','is','isnt','not','yes','no','isa','case','nil','require'
]

# The list of keywords that are reserved by JavaScript, but not used, or are
# used by Imba internally. We throw an error when these are encountered,
# to avoid having a JavaScript error at runtime.  # 'var', 'let', - not inside here
var RESERVED = ['case', 'default', 'function', 'void', 'with', 'const', 'enum', 'native']
var STRICT_RESERVED = ['case','function','void','const']

# The superset of both JavaScript keywords and reserved words, none of which may
# be used as identifiers or properties.
var JS_FORBIDDEN = JS_KEYWORDS.concat RESERVED

var METHOD_IDENTIFIER = /// ^
	( 
		(([\x23]?[\$A-Za-z_\x7f-\uffff][$\-\w\x7f-\uffff]*)([\=]?)) | 
		(<=>|\|(?![\|=]))
	)
///
# removed ~=|~| |&(?![&=])

# Token matching regexes.
# added hyphens to identifiers now - to test
var IDENTIFIER = /// ^
	(
		(\$|@@|@|\#)[\wA-Za-z_\-\x7f-\uffff][$\w\x7f-\uffff]* (\-[$\w\x7f-\uffff]+)* |
		[$A-Za-z_][$\w\x7f-\uffff]* (\-[$\w\x7f-\uffff]+)*
	)
	( [^\n\S]* : (?![\*\=:$\w\x7f-\uffff]) )?  # Is this a property name?
///

var OBJECT_KEY = /// ^
	( (\$|@@|@|)[$A-Za-z_\x7f-\uffff\-][$\w\x7f-\uffff\-]*)
	( [^\n\S\s]* : (?![\*\=:$\w\x7f-\uffff]) )  # Is this a property name?
///

var TAG = /// ^
	(\<|%)(?=[A-Za-z\#\.\{\@\>])
///

var TAG_TYPE = /^(\w[\w\d]*:)?(\w[\w\d]*)(-[\w\d]+)*/
var TAG_ID = /^#((\w[\w\d]*)(-[\w\d]+)*)/

var TAG_ATTR = /^([\.\:]?[\w\_]+([\-\:][\w]+)*)(\s)*\=/

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
	 | ->
	 | =>
	 | !==
	 | [-+*/%<>&|^!?=]=  # compound assign / compare
	 | =<
	 | >>>=?             # zero-fill right shift
	 | ([-+:])\1         # doubles
	 | ([&|<>])\2=?      # logic / shift
	 | \?\.              # soak access
	 | \?\:              # soak symbol
	 | \.{2,3}           # range or splat
	 | \*(?=[a-zA-Z\_])   # splat -- 
) ///

# FIXME splat should only be allowed when the previous thing is spaced or inside call?

var WHITESPACE = /^[^\n\S]+/

var COMMENT    = /^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)/
# COMMENT    = /^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)|^(?:\s*(#\s.*|#\s*$))+/
var INLINE_COMMENT = /^(\s*)(#[ \t\!](.*)|#[ \t]?(?=\n|$))+/

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

# expensive?
var LINE_CONTINUER  = /// ^ \s* (?: , | \??\.(?![.\d]) | :: ) ///

var TRAILING_SPACES = /\s+$/

var CONST_IDENTIFIER = /^[A-Z]/

var ENV_FLAG = /^\$\w+\$/

var ARGVAR = /^\$\d$/

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
var OP_METHODS = ['<=>','<<','..']

# Mathematical tokens.
var MATH = ['*', '/', '%', '∪', '∩','√']

# Relational tokens that are negatable with `not` prefix.
var RELATION = ['IN', 'OF', 'INSTANCEOF','ISA']

# Boolean tokens.
var BOOL = ['TRUE', 'FALSE', 'NULL', 'UNDEFINED']

# Our list is shorter, due to sans-parentheses method calls.
var NOT_REGEX = ['NUMBER', 'REGEX', 'BOOL', 'TRUE', 'FALSE', '++', '--', ']']

# If the previous token is not spaced, there are more preceding tokens that
# force a division parse:
var NOT_SPACED_REGEX = ['NUMBER', 'REGEX', 'BOOL', 'TRUE', 'FALSE', '++', '--', ']',')', '}', 'THIS', 'SELF' , 'IDENTIFIER', 'STRING']

# Tokens which could legitimately be invoked or indexed. An opening
# parentheses or bracket following these tokens will be recorded as the start
# of a function invocation or indexing operation.
# really?!

var UNFINISHED = ['\\','.', '?.', '?:', 'UNARY', 'MATH', '+', '-', 'SHIFT', 'RELATION', 'COMPARE', 'LOGIC', 'COMPOUND_ASSIGN', 'THROW', 'EXTENDS']

# } should not be callable anymore!!! '}', '::',
var CALLABLE  = ['IDENTIFIER', 'STRING', 'REGEX', ')', ']', 'THIS', 'SUPER', 'TAG_END', 'IVAR', 'GVAR','SELF','CONST','NEW','ARGVAR','SYMBOL','RETURN']

# optimize for FixedArray
var INDEXABLE = [
	'IDENTIFIER', 'STRING', 'REGEX', ')', ']', 'THIS', 'SUPER', 'TAG_END', 'IVAR', 'GVAR','SELF','CONST','NEW','ARGVAR','SYMBOL','RETURN'
	'NUMBER', 'BOOL', 'TAG_SELECTOR', 'ARGUMENTS','}','TAG_TYPE','TAGID'
]

var NOT_KEY_AFTER = ['.','?','?.','UNARY','?:','+','-','*']

var GLOBAL_IDENTIFIERS = ['global','exports']

# Tokens that, when immediately preceding a `WHEN`, indicate that the `WHEN`
# occurs at the start of a line. We disambiguate these from trailing whens to
# avoid an ambiguity in the grammar.
var LINE_BREAK = ['INDENT', 'OUTDENT', 'TERMINATOR']


export class LexerError < SyntaxError
	
	def initialize message, file, line
		self:message = message
		self:file = file
		self:line = line
		return self


def last array, back = 0
	array[array:length - back - 1]

def count str, substr
	return str.split(substr):length - 1
	
def repeatString str, times
	var res = ''
	while times > 0
		if times % 2 == 1
			res += str
		str += str
		times >>= 1
	return res

var tT  = T:typ
var tV  = T:val
var tTs = T:setTyp
var tVs = T:setVal

# The Lexer class reads a stream of Imba and divvies it up into tokidged
# tokens. Some potential ambiguity in the grammar has been avoided by
# pushing some extra smarts into the Lexer.

# Based on the original lexer.coffee from CoffeeScript
export class Lexer

	def initialize
		reset
		self

	def reset
		@code    = null
		@chunk   = null           # The remainder of the source code.
		@opts    = null
		@state = {}
		
		@indent  = 0              # The current indentation level.
		@indebt  = 0              # The over-indentation at the current level.
		@outdebt = 0              # The under-outdentation at the current level.

		@indents  = []             # The stack of all current indentation levels.
		@ends     = [] # The stack for pairing up tokens.
		@contexts = [] # suplements @ends
		@scopes   = []
		@nextScope = null # the scope to add on the next indent
		# should rather make it like a statemachine that moves from CLASS_DEF to CLASS_BODY etc
		# Things should compile differently when you are in a CLASS_BODY than when in a DEF_BODY++

		@indentStyle = null

		@tokens  = []             # Stream of parsed tokens in the form `['TYPE', value, line]`.
		@seenFor = no
		@loc = 0
		@locOffset = 0

		@end     = null
		@char 	 = null
		@bridge  = null
		@last    = null
		@lastTyp = ''
		@lastVal = null
		self

	def jisonBridge jison
		@bridge = {
			lex: T:lex
			setInput: do |tokens|
				this:tokens = tokens
				this:pos = 0

			upcomingInput: do ""
		}


	def tokenize code, o = {}

		if code:length == 0
			return []

		unless o:inline
			if WHITESPACE.test(code)
				code = "\n{code}"
				return [] if code.match(/^\s*$/g)

			code = code.replace(/\r/g, '').replace /[\t ]+$/g, ''

		@last    = null
		@lastTyp = null
		@lastVal = null

		@code    = code
		@opts    = o
		@locOffset = o:loc or 0

		o:indent ||= {style: null, size: null}

		# if the very first line is indented, take this as a gutter
		if let m = code.match(/^([\ \t]*)[^\n\s\t]/)
			@state:gutter = m[1]

		o.@tokens = @tokens 

		parse(code)

		closeIndentation unless o:inline
		if !o:silent and @ends:length
			console.log @ends
			error "missing {@ends.pop}"

		return @tokens

	def parse code
		var i = 0
		var pi = 0
		@loc = @locOffset + i

		while @chunk = code.slice(i)
			if @context and @context:pop
				if @context:pop.test(@chunk)
					popEnd

			pi = (@end == 'TAG' and tagDefContextToken) || (@inTag and tagContextToken) || basicContext
			i += pi
			@loc = @locOffset + i

		return

	def basicContext
		return selectorToken || symbolToken || methodNameToken || identifierToken || whitespaceToken || lineToken || commentToken || heredocToken || tagToken || stringToken || numberToken || regexToken || jsToken || literalToken || 0

	def moveCaret i
		@loc += i

	def context
		@ends[@ends:length - 1]

	def inContext key
		var o = @contexts[@contexts:length - 1]
		return o and o[key]

	def pushEnd val, ctx
		@ends.push(val)
		@contexts.push(@context = (ctx or null))
		@end = val
		refreshScope

		if ctx and ctx:id
			ctx:start = Token.new(ctx:id + '_START',val, @last.region[1],0)
			@tokens.push(ctx:start)
		self

	def popEnd val
		var popped = @ends.pop
		@end = @ends[@ends:length - 1]

		# automatically adding a closer if this is defined
		var ctx = @context
		if ctx and ctx:start
			ctx:end = Token.new(ctx:id + '_END',popped,@last.region[1],0)
			ctx:end.@start = ctx:start
			ctx:start.@end = ctx:end
			@tokens.push(ctx:end)

		@contexts.pop
		@context = @contexts[@contexts:length - 1]

		refreshScope
		self

	def refreshScope
		var ctx0 = @ends[@ends:length - 1]
		var ctx1 = @ends[@ends:length - 2]
		@inTag = ctx0 == 'TAG_END' or (ctx1 == 'TAG_END' and ctx0 == 'OUTDENT')

		

	def queueScope val
		# console.log("pushing scope {val} - {@indents} {@indents:length}")
		# @scopes.push(val) # no no
		@scopes[@indents:length] = val
		self

	def popScope val
		@scopes.pop
		self

	def getScope
		@scopes[@indents:length - 1]
		
	def scope sym, opts
		var len = @ends.push(@end = sym)
		@contexts.push(opts or null)
		return sym
	

	def closeSelector
		if @end == '%'
			token('SELECTOR_END','%',0)
			pair('%')
	

	def openDef
		pushEnd('DEF')


	def closeDef
		if context is 'DEF'
			var prev = last(@tokens)
			# console.log "close def {prev}"
			# console.log('closeDef with last>',prev)
			if tT(prev) == 'DEF_FRAGMENT'
				true
			elif tT(prev) == 'TERMINATOR'
				# console.log "here?!??"
				let n = @tokens.pop
				# console.log n
				token('DEF_BODY', 'DEF_BODY',0)
				# token('TERMINATOR', '',0) unless n.@value.indexOf('//') >= 0
				@tokens.push(n)
			else
				token('DEF_BODY', 'DEF_BODY',0)

			pair('DEF')
		return

	def tagContextToken
		if @chunk[0] == '#'
			token('#','#',1)
			return 1

		if var match = TAG_ATTR.exec(@chunk)
			var l = match[0]:length

			token 'TAG_ATTR',match[1],l - 1  # add to loc?
			@loc += l - 1
			token '=','=',1
			pushEnd('TAG_ATTR',id: 'VALUE', pop: /^[\s\n\>]/) #  [' ','\n','>']
			return l
		return 0

	def tagDefContextToken
		# console.log "tagContextToken"
		if var match = TAG_TYPE.exec(@chunk)
			token 'TAG_TYPE', match[0], match[0]:length
			return match[0]:length

		if var match = TAG_ID.exec(@chunk)
			var input = match[0]
			token 'TAG_ID', input, input:length
			return input:length

		if @chunk[0] == '\n'
			pair('TAG')

		return 0


	def tagToken
		return 0 unless var match = TAG.exec(@chunk)
		var [input, type, identifier] = match

		if type == '<'
			token('TAG_START', '<',1)
			pushEnd(INVERSES['TAG_START'])

			if match = TAG_TYPE.exec(@chunk.substr(1,40))
				# special case should probably be handled in AST
				if match[0] != 'self'
					token('TAG_TYPE',match[0],match[0]:length,1)
					return input:length + match[0]:length

			if identifier
				if identifier.substr(0,1) == '{'
					return type:length
				else
					token('TAG_NAME', input.substr(1),0)

		return input:length


	def selectorToken
		var match

		# special handling if we are in this context
		if @end == '%'
			var chr = @chunk.charAt(0)
			var open = inContext('open')

			# should add for +, ~ etc
			# should maybe rather look for the correct type of character?
		
			if open and (chr == ' ' or chr == '\n' or chr == ',' or chr == '+' or chr == '~' or chr == ')' or chr == ']')
				# console.log "close this selector directly"
				token('SELECTOR_END','%',0)
				pair '%'
				return 0

			if match = SELECTOR_COMBINATOR.exec(@chunk)
				# spaces between? -- include the whole
				token 'SELECTOR_COMBINATOR', match[1] || " ", match[0]:length
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

				token tokid, match[2], match[0]:length
				return match[0]:length

			# elif match = SELECTOR_PSEUDO_CLASS.exec(@chunk)
			#  token tokid, match[2]
			#  return match[0]:length
			
			elif chr == '['
				token('[','[',1)
				self.pushEnd(']')
				if match = SELECTOR_ATTR.exec(@chunk)
					# fuck this length shit
					var idoffset = match[0].indexOf(match[1])
					var opoffset = match[0].indexOf(match[2])
					token('IDENTIFIER', match[1], match[1]:length, idoffset)
					token('SELECTOR_ATTR_OP', match[2], match[2]:length, opoffset)
					return match[0]:length
				return 1

			elif chr == '|'
				var tok = @tokens[@tokens:length - 1]
				tTs(tok,'SELECTOR_NS')
				# tok[0] = 'SELECTOR_NS' # FIX
				return 1

			elif chr == ','
				token('SELECTOR_GROUP',',',1)
				return 1
			elif chr == '*'
				token('UNIVERSAL_SELECTOR','*',1)
				return 1
			
			elif chr == ')'
				pair '%'
				token('SELECTOR_END',')',1)
				return 1

			elif chr in [')','}',']','']
				pair '%'
				return 0

		return 0 unless match = SELECTOR.exec(@chunk)
		var [input, id, kind] = match

		# this is a closed selector
		if kind == '('
			# token '(','('
			token 'SELECTOR_START', id, id:length + 1
			# self.pushEnd(')') # are we so sure about this?
			self.pushEnd('%')

			# @ends.push ')'
			# @ends.push '%'
			return id:length + 1

		elif id == '%'
			# we are already scoped in on a selector
			return 1 if context == '%'
			token 'SELECTOR_START', id, id:length
			# this is a separate - scope. Full selector should rather be $, and keep the single selector as %
		
			scope('%', open: yes)
			# @ends.push '%'
			# make sure a terminator breaks out
			return id:length
		else
			return 0
	
	# is this really needed? Should be possible to
	# parse the identifiers and = etc i jison?
	# what is special about methodNameToken? really?
	# this whole step should be removed - it's a huge mess
	def methodNameToken
		# we can optimize this by after a def simply
		# fetching all the way after the def until a space or (
		# and then add this to the def-token itself (as with fragment)
		return 0 if @chunk.charAt(0) == ' '

		var match

		if @end == ')'
			var outerctx = @ends[@ends:length - 2]
			# weird assumption, no?
			# console.log 'context is inside!!!'
			if outerctx == '%' and match = TAG_ATTR.exec(@chunk)
				token('TAG_ATTR_SET',match[1])
				return match[0]:length

		unless match = METHOD_IDENTIFIER.exec(@chunk)
			return 0			
		# var prev = last @tokens
		var length = match[0]:length
		
		var id = match[0]
		var ltyp = @lastTyp
		var typ = 'IDENTIFIER'
		var pre = id.charAt(0)
		var space = no

		var m4 = match[4] # might be out of bounds? should rather check charAt
		# drop match 4??

		# should this not quit here in practically all cases?
		unless (ltyp == '.' or ltyp == 'DEF') or (m4 == '!') or match[5]
			return 0

		# again, why?
		if id == 'self' or id == 'this' or id == 'super' # in ['SELF','THIS']
			return 0

		if id == 'new'
			# console.log 'NEW here?'
			# this is wrong -- in the case of <div value=Date.new>
			# we are basically in a nested scope until the next space or >
			typ = 'NEW' unless ltyp == '.' and inTag

		if id == '...' and [',','(','CALL_START','BLOCK_PARAM_START','PARAM_START'].indexOf(ltyp) >= 0
			return 0

		if id == '|'
			# hacky way to implement this
			# with new lexer we'll use { ... } instead, and assume object-context,
			# then go back and correct when we see the context is invalid
			if ltyp == '(' or ltyp == 'CALL_START'
				token('DO', 'DO',0)
				self.pushEnd('|')
				# @ends.push '|'
				token('BLOCK_PARAM_START', id,1)
				return length

			elif ltyp == 'DO' or ltyp == '{'
				# @ends.push '|'
				self.pushEnd('|')
				token('BLOCK_PARAM_START', id,1)
				return length
				
			elif @ends[@ends:length - 1] == '|'
				token('BLOCK_PARAM_END', '|',1)
				pair '|'
				return length
			else
				return 0

		# whaat?
		# console.log("method identifier",id)
		if (['&','^','<<','<<<','>>'].indexOf(id) >= 0 or (id == '|' and context != '|'))
			return 0

		if OP_METHODS.indexOf(id) >= 0
			space = yes

		# not even anything we should use?!?
		if pre == '@'
			typ = 'IVAR'

		elif pre == '$'
			yes


		elif pre == '#'
			typ = 'TAGID'

		elif CONST_IDENTIFIER.test(pre) or id == 'global' or id == 'exports'
			# really? seems very strange
			# console.log('global!!',typ,id)
			typ = 'CONST'
		
		# what is this really for?
		if match[5] and ['IDENTIFIER','CONST','GVAR','CVAR','IVAR','SELF','THIS',']','}',')','NUMBER','STRING'].indexOf(ltyp) >= 0
			token('.','.',0)
	
		token(typ, id, length)

		if space
			@last:spaced = yes

		return length


	def inTag
		var len = @ends:length
		if len > 0
			var ctx0 = @ends[len - 1]
			var ctx1 = len > 1 ? @ends[len - 2] : ctx0
			return ctx0 == 'TAG_END' or (ctx1 == 'TAG_END' and ctx0 == 'OUTDENT')
		return false

	def isKeyword id
		if (id == 'attr' or id == 'prop')
			var scop = getScope
			var incls = scop == 'CLASS' or scop == 'TAG'
			return true if incls

		if @lastTyp == 'ATTR' or @lastTyp == 'PROP'
			return false

		ALL_KEYWORDS.indexOf(id) >= 0

	# Matches identifying literals: variables, keywords, method names, etc.
	# Check to ensure that JavaScript reserved words aren't being used as
	# identifiers. Because Imba reserves a handful of keywords that are
	# allowed in JavaScript, we're careful not to tokid them as keywords when
	# referenced as property names here, so you can still do `jQuery.is()` even
	# though `is` means `===` otherwise.
	def identifierToken
		var match

		var ctx0 = @ends[@ends:length - 1]
		var ctx1 = @ends[@ends:length - 2]
		var innerctx = ctx0
		var typ
		var reserved = no

		var addLoc = false
		var inTag = ctx0 == 'TAG_END' or (ctx1 == 'TAG_END' and ctx0 == 'OUTDENT')

		# console.log ctx1,ctx0
	
		if inTag && match = TAG_ATTR.exec(@chunk)
			# console.log 'TAG_ATTR IN tokid',match
			# var prev = last @tokens
			# if the prev is a terminator, we dont really need to care?
			if @lastTyp != 'TAG_NAME'
				if @lastTyp == 'TERMINATOR'
					# console.log('prev was terminator -- drop it?')
					true
				else
					token(",", ",")

			var l = match[0]:length

			token 'TAG_ATTR',match[1],l - 1  # add to loc?
			@loc += l - 1
			token '=','=',1
			return l

		# see if this is a plain object-key
		# way too much logic going on here?
		# the ast should normalize whether keys
		# are accessable as keys or strings etc
		if match = OBJECT_KEY.exec(@chunk)
			var id = match[1]
			var typ = 'KEY'

			token(typ, id, id:length)
			moveCaret(id:length)
			token ':', ':', match[3]:length
			moveCaret(-id:length)
			return match[0]:length

		unless match = IDENTIFIER.exec(@chunk)
			return 0

		var [input, id, typ, m3, m4, colon] = match
		var idlen = id:length

		# What is the logic here?
		if id is 'own' and lastTokenType == 'FOR'
			token 'OWN', id, id:length
			return id:length

		var prev = last(@tokens)
		var lastTyp = @lastTyp

		if lastTyp == '#'
			token('IDENTIFIER', id, idlen)
			return idlen

		# should we force this to be an identifier even if it is a reserved word?
		# this should only happen for when part of object etc
		# will prev ever be @???
		var forcedIdentifier

		# again
		forcedIdentifier = colon || lastTyp == '.' or lastTyp == '?.' # in ['.', '?.'


		# temp hack! need to solve for other keywords etc as well
		# problem appears with ternary conditions.

		# well -- it should still be an indentifier if in object?
		# forcedIdentifier = no if id in ['undefined','break']

		forcedIdentifier = no if colon and lastTyp == '?' # for ternary

		# if we are not at the top level? -- hacky
		if id == 'tag' and @chunk.indexOf("tag(") == 0 # @chunk.match(/^tokid\(/)
			forcedIdentifier = yes

		var isKeyword = no

		# console.log "match",match
		# console.log "typ is {typ}"
		# little reason to check for this right here? but I guess it is only a simple check
		if typ == '$' and ARGVAR.test(id) # id.match(/^\$\d$/)
			# console.log "TYP $"
			if id == '$0'
				typ = 'ARGUMENTS'
			else
				typ = 'ARGVAR'
				id = id.substr(1)

		elif typ == '$' and ENV_FLAG.test(id)
			typ = 'ENV_FLAG'
			id = id.toUpperCase.slice(1, -1)

		elif typ == '@'
			typ = 'IVAR'
			# id:reserved = yes if colon
		elif typ == '#'
			typ = 'TAGID'

		elif typ == '@@'
			typ = 'CVAR'

		elif typ == '$' and !colon
			typ = 'IDENTIFIER'
			# typ = 'GVAR'

		elif CONST_IDENTIFIER.test(id) or id == 'global' or id == 'exports'
			# thous should really be handled by the ast instead
			typ = 'CONST'

		elif id == 'elif'
			token 'ELSE', 'elif', id:length
			token 'IF', 'if'
			return id:length

		else
			typ = 'IDENTIFIER'



		# this catches all 
		if !forcedIdentifier and isKeyword = self.isKeyword(id)
			# (id in JS_KEYWORDS or id in IMBA_KEYWORDS)

			typ = id.toUpperCase
			addLoc = true

			# clumsy - but testing performance
			if typ == 'YES'
				typ = 'TRUE'
			elif typ == 'NO'
				typ = 'FALSE'
			elif typ == 'NIL'
				typ = 'NULL'

			elif typ == 'VAR'
				if @lastVal == 'export'
					tTs(prev,'EXPORT')

			# skipping 
			elif typ == 'IF' or typ == 'ELSE' or typ == 'TRUE' or typ == 'FALSE' or typ == 'NULL'
				true

			elif typ == 'TAG'
				self.pushEnd('TAG')
				# @ends.push('TAG')
			# FIXME @ends is not used the way it is supposed to..
			# what we want is a context-stack
			elif typ == 'DEF'
				# should probably shift context and optimize this
				openDef

			elif typ == 'DO'
				closeDef if context == 'DEF'

			elif typ is 'WHEN' and LINE_BREAK.indexOf(lastTokenType) >= 0
				typ = 'LEADING_WHEN'

			elif typ is 'FOR'
				@seenFor = yes

			elif typ is 'UNLESS'
				typ = 'IF' # WARN

			elif UNARY.indexOf(typ) >= 0
				typ = 'UNARY'

			elif RELATION.indexOf(typ) >= 0
				if typ != 'INSTANCEOF' and typ != 'ISA' and @seenFor
					typ = 'FOR' + typ # ?
					@seenFor = no
				else
					typ = 'RELATION'

					if prev.@type == 'UNARY'
						prev.@type = 'NOT'

		if id == 'super'
			typ = 'SUPER'

		# do we really want to check this here
		if !forcedIdentifier
			# should already have dealt with this

			if @lastVal == 'export' and id == 'default'
				# console.log 'id is default!!!'
				tTs(prev,'EXPORT')
				typ = 'DEFAULT'

			# could use lookup-hash instead
			id = IMBA_ALIAS_MAP[id] if isKeyword and IMBA_ALIASES.indexOf(id) >= 0
			# these really should not go here?!?
			switch id
				when '!','not'                            then typ = 'UNARY'
				when '==', '!=', '===', '!=='             then typ = 'COMPARE'
				when '&&', '||'                           then typ = 'LOGIC'
				when 'break', 'continue', 'debugger','arguments' then typ = id.toUpperCase
				# when 'true', 'false', 'null', 'undefined' then typ = 'BOOL'
				# really?

		# prev = last @tokens
		var len = input:length

		# should be strict about the order, check this manually instead
		if typ == 'CLASS' or typ == 'DEF' or typ == 'TAG'
			queueScope(typ)

			var i = @tokens:length

			while i
				var prev = @tokens[--i]
				var ctrl = "" + tV(prev)
				# console.log("ctrl is {ctrl}")
				# need to coerce to string because of stupid CS ===
				# console.log("prev is",prev[0],prev[1])
				if ctrl in IMBA_CONTEXTUAL_KEYWORDS
					tTs(prev,ctrl.toUpperCase)
					# prev[0] = ctrl.toUpperCase # FIX
				else
					break

		elif typ == 'IF'
			queueScope(typ)

		elif typ == 'IMPORT'
			# could manually parse the whole ting here?
			pushEnd('IMPORT')
			# @ends.push 'IMPORT'

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
		
		if colon
			# console.log 'colon',colon,typ
			if typ == 'IDENTIFIER' and NOT_KEY_AFTER.indexOf(@lastTyp) == -1
				typ = 'KEY'

			token(typ, id, idlen)
			moveCaret(idlen)
			token(':', ':',colon:length)
			moveCaret(-idlen)
		else
			token(typ, id, idlen)

		return len

	# Matches numbers, including decimals, hex, and exponential notation.
	# Be careful not to interfere with ranges-in-progress.
	def numberToken
		var match, number, lexedLength

		return 0 unless match = NUMBER.exec(@chunk)

		number = match[0]
		lexedLength = number:length

		if var binaryLiteral = /0b([01]+)/.exec(number)
			
			number = "" + parseInt(binaryLiteral[1], 2)

		var prev = last(@tokens)

		if match[0][0] == '.' && prev && !prev:spaced && ['IDENTIFIER',')','}',']','NUMBER'].indexOf(tT(prev)) >= 0
			# console.log "got here"
			token ".","."
			number = number.substr(1)
		

		token('NUMBER',number,lexedLength)
		return lexedLength
	
	def symbolToken
		var match, symbol, prev

		return 0 unless match = SYMBOL.exec(@chunk)
		symbol = match[0].substr(1)
		prev = last(@tokens)

		# is this a property-access?
		# should invert this -- only allow when prev IS .. 
	
		# : should be a token itself, with a specification of spacing (LR,R,L,NONE)

		# FIX
		if prev and !prev:spaced and tT(prev) !in ['(','{','[','.','CALL_START','INDEX_START',',','=','INDENT','TERMINATOR']
			token '.:',':', 1
			var sym = symbol.split(/[\:\\\/]/)[0] # really?
			# token 'SYMBOL', "'#{symbol}'"
			token 'IDENTIFIER', sym, sym:length, 1
			return (sym:length + 1)
		else
			# token 'SYMBOL', "'#{symbol}'"
			token 'SYMBOL', symbol, match[0]:length
			match[0]:length

	def escapeStr str, heredoc, q
		str = str.replace MULTILINER, (heredoc ? '\\n' : '')
		if q
			var r = RegExp("\\\\[{q}]","g")
			str = str.replace(r,q)
			str = str.replace RegExp("{q}","g"), '\\$&'
		return str

		# str = str.replace(MULTILINER, '\\n')
		# str = str.replace(/\t/g, '\\t')
	# Matches strings, including multi-line strings. Ensures that quotation marks
	# are balanced within the string's contents, and within nested interpolations.
	def stringToken
		var match, string

		switch @chunk.charAt(0)
			when "'"
				return 0 unless match = SIMPLESTR.exec(@chunk)
				string = match[0]
				token 'STRING', escapeStr(string), string:length
				# token 'STRING', (string = match[0]).replace(MULTILINER, '\\\n'), string:length

			when '"'
				return 0 unless string = balancedString(@chunk, '"')
				# what about tripe quoted strings?

				if string.indexOf('{') >= 0
					var len = string:length
					# if this has no interpolation?
					# we are now messing with locations - beware
					token 'STRING_START', string.charAt(0), 1
					interpolateString(string.slice 1, -1)
					token 'STRING_END', string.charAt(len - 1), 1, string:length - 1
				else
					var len = string:length
					# string = string.replace(MULTILINER, '\\\n')
					token 'STRING', escapeStr(string), len
			else
				return 0

		moveHead(string)
		return string:length

	# Matches heredocs, adjusting indentation to the correct level, as heredocs
	# preserve whitespace, but ignore indentation to the left.
	def heredocToken
		var match, heredoc, quote, doc

		return 0 unless match = HEREDOC.exec(@chunk)

		heredoc = match[0]
		quote = heredoc.charAt 0
		var opts = {quote: quote, indent: null, offset: 0}
		doc = sanitizeHeredoc(match[2], opts)
		# doc = match[2]
		# console.log "found heredoc {match[0]:length} {doc:length}"

		if quote == '"' && doc.indexOf('{') >= 0
			var open = match[1]
			# console.log doc.substr(0,3),match[1]
			# console.log 'heredoc here',open:length,open

			token 'STRING_START', open, open:length
			interpolateString(doc, heredoc: yes, offset: (open:length + opts:offset), quote: quote, indent: opts:realIndent)
			token 'STRING_END', open, open:length, heredoc:length - open:length
		else
			token('STRING', makeString(doc, quote, yes), 0)

		moveHead(heredoc)
		return heredoc:length

	# Matches and consumes comments.
	def commentToken
		var match, length, comment, indent, prev

		var typ = 'HERECOMMENT'

		if match = INLINE_COMMENT.exec(@chunk) # .match(INLINE_COMMENT)
			# console.log "match inline comment"
			length = match[0]:length
			indent = match[1]
			comment = match[2]

			prev = last(@tokens)
			var pt = prev and tT(prev)
			var note = '//' + comment.substr(1)

			if @last and @last:spaced
				note = ' ' + note
				# console.log "the previous node was SPACED"
			# console.log "comment {note} - indent({indent}) - {length} {comment:length}"

			if (pt and pt != 'INDENT' and pt != 'TERMINATOR') or !pt
				# console.log "skip comment"
				# token 'INLINECOMMENT', comment.substr(2)
				# console.log "adding as terminator"
				token('TERMINATOR', note, length) # + '\n'
			else
				# console.log "add comment ({note})"
				if pt == 'TERMINATOR'
					tVs(prev,tV(prev) + note)
					# prev[1] += note
				elif pt == 'INDENT'
					# console.log "adding comment to INDENT: {note}" # why not add directly here?
					addLinebreaks(1,note)
				else
					# console.log "comment here"
					# should we ever get here?
					token(typ, comment.substr(2), length) # are we sure?
			
			return length # disable now while compiling

		# should use exec?
		return 0 unless match = COMMENT.exec(@chunk)

		var comment = match[0]
		var here = match[1]

		if here
			token 'HERECOMMENT', sanitizeHeredoc(here, herecomment: true, indent: Array(@indent + 1).join(' ')), comment:length
			token 'TERMINATOR', '\n'
		else
			token 'HERECOMMENT', comment, comment:length
			token 'TERMINATOR', '\n' # auto? really?

		moveHead(comment)
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

		return 0 if @chunk.charAt(0) != '/'
		if match = HEREGEX.exec(@chunk)
			length = heregexToken(match)
			moveHead(match[0])
			return length

		prev = last @tokens
		# FIX
		return 0 if prev and (tT(prev) in (if prev:spaced then NOT_REGEX else NOT_SPACED_REGEX))
		return 0 unless match = REGEX.exec(@chunk)
		var [m, regex, flags] = match

		token 'REGEX', "{regex}{flags}", m:length
		m:length

	# Matches multiline extended regular expressions.
	# The escaping should rather happen in AST - possibly as an additional flag?
	def heregexToken match
		var [heregex, body, flags] = match

		if 0 > body.indexOf('#{')

			var re = body.replace(HEREGEX_OMIT, '').replace(/\//g, '\\/')

			if re.match(/^\*/)
				error 'regular expressions cannot begin with `*`'

			token 'REGEX', "/{ re or '(?:)' }/{flags}", heregex:length
			return heregex:length

		# use more basic regex type

		token 'CONST', 'RegExp'
		@tokens.push T.token('CALL_START', '(',0)
		var tokens = []

		for pair in interpolateString(body, regex: yes)

			var tok = tT(pair) # FIX
			var value = tV(pair) # FIX

			if tok == 'TOKENS'
				# FIXME what is this?
				tokens.push *value
			else

				# if !value
				#	throw error?

				continue unless value = value.replace(HEREGEX_OMIT, '')

				value = value.replace /\\/g, '\\\\'
				tokens.push T.token('STRING', makeString(value, '"', yes), 0) # FIX

			tokens.push T.token('+', '+', 0) # FIX

		tokens.pop

		# FIX
		unless tokens[0] and tT(tokens[0]) is 'STRING'
			# FIX
			@tokens.push T.token('STRING', '""'), T.token('+', '+')

		@tokens.push *tokens # what is this?
		# FIX

		if flags
			@tokens.push(T.token(',', ',', 0))
			@tokens.push(T.token('STRING', '"' + flags + '"', 0))

		token(')', ')',0)

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

		var indent = match[0]
		var brCount = moveHead(indent)

		@seenFor = no
		# reset column as well?
		var prev = last @tokens, 1
		let whitespace = indent.substr(indent.lastIndexOf('\n') + 1)
		var noNewlines = self.unfinished

		if (/^\n#\s/).test(@chunk)
			addLinebreaks(1)
			return 0

		# decide the general line-prefix by the very first line with characters

		# if gutter is undefined - we create it on the very first chance we have
		if @state:gutter == undefined
			@state:gutter = whitespace

		# if we have a gutter -- remove it
		if var gutter = @state:gutter or @opts:gutter
			if whitespace.indexOf(gutter) == 0
				whitespace = whitespace.slice(gutter:length)

			elif @chunk[indent:length] === undefined
				# if this is the end of code we're okay
				yes
			else
				warn('incorrect indentation')
				# console.log "GUTTER IS INCORRECT!!",JSON.stringify(indent),JSON.stringify(@chunk[indent:length]),@last # @chunk[indent:length - 1]

			# should throw error otherwise?

		var size = whitespace:length

		if size > 0
			# seen indent?

			unless @indentStyle
				@opts:indent = @indentStyle = whitespace

			let indentSize = 0
			let offset = 0

			while true
				let idx = whitespace.indexOf(@indentStyle,offset)
				if idx == offset
					indentSize++
					offset += @indentStyle['length']
				elif offset == whitespace:length
					break
				elif @opts:silent
					break
				else
					# workaround to report correct location
					@loc += indent:length - whitespace:length
					token('INDENT', whitespace,whitespace:length)
					return error('inconsistent indentation')

			size = indentSize


		if size - @indebt is @indent
			if noNewlines
				suppressNewlines()
			else
				newlineToken(brCount)
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

			if immediate and tT(immediate) == 'TERMINATOR'
				tTs(immediate,'INDENT')
				# should add terminator inside indent?
				immediate.@meta ||= {pre: tV(immediate), post: ''}

				# should rather add to meta somehow?!?
				# tVs(immediate,tV(immediate) + '%|%') # crazy
			else
				token('INDENT', "" + diff,0)

			# console.log "indenting", prev, last(@tokens,1)
			# if prev and prev[0] == 'TERMINATOR'
			#   console.log "terminator before indent??"

			# check for comments as well ?

			@indents.push diff
			pushEnd('OUTDENT')
			# @ends.push 'OUTDENT'
			@outdebt = @indebt = 0
			addLinebreaks(brCount)
		else
			@indebt = 0
			outdentToken(@indent - size, noNewlines, brCount)
			addLinebreaks(brCount - 1)
			# console.log "outdent",noNewlines,tokid()

		@indent = size
		return indent:length

	# Record an outdent token or multiple tokens, if we happen to be moving back
	# inwards past several recorded indents.
	def outdentToken moveOut, noNewlines, newlineCount
		# here we should also take care to pop / reset the scope-body
		# or context-type for indentation 
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

				addLinebreaks(1) unless noNewlines

				pair 'OUTDENT'
				token('OUTDENT', "" + dent, 0)

		@outdebt -= moveOut if dent

		@tokens.pop while lastTokenValue == ';'

		token('TERMINATOR','\n',0) unless lastTokenType == 'TERMINATOR' or noNewlines
		# capping scopes so they dont hang around 
		@scopes:length = @indents:length

		var ctx = context
		pair(ctx) if ctx == '%' or ctx == 'TAG' # really?
		closeDef
		return this

	# Matches and consumes non-meaningful whitespace. tokid the previous token
	# as being "spaced", because there are some cases where it makes a difference.
	def whitespaceToken
		var match, nline, prev
		return 0 unless (match = WHITESPACE.exec(@chunk)) || (nline = @chunk.charAt(0) is '\n')
		prev = last @tokens

		# FIX - why oh why?
		if prev
			if match
				prev:spaced = yes
				prev.@s = match[0]
				return match[0]:length
			else
				prev:newLine = yes
				return 0

	def addNewline
		token 'TERMINATOR', '\n'

	def moveHead str
		var br = count(str,'\n')
		return br
		

	def addLinebreaks count, raw
		var br

		return this if !raw and count == 0 # no terminators?

		var prev = @last

		if !raw
			if count == 1
				br = '\n'
			elif count == 2
				br = '\n\n'
			elif count == 3
				br = '\n\n\n'
			else
				br = repeatString('\n',count)
		# FIX
		if prev
			var t = prev.@type # @lastTyp
			var v = tV(prev)

			# we really want to add this
			if t == 'INDENT'
				# TODO we want to add to the indent
				# console.log "add the comment to the indent -- pre? {raw} {br}"
			
				var meta = prev.@meta ||= {pre: '', post: ''}
				meta:post += (raw or br)
				# tVs(v + (raw or br))
				return this

			elif t == 'TERMINATOR'
				# console.log "already exists terminator {br} {raw}"
				tVs(prev,v + (raw or br))
				return this
		
		token('TERMINATOR', br, 0)
		return

	# Generate a newline token. Consecutive newlines get merged together.
	def newlineToken lines
		
		# while lastTokenValue == ';'
		#	@tokens.pop

		addLinebreaks(lines)

		var ctx = context
		# WARN now import cannot go over multiple lines
		pair(ctx) if ctx == 'TAG' or ctx == 'IMPORT'
		closeDef()  # close def -- really?
		this

	# Use a `\` at a line-ending to suppress the newline.
	# The slash is removed here once its job is done.
	def suppressNewlines
		@tokens.pop if value() is '\\'
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
			value = @chunk.charAt(0)
		
		var end1 = @ends[@ends:length - 1]
		var end2 = @ends[@ends:length - 2]

		var inTag = end1 == 'TAG_END' or end1  == 'OUTDENT' and end2 == 'TAG_END'

		var tokid = value
		var prev  = last @tokens
		var pt = prev and tT(prev)
		var pv = prev and tV(prev)
		var length = value:length

		# is this needed?
		if value == '=' and prev

			if pv == '||' or pv == '&&' # in ['||', '&&']
				tTs(prev,'COMPOUND_ASSIGN')
				tVs(prev,pv + '=') # need to change the length as well
				prev.@len = @loc - prev.@loc + value:length
				return value:length

		if value is ';'             
			@seenFor = no
			tokid = 'TERMINATOR'

		elif value is '(' and inTag and pt != '=' and prev:spaced # FIXed
			# console.log 'spaced before ( in tokid'
			# FIXME - should rather add a special token like TAG_PARAMS_START
			token ',',','

		elif value is '->' and inTag
			tokid = 'TAG_END'
			pair 'TAG_END'

		elif value is '=>' and inTag
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
	
			# elif value is 'TERMINATOR' and end1 is '%' 
			# 	closeSelector()

		elif value is 'TERMINATOR' and end1 is 'DEF'
			closeDef()

		# TODO BLOCK PARAM BUG
		# really+
		elif value is '&' and context == 'DEF'
			# console.log("okay!")
			tokid = 'BLOCK_ARG'
			# change the next identifier instead?

		# elif value.match()
		elif value == '*' and @chunk.charAt(1).match(/[A-Za-z\_\@\[]/) and (prev:spaced or [',','(','[','{','|','\n','\t'].indexOf(pv) >= 0)
			tokid = "SPLAT"

		elif value == '√'
			tokid = 'SQRT'
		elif value == 'ƒ'
			tokid = 'DO'
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
			if value is '(' and pt in CALLABLE
				# not using this ???
				# prev[0] = 'FUNC_EXIST' if prev[0] is '?'
				tokid = 'CALL_START'

			elif value is '[' and pt in INDEXABLE
				tokid = 'INDEX_START'
				tTs(prev,'INDEX_SOAK') if pt == '?'
				# prev[0] = 'INDEX_SOAK' if prev[0] == '?'

		switch value
			when '(', '{', '[' then pushEnd(INVERSES[value])
			when ')', '}', ']' then pair value

		# hacky rule to try to allow for tuple-assignments in blocks
		# if value is ',' and prev[0] is 'IDENTIFIER' and @tokens[@tokens:length - 2][0] in ['TERMINATOR','INDENT']
		#   # token "TUPLE", "tuple" # should rather insert it somewhere else, no?
		#   console.log("found comma")

		token(tokid, value, value:length)
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
				error "block comment cannot contain '*/' starting"
			return doc if doc.indexOf('\n') <= 0
		else
			while match = HEREDOC_INDENT.exec(doc)
				var attempt = match[1]
				if indent is null or 0 < attempt:length < indent:length
					indent = attempt

		doc = doc.replace RegExp("\\n{indent}","g"), '\n' if indent
		unless herecomment
			if doc[0] == '\n'
				options:offset = indent:length + 1
			doc = doc.replace(/^\n/, '')
		options:realIndent = indent
		return doc

	# A source of ambiguity in our grammar used to be parameter lists in function
	# definitions versus argument lists in function calls. Walk backwards, tokidging
	# parameters specially in order to make things easier for the parser.
	def tagParameters
		return this if lastTokenType != ')'
		var stack = []
		var tokens = @tokens
		var i = tokens:length

		tTs(tokens[--i], 'PARAM_END')

		while var tok = tokens[--i]
			var t = tT(tok)
			switch t
				when ')'
					stack.push tok
				when '(', 'CALL_START'
					if stack:length
						stack.pop
					elif t is '('
						tTs(tok,'PARAM_START')
						return this
					else
						return this

		return this

	# Close up all remaining open blocks at the end of the file.
	def closeIndentation
		pair(context) if context == 'IMPORT'
		closeDef
		closeSelector
		outdentToken(@indent,no,0)

	# Matches a balanced group such as a single or double-quoted string. Pass in
	# a series of delimiters, all of which must be nested correctly within the
	# contents of the string. This method allows us to have strings within
	# interpolations within strings, ad infinitum.
	def balancedString str, end
		var match, letter, prev

		var stack = [end]
		var i = 0

		# could it not happen here?
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

			if end is '}' and (letter == '"' or letter == "'")
				stack.push(end = letter)

			elif end is '}' and letter is '/' and match = (HEREGEX.exec(str.slice i) or REGEX.exec(str.slice i))
				i += match[0]:length - 1

			elif end is '}' and letter is '{'
				stack.push end = '}'
			elif end is '"' and letter is '{'
				stack.push end = '}'
			prev = letter

		error "missing { stack.pop }, starting" unless @opts:silent

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
		var quote = options:quote
		var regex = options:regex
		var prefix = options:prefix
		var indent = options:indent

		var startLoc = @loc
		var tokens = []
		var pi = 0
		var i  = -1
		var locOffset = options:offset or 1
		var strlen = str:length
		var letter
		var expr

		var isInterpolated = no
		# out of bounds
		while letter = str.charAt(i += 1)
			if letter is '\\'
				i += 1
				continue

			if letter is '\n' and indent
				locOffset += indent:length

			unless str.charAt(i) is '{' and (expr = balancedString(str.slice(i), '}'))
				continue

			isInterpolated = yes

			# these have no real sense of location or anything?
			if pi < i
				# this is the prefix-string - before any item
				var tok = Token.new('NEOSTRING', escapeStr(str.slice(pi, i),heredoc,quote),@loc + pi + locOffset,i - pi)
				# tok.@loc = @loc + pi
				# tok.@len = i - pi + 2
				tokens.push(tok)

			tokens.push Token.new('{{','{',@loc + i + locOffset,1)

			var inner = expr.slice(1, -1)

			# remove leading spaces 
			# need to keep track of how much whitespace we dropped from the start
			inner = inner.replace(/^[^\n\S]+/,'')

			if inner:length
				# we need to remember the loc we start at
				# console.log('interpolate from loc',@loc,i)
				# really? why not just add to the stack??
				# what about the added 
				# should share with the selector no?
				# console.log "tokenize inner parts of string",inner
				var spaces = 0
				var offset = @loc + i + (expr:length - inner:length) - 1
				# why create a whole new lexer? Should rather reuse one
				# much better to simply move into interpolation mode where
				# we continue parsing until we meet unpaired }
				var nested = Lexer.new.tokenize inner, inline: yes, rewrite: no, loc: offset + locOffset
				# console.log nested.pop

				if nested[0] and tT(nested[0]) == 'TERMINATOR'
					nested.shift

				if nested:length
					tokens.push *nested # T.token('TOKENS',nested,0)
			
			# should rather add the amount by which our lexer has moved?
			i += expr:length - 1
			tokens.push Token.new('}}','}',@loc + i + locOffset,1)
			pi = i + 1

		# adding the last part of the string here
		if i >= pi and pi < str:length
			# set the length as well - or?
			# the string after?
			# console.log 'push neostring'
			tokens.push Token.new('NEOSTRING', escapeStr(str.slice(pi),heredoc,quote),@loc + pi + locOffset, str:length - pi)

		# console.log tokens:length
		return tokens if regex

		return token 'NEOSTRING', '""' unless tokens:length

		@tokens.push(tok) for tok in tokens

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
					stack.pop
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

		error "missing { stack.pop }, starting"

	# Pairs up a closing token, ensuring that all listed pairs of tokens are
	# correctly balanced throughout the course of the token stream.
	def pair tok
		var wanted = last(@ends)
		unless tok == wanted
			error "unmatched {tok}" unless 'OUTDENT' is wanted
			var size = last(@indents)
			@indent -= size
			outdentToken(size, true, 0)
			return pair(tok)
		self.popEnd


	# Helpers
	# -------

	# Add a token to the results, taking note of the line number.
	def token id, value, len, offset
		@lastTyp = id
		@lastVal = value
		var tok = @last = Token.new(id, value, @loc + (offset or 0), len or 0)
		@tokens.push tok
		return

	def lastTokenType
		var token = @tokens[@tokens:length - 1]
		token ? tT(token) : 'NONE'

	def lastTokenValue
		var token = @tokens[@tokens:length - 1]
		token ? token.@value : ''
		
	# Peek at a tokid in the current token stream.
	def tokid index, val
		if var tok = last(@tokens, index)
			tTs(tok,val) if val
			return tT(tok)
			# tok.@type = tokid if tokid # why?
			# tok.@type
		else null

	# Peek at a value in the current token stream.
	def value index, val
		if var tok = last(@tokens, index)
			tVs(tok,val) if val
			return tV(tok)
			# tok.@value = val if val # why?
			# tok.@value
		else null
		

	# Are we in the midst of an unfinished expression?
	def unfinished
		return true if LINE_CONTINUER.test(@chunk)	
		return UNFINISHED.indexOf(@lastTyp) >= 0
	
	# Converts newlines for string literals.
	def escapeLines str, heredoc
		str.replace MULTILINER, (heredoc ? '\\n' : '')

	# Constructs a string token by escaping quotes and newlines.
	def makeString body, quote, heredoc
		return quote + quote unless body
		body = body.replace(/\\([\s\S])/g) do |match, contents|
			(contents == '\n' or contents == quote) ? contents : match
		# Does not work now
		body = body.replace RegExp("{quote}","g"), '\\$&'
		quote + escapeLines(body, heredoc) + quote
		
	# Throws a syntax error on the current `@line`.
	def error message, len
		message = "{message} on line {@line}" if @line isa Number

		if len
			message += " [{@loc}:{@loc + len}]"

		var err = SyntaxError.new(message)
		err:line = @line
		# err:columnNumber
		var err = ERR.ImbaParseError.new(err, tokens: @tokens, pos: @tokens:length)
		err:region = [@loc,@loc + (len or 0)]
		throw err

	def warn message
		var ary = @tokens:warnings ||= []
		ary.push(message)
		console.warn message
		self

