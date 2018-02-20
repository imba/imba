extern navigator

var Imba = require("../imba")

def removeNested root, node, caret
	# if node/nodes isa String
	# 	we need to use the caret to remove elements
	# 	for now we will simply not support this
	if node isa Array
		removeNested(root,member,caret) for member in node
	elif node and node.@slot_
		root.removeChild(node)
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
	if node isa Array
		let i = 0
		let c = node:taglen
		let k = c != null ? (node:domlen = c) : node:length
		appendNested(root,node[i++]) while i < k
	elif node and node.@dom
		root.appendChild(node)
	elif node != null and node !== false
		root.appendChild Imba.createTextNode(node)

	return


# insert nodes before a certain node
# does not need to return any tail, as before
# will still be correct there
# before must be an actual domnode
def insertNestedBefore root, node, before
	if node isa Array
		let i = 0
		let c = node:taglen
		let k = c != null ? (node:domlen = c) : node:length
		insertNestedBefore(root,node[i++],before) while i < k

	elif node and node.@dom
		root.insertBefore(node,before)
	elif node != null and node !== false
		root.insertBefore(Imba.createTextNode(node),before)

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
	# The optimal re-ordering then becomes to keep the longest chain intact,
	# and move all the other items.

	var newPosition = []

	# The tree/graph itself
	var prevChain = []
	# The length of the chain
	var lengthChain = []

	# Keep track of the longest chain
	var maxChainLength = 0
	var maxChainEnd = 0

	var hasTextNodes = no
	var newPos

	for node, idx in old
		# special case for Text nodes
		if node and node:nodeType == 3
			newPos = new.indexOf(node:textContent)
			new[newPos] = node if newPos >= 0
			hasTextNodes = yes
		else
			newPos = new.indexOf(node)

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
		if cursor == maxChainEnd and newPosition[cursor] != -1
			stickyNodes[newPosition[cursor]] = true
			maxChainEnd = prevChain[maxChainEnd]

		cursor -= 1

	# possible to do this in reversed order instead?
	for node, idx in new
		if !stickyNodes[idx]
			# create textnode for string, and update the array
			unless node and node.@dom
				node = new[idx] = Imba.createTextNode(node)

			var after = new[idx - 1]
			insertNestedAfter(root, node, (after and after.@slot_ or after or caret))

		caret = node.@slot_ or (caret and caret:nextSibling or root.@dom:firstChild)

	# should trust that the last item in new list is the caret
	return lastNew and lastNew.@slot_ or caret


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
		return last and last.@slot_ or last or caret
	else
		return reconcileCollectionChanges(root,new,old,caret)

# TYPE 5 - we know that we are dealing with a single array of
# keyed tags - and root has no other children
def reconcileLoop root, new, old, caret
	var nl = new:length
	var ol = old:length
	var cl = new:cache:i$ # cache-length
	var i = 0, d = nl - ol
	
	# TODO support caret

	# find the first index that is different
	i++ while i < ol and i < nl and new[i] === old[i]
	
	# conditionally prune cache
	if cl > 1000 and (cl - nl) > 500
		new:cache:$prune(new)
	
	if d > 0 and i == ol
		# added at end
		root.appendChild(new[i++]) while i < nl
		return
	
	elif d > 0
		let i1 = nl
		i1-- while i1 > i and new[i1 - 1] === old[i1 - 1 - d]

		if d == (i1 - i)
			let before = old[i].@slot_
			root.insertBefore(new[i++],before) while i < i1
			return
			
	elif d < 0 and i == nl
		# removed at end
		root.removeChild(old[i++]) while i < ol
		return
	elif d < 0
		let i1 = ol
		i1-- while i1 > i and new[i1 - 1 + d] === old[i1 - 1]

		if d == (i - i1)
			root.removeChild(old[i++]) while i < i1
			return

	elif i == nl
		return

	return reconcileCollectionChanges(root,new,old,caret)

