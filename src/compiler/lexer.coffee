# The Imba Lexer. Uses a series of token-matching regexes to attempt
# matches against the beginning of the source code. When a match is found,
# a token is produced, we consume the match, and start again. Tokens are in the
# form:
#
#     [tag, value, lineNumber]
#
# Which is a format that can be fed directly into [Jison](http://github.com/zaach/jison).

ALLOW_HYPHENS_IN_IDENTIFIERS = true
CONVERT_HYPHENS_TO_CAMEL_CASE = true

StringToCamelCase = (str) ->
  # console.log('calling string to camel',str)
  return str
  str.replace(/-(\w)/g, (m,l)-> l.toUpperCase())

{Rewriter, INVERSES} = require './rewriter'


exports.LexerError = class LexerError extends SyntaxError

  constructor: (message, file, line) ->
    @message = message
    @file = file
    @line = line
    return this

# Import the helpers we need.
# {starts, last} = require './helpers'

starts = (string, literal, start) ->
  literal is string.substr start, literal.length

last = (array, back) ->
  array[array.length - (back or 0) - 1]

count = (string, substr) ->
  num = pos = 0
  return 1/0 unless substr.length
  num++ while pos = 1 + string.indexOf substr, pos
  num


# The Lexer Class
# ---------------

# The Lexer class reads a stream of Imba and divvies it up into tagged
# tokens. Some potential ambiguity in the grammar has been avoided by
# pushing some extra smarts into the Lexer.
exports.Lexer = class Lexer

  # **tokenize** is the Lexer's main method. Scan by attempting to match tokens
  # one at a time, using a regular expression anchored at the start of the
  # remaining code, or a custom recursive token-matching method
  # (for interpolations). When the next token has been recorded, we move forward
  # within the code past the token, and begin again.
  #
  # Each tokenizing method is responsible for returning the number of characters
  # it has consumed.
  #
  # Before returning the token stream, run it through the [Rewriter](rewriter.html)
  # unless explicitly asked not to.
  tokenize: (code, opts = {}) ->
    code     = "\n#{code}" if WHITESPACE.test code

    # this makes us lose the loc-info, no?
    code     = code.replace(/\r/g, '').replace TRAILING_SPACES, ''

    @code    = code           # The remainder of the source code.
    @opts    = opts
    @line    = opts.line or 0 # The current line.
    @indent  = 0              # The current indentation level.
    @indebt  = 0              # The over-indentation at the current level.
    @outdebt = 0              # The under-outdentation at the current level.
    @indents = []             # The stack of all current indentation levels.
    @ends    = []             # The stack for pairing up tokens.
    @tokens  = []             # Stream of parsed tokens in the form `['TYPE', value, line]`.
    @locOffset = opts.loc or 0
    
    
    # console.log("options for parse",opts)

    # At every position, run through this list of attempted matches,
    # short-circuiting if any of them succeed. Their order determines precedence:
    # `@literalToken` is the fallback catch-all.
    i = 0
    while @chunk = code.slice i

      @loc = @locOffset + i
      # add context-specific parsing here?
      token = @tokens[@tokens.length - 1]
      ctx = @context()
      fn = null

      fn = {
        TAG: @tagContextToken
      }[ctx]

      i += fn && fn.call(this)or
           @selectorToken()   or
           @symbolToken()     or
           @methodNameToken() or
           @identifierToken() or
           @commentToken()    or
           @whitespaceToken() or
           @lineToken()       or
           @heredocToken()    or
           @tagToken()        or
           @stringToken()     or
           @numberToken()     or
           @regexToken()      or
           @jsToken()         or
           @literalToken()


    @closeIndentation()
    @error "missing #{tag}" if tag = @ends.pop()
    return @tokens if opts.rewrite is off or opts['no-rewrite']
    # console.log('rewrite')
    (new Rewriter).rewrite @tokens
  

  context: (opt) ->
    i = @ends.length - 1
    if opt
      o = @ends["_"+i]
      # console.log 'found options?',o,opt
      o and o[opt]
    else
      @ends[i]


  scope: (sym,opts) ->
    # need to rewrite the whole ends to not use characters
    len = @ends.push(sym)
    # console.log "scoping",sym,opts,@ends,len

    if opts
      # console.log "added options at", "_" + (len - 1), opts
      @ends["_" + (len - 1)] = opts

    return sym
  
  closeSelector: ->
    @pair('%') if @context() is '%'
  
  openDef: ->
    @ends.push('DEF')

  closeDef: ->
    if @context() is 'DEF'
      prev = last @tokens
      # console.log('closeDef with last>',prev)
      if prev[0] == 'DEF_FRAGMENT'
        true
      else
        @token('DEF_BODY', 'DEF_BODY')

      @pair('DEF')

  

  # Tokenizers
  # ----------

  tagContextToken: ->
    if match = TAG_TYPE.exec @chunk
      @token 'TAG_TYPE', match[0]
      return match[0].length

    if match = TAG_ID.exec @chunk
      input = match[0]
      @token 'TAG_ID', input
      return input.length

    return 0


  tagToken: ->
    return 0 unless match = TAG.exec @chunk
    [input, type, identifier] = match

    if type == '<'
      @token 'TAG_START', '<'
      @ends.push INVERSES['TAG_START']

      if identifier
        if identifier.substr(0,1) == '{'
          return type.length
        else
          @token 'TAG_NAME', input.substr(1)

    return input.length
  
  selectorToken: ->
    if @context() == '%'
      char = @chunk.charAt(0)

      if (match = SELECTOR_COMBINATOR.exec @chunk)
        # console.log 'selector match', match
        if @context('open')
          # console.log 'should close the scope!!!'
          @pair '%'
          return 0
        @token 'SELECTOR_COMBINATOR', match[1] || " "
        return match[0].length
      
      else if match = SELECTOR_PART.exec @chunk
        type = match[1]
        id = match[2]

        tag = switch type
          when '.' then 'SELECTOR_CLASS'
          when '#' then 'SELECTOR_ID'
          when ':' then 'SELECTOR_PSEUDO_CLASS'
          when '::' then 'SELECTOR_PSEUDO_CLASS'
          else 'SELECTOR_TAG'
        
        @token tag, match[2]
        return match[0].length

      # else if match = SELECTOR_PSEUDO_CLASS.exec @chunk
      #  @token tag, match[2]
      #  return match[0].length
      
      else if char == '['
        @token '[','['
        @ends.push ']'
        if match = SELECTOR_ATTR.exec @chunk
          @token 'IDENTIFIER', match[1]
          @token 'SELECTOR_ATTR_OP', match[2]
          return match[0].length
        return 1

      else if char == '|'
        token = @tokens[@tokens.length - 1]
        token[0] = 'SELECTOR_NS'
        return 1

      else if char == ','
        if @context('open')
          @pair '%'
          return 0

        @token 'SELECTOR_GROUP',','
        return 1
      else if char == '*'
        @token 'UNIVERSAL_SELECTOR','*'
        return 1
      
      # what, really?
      else if char in [')','}',']','']
        @pair '%'
        return 0

      # how to get out of the scope?


    return 0 unless match = SELECTOR.exec @chunk
    [input, id, kind] = match

    # this is a closed selector
    if kind == '('
      @token '(','('
      @token 'SELECTOR_START', id
      @ends.push ')'
      @ends.push '%'
      return id.length+1

    else if id == '%'
      # we are already scoped in on a selector
      return 1 if @context() == '%'
      @token 'SELECTOR_START', id
      # get into the selector-scope
      @scope('%', open: yes)
      # @ends.push '%'
      # make sure a terminator breaks out
      return id.length
    else
      return 0

    if id in ['%','$'] and char in ['%','$','@','(','[']
      idx = 2
      

      # VERY temporary way of solving this
      if char in ['%','$','@']
        id += char
        idx = 3
        char = @chunk.charAt(2)


      if char == '('
        return 0 unless string = @balancedSelector @chunk, ')'
        if 0 < string.indexOf '{', 1
          @token 'SELECTOR',id
          @interpolateSelector string.slice idx, -1
          return string.length
        else
          @token 'SELECTOR',id
          @token '(','('
          @token 'STRING', '"'+string.slice(idx,-1)+'"'
          @token ')',')'
          return string.length
      else if char == '['
        @token 'SELECTOR',id
        return 1
        # @token '[','['
        # @ends.push ''
    else
      return 0
  
  # is this really needed? Should be possible to
  # parse the identifiers and = etc i jison?
  methodNameToken: ->
    outerctx = @ends[@ends.length-2]
    innerctx = @ends[@ends.length-1]

    if outerctx == '%' and innerctx == ')'
      # console.log 'context is inside!!!'
      if match = TAG_ATTR.exec @chunk
        @token 'TAG_ATTR_SET',match[1]
        return match[0].length

    return 0 unless match = METHOD_IDENTIFIER.exec @chunk
    prev = last @tokens
    length = match[0].length
    
    id = match[0]
    tag = 'IDENTIFIER'
    typ = id.substr(0,1)
    space = no

    if CONVERT_HYPHENS_TO_CAMEL_CASE
      id = StringToCamelCase(id)

    return 0 unless prev && prev[0] in ['.','DEF'] or match[4] in ['!','?'] or match[5]
    return 0 if id.toUpperCase() in ['SELF','THIS']


    # this is not an method anymore
    # if id == '[]' and (!prev or (prev[0] != 'DEF' and (prev.spaced or prev[0] not in CALLABLE)))
    #   # console.log 'not hitting on []'
    #   return 0
    # if id == '%' and (!prev or (prev[0] != 'DEF'))
    #   return 0

    if id == 'super'
      return 0

    if id == 'new'
      tag = 'NEW'

    # pass bitwise operations directly through for numbers
    # prev[0] is 'NUMBER' and 
    # might be >
    return 0 if id == '...' and prev[0] in [',','(','CALL_START','BLOCK_PARAM_START','PARAM_START']

    if id == '|'
      # hacky way to implement this
      # with new lexer we'll use { ... } instead, and assume object-context,
      # then go back and correct when we see the context is invalid
      if prev[0] in ['(','CALL_START']
        @token 'DO', 'DO'
        @ends.push '|'
        @token 'BLOCK_PARAM_START', id
        return length

      else if prev[0] in ['DO','{']
        @ends.push '|'
        @token 'BLOCK_PARAM_START', id
        return length
        
      else if @ends[@ends.length-1] == '|'
        @token 'BLOCK_PARAM_END', '|'
        @pair '|'
        return length

      else
        # hmmm
        return 0

    # whaat?
    # console.log("method identifier",id)
    return 0 if (id in ['&','^','<<','<<<','>>'] or (id == '|' and @context() != '|'))

    space = yes if id in OP_METHODS

    if typ == '@'
      tag = 'IVAR'
      id  = new String id
      id.wrap = yes
    else if typ == '$'
      tag = 'GVAR'
    else if typ == '#'
      tag = 'TAGID'
    else if typ.match(/[A-Z]/) or id in GLOBAL_IDENTIFIERS
      # console.log('global!!',typ,id)
      tag = 'CONST'

    if match[4] or match[5] or id in ['eval', 'arguments'].concat JS_FORBIDDEN
      # console.log('got here')
      id = new String(id)
      id.wrap = yes
    
    if match[5] and prev[0] in ['IDENTIFIER','CONST','GVAR','CVAR','IVAR','SELF','THIS',']','}',')','NUMBER','STRING','IDREF']
      @token '.','.'
    
    # if id in ['eval', 'arguments'].concat JS_FORBIDDEN
    #   id  = new String id
    #   id.reserved = yes

    @token tag, id

    if space
      # console.log("add space here")
      last(@tokens).spaced = yes 
      # @token ' ', ' '

    return length


  inTag: ->
    ctx1 = @ends[@ends.length-2]
    ctx0 = @ends[@ends.length-1]
    return ctx0 == 'TAG_END' or (ctx1 == 'TAG_END' and ctx0 == 'OUTDENT')

  # Matches identifying literals: variables, keywords, method names, etc.
  # Check to ensure that JavaScript reserved words aren't being used as
  # identifiers. Because Imba reserves a handful of keywords that are
  # allowed in JavaScript, we're careful not to tag them as keywords when
  # referenced as property names here, so you can still do `jQuery.is()` even
  # though `is` means `===` otherwise.
  identifierToken: ->
    
    ctx1 = @ends[@ends.length-2]
    ctx0 = @ends[@ends.length-1]

    innerctx = @ends[@ends.length-1]

    addLoc = false
    inTag = ctx0 == 'TAG_END' or (ctx1 == 'TAG_END' and ctx0 == 'OUTDENT')

    # console.log ctx1,ctx0
  
    if inTag && match = TAG_ATTR.exec @chunk
      # console.log 'TAG_ATTR IN TAG'
      prev = last @tokens
      # if the prev is a terminator, we dont really need to care?
      if prev[0] != 'TAG_NAME' # hmm - it will never be tagname now?
        if prev[0] == 'TERMINATOR'
          # console.log('prev was terminator -- drop it?')
          true
        else
          @token(",", ",")

      @token 'TAG_ATTR',match[1]
      @token '=','='
      return match[0].length

    # see if this is a plain object-key
    # way too much logic going on here?
    # the ast should normalize whether keys
    # are accessable as keys or strings etc
    if match = OBJECT_KEY.exec(@chunk)
      id = match[1]
      tag = 'IDENTIFIER'

      # should rather make sure the identifier escapes, no?
      # if id.match(OBJECT_KEY_ESCAPE)
      #   tag = 'STRING'
      #   id = '"'+id+'"'
      # else if id in ['eval', 'arguments'].concat(JS_FORBIDDEN)
      #   # the ast parser will in the end take care of quoting
      #   # object-keys if needed 
      #   # beware - many minifiers require this
      #   true
      #   # should deal with this in ast instead - no?
      #   # console.log('got here')
      #   # tag = 'STRING'
      #   # id = '"'+id+'"'
      #   # id  = new String id
      #   # id.reserved = yes

      @token tag, id
      @token ':', ':'

      return match[0].length

    return 0 unless match = IDENTIFIER.exec @chunk
    [input, id, typ, m3, m4, colon] = match

    # What is the logic here?
    if id is 'own' and @tag() is 'FOR'
      @token 'OWN', id
      return id.length

    prev = last @tokens

    # check if this identifier 
    # FIXME makes it possible to use undefined as an identifier
    # that should not be possible (imho)
    forcedIdentifier = colon or
      prev and (prev[0] in ['.', '?.','::'] or
      not prev.spaced and prev[0] is '@')

    # temp hack! need to solve for other keywords etc as well
    # problem appears with ternary conditions.
    forcedIdentifier = no if id in ['undefined','break']
    forcedIdentifier = no if colon and prev[0] == '?' # for ternary

    # if we are not at the top level? -- hacky
    forcedIdentifier = yes if id in ['tag'] and @chunk.match(/^tag\(/)

    # make camelCase
    if CONVERT_HYPHENS_TO_CAMEL_CASE
      id = StringToCamelCase(id)
      # id = id.replace(/-(\w)/g, (m,l)-> l.toUpperCase())
      # console.log('converted id to',id)

    if id.match(/^\$\d$/)
      if id == '$0'
        tag = 'ARGUMENTS'
      else
        tag = 'ARGVAR'
        id = id.substr(1)

    else if typ == '@'
      # tag = colon and 'IDENTIFIER' or 'IVAR'
      tag = 'IVAR'
      id  = new String id
      id.wrap = yes
      # id.reserved = yes if colon
    else if typ == '#'
      # we are trying to move to generic tokens,
      # so we are starting to splitting up the symbols and the items
      # we'll see if that works
      tag = 'IDENTIFIER'
      @token '#', '#'
      id = id.substr(1)

      # tag = 'IDREF'
      # id  = new String id.substr(1)
      # id.wrap = yes

    else if typ == '@@'
      id  = new String id
      id.wrap = yes
      tag = 'CVAR'
    else if typ == '$' and not colon
      tag = 'GVAR'
    else if id.match(/^[A-Z]/) or id in GLOBAL_IDENTIFIERS
      tag = 'CONST'

    else if id == 'elif'
      @token 'ELSE', 'else'
      @token 'IF', 'if'
      return id.length
    else
      tag = 'IDENTIFIER'
      # if id in ['eval', 'arguments'].concat JS_FORBIDDEN
      #   id  = new String id
      #   id.reserved = yes


    if not forcedIdentifier and (id in JS_KEYWORDS or id in IMBA_KEYWORDS)
      tag = id.toUpperCase()
      addLoc = true
      # ctx = @context()
      # if tag == 'VAR'
      #   # console.log('warn! silently removing VAR declaration -- for future support')
      #   # return input.length

      if tag == 'TAG'
        @ends.push('TAG')
      # FIXME @ends is not used the way it is supposed to..
      # what we want is a context-stack
      if tag == 'DEF'
        @openDef()
        # @ends.push 'DEF'
      # else if tag == 'COMPARE'
      #   # and ctx == 'DEF'
      #   console.log('PICK IT UP HERE!!!')
      # possibly end the def-context
      else if tag == 'DO'
        @closeDef() if @context() == 'DEF'

      else if tag is 'WHEN' and @tag() in LINE_BREAK
        tag = 'LEADING_WHEN'
      else if tag is 'FOR'
        @seenFor = yes
      else if tag is 'UNLESS'
        tag = 'IF'
        # tag = 'UNLESS'

      else if tag in UNARY
        tag = 'UNARY'
      else if tag in RELATION
        if tag not in ['INSTANCEOF','ISA'] and @seenFor
          tag = 'FOR' + tag # ?
          @seenFor = no
        else
          tag = 'RELATION'
          if @value().toString() is '!'
            @tokens.pop()
            # WARN we need to keep the loc, no?
            id = '!' + id

    if id == 'super'
      tag = 'SUPER'
    else if id in ['eval', 'arguments'].concat JS_FORBIDDEN
      if forcedIdentifier 
        tag = 'IDENTIFIER'
        # console.log('got here')
        # wrapping strings do create problems
        # it might actually be better to append some special info
        # directly to the string -- and then parse that in the ast
        id  = new String id
        id.reserved = yes
      else if id in RESERVED

        if id in STRICT_RESERVED
          @error "reserved word \"#{id}\"", id.length

        # id = "#{id}$$reserved"
        id  = new String id
        id.reserved = yes


        # should not be reserved here
        # console.log("got here")
        # here we want to add loc as well(!)
        # @error "reserved word \"#{id}\"", id.length

    # special case for super
    # if id == 'no'
    #   console.log("ID IS NO HERE!",forcedIdentifier)

    

    unless forcedIdentifier
      id  = IMBA_ALIAS_MAP[id] if id in IMBA_ALIASES
      tag = switch id
        when '√'                                  then 'SQRT'
        when 'ƒ'                                  then 'FUNC'
        when '!'                                  then 'UNARY'
        when '==', '!=', '===', '!=='             then 'COMPARE'
        when '&&', '||'                           then 'LOGIC'
        when '∪', '∩'                             then 'MATH'
        when 'true', 'false', 'null', 'nil', 'undefined' then 'BOOL'
        when 'break', 'continue', 'debugger','arguments' then id.toUpperCase()
        else  tag
    
    prev = last @tokens
    len = input.length

    # only add loc if identifier (for now -- CS === comparisons can mess this up)
    # console.log('tag was identifier -- adding LOC',tag)

    # look for access-tags behind
    # if tag == 'DEF'
    #   console.log('found def')
    #   if prev && prev[0] == 'CONST' && prev[1] == 'global'
    #     prev[0] = 'GLOBAL'
    #     console.log('change global access!!!')

    if tag == 'CLASS' or tag == 'DEF' or tag == 'TAG' or tag == 'VAR'
      i = @tokens.length
      # console.log("FOUND CLASS/DEF",i)
      while i
        prev = @tokens[--i]
        ctrl = prev && (""+prev[1])
        # need to coerce to string because of stupid CS ===
        # console.log("prev is",prev[0],prev[1])
        if ctrl in IMBA_CONTEXTUAL_KEYWORDS
          prev[0] = ctrl.toUpperCase()
        else
          break

    # if tag == 'VAR'
    #
    # look for previous


    if tag == 'IDENTIFIER'
      # see if previous was catch
      if prev && prev[0] == 'CATCH'
        tag = 'CATCH_VAR'
        # console.log('PREV CATCH',id)
      # console.log('tag was identifier -- adding LOC')
      @token tag, id, len # hmm
    else if addLoc
      @token tag, id, len, true
    else
      @token tag, id

    @token ':', ':' if colon
    return len

  # Matches numbers, including decimals, hex, and exponential notation.
  # Be careful not to interfere with ranges-in-progress.
  numberToken: ->
    return 0 unless match = NUMBER.exec @chunk
    number = match[0]
    lexedLength = number.length
    if binaryLiteral = /0b([01]+)/.exec number
      number = (parseInt binaryLiteral[1], 2).toString()

    prev = last(@tokens)
    if match[0][0] == '.' && prev && !prev.spaced && prev[0] in ['IDENTIFIER',')','}',']','NUMBER']
      # console.log('FIX NUM')
      @token ".","."
      number = number.substr(1)

    @token 'NUMBER', number
    lexedLength
  
  symbolToken: ->
    return 0 unless match = SYMBOL.exec @chunk
    symbol = match[0].substr(1)
    prev = last(@tokens)

    # is this a property-access?
    # should invert this -- only allow when prev IS .. 
    # hmm, symbols not be quoted initially
    # : should be a token itself, with a specification of spacing (LR,R,L,NONE)
    if prev and !prev.spaced and prev[0] not in ['(','{','[','.','RAW_INDEX_START','CALL_START','INDEX_START',',','=','INDENT','TERMINATOR']
      @token '.','.'
      symbol = symbol.split(/[\:\\\/]/)[0] # really?
      # @token 'SYMBOL', "'#{symbol}'"
      @token 'SYMBOL', symbol
      return symbol.length+1
    else
      # @token 'SYMBOL', "'#{symbol}'"
      @token 'SYMBOL', symbol
      match[0].length

  # Matches strings, including multi-line strings. Ensures that quotation marks
  # are balanced within the string's contents, and within nested interpolations.
  stringToken: ->
    switch @chunk.charAt 0
      when "'"
        return 0 unless match = SIMPLESTR.exec @chunk
        @token 'STRING', (string = match[0]).replace MULTILINER, '\\\n'
      when '"'
        return 0 unless string = @balancedString @chunk, '"'
        if string.indexOf('{') >= 0
          @interpolateString string.slice 1, -1
        else
          @token 'STRING', @escapeLines string
      else
        return 0
    @line += count string, '\n'
    string.length

  # Matches heredocs, adjusting indentation to the correct level, as heredocs
  # preserve whitespace, but ignore indentation to the left.
  heredocToken: ->
    return 0 unless match = HEREDOC.exec @chunk
    heredoc = match[0]
    quote = heredoc.charAt 0
    doc = @sanitizeHeredoc match[2], quote: quote, indent: null
    if quote is '"' and 0 <= doc.indexOf '{'
      @interpolateString doc, heredoc: yes
    else
      @token 'STRING', @makeString doc, quote, yes
    @line += count heredoc, '\n'
    heredoc.length

  # Matches and consumes comments.
  commentToken: ->
    return 0 unless match = @chunk.match COMMENT
    [comment, here] = match
    if here
      @token 'HERECOMMENT', @sanitizeHeredoc here,
        herecomment: true, indent: Array(@indent + 1).join(' ')
      @token 'TERMINATOR', '\n'
    @line += count comment, '\n'

    comment.length

  # Matches JavaScript interpolated directly into the source via backticks.
  jsToken: ->
    return 0 unless @chunk.charAt(0) is '`' and match = JSTOKEN.exec @chunk
    @token 'JS', (script = match[0]).slice 1, -1
    script.length

  # Matches regular expression literals. Lexing regular expressions is difficult
  # to distinguish from division, so we borrow some basic heuristics from
  # JavaScript and Ruby.
  regexToken: ->
    return 0 if @chunk.charAt(0) isnt '/'
    if match = HEREGEX.exec @chunk
      length = @heregexToken match
      @line += count match[0], '\n'
      return length

    prev = last @tokens
    return 0 if prev and (prev[0] in (if prev.spaced then NOT_REGEX else NOT_SPACED_REGEX))
    return 0 unless match = REGEX.exec @chunk
    [match, regex, flags] = match
    if regex[..1] is '/*' then @error 'regular expressions cannot begin with `*`'
    if regex is '//' then regex = '/(?:)/'
    @token 'REGEX', "#{regex}#{flags}"
    match.length

  # Matches multiline extended regular expressions.
  heregexToken: (match) ->
    [heregex, body, flags] = match
    if 0 > body.indexOf '#{'
      re = body.replace(HEREGEX_OMIT, '').replace(/\//g, '\\/')
      if re.match /^\*/ then @error 'regular expressions cannot begin with `*`'
      @token 'REGEX', "/#{ re or '(?:)' }/#{flags}"
      return heregex.length
    @token 'IDENTIFIER', 'RegExp'
    @tokens.push ['CALL_START', '(']
    tokens = []
    for [tag, value] in @interpolateString(body, regex: yes)
      if tag is 'TOKENS'
        tokens.push value...
      else
        continue unless value = value.replace HEREGEX_OMIT, ''
        value = value.replace /\\/g, '\\\\'
        tokens.push ['STRING', @makeString(value, '"', yes)]
      tokens.push ['+', '+']
    tokens.pop()
    @tokens.push ['STRING', '""'], ['+', '+'] unless tokens[0]?[0] is 'STRING'
    @tokens.push tokens...
    @tokens.push [',', ','], ['STRING', '"' + flags + '"'] if flags
    @token ')', ')'
    heregex.length

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
  lineToken: ->
    return 0 unless match = MULTI_DENT.exec @chunk
    @pair('%') if @ends[@ends.length-1] is '%'
    indent = match[0]
    @line += count indent, '\n'
    @seenFor = no
    prev = last @tokens, 1
    size = indent.length - 1 - indent.lastIndexOf '\n'
    noNewlines = @unfinished()

    if size - @indebt is @indent
      if noNewlines
        @suppressNewlines()
      else
        # console.log('newlineToken',match,count(indent, '\n'),size)
        # this is where it is happening
        # would like to 
        @newlineToken(indent)
      return indent.length

    if size > @indent
      if noNewlines
        @indebt = size - @indent
        @suppressNewlines()
        return indent.length

      if @inTag()
        console.log "indent inside tag?!?"
        # @indebt = size - @indent
        # @suppressNewlines()
        return indent.length


      diff = size - @indent + @outdebt
      @closeDef()
      @token 'INDENT', diff

      @indents.push diff
      @ends   .push 'OUTDENT'
      @outdebt = @indebt = 0

    else
      @indebt = 0
      @outdentToken @indent - size, noNewlines

    @indent = size
    indent.length

  # Record an outdent token or multiple tokens, if we happen to be moving back
  # inwards past several recorded indents.
  outdentToken: (moveOut, noNewlines) ->
    while moveOut > 0
      len = @indents.length - 1
      if @indents[len] is undefined
        moveOut = 0
      else if @indents[len] is @outdebt
        moveOut -= @outdebt
        @outdebt = 0
      else if @indents[len] < @outdebt
        @outdebt -= @indents[len]
        moveOut  -= @indents[len]
      else
        dent = @indents.pop() - @outdebt
        moveOut -= dent
        @outdebt = 0
        @pair 'OUTDENT'
        @token 'OUTDENT', dent
    @outdebt -= moveOut if dent
    @tokens.pop() while @value() is ';'
    @token 'TERMINATOR', '\n' unless @tag() is 'TERMINATOR' or noNewlines

    ctx = @context()
    @pair(ctx) if ctx in ['%','TAG']
    @closeDef()

    this

  # Matches and consumes non-meaningful whitespace. Tag the previous token
  # as being "spaced", because there are some cases where it makes a difference.
  whitespaceToken: ->
    return 0 unless (match = WHITESPACE.exec @chunk) or
                    (nline = @chunk.charAt(0) is '\n')
    prev = last @tokens

    # console.log('whitespace?',match,nline,prev && prev[0])
    # if nline
    #  console.log('whitespace newline',prev)
    # else


    prev[if match then 'spaced' else 'newLine'] = true if prev
    if match then match[0].length else 0

  # Generate a newline token. Consecutive newlines get merged together.
  newlineToken: (chunk) ->
    @tokens.pop() while @value() is ';'
    prev = last @tokens
    # if prev and prev[0] is 'TERMINATOR'
    #   console.log('multiple newlines?')
    # console.log('newline',@tag())
    # console.log('newline!')
    
    arr = ['\\n']
    lines = count(chunk, '\n')
    i = 0
    arr.push('\\n') until (++i) == lines
    @token 'TERMINATOR', arr.join("") unless @tag() is 'TERMINATOR'
    
    # @pair('%') if @context() is '%'
    # @pair('%') if @context() is '%'
    ctx = @context()
    # Ghost?
    @pair(ctx) if ctx in ['%','TAG'] 

    @closeDef()

    this

  # Use a `\` at a line-ending to suppress the newline.
  # The slash is removed here once its job is done.
  suppressNewlines: ->
    @tokens.pop() if @value() is '\\'
    this

  # We treat all other single characters as a token. E.g.: `( ) , . !`
  # Multi-character operators are also literal tokens, so that Jison can assign
  # the proper order of operations. There are some symbols that we tag specially
  # here. `;` and newlines are both treated as a `TERMINATOR`, we distinguish
  # parentheses that indicate a method call from regular parentheses, and so on.
  literalToken: ->
    if match = OPERATOR.exec @chunk
      [value] = match
      @tagParameters() if CODE.test value
    else
      value = @chunk.charAt 0
    
    end1 = @ends[@ends.length-1]
    end2 = @ends[@ends.length-2]

    inTag = end1 == 'TAG_END' or end1  == 'OUTDENT' and end2 == 'TAG_END'

    tag  = value
    prev = last @tokens
    length = value.length

    # is this needed?
    if value is '=' and prev
      if not prev[1].reserved and prev[1] in JS_FORBIDDEN
        @error "reserved word \"#{@value()}\" can't be assigned"
      if prev[1] in ['||', '&&']
        prev[0] = 'COMPOUND_ASSIGN'
        prev[1] += '='
        return value.length

    if value is ';'             
     @seenFor = no
     tag = 'TERMINATOR'

    else if value is '(' and inTag and prev[0] != '=' and prev.spaced
      # console.log 'spaced before ( in tag'
      # FIXME - should rather add a special token like TAG_PARAMS_START
      @token ',',','

    else if value is '->' and inTag
      tag = 'TAG_END'
      @pair 'TAG_END'

    else if value is '/>' and inTag
      tag = 'TAG_END'
      @pair 'TAG_END'

    else if value is '>' and inTag
      tag = 'TAG_END'
      @pair 'TAG_END'

    # this is a tag-method
    else if value is '>' and @context() == 'DEF'
      # console.log('picked up >!!')
      tag = 'DEF_FRAGMENT'
  
    else if value is 'TERMINATOR' and end1 is '%' 
      @closeSelector()

    else if value is 'TERMINATOR' and end1 is 'DEF'
      @closeDef()

    # else if value is '.' and prev[0] in ['TERMINATOR','INDENT']
    #   # NO NO NO
    #   @token 'SELF','self'
    #   # @token value,value
    #   # return 1

    # TODO BLOCK PARAM BUG
    # really+
    else if value is '&' and @context() == 'DEF'
      # console.log("okay!")
      tag = 'BLOCK_ARG'
      # change the next identifier instead?

    # we're now done with the tag / context
    # else if end1 in ['%','DEF'] and value is 'TERMINATOR'
    #   @pair end1

    # else if value.match()
    else if value == '*' and @chunk.charAt(1).match(/[A-Za-z\_\@\[]/) and (prev.spaced or prev[1] in [',','(','[','{','|','\n','\t'])
      tag = "SPLAT"


    else if value == '√'             then tag = 'SQRT'
    else if value == 'ƒ'             then tag = 'FUNC'
    else if value in MATH            then tag = 'MATH'
    else if value in COMPARE         then tag = 'COMPARE'
    else if value in CONDITIONAL_ASSIGN then tag = 'CONDITIONAL_ASSIGN'
    else if value in COMPOUND_ASSIGN then tag = 'COMPOUND_ASSIGN'
    else if value in UNARY           then tag = 'UNARY'
    else if value in SHIFT           then tag = 'SHIFT'
    else if value in LOGIC           then tag = 'LOGIC' # or value is '?' and prev?.spaced 

    else if prev and not prev.spaced
      # need a better way to do these
      if value is '(' and end1 == '%'
        tag = 'TAG_ATTRS_START'
      else if value is '(' and prev[0] in CALLABLE
        # not using this ???
        # prev[0] = 'FUNC_EXIST' if prev[0] is '?'
        tag = 'CALL_START'
      else if value is '[' and prev[0] in INDEXABLE
        tag = 'INDEX_START'
        switch prev[0]
          when '?'  then prev[0] = 'INDEX_SOAK'
      else if value is '{' and prev[0] in INDEXABLE
        tag = 'RAW_INDEX_START'

    switch value
      when '(', '{', '[' then @ends.push INVERSES[value]
      when ')', '}', ']' then @pair value

    # hacky rule to try to allow for tuple-assignments in blocks
    # if value is ',' and prev[0] is 'IDENTIFIER' and @tokens[@tokens.length - 2][0] in ['TERMINATOR','INDENT']
    #   # @token "TUPLE", "tuple" # should rather insert it somewhere else, no?
    #   console.log("found comma")

    @token tag, value
    value.length

  # Token Manipulators
  # ------------------

  # Sanitize a heredoc or herecomment by
  # erasing all external indentation on the left-hand side.
  sanitizeHeredoc: (doc, options) ->
    {indent, herecomment} = options
    if herecomment
      if HEREDOC_ILLEGAL.test doc
        @error "block comment cannot contain \"*/\", starting"
      return doc if doc.indexOf('\n') <= 0
    else
      while match = HEREDOC_INDENT.exec doc
        attempt = match[1]
        indent = attempt if indent is null or 0 < attempt.length < indent.length
    doc = doc.replace /// \n #{indent} ///g, '\n' if indent
    doc = doc.replace /^\n/, '' unless herecomment
    doc

  # A source of ambiguity in our grammar used to be parameter lists in function
  # definitions versus argument lists in function calls. Walk backwards, tagging
  # parameters specially in order to make things easier for the parser.
  tagParameters: ->
    return this if @tag() isnt ')'
    stack = []
    {tokens} = this
    i = tokens.length
    tokens[--i][0] = 'PARAM_END'
    while tok = tokens[--i]
      switch tok[0]
        when ')'
          stack.push tok
        when '(', 'CALL_START'
          if stack.length then stack.pop()
          else if tok[0] is '('
            tok[0] = 'PARAM_START'
            return this
          else return this
    this

  # Close up all remaining open blocks at the end of the file.
  closeIndentation: ->
    # ctx = @context()
    # @pair(ctx) if ctx in ['%','DEF']
    @closeDef()
    @closeSelector()
    @outdentToken @indent


  # Matches a balanced group such as a single or double-quoted string. Pass in
  # a series of delimiters, all of which must be nested correctly within the
  # contents of the string. This method allows us to have strings within
  # interpolations within strings, ad infinitum.
  balancedString: (str, end) ->
    # console.log 'balancing string!', str, end
    stack = [end]
    i = 0
    # had to fix issue after later versions of coffee-script broke old loop type
    # should submit bugreport to coffee-script
    while i < (str.length - 1)
      i++
      switch letter = str.charAt i
        when '\\'
          i++
          continue
        when end
          stack.pop()
          unless stack.length
            v = str.slice 0, i + 1
            # console.log 'returning now, found balance!!!', v
            return v
          end = stack[stack.length - 1]
          continue
      if end is '}' and letter in ['"', "'"]
        stack.push end = letter
      else if end is '}' and letter is '/' and match = (HEREGEX.exec(str.slice i) or REGEX.exec(str.slice i))
        i += match[0].length - 1
      else if end is '}' and letter is '{'
        stack.push end = '}'
      else if end is '"' and letter is '{'
        stack.push end = '}'
      prev = letter

    @error "missing #{ stack.pop() }, starting"

  # Expand variables and expressions inside double-quoted strings using
  # Ruby-like notation for substitution of arbitrary expressions.
  #
  #     "Hello #{name.capitalize()}."
  #
  # If it encounters an interpolation, this method will recursively create a
  # new Lexer, tokenize the interpolated contents, and merge them into the
  # token stream.
  interpolateString: (str, options = {}) ->
    {heredoc, regex} = options
    prefix = options.prefix
    tokens = []
    pi = 0
    i  = -1
    while letter = str.charAt i += 1
      if letter is '\\'
        i += 1
        continue
      unless str.charAt(i) is '{' and (expr = @balancedString str.slice(i), '}')
        continue

      tokens.push ['NEOSTRING', str.slice(pi, i)] if pi < i
      inner = expr.slice(1, -1)
      # console.log 'inner is',inner

      if inner.length
        # we need to remember the loc we start at
        # console.log('interpolate from loc',@loc,i)
        nested = new Lexer().tokenize inner, line: @line, rewrite: off, loc: @loc + i + 2

        nested.pop()
        nested.shift() if nested[0]?[0] is 'TERMINATOR'
        if len = nested.length
          if len > 1
            nested.unshift ['(', '(']
            nested.push    [')', ')']
          tokens.push ['TOKENS', nested]
      i += expr.length-1
      pi = i + 1
    tokens.push ['NEOSTRING', str.slice pi] if i > pi < str.length
    return tokens if regex
    return @token 'STRING', '""' unless tokens.length
    tokens.unshift ['', ''] unless tokens[0][0] is 'NEOSTRING'
    @token '(', '(' if interpolated = tokens.length > 1
    for [tag, value], i in tokens
      @token '+', '+' if i
      if tag is 'TOKENS'
        @tokens.push value...
      else
        @token 'STRING', @makeString value, '"', heredoc
    @token ')', ')' if interpolated
    tokens




  # Matches a balanced group such as a single or double-quoted string. Pass in
  # a series of delimiters, all of which must be nested correctly within the
  # contents of the string. This method allows us to have strings within
  # interpolations within strings, ad infinitum.
  balancedSelector: (str, end) ->
    stack = [end]
    for i in [1...str.length]
      switch letter = str.charAt i
        when '\\'
          i++
          continue
        when end
          stack.pop()
          unless stack.length
            return str.slice 0, i + 1
          end = stack[stack.length - 1]
          continue
      if end is '}' and letter is [')']
        stack.push end = letter
      else if end is '}' and letter is '{'
        stack.push end = '}'
      else if end is ')' and letter is '{'
        stack.push end = '}'
      prev = letter
    @error "missing #{ stack.pop() }, starting"

  # Expand variables and expressions inside double-quoted strings using
  # Ruby-like notation for substitution of arbitrary expressions.
  #
  #     "Hello #{name.capitalize()}."
  #
  # If it encounters an interpolation, this method will recursively create a
  # new Lexer, tokenize the interpolated contents, and merge them into the
  # token stream.
  interpolateSelector: (str, options = {}) ->
    {heredoc, regex} = options
    prefix = options.prefix
    tokens = []
    pi = 0
    i  = -1
    while letter = str.charAt i += 1
      unless letter is '{' and (expr = @balancedSelector str.slice(i), '}')
        continue

      tokens.push ['NEOSTRING', str.slice(pi, i)] if pi < i
      inner = expr.slice(1, -1)
      if inner.length
        nested = new Lexer().tokenize inner, line: @line, rewrite: off
        nested.pop()
        nested.shift() if nested[0]?[0] is 'TERMINATOR'
        if len = nested.length
          if len > 1
            nested.unshift ['(', '(']
            nested.push    [')', ')']
          tokens.push ['TOKENS', nested]
      i += expr.length-1
      pi = i + 1
    tokens.push ['NEOSTRING', str.slice pi] if i > pi < str.length
    return tokens if regex
    return @token 'STRING', '""' unless tokens.length

    tokens.unshift ['', ''] unless tokens[0][0] is 'NEOSTRING'
    @token '(', '(' if interpolated = tokens.length > 1
    for [tag, value], i in tokens
      @token ',', ',' if i
      if tag is 'TOKENS'
        @tokens.push value...
      else
        @token 'STRING', @makeString value, '"', heredoc
    @token ')', ')' if interpolated
    tokens

  # Pairs up a closing token, ensuring that all listed pairs of tokens are
  # correctly balanced throughout the course of the token stream.
  pair: (tag) ->
    unless tag is wanted = last @ends
      @error "unmatched #{tag}" unless 'OUTDENT' is wanted
      # Auto-close INDENT to support syntax like this:
      #
      #     el.click((event) ->
      #       el.hide())
      #
      @indent -= size = last @indents
      @outdentToken size, true
      return @pair tag
    
    # FIXME move into endSelector
    @token('SELECTOR_END','%') if tag == '%'

    #remove possible options for context. hack
    # console.log "pairing tag",tag,@ends.length - 1,@ends["_" + (@ends.length - 1)]
    @ends["_" + (@ends.length - 1)] = undefined
    @ends.pop()

  # Helpers
  # -------

  # Add a token to the results, taking note of the line number.
  token: (tag, value, len, addLoc) ->
    # console.log(@line)
    loc = {first_line: @line, first_column: 2, last_line: @line, last_column: 2, range: [@loc,1000]}

    # if len and addLoc
    #   # console.log('addLoc',value)
    #   if typeof value == 'string'
    #     value = value + "$#{@loc}$$#{len}"
    #   else
    #     value._region = [@loc, @loc + len]

    if len and addLoc
      # console.log('no loc')
      true

    else if len
      # value = value + "_" + len
      # POC - not optimized at all
      # Might be better to just use jison for this
      if typeof value == 'string'
        value = new String(value)
      value._region = [@loc, @loc + len]

    if tag == 'INDENT' || tag == 'OUTDENT'
      # console.log(value)
      value = new Number(value)
      value._region = [@loc,@loc]
    # loc = {range: [10,1000]}
    @tokens.push [tag, value, loc]

  # Peek at a tag in the current token stream.
  tag: (index, tag) ->
    (tok = last @tokens, index) and if tag then tok[0] = tag else tok[0]

  # Peek at a value in the current token stream.
  value: (index, val) ->
    (tok = last @tokens, index) and if val then tok[1] = val else tok[1]

  # Are we in the midst of an unfinished expression?
  unfinished: ->
    # only if indented -- possibly not even
    # console.log("is unfinished?!?",@tag());

    return true if LINE_CONTINUER.test(@chunk);

    # no, no, no -- should never be possible to continue a statement without an indent
    # return false
    # this is _really_ messy.. it should possibly work if there is indentation after the initial
    # part of this, but not for the regular cases. Still, removing it breaks too much stuff.
    # Fix when we replace the lexer and rewriter

    @tag() in ['\\','.', '?.', 'UNARY', 'MATH', '+', '-', 'SHIFT', 'RELATION'
               'COMPARE', 'LOGIC', 'COMPOUND_ASSIGN', 'THROW', 'EXTENDS', 'CONDITIONAL_ASSIGN']
    

  # Converts newlines for string literals.
  escapeLines: (str, heredoc) ->
    str.replace MULTILINER, if heredoc then '\\n' else ''

  # Constructs a string token by escaping quotes and newlines.
  makeString: (body, quote, heredoc) ->
    return quote + quote unless body
    body = body.replace /\\([\s\S])/g, (match, contents) ->
      if contents in ['\n', quote] then contents else match
    body = body.replace /// #{quote} ///g, '\\$&'
    quote + @escapeLines(body, heredoc) + quote
    
  # Throws a syntax error on the current `@line`.
  error: (message, len) ->
    msg = "#{message} on line #{@line}"

    if len
      msg += " [#{@loc}:#{@loc + len}]"

    err = new SyntaxError msg
    err.line = @line
    throw err
    # throw new LexerError(msg,null,@line)
    # throw SyntaxError "#{message} on line #{@line + 1}"

# Constants
# ---------

# Keywords that Imba shares in common with JavaScript.
JS_KEYWORDS = [
  'true', 'false', 'null', 'this',# 'self'
  'new', 'delete', 'typeof', 'in', 'instanceof'
  'throw', 'break', 'continue', 'debugger'
  'if', 'else', 'switch', 'for', 'while', 'do', 'try', 'catch', 'finally'
  'class', 'extends', 'super', 'module', 'return'
]

# We want to treat return like any regular call for now
# Must be careful to throw the exceptions in AST, since the parser
# wont


# Imba-only keywords. var should move to JS_Keywords
# some words (like tag) should be context-specific
IMBA_KEYWORDS = [
  'undefined', 'then', 'unless', 'until', 'loop', 'of', 'by',
  'when','def','tag','do','elif','begin','prop','var','let','self','await'
]

IMBA_CONTEXTUAL_KEYWORDS = ['extend','static','local','export','global']

IMBA_ALIAS_MAP =
  and  : '&&'
  or   : '||'
  is   : '=='
  isnt : '!='
  not  : '!'
  yes  : 'true'
  no   : 'false'
  isa  : 'instanceof'
  case : 'switch'
  nil  : 'null'

IMBA_ALIASES  = (key for key of IMBA_ALIAS_MAP)
IMBA_KEYWORDS = IMBA_KEYWORDS.concat(IMBA_ALIASES) # .concat(IMBA_CONTEXTUAL_KEYWORDS)


# The list of keywords that are reserved by JavaScript, but not used, or are
# used by Imba internally. We throw an error when these are encountered,
# to avoid having a JavaScript error at runtime.  # 'var', 'let', - not inside here
RESERVED = [
  'case', 'default', 'function', 'void', 'with'
  'const', 'enum', 'native'
]
STRICT_RESERVED = ['case','function','void','const']


# 'export', 'import', 
# '__hasProp', '__extends', '__slice', '__bind', '__indexOf','__scope'
# RESERVED = [
#   'case', 'default', 'function', 'var', 'void', 'with', 'const', 'let', 'enum'
#   'export', 'import', 'native', '__hasProp', '__extends', '__slice', '__bind'
#   '__indexOf', 'implements', 'interface', 'package', 'private', 'protected'
#   'public', 'static', 'yield'
# ]

# The superset of both JavaScript keywords and reserved words, none of which may
# be used as identifiers or properties.
JS_FORBIDDEN = JS_KEYWORDS.concat RESERVED

exports.RESERVED = RESERVED.concat(JS_KEYWORDS).concat(IMBA_KEYWORDS)

KEY = /// ^
  ((([A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*)|\[\])=?)\:\s
///

KEY_IDENTIFIER = /// ^
  ( 
    (([\$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*)([\=\?\!]?)) | 
    (<=>|~=|~|\|(?!\|))  
  )
/// # |&(?!&)

METHOD_IDENTIFIER = /// ^
  ( 
    (([\x23]?[\$A-Za-z_\x7f-\uffff][$\-\w\x7f-\uffff]*)([\=\?\!]?)) | 
    (<=>|\|(?![\|=]))
  )
///
# removed ~=|~| |&(?![&=])

# Token matching regexes.
# added hyphens to identifiers now - to test
IDENTIFIER = /// ^
  (
    (\$|@@|@|\#)[A-Za-z_\-\x7f-\uffff][$\w\x7f-\uffff]* (\-[$\w\x7f-\uffff]+)* |
    [$A-Za-z_][$\w\x7f-\uffff]* (\-[$\w\x7f-\uffff]+)*
  )
  ( [^\n\S]* : (?![\*\=:$\w\x7f-\uffff]) )?  # Is this a property name?
///

OBJECT_KEY = /// ^
  ( (\$|@@|@|)[$A-Za-z_\x7f-\uffff\-][$\w\x7f-\uffff\-]*)
  ( [^\n\S\s]* : (?![\*\=:$\w\x7f-\uffff]) )  # Is this a property name?
///

OBJECT_KEY_ESCAPE = ///
  [\-\@\$]
///



PROPERTY = /// ^
  ((set|get|on)\s+)?
  ( [$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff\:]* )
  ( [^\n\S]* :\s)  # Is this a property name?
///


TAG = /// ^
  (\<|%)(?=[A-Za-z\#\.\{\@])
///

TAG_TYPE = /^(\w[\w\d]*:)?(\w[\w\d]*)(-[\w\d]+)*/
TAG_ID = /^#((\w[\w\d]*)(-[\w\d]+)*)/

TAG_ATTR = /^([\.]?[\w\_]+([\-\:][\w]+)*)(\s)*\=/


SELECTOR = /^([%\$]{1,2})([\(\w\#\.\[])/
SELECTOR_PART = /^(\#|\.|:|::)?([\w]+(\-[\w]+)*)/
SELECTOR_COMBINATOR = /^ (\+|\>|\~)*\s*(?=[\w\.\#\:\{\*\[])/

SELECTOR_PSEUDO_CLASS = /^(::?)([\w]+(\-[\w]+)*)/
SELECTOR_ATTR_OP = /^(\$=|\~=|\^=|\*=|\|=|=|\!=)/
SELECTOR_ATTR = /^\[([\w\_\-]+)(\$=|\~=|\^=|\*=|\|=|=|\!=)/

SYMBOL = ///^
  \:(
    (
      ([\*\@$\w\x7f-\uffff]+)+([\-\/\\\:][\w\x7f-\uffff]+)*
      [!\?\=]?
    )|==|\<=\>|\[\]|\[\]\=|\*|[\/,\\]
  )
///


NUMBER     = ///
  ^ 0x[\da-f]+ |                              # hex
  ^ 0b[01]+ |                              # binary
  ^ \d*\.?\d+ (?:e[+-]?\d+)?  # decimal
///i

HEREDOC    = /// ^ ("""|''') ([\s\S]*?) (?:\n[^\n\S]*)? \1 ///

OPERATOR   = /// ^ (
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

WHITESPACE = /^[^\n\S]+/

COMMENT    = /^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)|^(?:\s*(#\s.*|#\s*$))+/

CODE       = /^[-=]=>/

MULTI_DENT = /^(?:\n[^\n\S]*)+/

SIMPLESTR  = /^'[^\\']*(?:\\.[^\\']*)*'/


JSTOKEN    = /^`[^\\`]*(?:\\.[^\\`]*)*`/

# Regex-matching-regexes.
REGEX = /// ^
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

HEREGEX      = /// ^ /{3} ([\s\S]+?) /{3} ([imgy]{0,4}) (?!\w) ///

HEREGEX_OMIT = /\s+(?:#.*)?/g

# Token cleaning regexes.
MULTILINER      = /\n/g

HEREDOC_INDENT  = /\n+([^\n\S]*)/g

HEREDOC_ILLEGAL = /\*\//

LINE_CONTINUER  = /// ^ \s* (?: , | \??\.(?![.\d]) | :: ) ///

TRAILING_SPACES = /\s+$/


CONDITIONAL_ASSIGN = [
#  '||=', '&&=', '?=', '&=', '|=', '!?='
]

# Compound assignment tokens.
COMPOUND_ASSIGN = [
  '-=', '+=', '/=', '*=', '%=', '||=', '&&=', '?=', '<<=', '>>=', '>>>=', '&=', '^=', '|=','=<'
]

# Unary tokens.
UNARY = ['!', '~', 'NEW', 'TYPEOF', 'DELETE']

# Logical tokens.
LOGIC   = ['&&', '||', '&', '|', '^']

# Bit-shifting tokens.
SHIFT   = ['<<', '>>', '>>>']

# Comparison tokens.
COMPARE = ['===', '!==', '==', '!=', '<', '>', '<=', '>=','===','!==']

# Overideable methods
OP_METHODS = ['<=>','<<','..'] # hmmm

# Mathematical tokens.
MATH    = ['*', '/', '%', '∪', '∩','√']

# Relational tokens that are negatable with `not` prefix.
RELATION = ['IN', 'OF', 'INSTANCEOF','ISA']

# Boolean tokens.
BOOL = ['TRUE', 'FALSE', 'NULL', 'UNDEFINED']

# Tokens which a regular expression will never immediately follow, but which
# a division operator might.
#
# See: http://www.mozilla.org/js/language/js20-2002-04/rationale/syntax.html#regular-expressions
#
# Our list is shorter, due to sans-parentheses method calls.
NOT_REGEX = ['NUMBER', 'REGEX', 'BOOL', '++', '--', ']']

# If the previous token is not spaced, there are more preceding tokens that
# force a division parse:
NOT_SPACED_REGEX = NOT_REGEX.concat ')', '}', 'THIS', 'SELF' , 'IDENTIFIER', 'STRING'

# Tokens which could legitimately be invoked or indexed. An opening
# parentheses or bracket following these tokens will be recorded as the start
# of a function invocation or indexing operation.
# really?!

# } should not be callable anymore!!! '}', '::',
CALLABLE  = ['IDENTIFIER', 'STRING', 'REGEX', ')', ']', 'THIS', 'SUPER', 'TAG_END', 'IVAR', 'GVAR','SELF','CONST','NEW','ARGVAR','SYMBOL','RETURN']
INDEXABLE = CALLABLE.concat 'NUMBER', 'BOOL', 'TAG_SELECTOR', 'IDREF', 'ARGUMENTS','}'

GLOBAL_IDENTIFIERS = ['global','exports','require']

# STARTS = [']',')','}','TAG_ATTRS_END']
# ENDS = [']',')','}','TAG_ATTRS_END']

# Tokens that, when immediately preceding a `WHEN`, indicate that the `WHEN`
# occurs at the start of a line. We disambiguate these from trailing whens to
# avoid an ambiguity in the grammar.
LINE_BREAK = ['INDENT', 'OUTDENT', 'TERMINATOR']
