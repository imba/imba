var Imba = require("../imba")

Imba.CSSKeyMap = {}

Imba.TAG_BUILT = 1
Imba.TAG_SETUP = 2
Imba.TAG_MOUNTING = 4
Imba.TAG_MOUNTED = 8
Imba.TAG_SCHEDULED = 16
Imba.TAG_AWAKENED = 32
Imba.TAG_MOUNTABLE = 64
Imba.TAG_AUTOCLASS_GLOBALS = yes
Imba.TAG_AUTOCLASS_LOCALS = yes
Imba.TAG_AUTOCLASS_SVG = yes

###
Get the current document
###
def Imba.document
	window:document

###
Get the body element wrapped in an Imba.Tag
###
def Imba.root
	tag(Imba.document:body)

def Imba.static items, typ, nr
	items.@type = typ
	items:static = nr
	return items

###

###
def Imba.mount node, into
	into ||= Imba.document:body
	into.appendChild(node.dom)
	Imba.TagManager.insert(node,into)
	node.scheduler.configure(events: yes).activate(no)
	Imba.TagManager.refresh
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

	def self.build ctx
		self.new(self.createNode,ctx)

	def self.dom
		@protoDom ||= buildNode
		
	def self.end
		commit(0)

	###
	Called when a tag type is being subclassed.
	###
	def self.inherit child
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
	
	@private
	###
	def optimizeTagStructure
		return unless $web$
		var ctor = self:constructor
		let keys = Object.keys(self)

		if keys.indexOf('mount') >= 0
			if ctor.@classes and ctor.@classes.indexOf('__mount')  == -1
				ctor.@classes.push('__mount')

			if ctor.@protoDom
				ctor.@protoDom:classList.add('__mount')

		for key in keys
			Imba.EventManager.bind(key.slice(2)) if (/^on/).test(key)
		self


	def initialize dom,ctx
		self.dom = dom
		self:$ = TagCache.build(self)
		self:$up = @owner_ = ctx
		@tree_ = null
		self.FLAGS = 0
		build
		self

	attr name inline: no
	attr role inline: no
	attr tabindex inline: no
	attr title

	def dom
		@dom
		
	def setDom dom
		dom.@tag = self
		@dom = @slot_ = dom
		self

	def ref
		@ref
		
	def root
		@owner_ ? @owner_.root : self

	###
	Setting references for tags like
	`<div@header>` will compile to `tag('div').ref_('header',this).end()`
	By default it adds the reference as a className to the tag.

	@return {self}
	@private
	###
	def ref_ ref
		flag(@ref = ref)
		self

	###
	Set the data object for node
	@return {self}
	###
	def data= data
		@data = data

	###
	Get the data object for node
	###
	def data
		@data
		
		
	def bindData target, path, args
		setData(args ? target[path].apply(target,args) : target[path])

	###
	Set inner html of node
	###
	def html= html
		if self.html != html
			@dom:innerHTML = html

	###
	Get inner html of node
	###
	def html
		@dom:innerHTML
	
	def on$ slot,handler,context
		let handlers = @on_ ||= []
		let prev = handlers[slot]
		# self-bound handlers
		if slot < 0
			if prev == undefined
				slot = handlers[slot] = handlers:length
			else
				slot = prev
			prev = handlers[slot]
		
		handlers[slot] = handler
		if prev
			handler:state = prev:state
		else
			handler:state = {context: context}
			Imba.EventManager.bind(handler[0]) if $web$
		return self


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
		var old = dom.getAttribute(name)

		if old == value
			value
		elif value != null && value !== false
			dom.setAttribute(name,value)
		else
			dom.removeAttribute(name)
		return self

	def setNestedAttr ns, name, value, modifiers
		if self[ns+'SetAttribute']
			self[ns+'SetAttribute'](name,value, modifiers)
		else
			setAttributeNS(ns, name,value)
		return self

	def setAttributeNS ns, name, value
		var old = getAttributeNS(ns,name)

		if old != value
			if value != null && value !== false 
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
	
	
	def set key, value, mods
		let setter = Imba.toSetter(key)
		if self[setter] isa Function
			self[setter](value,mods)
		else
			@dom:setAttribute(key,value)
		self
	
	
	def get key
		@dom:getAttribute(key)

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
		# overridden on client by reconciler
		@tree_ = nodes
		self

	###
	Set the template that will render the content of node.
	@return {self}
	###
	def setTemplate template
		unless @template
			if self:render == Imba.Tag:prototype:render
				self:render = self:renderTemplate # do setChildren(renderTemplate)

		self:template = @template = template
		self

	def template
		null

	###
	If no custom render-method is defined, and the node
	has a template, this method will be used to render
	@return {self}
	###
	def renderTemplate
		var body = template
		setChildren(body) if body != self
		self


	###
	Remove specified child from current node.
	@return {self}
	###
	def removeChild child
		var par = dom
		var el = child.@slot_ or child
		if el and el:parentNode == par
			Imba.TagManager.remove(el.@tag or el,self)
			par.removeChild(el)
		self
	
	###
	Remove all content inside node
	###
	def removeAllChildren
		if @dom:firstChild
			var el
			while el = @dom:firstChild
				$web$ and Imba.TagManager.remove(el.@tag or el,self)
				@dom.removeChild(el)
		@tree_ = @text_ = null
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
			dom.appendChild(node.@slot_ or node)
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
			dom.insertBefore( (node.@slot_ or node), (rel.@slot_ or rel) )
			Imba.TagManager.insert(node.@tag or node, self)
			# FIXME ensure these are not called for text nodes
		self
	
	def detachFromParent
		if @slot_ == @dom
			@slot_ = (@dom.@placeholder_ ||= Imba.document.createComment("node"))
			@slot_.@tag ||= self

			if @dom:parentNode
				Imba.TagManager.remove(self,@dom:parentNode)
				@dom:parentNode.replaceChild(@slot_,@dom)
		self
		
	def attachToParent
		if @slot_ != @dom
			let prev = @slot_
			@slot_ = @dom
			if prev and prev:parentNode
				Imba.TagManager.insert(self)
				prev:parentNode.replaceChild(@dom,prev)
				
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
		@tree_ = txt
		@dom:textContent = (txt == null or text === false) ? '' : txt
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
	Empty placeholder. Override to implement custom render behaviour.
	Works much like the familiar render-method in React.
	@return {self}
	###
	def render
		self

	###
	Called implicitly while tag is initializing. No initial props
	will have been set at this point.
	@return {self}
	###
	def build
		self

	###
	Called once, implicitly through Imba.Tag#end. All initial props
	and children will have been set before setup is called.
	setContent.
	@return {self}
	###
	def setup
		self

	###
	Called implicitly through Imba.Tag#end, for tags that are part of
	a tag tree (that are rendered several times).
	@return {self}
	###
	def commit
		render if beforeRender !== false
		self
		
	def beforeRender
		self

	###

	Called by the tag-scheduler (if this tag is scheduled)
	By default it will call this.render. Do not override unless
	you really understand it.

	###
	def tick
		render if beforeRender !== false
		self

	###
	
	A very important method that you will practically never manually.
	The tag syntax of Imba compiles to a chain of setters, which always
	ends with .end. `<a.large>` compiles to `tag('a').flag('large').end()`
	
	You are highly adviced to not override its behaviour. The first time
	end is called it will mark the tag as initialized and call Imba.Tag#setup,
	and call Imba.Tag#commit every time.
	@return {self}
	###
	def end
		setup
		commit(0)
		this:end = Imba.Tag:end
		return self
		
	# called on <self> to check if self is called from other places
	def $open context
		if context != @context_
			@tree_ = null
			@context_ = context
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
			# firefox will trigger a change if adding existing class
			@dom:classList.add(name) unless @dom:classList.contains(name)
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

	
	def flagIf flag, bool
		var f = @flags_ ||= {}
		let prev = f[flag]

		if bool and !prev
			@dom:classList.add(flag)
			f[flag] = yes
		elif prev and !bool
			@dom:classList.remove(flag)
			f[flag] = no

		return self
		
	###
	Set/update a named flag. It remembers the previous
	value of the flag, and removes it before setting the new value.

		node.setFlag('type','todo')
		node.setFlag('type','project')
		# todo is removed, project is added.

	@return {self}
	###
	def setFlag name, value
		let flags = @namedFlags_ ||= {}
		let prev = flags[name]
		if prev != value
			unflag(prev) if prev
			flag(value) if value
			flags[name] = value
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
		Imba.getTagForDom(dom:parentNode)

	###
	Get the children of node
	@return {Imba.Tag[]}
	###
	def children sel
		for item in @dom:children
			item.@tag or Imba.getTagForDom(item)
	
	def querySelector q
		Imba.getTagForDom(@dom.querySelector(q))

	def querySelectorAll q
		var items = []
		for item in @dom.querySelectorAll(q)
			items.push( Imba.getTagForDom(item) )
		return items

	###
	Check if this node matches a selector
	@return {Boolean}
	###
	def matches sel
		if sel isa Function
			return sel(self)

		sel = sel.query if sel:query isa Function
		if var fn = (@dom:matches or @dom:matchesSelector or @dom:webkitMatchesSelector or @dom:msMatchesSelector or @dom:mozMatchesSelector)
			return fn.call(@dom,sel)

	###
	Get the first element matching supplied selector / filter
	traversing upwards, but including the node itself.
	@return {Imba.Tag}
	###
	def closest sel
		Imba.getTagForDom(@dom.closest(sel))

	###
	Check if node contains other node
	@return {Boolean} 
	###
	def contains node
		dom.contains(node.@dom or node)


	###
	Shorthand for console.log on elements
	@return {self}
	###
	def log *args
		args.unshift(console)
		Function:prototype:call.apply(console:log, args)
		self

	def css key, val, mod
		if key isa Object
			css(k,v) for own k,v of key
			return self

		var name = Imba.CSSKeyMap[key] or key

		if val == null
			dom:style.removeProperty(name)
		elif val == undefined and arguments:length == 1
			return dom:style[name]
		elif name.match(/^--/)
			dom:style.setProperty(name,val)
		else
			if val isa Number and (name.match(/width|height|left|right|top|bottom/) or (mod and mod:px))
				dom:style[name] = val + "px"
			else
				dom:style[name] = val
		self
		
	def setStyle style
		setAttribute('style',style)

	def style
		getAttribute('style')

	###
	Trigger an event from current node. Dispatched through the Imba event manager.
	To dispatch actual dom events, use dom.dispatchEvent instead.

	@return {Imba.Event}
	###
	def trigger name, data = {}
		$web$ ? Imba.Events.trigger(name,self,data: data) : null

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

