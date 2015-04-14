
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
		'(function(){\n\n' + scope.c(indent: yes) + '\n\n}())'

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
		var cname = name isa AST.Access ? name.right : name
		var namespaced = name != cname
		var sup = superclass
		var initor = body.pluck do |c| c isa AST.MethodDeclaration && c.type == :constructor

		if !initor
			if sup
				initor = "function {cname.c}()\{ {sup.c}.apply(this,arguments) \}"
			else
				initor = "function {cname.c}()" + '{ }'
		
		else
			initor.name = cname
		
		# if we are defining a class inside a namespace etc -- how should we set up the class?
		var head = []

		if namespaced
			initor = "{name.c} = {initor.c}" # OP('=',name,initor) # hmm

		head.push("/* @class {cname.c} */\n{initor.c};\n\n")

		if sup
			# console.log "deal with superclass!"
			# head.push("// extending the superclass\nimba$class({name.c},{sup.c});\n\n")
			head.push(AST.Util.Subclass.new([name,sup]))

		# only if it is not namespaced
		if o:global and !namespaced # option(:global)
			head.push("global.{cname.c} = {name.c}; // global class \n")

		if o:export and !namespaced
			head.push("exports.{cname.c} = {name.c}; // export class \n")

		# FIXME
		# if namespaced and (o:local or o:export)
		# 	console.log "namespaced classes are implicitly local/global depending on the namespace"


		body.unshift(part) for part in head.reverse
		body.@indentation = nil
		var out = body.c

		return out

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

		# WARN should fix
		body.@indentation = nil

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

	def initialize params, body, name, target, o
		# p "INIT Function!!",params,body,name
		var typ = scopetype
		@scope ||= (o and o:scope) || typ.new(self)
		@scope.params = @params = AST.ParamList.new(params)
		@body = body.block
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
		body.consume(AST.ImplicitReturn.new) unless option(:noreturn)
		var code = scope.c(indent: yes, braces: yes)
		# args = params.map do |par| par.name
		# head = params.map do |par| par.c
		# code = [head,body.c(expression: no)].flatten.compact.join("\n").wrap
		# FIXME creating the function-name this way is prone to create naming-collisions
		# will need to wrap the value in a FunctionName which takes care of looking up scope
		# and possibly dealing with it
		var name = self.name.c.replace(/\./g,'_')
		var out = "function {name}({params.c})" + code
		out = "({out})()" if option(:eval)
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
		# prebreak # make sure this has a break?

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
		unless type == :constructor or option(:noreturn)
			if option(:greedy)
				# haaack
				body.consume(AST.GreedyReturn.new)
			else
				body.consume(AST.ImplicitReturn.new) 
		var code = scope.c(indent: yes, braces: yes)

		var name = self.name.c.replace(/\./g,'_') # WHAT?
		var foot = []

		var left = ""
		var func = "({params.c})" + code # .wrap
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
		@options = options || AST.Obj.new(AST.AssignList.new)

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
