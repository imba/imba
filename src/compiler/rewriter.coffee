# The Imba language has a good deal of optional syntax, implicit syntax,
# and shorthand syntax. This can greatly complicate a grammar and bloat
# the resulting parse table. Instead of making the parser handle it all, we take
# a series of passes over the token stream, using this **Rewriter** to convert
# shorthand into the unambiguous long form, add implicit indentation and
# parentheses, and generally clean things up.

# The **Rewriter** class is used by the [Lexer](lexer.html), directly against
# its internal array of tokens.
class exports.Rewriter

  # Helpful snippet for debugging:
  #     console.log (t[0] + '/' + t[1] for t in @tokens).join ' '

  # Rewrite the token stream in multiple passes, one logical filter at
  # a time. This could certainly be changed into a single pass through the
  # stream, with a big ol' efficient switch, but it's much nicer to work with
  # like this. The order of these passes matters -- indentation must be
  # corrected before implicit parentheses can be wrapped around blocks of code.
  rewrite: (@tokens) ->
    @removeLeadingNewlines()
    @removeMidExpressionNewlines()
    @tagDefArguments()
    @closeOpenCalls()
    @closeOpenIndexes()
    @closeOpenTags()
    @closeOpenRawIndexes()
    @closeOpenTagAttrLists()
    @addImplicitIndentation()
    @tagPostfixConditionals()
    # @addImplicitBlockCalls()
    @addImplicitBraces()
    @addImplicitParentheses()
    # @addImplicitCommas()
    
    @tokens

  # Rewrite the token stream, looking one token ahead and behind.
  # Allow the return value of the block to tell us how many tokens to move
  # forwards (or backwards) in the stream, to make sure we don't miss anything
  # as tokens are inserted and removed, and the stream changes length under
  # our feet.
  scanTokens: (block) ->
    {tokens} = this
    i = 0
    i += block.call this, token, i, tokens while token = tokens[i]
    true

  detectEnd: (i, condition, action) ->
    {tokens} = this
    levels = 0
    starts = []
    while token = tokens[i]
      return action.call this, token, i     if levels is 0 and condition.call(this,token,i,starts)
      return action.call this, token, i - 1 if not token or levels < 0
      if token[0] in EXPRESSION_START
        starts.push(i) if levels == 0
        levels += 1
      else if token[0] in EXPRESSION_END
        levels -= 1
      i += 1
    i - 1

  # Leading newlines would introduce an ambiguity in the grammar, so we
  # dispatch them here.
  removeLeadingNewlines: ->
    break for [tag], i in @tokens when tag isnt 'TERMINATOR'
    @tokens.splice 0, i if i

  # Some blocks occur in the middle of expressions -- when we're expecting
  # this, remove their trailing newlines.
  removeMidExpressionNewlines: ->
    @scanTokens (token, i, tokens) ->
      return 1 unless token[0] is 'TERMINATOR' and @tag(i + 1) in EXPRESSION_CLOSE
      tokens.splice i, 1
      0
  
  # 
  tagDefArguments: ->
    yes

  # The lexer has tagged the opening parenthesis of a method call. Match it with
  # its paired close. We have the mis-nested outdent case included here for
  # calls that close on the same line, just before their outdent.
  closeOpenCalls: ->
    condition = (token, i) ->
      token[0] in [')', 'CALL_END'] or
      token[0] is 'OUTDENT' and @tag(i - 1) is ')'
    action = (token, i) ->
      @tokens[if token[0] is 'OUTDENT' then i - 1 else i][0] = 'CALL_END'
    @scanTokens (token, i) ->
      @detectEnd i + 1, condition, action if token[0] is 'CALL_START'
      1

  # The lexer has tagged the opening parenthesis of an indexing operation call.
  # Match it with its paired close.
  closeOpenIndexes: ->
    condition = (token, i) -> token[0] in [']', 'INDEX_END']
    action    = (token, i) -> token[0] = 'INDEX_END'
    @scanTokens (token, i) ->
      @detectEnd i + 1, condition, action if token[0] is 'INDEX_START'
      1

  # The lexer has tagged the opening parenthesis of an indexing operation call.
  # Match it with its paired close.
  closeOpenRawIndexes: ->
    condition = (token, i) -> token[0] in ['}', 'RAW_INDEX_END']
    action    = (token, i) -> token[0] = 'RAW_INDEX_END'
    @scanTokens (token, i) ->
      @detectEnd i + 1, condition, action if token[0] is 'RAW_INDEX_START'
      1
  
  closeOpenTagAttrLists: ->
    condition = (token, i) -> token[0] in [')', 'TAG_ATTRS_END']
    action    = (token, i) -> token[0] = 'TAG_ATTRS_END'
    @scanTokens (token, i) ->
      @detectEnd i + 1, condition, action if token[0] is 'TAG_ATTRS_START'
      1
  
  # The lexer has tagged the opening parenthesis of an indexing operation call.
  # Match it with its paired close.
  closeOpenTags: ->
    condition = (token, i) -> token[0] in ['>', 'TAG_END']
    action    = (token, i) -> token[0] = 'TAG_END'
    @scanTokens (token, i) ->
      @detectEnd i + 1, condition, action if token[0] is 'TAG_START'
      1
    
  addImplicitCommas: ->
    return

  addImplicitBlockCalls: ->
    @scanTokens (token, i, tokens) ->
      prev = tokens[i-1] or []
      # next = tokens[i+1]

      if token[0] == 'DO' and prev[0] in ['RAW_INDEX_END','INDEX_END','IDENTIFIER','NEW']
        # if token[0] == 'DO' and prev and prev[0] not in ['CALL_END','=','DEF_BODY','(','CALL_START',',',':','RETURN']
        # console.log 'added implicit blocs!!'
        tokens.splice i, 0, ['CALL_END',')']
        tokens.splice i, 0, ['CALL_START','(']
        return 2
      1

  # Object literals may be written with implicit braces, for simple cases.
  # Insert the missing braces here, so that the parser doesn't have to.
  addImplicitBraces: ->
    stack       = []
    start       = null
    startIndent = 0
    startIdx = null

    # condition = (token,i,starts) ->
    #   [one, two, three] = @tokens[i + 1 .. i + 3]
    #   return false if 'HERECOMMENT' is one?[0]
    #   [tag] = token
    # 
    #   (tag in ['TERMINATOR', 'OUTDENT'] and
    #     not (two?[0] is ':' or one?[0] is '@' and three?[0] is ':')) or
    #     # not (two?[0] is 'EVENT' or one?[0] is 'IDENTIFIER' and three?[0] is ':')) or
    #     (tag is ',' and one and
    #       one[0] not in ['IDENTIFIER', 'NUMBER', 'STRING', '@', 'TERMINATOR', 'OUTDENT'])

    action = (token, i) ->
      tok = ['}', '}', token[2]]
      tok.generated = yes
      @tokens.splice i, 0, tok

    open = (token,i) =>
      value = new String('{')
      value.generated = yes
      tok = ['{', value, token[2]]
      tok.generated = yes
      @tokens.splice i, 0, tok
      # s = ["{",i]
      # s.generated = true
      # stack.push(s)

    close = (token,i) =>
      tok = ['}', '}', token[2]]
      tok.generated = yes
      @tokens.splice i, 0, tok
      ctx = scope()
      # this is cleaner - but fix later
      # if ctx[0] == '{' and ctx.generated
      #   stack.pop()
      # else
      #   console.log('should not pop, not inside generated context!')
        
        # if ctx[0] == '{' and ctx.generated
        # should remove from scope as well?
        # true

    reopen = (token,i) =>
      true

    scope = ->
      stack[stack.length-1] or []

    @scanTokens (token, i, tokens) ->
      tag = token[0]
      ctx = stack[stack.length - 1] or []

      if token[1] == '?'
        # console.log('TERNARY OPERATOR!')
        stack.push ['TERNARY',i]
        return 1
      
      if tag in EXPRESSION_START
        # console.log('expression start',tag)
        if tag == 'INDENT' and @tag(i - 1) == '{'
          stack.push ["{", i] # should not autogenerate another?
        else
          stack.push [tag, i]
        return 1

      if tag in EXPRESSION_END
        if ctx[0] == 'TERNARY'
          stack.pop()

        start = stack.pop()
        start[2] = i

        # console.log('the end-expression was',start[0])

        # if start[0] == 'INDENT'
        #   console.log('was indent?')

        if start[0] == '{' and start.generated # tag != '}' # and start.generated
          # console.log('inside curly-braces!')
          # console.log('the expression is',tag)
          close(token,i)
          # hmm - are we sure that we should only return one here?
          return 1

        return 1
      

      if ctx[0] == 'TERNARY' and tag in ['TERMINATOR','OUTDENT']
        # really?
        stack.pop()
        return 1


      if tag == ','
        # automatically add an ending here if inside generated scope?
        # it is important that this is generated(!)
        if scope()[0] == '{' and scope().generated
          action.call(this,token,i)
          stack.pop()
          # console.log('scope was curly braces')
          return 2
        else
          return 1
        true

      # found a tag
      if tag == ':' and ctx[0] not in ['{','TERNARY']
        # could just check if the end was right before this?
        if start and start[2] == i - 1
          # console.log('this expression was just ending before colon!')
          idx = start[1] - 1
        else
          idx = i - 2 # if start then start[1] - 1 else i - 2

        idx -= 2 while @tag(idx - 1) is 'HERECOMMENT'

        # idx -= 1 if @tag(idx - 1) is ','
        t0 = @tokens[idx - 1]
        # t1 = ago = @tokens[idx]
        # console.log(idx,t0,t1)
        # t = @tokens
        # console.log(t[i-4],t[i-3],t[i-2],t[i-1])

        if t0 and t0[0] == '}' and t0.generated
          # console.log('already inside the generated token!')
          # console.log(t0,t1,idx,i)
          # removing this
          @tokens.splice(idx-1,1)
          s = ['{']
          s.generated = yes
          stack.push s
          return 0

        # hacky edgecase for indents
        else if t0 and t0[0] == ',' and @tag(idx - 2) == '}'
          @tokens.splice(idx-2,1)
          s = ['{']
          s.generated = yes
          stack.push s
          return 0

        else
          s = ['{']
          s.generated = yes
          stack.push s
          open(token,idx+1)
          return 2

      # we probably need to run through autocall first?!

      if tag == 'DO' # and ctx.generated
        # console.log('got here',token,i)
        prev = tokens[i - 1][0]
        # console.log('do',prev,ctx,token)
        # there are guaranteed to be buggy edge cases here
        if prev in ['NUMBER','STRING','REGEX','SYMBOL',']','}',')']

          tok = [',', ',']
          tok.generated = yes
          @tokens.splice(i,0,tok)

          if ctx.generated
            close(token,i)
            stack.pop()
            return 2

          # tok = [',', ',']
          # tok.generated = yes
          # @tokens.splice(i,0,tok)
          # return 2

        # if prev in ['SYMBOL','NUMBER','STRING','}',']','REGEX']
        #   # console.log('adding comma?')
        #   tok = [',', ',']
        #   tok.generated = yes
        #   @tokens.splice(i,0,tok)

      if tag in ['TERMINATOR','OUTDENT','DEF_BODY'] and ctx.generated
        close(token,i)
        stack.pop()
        return 2

      return 1

      ago = @tag(i - 2)
      ago = @tag(startIdx) if typeof startIdx == 'number'

      if tag == ':' and scope()[0] != '{'
        idx = (start and start[1] or i) - 2
        prev = @tag(idx)
        console.log('prev is',prev)

        if prev in ['[','(',',']
          console.log('should add',idx)
          stack.push(['{',idx+1])
          value = new String('{')
          value.generated = yes
          tok = ['{', value, token[2]]
          tok.generated = yes
          tokens.splice idx + 1, 0, tok
          return 2

      return 1 unless tag is ':' and
        (ago is ':' or stack[stack.length - 1]?[0] isnt '{')

      # console.log 'add implicit',tag,ago,stack[stack.length - 1]
      stack.push ['{']

      idx = if ago is '@' then i - 2 else i - 1
      idx -= 2 while @tag(idx - 2) is 'HERECOMMENT'
      idx = startIdx if typeof startIdx == 'number'

      # console.log("add implicit braces")
      # idx = startIdx unless startIdx == null

      prev = tokens[idx-2]
      if false and @tag(idx - 2) == '}' and prev.generated
        # console.log('should merge!!!')
        tokens.splice idx - 2, 1
        @detectEnd i + 1, condition, action
        return 2
        # tokens[idx-2] = ['O']
        # return 1
      else
        value = new String('{')
        value.generated = yes
        tok = ['{', value, token[2]]
        tok.generated = yes
        tokens.splice idx, 0, tok
        @detectEnd i + 2, condition, action
        return 2

  # Methods may be optionally called without parentheses, for simple cases.
  # Insert the implicit parentheses here, so that the parser doesn't have to
  # deal with them.
  # Practically everything will now be callable this way (every identifier)
  addImplicitParentheses: ->
    noCall = no
    noCallTag = ['CLASS', 'IF','UNLESS','TAG','WHILE','FOR','UNTIL','CATCH','FINALLY','MODULE']
    
    action = (token, i) -> @tokens.splice i, 0, ['CALL_END', ')', token[2]]

    @scanTokens (token, i, tokens) ->
      tag     = token[0]
      
      # Never make these tags implicitly call
      if tag in noCallTag
        noCall  = yes

      [prev, current, next] = tokens[i - 1 .. i + 1]

      # Will autocall if an indented object exists
      callObject  = not noCall and tag is 'INDENT' and
                    next and ((next.generated and next[0] is '{') or (next[0] is 'TAG_START')) and
                    prev and prev[0] in IMPLICIT_FUNC

      callObject  = not noCall and tag is 'INDENT' and
                    next and ((next.generated and next[0] is '{') or (next[0] in IMPLICIT_CALL)) and
                    prev and prev[0] in IMPLICIT_FUNC

      # new test
      callIndent = not noCall and tag is 'INDENT' and # not noCall and 
                    next and next[0] in IMPLICIT_CALL and
                    prev and prev[0] in IMPLICIT_FUNC
      # callIndent = no

      # if callIndent
      #   console.log('found method to open')
      # callAlways  = prev and prev[0] == 'IDENTIFIER' and
      #              tag in LINEBREAKS 
      
      seenSingle  = no
      seenControl = no
      # Hmm ?
      # this is not correct if this is inside a block,no?
      noCall      = no if tag in ['TERMINATOR','OUTDENT','INDENT']

     #  if tag == 'OUTDENT' # and next[0] != 'CALL_END'
     #    # maybe check if next is generated?
     #    # console.log('NONONON')
     #    noCall = no
      # if tag == 'INDENT'
      #   console.log('indented - not after autocall',prev,tag,next)
      #   noCall = no



      token.call  = yes if prev and not prev.spaced and tag is '?'

      return 1 if token.fromThen
      return 1 unless callObject or callIndent or
        prev?.spaced and (prev.call or prev[0] in IMPLICIT_FUNC) and
        (tag in IMPLICIT_CALL or not (token.spaced or token.newLine) and tag in IMPLICIT_UNSPACED_CALL)

      tokens.splice i, 0, ['CALL_START', '(', token[2]]

      # The action for detecting when the call should end
      @detectEnd i + 1, (token, i) ->
        [tag] = token
        return yes if not seenSingle and token.fromThen
        seenSingle  = yes if tag in ['IF', 'UNLESS', 'ELSE', 'CATCH', '->', '=>']
        seenControl = yes if tag in ['IF', 'UNLESS', 'ELSE', 'SWITCH', 'TRY']
        
        prev = @tag(i - 1)

        # if tag is 'OUTDENT'
        #   console.log(callIndent)
        #   console.log('found outdent!!!!')
        #   return yes

        return yes if tag in ['.', '?.','::'] and @tag(i - 1) is 'OUTDENT'
        # return yes if callIndent and tag is 'OUTDENT'

        not token.generated and @tag(i - 1) isnt ',' and 
        (tag in IMPLICIT_END or (tag is 'INDENT' and not seenControl) or (tag is 'DOS' and prev not in ['='])) and
        (tag isnt 'INDENT' or
         (@tag(i - 2) isnt 'CLASS' and @tag(i - 1) not in IMPLICIT_BLOCK and
          not ((post = @tokens[i + 1]) and ((post.generated and post[0] is '{') or post[0] in IMPLICIT_CALL)    )))
      , action
      prev[0] = 'FUNC_EXIST' if prev[0] is '?'
      2

  # Because our grammar is LALR(1), it can't handle some single-line
  # expressions that lack ending delimiters. The **Rewriter** adds the implicit
  # blocks, so it doesn't need to. ')' can close a single-line block,
  # but we need to make sure it's balanced.
  addImplicitIndentation: ->
    @scanTokens (token, i, tokens) ->
      [tag] = token
      if tag is 'TERMINATOR' and @tag(i + 1) is 'THEN'
        tokens.splice i, 1
        return 0
      if tag is 'ELSE' and @tag(i - 1) isnt 'OUTDENT'
        tokens.splice i, 0, @indentation(token)...
        return 2
      # if tag is 'CATCH' and @tag(i + 2) != 'INDENT'
      #   console.log('should add indentation in catch!!!!')
      #   tokens.splice i + 2, 0, @indentation(token)...
      #   return 4 # ?

      if tag is 'CATCH' and @tag(i + 2) in ['OUTDENT', 'TERMINATOR', 'FINALLY']
        tokens.splice i + 2, 0, @indentation(token)...
        return 4

      if tag in SINGLE_LINERS and @tag(i + 1) not in ['INDENT','BLOCK_PARAM_START'] and
         not (tag is 'ELSE' and @tag(i + 1) is 'IF') and not (tag is 'ELIF')
        starter = tag
        [indent, outdent] = @indentation token
        indent.fromThen   = true if starter is 'THEN'
        indent.generated  = outdent.generated = true
        tokens.splice i + 1, 0, indent
        condition = (token, i) ->
          token[1] isnt ';' and token[0] in SINGLE_CLOSERS and
          not (token[0] is 'ELSE' and starter not in ['IF', 'THEN'])
        action = (token, i) ->
          @tokens.splice (if @tag(i - 1) is ',' then i - 1 else i), 0, outdent
        @detectEnd i + 2, condition, action
        tokens.splice i, 1 if tag is 'THEN'
        return 1
      return 1

  # Tag postfix conditionals as such, so that we can parse them with a
  # different precedence.
  tagPostfixConditionals: ->
    condition = (token, i) -> token[0] in ['TERMINATOR', 'INDENT']
    @scanTokens (token, i) ->
      return 1 unless token[0] is 'IF'
      original = token
      @detectEnd i + 1, condition, (token, i) ->
        original[0] = 'POST_' + original[0] if token[0] isnt 'INDENT'
      1

  # Generate the indentation tokens, based on another token on the same line.
  indentation: (token) ->
    [['INDENT', 2, token[2]], ['OUTDENT', 2, token[2]]]

  # Look up a tag by token index.
  tag: (i) -> @tokens[i]?[0]

