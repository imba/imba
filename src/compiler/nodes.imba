# imba$inlineHelpers=1
# TODO Create Expression - make all expressions inherit from these?

var helpers = require './helpers'
var constants = require './constants'
var NODE_MAJOR_VERSION = null

import ImbaParseError from './errors'
import Token from './token'
import SourceMap from './sourcemap'

if $node$
	let v = (process:version or 'v0').match(/^v?(\d+)/)
	NODE_MAJOR_VERSION = parseInt(v[1])
	if NODE_MAJOR_VERSION < 5
		console.log "Imba compiles to es5 due to old version of node({process:version})"

export var AST = {}

var TREE_TYPE =
	DYNAMIC: 1
	STATIC: 2
	SINGLE: 3
	OPTLOOP: 4
	LOOP: 5
	

# Helpers for operators
export var OP = do |op, l, r|
	var o = String(op)
	switch o
		when '.'
			r = Identifier.new(r) if r isa String
			# r = r.value if r isa VarOrAccess
			Access.new(op,l,r)
		when '='
			return TupleAssign.new(op,l,r) if l isa Tuple
			Assign.new(op,l,r)

		when '?=','||=','&&='
			ConditionalAssign.new(op,l,r)
		when '+=','-=','*=','/=','^=','%='
			CompoundAssign.new(op,l,r)

		when '?.'
			if r isa VarOrAccess
				r = r.value

			# depends on the right side - this is wrong
			PropertyAccess.new(op,l,r)

		when 'instanceof','isa'
			InstanceOf.new(op,l,r)
		when 'in'
			In.new(op,l,r)
		when 'typeof'
			TypeOf.new(op,l,r)
		when 'delete'
			Delete.new(op,l,r)
		when '--','++','!','√','not' # alias
			UnaryOp.new(op,l,r)
		when '>','<','>=','<=','==','===','!=','!=='
			ComparisonOp.new(op,l,r)
		when '∩','∪'
			MathOp.new(op,l,r)
		when '..','...'
			Range.new(op,l,r)
		else
			Op.new(op,l,r)

export var OP_COMPOUND = do |sym,op,l,r|
	# console.log "?. soak operator",sym
	if sym == '?.'
		console.log "?. soak operator"
		return null
	if sym == '?=' or sym == '||=' or sym == '&&='
		return ConditionalAssign.new(op,l,r)
	else
		return CompoundAssign.new(op,l,r)

var OPTS = {}
var ROOT = null

export var NODES = []

var LIT = do |val|
	Literal.new(val)

var SYM = do |val|
	Symbol.new(val)

var IF = do |cond,body,alt|
	var node = If.new(cond,body)
	node.addElse(alt) if alt
	node

var FN = do |pars,body|
	Func.new(pars,body)

var CALL = do |callee,pars = []|
	# possibly return instead(!)
	Call.new(callee,pars)

var CALLSELF = do |name,pars = []|
	var ref = Identifier.new(name)
	Call.new(OP('.',SELF,ref),pars)

var BLOCK = do
	Block.wrap([]:slice.call(arguments))

var WHILE = do |test,code|
	While.new(test).addBody(code)

export var SPLAT = do |value|
	if value isa Assign
		value.left = Splat.new(value.left)
		return value
	else
		Splat.new(value)

var SEMICOLON_TEST = /;(\s*\/\/.*)?[\n\s\t]*$/
var RESERVED_TEST = /^(default|char|for)$/

# captures error from parser
export def parseError str, o
	# find nearest token
	var err

	if o:lexer
		var token = o:lexer:yytext
		# console.log o:lexer:pos,token.@loc
		err = ImbaParseError.new({message: str},{
			pos: o:lexer:pos
			tokens: o:lexer:tokens
			token: o:lexer:yytext
			meta: o
		})

		throw err

		# should find the closest token with actual position
		# str = "[{token.@loc}:{token.@len || String(token):length}] {str}"
	var e = Error.new(str)
	e:lexer = o:lexer
	e:options = o
	throw e

def AST.c obj
	typeof obj == 'string' ? obj : obj.c

def AST.mark tok
	if tok and (OPTS:sourceMapInline or OPTS:sourceMap) and tok:sourceMapMarker
		tok.sourceMapMarker
	else
		''

def AST.blk obj
	obj isa Array ? Block.wrap(obj) : obj

def AST.sym obj
	# console.log "sym {obj}"
	helpers.symbolize(String(obj))

def AST.cary ary
	ary.map(|v| typeof v == 'string' ? v : v.c )

def AST.dump obj, key
	if obj isa Array
		obj.map do |v| v && v:dump ? v.dump(key) : v
	elif obj and obj:dump
		obj.dump

def AST.compact ary
	if ary isa ListNode
		return ary.compact


	ary.filter do |v| v != undefined && v != null

def AST.reduce res,ary
	for v in ary
		v isa Array ? AST.reduce(res,v) : res.push(v)
	return

def AST.flatten ary, compact = no
	var out = []
	for v in ary
		v isa Array ? AST.reduce(out,v) : out.push(v)
	return out

def AST.loc item
	if !item
		[0,0]
	elif item isa Token
		item.region
	elif item isa Node
		item.loc
	
def AST.parse str, opts = {}
	var indent = str.match(/\t+/)[0]
	# really? Require the compiler, not this
	Imbac.parse(str,opts)

def AST.inline str, opts = {}
	parse(str,opts).body

def AST.node typ, pars
	if typ == 'call'
		if pars[0].c == 'return'
			pars[0] = 'tata'
		Call.new(pars[0],pars[1],pars[2])

def AST.escapeComments str
	return '' unless str
	return str


var shortRefCache = []

def AST.counterToShortRef nr
	var base = "A".charCodeAt(0)

	while shortRefCache:length <= nr
		var num = shortRefCache:length + 1
		var str = ""

		while true
			num -= 1
			str = String.fromCharCode(base + (num % 26)) + str
			num = Math.floor(num / 26)
			break unless num > 0

		shortRefCache.push(str)
	return shortRefCache[nr]

def AST.truthy node

	if node isa True
		return true

	if node isa False
		return false

	if node:isTruthy
		return node.isTruthy

	return undefined

export class Indentation

	prop open
	prop close

	def initialize a,b
		@open = a
		@close = b
		self

	def isGenerated
		@open and @open:generated

	def aloc
		@open and @open.@loc or 0

	def bloc
		@close and @close.@loc or 0

	def wrap str
		var om = @open and @open.@meta
		var pre = om and om:pre or ''
		var post = om and om:post or ''
		var esc = AST:escapeComments
		var out = @close

		# the first newline should not be indented?
		str = post.replace(/^\n/,'') + str
		str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n")

		str = pre + '\n' + str
		str += out.c if out isa Terminator
		str = str + '\n' unless str[str:length - 1] == '\n'
		return str

var INDENT = Indentation.new({},{})

class Stash

	def initialize
		@entities = []

	def add item
		@entities.unshift(item)
		self

	def pluck item
		var match = null
		for entity,i in @entities
			if entity == item or entity isa item
				match = entity
				@entities.splice(i,1)
				return match
		return null


export class Stack

	prop loglevel
	prop nodes
	prop scopes

	def initialize
		reset

	def reset
		@nodes    = []
		@scoping  = []
		@scopes   = []
		@stash    = Stash.new(self)
		@loglevel = 3
		@counter  = 0
		@counters = {}
		@options = {}
		@es6 = null
		@es5 = null
		@optlevel = null

		if NODE_MAJOR_VERSION and NODE_MAJOR_VERSION < 5
			@es5 = true
		self

	def incr name
		@counters[name] ||= 0
		@counters[name] += 1

	def stash
		@stash

	def option key
		@options and @options[key]

	def platform
		@options:target

	def filename
		@options:filename

	def sourcePath
		@options:sourcePath

	def es6
		@es6 ?= !!(@options:es6 or @options:es2015 or env('IMBA_ES6'))

	def es5
		@es5 ?= !!(@options:es5 or env('IMBA_ES5'))
		
	def optlevel
		@optlevel ?= (@options:conservative or env('IMBA_CONSERVATIVE') ? 0 : (@options:optlevel or 9)) # stack.option(:conservative)

	def env key
		var val = @options["ENV_{key}"]
		return val if val != undefined
		
		var lowercased = key.toLowerCase
		
		if @options[lowercased] != undefined
			return @options[lowercased]

		# temporary shorthand
		if lowercased == 'es6'
			return self.es6

		if lowercased == 'es5'
			return self.es5

		if platform and key in ['WEB','NODE','WEBWORKER']
			return platform.toUpperCase == key

		# console.log 'lookup env var',key,@options:env

		if var e = @options:env
			if e.hasOwnProperty(key)
				return e[key]
			elif e.hasOwnProperty(key.toLowerCase)
				return e[key.toLowerCase]

		if $node$ and typeof process != 'undefined' and process:env
			val = process:env[key.toUpperCase]
			if val != undefined
				return val
			return null

		return undefined


	def addScope scope
		@scopes.push(scope)
		self

	def traverse node
		self

	def push node
		@nodes.push(node)
		# not sure if we have already defined a scope?
		self

	def pop node
		@nodes.pop # (node)
		self

	def parent
		@nodes[@nodes:length - 2]

	def current
		@nodes[@nodes:length - 1]

	def up test
		test ||= do |v| !(v isa VarOrAccess)

		if test:prototype isa Node
			var typ = test
			test = do |v| v isa typ

		var i = @nodes:length - 2 # key
		while i >= 0
			var node = @nodes[i]
			return node if test(node)
			i -= 1
		return null

	def relative node, offset = 0
		var idx = @nodes.indexOf(node)
		idx >= 0 ? @nodes[idx + offset] : null

	def scope lvl = 0
		var i = @nodes:length - 1 - lvl
		while i >= 0
			var node = @nodes[i]
			return node.@scope if node.@scope
			i -= 1
		return null

	def scopes
		# include deeper scopes as well?
		var scopes = []
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]
			scopes.push(node.@scope) if node.@scope
			i -= 1
		return scopes

	def method
		up(MethodDeclaration)

	def block
		up(Block)

	def isExpression
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]
			# why are we not using isExpression here as well?
			if node isa Code or node isa Loop
				return false
			if node.isExpression
				return true
			# probably not the right test - need to be more explicit
			i -= 1
		return false

	def toString
		"Stack({@nodes.join(" -> ")})"

	def isAnalyzing
		@analyzing

	def scoping
		@nodes.filter(|n| n.@scope ).map(|n| n.@scope )

# Lots of globals -- really need to deal with one stack per file / context
export var STACK = Stack.new

# use a bitmask for these

export class Node

	prop o
	prop options
	prop traversed

	def safechain
		no

	def p
		# allow controlling this from CLI
		if STACK.loglevel > 0
			console.log(*arguments)
		self

	def typeName
		self:constructor:name

	def namepath
		typeName

	def initialize
		setup
		self

	def setup
		@expression = no
		@traversed = no
		@parens = no
		@cache = null
		@value = null
		self

	def set obj
		@options ||= {}
		for own k,v of obj
			@options[k] = v
		self

	# get and set
	def option key, val
		if val != undefined
			@options ||= {}
			@options[key] = val
			return self

		@options && @options[key]

	def configure obj
		set(obj)

	def region
		[0,0]

	def loc
		[0,0]

	def token
		null

	def compile
		self

	def visit
		self

	def stack
		STACK

	def isString
		no

	def isPrimitive deep
		no

	def isReserved
		no

	# should rather do traversals
	# o = {}, up, key, index
	def traverse
		if @traversed
			return self
		# NODES.push(self)
		@traversed = yes
		STACK.push self
		visit(STACK)
		STACK.pop self
		return self

	def inspect
		{type: self:constructor.toString}

	def js o
		"NODE"

	def toString
		"{self:constructor:name}"

	# swallow might be better name
	def consume node
		if node isa PushAssign
			node.register(self)
			return PushAssign.new(node.op,node.left,self)

		if node isa Assign
			# node.right = self
			return OP(node.op,node.left,self)
		elif node isa Op
			return OP(node.op,node.left,self)
		elif node isa Return
			return Return.new(self)
		return self

	def toExpression
		@expression = true
		self

	def forceExpression
		@expression = true
		self

	def isExpressable
		true

	def isExpression
		@expression || false

	def hasSideEffects
		true

	def isUsed
		true

	def shouldParenthesize
		false

	def shouldParenthesizeInTernary
		yes

	def block
		Block.wrap([self])

	def node
		self

	def scope__
		STACK.scope

	def up
		STACK.parent

	def util
		Util

	def receiver
		self

	def addExpression expr
		# might be better to nest this up after parsing is done?
		var node = ExpressionBlock.new([self])
		return node.addExpression(expr)


	def indented a,b

		if a isa Indentation
			@indentation = a
			return self

		# this is a _BIG_ hack
		if b isa Array
			add(b[0])
			b = b[1]

		# if indent and indent.match(/\:/)
		@indentation ||= a and b ? Indentation.new(a,b) : INDENT
		self

	def prebreak term = '\n'
		self

	def invert
		return OP('!',self)

	def cache o = {}
		@cache = o
		o:var = (o:scope or scope__).temporary(self,o)
		o:lookups = 0
		self

	def cachevar
		@cache && @cache:var

	def decache
		if @cache
			cachevar.free
			@cache = null
		self

	# the "name-suggestion" for nodes if they need to be cached
	def alias
		null

	def warn text, opts = {}
		opts:message = text
		opts:loc ||= loc
		scope__.root.warn opts
		self

	def c o
		var s = STACK
		var ch = @cache
		return c_cached(ch) if ch and ch:cached

		s.push(self)
		forceExpression if o && o:expression

		if o and o:indent
			@indentation ||= INDENT

		var out = js(s,o)

		# really? why not call this somewhere else?
		var paren = shouldParenthesize

		if var indent = @indentation
			out = indent.wrap(out,o)

		# should move this somewhere else really
		out = "({out})" if paren
		if o and o:braces
			if indent
				out = '{' + out + '}'
			else
				out = '{ ' + out + ' }'

		s.pop(self)

		if ch = @cache
			out = "{ch:var.c} = {out}" unless ch:manual
			var par = s.current
			out = '(' + out + ')' if par isa Access || par isa Op # others? #
			ch:cached = yes
		return out

	def c_cached cache
		cache:lookups++
		cache:var.free if cache:uses == cache:lookups
		return cache:var.c # recompile every time??

export class ValueNode < Node

	prop value

	def initialize value
		setup
		@value = load(value)

	def load value
		value

	def js o
		typeof @value == 'string' ? @value : @value.c

	def visit

		@value.traverse if @value isa Node #  && @value:traverse
		self

	def region
		[@value.@loc,@value.@loc + @value.@len]


export class Statement < ValueNode

	def isExpressable
		return no


export class Meta < ValueNode

	def isPrimitive deep
		yes

export class Comment < Meta

	def visit
		if var block = up
			var idx = block.indexOf(self) + 1
			idx += 1 if block.index(idx) isa Terminator
			if var next = block.index(idx)
				next.@desc = self

		self

	def toDoc
		helpers.normalizeIndentation("" + @value.@value)

	def toJSON
		helpers.normalizeIndentation("" + @value.@value)

	def c o
		return "" if STACK.option(:comments) == false
		var v = @value.@value
		if o and o:expression or v.match(/\n/) or @value.type == 'HERECOMMENT' # multiline?
			"/*{v}*/"
		else
			"// {v}"

export class Terminator < Meta

	def initialize v
		@value = v
		self

	def traverse
		self

	def loc
		[@value.@loc,@value.@loc + @value.@value:length]

	def c
		let val = @value.c
		if STACK.option(:comments) == false
			val = val.replace(/\/\/.*$/gm,'')
		return val

export class Newline < Terminator

	def initialize v
		@traversed = no
		@value = v or '\n'

	def c
		AST.c(@value)


# weird place?
export class Index < ValueNode

	def cache o = {}
		@value.cache(o)

	def js o
		@value.c

export class ListNode < Node

	prop nodes

	def initialize list
		setup
		@nodes = load(list or [])
		@indentation = null

	# PERF acces @nodes directly?
	def list
		@nodes

	def compact
		@nodes = AST.compact(@nodes)
		self

	def load list
		list

	def concat other
		# need to store indented content as well?
		@nodes = nodes.concat(other isa Array ? other : other.nodes)
		self

	def swap item, other
		var idx = indexOf(item)
		nodes[idx] = other if idx >= 0
		self

	def push item
		@nodes.push(item)
		self

	def pop
		var end = @nodes.pop
		return end

	def add item
		@nodes.push(item)
		self

	def unshift item, br
		@nodes.unshift(BR) if br
		@nodes.unshift(item)
		self

	# test
	def slice a, b
		self:constructor.new(@nodes.slice(a,b))

	def break br, pre = no
		br = Terminator.new(br) if typeof br == 'string'
		pre ? unshift(br) : push(br)
		self

	def some cb
		for node in @nodes
			return yes if cb(node)
		return no

	def every cb
		for node in @nodes
			return no unless cb(node)
		return yes
	
	# filtered list of items
	def values
		@nodes.filter do |item| !(item isa Meta)

	def filter cb
		@nodes.filter(cb)

	def pluck cb
		var item = filter(cb)[0]
		remove(item) if item
		return item

	def indexOf item
		@nodes.indexOf(item)

	def index i
		@nodes[i]

	def remove item
		var idx = @nodes.indexOf(item)
		@nodes.splice(idx, 1) if idx >= 0
		self

	def removeAt idx
		var item = @nodes[idx]
		@nodes.splice(idx, 1) if idx >= 0
		return item


	def replace original, replacement
		var idx = @nodes.indexOf(original)
		if idx >= 0
			if replacement isa Array
				@nodes.splice(idx,1,*replacement)
			else
				@nodes[idx] = replacement
		self

	def first
		@nodes[0]

	def last
		var i = @nodes:length
		while i
			i = i - 1
			var v = @nodes[i]
			return v unless v isa Meta
		return null

	def map fn
		@nodes.map(fn)

	def forEach fn
		@nodes.forEach(fn)

	def remap fn
		@nodes = map(fn)
		self

	def count
		@nodes:length

	def realCount
		var k = 0
		for node in @nodes
			k++ if node and !(node isa Meta)
		return k

	def visit
		for node in @nodes
			node and node.traverse
		self

	def isExpressable
		for node in nodes
			return no if node and !node.isExpressable

		return yes

	def toArray
		@nodes

	def delimiter
		@delimiter or ","

	def js o, nodes: @nodes
		var delim = ','
		var express = delim != ';'
		var last = last

		var i = 0
		var l = nodes:length
		var str = ""

		for arg in nodes
			var part = typeof arg == 'string' ? arg : (arg ? arg.c(expression: express) : '')
			str += part
			str += delim if part and (!express or arg != last) and !(arg isa Meta)

		return str

	def indented a,b
		if a isa Indentation
			@indentation = a
			return self

		@indentation ||= a and b ? Indentation.new(a,b) : INDENT
		self


export class ArgList < ListNode

export class AssignList < ArgList

	def concat other
		if @nodes:length == 0 and other isa AssignList
			return other
		else
			super(other)
		# need to store indented content as well?
		# @nodes = nodes.concat(other isa Array ? other : other.nodes)
		self


export class Block < ListNode

	prop head

	def initialize list
		setup
		@nodes = list or []
		@head = null
		@indentation = null

	def self.wrap ary
		unless ary isa Array
			throw SyntaxError.new("what")
		ary:length == 1 && ary[0] isa Block ? ary[0] : Block.new(ary)

	def visit stack
		@scope.visit if @scope

		for node,i in @nodes
			node and node.traverse

		if stack and stack.@tag and !stack.@tag.@tagLoop
			@tag = stack.@tag
			let real = expressions
			# we need to compare the real length
			if real:length > 1
				let nr = @tag.childCacher.nextBlock #  @tag.blocks.push(self)
				var arr = Arr.new(ArgList.new( @nodes ))
				arr.indented(@indentation)
				var isStatic = real.every do |item| item isa Tag
				var typ = isStatic ? 2 : 1
				set(treeType: typ)
				@indentation = null
				if true
					@nodes = [Util.callImba(scope__, "static",[arr,Num.new(typ),nr])]
				else
					@nodes = [arr]
		self

	def block
		self
		
	def collectDecorators
		if let decorators = @decorators
			@decorators = null
			return decorators

	def loc
		# rather indents, no?
		if var opt = option(:ends)
			var a = opt[0].loc
			var b = opt[1].loc

			p "no loc for {opt[0]}" unless a
			p "no loc for {opt[1]}" unless b

			[a[0],b[1]]
		elif var ind = @indentation
			[ind.aloc,ind.bloc]
		else
			# first node
			let a = @nodes[0]
			let b = @nodes[@nodes:length - 1]
			[a and a.loc[0] or 0,b and b.loc[1] or 0]

	# go through children and unwrap inner nodes
	def unwrap
		var ary = []
		for node,i in nodes
			if node isa Block
				ary:push.apply(ary,node.unwrap)
			else
				ary.push(node)
		return ary

	def push item
		@nodes.push(item)
		self

	def add item
		@nodes.push(item)
		self

	# This is just to work as an inplace replacement of nodes.coffee
	# After things are working okay we'll do bigger refactorings
	def compile o = {}
		var root = Root.new(self,o)
		root.compile(o)


	# Not sure if we should create a separate block?
	def analyze o = {}
		self

	def cpart node
		var out = typeof node == 'string' ? node : (node ? node.c : "")
		return "" if out == null or out == undefined or out == ""

		if out isa Array
			var str = ""
			var l = out:length
			var i = 0
			while i < l
				str += cpart(out[i++])
			return str

		var hasSemiColon = SEMICOLON_TEST.test(out)
		out += ";" unless hasSemiColon or node isa Meta
		return out

	def js o, opts
		var ast = @nodes
		var l = ast:length
		# really?
		var express = isExpression or o.isExpression or (option(:express) and isExpressable)
		return '' if ast:length == 0

		if express
			return super(o,nodes: ast)

		var str = ""

		for v in ast
			str += cpart(v)

		# now add the head items as well
		if @head and @head:length > 0
			var prefix = ""
			for v in @head
				var hv = cpart(v)
				prefix += hv + '\n' if hv
			str = prefix + str
			
		if option(:strict)
			str = cpart('"use strict";\n') + str

		return str


	# Should this create the function as well?
	def defers original, replacement
		var idx = @nodes.indexOf(original)
		@nodes[idx] = replacement if idx >= 0
		var rest = @nodes.splice(idx + 1)
		return rest

	def expressions
		var expressions = []
		for node in nodes
			expressions.push(node) unless node isa Terminator
		return expressions


	def consume node
		if node isa TagPushAssign
			let real = expressions

			@nodes = @nodes.map do |child|
				if child in real and !(child isa Assign)
					child.consume(node)
				else
					child

			return self

		# can also return super if it is expressable, but should we really?
		if var before = last
			var after = before.consume(node)
			if after != before
				if after isa Block
					after = after.nodes

				replace(before,after)

		return self


	def isExpressable
		return no unless @nodes.every(|v| v.isExpressable )
		return yes

	def isExpression

		option(:express) || @expression

	def shouldParenthesizeInTernary
		if count == 1
			return first.shouldParenthesizeInTernary

		yes


