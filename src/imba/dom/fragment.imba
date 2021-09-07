import {Text,createComment,createTextNode,Comment} from './core'

export class Fragment
	
	def constructor
		childNodes = []
		
	def log ...params
		return
		console.log this.constructor.name,...params
		
	def hasChildNodes
		false

let counter = 0
# like a list
class VirtualFragment < Fragment
	def constructor flags, parent
		super
		##up = parent
		parentNode = null
		#domFlags = flags
		childNodes = []
		#end = createComment('slot' + counter++)
		#end.node = self
		
		if parent
			parent.#appendChild(self)

	get #parent
		##parent or parentNode or ##up
	
	set textContent text
		#textContent = text
	
	get textContent
		#textContent
		
	def hasChildNodes
		for item in childNodes
			if item isa Fragment
				return true if item.hasChildNodes!
			if item isa Comment
				yes
			elif item isa Node
				return true

			# unless item isa Comment
			#	return false
		return false
		# #children.length == 0
		
	def text$ item
		unless #textNode
			#textNode = #placeChild(item)
		else
			#textNode.textContent = item
		return #textNode
		
	def appendChild child
		if parentNode
			child.#insertInto(parentNode,#end)
		childNodes.push(child)
	
	def #appendChild child
		if parentNode
			child.#insertInto(parentNode,#end)
		childNodes.push(child)
	
	def insertBefore node,refnode
		# check if this should really happen?
		if parentNode
			parentNode.#insertChild(node,refnode)
		let idx = childNodes.indexOf(refnode)
		if idx >= 0
			childNodes.splice(idx,0,node)
		return node
	
	
	def #removeChild node
		if parentNode
			parentNode.#removeChild(node)
		let idx = childNodes.indexOf(node)
		if idx >= 0
			childNodes.splice(idx,1)
		return
			
	def #insertInto parent, before
		# console.log 'frag #insertInto',parent,before,#children
		let prev = parentNode

		if parentNode =? parent
			# log '#insertInto',parent,prev,before,#end
			# what if before is a fragment etc?
			if #end
				before = #end.#insertInto(parent,before)
			# before = #end
			for item in childNodes
				item.#insertInto(parent,before)
		return self
		
	def #replaceWith node, parent
		# log '#replaceWith',node,parent
		# what if this
		# log 'replaced with',node,parent
		let res = node.#insertInto(parent,#end)
		#removeFrom(parent)
		res
	
	def #insertChild node,refnode
		if parentNode
			insertBefore(node,refnode or #end)
		
		if refnode
			let idx = childNodes.indexOf(refnode)
			# console.log 'vfragment #insertChild',node,refnode,refnode == #end,idx,#children
			if idx >= 0
				childNodes.splice(idx,0,node)
		else
			childNodes.push(node)
		return node
		
		
		# for item in #children
		# 	item.#removeFrom(parent)
	
	def #removeFrom parent
		for item in childNodes
			# log '#removeFrom',item,parent
			item.#removeFrom(parent)
		#end.#removeFrom(parent) if #end
		parentNode = null
		self

	def #placeChild item, f, prev
		let par = parentNode
		let type = typeof item
		
		if type === 'undefined' or item === null
			if prev and prev isa Comment # check perf
				return prev
			
			let el = createComment('')
			
			if prev
				let idx = childNodes.indexOf(prev)
				childNodes.splice(idx,1,el)
				if par
					prev.#replaceWith(el,par)
				# parentNode.#insert(item,f,prev or #end)
				return el
			
			
			childNodes.push(el)
			el.#insertInto(par,#end) if par
			return el
			# return prev ? prev.#replaceWith(el,self) : el.#insertInto(this,null)

		if item === prev
			return item
			
		if type !== 'object'
			let res
			let txt = item

			if prev
				if prev isa Text # check perf
					prev.textContent = txt
					return prev
				else
					res = createTextNode(txt)
					let idx = childNodes.indexOf(prev)
					childNodes.splice(idx,1,res)
					# prev.#replaceWith(res,self)
					prev.#replaceWith(res,par) if par
					return res
			else
				childNodes.push(res = createTextNode(txt))
				# self.appendChild$(res = createTextNode(txt))
				res.#insertInto(par,#end) if par
				return res

		elif prev
			let idx = childNodes.indexOf(prev)
			childNodes.splice(idx,1,item)
			prev.#replaceWith(item,par) if par
			return item
		else
			childNodes.push(item)
			item.#insertInto(par,#end) if par
			return item


export def createLiveFragment bitflags, par
	const el = new VirtualFragment(bitflags, par)
	return el
	
export def createSlot bitflags, par
	const el = new VirtualFragment(bitflags, null)
	el.##up = par
	# el.setup$(bitflags, options)
	# el.##up = par if par
	return el