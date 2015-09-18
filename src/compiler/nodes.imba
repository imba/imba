# TODO Create Expression - make all expressions inherit from these?

extern parseInt

var helpers = require './helpers'
var v8 = null # require 'v8-natives'

var T = require './token'
var Token = T.Token

import SourceMap from './sourcemap'

export var AST = {}

# Helpers for operators
export var OP = do |op, l, r|
	var o = String(op)
	# console.log "operator",o
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
				# console.log "is var or access"
				r = r.value
			# depends on the right side - this is wrong
			PropertyAccess.new(op,l,r)

		when 'instanceof'
			InstanceOf.new(op,l,r)
		when 'in'
			In.new(op,l,r)
		when 'typeof'
			TypeOf.new(op,l,r)
		when 'delete'
			Delete.new(op,l,r)
		when '--','++','!','√'
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
		# p "WARN"
		value.left = Splat.new(value.left)
		return value
	else
		Splat.new(value)
		# not sure about this

# OP.ASSIGNMENT = [ "=" , "+=" , "-=" , "*=" , "/=" , "%=", "<<=" , ">>=" , ">>>=", "|=" , "^=" , "&=" ]
# OP.LOGICAL = [ "||" , "&&" ]
# OP.UNARY = [ "++" , "--" ]

var SEMICOLON_TEST = /;(\s*\/\/.*)?[\n\s\t]*$/
var RESERVED_TEST = /^(default|char)$/


export def parseError str, o
	# console.log "parseError {str}"
	if o:lexer
		var token = o:lexer:yytext
		# should find the closest token with actual position
		str = "[{token.@loc}:{token.@len || String(token):length}] {str}"
	var e = Error.new(str)
	e:lexer = o:lexer
	throw e

def c__ obj
	typeof obj == 'string' ? obj : obj.c

def mark__ tok
	if tok and OPTS:sourceMapInline and tok:sourceMapMarker
		tok.sourceMapMarker
	else
		''

def num__ num
	Num.new(num)

def str__ str
	# should pack in token?!?
	Str.new(str)

def blk__ obj
	obj isa Array ? Block.wrap(obj) : obj

def sym__ obj
	# console.log "sym {obj}"
	helpers.symbolize(String(obj))

def cary__ ary
	ary.map(|v| typeof v == 'string' ? v : v.c )

def dump__ obj, key
	if obj isa Array
		obj.map do |v| v && v:dump ? v.dump(key) : v
	elif obj and obj:dump
		obj.dump

def compact__ ary
	if ary isa ListNode
		return ary.compact

	ary.filter do |v| v != undefined && v != null

def reduce__ res,ary
	for v in ary
		v isa Array ? reduce__(res,v) : res.push(v)
	return

def flatten__ ary, compact = no
	var out = []
	for v in ary
		v isa Array ? reduce__(out,v) : out.push(v)
	return out
	
def AST.parse str, opts = {}
	var indent = str.match(/\t+/)[0]
	Imba.parse(str,opts)

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

export class Indentation

	prop open
	prop close

	def initialize a,b
		@open = a
		@close = b
		self

	def isGenerated
		@open and @open:generated

	# should rather parse and extract the comments, no?
	def wrap str
		# var pre, post
	
		# console.log "INDENT {@open and JSON.stringify(@open.@meta)}"
		# console.log "OUTDENT {@close}"
		# var ov = @open and @open.@value
		# if ov and ov:length > 1
		# 	console.log "value for indent",ov
		# 	if ov.indexOf('%|%')
		# 		pre = ov.substr
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

export class Stack

	prop loglevel
	prop nodes
	prop scopes

	def initialize
		reset

	def reset
		@nodes   = []
		@scoping = []
		@scopes  = [] # for analysis - should rename
		@loglevel = 3
		@counter = 0
		self

	def option key
		@options and @options[key]

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

	def scoping
		@nodes.filter(|n| n.@scope ).map(|n| n.@scope )

# Lots of globals -- really need to deal with one stack per file / context
export var STACK = Stack.new

GLOBSTACK = STACK

# use a bitmask for these

export class Node

	prop o
	prop options
	prop traversed

	def safechain
		no

	# def dom
	# 	var name = "ast_" + self:constructor:name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase
	# 	# p "try to get the dom-node for this ast-node",name
	# 	if Imba.TAGS[name]
	# 		var node = Imba.tag(name)
	# 		node.bind(self).build
	# 		return node
	# 	else
	# 		return "[{name}]"

	def p
	
		# allow controlling this from commandline
		if STACK.loglevel > 0
			console.log(*arguments)
		self

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
		# console.log "setting options {JSON.stringify(obj)}"
		@options ||= {}
		for own k,v of obj
			@options[k] = v
		self

	# get and set
	def option key, val
		if val != undefined
			# console.log "setting option {key} {val}"
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
			return PushAssign.new(node.op,node.left,self)

		if node isa Assign
			# p "consume assignment".cyan
			# node.right = self
			return OP(node.op,node.left,self)
		elif node isa Op
			return OP(node.op,node.left,self)
		elif node isa Return
			# p "consume return".cyan
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
		# p "addExpression {self} <- {expr}"
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
		# in options instead?
		# console.log "prebreak!!!!"
		# @prebreak = @prebreak or term
		self

	def invert
		return OP('!',self)

	def cache o = {}
		@cache = o
		o:var = scope__.temporary(self,o)
		o:lookups = 0
		self

	def cachevar
		@cache && @cache:var

	def decache
		if @cache
			cachevar.free
			@cache = null
		self

	# is this without side-effects? hmm - what does it even do?
	def predeclare
		if @cache
			scope__.vars.swap(@cache:var,self)
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

		v8 and console.log v8.hasFastObjectElements(self)

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
			out = "{ch:var.c}={out}" unless ch:manual
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

	def c o
		var v = @value.@value
		# p @value.type
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

	def c
		# TODO this can contain several newlines
		# for sourcemaps it would be nice to parse this
		# and fix it up mark__(@value) + 
		return @value.c
		# var v = value.replace(/\\n/g,'\n')
		# v # .split()
		# v.split("\n").map(|v| v ? " // {v}" : v).join("\n")

export class Newline < Terminator

	def initialize v
		@traversed = no
		@value = v or '\n'

	def c
		c__(@value)
		

# weird place?
export class Index < ValueNode

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
		@nodes = compact__(@nodes)
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
				# p "replaceing with array of items"
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
		# return no unless nodes.every(|v| v.isExpressable )
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

#	def indented a,b
#		if a isa Indentation
#			@indentation = a
#			return self
#
#		@indentation ||= a and b ? Indentation.new(a,b) : INDENT
#		self

# def hasSplat
# 	@nodes.some do |v| v isa Splat
# def delimiter
# 	","


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
		# @nodes = compact__(flatten__(list)) or []
		@nodes = list or []
		@head = null
		@indentation = null

	def self.wrap ary
		unless ary isa Array
			throw SyntaxError.new("what")
		ary:length == 1 && ary[0] isa Block ? ary[0] : Block.new(ary)

	def visit
		@scope.visit if @scope

		for node in @nodes
			node and node.traverse
		self

	def block
		self

	# def indented a,b
	# 	@indentation ||= a and b ? Indentation.new(a,b) : INDENT
	# 	self

	def loc
		# rather indents, no?
		if var opt = option(:ends)
			# p "location is",opt
			var a = opt[0].loc
			var b = opt[1].loc

			p "no loc for {opt[0]}" unless a
			p "no loc for {opt[1]}" unless b

			[a[0],b[1]]
		else
			[0,0]

	# go through children and unwrap inner nodes
	def unwrap
		var ary = []
		for node,i in nodes
			if node isa Block
				# p "unwrapping inner block"
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
		# p "analyzing block!!!",o
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
		return null if ast:length == 0

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
		if node isa TagTree # special case?!?
			@nodes = @nodes.map do |child|
				child.consume(node)

			let real = expressions
			# FIXME should not include terminators and comments when counting
			# should only wrap the content in array (returning all parts)
			# for if/else blocks -- not loops

			# we need to compare the real length
			if !node.@loop && real:length > 1
				# p "lengths",@nodes:length,expressions:length
				let nr = node.blocks.push(self)
				var arr = Arr.new(ArgList.new( @nodes ))
				arr.indented(@indentation)
				@indentation = null

				if node.reactive
					@nodes = [Util.callImba("static",[arr,Num.new(nr)])]
				else
					@nodes = [arr]

			
		
			return self

		# can also return super if it is expressable, but should we really?
		if var before = last
			var after = before.consume(node)
			if after != before
				# p "replace node in block {before} -> {after}"
				if after isa Block
					# p "replaced with block -- should basically add it instead?"
					after = after.nodes

				replace(before,after)
		# really?
		return self


	def isExpressable
		return no unless @nodes.every(|v| v.isExpressable )
		return yes

	def isExpression
	
		option(:express) || @expression


# this is almost like the old VarDeclarations but without the values
export class VarBlock < ListNode


	def load list
		var first = list[0]

		if first isa Assign
			@type = first.left.@type
		elif first isa VarReference
			@type = first.@type
		# p "here {list[0]} - {@type}"
		# @type = list[0] and list[0].type
		list
		
	# TODO All these inner items should rather be straight up literals
	# or basic localvars - without any care whatsoever about adding var to the
	# beginning etc. 
	def addExpression expr
		# p "VarBlock.addExpression {self} <- {expr}"

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
			# p "is a splat - only allowed in tuple-assignment"
			# what?
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
		# p "VarBlock"
		# for n in @nodes
		# 	p "VarBlock child {n}"
		var code = compact__(flatten__(cary__(nodes)))
		code = code.filter(|n| n != null && n != undefined && n != EMPTY)
		var out = code.join(",")
		# we just need to trust that the variables have been autodeclared beforehand
		# if we are inside an expression
		out = "var " + out unless o.isExpression
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
		# p "compile parens {v} {v isa Block and v.count}"
		# p "Parens up {par} {o.isExpression}"
		if par isa Block
			# is it worth it?
			@noparen = yes unless o.isExpression
			str = v isa Array ? cary__(v) : v.c(expression: o.isExpression)
		else
			str = v isa Array ? cary__(v) : v.c(expression: yes)

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


	def c
		map(|item| item.c).join(",")

	def consume node
		value.consume(node)

	def addExpression expr
		# Need to take care of the splat here to.. hazzle
		if expr.node isa Assign
			# p "is assignment!"
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
		# @prebreak = v and v.@prebreak
		# console.log "return?!? {v}",@prebreak
		# if v isa ArgList and v.count == 1
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
		# p "return must cascade into value".red
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
		self.expression = expr # && ArgList.new(expr) # really?

	def visit
		expression.traverse if expression

	def consume node
		# p "break/continue should consume?!"
		self

	def c
		return super unless expression
		# get up to the outer loop
		var _loop = STACK.up(Loop)
		# p "found loop?",_loop

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

	# what about object-params?

	def initialize name, defaults, typ
		# could have introduced bugs by moving back to identifier here
		@traversed = no
		@name = name # .value # this is an identifier(!)
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
			# console.log "got here!! {@name:constructor}"
			# @name.@token.@variable = @variable if @name.@token
		
		self

	def assignment
		OP('=',variable.accessor,defaults)

	def isExpressable
		!defaults || defaults.isExpressable
		# p "visiting param!!!"

	def dump
		{loc: loc}

	def loc
		@name && @name.region
		

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

