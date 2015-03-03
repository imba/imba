extend tag htmlelement
	
	# def remove a
	# 	# console.log 'removing element !! ',a
	# 	dom.removeChild(a.dom) if a
	# 	self

	def children= nodes
		var prev = @children

		if nodes isa String or nodes isa Number
			self.text = nodes
			return self

		# console.log 'set content!',nodes
		if prev != null
			# fast handling of all the cases where we only have a single inner node
			return self if nodes == prev

			var aa = prev isa Array
			var ba = nodes isa Array
			
			if !aa and !ba
				# console.log "just set the content directly",prev,nodes

				# be careful, no?!?
				super # just replace the element

			elif aa and ba
				# need to loop through array
				var al,bl = prev:length,nodes:length
				var l = Math.max(al,bl)
				var i = 0

				while i < l
					var a,b = prev[i],nodes[i]
					if b and b != a
						append(b)
						
						# should not remove if another has just been added
						# only if it does not exist in b
						remove(a) if a
					elif a and a != b
						remove(a)
						true
					i++
			else
				# should throw error, no?
				console.log "was array - is single -- confused=!!!!"
				empty
				super

		else
			# need to empty the element first
			# @dom:innerHTML = nil # hmmmm
			empty
			super

		@children = nodes # update the cached children?
		self

	def content
		@content or children.toArray

	def text= text
		if text != @children
			dom:textContent = @children = text # hmmmm
		self