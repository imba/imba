
extern _T

Imba.CSSKeyMap = {}

###
Get the current document
###
def Imba.document
	if $web$
		window:document
	else
		@document ||= ImbaServerDocument.new

###
Get the body element wrapped in an Imba.Tag
###
def Imba.root
	tag(Imba.document:body)


def Imba.static items, nr
	items:static = nr
	return items

###

###
def Imba.mount node, into
	into ||= Imba.document:body
	into.appendChild(node.dom)
	Imba.commit
	return node


def Imba.createTextNode node
	if node and node:nodeType == 3
		return node
	return Imba.document.createTextNode(node)

###
This is the baseclass that all tags in imba inherit from.
@iname node
###
class Imba.Tag

	def self.buildNode
		var dom = Imba.document.createElement(@nodeType or 'div')
		if @classes
			var cls = @classes.join(" ")
			dom:className = cls if cls
		dom

	def self.createNode
		var proto = (@protoDom ||= buildNode)
		proto.cloneNode(false)

	def self.build
		self.new(self.createNode)

	def self.dom
		@protoDom ||= buildNode

	###
	Called when a tag type is being subclassed.
	###
	def self.inherit child
		child:prototype.@empty = yes
		child.@protoDom = null

		if @nodeType
			child.@nodeType = @nodeType
			child.@classes = @classes.slice

			if child.@flagName
				child.@classes.push(child.@flagName)
		else
			child.@nodeType = child.@name
			child.@flagName = null
			child.@classes = []

	###
	Internal method called after a tag class has
	been declared or extended.
	###
	def optimizeTagStructure
		var base = Imba.Tag:prototype
		# var has = do |k| self:hasOwnProperty(k)
		# if has(:commit) or has(:render) or has(:mount) or has(:build)

		var hasBuild  = self:build  != base:build
		var hasCommit = self:commit != base:commit
		var hasRender = self:render != base:render
		var hasMount  = self:mount
		
		if hasCommit or hasRender or hasBuild or hasMount

			self:end = do
				if this:mount and !this.@mounted
					Imba.TagManager.mount(this)

				unless this.@built
					this.@built = yes
					this.build
				else
					this.commit

				return this
		self


	def initialize dom
		self.dom = dom
		self.@_ = {}
		self

	attr tabindex
	attr title
	attr role
	attr name

	prop object

	def dom
		@dom
		
	def setDom dom
		dom.@tag = self
		@dom = dom
		self

	###
	Setting references for tags like
	`<div@header>` will compile to `tag('div').setRef('header',this).end()`
	By default it adds the reference as a className to the tag.
	@return {self}
	###
	def setRef ref, ctx
		flag(@ref = ref)
		self

	def ref
		@ref

	def __ref ref, ctx
		ctx['_' + ref] = self
		flag(@ref = ref)
		@owner = ctx
		self

	###
	Set inner html of node
	###
	def html= html
		@dom:innerHTML = html

	###
	Get inner html of node
	###
	def html
		@dom:innerHTML


	###
	Get width of node (offsetWidth)
	@return {number}
	###
	def width
		@dom:offsetWidth

	###
	Get height of node (offsetHeight)
	@return {number}
	###
	def height
		@dom:offsetHeight

	###
	Method that is called by the compiled tag-chains, for
	binding events on tags to methods etc.
	`<a :tap=fn>` compiles to `tag('a').setHandler('tap',fn,this).end()`
	where this refers to the context in which the tag is created.
	@return {self}
	###
	def setHandler event, handler, ctx
		var key = 'on' + event

		if handler isa Function
			self[key] = handler
		elif handler isa Array
			var fn = handler.shift
			self[key] = do |e| ctx[fn].apply(ctx,handler.concat(e))
		else
			self[key] = do |e| ctx[handler](e)
		self

	def id= id
		if id != null
			dom:id = id

	def id
		dom:id

	###
	Adds a new attribute or changes the value of an existing attribute
	on the specified tag. If the value is null or false, the attribute
	will be removed.
	@return {self}
	###
	def setAttribute name, value
		# should this not return self?
		var old = dom.getAttribute(name)

		if old == value
			value
		elif value != null && value !== false
			dom.setAttribute(name,value)
		else
			dom.removeAttribute(name)

	def setNestedAttr ns, name, value
		if self[ns] isa Function and self[ns]:length > 1
			self[ns](name,value)
			return self

		return setAttributeNS(ns, name,value)

	def setAttributeNS ns, name, value
		var old = getAttributeNS(ns,name)

		if old == value
			value
		elif value != null && value !== false
			dom.setAttributeNS(ns,name,value)
		else
			dom.removeAttributeNS(ns,name)

		return self


	###
	removes an attribute from the specified tag
	###
	def removeAttribute name
		dom.removeAttribute(name)

	###
	returns the value of an attribute on the tag.
	If the given attribute does not exist, the value returned
	will either be null or "" (the empty string)
	###
	def getAttribute name
		dom.getAttribute(name)


	def getAttributeNS ns, name
		dom.getAttributeNS(ns,name)

	###
	Override this to provide special wrapping etc.
	@return {self}
	###
	def setContent content, type
		setChildren content, type
		self

	###
	Set the children of node. type param is optional,
	and should only be used by Imba when compiling tag trees. 
	@return {self}
	###
	def setChildren nodes, type
		@empty ? append(nodes) : empty.append(nodes)
		@children = null
		self

	###
	Set the template that will render the content of node.
	@return {self}
	###
	def setTemplate template
		unless @template
			# override the basic
			if self:render == Imba.Tag:prototype:render
				self:render = self:renderTemplate # do setChildren(renderTemplate)
			self.optimizeTagStructure

		self:template = @template = template
		self

	def template
		null

	###
	If no custom render-method is defined, and the node
	has a template, this method will used to render
	@return {self}
	###
	def renderTemplate
		var body = template
		setChildren(body) if body != self
		self


	###
	@deprecated
	Remove specified child from current node.
	###
	def remove child
		removeChild(child)

	###
	Remove specified child from current node.
	@return {self}
	###
	def removeChild child
		var par = dom
		var el = child isa Imba.Tag ? child.dom : child

		if el and el:parentNode == par
			par.removeChild(el)
			Imba.TagManager.remove(el.@tag,self) if el.@tag
		self


	###
	Append a single item (node or string) to the current node.
	If supplied item is a string it will automatically. This is used
	by Imba internally, but will practically never be used explicitly.
	@return {self}
	###
	def appendChild node
		if node isa String
			dom.appendChild(Imba.document.createTextNode(node))
		elif node
			dom.appendChild(node.@dom or node)
			Imba.TagManager.insert(node.@tag or node, self)
			# FIXME ensure these are not called for text nodes
		self

	###
	Insert a node into the current node (self), before another.
	The relative node must be a child of current node. 
	###
	def insertBefore node, rel
		if node isa String
			node = Imba.document.createTextNode(node)

		if node and rel
			dom.insertBefore( (node.@dom or node), (rel.@dom or rel) )
			Imba.TagManager.insert(node.@tag or node, self)
			# FIXME ensure these are not called for text nodes
		self

	###
	The .append method inserts the specified content as the last child
	of the target node. If the content is already a child of node it
	will be moved to the end.
	
	    var root = <div.root>
	    var item = <div.item> "This is an item"
	    root.append item # appends item to the end of root

	    root.prepend "some text" # append text
	    root.prepend [<ul>,<ul>] # append array
	###
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
			# should delegate to self.appendChild
			appendChild(item)
			@empty = no if @empty

		return self

	###
	@deprecated
	###
	def insert node, before: null, after: null
		before = after.next if after
		if node isa Array
			node = (<fragment> node)
		if before
			insertBefore(node,before.dom)
		else
			appendChild(node)
		self

	###
	@todo Should support multiple arguments like append

	The .prepend method inserts the specified content as the first
	child of the target node. If the content is already a child of 
	node it will be moved to the start.
	
    	node.prepend <div.top> # prepend node
    	node.prepend "some text" # prepend text
    	node.prepend [<ul>,<ul>] # prepend array

	###
	def prepend item
		var first = @dom:childNodes[0]
		first ? insertBefore(item, first) : appendChild(item)
		self


	###
	Remove node from the dom tree
	@return {self}
	###
	def orphanize
		par.removeChild(self) if let par = parent
		return self

	###
	Get text of node. Uses textContent behind the scenes (not innerText)
	[https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent]()
	@return {string} inner text of node
	###
	def text v
		@dom:textContent

	###
	Set text of node. Uses textContent behind the scenes (not innerText)
	[https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent]()
	###
	def text= txt
		@empty = no
		@dom:textContent = txt ?= ""
		self


	###
	Method for getting and setting data-attributes. When called with zero
	arguments it will return the actual dataset for the tag.

		var node = <div data-name='hello'>
		# get the whole dataset
		node.dataset # {name: 'hello'}
		# get a single value
		node.dataset('name') # 'hello'
		# set a single value
		node.dataset('name','newname') # self


	###
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


	###
	Remove all content inside node
	###
	def empty
		if @dom:firstChild
			@dom.removeChild(@dom:firstChild) while @dom:firstChild
			Imba.TagManager.remove(null,self)

		@children = null
		@empty = yes
		self

	###
	Empty placeholder. Override to implement custom render behaviour.
	Works much like the familiar render-method in React.
	@return {self}
	###
	def render
		self

	###
	Called implicitly through Imba.Tag#end, upon creating a tag. All
	properties will have been set before build is called, including
	setContent.
	@return {self}
	###
	def build
		render
		self

	###
	Called implicitly through Imba.Tag#end, for tags that are part of
	a tag tree (that are rendered several times).
	@return {self}
	###
	def commit
		render
		self

	###

	Called by the tag-scheduler (if this tag is scheduled)
	By default it will call this.render. Do not override unless
	you really understand it.

	###
	def tick
		render
		self

	###
	
	A very important method that you will practically never manually.
	The tag syntax of Imba compiles to a chain of setters, which always
	ends with .end. `<a.large>` compiles to `tag('a').flag('large').end()`
	
	You are highly adviced to not override its behaviour. The first time
	end is called it will mark the tag as built and call Imba.Tag#build,
	and call Imba.Tag#commit on subsequent calls.
	@return {self}
	###
	def end
		self

	###
	This is called instead of Imba.Tag#end for `<self>` tag chains.
	Defaults to noop
	@return {self}
	###
	def synced
		self

	# called when the node is awakened in the dom - either automatically
	# upon attachment to the dom-tree, or the first time imba needs the
	# tag for a domnode that has been rendered on the server
	def awaken
		self



	###
	List of flags for this node. 
	###
	def flags
		@dom:classList

	###
	@deprecated
	###
	def classes
		throw "Imba.Tag#classes is removed. Use Imba.Tag#flags"

	###
	Add speficied flag to current node.
	If a second argument is supplied, it will be coerced into a Boolean,
	and used to indicate whether we should remove the flag instead.
	@return {self}
	###
	def flag name, toggler
		# it is most natural to treat a second undefined argument as a no-switch
		# so we need to check the arguments-length
		if arguments:length == 2
			if @dom:classList.contains(name) != !!toggler
				@dom:classList.toggle(name)
		else
			@dom:classList.add(name)
		return self

	###
	Remove specified flag from node
	@return {self}
	###
	def unflag name
		@dom:classList.remove(name)
		self

	###
	Toggle specified flag on node
	@return {self}
	###
	def toggleFlag name
		@dom:classList.toggle(name)
		self

	###
	Check whether current node has specified flag
	@return {bool}
	###
	def hasFlag name
		@dom:classList.contains(name)


	###
	Set/update a named flag. It remembers the previous
	value of the flag, and removes it before setting the new value.

		node.setFlag('type','todo')
		node.setFlag('type','project')
		# todo is removed, project is added.

	@return {self}
	###
	def setFlag name, value
		@namedFlags ||= []
		let prev = @namedFlags[name]
		if prev != value
			unflag(prev) if prev
			flag(value) if value
			@namedFlags[name] = value
		return self


	###
	Get the scheduler for this node. A new scheduler will be created
	if it does not already exist.

	@return {Imba.Scheduler}
	###
	def scheduler
		@scheduler ?= Imba.Scheduler.new(self)

	###

	Shorthand to start scheduling a node. The method will basically
	proxy the arguments through to scheduler.configure, and then
	activate the scheduler.
	
	@return {self}
	###
	def schedule options = {events: yes}
		scheduler.configure(options).activate
		self

	###
	Shorthand for deactivating scheduler (if tag has one).
	@deprecated
	###
	def unschedule
		scheduler.deactivate if @scheduler
		self


	###
	Get the parent of current node
	@return {Imba.Tag} 
	###
	def parent
		tag(dom:parentNode)

	###
	Get the child at index
	###
	def child i
		tag(dom:children[i or 0])


	###
	Get the children of node
	@return {Imba.Selector}
	###
	def children sel
		var nodes = Imba.Selector.new(null, self, @dom:children)
		sel ? nodes.filter(sel) : nodes

	###
	Get the siblings of node
	@return {Imba.Selector}
	###
	def siblings sel
		return [] unless var par = parent # FIXME
		var ary = dom:parentNode:children
		var nodes = Imba.Selector.new(null, self, ary)
		nodes.filter(|n| n != self && (!sel || n.matches(sel)))

	###
	Get node and its ascendents
	@return {Array}
	###
	def path sel
		var node = self
		var nodes = []
		sel = sel.query if sel and sel:query

		while node
			nodes.push(node) if !sel or node.matches(sel)
			node = node.parent
		return nodes

	###
	Get ascendents of node
	@return {Array}
	###
	def parents sel
		var par = parent
		par ? par.path(sel) : []

	###
	Get the immediately following sibling of node.
	###
	def next sel
		if sel
			var el = self
			while el = el.next
				return el if el.matches(sel)
			return null
		tag(dom:nextElementSibling)

	###
	Get the immediately preceeding sibling of node.
	###
	def prev sel
		if sel
			var el = self
			while el = el.prev
				return el if el.matches(sel)
			return null
		tag(dom:previousElementSibling)

	###
	Get descendants of current node, optionally matching selector
	@return {Imba.Selector}
	###
	def find sel
		Imba.Selector.new(sel,self)

	###
	Get the first matching child of node

	@return {Imba.Tag}
	###
	def first sel
		sel ? find(sel).first : tag(dom:firstElementChild)

	###
	Get the last matching child of node

		node.last # returns the last child of node
		node.last %span # returns the last span inside node
		node.last do |el| el.text == 'Hi' # return last node with text Hi

	@return {Imba.Tag}
	###
	def last sel
		sel ? find(sel).last : tag(dom:lastElementChild)

	###
	Check if this node matches a selector
	@return {Boolean}
	###
	def matches sel
		if sel isa Function
			return sel(self)

		sel = sel.query if sel:query
		if var fn = (@dom:matches or @dom:matchesSelector or @dom:webkitMatchesSelector or @dom:msMatchesSelector or @dom:mozMatchesSelector)
			return fn.call(@dom,sel)

	###
	Get the first element matching supplied selector / filter
	traversing upwards, but including the node itself.
	@return {Imba.Tag}
	###
	def closest sel
		return parent unless sel # should return self?!
		var node = self
		sel = sel.query if sel:query

		while node
			return node if node.matches(sel)
			node = node.parent
		return null

	###
	Get the closest ancestor of node that matches
	specified selector / matcher.

	@return {Imba.Tag}
	###
	def up sel
		return parent unless sel
		parent and parent.closest(sel)

	###
	Get the index of node.
	@return {Number}
	###
	def index
		var i = 0
		var el = dom
		while el:previousSibling
			el = el:previousSibling
			i++
		return i

	###
	Check if node contains other node
	@return {Boolean} 
	###
	def contains node
		dom.contains(node and node.@dom or node)


	###
	Shorthand for console.log on elements
	@return {self}
	###
	def log *args
		args.unshift(console)
		Function:prototype:call.apply(console:log, args)
		self

	def css key, val
		if key isa Object
			css(k,v) for own k,v of key
			return self

		key = Imba.CSSKeyMap[key] or key

		if val == null
			dom:style.removeProperty(key)
		elif val == undefined and arguments:length == 1
			return dom:style[key]
		else
			if val isa Number and key.match(/width|height|left|right|top|bottom/)
				val = val + "px"
			dom:style[key] = val
		self

	def trigger event, data = {}
		Imba.Events.trigger(event,self,data: data)

	def emit name, data: null, bubble: yes
		console.warn('tag#emit is deprecated -> use tag#trigger')
		Imba.Events.trigger name, self, data: data, bubble: bubble
		return self

	def transform= value
		css(:transform, value)
		self

	def transform
		css(:transform)

	def style= style
		setAttribute('style',style)
		self

	def style
		getAttribute('style')

	###
	Focus on current node
	@return {self}
	###
	def focus
		dom.focus
		self

	###
	Remove focus from current node
	@return {self}
	###
	def blur
		dom.blur
		self

	def toString
		dom:outerHTML
	

