# TODO Create Expression - make all expressions inherit from these?

extern parseInt

var helpers = require './helpers'

export var AST = {}

# Helpers for operators
export var OP = do |op, left, right, opts|
	var opstr = String(op)

	if opstr == '.'
		# Be careful
		if right isa String
			right = Identifier.new(right)

		Access.new(op,left,right)
	elif opstr == '='
		if left isa Tuple
			# p "catching tuple-assign OP"
			return TupleAssign.new(op,left,right)
		Assign.new(op,left,right)
	elif opstr in ['?=','||=','&&=']
		ConditionalAssign.new(op,left,right)
	elif opstr in ['+=','-=','*=','/=','^=','%=']
		CompoundAssign.new(op,left,right)
	elif opstr == 'instanceof'
		InstanceOf.new(op,left,right)
	elif opstr == 'in'
		In.new(op,left,right)
	elif opstr == 'typeof'
		TypeOf.new(op,left,right)
	elif opstr == 'delete'
		Delete.new(op,left,right)
	elif opstr in ['--','++','!','√'] # hmm
		UnaryOp.new(op,left,right)
	elif opstr in ['>','<','>=','<=','==','===','!=','!==']
		ComparisonOp.new(op,left,right)
	elif opstr in ['∩','∪']
		MathOp.new(op,left,right)
	elif opstr in ['..','...']
		Range.new(op,left,right)
	else
		Op.new(op,left,right)

export var OP_COMPOUND = do |sym,op,l,r|
	if sym == '?=' or sym == '||=' or sym == '&&='
		return ConditionalAssign.new(op,l,r)
	else
		return CompoundAssign.new(op,l,r)

LIT = do |val|
	Literal.new(val)

SYM = do |val|
	Symbol.new(val)

IF = do |cond,body,alt|
	var node = If.new(cond,body)
	node.addElse(alt) if alt
	node

FN = do |pars,body|
	Func.new(pars,body)

CALL = do |callee,pars = []|
	# possibly return instead(!)
	Call.new(callee,pars)

CALLSELF = do |name,pars = []|
	var ref = Identifier.new(name)
	Call.new(OP('.',SELF,ref),pars)

BLOCK = do
	Block.wrap([]:slice.call(arguments))

WHILE = do |test,code|
	While.new(test).addBody(code)

export var SPLAT = do |value|
	if value isa Assign
		# p "WARN"
		value.left = Splat.new(value.left)
		return value
	else
		Splat.new(value)
		# not sure about this

OP.ASSIGNMENT = [ "=" , "+=" , "-=" , "*=" , "/=" , "%=", "<<=" , ">>=" , ">>>=", "|=" , "^=" , "&=" ]
OP.LOGICAL = [ "||" , "&&" ]
OP.UNARY = [ "++" , "--" ]

LOC = do |loc|
	self

# hmmm
def c__ obj
	typeof obj == 'string' ? obj : obj.c

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

def AST.dump obj, key
	if obj isa Array
		obj.map do |v| v && v:dump ? v.dump(key) : v
	elif obj and obj:dump
		obj.dump


def compact__ ary
	if ary isa ListNode
		# console.log "IS LISTNODE"
		return ary.compact

	ary.filter do |v| v != undefined && v != nil

def flatten__ ary, compact = no
	var out = []
	ary.forEach do |v| v isa Array ? out:push.apply(out,flatten__(v)) : out.push(v)
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
	# var v = str.replace(/\\n/g,'\n')
	# v.split("\n").join("\n")
	# v.split("\n").map(|v| v ? "// {v}" : v).join("\n")

export class Indentation

	prop open
	prop close

	def initialize a,b
		@open = a or 1
		@close = b or 1
		self

	# should rather parse and extract the comments, no?
	def wrap str, o
		var pre = @open:pre
		var post = @open:post
		var esc = AST:escapeComments

		# the first newline should not be indented?
		str = esc(post).replace(/^\n/,'') + str
		str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n")

		str = esc(pre) + '\n' + str
		# only add br if needed
		str = str + '\n' unless str[str:length - 1] == '\n'
		# if o and o:braces
		# 	str = '{' + str + '}'

		return str
		
INDENT = Indentation.new

export class Stack

	prop loglevel
	prop nodes
	prop scopes

	def initialize
		@nodes = []
		@scoping = []
		@scopes = [] # for analysis - should rename
		@loglevel = 3

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
		@nodes.pop(node)
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

		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]
			return node if test(node)
			i -= 1
		return nil

	def relative node, offset = 0
		var idx = @nodes.indexOf(node)
		idx >= 0 ? @nodes[idx + offset] : nil

	def scope lvl = 0
		var i = @nodes:length - 1 - lvl
		while i >= 0
			var node = @nodes[i]
			return node.@scope if node.@scope
			i -= 1
		return nil

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
STACK = Stack.new

export class Node

	prop o
	prop options
	prop traversed
	prop statement

	def safechain
		no

	def dom
		var name = "ast_" + self:constructor:name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase
		# p "try to get the dom-node for this ast-node",name
		if Imba.TAGS[name]
			var node = Imba.tag(name)
			node.bind(self).build
			return node
		else
			return "[{name}]"

	def p
		# hmm
		# allow controlling this from commandline
		if STACK.loglevel > 0
			console.log(*arguments)
		self

	def initialize
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
		[]

	def loc
		[]

	def toAST
		self

	def compile
		self

	def visit
		self

	def stack
		STACK

	def traverse o = {}, up, key, index
		return self if @traversed
		@traversed = yes
		STACK.push self
		visit(STACK)
		STACK.pop self
		return self

	def inspect
		{type: self:constructor.toString}

	def js
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
		throw SyntaxError.new("dont call")
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
		# this is a _BIG_ hack
		if b isa Array
			# console.log "indented array?", b[0]
			add(b[0])
			b = b[1]

		# if indent and indent.match(/\:/)
		@indented = [a,b]
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
		# o:lookups = 0
		self

	def cachevar
		@cache && @cache:var

	def decache
		if @cache
			cachevar.free
			@cache = nil # hmm, removing the cache WARN
		self

	# is this without side-effects? hmm - what does it even do?
	def predeclare
		if @cache
			scope__.vars.swap(@cache:var,self)
		self

	# the "name-suggestion" for nodes if they need to be cached
	def alias
		nil

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

		var paren = shouldParenthesize
		
		if var indent = @indentation
			out = indent.wrap(out,o)

		out = "({out})" if paren
		out = '{' + out + '}' if o and o:braces

		s.pop(self)

		if ch = @cache
			out = "{ch:var.c}={out}" unless ch:manual
			var par = s.current
			out = '(' + out + ')' if par isa Access || par isa Op # others? # 
			ch:cached = yes

		# most of these should never be needed?
		# where?!?
		if @temporary && @temporary:length
			@temporary.map do |temp| temp.decache

		return out

	def c_cached cache
		cache:lookups++
		cache:var.free if cache:uses == cache:lookups
		return cache:var.c # recompile every time??
		

export class Expression < Node

export class ValueNode < Node

	prop value

	def initialize value
		@value = load(value)

	def load value
		value

	def js
		typeof @value == 'string' ? @value : @value.c

	def visit
		# hmm - is this not optimized?
		@value.traverse if @value isa Node #  && @value:traverse
		self

	def region
		@value.@region

export class Statement < ValueNode

	def isExpressable
		return no
		
	def statement
		return true


export class Meta < ValueNode

export class Comment < Meta

	def c o
		var v = @value.@value # hmm 
		if o and o:expression or v.match(/\n/) # multiline?
			"/*{v}*/"
		else
			"// {v}"


export class Terminator < Meta

	def c
		return @value.c
		# var v = value.replace(/\\n/g,'\n')
		v # .split()
		# v.split("\n").map(|v| v ? " // {v}" : v).join("\n")

export class Newline < Terminator

	def initialize v
		@value = v or '\n'

	def c
		@value.c
		

# weird place?
export class Index < ValueNode

	def js
		@value.c

