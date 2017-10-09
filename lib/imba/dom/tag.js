function idx$(a,b){
	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
};
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = require("../imba");

Imba.CSSKeyMap = {};

Imba.TAG_BUILT = 1;
Imba.TAG_SETUP = 2;
Imba.TAG_MOUNTING = 4;
Imba.TAG_MOUNTED = 8;
Imba.TAG_SCHEDULED = 16;
Imba.TAG_AWAKENED = 32;

/*
Get the current document
*/

Imba.document = function (){
	
	return this._document || (this._document = new ImbaServerDocument());
	
};

/*
Get the body element wrapped in an Imba.Tag
*/

Imba.root = function (){
	return tag$wrap(Imba.document().body);
};


Imba.static = function (items,nr){
	items.static = nr;
	return items;
};

/*

*/

Imba.mount = function (node,into){
	into || (into = Imba.document().body);
	into.appendChild(node.dom());
	Imba.TagManager.insert(node,into);
	Imba.commit();
	return node;
};


Imba.createTextNode = function (node){
	if (node && node.nodeType == 3) {
		return node;
	};
	return Imba.document().createTextNode(node);
};

/*
This is the baseclass that all tags in imba inherit from.
@iname node
*/

Imba.Tag = function Tag(dom,ctx){
	this.setDom(dom);
	this.__ = {};
	this.FLAGS = 0;
	
	this._owner_ = ctx;
	
	this.build();
	this;
};

Imba.Tag.buildNode = function (){
	var dom = Imba.document().createElement(this._nodeType || 'div');
	if (this._classes) {
		var cls = this._classes.join(" ");
		if (cls) { dom.className = cls };
	};
	return dom;
};

Imba.Tag.createNode = function (){
	var proto = (this._protoDom || (this._protoDom = this.buildNode()));
	return proto.cloneNode(false);
};

Imba.Tag.build = function (ctx){
	return new this(this.createNode(),ctx);
};

Imba.Tag.dom = function (){
	return this._protoDom || (this._protoDom = this.buildNode());
};

/*
	Called when a tag type is being subclassed.
	*/

Imba.Tag.inherit = function (child){
	child.prototype._empty = true;
	child._protoDom = null;
	
	if (this._nodeType) {
		child._nodeType = this._nodeType;
		child._classes = this._classes.slice();
		
		if (child._flagName) {
			return child._classes.push(child._flagName);
		};
	} else {
		child._nodeType = child._name;
		child._flagName = null;
		return child._classes = [];
	};
};

/*
	Internal method called after a tag class has
	been declared or extended.
	
	@private
	*/

Imba.Tag.prototype.optimizeTagStructure = function (){
	var base = Imba.Tag.prototype;
	var hasSetup = this.setup != base.setup;
	var hasCommit = this.commit != base.commit;
	var hasRender = this.render != base.render;
	var hasMount = this.mount;
	
	var ctor = this.constructor;
	
	if (hasCommit || hasRender || hasMount || hasSetup) {
		
		this.end = function() {
			if (this.mount && !(this.FLAGS & Imba.TAG_MOUNTED)) {
				// just activate 
				Imba.TagManager.mount(this);
			};
			
			if (!(this.FLAGS & Imba.TAG_SETUP)) {
				this.FLAGS |= Imba.TAG_SETUP;
				this.setup();
			};
			
			this.commit();
			
			return this;
		};
	};
	
	
	return this;
};


Imba.Tag.prototype.tabindex = function(v){ return this.getAttribute('tabindex'); }
Imba.Tag.prototype.setTabindex = function(v){ this.setAttribute('tabindex',v); return this; };
Imba.Tag.prototype.title = function(v){ return this.getAttribute('title'); }
Imba.Tag.prototype.setTitle = function(v){ this.setAttribute('title',v); return this; };
Imba.Tag.prototype.role = function(v){ return this.getAttribute('role'); }
Imba.Tag.prototype.setRole = function(v){ this.setAttribute('role',v); return this; };
Imba.Tag.prototype.name = function(v){ return this.getAttribute('name'); }
Imba.Tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };

Imba.Tag.prototype.dom = function (){
	return this._dom;
};

Imba.Tag.prototype.setDom = function (dom){
	dom._tag = this;
	this._dom = dom;
	return this;
};

