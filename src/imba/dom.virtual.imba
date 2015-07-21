
# maybe do a quick check first to see if there are any nested arrays?
def flatten input, out = []
	var idx = 0
	var len = input:length

	while idx < len
		var el = input[idx++]
		Array.isArray(el) ? flatten(el,out) : out.push(el)
	return out

# for (var i=0; i<input.length; ++i) {
#     var current = input[i];
#     for (var j=0; j<current.length; ++j)
#         flattened.push(current[j]);
# }
	

extend tag htmlelement
	
	# def remove a
	# 	# console.log 'removing element !! ',a
	# 	dom.removeChild(a.dom) if a
	# 	self

	def setChildren nodes
		var prev = @children

		if nodes isa String or nodes isa Number
			self.text = nodes
			return self

		# console.log 'set content!',nodes
		if prev != null
			# fast handling of all the cases where we only have a single inner node
			# later we will use this to optimize static templates
			return self if nodes == prev

			var aa = prev isa Array
			var ba = nodes isa Array

			if ba
				nodes = flatten(nodes)
			
			if !aa and !ba
				# console.log "just set the content directly",prev,nodes
				super # just replace the element

			elif aa and ba
				# need to loop through array
				var al = prev:length
				var bl = nodes:length

				var l = Math.max(al,bl)
				var i = 0

				# need to find a much faster algorithm to discover
				# the actual changes in the array - and only change this
				# what about flattening arrays? we must do that right

				while i < l
					var a = prev[i]
					var b = nodes[i]

					# the index of old element in the new nodelist
					var abi = a ? nodes.indexOf(a) : -1

					# like before -- do nothing
					# if a == b
					#	i++
					#	continue

					if b and b != a
						append(b)
						
						# should not remove if another has just been added
						# only if it does not exist in b
						remove(a) if a and abi == -1
					elif a and a != b
						remove(a) if abi == -1
						true
					i++
			else
				# should throw error, no?
				console.log "was array - is single -- confused=!!!!"
				empty
				super

		else
			if nodes isa Array
				nodes = flatten(nodes)

			# need to empty the element first
			# @dom:innerHTML = nil
			empty
			super

		@children = nodes # update the cached children?
		self

	def content
		@content or children.toArray

	def text= text
		if text != @children
			dom:textContent = @children = text
		self