export class ListNode < Node

	prop nodes

	def initialize list = [], options = {}
		@nodes = load(list)
		@options = options
	
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
		nodes.push(item)
		self

	def unshift item, br
		nodes.unshift(BR) if br
		nodes.unshift(item)
		self

	# test
	def slice a, b
		self:constructor.new(@nodes.slice(a,b))

	def add item
		push(item)
		self

	def break br, pre = no
		# console.log "breaking block! ({br})"
		# should just accept regular terminators no?
		# console.log "BREAKING {br}"
		br = Terminator.new(br) if typeof br == 'string' # hmmm?
		pre ? unshift(br) : push(br)
		self

	def some cb
		nodes.some(cb)

	def every cb
		nodes.every(cb)

	def filter cb
		if cb:prototype isa Node
			var ary = []
			nodes.forEach do |n| ary.push(n) if n isa cb
			return ary

		nodes.filter(cb)

	def pluck cb
		var item = filter(cb)[0]
		remove(item) if item
		return item

	def indexOf item
		nodes.indexOf(item)

	def index i
		nodes[i]	

	def remove item
		var idx = list.indexOf(item)
		list.splice(idx, 1) if idx >= 0
		self

	def first
		list[0]
		
	# def last
	#	list[list:length - 1]

	def last
		var i = @nodes:length
		while i
			i = i - 1
			var v = @nodes[i]
			return v unless v isa Meta
		return nil

	def map fn
		list.map(fn)

	def forEach fn
		list.forEach(fn)

	def remap fn
		@nodes = map(fn)
		self

	def count
		list:length

	def replace original, replacement
		var idx = nodes.indexOf(original)
		nodes[idx] = replacement if idx >= 0
		self


	def visit
		@nodes.forEach do |node|
			# console.log "traverse node {node}"
			node.traverse
		self

	def isExpressable
		return no unless nodes.every(|v| v.isExpressable )
		return yes

	def toArray
		@nodes

	def delimiter
		@delimiter or ","

	def js o, delim: delimiter, indent: @indentation, nodes: nodes
		# var delim = delimiter
		var express = delim != ';'
		var shouldDelim = no
		var nodes = compact__(nodes)
		var last = last
		var realLast = nodes[nodes:length - 1]
		# need to find the last node that is not a comment or newline?

		var parts = nodes.map do |arg|
			var out = typeof arg == 'string' ? arg : arg.c(expression: express)
			# if var br = arg.@prebreak
			# 	indent = yes # force indentation if one item is indented for now
			# 	out = br.replace(/\\n/g,"\n") + out #  '\n' + arg.@prebreak + out 
			# 	console.log "prebreak!!"
			#	out = delim + out if shouldDelim
			# else
			#	out = delim + " " + out if shouldDelim

			if arg isa Meta
				true
				# console.log "argument is a comment!"
				# shouldDelim = no
			else
				# comment as well?
				# shouldDelim = yes
				out = out + delim if !express or arg != last
			out

		return parts.join("")
		

export class ArgList < ListNode

	def hasSplat
		list.some do |v| v isa Splat

	def delimiter
		","


export class AssignList < ArgList	
	# def c o
	# 	# p "compile arglist {self}"
	# 	super.c o

	def concat other
		if @nodes:length == 0 and other isa AssignList
			# console.log "return the other one(!)",other.@indented[0]
			return other
		else
			super
		# need to store indented content as well?
		# @nodes = nodes.concat(other isa Array ? other : other.nodes)
		self


export class Block < ListNode	
	
	prop head


	def self.wrap ary
		unless ary isa Array
			throw SyntaxError.new("what")
		ary:length == 1 && ary[0] isa Block ? ary[0] : Block.new(ary)


	# def visit
	# 	# @indentation ||= INDENT
	# 	
	# 	if @prebreak # hmm
	# 		# are we sure?
	# 		# console.log "PREBREAK IN BLOCK SHOULD THROW"
	# 		first and first.prebreak(@prebreak)
	# 	super
		

	def push item
		nodes.push(item)
		self


	def block
		self


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


	def initialize expr = []
		self.nodes = compact__(flatten__(expr)) or []
		

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


	# This is just to work as an inplace replacement of nodes.coffee
	# After things are working okay we'll do bigger refactorings
	def compile o = {}
		var root = Root.new(self,o)
		root.compile(o)


	# Not sure if we should create a separate block?
	def analyze o = {}
		# p "analyzing block!!!",o
		self


	def js o, opts
		var l = nodes:length
		# var filter = 
		var filter = (|n| n != null && n != undefined && n != EMPTY)
		var ast = compact__(flatten__(nodes)).filter(|n| n != null && n != undefined && n != EMPTY)
		var express = isExpression or o.isExpression or (option(:express) and isExpressable)
		return null if ast:length == 0

		# return super(o, delim: ';', indent: no)

		if express
			return super(o,delim: ',', nodes: ast)

		# should probably delegate to super for ; as well
		# else
		# 	return super(o,delim: ';', nodes: ast)
		# return ast.c.flatten__.compact.join(", ")

		var compile = do |node,i|
			# if node isa Array
			# 	console.log "was array initially"

			var out = typeof node == 'string' ? node : (node ? node.c : "")
			return null if out == ""

			# FIXME should never happen
			# we need to handle it in a better way - results in ugly output
			if out isa Array

				# really??
				# console.log "out is array"
				out = compact__(flatten__(out)).filter(filter).join(";\n")
			# console.log "compiled {node} {out}"
			var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/) # out[out:length - 1] == ";"

			out += ";" unless hasSemiColon or node isa Meta
			
			# if var br = node.@prebreak
			# 	console.log "br prebreak"
			# 	out = br.replace(/\\n/g,"\n") + out
			# hmm
			return out

		ast = ast.map(compile)

		# now add the head items as well
		if @head
			var prefix = []
			flatten__(@head).forEach do |item|
				var out = compile(item)
				prefix.push(out + '\n') if out

			ast = prefix.concat(ast)
			# var ln = node.@newlines or 1
			# c += Array(ln + 1).join("\n") # "\n"

		ast = compact__(ast).filter(filter).join("") # .replace(/[\s\n]+$/,'')  # hmm really?

		# @indentation ? @indentation.wrap(ast,opts) : ast


	# Should this create the function as well?
	def defers original, replacement
		var idx = nodes.indexOf(original)
		nodes[idx] = replacement if idx >= 0
		# now return the nodes after this
		replacement.@prebreak ||= original.@prebreak # hacky
		var rest = nodes.splice(idx + 1)
		return rest


	def consume node
		if node isa TagTree # special case?!?
			# what if there is only one node?
			# let all the inner nodes consume this
			nodes = nodes.map(|child| child.consume(node))
			# then wrap ourselves in an array as well(!)
			# nodes = [Arr.new(nodes)] if nodes:length > 1
			nodes = [Arr.new(ArgList.new(nodes))] if nodes:length > 1
			
			# hmmm
			return self

		# can also return super if it is expressable, but should we really?
		if var before = last
			var after = before.consume(node)
			if after != before
				
				# p "replace node in block"
				replace(before,after)
		# really?
		return self


	def isExpressable
		return no unless nodes.every(|v| v.isExpressable )
		return yes


	def isExpression
		option(:express) || super.isExpression


# this is almost like the old VarDeclarations but without the values
export class VarBlock < ListNode


	# TODO All these inner items should rather be straight up literals
	# or basic localvars - without any care whatsoever about adding var to the
	# beginning etc. 
	def addExpression expr
		# p "addExpression {self} <- {expr}"

		if expr isa Assign
			addExpression(expr.left) # make sure this is a valid thing?
			# make this into a tuple instead
			# possibly fix this as well?!?
			# does not need to be a tuple?
			return TupleAssign.new('=',Tuple.new(nodes),expr.right)

		elif expr isa VarOrAccess
			# this is really a VarReference
			push(VarReference.new(expr.value))

		elif expr isa Splat && expr.node isa VarOrAccess
			# p "is a splat - only allowed in tuple-assignment"
			expr.value = VarReference.new(expr.node.value)
			push(expr)
		else
			throw "VarBlock does not allow non-variable expressions"
		self


	def isExpressable
		# hmm, we would need to force-drop the variables, makes little sense
		# but, it could be, could just push the variables out?
		no


	def js o
		var code = compact__(flatten__(cary__(nodes)))
		code = code.filter(|n| n != null && n != undefined && n != EMPTY)
		return "var {code.join(",")}"


	def consume node
		# It doesnt make much sense for a VarBlock to consume anything
		# it should probably return void for methods
		return self


# Could inherit from valueNode
export class Parens < ValueNode

		
	def js o
		var par = up
		var v = @value
		# p "Parens up {par} {o.isExpression}"

		if par isa Block
			@noparen = yes unless o.isExpression
			return v isa Array ? cary__(v) : v.c(expression: o.isExpression)
		else
			return v isa Array ? cary__(v) : v.c(expression: yes)


	def shouldParenthesize
		# no need to parenthesize if this is a line in a block
		return no if @noparen #  or par isa ArgList
		return yes


	def prebreak br
		super(br)
		# hmm
		@value.prebreak(br) if @value
		self


	def isExpressable
		value.isExpressable


	def consume node
		value.consume(node)



# Could inherit from valueNode
# an explicit expression-block (with parens) is somewhat different
# can be used to return after an expression
export class ExpressionBlock < ListNode


	def visit
		# we need to see if this
		map(|item| item.traverse)
		self

		
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
		@value = v isa ArgList and v.count == 1 ? v.last : v
		# @prebreak = v and v.@prebreak # hmmm
		# console.log "return?!? {v}",@prebreak
		# if v isa ArgList and v.count == 1
		return self

	def visit
		@value.traverse if @value && @value:traverse

	def js
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

	def js
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
			BLOCK(expr,copy).c
		elif expr
			var copy = self:constructor.new(literal)
			BLOCK(expr,copy).c
		else
			super
		# return "loopflow"
		

export class BreakStatement < LoopFlowStatement
	def js do "break"

