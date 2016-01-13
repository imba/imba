(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	
	/*
	The special syntax for selectors in Imba creates Imba.Selector
	instances.
	*/
	
	Imba.Selector = function Selector(sel,scope,nodes){
		
		this._query = sel instanceof Imba.Selector ? (sel.query()) : (sel);
		this._context = scope;
		
		if (nodes) {
			for (var i = 0, ary = iter$(nodes), len = ary.length, res = []; i < len; i++) {
				res.push(tag$wrap(ary[i]));
			};
			this._nodes = res;
		};
		
		this._lazy = !nodes;
		return this;
	};
	
	Imba.Selector.one = function (sel,scope){
		var el = (scope || Imba.document()).querySelector(sel);
		return el && tag$wrap(el) || null;
	};
	
	Imba.Selector.all = function (sel,scope){
		return new Imba.Selector(sel,scope);
	};
	
	Imba.Selector.prototype.query = function(v){ return this._query; }
	Imba.Selector.prototype.setQuery = function(v){ this._query = v; return this; };
	
	Imba.Selector.prototype.reload = function (){
		this._nodes = null;
		return this;
	};
	
	Imba.Selector.prototype.scope = function (){
		var ctx;
		if (this._scope) { return this._scope };
		if (!(ctx = this._context)) { return Imba.document() };
		return this._scope = ctx.toScope ? (ctx.toScope()) : (ctx);
	};
	
	/*
		@returns {Imba.Tag} first node matching this selector
		*/
	
	Imba.Selector.prototype.first = function (){
		if (this._lazy) { return tag$wrap(this._first || (this._first = this.scope().querySelector(this.query()))) } else {
			return this.nodes()[0];
		};
	};
	
	/*
		@returns {Imba.Tag} last node matching this selector
		*/
	
	Imba.Selector.prototype.last = function (){
		return this.nodes()[this._nodes.length - 1];
	};
	
	/*
		@returns [Imba.Tag] all nodes matching this selector
		*/
	
	Imba.Selector.prototype.nodes = function (){
		if (this._nodes) { return this._nodes };
		var items = this.scope().querySelectorAll(this.query());
		for (var i = 0, ary = iter$(items), len = ary.length, res = []; i < len; i++) {
			res.push(tag$wrap(ary[i]));
		};
		this._nodes = res;
		this._lazy = false;
		return this._nodes;
	};
	
	/*
		The number of nodes matching this selector
		*/
	
	Imba.Selector.prototype.count = function (){
		return this.nodes().length;
	};
	
	Imba.Selector.prototype.len = function (){
		return this.nodes().length;
	};
	
	/*
		@todo Add support for block or selector?
		*/
	
	Imba.Selector.prototype.some = function (){
		return this.count() >= 1;
	};
	
	/*
		Get node at index
		*/
	
	Imba.Selector.prototype.at = function (idx){
		return this.nodes()[idx];
	};
	
	/*
		Loop through nodes
		*/
	
	Imba.Selector.prototype.forEach = function (block){
		this.nodes().forEach(block);
		return this;
	};
	
	/*
		Map nodes
		*/
	
	Imba.Selector.prototype.map = function (block){
		return this.nodes().map(block);
	};
	
	/*
		Returns a plain array containing nodes. Implicitly called
		when iterating over a selector in Imba `(node for node in $(selector))`
		*/
	
	Imba.Selector.prototype.toArray = function (){
		return this.nodes();
	};
	
	// Get the first element that matches the selector, 
	// beginning at the current element and progressing up through the DOM tree
	Imba.Selector.prototype.closest = function (sel){
		// seems strange that we alter this selector?
		this._nodes = this.map(function(node) { return node.closest(sel); });
		return this;
	};
	
	// Get the siblings of each element in the set of matched elements, 
	// optionally filtered by a selector.
	// TODO remove duplicates?
	Imba.Selector.prototype.siblings = function (sel){
		this._nodes = this.map(function(node) { return node.siblings(sel); });
		return this;
	};
	
	// Get the descendants of each element in the current set of matched 
	// elements, filtered by a selector.
	Imba.Selector.prototype.find = function (sel){
		this._nodes = this.__query__(sel.query(),this.nodes());
		return this;
	};
	
	Imba.Selector.prototype.reject = function (blk){
		return this.filter(blk,false);
	};
	
	/*
		Filter the nodes in selector by a function or other selector
		*/
	
	Imba.Selector.prototype.filter = function (blk,bool){
		if(bool === undefined) bool = true;
		var fn = (blk instanceof Function) && blk || function(n) { return n.matches(blk); };
		var ary = this.nodes().filter(function(n) { return fn(n) == bool; });
		// if we want to return a new selector for this, we should do that for
		// others as well
		return new Imba.Selector("",this._scope,ary);
	};
	
	Imba.Selector.prototype.__query__ = function (query,contexts){
		var nodes = [];
		var i = 0;
		var l = contexts.length;
		
		while (i < l){
			nodes.push.apply(nodes,contexts[i++].querySelectorAll(query));
		};
		return nodes;
	};
	
	Imba.Selector.prototype.__matches__ = function (){
		return true;
	};
	
	/*
		Add specified flag to all nodes in selector
		*/
	
	Imba.Selector.prototype.flag = function (flag){
		return this.forEach(function(n) { return n.flag(flag); });
	};
	
	/*
		Remove specified flag from all nodes in selector
		*/
	
	Imba.Selector.prototype.unflag = function (flag){
		return this.forEach(function(n) { return n.unflag(flag); });
	};
	
	
	// def Imba.querySelectorAll
	q$ = function(sel,scope) { return new Imba.Selector(sel,scope); };
	
	// def Imba.Selector.one
	q$$ = function(sel,scope) {
		var el = (scope || Imba.document()).querySelector(sel);
		return el && tag$wrap(el) || null;
	};
	
	
	// extending tags with query-methods
	// must be a better way to reopen classes
	return tag$.extendTag('element', function(tag){
		tag.prototype.querySelectorAll = function (q){
			return this._dom.querySelectorAll(q);
		};
		tag.prototype.querySelector = function (q){
			return this._dom.querySelector(q);
		};
		
		// should be moved to Imba.Tag instead?
		// or we should implement all of them here
		tag.prototype.find = function (sel){
			return new Imba.Selector(sel,this);
		};
	});
	

})()