Imba.Tag:prototype:initialize = Imba.Tag

HTML_TAGS = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ")
HTML_TAGS_UNSAFE = "article aside header section".split(" ")
SVG_TAGS = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ")


def extender obj, sup
	for own k,v of sup
		obj[k] ?= v

	obj:prototype = Object.create(sup:prototype)
	obj:__super__ = obj:prototype:__super__ = sup:prototype
	obj:prototype:constructor = obj
	sup.inherit(obj) if sup:inherit
	return obj

def Tag
	return do |dom|
		this.initialize(dom)
		return this

def TagSpawner type
	return do type.build

class Imba.Tags

	def initialize
		self

	def __clone ns
		var clone = Object.create(self)
		clone.@parent = self
		return clone

	def ns name
		self['_' + name.toUpperCase] || defineNamespace(name)

	def defineNamespace name
		var clone = Object.create(self)
		clone.@parent = self
		clone.@ns = name
		self['_' + name.toUpperCase] = clone
		return clone

	def baseType name
		name in HTML_TAGS ? 'element' : 'div'

	def defineTag name, supr = '', &body
		if body and body.@nodeType
			supr = body
			body = null

		supr ||= baseType(name)

		let supertype = supr isa String ? self[supr] : supr
		let tagtype = Tag()
		let norm = name.replace(/\-/g,'_')

		tagtype.@name = name
		tagtype.@flagName = null

		if name[0] == '#'
			self[name] = tagtype
			Imba.SINGLETONS[name.slice(1)] = tagtype
		elif name[0] == name[0].toUpperCase
			true
		else
			tagtype.@flagName = "_" + name.replace(/_/g, '-')
			self[name] = tagtype
			self[norm.toUpperCase] = TagSpawner(tagtype)
			# '$'+


		extender(tagtype,supertype)

		if body
			if body:length == 2
				# create clone
				unless tagtype.hasOwnProperty('TAGS')
					tagtype.TAGS = (supertype.TAGS or self).__clone

			body.call(tagtype,tagtype, tagtype.TAGS or self)
			tagtype.defined if tagtype:defined
			optimizeTag(tagtype)
		return tagtype

	def defineSingleton name, supr, &body
		defineTag(name,supr,body)

	def extendTag name, supr = '', &body
		var klass = (name isa String ? self[name] : name)
		# allow for private tags here as well?
		body and body.call(klass,klass,klass:prototype) if body
		klass.extended if klass:extended
		optimizeTag(klass)
		return klass

	def optimizeTag tagtype
		tagtype:prototype?.optimizeTagStructure
		self