# expects a flat non-sparse array of nodes in both new and old, always
def reconcileIndexedArray root, array, old, caret
	var newLen = array:taglen
	var prevLen = array:domlen or 0
	var last = newLen ? array[newLen - 1] : null
	# console.log "reconcile optimized array(!)",caret,newLen,prevLen,array

	if prevLen > newLen
		while prevLen > newLen
			var item = array[--prevLen]
			root.removeChild(item.@slot_)

	elif newLen > prevLen
		# find the item to insert before
		let prevLast = prevLen ? array[prevLen - 1].@slot_ : caret
		let before = prevLast ? prevLast:nextSibling : root.@dom:firstChild
		
		while prevLen < newLen
			let node = array[prevLen++]
			before ? root.insertBefore(node.@slot_,before) : root.appendChild(node.@slot_)
			
	array:domlen = newLen
	return last ? last.@slot_ : caret


# the general reconciler that respects conditions etc
# caret is the current node we want to insert things after
def reconcileNested root, new, old, caret

	# var skipnew = new == null or new === false or new === true
	var newIsNull = new == null or new === false
	var oldIsNull = old == null or old === false


	if new === old
		# remember that the caret must be an actual dom element
		# we should instead move the actual caret? - trust
		if newIsNull
			return caret
		elif new.@slot_
			return new.@slot_
		elif new isa Array and new:taglen != null
			return reconcileIndexedArray(root,new,old,caret)
		else
			return caret ? caret:nextSibling : root.@dom:firstChild

	elif new isa Array
		if old isa Array
			# look for slot instead?
			let typ = new:static
			if typ or old:static
				# if the static is not nested - we could get a hint from compiler
				# and just skip it
				if typ == old:static # should also include a reference?
					for item,i in new
						# this is where we could do the triple equal directly
						caret = reconcileNested(root,item,old[i],caret)
					return caret
				else
					removeNested(root,old,caret)
					
				# if they are not the same we continue through to the default
			else
				# Could use optimized loop if we know that it only consists of nodes
				return reconcileCollection(root,new,old,caret)
		elif !oldIsNull
			if old.@slot_
				root.removeChild(old)
			else
				# old was a string-like object?
				root.removeChild(caret ? caret:nextSibling : root.@dom:firstChild)

		return insertNestedAfter(root,new,caret)
		# remove old

	elif !newIsNull and new.@slot_
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
		elif old and old.@slot_
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
	
	# 1 - static shape - unknown content
	# 2 - static shape and static children
	# 3 - single item
	# 4 - optimized array - only length will change
	# 5 - optimized collection
	# 6 - text only

	def setChildren new, typ
		# if typeof new == 'string'
		# 	return self.text = new
		var old = @tree_

		if new === old and new and new:taglen == undefined
			return self

		if !old and typ != 3
			removeAllChildren
			appendNested(self,new)

		elif typ == 1
			let caret = null
			for item,i in new
				caret = reconcileNested(self,item,old[i],caret)
		
		elif typ == 2
			return self

		elif typ == 3
			let ntyp = typeof new

			if new and new.@dom
				removeAllChildren
				appendChild(new)

			# check if old and new isa array
			elif new isa Array
				if new.@type == 5 and old and old.@type == 5
					reconcileLoop(self,new,old,null)
				elif old isa Array
					reconcileNested(self,new,old,null)
				else
					removeAllChildren
					appendNested(self,new)
			else
				text = new
				return self
				
		elif typ == 4
			reconcileIndexedArray(self,new,old,null)
			
		elif typ == 5
			reconcileLoop(self,new,old,null)

		elif new isa Array and old isa Array
			reconcileNested(self,new,old,null)
		else
			# what if text?
			removeAllChildren
			appendNested(self,new)

		@tree_ = new
		return self

	def content
		@content or children.toArray
	
	def setText text
		if text != @tree_
			var val = text === null or text === false ? '' : text
			(@text_ or @dom):textContent = val
			@text_ ||= @dom:firstChild
			@tree_ = text
		self

# alias setContent to setChildren
var proto = Imba.Tag:prototype
proto:setContent = proto:setChildren

# optimization for setText
var apple = typeof navigator != 'undefined' and (navigator:vendor or '').indexOf('Apple') == 0
if apple
	def proto.setText text
		if text != @tree_
			@dom:textContent = (text === null or text === false ? '' : text)
			@tree_ = text
		return self