class Imba.SVGTag < Imba.Tag

	def self.namespaceURI
		"http://www.w3.org/2000/svg"

	def self.buildNode
		var dom = Imba.document.createElementNS(namespaceURI,@nodeType)
		if @classes
			var cls = @classes.join(" ")
			dom:className:baseVal = cls if cls
		dom

	def self.inherit child
		child.@protoDom = null
		
		if self == Imba.SVGTag
			child.@nodeType = child.@name
			child.@classes = []
		else
			child.@nodeType = @nodeType
			var classes = (@classes or []).slice(0)
			if Imba.TAG_AUTOCLASS_SVG
				classes.push("_" + child.@name.replace(/_/g, '-'))
			child.@classes = classes


Imba.HTML_TAGS = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ")
Imba.HTML_TAGS_UNSAFE = "article aside header section".split(" ")

Imba.HTML_ATTRS =
	a: "href target hreflang media download rel type ping referrerpolicy"
	audio: "autoplay controls crossorigin loop muted preload src"
	area: "alt coords download href hreflang ping referrerpolicy rel shape target"
	base: "href target"
	video: "autoplay buffered controls crossorigin height loop muted preload poster src width playsinline"
	fieldset: "disabled form name"
	form: "method action enctype autocomplete target"
	button: "autofocus type form formaction formenctype formmethod formnovalidate formtarget value name"
	embed: "height src type width"
	input: "accept disabled form list max maxlength min minlength pattern required size step type"
	label: "accesskey for form"
	img: "alt src srcset crossorigin decoding height importance intrinsicsize ismap referrerpolicy sizes width usemap"
	link: "rel type href media"
	iframe: "allow allowfullscreen allowpaymentrequest height importance name referrerpolicy sandbox src srcdoc width"
	meta: "property content charset desc"
	map: "name"
	optgroup: "label"
	option: "label"
	output: "for form"
	object: "type data width height"
	param: "name type value valuetype"
	progress: "max"
	script: "src type async defer crossorigin integrity nonce language nomodule"
	select: "size form multiple"
	source: "sizes src srcset type media"
	textarea: "rows cols minlength maxlength form wrap"
	track: "default kind label src srclang"
	td: "colspan rowspan headers"
	th: "colspan rowspan"


