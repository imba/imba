(function(){


	
		
		// def remove a
		// 	# console.log 'removing element !! ',a
		// 	dom.removeChild(a.dom) if a
		// 	self
		
		IMBA_TAGS.htmlelement.prototype.setChildren = function (nodes){
			var al, bl;
			var prev = this._children;
			
			if((typeof nodes=='string'||nodes instanceof String) || (typeof nodes=='number'||nodes instanceof Number)) {
				this.setText(nodes);
				return this;
			};
			
			// console.log 'set content!',nodes
			if(prev != null) {
				// fast handling of all the cases where we only have a single inner node
				if(nodes == prev) {
					return this;
				};
				
				var aa = (prev instanceof Array);
				var ba = (nodes instanceof Array);
				
				if(!aa && !ba) {
					// console.log "just set the content directly",prev,nodes
					
					// be careful, no?!?
					IMBA_TAGS.htmlelement.__super__.setChildren.apply(this,arguments);// just replace the element
				} else if(aa && ba) {
					// need to loop through array
					var al = prev.length,bl = nodes.length;
					var l = Math.max(al,bl);
					var i = 0;
					
					var a, b;
					while(i < l){
						var a = prev[i],b = nodes[i];
						if(b && b != a) {
							this.append(b);
							
							// should not remove if another has just been added
							// only if it does not exist in b
							if(a) {
								this.remove(a);
							};
						} else if(a && a != b) {
							this.remove(a);
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
				// need to empty the element first
				// @dom:innerHTML = nil # hmmmm
				this.empty();
				IMBA_TAGS.htmlelement.__super__.setChildren.apply(this,arguments);
			};
			
			this._children = nodes;// update the cached children?
			return this;
		};
		
		IMBA_TAGS.htmlelement.prototype.content = function (){
			return this._content || this.children().toArray();
		};
		
		IMBA_TAGS.htmlelement.prototype.setText = function (text){
			if(text != this._children) {
				this.dom().textContent = this._children = text;// hmmmm
			};
			return this;
		};
	


}())