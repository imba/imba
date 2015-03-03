
# handles local variables, self etc. Should create references to outer scopes
# when needed etc.

# should move the whole context-thingie right into scope
class AST.Scope

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
		@vars = AST.VariableDeclaration.new([])
		@counter = 0
		@varmap = {}
		@varpool = []

	def context
		@context ||= AST.ScopeContext.new(self)

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

	def root
		var scope = self
		while scope
			return scope if scope isa AST.FileScope
			scope = scope.parent
		return nil

	def register name, decl = nil, o = {}

		# FIXME re-registering a variable should really return the existing one
		# Again, here we should not really have to deal with system-generated vars
		# But again, it is important

		# p "registering {name}"
		name = name.toSymbol # hmm?

		# also look at outer scopes if this is not closed?
		var existing = @varmap.hasOwnProperty(name) && @varmap[name]
		return existing if existing

		var item = AST.Variable.new(self,name,decl,o)
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
		var item = AST.SystemVariable.new(self,name,refnode,o)
		@varpool.push(item) # WHAT? It should not be in the pool unless explicitly put there?
		@vars.push(item) # WARN variables should not go directly into a declaration-list
		return item
		# return register(name || "__",nil,system: yes, temporary: yes)

	def declare name, init = null, options = {}
		# if name isa AST.Variable
		# p "SCOPE declare var".green
		name = name.toSymbol
		@vars.add(name,init) # .last
		var decl = @vars.last
		# item = AST.Variable.new(self,name,decl)
		var item = AST.Variable.new(self,name,decl,options)
		decl.variable = item
		item.resolve
		# if this is a system-variable 

	def lookup name
		var ret = null
		# p 'lookup variable!',name.toSymbol
		if @varmap.hasOwnProperty(name.toSymbol)
			ret = @varmap[name.toSymbol] 
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
			return scope if scope isa AST.ClassScope
		return nil

	def c
		# need to fix this
		var body = node.body.c(expression: no)
		var head = [@vars,@params].block.c(expression: no)
		# p "head from scope is {head}"
		[head or nil,body].flatten.compact.join("\n")

	def dump
		var vars = Object.keys(@varmap).map do |k| 
			var v = @varmap[k]
			v.references.count ? v.dump : nil

		return \
			type: self:constructor:name
			level: (level or 0)
			vars: vars.compact
			loc: node.body.loc

	def toString
		"{self:constructor:name}"
		
# FileScope is wrong? Rather TopScope or ProgramScope
class AST.FileScope < AST.Scope

	prop warnings
	prop scopes

	def initialize
		super

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
		@context ||= AST.RootScopeContext.new(self)

	def lookup name
		# p "lookup filescope"
		@varmap[name.toSymbol] if @varmap.hasOwnProperty(name.toSymbol)

	def visit
		STACK.addScope(self)
		self

	def helper typ, value
		# log "add helper",typ,value
		@helpers.push(value) if @helpers.indexOf(value) == -1
		return self

	def c
		# need to fix this
		# var helpers = helpers.c(expression: no)
		var body = node.body.c(expression: no)
		var head = [@params,@vars].block.c(expression: no)
		# p "head from scope is {head}"
		[head or nil,@helpers or nil,body].flatten.compact.join("\n")

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
			warnings: @warnings.dump
			scopes: scopes

		return obj
		


class AST.ClassScope < AST.Scope

class AST.TagScope < AST.ClassScope

class AST.ClosureScope < AST.Scope

class AST.FunctionScope < AST.Scope

class AST.MethodScope < AST.Scope

	def isClosed
		yes

class AST.LambdaScope < AST.Scope

	def context

		# when accessing the outer context we need to make sure that it is cached
		# so this is wrong - but temp okay
		@context ||= parent.context.reference(self)

class AST.FlowScope < AST.Scope

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

class AST.CatchScope < AST.FlowScope

class AST.WhileScope < AST.FlowScope

class AST.ForScope < AST.FlowScope

# lives in scope
class AST.Variable < AST.Node

	prop scope
	prop name
	prop alias
	prop type
	prop options
	prop declarator
	prop autodeclare
	prop references

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
		# @declarators = [] # not used now
		@references = [] # should probably be somewhere else, no?


	def resolve
		return self if @resolved

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
			@c = (alias or name).c
			# allow certain reserved words
			# should warn on others though (!!!)
			@c = "{c}$" if AST.RESERVED_REGEX.test(@c) # @c.match(/^(default)$/)
		return @c

	# variables should probably inherit from node(!)
	def consume node
		# p "variable assignify!!!"
		return self

	# this should only generate the accessors - not dael with references
	def accessor ref
		var node = AST.LocalVarAccess.new(".",null,self) # this is just wrong .. should not be a regular accessor
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
		# if scope isa AST.WhileScope
		# 	p "should do different autodeclare!!"
		# 	# or we should simply add them

		scope.vars.push(self) # only if it does not exist here!!!
		set(declared: yes)
		self

	def toSymbol
		name


	def dump typ
		{
			type: type
			name: name
			refs: @references.dump(typ)
		}
		
class AST.SystemVariable < AST.Variable

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


class AST.ScopeContext < AST.Node

	prop scope
	prop value

	def initialize scope, value
		@scope = scope
		@value = value
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
		@reference ||= scope.declare("self",AST.This.new)

	def c
		var val = @value || @reference
		(val ? val.c : "this")

class AST.RootScopeContext < AST.ScopeContext

	def reference scope
		self

	def c o
		# should be the other way around, no?
		o and o:explicit ? super : ""
		
class AST.Super < AST.Node

	def c
		# need to find the stuff here
		# this is really not that good8
		var m = STACK.method
		var out = null
		var up = STACK.current
		var deep = up isa AST.Access

		# TODO optimization for later - problematic if there is a different reference in the end
		if false && m && m.type == :constructor
			out = "{m.target.c}.superclass"
			out += ".apply({m.scope.context.c},arguments)" unless deep
		else
			out = "{m.target.c}.prototype.__super"
			unless up isa AST.Access
				out += ".{m.supername.c}" 
				unless up isa AST.Call # autocall?
					out += ".apply({m.scope.context.c},arguments)" 
		out

