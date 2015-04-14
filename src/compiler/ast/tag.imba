TAG_TYPES = {}
TAG_ATTRS = {}


TAG_TYPES.HTML = "a abbr address area article aside audio b base bdi bdo big blockquote body br 
button canvas caption cite code col colgroup data datalist dd del details dfn 
div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 
head header hr html i iframe img input ins kbd keygen label legend li link 
main map mark menu menuitem meta meter nav noscript object ol optgroup option 
output p param pre progress q rp rt ruby s samp script section select small 
source span strong style sub summary sup table tbody td textarea tfoot th 
thead time title tr track u ul var video wbr".split(" ")

TAG_TYPES.SVG = "circle defs ellipse g line linearGradient mask path pattern polygon polyline 
radialGradient rect stop svg text tspan".split(" ")

TAG_ATTRS.HTML = "accept accessKey action allowFullScreen allowTransparency alt async 
autoComplete autoFocus autoPlay cellPadding cellSpacing charSet checked 
className cols colSpan content contentEditable contextMenu controls coords 
crossOrigin data dateTime defer dir disabled download draggable encType form 
formNoValidate frameBorder height hidden href hrefLang htmlFor httpEquiv icon 
id label lang list loop max maxLength mediaGroup method min multiple muted 
name noValidate pattern placeholder poster preload radioGroup readOnly rel 
required role rows rowSpan sandbox scope scrollLeft scrolling scrollTop 
seamless selected shape size span spellCheck src srcDoc srcSet start step 
style tabIndex target title type useMap value width wmode"

TAG_ATTRS.SVG = "cx cy d dx dy fill fillOpacity fontFamily fontSize fx fy gradientTransform 
gradientUnits markerEnd markerMid markerStart offset opacity 
patternContentUnits patternUnits points preserveAspectRatio r rx ry 
spreadMethod stopColor stopOpacity stroke strokeDasharray strokeLinecap 
strokeOpacity strokeWidth textAnchor transform version viewBox x1 x2 x y1 y2 y"


class AST.TagDesc < AST.Node

	def initialize
		p 'TagDesc!!!',$0

	def classes
		p 'TagDescClasses',$0
		self

