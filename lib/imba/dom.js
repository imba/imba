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
	
	// externs;
	
	var svgSupport = typeof SVGElement !== 'undefined';
	
	Imba.document = function (){
		return window.document;
	};
	
	// Imba.document:createElementNS && Imba.document.createElementNS('http://www.w3.org/2000/svg', "svg")[:createSVGRect]
	
	// This is VERY experimental. Using Imba for serverside templates
	// is not recommended unless you're ready for a rough ride. It is
	// a priority to get this fast and stable.
	
	// room for lots of optimization to serverside nodes. can be much more
	// clever when it comes to the classes etc
	
	function ElementTag(dom){
		this.setDom(dom);
		this;
	};
	
	
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
	
	ElementTag.prototype.setHandler = function (name,v){
		this["on" + name] = v;
		return this;
	};
	
	ElementTag.prototype.setAttribute = function (key,v){
		v != null && v !== false ? (this.dom().setAttribute(key,v)) : (this.removeAttribute(key));
		return v; // non-obvious that we need to return the value here, no?
	};
	
	ElementTag.prototype.removeAttribute = function (key){
		return this.dom().removeAttribute(key);
	};
	
	ElementTag.prototype.getAttribute = function (key){
		var val = this.dom().getAttribute(key);
		return val;
	};
	
	ElementTag.prototype.object = function (v){
		if (arguments.length) { return ((this.setObject(v),v),this) };
		return this._object;
	};
	
	ElementTag.prototype.body = function (v){
		if (arguments.length) { return ((this.setBody(v),v),this) };
		return this;
	};
	
	ElementTag.prototype.setBody = function (body){
		this._empty ? (this.append(body)) : (this.empty().append(body));
		return this;
	};
	
	ElementTag.prototype.setContent = function (content){
		this.setChildren(content); // override?
		return this;
	};
	
	ElementTag.prototype.setChildren = function (nodes){
		this._empty ? (this.append(nodes)) : (this.empty().append(nodes));
		return this;
	};
	
	ElementTag.prototype.setStaticContent = function (nodes){
		this.setStaticChildren(nodes);
		return this;
	};
	
	ElementTag.prototype.setStaticChildren = function (nodes){
		this.setChildren(nodes);
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
	
	// def first sel
	// 	# want to filter
	// 	var el = tag(dom:firstChild)
	// 	if sel and el and !el.matches(sel)
	// 		return el.next(sel)
	// 	return el
	
	ElementTag.prototype.log = function (){
		// playing safe for ie
		var $0 = arguments, i = $0.length;
		var args = new Array(i>0 ? i : 0);
		while(i>0) args[i-1] = $0[--i];
		args.unshift(console);
		Function.prototype.call.apply(console.log,args);
		// console.log(*arguments)
		return this;
	};
	
	
	// def emit name, data: nil, bubble: yes
	// 	ED.trigger name, self, data: data, bubble: bubble
	// 	return self
	
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
		return nodes.filter(function(n) {
			return n != self && (!sel || n.matches(sel));
		});
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
			node = (t$('fragment').setChildren([node]).end());
		};
		if (before) {
			this.dom().insertBefore(node.dom(),before.dom());
		} else {
			this.append(node);
		};
		return this;
	};
	
	// bind / present
	ElementTag.prototype.bind = function (obj){
		this.setObject(obj);
		if (this._built) { this.render(obj) };
		return this;
	};
	
	ElementTag.prototype.build = function (){
		return this;
	};
	
	ElementTag.prototype.awaken = function (){
		return this;
	};
	
	ElementTag.prototype.commit = function (){
		return this;
	};
	
	ElementTag.prototype.synced = function (){
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
	
	ElementTag.prototype.end = function (){
		if (this._built) {
			this.commit();
		} else {
			this._built = true;
			this.build();
		};
		return this;
	};
	
	ElementTag.prototype.render = function (par){
		this.setBody(this.template(par || this._object));
		return this;
	};
	
	// called when the node is awakened in the dom - either automatically
	// upon attachment to the dom-tree, or the first time imba needs the
	// tag for a domnode that has been rendered on the server
	ElementTag.prototype.awake = function (){
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
	
	ElementTag.prototype.toString = function (){
		return this._dom.toString(); // really?
	};
	
	ElementTag.flag = function (flag){
		// should redirect to the prototype with a dom-node already set?
		this.dom().classList.add(flag);
		// dom:className += " " + flag
		return this;
	};
	
	ElementTag.unflag = function (flag){
		this.dom().classList.remove(flag);
		return this;
	};
	
	ElementTag.prototype.classes = function (){
		return this.dom().classList;
	};
	
	ElementTag.prototype.flag = function (ref,toggle){
		// it is most natural to treat a second undefined argument as a no-switch
		// so we need to check the arguments-length
		if (arguments.length == 2) {
			toggle ? (this.classes().add(ref)) : (this.classes().remove(ref));
		} else {
			this.classes().add(ref);
		};
		return this;
	};
	
	ElementTag.prototype.unflag = function (ref){
		this.classes().remove(ref);
		return this;
	};
	
	ElementTag.prototype.hasFlag = function (ref){
		return this.classes().contains(ref);
	};
	
	
	ElementTag.prototype.initialize = ElementTag;
	
	
	function HTMLElementTag(){ ElementTag.apply(this,arguments) };
	
	subclass$(HTMLElementTag,ElementTag);
	HTMLElementTag.dom = function (){
		if (this._dom) { return this._dom };
		
		var dom;
		var sup = this.__super__.constructor;
		
		// should clone the parent no?
		if (this._isNative) {
			dom = Imba.document().createElement(this._nodeType);
		} else if (this._nodeType != sup._nodeType) {
			console.log("custom dom type(!)");
			dom = Imba.document().createElement(this._nodeType);
			for (var i=0, ary=iter$(sup.dom()), len=ary.length, atr; i < len; i++) {
				atr = ary[i];
				dom.setAttribute(atr.name,atr.value);
			};
			// dom:className = sup.dom:className
			// what about default attributes?
		} else {
			dom = sup.dom().cloneNode(false);
		};
		
		// should be a way to use a native domtype without precreating the doc
		// and still keeping the classes?
		
		if (this._domFlags) {
			for (var i=0, ary=iter$(this._domFlags), len=ary.length; i < len; i++) {
				dom.classList.add(ary[i]);
			};
		};
		
		// include the super?!
		// dom:className = @nodeClass or ""
		return this._dom = dom;
	};
	
	// we really ought to optimize this
	HTMLElementTag.createNode = function (flags,id){
		var proto = this._dom || this.dom();
		var dom = proto.cloneNode(false);
		
		if (id) {
			dom.id = id;
		};
		
		if (flags) {
			this.p("SHOULD NEVER GET HERE?!");
			var nc = dom.className;
			dom.className = nc && flags ? ((nc + " " + flags)) : ((nc || flags));
		};
		
		return dom;
	};
	
	
	HTML_TAGS = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");
	HTML_TAGS_UNSAFE = "article aside header section".split(" ");
	
	SVG_TAGS = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");
	
	IMBA_TAGS = {
		element: ElementTag,
		htmlelement: HTMLElementTag
	};
	
	Imba.SINGLETONS = {};
	Imba.TAGS = IMBA_TAGS;
	
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
		
		var suprklass = IMBA_TAGS[supr];
		
		// should drop this in production / optimized mode, but for debug
		// we create a constructor with a recognizeable name
		
		var fun = new Function(("return function " + (name.replace(/\s\-\:/g,'_')) + "(dom)\{ this.setDom(dom); \}"));
		var Tag = fun();
		// var Tag = do |dom|
		// 	this.setDom(dom)
		// 	this
		
		// var Tag = {}
		var klass = Tag; // imba$class(func,suprklass)
		
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
		
		tag$[name] = Imba.basicTagSpawner(klass,klass._nodeType);
		
		// add the default flags / classes for ns etc
		// if namespaced -- this is dangerous
		if (!ns) { IMBA_TAGS[name] = klass };
		IMBA_TAGS[("" + name + "$" + (ns || 'html'))] = klass;
		
		// create the global shortcut for tag init as well
		if (body) { body.call(klass,klass,klass.prototype) };
		return klass;
	};
	
	Imba.defineSingletonTag = function (id,supr,body){
		
		if(body==undefined && typeof supr == 'function') body = supr,supr = '';
		var superklass = Imba.TAGS[supr || 'div'];
		// do we really want a class for singletons?
		// var klass = imba$class(func,superklass)
		// var ctor = (Function.new("return function " + name + "(){ alert('sweet!')}")()
		
		var singleton = function(dom) {
			this.setDom(dom);
			return this;
		};
		
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
		var klass = ((typeof name=='string'||name instanceof String) ? (IMBA_TAGS[name]) : (name));
		if (body) { body && body.call(klass,klass,klass.prototype) };
		return klass;
	};
	
	Imba.tag = function (name){
		var typ = IMBA_TAGS[name];
		return new typ(typ.createNode());
	};
	
	// tags are a big and important part of Imba. It is critical to make this as
	// fast as possible. Since most engines really like functions they can optimize
	// we use several different functions for generating tags, depending on which
	// parts are supplied (classes, id, attributes, ...)
	Imba.basicTagSpawner = function (type){
		return function() {
			return new type(type.createNode());
		};
	};
	
	Imba.tagWithId = function (name,id){
		var typ = IMBA_TAGS[name];
		var dom = typ.createNode();
		dom.id = id;
		return new typ(dom);
	};
	
	tag$ = Imba.tag;
	
	t$ = Imba.tag;
	tc$ = Imba.tagWithFlags;
	ti$ = Imba.tagWithId;
	tic$ = Imba.tagWithIdAndFlags;
	
	
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
				node.awake(); // should only awaken
				return node;
			};
			
			dom = type.createNode();
			dom.id = id;
			// console.log('creating the singleton',id,type)
			node = type.Instance = new type(dom);
			node.end().awake();
			return node;
		} else if (dom = Imba.document().getElementById(id)) {
			// console.log('found plain element with id')
			return Imba.getTagForDom(dom);
		};
	};
	
	id$ = Imba.getTagSingleton;
	
	Imba.getTagForDom = function (dom){
		
		// ugly checks
		var m;
		if (!dom) { return null };
		if (dom._dom) { return dom }; // could use inheritance instead
		if (dom._tag) { return dom._tag };
		if (!dom.nodeName) { return null }; // better check?
		
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
		
		var spawner = IMBA_TAGS[type];
		// console.log("tag for dom?!",ns,type,cls,spawner)
		return spawner ? (new spawner(dom).awaken(dom)) : (null);
	};
	
	tag$wrap = Imba.getTagForDom;
	// predefine all supported html tags
	
	
	
		
		
		IMBA_TAGS.htmlelement.prototype.__id = {dom: true,name: 'id'};
		IMBA_TAGS.htmlelement.prototype.id = function(v){ return this.getAttribute('id'); }
		IMBA_TAGS.htmlelement.prototype.setId = function(v){ this.setAttribute('id',v); return this; };
		
		IMBA_TAGS.htmlelement.prototype.__tabindex = {dom: true,name: 'tabindex'};
		IMBA_TAGS.htmlelement.prototype.tabindex = function(v){ return this.getAttribute('tabindex'); }
		IMBA_TAGS.htmlelement.prototype.setTabindex = function(v){ this.setAttribute('tabindex',v); return this; };
		
		IMBA_TAGS.htmlelement.prototype.__title = {dom: true,name: 'title'};
		IMBA_TAGS.htmlelement.prototype.title = function(v){ return this.getAttribute('title'); }
		IMBA_TAGS.htmlelement.prototype.setTitle = function(v){ this.setAttribute('title',v); return this; };
		
		IMBA_TAGS.htmlelement.prototype.__role = {dom: true,name: 'role'};
		IMBA_TAGS.htmlelement.prototype.role = function(v){ return this.getAttribute('role'); }
		IMBA_TAGS.htmlelement.prototype.setRole = function(v){ this.setAttribute('role',v); return this; };
		
		// def log *params
		// 	console.log(*params)
		// 	self
	;
	
	Imba.defineTag('fragment','htmlelement', function(tag){
		
		tag.createNode = function (){
			return Imba.document().createDocumentFragment();
		};
	});
	
	Imba.defineTag('a', function(tag){
		
		tag.prototype.__href = {dom: true,name: 'href'};
		tag.prototype.href = function(v){ return this.getAttribute('href'); }
		tag.prototype.setHref = function(v){ this.setAttribute('href',v); return this; };
	});
	
	Imba.defineTag('abbr');
	Imba.defineTag('address');
	Imba.defineTag('area');
	Imba.defineTag('article');
	Imba.defineTag('aside');
	Imba.defineTag('audio');
	Imba.defineTag('b');
	Imba.defineTag('base');
	Imba.defineTag('bdi');
	Imba.defineTag('bdo');
	Imba.defineTag('big');
	Imba.defineTag('blockquote');
	Imba.defineTag('body');
	Imba.defineTag('br');
	Imba.defineTag('button', function(tag){
		
		tag.prototype.__type = {dom: true,name: 'type'};
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
		
		tag.prototype.__disabled = {dom: true,name: 'disabled'};
		tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
		tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
	});
	
	Imba.defineTag('canvas');
	Imba.defineTag('caption');
	Imba.defineTag('cite');
	Imba.defineTag('code');
	Imba.defineTag('col');
	Imba.defineTag('colgroup');
	Imba.defineTag('data');
	Imba.defineTag('datalist');
	Imba.defineTag('dd');
	Imba.defineTag('del');
	Imba.defineTag('details');
	Imba.defineTag('dfn');
	Imba.defineTag('div');
	Imba.defineTag('dl');
	Imba.defineTag('dt');
	Imba.defineTag('em');
	Imba.defineTag('embed');
	Imba.defineTag('fieldset');
	Imba.defineTag('figcaption');
	Imba.defineTag('figure');
	Imba.defineTag('footer');
	
	Imba.defineTag('form', function(tag){
		
		tag.prototype.__method = {dom: true,name: 'method'};
		tag.prototype.method = function(v){ return this.getAttribute('method'); }
		tag.prototype.setMethod = function(v){ this.setAttribute('method',v); return this; };
		
		tag.prototype.__action = {dom: true,name: 'action'};
		tag.prototype.action = function(v){ return this.getAttribute('action'); }
		tag.prototype.setAction = function(v){ this.setAttribute('action',v); return this; };
	});
	
	Imba.defineTag('h1');
	Imba.defineTag('h2');
	Imba.defineTag('h3');
	Imba.defineTag('h4');
	Imba.defineTag('h5');
	Imba.defineTag('h6');
	Imba.defineTag('head');
	Imba.defineTag('header');
	Imba.defineTag('hr');
	Imba.defineTag('html');
	Imba.defineTag('i');
	Imba.defineTag('iframe');
	
	Imba.defineTag('img', function(tag){
		
		tag.prototype.__src = {dom: true,name: 'src'};
		tag.prototype.src = function(v){ return this.getAttribute('src'); }
		tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
	});
	
	Imba.defineTag('input', function(tag){
		// can use attr instead
		
		tag.prototype.__name = {dom: true,name: 'name'};
		tag.prototype.name = function(v){ return this.getAttribute('name'); }
		tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
		
		tag.prototype.__type = {dom: true,name: 'type'};
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
		
		tag.prototype.__value = {dom: true,name: 'value'};
		tag.prototype.value = function(v){ return this.getAttribute('value'); }
		tag.prototype.setValue = function(v){ this.setAttribute('value',v); return this; }; // dom property - NOT attribute
		
		tag.prototype.__required = {dom: true,name: 'required'};
		tag.prototype.required = function(v){ return this.getAttribute('required'); }
		tag.prototype.setRequired = function(v){ this.setAttribute('required',v); return this; };
		
		tag.prototype.__disabled = {dom: true,name: 'disabled'};
		tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
		tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
		
		tag.prototype.__placeholder = {dom: true,name: 'placeholder'};
		tag.prototype.placeholder = function(v){ return this.getAttribute('placeholder'); }
		tag.prototype.setPlaceholder = function(v){ this.setAttribute('placeholder',v); return this; };
		
		tag.prototype.value = function (){
			return this.dom().value;
		};
		
		tag.prototype.setValue = function (v){
			this.dom().value = v;
			return this;
		};
	});
	
	Imba.defineTag('ins');
	Imba.defineTag('kbd');
	Imba.defineTag('keygen');
	Imba.defineTag('label');
	Imba.defineTag('legend');
	Imba.defineTag('li');
	
	Imba.defineTag('link', function(tag){
		
		tag.prototype.__rel = {dom: true,name: 'rel'};
		tag.prototype.rel = function(v){ return this.getAttribute('rel'); }
		tag.prototype.setRel = function(v){ this.setAttribute('rel',v); return this; };
		
		tag.prototype.__type = {dom: true,name: 'type'};
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
		
		tag.prototype.__href = {dom: true,name: 'href'};
		tag.prototype.href = function(v){ return this.getAttribute('href'); }
		tag.prototype.setHref = function(v){ this.setAttribute('href',v); return this; };
		
		tag.prototype.__media = {dom: true,name: 'media'};
		tag.prototype.media = function(v){ return this.getAttribute('media'); }
		tag.prototype.setMedia = function(v){ this.setAttribute('media',v); return this; };
	});
	
	Imba.defineTag('main');
	Imba.defineTag('map');
	Imba.defineTag('mark');
	Imba.defineTag('menu');
	Imba.defineTag('menuitem');
	
	Imba.defineTag('meta', function(tag){
		
		tag.prototype.__name = {dom: true,name: 'name'};
		tag.prototype.name = function(v){ return this.getAttribute('name'); }
		tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
		
		tag.prototype.__content = {dom: true,name: 'content'};
		tag.prototype.content = function(v){ return this.getAttribute('content'); }
		tag.prototype.setContent = function(v){ this.setAttribute('content',v); return this; };
		
		tag.prototype.__charset = {dom: true,name: 'charset'};
		tag.prototype.charset = function(v){ return this.getAttribute('charset'); }
		tag.prototype.setCharset = function(v){ this.setAttribute('charset',v); return this; };
	});
	
	Imba.defineTag('meter');
	Imba.defineTag('nav');
	Imba.defineTag('noscript');
	Imba.defineTag('object');
	Imba.defineTag('ol');
	Imba.defineTag('optgroup');
	
	Imba.defineTag('option', function(tag){
		
		tag.prototype.__value = {dom: true,name: 'value'};
		tag.prototype.value = function(v){ return this.getAttribute('value'); }
		tag.prototype.setValue = function(v){ this.setAttribute('value',v); return this; };
	});
	
	Imba.defineTag('output');
	Imba.defineTag('p');
	Imba.defineTag('param');
	Imba.defineTag('pre');
	Imba.defineTag('progress');
	Imba.defineTag('q');
	Imba.defineTag('rp');
	Imba.defineTag('rt');
	Imba.defineTag('ruby');
	Imba.defineTag('s');
	Imba.defineTag('samp');
	
	Imba.defineTag('script', function(tag){
		
		tag.prototype.__src = {dom: true,name: 'src'};
		tag.prototype.src = function(v){ return this.getAttribute('src'); }
		tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
		
		tag.prototype.__type = {dom: true,name: 'type'};
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
	});
	
	Imba.defineTag('section');
	
	Imba.defineTag('select', function(tag){
		
		tag.prototype.__multiple = {dom: true,name: 'multiple'};
		tag.prototype.multiple = function(v){ return this.getAttribute('multiple'); }
		tag.prototype.setMultiple = function(v){ this.setAttribute('multiple',v); return this; };
		
		tag.prototype.value = function (){
			return this.dom().value;
		};
		
		tag.prototype.setValue = function (v){
			this.dom().value = v;
			return this;
		};
	});
	
	
	Imba.defineTag('small');
	Imba.defineTag('source');
	Imba.defineTag('span');
	Imba.defineTag('strong');
	Imba.defineTag('style');
	Imba.defineTag('sub');
	Imba.defineTag('summary');
	Imba.defineTag('sup');
	Imba.defineTag('table');
	Imba.defineTag('tbody');
	Imba.defineTag('td');
	
	Imba.defineTag('textarea', function(tag){
		
		tag.prototype.__name = {dom: true,name: 'name'};
		tag.prototype.name = function(v){ return this.getAttribute('name'); }
		tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
		
		tag.prototype.__disabled = {dom: true,name: 'disabled'};
		tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
		tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
		
		tag.prototype.__required = {dom: true,name: 'required'};
		tag.prototype.required = function(v){ return this.getAttribute('required'); }
		tag.prototype.setRequired = function(v){ this.setAttribute('required',v); return this; };
		
		tag.prototype.__placeholder = {dom: true,name: 'placeholder'};
		tag.prototype.placeholder = function(v){ return this.getAttribute('placeholder'); }
		tag.prototype.setPlaceholder = function(v){ this.setAttribute('placeholder',v); return this; };
		
		tag.prototype.__value = {dom: true,name: 'value'};
		tag.prototype.value = function(v){ return this.getAttribute('value'); }
		tag.prototype.setValue = function(v){ this.setAttribute('value',v); return this; };
		
		tag.prototype.__rows = {dom: true,name: 'rows'};
		tag.prototype.rows = function(v){ return this.getAttribute('rows'); }
		tag.prototype.setRows = function(v){ this.setAttribute('rows',v); return this; };
		
		tag.prototype.__cols = {dom: true,name: 'cols'};
		tag.prototype.cols = function(v){ return this.getAttribute('cols'); }
		tag.prototype.setCols = function(v){ this.setAttribute('cols',v); return this; };
		
		tag.prototype.value = function (){
			return this.dom().value;
		};
		
		tag.prototype.setValue = function (v){
			this.dom().value = v;
			return this;
		};
	});
	
	Imba.defineTag('tfoot');
	Imba.defineTag('th');
	Imba.defineTag('thead');
	Imba.defineTag('time');
	Imba.defineTag('title');
	Imba.defineTag('tr');
	Imba.defineTag('track');
	Imba.defineTag('u');
	Imba.defineTag('ul');
	Imba.defineTag('video');
	Imba.defineTag('wbr');

})()