import {DocumentFragment,Element,Text,ShadowRoot,document} from '../dom'

extend class DocumentFragment

	get parentContext
		this.up$ or #parent

	# Called to make a documentFragment become a live fragment
	def setup$ flags, options
		#start = imba.document.createComment('start')
		#end = imba.document.createComment('end')

		#end.replaceWith$ = do |other|
			this.parentNode.insertBefore(other,this)
			return other

		this.appendChild(#start)
		this.appendChild(#end)
	
	# when we for sure know that the only content should be
	# a single text node
	def text$ item
		unless #text
			#text = this.insert$(item)
		else
			#text.textContent = item
		return
	
	def insert$ item, options, toReplace
		if #parent
			# if the fragment is attached to a parent
			# we can just proxy the call through
			#parent.insert$(item,options,toReplace or #end)
		else
			Element.prototype.insert$.call(this,item,options,toReplace or #end)

	def insertInto$ parent, before
		unless #parent
			#parent = parent
			# console.log 'insertFrgment into',parent,Array.from(self.childNodes)
			parent.appendChild$(this)
		return this

	def replaceWith$ other, parent
		#start.insertBeforeBegin$(other)
		var el = #start
		while el
			let next = el.nextSibling
			self.appendChild(el)
			break if el == #end
			el = next
			
		return other

	def appendChild$ child
		#end ? #end.insertBeforeBegin$(child) : self.appendChild(child)
		return child

	def removeChild$ child
		child.parentNode && child.parentNode.removeChild(child)
		self

	def isEmpty$
		let el = #start
		let end = #end

		while el = el.nextSibling
			break if el == end
			return false if el isa Element or el isa Text
		return true


extend class ShadowRoot
	get parentContext
		self.host

class TagCollection
	def constructor f, parent
		#f = f
		#parent = parent

		if !(f & $TAG_FIRST_CHILD$) and self isa KeyedTagFragment
			#start = document.createComment('start')
			parent.appendChild$(#start) if parent # not if inside tagbranch

		unless f & $TAG_LAST_CHILD$
			#end = document.createComment('end')
			parent.appendChild$(#end) if parent

		self.setup()

	get parentContext
		#parent

	def appendChild$ item, index
		# we know that these items are dom elements
		if #end and #parent
			#end.insertBeforeBegin$(item)
		elif #parent
			#parent.appendChild$(item)
		return

	def replaceWith$ other
		self.detachNodes()
		#end.insertBeforeBegin$(other)
		#parent.removeChild$(#end)
		#parent = null
		return

	def joinBefore$ before
		self.insertInto$(before.parentNode,before)

	def insertInto$ parent, before
		unless #parent
			#parent = parent
			before ? before.insertBeforeBegin$(#end) : parent.appendChild$(#end)
			self.attachNodes()
		return this
	
	def replace$ other
		unless #parent
			#parent = other.parentNode
		other.replaceWith$(#end)
		self.attachNodes()
		self
		
	def setup
		self

class KeyedTagFragment < TagCollection
	def setup
		self.array = []
		self.changes = Map.new
		self.dirty = no
		self.$ = {}

	def push item, idx
		# on first iteration we can merely run through
		unless #f & $TAG_INITED$
			self.array.push(item)
			self.appendChild$(item)
			return

		let toReplace = self.array[idx]

		if toReplace === item
			yes
		else
			self.dirty = yes
			# if this is a new item
			let prevIndex = self.array.indexOf(item)
			let changed = self.changes.get(item)

			if prevIndex === -1
				# should we mark the one currently in slot as removed?
				self.array.splice(idx,0,item)
				self.insertChild(item,idx)

			elif prevIndex === idx + 1
				if toReplace
					self.changes.set(toReplace,-1)
				self.array.splice(idx,1)

			else
				self.array.splice(prevIndex,1) if prevIndex >= 0
				self.array.splice(idx,0,item)
				self.insertChild(item,idx)

			if changed == -1
				self.changes.delete(item)
		return

	def insertChild item, index
		if index > 0
			let other = self.array[index - 1]
			# will fail with text nodes
			other.insertAfterEnd$(item)
		elif #start
			#start.insertAfterEnd$(item)
		else
			#parent.insertAfterBegin$(item)
		return

	def removeChild item, index
		# self.map.delete(item)
		# what if this is a fragment or virtual node?
		if item.parentNode == #parent
			#parent.removeChild(item)
		return

	def attachNodes
		for item,i in self.array
			#end.insertBeforeBegin$(item)
		return

	def detachNodes
		for item in self.array
			#parent.removeChild(item)
		return

	def end$ index
		unless #f & $TAG_INITED$
			#f |= $TAG_INITED$
			return

		if self.dirty
			self.changes.forEach do |pos,item|
				if pos == -1
					self.removeChild(item)
			self.changes.clear()
			self.dirty = no

		# there are some items we should remove now
		if self.array.length > index
			
			# remove the children below
			while self.array.length > index
				let item = self.array.pop()
				self.removeChild(item)
			# self.array.length = index
		return

class IndexedTagFragment < TagCollection

	def setup
		self.$ = []
		self.length = 0

	def end$ len
		let from = self.length
		return if from == len or !#parent
		let array = self.$
		let par = #parent

		if from > len
			while from > len
				par.removeChild$(array[--from])
		elif len > from
			while len > from
				self.appendChild$(array[from++])
		self.length = len
		return

	def attachNodes
		for item,i in self.$
			break if i == self.length
			#end.insertBeforeBegin$(item)
		return

	def detachNodes
		let i = 0
		while i < self.length
			let item = self.$[i++]
			#parent.removeChild$(item)
		return

export def createLiveFragment bitflags, options, par
	var el = document.createDocumentFragment()
	el.setup$(bitflags, options)
	el.up$ = par if par
	return el

export def createIndexedFragment bitflags, parent
	return IndexedTagFragment.new(bitflags,parent)

export def createKeyedFragment bitflags, parent
	return KeyedTagFragment.new(bitflags,parent)


