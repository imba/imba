

extern parseInt


var helpers = require './helpers'

AST = {}


OP = do |op, left, right, opts|
	if op == '.'

		if right isa String
			right = AST.Identifier.new(right)

		AST.Access.new(op,left,right)
	elif op == '='
		if left isa AST.Tuple

			return AST.TupleAssign.new(op,left,right)
		AST.Assign.new(op,left,right)
	elif op in ['?=','||=','&&=']
		AST.ConditionalAssign.new(op,left,right)
	elif op in ['=<']
		AST.AsyncAssign.new('=',left,AST.Await.new(right))

	elif op in ['+=','-=','*=','/=','^=','%=']
		AST.CompoundAssign.new(op,left,right)



	elif op == 'instanceof'
		AST.InstanceOf.new(op,left,right)
	elif op == 'in'
		AST.In.new(op,left,right)
	elif op == 'typeof'
		AST.TypeOf.new(op,left,right)
	elif op == 'delete'
		AST.Delete.new(op,left,right)
	elif op in ['--','++','!','√'] # hmm
		AST.UnaryOp.new(op,left,right)
	elif op in ['>','<','>=','<=','==','===','!=','!==']
		AST.ComparisonOp.new(op,left,right)
	elif op in ['∩','∪']
		AST.MathOp.new(op,left,right)
	elif op in ['..','...']
		AST.Range.new(op,left,right)
	else
		AST.Op.new(op,left,right)

LIT = do |val|
	AST.Literal.new(val)

SYM = do |val|
	AST.Symbol.new(val)

IF = do |cond,body,alt|
	var node = AST.If.new(cond,body)
	node.addElse(alt) if alt
	node

FN = do |pars,body|
	AST.Func.new(pars,body)

CALL = do |callee,pars = []|

	AST.Call.new(callee,pars)

CALLSELF = do |name,pars = []|
	var ref = AST.Identifier.new(name)
	AST.Call.new(OP('.',AST.SELF,ref),pars)

BLOCK = do
	AST.Block.wrap([]:slice.call(arguments))

WHILE = do |test,code|
	AST.While.new(test).addBody(code)

SPLAT = do |value|
	if value isa AST.Assign

		value.left = AST.Splat.new(value.left)
		return value
	else
		AST.Splat.new(value)


OP.ASSIGNMENT = [ "=" , "+=" , "-=" , "*=" , "/=" , "%=", "<<=" , ">>=" , ">>>=", "|=" , "^=" , "&=" ]
OP.LOGICAL = [ "||" , "&&" ]
OP.UNARY = [ "++" , "--" ]

AST.LOC = do |loc|
	self

def AST.parse str, opts = {}
	var indent = str.match(/\t+/)[0]
	AST.Imba.parse(str,opts)

def AST.inline str, opts = {}
	AST.parse(str,opts).body

def AST.node typ, pars
	if typ == 'call'
		if pars[0].c == 'return'
			pars[0] = 'tata'	
		AST.Call.new(pars[0],pars[1],pars[2])


def AST.escapeComments str
	return '' unless str
	return str




class AST.Indentation

	prop open
	prop close

	def initialize a,b
		@open = a or 1
		@close = b or 1
		self


	def wrap str, o
		var pre = @open:pre
		var post = @open:post
		var esc = AST:escapeComments


		str = esc(post).replace(/^\n/,'') + str
		str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n")

		str = esc(pre) + '\n' + str

		str = str + '\n' unless str[str:length - 1] == '\n'



		return str
		
AST.INDENT = AST.Indentation.new

class AST.Stack

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

		self

	def pop node
		@nodes.pop(node)
		self

	def parent
		@nodes[@nodes:length - 2]

	def current
		@nodes[@nodes:length - 1]

	def up test
		test ||= do |v| !(v isa AST.VarOrAccess)

		if test:prototype isa AST.Node
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

		var scopes = []
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]
			scopes.push(node.@scope) if node.@scope
			i -= 1
		return scopes

	def method
		up(AST.MethodDeclaration)

	def isExpression
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]

			if node isa AST.Code or node isa AST.Loop
				return false
			if node.isExpression
				return true

			i -= 1
		return false

	def toString
		"Stack({@nodes.join(" -> ")})"

	def scoping
		@nodes.filter(|n| n.@scope ).map(|n| n.@scope )


STACK = AST.Stack.new

class AST.Node

	prop o
	prop options
	prop traversed
	prop statement

	def safechain
		no

	def dom
		var name = "ast_" + self:constructor:name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase

		if Imba.TAGS[name]
			var node = Imba.tag(name)
			node.bind(self).build
			return node
		else
			return "[{name}]"

	def p


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


	def consume node
		if node isa AST.PushAssign
			return AST.PushAssign.new(node.op,node.left,self)

		if node isa AST.Assign


			return OP(node.op,node.left,self)
		elif node isa AST.Op
			return OP(node.op,node.left,self)
		elif node isa AST.Return

			return AST.Return.new(self)
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
		AST.Block.wrap([self])

	def node
		self

	def scope__
		STACK.scope

	def up
		STACK.parent

	def util
		AST.Util

	def receiver
		self

	def addExpression expr


		var node = AST.ExpressionBlock.new([self])
		return node.addExpression(expr)

	def addComment comment

		@comment = comment
		self

	def indented a,b

		if b isa Array

			add(b[0])
			b = b[1]


		@indented = [a,b]
		@indentation ||= a and b ? AST.Indentation.new(a,b) : AST.INDENT
		self

	def prebreak term = '\n'

		console.log "prebreak!!!!"
		@prebreak = @prebreak or term
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
			@cache = nil # hmm, removing the cache WARN
		self


	def predeclare
		if @cache
			scope__.vars.swap(@cache:var,self)
		self


	def alias
		nil

	def warn text, opts = {}


		opts:message = text
		opts:loc ||= loc
		scope__.root.warn opts
		self

	def c o
		if @cache && @cache:cached
			@cache:lookups++
			if @cache:uses == @cache:lookups
				@cache:var.free




			return @cache:var.c

		STACK.push(self)
		forceExpression if o && o:expression

		if o and o:indent

			@indentation ||= AST.INDENT


		var out = js(STACK,o)

		var paren = shouldParenthesize
		
		if var indent = @indentation
			out = indent.wrap(out,o)

		if paren

			if out isa Array
				out = "({out})"
			else
				out = out.parenthesize

		if o and o:braces
			out = '{' + out + '}'




		STACK.pop(self)

		if @cache


			out = "{@cache:var.c}={out}" unless @cache:manual
			var par = STACK.current
			out = out.parenthesize if par isa AST.Access || par isa AST.Op # others?
			@cache:cached = yes

		if @temporary && @temporary:length
			@temporary.map do |temp| 

				temp.decache




		return out

class AST.Expression < AST.Node

class AST.ValueNode < AST.Node
	prop value

	def initialize value
		@value = load(value)

	def load value
		value

	def js
		value.c

	def visit
		@value.traverse if @value && @value:traverse
		self

	def region
		@value:_region

class AST.Statement < AST.ValueNode

	def isExpressable
		return no
		
	def statement
		return true


class AST.Meta < AST.ValueNode

class AST.Comment < AST.Meta

	def c o
		if o and o:expression or @value.match(/\n/) # multiline?
			"/*{value.c}*/"
		else
			"// {value.c}"


class AST.Terminator < AST.Meta

	def c
		return @value

		v # .split()


class AST.Newline < AST.Terminator

	def initialize v
		@value = v or '\n'

	def c
		@value
		


class AST.Index < AST.ValueNode

	def js
		@value.c

class AST.NewLines < AST.ValueNode

	def js
		@value

	def isExpressable
		yes

class AST.ListNode < AST.Node

	prop nodes

	def initialize list = [], options = {}
		@nodes = load(list)
		@options = options
	

	def list
		@nodes

	def compact
		@nodes = @nodes.compact
		self

	def load list
		list

	def concat other

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
		nodes.unshift(AST.BR) if br
		nodes.unshift(item)
		self


	def slice a, b
		self:constructor.new(@nodes.slice(a,b))

	def add item
		push(item)
		self

	def break br, pre = no



		br = AST.Terminator.new(br) if typeof br == 'string' # hmmm?
		pre ? unshift(br) : push(br)
		self

	def some cb
		nodes.some(cb)

	def every cb
		nodes.every(cb)

	def filter cb
		if cb:prototype isa AST.Node
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
		



	def last
		var i = @nodes:length
		while i
			i = i - 1
			var v = @nodes[i]
			return v unless v isa AST.Meta
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

		var express = delim != ';'
		var shouldDelim = no
		var nodes = nodes.compact
		var last = last
		var realLast = nodes[nodes:length - 1]


		var parts = nodes.map do |arg| 
			var out = arg.c(expression: express)








			if arg isa AST.Meta
				true


			else


				out = out + delim if !express or arg != last
			out

		return parts.join("")













		

class AST.ArgList < AST.ListNode

	def hasSplat
		list.some do |v| v isa AST.Splat

	def delimiter
		","
















class AST.AssignList < AST.ArgList	




	def concat other
		if @nodes:length == 0 and other isa AST.AssignList

			return other
		else
			super


		self




class AST.Block < AST.ListNode	
	
	prop head

	def self.wrap ary

		ary:length == 1 && ary[0] isa AST.Block ? ary[0] : AST.Block.new(ary)







	def visit


		if @prebreak # hmm

			console.log "PREBREAK IN AST.BLOCK SHOULD THROW"
			first and first.prebreak(@prebreak)
		super
		
	def push item, sep











		nodes.push(item)
		self

	def block
		self

	def loc
		if var opt = option(:ends)

			var a = opt[0].loc
			var b = opt[1].loc

			p "no loc for {opt[0]}" unless a
			p "no loc for {opt[1]}" unless b

			[a[0],b[1]]
		else
			[0,0]

	def initialize expr = []
		self.nodes = expr.flatten.compact or []



	def unwrap
		var ary = []
		for node,i in nodes
			if node isa AST.Block

				ary:push.apply(ary,node.unwrap)
			else
				ary.push(node)
		return ary



	def compile o = {}
		var root = AST.Root.new(self,o)
		root.compile(o)


	def analyze o = {}

		self

	def js o, opts
		var l = nodes:length

		var filter = (|n| n != null && n != undefined && n != AST.EMPTY)
		var ast = nodes.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		var express = isExpression or o.isExpression or (option(:express) and isExpressable)
		return null if ast:length == 0



		if express
			return super(o,delim: ',', nodes: ast)




		var compile = do |node,i|
			var out = node ? node.c : ""
			return null if out == ""


			if out isa Array

				out = out.flatten.compact.filter(filter).join(";\n")

			var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/) # out[out:length - 1] == ";"

			out += ";" unless hasSemiColon or node isa AST.Meta
			




			return out

		ast = ast.map(compile)


		if @head
			var prefix = []
			@head.forEach do |item|
				var out = compile(item)
				prefix.push(out + '\n') if out

			ast = prefix.concat(ast)



		ast = ast.compact.filter(filter).join("") # .replace(/[\s\n]+$/,'')  # hmm really?




	def defers original, replacement
		var idx = nodes.indexOf(original)
		nodes[idx] = replacement if idx >= 0

		replacement.@prebreak ||= original.@prebreak # hacky
		var rest = nodes.splice(idx + 1)
		return rest

	def consume node
		if node isa AST.TagTree # special case?!?


			nodes = nodes.map(|child| child.consume(node))

			nodes = [AST.Arr.new(nodes)] if nodes:length > 1
			

			return self


		if var before = last
			var after = before.consume(node)
			if after != before
				

				replace(before,after)

		return self
		
	def isExpressable
		return no unless nodes.every(|v| v.isExpressable )
		return yes

	def isExpression
		option(:express) || super.isExpression


class AST.VarBlock < AST.ListNode





	def addExpression expr


		if expr isa AST.Assign
			addExpression(expr.left) # make sure this is a valid thing?



			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)

		elif expr isa AST.VarOrAccess

			push(AST.VarReference.new(expr.value))

		elif expr isa AST.Splat && expr.node isa AST.VarOrAccess

			expr.value = AST.VarReference.new(expr.node.value)
			push(expr)
		else
			throw "VarBlock does not allow non-variable expressions"
		self

	def isExpressable


		no

	def js o
		var code = nodes.map do |node| node.c
		code = code.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		return "var {code.join(",")}"

	def consume node



		return self


class AST.Parens < AST.ValueNode

		
	def js o
		var par = up


		if par isa AST.Block
			@noparen = yes unless o.isExpression
			return value.c(expression: o.isExpression)
		else
			value.c(expression: yes)









	def shouldParenthesize


		return no if @noparen #  or par isa AST.ArgList
		return yes

	def prebreak br
		super(br)

		@value.prebreak(br) if @value
		self

	def isExpressable
		value.isExpressable

	def consume node
		value.consume(node)




class AST.ExpressionBlock < AST.ListNode

	def visit

		map(|item| item.traverse)
		self
		
	def c
		map(|item| item.c).join(",")




	def consume node
		value.consume(node)

	def addExpression expr



		if expr.node isa AST.Assign

			push(expr.left)


			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)
		else
			push(expr)
		self


		
		

def AST.parse str, opts = {}
	var indent = str.match(/\t+/)[0]
	AST.Imba.parse(str,opts)

def AST.inline str, opts = {}
	AST.parse(str,opts).body

def AST.node typ, pars
	if typ == 'call'
		if pars[0].c == 'return'
			pars[0] = 'tata'	
		AST.Call.new(pars[0],pars[1],pars[2])


def AST.escapeComments str
	return '' unless str
	return str




class AST.Indentation

	prop open
	prop close

	def initialize a,b
		@open = a or 1
		@close = b or 1
		self


	def wrap str, o
		var pre = @open:pre
		var post = @open:post
		var esc = AST:escapeComments


		str = esc(post).replace(/^\n/,'') + str
		str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n")

		str = esc(pre) + '\n' + str

		str = str + '\n' unless str[str:length - 1] == '\n'



		return str
		
AST.INDENT = AST.Indentation.new

class AST.Stack

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

		self

	def pop node
		@nodes.pop(node)
		self

	def parent
		@nodes[@nodes:length - 2]

	def current
		@nodes[@nodes:length - 1]

	def up test
		test ||= do |v| !(v isa AST.VarOrAccess)

		if test:prototype isa AST.Node
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

		var scopes = []
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]
			scopes.push(node.@scope) if node.@scope
			i -= 1
		return scopes

	def method
		up(AST.MethodDeclaration)

	def isExpression
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]

			if node isa AST.Code or node isa AST.Loop
				return false
			if node.isExpression
				return true

			i -= 1
		return false

	def toString
		"Stack({@nodes.join(" -> ")})"

	def scoping
		@nodes.filter(|n| n.@scope ).map(|n| n.@scope )


STACK = AST.Stack.new

class AST.Node

	prop o
	prop options
	prop traversed
	prop statement

	def safechain
		no

	def dom
		var name = "ast_" + self:constructor:name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase

		if Imba.TAGS[name]
			var node = Imba.tag(name)
			node.bind(self).build
			return node
		else
			return "[{name}]"

	def p


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


	def consume node
		if node isa AST.PushAssign
			return AST.PushAssign.new(node.op,node.left,self)

		if node isa AST.Assign


			return OP(node.op,node.left,self)
		elif node isa AST.Op
			return OP(node.op,node.left,self)
		elif node isa AST.Return

			return AST.Return.new(self)
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
		AST.Block.wrap([self])

	def node
		self

	def scope__
		STACK.scope

	def up
		STACK.parent

	def util
		AST.Util

	def receiver
		self

	def addExpression expr


		var node = AST.ExpressionBlock.new([self])
		return node.addExpression(expr)

	def addComment comment

		@comment = comment
		self

	def indented a,b

		if b isa Array

			add(b[0])
			b = b[1]


		@indented = [a,b]
		@indentation ||= a and b ? AST.Indentation.new(a,b) : AST.INDENT
		self

	def prebreak term = '\n'

		console.log "prebreak!!!!"
		@prebreak = @prebreak or term
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
			@cache = nil # hmm, removing the cache WARN
		self


	def predeclare
		if @cache
			scope__.vars.swap(@cache:var,self)
		self


	def alias
		nil

	def warn text, opts = {}


		opts:message = text
		opts:loc ||= loc
		scope__.root.warn opts
		self

	def c o
		if @cache && @cache:cached
			@cache:lookups++
			if @cache:uses == @cache:lookups
				@cache:var.free




			return @cache:var.c

		STACK.push(self)
		forceExpression if o && o:expression

		if o and o:indent

			@indentation ||= AST.INDENT


		var out = js(STACK,o)

		var paren = shouldParenthesize
		
		if var indent = @indentation
			out = indent.wrap(out,o)

		if paren

			if out isa Array
				out = "({out})"
			else
				out = out.parenthesize

		if o and o:braces
			out = '{' + out + '}'




		STACK.pop(self)

		if @cache


			out = "{@cache:var.c}={out}" unless @cache:manual
			var par = STACK.current
			out = out.parenthesize if par isa AST.Access || par isa AST.Op # others?
			@cache:cached = yes

		if @temporary && @temporary:length
			@temporary.map do |temp| 

				temp.decache




		return out

