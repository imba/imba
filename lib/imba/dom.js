(function(){


	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };;
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
	;
	idx$ = function(a,b){
		return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
	};
	
	var doc;
	var svgSupport = true;
	// unless global:document
	// Imba:doc = ImbaServerDocument.new
	// var hasSVG = !!Imba:doc && !!document.createElementNS(ns.svg, 'svg').createSVGRect;
	// hmm - not a good way to detect client
	if(doc = global.document) {
		Imba.doc = doc;
		svgSupport = doc.createElementNS && doc.createElementNS('http://www.w3.org/2000/svg',"svg").createSVGRect;
		// else
		// # introduce global document here.
		// global:document = Imba:doc
	};
	
	
	// This is VERY experimental. Using Imba for serverside templates
	// is not recommended unless you're ready for a rough ride. It is
	// a priority to get this fast and stable.
	
	// room for lots of optimization to serverside nodes. can be much more
	// clever when it comes to the classes etc
	
	/* @class ElementTag */
	function ElementTag(){ };
	
	
	ElementTag.prototype.__object = {};
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
	
	ElementTag.prototype.setAttribute = function (key,v){
		if(v != null && v !== false) {
			this.dom().setAttribute(key,v);
		} else {
			this.removeAttribute(key);
		};
		return v;// non-obvious that we need to return the value here, no?
	};
	
	ElementTag.prototype.removeAttribute = function (key){
		return this.dom().removeAttribute(key);
	};
	
	ElementTag.prototype.getAttribute = function (key){
		var val = this.dom().getAttribute(key);
		return val;
	};
	
	ElementTag.prototype.object = function (v){
		if(arguments.length) {
			return (this.setObject(v),this);
		};
		return this._object;// hmm
	};
	
	ElementTag.prototype.body = function (v){
		if(arguments.length) {
			return (this.setBody(v),this);
		};
		return this;
	};
	
	ElementTag.prototype.setBody = function (body){
		if(this._empty) {
			this.append(body);
		} else {
			this.empty().append(body);
		};
		return this;
	};
	
	ElementTag.prototype.setContent = function (content){
		this.setChildren(content);// override?
		return this;
	};
	
	ElementTag.prototype.setChildren = function (nodes){
		if(this._empty) {
			this.append(nodes);
		} else {
			this.empty().append(nodes);
		};
		return this;
	};
	
	ElementTag.prototype.text = function (v){
		if(arguments.length) {
			return (this.setText(v),this);
		};
		return this._dom.textContent;
	};
	
	ElementTag.prototype.setText = function (txt){
		this._empty = false;
		this._dom.textContent = (txt == null) ? (txt = "") : (txt);
		return this;
	};
	
	ElementTag.prototype.empty = function (){
		while(this._dom.firstChild){
			this._dom.removeChild(this._dom.firstChild);
		};
		this._empty = true;
		return this;
	};
	
	ElementTag.prototype.remove = function (node){
		var par = this.dom();
		var el = node && node.dom();
		if(el && el.parentNode == par) {
			par.removeChild(el);
		};
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
		if(key instanceof Object) {
			for(var o=key, i=0, keys=Object.keys(o), l=keys.length; i < l; i++){
				this.css(keys[i],o[keys[i]]);
			};
		} else if(val == null) {
			this.dom().style.removeProperty(key);
		} else if(val == undefined) {
			return this.dom().style[key];
		} else {
			if((typeof val=='number'||val instanceof Number) && key.match(/width|height|left|right|top|bottom/)) {
				val = val + "px";
			};
			this.dom().style[key] = val;
		};
		return this;
	};
	
	// selectors / traversal
	ElementTag.prototype.find = function (sel){
		return new ImbaSelector(sel,this);
	};
	
	ElementTag.prototype.first = function (sel){
		return (sel) ? (this.find(sel).first()) : (tag$wrap(this.dom().firstElementChild));
	};
	
	ElementTag.prototype.last = function (sel){
		return (sel) ? (this.find(sel).last()) : (tag$wrap(this.dom().lastElementChild));
	};
	
	ElementTag.prototype.child = function (i){
		return tag$wrap(this.dom().children[i || 0]);
	};
	
	ElementTag.prototype.children = function (sel){
		var nodes = new ImbaSelector(null,this,this._dom.children);
		return (sel) ? (nodes.filter(sel)) : (nodes);
	};
	
	ElementTag.prototype.orphanize = function (){
		var par;
		if(par = this.dom().parentNode) {
			par.removeChild(this._dom);
		};
		return this;
	};
	
	ElementTag.prototype.matches = function (sel){
		var fn;
		if(sel instanceof Function) {
			return sel(this);
		};
		
		if(sel.query) {
			sel = sel.query();
		};
		if(fn = (this._dom.webkitMatchesSelector || this._dom.matches)) {
			return fn.call(this._dom,sel);
		};
		// TODO support other browsers etc?
	};
	
	ElementTag.prototype.closest = function (sel){
		if(!sel) {
			return this.parent();
		};// should return self?!
		var node = this;
		if(sel.query) {
			sel = sel.query();
		};
		
		while(node){
			if(node.matches(sel)) {
				return node;
			};
			node = node.parent();
		};
		return null;
	};
	
	ElementTag.prototype.contains = function (node){
		return this.dom().contains(node && node._dom || node);
	};
	
	ElementTag.prototype.index = function (){
		var i = 0;
		var el = this.dom();
		while(el.previousSibling){
			el = el.previousSibling;
			i++;
		};
		
		return i;
	};
	
	ElementTag.prototype.up = function (sel){
		if(!sel) {
			return this.parent();
		};
		return this.parent() && this.parent().closest(sel);
	};
	
	ElementTag.prototype.siblings = function (sel){
		var par, self=this;
		if(!(par = this.parent())) {
			return [];
		};// FIXME
		var ary = this.dom().parentNode.children;
		var nodes = new ImbaSelector(null,this,ary);
		return nodes.filter(function (n){
			return n != self && (!sel || n.matches(sel));
		});
	};
	
	ElementTag.prototype.next = function (sel){
		if(sel) {
			var el = this;
			while(el = el.next()){
				if(el.matches(sel)) {
					return el;
				};
			};
			return null;
		};
		return tag$wrap(this.dom().nextElementSibling);
	};
	
	ElementTag.prototype.prev = function (sel){
		if(sel) {
			var el = this;
			while(el = el.prev()){
				if(el.matches(sel)) {
					return el;
				};
			};
			return null;
		};
		return tag$wrap(this.dom().previousElementSibling);
	};
	
	ElementTag.prototype.insert = function (node,pars){
		if(!pars||pars.constructor !== Object) pars = {};
		var before = pars.before !== undefined ? pars.before : null;
		var after = pars.after !== undefined ? pars.after : null;
		if(after) {
			before = after.next();
		};
		if(node instanceof Array) {
			node = (t$('fragment').setContent([node]).end());
		};
		if(before) {
			this.dom().insertBefore(node.dom(),before.dom());
		} else {
			this.append(node);
		};
		return this;
	};
	
	// bind / present
	ElementTag.prototype.bind = function (obj){
		this.setObject(obj);
		if(this._built) {
			this.render(obj);
		};// hmm
		return this;
	};
	
	ElementTag.prototype.build = function (){
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
		if(this._built) {
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
		if(!item) {
			return this;
		};
		
		if(item instanceof Array) {
			for(var i=0, ary=iter$(item), len=ary.length, member; i < len; i++) {
				member = ary[i];member && this.append(member);
			};
		} else if((typeof item=='string'||item instanceof String) || (typeof item=='number'||item instanceof Number)) {
			var node = Imba.doc.createTextNode(item);
			this._dom.appendChild(node);
			if(this._empty) {
				this._empty = false;
			};
		} else {
			this._dom.appendChild(item._dom || item);
			if(this._empty) {
				this._empty = false;
			};
		};
		
		return this;
	};
	
	ElementTag.prototype.toString = function (){
		return this._dom.toString();// really?
	};
	
	ElementTag.flag = function (flag){
		// hmm - this is not good enough
		// should redirect to the prototype with a dom-node already set?
		var dom = this.dom();
		dom.classList.add(flag);
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
		if(arguments.length == 2) {
			if(toggle) {
				this.classes().add(ref);
			} else {
				this.classes().remove(ref);
			};
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
	
	
	
	/* @class HTMLElementTag */
	function HTMLElementTag(){ ElementTag.apply(this,arguments) };
	
	subclass$(HTMLElementTag,ElementTag);
	HTMLElementTag.dom = function (){
		if(this._dom) {
			return this._dom;
		};
		
		var dom;
		var sup = this.__super__.constructor;
		
		// should clone the parent no?
		if(this._isNative) {
			dom = Imba.doc.createElement(this._nodeType);
		} else if(this._nodeType != sup._nodeType) {
			console.log("custom dom type(!)");
			dom = Imba.doc.createElement(this._nodeType);
			for(var i=0, ary=iter$(sup.dom()), len=ary.length, atr; i < len; i++) {
				atr = ary[i];dom.setAttribute(atr.name,atr.value);
			};
			// dom:className = sup.dom:className
			// what about default attributes?
		} else {
			dom = sup.dom().cloneNode(false);
		};
		
		// should be a way to use a native domtype without precreating the doc
		// and still keeping the classes?
		
		if(this._domFlags) {
			for(var i=0, ary=iter$(this._domFlags), len=ary.length; i < len; i++) {
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
		
		if(id) {
			dom.id = id;
		};
		
		if(flags) {
			this.p("SHOULD NEVER GET HERE?!");
			var nc = dom.className;
			dom.className = (nc && flags) ? ((nc + " " + flags)) : ((nc || flags));
		};
		
		// var dom = global:document.createElement(@nodeType)
		// var nc = @nodeClass
		// if nc or flags
		// 	dom:className = nc && flags ? (nc + " " + flags) : (nc or flags)
		// dom:id = id if id 
		return dom;
	};
	
	// are we sure
	// def setup body
	// 	append(body)
	
	// we need special dom-properties with unified getters and setters
	// def text text
	// 	if text !== undefined
	// 		@dom:innerText = text
	// 		return self
	// 	return @dom:innerText
	;
	
	// Imba.Tag.
	// Imba.Tag.TYPES_HTML = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ")
	
	HTML_TAGS = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");
	HTML_TAGS_UNSAFE = "article aside header section".split(" ");
	
	SVG_TAGS = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");
	
	IMBA_TAGS = {
		element: ElementTag,
		htmlelement: HTMLElementTag
	};
	
	Imba.SINGLETONS = {};
	Imba.TAGS = IMBA_TAGS;
	
	// IMBA_TAGS:htmlelement = HTMLElementTag
	
	// def Imba.p
	// 	console.log(*arguments)
	
	// TODO remove nodeClass? No need to have two representations of the same
	
	function extender(obj,sup){
		for(var o=sup, i=0, keys=Object.keys(o), l=keys.length; i < l; i++){
			obj[keys[i]] = o[keys[i]];
		};
		
		obj.prototype = Object.create(sup.prototype);
		obj.__super__ = obj.prototype.__super__ = sup.prototype;
		obj.prototype.initialize = obj.prototype.constructor = obj;
		return obj;
	};
	
	Imba.defineTag = function (name,func,supr){
		var ary;
		var ary=iter$(name.split("$"));var name = ary[(0)],ns = ary[(1)];
		supr || (supr = ((idx$(name,HTML_TAGS) >= 0)) ? ('htmlelement') : ('div'));
		
		var suprklass = IMBA_TAGS[supr];
		var klass = func;// imba$class(func,suprklass)
		
		extender(klass,suprklass);
		
		klass._nodeType = suprklass._nodeType || name;
		
		klass._name = name;
		klass._ns = ns;
		
		// add the classes -- if this is not a basic native node?
		if(klass._nodeType != name) {
			klass._nodeFlag = "_" + name.replace(/_/g,'-');
			var nc = suprklass._nodeClass;
			nc = (nc) ? (nc.split(/\s+/g)) : ([]);
			var c = null;
			if(ns && idx$(c,nc) == -1) {
				nc.push(c = ("" + ns + "_"));
			};
			if(!(idx$(c,nc) >= 0)) {
				nc.push(c = klass._nodeFlag);
			};
			klass._nodeClass = nc.join(" ");
			klass._domFlags = nc;
			klass._isNative = false;
		} else {
			klass._isNative = true;
		};
		
		klass._dom = null;
		klass.prototype._dom = null;
		klass.prototype._built = false;
		klass.prototype._empty = true;
		
		tag$[name] = Imba.basicTagSpawner(klass,klass._nodeType);
		
		// add the default flags / classes for ns etc
		// if namespaced -- this is dangerous
		if(!ns) {
			IMBA_TAGS[name] = klass;
		};
		IMBA_TAGS[("" + name + "$" + (ns || 'html'))] = klass;
		
		// create the global shortcut for tag init as well
		return klass;
	};
	
	Imba.defineSingletonTag = function (id,func,supr){
		var superklass = Imba.TAGS[supr || 'div'];
		// do we really want a class for singletons?
		// var klass = imba$class(func,superklass)
		var klass = extender(func,superklass);
		
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
		return function (){
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
		
		if(type = Imba.SINGLETONS[id]) {
			// return basic awakening if singleton does not exist?
			
			if(type && type.Instance) {
				return type.Instance;
			};
			// no instance - check for element
			if(dom = Imba.doc.getElementById(id)) {
				// we have a live instance - when finding it through a selector we should awake it, no?
				// hmm?
				// console.log('creating the singleton from existing node in dom?',id,type)
				node = type.Instance = new type(dom);
				node.awake();// should only awaken
				return node;
			};
			
			dom = type.createNode();
			dom.id = id;
			// console.log('creating the singleton',id,type)
			node = type.Instance = new type(dom);
			node.end().awake();
			return node;
		} else if(dom = Imba.doc.getElementById(id)) {
			// console.log('found plain element with id')
			return Imba.getTagForDom(dom);
		};
	};
	
	id$ = Imba.getTagSingleton;
	
	Imba.getTagForDom = function (dom){
		
		// ugly checks
		var m;
		if(!dom) {
			return null;
		};
		if(dom._dom) {
			return dom;
		};// could use inheritance instead
		if(dom._tag) {
			return dom._tag;
		};
		if(!(dom.nodeName)) {
			return null;
		};// better check?
		
		var ns = null;
		var id = dom.id;
		var type = dom.nodeName.toLowerCase();
		var cls = dom.className;
		
		if(id && Imba.SINGLETONS[id]) {
			// FIXME control that it is the same singleton?
			// might collide -- not good?
			return Imba.getTagSingleton(id);
		};
		// look for id - singleton
		
		// need better test here
		if(svgSupport && (dom instanceof SVGElement)) {
			ns = "svg";
			cls = dom.className.baseVal;
		};
		
		if(cls) {
			// there can be several matches here - should choose the last
			// should fall back to less specific later? - otherwise things may fail
			// TODO rework this
			if(m = cls.match(/\b_([a-z\-]+)\b(?!\s*_[a-z\-]+)/)) {
				type = m[1].replace(/-/g,'_');// hmm -should not do that here?
			};
			
			if(m = cls.match(/\b([a-z]+)_\b/)) {
				ns = m[1];
			};
		};
		
		var spawner = IMBA_TAGS[type];
		// console.log("tag for dom?!",ns,type,cls,spawner)
		return (spawner) ? (new spawner(dom)) : (null);
	};
	
	tag$wrap = Imba.getTagForDom;
	// predefine all supported html tags
	
	
	
		
		
		IMBA_TAGS.htmlelement.prototype.__id = {dom: true};
		IMBA_TAGS.htmlelement.prototype.id = function(v){ return this.getAttribute('id'); }
		IMBA_TAGS.htmlelement.prototype.setId = function(v){ this.setAttribute('id',v); return this; };
		
		IMBA_TAGS.htmlelement.prototype.__tabindex = {dom: true};
		IMBA_TAGS.htmlelement.prototype.tabindex = function(v){ return this.getAttribute('tabindex'); }
		IMBA_TAGS.htmlelement.prototype.setTabindex = function(v){ this.setAttribute('tabindex',v); return this; };
		
		IMBA_TAGS.htmlelement.prototype.__title = {dom: true};
		IMBA_TAGS.htmlelement.prototype.title = function(v){ return this.getAttribute('title'); }
		IMBA_TAGS.htmlelement.prototype.setTitle = function(v){ this.setAttribute('title',v); return this; };
		
		IMBA_TAGS.htmlelement.prototype.__role = {dom: true};
		IMBA_TAGS.htmlelement.prototype.role = function(v){ return this.getAttribute('role'); }
		IMBA_TAGS.htmlelement.prototype.setRole = function(v){ this.setAttribute('role',v); return this; };
		
		// def log *params
		// 	console.log(*params)
		// 	self
	;
	
	(function(){
		var tag = Imba.defineTag('fragment',function fragment(d){this.setDom(d)},"htmlelement");
		tag.createNode = function (){
			return global.document.createDocumentFragment();
		};
	
	})();
	
	(function(){
		var tag = Imba.defineTag('a',function a(d){this.setDom(d)});
		
		tag.prototype.__href = {dom: true};
		tag.prototype.href = function(v){ return this.getAttribute('href'); }
		tag.prototype.setHref = function(v){ this.setAttribute('href',v); return this; };
	
	})();
	
	Imba.defineTag('abbr',function abbr(d){this.setDom(d)});
	Imba.defineTag('address',function address(d){this.setDom(d)});
	Imba.defineTag('area',function area(d){this.setDom(d)});
	Imba.defineTag('article',function article(d){this.setDom(d)});
	Imba.defineTag('aside',function aside(d){this.setDom(d)});
	Imba.defineTag('audio',function audio(d){this.setDom(d)});
	Imba.defineTag('b',function b(d){this.setDom(d)});
	Imba.defineTag('base',function base(d){this.setDom(d)});
	Imba.defineTag('bdi',function bdi(d){this.setDom(d)});
	Imba.defineTag('bdo',function bdo(d){this.setDom(d)});
	Imba.defineTag('big',function big(d){this.setDom(d)});
	Imba.defineTag('blockquote',function blockquote(d){this.setDom(d)});
	Imba.defineTag('body',function body(d){this.setDom(d)});
	Imba.defineTag('br',function br(d){this.setDom(d)});
	(function(){
		var tag = Imba.defineTag('button',function button(d){this.setDom(d)});
		
		tag.prototype.__type = {dom: true};
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
		
		tag.prototype.__disabled = {dom: true};
		tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
		tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
	
	})();
	
	Imba.defineTag('canvas',function canvas(d){this.setDom(d)});
	Imba.defineTag('caption',function caption(d){this.setDom(d)});
	Imba.defineTag('cite',function cite(d){this.setDom(d)});
	Imba.defineTag('code',function code(d){this.setDom(d)});
	Imba.defineTag('col',function col(d){this.setDom(d)});
	Imba.defineTag('colgroup',function colgroup(d){this.setDom(d)});
	Imba.defineTag('data',function data(d){this.setDom(d)});
	Imba.defineTag('datalist',function datalist(d){this.setDom(d)});
	Imba.defineTag('dd',function dd(d){this.setDom(d)});
	Imba.defineTag('del',function del(d){this.setDom(d)});
	Imba.defineTag('details',function details(d){this.setDom(d)});
	Imba.defineTag('dfn',function dfn(d){this.setDom(d)});
	Imba.defineTag('div',function div(d){this.setDom(d)});
	Imba.defineTag('dl',function dl(d){this.setDom(d)});
	Imba.defineTag('dt',function dt(d){this.setDom(d)});
	Imba.defineTag('em',function em(d){this.setDom(d)});
	Imba.defineTag('embed',function embed(d){this.setDom(d)});
	Imba.defineTag('fieldset',function fieldset(d){this.setDom(d)});
	Imba.defineTag('figcaption',function figcaption(d){this.setDom(d)});
	Imba.defineTag('figure',function figure(d){this.setDom(d)});
	Imba.defineTag('footer',function footer(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('form',function form(d){this.setDom(d)});
		
		tag.prototype.__method = {dom: true};
		tag.prototype.method = function(v){ return this.getAttribute('method'); }
		tag.prototype.setMethod = function(v){ this.setAttribute('method',v); return this; };
		
		tag.prototype.__action = {dom: true};
		tag.prototype.action = function(v){ return this.getAttribute('action'); }
		tag.prototype.setAction = function(v){ this.setAttribute('action',v); return this; };
	
	})();
	
	Imba.defineTag('h1',function h1(d){this.setDom(d)});
	Imba.defineTag('h2',function h2(d){this.setDom(d)});
	Imba.defineTag('h3',function h3(d){this.setDom(d)});
	Imba.defineTag('h4',function h4(d){this.setDom(d)});
	Imba.defineTag('h5',function h5(d){this.setDom(d)});
	Imba.defineTag('h6',function h6(d){this.setDom(d)});
	Imba.defineTag('head',function head(d){this.setDom(d)});
	Imba.defineTag('header',function header(d){this.setDom(d)});
	Imba.defineTag('hr',function hr(d){this.setDom(d)});
	Imba.defineTag('html',function html(d){this.setDom(d)});
	Imba.defineTag('i',function i(d){this.setDom(d)});
	Imba.defineTag('iframe',function iframe(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('img',function img(d){this.setDom(d)});
		
		tag.prototype.__src = {dom: true};
		tag.prototype.src = function(v){ return this.getAttribute('src'); }
		tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
	
	})();
	
	(function(){
		var tag = Imba.defineTag('input',function input(d){this.setDom(d)});
		
		tag.prototype.__name = {dom: true};
		tag.prototype.name = function(v){ return this.getAttribute('name'); }
		tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
		
		tag.prototype.__type = {dom: true};
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
		
		tag.prototype.__value = {dom: true};
		tag.prototype.value = function(v){ return this.getAttribute('value'); }
		tag.prototype.setValue = function(v){ this.setAttribute('value',v); return this; };// dom property - NOT attribute -- hmm
		
		tag.prototype.__required = {dom: true};
		tag.prototype.required = function(v){ return this.getAttribute('required'); }
		tag.prototype.setRequired = function(v){ this.setAttribute('required',v); return this; };
		
		tag.prototype.__disabled = {dom: true};
		tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
		tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
		
		tag.prototype.__placeholder = {dom: true};
		tag.prototype.placeholder = function(v){ return this.getAttribute('placeholder'); }
		tag.prototype.setPlaceholder = function(v){ this.setAttribute('placeholder',v); return this; };
		
		tag.prototype.value = function (){
			return this.dom().value;
		};
		
		tag.prototype.setValue = function (v){
			this.dom().value = v;
			return this;
		};
	
	})();
	
	Imba.defineTag('ins',function ins(d){this.setDom(d)});
	Imba.defineTag('kbd',function kbd(d){this.setDom(d)});
	Imba.defineTag('keygen',function keygen(d){this.setDom(d)});
	Imba.defineTag('label',function label(d){this.setDom(d)});
	Imba.defineTag('legend',function legend(d){this.setDom(d)});
	Imba.defineTag('li',function li(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('link',function link(d){this.setDom(d)});
		
		tag.prototype.__rel = {dom: true};
		tag.prototype.rel = function(v){ return this.getAttribute('rel'); }
		tag.prototype.setRel = function(v){ this.setAttribute('rel',v); return this; };
		
		tag.prototype.__type = {dom: true};
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
		
		tag.prototype.__href = {dom: true};
		tag.prototype.href = function(v){ return this.getAttribute('href'); }
		tag.prototype.setHref = function(v){ this.setAttribute('href',v); return this; };
		
		tag.prototype.__media = {dom: true};
		tag.prototype.media = function(v){ return this.getAttribute('media'); }
		tag.prototype.setMedia = function(v){ this.setAttribute('media',v); return this; };
	
	})();
	
	Imba.defineTag('main',function main(d){this.setDom(d)});
	Imba.defineTag('map',function map(d){this.setDom(d)});
	Imba.defineTag('mark',function mark(d){this.setDom(d)});
	Imba.defineTag('menu',function menu(d){this.setDom(d)});
	Imba.defineTag('menuitem',function menuitem(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('meta',function meta(d){this.setDom(d)});
		
		tag.prototype.__name = {dom: true};
		tag.prototype.name = function(v){ return this.getAttribute('name'); }
		tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
		
		tag.prototype.__content = {dom: true};
		tag.prototype.content = function(v){ return this.getAttribute('content'); }
		tag.prototype.setContent = function(v){ this.setAttribute('content',v); return this; };
		
		tag.prototype.__charset = {dom: true};
		tag.prototype.charset = function(v){ return this.getAttribute('charset'); }
		tag.prototype.setCharset = function(v){ this.setAttribute('charset',v); return this; };
	
	})();
	
	Imba.defineTag('meter',function meter(d){this.setDom(d)});
	Imba.defineTag('nav',function nav(d){this.setDom(d)});
	Imba.defineTag('noscript',function noscript(d){this.setDom(d)});
	Imba.defineTag('object',function object(d){this.setDom(d)});
	Imba.defineTag('ol',function ol(d){this.setDom(d)});
	Imba.defineTag('optgroup',function optgroup(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('option',function option(d){this.setDom(d)});
		
		tag.prototype.__value = {dom: true};
		tag.prototype.value = function(v){ return this.getAttribute('value'); }
		tag.prototype.setValue = function(v){ this.setAttribute('value',v); return this; };
	
	})();
	
	Imba.defineTag('output',function output(d){this.setDom(d)});
	Imba.defineTag('p',function p(d){this.setDom(d)});
	Imba.defineTag('param',function param(d){this.setDom(d)});
	Imba.defineTag('pre',function pre(d){this.setDom(d)});
	Imba.defineTag('progress',function progress(d){this.setDom(d)});
	Imba.defineTag('q',function q(d){this.setDom(d)});
	Imba.defineTag('rp',function rp(d){this.setDom(d)});
	Imba.defineTag('rt',function rt(d){this.setDom(d)});
	Imba.defineTag('ruby',function ruby(d){this.setDom(d)});
	Imba.defineTag('s',function s(d){this.setDom(d)});
	Imba.defineTag('samp',function samp(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('script',function script(d){this.setDom(d)});
		
		tag.prototype.__src = {dom: true};
		tag.prototype.src = function(v){ return this.getAttribute('src'); }
		tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
		
		tag.prototype.__type = {dom: true};
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
	
	})();
	
	Imba.defineTag('section',function section(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('select',function select(d){this.setDom(d)});
		
		tag.prototype.__multiple = {dom: true};
		tag.prototype.multiple = function(v){ return this.getAttribute('multiple'); }
		tag.prototype.setMultiple = function(v){ this.setAttribute('multiple',v); return this; };
	
	})();
	
	
	Imba.defineTag('small',function small(d){this.setDom(d)});
	Imba.defineTag('source',function source(d){this.setDom(d)});
	Imba.defineTag('span',function span(d){this.setDom(d)});
	Imba.defineTag('strong',function strong(d){this.setDom(d)});
	Imba.defineTag('style',function style(d){this.setDom(d)});
	Imba.defineTag('sub',function sub(d){this.setDom(d)});
	Imba.defineTag('summary',function summary(d){this.setDom(d)});
	Imba.defineTag('sup',function sup(d){this.setDom(d)});
	Imba.defineTag('table',function table(d){this.setDom(d)});
	Imba.defineTag('tbody',function tbody(d){this.setDom(d)});
	Imba.defineTag('td',function td(d){this.setDom(d)});
	
	(function(){
		var tag = Imba.defineTag('textarea',function textarea(d){this.setDom(d)});
		
		tag.prototype.__name = {dom: true};
		tag.prototype.name = function(v){ return this.getAttribute('name'); }
		tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
		
		tag.prototype.__disabled = {dom: true};
		tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
		tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
		
		tag.prototype.__required = {dom: true};
		tag.prototype.required = function(v){ return this.getAttribute('required'); }
		tag.prototype.setRequired = function(v){ this.setAttribute('required',v); return this; };
		
		tag.prototype.__placeholder = {dom: true};
		tag.prototype.placeholder = function(v){ return this.getAttribute('placeholder'); }
		tag.prototype.setPlaceholder = function(v){ this.setAttribute('placeholder',v); return this; };
		
		tag.prototype.__value = {dom: true};
		tag.prototype.value = function(v){ return this.getAttribute('value'); }
		tag.prototype.setValue = function(v){ this.setAttribute('value',v); return this; };
		
		tag.prototype.__rows = {dom: true};
		tag.prototype.rows = function(v){ return this.getAttribute('rows'); }
		tag.prototype.setRows = function(v){ this.setAttribute('rows',v); return this; };
		
		tag.prototype.__cols = {dom: true};
		tag.prototype.cols = function(v){ return this.getAttribute('cols'); }
		tag.prototype.setCols = function(v){ this.setAttribute('cols',v); return this; };
		
		tag.prototype.value = function (){
			return this.dom().value;
		};
		
		tag.prototype.setValue = function (v){
			this.dom().value = v;
			return this;
		};
	
	})();
	
	Imba.defineTag('tfoot',function tfoot(d){this.setDom(d)});
	Imba.defineTag('th',function th(d){this.setDom(d)});
	Imba.defineTag('thead',function thead(d){this.setDom(d)});
	Imba.defineTag('time',function time(d){this.setDom(d)});
	Imba.defineTag('title',function title(d){this.setDom(d)});
	Imba.defineTag('tr',function tr(d){this.setDom(d)});
	Imba.defineTag('track',function track(d){this.setDom(d)});
	Imba.defineTag('u',function u(d){this.setDom(d)});
	Imba.defineTag('ul',function ul(d){this.setDom(d)});
	Imba.defineTag('video',function video(d){this.setDom(d)});
	Imba.defineTag('wbr',function wbr(d){this.setDom(d)});
	
	// for type in Imba.Tag.TYPES_HTML
	// 	# create the tags
	// 	# really? is this the way to create the initializers?! dropping the namespace
	// 	Imba.Tag.NATIVE[type] = do |o,b|
	// 		this.setup(o,b)
	// 		# this.initialize(attrs,body)
	// 
	// for type in Imba.Tag.TYPES_SVG
	// 	# dont add method here? It is probably better to precreate all the types explicitly
	// 	Imba.Tag.NATIVE["svg:{type}"] = type
	// 
	// Should probably predefine the regular 'primitive' types here
	// tag a < htmlelement


}())