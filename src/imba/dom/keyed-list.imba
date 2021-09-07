import {createComment} from './core'

class KeyedTagFragment
	
	def constructor f, parent
		#domFlags = f
		#parent = parent
		parentNode = parent

		if !(f & $TAG_FIRST_CHILD$)
			#start = createComment('start')
			parent.#appendChild(#start) if parent

		unless f & $TAG_LAST_CHILD$
			#end = createComment('end')
			parent.#appendChild(#end) if parent

		self.setup()

	def setup
		self.array = []
		self.changes = new Map
		self.dirty = no
		self.$ = {}
		
	def #appendChild item
		if parentNode
			parentNode.#insertBefore(item,#end)

	def push item, idx
		# on first iteration we can merely run through
		unless #domFlags & $TAG_INITED$
			self.array.push(item)
			self.#appendChild(item)
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
				self.moveChild(item,idx,prevIndex)

			if changed == -1
				self.changes.delete(item)
		return

	def insertChild item, index
		# console.log 'insertChild',item,index
		if index > 0
			let other = self.array[index - 1]
			# will fail with text nodes
			parentNode.#insertChild(item,other.nextSibling)
		elif #start
			parentNode.#insertChild(item,#start.nextSibling)
		else
			parentNode.#insertAfterBegin(item)
		return
		
	def moveChild item, index, prevIndex
		insertChild(item,index)

	def removeChild item, index
		# self.map.delete(item)
		# what if this is a fragment or virtual node?
		if item.parentNode == #parent
			#parent.removeChild(item)
		return

	def attachNodes
		let par = parentNode
		let rel = #end
		for item,i in self.array
			item.#insertInto(par,rel)
		return

	def detachNodes
		let par = parentNode
		let end = #end
		for item in self.array
			par.#removeChild(item)
		end.#removeFrom(par) if end
		return
	
	def #replaceWith rel, parent
		# console.log 'can replace now?',rel,parent,#end,#end..parentNode
		let res = rel.#insertInto(parent,#end)
		#removeFrom(parent)
		return res
		
	def #insertInto parent, before
		#parent = parent
		let prev = parentNode
		if parent != prev
			
			parentNode = parent
			#start.#insertInto(parent,before) if #start
			#end.#insertInto(parent,before) if #end
			# console.log 'inserting fragment into',self,parent,self.length,self.$
			attachNodes!
		self
	
	def #removeFrom parent
		for item in self.array
			parent.#removeChild(item)
		parent.#removeChild(#end) if #end
		# parent.#removeChild(#start) if #start
		parentNode = null

	def #afterVisit index
		unless #domFlags & $TAG_INITED$
			#domFlags |= $TAG_INITED$
			# what if parent was not even set yet?
			return

		if self.dirty
			self.changes.forEach do(pos,item)
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
		return

export def createKeyedList bitflags, parent
	return new KeyedTagFragment(bitflags,parent)
	