export class IndexedParam < Param

	prop parent
	prop subindex

	def visit
		# p "VISIT PARAM {name}!"
		# ary.[-1] # possible
		# ary.(-1) # possible
		# str(/ok/,-1)
		# scope.register(@name,self)
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
		# p "loading arrayparams"
		# try the basic first
		unless list.splat
			list.value.map do |v,i|
				# must make sure the params are supported here
				# should really not parse any array at all(!)
				var name = v
				if v isa VarOrAccess
					# p "varoraccess {v.value}"
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
		# "arrayparams"
		self

export class ParamList < ListNode

	prop splat
	prop block

	def at index, force = no, name = null
		if force
			add(Param.new(count == index && name || "_{count}")) until count > index
			# need to visit at the same time, no?
		list[index]

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
			compact__(pars.map(|arg| c__(arg.varname) )).join(",")
		else
			throw "not implemented paramlist js"
			"ta" + compact__(map(|arg| arg.c )).join(",")

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
				p "adding arrayparams"
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

		# TODO (target) << (node) rewrites to a caching push which returns node

	# def remove item
	# 	if item isa Variable
	# 		map do |v,i|
	# 			if v.variable == item
	# 				p "found variable to remove"
	# 				super.remove(v)
	# 	else
	# 		super.remove(item)
	# 	self
	
	def load list
		# temporary solution!!!
		list.map do |par| VariableDeclarator.new(par.name,par.defaults,par.splat)

	def isExpressable
		nodes.every(|item| item.isExpressable)

	def js o
		return EMPTY if count == 0

		if count == 1 && !isExpressable
			# p "SHOULD ALTER VARDEC!!!".cyan
			first.variable.autodeclare
			var node = first.assignment
			return node.c

		# FIX PERFORMANCE
		var out = compact__(cary__(nodes)).join(", ")
		out ? "var {out}" : ""
		# "var " + compact__(cary__(nodes)).join(", ") + ""

export class VariableDeclarator < Param

	# can possibly create the variable immediately but wait with scope-declaring
	# What if this is merely the declaration of a system/temporary variable?
	def visit
		# even if we should traverse the defaults as if this variable does not exist
		# we need to preregister it and then activate it later
		self.variable ||= scope__.register(name,null)
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

			"{variable.c}={defs}"
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
		# p "visiting varname(!)", value.c
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
					v = OP('.',r,num__(i))
				
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
		# p "create root!"
		@traversed = no
		@body = blk__(body)
		@scope = FileScope.new(self,null)
		@options = {}

	def visit
		scope.visit
		body.traverse

	def compile o
		STACK.reset # -- nested compilation does not work now
		STACK.@options = o
		@options = o or {}
		OPTS = o
		traverse
		var out = c
		var result = {
			js: out,
			ast: self,
			warnings: scope.warnings,
			options: o,
			toString: (do this:js)
		}

		if o:sourceMapInline
			SourceMap.new(result).generate

		return result

	def js o
		var out
		if @options:bare
			out = scope.c
		else
			out = scope.c(indent: yes)
			out = out.replace(/^\n?/,'\n')
			out = out.replace(/\n?$/,'\n\n')
			out = '(function(){' + out + '})()'

		# find and replace shebangs
		var shebangs = []
		out = out.replace(/^[ \t]*\/\/(\!.+)$/mg) do |m,shebang|
			# p "found shebang {shebang}"
			shebang = shebang.replace(/\bimba\b/g,'node')
			shebangs.push("#{shebang}\n")
			return ""

		out = shebangs.join('') + out

		return out


	def analyze loglevel: 0
		STACK.loglevel = loglevel
		STACK.@analyzing = true
		traverse
		STACK.@analyzing = false
		return scope.dump

	def inspect
		true

export class ClassDeclaration < Code

	prop name
	prop superclass
	prop initor

	def initialize name, superclass, body
		# what about the namespace?
		@traversed = no
		@name = name
		@superclass = superclass
		@scope = ClassScope.new(self)
		@body = blk__(body)
		self

	def visit
		# replace with some advanced lookup?
		scope.visit
		body.traverse
		self

	def js o
		scope.virtualize # is this always needed?
		scope.context.value = name

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
		var mark = mark__(option('keyword'))

		body.map do |c,i|
			if c isa MethodDeclaration && c.type == :constructor
				bodyindex = i

		if bodyindex >= 0
			initor = body.removeAt(bodyindex)

		# var initor = body.pluck do |c| c isa MethodDeclaration && c.type == :constructor
		# compile the cname
		cname = cname.c unless typeof cname == 'string'

		var cpath = typeof name  == 'string' ? name : name.c

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
		else
			# head.push(Terminator.new('\n\n'))
			true
		


		if sup
			# console.log "deal with superclass!"
			# head.push("// extending the superclass\nimba$class({name.c},{sup.c});\n\n")
			head.push(Util.Subclass.new([name,sup]))

		# only if it is not namespaced
		if o:global and !namespaced # option(:global)
			head.push("global.{cname} = {cpath}; // global class \n")

		if o:export and !namespaced
			head.push("exports.{cname} = {cpath}; // export class \n")

		# FIXME
		# if namespaced and (o:local or o:export)
		# 	console.log "namespaced classes are implicitly local/global depending on the namespace"


		body.unshift(part) for part in head.reverse
		body.@indentation = null
		var end = body.index(body.count - 1)
		body.pop if end isa Terminator and end.c:length == 1
		var out = body.c

		return out


export class TagDeclaration < Code

	prop name
	prop superclass
	prop initor

	def initialize name, superclass, body
		# what about the namespace?
		# @name = TagTypeRef.new(name)
		@traversed = no
		@name = name
		@superclass = superclass
		@scope = TagScope.new(self)
		@body = blk__(body || [])

	def visit
		# replace with some advanced lookup?
		scope.visit
		body.traverse

	def id
		name.id

	def js o
		scope.context.value = @ctx = scope.declare('tag',null,system: yes)

		var mark = mark__(option('keyword'))
		var cbody = body.c
		var outbody = body.count ? ", function({@ctx.c})\{{cbody}\}" : ''

		if option(:extension)
			return "{mark}Imba.extendTag('{name.id or name.func}'{outbody})"

		var sup =  superclass and "," + helpers.singlequote(superclass.func) or ""

		var out = if name.id
			"{mark}Imba.defineSingletonTag('{name.id}'{sup}{outbody})"
		else
			"{mark}Imba.defineTag('{name.func}'{sup}{outbody})"

		return out

export class Func < Code

	prop name
	prop params
	prop target
	prop options
	prop type
	prop context

	def scopetype do FunctionScope

	def initialize params, body, name, target, o
		# p "INIT Function!!",params,body,name
		var typ = scopetype
		@traversed = no
		@body = blk__(body)
		@scope ||= (o and o:scope) || typ.new(self)
		@scope.params = @params = ParamList.new(params)
		@name = name || ''
		@target = target
		@options = o
		@type = :function
		@variable = null
		self

	def visit
		scope.visit
		@context = scope.parent
		@params.traverse
		@body.traverse # so soon?
		

	def js o
		body.consume(ImplicitReturn.new) unless option(:noreturn)
		var ind = body.@indentation
		# var s = ind and ind.@open
		# p "indent function? {body.@indentation} {s} {s:generated} {body.count}"
		body.@indentation = null if ind and ind.isGenerated
		var code = scope.c(indent: (!ind or !ind.isGenerated), braces: yes)

		# args = params.map do |par| par.name
		# head = params.map do |par| par.c
		# code = [head,body.c(expression: no)].flatten__.compact.join("\n").wrap
		# FIXME creating the function-name this way is prone to create naming-collisions
		# will need to wrap the value in a FunctionName which takes care of looking up scope
		# and possibly dealing with it
		var name = typeof @name == 'string' ? @name : @name.c
		var name = name ? ' ' + name.replace(/\./g,'_') : ''
		var out = "function{name}({params.c}) " + code
		out = "({out})()" if option(:eval)
		return out

	def shouldParenthesize par = up
		par isa Call && par.callee == self
		# if up as a call? Only if we are 

export class Lambda < Func
	def scopetype do LambdaScope

export class TagFragmentFunc < Func

# MethodDeclaration
# Create a shared body?

export class MethodDeclaration < Func

	prop variable

	def scopetype do MethodScope

	def visit
		# prebreak # make sure this has a break?
		scope.visit

		if String(name) == 'initialize'
			self.type = :constructor

		if option(:greedy)
			warn "deprecated"
			# set(greedy: true)
			# p "BODY EXPRESSIONS!! This is a fragment"
			var tree = TagTree.new
			@body = body.consume(tree)
			# body.nodes = [Arr.new(body.nodes)]

		
		@context = scope.parent.closure
		@params.traverse

		if target isa Self
			@target = @context.context
			set(static: yes)

		if context isa ClassScope
			@target ||= context.context
			# register as class-method?
			# should register for this
			# console.log "context is classscope {@name}"

		if !@target
			# should not be registered on the outermost closure?
			@variable = context.register(name, self, type: 'meth')

		@body.traverse # so soon?

		self

	def supername
		type == :constructor ? type : name


	# FIXME export global etc are NOT valid for methods inside any other scope than
	# the outermost scope (root)

	def js o
		# FIXME Do this in the grammar - remnants of old implementation
		unless type == :constructor or option(:noreturn)
			if option(:greedy)
				# haaack
				body.consume(GreedyReturn.new)
			else
				body.consume(ImplicitReturn.new) 
		var code = scope.c(indent: yes, braces: yes)

		# same for Func -- should generalize
		var name = typeof @name == 'string' ? @name : @name.c
		name = name.replace(/\./g,'_')

		# var name = self.name.c.replace(/\./g,'_') # WHAT?
		var foot = []

		var left = ""
		var func = "({params.c})" + code # .wrap
		var target = self.target
		var decl = !option(:global) and !option(:export)

		if target isa ScopeContext
			# the target is a scope context
			target = null

		var ctx = context
		var out = ""
		var mark = mark__(option('def'))
		# if ctx 

		var fname = sym__(self.name)
		# console.log "symbolize {self.name} -- {fname}"
		var fdecl = fname # decl ? fname : ''

		if ctx isa ClassScope and !target
			if type == :constructor
				out = "{mark}function {fname}{func}"
			elif option(:static)
				out = "{mark}{ctx.context.c}.{fname} = function {func}"
			else
				out = "{mark}{ctx.context.c}.prototype.{fname} = function {func}"

		elif ctx isa FileScope and !target
			# register method as a root-function, but with auto-call? hmm
			# should probably set using variable directly instead, no?
			out = "{mark}function {fdecl}{func}"

		elif target and option(:static)
			out = "{mark}{target.c}.{fname} = function {func}"

		elif target
			out = "{mark}{target.c}.prototype.{fname} = function {func}"
		else
			out = "{mark}function {fdecl}{func}"

		if option(:global)
			out = "{fname} = {out}"

		if option(:export)
			out = "{out}; exports.{fname} = {fname};"

		out


