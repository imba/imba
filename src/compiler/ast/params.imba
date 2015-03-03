class AST.Param < AST.Node

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
		

class AST.SplatParam < AST.Param

	def loc
		# hacky.. cannot know for sure that this is right?
		var r = name.region
		[r[0] - 1,r[1]]

class AST.BlockParam < AST.Param

	def c
		"blockparam"

	def loc
		# hacky.. cannot know for sure that this is right?
		var r = name.region
		[r[0] - 1,r[1]]


class AST.OptionalParam < AST.Param

class AST.NamedParam < AST.Param



class AST.RequiredParam < AST.Param


class AST.NamedParams < AST.ListNode

	prop index
	prop variable

	def load list
		var load = (|k| AST.NamedParam.new(k.key,k.value) )
		list isa AST.Obj ? list.value.map(load) : list

	def visit
		var s = scope__
		@variable ||= s.temporary(self, type: 'keypars')
		@variable.predeclared

		# this is a listnode, which will automatically traverse
		# and visit all children
		super
		# register the inner variables as well(!)
		self

	def name
		variable.c

	def js
		"namedpar"

class AST.IndexedParam < AST.Param

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


class AST.ArrayParams < AST.ListNode

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
		return nil unless list isa AST.Arr
		# p "loading arrayparams"
		# try the basic first
		unless list.splat
			list.value.map do |v,i|
				# must make sure the params are supported here
				# should really not parse any array at all(!)
				var name = v
				if v isa AST.VarOrAccess
					# p "varoraccess {v.value}"
					name = v.value.value
					# this is accepted
				parse(name,v,i)

	def parse name,child,i
		var param = AST.IndexedParam.new(name,nil)

		param.parent = self
		param.subindex = i
		param

	def head ast
		# "arrayparams"
		self

class AST.ParamList < AST.ListNode

	prop splat
	prop block

	def at index, force = no, name = nil
		if force
			add(AST.Param.new(count == index && name || "_{count}")) until count > index
			# need to visit at the same time, no?
		list[index]

	def visit
		@splat = filter(|par| par isa AST.SplatParam)[0]
		var blk = filter(AST.BlockParam)

		if blk.count > 1
			blk[1].warn "a method can only have one &block parameter"

		elif blk[0] && blk[0] != last
			blk[0].warn "&block must be the last parameter of a method"
			# warn "&block must be the last parameter of a method", blk[0]

		# add more warnings later(!)
		# should probably throw error as well to stop compilation

		# need to register the required-pars as variables
		super

	def js o
		return AST.EMPTY if count == 0
		return head(o) if o.parent isa AST.Block

		# items = map(|arg| arg.name.c ).compact
		# return null unless items[0]

		if o.parent isa AST.Code
			# remove the splat, for sure.. need to handle the other items as well
			# this is messy with references to argvars etc etc. Fix
			var pars = nodes
			# pars = filter(|arg| arg != @splat && !(arg isa AST.BlockParam)) if @splat
			pars = filter(|arg| arg isa AST.RequiredParam or arg isa AST.OptionalParam) if @splat
			pars.map(|arg| arg.name.c ).compact.join(",")
		else
			throw "not implemented paramlist js"
			"ta" + map(|arg| arg.c ).compact.join(",")

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
			if par isa AST.NamedParams
				signature.push('named')
				named = par
			elif par isa AST.OptionalParam 
				signature.push('opt')
				opt.push(par)
			elif par isa AST.BlockParam
				signature.push('blk')
				blk = par
			elif par isa AST.SplatParam
				signature.push('splat')
				splat = par
				idx -= 1 # this should really be removed from the list, no?
			elif par isa AST.ArrayParams
				arys.push(par)
				signature.push('ary')
			else
				signature.push('reg')
				reg.push(par)
			idx++

		if named
			var namedvar = named.variable

		# var opt = nodes.filter(|n| n isa AST.OptionalParam)
		# var blk = nodes.filter(|n| n isa AST.BlockParam)[0]
		# var splat = nodes.filter(|n| n isa AST.SplatParam)[0]

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
		if !named && !splat && !blk && opt.count > 0 && signature.join(" ").match(/opt$/)
			for par,i in opt
				ast.push "if({par.name.c} === undefined) {par.name.c} = {par.defaults.c}"

		# different shorthands
		elif named && !splat && !blk && opt.count == 0 # and no block?!
			# if named
			ast.push "if(!{namedvar.c}||{isntObj(namedvar.c)}) {namedvar.c} = \{\}"

		elif blk && opt.count == 1 && !splat && !named
			var op = opt[0]
			var opn = op.name.c
			var bn = blk.name.c
			ast.push "if({bn}==undefined && {isFunc(opn)}) {bn} = {opn},{opn} = {op.defaults.c}"

		elif blk && named && opt.count == 0 && !splat
			var bn = blk.name.c
			ast.push "if({bn}==undefined && {isFunc(namedvar.c)}) {bn} = {namedvar.c},{namedvar.c} = \{\}"
			ast.push "else if(!{namedvar.c}||{isntObj(namedvar.c)}) {namedvar.c} = \{\}"

		elif opt.count > 0 || splat # && blk  # && !splat

			var argvar = scope__.temporary(self, type: 'arguments').predeclared.c
			var len = scope__.temporary(self, type: 'counter').predeclared.c

			var last = "{argvar}[{len}-1]"
			var pop = "{argvar}[--{len}]"
			ast.push "var {argvar} = arguments, {len} = {argvar}.length"

			if blk
				var bn = blk.name.c
				if splat
					ast.push "var {bn} = {isFunc(last)} ? {pop} : null"
				elif reg.count > 0
					# ast.push "// several regs really?"
					ast.push "var {bn} = {len} > {reg.count} && {isFunc(last)} ? {pop} : null"
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


		elif opt.count > 0
			for par,i in opt
				ast.push "if({par.name.c} === undefined) {par.name.c} = {par.defaults.c}"

		# now set stuff if named params(!)

		if named
			for k,i in named.nodes
				var op = OP('.',namedvar,k.c.toAST).c
				ast.push "var {k.c} = {op} !== undefined ? {op} : {k.defaults.c}"

		if arys:length
			for v,i in arys
				# create tuples
				p "adding arrayparams"
				v.head(o,ast,self)
				# ast.push v.c
				


		# if opt:length == 0
		return ast.count > 0 ? (ast.join(";\n") + ";") : AST.EMPTY


