

extend class DocumentFragment
	
	# Called to make a documentFragment become a live fragment
	def setup$ flags, options
		#start = document.createComment('start')
		#end = document.createComment('end')

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
			parent.appendChild$(this)
		return this

	def replaceWith$ other, parent
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

	def isEmpty$
		let el = #start
		let end = #end

		while el = el.nextSibling
			break if el == end
			return false if el isa Element or el isa Text
		return true

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

	def appendChild$ item, index
		# we know that these items are dom elements
		if #end and #parent
			#end.insertBeforeBegin$(item)
		elif #parent
			#parent.appendChild(item)
		return

	def replaceWith$ other
		@detachNodes()
		#end.insertBeforeBegin$(other)
		#parent.removeChild(#end)
		#parent = null
		return

	def joinBefore$ before
		@insertInto$(before.parentNode,before)

	def insertInto$ parent, before
		unless #parent
			#parent = parent
			before ? before.insertBeforeBegin$(#end) : parent.appendChild$(#end)
			@attachNodes()
		return this

	def setup
		self

class KeyedTagFragment < TagCollection
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
			other.insertAfterEnd$(item)
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

	def attachNodes
		for item,i in @array
			#end.insertBeforeBegin$(item)
		return

	def detachNodes
		for item in @array
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

class IndexedTagFragment < TagCollection

	def setup
		@$ = []
		@length = 0

	def end$ len
		let from = @length
		return if from == len or !#parent
		let array = @$
		let par = #parent

		if from > len
			while from > len
				par.removeChild$(array[--from])
		elif len > from
			while len > from
				@appendChild$(array[from++])
		@length = len
		return

	def attachNodes
		for item,i in @$
			break if i == @length
			#end.insertBeforeBegin$(item)
		return

	def detachNodes
		let i = 0
		while i < @length
			let item = @$[i++]
			#parent.removeChild$(item)
		return

export def createLiveFragment bitflags, options
	var el = document.createDocumentFragment()
	el.setup$(bitflags, options)
	return el

export def createFragment bitflags, parent
	if bitflags & $TAG_INDEXED$
		return IndexedTagFragment.new(bitflags,parent)
	else
		return KeyedTagFragment.new(bitflags,parent)


