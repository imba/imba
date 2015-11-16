(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.imba = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(){
	
	if (typeof Imba === 'undefined') {
		require('./imba');
		
		Imba.CLIENT = true;
		
		require('./core.events');
		require('./scheduler');
		require('./tag');
		require('./dom');
		require('./dom.client');
		require('./dom.html');
		require('./dom.legacy');
		require('./dom.events');
		require('./dom.static');
		return require('./selector');
	};

})()
},{"./core.events":2,"./dom":6,"./dom.client":3,"./dom.events":4,"./dom.html":5,"./dom.legacy":7,"./dom.static":8,"./imba":9,"./scheduler":10,"./selector":11,"./tag":12}],2:[function(require,module,exports){
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
		if (!meta) { return };
		
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
},{}],3:[function(require,module,exports){
(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	// Extending Imba.Tag#css to work without prefixes by inspecting
	// the properties of a CSSStyleDeclaration and creating a map
	
	// var prefixes = ['-webkit-','-ms-','-moz-','-o-','-blink-']
	// var props = ['transform','transition','animation']
	
	var styles = window.getComputedStyle(document.documentElement,'');
	
	Imba.CSSKeyMap = {};
	
	for (var i = 0, ary = iter$(styles), len = ary.length, prefixed; i < len; i++) {
		prefixed = ary[i];
		var unprefixed = prefixed.replace(/^-(webkit|ms|moz|o|blink)-/,'');
		var camelCase = unprefixed.replace(/-(\w)/g,function(m,a) { return a.toUpperCase(); });
		
		// if there exists an unprefixed version -- always use this
		if (prefixed != unprefixed) {
			if (styles.hasOwnProperty(unprefixed)) { continue };
		};
		
		// register the prefixes
		Imba.CSSKeyMap[unprefixed] = Imba.CSSKeyMap[camelCase] = prefixed;
	};
	
	return Imba.extendTag('htmlelement', function(tag){
		
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

})()
},{}],4:[function(require,module,exports){
(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	var doc = document;
	var win = window;
	
	var hasTouchEvents = window && window.ontouchstart !== undefined; // .hasOwnProperty('ontouchstart')
	
	// will remove
	function RingBuffer(len){
		if(len === undefined) len = 10;
		this._array = [];
		this._keep = len;
		this._head = 0;
		return this;
	};
	
	
	RingBuffer.prototype.__head = {name: 'head'};
	RingBuffer.prototype.head = function(v){ return this._head; }
	RingBuffer.prototype.setHead = function(v){ this._head = v; return this; };
	
	RingBuffer.prototype.push = function (obj){
		var i = this._head++;
		this._array[i % this._keep] = obj;
		return i;
	};
	
	RingBuffer.prototype.last = function (){
		return this._array[this._head % this._keep];
	};
	
	
	Imba.Pointer = function Pointer(){
		this.setButton(-1);
		this.setEvents(new RingBuffer(10));
		this.setEvent({x: 0,y: 0,type: 'uninitialized'});
		return this;
	};
	
	
	Imba.Pointer.prototype.__phase = {name: 'phase'};
	Imba.Pointer.prototype.phase = function(v){ return this._phase; }
	Imba.Pointer.prototype.setPhase = function(v){ this._phase = v; return this; };
	
	Imba.Pointer.prototype.__prevEvent = {name: 'prevEvent'};
	Imba.Pointer.prototype.prevEvent = function(v){ return this._prevEvent; }
	Imba.Pointer.prototype.setPrevEvent = function(v){ this._prevEvent = v; return this; };
	
	Imba.Pointer.prototype.__button = {name: 'button'};
	Imba.Pointer.prototype.button = function(v){ return this._button; }
	Imba.Pointer.prototype.setButton = function(v){ this._button = v; return this; };
	
	Imba.Pointer.prototype.__event = {name: 'event'};
	Imba.Pointer.prototype.event = function(v){ return this._event; }
	Imba.Pointer.prototype.setEvent = function(v){ this._event = v; return this; };
	
	Imba.Pointer.prototype.__dirty = {name: 'dirty'};
	Imba.Pointer.prototype.dirty = function(v){ return this._dirty; }
	Imba.Pointer.prototype.setDirty = function(v){ this._dirty = v; return this; };
	
	Imba.Pointer.prototype.__events = {name: 'events'};
	Imba.Pointer.prototype.events = function(v){ return this._events; }
	Imba.Pointer.prototype.setEvents = function(v){ this._events = v; return this; };
	
	Imba.Pointer.prototype.__touch = {name: 'touch'};
	Imba.Pointer.prototype.touch = function(v){ return this._touch; }
	Imba.Pointer.prototype.setTouch = function(v){ this._touch = v; return this; };
	
	Imba.Pointer.prototype.update = function (e){
		// console.log(e)
		this.setEvent(e);
		// normalize the event / touch?
		this.events().push(e);
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
				this.setTouch(new Imba.Touch(e1,this));
				this.touch().mousedown(e1,e1);
			} else if (e1.type == 'mousemove') {
				if (this.touch()) { this.touch().mousemove(e1,e1) };
			} else if (e1.type == 'mouseup') {
				this.setButton(-1);
				if (this.touch()) { this.touch().mouseup(e1,e1) };
				this.setTouch(null); // reuse?
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
	
	# custom draggable tag
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
		this._suppress = false;
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
		// return touch if var touch = item:__touch__
		return item && (item.__touch__ || identifiers[item.identifier]);
		// look for lookup
		// var id = item:identifier
		// if id != undefined and (touch = IMBA_TOUCH_IDENTIFIERS{id})
		// 	return touch 
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
			if (this.lookup(t)) { continue };
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
	
	
	
	Imba.Touch.prototype.__phase = {name: 'phase'};
	Imba.Touch.prototype.phase = function(v){ return this._phase; }
	Imba.Touch.prototype.setPhase = function(v){ this._phase = v; return this; };
	
	Imba.Touch.prototype.__active = {name: 'active'};
	Imba.Touch.prototype.active = function(v){ return this._active; }
	Imba.Touch.prototype.setActive = function(v){ this._active = v; return this; };
	
	Imba.Touch.prototype.__event = {name: 'event'};
	Imba.Touch.prototype.event = function(v){ return this._event; }
	Imba.Touch.prototype.setEvent = function(v){ this._event = v; return this; };
	
	Imba.Touch.prototype.__pointer = {name: 'pointer'};
	Imba.Touch.prototype.pointer = function(v){ return this._pointer; }
	Imba.Touch.prototype.setPointer = function(v){ this._pointer = v; return this; };
	
	Imba.Touch.prototype.__target = {name: 'target'};
	Imba.Touch.prototype.target = function(v){ return this._target; }
	Imba.Touch.prototype.setTarget = function(v){ this._target = v; return this; }; // if 'safe' we can cache multiple uses
	
	Imba.Touch.prototype.__handler = {name: 'handler'};
	Imba.Touch.prototype.handler = function(v){ return this._handler; }
	Imba.Touch.prototype.setHandler = function(v){ this._handler = v; return this; };
	
	Imba.Touch.prototype.__updates = {name: 'updates'};
	Imba.Touch.prototype.updates = function(v){ return this._updates; }
	Imba.Touch.prototype.setUpdates = function(v){ this._updates = v; return this; };
	
	Imba.Touch.prototype.__suppress = {name: 'suppress'};
	Imba.Touch.prototype.suppress = function(v){ return this._suppress; }
	Imba.Touch.prototype.setSuppress = function(v){ this._suppress = v; return this; };
	
	Imba.Touch.prototype.__data = {name: 'data'};
	Imba.Touch.prototype.data = function(v){ return this._data; }
	Imba.Touch.prototype.setData = function(v){ this._data = v; return this; };
	
	Imba.Touch.prototype.__bubble = {chainable: true,name: 'bubble'};
	Imba.Touch.prototype.bubble = function(v){ return v !== undefined ? (this.setBubble(v),this) : this._bubble; }
	Imba.Touch.prototype.setBubble = function(v){ this._bubble = v; return this; };
	
	
	Imba.Touch.prototype.__gestures = {name: 'gestures'};
	Imba.Touch.prototype.gestures = function(v){ return this._gestures; }
	Imba.Touch.prototype.setGestures = function(v){ this._gestures = v; return this; };
	
	// duration etc -- important
	/*
		
	
		@internal
		@constructor
		*/
	
	Imba.Touch.prototype.preventDefault = function (){
		this._preventDefault = true;
		this.event() && this.event().preventDefault();
		// pointer.event.preventDefault
		return this;
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
	
	Imba.Touch.prototype.touchstart = function (e,t){
		// console.log 'native ontouchstart',e,t
		this._event = e;
		this._touch = t;
		this._x = t.clientX;
		this._y = t.clientY;
		this.began();
		if (e && this._suppress) { e.preventDefault() };
		return this;
	};
	
	Imba.Touch.prototype.touchmove = function (e,t){
		// console.log 'native ontouchmove',e,t
		this._event = e;
		this._x = t.clientX;
		this._y = t.clientY;
		this.update();
		if (e && this._suppress) { e.preventDefault() };
		return this;
	};
	
	Imba.Touch.prototype.touchend = function (e,t){
		// console.log 'native ontouchend',e,t,e:timeStamp
		this._event = e;
		// log "touchend"
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
		
		if (e && this._suppress) {
			e.preventDefault();
		};
		
		return this;
	};
	
	Imba.Touch.prototype.touchcancel = function (e,t){
		// log "touchcancel"
		return this;
	};
	
	
	Imba.Touch.prototype.mousedown = function (e,t){
		// log "mousedown"
		var self = this;
		self._x = t.clientX;
		self._y = t.clientY;
		self.began();
		
		self._mousemove = function(e) { return self.mousemove(e,e); };
		doc.addEventListener('mousemove',self._mousemove,true);
		// inside here -- start tracking mousemove directly
		
		return self;
	};
	
	Imba.Touch.prototype.mousemove = function (e,t){
		this._x = t.clientX;
		this._y = t.clientY;
		this._event = e;
		if (this._suppress) { e.preventDefault() };
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
				if (!this._bubble) { break };
			};
			dom = dom.parentNode;
		};
		
		this._updates++;
		return this;
	};
	
	Imba.Touch.prototype.update = function (){
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
		
		if (this.target() && this.target().ontouchupdate) { this.target().ontouchupdate(this) };
		return this;
	};
	
	Imba.Touch.prototype.move = function (){
		if (!this._active) { return this };
		
		if (this._gestures) {
			for (var i = 0, ary = iter$(this._gestures), len = ary.length, g; i < len; i++) {
				g = ary[i];
				if (g.ontouchmove) { g.ontouchmove(this,this._event) };
			};
		};
		
		if (this.target() && this.target().ontouchmove) { this.target().ontouchmove(this,this._event) };
		return this;
	};
	
	Imba.Touch.prototype.ended = function (){
		if (!this._active) { return this };
		
		this._updates++;
		
		if (this._gestures) {
			for (var i = 0, ary = iter$(this._gestures), len = ary.length; i < len; i++) {
				ary[i].ontouchend(this);
			};
		};
		
		if (this.target() && this.target().ontouchend) { this.target().ontouchend(this) };
		
		return this;
	};
	
	Imba.Touch.prototype.cancelled = function (){
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
		Button pressed in this touch. Native touches defaults to left-click (0)
		@return {Number}
		*/
	
	Imba.Touch.prototype.button = function (){
		return this._pointer ? (this._pointer.button()) : (0);
	};
	
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
	
	
	Imba.Event.prototype.__event = {name: 'event'};
	Imba.Event.prototype.event = function(v){ return this._event; }
	Imba.Event.prototype.setEvent = function(v){ this._event = v; return this; };
	
	/* reference to the native event */
	
	
	Imba.Event.prototype.__prefix = {name: 'prefix'};
	Imba.Event.prototype.prefix = function(v){ return this._prefix; }
	Imba.Event.prototype.setPrefix = function(v){ this._prefix = v; return this; };
	
	
	Imba.Event.prototype.__data = {name: 'data'};
	Imba.Event.prototype.data = function(v){ return this._data; }
	Imba.Event.prototype.setData = function(v){ this._data = v; return this; };
	
	/*
		should remove this alltogether?
		@deprecated
		*/
	
	
	Imba.Event.prototype.__source = {name: 'source'};
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
			
			if (!sym && ki.substr(0,2) == "U+") {
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
		Imba.emit(Imba,'event',[this]);
		return this;
	};
	
	/*
		Return the x/left coordinate of the mouse / pointer for this event
		
		# tag syntax using bool
			node.prepend <div.top> # prepend node
	    	node.prepend "some text" # prepend text
	    	node.prepend [<ul>,<ul>] # prepend array
	
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
	
	
	Imba.EventManager.prototype.__root = {name: 'root'};
	Imba.EventManager.prototype.root = function(v){ return this._root; }
	Imba.EventManager.prototype.setRoot = function(v){ this._root = v; return this; };
	
	Imba.EventManager.prototype.__count = {name: 'count'};
	Imba.EventManager.prototype.count = function(v){ return this._count; }
	Imba.EventManager.prototype.setCount = function(v){ this._count = v; return this; };
	
	Imba.EventManager.prototype.__enabled = {'default': false,watch: 'enabledDidSet',name: 'enabled'};
	Imba.EventManager.prototype.enabled = function(v){ return this._enabled; }
	Imba.EventManager.prototype.setEnabled = function(v){
		var a = this.enabled();
		if(v != a) { v = this._enabled = v; }
		if(v != a) { this.enabledDidSet && this.enabledDidSet(v,a,this.__enabled) }
		return this;
	}
	Imba.EventManager.prototype._enabled = false;
	
	Imba.EventManager.prototype.__listeners = {name: 'listeners'};
	Imba.EventManager.prototype.listeners = function(v){ return this._listeners; }
	Imba.EventManager.prototype.setListeners = function(v){ this._listeners = v; return this; };
	
	Imba.EventManager.prototype.__delegators = {name: 'delegators'};
	Imba.EventManager.prototype.delegators = function(v){ return this._delegators; }
	Imba.EventManager.prototype.setDelegators = function(v){ this._delegators = v; return this; };
	
	Imba.EventManager.prototype.__delegator = {name: 'delegator'};
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
		
		for (var j = 0, ary = iter$(this.listeners()), len = ary.length, item; j < len; j++) {
			item = ary[j];
			this.root().addEventListener(item[0],item[1],item[2]);
		};
		return this;
	};
	
	Imba.EventManager.prototype.ondisable = function (){
		for (var o = this.delegators(), i = 0, keys = Object.keys(o), l = keys.length; i < l; i++){
			this.root().removeEventListener(keys[i],o[keys[i]],true);
		};
		
		for (var j = 0, ary = iter$(this.listeners()), len = ary.length, item; j < len; j++) {
			item = ary[j];
			this.root().removeEventListener(item[0],item[1],item[2]);
		};
		return this;
	};
	
	
	ED = Imba.Events = new Imba.EventManager(document,{events: [
		'keydown','keyup','keypress','textInput','input','change','submit',
		'focusin','focusout','blur','contextmenu','dblclick',
		'mousewheel','wheel'
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
},{}],5:[function(require,module,exports){
(function(){
	
	// predefine all supported html tags
	Imba.extendTag('htmlelement', function(tag){
		
		
		tag.prototype.__id = {name: 'id'};
		tag.prototype.id = function(v){ return this.getAttribute('id'); }
		tag.prototype.setId = function(v){ this.setAttribute('id',v); return this; };
		
		tag.prototype.__tabindex = {name: 'tabindex'};
		tag.prototype.tabindex = function(v){ return this.getAttribute('tabindex'); }
		tag.prototype.setTabindex = function(v){ this.setAttribute('tabindex',v); return this; };
		
		tag.prototype.__title = {name: 'title'};
		tag.prototype.title = function(v){ return this.getAttribute('title'); }
		tag.prototype.setTitle = function(v){ this.setAttribute('title',v); return this; };
		
		tag.prototype.__role = {name: 'role'};
		tag.prototype.role = function(v){ return this.getAttribute('role'); }
		tag.prototype.setRole = function(v){ this.setAttribute('role',v); return this; };
	});
	
	
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
		
		tag.prototype.__autofocus = {name: 'autofocus'};
		tag.prototype.autofocus = function(v){ return this.getAttribute('autofocus'); }
		tag.prototype.setAutofocus = function(v){ this.setAttribute('autofocus',v); return this; };
		
		tag.prototype.__type = {dom: true,name: 'type'};
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
		
		tag.prototype.__disabled = {dom: true,name: 'disabled'};
		tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
		tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
	});
	
	Imba.defineTag('canvas', function(tag){
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
	});
	
	
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
	
	Imba.defineTag('iframe', function(tag){
		
		tag.prototype.__src = {name: 'src'};
		tag.prototype.src = function(v){ return this.getAttribute('src'); }
		tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
	});
	
	Imba.defineTag('img', function(tag){
		
		tag.prototype.__src = {name: 'src'};
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
		
		
		tag.prototype.__autofocus = {name: 'autofocus'};
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
		
		tag.prototype.checked = function (){
			return this.dom().checked;
		};
		
		tag.prototype.setChecked = function (bool){
			if (bool != this.dom().checked) { this.dom().checked = bool };
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
		
		tag.prototype.__name = {name: 'name'};
		tag.prototype.name = function(v){ return this.getAttribute('name'); }
		tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
		
		tag.prototype.__multiple = {dom: true,name: 'multiple'};
		tag.prototype.multiple = function(v){ return this.getAttribute('multiple'); }
		tag.prototype.setMultiple = function(v){ this.setAttribute('multiple',v); return this; };
		
		tag.prototype.__required = {dom: true,name: 'required'};
		tag.prototype.required = function(v){ return this.getAttribute('required'); }
		tag.prototype.setRequired = function(v){ this.setAttribute('required',v); return this; };
		
		tag.prototype.__disabled = {dom: true,name: 'disabled'};
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
		
		
		tag.prototype.__autofocus = {name: 'autofocus'};
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
	return Imba.defineTag('wbr');

})()
},{}],6:[function(require,module,exports){
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
	
	Imba.defineTag('htmlelement','element', function(tag){
		
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
	
	return Imba.defineTag('svgelement','htmlelement');

})()
},{}],7:[function(require,module,exports){
(function(){
	if (!document.documentElement.classList) {
		Imba.extendTag('htmlelement', function(tag){
			
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
				if (arguments.length == 2 && !!bool === false) {
					return this.unflag(ref);
				};
				return this.addFlag(ref);
			};
		});
		
		return true;
	};

})()
},{}],8:[function(require,module,exports){
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
				if (new$[i] !== old[i]) { break };
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
			} else if (!oldIsNull) {
				// old was a string-like object?
				root.removeChild(caret ? (caret.nextSibling) : (root._dom.firstChild));
			};
			
			return insertNestedAfter(root,new$,caret);
			// remove old
		} else if (new$ instanceof ImbaTag) {
			if (!oldIsNull) { removeNested(root,old,caret) };
			insertNestedAfter(root,new$,caret);
			return new$;
		} else if (newIsNull) {
			if (!oldIsNull) { removeNested(root,old,caret) };
			return caret;
		} else {
			// if old did not exist we need to add a new directly
			var nextNode;
			// if old was array or imbatag we need to remove it and then add
			if (old instanceof Array) {
				removeNested(root,old,caret);
			} else if (old instanceof ImbaTag) {
				root.removeChild(old);
			} else if (!oldIsNull) {
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
	
	
	return Imba.extendTag('htmlelement', function(tag){
		
		tag.prototype.setChildren = function (new$,typ){
			var old = this._children;
			// var isArray = nodes isa Array
			if (new$ === old) {
				return this;
			};
			
			if (!old) {
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
},{}],9:[function(require,module,exports){
(function(){
	// externs;
	
	if (typeof window !== 'undefined') {
		global = window;
	};
	
	/*
	Imba is the namespace for all runtime related utilities
	@namespace
	*/
	
	Imba = {
		VERSION: '0.13.12'
	};
	
	var reg = /-./g;
	
	/*
	True if running in client environment.
	@return {bool}
	*/
	
	Imba.isClient = function (){
		return Imba.CLIENT === true;
	};
	
	/*
	True if running in server environment.
	@return {bool}
	*/
	
	Imba.isServer = function (){
		return Imba.SERVER === true;
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
	
	return Imba.indexOf = function (a,b){
		return (b && b.indexOf) ? (b.indexOf(a)) : ([].indexOf.call(a,b));
	};

})()
},{}],10:[function(require,module,exports){
(function (global){
(function(){
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
		this.emit(this,'tick',[d]);
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
			return Imba.emit(Imba,'timeout',[block]);
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
			return Imba.emit(Imba,'interval',[block]);
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
		Delta time between the two last ticks
		@return {Number}
		*/
	
	Imba.Scheduler.prototype.configure = function (pars){
		if(!pars||pars.constructor !== Object) pars = {};
		var fps = pars.fps !== undefined ? pars.fps : 1;
		var events = pars.events !== undefined ? pars.events : true;
		if (events != null) { this._events = events };
		if (fps != null) { this._fps = fps };
		return this;
	};
	
	// def reschedule
	// 	raf(@ticker)
	// 	self
	
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
		
		if (this._marked) this.flush();
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(require,module,exports){
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
	
	
	Imba.Selector.prototype.__query = {name: 'query'};
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
	return Imba.extendTag('element', function(tag){
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
},{}],12:[function(require,module,exports){
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
	
	
	Imba.Tag.prototype.__object = {name: 'object'};
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
	
		# Example
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
		if (arguments.length == 2 && !toggler) {
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
	
	
	Imba.Tag.prototype.initialize = Imba.Tag;
	
	HTML_TAGS = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");
	HTML_TAGS_UNSAFE = "article aside header section".split(" ");
	SVG_TAGS = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");
	
	Imba.TAGS = {
		element: Imba.Tag
	};
	
	Imba.SINGLETONS = {};
	IMBA_TAGS = Imba.TAGS;
	
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
	
	Imba.defineTag = function (name,supr,body){
		if(body==undefined && typeof supr == 'function') body = supr,supr = '';
		if(supr==undefined) supr = '';
		supr || (supr = (idx$(name,HTML_TAGS) >= 0) ? ('htmlelement') : ('div'));
		
		var superklass = Imba.TAGS[supr];
		
		var fname = name == 'var' ? ('vartag') : (name);
		// should drop this in production / optimized mode, but for debug
		// we create a constructor with a recognizeable name
		var klass = new Function(("return function " + fname.replace(/[\s\-\:]/g,'_') + "(dom)\{ this.setDom(dom); \}"))();
		klass._name = name;
		
		extender(klass,superklass);
		
		Imba.TAGS[name] = klass;
		
		if (body) { body.call(klass,klass,klass.prototype) };
		return klass;
	};
	
	Imba.defineSingletonTag = function (id,supr,body){
		if(body==undefined && typeof supr == 'function') body = supr,supr = '';
		if(supr==undefined) supr = '';
		var superklass = Imba.TAGS[supr || 'div'];
		
		// should drop this in production / optimized mode, but for debug
		// we create a constructor with a recognizeable name
		var klass = new Function(("return function " + id.replace(/[\s\-\:]/g,'_') + "(dom)\{ this.setDom(dom); \}"))();
		klass._name = null;
		
		extender(klass,superklass);
		
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
		};
		
		var spawner;
		
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
		
		
		spawner = tags[type] || tags[native$];
		return spawner ? (new spawner(dom).awaken(dom)) : (null);
	};
	
	t$ = Imba.tag;
	tc$ = Imba.tagWithFlags;
	ti$ = Imba.tagWithId;
	tic$ = Imba.tagWithIdAndFlags;
	id$ = Imba.getTagSingleton;
	return tag$wrap = Imba.getTagForDom;
	

})()
},{}]},{},[1])(1)
});