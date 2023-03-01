import {createComment} from './core'
import {Fragment} from './fragment'
import {RenderContext} from './context'

class KeyedTagFragment < Fragment

	def constructor f, parent
		super
		#domFlags = f
		##parent = parent
		changes = new Map
		dirty = no
		array = childNodes
		self.$ = new RenderContext(self,Symbol!)

		if !(f & $TAG_LAST_CHILD$)
			#end = createComment('map')

		if parent
			parent.#appendChild(self)

	def #appendChild item
		if parentNode
			parentNode.#insertChild(item,#end)

	def hasChildNodes
		return false if childNodes.length == 0
		return true

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
				self.insertChild(item,idx,prevIndex)

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

	def insertChild item, index, prevIndex
		let par = parentNode
		return unless par

		# console.log 'insertChild',item,index
		# log 'insertBefore',index,item,parentNode
		if index > 0
			let other = self.array[index - 1]
			# will fail with text nodes
			par.#insertChild(item,other.nextSibling)
		else
			par.#insertChild(item,childNodes[index + 1] or #end)
		return

	def moveChild item, index, prevIndex
		insertChild(item,index, prevIndex)

	def removeChild item, index
		# self.map.delete(item)
		# what if this is a fragment or virtual node?
		if item.parentNode
			# log 'removeChild',item,item.parentNode
			item.#removeFrom(item.parentNode)
		return

	def #insertChild node,relnode
		return

	# def #appendChild
	#	return

	def #replaceWith rel, parent
		# console.log 'can replace now?',rel,parent,#end,#end..parentNode
		let res = rel.#insertInto(parent,#end)
		#removeFrom(parent)
		return res

	def #insertInto parent, before
		# log 'insertInto',parent,before
		##parent = parent
		let prev = parentNode
		if parent != prev
			parentNode = parent
			# #start.#insertInto(parent,before) if #start
			for item,i in self.array
				item.#insertInto(parent,before)

			if #end
				#end.#insertInto(parent,before)
			# attachNodes!
		self

	def #removeFrom parent
		# log '#removeFrom!',parent

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
			# console.log 'was dirty!',array,self.changes

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
