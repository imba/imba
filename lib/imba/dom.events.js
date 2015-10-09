(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	var doc = document;
	var win = window;
	
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
	
	var lastNativeTouchTimeStamp = 0;
	var lastNativeTouchTimeout = 50;
	
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
			};
		};
		
		// e.preventDefault
		// not always supported!
		// touches = touches.filter(||)
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
		this._maxdr = this._dr = 0;
		this._x0 = this._x;
		this._y0 = this._y;
		
		var e = this.event();
		// var ptr = pointer
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
		
		return this;
	};
	
	Imba.Touch.prototype.cancelled = function (){
		return this;
	};
	
	Imba.Touch.prototype.dr = function (){
		return this._dr;
	};
	Imba.Touch.prototype.dx = function (){
		return this._x - this._x0;
	};
	Imba.Touch.prototype.dy = function (){
		return this._y - this._y0;
	};
	Imba.Touch.prototype.x = function (){
		return this._x;
	};
	Imba.Touch.prototype.y = function (){
		return this._y;
	};
	
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
	
	Imba.Event.prototype.setType = function (type){
		this._type = type;
		return this;
	};
	
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
	
	Imba.Event.prototype.halt = function (){
		this.setBubble(false);
		return this;
	};
	
	Imba.Event.prototype.cancel = function (){
		if (this.event().preventDefault) { this.event().preventDefault() };
		this._cancel = true;
		return this;
	};
	
	Imba.Event.prototype.isPrevented = function (){
		return this.event() && this.event().defaultPrevented || this._cancel;
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
					this._responder || (this._responder = node);
					// should autostop bubble here?
					var res = args ? (node[meth].apply(node,args)) : (node[meth](this,this.data()));
				};
			};
			
			// add node.nextEventResponder as a separate method here?
			if (!(this.bubble() && (domnode = (this._redirect || (node ? (node.parent()) : (domnode.parentNode)))))) {
				break;
			};
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
		var $1;
		return this.create.apply(this,arguments).process();
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
		'mousedown','mouseup','mousewheel','dblclick'
	]});
	
	if (hasTouchEvents) {
		Imba.Events.listen('touchstart',function(e) { return Imba.Touch.ontouchstart(e); });
		Imba.Events.listen('touchmove',function(e) { return Imba.Touch.ontouchmove(e); });
		Imba.Events.listen('touchend',function(e) { return Imba.Touch.ontouchend(e); });
		Imba.Events.listen('touchcancel',function(e) { return Imba.Touch.ontouchcancel(e); });
	};
	
	Imba.Events.listen('click',function(e) {
		if ((e.timeStamp - lastNativeTouchTimeStamp) > lastNativeTouchTimeout) {
			var tap = new Imba.Event(e);
			tap.setType('tap');
			tap.process();
			if (tap._responder) { return };
		};
		
		// delegate the real click event
		return Imba.Events.delegate(e);
	});
	
	Imba.Events.listen('mousedown',function(e) {
		if ((e.timeStamp - lastNativeTouchTimeStamp) > lastNativeTouchTimeout) {
			if (Imba.POINTER) { return Imba.POINTER.update(e).process() };
		};
	});
	
	Imba.Events.listen('mousemove',function(e) {
		// console.log 'mousemove',e:timeStamp
		if ((e.timeStamp - lastNativeTouchTimeStamp) > lastNativeTouchTimeout) {
			if (Imba.POINTER) { return Imba.POINTER.update(e).process() }; // .process if touch # should not happen? We process through 
		};
	});
	
	Imba.Events.listen('mouseup',function(e) {
		// console.log 'mouseup',e:timeStamp
		if ((e.timeStamp - lastNativeTouchTimeStamp) > lastNativeTouchTimeout) {
			if (Imba.POINTER) { return Imba.POINTER.update(e).process() };
		};
	});
	
	// enable immediately by default
	return (Imba.Events.setEnabled(true),true);

})()