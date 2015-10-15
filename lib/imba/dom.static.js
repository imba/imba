(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	
	
	function removeNested(root,node,caret){
		// if node/nodes isa String
		// 	we need to use the caret to remove elements
		// 	for now we will simply not support this
		if (node instanceof Array) {
			for (var i=0, ary=iter$(node), len=ary.length; i < len; i++) {
				removeNested(root,ary[i],caret);
			};
		} else if ((typeof node=='number'||node instanceof Number)) {
			false; // noop now -- will be used in 
		} else if (typeof node == 'string') {
			// trust that the next element is in fact the string
			var next = caret ? (caret.nextSibling) : (root._dom.firstChild);
			if (next instanceof Text) {
				root.removeChild(next);
			} else {
				throw 'cannot remove string';
			};
		} else if (node) {
			root.removeChild(node);
		};
		
		return caret;
	};
	
	function appendNested(root,node){
		if (node instanceof Array) {
			for (var i=0, ary=iter$(node), len=ary.length; i < len; i++) {
				appendNested(root,ary[i]);
			};
		} else if ((typeof node=='number'||node instanceof Number)) {
			false;
		} else if ((typeof node=='string'||node instanceof String)) {
			root.appendChild(Imba.document().createTextNode(node));
		} else if (node) {
			root.appendChild(node);
		};
		
		return;
	};
	
	// insert nodes before a certain node
	// does not need to return any tail, as before
	// will still be correct there
	// before must be an actual domnode
	function insertNestedBefore(root,node,before){
		
		if ((typeof node=='string'||node instanceof String)) {
			node = Imba.document().createTextNode(node);
		};
		
		if (node instanceof Array) {
			for (var i=0, ary=iter$(node), len=ary.length; i < len; i++) {
				insertNestedBefore(root,ary[i],before);
			};
		} else if ((typeof node=='number'||node instanceof Number)) {
			false; // noop now -- will be used in 
		} else if (node) {
			root.insertBefore(node,before);
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
		var oldLen = old.length;
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
		
		for (var idx=0, ary=iter$(old), len=ary.length, node; idx < len; idx++) {
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
			if (newPosition[cursor] == -1) {
				// do nothing. it was removed.
				null
			} else if (cursor == maxChainEnd) {
				stickyNodes[newPosition[cursor]] = true;
				maxChainEnd = prevChain[maxChainEnd];
			};
			
			cursor -= 1;
		};
		
		// And let's iterate forward, but only move non-sticky nodes
		for (var idx1=0, ary=iter$(new$), len=ary.length; idx1 < len; idx1++) {
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
				if (new$[i] !== old[i]) { break };
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
	function reconcileNested(root,new$,old,caret,container,ci){
		
		if (new$ === old) {
			// remember that the caret must be an actual dom element
			// we should instead move the actual caret? - trust
			if (new$ == null || new$ === false || new$ === true) {
				return caret;
			} else if (new$ && new$._dom) {
				return new$._dom;
			} else {
				return caret ? (caret.nextSibling) : (root._dom.firstChild);
			};
		} else if ((new$ instanceof Array) && (old instanceof Array)) {
			
			if (new$.static) {
				// if the static is not nested - we could get a hint from compiler
				// and just skip it
				if (new$.static == old.static) {
					for (var i=0, ary=iter$(new$), len=ary.length; i < len; i++) {
						// this is where we could do the triple equal directly
						caret = reconcileNested(root,ary[i],old[i],caret,new$,i);
					};
					return caret;
				};
				// if they are not the same we continue through to the default
			} else {
				return reconcileCollection(root,new$,old,caret);
			};
		} else if ((typeof new$=='string'||new$ instanceof String)) {
			var textNode;
			
			if (typeof old == 'string') {
				var next = caret ? (caret.nextSibling) : (root._dom.firstChild);
				// console.log 'the next element is a text?',next
				if (next instanceof Text) { old = next };
			};
			
			if (old instanceof Text) {
				// make sure not to trigger reflow in certain browsers
				if (old.textContent != new$) {
					old.textContent = new$;
				};
				
				textNode = old;
			} else {
				if (old) { removeNested(root,old,caret) };
				textNode = Imba.document().createTextNode(new$);
				insertNestedAfter(root,textNode,caret);
			};
			
			// swap the text with textNode in container
			return caret = textNode;
			// return container[ci] = caret = textNode
		};
		// simply remove the previous one and add the new one
		// will these ever be arrays?
		if (old) { removeNested(root,old,caret) };
		if (new$) { caret = insertNestedAfter(root,new$,caret) };
		return caret;
	};
	
	
	return Imba.extendTag('htmlelement', function(tag){
		
		tag.prototype.setChildren = function (nodes,typ){
			if (nodes === this._children) {
				return this;
			} else if (typeof nodes == 'string') {
				return (this.setText(nodes),nodes);
			} else if (typ == 1) {
				return this.setStaticChildren(nodes);
			} else if (typ == 2) {
				if (!this._children) {
					appendNested(this,this._children = nodes);
				};
				return this;
			} else if ((nodes instanceof Array) && (this._children instanceof Array)) {
				reconcileCollection(this,nodes,this._children,null);
			} else {
				this.empty().append(nodes);
			};
			
			this._children = nodes;
			return this;
		};
		
		
		tag.prototype.setStaticChildren = function (new$){
			var $1, $2;
			var old = this._children;
			
			// common case that should bail out from staticChildren
			if (new$.length == 1 && (typeof new$[($1=0)]=='string'||new$[$1] instanceof String)) {
				return (this.setText(new$[($2=0)]),new$[$2]);
			} else if (old) {
				if (new$.static) {
					// only when we are dealing with a single if/else?
					reconcileNested(this,new$,old,null,null,0);
				} else {
					var caret = null;
					for (var i=0, ary=iter$(new$), len=ary.length; i < len; i++) {
						caret = reconcileNested(this,ary[i],old[i],caret,new$,i);
					};
				};
			} else {
				this.empty();
				appendNested(this,new$);
			};
			
			this._children = new$;
			return this;
		};
		
		tag.prototype.content = function (){
			return this._content || this.children().toArray();
		};
		
		tag.prototype.setText = function (text){
			if (text != this._children) {
				this.dom().textContent = this._children = text;
			};
			return this;
		};
	});

})()