(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	
	Imba.document = function (){
		return window.document;
	};
	
	/*
	Returns the body element wrapped in an Imba.Tag
	*/
	
	Imba.root = function (){
		return tag$wrap(Imba.document().body);
	};
	
	Imba.TAGS.defineTag('htmlelement','element', function(tag){
		
		/*
			Called when a tag type is being subclassed.
			*/
		
		tag.inherit = function (child){
			child.prototype._empty = true;
			child._protoDom = null;
			
			if (this._nodeType) {
				child._nodeType = this._nodeType;
				
				var className = "_" + child._name.replace(/_/g,'-');
				return child._classes = this._classes.concat(className);
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
		
		tag.prototype.setChildren = function (nodes,type){
			this._empty ? (this.append(nodes)) : (this.empty().append(nodes));
			this._children = null;
			return this;
		};
		
		/*
			Set inner html of node
			*/
		
		tag.prototype.setHtml = function (html){
			this._dom.innerHTML = html;
			return this;
		};
		
		/*
			Get inner html of node
			*/
		
		tag.prototype.html = function (){
			return this._dom.innerHTML;
		};
		
		/*
			Remove all content inside node
			*/
		
		tag.prototype.empty = function (){
			while (this._dom.firstChild){
				this._dom.removeChild(this._dom.firstChild);
			};
			this._children = null;
			this._empty = true;
			return this;
		};
		
		/*
			Remove specified child from current node.
			*/
		
		tag.prototype.remove = function (child){
			var par = this.dom();
			var el = child && child.dom();
			if (el && el.parentNode == par) { par.removeChild(el) };
			return this;
		};
		
		tag.prototype.emit = function (name,pars){
			if(!pars||pars.constructor !== Object) pars = {};
			var data = pars.data !== undefined ? pars.data : null;
			var bubble = pars.bubble !== undefined ? pars.bubble : true;
			Imba.Events.trigger(name,this,{data: data,bubble: bubble});
			return this;
		};
		
		tag.prototype.css = function (key,val){
			if (key instanceof Object) {
				for (var i = 0, keys = Object.keys(key), l = keys.length; i < l; i++){
					this.css(keys[i],key[keys[i]]);
				};
			} else if (val == null) {
				this.dom().style.removeProperty(key);
			} else if (val == undefined) {
				return this.dom().style[key];
			} else {
				if ((typeof val=='number'||val instanceof Number) && key.match(/width|height|left|right|top|bottom/)) {
					val = val + "px";
				};
				this.dom().style[key] = val;
			};
			return this;
		};
		
		tag.prototype.dataset = function (key,val){
			if (key instanceof Object) {
				for (var i = 0, keys = Object.keys(key), l = keys.length; i < l; i++){
					this.dataset(keys[i],key[keys[i]]);
				};
				return this;
			};
			
			if (arguments.length == 2) {
				this.setAttribute(("data-" + key),val);
				return this;
			};
			
			if (key) {
				return this.getAttribute(("data-" + key));
			};
			
			var dataset = this.dom().dataset;
			
			if (!dataset) {
				dataset = {};
				for (var i1 = 0, ary = iter$(this.dom().attributes), len = ary.length, atr; i1 < len; i1++) {
					atr = ary[i1];
					if (atr.name.substr(0,5) == 'data-') {
						dataset[Imba.toCamelCase(atr.name.slice(5))] = atr.value;
					};
				};
			};
			
			return dataset;
		};
		
		/*
			Get descendants of current node, optionally matching selector
			@return {Imba.Selector}
			*/
		
		tag.prototype.find = function (sel){
			return new Imba.Selector(sel,this);
		};
		
		/*
			Get the first matching child of node
		
			@return {Imba.Tag}
			*/
		
		tag.prototype.first = function (sel){
			return sel ? (this.find(sel).first()) : (tag$wrap(this.dom().firstElementChild));
		};
		
		/*
			Get the last matching child of node
		
			# example
				node.last # returns the last child of node
				node.last %span # returns the last span inside node
				node.last do |el| el.text == 'Hi' # return last node with text Hi
		
			@return {Imba.Tag}
			*/
		
		tag.prototype.last = function (sel){
			return sel ? (this.find(sel).last()) : (tag$wrap(this.dom().lastElementChild));
		};
		
		/*
			Get the child at index
			*/
		
		tag.prototype.child = function (i){
			return tag$wrap(this.dom().children[i || 0]);
		};
		
		tag.prototype.children = function (sel){
			var nodes = new Imba.Selector(null,this,this._dom.children);
			return sel ? (nodes.filter(sel)) : (nodes);
		};
		
		tag.prototype.orphanize = function (){
			var par;
			if (par = this.dom().parentNode) { par.removeChild(this._dom) };
			return this;
		};
		
		tag.prototype.matches = function (sel){
			var fn;
			if (sel instanceof Function) {
				return sel(this);
			};
			
			if (sel.query) { sel = sel.query() };
			if (fn = (this._dom.webkitMatchesSelector || this._dom.matches)) { return fn.call(this._dom,sel) };
			// TODO support other browsers etc?
		};
		
		/*
			Get the first element matching supplied selector / filter
			traversing upwards, but including the node itself.
			@return {Imba.Tag}
			*/
		
		tag.prototype.closest = function (sel){
			if (!sel) { return this.parent() }; // should return self?!
			var node = this;
			if (sel.query) { sel = sel.query() };
			
			while (node){
				if (node.matches(sel)) { return node };
				node = node.parent();
			};
			return null;
		};
		
		/*
			Get the closest ancestor of node that matches
			specified selector / matcher.
		
			@return {Imba.Tag}
			*/
		
		tag.prototype.up = function (sel){
			if (!sel) { return this.parent() };
			return this.parent() && this.parent().closest(sel);
		};
		
		tag.prototype.path = function (sel){
			var node = this;
			var nodes = [];
			if (sel && sel.query) { sel = sel.query() };
			
			while (node){
				if (!sel || node.matches(sel)) { nodes.push(node) };
				node = node.parent();
			};
			return nodes;
		};
		
		tag.prototype.parents = function (sel){
			var par = this.parent();
			return par ? (par.path(sel)) : ([]);
		};
		
		
		
		tag.prototype.siblings = function (sel){
			var par, self = this;
			if (!(par = this.parent())) { return [] }; // FIXME
			var ary = this.dom().parentNode.children;
			var nodes = new Imba.Selector(null,this,ary);
			return nodes.filter(function(n) { return n != self && (!sel || n.matches(sel)); });
		};
		
		/*
			Get the immediately following sibling of node.
			*/
		
		tag.prototype.next = function (sel){
			if (sel) {
				var el = this;
				while (el = el.next()){
					if (el.matches(sel)) { return el };
				};
				return null;
			};
			return tag$wrap(this.dom().nextElementSibling);
		};
		
		/*
			Get the immediately preceeding sibling of node.
			*/
		
		tag.prototype.prev = function (sel){
			if (sel) {
				var el = this;
				while (el = el.prev()){
					if (el.matches(sel)) { return el };
				};
				return null;
			};
			return tag$wrap(this.dom().previousElementSibling);
		};
		
		tag.prototype.contains = function (node){
			return this.dom().contains(node && node._dom || node);
		};
		
		tag.prototype.index = function (){
			var i = 0;
			var el = this.dom();
			while (el.previousSibling){
				el = el.previousSibling;
				i++;
			};
			return i;
		};
		
		
		/*
			
			@deprecated
			*/
		
		tag.prototype.insert = function (node,pars){
			if(!pars||pars.constructor !== Object) pars = {};
			var before = pars.before !== undefined ? pars.before : null;
			var after = pars.after !== undefined ? pars.after : null;
			if (after) { before = after.next() };
			if (node instanceof Array) {
				node = (t$('fragment').setContent(node,0).end());
			};
			if (before) {
				this.dom().insertBefore(node.dom(),before.dom());
			} else {
				this.append(node);
			};
			return this;
		};
		
		/*
			Focus on current node
			@return {self}
			*/
		
		tag.prototype.focus = function (){
			this.dom().focus();
			return this;
		};
		
		/*
			Remove focus from current node
			@return {self}
			*/
		
		tag.prototype.blur = function (){
			this.dom().blur();
			return this;
		};
		
		tag.prototype.template = function (){
			return null;
		};
		
		/*
			@todo Should support multiple arguments like append
		
			The .prepend method inserts the specified content as the first
			child of the target node. If the content is already a child of 
			node it will be moved to the start.
			
		    	node.prepend <div.top> # prepend node
		    	node.prepend "some text" # prepend text
		    	node.prepend [<ul>,<ul>] # prepend array
		
			*/
		
		tag.prototype.prepend = function (item){
			var first = this._dom.childNodes[0];
			first ? (this.insertBefore(item,first)) : (this.appendChild(item));
			return this;
		};
		
		/*
			The .append method inserts the specified content as the last child
			of the target node. If the content is already a child of node it
			will be moved to the end.
			
			# example
			    var root = <div.root>
			    var item = <div.item> "This is an item"
			    root.append item # appends item to the end of root
		
			    root.prepend "some text" # append text
			    root.prepend [<ul>,<ul>] # append array
			*/
		
		tag.prototype.append = function (item){
			// possible to append blank
			// possible to simplify on server?
			if (!item) { return this };
			
			if (item instanceof Array) {
				for (var i = 0, ary = iter$(item), len = ary.length, member; i < len; i++) {
					member = ary[i];
					member && this.append(member);
				};
			} else if ((typeof item=='string'||item instanceof String) || (typeof item=='number'||item instanceof Number)) {
				var node = Imba.document().createTextNode(item);
				this._dom.appendChild(node);
				if (this._empty) { this._empty = false };
			} else {
				this._dom.appendChild(item._dom || item);
				if (this._empty) { this._empty = false };
			};
			
			return this;
		};
		
		/*
			Insert a node into the current node (self), before another.
			The relative node must be a child of current node. 
			*/
		
		tag.prototype.insertBefore = function (node,rel){
			if ((typeof node=='string'||node instanceof String)) { node = Imba.document().createTextNode(node) };
			if (node && rel) { this.dom().insertBefore((node._dom || node),(rel._dom || rel)) };
			return this;
		};
		
		/*
			Append a single item (node or string) to the current node.
			If supplied item is a string it will automatically. This is used
			by Imba internally, but will practically never be used explicitly.
			*/
		
		tag.prototype.appendChild = function (node){
			if ((typeof node=='string'||node instanceof String)) { node = Imba.document().createTextNode(node) };
			if (node) { this.dom().appendChild(node._dom || node) };
			return this;
		};
		
		/*
			Remove a single child from the current node.
			Used by Imba internally.
			*/
		
		tag.prototype.removeChild = function (node){
			if (node) { this.dom().removeChild(node._dom || node) };
			return this;
		};
		
		tag.prototype.toString = function (){
			return this._dom.toString(); // really?
		};
		
		/*
			@deprecated
			*/
		
		tag.prototype.classes = function (){
			console.log('Imba.Tag#classes is deprecated');
			return this._dom.classList;
		};
	});
	
	return Imba.TAGS.defineTag('svgelement','htmlelement');

})()