# Constants
# ---------

# List of the token pairs that must be balanced.
BALANCED_PAIRS = [
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
exports.INVERSES = INVERSES = {}

# The tokens that signal the start/end of a balanced pair.
EXPRESSION_START = []
EXPRESSION_END   = []

for [left, rite] in BALANCED_PAIRS
  EXPRESSION_START.push INVERSES[rite] = left
  EXPRESSION_END  .push INVERSES[left] = rite

IDENTIFIERS = ['IDENTIFIER', 'GVAR', 'IVAR', 'CVAR', 'CONST', 'ARGVAR']

# Tokens that indicate the close of a clause of an expression.
EXPRESSION_CLOSE = ['CATCH', 'WHEN', 'ELSE', 'FINALLY'].concat EXPRESSION_END

# Tokens that, if followed by an `IMPLICIT_CALL`, indicate a function invocation.
IMPLICIT_FUNC    = ['IDENTIFIER', 'SUPER', ')', ']', 'INDEX_END', #  'CALL_END',
  '@', 'THIS','SELF', 'EVENT','TRIGGER','RAW_INDEX_END','TAG_END', 'IVAR', 
  'GVAR', 'CONST', 'ARGVAR', 'NEW', 'BREAK', 'CONTINUE','RETURN'
]

# If preceded by an `IMPLICIT_FUNC`, indicates a function invocation.
IMPLICIT_CALL    = [
  'SELECTOR','IDENTIFIER', 'NUMBER', 'STRING', 'SYMBOL', 'JS', 'REGEX', 'NEW', 'PARAM_START', 'CLASS'
  'IF', 'UNLESS', 'TRY', 'SWITCH', 'THIS', 'BOOL', 'UNARY', 'SUPER', 'IVAR', 'GVAR', 'CONST', 'ARGVAR','SELF', 
  'NEW', '@', '[', '(', '{', '--', '++','SELECTOR', 'TAG_START', 'TAGID', '#', 'SELECTOR_START', 'IDREF', 'SPLAT', 'DO', 'BLOCK_ARG'
] # '->', '=>', why does it not work with symbol?
# is not do an implicit call??

IMPLICIT_UNSPACED_CALL = ['+', '-']

# Tokens indicating that the implicit call must enclose a block of expressions.
IMPLICIT_BLOCK   = ['{', '[', ',','BLOCK_PARAM_END', 'DO'] # '->', '=>', 

CONDITIONAL_ASSIGN = ['||=', '&&=', '?=', '&=', '|=']
COMPOUND_ASSIGN = ['-=', '+=', '/=', '*=', '%=', '||=', '&&=', '?=', '<<=', '>>=', '>>>=', '&=', '^=', '|=']
UNARY = ['!', '~', 'NEW', 'TYPEOF', 'DELETE']
LOGIC   = ['&&', '||', '&', '|', '^']

NO_IMPLICIT_BLOCK_CALL = ['CALL_END','=','DEF_BODY','(','CALL_START',',',':','RETURN'].concat(COMPOUND_ASSIGN)
# NO_IMPLICIT_BLOCK_CALL
# IMPLICIT_COMMA = ['->', '=>', '{', '[', 'NUMBER', 'STRING', 'SYMBOL', 'IDENTIFIER','DO']

IMPLICIT_COMMA = ['DO']

# Tokens that always mark the end of an implicit call for single-liners.
IMPLICIT_END     = ['POST_IF', 'POST_UNLESS', 'FOR', 'WHILE', 'UNTIL', 'WHEN', 'BY', 'LOOP', 'TERMINATOR','DEF_BODY','DEF_FRAGMENT']

# Single-line flavors of block expressions that have unclosed endings.
# The grammar can't disambiguate them, so we insert the implicit indentation.
SINGLE_LINERS    = ['ELSE', 'TRY', 'FINALLY', 'THEN','BLOCK_PARAM_END','DO','BEGIN','CATCH_VAR'] # '->', '=>', really?
SINGLE_CLOSERS   = ['TERMINATOR', 'CATCH', 'FINALLY', 'ELSE', 'OUTDENT', 'LEADING_WHEN']

# Tokens that end a line.
LINEBREAKS       = ['TERMINATOR', 'INDENT', 'OUTDENT']