class AST.Expression < AST.Node

class AST.ValueNode < AST.Node
	prop value

	def initialize value
		@value = load(value)

	def load value
		value

	def js
		value.c

	def visit
		@value.traverse if @value && @value:traverse
		self

	def region
		@value:_region

class AST.Statement < AST.ValueNode

	def isExpressable
		return no
		
	def statement
		return true


class AST.Meta < AST.ValueNode

class AST.Comment < AST.Meta

	def c o
		if o and o:expression or @value.match(/\n/) # multiline?
			"/*{value.c}*/"
		else
			"// {value.c}"


class AST.Terminator < AST.Meta

	def c
		return @value

		v # .split()


class AST.Newline < AST.Terminator

	def initialize v
		@value = v or '\n'

	def c
		@value
		


class AST.Index < AST.ValueNode

	def js
		@value.c

class AST.NewLines < AST.ValueNode

	def js
		@value

	def isExpressable
		yes

class AST.ListNode < AST.Node

	prop nodes

	def initialize list = [], options = {}
		@nodes = load(list)
		@options = options
	

	def list
		@nodes

	def compact
		@nodes = @nodes.compact
		self

	def load list
		list

	def concat other

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
		nodes.unshift(AST.BR) if br
		nodes.unshift(item)
		self


	def slice a, b
		self:constructor.new(@nodes.slice(a,b))

	def add item
		push(item)
		self

	def break br, pre = no



		br = AST.Terminator.new(br) if typeof br == 'string' # hmmm?
		pre ? unshift(br) : push(br)
		self

	def some cb
		nodes.some(cb)

	def every cb
		nodes.every(cb)

	def filter cb
		if cb:prototype isa AST.Node
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
		



	def last
		var i = @nodes:length
		while i
			i = i - 1
			var v = @nodes[i]
			return v unless v isa AST.Meta
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

		var express = delim != ';'
		var shouldDelim = no
		var nodes = nodes.compact
		var last = last
		var realLast = nodes[nodes:length - 1]


		var parts = nodes.map do |arg| 
			var out = arg.c(expression: express)








			if arg isa AST.Meta
				true


			else


				out = out + delim if !express or arg != last
			out

		return parts.join("")













		

class AST.ArgList < AST.ListNode

	def hasSplat
		list.some do |v| v isa AST.Splat

	def delimiter
		","
















class AST.AssignList < AST.ArgList	




	def concat other
		if @nodes:length == 0 and other isa AST.AssignList

			return other
		else
			super


		self




class AST.Block < AST.ListNode	
	
	prop head

	def self.wrap ary

		ary:length == 1 && ary[0] isa AST.Block ? ary[0] : AST.Block.new(ary)







	def visit


		if @prebreak # hmm

			console.log "PREBREAK IN AST.BLOCK SHOULD THROW"
			first and first.prebreak(@prebreak)
		super
		
	def push item, sep











		nodes.push(item)
		self

	def block
		self

	def loc
		if var opt = option(:ends)

			var a = opt[0].loc
			var b = opt[1].loc

			p "no loc for {opt[0]}" unless a
			p "no loc for {opt[1]}" unless b

			[a[0],b[1]]
		else
			[0,0]

	def initialize expr = []
		self.nodes = expr.flatten.compact or []



	def unwrap
		var ary = []
		for node,i in nodes
			if node isa AST.Block

				ary:push.apply(ary,node.unwrap)
			else
				ary.push(node)
		return ary



	def compile o = {}
		var root = AST.Root.new(self,o)
		root.compile(o)


	def analyze o = {}

		self

	def js o, opts
		var l = nodes:length

		var filter = (|n| n != null && n != undefined && n != AST.EMPTY)
		var ast = nodes.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		var express = isExpression or o.isExpression or (option(:express) and isExpressable)
		return null if ast:length == 0



		if express
			return super(o,delim: ',', nodes: ast)




		var compile = do |node,i|
			var out = node ? node.c : ""
			return null if out == ""


			if out isa Array

				out = out.flatten.compact.filter(filter).join(";\n")

			var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/) # out[out:length - 1] == ";"

			out += ";" unless hasSemiColon or node isa AST.Meta
			




			return out

		ast = ast.map(compile)


		if @head
			var prefix = []
			@head.forEach do |item|
				var out = compile(item)
				prefix.push(out + '\n') if out

			ast = prefix.concat(ast)



		ast = ast.compact.filter(filter).join("") # .replace(/[\s\n]+$/,'')  # hmm really?




	def defers original, replacement
		var idx = nodes.indexOf(original)
		nodes[idx] = replacement if idx >= 0

		replacement.@prebreak ||= original.@prebreak # hacky
		var rest = nodes.splice(idx + 1)
		return rest

	def consume node
		if node isa AST.TagTree # special case?!?


			nodes = nodes.map(|child| child.consume(node))

			nodes = [AST.Arr.new(nodes)] if nodes:length > 1
			

			return self


		if var before = last
			var after = before.consume(node)
			if after != before
				

				replace(before,after)

		return self
		
	def isExpressable
		return no unless nodes.every(|v| v.isExpressable )
		return yes

	def isExpression
		option(:express) || super.isExpression


class AST.VarBlock < AST.ListNode





	def addExpression expr


		if expr isa AST.Assign
			addExpression(expr.left) # make sure this is a valid thing?



			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)

		elif expr isa AST.VarOrAccess

			push(AST.VarReference.new(expr.value))

		elif expr isa AST.Splat && expr.node isa AST.VarOrAccess

			expr.value = AST.VarReference.new(expr.node.value)
			push(expr)
		else
			throw "VarBlock does not allow non-variable expressions"
		self

	def isExpressable


		no

	def js o
		var code = nodes.map do |node| node.c
		code = code.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		return "var {code.join(",")}"

	def consume node



		return self


class AST.Parens < AST.ValueNode

		
	def js o
		var par = up


		if par isa AST.Block
			@noparen = yes unless o.isExpression
			return value.c(expression: o.isExpression)
		else
			value.c(expression: yes)









	def shouldParenthesize


		return no if @noparen #  or par isa AST.ArgList
		return yes

	def prebreak br
		super(br)

		@value.prebreak(br) if @value
		self

	def isExpressable
		value.isExpressable

	def consume node
		value.consume(node)




class AST.ExpressionBlock < AST.ListNode

	def visit

		map(|item| item.traverse)
		self
		
	def c
		map(|item| item.c).join(",")




	def consume node
		value.consume(node)

	def addExpression expr



		if expr.node isa AST.Assign

			push(expr.left)


			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)
		else
			push(expr)
		self


		
		

def AST.parse str, opts = {}
	var indent = str.match(/\t+/)[0]
	AST.Imba.parse(str,opts)

def AST.inline str, opts = {}
	AST.parse(str,opts).body

def AST.node typ, pars
	if typ == 'call'
		if pars[0].c == 'return'
			pars[0] = 'tata'	
		AST.Call.new(pars[0],pars[1],pars[2])


def AST.escapeComments str
	return '' unless str
	return str




class AST.Indentation

	prop open
	prop close

	def initialize a,b
		@open = a or 1
		@close = b or 1
		self


	def wrap str, o
		var pre = @open:pre
		var post = @open:post
		var esc = AST:escapeComments


		str = esc(post).replace(/^\n/,'') + str
		str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n")

		str = esc(pre) + '\n' + str

		str = str + '\n' unless str[str:length - 1] == '\n'



		return str
		
AST.INDENT = AST.Indentation.new

class AST.Stack

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

		self

	def pop node
		@nodes.pop(node)
		self

	def parent
		@nodes[@nodes:length - 2]

	def current
		@nodes[@nodes:length - 1]

	def up test
		test ||= do |v| !(v isa AST.VarOrAccess)

		if test:prototype isa AST.Node
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

		var scopes = []
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]
			scopes.push(node.@scope) if node.@scope
			i -= 1
		return scopes

	def method
		up(AST.MethodDeclaration)

	def isExpression
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]

			if node isa AST.Code or node isa AST.Loop
				return false
			if node.isExpression
				return true

			i -= 1
		return false

	def toString
		"Stack({@nodes.join(" -> ")})"

	def scoping
		@nodes.filter(|n| n.@scope ).map(|n| n.@scope )


STACK = AST.Stack.new

class AST.Node

	prop o
	prop options
	prop traversed
	prop statement

	def safechain
		no

	def dom
		var name = "ast_" + self:constructor:name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase

		if Imba.TAGS[name]
			var node = Imba.tag(name)
			node.bind(self).build
			return node
		else
			return "[{name}]"

	def p


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


	def consume node
		if node isa AST.PushAssign
			return AST.PushAssign.new(node.op,node.left,self)

		if node isa AST.Assign


			return OP(node.op,node.left,self)
		elif node isa AST.Op
			return OP(node.op,node.left,self)
		elif node isa AST.Return

			return AST.Return.new(self)
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
		AST.Block.wrap([self])

	def node
		self

	def scope__
		STACK.scope

	def up
		STACK.parent

	def util
		AST.Util

	def receiver
		self

	def addExpression expr


		var node = AST.ExpressionBlock.new([self])
		return node.addExpression(expr)

	def addComment comment

		@comment = comment
		self

	def indented a,b

		if b isa Array

			add(b[0])
			b = b[1]


		@indented = [a,b]
		@indentation ||= a and b ? AST.Indentation.new(a,b) : AST.INDENT
		self

	def prebreak term = '\n'

		console.log "prebreak!!!!"
		@prebreak = @prebreak or term
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
			@cache = nil # hmm, removing the cache WARN
		self


	def predeclare
		if @cache
			scope__.vars.swap(@cache:var,self)
		self


	def alias
		nil

	def warn text, opts = {}


		opts:message = text
		opts:loc ||= loc
		scope__.root.warn opts
		self

	def c o
		if @cache && @cache:cached
			@cache:lookups++
			if @cache:uses == @cache:lookups
				@cache:var.free




			return @cache:var.c

		STACK.push(self)
		forceExpression if o && o:expression

		if o and o:indent

			@indentation ||= AST.INDENT


		var out = js(STACK,o)

		var paren = shouldParenthesize
		
		if var indent = @indentation
			out = indent.wrap(out,o)

		if paren

			if out isa Array
				out = "({out})"
			else
				out = out.parenthesize

		if o and o:braces
			out = '{' + out + '}'




		STACK.pop(self)

		if @cache


			out = "{@cache:var.c}={out}" unless @cache:manual
			var par = STACK.current
			out = out.parenthesize if par isa AST.Access || par isa AST.Op # others?
			@cache:cached = yes

		if @temporary && @temporary:length
			@temporary.map do |temp| 

				temp.decache




		return out

class AST.Expression < AST.Node

class AST.ValueNode < AST.Node
	prop value

	def initialize value
		@value = load(value)

	def load value
		value

	def js
		value.c

	def visit
		@value.traverse if @value && @value:traverse
		self

	def region
		@value:_region

class AST.Statement < AST.ValueNode

	def isExpressable
		return no
		
	def statement
		return true


class AST.Meta < AST.ValueNode

class AST.Comment < AST.Meta

	def c o
		if o and o:expression or @value.match(/\n/) # multiline?
			"/*{value.c}*/"
		else
			"// {value.c}"


class AST.Terminator < AST.Meta

	def c
		return @value

		v # .split()


class AST.Newline < AST.Terminator

	def initialize v
		@value = v or '\n'

	def c
		@value
		


class AST.Index < AST.ValueNode

	def js
		@value.c

class AST.NewLines < AST.ValueNode

	def js
		@value

	def isExpressable
		yes

class AST.ListNode < AST.Node

	prop nodes

	def initialize list = [], options = {}
		@nodes = load(list)
		@options = options
	

	def list
		@nodes

	def compact
		@nodes = @nodes.compact
		self

	def load list
		list

	def concat other

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
		nodes.unshift(AST.BR) if br
		nodes.unshift(item)
		self


	def slice a, b
		self:constructor.new(@nodes.slice(a,b))

	def add item
		push(item)
		self

	def break br, pre = no



		br = AST.Terminator.new(br) if typeof br == 'string' # hmmm?
		pre ? unshift(br) : push(br)
		self

	def some cb
		nodes.some(cb)

	def every cb
		nodes.every(cb)

	def filter cb
		if cb:prototype isa AST.Node
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
		



	def last
		var i = @nodes:length
		while i
			i = i - 1
			var v = @nodes[i]
			return v unless v isa AST.Meta
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

		var express = delim != ';'
		var shouldDelim = no
		var nodes = nodes.compact
		var last = last
		var realLast = nodes[nodes:length - 1]


		var parts = nodes.map do |arg| 
			var out = arg.c(expression: express)








			if arg isa AST.Meta
				true


			else


				out = out + delim if !express or arg != last
			out

		return parts.join("")













		

class AST.ArgList < AST.ListNode

	def hasSplat
		list.some do |v| v isa AST.Splat

	def delimiter
		","
















class AST.AssignList < AST.ArgList	




	def concat other
		if @nodes:length == 0 and other isa AST.AssignList

			return other
		else
			super


		self




class AST.Block < AST.ListNode	
	
	prop head

	def self.wrap ary

		ary:length == 1 && ary[0] isa AST.Block ? ary[0] : AST.Block.new(ary)







	def visit


		if @prebreak # hmm

			console.log "PREBREAK IN AST.BLOCK SHOULD THROW"
			first and first.prebreak(@prebreak)
		super
		
	def push item, sep











		nodes.push(item)
		self

	def block
		self

	def loc
		if var opt = option(:ends)

			var a = opt[0].loc
			var b = opt[1].loc

			p "no loc for {opt[0]}" unless a
			p "no loc for {opt[1]}" unless b

			[a[0],b[1]]
		else
			[0,0]

	def initialize expr = []
		self.nodes = expr.flatten.compact or []



	def unwrap
		var ary = []
		for node,i in nodes
			if node isa AST.Block

				ary:push.apply(ary,node.unwrap)
			else
				ary.push(node)
		return ary



	def compile o = {}
		var root = AST.Root.new(self,o)
		root.compile(o)


	def analyze o = {}

		self

	def js o, opts
		var l = nodes:length

		var filter = (|n| n != null && n != undefined && n != AST.EMPTY)
		var ast = nodes.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		var express = isExpression or o.isExpression or (option(:express) and isExpressable)
		return null if ast:length == 0



		if express
			return super(o,delim: ',', nodes: ast)




		var compile = do |node,i|
			var out = node ? node.c : ""
			return null if out == ""


			if out isa Array

				out = out.flatten.compact.filter(filter).join(";\n")

			var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/) # out[out:length - 1] == ";"

			out += ";" unless hasSemiColon or node isa AST.Meta
			




			return out

		ast = ast.map(compile)


		if @head
			var prefix = []
			@head.forEach do |item|
				var out = compile(item)
				prefix.push(out + '\n') if out

			ast = prefix.concat(ast)



		ast = ast.compact.filter(filter).join("") # .replace(/[\s\n]+$/,'')  # hmm really?




	def defers original, replacement
		var idx = nodes.indexOf(original)
		nodes[idx] = replacement if idx >= 0

		replacement.@prebreak ||= original.@prebreak # hacky
		var rest = nodes.splice(idx + 1)
		return rest

	def consume node
		if node isa AST.TagTree # special case?!?


			nodes = nodes.map(|child| child.consume(node))

			nodes = [AST.Arr.new(nodes)] if nodes:length > 1
			

			return self


		if var before = last
			var after = before.consume(node)
			if after != before
				

				replace(before,after)

		return self
		
	def isExpressable
		return no unless nodes.every(|v| v.isExpressable )
		return yes

	def isExpression
		option(:express) || super.isExpression


