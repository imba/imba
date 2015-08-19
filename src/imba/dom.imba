
var svgSupport = typeof SVGElement !== 'undefined'

def Imba.document
	window:document

def Imba.static items, nr
	items:static = nr
	return items


global class ElementTag

	prop object

	def dom
		@dom

	def initialize dom
		self.dom = dom
		self
		
	def setDom dom
		dom.@tag = self
		@dom = dom
		self

	def setRef ref
		flag(@ref = ref)
		self

	def setHandler name, v
		self["on" + name] = v
		self

	def setId id
		dom:id = id
		self

	def id
		dom:id

	def setAttribute key, new
		var old = dom.getAttribute(key)

		if old == new
			new
		elif new != null && new !== false
			dom.setAttribute(key,new)
		else
			dom.removeAttribute(key)

	def removeAttribute key
		dom.removeAttribute(key)

	def getAttribute key
		return dom.getAttribute(key)

	def content= content
		children = content # override?
		self

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


	# bind / present
	# should deprecate / remove
	def bind obj
		object = obj
		self

	def render
		self

	def build
		render
		self

	def commit
		self

	def end
		if @built
			commit
		else
			@built = yes
			build
		self

	# called whenever a node has rendered itself like in <self> <div> ...
	def synced
		self

	# called when the node is awakened in the dom - either automatically
	# upon attachment to the dom-tree, or the first time imba needs the
	# tag for a domnode that has been rendered on the server
	def awaken
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
		insert(item, before: first)

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

	def self.dom
		return @dom if @dom

		var dom
		var sup = self:__super__:constructor
		var proto = self:prototype

		# should clone the parent no?
		if @isNative
			@dom = dom = Imba.document.createElement(@nodeType)

		elif @nodeType != sup.@nodeType
			@dom = dom = Imba.document.createElement(@nodeType)
			dom.setAttribute(atr:name,atr:value) for atr in sup.dom	
			# dom:className = sup.dom:className
			# what about default attributes?
		else
			@dom = dom = sup.dom.cloneNode(false)

		# should be a way to use a native domtype without precreating the doc
		# and still keeping the classes?
		if @domFlags
			proto:flag.call(self,f) for f in @domFlags

		return @dom
		

	# we really ought to optimize this
	def self.createNode flags, id
		var proto = @dom or self.dom
		var dom = proto.cloneNode(false)
		return dom

	def self.flag flag
		# should redirect to the prototype with a dom-node already set?
		dom:classList.add(flag)
		self

	def self.unflag flag
		dom:classList.remove(flag)
		self	

	def self.createNode flags, id
		var proto = @dom or self.dom
		var dom = proto.cloneNode(false)
		return dom

ElementTag:prototype:initialize = ElementTag

class HTMLElementTag < ElementTag

class SVGElementTag < ElementTag


HTML_TAGS = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ")
HTML_TAGS_UNSAFE = "article aside header section".split(" ")
SVG_TAGS = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ")

Imba.TAGS = {
	element: ElementTag
	htmlelement: HTMLElementTag
	svgelement: SVGElementTag
}

Imba.SINGLETONS = {}
IMBA_TAGS = Imba.TAGS

def extender obj, sup
	for own k,v of sup
		obj[k] = v

	obj:prototype = Object.create(sup:prototype)
	obj:__super__ = obj:prototype:__super__ = sup:prototype
	obj:prototype:initialize = obj:prototype:constructor = obj
	return obj

def Imba.defineTag name, supr = '', &body
	var m = name.split("$")
	var name = m[0]
	var ns = m[1]

	supr ||= (name in HTML_TAGS) ? 'htmlelement' : 'div'

	var suprklass = Imba.TAGS[supr]

	var fname = name == 'var' ? 'vartag' : name
	# should drop this in production / optimized mode, but for debug
	# we create a constructor with a recognizeable name
	var Tag = Function.new("return function {fname.replace(/[\s\-\:]/g,'_')}(dom)\{ this.setDom(dom); \}")()
	# var Tag = do |dom| this.setDom(dom)
	var klass = Tag

	extender(klass,suprklass)

	klass.@nodeType = suprklass.@nodeType or name
	klass.@name = name
	klass.@ns = ns

	# add the classes -- if this is not a basic native node?
	if klass.@nodeType != name
		klass.@nodeFlag = "_" + name.replace(/_/g,'-')
		var nc = suprklass.@nodeClass
		nc = nc ? nc.split(/\s+/g) : []
		var c = null
		nc.push(c = "{ns}_") if ns and c not in nc
		nc.push(c = klass.@nodeFlag) unless c in nc
		klass.@nodeClass = nc.join(" ")
		klass.@domFlags = nc
		klass.@isNative = false
	else
		klass.@isNative = true

	klass.@dom = null
	klass:prototype.@nodeType = klass.@nodeType
	klass:prototype.@dom = null
	klass:prototype.@built = no
	klass:prototype.@empty = yes
	# add the default flags / classes for ns etc
	# if namespaced -- this is dangerous
	Imba.TAGS[name] = klass unless ns
	Imba.TAGS["{name}${ns or 'html'}"] = klass

	# create the global shortcut for tag init as well
	body.call(klass,klass,klass:prototype) if body
	return klass