Imba.SINGLETONS = {}
Imba.TAGS = Imba.Tags.new
Imba.TAGS[:element] = Imba.TAGS[:htmlelement] = Imba.Tag


var html = Imba.TAGS.defineNamespace('html')
var svg = Imba.TAGS.defineNamespace('svg')
Imba.TAGS = html # make the html namespace the root

def svg.baseType name
	'element'

def Imba.defineTag name, supr = '', &body
	return Imba.TAGS.defineTag(name,supr,body)

def Imba.defineSingletonTag id, supr = 'div', &body
	return Imba.TAGS.defineTag(name,supr,body)

def Imba.extendTag name, body
	return Imba.TAGS.extendTag(name,body)

def Imba.tag name
	var typ = Imba.TAGS[name]
	throw Error.new("tag {name} is not defined") if !typ
	return typ.new(typ.createNode)

def Imba.tagWithId name, id
	var typ = Imba.TAGS[name]
	throw Error.new("tag {name} is not defined") if !typ
	var dom = typ.createNode
	dom:id = id
	return typ.new(dom)

# TODO: Can we move these out and into dom.imba in a clean way?
# These methods depends on Imba.document.getElementById

def Imba.getTagSingleton id	
	var dom, node

	if var klass = Imba.SINGLETONS[id]
		return klass.Instance if klass and klass.Instance 

		# no instance - check for element
		if dom = Imba.document.getElementById(id)
			# we have a live instance - when finding it through a selector we should awake it, no?
			# console.log('creating the singleton from existing node in dom?',id,type)
			node = klass.Instance = klass.new(dom)
			node.awaken(dom) # should only awaken
			return node

		dom = klass.createNode
		dom:id = id
		node = klass.Instance = klass.new(dom)
		node.end.awaken(dom)
		return node
	elif dom = Imba.document.getElementById(id)
		return Imba.getTagForDom(dom)