Imba.HTML_PROPS =
	input: "autofocus autocomplete autocapitalize autocorrect value placeholder required disabled multiple checked readOnly spellcheck"
	textarea: "autofocus autocomplete autocapitalize autocorrect value placeholder required disabled multiple checked readOnly spellcheck"
	form: "novalidate"
	fieldset: "disabled"
	button: "disabled"
	select: "autofocus disabled required readOnly multiple"
	option: "disabled selected value"
	optgroup: "disabled"
	progress: "value"
	fieldset: "disabled"
	canvas: "width height"

var extender = do |obj, sup|
	for own k,v of sup
		obj[k] ?= v

	obj:prototype = Object.create(sup:prototype)
	obj:__super__ = obj:prototype:__super__ = sup:prototype
	obj:prototype:constructor = obj
	sup.inherit(obj) if sup:inherit
	return obj


var def Tag
	return do |dom,ctx|
		this.initialize(dom,ctx)
		return this

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

	def baseType name, ns
		name in Imba.HTML_TAGS ? 'element' : 'div'

	def defineTag fullName, supr = '', &body
		if body and body.@nodeType
			supr = body
			body = null
			
		if self[fullName]
			console.log "tag already exists?",fullName
		
		# if it is namespaced
		var ns
		var name = fullName
		let nsidx = name.indexOf(':')
		if  nsidx >= 0
			ns = fullName.substr(0,nsidx)
			name = fullName.substr(nsidx + 1)
			if ns == 'svg' and !supr
				supr = 'svg:element'

		supr ||= baseType(fullName)

		let supertype = supr isa String ? findTagType(supr) : supr
		let tagtype = Tag()

		tagtype.@name = name
		tagtype.@flagName = null

		if name[0] == '#'
			Imba.SINGLETONS[name.slice(1)] = tagtype
			self[name] = tagtype
		elif name[0] == name[0].toUpperCase
			if Imba.TAG_AUTOCLASS_LOCALS
				tagtype.@flagName = name
		else
			if Imba.TAG_AUTOCLASS_GLOBALS
				tagtype.@flagName = "_" + fullName.replace(/[_\:]/g, '-')
			self[fullName] = tagtype

		extender(tagtype,supertype)

		if body
			body.call(tagtype,tagtype, tagtype.TAGS or self)
			tagtype.defined if tagtype:defined
			optimizeTag(tagtype)
		return tagtype

	def defineSingleton name, supr, &body
		defineTag(name,supr,body)

	def extendTag name, supr = '', &body
		var klass = (name isa String ? findTagType(name) : name)
		# allow for private tags here as well?
		body and body.call(klass,klass,klass:prototype) if body
		klass.extended if klass:extended
		optimizeTag(klass)
		return klass

	def optimizeTag tagtype
		tagtype:prototype?.optimizeTagStructure
		
	def findTagType type
		let klass = self[type]
		unless klass
			if type.substr(0,4) == 'svg:'
				klass = defineTag(type,'svg:element')

			elif Imba.HTML_TAGS.indexOf(type) >= 0
				klass = defineTag(type,'element')

				if let attrs = Imba.HTML_ATTRS[type]
					for name in attrs.split(" ")
						Imba.attr(klass,name)
						
				if let props = Imba.HTML_PROPS[type]
					for name in props.split(" ")
						Imba.attr(klass,name,dom: yes)
		return klass