export class ContinueStatement < LoopFlowStatement
	def js do "continue"

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
		@name = name # .value # this is an identifier(!)
		@defaults = defaults
		@typ = typ
		@variable = null

	def js
		# hmmz
		return @variable.c if @variable

		if defaults
			"if({name.c} == null) {name.c} = {defaults.c}"
		# see if this is the initial declarator?

	def visit
		# p "VISIT PARAM {name}!"
		# ary.[-1] # possible
		# ary.(-1) # possible
		# str(/ok/,-1)
		# scope.register(@name,self)
		# BUG The defaults should probably be looked up like vars
		@defaults.traverse if @defaults
		self.variable ||= scope__.register(name,self)	
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
		@variable ||= s.temporary(self, type: 'keypars')
		@variable.predeclared

		# this is a listnode, which will automatically traverse
		# and visit all children
		super
		# register the inner variables as well(!)
		self

	def name
		variable.c

	def js
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
		@variable ||= s.temporary(self, type: 'keypars')
		@variable.predeclared

		# now when we loop through these inner params - we create the pars
		# with the correct name, but bind them to the parent
		super

	def name
		variable.c

	def load list
		return nil unless list isa Arr
		# p "loading arrayparams"
		# try the basic first
		unless list.splat
			list.value.map do |v,i|
				# must make sure the params are supported here
				# should really not parse any array at all(!)
				var name = v
				if v isa VarOrAccess
					# p "varoraccess {v.value}"
					name = v.value.value
					# this is accepted
				parse(name,v,i)

	def parse name,child,i
		var param = IndexedParam.new(name,nil)

		param.parent = self
		param.subindex = i
		param

	def head ast
		# "arrayparams"
		self

export class ParamList < ListNode

	prop splat
	prop block

	def at index, force = no, name = nil
		if force
			add(Param.new(count == index && name || "_{count}")) until count > index
			# need to visit at the same time, no?
		list[index]

	def visit
		@splat = filter(|par| par isa SplatParam)[0]
		var blk = filter(BlockParam)

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
			compact__(pars.map(|arg| c__(arg.name) )).join(",")
		else
			throw "not implemented paramlist js"
			"ta" + compact__(map(|arg| arg.c )).join(",")

	def head o
		var reg = []
		var opt = []
		var blk = nil
		var splat = nil
		var named = nil
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

			var argvar = scope__.temporary(self, type: 'arguments').predeclared.c
			var len = scope__.temporary(self, type: 'counter').predeclared.c

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

	def visit
		# for now we just deal with this if it only has one declaration
		# if any inner assignment is an expression

		# the declarators might be predeclared, in which case we don't need
		# to act like a regular one
		map do |item| item.traverse

	# we want to register these variables in
	def add name, init
		var vardec = VariableDeclarator.new(name,init)
		push vardec
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
		list.every(|item| item.isExpressable)

	def js
		return EMPTY if count == 0

		if count == 1 && !isExpressable
			p "SHOULD ALTER VARDEC!!!".cyan
			first.variable.autodeclare
			var node = first.assignment
			return node.c

		# unless right.isExpressable
		# 	p "Assign.consume!".blue
		#	ast = right.consume(self)
		#	return ast.c
		# vars = map|arg| arg.c )
		# single declarations should be useable as/in expressions
		# when they are - we need to declare the variables at the top of scope
		# should do more generic check to find out if variable should be listed
		# var args = filter(|arg| !arg.variable.@proxy )
		"var " + compact__(cary__(nodes)).join(", ") + ""

export class VariableDeclarator < Param

	# can possibly create the variable immediately but wait with scope-declaring
	def visit
		# even if we should traverse the defaults as if this variable does not exist
		# we need to preregister it and then activate it later
		self.variable ||= scope__.register(name,null)
		defaults.traverse if defaults
		self.variable.declarator = self
		self.variable.addReference(name)
		self
		
	# needs to be linked up to the actual scoped variables, no?
	def js
		return null if variable.@proxy

		var defs = defaults
		# FIXME need to deal with var-defines within other statements etc
		# FIXME need better syntax for this
		if defs != null && defs != undefined
			# console.log "defaults is {defaults}"
			defs = defs.c(expression: yes) if defs isa Node # hmmm

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
		self.variable ||= scope__.register(value.c,null)
		self.variable.declarator = self
		self.variable.addReference(value)
		self

	def js
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
		@type = type
		@left = l
		@right = r

	def visit

		# we need to carefully traverse children in the right order
		# since we should be able to reference
		for l,i in left
			l.traverse # this should really be a var-declaration
			r.traverse if r = right[i]
		self

	def js
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
		self.body = blk__(body)
		self.scope = FileScope.new(self,null)

	def visit
		scope.visit
		body.traverse

	def compile
		traverse
		return c

	def js
		'(function(){\n\n' + scope.c(indent: yes) + '\n\n}())'

	def analyze
		# STACK.loglevel = 0
		traverse
		return scope.dump

	def inspect
		true

export class ClassDeclaration < Code

	prop name
	prop superclass
	prop initor

	def initialize name, superclass, body
		# what about the namespace?
		@name = name
		@superclass = superclass
		@scope = ClassScope.new(self)
		@body = blk__(body)

	def visit
		# replace with some advanced lookup?
		scope.visit

		# local is the default -- should it really be referenced?
		# if option(:local)
		#	self.name = scope.parent.register(name,self)

		body.traverse

	def js
		scope.virtualize
		scope.context.value = name

		# should probably also warn about stuff etc
		if option(:extension)
			return body.c

		var o = @options or {}
		var cname = name isa Access ? name.right : name
		var namespaced = name != cname

		var sup = superclass
		var initor = body.pluck do |c| c isa MethodDeclaration && c.type == :constructor
		# compile the cname
		cname = cname.c unless typeof cname == 'string'

		var cpath = typeof name  == 'string' ? name : name.c

		if !initor
			if sup
				initor = "function {cname}()\{ {sup.c}.apply(this,arguments) \}"
			else
				initor = "function {cname}()" + '{ }'
		
		else
			initor.name = cname
			initor = initor.c
		
		# if we are defining a class inside a namespace etc -- how should we set up the class?
		var head = []

		if namespaced
			initor = "{cpath} = {initor}" # OP('=',name,initor) # hmm

		head.push("/* @class {cname} */\n{initor};\n\n")

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
		body.@indentation = nil
		var out = body.c

		return out


export class TagDeclaration < Code

	prop name
	prop superclass
	prop initor

	def initialize name, superclass, body
		# what about the namespace?
		# @name = TagTypeRef.new(name)
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

	def js

		if option(:extension)
			# check if we have an initialize etc - not allowed?
			scope.context.value = name
			return body.c

		# should disallow initialize for tags?
		var sup =  superclass and "," + helpers.singlequote(superclass.func) or ""

		var out = if name.id
			"Imba.defineSingletonTag('{name.id}',function {name.func}(d)\{this.setDom(d)\}{sup})"
		else
			"Imba.defineTag('{name.func}',function {name.func}(d)\{this.setDom(d)\}{sup})"

		# if the body is empty we can return this directly
		# console.log "here"
		if body.count == 0

			return out

		# create closure etc
		# again, we should really use the included system
		# FIXME should consolidate the way we generate all code - this
		# is going down a route of more direct conversion, which is less
		# flexible.

		# WARN should fix
		body.@indentation = nil

		out = "var tag = {out};"
		scope.context.value = Const.new('tag')
		out += "\n{body.c}"

		return '(function()' + helpers.bracketize(out,yes) + ')()'

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
		@scope ||= (o and o:scope) || typ.new(self)
		@scope.params = @params = ParamList.new(params)
		@body = blk__(body)
		@name = name || ''
		@target = target
		@options = o
		@type = :function
		self

	def visit
		scope.visit
		@context = scope.parent
		@params.traverse
		@body.traverse # so soon?
		

	def js o
		body.consume(ImplicitReturn.new) unless option(:noreturn)
		var code = scope.c(indent: yes, braces: yes)
		# args = params.map do |par| par.name
		# head = params.map do |par| par.c
		# code = [head,body.c(expression: no)].flatten__.compact.join("\n").wrap
		# FIXME creating the function-name this way is prone to create naming-collisions
		# will need to wrap the value in a FunctionName which takes care of looking up scope
		# and possibly dealing with it
		var name = typeof @name == 'string' ? @name : @name.c
		var name = name.replace(/\./g,'_')
		var out = "function {name}({params.c})" + code
		out = "({out})()" if option(:eval)
		return out

	def shouldParenthesize
		up isa Call && up.callee == self
		# if up as a call? Only if we are 

export class Lambda < Func
	def scopetype do LambdaScope
# MethodDeclaration
# Create a shared body?