# Legacy. Should move away from this?
class AST.VariableDeclaration < AST.ListNode

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
		var vardec = AST.VariableDeclarator.new(name,init)
		push vardec
		vardec
		# TODO (target) << (node) rewrites to a caching push which returns node

	# def remove item
	# 	if item isa AST.Variable
	# 		map do |v,i|
	# 			if v.variable == item
	# 				p "found variable to remove"
	# 				super.remove(v)
	# 	else
	# 		super.remove(item)
	# 	self
		
	
	def load list
		# temporary solution!!!
		list.map do |par| AST.VariableDeclarator.new(par.name,par.defaults,par.splat)

	def isExpressable
		list.every(|item| item.isExpressable)

	def js
		return AST.EMPTY if count == 0

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
		"var " + map(|arg| arg.c ).compact.join(", ") + ""

class AST.VariableDeclarator < AST.Param

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
		# FIXME need to deal with var-defines within other statements etc
		# FIXME need better syntax for this
		if defaults != null && defaults != undefined
			"{variable.c}={defaults.c(expression: yes)}"
		else
			"{variable.c}"

	def accessor
		self


# TODO clean up and refactor all the different representations of vars
# VarName, VarReference, LocalVarAccess?
class AST.VarName < AST.ValueNode

	prop variable
	prop splat

	def initialize a,b
		super
		@splat = b

	def visit
		p "visiting varname(!)", value.c
		# should we not lookup instead?
		self.variable ||= scope__.register(value.c,null)
		self.variable.declarator = self
		self.variable.addReference(value)
		self

	def js
		variable.c
		

class AST.VarList < AST.Node

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
					p "splat"
					if i == ll - 1
						v = util.slice(r,i)
						# v = CALL(OP('.',r,SYM('slice'.toAST),[i.toAST])
						p "last"
					else
						v = util.slice(r,i,-(ll - i) + 1)
						# v = CALL(OP('.',r,'slice'.toAST),[i.toAST,-(ll - i)])
					# v = OP('.',r,i.toAST)
				else
					v = OP('.',r,i.toAST)
				
				pairs.push(OP('=',l,v))

		else
			for l,i in left
				var r = right[i]
				pairs.push(r ? OP('=',l.variable.accessor,r) : l)

		return "var {pairs.c}"