(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.imba = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(){
	
	if (typeof Imba === 'undefined') {
		require('./imba');
		require('./core.events');
		require('./dom');
		require('./dom.client');
		require('./dom.html');
		require('./dom.legacy');
		require('./dom.events');
		require('./dom.static');
		require('./selector');
	};

})()
},{"./core.events":2,"./dom":6,"./dom.client":3,"./dom.events":4,"./dom.html":5,"./dom.legacy":7,"./dom.static":8,"./imba":9,"./selector":10}],2:[function(require,module,exports){
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
		list = cbs[($1=event)] || (cbs[$1] = {});
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
	
	Imba.observeProperty = function (observer,key,trigger,target,prev){
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
	
	
	var prefixes = ['-webkit-','-ms-','-moz-','-o-','-blink-'];
	var props = ['transform','transition','animation'];
	var styles = window.getComputedStyle(document.documentElement,'');
	Imba.CSSKeyMap = {};
	
	for (var i=0, ary=iter$(styles), len=ary.length, prefixed; i < len; i++) {
		// really? this must be for the client ---
		// there is no way to set this otherwise?
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
	
	Imba.extendTag('htmlelement', function(tag){
		
		// override the original css method
		tag.prototype.css = function (key,val){
			if (key instanceof Object) {
				for (var i=0, keys=Object.keys(key), l=keys.length; i < l; i++){
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
	
	// typeof ontouchstart instead?
	var hasTouchEvents = window && window.ontouchstart !== undefined; // .hasOwnProperty('ontouchstart')
	
	// Ringbuffer for events?
	
	Imba.RingBuffer = function RingBuffer(len){
		if(len === undefined) len = 10;
		this._array = [];
		this._keep = len;
		this._head = 0;
		this;
	};
	
	
	Imba.RingBuffer.prototype.__head = {name: 'head'};
	Imba.RingBuffer.prototype.head = function(v){ return this._head; }
	Imba.RingBuffer.prototype.setHead = function(v){ this._head = v; return this; };
	
	Imba.RingBuffer.prototype.push = function (obj){
		var i = this._head++;
		this._array[i % this._keep] = obj;
		return i;
	};
	
	Imba.RingBuffer.prototype.last = function (){
		return this._array[this._head % this._keep];
	};
	
	// really more like a pointer?
	Imba.Pointer = function Pointer(){
		this.setButton(-1);
		this.setEvents(new Imba.RingBuffer(10));
		this.setEvent({x: 0,y: 0,type: 'uninitialized'});
		this;
	};
	
	
	Imba.Pointer.prototype.__phase = {name: 'phase'};
	Imba.Pointer.prototype.phase = function(v){ return this._phase; }
	Imba.Pointer.prototype.setPhase = function(v){ this._phase = v; return this; }; // change: update
	
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
		var phase = this.phase();
		var e0 = this.prevEvent();
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
			// set type to stationary?
			// update always?
			if (this.touch()) { this.touch().idle() };
		};
		
		
		return this;
	};
	
	Imba.Pointer.prototype.emit = function (name,target,pars){
		if(!pars||pars.constructor !== Object) pars = {};
		var bubble = pars.bubble !== undefined ? pars.bubble : true;
		return true;
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
	
	Imba.Pointer.update = function (){
		// console.log('update touch')
		for (var i=0, ary=iter$(Imba.POINTERS), len=ary.length; i < len; i++) {
			ary[i].process();
		};
		// need to be able to prevent the default behaviour of touch, no?
		win.requestAnimationFrame(Imba.Pointer.update);
		return this;
	};
	
	
	// Imba.Touch
	// Began	A finger touched the screen.
	// Moved	A finger moved on the screen.
	// Stationary	A finger is touching the screen but hasn't moved.
	// Ended	A finger was lifted from the screen. This is the final phase of a touch.
	// Canceled The system cancelled tracking for the touch.
	Imba.Touch = function Touch(e,ptr){
		// @native  = false
		this.setEvent(e);
		this.setData({});
		this.setActive(true);
		this._suppress = false;
		this.setBubble(false);
		this.setPointer(ptr);
		this.setUpdates(0);
	};
	
	var multi = true;
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
		for (var i=0, ary=iter$(e.changedTouches), len=ary.length, t; i < len; i++) {
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
		for (var i=0, ary=iter$(e.changedTouches), len=ary.length, t; i < len; i++) {
			t = ary[i];
			if (touch = this.lookup(t)) {
				touch.touchmove(e,t);
			};
		};
		
		return this;
	};
	
	Imba.Touch.ontouchend = function (e){
		var touch;
		for (var i=0, ary=iter$(e.changedTouches), len=ary.length, t; i < len; i++) {
			t = ary[i];
			if (touch = this.lookup(t)) {
				touch.touchend(e,t);
				this.release(t,touch);
				count--;
				// not always supported!
				// touches = touches.filter(||)
			};
		};
		return this;
	};
	
	Imba.Touch.ontouchcancel = function (e){
		var touch;
		for (var i=0, ary=iter$(e.changedTouches), len=ary.length, t; i < len; i++) {
			t = ary[i];
			if (touch = this.lookup(t)) {
				touch.touchcancel(e,t);
				this.release(t,touch);
				count--;
			};
		};
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
	// prop preventDefault
	
	
	Imba.Touch.prototype.__x0 = {name: 'x0'};
	Imba.Touch.prototype.x0 = function(v){ return this._x0; }
	Imba.Touch.prototype.setX0 = function(v){ this._x0 = v; return this; };
	
	Imba.Touch.prototype.__y0 = {name: 'y0'};
	Imba.Touch.prototype.y0 = function(v){ return this._y0; }
	Imba.Touch.prototype.setY0 = function(v){ this._y0 = v; return this; };
	
	// duration etc -- important
	
	Imba.Touch.prototype.preventDefault = function (){
		this._preventDefault = true;
		this.event() && this.event().preventDefault();
		// pointer.event.preventDefault
		return this;
	};
	
	Imba.Touch.prototype.extend = function (gesture){
		// console.log "added gesture!!!"
		this._gestures || (this._gestures = []);
		this._gestures.push(gesture);
		return this;
	};
	
	Imba.Touch.prototype.redirect = function (target){
		this._redirect = target;
		return this;
	};
	
	Imba.Touch.prototype.suppress = function (){
		// collision with the suppress property
		this._active = false;
		return this;
	};
	
	Imba.Touch.prototype.touchstart = function (e,t){
		this._event = e;
		this._touch = t;
		this._x = t.clientX;
		this._y = t.clientY;
		this.began();
		if (e && this._suppress) { e.preventDefault() };
		return this;
	};
	
	Imba.Touch.prototype.touchmove = function (e,t){
		this._event = e;
		this._x = t.clientX;
		this._y = t.clientY;
		this.update();
		if (e && this._suppress) { e.preventDefault() };
		return this;
	};
	
	Imba.Touch.prototype.touchend = function (e,t){
		this._event = e;
		// log "touchend"
		this._x = t.clientX;
		this._y = t.clientY;
		this.ended();
		if (e && this._suppress) { e.preventDefault() };
		return this;
	};
	
	Imba.Touch.prototype.touchcancel = function (e,t){
		// log "touchcancel"
		return this;
	};
	
	
	Imba.Touch.prototype.mousedown = function (e,t){
		// log "mousedown"
		this._x = t.clientX;
		this._y = t.clientY;
		this.began();
		return this;
	};
	
	Imba.Touch.prototype.mousemove = function (e,t){
		// log "mousemove"
		this._x = t.clientX;
		this._y = t.clientY;
		// how does this work with touches?
		this._event = e;
		if (this._suppress) { e.preventDefault() };
		this.update();
		this.move();
		return this;
	};
	
	Imba.Touch.prototype.mouseup = function (e,t){
		// log "mousemove"
		this._x = t.clientX;
		this._y = t.clientY;
		this.ended();
		return this;
	};
	
	Imba.Touch.prototype.idle = function (){
		return this.update();
	};
	
	Imba.Touch.prototype.began = function (){
		// console.log "begaN??"
		this._x0 = this._x;
		this._y0 = this._y;
		
		var e = this.event();
		// var ptr = pointer
		var dom = this.event().target;
		var node = null;
		
		this._sourceTarget = dom && tag$wrap(dom);
		// need to find the 
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
		
		// console.log('target??',target)
		this._updates++;
		// if target
		// 	target.ontouchstart(self)
		// 	# ptr.event.preventDefault unless @native
		// 	# prevent default?
		
		//  = e:clientX
		//  = e:clientY
		return this;
	};
	
	Imba.Touch.prototype.update = function (){
		if (!this._active) { return this };
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
			for (var i=0, ary=iter$(this._gestures), len=ary.length; i < len; i++) {
				ary[i].ontouchupdate(this);
			};
		};
		
		if (this.target() && this.target().ontouchupdate) { this.target().ontouchupdate(this) };
		return this;
	};
	
	Imba.Touch.prototype.move = function (){
		if (!this._active) { return this };
		
		if (this._gestures) {
			for (var i=0, ary=iter$(this._gestures), len=ary.length, g; i < len; i++) {
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
			for (var i=0, ary=iter$(this._gestures), len=ary.length; i < len; i++) {
				ary[i].ontouchend(this);
			};
		};
		
		if (this.target() && this.target().ontouchend) { this.target().ontouchend(this) };
		
		// simulate tap -- need to be careful about this(!)
		// must look at timing and movement(!)
		if (this._touch) {
			ED.trigger('tap',this.event().target);
		};
		return this;
	};
	
	Imba.Touch.prototype.cancelled = function (){
		return this;
	};
	
	Imba.Touch.prototype.dx = function (){
		return this._x - this._x0;
		// pointer.x - @x0
	};
	
	Imba.Touch.prototype.dy = function (){
		return this._y - this._y0;
		// pointer.y - @y0
	};
	
	Imba.Touch.prototype.x = function (){
		return this._x;
	}; // pointer.x
	Imba.Touch.prototype.y = function (){
		return this._y;
	}; // pointer.y
	
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
	
	
	Imba.Event = function Event(e){
		this.setEvent(e);
		this.setBubble(true);
	};
	
	
	Imba.Event.prototype.__event = {name: 'event'};
	Imba.Event.prototype.event = function(v){ return this._event; }
	Imba.Event.prototype.setEvent = function(v){ this._event = v; return this; };
	
	Imba.Event.prototype.__target = {name: 'target'};
	Imba.Event.prototype.target = function(v){ return this._target; }
	Imba.Event.prototype.setTarget = function(v){ this._target = v; return this; };
	
	Imba.Event.prototype.__prefix = {name: 'prefix'};
	Imba.Event.prototype.prefix = function(v){ return this._prefix; }
	Imba.Event.prototype.setPrefix = function(v){ this._prefix = v; return this; };
	
	Imba.Event.prototype.__data = {name: 'data'};
	Imba.Event.prototype.data = function(v){ return this._data; }
	Imba.Event.prototype.setData = function(v){ this._data = v; return this; };
	
	Imba.Event.prototype.__source = {name: 'source'};
	Imba.Event.prototype.source = function(v){ return this._source; }
	Imba.Event.prototype.setSource = function(v){ this._source = v; return this; };
	
	Imba.Event.prototype.__bubble = {name: 'bubble'};
	Imba.Event.prototype.bubble = function(v){ return this._bubble; }
	Imba.Event.prototype.setBubble = function(v){ this._bubble = v; return this; }; // getset: yes
	
	Imba.Event.wrap = function (e){
		return new this(e);
	};
	
	Imba.Event.prototype.name = function (){
		return this.event().type.toLowerCase().replace(/\:/g,'');
	};
	
	// mimc getset
	Imba.Event.prototype.bubble = function (v){
		if (v != undefined) {
			this.setBubble(v);
			return this;
		};
		return this._bubble;
	};
	
	Imba.Event.prototype.halt = function (){
		this.setBubble(false);
		return this;
	};
	
	Imba.Event.prototype.cancel = function (){
		if (this.event().preventDefault) { this.event().preventDefault() };
		this._cancel = true;
		return this;
	};
	
	Imba.Event.prototype.target = function (){
		return tag$wrap(this.event()._target || this.event().target);
	};
	
	Imba.Event.prototype.redirect = function (node){
		this._redirect = node;
		return this;
	};
	
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
		
		var domnode = domtarget._responder || domtarget;
		var rerouter = null;
		var rerouted = false;
		// need to stop infinite redirect-rules here??!?
		var $1;while (domnode){
			this._redirect = null;
			if (node = tag$wrap(domnode)) { // not only tag 
				
				if ((typeof node[($1=meth)]=='string'||node[$1] instanceof String)) {
					// should remember the receiver of the event
					meth = node[meth];
					continue;
				};
				
				if (node[meth] instanceof Array) {
					args = node[meth].concat(node);
					meth = args.shift();
					continue;
				};
				
				if (node[meth] instanceof Function) {
					var res = args ? (node[meth].apply(node,args)) : (node[meth](this,this.data()));
				};
			};
			
			// log "hit?",domnode
			// add node.nextEventResponder as a separate method here?
			if (!(this.bubble() && (domnode = (this._redirect || (node ? (node.parent()) : (domnode.parentNode)))))) { break };
		};
		
		return this;
	};
	
	Imba.Event.prototype.x = function (){
		return this.event().x;
	};
	Imba.Event.prototype.y = function (){
		return this.event().y;
	};
	Imba.Event.prototype.which = function (){
		return this.event().which;
	};
	
	Imba.EventManager = function EventManager(node,pars){
		var self=this;
		if(!pars||pars.constructor !== Object) pars = {};
		var events = pars.events !== undefined ? pars.events : [];
		self.setRoot(node);
		self.setListeners([]);
		self.setDelegators({});
		self.setDelegator(function(e) {
			// console.log "delegating event?! {e}"
			self.delegate(e);
			return true;
		});
		
		for (var i=0, ary=iter$(events), len=ary.length; i < len; i++) {
			self.register(ary[i]);
		};
		self;
	};
	
	
	Imba.EventManager.prototype.__root = {name: 'root'};
	Imba.EventManager.prototype.root = function(v){ return this._root; }
	Imba.EventManager.prototype.setRoot = function(v){ this._root = v; return this; };
	
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
	
	
	Imba.EventManager.prototype.register = function (name,handler){
		if(handler === undefined) handler = true;
		if (name instanceof Array) {
			for (var i=0, ary=iter$(name), len=ary.length; i < len; i++) {
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
		// console.log "delegate event {e and e:type}"
		// really? wrap all events? Quite expensive unless we reuse them
		var event = Imba.Event.wrap(e);
		// console.log "delegate event {e:type}"
		event.process();
		// name = e:type.toLowerCase.replace(/\:/g,'')
		// create our own event here?
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
	Imba.EventManager.prototype.trigger = function (type,target,pars){
		if(!pars||pars.constructor !== Object) pars = {};
		var data = pars.data !== undefined ? pars.data : null;
		var source = pars.source !== undefined ? pars.source : null;
		var event = Imba.Event.wrap({type: type,target: target});
		if (data) { (event.setData(data),data) };
		if (source) { (event.setSource(source),source) };
		return event.process();
	};
	
	Imba.EventManager.prototype.emit = function (obj,event,data,pars){
		// log "emit event for",obj,event,data
		if(!pars||pars.constructor !== Object) pars = {};
		var dom = pars.dom !== undefined ? pars.dom : true;
		var ns = pars.ns !== undefined ? pars.ns : 'object';
		var fn = ("on" + ns);
		var nodes = DOC.querySelectorAll(("." + (obj.uid())));
		for (var i=0, ary=iter$(nodes), len=ary.length, node; i < len; i++) {
			// log "found node {node:className}"
			node = ary[i];
			if (node._tag && node._tag[fn]) {
				node._tag[fn](event,data);
			};
			// now we simply link to onobject event
		};
		return this;
	};
	
	Imba.EventManager.prototype.onenable = function (){
		for (var o=this.delegators(), i=0, keys=Object.keys(o), l=keys.length; i < l; i++){
			this.root().addEventListener(keys[i],o[keys[i]],true);
		};
		
		for (var j=0, ary=iter$(this.listeners()), len=ary.length, item; j < len; j++) {
			item = ary[j];
			this.root().addEventListener(item[0],item[1],item[2]);
		};
		return this;
	};
	
	Imba.EventManager.prototype.ondisable = function (){
		for (var o=this.delegators(), i=0, keys=Object.keys(o), l=keys.length; i < l; i++){
			this.root().removeEventListener(keys[i],o[keys[i]],true);
		};
		
		for (var j=0, ary=iter$(this.listeners()), len=ary.length, item; j < len; j++) {
			item = ary[j];
			this.root().removeEventListener(item[0],item[1],item[2]);
		};
		return this;
	};
	
	
	ED = Imba.Events = new Imba.EventManager(document,{events: [
		'keydown','keyup','keypress','textInput','input','change','submit',
		'focusin','focusout','blur','contextmenu',
		'mousedown','mouseup','mousewheel',
		'dblclick'
	]});
	
	if (hasTouchEvents) {
		ED.listen('touchstart',function(e) { return Imba.Touch.ontouchstart(e); });
		ED.listen('touchmove',function(e) { return Imba.Touch.ontouchmove(e); });
		ED.listen('touchend',function(e) { return Imba.Touch.ontouchend(e); });
		ED.listen('touchcancel',function(e) { return Imba.Touch.ontouchcancel(e); });
	} else {
		ED.listen('click',function(e) {
			return ED.trigger('tap',e.target); // no
		});
		
		ED.listen('mousedown',function(e) {
			if (Imba.POINTER) { return Imba.POINTER.update(e).process() };
		});
		
		ED.listen('mousemove',function(e) {
			if (Imba.POINTER) { return Imba.POINTER.update(e).process() }; // .process if touch # should not happen? We process through 
		});
		
		ED.listen('mouseup',function(e) {
			if (Imba.POINTER) { return Imba.POINTER.update(e).process() };
		});
	};
	
	// enable immediately by default
	Imba.Events.setEnabled(true);

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
		
		tag.prototype.__multiple = {dom: true,name: 'multiple'};
		tag.prototype.multiple = function(v){ return this.getAttribute('multiple'); }
		tag.prototype.setMultiple = function(v){ this.setAttribute('multiple',v); return this; };
		
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
},{}],6:[function(require,module,exports){
(function (global){
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
	
	ElementTag.prototype.dataset = function (key,val){
		if (key instanceof Object) {
			for (var i=0, keys=Object.keys(key), l=keys.length; i < l; i++){
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
			for (var i1=0, ary=iter$(this.dom().attributes), len=ary.length, atr; i1 < len; i1++) {
				atr = ary[i1];
				if (atr.name.substr(0,5) == 'data-') {
					dataset[Imba.toCamelCase(atr.name.slice(5))] = atr.value;
				};
			};
		};
		
		return dataset;
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
		var first = this._dom.childNodes[0];
		first ? (this.insertBefore(item,first)) : (this.appendChild(item));
		return this;
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
	
	function HTMLElementTag(){ return ElementTag.apply(this,arguments) };
	
	subclass$(HTMLElementTag,ElementTag);
	
	
	function SVGElementTag(){ return ElementTag.apply(this,arguments) };
	
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
		if(supr==undefined) supr = '';
		var m = name.split("$");
		var name = m[0];
		var ns = m[1];
		
		supr || (supr = (idx$(name,HTML_TAGS) >= 0) ? ('htmlelement') : ('div'));
		
		var suprklass = Imba.TAGS[supr];
		
		var fname = name == 'var' ? ('vartag') : (name);
		// should drop this in production / optimized mode, but for debug
		// we create a constructor with a recognizeable name
		var Tag = new Function(("return function " + fname.replace(/[\s\-\:]/g,'_') + "(dom)\{ this.setDom(dom); \}"))();
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
		if(supr==undefined) supr = '';
		var superklass = Imba.TAGS[supr || 'div'];
		
		// should drop this in production / optimized mode, but for debug
		// we create a constructor with a recognizeable name
		var fun = new Function(("return function " + id.replace(/[\s\-\:]/g,'_') + "(dom)\{ this.setDom(dom); \}"));
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){
(function(){
	
	// unless document:documentElement:classList
	if (!document.documentElement.classList) {
		
		
			
			ElementTag.prototype.hasFlag = function (ref){
				return new RegExp('(^|\\s)' + ref + '(\\s|$)').test(this._dom.className);
			};
			
			ElementTag.prototype.addFlag = function (ref){
				if (this.hasFlag(ref)) { return this };
				this._dom.className += (this._dom.className ? (' ') : ('')) + ref;
				return this;
			};
			
			ElementTag.prototype.unflag = function (ref){
				if (!this.hasFlag(ref)) { return this };
				var regex = new RegExp('(^|\\s)*' + ref + '(\\s|$)*','g');
				this._dom.className = this._dom.className.replace(regex,'');
				return this;
			};
			
			ElementTag.prototype.toggleFlag = function (ref){
				return this.hasFlag(ref) ? (this.unflag(ref)) : (this.flag(ref));
			};
			
			ElementTag.prototype.flag = function (ref,bool){
				if (arguments.length == 2 && bool == false) {
					return this.unflag(ref);
				};
				return this.addFlag(ref);
			};
		
		true;
	};

})()
},{}],8:[function(require,module,exports){
(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	
	
	function removeNested(root,node,caret){
		// if node/nodes isa String
		// 	we need to use the caret to remove elements
		// 	for now we will simply not support this
		if (node instanceof Array) {
			for (var i=0, ary=iter$(node), len=ary.length; i < len; i++) {
				removeNested(root,ary[i],caret);
			};
		} else if ((typeof node=='number'||node instanceof Number)) {
			false; // noop now -- will be used in 
		} else if (node) {
			root.removeChild(node);
		};
		
		return caret;
	};
	
	function appendNested(root,node){
		if (node instanceof Array) {
			for (var i=0, ary=iter$(node), len=ary.length; i < len; i++) {
				appendNested(root,ary[i]);
			};
		} else if ((typeof node=='number'||node instanceof Number)) {
			false;
		} else if ((typeof node=='string'||node instanceof String)) {
			root.appendChild(Imba.document().createTextNode(node));
		} else if (node) {
			root.appendChild(node);
		};
		
		return;
	};
	
	// insert nodes before a certain node
	// does not need to return any tail, as before
	// will still be correct there
	// before must be an actual domnode
	function insertNestedBefore(root,node,before){
		
		if ((typeof node=='string'||node instanceof String)) {
			node = Imba.document().createTextNode(node);
		};
		
		if (node instanceof Array) {
			for (var i=0, ary=iter$(node), len=ary.length; i < len; i++) {
				insertNestedBefore(root,ary[i],before);
			};
		} else if ((typeof node=='number'||node instanceof Number)) {
			false; // noop now -- will be used in 
		} else if (node) {
			root.insertBefore(node,before);
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
		var oldLen = old.length;
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
		
		for (var idx=0, ary=iter$(old), len=ary.length, node; idx < len; idx++) {
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
			if (newPosition[cursor] == -1) {
				// do nothing. it was removed.
				null
			} else if (cursor == maxChainEnd) {
				stickyNodes[newPosition[cursor]] = true;
				maxChainEnd = prevChain[maxChainEnd];
			};
			
			cursor -= 1;
		};
		
		// And let's iterate forward, but only move non-sticky nodes
		for (var idx1=0, ary=iter$(new$), len=ary.length; idx1 < len; idx1++) {
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
	function reconcileNested(root,new$,old,caret,container,ci){
		
		if (new$ === old) {
			// remember that the caret must be an actual dom element
			return (new$ && new$._dom) || new$ || caret;
		};
		
		// this could be a dynamic / loop
		if ((new$ instanceof Array) && (old instanceof Array)) {
			
			if (new$.static) {
				// if the static is not nested - we could get a hint from compiler
				// and just skip it
				if (new$.static == old.static) {
					for (var i=0, ary=iter$(new$), len=ary.length; i < len; i++) {
						caret = reconcileNested(root,ary[i],old[i],caret,new$,i);
					};
					return caret;
				};
				// if they are not the same we continue through to the default
			} else {
				return reconcileCollection(root,new$,old,caret);
			};
		} else if ((typeof new$=='string'||new$ instanceof String)) {
			var textNode;
			
			if (old instanceof Text) {
				// make sure not to trigger reflow in certain browsers
				if (old.textContent != new$) {
					old.textContent = new$;
				};
				
				textNode = old;
			} else {
				if (old) { removeNested(root,old,caret) };
				textNode = Imba.document().createTextNode(new$);
				insertNestedAfter(root,textNode,caret);
			};
			
			// swap the text with textNode in container
			return container[ci] = caret = textNode;
		};
		// simply remove the previous one and add the new one
		// will these ever be arrays?
		if (old) { removeNested(root,old,caret) };
		if (new$) { caret = insertNestedAfter(root,new$,caret) };
		return caret;
	};
	
	
	
	Imba.extendTag('htmlelement', function(tag){
		
		tag.prototype.setChildren = function (nodes){
			if (nodes === this._children) {
				return this;
			};
			
			if (nodes && nodes.static) {
				this.setStaticChildren(nodes);
			} else if ((nodes instanceof Array) && (this._children instanceof Array)) {
				reconcileCollection(this,nodes,this._children,null);
			} else if ((typeof nodes=='string'||nodes instanceof String)) {
				this.setText(nodes);
			} else {
				this.empty().append(nodes);
			};
			
			this._children = nodes;
			return this;
		};
		
		tag.prototype.setStaticChildren = function (new$){
			
			var $1, $2;
			var old = this._children || [];
			var caret = null;
			
			// common case that should bail out from staticChildren
			if (new$.length == 1 && (typeof new$[($1=0)]=='string'||new$[$1] instanceof String)) {
				return (this.setText(new$[($2=0)]),new$[$2]);
			};
			
			// must be array
			if (!old.length || !old.static) {
				old = [];
				this.empty();
			};
			
			for (var i=0, ary=iter$(new$), len=ary.length, node; i < len; i++) {
				node = ary[i];
				if (node === old[i]) {
					if (node && node._dom) { caret = node._dom };
				} else {
					caret = reconcileNested(this,node,old[i],caret,new$,i);
				};
			};
			
			this._children = new$;
			return this;
		};
		
		tag.prototype.content = function (){
			return this._content || this.children().toArray();
		};
		
		tag.prototype.setText = function (text){
			if (text != this._children) {
				this.dom().textContent = this._children = text;
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
	
	Imba = {};
	
	var reg = /-./g;
	
	Imba.toCamelCase = function (str){
		return str.replace(reg,function(m) { return m.charAt(1).toUpperCase(); });
	};

})()
},{}],10:[function(require,module,exports){
(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	
	Imba.Selector = function Selector(sel,scope,nodes){
		
		this._query = sel instanceof Imba.Selector ? (sel.query()) : (sel);
		this._context = scope;
		
		if (nodes) {
			for (var i=0, ary=iter$(nodes), len=ary.length, res=[]; i < len; i++) {
				res.push(tag$wrap(ary[i]));
			};
			this._nodes = res;
		};
		
		this._lazy = !nodes;
		return this;
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
	
	Imba.Selector.prototype.first = function (){
		if (this._lazy) { return tag$wrap(this._first || (this._first = this.scope().querySelector(this.query()))) } else {
			return this.nodes()[0];
		};
	};
	
	Imba.Selector.prototype.last = function (){
		return this.nodes()[this._nodes.length - 1];
	};
	
	Imba.Selector.prototype.nodes = function (){
		if (this._nodes) { return this._nodes };
		var items = this.scope().querySelectorAll(this.query());
		for (var i=0, ary=iter$(items), len=ary.length, res=[]; i < len; i++) {
			res.push(tag$wrap(ary[i]));
		};
		this._nodes = res;
		this._lazy = false;
		return this._nodes;
	};
	
	Imba.Selector.prototype.count = function (){
		return this.nodes().length;
	};
	Imba.Selector.prototype.len = function (){
		return this.nodes().length;
	};
	Imba.Selector.prototype.any = function (){
		return this.count();
	};
	
	Imba.Selector.prototype.at = function (idx){
		return this.nodes()[idx];
	};
	
	Imba.Selector.prototype.forEach = function (block){
		this.nodes().forEach(block);
		return this;
	};
	
	Imba.Selector.prototype.map = function (block){
		return this.nodes().map(block);
	};
	
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
	
	// TODO IMPLEMENT
	// Get the children of each element in the set of matched elements, 
	// optionally filtered by a selector.
	Imba.Selector.prototype.children = function (sel){
		return true;
	};
	
	// TODO IMPLEMENT
	// Reduce the set of matched elements to those that have a descendant that
	// matches the selector or DOM element.
	Imba.Selector.prototype.has = function (){
		return true;
	};
	
	// TODO IMPLEMENT
	Imba.Selector.prototype.__union = function (){
		this.p("called Imba.Selector.__union");
		return this;
	};
	
	// TODO IMPLEMENT
	Imba.Selector.prototype.__intersect = function (){
		this.p("called Imba.Selector.__union");
		return this;
	};
	
	Imba.Selector.prototype.reject = function (blk){
		return this.filter(blk,false);
	};
	
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
	
	// Proxies
	Imba.Selector.prototype.flag = function (flag){
		return this.forEach(function(n) { return n.flag(flag); });
	};
	
	Imba.Selector.prototype.unflag = function (flag){
		return this.forEach(function(n) { return n.unflag(flag); });
	};
	
	Imba.Selector.prototype.call = function (meth,args){
		var self=this;
		if(args === undefined) args = [];
		return self.forEach(function(n) { var $1;
		if ((self.setFn(n[($1=meth)]),n[$1])) { return self.fn().apply(n,args) }; });
	};
	
	q$ = function(sel,scope) { return new Imba.Selector(sel,scope); };
	
	q$$ = function(sel,scope) {
		var el = (scope || Imba.document()).querySelector(sel);
		return el && tag$wrap(el) || null;
	};
	
	// extending tags with query-methods
	// must be a better way to reopen classes
	Imba.extendTag('element', function(tag){
		tag.prototype.querySelectorAll = function (q){
			return this._dom.querySelectorAll(q);
		};
		tag.prototype.querySelector = function (q){
			return this._dom.querySelector(q);
		};
		tag.prototype.find = function (sel){
			return new Imba.Selector(sel,this);
		};
	});
	

})()
},{}]},{},[1])(1)
});