

def removeNested root, node, caret
	# if node/nodes isa String
	# 	we need to use the caret to remove elements
	# 	for now we will simply not support this
	if node isa Array
		removeNested(root,member,caret) for member in node
	elif node isa Number
		no # noop now -- will be used in 
	elif node
		root.removeChild(node)

	return caret

def appendNested root, node
	if node isa Array
		appendNested(root,member) for member in node
	elif node isa Number
		no
	elif node
		root.appendChild(node)
	return

# insert nodes before a certain node
# does not need to return any tail, as before
# will still be correct there
# before must be an actual domnode
def insertNestedBefore root, node, before

	if node isa Array
		insertNestedBefore(root,member,before) for member in node
	elif node isa Number
		no # noop now -- will be used in 
	elif node
		root.insertBefore(node,before)

	return before

# after must be an actual domnode
def insertNestedAfter root, node, after
	var before = after ? after:nextSibling : root.@dom:firstChild

	if before
		insertNestedBefore(root,node,before)
		return before:previousSibling
	else
		appendNested(root,node)
		return root.@dom:lastChild


def moveGroup root, nodes, group, nextGroup
	var tail = nodes[nextGroup[0]].@dom:nextSibling
	moveGroupBeforeTail(nodes, group, tail)


def swapGroup root, nodes, group1, group2, caret
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


def reconcileChanges root, new, old, caret
	return caret


def reconcileOrder root, nodes, groups, caret

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

	return caret


def reconcileSwap root, nodes, groups, caret
	return caret


def reconcileFull root, new, old, caret
	console.log "reconcileFull"
	removeNested(root,old,caret)
	caret = insertNestedAfter(root,new,caret)
	return caret


# expects a flat non-sparse array of nodes in both new and old, always
def reconcileCollection root, new, old, caret

	var newLen = new:length
	var oldLen = old:length

	var removedNodes = 0
	var isSorted = yes

	# `groups` contains the indexOf 
	var groups = []
	var prevIdx = -1
	var maxIdx = -1
	var lastGroup

	# in most cases the two collections will be
	# unchanged. Might be smartest to look for this case first?

	for node in old
		var newIdx = new.indexOf(node)

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

	var addedNodes = new:length - (old:length - removedNodes)

	# "changes" here implies that nodes have been added or removed
	var hasChanges = !(addedNodes == 0 and removedNodes == 0)

	console.log "reconcileLoop",isSorted,addedNodes,removedNodes,groups

	# fix this first
	return reconcileFull(root, new, old, caret)

	if isSorted
		if hasChanges
			console.log "hasChanges"
			return reconcileChanges(root, new, old, caret)
		else
			# the caret should now be the very last element here
			return new[newLen - 1].@dom
	else
		# change to elif hasChanges?
		if !hasChanges and groups:length == 2
			console.log "reconcileSwap!",groups
			return reconcileSwap(root,new, groups, caret)
		elif !hasChanges and groups:length == 3
			console.log "reconcileOrder",groups
			return reconcileOrder(root, new, groups, caret)
		else
			console.log "reconcileScratch",groups
			return reconcileFull(root, new, old, caret)


# the general reconciler that respects conditions etc
# caret is the current node we want to insert things after
def reconcileNested root, new, old, caret
	if new === old
		# will call reconcile directly for every node
		# cant be very efficient?
		# what if this is a number? can that happen?

		# remember that the caret must be an actual dom element
		return (new and new.@dom) or new or caret

	var newIsArray = new isa Array
	var oldIsArray = old isa Array

	# this could be a dynamic / loop
	if newIsArray and oldIsArray
		var newLen = new:length
		var oldLen = old:length

		var new0 = new[0]
		var old0 = old[0]

		var isBlocks = typeof new0 == 'number' and typeof old0 == 'number'

		# if these are static blocks, they
		# always include a unique number as first element
		if isBlocks
			# console.log "is blocks"
			# these are static blocks. If they are not the same
			# block we can handle them in the most primitive way

			# if they are the same, we need to reconcile members
			# they should also have the same length
			if new0 == old0
				# console.log "same block!"
				let i = 0
				while ++i < newLen
					caret = reconcileNested(root,new[i],old[i],caret)
				# console.log "return caret",caret
				return caret
			else
				# these are two fully separate blocks - we can remove and insert
				removeNested(root,old)
				return caret = insertNestedAfter(root,new,caret)
		else
			# this is where we get into the advanced reconcileLoop
			console.log "should redirect to dynamic!"
			caret = reconcileCollection(root,new,old,caret)
			return caret


	# simply remove the previous one and add the new one
	removeNested(root,old,caret) if old
	caret = insertNestedAfter(root,new,caret) if new
	return caret

def reconcileBlocks root, new, old, caret
	return caret
	




extend tag htmlelement
	
	# def remove a
	# 	# console.log 'removing element !! ',a
	# 	dom.removeChild(a.dom) if a
	# 	self

	def setStaticChildren new
		var old = @staticChildren
		var caret = null

		if !old
			appendNested(self,@staticChildren = new)
			return self

		for node,i in new
			if node === old[i]
				caret = node.@dom if node and node.@dom
			else
				caret = reconcileNested(self,node,old[i],caret)

		@staticChildren = new
		return self

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
				# if this is not a loop - we can be certain to simply
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

	def insertBefore node, rel
		if node isa String
			log "insertBefore WITH STRING!!"
		# supports both plain dom nodes and imba nodes
		dom.insertBefore( (node.@dom or node), (rel.@dom or rel) ) if node and rel
		self

	def appendChild node
		dom.appendChild(node.@dom or node) if node
		self

	def removeChild node
		dom.removeChild(node.@dom or node) if node
		self
		

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

		console.log "reconcileLoop",addedNodes,removedNodes,groups
		return

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