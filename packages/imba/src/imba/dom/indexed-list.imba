# imba$stdlib=1
import {createComment} from './core'
import {Fragment} from './fragment'

class IndexedTagFragment < Fragment

	def constructor f, parent
		super
		#domFlags = f
		##parent = parent

		unless f & $TAG_LAST_CHILD$
			#end = createComment('list')
			# #end.node = self

		self.$ = childNodes
		self.length = 0

		if parent
			parent.#appendChild(self)

	def hasChildNodes
		return false if length == 0
		return true

	def #afterVisit len
		let from = self.length
		self.length = len

		return if from == len
		let par = parentNode
		return if !par

		let array = self.childNodes
		let end = #end

		if from > len
			while from > len
				par.#removeChild(array[--from])
		elif len > from
			while len > from
				par.#insertChild(array[from++],end)
		self.length = len
		return

	def #insertInto parent, before
		parentNode = parent

		# if parent isa Node
		# FIXME need to work with non-dom elements as well
		if #end
			#end.#insertInto(parent,before)

		before = #end

		for item,i in childNodes
			break if i == self.length
			# log 'insert child',parent,item,before
			item.#insertInto(parent,before)
			# log 'insert child',parent,item,before,parent.innerHTML
		return self

	def #appendChild item
		# this should be a noop
		# log 'list #appendChild',item
		return

	def #replaceWith rel, parent
		let res = rel.#insertInto(parent,#end)
		#removeFrom(parent)
		return res

	def #removeFrom parent
		# log '#removeFrom',parent
		let i = length
		while i > 0
			let el = childNodes[--i]
			el.#removeFrom(parent)
			# parent.#removeChild(el)
		parent.removeChild(#end) if #end
		parentNode = null
		return

export def createIndexedList bitflags, parent
	return new IndexedTagFragment(bitflags,parent)
