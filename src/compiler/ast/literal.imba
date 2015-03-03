# Literals should probably not inherit from the same parent
# as arrays, tuples, objects would be better off inheriting
# from listnode.

class AST.Literal < AST.ValueNode
	
	# hmm
	def toString
		"" + value

	def hasSideEffects
		false
		

class AST.Bool < AST.Literal

	def cache
		self

	def truthy
		# p "bool is truthy? {value}"
		value == "true"
		# yes

class AST.True < AST.Bool

	def raw
		true
		
class AST.False < AST.Bool

	def raw
		false

class AST.Num < AST.Literal

	# def cache
	# 	self

	def toString
		"" + value

	def shouldParenthesize
		up isa AST.Access

	# def cache
	# 	p "cache num"
	# 	self

	def raw
		JSON.parse(value)

# should be quoted no?
# what about strings in object-literals?
# we want to be able to see if the values are allowed
class AST.Str < AST.Literal

	def raw
		# JSON.parse requires double-quoted strings,
		# while eval also allows single quotes. 
		# NEXT eval is not accessible like this
		# WARNING TODO be careful! - should clean up
		@raw ||= global.eval(value) # incredibly stupid solution

	def isValidIdentifier
		# there are also some values we cannot use
		raw.match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/) ? true : false


# Currently not used - it would be better to use this
# for real interpolated strings though, than to break
# them up into their parts before parsing
class AST.InterpolatedString < AST.ListNode

	def js
		"interpolated string"


class AST.Tuple < AST.ListNode

	def c
		# compiles as an array
		AST.Arr.new(nodes).c

	def hasSplat
		filter(|v| v isa AST.Splat )[0]

	def consume node
		if count == 1
			return first.consume(node)
		else
			throw "multituple cannot consume"
		
	
# Because we've dropped the Str-wrapper it is kinda difficult
class AST.Symbol < AST.Literal

	def isValidIdentifier
		raw.match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/) ? true : false

	def raw
		@raw ||= value.c.toSymbol

	def js
		"'{value.c.toSymbol}'"

class AST.RegExp < AST.Literal

	# def toString
	# 	"" + value

# Should inherit from ListNode - would simplify
class AST.Arr < AST.Literal

	def push item
		value.push(item)
		self

	def count
		value:length

	def nodes
		value

	def splat
		value.some(|v| v isa AST.Splat)

	def visit
		for v in value
			v.traverse
		self

	def js
		var splat = value.some(|v| v isa AST.Splat)

		if splat
			"SPLATTED ARRAY!"
			# if we know for certain that the splats are arrays we can drop the slice?
			var slices = []
			var group = nil
			value.forEach do |v|
				if v isa AST.Splat
					slices.push(v)
					group = nil
				else
					slices.push(group = AST.Arr.new([])) unless group
					group.push(v)

			"[].concat({slices.c.join(", ")})"
		else
			# very temporary. need a more generic way to prettify code
			# should depend on the length of the inner items etc
			if option(:indent)
				"[\n{value.c.join(",\n").indent}\n]"
			else
				"[{value.c.join(", ")}]"

	def indented
		var o = @options ||= {}
		o:indent = yes
		self

	def hasSideEffects
		value.some(|v| v.hasSideEffects )

	def toString
		"Arr"
		

	def self.wrap val
		AST.Arr.new(val)

# should not be cklassified as a literal?
class AST.Obj < AST.Literal

	def visit
		for v in value
			v.traverse
		self

	def js
		var dyn = value.filter(|v| v.key isa AST.Op )

		if dyn:length > 0
			var idx = value.indexOf(dyn[0])
			# p "dynamic keys! {dyn}"
			# create a temp variable

			var tmp = scope__.temporary(self)
			# set the temporary object to the same
			var first = value.slice(0,idx)
			var obj = AST.Obj.new(first)
			var ast = [OP('=',tmp,obj)]

			value.slice(idx).forEach do |atr|
				ast.push(OP('=',OP('.',tmp,atr.key),atr.value))
			ast.push(tmp) # access the tmp at in the last part
			return AST.Parens.new(ast).c
		# for objects with expression-keys we need to think differently
		'{' + value.map(|v| v.c).join(',') + '}'

	def add k, v
		var kv = AST.ObjAttr.new(k,v)
		value.push(kv)
		return kv

	def hash
		var hash = {}
		for k in value
			hash[k.key.symbol] = k.value
		return hash
		# return k if k.key.symbol == key

	# add method for finding properties etc?
	def key key
		for k in value
			return k if k.key.symbol == key
		nil

	def hasSideEffects
		value.some(|v| v.hasSideEffects )

	# for converting a real object into an ast-representation
	def self.wrap obj
		var attrs = []
		for own k,v of obj
			if v isa Array
				v = AST.Arr.wrap(v)
			elif v:constructor == Object
				v = AST.Obj.wrap(v)
			attrs.push(AST.ObjAttr.new(k,v))
		return AST.Obj.new(attrs)

	def toString
		"Obj"
		
class AST.ObjAttr < AST.Node

	prop key
	prop value
	prop options

	def initialize key, value
		@key = key
		@value = value
		@dynamic = key isa AST.Op

	def visit
		# should probably traverse key as well, unless it is a dead simple identifier
		key.traverse
		value.traverse

	def js
		"{key.c}: {value.c}"

	def hasSideEffects
		true
		


class AST.ArgsReference < AST.Node

	# should register in this scope --
	def c
		"arguments"

# should be a separate Context or something
class AST.Self < AST.Literal

	prop scope

	def initialize scope
		@scope = scope

	def cache
		self

	def reference
		return self

	def c
		var s = scope__
		(s ? s.context.c : "this")

class AST.ImplicitSelf < AST.Self
		
class AST.This < AST.Self

	def cache
		self

	def reference
		# p "referencing this"
		self

	def c
		"this"

