


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
		self

	def clone dom
		var clone = ImbaNodeClassList.new(dom,@classes.slice(0))
		return clone
		
	def toString
		# beware of perf
		@classes.join(" ").trim
		

global class ImbaServerElement

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
		self:children.push(child)
		return child

	def insertBefore node, before
		var idx = self:children.indexOf(before)
		arr.splice(idx, 0, node)
		self

	# should implement at some point
	# should also use shortcut to wipe
	# def firstChild
	# 	nil
	# 
	# def removeChild
	# 	nil

	def setAttribute key, value
		@attributes ||= []
		@attributes.push("{key}=\"{value}\"")
		@attributes[key] = value
		self

	def getAttribute key
		# console.log "getAttribute not implemented on server"
		@attributes ? @attributes[key] : undefined

	def removeAttribute key
		console.log "removeAttribute not implemented on server"
		true

	def __innerHTML
		return self:innerHTML || self:textContent || (self:children and self:children.join("")) or ''
	
	def __outerHTML
		var typ = self:nodeName
		var sel = "{typ}"
		# difficult with all the attributes etc?
		# iterating through keys is slow (as tested) -
		# the whole point is to not need this on the server either
		# but it can surely be fixed later
		# and what if we use classList etc?
		# we do instead want to make it happen directly
		# better to use setAttribute or something, so we can get the
		# order and everything. It might not even matter though - fast
		# no matter what.
		sel += " id='{v}'" if var v = self:id
		sel += " class='{v}'" if var v = self:classList.toString
		sel += " {@attributes.join(" ")}" if var v = @attributes

		# var inner = self:innerHTML || self:textContent || (self:children and self:children.join("")) or ''
		return "<{sel}>{__innerHTML}</{typ}>"

	def toString
		if @tag and @tag:toNodeString
			# console.log "tag has custom string {@nodeType}" # ,self:children
			return @tag.toNodeString
			# return @tag.toNodeString
		__outerHTML


var el = ImbaServerElement:prototype
Object.defineProperty(el, 'firstChild',
	get: (|v| this:children and this:children[0] ),
	enumerable: true,
	configurable: true
)

Object.defineProperty(el, 'firstElementChild',
	get: (|v| this:children and this:children[0] ),
	enumerable: true,
	configurable: true
)

Object.defineProperty(el, 'lastElementChild',
	get: (|v| this:children and this:children[this:children:length - 1] ),
	enumerable: true,
	configurable: true
)

extend tag htmlelement

	def toString
		dom.toString

	def empty
		@dom:children = []
		@dom:innerHTML = null
		# @dom.removeChild(@dom:firstChild) while @dom:firstChild
		@empty = yes
		self

	def first
		@dom:children[0]
	
	def last
		@dom:children[@dom:children:length - 1]
	
	def prepend item
		@dom:children.unshift(item)


extend tag html

	def doctype
		@doctype || "<!doctype html>"

	def toString
		doctype + super
		# <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

extend tag style
	
	def toString
		"<style/>"

global:document ||= Imba.document