def Imba.createElement name, ctx, ref, pref
	var type = name
	var parent
	if name isa Function
		type = name
	else
		if $debug$
			throw("cannot find tag-type {name}") unless Imba.TAGS.findTagType(name)
		type = Imba.TAGS.findTagType(name)
	
	if ctx isa TagMap
		parent = ctx:par$
	elif pref isa Imba.Tag
		parent = pref
	else
		parent = ctx and pref != undefined ? ctx[pref] : (ctx and ctx.@tag or ctx)

	var node = type.build(parent)
	
	if ctx isa TagMap
		ctx:i$++
		node:$key = ref

	if ctx and ref != undefined
		ctx[ref] = node

	return node

def Imba.createTagCache owner
	var item = []
	item.@tag = owner
	return item
	
def Imba.createTagMap ctx, ref, pref
	var par = (pref != undefined ? pref : ctx.@tag)
	var node = TagMap.new(ctx,ref,par)
	ctx[ref] = node
	return node

def Imba.createTagList ctx, ref, pref
	var node = []
	node.@type = 4
	node.@tag = (pref != undefined ? pref : ctx.@tag)
	ctx[ref] = node
	return node

def Imba.createTagLoopResult ctx, ref, pref
	var node = []
	node.@type = 5
	node:cache = {i$: 0}
	return node

