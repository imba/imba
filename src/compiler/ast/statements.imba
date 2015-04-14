

class AST.Return < AST.Statement

	prop value

	def initialize v
		@value = v
		@prebreak = v and v.@prebreak # hmmm
		# console.log "return?!? {v}",@prebreak

		if v isa AST.ArgList
			v = v.nodes
			# @value = v:length > 1 ? AST.Arr.new(v) : v[0]

		if v isa Array
			@value = v:length > 1 ? AST.Arr.new(v) : v[0]

	def visit
		@value.traverse if @value && @value:traverse

	def js
		value ? "return {value.c(expression: yes)}" : "return"

	def c
		return super if !value or value.isExpressable
		# p "return must cascade into value".red
		value.consume(self).c

	def consume node
		return self

class AST.ImplicitReturn < AST.Return

	def c
		# hmm?
		value ? "return {value.c(expression: yes)}" : "return"

class AST.GreedyReturn < AST.ImplicitReturn

	def c
		# hmm?
		value ? "return {value.c(expression: yes)}" : "return"

# cannot live inside an expression(!)
class AST.Throw < AST.Statement

	def js
		"throw {value.c}"

	def consume node
		# ROADMAP should possibly consume to the value of throw and then throw?
		return self
		

class AST.LoopFlowStatement < AST.Statement

	prop literal
	prop expression

	def initialize lit, expr
		self.literal = lit
		self.expression = expr # && AST.ArgList.new(expr) # really?

	def visit
		expression.traverse if expression

	def consume node
		# p "break/continue should consume?!"
		self

	def c
		return super unless expression
		# get up to the outer loop
		var _loop = STACK.up(AST.Loop)
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
		

class AST.BreakStatement < AST.LoopFlowStatement
	def js do "break"

class AST.ContinueStatement < AST.LoopFlowStatement
	def js do "continue"

class AST.DebuggerStatement < AST.Statement