# this is almost like the old VarDeclarations but without the values
export class VarBlock < ListNode


	def load list
		var first = list[0]

		if first isa Assign
			@type = first.left.@type
		elif first isa VarReference
			@type = first.@type
		# @type = list[0] and list[0].type
		list

	# TODO All these inner items should rather be straight up literals
	# or basic localvars - without any care whatsoever about adding var to the
	# beginning etc.
	def addExpression expr

		if expr isa Assign
			# make sure the left-side is a var-reference
			# this should be a different type of assign, no?
			if expr.left isa VarOrAccess
				expr.left = VarReference.new(expr.left.value,@type)

			push(expr)

		elif expr isa Assign
			addExpression(expr.left) # make sure this is a valid thing?
			# make this into a tuple instead
			# does not need to be a tuple?
			return TupleAssign.new('=',Tuple.new(nodes),expr.right)

		elif expr isa VarOrAccess
			# this is really a VarReference
			push(VarReference.new(expr.value,@type))

		elif expr isa Splat && expr.node isa VarOrAccess
			expr.value = VarReference.new(expr.node.value,@type)
			push(expr)
		else
			p "VarBlock.addExpression {self} <- {expr}"
			throw "VarBlock does not allow non-variable expressions"
		self


	def isExpressable
		# we would need to force-drop the variables, makes little sense
		# but, it could be, could just push the variables out?
		no

	def js o
		var code = AST.compact(AST.flatten(AST.cary(nodes)))
		code = code.filter(|n| n != null && n != undefined && n != EMPTY)
		var out = code.join(",")

		# are we sure?
		var keyword = o.es5 ? 'var' : (@type or 'var')
		# we just need to trust that the variables have been autodeclared beforehand
		# if we are inside an expression
		out = "{keyword} " + out unless o.isExpression
		return out


	def consume node
		# It doesnt make much sense for a VarBlock to consume anything
		# it should probably return void for methods
		return self


# Could inherit from valueNode
export class Parens < ValueNode

	def initialize value, open, close
		setup
		@open = open
		@close = close
		@value = load(value)

	def load value
		@noparen = no
		value isa Block and value.count == 1 ? value.first : value

	def isString
		# checking if this is an interpolated string
		@open and String(@open) == '("' or value.isString

	def js o

		var par = up
		var v = @value
		var str = null

		@noparen = yes if v isa Func

		if par isa Block
			# is it worth it?
			@noparen = yes unless o.isExpression
			str = v isa Array ? AST.cary(v) : v.c(expression: o.isExpression)
		else
			str = v isa Array ? AST.cary(v) : v.c(expression: yes)

		# check if we really need parens here?
		return str

	def set obj
		console.log "Parens set {JSON.stringify(obj)}"
		super(obj)


	def shouldParenthesize
		# no need to parenthesize if this is a line in a block
		return no if @noparen #  or par isa ArgList
		return yes


	def prebreak br
		super(br)
		console.log "PREBREAK"
		@value.prebreak(br) if @value
		self


	def isExpressable
		@value.isExpressable

	def consume node
		@value.consume(node)


# Could inherit from valueNode
# an explicit expression-block (with parens) is somewhat different
# can be used to return after an expression
export class ExpressionBlock < ListNode


	def c o
		map(|item| item.c(o) ).join(",")

	def consume node
		value.consume(node)

	def addExpression expr
		# Need to take care of the splat here to.. hazzle
		if expr.node isa Assign
			push(expr.left)
			# make this into a tuple instead
			# possibly fix this as well?!?
			return TupleAssign.new('=',Tuple.new(nodes),expr.right)
		else
			push(expr)
		self



# STATEMENTS

export class Return < Statement

	prop value

	def initialize v
		@traversed = no
		@value = v isa ArgList and v.count == 1 ? v.last : v
		return self

	def visit
		@value.traverse if @value && @value:traverse

	def js o
		var v = @value

		if v isa ArgList
			return "return [{v.c(expression: yes)}]"
		elif v
			return "return {v.c(expression: yes)}"
		else
			"return"

	def c
		return super if !value or value.isExpressable
		value.consume(self).c

	def consume node
		return self

export class ImplicitReturn < Return

export class GreedyReturn < ImplicitReturn

# cannot live inside an expression(!)
export class Throw < Statement

	def js o
		"throw {value.c}"

	def consume node
		# ROADMAP should possibly consume to the value of throw and then throw?
		return self


export class LoopFlowStatement < Statement

	prop literal
	prop expression

	def initialize lit, expr
		self.literal = lit
		self.expression = expr

	def visit
		expression.traverse if expression

	def consume node
		self

	def c
		return super unless expression
		# get up to the outer loop
		var _loop = STACK.up(Loop)

		# need to fix the grammar for this. Right now it
		# is like a fake call, but should only care about the first argument
		var expr = self.expression

		if _loop.catcher
			expr = expr.consume(_loop.catcher)
			var copy = self:constructor.new(literal)
			Block.new([expr,copy]).c
		elif expr
			var copy = self:constructor.new(literal)
			Block.new([expr,copy]).c
		else
			super
		# return "loopflow"


export class BreakStatement < LoopFlowStatement
	def js o do "break"

export class ContinueStatement < LoopFlowStatement
	def js o do "continue"

export class DebuggerStatement < Statement


# PARAMS

export class Param < Node

	prop name
	prop index
	prop defaults
	prop splat
	prop variable

	def initialize name, defaults, typ
		# could have introduced bugs by moving back to identifier here
		@traversed = no
		@name = name
		@defaults = defaults
		@typ = typ
		@variable = null

	def varname
		@variable ? @variable.c : name

	def js o
		return @variable.c if @variable

		if defaults
			# should not include any source-mapping here?
			"if({name.c} == null) {name.c} = {defaults.c}"
		# see if this is the initial declarator?

	def visit
		@defaults.traverse if @defaults
		self.variable ||= scope__.register(name,self)

		if @name isa Identifier
			# change type here?
			@name.@value.@type = "PARAMVAR" if @name.@value
			@name.references(@variable)
			@variable.addReference(@name)

		self

	def assignment
		OP('=',variable.accessor,defaults)

	def isExpressable
		!defaults || defaults.isExpressable

	def dump
		{loc: loc}

	def loc
		@name && @name.region

	def toJSON
		{
			type: typeName
			name: name
			defaults: defaults
		}


export class SplatParam < Param

	def loc
		# hacky.. cannot know for sure that this is right?
		var r = name.region
		[r[0] - 1,r[1]]

export class BlockParam < Param

	def c
		"blockparam"

	def loc
		# hacky.. cannot know for sure that this is right?
		var r = name.region
		[r[0] - 1,r[1]]


export class OptionalParam < Param

export class NamedParam < Param

export class RequiredParam < Param

export class NamedParams < ListNode

	prop index
	prop variable

	def load list
		var load = (|k| NamedParam.new(k.key,k.value) )
		list isa Obj ? list.value.map(load) : list

	def visit
		var s = scope__
		@variable ||= s.temporary(self, pool: 'keypars')
		@variable.predeclared

		# this is a listnode, which will automatically traverse
		# and visit all children
		super
		# register the inner variables as well(!)
		self


	def varname
		variable.c

	def name
		varname

	def js o
		"namedpar"

	def toJSON
		{
			type: typeName
			nodes: filter(|v| v isa NamedParam)
		}


export class IndexedParam < Param

	prop parent
	prop subindex

	def visit
		# BUG The defaults should probably be looked up like vars
		self.variable ||= scope__.register(name,self)
		self.variable.proxy(parent.variable,subindex)
		self


export class ArrayParams < ListNode

	prop index
	prop variable

	def visit
		var s = scope__
		@variable ||= s.temporary(self, pool: 'keypars')
		@variable.predeclared

		# now when we loop through these inner params - we create the pars
		# with the correct name, but bind them to the parent
		super

	def name
		variable.c

	def load list
		return null unless list isa Arr
		# try the basic first
		unless list.splat
			list.value.map do |v,i|
				# must make sure the params are supported here
				# should really not parse any array at all(!)
				var name = v
				if v isa VarOrAccess
					# FIX?
					name = v.value.value
					# this is accepted
				parse(name,v,i)

	def parse name,child,i
		var param = IndexedParam.new(name,null)

		param.parent = self
		param.subindex = i
		param

	def head ast
		self

export class ParamList < ListNode

	prop splat
	prop block

	def at index, force = no, name = null
		if force
			add(Param.new(count == index && name || "_{count}")) until count > index
			# need to visit at the same time, no?
		list[index]

	def metadata
		filter(|par| !(par isa Meta))

	def toJSON
		metadata

	def visit
		@splat = filter(|par| par isa SplatParam)[0]
		var blk = filter(|par| par isa BlockParam)

		if blk:length > 1
			blk[1].warn "a method can only have one &block parameter"

		elif blk[0] && blk[0] != last
			blk[0].warn "&block must be the last parameter of a method"
			# warn "&block must be the last parameter of a method", blk[0]

		# add more warnings later(!)
		# should probably throw error as well to stop compilation

		# need to register the required-pars as variables
		super

	def js o
		return EMPTY if count == 0
		return head(o) if o.parent isa Block

		# items = map(|arg| arg.name.c ).compact
		# return null unless items[0]

		if o.parent isa Code
			# remove the splat, for sure.. need to handle the other items as well
			# this is messy with references to argvars etc etc. Fix
			var pars = nodes
			# pars = filter(|arg| arg != @splat && !(arg isa BlockParam)) if @splat
			pars = filter(|arg| arg isa RequiredParam or arg isa OptionalParam) if @splat
			AST.compact(pars.map(|arg| AST.c(arg.varname) )).join(",")
		else
			throw "not implemented paramlist js"
			"ta" + AST.compact(map(|arg| arg.c )).join(",")

	def head o
		var reg = []
		var opt = []
		var blk = null
		var splat = null
		var named = null
		var arys = []
		var signature = []
		var idx = 0

		nodes.forEach do |par,i|
			par.index = idx
			if par isa NamedParams
				signature.push('named')
				named = par
			elif par isa OptionalParam
				signature.push('opt')
				opt.push(par)
			elif par isa BlockParam
				signature.push('blk')
				blk = par
			elif par isa SplatParam
				signature.push('splat')
				splat = par
				idx -= 1 # this should really be removed from the list, no?
			elif par isa ArrayParams
				arys.push(par)
				signature.push('ary')
			else
				signature.push('reg')
				reg.push(par)
			idx++

		if named
			var namedvar = named.variable

		# var opt = nodes.filter(|n| n isa OptionalParam)
		# var blk = nodes.filter(|n| n isa BlockParam)[0]
		# var splat = nodes.filter(|n| n isa SplatParam)[0]

		# simple situation where we simply switch
		# can probably optimize by not looking at arguments at all
		var ast = []
		var isFunc = do |js| "typeof {js} == 'function'"

		# This is broken when dealing with iframes anc XSS scripting
		# but for now it is the best test for actual arguments
		# can also do constructor.name == 'Object'
		var isObj = do |js| "{js}.constructor === Object"
		var isntObj = do |js| "{js}.constructor !== Object"
		# should handle some common cases in a cleaner (less verbose) manner
		# does this work with default params after optional ones? Is that even worth anything?
		# this only works in one direction now, unlike TupleAssign

		# we dont really check the length etc now -- so it is buggy for lots of arguments

		# if we have optional params in the regular order etc we can go the easy route
		# slightly hacky now. Should refactor all of these to use the signature?
		if !named && !splat && !blk && opt:length > 0 && signature.join(" ").match(/opt$/)
			for par,i in opt
				ast.push "if({par.name.c} === undefined) {par.name.c} = {par.defaults.c}"


		elif named && !splat && !blk && opt:length == 0 # and no block?!
			# different shorthands
			# if named
			ast.push "if(!{namedvar.c}||{isntObj(namedvar.c)}) {namedvar.c} = \{\}"

		elif blk && opt:length == 1 && !splat && !named
			var op = opt[0]
			var opn = op.name.c
			var bn = blk.name.c
			ast.push "if({bn}==undefined && {isFunc(opn)}) {bn} = {opn},{opn} = {op.defaults.c}"
			ast.push "if({opn}==undefined) {opn} = {op.defaults.c}"

		elif blk && named && opt:length == 0 && !splat
			var bn = blk.name.c
			ast.push "if({bn}==undefined && {isFunc(namedvar.c)}) {bn} = {namedvar.c},{namedvar.c} = \{\}"
			ast.push "else if(!{namedvar.c}||{isntObj(namedvar.c)}) {namedvar.c} = \{\}"

		elif opt:length > 0 || splat # && blk  # && !splat

			var argvar = scope__.temporary(self, pool: 'arguments').predeclared.c
			var len = scope__.temporary(self, pool: 'counter').predeclared.c

			var last = "{argvar}[{len}-1]"
			var pop = "{argvar}[--{len}]"
			ast.push "var {argvar} = arguments, {len} = {argvar}.length"

			if blk
				var bn = blk.name.c
				if splat
					ast.push "var {bn} = {isFunc(last)} ? {pop} : null"
				elif reg:length > 0
					# ast.push "// several regs really?"
					ast.push "var {bn} = {len} > {reg:length} && {isFunc(last)} ? {pop} : null"
				else
					ast.push "var {bn} = {isFunc(last)} ? {pop} : null"

			# if we have named params - look for them before splat
			# should probably loop through pars in the same order they were added
			# should it be prioritized above optional objects??
			if named
				# should not include it when there is a splat?
				ast.push "var {namedvar.c} = {last}&&{isObj(last)} ? {pop} : \{\}"

			for par,i in opt
				ast.push "if({len} < {par.index + 1}) {par.name.c} = {par.defaults.c}"

			# add the splat
			if splat
				var sn = splat.name.c
				var si = splat.index

				if si == 0
					ast.push "var {sn} = new Array({len}>{si} ? {len} : 0)"
					ast.push "while({len}>{si}) {sn}[{len}-1] = {pop}"
				else
					ast.push "var {sn} = new Array({len}>{si} ? {len}-{si} : 0)"
					ast.push "while({len}>{si}) {sn}[--{len} - {si}] = {argvar}[{len}]"

			# if named
			# 	for k,i in named.nodes
			# 		# OP('.',namedvar) <- this is the right way, with invalid names etc
			# 		var op = OP('.',namedvar,k.key).c
			# 		ast.push "var {k.key.c} = {op} !== undefined ? {op} : {k.value.c}"

			# if named

			# return ast.join(";\n") + ";"
			# return "if({opt[0].name.c} instanceof Function) {blk.c} = {opt[0].c};"


		elif opt:length > 0
			for par,i in opt
				ast.push "if({par.name.c} === undefined) {par.name.c} = {par.defaults.c}"

		# now set stuff if named params(!)

		if named
			for k,i in named.nodes
				# console.log "named var {k.c}"
				var op = OP('.',namedvar,k.c).c
				ast.push "var {k.c} = {op} !== undefined ? {op} : {k.defaults.c}"

		if arys:length
			for v,i in arys
				# create tuples
				v.head(o,ast,self)
				# ast.push v.c



		# if opt:length == 0
		return ast:length > 0 ? (ast.join(";\n") + ";") : EMPTY


# Legacy. Should move away from this?
export class VariableDeclaration < ListNode

	# for later, moz-ast style
	prop kind

	# we want to register these variables in
	def add name, init, pos = -1
		var vardec = VariableDeclarator.new(name,init)
		vardec.variable = name if name isa Variable
		pos == 0 ? unshift(vardec) : push(vardec)
		vardec

	def load list
		# temporary solution!!!
		list.map do |par| VariableDeclarator.new(par.name,par.defaults,par.splat)

	def isExpressable
		nodes.every(|item| item.isExpressable)

	def js o
		return EMPTY if count == 0

		# When is this needed?
		if count == 1 && !isExpressable
			first.variable.autodeclare
			var node = first.assignment
			return node.c

		
		var keyword = 'var'
		var groups = {}

		nodes.forEach do |item|
			let typ = item.@variable and item.@variable.type
			groups[typ] ||= []
			groups[typ].push(item.@variable)

		if groups['let'] and (groups['var'] or groups['const'])
			# console.warn "VariableDeclaration with both var and let",nodes.map(|v| v.@variable and v.@variable.c )
			groups['let'].forEach do |item| item.@virtual = yes
		elif groups['let'] and !o.es5
			keyword = 'let'

		# FIX PERFORMANCE
		var out = AST.compact(AST.cary(nodes)).join(", ")
		out ? "{keyword} {out}" : ""

export class VariableDeclarator < Param
	
	prop type
	# can possibly create the variable immediately but wait with scope-declaring
	# What if this is merely the declaration of a system/temporary variable?
	def visit
		# even if we should traverse the defaults as if this variable does not exist
		# we need to preregister it and then activate it later
		self.variable ||= scope__.register(name,null, type: @type or 'var')
		defaults.traverse if defaults
		# WARN what if it is already declared?
		self.variable.declarator = self
		self.variable.addReference(name)
		self

	# needs to be linked up to the actual scoped variables, no?
	def js o
		return null if variable.@proxy

		var defs = defaults
		# FIXME need to deal with var-defines within other statements etc
		# FIXME need better syntax for this
		if defs != null && defs != undefined
			# console.log "defaults is {defaults}"
			defs = defs.c(expression: yes) if defs isa Node

			"{variable.c} = {defs}"
		else
			"{variable.c}"

	def accessor
		self


# TODO clean up and refactor all the different representations of vars
# VarName, VarReference, LocalVarAccess?
export class VarName < ValueNode

	prop variable
	prop splat

	def initialize a,b
		super
		@splat = b

	def visit
		# should we not lookup instead?
		# FIXME p "register value {value.c}"
		self.variable ||= scope__.register(value.c,null)
		self.variable.declarator = self
		self.variable.addReference(value)
		self

	def js o
		variable.c

	def c
		variable.c


export class VarList < Node

	prop type # let / var / const
	prop left
	prop right

	# format :type, :left, :right

	# should throw error if there are more values on right than left

	def initialize t,l,r
		@traversed = no
		@type = type
		@left = l
		@right = r

	def visit

		# we need to carefully traverse children in the right order
		# since we should be able to reference
		for l,i in left
			l.traverse # this should really be a var-declaration
			r.traverse if var r = right[i]
		self

	def js o
		# for the regular items
		var pairs = []
		var ll = left:length
		var rl = right:length
		var v = null

		# splatting here we come
		if ll > 1 && rl == 1
			p "multiassign!"
			var r = right[0]
			r.cache
			for l,i in left
				if l.splat
					throw "not supported?"
					p "splat" # FIX reimplement slice?
					if i == ll - 1
						v = util.slice(r,i)
						p "last"
					else
						v = util.slice(r,i,-(ll - i) + 1)
				else
					v = OP('.',r,Num.new(i))

				pairs.push(OP('=',l,v))

		else
			for l,i in left
				var r = right[i]
				pairs.push(r ? OP('=',l.variable.accessor,r) : l)

		return "var {pairs.c}"


# CODE

export class Code < Node

	prop head
	prop body
	prop scope
	prop params

	def scopetype
		Scope

	def visit
		@scope.visit if @scope
		# @scope.parent = STACK.scope(1) if @scope
		self


# Rename to Program?
export class Root < Code

	def initialize body, opts
		@traversed = no
		@body = AST.blk(body)
		@scope = RootScope.new(self,null)
		@options = {}

	def loc
		@body.loc

	def visit
		ROOT = STACK.ROOT = @scope
		scope.visit
		body.traverse

	def compile o
		STACK.reset # -- nested compilation does not work now
		OPTS = STACK.@options = @options = o or {}
		traverse

		var out = c
		var result = {
			js: out,
			ast: self,
			source: o.@source,
			warnings: scope.warnings,
			options: o,
			toString: (do this:js)
		}
		if o:sourceMapInline or o:sourceMap
			result:sourcemap = SourceMap.new(result).generate

		return result

	def js o
		var out
		unless @options:wrap
			out = scope.c
		else
			body.consume(ImplicitReturn.new)
			out = scope.c(indent: yes)
			out = out.replace(/^\n?/,'\n')
			out = out.replace(/\n?$/,'\n\n')
			out = '(function(){' + out + '})();'

		# find and replace shebangs
		var shebangs = []
		out = out.replace(/^[ \t]*\/\/(\!.+)$/mg) do |m,shebang|
			shebang = shebang.replace(/\bimba\b/g,'node')
			shebangs.push("#{shebang}\n")
			return ""

		out = shebangs.join('') + out

		return out


	def analyze o = {}
		# loglevel: 0, entities: no, scopes: yes
		STACK.loglevel = o:loglevel or 0
		STACK.@analyzing = true
		ROOT = STACK.ROOT = @scope
		OPTS = STACK.@options = {
			target: o:target
			loglevel: o:loglevel or 0
			analysis: {
				entities: (o:entities or no),
				scopes: (o:scopes ?= yes)
			}
		}

		traverse
		STACK.@analyzing = false

		return scope.dump

	def inspect
		true

export class ClassDeclaration < Code

	prop name
	prop superclass
	prop initor

	def consume node
		if node isa Return
			option('return',yes)
			return self
		super

	def namepath
		@namepath ||= "{name.c}"

	def metadata
		{
			type: 'class'
			namepath: namepath
			inherits: superclass?.namepath
			path: name.c.toString
			desc: @desc
			loc: loc
		}

	def toJSON
		metadata

	def initialize name, superclass, body
		# what about the namespace?
		@traversed = no
		@name = name
		@superclass = superclass
		@scope = ClassScope.new(self)
		@body = AST.blk(body)
		self

	def visit
		# replace with some advanced lookup?
		ROOT.entities.add(namepath,self)
		scope.visit
		body.traverse
		self

	def js o
		scope.virtualize # is this always needed?
		scope.context.value = name
		scope.context.reference = name
		# should probably also warn about stuff etc
		if option(:extension)
			return body.c

		var head = []
		var o = @options or {}
		var cname = name isa Access ? name.right : name
		var namespaced = name != cname
		var initor = null
		var sup = superclass

		var bodyindex = -1
		var spaces = body.filter do |item| item isa Terminator
		var mark = AST.mark(option('keyword'))

		body.map do |c,i|
			if c isa MethodDeclaration && c.type == :constructor
				bodyindex = i

		if bodyindex >= 0
			initor = body.removeAt(bodyindex)

		# var initor = body.pluck do |c| c isa MethodDeclaration && c.type == :constructor
		# compile the cname
		cname = cname.c unless typeof cname == 'string'

		var cpath = typeof name  == 'string' ? name : name.c

		@cname = cname
		@cpath = cpath

		if !initor
			if sup
				initor = "{mark}function {cname}()\{ return {sup.c}.apply(this,arguments) \};\n\n"
			else
				initor = "{mark}function {cname}()" + '{ };\n\n'

		else
			initor.name = cname
			initor = initor.c + ';'
			

		# if we are defining a class inside a namespace etc -- how should we set up the class?

		if namespaced
			# should use Nodes to build this instead
			initor = "{cpath} = {initor}" # OP('=',name,initor)

		head.push(initor) # // @class {cname}\n

		if bodyindex >= 0
			# add the space after initor?
			if body.index(bodyindex) isa Terminator
				head.push(body.removeAt(bodyindex))

		if sup
			# console.log "deal with superclass!"
			# head.push("// extending the superclass\nimba$class({name.c},{sup.c});\n\n")
			head.push(Util.Subclass.new([name,sup]))
			
		# now create a reference
		# let protoref = scope__.parent.temporary(self, pool: 'proto')
		# head.push("var {protoref} = {scope__.prototype.c}")
		# scope__.prototype.@value = protoref

		# only if it is not namespaced
		if o:global and !namespaced # option(:global)
			let globalName = STACK.platform == 'web' ? "window" : "global"
			head.push("{globalName}.{cname} = {cpath}; // global class \n")

		if o:export and !namespaced
			head.push("exports.{o:default ? 'default' : cname} = {cpath}; // export class \n")

		# FIXME
		# if namespaced and (o:local or o:export)
		# 	console.log "namespaced classes are implicitly local/global depending on the namespace"

		if option('return')
			body.push("return {cpath};")

		body.unshift(part) for part in head.reverse
		body.@indentation = null
		var end = body.index(body.count - 1)
		body.pop if end isa Terminator and end.c:length == 1

		var out = body.c

		return out