Imba.Tag.prototype.ref = function (){
	return this._ref;
};

/*
	Setting references for tags like
	`<div@header>` will compile to `tag('div').ref_('header',this).end()`
	By default it adds the reference as a className to the tag.

	@return {self}
	@private
	*/

Imba.Tag.prototype.ref_ = function (ref,ctx){
	ctx['_' + ref] = this;
	this.flag(this._ref = ref);
	this._owner = ctx;
	return this;
};


/*
	Set the data object for node
	@return {self}
	*/

Imba.Tag.prototype.setData = function (data){
	this._data = data;
	return this;
};

/*
	Get the data object for node
	*/

Imba.Tag.prototype.data = function (){
	return this._data;
};

Imba.Tag.prototype.setObject = function (value){
	console.warn('Tag#object= deprecated. Use Tag#data=');
	this.setData(value);
	return this;
};

Imba.Tag.prototype.object = function (){
	return this.data();
};

/*
	Set inner html of node
	*/

Imba.Tag.prototype.setHtml = function (html){
	this._dom.innerHTML = html;
	return this;
};

/*
	Get inner html of node
	*/

Imba.Tag.prototype.html = function (){
	return this._dom.innerHTML;
};


/*
	Get width of node (offsetWidth)
	@return {number}
	*/

Imba.Tag.prototype.width = function (){
	return this._dom.offsetWidth;
};

/*
	Get height of node (offsetHeight)
	@return {number}
	*/

Imba.Tag.prototype.height = function (){
	return this._dom.offsetHeight;
};

/*
	Method that is called by the compiled tag-chains, for
	binding events on tags to methods etc.
	`<a :tap=fn>` compiles to `tag('a').setHandler('tap',fn,this).end()`
	where this refers to the context in which the tag is created.
	@return {self}
	*/

Imba.Tag.prototype.setHandler = function (event,handler,ctx){
	var key = 'on' + event;
	
	if (handler instanceof Function) {
		this[key] = handler;
	} else if (handler instanceof Array) {
		var fn = handler.shift();
		this[key] = function(e) { return ctx[fn].apply(ctx,handler.concat(e)); };
	} else {
		this[key] = function(e) { return ctx[handler](e); };
	};
	return this;
};

Imba.Tag.prototype.setId = function (id){
	if (id != null) {
		this.dom().id = id;
	};
	return this;
};

Imba.Tag.prototype.id = function (){
	return this.dom().id;
};

/*
	Adds a new attribute or changes the value of an existing attribute
	on the specified tag. If the value is null or false, the attribute
	will be removed.
	@return {self}
	*/

Imba.Tag.prototype.setAttribute = function (name,value){
	// should this not return self?
	var old = this.dom().getAttribute(name);
	
	if (old == value) {
		return value;
	} else if (value != null && value !== false) {
		return this.dom().setAttribute(name,value);
	} else {
		return this.dom().removeAttribute(name);
	};
};

Imba.Tag.prototype.setNestedAttr = function (ns,name,value){
	if (ns == 'css') {
		this.css(name,value);
	} else if (this[ns + 'SetAttribute']) {
		this[ns + 'SetAttribute'](name,value);
	} else {
		this.setAttributeNS(ns,name,value);
	};
	return this;
};

Imba.Tag.prototype.setAttributeNS = function (ns,name,value){
	var old = this.getAttributeNS(ns,name);
	
	if (old == value) {
		value;
	} else if (value != null && value !== false) {
		this.dom().setAttributeNS(ns,name,value);
	} else {
		this.dom().removeAttributeNS(ns,name);
	};
	
	return this;
};


/*
	removes an attribute from the specified tag
	*/

Imba.Tag.prototype.removeAttribute = function (name){
	return this.dom().removeAttribute(name);
};

/*
	returns the value of an attribute on the tag.
	If the given attribute does not exist, the value returned
	will either be null or "" (the empty string)
	*/

Imba.Tag.prototype.getAttribute = function (name){
	return this.dom().getAttribute(name);
};


Imba.Tag.prototype.getAttributeNS = function (ns,name){
	return this.dom().getAttributeNS(ns,name);
};