class AST.VarBlock < AST.ListNode





	def addExpression expr


		if expr isa AST.Assign
			addExpression(expr.left) # make sure this is a valid thing?



			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)

		elif expr isa AST.VarOrAccess

			push(AST.VarReference.new(expr.value))

		elif expr isa AST.Splat && expr.node isa AST.VarOrAccess

			expr.value = AST.VarReference.new(expr.node.value)
			push(expr)
		else
			throw "VarBlock does not allow non-variable expressions"
		self

	def isExpressable


		no

	def js o
		var code = nodes.map do |node| node.c
		code = code.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		return "var {code.join(",")}"

	def consume node



		return self


class AST.Parens < AST.ValueNode

		
	def js o
		var par = up


		if par isa AST.Block
			@noparen = yes unless o.isExpression
			return value.c(expression: o.isExpression)
		else
			value.c(expression: yes)









	def shouldParenthesize


		return no if @noparen #  or par isa AST.ArgList
		return yes

	def prebreak br
		super(br)

		@value.prebreak(br) if @value
		self

	def isExpressable
		value.isExpressable

	def consume node
		value.consume(node)




class AST.ExpressionBlock < AST.ListNode

	def visit

		map(|item| item.traverse)
		self
		
	def c
		map(|item| item.c).join(",")




	def consume node
		value.consume(node)

	def addExpression expr



		if expr.node isa AST.Assign

			push(expr.left)


			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)
		else
			push(expr)
		self


		
		

def AST.parse str, opts = {}
	var indent = str.match(/\t+/)[0]
	AST.Imba.parse(str,opts)

def AST.inline str, opts = {}
	AST.parse(str,opts).body

def AST.node typ, pars
	if typ == 'call'
		if pars[0].c == 'return'
			pars[0] = 'tata'	
		AST.Call.new(pars[0],pars[1],pars[2])


def AST.escapeComments str
	return '' unless str
	return str




class AST.Indentation

	prop open
	prop close

	def initialize a,b
		@open = a or 1
		@close = b or 1
		self


	def wrap str, o
		var pre = @open:pre
		var post = @open:post
		var esc = AST:escapeComments


		str = esc(post).replace(/^\n/,'') + str
		str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n")

		str = esc(pre) + '\n' + str

		str = str + '\n' unless str[str:length - 1] == '\n'



		return str
		
AST.INDENT = AST.Indentation.new

class AST.Stack

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

		self

	def pop node
		@nodes.pop(node)
		self

	def parent
		@nodes[@nodes:length - 2]

	def current
		@nodes[@nodes:length - 1]

	def up test
		test ||= do |v| !(v isa AST.VarOrAccess)

		if test:prototype isa AST.Node
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

		var scopes = []
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]
			scopes.push(node.@scope) if node.@scope
			i -= 1
		return scopes

	def method
		up(AST.MethodDeclaration)

	def isExpression
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]

			if node isa AST.Code or node isa AST.Loop
				return false
			if node.isExpression
				return true

			i -= 1
		return false

	def toString
		"Stack({@nodes.join(" -> ")})"

	def scoping
		@nodes.filter(|n| n.@scope ).map(|n| n.@scope )


STACK = AST.Stack.new

class AST.Node

	prop o
	prop options
	prop traversed
	prop statement

	def safechain
		no

	def dom
		var name = "ast_" + self:constructor:name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase

		if Imba.TAGS[name]
			var node = Imba.tag(name)
			node.bind(self).build
			return node
		else
			return "[{name}]"

	def p


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


	def consume node
		if node isa AST.PushAssign
			return AST.PushAssign.new(node.op,node.left,self)

		if node isa AST.Assign


			return OP(node.op,node.left,self)
		elif node isa AST.Op
			return OP(node.op,node.left,self)
		elif node isa AST.Return

			return AST.Return.new(self)
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
		AST.Block.wrap([self])

	def node
		self

	def scope__
		STACK.scope

	def up
		STACK.parent

	def util
		AST.Util

	def receiver
		self

	def addExpression expr


		var node = AST.ExpressionBlock.new([self])
		return node.addExpression(expr)

	def addComment comment

		@comment = comment
		self

	def indented a,b

		if b isa Array

			add(b[0])
			b = b[1]


		@indented = [a,b]
		@indentation ||= a and b ? AST.Indentation.new(a,b) : AST.INDENT
		self

	def prebreak term = '\n'

		console.log "prebreak!!!!"
		@prebreak = @prebreak or term
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
			@cache = nil # hmm, removing the cache WARN
		self


	def predeclare
		if @cache
			scope__.vars.swap(@cache:var,self)
		self


	def alias
		nil

	def warn text, opts = {}


		opts:message = text
		opts:loc ||= loc
		scope__.root.warn opts
		self

	def c o
		if @cache && @cache:cached
			@cache:lookups++
			if @cache:uses == @cache:lookups
				@cache:var.free




			return @cache:var.c

		STACK.push(self)
		forceExpression if o && o:expression

		if o and o:indent

			@indentation ||= AST.INDENT


		var out = js(STACK,o)

		var paren = shouldParenthesize
		
		if var indent = @indentation
			out = indent.wrap(out,o)

		if paren

			if out isa Array
				out = "({out})"
			else
				out = out.parenthesize

		if o and o:braces
			out = '{' + out + '}'




		STACK.pop(self)

		if @cache


			out = "{@cache:var.c}={out}" unless @cache:manual
			var par = STACK.current
			out = out.parenthesize if par isa AST.Access || par isa AST.Op # others?
			@cache:cached = yes

		if @temporary && @temporary:length
			@temporary.map do |temp| 

				temp.decache




		return out

class AST.Expression < AST.Node

class AST.ValueNode < AST.Node
	prop value

	def initialize value
		@value = load(value)

	def load value
		value

	def js
		value.c

	def visit
		@value.traverse if @value && @value:traverse
		self

	def region
		@value:_region

class AST.Statement < AST.ValueNode

	def isExpressable
		return no
		
	def statement
		return true


class AST.Meta < AST.ValueNode

class AST.Comment < AST.Meta

	def c o
		if o and o:expression or @value.match(/\n/) # multiline?
			"/*{value.c}*/"
		else
			"// {value.c}"


class AST.Terminator < AST.Meta

	def c
		return @value

		v # .split()


class AST.Newline < AST.Terminator

	def initialize v
		@value = v or '\n'

	def c
		@value
		


class AST.Index < AST.ValueNode

	def js
		@value.c

class AST.NewLines < AST.ValueNode

	def js
		@value

	def isExpressable
		yes

class AST.ListNode < AST.Node

	prop nodes

	def initialize list = [], options = {}
		@nodes = load(list)
		@options = options
	

	def list
		@nodes

	def compact
		@nodes = @nodes.compact
		self

	def load list
		list

	def concat other

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
		nodes.unshift(AST.BR) if br
		nodes.unshift(item)
		self


	def slice a, b
		self:constructor.new(@nodes.slice(a,b))

	def add item
		push(item)
		self

	def break br, pre = no



		br = AST.Terminator.new(br) if typeof br == 'string' # hmmm?
		pre ? unshift(br) : push(br)
		self

	def some cb
		nodes.some(cb)

	def every cb
		nodes.every(cb)

	def filter cb
		if cb:prototype isa AST.Node
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
		



	def last
		var i = @nodes:length
		while i
			i = i - 1
			var v = @nodes[i]
			return v unless v isa AST.Meta
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

		var express = delim != ';'
		var shouldDelim = no
		var nodes = nodes.compact
		var last = last
		var realLast = nodes[nodes:length - 1]


		var parts = nodes.map do |arg| 
			var out = arg.c(expression: express)








			if arg isa AST.Meta
				true


			else


				out = out + delim if !express or arg != last
			out

		return parts.join("")













		

class AST.ArgList < AST.ListNode

	def hasSplat
		list.some do |v| v isa AST.Splat

	def delimiter
		","
















class AST.AssignList < AST.ArgList	




	def concat other
		if @nodes:length == 0 and other isa AST.AssignList

			return other
		else
			super


		self




class AST.Block < AST.ListNode	
	
	prop head

	def self.wrap ary

		ary:length == 1 && ary[0] isa AST.Block ? ary[0] : AST.Block.new(ary)







	def visit


		if @prebreak # hmm

			console.log "PREBREAK IN AST.BLOCK SHOULD THROW"
			first and first.prebreak(@prebreak)
		super
		
	def push item, sep











		nodes.push(item)
		self

	def block
		self

	def loc
		if var opt = option(:ends)

			var a = opt[0].loc
			var b = opt[1].loc

			p "no loc for {opt[0]}" unless a
			p "no loc for {opt[1]}" unless b

			[a[0],b[1]]
		else
			[0,0]

	def initialize expr = []
		self.nodes = expr.flatten.compact or []



	def unwrap
		var ary = []
		for node,i in nodes
			if node isa AST.Block

				ary:push.apply(ary,node.unwrap)
			else
				ary.push(node)
		return ary



	def compile o = {}
		var root = AST.Root.new(self,o)
		root.compile(o)


	def analyze o = {}

		self

	def js o, opts
		var l = nodes:length

		var filter = (|n| n != null && n != undefined && n != AST.EMPTY)
		var ast = nodes.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		var express = isExpression or o.isExpression or (option(:express) and isExpressable)
		return null if ast:length == 0



		if express
			return super(o,delim: ',', nodes: ast)




		var compile = do |node,i|
			var out = node ? node.c : ""
			return null if out == ""


			if out isa Array

				out = out.flatten.compact.filter(filter).join(";\n")

			var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/) # out[out:length - 1] == ";"

			out += ";" unless hasSemiColon or node isa AST.Meta
			




			return out

		ast = ast.map(compile)


		if @head
			var prefix = []
			@head.forEach do |item|
				var out = compile(item)
				prefix.push(out + '\n') if out

			ast = prefix.concat(ast)



		ast = ast.compact.filter(filter).join("") # .replace(/[\s\n]+$/,'')  # hmm really?




	def defers original, replacement
		var idx = nodes.indexOf(original)
		nodes[idx] = replacement if idx >= 0

		replacement.@prebreak ||= original.@prebreak # hacky
		var rest = nodes.splice(idx + 1)
		return rest

	def consume node
		if node isa AST.TagTree # special case?!?


			nodes = nodes.map(|child| child.consume(node))

			nodes = [AST.Arr.new(nodes)] if nodes:length > 1
			

			return self


		if var before = last
			var after = before.consume(node)
			if after != before
				

				replace(before,after)

		return self
		
	def isExpressable
		return no unless nodes.every(|v| v.isExpressable )
		return yes

	def isExpression
		option(:express) || super.isExpression


class AST.VarBlock < AST.ListNode





	def addExpression expr


		if expr isa AST.Assign
			addExpression(expr.left) # make sure this is a valid thing?



			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)

		elif expr isa AST.VarOrAccess

			push(AST.VarReference.new(expr.value))

		elif expr isa AST.Splat && expr.node isa AST.VarOrAccess

			expr.value = AST.VarReference.new(expr.node.value)
			push(expr)
		else
			throw "VarBlock does not allow non-variable expressions"
		self

	def isExpressable


		no

	def js o
		var code = nodes.map do |node| node.c
		code = code.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		return "var {code.join(",")}"

	def consume node



		return self


class AST.Parens < AST.ValueNode

		
	def js o
		var par = up


		if par isa AST.Block
			@noparen = yes unless o.isExpression
			return value.c(expression: o.isExpression)
		else
			value.c(expression: yes)









	def shouldParenthesize


		return no if @noparen #  or par isa AST.ArgList
		return yes

	def prebreak br
		super(br)

		@value.prebreak(br) if @value
		self

	def isExpressable
		value.isExpressable

	def consume node
		value.consume(node)




class AST.ExpressionBlock < AST.ListNode

	def visit

		map(|item| item.traverse)
		self
		
	def c
		map(|item| item.c).join(",")




	def consume node
		value.consume(node)

	def addExpression expr



		if expr.node isa AST.Assign

			push(expr.left)


			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)
		else
			push(expr)
		self


		
		

def AST.parse str, opts = {}
	var indent = str.match(/\t+/)[0]
	AST.Imba.parse(str,opts)

def AST.inline str, opts = {}
	AST.parse(str,opts).body

def AST.node typ, pars
	if typ == 'call'
		if pars[0].c == 'return'
			pars[0] = 'tata'	
		AST.Call.new(pars[0],pars[1],pars[2])


def AST.escapeComments str
	return '' unless str
	return str




class AST.Indentation

	prop open
	prop close

	def initialize a,b
		@open = a or 1
		@close = b or 1
		self


	def wrap str, o
		var pre = @open:pre
		var post = @open:post
		var esc = AST:escapeComments


		str = esc(post).replace(/^\n/,'') + str
		str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n")

		str = esc(pre) + '\n' + str

		str = str + '\n' unless str[str:length - 1] == '\n'



		return str
		
AST.INDENT = AST.Indentation.new

class AST.Stack

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

		self

	def pop node
		@nodes.pop(node)
		self

	def parent
		@nodes[@nodes:length - 2]

	def current
		@nodes[@nodes:length - 1]

	def up test
		test ||= do |v| !(v isa AST.VarOrAccess)

		if test:prototype isa AST.Node
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

		var scopes = []
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]
			scopes.push(node.@scope) if node.@scope
			i -= 1
		return scopes

	def method
		up(AST.MethodDeclaration)

	def isExpression
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]

			if node isa AST.Code or node isa AST.Loop
				return false
			if node.isExpression
				return true

			i -= 1
		return false

	def toString
		"Stack({@nodes.join(" -> ")})"

	def scoping
		@nodes.filter(|n| n.@scope ).map(|n| n.@scope )


STACK = AST.Stack.new

class AST.Node

	prop o
	prop options
	prop traversed
	prop statement

	def safechain
		no

	def dom
		var name = "ast_" + self:constructor:name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase

		if Imba.TAGS[name]
			var node = Imba.tag(name)
			node.bind(self).build
			return node
		else
			return "[{name}]"

	def p


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


	def consume node
		if node isa AST.PushAssign
			return AST.PushAssign.new(node.op,node.left,self)

		if node isa AST.Assign


			return OP(node.op,node.left,self)
		elif node isa AST.Op
			return OP(node.op,node.left,self)
		elif node isa AST.Return

			return AST.Return.new(self)
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
		AST.Block.wrap([self])

	def node
		self

	def scope__
		STACK.scope

	def up
		STACK.parent

	def util
		AST.Util

	def receiver
		self

	def addExpression expr


		var node = AST.ExpressionBlock.new([self])
		return node.addExpression(expr)

	def addComment comment

		@comment = comment
		self

	def indented a,b

		if b isa Array

			add(b[0])
			b = b[1]


		@indented = [a,b]
		@indentation ||= a and b ? AST.Indentation.new(a,b) : AST.INDENT
		self

	def prebreak term = '\n'

		console.log "prebreak!!!!"
		@prebreak = @prebreak or term
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
			@cache = nil # hmm, removing the cache WARN
		self


	def predeclare
		if @cache
			scope__.vars.swap(@cache:var,self)
		self


	def alias
		nil

	def warn text, opts = {}


		opts:message = text
		opts:loc ||= loc
		scope__.root.warn opts
		self

	def c o
		if @cache && @cache:cached
			@cache:lookups++
			if @cache:uses == @cache:lookups
				@cache:var.free




			return @cache:var.c

		STACK.push(self)
		forceExpression if o && o:expression

		if o and o:indent

			@indentation ||= AST.INDENT


		var out = js(STACK,o)

		var paren = shouldParenthesize
		
		if var indent = @indentation
			out = indent.wrap(out,o)

		if paren

			if out isa Array
				out = "({out})"
			else
				out = out.parenthesize

		if o and o:braces
			out = '{' + out + '}'




		STACK.pop(self)

		if @cache


			out = "{@cache:var.c}={out}" unless @cache:manual
			var par = STACK.current
			out = out.parenthesize if par isa AST.Access || par isa AST.Op # others?
			@cache:cached = yes

		if @temporary && @temporary:length
			@temporary.map do |temp| 

				temp.decache




		return out

