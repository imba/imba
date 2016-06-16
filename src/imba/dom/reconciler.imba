def removeNested root, node, caret
	# if node/nodes isa String
	# 	we need to use the caret to remove elements
	# 	for now we will simply not support this
	if node isa Imba.Tag
		root.removeChild(node)
	elif node isa Array
		removeNested(root,member,caret) for member in node
	elif node != null
		# what if this is not null?!?!?
		# take a chance and remove a text-elementng
		let next = caret ? caret:nextSibling : root.@dom:firstChild
		if next isa Text and next:textContent == node
			root.removeChild(next)
		else
			throw 'cannot remove string'

	return caret

def appendNested root, node
	if node isa Imba.Tag
		root.appendChild(node)
		node = node.@dom

	elif node isa Array
		node:doms = []
		for member, idx in node
			var dom = appendNested(root, member)
			node:doms.push(dom)

	elif node != null and node !== false
		if !node:nodeType
			node = Imba.document.createTextNode(node)
		root.appendChild node

	return node


# insert nodes before a certain node
# does not need to return any tail, as before
# will still be correct there
# before must be an actual domnode
def insertNestedBefore root, node, before
	if node isa Imba.Tag
		root.insertBefore(node,before)
	elif node isa Array
		insertNestedBefore(root,member,before) for member in node
	elif node != null and node !== false
		if !node:nodeType
			node = Imba.document.createTextNode(node)
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

	# Same as `new`, but contains the actual DOM nodes from the previous render,
	# not tags/strings.
	var newDoms = []

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

		var oldDom = (old:doms and old:doms[idx])
		newDoms[newPos] = oldDom

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
		if cursor == maxChainEnd and newPosition[cursor] != -1
			stickyNodes[newPosition[cursor]] = true
			maxChainEnd = prevChain[maxChainEnd]
		
		cursor -= 1

	# And let's iterate forward, but only move non-sticky nodes
	for node, idx in new
		if !stickyNodes[idx]
			var dom = (newDoms[idx] or node)
			var after = new[idx - 1]
			var afterDom = (newDoms[idx - 1] or (after and after.@dom))
			insertNestedAfter(root, dom, afterDom or caret)

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
def reconcileNested root, new, old, caret

	# if new == null or new === false or new === true
	# 	if new === old
	# 		return caret
	# 	if old && new != old
	# 		removeNested(root,old,caret) if old
	# 
	# 	return caret

	# var skipnew = new == null or new === false or new === true
	var newIsNull = new == null or new === false
	var oldIsNull = old == null or old === false


	if new === old
		# remember that the caret must be an actual dom element
		# we should instead move the actual caret? - trust
		if newIsNull
			return caret
		elif new and new.@dom
			return new.@dom
		else
			return caret ? caret:nextSibling : root.@dom:firstChild

	elif new isa Array
		if old isa Array
			if new:static or old:static
				# if the static is not nested - we could get a hint from compiler
				# and just skip it
				if new:static == old:static
					for item,i in new
						# this is where we could do the triple equal directly
						caret = reconcileNested(root,item,old[i],caret)
					return caret
				else
					removeNested(root,old,caret)
					
				# if they are not the same we continue through to the default
			else
				return reconcileCollection(root,new,old,caret)

		elif old isa Imba.Tag
			root.removeChild(old)
		elif !oldIsNull
			# old was a string-like object?
			root.removeChild(caret ? caret:nextSibling : root.@dom:firstChild)			

		return insertNestedAfter(root,new,caret)
		# remove old

	elif new isa Imba.Tag
		removeNested(root,old,caret) unless oldIsNull
		return insertNestedAfter(root,new,caret)

	elif newIsNull
		removeNested(root,old,caret) unless oldIsNull
		return caret
	else
		# if old did not exist we need to add a new directly
		let nextNode
		# if old was array or imbatag we need to remove it and then add
		if old isa Array
			removeNested(root,old,caret)
		elif old isa Imba.Tag
			root.removeChild(old)
		elif !oldIsNull
			# ...
			nextNode = caret ? caret:nextSibling : root.@dom:firstChild
			if nextNode isa Text and nextNode:textContent != new
				nextNode:textContent = new
				return nextNode

		# now add the textnode
		return insertNestedAfter(root,new,caret)


extend tag element

	def setChildren new, typ
		var old = @children

		if new === old
			return self

		if !old
			empty
			appendNested(self,new)

		elif typ == 2
			return self

		elif typ == 1
			# here we _know _that it is an array with the same shape
			# every time
			let caret = null
			for item,i in new
				# prev = old[i]
				caret = reconcileNested(self,item,old[i],caret)

		elif typ == 3
			# this is possibly fully dynamic. It often is
			# but the old or new could be static while the other is not
			# this is not handled now
			# what if it was previously a static array? edgecase - but must work
			if new isa Imba.Tag
				empty
				appendChild(new)

			# check if old and new isa array
			elif new isa Array
				if old isa Array and old:length
					# is this not the same as setting staticChildren now but with the
					reconcileCollection(self,new,old,null)
				else
					empty
					appendNested(self,new)
				
			else
				text = new
				return self

		elif new isa Array and old isa Array
			reconcileCollection(self,new,old,null)
		else
			empty
			appendNested(self,new)

		@children = new
		return self

	def content
		@content or children.toArray

	def text= text
		if text != @children
			@children = text
			dom:textContent = text == null or text === false ? '' : text
		self