export class MethodDeclaration < Func

	prop variable

	def scopetype do MethodScope

	def visit
		# prebreak # make sure this has a break?

		if String(name) == 'initialize'
			self.type = :constructor

		if body:expressions
			set(greedy: true)
			# p "BODY EXPRESSIONS!! This is a fragment"
			var tree = TagTree.new
			@body = body.consume(tree)
			# body.nodes = [Arr.new(body.nodes)] # hmm

		scope.visit
		@context = scope.parent
		@params.traverse

		if target isa Self
			@target = @scope.parent.context
			set(static: yes)

		if context isa ClassScope
			# register as class-method?
			yes
		elif !@target
			variable = context.register(name, self, type: 'meth')

		# hmm?
		@target ||= @scope.parent.context

		@body.traverse # so soon?

		# p "method target {@target} {@context}"
		self

	def supername
		type == :constructor ? type : name


	# FIXME export global etc are NOT valid for methods inside any other scope than
	# the outermost scope (root)

	def js
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
			target = nil # hmm -- 

		var ctx = context
		var out = ""
		# if ctx 



		var fname = sym__(self.name)
		# console.log "symbolize {self.name} -- {fname}"
		var fdecl = fname # decl ? fname : ''

		if ctx isa ClassScope and !target
			if type == :constructor
				out = "function {fname}{func}"
			elif option(:static)
				out = "{ctx.context.c}.{fname} = function {func}"
			else
				out = "{ctx.context.c}.prototype.{fname} = function {func}"

		elif ctx isa FileScope and !target
			# register method as a root-function, but with auto-call? hmm
			# should probably set using variable directly instead, no?
			out = "function {fdecl}{func}"

		elif target and option(:static)
			out = "{target.c}.{fname} = function {func}"

		elif target
			# hmm
			out = "{target.c}.prototype.{fname} = function {func}"
		else
			out = "function {fdecl}{func}"

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

export class PropertyDeclaration < Expression

	prop name
	prop options

	def initialize name, options
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

		if o.key(:dom) or o.key(:attr)
			js:set = "this.setAttribute('{key}',v)"
			js:get = "this.getAttribute('{key}')"

		elif o.key(:delegate)
			# if we have a delegate
			js:set = "this.__{key}.delegate.set(this,'{key}',v,this.__{key})"
			js:get = "this.__{key}.delegate.get(this,'{key}',this.__{key})"

		if deflt
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
		@value = v
		
	# hmm
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

	def truthy
		# p "bool is truthy? {value}"
		String(value) == "true"
		# yes

	def js
		String(@value)

	def c
		# undefined should not be a bool
		String(@value)
		# @raw ? "true" : "false"


export class True < Bool

	def raw
		true

	def c
		console.log "compile True"
		"true"
		
export class False < Bool

	def raw
		false

	def c
		"false"

export class Num < Literal
	
	# value is token - should not be
	def initialize v
		@value = v

	def toString
		String(@value)

	def shouldParenthesize
		up isa Access


	def js
		var num = String(@value)
		# console.log "compiled num to {num}"
		return num

	def c o
		return super(o) if @cache
		var js = String(@value)
		var paren = STACK.current isa Access # hmmm
		# console.log "should paren?? {shouldParenthesize}"
		paren ? "(" + js + ")" : js
		# @cache ? super(o) : String(@value)

	# def cache
	# 	p "cache num"
	# 	self

	def raw
		# really?
		JSON.parse(String(value))

# should be quoted no?
# what about strings in object-literals?
# we want to be able to see if the values are allowed
export class Str < Literal

	def initialize v
		@value = v
		# should grab the actual value immediately?

	def raw
		# JSON.parse requires double-quoted strings,
		# while eval also allows single quotes. 
		# NEXT eval is not accessible like this
		# WARNING TODO be careful! - should clean up

		@raw ||= String(value).slice(1,-1) # incredibly stupid solution

	def isValidIdentifier
		# there are also some values we cannot use
		raw.match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/) ? true : false

	def js
		String(@value) # hmm

	def c o
		@cache ? super(o) : String(@value)

# Currently not used - it would be better to use this
# for real interpolated strings though, than to break
# them up into their parts before parsing
export class InterpolatedString < ListNode

	def js
		"interpolated string"


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

	def raw
		@raw ||= sym__(value)

	def js
		"'{sym__(value)}'"

export class RegExp < Literal

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
		value

	def splat
		value.some(|v| v isa Splat)

	def visit
		@value.traverse if @value and @value:traverse
		self

	def js
		var splat = value.some(|v| v isa Splat)

		if splat
			"SPLATTED ARRAY!"
			# if we know for certain that the splats are arrays we can drop the slice?
			var slices = []
			var group = nil
			value.forEach do |v|
				if v isa Splat
					slices.push(v)
					group = nil
				else
					slices.push(group = Arr.new([])) unless group
					group.push(v)

			"[].concat({cary__(slices).join(", ")})"
		else
			# very temporary. need a more generic way to prettify code
			# should depend on the length of the inner items etc
			# if @indented or option(:indent) or value.@indented
			#	"[\n{value.c.join(",\n").indent}\n]"
			# else
			var v = value
			v = v isa Array ? cary__(v) : v.c # hmmm
			"[{v}]"

	# def indented
	# 	var o = @options ||= {}
	# 	o:indent = yes
	# 	self

	def hasSideEffects
		value.some(|v| v.hasSideEffects )

	def toString
		"Arr"
		

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

	def js
		var dyn = value.filter(|v| v isa ObjAttr and v.key isa Op )

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


		# var body = value.map do |v|
		# 	var out = v.c
		# 	out = '\n' + out if v.@pbr # hmmm 
		# 	out

		# if @indented
		# 	# should be more generalized?
		# 	body = '\n' + body.join(',').indent + '\n' # hmmm
		# else
		# 	body.join(',')
		
		# for objects with expression-keys we need to think differently
		'{' + value.c + '}'

	def add k, v
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
		nil

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
		@key = key
		@value = value
		@dynamic = key isa Op

	def visit
		# should probably traverse key as well, unless it is a dead simple identifier
		key.traverse
		value.traverse

	def js
		"{key.c}: {value.c}"

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
		@invert = no
		@op = o and o.@value or o # hmmmm
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

	def js
		var out = null
		var op = @op

		var l = @left
		var r = @right

		# hmmmm?
		l = l.c if l isa Node # hmmm
		r = r.c if r isa Node

		if l && r
			out = "{l} {op} {r}"
		elif l
			out = "{op}{l}"
		# out = out.parenthesize if up isa Op # really?
		out

	def shouldParenthesize
		option(:parens)

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
		var op = @op
		var pairs = [ "==","!=" , "===","!==" , ">","<=" , "<",">=" ]
		var idx = pairs.indexOf(op)
		idx += (idx % 2 ? -1 : 1)

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

	def js
		var op = @op
		var l = @left
		var r = @right

		# hmmmm?
		l = l.c if l isa Node # hmmm
		r = r.c if r isa Node
		return "{l} {op} {r}"

		
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

	def js
		var l = @left
		var r = @right
		# all of this could really be done i a much
		# cleaner way.
		l.set(parens: yes) if l
		r.set(parens: yes) if r

		if op == '!'
			l.set(parens: yes)
			"{op}{l.c}"

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

	def js
		"typeof {left.c}"

export class Delete < Op

	def js
		# TODO this will execute calls several times if the path is not directly to an object
		# need to cache the receiver
		var l = left
		var tmp = scope__.temporary(self, type: 'val')
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

	def js
		var cond = @invert ? "== -1" : ">= 0"
		var idx = Util.indexOf(left,right)
		"{idx.c} {cond}"
	



# ACCESS

export class Access < Op

	def clone left, right
		var ctor = self:constructor
		ctor.new(op,left,right)

	def js
		var raw = null
		var rgt = right

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

		# really?
		var ctx = (left || scope__.context)

		if ctx isa RootScopeContext
			# this is a hacky workaround
			return (raw ? raw : "global[{rgt.c}]")

		# see if it needs quoting
		if raw
			# need to check to see if it is legal
			return ctx ? "{ctx.c}.{raw}" : raw
		else
			var r = rgt isa Node ? rgt.c(expression: yes) : rgt
			return "{ctx.c}[{r}]"

	def visit
		left.traverse if left
		right.traverse if right
		return

	def isExpressable
		yes # ?

	def isExpressable
		true

	def alias
		right isa Identifier ? sym__(right) : super

	def safechain
		right.safechain


# Should change this to just refer directly to the variable? Or VarReference
export class LocalVarAccess < Access

	prop safechain

	def js
		if right isa Variable and right.type == 'meth'
			return "{right.c}()" unless up isa Call

		right.c

	def variable
		right

	def cache o = {}
		super if o:force # hmm
		self

	def alias
		variable.@alias or super # if resolved?


export class GlobalVarAccess < ValueNode

	def js
		value.c


export class ObjectAccess < Access


export class PropertyAccess < Access

	def js o
		if var rec = receiver
			var ast = CALL(OP('.',left,right),[])
			ast.receiver = rec
			return ast.c

		# really need to fix this - for sure
		var js = "{super}"
		js += "()" unless (up isa Call or up isa Util.IsFunction)
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

	def visit

		@identifier = value # this is not a real identifier?
		# console.log "VarOrAccess {@identifier}"

		var scope = scope__
		var variable = scope.lookup(value)

		if variable && variable.declarator

			variable.addReference(self) # hmm

			self.value = variable.accessor(self)
			self.value.safechain = safechain # hmm

		elif value.symbol.indexOf('$') >= 0
			self.value = GlobalVarAccess.new(value)
		else
			self.value = PropertyAccess.new(".",scope.context,value)

		@value.traverse

	def c
		value.c

	def node
		value

	def symbol
		value and value.symbol

	def cache o = {}
		value.cache(o)

	def decache
		value.decache
		self

	def dom
		value.dom

	def safechain
		@identifier.safechain # hmm

	def dump
		{ loc: loc }

	def loc
		var loc = @identifier.region
		return loc or [0,0]

	def toString
		"VarOrAccess({value})"