class AST.Expression < AST.Node

class AST.ValueNode < AST.Node
	prop value

	def initialize value
		@value = load(value)

	def load value
		value

	def js
		value.c

	def visit
		@value.traverse if @value && @value:traverse
		self

	def region
		@value:_region

class AST.Statement < AST.ValueNode

	def isExpressable
		return no
		
	def statement
		return true


class AST.Meta < AST.ValueNode

class AST.Comment < AST.Meta

	def c o
		if o and o:expression or @value.match(/\n/) # multiline?
			"/*{value.c}*/"
		else
			"// {value.c}"


class AST.Terminator < AST.Meta

	def c
		return @value

		v # .split()


class AST.Newline < AST.Terminator

	def initialize v
		@value = v or '\n'

	def c
		@value
		


class AST.Index < AST.ValueNode

	def js
		@value.c

class AST.NewLines < AST.ValueNode

	def js
		@value

	def isExpressable
		yes

class AST.ListNode < AST.Node

	prop nodes

	def initialize list = [], options = {}
		@nodes = load(list)
		@options = options
	

	def list
		@nodes

	def compact
		@nodes = @nodes.compact
		self

	def load list
		list

	def concat other

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
		nodes.unshift(AST.BR) if br
		nodes.unshift(item)
		self


	def slice a, b
		self:constructor.new(@nodes.slice(a,b))

	def add item
		push(item)
		self

	def break br, pre = no



		br = AST.Terminator.new(br) if typeof br == 'string' # hmmm?
		pre ? unshift(br) : push(br)
		self

	def some cb
		nodes.some(cb)

	def every cb
		nodes.every(cb)

	def filter cb
		if cb:prototype isa AST.Node
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
		



	def last
		var i = @nodes:length
		while i
			i = i - 1
			var v = @nodes[i]
			return v unless v isa AST.Meta
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

		var express = delim != ';'
		var shouldDelim = no
		var nodes = nodes.compact
		var last = last
		var realLast = nodes[nodes:length - 1]


		var parts = nodes.map do |arg| 
			var out = arg.c(expression: express)








			if arg isa AST.Meta
				true


			else


				out = out + delim if !express or arg != last
			out

		return parts.join("")













		

class AST.ArgList < AST.ListNode

	def hasSplat
		list.some do |v| v isa AST.Splat

	def delimiter
		","
















class AST.AssignList < AST.ArgList	




	def concat other
		if @nodes:length == 0 and other isa AST.AssignList

			return other
		else
			super


		self




class AST.Block < AST.ListNode	
	
	prop head

	def self.wrap ary

		ary:length == 1 && ary[0] isa AST.Block ? ary[0] : AST.Block.new(ary)







	def visit


		if @prebreak # hmm

			console.log "PREBREAK IN AST.BLOCK SHOULD THROW"
			first and first.prebreak(@prebreak)
		super
		
	def push item, sep











		nodes.push(item)
		self

	def block
		self

	def loc
		if var opt = option(:ends)

			var a = opt[0].loc
			var b = opt[1].loc

			p "no loc for {opt[0]}" unless a
			p "no loc for {opt[1]}" unless b

			[a[0],b[1]]
		else
			[0,0]

	def initialize expr = []
		self.nodes = expr.flatten.compact or []



	def unwrap
		var ary = []
		for node,i in nodes
			if node isa AST.Block

				ary:push.apply(ary,node.unwrap)
			else
				ary.push(node)
		return ary



	def compile o = {}
		var root = AST.Root.new(self,o)
		root.compile(o)


	def analyze o = {}

		self

	def js o, opts
		var l = nodes:length

		var filter = (|n| n != null && n != undefined && n != AST.EMPTY)
		var ast = nodes.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		var express = isExpression or o.isExpression or (option(:express) and isExpressable)
		return null if ast:length == 0



		if express
			return super(o,delim: ',', nodes: ast)




		var compile = do |node,i|
			var out = node ? node.c : ""
			return null if out == ""


			if out isa Array

				out = out.flatten.compact.filter(filter).join(";\n")

			var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/) # out[out:length - 1] == ";"

			out += ";" unless hasSemiColon or node isa AST.Meta
			




			return out

		ast = ast.map(compile)


		if @head
			var prefix = []
			@head.forEach do |item|
				var out = compile(item)
				prefix.push(out + '\n') if out

			ast = prefix.concat(ast)



		ast = ast.compact.filter(filter).join("") # .replace(/[\s\n]+$/,'')  # hmm really?




	def defers original, replacement
		var idx = nodes.indexOf(original)
		nodes[idx] = replacement if idx >= 0

		replacement.@prebreak ||= original.@prebreak # hacky
		var rest = nodes.splice(idx + 1)
		return rest

	def consume node
		if node isa AST.TagTree # special case?!?


			nodes = nodes.map(|child| child.consume(node))

			nodes = [AST.Arr.new(nodes)] if nodes:length > 1
			

			return self


		if var before = last
			var after = before.consume(node)
			if after != before
				

				replace(before,after)

		return self
		
	def isExpressable
		return no unless nodes.every(|v| v.isExpressable )
		return yes

	def isExpression
		option(:express) || super.isExpression


class AST.VarBlock < AST.ListNode





	def addExpression expr


		if expr isa AST.Assign
			addExpression(expr.left) # make sure this is a valid thing?



			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)

		elif expr isa AST.VarOrAccess

			push(AST.VarReference.new(expr.value))

		elif expr isa AST.Splat && expr.node isa AST.VarOrAccess

			expr.value = AST.VarReference.new(expr.node.value)
			push(expr)
		else
			throw "VarBlock does not allow non-variable expressions"
		self

	def isExpressable


		no

	def js o
		var code = nodes.map do |node| node.c
		code = code.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		return "var {code.join(",")}"

	def consume node



		return self


class AST.Parens < AST.ValueNode

		
	def js o
		var par = up


		if par isa AST.Block
			@noparen = yes unless o.isExpression
			return value.c(expression: o.isExpression)
		else
			value.c(expression: yes)









	def shouldParenthesize


		return no if @noparen #  or par isa AST.ArgList
		return yes

	def prebreak br
		super(br)

		@value.prebreak(br) if @value
		self

	def isExpressable
		value.isExpressable

	def consume node
		value.consume(node)




class AST.ExpressionBlock < AST.ListNode

	def visit

		map(|item| item.traverse)
		self
		
	def c
		map(|item| item.c).join(",")




	def consume node
		value.consume(node)

	def addExpression expr



		if expr.node isa AST.Assign

			push(expr.left)


			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)
		else
			push(expr)
		self


		
		

def AST.parse str, opts = {}
	var indent = str.match(/\t+/)[0]
	AST.Imba.parse(str,opts)

def AST.inline str, opts = {}
	AST.parse(str,opts).body

def AST.node typ, pars
	if typ == 'call'
		if pars[0].c == 'return'
			pars[0] = 'tata'	
		AST.Call.new(pars[0],pars[1],pars[2])


def AST.escapeComments str
	return '' unless str
	return str




class AST.Indentation

	prop open
	prop close

	def initialize a,b
		@open = a or 1
		@close = b or 1
		self


	def wrap str, o
		var pre = @open:pre
		var post = @open:post
		var esc = AST:escapeComments


		str = esc(post).replace(/^\n/,'') + str
		str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n")

		str = esc(pre) + '\n' + str

		str = str + '\n' unless str[str:length - 1] == '\n'



		return str
		
AST.INDENT = AST.Indentation.new

class AST.Stack

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

		self

	def pop node
		@nodes.pop(node)
		self

	def parent
		@nodes[@nodes:length - 2]

	def current
		@nodes[@nodes:length - 1]

	def up test
		test ||= do |v| !(v isa AST.VarOrAccess)

		if test:prototype isa AST.Node
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

		var scopes = []
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]
			scopes.push(node.@scope) if node.@scope
			i -= 1
		return scopes

	def method
		up(AST.MethodDeclaration)

	def isExpression
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]

			if node isa AST.Code or node isa AST.Loop
				return false
			if node.isExpression
				return true

			i -= 1
		return false

	def toString
		"Stack({@nodes.join(" -> ")})"

	def scoping
		@nodes.filter(|n| n.@scope ).map(|n| n.@scope )


STACK = AST.Stack.new

class AST.Node

	prop o
	prop options
	prop traversed
	prop statement

	def safechain
		no

	def dom
		var name = "ast_" + self:constructor:name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase

		if Imba.TAGS[name]
			var node = Imba.tag(name)
			node.bind(self).build
			return node
		else
			return "[{name}]"

	def p


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


	def consume node
		if node isa AST.PushAssign
			return AST.PushAssign.new(node.op,node.left,self)

		if node isa AST.Assign


			return OP(node.op,node.left,self)
		elif node isa AST.Op
			return OP(node.op,node.left,self)
		elif node isa AST.Return

			return AST.Return.new(self)
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
		AST.Block.wrap([self])

	def node
		self

	def scope__
		STACK.scope

	def up
		STACK.parent

	def util
		AST.Util

	def receiver
		self

	def addExpression expr


		var node = AST.ExpressionBlock.new([self])
		return node.addExpression(expr)

	def addComment comment

		@comment = comment
		self

	def indented a,b

		if b isa Array

			add(b[0])
			b = b[1]


		@indented = [a,b]
		@indentation ||= a and b ? AST.Indentation.new(a,b) : AST.INDENT
		self

	def prebreak term = '\n'

		console.log "prebreak!!!!"
		@prebreak = @prebreak or term
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
			@cache = nil # hmm, removing the cache WARN
		self


	def predeclare
		if @cache
			scope__.vars.swap(@cache:var,self)
		self


	def alias
		nil

	def warn text, opts = {}


		opts:message = text
		opts:loc ||= loc
		scope__.root.warn opts
		self

	def c o
		if @cache && @cache:cached
			@cache:lookups++
			if @cache:uses == @cache:lookups
				@cache:var.free




			return @cache:var.c

		STACK.push(self)
		forceExpression if o && o:expression

		if o and o:indent

			@indentation ||= AST.INDENT


		var out = js(STACK,o)

		var paren = shouldParenthesize
		
		if var indent = @indentation
			out = indent.wrap(out,o)

		if paren

			if out isa Array
				out = "({out})"
			else
				out = out.parenthesize

		if o and o:braces
			out = '{' + out + '}'




		STACK.pop(self)

		if @cache


			out = "{@cache:var.c}={out}" unless @cache:manual
			var par = STACK.current
			out = out.parenthesize if par isa AST.Access || par isa AST.Op # others?
			@cache:cached = yes

		if @temporary && @temporary:length
			@temporary.map do |temp| 

				temp.decache




		return out

class AST.Expression < AST.Node

class AST.ValueNode < AST.Node
	prop value

	def initialize value
		@value = load(value)

	def load value
		value

	def js
		value.c

	def visit
		@value.traverse if @value && @value:traverse
		self

	def region
		@value:_region

class AST.Statement < AST.ValueNode

	def isExpressable
		return no
		
	def statement
		return true


class AST.Meta < AST.ValueNode

class AST.Comment < AST.Meta

	def c o
		if o and o:expression or @value.match(/\n/) # multiline?
			"/*{value.c}*/"
		else
			"// {value.c}"


class AST.Terminator < AST.Meta

	def c
		return @value

		v # .split()


class AST.Newline < AST.Terminator

	def initialize v
		@value = v or '\n'

	def c
		@value
		


class AST.Index < AST.ValueNode

	def js
		@value.c

class AST.NewLines < AST.ValueNode

	def js
		@value

	def isExpressable
		yes

class AST.ListNode < AST.Node

	prop nodes

	def initialize list = [], options = {}
		@nodes = load(list)
		@options = options
	

	def list
		@nodes

	def compact
		@nodes = @nodes.compact
		self

	def load list
		list

	def concat other

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
		nodes.unshift(AST.BR) if br
		nodes.unshift(item)
		self


	def slice a, b
		self:constructor.new(@nodes.slice(a,b))

	def add item
		push(item)
		self

	def break br, pre = no



		br = AST.Terminator.new(br) if typeof br == 'string' # hmmm?
		pre ? unshift(br) : push(br)
		self

	def some cb
		nodes.some(cb)

	def every cb
		nodes.every(cb)

	def filter cb
		if cb:prototype isa AST.Node
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
		



	def last
		var i = @nodes:length
		while i
			i = i - 1
			var v = @nodes[i]
			return v unless v isa AST.Meta
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

		var express = delim != ';'
		var shouldDelim = no
		var nodes = nodes.compact
		var last = last
		var realLast = nodes[nodes:length - 1]


		var parts = nodes.map do |arg| 
			var out = arg.c(expression: express)








			if arg isa AST.Meta
				true


			else


				out = out + delim if !express or arg != last
			out

		return parts.join("")













		

class AST.ArgList < AST.ListNode

	def hasSplat
		list.some do |v| v isa AST.Splat

	def delimiter
		","
















class AST.AssignList < AST.ArgList	




	def concat other
		if @nodes:length == 0 and other isa AST.AssignList

			return other
		else
			super


		self




class AST.Block < AST.ListNode	
	
	prop head

	def self.wrap ary

		ary:length == 1 && ary[0] isa AST.Block ? ary[0] : AST.Block.new(ary)







	def visit


		if @prebreak # hmm

			console.log "PREBREAK IN AST.BLOCK SHOULD THROW"
			first and first.prebreak(@prebreak)
		super
		
	def push item, sep











		nodes.push(item)
		self

	def block
		self

	def loc
		if var opt = option(:ends)

			var a = opt[0].loc
			var b = opt[1].loc

			p "no loc for {opt[0]}" unless a
			p "no loc for {opt[1]}" unless b

			[a[0],b[1]]
		else
			[0,0]

	def initialize expr = []
		self.nodes = expr.flatten.compact or []



	def unwrap
		var ary = []
		for node,i in nodes
			if node isa AST.Block

				ary:push.apply(ary,node.unwrap)
			else
				ary.push(node)
		return ary



	def compile o = {}
		var root = AST.Root.new(self,o)
		root.compile(o)


	def analyze o = {}

		self

	def js o, opts
		var l = nodes:length

		var filter = (|n| n != null && n != undefined && n != AST.EMPTY)
		var ast = nodes.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		var express = isExpression or o.isExpression or (option(:express) and isExpressable)
		return null if ast:length == 0



		if express
			return super(o,delim: ',', nodes: ast)




		var compile = do |node,i|
			var out = node ? node.c : ""
			return null if out == ""


			if out isa Array

				out = out.flatten.compact.filter(filter).join(";\n")

			var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/) # out[out:length - 1] == ";"

			out += ";" unless hasSemiColon or node isa AST.Meta
			




			return out

		ast = ast.map(compile)


		if @head
			var prefix = []
			@head.forEach do |item|
				var out = compile(item)
				prefix.push(out + '\n') if out

			ast = prefix.concat(ast)



		ast = ast.compact.filter(filter).join("") # .replace(/[\s\n]+$/,'')  # hmm really?




	def defers original, replacement
		var idx = nodes.indexOf(original)
		nodes[idx] = replacement if idx >= 0

		replacement.@prebreak ||= original.@prebreak # hacky
		var rest = nodes.splice(idx + 1)
		return rest

	def consume node
		if node isa AST.TagTree # special case?!?


			nodes = nodes.map(|child| child.consume(node))

			nodes = [AST.Arr.new(nodes)] if nodes:length > 1
			

			return self


		if var before = last
			var after = before.consume(node)
			if after != before
				

				replace(before,after)

		return self
		
	def isExpressable
		return no unless nodes.every(|v| v.isExpressable )
		return yes

	def isExpression
		option(:express) || super.isExpression


class AST.VarBlock < AST.ListNode





	def addExpression expr


		if expr isa AST.Assign
			addExpression(expr.left) # make sure this is a valid thing?



			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)

		elif expr isa AST.VarOrAccess

			push(AST.VarReference.new(expr.value))

		elif expr isa AST.Splat && expr.node isa AST.VarOrAccess

			expr.value = AST.VarReference.new(expr.node.value)
			push(expr)
		else
			throw "VarBlock does not allow non-variable expressions"
		self

	def isExpressable


		no

	def js o
		var code = nodes.map do |node| node.c
		code = code.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		return "var {code.join(",")}"

	def consume node



		return self


