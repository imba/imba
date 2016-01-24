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
		return !!this._captured;
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
		return !!this._silenced;
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
			
			if (!sym && ki.substr(0,2) == "U+") {
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
	
	/*
	
		Create a new Imba.Event
	
		*/
	
	Imba.EventManager.prototype.create = function (type,target,pars){
		if(!pars||pars.constructor !== Object) pars = {};
		var data = pars.data !== undefined ? pars.data : null;
		var source = pars.source !== undefined ? pars.source : null;
		var event = Imba.Event.wrap({type: type,target: target});
		if (data) { (event.setData(data),data) };
		if (source) { (event.setSource(source),source) };
		return event;
	};
	
	/*
	
		Trigger / process an Imba.Event.
	
		*/
	
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