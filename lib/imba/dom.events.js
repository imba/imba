(function(){
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; }
var doc = global.document;
var win = global.window;

// externs;
var hasTouchEvents = window && window.ontouchstart !== undefined;

Imba.RingBuffer = imba$class(function RingBuffer(len){
	if(len === undefined) len = 10;
	this._array = [];
	this._keep = len;
	this._head = 0;
	this;
});

Imba.RingBuffer.prototype.__head = {};
Imba.RingBuffer.prototype.head = function(v){ return this._head; }
Imba.RingBuffer.prototype.setHead = function(v){ this._head = v; return this; }
;

Imba.RingBuffer.prototype.push = function (obj){
	var i = (this._head)++;
	this._array[i % this._keep] = obj;
	return i;
};
Imba.RingBuffer.prototype.last = function (){
	return this._array[this._head % this._keep];
};
Imba.Pointer = imba$class(function Pointer(){
	this.setButton(-1);
	this.setEvents(new Imba.RingBuffer(10));
	this;
});

Imba.Pointer.prototype.__phase = {};
Imba.Pointer.prototype.phase = function(v){ return this._phase; }
Imba.Pointer.prototype.setPhase = function(v){ this._phase = v; return this; }
;

Imba.Pointer.prototype.__prevEvent = {};
Imba.Pointer.prototype.prevEvent = function(v){ return this._prevEvent; }
Imba.Pointer.prototype.setPrevEvent = function(v){ this._prevEvent = v; return this; }
;

Imba.Pointer.prototype.__button = {};
Imba.Pointer.prototype.button = function(v){ return this._button; }
Imba.Pointer.prototype.setButton = function(v){ this._button = v; return this; }
;

Imba.Pointer.prototype.__event = {};
Imba.Pointer.prototype.event = function(v){ return this._event; }
Imba.Pointer.prototype.setEvent = function(v){ this._event = v; return this; }
;

Imba.Pointer.prototype.__dirty = {};
Imba.Pointer.prototype.dirty = function(v){ return this._dirty; }
Imba.Pointer.prototype.setDirty = function(v){ this._dirty = v; return this; }
;

Imba.Pointer.prototype.__events = {};
Imba.Pointer.prototype.events = function(v){ return this._events; }
Imba.Pointer.prototype.setEvents = function(v){ this._events = v; return this; }
;

Imba.Pointer.prototype.__touch = {};
Imba.Pointer.prototype.touch = function(v){ return this._touch; }
Imba.Pointer.prototype.setTouch = function(v){ this._touch = v; return this; }
;

Imba.Pointer.prototype.update = function (e){
	this.setEvent(e);
	this.events().push(e);
	this.setDirty(true);
	return this;
};
Imba.Pointer.prototype.process = function (){
	var e0, e1;
	var phase = this.phase();
	var e0 = this.prevEvent(), e1 = this.event();
	
	if(this.dirty()) {
		this.setPrevEvent(e1);
		this.setDirty(false);
		if(e1.type == 'mousedown') {
			this.setButton(e1.button);
			this.setTouch(new Imba.Touch(e1,this));
			this.touch().mousedown(e1,e1);
		} else {
			if(e1.type == 'mousemove') {
				if(this.touch()) {
					this.touch().mousemove(e1,e1);
				};
			} else {
				if(e1.type == 'mouseup') {
					this.setButton(-1);
					if(this.touch()) {
						this.touch().mouseup(e1,e1);
					};
					(this.setTouch(null), null);
				}
			}
		};
		if(!e0 || e0.button != e1.button) {
			console.log('button-state changed!!!',e0,e1);
		};
	} else {
		if(this.touch()) {
			this.touch().idle();
		};
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
	for(var i=0, ary=iter$(Imba.POINTERS), len=ary.length; i < len; i++){
		ary[i].process();
	};
	win.requestAnimationFrame(Imba.Pointer.update);
	
	return this;
};
Imba.Touch = imba$class(function Touch(e,ptr){
	var v_;
	this.setEvent(e);
	this.setData({});
	this.setActive(true);
	this.setPointer(ptr);
	(this.setUpdates(v_=0), v_);
});
var multi = true;
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
	(v_ = identifiers[item.identifier]);
	delete identifiers[item.identifier];
	v_;
	($1 = item.__touch__);
	delete item.__touch__;
	$1;
	return;
};
Imba.Touch.ontouchstart = function (e){
	this.log("ontouchstart",e);
	for(var i=0, ary=iter$(e.changedTouches), len=ary.length, t; i < len; i++){
		t = ary[i];
		if(this.lookup(t)) {
			continue;
		};
		var touch = identifiers[t.identifier] = new this(e);
		t.__touch__ = touch;
		touches.push(touch);
		count++;
		touch.touchstart(e,t);
	};
	return this;
};
Imba.Touch.ontouchmove = function (e){
	for(var i=0, ary=iter$(e.changedTouches), len=ary.length, t; i < len; i++){
		t = ary[i];
		if(touch = this.lookup(t)) {
			touch.touchmove(e,t);
		};
	};
	return this;
};
Imba.Touch.ontouchend = function (e){
	for(var i=0, ary=iter$(e.changedTouches), len=ary.length, t; i < len; i++){
		t = ary[i];
		if(touch = this.lookup(t)) {
			touch.touchend(e,t);
			this.release(t,touch);
			count--;
		};
	};
	return this;
};
Imba.Touch.ontouchcancel = function (e){
	for(var i=0, ary=iter$(e.changedTouches), len=ary.length, t; i < len; i++){
		t = ary[i];
		if(touch = this.lookup(t)) {
			touch.touchcancel(e,t);
			this.release(t,touch);
			count--;
		};
	};
	return this;
};

Imba.Touch.prototype.__phase = {};
Imba.Touch.prototype.phase = function(v){ return this._phase; }
Imba.Touch.prototype.setPhase = function(v){ this._phase = v; return this; }
;

Imba.Touch.prototype.__active = {};
Imba.Touch.prototype.active = function(v){ return this._active; }
Imba.Touch.prototype.setActive = function(v){ this._active = v; return this; }
;

Imba.Touch.prototype.__event = {};
Imba.Touch.prototype.event = function(v){ return this._event; }
Imba.Touch.prototype.setEvent = function(v){ this._event = v; return this; }
;

Imba.Touch.prototype.__pointer = {};
Imba.Touch.prototype.pointer = function(v){ return this._pointer; }
Imba.Touch.prototype.setPointer = function(v){ this._pointer = v; return this; }
;

Imba.Touch.prototype.__target = {};
Imba.Touch.prototype.target = function(v){ return this._target; }
Imba.Touch.prototype.setTarget = function(v){ this._target = v; return this; }
;

Imba.Touch.prototype.__handler = {};
Imba.Touch.prototype.handler = function(v){ return this._handler; }
Imba.Touch.prototype.setHandler = function(v){ this._handler = v; return this; }
;

Imba.Touch.prototype.__updates = {};
Imba.Touch.prototype.updates = function(v){ return this._updates; }
Imba.Touch.prototype.setUpdates = function(v){ this._updates = v; return this; }
;

Imba.Touch.prototype.__data = {};
Imba.Touch.prototype.data = function(v){ return this._data; }
Imba.Touch.prototype.setData = function(v){ this._data = v; return this; }
;


Imba.Touch.prototype.__gestures = {};
Imba.Touch.prototype.gestures = function(v){ return this._gestures; }
Imba.Touch.prototype.setGestures = function(v){ this._gestures = v; return this; }
;


Imba.Touch.prototype.__x0 = {};
Imba.Touch.prototype.x0 = function(v){ return this._x0; }
Imba.Touch.prototype.setX0 = function(v){ this._x0 = v; return this; }
;

Imba.Touch.prototype.__y0 = {};
Imba.Touch.prototype.y0 = function(v){ return this._y0; }
Imba.Touch.prototype.setY0 = function(v){ this._y0 = v; return this; }
;

Imba.Touch.prototype.preventDefault = function (){
	this.event() && this.event().preventDefault();
	return this;
};
Imba.Touch.prototype.extend = function (gesture){
	this._gestures || (this._gestures = []);
	this._gestures.push(gesture);
	return this;
};
Imba.Touch.prototype.redirect = function (target){
	this._redirect = target;
	return this;
};
Imba.Touch.prototype.suppress = function (){
	this._active = false;
	return this;
};
Imba.Touch.prototype.touchstart = function (e,t){
	this._x = t.clientX;
	this._y = t.clientY;
	this.began();
	return this;
};
Imba.Touch.prototype.touchmove = function (e,t){
	this._x = t.clientX;
	this._y = t.clientY;
	this.update();
	return this;
};
Imba.Touch.prototype.touchend = function (e,t){
	this._x = t.clientX;
	this._y = t.clientY;
	this.ended();
	return this;
};
Imba.Touch.prototype.touchcancel = function (e,t){
	return this;
};
Imba.Touch.prototype.mousedown = function (e,t){
	this._x = t.clientX;
	this._y = t.clientY;
	this.began();
	return this;
};
Imba.Touch.prototype.mousemove = function (e,t){
	this._x = t.clientX;
	this._y = t.clientY;
	this.update();
	return this;
};
Imba.Touch.prototype.mouseup = function (e,t){
	this._x = t.clientX;
	this._y = t.clientY;
	this.ended();
	return this;
};
Imba.Touch.prototype.idle = function (){
	return this.update();
};
Imba.Touch.prototype.began = function (){
	this._x0 = this._x;
	this._y0 = this._y;
	
	var e = this.event();
	var dom = this.event().target;
	var node = null;
	while(dom){
		node = tag$wrap(dom);
		if(node && node.ontouchstart) {
			this.setTarget(node);
			break;
		};
		dom = dom.parentNode;
	};
	(this._updates)++;
	if(this.target()) {
		this.target().ontouchstart(this);
	};
	return this;
};
Imba.Touch.prototype.update = function (){
	if(!(this._active)) {
		return this;
	};
	if(this._redirect) {
		if(this._target && this._target.ontouchcancel) {
			this._target.ontouchcancel(this);
		};
		this.setTarget(this._redirect);
		this._redirect = null;
		if(this.target().ontouchstart) {
			this.target().ontouchstart(this);
		};
	};
	(this._updates)++;
	if(this._gestures) {
		for(var i=0, ary=iter$(this._gestures), len=ary.length; i < len; i++){
			ary[i].ontouchupdate(this);
		};
	};
	if(this.target() && this.target().ontouchupdate) {
		this.target().ontouchupdate(this);
	};
	return this;
};
Imba.Touch.prototype.ended = function (){
	if(!(this._active)) {
		return this;
	};
	
	(this._updates)++;
	
	if(this._gestures) {
		for(var i=0, ary=iter$(this._gestures), len=ary.length; i < len; i++){
			ary[i].ontouchend(this);
		};
	};
	if(this.target() && this.target().ontouchend) {
		this.target().ontouchend(this);
	};
	return this;
};
Imba.Touch.prototype.cancelled = function (){
	return this;
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
	return (this._pointer) ? (this._pointer.button()) : (0);
};
Imba.TouchGesture = imba$class(function TouchGesture(){
	return this;
});

Imba.TouchGesture.prototype.__active = {default: false};
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
Imba.POINTER = new Imba.Pointer();
Imba.POINTERS = [Imba.POINTER];


Imba.Pointer.update();
Imba.KEYMAP = {"8": 'backspace',"9": 'tab',"13": 'enter',"16": 'shift',"17": 'ctrl',"18": 'alt',"19": 'break',"20": 'caps',"27": 'esc',"32": 'space',"35": 'end',"36": 'home',"37": 'larr',"38": 'uarr',"39": 'rarr',"40": 'darr',"45": 'insert',"46": 'delete',"107": 'plus',"106": 'mult',"91": 'meta'};

Imba.CHARMAP = {"%": 'modulo',"*": 'multiply',"+": 'add',"-": 'sub',"/": 'divide',".": 'dot'};


Imba.Event = imba$class(function Event(e){
	this.setEvent(e);
	(this.setBubble(true), true);
});

Imba.Event.prototype.__event = {};
Imba.Event.prototype.event = function(v){ return this._event; }
Imba.Event.prototype.setEvent = function(v){ this._event = v; return this; }
;

Imba.Event.prototype.__target = {};
Imba.Event.prototype.target = function(v){ return this._target; }
Imba.Event.prototype.setTarget = function(v){ this._target = v; return this; }
;

Imba.Event.prototype.__prefix = {};
Imba.Event.prototype.prefix = function(v){ return this._prefix; }
Imba.Event.prototype.setPrefix = function(v){ this._prefix = v; return this; }
;

Imba.Event.prototype.__data = {};
Imba.Event.prototype.data = function(v){ return this._data; }
Imba.Event.prototype.setData = function(v){ this._data = v; return this; }
;

Imba.Event.prototype.__source = {};
Imba.Event.prototype.source = function(v){ return this._source; }
Imba.Event.prototype.setSource = function(v){ this._source = v; return this; }
;

Imba.Event.prototype.__bubble = {};
Imba.Event.prototype.bubble = function(v){ return this._bubble; }
Imba.Event.prototype.setBubble = function(v){ this._bubble = v; return this; }
;

Imba.Event.wrap = function (e){
	return new this(e);
};
Imba.Event.prototype.name = function (){
	return this.event().type.toLowerCase().replace(/\:/g,'');
};
Imba.Event.prototype.bubble = function (v){
	if(v != undefined) {
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
	if(this.event().preventDefault) {
		this.event().preventDefault();
	};
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
	if(this.event() instanceof TextEvent) {
		return this.event().data;
	};
	if(this.event() instanceof KeyboardEvent) {
		var ki = this.event().keyIdentifier;
		var sym = Imba.KEYMAP[this.event().keyCode];
		
		if(!sym && ki.substr(0,2) == "U+") {
			sym = String.fromCharCode(global.parseInt(ki.substr(2),16));
		};
		return sym;
	};
	return null;
};
Imba.Event.prototype.keycombo = function (){
	var sym;
	if(!(sym = this.keychar())) {
		return;
	};
	sym = Imba.CHARMAP[sym] || sym;
	var combo = [];
	if(this.event().ctrlKey) {
		combo.push('ctrl');
	};
	if(this.event().shiftKey) {
		combo.push('shift');
	};
	if(this.event().altKey) {
		combo.push('alt');
	};
	if(this.event().metaKey) {
		combo.push('cmd');
	};
	combo.push(sym);
	return combo.join("_").toLowerCase();
};
Imba.Event.prototype.process = function (){
	var meth = ("on" + (this._prefix || '') + this.name());
	var domtarget = this.event()._target || this.event().target;
	
	var domnode = domtarget._responder || domtarget;
	while(domnode){
		this._redirect = null;
		var node = tag$wrap(domnode);
		if(node && (node[meth] instanceof Function)) {
			node[meth](this,this.data());
		};
		if(!(this.bubble() && (domnode = (this._redirect || ((node) ? (node.parent()) : (domnode.parentNode)))))) {
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
Imba.EventManager = imba$class(function EventManager(node,pars){
	var self=this;
	if(!pars||pars.constructor !== Object) pars = {};
	var events = pars.events !== undefined ? pars.events : [];
	self.setRoot(node);
	self.setListeners({});
	self.setDelegator(function (e){
		self.delegate(e);
		return true;
	});
	for(var i=0, ary=iter$(events), len=ary.length; i < len; i++){
		self.register(ary[i]);
	};
	self;
});

Imba.EventManager.prototype.__root = {};
Imba.EventManager.prototype.root = function(v){ return this._root; }
Imba.EventManager.prototype.setRoot = function(v){ this._root = v; return this; }
;

Imba.EventManager.prototype.__listeners = {};
Imba.EventManager.prototype.listeners = function(v){ return this._listeners; }
Imba.EventManager.prototype.setListeners = function(v){ this._listeners = v; return this; }
;

Imba.EventManager.prototype.__delegator = {};
Imba.EventManager.prototype.delegator = function(v){ return this._delegator; }
Imba.EventManager.prototype.setDelegator = function(v){ this._delegator = v; return this; }
;

Imba.EventManager.prototype.register = function (name,handler){
	if(handler === undefined) handler = true;
	if(name instanceof Array) {
		for(var i=0, ary=iter$(name), len=ary.length; i < len; i++){
			this.register(ary[i],handler);
		};
		return this;
	};
	if(this.listeners()[name]) {
		return this;
	};
	this.root().addEventListener(name,(handler instanceof Function) ? (handler) : (this.delegator()),true);
	return this.listeners()[name] = handler;
};
Imba.EventManager.prototype.listen = function (name,handler){
	this.root().addEventListener(name,handler,true);
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
	if(data) {
		(event.setData(data), data);
	};
	if(source) {
		(event.setSource(source), source);
	};
	return event;
};
Imba.EventManager.prototype.trigger = function (type,target,pars){
	if(!pars||pars.constructor !== Object) pars = {};
	var data = pars.data !== undefined ? pars.data : null;
	var source = pars.source !== undefined ? pars.source : null;
	var event = Imba.Event.wrap({type: type,target: target});
	if(data) {
		(event.setData(data), data);
	};
	if(source) {
		(event.setSource(source), source);
	};
	return event.process();
};
Imba.EventManager.prototype.emit = function (obj,event,data,pars){
	if(!pars||pars.constructor !== Object) pars = {};
	var dom = pars.dom !== undefined ? pars.dom : true;
	var ns = pars.ns !== undefined ? pars.ns : 'object';
	var fn = ("on" + ns);
	var nodes = DOC.querySelectorAll(("." + (obj.uid())));
	for(var i=0, ary=iter$(nodes), len=ary.length, node; i < len; i++){
		node = ary[i];
		if(node._tag && node._tag[fn]) {
			node._tag[fn](event,data);
		};
	};
	return this;
};
ED = new Imba.EventManager(global.document,{events: ['keydown', 'keyup', 'keypress', 'textInput', 'input', 'focusin', 'focusout', 'contextmenu', 'submit', 'mousedown', 'mouseup']});


ED.listen('click',function (e){
	return ED.trigger('tap',e.target);
});
if(hasTouchEvents) {
	ED.listen('touchstart',function (e){
		return Imba.Touch.ontouchstart(e);
	});
	ED.listen('touchmove',function (e){
		return Imba.Touch.ontouchmove(e);
	});
	ED.listen('touchend',function (e){
		return Imba.Touch.ontouchend(e);
	});
	ED.listen('touchcancel',function (e){
		return Imba.Touch.ontouchcancel(e);
	});
} else {
	ED.listen('mousedown',function (e){
		return (Imba.POINTER) && (Imba.POINTER.update(e).process());
	});
	ED.listen('mousemove',function (e){
		return (Imba.POINTER) && (Imba.POINTER.update(e));
	});
	ED.listen('mouseup',function (e){
		return (Imba.POINTER) && (Imba.POINTER.update(e).process());
	});
};
console.log("Imba touches",hasTouchEvents);
}())