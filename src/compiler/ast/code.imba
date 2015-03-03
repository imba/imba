
### Code ###
# A function definition. This is the only node that creates a new real Scope.
# When for the purposes of walking the contents of a function body, the Code
# has no *children* -- they're within the inner scope.

class AST.Code < AST.Node

	prop head
	prop body
	prop scope
	prop params

	def scopetype
		AST.Scope

	def visit
		@scope.visit if @scope
		# @scope.parent = STACK.scope(1) if @scope
		self

# Rename to Program?
class AST.Root < AST.Code

	def initialize body, opts
		# p "create root!"
		self.body = body.block
		self.scope = AST.FileScope.new(self,null)

	def visit
		scope.visit
		body.traverse

	def compile
		traverse
		return c

	def js
		'(function(){\n' + scope.c + '\n}())'

	def analyze
		# STACK.loglevel = 0
		traverse
		return scope.dump

	def inspect
		true

class AST.ClassDeclaration < AST.Code

	prop name
	prop superclass
	prop initor

	def initialize name, superclass, body
		# what about the namespace?
		@name = name
		@superclass = superclass
		@scope = AST.ClassScope.new(self)
		@body = body.block

	def visit
		# replace with some advanced lookup?
		scope.visit

		if option(:local)
			self.name = scope.parent.register(name,self)

		body.traverse

	def js
		scope.context.value = name

		# should probably also warn about stuff etc
		if option(:extension)
			return body.c

		var initor = body.pluck do |c| c isa AST.MethodDeclaration && c.type == :constructor
		var sup = superclass
		# ns = (name isa AST.Const ? nil : name.context)

		# FIXME this is buggy as hell
		if name.c in ['String','Array','Window']
			initor = no
		else
			if sup && !initor
				initor = AST.inline("""
					def initialize
						{sup.c}.apply(this,arguments)
				""").first
				initor.type = :constructor
				# initor.traverse
				# p "initor {initor} {initor}"
			else
				initor ||= FN([],[AST.SELF]) # should not be needed
		# if there is no initor, we need to spawn a fake one

		var head = []
		# ast = body
		if initor
			var cname = name isa AST.Access ? name.right : name
			initor.name = cname

			
			# does not work if namespaced?!?
			if option(:local)
				# set local variable-def here, no?
				head.push(initor)
				head.push(CALL(AST.CLASSDEF,[name,sup]))
				# body.unshift(CALL(AST.CLASSDEF,[name,sup]))
				# body.unshift(initor)
				# decl = CALL(AST.CLASSDEF,[initor,sup])
			else
				var decl = OP('=',name,CALL(AST.CLASSDEF,[initor,sup]))
				head.push(decl)

			if option(:export)
				head.push("exports.{name.c} = {name.c}")
				
			# call var in front, no?
			# decl = CALL(AST.CLASSDEF,[initor,sup])
		body.unshift(part) for part in head.reverse

		return body.c

# class AST.TagTypeRef < AST.ValueNode
# 
# 	def toConst
# 		@const ||= value.c.replace(/\:/g,'_').toSymbol
		

class AST.TagDeclaration < AST.Code

	prop name
	prop superclass
	prop initor

	def initialize name, superclass, body
		# what about the namespace?
		# @name = AST.TagTypeRef.new(name)
		@name = name
		@superclass = superclass
		@scope = AST.TagScope.new(self)
		@body = (body || []).block

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
		var sup =  superclass and "," + superclass.func.quoted or ""

		var out = if name.id
			"Imba.defineSingletonTag('{name.id}',function {name.func}(d)\{this.setDom(d)\}{sup})"
		else
			"Imba.defineTag('{name.func}',function {name.func}(d)\{this.setDom(d)\}{sup})"

		# if the body is empty we can return this directly
		if body.count == 0
			return out

		# create closure etc
		# again, we should really use the included system
		# FIXME should consolidate the way we generate all code - this
		# is going down a route of more direct conversion, which is less
		# flexible.
		out = "var tag = {out};"
		scope.context.value = AST.Const.new('tag')
		out += "\n{body.c}"
		return '(function()' + out.wrap + ')()'

class AST.Func < AST.Code

	prop name
	prop params
	prop target
	prop options
	prop type
	prop context

	def scopetype do AST.FunctionScope

	def initialize params, body, name, target, options
		# p "INIT Function!!",params,body,name
		var typ = scopetype
		@scope ||= typ.new(self)
		@scope.params = @params = AST.ParamList.new(params)
		@body = body.block
		@name = name || ''
		@target = target
		@options = options
		@type = :function
		self

	def visit
		scope.visit
		@context = scope.parent
		@params.traverse
		@body.traverse # so soon?
		

	def js o
		body.consume(AST.ImplicitReturn.new)
		var code = scope.c
		# args = params.map do |par| par.name
		# head = params.map do |par| par.c
		# code = [head,body.c(expression: no)].flatten.compact.join("\n").wrap
		# FIXME creating the function-name this way is prone to create naming-collisions
		# will need to wrap the value in a FunctionName which takes care of looking up scope
		# and possibly dealing with it
		var name = self.name.c.replace(/\./g,'_')
		var out = "function {name}({params.c})" + code.wrap
		# out = out.parenthesize if isExpression
		return out

	def shouldParenthesize
		up isa AST.Call && up.callee == self
		# if up as a call? Only if we are 

