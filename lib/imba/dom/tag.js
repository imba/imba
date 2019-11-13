function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = require("../imba");

// TODO Make parent a getter?

Imba.CSSKeyMap = {};

Imba.TAG_BUILT = 1;
Imba.TAG_SETUP = 2;
Imba.TAG_MOUNTING = 4;
Imba.TAG_MOUNTED = 8;
Imba.TAG_SCHEDULED = 16;
Imba.TAG_AWAKENED = 32;
Imba.TAG_MOUNTABLE = 64;
Imba.TAG_AUTOCLASS_GLOBALS = true;
Imba.TAG_AUTOCLASS_LOCALS = true;
Imba.TAG_AUTOCLASS_SVG = true;

/*
Get the current document
*/

if (false) {};

Imba.static = function (items,typ,nr){
	items.type = typ;
	items.static = nr;
	return items;
};

/*

*/

Imba.mount = function (node,into){
	into || (into = Imba.document.body);
	into.appendChild(node.dom);
	Imba.TagManager.insert(node,into);
	node.scheduler.configure({events: true}).activate(false);
	Imba.TagManager.refresh();
	return node;
};


Imba.createTextNode = function (node){
	if (node && node.nodeType == 3) {
		return node;
	};
	return Imba.document.createTextNode(node);
};



/*
This is the baseclass that all tags in imba inherit from.
@iname node
*/

Imba.Tag = function Tag(dom,parent){
	this.dom = dom;
	dom.tag = this;
	this.slot_ = dom;
	this.__tree_ = null; // TODO rename to tree_ again?
	this.__slots_ = [];
	this.__parent_ = parent;
	
	this.$ = TagCache.build(this);
	this.FLAGS = 0;
	this.build();
	this;
};

Imba.Tag.buildNode = function (){
	var dom = Imba.document.createElement(this.nodeType || 'div');
	// TODO rename @classes to something internal
	if (this.classes_) {
		var cls = this.classes_.join(" ");
		if (cls) { dom.className = cls };
	};
	return dom;
};

Imba.Tag.createNode = function (){
	var proto = (this.protoDom || (this.protoDom = this.buildNode()));
	return proto.cloneNode(false);
};

Imba.Tag.build = function (ctx){
	return new this(this.createNode(),ctx);
};

Imba.Tag.dom = function (){
	return this.protoDom || (this.protoDom = this.buildNode());
};

Imba.Tag.end = function (){
	return this.commit(0);
};

/*
	Called when a tag type is being subclassed.
	*/

Imba.Tag.inherit = function (child){
	child.protoDom = null;
	
	if (this.nodeType) {
		child.nodeType = this.nodeType;
		child.classes_ = this.classes_.slice(0);
		
		if (child.flagName) {
			return child.classes_.push(child.flagName);
		};
	} else {
		child.nodeType = child.tagName;
		child.flagName = null;
		return child.classes_ = [];
	};
};

/*
	Internal method called after a tag class has
	been declared or extended.
	
	@private
	*/

Imba.Tag.prototype.optimizeTagStructure = function (){
	if (!false) { return };
	var ctor = this.constructor;
	let keys = Object.keys(this);
	
	if (keys.indexOf('mount') >= 0) {
		if (ctor.classes_ && ctor.classes_.indexOf('__mount') == -1) {
			ctor.classes_.push('__mount');
		};
		
		if (ctor.protoDom) {
			ctor.protoDom.classList.add('__mount');
		};
	};
	
	for (let i = 0, items = iter$(keys), len = items.length, key; i < len; i++) {
		key = items[i];
		if ((/^on/).test(key)) { Imba.EventManager.bind(key.slice(2)) };
	};
	return this;
};


Object.defineProperty(Imba.Tag.prototype,'root',{get: function(){
	return this.__parent_ ? this.__parent_.root : this;
}, configurable: true});

/*
	Set the data object for node
	@return {self}
	*/

// def data= data
// 	@data = data
Imba.Tag.prototype.setData = function (data){
	this.data = data;
	return this;
};

/*
	Get the data object for node
	*/

// def data
// 	@data

Imba.Tag.prototype.bindData = function (target,path,args){
	return this.data = args ? target[path].apply(target,args) : target[path];
};