export class TagFragmentDeclaration < MethodDeclaration


var propTemplate = '''
${headers}
${path}.__${getter} = ${options};
${path}.${getter} = function(v){ return ${get}; }
${path}.${setter} = function(v){ ${set}; return this; }
${init}
'''

var propWatchTemplate = '''
${headers}
${path}.__${getter} = ${options};
${path}.${getter} = function(v){ return ${get}; }
${path}.${setter} = function(v){
	var a = this.${getter}();
	if(v != a) { v = ${set}; }
	if(v != a) { ${ondirty} }
	return this;
}
${init}
'''

export class PropertyDeclaration < Node

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
		var key = name.c
		var gets = "@{key}"
		var sets = "@{key} = v"
		var scope = STACK.scope

		var deflt = options.key(:default)
		var init = deflt ? "self:prototype.@{key} = {deflt.value.c}" : ""

		# var pars =
		# 	watch: o.key(:watch)
		# 	delegate: o.key(:delegate)

		var pars = o.hash

		var isAttr = (@token and String(@token) == 'attr') or o.key(:attr)

		var js =
			key: key
			getter: key
			setter: sym__("set-{key}")
			scope: "{scope.context.c}" 
			path: '${scope}.prototype'
			set: "this._{key} = v"
			get: "this._{key}"
			init: ""
			headers: ""
			ondirty: ""

		var tpl = propTemplate

		o.add('name',Symbol.new(key))

		if pars:watch
			# p "watch is a property {pars:watch}"
			tpl = propWatchTemplate unless pars:watch isa Bool and !pars:watch.truthy
			var wfn = "{key}DidSet"

			if pars:watch isa Symbol
				wfn = pars:watch
			elif pars:watch isa Bool
				o.key(:watch).value = Symbol.new("{key}DidSet")

			# should check for the function first, no?
			# HACK
			# o.key(:watch).value = Symbol
			var fn = OP('.',This.new,wfn)
			js:ondirty = OP('&&',fn,CALL(fn,['v','a',"this.__{key}"])).c # CALLSELF(wfn,[]).c
			# js:ondirty = "if(this.{wfn}) this.{wfn}(v,a,this.__{key});"

		if pars:observe
			if pars:observe isa Bool
				o.key(:observe).value = Symbol.new("{key}DidEmit")

			tpl = propWatchTemplate
			js:ondirty = "Imba.observeProperty(this,'{key}',{o.key(:observe).value.c},v,a);" + (js:ondirty or '')
			# OP('&&',fn,CALL(fn,['v','a',"this.__{key}"])).c

		if (@token and String(@token) == 'attr') or o.key(:dom) or o.key(:attr)
			# need to make sure o has a key for attr then - so that the delegate can know?
			js:set = "this.setAttribute('{key}',v)"
			js:get = "this.getAttribute('{key}')"

		elif o.key(:delegate)
			# if we have a delegate
			js:set = "this.__{key}.delegate.set(this,'{key}',v,this.__{key})"
			js:get = "this.__{key}.delegate.get(this,'{key}',this.__{key})"



		if deflt
			# add better default-support here - go through class-method setAttribute instead
			if o.key(:dom)
				js:init = "{js:scope}.dom().setAttribute('{key}',{deflt.value.c});"
			else
				js:init = "{js:scope}.prototype._{key} = {deflt.value.c};"

		if o.key(:chainable)
			js:get = "v !== undefined ? (this.{js:setter}(v),this) : {js:get}"

		js:options = o.c

		var reg = /\$\{(\w+)\}/gm
		# var tpl = o.key(:watch) ? propWatchTemplate : propTemplate
		var out = tpl.replace(reg) do |m,a| js[a]
		# run another time for nesting. hacky
		out = out.replace(reg) do |m,a| js[a]
		out = out.replace(/\n\s*$/,'')
		
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
		@value = v

	def toString
		"" + value

	def hasSideEffects
		false
		

export class Bool < Literal

	def initialize v
		@value = v
		@raw = String(v) == "true" ? true : false

	def cache
		self

	def isPrimitive
		yes

	def truthy
		# p "bool is truthy? {value}"
		String(value) == "true"
		# yes

	def js o
		String(@value)

	def c
		STACK.@counter += 1
		# undefined should not be a bool
		String(@value)
		# @raw ? "true" : "false"

export class Undefined < Literal
	
	def isPrimitive
		yes

	def c
		mark__(@value) + "undefined"

export class Nil < Literal
	
	def isPrimitive
		yes

	def c
		mark__(@value) + "null"

export class True < Bool

	def raw
		true

	def c
		mark__(@value) + "true"
		
export class False < Bool

	def raw
		false

	def c
		mark__(@value) + "false"

export class Num < Literal
	
	# value is token - should not be
	def initialize v
		@traversed = no
		@value = v

	def toString
		String(@value)

	def isPrimitive deep
		yes

	def shouldParenthesize par = up
		par isa Access and par.left == self

	def js o
		var num = String(@value)
		# console.log "compiled num to {num}"
		return num

	def c o
		return super(o) if @cache
		var js = String(@value)
		var par = STACK.current
		var paren = par isa Access and par.left == self
		# only if this is the right part of teh acces
		# console.log "should paren?? {shouldParenthesize}"
		paren ? "({mark__(@value)}" + js + ")" : (mark__(@value) + js)
		# @cache ? super(o) : String(@value)

	def cache o
		# p "cache num",o
		return self unless o and (o:cache or o:pool)
		super(o)

	def raw
		# really?
		JSON.parse(String(value))

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

	def escapeString str
		# var idx = 0
		# var len = str:length
		# var chr
		# while chr = str[idx++]
		str = str.replace(/\n/g, '\\\n')

	def js o
		# creating the string
		var parts = []
		var str = '('

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
		str += ')'
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
		@raw ||= sym__(value)

	def js o
		"'{sym__(value)}'"

export class RegExp < Literal

	def isPrimitive
		yes

	# def toString
	# 	"" + value

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
		# p "value of array isa {@value}"

		# for v in @value
		# 	break splat = yes if v isa Splat
		# var splat = value.some(|v| v isa Splat)

		if splat
			# "SPLATTED ARRAY!"
			# if we know for certain that the splats are arrays we can drop the slice?
			# p "array is splat?!?"
			var slices = []
			var group = null

			for v in nodes
				if v isa Splat
					slices.push(v)
					group = null
				else
					slices.push(group = Arr.new([])) unless group
					group.push(v)

			"[].concat({cary__(slices).join(", ")})"
		else
			# very temporary. need a more generic way to prettify code
			# should depend on the length of the inner items etc
			# if @indented or option(:indent) or value.@indented
			#	"[\n{value.c.join(",\n").indent}\n]"
			var out = val isa Array ? cary__(val) : val.c
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
			# p "dynamic keys! {dyn}"
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

	prop scope

	def initialize scope
		@scope = scope

	def cache
		self

	def reference
		return self

	def c
		var s = scope__
		(s ? s.context.c : "this")

export class ImplicitSelf < Self
		
export class This < Self

	def cache
		self

	def reference
		# p "referencing this"
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
			out = "{l} {mark__(@opToken)}{op} {r}"
		elif l
			out = "{mark__(@opToken)}{op}{l}"
		# out = out.parenthesize if up isa Op # really?
		out

	def shouldParenthesize
		@parens
		# option(:parens)

	def precedence
		10

	def consume node
		# p "Op.consume {node}".cyan
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

		# p "invert {@op}"
		# p "inverted comparison(!) {idx} {op} -> {pairs[idx]}"
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
		return "{l} {mark__(@opToken)}{op} {r}"

		
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

	def js o
		var l = @left
		var r = @right
		# all of this could really be done i a much
		# cleaner way.
		# l.set(parens: yes) if l # are we really sure about this?
		# r.set(parens: yes) if r

		if op == '!'
			# l.@parens = yes
			var str = l.c
			var paren = l.shouldParenthesize(self)
			# p "check for parens in !: {str} {l} {l.@parens} {l.shouldParenthesize(self)}"
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
		# p right.inspect

		if right isa Const
			# WARN otherwise - what do we do? does not work with dynamic
			# classes etc? Should probably send to utility function isa$
			var name = c__(right.value)
			var obj = left.node
			# TODO also check for primitive-constructor
			if name in ['String','Number','Boolean']
				unless obj isa LocalVarAccess
					obj.cache
				# need a double check for these (cache left) - possibly
				return "(typeof {obj.c}=='{name.toLowerCase}'||{obj.c} instanceof {name})"
			
				# convert
		var out = "{left.c} {op} {right.c}"

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

export var K_IVAR = 1
export var K_SYM = 2
export var K_STR = 3
export var K_PROP = 4

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
			raw = rgt.c

		if safechain and ctx
			ctx.cache(force: yes)
			pre = ctx.c + " && "

		# really?
		# var ctx = (left || scope__.context)
		var out = if raw
			# see if it needs quoting
			# need to check to see if it is legal
			ctx ? "{ctx.c}.{raw}" : raw
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
			# p "converting to call"
			var ast = CALL(OP('.',left,right),[]) # convert to ArgList or null
			ast.receiver = rec
			return ast.c

		var up = up

		unless up isa Call
			# p "convert to call instead"
			var ast = CALL(Access.new(op,left,right),[])
			return ast.c

		# really need to fix this - for sure
		# should be possible for the function to remove this this instead?
		var js = "{super(o)}"

		unless (up isa Call or up isa Util.IsFunction)
			# p "Called"
			js += "()"

		return js


	def receiver
		if left isa SuperAccess || left isa Super
			SELF
		else
			null