class AST.Lambda < AST.Func
	def scopetype do AST.LambdaScope
# MethodDeclaration
# Create a shared body?

class AST.MethodDeclaration < AST.Func

	prop variable

	def scopetype do AST.MethodScope

	def visit
		if name.toSymbol == 'initialize'
			self.type = :constructor

		if body:expressions
			set(greedy: true)
			# p "BODY EXPRESSIONS!! This is a fragment"
			var tree = AST.TagTree.new
			@body = body.consume(tree)
			# body.nodes = [AST.Arr.new(body.nodes)] # hmm

		scope.visit
		@context = scope.parent
		@params.traverse

		if target isa AST.Self
			@target = @scope.parent.context
			set(static: yes)

		if context isa AST.ClassScope
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
		unless type == :constructor
			if option(:greedy)
				# haaack
				body.consume(AST.GreedyReturn.new)
			else
				body.consume(AST.ImplicitReturn.new) 
		var code = scope.c

		var name = self.name.c.replace(/\./g,'_') # WHAT?
		var foot = []

		var left = ""
		var func = "({params.c})" + code.wrap
		var target = self.target
		var decl = !option(:global) and !option(:export)

		if target isa AST.ScopeContext
			# the target is a scope context
			target = nil # hmm -- 

		var ctx = context
		var out = ""
		# if ctx 



		var fname = self.name.toSymbol
		var fdecl = fname # decl ? fname : ''

		if ctx isa AST.ClassScope and !target
			if type == :constructor
				out = "function {fname}{func}"
			elif option(:static)
				out = "{ctx.context.c}.{fname} = function {func}"
			else
				out = "{ctx.context.c}.prototype.{fname} = function {func}"

		elif ctx isa AST.FileScope and !target
			# register method as a root-function, but with auto-call? hmm
			# should probably set using variable directly instead, no?
			out = "function {fdecl}{func}"

		elif target and option(:static)
			out = "{target.c}.{fname} = function {func}"

		elif target
			# hmm
			out = "{target.c}.prototype.{fname} = function {func}"
		# elif option(:global)
		# 	out = "{fname} = function {func}"
		else
			out = "function {fdecl}{func}"

		if option(:global)
			out = "{fname} = {out}"

		if option(:export)
			out = "{out}; exports.{fname} = {fname};"

		out


class AST.TagFragmentDeclaration < AST.MethodDeclaration


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

class AST.PropertyDeclaration < AST.Expression

	prop name
	prop options

	def initialize name, options
		@name = name
		@options = options || AST.Obj.new([])

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
			setter: "set-{key}".toSymbol
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
			tpl = propWatchTemplate unless pars:watch isa AST.Bool and !pars:watch.truthy
			var wfn = "{key}DidSet"

			if pars:watch isa AST.Symbol
				wfn = pars:watch
			elif pars:watch isa AST.Bool
				o.key(:watch).value = AST.Symbol.new("{key}DidSet")

			# should check for the function first, no?
			# HACK
			# o.key(:watch).value = AST.Symbol
			var fn = OP('.',AST.This.new,wfn)
			js:ondirty = OP('&&',fn,CALL(fn,['v','a',"this.__{key}"])).c # CALLSELF(wfn,[]).c
			# js:ondirty = "if(this.{wfn}) this.{wfn}(v,a,this.__{key});"

		if o.key(:dom) or o.key(:attr)
			js:set = "this.setAttribute('{key}',v)"
			js:get = "this.getAttribute('{key}')"

		# if we have a delegate
		elif o.key(:delegate)
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
		
		# if o.key(:v)
		return out

#		if scope isa AST.TagScope
#			# p "IS TAGSCOPE {options.key(:dom)}"
#			if options.key(:dom)
#				js:set = "this.setAttribute('{key}',v)"
#				js:get = "this.getAttribute('{key}')"
#				js:init = "{scope}.dom.setAttribute('{key}',{deflt.value.c})" if deflt
#
#		# if o.key(:watch)
#		# 	var js = propWithWatch.replace(/PROP/g,key).replace(/SETTER/,setjs)
#		# 	return js
#
#			# var js = '''function(v){ var a = this.PROP(); a != v ? }'
#
#		if scope isa AST.TagScope
#			# p "IS TAGSCOPE {options.key(:dom)}"
#			if options.key(:dom)
#				gets = "getAttribute('{key}')"
#				sets = "setAttribute('{key}',v)"
#				init = "self.dom.setAttribute('{key}',{deflt.value.c})" if deflt
#
#			# getter = "def {name.c} v do v !== undefined ? ({name.c} = v,self) : @{name.c}"
#			ast = AST.inline """
#				def {key} do arguments:length ? ({key} = arguments[0],self) : {gets}	
#				def {key}= v do return ({sets},self)		
#				{init}	
#			"""
#		else
#			var getter = "def {key} do {gets}"
#
#			if options.key(:getset)
#				getter = "def {key} do arguments:length ? ({key} = arguments[0],self) : {gets}"
#
#			ast = AST.inline """
#				{getter}	
#				def {key}= v do return ({sets},self)	
#				{deflt ? "self:prototype.@{key} = {deflt.value.c}" : ""}
#			"""


		# if options.key(:default)


		ast.traverse.c


