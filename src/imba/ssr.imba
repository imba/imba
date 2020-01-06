# TODO classes should not be global,
# rather imported where they are needed

var root = (typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null))

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


class CustomElementRegistry

	def define
		self

	def get
		self

root.customElements ||= CustomElementRegistry.new()


var escapeAttributeValue = do |val|
	var str = typeof val == 'string' ? val : String(val)
	if str.indexOf('"') >= 0
		str = str.replace(/\"/g,"&quot;")
	return str
	
var escapeTextContent = do |val, nodeName|
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

# could create a fake document 
export class root.Document

	def createElement type
		return Element.new(type)

	def createElementNS ns, type
		return ns == 'svg' ? SVGElement.new(type) : HTMLElement.new(type)

	def createTextNode value
		return Text.new(value)
		
	def createComment value
		return Comment.new(value)


# could optimize by using a dictionary in addition to keys
# where we cache the indexes?
export class DOMTokenList

	def initialize dom, classes
		this.classes = classes or []
		this.dom = dom

	def add flag
		self.classes.push(flag) unless self.classes.indexOf(flag) >= 0
		self

	def remove flag
		# TODO implement!
		# @classes.push(flag) unless @classes.indexOf(flag) >= 0
		var idx = self.classes.indexOf(flag)
		if idx >= 0
			self.classes[idx] = ''
		self

	def toggle flag
		self.contains(flag) ? self.remove(flag) : self.add(flag)
		self

	def contains flag
		self.classes.indexOf(flag) >= 0

	def clone dom
		var clone = DOMTokenList.new(dom,self.classes.slice(0))
		return clone
		
	def toString
		# beware of perf
		self.classes.join(" ").trim()

export class StyleDeclaration

	def initialize dom
		self.dom = dom
		self
		
	def removeProperty key
		delete self[key]
	
	def setProperty name, value
		self[name] = value
		
	def toString
		var items = []
		for own k,v of self
			unless k[0] == '_'
				items.push("{k}: {v}")
		return items.join(';')

export class root.Node

	# appendChild
	# removeChild etc

export class root.Element < root.Node

	def initialize type
		self.nodeName  = type
		self.children = []
		self

	get classList
		#classList ||= DOMTokenList.new(self)

	get style
		#style ||= StyleDeclaration.new(this)

	def flag$
		self

	def flagIf$
		self

	def end$
		self

	def close$
		self

	def open$
		self

	def appendChild child
		# again, could be optimized much more
		if typeof child === 'string'
			self.children.push(escapeTextContent(child,self.nodeName))
		else
			self.children.push(child)

		return child
	
	def appendNested child
		if child isa Array
			for member in child
				self.appendNested(member)

		elif child != null and child != undefined
			self.appendChild(child.slot_ or child)
		return

	def insertBefore node, before
		var idx = self.children.indexOf(before)
		self.children.splice(idx, 0, node)
		self

	def setAttribute key, value
		self.attributes ||= []
		self.attrmap ||= {}
		
		let idx = self.attrmap[key]
		let str = "{key}=\"{escapeAttributeValue(value)}\""

		if idx != null
			self.attributes[idx] = str
		else
			self.attributes.push(str)
			self.attrmap[key] = self.attributes.length - 1

		self.attributes[key] = value
		self

	def setAttributeNS ns, key, value
		self.setAttribute(ns + ':' + key,value)

	def getAttribute key
		# console.log "getAttribute not implemented on server"
		self.attributes ? self.attributes[key] : undefined

	def getAttributeNS ns, key
		self.getAttribute(ns + ':' + key)

	def removeAttribute key
		console.log "removeAttribute not implemented on server"
		true
	
	# noop
	def addEventListener
		self
	
	# noop
	def removeEventListener
		self
		
	def resolve
		if self.tag and self.resolvedChildren != self.tag.__slots_
			var content = self.tag.__slots_
			self.resolvedChildren = content
			self.children = []
			self.appendNested(content)
		self

	set innerHTML value
		#innerHTML = value

	get innerHTML
		var o = ""
		for item,i in self.tag.__slots_
			if item isa String
				o += escapeTextContent(item,self.nodeName)
			elif item isa Number
				o += "" + item
			elif item
				o += item.outerHTML
		return o
		# self.resolve()
		# return #innerHTML || (self.textContent and escapeTextContent(self.textContent,self.nodeName)) || (self.children and self.children.join("")) or ''
	
	get outerHTML
		var typ = self.nodeName
		var sel = "{typ}"
		
		sel += " id=\"{escapeAttributeValue(v)}\"" if var v = self.id
		sel += " class=\"{escapeAttributeValue(v)}\"" if var v = self.classList.toString()
		sel += " {self.attributes.join(" ")}" if var v = self.attributes

		# temporary workaround for IDL attributes
		# needs support for placeholder etc
		sel += " placeholder=\"{escapeAttributeValue(v)}\"" if v = self.placeholder
		sel += " value=\"{escapeAttributeValue(v)}\"" if v = self.value
		sel += " checked" if  self.checked
		sel += " disabled" if self.disabled
		sel += " required" if self.required
		sel += " readonly" if self.readOnly
		sel += " autofocus" if self.autofocus
		
		# console.log("generating outer html",sel)

		if #style
			sel += " style=\"{escapeAttributeValue(#style.toString())}\""

		if voidElements[typ]
			return "<{sel}>"
		else
			return "<{sel}>{self.innerHTML}</{typ}>"

	set children value
		#children = value

	get children
		self.resolve()
		return #children

	get firstChild
		self.children[0]

	get firstElementChild
		self.children[0]

	get lastElementChild
		self.children[self.children.length - 1]
	
	

	get className
		self.classList.toString()

	set className value
		self.classList.classes = (value or '').split(' ')
		self.classList.toString()

export class root.HTMLElement < root.Element

export class root.SVGElement < root.Element

export class root.Text < root.Element

export class root.Comment < root.Element
	
	def initialize value
		self.value = value
		
	get outerHTML
		"<!-- {escapeTextContent(self.value)} -->"
		
	def toString
		if self.tag and self.tag.toNodeString
			return self.tag.toNodeString()
		self.outerHTML