export class ModuleDeclaration < Code

	prop name
	
	def initialize name, body
		# what about the namespace?
		@traversed = no
		@name = name
		@scope = ModuleScope.new(self)
		@body = AST.blk(body or [])
		self
		
	def visit
		ROOT.entities.register(self) # what if this is not local?
		# replace with some advanced lookup?
		
		scope.visit
		
		if @name
			let modname = String(name.@value or name)
			scope.parent.register(modname, self, type: 'module')
			# set the context of this here already?
			# scope.parent.declare(@name,null,system: yes)		
		scope.context.value = scope.context.@reference = @ctx = scope.declare('$mod$',null,system: yes)
		body.traverse
	
	def js o
		var mark = AST.mark(option('keyword'))
		
		body.add(ImplicitReturn.new(@ctx))
		
		var cbody = body.c

		var js = "(function({@ctx.c})\{{cbody}\})(\{\})"

		let cname = name.c
		# declare variable
		js = "var {cname} = {js}"
		# only if it is not namespaced
		# if o:global and !namespaced # option(:global)
		#	js.push("global.{cname} = {cpath}; // global class \n")
		if option(:export)
			js = "{js}\nexports.{option(:default) ? 'default' : cname} = {cname};"

		if option(:return)
			js += "\nreturn {cname};"
				
		return js


export class TagDeclaration < Code

	prop name
	prop superclass
	prop initor

	def namepath
		"<{name}>"

	def toJSON
		{
			type: 'tag'
			namepath: namepath
			inherits: superclass ? "<{superclass.name}>" : null
			loc: loc
			desc: @desc
		}

	def consume node
		if node isa Return
			option('return',yes)
			return self
		super

	def initialize name, superclass, body
		@traversed = no
		@name = name
		@superclass = superclass
		@scope = TagScope.new(self)
		@body = AST.blk(body || [])

	def visit
		if String(name).match(/^[A-Z]/)
			set(isClass: yes)

		ROOT.entities.register(self) # what if this is not local?

		# replace with some advanced lookup?
		scope.visit
		body.traverse

	def id
		name.id

	def js o
		scope.context.value = @ctx = scope.declare('tag',null,system: yes)

		# var ns = name.ns
		var mark = AST.mark(option('keyword'))
		var params = []

		params.push(name.c)
		var cbody = body.c

		if superclass
			# WARN what if the superclass has a namespace?
			# what if it is a regular class?
			let supname = superclass.name
			if !supname[0].match(/[A-Z]/)
				params.push(superclass.c)
				# supname = helpers.singlequote(supname)
			else
				params.push(supname)

		if body.count
			params.push("function({@ctx.c})\{{cbody}\}")

		var meth = option(:extension) ? 'extendTag' : 'defineTag'
		var js = "{mark}{scope__.imba.c}.{meth}({params.join(', ')})"

		if name.isClass
			let cname = name.name
			# declare variable
			js = "var {cname} = {js}"
			# only if it is not namespaced
			# if o:global and !namespaced # option(:global)
			#	js.push("global.{cname} = {cpath}; // global class \n")
			if option(:export)
				js = "{js}\nexports.{option(:default) ? 'default' : cname} = {cname};"

			if option(:return)
				js += "\nreturn {cname};"

		else
			if option(:return)
				js = "return " + js


		return js

		# return out

export class Func < Code

	prop name
	prop params
	prop target
	prop options
	prop type
	prop context

	def scopetype do FunctionScope

	def initialize params, body, name, target, o
		@options = o
		var typ = scopetype
		@traversed = no
		@body = AST.blk(body)
		@scope ||= (o and o:scope) || typ.new(self)
		@scope.params = @params = ParamList.new(params)
		@name = name || ''
		@target = target
		@type = :function
		@variable = null
		self

	def nonlocals
		@scope.@nonlocals

	def visit
		scope.visit
		@context = scope.parent
		@params.traverse
		@body.traverse # so soon?

	def funcKeyword
		let str = "function"
		str = "async {str}" if option(:async)
		return str

	def js o
		body.consume(ImplicitReturn.new) unless option(:noreturn)
		var ind = body.@indentation
		# var s = ind and ind.@open
		body.@indentation = null if ind and ind.isGenerated
		var code = scope.c(indent: (!ind or !ind.isGenerated), braces: yes)

		# args = params.map do |par| par.name
		# head = params.map do |par| par.c
		# code = [head,body.c(expression: no)].AST.flatten.compact.join("\n").wrap
		# FIXME creating the function-name this way is prone to create naming-collisions
		# will need to wrap the value in a FunctionName which takes care of looking up scope
		# and possibly dealing with it
		var name = typeof @name == 'string' ? @name : @name.c
		var name = name ? ' ' + name.replace(/\./g,'_') : ''
		var out = "{funcKeyword}{name}({params.c}) " + code
		# out = "async {out}" if option(:async)
		out = "({out})()" if option(:eval)
		return out

	def shouldParenthesize par = up
		par isa Call && par.callee == self
		# if up as a call? Only if we are


export class Lambda < Func
	def scopetype
		var k = option(:keyword)
		(k and k.@value == 'ƒ') ? (MethodScope) : (LambdaScope)


export class TagFragmentFunc < Func

	def scopetype
		# caching still needs to be local no matter what?
		option(:closed) ? (MethodScope) : (LambdaScope)
		
export class TagLoopFunc < Func

	def scopetype
		# caching still needs to be local no matter what?
		option(:closed) ? (MethodScope) : (LambdaScope)
		
	def visit stack
		@loop = @body.first
		@tag = stack.@tag
		@tags = []
		@args = []
		
		var prevLoop = @tag.@tagLoop

		if prevLoop
			@parentLoop = prevLoop

		@tag.@tagLoop = self
		
		@isFast = prevLoop ? false : true

		if @loop
			@loop.body.values.every(|v| v isa Tag )

		super

		@tag.@tagLoop = prevLoop
		# see if we are optimized
		var lo = @loop.options
		var single = @tags[0]
		# as long as there is only a single item to push
		if lo:step or lo:diff or lo:guard or !@loop.body.values.every(|v| v isa Tag )
			@isFast = no
			
		for param in @params
			param.visit(stack)
			
		# we must be certain that we are only consuming one tag?

		if @tags.len == 1 and !single.option(:key)
			if @isFast
				let len = @loop.options:vars:len
				if len and len:declarator
					let defs = len.declarator.defaults
					len.declarator.defaults = OP('=',OP('.',@params.at(0),'taglen'),defs)
				@body.push(Return.new(@params.at(0)))
				set(treeType: 4)
				return self
			elif false
				# optional optimization
				let resvar = @params.at(0)
				let counter = scope__.declare('k',Num.new(0),system: yes)
				single.set(treeRef: counter)
				# let collector = TagPushAssign.new("push",resvar,null)
				@loop.body.push(OP('++',counter))
				@body.push(OP('=',OP('.',resvar,'taglen'),counter))
				@body.push(Return.new(resvar))
				# console.log "optimize"
				set(treeType: 4)
				return self
		
		unless @isFast
			for item in @tags
				item.@loopCache.@callee = scope__.imbaRef('createTagMap')
		
		unless @parentLoop
			let collectInto = ValueNode.new("val")
			let collector = TagPushAssign.new("push",collectInto,null)
			@loop.body.consume(collector)
			let collected = collector.consumed
			let treeType = 3
			
			if collected.len == 1 and collected[0] isa Tag
				let op = CALL(OP('.',@params.at(0),'$iter'),[])
				@resultVar = scope.declare('$$',op, system: yes)
				treeType = 5
			else
				@resultVar = @params.at(@params.count,true,'$$') # visiting?
				@resultVar.visit(stack)
				if collected.every(|item| item isa Tag)
					# let op = CALL(scope__.imbaRef('createTagLoopResult'),[])
					treeType = 5
					@args.push CALL(scope__.imbaRef('createTagLoopResult'),[])
				else
					@args.push Arr.new([])
			
			collectInto.value = @resultVar
			@body.push(Return.new(collectInto))
			# let collector = TagPushAssign.new("push",@resultVar,null)
			# @loop.body.consume(collector)
			# @body.push(Return.new(@resultVar))
			# check if everything that is pushed is an assign?
			set(treeType: treeType)
		else
			set(noreturn: yes)
		self
		
	def consume other
		if other isa TagPushAssign
			@loop.body.consume(other)
		self
		
	def capture node
		let o = node.@options
		
		o:loop ||= self
		o:parRef ||= o:rootRef = @tag.childCacher.nextRef
		o:par = null

		if @parentLoop
			@parentLoop.capture(node)
		
		if o:loop == self

			let gen = o:loopCacher || @tag.childCacher
			let oref = o:parRef || @tag.childCacher.nextRef

			let nr = @tags.push(node) - 1
			let ref = @loop.option(:vars)['index']
			let param = @params.at(@params.count,true,"${@params.count}")

			node.set(cacher: TagCache.new(self,param))
			
			if o:key
				node.set(treeRef: o:key)
				o:key.cache
			else
				node.set(treeRef: ref)

			let fn = o:key ? 'createTagMap' : 'createTagList'
			let parentRef = @tag.cachePath # will be correct even if nested loops

			let get = CALL(scope__.imbaRef(fn),parentRef ? [gen,oref,parentRef] : [gen,oref])
			node.@loopCache = get
			let op = OP('||',OP('.',gen,oref),get)
			@args.push(op)
		else
			let ref = @loop.option(:vars)['index']
			let param = @params.at(@params.count,true,"${@params.count}")
			param.variable = scope__.register("${@params.count}",self,system: true)

			if @parentLoop
				@args.push(OP('||=',OP('.',o:loopCacher,o:parRef),Arr.new([]) ))
				# @args.push( OP('||=',OP('.',@tag.childCacher,o:parRef),Arr.new([])) )
			else
				@args.push( OP('||=',OP('.',@tag.childCacher,o:parRef),Arr.new([])) )
				
				
			o:loopCacher = param
			o:parRef = ref
			
			# if this is the first time we are registering this loop

		self
	
	def js o
		@name = 'tagLoop'
		var out = super
		"(" + out + ")({AST.cary(@args)})"

export class MethodDeclaration < Func

	prop variable

	def scopetype do MethodScope

	def consume node
		if node isa Return
			option('return',yes)
			return self
		super

	def metadata
		{
			type: "method"
			name: "" + name
			namepath: namepath
			params: @params.metadata
			desc: @desc
			scopenr: scope.@nr
			loc: loc
		}

	def loc
		if let d = option(:def)
			[d.@loc,body.loc[1]]
		else
			[0,0]


	def toJSON
		metadata

	def namepath
		return @namepath if @namepath

		var name = String(name)
		var sep = (option('static') ? '.' : '#')
		if target
			@namepath = @target.namepath + sep + name
		else
			@namepath = '&' + name

	def visit
		@decorators = up?.collectDecorators
		var o = @options
		scope.visit
		
		# setters should always return self
		if String(name).match(/\=$/)
			set(chainable: yes)

		var closure = @context = scope.parent.closure

		@params.traverse
		
		if option(:inObject)
			@body.traverse
			return self
			
		if target isa Identifier
			if let variable = scope.lookup(target.toString)
				target = variable
			# should be changed to VarOrAccess?!

		if String(name) == 'initialize' and (closure isa ClassScope) and !(closure isa TagScope) # and not ModuleScope?
			self.type = :constructor
		
		# instance-method / member
		if closure isa ClassScope and !target
			@target = closure.prototype
			set(prototype: @target)
			closure.annotate(self)

		if target isa Self
			@target = closure.context
			closure.annotate(self)
			set(static: yes)
			
		elif o:variable
			@variable = scope.parent.register(name, self, type: String(o:variable))
			warn "{String(o:variable)} def cannot have a target" if target

		elif !target
			@target = closure.context

			if closure isa ModuleScope
				closure.annotate(self)
				body.set(strict: yes)
				scope.context.@reference = scope.declare("self",OP('||',This.new,@target))
			else
				# what if scope context has already been triggered?
				# method should pre-inherit the outer self?
				scope.@selfless = yes
				# @context = @target
		
		if o:export and !(closure isa RootScope)
			warn("cannot export non-root method", loc: o:export.loc)

		ROOT.entities.add(namepath,self)
		@body.traverse
		self

	def supername
		type == :constructor ? type : name


	# FIXME export global etc are NOT valid for methods inside any other scope than
	# the outermost scope (root)

	def js o
		var o = @options
		# FIXME Do this in the grammar - remnants of old implementation
		unless type == :constructor or option(:noreturn)
			if option(:chainable)
				body.add(ImplicitReturn.new(scope.context))
			elif option(:greedy)
				# haaack
				body.consume(GreedyReturn.new)
			else
				body.consume(ImplicitReturn.new)

		var code = scope.c(indent: yes, braces: yes)

		# same for Func -- should generalize
		var name = typeof @name == 'string' ? @name : @name.c
		name = name.replace(/\./g,'_') # not used?!

		var func = "({params.c})" + code
		var ctx = context
		var out = ""
		var mark = AST.mark(option('def'))
		var fname = AST.sym(self.name)

		if option(:inObject)
			out = "{fname}: {mark}{funcKeyword}{func}"
			
		elif type == :constructor
			out = "{mark}{funcKeyword} {fname}{func}"
			# add shorthand for prototype now

		elif target
			out = "{mark}{target.c}.{fname} = {funcKeyword} {func}"
			if o:export
				out = "exports.{o:default ? 'default' : fname} = {out}"
		else
			out = "{mark}{funcKeyword} {fname}{func}"
			if o:export
				out = "{out}; exports.{o:default ? 'default' : fname} = {fname};"

		if o:global
			warn("global def is deprecated", loc: o:global.region)
			out = "{fname} = {out}"
		
		if option(:return)
			out = "return {out}"
			
		return out


export class TagFragmentDeclaration < MethodDeclaration


export class PropertyDeclaration < Node

	var propTemplate = '''
	${headers}
	${path}${getterKey} = function(v){ return ${get}; }
	${path}.${setter} = function(v){ ${set}; return this; }
	${init}
	'''

	var propWatchTemplate = '''
	${headers}
	${path}${getterKey} = function(v){ return ${get}; }
	${path}.${setter} = function(v){
		var a = this.${getter}();
		if(v != a) { ${set}; }
		if(v != a) { ${ondirty} }
		return this;
	}
	${init}
	'''

	prop name
	prop options

	def initialize name, options, token
		@token = token
		@traversed = no
		@name = name
		@options = options || Obj.new(AssignList.new)

	def visit
		@options.traverse
		self

	# This will soon support bindings / listeners etc, much more
	# advanced generated code based on options passed in.
	def c
		var o = options
		var ast = ""
		var key = name.js
		var scope = STACK.scope

		var addDesc = o.keys:length

		var pars = o.hash

		var isAttr = (@token and String(@token) == 'attr') or o.key(:attr)

		var js =
			key: key
			getter: key
			getterKey: RESERVED_TEST.test(key) ? "['{key}']" : ".{key}"
			setter: AST.sym("set-{key}")
			scope: "{scope.context.c}"
			path: '${scope}.prototype'
			set: "this._{key} = v"
			get: "this._{key}"
			init: ""
			headers: ""
			ondirty: ""


		if pars:inline
			if pars:inline isa Bool and !pars:inline.isTruthy
				o.remove('inline')
				return "{scope__.imba.c}.{@token}({js:scope},'{name.value}',{o.c})".replace(',{})',')')

		var tpl = propTemplate
		
		if scope isa ModuleScope
			js:path = js:scope

		o.add('name',Symbol.new(key))

		if pars:watch
			tpl = propWatchTemplate unless pars:watch isa Bool and !pars:watch.isTruthy
			var wfn = "{key}DidSet"

			if pars:watch isa Symbol
				wfn = pars:watch
			elif pars:watch isa Str
				wfn = pars:watch
			elif pars:watch isa Bool
				o.key(:watch).value = Symbol.new("{key}DidSet")
			else
				wfn = null

			if wfn
				let fn = OP('.',This.new,wfn)
				js:ondirty = OP('&&',fn,CALL(fn,['v','a',"this.__{key}"])).c
			else
				js:ondirty = "{scope__.imba.c}.propDidSet(this,this.__{key},v,a)"


		if pars:observe
			if pars:observe isa Bool
				o.key(:observe).value = Symbol.new("{key}DidEmit")

			tpl = propWatchTemplate
			js:ondirty = "{scope__.imba.c}.observeProperty(this,'{key}',{o.key(:observe).value.c},v,a);" + (js:ondirty or '')
			# OP('&&',fn,CALL(fn,['v','a',"this.__{key}"])).c

		if !isAttr and o.key(:dom)
			js:set = "if (v != this.dom().{name.value}) \{ this.dom().{name.value} = v \}"
			js:get = "this.dom().{name.value}"

		if isAttr # (@token and String(@token) == 'attr') or o.key(:dom) or o.key(:attr)
			let attrKey = o.key(:dom) isa Str ? o.key(:dom) : name.value
			# need to make sure o has a key for attr then - so that the delegate can know?
			js:set = "this.setAttribute('{attrKey}',v)"
			js:get = "this.getAttribute('{attrKey}')"

		elif o.key(:delegate)
			# if we have a delegate
			js:set = "v = this.__{key}.delegate.set(this,'{key}',v,this.__{key})"
			js:get = "this.__{key}.delegate.get(this,'{key}',this.__{key})"



		if pars:default
			if o.key(:dom)
				# FIXME go through class-method setAttribute instead
				js:init = "{js:scope}.dom().setAttribute('{key}',{pars:default.c});"
			else
				# if this is not a primitive - it MUST be included in the
				# getter / setter instead
				# FIXME throw warning if the default is not a primitive object
				js:init = "{js:path}._{key} = {pars:default.c};"

		if o.key(:chainable)
			js:get = "v !== undefined ? (this.{js:setter}(v),this) : {js:get}"


		js:options = o.c

		if addDesc
			js:headers = "{js:path}.__{js:getter} = {js:options};"

		var reg = /\$\{(\w+)\}/gm
		# var tpl = o.key(:watch) ? propWatchTemplate : propTemplate
		var out = tpl.replace(reg) do |m,a| js[a]
		# run another time for nesting. hacky
		out = out.replace(reg) do |m,a| js[a]
		# out = out.replace(/\n\s*$/,'')
		out = out.replace(/^\s+|\s+$/g, '')

		# if o.key(:v)
		return out



# Literals should probably not inherit from the same parent
# as arrays, tuples, objects would be better off inheriting
# from listnode.

export class Literal < ValueNode

	def initialize v
		@traversed = no
		@expression = yes
		@cache = null
		@raw = null
		@value = load(v)
		
	def load value
		value
		

	def toString
		"" + value

	def hasSideEffects
		false

	def shouldParenthesizeInTernary
		no


export class Bool < Literal

	# Should keep the real value (yes/no/true/false)?
	def initialize v
		@value = v
		@raw = String(v) == "true" ? true : false

	def cache
		self

	def isPrimitive
		yes

	def truthy
		String(value) == "true"
		# yes

	def js o
		String(@value)

	def c
		STACK.@counter += 1
		# undefined should not be a bool
		String(@value)
		# @raw ? "true" : "false"

	def toJSON
		{type: 'Bool', value: @value}

	def loc
		@value:region ? @value.region : [0,0]

export class Undefined < Literal

	def isPrimitive
		yes

	def isTruthy
		no

	def c
		AST.mark(@value) + "undefined"

export class Nil < Literal

	def isPrimitive
		yes

	def isTruthy
		no

	def c
		AST.mark(@value) + "null"

export class True < Bool

	def raw
		true

	def isTruthy
		yes

	def c
		AST.mark(@value) + "true"

export class False < Bool

	def raw
		false

	def isTruthy
		no

	def c
		AST.mark(@value) + "false"

export class Num < Literal

	# value is token - should not be
	def initialize v
		@traversed = no
		@value = v

	def toString
		String(@value)

	def isPrimitive deep
		yes

	def isTruthy
		String(@value) != "0"

	def shouldParenthesize par = up
		par isa Access and par.left == self

	def js o
		var num = String(@value)
		return num

	def c o
		return super(o) if @cache
		var js = String(@value)
		var par = STACK.current
		var paren = par isa Access and par.left == self
		# only if this is the right part of teh acces
		paren ? "({AST.mark(@value)}" + js + ")" : (AST.mark(@value) + js)
		# @cache ? super(o) : String(@value)

	def cache o
		return self unless o and (o:cache or o:pool)
		super(o)

	def raw
		# really?
		JSON.parse(String(value))

	def toJSON
		{type: typeName, value: raw}

# should be quoted no?
# what about strings in object-literals?
# we want to be able to see if the values are allowed
export class Str < Literal

	def initialize v
		@traversed = no
		@expression = yes
		@cache = null
		@value = v
		# should grab the actual value immediately?

	def isString
		yes

	def isPrimitive deep
		yes

	def raw
		# JSON.parse requires double-quoted strings,
		# while eval also allows single quotes.
		# NEXT eval is not accessible like this
		# WARNING TODO be careful! - should clean up

		@raw ||= String(value).slice(1,-1) # incredibly stupid solution

	def isValidIdentifier
		# there are also some values we cannot use
		raw.match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/) ? true : false

	def js o
		String(@value)

	def c o
		@cache ? super(o) : String(@value)


export class Interpolation < ValueNode

# Currently not used - it would be better to use this
# for real interpolated strings though, than to break
# them up into their parts before parsing
export class InterpolatedString < Node

	def initialize nodes, o = {}
		@nodes = nodes
		@options = o
		self

	def add part
		@nodes.push(part) if part
		self

	def visit
		for node in @nodes
			node.traverse
		self
		
	def isString
		yes

	def escapeString str
		str = str.replace(/\n/g, '\\\n')

	def js o
		# creating the string
		var parts = []
		var str = @noparen ? '' : '('

		@nodes.map do |part,i|
			if part isa Token and part.@type == 'NEOSTRING'
				# esca
				parts.push('"' + escapeString(part.@value) + '"')
			elif part
				if i == 0
					# force first part to be string
					parts.push('""')
				part.@parens = yes
				parts.push(part.c(expression: yes))

		str += parts.join(" + ")
		str += ')' unless @noparen
		return str


export class Tuple < ListNode

	def c
		# compiles as an array
		Arr.new(nodes).c

	def hasSplat
		filter(|v| v isa Splat )[0]

	def consume node
		if count == 1
			return first.consume(node)
		else
			throw "multituple cannot consume"


# Because we've dropped the Str-wrapper it is kinda difficult
export class Symbol < Literal

	def isValidIdentifier
		raw.match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/) ? true : false

	def isPrimitive deep
		yes

	def raw
		@raw ||= AST.sym(value.toString.replace(/^\:/,''))

	def js o
		"'{AST.sym(raw)}'"

