

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
		moveGroup(root, nodes, group[2], group[0], caret)

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
				var other = remaining[oldI++]

				if other 
					if node != other
						root.insertBefore(node,other)
						oldI--

				elif i > 0
					root.insertBefore(node,new[i -1].@dom:nextSibling)
				else
					root.insertBefore(node,caret and caret:nextSibling)

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
			# console.log "should redirect to dynamic!"
			caret = reconcileCollection(root,new,old,caret)
			return caret


	# simply remove the previous one and add the new one
	removeNested(root,old,caret) if old
	caret = insertNestedAfter(root,new,caret) if new
	return caret



extend tag htmlelement

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

	def insertBefore node, rel
		# if node isa String
		# 	log "insertBefore WITH STRING!! - not allowed now"
		# supports both plain dom nodes and imba nodes
		dom.insertBefore( (node.@dom or node), (rel.@dom or rel) ) if node and rel
		self

	def appendChild node
		dom.appendChild(node.@dom or node) if node
		self

	def removeChild node
		dom.removeChild(node.@dom or node) if node
		self

	def content
		@content or children.toArray

	def text= text
		if text != @children
			dom:textContent = @children = text
		self