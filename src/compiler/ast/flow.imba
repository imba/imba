
var helpers = require './helpers'

class AST.ControlFlow < AST.Node



class AST.ControlFlowStatement < AST.ControlFlow

	def isExpressable
		no



class AST.If < AST.ControlFlow


	prop test
	prop body
	prop alt


	def addElse add
		# p "add else!",add
		if alt && alt isa AST.If
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
			out += " else {alt.c(alt isa AST.If ? {} : brace)}" if alt
			out


	def consume node
		# p 'assignify if?!'
		# if it is possible, convert into expression
		if node isa AST.TagTree
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



class AST.Loop < AST.Statement


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
		self.body = body.block
		self


	def c o
		# p "Loop.c - {isExpressable} {stack} {stack.isExpression}"
		# p "stack is expression? {o} {isExpression}"

		if stack.isExpression or isExpression
			# what the inner one should not be an expression though?
			# this will resut in an infinite loop, no?!?
			var ast = CALL(FN([],[self]),[])
			return ast.c o
		
		elif stack.current isa AST.Block
			# hmm - need to check more thoroughly
			# p "parent is a block!"
			super.c o
		else
			# p "Should never get here?!?"
			var ast = CALL(FN([],[self]),[])
			return ast.c o
			# need to wrap in function



class AST.While < AST.Loop


	prop test


	def initialize test, opts
		@test = test
		@scope = AST.WhileScope.new(self)
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

		if node isa AST.TagTree
			# WARN this is a hack to allow references coming through the wrapping scope 
			# will result in unneeded self-declarations and other oddities
			scope.context.reference
			return CALL(FN([],[self]),[])

		var reuse = no
		# WARN Optimization - might have untended side-effects
		# if we are assigning directly to a local variable, we simply
		# use said variable for the inner res
		# if reuse
		# 	resvar = scope.declare(node.left.node.variable,AST.Arr.new([]),proxy: yes)
		# 	node = null
		# 	p "consume variable declarator!?".cyan
		# else
		# declare the variable we will use to soak up results
		# p "Creating value to store the result of loop".cyan
		# TODO Use a special vartype for this?
		var resvar = scope.declare(:res,AST.Arr.new([]),system: yes)
		# WHAT -- fix this --
		@catcher = AST.PushAssign.new("push",resvar,null) # the value is not preset # what
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
class AST.For < AST.Loop


	def initialize o = {}
		@options = o
		@scope = AST.ForScope.new(self)


	def visit
		scope.visit
		declare
		# should be able to toggle whether to keep the results here already(!)
		body.traverse
		options[:source].traverse # what about awakening the vars here?


	def declare

		var src  = options:source
		var vars = options[:vars] = {}
		var oi   = options:index


		# var i = vars:index = oi ? scope.declare(oi,0) : util.counter(0,yes).predeclare

		if src isa AST.Range
			# p "range for-loop"
			vars:len = scope.declare('len',src.right) # util.len(o,yes).predeclare
			vars:index = scope.declare(options:name,src.left)
			vars:value = vars:index
		else			
			# vars:value = scope.declare(options:name,null,let: yes)
			var i = vars:index = oi ? scope.declare(oi,0, let: yes) : util.counter(0,yes).predeclare
			vars:source = util.iterable(src,yes).predeclare
			vars:len    = util.len(vars:source,yes).predeclare
			vars:value  = scope.declare(options:name,null,let: yes)
			vars:value.addReference(options:name) # adding reference!
			i.addReference(oi) if oi

		return self


	def consume node
		# p "Loop consume? {node}"
		# p "For.consume {node}".cyan
		return super if isExpressable

		# other cases as well, no?
		if node isa AST.TagTree
			# WARN this is a hack to allow references coming through the wrapping scope 
			# will result in unneeded self-declarations and other oddities
			# scope.parent.context.reference
			scope.context.reference
			return CALL(AST.Lambda.new([],[self]),[])
			

		var resvar = null
		var reuseable = node isa AST.Assign && node.left.node isa AST.LocalVarAccess

		# WARN Optimization - might have untended side-effects
		# if we are assigning directly to a local variable, we simply
		# use said variable for the inner res
		if reuseable
			resvar = scope.declare(node.left.node.variable,AST.Arr.new([]),proxy: yes)
			node = null
			# p "consume variable declarator!?".cyan
		else
			# declare the variable we will use to soak up results
			# p "Creating value to store the result of loop".cyan
			resvar = scope.declare(:res,AST.Arr.new([]),system: yes)

		# p "GOT HERE TO PUSH ASSIGN",AST.PushAssign
		@catcher = AST.PushAssign.new("push",resvar,null) # the value is not preset
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
		if src isa AST.Range
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



class AST.ForIn < AST.For


		
class AST.ForOf < AST.For

	def declare
		var vars = options:vars = {}

		var o = vars:source = scope.declare('o',options:source,system: true)
		var v = vars:value = scope.declare(options:index,null,let: yes) if options:index

		if options:own
			var i = vars:index  = scope.declare('i',0,system: true)
			var keys = vars:keys = scope.declare(:keys,AST.Util.keys(o.accessor),system: yes)
			var l = vars:len = scope.declare('l',AST.Util.len(keys.accessor),system: yes)
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



class AST.Begin < AST.Block


	def initialize body
		@nodes = body.block.nodes


	def shouldParenthesize
		isExpression # hmmm



class AST.Switch < AST.ControlFlowStatement


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

		"switch({source.c}) " + body.c.join("\n").wrap



class AST.SwitchCase < AST.ControlFlowStatement


	prop test
	prop body


	def initialize test, body
		@test = test
		@body = body.block


	def visit
		body.traverse


	def consume node
		body.consume(node)
		self


	def autobreak
		body.push(AST.BreakStatement.new) unless body.last isa AST.BreakStatement
		self


	def js
		@test = [@test] unless @test isa Array 
		var cases = @test.map do |item| "case {item.c}:"
		cases.join("\n") + body.c(indent: yes) # .indent



class AST.Try < AST.ControlFlowStatement


	prop body
	# prop ncatch
	# prop nfinally

	def initialize body, c, f
		@body = body.block
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



class AST.Catch < AST.ControlFlowStatement


	def initialize body, varname
		@body = body.block
		@scope = AST.CatchScope.new(self)
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


class AST.Finally < AST.ControlFlowStatement

	def initialize body
		@body = body.block


	def visit
		@body.traverse


	def consume node
		# swallow silently
		self


	def js
		"finally " + @body.c(braces: yes, indent: yes)

