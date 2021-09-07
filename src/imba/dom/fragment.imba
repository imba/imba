import {Element,Text,DocumentFragment,createFragment,createComment,createTextNode,Comment} from './core'

extend class DocumentFragment

	get #parent
		##up or ##parent

	# Called to make a documentFragment become a live fragment
	def setup$ flags, options
		#start = createComment('start')
		#end = createComment('end')

		#end.#replaceWith = do(other)
			this.parentNode.#insertBefore(other,this)
			return other

		this.appendChild(#start)
		this.appendChild(#end)
	
	# when we for sure know that the only content should be
	# a single text node
	def text$ item
		unless $text
			$text = this.#insert(item)
		else
			$text.textContent = item
		return
	
	def #insert item, options, toReplace
		console.log 'frag insert',item,options,toReplace
		if ##parent
			# if the fragment is attached to a parent
			# we can just proxy the call through
			##parent.#insert(item,options,toReplace or #end)
		else
			Element.prototype.#insert.call(this,item,options,toReplace or #end)

	def #insertInto parent, before
		console.log 'insert into fragment',parent,before
		unless ##parent
			##parent = parent
			# console.log 'insertFrgment into',parent,Array.from(self.childNodes)
			before ? parent.insertBefore(this,before) : parent.appendChild(this)
		return this
	
	# replacing this slot with something else
	def #replaceWith other, parent
		#start.insertBeforeBegin$(other)
		let el = #start
		while el
			
			let next = el.nextSibling
			self.appendChild(el)
			break if el == #end
			el = next
			
		return other

	def #appendChild child
		#end ? #end.#insertBeforeBegin(child) : appendChild(child)
		return child
		
	def appendChild$ child
		$end ? $end.insertBeforeBegin$(child) : self.appendChild(child)
		return child

	def removeChild$ child
		child.parentNode && child.parentNode.removeChild(child)
		self

	def isEmpty$
		let el = $start
		let end = $end

		while el = el.nextSibling
			break if el == end
			return false if el isa Element or el isa Text
		return true


# like a list
class VirtualFragment
	def constructor flags, par
		parentNode = null
		#domFlags = flags
		#children = []
		#end = createComment('slot')
		
	get #parent
		##parent or parentNode or ##up
	
	set textContent text
		#textContent = text
	
	get textContent
		#textContent
		
	def isEmpty$
		for item in #children
			unless item isa Comment
				return false
		return true
		# #children.length == 0
		
	def text$ item
		unless #textNode
			#textNode = #insert(item)
		else
			#textNode.textContent = item
		return #textNode
		
	def appendChild child
		if parentNode
			child.#insertInto(parentNode,#end)
		else
			#children.push(child)
	
	def #appendChild child
		# log '#appendChild',child
		appendChild(child)
	
	def insertBefore node,refnode
		if parentNode
			parentNode.#insertBefore(node,refnode)
		let idx = #children.indexOf(refnode)
		if idx >= 0
			#children.splice(idx,0,node)
		return node
	
	
	def #removeChild node
		if parentNode
			parentNode.#removeChild(node)
		let idx = #children.indexOf(node)
		if idx >= 0
			#children.splice(idx,1)
		return
			
	def #insertInto parent, before
		# console.log 'frag #insertInto',parent,before,#children
		let prev = parentNode
		if parentNode =? parent
			# what if before is a fragment etc?
			#end.#insertInto(parent,before)
			before = #end
			for item in #children
				item.#insertInto(parent,before)
		return self
		
	def #replaceWith node, parent
		# what if this
		# log 'replaced with',node,parent
		let res = node.#insertInto(parent,#end)
		#removeFrom(parent)
		res
	
	def #insertBefore node,refnode
		if parentNode
			insertBefore(node,refnode or #end)
		
		if refnode
			let idx = #children.indexOf(refnode)
			# console.log 'vfragment #insertBefore',node,refnode,refnode == #end,idx,#children
			if idx >= 0
				#children.splice(idx,0,node)
		else
			#children.push(node)
		return node
		
		
		# for item in #children
		# 	item.#removeFrom(parent)
	
	def #removeFrom parent
		for item in #children
			item.#removeFrom(parent)
		#end.#removeFrom(parent)
		parentNode = null
		self
	
	def log ...params
		console.log 'frag',...params

	def #insert item, f, prev
		# is connected
		# log '#insert',item,prev,f,parentNode
		# if parentNode
		#	let idx = 
		#	let res = parentNode.#insert(item,f,prev or #end)
		let par = parentNode
		let type = typeof item
		
		if type === 'undefined' or item === null
			if prev and prev isa Comment # check perf
				return prev
			
			let el = createComment('')
			
			if prev
				let idx = #children.indexOf(prev)
				#children.splice(idx,1,el)
				if par
					prev.#replaceWith(el,par)
				# parentNode.#insert(item,f,prev or #end)
				return el
			
			
			#children.push(el)
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
					let idx = #children.indexOf(prev)
					#children.splice(idx,1,res)
					# prev.#replaceWith(res,self)
					prev.#replaceWith(res,par) if par
					return res
			else
				#children.push(res = createTextNode(txt))
				# self.appendChild$(res = createTextNode(txt))
				res.#insertInto(par,#end) if par
				return res

		elif prev
			let idx = #children.indexOf(prev)
			#children.splice(idx,1,item)
			prev.#replaceWith(item,par) if par
			return item
		else
			#children.push(item)
			item.#insertInto(par,#end) if par
			return item
		
			

export def createLiveFragment2 bitflags, options, par
	const el = createFragment!
	el.setup$(bitflags, options)
	el.##up = par if par
	return el

export def createLiveFragment bitflags, options, par
	const el = new VirtualFragment(bitflags, options)
	# el.setup$(bitflags, options)
	el.##up = par if par
	return el