class AST.Parens < AST.ValueNode

		
	def js o
		var par = up


		if par isa AST.Block
			@noparen = yes unless o.isExpression
			return value.c(expression: o.isExpression)
		else
			value.c(expression: yes)









	def shouldParenthesize


		return no if @noparen #  or par isa AST.ArgList
		return yes

	def prebreak br
		super(br)

		@value.prebreak(br) if @value
		self

	def isExpressable
		value.isExpressable

	def consume node
		value.consume(node)




class AST.ExpressionBlock < AST.ListNode

	def visit

		map(|item| item.traverse)
		self
		
	def c
		map(|item| item.c).join(",")




	def consume node
		value.consume(node)

	def addExpression expr



		if expr.node isa AST.Assign

			push(expr.left)


			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)
		else
			push(expr)
		self


		
		

def AST.parse str, opts = {}
	var indent = str.match(/\t+/)[0]
	AST.Imba.parse(str,opts)

def AST.inline str, opts = {}
	AST.parse(str,opts).body

def AST.node typ, pars
	if typ == 'call'
		if pars[0].c == 'return'
			pars[0] = 'tata'	
		AST.Call.new(pars[0],pars[1],pars[2])


def AST.escapeComments str
	return '' unless str
	return str




class AST.Indentation

	prop open
	prop close

	def initialize a,b
		@open = a or 1
		@close = b or 1
		self


	def wrap str, o
		var pre = @open:pre
		var post = @open:post
		var esc = AST:escapeComments


		str = esc(post).replace(/^\n/,'') + str
		str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n")

		str = esc(pre) + '\n' + str

		str = str + '\n' unless str[str:length - 1] == '\n'



		return str
		
AST.INDENT = AST.Indentation.new

class AST.Stack

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

		self

	def pop node
		@nodes.pop(node)
		self

	def parent
		@nodes[@nodes:length - 2]

	def current
		@nodes[@nodes:length - 1]

	def up test
		test ||= do |v| !(v isa AST.VarOrAccess)

		if test:prototype isa AST.Node
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

		var scopes = []
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]
			scopes.push(node.@scope) if node.@scope
			i -= 1
		return scopes

	def method
		up(AST.MethodDeclaration)

	def isExpression
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]

			if node isa AST.Code or node isa AST.Loop
				return false
			if node.isExpression
				return true

			i -= 1
		return false

	def toString
		"Stack({@nodes.join(" -> ")})"

	def scoping
		@nodes.filter(|n| n.@scope ).map(|n| n.@scope )


STACK = AST.Stack.new

class AST.Node

	prop o
	prop options
	prop traversed
	prop statement

	def safechain
		no

	def dom
		var name = "ast_" + self:constructor:name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase

		if Imba.TAGS[name]
			var node = Imba.tag(name)
			node.bind(self).build
			return node
		else
			return "[{name}]"

	def p


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


	def consume node
		if node isa AST.PushAssign
			return AST.PushAssign.new(node.op,node.left,self)

		if node isa AST.Assign


			return OP(node.op,node.left,self)
		elif node isa AST.Op
			return OP(node.op,node.left,self)
		elif node isa AST.Return

			return AST.Return.new(self)
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
		AST.Block.wrap([self])

	def node
		self

	def scope__
		STACK.scope

	def up
		STACK.parent

	def util
		AST.Util

	def receiver
		self

	def addExpression expr


		var node = AST.ExpressionBlock.new([self])
		return node.addExpression(expr)

	def addComment comment

		@comment = comment
		self

	def indented a,b

		if b isa Array

			add(b[0])
			b = b[1]


		@indented = [a,b]
		@indentation ||= a and b ? AST.Indentation.new(a,b) : AST.INDENT
		self

	def prebreak term = '\n'

		console.log "prebreak!!!!"
		@prebreak = @prebreak or term
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
			@cache = nil # hmm, removing the cache WARN
		self


	def predeclare
		if @cache
			scope__.vars.swap(@cache:var,self)
		self


	def alias
		nil

	def warn text, opts = {}


		opts:message = text
		opts:loc ||= loc
		scope__.root.warn opts
		self

	def c o
		if @cache && @cache:cached
			@cache:lookups++
			if @cache:uses == @cache:lookups
				@cache:var.free




			return @cache:var.c

		STACK.push(self)
		forceExpression if o && o:expression

		if o and o:indent

			@indentation ||= AST.INDENT


		var out = js(STACK,o)

		var paren = shouldParenthesize
		
		if var indent = @indentation
			out = indent.wrap(out,o)

		if paren

			if out isa Array
				out = "({out})"
			else
				out = out.parenthesize

		if o and o:braces
			out = '{' + out + '}'




		STACK.pop(self)

		if @cache


			out = "{@cache:var.c}={out}" unless @cache:manual
			var par = STACK.current
			out = out.parenthesize if par isa AST.Access || par isa AST.Op # others?
			@cache:cached = yes

		if @temporary && @temporary:length
			@temporary.map do |temp| 

				temp.decache




		return out

class AST.Expression < AST.Node

class AST.ValueNode < AST.Node
	prop value

	def initialize value
		@value = load(value)

	def load value
		value

	def js
		value.c

	def visit
		@value.traverse if @value && @value:traverse
		self

	def region
		@value:_region

class AST.Statement < AST.ValueNode

	def isExpressable
		return no
		
	def statement
		return true


class AST.Meta < AST.ValueNode

class AST.Comment < AST.Meta

	def c o
		if o and o:expression or @value.match(/\n/) # multiline?
			"/*{value.c}*/"
		else
			"// {value.c}"


class AST.Terminator < AST.Meta

	def c
		return @value

		v # .split()


class AST.Newline < AST.Terminator

	def initialize v
		@value = v or '\n'

	def c
		@value
		


class AST.Index < AST.ValueNode

	def js
		@value.c

class AST.NewLines < AST.ValueNode

	def js
		@value

	def isExpressable
		yes

class AST.ListNode < AST.Node

	prop nodes

	def initialize list = [], options = {}
		@nodes = load(list)
		@options = options
	

	def list
		@nodes

	def compact
		@nodes = @nodes.compact
		self

	def load list
		list

	def concat other

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
		nodes.unshift(AST.BR) if br
		nodes.unshift(item)
		self


	def slice a, b
		self:constructor.new(@nodes.slice(a,b))

	def add item
		push(item)
		self

	def break br, pre = no



		br = AST.Terminator.new(br) if typeof br == 'string' # hmmm?
		pre ? unshift(br) : push(br)
		self

	def some cb
		nodes.some(cb)

	def every cb
		nodes.every(cb)

	def filter cb
		if cb:prototype isa AST.Node
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
		



	def last
		var i = @nodes:length
		while i
			i = i - 1
			var v = @nodes[i]
			return v unless v isa AST.Meta
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

		var express = delim != ';'
		var shouldDelim = no
		var nodes = nodes.compact
		var last = last
		var realLast = nodes[nodes:length - 1]


		var parts = nodes.map do |arg| 
			var out = arg.c(expression: express)








			if arg isa AST.Meta
				true


			else


				out = out + delim if !express or arg != last
			out

		return parts.join("")













		

class AST.ArgList < AST.ListNode

	def hasSplat
		list.some do |v| v isa AST.Splat

	def delimiter
		","
















class AST.AssignList < AST.ArgList	




	def concat other
		if @nodes:length == 0 and other isa AST.AssignList

			return other
		else
			super


		self




class AST.Block < AST.ListNode	
	
	prop head

	def self.wrap ary

		ary:length == 1 && ary[0] isa AST.Block ? ary[0] : AST.Block.new(ary)







	def visit


		if @prebreak # hmm

			console.log "PREBREAK IN AST.BLOCK SHOULD THROW"
			first and first.prebreak(@prebreak)
		super
		
	def push item, sep











		nodes.push(item)
		self

	def block
		self

	def loc
		if var opt = option(:ends)

			var a = opt[0].loc
			var b = opt[1].loc

			p "no loc for {opt[0]}" unless a
			p "no loc for {opt[1]}" unless b

			[a[0],b[1]]
		else
			[0,0]

	def initialize expr = []
		self.nodes = expr.flatten.compact or []



	def unwrap
		var ary = []
		for node,i in nodes
			if node isa AST.Block

				ary:push.apply(ary,node.unwrap)
			else
				ary.push(node)
		return ary



	def compile o = {}
		var root = AST.Root.new(self,o)
		root.compile(o)


	def analyze o = {}

		self

	def js o, opts
		var l = nodes:length

		var filter = (|n| n != null && n != undefined && n != AST.EMPTY)
		var ast = nodes.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		var express = isExpression or o.isExpression or (option(:express) and isExpressable)
		return null if ast:length == 0



		if express
			return super(o,delim: ',', nodes: ast)




		var compile = do |node,i|
			var out = node ? node.c : ""
			return null if out == ""


			if out isa Array

				out = out.flatten.compact.filter(filter).join(";\n")

			var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/) # out[out:length - 1] == ";"

			out += ";" unless hasSemiColon or node isa AST.Meta
			




			return out

		ast = ast.map(compile)


		if @head
			var prefix = []
			@head.forEach do |item|
				var out = compile(item)
				prefix.push(out + '\n') if out

			ast = prefix.concat(ast)



		ast = ast.compact.filter(filter).join("") # .replace(/[\s\n]+$/,'')  # hmm really?




	def defers original, replacement
		var idx = nodes.indexOf(original)
		nodes[idx] = replacement if idx >= 0

		replacement.@prebreak ||= original.@prebreak # hacky
		var rest = nodes.splice(idx + 1)
		return rest

	def consume node
		if node isa AST.TagTree # special case?!?


			nodes = nodes.map(|child| child.consume(node))

			nodes = [AST.Arr.new(nodes)] if nodes:length > 1
			

			return self


		if var before = last
			var after = before.consume(node)
			if after != before
				

				replace(before,after)

		return self
		
	def isExpressable
		return no unless nodes.every(|v| v.isExpressable )
		return yes

	def isExpression
		option(:express) || super.isExpression


class AST.VarBlock < AST.ListNode





	def addExpression expr


		if expr isa AST.Assign
			addExpression(expr.left) # make sure this is a valid thing?



			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)

		elif expr isa AST.VarOrAccess

			push(AST.VarReference.new(expr.value))

		elif expr isa AST.Splat && expr.node isa AST.VarOrAccess

			expr.value = AST.VarReference.new(expr.node.value)
			push(expr)
		else
			throw "VarBlock does not allow non-variable expressions"
		self

	def isExpressable


		no

	def js o
		var code = nodes.map do |node| node.c
		code = code.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		return "var {code.join(",")}"

	def consume node



		return self


class AST.Parens < AST.ValueNode

		
	def js o
		var par = up


		if par isa AST.Block
			@noparen = yes unless o.isExpression
			return value.c(expression: o.isExpression)
		else
			value.c(expression: yes)









	def shouldParenthesize


		return no if @noparen #  or par isa AST.ArgList
		return yes

	def prebreak br
		super(br)

		@value.prebreak(br) if @value
		self

	def isExpressable
		value.isExpressable

	def consume node
		value.consume(node)




class AST.ExpressionBlock < AST.ListNode

	def visit

		map(|item| item.traverse)
		self
		
	def c
		map(|item| item.c).join(",")




	def consume node
		value.consume(node)

	def addExpression expr



		if expr.node isa AST.Assign

			push(expr.left)


			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)
		else
			push(expr)
		self


		
		

def AST.parse str, opts = {}
	var indent = str.match(/\t+/)[0]
	AST.Imba.parse(str,opts)

def AST.inline str, opts = {}
	AST.parse(str,opts).body

def AST.node typ, pars
	if typ == 'call'
		if pars[0].c == 'return'
			pars[0] = 'tata'	
		AST.Call.new(pars[0],pars[1],pars[2])


def AST.escapeComments str
	return '' unless str
	return str




class AST.Indentation

	prop open
	prop close

	def initialize a,b
		@open = a or 1
		@close = b or 1
		self


	def wrap str, o
		var pre = @open:pre
		var post = @open:post
		var esc = AST:escapeComments


		str = esc(post).replace(/^\n/,'') + str
		str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n")

		str = esc(pre) + '\n' + str

		str = str + '\n' unless str[str:length - 1] == '\n'



		return str
		
AST.INDENT = AST.Indentation.new

class AST.Stack

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

		self

	def pop node
		@nodes.pop(node)
		self

	def parent
		@nodes[@nodes:length - 2]

	def current
		@nodes[@nodes:length - 1]

	def up test
		test ||= do |v| !(v isa AST.VarOrAccess)

		if test:prototype isa AST.Node
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

		var scopes = []
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]
			scopes.push(node.@scope) if node.@scope
			i -= 1
		return scopes

	def method
		up(AST.MethodDeclaration)

	def isExpression
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]

			if node isa AST.Code or node isa AST.Loop
				return false
			if node.isExpression
				return true

			i -= 1
		return false

	def toString
		"Stack({@nodes.join(" -> ")})"

	def scoping
		@nodes.filter(|n| n.@scope ).map(|n| n.@scope )


STACK = AST.Stack.new

class AST.Node

	prop o
	prop options
	prop traversed
	prop statement

	def safechain
		no

	def dom
		var name = "ast_" + self:constructor:name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase

		if Imba.TAGS[name]
			var node = Imba.tag(name)
			node.bind(self).build
			return node
		else
			return "[{name}]"

	def p


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


	def consume node
		if node isa AST.PushAssign
			return AST.PushAssign.new(node.op,node.left,self)

		if node isa AST.Assign


			return OP(node.op,node.left,self)
		elif node isa AST.Op
			return OP(node.op,node.left,self)
		elif node isa AST.Return

			return AST.Return.new(self)
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
		AST.Block.wrap([self])

	def node
		self

	def scope__
		STACK.scope

	def up
		STACK.parent

	def util
		AST.Util

	def receiver
		self

	def addExpression expr


		var node = AST.ExpressionBlock.new([self])
		return node.addExpression(expr)

	def addComment comment

		@comment = comment
		self

	def indented a,b

		if b isa Array

			add(b[0])
			b = b[1]


		@indented = [a,b]
		@indentation ||= a and b ? AST.Indentation.new(a,b) : AST.INDENT
		self

	def prebreak term = '\n'

		console.log "prebreak!!!!"
		@prebreak = @prebreak or term
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
			@cache = nil # hmm, removing the cache WARN
		self


	def predeclare
		if @cache
			scope__.vars.swap(@cache:var,self)
		self


	def alias
		nil

	def warn text, opts = {}


		opts:message = text
		opts:loc ||= loc
		scope__.root.warn opts
		self

	def c o
		if @cache && @cache:cached
			@cache:lookups++
			if @cache:uses == @cache:lookups
				@cache:var.free




			return @cache:var.c

		STACK.push(self)
		forceExpression if o && o:expression

		if o and o:indent

			@indentation ||= AST.INDENT


		var out = js(STACK,o)

		var paren = shouldParenthesize
		
		if var indent = @indentation
			out = indent.wrap(out,o)

		if paren

			if out isa Array
				out = "({out})"
			else
				out = out.parenthesize

		if o and o:braces
			out = '{' + out + '}'




		STACK.pop(self)

		if @cache


			out = "{@cache:var.c}={out}" unless @cache:manual
			var par = STACK.current
			out = out.parenthesize if par isa AST.Access || par isa AST.Op # others?
			@cache:cached = yes

		if @temporary && @temporary:length
			@temporary.map do |temp| 

				temp.decache




		return out

class AST.Expression < AST.Node

class AST.ValueNode < AST.Node
	prop value

	def initialize value
		@value = load(value)

	def load value
		value

	def js
		value.c

	def visit
		@value.traverse if @value && @value:traverse
		self

	def region
		@value:_region

class AST.Statement < AST.ValueNode

	def isExpressable
		return no
		
	def statement
		return true


class AST.Meta < AST.ValueNode

