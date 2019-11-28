

extend class DocumentFragment
	
	# Called to make a documentFragment become a live fragment
	def setup$ flags, options
		#start = document.createComment('start')
		#end = document.createComment('end')
		#start.__fragment = this
		#end.__fragment = this

		#end.replaceWith$ = do |other|
			this.parentNode.insertBefore(other,this)
			return other

		@appendChild(#start)
		@appendChild(#end)

	
	def insert$ item, options, toReplace
		if #parentNode
			# if the fragment is attached to a parent
			# we can just proxy the call through
			#parentNode.insert$(item,options,toReplace or #end)
		else
			Element.prototype.insert$.call(self,item,options,toReplace or #end)

	def insertInto$ parent		
		unless #parentNode
			#parentNode = parent
			parent.appendChild$(this)
		return this

	def text$ text
		self

	def replaceWith$ other
		#start.insertAdjacent$('beforebegin',other)
		var el = #start
		while el
			let next = el.nextSibling
			@appendChild(el)
			break if el == #end
			el = next
			
		return other

	def appendChild$ child
		#end.parentNode.insertBefore(child,#end)
		return child

	def removeChild$ child
		child.parentNode && child.parentNode.removeChild(child)
		self
