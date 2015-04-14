
class AST.Assign < AST.Op

	def isExpressable
		!right || right.isExpressable

	def isUsed
		if up isa AST.Block && up.last != self # hmm
			return no 
		return yes

	def js o

		unless right.isExpressable
			return right.consume(self).c

		# p "assign left {left:contrstru}"
		var l = left.node

		# We are setting self(!)
		# TODO document functionality
		if l isa AST.Self
			var ctx = scope__.context
			l = ctx.reference


		if l isa AST.PropertyAccess
			var ast = CALL(OP('.',l.left,l.right.setter),[right])
			ast.receiver = l.receiver

			if isUsed
				# dont cache it again if it is already cached(!)
				right.cache(type: 'val', uses: 1) unless right.cachevar # 
				ast = AST.Parens.new([ast,right].block)

			# should check the up-value no?
			return ast.c(expression: yes)

		# FIXME -- does not always need to be an expression?
		var out = "{l.c} {op} {right.c(expression: true)}"

		return out

	def shouldParenthesize
		up isa AST.Op && up.op != '='


	def consume node
		if isExpressable
			forceExpression
			return super

		var ast = right.consume(self)
		return ast.consume(node)


class AST.PushAssign < AST.Assign

	def js
		"{left.c}.push({right.c})"

	def consume node
		return self


class AST.ConditionalAssign < AST.Assign

	def consume node
		normalize.consume(node)

	def normalize
		var l = left.node
		var ls = l

		if l isa AST.Access
			# p "conditional-assign {l} {l.left} {l.right}"
			if l.left # hmm
				# p "cache l.left {l.left:constructor}̋"
				l.left.cache 
			ls = l.clone(l.left,l.right) # this should still be cached?
			l.cache if l isa AST.PropertyAccess # correct now, to a certain degree
			if l isa AST.IndexAccess
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
			OP('==',left,AST.NULL)
		elif op == '||='
			OP('!',left)
		elif op == '&&='
			left
		elif op == '!?='
			OP('!=',left,AST.NULL)
		else
			left
		
	def js
		# p "ConditionalAssign.js".red
		var ast = IF(condition, OP('=',left,right), left)
		ast.toExpression if ast.isExpressable
		return ast.c

class AST.CompoundAssign < AST.Assign

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
		unless ln isa AST.PropertyAccess
			return self

		if ln isa AST.Access
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
		if up isa AST.Block
			# p "parent is block, should replace!"
			# an alternative would be to just pass
			up.replace(self,ast)
		ast.c


class AST.AsyncAssign < AST.Assign

	# this will transform the tree by a decent amount.
	# Need to adjust Block to allow this


class AST.TupleAssign < AST.Assign

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
		if right isa AST.Tuple
			right.push(expr)
		else
			# p "making child become a tuple?"
			self.right = AST.Tuple.new([right,expr])
		
		return self

	def visit
		# if the first left-value is a var-reference, then
		# all the variables should be declared as variables.
		# but if we have complex items in the other list - it does become much harder

		# if the first is a var-reference, they should all be(!) .. or splats?
		# this is really a hacky wao to do it though
		if left.first.node isa AST.VarReference
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

		var ast = AST.Block.new
		var lft = self.left
		var rgt = self.right
		var typ = self.type
		var via = nil

		var li = 0
		var ri = lft.count
		var llen = ri



		# if we have a splat on the left it is much more likely that we need to store right
		# in a temporary array, but if the right side has a known length, it should still not be needed
		var lsplat = lft.filter(|v| v isa AST.Splat )[0]

		# if right is an array without any splats (or inner tuples?), normalize it to tuple
		rgt = AST.Tuple.new(rgt.nodes) if rgt isa AST.Arr && !rgt.splat
		var rlen = rgt isa AST.Tuple ? rgt.count : nil

		# if any values are statements we need to handle this before continuing

		### a,b,c = 10,20,ary ###
		# ideally we only need to cache the first value (or n - 1), assign directly when possible.
		# only if the variables are not predefined or predeclared can be we certain that we can do it without caching
		# if rlen && typ == 'var' && !lsplat
		# 	# this can be dangerous in edgecases that are very hard to detect
		# 	# if it becomes an issue, fall back to simpler versions
		# 	# does not even matter if there is a splat?

		# special case for arguments(!)
		if !lsplat && rgt == AST.ARGUMENTS

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
			# 	if v isa AST.VarReference
			# 		p "left side {i} {v} {v.refnr}"

			# rgt.map do |v,i|
			# 	if v.hasSideEffects
			# 		# return if i == 0 or !v.hasSideEffects
			# 		# return if v isa AST.Num || v isa AST.Str || i == 0
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
				# if l isa AST.VarReference
				# 	# this is the first time the variable is referenced
				# 	# should also count even if it is predeclared at the top
				# 	if l.refnr == 0

				if l == lsplat
					v = []
					var to = (rlen - (ri - i))
					# p "assing splat at index {i} to slice {li} - {to}".cyan
					v.push(rgt.index(li++)) while li <= to
					v = AST.Arr.new(v)
					# ast.push OP('=',l.node,AST.Arr.new(v))
				else
					v = rgt.index(li++) # OP('.',rgt.index(li++),idx.toAST)
				[l.node,v]

				# if l isa AST.VarReference && l.refnr 
			var clean = true
			
			pairs.map do |v,i|
				var l = v[0]
				var r = v[1]

				if clean
					if l isa AST.VarReference && l.refnr == 0
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
			var top = AST.VarBlock.new
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
			# ast.push(blk = AST.VarBlock.new)
			# blk = nil
			
			var blktype = typ == 'var' ? AST.VarBlock : AST.Block
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
						var arr = util.array(OP('-',len,(i + rem).toAST ),yes)
						top.push(arr)
						lvar = arr.cachevar
					else
						ast.push(blk = blktype.new) unless blk
						var arr = util.array( OP('-',len,(i + rem).toAST ) )
						blk.push(OP('=',lvar,arr))

					# if !lvar:variable || !lvar.variable # lvar = 
					# 	top.push()
					#	p "has variable - no need to create a temp"
					# blk.push(OP('=',lvar,AST.Arr.new([]))) # dont precalculate size now
					# max = to = (rlen - (llen - i))
					
					 
					var test = rem ? OP('-',len,rem) : len
					# get = OP('.',lvar,OP('-',idx,i.toAST))
					var set = OP('=',
						OP('.',lvar,OP('-',idx,i.toAST)),
						OP('.',iter,OP('++',idx))
					)

					ast.push(WHILE(OP('<',idx,test), set))

					if typ != 'var'
						ast.push(blk = AST.Block.new) 
						blk.push(OP('=',l.node,lvar))
					else
						blk = nil

					# not if splat was last?
					# ast.push(blk = AST.VarBlock.new)

				elif lsplat
					ast.push(blk = blktype.new) unless blk
					# we could cache the raw code of this node for better performance
					blk.push(OP('=',l,OP('.',iter,OP('++',idx))))
				else
					ast.push(blk = blktype.new) unless blk
					blk.push(OP('=',l,OP('.',iter,i.toAST)))


		if ast.isExpressable # NO!
			var out = ast.c(expression: yes)
			out = "{typ} {out}" if typ
			return out
		else
			return ast.c





