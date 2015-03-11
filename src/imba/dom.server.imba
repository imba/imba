# could create a fake document 
class ImbaServerDocument

	def createElement type
		return ImbaServerElement.new(type)

	def createElementNS ns, type
		return ImbaServerElement.new(type)

	def createTextNode value
		return value # hmm


class ImbaNodeClassList

	def initialize dom, classes
		@classes = classes or []
		@dom = dom

	def add flag
		@classes.push(flag) unless @classes.indexOf(flag) >= 0
		self

	def remove flag
		# TODO implement!
		# @classes.push(flag) unless @classes.indexOf(flag) >= 0	
		self

	def toggle flag
		self

	def clone dom
		var clone = ImbaNodeClassList.new(dom,@classes.slice(0))
		return clone
		
	def toString
		@classes.join(" ")
		

class ImbaServerElement

	def initialize type
		# slowing things down -- be careful
		# should only need to copy from the outer element
		# when we optimize - do it some other way

		# should somehow be linked to their owner, no?
		@nodeType = type
		self:classList = ImbaNodeClassList.new(self)
		self

	def cloneNode deep
		# need to include classes as well
		var el = ImbaServerElement.new(@nodeType)
		el:classList = self:classList.clone(self)
		# FIXME clone the attributes as well
		# el:className = self:className
		return el

	def appendChild child
		# again, could be optimized much more
		@children ||= []
		@children.push(child)
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
		self

	def getAttribute key
		console.log "getAttribute not implemented on server"
		true

	def removeAttribute key
		console.log "removeAttribute not implemented on server"
		true
		

	def toString
		var typ = @nodeType
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

		if @children
			"<{sel}>{@children.join("")}</{typ}>"
		elif self:textContent
			"<{sel}>{self:textContent}</{typ}>"
		# what about self-closing?
		else
			"<{sel}></{typ}>"

extend tag html

	def doctype
		@doctype || "<!doctype html>"

	def toString
		doctype + super
		# <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">


# hmm
Imba:doc = global:document || ImbaServerDocument.new
global:document ||= Imba:doc
