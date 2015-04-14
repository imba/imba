
class AST.Await < AST.ValueNode

	prop func

	def js
		# introduce a util here, no?
		CALL(OP('.',AST.Util.Promisify.new([value]),'then').prebreak,[func]).c
		# value.c
	
	def visit o
		# things are now traversed in a somewhat chaotic order. Need to tighten
		# Create await function - push this value up to block, take the outer
		value.traverse

		var block = o.up(AST.Block) # or up to the closest FUNCTION?
		var outer = o.relative(block,1)
		var par = o.relative(self,-1)

		# p "Block {block} {outer} {par}"

		func = AST.AsyncFunc.new([],[])
		# now we move this node up to the block
		func.body.nodes = block.defers(outer,self)

		# if the outer is a var-assignment, we can simply set the params
		if par isa AST.Assign
			par.left.traverse
			var lft = par.left.node
			# p "Async assignment {par} {lft}"
			# Can be a tuple as well, no?
			if lft isa AST.VarReference
				# the param is already registered?
				# should not force the name already??
				# beware of bugs
				func.params.at(0,yes,lft.variable.name)
			elif lft isa AST.Tuple
				# if this an unfancy tuple, with only vars
				# we can just use arguments

				if par.type == 'var' && !lft.hasSplat
					# p "SIMPLIFY! {lft.nodes[0]}"
					lft.map do |el,i|
						func.params.at(i,yes,el.value)
				else
					# otherwise, do the whole tuple
					# make sure it is a var assignment?
					par.right = AST.ARGUMENTS
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

class AST.AsyncFunc < AST.Func

	def initialize params, body, name, target, options
		super

	def scopetype do AST.LambdaScope

	# need to override, since we wont do implicit returns
	# def js
	# 	var code = scope.c
	# 	return "function ({params.c})" + code.wrap