export class VarReference < ValueNode

	# TODO VarBlock should convert these to plain / dumb nodes

	prop variable

	def js o
		# experimental fix
		
		var ref = @variable
		var out = ref.c

		if ref && !ref.option(:declared)
			if o.up(VarBlock)
				ref.set(declared: yes)
			elif o.isExpression or option(:export) # why?
				ref.autodeclare
			else
				out = "var {out}"
				ref.set(declared: yes)

		# need to think the export through -- like registering somehow
		# should register in scope - export on analysis++
		if option(:export)
			out = "module.exports.{ref.c} = {ref.c}"

		return out

	def declare
		self

	def consume node
		@variable && @variable.autodeclare
		self

	def visit
		var name = value.c
		# what about looking up? - on register we want to mark
		self.variable ||= scope__.register(name,null)
		# FIXME -- should not simply override the declarator here(!)
		self.variable.declarator = self # hmm, cannot be certain, but ok for now
		self.variable.addReference(value) # is this the first reference?
		self

	def refnr
		variable.references.indexOf(value)

	# convert this into a list of references
	def addExpression expr
		VarBlock.new([self]).addExpression(expr)




# ASSIGN

export class Assign < Op

	def isExpressable
		!right || right.isExpressable

	def isUsed
		if up isa Block && up.last != self # hmm
			return no 
		return yes

	def js o

		unless right.isExpressable
			return right.consume(self).c

		# p "assign left {left:contrstru}"
		var l = left.node

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
				right.cache(type: 'val', uses: 1) unless right.cachevar # 
				# this is only when used.. should be more clever about it
				ast = Parens.new(blk__([ast,right]))

			# should check the up-value no?
			return ast.c(expression: yes)

		# FIXME -- does not always need to be an expression?
		var out = "{l.c} {op} {right.c(expression: true)}"

		return out

	def shouldParenthesize
		up isa Op && up.op != '='


	def consume node
		if isExpressable
			forceExpression
			return super

		var ast = right.consume(self)
		return ast.consume(node)


export class PushAssign < Assign

	def js
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
			if l.left # hmm
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
			ast = IF(condition, OP('=',ls,right), l)
		ast.toExpression if ast.isExpressable # hmm
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
		
	def js
		# p "ConditionalAssign.js".red
		var ast = IF(condition, OP('=',left,right), left)
		ast.toExpression if ast.isExpressable
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
			# NOTE can improve.. should rather make the whole left be a VarBlock or TupleVarBlock
			# p "type is var -- skip the rest"

		right.traverse
		left.traverse
		self

	def js
		# only for actual inner expressions, otherwise cache the whole array, no?
		unless right.isExpressable
			# p "TupleAssign.consume! {right}".blue
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

		var ast = Block.new
		var lft = self.left
		var rgt = self.right
		var typ = self.type
		var via = nil

		var li = 0
		var ri = lft.count
		var llen = ri



		# if we have a splat on the left it is much more likely that we need to store right
		# in a temporary array, but if the right side has a known length, it should still not be needed
		var lsplat = lft.filter(|v| v isa Splat )[0]

		# if right is an array without any splats (or inner tuples?), normalize it to tuple
		rgt = Tuple.new(rgt.nodes) if rgt isa Arr && !rgt.splat
		var rlen = rgt isa Tuple ? rgt.count : nil

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
				var v = nil
				# determine if this needs to be precached?
				# if l isa VarReference
				# 	# this is the first time the variable is referenced
				# 	# should also count even if it is predeclared at the top
				# 	if l.refnr == 0

				if l == lsplat
					v = []
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
								ast.push(part[1].cache(force: yes, type: 'swap', declared: typ == 'var'))
						# p "from {i} - cache all remaining with side-effects"

				# if the previous value in ast is a reference to our value - the caching was not needed
				if ast.last == r
					r.decache
					# p "was cached - not needed"
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
			# blk = nil
			
			var blktype = typ == 'var' ? VarBlock : Block
			var blk = blktype.new
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
						blk = nil

					# not if splat was last?
					# ast.push(blk = VarBlock.new)

				elif lsplat
					ast.push(blk = blktype.new) unless blk
					# we could cache the raw code of this node for better performance
					blk.push(OP('=',l,OP('.',iter,OP('++',idx))))
				else
					ast.push(blk = blktype.new) unless blk
					blk.push(OP('=',l,OP('.',iter,num__(i) )))


		if ast.isExpressable # NO!
			var out = ast.c(expression: yes)
			out = "{typ} {out}" if typ
			return out
		else
			return ast.c


# IDENTIFIERS

# really need to clean this up
export class Identifier < ValueNode

	prop safechain

	def load v
		var val = (v isa Identifier ? v.value : v)
		var len = val:length
		# experimental way to include reserved-info
		# if v.match()

		# no?
		if val[len - 1] == '?'
			throw "Identifier#load"
			# console.log "nonono --"
			# p "safechain identifier?!"
			safechain = yes
			val = val.substr(0,len - 1)

		return val

	def isValidIdentifier
		yes
		
	def isReserved
		# hmm
		@value:reserved

	def symbol
		@symbol ||= sym__(value)

	def setter
		@setter ||= Identifier.new("set-{value.c}")

	def toString
		String(@value)

	def js
		sym__(@value)

	def c
		sym__(@value)

	def dump
		{ loc: region, value: value }

		
export class TagId < Identifier

	def c
		"id$('{value.c}')"
		
# This is not an identifier - it is really a string
# Is this not a literal?

# FIXME Rename to IvarLiteral? or simply Literal with type Ivar
export class Ivar < Identifier

	def name
		helpers.camelCase(@value).replace(/^@/,'')
		# value.c.camelCase.replace(/^@/,'')

	# the @ should possibly be gone from the start?
	def js
		'_' + name

	def c
		'_' + helpers.camelCase(@value).replace(/^@/,'')

# Ambiguous - We need to be consistent about Const vs ConstAccess
# Becomes more important when we implement typeinference and code-analysis
export class Const < Identifier


