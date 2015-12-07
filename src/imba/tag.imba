def Imba.static items, nr
	items:static = nr
	return items

###
This is the baseclass that all tags in imba inherit from.
@iname node
###
class Imba.Tag

	def self.createNode
		throw "Not implemented"

	def self.build
		self.new(self.createNode)

	prop object

	def dom
		@dom

	def initialize dom
		self.dom = dom
		
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
		dom:id = id
		self

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
		throw "Not implemented"

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
		throw "Not implemented"

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
		if @built
			commit
		else
			@built = yes
			build
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
		if arguments:length == 2 and !toggler
			@dom:classList.remove(name)
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
	def schedule options = {}
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
	Shorthand for console.log on elements
	@return {self}
	###
	def log *args
		args.unshift(console)
		Function:prototype:call.apply(console:log, args)
		self


Imba.Tag:prototype:initialize = Imba.Tag

HTML_TAGS = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ")
HTML_TAGS_UNSAFE = "article aside header section".split(" ")
SVG_TAGS = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ")


def extender obj, sup
	for own k,v of sup
		obj[k] ?= v

	obj:prototype = Object.create(sup:prototype)
	obj:__super__ = obj:prototype:__super__ = sup:prototype
	obj:prototype:initialize = obj:prototype:constructor = obj
	sup.inherit(obj) if sup:inherit
	return obj

def Tag
	return do |dom|
		this.setDom(dom)
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

	def defineNamespace name
		var clone = Object.create(self)
		clone.@parent = self
		clone.@ns = name
		self[name.toUpperCase] = clone
		return clone

	def baseType name
		name in HTML_TAGS ? 'htmlelement' : 'div'

	def defineTag name, supr = '', &body
		supr ||= baseType(name)
		let supertype = self[supr]
		let tagtype = Tag()
		let norm = name.replace(/\-/g,'_')


		tagtype.@name = name
		extender(tagtype,supertype)

		if name[0] == '#'
			self[name] = tagtype
			Imba.SINGLETONS[name.slice(1)] = tagtype
		else
			self[name] = tagtype
			self['$'+norm] = TagSpawner(tagtype)

		if body
			if body:length == 2
				# create clone
				unless tagtype.hasOwnProperty('TAGS')
					tagtype.TAGS = (supertype.TAGS or self).__clone

			body.call(tagtype,tagtype, tagtype.TAGS or self)

		return tagtype

	def defineSingleton name, supr, &body
		defineTag(name,supr,body)

	def extendTag name, supr = '', &body
		var klass = (name isa String ? self[name] : name)
		# allow for private tags here as well?
		body and body.call(klass,klass,klass:prototype) if body
		return klass


Imba.TAGS = Imba.Tags.new
Imba.TAGS[:element] = Imba.Tag

var svg = Imba.TAGS.defineNamespace('svg')

def svg.baseType name
	'svgelement'


Imba.SINGLETONS = {}


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
		tags = tags.SVG

	var spawner

	if cls
		# there can be several matches here - should choose the last
		# should fall back to less specific later? - otherwise things may fail
		# TODO rework this
		if var m = cls.match(/\b_([a-z\-]+)\b(?!\s*_[a-z\-]+)/)
			type = m[1] # .replace(/-/g,'_')

		if m = cls.match(/\b([A-Z\-]+)_\b/)
			ns = m[1]


	spawner = tags[type] or tags[native]
	spawner ? spawner.new(dom).awaken(dom) : null

tag$ = Imba.TAGS
t$ = Imba:tag
tc$ = Imba:tagWithFlags
ti$ = Imba:tagWithId
tic$ = Imba:tagWithIdAndFlags
id$ = Imba:getTagSingleton
tag$wrap = Imba:getTagForDom