/*
	Override this to provide special wrapping etc.
	@return {self}
	*/

Imba.Tag.prototype.setContent = function (content,type){
	this.setChildren(content,type);
	return this;
};

/*
	Set the children of node. type param is optional,
	and should only be used by Imba when compiling tag trees. 
	@return {self}
	*/

Imba.Tag.prototype.setChildren = function (nodes,type){
	this._empty ? this.append(nodes) : this.empty().append(nodes);
	this._children = null;
	return this;
};

/*
	Set the template that will render the content of node.
	@return {self}
	*/

Imba.Tag.prototype.setTemplate = function (template){
	if (!this._template) {
		// override the basic
		if (this.render == Imba.Tag.prototype.render) {
			this.render = this.renderTemplate; // do setChildren(renderTemplate)
		};
		this.optimizeTagStructure();
	};
	
	this.template = this._template = template;
	return this;
};

Imba.Tag.prototype.template = function (){
	return null;
};

/*
	If no custom render-method is defined, and the node
	has a template, this method will be used to render
	@return {self}
	*/

Imba.Tag.prototype.renderTemplate = function (){
	var body = this.template();
	if (body != this) { this.setChildren(body) };
	return this;
};


/*
	@deprecated
	Remove specified child from current node.
	*/

Imba.Tag.prototype.remove = function (child){
	return this.removeChild(child);
};

/*
	Remove specified child from current node.
	@return {self}
	*/

Imba.Tag.prototype.removeChild = function (child){
	var par = this.dom();
	var el = (child instanceof Imba.Tag) ? child.dom() : child;
	
	if (el && el.parentNode == par) {
		par.removeChild(el);
		Imba.TagManager.remove(el._tag || el,this);
	};
	return this;
};


/*
	Append a single item (node or string) to the current node.
	If supplied item is a string it will automatically. This is used
	by Imba internally, but will practically never be used explicitly.
	@return {self}
	*/

Imba.Tag.prototype.appendChild = function (node){
	if ((typeof node=='string'||node instanceof String)) {
		this.dom().appendChild(Imba.document().createTextNode(node));
	} else if (node) {
		this.dom().appendChild(node._dom || node);
		Imba.TagManager.insert(node._tag || node,this);
		// FIXME ensure these are not called for text nodes
	};
	return this;
};

/*
	Insert a node into the current node (self), before another.
	The relative node must be a child of current node. 
	*/

Imba.Tag.prototype.insertBefore = function (node,rel){
	if ((typeof node=='string'||node instanceof String)) {
		node = Imba.document().createTextNode(node);
	};
	
	if (node && rel) {
		this.dom().insertBefore((node._dom || node),(rel._dom || rel));
		Imba.TagManager.insert(node._tag || node,this);
		// FIXME ensure these are not called for text nodes
	};
	return this;
};



/*
		The .append method inserts the specified content as the last child
		of the target node. If the content is already a child of node it
		will be moved to the end.
		
		    var root = <div.root>
		    var item = <div.item> "This is an item"
		    root.append item # appends item to the end of root

		    root.prepend "some text" # append text
		    root.prepend [<ul>,<ul>] # append array
		*/

Imba.Tag.prototype.append = function (item){
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
		// should delegate to self.appendChild
		this.appendChild(item);
		if (this._empty) { this._empty = false };
	};
	
	return this;
};

/*
		@deprecated
		*/

