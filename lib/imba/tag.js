(function(){
	function idx$(a,b){
		return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
	};
	
	Imba.static = function (items,nr){
		items.static = nr;
		return items;
	};
	
	/*
	This is the baseclass that all tags in imba inherit from.
	@iname node
	*/
	
	Imba.Tag = function Tag(dom){
		this.setDom(dom);
	};
	
	Imba.Tag.createNode = function (){
		throw "Not implemented";
	};
	
	Imba.Tag.build = function (){
		return new this(this.createNode());
	};
	
	Imba.Tag.prototype.object = function(v){ return this._object; }
	Imba.Tag.prototype.setObject = function(v){ this._object = v; return this; };
	
	Imba.Tag.prototype.dom = function (){
		return this._dom;
	};
	
	Imba.Tag.prototype.setDom = function (dom){
		dom._tag = this;
		this._dom = dom;
		return this;
	};
	
	/*
		Setting references for tags like
		`<div@header>` will compile to `tag('div').setRef('header',this).end()`
		By default it adds the reference as a className to the tag.
		@return {self}
		*/
	
	Imba.Tag.prototype.setRef = function (ref,ctx){
		this.flag(this._ref = ref);
		return this;
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
		this.dom().id = id;
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
		throw "Not implemented";
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
		this._dom.textContent = txt == null ? (txt = "") : (txt);
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
		throw "Not implemented";
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
		Called implicitly through Imba.Tag#end, upon creating a tag. All
		properties will have been set before build is called, including
		setContent.
		@return {self}
		*/
	
	Imba.Tag.prototype.build = function (){
		this.render();
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
		end is called it will mark the tag as built and call Imba.Tag#build,
		and call Imba.Tag#commit on subsequent calls.
		@return {self}
		*/
	
	Imba.Tag.prototype.end = function (){
		if (this._built) {
			this.commit();
		} else {
			this._built = true;
			this.build();
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
	
	Imba.Tag.prototype.flags = function (){
		return this._dom.classList;
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
			this._dom.classList.add(name);
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
		Get the scheduler for this node. A new scheduler will be created
		if it does not already exist.
	
		@return {Imba.Scheduler}
		*/
	
	Imba.Tag.prototype.scheduler = function (){
		return this._scheduler == null ? (this._scheduler = new Imba.Scheduler(this)) : (this._scheduler);
	};
	
	/*
	
		Shorthand to start scheduling a node. The method will basically
		proxy the arguments through to scheduler.configure, and then
		activate the scheduler.
		
		@return {self}
		*/
	
	Imba.Tag.prototype.schedule = function (options){
		if(options === undefined) options = {};
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
	
	Imba.Tag.prototype.trigger = function (event,data){
		if(data === undefined) data = {};
		return Imba.Events.trigger(event,this,{data: data});
	};
	
	Imba.Tag.prototype.setTransform = function (value){
		this.css('transform',value);
		return this;
	};
	
	Imba.Tag.prototype.transform = function (){
		return this.css('transform');
	};
	
	Imba.Tag.prototype.setStyle = function (style){
		this.setAttribute('style',style);
		return this;
	};
	
	Imba.Tag.prototype.style = function (){
		return this.getAttribute('style');
	};
	
	Imba.Tag.prototype.toString = function (){
		return this.dom().outerHTML;
	};
	
	
	Imba.Tag.prototype.initialize = Imba.Tag;
	
	HTML_TAGS = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");
	HTML_TAGS_UNSAFE = "article aside header section".split(" ");
	SVG_TAGS = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");
	
	
	function extender(obj,sup){
		for (var i = 0, keys = Object.keys(sup), l = keys.length; i < l; i++){
			obj[($1 = keys[i])] == null ? (obj[$1] = sup[keys[i]]) : (obj[$1]);
		};
		
		obj.prototype = Object.create(sup.prototype);
		obj.__super__ = obj.prototype.__super__ = sup.prototype;
		obj.prototype.initialize = obj.prototype.constructor = obj;
		if (sup.inherit) { sup.inherit(obj) };
		return obj;
	};
	
	function Tag(){
		return function(dom) {
			this.setDom(dom);
			return this;
		};
	};
	
	function TagSpawner(type){
		return function() { return type.build(); };
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
		return this[name.toUpperCase()] || this.defineNamespace(name);
	};
	
	Imba.Tags.prototype.defineNamespace = function (name){
		var clone = Object.create(this);
		clone._parent = this;
		clone._ns = name;
		this[name.toUpperCase()] = clone;
		return clone;
	};
	
	Imba.Tags.prototype.baseType = function (name){
		return idx$(name,HTML_TAGS) >= 0 ? ('htmlelement') : ('div');
	};
	
	Imba.Tags.prototype.defineTag = function (name,supr,body){
		if(body==undefined && typeof supr == 'function') body = supr,supr = '';
		if(supr==undefined) supr = '';
		supr || (supr = this.baseType(name));
		var supertype = this[supr];
		var tagtype = Tag();
		var norm = name.replace(/\-/g,'_');
		
		
		tagtype._name = name;
		extender(tagtype,supertype);
		
		if (name[0] == '#') {
			this[name] = tagtype;
			Imba.SINGLETONS[name.slice(1)] = tagtype;
		} else {
			this[name] = tagtype;
			this['$' + norm] = TagSpawner(tagtype);
		};
		
		if (body) {
			if (body.length == 2) {
				// create clone
				if (!tagtype.hasOwnProperty('TAGS')) {
					tagtype.TAGS = (supertype.TAGS || this).__clone();
				};
			};
			
			body.call(tagtype,tagtype,tagtype.TAGS || this);
		};
		
		return tagtype;
	};
	
	Imba.Tags.prototype.defineSingleton = function (name,supr,body){
		return this.defineTag(name,supr,body);
	};
	
	Imba.Tags.prototype.extendTag = function (name,supr,body){
		if(body==undefined && typeof supr == 'function') body = supr,supr = '';
		if(supr==undefined) supr = '';
		var klass = ((typeof name=='string'||name instanceof String) ? (this[name]) : (name));
		// allow for private tags here as well?
		if (body) { body && body.call(klass,klass,klass.prototype) };
		return klass;
	};
	
	
	Imba.TAGS = new Imba.Tags();
	Imba.TAGS.element = Imba.Tag;
	
	var svg = Imba.TAGS.defineNamespace('svg');
	
	svg.baseType = function (name){
		return 'svgelement';
	};
	
	
	Imba.SINGLETONS = {};
	
	
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
	
	Imba.tag = function (name){
		var typ = Imba.TAGS[name];
		if (!typ) { throw new Error(("tag " + name + " is not defined")) };
		return new typ(typ.createNode());
	};
	
	Imba.tagWithId = function (name,id){
		var typ = Imba.TAGS[name];
		if (!typ) { throw new Error(("tag " + name + " is not defined")) };
		var dom = typ.createNode();
		dom.id = id;
		return new typ(dom);
	};
	
	// TODO: Can we move these out and into dom.imba in a clean way?
	// These methods depends on Imba.document.getElementById
	
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
			tags = tags.SVG;
		};
		
		var spawner;
		
		if (cls) {
			// there can be several matches here - should choose the last
			// should fall back to less specific later? - otherwise things may fail
			// TODO rework this
			if (m = cls.match(/\b_([a-z\-]+)\b(?!\s*_[a-z\-]+)/)) {
				type = m[1]; // .replace(/-/g,'_')
			};
			
			if (m = cls.match(/\b([A-Z\-]+)_\b/)) {
				ns = m[1];
			};
		};
		
		
		spawner = tags[type] || tags[native$];
		return spawner ? (new spawner(dom).awaken(dom)) : (null);
	};
	
	tag$ = Imba.TAGS;
	t$ = Imba.tag;
	tc$ = Imba.tagWithFlags;
	ti$ = Imba.tagWithId;
	tic$ = Imba.tagWithIdAndFlags;
	id$ = Imba.getTagSingleton;
	return tag$wrap = Imba.getTagForDom;
	

})()