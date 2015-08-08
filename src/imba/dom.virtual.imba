
extend tag htmlelement
	
	# def remove a
	# 	# console.log 'removing element !! ',a
	# 	dom.removeChild(a.dom) if a
	# 	self

	def setStaticChildren nodes
		if nodes isa String or nodes isa Number
			text = nodes
			return self

		var prev = @children
		if prev == null
			super
			@children = nodes
			return self

		# At this point we assume that we always get an array of same size.

		if nodes:length == 0
			# Never anything to do.
			return self

		var tail = @dom:firstChild

		for node, idx in nodes
			var prevNode = prev[idx]

			if node isa Array and prevNode isa Array
				tail = reconcileLoop(prevNode, node, tail)
			elif prevNode === node
				tail = skipNode(node, tail)
			else
				tail = removeNode(prevNode, tail)
				tail = insertNode(node, tail)

		# Remove the rest
		while tail
			tail = removeNode true, tail

		@children = nodes
		return self

	def removeNode node, tail
		if node isa Array
			tail = removeNode(child, tail) for child in node
		elif node
			var nextTail = tail:nextSibling
			dom.removeChild(tail)
			tail = nextTail
		return tail

	def skipNode node, tail
		if node isa Array
			tail = tail:nextSibling for child in node
		elif node
			tail = tail:nextSibling
		return tail

	def insertNode node, tail
		if node isa Array
			for child in node
				# TODO: assert that `child` is a tag in development
				insertDomNode(child.@dom)
		elif node isa String or node isa Number
			var domNode = Imba:doc.createTextNode(item)
			insertDomNode(domNode, tail)
		elif node and node.@dom
			insertDomNode(node.@dom, tail)
		return tail

	def insertDomNode domNode, tail
		if tail
			dom.insertBefore(domNode, tail)
		else
			dom.appendChild(domNode)
		return tail

	def reconcileLoop prevNodes, nodes, tail
		var removedNodes = 0
		var isSorted = yes

		# `groups` contains the indexOf 
		var groups = []
		var prevIdx = -1
		var maxIdx = -1
		var lastGroup

		for node in prevNodes
			var newIdx = nodes.indexOf(node)

			if newIdx == -1
				# the node was removed
				removedNodes++
			else
				if newIdx < maxIdx
					isSorted = no
				else
					maxIdx = newIdx

			if prevIdx != -1 and (newIdx - prevIdx) == 1
				lastGroup.push(newIdx)
			else
				lastGroup = [newIdx]
				groups.push(lastGroup)
			prevIdx = newIdx

		var addedNodes = nodes:length - (prevNodes:length - removedNodes)

		# "changes" here implies that nodes have been added or removed
		var hasChanges = !(addedNodes == 0 and removedNodes == 0)

		if isSorted
			if hasChanges
				return reconcileChanges(prevNodes, nodes, tail)
			else
				return tail
		else
			if !hasChanges and groups:length == 2
				return reconcileSwap(nodes, groups)
			elif !hasChanges and groups:length == 3
				return reconcileOrder(nodes, groups)
			else
				return reconcileScratch(prevNodes, nodes, tail)

	def reconcileChanges prevNodes, nodes, tail
		# TODO
		return reconcileScratch(prevNodes, nodes, tail)

	def reconcileSwap nodes, groups
		swapGroup(nodes, groups[0], groups[1])
		var last = groups[0]
		var lastNode = nodes[last[last:length - 1]]
		return lastNode.@dom:nextSibling

	def reconcileOrder nodes, groups
		var last

		# We have these possible cases:
		# (1, 3, 2)
		# (2, 3, 1)
		# (2, 1, 3)
		# (3, 2, 1)

		# Note that swapGroup/moveGroup does not change `groups` or `nodes`

		if groups[0][0] == 0
			# (1, 3, 2)
			last = groups[1]
			swapGroup(nodes, groups[1], groups[2])

		elif groups[1][0] == 0
			# (2, 1, 3)
			last = groups[2]
			swapGroup(nodes, groups[0], groups[1])

		elif groups[2][0] == 0
			moveGroup(nodes, group[2], group[0])

			if groups[0][0] > groups[1][0]
				# (3, 2, 1)
				last = groups[0]
				swapGroup(nodes, groups[0], groups[1])
			else
				# (2, 3, 1)
				last = groups[1]

		var lastNode = nodes[last[last:length - 1]]
		return lastNode.@dom:nextSibling
			
	def moveGroupBeforeTail nodes, group, tail
		for nodeIdx in group
			var node = nodes[nodeIdx]
			insertDomNode(node.@dom, tail)			

	def moveGroup nodes, group, nextGroup
		var tail = nodes[nextGroup[0]].@dom:nextSibling
		moveGroupBeforeTail(nodes, group, tail)

	def swapGroup nodes, group1, group2
		var group, tail
		if group1:length < group2:length
			# Move group1 to the right of group2
			group = group1
			tail = nodes[group2[group2:length - 1]].@dom:nextSibling
		else
			# Move group2 in from of group1
			group = group2
			tail = nodes[group1[0]].@dom
		moveGroupBeforeTail(nodes, group, tail)


	def reconcileScratch prevNodes, nodes, tail
		for node in prevNodes
			tail = removeNode(node, tail)

		var frag = Imba:doc.createDocumentFragment
		frag:appendChild(node.@dom) for node in nodes

		return insertDomNode(frag, tail)

	def content
		@content or children.toArray

	def text= text
		if text != @children
			dom:textContent = @children = text
		self