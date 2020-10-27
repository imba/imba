const {Node,Element,Comment,Text} = imba.dom

# what if this is in a webworker?
extend class Element
	
	def log ...params
		console.log(...params)
		self

	def slot$ name, ctx
		return self

	# inline in files or remove all together?
	def text$ item
		self.textContent = item
		self

	def insert$ item, f, prev
		let type = typeof item

		if type === 'undefined' or item === null
			# what if the prev value was the same?
			if prev and prev isa Comment # check perf
				return prev

			let el = imba.document.createComment('')
			prev ? prev.replaceWith$(el) : el.insertInto$(this)
			return el

		# dont reinsert again
		if item === prev
			return item

		# what if this is null or undefined -- add comment and return? Or blank text node?
		elif type !== 'object'
			let res
			let txt = item
			
			if (f & $TAG_FIRST_CHILD$) && (f & $TAG_LAST_CHILD$)
				# FIXME what if the previous one was not text? Possibly dangerous
				# when we set this on a fragment - it essentially replaces the whole
				# fragment?
				self.textContent = txt
				return

			if prev
				if prev isa Text # check perf
					prev.textContent = txt
					return prev
				else
					res = imba.document.createTextNode(txt)
					prev.replaceWith$(res,self)
					return res
			else
				self.appendChild$(res = imba.document.createTextNode(txt))
				return res	

		else
			prev ? prev.replaceWith$(item,self) : item.insertInto$(self)
			return item
		return

	def open$
		self

	def close$
		self

	def end$
		self.render() if self.render
		return

Element.prototype.appendChild$  = Element.prototype.appendChild
Element.prototype.removeChild$  = Element.prototype.removeChild
Element.prototype.insertBefore$ = Element.prototype.insertBefore
Element.prototype.replaceChild$ = Element.prototype.replaceChild

Element.prototype.set$ = Element.prototype.setAttribute
Element.prototype.setns$ = Element.prototype.setAttributeNS

def imba.createElement name, parent, flags, text
	var el = imba.document.createElement(name)
		
	el.className = flags if flags

	if text !== null
		el.text$(text)

	if parent and parent isa Node
		el.insertInto$(parent)

	return el