class AST.Comment < AST.Meta

	def c o
		if o and o:expression or @value.match(/\n/) # multiline?
			"/*{value.c}*/"
		else
			"// {value.c}"


class AST.Terminator < AST.Meta

	def c
		return @value

		v # .split()


class AST.Newline < AST.Terminator

	def initialize v
		@value = v or '\n'

	def c
		@value
		


class AST.Index < AST.ValueNode

	def js
		@value.c

class AST.NewLines < AST.ValueNode

	def js
		@value

	def isExpressable
		yes

class AST.ListNode < AST.Node

	prop nodes

	def initialize list = [], options = {}
		@nodes = load(list)
		@options = options
	

	def list
		@nodes

	def compact
		@nodes = @nodes.compact
		self

	def load list
		list

	def concat other

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
		nodes.unshift(AST.BR) if br
		nodes.unshift(item)
		self


	def slice a, b
		self:constructor.new(@nodes.slice(a,b))

	def add item
		push(item)
		self

	def break br, pre = no



		br = AST.Terminator.new(br) if typeof br == 'string' # hmmm?
		pre ? unshift(br) : push(br)
		self

	def some cb
		nodes.some(cb)

	def every cb
		nodes.every(cb)

	def filter cb
		if cb:prototype isa AST.Node
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
		



	def last
		var i = @nodes:length
		while i
			i = i - 1
			var v = @nodes[i]
			return v unless v isa AST.Meta
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

		var express = delim != ';'
		var shouldDelim = no
		var nodes = nodes.compact
		var last = last
		var realLast = nodes[nodes:length - 1]


		var parts = nodes.map do |arg| 
			var out = arg.c(expression: express)








			if arg isa AST.Meta
				true


			else


				out = out + delim if !express or arg != last
			out

		return parts.join("")













		

class AST.ArgList < AST.ListNode

	def hasSplat
		list.some do |v| v isa AST.Splat

	def delimiter
		","
















class AST.AssignList < AST.ArgList	




	def concat other
		if @nodes:length == 0 and other isa AST.AssignList

			return other
		else
			super


		self




class AST.Block < AST.ListNode	
	
	prop head

	def self.wrap ary

		ary:length == 1 && ary[0] isa AST.Block ? ary[0] : AST.Block.new(ary)







	def visit


		if @prebreak # hmm

			console.log "PREBREAK IN AST.BLOCK SHOULD THROW"
			first and first.prebreak(@prebreak)
		super
		
	def push item, sep











		nodes.push(item)
		self

	def block
		self

	def loc
		if var opt = option(:ends)

			var a = opt[0].loc
			var b = opt[1].loc

			p "no loc for {opt[0]}" unless a
			p "no loc for {opt[1]}" unless b

			[a[0],b[1]]
		else
			[0,0]

	def initialize expr = []
		self.nodes = expr.flatten.compact or []



	def unwrap
		var ary = []
		for node,i in nodes
			if node isa AST.Block

				ary:push.apply(ary,node.unwrap)
			else
				ary.push(node)
		return ary



	def compile o = {}
		var root = AST.Root.new(self,o)
		root.compile(o)


	def analyze o = {}

		self

	def js o, opts
		var l = nodes:length

		var filter = (|n| n != null && n != undefined && n != AST.EMPTY)
		var ast = nodes.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		var express = isExpression or o.isExpression or (option(:express) and isExpressable)
		return null if ast:length == 0



		if express
			return super(o,delim: ',', nodes: ast)




		var compile = do |node,i|
			var out = node ? node.c : ""
			return null if out == ""


			if out isa Array

				out = out.flatten.compact.filter(filter).join(";\n")

			var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/) # out[out:length - 1] == ";"

			out += ";" unless hasSemiColon or node isa AST.Meta
			




			return out

		ast = ast.map(compile)


		if @head
			var prefix = []
			@head.forEach do |item|
				var out = compile(item)
				prefix.push(out + '\n') if out

			ast = prefix.concat(ast)



		ast = ast.compact.filter(filter).join("") # .replace(/[\s\n]+$/,'')  # hmm really?




	def defers original, replacement
		var idx = nodes.indexOf(original)
		nodes[idx] = replacement if idx >= 0

		replacement.@prebreak ||= original.@prebreak # hacky
		var rest = nodes.splice(idx + 1)
		return rest

	def consume node
		if node isa AST.TagTree # special case?!?


			nodes = nodes.map(|child| child.consume(node))

			nodes = [AST.Arr.new(nodes)] if nodes:length > 1
			

			return self


		if var before = last
			var after = before.consume(node)
			if after != before
				

				replace(before,after)

		return self
		
	def isExpressable
		return no unless nodes.every(|v| v.isExpressable )
		return yes

	def isExpression
		option(:express) || super.isExpression


class AST.VarBlock < AST.ListNode





	def addExpression expr


		if expr isa AST.Assign
			addExpression(expr.left) # make sure this is a valid thing?



			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)

		elif expr isa AST.VarOrAccess

			push(AST.VarReference.new(expr.value))

		elif expr isa AST.Splat && expr.node isa AST.VarOrAccess

			expr.value = AST.VarReference.new(expr.node.value)
			push(expr)
		else
			throw "VarBlock does not allow non-variable expressions"
		self

	def isExpressable


		no

	def js o
		var code = nodes.map do |node| node.c
		code = code.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		return "var {code.join(",")}"

	def consume node



		return self


class AST.Parens < AST.ValueNode

		
	def js o
		var par = up


		if par isa AST.Block
			@noparen = yes unless o.isExpression
			return value.c(expression: o.isExpression)
		else
			value.c(expression: yes)









	def shouldParenthesize


		return no if @noparen #  or par isa AST.ArgList
		return yes

	def prebreak br
		super(br)

		@value.prebreak(br) if @value
		self

	def isExpressable
		value.isExpressable

	def consume node
		value.consume(node)




class AST.ExpressionBlock < AST.ListNode

	def visit

		map(|item| item.traverse)
		self
		
	def c
		map(|item| item.c).join(",")




	def consume node
		value.consume(node)

	def addExpression expr



		if expr.node isa AST.Assign

			push(expr.left)


			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)
		else
			push(expr)
		self


		
		

def AST.parse str, opts = {}
	var indent = str.match(/\t+/)[0]
	AST.Imba.parse(str,opts)

def AST.inline str, opts = {}
	AST.parse(str,opts).body

def AST.node typ, pars
	if typ == 'call'
		if pars[0].c == 'return'
			pars[0] = 'tata'	
		AST.Call.new(pars[0],pars[1],pars[2])


def AST.escapeComments str
	return '' unless str
	return str




class AST.Indentation

	prop open
	prop close

	def initialize a,b
		@open = a or 1
		@close = b or 1
		self


	def wrap str, o
		var pre = @open:pre
		var post = @open:post
		var esc = AST:escapeComments


		str = esc(post).replace(/^\n/,'') + str
		str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n")

		str = esc(pre) + '\n' + str

		str = str + '\n' unless str[str:length - 1] == '\n'



		return str
		
AST.INDENT = AST.Indentation.new

class AST.Stack

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

		self

	def pop node
		@nodes.pop(node)
		self

	def parent
		@nodes[@nodes:length - 2]

	def current
		@nodes[@nodes:length - 1]

	def up test
		test ||= do |v| !(v isa AST.VarOrAccess)

		if test:prototype isa AST.Node
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

		var scopes = []
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]
			scopes.push(node.@scope) if node.@scope
			i -= 1
		return scopes

	def method
		up(AST.MethodDeclaration)

	def isExpression
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]

			if node isa AST.Code or node isa AST.Loop
				return false
			if node.isExpression
				return true

			i -= 1
		return false

	def toString
		"Stack({@nodes.join(" -> ")})"

	def scoping
		@nodes.filter(|n| n.@scope ).map(|n| n.@scope )


STACK = AST.Stack.new

class AST.Node

	prop o
	prop options
	prop traversed
	prop statement

	def safechain
		no

	def dom
		var name = "ast_" + self:constructor:name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase

		if Imba.TAGS[name]
			var node = Imba.tag(name)
			node.bind(self).build
			return node
		else
			return "[{name}]"

	def p


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


	def consume node
		if node isa AST.PushAssign
			return AST.PushAssign.new(node.op,node.left,self)

		if node isa AST.Assign


			return OP(node.op,node.left,self)
		elif node isa AST.Op
			return OP(node.op,node.left,self)
		elif node isa AST.Return

			return AST.Return.new(self)
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
		AST.Block.wrap([self])

	def node
		self

	def scope__
		STACK.scope

	def up
		STACK.parent

	def util
		AST.Util

	def receiver
		self

	def addExpression expr


		var node = AST.ExpressionBlock.new([self])
		return node.addExpression(expr)

	def addComment comment

		@comment = comment
		self

	def indented a,b

		if b isa Array

			add(b[0])
			b = b[1]


		@indented = [a,b]
		@indentation ||= a and b ? AST.Indentation.new(a,b) : AST.INDENT
		self

	def prebreak term = '\n'

		console.log "prebreak!!!!"
		@prebreak = @prebreak or term
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
			@cache = nil # hmm, removing the cache WARN
		self


	def predeclare
		if @cache
			scope__.vars.swap(@cache:var,self)
		self


	def alias
		nil

	def warn text, opts = {}


		opts:message = text
		opts:loc ||= loc
		scope__.root.warn opts
		self

	def c o
		if @cache && @cache:cached
			@cache:lookups++
			if @cache:uses == @cache:lookups
				@cache:var.free




			return @cache:var.c

		STACK.push(self)
		forceExpression if o && o:expression

		if o and o:indent

			@indentation ||= AST.INDENT


		var out = js(STACK,o)

		var paren = shouldParenthesize
		
		if var indent = @indentation
			out = indent.wrap(out,o)

		if paren

			if out isa Array
				out = "({out})"
			else
				out = out.parenthesize

		if o and o:braces
			out = '{' + out + '}'




		STACK.pop(self)

		if @cache


			out = "{@cache:var.c}={out}" unless @cache:manual
			var par = STACK.current
			out = out.parenthesize if par isa AST.Access || par isa AST.Op # others?
			@cache:cached = yes

		if @temporary && @temporary:length
			@temporary.map do |temp| 

				temp.decache




		return out

class AST.Expression < AST.Node

class AST.ValueNode < AST.Node
	prop value

	def initialize value
		@value = load(value)

	def load value
		value

	def js
		value.c

	def visit
		@value.traverse if @value && @value:traverse
		self

	def region
		@value:_region

class AST.Statement < AST.ValueNode

	def isExpressable
		return no
		
	def statement
		return true


class AST.Meta < AST.ValueNode

class AST.Comment < AST.Meta

	def c o
		if o and o:expression or @value.match(/\n/) # multiline?
			"/*{value.c}*/"
		else
			"// {value.c}"


class AST.Terminator < AST.Meta

	def c
		return @value

		v # .split()


class AST.Newline < AST.Terminator

	def initialize v
		@value = v or '\n'

	def c
		@value
		


class AST.Index < AST.ValueNode

	def js
		@value.c

class AST.NewLines < AST.ValueNode

	def js
		@value

	def isExpressable
		yes

class AST.ListNode < AST.Node

	prop nodes

	def initialize list = [], options = {}
		@nodes = load(list)
		@options = options
	

	def list
		@nodes

	def compact
		@nodes = @nodes.compact
		self

	def load list
		list

	def concat other

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
		nodes.unshift(AST.BR) if br
		nodes.unshift(item)
		self


	def slice a, b
		self:constructor.new(@nodes.slice(a,b))

	def add item
		push(item)
		self

	def break br, pre = no



		br = AST.Terminator.new(br) if typeof br == 'string' # hmmm?
		pre ? unshift(br) : push(br)
		self

	def some cb
		nodes.some(cb)

	def every cb
		nodes.every(cb)

	def filter cb
		if cb:prototype isa AST.Node
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
		



	def last
		var i = @nodes:length
		while i
			i = i - 1
			var v = @nodes[i]
			return v unless v isa AST.Meta
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

		var express = delim != ';'
		var shouldDelim = no
		var nodes = nodes.compact
		var last = last
		var realLast = nodes[nodes:length - 1]


		var parts = nodes.map do |arg| 
			var out = arg.c(expression: express)








			if arg isa AST.Meta
				true


			else


				out = out + delim if !express or arg != last
			out

		return parts.join("")













		

class AST.ArgList < AST.ListNode

	def hasSplat
		list.some do |v| v isa AST.Splat

	def delimiter
		","
















class AST.AssignList < AST.ArgList	




	def concat other
		if @nodes:length == 0 and other isa AST.AssignList

			return other
		else
			super


		self




class AST.Block < AST.ListNode	
	
	prop head

	def self.wrap ary

		ary:length == 1 && ary[0] isa AST.Block ? ary[0] : AST.Block.new(ary)







	def visit


		if @prebreak # hmm

			console.log "PREBREAK IN AST.BLOCK SHOULD THROW"
			first and first.prebreak(@prebreak)
		super
		
	def push item, sep











		nodes.push(item)
		self

	def block
		self

	def loc
		if var opt = option(:ends)

			var a = opt[0].loc
			var b = opt[1].loc

			p "no loc for {opt[0]}" unless a
			p "no loc for {opt[1]}" unless b

			[a[0],b[1]]
		else
			[0,0]

	def initialize expr = []
		self.nodes = expr.flatten.compact or []



	def unwrap
		var ary = []
		for node,i in nodes
			if node isa AST.Block

				ary:push.apply(ary,node.unwrap)
			else
				ary.push(node)
		return ary



	def compile o = {}
		var root = AST.Root.new(self,o)
		root.compile(o)


	def analyze o = {}

		self

	def js o, opts
		var l = nodes:length

		var filter = (|n| n != null && n != undefined && n != AST.EMPTY)
		var ast = nodes.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		var express = isExpression or o.isExpression or (option(:express) and isExpressable)
		return null if ast:length == 0



		if express
			return super(o,delim: ',', nodes: ast)




		var compile = do |node,i|
			var out = node ? node.c : ""
			return null if out == ""


			if out isa Array

				out = out.flatten.compact.filter(filter).join(";\n")

			var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/) # out[out:length - 1] == ";"

			out += ";" unless hasSemiColon or node isa AST.Meta
			




			return out

		ast = ast.map(compile)


		if @head
			var prefix = []
			@head.forEach do |item|
				var out = compile(item)
				prefix.push(out + '\n') if out

			ast = prefix.concat(ast)



		ast = ast.compact.filter(filter).join("") # .replace(/[\s\n]+$/,'')  # hmm really?




	def defers original, replacement
		var idx = nodes.indexOf(original)
		nodes[idx] = replacement if idx >= 0

		replacement.@prebreak ||= original.@prebreak # hacky
		var rest = nodes.splice(idx + 1)
		return rest

	def consume node
		if node isa AST.TagTree # special case?!?


			nodes = nodes.map(|child| child.consume(node))

			nodes = [AST.Arr.new(nodes)] if nodes:length > 1
			

			return self


		if var before = last
			var after = before.consume(node)
			if after != before
				

				replace(before,after)

		return self
		
	def isExpressable
		return no unless nodes.every(|v| v.isExpressable )
		return yes

	def isExpression
		option(:express) || super.isExpression


class AST.VarBlock < AST.ListNode





	def addExpression expr


		if expr isa AST.Assign
			addExpression(expr.left) # make sure this is a valid thing?



			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)

		elif expr isa AST.VarOrAccess

			push(AST.VarReference.new(expr.value))

		elif expr isa AST.Splat && expr.node isa AST.VarOrAccess

			expr.value = AST.VarReference.new(expr.node.value)
			push(expr)
		else
			throw "VarBlock does not allow non-variable expressions"
		self

	def isExpressable


		no

	def js o
		var code = nodes.map do |node| node.c
		code = code.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		return "var {code.join(",")}"

	def consume node



		return self


class AST.Parens < AST.ValueNode

		
	def js o
		var par = up


		if par isa AST.Block
			@noparen = yes unless o.isExpression
			return value.c(expression: o.isExpression)
		else
			value.c(expression: yes)









	def shouldParenthesize


		return no if @noparen #  or par isa AST.ArgList
		return yes

	def prebreak br
		super(br)

		@value.prebreak(br) if @value
		self

	def isExpressable
		value.isExpressable

	def consume node
		value.consume(node)




