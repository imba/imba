/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	(function(){
		
		if (typeof Imba === 'undefined') {
			__webpack_require__(1);
			__webpack_require__(2);
			__webpack_require__(3);
			__webpack_require__(4);
			__webpack_require__(5);
			__webpack_require__(6);
			__webpack_require__(7);
			
			if (false) {
				require('./dom.server');
			};
			
			if (true) {
				__webpack_require__(8);
				__webpack_require__(9);
				__webpack_require__(10);
			};
			
			return __webpack_require__(11);
		} else {
			return console.warn(("Imba v" + (Imba.VERSION) + " is already loaded"));
		};

	})()

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {(function(){
		if (typeof window !== 'undefined') {
			// should not go there
			global = window;
		};
		
		var isClient = (typeof window == 'object' && this == window);
		/*
		Imba is the namespace for all runtime related utilities
		@namespace
		*/
		
		Imba = {
			VERSION: '0.14.3',
			CLIENT: isClient,
			SERVER: !(isClient),
			DEBUG: false
		};
		
		var reg = /-./g;
		
		/*
		True if running in client environment.
		@return {bool}
		*/
		
		Imba.isClient = function (){
			return (true) == true;
		};
		
		/*
		True if running in server environment.
		@return {bool}
		*/
		
		Imba.isServer = function (){
			return (false) == true;
		};
		
		Imba.subclass = function (obj,sup){
			;
			for (var k in sup){
				if (sup.hasOwnProperty(k)) { obj[k] = sup[k] };
			};
			
			obj.prototype = Object.create(sup.prototype);
			obj.__super__ = obj.prototype.__super__ = sup.prototype;
			obj.prototype.initialize = obj.prototype.constructor = obj;
			return obj;
		};
		
		/*
		Lightweight method for making an object iterable in imbas for/in loops.
		If the compiler cannot say for certain that a target in a for loop is an
		array, it will cache the iterable version before looping.
		
		```imba
		# this is the whole method
		def Imba.iterable o
			return o ? (o:toArray ? o.toArray : o) : []
		
		class CustomIterable
			def toArray
				[1,2,3]
		
		# will return [2,4,6]
		for x in CustomIterable.new
			x * 2
		
		```
		*/
		
		Imba.iterable = function (o){
			return o ? ((o.toArray ? (o.toArray()) : (o))) : ([]);
		};
		
		/*
		Coerces a value into a promise. If value is array it will
		call `Promise.all(value)`, or if it is not a promise it will
		wrap the value in `Promise.resolve(value)`. Used for experimental
		await syntax.
		@return {Promise}
		*/
		
		Imba.await = function (value){
			if (value instanceof Array) {
				return Promise.all(value);
			} else if (value && value.then) {
				return value;
			} else {
				return Promise.resolve(value);
			};
		};
		
		Imba.toCamelCase = function (str){
			return str.replace(reg,function(m) { return m.charAt(1).toUpperCase(); });
		};
		
		Imba.toCamelCase = function (str){
			return str.replace(reg,function(m) { return m.charAt(1).toUpperCase(); });
		};
		
		Imba.indexOf = function (a,b){
			return (b && b.indexOf) ? (b.indexOf(a)) : ([].indexOf.call(a,b));
		};
		
		Imba.prop = function (scope,name,opts){
			if (scope.defineProperty) {
				return scope.defineProperty(name,opts);
			};
			return;
		};
		
		return Imba.attr = function (scope,name,opts){
			if (scope.defineAttribute) {
				return scope.defineAttribute(name,opts);
			};
			
			var getName = Imba.toCamelCase(name);
			var setName = Imba.toCamelCase('set-' + name);
			
			scope.prototype[getName] = function() {
				return this.getAttribute(name);
			};
			
			scope.prototype[setName] = function(value) {
				this.setAttribute(name,value);
				return this;
			};
			
			return;
		};

	})()
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 2 */
/***/ function(module, exports) {

	(function(){
		
		
		function emit__(event,args,node){
			// var node = cbs[event]
			var prev,cb,ret;
			
			while ((prev = node) && (node = node.next)){
				if (cb = node.listener) {
					if (node.path && cb[node.path]) {
						ret = args ? (cb[node.path].apply(cb,args)) : (cb[node.path]());
					} else {
						// check if it is a method?
						ret = args ? (cb.apply(node,args)) : (cb.call(node));
					};
				};
				
				if (node.times && --node.times <= 0) {
					prev.next = node.next;
					node.listener = null;
				};
			};
			return;
		};
		
		// method for registering a listener on object
		Imba.listen = function (obj,event,listener,path){
			var $1;
			var cbs,list,tail;
			cbs = obj.__listeners__ || (obj.__listeners__ = {});
			list = cbs[($1 = event)] || (cbs[$1] = {});
			tail = list.tail || (list.tail = (list.next = {}));
			tail.listener = listener;
			tail.path = path;
			list.tail = tail.next = {};
			return tail;
		};
		
		Imba.once = function (obj,event,listener){
			var tail = Imba.listen(obj,event,listener);
			tail.times = 1;
			return tail;
		};
		
		Imba.unlisten = function (obj,event,cb,meth){
			var node,prev;
			var meta = obj.__listeners__;
			if (!(meta)) { return };
			
			if (node = meta[event]) {
				while ((prev = node) && (node = node.next)){
					if (node == cb || node.listener == cb) {
						prev.next = node.next;
						// check for correct path as well?
						node.listener = null;
						break;
					};
				};
			};
			return;
		};
		
		Imba.emit = function (obj,event,params){
			var cb;
			if (cb = obj.__listeners__) {
				if (cb[event]) { emit__(event,params,cb[event]) };
				if (cb.all) { emit__(event,[event,params],cb.all) }; // and event != 'all'
			};
			return;
		};
		
		return Imba.observeProperty = function (observer,key,trigger,target,prev){
			if (prev && typeof prev == 'object') {
				Imba.unlisten(prev,'all',observer,trigger);
			};
			if (target && typeof target == 'object') {
				Imba.listen(target,'all',observer,trigger);
			};
			return this;
		};

	})()

/***/ },
/* 3 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {(function(){
		function idx$(a,b){
			return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
		};
		
		
		var raf; // very simple raf polyfill
		raf || (raf = global.requestAnimationFrame);
		raf || (raf = global.webkitRequestAnimationFrame);
		raf || (raf = global.mozRequestAnimationFrame);
		raf || (raf = function(blk) { return setTimeout(blk,1000 / 60); });
		
		Imba.tick = function (d){
			if (this._scheduled) { raf(Imba.ticker()) };
			Imba.Scheduler.willRun();
			this.emit(this,'tick',[d]);
			Imba.Scheduler.didRun();
			return;
		};
		
		Imba.ticker = function (){
			var self = this;
			return self._ticker || (self._ticker = function(e) { return self.tick(e); });
		};
		
		/*
		
		Global alternative to requestAnimationFrame. Schedule a target
		to tick every frame. You can specify which method to call on the
		target (defaults to tick).
		
		*/
		
		Imba.schedule = function (target,method){
			if(method === undefined) method = 'tick';
			this.listen(this,'tick',target,method);
			// start scheduling now if this was the first one
			if (!this._scheduled) {
				this._scheduled = true;
				raf(Imba.ticker());
			};
			return this;
		};
		
		/*
		
		Unschedule a previously scheduled target
		
		*/
		
		Imba.unschedule = function (target,method){
			this.unlisten(this,'tick',target,method);
			var cbs = this.__listeners__ || (this.__listeners__ = {});
			if (!cbs.tick || !cbs.tick.next || !cbs.tick.next.listener) {
				this._scheduled = false;
			};
			return this;
		};
		
		/*
		
		Light wrapper around native setTimeout that expects the block / function
		as last argument (instead of first). It also triggers an event to Imba
		after the timeout to let schedulers update (to rerender etc) afterwards.
		
		*/
		
		Imba.setTimeout = function (delay,block){
			return setTimeout(function() {
				block();
				return Imba.Scheduler.markDirty();
				// Imba.emit(Imba,'timeout',[block])
			},delay);
		};
		
		/*
		
		Light wrapper around native setInterval that expects the block / function
		as last argument (instead of first). It also triggers an event to Imba
		after every interval to let schedulers update (to rerender etc) afterwards.
		
		*/
		
		Imba.setInterval = function (interval,block){
			return setInterval(function() {
				block();
				return Imba.Scheduler.markDirty();
				// Imba.emit(Imba,'interval',[block])
			},interval);
		};
		
		/*
		Clear interval with specified id
		*/
		
		Imba.clearInterval = function (interval){
			return clearInterval(interval);
		};
		
		/*
		Clear timeout with specified id
		*/
		
		Imba.clearTimeout = function (timeout){
			return clearTimeout(timeout);
		};
		
		// should add an Imba.run / setImmediate that
		// pushes listener onto the tick-queue with times - once
		
		
		/*
		
		Instances of Imba.Scheduler manages when to call `tick()` on their target,
		at a specified framerate or when certain events occur. Root-nodes in your
		applications will usually have a scheduler to make sure they rerender when
		something changes. It is also possible to make inner components use their
		own schedulers to control when they render.
		
		@iname scheduler
		
		*/
		
		Imba.Scheduler = function Scheduler(target){
			var self = this;
			self._target = target;
			self._marked = false;
			self._active = false;
			self._marker = function() { return self.mark(); };
			self._ticker = function(e) { return self.tick(e); };
			
			self._events = true;
			self._fps = 1;
			
			self._dt = 0;
			self._timestamp = 0;
			self._ticks = 0;
			self._flushes = 0;
		};
		
		Imba.Scheduler.markDirty = function (){
			this._dirty = true;
			return this;
		};
		
		Imba.Scheduler.isDirty = function (){
			return !(!this._dirty);
		};
		
		Imba.Scheduler.willRun = function (){
			return this._active = true;
		};
		
		Imba.Scheduler.didRun = function (){
			this._active = false;
			return this._dirty = false;
		};
		
		Imba.Scheduler.isActive = function (){
			return !(!this._active);
		};
		
		/*
			Create a new Imba.Scheduler for specified target
			@return {Imba.Scheduler}
			*/
		
		/*
			Check whether the current scheduler is active or not
			@return {bool}
			*/
		
		Imba.Scheduler.prototype.active = function (){
			return this._active;
		};
		
		/*
			Delta time between the two last ticks
			@return {Number}
			*/
		
		Imba.Scheduler.prototype.dt = function (){
			return this._dt;
		};
		
		/*
			Configure the scheduler
			@return {self}
			*/
		
		Imba.Scheduler.prototype.configure = function (pars){
			if(!pars||pars.constructor !== Object) pars = {};
			var fps = pars.fps !== undefined ? pars.fps : 1;
			var events = pars.events !== undefined ? pars.events : true;
			if (events != null) { this._events = events };
			if (fps != null) { this._fps = fps };
			return this;
		};
		
		/*
			Mark the scheduler as dirty. This will make sure that
			the scheduler calls `target.tick` on the next frame
			@return {self}
			*/
		
		Imba.Scheduler.prototype.mark = function (){
			this._marked = true;
			return this;
		};
		
		/*
			Instantly trigger target.tick and mark scheduler as clean (not dirty/marked).
			This is called implicitly from tick, but can also be called manually if you
			really want to force a tick without waiting for the next frame.
			@return {self}
			*/
		
		Imba.Scheduler.prototype.flush = function (){
			this._marked = false;
			this._flushes++;
			this._target.tick();
			return this;
		};
		
		/*
			@fixme this expects raf to run at 60 fps 
		
			Called automatically on every frame while the scheduler is active.
			It will only call `target.tick` if the scheduler is marked dirty,
			or when according to @fps setting.
		
			If you have set up a scheduler with an fps of 1, tick will still be
			called every frame, but `target.tick` will only be called once every
			second, and it will *make sure* each `target.tick` happens in separate
			seconds according to Date. So if you have a node that renders a clock
			based on Date.now (or something similar), you can schedule it with 1fps,
			never needing to worry about two ticks happening within the same second.
			The same goes for 4fps, 10fps etc.
		
			@protected
			@return {self}
			*/
		
		Imba.Scheduler.prototype.tick = function (delta){
			this._ticks++;
			this._dt = delta;
			
			var fps = this._fps;
			
			if (fps == 60) {
				this._marked = true;
			} else if (fps == 30) {
				if (this._ticks % 2) { this._marked = true };
			} else if (fps) {
				// if it is less round - we trigger based
				// on date, for consistent rendering.
				// ie, if you want to render every second
				// it is important that no two renders
				// happen during the same second (according to Date)
				var period = ((60 / fps) / 60) * 1000;
				var beat = Math.floor(Date.now() / period);
				
				if (this._beat != beat) {
					this._beat = beat;
					this._marked = true;
				};
			};
			
			if (this._marked || (this._events && Imba.Scheduler.isDirty())) this.flush();
			// reschedule if @active
			return this;
		};
		
		/*
			Start the scheduler if it is not already active.
			**While active**, the scheduler will override `target.commit`
			to do nothing. By default Imba.tag#commit calls render, so
			that rendering is cascaded through to children when rendering
			a node. When a scheduler is active (for a node), Imba disables
			this automatic rendering.
			*/
		
		Imba.Scheduler.prototype.activate = function (){
			if (!this._active) {
				this._active = true;
				// override target#commit while this is active
				this._commit = this._target.commit;
				this._target.commit = function() { return this; };
				Imba.schedule(this);
				if (this._events) { Imba.listen(Imba,'event',this,'onevent') };
				this._target && this._target.flag  &&  this._target.flag('scheduled_');
				this.tick(0); // start ticking
			};
			return this;
		};
		
		/*
			Stop the scheduler if it is active.
			*/
		
		Imba.Scheduler.prototype.deactivate = function (){
			if (this._active) {
				this._active = false;
				this._target.commit = this._commit;
				Imba.unschedule(this);
				Imba.unlisten(Imba,'event',this);
				this._target && this._target.unflag  &&  this._target.unflag('scheduled_');
			};
			return this;
		};
		
		Imba.Scheduler.prototype.track = function (){
			return this._marker;
		};
		
		Imba.Scheduler.prototype.onevent = function (event){
			var $1;
			if (this._marked) { return this };
			
			if (this._events instanceof Function) {
				if (this._events(event)) this.mark();
			} else if (this._events instanceof Array) {
				if (idx$(($1 = event) && $1.type  &&  $1.type(),this._events) >= 0) this.mark();
			} else if (this._events) {
				if (event._responder) this.mark();
			};
			return this;
		};
		return Imba.Scheduler;
	
	})()
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 4 */
/***/ function(module, exports) {

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
			if (arguments.length == 2 && !(toggler)) {
				this._dom.classList.remove(name);
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
		
		Imba.Tag.prototype.setTransform = function (value){
			this.css('transform',value);
			return this;
		};
		
		Imba.Tag.prototype.transform = function (){
			return this.css('transform');
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
			if (!(typ)) { throw new Error(("tag " + name + " is not defined")) };
			return new typ(typ.createNode());
		};
		
		Imba.tagWithId = function (name,id){
			var typ = Imba.TAGS[name];
			if (!(typ)) { throw new Error(("tag " + name + " is not defined")) };
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
			if (!(dom)) { return null };
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

/***/ },
/* 5 */
/***/ function(module, exports) {

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
			
			tag.prototype.id = function(v){ return this.getAttribute('id'); }
			tag.prototype.setId = function(v){ this.setAttribute('id',v); return this; };
			tag.prototype.tabindex = function(v){ return this.getAttribute('tabindex'); }
			tag.prototype.setTabindex = function(v){ this.setAttribute('tabindex',v); return this; };
			tag.prototype.title = function(v){ return this.getAttribute('title'); }
			tag.prototype.setTitle = function(v){ this.setAttribute('title',v); return this; };
			tag.prototype.role = function(v){ return this.getAttribute('role'); }
			tag.prototype.setRole = function(v){ this.setAttribute('role',v); return this; };
			
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
				
				if (!(dataset)) {
					dataset = {};
					for (var i = 0, ary = iter$(this.dom().attributes), len = ary.length, atr; i < len; i++) {
						atr = ary[i];
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
				if (fn = (this._dom.matches || this._dom.matchesSelector || this._dom.webkitMatchesSelector || this._dom.msMatchesSelector || this._dom.mozMatchesSelector)) {
					return fn.call(this._dom,sel);
				};
			};
			
			/*
				Get the first element matching supplied selector / filter
				traversing upwards, but including the node itself.
				@return {Imba.Tag}
				*/
			
			tag.prototype.closest = function (sel){
				if (!(sel)) { return this.parent() }; // should return self?!
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
				if (!(sel)) { return this.parent() };
				return this.parent() && this.parent().closest(sel);
			};
			
			tag.prototype.path = function (sel){
				var node = this;
				var nodes = [];
				if (sel && sel.query) { sel = sel.query() };
				
				while (node){
					if (!(sel) || node.matches(sel)) { nodes.push(node) };
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
				return nodes.filter(function(n) { return n != self && (!(sel) || n.matches(sel)); });
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
					node = (tag$.$fragment().setContent(node,0).end());
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
				if (!(item)) { return this };
				
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
		
		return tag$.defineTag('svgelement', 'htmlelement');
	
	})()

/***/ },
/* 6 */
/***/ function(module, exports) {

	(function(){
		
		// predefine all supported html tags
		tag$.defineTag('fragment', 'htmlelement', function(tag){
			
			tag.createNode = function (){
				return Imba.document().createDocumentFragment();
			};
		});
		
		tag$.defineTag('a', function(tag){
			tag.prototype.href = function(v){ return this.getAttribute('href'); }
			tag.prototype.setHref = function(v){ this.setAttribute('href',v); return this; };
		});
		
		tag$.defineTag('abbr');
		tag$.defineTag('address');
		tag$.defineTag('area');
		tag$.defineTag('article');
		tag$.defineTag('aside');
		tag$.defineTag('audio');
		tag$.defineTag('b');
		tag$.defineTag('base');
		tag$.defineTag('bdi');
		tag$.defineTag('bdo');
		tag$.defineTag('big');
		tag$.defineTag('blockquote');
		tag$.defineTag('body');
		tag$.defineTag('br');
		
		tag$.defineTag('button', function(tag){
			tag.prototype.autofocus = function(v){ return this.getAttribute('autofocus'); }
			tag.prototype.setAutofocus = function(v){ this.setAttribute('autofocus',v); return this; };
			tag.prototype.type = function(v){ return this.getAttribute('type'); }
			tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
			tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
			tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
		});
		
		tag$.defineTag('canvas', function(tag){
			tag.prototype.setWidth = function (val){
				if (this.width() != val) { this.dom().width = val };
				return this;
			};
			
			tag.prototype.setHeight = function (val){
				if (this.height() != val) { this.dom().height = val };
				return this;
			};
			
			tag.prototype.width = function (){
				return this.dom().width;
			};
			
			tag.prototype.height = function (){
				return this.dom().height;
			};
			
			tag.prototype.context = function (type){
				if(type === undefined) type = '2d';
				return this.dom().getContext(type);
			};
		});
		
		tag$.defineTag('caption');
		tag$.defineTag('cite');
		tag$.defineTag('code');
		tag$.defineTag('col');
		tag$.defineTag('colgroup');
		tag$.defineTag('data');
		tag$.defineTag('datalist');
		tag$.defineTag('dd');
		tag$.defineTag('del');
		tag$.defineTag('details');
		tag$.defineTag('dfn');
		tag$.defineTag('div');
		tag$.defineTag('dl');
		tag$.defineTag('dt');
		tag$.defineTag('em');
		tag$.defineTag('embed');
		tag$.defineTag('fieldset');
		tag$.defineTag('figcaption');
		tag$.defineTag('figure');
		tag$.defineTag('footer');
		
		tag$.defineTag('form', function(tag){
			tag.prototype.method = function(v){ return this.getAttribute('method'); }
			tag.prototype.setMethod = function(v){ this.setAttribute('method',v); return this; };
			tag.prototype.action = function(v){ return this.getAttribute('action'); }
			tag.prototype.setAction = function(v){ this.setAttribute('action',v); return this; };
		});
		
		tag$.defineTag('h1');
		tag$.defineTag('h2');
		tag$.defineTag('h3');
		tag$.defineTag('h4');
		tag$.defineTag('h5');
		tag$.defineTag('h6');
		tag$.defineTag('head');
		tag$.defineTag('header');
		tag$.defineTag('hr');
		tag$.defineTag('html');
		tag$.defineTag('i');
		
		tag$.defineTag('iframe', function(tag){
			tag.prototype.src = function(v){ return this.getAttribute('src'); }
			tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
		});
		
		tag$.defineTag('img', function(tag){
			tag.prototype.src = function(v){ return this.getAttribute('src'); }
			tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
		});
		
		tag$.defineTag('input', function(tag){
			// can use attr instead
			tag.prototype.name = function(v){ return this.getAttribute('name'); }
			tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
			tag.prototype.type = function(v){ return this.getAttribute('type'); }
			tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
			tag.prototype.required = function(v){ return this.getAttribute('required'); }
			tag.prototype.setRequired = function(v){ this.setAttribute('required',v); return this; };
			tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
			tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
			tag.prototype.autofocus = function(v){ return this.getAttribute('autofocus'); }
			tag.prototype.setAutofocus = function(v){ this.setAttribute('autofocus',v); return this; };
			
			tag.prototype.value = function (){
				return this.dom().value;
			};
			
			tag.prototype.setValue = function (v){
				if (v != this.dom().value) { this.dom().value = v };
				return this;
			};
			
			tag.prototype.setPlaceholder = function (v){
				if (v != this.dom().placeholder) { this.dom().placeholder = v };
				return this;
			};
			
			tag.prototype.placeholder = function (){
				return this.dom().placeholder;
			};
			
			tag.prototype.checked = function (){
				return this.dom().checked;
			};
			
			tag.prototype.setChecked = function (bool){
				if (bool != this.dom().checked) { this.dom().checked = bool };
				return this;
			};
		});
		
		tag$.defineTag('ins');
		tag$.defineTag('kbd');
		tag$.defineTag('keygen');
		tag$.defineTag('label');
		tag$.defineTag('legend');
		tag$.defineTag('li');
		
		tag$.defineTag('link', function(tag){
			tag.prototype.rel = function(v){ return this.getAttribute('rel'); }
			tag.prototype.setRel = function(v){ this.setAttribute('rel',v); return this; };
			tag.prototype.type = function(v){ return this.getAttribute('type'); }
			tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
			tag.prototype.href = function(v){ return this.getAttribute('href'); }
			tag.prototype.setHref = function(v){ this.setAttribute('href',v); return this; };
			tag.prototype.media = function(v){ return this.getAttribute('media'); }
			tag.prototype.setMedia = function(v){ this.setAttribute('media',v); return this; };
		});
		
		tag$.defineTag('main');
		tag$.defineTag('map');
		tag$.defineTag('mark');
		tag$.defineTag('menu');
		tag$.defineTag('menuitem');
		
		tag$.defineTag('meta', function(tag){
			tag.prototype.name = function(v){ return this.getAttribute('name'); }
			tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
			tag.prototype.content = function(v){ return this.getAttribute('content'); }
			tag.prototype.setContent = function(v){ this.setAttribute('content',v); return this; };
			tag.prototype.charset = function(v){ return this.getAttribute('charset'); }
			tag.prototype.setCharset = function(v){ this.setAttribute('charset',v); return this; };
		});
		
		tag$.defineTag('meter');
		tag$.defineTag('nav');
		tag$.defineTag('noscript');
		tag$.defineTag('object');
		tag$.defineTag('ol');
		tag$.defineTag('optgroup');
		
		tag$.defineTag('option', function(tag){
			tag.prototype.value = function(v){ return this.getAttribute('value'); }
			tag.prototype.setValue = function(v){ this.setAttribute('value',v); return this; };
		});
		
		tag$.defineTag('output');
		tag$.defineTag('p');
		tag$.defineTag('param');
		tag$.defineTag('pre');
		tag$.defineTag('progress');
		tag$.defineTag('q');
		tag$.defineTag('rp');
		tag$.defineTag('rt');
		tag$.defineTag('ruby');
		tag$.defineTag('s');
		tag$.defineTag('samp');
		
		tag$.defineTag('script', function(tag){
			tag.prototype.src = function(v){ return this.getAttribute('src'); }
			tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
			tag.prototype.type = function(v){ return this.getAttribute('type'); }
			tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
			tag.prototype.async = function(v){ return this.getAttribute('async'); }
			tag.prototype.setAsync = function(v){ this.setAttribute('async',v); return this; };
			tag.prototype.defer = function(v){ return this.getAttribute('defer'); }
			tag.prototype.setDefer = function(v){ this.setAttribute('defer',v); return this; };
		});
		
		tag$.defineTag('section');
		
		tag$.defineTag('select', function(tag){
			tag.prototype.name = function(v){ return this.getAttribute('name'); }
			tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
			tag.prototype.multiple = function(v){ return this.getAttribute('multiple'); }
			tag.prototype.setMultiple = function(v){ this.setAttribute('multiple',v); return this; };
			tag.prototype.required = function(v){ return this.getAttribute('required'); }
			tag.prototype.setRequired = function(v){ this.setAttribute('required',v); return this; };
			tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
			tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
			
			tag.prototype.value = function (){
				return this.dom().value;
			};
			
			tag.prototype.setValue = function (v){
				if (v != this.dom().value) { this.dom().value = v };
				return this;
			};
		});
		
		
		tag$.defineTag('small');
		tag$.defineTag('source');
		tag$.defineTag('span');
		tag$.defineTag('strong');
		tag$.defineTag('style');
		tag$.defineTag('sub');
		tag$.defineTag('summary');
		tag$.defineTag('sup');
		tag$.defineTag('table');
		tag$.defineTag('tbody');
		tag$.defineTag('td');
		
		tag$.defineTag('textarea', function(tag){
			tag.prototype.name = function(v){ return this.getAttribute('name'); }
			tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
			tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
			tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
			tag.prototype.required = function(v){ return this.getAttribute('required'); }
			tag.prototype.setRequired = function(v){ this.setAttribute('required',v); return this; };
			tag.prototype.rows = function(v){ return this.getAttribute('rows'); }
			tag.prototype.setRows = function(v){ this.setAttribute('rows',v); return this; };
			tag.prototype.cols = function(v){ return this.getAttribute('cols'); }
			tag.prototype.setCols = function(v){ this.setAttribute('cols',v); return this; };
			tag.prototype.autofocus = function(v){ return this.getAttribute('autofocus'); }
			tag.prototype.setAutofocus = function(v){ this.setAttribute('autofocus',v); return this; };
			
			tag.prototype.value = function (){
				return this.dom().value;
			};
			
			tag.prototype.setValue = function (v){
				if (v != this.dom().value) { this.dom().value = v };
				return this;
			};
			
			tag.prototype.setPlaceholder = function (v){
				if (v != this.dom().placeholder) { this.dom().placeholder = v };
				return this;
			};
			
			tag.prototype.placeholder = function (){
				return this.dom().placeholder;
			};
		});
		
		tag$.defineTag('tfoot');
		tag$.defineTag('th');
		tag$.defineTag('thead');
		tag$.defineTag('time');
		tag$.defineTag('title');
		tag$.defineTag('tr');
		tag$.defineTag('track');
		tag$.defineTag('u');
		tag$.defineTag('ul');
		tag$.defineTag('video');
		return tag$.defineTag('wbr');
	
	})()

/***/ },
/* 7 */
/***/ function(module, exports) {

	(function(){
		function idx$(a,b){
			return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
		};
		
		
		tag$.SVG.defineTag('svgelement', function(tag){
			
			tag.namespaceURI = function (){
				return "http://www.w3.org/2000/svg";
			};
			
			var types = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");
			
			tag.buildNode = function (){
				var dom = Imba.document().createElementNS(this.namespaceURI(),this._nodeType);
				var cls = this._classes.join(" ");
				if (cls) { dom.className.baseVal = cls };
				return dom;
			};
			
			tag.inherit = function (child){
				child._protoDom = null;
				
				if (idx$(child._name,types) >= 0) {
					child._nodeType = child._name;
					return child._classes = [];
				} else {
					child._nodeType = this._nodeType;
					var className = "_" + child._name.replace(/_/g,'-');
					return child._classes = this._classes.concat(className);
				};
			};
			
			
			Imba.attr(tag,'x');
			Imba.attr(tag,'y');
			
			Imba.attr(tag,'width');
			Imba.attr(tag,'height');
			
			Imba.attr(tag,'stroke');
			Imba.attr(tag,'stroke-width');
		});
		
		tag$.SVG.defineTag('svg', function(tag){
			Imba.attr(tag,'viewbox');
		});
		
		tag$.SVG.defineTag('g');
		
		tag$.SVG.defineTag('defs');
		
		tag$.SVG.defineTag('symbol', function(tag){
			Imba.attr(tag,'preserveAspectRatio');
			Imba.attr(tag,'viewBox');
		});
		
		tag$.SVG.defineTag('marker', function(tag){
			Imba.attr(tag,'markerUnits');
			Imba.attr(tag,'refX');
			Imba.attr(tag,'refY');
			Imba.attr(tag,'markerWidth');
			Imba.attr(tag,'markerHeight');
			Imba.attr(tag,'orient');
		});
		
		
		// Basic shapes
		
		tag$.SVG.defineTag('rect', function(tag){
			Imba.attr(tag,'rx');
			Imba.attr(tag,'ry');
		});
		
		tag$.SVG.defineTag('circle', function(tag){
			Imba.attr(tag,'cx');
			Imba.attr(tag,'cy');
			Imba.attr(tag,'r');
		});
		
		tag$.SVG.defineTag('ellipse', function(tag){
			Imba.attr(tag,'cx');
			Imba.attr(tag,'cy');
			Imba.attr(tag,'rx');
			Imba.attr(tag,'ry');
		});
		
		tag$.SVG.defineTag('path', function(tag){
			Imba.attr(tag,'d');
			Imba.attr(tag,'pathLength');
		});
		
		tag$.SVG.defineTag('line', function(tag){
			Imba.attr(tag,'x1');
			Imba.attr(tag,'x2');
			Imba.attr(tag,'y1');
			Imba.attr(tag,'y2');
		});
		
		tag$.SVG.defineTag('polyline', function(tag){
			Imba.attr(tag,'points');
		});
		
		tag$.SVG.defineTag('polygon', function(tag){
			Imba.attr(tag,'points');
		});
		
		tag$.SVG.defineTag('text', function(tag){
			Imba.attr(tag,'dx');
			Imba.attr(tag,'dy');
			Imba.attr(tag,'text-anchor');
			Imba.attr(tag,'rotate');
			Imba.attr(tag,'textLength');
			Imba.attr(tag,'lengthAdjust');
		});
		
		return tag$.SVG.defineTag('tspan', function(tag){
			Imba.attr(tag,'dx');
			Imba.attr(tag,'dy');
			Imba.attr(tag,'rotate');
			Imba.attr(tag,'textLength');
			Imba.attr(tag,'lengthAdjust');
		});

	})()

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	(function(){
		function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
		// Extending Imba.Tag#css to work without prefixes by inspecting
		// the properties of a CSSStyleDeclaration and creating a map
		
		// var prefixes = ['-webkit-','-ms-','-moz-','-o-','-blink-']
		// var props = ['transform','transition','animation']
		
		if (true) {
			var styles = window.getComputedStyle(document.documentElement,'');
			
			Imba.CSSKeyMap = {};
			
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
			
			tag$.extendTag('element', function(tag){
				
				// override the original css method
				tag.prototype.css = function (key,val){
					if (key instanceof Object) {
						for (var i = 0, keys = Object.keys(key), l = keys.length; i < l; i++){
							this.css(keys[i],key[keys[i]]);
						};
						return this;
					};
					
					key = Imba.CSSKeyMap[key] || key;
					
					if (val == null) {
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
			});
			
			if (!document.documentElement.classList) {
				tag$.extendTag('element', function(tag){
					
					tag.prototype.hasFlag = function (ref){
						return new RegExp('(^|\\s)' + ref + '(\\s|$)').test(this._dom.className);
					};
					
					tag.prototype.addFlag = function (ref){
						if (this.hasFlag(ref)) { return this };
						this._dom.className += (this._dom.className ? (' ') : ('')) + ref;
						return this;
					};
					
					tag.prototype.unflag = function (ref){
						if (!this.hasFlag(ref)) { return this };
						var regex = new RegExp('(^|\\s)*' + ref + '(\\s|$)*','g');
						this._dom.className = this._dom.className.replace(regex,'');
						return this;
					};
					
					tag.prototype.toggleFlag = function (ref){
						return this.hasFlag(ref) ? (this.unflag(ref)) : (this.flag(ref));
					};
					
					tag.prototype.flag = function (ref,bool){
						if (arguments.length == 2 && !(!(bool)) === false) {
							return this.unflag(ref);
						};
						return this.addFlag(ref);
					};
				});
				return true;
			};
		};

	})()

/***/ },
/* 9 */
/***/ function(module, exports) {

	(function(){
		function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
		var doc = document;
		var win = window;
		
		var hasTouchEvents = window && window.ontouchstart !== undefined;
		
		Imba.Pointer = function Pointer(){
			this.setButton(-1);
			this.setEvent({x: 0,y: 0,type: 'uninitialized'});
			return this;
		};
		
		Imba.Pointer.prototype.phase = function(v){ return this._phase; }
		Imba.Pointer.prototype.setPhase = function(v){ this._phase = v; return this; };
		Imba.Pointer.prototype.prevEvent = function(v){ return this._prevEvent; }
		Imba.Pointer.prototype.setPrevEvent = function(v){ this._prevEvent = v; return this; };
		Imba.Pointer.prototype.button = function(v){ return this._button; }
		Imba.Pointer.prototype.setButton = function(v){ this._button = v; return this; };
		Imba.Pointer.prototype.event = function(v){ return this._event; }
		Imba.Pointer.prototype.setEvent = function(v){ this._event = v; return this; };
		Imba.Pointer.prototype.dirty = function(v){ return this._dirty; }
		Imba.Pointer.prototype.setDirty = function(v){ this._dirty = v; return this; };
		Imba.Pointer.prototype.events = function(v){ return this._events; }
		Imba.Pointer.prototype.setEvents = function(v){ this._events = v; return this; };
		Imba.Pointer.prototype.touch = function(v){ return this._touch; }
		Imba.Pointer.prototype.setTouch = function(v){ this._touch = v; return this; };
		
		Imba.Pointer.prototype.update = function (e){
			this.setEvent(e);
			this.setDirty(true);
			return this;
		};
		
		// this is just for regular mouse now
		Imba.Pointer.prototype.process = function (){
			var e1 = this.event();
			
			if (this.dirty()) {
				this.setPrevEvent(e1);
				this.setDirty(false);
				
				// button should only change on mousedown etc
				if (e1.type == 'mousedown') {
					this.setButton(e1.button);
					
					// do not create touch for right click
					if (this.button() == 2 || (this.touch() && this.button() != 0)) {
						return;
					};
					
					// cancel the previous touch
					if (this.touch()) { this.touch().cancel() };
					this.setTouch(new Imba.Touch(e1,this));
					this.touch().mousedown(e1,e1);
				} else if (e1.type == 'mousemove') {
					if (this.touch()) { this.touch().mousemove(e1,e1) };
				} else if (e1.type == 'mouseup') {
					this.setButton(-1);
					
					if (this.touch() && this.touch().button() == e1.button) {
						this.touch().mouseup(e1,e1);
						this.setTouch(null);
					};
					// trigger pointerup
				};
			} else {
				if (this.touch()) { this.touch().idle() };
			};
			return this;
		};
		
		Imba.Pointer.prototype.cleanup = function (){
			return Imba.POINTERS;
		};
		
		Imba.Pointer.prototype.x = function (){
			return this.event().x;
		};
		Imba.Pointer.prototype.y = function (){
			return this.event().y;
		};
		
		// deprecated -- should remove
		Imba.Pointer.update = function (){
			// console.log('update touch')
			for (var i = 0, ary = iter$(Imba.POINTERS), len = ary.length; i < len; i++) {
				ary[i].process();
			};
			// need to be able to prevent the default behaviour of touch, no?
			win.requestAnimationFrame(Imba.Pointer.update);
			return this;
		};
		
		var lastNativeTouchTimeStamp = 0;
		var lastNativeTouchTimeout = 50;
		
		// Imba.Touch
		// Began	A finger touched the screen.
		// Moved	A finger moved on the screen.
		// Stationary	A finger is touching the screen but hasn't moved.
		// Ended	A finger was lifted from the screen. This is the final phase of a touch.
		// Canceled The system cancelled tracking for the touch.
		
		/*
		Consolidates mouse and touch events. Touch objects persist across a touch,
		from touchstart until end/cancel. When a touch starts, it will traverse
		down from the innermost target, until it finds a node that responds to
		ontouchstart. Unless the touch is explicitly redirected, the touch will
		call ontouchmove and ontouchend / ontouchcancel on the responder when appropriate.
		
			tag draggable
				# called when a touch starts
				def ontouchstart touch
					flag 'dragging'
					self
				
				# called when touch moves - same touch object
				def ontouchmove touch
					# move the node with touch
					css top: touch.dy, left: touch.dx
				
				# called when touch ends
				def ontouchend touch
					unflag 'dragging'
		
		@iname touch
		*/
		
		Imba.Touch = function Touch(event,pointer){
			// @native  = false
			this.setEvent(event);
			this.setData({});
			this.setActive(true);
			this._button = event && event.button || 0;
			this._suppress = false; // deprecated
			this._captured = false;
			this.setBubble(false);
			pointer = pointer;
			this.setUpdates(0);
			return this;
		};
		
		var touches = [];
		var count = 0;
		var identifiers = {};
		
		Imba.Touch.count = function (){
			return count;
		};
		
		Imba.Touch.lookup = function (item){
			return item && (item.__touch__ || identifiers[item.identifier]);
		};
		
		Imba.Touch.release = function (item,touch){
			var v_, $1;
			(((v_ = identifiers[item.identifier]),delete identifiers[item.identifier], v_));
			((($1 = item.__touch__),delete item.__touch__, $1));
			return;
		};
		
		Imba.Touch.ontouchstart = function (e){
			for (var i = 0, ary = iter$(e.changedTouches), len = ary.length, t; i < len; i++) {
				t = ary[i];
				if (this.lookup(t)) { continue; };
				var touch = identifiers[t.identifier] = new this(e); // (e)
				t.__touch__ = touch;
				touches.push(touch);
				count++;
				touch.touchstart(e,t);
			};
			return this;
		};
		
		Imba.Touch.ontouchmove = function (e){
			var touch;
			for (var i = 0, ary = iter$(e.changedTouches), len = ary.length, t; i < len; i++) {
				t = ary[i];
				if (touch = this.lookup(t)) {
					touch.touchmove(e,t);
				};
			};
			
			return this;
		};
		
		Imba.Touch.ontouchend = function (e){
			var touch;
			for (var i = 0, ary = iter$(e.changedTouches), len = ary.length, t; i < len; i++) {
				t = ary[i];
				if (touch = this.lookup(t)) {
					touch.touchend(e,t);
					this.release(t,touch);
					count--;
				};
			};
			
			// e.preventDefault
			// not always supported!
			// touches = touches.filter(||)
			return this;
		};
		
		Imba.Touch.ontouchcancel = function (e){
			var touch;
			for (var i = 0, ary = iter$(e.changedTouches), len = ary.length, t; i < len; i++) {
				t = ary[i];
				if (touch = this.lookup(t)) {
					touch.touchcancel(e,t);
					this.release(t,touch);
					count--;
				};
			};
			return this;
		};
		
		Imba.Touch.onmousedown = function (e){
			return this;
		};
		
		Imba.Touch.onmousemove = function (e){
			return this;
		};
		
		Imba.Touch.onmouseup = function (e){
			return this;
		};
		
		
		Imba.Touch.prototype.phase = function(v){ return this._phase; }
		Imba.Touch.prototype.setPhase = function(v){ this._phase = v; return this; };
		Imba.Touch.prototype.active = function(v){ return this._active; }
		Imba.Touch.prototype.setActive = function(v){ this._active = v; return this; };
		Imba.Touch.prototype.event = function(v){ return this._event; }
		Imba.Touch.prototype.setEvent = function(v){ this._event = v; return this; };
		Imba.Touch.prototype.pointer = function(v){ return this._pointer; }
		Imba.Touch.prototype.setPointer = function(v){ this._pointer = v; return this; };
		Imba.Touch.prototype.target = function(v){ return this._target; }
		Imba.Touch.prototype.setTarget = function(v){ this._target = v; return this; };
		Imba.Touch.prototype.handler = function(v){ return this._handler; }
		Imba.Touch.prototype.setHandler = function(v){ this._handler = v; return this; };
		Imba.Touch.prototype.updates = function(v){ return this._updates; }
		Imba.Touch.prototype.setUpdates = function(v){ this._updates = v; return this; };
		Imba.Touch.prototype.suppress = function(v){ return this._suppress; }
		Imba.Touch.prototype.setSuppress = function(v){ this._suppress = v; return this; };
		Imba.Touch.prototype.data = function(v){ return this._data; }
		Imba.Touch.prototype.setData = function(v){ this._data = v; return this; };
		Imba.Touch.prototype.__bubble = {chainable: true,name: 'bubble'};
		Imba.Touch.prototype.bubble = function(v){ return v !== undefined ? (this.setBubble(v),this) : this._bubble; }
		Imba.Touch.prototype.setBubble = function(v){ this._bubble = v; return this; };
		
		Imba.Touch.prototype.gestures = function(v){ return this._gestures; }
		Imba.Touch.prototype.setGestures = function(v){ this._gestures = v; return this; };
		
		/*
			
		
			@internal
			@constructor
			*/
		
		Imba.Touch.prototype.capture = function (){
			this._captured = true;
			this._event && this._event.preventDefault();
			return this;
		};
		
		Imba.Touch.prototype.isCaptured = function (){
			return !(!this._captured);
		};
		
		/*
			Extend the touch with a plugin / gesture. 
			All events (touchstart,move etc) for the touch
			will be triggered on the plugins in the order they
			are added.
			*/
		
		Imba.Touch.prototype.extend = function (plugin){
			// console.log "added gesture!!!"
			this._gestures || (this._gestures = []);
			this._gestures.push(plugin);
			return this;
		};
		
		/*
			Redirect touch to specified target. ontouchstart will always be
			called on the new target.
			@return {Number}
			*/
		
		Imba.Touch.prototype.redirect = function (target){
			this._redirect = target;
			return this;
		};
		
		/*
			Suppress the default behaviour. Will call preventDefault for
			all native events that are part of the touch.
			*/
		
		Imba.Touch.prototype.suppress = function (){
			// collision with the suppress property
			this._active = false;
			return this;
		};
		
		Imba.Touch.prototype.setSuppress = function (value){
			console.warn('Imba.Touch#suppress= is deprecated');
			this._supress = value;
			return this;
		};
		
		Imba.Touch.prototype.touchstart = function (e,t){
			this._event = e;
			this._touch = t;
			this._button = 0;
			this._x = t.clientX;
			this._y = t.clientY;
			this.began();
			if (e && this.isCaptured()) { e.preventDefault() };
			return this;
		};
		
		Imba.Touch.prototype.touchmove = function (e,t){
			this._event = e;
			this._x = t.clientX;
			this._y = t.clientY;
			this.update();
			if (e && this.isCaptured()) { e.preventDefault() };
			return this;
		};
		
		Imba.Touch.prototype.touchend = function (e,t){
			this._event = e;
			this._x = t.clientX;
			this._y = t.clientY;
			this.ended();
			
			lastNativeTouchTimeStamp = e.timeStamp;
			
			if (this._maxdr < 20) {
				var tap = new Imba.Event(e);
				tap.setType('tap');
				tap.process();
				if (tap._responder) { e.preventDefault() };
			};
			
			if (e && this.isCaptured()) {
				e.preventDefault();
			};
			
			return this;
		};
		
		Imba.Touch.prototype.touchcancel = function (e,t){
			return this.cancel();
		};
		
		Imba.Touch.prototype.mousedown = function (e,t){
			var self = this;
			self._event = e;
			self._button = e.button;
			self._x = t.clientX;
			self._y = t.clientY;
			self.began();
			
			self._mousemove = function(e) { return self.mousemove(e,e); };
			doc.addEventListener('mousemove',self._mousemove,true);
			return self;
		};
		
		Imba.Touch.prototype.mousemove = function (e,t){
			this._x = t.clientX;
			this._y = t.clientY;
			this._event = e;
			if (this.isCaptured()) { e.preventDefault() };
			this.update();
			this.move();
			return this;
		};
		
		Imba.Touch.prototype.mouseup = function (e,t){
			this._x = t.clientX;
			this._y = t.clientY;
			this.ended();
			doc.removeEventListener('mousemove',this._mousemove,true);
			this._mousemove = null;
			return this;
		};
		
		Imba.Touch.prototype.idle = function (){
			return this.update();
		};
		
		Imba.Touch.prototype.began = function (){
			this._maxdr = this._dr = 0;
			this._x0 = this._x;
			this._y0 = this._y;
			
			var dom = this.event().target;
			var node = null;
			
			this._sourceTarget = dom && tag$wrap(dom);
			
			while (dom){
				node = tag$wrap(dom);
				if (node && node.ontouchstart) {
					this._bubble = false;
					this.setTarget(node);
					this.target().ontouchstart(this);
					if (!this._bubble) { break; };
				};
				dom = dom.parentNode;
			};
			
			this._updates++;
			return this;
		};
		
		Imba.Touch.prototype.update = function (){
			var target_;
			if (!this._active) { return this };
			
			var dr = Math.sqrt(this.dx() * this.dx() + this.dy() * this.dy());
			if (dr > this._dr) { this._maxdr = dr };
			this._dr = dr;
			
			// catching a touch-redirect?!?
			if (this._redirect) {
				if (this._target && this._target.ontouchcancel) {
					this._target.ontouchcancel(this);
				};
				this.setTarget(this._redirect);
				this._redirect = null;
				if (this.target().ontouchstart) { this.target().ontouchstart(this) };
			};
			
			
			this._updates++;
			if (this._gestures) {
				for (var i = 0, ary = iter$(this._gestures), len = ary.length; i < len; i++) {
					ary[i].ontouchupdate(this);
				};
			};
			
			(target_ = this.target()) && target_.ontouchupdate  &&  target_.ontouchupdate(this);
			return this;
		};
		
		Imba.Touch.prototype.move = function (){
			var target_;
			if (!this._active) { return this };
			
			if (this._gestures) {
				for (var i = 0, ary = iter$(this._gestures), len = ary.length, g; i < len; i++) {
					g = ary[i];
					if (g.ontouchmove) { g.ontouchmove(this,this._event) };
				};
			};
			
			(target_ = this.target()) && target_.ontouchmove  &&  target_.ontouchmove(this,this._event);
			return this;
		};
		
		Imba.Touch.prototype.ended = function (){
			var target_;
			if (!this._active) { return this };
			
			this._updates++;
			
			if (this._gestures) {
				for (var i = 0, ary = iter$(this._gestures), len = ary.length; i < len; i++) {
					ary[i].ontouchend(this);
				};
			};
			
			(target_ = this.target()) && target_.ontouchend  &&  target_.ontouchend(this);
			
			return this;
		};
		
		Imba.Touch.prototype.cancel = function (){
			if (!this._cancelled) {
				this._cancelled = true;
				this.cancelled();
				if (this._mousemove) { doc.removeEventListener('mousemove',this._mousemove,true) };
			};
			return this;
		};
		
		Imba.Touch.prototype.cancelled = function (){
			var target_;
			if (!this._active) { return this };
			
			this._cancelled = true;
			this._updates++;
			
			if (this._gestures) {
				for (var i = 0, ary = iter$(this._gestures), len = ary.length, g; i < len; i++) {
					g = ary[i];
					if (g.ontouchcancel) { g.ontouchcancel(this) };
				};
			};
			
			(target_ = this.target()) && target_.ontouchcancel  &&  target_.ontouchcancel(this);
			return this;
		};
		
		/*
			The absolute distance the touch has moved from starting position 
			@return {Number}
			*/
		
		Imba.Touch.prototype.dr = function (){
			return this._dr;
		};
		
		/*
			The distance the touch has moved horizontally
			@return {Number}
			*/
		
		Imba.Touch.prototype.dx = function (){
			return this._x - this._x0;
		};
		
		/*
			The distance the touch has moved vertically
			@return {Number}
			*/
		
		Imba.Touch.prototype.dy = function (){
			return this._y - this._y0;
		};
		
		/*
			Initial horizontal position of touch
			@return {Number}
			*/
		
		Imba.Touch.prototype.x0 = function (){
			return this._x0;
		};
		
		/*
			Initial vertical position of touch
			@return {Number}
			*/
		
		Imba.Touch.prototype.y0 = function (){
			return this._y0;
		};
		
		/*
			Horizontal position of touch
			@return {Number}
			*/
		
		Imba.Touch.prototype.x = function (){
			return this._x;
		};
		
		/*
			Vertical position of touch
			@return {Number}
			*/
		
		Imba.Touch.prototype.y = function (){
			return this._y;
		};
		
		/*
			Horizontal position of touch relative to target
			@return {Number}
			*/
		
		Imba.Touch.prototype.tx = function (){
			this._targetBox || (this._targetBox = this._target.dom().getBoundingClientRect());
			return this._x - this._targetBox.left;
		};
		
		/*
			Vertical position of touch relative to target
			@return {Number}
			*/
		
		Imba.Touch.prototype.ty = function (){
			this._targetBox || (this._targetBox = this._target.dom().getBoundingClientRect());
			return this._y - this._targetBox.top;
		};
		
		/*
			Button pressed in this touch. Native touches defaults to left-click (0)
			@return {Number}
			*/
		
		Imba.Touch.prototype.button = function (){
			return this._button;
		}; // @pointer ? @pointer.button : 0
		
		Imba.Touch.prototype.sourceTarget = function (){
			return this._sourceTarget;
		};
		
		
		Imba.TouchGesture = function TouchGesture(){ };
		
		Imba.TouchGesture.prototype.__active = {'default': false,name: 'active'};
		Imba.TouchGesture.prototype.active = function(v){ return this._active; }
		Imba.TouchGesture.prototype.setActive = function(v){ this._active = v; return this; }
		Imba.TouchGesture.prototype._active = false;
		
		Imba.TouchGesture.prototype.ontouchstart = function (e){
			return this;
		};
		
		Imba.TouchGesture.prototype.ontouchupdate = function (e){
			return this;
		};
		
		Imba.TouchGesture.prototype.ontouchend = function (e){
			return this;
		};
		
		
		// A Touch-event is created on mousedown (always)
		// and while it exists, mousemove and mouseup will
		// be delegated to this active event.
		Imba.POINTER = new Imba.Pointer();
		Imba.POINTERS = [Imba.POINTER];
		
		
		// regular event stuff
		Imba.KEYMAP = {
			"8": 'backspace',
			"9": 'tab',
			"13": 'enter',
			"16": 'shift',
			"17": 'ctrl',
			"18": 'alt',
			"19": 'break',
			"20": 'caps',
			"27": 'esc',
			"32": 'space',
			"35": 'end',
			"36": 'home',
			"37": 'larr',
			"38": 'uarr',
			"39": 'rarr',
			"40": 'darr',
			"45": 'insert',
			"46": 'delete',
			"107": 'plus',
			"106": 'mult',
			"91": 'meta'
		};
		
		Imba.CHARMAP = {
			"%": 'modulo',
			"*": 'multiply',
			"+": 'add',
			"-": 'sub',
			"/": 'divide',
			".": 'dot'
		};
		
		/*
		Imba handles all events in the dom through a single manager,
		listening at the root of your document. If Imba finds a tag
		that listens to a certain event, the event will be wrapped 
		in an `Imba.Event`, which normalizes some of the quirks and 
		browser differences.
		
		@iname event
		*/
		
		Imba.Event = function Event(e){
			this.setEvent(e);
			this.setBubble(true);
		};
		
		/* reference to the native event */
		
		Imba.Event.prototype.event = function(v){ return this._event; }
		Imba.Event.prototype.setEvent = function(v){ this._event = v; return this; };
		
		/* reference to the native event */
		
		Imba.Event.prototype.prefix = function(v){ return this._prefix; }
		Imba.Event.prototype.setPrefix = function(v){ this._prefix = v; return this; };
		
		Imba.Event.prototype.data = function(v){ return this._data; }
		Imba.Event.prototype.setData = function(v){ this._data = v; return this; };
		
		/*
			should remove this alltogether?
			@deprecated
			*/
		
		Imba.Event.prototype.source = function(v){ return this._source; }
		Imba.Event.prototype.setSource = function(v){ this._source = v; return this; };
		
		/* A {Boolean} indicating whether the event bubbles up or not */
		
		Imba.Event.prototype.__bubble = {type: Boolean,chainable: true,name: 'bubble'};
		Imba.Event.prototype.bubble = function(v){ return v !== undefined ? (this.setBubble(v),this) : this._bubble; }
		Imba.Event.prototype.setBubble = function(v){ this._bubble = v; return this; };
		
		Imba.Event.wrap = function (e){
			return new this(e);
		};
		
		Imba.Event.prototype.setType = function (type){
			this._type = type;
			return this;
		};
		
		/*
			@return {String} The name of the event (case-insensitive)
			*/
		
		Imba.Event.prototype.type = function (){
			return this._type || this.event().type;
		};
		
		Imba.Event.prototype.name = function (){
			return this._name || (this._name = this.type().toLowerCase().replace(/\:/g,''));
		};
		
		// mimc getset
		Imba.Event.prototype.bubble = function (v){
			if (v != undefined) {
				this.setBubble(v);
				return this;
			};
			return this._bubble;
		};
		
		/*
			Prevents further propagation of the current event.
			@return {self}
			*/
		
		Imba.Event.prototype.halt = function (){
			this.setBubble(false);
			return this;
		};
		
		/*
			Cancel the event (if cancelable). In the case of native events it
			will call `preventDefault` on the wrapped event object.
			@return {self}
			*/
		
		Imba.Event.prototype.cancel = function (){
			if (this.event().preventDefault) { this.event().preventDefault() };
			this._cancel = true;
			return this;
		};
		
		Imba.Event.prototype.silence = function (){
			this._silenced = true;
			return this;
		};
		
		Imba.Event.prototype.isSilenced = function (){
			return !(!this._silenced);
		};
		
		/*
			Indicates whether or not event.cancel has been called.
		
			@return {Boolean}
			*/
		
		Imba.Event.prototype.isPrevented = function (){
			return this.event() && this.event().defaultPrevented || this._cancel;
		};
		
		/*
			A reference to the initial target of the event.
			*/
		
		Imba.Event.prototype.target = function (){
			return tag$wrap(this.event()._target || this.event().target);
		};
		
		/*
			A reference to the object responding to the event.
			*/
		
		Imba.Event.prototype.responder = function (){
			return this._responder;
		};
		
		/*
			Redirect the event to new target
			*/
		
		Imba.Event.prototype.redirect = function (node){
			this._redirect = node;
			return this;
		};
		
		/*
			Get the normalized character for KeyboardEvent/TextEvent
			@return {String}
			*/
		
		Imba.Event.prototype.keychar = function (){
			if (this.event() instanceof KeyboardEvent) {
				var ki = this.event().keyIdentifier;
				var sym = Imba.KEYMAP[this.event().keyCode];
				
				if (!(sym) && ki.substr(0,2) == "U+") {
					sym = String.fromCharCode(parseInt(ki.substr(2),16));
				};
				return sym;
			} else if (this.event() instanceof (window.TextEvent || window.InputEvent)) {
				return this.event().data;
			};
			
			return null;
		};
		
		/*
			@deprecated
			*/
		
		Imba.Event.prototype.keycombo = function (){
			var sym;
			if (!(sym = this.keychar())) { return };
			sym = Imba.CHARMAP[sym] || sym;
			var combo = [],e = this.event();
			if (e.ctrlKey) { combo.push('ctrl') };
			if (e.shiftKey) { combo.push('shift') };
			if (e.altKey) { combo.push('alt') };
			if (e.metaKey) { combo.push('cmd') };
			combo.push(sym);
			return combo.join("_").toLowerCase();
		};
		
		
		Imba.Event.prototype.process = function (){
			var node;
			var meth = ("on" + (this._prefix || '') + this.name());
			var args = null;
			var domtarget = this.event()._target || this.event().target;
			// var node = <{domtarget:_responder or domtarget}>
			// need to clean up and document this behaviour
			
			var domnode = domtarget._responder || domtarget;
			// @todo need to stop infinite redirect-rules here
			
			var $1;while (domnode){
				this._redirect = null;
				if (node = tag$wrap(domnode)) { // not only tag 
					
					if ((typeof node[($1 = meth)]=='string'||node[$1] instanceof String)) {
						// should remember the receiver of the event
						meth = node[meth];
						continue; // should not continue?
					};
					
					if (node[meth] instanceof Array) {
						args = node[meth].concat(node);
						meth = args.shift();
						continue; // should not continue?
					};
					
					if (node[meth] instanceof Function) {
						this._responder || (this._responder = node);
						// should autostop bubble here?
						args ? (node[meth].apply(node,args)) : (node[meth](this,this.data()));
					};
				};
				
				// add node.nextEventResponder as a separate method here?
				if (!(this.bubble() && (domnode = (this._redirect || (node ? (node.parent()) : (domnode.parentNode)))))) {
					break;
				};
			};
			
			this.processed();
			return this;
		};
		
		
		Imba.Event.prototype.processed = function (){
			if (!this._silenced) { Imba.emit(Imba,'event',[this]) };
			return this;
		};
		
		/*
			Return the x/left coordinate of the mouse / pointer for this event
			@return {Number} x coordinate of mouse / pointer for event
			*/
		
		Imba.Event.prototype.x = function (){
			return this.event().x;
		};
		
		/*
			Return the y/top coordinate of the mouse / pointer for this event
			@return {Number} y coordinate of mouse / pointer for event
			*/
		
		Imba.Event.prototype.y = function (){
			return this.event().y;
		};
		
		/*
			Returns a Number representing a system and implementation
			dependent numeric code identifying the unmodified value of the
			pressed key; this is usually the same as keyCode.
		
			For mouse-events, the returned value indicates which button was
			pressed on the mouse to trigger the event.
		
			@return {Number}
			*/
		
		Imba.Event.prototype.which = function (){
			return this.event().which;
		};
		
		
		/*
		
		Manager for listening to and delegating events in Imba. A single instance
		is always created by Imba (as `Imba.Events`), which handles and delegates all
		events at the very root of the document. Imba does not capture all events
		by default, so if you want to make sure exotic or custom DOMEvents are delegated
		in Imba you will need to register them in `Imba.Events.register(myCustomEventName)`
		
		@iname manager
		
		*/
		
		Imba.EventManager = function EventManager(node,pars){
			var self = this;
			if(!pars||pars.constructor !== Object) pars = {};
			var events = pars.events !== undefined ? pars.events : [];
			self.setRoot(node);
			self.setCount(0);
			self.setListeners([]);
			self.setDelegators({});
			self.setDelegator(function(e) {
				// console.log "delegating event?! {e}"
				self.delegate(e);
				return true;
			});
			
			for (var i = 0, ary = iter$(events), len = ary.length; i < len; i++) {
				self.register(ary[i]);
			};
			
			return self;
		};
		
		Imba.EventManager.prototype.root = function(v){ return this._root; }
		Imba.EventManager.prototype.setRoot = function(v){ this._root = v; return this; };
		Imba.EventManager.prototype.count = function(v){ return this._count; }
		Imba.EventManager.prototype.setCount = function(v){ this._count = v; return this; };
		Imba.EventManager.prototype.__enabled = {'default': false,watch: 'enabledDidSet',name: 'enabled'};
		Imba.EventManager.prototype.enabled = function(v){ return this._enabled; }
		Imba.EventManager.prototype.setEnabled = function(v){
			var a = this.enabled();
			if(v != a) { this._enabled = v; }
			if(v != a) { this.enabledDidSet && this.enabledDidSet(v,a,this.__enabled) }
			return this;
		}
		Imba.EventManager.prototype._enabled = false;
		Imba.EventManager.prototype.listeners = function(v){ return this._listeners; }
		Imba.EventManager.prototype.setListeners = function(v){ this._listeners = v; return this; };
		Imba.EventManager.prototype.delegators = function(v){ return this._delegators; }
		Imba.EventManager.prototype.setDelegators = function(v){ this._delegators = v; return this; };
		Imba.EventManager.prototype.delegator = function(v){ return this._delegator; }
		Imba.EventManager.prototype.setDelegator = function(v){ this._delegator = v; return this; };
		
		Imba.EventManager.prototype.enabledDidSet = function (bool){
			bool ? (this.onenable()) : (this.ondisable());
			return this;
		};
		
		/*
		
			Tell the current EventManager to intercept and handle event of a certain name.
			By default, Imba.Events will register interceptors for: *keydown*, *keyup*, 
			*keypress*, *textInput*, *input*, *change*, *submit*, *focusin*, *focusout*, 
			*blur*, *contextmenu*, *dblclick*, *mousewheel*, *wheel*
		
			*/
		
		Imba.EventManager.prototype.register = function (name,handler){
			if(handler === undefined) handler = true;
			if (name instanceof Array) {
				for (var i = 0, ary = iter$(name), len = ary.length; i < len; i++) {
					this.register(ary[i],handler);
				};
				return this;
			};
			
			if (this.delegators()[name]) { return this };
			// console.log("register for event {name}")
			var fn = this.delegators()[name] = handler instanceof Function ? (handler) : (this.delegator());
			if (this.enabled()) { return this.root().addEventListener(name,fn,true) };
		};
		
		Imba.EventManager.prototype.listen = function (name,handler,capture){
			if(capture === undefined) capture = true;
			this.listeners().push([name,handler,capture]);
			if (this.enabled()) { this.root().addEventListener(name,handler,capture) };
			return this;
		};
		
		Imba.EventManager.prototype.delegate = function (e){
			this.setCount(this.count() + 1);
			var event = Imba.Event.wrap(e);
			event.process();
			return this;
		};
		
		Imba.EventManager.prototype.create = function (type,target,pars){
			if(!pars||pars.constructor !== Object) pars = {};
			var data = pars.data !== undefined ? pars.data : null;
			var source = pars.source !== undefined ? pars.source : null;
			var event = Imba.Event.wrap({type: type,target: target});
			if (data) { (event.setData(data),data) };
			if (source) { (event.setSource(source),source) };
			return event;
		};
		
		// use create instead?
		Imba.EventManager.prototype.trigger = function (){
			return this.create.apply(this,arguments).process();
		};
		
		Imba.EventManager.prototype.onenable = function (){
			for (var o = this.delegators(), i = 0, keys = Object.keys(o), l = keys.length; i < l; i++){
				this.root().addEventListener(keys[i],o[keys[i]],true);
			};
			
			for (var i = 0, ary = iter$(this.listeners()), len = ary.length, item; i < len; i++) {
				item = ary[i];
				this.root().addEventListener(item[0],item[1],item[2]);
			};
			return this;
		};
		
		Imba.EventManager.prototype.ondisable = function (){
			for (var o = this.delegators(), i = 0, keys = Object.keys(o), l = keys.length; i < l; i++){
				this.root().removeEventListener(keys[i],o[keys[i]],true);
			};
			
			for (var i = 0, ary = iter$(this.listeners()), len = ary.length, item; i < len; i++) {
				item = ary[i];
				this.root().removeEventListener(item[0],item[1],item[2]);
			};
			return this;
		};
		
		
		ED = Imba.Events = new Imba.EventManager(document,{events: [
			'keydown','keyup','keypress','textInput','input','change','submit',
			'focusin','focusout','blur','contextmenu','dblclick',
			'mousewheel','wheel','scroll'
		]});
		
		// should set these up inside the Imba.Events object itself
		// so that we can have different EventManager for different roots
		
		if (hasTouchEvents) {
			Imba.Events.listen('touchstart',function(e) {
				var Events_, v_;
				(((Events_ = Imba.Events).setCount(v_ = Events_.count() + 1),v_)) - 1;
				return Imba.Touch.ontouchstart(e);
			});
			
			Imba.Events.listen('touchmove',function(e) {
				var Events_, v_;
				(((Events_ = Imba.Events).setCount(v_ = Events_.count() + 1),v_)) - 1;
				return Imba.Touch.ontouchmove(e);
			});
			
			Imba.Events.listen('touchend',function(e) {
				var Events_, v_;
				(((Events_ = Imba.Events).setCount(v_ = Events_.count() + 1),v_)) - 1;
				return Imba.Touch.ontouchend(e);
			});
			
			Imba.Events.listen('touchcancel',function(e) {
				var Events_, v_;
				(((Events_ = Imba.Events).setCount(v_ = Events_.count() + 1),v_)) - 1;
				return Imba.Touch.ontouchcancel(e);
			});
		};
		
		Imba.Events.register('click',function(e) {
			// Only for main mousebutton, no?
			if ((e.timeStamp - lastNativeTouchTimeStamp) > lastNativeTouchTimeout) {
				var tap = new Imba.Event(e);
				tap.setType('tap');
				tap.process();
				if (tap._responder) {
					return e.preventDefault();
				};
			};
			// delegate the real click event
			return Imba.Events.delegate(e);
		});
		
		Imba.Events.listen('mousedown',function(e) {
			if ((e.timeStamp - lastNativeTouchTimeStamp) > lastNativeTouchTimeout) {
				if (Imba.POINTER) { return Imba.POINTER.update(e).process() };
			};
		});
		
		// Imba.Events.listen(:mousemove) do |e|
		// 	# console.log 'mousemove',e:timeStamp
		// 	if (e:timeStamp - lastNativeTouchTimeStamp) > lastNativeTouchTimeout
		// 		Imba.POINTER.update(e).process if Imba.POINTER # .process if touch # should not happen? We process through 
		
		Imba.Events.listen('mouseup',function(e) {
			// console.log 'mouseup',e:timeStamp
			if ((e.timeStamp - lastNativeTouchTimeStamp) > lastNativeTouchTimeout) {
				if (Imba.POINTER) { return Imba.POINTER.update(e).process() };
			};
		});
		
		
		Imba.Events.register(['mousedown','mouseup']);
		return (Imba.Events.setEnabled(true),true);
	
	})()

/***/ },
/* 10 */
/***/ function(module, exports) {

	(function(){
		function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
		var ImbaTag = Imba.TAGS.element;
		
		function removeNested(root,node,caret){
			// if node/nodes isa String
			// 	we need to use the caret to remove elements
			// 	for now we will simply not support this
			if (node instanceof ImbaTag) {
				root.removeChild(node);
			} else if (node instanceof Array) {
				for (var i = 0, ary = iter$(node), len = ary.length; i < len; i++) {
					removeNested(root,ary[i],caret);
				};
			} else {
				// what if this is not null?!?!?
				// take a chance and remove a text-elementng
				var next = caret ? (caret.nextSibling) : (root._dom.firstChild);
				if ((next instanceof Text) && next.textContent == node) {
					root.removeChild(next);
				} else {
					throw 'cannot remove string';
				};
			};
			
			return caret;
		};
		
		function appendNested(root,node){
			if (node instanceof ImbaTag) {
				root.appendChild(node);
			} else if (node instanceof Array) {
				for (var i = 0, ary = iter$(node), len = ary.length; i < len; i++) {
					appendNested(root,ary[i]);
				};
			} else if (node != null && node !== false) {
				root.appendChild(Imba.document().createTextNode(node));
			};
			
			return;
		};
		
		
		// insert nodes before a certain node
		// does not need to return any tail, as before
		// will still be correct there
		// before must be an actual domnode
		function insertNestedBefore(root,node,before){
			if (node instanceof ImbaTag) {
				root.insertBefore(node,before);
			} else if (node instanceof Array) {
				for (var i = 0, ary = iter$(node), len = ary.length; i < len; i++) {
					insertNestedBefore(root,ary[i],before);
				};
			} else if (node != null && node !== false) {
				root.insertBefore(Imba.document().createTextNode(node),before);
			};
			
			return before;
		};
		
		// after must be an actual domnode
		function insertNestedAfter(root,node,after){
			var before = after ? (after.nextSibling) : (root._dom.firstChild);
			
			if (before) {
				insertNestedBefore(root,node,before);
				return before.previousSibling;
			} else {
				appendNested(root,node);
				return root._dom.lastChild;
			};
		};
		
		function reconcileCollectionChanges(root,new$,old,caret){
			
			var newLen = new$.length;
			var lastNew = new$[newLen - 1];
			
			// This re-order algorithm is based on the following principle:
			// 
			// We build a "chain" which shows which items are already sorted.
			// If we're going from [1, 2, 3] -> [2, 1, 3], the tree looks like:
			//
			// 	3 ->  0 (idx)
			// 	2 -> -1 (idx)
			// 	1 -> -1 (idx)
			//
			// This tells us that we have two chains of ordered items:
			// 
			// 	(1, 3) and (2)
			// 
			// The optimal re-ordering then becomes two keep the longest chain intact,
			// and move all the other items.
			
			var newPosition = [];
			
			// The tree/graph itself
			var prevChain = [];
			// The length of the chain
			var lengthChain = [];
			
			// Keep track of the longest chain
			var maxChainLength = 0;
			var maxChainEnd = 0;
			
			for (var idx = 0, ary = iter$(old), len = ary.length, node; idx < len; idx++) {
				node = ary[idx];
				var newPos = new$.indexOf(node);
				newPosition.push(newPos);
				
				if (newPos == -1) {
					root.removeChild(node);
					prevChain.push(-1);
					lengthChain.push(-1);
					continue;
				};
				
				var prevIdx = newPosition.length - 2;
				
				// Build the chain:
				while (prevIdx >= 0){
					if (newPosition[prevIdx] == -1) {
						prevIdx--;
					} else if (newPos > newPosition[prevIdx]) {
						// Yay, we're bigger than the previous!
						break;
					} else {
						// Nope, let's walk back the chain
						prevIdx = prevChain[prevIdx];
					};
				};
				
				prevChain.push(prevIdx);
				
				var currLength = (prevIdx == -1) ? (0) : (lengthChain[prevIdx] + 1);
				
				if (currLength > maxChainLength) {
					maxChainLength = currLength;
					maxChainEnd = idx;
				};
				
				lengthChain.push(currLength);
			};
			
			var stickyNodes = [];
			
			// Now we can walk the longest chain backwards and mark them as "sticky",
			// which implies that they should not be moved
			var cursor = newPosition.length - 1;
			while (cursor >= 0){
				if (cursor == maxChainEnd && newPosition[cursor] != -1) {
					stickyNodes[newPosition[cursor]] = true;
					maxChainEnd = prevChain[maxChainEnd];
				};
				
				cursor -= 1;
			};
			
			// And let's iterate forward, but only move non-sticky nodes
			for (var idx1 = 0, ary = iter$(new$), len = ary.length; idx1 < len; idx1++) {
				if (!stickyNodes[idx1]) {
					var after = new$[idx1 - 1];
					insertNestedAfter(root,ary[idx1],(after && after._dom) || caret);
				};
			};
			
			// should trust that the last item in new list is the caret
			return lastNew && lastNew._dom || caret;
		};
		
		
		// expects a flat non-sparse array of nodes in both new and old, always
		function reconcileCollection(root,new$,old,caret){
			var k = new$.length;
			var i = k;
			var last = new$[k - 1];
			
			
			if (k == old.length && new$[0] === old[0]) {
				// running through to compare
				while (i--){
					if (new$[i] !== old[i]) { break; };
				};
			};
			
			if (i == -1) {
				return last && last._dom || caret;
			} else {
				return reconcileCollectionChanges(root,new$,old,caret);
			};
		};
		
		// the general reconciler that respects conditions etc
		// caret is the current node we want to insert things after
		function reconcileNested(root,new$,old,caret){
			
			// if new == null or new === false or new === true
			// 	if new === old
			// 		return caret
			// 	if old && new != old
			// 		removeNested(root,old,caret) if old
			// 
			// 	return caret
			
			// var skipnew = new == null or new === false or new === true
			var newIsNull = new$ == null || new$ === false;
			var oldIsNull = old == null || old === false;
			
			
			if (new$ === old) {
				// remember that the caret must be an actual dom element
				// we should instead move the actual caret? - trust
				if (newIsNull) {
					return caret;
				} else if (new$ && new$._dom) {
					return new$._dom;
				} else {
					return caret ? (caret.nextSibling) : (root._dom.firstChild);
				};
			} else if (new$ instanceof Array) {
				if (old instanceof Array) {
					if (new$.static || old.static) {
						// if the static is not nested - we could get a hint from compiler
						// and just skip it
						if (new$.static == old.static) {
							for (var i = 0, ary = iter$(new$), len = ary.length; i < len; i++) {
								// this is where we could do the triple equal directly
								caret = reconcileNested(root,ary[i],old[i],caret);
							};
							return caret;
						} else {
							removeNested(root,old,caret);
						};
						
						// if they are not the same we continue through to the default
					} else {
						return reconcileCollection(root,new$,old,caret);
					};
				} else if (old instanceof ImbaTag) {
					root.removeChild(old);
				} else if (!(oldIsNull)) {
					// old was a string-like object?
					root.removeChild(caret ? (caret.nextSibling) : (root._dom.firstChild));
				};
				
				return insertNestedAfter(root,new$,caret);
				// remove old
			} else if (new$ instanceof ImbaTag) {
				if (!(oldIsNull)) { removeNested(root,old,caret) };
				insertNestedAfter(root,new$,caret);
				return new$;
			} else if (newIsNull) {
				if (!(oldIsNull)) { removeNested(root,old,caret) };
				return caret;
			} else {
				// if old did not exist we need to add a new directly
				var nextNode;
				// if old was array or imbatag we need to remove it and then add
				if (old instanceof Array) {
					removeNested(root,old,caret);
				} else if (old instanceof ImbaTag) {
					root.removeChild(old);
				} else if (!(oldIsNull)) {
					// ...
					nextNode = caret ? (caret.nextSibling) : (root._dom.firstChild);
					if ((nextNode instanceof Text) && nextNode.textContent != new$) {
						nextNode.textContent = new$;
						return nextNode;
					};
				};
				
				// now add the textnode
				return insertNestedAfter(root,new$,caret);
			};
		};
		
		
		return tag$.extendTag('htmlelement', function(tag){
			
			tag.prototype.setChildren = function (new$,typ){
				var old = this._children;
				// var isArray = nodes isa Array
				if (new$ === old) {
					return this;
				};
				
				if (!(old)) {
					this.empty();
					appendNested(this,new$);
				} else if (typ == 2) {
					return this;
				} else if (typ == 1) {
					// here we _know _that it is an array with the same shape
					// every time
					var caret = null;
					for (var i = 0, ary = iter$(new$), len = ary.length; i < len; i++) {
						// prev = old[i]
						caret = reconcileNested(this,ary[i],old[i],caret);
					};
				} else if (typ == 3) {
					// this is possibly fully dynamic. It often is
					// but the old or new could be static while the other is not
					// this is not handled now
					// what if it was previously a static array? edgecase - but must work
					if (new$ instanceof ImbaTag) {
						this.empty();
						this.appendChild(new$);
					} else if (new$ instanceof Array) {
						if (old instanceof Array) {
							// is this not the same as setting staticChildren now but with the
							reconcileCollection(this,new$,old,null);
						} else {
							this.empty();
							appendNested(this,new$);
						};
					} else {
						this.setText(new$);
						return this;
					};
				} else if ((new$ instanceof Array) && (old instanceof Array)) {
					reconcileCollection(this,new$,old,null);
				} else {
					this.empty();
					appendNested(this,new$);
				};
				
				this._children = new$;
				return this;
			};
			
			
			// only ever called with array as argument
			tag.prototype.setStaticChildren = function (new$){
				var old = this._children;
				
				var caret = null;
				for (var i = 0, ary = iter$(new$), len = ary.length; i < len; i++) {
					// prev = old[i]
					caret = reconcileNested(this,ary[i],old[i],caret);
				};
				
				this._children = new$;
				return this;
			};
			
			tag.prototype.content = function (){
				return this._content || this.children().toArray();
			};
			
			tag.prototype.setText = function (text){
				if (text != this._children) {
					this._children = text;
					this.dom().textContent = text == null || text === false ? ('') : (text);
				};
				return this;
			};
		});

	})()

/***/ },
/* 11 */
/***/ function(module, exports) {

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
			
			this._lazy = !(nodes);
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

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYmNmNDBhNWMzMzRhYzIxOTc1MzEiLCJ3ZWJwYWNrOi8vL3NyYy9pbWJhL2luZGV4LmltYmEiLCJ3ZWJwYWNrOi8vL3NyYy9pbWJhL2ltYmEuaW1iYSIsIndlYnBhY2s6Ly8vc3JjL2ltYmEvY29yZS5ldmVudHMuaW1iYSIsIndlYnBhY2s6Ly8vc3JjL2ltYmEvc2NoZWR1bGVyLmltYmEiLCJ3ZWJwYWNrOi8vL3NyYy9pbWJhL3RhZy5pbWJhIiwid2VicGFjazovLy9zcmMvaW1iYS9kb20uaW1iYSIsIndlYnBhY2s6Ly8vc3JjL2ltYmEvZG9tLmh0bWwuaW1iYSIsIndlYnBhY2s6Ly8vc3JjL2ltYmEvZG9tLnN2Zy5pbWJhIiwid2VicGFjazovLy9zcmMvaW1iYS9kb20uY2xpZW50LmltYmEiLCJ3ZWJwYWNrOi8vL3NyYy9pbWJhL2RvbS5ldmVudHMuaW1iYSIsIndlYnBhY2s6Ly8vc3JjL2ltYmEvZG9tLnN0YXRpYy5pbWJhIiwid2VicGFjazovLy9zcmMvaW1iYS9zZWxlY3Rvci5pbWJhIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7RUNyQ0EsV0FBVSxLQUFLO0dBQ2Q7R0FDQTtHQUNBO0dBQ0E7R0FDQTtHQUNBO0dBQ0E7O0dBRUEsSUFBRyxLQUFLO0lBQ1A7OztHQUVELElBQUcsSUFBSztJQUNQO0lBQ0E7SUFDQTs7O1VBRUQ7O1VBRUEsUUFBUSxrQkFBYSxLQUFLOzs7Ozs7Ozs7O0VDcEIzQixXQUFVLE9BQU87O0dBRWhCLE9BQU8sRUFBRTs7O01BRU4sU0FBUyxVQUFVLE9BQU8sWUFBWSxRQUFTLEdB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ckM7OztFQUVSLEtBdklVOzs7Ozs7OztFQTZJVixLQTdJVTtlQThJVCw2QkFBZSxFQUFFLEtBQUs7Ozs7Ozs7RUFLdkIsS0FuSlU7ZUFvSlQsNkJBQWUsRUFBRSxPQUFPOzs7OztLQUl2QixtQ0FBaUIsS0FBSyxTQUFhLElBQUs7OztNQUd2QztPQUNDLEdBQUcsR0FBRyxNQUFNLEdBQUcsS0FBSyxZQUFVLGNBQWM7VUFDaEQsR0FBRyxZQUFPLElBQUk7Ozs7OztTQUtSO0dBQ047Z0JBQTBCLEtBQUssaUJBQWlCOztHQUNoRDtnQkFBdUIsS0FBSyxjQUFjOzs7OztHQUkxQztlQUFnQixLQUFLLFNBQWEiLCJmaWxlIjoiLi9kaXN0L2ltYmEuZGV2LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL2Jvb3RzdHJhcCBiY2Y0MGE1YzMzNGFjMjE5NzUzMVxuICoqLyIsIlxuaWYgdHlwZW9mIEltYmEgPT09ICd1bmRlZmluZWQnXG5cdHJlcXVpcmUgJy4vaW1iYSdcblx0cmVxdWlyZSAnLi9jb3JlLmV2ZW50cydcblx0cmVxdWlyZSAnLi9zY2hlZHVsZXInXG5cdHJlcXVpcmUgJy4vdGFnJ1xuXHRyZXF1aXJlICcuL2RvbSdcblx0cmVxdWlyZSAnLi9kb20uaHRtbCdcblx0cmVxdWlyZSAnLi9kb20uc3ZnJ1xuXG5cdGlmIEltYmEuU0VSVkVSXG5cdFx0cmVxdWlyZSAnLi9kb20uc2VydmVyJ1xuXHRcblx0aWYgSW1iYS5DTElFTlRcblx0XHRyZXF1aXJlICcuL2RvbS5jbGllbnQnXG5cdFx0cmVxdWlyZSAnLi9kb20uZXZlbnRzJ1xuXHRcdHJlcXVpcmUgJy4vZG9tLnN0YXRpYydcblxuXHRyZXF1aXJlICcuL3NlbGVjdG9yJ1xuZWxzZVxuXHRjb25zb2xlLndhcm4gXCJJbWJhIHZ7SW1iYS5WRVJTSU9OfSBpcyBhbHJlYWR5IGxvYWRlZFwiXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBzcmMvaW1iYS9pbmRleC5pbWJhXG4gKiovIiwiaWYgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcblx0IyBzaG91bGQgbm90IGdvIHRoZXJlXG5cdGdsb2JhbCA9IHdpbmRvd1xuXG52YXIgaXNDbGllbnQgPSAodHlwZW9mIHdpbmRvdyA9PSAnb2JqZWN0JyBhbmQgdGhpcyA9PSB3aW5kb3cpXG4jIyNcbkltYmEgaXMgdGhlIG5hbWVzcGFjZSBmb3IgYWxsIHJ1bnRpbWUgcmVsYXRlZCB1dGlsaXRpZXNcbkBuYW1lc3BhY2VcbiMjI1xuSW1iYSA9IHtcblx0VkVSU0lPTjogJzAuMTQuMydcblx0Q0xJRU5UOiBpc0NsaWVudFxuXHRTRVJWRVI6ICFpc0NsaWVudFxuXHRERUJVRzogbm9cbn1cblxudmFyIHJlZyA9IC8tLi9nXG5cbiMjI1xuVHJ1ZSBpZiBydW5uaW5nIGluIGNsaWVudCBlbnZpcm9ubWVudC5cbkByZXR1cm4ge2Jvb2x9XG4jIyNcbmRlZiBJbWJhLmlzQ2xpZW50XG5cdEltYmEuQ0xJRU5UID09IHllc1xuXG4jIyNcblRydWUgaWYgcnVubmluZyBpbiBzZXJ2ZXIgZW52aXJvbm1lbnQuXG5AcmV0dXJuIHtib29sfVxuIyMjXG5kZWYgSW1iYS5pc1NlcnZlclxuXHRJbWJhLlNFUlZFUiA9PSB5ZXNcblxuZGVmIEltYmEuc3ViY2xhc3Mgb2JqLCBzdXBcblx0Zm9yIGssdiBvZiBzdXBcblx0XHRvYmpba10gPSB2IGlmIHN1cC5oYXNPd25Qcm9wZXJ0eShrKVxuXG5cdG9iajpwcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cDpwcm90b3R5cGUpXG5cdG9iajpfX3N1cGVyX18gPSBvYmo6cHJvdG90eXBlOl9fc3VwZXJfXyA9IHN1cDpwcm90b3R5cGVcblx0b2JqOnByb3RvdHlwZTppbml0aWFsaXplID0gb2JqOnByb3RvdHlwZTpjb25zdHJ1Y3RvciA9IG9ialxuXHRyZXR1cm4gb2JqXG5cbiMjI1xuTGlnaHR3ZWlnaHQgbWV0aG9kIGZvciBtYWtpbmcgYW4gb2JqZWN0IGl0ZXJhYmxlIGluIGltYmFzIGZvci9pbiBsb29wcy5cbklmIHRoZSBjb21waWxlciBjYW5ub3Qgc2F5IGZvciBjZXJ0YWluIHRoYXQgYSB0YXJnZXQgaW4gYSBmb3IgbG9vcCBpcyBhblxuYXJyYXksIGl0IHdpbGwgY2FjaGUgdGhlIGl0ZXJhYmxlIHZlcnNpb24gYmVmb3JlIGxvb3BpbmcuXG5cbmBgYGltYmFcbiMgdGhpcyBpcyB0aGUgd2hvbGUgbWV0aG9kXG5kZWYgSW1iYS5pdGVyYWJsZSBvXG5cdHJldHVybiBvID8gKG86dG9BcnJheSA/IG8udG9BcnJheSA6IG8pIDogW11cblxuY2xhc3MgQ3VzdG9tSXRlcmFibGVcblx0ZGVmIHRvQXJyYXlcblx0XHRbMSwyLDNdXG5cbiMgd2lsbCByZXR1cm4gWzIsNCw2XVxuZm9yIHggaW4gQ3VzdG9tSXRlcmFibGUubmV3XG5cdHggKiAyXG5cbmBgYFxuIyMjXG5kZWYgSW1iYS5pdGVyYWJsZSBvXG5cdHJldHVybiBvID8gKG86dG9BcnJheSA/IG8udG9BcnJheSA6IG8pIDogW11cblxuIyMjXG5Db2VyY2VzIGEgdmFsdWUgaW50byBhIHByb21pc2UuIElmIHZhbHVlIGlzIGFycmF5IGl0IHdpbGxcbmNhbGwgYFByb21pc2UuYWxsKHZhbHVlKWAsIG9yIGlmIGl0IGlzIG5vdCBhIHByb21pc2UgaXQgd2lsbFxud3JhcCB0aGUgdmFsdWUgaW4gYFByb21pc2UucmVzb2x2ZSh2YWx1ZSlgLiBVc2VkIGZvciBleHBlcmltZW50YWxcbmF3YWl0IHN5bnRheC5cbkByZXR1cm4ge1Byb21pc2V9XG4jIyNcbmRlZiBJbWJhLmF3YWl0IHZhbHVlXG5cdGlmIHZhbHVlIGlzYSBBcnJheVxuXHRcdFByb21pc2UuYWxsKHZhbHVlKVxuXHRlbGlmIHZhbHVlIGFuZCB2YWx1ZTp0aGVuXG5cdFx0dmFsdWVcblx0ZWxzZVxuXHRcdFByb21pc2UucmVzb2x2ZSh2YWx1ZSlcblxuZGVmIEltYmEudG9DYW1lbENhc2Ugc3RyXG5cdHN0ci5yZXBsYWNlKHJlZykgZG8gfG18IG0uY2hhckF0KDEpLnRvVXBwZXJDYXNlXG5cbmRlZiBJbWJhLnRvQ2FtZWxDYXNlIHN0clxuXHRzdHIucmVwbGFjZShyZWcpIGRvIHxtfCBtLmNoYXJBdCgxKS50b1VwcGVyQ2FzZVxuXG5kZWYgSW1iYS5pbmRleE9mIGEsYlxuXHRyZXR1cm4gKGIgJiYgYjppbmRleE9mKSA/IGIuaW5kZXhPZihhKSA6IFtdOmluZGV4T2YuY2FsbChhLGIpXG5cbmRlZiBJbWJhLnByb3Agc2NvcGUsIG5hbWUsIG9wdHNcblx0aWYgc2NvcGU6ZGVmaW5lUHJvcGVydHlcblx0XHRyZXR1cm4gc2NvcGUuZGVmaW5lUHJvcGVydHkobmFtZSxvcHRzKVxuXHRyZXR1cm5cblxuZGVmIEltYmEuYXR0ciBzY29wZSwgbmFtZSwgb3B0c1xuXHRpZiBzY29wZTpkZWZpbmVBdHRyaWJ1dGVcblx0XHRyZXR1cm4gc2NvcGUuZGVmaW5lQXR0cmlidXRlKG5hbWUsb3B0cylcblxuXHRsZXQgZ2V0TmFtZSA9IEltYmEudG9DYW1lbENhc2UobmFtZSlcblx0bGV0IHNldE5hbWUgPSBJbWJhLnRvQ2FtZWxDYXNlKCdzZXQtJyArIG5hbWUpXG5cblx0c2NvcGU6cHJvdG90eXBlW2dldE5hbWVdID0gZG9cblx0XHRyZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUobmFtZSlcblxuXHRzY29wZTpwcm90b3R5cGVbc2V0TmFtZV0gPSBkbyB8dmFsdWV8XG5cdFx0dGhpcy5zZXRBdHRyaWJ1dGUobmFtZSx2YWx1ZSlcblx0XHRyZXR1cm4gdGhpc1xuXG5cdHJldHVyblxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogc3JjL2ltYmEvaW1iYS5pbWJhXG4gKiovIiwiXG5cbmRlZiBlbWl0X18gZXZlbnQsIGFyZ3MsIG5vZGVcblx0IyB2YXIgbm9kZSA9IGNic1tldmVudF1cblx0dmFyIHByZXYsIGNiLCByZXRcblxuXHR3aGlsZSAocHJldiA9IG5vZGUpIGFuZCAobm9kZSA9IG5vZGU6bmV4dClcblx0XHRpZiBjYiA9IG5vZGU6bGlzdGVuZXJcblx0XHRcdGlmIG5vZGU6cGF0aCBhbmQgY2Jbbm9kZTpwYXRoXVxuXHRcdFx0XHRyZXQgPSBhcmdzID8gY2Jbbm9kZTpwYXRoXS5hcHBseShjYixhcmdzKSA6IGNiW25vZGU6cGF0aF0oKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHQjIGNoZWNrIGlmIGl0IGlzIGEgbWV0aG9kP1xuXHRcdFx0XHRyZXQgPSBhcmdzID8gY2IuYXBwbHkobm9kZSwgYXJncykgOiBjYi5jYWxsKG5vZGUpXG5cblx0XHRpZiBub2RlOnRpbWVzICYmIC0tbm9kZTp0aW1lcyA8PSAwXG5cdFx0XHRwcmV2Om5leHQgPSBub2RlOm5leHRcblx0XHRcdG5vZGU6bGlzdGVuZXIgPSBudWxsXG5cdHJldHVyblxuXG4jIG1ldGhvZCBmb3IgcmVnaXN0ZXJpbmcgYSBsaXN0ZW5lciBvbiBvYmplY3RcbmRlZiBJbWJhLmxpc3RlbiBvYmosIGV2ZW50LCBsaXN0ZW5lciwgcGF0aFxuXHR2YXIgY2JzLCBsaXN0LCB0YWlsXG5cdGNicyA9IG9iajpfX2xpc3RlbmVyc19fIHx8PSB7fVxuXHRsaXN0ID0gY2JzW2V2ZW50XSB8fD0ge31cblx0dGFpbCA9IGxpc3Q6dGFpbCB8fCAobGlzdDp0YWlsID0gKGxpc3Q6bmV4dCA9IHt9KSlcblx0dGFpbDpsaXN0ZW5lciA9IGxpc3RlbmVyXG5cdHRhaWw6cGF0aCA9IHBhdGhcblx0bGlzdDp0YWlsID0gdGFpbDpuZXh0ID0ge31cblx0cmV0dXJuIHRhaWxcblxuZGVmIEltYmEub25jZSBvYmosIGV2ZW50LCBsaXN0ZW5lclxuXHR2YXIgdGFpbCA9IEltYmEubGlzdGVuKG9iaixldmVudCxsaXN0ZW5lcilcblx0dGFpbDp0aW1lcyA9IDFcblx0cmV0dXJuIHRhaWxcblxuZGVmIEltYmEudW5saXN0ZW4gb2JqLCBldmVudCwgY2IsIG1ldGhcblx0dmFyIG5vZGUsIHByZXZcblx0dmFyIG1ldGEgPSBvYmo6X19saXN0ZW5lcnNfX1xuXHRyZXR1cm4gdW5sZXNzIG1ldGFcblxuXHRpZiBub2RlID0gbWV0YVtldmVudF1cblx0XHR3aGlsZSAocHJldiA9IG5vZGUpIGFuZCAobm9kZSA9IG5vZGU6bmV4dClcblx0XHRcdGlmIG5vZGUgPT0gY2IgfHwgbm9kZTpsaXN0ZW5lciA9PSBjYlxuXHRcdFx0XHRwcmV2Om5leHQgPSBub2RlOm5leHRcblx0XHRcdFx0IyBjaGVjayBmb3IgY29ycmVjdCBwYXRoIGFzIHdlbGw/XG5cdFx0XHRcdG5vZGU6bGlzdGVuZXIgPSBudWxsXG5cdFx0XHRcdGJyZWFrXG5cdHJldHVyblxuXG5kZWYgSW1iYS5lbWl0IG9iaiwgZXZlbnQsIHBhcmFtc1xuXHRpZiB2YXIgY2IgPSBvYmo6X19saXN0ZW5lcnNfX1xuXHRcdGVtaXRfXyhldmVudCxwYXJhbXMsY2JbZXZlbnRdKSBpZiBjYltldmVudF1cblx0XHRlbWl0X18oZXZlbnQsW2V2ZW50LHBhcmFtc10sY2I6YWxsKSBpZiBjYjphbGwgIyBhbmQgZXZlbnQgIT0gJ2FsbCdcblx0cmV0dXJuXG5cbmRlZiBJbWJhLm9ic2VydmVQcm9wZXJ0eSBvYnNlcnZlciwga2V5LCB0cmlnZ2VyLCB0YXJnZXQsIHByZXZcblx0aWYgcHJldiBhbmQgdHlwZW9mIHByZXYgPT0gJ29iamVjdCdcblx0XHRJbWJhLnVubGlzdGVuKHByZXYsJ2FsbCcsb2JzZXJ2ZXIsdHJpZ2dlcilcblx0aWYgdGFyZ2V0IGFuZCB0eXBlb2YgdGFyZ2V0ID09ICdvYmplY3QnXG5cdFx0SW1iYS5saXN0ZW4odGFyZ2V0LCdhbGwnLG9ic2VydmVyLHRyaWdnZXIpXG5cdHNlbGZcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBzcmMvaW1iYS9jb3JlLmV2ZW50cy5pbWJhXG4gKiovIiwiXG52YXIgcmFmICMgdmVyeSBzaW1wbGUgcmFmIHBvbHlmaWxsXG5yYWYgfHw9IGdsb2JhbDpyZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbnJhZiB8fD0gZ2xvYmFsOndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZVxucmFmIHx8PSBnbG9iYWw6bW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5yYWYgfHw9IGRvIHxibGt8IHNldFRpbWVvdXQoYmxrLDEwMDAgLyA2MClcblxuZGVmIEltYmEudGljayBkXG5cdHJhZihJbWJhLnRpY2tlcikgaWYgQHNjaGVkdWxlZFxuXHRJbWJhLlNjaGVkdWxlci53aWxsUnVuXG5cdGVtaXQoc2VsZiwndGljaycsW2RdKVxuXHRJbWJhLlNjaGVkdWxlci5kaWRSdW5cblx0cmV0dXJuXG5cbmRlZiBJbWJhLnRpY2tlclxuXHRAdGlja2VyIHx8PSBkbyB8ZXwgdGljayhlKVxuXG4jIyNcblxuR2xvYmFsIGFsdGVybmF0aXZlIHRvIHJlcXVlc3RBbmltYXRpb25GcmFtZS4gU2NoZWR1bGUgYSB0YXJnZXRcbnRvIHRpY2sgZXZlcnkgZnJhbWUuIFlvdSBjYW4gc3BlY2lmeSB3aGljaCBtZXRob2QgdG8gY2FsbCBvbiB0aGVcbnRhcmdldCAoZGVmYXVsdHMgdG8gdGljaykuXG5cbiMjI1xuZGVmIEltYmEuc2NoZWR1bGUgdGFyZ2V0LCBtZXRob2QgPSAndGljaydcblx0bGlzdGVuKHNlbGYsJ3RpY2snLHRhcmdldCxtZXRob2QpXG5cdCMgc3RhcnQgc2NoZWR1bGluZyBub3cgaWYgdGhpcyB3YXMgdGhlIGZpcnN0IG9uZVxuXHR1bmxlc3MgQHNjaGVkdWxlZFxuXHRcdEBzY2hlZHVsZWQgPSB5ZXNcblx0XHRyYWYoSW1iYS50aWNrZXIpXG5cdHNlbGZcblxuIyMjXG5cblVuc2NoZWR1bGUgYSBwcmV2aW91c2x5IHNjaGVkdWxlZCB0YXJnZXRcblxuIyMjXG5kZWYgSW1iYS51bnNjaGVkdWxlIHRhcmdldCwgbWV0aG9kXG5cdHVubGlzdGVuKHNlbGYsJ3RpY2snLHRhcmdldCxtZXRob2QpXG5cdHZhciBjYnMgPSBzZWxmOl9fbGlzdGVuZXJzX18gfHw9IHt9XG5cdGlmICFjYnM6dGljayBvciAhY2JzOnRpY2s6bmV4dCBvciAhY2JzOnRpY2s6bmV4dDpsaXN0ZW5lclxuXHRcdEBzY2hlZHVsZWQgPSBub1xuXHRzZWxmXG5cbiMjI1xuXG5MaWdodCB3cmFwcGVyIGFyb3VuZCBuYXRpdmUgc2V0VGltZW91dCB0aGF0IGV4cGVjdHMgdGhlIGJsb2NrIC8gZnVuY3Rpb25cbmFzIGxhc3QgYXJndW1lbnQgKGluc3RlYWQgb2YgZmlyc3QpLiBJdCBhbHNvIHRyaWdnZXJzIGFuIGV2ZW50IHRvIEltYmFcbmFmdGVyIHRoZSB0aW1lb3V0IHRvIGxldCBzY2hlZHVsZXJzIHVwZGF0ZSAodG8gcmVyZW5kZXIgZXRjKSBhZnRlcndhcmRzLlxuXG4jIyNcbmRlZiBJbWJhLnNldFRpbWVvdXQgZGVsYXksICZibG9ja1xuXHRzZXRUaW1lb3V0KCYsZGVsYXkpIGRvXG5cdFx0YmxvY2soKVxuXHRcdEltYmEuU2NoZWR1bGVyLm1hcmtEaXJ0eVxuXHRcdCMgSW1iYS5lbWl0KEltYmEsJ3RpbWVvdXQnLFtibG9ja10pXG5cbiMjI1xuXG5MaWdodCB3cmFwcGVyIGFyb3VuZCBuYXRpdmUgc2V0SW50ZXJ2YWwgdGhhdCBleHBlY3RzIHRoZSBibG9jayAvIGZ1bmN0aW9uXG5hcyBsYXN0IGFyZ3VtZW50IChpbnN0ZWFkIG9mIGZpcnN0KS4gSXQgYWxzbyB0cmlnZ2VycyBhbiBldmVudCB0byBJbWJhXG5hZnRlciBldmVyeSBpbnRlcnZhbCB0byBsZXQgc2NoZWR1bGVycyB1cGRhdGUgKHRvIHJlcmVuZGVyIGV0YykgYWZ0ZXJ3YXJkcy5cblxuIyMjXG5kZWYgSW1iYS5zZXRJbnRlcnZhbCBpbnRlcnZhbCwgJmJsb2NrXG5cdHNldEludGVydmFsKCYsaW50ZXJ2YWwpIGRvXG5cdFx0YmxvY2soKVxuXHRcdEltYmEuU2NoZWR1bGVyLm1hcmtEaXJ0eVxuXHRcdCMgSW1iYS5lbWl0KEltYmEsJ2ludGVydmFsJyxbYmxvY2tdKVxuXG4jIyNcbkNsZWFyIGludGVydmFsIHdpdGggc3BlY2lmaWVkIGlkXG4jIyNcbmRlZiBJbWJhLmNsZWFySW50ZXJ2YWwgaW50ZXJ2YWxcblx0Y2xlYXJJbnRlcnZhbChpbnRlcnZhbClcblxuIyMjXG5DbGVhciB0aW1lb3V0IHdpdGggc3BlY2lmaWVkIGlkXG4jIyNcbmRlZiBJbWJhLmNsZWFyVGltZW91dCB0aW1lb3V0XG5cdGNsZWFyVGltZW91dCh0aW1lb3V0KVxuXG4jIHNob3VsZCBhZGQgYW4gSW1iYS5ydW4gLyBzZXRJbW1lZGlhdGUgdGhhdFxuIyBwdXNoZXMgbGlzdGVuZXIgb250byB0aGUgdGljay1xdWV1ZSB3aXRoIHRpbWVzIC0gb25jZVxuXG5cbiMjI1xuXG5JbnN0YW5jZXMgb2YgSW1iYS5TY2hlZHVsZXIgbWFuYWdlcyB3aGVuIHRvIGNhbGwgYHRpY2soKWAgb24gdGhlaXIgdGFyZ2V0LFxuYXQgYSBzcGVjaWZpZWQgZnJhbWVyYXRlIG9yIHdoZW4gY2VydGFpbiBldmVudHMgb2NjdXIuIFJvb3Qtbm9kZXMgaW4geW91clxuYXBwbGljYXRpb25zIHdpbGwgdXN1YWxseSBoYXZlIGEgc2NoZWR1bGVyIHRvIG1ha2Ugc3VyZSB0aGV5IHJlcmVuZGVyIHdoZW5cbnNvbWV0aGluZyBjaGFuZ2VzLiBJdCBpcyBhbHNvIHBvc3NpYmxlIHRvIG1ha2UgaW5uZXIgY29tcG9uZW50cyB1c2UgdGhlaXJcbm93biBzY2hlZHVsZXJzIHRvIGNvbnRyb2wgd2hlbiB0aGV5IHJlbmRlci5cblxuQGluYW1lIHNjaGVkdWxlclxuXG4jIyNcbmNsYXNzIEltYmEuU2NoZWR1bGVyXG5cblx0ZGVmIHNlbGYubWFya0RpcnR5XG5cdFx0QGRpcnR5ID0geWVzXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLmlzRGlydHlcblx0XHQhIUBkaXJ0eVxuXG5cdGRlZiBzZWxmLndpbGxSdW5cblx0XHRAYWN0aXZlID0geWVzXG5cblx0ZGVmIHNlbGYuZGlkUnVuXG5cdFx0QGFjdGl2ZSA9IG5vXG5cdFx0QGRpcnR5ID0gbm9cblxuXHRkZWYgc2VsZi5pc0FjdGl2ZVxuXHRcdCEhQGFjdGl2ZVxuXG5cdCMjI1xuXHRDcmVhdGUgYSBuZXcgSW1iYS5TY2hlZHVsZXIgZm9yIHNwZWNpZmllZCB0YXJnZXRcblx0QHJldHVybiB7SW1iYS5TY2hlZHVsZXJ9XG5cdCMjI1xuXHRkZWYgaW5pdGlhbGl6ZSB0YXJnZXRcblx0XHRAdGFyZ2V0ID0gdGFyZ2V0XG5cdFx0QG1hcmtlZCA9IG5vXG5cdFx0QGFjdGl2ZSA9IG5vXG5cdFx0QG1hcmtlciA9IGRvIG1hcmtcblx0XHRAdGlja2VyID0gZG8gfGV8IHRpY2soZSlcblx0XHRcblx0XHRAZXZlbnRzID0geWVzXG5cdFx0QGZwcyA9IDFcblxuXHRcdEBkdCA9IDBcblx0XHRAdGltZXN0YW1wID0gMFxuXHRcdEB0aWNrcyA9IDBcblx0XHRAZmx1c2hlcyA9IDBcblxuXHQjIyNcblx0Q2hlY2sgd2hldGhlciB0aGUgY3VycmVudCBzY2hlZHVsZXIgaXMgYWN0aXZlIG9yIG5vdFxuXHRAcmV0dXJuIHtib29sfVxuXHQjIyNcblx0ZGVmIGFjdGl2ZVxuXHRcdEBhY3RpdmVcblxuXHQjIyNcblx0RGVsdGEgdGltZSBiZXR3ZWVuIHRoZSB0d28gbGFzdCB0aWNrc1xuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgZHRcblx0XHRAZHRcblxuXHQjIyNcblx0Q29uZmlndXJlIHRoZSBzY2hlZHVsZXJcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBjb25maWd1cmUgZnBzOiAxLCBldmVudHM6IHllc1xuXHRcdEBldmVudHMgPSBldmVudHMgaWYgZXZlbnRzICE9IG51bGxcblx0XHRAZnBzID0gZnBzIGlmIGZwcyAhPSBudWxsXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRNYXJrIHRoZSBzY2hlZHVsZXIgYXMgZGlydHkuIFRoaXMgd2lsbCBtYWtlIHN1cmUgdGhhdFxuXHR0aGUgc2NoZWR1bGVyIGNhbGxzIGB0YXJnZXQudGlja2Agb24gdGhlIG5leHQgZnJhbWVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBtYXJrXG5cdFx0QG1hcmtlZCA9IHllc1xuXHRcdHNlbGZcblxuXHQjIyNcblx0SW5zdGFudGx5IHRyaWdnZXIgdGFyZ2V0LnRpY2sgYW5kIG1hcmsgc2NoZWR1bGVyIGFzIGNsZWFuIChub3QgZGlydHkvbWFya2VkKS5cblx0VGhpcyBpcyBjYWxsZWQgaW1wbGljaXRseSBmcm9tIHRpY2ssIGJ1dCBjYW4gYWxzbyBiZSBjYWxsZWQgbWFudWFsbHkgaWYgeW91XG5cdHJlYWxseSB3YW50IHRvIGZvcmNlIGEgdGljayB3aXRob3V0IHdhaXRpbmcgZm9yIHRoZSBuZXh0IGZyYW1lLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGZsdXNoXG5cdFx0QG1hcmtlZCA9IG5vXG5cdFx0QGZsdXNoZXMrK1xuXHRcdEB0YXJnZXQudGlja1xuXHRcdHNlbGZcblxuXHQjIyNcblx0QGZpeG1lIHRoaXMgZXhwZWN0cyByYWYgdG8gcnVuIGF0IDYwIGZwcyBcblxuXHRDYWxsZWQgYXV0b21hdGljYWxseSBvbiBldmVyeSBmcmFtZSB3aGlsZSB0aGUgc2NoZWR1bGVyIGlzIGFjdGl2ZS5cblx0SXQgd2lsbCBvbmx5IGNhbGwgYHRhcmdldC50aWNrYCBpZiB0aGUgc2NoZWR1bGVyIGlzIG1hcmtlZCBkaXJ0eSxcblx0b3Igd2hlbiBhY2NvcmRpbmcgdG8gQGZwcyBzZXR0aW5nLlxuXG5cdElmIHlvdSBoYXZlIHNldCB1cCBhIHNjaGVkdWxlciB3aXRoIGFuIGZwcyBvZiAxLCB0aWNrIHdpbGwgc3RpbGwgYmVcblx0Y2FsbGVkIGV2ZXJ5IGZyYW1lLCBidXQgYHRhcmdldC50aWNrYCB3aWxsIG9ubHkgYmUgY2FsbGVkIG9uY2UgZXZlcnlcblx0c2Vjb25kLCBhbmQgaXQgd2lsbCAqbWFrZSBzdXJlKiBlYWNoIGB0YXJnZXQudGlja2AgaGFwcGVucyBpbiBzZXBhcmF0ZVxuXHRzZWNvbmRzIGFjY29yZGluZyB0byBEYXRlLiBTbyBpZiB5b3UgaGF2ZSBhIG5vZGUgdGhhdCByZW5kZXJzIGEgY2xvY2tcblx0YmFzZWQgb24gRGF0ZS5ub3cgKG9yIHNvbWV0aGluZyBzaW1pbGFyKSwgeW91IGNhbiBzY2hlZHVsZSBpdCB3aXRoIDFmcHMsXG5cdG5ldmVyIG5lZWRpbmcgdG8gd29ycnkgYWJvdXQgdHdvIHRpY2tzIGhhcHBlbmluZyB3aXRoaW4gdGhlIHNhbWUgc2Vjb25kLlxuXHRUaGUgc2FtZSBnb2VzIGZvciA0ZnBzLCAxMGZwcyBldGMuXG5cblx0QHByb3RlY3RlZFxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHRpY2sgZGVsdGFcblx0XHRAdGlja3MrK1xuXHRcdEBkdCA9IGRlbHRhXG5cblx0XHRsZXQgZnBzID0gQGZwc1xuXHRcdFxuXHRcdGlmIGZwcyA9PSA2MFxuXHRcdFx0QG1hcmtlZCA9IHllc1xuXHRcdGVsaWYgZnBzID09IDMwXG5cdFx0XHRAbWFya2VkID0geWVzIGlmIEB0aWNrcyAlIDJcblx0XHRlbGlmIGZwc1xuXHRcdFx0IyBpZiBpdCBpcyBsZXNzIHJvdW5kIC0gd2UgdHJpZ2dlciBiYXNlZFxuXHRcdFx0IyBvbiBkYXRlLCBmb3IgY29uc2lzdGVudCByZW5kZXJpbmcuXG5cdFx0XHQjIGllLCBpZiB5b3Ugd2FudCB0byByZW5kZXIgZXZlcnkgc2Vjb25kXG5cdFx0XHQjIGl0IGlzIGltcG9ydGFudCB0aGF0IG5vIHR3byByZW5kZXJzXG5cdFx0XHQjIGhhcHBlbiBkdXJpbmcgdGhlIHNhbWUgc2Vjb25kIChhY2NvcmRpbmcgdG8gRGF0ZSlcblx0XHRcdGxldCBwZXJpb2QgPSAoKDYwIC8gZnBzKSAvIDYwKSAqIDEwMDBcblx0XHRcdGxldCBiZWF0ID0gTWF0aC5mbG9vcihEYXRlLm5vdyAvIHBlcmlvZClcblxuXHRcdFx0aWYgQGJlYXQgIT0gYmVhdFxuXHRcdFx0XHRAYmVhdCA9IGJlYXRcblx0XHRcdFx0QG1hcmtlZCA9IHllc1xuXG5cdFx0Zmx1c2ggaWYgQG1hcmtlZCBvciAoQGV2ZW50cyBhbmQgSW1iYS5TY2hlZHVsZXIuaXNEaXJ0eSlcblx0XHQjIHJlc2NoZWR1bGUgaWYgQGFjdGl2ZVxuXHRcdHNlbGZcblxuXHQjIyNcblx0U3RhcnQgdGhlIHNjaGVkdWxlciBpZiBpdCBpcyBub3QgYWxyZWFkeSBhY3RpdmUuXG5cdCoqV2hpbGUgYWN0aXZlKiosIHRoZSBzY2hlZHVsZXIgd2lsbCBvdmVycmlkZSBgdGFyZ2V0LmNvbW1pdGBcblx0dG8gZG8gbm90aGluZy4gQnkgZGVmYXVsdCBJbWJhLnRhZyNjb21taXQgY2FsbHMgcmVuZGVyLCBzb1xuXHR0aGF0IHJlbmRlcmluZyBpcyBjYXNjYWRlZCB0aHJvdWdoIHRvIGNoaWxkcmVuIHdoZW4gcmVuZGVyaW5nXG5cdGEgbm9kZS4gV2hlbiBhIHNjaGVkdWxlciBpcyBhY3RpdmUgKGZvciBhIG5vZGUpLCBJbWJhIGRpc2FibGVzXG5cdHRoaXMgYXV0b21hdGljIHJlbmRlcmluZy5cblx0IyMjXG5cdGRlZiBhY3RpdmF0ZVxuXHRcdHVubGVzcyBAYWN0aXZlXG5cdFx0XHRAYWN0aXZlID0geWVzXG5cdFx0XHQjIG92ZXJyaWRlIHRhcmdldCNjb21taXQgd2hpbGUgdGhpcyBpcyBhY3RpdmVcblx0XHRcdEBjb21taXQgPSBAdGFyZ2V0OmNvbW1pdFxuXHRcdFx0QHRhcmdldDpjb21taXQgPSBkbyB0aGlzXG5cdFx0XHRJbWJhLnNjaGVkdWxlKHNlbGYpXG5cdFx0XHRJbWJhLmxpc3RlbihJbWJhLCdldmVudCcsc2VsZiwnb25ldmVudCcpIGlmIEBldmVudHNcblx0XHRcdEB0YXJnZXQ/LmZsYWcoJ3NjaGVkdWxlZF8nKVxuXHRcdFx0dGljaygwKSAjIHN0YXJ0IHRpY2tpbmdcblx0XHRyZXR1cm4gc2VsZlxuXG5cdCMjI1xuXHRTdG9wIHRoZSBzY2hlZHVsZXIgaWYgaXQgaXMgYWN0aXZlLlxuXHQjIyNcblx0ZGVmIGRlYWN0aXZhdGVcblx0XHRpZiBAYWN0aXZlXG5cdFx0XHRAYWN0aXZlID0gbm9cblx0XHRcdEB0YXJnZXQ6Y29tbWl0ID0gQGNvbW1pdFxuXHRcdFx0SW1iYS51bnNjaGVkdWxlKHNlbGYpXG5cdFx0XHRJbWJhLnVubGlzdGVuKEltYmEsJ2V2ZW50JyxzZWxmKVxuXHRcdFx0QHRhcmdldD8udW5mbGFnKCdzY2hlZHVsZWRfJylcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiB0cmFja1xuXHRcdEBtYXJrZXJcblxuXHRkZWYgb25ldmVudCBldmVudFxuXHRcdHJldHVybiBzZWxmIGlmIEBtYXJrZWRcblxuXHRcdGlmIEBldmVudHMgaXNhIEZ1bmN0aW9uXG5cdFx0XHRtYXJrIGlmIEBldmVudHMoZXZlbnQpXHRcblx0XHRlbGlmIEBldmVudHMgaXNhIEFycmF5XG5cdFx0XHRtYXJrIGlmIGV2ZW50Py50eXBlIGluIEBldmVudHNcblx0XHRlbGlmIEBldmVudHNcblx0XHRcdG1hcmsgaWYgZXZlbnQuQHJlc3BvbmRlclxuXHRcdHNlbGZcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHNyYy9pbWJhL3NjaGVkdWxlci5pbWJhXG4gKiovIiwiZGVmIEltYmEuc3RhdGljIGl0ZW1zLCBuclxuXHRpdGVtczpzdGF0aWMgPSBuclxuXHRyZXR1cm4gaXRlbXNcblxuIyMjXG5UaGlzIGlzIHRoZSBiYXNlY2xhc3MgdGhhdCBhbGwgdGFncyBpbiBpbWJhIGluaGVyaXQgZnJvbS5cbkBpbmFtZSBub2RlXG4jIyNcbmNsYXNzIEltYmEuVGFnXG5cblx0ZGVmIHNlbGYuY3JlYXRlTm9kZVxuXHRcdHRocm93IFwiTm90IGltcGxlbWVudGVkXCJcblxuXHRkZWYgc2VsZi5idWlsZFxuXHRcdHNlbGYubmV3KHNlbGYuY3JlYXRlTm9kZSlcblxuXHRwcm9wIG9iamVjdFxuXG5cdGRlZiBkb21cblx0XHRAZG9tXG5cblx0ZGVmIGluaXRpYWxpemUgZG9tXG5cdFx0c2VsZi5kb20gPSBkb21cblx0XHRcblx0ZGVmIHNldERvbSBkb21cblx0XHRkb20uQHRhZyA9IHNlbGZcblx0XHRAZG9tID0gZG9tXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTZXR0aW5nIHJlZmVyZW5jZXMgZm9yIHRhZ3MgbGlrZVxuXHRgPGRpdkBoZWFkZXI+YCB3aWxsIGNvbXBpbGUgdG8gYHRhZygnZGl2Jykuc2V0UmVmKCdoZWFkZXInLHRoaXMpLmVuZCgpYFxuXHRCeSBkZWZhdWx0IGl0IGFkZHMgdGhlIHJlZmVyZW5jZSBhcyBhIGNsYXNzTmFtZSB0byB0aGUgdGFnLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNldFJlZiByZWYsIGN0eFxuXHRcdGZsYWcoQHJlZiA9IHJlZilcblx0XHRzZWxmXG5cblx0IyMjXG5cdE1ldGhvZCB0aGF0IGlzIGNhbGxlZCBieSB0aGUgY29tcGlsZWQgdGFnLWNoYWlucywgZm9yXG5cdGJpbmRpbmcgZXZlbnRzIG9uIHRhZ3MgdG8gbWV0aG9kcyBldGMuXG5cdGA8YSA6dGFwPWZuPmAgY29tcGlsZXMgdG8gYHRhZygnYScpLnNldEhhbmRsZXIoJ3RhcCcsZm4sdGhpcykuZW5kKClgXG5cdHdoZXJlIHRoaXMgcmVmZXJzIHRvIHRoZSBjb250ZXh0IGluIHdoaWNoIHRoZSB0YWcgaXMgY3JlYXRlZC5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzZXRIYW5kbGVyIGV2ZW50LCBoYW5kbGVyLCBjdHhcblx0XHR2YXIga2V5ID0gJ29uJyArIGV2ZW50XG5cblx0XHRpZiBoYW5kbGVyIGlzYSBGdW5jdGlvblxuXHRcdFx0c2VsZltrZXldID0gaGFuZGxlclxuXHRcdGVsaWYgaGFuZGxlciBpc2EgQXJyYXlcblx0XHRcdHZhciBmbiA9IGhhbmRsZXIuc2hpZnRcblx0XHRcdHNlbGZba2V5XSA9IGRvIHxlfCBjdHhbZm5dLmFwcGx5KGN0eCxoYW5kbGVyLmNvbmNhdChlKSlcblx0XHRlbHNlXG5cdFx0XHRzZWxmW2tleV0gPSBkbyB8ZXwgY3R4W2hhbmRsZXJdKGUpXG5cdFx0c2VsZlxuXG5cdGRlZiBpZD0gaWRcblx0XHRkb206aWQgPSBpZFxuXHRcdHNlbGZcblxuXHRkZWYgaWRcblx0XHRkb206aWRcblxuXHQjIyNcblx0QWRkcyBhIG5ldyBhdHRyaWJ1dGUgb3IgY2hhbmdlcyB0aGUgdmFsdWUgb2YgYW4gZXhpc3RpbmcgYXR0cmlidXRlXG5cdG9uIHRoZSBzcGVjaWZpZWQgdGFnLiBJZiB0aGUgdmFsdWUgaXMgbnVsbCBvciBmYWxzZSwgdGhlIGF0dHJpYnV0ZVxuXHR3aWxsIGJlIHJlbW92ZWQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0QXR0cmlidXRlIG5hbWUsIHZhbHVlXG5cdFx0IyBzaG91bGQgdGhpcyBub3QgcmV0dXJuIHNlbGY/XG5cdFx0dmFyIG9sZCA9IGRvbS5nZXRBdHRyaWJ1dGUobmFtZSlcblxuXHRcdGlmIG9sZCA9PSB2YWx1ZVxuXHRcdFx0dmFsdWVcblx0XHRlbGlmIHZhbHVlICE9IG51bGwgJiYgdmFsdWUgIT09IGZhbHNlXG5cdFx0XHRkb20uc2V0QXR0cmlidXRlKG5hbWUsdmFsdWUpXG5cdFx0ZWxzZVxuXHRcdFx0ZG9tLnJlbW92ZUF0dHJpYnV0ZShuYW1lKVxuXG5cdCMjI1xuXHRyZW1vdmVzIGFuIGF0dHJpYnV0ZSBmcm9tIHRoZSBzcGVjaWZpZWQgdGFnXG5cdCMjI1xuXHRkZWYgcmVtb3ZlQXR0cmlidXRlIG5hbWVcblx0XHRkb20ucmVtb3ZlQXR0cmlidXRlKG5hbWUpXG5cblx0IyMjXG5cdHJldHVybnMgdGhlIHZhbHVlIG9mIGFuIGF0dHJpYnV0ZSBvbiB0aGUgdGFnLlxuXHRJZiB0aGUgZ2l2ZW4gYXR0cmlidXRlIGRvZXMgbm90IGV4aXN0LCB0aGUgdmFsdWUgcmV0dXJuZWRcblx0d2lsbCBlaXRoZXIgYmUgbnVsbCBvciBcIlwiICh0aGUgZW1wdHkgc3RyaW5nKVxuXHQjIyNcblx0ZGVmIGdldEF0dHJpYnV0ZSBuYW1lXG5cdFx0ZG9tLmdldEF0dHJpYnV0ZShuYW1lKVxuXG5cdCMjI1xuXHRPdmVycmlkZSB0aGlzIHRvIHByb3ZpZGUgc3BlY2lhbCB3cmFwcGluZyBldGMuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0Q29udGVudCBjb250ZW50LCB0eXBlXG5cdFx0c2V0Q2hpbGRyZW4gY29udGVudCwgdHlwZVxuXHRcdHNlbGZcblxuXHQjIyNcblx0U2V0IHRoZSBjaGlsZHJlbiBvZiBub2RlLiB0eXBlIHBhcmFtIGlzIG9wdGlvbmFsLFxuXHRhbmQgc2hvdWxkIG9ubHkgYmUgdXNlZCBieSBJbWJhIHdoZW4gY29tcGlsaW5nIHRhZyB0cmVlcy4gXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0Q2hpbGRyZW4gbm9kZXMsIHR5cGVcblx0XHR0aHJvdyBcIk5vdCBpbXBsZW1lbnRlZFwiXG5cblx0IyMjXG5cdEdldCB0ZXh0IG9mIG5vZGUuIFVzZXMgdGV4dENvbnRlbnQgYmVoaW5kIHRoZSBzY2VuZXMgKG5vdCBpbm5lclRleHQpXG5cdFtodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvTm9kZS90ZXh0Q29udGVudF0oKVxuXHRAcmV0dXJuIHtzdHJpbmd9IGlubmVyIHRleHQgb2Ygbm9kZVxuXHQjIyNcblx0ZGVmIHRleHQgdlxuXHRcdEBkb206dGV4dENvbnRlbnRcblxuXHQjIyNcblx0U2V0IHRleHQgb2Ygbm9kZS4gVXNlcyB0ZXh0Q29udGVudCBiZWhpbmQgdGhlIHNjZW5lcyAobm90IGlubmVyVGV4dClcblx0W2h0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Ob2RlL3RleHRDb250ZW50XSgpXG5cdCMjI1xuXHRkZWYgdGV4dD0gdHh0XG5cdFx0QGVtcHR5ID0gbm9cblx0XHRAZG9tOnRleHRDb250ZW50ID0gdHh0ID89IFwiXCJcblx0XHRzZWxmXG5cblxuXHQjIyNcblx0TWV0aG9kIGZvciBnZXR0aW5nIGFuZCBzZXR0aW5nIGRhdGEtYXR0cmlidXRlcy4gV2hlbiBjYWxsZWQgd2l0aCB6ZXJvXG5cdGFyZ3VtZW50cyBpdCB3aWxsIHJldHVybiB0aGUgYWN0dWFsIGRhdGFzZXQgZm9yIHRoZSB0YWcuXG5cblx0XHR2YXIgbm9kZSA9IDxkaXYgZGF0YS1uYW1lPSdoZWxsbyc+XG5cdFx0IyBnZXQgdGhlIHdob2xlIGRhdGFzZXRcblx0XHRub2RlLmRhdGFzZXQgIyB7bmFtZTogJ2hlbGxvJ31cblx0XHQjIGdldCBhIHNpbmdsZSB2YWx1ZVxuXHRcdG5vZGUuZGF0YXNldCgnbmFtZScpICMgJ2hlbGxvJ1xuXHRcdCMgc2V0IGEgc2luZ2xlIHZhbHVlXG5cdFx0bm9kZS5kYXRhc2V0KCduYW1lJywnbmV3bmFtZScpICMgc2VsZlxuXG5cblx0IyMjXG5cdGRlZiBkYXRhc2V0IGtleSwgdmFsXG5cdFx0dGhyb3cgXCJOb3QgaW1wbGVtZW50ZWRcIlxuXG5cdCMjI1xuXHRFbXB0eSBwbGFjZWhvbGRlci4gT3ZlcnJpZGUgdG8gaW1wbGVtZW50IGN1c3RvbSByZW5kZXIgYmVoYXZpb3VyLlxuXHRXb3JrcyBtdWNoIGxpa2UgdGhlIGZhbWlsaWFyIHJlbmRlci1tZXRob2QgaW4gUmVhY3QuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgcmVuZGVyXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRDYWxsZWQgaW1wbGljaXRseSB0aHJvdWdoIEltYmEuVGFnI2VuZCwgdXBvbiBjcmVhdGluZyBhIHRhZy4gQWxsXG5cdHByb3BlcnRpZXMgd2lsbCBoYXZlIGJlZW4gc2V0IGJlZm9yZSBidWlsZCBpcyBjYWxsZWQsIGluY2x1ZGluZ1xuXHRzZXRDb250ZW50LlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGJ1aWxkXG5cdFx0cmVuZGVyXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRDYWxsZWQgaW1wbGljaXRseSB0aHJvdWdoIEltYmEuVGFnI2VuZCwgZm9yIHRhZ3MgdGhhdCBhcmUgcGFydCBvZlxuXHRhIHRhZyB0cmVlICh0aGF0IGFyZSByZW5kZXJlZCBzZXZlcmFsIHRpbWVzKS5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBjb21taXRcblx0XHRyZW5kZXJcblx0XHRzZWxmXG5cblx0IyMjXG5cblx0Q2FsbGVkIGJ5IHRoZSB0YWctc2NoZWR1bGVyIChpZiB0aGlzIHRhZyBpcyBzY2hlZHVsZWQpXG5cdEJ5IGRlZmF1bHQgaXQgd2lsbCBjYWxsIHRoaXMucmVuZGVyLiBEbyBub3Qgb3ZlcnJpZGUgdW5sZXNzXG5cdHlvdSByZWFsbHkgdW5kZXJzdGFuZCBpdC5cblxuXHQjIyNcblx0ZGVmIHRpY2tcblx0XHRyZW5kZXJcblx0XHRzZWxmXG5cblx0IyMjXG5cdFxuXHRBIHZlcnkgaW1wb3J0YW50IG1ldGhvZCB0aGF0IHlvdSB3aWxsIHByYWN0aWNhbGx5IG5ldmVyIG1hbnVhbGx5LlxuXHRUaGUgdGFnIHN5bnRheCBvZiBJbWJhIGNvbXBpbGVzIHRvIGEgY2hhaW4gb2Ygc2V0dGVycywgd2hpY2ggYWx3YXlzXG5cdGVuZHMgd2l0aCAuZW5kLiBgPGEubGFyZ2U+YCBjb21waWxlcyB0byBgdGFnKCdhJykuZmxhZygnbGFyZ2UnKS5lbmQoKWBcblx0XG5cdFlvdSBhcmUgaGlnaGx5IGFkdmljZWQgdG8gbm90IG92ZXJyaWRlIGl0cyBiZWhhdmlvdXIuIFRoZSBmaXJzdCB0aW1lXG5cdGVuZCBpcyBjYWxsZWQgaXQgd2lsbCBtYXJrIHRoZSB0YWcgYXMgYnVpbHQgYW5kIGNhbGwgSW1iYS5UYWcjYnVpbGQsXG5cdGFuZCBjYWxsIEltYmEuVGFnI2NvbW1pdCBvbiBzdWJzZXF1ZW50IGNhbGxzLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGVuZFxuXHRcdGlmIEBidWlsdFxuXHRcdFx0Y29tbWl0XG5cdFx0ZWxzZVxuXHRcdFx0QGJ1aWx0ID0geWVzXG5cdFx0XHRidWlsZFxuXHRcdHNlbGZcblxuXHQjIyNcblx0VGhpcyBpcyBjYWxsZWQgaW5zdGVhZCBvZiBJbWJhLlRhZyNlbmQgZm9yIGA8c2VsZj5gIHRhZyBjaGFpbnMuXG5cdERlZmF1bHRzIHRvIG5vb3Bcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzeW5jZWRcblx0XHRzZWxmXG5cblx0IyBjYWxsZWQgd2hlbiB0aGUgbm9kZSBpcyBhd2FrZW5lZCBpbiB0aGUgZG9tIC0gZWl0aGVyIGF1dG9tYXRpY2FsbHlcblx0IyB1cG9uIGF0dGFjaG1lbnQgdG8gdGhlIGRvbS10cmVlLCBvciB0aGUgZmlyc3QgdGltZSBpbWJhIG5lZWRzIHRoZVxuXHQjIHRhZyBmb3IgYSBkb21ub2RlIHRoYXQgaGFzIGJlZW4gcmVuZGVyZWQgb24gdGhlIHNlcnZlclxuXHRkZWYgYXdha2VuXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRMaXN0IG9mIGZsYWdzIGZvciB0aGlzIG5vZGUuIFxuXHQjIyNcblx0ZGVmIGZsYWdzXG5cdFx0QGRvbTpjbGFzc0xpc3RcblxuXHQjIyNcblx0QWRkIHNwZWZpY2llZCBmbGFnIHRvIGN1cnJlbnQgbm9kZS5cblx0SWYgYSBzZWNvbmQgYXJndW1lbnQgaXMgc3VwcGxpZWQsIGl0IHdpbGwgYmUgY29lcmNlZCBpbnRvIGEgQm9vbGVhbixcblx0YW5kIHVzZWQgdG8gaW5kaWNhdGUgd2hldGhlciB3ZSBzaG91bGQgcmVtb3ZlIHRoZSBmbGFnIGluc3RlYWQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgZmxhZyBuYW1lLCB0b2dnbGVyXG5cdFx0IyBpdCBpcyBtb3N0IG5hdHVyYWwgdG8gdHJlYXQgYSBzZWNvbmQgdW5kZWZpbmVkIGFyZ3VtZW50IGFzIGEgbm8tc3dpdGNoXG5cdFx0IyBzbyB3ZSBuZWVkIHRvIGNoZWNrIHRoZSBhcmd1bWVudHMtbGVuZ3RoXG5cdFx0aWYgYXJndW1lbnRzOmxlbmd0aCA9PSAyIGFuZCAhdG9nZ2xlclxuXHRcdFx0QGRvbTpjbGFzc0xpc3QucmVtb3ZlKG5hbWUpXG5cdFx0ZWxzZVxuXHRcdFx0QGRvbTpjbGFzc0xpc3QuYWRkKG5hbWUpXG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblx0UmVtb3ZlIHNwZWNpZmllZCBmbGFnIGZyb20gbm9kZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHVuZmxhZyBuYW1lXG5cdFx0QGRvbTpjbGFzc0xpc3QucmVtb3ZlKG5hbWUpXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRUb2dnbGUgc3BlY2lmaWVkIGZsYWcgb24gbm9kZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHRvZ2dsZUZsYWcgbmFtZVxuXHRcdEBkb206Y2xhc3NMaXN0LnRvZ2dsZShuYW1lKVxuXHRcdHNlbGZcblxuXHQjIyNcblx0Q2hlY2sgd2hldGhlciBjdXJyZW50IG5vZGUgaGFzIHNwZWNpZmllZCBmbGFnXG5cdEByZXR1cm4ge2Jvb2x9XG5cdCMjI1xuXHRkZWYgaGFzRmxhZyBuYW1lXG5cdFx0QGRvbTpjbGFzc0xpc3QuY29udGFpbnMobmFtZSlcblxuXHQjIyNcblx0R2V0IHRoZSBzY2hlZHVsZXIgZm9yIHRoaXMgbm9kZS4gQSBuZXcgc2NoZWR1bGVyIHdpbGwgYmUgY3JlYXRlZFxuXHRpZiBpdCBkb2VzIG5vdCBhbHJlYWR5IGV4aXN0LlxuXG5cdEByZXR1cm4ge0ltYmEuU2NoZWR1bGVyfVxuXHQjIyNcblx0ZGVmIHNjaGVkdWxlclxuXHRcdEBzY2hlZHVsZXIgPz0gSW1iYS5TY2hlZHVsZXIubmV3KHNlbGYpXG5cblx0IyMjXG5cblx0U2hvcnRoYW5kIHRvIHN0YXJ0IHNjaGVkdWxpbmcgYSBub2RlLiBUaGUgbWV0aG9kIHdpbGwgYmFzaWNhbGx5XG5cdHByb3h5IHRoZSBhcmd1bWVudHMgdGhyb3VnaCB0byBzY2hlZHVsZXIuY29uZmlndXJlLCBhbmQgdGhlblxuXHRhY3RpdmF0ZSB0aGUgc2NoZWR1bGVyLlxuXHRcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzY2hlZHVsZSBvcHRpb25zID0ge31cblx0XHRzY2hlZHVsZXIuY29uZmlndXJlKG9wdGlvbnMpLmFjdGl2YXRlXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTaG9ydGhhbmQgZm9yIGRlYWN0aXZhdGluZyBzY2hlZHVsZXIgKGlmIHRhZyBoYXMgb25lKS5cblx0QGRlcHJlY2F0ZWRcblx0IyMjXG5cdGRlZiB1bnNjaGVkdWxlXG5cdFx0c2NoZWR1bGVyLmRlYWN0aXZhdGUgaWYgQHNjaGVkdWxlclxuXHRcdHNlbGZcblxuXG5cdCMjI1xuXHRHZXQgdGhlIHBhcmVudCBvZiBjdXJyZW50IG5vZGVcblx0QHJldHVybiB7SW1iYS5UYWd9IFxuXHQjIyNcblx0ZGVmIHBhcmVudFxuXHRcdHRhZyhkb206cGFyZW50Tm9kZSlcblxuXHQjIyNcblx0U2hvcnRoYW5kIGZvciBjb25zb2xlLmxvZyBvbiBlbGVtZW50c1xuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGxvZyAqYXJnc1xuXHRcdGFyZ3MudW5zaGlmdChjb25zb2xlKVxuXHRcdEZ1bmN0aW9uOnByb3RvdHlwZTpjYWxsLmFwcGx5KGNvbnNvbGU6bG9nLCBhcmdzKVxuXHRcdHNlbGZcblxuXHRkZWYgY3NzIGtleSwgdmFsXG5cdFx0aWYga2V5IGlzYSBPYmplY3Rcblx0XHRcdGNzcyhrLHYpIGZvciBvd24gayx2IG9mIGtleVxuXHRcdGVsaWYgdmFsID09IG51bGxcblx0XHRcdGRvbTpzdHlsZS5yZW1vdmVQcm9wZXJ0eShrZXkpXG5cdFx0ZWxpZiB2YWwgPT0gdW5kZWZpbmVkXG5cdFx0XHRyZXR1cm4gZG9tOnN0eWxlW2tleV1cblx0XHRlbHNlXG5cdFx0XHRpZiB2YWwgaXNhIE51bWJlciBhbmQga2V5Lm1hdGNoKC93aWR0aHxoZWlnaHR8bGVmdHxyaWdodHx0b3B8Ym90dG9tLylcblx0XHRcdFx0dmFsID0gdmFsICsgXCJweFwiXG5cdFx0XHRkb206c3R5bGVba2V5XSA9IHZhbFxuXHRcdHNlbGZcblxuXHRkZWYgdHJhbnNmb3JtPSB2YWx1ZVxuXHRcdGNzcyg6dHJhbnNmb3JtLCB2YWx1ZSlcblx0XHRzZWxmXG5cblx0ZGVmIHRyYW5zZm9ybVxuXHRcdGNzcyg6dHJhbnNmb3JtKVxuXG5cbkltYmEuVGFnOnByb3RvdHlwZTppbml0aWFsaXplID0gSW1iYS5UYWdcblxuSFRNTF9UQUdTID0gXCJhIGFiYnIgYWRkcmVzcyBhcmVhIGFydGljbGUgYXNpZGUgYXVkaW8gYiBiYXNlIGJkaSBiZG8gYmlnIGJsb2NrcXVvdGUgYm9keSBiciBidXR0b24gY2FudmFzIGNhcHRpb24gY2l0ZSBjb2RlIGNvbCBjb2xncm91cCBkYXRhIGRhdGFsaXN0IGRkIGRlbCBkZXRhaWxzIGRmbiBkaXYgZGwgZHQgZW0gZW1iZWQgZmllbGRzZXQgZmlnY2FwdGlvbiBmaWd1cmUgZm9vdGVyIGZvcm0gaDEgaDIgaDMgaDQgaDUgaDYgaGVhZCBoZWFkZXIgaHIgaHRtbCBpIGlmcmFtZSBpbWcgaW5wdXQgaW5zIGtiZCBrZXlnZW4gbGFiZWwgbGVnZW5kIGxpIGxpbmsgbWFpbiBtYXAgbWFyayBtZW51IG1lbnVpdGVtIG1ldGEgbWV0ZXIgbmF2IG5vc2NyaXB0IG9iamVjdCBvbCBvcHRncm91cCBvcHRpb24gb3V0cHV0IHAgcGFyYW0gcHJlIHByb2dyZXNzIHEgcnAgcnQgcnVieSBzIHNhbXAgc2NyaXB0IHNlY3Rpb24gc2VsZWN0IHNtYWxsIHNvdXJjZSBzcGFuIHN0cm9uZyBzdHlsZSBzdWIgc3VtbWFyeSBzdXAgdGFibGUgdGJvZHkgdGQgdGV4dGFyZWEgdGZvb3QgdGggdGhlYWQgdGltZSB0aXRsZSB0ciB0cmFjayB1IHVsIHZhciB2aWRlbyB3YnJcIi5zcGxpdChcIiBcIilcbkhUTUxfVEFHU19VTlNBRkUgPSBcImFydGljbGUgYXNpZGUgaGVhZGVyIHNlY3Rpb25cIi5zcGxpdChcIiBcIilcblNWR19UQUdTID0gXCJjaXJjbGUgZGVmcyBlbGxpcHNlIGcgbGluZSBsaW5lYXJHcmFkaWVudCBtYXNrIHBhdGggcGF0dGVybiBwb2x5Z29uIHBvbHlsaW5lIHJhZGlhbEdyYWRpZW50IHJlY3Qgc3RvcCBzdmcgdGV4dCB0c3BhblwiLnNwbGl0KFwiIFwiKVxuXG5cbmRlZiBleHRlbmRlciBvYmosIHN1cFxuXHRmb3Igb3duIGssdiBvZiBzdXBcblx0XHRvYmpba10gPz0gdlxuXG5cdG9iajpwcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cDpwcm90b3R5cGUpXG5cdG9iajpfX3N1cGVyX18gPSBvYmo6cHJvdG90eXBlOl9fc3VwZXJfXyA9IHN1cDpwcm90b3R5cGVcblx0b2JqOnByb3RvdHlwZTppbml0aWFsaXplID0gb2JqOnByb3RvdHlwZTpjb25zdHJ1Y3RvciA9IG9ialxuXHRzdXAuaW5oZXJpdChvYmopIGlmIHN1cDppbmhlcml0XG5cdHJldHVybiBvYmpcblxuZGVmIFRhZ1xuXHRyZXR1cm4gZG8gfGRvbXxcblx0XHR0aGlzLnNldERvbShkb20pXG5cdFx0cmV0dXJuIHRoaXNcblxuZGVmIFRhZ1NwYXduZXIgdHlwZVxuXHRyZXR1cm4gZG8gdHlwZS5idWlsZFxuXG5jbGFzcyBJbWJhLlRhZ3NcblxuXHRkZWYgaW5pdGlhbGl6ZVxuXHRcdHNlbGZcblxuXHRkZWYgX19jbG9uZSBuc1xuXHRcdHZhciBjbG9uZSA9IE9iamVjdC5jcmVhdGUoc2VsZilcblx0XHRjbG9uZS5AcGFyZW50ID0gc2VsZlxuXHRcdHJldHVybiBjbG9uZVxuXG5cdGRlZiBkZWZpbmVOYW1lc3BhY2UgbmFtZVxuXHRcdHZhciBjbG9uZSA9IE9iamVjdC5jcmVhdGUoc2VsZilcblx0XHRjbG9uZS5AcGFyZW50ID0gc2VsZlxuXHRcdGNsb25lLkBucyA9IG5hbWVcblx0XHRzZWxmW25hbWUudG9VcHBlckNhc2VdID0gY2xvbmVcblx0XHRyZXR1cm4gY2xvbmVcblxuXHRkZWYgYmFzZVR5cGUgbmFtZVxuXHRcdG5hbWUgaW4gSFRNTF9UQUdTID8gJ2h0bWxlbGVtZW50JyA6ICdkaXYnXG5cblx0ZGVmIGRlZmluZVRhZyBuYW1lLCBzdXByID0gJycsICZib2R5XG5cdFx0c3VwciB8fD0gYmFzZVR5cGUobmFtZSlcblx0XHRsZXQgc3VwZXJ0eXBlID0gc2VsZltzdXByXVxuXHRcdGxldCB0YWd0eXBlID0gVGFnKClcblx0XHRsZXQgbm9ybSA9IG5hbWUucmVwbGFjZSgvXFwtL2csJ18nKVxuXG5cblx0XHR0YWd0eXBlLkBuYW1lID0gbmFtZVxuXHRcdGV4dGVuZGVyKHRhZ3R5cGUsc3VwZXJ0eXBlKVxuXG5cdFx0aWYgbmFtZVswXSA9PSAnIydcblx0XHRcdHNlbGZbbmFtZV0gPSB0YWd0eXBlXG5cdFx0XHRJbWJhLlNJTkdMRVRPTlNbbmFtZS5zbGljZSgxKV0gPSB0YWd0eXBlXG5cdFx0ZWxzZVxuXHRcdFx0c2VsZltuYW1lXSA9IHRhZ3R5cGVcblx0XHRcdHNlbGZbJyQnK25vcm1dID0gVGFnU3Bhd25lcih0YWd0eXBlKVxuXG5cdFx0aWYgYm9keVxuXHRcdFx0aWYgYm9keTpsZW5ndGggPT0gMlxuXHRcdFx0XHQjIGNyZWF0ZSBjbG9uZVxuXHRcdFx0XHR1bmxlc3MgdGFndHlwZS5oYXNPd25Qcm9wZXJ0eSgnVEFHUycpXG5cdFx0XHRcdFx0dGFndHlwZS5UQUdTID0gKHN1cGVydHlwZS5UQUdTIG9yIHNlbGYpLl9fY2xvbmVcblxuXHRcdFx0Ym9keS5jYWxsKHRhZ3R5cGUsdGFndHlwZSwgdGFndHlwZS5UQUdTIG9yIHNlbGYpXG5cblx0XHRyZXR1cm4gdGFndHlwZVxuXG5cdGRlZiBkZWZpbmVTaW5nbGV0b24gbmFtZSwgc3VwciwgJmJvZHlcblx0XHRkZWZpbmVUYWcobmFtZSxzdXByLGJvZHkpXG5cblx0ZGVmIGV4dGVuZFRhZyBuYW1lLCBzdXByID0gJycsICZib2R5XG5cdFx0dmFyIGtsYXNzID0gKG5hbWUgaXNhIFN0cmluZyA/IHNlbGZbbmFtZV0gOiBuYW1lKVxuXHRcdCMgYWxsb3cgZm9yIHByaXZhdGUgdGFncyBoZXJlIGFzIHdlbGw/XG5cdFx0Ym9keSBhbmQgYm9keS5jYWxsKGtsYXNzLGtsYXNzLGtsYXNzOnByb3RvdHlwZSkgaWYgYm9keVxuXHRcdHJldHVybiBrbGFzc1xuXG5cbkltYmEuVEFHUyA9IEltYmEuVGFncy5uZXdcbkltYmEuVEFHU1s6ZWxlbWVudF0gPSBJbWJhLlRhZ1xuXG52YXIgc3ZnID0gSW1iYS5UQUdTLmRlZmluZU5hbWVzcGFjZSgnc3ZnJylcblxuZGVmIHN2Zy5iYXNlVHlwZSBuYW1lXG5cdCdzdmdlbGVtZW50J1xuXG5cbkltYmEuU0lOR0xFVE9OUyA9IHt9XG5cblxuZGVmIEltYmEuZGVmaW5lVGFnIG5hbWUsIHN1cHIgPSAnJywgJmJvZHlcblx0cmV0dXJuIEltYmEuVEFHUy5kZWZpbmVUYWcobmFtZSxzdXByLGJvZHkpXG5cbmRlZiBJbWJhLmRlZmluZVNpbmdsZXRvblRhZyBpZCwgc3VwciA9ICdkaXYnLCAmYm9keVxuXHRyZXR1cm4gSW1iYS5UQUdTLmRlZmluZVRhZyhuYW1lLHN1cHIsYm9keSlcblxuZGVmIEltYmEuZXh0ZW5kVGFnIG5hbWUsIGJvZHlcblx0cmV0dXJuIEltYmEuVEFHUy5leHRlbmRUYWcobmFtZSxib2R5KVxuXG5kZWYgSW1iYS50YWcgbmFtZVxuXHR2YXIgdHlwID0gSW1iYS5UQUdTW25hbWVdXG5cdHRocm93IEVycm9yLm5ldyhcInRhZyB7bmFtZX0gaXMgbm90IGRlZmluZWRcIikgaWYgIXR5cFxuXHRyZXR1cm4gdHlwLm5ldyh0eXAuY3JlYXRlTm9kZSlcblxuZGVmIEltYmEudGFnV2l0aElkIG5hbWUsIGlkXG5cdHZhciB0eXAgPSBJbWJhLlRBR1NbbmFtZV1cblx0dGhyb3cgRXJyb3IubmV3KFwidGFnIHtuYW1lfSBpcyBub3QgZGVmaW5lZFwiKSBpZiAhdHlwXG5cdHZhciBkb20gPSB0eXAuY3JlYXRlTm9kZVxuXHRkb206aWQgPSBpZFxuXHRyZXR1cm4gdHlwLm5ldyhkb20pXG5cbiMgVE9ETzogQ2FuIHdlIG1vdmUgdGhlc2Ugb3V0IGFuZCBpbnRvIGRvbS5pbWJhIGluIGEgY2xlYW4gd2F5P1xuIyBUaGVzZSBtZXRob2RzIGRlcGVuZHMgb24gSW1iYS5kb2N1bWVudC5nZXRFbGVtZW50QnlJZFxuXG5kZWYgSW1iYS5nZXRUYWdTaW5nbGV0b24gaWRcdFxuXHR2YXIgZG9tLCBub2RlXG5cblx0aWYgdmFyIGtsYXNzID0gSW1iYS5TSU5HTEVUT05TW2lkXVxuXHRcdHJldHVybiBrbGFzcy5JbnN0YW5jZSBpZiBrbGFzcyBhbmQga2xhc3MuSW5zdGFuY2UgXG5cblx0XHQjIG5vIGluc3RhbmNlIC0gY2hlY2sgZm9yIGVsZW1lbnRcblx0XHRpZiBkb20gPSBJbWJhLmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxuXHRcdFx0IyB3ZSBoYXZlIGEgbGl2ZSBpbnN0YW5jZSAtIHdoZW4gZmluZGluZyBpdCB0aHJvdWdoIGEgc2VsZWN0b3Igd2Ugc2hvdWxkIGF3YWtlIGl0LCBubz9cblx0XHRcdCMgY29uc29sZS5sb2coJ2NyZWF0aW5nIHRoZSBzaW5nbGV0b24gZnJvbSBleGlzdGluZyBub2RlIGluIGRvbT8nLGlkLHR5cGUpXG5cdFx0XHRub2RlID0ga2xhc3MuSW5zdGFuY2UgPSBrbGFzcy5uZXcoZG9tKVxuXHRcdFx0bm9kZS5hd2FrZW4oZG9tKSAjIHNob3VsZCBvbmx5IGF3YWtlblxuXHRcdFx0cmV0dXJuIG5vZGVcblxuXHRcdGRvbSA9IGtsYXNzLmNyZWF0ZU5vZGVcblx0XHRkb206aWQgPSBpZFxuXHRcdG5vZGUgPSBrbGFzcy5JbnN0YW5jZSA9IGtsYXNzLm5ldyhkb20pXG5cdFx0bm9kZS5lbmQuYXdha2VuKGRvbSlcblx0XHRyZXR1cm4gbm9kZVxuXHRlbGlmIGRvbSA9IEltYmEuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXG5cdFx0cmV0dXJuIEltYmEuZ2V0VGFnRm9yRG9tKGRvbSlcblxudmFyIHN2Z1N1cHBvcnQgPSB0eXBlb2YgU1ZHRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCdcblxuZGVmIEltYmEuZ2V0VGFnRm9yRG9tIGRvbVxuXHRyZXR1cm4gbnVsbCB1bmxlc3MgZG9tXG5cdHJldHVybiBkb20gaWYgZG9tLkBkb20gIyBjb3VsZCB1c2UgaW5oZXJpdGFuY2UgaW5zdGVhZFxuXHRyZXR1cm4gZG9tLkB0YWcgaWYgZG9tLkB0YWdcblx0cmV0dXJuIG51bGwgdW5sZXNzIGRvbTpub2RlTmFtZVxuXG5cdHZhciBucyAgID0gbnVsbFxuXHR2YXIgaWQgICA9IGRvbTppZFxuXHR2YXIgdHlwZSA9IGRvbTpub2RlTmFtZS50b0xvd2VyQ2FzZVxuXHR2YXIgdGFncyA9IEltYmEuVEFHU1xuXHR2YXIgbmF0aXZlID0gdHlwZVxuXHR2YXIgY2xzICA9IGRvbTpjbGFzc05hbWVcblxuXHRpZiBpZCBhbmQgSW1iYS5TSU5HTEVUT05TW2lkXVxuXHRcdCMgRklYTUUgY29udHJvbCB0aGF0IGl0IGlzIHRoZSBzYW1lIHNpbmdsZXRvbj9cblx0XHQjIG1pZ2h0IGNvbGxpZGUgLS0gbm90IGdvb2Q/XG5cdFx0cmV0dXJuIEltYmEuZ2V0VGFnU2luZ2xldG9uKGlkKVxuXHQjIGxvb2sgZm9yIGlkIC0gc2luZ2xldG9uXG5cblx0IyBuZWVkIGJldHRlciB0ZXN0IGhlcmVcblx0aWYgc3ZnU3VwcG9ydCBhbmQgZG9tIGlzYSBTVkdFbGVtZW50XG5cdFx0bnMgPSBcInN2Z1wiIFxuXHRcdGNscyA9IGRvbTpjbGFzc05hbWU6YmFzZVZhbFxuXHRcdHRhZ3MgPSB0YWdzLlNWR1xuXG5cdHZhciBzcGF3bmVyXG5cblx0aWYgY2xzXG5cdFx0IyB0aGVyZSBjYW4gYmUgc2V2ZXJhbCBtYXRjaGVzIGhlcmUgLSBzaG91bGQgY2hvb3NlIHRoZSBsYXN0XG5cdFx0IyBzaG91bGQgZmFsbCBiYWNrIHRvIGxlc3Mgc3BlY2lmaWMgbGF0ZXI/IC0gb3RoZXJ3aXNlIHRoaW5ncyBtYXkgZmFpbFxuXHRcdCMgVE9ETyByZXdvcmsgdGhpc1xuXHRcdGlmIHZhciBtID0gY2xzLm1hdGNoKC9cXGJfKFthLXpcXC1dKylcXGIoPyFcXHMqX1thLXpcXC1dKykvKVxuXHRcdFx0dHlwZSA9IG1bMV0gIyAucmVwbGFjZSgvLS9nLCdfJylcblxuXHRcdGlmIG0gPSBjbHMubWF0Y2goL1xcYihbQS1aXFwtXSspX1xcYi8pXG5cdFx0XHRucyA9IG1bMV1cblxuXG5cdHNwYXduZXIgPSB0YWdzW3R5cGVdIG9yIHRhZ3NbbmF0aXZlXVxuXHRzcGF3bmVyID8gc3Bhd25lci5uZXcoZG9tKS5hd2FrZW4oZG9tKSA6IG51bGxcblxudGFnJCA9IEltYmEuVEFHU1xudCQgPSBJbWJhOnRhZ1xudGMkID0gSW1iYTp0YWdXaXRoRmxhZ3NcbnRpJCA9IEltYmE6dGFnV2l0aElkXG50aWMkID0gSW1iYTp0YWdXaXRoSWRBbmRGbGFnc1xuaWQkID0gSW1iYTpnZXRUYWdTaW5nbGV0b25cbnRhZyR3cmFwID0gSW1iYTpnZXRUYWdGb3JEb21cblxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogc3JjL2ltYmEvdGFnLmltYmFcbiAqKi8iLCJcbmRlZiBJbWJhLmRvY3VtZW50XG5cdHdpbmRvdzpkb2N1bWVudFxuXG4jIyNcblJldHVybnMgdGhlIGJvZHkgZWxlbWVudCB3cmFwcGVkIGluIGFuIEltYmEuVGFnXG4jIyNcbmRlZiBJbWJhLnJvb3Rcblx0dGFnKEltYmEuZG9jdW1lbnQ6Ym9keSlcblxudGFnIGh0bWxlbGVtZW50IDwgZWxlbWVudFxuXG5cdCMjI1xuXHRDYWxsZWQgd2hlbiBhIHRhZyB0eXBlIGlzIGJlaW5nIHN1YmNsYXNzZWQuXG5cdCMjI1xuXHRkZWYgc2VsZi5pbmhlcml0IGNoaWxkXG5cdFx0Y2hpbGQ6cHJvdG90eXBlLkBlbXB0eSA9IHllc1xuXHRcdGNoaWxkLkBwcm90b0RvbSA9IG51bGxcblxuXHRcdGlmIEBub2RlVHlwZVxuXHRcdFx0Y2hpbGQuQG5vZGVUeXBlID0gQG5vZGVUeXBlXG5cblx0XHRcdHZhciBjbGFzc05hbWUgPSBcIl9cIiArIGNoaWxkLkBuYW1lLnJlcGxhY2UoL18vZywgJy0nKVxuXHRcdFx0Y2hpbGQuQGNsYXNzZXMgPSBAY2xhc3Nlcy5jb25jYXQoY2xhc3NOYW1lKSB1bmxlc3MgY2hpbGQuQG5hbWVbMF0gPT0gJyMnXG5cdFx0ZWxzZVxuXHRcdFx0Y2hpbGQuQG5vZGVUeXBlID0gY2hpbGQuQG5hbWVcblx0XHRcdGNoaWxkLkBjbGFzc2VzID0gW11cblxuXHRkZWYgc2VsZi5idWlsZE5vZGVcblx0XHR2YXIgZG9tID0gSW1iYS5kb2N1bWVudC5jcmVhdGVFbGVtZW50KEBub2RlVHlwZSlcblx0XHR2YXIgY2xzID0gQGNsYXNzZXMuam9pbihcIiBcIilcblx0XHRkb206Y2xhc3NOYW1lID0gY2xzIGlmIGNsc1xuXHRcdGRvbVxuXG5cdGRlZiBzZWxmLmNyZWF0ZU5vZGVcblx0XHR2YXIgcHJvdG8gPSAoQHByb3RvRG9tIHx8PSBidWlsZE5vZGUpXG5cdFx0cHJvdG8uY2xvbmVOb2RlKGZhbHNlKVxuXG5cdGRlZiBzZWxmLmRvbVxuXHRcdEBwcm90b0RvbSB8fD0gYnVpbGROb2RlXG5cblx0YXR0ciBpZFxuXHRhdHRyIHRhYmluZGV4XG5cdGF0dHIgdGl0bGVcblx0YXR0ciByb2xlXG5cblx0ZGVmIHdpZHRoXG5cdFx0QGRvbTpvZmZzZXRXaWR0aFxuXG5cdGRlZiBoZWlnaHRcblx0XHRAZG9tOm9mZnNldEhlaWdodFxuXG5cdGRlZiBzZXRDaGlsZHJlbiBub2RlcywgdHlwZVxuXHRcdEBlbXB0eSA/IGFwcGVuZChub2RlcykgOiBlbXB0eS5hcHBlbmQobm9kZXMpXG5cdFx0QGNoaWxkcmVuID0gbnVsbFxuXHRcdHNlbGZcblxuXHQjIyNcblx0U2V0IGlubmVyIGh0bWwgb2Ygbm9kZVxuXHQjIyNcblx0ZGVmIGh0bWw9IGh0bWxcblx0XHRAZG9tOmlubmVySFRNTCA9IGh0bWxcblx0XHRzZWxmXG5cblx0IyMjXG5cdEdldCBpbm5lciBodG1sIG9mIG5vZGVcblx0IyMjXG5cdGRlZiBodG1sXG5cdFx0QGRvbTppbm5lckhUTUxcblxuXHQjIyNcblx0UmVtb3ZlIGFsbCBjb250ZW50IGluc2lkZSBub2RlXG5cdCMjI1xuXHRkZWYgZW1wdHlcblx0XHRAZG9tLnJlbW92ZUNoaWxkKEBkb206Zmlyc3RDaGlsZCkgd2hpbGUgQGRvbTpmaXJzdENoaWxkXG5cdFx0QGNoaWxkcmVuID0gbnVsbFxuXHRcdEBlbXB0eSA9IHllc1xuXHRcdHNlbGZcblxuXHQjIyNcblx0UmVtb3ZlIHNwZWNpZmllZCBjaGlsZCBmcm9tIGN1cnJlbnQgbm9kZS5cblx0IyMjXG5cdGRlZiByZW1vdmUgY2hpbGRcblx0XHR2YXIgcGFyID0gZG9tXG5cdFx0dmFyIGVsID0gY2hpbGQgYW5kIGNoaWxkLmRvbVxuXHRcdHBhci5yZW1vdmVDaGlsZChlbCkgaWYgZWwgYW5kIGVsOnBhcmVudE5vZGUgPT0gcGFyXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgZW1pdCBuYW1lLCBkYXRhOiBudWxsLCBidWJibGU6IHllc1xuXHRcdEltYmEuRXZlbnRzLnRyaWdnZXIgbmFtZSwgc2VsZiwgZGF0YTogZGF0YSwgYnViYmxlOiBidWJibGVcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBkYXRhc2V0IGtleSwgdmFsXG5cdFx0aWYga2V5IGlzYSBPYmplY3Rcblx0XHRcdGRhdGFzZXQoayx2KSBmb3Igb3duIGssdiBvZiBrZXlcblx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRpZiBhcmd1bWVudHM6bGVuZ3RoID09IDJcblx0XHRcdHNldEF0dHJpYnV0ZShcImRhdGEte2tleX1cIix2YWwpXG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0aWYga2V5XG5cdFx0XHRyZXR1cm4gZ2V0QXR0cmlidXRlKFwiZGF0YS17a2V5fVwiKVxuXG5cdFx0dmFyIGRhdGFzZXQgPSBkb206ZGF0YXNldFxuXG5cdFx0dW5sZXNzIGRhdGFzZXRcblx0XHRcdGRhdGFzZXQgPSB7fVxuXHRcdFx0Zm9yIGF0cixpIGluIGRvbTphdHRyaWJ1dGVzXG5cdFx0XHRcdGlmIGF0cjpuYW1lLnN1YnN0cigwLDUpID09ICdkYXRhLSdcblx0XHRcdFx0XHRkYXRhc2V0W0ltYmEudG9DYW1lbENhc2UoYXRyOm5hbWUuc2xpY2UoNSkpXSA9IGF0cjp2YWx1ZVxuXG5cdFx0cmV0dXJuIGRhdGFzZXRcblxuXHQjIyNcblx0R2V0IGRlc2NlbmRhbnRzIG9mIGN1cnJlbnQgbm9kZSwgb3B0aW9uYWxseSBtYXRjaGluZyBzZWxlY3RvclxuXHRAcmV0dXJuIHtJbWJhLlNlbGVjdG9yfVxuXHQjIyNcblx0ZGVmIGZpbmQgc2VsXG5cdFx0SW1iYS5TZWxlY3Rvci5uZXcoc2VsLHNlbGYpXG5cblx0IyMjXG5cdEdldCB0aGUgZmlyc3QgbWF0Y2hpbmcgY2hpbGQgb2Ygbm9kZVxuXG5cdEByZXR1cm4ge0ltYmEuVGFnfVxuXHQjIyNcblx0ZGVmIGZpcnN0IHNlbFxuXHRcdHNlbCA/IGZpbmQoc2VsKS5maXJzdCA6IHRhZyhkb206Zmlyc3RFbGVtZW50Q2hpbGQpXG5cblx0IyMjXG5cdEdldCB0aGUgbGFzdCBtYXRjaGluZyBjaGlsZCBvZiBub2RlXG5cblx0XHRub2RlLmxhc3QgIyByZXR1cm5zIHRoZSBsYXN0IGNoaWxkIG9mIG5vZGVcblx0XHRub2RlLmxhc3QgJXNwYW4gIyByZXR1cm5zIHRoZSBsYXN0IHNwYW4gaW5zaWRlIG5vZGVcblx0XHRub2RlLmxhc3QgZG8gfGVsfCBlbC50ZXh0ID09ICdIaScgIyByZXR1cm4gbGFzdCBub2RlIHdpdGggdGV4dCBIaVxuXG5cdEByZXR1cm4ge0ltYmEuVGFnfVxuXHQjIyNcblx0ZGVmIGxhc3Qgc2VsXG5cdFx0c2VsID8gZmluZChzZWwpLmxhc3QgOiB0YWcoZG9tOmxhc3RFbGVtZW50Q2hpbGQpXG5cblx0IyMjXG5cdEdldCB0aGUgY2hpbGQgYXQgaW5kZXhcblx0IyMjXG5cdGRlZiBjaGlsZCBpXG5cdFx0dGFnKGRvbTpjaGlsZHJlbltpIG9yIDBdKVxuXG5cdGRlZiBjaGlsZHJlbiBzZWxcblx0XHR2YXIgbm9kZXMgPSBJbWJhLlNlbGVjdG9yLm5ldyhudWxsLCBzZWxmLCBAZG9tOmNoaWxkcmVuKVxuXHRcdHNlbCA/IG5vZGVzLmZpbHRlcihzZWwpIDogbm9kZXNcblx0XG5cdGRlZiBvcnBoYW5pemVcblx0XHRwYXIucmVtb3ZlQ2hpbGQoQGRvbSkgaWYgbGV0IHBhciA9IGRvbTpwYXJlbnROb2RlXG5cdFx0cmV0dXJuIHNlbGZcblx0XG5cdGRlZiBtYXRjaGVzIHNlbFxuXHRcdGlmIHNlbCBpc2EgRnVuY3Rpb25cblx0XHRcdHJldHVybiBzZWwoc2VsZilcblxuXHRcdHNlbCA9IHNlbC5xdWVyeSBpZiBzZWw6cXVlcnlcblx0XHRpZiB2YXIgZm4gPSAoQGRvbTptYXRjaGVzIG9yIEBkb206bWF0Y2hlc1NlbGVjdG9yIG9yIEBkb206d2Via2l0TWF0Y2hlc1NlbGVjdG9yIG9yIEBkb206bXNNYXRjaGVzU2VsZWN0b3Igb3IgQGRvbTptb3pNYXRjaGVzU2VsZWN0b3IpXG5cdFx0XHRyZXR1cm4gZm4uY2FsbChAZG9tLHNlbClcblxuXHQjIyNcblx0R2V0IHRoZSBmaXJzdCBlbGVtZW50IG1hdGNoaW5nIHN1cHBsaWVkIHNlbGVjdG9yIC8gZmlsdGVyXG5cdHRyYXZlcnNpbmcgdXB3YXJkcywgYnV0IGluY2x1ZGluZyB0aGUgbm9kZSBpdHNlbGYuXG5cdEByZXR1cm4ge0ltYmEuVGFnfVxuXHQjIyNcblx0ZGVmIGNsb3Nlc3Qgc2VsXG5cdFx0cmV0dXJuIHBhcmVudCB1bmxlc3Mgc2VsICMgc2hvdWxkIHJldHVybiBzZWxmPyFcblx0XHR2YXIgbm9kZSA9IHNlbGZcblx0XHRzZWwgPSBzZWwucXVlcnkgaWYgc2VsOnF1ZXJ5XG5cblx0XHR3aGlsZSBub2RlXG5cdFx0XHRyZXR1cm4gbm9kZSBpZiBub2RlLm1hdGNoZXMoc2VsKVxuXHRcdFx0bm9kZSA9IG5vZGUucGFyZW50XG5cdFx0cmV0dXJuIG51bGxcblxuXHQjIyNcblx0R2V0IHRoZSBjbG9zZXN0IGFuY2VzdG9yIG9mIG5vZGUgdGhhdCBtYXRjaGVzXG5cdHNwZWNpZmllZCBzZWxlY3RvciAvIG1hdGNoZXIuXG5cblx0QHJldHVybiB7SW1iYS5UYWd9XG5cdCMjI1xuXHRkZWYgdXAgc2VsXG5cdFx0cmV0dXJuIHBhcmVudCB1bmxlc3Mgc2VsXG5cdFx0cGFyZW50IGFuZCBwYXJlbnQuY2xvc2VzdChzZWwpXG5cblx0ZGVmIHBhdGggc2VsXG5cdFx0dmFyIG5vZGUgPSBzZWxmXG5cdFx0dmFyIG5vZGVzID0gW11cblx0XHRzZWwgPSBzZWwucXVlcnkgaWYgc2VsIGFuZCBzZWw6cXVlcnlcblxuXHRcdHdoaWxlIG5vZGVcblx0XHRcdG5vZGVzLnB1c2gobm9kZSkgaWYgIXNlbCBvciBub2RlLm1hdGNoZXMoc2VsKVxuXHRcdFx0bm9kZSA9IG5vZGUucGFyZW50XG5cdFx0cmV0dXJuIG5vZGVzXG5cblx0ZGVmIHBhcmVudHMgc2VsXG5cdFx0dmFyIHBhciA9IHBhcmVudFxuXHRcdHBhciA/IHBhci5wYXRoKHNlbCkgOiBbXVxuXG5cdFxuXG5cdGRlZiBzaWJsaW5ncyBzZWxcblx0XHRyZXR1cm4gW10gdW5sZXNzIHZhciBwYXIgPSBwYXJlbnQgIyBGSVhNRVxuXHRcdHZhciBhcnkgPSBkb206cGFyZW50Tm9kZTpjaGlsZHJlblxuXHRcdHZhciBub2RlcyA9IEltYmEuU2VsZWN0b3IubmV3KG51bGwsIHNlbGYsIGFyeSlcblx0XHRub2Rlcy5maWx0ZXIofG58IG4gIT0gc2VsZiAmJiAoIXNlbCB8fCBuLm1hdGNoZXMoc2VsKSkpXG5cblx0IyMjXG5cdEdldCB0aGUgaW1tZWRpYXRlbHkgZm9sbG93aW5nIHNpYmxpbmcgb2Ygbm9kZS5cblx0IyMjXG5cdGRlZiBuZXh0IHNlbFxuXHRcdGlmIHNlbFxuXHRcdFx0dmFyIGVsID0gc2VsZlxuXHRcdFx0d2hpbGUgZWwgPSBlbC5uZXh0XG5cdFx0XHRcdHJldHVybiBlbCBpZiBlbC5tYXRjaGVzKHNlbClcblx0XHRcdHJldHVybiBudWxsXG5cdFx0dGFnKGRvbTpuZXh0RWxlbWVudFNpYmxpbmcpXG5cblx0IyMjXG5cdEdldCB0aGUgaW1tZWRpYXRlbHkgcHJlY2VlZGluZyBzaWJsaW5nIG9mIG5vZGUuXG5cdCMjI1xuXHRkZWYgcHJldiBzZWxcblx0XHRpZiBzZWxcblx0XHRcdHZhciBlbCA9IHNlbGZcblx0XHRcdHdoaWxlIGVsID0gZWwucHJldlxuXHRcdFx0XHRyZXR1cm4gZWwgaWYgZWwubWF0Y2hlcyhzZWwpXG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdHRhZyhkb206cHJldmlvdXNFbGVtZW50U2libGluZylcblxuXHRkZWYgY29udGFpbnMgbm9kZVxuXHRcdGRvbS5jb250YWlucyhub2RlIGFuZCBub2RlLkBkb20gb3Igbm9kZSlcblxuXHRkZWYgaW5kZXhcblx0XHR2YXIgaSA9IDBcblx0XHR2YXIgZWwgPSBkb21cblx0XHR3aGlsZSBlbDpwcmV2aW91c1NpYmxpbmdcblx0XHRcdGVsID0gZWw6cHJldmlvdXNTaWJsaW5nXG5cdFx0XHRpKytcblx0XHRyZXR1cm4gaVxuXG5cblx0IyMjXG5cdFxuXHRAZGVwcmVjYXRlZFxuXHQjIyNcblx0ZGVmIGluc2VydCBub2RlLCBiZWZvcmU6IG51bGwsIGFmdGVyOiBudWxsXG5cdFx0YmVmb3JlID0gYWZ0ZXIubmV4dCBpZiBhZnRlclxuXHRcdGlmIG5vZGUgaXNhIEFycmF5XG5cdFx0XHRub2RlID0gKDxmcmFnbWVudD4gbm9kZSlcblx0XHRpZiBiZWZvcmVcblx0XHRcdGRvbS5pbnNlcnRCZWZvcmUobm9kZS5kb20sYmVmb3JlLmRvbSlcblx0XHRlbHNlXG5cdFx0XHRhcHBlbmQobm9kZSlcblx0XHRzZWxmXHRcblxuXHQjIyNcblx0Rm9jdXMgb24gY3VycmVudCBub2RlXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgZm9jdXNcblx0XHRkb20uZm9jdXNcblx0XHRzZWxmXG5cblx0IyMjXG5cdFJlbW92ZSBmb2N1cyBmcm9tIGN1cnJlbnQgbm9kZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGJsdXJcblx0XHRkb20uYmx1clxuXHRcdHNlbGZcblxuXHRkZWYgdGVtcGxhdGVcblx0XHRudWxsXG5cblx0IyMjXG5cdEB0b2RvIFNob3VsZCBzdXBwb3J0IG11bHRpcGxlIGFyZ3VtZW50cyBsaWtlIGFwcGVuZFxuXG5cdFRoZSAucHJlcGVuZCBtZXRob2QgaW5zZXJ0cyB0aGUgc3BlY2lmaWVkIGNvbnRlbnQgYXMgdGhlIGZpcnN0XG5cdGNoaWxkIG9mIHRoZSB0YXJnZXQgbm9kZS4gSWYgdGhlIGNvbnRlbnQgaXMgYWxyZWFkeSBhIGNoaWxkIG9mIFxuXHRub2RlIGl0IHdpbGwgYmUgbW92ZWQgdG8gdGhlIHN0YXJ0LlxuXHRcbiAgICBcdG5vZGUucHJlcGVuZCA8ZGl2LnRvcD4gIyBwcmVwZW5kIG5vZGVcbiAgICBcdG5vZGUucHJlcGVuZCBcInNvbWUgdGV4dFwiICMgcHJlcGVuZCB0ZXh0XG4gICAgXHRub2RlLnByZXBlbmQgWzx1bD4sPHVsPl0gIyBwcmVwZW5kIGFycmF5XG5cblx0IyMjXG5cdGRlZiBwcmVwZW5kIGl0ZW1cblx0XHR2YXIgZmlyc3QgPSBAZG9tOmNoaWxkTm9kZXNbMF1cblx0XHRmaXJzdCA/IGluc2VydEJlZm9yZShpdGVtLCBmaXJzdCkgOiBhcHBlbmRDaGlsZChpdGVtKVxuXHRcdHNlbGZcblxuXHQjIyNcblx0VGhlIC5hcHBlbmQgbWV0aG9kIGluc2VydHMgdGhlIHNwZWNpZmllZCBjb250ZW50IGFzIHRoZSBsYXN0IGNoaWxkXG5cdG9mIHRoZSB0YXJnZXQgbm9kZS4gSWYgdGhlIGNvbnRlbnQgaXMgYWxyZWFkeSBhIGNoaWxkIG9mIG5vZGUgaXRcblx0d2lsbCBiZSBtb3ZlZCB0byB0aGUgZW5kLlxuXHRcblx0IyBleGFtcGxlXG5cdCAgICB2YXIgcm9vdCA9IDxkaXYucm9vdD5cblx0ICAgIHZhciBpdGVtID0gPGRpdi5pdGVtPiBcIlRoaXMgaXMgYW4gaXRlbVwiXG5cdCAgICByb290LmFwcGVuZCBpdGVtICMgYXBwZW5kcyBpdGVtIHRvIHRoZSBlbmQgb2Ygcm9vdFxuXG5cdCAgICByb290LnByZXBlbmQgXCJzb21lIHRleHRcIiAjIGFwcGVuZCB0ZXh0XG5cdCAgICByb290LnByZXBlbmQgWzx1bD4sPHVsPl0gIyBhcHBlbmQgYXJyYXlcblx0IyMjXG5cdGRlZiBhcHBlbmQgaXRlbVxuXHRcdCMgcG9zc2libGUgdG8gYXBwZW5kIGJsYW5rXG5cdFx0IyBwb3NzaWJsZSB0byBzaW1wbGlmeSBvbiBzZXJ2ZXI/XG5cdFx0cmV0dXJuIHNlbGYgdW5sZXNzIGl0ZW1cblxuXHRcdGlmIGl0ZW0gaXNhIEFycmF5XG5cdFx0XHRtZW1iZXIgJiYgYXBwZW5kKG1lbWJlcikgZm9yIG1lbWJlciBpbiBpdGVtXG5cblx0XHRlbGlmIGl0ZW0gaXNhIFN0cmluZyBvciBpdGVtIGlzYSBOdW1iZXJcblx0XHRcdHZhciBub2RlID0gSW1iYS5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShpdGVtKVxuXHRcdFx0QGRvbS5hcHBlbmRDaGlsZChub2RlKVxuXHRcdFx0QGVtcHR5ID0gbm8gaWYgQGVtcHR5XHRcdFx0XG5cdFx0ZWxzZVxuXHRcdFx0QGRvbS5hcHBlbmRDaGlsZChpdGVtLkBkb20gb3IgaXRlbSlcblx0XHRcdEBlbXB0eSA9IG5vIGlmIEBlbXB0eVxuXG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblx0SW5zZXJ0IGEgbm9kZSBpbnRvIHRoZSBjdXJyZW50IG5vZGUgKHNlbGYpLCBiZWZvcmUgYW5vdGhlci5cblx0VGhlIHJlbGF0aXZlIG5vZGUgbXVzdCBiZSBhIGNoaWxkIG9mIGN1cnJlbnQgbm9kZS4gXG5cdCMjI1xuXHRkZWYgaW5zZXJ0QmVmb3JlIG5vZGUsIHJlbFxuXHRcdG5vZGUgPSBJbWJhLmRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpIGlmIG5vZGUgaXNhIFN0cmluZyBcblx0XHRkb20uaW5zZXJ0QmVmb3JlKCAobm9kZS5AZG9tIG9yIG5vZGUpLCAocmVsLkBkb20gb3IgcmVsKSApIGlmIG5vZGUgYW5kIHJlbFxuXHRcdHNlbGZcblxuXHQjIyNcblx0QXBwZW5kIGEgc2luZ2xlIGl0ZW0gKG5vZGUgb3Igc3RyaW5nKSB0byB0aGUgY3VycmVudCBub2RlLlxuXHRJZiBzdXBwbGllZCBpdGVtIGlzIGEgc3RyaW5nIGl0IHdpbGwgYXV0b21hdGljYWxseS4gVGhpcyBpcyB1c2VkXG5cdGJ5IEltYmEgaW50ZXJuYWxseSwgYnV0IHdpbGwgcHJhY3RpY2FsbHkgbmV2ZXIgYmUgdXNlZCBleHBsaWNpdGx5LlxuXHQjIyNcblx0ZGVmIGFwcGVuZENoaWxkIG5vZGVcblx0XHRub2RlID0gSW1iYS5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShub2RlKSBpZiBub2RlIGlzYSBTdHJpbmdcblx0XHRkb20uYXBwZW5kQ2hpbGQobm9kZS5AZG9tIG9yIG5vZGUpIGlmIG5vZGVcblx0XHRzZWxmXG5cblx0IyMjXG5cdFJlbW92ZSBhIHNpbmdsZSBjaGlsZCBmcm9tIHRoZSBjdXJyZW50IG5vZGUuXG5cdFVzZWQgYnkgSW1iYSBpbnRlcm5hbGx5LlxuXHQjIyNcblx0ZGVmIHJlbW92ZUNoaWxkIG5vZGVcblx0XHRkb20ucmVtb3ZlQ2hpbGQobm9kZS5AZG9tIG9yIG5vZGUpIGlmIG5vZGVcblx0XHRzZWxmXG5cblx0ZGVmIHRvU3RyaW5nXG5cdFx0QGRvbS50b1N0cmluZyAjIHJlYWxseT9cblxuXHQjIyNcblx0QGRlcHJlY2F0ZWRcblx0IyMjXG5cdGRlZiBjbGFzc2VzXG5cdFx0Y29uc29sZS5sb2cgJ0ltYmEuVGFnI2NsYXNzZXMgaXMgZGVwcmVjYXRlZCdcblx0XHRAZG9tOmNsYXNzTGlzdFxuXG50YWcgc3ZnZWxlbWVudCA8IGh0bWxlbGVtZW50XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBzcmMvaW1iYS9kb20uaW1iYVxuICoqLyIsIlxuIyBwcmVkZWZpbmUgYWxsIHN1cHBvcnRlZCBodG1sIHRhZ3NcbnRhZyBmcmFnbWVudCA8IGh0bWxlbGVtZW50XG5cdFxuXHRkZWYgc2VsZi5jcmVhdGVOb2RlXG5cdFx0SW1iYS5kb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50XG5cbnRhZyBhXG5cdGF0dHIgaHJlZlxuXG50YWcgYWJiclxudGFnIGFkZHJlc3NcbnRhZyBhcmVhXG50YWcgYXJ0aWNsZVxudGFnIGFzaWRlXG50YWcgYXVkaW9cbnRhZyBiXG50YWcgYmFzZVxudGFnIGJkaVxudGFnIGJkb1xudGFnIGJpZ1xudGFnIGJsb2NrcXVvdGVcbnRhZyBib2R5XG50YWcgYnJcblxudGFnIGJ1dHRvblxuXHRhdHRyIGF1dG9mb2N1c1xuXHRhdHRyIHR5cGVcblx0YXR0ciBkaXNhYmxlZFxuXG50YWcgY2FudmFzXG5cdGRlZiB3aWR0aD0gdmFsXG5cdFx0ZG9tOndpZHRoID0gdmFsIHVubGVzcyB3aWR0aCA9PSB2YWxcblx0XHRzZWxmXG5cblx0ZGVmIGhlaWdodD0gdmFsXG5cdFx0ZG9tOmhlaWdodCA9IHZhbCB1bmxlc3MgaGVpZ2h0ID09IHZhbFxuXHRcdHNlbGZcblxuXHRkZWYgd2lkdGhcblx0XHRkb206d2lkdGhcblxuXHRkZWYgaGVpZ2h0XG5cdFx0ZG9tOmhlaWdodFxuXG5cdGRlZiBjb250ZXh0IHR5cGUgPSAnMmQnXG5cdFx0ZG9tLmdldENvbnRleHQodHlwZSlcblxudGFnIGNhcHRpb25cbnRhZyBjaXRlXG50YWcgY29kZVxudGFnIGNvbFxudGFnIGNvbGdyb3VwXG50YWcgZGF0YVxudGFnIGRhdGFsaXN0XG50YWcgZGRcbnRhZyBkZWxcbnRhZyBkZXRhaWxzXG50YWcgZGZuXG50YWcgZGl2XG50YWcgZGxcbnRhZyBkdFxudGFnIGVtXG50YWcgZW1iZWRcbnRhZyBmaWVsZHNldFxudGFnIGZpZ2NhcHRpb25cbnRhZyBmaWd1cmVcbnRhZyBmb290ZXJcblxudGFnIGZvcm1cblx0YXR0ciBtZXRob2Rcblx0YXR0ciBhY3Rpb25cblxudGFnIGgxXG50YWcgaDJcbnRhZyBoM1xudGFnIGg0XG50YWcgaDVcbnRhZyBoNlxudGFnIGhlYWRcbnRhZyBoZWFkZXJcbnRhZyBoclxudGFnIGh0bWxcbnRhZyBpXG5cbnRhZyBpZnJhbWVcblx0YXR0ciBzcmNcblxudGFnIGltZ1xuXHRhdHRyIHNyY1xuXG50YWcgaW5wdXRcblx0IyBjYW4gdXNlIGF0dHIgaW5zdGVhZFxuXHRhdHRyIG5hbWVcblx0YXR0ciB0eXBlXG5cdGF0dHIgcmVxdWlyZWRcblx0YXR0ciBkaXNhYmxlZFxuXHRhdHRyIGF1dG9mb2N1c1xuXG5cdGRlZiB2YWx1ZVxuXHRcdGRvbTp2YWx1ZVxuXG5cdGRlZiB2YWx1ZT0gdlxuXHRcdGRvbTp2YWx1ZSA9IHYgdW5sZXNzIHYgPT0gZG9tOnZhbHVlXG5cdFx0c2VsZlxuXG5cdGRlZiBwbGFjZWhvbGRlcj0gdlxuXHRcdGRvbTpwbGFjZWhvbGRlciA9IHYgdW5sZXNzIHYgPT0gZG9tOnBsYWNlaG9sZGVyXG5cdFx0c2VsZlxuXG5cdGRlZiBwbGFjZWhvbGRlclxuXHRcdGRvbTpwbGFjZWhvbGRlclxuXG5cdGRlZiBjaGVja2VkXG5cdFx0ZG9tOmNoZWNrZWRcblxuXHRkZWYgY2hlY2tlZD0gYm9vbFxuXHRcdGRvbTpjaGVja2VkID0gYm9vbCB1bmxlc3MgYm9vbCA9PSBkb206Y2hlY2tlZFxuXHRcdHNlbGZcblxudGFnIGluc1xudGFnIGtiZFxudGFnIGtleWdlblxudGFnIGxhYmVsXG50YWcgbGVnZW5kXG50YWcgbGlcblxudGFnIGxpbmtcblx0YXR0ciByZWxcblx0YXR0ciB0eXBlXG5cdGF0dHIgaHJlZlxuXHRhdHRyIG1lZGlhXG5cbnRhZyBtYWluXG50YWcgbWFwXG50YWcgbWFya1xudGFnIG1lbnVcbnRhZyBtZW51aXRlbVxuXG50YWcgbWV0YVxuXHRhdHRyIG5hbWVcblx0YXR0ciBjb250ZW50XG5cdGF0dHIgY2hhcnNldFxuXG50YWcgbWV0ZXJcbnRhZyBuYXZcbnRhZyBub3NjcmlwdFxudGFnIG9iamVjdFxudGFnIG9sXG50YWcgb3B0Z3JvdXBcblxudGFnIG9wdGlvblxuXHRhdHRyIHZhbHVlXG5cbnRhZyBvdXRwdXRcbnRhZyBwXG50YWcgcGFyYW1cbnRhZyBwcmVcbnRhZyBwcm9ncmVzc1xudGFnIHFcbnRhZyBycFxudGFnIHJ0XG50YWcgcnVieVxudGFnIHNcbnRhZyBzYW1wXG5cbnRhZyBzY3JpcHRcblx0YXR0ciBzcmNcblx0YXR0ciB0eXBlXG5cdGF0dHIgYXN5bmNcblx0YXR0ciBkZWZlclxuXG50YWcgc2VjdGlvblxuXG50YWcgc2VsZWN0XG5cdGF0dHIgbmFtZVxuXHRhdHRyIG11bHRpcGxlXG5cdGF0dHIgcmVxdWlyZWRcblx0YXR0ciBkaXNhYmxlZFxuXHRcblx0ZGVmIHZhbHVlXG5cdFx0ZG9tOnZhbHVlXG5cblx0ZGVmIHZhbHVlPSB2XG5cdFx0ZG9tOnZhbHVlID0gdiB1bmxlc3MgdiA9PSBkb206dmFsdWVcblx0XHRzZWxmXG5cblxudGFnIHNtYWxsXG50YWcgc291cmNlXG50YWcgc3BhblxudGFnIHN0cm9uZ1xudGFnIHN0eWxlXG50YWcgc3ViXG50YWcgc3VtbWFyeVxudGFnIHN1cFxudGFnIHRhYmxlXG50YWcgdGJvZHlcbnRhZyB0ZFxuXG50YWcgdGV4dGFyZWFcblx0YXR0ciBuYW1lXG5cdGF0dHIgZGlzYWJsZWRcblx0YXR0ciByZXF1aXJlZFxuXHRhdHRyIHJvd3Ncblx0YXR0ciBjb2xzXG5cdGF0dHIgYXV0b2ZvY3VzXG5cblx0ZGVmIHZhbHVlXG5cdFx0ZG9tOnZhbHVlXG5cblx0ZGVmIHZhbHVlPSB2XG5cdFx0ZG9tOnZhbHVlID0gdiB1bmxlc3MgdiA9PSBkb206dmFsdWVcblx0XHRzZWxmXG5cblx0ZGVmIHBsYWNlaG9sZGVyPSB2XG5cdFx0ZG9tOnBsYWNlaG9sZGVyID0gdiB1bmxlc3MgdiA9PSBkb206cGxhY2Vob2xkZXJcblx0XHRzZWxmXG5cblx0ZGVmIHBsYWNlaG9sZGVyXG5cdFx0ZG9tOnBsYWNlaG9sZGVyXG5cbnRhZyB0Zm9vdFxudGFnIHRoXG50YWcgdGhlYWRcbnRhZyB0aW1lXG50YWcgdGl0bGVcbnRhZyB0clxudGFnIHRyYWNrXG50YWcgdVxudGFnIHVsXG50YWcgdmlkZW9cbnRhZyB3YnJcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHNyYy9pbWJhL2RvbS5odG1sLmltYmFcbiAqKi8iLCJcbnRhZyBzdmc6c3ZnZWxlbWVudFxuXG5cdGRlZiBzZWxmLm5hbWVzcGFjZVVSSVxuXHRcdFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxuXG5cdGxldCB0eXBlcyA9IFwiY2lyY2xlIGRlZnMgZWxsaXBzZSBnIGxpbmUgbGluZWFyR3JhZGllbnQgbWFzayBwYXRoIHBhdHRlcm4gcG9seWdvbiBwb2x5bGluZSByYWRpYWxHcmFkaWVudCByZWN0IHN0b3Agc3ZnIHRleHQgdHNwYW5cIi5zcGxpdChcIiBcIilcblxuXHRkZWYgc2VsZi5idWlsZE5vZGVcblx0XHR2YXIgZG9tID0gSW1iYS5kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlVVJJLEBub2RlVHlwZSlcblx0XHR2YXIgY2xzID0gQGNsYXNzZXMuam9pbihcIiBcIilcblx0XHRkb206Y2xhc3NOYW1lOmJhc2VWYWwgPSBjbHMgaWYgY2xzXG5cdFx0ZG9tXG5cblx0ZGVmIHNlbGYuaW5oZXJpdCBjaGlsZFxuXHRcdGNoaWxkLkBwcm90b0RvbSA9IG51bGxcblxuXHRcdGlmIGNoaWxkLkBuYW1lIGluIHR5cGVzXG5cdFx0XHRjaGlsZC5Abm9kZVR5cGUgPSBjaGlsZC5AbmFtZVxuXHRcdFx0Y2hpbGQuQGNsYXNzZXMgPSBbXVxuXHRcdGVsc2Vcblx0XHRcdGNoaWxkLkBub2RlVHlwZSA9IEBub2RlVHlwZVxuXHRcdFx0dmFyIGNsYXNzTmFtZSA9IFwiX1wiICsgY2hpbGQuQG5hbWUucmVwbGFjZSgvXy9nLCAnLScpXG5cdFx0XHRjaGlsZC5AY2xhc3NlcyA9IEBjbGFzc2VzLmNvbmNhdChjbGFzc05hbWUpXG5cblxuXHRhdHRyIHggaW5saW5lOiBub1xuXHRhdHRyIHkgaW5saW5lOiBub1xuXG5cdGF0dHIgd2lkdGggaW5saW5lOiBub1xuXHRhdHRyIGhlaWdodCBpbmxpbmU6IG5vXG5cblx0YXR0ciBzdHJva2UgaW5saW5lOiBub1xuXHRhdHRyIHN0cm9rZS13aWR0aCBpbmxpbmU6IG5vXG5cbnRhZyBzdmc6c3ZnXG5cdGF0dHIgdmlld2JveCBpbmxpbmU6IG5vXG5cbnRhZyBzdmc6Z1xuXG50YWcgc3ZnOmRlZnNcblxudGFnIHN2ZzpzeW1ib2xcblx0YXR0ciBwcmVzZXJ2ZUFzcGVjdFJhdGlvIGlubGluZTogbm9cblx0YXR0ciB2aWV3Qm94IGlubGluZTogbm9cblxudGFnIHN2ZzptYXJrZXJcblx0YXR0ciBtYXJrZXJVbml0cyBpbmxpbmU6IG5vXG5cdGF0dHIgcmVmWCBpbmxpbmU6IG5vXG5cdGF0dHIgcmVmWSBpbmxpbmU6IG5vXG5cdGF0dHIgbWFya2VyV2lkdGggaW5saW5lOiBub1xuXHRhdHRyIG1hcmtlckhlaWdodCBpbmxpbmU6IG5vXG5cdGF0dHIgb3JpZW50IGlubGluZTogbm9cblxuXG4jIEJhc2ljIHNoYXBlc1xuXG50YWcgc3ZnOnJlY3Rcblx0YXR0ciByeCBpbmxpbmU6IG5vXG5cdGF0dHIgcnkgaW5saW5lOiBub1xuXG50YWcgc3ZnOmNpcmNsZVxuXHRhdHRyIGN4IGlubGluZTogbm9cblx0YXR0ciBjeSBpbmxpbmU6IG5vXG5cdGF0dHIgciBpbmxpbmU6IG5vXG5cbnRhZyBzdmc6ZWxsaXBzZVxuXHRhdHRyIGN4IGlubGluZTogbm9cblx0YXR0ciBjeSBpbmxpbmU6IG5vXG5cdGF0dHIgcnggaW5saW5lOiBub1xuXHRhdHRyIHJ5IGlubGluZTogbm9cblxudGFnIHN2ZzpwYXRoXG5cdGF0dHIgZCBpbmxpbmU6IG5vXG5cdGF0dHIgcGF0aExlbmd0aCBpbmxpbmU6IG5vXG5cbnRhZyBzdmc6bGluZVxuXHRhdHRyIHgxIGlubGluZTogbm9cblx0YXR0ciB4MiBpbmxpbmU6IG5vXG5cdGF0dHIgeTEgaW5saW5lOiBub1xuXHRhdHRyIHkyIGlubGluZTogbm9cblxudGFnIHN2Zzpwb2x5bGluZVxuXHRhdHRyIHBvaW50cyBpbmxpbmU6IG5vXG5cbnRhZyBzdmc6cG9seWdvblxuXHRhdHRyIHBvaW50cyBpbmxpbmU6IG5vXG5cbnRhZyBzdmc6dGV4dFxuXHRhdHRyIGR4IGlubGluZTogbm9cblx0YXR0ciBkeSBpbmxpbmU6IG5vXG5cdGF0dHIgdGV4dC1hbmNob3IgaW5saW5lOiBub1xuXHRhdHRyIHJvdGF0ZSBpbmxpbmU6IG5vXG5cdGF0dHIgdGV4dExlbmd0aCBpbmxpbmU6IG5vXG5cdGF0dHIgbGVuZ3RoQWRqdXN0IGlubGluZTogbm9cblxudGFnIHN2Zzp0c3BhblxuXHRhdHRyIGR4IGlubGluZTogbm9cblx0YXR0ciBkeSBpbmxpbmU6IG5vXG5cdGF0dHIgcm90YXRlIGlubGluZTogbm9cblx0YXR0ciB0ZXh0TGVuZ3RoIGlubGluZTogbm9cblx0YXR0ciBsZW5ndGhBZGp1c3QgaW5saW5lOiBub1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHNyYy9pbWJhL2RvbS5zdmcuaW1iYVxuICoqLyIsIiMgRXh0ZW5kaW5nIEltYmEuVGFnI2NzcyB0byB3b3JrIHdpdGhvdXQgcHJlZml4ZXMgYnkgaW5zcGVjdGluZ1xuIyB0aGUgcHJvcGVydGllcyBvZiBhIENTU1N0eWxlRGVjbGFyYXRpb24gYW5kIGNyZWF0aW5nIGEgbWFwXG5cbiMgdmFyIHByZWZpeGVzID0gWyctd2Via2l0LScsJy1tcy0nLCctbW96LScsJy1vLScsJy1ibGluay0nXVxuIyB2YXIgcHJvcHMgPSBbJ3RyYW5zZm9ybScsJ3RyYW5zaXRpb24nLCdhbmltYXRpb24nXVxuXG5pZiBJbWJhLkNMSUVOVFxuXHR2YXIgc3R5bGVzID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQ6ZG9jdW1lbnRFbGVtZW50LCAnJylcblxuXHRJbWJhLkNTU0tleU1hcCA9IHt9XG5cblx0Zm9yIHByZWZpeGVkIGluIHN0eWxlc1xuXHRcdHZhciB1bnByZWZpeGVkID0gcHJlZml4ZWQucmVwbGFjZSgvXi0od2Via2l0fG1zfG1venxvfGJsaW5rKS0vLCcnKVxuXHRcdHZhciBjYW1lbENhc2UgPSB1bnByZWZpeGVkLnJlcGxhY2UoLy0oXFx3KS9nKSBkbyB8bSxhfCBhLnRvVXBwZXJDYXNlXG5cblx0XHQjIGlmIHRoZXJlIGV4aXN0cyBhbiB1bnByZWZpeGVkIHZlcnNpb24gLS0gYWx3YXlzIHVzZSB0aGlzXG5cdFx0aWYgcHJlZml4ZWQgIT0gdW5wcmVmaXhlZFxuXHRcdFx0Y29udGludWUgaWYgc3R5bGVzLmhhc093blByb3BlcnR5KHVucHJlZml4ZWQpXG5cblx0XHQjIHJlZ2lzdGVyIHRoZSBwcmVmaXhlc1xuXHRcdEltYmEuQ1NTS2V5TWFwW3VucHJlZml4ZWRdID0gSW1iYS5DU1NLZXlNYXBbY2FtZWxDYXNlXSA9IHByZWZpeGVkXG5cblx0ZXh0ZW5kIHRhZyBlbGVtZW50XG5cblx0XHQjIG92ZXJyaWRlIHRoZSBvcmlnaW5hbCBjc3MgbWV0aG9kXG5cdFx0ZGVmIGNzcyBrZXksIHZhbFxuXHRcdFx0aWYga2V5IGlzYSBPYmplY3Rcblx0XHRcdFx0Y3NzKGssdikgZm9yIG93biBrLHYgb2Yga2V5XG5cdFx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRcdGtleSA9IEltYmEuQ1NTS2V5TWFwW2tleV0gb3Iga2V5XG5cblx0XHRcdGlmIHZhbCA9PSBudWxsXG5cdFx0XHRcdGRvbTpzdHlsZS5yZW1vdmVQcm9wZXJ0eShrZXkpXG5cdFx0XHRlbGlmIHZhbCA9PSB1bmRlZmluZWRcblx0XHRcdFx0cmV0dXJuIGRvbTpzdHlsZVtrZXldXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGlmIHZhbCBpc2EgTnVtYmVyIGFuZCBrZXkubWF0Y2goL3dpZHRofGhlaWdodHxsZWZ0fHJpZ2h0fHRvcHxib3R0b20vKVxuXHRcdFx0XHRcdHZhbCA9IHZhbCArIFwicHhcIlxuXHRcdFx0XHRkb206c3R5bGVba2V5XSA9IHZhbFxuXHRcdFx0c2VsZlxuXHRcdFx0XG5cdHVubGVzcyBkb2N1bWVudDpkb2N1bWVudEVsZW1lbnQ6Y2xhc3NMaXN0XG5cdFx0ZXh0ZW5kIHRhZyBlbGVtZW50XG5cblx0XHRcdGRlZiBoYXNGbGFnIHJlZlxuXHRcdFx0XHRyZXR1cm4gUmVnRXhwLm5ldygnKF58XFxcXHMpJyArIHJlZiArICcoXFxcXHN8JCknKS50ZXN0KEBkb206Y2xhc3NOYW1lKVxuXG5cdFx0XHRkZWYgYWRkRmxhZyByZWZcblx0XHRcdFx0cmV0dXJuIHNlbGYgaWYgaGFzRmxhZyhyZWYpXG5cdFx0XHRcdEBkb206Y2xhc3NOYW1lICs9IChAZG9tOmNsYXNzTmFtZSA/ICcgJyA6ICcnKSArIHJlZlxuXHRcdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0XHRkZWYgdW5mbGFnIHJlZlxuXHRcdFx0XHRyZXR1cm4gc2VsZiB1bmxlc3MgaGFzRmxhZyhyZWYpXG5cdFx0XHRcdHZhciByZWdleCA9IFJlZ0V4cC5uZXcoJyhefFxcXFxzKSonICsgcmVmICsgJyhcXFxcc3wkKSonLCAnZycpXG5cdFx0XHRcdEBkb206Y2xhc3NOYW1lID0gQGRvbTpjbGFzc05hbWUucmVwbGFjZShyZWdleCwgJycpXG5cdFx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRcdGRlZiB0b2dnbGVGbGFnIHJlZlxuXHRcdFx0XHRoYXNGbGFnKHJlZikgPyB1bmZsYWcocmVmKSA6IGZsYWcocmVmKVxuXG5cdFx0XHRkZWYgZmxhZyByZWYsIGJvb2xcblx0XHRcdFx0aWYgYXJndW1lbnRzOmxlbmd0aCA9PSAyIGFuZCAhIWJvb2wgPT09IG5vXG5cdFx0XHRcdFx0cmV0dXJuIHVuZmxhZyhyZWYpXG5cdFx0XHRcdHJldHVybiBhZGRGbGFnKHJlZilcblx0XHR0cnVlXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogc3JjL2ltYmEvZG9tLmNsaWVudC5pbWJhXG4gKiovIiwidmFyIGRvYyA9IGRvY3VtZW50XG52YXIgd2luID0gd2luZG93XG5cbnZhciBoYXNUb3VjaEV2ZW50cyA9IHdpbmRvdyAmJiB3aW5kb3c6b250b3VjaHN0YXJ0ICE9PSB1bmRlZmluZWRcblxuY2xhc3MgSW1iYS5Qb2ludGVyXG5cblx0IyBiZWdhbiwgbW92ZWQsIHN0YXRpb25hcnksIGVuZGVkLCBjYW5jZWxsZWRcblxuXHRwcm9wIHBoYXNlXG5cdHByb3AgcHJldkV2ZW50XG5cdHByb3AgYnV0dG9uXG5cdHByb3AgZXZlbnRcblx0cHJvcCBkaXJ0eVxuXHRwcm9wIGV2ZW50c1xuXHRwcm9wIHRvdWNoXG5cblx0ZGVmIGluaXRpYWxpemVcblx0XHRidXR0b24gPSAtMVxuXHRcdGV2ZW50ID0ge3g6IDAsIHk6IDAsIHR5cGU6ICd1bmluaXRpYWxpemVkJ31cblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiB1cGRhdGUgZVxuXHRcdGV2ZW50ID0gZVxuXHRcdGRpcnR5ID0geWVzXG5cdFx0c2VsZlxuXG5cdCMgdGhpcyBpcyBqdXN0IGZvciByZWd1bGFyIG1vdXNlIG5vd1xuXHRkZWYgcHJvY2Vzc1xuXHRcdHZhciBlMSA9IGV2ZW50XG5cblx0XHRpZiBkaXJ0eVxuXHRcdFx0cHJldkV2ZW50ID0gZTFcblx0XHRcdGRpcnR5ID0gbm9cblxuXHRcdFx0IyBidXR0b24gc2hvdWxkIG9ubHkgY2hhbmdlIG9uIG1vdXNlZG93biBldGNcblx0XHRcdGlmIGUxOnR5cGUgPT0gJ21vdXNlZG93bidcblx0XHRcdFx0YnV0dG9uID0gZTE6YnV0dG9uXG5cblx0XHRcdFx0IyBkbyBub3QgY3JlYXRlIHRvdWNoIGZvciByaWdodCBjbGlja1xuXHRcdFx0XHRpZiBidXR0b24gPT0gMiBvciAodG91Y2ggYW5kIGJ1dHRvbiAhPSAwKVxuXHRcdFx0XHRcdHJldHVyblxuXG5cdFx0XHRcdCMgY2FuY2VsIHRoZSBwcmV2aW91cyB0b3VjaFxuXHRcdFx0XHR0b3VjaC5jYW5jZWwgaWYgdG91Y2hcblx0XHRcdFx0dG91Y2ggPSBJbWJhLlRvdWNoLm5ldyhlMSxzZWxmKVxuXHRcdFx0XHR0b3VjaC5tb3VzZWRvd24oZTEsZTEpXG5cblx0XHRcdGVsaWYgZTE6dHlwZSA9PSAnbW91c2Vtb3ZlJ1xuXHRcdFx0XHR0b3VjaC5tb3VzZW1vdmUoZTEsZTEpIGlmIHRvdWNoXG5cblx0XHRcdGVsaWYgZTE6dHlwZSA9PSAnbW91c2V1cCdcblx0XHRcdFx0YnV0dG9uID0gLTFcblxuXHRcdFx0XHRpZiB0b3VjaCBhbmQgdG91Y2guYnV0dG9uID09IGUxOmJ1dHRvblxuXHRcdFx0XHRcdHRvdWNoLm1vdXNldXAoZTEsZTEpXG5cdFx0XHRcdFx0dG91Y2ggPSBudWxsXG5cdFx0XHRcdCMgdHJpZ2dlciBwb2ludGVydXBcblx0XHRlbHNlXG5cdFx0XHR0b3VjaC5pZGxlIGlmIHRvdWNoXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgY2xlYW51cFxuXHRcdEltYmEuUE9JTlRFUlNcblxuXHRkZWYgeCBkbyBldmVudDp4XG5cdGRlZiB5IGRvIGV2ZW50OnlcblxuXHQjIGRlcHJlY2F0ZWQgLS0gc2hvdWxkIHJlbW92ZVxuXHRkZWYgc2VsZi51cGRhdGUgXG5cdFx0IyBjb25zb2xlLmxvZygndXBkYXRlIHRvdWNoJylcblx0XHRmb3IgcHRyLGkgaW4gSW1iYS5QT0lOVEVSU1xuXHRcdFx0cHRyLnByb2Nlc3Ncblx0XHQjIG5lZWQgdG8gYmUgYWJsZSB0byBwcmV2ZW50IHRoZSBkZWZhdWx0IGJlaGF2aW91ciBvZiB0b3VjaCwgbm8/XG5cdFx0d2luLnJlcXVlc3RBbmltYXRpb25GcmFtZShJbWJhLlBvaW50ZXI6dXBkYXRlKVxuXHRcdHNlbGZcblxudmFyIGxhc3ROYXRpdmVUb3VjaFRpbWVTdGFtcCA9IDBcbnZhciBsYXN0TmF0aXZlVG91Y2hUaW1lb3V0ID0gNTBcblxuIyBJbWJhLlRvdWNoXG4jIEJlZ2FuXHRBIGZpbmdlciB0b3VjaGVkIHRoZSBzY3JlZW4uXG4jIE1vdmVkXHRBIGZpbmdlciBtb3ZlZCBvbiB0aGUgc2NyZWVuLlxuIyBTdGF0aW9uYXJ5XHRBIGZpbmdlciBpcyB0b3VjaGluZyB0aGUgc2NyZWVuIGJ1dCBoYXNuJ3QgbW92ZWQuXG4jIEVuZGVkXHRBIGZpbmdlciB3YXMgbGlmdGVkIGZyb20gdGhlIHNjcmVlbi4gVGhpcyBpcyB0aGUgZmluYWwgcGhhc2Ugb2YgYSB0b3VjaC5cbiMgQ2FuY2VsZWQgVGhlIHN5c3RlbSBjYW5jZWxsZWQgdHJhY2tpbmcgZm9yIHRoZSB0b3VjaC5cblxuIyMjXG5Db25zb2xpZGF0ZXMgbW91c2UgYW5kIHRvdWNoIGV2ZW50cy4gVG91Y2ggb2JqZWN0cyBwZXJzaXN0IGFjcm9zcyBhIHRvdWNoLFxuZnJvbSB0b3VjaHN0YXJ0IHVudGlsIGVuZC9jYW5jZWwuIFdoZW4gYSB0b3VjaCBzdGFydHMsIGl0IHdpbGwgdHJhdmVyc2VcbmRvd24gZnJvbSB0aGUgaW5uZXJtb3N0IHRhcmdldCwgdW50aWwgaXQgZmluZHMgYSBub2RlIHRoYXQgcmVzcG9uZHMgdG9cbm9udG91Y2hzdGFydC4gVW5sZXNzIHRoZSB0b3VjaCBpcyBleHBsaWNpdGx5IHJlZGlyZWN0ZWQsIHRoZSB0b3VjaCB3aWxsXG5jYWxsIG9udG91Y2htb3ZlIGFuZCBvbnRvdWNoZW5kIC8gb250b3VjaGNhbmNlbCBvbiB0aGUgcmVzcG9uZGVyIHdoZW4gYXBwcm9wcmlhdGUuXG5cblx0dGFnIGRyYWdnYWJsZVxuXHRcdCMgY2FsbGVkIHdoZW4gYSB0b3VjaCBzdGFydHNcblx0XHRkZWYgb250b3VjaHN0YXJ0IHRvdWNoXG5cdFx0XHRmbGFnICdkcmFnZ2luZydcblx0XHRcdHNlbGZcblx0XHRcblx0XHQjIGNhbGxlZCB3aGVuIHRvdWNoIG1vdmVzIC0gc2FtZSB0b3VjaCBvYmplY3Rcblx0XHRkZWYgb250b3VjaG1vdmUgdG91Y2hcblx0XHRcdCMgbW92ZSB0aGUgbm9kZSB3aXRoIHRvdWNoXG5cdFx0XHRjc3MgdG9wOiB0b3VjaC5keSwgbGVmdDogdG91Y2guZHhcblx0XHRcblx0XHQjIGNhbGxlZCB3aGVuIHRvdWNoIGVuZHNcblx0XHRkZWYgb250b3VjaGVuZCB0b3VjaFxuXHRcdFx0dW5mbGFnICdkcmFnZ2luZydcblxuQGluYW1lIHRvdWNoXG4jIyNcbmNsYXNzIEltYmEuVG91Y2hcblxuXHR2YXIgdG91Y2hlcyA9IFtdXG5cdHZhciBjb3VudCA9IDBcblx0dmFyIGlkZW50aWZpZXJzID0ge31cblxuXHRkZWYgc2VsZi5jb3VudFxuXHRcdGNvdW50XG5cblx0ZGVmIHNlbGYubG9va3VwIGl0ZW1cblx0XHRyZXR1cm4gaXRlbSBhbmQgKGl0ZW06X190b3VjaF9fIG9yIGlkZW50aWZpZXJzW2l0ZW06aWRlbnRpZmllcl0pXG5cblx0ZGVmIHNlbGYucmVsZWFzZSBpdGVtLHRvdWNoXG5cdFx0ZGVsZXRlIGlkZW50aWZpZXJzW2l0ZW06aWRlbnRpZmllcl1cblx0XHRkZWxldGUgaXRlbTpfX3RvdWNoX19cblx0XHRyZXR1cm5cblxuXHRkZWYgc2VsZi5vbnRvdWNoc3RhcnQgZVxuXHRcdGZvciB0IGluIGU6Y2hhbmdlZFRvdWNoZXNcblx0XHRcdGNvbnRpbnVlIGlmIGxvb2t1cCh0KVxuXHRcdFx0dmFyIHRvdWNoID0gaWRlbnRpZmllcnNbdDppZGVudGlmaWVyXSA9IHNlbGYubmV3KGUpICMgKGUpXG5cdFx0XHR0Ol9fdG91Y2hfXyA9IHRvdWNoXG5cdFx0XHR0b3VjaGVzLnB1c2godG91Y2gpXG5cdFx0XHRjb3VudCsrXG5cdFx0XHR0b3VjaC50b3VjaHN0YXJ0KGUsdClcblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub250b3VjaG1vdmUgZVxuXHRcdGZvciB0IGluIGU6Y2hhbmdlZFRvdWNoZXNcblx0XHRcdGlmIHZhciB0b3VjaCA9IGxvb2t1cCh0KVxuXHRcdFx0XHR0b3VjaC50b3VjaG1vdmUoZSx0KVxuXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9udG91Y2hlbmQgZVxuXHRcdGZvciB0IGluIGU6Y2hhbmdlZFRvdWNoZXNcblx0XHRcdGlmIHZhciB0b3VjaCA9IGxvb2t1cCh0KVxuXHRcdFx0XHR0b3VjaC50b3VjaGVuZChlLHQpXG5cdFx0XHRcdHJlbGVhc2UodCx0b3VjaClcblx0XHRcdFx0Y291bnQtLVxuXG5cdFx0IyBlLnByZXZlbnREZWZhdWx0XG5cdFx0IyBub3QgYWx3YXlzIHN1cHBvcnRlZCFcblx0XHQjIHRvdWNoZXMgPSB0b3VjaGVzLmZpbHRlcih8fClcblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub250b3VjaGNhbmNlbCBlXG5cdFx0Zm9yIHQgaW4gZTpjaGFuZ2VkVG91Y2hlc1xuXHRcdFx0aWYgdmFyIHRvdWNoID0gbG9va3VwKHQpXG5cdFx0XHRcdHRvdWNoLnRvdWNoY2FuY2VsKGUsdClcblx0XHRcdFx0cmVsZWFzZSh0LHRvdWNoKVxuXHRcdFx0XHRjb3VudC0tXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9ubW91c2Vkb3duIGVcblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub25tb3VzZW1vdmUgZVxuXHRcdHNlbGZcblxuXHRkZWYgc2VsZi5vbm1vdXNldXAgZVxuXHRcdHNlbGZcblxuXG5cdHByb3AgcGhhc2Vcblx0cHJvcCBhY3RpdmVcblx0cHJvcCBldmVudFxuXHRwcm9wIHBvaW50ZXJcblx0cHJvcCB0YXJnZXRcblx0cHJvcCBoYW5kbGVyXG5cdHByb3AgdXBkYXRlc1xuXHRwcm9wIHN1cHByZXNzXG5cdHByb3AgZGF0YVxuXHRwcm9wIGJ1YmJsZSBjaGFpbmFibGU6IHllc1xuXG5cdHByb3AgZ2VzdHVyZXNcblxuXHQjIyNcblx0XG5cblx0QGludGVybmFsXG5cdEBjb25zdHJ1Y3RvclxuXHQjIyNcblx0ZGVmIGluaXRpYWxpemUgZXZlbnQsIHBvaW50ZXJcblx0XHQjIEBuYXRpdmUgID0gZmFsc2Vcblx0XHRzZWxmLmV2ZW50ID0gZXZlbnRcblx0XHRkYXRhID0ge31cblx0XHRhY3RpdmUgPSB5ZXNcblx0XHRAYnV0dG9uID0gZXZlbnQgYW5kIGV2ZW50OmJ1dHRvbiBvciAwXG5cdFx0QHN1cHByZXNzID0gbm8gIyBkZXByZWNhdGVkXG5cdFx0QGNhcHR1cmVkID0gbm9cblx0XHRidWJibGUgPSBub1xuXHRcdHBvaW50ZXIgPSBwb2ludGVyXG5cdFx0dXBkYXRlcyA9IDBcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBjYXB0dXJlXG5cdFx0QGNhcHR1cmVkID0geWVzXG5cdFx0QGV2ZW50IGFuZCBAZXZlbnQucHJldmVudERlZmF1bHRcblx0XHRzZWxmXG5cblx0ZGVmIGlzQ2FwdHVyZWRcblx0XHQhIUBjYXB0dXJlZFxuXG5cdCMjI1xuXHRFeHRlbmQgdGhlIHRvdWNoIHdpdGggYSBwbHVnaW4gLyBnZXN0dXJlLiBcblx0QWxsIGV2ZW50cyAodG91Y2hzdGFydCxtb3ZlIGV0YykgZm9yIHRoZSB0b3VjaFxuXHR3aWxsIGJlIHRyaWdnZXJlZCBvbiB0aGUgcGx1Z2lucyBpbiB0aGUgb3JkZXIgdGhleVxuXHRhcmUgYWRkZWQuXG5cdCMjI1xuXHRkZWYgZXh0ZW5kIHBsdWdpblxuXHRcdCMgY29uc29sZS5sb2cgXCJhZGRlZCBnZXN0dXJlISEhXCJcblx0XHRAZ2VzdHVyZXMgfHw9IFtdXG5cdFx0QGdlc3R1cmVzLnB1c2gocGx1Z2luKVxuXHRcdHNlbGZcblxuXHQjIyNcblx0UmVkaXJlY3QgdG91Y2ggdG8gc3BlY2lmaWVkIHRhcmdldC4gb250b3VjaHN0YXJ0IHdpbGwgYWx3YXlzIGJlXG5cdGNhbGxlZCBvbiB0aGUgbmV3IHRhcmdldC5cblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHJlZGlyZWN0IHRhcmdldFxuXHRcdEByZWRpcmVjdCA9IHRhcmdldFxuXHRcdHNlbGZcblxuXHQjIyNcblx0U3VwcHJlc3MgdGhlIGRlZmF1bHQgYmVoYXZpb3VyLiBXaWxsIGNhbGwgcHJldmVudERlZmF1bHQgZm9yXG5cdGFsbCBuYXRpdmUgZXZlbnRzIHRoYXQgYXJlIHBhcnQgb2YgdGhlIHRvdWNoLlxuXHQjIyNcblx0ZGVmIHN1cHByZXNzXG5cdFx0IyBjb2xsaXNpb24gd2l0aCB0aGUgc3VwcHJlc3MgcHJvcGVydHlcblx0XHRAYWN0aXZlID0gbm9cblx0XHRzZWxmXG5cblx0ZGVmIHN1cHByZXNzPSB2YWx1ZVxuXHRcdGNvbnNvbGUud2FybiAnSW1iYS5Ub3VjaCNzdXBwcmVzcz0gaXMgZGVwcmVjYXRlZCdcblx0XHRAc3VwcmVzcyA9IHZhbHVlXG5cdFx0c2VsZlxuXG5cdGRlZiB0b3VjaHN0YXJ0IGUsdFxuXHRcdEBldmVudCA9IGVcblx0XHRAdG91Y2ggPSB0XG5cdFx0QGJ1dHRvbiA9IDBcblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0YmVnYW5cblx0XHRlLnByZXZlbnREZWZhdWx0IGlmIGUgYW5kIGlzQ2FwdHVyZWRcblx0XHRzZWxmXG5cblx0ZGVmIHRvdWNobW92ZSBlLHRcblx0XHRAZXZlbnQgPSBlXG5cdFx0QHggPSB0OmNsaWVudFhcblx0XHRAeSA9IHQ6Y2xpZW50WVxuXHRcdHVwZGF0ZVxuXHRcdGUucHJldmVudERlZmF1bHQgaWYgZSBhbmQgaXNDYXB0dXJlZFxuXHRcdHNlbGZcblxuXHRkZWYgdG91Y2hlbmQgZSx0XG5cdFx0QGV2ZW50ID0gZVxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHRlbmRlZFxuXG5cdFx0bGFzdE5hdGl2ZVRvdWNoVGltZVN0YW1wID0gZTp0aW1lU3RhbXBcblxuXHRcdGlmIEBtYXhkciA8IDIwXG5cdFx0XHR2YXIgdGFwID0gSW1iYS5FdmVudC5uZXcoZSlcblx0XHRcdHRhcC50eXBlID0gJ3RhcCdcblx0XHRcdHRhcC5wcm9jZXNzXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0IGlmIHRhcC5AcmVzcG9uZGVyXHRcblxuXHRcdGlmIGUgYW5kIGlzQ2FwdHVyZWRcblx0XHRcdGUucHJldmVudERlZmF1bHRcblxuXHRcdHNlbGZcblxuXHRkZWYgdG91Y2hjYW5jZWwgZSx0XG5cdFx0Y2FuY2VsXG5cblx0ZGVmIG1vdXNlZG93biBlLHRcblx0XHRAZXZlbnQgPSBlXG5cdFx0QGJ1dHRvbiA9IGU6YnV0dG9uXG5cdFx0QHggPSB0OmNsaWVudFhcblx0XHRAeSA9IHQ6Y2xpZW50WVxuXHRcdGJlZ2FuXG5cblx0XHRAbW91c2Vtb3ZlID0gKHxlfCBtb3VzZW1vdmUoZSxlKSApXG5cdFx0ZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsQG1vdXNlbW92ZSx5ZXMpXG5cdFx0c2VsZlxuXG5cdGRlZiBtb3VzZW1vdmUgZSx0XG5cdFx0QHggPSB0OmNsaWVudFhcblx0XHRAeSA9IHQ6Y2xpZW50WVxuXHRcdEBldmVudCA9IGVcblx0XHRlLnByZXZlbnREZWZhdWx0IGlmIGlzQ2FwdHVyZWRcblx0XHR1cGRhdGVcblx0XHRtb3ZlXG5cdFx0c2VsZlxuXG5cdGRlZiBtb3VzZXVwIGUsdFxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHRlbmRlZFxuXHRcdGRvYy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLEBtb3VzZW1vdmUseWVzKVxuXHRcdEBtb3VzZW1vdmUgPSBudWxsXG5cdFx0c2VsZlxuXG5cdGRlZiBpZGxlXG5cdFx0dXBkYXRlXG5cblx0ZGVmIGJlZ2FuXG5cdFx0QG1heGRyID0gQGRyID0gMFxuXHRcdEB4MCA9IEB4XG5cdFx0QHkwID0gQHlcblxuXHRcdHZhciBkb20gPSBldmVudDp0YXJnZXRcblx0XHR2YXIgbm9kZSA9IG51bGxcblxuXHRcdEBzb3VyY2VUYXJnZXQgPSBkb20gYW5kIHRhZyhkb20pXG5cblx0XHR3aGlsZSBkb21cblx0XHRcdG5vZGUgPSB0YWcoZG9tKVxuXHRcdFx0aWYgbm9kZSAmJiBub2RlOm9udG91Y2hzdGFydFxuXHRcdFx0XHRAYnViYmxlID0gbm9cblx0XHRcdFx0dGFyZ2V0ID0gbm9kZVxuXHRcdFx0XHR0YXJnZXQub250b3VjaHN0YXJ0KHNlbGYpXG5cdFx0XHRcdGJyZWFrIHVubGVzcyBAYnViYmxlXG5cdFx0XHRkb20gPSBkb206cGFyZW50Tm9kZVxuXG5cdFx0QHVwZGF0ZXMrK1xuXHRcdHNlbGZcblxuXHRkZWYgdXBkYXRlXG5cdFx0cmV0dXJuIHNlbGYgdW5sZXNzIEBhY3RpdmVcblxuXHRcdHZhciBkciA9IE1hdGguc3FydChkeCpkeCArIGR5KmR5KVxuXHRcdEBtYXhkciA9IGRyIGlmIGRyID4gQGRyXG5cdFx0QGRyID0gZHJcblxuXHRcdCMgY2F0Y2hpbmcgYSB0b3VjaC1yZWRpcmVjdD8hP1xuXHRcdGlmIEByZWRpcmVjdFxuXHRcdFx0aWYgQHRhcmdldCBhbmQgQHRhcmdldDpvbnRvdWNoY2FuY2VsXG5cdFx0XHRcdEB0YXJnZXQub250b3VjaGNhbmNlbChzZWxmKVxuXHRcdFx0dGFyZ2V0ID0gQHJlZGlyZWN0XG5cdFx0XHRAcmVkaXJlY3QgPSBudWxsXG5cdFx0XHR0YXJnZXQub250b3VjaHN0YXJ0KHNlbGYpIGlmIHRhcmdldDpvbnRvdWNoc3RhcnRcblxuXG5cdFx0QHVwZGF0ZXMrK1xuXHRcdGlmIEBnZXN0dXJlc1xuXHRcdFx0Zy5vbnRvdWNodXBkYXRlKHNlbGYpIGZvciBnIGluIEBnZXN0dXJlc1xuXG5cdFx0dGFyZ2V0Py5vbnRvdWNodXBkYXRlKHNlbGYpXG5cdFx0c2VsZlxuXG5cdGRlZiBtb3ZlXG5cdFx0cmV0dXJuIHNlbGYgdW5sZXNzIEBhY3RpdmVcblxuXHRcdGlmIEBnZXN0dXJlc1xuXHRcdFx0Zm9yIGcgaW4gQGdlc3R1cmVzXG5cdFx0XHRcdGcub250b3VjaG1vdmUoc2VsZixAZXZlbnQpIGlmIGc6b250b3VjaG1vdmVcblxuXHRcdHRhcmdldD8ub250b3VjaG1vdmUoc2VsZixAZXZlbnQpXG5cdFx0c2VsZlxuXG5cdGRlZiBlbmRlZFxuXHRcdHJldHVybiBzZWxmIHVubGVzcyBAYWN0aXZlXG5cblx0XHRAdXBkYXRlcysrXG5cblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGcub250b3VjaGVuZChzZWxmKSBmb3IgZyBpbiBAZ2VzdHVyZXNcblxuXHRcdHRhcmdldD8ub250b3VjaGVuZChzZWxmKVxuXG5cdFx0c2VsZlxuXG5cdGRlZiBjYW5jZWxcblx0XHR1bmxlc3MgQGNhbmNlbGxlZFxuXHRcdFx0QGNhbmNlbGxlZCA9IHllc1xuXHRcdFx0Y2FuY2VsbGVkXG5cdFx0XHRkb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJyxAbW91c2Vtb3ZlLHllcykgaWYgQG1vdXNlbW92ZVxuXHRcdHNlbGZcblxuXHRkZWYgY2FuY2VsbGVkXG5cdFx0cmV0dXJuIHNlbGYgdW5sZXNzIEBhY3RpdmVcblxuXHRcdEBjYW5jZWxsZWQgPSB5ZXNcblx0XHRAdXBkYXRlcysrXG5cblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGZvciBnIGluIEBnZXN0dXJlc1xuXHRcdFx0XHRnLm9udG91Y2hjYW5jZWwoc2VsZikgaWYgZzpvbnRvdWNoY2FuY2VsXG5cblx0XHR0YXJnZXQ/Lm9udG91Y2hjYW5jZWwoc2VsZilcblx0XHRzZWxmXG5cblx0IyMjXG5cdFRoZSBhYnNvbHV0ZSBkaXN0YW5jZSB0aGUgdG91Y2ggaGFzIG1vdmVkIGZyb20gc3RhcnRpbmcgcG9zaXRpb24gXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiBkciBkbyBAZHJcblxuXHQjIyNcblx0VGhlIGRpc3RhbmNlIHRoZSB0b3VjaCBoYXMgbW92ZWQgaG9yaXpvbnRhbGx5XG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiBkeCBkbyBAeCAtIEB4MFxuXG5cdCMjI1xuXHRUaGUgZGlzdGFuY2UgdGhlIHRvdWNoIGhhcyBtb3ZlZCB2ZXJ0aWNhbGx5XG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiBkeSBkbyBAeSAtIEB5MFxuXG5cdCMjI1xuXHRJbml0aWFsIGhvcml6b250YWwgcG9zaXRpb24gb2YgdG91Y2hcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHgwIGRvIEB4MFxuXG5cdCMjI1xuXHRJbml0aWFsIHZlcnRpY2FsIHBvc2l0aW9uIG9mIHRvdWNoXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB5MCBkbyBAeTBcblxuXHQjIyNcblx0SG9yaXpvbnRhbCBwb3NpdGlvbiBvZiB0b3VjaFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgeCBkbyBAeFxuXG5cdCMjI1xuXHRWZXJ0aWNhbCBwb3NpdGlvbiBvZiB0b3VjaFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgeSBkbyBAeVxuXG5cdCMjI1xuXHRIb3Jpem9udGFsIHBvc2l0aW9uIG9mIHRvdWNoIHJlbGF0aXZlIHRvIHRhcmdldFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgdHggZG9cblx0XHRAdGFyZ2V0Qm94IHx8PSBAdGFyZ2V0LmRvbS5nZXRCb3VuZGluZ0NsaWVudFJlY3Rcblx0XHRAeCAtIEB0YXJnZXRCb3g6bGVmdFxuXG5cdCMjI1xuXHRWZXJ0aWNhbCBwb3NpdGlvbiBvZiB0b3VjaCByZWxhdGl2ZSB0byB0YXJnZXRcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHR5XG5cdFx0QHRhcmdldEJveCB8fD0gQHRhcmdldC5kb20uZ2V0Qm91bmRpbmdDbGllbnRSZWN0XG5cdFx0QHkgLSBAdGFyZ2V0Qm94OnRvcFxuXG5cdCMjI1xuXHRCdXR0b24gcHJlc3NlZCBpbiB0aGlzIHRvdWNoLiBOYXRpdmUgdG91Y2hlcyBkZWZhdWx0cyB0byBsZWZ0LWNsaWNrICgwKVxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgYnV0dG9uIGRvIEBidXR0b24gIyBAcG9pbnRlciA/IEBwb2ludGVyLmJ1dHRvbiA6IDBcblxuXHRkZWYgc291cmNlVGFyZ2V0XG5cdFx0QHNvdXJjZVRhcmdldFxuXG5cbmNsYXNzIEltYmEuVG91Y2hHZXN0dXJlXG5cblx0cHJvcCBhY3RpdmUgZGVmYXVsdDogbm9cblxuXHRkZWYgb250b3VjaHN0YXJ0IGVcblx0XHRzZWxmXG5cblx0ZGVmIG9udG91Y2h1cGRhdGUgZVxuXHRcdHNlbGZcblxuXHRkZWYgb250b3VjaGVuZCBlXG5cdFx0c2VsZlxuXG5cbiMgQSBUb3VjaC1ldmVudCBpcyBjcmVhdGVkIG9uIG1vdXNlZG93biAoYWx3YXlzKVxuIyBhbmQgd2hpbGUgaXQgZXhpc3RzLCBtb3VzZW1vdmUgYW5kIG1vdXNldXAgd2lsbFxuIyBiZSBkZWxlZ2F0ZWQgdG8gdGhpcyBhY3RpdmUgZXZlbnQuXG5JbWJhLlBPSU5URVIgPSBJbWJhLlBvaW50ZXIubmV3XG5JbWJhLlBPSU5URVJTID0gW0ltYmEuUE9JTlRFUl1cblxuXG4jIHJlZ3VsYXIgZXZlbnQgc3R1ZmZcbkltYmEuS0VZTUFQID0ge1xuXHRcIjhcIjogJ2JhY2tzcGFjZSdcblx0XCI5XCI6ICd0YWInXG5cdFwiMTNcIjogJ2VudGVyJ1xuXHRcIjE2XCI6ICdzaGlmdCdcblx0XCIxN1wiOiAnY3RybCdcblx0XCIxOFwiOiAnYWx0J1xuXHRcIjE5XCI6ICdicmVhaydcblx0XCIyMFwiOiAnY2Fwcydcblx0XCIyN1wiOiAnZXNjJ1xuXHRcIjMyXCI6ICdzcGFjZSdcblx0XCIzNVwiOiAnZW5kJ1xuXHRcIjM2XCI6ICdob21lJ1xuXHRcIjM3XCI6ICdsYXJyJ1xuXHRcIjM4XCI6ICd1YXJyJ1xuXHRcIjM5XCI6ICdyYXJyJ1xuXHRcIjQwXCI6ICdkYXJyJ1xuXHRcIjQ1XCI6ICdpbnNlcnQnXG5cdFwiNDZcIjogJ2RlbGV0ZSdcblx0XCIxMDdcIjogJ3BsdXMnXG5cdFwiMTA2XCI6ICdtdWx0J1xuXHRcIjkxXCI6ICdtZXRhJ1xufVxuXG5JbWJhLkNIQVJNQVAgPSB7XG5cdFwiJVwiOiAnbW9kdWxvJ1xuXHRcIipcIjogJ211bHRpcGx5J1xuXHRcIitcIjogJ2FkZCdcblx0XCItXCI6ICdzdWInXG5cdFwiL1wiOiAnZGl2aWRlJ1xuXHRcIi5cIjogJ2RvdCdcbn1cblxuIyMjXG5JbWJhIGhhbmRsZXMgYWxsIGV2ZW50cyBpbiB0aGUgZG9tIHRocm91Z2ggYSBzaW5nbGUgbWFuYWdlcixcbmxpc3RlbmluZyBhdCB0aGUgcm9vdCBvZiB5b3VyIGRvY3VtZW50LiBJZiBJbWJhIGZpbmRzIGEgdGFnXG50aGF0IGxpc3RlbnMgdG8gYSBjZXJ0YWluIGV2ZW50LCB0aGUgZXZlbnQgd2lsbCBiZSB3cmFwcGVkIFxuaW4gYW4gYEltYmEuRXZlbnRgLCB3aGljaCBub3JtYWxpemVzIHNvbWUgb2YgdGhlIHF1aXJrcyBhbmQgXG5icm93c2VyIGRpZmZlcmVuY2VzLlxuXG5AaW5hbWUgZXZlbnRcbiMjI1xuY2xhc3MgSW1iYS5FdmVudFxuXG5cdCMjIyByZWZlcmVuY2UgdG8gdGhlIG5hdGl2ZSBldmVudCAjIyNcblx0cHJvcCBldmVudFxuXG5cdCMjIyByZWZlcmVuY2UgdG8gdGhlIG5hdGl2ZSBldmVudCAjIyNcblx0cHJvcCBwcmVmaXhcblxuXHRwcm9wIGRhdGFcblxuXHQjIyNcblx0c2hvdWxkIHJlbW92ZSB0aGlzIGFsbHRvZ2V0aGVyP1xuXHRAZGVwcmVjYXRlZFxuXHQjIyNcblx0cHJvcCBzb3VyY2VcblxuXHQjIyMgQSB7Qm9vbGVhbn0gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBldmVudCBidWJibGVzIHVwIG9yIG5vdCAjIyNcblx0cHJvcCBidWJibGUgdHlwZTogQm9vbGVhbiwgY2hhaW5hYmxlOiB5ZXNcblxuXHRkZWYgc2VsZi53cmFwIGVcblx0XHRzZWxmLm5ldyhlKVxuXHRcblx0ZGVmIGluaXRpYWxpemUgZVxuXHRcdGV2ZW50ID0gZVxuXHRcdGJ1YmJsZSA9IHllc1xuXG5cdGRlZiB0eXBlPSB0eXBlXG5cdFx0QHR5cGUgPSB0eXBlXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRAcmV0dXJuIHtTdHJpbmd9IFRoZSBuYW1lIG9mIHRoZSBldmVudCAoY2FzZS1pbnNlbnNpdGl2ZSlcblx0IyMjXG5cdGRlZiB0eXBlXG5cdFx0QHR5cGUgfHwgZXZlbnQ6dHlwZVxuXG5cdGRlZiBuYW1lXG5cdFx0QG5hbWUgfHw9IHR5cGUudG9Mb3dlckNhc2UucmVwbGFjZSgvXFw6L2csJycpXG5cblx0IyBtaW1jIGdldHNldFxuXHRkZWYgYnViYmxlIHZcblx0XHRpZiB2ICE9IHVuZGVmaW5lZFxuXHRcdFx0c2VsZi5idWJibGUgPSB2XG5cdFx0XHRyZXR1cm4gc2VsZlxuXHRcdHJldHVybiBAYnViYmxlXG5cblx0IyMjXG5cdFByZXZlbnRzIGZ1cnRoZXIgcHJvcGFnYXRpb24gb2YgdGhlIGN1cnJlbnQgZXZlbnQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgaGFsdFxuXHRcdGJ1YmJsZSA9IG5vXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRDYW5jZWwgdGhlIGV2ZW50IChpZiBjYW5jZWxhYmxlKS4gSW4gdGhlIGNhc2Ugb2YgbmF0aXZlIGV2ZW50cyBpdFxuXHR3aWxsIGNhbGwgYHByZXZlbnREZWZhdWx0YCBvbiB0aGUgd3JhcHBlZCBldmVudCBvYmplY3QuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgY2FuY2VsXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQgaWYgZXZlbnQ6cHJldmVudERlZmF1bHRcblx0XHRAY2FuY2VsID0geWVzXG5cdFx0c2VsZlxuXG5cdGRlZiBzaWxlbmNlXG5cdFx0QHNpbGVuY2VkID0geWVzXG5cdFx0c2VsZlxuXG5cdGRlZiBpc1NpbGVuY2VkXG5cdFx0ISFAc2lsZW5jZWRcblxuXHQjIyNcblx0SW5kaWNhdGVzIHdoZXRoZXIgb3Igbm90IGV2ZW50LmNhbmNlbCBoYXMgYmVlbiBjYWxsZWQuXG5cblx0QHJldHVybiB7Qm9vbGVhbn1cblx0IyMjXG5cdGRlZiBpc1ByZXZlbnRlZFxuXHRcdGV2ZW50IGFuZCBldmVudDpkZWZhdWx0UHJldmVudGVkIG9yIEBjYW5jZWxcblxuXHQjIyNcblx0QSByZWZlcmVuY2UgdG8gdGhlIGluaXRpYWwgdGFyZ2V0IG9mIHRoZSBldmVudC5cblx0IyMjXG5cdGRlZiB0YXJnZXRcblx0XHR0YWcoZXZlbnQ6X3RhcmdldCBvciBldmVudDp0YXJnZXQpXG5cblx0IyMjXG5cdEEgcmVmZXJlbmNlIHRvIHRoZSBvYmplY3QgcmVzcG9uZGluZyB0byB0aGUgZXZlbnQuXG5cdCMjI1xuXHRkZWYgcmVzcG9uZGVyXG5cdFx0QHJlc3BvbmRlclxuXG5cdCMjI1xuXHRSZWRpcmVjdCB0aGUgZXZlbnQgdG8gbmV3IHRhcmdldFxuXHQjIyNcblx0ZGVmIHJlZGlyZWN0IG5vZGVcblx0XHRAcmVkaXJlY3QgPSBub2RlXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRHZXQgdGhlIG5vcm1hbGl6ZWQgY2hhcmFjdGVyIGZvciBLZXlib2FyZEV2ZW50L1RleHRFdmVudFxuXHRAcmV0dXJuIHtTdHJpbmd9XG5cdCMjI1xuXHRkZWYga2V5Y2hhclxuXHRcdGlmIGV2ZW50IGlzYSBLZXlib2FyZEV2ZW50XG5cdFx0XHR2YXIga2kgPSBldmVudDprZXlJZGVudGlmaWVyXG5cdFx0XHR2YXIgc3ltID0gSW1iYS5LRVlNQVBbZXZlbnQ6a2V5Q29kZV1cblxuXHRcdFx0aWYgIXN5bSBhbmQga2kuc3Vic3RyKDAsMikgPT0gXCJVK1wiXG5cdFx0XHRcdHN5bSA9IFN0cmluZy5mcm9tQ2hhckNvZGUocGFyc2VJbnQoa2kuc3Vic3RyKDIpLCAxNikpXG5cdFx0XHRyZXR1cm4gc3ltXG5cblx0XHRlbGlmIGV2ZW50IGlzYSAod2luZG93LlRleHRFdmVudCBvciB3aW5kb3cuSW5wdXRFdmVudClcblx0XHRcdHJldHVybiBldmVudDpkYXRhXG5cblx0XHRyZXR1cm4gbnVsbFxuXG5cdCMjI1xuXHRAZGVwcmVjYXRlZFxuXHQjIyNcblx0ZGVmIGtleWNvbWJvXG5cdFx0cmV0dXJuIHVubGVzcyB2YXIgc3ltID0ga2V5Y2hhclxuXHRcdHN5bSA9IEltYmEuQ0hBUk1BUFtzeW1dIG9yIHN5bVxuXHRcdHZhciBjb21ibyA9IFtdLCBlID0gZXZlbnRcblx0XHRjb21iby5wdXNoKDpjdHJsKSBpZiBlOmN0cmxLZXlcblx0XHRjb21iby5wdXNoKDpzaGlmdCkgaWYgZTpzaGlmdEtleVxuXHRcdGNvbWJvLnB1c2goOmFsdCkgaWYgZTphbHRLZXlcblx0XHRjb21iby5wdXNoKDpjbWQpIGlmIGU6bWV0YUtleVxuXHRcdGNvbWJvLnB1c2goc3ltKVxuXHRcdGNvbWJvLmpvaW4oXCJfXCIpLnRvTG93ZXJDYXNlXG5cblxuXHRkZWYgcHJvY2Vzc1xuXHRcdHZhciBtZXRoID0gXCJvbntAcHJlZml4IG9yICcnfXtuYW1lfVwiXG5cdFx0dmFyIGFyZ3MgPSBudWxsXG5cdFx0dmFyIGRvbXRhcmdldCA9IGV2ZW50Ol90YXJnZXQgb3IgZXZlbnQ6dGFyZ2V0XHRcdFxuXHRcdCMgdmFyIG5vZGUgPSA8e2RvbXRhcmdldDpfcmVzcG9uZGVyIG9yIGRvbXRhcmdldH0+XG5cdFx0IyBuZWVkIHRvIGNsZWFuIHVwIGFuZCBkb2N1bWVudCB0aGlzIGJlaGF2aW91clxuXG5cdFx0dmFyIGRvbW5vZGUgPSBkb210YXJnZXQ6X3Jlc3BvbmRlciBvciBkb210YXJnZXRcblx0XHQjIEB0b2RvIG5lZWQgdG8gc3RvcCBpbmZpbml0ZSByZWRpcmVjdC1ydWxlcyBoZXJlXG5cblx0XHR3aGlsZSBkb21ub2RlXG5cdFx0XHRAcmVkaXJlY3QgPSBudWxsXG5cdFx0XHRpZiB2YXIgbm9kZSA9IHRhZyhkb21ub2RlKSAjIG5vdCBvbmx5IHRhZyBcblxuXHRcdFx0XHRpZiBub2RlW21ldGhdIGlzYSBTdHJpbmdcblx0XHRcdFx0XHQjIHNob3VsZCByZW1lbWJlciB0aGUgcmVjZWl2ZXIgb2YgdGhlIGV2ZW50XG5cdFx0XHRcdFx0bWV0aCA9IG5vZGVbbWV0aF1cblx0XHRcdFx0XHRjb250aW51ZSAjIHNob3VsZCBub3QgY29udGludWU/XG5cblx0XHRcdFx0aWYgbm9kZVttZXRoXSBpc2EgQXJyYXlcblx0XHRcdFx0XHRhcmdzID0gbm9kZVttZXRoXS5jb25jYXQobm9kZSlcblx0XHRcdFx0XHRtZXRoID0gYXJncy5zaGlmdFxuXHRcdFx0XHRcdGNvbnRpbnVlICMgc2hvdWxkIG5vdCBjb250aW51ZT9cblxuXHRcdFx0XHRpZiBub2RlW21ldGhdIGlzYSBGdW5jdGlvblxuXHRcdFx0XHRcdEByZXNwb25kZXIgfHw9IG5vZGVcblx0XHRcdFx0XHQjIHNob3VsZCBhdXRvc3RvcCBidWJibGUgaGVyZT9cblx0XHRcdFx0XHRhcmdzID8gbm9kZVttZXRoXS5hcHBseShub2RlLGFyZ3MpIDogbm9kZVttZXRoXShzZWxmLGRhdGEpXG5cdFx0XHRcdFx0XG5cdFx0XHQjIGFkZCBub2RlLm5leHRFdmVudFJlc3BvbmRlciBhcyBhIHNlcGFyYXRlIG1ldGhvZCBoZXJlP1xuXHRcdFx0dW5sZXNzIGJ1YmJsZSBhbmQgZG9tbm9kZSA9IChAcmVkaXJlY3Qgb3IgKG5vZGUgPyBub2RlLnBhcmVudCA6IGRvbW5vZGU6cGFyZW50Tm9kZSkpXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRwcm9jZXNzZWRcblx0XHRyZXR1cm4gc2VsZlxuXG5cblx0ZGVmIHByb2Nlc3NlZFxuXHRcdEltYmEuZW1pdChJbWJhLCdldmVudCcsW3NlbGZdKSB1bmxlc3MgQHNpbGVuY2VkXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRSZXR1cm4gdGhlIHgvbGVmdCBjb29yZGluYXRlIG9mIHRoZSBtb3VzZSAvIHBvaW50ZXIgZm9yIHRoaXMgZXZlbnRcblx0QHJldHVybiB7TnVtYmVyfSB4IGNvb3JkaW5hdGUgb2YgbW91c2UgLyBwb2ludGVyIGZvciBldmVudFxuXHQjIyNcblx0ZGVmIHggZG8gZXZlbnQ6eFxuXG5cdCMjI1xuXHRSZXR1cm4gdGhlIHkvdG9wIGNvb3JkaW5hdGUgb2YgdGhlIG1vdXNlIC8gcG9pbnRlciBmb3IgdGhpcyBldmVudFxuXHRAcmV0dXJuIHtOdW1iZXJ9IHkgY29vcmRpbmF0ZSBvZiBtb3VzZSAvIHBvaW50ZXIgZm9yIGV2ZW50XG5cdCMjI1xuXHRkZWYgeSBkbyBldmVudDp5XG5cblx0IyMjXG5cdFJldHVybnMgYSBOdW1iZXIgcmVwcmVzZW50aW5nIGEgc3lzdGVtIGFuZCBpbXBsZW1lbnRhdGlvblxuXHRkZXBlbmRlbnQgbnVtZXJpYyBjb2RlIGlkZW50aWZ5aW5nIHRoZSB1bm1vZGlmaWVkIHZhbHVlIG9mIHRoZVxuXHRwcmVzc2VkIGtleTsgdGhpcyBpcyB1c3VhbGx5IHRoZSBzYW1lIGFzIGtleUNvZGUuXG5cblx0Rm9yIG1vdXNlLWV2ZW50cywgdGhlIHJldHVybmVkIHZhbHVlIGluZGljYXRlcyB3aGljaCBidXR0b24gd2FzXG5cdHByZXNzZWQgb24gdGhlIG1vdXNlIHRvIHRyaWdnZXIgdGhlIGV2ZW50LlxuXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB3aGljaCBkbyBldmVudDp3aGljaFxuXG5cbiMjI1xuXG5NYW5hZ2VyIGZvciBsaXN0ZW5pbmcgdG8gYW5kIGRlbGVnYXRpbmcgZXZlbnRzIGluIEltYmEuIEEgc2luZ2xlIGluc3RhbmNlXG5pcyBhbHdheXMgY3JlYXRlZCBieSBJbWJhIChhcyBgSW1iYS5FdmVudHNgKSwgd2hpY2ggaGFuZGxlcyBhbmQgZGVsZWdhdGVzIGFsbFxuZXZlbnRzIGF0IHRoZSB2ZXJ5IHJvb3Qgb2YgdGhlIGRvY3VtZW50LiBJbWJhIGRvZXMgbm90IGNhcHR1cmUgYWxsIGV2ZW50c1xuYnkgZGVmYXVsdCwgc28gaWYgeW91IHdhbnQgdG8gbWFrZSBzdXJlIGV4b3RpYyBvciBjdXN0b20gRE9NRXZlbnRzIGFyZSBkZWxlZ2F0ZWRcbmluIEltYmEgeW91IHdpbGwgbmVlZCB0byByZWdpc3RlciB0aGVtIGluIGBJbWJhLkV2ZW50cy5yZWdpc3RlcihteUN1c3RvbUV2ZW50TmFtZSlgXG5cbkBpbmFtZSBtYW5hZ2VyXG5cbiMjI1xuY2xhc3MgSW1iYS5FdmVudE1hbmFnZXJcblxuXHRwcm9wIHJvb3Rcblx0cHJvcCBjb3VudFxuXHRwcm9wIGVuYWJsZWQgZGVmYXVsdDogbm8sIHdhdGNoOiB5ZXNcblx0cHJvcCBsaXN0ZW5lcnNcblx0cHJvcCBkZWxlZ2F0b3JzXG5cdHByb3AgZGVsZWdhdG9yXG5cblx0ZGVmIGVuYWJsZWQtZGlkLXNldCBib29sXG5cdFx0Ym9vbCA/IG9uZW5hYmxlIDogb25kaXNhYmxlXG5cdFx0c2VsZlxuXG5cdGRlZiBpbml0aWFsaXplIG5vZGUsIGV2ZW50czogW11cblx0XHRyb290ID0gbm9kZVxuXHRcdGNvdW50ID0gMFxuXHRcdGxpc3RlbmVycyA9IFtdXG5cdFx0ZGVsZWdhdG9ycyA9IHt9XG5cdFx0ZGVsZWdhdG9yID0gZG8gfGV8IFxuXHRcdFx0IyBjb25zb2xlLmxvZyBcImRlbGVnYXRpbmcgZXZlbnQ/ISB7ZX1cIlxuXHRcdFx0ZGVsZWdhdGUoZSlcblx0XHRcdHJldHVybiB0cnVlXG5cblx0XHRmb3IgZXZlbnQgaW4gZXZlbnRzXG5cdFx0XHRyZWdpc3RlcihldmVudClcblxuXHRcdHJldHVybiBzZWxmXG5cblx0IyMjXG5cblx0VGVsbCB0aGUgY3VycmVudCBFdmVudE1hbmFnZXIgdG8gaW50ZXJjZXB0IGFuZCBoYW5kbGUgZXZlbnQgb2YgYSBjZXJ0YWluIG5hbWUuXG5cdEJ5IGRlZmF1bHQsIEltYmEuRXZlbnRzIHdpbGwgcmVnaXN0ZXIgaW50ZXJjZXB0b3JzIGZvcjogKmtleWRvd24qLCAqa2V5dXAqLCBcblx0KmtleXByZXNzKiwgKnRleHRJbnB1dCosICppbnB1dCosICpjaGFuZ2UqLCAqc3VibWl0KiwgKmZvY3VzaW4qLCAqZm9jdXNvdXQqLCBcblx0KmJsdXIqLCAqY29udGV4dG1lbnUqLCAqZGJsY2xpY2sqLCAqbW91c2V3aGVlbCosICp3aGVlbCpcblxuXHQjIyNcblx0ZGVmIHJlZ2lzdGVyIG5hbWUsIGhhbmRsZXIgPSB0cnVlXG5cdFx0aWYgbmFtZSBpc2EgQXJyYXlcblx0XHRcdHJlZ2lzdGVyKHYsaGFuZGxlcikgZm9yIHYgaW4gbmFtZVxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdHJldHVybiBzZWxmIGlmIGRlbGVnYXRvcnNbbmFtZV1cblx0XHQjIGNvbnNvbGUubG9nKFwicmVnaXN0ZXIgZm9yIGV2ZW50IHtuYW1lfVwiKVxuXHRcdHZhciBmbiA9IGRlbGVnYXRvcnNbbmFtZV0gPSBoYW5kbGVyIGlzYSBGdW5jdGlvbiA/IGhhbmRsZXIgOiBkZWxlZ2F0b3Jcblx0XHRyb290LmFkZEV2ZW50TGlzdGVuZXIobmFtZSxmbix5ZXMpIGlmIGVuYWJsZWRcblxuXHRkZWYgbGlzdGVuIG5hbWUsIGhhbmRsZXIsIGNhcHR1cmUgPSB5ZXNcblx0XHRsaXN0ZW5lcnMucHVzaChbbmFtZSxoYW5kbGVyLGNhcHR1cmVdKVxuXHRcdHJvb3QuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLGhhbmRsZXIsY2FwdHVyZSkgaWYgZW5hYmxlZFxuXHRcdHNlbGZcblxuXHRkZWYgZGVsZWdhdGUgZVxuXHRcdGNvdW50ICs9IDFcblx0XHR2YXIgZXZlbnQgPSBJbWJhLkV2ZW50LndyYXAoZSlcblx0XHRldmVudC5wcm9jZXNzXG5cdFx0c2VsZlxuXG5cdGRlZiBjcmVhdGUgdHlwZSwgdGFyZ2V0LCBkYXRhOiBudWxsLCBzb3VyY2U6IG51bGxcblx0XHR2YXIgZXZlbnQgPSBJbWJhLkV2ZW50LndyYXAgdHlwZTogdHlwZSwgdGFyZ2V0OiB0YXJnZXRcblx0XHRldmVudC5kYXRhID0gZGF0YSBpZiBkYXRhXG5cdFx0ZXZlbnQuc291cmNlID0gc291cmNlIGlmIHNvdXJjZVxuXHRcdGV2ZW50XG5cblx0IyB1c2UgY3JlYXRlIGluc3RlYWQ/XG5cdGRlZiB0cmlnZ2VyXG5cdFx0Y3JlYXRlKCphcmd1bWVudHMpLnByb2Nlc3NcblxuXHRkZWYgb25lbmFibGVcblx0XHRmb3Igb3duIG5hbWUsaGFuZGxlciBvZiBkZWxlZ2F0b3JzXG5cdFx0XHRyb290LmFkZEV2ZW50TGlzdGVuZXIobmFtZSxoYW5kbGVyLHllcylcblxuXHRcdGZvciBpdGVtIGluIGxpc3RlbmVyc1xuXHRcdFx0cm9vdC5hZGRFdmVudExpc3RlbmVyKGl0ZW1bMF0saXRlbVsxXSxpdGVtWzJdKVxuXHRcdHNlbGZcblxuXHRkZWYgb25kaXNhYmxlXG5cdFx0Zm9yIG93biBuYW1lLGhhbmRsZXIgb2YgZGVsZWdhdG9yc1xuXHRcdFx0cm9vdC5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsaGFuZGxlcix5ZXMpXG5cblx0XHRmb3IgaXRlbSBpbiBsaXN0ZW5lcnNcblx0XHRcdHJvb3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihpdGVtWzBdLGl0ZW1bMV0saXRlbVsyXSlcblx0XHRzZWxmXG5cdFx0XG5cbkVEID0gSW1iYS5FdmVudHMgPSBJbWJhLkV2ZW50TWFuYWdlci5uZXcoZG9jdW1lbnQsIGV2ZW50czogW1xuXHQ6a2V5ZG93biw6a2V5dXAsOmtleXByZXNzLDp0ZXh0SW5wdXQsOmlucHV0LDpjaGFuZ2UsOnN1Ym1pdCxcblx0OmZvY3VzaW4sOmZvY3Vzb3V0LDpibHVyLDpjb250ZXh0bWVudSw6ZGJsY2xpY2ssXG5cdDptb3VzZXdoZWVsLDp3aGVlbCw6c2Nyb2xsXG5dKVxuXG4jIHNob3VsZCBzZXQgdGhlc2UgdXAgaW5zaWRlIHRoZSBJbWJhLkV2ZW50cyBvYmplY3QgaXRzZWxmXG4jIHNvIHRoYXQgd2UgY2FuIGhhdmUgZGlmZmVyZW50IEV2ZW50TWFuYWdlciBmb3IgZGlmZmVyZW50IHJvb3RzXG5cbmlmIGhhc1RvdWNoRXZlbnRzXG5cdEltYmEuRXZlbnRzLmxpc3Rlbig6dG91Y2hzdGFydCkgZG8gfGV8XG5cdFx0SW1iYS5FdmVudHMuY291bnQrK1xuXHRcdEltYmEuVG91Y2gub250b3VjaHN0YXJ0KGUpXG5cblx0SW1iYS5FdmVudHMubGlzdGVuKDp0b3VjaG1vdmUpIGRvIHxlfFxuXHRcdEltYmEuRXZlbnRzLmNvdW50Kytcblx0XHRJbWJhLlRvdWNoLm9udG91Y2htb3ZlKGUpXG5cblx0SW1iYS5FdmVudHMubGlzdGVuKDp0b3VjaGVuZCkgZG8gfGV8XG5cdFx0SW1iYS5FdmVudHMuY291bnQrK1xuXHRcdEltYmEuVG91Y2gub250b3VjaGVuZChlKVxuXG5cdEltYmEuRXZlbnRzLmxpc3Rlbig6dG91Y2hjYW5jZWwpIGRvIHxlfFxuXHRcdEltYmEuRXZlbnRzLmNvdW50Kytcblx0XHRJbWJhLlRvdWNoLm9udG91Y2hjYW5jZWwoZSlcblxuSW1iYS5FdmVudHMucmVnaXN0ZXIoOmNsaWNrKSBkbyB8ZXxcblx0IyBPbmx5IGZvciBtYWluIG1vdXNlYnV0dG9uLCBubz9cblx0aWYgKGU6dGltZVN0YW1wIC0gbGFzdE5hdGl2ZVRvdWNoVGltZVN0YW1wKSA+IGxhc3ROYXRpdmVUb3VjaFRpbWVvdXRcblx0XHR2YXIgdGFwID0gSW1iYS5FdmVudC5uZXcoZSlcblx0XHR0YXAudHlwZSA9ICd0YXAnXG5cdFx0dGFwLnByb2Nlc3Ncblx0XHRpZiB0YXAuQHJlc3BvbmRlclxuXHRcdFx0cmV0dXJuIGUucHJldmVudERlZmF1bHRcblx0IyBkZWxlZ2F0ZSB0aGUgcmVhbCBjbGljayBldmVudFxuXHRJbWJhLkV2ZW50cy5kZWxlZ2F0ZShlKVxuXG5JbWJhLkV2ZW50cy5saXN0ZW4oOm1vdXNlZG93bikgZG8gfGV8XG5cdGlmIChlOnRpbWVTdGFtcCAtIGxhc3ROYXRpdmVUb3VjaFRpbWVTdGFtcCkgPiBsYXN0TmF0aXZlVG91Y2hUaW1lb3V0XG5cdFx0SW1iYS5QT0lOVEVSLnVwZGF0ZShlKS5wcm9jZXNzIGlmIEltYmEuUE9JTlRFUlxuXG4jIEltYmEuRXZlbnRzLmxpc3Rlbig6bW91c2Vtb3ZlKSBkbyB8ZXxcbiMgXHQjIGNvbnNvbGUubG9nICdtb3VzZW1vdmUnLGU6dGltZVN0YW1wXG4jIFx0aWYgKGU6dGltZVN0YW1wIC0gbGFzdE5hdGl2ZVRvdWNoVGltZVN0YW1wKSA+IGxhc3ROYXRpdmVUb3VjaFRpbWVvdXRcbiMgXHRcdEltYmEuUE9JTlRFUi51cGRhdGUoZSkucHJvY2VzcyBpZiBJbWJhLlBPSU5URVIgIyAucHJvY2VzcyBpZiB0b3VjaCAjIHNob3VsZCBub3QgaGFwcGVuPyBXZSBwcm9jZXNzIHRocm91Z2ggXG5cbkltYmEuRXZlbnRzLmxpc3Rlbig6bW91c2V1cCkgZG8gfGV8XG5cdCMgY29uc29sZS5sb2cgJ21vdXNldXAnLGU6dGltZVN0YW1wXG5cdGlmIChlOnRpbWVTdGFtcCAtIGxhc3ROYXRpdmVUb3VjaFRpbWVTdGFtcCkgPiBsYXN0TmF0aXZlVG91Y2hUaW1lb3V0XG5cdFx0SW1iYS5QT0lOVEVSLnVwZGF0ZShlKS5wcm9jZXNzIGlmIEltYmEuUE9JTlRFUlxuXG5cbkltYmEuRXZlbnRzLnJlZ2lzdGVyKFs6bW91c2Vkb3duLDptb3VzZXVwXSlcbkltYmEuRXZlbnRzLmVuYWJsZWQgPSB5ZXNcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBzcmMvaW1iYS9kb20uZXZlbnRzLmltYmFcbiAqKi8iLCJ2YXIgSW1iYVRhZyA9IEltYmEuVEFHUzplbGVtZW50XG5cbmRlZiByZW1vdmVOZXN0ZWQgcm9vdCwgbm9kZSwgY2FyZXRcblx0IyBpZiBub2RlL25vZGVzIGlzYSBTdHJpbmdcblx0IyBcdHdlIG5lZWQgdG8gdXNlIHRoZSBjYXJldCB0byByZW1vdmUgZWxlbWVudHNcblx0IyBcdGZvciBub3cgd2Ugd2lsbCBzaW1wbHkgbm90IHN1cHBvcnQgdGhpc1xuXHRpZiBub2RlIGlzYSBJbWJhVGFnXG5cdFx0cm9vdC5yZW1vdmVDaGlsZChub2RlKVxuXHRlbGlmIG5vZGUgaXNhIEFycmF5XG5cdFx0cmVtb3ZlTmVzdGVkKHJvb3QsbWVtYmVyLGNhcmV0KSBmb3IgbWVtYmVyIGluIG5vZGVcblx0ZWxzZVxuXHRcdCMgd2hhdCBpZiB0aGlzIGlzIG5vdCBudWxsPyE/IT9cblx0XHQjIHRha2UgYSBjaGFuY2UgYW5kIHJlbW92ZSBhIHRleHQtZWxlbWVudG5nXG5cdFx0bGV0IG5leHQgPSBjYXJldCA/IGNhcmV0Om5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblx0XHRpZiBuZXh0IGlzYSBUZXh0IGFuZCBuZXh0OnRleHRDb250ZW50ID09IG5vZGVcblx0XHRcdHJvb3QucmVtb3ZlQ2hpbGQobmV4dClcblx0XHRlbHNlXG5cdFx0XHR0aHJvdyAnY2Fubm90IHJlbW92ZSBzdHJpbmcnXG5cblx0cmV0dXJuIGNhcmV0XG5cbmRlZiBhcHBlbmROZXN0ZWQgcm9vdCwgbm9kZVxuXHRpZiBub2RlIGlzYSBJbWJhVGFnXG5cdFx0cm9vdC5hcHBlbmRDaGlsZChub2RlKVxuXG5cdGVsaWYgbm9kZSBpc2EgQXJyYXlcblx0XHRhcHBlbmROZXN0ZWQocm9vdCxtZW1iZXIpIGZvciBtZW1iZXIgaW4gbm9kZVxuXG5cdGVsaWYgbm9kZSAhPSBudWxsIGFuZCBub2RlICE9PSBmYWxzZVxuXHRcdHJvb3QuYXBwZW5kQ2hpbGQgSW1iYS5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShub2RlKVxuXG5cdHJldHVyblxuXG5cbiMgaW5zZXJ0IG5vZGVzIGJlZm9yZSBhIGNlcnRhaW4gbm9kZVxuIyBkb2VzIG5vdCBuZWVkIHRvIHJldHVybiBhbnkgdGFpbCwgYXMgYmVmb3JlXG4jIHdpbGwgc3RpbGwgYmUgY29ycmVjdCB0aGVyZVxuIyBiZWZvcmUgbXVzdCBiZSBhbiBhY3R1YWwgZG9tbm9kZVxuZGVmIGluc2VydE5lc3RlZEJlZm9yZSByb290LCBub2RlLCBiZWZvcmVcblx0aWYgbm9kZSBpc2EgSW1iYVRhZ1xuXHRcdHJvb3QuaW5zZXJ0QmVmb3JlKG5vZGUsYmVmb3JlKVxuXHRlbGlmIG5vZGUgaXNhIEFycmF5XG5cdFx0aW5zZXJ0TmVzdGVkQmVmb3JlKHJvb3QsbWVtYmVyLGJlZm9yZSkgZm9yIG1lbWJlciBpbiBub2RlXG5cdGVsaWYgbm9kZSAhPSBudWxsIGFuZCBub2RlICE9PSBmYWxzZVxuXHRcdHJvb3QuaW5zZXJ0QmVmb3JlKEltYmEuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobm9kZSksYmVmb3JlKVxuXG5cdHJldHVybiBiZWZvcmVcblxuIyBhZnRlciBtdXN0IGJlIGFuIGFjdHVhbCBkb21ub2RlXG5kZWYgaW5zZXJ0TmVzdGVkQWZ0ZXIgcm9vdCwgbm9kZSwgYWZ0ZXJcblx0dmFyIGJlZm9yZSA9IGFmdGVyID8gYWZ0ZXI6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZFxuXG5cdGlmIGJlZm9yZVxuXHRcdGluc2VydE5lc3RlZEJlZm9yZShyb290LG5vZGUsYmVmb3JlKVxuXHRcdHJldHVybiBiZWZvcmU6cHJldmlvdXNTaWJsaW5nXG5cdGVsc2Vcblx0XHRhcHBlbmROZXN0ZWQocm9vdCxub2RlKVxuXHRcdHJldHVybiByb290LkBkb206bGFzdENoaWxkXG5cbmRlZiByZWNvbmNpbGVDb2xsZWN0aW9uQ2hhbmdlcyByb290LCBuZXcsIG9sZCwgY2FyZXRcblxuXHR2YXIgbmV3TGVuID0gbmV3Omxlbmd0aFxuXHR2YXIgbGFzdE5ldyA9IG5ld1tuZXdMZW4gLSAxXVxuXG5cdCMgVGhpcyByZS1vcmRlciBhbGdvcml0aG0gaXMgYmFzZWQgb24gdGhlIGZvbGxvd2luZyBwcmluY2lwbGU6XG5cdCMgXG5cdCMgV2UgYnVpbGQgYSBcImNoYWluXCIgd2hpY2ggc2hvd3Mgd2hpY2ggaXRlbXMgYXJlIGFscmVhZHkgc29ydGVkLlxuXHQjIElmIHdlJ3JlIGdvaW5nIGZyb20gWzEsIDIsIDNdIC0+IFsyLCAxLCAzXSwgdGhlIHRyZWUgbG9va3MgbGlrZTpcblx0I1xuXHQjIFx0MyAtPiAgMCAoaWR4KVxuXHQjIFx0MiAtPiAtMSAoaWR4KVxuXHQjIFx0MSAtPiAtMSAoaWR4KVxuXHQjXG5cdCMgVGhpcyB0ZWxscyB1cyB0aGF0IHdlIGhhdmUgdHdvIGNoYWlucyBvZiBvcmRlcmVkIGl0ZW1zOlxuXHQjIFxuXHQjIFx0KDEsIDMpIGFuZCAoMilcblx0IyBcblx0IyBUaGUgb3B0aW1hbCByZS1vcmRlcmluZyB0aGVuIGJlY29tZXMgdHdvIGtlZXAgdGhlIGxvbmdlc3QgY2hhaW4gaW50YWN0LFxuXHQjIGFuZCBtb3ZlIGFsbCB0aGUgb3RoZXIgaXRlbXMuXG5cblx0dmFyIG5ld1Bvc2l0aW9uID0gW11cblxuXHQjIFRoZSB0cmVlL2dyYXBoIGl0c2VsZlxuXHR2YXIgcHJldkNoYWluID0gW11cblx0IyBUaGUgbGVuZ3RoIG9mIHRoZSBjaGFpblxuXHR2YXIgbGVuZ3RoQ2hhaW4gPSBbXVxuXG5cdCMgS2VlcCB0cmFjayBvZiB0aGUgbG9uZ2VzdCBjaGFpblxuXHR2YXIgbWF4Q2hhaW5MZW5ndGggPSAwXG5cdHZhciBtYXhDaGFpbkVuZCA9IDBcblxuXHRmb3Igbm9kZSwgaWR4IGluIG9sZFxuXHRcdHZhciBuZXdQb3MgPSBuZXcuaW5kZXhPZihub2RlKVxuXHRcdG5ld1Bvc2l0aW9uLnB1c2gobmV3UG9zKVxuXG5cdFx0aWYgbmV3UG9zID09IC0xXG5cdFx0XHRyb290LnJlbW92ZUNoaWxkKG5vZGUpXG5cdFx0XHRwcmV2Q2hhaW4ucHVzaCgtMSlcblx0XHRcdGxlbmd0aENoYWluLnB1c2goLTEpXG5cdFx0XHRjb250aW51ZVxuXG5cdFx0dmFyIHByZXZJZHggPSBuZXdQb3NpdGlvbjpsZW5ndGggLSAyXG5cblx0XHQjIEJ1aWxkIHRoZSBjaGFpbjpcblx0XHR3aGlsZSBwcmV2SWR4ID49IDBcblx0XHRcdGlmIG5ld1Bvc2l0aW9uW3ByZXZJZHhdID09IC0xXG5cdFx0XHRcdHByZXZJZHgtLVxuXHRcdFx0ZWxpZiBuZXdQb3MgPiBuZXdQb3NpdGlvbltwcmV2SWR4XVxuXHRcdFx0XHQjIFlheSwgd2UncmUgYmlnZ2VyIHRoYW4gdGhlIHByZXZpb3VzIVxuXHRcdFx0XHRicmVha1xuXHRcdFx0ZWxzZVxuXHRcdFx0XHQjIE5vcGUsIGxldCdzIHdhbGsgYmFjayB0aGUgY2hhaW5cblx0XHRcdFx0cHJldklkeCA9IHByZXZDaGFpbltwcmV2SWR4XVxuXG5cdFx0cHJldkNoYWluLnB1c2gocHJldklkeClcblxuXHRcdHZhciBjdXJyTGVuZ3RoID0gKHByZXZJZHggPT0gLTEpID8gMCA6IGxlbmd0aENoYWluW3ByZXZJZHhdKzFcblxuXHRcdGlmIGN1cnJMZW5ndGggPiBtYXhDaGFpbkxlbmd0aFxuXHRcdFx0bWF4Q2hhaW5MZW5ndGggPSBjdXJyTGVuZ3RoXG5cdFx0XHRtYXhDaGFpbkVuZCA9IGlkeFxuXG5cdFx0bGVuZ3RoQ2hhaW4ucHVzaChjdXJyTGVuZ3RoKVxuXG5cdHZhciBzdGlja3lOb2RlcyA9IFtdXG5cblx0IyBOb3cgd2UgY2FuIHdhbGsgdGhlIGxvbmdlc3QgY2hhaW4gYmFja3dhcmRzIGFuZCBtYXJrIHRoZW0gYXMgXCJzdGlja3lcIixcblx0IyB3aGljaCBpbXBsaWVzIHRoYXQgdGhleSBzaG91bGQgbm90IGJlIG1vdmVkXG5cdHZhciBjdXJzb3IgPSBuZXdQb3NpdGlvbjpsZW5ndGggLSAxXG5cdHdoaWxlIGN1cnNvciA+PSAwXG5cdFx0aWYgY3Vyc29yID09IG1heENoYWluRW5kIGFuZCBuZXdQb3NpdGlvbltjdXJzb3JdICE9IC0xXG5cdFx0XHRzdGlja3lOb2Rlc1tuZXdQb3NpdGlvbltjdXJzb3JdXSA9IHRydWVcblx0XHRcdG1heENoYWluRW5kID0gcHJldkNoYWluW21heENoYWluRW5kXVxuXHRcdFxuXHRcdGN1cnNvciAtPSAxXG5cblx0IyBBbmQgbGV0J3MgaXRlcmF0ZSBmb3J3YXJkLCBidXQgb25seSBtb3ZlIG5vbi1zdGlja3kgbm9kZXNcblx0Zm9yIG5vZGUsIGlkeCBpbiBuZXdcblx0XHRpZiAhc3RpY2t5Tm9kZXNbaWR4XVxuXHRcdFx0dmFyIGFmdGVyID0gbmV3W2lkeCAtIDFdXG5cdFx0XHRpbnNlcnROZXN0ZWRBZnRlcihyb290LCBub2RlLCAoYWZ0ZXIgYW5kIGFmdGVyLkBkb20pIG9yIGNhcmV0KVxuXG5cdCMgc2hvdWxkIHRydXN0IHRoYXQgdGhlIGxhc3QgaXRlbSBpbiBuZXcgbGlzdCBpcyB0aGUgY2FyZXRcblx0cmV0dXJuIGxhc3ROZXcgYW5kIGxhc3ROZXcuQGRvbSBvciBjYXJldFxuXG5cbiMgZXhwZWN0cyBhIGZsYXQgbm9uLXNwYXJzZSBhcnJheSBvZiBub2RlcyBpbiBib3RoIG5ldyBhbmQgb2xkLCBhbHdheXNcbmRlZiByZWNvbmNpbGVDb2xsZWN0aW9uIHJvb3QsIG5ldywgb2xkLCBjYXJldFxuXHR2YXIgayA9IG5ldzpsZW5ndGhcblx0dmFyIGkgPSBrXG5cdHZhciBsYXN0ID0gbmV3W2sgLSAxXVxuXG5cblx0aWYgayA9PSBvbGQ6bGVuZ3RoIGFuZCBuZXdbMF0gPT09IG9sZFswXVxuXHRcdCMgcnVubmluZyB0aHJvdWdoIHRvIGNvbXBhcmVcblx0XHR3aGlsZSBpLS1cblx0XHRcdGJyZWFrIGlmIG5ld1tpXSAhPT0gb2xkW2ldXG5cblx0aWYgaSA9PSAtMVxuXHRcdHJldHVybiBsYXN0IGFuZCBsYXN0LkBkb20gb3IgY2FyZXRcblx0ZWxzZVxuXHRcdHJldHVybiByZWNvbmNpbGVDb2xsZWN0aW9uQ2hhbmdlcyhyb290LG5ldyxvbGQsY2FyZXQpXG5cbiMgdGhlIGdlbmVyYWwgcmVjb25jaWxlciB0aGF0IHJlc3BlY3RzIGNvbmRpdGlvbnMgZXRjXG4jIGNhcmV0IGlzIHRoZSBjdXJyZW50IG5vZGUgd2Ugd2FudCB0byBpbnNlcnQgdGhpbmdzIGFmdGVyXG5kZWYgcmVjb25jaWxlTmVzdGVkIHJvb3QsIG5ldywgb2xkLCBjYXJldFxuXG5cdCMgaWYgbmV3ID09IG51bGwgb3IgbmV3ID09PSBmYWxzZSBvciBuZXcgPT09IHRydWVcblx0IyBcdGlmIG5ldyA9PT0gb2xkXG5cdCMgXHRcdHJldHVybiBjYXJldFxuXHQjIFx0aWYgb2xkICYmIG5ldyAhPSBvbGRcblx0IyBcdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KSBpZiBvbGRcblx0IyBcblx0IyBcdHJldHVybiBjYXJldFxuXG5cdCMgdmFyIHNraXBuZXcgPSBuZXcgPT0gbnVsbCBvciBuZXcgPT09IGZhbHNlIG9yIG5ldyA9PT0gdHJ1ZVxuXHR2YXIgbmV3SXNOdWxsID0gbmV3ID09IG51bGwgb3IgbmV3ID09PSBmYWxzZVxuXHR2YXIgb2xkSXNOdWxsID0gb2xkID09IG51bGwgb3Igb2xkID09PSBmYWxzZVxuXG5cblx0aWYgbmV3ID09PSBvbGRcblx0XHQjIHJlbWVtYmVyIHRoYXQgdGhlIGNhcmV0IG11c3QgYmUgYW4gYWN0dWFsIGRvbSBlbGVtZW50XG5cdFx0IyB3ZSBzaG91bGQgaW5zdGVhZCBtb3ZlIHRoZSBhY3R1YWwgY2FyZXQ/IC0gdHJ1c3Rcblx0XHRpZiBuZXdJc051bGxcblx0XHRcdHJldHVybiBjYXJldFxuXHRcdGVsaWYgbmV3IGFuZCBuZXcuQGRvbVxuXHRcdFx0cmV0dXJuIG5ldy5AZG9tXG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuIGNhcmV0ID8gY2FyZXQ6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZFxuXG5cdGVsaWYgbmV3IGlzYSBBcnJheVxuXHRcdGlmIG9sZCBpc2EgQXJyYXlcblx0XHRcdGlmIG5ldzpzdGF0aWMgb3Igb2xkOnN0YXRpY1xuXHRcdFx0XHQjIGlmIHRoZSBzdGF0aWMgaXMgbm90IG5lc3RlZCAtIHdlIGNvdWxkIGdldCBhIGhpbnQgZnJvbSBjb21waWxlclxuXHRcdFx0XHQjIGFuZCBqdXN0IHNraXAgaXRcblx0XHRcdFx0aWYgbmV3OnN0YXRpYyA9PSBvbGQ6c3RhdGljXG5cdFx0XHRcdFx0Zm9yIGl0ZW0saSBpbiBuZXdcblx0XHRcdFx0XHRcdCMgdGhpcyBpcyB3aGVyZSB3ZSBjb3VsZCBkbyB0aGUgdHJpcGxlIGVxdWFsIGRpcmVjdGx5XG5cdFx0XHRcdFx0XHRjYXJldCA9IHJlY29uY2lsZU5lc3RlZChyb290LGl0ZW0sb2xkW2ldLGNhcmV0KVxuXHRcdFx0XHRcdHJldHVybiBjYXJldFxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KVxuXHRcdFx0XHRcdFxuXHRcdFx0XHQjIGlmIHRoZXkgYXJlIG5vdCB0aGUgc2FtZSB3ZSBjb250aW51ZSB0aHJvdWdoIHRvIHRoZSBkZWZhdWx0XG5cdFx0XHRlbHNlXG5cdFx0XHRcdHJldHVybiByZWNvbmNpbGVDb2xsZWN0aW9uKHJvb3QsbmV3LG9sZCxjYXJldClcblxuXHRcdGVsaWYgb2xkIGlzYSBJbWJhVGFnXG5cdFx0XHRyb290LnJlbW92ZUNoaWxkKG9sZClcblx0XHRlbGlmICFvbGRJc051bGxcblx0XHRcdCMgb2xkIHdhcyBhIHN0cmluZy1saWtlIG9iamVjdD9cblx0XHRcdHJvb3QucmVtb3ZlQ2hpbGQoY2FyZXQgPyBjYXJldDpuZXh0U2libGluZyA6IHJvb3QuQGRvbTpmaXJzdENoaWxkKVx0XHRcdFxuXG5cdFx0cmV0dXJuIGluc2VydE5lc3RlZEFmdGVyKHJvb3QsbmV3LGNhcmV0KVxuXHRcdCMgcmVtb3ZlIG9sZFxuXG5cdGVsaWYgbmV3IGlzYSBJbWJhVGFnXG5cdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KSB1bmxlc3Mgb2xkSXNOdWxsXG5cdFx0aW5zZXJ0TmVzdGVkQWZ0ZXIocm9vdCxuZXcsY2FyZXQpXG5cdFx0cmV0dXJuIG5ld1xuXG5cdGVsaWYgbmV3SXNOdWxsXG5cdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KSB1bmxlc3Mgb2xkSXNOdWxsXG5cdFx0cmV0dXJuIGNhcmV0XG5cdGVsc2Vcblx0XHQjIGlmIG9sZCBkaWQgbm90IGV4aXN0IHdlIG5lZWQgdG8gYWRkIGEgbmV3IGRpcmVjdGx5XG5cdFx0bGV0IG5leHROb2RlXG5cdFx0IyBpZiBvbGQgd2FzIGFycmF5IG9yIGltYmF0YWcgd2UgbmVlZCB0byByZW1vdmUgaXQgYW5kIHRoZW4gYWRkXG5cdFx0aWYgb2xkIGlzYSBBcnJheVxuXHRcdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KVxuXHRcdGVsaWYgb2xkIGlzYSBJbWJhVGFnXG5cdFx0XHRyb290LnJlbW92ZUNoaWxkKG9sZClcblx0XHRlbGlmICFvbGRJc051bGxcblx0XHRcdCMgLi4uXG5cdFx0XHRuZXh0Tm9kZSA9IGNhcmV0ID8gY2FyZXQ6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZFxuXHRcdFx0aWYgbmV4dE5vZGUgaXNhIFRleHQgYW5kIG5leHROb2RlOnRleHRDb250ZW50ICE9IG5ld1xuXHRcdFx0XHRuZXh0Tm9kZTp0ZXh0Q29udGVudCA9IG5ld1xuXHRcdFx0XHRyZXR1cm4gbmV4dE5vZGVcblxuXHRcdCMgbm93IGFkZCB0aGUgdGV4dG5vZGVcblx0XHRyZXR1cm4gaW5zZXJ0TmVzdGVkQWZ0ZXIocm9vdCxuZXcsY2FyZXQpXG5cblxuZXh0ZW5kIHRhZyBodG1sZWxlbWVudFxuXHRcblx0ZGVmIHNldENoaWxkcmVuIG5ldywgdHlwXG5cdFx0dmFyIG9sZCA9IEBjaGlsZHJlblxuXHRcdCMgdmFyIGlzQXJyYXkgPSBub2RlcyBpc2EgQXJyYXlcblx0XHRpZiBuZXcgPT09IG9sZFxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdGlmICFvbGRcblx0XHRcdGVtcHR5XG5cdFx0XHRhcHBlbmROZXN0ZWQoc2VsZixuZXcpXG5cblx0XHRlbGlmIHR5cCA9PSAyXG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0ZWxpZiB0eXAgPT0gMVxuXHRcdFx0IyBoZXJlIHdlIF9rbm93IF90aGF0IGl0IGlzIGFuIGFycmF5IHdpdGggdGhlIHNhbWUgc2hhcGVcblx0XHRcdCMgZXZlcnkgdGltZVxuXHRcdFx0bGV0IGNhcmV0ID0gbnVsbFxuXHRcdFx0Zm9yIGl0ZW0saSBpbiBuZXdcblx0XHRcdFx0IyBwcmV2ID0gb2xkW2ldXG5cdFx0XHRcdGNhcmV0ID0gcmVjb25jaWxlTmVzdGVkKHNlbGYsaXRlbSxvbGRbaV0sY2FyZXQpXG5cblx0XHRlbGlmIHR5cCA9PSAzXG5cdFx0XHQjIHRoaXMgaXMgcG9zc2libHkgZnVsbHkgZHluYW1pYy4gSXQgb2Z0ZW4gaXNcblx0XHRcdCMgYnV0IHRoZSBvbGQgb3IgbmV3IGNvdWxkIGJlIHN0YXRpYyB3aGlsZSB0aGUgb3RoZXIgaXMgbm90XG5cdFx0XHQjIHRoaXMgaXMgbm90IGhhbmRsZWQgbm93XG5cdFx0XHQjIHdoYXQgaWYgaXQgd2FzIHByZXZpb3VzbHkgYSBzdGF0aWMgYXJyYXk/IGVkZ2VjYXNlIC0gYnV0IG11c3Qgd29ya1xuXHRcdFx0aWYgbmV3IGlzYSBJbWJhVGFnXG5cdFx0XHRcdGVtcHR5XG5cdFx0XHRcdGFwcGVuZENoaWxkKG5ldylcblxuXHRcdFx0IyBjaGVjayBpZiBvbGQgYW5kIG5ldyBpc2EgYXJyYXlcblx0XHRcdGVsaWYgbmV3IGlzYSBBcnJheVxuXHRcdFx0XHRpZiBvbGQgaXNhIEFycmF5XG5cdFx0XHRcdFx0IyBpcyB0aGlzIG5vdCB0aGUgc2FtZSBhcyBzZXR0aW5nIHN0YXRpY0NoaWxkcmVuIG5vdyBidXQgd2l0aCB0aGVcblx0XHRcdFx0XHRyZWNvbmNpbGVDb2xsZWN0aW9uKHNlbGYsbmV3LG9sZCxudWxsKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0ZW1wdHlcblx0XHRcdFx0XHRhcHBlbmROZXN0ZWQoc2VsZixuZXcpXG5cdFx0XHRcdFxuXHRcdFx0ZWxzZVxuXHRcdFx0XHR0ZXh0ID0gbmV3XG5cdFx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRlbGlmIG5ldyBpc2EgQXJyYXkgYW5kIG9sZCBpc2EgQXJyYXlcblx0XHRcdHJlY29uY2lsZUNvbGxlY3Rpb24oc2VsZixuZXcsb2xkLG51bGwpXG5cdFx0ZWxzZVxuXHRcdFx0ZW1wdHlcblx0XHRcdGFwcGVuZE5lc3RlZChzZWxmLG5ldylcblxuXHRcdEBjaGlsZHJlbiA9IG5ld1xuXHRcdHJldHVybiBzZWxmXG5cblxuXHQjIG9ubHkgZXZlciBjYWxsZWQgd2l0aCBhcnJheSBhcyBhcmd1bWVudFxuXHRkZWYgc2V0U3RhdGljQ2hpbGRyZW4gbmV3XG5cdFx0dmFyIG9sZCA9IEBjaGlsZHJlblxuXG5cdFx0bGV0IGNhcmV0ID0gbnVsbFxuXHRcdGZvciBpdGVtLGkgaW4gbmV3XG5cdFx0XHQjIHByZXYgPSBvbGRbaV1cblx0XHRcdGNhcmV0ID0gcmVjb25jaWxlTmVzdGVkKHNlbGYsaXRlbSxvbGRbaV0sY2FyZXQpXG5cblx0XHRAY2hpbGRyZW4gPSBuZXdcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBjb250ZW50XG5cdFx0QGNvbnRlbnQgb3IgY2hpbGRyZW4udG9BcnJheVxuXG5cdGRlZiB0ZXh0PSB0ZXh0XG5cdFx0aWYgdGV4dCAhPSBAY2hpbGRyZW5cblx0XHRcdEBjaGlsZHJlbiA9IHRleHRcblx0XHRcdGRvbTp0ZXh0Q29udGVudCA9IHRleHQgPT0gbnVsbCBvciB0ZXh0ID09PSBmYWxzZSA/ICcnIDogdGV4dFxuXHRcdHNlbGZcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBzcmMvaW1iYS9kb20uc3RhdGljLmltYmFcbiAqKi8iLCJcbiMjI1xuVGhlIHNwZWNpYWwgc3ludGF4IGZvciBzZWxlY3RvcnMgaW4gSW1iYSBjcmVhdGVzIEltYmEuU2VsZWN0b3Jcbmluc3RhbmNlcy5cbiMjI1xuY2xhc3MgSW1iYS5TZWxlY3RvclxuXHRcblx0ZGVmIHNlbGYub25lIHNlbCwgc2NvcGVcblx0XHR2YXIgZWwgPSAoc2NvcGUgfHwgSW1iYS5kb2N1bWVudCkucXVlcnlTZWxlY3RvcihzZWwpXG5cdFx0ZWwgJiYgdGFnKGVsKSB8fCBudWxsXG5cblx0ZGVmIHNlbGYuYWxsIHNlbCwgc2NvcGVcblx0XHRJbWJhLlNlbGVjdG9yLm5ldyhzZWwsc2NvcGUpXG5cblx0cHJvcCBxdWVyeVxuXG5cdGRlZiBpbml0aWFsaXplIHNlbCwgc2NvcGUsIG5vZGVzXG5cblx0XHRAcXVlcnkgPSBzZWwgaXNhIEltYmEuU2VsZWN0b3IgPyBzZWwucXVlcnkgOiBzZWxcblx0XHRAY29udGV4dCA9IHNjb3BlXG5cblx0XHRpZiBub2Rlc1xuXHRcdFx0QG5vZGVzID0gKHRhZyhub2RlKSBmb3Igbm9kZSBpbiBub2RlcylcblxuXHRcdEBsYXp5ID0gIW5vZGVzXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgcmVsb2FkXG5cdFx0QG5vZGVzID0gbnVsbFxuXHRcdHNlbGZcblxuXHRkZWYgc2NvcGVcblx0XHRyZXR1cm4gQHNjb3BlIGlmIEBzY29wZVxuXHRcdHJldHVybiBJbWJhLmRvY3VtZW50IHVubGVzcyB2YXIgY3R4ID0gQGNvbnRleHRcblx0XHRAc2NvcGUgPSBjdHg6dG9TY29wZSA/IGN0eC50b1Njb3BlIDogY3R4XG5cblx0IyMjXG5cdEByZXR1cm5zIHtJbWJhLlRhZ30gZmlyc3Qgbm9kZSBtYXRjaGluZyB0aGlzIHNlbGVjdG9yXG5cdCMjI1xuXHRkZWYgZmlyc3Rcblx0XHRpZiBAbGF6eSB0aGVuIHRhZyhAZmlyc3QgfHw9IHNjb3BlLnF1ZXJ5U2VsZWN0b3IocXVlcnkpKVxuXHRcdGVsc2Ugbm9kZXNbMF1cblxuXHQjIyNcblx0QHJldHVybnMge0ltYmEuVGFnfSBsYXN0IG5vZGUgbWF0Y2hpbmcgdGhpcyBzZWxlY3RvclxuXHQjIyNcblx0ZGVmIGxhc3Rcblx0XHRub2Rlc1tAbm9kZXM6bGVuZ3RoIC0gMV1cblxuXHQjIyNcblx0QHJldHVybnMgW0ltYmEuVGFnXSBhbGwgbm9kZXMgbWF0Y2hpbmcgdGhpcyBzZWxlY3RvclxuXHQjIyNcblx0ZGVmIG5vZGVzXG5cdFx0cmV0dXJuIEBub2RlcyBpZiBAbm9kZXNcblx0XHR2YXIgaXRlbXMgPSBzY29wZS5xdWVyeVNlbGVjdG9yQWxsKHF1ZXJ5KVxuXHRcdEBub2RlcyA9ICh0YWcobm9kZSkgZm9yIG5vZGUgaW4gaXRlbXMpXG5cdFx0QGxhenkgPSBub1xuXHRcdEBub2Rlc1xuXHRcblx0IyMjXG5cdFRoZSBudW1iZXIgb2Ygbm9kZXMgbWF0Y2hpbmcgdGhpcyBzZWxlY3RvclxuXHQjIyNcblx0ZGVmIGNvdW50IGRvIG5vZGVzOmxlbmd0aFxuXG5cdGRlZiBsZW4gZG8gbm9kZXM6bGVuZ3RoXG5cblx0IyMjXG5cdEB0b2RvIEFkZCBzdXBwb3J0IGZvciBibG9jayBvciBzZWxlY3Rvcj9cblx0IyMjXG5cdGRlZiBzb21lXG5cdFx0Y291bnQgPj0gMVxuXHRcblx0IyMjXG5cdEdldCBub2RlIGF0IGluZGV4XG5cdCMjI1xuXHRkZWYgYXQgaWR4XG5cdFx0bm9kZXNbaWR4XVxuXG5cdCMjI1xuXHRMb29wIHRocm91Z2ggbm9kZXNcblx0IyMjXG5cdGRlZiBmb3JFYWNoIGJsb2NrXG5cdFx0bm9kZXMuZm9yRWFjaChibG9jaylcblx0XHRzZWxmXG5cblx0IyMjXG5cdE1hcCBub2Rlc1xuXHQjIyNcblx0ZGVmIG1hcCBibG9ja1xuXHRcdG5vZGVzLm1hcChibG9jaylcblxuXHQjIyNcblx0UmV0dXJucyBhIHBsYWluIGFycmF5IGNvbnRhaW5pbmcgbm9kZXMuIEltcGxpY2l0bHkgY2FsbGVkXG5cdHdoZW4gaXRlcmF0aW5nIG92ZXIgYSBzZWxlY3RvciBpbiBJbWJhIGAobm9kZSBmb3Igbm9kZSBpbiAkKHNlbGVjdG9yKSlgXG5cdCMjI1xuXHRkZWYgdG9BcnJheVxuXHRcdG5vZGVzXG5cdFxuXHQjIEdldCB0aGUgZmlyc3QgZWxlbWVudCB0aGF0IG1hdGNoZXMgdGhlIHNlbGVjdG9yLCBcblx0IyBiZWdpbm5pbmcgYXQgdGhlIGN1cnJlbnQgZWxlbWVudCBhbmQgcHJvZ3Jlc3NpbmcgdXAgdGhyb3VnaCB0aGUgRE9NIHRyZWVcblx0ZGVmIGNsb3Nlc3Qgc2VsXG5cdFx0IyBzZWVtcyBzdHJhbmdlIHRoYXQgd2UgYWx0ZXIgdGhpcyBzZWxlY3Rvcj9cblx0XHRAbm9kZXMgPSBtYXAgZG8gfG5vZGV8IG5vZGUuY2xvc2VzdChzZWwpXG5cdFx0c2VsZlxuXG5cdCMgR2V0IHRoZSBzaWJsaW5ncyBvZiBlYWNoIGVsZW1lbnQgaW4gdGhlIHNldCBvZiBtYXRjaGVkIGVsZW1lbnRzLCBcblx0IyBvcHRpb25hbGx5IGZpbHRlcmVkIGJ5IGEgc2VsZWN0b3IuXG5cdCMgVE9ETyByZW1vdmUgZHVwbGljYXRlcz9cblx0ZGVmIHNpYmxpbmdzIHNlbFxuXHRcdEBub2RlcyA9IG1hcCBkbyB8bm9kZXwgbm9kZS5zaWJsaW5ncyhzZWwpXG5cdFx0c2VsZlxuXG5cdCMgR2V0IHRoZSBkZXNjZW5kYW50cyBvZiBlYWNoIGVsZW1lbnQgaW4gdGhlIGN1cnJlbnQgc2V0IG9mIG1hdGNoZWQgXG5cdCMgZWxlbWVudHMsIGZpbHRlcmVkIGJ5IGEgc2VsZWN0b3IuXG5cdGRlZiBmaW5kIHNlbFxuXHRcdEBub2RlcyA9IF9fcXVlcnlfXyhzZWwucXVlcnksIG5vZGVzKVxuXHRcdHNlbGZcblxuXHRkZWYgcmVqZWN0IGJsa1xuXHRcdGZpbHRlcihibGssbm8pXG5cblx0IyMjXG5cdEZpbHRlciB0aGUgbm9kZXMgaW4gc2VsZWN0b3IgYnkgYSBmdW5jdGlvbiBvciBvdGhlciBzZWxlY3RvclxuXHQjIyNcblx0ZGVmIGZpbHRlciBibGssIGJvb2wgPSB5ZXNcblx0XHR2YXIgZm4gPSBibGsgaXNhIEZ1bmN0aW9uIGFuZCBibGsgb3IgKHxufCBuLm1hdGNoZXMoYmxrKSApXG5cdFx0dmFyIGFyeSA9IG5vZGVzLmZpbHRlcih8bnwgZm4obikgPT0gYm9vbClcblx0XHQjIGlmIHdlIHdhbnQgdG8gcmV0dXJuIGEgbmV3IHNlbGVjdG9yIGZvciB0aGlzLCB3ZSBzaG91bGQgZG8gdGhhdCBmb3Jcblx0XHQjIG90aGVycyBhcyB3ZWxsXG5cdFx0SW1iYS5TZWxlY3Rvci5uZXcoXCJcIiwgQHNjb3BlLCBhcnkpXG5cblx0ZGVmIF9fcXVlcnlfXyBxdWVyeSwgY29udGV4dHNcblx0XHR2YXIgbm9kZXMgPSBbXVxuXHRcdHZhciBpID0gMFxuXHRcdHZhciBsID0gY29udGV4dHM6bGVuZ3RoXG5cblx0XHR3aGlsZSBpIDwgbFxuXHRcdFx0bm9kZXMucHVzaCgqY29udGV4dHNbaSsrXS5xdWVyeVNlbGVjdG9yQWxsKHF1ZXJ5KSlcblx0XHRyZXR1cm4gbm9kZXNcblxuXHRkZWYgX19tYXRjaGVzX19cblx0XHRyZXR1cm4geWVzXG5cblx0IyMjXG5cdEFkZCBzcGVjaWZpZWQgZmxhZyB0byBhbGwgbm9kZXMgaW4gc2VsZWN0b3Jcblx0IyMjXG5cdGRlZiBmbGFnIGZsYWdcblx0XHRmb3JFYWNoIGRvIHxufCBuLmZsYWcoZmxhZylcblxuXHQjIyNcblx0UmVtb3ZlIHNwZWNpZmllZCBmbGFnIGZyb20gYWxsIG5vZGVzIGluIHNlbGVjdG9yXG5cdCMjI1xuXHRkZWYgdW5mbGFnIGZsYWdcblx0XHRmb3JFYWNoIGRvIHxufCBuLnVuZmxhZyhmbGFnKVxuXG5cbiMgZGVmIEltYmEucXVlcnlTZWxlY3RvckFsbFxucSQgPSBkbyB8c2VsLHNjb3BlfCBJbWJhLlNlbGVjdG9yLm5ldyhzZWwsIHNjb3BlKVxuXG4jIGRlZiBJbWJhLlNlbGVjdG9yLm9uZVxucSQkID0gZG8gfHNlbCxzY29wZXwgXG5cdHZhciBlbCA9IChzY29wZSB8fCBJbWJhLmRvY3VtZW50KS5xdWVyeVNlbGVjdG9yKHNlbClcblx0ZWwgJiYgdGFnKGVsKSB8fCBuaWxcblxuXG4jIGV4dGVuZGluZyB0YWdzIHdpdGggcXVlcnktbWV0aG9kc1xuIyBtdXN0IGJlIGEgYmV0dGVyIHdheSB0byByZW9wZW4gY2xhc3Nlc1xuZXh0ZW5kIHRhZyBlbGVtZW50XG5cdGRlZiBxdWVyeVNlbGVjdG9yQWxsIHEgZG8gQGRvbS5xdWVyeVNlbGVjdG9yQWxsIHFcblx0ZGVmIHF1ZXJ5U2VsZWN0b3IgcSBkbyBAZG9tLnF1ZXJ5U2VsZWN0b3IgcVxuXG5cdCMgc2hvdWxkIGJlIG1vdmVkIHRvIEltYmEuVGFnIGluc3RlYWQ/XG5cdCMgb3Igd2Ugc2hvdWxkIGltcGxlbWVudCBhbGwgb2YgdGhlbSBoZXJlXG5cdGRlZiBmaW5kIHNlbCBkbyBJbWJhLlNlbGVjdG9yLm5ldyhzZWwsc2VsZilcblxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogc3JjL2ltYmEvc2VsZWN0b3IuaW1iYVxuICoqLyJdLCJzb3VyY2VSb290IjoiIn0=