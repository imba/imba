

class AST.Call < AST.Expression

	prop callee
	prop receiver
	prop args
	prop block

	def initialize callee, args, opexists
		# some axioms that share the same syntax as calls will be redirected from here
		
		if callee isa AST.VarOrAccess
			var str = callee.value.symbol
			# p "AST.Call callee {callee} - {str}"
			if str == 'extern'
				# p "returning extern instead!"
				return AST.ExternDeclaration.new(args)
			if str == 'tag'
				# console.log "ERROR - access args by some method"
				return AST.TagWrapper.new(args and args:index ? args.index(0) : args[0]) # hmmm
			if str == 'export'
				return AST.ExportStatement.new(args) # hmmm

		@callee = callee
		@args = args or AST.ArgList.new([]) # hmmm

		if args isa Array
			@args = AST.ArgList.new(args)
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
		@receiver ||= (callee isa AST.Access && callee.left || AST.NULL)

	# check if all arguments are expressions - otherwise we have an issue

	def safechain
		callee.safechain # really?

	def c
		super

	def js
		var opt = expression: yes
		var rec = null
		var args = self.args.compact
		var splat = args.some do |v| v isa AST.Splat
		var out = nil
		var lft = nil
		var rgt = nil
		var wrap = nil

		var callee = @callee = @callee.node # drop the var or access?

		# p "{self} - {@callee}"

		if callee isa AST.Call && callee.safechain
			# p "the outer call is safechained"
			yes
			# we need to specify that the _result_ of

		if callee isa AST.Access
			lft = callee.left
			rgt = callee.right

		if callee isa AST.Super or callee isa AST.SuperAccess
			@receiver = scope__.context
			# return "supercall"

		# never call the property-access directly?
		if callee isa AST.PropertyAccess # && rec = callee.receiver
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
			# if lft isa AST.Call
			# if lft isa AST.Call # could be a property access as well - it is the same?
			# if it is a local var access we simply check if it is a function, then call
			# but it should be safechained outside as well?
			lft.cache if lft
			# the outer safechain should not cache the whole call - only ask to cache
			# the result? -- chain onto
			# p "Call safechain {callee} {lft}.{rgt}"
			var isfn = AST.Util.IsFunction.new([callee])
			wrap = ["{isfn.c} && ",""]

		# if callee.right
		# if calle is PropertyAccess we should convert it first
		# to keep the logic in call? 
		# 

		# if 

		# should just force expression from the start, no?
		if splat
			# important to wrap the single value in a value, to keep implicit call
			# this is due to the way we check for an outer AST.Call without checking if
			# we are the receiver (in PropertyAccess). Should rather wrap in CallArguments
			var ary = (args.count == 1 ? AST.ValueNode.new(args.first.value) : AST.Arr.new(args.list))
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



		
class AST.ImplicitCall < AST.Call

	def js
		"{callee.c}()"



class AST.New < AST.Call

	def js o
		# 
		var out = "new {callee.c}"
		# out = out.parenthesize if o.parent isa AST.Access # hmm?
		out += '()' unless o.parent isa AST.Call
		out
		# "{callee.c}()"



class AST.SuperCall < AST.Call

	def js o
		var m = o.method
		self.receiver = AST.SELF
		self.callee = "{m.target.c}.super$.prototype.{m.name.c}"
		super



class AST.ExternDeclaration < AST.ListNode

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
		
		