class AST.ExpressionBlock < AST.ListNode

	def visit

		map(|item| item.traverse)
		self
		
	def c
		map(|item| item.c).join(",")




	def consume node
		value.consume(node)

	def addExpression expr



		if expr.node isa AST.Assign

			push(expr.left)


			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)
		else
			push(expr)
		self


		
		

def AST.parse str, opts = {}
	var indent = str.match(/\t+/)[0]
	AST.Imba.parse(str,opts)

def AST.inline str, opts = {}
	AST.parse(str,opts).body

def AST.node typ, pars
	if typ == 'call'
		if pars[0].c == 'return'
			pars[0] = 'tata'	
		AST.Call.new(pars[0],pars[1],pars[2])


def AST.escapeComments str
	return '' unless str
	return str




class AST.Indentation

	prop open
	prop close

	def initialize a,b
		@open = a or 1
		@close = b or 1
		self


	def wrap str, o
		var pre = @open:pre
		var post = @open:post
		var esc = AST:escapeComments


		str = esc(post).replace(/^\n/,'') + str
		str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n")

		str = esc(pre) + '\n' + str

		str = str + '\n' unless str[str:length - 1] == '\n'



		return str
		
AST.INDENT = AST.Indentation.new

class AST.Stack

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

		self

	def pop node
		@nodes.pop(node)
		self

	def parent
		@nodes[@nodes:length - 2]

	def current
		@nodes[@nodes:length - 1]

	def up test
		test ||= do |v| !(v isa AST.VarOrAccess)

		if test:prototype isa AST.Node
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

		var scopes = []
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]
			scopes.push(node.@scope) if node.@scope
			i -= 1
		return scopes

	def method
		up(AST.MethodDeclaration)

	def isExpression
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]

			if node isa AST.Code or node isa AST.Loop
				return false
			if node.isExpression
				return true

			i -= 1
		return false

	def toString
		"Stack({@nodes.join(" -> ")})"

	def scoping
		@nodes.filter(|n| n.@scope ).map(|n| n.@scope )


STACK = AST.Stack.new

class AST.Node

	prop o
	prop options
	prop traversed
	prop statement

	def safechain
		no

	def dom
		var name = "ast_" + self:constructor:name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase

		if Imba.TAGS[name]
			var node = Imba.tag(name)
			node.bind(self).build
			return node
		else
			return "[{name}]"

	def p


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


	def consume node
		if node isa AST.PushAssign
			return AST.PushAssign.new(node.op,node.left,self)

		if node isa AST.Assign


			return OP(node.op,node.left,self)
		elif node isa AST.Op
			return OP(node.op,node.left,self)
		elif node isa AST.Return

			return AST.Return.new(self)
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
		AST.Block.wrap([self])

	def node
		self

	def scope__
		STACK.scope

	def up
		STACK.parent

	def util
		AST.Util

	def receiver
		self

	def addExpression expr


		var node = AST.ExpressionBlock.new([self])
		return node.addExpression(expr)

	def addComment comment

		@comment = comment
		self

	def indented a,b

		if b isa Array

			add(b[0])
			b = b[1]


		@indented = [a,b]
		@indentation ||= a and b ? AST.Indentation.new(a,b) : AST.INDENT
		self

	def prebreak term = '\n'

		console.log "prebreak!!!!"
		@prebreak = @prebreak or term
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
			@cache = nil # hmm, removing the cache WARN
		self


	def predeclare
		if @cache
			scope__.vars.swap(@cache:var,self)
		self


	def alias
		nil

	def warn text, opts = {}


		opts:message = text
		opts:loc ||= loc
		scope__.root.warn opts
		self

	def c o
		if @cache && @cache:cached
			@cache:lookups++
			if @cache:uses == @cache:lookups
				@cache:var.free




			return @cache:var.c

		STACK.push(self)
		forceExpression if o && o:expression

		if o and o:indent

			@indentation ||= AST.INDENT


		var out = js(STACK,o)

		var paren = shouldParenthesize
		
		if var indent = @indentation
			out = indent.wrap(out,o)

		if paren

			if out isa Array
				out = "({out})"
			else
				out = out.parenthesize

		if o and o:braces
			out = '{' + out + '}'




		STACK.pop(self)

		if @cache


			out = "{@cache:var.c}={out}" unless @cache:manual
			var par = STACK.current
			out = out.parenthesize if par isa AST.Access || par isa AST.Op # others?
			@cache:cached = yes

		if @temporary && @temporary:length
			@temporary.map do |temp| 

				temp.decache




		return out

class AST.Expression < AST.Node

class AST.ValueNode < AST.Node
	prop value

	def initialize value
		@value = load(value)

	def load value
		value

	def js
		value.c

	def visit
		@value.traverse if @value && @value:traverse
		self

	def region
		@value:_region

class AST.Statement < AST.ValueNode

	def isExpressable
		return no
		
	def statement
		return true


class AST.Meta < AST.ValueNode

class AST.Comment < AST.Meta

	def c o
		if o and o:expression or @value.match(/\n/) # multiline?
			"/*{value.c}*/"
		else
			"// {value.c}"


class AST.Terminator < AST.Meta

	def c
		return @value

		v # .split()


class AST.Newline < AST.Terminator

	def initialize v
		@value = v or '\n'

	def c
		@value
		


class AST.Index < AST.ValueNode

	def js
		@value.c

class AST.NewLines < AST.ValueNode

	def js
		@value

	def isExpressable
		yes

class AST.ListNode < AST.Node

	prop nodes

	def initialize list = [], options = {}
		@nodes = load(list)
		@options = options
	

	def list
		@nodes

	def compact
		@nodes = @nodes.compact
		self

	def load list
		list

	def concat other

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
		nodes.unshift(AST.BR) if br
		nodes.unshift(item)
		self


	def slice a, b
		self:constructor.new(@nodes.slice(a,b))

	def add item
		push(item)
		self

	def break br, pre = no



		br = AST.Terminator.new(br) if typeof br == 'string' # hmmm?
		pre ? unshift(br) : push(br)
		self

	def some cb
		nodes.some(cb)

	def every cb
		nodes.every(cb)

	def filter cb
		if cb:prototype isa AST.Node
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
		



	def last
		var i = @nodes:length
		while i
			i = i - 1
			var v = @nodes[i]
			return v unless v isa AST.Meta
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

		var express = delim != ';'
		var shouldDelim = no
		var nodes = nodes.compact
		var last = last
		var realLast = nodes[nodes:length - 1]


		var parts = nodes.map do |arg| 
			var out = arg.c(expression: express)








			if arg isa AST.Meta
				true


			else


				out = out + delim if !express or arg != last
			out

		return parts.join("")













		

class AST.ArgList < AST.ListNode

	def hasSplat
		list.some do |v| v isa AST.Splat

	def delimiter
		","
















class AST.AssignList < AST.ArgList	




	def concat other
		if @nodes:length == 0 and other isa AST.AssignList

			return other
		else
			super


		self




class AST.Block < AST.ListNode	
	
	prop head

	def self.wrap ary

		ary:length == 1 && ary[0] isa AST.Block ? ary[0] : AST.Block.new(ary)







	def visit


		if @prebreak # hmm

			console.log "PREBREAK IN AST.BLOCK SHOULD THROW"
			first and first.prebreak(@prebreak)
		super
		
	def push item, sep











		nodes.push(item)
		self

	def block
		self

	def loc
		if var opt = option(:ends)

			var a = opt[0].loc
			var b = opt[1].loc

			p "no loc for {opt[0]}" unless a
			p "no loc for {opt[1]}" unless b

			[a[0],b[1]]
		else
			[0,0]

	def initialize expr = []
		self.nodes = expr.flatten.compact or []



	def unwrap
		var ary = []
		for node,i in nodes
			if node isa AST.Block

				ary:push.apply(ary,node.unwrap)
			else
				ary.push(node)
		return ary



	def compile o = {}
		var root = AST.Root.new(self,o)
		root.compile(o)


	def analyze o = {}

		self

	def js o, opts
		var l = nodes:length

		var filter = (|n| n != null && n != undefined && n != AST.EMPTY)
		var ast = nodes.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		var express = isExpression or o.isExpression or (option(:express) and isExpressable)
		return null if ast:length == 0



		if express
			return super(o,delim: ',', nodes: ast)




		var compile = do |node,i|
			var out = node ? node.c : ""
			return null if out == ""


			if out isa Array

				out = out.flatten.compact.filter(filter).join(";\n")

			var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/) # out[out:length - 1] == ";"

			out += ";" unless hasSemiColon or node isa AST.Meta
			




			return out

		ast = ast.map(compile)


		if @head
			var prefix = []
			@head.forEach do |item|
				var out = compile(item)
				prefix.push(out + '\n') if out

			ast = prefix.concat(ast)



		ast = ast.compact.filter(filter).join("") # .replace(/[\s\n]+$/,'')  # hmm really?




	def defers original, replacement
		var idx = nodes.indexOf(original)
		nodes[idx] = replacement if idx >= 0

		replacement.@prebreak ||= original.@prebreak # hacky
		var rest = nodes.splice(idx + 1)
		return rest

	def consume node
		if node isa AST.TagTree # special case?!?


			nodes = nodes.map(|child| child.consume(node))

			nodes = [AST.Arr.new(nodes)] if nodes:length > 1
			

			return self


		if var before = last
			var after = before.consume(node)
			if after != before
				

				replace(before,after)

		return self
		
	def isExpressable
		return no unless nodes.every(|v| v.isExpressable )
		return yes

	def isExpression
		option(:express) || super.isExpression


class AST.VarBlock < AST.ListNode





	def addExpression expr


		if expr isa AST.Assign
			addExpression(expr.left) # make sure this is a valid thing?



			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)

		elif expr isa AST.VarOrAccess

			push(AST.VarReference.new(expr.value))

		elif expr isa AST.Splat && expr.node isa AST.VarOrAccess

			expr.value = AST.VarReference.new(expr.node.value)
			push(expr)
		else
			throw "VarBlock does not allow non-variable expressions"
		self

	def isExpressable


		no

	def js o
		var code = nodes.map do |node| node.c
		code = code.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		return "var {code.join(",")}"

	def consume node



		return self


class AST.Parens < AST.ValueNode

		
	def js o
		var par = up


		if par isa AST.Block
			@noparen = yes unless o.isExpression
			return value.c(expression: o.isExpression)
		else
			value.c(expression: yes)









	def shouldParenthesize


		return no if @noparen #  or par isa AST.ArgList
		return yes

	def prebreak br
		super(br)

		@value.prebreak(br) if @value
		self

	def isExpressable
		value.isExpressable

	def consume node
		value.consume(node)




class AST.ExpressionBlock < AST.ListNode

	def visit

		map(|item| item.traverse)
		self
		
	def c
		map(|item| item.c).join(",")




	def consume node
		value.consume(node)

	def addExpression expr



		if expr.node isa AST.Assign

			push(expr.left)


			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)
		else
			push(expr)
		self


		
		

def AST.parse str, opts = {}
	var indent = str.match(/\t+/)[0]
	AST.Imba.parse(str,opts)

def AST.inline str, opts = {}
	AST.parse(str,opts).body

def AST.node typ, pars
	if typ == 'call'
		if pars[0].c == 'return'
			pars[0] = 'tata'	
		AST.Call.new(pars[0],pars[1],pars[2])


def AST.escapeComments str
	return '' unless str
	return str




class AST.Indentation

	prop open
	prop close

	def initialize a,b
		@open = a or 1
		@close = b or 1
		self


	def wrap str, o
		var pre = @open:pre
		var post = @open:post
		var esc = AST:escapeComments


		str = esc(post).replace(/^\n/,'') + str
		str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n")

		str = esc(pre) + '\n' + str

		str = str + '\n' unless str[str:length - 1] == '\n'



		return str
		
AST.INDENT = AST.Indentation.new

class AST.Stack

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

		self

	def pop node
		@nodes.pop(node)
		self

	def parent
		@nodes[@nodes:length - 2]

	def current
		@nodes[@nodes:length - 1]

	def up test
		test ||= do |v| !(v isa AST.VarOrAccess)

		if test:prototype isa AST.Node
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

		var scopes = []
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]
			scopes.push(node.@scope) if node.@scope
			i -= 1
		return scopes

	def method
		up(AST.MethodDeclaration)

	def isExpression
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]

			if node isa AST.Code or node isa AST.Loop
				return false
			if node.isExpression
				return true

			i -= 1
		return false

	def toString
		"Stack({@nodes.join(" -> ")})"

	def scoping
		@nodes.filter(|n| n.@scope ).map(|n| n.@scope )


STACK = AST.Stack.new

class AST.Node

	prop o
	prop options
	prop traversed
	prop statement

	def safechain
		no

	def dom
		var name = "ast_" + self:constructor:name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase

		if Imba.TAGS[name]
			var node = Imba.tag(name)
			node.bind(self).build
			return node
		else
			return "[{name}]"

	def p


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


	def consume node
		if node isa AST.PushAssign
			return AST.PushAssign.new(node.op,node.left,self)

		if node isa AST.Assign


			return OP(node.op,node.left,self)
		elif node isa AST.Op
			return OP(node.op,node.left,self)
		elif node isa AST.Return

			return AST.Return.new(self)
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
		AST.Block.wrap([self])

	def node
		self

	def scope__
		STACK.scope

	def up
		STACK.parent

	def util
		AST.Util

	def receiver
		self

	def addExpression expr


		var node = AST.ExpressionBlock.new([self])
		return node.addExpression(expr)

	def addComment comment

		@comment = comment
		self

	def indented a,b

		if b isa Array

			add(b[0])
			b = b[1]


		@indented = [a,b]
		@indentation ||= a and b ? AST.Indentation.new(a,b) : AST.INDENT
		self

	def prebreak term = '\n'

		console.log "prebreak!!!!"
		@prebreak = @prebreak or term
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
			@cache = nil # hmm, removing the cache WARN
		self


	def predeclare
		if @cache
			scope__.vars.swap(@cache:var,self)
		self


	def alias
		nil

	def warn text, opts = {}


		opts:message = text
		opts:loc ||= loc
		scope__.root.warn opts
		self

	def c o
		if @cache && @cache:cached
			@cache:lookups++
			if @cache:uses == @cache:lookups
				@cache:var.free




			return @cache:var.c

		STACK.push(self)
		forceExpression if o && o:expression

		if o and o:indent

			@indentation ||= AST.INDENT


		var out = js(STACK,o)

		var paren = shouldParenthesize
		
		if var indent = @indentation
			out = indent.wrap(out,o)

		if paren

			if out isa Array
				out = "({out})"
			else
				out = out.parenthesize

		if o and o:braces
			out = '{' + out + '}'




		STACK.pop(self)

		if @cache


			out = "{@cache:var.c}={out}" unless @cache:manual
			var par = STACK.current
			out = out.parenthesize if par isa AST.Access || par isa AST.Op # others?
			@cache:cached = yes

		if @temporary && @temporary:length
			@temporary.map do |temp| 

				temp.decache




		return out

class AST.Expression < AST.Node

class AST.ValueNode < AST.Node
	prop value

	def initialize value
		@value = load(value)

	def load value
		value

	def js
		value.c

	def visit
		@value.traverse if @value && @value:traverse
		self

	def region
		@value:_region

class AST.Statement < AST.ValueNode

	def isExpressable
		return no
		
	def statement
		return true


class AST.Meta < AST.ValueNode

class AST.Comment < AST.Meta

	def c o
		if o and o:expression or @value.match(/\n/) # multiline?
			"/*{value.c}*/"
		else
			"// {value.c}"


class AST.Terminator < AST.Meta

	def c
		return @value

		v # .split()


class AST.Newline < AST.Terminator

	def initialize v
		@value = v or '\n'

	def c
		@value
		


class AST.Index < AST.ValueNode

	def js
		@value.c

class AST.NewLines < AST.ValueNode

	def js
		@value

	def isExpressable
		yes

