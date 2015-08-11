

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
		for member,i in node
			appendNested(root,member)

	elif node isa Number
		no

	elif node isa String
		root.appendChild Imba.document.createTextNode(node)

	elif node
		root.appendChild(node)

	return

# insert nodes before a certain node
# does not need to return any tail, as before
# will still be correct there
# before must be an actual domnode
def insertNestedBefore root, node, before

	if node isa String
		node = Imba.document.createTextNode(node)

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

# same as insertNestedBefore?
def moveGroupBeforeTail root, nodes, group, tail
	for nodeIdx in group
		var node = nodes[nodeIdx]
		root.insertBefore(node,tail)
	# tail will stay the same
	return

def moveGroup root, nodes, group, nextGroup, caret
	var tail = nodes[nextGroup[0]].@dom:nextSibling
	moveGroupBeforeTail(root, nodes, group, tail)

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

	moveGroupBeforeTail(root,nodes, group, tail)


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
		swapGroup(root, nodes, groups[1], groups[2], caret)

	elif groups[1][0] == 0
		# (2, 1, 3)
		last = groups[2]
		swapGroup(root, nodes, groups[0], groups[1], caret)

	elif groups[2][0] == 0
		moveGroup(root, nodes, groups[2], groups[0], caret)

		if groups[0][0] > groups[1][0]
			# (3, 2, 1)
			last = groups[0]
			swapGroup(root, nodes, groups[0], groups[1], caret)
		else
			# (2, 3, 1)
			last = groups[1]

	# no need to return the caret?
	var lastNode = nodes[last[last:length - 1]]
	return lastNode.@dom:nextSibling


def reconcileSwap root, nodes, groups, caret
	swapGroup(root, nodes, groups[0], groups[1], caret)
	var last = groups[0]
	var lastNode = nodes[last[last:length - 1]]
	return lastNode.@dom:nextSibling


def reconcileFull root, new, old, caret
	# console.log "reconcileFull"
	removeNested(root,old,caret)
	caret = insertNestedAfter(root,new,caret)
	return caret


# expects a flat non-sparse array of nodes in both new and old, always
def reconcileCollection root, new, old, caret

	var newLen = new:length
	var oldLen = old:length

	var removedNodes = 0
	var isSorted = yes

	# if we trust that reconcileCollection does the job
	# we know that the caret should have moved to the
	# last element of our new nodes.
	var lastNew = new[newLen - 1]

	# `groups` contains the indexOf 
	var groups = []
	var remove = []
	var prevIdx = -1
	var maxIdx = -1
	var lastGroup

	# in most cases the two collections will be
	# unchanged. Might be smartest to look for this case first?

	for node in old
		var newIdx = new.indexOf(node)

		if newIdx == -1
			# the node was removed
			remove.push(node)
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

	# console.log "reconcileCollection",addedNodes, removedNodes, isSorted,new,old,groups
	# "changes" here implies that nodes have been added or removed
	var hasChanges = !(addedNodes == 0 and removedNodes == 0)

	if isSorted
		# this is very simple
		if removedNodes and !addedNodes
			# console.log "only removed nodes"
			root.removeChild(node) for node,i in remove

		elif addedNodes
			# this can include both removed and 
			# maybe remove nodes first -- so easy
			var remaining = old
			var oldI = 0

			if removedNodes
				root.removeChild(node) for node,i in remove
				remaining = old.filter do |node| remove.indexOf(node) == -1

			# simply loop over new nodes, and insert them where they belong
			for node,i in new
				if node === remaining[oldI]
					oldI++ # only step forward if it is the same
					caret = node.@dom
					continue

				caret = insertNestedAfter(root,node,caret)

	elif hasChanges
		# console.log "reconcileScratch",groups
		reconcileFull(root, new, old, caret)

	elif groups:length == 2
		# console.log "reconcileSwap"
		reconcileSwap(root,new, groups, caret)

	elif groups:length == 3
		# console.log "reconcileOrder"
		reconcileOrder(root, new, groups, caret)

	else
		# too much to sort - just remove and append everything
		reconcileFull(root, new, old, caret)

	# should trust that the last item in new list is the caret
	return lastNew and lastNew.@dom or caret


# the general reconciler that respects conditions etc
# caret is the current node we want to insert things after
def reconcileNested root, new, old, caret, container, ci

	if new === old
		# remember that the caret must be an actual dom element
		return (new and new.@dom) or new or caret

	# this could be a dynamic / loop
	if new isa Array and old isa Array

		if new:static
			# if the static is not nested - we could get a hint from compiler
			# and just skip it
			if new:static == old:static
				for item,i in new
					caret = reconcileNested(root,item,old[i],caret,new,i)
				return caret
			# if they are not the same we continue through to the default

		else
			return reconcileCollection(root,new,old,caret)

	elif new isa String
		let textNode

		if old isa Text
			# make sure not to trigger reflow in certain browsers
			if old:textContent != new
				old:textContent = new

			textNode = old
		else
			removeNested(root,old,caret) if old
			textNode = Imba.document.createTextNode(new)
			insertNestedAfter(root,textNode,caret)

		# swap the text with textNode in container
		return container[ci] = caret = textNode
	# simply remove the previous one and add the new one
	# will these ever be arrays?
	removeNested(root,old,caret) if old
	caret = insertNestedAfter(root,new,caret) if new
	return caret



extend tag htmlelement

		
	def setChildren nodes
		if nodes and nodes:static
			setStaticChildren(nodes)
		else
			empty.append(nodes)
			@children = nodes
		return self

	def setStaticChildren new

		var old = @children or []
		var caret = null

		# common case that should bail out from staticChildren
		if new:length == 1 and new[0] isa String
			return text = new[0]

		# must be array
		if !old:length or !old:static
			old = []
			empty

		for node,i in new
			if node === old[i]
				caret = node.@dom if node and node.@dom
			else
				caret = reconcileNested(self,node,old[i],caret,new,i)

		@children = new
		return self

	def content
		@content or children.toArray

	def text= text
		if text != @children
			dom:textContent = @children = text
		self