/*
	Set inner html of node
	@deprecated
	*/

Imba.Tag.prototype.setHtml = function (html){
	if (this.html != html) {
		this.dom.innerHTML = html;
	};
	return this;
};

/*
	Get inner html of node
	@deprecated
	*/

Imba.Tag.prototype.html = function (){
	return this.dom.innerHTML;
};

Imba.Tag.prototype.on$ = function (slot,handler,context){
	let handlers = this.on_ || (this.on_ = []);
	let prev = handlers[slot];
	// self-bound handlers
	if (slot < 0) {
		if (prev == undefined) {
			slot = handlers[slot] = handlers.length;
		} else {
			slot = prev;
		};
		prev = handlers[slot];
	};
	
	handlers[slot] = handler;
	if (prev) {
		handler.state = prev.state;
	} else {
		handler.state = {context: context};
		if (false) {};
	};
	return this;
};
/*
	Adds a new attribute or changes the value of an existing attribute
	on the specified tag. If the value is null or false, the attribute
	will be removed.
	@return {self}
	*/

Imba.Tag.prototype.setAttribute = function (name,value){
	var old = this.dom.getAttribute(name);
	
	if (old == value) {
		value;
	} else if (value != null && value !== false) {
		this.dom.setAttribute(name,value);
	} else {
		this.dom.removeAttribute(name);
	};
	return this;
};

Imba.Tag.prototype.setNestedAttr = function (ns,name,value,modifiers){
	if (this[ns + 'SetAttribute']) {
		this[ns + 'SetAttribute'](name,value,modifiers);
	} else {
		this.setAttributeNS(ns,name,value);
	};
	return this;
};

Imba.Tag.prototype.setAttributeNS = function (ns,name,value){
	var old = this.getAttributeNS(ns,name);
	
	if (old != value) {
		if (value != null && value !== false) {
			this.dom.setAttributeNS(ns,name,value);
		} else {
			this.dom.removeAttributeNS(ns,name);
		};
	};
	return this;
};


/*
	removes an attribute from the specified tag
	*/

Imba.Tag.prototype.removeAttribute = function (name){
	return this.dom.removeAttribute(name);
};

/*
	returns the value of an attribute on the tag.
	If the given attribute does not exist, the value returned
	will either be null or "" (the empty string)
	*/

Imba.Tag.prototype.getAttribute = function (name){
	return this.dom.getAttribute(name);
};

Imba.Tag.prototype.getAttributeNS = function (ns,name){
	return this.dom.getAttributeNS(ns,name);
};


Imba.Tag.prototype.set = function (key,value,mods){
	// should somehow cache the setter lookup
	// so that we don't need to do it multiple times
	let cachedSetter = this.$[key];
	
	if (cachedSetter instanceof Function) {
		cachedSetter.call(this,value,mods);
		return this;
	} else if (cachedSetter) {
		this.dom[key] = value;
		return this;
	};
	
	let descriptor = Imba.getPropertyDescriptor(this,key);
	
	if (descriptor && descriptor.set) {
		this.$[key] = descriptor.set;
		descriptor.set.call(this,value,mods);
	} else {
		this.$[key] = true;
		let setter = Imba.toSetter(key);
		if (this[setter] instanceof Function) {
			this[setter](value,mods);
		} else {
			this.dom[key] = value;
		};
	};
	return this;
};

// TODO should be more in line with the regular setter -- for sure
Imba.Tag.prototype.get = function (key){
	return this.dom.getAttribute(key);
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
	// overridden on client by reconciler
	this.__tree_ = nodes;
	return this;
};

/*
	Set the template that will render the content of node.
	@return {self}
	*/