class AST.ListNode < AST.Node

	prop nodes

	def initialize list = [], options = {}
		@nodes = load(list)
		@options = options
	

	def list
		@nodes

	def compact
		@nodes = @nodes.compact
		self

	def load list
		list

	def concat other

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
		nodes.unshift(AST.BR) if br
		nodes.unshift(item)
		self


	def slice a, b
		self:constructor.new(@nodes.slice(a,b))

	def add item
		push(item)
		self

	def break br, pre = no



		br = AST.Terminator.new(br) if typeof br == 'string' # hmmm?
		pre ? unshift(br) : push(br)
		self

	def some cb
		nodes.some(cb)

	def every cb
		nodes.every(cb)

	def filter cb
		if cb:prototype isa AST.Node
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
		



	def last
		var i = @nodes:length
		while i
			i = i - 1
			var v = @nodes[i]
			return v unless v isa AST.Meta
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

		var express = delim != ';'
		var shouldDelim = no
		var nodes = nodes.compact
		var last = last
		var realLast = nodes[nodes:length - 1]


		var parts = nodes.map do |arg| 
			var out = arg.c(expression: express)








			if arg isa AST.Meta
				true


			else


				out = out + delim if !express or arg != last
			out

		return parts.join("")













		

class AST.ArgList < AST.ListNode

	def hasSplat
		list.some do |v| v isa AST.Splat

	def delimiter
		","
















class AST.AssignList < AST.ArgList	




	def concat other
		if @nodes:length == 0 and other isa AST.AssignList

			return other
		else
			super


		self




class AST.Block < AST.ListNode	
	
	prop head

	def self.wrap ary

		ary:length == 1 && ary[0] isa AST.Block ? ary[0] : AST.Block.new(ary)







	def visit


		if @prebreak # hmm

			console.log "PREBREAK IN AST.BLOCK SHOULD THROW"
			first and first.prebreak(@prebreak)
		super
		
	def push item, sep











		nodes.push(item)
		self

	def block
		self

	def loc
		if var opt = option(:ends)

			var a = opt[0].loc
			var b = opt[1].loc

			p "no loc for {opt[0]}" unless a
			p "no loc for {opt[1]}" unless b

			[a[0],b[1]]
		else
			[0,0]

	def initialize expr = []
		self.nodes = expr.flatten.compact or []



	def unwrap
		var ary = []
		for node,i in nodes
			if node isa AST.Block

				ary:push.apply(ary,node.unwrap)
			else
				ary.push(node)
		return ary



	def compile o = {}
		var root = AST.Root.new(self,o)
		root.compile(o)


	def analyze o = {}

		self

	def js o, opts
		var l = nodes:length

		var filter = (|n| n != null && n != undefined && n != AST.EMPTY)
		var ast = nodes.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		var express = isExpression or o.isExpression or (option(:express) and isExpressable)
		return null if ast:length == 0



		if express
			return super(o,delim: ',', nodes: ast)




		var compile = do |node,i|
			var out = node ? node.c : ""
			return null if out == ""


			if out isa Array

				out = out.flatten.compact.filter(filter).join(";\n")

			var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/) # out[out:length - 1] == ";"

			out += ";" unless hasSemiColon or node isa AST.Meta
			




			return out

		ast = ast.map(compile)


		if @head
			var prefix = []
			@head.forEach do |item|
				var out = compile(item)
				prefix.push(out + '\n') if out

			ast = prefix.concat(ast)



		ast = ast.compact.filter(filter).join("") # .replace(/[\s\n]+$/,'')  # hmm really?




	def defers original, replacement
		var idx = nodes.indexOf(original)
		nodes[idx] = replacement if idx >= 0

		replacement.@prebreak ||= original.@prebreak # hacky
		var rest = nodes.splice(idx + 1)
		return rest

	def consume node
		if node isa AST.TagTree # special case?!?


			nodes = nodes.map(|child| child.consume(node))

			nodes = [AST.Arr.new(nodes)] if nodes:length > 1
			

			return self


		if var before = last
			var after = before.consume(node)
			if after != before
				

				replace(before,after)

		return self
		
	def isExpressable
		return no unless nodes.every(|v| v.isExpressable )
		return yes

	def isExpression
		option(:express) || super.isExpression


class AST.VarBlock < AST.ListNode





	def addExpression expr


		if expr isa AST.Assign
			addExpression(expr.left) # make sure this is a valid thing?



			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)

		elif expr isa AST.VarOrAccess

			push(AST.VarReference.new(expr.value))

		elif expr isa AST.Splat && expr.node isa AST.VarOrAccess

			expr.value = AST.VarReference.new(expr.node.value)
			push(expr)
		else
			throw "VarBlock does not allow non-variable expressions"
		self

	def isExpressable


		no

	def js o
		var code = nodes.map do |node| node.c
		code = code.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		return "var {code.join(",")}"

	def consume node



		return self


class AST.Parens < AST.ValueNode

		
	def js o
		var par = up


		if par isa AST.Block
			@noparen = yes unless o.isExpression
			return value.c(expression: o.isExpression)
		else
			value.c(expression: yes)









	def shouldParenthesize


		return no if @noparen #  or par isa AST.ArgList
		return yes

	def prebreak br
		super(br)

		@value.prebreak(br) if @value
		self

	def isExpressable
		value.isExpressable

	def consume node
		value.consume(node)




class AST.ExpressionBlock < AST.ListNode

	def visit

		map(|item| item.traverse)
		self
		
	def c
		map(|item| item.c).join(",")




	def consume node
		value.consume(node)

	def addExpression expr



		if expr.node isa AST.Assign

			push(expr.left)


			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)
		else
			push(expr)
		self


		
		

def AST.parse str, opts = {}
	var indent = str.match(/\t+/)[0]
	AST.Imba.parse(str,opts)

def AST.inline str, opts = {}
	AST.parse(str,opts).body

def AST.node typ, pars
	if typ == 'call'
		if pars[0].c == 'return'
			pars[0] = 'tata'	
		AST.Call.new(pars[0],pars[1],pars[2])


def AST.escapeComments str
	return '' unless str
	return str




class AST.Indentation

	prop open
	prop close

	def initialize a,b
		@open = a or 1
		@close = b or 1
		self


	def wrap str, o
		var pre = @open:pre
		var post = @open:post
		var esc = AST:escapeComments


		str = esc(post).replace(/^\n/,'') + str
		str = str.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n")

		str = esc(pre) + '\n' + str

		str = str + '\n' unless str[str:length - 1] == '\n'



		return str
		
AST.INDENT = AST.Indentation.new

class AST.Stack

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

		self

	def pop node
		@nodes.pop(node)
		self

	def parent
		@nodes[@nodes:length - 2]

	def current
		@nodes[@nodes:length - 1]

	def up test
		test ||= do |v| !(v isa AST.VarOrAccess)

		if test:prototype isa AST.Node
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

		var scopes = []
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]
			scopes.push(node.@scope) if node.@scope
			i -= 1
		return scopes

	def method
		up(AST.MethodDeclaration)

	def isExpression
		var i = @nodes:length - 1
		while i >= 0
			var node = @nodes[i]

			if node isa AST.Code or node isa AST.Loop
				return false
			if node.isExpression
				return true

			i -= 1
		return false

	def toString
		"Stack({@nodes.join(" -> ")})"

	def scoping
		@nodes.filter(|n| n.@scope ).map(|n| n.@scope )


STACK = AST.Stack.new

class AST.Node

	prop o
	prop options
	prop traversed
	prop statement

	def safechain
		no

	def dom
		var name = "ast_" + self:constructor:name.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase

		if Imba.TAGS[name]
			var node = Imba.tag(name)
			node.bind(self).build
			return node
		else
			return "[{name}]"

	def p


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


	def consume node
		if node isa AST.PushAssign
			return AST.PushAssign.new(node.op,node.left,self)

		if node isa AST.Assign


			return OP(node.op,node.left,self)
		elif node isa AST.Op
			return OP(node.op,node.left,self)
		elif node isa AST.Return

			return AST.Return.new(self)
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
		AST.Block.wrap([self])

	def node
		self

	def scope__
		STACK.scope

	def up
		STACK.parent

	def util
		AST.Util

	def receiver
		self

	def addExpression expr


		var node = AST.ExpressionBlock.new([self])
		return node.addExpression(expr)

	def addComment comment

		@comment = comment
		self

	def indented a,b

		if b isa Array

			add(b[0])
			b = b[1]


		@indented = [a,b]
		@indentation ||= a and b ? AST.Indentation.new(a,b) : AST.INDENT
		self

	def prebreak term = '\n'

		console.log "prebreak!!!!"
		@prebreak = @prebreak or term
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
			@cache = nil # hmm, removing the cache WARN
		self


	def predeclare
		if @cache
			scope__.vars.swap(@cache:var,self)
		self


	def alias
		nil

	def warn text, opts = {}


		opts:message = text
		opts:loc ||= loc
		scope__.root.warn opts
		self

	def c o
		if @cache && @cache:cached
			@cache:lookups++
			if @cache:uses == @cache:lookups
				@cache:var.free




			return @cache:var.c

		STACK.push(self)
		forceExpression if o && o:expression

		if o and o:indent

			@indentation ||= AST.INDENT


		var out = js(STACK,o)

		var paren = shouldParenthesize
		
		if var indent = @indentation
			out = indent.wrap(out,o)

		if paren

			if out isa Array
				out = "({out})"
			else
				out = out.parenthesize

		if o and o:braces
			out = '{' + out + '}'




		STACK.pop(self)

		if @cache


			out = "{@cache:var.c}={out}" unless @cache:manual
			var par = STACK.current
			out = out.parenthesize if par isa AST.Access || par isa AST.Op # others?
			@cache:cached = yes

		if @temporary && @temporary:length
			@temporary.map do |temp| 

				temp.decache




		return out

class AST.Expression < AST.Node

class AST.ValueNode < AST.Node
	prop value

	def initialize value
		@value = load(value)

	def load value
		value

	def js
		value.c

	def visit
		@value.traverse if @value && @value:traverse
		self

	def region
		@value:_region

class AST.Statement < AST.ValueNode

	def isExpressable
		return no
		
	def statement
		return true


class AST.Meta < AST.ValueNode

class AST.Comment < AST.Meta

	def c o
		if o and o:expression or @value.match(/\n/) # multiline?
			"/*{value.c}*/"
		else
			"// {value.c}"


class AST.Terminator < AST.Meta

	def c
		return @value

		v # .split()


class AST.Newline < AST.Terminator

	def initialize v
		@value = v or '\n'

	def c
		@value
		


class AST.Index < AST.ValueNode

	def js
		@value.c

class AST.NewLines < AST.ValueNode

	def js
		@value

	def isExpressable
		yes

class AST.ListNode < AST.Node

	prop nodes

	def initialize list = [], options = {}
		@nodes = load(list)
		@options = options
	

	def list
		@nodes

	def compact
		@nodes = @nodes.compact
		self

	def load list
		list

	def concat other

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
		nodes.unshift(AST.BR) if br
		nodes.unshift(item)
		self


	def slice a, b
		self:constructor.new(@nodes.slice(a,b))

	def add item
		push(item)
		self

	def break br, pre = no



		br = AST.Terminator.new(br) if typeof br == 'string' # hmmm?
		pre ? unshift(br) : push(br)
		self

	def some cb
		nodes.some(cb)

	def every cb
		nodes.every(cb)

	def filter cb
		if cb:prototype isa AST.Node
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
		



	def last
		var i = @nodes:length
		while i
			i = i - 1
			var v = @nodes[i]
			return v unless v isa AST.Meta
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

		var express = delim != ';'
		var shouldDelim = no
		var nodes = nodes.compact
		var last = last
		var realLast = nodes[nodes:length - 1]


		var parts = nodes.map do |arg| 
			var out = arg.c(expression: express)








			if arg isa AST.Meta
				true


			else


				out = out + delim if !express or arg != last
			out

		return parts.join("")













		

class AST.ArgList < AST.ListNode

	def hasSplat
		list.some do |v| v isa AST.Splat

	def delimiter
		","
















class AST.AssignList < AST.ArgList	




	def concat other
		if @nodes:length == 0 and other isa AST.AssignList

			return other
		else
			super


		self




class AST.Block < AST.ListNode	
	
	prop head

	def self.wrap ary

		ary:length == 1 && ary[0] isa AST.Block ? ary[0] : AST.Block.new(ary)







	def visit


		if @prebreak # hmm

			console.log "PREBREAK IN AST.BLOCK SHOULD THROW"
			first and first.prebreak(@prebreak)
		super
		
	def push item, sep











		nodes.push(item)
		self

	def block
		self

	def loc
		if var opt = option(:ends)

			var a = opt[0].loc
			var b = opt[1].loc

			p "no loc for {opt[0]}" unless a
			p "no loc for {opt[1]}" unless b

			[a[0],b[1]]
		else
			[0,0]

	def initialize expr = []
		self.nodes = expr.flatten.compact or []



	def unwrap
		var ary = []
		for node,i in nodes
			if node isa AST.Block

				ary:push.apply(ary,node.unwrap)
			else
				ary.push(node)
		return ary



	def compile o = {}
		var root = AST.Root.new(self,o)
		root.compile(o)


	def analyze o = {}

		self

	def js o, opts
		var l = nodes:length

		var filter = (|n| n != null && n != undefined && n != AST.EMPTY)
		var ast = nodes.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		var express = isExpression or o.isExpression or (option(:express) and isExpressable)
		return null if ast:length == 0



		if express
			return super(o,delim: ',', nodes: ast)




		var compile = do |node,i|
			var out = node ? node.c : ""
			return null if out == ""


			if out isa Array

				out = out.flatten.compact.filter(filter).join(";\n")

			var hasSemiColon = out.match(/;(\s*\/\/.*)?[\n\s\t]*$/) # out[out:length - 1] == ";"

			out += ";" unless hasSemiColon or node isa AST.Meta
			




			return out

		ast = ast.map(compile)


		if @head
			var prefix = []
			@head.forEach do |item|
				var out = compile(item)
				prefix.push(out + '\n') if out

			ast = prefix.concat(ast)



		ast = ast.compact.filter(filter).join("") # .replace(/[\s\n]+$/,'')  # hmm really?




	def defers original, replacement
		var idx = nodes.indexOf(original)
		nodes[idx] = replacement if idx >= 0

		replacement.@prebreak ||= original.@prebreak # hacky
		var rest = nodes.splice(idx + 1)
		return rest

	def consume node
		if node isa AST.TagTree # special case?!?


			nodes = nodes.map(|child| child.consume(node))

			nodes = [AST.Arr.new(nodes)] if nodes:length > 1
			

			return self


		if var before = last
			var after = before.consume(node)
			if after != before
				

				replace(before,after)

		return self
		
	def isExpressable
		return no unless nodes.every(|v| v.isExpressable )
		return yes

	def isExpression
		option(:express) || super.isExpression


class AST.VarBlock < AST.ListNode





	def addExpression expr


		if expr isa AST.Assign
			addExpression(expr.left) # make sure this is a valid thing?



			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)

		elif expr isa AST.VarOrAccess

			push(AST.VarReference.new(expr.value))

		elif expr isa AST.Splat && expr.node isa AST.VarOrAccess

			expr.value = AST.VarReference.new(expr.node.value)
			push(expr)
		else
			throw "VarBlock does not allow non-variable expressions"
		self

	def isExpressable


		no

	def js o
		var code = nodes.map do |node| node.c
		code = code.flatten.compact.filter(|n| n != null && n != undefined && n != AST.EMPTY)
		return "var {code.join(",")}"

	def consume node



		return self


class AST.Parens < AST.ValueNode

		
	def js o
		var par = up


		if par isa AST.Block
			@noparen = yes unless o.isExpression
			return value.c(expression: o.isExpression)
		else
			value.c(expression: yes)









	def shouldParenthesize


		return no if @noparen #  or par isa AST.ArgList
		return yes

	def prebreak br
		super(br)

		@value.prebreak(br) if @value
		self

	def isExpressable
		value.isExpressable

	def consume node
		value.consume(node)




class AST.ExpressionBlock < AST.ListNode

	def visit

		map(|item| item.traverse)
		self
		
	def c
		map(|item| item.c).join(",")




	def consume node
		value.consume(node)

	def addExpression expr



		if expr.node isa AST.Assign

			push(expr.left)


			return AST.TupleAssign.new('=',AST.Tuple.new(nodes),expr.right)
		else
			push(expr)
		self


		
		