export class RegExp < Literal

	def isPrimitive
		yes

	def js
		var v = super
		
		# special casing heregex
		if var m = constants.HEREGEX.exec(v)
			# console.log 'matxhed heregex',m
			var re = m[1].replace(constants.HEREGEX_OMIT, '').replace(/\//g, '\\/')
			return '/' + (re or '(?:)') + '/' + m[2]
		
		v == '//' ? '/(?:)/' : v

# Should inherit from ListNode - would simplify
export class Arr < Literal

	def load value
		value isa Array ? ArgList.new(value) : value

	def push item
		value.push(item)
		self

	def count
		value:length

	def nodes
		var val = value
		val isa Array ? val : val.nodes

	def splat
		value.some(|v| v isa Splat)

	def visit
		@value.traverse if @value and @value:traverse
		self

	def isPrimitive deep
		!value.some(|v| !v.isPrimitive(yes) )

	def js o

		var val = @value
		return "[]" unless val

		var splat = splat
		var nodes = val isa Array ? val : val.nodes

		# for v in @value
		# 	break splat = yes if v isa Splat
		# var splat = value.some(|v| v isa Splat)

		if splat
			# "SPLATTED ARRAY!"
			# if we know for certain that the splats are arrays we can drop the slice?
			var slices = []
			var group = null

			for v in nodes
				if v isa Splat
					slices.push(v)
					group = null
				else
					slices.push(group = Arr.new([])) unless group
					group.push(v)

			"[].concat({AST.cary(slices).join(", ")})"
		else
			# very temporary. need a more generic way to prettify code
			# should depend on the length of the inner items etc
			# if @indented or option(:indent) or value.@indented
			#	"[\n{value.c.join(",\n").indent}\n]"
			var out = val isa Array ? AST.cary(val) : val.c
			"[{out}]"

	def hasSideEffects
		value.some(|v| v.hasSideEffects )

	def toString
		"Arr"

	def indented a,b
		@value.indented(a,b)
		self

	def self.wrap val
		Arr.new(val)

# should not be cklassified as a literal?
export class Obj < Literal

	def load value
		value isa Array ? AssignList.new(value) : value

	def visit
		@value.traverse if @value
		# for v in value
		# 	v.traverse
		self

	def js o
		var dyn = value.filter(|v| v isa ObjAttr and (v.key isa Op or v.key isa InterpolatedString)  )

		if dyn:length > 0
			var idx = value.indexOf(dyn[0])
			# create a temp variable

			var tmp = scope__.temporary(self)
			# set the temporary object to the same
			var first = value.slice(0,idx)
			var obj = Obj.new(first)
			var ast = [OP('=',tmp,obj)]

			value.slice(idx).forEach do |atr|
				ast.push(OP('=',OP('.',tmp,atr.key),atr.value))
			ast.push(tmp) # access the tmp at in the last part
			return Parens.new(ast).c

		# for objects with expression-keys we need to think differently
		'{' + value.c + '}'

	def add k, v
		k = Identifier.new(k) if k isa String
		var kv = ObjAttr.new(k,v)
		value.push(kv)
		return kv

	def remove key
		for k in value
			value.remove(k) if k.key.symbol == key
		self

	def keys
		Object.keys(hash)

	def hash
		var hash = {}
		for k in value
			hash[k.key.symbol] = k.value if k isa ObjAttr
		return hash
		# return k if k.key.symbol == key

	# add method for finding properties etc?
	def key key
		for k in value
			return k if k isa ObjAttr and k.key.symbol == key
		null

	def indented a,b
		@value.indented(a,b)
		self

	def hasSideEffects
		value.some(|v| v.hasSideEffects )

	# for converting a real object into an ast-representation
	def self.wrap obj
		var attrs = []
		for own k,v of obj
			if v isa Array
				v = Arr.wrap(v)
			elif v:constructor == Object
				v = Obj.wrap(v)
			# if k isa String
			#	k = LIT(k)
			attrs.push(ObjAttr.new(k,v))
		return Obj.new(attrs)

	def toString
		"Obj"

export class ObjAttr < Node

	prop key
	prop value
	prop options

	def initialize key, value
		@traversed = no
		@key = key
		@value = value
		@dynamic = key isa Op
		self

	def visit
		# should probably traverse key as well, unless it is a dead simple identifier
		key.traverse
		value.traverse

	def js o
		let key = self.key

		if key isa Identifier and String(key.@value)[0] == '@'
			key = Ivar.new(key)

		var k = key.isReserved ? "'{key.c}'" : key.c

		"{k}: {value.c}"

	def hasSideEffects
		true



export class ArgsReference < Node

	# should register in this scope --
	def c
		"arguments"

# should be a separate Context or something
export class Self < Literal

	def initialize value
		@value = value

	def cache
		self

	def reference
		return self

	def visit
		scope__.context
		self

	def c
		var s = scope__
		(s ? s.context.c : "this")

export class ImplicitSelf < Self

export class This < Self

	def cache
		self

	def reference
		self

	def visit
		self

	def c
		"this"




# OPERATORS

export class Op < Node

	prop op
	prop left
	prop right

	def initialize o, l, r
		# set expression yes, no?
		@expression = no
		@traversed = no
		@parens = no
		@cache = null
		@invert = no
		@opToken = o
		@op = o and o.@value or o
		
		if @op == 'and'
			@op = '&&'
		elif @op == 'or'
			@op = '||'
		elif @op == 'is'
			@op = '=='
		elif @op == 'isnt'
			@op = '!='
		
			
		@left = l
		@right = r
		return self

	def visit
		@right.traverse if @right
		@left.traverse if @left
		return self

	def isExpressable
		# what if right is a string?!?
		!right || right.isExpressable

	def js o
		var out = null
		var op = @op

		var l = @left
		var r = @right

		l = l.c if l isa Node
		r = r.c if r isa Node

		if l && r
			out = "{l} {AST.mark(@opToken)}{op} {r}"
		elif l
			out = "{AST.mark(@opToken)}{op}{l}"
		# out = out.parenthesize if up isa Op # really?
		out
		
	def isString
		@op == '+' and @left and @left.isString

	def shouldParenthesize
		@parens
		# option(:parens)

	def precedence
		10

	def consume node
		return super if isExpressable

		# TODO can rather use global caching?
		var tmpvar = scope__.declare(:tmp,null,system: yes)
		var clone = OP(op,left,null)
		var ast = right.consume(clone)
		ast.consume(node) if node
		return ast

export class ComparisonOp < Op

	def invert
		# are there other comparison ops?
		# what about a chain?
		var op = @op
		var pairs = [ "==","!=" , "===","!==" , ">","<=" , "<",">=" ]
		var idx = pairs.indexOf(op)
		idx += (idx % 2 ? -1 : 1)
		self.op = pairs[idx]
		@invert = !@invert
		self

	def c
		if left isa ComparisonOp
			left.right.cache
			OP('&&',left,OP(op,left.right,right)).c
		else
			super

	def js o
		var op = @op
		var l = @left
		var r = @right

		l = l.c if l isa Node
		r = r.c if r isa Node
		return "{l} {AST.mark(@opToken)}{op} {r}"


export class MathOp < Op
	# BUG if we have a statement in left or right we need
	# to FORCE it into an expression, and register warning
	# should not at all consume anything like a regular Op
	def c
		if op == '∪'
			return util.union(left,right).c
		elif op == '∩'
			return util.intersect(left,right).c


export class UnaryOp < Op

	def invert
		if op == '!'
			return left
		else
			super # regular invert

	def isTruthy
		var val = AST.truthy(left)
		return val !== undefined ? (!val) : (undefined)

	def js o
		var l = @left
		var r = @right
		var op = op

		if op == 'not'
			op = '!'

		if op == '!'
			# l.@parens = yes
			var str = l.c
			var paren = l.shouldParenthesize(self)
			# FIXME this is a very hacky workaround. Need to handle all this
			# in the child instead, problems arise due to automatic caching
			str = '(' + str + ')' unless str.match(/^\!?([\w\.]+)$/) or l isa Parens or paren or l isa Access or l isa Call
			# l.set(parens: yes) # sure?
			"{op}{str}"

		elif op == '√'
			"Math.sqrt({l.c})"

		elif left
			"{l.c}{op}"

		else
			"{op}{r.c}"

	def normalize
		return self if op == '!' or op == '√'
		var node = (left || right).node
		# for property-accessors we need to rewrite the ast
		return self unless node isa PropertyAccess

		# ask to cache the path
		node.left.cache if node isa Access && node.left

		var num = Num.new(1)
		var ast = OP('=',node,OP(op[0],node,num))
		ast = OP(op[0] == '-' ? '+' : '-',ast,num) if left

		return ast

	def consume node
		var norm = normalize
		norm == self ? super : norm.consume(node)

	def c
		var norm = normalize
		norm == self ? super : norm.c

export class InstanceOf < Op

	def js o
		# fix checks for String and Number

		if right isa Const
			# WARN otherwise - what do we do? does not work with dynamic
			# classes etc? Should probably send to utility function isa$
			var name = AST.c(right.value)
			var obj = left.node
			# TODO also check for primitive-constructor
			if name in ['String','Number','Boolean']
				unless obj isa LocalVarAccess
					obj.cache
				# need a double check for these (cache left) - possibly
				return "(typeof {obj.c}=='{name.toLowerCase}'||{obj.c} instanceof {name})"

				# convert
		var out = "{left.c} instanceof {right.c}"

		# should this not happen in #c?
		out = helpers.parenthesize(out) if o.parent isa Op
		out

export class TypeOf < Op

	def js o
		"typeof {left.c}"

export class Delete < Op

	def js o
		# TODO this will execute calls several times if the path is not directly to an object
		# need to cache the receiver
		var l = left
		var tmp = scope__.temporary(self, pool: 'val')
		var o = OP('=',tmp,l)
		# FIXME
		return "({o.c},delete {l.c}, {tmp.c})" # oh well
		# var ast = [OP('=',tmp,left),"delete {left.c}",tmp]
		# should parenthesize directly no?
		# ast.c

	def shouldParenthesize
		yes

export class In < Op

	def invert
		@invert = !@invert
		self

	def js o
		var cond = @invert ? "== -1" : ">= 0"
		var idx = Util.indexOf(left,right)
		"{idx.c} {cond}"



# ACCESS

export class Access < Op

	def initialize o, l, r
		# set expression yes, no?
		@expression = no
		@traversed = no
		@parens = no
		@cache = null
		@invert = no
		@op = o and o.@value or o
		@left = l
		@right = r
		return self

	def clone left, right
		var ctor = self:constructor
		ctor.new(op,left,right)

	def js o
		var raw = null
		var rgt = right
		var ctx = (left || scope__.context)
		var pre = ""
		var mark = ''

		# if safechain
		#	p "Access is safechained {rgt.c}"


		if rgt isa Num
			return ctx.c + "[" + rgt.c + "]"

		# is this right? Should not the index compile the brackets
		# or value is a symbol -- should be the same, no?
		if rgt isa Index and (rgt.value isa Str or rgt.value isa Symbol)
			rgt = rgt.value

		# TODO do the identifier-validation in a central place instead
		if rgt isa Str and rgt.isValidIdentifier
			raw = rgt.raw

		elif rgt isa Symbol and rgt.isValidIdentifier
			raw = rgt.raw

		elif rgt isa Identifier and rgt.isValidIdentifier
			mark = AST.mark(rgt.@value)
			raw = rgt.c

		if safechain and ctx
			ctx.cache(force: yes)
			pre = ctx.c + " && "

		# really?
		# var ctx = (left || scope__.context)
		var out = if raw
			# see if it needs quoting
			# need to check to see if it is legal
			ctx ? "{ctx.c}.{mark}{raw}" : raw
		else
			var r = rgt isa Node ? rgt.c(expression: yes) : rgt
			"{ctx.c}[{r}]"

		# if safechain and ctx
		# 	out = "{ctx.c} && {out}"

		return pre + out

	def visit
		left.traverse if left
		right.traverse if right
		return

	def isExpressable
		true

	def alias
		right isa Identifier ? right.alias : super()

	def safechain
		# right.safechain
		String(@op) == '?.' or String(@op) == '?:'

	def cache o
		(right isa Ivar && !left) ? self : super(o)

	def shouldParenthesizeInTernary
		@parens or @cache


# Should change this to just refer directly to the variable? Or VarReference
export class LocalVarAccess < Access

	prop safechain

	def js o
		if right isa Variable and right.type == 'meth'
			return "{right.c}()" unless up isa Call

		right.c

	def variable
		right

	def cache o = {}
		super(o) if o:force
		self

	def alias
		variable.@alias or super()


export class GlobalVarAccess < ValueNode

	def js o
		value.c


export class ObjectAccess < Access


export class PropertyAccess < Access

	def initialize o, l, r
		@traversed = no
		@invert = no
		@parens = no
		@expression = no # yes?
		@cache = null
		@op = o
		@left = l
		@right = r
		return self

	def visit
		@right.traverse if @right
		@left.traverse if @left
		return self

	# right in c we should possibly override
	# to create a call and regular access instead

	def js o

		if var rec = receiver
			var ast = CALL(OP('.',left,right),[]) # convert to ArgList or null
			ast.receiver = rec
			return ast.c

		var up = up

		unless up isa Call
			var ast = CALL(Access.new(op,left,right),[])
			return ast.c

		# really need to fix this - for sure
		# should be possible for the function to remove this this instead?
		var js = "{super(o)}"

		unless (up isa Call or up isa Util.IsFunction)
			js += "()"

		return js


	def receiver
		if left isa SuperAccess || left isa Super
			SELF
		else
			null


export class IvarAccess < Access

	def visit
		@right.traverse if @right
		@left ? @left.traverse : scope__.context
		return self

	def cache
		# WARN hmm, this is not right... when accessing on another object it will need to be cached
		return self


export class ConstAccess < Access


export class IndexAccess < Access

	def cache o = {}
		return super if o:force
		right.cache
		self


export class SuperAccess < Access

	def js o
		var m = o.method
		var up = o.parent
		var deep = o.parent isa Access

		var out = "{left.c}.__super__"

		unless up isa Access
			out += ".{m.supername.c}"
			unless up isa Call # autocall?
				out += ".apply({m.scope.context.c},arguments)"

		return out

	def receiver
		SELF


export class VarOrAccess < ValueNode

	def initialize value
		# should rather call up to valuenode?
		@traversed 	= no
		@parens 	= no
		@value 		= value
		@identifier = value
		@token 		= value.@value
		@variable = null
		self

	# Shortcircuit traverse so that it is not added to the stack?!
	def visit
		# @identifier = value # this is not a real identifier?
		# console.log "VarOrAccess {@identifier}"


		var scope = scope__

		var variable = scope.lookup(value)

		# does not really need to have a declarator already? -- tricky
		if variable && variable.declarator
			# var decl = variable.declarator
			let vscope = variable.scope

			# if the variable is not initialized just yet and we are
			# in the same scope - we should not treat this as a var-lookup
			# ie.  var x = x would resolve to var x = this.x() if x
			# was not previously defined
			if vscope == scope and !variable.@initialized
				# here we need to check if the variable exists outside
				# if it does - we need to ensure that the inner variable does not collide
				let outerVar = scope.parent.lookup(value)
				if outerVar
					variable.@virtual = yes
					variable.@shadowing = outerVar
					variable = outerVar

			# should do this even if we are not in the same scope?
			# we only need to be in the same closure(!)

			if variable and variable.@initialized or (scope.closure != vscope.closure)
				@variable = variable
				variable.addReference(self)
				@value = variable # variable.accessor(self)
				@token.@variable = variable
				
				# if vscope isa RootScope and vscope.context != scope.context and variable.type == 'meth'
				# 	warn "calling method from root scope {value} is deprecated - see issue #112"

				return self

			# FIX
			# @value.safechain = safechain

		# TODO deprecate and remove
		if value.symbol.indexOf('$') >= 0
			# big hack - should disable
			# major hack here, no?
			# console.log "GlobalVarAccess"
			@value = GlobalVarAccess.new(value)
			return self

		# really? what about just mimicking the two diffrent instead?
		# Should we not return a call directly instead?
		@value = PropertyAccess.new(".",scope.context,value)
		# mark the scope / context -- so we can show correct implicit
		@token.@meta = {type: 'ACCESS'}
		# @value.traverse # nah
		self

	def c
		AST.mark(@token) + (@variable ? super() : value.c)

	def js o

		if var v = @variable
			var out = v.c
			out += "()" if v.@type == 'meth' and !(o.up isa Call)
			return out
		return "NONO"

	def node
		@variable ? self : value

	def symbol
		@identifier.symbol
		# value and value.symbol

	def cache o = {}
		@variable ? (o:force and super(o)) : value.cache(o)

	def decache
		@variable ? super() : value.decache
		self

	def dom
		value.dom

	def safechain
		@identifier.safechain

	def dump
		{ loc: loc }

	def loc
		var loc = @identifier.region
		return loc or [0,0]

	def region
		@identifier.region

	def shouldParenthesizeInTernary
		@cache or (@value and @value.@cache) or @parens

	def toString
		"VarOrAccess({value})"

	def toJSON
		{type: typeName, value: @identifier.toString}

#	def js
#		if right isa Variable and right.type == 'meth'
#			return "{right.c}()" unless up isa Call
#
#		right.c
#
#	def variable
#		right
#
#	def cache o = {}
#		super if o:force
#		self
#
#	def alias
#		variable.@alias or super # if resolved?
#

export class VarReference < ValueNode

	# TODO VarBlock should convert these to plain / dumb nodes

	prop variable
	prop declared
	prop type

	def initialize value, type
		if value isa VarOrAccess
			value = value.value
			@variable = null
		elif value isa Variable
			@variable = value
			value = ""

		# for now - this can happen
		super(value)
		@export = no
		@type = type and String(type)
		@declared = yes # just testing now


	def loc
		@value.region

	def set o
		# hack - workaround for hidden classes perf
		@export = yes if o:export
		return self

	def js o
		# experimental fix

		# what about resolving?
		var ref = @variable
		var out = "{AST.mark(@value)}{ref.c}"
		var keyword = o.es5 ? 'var' : (@type or 'var')
		# let might still not work perfectly
		# keyword = 'var' if keyword == 'let'

		if ref && !ref.@declared # .option(:declared)
			if o.up(VarBlock) # up varblock??
				ref.@declared = yes

				# ref.set(declared: yes)
			elif o.isExpression or @export # why?
				ref.autodeclare
			else
				out = "{keyword} {out}"
				ref.@declared = yes
				# ref.set(declared: yes)

		# need to think the export through -- like registering somehow
		# should register in scope - export on analysis++
		if @export
			out = "module.exports.{ref.c} = {ref.c}"

		return out

	def declare
		self

	def consume node
		# really? the consumed node dissappear?
		@variable && @variable.autodeclare
		self

	def visit
		# should be possible to have a VarReference without a name as well? for a system-variable
		# name should not set this way.
		var v = @variable ||= scope__.register(value.toString, self, type: @type)

		# FIXME -- should not simply override the declarator here(!)
		if !v.declarator
			v.declarator = self

		v.addReference(@value) if @value # is this the first reference?

		# only needed when analyzing?
		@value.@value.@variable = v
		self

	def refnr
		variable.references.indexOf(value)

	# convert this into a list of references
	def addExpression expr
		VarBlock.new([self]).addExpression(expr)


# ASSIGN

export class Assign < Op

	def initialize o, l, r

		# workaround until we complete transition from lua-style assignments
		# to always use explicit tuples - then we can move assignments out etc
		# this will not be needed after we remove support for var a,b,c = 1,2,3
		if l isa VarReference and l.value isa Arr
			# converting all nodes to var-references ?
			# do we need to keep it in a varblock at all?
			var vars = l.value.nodes.map do |v|
				# what about inner tuples etc?
				# keep the splats -- clumsy but true
				if v isa Splat
					v.value = VarReference.new(v.value,l.type) unless v.value isa VarReference
				elif v isa VarReference
					true
				else
					# what about retaining location?
					# v = v.value if v isa VarOrAccess
					v = VarReference.new(v,l.type)

				return v

				# v isa VarReference ? v : VarReference.new(v)

			return TupleAssign.new(o,Tuple.new(vars),r)

		if l isa Arr
			return TupleAssign.new(o,Tuple.new(l.nodes),r)

		# set expression yes, no?
		@expression = no
		@traversed = no
		@parens = no
		@cache = null
		@invert = no
		@opToken = o
		@op = o and o.@value or o
		@left = l
		@right = r
		return self

	def isExpressable
		!right || right.isExpressable

	def isUsed
		# really?
		# if up is a block in general this should not be used -- since it should already have received implicit self?
		if up isa Block # && up.last != self
			return no
		return yes

	# FIXME optimize
	def visit
		var l = @left
		var r = @right

		# WARNING - slightly undefined
		# MARK THE STACK
		l.traverse if l

		var lvar = l isa VarReference and l.variable

		# how does this work with constants that are really var references?
		# should work when things are not described as well - but this is for testing
		# but if it refers to something else
		if !lvar and @desc
			# entities should be able to extract the needed info instead
			ROOT.entities.add(l.namepath,{namepath: l.namepath, type: r.typeName, desc: @desc})

		# this should probably be done in a different manner
		if lvar and lvar.declarator == l
			lvar.@initialized = no
			r.traverse if r
			lvar.@initialized = yes

		else
			r.traverse if r

		if l isa VarReference or l.@variable
			l.@variable.assigned(r,self)

		return self

	def c o
		unless right.isExpressable
			if left isa VarReference and left.type == 'let'
				return Block.new([left,BR,right.consume(self)]).c(o)
				
			return right.consume(self).c(o)
		# testing this
		return super(o)

	def js o
		unless right.isExpressable
			p "Assign#js right is not expressable "
			# here this should be go out of the stack(!)
			# it should already be consumed?
			return right.consume(self).c
		var l = left.node
		var r = right

		# We are setting self(!)
		# TODO document functionality
		if l isa Self
			var ctx = scope__.context
			l = ctx.reference


		if l isa PropertyAccess
			var ast = CALL(OP('.',l.left,l.right.setter),[right])
			ast.receiver = l.receiver

			if isUsed
				# dont cache it again if it is already cached(!)
				right.cache(pool: 'val', uses: 1) unless right.cachevar #
				# this is only when used.. should be more clever about it
				ast = Parens.new(AST.blk([ast,right]))

			# should check the up-value no?
			return ast.c(expression: yes)

		# if l isa VarReference
		# 	p "assign var-ref"
		# 	l.@variable.assigned(r)

		# FIXME -- does not always need to be an expression?
		var lc = l.c

		if option(:export)
			let ename = l isa VarReference ? l.variable.c : lc
			return "{lc} {AST.mark(@opToken)}{op} exports.{ename} = {right.c(expression: true)}"
		else
			return "{lc} {AST.mark(@opToken)}{op} {right.c(expression: true)}"
		# return out

	# FIXME op is a token? _FIX_
	# this (and similar cases) is broken when called from
	# another position in the stack, since 'up' is dynamic
	# should maybe freeze up?
	def shouldParenthesize par = up
		@parens or par isa Op && par.op != '='

	def consume node
		if isExpressable
			forceExpression
			return super(node)

		var ast = right.consume(self)
		return ast.consume(node)

	# more workaround during transition away from a,b,c = 1,2,3 style assign
	def addExpression expr
		# p "addExpression {expr}"
		var typ = ExpressionBlock
		if @left and @left isa VarReference
			typ = VarBlock
		# might be better to nest this up after parsing is done?
		var node = typ.new([self])
		return node.addExpression(expr)


export class PushAssign < Assign
	
	prop consumed
	
	def register node
		@consumed ||= []
		@consumed.push(node)
		self
		
	def js o
		"{left.c}.push({right.c})"

	def consume node
		return self

export class TagPushAssign < PushAssign

	def js o
		"{left.c}.push({right.c})"

	def consume node
		return self


export class ConditionalAssign < Assign

	def consume node
		normalize.consume(node)

	def normalize
		var l = left.node
		var ls = l

		if l isa Access
			if l.left
				l.left.cache
			ls = l.clone(l.left,l.right) # this should still be cached?
			l.cache if l isa PropertyAccess # correct now, to a certain degree
			if l isa IndexAccess
				l.right.cache

			# we should only cache the value itself if it is dynamic?
			# l.cache # cache the value as well -- we cannot use this in assigns them

		# some ops are less messy
		# need op to support consume then?
		var expr = right.isExpressable
		var ast = null
		# here we should use ast = if ...
		if expr && op == '||='
			ast = OP('||',l, OP('=',ls,right))
		elif expr && op == '&&='
			ast = OP('&&',l, OP('=',ls,right))
		else
			ast = IF(condition, OP('=',ls,right), l) # do we need a scope for these?
			ast.scope = null
			# drop the scope
			# touch scope -- should probably visit the whole thing?
			# ast.scope.visit
		ast.toExpression if ast.isExpressable
		ast


	def c
		# WARN what if we return the same?
		normalize.c

	def condition

		# use switch instead to cache op access
		if op == '?='
			OP('==',left,NULL)
		elif op == '||='
			OP('!',left)
		elif op == '&&='
			left
		elif op == '!?='
			OP('!=',left,NULL)
		else
			left

	def js o
		var ast = IF(condition, OP('=',left,right), left)
		ast.scope = null # not sure about this
		ast.toExpression if ast.isExpressable # forced expression already
		return ast.c

export class CompoundAssign < Assign

	# FIXME can we merge consume and js?
	def consume node
		return super if isExpressable

		var ast = normalize
		return ast.consume(node) unless ast == self

		ast = right.consume(self)
		return ast.consume(node)

	def normalize
		var ln = left.node
		# we dont need to change this at all
		unless ln isa PropertyAccess
			return self

		if ln isa Access
			# left might be zero?!?!
			ln.left.cache if ln.left
		# TODO FIXME we want to cache the context of the assignment
		var ast = OP('=',left,OP(op[0],left,right))
		ast.toExpression if ast.isExpressable

		return ast

	def c
		var ast = normalize
		return super if ast == self

		# otherwise it is important that we actually replace this node in the outer block
		# whenever we normalize and override c it is important that we can pass on caching
		# etc -- otherwise there WILL be issues.
		var up = STACK.current
		if up isa Block
			# an alternative would be to just pass
			up.replace(self,ast)
		ast.c


export class AsyncAssign < Assign

	# this will transform the tree by a decent amount.
	# Need to adjust Block to allow this


export class TupleAssign < Assign

	prop op
	prop left
	prop right
	prop type

	def initialize a,b,c
		@traversed = no
		@op = a
		@left = b
		@right = c
		@temporary = []

	def isExpressable
		right.isExpressable

	def addExpression expr
		if right isa Tuple
			right.push(expr)
		else
			self.right = Tuple.new([right,expr])

		return self

	def visit
		# if the first left-value is a var-reference, then
		# all the variables should be declared as variables.
		# but if we have complex items in the other list - it does become much harder

		# if the first is a var-reference, they should all be(!) .. or splats?
		# this is really a hacky wao to do it though
		if left.first.node isa VarReference
			self.type = left.first.node.type or 'var' # what about let?
			# should possibly allow real vars as well, no?
			@vars = left.nodes.filter(|n| n isa VarReference)
			# collect the vars for tuple for easy access

			# NOTE can improve.. should rather make the whole left be a VarBlock or TupleVarBlock

		right.traverse
		left.traverse
		self

	def js o
		# only for actual inner expressions, otherwise cache the whole array, no?
		unless right.isExpressable

			return right.consume(self).c

		### a,b,c = arguments ###
		# - direct. no matter if lvalues are variables or not. Make fake arguments up to the same count as tuple

		### a,*b,b = arguments ###
		# Need to convert arguments to an array. IF arguments is not referenced anywhere else in scope,
		# we can do the assignment directly while rolling through arguments

		### a,b = b,a ###
		# ideally we only need to cache the first value (or n - 1), assign directly when possible.

		### a,b,c = (method | expression) ###
		# convert res into array, assign from array. Can cache the variable when assigning first value

		# First we need to find out whether we are required to store the result in an array before assigning
		# If this needs to be an expression (returns?, we need to fall back to the CS-wa)

		var ast = Block.new([])
		var lft = self.left
		var rgt = self.right
		var typ = self.type
		var vartype = typ
		var via = null

		var li   = 0
		var ri   = lft.count
		var llen = ri


		# if @vars
		# 	p "tuple has {@vars:length} vars"

		# if we have a splat on the left it is much more likely that we need to store right
		# in a temporary array, but if the right side has a known length, it should still not be needed
		var lsplat = lft.filter(|v| v isa Splat )[0]

		# if right is an array without any splats (or inner tuples?), normalize it to tuple
		rgt = Tuple.new(rgt.nodes) if rgt isa Arr && !rgt.splat
		var rlen = rgt isa Tuple ? rgt.count : null

		# if any values are statements we need to handle this before continuing

		### a,b,c = 10,20,ary ###
		# ideally we only need to cache the first value (or n - 1), assign directly when possible.
		# only if the variables are not predefined or predeclared can be we certain that we can do it without caching
		# if rlen && typ == 'var' && !lsplat
		# 	# this can be dangerous in edgecases that are very hard to detect
		# 	# if it becomes an issue, fall back to simpler versions
		# 	# does not even matter if there is a splat?

		# special case for arguments(!)
		if !lsplat && rgt == ARGUMENTS

			var pars = scope__.params
			# forcing the arguments to be named
			lft.map do |l,i| ast.push OP('=',l.node,pars.at(i,yes).visit.variable) # s.params.at(value - 1,yes)


		elif rlen
			# we have several items in the right part. what about splats here?

			# pre-evaluate rvalues that might be reference from other assignments
			# we need to check if the rightside values has no side-effects. Cause if
			# they dont, we really do not need temporary variables.

			# some of these optimizations are quite petty - makes things more complicated
			# in the compiler only to get around adding a few temp-variables here and there

			# var firstUnsafe = 0
			# lft.map do |v,i|
			# 	if v isa VarReference
			# 		p "left side {i} {v} {v.refnr}"

			# rgt.map do |v,i|
			# 	if v.hasSideEffects
			# 		# return if i == 0 or !v.hasSideEffects
			# 		# return if v isa Num || v isa Str || i == 0
			# 		# we could explicitly create a temporary variable and adding nodes for accessing etc
			# 		# but the builtin caching should really take care of this for us
			# 		# we need to really force the caching though -- since we need a copy of it even if it is a local
			# 		# we need to predeclare the variables at the top of scope if this does not take care of it
			#
			# 		# these are the declarations -- we need to add them somewhere smart
			# 		@temporary.push(v) # need a generalized way to do this type of thing
			# 		ast.push(v.cache(force: yes, type: 'swap', declared: typ == 'var'))
			# 		# they do need to be declared, no?

			# now we can free the cached variables
			# ast.map do |n| n.decache

			var pre = []
			var rest = []

			var pairs = lft.map do |l,i|
				var v = null
				# determine if this needs to be precached?
				# if l isa VarReference
				# 	# this is the first time the variable is referenced
				# 	# should also count even if it is predeclared at the top
				# 	if l.refnr == 0

				if l == lsplat
					v = ArgList.new([])
					var to = (rlen - (ri - i))
					v.push(rgt.index(li++)) while li <= to
					v = Arr.new(v)
					# ast.push OP('=',l.node,Arr.new(v))
				else
					v = rgt.index(li++)
				[l.node,v]

				# if l isa VarReference && l.refnr
			var clean = true

			pairs.map do |v,i|
				var l = v[0]
				var r = v[1]

				if clean
					if l isa VarReference && l.refnr == 0
						# still clean
						clean = yes
					else
						clean = no
						pairs.slice(i).map do |part|
							if part[1].hasSideEffects
								@temporary.push(part[1]) # need a generalized way to do this type of thing
								ast.push(part[1].cache(force: yes, pool: 'swap', declared: typ == 'var'))

				# if the previous value in ast is a reference to our value - the caching was not needed
				if ast.last == r
					r.decache
					# simple assign
					ast.replace(r,OP('=',l,r))
				else
					ast.push OP('=',l,r)

			# WARN FIXME Is there not an issue with VarBlock vs not here?
		else
			# this is where we need to cache the right side before assigning
			# if the right side is a for loop, we COULD try to be extra clever, but
			# for now it is not worth the added compiler complexity

			# iter.cache(force: yes, type: 'iter')
			# FIXME iter will now be explicitly declared in ast AND in scope?
			var top = VarBlock.new
			var iter = util.iterable(rgt, yes)
			# could set the vars inside -- most likely
			ast.push(top)
			top.push(iter)

			if lsplat
				var len = util.len(iter, yes)
				var idx = util.counter(0, yes)
				# cache the length of the array
				top.push(len) # preassign the length
				# cache counter to loop through
				top.push(idx)

			# only if the block is variable based, no?
			# ast.push(blk = VarBlock.new)
			# blk = null

			var blktype = (vartype) ? VarBlock : Block
			var blk = blktype.new([])

			if vartype
				blk.@type = vartype

			# blk = top if typ == 'var'
			ast.push(blk)

			# if the lvals are not variables - we need to preassign
			# can also use slice here for simplicity, but try with while now
			lft.map do |l,i|
				if l == lsplat
					var lvar = l.node
					var rem = llen - i - 1 # remaining after splat

					if !vartype
						var arr = util.array(OP('-',len, Num.new(i + rem) ),yes)
						top.push(arr)
						lvar = arr.cachevar
					else
						ast.push(blk = blktype.new) unless blk
						var arr = util.array( OP('-',len,Num.new(i + rem) ) )
						blk.push(OP('=',lvar,arr))

					# if !lvar:variable || !lvar.variable # lvar =
					# 	top.push()
					#	p "has variable - no need to create a temp"
					# blk.push(OP('=',lvar,Arr.new([]))) # dont precalculate size now
					# max = to = (rlen - (llen - i))


					var test = rem ? OP('-',len,rem) : len

					var set = OP('=',
						OP('.',lvar,OP('-',idx,Num.new(i))),
						OP('.',iter,OP('++',idx))
					)

					ast.push(WHILE(OP('<',idx,test), set))

					if !vartype
						ast.push(blk = Block.new)
						blk.push(OP('=',l.node,lvar))
					else
						blk = null

					# not if splat was last?
					# ast.push(blk = VarBlock.new)

				elif lsplat
					ast.push(blk = blktype.new) unless blk
					# we could cache the raw code of this node for better performance
					blk.push(OP('=',l,OP('.',iter,OP('++',idx))))
				else
					ast.push(blk = blktype.new) unless blk
					blk.push(OP('=',l,OP('.',iter,Num.new(i) )))

		# if we are in an expression we need to autodecare vars
		if o.isExpression and @vars
			for v in @vars
				v.variable.autodeclare

		elif @vars
			for v in @vars
				v.variable.predeclared

		# is there any reason to make it into an expression?
		if ast.isExpressable # NO!
			# if this is an expression
			var out = ast.c(expression: yes)
			out = "{typ} {out}" if typ and !o.isExpression # not in expression
			return out
		else
			var out = ast.c
			# if this is a varblock
			return out


	def c o
		var out = super(o)
		# this is only used in tuple -- better to let the tuple hav a separate #c
		if @temporary && @temporary:length
			@temporary.map do |temp| temp.decache
		return out



# IDENTIFIERS

# really need to clean this up
# Drop the token?
export class Identifier < Node

	prop safechain
	prop value

	def initialize value
		@value = load(value)
		@symbol = null
		@setter = null

		if ("" + value).indexOf("?") >= 0
			@safechain = yes
		# @safechain = ("" + value).indexOf("?") >= 0
		self

	def references variable
		@value.@variable = variable if @value
		self

	def sourceMapMarker
		@value.sourceMapMarker

	def load v
		return (v isa Identifier ? v.value : v)

	def traverse
		# NODES.push(self)
		self

	def visit

		if @value isa Node
			# console.log "IDENTIFIER VALUE IS NODE"
			@value.traverse
		self

	def region
		[@value.@loc,@value.@loc + @value.@len]

	def isValidIdentifier
		yes

	def isReserved
		@value:reserved or RESERVED_TEST.test(String(@value))

	def symbol
		# console.log "Identifier#symbol {value}"
		@symbol ||= AST.sym(value)

	def setter
		# console.log "Identifier#setter"
		@setter ||= if true
			var tok = Token.new('IDENTIFIER',AST.sym('set-' + @value),@value.@loc or -1)
			Identifier.new(tok)
			# Identifier.new("set-{symbol}")

	def toString
		String(@value)

	def toJSON
		toString

	def alias
		AST.sym(@value)

	def js o
		symbol

	def c
		return '' + symbol # AST.mark(@value) +

	def dump
		{ loc: region }

	def namepath
		toString

	def shouldParenthesizeInTernary
		@parens or @cache

export class TagIdRef < Identifier

	def initialize v
		@value = v isa Identifier ? v.value : v
		self

	def c
		"{scope__.imba.c}.getTagSingleton('{value.c.substr(1)}')"


# This is not an identifier - it is really a string
# Is this not a literal?

# FIXME Rename to IvarLiteral? or simply Literal with type Ivar
export class Ivar < Identifier

	def initialize v
		@value = v isa Identifier ? v.value : v
		self

	def name
		helpers.dashToCamelCase(@value).replace(/^@/,'')
		# value.c.camelCase.replace(/^@/,'')

	def alias
		'_' + name

	# the @ should possibly be gone from the start?
	def js o
		'_' + name

	def c
		'_' + helpers.dashToCamelCase(@value).slice(1) # .replace(/^@/,'') # AST.mark(@value) +

export class Decorator < ValueNode
	
	def visit
		@call.traverse if @call

		if let block = up
			# console.log "visited decorator!!",block
			# add decorator to this scope -- let method empty it
			block.@decorators ||= []
			block.@decorators.push(self)
			# let idx = block.indexOf(self) + 1
			# idx += 1 if block.index(idx) isa Terminator
			# if var next = block.index(idx)
			#	next.@desc = self
		
		


# Ambiguous - We need to be consistent about Const vs ConstAccess
# Becomes more important when we implement typeinference and code-analysis
export class Const < Identifier

	def symbol
		# console.log "Identifier#symbol {value}"
		@symbol ||= AST.sym(value)

	def js o
		@variable ? @variable.c : symbol

	def traverse
		if @traversed
			return

		@traversed = true
		var curr = STACK.current
		if !(curr isa Access) or curr.left == self
			if symbol == "Imba"
				@variable = scope__.imba
			else
				@variable = scope__.lookup(value)
		self

	def c
		if option(:export)
			"exports.{@value} = " + AST.mark(@value) + js
		else
			AST.mark(@value) + js


export class TagTypeIdentifier < Identifier

	prop name
	prop ns

	def initialize value
		@token = value
		@value = load(value)
		self

	def load val

		@str = ("" + val)
		var parts = @str.split(":")
		@raw = val
		@name = parts.pop
		@ns = parts.shift # if any?
		return @str

	def js o
		return "'" + @str + "'"

	def c
		js

	def func
		var name = @name.replace(/-/g,'_').replace(/\#/,'')
		name += "${@ns.toLowerCase}" if @ns
		name

	def isClass
		!!@str.match(/^[A-Z]/)
		# @name[0] == @name[0].toUpperCase and 
		
	def isNative
		!@ns and TAG_TYPES.HTML.indexOf(@str) >= 0
	
	def isSimpleNative
		isNative and !(/input|textarea|select|form|iframe/).test(@str)

	def spawner
		console.log "TagTypeIdentifier shuold never be used"
		if @ns
			"_{@ns.toUpperCase}.{@name.replace(/-/g,'_').toUpperCase}"
		else
			"{@name.replace(/-/g,'_').toUpperCase}"

	def id
		var m = @str.match(/\#([\w\-\d\_]+)\b/)
		m ? m[1] : null


	def flag
		"_" + name.replace(/--/g,'_').toLowerCase

	def sel
		".{flag}" # + name.replace(/-/g,'_').toLowerCase

	def string
		value


export class Argvar < ValueNode

	def c
		# NEXT -- global.parseInt or Number.parseInt (better)
		var v = parseInt(String(value))
		# FIXME Not needed anymore? I think the lexer handles this
		return "arguments" if v == 0

		var s = scope__
		# params need to go up to the closeste method-scope
		var par = s.params.at(v - 1,yes)
		"{AST.c(par.name)}" # c


# CALL

export class Call < Node

	prop callee
	prop receiver
	prop args
	prop block

	def initialize callee, args, opexists
		@traversed = no
		@expression = no
		@parens = no
		@cache = null
		@receiver = null
		@opexists = opexists
		# some axioms that share the same syntax as calls will be redirected from here

		if callee isa VarOrAccess
			var str = callee.value.symbol
			if str == 'extern'
				callee.value.value.@type = 'EXTERN'
				return ExternDeclaration.new(args)
			if str == 'tag'
				# console.log "ERROR - access args by some method"
				return TagWrapper.new(args and args:index ? args.index(0) : args[0])
			if str == 'export'
				return Export.new(args)

		@callee = callee
		@args = args or ArgList.new([])

		if args isa Array
			@args = ArgList.new(args)
			
		if callee isa Decorator
			callee.@call = self
			return callee

		return self

	def visit
		args.traverse
		callee.traverse
		# if the callee is a PropertyAccess - better to immediately change it

		@block && @block.traverse

	def addBlock block
		var pos = @args.filter(|n,i| n == '&')[0] # WOULD BE TOKEN - CAREFUL
		pos ? args.replace(pos,block) : args.push(block)
		self

	def receiver
		@receiver ||= (callee isa Access && callee.left || NULL)

	# check if all arguments are expressions - otherwise we have an issue

	def safechain
		callee.safechain # really?

	def shouldParenthesizeInTernary
		@parens or safechain or @cache

	def js o
		var opt = expression: yes
		var rec = null
		# var args = AST.compact(args) # really?
		var args = args

		# drop this?

		var splat = args.some do |v| v isa Splat

		var out = null
		var lft = null
		var rgt = null
		var wrap = null

		var callee = @callee = @callee.node # drop the var or access?

		# if callee isa Call && callee.safechain
		#	yes

		if callee isa Access
			lft = callee.left
			rgt = callee.right

		if callee isa Super or callee isa SuperAccess
			@receiver = scope__.context
			# return "supercall"

		# never call the property-access directly?
		if callee isa PropertyAccess # && rec = callee.receiver
			@receiver = callee.receiver
			callee = @callee = Access.new(callee.op,callee.left,callee.right)
			# console.log "unwrapping the propertyAccess"

		if rgt isa Identifier and rgt.value == 'len' and args.count == 0
			return Util.Len.new([lft or callee]).c

			# rewrite a.len(..) to len$(a)

		if callee.safechain
			# Does this affect shouldParenthesizeInTernary?
			# if lft isa Call
			# if lft isa Call # could be a property access as well - it is the same?
			# if it is a local var access we simply check if it is a function, then call
			# but it should be safechained outside as well?
			# lft.cache if lft
			# the outer safechain should not cache the whole call - only ask to cache
			# the result? -- chain onto
			var isfn = Util.IsFunction.new([callee])
			wrap = ["{isfn.c}  &&  ",""]
			callee = OP('.',callee.left,callee.right)
			# callee should already be cached now -

		# should just force expression from the start, no?
		if splat
			# important to wrap the single value in a value, to keep implicit call
			# this is due to the way we check for an outer Call without checking if
			# we are the receiver (in PropertyAccess). Should rather wrap in CallArguments
			let rec = receiver
			var ary = (args.count == 1 ? ValueNode.new(args.first.value) : Arr.new(args.list))

			rec.cache # need to cache the context as it will be referenced in apply
			out = "{callee.c(expression: yes)}.apply({rec.c},{ary.c(expression: yes)})"

		elif @receiver
			# quick workaround
			@receiver.cache unless @receiver isa ScopeContext
			args.unshift(receiver)
			# should rather rewrite to a new call?
			out = "{callee.c(expression: yes)}.call({args.c(expression: yes)})"

		else
			out = "{callee.c(expression: yes)}({args.c(expression: yes)})"

		if wrap
			# we set the cachevar inside
			if @cache
				@cache:manual = yes
				out = "({cachevar.c}={out})"

			out = [wrap[0],out,wrap[1]].join("")

		return out




export class ImplicitCall < Call

	def js o
		"{callee.c}()"

export class New < Call

	def js o
		var target = callee

		while target isa Access
			let left = target.left

			if (left isa PropertyAccess) or (left isa VarOrAccess)
				callee.@parens = yes
				break

			target = left

		var out = "new {callee.c}"
		out += '()' unless o.parent isa Call
		out

export class SuperCall < Call

	def js o
		var m = o.method
		self.receiver = SELF
		self.callee = "{m.target.c}.super$.prototype.{m.name.c}"
		super



export class ExternDeclaration < ListNode

	def visit
		nodes = map do |item| item.node # drop var or access really
		# only in global scope?
		var root = scope__
		for item in nodes
			var variable = root.register item.symbol, item, type: 'global'
			variable.addReference(item)
		self

	def c
		"// externs"


# FLOW

export class ControlFlow < Node

	def loc
		@body ? @body.loc : [0,0]

export class ControlFlowStatement < ControlFlow

	def isExpressable
		no



export class If < ControlFlow

	prop test
	prop body
	prop alt
	prop scope
	prop prevIf

	def self.ternary cond, body, alt
		# prefer to compile it this way as well
		var obj = If.new(cond, Block.new([body]), type: '?')
		obj.addElse Block.new([alt])
		return obj

	def addElse add
		if alt && alt isa If
			alt.addElse(add)
		else
			self.alt = add
			if add isa If
				add.prevIf = self
		self

	def initialize cond, body, o = {}
		setup
		@test = cond # (o:type == 'unless' ? UnaryOp.new('!',cond,null) : cond)
		@body = body
		@alt  = null
		@type = o:type
		invert if @type == 'unless'
		@scope = IfScope.new(self)
		self

	def loc
		@loc ||= [@type ? @type.@loc : 0,body.loc[1]]

	def invert
		if @test isa ComparisonOp
			@test = @test.invert
		else
			@test = UnaryOp.new('!',@test,null)

	def visit stack
		var alt = alt

		@scope.visit if @scope
		test.traverse if test
		
		@tag = stack.@tag
		
		if @tag
			@tag.set(hasConditionals: yes)

		# console.log "vars in if",Object.keys(@scope.varmap)
		for own name, variable of @scope.varmap
			if variable.type == 'let'
				variable.@virtual = yes

		# the let-variables declared in if(*test*) should be
		# local to the inner scope, but will technically be
		# declared in the outer scope. Must get unique name

		unless stack.isAnalyzing
			@pretest = AST.truthy(test)

			if @pretest === true
				alt = @alt = null

			elif @pretest === false
				loc # cache location before removing body
				body = null

		body.traverse if body

		# should skip the scope in alt.
		if alt
			STACK.pop(self)
			alt.@scope ||= BlockScope.new(alt)
			alt.traverse
			STACK.push(self)

		# force it as expression?
		toExpression if @type == '?' and isExpressable
		self


	def js o
		var body = body
		# would possibly want to look up / out
		var brace = braces: yes, indent: yes

		if @pretest === true and false
			# what if it is inside expression?
			let js = body ? body.c(braces: !!prevIf) : 'true'

			unless prevIf
				js = helpers.normalizeIndentation(js)

			if o.isExpression
				js = '(' + js + ')'

			return js

		elif @pretest === false and false
			alt.prevIf = prevIf if alt isa If
			let js = alt ? alt.c(braces: !!prevIf) : ''

			unless prevIf
				js = helpers.normalizeIndentation(js)

			return js
		

		if o.isExpression

			if test?.shouldParenthesizeInTernary
				test.@parens = yes

			var cond = test.c(expression: yes) # the condition is always an expression

			var code = body ? body.c : 'true' # (braces: yes)

			if body and body.shouldParenthesizeInTernary
				code = '(' + code + ')' # if code.indexOf(',') >= 0

			if alt
				var altbody = alt.c
				if alt.shouldParenthesizeInTernary
					altbody = '(' + altbody + ')'

				return "{cond} ? {code} : {altbody}"
			else
				# again - we need a better way to decide what needs parens
				# maybe better if we rewrite this to an OP('&&'), and put
				# the parens logic there
				# cond should possibly have parens - but where do we decide?
				if @tag
					return "{cond} ? {code} : void(0)"
				else
					return "{cond} && {code}"
		else
			# if there is only a single item - and it is an expression?
			var code = null
			var cond = test.c(expression: yes) # the condition is always an expression

			# if body.count == 1 # dont indent by ourselves?

			if body isa Block and body.count == 1 and !(body.first isa LoopFlowStatement)
				body = body.first

			# if body.count == 1
			#	p "one item only!"
			#	body = body.first

			code = body ? body.c(braces: yes) : '{}' # (braces: yes)

			# don't wrap if it is only a single expression?
			var out = "{AST.mark(@type)}if ({cond}) " + code # ' {' + code + '}' # '{' + code + '}'
			out += " else {alt.c(alt isa If ? {} : brace)}" if alt
			out

	def sourceMapMarker
		self

	def shouldParenthesize
		!!@parens

	def consume node
		if node isa TagPushAssign
			@body = @body.consume(node) if @body
			@alt = @alt.consume(node) if @alt
			return self

		# special case for If created from conditional assign as well?
		# @type == '?' and
		# ideally we dont really want to make any expression like this by default
		var isRet = node isa Return

		# might have been forced to expression already
		# if it was originally a ternary - why not
		if @expression or ((!isRet or @type == '?') and isExpressable)
			toExpression # mark as expression(!) - is this needed?
			return super(node)
		else
			@body = @body.consume(node) if @body
			@alt = @alt.consume(node) if @alt
		self


	def isExpressable
		# process:stdout.write 'x'
		var exp = (!body || body.isExpressable) && (!alt || alt.isExpressable)
		return exp



export class Loop < Statement


	prop scope
	prop options
	prop body
	prop catcher

	def loc
		var a = @options:keyword
		var b = @body

		if a and b
			# FIXME does not support POST_ variants yet
			[a.@loc,b.loc[1]]
		else
			[0,0]

	def initialize options = {}
		@traversed = no
		@options = options
		@body = null
		self

	def set obj
		@options ||= {}
		var keys = Object.keys(obj)
		for k in keys
			@options[k] = obj[k]
		self


	def addBody body
		self.body = AST.blk(body)
		self


	def c o

		var s = stack
		var curr = s.current



		if stack.isExpression or isExpression
			# what the inner one should not be an expression though?
			# this will resut in an infinite loop, no?!?
			scope.closeScope
			var ast = CALL(FN([],[self]),[])
			return ast.c o

		elif stack.current isa Block or (s.up isa Block and s.current.@consumer == self)
			super.c o
		else
			scope.closeScope
			var ast = CALL(FN([],[self]),[])
			# scope.context.reference
			return ast.c o
			# need to wrap in function



export class While < Loop

	prop test

	def initialize test, opts
		@traversed = no
		@test = test
		@options = opts or {}
		@scope = WhileScope.new(self)
		# set(opts) if opts
		if option(:invert)
			# "invert test for while {@test}"
			@test = test.invert
		# invert the test


	def visit
		scope.visit
		test.traverse if test
		body.traverse if body

	def loc
		var o = @options
		helpers.unionOfLocations(o:keyword,@body,o:guard,@test)

	# TODO BUG -- when we declare a var like: while var y = ...
	# the variable will be declared in the WhileScope which never
	# force-declares the inner variables in the scope

	def consume node
		# This is never expressable, but at some point
		# we might want to wrap it in a function (like CS)
		return super if isExpressable

		if node isa TagTree
			console.log "While.consume TagTree"
			# WARN this is a hack to allow references coming through the wrapping scope
			# will result in unneeded self-declarations and other oddities
			scope.closeScope
			return CALL(FN([],[self]),[])

		var reuse = no
		# WARN Optimization - might have untended side-effects
		# if we are assigning directly to a local variable, we simply
		# use said variable for the inner res
		# if reuse
		# 	resvar = scope.declare(node.left.node.variable,Arr.new([]),proxy: yes)
		# 	node = null
		# 	p "consume variable declarator!?".cyan
		# else
		# declare the variable we will use to soak up results
		# TODO Use a special vartype for this?
		var resvar = scope.declare(:res,Arr.new([]),system: yes)
		# WHAT -- fix this --
		@catcher = PushAssign.new("push",resvar,null) # the value is not preset # what
		body.consume(@catcher) # should still return the same body

		# scope vars must not be compiled before this -- this is important
		var ast = Block.new([self,resvar.accessor]) # should be varaccess instead?
		ast.consume(node)
		# NOTE Here we can find a way to know wheter or not we even need to
		# return the resvar. Often it will not be needed
		# FIXME what happens if there is no node?!?


	def js o
		var out = "while ({test.c(expression: yes)})" + body.c(braces: yes, indent: yes) # .wrap

		if scope.vars.count > 0
			return [scope.vars.c,out]
		out



# This should define an open scope
# should rather
export class For < Loop

	def initialize o = {}
		@traversed = no
		@options = o
		@scope = ForScope.new(self)
		@catcher = null

	def loc
		var o = @options
		helpers.unionOfLocations(o:keyword,@body,o:guard,o:step,o:source)
	
	def traverse
		let stack = STACK
		if stack.@tag and !@scope.@tagLoop
			stack.@tag.set(hasLoops: yes)
			let fn = @scope.@tagLoop = TagLoopFunc.new([],[self])
			stack.current.swap(self,fn)
			fn.traverse
		else
			super


	def visit stack
		scope.visit

		options[:source].traverse # what about awakening the vars here?
		declare

		# add guard to body
		if options:guard
			var op = IF(options:guard.invert,Block.wrap([ContinueStatement.new("continue")]))
			body.unshift(op,BR)
		
			
		body.traverse
	

	def isBare src
		src and src.@variable and src.@variable.@isArray

	def declare
		var o = options
		var scope = scope
		var src  = o:source
		var vars = o[:vars] = {}
		var oi   = o:index

		var bare = isBare(src)

		# what about a range where we also include an index?
		if src isa Range
			
			let from = src.left
			let to = src.right
			let dynamic = from !isa Num or to !isa Num

			if to isa Num
				vars:len = to
			else
				# vars:len = scope.vars.push(vars:index.assignment(src.left))
				# vars:len = to.cache(force: yes, pool: 'len').predeclare
				vars:len = scope.declare('len',to,type: 'let')
				# to.cache(force: yes, pool: 'len').predeclare
				
			# scope.vars.push(vars:index.assignment(src.left))
			vars:value = scope.declare(o:name,from,type: 'let')
			vars:value.addReference(o:name) if o:name
			
			if o:index
				vars:index = scope.declare(o:index,0,type: 'let')
				vars:index.addReference(o:index)
			else
				vars:index = vars:value
				
			if dynamic
				vars:diff = scope.declare('rd',OP('-',vars:len,vars:value),type: 'let')

		else
			if oi
				vars:index = scope.declare(oi,0,type: 'let')
			else
				vars:index = scope.declare('i',Num.new(0),system: yes, type: 'let', pool: 'counter')

			vars:source = bare ? src : scope.declare('items',util.iterable(src),system: yes, type: 'let', pool: 'iter')
			vars:len = scope.declare('len',util.len(vars:source),type: 'let', pool: 'len', system: yes)

			vars:value = scope.declare(o:name,null,type: 'let')
			vars:value.addReference(o:name) # adding reference!
			vars:index.addReference(oi) if oi

		return self

	def consume node

		if isExpressable
			return super

		if @resvar
			var ast = Block.new([self,BR,@resvar.accessor])
			ast.consume(node)
			return ast

		var resvar = null
		var reuseable = no # node isa Assign && node.left.node isa LocalVarAccess
		var assignee = null
		# might only work for locals?
		if node isa Assign
			if var receiver = node.left
				if assignee = receiver.@variable
					# we can only pull the var reference into the scope
					# if we know that the variable is declared in this scope
					reuseable = (receiver isa VarReference)

		resvar = @resvar ||= scope.register(:res,null,system: yes, type: 'var')

		@catcher = PushAssign.new("push",resvar,null) # the value is not preset
		let resval = Arr.new([])
		body.consume(@catcher) # should still return the same body

		if node
			let block = [self,BR,resvar.accessor.consume(node)]

			if @resvar
				block.unshift(BR)
				block.unshift(OP('=',VarReference.new(@resvar,'let'),resval))

			var ast = Block.new(block)
			return ast

		return self

	def js o
		var vars = options:vars
		var idx = vars:index
		var val = vars:value
		var src = options:source
		
		var cond
		var final

		if src isa Range
			let a = src.left
			let b = src.right
			let inc = src.inclusive

			cond = OP(inc ? '<=' : '<',val,vars:len)
			final = OP('++',val)

			if vars:diff
				cond = If.ternary( OP('>',vars:diff,Num.new(0)), cond, OP(inc ? '>=' : '>',val,vars:len))
				final = If.ternary( OP('>',vars:diff,Num.new(0)),OP('++',val),OP('--',val))
			
			if idx and idx != val
				final = ExpressionBlock.new([final,OP('++',idx)])
			
		else
			cond = OP('<',idx,vars:len)
			
			if val.refcount < 3 and val.assignments:length == 0 and !val.@noproxy
				val.proxy(vars:source,idx)
			else
				body.unshift(OP('=',val,OP('.',vars:source,idx)), BR)

			if options:step
				final = OP('=',idx,OP('+',idx,options:step))
			else
				final = OP('++',idx)

		var code = body.c(braces: yes, indent: yes)
		var head = "{AST.mark(options:keyword)}for ({scope.vars.c}; {cond.c(expression: yes)}; {final.c(expression: yes)}) "
		return head + code



export class ForIn < For



export class ForOf < For

	def declare
		var o = options
		var vars = o:vars = {}
		var k
		var v

		# possibly proxy the index-variable?

		if o:own
			vars:source = o:source.@variable || scope.declare('o',o:source, system: true, type: 'let')
			v = vars:value = scope.declare(o:index,null,let: yes, type: 'let') if o:index
			var i = vars:index = scope.declare('i',Num.new(0),system: yes, type: 'let', pool: 'counter')

			# systemvariable -- should not really be added to the map
			var keys = vars:keys = scope.declare('keys',Util.keys(vars:source.accessor),system: yes, type: 'let') # the outer one should resolve first
			var l = vars:len = scope.declare('l',Util.len(keys.accessor),system: yes, type: 'let')
			k = vars:key = scope.declare(o:name,null,type: 'let') # scope.declare(o:name,null,system: yes)
		else
			# we set the var -- why even declare it
			# no need to declare -- it will declare itself in the loop - no?
			vars:source = o:source.@variable || scope.temporary(o:source, system: yes, pool: 'dict', type: 'let')
			v = vars:value = scope.declare(o:index,null,let: yes, type: 'let') if o:index
			k = vars:key = scope.register(o:name,o:name,type: 'let')

		# TODO use util - why add references already? Ah -- this is for the highlighting
		v.addReference(o:index) if v and o:index
		k.addReference(o:name) if k and o:name

		self

	def js o
		var vars = options:vars
		var osrc = options:source
		var src = vars:source
		var k = vars:key
		var v = vars:value
		var i = vars:index

		var code

		if options:own
			if v and v.refcount > 0
				body.unshift(OP('=',v,OP('.',src,k)))

			# if k.refcount < 3 # should probably adjust these
			#	k.proxy(vars:keys,i)
			# else
			body.unshift(OP('=',k,OP('.',vars:keys,i)))
			code = body.c(indent: yes, braces: yes) # .wrap
			var head = "{AST.mark(options:keyword)}for ({scope.vars.c}; {OP('<',i,vars:len).c}; {OP('++',i).c})"
			return head + code

		else
			if v and v.refcount > 0
				body.unshift(OP('=',v,OP('.',src,k)))

			code = scope.c(braces: yes, indent: yes)
			let inCode = osrc.@variable ? src : (OP('=',src,osrc))
			# it is really important that this is a treated as a statement
			"{AST.mark(options:keyword)}for ({o.es5 ? 'var' : 'let'} {k.c} in {inCode.c(expression: yes)})" + code

	def head
		var v = options:vars

		[
			OP('=',v:key,OP('.',v:keys,v:index))
			OP('=',v:value,OP('.',v:source,v:key)) if v:value
		]

# NO NEED?
export class Begin < Block


	def initialize body
		@nodes = AST.blk(body).nodes


	def shouldParenthesize
		isExpression



export class Switch < ControlFlowStatement


	prop source
	prop cases
	prop fallback


	def initialize a,b,c
		@traversed = no
		@source = a
		@cases = b
		@fallback = c


	def visit
		c.traverse for c in cases
		fallback.visit if fallback
		source.visit if source
		return


	def consume node
		# TODO work inside tags (like loops)
		@cases = @cases.map(|item| item.consume(node))
		@fallback = @fallback.consume(node) if @fallback
		self

	def c o
		if stack.isExpression or isExpression
			var ast = CALL(FN([],[self]),[])
			return ast.c o

		super.c(o)


	def js o
		var body = []

		for part in cases
			part.autobreak
			body.push(part)

		if fallback
			body.push("default:\n" + fallback.c(indent: yes))

		"switch ({source.c}) " + helpers.bracketize(AST.cary(body).join("\n"),yes)



export class SwitchCase < ControlFlowStatement


	prop test
	prop body


	def initialize test, body
		@traversed = no
		@test = test
		@body = AST.blk(body)
		@scope = BlockScope.new(self)

	def visit
		scope__.visit
		body.traverse

	def consume node
		body.consume(node)
		self


	def autobreak
		body.push(BreakStatement.new) unless body.last isa BreakStatement
		self


	def js o
		@test = [@test] unless @test isa Array
		var cases = @test.map do |item| "case {item.c}: "
		cases.join("\n") + body.c(indent: yes, braces: yes)



export class Try < ControlFlowStatement


	prop body
	# prop ncatch
	# prop nfinally

	def initialize body, c, f
		@traversed = no
		@body = AST.blk(body)
		@catch = c
		@finally = f


	def consume node
		@body = @body.consume(node)
		@catch = @catch.consume(node) if @catch
		@finally = @finally.consume(node) if @finally
		self


	def visit
		@body.traverse
		@catch.traverse if @catch
		@finally.traverse if @finally
		# no blocks - add an empty catch


	def js o
		var out = "try " + body.c(braces: yes, indent: yes)
		out += " " + @catch.c if @catch
		out += " " + @finally.c if @finally

		unless @catch or @finally
			out += " catch (e) \{ \}"
		out += ";"
		out



export class Catch < ControlFlowStatement

	prop body

	def initialize body, varname
		@traversed = no
		@body = AST.blk(body or [])
		@scope = CatchScope.new(self)
		@varname = varname
		self

	def consume node
		@body = @body.consume(node)
		self


	def visit
		@scope.visit
		@variable = @scope.register(@varname,self,pool: 'catchvar')
		@body.traverse


	def js o
		# only indent if indented by default?
		"catch ({@variable.c}) " + @body.c(braces: yes, indent: yes)


# repeating myself.. don't deal with it until we move to compact tuple-args
# for all astnodes


export class Finally < ControlFlowStatement

	def initialize body
		@traversed = no
		@body = AST.blk(body or [])


	def visit
		@body.traverse


	def consume node
		# swallow silently
		self


	def js o
		"finally " + @body.c(braces: yes, indent: yes)


# RANGE

export class Range < Op

	def inclusive
		op == '..'

	def c
		"range"


export class Splat < ValueNode

	def js o
		var par = stack.parent
		if par isa ArgList or par isa Arr
			"[].slice.call({value.c})"
		else
			p "what is the parent? {par}"
			"SPLAT"

	def node
		value





# TAGS

var TAG_TYPES = {}
var TAG_ATTRS = {}

TAG_TYPES.HTML = "a abbr address area article aside audio b base bdi bdo big blockquote body br
 button canvas caption cite code col colgroup data datalist dd del details dfn
 div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6
 head header hr html i iframe img input ins kbd keygen label legend li link
 main map mark menu menuitem meta meter nav noscript object ol optgroup option
 output p param pre progress q rp rt ruby s samp script section select small
 source span strong style sub summary sup table tbody td textarea tfoot th
 thead time title tr track u ul var video wbr".split(" ")
 
TAG_TYPES.HTML_OPT = "abbr address area article aside audio b base bdi bdo big blockquote body br
 button canvas caption cite code col colgroup dd del details dfn
 div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6
 head header hr html i img ins kbd keygen label legend li link
 main mark meta meter nav noscript object ol optgroup option
 output p param pre q rp rt ruby s samp script section small
 source span strong style sub summary sup table tbody td tfoot th
 thead time title tr track u ul wbr".split(" ")

TAG_TYPES.SVG = "circle defs ellipse g line linearGradient mask path pattern polygon polyline
radialGradient rect stop svg text tspan".split(" ")

TAG_ATTRS.HTML = "accept accessKey action allowFullScreen allowTransparency alt async
 autoComplete autoFocus autoPlay cellPadding cellSpacing charSet checked
 className cols colSpan content contentEditable contextMenu controls coords
 crossOrigin data dateTime defer dir disabled download draggable encType form
 formNoValidate frameBorder height hidden href hrefLang htmlFor httpEquiv icon
 id label lang list loop max maxLength mediaGroup method min multiple muted
 name noValidate pattern placeholder poster preload radioGroup readOnly rel
 required role rows rowSpan sandbox scope scrollLeft scrolling scrollTop
 seamless selected shape size span spellCheck src srcDoc srcSet start step
 style tabIndex target title type useMap value width wmode"

TAG_ATTRS.SVG = "cx cy d dx dy fill fillOpacity fontFamily fontSize fx fy gradientTransform
 gradientUnits markerEnd markerMid markerStart offset opacity
 patternContentUnits patternUnits points preserveAspectRatio r rx ry
 spreadMethod stopColor stopOpacity stroke strokeDasharray strokeLinecap
 strokeOpacity strokeWidth textAnchor transform version viewBox x1 x2 x y1 y2 y"

export class TagCache < Node

	def initialize root, value, o = {}
		@options = o
		@root = root
		@value = value
		@counter = 0
		@index = 0
		@blocks = 1
		@refs = []

	def nextRef node
		let item = TagCacheKey.new(self,node)
		@refs.push(item)
		return item
	
	def nextValue
		let ref = AST.counterToShortRef(@counter++)
		option(:lowercase) ? ref.toLowerCase : ref

	def nextSlot
		@index++
		if @options:keys
			Str.new("'" + AST.counterToShortRef(@index - 1) + "'")
		else
			Num.new(@index - 1)
	
	def nextBlock
		@blocks++
		Num.new(@blocks - 1)
		
	def c
		"{@value.c}"
		
export class TagCacheKey < Node	
	prop node
	prop value

	def initialize cache, node
		@owner = cache
		@value = cache.nextSlot
		@node = node
		@type = null
		self
		
	def cache
		self
		
	def c
		@value ||= @owner.nextSlot
		return @value
		
	def arg
		@arg ||= OP('||',OP('.',@owner,@value),CALL(OP('.',@owner,'$'+@type),[]))


export class TagPart < Node

	prop name
	prop value
	
	def initialize value, owner
		@name = value
		@tag = owner
		@chain = []
		@special = no
		self
		
	def isSpecial
		@special
		
	def visit
		@chain.map(|v| v.traverse )
		@value.traverse if @value
		@name.traverse if @name:traverse
		self
	
	def quoted
		@quoted ||= helpers.singlequote(@name)
		
	def isStatic
		!value or value.isPrimitive
		
	def add item, type
		if type == TagArgList
			@last.params = item
		else
			@chain.push(@last = TagModifier.new(item))
		return self
		
	def js
		""

export class TagId < TagPart

	def js
		"setId({quoted})"

export class TagFlag < TagPart
	def js
		value ? "flagIf({quoted},{value.c})" : "flag({quoted})"

export class TagFlagExpr < TagFlag
	def slot
		@slot ?= @tag.nextSlot('flag')
		
	def visit
		@name.traverse
		
	def isStatic
		!@name or @name.isPrimitive
	
	def js
		"setFlag({slot},{name.c})"
	
export class TagSep < TagPart
	
export class TagArgList < TagPart
	
export class TagAttr < TagPart

	def isSpecial
		String(@name) == 'value'

	def js
		let ns = null
		let key = String(@name)
		let i = key.indexOf(':')
		
		if i >= 0
			ns = key.slice(0,i)
			key = key.slice(i + 1)
		
		let dyn = @chain:length or @tag.type.@ns
		let val = value ? value.js : quoted
		let add = ''
		
		if @chain:length
			add = ',{' + @chain.map(|mod| "{mod.name}:1" ).join(',') + '}'
			
		if key == 'value' and !ns
			add += ',1'
		
		if ns == 'css'
			"css('{key}',{val}{add})"
		elif ns
			# should be setPath instead?
			"setNestedAttr('{ns}','{key}',{val}{add})"
		elif key.indexOf("data-") == 0
			"dataset('{key.slice(5)}',{val})"
		elif dyn
			"set({quoted},{val}{add})"
		else
			"{helpers.setterSym(name)}({val}{add})"
	
export class TagAttrValue < TagPart
	
	def isPrimitive
		value.isPrimitive

	def value
		name

	def js
		value.c
	
export class TagModifier < TagPart	
	prop params
	
	def isPrimitive
		!params or params.every do |param| param.isPrimitive
			
	def visit
		@params.traverse if @params
		self
		
	def js
		if params
			"[{quoted},{params.c}]"
		else
			quoted

export class TagData < TagPart
	
	def value
		name

	def isStatic
		!value or value.isPrimitive
	
	def isSpecial
		true

	def js
		var val = value

		if val isa ArgList
			val = val.values[0]
			
		if val isa Parens
			val = val.value
		
		if val isa VarOrAccess
			val = val.@variable or val.value
		# console.log "TagData value {val}"

		if val isa Access
			let left = val.left
			let right = val.right isa Index ? val.right.value : val.right
			
			if val isa IvarAccess
				left ||= val.scope__.context
			
			let pars = [left.c,right.c]
			
			if val isa PropertyAccess
				pars.push('[]')
				
			if right isa Identifier
				pars[1] = "'" + pars[1] + "'"

			"bindData({pars.join(',')})"
		else
			"setData({val.c})"

export class TagHandler < TagPart

	def slot
		@slot ?= @tag.nextSlot('handler')
		
	def isStatic
		let valStatic = !value or value.isPrimitive or (value isa Func and !value.nonlocals)
		valStatic and @chain.every(do |item|
			let val = item isa Parens ? item.value : item
			val isa Func ? !val.nonlocals : val.isPrimitive
		)
	
	def add item, type
		if type == TagArgList
			# could be dynamic
			@last.params = item
			# unless @last.isPrimitive
			# 	@dyn ||= []
			# 	@dyn.push(@chain:length)

		elif type == TagAttrValue
			# really?
			if item isa Parens
				item = item.value
			
			value = item
			# value.@isStatic = value.isPrimitive or (value isa Func and !value.nonlocals)
			# console.log "push Value to chain {item} {item.isPrimitive}"
			# @chain.push(item)
			@last = null
		else
			# console.log "TagHandler add",item
			@chain.push(@last = TagModifier.new(item))
		return self
		
	def js o
		let parts = [quoted].concat(@chain)
		parts.push(value) if value
		# if !value.isPrimitive and !(value isa Func and !value.nonlocals)
		# 	@dyn ||= []
		# 	@dyn.push(parts:length)
		# find the context
		return "on$({slot},[{AST.cary(parts)}],{scope__.context.c})"

		#		let dl = @dyn and @dyn:length
		#
		#		if dl == 1
		#			"on$({slot},[{AST.cary(parts)}],{@dyn[0]})"
		#		elif dl > 1
		#			"on$({slot},[{AST.cary(parts)}],-1)"
		#		else
		#			"on$({slot},[{AST.cary(parts)}],0)"

export class Tag < Node

	prop tree

	def initialize o = {}
		@traversed = no
		@options = o
		@reference = null
		@attributes = o:attributes or []
		@attrmap = {}
		@children = []
		@slots = {
			flag: isSelf ? -1 : 0
			handler: isSelf ? -1 : 0
		}
		self
		
	def nextSlot type
		let slot = @slots[type]
		@slots[type] += (isSelf ? -1 : 1)
		return slot

	def addPart part, type
		let curr = @attributes.CURRENT

		if type == TagId
			set(id: part)

		if type == TagSep
			@attributes.CURRENT = null
		elif curr isa TagHandler
			curr.add(part,type)
		elif type == TagAttrValue
			if curr
				curr.value = type.new(part,@self)
		elif curr isa TagAttr
			curr.add(part,type)
		else
			@attributes.push(@attributes.CURRENT = type.new(part,self))
			
			if type == TagAttr
				@attrmap[String(part)] = @attributes.CURRENT
		self
		
	def addChild child
		@children.push(child)
		self

	def enclosing
		(@options:close and @options:close.value)

	def type
		@options:type || :div
		
	def parent
		@options:par
		
	def isSelf
		type isa Self or type isa This
		
	def isNative
		type isa TagTypeIdentifier and type.isSimpleNative
		
	def isStatic
		let o = @options
		!o:hasConditionals and !o:hasLoops and !o:ivar and !o:key

	def visit stack
		var o = @options
		var scope = @tagScope = scope__
		let prevTag = o:par = stack.@tag
		let po = prevTag and prevTag.@options
		var typ = enclosing
		
		if o:par
			o:optim = po:optim
		elif o:template
			o:optim = no
		else
			o:optim = self

		if typ == '->' or typ == '=>'
			let body = Block.wrap(o:body.@nodes or [o:body])
			@fragment = o:body = o:template = TagFragmentFunc.new([],body,null,null,closed: typ == '->')
			# could insert generated <self> inside to simplify and optimize this?
			# template uses wrong cache as well
			@tagScope = @fragment.scope
			o:optim = self

		# # create fully dynamic tag
		# o:isRoot = yes
		# let dynamics = @attributes
		# let inner = Tag.new(type: This.new, body: o:body, attributes: dynamics)
		# @attributes = []
		# var param = RequiredParam.new(Identifier.new('$$'))
		# o:body = o:template = TagFragmentFunc.new([],Block.wrap([inner],[]),null,null,closed: true)
		
		if o:par
			o:par.addChild(self)
		
			if o:par.@tagLoop
				o:loop ||= o:par.@tagLoop # scope.@tagLoop
				o:loop.capture(self)
				o:ownCache = yes
				o:optim = self
				
			if po:template
				o:optim = self
		
		if o:key and !o:par
			o:treeRef = o:key
			o:key.cache
			
		stack.@tag = null

		for part in @attributes
			part.traverse
			
		stack.@tag = self
			
		cacheRef

		o:key.traverse if o:key
		o:body.traverse if o:body

		# see if we are dynamic
		if o:body isa ListNode and stack.optlevel > 1 # and stack.env('TAG_OPTIM')
			let canOptimize = o:body.values.every do |item|
				item isa Tag and item.isStatic
				
			if o:canOptimize = canOptimize
				o:optim = self
			# should not happen to items inside the loop
			# optimizations should be gone over at the very end.
			# for all tags connected to this?
			for child in @children
				let co = child.@options
				if o:hasConditionals and co:optim
					# console.log "optim child special?"
					co:optim = child
				elif !co:loop
					co:optim = self
		
		if stack.optlevel < 2
			o:optim = no
		stack.@tag = prevTag
		self

	def reference
		@reference ||= @tagScope.closure.temporary(self,pool: 'tag').resolve
	
	def factory
		scope__.imbaRef('createElement')
	
	# reference to the cache-object this tag will try to register with
	def cacher
		var o = @options
		o:cacher ?= if o:key and parent and false
			# declare 
			let tagmap = scope__.imbaRef('createTagMap')
			# if parent childCacher is declared inline this will not work(!)
			let op = OP('||=',OP('.',parent.childCacher,'$$'),LIT('{}'))
			TagCache.new(self,@tagScope.closure.declare("$",op, system: yes, type: 'let'))
		elif parent
			parent.childCacher
		elif o:ivar or o:key
			let op = OP('||=',OP('.',This.new,'$$'),LIT('{}'))
			# MAKE SURE WE REFER TO THE OUTER
			TagCache.new(self,@tagScope.closure.declare("$",op, system: yes, type: 'let'))
		else
			null
		
	def childCacher
		@options:childCacher ||= if @fragment
			let scop = @tagScope.closure
			# TagCache.new(self,@tagScope.closure.declare("$",op,system: yes))
			TagCache.new(self,scop.declare("$",OP('.',This.new,'$'),system: yes))

		elif isSelf
			let scop = @tagScope.closure
			let op = OP('.',This.new,'$')
			# let nr = scop.incr('selfTag')
			let meth = scop isa MethodScope ? scop.node.name : ''
			# let key = "${nr}"
			if meth and meth != 'render'
				let key = '$' + meth + '$'
				let ctor = scope__.imbaRef('createTagCache')
				op = OP('||=',OP('.',op,key),CALL(ctor,[This.new]))

			scop.@tagCache ||= TagCache.new(self,scop.declare("$",op,system: yes))

		elif !parent or @options:ownCache
			TagCache.new(self,OP('.',reference,'$'), keys: yes) # .set(keys: yes)
		else
			parent.childCacher

	def cacheRef
		if isSelf or !cacher
			return null

		var o = @options

		if o:treeRef
			return o:treeRef
		
		if o:par
			o:par.cacheRef
			
		if o:ivar
			return o:treeRef = Str.new("'" + o:ivar.c + "'") # OP('.',scope.context,o:ivar)

		# cacher.nextRef(self) # 
		o:treeRef = cacher.nextRef(self)
		
	def cachePath
		var o = @options
		o:cachePath ?= if o:ivar
			OP('.',@tagScope.context,o:ivar)
		elif cacheRef
			OP('.',cacher,cacheRef.@value or cacheRef)
			
		# var ref = cacheRef

	def js jso
		var o = @options
		var po = o:par ? o:par.@options : {}
		var scope = scope__
		var calls = []
		var statics = []
		
		var parent = o:par # self.parent
		var content = o:body
		var bodySetter = isSelf ? "setChildren" : "setContent"
		
		let contentType = 0
		let parentType = parent and parent.option(:treeType)

		var out = ""
		var ctor = ""
		var pre = ""
		let typ = isSelf ? "self" : (type.isClass ? type.name : "'" + type.@value + "'")

		if isSelf
			let closure = scope.closure
			@reference = scope.context
			out = scope.context.c
			let nr = closure.incr('selfTag')
			let meth = closure isa MethodScope ? closure.node.name : ''
			let key = Num.new(nr)
			if meth and meth != 'render'
				key = Str.new("'" + meth + nr + "'")

			statics.push(".$open({key.c})")
			calls = statics
			# not always?
		else
			let cacher = cacher
			let ref = cacheRef
			let pars = [typ]
			let varRef = null
			let path = cachePath

			if o:ivar
				o:path = path.c # OP('.',scope.context,o:ivar).c
				pre = o:path + ' = ' + o:path + '||'
			elif ref
				o:path = path.c # OP('.',cacher,ref.@value or ref).c
				
				# if we have a dynamic key we need to change the path
				if o:key and !o:loop
					o:cachePath = scope.temporary(self,{})
					let str = "'{ref.@value}$'"
					o:path = OP('.',cacher,OP('=',o:cachePath,OP('+',Str.new(str),o:key))).c
					ref = o:cacheRef = o:cachePath
				
				# o:path = "{cacher.c}[{ref.c}]"
				if !o:optim or o:optim == self or parentType != 2 or parent.@children.len == 1
					pre = "{o:path} || "
				
				if o:key and !o:loop
					o:path = o:cachePath.c
			
			if o:ivar
				pars.push(parent ? parent.reference.c : scope.context.c)
				let flag = String(o:ivar.@value).substr(1)
				statics.push(".flag('{flag}')")
				
			elif cacher
				pars.push(cacher.c)
				pars.push(ref.c) if ref
				if parent and parent.@reference
					pars.push(varRef = parent.reference.c)
				elif parent and po:ivar
					pars.push(po:path)
				elif parent and parent.cacher == cacher
					pars.push(parent.cacheRef.c)
				elif parent
					pars.push(parent.reference.c)
				elif o:ivar or (o:key and !o:loop)
					pars.push(scope.context.c)

			ctor = "{factory.c}({pars.join(',')})"

		if o:body isa Func
			bodySetter = "setTemplate"

		elif o:body isa ArgList
			var children = o:body.values

			if children.len == 1
				contentType = 3
				let body = children[0]
				if body.isString
					content = body
					content.@noparen = yes
					bodySetter = "setText"
					contentType = 6
				elif body isa TagLoopFunc
					contentType = body.option(:treeType) or 3
				elif body isa Tag and !body.option(:key)
					# single tag which is always the same should default to 2
					# never needs to be set
					contentType = 2
			else
				contentType = children.every(do |item| 
					(item isa Tag and !item.option(:key)) or item.option(:treeType) == 2 or item.isPrimitive
				) ? 2 : 1
				content = TagTree.new(self,o:body)
		
		set(treeType: contentType)
		
		var specials = []
		for part in @attributes
			let out = part.js(jso)
			out = ".{AST.mark(part.name)}" + out
			# if part.isSpecial
			#	specials.push(out)
			if part.isStatic
				statics.push(out)
			else
				calls.push(out)
		
		# compile body
	
		var body = content and content.c(expression: yes)
	
		if body
			let target = (o:optim and contentType == 2) ? statics : calls
			
			# cache the body setter itself
			if isSelf and o:optim and contentType == 2 and content isa TagTree
				let k = childCacher.c
				# can skip body-type as well
				body = "{k}.$ = {k}.$ || {body}"

			if bodySetter == 'setChildren' or bodySetter == 'setContent'
				target.push ".{bodySetter}({body},{contentType})"
			elif bodySetter == 'setText'
				let typ = content isa Str ? statics : calls
				typ.push ".{bodySetter}({body})"
			elif bodySetter == 'setTemplate'
				if o:body.nonlocals
					target.push ".{bodySetter}({body})"
				else
					statics.push ".{bodySetter}({body})"
			else
				target.push ".{bodySetter}({body})"
		
		if specials.len		
			calls.push(*specials)
			
		let shouldEnd = !isNative or o:template or calls:length > 0
		let hasAttrs = Object.keys(@attrmap):length
		
		if hasAttrs
			shouldEnd = yes

		# @children:length
		if shouldEnd or @children:length
			
			var commits = []
			
			for child,i in @children
				let c = child.option(:commit)
				if c isa Array
					commits.push(*c)
				elif c
					commits.push(c)

			let patches = INDENT.wrap(commits.join(',\n'))
			let args = o:optim and commits:length ? '(' + patches + ',true)' : ''

			# if optim == self we need to fix
			if !shouldEnd and o:optim and o:optim != self
				set(commit: commits.len ? commits : '')
			else
				if (commits.len and o:optim) or !isNative or hasAttrs or o:template
					calls.push ".{isSelf ? "synced" : "end"}({args})"
		
		if @reference and !isSelf
			out = "{reference.c} = {pre}({reference.c}={ctor})"
		else
			out ||= "{pre}{ctor}"
			
		if statics:length
			out = out + statics.join("")
		
		if calls != statics
			if o:optim and o:optim != self
				set(commit: "{o:path}{calls.join("")}") if calls:length and o:commit == undefined
			else
				out = "({out})" + calls.join("")
		
		if @typeNum
			@typeNum.value = contentType
			
		set(treeType: contentType)

		return out

# This is a helper-node
# Should probably use the same type of listnode everywhere
# and simply flag the type as TagTree instead
export class TagTree < ListNode

	prop counter
	prop conditions
	prop blocks
	prop cacher

	def initialize owner, list, options = {}
		@owner = owner
		@nodes = load(list)
		@options = options
		@conditions = []
		@blocks = [self]
		@counter = 0
		self

	def parent
		@parent ||= @owner.parent

	def load list
		if list isa ListNode
			@indentation ||= list.@indentation # if list.count > 1
			list.nodes
		else
			AST.compact(list isa Array ? list : [list])

	def root
		option(:root)

	def resolve
		remap do |c| c.consume(self)
		self

	def static
		# every real node
		@static ?= every do |c| (c isa Tag or c isa Str or c isa Meta)

	def single
		@single ?= (realCount == 1 ? last : no)

	def hasTags
		some do |c| c isa Tag

	def c o
		var single = single
		# no indentation if this should return
		if single and STACK.current isa Return
			@indentation = null

		var out = super(o)

		if !single or single isa If
			"[{out}]"
		else
			out

export class TagWrapper < ValueNode

	def visit
		if value isa Array
			value.map(|v| v.traverse)
		else
			value.traverse
		self

	def c
		"{scope__.imba.c}.getTagForDom({value.c(expression: yes)})"


# SELECTORS


export class Selector < ListNode

	def initialize list, options
		@nodes = list or []
		@options = options

	def add part, typ
		push(part)
		self

	def group
		# for now we simply add a comma
		# how would this work for dst?
		@nodes.push(SelectorGroup.new(","))
		self

	def visit
		console.warn "{STACK.sourcePath}: {option(:type)} selectors deprecated"
		super

	def query
		var str = ""
		var ary = []

		for item in nodes
			var val = item.c
			if val isa String
				str = "{str}{val}"

		"'{str}'"


	def js o
		var typ = option(:type)
		var q = AST.c(query)
		var imba = scope__.imba.c

		if typ == '%'
			"{imba}.q$({q},{o.scope.context.c(explicit: yes)})" # explicit context
		elif typ == '%%'
			"{imba}.q$$({q},{o.scope.context.c(explicit: yes)})"
		else
			"{imba}.q{typ}({q})"

		# return "{typ} {scoped} - {all}"


export class SelectorPart < ValueNode

	def c
		AST.c(@value)

export class SelectorGroup < SelectorPart

	def c
		","

export class SelectorType < SelectorPart

	def c
		var name = value.name

		# at least be very conservative about which tags we
		# can drop the tag for?
		# out in TAG_TYPES.HTML ?
		name in TAG_TYPES.HTML ? name : value.sel


export class SelectorUniversal < SelectorPart

export class SelectorNamespace < SelectorPart

export class SelectorClass < SelectorPart

	def c
		if @value isa Node
			".'+{@value.c}+'"
		else
			".{AST.c(@value)}"

export class SelectorId < SelectorPart

	def c
		if @value isa Node
			"#'+{@value.c}+'"
		else
			"#{AST.c(@value)}"

export class SelectorCombinator < SelectorPart

	def c
		"{AST.c(@value)}"

export class SelectorPseudoClass < SelectorPart

export class SelectorAttribute < SelectorPart

	# remember to visit nodes inside here?
	def initialize left,op,right
		@left = left
		@op = op
		@right = @value = right

	def c
		# TODO possibly support .toSel or sel$(v) for items inside query
		# could easily do it with a helper-function that is added to the top of the filescope
		if @right isa Str
			"[{@left.c}{@op}{@right.c}]"
		elif @right
			# this is not at all good
			"[{@left.c}{@op}\"'+{AST.c(@right)}+'\"]"
		else
			"[{@left.c}]"

			# ...




# DEFER

export class Await < ValueNode

	prop func

	def js o
		return "await {value.c}" if option(:native)
		# introduce a util here, no?
		CALL(OP('.',Util.Promisify.new([value]),'then'),[func]).c

	def visit o
		# things are now traversed in a somewhat chaotic order. Need to tighten
		# Create await function - push this value up to block, take the outer
		value.traverse

		var fnscope = o.up(Func) # do |item| item isa MethodDeclaration or item isa Fun

		if !o.es5
			if fnscope
				set(native: yes)
				fnscope.set(async: yes)
				return self
			else
				# add warning
				# should add as diagnostics - no?
				warn "toplevel await not allowed"

		var block = o.up(Block) # or up to the closest FUNCTION?
		var outer = o.relative(block,1)
		var par = o.relative(self,-1)

		func = AsyncFunc.new([],[])
		# now we move this node up to the block
		func.body.nodes = block.defers(outer,self)
		func.scope.visit

		# if the outer is a var-assignment, we can simply set the params
		if par isa Assign
			par.left.traverse
			var lft = par.left.node
			# Can be a tuple as well, no?
			if lft isa VarReference
				# the param is already registered?
				# should not force the name already??
				# beware of bugs
				func.params.at(0,yes,lft.variable.name)
			elif lft isa Tuple
				# if this an unfancy tuple, with only vars
				# we can just use arguments

				if (par.type == 'var' or par.type == 'let') && !lft.hasSplat
					lft.map do |el,i|
						func.params.at(i,yes,el.value)
				else
					# otherwise, do the whole tuple
					# make sure it is a var assignment?
					par.right = ARGUMENTS
					func.body.unshift(par)
					func.scope.context
			else
				# regular setters
				par.right = func.params.at(0,yes)
				func.body.unshift(par)
				func.scope.context

		# If it is an advance tuple or something, it should be possible to
		# feed in the paramlist, and let the tuple handle it as if it was any
		# other value

		# CASE If this is a tuple / multiset with more than one async value
		# we need to think differently.

		# now we need to visit the function as well
		func.traverse
		# pull the outer in
		self

export class AsyncFunc < Func

	def initialize params, body, name, target, options
		super(params,body,name,target,options)

	def scopetype do LambdaScope


# IMPORTS

export class ImportStatement < Statement


	prop ns
	prop imports
	prop source
	
	def self.parse str, startPos = 0
		var named = []
		
		let pos = startPos
		if str[0] == '{'
			pos += 1
			str = str.slice(1,-1)

		var parts = str.trim.split(",") # /\s*,\s*/

		
		
		let id = do |name,loc = 0|
			# slow
			while name[0] == ' '
				loc++
				name = name.substr(1)
			name = name.trim
			Identifier.new(Token.new('IDENTIFIER',name,loc,name:length))
		
		for part in parts
			let asIdx = part.indexOf(" as ")
			if asIdx > 0
				var [name,value] = part.split(" as ")
				named.push([id(name,pos),id(value,pos + asIdx + 4)])
			else
				named.push([id(part,pos)])
			pos += part:length + 1
		return named
		

	def initialize imports, source, ns
		@traversed = no
		@imports = imports
		@source = source
		@ns = ns
		
		if imports and imports.@type == 'IMPORTS'
			@imports = ImportStatement.parse(imports.@value,imports.@loc)
			# console.log "parsed imports",imports.@value,imports.@loc
		elif imports isa Array
			@imports = imports.map(|item| [item])
		self

	def visit
		if @ns
			@nsvar ||= scope__.register(@ns,self)
		else
			var src = source.c
			var m = src.match(/(\w+)(\.js|imba)?[\"\']$/)
			@alias = m ? m[1] + '$' : 'mod$'

		# should also register the imported items, no?
		if @imports
			var dec = @declarations = VariableDeclaration.new([])

			if @imports:length == 1
				let extName = @imports[0][0]
				@alias = @imports[0][1] or extName
				dec.add(@alias,OP('.',Require.new(source),extName)).type = 'import'
				dec.traverse
				return self

			# @declarations = VariableDeclaration.new([])
			@moduledecl = dec.add(@alias,Require.new(source))
			@moduledecl.traverse


			if @imports:length > 1
				for imp in @imports
					let name = imp[1] or imp[0]
					dec.add(name,OP('.',@moduledecl.variable,imp[0])).type = 'import'
			dec.traverse
		self


	def js o

		if @declarations
			return @declarations.c

		var req = Require.new(source)

		if @ns
			# must register ns as a real variable
			return "var {@nsvar.c} = {req.c}"

		if @imports

			var src = source.c
			var alias = []
			var vars = VarBlock.new([])

			if var fname = src.match(/(\w+)(\.js|imba)?[\"\']$/)
				alias.push(fname[1])

			# var alias = src.match(/(\w+)(\.js|imba)?[\"\']$/)
			# create a require for the source, with a temporary name?
			var out = [req.cache(names: alias).c]

			for imp in @imports
				# we also need to register these imports as variables, no?
				var o = OP('=',imp,OP('.',req,imp))
				out.push("var {o.c}")

			return out
		else
			return req.c

	def consume node
		return self


# EXPORT

export class ExportStatement < ValueNode

	def js o
		var nodes = @value.map do |arg| "module.exports.{arg.c} = {arg.c}"

		if nodes:length > 1 and up isa Return
			return '[' + nodes.join(',') + ']'

		else
			return nodes.join(';\n') + ';'

export class Export < ValueNode

	def addExpression expr
		value = value.addExpression(expr)
		return self
		
	def loc
		let kw = option(:keyword)
		kw and kw:region ? kw.region : super

	def consume node
		if node isa Return
			option('return',yes)
			return self
		super
		
	def visit
		value.set(export: self, return: option(:return), default: option(:default))
		super

	def js o
		# p "Export {value}"
		# value.set export: self, return: option(:return), default: option(:default)

		if value isa VarOrAccess
			return "exports.{value.c} = {value.c};"

		if value isa ListNode
			value.map do |item| item.set export: self

		return value.c

export class Require < ValueNode

	def js o
		var out = value isa Parens ? value.value.c : value.c
		out == 'require' ? 'require' : "require({out})"

export class EnvFlag < ValueNode

	def raw
		@raw ?= STACK.env("" + @value)

	def isTruthy
		var val = raw
		return !!val if val !== undefined
		return undefined

	def loc
		[0,0]

	def c
		var val = raw
		if val !== undefined
			if val isa String
				if val.match(/^\d+(\.\d+)?$/)
					parseFloat(val)
				else
					"'{val}'"
			else
				"{val}"

		else
			"ENV_{@value}"


# UTILS

export class Util < Node

	prop args

	def initialize args
		@args = args

	# this is how we deal with it now
	def self.extend a,b
		Util.Extend.new([a,b])

	def self.callImba scope, meth, args
		CALL(OP('.',scope.imba,Identifier.new(meth)),args)

	def self.repeat str, times
		var res = ''
		while times > 0
			if times % 2 == 1
				res += str
			str += str
			times >>= 1
		return res



	def self.keys obj
		var l = Const.new("Object")
		var r = Identifier.new("keys")
		CALL(OP('.',l,r),[obj])

	def self.len obj, cache
		var r = Identifier.new("length")
		var node = OP('.', obj, r)
		node.cache(force: yes, pool: 'len') if cache
		return node

	def self.indexOf lft, rgt
		var node = Util.IndexOf.new([lft,rgt])
		# node.cache(force: yes, type: 'iter') if cache
		return node

	def self.slice obj, a, b
		var slice = Identifier.new("slice")
		console.log "slice {a} {b}"
		return CALL(OP('.',obj,slice),AST.compact([a,b]))

	def self.iterable obj, cache
		var node = Util.Iterable.new([obj])
		node.cache(force: yes, pool: 'iter') if cache
		return node



	def self.union a,b
		Util.Union.new([a,b])

	def self.intersect a,b
		Util.Intersect.new([a,b])

	def self.counter start, cache
		# should it not rather be a variable?!?
		var node = Num.new(start) # make sure it really is a number
		node.cache(force: yes, pool: 'counter') if cache
		return node

	def self.array size, cache
		var node = Util.Array.new([size])
		node.cache(force: yes, pool: 'list') if cache
		return node

	def self.defineTag type, ctor, supr
		CALL(TAGDEF,[type,ctor,supr])


	def self.defineClass name, supr, initor
		CALL(CLASSDEF,[name or initor,sup])

	def inlineHelpers
		!!OPTS:inlineHelpers

	def js o
		"helper"

# TODO Deprecate and remove
export class Util.Union < Util

	def helper
		'''
		function union$(a,b){
			if(a && a.__union) return a.__union(b);

			var u = a.slice(0);
			for(var i=0,l=b.length;i<l;i++) if(u.indexOf(b[i]) == -1) u.push(b[i]);
			return u;
		};

		'''

	def js o
		scope__.root.helper(self,helper)
		# When this is triggered, we need to add it to the top of file?
		"union$({args.map(|v| v.c ).join(',')})"

# TODO Deprecate and remove
export class Util.Intersect < Util

	def helper
		'''
		function intersect$(a,b){
			if(a && a.__intersect) return a.__intersect(b);
			var res = [];
			for(var i=0, l=a.length; i<l; i++) {
				var v = a[i];
				if(b.indexOf(v) != -1) res.push(v);
			}
			return res;
		};

		'''

	def js o
		# When this is triggered, we need to add it to the top of file?
		scope__.root.helper(self,helper)
		"intersect$({args.map(|v| v.c ).join(',')})"

export class Util.Extend < Util

	def js o
		# When this is triggered, we need to add it to the top of file?
		"extend$({AST.compact(AST.cary(args)).join(',')})"

export class Util.IndexOf < Util

	def helper
		'''
		function idx$(a,b){
			return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
		};
		'''

	def js o
		if inlineHelpers
			scope__.root.helper(self,helper)
			# When this is triggered, we need to add it to the top of file?
			"idx$({args.map(|v| v.c ).join(',')})"
		else
			"{scope__.imba.c}.indexOf({args.map(|v| v.c ).join(',')})"

export class Util.Len < Util

	def helper
		'''
		function len$(a){
			return a && (a.len instanceof Function ? a.len() : a.length) || 0;
		};
		'''

	def js o
		# 
		if true # isStandalone
			scope__.root.helper(self,helper)
			# When this is triggered, we need to add it to the top of file?
			"len$({args.map(|v| v.c ).join(',')})"
		else
			"{scope__.imba.c}.len({args.map(|v| v.c ).join(',')})"


export class Util.Subclass < Util

	def helper
		# should also check if it is a real promise
		'''
		// helper for subclassing
		function subclass$(obj,sup) {
			for (var k in sup) {
				if (sup.hasOwnProperty(k)) obj[k] = sup[k];
			};
			// obj.__super__ = sup;
			obj.prototype = Object.create(sup.prototype);
			obj.__super__ = obj.prototype.__super__ = sup.prototype;
			obj.prototype.initialize = obj.prototype.constructor = obj;
		};

		'''

	def js o
		if inlineHelpers
			# When this is triggered, we need to add it to the top of file?
			scope__.root.helper(self,helper)
			"subclass$({args.map(|v| v.c).join(',')});\n"
		else
			"{scope__.imba.c}.subclass({args.map(|v| v.c).join(',')});\n"

export class Util.Promisify < Util

	def helper
		# should also check if it is a real promise
		'''
		function promise$(a){
			if(a instanceof Array){
				console.warn("await (Array) is deprecated - use await Promise.all(Array)");
				return Promise.all(a);
			} else {
				return (a && a.then ? a : Promise.resolve(a));
			}
		}
		'''

	def js o
		if inlineHelpers
			# When this is triggered, we need to add it to the top of file?
			scope__.root.helper(self,helper)
			"promise$({args.map(|v| v.c).join(',')})"
		else
			"{scope__.imba.c}.await({args.map(|v| v.c).join(',')})"

# TODO deprecated: can remove
export class Util.Class < Util

	def js o
		# When this is triggered, we need to add it to the top of file?
		"class$({args.map(|v| v.c).join(',')})"

export class Util.Iterable < Util

	def helper
		# now we want to allow null values as well - just return as empty collection
		# should be the same for for own of I guess
		"function iter$(a)\{ return a ? (a.toArray ? a.toArray() : a) : []; \};"

	def js o
		return args[0].c if args[0] isa Arr # or if we know for sure that it is an array

		if true # isStandalone
			scope__.root.helper(self,helper)
			return "iter$({args[0].c})"
		else
			return "{scope__.imba.c}.iterable({args[0].c})"

export class Util.IsFunction < Util

	def js o
		"{args[0].c}"

export class Util.Array < Util

	def js o
		# When this is triggered, we need to add it to the top of file?
		"new Array({args.map(|v| v.c)})"




class Entities

	def initialize root
		@root = root
		@map = {}
		return self

	def add path, object
		@map[path] = object
		self

	def register entity
		var path = entity.namepath
		@map[path] ||= entity
		self

	def plain
		JSON.parse(JSON.stringify(@map))

	def toJSON
		@map

# SCOPES

# handles local variables, self etc. Should create references to outer scopes
# when needed etc.

# add class for annotations / registering methods, etc?
# class Interface

# should move the whole context-thingie right into scope
export class Scope

	prop level
	prop context
	prop node
	prop parent
	prop varmap
	prop varpool
	prop params
	prop head
	prop vars
	prop counter

	def p
		if STACK.loglevel > 0
			console.log(*arguments)
		self

	def stack
		STACK

	def initialize node, parent
		@nr = STACK.incr('scopes')
		@head = []
		@node = node
		@parent = parent
		@vars = VariableDeclaration.new([])
		@meta = {}
		@annotations = []
		@closure = self
		@virtual = no
		@counter = 0
		@varmap  = {}
		@counters = {}
		@varpool = []
		setup
		
	def setup
		@selfless = yes
		
	def incr name = 'i'
		var val = @counters[name] ||= 0
		@counters[name]++
		return val

	def meta key, value
		if value != undefined
			@meta[key] = value
			return self
		@meta[key]

	def namepath
		'?'
		
	def tagContext
		@tagContext ||= (context.reference) # @parent ? @parent.tagContext : {})

	# def context
	# 	@context ||= ScopeContext.new(self)
		
	def context
		# why do we need to make sure it is referenced?
		unless @context
			if selfless
				@context = parent.context
				@context.reference(self)
			else
				@context = ScopeContext.new(self)
		return @context

	def traverse
		self

	def visit
		return self if @parent
		@parent = STACK.scope(1) # the parent scope
		@level = STACK.scopes:length - 1

		STACK.addScope(self)
		root.scopes.push(self)
		self

	def wrap scope
		@parent = scope.@parent
		scope.@parent = self
		self

	# called for scopes that are not real scopes in js
	# must ensure that the local variables inside of the scopes do not
	# collide with variables in outer scopes -- rename if needed
	def virtualize
		self

	def root
		return STACK.ROOT

		var scope = self
		while scope
			return scope if scope isa RootScope
			scope = scope.parent
		return null

	def register name, decl = null, o = {}
		# FIXME re-registering a variable should really return the existing one
		# Again, here we should not really have to deal with system-generated vars
		# But again, it is important

		if !name
			o:system = yes

		if o:system
			return SystemVariable.new(self,name,decl,o)

		name = helpers.symbolize(name)

		# also look at outer scopes if this is not closed?
		var existing = @varmap.hasOwnProperty(name) && @varmap[name]
		# FIXME check if existing is required to be unique as well?
		return existing if existing and !o:unique
		# var type = o:system ? SystemVariable : Variable
		var item = Variable.new(self,name,decl,o)
		
		# register 
		# if o:type == 'meth' and self isa RootScope
		# 	console.log "add to object",name
		# 	@object.add(name,item)
		# var item = Variable.new(self,name,decl,o)
		# need to check for duplicates, and handle this gracefully -
		# going to refactor later
		@varmap[name] = item if !o:system and !existing
		return item

	def annotate obj
		@annotations.push(obj)
		self

	# just like register, but we automatically
	def declare name, init = null, o = {}
		var variable = name isa Variable ? name : register(name,null,o)
		# TODO create the variabledeclaration here instead?
		# if this is a sysvar we need it to be renameable
		var dec = @vars.add(variable,init)
		variable.declarator ||= dec
		return variable

	# what are the differences here? omj
	# we only need a temporary thing with defaults -- that is all
	# change these values, no?
	def temporary decl, o = {}, name = null

		if o:pool
			for v in @varpool
				if v.pool == o:pool && v.declarator == null
					return v.reuse(decl)

		var item = SystemVariable.new(self,name,decl,o)
		
		@varpool.push(item) # It should not be in the pool unless explicitly put there?
		@vars.push(item) # WARN variables should not go directly into a declaration-list
		return item

	def lookup name
		@lookups ||= {}
		var ret = null
		name = helpers.symbolize(name)
		if @varmap.hasOwnProperty(name)
			ret = @varmap[name]
		else
			ret = parent && parent.lookup(name)

			if ret
				@nonlocals ||= {}
				@nonlocals[name] = ret
		ret

	def requires path, name = ''
		root.requires(path,name)

	def imba
		root.requires('imba', 'Imba')

	def imbaTags
		root.imbaTags
		
	def imbaRef name, shorthand = '_'
		root.imbaRef(name,shorthand)

	def autodeclare variable
		vars.push(variable) # only if it does not exist here!!!

	def free variable
		variable.free # :owner = null
		# @varpool.push(variable)
		self

	def selfless
		!!@selfless

	def closure
		@closure

	def finalize
		self

	def klass
		var scope = self
		while scope
			scope = scope.parent
			return scope if scope isa ClassScope
		return null

	def head
		[@vars,@params]

	def c o = {}
		o:expression = no
		# need to fix this
		node.body.head = head
		var body = node.body.c(o)

	def region
		node.body.region

	def loc
		node.loc

	def dump
		var vars = Object.keys(@varmap).map do |k|
			var v = @varmap[k]
			# unless v.@declarator isa Scope
			# 	console.log v.name, v.@declarator:constructor:name
			# AST.dump(v)
			v.references:length ? AST.dump(v) : null

		var desc =
			nr: @nr
			type: self:constructor:name
			level: (level or 0)
			vars: AST.compact(vars)
			loc: loc

		return desc

	def toJSON
		dump

	def toString
		"{self:constructor:name}"

	def closeScope
		self


# RootScope is wrong? Rather TopScope or ProgramScope
export class RootScope < Scope

	prop warnings
	prop scopes
	prop entities
	prop object

	def initialize
		super

		register 'global', self, type: 'global'
		register 'module', self, type: 'global'
		register 'window', self, type: 'global'
		register 'document', self, type: 'global'
		register 'exports', self, type: 'global'
		register 'console', self, type: 'global'
		register 'process', self, type: 'global'
		register 'parseInt', self, type: 'global'
		register 'parseFloat', self, type: 'global'
		register 'setTimeout', self, type: 'global'
		register 'setInterval', self, type: 'global'
		register 'setImmediate', self, type: 'global'
		register 'clearTimeout', self, type: 'global'
		register 'clearInterval', self, type: 'global'
		register 'clearImmediate', self, type: 'global'
		register '__dirname', self, type: 'global'
		register '__filename', self, type: 'global'
		register '_', self, type: 'global'

		# preregister global special variables here
		@requires = {}
		@warnings = []
		@scopes   = []
		@helpers  = []
		@selfless = no
		@entities = Entities.new(self)
		@object = Obj.wrap({})
		@head = [@vars]
		

	def context
		@context ||= RootScopeContext.new(self)

	def lookup name
		name = helpers.symbolize(name)
		@varmap[name] if @varmap.hasOwnProperty(name)

	def visit
		STACK.addScope(self)
		self

	def helper typ, value
		# log "add helper",typ,value
		if @helpers.indexOf(value) == -1
			@helpers.push(value)
			@head.unshift(value)

		return self

	def head
		@head

	def warn data
		# hacky
		data:node = null
		@warnings.push(data)
		self

	def dump
		var obj = {warnings: AST.dump(@warnings)}

		if OPTS:analysis:scopes
			var scopes = @scopes.map(|s| s.dump)
			scopes.unshift(super.dump)
			obj:scopes = scopes

		if OPTS:analysis:entities
			obj:entities = @entities

		return obj

	# not yet used
	def requires path, name
		if var variable = lookup(name)
			return variable

		if var variable = @requires[name]
			if variable.@requirePath != path
				throw Error.new("{name} is already defined as require('{variable.@requirePath}')")
			return variable

		var req = Require.new(Str.new("'" + path + "'"))
		var variable = Variable.new(self,name,null,system: yes)
		var dec = @vars.add(variable, req)
		variable.declarator ||= dec
		variable.@requirePath = path
		@requires[name] = variable
		return variable

	def imbaTags
		return @imbaTags if @imbaTags
		var imbaRef = self.imba
		# don't add if we cannot be certain that imba is required on top
		if @requires.Imba
			@imbaTags = declare('_T',OP('.',imbaRef,'TAGS'))
		else
			@imbaTags = "{imbaRef.c}.TAGS"
			
	def imbaRef name, shorthand = '_'
		var map = @imbaRefs ||= {}
		return map[name] if map[name]

		var imbaRef = self.imba
		
		if @requires.Imba
			map[name] = declare(shorthand,OP('.',imba,name), system: yes)
		else
			map[name] = "{imbaRef.c}.{name}"
		

	def c o = {}
		o:expression = no
		# need to fix this
		node.body.head = head
		var body = node.body.c(o)

		return body

export class ModuleScope < Scope

	def setup
		@selfless = no

	def namepath
		@node.namepath

export class ClassScope < Scope
	
	def setup
		@selfless = no

	def namepath
		@node.namepath

	# called for scopes that are not real scopes in js
	# must ensure that the local variables inside of the scopes do not
	# collide with variables in outer scopes -- rename if needed
	def virtualize
		# console.log "virtualizing ClassScope"
		var up = parent
		for own k,v of @varmap
			v.resolve(up,yes) # force new resolve
		self
		
	def prototype
		@prototype ||= ValueNode.new(OP('.',context,'prototype'))

export class TagScope < ClassScope

export class ClosureScope < Scope

export class FunctionScope < Scope

export class MethodScope < Scope

	def setup
		@selfless = no

export class LambdaScope < Scope

	def context
		# why do we need to make sure it is referenced?
		unless @context
			@context = parent.context
			@context.reference(self)
		@context


export class FlowScope < Scope

	# these have no params themselves, refer to outer scopes -- hjmm
	def params
		@parent.params if @parent

	def register name, decl = null, o = {}
		if o:type != 'let' and (closure != self)
			if var found = lookup(name)
				if found.type == 'let'
					# p "{name} already exists as a block-variable {decl}"
					# TODO should throw error instead
					decl.warn "Variable already exists in block" if decl
					# root.warn message: "Holy shit"
			closure.register(name,decl,o)
		else
			super(name,decl,o)

	# FIXME should override temporary as well

	def autodeclare variable
		parent.autodeclare(variable)

	def closure
		@parent.closure # this is important?

	def context
		@context ||= parent.context

	def closeScope
		@context.reference if @context
		self

export class CatchScope < FlowScope

export class WhileScope < FlowScope

	def autodeclare variable
		vars.push(variable)

export class ForScope < FlowScope

	def autodeclare variable
		vars.push(variable)

	def temporary refnode, o = {}, name = null
		parent.temporary(refnode,o,name)

export class IfScope < FlowScope

	def temporary refnode, o = {}, name = null
		parent.temporary(refnode,o,name)

export class BlockScope < FlowScope

	def temporary refnode, o = {}, name = null
		parent.temporary(refnode,o,name)

	def region
		node.region

# lives in scope -- really a node???
export class Variable < Node

	prop scope
	prop name
	prop alias
	prop type
	prop options
	prop initialized
	prop declared
	prop declarator
	prop autodeclare
	prop references
	prop export

	def pool
		null

	def initialize scope, name, decl, o
		@ref = STACK.@counter++
		@c = null
		@scope = scope
		@name  = name
		@alias = null
		@initialized    = yes
		@declarator  	= decl
		@autodeclare 	= no
		@declared		= o and o:declared || no
		@resolved		= no
		@options 		= o || {}
		@type			= o and o:type || 'var' # what about let here=
		@export			= no
		@references 	= [] # only needed when profiling
		@assignments 	= []
		self

	def closure
		@scope.closure

	def assignments
		@assignments

	# Here we can collect lots of type-info about variables
	# and show warnings / give advice if variables are ambiguous etc
	def assigned val, source
		@assignments.push(val)
		if val isa Arr
			# just for testing really
			@isArray = yes
		else
			@isArray = no
		self
	

	def resolve scope = scope, force = no
		return self if @resolved and !force

		@resolved = yes
		var es5 = STACK.es5
		var closure = @scope.closure
		var item = @shadowing or scope.lookup(@name)

		# if this is a let-definition inside a virtual scope we do need
		#
		if @scope != closure and @type == 'let' and (es5 or @virtual) # or if it is a system-variable
			item = closure.lookup(@name)

			# we now need to ensure that this variable is unique inside
			# the whole closure.
			scope = closure

		if item == self
			scope.varmap[@name] = self
			return self

		elif item
			# possibly redefine this inside, use it only in this scope
			# if the item is defined in an outer scope - we reserve the
			if item.scope != scope && (options:let or @type == 'let')
				scope.varmap[@name] = self
				# if we allow native let we dont need to rewrite scope?
				return self if (!es5 and !@virtual and !@shadowing)
					

			# different rules for different variables?
			if @options:proxy
				yes
			else
				var i = 0
				var orig = @name
				# it is the closure that we should use
				while scope.lookup(@name)
					@name = "{orig}{i += 1}"

		scope.varmap[@name] = self
		closure.varmap[@name] = self
		return self

	def reference
		self

	def node
		self

	def cache
		self

	def traverse
		self

	def free ref
		@declarator = null
		self

	def reuse ref
		@declarator = ref
		self

	def proxy par, index
		@proxy = [par,index]
		self

	def refcount
		@references:length

	def c
		return @c if @c
		# options - proxy??
		if @proxy
			@c = @proxy[0].c
			if @proxy[1]
				@c += '[' + @proxy[1].c + ']'
		else
			resolve unless @resolved
			var v = (alias or name)
			@c = typeof v == 'string' ? v : v.c
			# allow certain reserved words
			# should warn on others though (!!!)
			# if @c == 'new'
			# 	@c = '_new'
			# 	# should happen at earlier stage to
			# 	# get around naming conventions
			@c = "{c}$" if RESERVED_REGEX.test(@c) # @c.match(/^(default)$/)
		return @c

	# variables should probably inherit from node(!)
	def consume node
		return self

	# this should only generate the accessors - not dael with references
	def accessor ref
		var node = LocalVarAccess.new(".",null,self)
		# this is just wrong .. should not be a regular accessor
		# @references.push([ref,el]) if ref # weird temp format
		return node

	def assignment val
		Assign.new('=',self,val)

	def addReference ref
		if ref isa Identifier
			ref.references(self)

		if ref:region and ref.region
			@references.push(ref)
			if ref.scope__ != @scope
				@noproxy = yes

		self

	def autodeclare
		return self if @declared
		@autodeclare = yes
		scope.autodeclare(self)
		@declared = yes
		self

	def predeclared
		@declared = yes
		self


	def toString
		String(name)

	def dump typ
		var name = name
		return null if name[0].match(/[A-Z]/)

		return {
			type: type
			name: name
			refs: AST.dump(@references, typ)
		}


export class SystemVariable < Variable

	def pool
		@options:pool

	# weird name for this
	def predeclared
		scope.vars.remove(self)
		self

	def resolve
		return self if @resolved
		@resolved = yes

		# unless @name
		# adds a very random initial name
		# the auto-magical goes last, or at least, possibly reuse other names
		# "${Math.floor(Math.random * 1000)}"
		var alias = @name
		var typ = @options:pool
		var names = [].concat(@options:names)
		var alt = null
		var node = null

		@name = null

		var scope = self.scope

		if typ == 'tag'
			var i = 0
			while !@name
				var alt = "t{i++}"
				@name = alt unless scope.lookup(alt)

		elif typ == 'iter'
			names = ['ary__','ary_','coll','array','items','ary']

		elif typ == 'dict'
			names = ['dict']

		elif typ == 'val'
			names = ['v_']

		elif typ == 'arguments'
			names = ['$_','$0']

		elif typ == 'keypars'
			names = ['opts','options','pars']

		elif typ == 'counter'
			names = ['i__','i_','k','j','i']

		elif typ == 'len'
			names = ['len__','len_','len']

		elif typ == 'list'
			names = ['tmplist_','tmplist','tmp']
		# or if type placeholder / cacher (add 0)

		if alias
			names.push(alias)

		while !@name && alt = names.pop
			let foundAlt = scope.lookup(alt)
			# check if higher level?
			if !foundAlt # or (foundAlt.scope != scope and type == 'let' and !STACK.es5)
				@name = alt # unless scope.lookup(alt)

		if !@name and @declarator
			if node = declarator.node
				if var nodealias = node.alias
					names.push(nodealias + "_")

		while !@name && alt = names.pop
			@name = alt unless scope.lookup(alt)

		# go through alias proxies
		if alias and !@name
			var i = 0
			@name = alias
			# it is the closure that we should use
			while scope.lookup(@name)
				@name = "{alias}{i += 1}"

		@name ||= "${scope.counter += 1}"
		
		scope.varmap[@name] = self

		if type != 'let' or STACK.es5 or @virtual
			closure.varmap[@name] = self
		self

	def name
		resolve
		@name


export class ScopeContext < Node

	prop scope
	prop value
	prop reference

	def initialize scope, value
		@scope = scope
		@value = value
		@reference = null
		self

	def namepath
		@scope.namepath

	# instead of all these references we should probably
	# just register when it is accessed / looked up from
	# a deeper function-scope, and when it is, we should
	# register the variable in scope, and then start to
	# use that for further references. Might clean things
	# up for the cases where we have yet to decide the
	# name of the variable etc?

	def reference
		@reference ||= scope.declare("self",This.new)

	def c
		var val = @value || @reference
		(val ? val.c : "this")

	def cache
		self
		
	def proto
		"{self.c}.prototype"

export class RootScopeContext < ScopeContext

	def reference
		# should be a 
		@reference ||= scope.declare("self",scope.object, type: 'global')

	def c o
		# @reference ||= scope.declare("self",scope.object, type: 'global')
		# return "" if o and o:explicit
		var val = reference # @value || @reference
		return (val and val != this) ? val.c : "this"
		# should be the other way around, no?
		# o and o:explicit ? super : ""

export class Super < Node

	def c
		# need to find the stuff here
		# this is really not that good8
		var m = STACK.method
		var out = null
		var up = STACK.current
		var deep = up isa Access

		# TODO optimization for later - problematic if there is a different reference in the end
		if false && m && m.type == :constructor
			out = "{m.target.c}.superclass"
			out += ".apply({m.scope.context.c},arguments)" unless deep
		else
			out = "{m.target.c}.__super__"
			unless up isa Access
				out += ".{AST.c(m.supername)}"
				unless up isa Call # autocall?
					out += ".apply({m.scope.context.c},arguments)"
		out

# constants

export var BR = Newline.new('\n')
export var BR2 = Newline.new('\n\n')
export var SELF = Self.new
export var SUPER = Super.new

export var TRUE = True.new('true')
export var FALSE = False.new('false')
export var UNDEFINED = Undefined.new
export var NIL = Nil.new

export var ARGUMENTS = ArgsReference.new('arguments')
export var EMPTY = ''
export var NULL = 'null'

export var RESERVED = ['default','native','enum','with']
export var RESERVED_REGEX = /^(default|native|enum|with|new|char)$/

export var UNION = Const.new('union$')
export var INTERSECT = Const.new('intersect$')
export var CLASSDEF = Const.new('imba$class')
export var TAGDEF = Const.new('Imba.TAGS.define')










