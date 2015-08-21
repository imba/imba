(function(){
	function idx$(a,b){
		return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
	};
	
	// helper for subclassing
	function subclass$(obj,sup) {
		for (var k in sup) {
			if (sup.hasOwnProperty(k)) obj[k] = sup[k];
		};
		// obj.__super__ = sup;
		obj.prototype = Object.create(sup.prototype);
		obj.__super__ = obj.prototype.__super__ = sup.prototype;
		obj.prototype.initialize = obj.prototype.constructor = obj;
	};
	
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	
	var svgSupport = typeof SVGElement !== 'undefined';
	
	Imba.document = function (){
		return window.document;
	};
	
	Imba.static = function (items,nr){
		items.static = nr;
		return items;
	};
	
	
	function ElementTag(dom){
		this.setDom(dom);
		this;
	};
	
	global.ElementTag = ElementTag; // global class 
	
	ElementTag.prototype.__object = {name: 'object'};
	ElementTag.prototype.object = function(v){ return this._object; }
	ElementTag.prototype.setObject = function(v){ this._object = v; return this; };
	
	ElementTag.prototype.dom = function (){
		return this._dom;
	};
	
	ElementTag.prototype.setDom = function (dom){
		dom._tag = this;
		this._dom = dom;
		return this;
	};
	
	ElementTag.prototype.setRef = function (ref){
		this.flag(this._ref = ref);
		return this;
	};
	
	ElementTag.prototype.setHandler = function (event,handler,ctx){
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
	
	ElementTag.prototype.setId = function (id){
		this.dom().id = id;
		return this;
	};
	
	ElementTag.prototype.id = function (){
		return this.dom().id;
	};
	
	ElementTag.prototype.setAttribute = function (key,new$){
		var old = this.dom().getAttribute(key);
		
		if (old == new$) {
			return new$;
		} else if (new$ != null && new$ !== false) {
			return this.dom().setAttribute(key,new$);
		} else {
			return this.dom().removeAttribute(key);
		};
	};
	
	ElementTag.prototype.removeAttribute = function (key){
		return this.dom().removeAttribute(key);
	};
	
	ElementTag.prototype.getAttribute = function (key){
		return this.dom().getAttribute(key);
	};
	
	ElementTag.prototype.setContent = function (content){
		this.setChildren(content); // override?
		return this;
	};
	
	ElementTag.prototype.setChildren = function (nodes){
		this._empty ? (this.append(nodes)) : (this.empty().append(nodes));
		this._children = null;
		return this;
	};
	
	ElementTag.prototype.text = function (v){
		if (arguments.length) { return ((this.setText(v),v),this) };
		return this._dom.textContent;
	};
	
	ElementTag.prototype.setText = function (txt){
		this._empty = false;
		this._dom.textContent = txt == null ? (txt = "") : (txt);
		return this;
	};
	
	ElementTag.prototype.empty = function (){
		while (this._dom.firstChild){
			this._dom.removeChild(this._dom.firstChild);
		};
		this._children = null;
		this._empty = true;
		return this;
	};
	
	ElementTag.prototype.remove = function (node){
		var par = this.dom();
		var el = node && node.dom();
		if (el && el.parentNode == par) { par.removeChild(el) };
		return this;
	};
	
	ElementTag.prototype.parent = function (){
		return tag$wrap(this.dom().parentNode);
	};
	
	
	ElementTag.prototype.log = function (){
		var $0 = arguments, i = $0.length;
		var args = new Array(i>0 ? i : 0);
		while(i>0) args[i-1] = $0[--i];
		args.unshift(console);
		Function.prototype.call.apply(console.log,args);
		return this;
	};
	
	ElementTag.prototype.emit = function (name,pars){
		if(!pars||pars.constructor !== Object) pars = {};
		var data = pars.data !== undefined ? pars.data : null;
		var bubble = pars.bubble !== undefined ? pars.bubble : true;
		Imba.Events.trigger(name,this,{data: data,bubble: bubble});
		return this;
	};
	
	ElementTag.prototype.css = function (key,val){
		if (key instanceof Object) {
			for (var i=0, keys=Object.keys(key), l=keys.length; i < l; i++){
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
	
	// selectors / traversal
	ElementTag.prototype.find = function (sel){
		return new Imba.Selector(sel,this);
	};
	
	ElementTag.prototype.first = function (sel){
		return sel ? (this.find(sel).first()) : (tag$wrap(this.dom().firstElementChild));
	};
	
	ElementTag.prototype.last = function (sel){
		return sel ? (this.find(sel).last()) : (tag$wrap(this.dom().lastElementChild));
	};
	
	ElementTag.prototype.child = function (i){
		return tag$wrap(this.dom().children[i || 0]);
	};
	
	ElementTag.prototype.children = function (sel){
		var nodes = new Imba.Selector(null,this,this._dom.children);
		return sel ? (nodes.filter(sel)) : (nodes);
	};
	
	ElementTag.prototype.orphanize = function (){
		var par;
		if (par = this.dom().parentNode) { par.removeChild(this._dom) };
		return this;
	};
	
	ElementTag.prototype.matches = function (sel){
		var fn;
		if (sel instanceof Function) {
			return sel(this);
		};
		
		if (sel.query) { sel = sel.query() };
		if (fn = (this._dom.webkitMatchesSelector || this._dom.matches)) { return fn.call(this._dom,sel) };
		// TODO support other browsers etc?
	};
	
	ElementTag.prototype.closest = function (sel){
		if (!sel) { return this.parent() }; // should return self?!
		var node = this;
		if (sel.query) { sel = sel.query() };
		
		while (node){
			if (node.matches(sel)) { return node };
			node = node.parent();
		};
		return null;
	};
	
	ElementTag.prototype.path = function (sel){
		var node = this;
		var nodes = [];
		if (sel && sel.query) { sel = sel.query() };
		
		while (node){
			if (!sel || node.matches(sel)) { nodes.push(node) };
			node = node.parent();
		};
		return nodes;
	};
	
	ElementTag.prototype.parents = function (sel){
		var par = this.parent();
		return par ? (par.path(sel)) : ([]);
	};
	
	ElementTag.prototype.up = function (sel){
		if (!sel) { return this.parent() };
		return this.parent() && this.parent().closest(sel);
	};
	
	ElementTag.prototype.siblings = function (sel){
		var par, self=this;
		if (!(par = this.parent())) { return [] }; // FIXME
		var ary = this.dom().parentNode.children;
		var nodes = new Imba.Selector(null,this,ary);
		return nodes.filter(function(n) { return n != self && (!sel || n.matches(sel)); });
	};
	
	ElementTag.prototype.next = function (sel){
		if (sel) {
			var el = this;
			while (el = el.next()){
				if (el.matches(sel)) { return el };
			};
			return null;
		};
		return tag$wrap(this.dom().nextElementSibling);
	};
	
	ElementTag.prototype.prev = function (sel){
		if (sel) {
			var el = this;
			while (el = el.prev()){
				if (el.matches(sel)) { return el };
			};
			return null;
		};
		return tag$wrap(this.dom().previousElementSibling);
	};
	
	ElementTag.prototype.contains = function (node){
		return this.dom().contains(node && node._dom || node);
	};
	
	ElementTag.prototype.index = function (){
		var i = 0;
		var el = this.dom();
		while (el.previousSibling){
			el = el.previousSibling;
			i++;
		};
		return i;
	};
	
	
	ElementTag.prototype.insert = function (node,pars){
		if(!pars||pars.constructor !== Object) pars = {};
		var before = pars.before !== undefined ? pars.before : null;
		var after = pars.after !== undefined ? pars.after : null;
		if (after) { before = after.next() };
		if (node instanceof Array) {
			node = (t$('fragment').setContent(node).end());
		};
		if (before) {
			this.dom().insertBefore(node.dom(),before.dom());
		} else {
			this.append(node);
		};
		return this;
	};
	
	
	// bind / present
	// should deprecate / remove
	ElementTag.prototype.bind = function (obj){
		this.setObject(obj);
		return this;
	};
	
	ElementTag.prototype.render = function (){
		return this;
	};
	
	ElementTag.prototype.build = function (){
		this.render();
		return this;
	};
	
	ElementTag.prototype.commit = function (){
		return this;
	};
	
	ElementTag.prototype.end = function (){
		if (this._built) {
			this.commit();
		} else {
			this._built = true;
			this.build();
		};
		return this;
	};
	
	// called whenever a node has rendered itself like in <self> <div> ...
	ElementTag.prototype.synced = function (){
		return this;
	};
	
	// called when the node is awakened in the dom - either automatically
	// upon attachment to the dom-tree, or the first time imba needs the
	// tag for a domnode that has been rendered on the server
	ElementTag.prototype.awaken = function (){
		return this;
	};
	
	ElementTag.prototype.focus = function (){
		this.dom().focus();
		return this;
	};
	
	ElementTag.prototype.blur = function (){
		this.dom().blur();
		return this;
	};
	
	ElementTag.prototype.template = function (){
		return null;
	};
	
	ElementTag.prototype.prepend = function (item){
		return this.insert(item,{before: this.first()});
	};
	
	ElementTag.prototype.append = function (item){
		// possible to append blank
		// possible to simplify on server?
		if (!item) { return this };
		
		if (item instanceof Array) {
			for (var i=0, ary=iter$(item), len=ary.length, member; i < len; i++) {
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
	
	
	ElementTag.prototype.insertBefore = function (node,rel){
		if ((typeof node=='string'||node instanceof String)) { node = Imba.document().createTextNode(node) };
		if (node && rel) { this.dom().insertBefore((node._dom || node),(rel._dom || rel)) };
		return this;
	};
	
	ElementTag.prototype.appendChild = function (node){
		if ((typeof node=='string'||node instanceof String)) { node = Imba.document().createTextNode(node) };
		if (node) { this.dom().appendChild(node._dom || node) };
		return this;
	};
	
	ElementTag.prototype.removeChild = function (node){
		if (node) { this.dom().removeChild(node._dom || node) };
		return this;
	};
	
	ElementTag.prototype.toString = function (){
		return this._dom.toString(); // really?
	};
	
	ElementTag.prototype.classes = function (){
		return this._dom.classList;
	};
	
	ElementTag.prototype.flags = function (){
		return this._dom.classList;
	};
	
	ElementTag.prototype.flag = function (ref,toggle){
		// it is most natural to treat a second undefined argument as a no-switch
		// so we need to check the arguments-length
		if (arguments.length == 2 && !toggle) {
			this._dom.classList.remove(ref);
		} else {
			this._dom.classList.add(ref);
		};
		return this;
	};
	
	ElementTag.prototype.unflag = function (ref){
		this._dom.classList.remove(ref);
		return this;
	};
	
	ElementTag.prototype.toggleFlag = function (ref){
		this._dom.classList.toggle(ref);
		return this;
	};
	
	ElementTag.prototype.hasFlag = function (ref){
		return this._dom.classList.contains(ref);
	};
	
	ElementTag.dom = function (){
		if (this._dom) { return this._dom };
		
		var dom;
		var sup = this.__super__.constructor;
		var proto = this.prototype;
		
		// should clone the parent no?
		if (this._isNative) {
			this._dom = dom = Imba.document().createElement(this._nodeType);
		} else if (this._nodeType != sup._nodeType) {
			this._dom = dom = Imba.document().createElement(this._nodeType);
			for (var i=0, ary=iter$(sup.dom()), len=ary.length, atr; i < len; i++) {
				atr = ary[i];
				dom.setAttribute(atr.name,atr.value);
			};
			// dom:className = sup.dom:className
			// what about default attributes?
		} else {
			this._dom = dom = sup.dom().cloneNode(false);
		};
		
		// should be a way to use a native domtype without precreating the doc
		// and still keeping the classes?
		if (this._domFlags) {
			for (var i=0, ary=iter$(this._domFlags), len=ary.length; i < len; i++) {
				proto.flag.call(this,ary[i]);
			};
		};
		
		return this._dom;
	};
	
	
	// we really ought to optimize this
	ElementTag.createNode = function (flags,id){
		var proto = this._dom || this.dom();
		var dom = proto.cloneNode(false);
		return dom;
	};
	
	ElementTag.flag = function (flag){
		// should redirect to the prototype with a dom-node already set?
		this.dom().classList.add(flag);
		return this;
	};
	
	ElementTag.unflag = function (flag){
		this.dom().classList.remove(flag);
		return this;
	};
	
	ElementTag.createNode = function (flags,id){
		var proto = this._dom || this.dom();
		var dom = proto.cloneNode(false);
		return dom;
	};
	
	ElementTag.prototype.initialize = ElementTag;
	
	function HTMLElementTag(){ ElementTag.apply(this,arguments) };
	
	subclass$(HTMLElementTag,ElementTag);
	
	
	function SVGElementTag(){ ElementTag.apply(this,arguments) };
	
	subclass$(SVGElementTag,ElementTag);
	
	
	
	HTML_TAGS = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");
	HTML_TAGS_UNSAFE = "article aside header section".split(" ");
	SVG_TAGS = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");
	
	Imba.TAGS = {
		element: ElementTag,
		htmlelement: HTMLElementTag,
		svgelement: SVGElementTag
	};
	
	Imba.SINGLETONS = {};
	IMBA_TAGS = Imba.TAGS;
	
	function extender(obj,sup){
		for (var i=0, keys=Object.keys(sup), l=keys.length; i < l; i++){
			obj[keys[i]] = sup[keys[i]];
		};
		
		obj.prototype = Object.create(sup.prototype);
		obj.__super__ = obj.prototype.__super__ = sup.prototype;
		obj.prototype.initialize = obj.prototype.constructor = obj;
		return obj;
	};
	
	Imba.defineTag = function (name,supr,body){
		if(body==undefined && typeof supr == 'function') body = supr,supr = '';
		var m = name.split("$");
		var name = m[0];
		var ns = m[1];
		
		supr || (supr = (idx$(name,HTML_TAGS) >= 0) ? ('htmlelement') : ('div'));
		
		var suprklass = Imba.TAGS[supr];
		
		var fname = name == 'var' ? ('vartag') : (name);
		// should drop this in production / optimized mode, but for debug
		// we create a constructor with a recognizeable name
		var Tag = new Function(("return function " + (fname.replace(/[\s\-\:]/g,'_')) + "(dom)\{ this.setDom(dom); \}"))();
		// var Tag = do |dom| this.setDom(dom)
		var klass = Tag;
		
		extender(klass,suprklass);
		
		klass._nodeType = suprklass._nodeType || name;
		klass._name = name;
		klass._ns = ns;
		
		// add the classes -- if this is not a basic native node?
		if (klass._nodeType != name) {
			klass._nodeFlag = "_" + name.replace(/_/g,'-');
			var nc = suprklass._nodeClass;
			nc = nc ? (nc.split(/\s+/g)) : ([]);
			var c = null;
			if (ns && idx$(c,nc) == -1) { nc.push(c = ("" + ns + "_")) };
			if (!(idx$(c,nc) >= 0)) { nc.push(c = klass._nodeFlag) };
			klass._nodeClass = nc.join(" ");
			klass._domFlags = nc;
			klass._isNative = false;
		} else {
			klass._isNative = true;
		};
		
		klass._dom = null;
		klass.prototype._nodeType = klass._nodeType;
		klass.prototype._dom = null;
		klass.prototype._built = false;
		klass.prototype._empty = true;
		// add the default flags / classes for ns etc
		// if namespaced -- this is dangerous
		if (!ns) { Imba.TAGS[name] = klass };
		Imba.TAGS[("" + name + "$" + (ns || 'html'))] = klass;
		
		// create the global shortcut for tag init as well
		if (body) { body.call(klass,klass,klass.prototype) };
		return klass;
	};
	
	Imba.defineSingletonTag = function (id,supr,body){
		
		if(body==undefined && typeof supr == 'function') body = supr,supr = '';
		var superklass = Imba.TAGS[supr || 'div'];
		
		// should drop this in production / optimized mode, but for debug
		// we create a constructor with a recognizeable name
		var fun = new Function(("return function " + (id.replace(/[\s\-\:]/g,'_')) + "(dom)\{ this.setDom(dom); \}"));
		var singleton = fun();
		
		var klass = extender(singleton,superklass);
		
		klass._id = id;
		klass._ns = superklass._ns;
		klass._nodeType = superklass._nodeType;
		klass._nodeClass = superklass._nodeClass;
		klass._domFlags = superklass._domFlags;
		klass._isNative = false;
		
		klass._dom = null;
		klass._instance = null;
		klass.prototype._dom = null;
		klass.prototype._built = false;
		klass.prototype._empty = true;
		
		// add the default flags / classes for ns etc
		// if namespaced -- this is dangerous
		// console.log('registered singleton')
		Imba.SINGLETONS[id] = klass;
		if (body) { body.call(klass,klass,klass.prototype) };
		return klass;
	};
	
	Imba.extendTag = function (name,body){
		var klass = ((typeof name=='string'||name instanceof String) ? (Imba.TAGS[name]) : (name));
		if (body) { body && body.call(klass,klass,klass.prototype) };
		return klass;
	};
	
	Imba.tag = function (name){
		var typ = Imba.TAGS[name];
		return new typ(typ.createNode());
	};
	
	Imba.tagWithId = function (name,id){
		var typ = Imba.TAGS[name];
		var dom = typ.createNode();
		dom.id = id;
		return new typ(dom);
	};
	
	Imba.getTagSingleton = function (id){
		var type,node,dom;
		
		if (type = Imba.SINGLETONS[id]) {
			// return basic awakening if singleton does not exist?
			
			if (type && type.Instance) { return type.Instance };
			// no instance - check for element
			if (dom = Imba.document().getElementById(id)) {
				// we have a live instance - when finding it through a selector we should awake it, no?
				// console.log('creating the singleton from existing node in dom?',id,type)
				node = type.Instance = new type(dom);
				node.awaken(dom); // should only awaken
				return node;
			};
			
			dom = type.createNode();
			dom.id = id;
			// console.log('creating the singleton',id,type)
			node = type.Instance = new type(dom);
			node.end().awaken(dom);
			return node;
		} else if (dom = Imba.document().getElementById(id)) {
			// console.log('found plain element with id')
			return Imba.getTagForDom(dom);
		};
	};
	
	
	
	Imba.getTagForDom = function (dom){
		
		var m;
		if (!dom) { return null };
		if (dom._dom) { return dom }; // could use inheritance instead
		if (dom._tag) { return dom._tag };
		if (!dom.nodeName) { return null };
		
		var ns = null;
		var id = dom.id;
		var type = dom.nodeName.toLowerCase();
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
		};
		
		if (cls) {
			// there can be several matches here - should choose the last
			// should fall back to less specific later? - otherwise things may fail
			// TODO rework this
			if (m = cls.match(/\b_([a-z\-]+)\b(?!\s*_[a-z\-]+)/)) {
				type = m[1].replace(/-/g,'_');
			};
			
			if (m = cls.match(/\b([a-z]+)_\b/)) {
				ns = m[1];
			};
		};
		
		var spawner = Imba.TAGS[type];
		return spawner ? (new spawner(dom).awaken(dom)) : (null);
	};
	
	t$ = Imba.tag;
	tc$ = Imba.tagWithFlags;
	ti$ = Imba.tagWithId;
	tic$ = Imba.tagWithIdAndFlags;
	id$ = Imba.getTagSingleton;
	tag$wrap = Imba.getTagForDom;
	
	
	// shim for classList

})()