var svgSupport = typeof SVGElement !== 'undefined'

def Imba.getTagForDom dom
	return null unless dom
	return dom if dom.@dom # could use inheritance instead
	return dom.@tag if dom.@tag
	return null unless dom:nodeName

	var ns   = null
	var id   = dom:id
	var type = dom:nodeName.toLowerCase
	var tags = Imba.TAGS
	var native = type
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
		tags = tags:_SVG

	var spawner

	if cls
		# there can be several matches here - should choose the last
		# should fall back to less specific later? - otherwise things may fail
		# TODO rework this
		let flags = cls.split(' ')
		let nr = flags:length 

		while --nr >= 0
			let flag = flags[nr]
			if flag[0] == '_'
				if spawner = tags[flag.slice(1)]
					break

		# if var m = cls.match(/\b_([a-z\-]+)\b(?!\s*_[a-z\-]+)/)
		# 	type = m[1] # .replace(/-/g,'_')

		if let m = cls.match(/\b([A-Z\-]+)_\b/)
			ns = m[1]

	spawner ||= tags[native]
	spawner ? spawner.new(dom).awaken(dom) : null


_T = tag$ = Imba.TAGS
t$ = Imba:tag
tc$ = Imba:tagWithFlags
ti$ = Imba:tagWithId
tic$ = Imba:tagWithIdAndFlags
id$ = Imba:getTagSingleton
tag$wrap = Imba:getTagForDom

