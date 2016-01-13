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
			
			var key = 'CLIENT';
			Imba[key] = true;
			
			__webpack_require__(2);
			__webpack_require__(3);
			__webpack_require__(4);
			__webpack_require__(5);
			__webpack_require__(6);
			__webpack_require__(7);
			__webpack_require__(8);
			__webpack_require__(9);
			__webpack_require__(10);
			__webpack_require__(11);
			__webpack_require__(12);
			
			if (true) {
				return console.log("Imba is in debug mode");
			};
		} else {
			return console.warn("Imba is already loaded");
		};

	})()

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {(function(){
		// externs;
		
		if (typeof window !== 'undefined') {
			global = window;
		};
		
		/*
		Imba is the namespace for all runtime related utilities
		@namespace
		*/
		
		Imba = {
			VERSION: '0.14.2',
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
			
			return true;
		};

	})()

/***/ },
/* 7 */
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
/* 8 */
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
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	(function(){
		
		if (true) {
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
/* 10 */
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
			if (this.event() instanceof TextEvent) {
				return this.event().data;
			};
			
			if (this.event() instanceof KeyboardEvent) {
				var ki = this.event().keyIdentifier;
				var sym = Imba.KEYMAP[this.event().keyCode];
				
				// p 'keysym!',ki,sym
				
				if (!(sym) && ki.substr(0,2) == "U+") {
					sym = String.fromCharCode(parseInt(ki.substr(2),16));
				};
				return sym;
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
/* 11 */
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
/* 12 */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNTVlN2VjOTM5YjI4NjAyMTAwYmUiLCJ3ZWJwYWNrOi8vL3NyYy9pbWJhL2Jyb3dzZXIuaW1iYSIsIndlYnBhY2s6Ly8vc3JjL2ltYmEvaW1iYS5pbWJhIiwid2VicGFjazovLy9zcmMvaW1iYS9jb3JlLmV2ZW50cy5pbWJhIiwid2VicGFjazovLy9zcmMvaW1iYS9zY2hlZHVsZXIuaW1iYSIsIndlYnBhY2s6Ly8vc3JjL2ltYmEvdGFnLmltYmEiLCJ3ZWJwYWNrOi8vL3NyYy9pbWJhL2RvbS5pbWJhIiwid2VicGFjazovLy9zcmMvaW1iYS9kb20uY2xpZW50LmltYmEiLCJ3ZWJwYWNrOi8vL3NyYy9pbWJhL2RvbS5odG1sLmltYmEiLCJ3ZWJwYWNrOi8vL3NyYy9pbWJhL2RvbS5zdmcuaW1iYSIsIndlYnBhY2s6Ly8vc3JjL2ltYmEvZG9tLmxlZ2FjeS5pbWJhIiwid2VicGFjazovLy9zcmMvaW1iYS9kb20uZXZlbnRzLmltYmEiLCJ3ZWJwYWNrOi8vL3NyYy9pbWJhL2RvbS5zdGF0aWMuaW1iYSIsIndlYnBhY2s6Ly8vc3JjL2ltYmEvc2VsZWN0b3IuaW1iYSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7O0VDckNBLFdBQVUsS0FBSztHQUNkOztPQUVJLElBQUk7R0FDUixLQUFLLEtBQUs7O0dBRVY7R0FDQTtHQUNBO0dBQ0E7R0FDQTtHQUNBO0dBQ0E7R0FDQTtHQUNBO0dBQ0E7R0FDQTs7R0FFQSxJQUFHLElBQUs7V0FDUCxRQUFROzs7VUFFVCxRQUFROzs7Ozs7Ozs7Ozs7RUNwQlQsV0FBVSxPQUFPO0dB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dkIsbUNBQWlCLEtBQUssU0FBYSxJQUFLOzs7TUFHdkM7T0FDQyxHQUFHLEdBQUcsTUFBTSxHQUFHLEtBQUssWUFBVSxjQUFjO1VBQ2hELEdBQUcsWUFBTyxJQUFJOzs7Ozs7U0FLUjtHQUNOO2dCQUEwQixLQUFLLGlCQUFpQjs7R0FDaEQ7Z0JBQXVCLEtBQUssY0FBYzs7Ozs7R0FJMUM7ZUFBZ0IsS0FBSyxTQUFhIiwiZmlsZSI6Ii4vZGlzdC9pbWJhLmRldi5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay9ib290c3RyYXAgNTVlN2VjOTM5YjI4NjAyMTAwYmVcbiAqKi8iLCJcbmlmIHR5cGVvZiBJbWJhID09PSAndW5kZWZpbmVkJ1xuXHRyZXF1aXJlICcuL2ltYmEnXG5cblx0dmFyIGtleSA9ICdDTElFTlQnXG5cdEltYmFba2V5XSA9IHllc1xuXG5cdHJlcXVpcmUgJy4vY29yZS5ldmVudHMnXG5cdHJlcXVpcmUgJy4vc2NoZWR1bGVyJ1xuXHRyZXF1aXJlICcuL3RhZydcblx0cmVxdWlyZSAnLi9kb20nXG5cdHJlcXVpcmUgJy4vZG9tLmNsaWVudCdcblx0cmVxdWlyZSAnLi9kb20uaHRtbCdcblx0cmVxdWlyZSAnLi9kb20uc3ZnJ1xuXHRyZXF1aXJlICcuL2RvbS5sZWdhY3knXG5cdHJlcXVpcmUgJy4vZG9tLmV2ZW50cydcblx0cmVxdWlyZSAnLi9kb20uc3RhdGljJ1xuXHRyZXF1aXJlICcuL3NlbGVjdG9yJ1xuXG5cdGlmIEltYmEuREVCVUdcblx0XHRjb25zb2xlLmxvZyBcIkltYmEgaXMgaW4gZGVidWcgbW9kZVwiXG5lbHNlXG5cdGNvbnNvbGUud2FybiBcIkltYmEgaXMgYWxyZWFkeSBsb2FkZWRcIlxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogc3JjL2ltYmEvYnJvd3Nlci5pbWJhXG4gKiovIiwiZXh0ZXJuIHdpbmRvdywgZ2xvYmFsXG5cbmlmIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG5cdGdsb2JhbCA9IHdpbmRvd1xuXG4jIyNcbkltYmEgaXMgdGhlIG5hbWVzcGFjZSBmb3IgYWxsIHJ1bnRpbWUgcmVsYXRlZCB1dGlsaXRpZXNcbkBuYW1lc3BhY2VcbiMjI1xuSW1iYSA9IHtcblx0VkVSU0lPTjogJzAuMTQuMidcblx0REVCVUc6IG5vXG59XG5cbnZhciByZWcgPSAvLS4vZ1xuXG4jIyNcblRydWUgaWYgcnVubmluZyBpbiBjbGllbnQgZW52aXJvbm1lbnQuXG5AcmV0dXJuIHtib29sfVxuIyMjXG5kZWYgSW1iYS5pc0NsaWVudFxuXHRJbWJhLkNMSUVOVCA9PSB5ZXNcblxuIyMjXG5UcnVlIGlmIHJ1bm5pbmcgaW4gc2VydmVyIGVudmlyb25tZW50LlxuQHJldHVybiB7Ym9vbH1cbiMjI1xuZGVmIEltYmEuaXNTZXJ2ZXJcblx0SW1iYS5TRVJWRVIgPT0geWVzXG5cbmRlZiBJbWJhLnN1YmNsYXNzIG9iaiwgc3VwXG5cdGZvciBrLHYgb2Ygc3VwXG5cdFx0b2JqW2tdID0gdiBpZiBzdXAuaGFzT3duUHJvcGVydHkoaylcblxuXHRvYmo6cHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXA6cHJvdG90eXBlKVxuXHRvYmo6X19zdXBlcl9fID0gb2JqOnByb3RvdHlwZTpfX3N1cGVyX18gPSBzdXA6cHJvdG90eXBlXG5cdG9iajpwcm90b3R5cGU6aW5pdGlhbGl6ZSA9IG9iajpwcm90b3R5cGU6Y29uc3RydWN0b3IgPSBvYmpcblx0cmV0dXJuIG9ialxuXG4jIyNcbkxpZ2h0d2VpZ2h0IG1ldGhvZCBmb3IgbWFraW5nIGFuIG9iamVjdCBpdGVyYWJsZSBpbiBpbWJhcyBmb3IvaW4gbG9vcHMuXG5JZiB0aGUgY29tcGlsZXIgY2Fubm90IHNheSBmb3IgY2VydGFpbiB0aGF0IGEgdGFyZ2V0IGluIGEgZm9yIGxvb3AgaXMgYW5cbmFycmF5LCBpdCB3aWxsIGNhY2hlIHRoZSBpdGVyYWJsZSB2ZXJzaW9uIGJlZm9yZSBsb29waW5nLlxuXG5gYGBpbWJhXG4jIHRoaXMgaXMgdGhlIHdob2xlIG1ldGhvZFxuZGVmIEltYmEuaXRlcmFibGUgb1xuXHRyZXR1cm4gbyA/IChvOnRvQXJyYXkgPyBvLnRvQXJyYXkgOiBvKSA6IFtdXG5cbmNsYXNzIEN1c3RvbUl0ZXJhYmxlXG5cdGRlZiB0b0FycmF5XG5cdFx0WzEsMiwzXVxuXG4jIHdpbGwgcmV0dXJuIFsyLDQsNl1cbmZvciB4IGluIEN1c3RvbUl0ZXJhYmxlLm5ld1xuXHR4ICogMlxuXG5gYGBcbiMjI1xuZGVmIEltYmEuaXRlcmFibGUgb1xuXHRyZXR1cm4gbyA/IChvOnRvQXJyYXkgPyBvLnRvQXJyYXkgOiBvKSA6IFtdXG5cbiMjI1xuQ29lcmNlcyBhIHZhbHVlIGludG8gYSBwcm9taXNlLiBJZiB2YWx1ZSBpcyBhcnJheSBpdCB3aWxsXG5jYWxsIGBQcm9taXNlLmFsbCh2YWx1ZSlgLCBvciBpZiBpdCBpcyBub3QgYSBwcm9taXNlIGl0IHdpbGxcbndyYXAgdGhlIHZhbHVlIGluIGBQcm9taXNlLnJlc29sdmUodmFsdWUpYC4gVXNlZCBmb3IgZXhwZXJpbWVudGFsXG5hd2FpdCBzeW50YXguXG5AcmV0dXJuIHtQcm9taXNlfVxuIyMjXG5kZWYgSW1iYS5hd2FpdCB2YWx1ZVxuXHRpZiB2YWx1ZSBpc2EgQXJyYXlcblx0XHRQcm9taXNlLmFsbCh2YWx1ZSlcblx0ZWxpZiB2YWx1ZSBhbmQgdmFsdWU6dGhlblxuXHRcdHZhbHVlXG5cdGVsc2Vcblx0XHRQcm9taXNlLnJlc29sdmUodmFsdWUpXG5cbmRlZiBJbWJhLnRvQ2FtZWxDYXNlIHN0clxuXHRzdHIucmVwbGFjZShyZWcpIGRvIHxtfCBtLmNoYXJBdCgxKS50b1VwcGVyQ2FzZVxuXG5kZWYgSW1iYS50b0NhbWVsQ2FzZSBzdHJcblx0c3RyLnJlcGxhY2UocmVnKSBkbyB8bXwgbS5jaGFyQXQoMSkudG9VcHBlckNhc2VcblxuZGVmIEltYmEuaW5kZXhPZiBhLGJcblx0cmV0dXJuIChiICYmIGI6aW5kZXhPZikgPyBiLmluZGV4T2YoYSkgOiBbXTppbmRleE9mLmNhbGwoYSxiKVxuXG5kZWYgSW1iYS5wcm9wIHNjb3BlLCBuYW1lLCBvcHRzXG5cdGlmIHNjb3BlOmRlZmluZVByb3BlcnR5XG5cdFx0cmV0dXJuIHNjb3BlLmRlZmluZVByb3BlcnR5KG5hbWUsb3B0cylcblx0cmV0dXJuXG5cbmRlZiBJbWJhLmF0dHIgc2NvcGUsIG5hbWUsIG9wdHNcblx0aWYgc2NvcGU6ZGVmaW5lQXR0cmlidXRlXG5cdFx0cmV0dXJuIHNjb3BlLmRlZmluZUF0dHJpYnV0ZShuYW1lLG9wdHMpXG5cblx0bGV0IGdldE5hbWUgPSBJbWJhLnRvQ2FtZWxDYXNlKG5hbWUpXG5cdGxldCBzZXROYW1lID0gSW1iYS50b0NhbWVsQ2FzZSgnc2V0LScgKyBuYW1lKVxuXG5cdHNjb3BlOnByb3RvdHlwZVtnZXROYW1lXSA9IGRvXG5cdFx0cmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKG5hbWUpXG5cblx0c2NvcGU6cHJvdG90eXBlW3NldE5hbWVdID0gZG8gfHZhbHVlfFxuXHRcdHRoaXMuc2V0QXR0cmlidXRlKG5hbWUsdmFsdWUpXG5cdFx0cmV0dXJuIHRoaXNcblxuXHRyZXR1cm5cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHNyYy9pbWJhL2ltYmEuaW1iYVxuICoqLyIsIlxuXG5kZWYgZW1pdF9fIGV2ZW50LCBhcmdzLCBub2RlXG5cdCMgdmFyIG5vZGUgPSBjYnNbZXZlbnRdXG5cdHZhciBwcmV2LCBjYiwgcmV0XG5cblx0d2hpbGUgKHByZXYgPSBub2RlKSBhbmQgKG5vZGUgPSBub2RlOm5leHQpXG5cdFx0aWYgY2IgPSBub2RlOmxpc3RlbmVyXG5cdFx0XHRpZiBub2RlOnBhdGggYW5kIGNiW25vZGU6cGF0aF1cblx0XHRcdFx0cmV0ID0gYXJncyA/IGNiW25vZGU6cGF0aF0uYXBwbHkoY2IsYXJncykgOiBjYltub2RlOnBhdGhdKClcblx0XHRcdGVsc2Vcblx0XHRcdFx0IyBjaGVjayBpZiBpdCBpcyBhIG1ldGhvZD9cblx0XHRcdFx0cmV0ID0gYXJncyA/IGNiLmFwcGx5KG5vZGUsIGFyZ3MpIDogY2IuY2FsbChub2RlKVxuXG5cdFx0aWYgbm9kZTp0aW1lcyAmJiAtLW5vZGU6dGltZXMgPD0gMFxuXHRcdFx0cHJldjpuZXh0ID0gbm9kZTpuZXh0XG5cdFx0XHRub2RlOmxpc3RlbmVyID0gbnVsbFxuXHRyZXR1cm5cblxuIyBtZXRob2QgZm9yIHJlZ2lzdGVyaW5nIGEgbGlzdGVuZXIgb24gb2JqZWN0XG5kZWYgSW1iYS5saXN0ZW4gb2JqLCBldmVudCwgbGlzdGVuZXIsIHBhdGhcblx0dmFyIGNicywgbGlzdCwgdGFpbFxuXHRjYnMgPSBvYmo6X19saXN0ZW5lcnNfXyB8fD0ge31cblx0bGlzdCA9IGNic1tldmVudF0gfHw9IHt9XG5cdHRhaWwgPSBsaXN0OnRhaWwgfHwgKGxpc3Q6dGFpbCA9IChsaXN0Om5leHQgPSB7fSkpXG5cdHRhaWw6bGlzdGVuZXIgPSBsaXN0ZW5lclxuXHR0YWlsOnBhdGggPSBwYXRoXG5cdGxpc3Q6dGFpbCA9IHRhaWw6bmV4dCA9IHt9XG5cdHJldHVybiB0YWlsXG5cbmRlZiBJbWJhLm9uY2Ugb2JqLCBldmVudCwgbGlzdGVuZXJcblx0dmFyIHRhaWwgPSBJbWJhLmxpc3RlbihvYmosZXZlbnQsbGlzdGVuZXIpXG5cdHRhaWw6dGltZXMgPSAxXG5cdHJldHVybiB0YWlsXG5cbmRlZiBJbWJhLnVubGlzdGVuIG9iaiwgZXZlbnQsIGNiLCBtZXRoXG5cdHZhciBub2RlLCBwcmV2XG5cdHZhciBtZXRhID0gb2JqOl9fbGlzdGVuZXJzX19cblx0cmV0dXJuIHVubGVzcyBtZXRhXG5cblx0aWYgbm9kZSA9IG1ldGFbZXZlbnRdXG5cdFx0d2hpbGUgKHByZXYgPSBub2RlKSBhbmQgKG5vZGUgPSBub2RlOm5leHQpXG5cdFx0XHRpZiBub2RlID09IGNiIHx8IG5vZGU6bGlzdGVuZXIgPT0gY2Jcblx0XHRcdFx0cHJldjpuZXh0ID0gbm9kZTpuZXh0XG5cdFx0XHRcdCMgY2hlY2sgZm9yIGNvcnJlY3QgcGF0aCBhcyB3ZWxsP1xuXHRcdFx0XHRub2RlOmxpc3RlbmVyID0gbnVsbFxuXHRcdFx0XHRicmVha1xuXHRyZXR1cm5cblxuZGVmIEltYmEuZW1pdCBvYmosIGV2ZW50LCBwYXJhbXNcblx0aWYgdmFyIGNiID0gb2JqOl9fbGlzdGVuZXJzX19cblx0XHRlbWl0X18oZXZlbnQscGFyYW1zLGNiW2V2ZW50XSkgaWYgY2JbZXZlbnRdXG5cdFx0ZW1pdF9fKGV2ZW50LFtldmVudCxwYXJhbXNdLGNiOmFsbCkgaWYgY2I6YWxsICMgYW5kIGV2ZW50ICE9ICdhbGwnXG5cdHJldHVyblxuXG5kZWYgSW1iYS5vYnNlcnZlUHJvcGVydHkgb2JzZXJ2ZXIsIGtleSwgdHJpZ2dlciwgdGFyZ2V0LCBwcmV2XG5cdGlmIHByZXYgYW5kIHR5cGVvZiBwcmV2ID09ICdvYmplY3QnXG5cdFx0SW1iYS51bmxpc3RlbihwcmV2LCdhbGwnLG9ic2VydmVyLHRyaWdnZXIpXG5cdGlmIHRhcmdldCBhbmQgdHlwZW9mIHRhcmdldCA9PSAnb2JqZWN0J1xuXHRcdEltYmEubGlzdGVuKHRhcmdldCwnYWxsJyxvYnNlcnZlcix0cmlnZ2VyKVxuXHRzZWxmXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogc3JjL2ltYmEvY29yZS5ldmVudHMuaW1iYVxuICoqLyIsIlxudmFyIHJhZiAjIHZlcnkgc2ltcGxlIHJhZiBwb2x5ZmlsbFxucmFmIHx8PSBnbG9iYWw6cmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5yYWYgfHw9IGdsb2JhbDp3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbnJhZiB8fD0gZ2xvYmFsOm1velJlcXVlc3RBbmltYXRpb25GcmFtZVxucmFmIHx8PSBkbyB8YmxrfCBzZXRUaW1lb3V0KGJsaywxMDAwIC8gNjApXG5cbmRlZiBJbWJhLnRpY2sgZFxuXHRyYWYoSW1iYS50aWNrZXIpIGlmIEBzY2hlZHVsZWRcblx0SW1iYS5TY2hlZHVsZXIud2lsbFJ1blxuXHRlbWl0KHNlbGYsJ3RpY2snLFtkXSlcblx0SW1iYS5TY2hlZHVsZXIuZGlkUnVuXG5cdHJldHVyblxuXG5kZWYgSW1iYS50aWNrZXJcblx0QHRpY2tlciB8fD0gZG8gfGV8IHRpY2soZSlcblxuIyMjXG5cbkdsb2JhbCBhbHRlcm5hdGl2ZSB0byByZXF1ZXN0QW5pbWF0aW9uRnJhbWUuIFNjaGVkdWxlIGEgdGFyZ2V0XG50byB0aWNrIGV2ZXJ5IGZyYW1lLiBZb3UgY2FuIHNwZWNpZnkgd2hpY2ggbWV0aG9kIHRvIGNhbGwgb24gdGhlXG50YXJnZXQgKGRlZmF1bHRzIHRvIHRpY2spLlxuXG4jIyNcbmRlZiBJbWJhLnNjaGVkdWxlIHRhcmdldCwgbWV0aG9kID0gJ3RpY2snXG5cdGxpc3RlbihzZWxmLCd0aWNrJyx0YXJnZXQsbWV0aG9kKVxuXHQjIHN0YXJ0IHNjaGVkdWxpbmcgbm93IGlmIHRoaXMgd2FzIHRoZSBmaXJzdCBvbmVcblx0dW5sZXNzIEBzY2hlZHVsZWRcblx0XHRAc2NoZWR1bGVkID0geWVzXG5cdFx0cmFmKEltYmEudGlja2VyKVxuXHRzZWxmXG5cbiMjI1xuXG5VbnNjaGVkdWxlIGEgcHJldmlvdXNseSBzY2hlZHVsZWQgdGFyZ2V0XG5cbiMjI1xuZGVmIEltYmEudW5zY2hlZHVsZSB0YXJnZXQsIG1ldGhvZFxuXHR1bmxpc3RlbihzZWxmLCd0aWNrJyx0YXJnZXQsbWV0aG9kKVxuXHR2YXIgY2JzID0gc2VsZjpfX2xpc3RlbmVyc19fIHx8PSB7fVxuXHRpZiAhY2JzOnRpY2sgb3IgIWNiczp0aWNrOm5leHQgb3IgIWNiczp0aWNrOm5leHQ6bGlzdGVuZXJcblx0XHRAc2NoZWR1bGVkID0gbm9cblx0c2VsZlxuXG4jIyNcblxuTGlnaHQgd3JhcHBlciBhcm91bmQgbmF0aXZlIHNldFRpbWVvdXQgdGhhdCBleHBlY3RzIHRoZSBibG9jayAvIGZ1bmN0aW9uXG5hcyBsYXN0IGFyZ3VtZW50IChpbnN0ZWFkIG9mIGZpcnN0KS4gSXQgYWxzbyB0cmlnZ2VycyBhbiBldmVudCB0byBJbWJhXG5hZnRlciB0aGUgdGltZW91dCB0byBsZXQgc2NoZWR1bGVycyB1cGRhdGUgKHRvIHJlcmVuZGVyIGV0YykgYWZ0ZXJ3YXJkcy5cblxuIyMjXG5kZWYgSW1iYS5zZXRUaW1lb3V0IGRlbGF5LCAmYmxvY2tcblx0c2V0VGltZW91dCgmLGRlbGF5KSBkb1xuXHRcdGJsb2NrKClcblx0XHRJbWJhLlNjaGVkdWxlci5tYXJrRGlydHlcblx0XHQjIEltYmEuZW1pdChJbWJhLCd0aW1lb3V0JyxbYmxvY2tdKVxuXG4jIyNcblxuTGlnaHQgd3JhcHBlciBhcm91bmQgbmF0aXZlIHNldEludGVydmFsIHRoYXQgZXhwZWN0cyB0aGUgYmxvY2sgLyBmdW5jdGlvblxuYXMgbGFzdCBhcmd1bWVudCAoaW5zdGVhZCBvZiBmaXJzdCkuIEl0IGFsc28gdHJpZ2dlcnMgYW4gZXZlbnQgdG8gSW1iYVxuYWZ0ZXIgZXZlcnkgaW50ZXJ2YWwgdG8gbGV0IHNjaGVkdWxlcnMgdXBkYXRlICh0byByZXJlbmRlciBldGMpIGFmdGVyd2FyZHMuXG5cbiMjI1xuZGVmIEltYmEuc2V0SW50ZXJ2YWwgaW50ZXJ2YWwsICZibG9ja1xuXHRzZXRJbnRlcnZhbCgmLGludGVydmFsKSBkb1xuXHRcdGJsb2NrKClcblx0XHRJbWJhLlNjaGVkdWxlci5tYXJrRGlydHlcblx0XHQjIEltYmEuZW1pdChJbWJhLCdpbnRlcnZhbCcsW2Jsb2NrXSlcblxuIyMjXG5DbGVhciBpbnRlcnZhbCB3aXRoIHNwZWNpZmllZCBpZFxuIyMjXG5kZWYgSW1iYS5jbGVhckludGVydmFsIGludGVydmFsXG5cdGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpXG5cbiMjI1xuQ2xlYXIgdGltZW91dCB3aXRoIHNwZWNpZmllZCBpZFxuIyMjXG5kZWYgSW1iYS5jbGVhclRpbWVvdXQgdGltZW91dFxuXHRjbGVhclRpbWVvdXQodGltZW91dClcblxuIyBzaG91bGQgYWRkIGFuIEltYmEucnVuIC8gc2V0SW1tZWRpYXRlIHRoYXRcbiMgcHVzaGVzIGxpc3RlbmVyIG9udG8gdGhlIHRpY2stcXVldWUgd2l0aCB0aW1lcyAtIG9uY2VcblxuXG4jIyNcblxuSW5zdGFuY2VzIG9mIEltYmEuU2NoZWR1bGVyIG1hbmFnZXMgd2hlbiB0byBjYWxsIGB0aWNrKClgIG9uIHRoZWlyIHRhcmdldCxcbmF0IGEgc3BlY2lmaWVkIGZyYW1lcmF0ZSBvciB3aGVuIGNlcnRhaW4gZXZlbnRzIG9jY3VyLiBSb290LW5vZGVzIGluIHlvdXJcbmFwcGxpY2F0aW9ucyB3aWxsIHVzdWFsbHkgaGF2ZSBhIHNjaGVkdWxlciB0byBtYWtlIHN1cmUgdGhleSByZXJlbmRlciB3aGVuXG5zb21ldGhpbmcgY2hhbmdlcy4gSXQgaXMgYWxzbyBwb3NzaWJsZSB0byBtYWtlIGlubmVyIGNvbXBvbmVudHMgdXNlIHRoZWlyXG5vd24gc2NoZWR1bGVycyB0byBjb250cm9sIHdoZW4gdGhleSByZW5kZXIuXG5cbkBpbmFtZSBzY2hlZHVsZXJcblxuIyMjXG5jbGFzcyBJbWJhLlNjaGVkdWxlclxuXG5cdGRlZiBzZWxmLm1hcmtEaXJ0eVxuXHRcdEBkaXJ0eSA9IHllc1xuXHRcdHNlbGZcblxuXHRkZWYgc2VsZi5pc0RpcnR5XG5cdFx0ISFAZGlydHlcblxuXHRkZWYgc2VsZi53aWxsUnVuXG5cdFx0QGFjdGl2ZSA9IHllc1xuXG5cdGRlZiBzZWxmLmRpZFJ1blxuXHRcdEBhY3RpdmUgPSBub1xuXHRcdEBkaXJ0eSA9IG5vXG5cblx0ZGVmIHNlbGYuaXNBY3RpdmVcblx0XHQhIUBhY3RpdmVcblxuXHQjIyNcblx0Q3JlYXRlIGEgbmV3IEltYmEuU2NoZWR1bGVyIGZvciBzcGVjaWZpZWQgdGFyZ2V0XG5cdEByZXR1cm4ge0ltYmEuU2NoZWR1bGVyfVxuXHQjIyNcblx0ZGVmIGluaXRpYWxpemUgdGFyZ2V0XG5cdFx0QHRhcmdldCA9IHRhcmdldFxuXHRcdEBtYXJrZWQgPSBub1xuXHRcdEBhY3RpdmUgPSBub1xuXHRcdEBtYXJrZXIgPSBkbyBtYXJrXG5cdFx0QHRpY2tlciA9IGRvIHxlfCB0aWNrKGUpXG5cdFx0XG5cdFx0QGV2ZW50cyA9IHllc1xuXHRcdEBmcHMgPSAxXG5cblx0XHRAZHQgPSAwXG5cdFx0QHRpbWVzdGFtcCA9IDBcblx0XHRAdGlja3MgPSAwXG5cdFx0QGZsdXNoZXMgPSAwXG5cblx0IyMjXG5cdENoZWNrIHdoZXRoZXIgdGhlIGN1cnJlbnQgc2NoZWR1bGVyIGlzIGFjdGl2ZSBvciBub3Rcblx0QHJldHVybiB7Ym9vbH1cblx0IyMjXG5cdGRlZiBhY3RpdmVcblx0XHRAYWN0aXZlXG5cblx0IyMjXG5cdERlbHRhIHRpbWUgYmV0d2VlbiB0aGUgdHdvIGxhc3QgdGlja3Ncblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIGR0XG5cdFx0QGR0XG5cblx0IyMjXG5cdENvbmZpZ3VyZSB0aGUgc2NoZWR1bGVyXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgY29uZmlndXJlIGZwczogMSwgZXZlbnRzOiB5ZXNcblx0XHRAZXZlbnRzID0gZXZlbnRzIGlmIGV2ZW50cyAhPSBudWxsXG5cdFx0QGZwcyA9IGZwcyBpZiBmcHMgIT0gbnVsbFxuXHRcdHNlbGZcblxuXHQjIyNcblx0TWFyayB0aGUgc2NoZWR1bGVyIGFzIGRpcnR5LiBUaGlzIHdpbGwgbWFrZSBzdXJlIHRoYXRcblx0dGhlIHNjaGVkdWxlciBjYWxscyBgdGFyZ2V0LnRpY2tgIG9uIHRoZSBuZXh0IGZyYW1lXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgbWFya1xuXHRcdEBtYXJrZWQgPSB5ZXNcblx0XHRzZWxmXG5cblx0IyMjXG5cdEluc3RhbnRseSB0cmlnZ2VyIHRhcmdldC50aWNrIGFuZCBtYXJrIHNjaGVkdWxlciBhcyBjbGVhbiAobm90IGRpcnR5L21hcmtlZCkuXG5cdFRoaXMgaXMgY2FsbGVkIGltcGxpY2l0bHkgZnJvbSB0aWNrLCBidXQgY2FuIGFsc28gYmUgY2FsbGVkIG1hbnVhbGx5IGlmIHlvdVxuXHRyZWFsbHkgd2FudCB0byBmb3JjZSBhIHRpY2sgd2l0aG91dCB3YWl0aW5nIGZvciB0aGUgbmV4dCBmcmFtZS5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBmbHVzaFxuXHRcdEBtYXJrZWQgPSBub1xuXHRcdEBmbHVzaGVzKytcblx0XHRAdGFyZ2V0LnRpY2tcblx0XHRzZWxmXG5cblx0IyMjXG5cdEBmaXhtZSB0aGlzIGV4cGVjdHMgcmFmIHRvIHJ1biBhdCA2MCBmcHMgXG5cblx0Q2FsbGVkIGF1dG9tYXRpY2FsbHkgb24gZXZlcnkgZnJhbWUgd2hpbGUgdGhlIHNjaGVkdWxlciBpcyBhY3RpdmUuXG5cdEl0IHdpbGwgb25seSBjYWxsIGB0YXJnZXQudGlja2AgaWYgdGhlIHNjaGVkdWxlciBpcyBtYXJrZWQgZGlydHksXG5cdG9yIHdoZW4gYWNjb3JkaW5nIHRvIEBmcHMgc2V0dGluZy5cblxuXHRJZiB5b3UgaGF2ZSBzZXQgdXAgYSBzY2hlZHVsZXIgd2l0aCBhbiBmcHMgb2YgMSwgdGljayB3aWxsIHN0aWxsIGJlXG5cdGNhbGxlZCBldmVyeSBmcmFtZSwgYnV0IGB0YXJnZXQudGlja2Agd2lsbCBvbmx5IGJlIGNhbGxlZCBvbmNlIGV2ZXJ5XG5cdHNlY29uZCwgYW5kIGl0IHdpbGwgKm1ha2Ugc3VyZSogZWFjaCBgdGFyZ2V0LnRpY2tgIGhhcHBlbnMgaW4gc2VwYXJhdGVcblx0c2Vjb25kcyBhY2NvcmRpbmcgdG8gRGF0ZS4gU28gaWYgeW91IGhhdmUgYSBub2RlIHRoYXQgcmVuZGVycyBhIGNsb2NrXG5cdGJhc2VkIG9uIERhdGUubm93IChvciBzb21ldGhpbmcgc2ltaWxhciksIHlvdSBjYW4gc2NoZWR1bGUgaXQgd2l0aCAxZnBzLFxuXHRuZXZlciBuZWVkaW5nIHRvIHdvcnJ5IGFib3V0IHR3byB0aWNrcyBoYXBwZW5pbmcgd2l0aGluIHRoZSBzYW1lIHNlY29uZC5cblx0VGhlIHNhbWUgZ29lcyBmb3IgNGZwcywgMTBmcHMgZXRjLlxuXG5cdEBwcm90ZWN0ZWRcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiB0aWNrIGRlbHRhXG5cdFx0QHRpY2tzKytcblx0XHRAZHQgPSBkZWx0YVxuXG5cdFx0bGV0IGZwcyA9IEBmcHNcblx0XHRcblx0XHRpZiBmcHMgPT0gNjBcblx0XHRcdEBtYXJrZWQgPSB5ZXNcblx0XHRlbGlmIGZwcyA9PSAzMFxuXHRcdFx0QG1hcmtlZCA9IHllcyBpZiBAdGlja3MgJSAyXG5cdFx0ZWxpZiBmcHNcblx0XHRcdCMgaWYgaXQgaXMgbGVzcyByb3VuZCAtIHdlIHRyaWdnZXIgYmFzZWRcblx0XHRcdCMgb24gZGF0ZSwgZm9yIGNvbnNpc3RlbnQgcmVuZGVyaW5nLlxuXHRcdFx0IyBpZSwgaWYgeW91IHdhbnQgdG8gcmVuZGVyIGV2ZXJ5IHNlY29uZFxuXHRcdFx0IyBpdCBpcyBpbXBvcnRhbnQgdGhhdCBubyB0d28gcmVuZGVyc1xuXHRcdFx0IyBoYXBwZW4gZHVyaW5nIHRoZSBzYW1lIHNlY29uZCAoYWNjb3JkaW5nIHRvIERhdGUpXG5cdFx0XHRsZXQgcGVyaW9kID0gKCg2MCAvIGZwcykgLyA2MCkgKiAxMDAwXG5cdFx0XHRsZXQgYmVhdCA9IE1hdGguZmxvb3IoRGF0ZS5ub3cgLyBwZXJpb2QpXG5cblx0XHRcdGlmIEBiZWF0ICE9IGJlYXRcblx0XHRcdFx0QGJlYXQgPSBiZWF0XG5cdFx0XHRcdEBtYXJrZWQgPSB5ZXNcblxuXHRcdGZsdXNoIGlmIEBtYXJrZWQgb3IgKEBldmVudHMgYW5kIEltYmEuU2NoZWR1bGVyLmlzRGlydHkpXG5cdFx0IyByZXNjaGVkdWxlIGlmIEBhY3RpdmVcblx0XHRzZWxmXG5cblx0IyMjXG5cdFN0YXJ0IHRoZSBzY2hlZHVsZXIgaWYgaXQgaXMgbm90IGFscmVhZHkgYWN0aXZlLlxuXHQqKldoaWxlIGFjdGl2ZSoqLCB0aGUgc2NoZWR1bGVyIHdpbGwgb3ZlcnJpZGUgYHRhcmdldC5jb21taXRgXG5cdHRvIGRvIG5vdGhpbmcuIEJ5IGRlZmF1bHQgSW1iYS50YWcjY29tbWl0IGNhbGxzIHJlbmRlciwgc29cblx0dGhhdCByZW5kZXJpbmcgaXMgY2FzY2FkZWQgdGhyb3VnaCB0byBjaGlsZHJlbiB3aGVuIHJlbmRlcmluZ1xuXHRhIG5vZGUuIFdoZW4gYSBzY2hlZHVsZXIgaXMgYWN0aXZlIChmb3IgYSBub2RlKSwgSW1iYSBkaXNhYmxlc1xuXHR0aGlzIGF1dG9tYXRpYyByZW5kZXJpbmcuXG5cdCMjI1xuXHRkZWYgYWN0aXZhdGVcblx0XHR1bmxlc3MgQGFjdGl2ZVxuXHRcdFx0QGFjdGl2ZSA9IHllc1xuXHRcdFx0IyBvdmVycmlkZSB0YXJnZXQjY29tbWl0IHdoaWxlIHRoaXMgaXMgYWN0aXZlXG5cdFx0XHRAY29tbWl0ID0gQHRhcmdldDpjb21taXRcblx0XHRcdEB0YXJnZXQ6Y29tbWl0ID0gZG8gdGhpc1xuXHRcdFx0SW1iYS5zY2hlZHVsZShzZWxmKVxuXHRcdFx0SW1iYS5saXN0ZW4oSW1iYSwnZXZlbnQnLHNlbGYsJ29uZXZlbnQnKSBpZiBAZXZlbnRzXG5cdFx0XHRAdGFyZ2V0Py5mbGFnKCdzY2hlZHVsZWRfJylcblx0XHRcdHRpY2soMCkgIyBzdGFydCB0aWNraW5nXG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblx0U3RvcCB0aGUgc2NoZWR1bGVyIGlmIGl0IGlzIGFjdGl2ZS5cblx0IyMjXG5cdGRlZiBkZWFjdGl2YXRlXG5cdFx0aWYgQGFjdGl2ZVxuXHRcdFx0QGFjdGl2ZSA9IG5vXG5cdFx0XHRAdGFyZ2V0OmNvbW1pdCA9IEBjb21taXRcblx0XHRcdEltYmEudW5zY2hlZHVsZShzZWxmKVxuXHRcdFx0SW1iYS51bmxpc3RlbihJbWJhLCdldmVudCcsc2VsZilcblx0XHRcdEB0YXJnZXQ/LnVuZmxhZygnc2NoZWR1bGVkXycpXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgdHJhY2tcblx0XHRAbWFya2VyXG5cblx0ZGVmIG9uZXZlbnQgZXZlbnRcblx0XHRyZXR1cm4gc2VsZiBpZiBAbWFya2VkXG5cblx0XHRpZiBAZXZlbnRzIGlzYSBGdW5jdGlvblxuXHRcdFx0bWFyayBpZiBAZXZlbnRzKGV2ZW50KVx0XG5cdFx0ZWxpZiBAZXZlbnRzIGlzYSBBcnJheVxuXHRcdFx0bWFyayBpZiBldmVudD8udHlwZSBpbiBAZXZlbnRzXG5cdFx0ZWxpZiBAZXZlbnRzXG5cdFx0XHRtYXJrIGlmIGV2ZW50LkByZXNwb25kZXJcblx0XHRzZWxmXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBzcmMvaW1iYS9zY2hlZHVsZXIuaW1iYVxuICoqLyIsImRlZiBJbWJhLnN0YXRpYyBpdGVtcywgbnJcblx0aXRlbXM6c3RhdGljID0gbnJcblx0cmV0dXJuIGl0ZW1zXG5cbiMjI1xuVGhpcyBpcyB0aGUgYmFzZWNsYXNzIHRoYXQgYWxsIHRhZ3MgaW4gaW1iYSBpbmhlcml0IGZyb20uXG5AaW5hbWUgbm9kZVxuIyMjXG5jbGFzcyBJbWJhLlRhZ1xuXG5cdGRlZiBzZWxmLmNyZWF0ZU5vZGVcblx0XHR0aHJvdyBcIk5vdCBpbXBsZW1lbnRlZFwiXG5cblx0ZGVmIHNlbGYuYnVpbGRcblx0XHRzZWxmLm5ldyhzZWxmLmNyZWF0ZU5vZGUpXG5cblx0cHJvcCBvYmplY3RcblxuXHRkZWYgZG9tXG5cdFx0QGRvbVxuXG5cdGRlZiBpbml0aWFsaXplIGRvbVxuXHRcdHNlbGYuZG9tID0gZG9tXG5cdFx0XG5cdGRlZiBzZXREb20gZG9tXG5cdFx0ZG9tLkB0YWcgPSBzZWxmXG5cdFx0QGRvbSA9IGRvbVxuXHRcdHNlbGZcblxuXHQjIyNcblx0U2V0dGluZyByZWZlcmVuY2VzIGZvciB0YWdzIGxpa2Vcblx0YDxkaXZAaGVhZGVyPmAgd2lsbCBjb21waWxlIHRvIGB0YWcoJ2RpdicpLnNldFJlZignaGVhZGVyJyx0aGlzKS5lbmQoKWBcblx0QnkgZGVmYXVsdCBpdCBhZGRzIHRoZSByZWZlcmVuY2UgYXMgYSBjbGFzc05hbWUgdG8gdGhlIHRhZy5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzZXRSZWYgcmVmLCBjdHhcblx0XHRmbGFnKEByZWYgPSByZWYpXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRNZXRob2QgdGhhdCBpcyBjYWxsZWQgYnkgdGhlIGNvbXBpbGVkIHRhZy1jaGFpbnMsIGZvclxuXHRiaW5kaW5nIGV2ZW50cyBvbiB0YWdzIHRvIG1ldGhvZHMgZXRjLlxuXHRgPGEgOnRhcD1mbj5gIGNvbXBpbGVzIHRvIGB0YWcoJ2EnKS5zZXRIYW5kbGVyKCd0YXAnLGZuLHRoaXMpLmVuZCgpYFxuXHR3aGVyZSB0aGlzIHJlZmVycyB0byB0aGUgY29udGV4dCBpbiB3aGljaCB0aGUgdGFnIGlzIGNyZWF0ZWQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0SGFuZGxlciBldmVudCwgaGFuZGxlciwgY3R4XG5cdFx0dmFyIGtleSA9ICdvbicgKyBldmVudFxuXG5cdFx0aWYgaGFuZGxlciBpc2EgRnVuY3Rpb25cblx0XHRcdHNlbGZba2V5XSA9IGhhbmRsZXJcblx0XHRlbGlmIGhhbmRsZXIgaXNhIEFycmF5XG5cdFx0XHR2YXIgZm4gPSBoYW5kbGVyLnNoaWZ0XG5cdFx0XHRzZWxmW2tleV0gPSBkbyB8ZXwgY3R4W2ZuXS5hcHBseShjdHgsaGFuZGxlci5jb25jYXQoZSkpXG5cdFx0ZWxzZVxuXHRcdFx0c2VsZltrZXldID0gZG8gfGV8IGN0eFtoYW5kbGVyXShlKVxuXHRcdHNlbGZcblxuXHRkZWYgaWQ9IGlkXG5cdFx0ZG9tOmlkID0gaWRcblx0XHRzZWxmXG5cblx0ZGVmIGlkXG5cdFx0ZG9tOmlkXG5cblx0IyMjXG5cdEFkZHMgYSBuZXcgYXR0cmlidXRlIG9yIGNoYW5nZXMgdGhlIHZhbHVlIG9mIGFuIGV4aXN0aW5nIGF0dHJpYnV0ZVxuXHRvbiB0aGUgc3BlY2lmaWVkIHRhZy4gSWYgdGhlIHZhbHVlIGlzIG51bGwgb3IgZmFsc2UsIHRoZSBhdHRyaWJ1dGVcblx0d2lsbCBiZSByZW1vdmVkLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNldEF0dHJpYnV0ZSBuYW1lLCB2YWx1ZVxuXHRcdCMgc2hvdWxkIHRoaXMgbm90IHJldHVybiBzZWxmP1xuXHRcdHZhciBvbGQgPSBkb20uZ2V0QXR0cmlidXRlKG5hbWUpXG5cblx0XHRpZiBvbGQgPT0gdmFsdWVcblx0XHRcdHZhbHVlXG5cdFx0ZWxpZiB2YWx1ZSAhPSBudWxsICYmIHZhbHVlICE9PSBmYWxzZVxuXHRcdFx0ZG9tLnNldEF0dHJpYnV0ZShuYW1lLHZhbHVlKVxuXHRcdGVsc2Vcblx0XHRcdGRvbS5yZW1vdmVBdHRyaWJ1dGUobmFtZSlcblxuXHQjIyNcblx0cmVtb3ZlcyBhbiBhdHRyaWJ1dGUgZnJvbSB0aGUgc3BlY2lmaWVkIHRhZ1xuXHQjIyNcblx0ZGVmIHJlbW92ZUF0dHJpYnV0ZSBuYW1lXG5cdFx0ZG9tLnJlbW92ZUF0dHJpYnV0ZShuYW1lKVxuXG5cdCMjI1xuXHRyZXR1cm5zIHRoZSB2YWx1ZSBvZiBhbiBhdHRyaWJ1dGUgb24gdGhlIHRhZy5cblx0SWYgdGhlIGdpdmVuIGF0dHJpYnV0ZSBkb2VzIG5vdCBleGlzdCwgdGhlIHZhbHVlIHJldHVybmVkXG5cdHdpbGwgZWl0aGVyIGJlIG51bGwgb3IgXCJcIiAodGhlIGVtcHR5IHN0cmluZylcblx0IyMjXG5cdGRlZiBnZXRBdHRyaWJ1dGUgbmFtZVxuXHRcdGRvbS5nZXRBdHRyaWJ1dGUobmFtZSlcblxuXHQjIyNcblx0T3ZlcnJpZGUgdGhpcyB0byBwcm92aWRlIHNwZWNpYWwgd3JhcHBpbmcgZXRjLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNldENvbnRlbnQgY29udGVudCwgdHlwZVxuXHRcdHNldENoaWxkcmVuIGNvbnRlbnQsIHR5cGVcblx0XHRzZWxmXG5cblx0IyMjXG5cdFNldCB0aGUgY2hpbGRyZW4gb2Ygbm9kZS4gdHlwZSBwYXJhbSBpcyBvcHRpb25hbCxcblx0YW5kIHNob3VsZCBvbmx5IGJlIHVzZWQgYnkgSW1iYSB3aGVuIGNvbXBpbGluZyB0YWcgdHJlZXMuIFxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNldENoaWxkcmVuIG5vZGVzLCB0eXBlXG5cdFx0dGhyb3cgXCJOb3QgaW1wbGVtZW50ZWRcIlxuXG5cdCMjI1xuXHRHZXQgdGV4dCBvZiBub2RlLiBVc2VzIHRleHRDb250ZW50IGJlaGluZCB0aGUgc2NlbmVzIChub3QgaW5uZXJUZXh0KVxuXHRbaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL05vZGUvdGV4dENvbnRlbnRdKClcblx0QHJldHVybiB7c3RyaW5nfSBpbm5lciB0ZXh0IG9mIG5vZGVcblx0IyMjXG5cdGRlZiB0ZXh0IHZcblx0XHRAZG9tOnRleHRDb250ZW50XG5cblx0IyMjXG5cdFNldCB0ZXh0IG9mIG5vZGUuIFVzZXMgdGV4dENvbnRlbnQgYmVoaW5kIHRoZSBzY2VuZXMgKG5vdCBpbm5lclRleHQpXG5cdFtodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvTm9kZS90ZXh0Q29udGVudF0oKVxuXHQjIyNcblx0ZGVmIHRleHQ9IHR4dFxuXHRcdEBlbXB0eSA9IG5vXG5cdFx0QGRvbTp0ZXh0Q29udGVudCA9IHR4dCA/PSBcIlwiXG5cdFx0c2VsZlxuXG5cblx0IyMjXG5cdE1ldGhvZCBmb3IgZ2V0dGluZyBhbmQgc2V0dGluZyBkYXRhLWF0dHJpYnV0ZXMuIFdoZW4gY2FsbGVkIHdpdGggemVyb1xuXHRhcmd1bWVudHMgaXQgd2lsbCByZXR1cm4gdGhlIGFjdHVhbCBkYXRhc2V0IGZvciB0aGUgdGFnLlxuXG5cdFx0dmFyIG5vZGUgPSA8ZGl2IGRhdGEtbmFtZT0naGVsbG8nPlxuXHRcdCMgZ2V0IHRoZSB3aG9sZSBkYXRhc2V0XG5cdFx0bm9kZS5kYXRhc2V0ICMge25hbWU6ICdoZWxsbyd9XG5cdFx0IyBnZXQgYSBzaW5nbGUgdmFsdWVcblx0XHRub2RlLmRhdGFzZXQoJ25hbWUnKSAjICdoZWxsbydcblx0XHQjIHNldCBhIHNpbmdsZSB2YWx1ZVxuXHRcdG5vZGUuZGF0YXNldCgnbmFtZScsJ25ld25hbWUnKSAjIHNlbGZcblxuXG5cdCMjI1xuXHRkZWYgZGF0YXNldCBrZXksIHZhbFxuXHRcdHRocm93IFwiTm90IGltcGxlbWVudGVkXCJcblxuXHQjIyNcblx0RW1wdHkgcGxhY2Vob2xkZXIuIE92ZXJyaWRlIHRvIGltcGxlbWVudCBjdXN0b20gcmVuZGVyIGJlaGF2aW91ci5cblx0V29ya3MgbXVjaCBsaWtlIHRoZSBmYW1pbGlhciByZW5kZXItbWV0aG9kIGluIFJlYWN0LlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHJlbmRlclxuXHRcdHNlbGZcblxuXHQjIyNcblx0Q2FsbGVkIGltcGxpY2l0bHkgdGhyb3VnaCBJbWJhLlRhZyNlbmQsIHVwb24gY3JlYXRpbmcgYSB0YWcuIEFsbFxuXHRwcm9wZXJ0aWVzIHdpbGwgaGF2ZSBiZWVuIHNldCBiZWZvcmUgYnVpbGQgaXMgY2FsbGVkLCBpbmNsdWRpbmdcblx0c2V0Q29udGVudC5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBidWlsZFxuXHRcdHJlbmRlclxuXHRcdHNlbGZcblxuXHQjIyNcblx0Q2FsbGVkIGltcGxpY2l0bHkgdGhyb3VnaCBJbWJhLlRhZyNlbmQsIGZvciB0YWdzIHRoYXQgYXJlIHBhcnQgb2Zcblx0YSB0YWcgdHJlZSAodGhhdCBhcmUgcmVuZGVyZWQgc2V2ZXJhbCB0aW1lcykuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgY29tbWl0XG5cdFx0cmVuZGVyXG5cdFx0c2VsZlxuXG5cdCMjI1xuXG5cdENhbGxlZCBieSB0aGUgdGFnLXNjaGVkdWxlciAoaWYgdGhpcyB0YWcgaXMgc2NoZWR1bGVkKVxuXHRCeSBkZWZhdWx0IGl0IHdpbGwgY2FsbCB0aGlzLnJlbmRlci4gRG8gbm90IG92ZXJyaWRlIHVubGVzc1xuXHR5b3UgcmVhbGx5IHVuZGVyc3RhbmQgaXQuXG5cblx0IyMjXG5cdGRlZiB0aWNrXG5cdFx0cmVuZGVyXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRcblx0QSB2ZXJ5IGltcG9ydGFudCBtZXRob2QgdGhhdCB5b3Ugd2lsbCBwcmFjdGljYWxseSBuZXZlciBtYW51YWxseS5cblx0VGhlIHRhZyBzeW50YXggb2YgSW1iYSBjb21waWxlcyB0byBhIGNoYWluIG9mIHNldHRlcnMsIHdoaWNoIGFsd2F5c1xuXHRlbmRzIHdpdGggLmVuZC4gYDxhLmxhcmdlPmAgY29tcGlsZXMgdG8gYHRhZygnYScpLmZsYWcoJ2xhcmdlJykuZW5kKClgXG5cdFxuXHRZb3UgYXJlIGhpZ2hseSBhZHZpY2VkIHRvIG5vdCBvdmVycmlkZSBpdHMgYmVoYXZpb3VyLiBUaGUgZmlyc3QgdGltZVxuXHRlbmQgaXMgY2FsbGVkIGl0IHdpbGwgbWFyayB0aGUgdGFnIGFzIGJ1aWx0IGFuZCBjYWxsIEltYmEuVGFnI2J1aWxkLFxuXHRhbmQgY2FsbCBJbWJhLlRhZyNjb21taXQgb24gc3Vic2VxdWVudCBjYWxscy5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBlbmRcblx0XHRpZiBAYnVpbHRcblx0XHRcdGNvbW1pdFxuXHRcdGVsc2Vcblx0XHRcdEBidWlsdCA9IHllc1xuXHRcdFx0YnVpbGRcblx0XHRzZWxmXG5cblx0IyMjXG5cdFRoaXMgaXMgY2FsbGVkIGluc3RlYWQgb2YgSW1iYS5UYWcjZW5kIGZvciBgPHNlbGY+YCB0YWcgY2hhaW5zLlxuXHREZWZhdWx0cyB0byBub29wXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc3luY2VkXG5cdFx0c2VsZlxuXG5cdCMgY2FsbGVkIHdoZW4gdGhlIG5vZGUgaXMgYXdha2VuZWQgaW4gdGhlIGRvbSAtIGVpdGhlciBhdXRvbWF0aWNhbGx5XG5cdCMgdXBvbiBhdHRhY2htZW50IHRvIHRoZSBkb20tdHJlZSwgb3IgdGhlIGZpcnN0IHRpbWUgaW1iYSBuZWVkcyB0aGVcblx0IyB0YWcgZm9yIGEgZG9tbm9kZSB0aGF0IGhhcyBiZWVuIHJlbmRlcmVkIG9uIHRoZSBzZXJ2ZXJcblx0ZGVmIGF3YWtlblxuXHRcdHNlbGZcblxuXHQjIyNcblx0TGlzdCBvZiBmbGFncyBmb3IgdGhpcyBub2RlLiBcblx0IyMjXG5cdGRlZiBmbGFnc1xuXHRcdEBkb206Y2xhc3NMaXN0XG5cblx0IyMjXG5cdEFkZCBzcGVmaWNpZWQgZmxhZyB0byBjdXJyZW50IG5vZGUuXG5cdElmIGEgc2Vjb25kIGFyZ3VtZW50IGlzIHN1cHBsaWVkLCBpdCB3aWxsIGJlIGNvZXJjZWQgaW50byBhIEJvb2xlYW4sXG5cdGFuZCB1c2VkIHRvIGluZGljYXRlIHdoZXRoZXIgd2Ugc2hvdWxkIHJlbW92ZSB0aGUgZmxhZyBpbnN0ZWFkLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGZsYWcgbmFtZSwgdG9nZ2xlclxuXHRcdCMgaXQgaXMgbW9zdCBuYXR1cmFsIHRvIHRyZWF0IGEgc2Vjb25kIHVuZGVmaW5lZCBhcmd1bWVudCBhcyBhIG5vLXN3aXRjaFxuXHRcdCMgc28gd2UgbmVlZCB0byBjaGVjayB0aGUgYXJndW1lbnRzLWxlbmd0aFxuXHRcdGlmIGFyZ3VtZW50czpsZW5ndGggPT0gMiBhbmQgIXRvZ2dsZXJcblx0XHRcdEBkb206Y2xhc3NMaXN0LnJlbW92ZShuYW1lKVxuXHRcdGVsc2Vcblx0XHRcdEBkb206Y2xhc3NMaXN0LmFkZChuYW1lKVxuXHRcdHJldHVybiBzZWxmXG5cblx0IyMjXG5cdFJlbW92ZSBzcGVjaWZpZWQgZmxhZyBmcm9tIG5vZGVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiB1bmZsYWcgbmFtZVxuXHRcdEBkb206Y2xhc3NMaXN0LnJlbW92ZShuYW1lKVxuXHRcdHNlbGZcblxuXHQjIyNcblx0VG9nZ2xlIHNwZWNpZmllZCBmbGFnIG9uIG5vZGVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiB0b2dnbGVGbGFnIG5hbWVcblx0XHRAZG9tOmNsYXNzTGlzdC50b2dnbGUobmFtZSlcblx0XHRzZWxmXG5cblx0IyMjXG5cdENoZWNrIHdoZXRoZXIgY3VycmVudCBub2RlIGhhcyBzcGVjaWZpZWQgZmxhZ1xuXHRAcmV0dXJuIHtib29sfVxuXHQjIyNcblx0ZGVmIGhhc0ZsYWcgbmFtZVxuXHRcdEBkb206Y2xhc3NMaXN0LmNvbnRhaW5zKG5hbWUpXG5cblx0IyMjXG5cdEdldCB0aGUgc2NoZWR1bGVyIGZvciB0aGlzIG5vZGUuIEEgbmV3IHNjaGVkdWxlciB3aWxsIGJlIGNyZWF0ZWRcblx0aWYgaXQgZG9lcyBub3QgYWxyZWFkeSBleGlzdC5cblxuXHRAcmV0dXJuIHtJbWJhLlNjaGVkdWxlcn1cblx0IyMjXG5cdGRlZiBzY2hlZHVsZXJcblx0XHRAc2NoZWR1bGVyID89IEltYmEuU2NoZWR1bGVyLm5ldyhzZWxmKVxuXG5cdCMjI1xuXG5cdFNob3J0aGFuZCB0byBzdGFydCBzY2hlZHVsaW5nIGEgbm9kZS4gVGhlIG1ldGhvZCB3aWxsIGJhc2ljYWxseVxuXHRwcm94eSB0aGUgYXJndW1lbnRzIHRocm91Z2ggdG8gc2NoZWR1bGVyLmNvbmZpZ3VyZSwgYW5kIHRoZW5cblx0YWN0aXZhdGUgdGhlIHNjaGVkdWxlci5cblx0XG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2NoZWR1bGUgb3B0aW9ucyA9IHt9XG5cdFx0c2NoZWR1bGVyLmNvbmZpZ3VyZShvcHRpb25zKS5hY3RpdmF0ZVxuXHRcdHNlbGZcblxuXHQjIyNcblx0U2hvcnRoYW5kIGZvciBkZWFjdGl2YXRpbmcgc2NoZWR1bGVyIChpZiB0YWcgaGFzIG9uZSkuXG5cdEBkZXByZWNhdGVkXG5cdCMjI1xuXHRkZWYgdW5zY2hlZHVsZVxuXHRcdHNjaGVkdWxlci5kZWFjdGl2YXRlIGlmIEBzY2hlZHVsZXJcblx0XHRzZWxmXG5cblxuXHQjIyNcblx0R2V0IHRoZSBwYXJlbnQgb2YgY3VycmVudCBub2RlXG5cdEByZXR1cm4ge0ltYmEuVGFnfSBcblx0IyMjXG5cdGRlZiBwYXJlbnRcblx0XHR0YWcoZG9tOnBhcmVudE5vZGUpXG5cblx0IyMjXG5cdFNob3J0aGFuZCBmb3IgY29uc29sZS5sb2cgb24gZWxlbWVudHNcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBsb2cgKmFyZ3Ncblx0XHRhcmdzLnVuc2hpZnQoY29uc29sZSlcblx0XHRGdW5jdGlvbjpwcm90b3R5cGU6Y2FsbC5hcHBseShjb25zb2xlOmxvZywgYXJncylcblx0XHRzZWxmXG5cblx0ZGVmIGNzcyBrZXksIHZhbFxuXHRcdGlmIGtleSBpc2EgT2JqZWN0XG5cdFx0XHRjc3Moayx2KSBmb3Igb3duIGssdiBvZiBrZXlcblx0XHRlbGlmIHZhbCA9PSBudWxsXG5cdFx0XHRkb206c3R5bGUucmVtb3ZlUHJvcGVydHkoa2V5KVxuXHRcdGVsaWYgdmFsID09IHVuZGVmaW5lZFxuXHRcdFx0cmV0dXJuIGRvbTpzdHlsZVtrZXldXG5cdFx0ZWxzZVxuXHRcdFx0aWYgdmFsIGlzYSBOdW1iZXIgYW5kIGtleS5tYXRjaCgvd2lkdGh8aGVpZ2h0fGxlZnR8cmlnaHR8dG9wfGJvdHRvbS8pXG5cdFx0XHRcdHZhbCA9IHZhbCArIFwicHhcIlxuXHRcdFx0ZG9tOnN0eWxlW2tleV0gPSB2YWxcblx0XHRzZWxmXG5cblx0ZGVmIHRyYW5zZm9ybT0gdmFsdWVcblx0XHRjc3MoOnRyYW5zZm9ybSwgdmFsdWUpXG5cdFx0c2VsZlxuXG5cdGRlZiB0cmFuc2Zvcm1cblx0XHRjc3MoOnRyYW5zZm9ybSlcblxuXG5JbWJhLlRhZzpwcm90b3R5cGU6aW5pdGlhbGl6ZSA9IEltYmEuVGFnXG5cbkhUTUxfVEFHUyA9IFwiYSBhYmJyIGFkZHJlc3MgYXJlYSBhcnRpY2xlIGFzaWRlIGF1ZGlvIGIgYmFzZSBiZGkgYmRvIGJpZyBibG9ja3F1b3RlIGJvZHkgYnIgYnV0dG9uIGNhbnZhcyBjYXB0aW9uIGNpdGUgY29kZSBjb2wgY29sZ3JvdXAgZGF0YSBkYXRhbGlzdCBkZCBkZWwgZGV0YWlscyBkZm4gZGl2IGRsIGR0IGVtIGVtYmVkIGZpZWxkc2V0IGZpZ2NhcHRpb24gZmlndXJlIGZvb3RlciBmb3JtIGgxIGgyIGgzIGg0IGg1IGg2IGhlYWQgaGVhZGVyIGhyIGh0bWwgaSBpZnJhbWUgaW1nIGlucHV0IGlucyBrYmQga2V5Z2VuIGxhYmVsIGxlZ2VuZCBsaSBsaW5rIG1haW4gbWFwIG1hcmsgbWVudSBtZW51aXRlbSBtZXRhIG1ldGVyIG5hdiBub3NjcmlwdCBvYmplY3Qgb2wgb3B0Z3JvdXAgb3B0aW9uIG91dHB1dCBwIHBhcmFtIHByZSBwcm9ncmVzcyBxIHJwIHJ0IHJ1YnkgcyBzYW1wIHNjcmlwdCBzZWN0aW9uIHNlbGVjdCBzbWFsbCBzb3VyY2Ugc3BhbiBzdHJvbmcgc3R5bGUgc3ViIHN1bW1hcnkgc3VwIHRhYmxlIHRib2R5IHRkIHRleHRhcmVhIHRmb290IHRoIHRoZWFkIHRpbWUgdGl0bGUgdHIgdHJhY2sgdSB1bCB2YXIgdmlkZW8gd2JyXCIuc3BsaXQoXCIgXCIpXG5IVE1MX1RBR1NfVU5TQUZFID0gXCJhcnRpY2xlIGFzaWRlIGhlYWRlciBzZWN0aW9uXCIuc3BsaXQoXCIgXCIpXG5TVkdfVEFHUyA9IFwiY2lyY2xlIGRlZnMgZWxsaXBzZSBnIGxpbmUgbGluZWFyR3JhZGllbnQgbWFzayBwYXRoIHBhdHRlcm4gcG9seWdvbiBwb2x5bGluZSByYWRpYWxHcmFkaWVudCByZWN0IHN0b3Agc3ZnIHRleHQgdHNwYW5cIi5zcGxpdChcIiBcIilcblxuXG5kZWYgZXh0ZW5kZXIgb2JqLCBzdXBcblx0Zm9yIG93biBrLHYgb2Ygc3VwXG5cdFx0b2JqW2tdID89IHZcblxuXHRvYmo6cHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXA6cHJvdG90eXBlKVxuXHRvYmo6X19zdXBlcl9fID0gb2JqOnByb3RvdHlwZTpfX3N1cGVyX18gPSBzdXA6cHJvdG90eXBlXG5cdG9iajpwcm90b3R5cGU6aW5pdGlhbGl6ZSA9IG9iajpwcm90b3R5cGU6Y29uc3RydWN0b3IgPSBvYmpcblx0c3VwLmluaGVyaXQob2JqKSBpZiBzdXA6aW5oZXJpdFxuXHRyZXR1cm4gb2JqXG5cbmRlZiBUYWdcblx0cmV0dXJuIGRvIHxkb218XG5cdFx0dGhpcy5zZXREb20oZG9tKVxuXHRcdHJldHVybiB0aGlzXG5cbmRlZiBUYWdTcGF3bmVyIHR5cGVcblx0cmV0dXJuIGRvIHR5cGUuYnVpbGRcblxuY2xhc3MgSW1iYS5UYWdzXG5cblx0ZGVmIGluaXRpYWxpemVcblx0XHRzZWxmXG5cblx0ZGVmIF9fY2xvbmUgbnNcblx0XHR2YXIgY2xvbmUgPSBPYmplY3QuY3JlYXRlKHNlbGYpXG5cdFx0Y2xvbmUuQHBhcmVudCA9IHNlbGZcblx0XHRyZXR1cm4gY2xvbmVcblxuXHRkZWYgZGVmaW5lTmFtZXNwYWNlIG5hbWVcblx0XHR2YXIgY2xvbmUgPSBPYmplY3QuY3JlYXRlKHNlbGYpXG5cdFx0Y2xvbmUuQHBhcmVudCA9IHNlbGZcblx0XHRjbG9uZS5AbnMgPSBuYW1lXG5cdFx0c2VsZltuYW1lLnRvVXBwZXJDYXNlXSA9IGNsb25lXG5cdFx0cmV0dXJuIGNsb25lXG5cblx0ZGVmIGJhc2VUeXBlIG5hbWVcblx0XHRuYW1lIGluIEhUTUxfVEFHUyA/ICdodG1sZWxlbWVudCcgOiAnZGl2J1xuXG5cdGRlZiBkZWZpbmVUYWcgbmFtZSwgc3VwciA9ICcnLCAmYm9keVxuXHRcdHN1cHIgfHw9IGJhc2VUeXBlKG5hbWUpXG5cdFx0bGV0IHN1cGVydHlwZSA9IHNlbGZbc3Vwcl1cblx0XHRsZXQgdGFndHlwZSA9IFRhZygpXG5cdFx0bGV0IG5vcm0gPSBuYW1lLnJlcGxhY2UoL1xcLS9nLCdfJylcblxuXG5cdFx0dGFndHlwZS5AbmFtZSA9IG5hbWVcblx0XHRleHRlbmRlcih0YWd0eXBlLHN1cGVydHlwZSlcblxuXHRcdGlmIG5hbWVbMF0gPT0gJyMnXG5cdFx0XHRzZWxmW25hbWVdID0gdGFndHlwZVxuXHRcdFx0SW1iYS5TSU5HTEVUT05TW25hbWUuc2xpY2UoMSldID0gdGFndHlwZVxuXHRcdGVsc2Vcblx0XHRcdHNlbGZbbmFtZV0gPSB0YWd0eXBlXG5cdFx0XHRzZWxmWyckJytub3JtXSA9IFRhZ1NwYXduZXIodGFndHlwZSlcblxuXHRcdGlmIGJvZHlcblx0XHRcdGlmIGJvZHk6bGVuZ3RoID09IDJcblx0XHRcdFx0IyBjcmVhdGUgY2xvbmVcblx0XHRcdFx0dW5sZXNzIHRhZ3R5cGUuaGFzT3duUHJvcGVydHkoJ1RBR1MnKVxuXHRcdFx0XHRcdHRhZ3R5cGUuVEFHUyA9IChzdXBlcnR5cGUuVEFHUyBvciBzZWxmKS5fX2Nsb25lXG5cblx0XHRcdGJvZHkuY2FsbCh0YWd0eXBlLHRhZ3R5cGUsIHRhZ3R5cGUuVEFHUyBvciBzZWxmKVxuXG5cdFx0cmV0dXJuIHRhZ3R5cGVcblxuXHRkZWYgZGVmaW5lU2luZ2xldG9uIG5hbWUsIHN1cHIsICZib2R5XG5cdFx0ZGVmaW5lVGFnKG5hbWUsc3Vwcixib2R5KVxuXG5cdGRlZiBleHRlbmRUYWcgbmFtZSwgc3VwciA9ICcnLCAmYm9keVxuXHRcdHZhciBrbGFzcyA9IChuYW1lIGlzYSBTdHJpbmcgPyBzZWxmW25hbWVdIDogbmFtZSlcblx0XHQjIGFsbG93IGZvciBwcml2YXRlIHRhZ3MgaGVyZSBhcyB3ZWxsP1xuXHRcdGJvZHkgYW5kIGJvZHkuY2FsbChrbGFzcyxrbGFzcyxrbGFzczpwcm90b3R5cGUpIGlmIGJvZHlcblx0XHRyZXR1cm4ga2xhc3NcblxuXG5JbWJhLlRBR1MgPSBJbWJhLlRhZ3MubmV3XG5JbWJhLlRBR1NbOmVsZW1lbnRdID0gSW1iYS5UYWdcblxudmFyIHN2ZyA9IEltYmEuVEFHUy5kZWZpbmVOYW1lc3BhY2UoJ3N2ZycpXG5cbmRlZiBzdmcuYmFzZVR5cGUgbmFtZVxuXHQnc3ZnZWxlbWVudCdcblxuXG5JbWJhLlNJTkdMRVRPTlMgPSB7fVxuXG5cbmRlZiBJbWJhLmRlZmluZVRhZyBuYW1lLCBzdXByID0gJycsICZib2R5XG5cdHJldHVybiBJbWJhLlRBR1MuZGVmaW5lVGFnKG5hbWUsc3Vwcixib2R5KVxuXG5kZWYgSW1iYS5kZWZpbmVTaW5nbGV0b25UYWcgaWQsIHN1cHIgPSAnZGl2JywgJmJvZHlcblx0cmV0dXJuIEltYmEuVEFHUy5kZWZpbmVUYWcobmFtZSxzdXByLGJvZHkpXG5cbmRlZiBJbWJhLmV4dGVuZFRhZyBuYW1lLCBib2R5XG5cdHJldHVybiBJbWJhLlRBR1MuZXh0ZW5kVGFnKG5hbWUsYm9keSlcblxuZGVmIEltYmEudGFnIG5hbWVcblx0dmFyIHR5cCA9IEltYmEuVEFHU1tuYW1lXVxuXHR0aHJvdyBFcnJvci5uZXcoXCJ0YWcge25hbWV9IGlzIG5vdCBkZWZpbmVkXCIpIGlmICF0eXBcblx0cmV0dXJuIHR5cC5uZXcodHlwLmNyZWF0ZU5vZGUpXG5cbmRlZiBJbWJhLnRhZ1dpdGhJZCBuYW1lLCBpZFxuXHR2YXIgdHlwID0gSW1iYS5UQUdTW25hbWVdXG5cdHRocm93IEVycm9yLm5ldyhcInRhZyB7bmFtZX0gaXMgbm90IGRlZmluZWRcIikgaWYgIXR5cFxuXHR2YXIgZG9tID0gdHlwLmNyZWF0ZU5vZGVcblx0ZG9tOmlkID0gaWRcblx0cmV0dXJuIHR5cC5uZXcoZG9tKVxuXG4jIFRPRE86IENhbiB3ZSBtb3ZlIHRoZXNlIG91dCBhbmQgaW50byBkb20uaW1iYSBpbiBhIGNsZWFuIHdheT9cbiMgVGhlc2UgbWV0aG9kcyBkZXBlbmRzIG9uIEltYmEuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWRcblxuZGVmIEltYmEuZ2V0VGFnU2luZ2xldG9uIGlkXHRcblx0dmFyIGRvbSwgbm9kZVxuXG5cdGlmIHZhciBrbGFzcyA9IEltYmEuU0lOR0xFVE9OU1tpZF1cblx0XHRyZXR1cm4ga2xhc3MuSW5zdGFuY2UgaWYga2xhc3MgYW5kIGtsYXNzLkluc3RhbmNlIFxuXG5cdFx0IyBubyBpbnN0YW5jZSAtIGNoZWNrIGZvciBlbGVtZW50XG5cdFx0aWYgZG9tID0gSW1iYS5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcblx0XHRcdCMgd2UgaGF2ZSBhIGxpdmUgaW5zdGFuY2UgLSB3aGVuIGZpbmRpbmcgaXQgdGhyb3VnaCBhIHNlbGVjdG9yIHdlIHNob3VsZCBhd2FrZSBpdCwgbm8/XG5cdFx0XHQjIGNvbnNvbGUubG9nKCdjcmVhdGluZyB0aGUgc2luZ2xldG9uIGZyb20gZXhpc3Rpbmcgbm9kZSBpbiBkb20/JyxpZCx0eXBlKVxuXHRcdFx0bm9kZSA9IGtsYXNzLkluc3RhbmNlID0ga2xhc3MubmV3KGRvbSlcblx0XHRcdG5vZGUuYXdha2VuKGRvbSkgIyBzaG91bGQgb25seSBhd2FrZW5cblx0XHRcdHJldHVybiBub2RlXG5cblx0XHRkb20gPSBrbGFzcy5jcmVhdGVOb2RlXG5cdFx0ZG9tOmlkID0gaWRcblx0XHRub2RlID0ga2xhc3MuSW5zdGFuY2UgPSBrbGFzcy5uZXcoZG9tKVxuXHRcdG5vZGUuZW5kLmF3YWtlbihkb20pXG5cdFx0cmV0dXJuIG5vZGVcblx0ZWxpZiBkb20gPSBJbWJhLmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxuXHRcdHJldHVybiBJbWJhLmdldFRhZ0ZvckRvbShkb20pXG5cbnZhciBzdmdTdXBwb3J0ID0gdHlwZW9mIFNWR0VsZW1lbnQgIT09ICd1bmRlZmluZWQnXG5cbmRlZiBJbWJhLmdldFRhZ0ZvckRvbSBkb21cblx0cmV0dXJuIG51bGwgdW5sZXNzIGRvbVxuXHRyZXR1cm4gZG9tIGlmIGRvbS5AZG9tICMgY291bGQgdXNlIGluaGVyaXRhbmNlIGluc3RlYWRcblx0cmV0dXJuIGRvbS5AdGFnIGlmIGRvbS5AdGFnXG5cdHJldHVybiBudWxsIHVubGVzcyBkb206bm9kZU5hbWVcblxuXHR2YXIgbnMgICA9IG51bGxcblx0dmFyIGlkICAgPSBkb206aWRcblx0dmFyIHR5cGUgPSBkb206bm9kZU5hbWUudG9Mb3dlckNhc2Vcblx0dmFyIHRhZ3MgPSBJbWJhLlRBR1Ncblx0dmFyIG5hdGl2ZSA9IHR5cGVcblx0dmFyIGNscyAgPSBkb206Y2xhc3NOYW1lXG5cblx0aWYgaWQgYW5kIEltYmEuU0lOR0xFVE9OU1tpZF1cblx0XHQjIEZJWE1FIGNvbnRyb2wgdGhhdCBpdCBpcyB0aGUgc2FtZSBzaW5nbGV0b24/XG5cdFx0IyBtaWdodCBjb2xsaWRlIC0tIG5vdCBnb29kP1xuXHRcdHJldHVybiBJbWJhLmdldFRhZ1NpbmdsZXRvbihpZClcblx0IyBsb29rIGZvciBpZCAtIHNpbmdsZXRvblxuXG5cdCMgbmVlZCBiZXR0ZXIgdGVzdCBoZXJlXG5cdGlmIHN2Z1N1cHBvcnQgYW5kIGRvbSBpc2EgU1ZHRWxlbWVudFxuXHRcdG5zID0gXCJzdmdcIiBcblx0XHRjbHMgPSBkb206Y2xhc3NOYW1lOmJhc2VWYWxcblx0XHR0YWdzID0gdGFncy5TVkdcblxuXHR2YXIgc3Bhd25lclxuXG5cdGlmIGNsc1xuXHRcdCMgdGhlcmUgY2FuIGJlIHNldmVyYWwgbWF0Y2hlcyBoZXJlIC0gc2hvdWxkIGNob29zZSB0aGUgbGFzdFxuXHRcdCMgc2hvdWxkIGZhbGwgYmFjayB0byBsZXNzIHNwZWNpZmljIGxhdGVyPyAtIG90aGVyd2lzZSB0aGluZ3MgbWF5IGZhaWxcblx0XHQjIFRPRE8gcmV3b3JrIHRoaXNcblx0XHRpZiB2YXIgbSA9IGNscy5tYXRjaCgvXFxiXyhbYS16XFwtXSspXFxiKD8hXFxzKl9bYS16XFwtXSspLylcblx0XHRcdHR5cGUgPSBtWzFdICMgLnJlcGxhY2UoLy0vZywnXycpXG5cblx0XHRpZiBtID0gY2xzLm1hdGNoKC9cXGIoW0EtWlxcLV0rKV9cXGIvKVxuXHRcdFx0bnMgPSBtWzFdXG5cblxuXHRzcGF3bmVyID0gdGFnc1t0eXBlXSBvciB0YWdzW25hdGl2ZV1cblx0c3Bhd25lciA/IHNwYXduZXIubmV3KGRvbSkuYXdha2VuKGRvbSkgOiBudWxsXG5cbnRhZyQgPSBJbWJhLlRBR1NcbnQkID0gSW1iYTp0YWdcbnRjJCA9IEltYmE6dGFnV2l0aEZsYWdzXG50aSQgPSBJbWJhOnRhZ1dpdGhJZFxudGljJCA9IEltYmE6dGFnV2l0aElkQW5kRmxhZ3NcbmlkJCA9IEltYmE6Z2V0VGFnU2luZ2xldG9uXG50YWckd3JhcCA9IEltYmE6Z2V0VGFnRm9yRG9tXG5cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHNyYy9pbWJhL3RhZy5pbWJhXG4gKiovIiwiXG5kZWYgSW1iYS5kb2N1bWVudFxuXHR3aW5kb3c6ZG9jdW1lbnRcblxuIyMjXG5SZXR1cm5zIHRoZSBib2R5IGVsZW1lbnQgd3JhcHBlZCBpbiBhbiBJbWJhLlRhZ1xuIyMjXG5kZWYgSW1iYS5yb290XG5cdHRhZyhJbWJhLmRvY3VtZW50OmJvZHkpXG5cbnRhZyBodG1sZWxlbWVudCA8IGVsZW1lbnRcblxuXHQjIyNcblx0Q2FsbGVkIHdoZW4gYSB0YWcgdHlwZSBpcyBiZWluZyBzdWJjbGFzc2VkLlxuXHQjIyNcblx0ZGVmIHNlbGYuaW5oZXJpdCBjaGlsZFxuXHRcdGNoaWxkOnByb3RvdHlwZS5AZW1wdHkgPSB5ZXNcblx0XHRjaGlsZC5AcHJvdG9Eb20gPSBudWxsXG5cblx0XHRpZiBAbm9kZVR5cGVcblx0XHRcdGNoaWxkLkBub2RlVHlwZSA9IEBub2RlVHlwZVxuXG5cdFx0XHR2YXIgY2xhc3NOYW1lID0gXCJfXCIgKyBjaGlsZC5AbmFtZS5yZXBsYWNlKC9fL2csICctJylcblx0XHRcdGNoaWxkLkBjbGFzc2VzID0gQGNsYXNzZXMuY29uY2F0KGNsYXNzTmFtZSkgdW5sZXNzIGNoaWxkLkBuYW1lWzBdID09ICcjJ1xuXHRcdGVsc2Vcblx0XHRcdGNoaWxkLkBub2RlVHlwZSA9IGNoaWxkLkBuYW1lXG5cdFx0XHRjaGlsZC5AY2xhc3NlcyA9IFtdXG5cblx0ZGVmIHNlbGYuYnVpbGROb2RlXG5cdFx0dmFyIGRvbSA9IEltYmEuZG9jdW1lbnQuY3JlYXRlRWxlbWVudChAbm9kZVR5cGUpXG5cdFx0dmFyIGNscyA9IEBjbGFzc2VzLmpvaW4oXCIgXCIpXG5cdFx0ZG9tOmNsYXNzTmFtZSA9IGNscyBpZiBjbHNcblx0XHRkb21cblxuXHRkZWYgc2VsZi5jcmVhdGVOb2RlXG5cdFx0dmFyIHByb3RvID0gKEBwcm90b0RvbSB8fD0gYnVpbGROb2RlKVxuXHRcdHByb3RvLmNsb25lTm9kZShmYWxzZSlcblxuXHRkZWYgc2VsZi5kb21cblx0XHRAcHJvdG9Eb20gfHw9IGJ1aWxkTm9kZVxuXG5cdGF0dHIgaWRcblx0YXR0ciB0YWJpbmRleFxuXHRhdHRyIHRpdGxlXG5cdGF0dHIgcm9sZVxuXG5cdGRlZiB3aWR0aFxuXHRcdEBkb206b2Zmc2V0V2lkdGhcblxuXHRkZWYgaGVpZ2h0XG5cdFx0QGRvbTpvZmZzZXRIZWlnaHRcblxuXHRkZWYgc2V0Q2hpbGRyZW4gbm9kZXMsIHR5cGVcblx0XHRAZW1wdHkgPyBhcHBlbmQobm9kZXMpIDogZW1wdHkuYXBwZW5kKG5vZGVzKVxuXHRcdEBjaGlsZHJlbiA9IG51bGxcblx0XHRzZWxmXG5cblx0IyMjXG5cdFNldCBpbm5lciBodG1sIG9mIG5vZGVcblx0IyMjXG5cdGRlZiBodG1sPSBodG1sXG5cdFx0QGRvbTppbm5lckhUTUwgPSBodG1sXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRHZXQgaW5uZXIgaHRtbCBvZiBub2RlXG5cdCMjI1xuXHRkZWYgaHRtbFxuXHRcdEBkb206aW5uZXJIVE1MXG5cblx0IyMjXG5cdFJlbW92ZSBhbGwgY29udGVudCBpbnNpZGUgbm9kZVxuXHQjIyNcblx0ZGVmIGVtcHR5XG5cdFx0QGRvbS5yZW1vdmVDaGlsZChAZG9tOmZpcnN0Q2hpbGQpIHdoaWxlIEBkb206Zmlyc3RDaGlsZFxuXHRcdEBjaGlsZHJlbiA9IG51bGxcblx0XHRAZW1wdHkgPSB5ZXNcblx0XHRzZWxmXG5cblx0IyMjXG5cdFJlbW92ZSBzcGVjaWZpZWQgY2hpbGQgZnJvbSBjdXJyZW50IG5vZGUuXG5cdCMjI1xuXHRkZWYgcmVtb3ZlIGNoaWxkXG5cdFx0dmFyIHBhciA9IGRvbVxuXHRcdHZhciBlbCA9IGNoaWxkIGFuZCBjaGlsZC5kb21cblx0XHRwYXIucmVtb3ZlQ2hpbGQoZWwpIGlmIGVsIGFuZCBlbDpwYXJlbnROb2RlID09IHBhclxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIGVtaXQgbmFtZSwgZGF0YTogbnVsbCwgYnViYmxlOiB5ZXNcblx0XHRJbWJhLkV2ZW50cy50cmlnZ2VyIG5hbWUsIHNlbGYsIGRhdGE6IGRhdGEsIGJ1YmJsZTogYnViYmxlXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgZGF0YXNldCBrZXksIHZhbFxuXHRcdGlmIGtleSBpc2EgT2JqZWN0XG5cdFx0XHRkYXRhc2V0KGssdikgZm9yIG93biBrLHYgb2Yga2V5XG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0aWYgYXJndW1lbnRzOmxlbmd0aCA9PSAyXG5cdFx0XHRzZXRBdHRyaWJ1dGUoXCJkYXRhLXtrZXl9XCIsdmFsKVxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdGlmIGtleVxuXHRcdFx0cmV0dXJuIGdldEF0dHJpYnV0ZShcImRhdGEte2tleX1cIilcblxuXHRcdHZhciBkYXRhc2V0ID0gZG9tOmRhdGFzZXRcblxuXHRcdHVubGVzcyBkYXRhc2V0XG5cdFx0XHRkYXRhc2V0ID0ge31cblx0XHRcdGZvciBhdHIsaSBpbiBkb206YXR0cmlidXRlc1xuXHRcdFx0XHRpZiBhdHI6bmFtZS5zdWJzdHIoMCw1KSA9PSAnZGF0YS0nXG5cdFx0XHRcdFx0ZGF0YXNldFtJbWJhLnRvQ2FtZWxDYXNlKGF0cjpuYW1lLnNsaWNlKDUpKV0gPSBhdHI6dmFsdWVcblxuXHRcdHJldHVybiBkYXRhc2V0XG5cblx0IyMjXG5cdEdldCBkZXNjZW5kYW50cyBvZiBjdXJyZW50IG5vZGUsIG9wdGlvbmFsbHkgbWF0Y2hpbmcgc2VsZWN0b3Jcblx0QHJldHVybiB7SW1iYS5TZWxlY3Rvcn1cblx0IyMjXG5cdGRlZiBmaW5kIHNlbFxuXHRcdEltYmEuU2VsZWN0b3IubmV3KHNlbCxzZWxmKVxuXG5cdCMjI1xuXHRHZXQgdGhlIGZpcnN0IG1hdGNoaW5nIGNoaWxkIG9mIG5vZGVcblxuXHRAcmV0dXJuIHtJbWJhLlRhZ31cblx0IyMjXG5cdGRlZiBmaXJzdCBzZWxcblx0XHRzZWwgPyBmaW5kKHNlbCkuZmlyc3QgOiB0YWcoZG9tOmZpcnN0RWxlbWVudENoaWxkKVxuXG5cdCMjI1xuXHRHZXQgdGhlIGxhc3QgbWF0Y2hpbmcgY2hpbGQgb2Ygbm9kZVxuXG5cdFx0bm9kZS5sYXN0ICMgcmV0dXJucyB0aGUgbGFzdCBjaGlsZCBvZiBub2RlXG5cdFx0bm9kZS5sYXN0ICVzcGFuICMgcmV0dXJucyB0aGUgbGFzdCBzcGFuIGluc2lkZSBub2RlXG5cdFx0bm9kZS5sYXN0IGRvIHxlbHwgZWwudGV4dCA9PSAnSGknICMgcmV0dXJuIGxhc3Qgbm9kZSB3aXRoIHRleHQgSGlcblxuXHRAcmV0dXJuIHtJbWJhLlRhZ31cblx0IyMjXG5cdGRlZiBsYXN0IHNlbFxuXHRcdHNlbCA/IGZpbmQoc2VsKS5sYXN0IDogdGFnKGRvbTpsYXN0RWxlbWVudENoaWxkKVxuXG5cdCMjI1xuXHRHZXQgdGhlIGNoaWxkIGF0IGluZGV4XG5cdCMjI1xuXHRkZWYgY2hpbGQgaVxuXHRcdHRhZyhkb206Y2hpbGRyZW5baSBvciAwXSlcblxuXHRkZWYgY2hpbGRyZW4gc2VsXG5cdFx0dmFyIG5vZGVzID0gSW1iYS5TZWxlY3Rvci5uZXcobnVsbCwgc2VsZiwgQGRvbTpjaGlsZHJlbilcblx0XHRzZWwgPyBub2Rlcy5maWx0ZXIoc2VsKSA6IG5vZGVzXG5cdFxuXHRkZWYgb3JwaGFuaXplXG5cdFx0cGFyLnJlbW92ZUNoaWxkKEBkb20pIGlmIGxldCBwYXIgPSBkb206cGFyZW50Tm9kZVxuXHRcdHJldHVybiBzZWxmXG5cdFxuXHRkZWYgbWF0Y2hlcyBzZWxcblx0XHRpZiBzZWwgaXNhIEZ1bmN0aW9uXG5cdFx0XHRyZXR1cm4gc2VsKHNlbGYpXG5cblx0XHRzZWwgPSBzZWwucXVlcnkgaWYgc2VsOnF1ZXJ5XG5cdFx0aWYgdmFyIGZuID0gKEBkb206bWF0Y2hlcyBvciBAZG9tOm1hdGNoZXNTZWxlY3RvciBvciBAZG9tOndlYmtpdE1hdGNoZXNTZWxlY3RvciBvciBAZG9tOm1zTWF0Y2hlc1NlbGVjdG9yIG9yIEBkb206bW96TWF0Y2hlc1NlbGVjdG9yKVxuXHRcdFx0cmV0dXJuIGZuLmNhbGwoQGRvbSxzZWwpXG5cblx0IyMjXG5cdEdldCB0aGUgZmlyc3QgZWxlbWVudCBtYXRjaGluZyBzdXBwbGllZCBzZWxlY3RvciAvIGZpbHRlclxuXHR0cmF2ZXJzaW5nIHVwd2FyZHMsIGJ1dCBpbmNsdWRpbmcgdGhlIG5vZGUgaXRzZWxmLlxuXHRAcmV0dXJuIHtJbWJhLlRhZ31cblx0IyMjXG5cdGRlZiBjbG9zZXN0IHNlbFxuXHRcdHJldHVybiBwYXJlbnQgdW5sZXNzIHNlbCAjIHNob3VsZCByZXR1cm4gc2VsZj8hXG5cdFx0dmFyIG5vZGUgPSBzZWxmXG5cdFx0c2VsID0gc2VsLnF1ZXJ5IGlmIHNlbDpxdWVyeVxuXG5cdFx0d2hpbGUgbm9kZVxuXHRcdFx0cmV0dXJuIG5vZGUgaWYgbm9kZS5tYXRjaGVzKHNlbClcblx0XHRcdG5vZGUgPSBub2RlLnBhcmVudFxuXHRcdHJldHVybiBudWxsXG5cblx0IyMjXG5cdEdldCB0aGUgY2xvc2VzdCBhbmNlc3RvciBvZiBub2RlIHRoYXQgbWF0Y2hlc1xuXHRzcGVjaWZpZWQgc2VsZWN0b3IgLyBtYXRjaGVyLlxuXG5cdEByZXR1cm4ge0ltYmEuVGFnfVxuXHQjIyNcblx0ZGVmIHVwIHNlbFxuXHRcdHJldHVybiBwYXJlbnQgdW5sZXNzIHNlbFxuXHRcdHBhcmVudCBhbmQgcGFyZW50LmNsb3Nlc3Qoc2VsKVxuXG5cdGRlZiBwYXRoIHNlbFxuXHRcdHZhciBub2RlID0gc2VsZlxuXHRcdHZhciBub2RlcyA9IFtdXG5cdFx0c2VsID0gc2VsLnF1ZXJ5IGlmIHNlbCBhbmQgc2VsOnF1ZXJ5XG5cblx0XHR3aGlsZSBub2RlXG5cdFx0XHRub2Rlcy5wdXNoKG5vZGUpIGlmICFzZWwgb3Igbm9kZS5tYXRjaGVzKHNlbClcblx0XHRcdG5vZGUgPSBub2RlLnBhcmVudFxuXHRcdHJldHVybiBub2Rlc1xuXG5cdGRlZiBwYXJlbnRzIHNlbFxuXHRcdHZhciBwYXIgPSBwYXJlbnRcblx0XHRwYXIgPyBwYXIucGF0aChzZWwpIDogW11cblxuXHRcblxuXHRkZWYgc2libGluZ3Mgc2VsXG5cdFx0cmV0dXJuIFtdIHVubGVzcyB2YXIgcGFyID0gcGFyZW50ICMgRklYTUVcblx0XHR2YXIgYXJ5ID0gZG9tOnBhcmVudE5vZGU6Y2hpbGRyZW5cblx0XHR2YXIgbm9kZXMgPSBJbWJhLlNlbGVjdG9yLm5ldyhudWxsLCBzZWxmLCBhcnkpXG5cdFx0bm9kZXMuZmlsdGVyKHxufCBuICE9IHNlbGYgJiYgKCFzZWwgfHwgbi5tYXRjaGVzKHNlbCkpKVxuXG5cdCMjI1xuXHRHZXQgdGhlIGltbWVkaWF0ZWx5IGZvbGxvd2luZyBzaWJsaW5nIG9mIG5vZGUuXG5cdCMjI1xuXHRkZWYgbmV4dCBzZWxcblx0XHRpZiBzZWxcblx0XHRcdHZhciBlbCA9IHNlbGZcblx0XHRcdHdoaWxlIGVsID0gZWwubmV4dFxuXHRcdFx0XHRyZXR1cm4gZWwgaWYgZWwubWF0Y2hlcyhzZWwpXG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdHRhZyhkb206bmV4dEVsZW1lbnRTaWJsaW5nKVxuXG5cdCMjI1xuXHRHZXQgdGhlIGltbWVkaWF0ZWx5IHByZWNlZWRpbmcgc2libGluZyBvZiBub2RlLlxuXHQjIyNcblx0ZGVmIHByZXYgc2VsXG5cdFx0aWYgc2VsXG5cdFx0XHR2YXIgZWwgPSBzZWxmXG5cdFx0XHR3aGlsZSBlbCA9IGVsLnByZXZcblx0XHRcdFx0cmV0dXJuIGVsIGlmIGVsLm1hdGNoZXMoc2VsKVxuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR0YWcoZG9tOnByZXZpb3VzRWxlbWVudFNpYmxpbmcpXG5cblx0ZGVmIGNvbnRhaW5zIG5vZGVcblx0XHRkb20uY29udGFpbnMobm9kZSBhbmQgbm9kZS5AZG9tIG9yIG5vZGUpXG5cblx0ZGVmIGluZGV4XG5cdFx0dmFyIGkgPSAwXG5cdFx0dmFyIGVsID0gZG9tXG5cdFx0d2hpbGUgZWw6cHJldmlvdXNTaWJsaW5nXG5cdFx0XHRlbCA9IGVsOnByZXZpb3VzU2libGluZ1xuXHRcdFx0aSsrXG5cdFx0cmV0dXJuIGlcblxuXG5cdCMjI1xuXHRcblx0QGRlcHJlY2F0ZWRcblx0IyMjXG5cdGRlZiBpbnNlcnQgbm9kZSwgYmVmb3JlOiBudWxsLCBhZnRlcjogbnVsbFxuXHRcdGJlZm9yZSA9IGFmdGVyLm5leHQgaWYgYWZ0ZXJcblx0XHRpZiBub2RlIGlzYSBBcnJheVxuXHRcdFx0bm9kZSA9ICg8ZnJhZ21lbnQ+IG5vZGUpXG5cdFx0aWYgYmVmb3JlXG5cdFx0XHRkb20uaW5zZXJ0QmVmb3JlKG5vZGUuZG9tLGJlZm9yZS5kb20pXG5cdFx0ZWxzZVxuXHRcdFx0YXBwZW5kKG5vZGUpXG5cdFx0c2VsZlx0XG5cblx0IyMjXG5cdEZvY3VzIG9uIGN1cnJlbnQgbm9kZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGZvY3VzXG5cdFx0ZG9tLmZvY3VzXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRSZW1vdmUgZm9jdXMgZnJvbSBjdXJyZW50IG5vZGVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBibHVyXG5cdFx0ZG9tLmJsdXJcblx0XHRzZWxmXG5cblx0ZGVmIHRlbXBsYXRlXG5cdFx0bnVsbFxuXG5cdCMjI1xuXHRAdG9kbyBTaG91bGQgc3VwcG9ydCBtdWx0aXBsZSBhcmd1bWVudHMgbGlrZSBhcHBlbmRcblxuXHRUaGUgLnByZXBlbmQgbWV0aG9kIGluc2VydHMgdGhlIHNwZWNpZmllZCBjb250ZW50IGFzIHRoZSBmaXJzdFxuXHRjaGlsZCBvZiB0aGUgdGFyZ2V0IG5vZGUuIElmIHRoZSBjb250ZW50IGlzIGFscmVhZHkgYSBjaGlsZCBvZiBcblx0bm9kZSBpdCB3aWxsIGJlIG1vdmVkIHRvIHRoZSBzdGFydC5cblx0XG4gICAgXHRub2RlLnByZXBlbmQgPGRpdi50b3A+ICMgcHJlcGVuZCBub2RlXG4gICAgXHRub2RlLnByZXBlbmQgXCJzb21lIHRleHRcIiAjIHByZXBlbmQgdGV4dFxuICAgIFx0bm9kZS5wcmVwZW5kIFs8dWw+LDx1bD5dICMgcHJlcGVuZCBhcnJheVxuXG5cdCMjI1xuXHRkZWYgcHJlcGVuZCBpdGVtXG5cdFx0dmFyIGZpcnN0ID0gQGRvbTpjaGlsZE5vZGVzWzBdXG5cdFx0Zmlyc3QgPyBpbnNlcnRCZWZvcmUoaXRlbSwgZmlyc3QpIDogYXBwZW5kQ2hpbGQoaXRlbSlcblx0XHRzZWxmXG5cblx0IyMjXG5cdFRoZSAuYXBwZW5kIG1ldGhvZCBpbnNlcnRzIHRoZSBzcGVjaWZpZWQgY29udGVudCBhcyB0aGUgbGFzdCBjaGlsZFxuXHRvZiB0aGUgdGFyZ2V0IG5vZGUuIElmIHRoZSBjb250ZW50IGlzIGFscmVhZHkgYSBjaGlsZCBvZiBub2RlIGl0XG5cdHdpbGwgYmUgbW92ZWQgdG8gdGhlIGVuZC5cblx0XG5cdCMgZXhhbXBsZVxuXHQgICAgdmFyIHJvb3QgPSA8ZGl2LnJvb3Q+XG5cdCAgICB2YXIgaXRlbSA9IDxkaXYuaXRlbT4gXCJUaGlzIGlzIGFuIGl0ZW1cIlxuXHQgICAgcm9vdC5hcHBlbmQgaXRlbSAjIGFwcGVuZHMgaXRlbSB0byB0aGUgZW5kIG9mIHJvb3RcblxuXHQgICAgcm9vdC5wcmVwZW5kIFwic29tZSB0ZXh0XCIgIyBhcHBlbmQgdGV4dFxuXHQgICAgcm9vdC5wcmVwZW5kIFs8dWw+LDx1bD5dICMgYXBwZW5kIGFycmF5XG5cdCMjI1xuXHRkZWYgYXBwZW5kIGl0ZW1cblx0XHQjIHBvc3NpYmxlIHRvIGFwcGVuZCBibGFua1xuXHRcdCMgcG9zc2libGUgdG8gc2ltcGxpZnkgb24gc2VydmVyP1xuXHRcdHJldHVybiBzZWxmIHVubGVzcyBpdGVtXG5cblx0XHRpZiBpdGVtIGlzYSBBcnJheVxuXHRcdFx0bWVtYmVyICYmIGFwcGVuZChtZW1iZXIpIGZvciBtZW1iZXIgaW4gaXRlbVxuXG5cdFx0ZWxpZiBpdGVtIGlzYSBTdHJpbmcgb3IgaXRlbSBpc2EgTnVtYmVyXG5cdFx0XHR2YXIgbm9kZSA9IEltYmEuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoaXRlbSlcblx0XHRcdEBkb20uYXBwZW5kQ2hpbGQobm9kZSlcblx0XHRcdEBlbXB0eSA9IG5vIGlmIEBlbXB0eVx0XHRcdFxuXHRcdGVsc2Vcblx0XHRcdEBkb20uYXBwZW5kQ2hpbGQoaXRlbS5AZG9tIG9yIGl0ZW0pXG5cdFx0XHRAZW1wdHkgPSBubyBpZiBAZW1wdHlcblxuXHRcdHJldHVybiBzZWxmXG5cblx0IyMjXG5cdEluc2VydCBhIG5vZGUgaW50byB0aGUgY3VycmVudCBub2RlIChzZWxmKSwgYmVmb3JlIGFub3RoZXIuXG5cdFRoZSByZWxhdGl2ZSBub2RlIG11c3QgYmUgYSBjaGlsZCBvZiBjdXJyZW50IG5vZGUuIFxuXHQjIyNcblx0ZGVmIGluc2VydEJlZm9yZSBub2RlLCByZWxcblx0XHRub2RlID0gSW1iYS5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShub2RlKSBpZiBub2RlIGlzYSBTdHJpbmcgXG5cdFx0ZG9tLmluc2VydEJlZm9yZSggKG5vZGUuQGRvbSBvciBub2RlKSwgKHJlbC5AZG9tIG9yIHJlbCkgKSBpZiBub2RlIGFuZCByZWxcblx0XHRzZWxmXG5cblx0IyMjXG5cdEFwcGVuZCBhIHNpbmdsZSBpdGVtIChub2RlIG9yIHN0cmluZykgdG8gdGhlIGN1cnJlbnQgbm9kZS5cblx0SWYgc3VwcGxpZWQgaXRlbSBpcyBhIHN0cmluZyBpdCB3aWxsIGF1dG9tYXRpY2FsbHkuIFRoaXMgaXMgdXNlZFxuXHRieSBJbWJhIGludGVybmFsbHksIGJ1dCB3aWxsIHByYWN0aWNhbGx5IG5ldmVyIGJlIHVzZWQgZXhwbGljaXRseS5cblx0IyMjXG5cdGRlZiBhcHBlbmRDaGlsZCBub2RlXG5cdFx0bm9kZSA9IEltYmEuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobm9kZSkgaWYgbm9kZSBpc2EgU3RyaW5nXG5cdFx0ZG9tLmFwcGVuZENoaWxkKG5vZGUuQGRvbSBvciBub2RlKSBpZiBub2RlXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRSZW1vdmUgYSBzaW5nbGUgY2hpbGQgZnJvbSB0aGUgY3VycmVudCBub2RlLlxuXHRVc2VkIGJ5IEltYmEgaW50ZXJuYWxseS5cblx0IyMjXG5cdGRlZiByZW1vdmVDaGlsZCBub2RlXG5cdFx0ZG9tLnJlbW92ZUNoaWxkKG5vZGUuQGRvbSBvciBub2RlKSBpZiBub2RlXG5cdFx0c2VsZlxuXG5cdGRlZiB0b1N0cmluZ1xuXHRcdEBkb20udG9TdHJpbmcgIyByZWFsbHk/XG5cblx0IyMjXG5cdEBkZXByZWNhdGVkXG5cdCMjI1xuXHRkZWYgY2xhc3Nlc1xuXHRcdGNvbnNvbGUubG9nICdJbWJhLlRhZyNjbGFzc2VzIGlzIGRlcHJlY2F0ZWQnXG5cdFx0QGRvbTpjbGFzc0xpc3RcblxudGFnIHN2Z2VsZW1lbnQgPCBodG1sZWxlbWVudFxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogc3JjL2ltYmEvZG9tLmltYmFcbiAqKi8iLCIjIEV4dGVuZGluZyBJbWJhLlRhZyNjc3MgdG8gd29yayB3aXRob3V0IHByZWZpeGVzIGJ5IGluc3BlY3RpbmdcbiMgdGhlIHByb3BlcnRpZXMgb2YgYSBDU1NTdHlsZURlY2xhcmF0aW9uIGFuZCBjcmVhdGluZyBhIG1hcFxuXG4jIHZhciBwcmVmaXhlcyA9IFsnLXdlYmtpdC0nLCctbXMtJywnLW1vei0nLCctby0nLCctYmxpbmstJ11cbiMgdmFyIHByb3BzID0gWyd0cmFuc2Zvcm0nLCd0cmFuc2l0aW9uJywnYW5pbWF0aW9uJ11cblxuaWYgSW1iYS5DTElFTlRcblx0dmFyIHN0eWxlcyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50OmRvY3VtZW50RWxlbWVudCwgJycpXG5cblx0SW1iYS5DU1NLZXlNYXAgPSB7fVxuXG5cdGZvciBwcmVmaXhlZCBpbiBzdHlsZXNcblx0XHR2YXIgdW5wcmVmaXhlZCA9IHByZWZpeGVkLnJlcGxhY2UoL14tKHdlYmtpdHxtc3xtb3p8b3xibGluayktLywnJylcblx0XHR2YXIgY2FtZWxDYXNlID0gdW5wcmVmaXhlZC5yZXBsYWNlKC8tKFxcdykvZykgZG8gfG0sYXwgYS50b1VwcGVyQ2FzZVxuXG5cdFx0IyBpZiB0aGVyZSBleGlzdHMgYW4gdW5wcmVmaXhlZCB2ZXJzaW9uIC0tIGFsd2F5cyB1c2UgdGhpc1xuXHRcdGlmIHByZWZpeGVkICE9IHVucHJlZml4ZWRcblx0XHRcdGNvbnRpbnVlIGlmIHN0eWxlcy5oYXNPd25Qcm9wZXJ0eSh1bnByZWZpeGVkKVxuXG5cdFx0IyByZWdpc3RlciB0aGUgcHJlZml4ZXNcblx0XHRJbWJhLkNTU0tleU1hcFt1bnByZWZpeGVkXSA9IEltYmEuQ1NTS2V5TWFwW2NhbWVsQ2FzZV0gPSBwcmVmaXhlZFxuXG5cdGV4dGVuZCB0YWcgZWxlbWVudFxuXG5cdFx0IyBvdmVycmlkZSB0aGUgb3JpZ2luYWwgY3NzIG1ldGhvZFxuXHRcdGRlZiBjc3Mga2V5LCB2YWxcblx0XHRcdGlmIGtleSBpc2EgT2JqZWN0XG5cdFx0XHRcdGNzcyhrLHYpIGZvciBvd24gayx2IG9mIGtleVxuXHRcdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0XHRrZXkgPSBJbWJhLkNTU0tleU1hcFtrZXldIG9yIGtleVxuXG5cdFx0XHRpZiB2YWwgPT0gbnVsbFxuXHRcdFx0XHRkb206c3R5bGUucmVtb3ZlUHJvcGVydHkoa2V5KVxuXHRcdFx0ZWxpZiB2YWwgPT0gdW5kZWZpbmVkXG5cdFx0XHRcdHJldHVybiBkb206c3R5bGVba2V5XVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRpZiB2YWwgaXNhIE51bWJlciBhbmQga2V5Lm1hdGNoKC93aWR0aHxoZWlnaHR8bGVmdHxyaWdodHx0b3B8Ym90dG9tLylcblx0XHRcdFx0XHR2YWwgPSB2YWwgKyBcInB4XCJcblx0XHRcdFx0ZG9tOnN0eWxlW2tleV0gPSB2YWxcblx0XHRcdHNlbGZcblxuXHR5ZXNcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBzcmMvaW1iYS9kb20uY2xpZW50LmltYmFcbiAqKi8iLCJcbiMgcHJlZGVmaW5lIGFsbCBzdXBwb3J0ZWQgaHRtbCB0YWdzXG50YWcgZnJhZ21lbnQgPCBodG1sZWxlbWVudFxuXHRcblx0ZGVmIHNlbGYuY3JlYXRlTm9kZVxuXHRcdEltYmEuZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudFxuXG50YWcgYVxuXHRhdHRyIGhyZWZcblxudGFnIGFiYnJcbnRhZyBhZGRyZXNzXG50YWcgYXJlYVxudGFnIGFydGljbGVcbnRhZyBhc2lkZVxudGFnIGF1ZGlvXG50YWcgYlxudGFnIGJhc2VcbnRhZyBiZGlcbnRhZyBiZG9cbnRhZyBiaWdcbnRhZyBibG9ja3F1b3RlXG50YWcgYm9keVxudGFnIGJyXG5cbnRhZyBidXR0b25cblx0YXR0ciBhdXRvZm9jdXNcblx0YXR0ciB0eXBlXG5cdGF0dHIgZGlzYWJsZWRcblxudGFnIGNhbnZhc1xuXHRkZWYgd2lkdGg9IHZhbFxuXHRcdGRvbTp3aWR0aCA9IHZhbCB1bmxlc3Mgd2lkdGggPT0gdmFsXG5cdFx0c2VsZlxuXG5cdGRlZiBoZWlnaHQ9IHZhbFxuXHRcdGRvbTpoZWlnaHQgPSB2YWwgdW5sZXNzIGhlaWdodCA9PSB2YWxcblx0XHRzZWxmXG5cblx0ZGVmIHdpZHRoXG5cdFx0ZG9tOndpZHRoXG5cblx0ZGVmIGhlaWdodFxuXHRcdGRvbTpoZWlnaHRcblxuXHRkZWYgY29udGV4dCB0eXBlID0gJzJkJ1xuXHRcdGRvbS5nZXRDb250ZXh0KHR5cGUpXG5cbnRhZyBjYXB0aW9uXG50YWcgY2l0ZVxudGFnIGNvZGVcbnRhZyBjb2xcbnRhZyBjb2xncm91cFxudGFnIGRhdGFcbnRhZyBkYXRhbGlzdFxudGFnIGRkXG50YWcgZGVsXG50YWcgZGV0YWlsc1xudGFnIGRmblxudGFnIGRpdlxudGFnIGRsXG50YWcgZHRcbnRhZyBlbVxudGFnIGVtYmVkXG50YWcgZmllbGRzZXRcbnRhZyBmaWdjYXB0aW9uXG50YWcgZmlndXJlXG50YWcgZm9vdGVyXG5cbnRhZyBmb3JtXG5cdGF0dHIgbWV0aG9kXG5cdGF0dHIgYWN0aW9uXG5cbnRhZyBoMVxudGFnIGgyXG50YWcgaDNcbnRhZyBoNFxudGFnIGg1XG50YWcgaDZcbnRhZyBoZWFkXG50YWcgaGVhZGVyXG50YWcgaHJcbnRhZyBodG1sXG50YWcgaVxuXG50YWcgaWZyYW1lXG5cdGF0dHIgc3JjXG5cbnRhZyBpbWdcblx0YXR0ciBzcmNcblxudGFnIGlucHV0XG5cdCMgY2FuIHVzZSBhdHRyIGluc3RlYWRcblx0YXR0ciBuYW1lXG5cdGF0dHIgdHlwZVxuXHRhdHRyIHJlcXVpcmVkXG5cdGF0dHIgZGlzYWJsZWRcblx0YXR0ciBhdXRvZm9jdXNcblxuXHRkZWYgdmFsdWVcblx0XHRkb206dmFsdWVcblxuXHRkZWYgdmFsdWU9IHZcblx0XHRkb206dmFsdWUgPSB2IHVubGVzcyB2ID09IGRvbTp2YWx1ZVxuXHRcdHNlbGZcblxuXHRkZWYgcGxhY2Vob2xkZXI9IHZcblx0XHRkb206cGxhY2Vob2xkZXIgPSB2IHVubGVzcyB2ID09IGRvbTpwbGFjZWhvbGRlclxuXHRcdHNlbGZcblxuXHRkZWYgcGxhY2Vob2xkZXJcblx0XHRkb206cGxhY2Vob2xkZXJcblxuXHRkZWYgY2hlY2tlZFxuXHRcdGRvbTpjaGVja2VkXG5cblx0ZGVmIGNoZWNrZWQ9IGJvb2xcblx0XHRkb206Y2hlY2tlZCA9IGJvb2wgdW5sZXNzIGJvb2wgPT0gZG9tOmNoZWNrZWRcblx0XHRzZWxmXG5cbnRhZyBpbnNcbnRhZyBrYmRcbnRhZyBrZXlnZW5cbnRhZyBsYWJlbFxudGFnIGxlZ2VuZFxudGFnIGxpXG5cbnRhZyBsaW5rXG5cdGF0dHIgcmVsXG5cdGF0dHIgdHlwZVxuXHRhdHRyIGhyZWZcblx0YXR0ciBtZWRpYVxuXG50YWcgbWFpblxudGFnIG1hcFxudGFnIG1hcmtcbnRhZyBtZW51XG50YWcgbWVudWl0ZW1cblxudGFnIG1ldGFcblx0YXR0ciBuYW1lXG5cdGF0dHIgY29udGVudFxuXHRhdHRyIGNoYXJzZXRcblxudGFnIG1ldGVyXG50YWcgbmF2XG50YWcgbm9zY3JpcHRcbnRhZyBvYmplY3RcbnRhZyBvbFxudGFnIG9wdGdyb3VwXG5cbnRhZyBvcHRpb25cblx0YXR0ciB2YWx1ZVxuXG50YWcgb3V0cHV0XG50YWcgcFxudGFnIHBhcmFtXG50YWcgcHJlXG50YWcgcHJvZ3Jlc3NcbnRhZyBxXG50YWcgcnBcbnRhZyBydFxudGFnIHJ1YnlcbnRhZyBzXG50YWcgc2FtcFxuXG50YWcgc2NyaXB0XG5cdGF0dHIgc3JjXG5cdGF0dHIgdHlwZVxuXHRhdHRyIGFzeW5jXG5cdGF0dHIgZGVmZXJcblxudGFnIHNlY3Rpb25cblxudGFnIHNlbGVjdFxuXHRhdHRyIG5hbWVcblx0YXR0ciBtdWx0aXBsZVxuXHRhdHRyIHJlcXVpcmVkXG5cdGF0dHIgZGlzYWJsZWRcblx0XG5cdGRlZiB2YWx1ZVxuXHRcdGRvbTp2YWx1ZVxuXG5cdGRlZiB2YWx1ZT0gdlxuXHRcdGRvbTp2YWx1ZSA9IHYgdW5sZXNzIHYgPT0gZG9tOnZhbHVlXG5cdFx0c2VsZlxuXG5cbnRhZyBzbWFsbFxudGFnIHNvdXJjZVxudGFnIHNwYW5cbnRhZyBzdHJvbmdcbnRhZyBzdHlsZVxudGFnIHN1YlxudGFnIHN1bW1hcnlcbnRhZyBzdXBcbnRhZyB0YWJsZVxudGFnIHRib2R5XG50YWcgdGRcblxudGFnIHRleHRhcmVhXG5cdGF0dHIgbmFtZVxuXHRhdHRyIGRpc2FibGVkXG5cdGF0dHIgcmVxdWlyZWRcblx0YXR0ciByb3dzXG5cdGF0dHIgY29sc1xuXHRhdHRyIGF1dG9mb2N1c1xuXG5cdGRlZiB2YWx1ZVxuXHRcdGRvbTp2YWx1ZVxuXG5cdGRlZiB2YWx1ZT0gdlxuXHRcdGRvbTp2YWx1ZSA9IHYgdW5sZXNzIHYgPT0gZG9tOnZhbHVlXG5cdFx0c2VsZlxuXG5cdGRlZiBwbGFjZWhvbGRlcj0gdlxuXHRcdGRvbTpwbGFjZWhvbGRlciA9IHYgdW5sZXNzIHYgPT0gZG9tOnBsYWNlaG9sZGVyXG5cdFx0c2VsZlxuXG5cdGRlZiBwbGFjZWhvbGRlclxuXHRcdGRvbTpwbGFjZWhvbGRlclxuXG50YWcgdGZvb3RcbnRhZyB0aFxudGFnIHRoZWFkXG50YWcgdGltZVxudGFnIHRpdGxlXG50YWcgdHJcbnRhZyB0cmFja1xudGFnIHVcbnRhZyB1bFxudGFnIHZpZGVvXG50YWcgd2JyXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBzcmMvaW1iYS9kb20uaHRtbC5pbWJhXG4gKiovIiwiXG50YWcgc3ZnOnN2Z2VsZW1lbnRcblxuXHRkZWYgc2VsZi5uYW1lc3BhY2VVUklcblx0XHRcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCJcblxuXHRsZXQgdHlwZXMgPSBcImNpcmNsZSBkZWZzIGVsbGlwc2UgZyBsaW5lIGxpbmVhckdyYWRpZW50IG1hc2sgcGF0aCBwYXR0ZXJuIHBvbHlnb24gcG9seWxpbmUgcmFkaWFsR3JhZGllbnQgcmVjdCBzdG9wIHN2ZyB0ZXh0IHRzcGFuXCIuc3BsaXQoXCIgXCIpXG5cblx0ZGVmIHNlbGYuYnVpbGROb2RlXG5cdFx0dmFyIGRvbSA9IEltYmEuZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSxAbm9kZVR5cGUpXG5cdFx0dmFyIGNscyA9IEBjbGFzc2VzLmpvaW4oXCIgXCIpXG5cdFx0ZG9tOmNsYXNzTmFtZTpiYXNlVmFsID0gY2xzIGlmIGNsc1xuXHRcdGRvbVxuXG5cdGRlZiBzZWxmLmluaGVyaXQgY2hpbGRcblx0XHRjaGlsZC5AcHJvdG9Eb20gPSBudWxsXG5cblx0XHRpZiBjaGlsZC5AbmFtZSBpbiB0eXBlc1xuXHRcdFx0Y2hpbGQuQG5vZGVUeXBlID0gY2hpbGQuQG5hbWVcblx0XHRcdGNoaWxkLkBjbGFzc2VzID0gW11cblx0XHRlbHNlXG5cdFx0XHRjaGlsZC5Abm9kZVR5cGUgPSBAbm9kZVR5cGVcblx0XHRcdHZhciBjbGFzc05hbWUgPSBcIl9cIiArIGNoaWxkLkBuYW1lLnJlcGxhY2UoL18vZywgJy0nKVxuXHRcdFx0Y2hpbGQuQGNsYXNzZXMgPSBAY2xhc3Nlcy5jb25jYXQoY2xhc3NOYW1lKVxuXG5cblx0YXR0ciB4IGlubGluZTogbm9cblx0YXR0ciB5IGlubGluZTogbm9cblxuXHRhdHRyIHdpZHRoIGlubGluZTogbm9cblx0YXR0ciBoZWlnaHQgaW5saW5lOiBub1xuXG5cdGF0dHIgc3Ryb2tlIGlubGluZTogbm9cblx0YXR0ciBzdHJva2Utd2lkdGggaW5saW5lOiBub1xuXG50YWcgc3ZnOnN2Z1xuXHRhdHRyIHZpZXdib3ggaW5saW5lOiBub1xuXG50YWcgc3ZnOmdcblxudGFnIHN2ZzpkZWZzXG5cbnRhZyBzdmc6c3ltYm9sXG5cdGF0dHIgcHJlc2VydmVBc3BlY3RSYXRpbyBpbmxpbmU6IG5vXG5cdGF0dHIgdmlld0JveCBpbmxpbmU6IG5vXG5cbnRhZyBzdmc6bWFya2VyXG5cdGF0dHIgbWFya2VyVW5pdHMgaW5saW5lOiBub1xuXHRhdHRyIHJlZlggaW5saW5lOiBub1xuXHRhdHRyIHJlZlkgaW5saW5lOiBub1xuXHRhdHRyIG1hcmtlcldpZHRoIGlubGluZTogbm9cblx0YXR0ciBtYXJrZXJIZWlnaHQgaW5saW5lOiBub1xuXHRhdHRyIG9yaWVudCBpbmxpbmU6IG5vXG5cblxuIyBCYXNpYyBzaGFwZXNcblxudGFnIHN2ZzpyZWN0XG5cdGF0dHIgcnggaW5saW5lOiBub1xuXHRhdHRyIHJ5IGlubGluZTogbm9cblxudGFnIHN2ZzpjaXJjbGVcblx0YXR0ciBjeCBpbmxpbmU6IG5vXG5cdGF0dHIgY3kgaW5saW5lOiBub1xuXHRhdHRyIHIgaW5saW5lOiBub1xuXG50YWcgc3ZnOmVsbGlwc2Vcblx0YXR0ciBjeCBpbmxpbmU6IG5vXG5cdGF0dHIgY3kgaW5saW5lOiBub1xuXHRhdHRyIHJ4IGlubGluZTogbm9cblx0YXR0ciByeSBpbmxpbmU6IG5vXG5cbnRhZyBzdmc6cGF0aFxuXHRhdHRyIGQgaW5saW5lOiBub1xuXHRhdHRyIHBhdGhMZW5ndGggaW5saW5lOiBub1xuXG50YWcgc3ZnOmxpbmVcblx0YXR0ciB4MSBpbmxpbmU6IG5vXG5cdGF0dHIgeDIgaW5saW5lOiBub1xuXHRhdHRyIHkxIGlubGluZTogbm9cblx0YXR0ciB5MiBpbmxpbmU6IG5vXG5cbnRhZyBzdmc6cG9seWxpbmVcblx0YXR0ciBwb2ludHMgaW5saW5lOiBub1xuXG50YWcgc3ZnOnBvbHlnb25cblx0YXR0ciBwb2ludHMgaW5saW5lOiBub1xuXG50YWcgc3ZnOnRleHRcblx0YXR0ciBkeCBpbmxpbmU6IG5vXG5cdGF0dHIgZHkgaW5saW5lOiBub1xuXHRhdHRyIHRleHQtYW5jaG9yIGlubGluZTogbm9cblx0YXR0ciByb3RhdGUgaW5saW5lOiBub1xuXHRhdHRyIHRleHRMZW5ndGggaW5saW5lOiBub1xuXHRhdHRyIGxlbmd0aEFkanVzdCBpbmxpbmU6IG5vXG5cbnRhZyBzdmc6dHNwYW5cblx0YXR0ciBkeCBpbmxpbmU6IG5vXG5cdGF0dHIgZHkgaW5saW5lOiBub1xuXHRhdHRyIHJvdGF0ZSBpbmxpbmU6IG5vXG5cdGF0dHIgdGV4dExlbmd0aCBpbmxpbmU6IG5vXG5cdGF0dHIgbGVuZ3RoQWRqdXN0IGlubGluZTogbm9cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBzcmMvaW1iYS9kb20uc3ZnLmltYmFcbiAqKi8iLCJcbmlmIEltYmEuQ0xJRU5UXG5cdHVubGVzcyBkb2N1bWVudDpkb2N1bWVudEVsZW1lbnQ6Y2xhc3NMaXN0XG5cdFx0ZXh0ZW5kIHRhZyBlbGVtZW50XG5cblx0XHRcdGRlZiBoYXNGbGFnIHJlZlxuXHRcdFx0XHRyZXR1cm4gUmVnRXhwLm5ldygnKF58XFxcXHMpJyArIHJlZiArICcoXFxcXHN8JCknKS50ZXN0KEBkb206Y2xhc3NOYW1lKVxuXG5cdFx0XHRkZWYgYWRkRmxhZyByZWZcblx0XHRcdFx0cmV0dXJuIHNlbGYgaWYgaGFzRmxhZyhyZWYpXG5cdFx0XHRcdEBkb206Y2xhc3NOYW1lICs9IChAZG9tOmNsYXNzTmFtZSA/ICcgJyA6ICcnKSArIHJlZlxuXHRcdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0XHRkZWYgdW5mbGFnIHJlZlxuXHRcdFx0XHRyZXR1cm4gc2VsZiB1bmxlc3MgaGFzRmxhZyhyZWYpXG5cdFx0XHRcdHZhciByZWdleCA9IFJlZ0V4cC5uZXcoJyhefFxcXFxzKSonICsgcmVmICsgJyhcXFxcc3wkKSonLCAnZycpXG5cdFx0XHRcdEBkb206Y2xhc3NOYW1lID0gQGRvbTpjbGFzc05hbWUucmVwbGFjZShyZWdleCwgJycpXG5cdFx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRcdGRlZiB0b2dnbGVGbGFnIHJlZlxuXHRcdFx0XHRoYXNGbGFnKHJlZikgPyB1bmZsYWcocmVmKSA6IGZsYWcocmVmKVxuXG5cdFx0XHRkZWYgZmxhZyByZWYsIGJvb2xcblx0XHRcdFx0aWYgYXJndW1lbnRzOmxlbmd0aCA9PSAyIGFuZCAhIWJvb2wgPT09IG5vXG5cdFx0XHRcdFx0cmV0dXJuIHVuZmxhZyhyZWYpXG5cdFx0XHRcdHJldHVybiBhZGRGbGFnKHJlZilcblx0XHR0cnVlXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogc3JjL2ltYmEvZG9tLmxlZ2FjeS5pbWJhXG4gKiovIiwidmFyIGRvYyA9IGRvY3VtZW50XG52YXIgd2luID0gd2luZG93XG5cbnZhciBoYXNUb3VjaEV2ZW50cyA9IHdpbmRvdyAmJiB3aW5kb3c6b250b3VjaHN0YXJ0ICE9PSB1bmRlZmluZWRcblxuY2xhc3MgSW1iYS5Qb2ludGVyXG5cblx0IyBiZWdhbiwgbW92ZWQsIHN0YXRpb25hcnksIGVuZGVkLCBjYW5jZWxsZWRcblxuXHRwcm9wIHBoYXNlXG5cdHByb3AgcHJldkV2ZW50XG5cdHByb3AgYnV0dG9uXG5cdHByb3AgZXZlbnRcblx0cHJvcCBkaXJ0eVxuXHRwcm9wIGV2ZW50c1xuXHRwcm9wIHRvdWNoXG5cblx0ZGVmIGluaXRpYWxpemVcblx0XHRidXR0b24gPSAtMVxuXHRcdGV2ZW50ID0ge3g6IDAsIHk6IDAsIHR5cGU6ICd1bmluaXRpYWxpemVkJ31cblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiB1cGRhdGUgZVxuXHRcdGV2ZW50ID0gZVxuXHRcdGRpcnR5ID0geWVzXG5cdFx0c2VsZlxuXG5cdCMgdGhpcyBpcyBqdXN0IGZvciByZWd1bGFyIG1vdXNlIG5vd1xuXHRkZWYgcHJvY2Vzc1xuXHRcdHZhciBlMSA9IGV2ZW50XG5cblx0XHRpZiBkaXJ0eVxuXHRcdFx0cHJldkV2ZW50ID0gZTFcblx0XHRcdGRpcnR5ID0gbm9cblxuXHRcdFx0IyBidXR0b24gc2hvdWxkIG9ubHkgY2hhbmdlIG9uIG1vdXNlZG93biBldGNcblx0XHRcdGlmIGUxOnR5cGUgPT0gJ21vdXNlZG93bidcblx0XHRcdFx0YnV0dG9uID0gZTE6YnV0dG9uXG5cblx0XHRcdFx0IyBkbyBub3QgY3JlYXRlIHRvdWNoIGZvciByaWdodCBjbGlja1xuXHRcdFx0XHRpZiBidXR0b24gPT0gMiBvciAodG91Y2ggYW5kIGJ1dHRvbiAhPSAwKVxuXHRcdFx0XHRcdHJldHVyblxuXG5cdFx0XHRcdCMgY2FuY2VsIHRoZSBwcmV2aW91cyB0b3VjaFxuXHRcdFx0XHR0b3VjaC5jYW5jZWwgaWYgdG91Y2hcblx0XHRcdFx0dG91Y2ggPSBJbWJhLlRvdWNoLm5ldyhlMSxzZWxmKVxuXHRcdFx0XHR0b3VjaC5tb3VzZWRvd24oZTEsZTEpXG5cblx0XHRcdGVsaWYgZTE6dHlwZSA9PSAnbW91c2Vtb3ZlJ1xuXHRcdFx0XHR0b3VjaC5tb3VzZW1vdmUoZTEsZTEpIGlmIHRvdWNoXG5cblx0XHRcdGVsaWYgZTE6dHlwZSA9PSAnbW91c2V1cCdcblx0XHRcdFx0YnV0dG9uID0gLTFcblxuXHRcdFx0XHRpZiB0b3VjaCBhbmQgdG91Y2guYnV0dG9uID09IGUxOmJ1dHRvblxuXHRcdFx0XHRcdHRvdWNoLm1vdXNldXAoZTEsZTEpXG5cdFx0XHRcdFx0dG91Y2ggPSBudWxsXG5cdFx0XHRcdCMgdHJpZ2dlciBwb2ludGVydXBcblx0XHRlbHNlXG5cdFx0XHR0b3VjaC5pZGxlIGlmIHRvdWNoXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgY2xlYW51cFxuXHRcdEltYmEuUE9JTlRFUlNcblxuXHRkZWYgeCBkbyBldmVudDp4XG5cdGRlZiB5IGRvIGV2ZW50OnlcblxuXHQjIGRlcHJlY2F0ZWQgLS0gc2hvdWxkIHJlbW92ZVxuXHRkZWYgc2VsZi51cGRhdGUgXG5cdFx0IyBjb25zb2xlLmxvZygndXBkYXRlIHRvdWNoJylcblx0XHRmb3IgcHRyLGkgaW4gSW1iYS5QT0lOVEVSU1xuXHRcdFx0cHRyLnByb2Nlc3Ncblx0XHQjIG5lZWQgdG8gYmUgYWJsZSB0byBwcmV2ZW50IHRoZSBkZWZhdWx0IGJlaGF2aW91ciBvZiB0b3VjaCwgbm8/XG5cdFx0d2luLnJlcXVlc3RBbmltYXRpb25GcmFtZShJbWJhLlBvaW50ZXI6dXBkYXRlKVxuXHRcdHNlbGZcblxudmFyIGxhc3ROYXRpdmVUb3VjaFRpbWVTdGFtcCA9IDBcbnZhciBsYXN0TmF0aXZlVG91Y2hUaW1lb3V0ID0gNTBcblxuIyBJbWJhLlRvdWNoXG4jIEJlZ2FuXHRBIGZpbmdlciB0b3VjaGVkIHRoZSBzY3JlZW4uXG4jIE1vdmVkXHRBIGZpbmdlciBtb3ZlZCBvbiB0aGUgc2NyZWVuLlxuIyBTdGF0aW9uYXJ5XHRBIGZpbmdlciBpcyB0b3VjaGluZyB0aGUgc2NyZWVuIGJ1dCBoYXNuJ3QgbW92ZWQuXG4jIEVuZGVkXHRBIGZpbmdlciB3YXMgbGlmdGVkIGZyb20gdGhlIHNjcmVlbi4gVGhpcyBpcyB0aGUgZmluYWwgcGhhc2Ugb2YgYSB0b3VjaC5cbiMgQ2FuY2VsZWQgVGhlIHN5c3RlbSBjYW5jZWxsZWQgdHJhY2tpbmcgZm9yIHRoZSB0b3VjaC5cblxuIyMjXG5Db25zb2xpZGF0ZXMgbW91c2UgYW5kIHRvdWNoIGV2ZW50cy4gVG91Y2ggb2JqZWN0cyBwZXJzaXN0IGFjcm9zcyBhIHRvdWNoLFxuZnJvbSB0b3VjaHN0YXJ0IHVudGlsIGVuZC9jYW5jZWwuIFdoZW4gYSB0b3VjaCBzdGFydHMsIGl0IHdpbGwgdHJhdmVyc2VcbmRvd24gZnJvbSB0aGUgaW5uZXJtb3N0IHRhcmdldCwgdW50aWwgaXQgZmluZHMgYSBub2RlIHRoYXQgcmVzcG9uZHMgdG9cbm9udG91Y2hzdGFydC4gVW5sZXNzIHRoZSB0b3VjaCBpcyBleHBsaWNpdGx5IHJlZGlyZWN0ZWQsIHRoZSB0b3VjaCB3aWxsXG5jYWxsIG9udG91Y2htb3ZlIGFuZCBvbnRvdWNoZW5kIC8gb250b3VjaGNhbmNlbCBvbiB0aGUgcmVzcG9uZGVyIHdoZW4gYXBwcm9wcmlhdGUuXG5cblx0dGFnIGRyYWdnYWJsZVxuXHRcdCMgY2FsbGVkIHdoZW4gYSB0b3VjaCBzdGFydHNcblx0XHRkZWYgb250b3VjaHN0YXJ0IHRvdWNoXG5cdFx0XHRmbGFnICdkcmFnZ2luZydcblx0XHRcdHNlbGZcblx0XHRcblx0XHQjIGNhbGxlZCB3aGVuIHRvdWNoIG1vdmVzIC0gc2FtZSB0b3VjaCBvYmplY3Rcblx0XHRkZWYgb250b3VjaG1vdmUgdG91Y2hcblx0XHRcdCMgbW92ZSB0aGUgbm9kZSB3aXRoIHRvdWNoXG5cdFx0XHRjc3MgdG9wOiB0b3VjaC5keSwgbGVmdDogdG91Y2guZHhcblx0XHRcblx0XHQjIGNhbGxlZCB3aGVuIHRvdWNoIGVuZHNcblx0XHRkZWYgb250b3VjaGVuZCB0b3VjaFxuXHRcdFx0dW5mbGFnICdkcmFnZ2luZydcblxuQGluYW1lIHRvdWNoXG4jIyNcbmNsYXNzIEltYmEuVG91Y2hcblxuXHR2YXIgdG91Y2hlcyA9IFtdXG5cdHZhciBjb3VudCA9IDBcblx0dmFyIGlkZW50aWZpZXJzID0ge31cblxuXHRkZWYgc2VsZi5jb3VudFxuXHRcdGNvdW50XG5cblx0ZGVmIHNlbGYubG9va3VwIGl0ZW1cblx0XHRyZXR1cm4gaXRlbSBhbmQgKGl0ZW06X190b3VjaF9fIG9yIGlkZW50aWZpZXJzW2l0ZW06aWRlbnRpZmllcl0pXG5cblx0ZGVmIHNlbGYucmVsZWFzZSBpdGVtLHRvdWNoXG5cdFx0ZGVsZXRlIGlkZW50aWZpZXJzW2l0ZW06aWRlbnRpZmllcl1cblx0XHRkZWxldGUgaXRlbTpfX3RvdWNoX19cblx0XHRyZXR1cm5cblxuXHRkZWYgc2VsZi5vbnRvdWNoc3RhcnQgZVxuXHRcdGZvciB0IGluIGU6Y2hhbmdlZFRvdWNoZXNcblx0XHRcdGNvbnRpbnVlIGlmIGxvb2t1cCh0KVxuXHRcdFx0dmFyIHRvdWNoID0gaWRlbnRpZmllcnNbdDppZGVudGlmaWVyXSA9IHNlbGYubmV3KGUpICMgKGUpXG5cdFx0XHR0Ol9fdG91Y2hfXyA9IHRvdWNoXG5cdFx0XHR0b3VjaGVzLnB1c2godG91Y2gpXG5cdFx0XHRjb3VudCsrXG5cdFx0XHR0b3VjaC50b3VjaHN0YXJ0KGUsdClcblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub250b3VjaG1vdmUgZVxuXHRcdGZvciB0IGluIGU6Y2hhbmdlZFRvdWNoZXNcblx0XHRcdGlmIHZhciB0b3VjaCA9IGxvb2t1cCh0KVxuXHRcdFx0XHR0b3VjaC50b3VjaG1vdmUoZSx0KVxuXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9udG91Y2hlbmQgZVxuXHRcdGZvciB0IGluIGU6Y2hhbmdlZFRvdWNoZXNcblx0XHRcdGlmIHZhciB0b3VjaCA9IGxvb2t1cCh0KVxuXHRcdFx0XHR0b3VjaC50b3VjaGVuZChlLHQpXG5cdFx0XHRcdHJlbGVhc2UodCx0b3VjaClcblx0XHRcdFx0Y291bnQtLVxuXG5cdFx0IyBlLnByZXZlbnREZWZhdWx0XG5cdFx0IyBub3QgYWx3YXlzIHN1cHBvcnRlZCFcblx0XHQjIHRvdWNoZXMgPSB0b3VjaGVzLmZpbHRlcih8fClcblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub250b3VjaGNhbmNlbCBlXG5cdFx0Zm9yIHQgaW4gZTpjaGFuZ2VkVG91Y2hlc1xuXHRcdFx0aWYgdmFyIHRvdWNoID0gbG9va3VwKHQpXG5cdFx0XHRcdHRvdWNoLnRvdWNoY2FuY2VsKGUsdClcblx0XHRcdFx0cmVsZWFzZSh0LHRvdWNoKVxuXHRcdFx0XHRjb3VudC0tXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9ubW91c2Vkb3duIGVcblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub25tb3VzZW1vdmUgZVxuXHRcdHNlbGZcblxuXHRkZWYgc2VsZi5vbm1vdXNldXAgZVxuXHRcdHNlbGZcblxuXG5cdHByb3AgcGhhc2Vcblx0cHJvcCBhY3RpdmVcblx0cHJvcCBldmVudFxuXHRwcm9wIHBvaW50ZXJcblx0cHJvcCB0YXJnZXRcblx0cHJvcCBoYW5kbGVyXG5cdHByb3AgdXBkYXRlc1xuXHRwcm9wIHN1cHByZXNzXG5cdHByb3AgZGF0YVxuXHRwcm9wIGJ1YmJsZSBjaGFpbmFibGU6IHllc1xuXG5cdHByb3AgZ2VzdHVyZXNcblxuXHQjIyNcblx0XG5cblx0QGludGVybmFsXG5cdEBjb25zdHJ1Y3RvclxuXHQjIyNcblx0ZGVmIGluaXRpYWxpemUgZXZlbnQsIHBvaW50ZXJcblx0XHQjIEBuYXRpdmUgID0gZmFsc2Vcblx0XHRzZWxmLmV2ZW50ID0gZXZlbnRcblx0XHRkYXRhID0ge31cblx0XHRhY3RpdmUgPSB5ZXNcblx0XHRAYnV0dG9uID0gZXZlbnQgYW5kIGV2ZW50OmJ1dHRvbiBvciAwXG5cdFx0QHN1cHByZXNzID0gbm8gIyBkZXByZWNhdGVkXG5cdFx0QGNhcHR1cmVkID0gbm9cblx0XHRidWJibGUgPSBub1xuXHRcdHBvaW50ZXIgPSBwb2ludGVyXG5cdFx0dXBkYXRlcyA9IDBcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBjYXB0dXJlXG5cdFx0QGNhcHR1cmVkID0geWVzXG5cdFx0QGV2ZW50IGFuZCBAZXZlbnQucHJldmVudERlZmF1bHRcblx0XHRzZWxmXG5cblx0ZGVmIGlzQ2FwdHVyZWRcblx0XHQhIUBjYXB0dXJlZFxuXG5cdCMjI1xuXHRFeHRlbmQgdGhlIHRvdWNoIHdpdGggYSBwbHVnaW4gLyBnZXN0dXJlLiBcblx0QWxsIGV2ZW50cyAodG91Y2hzdGFydCxtb3ZlIGV0YykgZm9yIHRoZSB0b3VjaFxuXHR3aWxsIGJlIHRyaWdnZXJlZCBvbiB0aGUgcGx1Z2lucyBpbiB0aGUgb3JkZXIgdGhleVxuXHRhcmUgYWRkZWQuXG5cdCMjI1xuXHRkZWYgZXh0ZW5kIHBsdWdpblxuXHRcdCMgY29uc29sZS5sb2cgXCJhZGRlZCBnZXN0dXJlISEhXCJcblx0XHRAZ2VzdHVyZXMgfHw9IFtdXG5cdFx0QGdlc3R1cmVzLnB1c2gocGx1Z2luKVxuXHRcdHNlbGZcblxuXHQjIyNcblx0UmVkaXJlY3QgdG91Y2ggdG8gc3BlY2lmaWVkIHRhcmdldC4gb250b3VjaHN0YXJ0IHdpbGwgYWx3YXlzIGJlXG5cdGNhbGxlZCBvbiB0aGUgbmV3IHRhcmdldC5cblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHJlZGlyZWN0IHRhcmdldFxuXHRcdEByZWRpcmVjdCA9IHRhcmdldFxuXHRcdHNlbGZcblxuXHQjIyNcblx0U3VwcHJlc3MgdGhlIGRlZmF1bHQgYmVoYXZpb3VyLiBXaWxsIGNhbGwgcHJldmVudERlZmF1bHQgZm9yXG5cdGFsbCBuYXRpdmUgZXZlbnRzIHRoYXQgYXJlIHBhcnQgb2YgdGhlIHRvdWNoLlxuXHQjIyNcblx0ZGVmIHN1cHByZXNzXG5cdFx0IyBjb2xsaXNpb24gd2l0aCB0aGUgc3VwcHJlc3MgcHJvcGVydHlcblx0XHRAYWN0aXZlID0gbm9cblx0XHRzZWxmXG5cblx0ZGVmIHN1cHByZXNzPSB2YWx1ZVxuXHRcdGNvbnNvbGUud2FybiAnSW1iYS5Ub3VjaCNzdXBwcmVzcz0gaXMgZGVwcmVjYXRlZCdcblx0XHRAc3VwcmVzcyA9IHZhbHVlXG5cdFx0c2VsZlxuXG5cdGRlZiB0b3VjaHN0YXJ0IGUsdFxuXHRcdEBldmVudCA9IGVcblx0XHRAdG91Y2ggPSB0XG5cdFx0QGJ1dHRvbiA9IDBcblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0YmVnYW5cblx0XHRlLnByZXZlbnREZWZhdWx0IGlmIGUgYW5kIGlzQ2FwdHVyZWRcblx0XHRzZWxmXG5cblx0ZGVmIHRvdWNobW92ZSBlLHRcblx0XHRAZXZlbnQgPSBlXG5cdFx0QHggPSB0OmNsaWVudFhcblx0XHRAeSA9IHQ6Y2xpZW50WVxuXHRcdHVwZGF0ZVxuXHRcdGUucHJldmVudERlZmF1bHQgaWYgZSBhbmQgaXNDYXB0dXJlZFxuXHRcdHNlbGZcblxuXHRkZWYgdG91Y2hlbmQgZSx0XG5cdFx0QGV2ZW50ID0gZVxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHRlbmRlZFxuXG5cdFx0bGFzdE5hdGl2ZVRvdWNoVGltZVN0YW1wID0gZTp0aW1lU3RhbXBcblxuXHRcdGlmIEBtYXhkciA8IDIwXG5cdFx0XHR2YXIgdGFwID0gSW1iYS5FdmVudC5uZXcoZSlcblx0XHRcdHRhcC50eXBlID0gJ3RhcCdcblx0XHRcdHRhcC5wcm9jZXNzXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0IGlmIHRhcC5AcmVzcG9uZGVyXHRcblxuXHRcdGlmIGUgYW5kIGlzQ2FwdHVyZWRcblx0XHRcdGUucHJldmVudERlZmF1bHRcblxuXHRcdHNlbGZcblxuXHRkZWYgdG91Y2hjYW5jZWwgZSx0XG5cdFx0Y2FuY2VsXG5cblx0ZGVmIG1vdXNlZG93biBlLHRcblx0XHRAZXZlbnQgPSBlXG5cdFx0QGJ1dHRvbiA9IGU6YnV0dG9uXG5cdFx0QHggPSB0OmNsaWVudFhcblx0XHRAeSA9IHQ6Y2xpZW50WVxuXHRcdGJlZ2FuXG5cblx0XHRAbW91c2Vtb3ZlID0gKHxlfCBtb3VzZW1vdmUoZSxlKSApXG5cdFx0ZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsQG1vdXNlbW92ZSx5ZXMpXG5cdFx0c2VsZlxuXG5cdGRlZiBtb3VzZW1vdmUgZSx0XG5cdFx0QHggPSB0OmNsaWVudFhcblx0XHRAeSA9IHQ6Y2xpZW50WVxuXHRcdEBldmVudCA9IGVcblx0XHRlLnByZXZlbnREZWZhdWx0IGlmIGlzQ2FwdHVyZWRcblx0XHR1cGRhdGVcblx0XHRtb3ZlXG5cdFx0c2VsZlxuXG5cdGRlZiBtb3VzZXVwIGUsdFxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHRlbmRlZFxuXHRcdGRvYy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLEBtb3VzZW1vdmUseWVzKVxuXHRcdEBtb3VzZW1vdmUgPSBudWxsXG5cdFx0c2VsZlxuXG5cdGRlZiBpZGxlXG5cdFx0dXBkYXRlXG5cblx0ZGVmIGJlZ2FuXG5cdFx0QG1heGRyID0gQGRyID0gMFxuXHRcdEB4MCA9IEB4XG5cdFx0QHkwID0gQHlcblxuXHRcdHZhciBkb20gPSBldmVudDp0YXJnZXRcblx0XHR2YXIgbm9kZSA9IG51bGxcblxuXHRcdEBzb3VyY2VUYXJnZXQgPSBkb20gYW5kIHRhZyhkb20pXG5cblx0XHR3aGlsZSBkb21cblx0XHRcdG5vZGUgPSB0YWcoZG9tKVxuXHRcdFx0aWYgbm9kZSAmJiBub2RlOm9udG91Y2hzdGFydFxuXHRcdFx0XHRAYnViYmxlID0gbm9cblx0XHRcdFx0dGFyZ2V0ID0gbm9kZVxuXHRcdFx0XHR0YXJnZXQub250b3VjaHN0YXJ0KHNlbGYpXG5cdFx0XHRcdGJyZWFrIHVubGVzcyBAYnViYmxlXG5cdFx0XHRkb20gPSBkb206cGFyZW50Tm9kZVxuXG5cdFx0QHVwZGF0ZXMrK1xuXHRcdHNlbGZcblxuXHRkZWYgdXBkYXRlXG5cdFx0cmV0dXJuIHNlbGYgdW5sZXNzIEBhY3RpdmVcblxuXHRcdHZhciBkciA9IE1hdGguc3FydChkeCpkeCArIGR5KmR5KVxuXHRcdEBtYXhkciA9IGRyIGlmIGRyID4gQGRyXG5cdFx0QGRyID0gZHJcblxuXHRcdCMgY2F0Y2hpbmcgYSB0b3VjaC1yZWRpcmVjdD8hP1xuXHRcdGlmIEByZWRpcmVjdFxuXHRcdFx0aWYgQHRhcmdldCBhbmQgQHRhcmdldDpvbnRvdWNoY2FuY2VsXG5cdFx0XHRcdEB0YXJnZXQub250b3VjaGNhbmNlbChzZWxmKVxuXHRcdFx0dGFyZ2V0ID0gQHJlZGlyZWN0XG5cdFx0XHRAcmVkaXJlY3QgPSBudWxsXG5cdFx0XHR0YXJnZXQub250b3VjaHN0YXJ0KHNlbGYpIGlmIHRhcmdldDpvbnRvdWNoc3RhcnRcblxuXG5cdFx0QHVwZGF0ZXMrK1xuXHRcdGlmIEBnZXN0dXJlc1xuXHRcdFx0Zy5vbnRvdWNodXBkYXRlKHNlbGYpIGZvciBnIGluIEBnZXN0dXJlc1xuXG5cdFx0dGFyZ2V0Py5vbnRvdWNodXBkYXRlKHNlbGYpXG5cdFx0c2VsZlxuXG5cdGRlZiBtb3ZlXG5cdFx0cmV0dXJuIHNlbGYgdW5sZXNzIEBhY3RpdmVcblxuXHRcdGlmIEBnZXN0dXJlc1xuXHRcdFx0Zm9yIGcgaW4gQGdlc3R1cmVzXG5cdFx0XHRcdGcub250b3VjaG1vdmUoc2VsZixAZXZlbnQpIGlmIGc6b250b3VjaG1vdmVcblxuXHRcdHRhcmdldD8ub250b3VjaG1vdmUoc2VsZixAZXZlbnQpXG5cdFx0c2VsZlxuXG5cdGRlZiBlbmRlZFxuXHRcdHJldHVybiBzZWxmIHVubGVzcyBAYWN0aXZlXG5cblx0XHRAdXBkYXRlcysrXG5cblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGcub250b3VjaGVuZChzZWxmKSBmb3IgZyBpbiBAZ2VzdHVyZXNcblxuXHRcdHRhcmdldD8ub250b3VjaGVuZChzZWxmKVxuXG5cdFx0c2VsZlxuXG5cdGRlZiBjYW5jZWxcblx0XHR1bmxlc3MgQGNhbmNlbGxlZFxuXHRcdFx0QGNhbmNlbGxlZCA9IHllc1xuXHRcdFx0Y2FuY2VsbGVkXG5cdFx0XHRkb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJyxAbW91c2Vtb3ZlLHllcykgaWYgQG1vdXNlbW92ZVxuXHRcdHNlbGZcblxuXHRkZWYgY2FuY2VsbGVkXG5cdFx0cmV0dXJuIHNlbGYgdW5sZXNzIEBhY3RpdmVcblxuXHRcdEBjYW5jZWxsZWQgPSB5ZXNcblx0XHRAdXBkYXRlcysrXG5cblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGZvciBnIGluIEBnZXN0dXJlc1xuXHRcdFx0XHRnLm9udG91Y2hjYW5jZWwoc2VsZikgaWYgZzpvbnRvdWNoY2FuY2VsXG5cblx0XHR0YXJnZXQ/Lm9udG91Y2hjYW5jZWwoc2VsZilcblx0XHRzZWxmXG5cblx0IyMjXG5cdFRoZSBhYnNvbHV0ZSBkaXN0YW5jZSB0aGUgdG91Y2ggaGFzIG1vdmVkIGZyb20gc3RhcnRpbmcgcG9zaXRpb24gXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiBkciBkbyBAZHJcblxuXHQjIyNcblx0VGhlIGRpc3RhbmNlIHRoZSB0b3VjaCBoYXMgbW92ZWQgaG9yaXpvbnRhbGx5XG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiBkeCBkbyBAeCAtIEB4MFxuXG5cdCMjI1xuXHRUaGUgZGlzdGFuY2UgdGhlIHRvdWNoIGhhcyBtb3ZlZCB2ZXJ0aWNhbGx5XG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiBkeSBkbyBAeSAtIEB5MFxuXG5cdCMjI1xuXHRJbml0aWFsIGhvcml6b250YWwgcG9zaXRpb24gb2YgdG91Y2hcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHgwIGRvIEB4MFxuXG5cdCMjI1xuXHRJbml0aWFsIHZlcnRpY2FsIHBvc2l0aW9uIG9mIHRvdWNoXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB5MCBkbyBAeTBcblxuXHQjIyNcblx0SG9yaXpvbnRhbCBwb3NpdGlvbiBvZiB0b3VjaFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgeCBkbyBAeFxuXG5cdCMjI1xuXHRWZXJ0aWNhbCBwb3NpdGlvbiBvZiB0b3VjaFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgeSBkbyBAeVxuXG5cdCMjI1xuXHRIb3Jpem9udGFsIHBvc2l0aW9uIG9mIHRvdWNoIHJlbGF0aXZlIHRvIHRhcmdldFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgdHggZG9cblx0XHRAdGFyZ2V0Qm94IHx8PSBAdGFyZ2V0LmRvbS5nZXRCb3VuZGluZ0NsaWVudFJlY3Rcblx0XHRAeCAtIEB0YXJnZXRCb3g6bGVmdFxuXG5cdCMjI1xuXHRWZXJ0aWNhbCBwb3NpdGlvbiBvZiB0b3VjaCByZWxhdGl2ZSB0byB0YXJnZXRcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHR5XG5cdFx0QHRhcmdldEJveCB8fD0gQHRhcmdldC5kb20uZ2V0Qm91bmRpbmdDbGllbnRSZWN0XG5cdFx0QHkgLSBAdGFyZ2V0Qm94OnRvcFxuXG5cdCMjI1xuXHRCdXR0b24gcHJlc3NlZCBpbiB0aGlzIHRvdWNoLiBOYXRpdmUgdG91Y2hlcyBkZWZhdWx0cyB0byBsZWZ0LWNsaWNrICgwKVxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgYnV0dG9uIGRvIEBidXR0b24gIyBAcG9pbnRlciA/IEBwb2ludGVyLmJ1dHRvbiA6IDBcblxuXHRkZWYgc291cmNlVGFyZ2V0XG5cdFx0QHNvdXJjZVRhcmdldFxuXG5cbmNsYXNzIEltYmEuVG91Y2hHZXN0dXJlXG5cblx0cHJvcCBhY3RpdmUgZGVmYXVsdDogbm9cblxuXHRkZWYgb250b3VjaHN0YXJ0IGVcblx0XHRzZWxmXG5cblx0ZGVmIG9udG91Y2h1cGRhdGUgZVxuXHRcdHNlbGZcblxuXHRkZWYgb250b3VjaGVuZCBlXG5cdFx0c2VsZlxuXG5cbiMgQSBUb3VjaC1ldmVudCBpcyBjcmVhdGVkIG9uIG1vdXNlZG93biAoYWx3YXlzKVxuIyBhbmQgd2hpbGUgaXQgZXhpc3RzLCBtb3VzZW1vdmUgYW5kIG1vdXNldXAgd2lsbFxuIyBiZSBkZWxlZ2F0ZWQgdG8gdGhpcyBhY3RpdmUgZXZlbnQuXG5JbWJhLlBPSU5URVIgPSBJbWJhLlBvaW50ZXIubmV3XG5JbWJhLlBPSU5URVJTID0gW0ltYmEuUE9JTlRFUl1cblxuXG4jIHJlZ3VsYXIgZXZlbnQgc3R1ZmZcbkltYmEuS0VZTUFQID0ge1xuXHRcIjhcIjogJ2JhY2tzcGFjZSdcblx0XCI5XCI6ICd0YWInXG5cdFwiMTNcIjogJ2VudGVyJ1xuXHRcIjE2XCI6ICdzaGlmdCdcblx0XCIxN1wiOiAnY3RybCdcblx0XCIxOFwiOiAnYWx0J1xuXHRcIjE5XCI6ICdicmVhaydcblx0XCIyMFwiOiAnY2Fwcydcblx0XCIyN1wiOiAnZXNjJ1xuXHRcIjMyXCI6ICdzcGFjZSdcblx0XCIzNVwiOiAnZW5kJ1xuXHRcIjM2XCI6ICdob21lJ1xuXHRcIjM3XCI6ICdsYXJyJ1xuXHRcIjM4XCI6ICd1YXJyJ1xuXHRcIjM5XCI6ICdyYXJyJ1xuXHRcIjQwXCI6ICdkYXJyJ1xuXHRcIjQ1XCI6ICdpbnNlcnQnXG5cdFwiNDZcIjogJ2RlbGV0ZSdcblx0XCIxMDdcIjogJ3BsdXMnXG5cdFwiMTA2XCI6ICdtdWx0J1xuXHRcIjkxXCI6ICdtZXRhJ1xufVxuXG5JbWJhLkNIQVJNQVAgPSB7XG5cdFwiJVwiOiAnbW9kdWxvJ1xuXHRcIipcIjogJ211bHRpcGx5J1xuXHRcIitcIjogJ2FkZCdcblx0XCItXCI6ICdzdWInXG5cdFwiL1wiOiAnZGl2aWRlJ1xuXHRcIi5cIjogJ2RvdCdcbn1cblxuIyMjXG5JbWJhIGhhbmRsZXMgYWxsIGV2ZW50cyBpbiB0aGUgZG9tIHRocm91Z2ggYSBzaW5nbGUgbWFuYWdlcixcbmxpc3RlbmluZyBhdCB0aGUgcm9vdCBvZiB5b3VyIGRvY3VtZW50LiBJZiBJbWJhIGZpbmRzIGEgdGFnXG50aGF0IGxpc3RlbnMgdG8gYSBjZXJ0YWluIGV2ZW50LCB0aGUgZXZlbnQgd2lsbCBiZSB3cmFwcGVkIFxuaW4gYW4gYEltYmEuRXZlbnRgLCB3aGljaCBub3JtYWxpemVzIHNvbWUgb2YgdGhlIHF1aXJrcyBhbmQgXG5icm93c2VyIGRpZmZlcmVuY2VzLlxuXG5AaW5hbWUgZXZlbnRcbiMjI1xuY2xhc3MgSW1iYS5FdmVudFxuXG5cdCMjIyByZWZlcmVuY2UgdG8gdGhlIG5hdGl2ZSBldmVudCAjIyNcblx0cHJvcCBldmVudFxuXG5cdCMjIyByZWZlcmVuY2UgdG8gdGhlIG5hdGl2ZSBldmVudCAjIyNcblx0cHJvcCBwcmVmaXhcblxuXHRwcm9wIGRhdGFcblxuXHQjIyNcblx0c2hvdWxkIHJlbW92ZSB0aGlzIGFsbHRvZ2V0aGVyP1xuXHRAZGVwcmVjYXRlZFxuXHQjIyNcblx0cHJvcCBzb3VyY2VcblxuXHQjIyMgQSB7Qm9vbGVhbn0gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBldmVudCBidWJibGVzIHVwIG9yIG5vdCAjIyNcblx0cHJvcCBidWJibGUgdHlwZTogQm9vbGVhbiwgY2hhaW5hYmxlOiB5ZXNcblxuXHRkZWYgc2VsZi53cmFwIGVcblx0XHRzZWxmLm5ldyhlKVxuXHRcblx0ZGVmIGluaXRpYWxpemUgZVxuXHRcdGV2ZW50ID0gZVxuXHRcdGJ1YmJsZSA9IHllc1xuXG5cdGRlZiB0eXBlPSB0eXBlXG5cdFx0QHR5cGUgPSB0eXBlXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRAcmV0dXJuIHtTdHJpbmd9IFRoZSBuYW1lIG9mIHRoZSBldmVudCAoY2FzZS1pbnNlbnNpdGl2ZSlcblx0IyMjXG5cdGRlZiB0eXBlXG5cdFx0QHR5cGUgfHwgZXZlbnQ6dHlwZVxuXG5cdGRlZiBuYW1lXG5cdFx0QG5hbWUgfHw9IHR5cGUudG9Mb3dlckNhc2UucmVwbGFjZSgvXFw6L2csJycpXG5cblx0IyBtaW1jIGdldHNldFxuXHRkZWYgYnViYmxlIHZcblx0XHRpZiB2ICE9IHVuZGVmaW5lZFxuXHRcdFx0c2VsZi5idWJibGUgPSB2XG5cdFx0XHRyZXR1cm4gc2VsZlxuXHRcdHJldHVybiBAYnViYmxlXG5cblx0IyMjXG5cdFByZXZlbnRzIGZ1cnRoZXIgcHJvcGFnYXRpb24gb2YgdGhlIGN1cnJlbnQgZXZlbnQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgaGFsdFxuXHRcdGJ1YmJsZSA9IG5vXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRDYW5jZWwgdGhlIGV2ZW50IChpZiBjYW5jZWxhYmxlKS4gSW4gdGhlIGNhc2Ugb2YgbmF0aXZlIGV2ZW50cyBpdFxuXHR3aWxsIGNhbGwgYHByZXZlbnREZWZhdWx0YCBvbiB0aGUgd3JhcHBlZCBldmVudCBvYmplY3QuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgY2FuY2VsXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQgaWYgZXZlbnQ6cHJldmVudERlZmF1bHRcblx0XHRAY2FuY2VsID0geWVzXG5cdFx0c2VsZlxuXG5cdGRlZiBzaWxlbmNlXG5cdFx0QHNpbGVuY2VkID0geWVzXG5cdFx0c2VsZlxuXG5cdGRlZiBpc1NpbGVuY2VkXG5cdFx0ISFAc2lsZW5jZWRcblxuXHQjIyNcblx0SW5kaWNhdGVzIHdoZXRoZXIgb3Igbm90IGV2ZW50LmNhbmNlbCBoYXMgYmVlbiBjYWxsZWQuXG5cblx0QHJldHVybiB7Qm9vbGVhbn1cblx0IyMjXG5cdGRlZiBpc1ByZXZlbnRlZFxuXHRcdGV2ZW50IGFuZCBldmVudDpkZWZhdWx0UHJldmVudGVkIG9yIEBjYW5jZWxcblxuXHQjIyNcblx0QSByZWZlcmVuY2UgdG8gdGhlIGluaXRpYWwgdGFyZ2V0IG9mIHRoZSBldmVudC5cblx0IyMjXG5cdGRlZiB0YXJnZXRcblx0XHR0YWcoZXZlbnQ6X3RhcmdldCBvciBldmVudDp0YXJnZXQpXG5cblx0IyMjXG5cdEEgcmVmZXJlbmNlIHRvIHRoZSBvYmplY3QgcmVzcG9uZGluZyB0byB0aGUgZXZlbnQuXG5cdCMjI1xuXHRkZWYgcmVzcG9uZGVyXG5cdFx0QHJlc3BvbmRlclxuXG5cdCMjI1xuXHRSZWRpcmVjdCB0aGUgZXZlbnQgdG8gbmV3IHRhcmdldFxuXHQjIyNcblx0ZGVmIHJlZGlyZWN0IG5vZGVcblx0XHRAcmVkaXJlY3QgPSBub2RlXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRHZXQgdGhlIG5vcm1hbGl6ZWQgY2hhcmFjdGVyIGZvciBLZXlib2FyZEV2ZW50L1RleHRFdmVudFxuXHRAcmV0dXJuIHtTdHJpbmd9XG5cdCMjI1xuXHRkZWYga2V5Y2hhclxuXHRcdGlmIGV2ZW50IGlzYSBUZXh0RXZlbnRcblx0XHRcdHJldHVybiBldmVudDpkYXRhXG5cblx0XHRpZiBldmVudCBpc2EgS2V5Ym9hcmRFdmVudFxuXHRcdFx0dmFyIGtpID0gZXZlbnQ6a2V5SWRlbnRpZmllclxuXHRcdFx0dmFyIHN5bSA9IEltYmEuS0VZTUFQW2V2ZW50OmtleUNvZGVdXG5cblx0XHRcdCMgcCAna2V5c3ltIScsa2ksc3ltXG5cblx0XHRcdGlmICFzeW0gYW5kIGtpLnN1YnN0cigwLDIpID09IFwiVStcIlxuXHRcdFx0XHRzeW0gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHBhcnNlSW50KGtpLnN1YnN0cigyKSwgMTYpKVxuXHRcdFx0cmV0dXJuIHN5bVxuXG5cdFx0cmV0dXJuIG51bGxcblxuXHQjIyNcblx0QGRlcHJlY2F0ZWRcblx0IyMjXG5cdGRlZiBrZXljb21ib1xuXHRcdHJldHVybiB1bmxlc3MgdmFyIHN5bSA9IGtleWNoYXJcblx0XHRzeW0gPSBJbWJhLkNIQVJNQVBbc3ltXSBvciBzeW1cblx0XHR2YXIgY29tYm8gPSBbXSwgZSA9IGV2ZW50XG5cdFx0Y29tYm8ucHVzaCg6Y3RybCkgaWYgZTpjdHJsS2V5XG5cdFx0Y29tYm8ucHVzaCg6c2hpZnQpIGlmIGU6c2hpZnRLZXlcblx0XHRjb21iby5wdXNoKDphbHQpIGlmIGU6YWx0S2V5XG5cdFx0Y29tYm8ucHVzaCg6Y21kKSBpZiBlOm1ldGFLZXlcblx0XHRjb21iby5wdXNoKHN5bSlcblx0XHRjb21iby5qb2luKFwiX1wiKS50b0xvd2VyQ2FzZVxuXG5cblx0ZGVmIHByb2Nlc3Ncblx0XHR2YXIgbWV0aCA9IFwib257QHByZWZpeCBvciAnJ317bmFtZX1cIlxuXHRcdHZhciBhcmdzID0gbnVsbFxuXHRcdHZhciBkb210YXJnZXQgPSBldmVudDpfdGFyZ2V0IG9yIGV2ZW50OnRhcmdldFx0XHRcblx0XHQjIHZhciBub2RlID0gPHtkb210YXJnZXQ6X3Jlc3BvbmRlciBvciBkb210YXJnZXR9PlxuXHRcdCMgbmVlZCB0byBjbGVhbiB1cCBhbmQgZG9jdW1lbnQgdGhpcyBiZWhhdmlvdXJcblxuXHRcdHZhciBkb21ub2RlID0gZG9tdGFyZ2V0Ol9yZXNwb25kZXIgb3IgZG9tdGFyZ2V0XG5cdFx0IyBAdG9kbyBuZWVkIHRvIHN0b3AgaW5maW5pdGUgcmVkaXJlY3QtcnVsZXMgaGVyZVxuXG5cdFx0d2hpbGUgZG9tbm9kZVxuXHRcdFx0QHJlZGlyZWN0ID0gbnVsbFxuXHRcdFx0aWYgdmFyIG5vZGUgPSB0YWcoZG9tbm9kZSkgIyBub3Qgb25seSB0YWcgXG5cblx0XHRcdFx0aWYgbm9kZVttZXRoXSBpc2EgU3RyaW5nXG5cdFx0XHRcdFx0IyBzaG91bGQgcmVtZW1iZXIgdGhlIHJlY2VpdmVyIG9mIHRoZSBldmVudFxuXHRcdFx0XHRcdG1ldGggPSBub2RlW21ldGhdXG5cdFx0XHRcdFx0Y29udGludWUgIyBzaG91bGQgbm90IGNvbnRpbnVlP1xuXG5cdFx0XHRcdGlmIG5vZGVbbWV0aF0gaXNhIEFycmF5XG5cdFx0XHRcdFx0YXJncyA9IG5vZGVbbWV0aF0uY29uY2F0KG5vZGUpXG5cdFx0XHRcdFx0bWV0aCA9IGFyZ3Muc2hpZnRcblx0XHRcdFx0XHRjb250aW51ZSAjIHNob3VsZCBub3QgY29udGludWU/XG5cblx0XHRcdFx0aWYgbm9kZVttZXRoXSBpc2EgRnVuY3Rpb25cblx0XHRcdFx0XHRAcmVzcG9uZGVyIHx8PSBub2RlXG5cdFx0XHRcdFx0IyBzaG91bGQgYXV0b3N0b3AgYnViYmxlIGhlcmU/XG5cdFx0XHRcdFx0YXJncyA/IG5vZGVbbWV0aF0uYXBwbHkobm9kZSxhcmdzKSA6IG5vZGVbbWV0aF0oc2VsZixkYXRhKVxuXHRcdFx0XHRcdFxuXHRcdFx0IyBhZGQgbm9kZS5uZXh0RXZlbnRSZXNwb25kZXIgYXMgYSBzZXBhcmF0ZSBtZXRob2QgaGVyZT9cblx0XHRcdHVubGVzcyBidWJibGUgYW5kIGRvbW5vZGUgPSAoQHJlZGlyZWN0IG9yIChub2RlID8gbm9kZS5wYXJlbnQgOiBkb21ub2RlOnBhcmVudE5vZGUpKVxuXHRcdFx0XHRicmVha1xuXG5cdFx0cHJvY2Vzc2VkXG5cdFx0cmV0dXJuIHNlbGZcblxuXG5cdGRlZiBwcm9jZXNzZWRcblx0XHRJbWJhLmVtaXQoSW1iYSwnZXZlbnQnLFtzZWxmXSkgdW5sZXNzIEBzaWxlbmNlZFxuXHRcdHNlbGZcblxuXHQjIyNcblx0UmV0dXJuIHRoZSB4L2xlZnQgY29vcmRpbmF0ZSBvZiB0aGUgbW91c2UgLyBwb2ludGVyIGZvciB0aGlzIGV2ZW50XG5cdEByZXR1cm4ge051bWJlcn0geCBjb29yZGluYXRlIG9mIG1vdXNlIC8gcG9pbnRlciBmb3IgZXZlbnRcblx0IyMjXG5cdGRlZiB4IGRvIGV2ZW50OnhcblxuXHQjIyNcblx0UmV0dXJuIHRoZSB5L3RvcCBjb29yZGluYXRlIG9mIHRoZSBtb3VzZSAvIHBvaW50ZXIgZm9yIHRoaXMgZXZlbnRcblx0QHJldHVybiB7TnVtYmVyfSB5IGNvb3JkaW5hdGUgb2YgbW91c2UgLyBwb2ludGVyIGZvciBldmVudFxuXHQjIyNcblx0ZGVmIHkgZG8gZXZlbnQ6eVxuXG5cdCMjI1xuXHRSZXR1cm5zIGEgTnVtYmVyIHJlcHJlc2VudGluZyBhIHN5c3RlbSBhbmQgaW1wbGVtZW50YXRpb25cblx0ZGVwZW5kZW50IG51bWVyaWMgY29kZSBpZGVudGlmeWluZyB0aGUgdW5tb2RpZmllZCB2YWx1ZSBvZiB0aGVcblx0cHJlc3NlZCBrZXk7IHRoaXMgaXMgdXN1YWxseSB0aGUgc2FtZSBhcyBrZXlDb2RlLlxuXG5cdEZvciBtb3VzZS1ldmVudHMsIHRoZSByZXR1cm5lZCB2YWx1ZSBpbmRpY2F0ZXMgd2hpY2ggYnV0dG9uIHdhc1xuXHRwcmVzc2VkIG9uIHRoZSBtb3VzZSB0byB0cmlnZ2VyIHRoZSBldmVudC5cblxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgd2hpY2ggZG8gZXZlbnQ6d2hpY2hcblxuXG4jIyNcblxuTWFuYWdlciBmb3IgbGlzdGVuaW5nIHRvIGFuZCBkZWxlZ2F0aW5nIGV2ZW50cyBpbiBJbWJhLiBBIHNpbmdsZSBpbnN0YW5jZVxuaXMgYWx3YXlzIGNyZWF0ZWQgYnkgSW1iYSAoYXMgYEltYmEuRXZlbnRzYCksIHdoaWNoIGhhbmRsZXMgYW5kIGRlbGVnYXRlcyBhbGxcbmV2ZW50cyBhdCB0aGUgdmVyeSByb290IG9mIHRoZSBkb2N1bWVudC4gSW1iYSBkb2VzIG5vdCBjYXB0dXJlIGFsbCBldmVudHNcbmJ5IGRlZmF1bHQsIHNvIGlmIHlvdSB3YW50IHRvIG1ha2Ugc3VyZSBleG90aWMgb3IgY3VzdG9tIERPTUV2ZW50cyBhcmUgZGVsZWdhdGVkXG5pbiBJbWJhIHlvdSB3aWxsIG5lZWQgdG8gcmVnaXN0ZXIgdGhlbSBpbiBgSW1iYS5FdmVudHMucmVnaXN0ZXIobXlDdXN0b21FdmVudE5hbWUpYFxuXG5AaW5hbWUgbWFuYWdlclxuXG4jIyNcbmNsYXNzIEltYmEuRXZlbnRNYW5hZ2VyXG5cblx0cHJvcCByb290XG5cdHByb3AgY291bnRcblx0cHJvcCBlbmFibGVkIGRlZmF1bHQ6IG5vLCB3YXRjaDogeWVzXG5cdHByb3AgbGlzdGVuZXJzXG5cdHByb3AgZGVsZWdhdG9yc1xuXHRwcm9wIGRlbGVnYXRvclxuXG5cdGRlZiBlbmFibGVkLWRpZC1zZXQgYm9vbFxuXHRcdGJvb2wgPyBvbmVuYWJsZSA6IG9uZGlzYWJsZVxuXHRcdHNlbGZcblxuXHRkZWYgaW5pdGlhbGl6ZSBub2RlLCBldmVudHM6IFtdXG5cdFx0cm9vdCA9IG5vZGVcblx0XHRjb3VudCA9IDBcblx0XHRsaXN0ZW5lcnMgPSBbXVxuXHRcdGRlbGVnYXRvcnMgPSB7fVxuXHRcdGRlbGVnYXRvciA9IGRvIHxlfCBcblx0XHRcdCMgY29uc29sZS5sb2cgXCJkZWxlZ2F0aW5nIGV2ZW50PyEge2V9XCJcblx0XHRcdGRlbGVnYXRlKGUpXG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXG5cdFx0Zm9yIGV2ZW50IGluIGV2ZW50c1xuXHRcdFx0cmVnaXN0ZXIoZXZlbnQpXG5cblx0XHRyZXR1cm4gc2VsZlxuXG5cdCMjI1xuXG5cdFRlbGwgdGhlIGN1cnJlbnQgRXZlbnRNYW5hZ2VyIHRvIGludGVyY2VwdCBhbmQgaGFuZGxlIGV2ZW50IG9mIGEgY2VydGFpbiBuYW1lLlxuXHRCeSBkZWZhdWx0LCBJbWJhLkV2ZW50cyB3aWxsIHJlZ2lzdGVyIGludGVyY2VwdG9ycyBmb3I6ICprZXlkb3duKiwgKmtleXVwKiwgXG5cdCprZXlwcmVzcyosICp0ZXh0SW5wdXQqLCAqaW5wdXQqLCAqY2hhbmdlKiwgKnN1Ym1pdCosICpmb2N1c2luKiwgKmZvY3Vzb3V0KiwgXG5cdCpibHVyKiwgKmNvbnRleHRtZW51KiwgKmRibGNsaWNrKiwgKm1vdXNld2hlZWwqLCAqd2hlZWwqXG5cblx0IyMjXG5cdGRlZiByZWdpc3RlciBuYW1lLCBoYW5kbGVyID0gdHJ1ZVxuXHRcdGlmIG5hbWUgaXNhIEFycmF5XG5cdFx0XHRyZWdpc3Rlcih2LGhhbmRsZXIpIGZvciB2IGluIG5hbWVcblx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRyZXR1cm4gc2VsZiBpZiBkZWxlZ2F0b3JzW25hbWVdXG5cdFx0IyBjb25zb2xlLmxvZyhcInJlZ2lzdGVyIGZvciBldmVudCB7bmFtZX1cIilcblx0XHR2YXIgZm4gPSBkZWxlZ2F0b3JzW25hbWVdID0gaGFuZGxlciBpc2EgRnVuY3Rpb24gPyBoYW5kbGVyIDogZGVsZWdhdG9yXG5cdFx0cm9vdC5hZGRFdmVudExpc3RlbmVyKG5hbWUsZm4seWVzKSBpZiBlbmFibGVkXG5cblx0ZGVmIGxpc3RlbiBuYW1lLCBoYW5kbGVyLCBjYXB0dXJlID0geWVzXG5cdFx0bGlzdGVuZXJzLnB1c2goW25hbWUsaGFuZGxlcixjYXB0dXJlXSlcblx0XHRyb290LmFkZEV2ZW50TGlzdGVuZXIobmFtZSxoYW5kbGVyLGNhcHR1cmUpIGlmIGVuYWJsZWRcblx0XHRzZWxmXG5cblx0ZGVmIGRlbGVnYXRlIGVcblx0XHRjb3VudCArPSAxXG5cdFx0dmFyIGV2ZW50ID0gSW1iYS5FdmVudC53cmFwKGUpXG5cdFx0ZXZlbnQucHJvY2Vzc1xuXHRcdHNlbGZcblxuXHRkZWYgY3JlYXRlIHR5cGUsIHRhcmdldCwgZGF0YTogbnVsbCwgc291cmNlOiBudWxsXG5cdFx0dmFyIGV2ZW50ID0gSW1iYS5FdmVudC53cmFwIHR5cGU6IHR5cGUsIHRhcmdldDogdGFyZ2V0XG5cdFx0ZXZlbnQuZGF0YSA9IGRhdGEgaWYgZGF0YVxuXHRcdGV2ZW50LnNvdXJjZSA9IHNvdXJjZSBpZiBzb3VyY2Vcblx0XHRldmVudFxuXG5cdCMgdXNlIGNyZWF0ZSBpbnN0ZWFkP1xuXHRkZWYgdHJpZ2dlclxuXHRcdGNyZWF0ZSgqYXJndW1lbnRzKS5wcm9jZXNzXG5cblx0ZGVmIG9uZW5hYmxlXG5cdFx0Zm9yIG93biBuYW1lLGhhbmRsZXIgb2YgZGVsZWdhdG9yc1xuXHRcdFx0cm9vdC5hZGRFdmVudExpc3RlbmVyKG5hbWUsaGFuZGxlcix5ZXMpXG5cblx0XHRmb3IgaXRlbSBpbiBsaXN0ZW5lcnNcblx0XHRcdHJvb3QuYWRkRXZlbnRMaXN0ZW5lcihpdGVtWzBdLGl0ZW1bMV0saXRlbVsyXSlcblx0XHRzZWxmXG5cblx0ZGVmIG9uZGlzYWJsZVxuXHRcdGZvciBvd24gbmFtZSxoYW5kbGVyIG9mIGRlbGVnYXRvcnNcblx0XHRcdHJvb3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLGhhbmRsZXIseWVzKVxuXG5cdFx0Zm9yIGl0ZW0gaW4gbGlzdGVuZXJzXG5cdFx0XHRyb290LnJlbW92ZUV2ZW50TGlzdGVuZXIoaXRlbVswXSxpdGVtWzFdLGl0ZW1bMl0pXG5cdFx0c2VsZlxuXHRcdFxuXG5FRCA9IEltYmEuRXZlbnRzID0gSW1iYS5FdmVudE1hbmFnZXIubmV3KGRvY3VtZW50LCBldmVudHM6IFtcblx0OmtleWRvd24sOmtleXVwLDprZXlwcmVzcyw6dGV4dElucHV0LDppbnB1dCw6Y2hhbmdlLDpzdWJtaXQsXG5cdDpmb2N1c2luLDpmb2N1c291dCw6Ymx1ciw6Y29udGV4dG1lbnUsOmRibGNsaWNrLFxuXHQ6bW91c2V3aGVlbCw6d2hlZWwsOnNjcm9sbFxuXSlcblxuIyBzaG91bGQgc2V0IHRoZXNlIHVwIGluc2lkZSB0aGUgSW1iYS5FdmVudHMgb2JqZWN0IGl0c2VsZlxuIyBzbyB0aGF0IHdlIGNhbiBoYXZlIGRpZmZlcmVudCBFdmVudE1hbmFnZXIgZm9yIGRpZmZlcmVudCByb290c1xuXG5pZiBoYXNUb3VjaEV2ZW50c1xuXHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNoc3RhcnQpIGRvIHxlfFxuXHRcdEltYmEuRXZlbnRzLmNvdW50Kytcblx0XHRJbWJhLlRvdWNoLm9udG91Y2hzdGFydChlKVxuXG5cdEltYmEuRXZlbnRzLmxpc3Rlbig6dG91Y2htb3ZlKSBkbyB8ZXxcblx0XHRJbWJhLkV2ZW50cy5jb3VudCsrXG5cdFx0SW1iYS5Ub3VjaC5vbnRvdWNobW92ZShlKVxuXG5cdEltYmEuRXZlbnRzLmxpc3Rlbig6dG91Y2hlbmQpIGRvIHxlfFxuXHRcdEltYmEuRXZlbnRzLmNvdW50Kytcblx0XHRJbWJhLlRvdWNoLm9udG91Y2hlbmQoZSlcblxuXHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNoY2FuY2VsKSBkbyB8ZXxcblx0XHRJbWJhLkV2ZW50cy5jb3VudCsrXG5cdFx0SW1iYS5Ub3VjaC5vbnRvdWNoY2FuY2VsKGUpXG5cbkltYmEuRXZlbnRzLnJlZ2lzdGVyKDpjbGljaykgZG8gfGV8XG5cdCMgT25seSBmb3IgbWFpbiBtb3VzZWJ1dHRvbiwgbm8/XG5cdGlmIChlOnRpbWVTdGFtcCAtIGxhc3ROYXRpdmVUb3VjaFRpbWVTdGFtcCkgPiBsYXN0TmF0aXZlVG91Y2hUaW1lb3V0XG5cdFx0dmFyIHRhcCA9IEltYmEuRXZlbnQubmV3KGUpXG5cdFx0dGFwLnR5cGUgPSAndGFwJ1xuXHRcdHRhcC5wcm9jZXNzXG5cdFx0aWYgdGFwLkByZXNwb25kZXJcblx0XHRcdHJldHVybiBlLnByZXZlbnREZWZhdWx0XG5cdCMgZGVsZWdhdGUgdGhlIHJlYWwgY2xpY2sgZXZlbnRcblx0SW1iYS5FdmVudHMuZGVsZWdhdGUoZSlcblxuSW1iYS5FdmVudHMubGlzdGVuKDptb3VzZWRvd24pIGRvIHxlfFxuXHRpZiAoZTp0aW1lU3RhbXAgLSBsYXN0TmF0aXZlVG91Y2hUaW1lU3RhbXApID4gbGFzdE5hdGl2ZVRvdWNoVGltZW91dFxuXHRcdEltYmEuUE9JTlRFUi51cGRhdGUoZSkucHJvY2VzcyBpZiBJbWJhLlBPSU5URVJcblxuIyBJbWJhLkV2ZW50cy5saXN0ZW4oOm1vdXNlbW92ZSkgZG8gfGV8XG4jIFx0IyBjb25zb2xlLmxvZyAnbW91c2Vtb3ZlJyxlOnRpbWVTdGFtcFxuIyBcdGlmIChlOnRpbWVTdGFtcCAtIGxhc3ROYXRpdmVUb3VjaFRpbWVTdGFtcCkgPiBsYXN0TmF0aXZlVG91Y2hUaW1lb3V0XG4jIFx0XHRJbWJhLlBPSU5URVIudXBkYXRlKGUpLnByb2Nlc3MgaWYgSW1iYS5QT0lOVEVSICMgLnByb2Nlc3MgaWYgdG91Y2ggIyBzaG91bGQgbm90IGhhcHBlbj8gV2UgcHJvY2VzcyB0aHJvdWdoIFxuXG5JbWJhLkV2ZW50cy5saXN0ZW4oOm1vdXNldXApIGRvIHxlfFxuXHQjIGNvbnNvbGUubG9nICdtb3VzZXVwJyxlOnRpbWVTdGFtcFxuXHRpZiAoZTp0aW1lU3RhbXAgLSBsYXN0TmF0aXZlVG91Y2hUaW1lU3RhbXApID4gbGFzdE5hdGl2ZVRvdWNoVGltZW91dFxuXHRcdEltYmEuUE9JTlRFUi51cGRhdGUoZSkucHJvY2VzcyBpZiBJbWJhLlBPSU5URVJcblxuXG5JbWJhLkV2ZW50cy5yZWdpc3RlcihbOm1vdXNlZG93biw6bW91c2V1cF0pXG5JbWJhLkV2ZW50cy5lbmFibGVkID0geWVzXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogc3JjL2ltYmEvZG9tLmV2ZW50cy5pbWJhXG4gKiovIiwidmFyIEltYmFUYWcgPSBJbWJhLlRBR1M6ZWxlbWVudFxuXG5kZWYgcmVtb3ZlTmVzdGVkIHJvb3QsIG5vZGUsIGNhcmV0XG5cdCMgaWYgbm9kZS9ub2RlcyBpc2EgU3RyaW5nXG5cdCMgXHR3ZSBuZWVkIHRvIHVzZSB0aGUgY2FyZXQgdG8gcmVtb3ZlIGVsZW1lbnRzXG5cdCMgXHRmb3Igbm93IHdlIHdpbGwgc2ltcGx5IG5vdCBzdXBwb3J0IHRoaXNcblx0aWYgbm9kZSBpc2EgSW1iYVRhZ1xuXHRcdHJvb3QucmVtb3ZlQ2hpbGQobm9kZSlcblx0ZWxpZiBub2RlIGlzYSBBcnJheVxuXHRcdHJlbW92ZU5lc3RlZChyb290LG1lbWJlcixjYXJldCkgZm9yIG1lbWJlciBpbiBub2RlXG5cdGVsc2Vcblx0XHQjIHdoYXQgaWYgdGhpcyBpcyBub3QgbnVsbD8hPyE/XG5cdFx0IyB0YWtlIGEgY2hhbmNlIGFuZCByZW1vdmUgYSB0ZXh0LWVsZW1lbnRuZ1xuXHRcdGxldCBuZXh0ID0gY2FyZXQgPyBjYXJldDpuZXh0U2libGluZyA6IHJvb3QuQGRvbTpmaXJzdENoaWxkXG5cdFx0aWYgbmV4dCBpc2EgVGV4dCBhbmQgbmV4dDp0ZXh0Q29udGVudCA9PSBub2RlXG5cdFx0XHRyb290LnJlbW92ZUNoaWxkKG5leHQpXG5cdFx0ZWxzZVxuXHRcdFx0dGhyb3cgJ2Nhbm5vdCByZW1vdmUgc3RyaW5nJ1xuXG5cdHJldHVybiBjYXJldFxuXG5kZWYgYXBwZW5kTmVzdGVkIHJvb3QsIG5vZGVcblx0aWYgbm9kZSBpc2EgSW1iYVRhZ1xuXHRcdHJvb3QuYXBwZW5kQ2hpbGQobm9kZSlcblxuXHRlbGlmIG5vZGUgaXNhIEFycmF5XG5cdFx0YXBwZW5kTmVzdGVkKHJvb3QsbWVtYmVyKSBmb3IgbWVtYmVyIGluIG5vZGVcblxuXHRlbGlmIG5vZGUgIT0gbnVsbCBhbmQgbm9kZSAhPT0gZmFsc2Vcblx0XHRyb290LmFwcGVuZENoaWxkIEltYmEuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobm9kZSlcblxuXHRyZXR1cm5cblxuXG4jIGluc2VydCBub2RlcyBiZWZvcmUgYSBjZXJ0YWluIG5vZGVcbiMgZG9lcyBub3QgbmVlZCB0byByZXR1cm4gYW55IHRhaWwsIGFzIGJlZm9yZVxuIyB3aWxsIHN0aWxsIGJlIGNvcnJlY3QgdGhlcmVcbiMgYmVmb3JlIG11c3QgYmUgYW4gYWN0dWFsIGRvbW5vZGVcbmRlZiBpbnNlcnROZXN0ZWRCZWZvcmUgcm9vdCwgbm9kZSwgYmVmb3JlXG5cdGlmIG5vZGUgaXNhIEltYmFUYWdcblx0XHRyb290Lmluc2VydEJlZm9yZShub2RlLGJlZm9yZSlcblx0ZWxpZiBub2RlIGlzYSBBcnJheVxuXHRcdGluc2VydE5lc3RlZEJlZm9yZShyb290LG1lbWJlcixiZWZvcmUpIGZvciBtZW1iZXIgaW4gbm9kZVxuXHRlbGlmIG5vZGUgIT0gbnVsbCBhbmQgbm9kZSAhPT0gZmFsc2Vcblx0XHRyb290Lmluc2VydEJlZm9yZShJbWJhLmRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpLGJlZm9yZSlcblxuXHRyZXR1cm4gYmVmb3JlXG5cbiMgYWZ0ZXIgbXVzdCBiZSBhbiBhY3R1YWwgZG9tbm9kZVxuZGVmIGluc2VydE5lc3RlZEFmdGVyIHJvb3QsIG5vZGUsIGFmdGVyXG5cdHZhciBiZWZvcmUgPSBhZnRlciA/IGFmdGVyOm5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblxuXHRpZiBiZWZvcmVcblx0XHRpbnNlcnROZXN0ZWRCZWZvcmUocm9vdCxub2RlLGJlZm9yZSlcblx0XHRyZXR1cm4gYmVmb3JlOnByZXZpb3VzU2libGluZ1xuXHRlbHNlXG5cdFx0YXBwZW5kTmVzdGVkKHJvb3Qsbm9kZSlcblx0XHRyZXR1cm4gcm9vdC5AZG9tOmxhc3RDaGlsZFxuXG5kZWYgcmVjb25jaWxlQ29sbGVjdGlvbkNoYW5nZXMgcm9vdCwgbmV3LCBvbGQsIGNhcmV0XG5cblx0dmFyIG5ld0xlbiA9IG5ldzpsZW5ndGhcblx0dmFyIGxhc3ROZXcgPSBuZXdbbmV3TGVuIC0gMV1cblxuXHQjIFRoaXMgcmUtb3JkZXIgYWxnb3JpdGhtIGlzIGJhc2VkIG9uIHRoZSBmb2xsb3dpbmcgcHJpbmNpcGxlOlxuXHQjIFxuXHQjIFdlIGJ1aWxkIGEgXCJjaGFpblwiIHdoaWNoIHNob3dzIHdoaWNoIGl0ZW1zIGFyZSBhbHJlYWR5IHNvcnRlZC5cblx0IyBJZiB3ZSdyZSBnb2luZyBmcm9tIFsxLCAyLCAzXSAtPiBbMiwgMSwgM10sIHRoZSB0cmVlIGxvb2tzIGxpa2U6XG5cdCNcblx0IyBcdDMgLT4gIDAgKGlkeClcblx0IyBcdDIgLT4gLTEgKGlkeClcblx0IyBcdDEgLT4gLTEgKGlkeClcblx0I1xuXHQjIFRoaXMgdGVsbHMgdXMgdGhhdCB3ZSBoYXZlIHR3byBjaGFpbnMgb2Ygb3JkZXJlZCBpdGVtczpcblx0IyBcblx0IyBcdCgxLCAzKSBhbmQgKDIpXG5cdCMgXG5cdCMgVGhlIG9wdGltYWwgcmUtb3JkZXJpbmcgdGhlbiBiZWNvbWVzIHR3byBrZWVwIHRoZSBsb25nZXN0IGNoYWluIGludGFjdCxcblx0IyBhbmQgbW92ZSBhbGwgdGhlIG90aGVyIGl0ZW1zLlxuXG5cdHZhciBuZXdQb3NpdGlvbiA9IFtdXG5cblx0IyBUaGUgdHJlZS9ncmFwaCBpdHNlbGZcblx0dmFyIHByZXZDaGFpbiA9IFtdXG5cdCMgVGhlIGxlbmd0aCBvZiB0aGUgY2hhaW5cblx0dmFyIGxlbmd0aENoYWluID0gW11cblxuXHQjIEtlZXAgdHJhY2sgb2YgdGhlIGxvbmdlc3QgY2hhaW5cblx0dmFyIG1heENoYWluTGVuZ3RoID0gMFxuXHR2YXIgbWF4Q2hhaW5FbmQgPSAwXG5cblx0Zm9yIG5vZGUsIGlkeCBpbiBvbGRcblx0XHR2YXIgbmV3UG9zID0gbmV3LmluZGV4T2Yobm9kZSlcblx0XHRuZXdQb3NpdGlvbi5wdXNoKG5ld1BvcylcblxuXHRcdGlmIG5ld1BvcyA9PSAtMVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChub2RlKVxuXHRcdFx0cHJldkNoYWluLnB1c2goLTEpXG5cdFx0XHRsZW5ndGhDaGFpbi5wdXNoKC0xKVxuXHRcdFx0Y29udGludWVcblxuXHRcdHZhciBwcmV2SWR4ID0gbmV3UG9zaXRpb246bGVuZ3RoIC0gMlxuXG5cdFx0IyBCdWlsZCB0aGUgY2hhaW46XG5cdFx0d2hpbGUgcHJldklkeCA+PSAwXG5cdFx0XHRpZiBuZXdQb3NpdGlvbltwcmV2SWR4XSA9PSAtMVxuXHRcdFx0XHRwcmV2SWR4LS1cblx0XHRcdGVsaWYgbmV3UG9zID4gbmV3UG9zaXRpb25bcHJldklkeF1cblx0XHRcdFx0IyBZYXksIHdlJ3JlIGJpZ2dlciB0aGFuIHRoZSBwcmV2aW91cyFcblx0XHRcdFx0YnJlYWtcblx0XHRcdGVsc2Vcblx0XHRcdFx0IyBOb3BlLCBsZXQncyB3YWxrIGJhY2sgdGhlIGNoYWluXG5cdFx0XHRcdHByZXZJZHggPSBwcmV2Q2hhaW5bcHJldklkeF1cblxuXHRcdHByZXZDaGFpbi5wdXNoKHByZXZJZHgpXG5cblx0XHR2YXIgY3Vyckxlbmd0aCA9IChwcmV2SWR4ID09IC0xKSA/IDAgOiBsZW5ndGhDaGFpbltwcmV2SWR4XSsxXG5cblx0XHRpZiBjdXJyTGVuZ3RoID4gbWF4Q2hhaW5MZW5ndGhcblx0XHRcdG1heENoYWluTGVuZ3RoID0gY3Vyckxlbmd0aFxuXHRcdFx0bWF4Q2hhaW5FbmQgPSBpZHhcblxuXHRcdGxlbmd0aENoYWluLnB1c2goY3Vyckxlbmd0aClcblxuXHR2YXIgc3RpY2t5Tm9kZXMgPSBbXVxuXG5cdCMgTm93IHdlIGNhbiB3YWxrIHRoZSBsb25nZXN0IGNoYWluIGJhY2t3YXJkcyBhbmQgbWFyayB0aGVtIGFzIFwic3RpY2t5XCIsXG5cdCMgd2hpY2ggaW1wbGllcyB0aGF0IHRoZXkgc2hvdWxkIG5vdCBiZSBtb3ZlZFxuXHR2YXIgY3Vyc29yID0gbmV3UG9zaXRpb246bGVuZ3RoIC0gMVxuXHR3aGlsZSBjdXJzb3IgPj0gMFxuXHRcdGlmIGN1cnNvciA9PSBtYXhDaGFpbkVuZCBhbmQgbmV3UG9zaXRpb25bY3Vyc29yXSAhPSAtMVxuXHRcdFx0c3RpY2t5Tm9kZXNbbmV3UG9zaXRpb25bY3Vyc29yXV0gPSB0cnVlXG5cdFx0XHRtYXhDaGFpbkVuZCA9IHByZXZDaGFpblttYXhDaGFpbkVuZF1cblx0XHRcblx0XHRjdXJzb3IgLT0gMVxuXG5cdCMgQW5kIGxldCdzIGl0ZXJhdGUgZm9yd2FyZCwgYnV0IG9ubHkgbW92ZSBub24tc3RpY2t5IG5vZGVzXG5cdGZvciBub2RlLCBpZHggaW4gbmV3XG5cdFx0aWYgIXN0aWNreU5vZGVzW2lkeF1cblx0XHRcdHZhciBhZnRlciA9IG5ld1tpZHggLSAxXVxuXHRcdFx0aW5zZXJ0TmVzdGVkQWZ0ZXIocm9vdCwgbm9kZSwgKGFmdGVyIGFuZCBhZnRlci5AZG9tKSBvciBjYXJldClcblxuXHQjIHNob3VsZCB0cnVzdCB0aGF0IHRoZSBsYXN0IGl0ZW0gaW4gbmV3IGxpc3QgaXMgdGhlIGNhcmV0XG5cdHJldHVybiBsYXN0TmV3IGFuZCBsYXN0TmV3LkBkb20gb3IgY2FyZXRcblxuXG4jIGV4cGVjdHMgYSBmbGF0IG5vbi1zcGFyc2UgYXJyYXkgb2Ygbm9kZXMgaW4gYm90aCBuZXcgYW5kIG9sZCwgYWx3YXlzXG5kZWYgcmVjb25jaWxlQ29sbGVjdGlvbiByb290LCBuZXcsIG9sZCwgY2FyZXRcblx0dmFyIGsgPSBuZXc6bGVuZ3RoXG5cdHZhciBpID0ga1xuXHR2YXIgbGFzdCA9IG5ld1trIC0gMV1cblxuXG5cdGlmIGsgPT0gb2xkOmxlbmd0aCBhbmQgbmV3WzBdID09PSBvbGRbMF1cblx0XHQjIHJ1bm5pbmcgdGhyb3VnaCB0byBjb21wYXJlXG5cdFx0d2hpbGUgaS0tXG5cdFx0XHRicmVhayBpZiBuZXdbaV0gIT09IG9sZFtpXVxuXG5cdGlmIGkgPT0gLTFcblx0XHRyZXR1cm4gbGFzdCBhbmQgbGFzdC5AZG9tIG9yIGNhcmV0XG5cdGVsc2Vcblx0XHRyZXR1cm4gcmVjb25jaWxlQ29sbGVjdGlvbkNoYW5nZXMocm9vdCxuZXcsb2xkLGNhcmV0KVxuXG4jIHRoZSBnZW5lcmFsIHJlY29uY2lsZXIgdGhhdCByZXNwZWN0cyBjb25kaXRpb25zIGV0Y1xuIyBjYXJldCBpcyB0aGUgY3VycmVudCBub2RlIHdlIHdhbnQgdG8gaW5zZXJ0IHRoaW5ncyBhZnRlclxuZGVmIHJlY29uY2lsZU5lc3RlZCByb290LCBuZXcsIG9sZCwgY2FyZXRcblxuXHQjIGlmIG5ldyA9PSBudWxsIG9yIG5ldyA9PT0gZmFsc2Ugb3IgbmV3ID09PSB0cnVlXG5cdCMgXHRpZiBuZXcgPT09IG9sZFxuXHQjIFx0XHRyZXR1cm4gY2FyZXRcblx0IyBcdGlmIG9sZCAmJiBuZXcgIT0gb2xkXG5cdCMgXHRcdHJlbW92ZU5lc3RlZChyb290LG9sZCxjYXJldCkgaWYgb2xkXG5cdCMgXG5cdCMgXHRyZXR1cm4gY2FyZXRcblxuXHQjIHZhciBza2lwbmV3ID0gbmV3ID09IG51bGwgb3IgbmV3ID09PSBmYWxzZSBvciBuZXcgPT09IHRydWVcblx0dmFyIG5ld0lzTnVsbCA9IG5ldyA9PSBudWxsIG9yIG5ldyA9PT0gZmFsc2Vcblx0dmFyIG9sZElzTnVsbCA9IG9sZCA9PSBudWxsIG9yIG9sZCA9PT0gZmFsc2VcblxuXG5cdGlmIG5ldyA9PT0gb2xkXG5cdFx0IyByZW1lbWJlciB0aGF0IHRoZSBjYXJldCBtdXN0IGJlIGFuIGFjdHVhbCBkb20gZWxlbWVudFxuXHRcdCMgd2Ugc2hvdWxkIGluc3RlYWQgbW92ZSB0aGUgYWN0dWFsIGNhcmV0PyAtIHRydXN0XG5cdFx0aWYgbmV3SXNOdWxsXG5cdFx0XHRyZXR1cm4gY2FyZXRcblx0XHRlbGlmIG5ldyBhbmQgbmV3LkBkb21cblx0XHRcdHJldHVybiBuZXcuQGRvbVxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBjYXJldCA/IGNhcmV0Om5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblxuXHRlbGlmIG5ldyBpc2EgQXJyYXlcblx0XHRpZiBvbGQgaXNhIEFycmF5XG5cdFx0XHRpZiBuZXc6c3RhdGljIG9yIG9sZDpzdGF0aWNcblx0XHRcdFx0IyBpZiB0aGUgc3RhdGljIGlzIG5vdCBuZXN0ZWQgLSB3ZSBjb3VsZCBnZXQgYSBoaW50IGZyb20gY29tcGlsZXJcblx0XHRcdFx0IyBhbmQganVzdCBza2lwIGl0XG5cdFx0XHRcdGlmIG5ldzpzdGF0aWMgPT0gb2xkOnN0YXRpY1xuXHRcdFx0XHRcdGZvciBpdGVtLGkgaW4gbmV3XG5cdFx0XHRcdFx0XHQjIHRoaXMgaXMgd2hlcmUgd2UgY291bGQgZG8gdGhlIHRyaXBsZSBlcXVhbCBkaXJlY3RseVxuXHRcdFx0XHRcdFx0Y2FyZXQgPSByZWNvbmNpbGVOZXN0ZWQocm9vdCxpdGVtLG9sZFtpXSxjYXJldClcblx0XHRcdFx0XHRyZXR1cm4gY2FyZXRcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHJlbW92ZU5lc3RlZChyb290LG9sZCxjYXJldClcblx0XHRcdFx0XHRcblx0XHRcdFx0IyBpZiB0aGV5IGFyZSBub3QgdGhlIHNhbWUgd2UgY29udGludWUgdGhyb3VnaCB0byB0aGUgZGVmYXVsdFxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRyZXR1cm4gcmVjb25jaWxlQ29sbGVjdGlvbihyb290LG5ldyxvbGQsY2FyZXQpXG5cblx0XHRlbGlmIG9sZCBpc2EgSW1iYVRhZ1xuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChvbGQpXG5cdFx0ZWxpZiAhb2xkSXNOdWxsXG5cdFx0XHQjIG9sZCB3YXMgYSBzdHJpbmctbGlrZSBvYmplY3Q/XG5cdFx0XHRyb290LnJlbW92ZUNoaWxkKGNhcmV0ID8gY2FyZXQ6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZClcdFx0XHRcblxuXHRcdHJldHVybiBpbnNlcnROZXN0ZWRBZnRlcihyb290LG5ldyxjYXJldClcblx0XHQjIHJlbW92ZSBvbGRcblxuXHRlbGlmIG5ldyBpc2EgSW1iYVRhZ1xuXHRcdHJlbW92ZU5lc3RlZChyb290LG9sZCxjYXJldCkgdW5sZXNzIG9sZElzTnVsbFxuXHRcdGluc2VydE5lc3RlZEFmdGVyKHJvb3QsbmV3LGNhcmV0KVxuXHRcdHJldHVybiBuZXdcblxuXHRlbGlmIG5ld0lzTnVsbFxuXHRcdHJlbW92ZU5lc3RlZChyb290LG9sZCxjYXJldCkgdW5sZXNzIG9sZElzTnVsbFxuXHRcdHJldHVybiBjYXJldFxuXHRlbHNlXG5cdFx0IyBpZiBvbGQgZGlkIG5vdCBleGlzdCB3ZSBuZWVkIHRvIGFkZCBhIG5ldyBkaXJlY3RseVxuXHRcdGxldCBuZXh0Tm9kZVxuXHRcdCMgaWYgb2xkIHdhcyBhcnJheSBvciBpbWJhdGFnIHdlIG5lZWQgdG8gcmVtb3ZlIGl0IGFuZCB0aGVuIGFkZFxuXHRcdGlmIG9sZCBpc2EgQXJyYXlcblx0XHRcdHJlbW92ZU5lc3RlZChyb290LG9sZCxjYXJldClcblx0XHRlbGlmIG9sZCBpc2EgSW1iYVRhZ1xuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChvbGQpXG5cdFx0ZWxpZiAhb2xkSXNOdWxsXG5cdFx0XHQjIC4uLlxuXHRcdFx0bmV4dE5vZGUgPSBjYXJldCA/IGNhcmV0Om5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblx0XHRcdGlmIG5leHROb2RlIGlzYSBUZXh0IGFuZCBuZXh0Tm9kZTp0ZXh0Q29udGVudCAhPSBuZXdcblx0XHRcdFx0bmV4dE5vZGU6dGV4dENvbnRlbnQgPSBuZXdcblx0XHRcdFx0cmV0dXJuIG5leHROb2RlXG5cblx0XHQjIG5vdyBhZGQgdGhlIHRleHRub2RlXG5cdFx0cmV0dXJuIGluc2VydE5lc3RlZEFmdGVyKHJvb3QsbmV3LGNhcmV0KVxuXG5cbmV4dGVuZCB0YWcgaHRtbGVsZW1lbnRcblx0XG5cdGRlZiBzZXRDaGlsZHJlbiBuZXcsIHR5cFxuXHRcdHZhciBvbGQgPSBAY2hpbGRyZW5cblx0XHQjIHZhciBpc0FycmF5ID0gbm9kZXMgaXNhIEFycmF5XG5cdFx0aWYgbmV3ID09PSBvbGRcblx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRpZiAhb2xkXG5cdFx0XHRlbXB0eVxuXHRcdFx0YXBwZW5kTmVzdGVkKHNlbGYsbmV3KVxuXG5cdFx0ZWxpZiB0eXAgPT0gMlxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdGVsaWYgdHlwID09IDFcblx0XHRcdCMgaGVyZSB3ZSBfa25vdyBfdGhhdCBpdCBpcyBhbiBhcnJheSB3aXRoIHRoZSBzYW1lIHNoYXBlXG5cdFx0XHQjIGV2ZXJ5IHRpbWVcblx0XHRcdGxldCBjYXJldCA9IG51bGxcblx0XHRcdGZvciBpdGVtLGkgaW4gbmV3XG5cdFx0XHRcdCMgcHJldiA9IG9sZFtpXVxuXHRcdFx0XHRjYXJldCA9IHJlY29uY2lsZU5lc3RlZChzZWxmLGl0ZW0sb2xkW2ldLGNhcmV0KVxuXG5cdFx0ZWxpZiB0eXAgPT0gM1xuXHRcdFx0IyB0aGlzIGlzIHBvc3NpYmx5IGZ1bGx5IGR5bmFtaWMuIEl0IG9mdGVuIGlzXG5cdFx0XHQjIGJ1dCB0aGUgb2xkIG9yIG5ldyBjb3VsZCBiZSBzdGF0aWMgd2hpbGUgdGhlIG90aGVyIGlzIG5vdFxuXHRcdFx0IyB0aGlzIGlzIG5vdCBoYW5kbGVkIG5vd1xuXHRcdFx0IyB3aGF0IGlmIGl0IHdhcyBwcmV2aW91c2x5IGEgc3RhdGljIGFycmF5PyBlZGdlY2FzZSAtIGJ1dCBtdXN0IHdvcmtcblx0XHRcdGlmIG5ldyBpc2EgSW1iYVRhZ1xuXHRcdFx0XHRlbXB0eVxuXHRcdFx0XHRhcHBlbmRDaGlsZChuZXcpXG5cblx0XHRcdCMgY2hlY2sgaWYgb2xkIGFuZCBuZXcgaXNhIGFycmF5XG5cdFx0XHRlbGlmIG5ldyBpc2EgQXJyYXlcblx0XHRcdFx0aWYgb2xkIGlzYSBBcnJheVxuXHRcdFx0XHRcdCMgaXMgdGhpcyBub3QgdGhlIHNhbWUgYXMgc2V0dGluZyBzdGF0aWNDaGlsZHJlbiBub3cgYnV0IHdpdGggdGhlXG5cdFx0XHRcdFx0cmVjb25jaWxlQ29sbGVjdGlvbihzZWxmLG5ldyxvbGQsbnVsbClcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGVtcHR5XG5cdFx0XHRcdFx0YXBwZW5kTmVzdGVkKHNlbGYsbmV3KVxuXHRcdFx0XHRcblx0XHRcdGVsc2Vcblx0XHRcdFx0dGV4dCA9IG5ld1xuXHRcdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0ZWxpZiBuZXcgaXNhIEFycmF5IGFuZCBvbGQgaXNhIEFycmF5XG5cdFx0XHRyZWNvbmNpbGVDb2xsZWN0aW9uKHNlbGYsbmV3LG9sZCxudWxsKVxuXHRcdGVsc2Vcblx0XHRcdGVtcHR5XG5cdFx0XHRhcHBlbmROZXN0ZWQoc2VsZixuZXcpXG5cblx0XHRAY2hpbGRyZW4gPSBuZXdcblx0XHRyZXR1cm4gc2VsZlxuXG5cblx0IyBvbmx5IGV2ZXIgY2FsbGVkIHdpdGggYXJyYXkgYXMgYXJndW1lbnRcblx0ZGVmIHNldFN0YXRpY0NoaWxkcmVuIG5ld1xuXHRcdHZhciBvbGQgPSBAY2hpbGRyZW5cblxuXHRcdGxldCBjYXJldCA9IG51bGxcblx0XHRmb3IgaXRlbSxpIGluIG5ld1xuXHRcdFx0IyBwcmV2ID0gb2xkW2ldXG5cdFx0XHRjYXJldCA9IHJlY29uY2lsZU5lc3RlZChzZWxmLGl0ZW0sb2xkW2ldLGNhcmV0KVxuXG5cdFx0QGNoaWxkcmVuID0gbmV3XG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgY29udGVudFxuXHRcdEBjb250ZW50IG9yIGNoaWxkcmVuLnRvQXJyYXlcblxuXHRkZWYgdGV4dD0gdGV4dFxuXHRcdGlmIHRleHQgIT0gQGNoaWxkcmVuXG5cdFx0XHRAY2hpbGRyZW4gPSB0ZXh0XG5cdFx0XHRkb206dGV4dENvbnRlbnQgPSB0ZXh0ID09IG51bGwgb3IgdGV4dCA9PT0gZmFsc2UgPyAnJyA6IHRleHRcblx0XHRzZWxmXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogc3JjL2ltYmEvZG9tLnN0YXRpYy5pbWJhXG4gKiovIiwiXG4jIyNcblRoZSBzcGVjaWFsIHN5bnRheCBmb3Igc2VsZWN0b3JzIGluIEltYmEgY3JlYXRlcyBJbWJhLlNlbGVjdG9yXG5pbnN0YW5jZXMuXG4jIyNcbmNsYXNzIEltYmEuU2VsZWN0b3Jcblx0XG5cdGRlZiBzZWxmLm9uZSBzZWwsIHNjb3BlXG5cdFx0dmFyIGVsID0gKHNjb3BlIHx8IEltYmEuZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3Ioc2VsKVxuXHRcdGVsICYmIHRhZyhlbCkgfHwgbnVsbFxuXG5cdGRlZiBzZWxmLmFsbCBzZWwsIHNjb3BlXG5cdFx0SW1iYS5TZWxlY3Rvci5uZXcoc2VsLHNjb3BlKVxuXG5cdHByb3AgcXVlcnlcblxuXHRkZWYgaW5pdGlhbGl6ZSBzZWwsIHNjb3BlLCBub2Rlc1xuXG5cdFx0QHF1ZXJ5ID0gc2VsIGlzYSBJbWJhLlNlbGVjdG9yID8gc2VsLnF1ZXJ5IDogc2VsXG5cdFx0QGNvbnRleHQgPSBzY29wZVxuXG5cdFx0aWYgbm9kZXNcblx0XHRcdEBub2RlcyA9ICh0YWcobm9kZSkgZm9yIG5vZGUgaW4gbm9kZXMpXG5cblx0XHRAbGF6eSA9ICFub2Rlc1xuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIHJlbG9hZFxuXHRcdEBub2RlcyA9IG51bGxcblx0XHRzZWxmXG5cblx0ZGVmIHNjb3BlXG5cdFx0cmV0dXJuIEBzY29wZSBpZiBAc2NvcGVcblx0XHRyZXR1cm4gSW1iYS5kb2N1bWVudCB1bmxlc3MgdmFyIGN0eCA9IEBjb250ZXh0XG5cdFx0QHNjb3BlID0gY3R4OnRvU2NvcGUgPyBjdHgudG9TY29wZSA6IGN0eFxuXG5cdCMjI1xuXHRAcmV0dXJucyB7SW1iYS5UYWd9IGZpcnN0IG5vZGUgbWF0Y2hpbmcgdGhpcyBzZWxlY3RvclxuXHQjIyNcblx0ZGVmIGZpcnN0XG5cdFx0aWYgQGxhenkgdGhlbiB0YWcoQGZpcnN0IHx8PSBzY29wZS5xdWVyeVNlbGVjdG9yKHF1ZXJ5KSlcblx0XHRlbHNlIG5vZGVzWzBdXG5cblx0IyMjXG5cdEByZXR1cm5zIHtJbWJhLlRhZ30gbGFzdCBub2RlIG1hdGNoaW5nIHRoaXMgc2VsZWN0b3Jcblx0IyMjXG5cdGRlZiBsYXN0XG5cdFx0bm9kZXNbQG5vZGVzOmxlbmd0aCAtIDFdXG5cblx0IyMjXG5cdEByZXR1cm5zIFtJbWJhLlRhZ10gYWxsIG5vZGVzIG1hdGNoaW5nIHRoaXMgc2VsZWN0b3Jcblx0IyMjXG5cdGRlZiBub2Rlc1xuXHRcdHJldHVybiBAbm9kZXMgaWYgQG5vZGVzXG5cdFx0dmFyIGl0ZW1zID0gc2NvcGUucXVlcnlTZWxlY3RvckFsbChxdWVyeSlcblx0XHRAbm9kZXMgPSAodGFnKG5vZGUpIGZvciBub2RlIGluIGl0ZW1zKVxuXHRcdEBsYXp5ID0gbm9cblx0XHRAbm9kZXNcblx0XG5cdCMjI1xuXHRUaGUgbnVtYmVyIG9mIG5vZGVzIG1hdGNoaW5nIHRoaXMgc2VsZWN0b3Jcblx0IyMjXG5cdGRlZiBjb3VudCBkbyBub2RlczpsZW5ndGhcblxuXHRkZWYgbGVuIGRvIG5vZGVzOmxlbmd0aFxuXG5cdCMjI1xuXHRAdG9kbyBBZGQgc3VwcG9ydCBmb3IgYmxvY2sgb3Igc2VsZWN0b3I/XG5cdCMjI1xuXHRkZWYgc29tZVxuXHRcdGNvdW50ID49IDFcblx0XG5cdCMjI1xuXHRHZXQgbm9kZSBhdCBpbmRleFxuXHQjIyNcblx0ZGVmIGF0IGlkeFxuXHRcdG5vZGVzW2lkeF1cblxuXHQjIyNcblx0TG9vcCB0aHJvdWdoIG5vZGVzXG5cdCMjI1xuXHRkZWYgZm9yRWFjaCBibG9ja1xuXHRcdG5vZGVzLmZvckVhY2goYmxvY2spXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRNYXAgbm9kZXNcblx0IyMjXG5cdGRlZiBtYXAgYmxvY2tcblx0XHRub2Rlcy5tYXAoYmxvY2spXG5cblx0IyMjXG5cdFJldHVybnMgYSBwbGFpbiBhcnJheSBjb250YWluaW5nIG5vZGVzLiBJbXBsaWNpdGx5IGNhbGxlZFxuXHR3aGVuIGl0ZXJhdGluZyBvdmVyIGEgc2VsZWN0b3IgaW4gSW1iYSBgKG5vZGUgZm9yIG5vZGUgaW4gJChzZWxlY3RvcikpYFxuXHQjIyNcblx0ZGVmIHRvQXJyYXlcblx0XHRub2Rlc1xuXHRcblx0IyBHZXQgdGhlIGZpcnN0IGVsZW1lbnQgdGhhdCBtYXRjaGVzIHRoZSBzZWxlY3RvciwgXG5cdCMgYmVnaW5uaW5nIGF0IHRoZSBjdXJyZW50IGVsZW1lbnQgYW5kIHByb2dyZXNzaW5nIHVwIHRocm91Z2ggdGhlIERPTSB0cmVlXG5cdGRlZiBjbG9zZXN0IHNlbFxuXHRcdCMgc2VlbXMgc3RyYW5nZSB0aGF0IHdlIGFsdGVyIHRoaXMgc2VsZWN0b3I/XG5cdFx0QG5vZGVzID0gbWFwIGRvIHxub2RlfCBub2RlLmNsb3Nlc3Qoc2VsKVxuXHRcdHNlbGZcblxuXHQjIEdldCB0aGUgc2libGluZ3Mgb2YgZWFjaCBlbGVtZW50IGluIHRoZSBzZXQgb2YgbWF0Y2hlZCBlbGVtZW50cywgXG5cdCMgb3B0aW9uYWxseSBmaWx0ZXJlZCBieSBhIHNlbGVjdG9yLlxuXHQjIFRPRE8gcmVtb3ZlIGR1cGxpY2F0ZXM/XG5cdGRlZiBzaWJsaW5ncyBzZWxcblx0XHRAbm9kZXMgPSBtYXAgZG8gfG5vZGV8IG5vZGUuc2libGluZ3Moc2VsKVxuXHRcdHNlbGZcblxuXHQjIEdldCB0aGUgZGVzY2VuZGFudHMgb2YgZWFjaCBlbGVtZW50IGluIHRoZSBjdXJyZW50IHNldCBvZiBtYXRjaGVkIFxuXHQjIGVsZW1lbnRzLCBmaWx0ZXJlZCBieSBhIHNlbGVjdG9yLlxuXHRkZWYgZmluZCBzZWxcblx0XHRAbm9kZXMgPSBfX3F1ZXJ5X18oc2VsLnF1ZXJ5LCBub2Rlcylcblx0XHRzZWxmXG5cblx0ZGVmIHJlamVjdCBibGtcblx0XHRmaWx0ZXIoYmxrLG5vKVxuXG5cdCMjI1xuXHRGaWx0ZXIgdGhlIG5vZGVzIGluIHNlbGVjdG9yIGJ5IGEgZnVuY3Rpb24gb3Igb3RoZXIgc2VsZWN0b3Jcblx0IyMjXG5cdGRlZiBmaWx0ZXIgYmxrLCBib29sID0geWVzXG5cdFx0dmFyIGZuID0gYmxrIGlzYSBGdW5jdGlvbiBhbmQgYmxrIG9yICh8bnwgbi5tYXRjaGVzKGJsaykgKVxuXHRcdHZhciBhcnkgPSBub2Rlcy5maWx0ZXIofG58IGZuKG4pID09IGJvb2wpXG5cdFx0IyBpZiB3ZSB3YW50IHRvIHJldHVybiBhIG5ldyBzZWxlY3RvciBmb3IgdGhpcywgd2Ugc2hvdWxkIGRvIHRoYXQgZm9yXG5cdFx0IyBvdGhlcnMgYXMgd2VsbFxuXHRcdEltYmEuU2VsZWN0b3IubmV3KFwiXCIsIEBzY29wZSwgYXJ5KVxuXG5cdGRlZiBfX3F1ZXJ5X18gcXVlcnksIGNvbnRleHRzXG5cdFx0dmFyIG5vZGVzID0gW11cblx0XHR2YXIgaSA9IDBcblx0XHR2YXIgbCA9IGNvbnRleHRzOmxlbmd0aFxuXG5cdFx0d2hpbGUgaSA8IGxcblx0XHRcdG5vZGVzLnB1c2goKmNvbnRleHRzW2krK10ucXVlcnlTZWxlY3RvckFsbChxdWVyeSkpXG5cdFx0cmV0dXJuIG5vZGVzXG5cblx0ZGVmIF9fbWF0Y2hlc19fXG5cdFx0cmV0dXJuIHllc1xuXG5cdCMjI1xuXHRBZGQgc3BlY2lmaWVkIGZsYWcgdG8gYWxsIG5vZGVzIGluIHNlbGVjdG9yXG5cdCMjI1xuXHRkZWYgZmxhZyBmbGFnXG5cdFx0Zm9yRWFjaCBkbyB8bnwgbi5mbGFnKGZsYWcpXG5cblx0IyMjXG5cdFJlbW92ZSBzcGVjaWZpZWQgZmxhZyBmcm9tIGFsbCBub2RlcyBpbiBzZWxlY3RvclxuXHQjIyNcblx0ZGVmIHVuZmxhZyBmbGFnXG5cdFx0Zm9yRWFjaCBkbyB8bnwgbi51bmZsYWcoZmxhZylcblxuXG4jIGRlZiBJbWJhLnF1ZXJ5U2VsZWN0b3JBbGxcbnEkID0gZG8gfHNlbCxzY29wZXwgSW1iYS5TZWxlY3Rvci5uZXcoc2VsLCBzY29wZSlcblxuIyBkZWYgSW1iYS5TZWxlY3Rvci5vbmVcbnEkJCA9IGRvIHxzZWwsc2NvcGV8IFxuXHR2YXIgZWwgPSAoc2NvcGUgfHwgSW1iYS5kb2N1bWVudCkucXVlcnlTZWxlY3RvcihzZWwpXG5cdGVsICYmIHRhZyhlbCkgfHwgbmlsXG5cblxuIyBleHRlbmRpbmcgdGFncyB3aXRoIHF1ZXJ5LW1ldGhvZHNcbiMgbXVzdCBiZSBhIGJldHRlciB3YXkgdG8gcmVvcGVuIGNsYXNzZXNcbmV4dGVuZCB0YWcgZWxlbWVudFxuXHRkZWYgcXVlcnlTZWxlY3RvckFsbCBxIGRvIEBkb20ucXVlcnlTZWxlY3RvckFsbCBxXG5cdGRlZiBxdWVyeVNlbGVjdG9yIHEgZG8gQGRvbS5xdWVyeVNlbGVjdG9yIHFcblxuXHQjIHNob3VsZCBiZSBtb3ZlZCB0byBJbWJhLlRhZyBpbnN0ZWFkP1xuXHQjIG9yIHdlIHNob3VsZCBpbXBsZW1lbnQgYWxsIG9mIHRoZW0gaGVyZVxuXHRkZWYgZmluZCBzZWwgZG8gSW1iYS5TZWxlY3Rvci5uZXcoc2VsLHNlbGYpXG5cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHNyYy9pbWJhL3NlbGVjdG9yLmltYmFcbiAqKi8iXSwic291cmNlUm9vdCI6IiJ9