def Imba.defineSingletonTag id, supr = '', &body

	var superklass = Imba.TAGS[supr || 'div']

	# should drop this in production / optimized mode, but for debug
	# we create a constructor with a recognizeable name
	var fun = Function.new("return function {id.replace(/[\s\-\:]/g,'_')}(dom)\{ this.setDom(dom); \}")
	var singleton = fun()

	var klass = extender(singleton,superklass)

	klass.@id = id
	klass.@ns = superklass.@ns
	klass.@nodeType = superklass.@nodeType
	klass.@nodeClass = superklass.@nodeClass
	klass.@domFlags = superklass.@domFlags
	klass.@isNative = false

	klass.@dom = null
	klass.@instance = null
	klass:prototype.@dom = null
	klass:prototype.@built = no
	klass:prototype.@empty = yes

	# add the default flags / classes for ns etc
	# if namespaced -- this is dangerous
	# console.log('registered singleton')
	Imba.SINGLETONS[id] = klass
	body.call(klass,klass,klass:prototype) if body
	return klass

def Imba.extendTag name, body
	var klass = (name isa String ? Imba.TAGS[name] : name)
	body and body.call(klass,klass,klass:prototype) if body
	return klass

def Imba.tag name
	var typ = Imba.TAGS[name]
	return typ.new(typ.createNode)

def Imba.tagWithId name, id
	var typ = Imba.TAGS[name]
	var dom = typ.createNode
	dom:id = id
	return typ.new(dom)

def Imba.getTagSingleton id
	var type, node, dom
	
	if type = Imba.SINGLETONS[id]
		# return basic awakening if singleton does not exist?

		return type.Instance if type and type.Instance 
		# no instance - check for element
		if dom = Imba.document.getElementById(id)
			# we have a live instance - when finding it through a selector we should awake it, no?
			# console.log('creating the singleton from existing node in dom?',id,type)
			node = type.Instance = type.new(dom)
			node.awaken(dom) # should only awaken
			return node

		dom = type.createNode
		dom:id = id
		# console.log('creating the singleton',id,type)
		node = type.Instance = type.new(dom)
		node.end.awaken(dom)
		return node
	elif dom = Imba.document.getElementById(id)
		# console.log('found plain element with id')
		return Imba.getTagForDom(dom)



def Imba.getTagForDom dom

	return null unless dom
	return dom if dom.@dom # could use inheritance instead
	return dom.@tag if dom.@tag
	return null unless dom:nodeName

	var ns   = null
	var id   = dom:id
	var type = dom:nodeName.toLowerCase
	var cls  = dom:className

	if id and Imba.SINGLETONS[id]
		# FIXME control that it is the same singleton?
		# might collide -- not good?
		return Imba.getTagSingleton(id)
	# look for id - singleton

	# need better test here
	if svgSupport and dom isa SVGElement
		ns = "svg" 
		cls = dom:className:baseVal

	if cls
		# there can be several matches here - should choose the last
		# should fall back to less specific later? - otherwise things may fail
		# TODO rework this
		if var m = cls.match(/\b_([a-z\-]+)\b(?!\s*_[a-z\-]+)/)
			type = m[1].replace(/-/g,'_')

		if m = cls.match(/\b([a-z]+)_\b/)
			ns = m[1] 

	var spawner = Imba.TAGS[type]
	spawner ? spawner.new(dom).awaken(dom) : null

t$ = Imba:tag
tc$ = Imba:tagWithFlags
ti$ = Imba:tagWithId
tic$ = Imba:tagWithIdAndFlags
id$ = Imba:getTagSingleton
tag$wrap = Imba:getTagForDom


# shim for classList