# use array instead?
class TagCache
	def self.build owner
		var item = []
		item.@tag = owner
		return item

	def initialize owner
		self.@tag = owner
		self
	
class TagMap
	
	def initialize cache, ref, par
		self:cache$ = cache
		self:key$ = ref
		self:par$ = par
		self:i$ = 0
	
	def $iter
		var item = []
		item.@type = 5
		item:cache = self
		return item
		
	def $prune items
		let cache = self:cache$
		let key = self:key$
		let clone = TagMap.new(cache,key,self:par$)
		for item in items
			clone[item:key$] = item
		clone:i$ = items:length
		return cache[key] = clone

Imba.TagMap = TagMap
Imba.TagCache = TagCache
Imba.SINGLETONS = {}
Imba.TAGS = Imba.Tags.new
Imba.TAGS[:element] = Imba.TAGS[:htmlelement] = Imba.Tag
Imba.TAGS['svg:element'] = Imba.SVGTag

def Imba.defineTag name, supr = '', &body
	return Imba.TAGS.defineTag(name,supr,body)

def Imba.defineSingletonTag id, supr = 'div', &body
	return Imba.TAGS.defineTag(name,supr,body)

def Imba.extendTag name, body
	return Imba.TAGS.extendTag(name,body)

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

# shuold be phased out
def Imba.getTagForDom dom
	return null unless dom
	return dom if dom.@dom
	return dom.@tag if dom.@tag
	return null unless dom:nodeName

	var name = dom:nodeName.toLowerCase
	var type = name
	var ns = Imba.TAGS

	if dom:id and Imba.SINGLETONS[dom:id]
		return Imba.getTagSingleton(dom:id)
		
	if svgSupport and dom isa SVGElement
		type = ns.findTagType("svg:" + name)
	elif Imba.HTML_TAGS.indexOf(name) >= 0
		type = ns.findTagType(name)
	else
		type = Imba.Tag

	return type.new(dom,null).awaken(dom)


if $web$ and $es5$ and document
	var styles = window.getComputedStyle(document:documentElement, '')

	for prefixed in styles
		var unprefixed = prefixed.replace(/^-(webkit|ms|moz|o|blink)-/,'')
		var camelCase = unprefixed.replace(/-(\w)/g) do |m,a| a.toUpperCase

		# if there exists an unprefixed version -- always use this
		if prefixed != unprefixed
			continue if styles.hasOwnProperty(unprefixed)

		# register the prefixes
		Imba.CSSKeyMap[unprefixed] = Imba.CSSKeyMap[camelCase] = prefixed

	# Ovverride classList
	if !document:documentElement:classList
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