class AST.Tag < AST.Expression

	prop parts
	prop object
	prop reactive
	prop parent
	prop tree

	def initialize o = {}
		# p "init tag",$0
		@parts = []
		o:classes ||= []
		o:attributes ||= []
		o:classes ||= []
		@options = o

	def set obj
		for own k,v of obj

			if k == 'attributes'
				# p "attributs!"
				addAttribute(atr) for atr in v
				continue

			@options[k] = v
		self

	def addClass node
		unless node isa AST.TagFlag
			node = AST.TagFlag.new(node)
		@options:classes.push(node)
		@parts.push(node)

		# p "add class!!!"
		self

	def addIndex node
		@parts.push(node)
		# hmm
		@object = node
		# must be the first part?
		self

	def addSymbol node
		# p "addSymbol to the tag",node
		if @parts:length == 0
			@parts.push(node)
			@options:ns = node
		self
		

	def addAttribute atr
		# p "add attribute!!!", key, value
		@parts.push(atr) # what?
		@options:attributes.push(atr)
		self

	def type
		@options:type || :div

	def consume node
		if node isa AST.TagTree
			# p "tag consume tagtree? {node.reactive}"
			reactive = node.reactive or !!option(:ivar) # hmm
			parent = node.root # hmm
			return self
		else
			super

	def visit
		var o = @options
		if o:body
			# force expression(!)
			o:body.map(|v| v.traverse)

		# id should also be a regular part
		# hmm?
		o:id.traverse if o:id

		for part in @parts
			part.traverse

		# for atr in @options:attributes
		# 	atr.traverse

		self

	def reference
		# should resolve immediately to get the correct naming-structure that
		# reflects the nesting-level of the tag
		@reference ||= scope__.temporary(self,type: 'tag').resolve

	# should this not happen in js?
	def js
		# p JSON.stringify(@options)
		# var attrs = AST.TagAttributes.new(o:attributes)
		# p "got here?"
		var o = @options
		var a = {}

		var setup = []
		var calls = []
		var statics = []

		var scope = scope__
		var commit = "end"

		var isSelf = type isa AST.Self

		for atr in o:attributes
			a[atr.key] = atr.value # .populate(obj)

		var id = o:id isa AST.Node ? o:id.c : (o:id and o:id.c.quoted)

		#  "scope is", !!scope
		# p "type is {type}"
		var out = if isSelf
			commit = "synced"
			# p "got here"
			# setting correct context directly
			reactive = yes
			@reference = scope.context
			# hmm, not sure about this
			scope.context.c

		elif o:id
			"ti$('{type.func}',{id})"
		else
			"t$('{type.func}')"

		# this is reactive if it has an ivar
		if o:ivar
			reactive = yes
			statics.push(".setRef({o:ivar.name.quoted},{scope.context.c})")

		# hmmm
		var tree = AST.TagTree.new(o:body, root: self, reactive: reactive).resolve
		self.tree = tree

		# should it not happen through parts instead?
		# for flag in o:classes
		# 	calls.push(flag.c)
		# 	# calls.push ".flag({flag isa String ? flag.c.quoted : flag.c})"

		for part in @parts
			if part isa AST.TagAttr
				var akey = part.key

				# the attr should compile itself instead -- really

				if akey[0] == '.' # should check in a better way
					calls.push ".flag({akey.substr(1).quoted},{part.value.c})"
				else
					calls.push ".{part.key.toSetter}({part.value.c})"

			elif part isa AST.TagFlag
				calls.push(part.c)


		# for atr in o:attributes
		# 	# continue if atr.key.match /tst/ # whatt??!
		# 	# only force-set the standard attributes?
		# 	# what about values that are not legal?
		# 	# can easily happen - we need to compile them?
		# 	# or always proxy through set
		# 	var akey = atr.key
		# 
		# 	# TODO FIXME what if the key is dashed?
		# 	# p "attribute {akey}"
		# 	
		# 	if akey[0] == '.' # should check in a better way
		# 		# aint good?
		# 		# out += ".flag({akey.substr(1).quoted},{atr.value.c})"
		# 		calls.push ".flag({akey.substr(1).quoted},{atr.value.c})"
		# 	else
		# 		# should check for standard-attributes, consider setter instead?
		# 		# out += ".{atr.key}({atr.value.c})"
		# 		calls.push ".{atr.key.toSetter}({atr.value.c})"

		if object
			calls.push(".setObject({object.c})")

		# p "tagtree is static? {tree.static}"

		# we need to trigger our own reference before the body does
		if reactive
			reference # hmm

		if var body = tree.c(expression: yes) # force it to be an expression, no?
			calls.push (isSelf ? ".setChildren([{body}])" : ".setContent([{body}])")
			# out += ".body({body})"

		# if o:attributes:length # or -- always?
		# adds lots of extra calls - but okay for now
		calls.push ".{commit}()"

		if statics:length
			out = out + statics.join("")

		# hmm - hack much
		if (o:ivar or reactive) and !(type isa AST.Self)
			# if this is an ivar, we should set the reference relative
			# to the outer reference, or possibly right on context?
			var par = parent
			var ctx =  !o:ivar and par and par.reference or scope.context
			var key = o:ivar or par and par.tree.indexOf(self)

			# need the context -- might be better to rewrite it for real?
			# parse the whole thing into calls etc
			var acc = OP('.',ctx,key).c

			out = "({reference.c} = {acc} || ({acc} = {out}))"

		# should we not add references to the outer ones first?

		# now work on the refereces?

		# free variable
		@reference.free if @reference isa AST.Variable
		# if setup:length
		#	out += ".setup({setup.join(",")})"

		return out + calls.join("")

# This is a helper-node
class AST.TagTree < AST.ListNode

	def load list
		if list isa AST.ListNode
			@indentation ||= list.@indentation
			list.nodes
		else
			(list isa Array ? list : [list]).compact

	def root
		option(:root)

	def reactive
		option(:reactive)		

	def resolve
		remap do |c| c.consume(self)
		self

	def static
		@static ?= every do |c| c isa AST.Tag

	def c
		return super
		
		# p "TagTree.c {nodes}"	
		var l = nodes:length 
		if l == 1
			# p "TagTree.c {nodes}"
			map do |v| v.c(expression: yes)
			# nodes.c(expression: yes)
		elif l > 1
			nodes.c(expression: yes)


class AST.TagWrapper < AST.ValueNode

	def visit
		if value isa Array
			value.map(|v| v.traverse)
		else
			value.traverse
		self
		
	def c
		"tag$wrap({value.c(expression: yes)})"


class AST.TagAttributes < AST.ListNode

	def get name
		for node in nodes
			return node if node.key == name
		
		
class AST.TagAttr < AST.Node

	prop key
	prop value

	def visit
		value.traverse if value
		self

	def initialize k, v
		# p "init TagAttribute", $0
		@key = k
		@value = v

	def populate obj
		obj.add(key, value)
		self

	def c
		"attribute"


class AST.TagFlag < AST.Node

	prop value
	prop toggler

	def initialize value
		@value = value
		self

	def visit
		@value.traverse unless @value isa String
		self

	def c
		if value isa String
			".flag({value.quoted})"
		else
			".flag({value.c})"
		
		
