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
	
	
	
	// the general reconciler that respects conditions etc
	// caret is the current node we want to insert things after
	function reconcileNested(root,new$,old,caret){
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
						caret = reconcileNested(root,new$[i],old[i],caret);
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
				return caret;
			};
		};
		
		
		// simply remove the previous one and add the new one
		if (old) { removeNested(root,old,caret) };
		if (new$) { caret = insertNestedAfter(root,new$,caret) };
		return caret;
	};
	
	function reconcileBlocks(root,new$,old,caret){
		return caret;
	};
	
	
	function reconcileLoop(root,new$,old,caret){
		return;
	};
	
	
	
	
		
		// def remove a
		// 	# console.log 'removing element !! ',a
		// 	dom.removeChild(a.dom) if a
		// 	self
		
		IMBA_TAGS.htmlelement.prototype.setStaticChildren = function (new$){
			var nodes_, $1;
			var old = this._staticChildren;
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
					caret = reconcileNested(this,node,old[i],caret);
				};
			};
			
			this._staticChildren = new$;
			return this;
			
			if ((typeof (nodes_=this.nodes())=='string'||nodes_ instanceof String) || (typeof ($1=this.nodes())=='number'||$1 instanceof Number)) {
				this.setText(this.nodes());
				return this;
			};
			
			var prev = this._children;
			if (prev == null) {
				IMBA_TAGS.htmlelement.__super__.setStaticChildren.apply(this,arguments);
				this._children = this.nodes();
				return this;
			};
			
			// At this point we assume that we always get an array of same size.
			
			if (this.nodes().length == 0) {
				// Never anything to do.
				return this;
			};
			
			var tail = this._dom.firstChild;
			
			for (var idx=0, ary=iter$(this.nodes()), len=ary.length, node1; idx < len; idx++) {
				node1 = ary[idx];
				var prevNode = prev[idx];
				
				if ((node1 instanceof Array) && (prevNode instanceof Array)) {
					tail = reconcileLoop(prevNode,node1,tail);
				} else if (prevNode === node1) {
					tail = this.skipNode(node1,tail);
				} else {
					// if this is not a loop - we can be certain to simply
					tail = this.removeNode(prevNode,tail);
					tail = this.insertNode(node1,tail);
				};
			};
			
			// Remove the rest
			while (tail){
				tail = this.removeNode(true,tail);
			};
			
			this._children = this.nodes();
			return this;
		};
		
		IMBA_TAGS.htmlelement.prototype.removeNode = function (node,tail){
			if (node instanceof Array) {
				for (var i=0, ary=iter$(node), len=ary.length; i < len; i++) {
					tail = this.removeNode(ary[i],tail);
				};
			} else if (node) {
				var nextTail = tail.nextSibling;
				this.dom().removeChild(tail);
				tail = nextTail;
			};
			return tail;
		};
		
		IMBA_TAGS.htmlelement.prototype.skipNode = function (node,tail){
			if (node instanceof Array) {
				for (var i=0, ary=iter$(node), len=ary.length; i < len; i++) {
					tail = tail.nextSibling;
				};
			} else if (node) {
				tail = tail.nextSibling;
			};
			return tail;
		};
		
		IMBA_TAGS.htmlelement.prototype.insertBefore = function (node,rel){
			if ((typeof node=='string'||node instanceof String)) {
				this.log("insertBefore WITH STRING!!");
			};
			// supports both plain dom nodes and imba nodes
			if (node && rel) { this.dom().insertBefore((node._dom || node),(rel._dom || rel)) };
			return this;
		};
		
		IMBA_TAGS.htmlelement.prototype.appendChild = function (node){
			if (node) { this.dom().appendChild(node._dom || node) };
			return this;
		};
		
		IMBA_TAGS.htmlelement.prototype.removeChild = function (node){
			if (node) { this.dom().removeChild(node._dom || node) };
			return this;
		};
		
		
		IMBA_TAGS.htmlelement.prototype.insertNode = function (node,tail){
			if (node instanceof Array) {
				for (var i=0, ary=iter$(node), len=ary.length; i < len; i++) {
					// TODO: assert that `child` is a tag in development
					this.insertDomNode(ary[i]._dom);
				};
			} else if ((typeof node=='string'||node instanceof String) || (typeof node=='number'||node instanceof Number)) {
				var domNode = Imba.doc.createTextNode(this.item());
				this.insertDomNode(domNode,tail);
			} else if (node && node._dom) {
				this.insertDomNode(node._dom,tail);
			};
			return tail;
		};
		
		IMBA_TAGS.htmlelement.prototype.insertDomNode = function (domNode,tail){
			if (tail) {
				this.dom().insertBefore(domNode,tail);
			} else {
				this.dom().appendChild(domNode);
			};
			return tail;
		};
		
		IMBA_TAGS.htmlelement.prototype.reconcileLoop = function (prevNodes,nodes,tail){
			var removedNodes = 0;
			var isSorted = true;
			
			// `groups` contains the indexOf 
			var groups = [];
			var prevIdx = -1;
			var maxIdx = -1;
			var lastGroup;
			
			for (var i=0, ary=iter$(prevNodes), len=ary.length; i < len; i++) {
				var newIdx = nodes.indexOf(ary[i]);
				
				if (newIdx == -1) {
					// the node was removed
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
			
			var addedNodes = nodes.length - (prevNodes.length - removedNodes);
			
			// "changes" here implies that nodes have been added or removed
			var hasChanges = !(addedNodes == 0 && removedNodes == 0);
			
			if (isSorted) {
				if (hasChanges) {
					return this.reconcileChanges(prevNodes,nodes,tail);
				} else {
					return tail;
				};
			} else {
				if (!hasChanges && groups.length == 2) {
					return this.reconcileSwap(nodes,groups);
				} else if (!hasChanges && groups.length == 3) {
					return this.reconcileOrder(nodes,groups);
				} else {
					return this.reconcileScratch(prevNodes,nodes,tail);
				};
			};
		};
		
		IMBA_TAGS.htmlelement.prototype.reconcileChanges = function (prevNodes,nodes,tail){
			// TODO
			return this.reconcileScratch(prevNodes,nodes,tail);
		};
		
		IMBA_TAGS.htmlelement.prototype.reconcileSwap = function (nodes,groups){
			this.swapGroup(nodes,groups[0],groups[1]);
			var last = groups[0];
			var lastNode = nodes[last[last.length - 1]];
			return lastNode._dom.nextSibling;
		};
		
		IMBA_TAGS.htmlelement.prototype.reconcileOrder = function (nodes,groups){
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
				this.swapGroup(nodes,groups[1],groups[2]);
			} else if (groups[1][0] == 0) {
				// (2, 1, 3)
				last = groups[2];
				this.swapGroup(nodes,groups[0],groups[1]);
			} else if (groups[2][0] == 0) {
				this.moveGroup(nodes,this.group()[2],this.group()[0]);
				
				if (groups[0][0] > groups[1][0]) {
					// (3, 2, 1)
					last = groups[0];
					this.swapGroup(nodes,groups[0],groups[1]);
				} else {
					// (2, 3, 1)
					last = groups[1];
				};
			};
			
			var lastNode = nodes[last[last.length - 1]];
			return lastNode._dom.nextSibling;
		};
		
		IMBA_TAGS.htmlelement.prototype.moveGroupBeforeTail = function (nodes,group,tail){
			for (var i=0, ary=iter$(group), len=ary.length, res=[]; i < len; i++) {
				var node = nodes[ary[i]];
				res.push(this.insertDomNode(node._dom,tail));
			};
			return res;
		};
		
		IMBA_TAGS.htmlelement.prototype.moveGroup = function (nodes,group,nextGroup){
			var tail = nodes[nextGroup[0]]._dom.nextSibling;
			return this.moveGroupBeforeTail(nodes,group,tail);
		};
		
		IMBA_TAGS.htmlelement.prototype.swapGroup = function (nodes,group1,group2){
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
			return this.moveGroupBeforeTail(nodes,group,tail);
		};
		
		
		IMBA_TAGS.htmlelement.prototype.reconcileScratch = function (prevNodes,nodes,tail){
			for (var i=0, ary=iter$(prevNodes), len=ary.length; i < len; i++) {
				tail = this.removeNode(ary[i],tail);
			};
			
			var frag = Imba.doc.createDocumentFragment();
			for (var i=0, ary=iter$(nodes), len=ary.length; i < len; i++) {
				frag.appendChild(ary[i]._dom);
			};
			
			return this.insertDomNode(frag,tail);
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