Imba.Tag.prototype.insert = function (node,pars){
	if(!pars||pars.constructor !== Object) pars = {};
	var before = pars.before !== undefined ? pars.before : null;
	var after = pars.after !== undefined ? pars.after : null;
	if (after) { before = after.next() };
	if (node instanceof Array) {
		node = (Imba.TAGS.FRAGMENT(this).setContent(node,0).end());
	};
	if (before) {
		this.insertBefore(node,before.dom());
	} else {
		this.appendChild(node);
	};
	return this;
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

Imba.Tag.prototype.prepend = function (item){
	var first = this._dom.childNodes[0];
	first ? this.insertBefore(item,first) : this.appendChild(item);
	return this;
};



/*
	Remove node from the dom tree
	@return {self}
	*/

Imba.Tag.prototype.orphanize = function (){
	var par;
	if (par = this.parent()) { par.removeChild(this) };
	return this;
};

/*
	Get text of node. Uses textContent behind the scenes (not innerText)
	[https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent]()
	@return {string} inner text of node
	*/

Imba.Tag.prototype.text = function (v){
	return this._dom.textContent;
};

/*
	Set text of node. Uses textContent behind the scenes (not innerText)
	[https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent]()
	*/

Imba.Tag.prototype.setText = function (txt){
	this._empty = false;
	this._dom.textContent = (txt == null) ? (txt = "") : txt;
	this;
	return this;
};


/*
	Method for getting and setting data-attributes. When called with zero
	arguments it will return the actual dataset for the tag.

		var node = <div data-name='hello'>
		# get the whole dataset
		node.dataset # {name: 'hello'}
		# get a single value
		node.dataset('name') # 'hello'
		# set a single value
		node.dataset('name','newname') # self


	*/

Imba.Tag.prototype.dataset = function (key,val){
	if (key instanceof Object) {
		for (var v, i = 0, keys = Object.keys(key), l = keys.length, k; i < l; i++){
			k = keys[i];v = key[k];this.dataset(k,v);
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
	Remove all content inside node
	*/

Imba.Tag.prototype.empty = function (){
	if (this._dom.firstChild) {
		while (this._dom.firstChild){
			this._dom.removeChild(this._dom.firstChild);
		};
		Imba.TagManager.remove(null,this);
	};
	
	this._children = null;
	this._empty = true;
	return this;
};

/*
	Empty placeholder. Override to implement custom render behaviour.
	Works much like the familiar render-method in React.
	@return {self}
	*/

Imba.Tag.prototype.render = function (){
	return this;
};

/*
	Called implicitly while tag is initializing. No initial props
	will have been set at this point.
	@return {self}
	*/

Imba.Tag.prototype.build = function (){
	return this;
};

/*
	Called once, implicitly through Imba.Tag#end. All initial props
	and children will have been set before setup is called.
	setContent.
	@return {self}
	*/

Imba.Tag.prototype.setup = function (){
	return this;
};

/*
	Called implicitly through Imba.Tag#end, for tags that are part of
	a tag tree (that are rendered several times).
	@return {self}
	*/

Imba.Tag.prototype.commit = function (){
	this.render();
	return this;
};

/*

	Called by the tag-scheduler (if this tag is scheduled)
	By default it will call this.render. Do not override unless
	you really understand it.

	*/

Imba.Tag.prototype.tick = function (){
	this.render();
	return this;
};

/*
	
	A very important method that you will practically never manually.
	The tag syntax of Imba compiles to a chain of setters, which always
	ends with .end. `<a.large>` compiles to `tag('a').flag('large').end()`
	
	You are highly adviced to not override its behaviour. The first time
	end is called it will mark the tag as initialized and call Imba.Tag#setup,
	and call Imba.Tag#commit every time.
	@return {self}
	*/

Imba.Tag.prototype.end = function (){
	return this;
};

/*
	This is called instead of Imba.Tag#end for `<self>` tag chains.
	Defaults to noop
	@return {self}
	*/

Imba.Tag.prototype.synced = function (){
	return this;
};

// called when the node is awakened in the dom - either automatically
// upon attachment to the dom-tree, or the first time imba needs the
// tag for a domnode that has been rendered on the server
Imba.Tag.prototype.awaken = function (){
	return this;
};



/*
	List of flags for this node. 
	*/

Imba.Tag.prototype.flags = function (){
	return this._dom.classList;
};

/*
	@deprecated
	*/

Imba.Tag.prototype.classes = function (){
	throw "Imba.Tag#classes is removed. Use Imba.Tag#flags";
};

/*
	Add speficied flag to current node.
	If a second argument is supplied, it will be coerced into a Boolean,
	and used to indicate whether we should remove the flag instead.
	@return {self}
	*/

Imba.Tag.prototype.flag = function (name,toggler){
	// it is most natural to treat a second undefined argument as a no-switch
	// so we need to check the arguments-length
	if (arguments.length == 2) {
		if (this._dom.classList.contains(name) != !!toggler) {
			this._dom.classList.toggle(name);
		};
	} else {
		// firefox will trigger a change if adding existing class
		if (!this._dom.classList.contains(name)) { this._dom.classList.add(name) };
	};
	return this;
};

/*
	Remove specified flag from node
	@return {self}
	*/

Imba.Tag.prototype.unflag = function (name){
	this._dom.classList.remove(name);
	return this;
};

/*
	Toggle specified flag on node
	@return {self}
	*/

Imba.Tag.prototype.toggleFlag = function (name){
	this._dom.classList.toggle(name);
	return this;
};

/*
	Check whether current node has specified flag
	@return {bool}
	*/

Imba.Tag.prototype.hasFlag = function (name){
	return this._dom.classList.contains(name);
};


/*
	Set/update a named flag. It remembers the previous
	value of the flag, and removes it before setting the new value.

		node.setFlag('type','todo')
		node.setFlag('type','project')
		# todo is removed, project is added.

	@return {self}
	*/

Imba.Tag.prototype.setFlag = function (name,value){
	this._namedFlags || (this._namedFlags = []);
	var prev = this._namedFlags[name];
	if (prev != value) {
		if (prev) { this.unflag(prev) };
		if (value) { this.flag(value) };
		this._namedFlags[name] = value;
	};
	return this;
};


/*
	Get the scheduler for this node. A new scheduler will be created
	if it does not already exist.

	@return {Imba.Scheduler}
	*/

Imba.Tag.prototype.scheduler = function (){
	return (this._scheduler == null) ? (this._scheduler = new Imba.Scheduler(this)) : this._scheduler;
};

/*

	Shorthand to start scheduling a node. The method will basically
	proxy the arguments through to scheduler.configure, and then
	activate the scheduler.
	
	@return {self}
	*/

Imba.Tag.prototype.schedule = function (options){
	if(options === undefined) options = {events: true};
	this.scheduler().configure(options).activate();
	return this;
};

/*
	Shorthand for deactivating scheduler (if tag has one).
	@deprecated
	*/

Imba.Tag.prototype.unschedule = function (){
	if (this._scheduler) { this.scheduler().deactivate() };
	return this;
};


/*
	Get the parent of current node
	@return {Imba.Tag} 
	*/

Imba.Tag.prototype.parent = function (){
	return tag$wrap(this.dom().parentNode);
};

/*
	Get the child at index
	*/

Imba.Tag.prototype.child = function (i){
	return tag$wrap(this.dom().children[i || 0]);
};


/*
	Get the children of node
	@return {Imba.Selector}
	*/

Imba.Tag.prototype.children = function (sel){
	// DEPRECATE this is overridden by reconciler
	var nodes = new Imba.Selector(null,this,this._dom.children);
	return sel ? nodes.filter(sel) : nodes;
};


/*
		Get the siblings of node
		@return {Imba.Selector}
		*/

Imba.Tag.prototype.siblings = function (sel){
	// DEPRECATE extract into imba-tag-helpers
	var self = this, par;
	if (!(par = self.parent())) { return [] }; // FIXME
	var ary = self.dom().parentNode.children;
	var nodes = new Imba.Selector(null,self,ary);
	return nodes.filter(function(n) { return n != self && (!sel || n.matches(sel)); });
};

/*
		Get node and its ascendents
		@return {Array}
		*/

Imba.Tag.prototype.path = function (sel){
	console.warn("Tag#path is deprecated");
	// DEPRECATE extract into imba-tag-helpers
	var node = this;
	var nodes = [];
	if (sel && sel.query) { sel = sel.query() };
	
	while (node){
		if (!sel || node.matches(sel)) { nodes.push(node) };
		node = node.parent();
	};
	return nodes;
};

/*
		Get ascendents of node
		@return {Array}
		*/

Imba.Tag.prototype.parents = function (sel){
	// DEPRECATE extract into imba-tag-helpers
	var par = this.parent();
	return par ? par.path(sel) : [];
};

/*
		Get the immediately following sibling of node.
		*/

Imba.Tag.prototype.next = function (sel){
	// DEPRECATE extract into imba-tag-helpers
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

Imba.Tag.prototype.prev = function (sel){
	// DEPRECATE extract into imba-tag-helpers
	if (sel) {
		var el = this;
		while (el = el.prev()){
			if (el.matches(sel)) { return el };
		};
		return null;
	};
	return tag$wrap(this.dom().previousElementSibling);
};

/*
		Get descendants of current node, optionally matching selector
		@return {Imba.Selector}
		*/

Imba.Tag.prototype.find = function (sel){
	// DEPRECATE extract into imba-tag-helpers
	return new Imba.Selector(sel,this);
};

/*
		Get the first matching child of node

		@return {Imba.Tag}
		*/

Imba.Tag.prototype.first = function (sel){
	// DEPRECATE extract into imba-tag-helpers
	return sel ? this.find(sel).first() : (tag$wrap(this.dom().firstElementChild));
};

/*
		Get the last matching child of node

			node.last # returns the last child of node
			node.last %span # returns the last span inside node
			node.last do |el| el.text == 'Hi' # return last node with text Hi

		@return {Imba.Tag}
		*/

Imba.Tag.prototype.last = function (sel){
	// DEPRECATE extract into imba-tag-helpers
	return sel ? this.find(sel).last() : (tag$wrap(this.dom().lastElementChild));
};


/*
	Check if this node matches a selector
	@return {Boolean}
	*/

Imba.Tag.prototype.matches = function (sel){
	var fn;
	if (sel instanceof Function) {
		return sel(this);
	};
	
	if (sel.query) { sel = sel.query() };
	if (fn = (this._dom.matches || this._dom.matchesSelector || this._dom.webkitMatchesSelector || this._dom.msMatchesSelector || this._dom.mozMatchesSelector)) {
		return fn.call(this._dom,sel);
	};
};

/*
	Get the first element matching supplied selector / filter
	traversing upwards, but including the node itself.
	@return {Imba.Tag}
	*/

Imba.Tag.prototype.closest = function (sel){
	// FIXME use native implementation if supported
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

Imba.Tag.prototype.up = function (sel){
	if (!sel) { return this.parent() };
	return this.parent() && this.parent().closest(sel);
};

/*
	Get the index of node.
	@return {Number}
	*/

Imba.Tag.prototype.index = function (){
	var i = 0;
	var el = this.dom();
	while (el.previousSibling){
		el = el.previousSibling;
		i++;
	};
	return i;
};

/*
	Check if node contains other node
	@return {Boolean} 
	*/

Imba.Tag.prototype.contains = function (node){
	return this.dom().contains(node && node._dom || node);
};


/*
	Shorthand for console.log on elements
	@return {self}
	*/

Imba.Tag.prototype.log = function (){
	var $0 = arguments, i = $0.length;
	var args = new Array(i>0 ? i : 0);
	while(i>0) args[i-1] = $0[--i];
	args.unshift(console);
	Function.prototype.call.apply(console.log,args);
	return this;
};

Imba.Tag.prototype.css = function (key,val){
	if (key instanceof Object) {
		for (var v, i = 0, keys = Object.keys(key), l = keys.length, k; i < l; i++){
			k = keys[i];v = key[k];this.css(k,v);
		};
		return this;
	};
	
	var name = Imba.CSSKeyMap[key] || key;
	
	if (val == null) {
		this.dom().style.removeProperty(name);
	} else if (val == undefined && arguments.length == 1) {
		return this.dom().style[name];
	} else {
		if ((typeof val=='number'||val instanceof Number) && name.match(/width|height|left|right|top|bottom/)) {
			this.dom().style[name] = val + "px";
		} else {
			this.dom().style[name] = val;
		};
	};
	return this;
};

Imba.Tag.prototype.trigger = function (event,data){
	if(data === undefined) data = {};
	
	return this;
	
};

Imba.Tag.prototype.emit = function (name,pars){
	if(!pars||pars.constructor !== Object) pars = {};
	var data = pars.data !== undefined ? pars.data : null;
	var bubble = pars.bubble !== undefined ? pars.bubble : true;
	console.warn('tag#emit is deprecated -> use tag#trigger');
	
	return this;
};

Imba.Tag.prototype.setTransform = function (value){
	this.css('transform',value);
	this;
	return this;
};

Imba.Tag.prototype.transform = function (){
	return this.css('transform');
};

Imba.Tag.prototype.setStyle = function (style){
	this.setAttribute('style',style);
	this;
	return this;
};

Imba.Tag.prototype.style = function (){
	return this.getAttribute('style');
};

/*
	Focus on current node
	@return {self}
	*/

Imba.Tag.prototype.focus = function (){
	this.dom().focus();
	return this;
};

/*
	Remove focus from current node
	@return {self}
	*/

Imba.Tag.prototype.blur = function (){
	this.dom().blur();
	return this;
};

Imba.Tag.prototype.toString = function (){
	return this.dom().outerHTML;
};


Imba.Tag.prototype.initialize = Imba.Tag;

Imba.HTML_TAGS = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");
Imba.HTML_TAGS_UNSAFE = "article aside header section".split(" ");
Imba.SVG_TAGS = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");


function extender(obj,sup){
	for (var v, i = 0, keys = Object.keys(sup), l = keys.length, k; i < l; i++){
		k = keys[i];v = sup[k];(obj[k] == null) ? (obj[k] = v) : obj[k];
	};
	
	obj.prototype = Object.create(sup.prototype);
	obj.__super__ = obj.prototype.__super__ = sup.prototype;
	obj.prototype.constructor = obj;
	if (sup.inherit) { sup.inherit(obj) };
	return obj;
};

function Tag(){
	return function(dom,ctx) {
		this.initialize(dom,ctx);
		return this;
	};
};

function TagSpawner(type){
	return function(zone) { return type.build(zone); };
};

Imba.Tags = function Tags(){
	this;
};

Imba.Tags.prototype.__clone = function (ns){
	var clone = Object.create(this);
	clone._parent = this;
	return clone;
};

Imba.Tags.prototype.ns = function (name){
	return this['_' + name.toUpperCase()] || this.defineNamespace(name);
};

Imba.Tags.prototype.defineNamespace = function (name){
	var clone = Object.create(this);
	clone._parent = this;
	clone._ns = name;
	this['_' + name.toUpperCase()] = clone;
	return clone;
};

Imba.Tags.prototype.baseType = function (name){
	return (idx$(name,Imba.HTML_TAGS) >= 0) ? 'element' : 'div';
};

Imba.Tags.prototype.defineTag = function (name,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	if (body && body._nodeType) {
		supr = body;
		body = null;
	};
	
	supr || (supr = this.baseType(name));
	
	var supertype = ((typeof supr=='string'||supr instanceof String)) ? this[supr] : supr;
	var tagtype = Tag();
	var norm = name.replace(/\-/g,'_');
	
	tagtype._name = name;
	tagtype._flagName = null;
	
	if (name[0] == '#') {
		this[name] = tagtype;
		Imba.SINGLETONS[name.slice(1)] = tagtype;
	} else if (name[0] == name[0].toUpperCase()) {
		tagtype._flagName = name;
		true;
	} else {
		tagtype._flagName = "_" + name.replace(/_/g,'-');
		this[name] = tagtype;
		this[norm.toUpperCase()] = TagSpawner(tagtype);
		// '$'+
	};
	
	
	extender(tagtype,supertype);
	
	if (body) {
		if (body.length == 2) {
			// create clone
			if (!tagtype.hasOwnProperty('TAGS')) {
				tagtype.TAGS = (supertype.TAGS || this).__clone();
			};
		};
		
		body.call(tagtype,tagtype,tagtype.TAGS || this);
		if (tagtype.defined) { tagtype.defined() };
		this.optimizeTag(tagtype);
	};
	return tagtype;
};

Imba.Tags.prototype.defineSingleton = function (name,supr,body){
	return this.defineTag(name,supr,body);
};

Imba.Tags.prototype.extendTag = function (name,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	var klass = (((typeof name=='string'||name instanceof String)) ? this[name] : name);
	// allow for private tags here as well?
	if (body) { body && body.call(klass,klass,klass.prototype) };
	if (klass.extended) { klass.extended() };
	this.optimizeTag(klass);
	return klass;
};

Imba.Tags.prototype.optimizeTag = function (tagtype){
	var prototype_;
	(prototype_ = tagtype.prototype) && prototype_.optimizeTagStructure  &&  prototype_.optimizeTagStructure();
	return this;
};


Imba.SINGLETONS = {};
Imba.TAGS = new Imba.Tags();
Imba.TAGS.element = Imba.TAGS.htmlelement = Imba.Tag;


var html = Imba.TAGS.defineNamespace('html');
var svg = Imba.TAGS.defineNamespace('svg');
Imba.TAGS = html; // make the html namespace the root

svg.baseType = function (name){
	return 'element';
};

Imba.defineTag = function (name,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	return Imba.TAGS.defineTag(name,supr,body);
};

Imba.defineSingletonTag = function (id,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = 'div';
	if(supr==undefined) supr = 'div';
	return Imba.TAGS.defineTag(this.name(),supr,body);
};

Imba.extendTag = function (name,body){
	return Imba.TAGS.extendTag(name,body);
};

Imba.getTagSingleton = function (id){
	var klass;
	var dom,node;
	
	if (klass = Imba.SINGLETONS[id]) {
		if (klass && klass.Instance) { return klass.Instance };
		
		// no instance - check for element
		if (dom = Imba.document().getElementById(id)) {
			// we have a live instance - when finding it through a selector we should awake it, no?
			// console.log('creating the singleton from existing node in dom?',id,type)
			node = klass.Instance = new klass(dom);
			node.awaken(dom); // should only awaken
			return node;
		};
		
		dom = klass.createNode();
		dom.id = id;
		node = klass.Instance = new klass(dom);
		node.end().awaken(dom);
		return node;
	} else if (dom = Imba.document().getElementById(id)) {
		return Imba.getTagForDom(dom);
	};
};

var svgSupport = typeof SVGElement !== 'undefined';

Imba.getTagForDom = function (dom){
	var m;
	if (!dom) { return null };
	if (dom._dom) { return dom }; // could use inheritance instead
	if (dom._tag) { return dom._tag };
	if (!dom.nodeName) { return null };
	
	var ns = null;
	var id = dom.id;
	var type = dom.nodeName.toLowerCase();
	var tags = Imba.TAGS;
	var native$ = type;
	var cls = dom.className;
	
	if (id && Imba.SINGLETONS[id]) {
		// FIXME control that it is the same singleton?
		// might collide -- not good?
		return Imba.getTagSingleton(id);
	};
	// look for id - singleton
	
	// need better test here
	if (svgSupport && (dom instanceof SVGElement)) {
		ns = "svg";
		cls = dom.className.baseVal;
		tags = tags._SVG;
	};
	
	var spawner;
	
	if (cls) {
		// there can be several matches here - should choose the last
		// should fall back to less specific later? - otherwise things may fail
		// TODO rework this
		var flags = cls.split(' ');
		var nr = flags.length;
		
		while (--nr >= 0){
			var flag = flags[nr];
			if (flag[0] == '_') {
				if (spawner = tags[flag.slice(1)]) {
					break;
				};
			};
		};
		
		// if var m = cls.match(/\b_([a-z\-]+)\b(?!\s*_[a-z\-]+)/)
		// 	type = m[1] # .replace(/-/g,'_')
		
		if (m = cls.match(/\b([A-Z\-]+)_\b/)) {
			ns = m[1];
		};
	};
	
	spawner || (spawner = tags[native$]);
	return spawner ? new spawner(dom).awaken(dom) : null;
};

// TODO drop these globals
var _T = Imba.TAGS;
// id$ = Imba:getTagSingleton
// tag$wrap = Imba:getTagForDom

Imba.generateCSSPrefixes = function (){
	var styles = window.getComputedStyle(document.documentElement,'');
	
	for (var i = 0, ary = iter$(styles), len = ary.length, prefixed; i < len; i++) {
		prefixed = ary[i];
		var unprefixed = prefixed.replace(/^-(webkit|ms|moz|o|blink)-/,'');
		var camelCase = unprefixed.replace(/-(\w)/g,function(m,a) { return a.toUpperCase(); });
		
		// if there exists an unprefixed version -- always use this
		if (prefixed != unprefixed) {
			if (styles.hasOwnProperty(unprefixed)) { continue; };
		};
		
		// register the prefixes
		Imba.CSSKeyMap[unprefixed] = Imba.CSSKeyMap[camelCase] = prefixed;
	};
	return;
};



Imba.Tag;
