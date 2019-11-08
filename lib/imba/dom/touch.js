function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = require("../imba");

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
	this.event = event;
	this.data = {};
	this.active = true;
	this.button = event && event.button || 0;
	this.suppress = false; // deprecated
	this.captured = false;
	this.bubble = false;
	this.pointer = pointer;
	this.updates = 0;
	return this;
};

Imba.Touch.LastTimestamp = 0;
Imba.Touch.TapTimeout = 50;

// var lastNativeTouchTimeout = 50

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
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
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
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
		if (touch = this.lookup(t)) {
			touch.touchmove(e,t);
		};
	};
	
	return this;
};

Imba.Touch.ontouchend = function (e){
	var touch;
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
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
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
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

Imba.Touch.prototype.__bubble = {chainable: true,name: 'bubble'};
Object.defineProperty(Imba.Touch.prototype,'bubble',{
	configurable: true,
	get: function(){ return v !== undefined ? (this.setBubble(v),this) : this._bubble; },
	set: function(v){ this._bubble = v; }
});

/*
	@internal
	@constructor
	*/

Imba.Touch.prototype.capture = function (){
	this.captured = true;
	this.event && this.event.stopPropagation();
	if (!this.__selblocker) {
		this.__selblocker = function(e) { return e.preventDefault(); };
		Imba.document.addEventListener('selectstart',this.__selblocker,true);
	};
	return this;
};

Imba.Touch.prototype.isCaptured = function (){
	return !!this.captured;
};

/*
	Extend the touch with a plugin / gesture. 
	All events (touchstart,move etc) for the touch
	will be triggered on the plugins in the order they
	are added.
	*/

Imba.Touch.prototype.extend = function (plugin){
	// console.log "added gesture!!!"
	this.gestures || (this.gestures = []);
	this.gestures.push(plugin);
	return this;
};

/*
	Redirect touch to specified target. ontouchstart will always be
	called on the new target.
	@return {Number}
	*/

Imba.Touch.prototype.redirect = function (target){
	this.__redirect = target;
	return this;
};

/*
	Suppress the default behaviour. Will call preventDefault for
	all native events that are part of the touch.
	*/

Imba.Touch.prototype.suppress = function (){
	// collision with the suppress property
	this.active = false;
	return this;
};

// TODO v2
Imba.Touch.prototype.setSuppress = function (value){
	console.warn('Imba.Touch#suppress= is deprecated');
	this.supress = value;
	this;
	return this;
};

Imba.Touch.prototype.touchstart = function (e,t){
	this.event = e;
	this.touch = t;
	this.button = 0;
	this.x = t.clientX;
	this.y = t.clientY;
	this.began();
	this.update();
	if (e && this.captured) { e.preventDefault() };
	return this;
};

Imba.Touch.prototype.touchmove = function (e,t){
	this.event = e;
	this.x = t.clientX;
	this.y = t.clientY;
	this.update();
	if (e && this.captured) { e.preventDefault() };
	return this;
};

Imba.Touch.prototype.touchend = function (e,t){
	this.event = e;
	this.x = t.clientX;
	this.y = t.clientY;
	this.ended();
	
	Imba.Touch.LastTimestamp = e.timeStamp;
	
	if (this.maxdr < 20) {
		var tap = new Imba.Event(e);
		tap.type = 'tap';
		tap.process();
	};
	
	if (e && this.captured) { e.preventDefault() };
	return this;
};

Imba.Touch.prototype.touchcancel = function (e,t){
	return this.cancel();
};

Imba.Touch.prototype.mousedown = function (e,t){
	var self = this;
	self.event = e;
	self.button = e.button;
	self.x = t.clientX;
	self.y = t.clientY;
	self.began();
	self.update;
	self.__mousemove = function(e) { return self.mousemove(e,e); };
	Imba.document.addEventListener('mousemove',self.__mousemove,true);
	return self;
};

Imba.Touch.prototype.mousemove = function (e,t){
	this.x = t.clientX;
	this.y = t.clientY;
	this.event = e;
	if (this.captured) { e.preventDefault() };
	this.update();
	this.move();
	return this;
};

Imba.Touch.prototype.mouseup = function (e,t){
	this.x = t.clientX;
	this.y = t.clientY;
	this.ended();
	return this;
};

Imba.Touch.prototype.idle = function (){
	return this.update();
};

Imba.Touch.prototype.began = function (){
	this.timestamp = Date.now();
	this.maxdr = this.dr = 0;
	this.x0 = this.x;
	this.y0 = this.y;
	
	var dom = this.event.target;
	var node = null;
	
	this.sourceTarget = dom && Imba.getTagForDom(dom);
	
	while (dom){
		node = Imba.getTagForDom(dom);
		if (node && node.ontouchstart) {
			this.bubble = false;
			this.target = node;
			this.target.ontouchstart(this);
			if (!this.bubble) { break; };
		};
		dom = dom.parentNode;
	};
	
	this.updates++;
	return this;
};

Imba.Touch.prototype.update = function (){
	if (!this.active || this.cancelled) { return this };
	
	var dr = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
	if (dr > this.dr) { this.maxdr = dr };
	this.dr = dr;
	
	// catching a touch-redirect?!?
	if (this.__redirect) {
		if (this.target && this.target.ontouchcancel) {
			this.target.ontouchcancel(this);
		};
		this.target = this.__redirect;
		this.__redirect = null;
		if (this.target.ontouchstart) { this.target.ontouchstart(this) };
		if (this.__redirect) { return this.update() };
	};
	
	this.updates++;
	if (this.gestures) {
		for (let i = 0, items = iter$(this.gestures), len = items.length; i < len; i++) {
			items[i].ontouchupdate(this);
		};
	};
	
	this.target && this.target.ontouchupdate  &&  this.target.ontouchupdate(this);
	if (this.__redirect) { this.update() };
	return this;
};

Imba.Touch.prototype.move = function (){
	if (!this.active || this.cancelled) { return this };
	
	if (this.gestures) {
		for (let i = 0, items = iter$(this.gestures), len = items.length, g; i < len; i++) {
			g = items[i];
			if (g.ontouchmove) { g.ontouchmove(this,this.event) };
		};
	};
	
	this.target && this.target.ontouchmove  &&  this.target.ontouchmove(this,this.event);
	return this;
};

Imba.Touch.prototype.ended = function (){
	if (!this.active || this.cancelled) { return this };
	
	this.updates++;
	
	if (this.gestures) {
		for (let i = 0, items = iter$(this.gestures), len = items.length; i < len; i++) {
			items[i].ontouchend(this);
		};
	};
	
	this.target && this.target.ontouchend  &&  this.target.ontouchend(this);
	this.cleanup_();
	return this;
};

Imba.Touch.prototype.cancel = function (){
	if (!this.cancelled) {
		this.__cancelled = true;
		this.cancelled();
		this.cleanup_();
	};
	return this;
};

Imba.Touch.prototype.cancelled = function (){
	if (!this.active) { return this };
	
	this.__cancelled = true;
	this.updates++;
	
	if (this.gestures) {
		for (let i = 0, items = iter$(this.gestures), len = items.length, g; i < len; i++) {
			g = items[i];
			if (g.ontouchcancel) { g.ontouchcancel(this) };
		};
	};
	
	this.target && this.target.ontouchcancel  &&  this.target.ontouchcancel(this);
	return this;
};

Imba.Touch.prototype.cleanup_ = function (){
	if (this.__mousemove) {
		Imba.document.removeEventListener('mousemove',this.__mousemove,true);
		this.__mousemove = null;
	};
	
	if (this.__selblocker) {
		Imba.document.removeEventListener('selectstart',this.__selblocker,true);
		this.__selblocker = null;
	};
	
	return this;
};

/*
	The absolute distance the touch has moved from starting position 
	@return {Number}
	*/

// def dr do @dr

/*
	The distance the touch has moved horizontally
	@return {Number}
	*/

Object.defineProperty(Imba.Touch.prototype,'dx',{get: function(){
	return this.x - this.x0;
}, configurable: true});

/*
	The distance the touch has moved vertically
	@return {Number}
	*/

Object.defineProperty(Imba.Touch.prototype,'dy',{get: function(){
	return this.y - this.y0;
}, configurable: true});

/*
	Initial horizontal position of touch
	@return {Number}
	*/

// def x0 do @x0

/*
	Initial vertical position of touch
	@return {Number}
	*/

// def y0 do @y0

/*
	Horizontal position of touch
	@return {Number}
	*/

// def x do @x

/*
	Vertical position of touch
	@return {Number}
	*/

// def y do @y

/*
	Horizontal position of touch relative to target
	@return {Number}
	*/

Object.defineProperty(Imba.Touch.prototype,'tx',{get: function(){
	this.targetBox || (this.targetBox = this.target.dom.getBoundingClientRect());
	return this.x - this.targetBox.left;
}, configurable: true});

/*
	Vertical position of touch relative to target
	@return {Number}
	*/

Object.defineProperty(Imba.Touch.prototype,'ty',{get: function(){
	this.targetBox || (this.targetBox = this.target.dom.getBoundingClientRect);
	return this.y - this.targetBox.top;
}, configurable: true});

/*
	Button pressed in this touch. Native touches defaults to left-click (0)
	@return {Number}
	*/

// get button do @button # @pointer ? @pointer.button : 0
// def sourceTarget
// 	@sourceTarget

// TODO method or property?
Imba.Touch.prototype.elapsed = function (){
	return Date.now - this.timestamp;
};


Imba.TouchGesture = function TouchGesture(){ };

Imba.TouchGesture.prototype.__active = {'default': false,name: 'active'};
Object.defineProperty(Imba.TouchGesture.prototype,'active',{
	configurable: true,
	get: function(){ return this._active; },
	set: function(v){ this._active = v; }
});
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