def Imba.generateCSSPrefixes
	var styles = window.getComputedStyle(document:documentElement, '')

	for prefixed in styles
		var unprefixed = prefixed.replace(/^-(webkit|ms|moz|o|blink)-/,'')
		var camelCase = unprefixed.replace(/-(\w)/g) do |m,a| a.toUpperCase

		# if there exists an unprefixed version -- always use this
		if prefixed != unprefixed
			continue if styles.hasOwnProperty(unprefixed)

		# register the prefixes
		Imba.CSSKeyMap[unprefixed] = Imba.CSSKeyMap[camelCase] = prefixed
	return

if $web$
	Imba.generateCSSPrefixes if document

	# Ovverride classList
	if document and !document:documentElement:classList
		extend tag element

			def hasFlag ref
				return RegExp.new('(^|\\s)' + ref + '(\\s|$)').test(@dom:className)

			def addFlag ref
				return self if hasFlag(ref)
				@dom:className += (@dom:className ? ' ' : '') + ref
				return self

			def unflag ref
				return self unless hasFlag(ref)
				var regex = RegExp.new('(^|\\s)*' + ref + '(\\s|$)*', 'g')
				@dom:className = @dom:className.replace(regex, '')
				return self

			def toggleFlag ref
				hasFlag(ref) ? unflag(ref) : flag(ref)

			def flag ref, bool
				if arguments:length == 2 and !!bool === no
					return unflag(ref)
				return addFlag(ref)

Imba.Tag