export class IvarAccess < Access

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
		# p "visit {self}"


		var scope = scope__

		# p "look for variable named {value} in {scope}"

		var variable = scope.lookup(value)

		# does not really need to have a declarator already? -- tricky
		if variable && variable.declarator
			# var decl = variable.declarator

			# if the variable is not initialized just yet and we are
			# in the same scope - we should not treat this as a var-lookup
			# ie.  var x = x would resolve to var x = this.x() if x
			# was not previously defined

			# should do this even if we are not in the same scope?
			# we only need to be in the same closure(!)

			if variable.@initialized or (scope.closure != variable.scope.closure)
				@variable = variable
				variable.addReference(self)
				@value = variable # variable.accessor(self)
				@token.@variable = variable
				return self

			# p "var is not yet initialized!"
			# p "declarator for var {decl.@declared}"
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
		mark__(@token) + (@variable ? super() : value.c)

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
		# should we really cache this?
		# value.cache(o)

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

	def toString
		"VarOrAccess({value})"

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

		# for now - this can happen
		# if value isa Arr

		super(value)
		@export = no
		@type = type and String(type)
		@variable = null
		@declared = yes # just testing now

	def loc
		# p "loc for VarReference {@value:constructor} {@value.@value:constructor} {@value.region}"
		@value.region

	def set o
		# hack - workaround for hidden classes perf
		@export = yes if o:export
		return self

	def js o
		# experimental fix
		
		# what about resolving?
		var ref = @variable
		var out = ref.c

		# p "VarReference {out} - {o.up} {o.up == self}\n{o}"

		if ref && !ref.@declared # .option(:declared)
			if o.up(VarBlock) # up varblock??
				ref.@declared = yes

				# ref.set(declared: yes)
			elif o.isExpression or @export # why?
				# p "autodeclare"
				ref.autodeclare
			else
				# 
				out = "var {mark__(@value)}{out}"
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
		# p "visit vardecl"
		# console.log "value type for VarReference {@value} {@value.@loc} {@value:constructor}"

		# should be possible to have a VarReference without a name as well? for a system-variable
		# name should not set this way.
		# p "varname {value} {value:constructor}"
		var name = value.c

		# what about looking up? - on register we want to mark
		var v = @variable ||= scope__.register(name, self, type: @type)
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
			# p "case with var!!"
			# converting all nodes to var-references ?
			# do we need to keep it in a varblock at all?
			var vars = l.value.nodes.map do |v|
				# what about inner tuples etc?
				# keep the splats -- clumsy but true
				if v isa Splat
					# p "value is a splat!!"
					v.value = VarReference.new(v.value,l.type) unless v.value isa VarReference
				elif v isa VarReference
					true
				else
					v = VarReference.new(v,l.type)

				return v
				
				# v isa VarReference ? v : VarReference.new(v)
			return TupleAssign.new(o,Tuple.new(vars),r)

		if l isa Arr
			return TupleAssign.new(o,Tuple.new(l.nodes),r)
			# p "left is array in assign - in init"


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

		# p "assign {l} {r} {l.value}"



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
			# p "Assign#c right is not expressable "
			return right.consume(self).c(o)
		# testing this
		return super(o)

	def js o
		unless right.isExpressable
			p "Assign#js right is not expressable "
			# here this should be go out of the stack(!)
			# it should already be consumed?
			return right.consume(self).c

		# p "assign left {left:contrstru}"
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
				# p "Assign is used {stack}"
				# dont cache it again if it is already cached(!)
				right.cache(pool: 'val', uses: 1) unless right.cachevar # 
				# this is only when used.. should be more clever about it
				ast = Parens.new(blk__([ast,right]))

			# should check the up-value no?
			return ast.c(expression: yes)

		# if l isa VarReference
		# 	p "assign var-ref"
		# 	l.@variable.assigned(r)

		# FIXME -- does not always need to be an expression?
		# p "typeof op {@opToken and @opToken:constructor}"
		var out = "{l.c} {mark__(@opToken)}{op} {right.c(expression: true)}"

		return out

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
		var typ = ExpressionBlock
		if @left and @left isa VarReference
			typ = VarBlock
		# might be better to nest this up after parsing is done?
		# p "Assign.addExpression {self} <- {expr}"
		var node = typ.new([self])
		return node.addExpression(expr)


export class PushAssign < Assign

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
			# p "conditional-assign {l} {l.left} {l.right}"
			if l.left
				# p "cache l.left {l.left:constructor}̋"
				l.left.cache 
			ls = l.clone(l.left,l.right) # this should still be cached?
			l.cache if l isa PropertyAccess # correct now, to a certain degree
			if l isa IndexAccess
				# p "cache the right side of indexAccess!!! {l.right}"
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
		# p "ConditionalAssign.js".red
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
		# p "normalize compound assign {left}"
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
			# p "parent is block, should replace!"
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
			# p "making child become a tuple?"
			self.right = Tuple.new([right,expr])
		
		return self

	def visit
		# if the first left-value is a var-reference, then
		# all the variables should be declared as variables.
		# but if we have complex items in the other list - it does become much harder

		# if the first is a var-reference, they should all be(!) .. or splats?
		# this is really a hacky wao to do it though
		if left.first.node isa VarReference
			self.type = 'var'
			# should possibly allow real vars as well, no?
			@vars = left.nodes.filter(|n| n isa VarReference)
			# collect the vars for tuple for easy access

			# NOTE can improve.. should rather make the whole left be a VarBlock or TupleVarBlock
			# p "type is var -- skip the rest"

		right.traverse
		left.traverse
		self

	def js o
		# only for actual inner expressions, otherwise cache the whole array, no?
		unless right.isExpressable
			# p "TupleAssign.consume! {right}".blue
		
			return right.consume(self).c

		# p "TUPLE {type}"

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
			# p "special case with arguments {pars}"
			# forcing the arguments to be named
			# p "got here??? {pars}"
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
					# p "assing splat at index {i} to slice {li} - {to}".cyan
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
						# p "now cache"
						pairs.slice(i).map do |part|
							if part[1].hasSideEffects
								@temporary.push(part[1]) # need a generalized way to do this type of thing
								ast.push(part[1].cache(force: yes, pool: 'swap', declared: typ == 'var'))
						# p "from {i} - cache all remaining with side-effects"

				# if the previous value in ast is a reference to our value - the caching was not needed
				if ast.last == r
					r.decache
					# p "was cached - not needed"
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
			
			var blktype = typ == 'var' ? VarBlock : Block
			var blk = blktype.new([])
			# blk = top if typ == 'var'
			ast.push(blk)

			# if the lvals are not variables - we need to preassign
			# can also use slice here for simplicity, but try with while now			
			lft.map do |l,i|
				if l == lsplat
					var lvar = l.node
					var rem = llen - i - 1 # remaining after splat

					if typ != 'var'
						var arr = util.array(OP('-',len, num__(i + rem) ),yes)
						top.push(arr)
						lvar = arr.cachevar
					else
						ast.push(blk = blktype.new) unless blk
						var arr = util.array( OP('-',len,num__(i + rem) ) )
						blk.push(OP('=',lvar,arr))

					# if !lvar:variable || !lvar.variable # lvar = 
					# 	top.push()
					#	p "has variable - no need to create a temp"
					# blk.push(OP('=',lvar,Arr.new([]))) # dont precalculate size now
					# max = to = (rlen - (llen - i))
					
					 
					var test = rem ? OP('-',len,rem) : len

					var set = OP('=',
						OP('.',lvar,OP('-',idx,num__(i))),
						OP('.',iter,OP('++',idx))
					)

					ast.push(WHILE(OP('<',idx,test), set))

					if typ != 'var'
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
					blk.push(OP('=',l,OP('.',iter,num__(i) )))

		# if we are in an expression we really need to 
		if o.isExpression and @vars
			# p "tuple is expression" # variables MUST be autodeclared outside of the expression
			for v in @vars
				v.variable.autodeclare

		elif @vars
			for v in @vars
				# p "predeclare variable before compilation"
				v.variable.predeclared

		# is there any reason to make it into an expression?
		if ast.isExpressable # NO!
			# p "express"
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
		@symbol ||= sym__(value)

	def setter
		# console.log "Identifier#setter"
		@setter ||= Identifier.new("set-{value.c}")

	def toString
		String(@value)

	def alias
		sym__(@value)

	def js o
		symbol

	def c
		return symbol

	def dump
		{ loc: region }

		
export class TagId < Identifier

	def initialize v
		@value = v isa Identifier ? v.value : v
		self

	def c
		"id$('{value.c}')"
		
# This is not an identifier - it is really a string
# Is this not a literal?

# FIXME Rename to IvarLiteral? or simply Literal with type Ivar
export class Ivar < Identifier

	def initialize v
		@value = v isa Identifier ? v.value : v
		self

	def name
		helpers.camelCase(@value).replace(/^@/,'')
		# value.c.camelCase.replace(/^@/,'')

	def alias
		'_' + name

	# the @ should possibly be gone from the start?
	def js o
		'_' + name

	def c
		mark__(@value) + '_' + helpers.camelCase(@value).slice(1) # .replace(/^@/,'')

# Ambiguous - We need to be consistent about Const vs ConstAccess
# Becomes more important when we implement typeinference and code-analysis
export class Const < Identifier
		
	def symbol
		# console.log "Identifier#symbol {value}"
		@symbol ||= sym__(value)

	def js o
		symbol

	def c
		mark__(@value) + symbol