Imba.Tag.prototype.setTemplate = function (template){
	if (!this.__template) {
		if (this.render == Imba.Tag.prototype.render) {
			this.render = this.renderTemplate;
		};
	};
	
	this.template = this.__template = template;
	return this;
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
	Remove specified child from current node.
	@return {self}
	*/

Imba.Tag.prototype.removeChild = function (child){
	var par = this.dom;
	var el = child.slot_ || child;
	if (el && el.parentNode == par) {
		Imba.TagManager.remove(el.tag || el,this);
		par.removeChild(el);
	};
	return this;
};

/*
	Remove all content inside node
	*/

Imba.Tag.prototype.removeAllChildren = function (){
	if (this.dom.firstChild) {
		var el;
		while (el = this.dom.firstChild){
			false && Imba.TagManager.remove(el.tag || el,this);
			this.dom.removeChild(el);
		};
	};
	this.__tree_ = this.__text_ = null;
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
		this.dom.appendChild(Imba.document.createTextNode(node));
	} else if (node) {
		this.dom.appendChild(node.slot_ || node);
		Imba.TagManager.insert(node.tag || node,this);
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
		node = Imba.document.createTextNode(node);
	};
	
	if (node && rel) {
		this.dom.insertBefore((node.slot_ || node),(rel.slot_ || rel));
		Imba.TagManager.insert(node.tag || node,this);
		// FIXME ensure these are not called for text nodes
	};
	return this;
};

Imba.Tag.prototype.detachFromParent = function (){
	var placeholder__, tag_;
	if (this.slot_ == this.dom) {
		this.slot_ = ((placeholder__ = this.dom.placeholder_) || (this.dom.placeholder_ = Imba.document.createComment("node")));
		(tag_ = this.slot_.tag) || (this.slot_.tag = this);
		
		if (this.dom.parentNode) {
			Imba.TagManager.remove(this,this.dom.parentNode);
			this.dom.parentNode.replaceChild(this.slot_,this.dom);
		};
	};
	return this;
};

Imba.Tag.prototype.attachToParent = function (){
	if (this.slot_ != this.dom) {
		let prev = this.slot_;
		this.slot_ = this.dom;
		if (prev && prev.parentNode) {
			Imba.TagManager.insert(this);
			prev.parentNode.replaceChild(this.dom,prev);
		};
	};
	return this;
};

/*
	Remove node from the dom tree
	@return {self}
	*/

Imba.Tag.prototype.orphanize = function (){
	var par;
	if (par = this.parent) { par.removeChild(this) };
	return this;
};

/*
	Get text of node. Uses textContent behind the scenes (not innerText)
	[https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent]()
	@return {string} inner text of node
	*/

Object.defineProperty(Imba.Tag.prototype,'text',{get: function(v){
	return this.dom.textContent;
}, configurable: true});

/*
	Set text of node. Uses textContent behind the scenes (not innerText)
	[https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent]()
	*/

// set text txt
// 	# TODO fix get/set combined into a single thing
// 	#tree_ = txt
// 	@dom.textContent = (txt == null or text === false) ? '' : txt
// 	self

Imba.Tag.prototype.setText = function (txt){
	this.text = txt;
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
		for (let v, i = 0, keys = Object.keys(key), l = keys.length, k; i < l; i++){
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
	
	var dataset = this.dom.dataset;
	
	if (!dataset) {
		dataset = {};
		for (let i = 0, items = iter$(this.dom.attributes), len = items.length, atr; i < len; i++) {
			atr = items[i];
			if (atr.name.substr(0,5) == 'data-') {
				dataset[Imba.toCamelCase(atr.name.slice(5))] = atr.value;
			};
		};
	};
	
	return dataset;
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
	if (this.beforeRender() !== false) { this.render() };
	return this;
};

Imba.Tag.prototype.beforeRender = function (){
	return this;
};

/*

	Called by the tag-scheduler (if this tag is scheduled)
	By default it will call this.render. Do not override unless
	you really understand it.

	*/

Imba.Tag.prototype.tick = function (){
	if (this.beforeRender() !== false) { this.render() };
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
	this.setup();
	this.commit(0);
	this.end = Imba.Tag.end;
	return this;
};

// called on <self> to check if self is called from other places
Imba.Tag.prototype.$open = function (context){
	if (context != this.__context_) {
		this.__tree_ = null;
		this.__context_ = context;
	};
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

Object.defineProperty(Imba.Tag.prototype,'flags',{get: function(){
	return this.dom.classList;
}, configurable: true});

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
		if (this.dom.classList.contains(name) != !!toggler) {
			this.dom.classList.toggle(name);
		};
	} else {
		// firefox will trigger a change if adding existing class
		if (!this.dom.classList.contains(name)) { this.dom.classList.add(name) };
	};
	return this;
};

/*
	Remove specified flag from node
	@return {self}
	*/

