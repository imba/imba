(function(){


	function flatten(input,out){
		if(out === undefined) out = [];
		var idx = 0;
		var len = input.length;
		
		while (idx < len){
			var el = input[idx++];
			Array.isArray(el) ? (flatten(el,out)) : (out.push(el));
		};
		return out;
	};
	
	// for (var i=0; i<input.length; ++i) {
	//     var current = input[i];
	//     for (var j=0; j<current.length; ++j)
	//         flattened.push(current[j]);
	// }
	
	
	
		
		// def remove a
		// 	# console.log 'removing element !! ',a
		// 	dom.removeChild(a.dom) if a
		// 	self
		
		IMBA_TAGS.htmlelement.prototype.setChildren = function (nodes){
			var prev = this._children;
			
			if ((typeof nodes=='string'||nodes instanceof String) || (typeof nodes=='number'||nodes instanceof Number)) {
				this.setText(nodes);
				return this;
			};
			
			// console.log 'set content!',nodes
			if (prev != null) {
				// fast handling of all the cases where we only have a single inner node
				// later we will use this to optimize static templates
				if (nodes == prev) { return this };
				
				var aa = (prev instanceof Array);
				var ba = (nodes instanceof Array);
				
				if (ba) {
					nodes = flatten(nodes);
				};
				
				if (!aa && !ba) {
					// console.log "just set the content directly",prev,nodes
					IMBA_TAGS.htmlelement.__super__.setChildren.apply(this,arguments); // just replace the element
				} else if (aa && ba) {
					// need to loop through array
					var al = prev.length;
					var bl = nodes.length;
					
					var l = Math.max(al,bl);
					var i = 0;
					
					// need to find a much faster algorithm to discover
					// the actual changes in the array - and only change this
					// what about flattening arrays? we must do that right
					
					while (i < l){
						var a = prev[i];
						var b = nodes[i];
						
						// the index of old element in the new nodelist
						var abi = a ? (nodes.indexOf(a)) : (-1);
						
						// like before -- do nothing
						// if a == b
						//	i++
						//	continue
						
						if (b && b != a) {
							this.append(b);
							
							// should not remove if another has just been added
							// only if it does not exist in b
							if (a && abi == -1) { this.remove(a) };
						} else if (a && a != b) {
							if (abi == -1) { this.remove(a) };
							true;
						};
						i++;
					};
				} else {
					// should throw error, no?
					console.log("was array - is single -- confused=!!!!");
					this.empty();
					IMBA_TAGS.htmlelement.__super__.setChildren.apply(this,arguments);
				};
			} else {
				if (nodes instanceof Array) {
					nodes = flatten(nodes);
				};
				
				// need to empty the element first
				// @dom:innerHTML = nil
				this.empty();
				IMBA_TAGS.htmlelement.__super__.setChildren.apply(this,arguments);
			};
			
			this._children = nodes; // update the cached children?
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
	


}())