export class TagTypeIdentifier < Identifier

	prop name
	prop ns

	def load val
		@str = ("" + val)
		var parts = @str.split(":")
		@raw = val
		@name = parts.pop
		@ns = parts.shift # if any?
		return @str

	def js
		# p "tagtypeidentifier.js {self}"
		return "IMBA_TAGS.{@str.replace(":","$")}"

	def c
		js

	def func
		var name = @name.replace(/-/g,'_').replace(/\#/,'') # hmm
		name += "${@ns.toLowerCase}" if @ns
		name

	def id
		var m = @str.match(/\#([\w\-\d\_]+)\b/)
		m ? m[1] : nil
		

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

export class Call < Expression

	prop callee
	prop receiver
	prop args
	prop block

	def initialize callee, args, opexists
		# some axioms that share the same syntax as calls will be redirected from here
		
		if callee isa VarOrAccess
			var str = callee.value.symbol
			# p "Call callee {callee} - {str}"
			if str == 'extern'
				# p "returning extern instead!"
				return ExternDeclaration.new(args)
			if str == 'tag'
				# console.log "ERROR - access args by some method"
				return TagWrapper.new(args and args:index ? args.index(0) : args[0]) # hmmm
			if str == 'export'
				return ExportStatement.new(args) # hmmm

		@callee = callee
		@args = args or ArgList.new([]) # hmmm

		if args isa Array
			@args = ArgList.new(args)
			# console.log "ARGUMENTS IS ARRAY - error {args}"
		# p "call opexists {opexists}"
		self

	def visit
		# console.log "visit args {args}"
		args.traverse
		callee.traverse

		@block && @block.traverse 

	def addBlock block
		# if args.names
		# p "addBlock to call!"
		# var idx = -1
		var pos = @args.filter(|n,i| n == '&')[0]
		# idx = i if n == '&'
		# p "FOUND LOGIC"
		# p "node in args {i} {n}"
		pos ? args.replace(pos,block) : args.push(block)
		# args.push(block)
		self

	def receiver
		@receiver ||= (callee isa Access && callee.left || NULL)

	# check if all arguments are expressions - otherwise we have an issue

	def safechain
		callee.safechain # really?

	def c
		super

	def js
		var opt = expression: yes
		var rec = null
		var args = compact__(args)
		var splat = args.some do |v| v isa Splat
		var out = nil
		var lft = nil
		var rgt = nil
		var wrap = nil

		var callee = @callee = @callee.node # drop the var or access?

		# p "{self} - {@callee}"

		if callee isa Call && callee.safechain
			# p "the outer call is safechained"
			yes
			# we need to specify that the _result_ of

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
			callee = @callee = OP('.',callee.left,callee.right)
			# console.log "unwrapping the propertyAccess"
			

		if lft && lft.safechain
			# p "Call[left] is safechain {lft}".blue
			lft.cache
			# we want to 
			# wrap = ["{}"]
			# p "Call should not cache whole result - only the result of the call".red


		if callee.safechain
			# 
			# if lft isa Call
			# if lft isa Call # could be a property access as well - it is the same?
			# if it is a local var access we simply check if it is a function, then call
			# but it should be safechained outside as well?
			lft.cache if lft
			# the outer safechain should not cache the whole call - only ask to cache
			# the result? -- chain onto
			# p "Call safechain {callee} {lft}.{rgt}"
			var isfn = Util.IsFunction.new([callee])
			wrap = ["{isfn.c} && ",""]

		# if callee.right
		# if calle is PropertyAccess we should convert it first
		# to keep the logic in call? 
		# 

		# if 

		# should just force expression from the start, no?
		if splat
			# important to wrap the single value in a value, to keep implicit call
			# this is due to the way we check for an outer Call without checking if
			# we are the receiver (in PropertyAccess). Should rather wrap in CallArguments
			var ary = (args.count == 1 ? ValueNode.new(args.first.value) : Arr.new(args.list))
			receiver.cache # need to cache the target
			out = "{callee.c(expression: yes)}.apply({receiver.c},{ary.c(expression: yes)})"

		elif @receiver
			@receiver.cache
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

	def js
		"{callee.c}()"



export class New < Call

	def js o
		# 
		var out = "new {callee.c}"
		out += '()' unless o.parent isa Call
		out
		# "{callee.c}()"



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
		nodes.map do |item|
			var variable = root.register item.symbol, item, type: 'global' # hmmmm
			variable.addReference(item)
		self

	def c
		"// externs"
		# register :global, self, type: 'global'
		
		

# FLOW

export class ControlFlow < Node



export class ControlFlowStatement < ControlFlow

	def isExpressable
		no



export class If < ControlFlow


	prop test
	prop body
	prop alt


	def addElse add
		# p "add else!",add
		if alt && alt isa If
			# p 'add to the inner else(!)',add
			alt.addElse(add)
		else
			self.alt = add
		self


	def initialize cond, body, o = {}
		# p "IF options",o && o:type
		@test = (o:type == 'unless' ? OP('!',cond) : cond)
		@body = body


	def visit
		test.traverse if test
		body.traverse if body
		alt.traverse if alt


	def js o
		# would possibly want to look up / out 
		var brace = braces: yes, indent: yes

		var cond = test.c(expression: yes) # the condition is always an expression
		

		if o.isExpression
			var code = body.c # (braces: yes)
			# is expression!
			if alt
				# be safe - wrap condition as well
				return "({cond}) ? ({code}) : ({alt.c})"
			else
				# again - we need a better way to decide what needs parens
				# maybe better if we rewrite this to an OP('&&'), and put
				# the parens logic there
				return "({cond}) && ({code})"
		else
			var code = body.c(brace) # (braces: yes)
			# don't wrap if it is only a single expression?
			var out = "if({cond}) " + code # ' {' + code + '}' # '{' + code + '}'
			out += " else {alt.c(alt isa If ? {} : brace)}" if alt
			out


	def consume node
		# p 'assignify if?!'
		# if it is possible, convert into expression
		if node isa TagTree
			# p "TAG TREEEEEE"
			# hmmm
			@body = body.consume(node)
			@alt = alt.consume(node) if alt
			return self

		if isExpressable
			toExpression # mark as expression(!)
			return super
		else
			@body = body.consume(node)
			@alt = alt.consume(node) if alt
		self


	def isExpressable
		var exp = body.isExpressable && (!alt || alt.isExpressable)
		# if exp
		# 	p "if is expressable".green
		# else
		# 	p "if is not expressable".red
		return exp



export class Loop < Statement


	prop scope
	prop options
	prop body
	prop catcher


	def initialize options = {}
		self.options = options 
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
		# p "Loop.c - {isExpressable} {stack} {stack.isExpression}"
		# p "stack is expression? {o} {isExpression}"

		if stack.isExpression or isExpression
			# what the inner one should not be an expression though?
			# this will resut in an infinite loop, no?!?
			var ast = CALL(FN([],[self]),[])
			return ast.c o
		
		elif stack.current isa Block
			# hmm - need to check more thoroughly
			# p "parent is a block!"
			super.c o
		else
			# p "Should never get here?!?"
			var ast = CALL(FN([],[self]),[])
			return ast.c o
			# need to wrap in function



export class While < Loop


	prop test


	def initialize test, opts
		@test = test
		@scope = WhileScope.new(self)
		set(opts) if opts
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
		var ast = BLOCK(self,resvar.accessor) # should be varaccess instead? # hmmm?
		ast.consume(node)
		# NOTE Here we can find a way to know wheter or not we even need to 
		# return the resvar. Often it will not be needed
		# FIXME what happens if there is no node?!?


	def js
		var out = "while({test.c(expression: yes)})" + body.c(braces: yes, indent: yes) # .wrap

		if scope.vars.count > 0
			# p "while-block has declared variables(!)"
			return [scope.vars.c,out]
		out



# This should define an open scope
# should rather 
export class For < Loop


	def initialize o = {}
		@options = o
		@scope = ForScope.new(self)


	def visit
		scope.visit
		declare
		# should be able to toggle whether to keep the results here already(!)
		body.traverse
		options[:source].traverse # what about awakening the vars here?


	def declare
		var scope = scope
		var src  = options:source
		var vars = options[:vars] = {}
		var oi   = options:index


		# var i = vars:index = oi ? scope.declare(oi,0) : util.counter(0,yes).predeclare

		if src isa Range
			# p "range for-loop"
			vars:len = scope.declare('len',src.right) # util.len(o,yes).predeclare
			vars:index = scope.declare(options:name,src.left)
			vars:value = vars:index
		else			
			# vars:value = scope.declare(options:name,null,let: yes)
			# we are using automatic caching far too much here
			var i = vars:index = oi ? scope.declare(oi,0, let: yes) : util.counter(0,yes,scope).predeclare
			vars:source = util.iterable(src,yes).predeclare # hmm
			vars:len    = util.len(vars:source,yes).predeclare # hmm
			vars:value  = scope.declare(options:name,null,let: yes)
			vars:value.addReference(options:name) # adding reference!
			i.addReference(oi) if oi

		return self


	def consume node
		# p "Loop consume? {node}"
		# p "For.consume {node}".cyan
		return super if isExpressable

		# other cases as well, no?
		if node isa TagTree
			# WARN this is a hack to allow references coming through the wrapping scope 
			# will result in unneeded self-declarations and other oddities
			# scope.parent.context.reference
			scope.context.reference
			return CALL(Lambda.new([],[self]),[])
			

		var resvar = null
		var reuseable = node isa Assign && node.left.node isa LocalVarAccess

		# WARN Optimization - might have untended side-effects
		# if we are assigning directly to a local variable, we simply
		# use said variable for the inner res
		if reuseable
			
			resvar = scope.declare(node.left.node.variable,Arr.new([]),proxy: yes)
			node = null
			# p "consume variable declarator!?".cyan
		else
			# declare the variable we will use to soak up results
			# p "Creating value to store the result of loop".cyan
			resvar = scope.declare(:res,Arr.new([]),system: yes)

		# p "GOT HERE TO PUSH ASSIGN",PushAssign
		@catcher = PushAssign.new("push",resvar,null) # the value is not preset
		body.consume(@catcher) # should still return the same body

		var ast = BLOCK(self,resvar.accessor) # should be varaccess instead?
		ast.consume(node) if node
		# this is never an expression (for now -- but still)
		return ast


	def js
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
		
		elif val.refcount < 3
			# p "should proxy value-variable instead"
			val.proxy(vars:source,i)
		else
			body.unshift(OP('=',val,OP('.',vars:source,i)))
			# body.unshift(head)
			# TODO check lengths - intelligently decide whether to brace and indent
		var head = "for({scope.vars.c}; {cond.c}; {final.c}) "
		head + body.c(braces: yes, indent: yes) # .wrap


	def head
		var vars = options:vars
		OP('=',vars:value,OP('.',vars:source,vars:index))



export class ForIn < For


		
export class ForOf < For

	def declare
		var vars = options:vars = {}

		var o = vars:source = scope.declare('o',options:source,system: true)
		var v = vars:value = scope.declare(options:index,null,let: yes) if options:index

		if options:own
			var i = vars:index  = scope.declare('i',0,system: true)
			var keys = vars:keys = scope.declare(:keys,Util.keys(o.accessor),system: yes)
			var l = vars:len = scope.declare('l',Util.len(keys.accessor),system: yes)
			var k = vars:key = scope.declare(options:name,null,system: yes)
		else
			# we set the var
			var k = vars:key = scope.declare(options:name,nil, system: yes)
		
		# TODO use util - why add references already? Ah -- this is for the highlighting
		v.addReference(options:index) if v and options:index
		k.addReference(options:name) if k and options:name

		self

	def js
		var vars = options:vars

		var o = vars:source
		var k = vars:key
		var v = vars:value
		var i = vars:index


		if v 
			# set value as proxy of object[key]
			v.refcount < 3 ? v.proxy(o,k) : body.unshift(OP('=',v,OP('.',o,k)))

		if options:own

			if k.refcount < 3 # should probably adjust these
				k.proxy(vars:keys,i)
			else
				body.unshift(OP('=',k,OP('.',vars:keys,i)))

			var head = "for({scope.vars.c}; {OP('<',i,vars:len).c}; {OP('++',i).c})"
			return head + body.c(indent: yes, braces: yes) # .wrap

		var code = body.c(braces: yes, indent: yes)
		# it is really important that this is a treated as a statement
		[scope.vars.c,"for(var {k.c} in {o.c})" + code]

	def head
		var v = options:vars

		[
			OP('=',v:key,OP('.',v:keys,v:index))
			OP('=',v:value,OP('.',v:source,v:key)) if v:value
		]



export class Begin < Block


	def initialize body
		@nodes = blk__(body).nodes


	def shouldParenthesize
		isExpression # hmmm



export class Switch < ControlFlowStatement


	prop source
	prop cases
	prop fallback


	def initialize a,b,c
		@source = a
		@cases = b
		@fallback = c


	def visit
		cases.map do |item| item.traverse
		fallback.visit if fallback
		source.visit if source


	def consume node
		@cases = @cases.map(|item| item.consume(node))
		@fallback = @fallback.consume(node) if @fallback
		self


	def js
		var body = []

		for part in cases
			part.autobreak
			body.push(part)

		if fallback
			body.push("default:\n" + fallback.c(indent: yes))

		"switch({source.c}) " + helpers.bracketize(cary__(body).join("\n"),yes)



export class SwitchCase < ControlFlowStatement


	prop test
	prop body


	def initialize test, body
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


	def js
		@test = [@test] unless @test isa Array 
		var cases = @test.map do |item| "case {item.c}:"
		cases.join("\n") + body.c(indent: yes) # .indent



export class Try < ControlFlowStatement


	prop body
	# prop ncatch
	# prop nfinally

	def initialize body, c, f
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


	def js
		var out = "try " + body.c(braces: yes, indent: yes) + "\n"
		out += @catch.c if @catch
		out += @finally.c if @finally

		unless @catch or @finally
			out += "catch(e)\{\}"
		out



export class Catch < ControlFlowStatement


	def initialize body, varname
		@body = blk__(body)
		@scope = CatchScope.new(self)
		@varname = varname


	def consume node
		@body = @body.consume(node)
		self


	def visit
		@scope.visit
		@variable = @scope.register(@varname,self,type: 'catchvar')
		@body.traverse


	def js
		"catch ({@variable.c}) " + @body.c(braces: yes, indent: yes) + "\n"


# repeating myself.. don't deal with it until we move to compact tuple-args
# for all astnodes


export class Finally < ControlFlowStatement

	def initialize body
		@body = blk__(body)


	def visit
		@body.traverse


	def consume node
		# swallow silently
		self


	def js
		"finally " + @body.c(braces: yes, indent: yes)


# RANGE

export class Range < Op

	def inclusive
		op == '..'
		
	def c
		"range"


export class Splat < ValueNode

	def js
		var par = stack.parent
		if par isa Arr
			"[].slice.call({value.c})"
		else
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

	def classes
		p 'TagDescClasses',$0
		self

export class Tag < Expression

	prop parts
	prop object
	prop reactive
	prop parent
	prop tree

	def initialize o = {}
		# p "init tag",$0
		@parts = []
		o:classes ||= []
		o:attributes ||= []
		o:classes ||= []
		@options = o

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
		# hmm
		@object = node
		# must be the first part?
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

	def type
		@options:type || :div

	def consume node
		if node isa TagTree
			# p "tag consume tagtree? {node.reactive}"
			reactive = node.reactive or !!option(:ivar) # hmm
			parent = node.root # hmm
			return self
		else
			super

	def visit
		var o = @options
		if o:body
			# force expression(!)
			o:body.map(|v| v.traverse)

		# id should also be a regular part
		# hmm?
		o:id.traverse if o:id

		for part in @parts
			part.traverse

		# for atr in @options:attributes
		# 	atr.traverse

		self

	def reference
		# should resolve immediately to get the correct naming-structure that
		# reflects the nesting-level of the tag
		@reference ||= scope__.temporary(self,type: 'tag').resolve

	# should this not happen in js?
	def js
		# p JSON.stringify(@options)
		# var attrs = TagAttributes.new(o:attributes)
		# p "got here?"
		var o = @options
		var a = {}

		var setup = []
		var calls = []
		var statics = []

		var scope = scope__
		var commit = "end"

		var isSelf = type isa Self

		for atr in o:attributes
			a[atr.key] = atr.value # .populate(obj)

		var quote = do |str| helpers.singlequote(str)

		var id = o:id isa Node ? o:id.c : (o:id and quote(o:id.c))



		#  "scope is", !!scope
		# p "type is {type}"
		var out = if isSelf
			commit = "synced"
			# p "got here"
			# setting correct context directly
			reactive = yes
			@reference = scope.context
			# hmm, not sure about this
			scope.context.c

		elif o:id
			"ti$('{type.func}',{id})"
		else
			"t$('{type.func}')"

		# this is reactive if it has an ivar
		if o:ivar
			reactive = yes
			statics.push(".setRef({quote(o:ivar.name)},{scope.context.c})")

		# hmmm
		var tree = TagTree.new(o:body, root: self, reactive: reactive).resolve
		self.tree = tree


		for part in @parts
			if part isa TagAttr
				var akey = String(part.key)

				# the attr should compile itself instead -- really

				if akey[0] == '.' # should check in a better way
					calls.push ".flag({quote(akey.substr(1))},{part.value.c})"
				else
					calls.push ".{helpers.setterSym(akey)}({part.value.c})"

			elif part isa TagFlag
				calls.push(part.c)

		if object
			calls.push(".setObject({object.c})")

		# p "tagtree is static? {tree.static}"

		# we need to trigger our own reference before the body does
		if reactive
			reference # hmm

		if var body = tree.c(expression: yes) # force it to be an expression, no?
			calls.push (isSelf ? ".setChildren([{body}])" : ".setContent([{body}])")
			# out += ".body({body})"

		# if o:attributes:length # or -- always?
		# adds lots of extra calls - but okay for now
		calls.push ".{commit}()"

		if statics:length
			out = out + statics.join("")

		# hmm - hack much
		if (o:ivar or reactive) and !(type isa Self)
			# if this is an ivar, we should set the reference relative
			# to the outer reference, or possibly right on context?
			var par = parent
			var ctx =  !o:ivar and par and par.reference or scope.context
			var key = o:ivar or par and par.tree.indexOf(self)

			# need the context -- might be better to rewrite it for real?
			# parse the whole thing into calls etc
			var acc = OP('.',ctx,key).c

			out = "({reference.c} = {acc} || ({acc} = {out}))"

		# should we not add references to the outer ones first?

		# now work on the refereces?

		# free variable
		@reference.free if @reference isa Variable
		# if setup:length
		#	out += ".setup({setup.join(",")})"

		return out + calls.join("")

# This is a helper-node
export class TagTree < ListNode

	def load list
		if list isa ListNode
			@indentation ||= list.@indentation
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

	def c
		return super
		
		# p "TagTree.c {nodes}"	
		var l = nodes:length 
		if l == 1
			# p "TagTree.c {nodes}"
			map do |v| v.c(expression: yes)
			# nodes.c(expression: yes)
		elif l > 1
			nodes.c(expression: yes)


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

	def add part, typ
		# p "select add!",part,typ
		push(part)
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

		# var scoped = typ == '%' or typ == '%%'
		# var all = typ == '$' or typ == '%'

		if typ == '%'
			"q$({q},{o.scope.context.c(explicit: yes)})" # explicit context
		elif typ == '%%'
			"q$$({q},{o.scope.context.c})"
		else 
			"q{typ}({q})"

		# return "{typ} {scoped} - {all}"
		

export class SelectorPart < ValueNode

	def c
		c__(@value)
		# "{value.c}"

export class SelectorType < SelectorPart

	def c
		# support
		# p "selectortype {value}"
		# var out = value.c
		var name = value.name
		# hmm - what about svg? do need to think this through.
		# at least be very conservative about which tags we
		# can drop the tag for?
		# out in TAG_TYPES.HTML ? 
		name in TAG_TYPES.HTML ? name : value.sel


export class SelectorUniversal < SelectorPart

export class SelectorNamespace < SelectorPart

export class SelectorClass < SelectorPart

	def c
		".{c__(@value)}"

export class SelectorId < SelectorPart

	def c
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

	def js
		# introduce a util here, no?
		CALL(OP('.',Util.Promisify.new([value]),'then').prebreak,[func]).c
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
		super

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
		@imports = imports
		@source = source
		@ns = ns
		self


	def visit
		if @ns
			@nsvar ||= scope__.register(@ns,self)
		self


	def js
		var req = CALL(Identifier.new("require"),[source])

		if @ns
			# must register ns as a real variable
			return "var {@nsvar.c} = {req.c}"
		elif @imports

			# create a require for the source, with a temporary name?
			var out = [req.cache.c]

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

	def js
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
		node.cache(force: yes, type: 'len') if cache
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
		node.cache(force: yes, type: 'iter') if cache
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
		node.cache(force: yes, type: 'counter') if cache
		return node

	def self.array size, cache
		var node = Util.Array.new([size])
		node.cache(force: yes, type: 'list') if cache
		return node

	def self.defineTag type, ctor, supr
		CALL(TAGDEF,[type,ctor,supr])

	# hmm
	def self.defineClass name, supr, initor
		CALL(CLASSDEF,[name or initor,sup])


	def self.toAST obj
		# deep converter that takes arrays etc and converts into ast
		self

	def js
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
		

	def js
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

	def js
		# When this is triggered, we need to add it to the top of file?
		scope__.root.helper(self,helper)
		"intersect$({args.map(|v| v.c ).join(',')})"

export class Util.Extend < Util

	def js
		# When this is triggered, we need to add it to the top of file?
		"extend$({compact__(cary__(args)).join(',')})"

export class Util.IndexOf < Util

	def helper
		'''
		function idx$(a,b){
			return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
		};

		'''
		

	def js
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

	def js
		# When this is triggered, we need to add it to the top of file?
		scope__.root.helper(self,helper)
		"subclass$({args.map(|v| v.c).join(',')});\n"

export class Util.Promisify < Util

	def helper
		# should also check if it is a real promise
		"function promise$(a)\{ return a instanceof Array ? Promise.all(a) : (a && a.then ? a : Promise.resolve(a)); \}"
		
	def js
		# When this is triggered, we need to add it to the top of file?
		scope__.root.helper(self,helper)
		"promise$({args.map(|v| v.c).join(',')})"

export class Util.Class < Util

	def js
		# When this is triggered, we need to add it to the top of file?
		"class$({args.map(|v| v.c).join(',')})"

export class Util.Iterable < Util

	def helper
		# now we want to allow nil values as well - just return as empty collection
		# should be the same for for own of I guess
		"function iter$(a)\{ return a ? (a.toArray ? a.toArray() : a) : []; \};"
		
	def js
		return args[0].c if args[0] isa Arr # or if we know for sure that it is an array
		# only wrap if it is not clear that this is an array?
		scope__.root.helper(self,helper)
		return "iter$({args[0].c})"

export class Util.IsFunction < Util

	def js
		# p "IS FUNCTION {args[0]}"
		# just plain check for now
		"{args[0].c}"
		# "isfn$({args[0].c})"
		# "typeof {args[0].c} == 'function'"
		

export class Util.Array < Util

	def js
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

	def initialize node, parent
		@head = []
		@node = node
		@parent = parent
		@vars = VariableDeclaration.new([])
		@virtual = no
		@counter = 0
		@varmap = {}
		@varpool = []

	def context
		@context ||= ScopeContext.new(self)

	def traverse
		self

	def visit
		# p "visited scope!"
		@parent = STACK.scope(1) # the parent scope
		@level = STACK.scopes:length - 1 # hmm

		# p "parent is",@parent

		STACK.addScope(self)
		root.scopes.push(self)
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
		return nil

	def register name, decl = nil, o = {}

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
		@varmap[name] = item
		return item
	# declares a variable (has no real declaration beforehand)

	# change these values, no?
	def temporary refnode, o = {}, name = nil

		# p "registering temporary {refnode} {name}"
		# reuse variables
		if o:type
			for v in @varpool
				if v.type == o:type && v.declarator == nil
					return v.reuse(refnode)

		# should only 'register' as ahidden variable, no?
		# if there are real nodes inside that tries to refer to vars
		# defined in outer scopes, we need to make sure they are not named after this
		var item = SystemVariable.new(self,name,refnode,o)
		@varpool.push(item) # WHAT? It should not be in the pool unless explicitly put there?
		@vars.push(item) # WARN variables should not go directly into a declaration-list
		return item
		# return register(name || "__",nil,system: yes, temporary: yes)

	def declare name, init = null, options = {}
		# if name isa Variable
		# p "SCOPE declare var".green
		name = helpers.symbolize(name)
		@vars.add(name,init) # .last
		var decl = @vars.last
		# item = Variable.new(self,name,decl)
		var item = Variable.new(self,name,decl,options)
		decl.variable = item
		item.resolve
		# should be possible to force-declare for this scope, no?
		# if this is a system-variable 

	def lookup name
		var ret = null
		name = helpers.symbolize(name)
		if @varmap.hasOwnProperty(name)
			ret = @varmap[name] 
		else
			# look up any parent scope ?? seems okay
			# !isClosed && 
			ret = parent && parent.lookup(name)
		ret ||= (g.lookup(name) if var g = root)
		# g = root
		ret

	def free variable
		# p "free variable"
		variable.free # :owner = nil
		# @varpool.push(variable)
		self
	
	def isClosed
		no

	def finalize
		self

	def klass
		var scope = self
		while scope
			scope = scope.parent
			return scope if scope isa ClassScope
		return nil

	def head
		[@vars,@params]

	def c o = {}
		o:expression = no
		# need to fix this
		node.body.head = head
		var body = node.body.c(o)

		# var head = [@vars,@params].block.c(expression: no)
		# p "head from scope is ({head})"
		# var out = [head or nil,body].flatten__.compact.join("\n")
		# out
		# out = '{' + out + 

	def dump
		var vars = Object.keys(@varmap).map do |k| 
			var v = @varmap[k]
			v.references:length ? dump(v) : nil

		return \
			type: self:constructor:name
			level: (level or 0)
			vars: compact__(vars)
			loc: node.body.region

	def toString
		"{self:constructor:name}"
		
# FileScope is wrong? Rather TopScope or ProgramScope
export class FileScope < Scope

	prop warnings
	prop scopes

	def initialize
		super
		# really? makes little sense
		register :global, self, type: 'global'
		register :exports, self, type: 'global'
		register :console, self, type: 'global'
		register :process, self, type: 'global'
		register :setTimeout, self, type: 'global'
		register :setInterval, self, type: 'global'
		register :clearTimeout, self, type: 'global'
		register :clearInterval, self, type: 'global'
		register :__dirname, self, type: 'global'
		# preregister global special variables here
		@warnings = []
		@scopes = []
		@helpers = []

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
		@helpers.push(value) if @helpers.indexOf(value) == -1
		return self

	def head
		[@helpers,@params,@vars]

	def warn data
		# hacky
		data:node = nil
		# p "warning",JSON.stringify(data)
		@warnings.push(data)
		self

	def dump
		var scopes = @scopes.map(|s| s.dump)
		scopes.unshift(super.dump)

		var obj = 
			warnings: dump(@warnings)
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

	def context
		# if we are wrapping in an expression - we do need to add a reference
		# @referenced = yes
		parent.context
	# 	# usually - if the parent scope is a closed scope we dont really need
	# 	# to force a reference
	# 	# @context ||= parent.context.reference(self)

export class CatchScope < FlowScope

export class WhileScope < FlowScope

export class ForScope < FlowScope

# lives in scope
export class Variable < Node

	prop scope
	prop name
	prop alias
	prop type
	prop options
	prop declarator
	prop autodeclare
	prop references
	prop export

	def initialize scope, name, decl, options
		@scope = scope
		@name = name
		@alias = nil
		@declarator = decl
		@autodeclare = no
		@declared = yes
		@resolved = no
		@options = options || {}
		@type = @options:type || 'var'
		@export = no # hmmmm
		# @declarators = [] # not used now
		@references = [] # should probably be somewhere else, no?


	def resolve scope = scope, force = no
		return self if @resolved and !force

		@resolved = yes
		# p "need to resolve!".cyan
		if var item = scope.lookup(name)
			# p "variable already exists {name}".red
			# possibly redefine this inside, use it only in this scope
			if item.scope != scope && options[:let]
				# p "override variable inside this scope".red
				scope.varmap[name] = self

			# different rules for different variables?
			if @options:proxy
				# p "is proxy -- no need to change name!!! {name}".cyan
				yes
			else
				var i = 0
				var orig = @name
				while scope.lookup(@name)
					@name = "{orig}{i += 1}"

		scope.varmap[name] = self
		return self
		# p "resolve variable".cyan

	def reference
		self

	def free ref
		# p "free variable!"
		@declarator = nil
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

		if @proxy
			# p "var is proxied!",@proxy
			@c = "{@proxy[0].c}[{@proxy[1].c}]"
		else
			var v = (alias or name)
			@c = typeof v == 'string' ? v : v.c
			# allow certain reserved words
			# should warn on others though (!!!)
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

	def addReference ref
		@references.push(ref)
		self

	def autodeclare
		return self if option(:declared)
		# p "variable should autodeclare(!)"
		@autodeclare = yes

		# WARN
		# if scope isa WhileScope
		# 	p "should do different autodeclare!!"
		# 	# or we should simply add them

		scope.vars.push(self) # only if it does not exist here!!!
		set(declared: yes)
		self

	def toString
		String(name)

	def dump typ
		{
			type: type
			name: name
			refs: dump(@references, typ)
		}
		
export class SystemVariable < Variable

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

		var typ = @options:type
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

		unless @name
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
		@reference = nil
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

	def reference scope
		self

	def c o
		return "" if o and o:explicit
		var val = @value || @reference
		return val ? val.c : "this"
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
export var ARGUMENTS = ArgsReference.new('arguments')
export var EMPTY = ''
export var NULL = 'null'

export var RESERVED = ['default','native','enum','with']
export var RESERVED_REGEX = /^(default|native|enum|with)$/

export var UNION = Const.new('union$')
export var INTERSECT = Const.new('intersect$')
export var CLASSDEF = Const.new('imba$class')
export var TAGDEF = Const.new('Imba.Tag.define')
export var NEWTAG = Identifier.new("tag$")