Imba.Tag.prototype.unflag = function (name){
	this.dom.classList.remove(name);
	return this;
};

/*
	Toggle specified flag on node
	@return {self}
	*/

Imba.Tag.prototype.toggleFlag = function (name){
	this.dom.classList.toggle(name);
	return this;
};

/*
	Check whether current node has specified flag
	@return {bool}
	*/

Imba.Tag.prototype.hasFlag = function (name){
	return this.dom.classList.contains(name);
};

// TODO optimize
Imba.Tag.prototype.flagIf = function (flag,bool){
	this.dom.classList.toggle(flag,bool);
	return this;
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
	let flags = this.__namedFlags_ || (this.__namedFlags_ = {});
	let prev = flags[name];
	if (prev != value) {
		if (prev) { this.unflag(prev) };
		if (value) { this.flag(value) };
		flags[name] = value;
	};
	return this;
};


/*
	Get the scheduler for this node. A new scheduler will be created
	if it does not already exist.

	@return {Imba.Scheduler}
	*/

Object.defineProperty(Imba.Tag.prototype,'scheduler',{get: function(){
	return (this.__scheduler == null) ? (this.__scheduler = new Imba.Scheduler(this)) : this.__scheduler;
}, configurable: true});

/*

	Shorthand to start scheduling a node. The method will basically
	proxy the arguments through to scheduler.configure, and then
	activate the scheduler.
	
	@return {self}
	*/

Imba.Tag.prototype.schedule = function (options){
	if(options === undefined) options = {events: true};
	this.scheduler.configure(options).activate();
	return this;
};

/*
	Shorthand for deactivating scheduler (if tag has one).
	@deprecated
	*/

Imba.Tag.prototype.unschedule = function (){
	if (this.__scheduler) { this.scheduler.deactivate() };
	return this;
};


/*
	Get the parent of current node
	@return {Imba.Tag} 
	*/

Object.defineProperty(Imba.Tag.prototype,'parent',{get: function(){
	return Imba.getTagForDom(this.dom.parentNode);
}, configurable: true});

/*
	Get the children of node
	@return {Imba.Tag[]}
	*/

Imba.Tag.prototype.children = function (sel){
	let res = [];
	for (let i = 0, items = iter$(this.dom.children), len = items.length, item; i < len; i++) {
		item = items[i];
		res.push(item.tag || Imba.getTagForDom(item));
	};
	return res;
};

Imba.Tag.prototype.querySelector = function (q){
	return Imba.getTagForDom(this.dom.querySelector(q));
};

Imba.Tag.prototype.querySelectorAll = function (q){
	var items = [];
	for (let i = 0, ary = iter$(this.dom.querySelectorAll(q)), len = ary.length; i < len; i++) {
		items.push(Imba.getTagForDom(ary[i]));
	};
	return items;
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
	
	if (sel.query instanceof Function) { sel = sel.query() }; // FIXME when is this relevant?
	if (fn = (this.dom.matches || this.dom.matchesSelector || this.dom.webkitMatchesSelector || this.dom.msMatchesSelector || this.dom.mozMatchesSelector)) {
		return fn.call(this.dom,sel);
	};
};

/*
	Get the first element matching supplied selector / filter
	traversing upwards, but including the node itself.
	@return {Imba.Tag}
	*/

Imba.Tag.prototype.closest = function (sel){
	return Imba.getTagForDom(this.dom.closest(sel));
};

/*
	Check if node contains other node
	@return {Boolean} 
	*/