export class TagTypeIdentifier < Identifier

	prop name
	prop ns

	def initialize value
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
		# p "tagtypeidentifier.js {self}"
		return "IMBA_TAGS.{@str.replace(":","$")}"

	def c
		js

	def func
		var name = @name.replace(/-/g,'_').replace(/\#/,'')
		name += "${@ns.toLowerCase}" if @ns
		name

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
		"{c__(par.name)}" # c


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
			# p "Call callee {callee} - {str}"
			if str == 'extern'
				# p "returning extern instead!"
				callee.value.value.@type = 'EXTERN'
				return ExternDeclaration.new(args)
			if str == 'tag'
				# console.log "ERROR - access args by some method"
				return TagWrapper.new(args and args:index ? args.index(0) : args[0])
			if str == 'export'
				return ExportStatement.new(args)

		@callee = callee
		@args = args or ArgList.new([])

		if args isa Array
			@args = ArgList.new(args)
			# console.log "ARGUMENTS IS ARRAY - error {args}"
		# p "call opexists {opexists}"
		self

	def visit
		# console.log "visit args {args}"
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

	def js o
		var opt = expression: yes
		var rec = null
		# var args = compact__(args) # really?
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
			# p "unwrapping property-access in call"
			@receiver = callee.receiver
			callee = @callee = Access.new(callee.op,callee.left,callee.right)
			# p "got here? {callee}"
			# console.log "unwrapping the propertyAccess"

		if callee.safechain
			# p "callee is safechained?!?"
			# if lft isa Call
			# if lft isa Call # could be a property access as well - it is the same?
			# if it is a local var access we simply check if it is a function, then call
			# but it should be safechained outside as well?
			# lft.cache if lft
			# the outer safechain should not cache the whole call - only ask to cache
			# the result? -- chain onto
			# p "Call safechain {callee} {lft}.{rgt}"
			var isfn = Util.IsFunction.new([callee])
			wrap = ["{isfn.c}  &&  ",""]
			callee = OP('.',callee.left,callee.right)
			# callee should already be cached now - 

		# should just force expression from the start, no?
		if splat
			# important to wrap the single value in a value, to keep implicit call
			# this is due to the way we check for an outer Call without checking if
			# we are the receiver (in PropertyAccess). Should rather wrap in CallArguments
			var ary = (args.count == 1 ? ValueNode.new(args.first.value) : Arr.new(args.list))
			receiver.cache # need to cache the target
			out = "{callee.c(expression: yes)}.apply({receiver.c},{ary.c(expression: yes)})"

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
			# p "special caching for call"
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
		# 
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

		# p "visiting externdeclaration"
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



export class ControlFlowStatement < ControlFlow

	def isExpressable
		no



export class If < ControlFlow


	prop test
	prop body
	prop alt
	prop scope

	def self.ternary cond, body, alt
		# prefer to compile it this way as well
		var obj = If.new(cond, Block.new([body]), type: '?')
		obj.addElse Block.new([alt])
		return obj

	def addElse add
		# p "add else!",add
		if alt && alt isa If
			# p 'add to the inner else(!)',add
			alt.addElse(add)
		else
			self.alt = add
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

	def invert
		if @test isa ComparisonOp
			@test = @test.invert
		else
			@test = UnaryOp.new('!',@test,null)

	def visit
		var alt = alt

		@scope.visit if @scope
		test.traverse if test
		body.traverse if body

		# should skip the scope in alt.
		if alt
			# p "scoping {STACK.scopes:length}"
			STACK.pop(self)
			alt.@scope ||= BlockScope.new(alt)
			alt.traverse
			STACK.push(self)

			# if alt isa If
			# 	# alt.@scope.visit if alt.@scope
			# 	true
			# else
			# 	
			# 	p "else-block isa {alt}"

			# popping ourselves from stack while we
			# traverse the alternate route
			
		# force it as expression?
		toExpression if @type == '?' and isExpressable
		self


	def js o
		var body = body
		# would possibly want to look up / out 
		var brace = braces: yes, indent: yes

		var cond = test.c(expression: yes) # the condition is always an expression

		if o.isExpression
			var code = body.c # (braces: yes)
			code = '(' + code + ')' # if code.indexOf(',') >= 0
			# is expression!
			if alt
				# console.log "type of ternary {test}"
				# be safe - wrap condition as well
				# ask for parens
				return "{cond} ? {code} : ({alt.c})"
			else
				# again - we need a better way to decide what needs parens
				# maybe better if we rewrite this to an OP('&&'), and put
				# the parens logic there
				# cond should possibly have parens - but where do we decide?
				return "({cond}) && {code}"
		else
			# if there is only a single item - and it is an expression?
			var code = nil
			# if body.count == 1 # dont indent by ourselves?

			if body isa Block and body.count == 1
				body = body.first

			# if body.count == 1
			#	p "one item only!"
			#	body = body.first

			code = body.c(braces: yes) # (braces: yes)
			# don't wrap if it is only a single expression?
			var out = "{mark__(@type)}if ({cond}) " + code # ' {' + code + '}' # '{' + code + '}'
			out += " else {alt.c(alt isa If ? {} : brace)}" if alt
			out

	def sourceMapMarker
		self

	def consume node
		# p 'assignify if?!'
		# if it is possible, convert into expression
		if node isa TagTree
			@body = @body.consume(node)
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
			@body = @body.consume(node)
			@alt = @alt.consume(node) if @alt
		self


	def isExpressable
		# process:stdout.write 'x'
		var exp = body.isExpressable && (!alt || alt.isExpressable)
		return exp



export class Loop < Statement


	prop scope
	prop options
	prop body
	prop catcher


	def initialize options = {}
		@traversed = no
		@options = options
		@body = null
		self


	def set obj
		# p "configure for!"
		@options ||= {}
		var keys = Object.keys(obj)
		for k in keys
			@options[k] = obj[k]
		self


	def addBody body
		self.body = blk__(body)
		self


	def c o

		var s = stack
		var curr = s.current
		# p "Loop.c - {isExpressable} {stack} {stack.isExpression}"
		# p "stack is expression? {o} {isExpression}"



		if stack.isExpression or isExpression
			# p "the stack is an expression for loop now(!)"
			# what the inner one should not be an expression though?
			# this will resut in an infinite loop, no?!?
			var ast = CALL(FN([],[self]),[])
			return ast.c o
		
		elif stack.current isa Block or (s.up isa Block and s.current.@consumer == self)
		
			# p "what is the current stack of loop? {stack.current}"
			super.c o
		else
			# p "Should never get here?!?"
			var ast = CALL(FN([],[self]),[])
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
		# p "invert test for while? {@test}"
		if option(:invert)
			# "invert test for while {@test}"
			@test = test.invert 
		# invert the test


	def visit
		scope.visit
		test.traverse if test
		body.traverse if body


	# TODO BUG -- when we declare a var like: while var y = ...
	# the variable will be declared in the WhileScope which never
	# force-declares the inner variables in the scope

	def consume node
		# p "While.consume {node}".cyan
		# This is never expressable, but at some point
		# we might want to wrap it in a function (like CS)
		return super if isExpressable

		if node isa TagTree
			# WARN this is a hack to allow references coming through the wrapping scope 
			# will result in unneeded self-declarations and other oddities
			scope.context.reference
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
		# p "Creating value to store the result of loop".cyan
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
			# p "while-block has declared variables(!)"
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

	def visit
		scope.visit
		options[:source].traverse # what about awakening the vars here?
		declare
		# should be able to toggle whether to keep the results here already(!)

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
		# p "source is a {src} - {bare}"
		# var i = vars:index = oi ? scope.declare(oi,0) : util.counter(0,yes).predeclare

		# what about a range where we also include an index?
		if src isa Range
			# p "range for-loop"

			# really? declare? 
			# are we sure? _really_?
			vars:len = scope.declare('len',src.right) # util.len(o,yes).predeclare
			# make the scope be the declarator
			vars:index = scope.register(o:name,scope,type: 'let', declared: yes)
			# p "registered {vars:index:constructor}"
			# p "index-var is declareod?!?! {vars:index.@declared}"
			scope.vars.push(vars:index.assignment(src.left))
			# scope.declare(options:name,src.left)
			vars:value = vars:index
		else
			# vars:value = scope.declare(options:name,null,let: yes)
			# we are using automatic caching far too much here

			# we should simply change how declare works
			var i = vars:index = oi ? scope.declare(oi,0,type: 'let') : util.counter(0,yes,scope).predeclare

			vars:source = bare ? src : util.iterable(src,yes).predeclare
			vars:len    = util.len(vars:source,yes).predeclare

			vars:value = scope.declare(o:name,null,type: 'let')
			vars:value.addReference(o:name) # adding reference!
			i.addReference(oi) if oi

		return self


	def consume node

		if isExpressable
			return super 

		# other cases as well, no?
		if node isa TagTree
			scope.context.reference
			var ref = node.root.reference
			node.@loop = self

			# Should not be consumed the same way
			body.consume(node)
			node.@loop = null
			let fn = Lambda.new([Param.new(ref)],[self])
			fn.scope.wrap(scope)
			# TODO Scope of generated lambda should be added into stack for
			# variable naming / resolution
			return CALL(fn,[ref])


		if @resvar
			# p "already have a resvar -- change consume? {node}"
			var ast = Block.new([self,BR,@resvar.accessor])
			ast.consume(node)
			return ast
		
		# if node isa return -- do something else

		var resvar = null
		var reuseable = no # node isa Assign && node.left.node isa LocalVarAccess
		var assignee = null
		# might only work for locals?
		if node isa Assign
			if var receiver = node.left
				assignee = receiver.@variable
				if receiver.@variable
					# assignee
					reuseable = yes

		# p "reusable?!?! {node} {node}"

		# WARN Optimization - might have untended side-effects
		# if we are assigning directly to a local variable, we simply
		# use said variable for the inner res
		if reuseable and assignee
			# instead of declaring it in the scope - why not declare it outside?
			# it might already exist in the outer scope no?
			# p "reuseable {assignee} {scope} {scope.parent.lookup(assignee)}"
			# assignee.resolve
			# should probably instead alter the assign-node to set value to a blank array
			# resvar = scope.parent.declare(assignee,Arr.new([]),proxy: yes,pos: 0)

			# this variable should really not be redeclared inside here at all
			assignee.resolve
			# resvar = @resvar = scope.declare(assignee,Arr.new([]),proxy: yes)

			# dont declare it - simply push an assign into the vardecl of scope
			scope.vars.unshift(OP('=',assignee,Arr.new([])))
			resvar = @resvar = assignee

			node.@consumer = self
			node = null

			# p "consume variable declarator!?".cyan
		else
			# declare the variable we will use to soak up results
			# p "Creating value to store the result of loop".cyan
			# what about a pool here?
			resvar = @resvar = scope.declare(:res,Arr.new([]),system: yes)

		@catcher = PushAssign.new("push",resvar,null) # the value is not preset
		body.consume(@catcher) # should still return the same body



		if node
			# p "returning new ast where Loop is first"
			var ast = Block.new([self,BR,resvar.accessor.consume(node)])
			return ast
		# var ast = Block.new([self,BR,resvar.accessor])
		# ast.consume(node) if node
		# return ast
		# p "Loop did consume successfully"
		return self

		# this is never an expression (for now -- but still)
		# return ast


	def js o
		var vars = options:vars
		var i = vars:index
		var val = vars:value
		var cond = OP('<',i,vars:len)
		var src = options:source

		# p "references for value",val.references:length

		var final = if options:step
			OP('=',i,OP('+',i,options:step))
		else
			OP('++',i)

		# if there are few references to the value - we can drop
		# the actual variable and instead make it proxy through the index
		if src isa Range
			cond.op = '<=' if src.inclusive
		
		elif val.refcount < 3 and val.assignments:length == 0
			# p "proxy the value {val.assignments:length}"
			# p "should proxy value-variable instead"
			val.proxy(vars:source,i)
		else
			body.unshift(OP('=',val,OP('.',vars:source,i)), BR)
			# body.unshift(head)
			# TODO check lengths - intelligently decide whether to brace and indent
		var head = "{mark__(options:keyword)}for ({scope.vars.c}; {cond.c}; {final.c}) "
		head + body.c(braces: yes, indent: yes) # .wrap


	def head
		var vars = options:vars
		OP('=',vars:value,OP('.',vars:source,vars:index))



export class ForIn < For


		
export class ForOf < For

	def declare
		var o = options
		var vars = o:vars = {}

		# see if 

		# p "ForOf source isa {o:source}"

		# if o:source is a variable -- refer directly # variable? is this the issue?
		# p scope.@varmap['o'], scope.parent.@varmap['o']

		var src = vars:source = o:source.@variable || scope.declare('o',o:source, system: true, type: 'let')
		var v = vars:value = scope.declare(o:index,null,let: yes) if o:index

		# p "ForOf o:index {o:index} o:name {o:name}"
		# if o:index
		
		# possibly proxy the index-variable?

		if o:own
			var i = vars:index = scope.declare('i',0,system: true, type: 'let') # mark as a counter?
			# systemvariable -- should not really be added to the map
			var keys = vars:keys = scope.declare('keys',Util.keys(src.accessor),system: yes, type: 'let') # the outer one should resolve first
			var l = vars:len = scope.declare('l',Util.len(keys.accessor),system: yes, type: 'let')
			var k = vars:key = scope.register(o:name,o:name,type: 'let') # scope.declare(o:name,null,system: yes)
		else
			# we set the var -- why even declare it
			# no need to declare -- it will declare itself in the loop - no?
			var k = vars:key = scope.register(o:name,o:name,type: 'let')
		
		# TODO use util - why add references already? Ah -- this is for the highlighting
		v.addReference(o:index) if v and o:index
		k.addReference(o:name) if k and o:name

		self

	def js o
		var vars = options:vars

		var o = vars:source
		var k = vars:key
		var v = vars:value
		var i = vars:index


		if v 
			# set value as proxy of object[key]
			# possibly make it a ref? what is happening?
			v.refcount < 3 ? v.proxy(o,k) : body.unshift(OP('=',v,OP('.',o,k)))

		if options:own

			if k.refcount < 3 # should probably adjust these
				k.proxy(vars:keys,i)
			else
				body.unshift(OP('=',k,OP('.',vars:keys,i)))

			var head = "{mark__(options:keyword)}for ({scope.vars.c}; {OP('<',i,vars:len).c}; {OP('++',i).c})"
			return head + body.c(indent: yes, braces: yes) # .wrap

		var code = body.c(braces: yes, indent: yes)
		# it is really important that this is a treated as a statement
		scope.vars.c + ";\n{mark__(options:keyword)}for (var {k.c} in {o.c})" + code

	def head
		var v = options:vars

		[
			OP('=',v:key,OP('.',v:keys,v:index))
			OP('=',v:value,OP('.',v:source,v:key)) if v:value
		]

# NO NEED?
export class Begin < Block


	def initialize body
		@nodes = blk__(body).nodes


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
		@cases = @cases.map(|item| item.consume(node))
		@fallback = @fallback.consume(node) if @fallback
		self


	def js o
		var body = []

		for part in cases
			part.autobreak
			body.push(part)

		if fallback
			body.push("default:\n" + fallback.c(indent: yes))

		"switch ({source.c}) " + helpers.bracketize(cary__(body).join("\n"),yes)



export class SwitchCase < ControlFlowStatement


	prop test
	prop body


	def initialize test, body
		@traversed = no
		@test = test
		@body = blk__(body)

	def visit
		body.traverse


	def consume node
		body.consume(node)
		self


	def autobreak
		body.push(BreakStatement.new) unless body.last isa BreakStatement
		self


	def js o
		@test = [@test] unless @test isa Array 
		var cases = @test.map do |item| "case {item.c}:"
		cases.join("\n") + body.c(indent: yes) # .indent



export class Try < ControlFlowStatement


	prop body
	# prop ncatch
	# prop nfinally

	def initialize body, c, f
		@traversed = no
		@body = blk__(body)
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
		@body = blk__(body or [])
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
		@body = blk__(body or [])


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


TAG_TYPES = {}
TAG_ATTRS = {}


TAG_TYPES.HTML = "a abbr address area article aside audio b base bdi bdo big blockquote body br 
button canvas caption cite code col colgroup data datalist dd del details dfn 
div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 
head header hr html i iframe img input ins kbd keygen label legend li link 
main map mark menu menuitem meta meter nav noscript object ol optgroup option 
output p param pre progress q rp rt ruby s samp script section select small 
source span strong style sub summary sup table tbody td textarea tfoot th 
thead time title tr track u ul var video wbr".split(" ")

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


export class TagDesc < Node

	def initialize
		p 'TagDesc!!!',$0
		self

	def classes
		p 'TagDescClasses',$0
		self

export class Tag < Node

	prop parts
	prop object
	prop reactive
	prop parent
	prop tree

	def initialize o = {}
		@traversed = no
		@parts = []
		o:classes ||= []
		o:attributes ||= []
		o:classes ||= []
		@options = o
		@reference = null
		@object = null
		@tree = null
		self

	def set obj
		for own k,v of obj
			if k == 'attributes'
				# p "attributs!"
				addAttribute(atr) for atr in v
				continue

			@options[k] = v
		self

	def addClass node
		unless node isa TagFlag
			node = TagFlag.new(node)
		@options:classes.push(node)
		@parts.push(node)

		# p "add class!!!"
		self

	def addIndex node
		@parts.push(node)
		@object = node
		self

	def addSymbol node
		# p "addSymbol to the tag",node
		if @parts:length == 0
			@parts.push(node)
			@options:ns = node
		self
		

	def addAttribute atr
		# p "add attribute!!!", key, value
		@parts.push(atr) # what?
		@options:attributes.push(atr)
		self

	def enclosing
		(@options:close and @options:close.value)

	def type
		@options:type || :div

	def consume node
		var o = @options


		if node isa TagTree
			# p "tag consume tagtree? {node.reactive}"
			parent = node.root
			# o:treeRef = node.nextCacheKey

			if node.@loop
				reactive = !!option(:key)

				if option(:ivar)
					warn "Tag inside loop can not have a static reference {option(:ivar)}", type: 'error', token: option(:ivar).value

			else
				reactive = node.reactive or !!option(:ivar)
			
			return self

		super


	def visit

		var o = @options

		if o:ivar or o:key
			reactive = yes

		var typ = enclosing

		# look for outer tag here?

		if typ == '->' or typ == '=>'
			# console.log "tag is template?!? {typ}"
			@tree = TagTree.new(self,o:body, root: self, reactive: reactive)
			o:body = TagFragmentFunc.new([],Block.wrap([@tree]))
			# console.log "made o body a function?"

		o:key.traverse if o:key

		if o:body
			o:body.traverse

		# id should also be a regular part
	
		o:id.traverse if o:id
		

		for part in @parts
			part.traverse

		# for atr in @options:attributes
		# 	atr.traverse

		self

	def reference
		@reference ||= scope__.temporary(self,pool: 'tag').resolve

	# should this not happen in js?
	# should this not happen in js?
	def js o
		# p JSON.stringify(@options)
		# var attrs = TagAttributes.new(o:attributes)
		# p "got here?"
		var o = @options
		var a = {}
		var enc = enclosing

		var setup = []
		var calls = []
		var statics = []

		var scope = scope__
		var commit = "end"
		var content = o:body

		var isSelf = type isa Self
		var bodySetter = isSelf ? "setChildren" : "setContent"

		# should not cache statics if the node itself is not cached
		# that would only mangle the order in which we set the properties
		var cacheStatics = yes

		for atr in o:attributes
			a[atr.key] = atr.value # .populate(obj)

		var quote = do |str| helpers.singlequote(str)
		var id = o:id isa Node ? o:id.c : (o:id and quote(o:id.c))
		var tree = @tree or null
		var parent = self.parent
		# var parTree = parent and parent.tree


		#  "scope is", !!scope
		# p "type is {type}"
		var out = if isSelf
			commit = "synced"
			# p "got here"
			# setting correct context directly
			reactive = yes
			@reference = scope.context
			scope.context.c

		elif o:id
			"{mark__(o:open)}ti$('{type.func}',{id})"
		else
			"{mark__(o:open)}t$('{type.func}')"

		# this is reactive if it has an ivar
		if o:ivar
			reactive = yes
			statics.push(".setRef({quote(o:ivar.name)},{scope.context.c})")

		if o:body isa Func
			# console.log "o:body isa function!"
			bodySetter = "setTemplate"

		elif o:body
			if o:body isa ArgList and o:body.count == 1 and o:body.first.isString
				bodySetter = "setText"

			else
				# would probably be better to convert to a tagtree during the initial visit
				tree = TagTree.new(self, o:body, root: self, reactive: reactive)
				content = tree
				self.tree = tree

		if tree
			# this is the point where we traverse the inner nodes with our tree
			# should rather happen in visit - long before.
			tree.resolve

		for part in @parts
			var pjs
			var pcache = no

			if part isa TagAttr
				var akey = String(part.key)
				var aval = part.value
				# p "part value {aval} {aval.isPrimitive(yes)}"

				# the attr should compile itself instead -- really
				pcache = aval.isPrimitive

				if akey[0] == '.' # should check in a better way
					pcache = no
					pjs = ".flag({quote(akey.substr(1))},{aval.c})"
				elif akey[0] == ':'
					# need to analyze whether this is static or not
					pjs = ".setHandler({quote(akey.substr(1))},{aval.c},{scope.context.c})"
				else
					pjs = ".{mark__(part.key)}{helpers.setterSym(akey)}({aval.c})"

			elif part isa TagFlag
				pjs = part.c
				pcache = yes

			if pjs
				cacheStatics && pcache ? statics.push(pjs) : calls.push(pjs)



		if object
			calls.push(".setObject({object.c})")

		# p "tagtree is static? {tree.static}"

		# we need to trigger our own reference before the body does
		# but we do not need a reference if we have no body (no nodes will refer it)
		if reactive and tree and tree.hasTags
			reference

		if reactive and parent and parent.tree
			o:treeRef = parent.tree.nextCacheKey(self)
	
		if var body = content and content.c(expression: yes) # force it to be an expression, no?
			calls.push ".{bodySetter}({body})"

			# out += ".body({body})"

		# if o:attributes:length # or -- always?
		# adds lots of extra calls - but okay for now
		calls.push ".{commit}()"

		if statics:length
			out = out + statics.join("")

	
		if (o:ivar or o:key or reactive) and !(type isa Self)
			# if this is an ivar, we should set the reference relative
			# to the outer reference, or possibly right on context?
			var ctx, key
			var partree = parent and parent.tree
			# ctx = !o:ivar and par and par.reference or scope.context
			# key = o:ivar or tree and tree.nextCacheKey

			if o:key
				# closest tag
				# TODO if the dynamic key starts with a static string we should
				# just prepend _ to the string instead of wrapping in OP
				ctx = parent and parent.reference
				key = OP('+',Str.new("'_'"),o:key)

			elif o:ivar
				ctx = scope.context
				key = o:ivar

			else
				ctx = parent and parent.reference
				# ctx = partree.cacher
				key = o:treeRef or partree and partree.nextCacheKey
				# key = tree and tree.nextCacheKey


			# need the context -- might be better to rewrite it for real?
			# parse the whole thing into calls etc
			var acc = OP('.',ctx,key).c

			if @reference
				out = "({reference.c} = {acc} || ({acc} = {out}))"
			else
				out = "({acc} = {acc} || {out})"
			

		# should we not add references to the outer ones first?

		# now work on the refereces?

		# free variable
		@reference.free if @reference isa Variable
		# if setup:length
		#	out += ".setup({setup.join(",")})"

		return out + calls.join("")

# This is a helper-node
# Should probably use the same type of listnode everywhere - and simply flag the type as TagTree instead
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

	# def cacher
	# 	@cacher ||= if true
	# 		if parent and parent.tree
	# 			parent.tree.cacher
	# 		else
	# 			@owner.reference

	def nextCacheKey
		var root = @owner
		
		# if parent and parent.tree # parent tree?
		# 	return parent.tree.nextCacheKey


		# if we want to cache everything on root
		var num = ++@counter
		var base = "A".charCodeAt(0)
		var str = ""

		while true
			num -= 1
			str = String.fromCharCode(base + (num % 26)) + str
			num = Math.floor(num / 26)
			break unless num > 0

		str = (@owner.type isa Self ? "$" : "$$") + str.toLowerCase
		return str
		return num

	def load list
		if list isa ListNode
			# p "is a list node!! {list.count}"
			# we still want the indentation if we are not in a template
			# or, rather - we want the block to get the indentation - not the tree
			@indentation ||= list.@indentation if list.count > 1
			list.nodes
		else
			compact__(list isa Array ? list : [list])

	def root
		option(:root)

	def reactive
		option(:reactive)		

	def resolve
		remap do |c| c.consume(self)
		self

	def static
		@static ?= every do |c| c isa Tag

	def hasTags
		some do |c| c isa Tag

	def c o
		# FIXME TEST what about comments???
		var len = realCount
		var single = len == 1
		var out = super(o)

		if single
			out
		elif reactive or @owner.reactive
			out = "Imba.static([{out}],1)"
		else
			out = "[" + out + "]" # unless single

		return out

export class TagWrapper < ValueNode

	def visit
		if value isa Array
			value.map(|v| v.traverse)
		else
			value.traverse
		self
		
	def c
		"tag$wrap({value.c(expression: yes)})"


export class TagAttributes < ListNode

	def get name
		for node in nodes
			return node if node.key == name
		
		
export class TagAttr < Node

	prop key
	prop value

	def visit
		value.traverse if value
		self

	def initialize k, v
		# p "init TagAttribute", $0
		@traversed = no
		@key = k
		@value = v

	def populate obj
		obj.add(key, value)
		self

	def c
		"attribute"


export class TagFlag < Node

	prop value
	prop toggler

	def initialize value
		@traversed = no
		@value = value
		self

	def visit
		unless @value isa String
			@value.traverse
		self

	def c
		if value isa Node
			".flag({value.c})"
		else
			".flag({helpers.singlequote(value)})"
		
		




# SELECTORS


export class Selector < ListNode
	
	def initialize list, options
		@nodes = list or []
		@options = options
		
	def add part, typ
		# p "select add!",part,typ
		# mark if special?
		push(part)
		self

	def group
		# console.log "grouped!"
		# for now we simply add a comma
		# how would this work for dst?
		@nodes.push(SelectorGroup.new(","))
		self

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
		var q = c__(query)

		if typ == '%'
			"q$({q},{o.scope.context.c(explicit: yes)})" # explicit context
		elif typ == '%%'
			"q$$({q},{o.scope.context.c(explicit: yes)})"
		else 
			"q{typ}({q})"

		# return "{typ} {scoped} - {all}"
		

export class SelectorPart < ValueNode

	def c
		c__(@value)
		# "{value.c}"

export class SelectorGroup < SelectorPart

	def c
		","

export class SelectorType < SelectorPart

	def c
		# support
		# p "selectortype {value}"
		# var out = value.c
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
			".{c__(@value)}"

export class SelectorId < SelectorPart

	def c
		if @value isa Node
			"#'+{@value.c}+'"
		else
			"#{c__(@value)}"

export class SelectorCombinator < SelectorPart

	def c
		"{c__(@value)}"

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
			"[{@left.c}{@op}\"'+{c__(@right)}+'\"]"
		else
			"[{@left.c}]"
		
			# ...
		



# DEFER

export class Await < ValueNode

	prop func

	def js o
		# introduce a util here, no?
		CALL(OP('.',Util.Promisify.new([value]),'then'),[func]).c
		# value.c
	
	def visit o
		# things are now traversed in a somewhat chaotic order. Need to tighten
		# Create await function - push this value up to block, take the outer
		value.traverse

		var block = o.up(Block) # or up to the closest FUNCTION?
		var outer = o.relative(block,1)
		var par = o.relative(self,-1)

		# p "Block {block} {outer} {par}"

		func = AsyncFunc.new([],[])
		# now we move this node up to the block
		func.body.nodes = block.defers(outer,self)

		# if the outer is a var-assignment, we can simply set the params
		if par isa Assign
			par.left.traverse
			var lft = par.left.node
			# p "Async assignment {par} {lft}"
			# Can be a tuple as well, no?
			if lft isa VarReference
				# the param is already registered?
				# should not force the name already??
				# beware of bugs
				func.params.at(0,yes,lft.variable.name)
			elif lft isa Tuple
				# if this an unfancy tuple, with only vars
				# we can just use arguments

				if par.type == 'var' && !lft.hasSplat
					# p "SIMPLIFY! {lft.nodes[0]}"
					lft.map do |el,i|
						func.params.at(i,yes,el.value)
				else
					# otherwise, do the whole tuple
					# make sure it is a var assignment?
					par.right = ARGUMENTS
					func.body.unshift(par)
			else
				# regular setters
				par.right = func.params.at(0,yes)
				func.body.unshift(par)
				
			

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

	# need to override, since we wont do implicit returns
	# def js
	# 	var code = scope.c
	# 	return "function ({params.c})" + code.wrap



# IMPORTS

export class ImportStatement < Statement


	prop ns
	prop imports
	prop source


	def initialize imports, source, ns
		@traversed = no
		@imports = imports
		@source = source
		@ns = ns
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
				@alias = @imports[0]
				dec.add(@alias,OP('.',CALL(Identifier.new("require"),[source]),@alias))
				dec.traverse
				return self
				
				# dec.add(@alias,CALL(Identifier.new("require"),[source]))

			# p "ImportStatement has imports {@imports:length}"
			# @declarations = VariableDeclaration.new([])
			@moduledecl = dec.add(@alias,CALL(Identifier.new("require"),[source]))
			@moduledecl.traverse


			if @imports:length > 1
				for imp in @imports
					@declarations.add(imp,OP('.',@moduledecl.variable,imp))

			dec.traverse
		self


	def js o

		if @declarations
			return @declarations.c

		var req = CALL(Identifier.new("require"),[source])

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
			# p "source type {source}"
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
		yes
		var nodes = @value.map do |arg|
			"module.exports.{arg.c} = {arg.c};\n"
		nodes.join("")


# UTILS

export class Util < Node

	prop args

	def initialize args
		@args = args
		
	# this is how we deal with it now
	def self.extend a,b
		Util.Extend.new([a,b])

	def self.callImba meth, args
		CALL(OP('.',Const.new("Imba"),Identifier.new(meth)),args)

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
		# p "LEN HELPER".green
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
		return CALL(OP('.',obj,slice),compact__([a,b]))
	
	def self.iterable obj, cache
		var node = Util.Iterable.new([obj])
		node.cache(force: yes, pool: 'iter') if cache
		return node



	def self.union a,b
		Util.Union.new([a,b])
		# CALL(UNION,[a,b])

	def self.intersect a,b
		Util.Intersect.new([a,b])
		# CALL(INTERSECT,[a,b])

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

	def js o
		"helper"

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
		"extend$({compact__(cary__(args)).join(',')})"

export class Util.IndexOf < Util

	def helper
		'''
		function idx$(a,b){
			return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
		};

		'''
		

	def js o
		scope__.root.helper(self,helper)
		# When this is triggered, we need to add it to the top of file?
		"idx$({args.map(|v| v.c ).join(',')})"

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
		# When this is triggered, we need to add it to the top of file?
		scope__.root.helper(self,helper)
		"subclass$({args.map(|v| v.c).join(',')});\n"

export class Util.Promisify < Util

	def helper
		# should also check if it is a real promise
		"function promise$(a)\{ return a instanceof Array ? Promise.all(a) : (a && a.then ? a : Promise.resolve(a)); \}"
		
	def js o
		# When this is triggered, we need to add it to the top of file?
		scope__.root.helper(self,helper)
		"promise$({args.map(|v| v.c).join(',')})"

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
		# only wrap if it is not clear that this is an array?
		scope__.root.helper(self,helper)
		return "iter$({args[0].c})"

export class Util.IsFunction < Util

	def js o
		# p "IS FUNCTION {args[0]}"
		# just plain check for now
		"{args[0].c}"
		# "isfn$({args[0].c})"
		# "typeof {args[0].c} == 'function'"
		

export class Util.Array < Util

	def js o
		# When this is triggered, we need to add it to the top of file?
		"new Array({args.map(|v| v.c)})"







# SCOPES

# handles local variables, self etc. Should create references to outer scopes
# when needed etc.

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

	def initialize node, parent
		@head = []
		@node = node
		@parent = parent
		@vars = VariableDeclaration.new([])
		@closure = self
		@virtual = no
		@counter = 0
		@varmap  = {}
		@varpool = []

	def context
		@context ||= ScopeContext.new(self)

	def traverse
		self

	def visit
		return self if @parent
		# p "visited scope!"
		@parent = STACK.scope(1) # the parent scope
		@level = STACK.scopes:length - 1

		# p "parent is",@parent

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
		var scope = self
		while scope
			return scope if scope isa FileScope
			scope = scope.parent
		return null

	def register name, decl = null, o = {}
		# FIXME re-registering a variable should really return the existing one
		# Again, here we should not really have to deal with system-generated vars
		# But again, it is important

		# p "registering {name}"
		name = helpers.symbolize(name)

		# also look at outer scopes if this is not closed?
		var existing = @varmap.hasOwnProperty(name) && @varmap[name]
		return existing if existing

		var item = Variable.new(self,name,decl,o)
		# need to check for duplicates, and handle this gracefully -
		# going to refactor later
		@varmap[name] = item unless o:system # dont even add to the varmap if it is a sysvar
		return item

	# just like register, but we automatically 
	def declare name, init = null, o = {}
		var variable = register(name,null,o)
		# TODO create the variabledeclaration here instead?
		# if this is a sysvar we need it to be renameable
		var dec = @vars.add(variable,init)
		variable.declarator ||= dec
		return variable

		# p "declare variable {name} {o}"
		# if name isa Variable
		# p "SCOPE declare var".green
		name = helpers.symbolize(name)
		# we will see here
		@vars.add(name,init) # .last -- 
		var decl = @vars.last # bug(!)
		var item
		# item = Variable.new(self,name,decl)

		# if o:system
		# 	item = SystemVariable.new(self,name,decl,o)
		# 	decl.variable = item
		# else
		item = Variable.new(self,name,decl,o)
		decl.variable = item
		item.resolve # why on earth should it resolve immediately?
		
		# decl.variable = item
		# item.resolve # why on earth should it resolve immediately?
		return item

		# should be possible to force-declare for this scope, no?
		# if this is a system-variable 

	# declares a variable (has no real declaration beforehand)


	# what are the differences here? omj
	# we only need a temporary thing with defaults -- that is all
	# change these values, no?
	def temporary refnode, o = {}, name = null

		# p "registering temporary {refnode} {name}"
		# reuse variables -- hmm
		if o:pool
			for v in @varpool
				if v.pool == o:pool && v.declarator == null
					return v.reuse(refnode)

		# should only 'register' as ahidden variable, no?
		# if there are real nodes inside that tries to refer to vars
		# defined in outer scopes, we need to make sure they are not named after this
		var item = SystemVariable.new(self,name,refnode,o)
		@varpool.push(item) # WHAT? It should not be in the pool unless explicitly put there?
		@vars.push(item) # WARN variables should not go directly into a declaration-list
		return item
		# return register(name || "__",null,system: yes, temporary: yes)

	

	def lookup name
		var ret = null
		name = helpers.symbolize(name)
		if @varmap.hasOwnProperty(name)
			ret = @varmap[name] 
		else
			# look up any parent scope ?? seems okay
			# !isClosed && 
			ret = parent && parent.lookup(name)
			# or -- not all scopes have a parent?
		
		# should this not happen by itself?
		# if !ret and 
		#	ret = 
		# ret ||= (g.lookup(name) if var g = root)
		# g = root
		ret

	def autodeclare variable
		vars.push(variable) # only if it does not exist here!!!

	def free variable
		# p "free variable"
		variable.free # :owner = null
		# @varpool.push(variable)
		self
	
	def isClosed
		no

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

		# var head = [@vars,@params].block.c(expression: no)
		# p "head from scope is ({head})"
		# var out = [head or null,body].flatten__.compact.join("\n")
		# out
		# out = '{' + out + 

	def region
		node.body.region

	def dump
		var vars = Object.keys(@varmap).map do |k| 
			var v = @varmap[k]
			v.references:length ? dump__(v) : null

		return \
			type: self:constructor:name
			level: (level or 0)
			vars: compact__(vars)
			loc: region

	def toString
		"{self:constructor:name}"
	

# FileScope is wrong? Rather TopScope or ProgramScope
export class FileScope < Scope

	prop warnings
	prop scopes

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
		register 'clearTimeout', self, type: 'global'
		register 'clearInterval', self, type: 'global'
		register '__dirname', self, type: 'global'

		# preregister global special variables here
		@warnings = []
		@scopes   = []
		@helpers  = []
		@head = [@vars]

	def context
		@context ||= RootScopeContext.new(self)

	def lookup name
		# p "lookup filescope"
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
		# p "warning",JSON.stringify(data)
		@warnings.push(data)
		self

	def dump
		var scopes = @scopes.map(|s| s.dump)
		scopes.unshift(super.dump)

		var obj = 
			warnings: dump__(@warnings)
			scopes: scopes

		return obj
		

export class ClassScope < Scope

	# called for scopes that are not real scopes in js
	# must ensure that the local variables inside of the scopes do not
	# collide with variables in outer scopes -- rename if needed
	def virtualize
		# console.log "virtualizing ClassScope"
		var up = parent
		for own k,v of @varmap
			true
			v.resolve(up,yes) # force new resolve
		self

	def isClosed
		yes

export class TagScope < ClassScope

export class ClosureScope < Scope

export class FunctionScope < Scope

export class MethodScope < Scope

	def isClosed
		yes

export class LambdaScope < Scope

	def context

		# when accessing the outer context we need to make sure that it is cached
		# so this is wrong - but temp okay
		@context ||= parent.context.reference(self)

export class FlowScope < Scope

	# these have no params themselves, refer to outer scopes -- hjmm
	def params
		@parent.params if @parent

	def register name, decl = null, o = {}
		if o:type != 'let' and (closure != self)
			if var found = lookup(name)
				# p "already found variable {found.type}"
				if found.type == 'let'
					p "{name} already exists as a block-variable {decl}"
					# TODO should throw error instead
					decl.warn "Variable already exists in block" if decl
					# root.warn message: "Holy shit"
				# if found.
			# p "FlowScope register var -- do it right in the outer scope"
			closure.register(name,decl,o)
		else
			# p "Register local variable for FlowScope {name}"
			# o:closure = parent
			# p "FlowScope register", arguments
			super(name,decl,o)

	def autodeclare variable
		parent.autodeclare(variable)

	def closure
		# rather all the way?
		@parent.closure # this is important?

	def context
		# if we are wrapping in an expression - we do need to add a reference
		# @referenced = yes
		parent.context
		# usually - if the parent scope is a closed scope we dont really need
		# to force a reference
		# @context ||= parent.context.reference(self)

export class CatchScope < FlowScope

export class WhileScope < FlowScope

	def autodeclare variable
		vars.push(variable)

export class ForScope < FlowScope
	
	def autodeclare variable
		vars.push(variable)
		# parent.autodeclare(variable)

	# def closure
	# 	self

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
		# p "Variable was assigned {val}"
		if val isa Arr
			# just for testing really
			@isArray = yes
		else
			@isArray = no
		self

	def resolve scope = scope, force = no
		return self if @resolved and !force

		@resolved = yes
		var closure = @scope.closure
		var item = scope.lookup(@name)

		# if this is a let-definition inside a virtual scope we do need
		# 
		if @scope != closure and @type == 'let' # or if it is a system-variable
			# p "scope is not the closure -- need to resolve {@name}"
			item = closure.lookup(@name)

			# we now need to ensure that this variable is unique inside
			# the whole closure.
			scope = closure

		# p "scope is not the closure -- need to resolve {@name} {@type}"

		if item == self
			scope.varmap[@name] = self
			return self

		# p "need to resolve!".cyan
		elif item
			# p "variable already exists {@name}"

			# possibly redefine this inside, use it only in this scope
			# if the item is defined in an outer scope - we reserve the
			if item.scope != scope && (options:let or @type == 'let')
				# p "override variable inside this scope {@name}"
				scope.varmap[@name] = self

			# different rules for different variables?
			if @options:proxy
				# p "is proxy -- no need to change name!!! {name}".cyan
				yes
			else
				var i = 0
				var orig = @name
				# it is the closure that we should use
				while scope.lookup(@name)
					@name = "{orig}{i += 1}"

		# inefficient double setting
		scope.varmap[@name] = self
		closure.varmap[@name] = self
		return self
		# p "resolve variable".cyan

	def reference
		self

	def node
		self

	def traverse
		# NODES.push(self)
		self

	def free ref
		# p "free variable!"
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
			# p "var is proxied!",@proxy
			@c = @proxy[0].c + '[' + @proxy[1].c + ']'
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
		# p "variable assignify!!!"
		return self

	# this should only generate the accessors - not dael with references
	def accessor ref
		var node = LocalVarAccess.new(".",null,self) # this is just wrong .. should not be a regular accessor
		# @references.push([ref,el]) if ref # weird temp format
		return node

	def assignment val
		Assign.new('=',self,val)

	def addReference ref
		if ref isa Identifier
			ref.references(self)

		if ref:region and ref.region
			@references.push(ref)

		# p "reference is {ref:region and ref.region}"
		self

	def autodeclare
		return self if @declared
		# p "variable should autodeclare(!) {name}"
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
		# console.log "dump variable of type {type} - {name}"
		return {
			type: type
			name: name
			refs: dump__(@references, typ)
		}


export class SystemVariable < Variable
	
	def pool
		@options:pool
		
	# weird name for this
	def predeclared
		# p "remove var from scope(!)"
		scope.vars.remove(self)
		self
	
	def resolve
		return self if @resolved || @name
		# p "RESOLVE SYSTEM VARIABLE".red
		@resolved = yes
		# unless @name
		# adds a very random initial name
		# the auto-magical goes last, or at least, possibly reuse other names
		# "${Math.floor(Math.random * 1000)}"

		var typ = @options:pool
		var names = [].concat(@options:names)
		var alt = null
		var node = null

		var scope = self.scope

		if typ == 'tag'
			var i = 0
			while !@name
				var alt = "t{i++}"
				@name = alt unless scope.lookup(alt)

		elif typ == 'iter'
			names = ['ary__','ary_','coll','array','items','ary']

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

		while !@name && alt = names.pop
			@name = alt unless scope.lookup(alt)

		if !@name and @declarator
			if node = declarator.node
				names.push(alias + "_") if var alias = node.alias

		while !@name && alt = names.pop
			@name = alt unless scope.lookup(alt)

		# p "suggested names {names.join(" , ")} {node}".cyan
		#  Math.floor(Math.random * 1000)
		@name ||= "${scope.counter += 1}"
		# p "name for variable is {@name}"
		scope.varmap[@name] = self
		self

	def name
		resolve
		@name


export class ScopeContext < Node

	prop scope
	prop value

	def initialize scope, value
		@scope = scope
		@value = value
		@reference = null
		self

	# instead of all these references we should probably
	# just register when it is accessed / looked up from
	# a deeper function-scope, and when it is, we should
	# register the variable in scope, and then start to
	# use that for further references. Might clean things
	# up for the cases where we have yet to decide the
	# name of the variable etc?

	def reference
		# p "p reference {STACK.scoping}"
		# should be a special context-variable!!!
		@reference ||= scope.declare("self",This.new)

	def c
		var val = @value || @reference
		(val ? val.c : "this")

export class RootScopeContext < ScopeContext

	# def reference scope
	# 	self

	def c o
		# return "" if o and o:explicit
		var val = @value || @reference
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
				out += ".{c__(m.supername)}" 
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
export var TAGDEF = Const.new('Imba.Tag.define')
export var NEWTAG = Identifier.new("tag$")










