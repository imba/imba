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
			console.log("String in appendNested");
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
	
	// same as insertNestedBefore?
	function moveGroupBeforeTail(root,nodes,group,tail){
		for (var i=0, ary=iter$(group), len=ary.length; i < len; i++) {
			var node = nodes[ary[i]];
			root.insertBefore(node,tail);
		};
		// tail will stay the same
		return;
	};
	
	function moveGroup(root,nodes,group,nextGroup,caret){
		var tail = nodes[nextGroup[0]]._dom.nextSibling;
		return moveGroupBeforeTail(root,nodes,group,tail);
	};
	
	function swapGroup(root,nodes,group1,group2,caret){
		var group,tail;
		
		if (group1.length < group2.length) {
			// Move group1 to the right of group2
			group = group1;
			tail = nodes[group2[group2.length - 1]]._dom.nextSibling;
		} else {
			// Move group2 in from of group1
			group = group2;
			tail = nodes[group1[0]]._dom;
		};
		
		return moveGroupBeforeTail(root,nodes,group,tail);
	};
	
	
	function reconcileOrder(root,nodes,groups,caret){
		
		var last;
		// We have these possible cases:
		// (1, 3, 2)
		// (2, 3, 1)
		// (2, 1, 3)
		// (3, 2, 1)
		
		// Note that swapGroup/moveGroup does not change `groups` or `nodes`
		
		if (groups[0][0] == 0) {
			// (1, 3, 2)
			last = groups[1];
			swapGroup(root,nodes,groups[1],groups[2],caret);
		} else if (groups[1][0] == 0) {
			// (2, 1, 3)
			last = groups[2];
			swapGroup(root,nodes,groups[0],groups[1],caret);
		} else if (groups[2][0] == 0) {
			moveGroup(root,nodes,groups[2],groups[0],caret);
			
			if (groups[0][0] > groups[1][0]) {
				// (3, 2, 1)
				last = groups[0];
				swapGroup(root,nodes,groups[0],groups[1],caret);
			} else {
				// (2, 3, 1)
				last = groups[1];
			};
		};
		
		// no need to return the caret?
		var lastNode = nodes[last[last.length - 1]];
		return lastNode._dom.nextSibling;
	};
	
	
	function reconcileSwap(root,nodes,groups,caret){
		swapGroup(root,nodes,groups[0],groups[1],caret);
		var last = groups[0];
		var lastNode = nodes[last[last.length - 1]];
		return lastNode._dom.nextSibling;
	};
	
	
	function reconcileFull(root,new$,old,caret){
		// console.log "reconcileFull"
		removeNested(root,old,caret);
		caret = insertNestedAfter(root,new$,caret);
		return caret;
	};
	
	
	// expects a flat non-sparse array of nodes in both new and old, always
	function reconcileCollection(root,new$,old,caret){
		
		var newLen = new$.length;
		var oldLen = old.length;
		
		var removedNodes = 0;
		var isSorted = true;
		
		// if we trust that reconcileCollection does the job
		// we know that the caret should have moved to the
		// last element of our new nodes.
		var lastNew = new$[newLen - 1];
		
		// `groups` contains the indexOf 
		var groups = [];
		var remove = [];
		var prevIdx = -1;
		var maxIdx = -1;
		var lastGroup;
		
		// in most cases the two collections will be
		// unchanged. Might be smartest to look for this case first?
		
		for (var i=0, ary=iter$(old), len=ary.length, node; i < len; i++) {
			node = ary[i];
			var newIdx = new$.indexOf(node);
			
			if (newIdx == -1) {
				// the node was removed
				remove.push(node);
				removedNodes++;
			} else {
				if (newIdx < maxIdx) {
					isSorted = false;
				} else {
					maxIdx = newIdx;
				};
			};
			
			if (prevIdx != -1 && (newIdx - prevIdx) == 1) {
				lastGroup.push(newIdx);
			} else {
				lastGroup = [newIdx];
				groups.push(lastGroup);
			};
			prevIdx = newIdx;
		};
		
		var addedNodes = new$.length - (old.length - removedNodes);
		
		// console.log "reconcileCollection",addedNodes, removedNodes, isSorted,new,old,groups
		// "changes" here implies that nodes have been added or removed
		var hasChanges = !(addedNodes == 0 && removedNodes == 0);
		
		if (isSorted) {
			// this is very simple
			if (removedNodes && !addedNodes) {
				// console.log "only removed nodes"
				for (var i=0, len=remove.length; i < len; i++) {
					root.removeChild(remove[i]);
				};
			} else if (addedNodes) {
				// this can include both removed and 
				// maybe remove nodes first -- so easy
				var remaining = old;
				var oldI = 0;
				
				if (removedNodes) {
					for (var i1=0, len=remove.length; i1 < len; i1++) {
						root.removeChild(remove[i1]);
					};
					remaining = old.filter(function(node) {
						return remove.indexOf(node) == -1;
					});
				};
				
				// simply loop over new nodes, and insert them where they belong
				for (var i2=0, ary=iter$(new$), len=ary.length, node1; i2 < len; i2++) {
					node1 = ary[i2];
					if (node1 === remaining[oldI]) {
						oldI++; // only step forward if it is the same
						caret = node1._dom;
						continue;
					};
					
					caret = insertNestedAfter(root,node1,caret);
				};
			};
		} else if (hasChanges) {
			// console.log "reconcileScratch",groups
			reconcileFull(root,new$,old,caret);
		} else if (groups.length == 2) {
			// console.log "reconcileSwap"
			reconcileSwap(root,new$,groups,caret);
		} else if (groups.length == 3) {
			// console.log "reconcileOrder"
			reconcileOrder(root,new$,groups,caret);
		} else {
			// too much to sort - just remove and append everything
			reconcileFull(root,new$,old,caret);
		};
		
		// should trust that the last item in new list is the caret
		return lastNew && lastNew._dom || caret;
	};
	
	
	// the general reconciler that respects conditions etc
	// caret is the current node we want to insert things after
	function reconcileNested(root,new$,old,caret,container,ci){
		if (new$ === old) {
			// will call reconcile directly for every node
			// cant be very efficient?
			// what if this is a number? can that happen?
			
			// remember that the caret must be an actual dom element
			return (new$ && new$._dom) || new$ || caret;
		};
		
		var newIsArray = (new$ instanceof Array);
		var oldIsArray = (old instanceof Array);
		
		// this could be a dynamic / loop
		if (newIsArray && oldIsArray) {
			var newLen = new$.length;
			var oldLen = old.length;
			
			var new0 = new$[0];
			var old0 = old[0];
			
			var isBlocks = typeof new0 == 'number' && typeof old0 == 'number';
			
			// if these are static blocks, they
			// always include a unique number as first element
			if (isBlocks) {
				// console.log "is blocks"
				// these are static blocks. If they are not the same
				// block we can handle them in the most primitive way
				
				// if they are the same, we need to reconcile members
				// they should also have the same length
				if (new0 == old0) {
					// console.log "same block!"
					var i = 0;
					while (++i < newLen){
						caret = reconcileNested(root,new$[i],old[i],caret,new$,i);
					};
					// console.log "return caret",caret
					return caret;
				} else {
					// these are two fully separate blocks - we can remove and insert
					removeNested(root,old);
					return caret = insertNestedAfter(root,new$,caret);
				};
			} else {
				// this is where we get into the advanced reconcileLoop
				// console.log "should redirect to dynamic!"
				caret = reconcileCollection(root,new$,old,caret);
				return caret;
			};
		} else if ((typeof new$=='string'||new$ instanceof String)) {
			var textNode;
			
			if (old instanceof Text) {
				old.textContent = new$;
				textNode = old;
			} else {
				if (old) { removeNested(root,old,caret) };
				textNode = Imba.document().createTextNode(new$);
				insertNestedAfter(root,textNode,caret);
				// insert the text node now
				// root.insertBefore(textNode,caret ? caret:nextSibling : root.@dom:firstChild)
			};
			
			// swap the text with textNode in container
			return container[ci] = caret = textNode;
			
			// the other one will now either be a textnode or null
			// if it is a textnode - merely replace the text - copy the node
			// if typeof old === 'string'
			// 	console.log "found string here -- trust at the next element after caret is"
			// 	let textNode = (caret or root.@dom:firstChild)
			// 	textNode:textContent = new
		};
		
		
		
		// simply remove the previous one and add the new one
		// will these ever be arrays?
		if (old) { removeNested(root,old,caret) };
		if (new$) { caret = insertNestedAfter(root,new$,caret) };
		return caret;
	};
	
	
	
	
		
		IMBA_TAGS.htmlelement.prototype.setStaticChildren = function (new$){
			var old = this._staticChildren || [];
			var caret = null;
			
			if (!old) {
				appendNested(this,this._staticChildren = new$);
				return this;
			};
			
			for (var i=0, ary=iter$(new$), len=ary.length, node; i < len; i++) {
				node = ary[i];
				if (node === old[i]) {
					if (node && node._dom) { caret = node._dom };
				} else {
					caret = reconcileNested(this,node,old[i],caret,new$,i);
				};
			};
			
			this._staticChildren = new$;
			return this;
		};
		
		IMBA_TAGS.htmlelement.prototype.insertBefore = function (node,rel){
			// if node isa String
			// 	log "insertBefore WITH STRING!! - not allowed now"
			// supports both plain dom nodes and imba nodes
			// if typeof node == 'string'
			//	log "converted to string"
			if ((typeof node=='string'||node instanceof String)) { node = Imba.document().createTextNode(node) };
			if (node && rel) { this.dom().insertBefore((node._dom || node),(rel._dom || rel)) };
			return this;
		};
		
		IMBA_TAGS.htmlelement.prototype.appendChild = function (node){
			if ((typeof node=='string'||node instanceof String)) { node = Imba.document().createTextNode(node) };
			if (node) { this.dom().appendChild(node._dom || node) };
			return this;
		};
		
		IMBA_TAGS.htmlelement.prototype.removeChild = function (node){
			// cannot remove a string
			if (node) { this.dom().removeChild(node._dom || node) };
			return this;
		};
		
		IMBA_TAGS.htmlelement.prototype.content = function (){
			return this._content || this.children().toArray();
		};
		
		IMBA_TAGS.htmlelement.prototype.setText = function (text){
			if (text != this._children) {
				this.dom().textContent = this._children = text;
			};
			return this;
		};
	

})()