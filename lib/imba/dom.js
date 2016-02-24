(function(){
	
	Imba.document = function (){
		return window.document;
	};
	
	/*
	Returns the body element wrapped in an Imba.Tag
	*/
	
	Imba.root = function (){
		return tag$wrap(Imba.document().body);
	};
	
	tag$.defineTag('htmlelement', 'element', function(tag){
		
		/*
			Called when a tag type is being subclassed.
			*/
		
		tag.inherit = function (child){
			child.prototype._empty = true;
			child._protoDom = null;
			
			if (this._nodeType) {
				child._nodeType = this._nodeType;
				
				var className = "_" + child._name.replace(/_/g,'-');
				if (child._name[0] != '#') { return child._classes = this._classes.concat(className) };
			} else {
				child._nodeType = child._name;
				return child._classes = [];
			};
		};
		
		tag.buildNode = function (){
			var dom = Imba.document().createElement(this._nodeType);
			var cls = this._classes.join(" ");
			if (cls) { dom.className = cls };
			return dom;
		};
		
		tag.createNode = function (){
			var proto = (this._protoDom || (this._protoDom = this.buildNode()));
			return proto.cloneNode(false);
		};
		
		tag.dom = function (){
			return this._protoDom || (this._protoDom = this.buildNode());
		};
		
		tag.prototype.tabindex = function(v){ return this.getAttribute('tabindex'); }
		tag.prototype.setTabindex = function(v){ this.setAttribute('tabindex',v); return this; };
		tag.prototype.title = function(v){ return this.getAttribute('title'); }
		tag.prototype.setTitle = function(v){ this.setAttribute('title',v); return this; };
		tag.prototype.role = function(v){ return this.getAttribute('role'); }
		tag.prototype.setRole = function(v){ this.setAttribute('role',v); return this; };
		tag.prototype.name = function(v){ return this.getAttribute('name'); }
		tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
		
		tag.prototype.width = function (){
			return this._dom.offsetWidth;
		};
		
		tag.prototype.height = function (){
			return this._dom.offsetHeight;
		};
		
		tag.prototype.setChildren = function (nodes,type){
			this._empty ? (this.append(nodes)) : (this.empty().append(nodes));
			this._children = null;
			return this;
		};
		
		tag.prototype.emit = function (name,pars){
			if(!pars||pars.constructor !== Object) pars = {};
			var data = pars.data !== undefined ? pars.data : null;
			var bubble = pars.bubble !== undefined ? pars.bubble : true;
			Imba.Events.trigger(name,this,{data: data,bubble: bubble});
			return this;
		};
		
		tag.prototype.template = function (){
			return null;
		};
	});
	
	return tag$.defineTag('svgelement', 'htmlelement');

})();