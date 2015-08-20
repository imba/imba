

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

def reconcileCollectionChanges root, new, old, caret

	var newLen = new:length
	var oldLen = old:length
	var lastNew = new[newLen - 1]

	# This re-order algorithm is based on the following principle:
	# 
	# We build a "chain" which shows which items are already sorted.
	# If we're going from [1, 2, 3] -> [2, 1, 3], the tree looks like:
	#
	# 	3 ->  0 (idx)
	# 	2 -> -1 (idx)
	# 	1 -> -1 (idx)
	#
	# This tells us that we have two chains of ordered items:
	# 
	# 	(1, 3) and (2)
	# 
	# The optimal re-ordering then becomes two keep the longest chain intact,
	# and move all the other items.

	var newPosition = []

	# The tree/graph itself
	var prevChain = []
	# The length of the chain
	var lengthChain = []

	# Keep track of the longest chain
	var maxChainLength = 0
	var maxChainEnd = 0

	for node, idx in old
		var newPos = new.indexOf(node)
		newPosition.push(newPos)

		if newPos == -1
			root.removeChild(node)
			prevChain.push(-1)
			lengthChain.push(-1)
			continue

		var prevIdx = newPosition:length - 2

		# Build the chain:
		while prevIdx >= 0
			if newPosition[prevIdx] == -1
				prevIdx--
			elif newPos > newPosition[prevIdx]
				# Yay, we're bigger than the previous!
				break
			else
				# Nope, let's walk back the chain
				prevIdx = prevChain[prevIdx]

		prevChain.push(prevIdx)

		var currLength = (prevIdx == -1) ? 0 : lengthChain[prevIdx]+1

		if currLength > maxChainLength
			maxChainLength = currLength
			maxChainEnd = idx

		lengthChain.push(currLength)

	var stickyNodes = []

	# Now we can walk the longest chain backwards and mark them as "sticky",
	# which implies that they should not be moved
	var cursor = newPosition:length - 1
	while cursor >= 0
		if newPosition[cursor] == -1
			# do nothing. it was removed.
		elif cursor == maxChainEnd
			stickyNodes[newPosition[cursor]] = true
			maxChainEnd = prevChain[maxChainEnd]
		
		cursor -= 1

	# And let's iterate forward, but only move non-sticky nodes
	for node, idx in new
		if !stickyNodes[idx]
			var after = new[idx - 1]
			insertNestedAfter(root, node, (after and after.@dom) or caret)

	# should trust that the last item in new list is the caret
	return lastNew and lastNew.@dom or caret


# expects a flat non-sparse array of nodes in both new and old, always
def reconcileCollection root, new, old, caret
	var k = new:length
	var i = k
	var last = new[k - 1]


	if k == old:length and new[0] === old[0]
		# running through to compare
		while i--
			break if new[i] !== old[i]

	if i == -1
		return last and last.@dom or caret
	else
		return reconcileCollectionChanges(root,new,old,caret)

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
		if nodes === @children
			return self

		if nodes and nodes:static
			setStaticChildren(nodes)
		elif nodes isa Array and @children isa Array
			reconcileCollection(self,nodes,@children,null)
		elif nodes isa String
			text = nodes
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