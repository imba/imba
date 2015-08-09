(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	
	
		
		// def remove a
		// 	# console.log 'removing element !! ',a
		// 	dom.removeChild(a.dom) if a
		// 	self
		
		IMBA_TAGS.htmlelement.prototype.setStaticChildren = function (nodes){
			if ((typeof nodes=='string'||nodes instanceof String) || (typeof nodes=='number'||nodes instanceof Number)) {
				this.setText(nodes);
				return this;
			};
			
			var prev = this._children;
			if (prev == null) {
				IMBA_TAGS.htmlelement.__super__.setStaticChildren.apply(this,arguments);
				this._children = nodes;
				return this;
			};
			
			// At this point we assume that we always get an array of same size.
			
			if (nodes.length == 0) {
				// Never anything to do.
				return this;
			};
			
			var tail = this._dom.firstChild;
			
			for (var idx=0, ary=iter$(nodes), len=ary.length, node; idx < len; idx++) {
				node = ary[idx];
				var prevNode = prev[idx];
				
				if ((node instanceof Array) && (prevNode instanceof Array)) {
					tail = this.reconcileLoop(prevNode,node,tail);
				} else if (prevNode === node) {
					tail = this.skipNode(node,tail);
				} else {
					tail = this.removeNode(prevNode,tail);
					tail = this.insertNode(node,tail);
				};
			};
			
			// Remove the rest
			while (tail){
				tail = this.removeNode(true,tail);
			};
			
			this._children = nodes;
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