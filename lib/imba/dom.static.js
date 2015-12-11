(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	var ImbaTag = Imba.TAGS.element;
	
	function removeNested(root,node,caret){
		// if node/nodes isa String
		// 	we need to use the caret to remove elements
		// 	for now we will simply not support this
		if (node instanceof ImbaTag) {
			root.removeChild(node);
		} else if (node instanceof Array) {
			for (var i = 0, ary = iter$(node), len = ary.length; i < len; i++) {
				removeNested(root,ary[i],caret);
			};
		} else {
			// what if this is not null?!?!?
			// take a chance and remove a text-elementng
			var next = caret ? (caret.nextSibling) : (root._dom.firstChild);
			if ((next instanceof Text) && next.textContent == node) {
				root.removeChild(next);
			} else {
				throw 'cannot remove string';
			};
		};
		
		return caret;
	};
	
	function appendNested(root,node){
		if (node instanceof ImbaTag) {
			root.appendChild(node);
		} else if (node instanceof Array) {
			for (var i = 0, ary = iter$(node), len = ary.length; i < len; i++) {
				appendNested(root,ary[i]);
			};
		} else if (node != null && node !== false) {
			root.appendChild(Imba.document().createTextNode(node));
		};
		
		return;
	};
	
	
	// insert nodes before a certain node
	// does not need to return any tail, as before
	// will still be correct there
	// before must be an actual domnode
	function insertNestedBefore(root,node,before){
		if (node instanceof ImbaTag) {
			root.insertBefore(node,before);
		} else if (node instanceof Array) {
			for (var i = 0, ary = iter$(node), len = ary.length; i < len; i++) {
				insertNestedBefore(root,ary[i],before);
			};
		} else if (node != null && node !== false) {
			root.insertBefore(Imba.document().createTextNode(node),before);
		};
		
		return before;
	};
	
	// after must be an actual domnode
	function insertNestedAfter(root,node,after){
		var before = after ? (after.nextSibling) : (root._dom.firstChild);
		
		if (before) {
			insertNestedBefore(root,node,before);
			return before.previousSibling;
		} else {
			appendNested(root,node);
			return root._dom.lastChild;
		};
	};
	
	function reconcileCollectionChanges(root,new$,old,caret){
		
		var newLen = new$.length;
		var lastNew = new$[newLen - 1];
		
		// This re-order algorithm is based on the following principle:
		// 
		// We build a "chain" which shows which items are already sorted.
		// If we're going from [1, 2, 3] -> [2, 1, 3], the tree looks like:
		//
		// 	3 ->  0 (idx)
		// 	2 -> -1 (idx)
		// 	1 -> -1 (idx)
		//
		// This tells us that we have two chains of ordered items:
		// 
		// 	(1, 3) and (2)
		// 
		// The optimal re-ordering then becomes two keep the longest chain intact,
		// and move all the other items.
		
		var newPosition = [];
		
		// The tree/graph itself
		var prevChain = [];
		// The length of the chain
		var lengthChain = [];
		
		// Keep track of the longest chain
		var maxChainLength = 0;
		var maxChainEnd = 0;
		
		for (var idx = 0, ary = iter$(old), len = ary.length, node; idx < len; idx++) {
			node = ary[idx];
			var newPos = new$.indexOf(node);
			newPosition.push(newPos);
			
			if (newPos == -1) {
				root.removeChild(node);
				prevChain.push(-1);
				lengthChain.push(-1);
				continue;
			};
			
			var prevIdx = newPosition.length - 2;
			
			// Build the chain:
			while (prevIdx >= 0){
				if (newPosition[prevIdx] == -1) {
					prevIdx--;
				} else if (newPos > newPosition[prevIdx]) {
					// Yay, we're bigger than the previous!
					break;
				} else {
					// Nope, let's walk back the chain
					prevIdx = prevChain[prevIdx];
				};
			};
			
			prevChain.push(prevIdx);
			
			var currLength = (prevIdx == -1) ? (0) : (lengthChain[prevIdx] + 1);
			
			if (currLength > maxChainLength) {
				maxChainLength = currLength;
				maxChainEnd = idx;
			};
			
			lengthChain.push(currLength);
		};
		
		var stickyNodes = [];
		
		// Now we can walk the longest chain backwards and mark them as "sticky",
		// which implies that they should not be moved
		var cursor = newPosition.length - 1;
		while (cursor >= 0){
			if (cursor == maxChainEnd && newPosition[cursor] != -1) {
				stickyNodes[newPosition[cursor]] = true;
				maxChainEnd = prevChain[maxChainEnd];
			};
			
			cursor -= 1;
		};
		
		// And let's iterate forward, but only move non-sticky nodes
		for (var idx1 = 0, ary = iter$(new$), len = ary.length; idx1 < len; idx1++) {
			if (!stickyNodes[idx1]) {
				var after = new$[idx1 - 1];
				insertNestedAfter(root,ary[idx1],(after && after._dom) || caret);
			};
		};
		
		// should trust that the last item in new list is the caret
		return lastNew && lastNew._dom || caret;
	};
	
	
	// expects a flat non-sparse array of nodes in both new and old, always
	function reconcileCollection(root,new$,old,caret){
		var k = new$.length;
		var i = k;
		var last = new$[k - 1];
		
		
		if (k == old.length && new$[0] === old[0]) {
			// running through to compare
			while (i--){
				if (new$[i] !== old[i]) { break; };
			};
		};
		
		if (i == -1) {
			return last && last._dom || caret;
		} else {
			return reconcileCollectionChanges(root,new$,old,caret);
		};
	};
	
	// the general reconciler that respects conditions etc
	// caret is the current node we want to insert things after
	function reconcileNested(root,new$,old,caret){
		
		// if new == null or new === false or new === true
		// 	if new === old
		// 		return caret
		// 	if old && new != old
		// 		removeNested(root,old,caret) if old
		// 
		// 	return caret
		
		// var skipnew = new == null or new === false or new === true
		var newIsNull = new$ == null || new$ === false;
		var oldIsNull = old == null || old === false;
		
		
		if (new$ === old) {
			// remember that the caret must be an actual dom element
			// we should instead move the actual caret? - trust
			if (newIsNull) {
				return caret;
			} else if (new$ && new$._dom) {
				return new$._dom;
			} else {
				return caret ? (caret.nextSibling) : (root._dom.firstChild);
			};
		} else if (new$ instanceof Array) {
			if (old instanceof Array) {
				if (new$.static || old.static) {
					// if the static is not nested - we could get a hint from compiler
					// and just skip it
					if (new$.static == old.static) {
						for (var i = 0, ary = iter$(new$), len = ary.length; i < len; i++) {
							// this is where we could do the triple equal directly
							caret = reconcileNested(root,ary[i],old[i],caret);
						};
						return caret;
					} else {
						removeNested(root,old,caret);
					};
					
					// if they are not the same we continue through to the default
				} else {
					return reconcileCollection(root,new$,old,caret);
				};
			} else if (old instanceof ImbaTag) {
				root.removeChild(old);
			} else if (!oldIsNull) {
				// old was a string-like object?
				root.removeChild(caret ? (caret.nextSibling) : (root._dom.firstChild));
			};
			
			return insertNestedAfter(root,new$,caret);
			// remove old
		} else if (new$ instanceof ImbaTag) {
			if (!oldIsNull) { removeNested(root,old,caret) };
			insertNestedAfter(root,new$,caret);
			return new$;
		} else if (newIsNull) {
			if (!oldIsNull) { removeNested(root,old,caret) };
			return caret;
		} else {
			// if old did not exist we need to add a new directly
			var nextNode;
			// if old was array or imbatag we need to remove it and then add
			if (old instanceof Array) {
				removeNested(root,old,caret);
			} else if (old instanceof ImbaTag) {
				root.removeChild(old);
			} else if (!oldIsNull) {
				// ...
				nextNode = caret ? (caret.nextSibling) : (root._dom.firstChild);
				if ((nextNode instanceof Text) && nextNode.textContent != new$) {
					nextNode.textContent = new$;
					return nextNode;
				};
			};
			
			// now add the textnode
			return insertNestedAfter(root,new$,caret);
		};
	};
	
	
	return tag$.extendTag('htmlelement', function(tag){
		
		tag.prototype.setChildren = function (new$,typ){
			var old = this._children;
			// var isArray = nodes isa Array
			if (new$ === old) {
				return this;
			};
			
			if (!old) {
				this.empty();
				appendNested(this,new$);
			} else if (typ == 2) {
				return this;
			} else if (typ == 1) {
				// here we _know _that it is an array with the same shape
				// every time
				var caret = null;
				for (var i = 0, ary = iter$(new$), len = ary.length; i < len; i++) {
					// prev = old[i]
					caret = reconcileNested(this,ary[i],old[i],caret);
				};
			} else if (typ == 3) {
				// this is possibly fully dynamic. It often is
				// but the old or new could be static while the other is not
				// this is not handled now
				// what if it was previously a static array? edgecase - but must work
				if (new$ instanceof ImbaTag) {
					this.empty();
					this.appendChild(new$);
				} else if (new$ instanceof Array) {
					if (old instanceof Array) {
						// is this not the same as setting staticChildren now but with the
						reconcileCollection(this,new$,old,null);
					} else {
						this.empty();
						appendNested(this,new$);
					};
				} else {
					this.setText(new$);
					return this;
				};
			} else if ((new$ instanceof Array) && (old instanceof Array)) {
				reconcileCollection(this,new$,old,null);
			} else {
				this.empty();
				appendNested(this,new$);
			};
			
			this._children = new$;
			return this;
		};
		
		
		// only ever called with array as argument
		tag.prototype.setStaticChildren = function (new$){
			var old = this._children;
			
			var caret = null;
			for (var i = 0, ary = iter$(new$), len = ary.length; i < len; i++) {
				// prev = old[i]
				caret = reconcileNested(this,ary[i],old[i],caret);
			};
			
			this._children = new$;
			return this;
		};
		
		tag.prototype.content = function (){
			return this._content || this.children().toArray();
		};
		
		tag.prototype.setText = function (text){
			if (text != this._children) {
				this._children = text;
				this.dom().textContent = text == null || text === false ? ('') : (text);
			};
			return this;
		};
	});

})()