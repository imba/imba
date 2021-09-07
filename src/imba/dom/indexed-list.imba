import {createComment} from './core'
	
class IndexedTagFragment

	def constructor f, parent
		#domFlags = f
		#parent = parentNode = parent
		# parent could be a fragment

		unless f & $TAG_LAST_CHILD$
			#end = createComment('end')
			parent.#appendChild(#end) if parent

		self.setup()

	def setup
		self.$ = []
		self.length = 0

	def #afterVisit len
		let from = self.length
		self.length = len

		return if from == len or !#parent
		let array = self.$
		let par = #parent
		let end = #end

		if from > len
			while from > len
				par.#removeChild(array[--from])
		elif len > from
			while len > from
				# console.log 'inserting before now',array[from]
				par.#insertBefore(array[from++],end)
		self.length = len
		return
		
	def #insertInto parent, before
		#parent = parent
		unless parentNode
			parentNode = parent
			# console.log 'inserting fragment into',self,parent,self.length,self.$
			#end.#insertInto(parent,before)

			for item,i in self.$
				break if i == self.length
				parent.#insertBefore(item,#end)
			# #afterVisit(#length)
			# before ? before.insertBeforeBegin$($end) : parent.appendChild$($end)
			# self.attachNodes()
		return self
		
		
	def #replaceWith rel, parent
		let res = rel.#insertInto(parent,#end)
		#removeFrom(parent)
		return res
	
	def #removeFrom parent
		let i = length
		while i > 0
			let el = self.$[--i]
			el.#removeFrom(parent)
			# parent.#removeChild(el)
		parent.removeChild(#end)
		parentNode = null
		return

	def attachNodes
		for item,i in self.$
			break if i == self.length
			#parent.#insertBefore(item,#end)
			# $end.insertBeforeBegin$(item)
		return

	def detachNodes
		let i = 0
		while i < self.length
			let item = self.$[i++]
			#parent.#removeChild(item)
		return

export def createIndexedList bitflags, parent
	console.log 'creating indexed list!!'
	return new IndexedTagFragment(bitflags,parent)
