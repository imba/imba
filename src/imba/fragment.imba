

extend class DocumentFragment
	
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

	def insertInto$ parent
		unless #parent
			#parent = parent
			parent.appendChild$(this)
		return this

	def replaceWith$ other
		#start.insertBeforeBegin$(other)
		var el = #start
		while el
			let next = el.nextSibling
			@appendChild(el)
			break if el == #end
			el = next
			
		return other

	def appendChild$ child
		#end.insertBeforeBegin$(child)
		return child

	def removeChild$ child
		child.parentNode && child.parentNode.removeChild(child)
		self



class TagFragment

	def constructor f, parent
		#f = f
		#parent = parent

		if !(f & $TAG_FIRST_CHILD$) and self isa KeyedTagFragment
			#start = imba.document.createComment('start')
			#parent.appendChild(#start) if #parent

		unless f & $TAG_LAST_CHILD$
			#end = imba.document.createComment('end')
			parent.appendChild(#end) if parent

		self.setup()

	def appendChild$ item, index
		# we know that these items are dom elements
		if #end
			#end.insertBeforeBegin$(item)
		else
			#parent.appendChild(item)
		return

	def setup
		self

class KeyedTagFragment < TagFragment
	def setup
		@array = []
		@changes = Map.new
		@dirty = no
		@$ = {}

	def push item, idx
		# on first iteration we can merely run through
		unless #f & $TAG_AWAKENED$
			@array.push(item)
			self.appendChild$(item)
			return

		let toReplace = @array[idx]

		if toReplace === item
			yes
		else
			@dirty = yes
			# if this is a new item
			let prevIndex = @array.indexOf(item)
			let changed = @changes.get(item)

			if prevIndex === -1
				# should we mark the one currently in slot as removed?
				@array.splice(idx,0,item)
				self.insertChild(item,idx)

			elif prevIndex === idx + 1
				if toReplace
					@changes.set(toReplace,-1)
				@array.splice(idx,1)

			else
				@array.splice(prevIndex,1) if prevIndex >= 0
				@array.splice(idx,0,item)
				self.insertChild(item,idx)

			if changed == -1
				@changes.delete(item)
		return

	def insertChild item, index
		if index > 0
			let other = @array[index - 1]
			# will fail with text nodes
			other.insertAdjacentElement('afterend',item)
		elif #start
			#start.insertAfterEnd$(item)
		else
			#parent.insertAdjacentElement('afterbegin',item)
		return

	def removeChild item, index
		# @map.delete(item)
		# what if this is a fragment or virtual node?
		if item.parentNode == #parent
			#parent.removeChild(item)
		return

	def end$ index
		unless #f & $TAG_AWAKENED$
			#f |= $TAG_AWAKENED$
			return

		if @dirty
			@changes.forEach do |pos,item|
				if pos == -1
					@removeChild(item)
			@changes.clear()
			@dirty = no

		# there are some items we should remove now
		if @array.length > index
			
			# remove the children below
			while @array.length > index
				let item = @array.pop()
				@removeChild(item)
			# @array.length = index
		return

class IndexedTagFragment < TagFragment

	def setup
		@$ = []
		@length = 0

	def push item, idx
		return

	def end$ len
		let from = @length
		return if from == len
		let array = @$

		if from > len
			while from > len
				@removeChild(array[--from])
		elif len > from
			while len > from
				@appendChild$(array[from++])
		@length = len
		return

	def insertInto parent, slot
		self

	def removeChild item, index
		# item need to be able to be added
		#parent.removeChild(item)
		return

export def createLiveFragment bitflags, options
	var el = imba.document.createDocumentFragment()
	el.setup$(bitflags, options)
	return el

export def createFragment bitflags, parent
	if bitflags & $TAG_INDEXED$
		return IndexedTagFragment.new(bitflags,parent)
	else
		return KeyedTagFragment.new(bitflags,parent)