Imba.Tag.prototype.contains = function (node){
	return this.dom.contains(node.dom || node);
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

Imba.Tag.prototype.css = function (key,val,mod){
	if (key instanceof Object) {
		for (let v, i = 0, keys = Object.keys(key), l = keys.length, k; i < l; i++){
			k = keys[i];v = key[k];this.css(k,v);
		};
		return this;
	};
	
	var name = Imba.CSSKeyMap[key] || key;
	
	if (val == null) {
		this.dom.style.removeProperty(name);
	} else if (val == undefined && arguments.length == 1) {
		return this.dom.style[name];
	} else if (name.match(/^--/)) {
		this.dom.style.setProperty(name,val);
	} else {
		// TODO remove for v2
		if ((typeof val=='number'||val instanceof Number) && (name.match(/width|height|left|right|top|bottom/) || (mod && mod.px))) {
			this.dom.style[name] = val + "px";
		} else {
			this.dom.style[name] = val;
		};
	};
	return this;
};

Imba.Tag.prototype.setStyle = function (style){
	return this.setAttribute('style',style);
};

Imba.Tag.prototype.style = function (){
	return this.getAttribute('style');
};

/*
	Trigger an event from current node. Dispatched through the Imba event manager.
	To dispatch actual dom events, use dom.dispatchEvent instead.

	@return {Imba.Event}
	*/

Imba.Tag.prototype.trigger = function (name,data){
	if(data === undefined) data = {};
	return false ? true : null;
};

/*
	Focus on current node
	@return {self}
	*/

Imba.Tag.prototype.focus = function (){
	this.dom.focus();
	return this;
};

/*
	Remove focus from current node
	@return {self}
	*/

Imba.Tag.prototype.blur = function (){
	this.dom.blur();
	return this;
};

Imba.Tag.prototype.toString = function (){
	return this.dom.outerHTML;
};

Object.defineProperty(Imba.Tag.prototype,'outerHTML',{get: function(){
	return this.dom.outerHTML;
}, configurable: true});

Object.defineProperty(Imba.Tag.prototype,'innerHTML',{get: function(){
	return this.dom.innerHTML;
}, configurable: true});

Imba.Tag.prototype.render_ = function (item,index){
	if (false) {} else {
		console.log("render",item,index);
		return this.__slots_[index] = item;
	};
};


Imba.Tag.prototype.initialize = Imba.Tag;

Imba.SVGTag = function SVGTag(){ return Imba.Tag.apply(this,arguments) };

Imba.subclass(Imba.SVGTag,Imba.Tag);
Imba.SVGTag.namespaceURI = function (){
	return "http://www.w3.org/2000/svg";
};

Imba.SVGTag.buildNode = function (){
	var dom = Imba.document.createElementNS(this.namespaceURI(),this.nodeType);
	if (this.classes_) {
		var cls = this.classes_.join(" ");
		if (cls) { dom.className.baseVal = cls };
	};
	return dom;
};

Imba.SVGTag.inherit = function (child){
	child.protoDom = null;
	
	if (this == Imba.SVGTag) {
		child.nodeType = child.tagName;
		return child.classes_ = [];
	} else {
		child.nodeType = this.nodeType;
		var classes = (this.classes_ || []).slice(0);
		if (Imba.TAG_AUTOCLASS_SVG && child.flagName) {
			classes.push(child.flagName);
		};
		return child.classes_ = classes;
	};
};


Imba.HTML_TAGS = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");
Imba.HTML_TAGS_UNSAFE = "article aside header section".split(" ");

Imba.HTML_ATTRS = {
	a: "href target hreflang media download rel type ping referrerpolicy",
	audio: "autoplay controls crossorigin loop muted preload src",
	area: "alt coords download href hreflang ping referrerpolicy rel shape target",
	base: "href target",
	video: "autoplay buffered controls crossorigin height loop muted preload poster src width playsinline",
	fieldset: "disabled form name",
	form: "method action enctype autocomplete target",
	button: "autofocus type form formaction formenctype formmethod formnovalidate formtarget value name",
	embed: "height src type width",
	input: "accept disabled form list max maxlength min minlength pattern required size step type",
	label: "accesskey for form",
	img: "alt src srcset crossorigin decoding height importance intrinsicsize ismap referrerpolicy sizes width usemap",
	link: "rel type href media",
	iframe: "allow allowfullscreen allowpaymentrequest height importance name referrerpolicy sandbox src srcdoc width frameborder align longdesc scrolling",
	meta: "property content charset desc http-equiv color-scheme name scheme",
	map: "name",
	optgroup: "label",
	option: "label",
	output: "for form",
	object: "type data width height",
	param: "name type value valuetype",
	progress: "max",
	script: "src type async defer crossorigin integrity nonce language nomodule",
	select: "size form multiple",
	source: "sizes src srcset type media",
	textarea: "rows cols minlength maxlength form wrap",
	track: "default kind label src srclang",
	td: "colspan rowspan headers",
	th: "colspan rowspan"
};


Imba.HTML_PROPS = {
	input: "autofocus autocomplete autocapitalize autocorrect value placeholder required disabled multiple checked readOnly spellcheck",
	textarea: "autofocus autocomplete autocapitalize autocorrect value placeholder required disabled multiple checked readOnly spellcheck",
	form: "novalidate",
	fieldset: "disabled",
	button: "disabled",
	select: "autofocus disabled required readOnly multiple",
	option: "disabled selected value",
	optgroup: "disabled",
	progress: "value",
	fieldset: "disabled",
	canvas: "width height"
};

var extender = function(obj,sup) {
	for (let v, i = 0, keys = Object.keys(sup), l = keys.length, k; i < l; i++){
		k = keys[i];v = sup[k];(obj[k] == null) ? (obj[k] = v) : obj[k];
	};
	
	obj.prototype = Object.create(sup.prototype);
	obj.__super__ = obj.prototype.__super__ = sup.prototype;
	obj.prototype.constructor = obj;
	if (sup.inherit) { sup.inherit(obj) };
	// if sup.inherit
	// 	console.log("inheriting now",sup,obj)
	return obj;
};



function Tag(){
	return function(dom,ctx) {
		this.initialize(dom,ctx);
		return this;
	};
};

Imba.Tags = function Tags(){
	this;
};

Imba.Tags.prototype.__clone = function (ns){
	var clone = Object.create(this);
	clone.parent = this;
	return clone;
};

Imba.Tags.prototype.ns = function (name){
	return this['_' + name.toUpperCase()] || this.defineNamespace(name);
};

Imba.Tags.prototype.defineNamespace = function (name){
	var clone = Object.create(this);
	clone.parent = this;
	clone.ns = name;
	this['_' + name.toUpperCase()] = clone;
	return clone;
};

Imba.Tags.prototype.baseType = function (name,ns){
	return (Imba.indexOf(name,Imba.HTML_TAGS) >= 0) ? 'element' : 'div';
};

Imba.Tags.prototype.defineTag = function (o,fullName,supr,body){
	var classes__;
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	if (body && body.nodeType) {
		supr = body;
		body = null;
	};
	
	if (this[fullName]) {
		console.log("tag already exists?",fullName);
	};
	
	// if it is namespaced
	var ns;
	var name = fullName;
	let nsidx = name.indexOf(':');
	if (nsidx >= 0) {
		ns = fullName.substr(0,nsidx);
		name = fullName.substr(nsidx + 1);
		if (ns == 'svg' && !supr) {
			supr = 'svg:element';
		};
	};
	
	supr || (supr = this.baseType(fullName));
	
	let supertype = ((typeof supr=='string'||supr instanceof String)) ? this.findTagType(supr) : supr;
	let tagtype = Tag();
	
	tagtype.tagName = name;
	tagtype.flagName = null;
	
	if (name[0] == '#') {
		Imba.SINGLETONS[name.slice(1)] = tagtype;
		this[name] = tagtype;
	} else if (name[0] == name[0].toUpperCase()) {
		if (Imba.TAG_AUTOCLASS_LOCALS) {
			tagtype.flagName = name;
		};
	} else {
		if (Imba.TAG_AUTOCLASS_GLOBALS) {
			tagtype.flagName = "_" + fullName.replace(/[_\:]/g,'-');
		};
		this[fullName] = tagtype;
	};
	
	extender(tagtype,supertype);
	
	if ((o && o.scope && o.scope.flags)) {
		(classes__ = tagtype.classes_).push.apply(classes__,o.scope.flags);
	};
	
	if (body) {
		body.call(tagtype,tagtype,tagtype.TAGS || this);
		if (tagtype.defined) { tagtype.defined() };
		this.optimizeTag(tagtype);
	};
	return tagtype;
};

Imba.Tags.prototype.extendTag = function (o,name,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	var klass = (((typeof name=='string'||name instanceof String)) ? this.findTagType(name) : name);
	// allow for private tags here as well?
	if (body) { body && body.call(klass,klass,klass.prototype) };
	if (klass.extended) { klass.extended() };
	this.optimizeTag(klass);
	return klass;
};

Imba.Tags.prototype.optimizeTag = function (tagtype){
	var prototype_;
	return (prototype_ = tagtype.prototype) && prototype_.optimizeTagStructure  &&  prototype_.optimizeTagStructure();
};

Imba.Tags.prototype.findTagType = function (type){
	let klass = this[type];
	if (!klass) {
		if (type.substr(0,4) == 'svg:') {
			klass = this.defineTag(null,type,'svg:element');
		} else if (Imba.HTML_TAGS.indexOf(type) >= 0) {
			klass = this.defineTag(null,type,'element');
			
			// if let attrs = Imba.HTML_ATTRS[type]
			// 	for name in attrs.split(" ")
			// 		Imba.attr(klass,name)
			
			// if let props = Imba.HTML_PROPS[type]
			// 	for name in props.split(" ")
			// 		Imba.attr(klass,name,dom: yes)
		};
	};
	
	return klass;
};

Imba.createElement = function (name,parent,index,flags){
	var type = name;
	console.log("create element!!",name);
	
	if (name instanceof Function) {
		type = name;
	} else {
		
		type = Imba.TAGS.findTagType(name);
		if (null) {};
	};
	
	var node = type.build(parent);
	
	if (flags) {
		node.dom.className = flags;
	};
	
	// immediately add to parent
	if (parent && index != null) {
		parent.render_(node,index);
	};
	
	
	return node;
};

Imba.createElementFactory = function (ns){
	if (!ns) { return Imba.createElement };
	
	return function(name,ctx,ref,pref) {
		var node = Imba.createElement(name,ctx,ref,pref);
		node.dom.classList.add('_' + ns);
		return node;
	};
};

Imba.createTagScope = function (ns){
	return new TagScope(ns);
};

Imba.createTagCache = function (owner){
	var item = [];
	item.tag = owner;
	return item;
};

Imba.createTagMap = function (ctx,ref,pref){
	var par = ((pref != undefined) ? pref : ((ctx && ctx.tag)));
	var node = new TagFragmentLoop(ctx,ref,par);
	ctx[ref] = node;
	return node;
};

Imba.createTagFragment = function (){
	return new TagFragmentLoop();
};

Imba.createTagList = function (ctx,ref,pref){
	var node = [];
	node.type = 4;
	node.tag = ((pref != undefined) ? pref : ctx.tag);
	ctx[ref] = node;
	return node;
};

Imba.createTagLoopResult = function (ctx,ref,pref){
	var node = [];
	node.type = 5;
	node.cache = {i$: 0};
	return node;
};

// use array instead?
function TagCache(owner){
	this.tag = owner;
	this;
};
TagCache.build = function (owner){
	var item = [];
	item.tag = owner;
	return item;
};

// Cleanup?


function TagFragmentLoop(owner,key,par){
	this.cache = owner;
	this.key = key;
	this.parent = par;
	this.array = [];
	this.prev = [];
	this.index = 0;
	this.taglen = 0;
	this.map = {};
};

exports.TagFragmentLoop = TagFragmentLoop; // export class 
TagFragmentLoop.prototype.reset = function (){
	this.index = 0;
	var curr = this.array;
	this.array = this.prev;
	this.prev = curr;
	this.prev.taglen = this.taglen;
	this.index = 0;
	
	return this;
};

TagFragmentLoop.prototype.$iter = function (){
	return this.reset();
};

TagFragmentLoop.prototype.prune = function (items){
	return this;
};

TagFragmentLoop.prototype.push = function (item){
	let prev = this.prev[this.index];
	this.array[this.index] = item;
	this.index++;
	return;
};

Object.defineProperty(TagFragmentLoop.prototype,'length',{get: function(){
	return this.taglen;
}, configurable: true});

function TagMap(cache,ref,par){
	this.cache$ = cache;
	this.key$ = ref;
	this.par$ = par;
	this.i$ = 0;
};

TagMap.prototype.$iter = function (){
	var item = [];
	item.type = 5;
	item.cache = this;
	return item;
};

TagMap.prototype.$prune = function (items){
	let cache = this.cache$;
	let key = this.key$;
	let clone = new TagMap(cache,key,this.par$);
	for (let i = 0, ary = iter$(items), len = ary.length, item; i < len; i++) {
		item = ary[i];
		clone[item.key$] = item;
	};
	clone.i$ = items.length;
	return cache[key] = clone;
};

function TagScope(ns){
	this.ns = ns;
	this.flags = ns ? ['_' + ns] : [];
};

TagScope.prototype.defineTag = function (name,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	return Imba.TAGS.defineTag({scope: this},name,supr,body);
};

TagScope.prototype.extendTag = function (name,body){
	return Imba.TAGS.extendTag({scope: this},name,body);
};

Imba.TagMap = TagMap;
Imba.TagCache = TagCache;
Imba.SINGLETONS = {};
Imba.TAGS = new Imba.Tags();
Imba.TAGS.element = Imba.TAGS.htmlelement = Imba.Tag;
Imba.TAGS['svg:element'] = Imba.SVGTag;

Imba.attr(Imba.Tag,'is');

Imba.defineTag = function (name,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	return Imba.TAGS.defineTag({},name,supr,body);
};

Imba.extendTag = function (name,body){
	return Imba.TAGS.extendTag({},name,body);
};

Imba.getTagSingleton = function (id){
	var klass;
	var dom,node;
	
	if (klass = Imba.SINGLETONS[id]) {
		if (klass && klass.Instance) { return klass.Instance };
		
		// no instance - check for element
		if (dom = Imba.document.getElementById(id)) {
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
	} else if (dom = Imba.document.getElementById(id)) {
		return Imba.getTagForDom(dom);
	};
};

var svgSupport = typeof SVGElement !== 'undefined';

// shuold be phased out
Imba.getTagForDom = function (dom){
	if (!dom) { return null };
	if (dom.dom) { return dom };
	if (dom.tag) { return dom.tag };
	if (!dom.nodeName) { return null };
	
	var name = dom.nodeName.toLowerCase();
	var type = name;
	var ns = Imba.TAGS;
	
	// TODO remove SINGLETONS as a concept from v2
	if (dom.id && Imba.SINGLETONS[dom.id]) {
		return Imba.getTagSingleton(dom.id);
	};
	
	if (svgSupport && (dom instanceof SVGElement)) {
		type = ns.findTagType("svg:" + name);
	} else if (Imba.HTML_TAGS.indexOf(name) >= 0) {
		type = ns.findTagType(name);
	} else {
		type = Imba.Tag;
	};
	
	return new type(dom,null).awaken(dom);
};


if (false && false && document) {
	var styles = window.getComputedStyle(document.documentElement,'');
	
	for (let i = 0, items = iter$(styles), len = items.length, prefixed; i < len; i++) {
		prefixed = items[i];
		var unprefixed = prefixed.replace(/^-(webkit|ms|moz|o|blink)-/,'');
		var camelCase = unprefixed.replace(/-(\w)/g,function(m,a) { return a.toUpperCase(); });
		
		// if there exists an unprefixed version -- always use this
		if (prefixed != unprefixed) {
			if (styles.hasOwnProperty(unprefixed)) { continue; };
		};
		
		// register the prefixes
		Imba.CSSKeyMap[unprefixed] = Imba.CSSKeyMap[camelCase] = prefixed;
	};
	
	// Ovverride classList
	// TODO should not add this?
	if (!document.documentElement.classList) {
		Imba.createTagScope(/*SCOPEID*/).extendTag('element', function(tag){
			
			tag.prototype.hasFlag = function (ref){
				return new RegExp('(^|\\s)' + ref + '(\\s|$)').test(this.dom.className);
			};
			
			tag.prototype.addFlag = function (ref){
				if (this.hasFlag(ref)) { return this };
				this.dom.className = this.dom.className + (this.dom.className ? ' ' : '') + ref;
				return this;
			};
			
			tag.prototype.unflag = function (ref){
				if (!this.hasFlag(ref)) { return this };
				var regex = new RegExp('(^|\\s)*' + ref + '(\\s|$)*','g');
				this.dom.className = this.dom.className.replace(regex,'');
				return this;
			};
			
			tag.prototype.toggleFlag = function (ref){
				return this.hasFlag(ref) ? this.unflag(ref) : this.flag(ref);
			};
			
			tag.prototype.flag = function (ref,bool){
				if (arguments.length == 2 && !!bool === false) {
					return this.unflag(ref);
				};
				return this.addFlag(ref);
			};
		});
	};
};

Imba.Tag;
