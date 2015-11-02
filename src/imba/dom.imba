
var ElementTag = require('./tag').ElementTag

def Imba.document
	window:document

tag htmlelement < element
	def self.inherit child
		child:prototype.@empty = yes
		child.@protoDom = null

		if @nodeType
			child.@nodeType = @nodeType

			var className = "_" + child.@name.replace(/_/g, '-')
			child.@classes = @classes.concat(className)
		else
			child.@nodeType = child.@name
			child.@classes = []

	def self.buildNode
		var dom = Imba.document.createElement(@nodeType)
		var cls = @classes.join(" ")
		dom:className = cls if cls
		dom

	def self.createNode
		var proto = (@protoDom ||= buildNode)
		proto.cloneNode(false)

	def self.dom
		@protoDom ||= buildNode

	def children= nodes
		@empty ? append(nodes) : empty.append(nodes)
		@children = null
		self

	def text v
		return (text = v,self) if arguments:length
		@dom:textContent

	def text= txt
		@empty = no
		@dom:textContent = txt ?= ""
		self

	def html= html
		@dom:innerHTML = html
		self

	def html
		@dom:innerHTML

	def empty
		@dom.removeChild(@dom:firstChild) while @dom:firstChild
		@children = null
		@empty = yes
		self

	def remove node
		var par = dom
		var el = node and node.dom
		par.removeChild(el) if el and el:parentNode == par
		self

	def parent
		tag(dom:parentNode)

	def log *args
		args.unshift(console)
		Function:prototype:call.apply(console:log, args)
		self
		
	def emit name, data: null, bubble: yes
		Imba.Events.trigger name, self, data: data, bubble: bubble
		return self

	def css key, val
		if key isa Object
			css(k,v) for own k,v of key
		elif val == null
			dom:style.removeProperty(key)
		elif val == undefined
			return dom:style[key]
		else
			if val isa Number and key.match(/width|height|left|right|top|bottom/)
				val = val + "px"
			dom:style[key] = val
		self

	def dataset key, val
		if key isa Object
			dataset(k,v) for own k,v of key
			return self

		if arguments:length == 2
			setAttribute("data-{key}",val)
			return self

		if key
			return getAttribute("data-{key}")

		var dataset = dom:dataset

		unless dataset
			dataset = {}
			for atr,i in dom:attributes
				if atr:name.substr(0,5) == 'data-'
					dataset[Imba.toCamelCase(atr:name.slice(5))] = atr:value

		return dataset

	# selectors / traversal
	def find sel do Imba.Selector.new(sel,self)

	def first sel
		sel ? find(sel).first : tag(dom:firstElementChild)

	def last sel
		sel ? find(sel).last : tag(dom:lastElementChild)

	def child i
		tag(dom:children[i or 0])

	def children sel
		var nodes = Imba.Selector.new(null, self, @dom:children)
		sel ? nodes.filter(sel) : nodes
	
	def orphanize
		par.removeChild(@dom) if let par = dom:parentNode
		return self
	
	def matches sel
		if sel isa Function
			return sel(self)

		sel = sel.query if sel:query
		return fn.call(@dom,sel) if var fn = (@dom:webkitMatchesSelector or @dom:matches)
		# TODO support other browsers etc?

	def closest sel
		return parent unless sel # should return self?!
		var node = self
		sel = sel.query if sel:query

		while node
			return node if node.matches(sel)
			node = node.parent
		return null

	def path sel
		var node = self
		var nodes = []
		sel = sel.query if sel and sel:query

		while node
			nodes.push(node) if !sel or node.matches(sel)
			node = node.parent
		return nodes

	def parents sel
		var par = parent
		par ? par.path(sel) : []

	def up sel
		return parent unless sel
		parent and parent.closest(sel)

	def siblings sel
		return [] unless var par = parent # FIXME
		var ary = dom:parentNode:children
		var nodes = Imba.Selector.new(null, self, ary)
		nodes.filter(|n| n != self && (!sel || n.matches(sel)))

	def next sel
		if sel
			var el = self
			while el = el.next
				return el if el.matches(sel)
			return null
		tag(dom:nextElementSibling)

	def prev sel
		if sel
			var el = self
			while el = el.prev
				return el if el.matches(sel)
			return null
		tag(dom:previousElementSibling)

	def contains node
		dom.contains(node and node.@dom or node)

	def index
		var i = 0
		var el = dom
		while el:previousSibling
			el = el:previousSibling
			i++
		return i


	def insert node, before: null, after: null
		before = after.next if after
		if node isa Array
			node = (<fragment> node)
		if before
			dom.insertBefore(node.dom,before.dom)
		else
			append(node)
		self	

	def focus
		dom.focus
		self

	def blur
		dom.blur
		self

	def template
		null

	def prepend item
		var first = @dom:childNodes[0]
		first ? insertBefore(item, first) : appendChild(item)
		self

	def append item
		# possible to append blank
		# possible to simplify on server?
		return self unless item

		if item isa Array
			member && append(member) for member in item

		elif item isa String or item isa Number
			var node = Imba.document.createTextNode(item)
			@dom.appendChild(node)
			@empty = no if @empty			
		else
			@dom.appendChild(item.@dom or item)
			@empty = no if @empty

		return self


	def insertBefore node, rel
		node = Imba.document.createTextNode(node) if node isa String 
		dom.insertBefore( (node.@dom or node), (rel.@dom or rel) ) if node and rel
		self

	def appendChild node
		node = Imba.document.createTextNode(node) if node isa String
		dom.appendChild(node.@dom or node) if node
		self

	def removeChild node
		dom.removeChild(node.@dom or node) if node
		self

	def toString
		@dom.toString # really?

	def classes
		@dom:classList


	def flags
		@dom:classList
		
	def flag ref, toggle
		# it is most natural to treat a second undefined argument as a no-switch
		# so we need to check the arguments-length
		if arguments:length == 2 and !toggle
			@dom:classList.remove(ref)
		else
			@dom:classList.add(ref)
		return self

	def unflag ref
		@dom:classList.remove(ref)
		return self

	def toggleFlag ref
		@dom:classList.toggle(ref)
		return self

	def hasFlag ref
		@dom:classList.contains(ref)

tag svgelement < htmlelement
