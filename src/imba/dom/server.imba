var Imba = require("../imba")

# TODO classes should not be global,
# rather imported where they are needed

var voidElements = {
	area: yes
	base: yes
	br: yes
	col: yes
	embed: yes
	hr: yes
	img: yes
	input: yes
	keygen: yes
	link: yes
	meta: yes
	param: yes
	source: yes
	track: yes
	wbr: yes
}

# could create a fake document 
global class ImbaServerDocument

	def createElement type
		return ImbaServerElement.new(type)

	def createElementNS ns, type
		return ImbaServerElement.new(type)

	def createTextNode value
		return value

def Imba.document
	@document ||= ImbaServerDocument.new
	
	
def escapeAttributeValue val
	var str = typeof val == 'string' ? val : String(val)
	if str.indexOf('"') >= 0
		str = str.replace(/\"/g,"&quot;")
	return str
	
def escapeTextContent val, nodeName
	var str = typeof val == 'string' ? val : String(val)
	
	if nodeName == 'script'
		return str

	if str.indexOf('"') >= 0
		str = str.replace(/\"/g,"&quot;")
	if str.indexOf('<') >= 0
		str = str.replace(/\</g,"&lt;")
	if str.indexOf('>') >= 0
		str = str.replace(/\>/g,"&gt;")
	return str

# could optimize by using a dictionary in addition to keys
# where we cache the indexes?
global class ImbaNodeClassList

	def initialize dom, classes
		@classes = classes or []
		@dom = dom

	def add flag
		@classes.push(flag) unless @classes.indexOf(flag) >= 0
		self

	def remove flag
		# TODO implement!
		# @classes.push(flag) unless @classes.indexOf(flag) >= 0
		var idx = @classes.indexOf(flag)
		if idx >= 0
			@classes[idx] = ''
		self

	def toggle flag
		contains(flag) ? remove(flag) : add(flag)
		self

	def contains flag
		@classes.indexOf(flag) >= 0

	def clone dom
		var clone = ImbaNodeClassList.new(dom,@classes.slice(0))
		return clone
		
	def toString
		# beware of perf
		@classes.join(" ").trim

class CSSStyleDeclaration

	def initialize dom
		@dom = dom
		self
		
	def toString
		var items = []
		for own k,v of self
			unless k[0] == '_'
				items.push("{k}: {v}")
		return items.join(';')

global class ImbaServerElement

	def self.getter name, fn
		Object.defineProperty(self:prototype, name, {
			get: fn,
			enumerable: true,
			configurable: true
		})

	def initialize type
		# slowing things down -- be careful
		# should only need to copy from the outer element
		# when we optimize - do it some other way

		# should somehow be linked to their owner, no?
		self:nodeName  = type
		self:classList = ImbaNodeClassList.new(self)
		self:children  = []
			
		self

	def cloneNode deep
		# need to include classes as well
		var el = ImbaServerElement.new(self:nodeName)
		el:classList = self:classList.clone(self)
		# FIXME clone the attributes as well
		# el:className = self:className
		return el

	def appendChild child
		# again, could be optimized much more
		if typeof child === 'string'
			self:children.push(escapeTextContent(child,self:nodeName))
		else
			self:children.push(child)

		return child

	def insertBefore node, before
		var idx = self:children.indexOf(before)
		arr.splice(idx, 0, node)
		self

	def setAttribute key, value
		@attributes ||= []
		@attributes.push("{key}=\"{escapeAttributeValue(value)}\"")
		@attributes[key] = value
		self

	def setAttributeNS ns, key, value
		setAttribute(ns + ':' + key,value)

	def getAttribute key
		# console.log "getAttribute not implemented on server"
		@attributes ? @attributes[key] : undefined

	def getAttributeNS ns, key
		getAttribute(ns + ':' + key)

	def removeAttribute key
		console.log "removeAttribute not implemented on server"
		true
	
	# noop
	def addEventListener
		self
	
	# noop
	def removeEventListener
		self

	def __innerHTML
		return self:innerHTML || (self:textContent and escapeTextContent(self:textContent,self:nodeName)) || (self:children and self:children.join("")) or ''
	
	def __outerHTML
		var typ = self:nodeName
		var sel = "{typ}"

		sel += " id=\"{escapeAttributeValue(v)}\"" if var v = self:id
		sel += " class=\"{escapeAttributeValue(v)}\"" if var v = self:classList.toString
		sel += " {@attributes.join(" ")}" if var v = @attributes

		# temporary workaround for IDL attributes
		# needs support for placeholder etc
		sel += " placeholder=\"{escapeAttributeValue(v)}\"" if v = self:placeholder
		sel += " value=\"{escapeAttributeValue(v)}\"" if v = self:value
		sel += " checked" if self:checked
		sel += " disabled" if self:disabled
		sel += " required" if self:required
		sel += " readonly" if self:readOnly
		sel += " autofocus" if self:autofocus
		
		if @style
			sel += " style=\"{escapeAttributeValue(@style)}\""

		if voidElements[typ]
			return "<{sel}>"
		else
			return "<{sel}>{__innerHTML}</{typ}>"

	def toString
		if @tag and @tag:toNodeString
			# console.log "tag has custom string {@nodeType}" # ,self:children
			return @tag.toNodeString
			# return @tag.toNodeString
		__outerHTML

	getter 'outerHTML' do
		this.__outerHTML

	getter 'firstChild' do
		this:children and this:children[0]

	getter 'firstElementChild' do
		this:children and this:children[0]

	getter 'lastElementChild' do
		this:children and this:children[this:children:length - 1]
		
	getter 'style' do
		this:_style ||= CSSStyleDeclaration.new(this)

var el = ImbaServerElement:prototype

Object.defineProperty(el, 'className',
	enumerable: true
	configurable: true

	get: do
		this:classList.toString

	set: do |v|
		this:classList.@classes = (v or '').split(' ')
		this:classList.toString		
)

extend tag element
	
	def empty
		@dom:children = []
		@dom:innerHTML = null
		@empty = yes
		self

	def first
		@dom:children[0]
	
	def last
		@dom:children[@dom:children:length - 1]

	def prepend item
		@dom:children.unshift(item)

	def toString
		dom.toString

extend tag html

	def doctype
		@doctype || "<!doctype html>"

	def toString
		doctype + super


# global:document ||= Imba.document
