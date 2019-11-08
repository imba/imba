function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = require("../imba");

var keyCodes = {
	esc: 27,
	tab: 9,
	enter: 13,
	space: 32,
	up: 38,
	down: 40
};

var el = Imba.Tag.prototype;
el.stopModifier = function (e){
	return e.stop() || true;
};
el.preventModifier = function (e){
	return e.prevent() || true;
};
el.silenceModifier = function (e){
	return e.silence() || true;
};
el.bubbleModifier = function (e){
	return e.bubble(true) || true;
};
el.ctrlModifier = function (e){
	return e.event.ctrlKey == true;
};
el.altModifier = function (e){
	return e.event.altKey == true;
};
el.shiftModifier = function (e){
	return e.event.shiftKey == true;
};
el.metaModifier = function (e){
	return e.event.metaKey == true;
};
el.keyModifier = function (key,e){
	return e.keyCode ? ((e.keyCode == key)) : true;
};
el.delModifier = function (e){
	return e.keyCode ? ((e.keyCode == 8 || e.keyCode == 46)) : true;
};
el.selfModifier = function (e){
	return e.event.target == this.dom;
};
el.leftModifier = function (e){
	return (e.button != undefined) ? ((e.button === 0)) : el.keyModifier(37,e);
};
el.rightModifier = function (e){
	return (e.button != undefined) ? ((e.button === 2)) : el.keyModifier(39,e);
};
el.middleModifier = function (e){
	return (e.button != undefined) ? ((e.button === 1)) : true;
};

el.getHandler = function (str,event){
	if (this[str]) {
		return this;
	};
	if (this.owner_ && this.owner_.getHandler) {
		return this.owner_.getHandler(str,event);
	};
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
	this.event = this.native = e;
	this.bubble = true;
};

Object.defineProperty(Imba.Event.prototype,'prefix',{
	configurable: true,
	get: function(){ return this._prefix; },
	set: function(v){ this._prefix = v; }
});
Object.defineProperty(Imba.Event.prototype,'source',{
	configurable: true,
	get: function(){ return this._source; },
	set: function(v){ this._source = v; }
});
Object.defineProperty(Imba.Event.prototype,'data',{
	configurable: true,
	get: function(){ return this._data; },
	set: function(v){ this._data = v; }
});
Object.defineProperty(Imba.Event.prototype,'responder',{
	configurable: true,
	get: function(){ return this._responder; },
	set: function(v){ this._responder = v; }
});

Imba.Event.wrap = function (e){
	return new this(e);
};

Object.defineProperty(Imba.Event.prototype,'type',{set: function(value){
	return this.__type = value;
}, configurable: true});

Object.defineProperty(Imba.Event.prototype,'type',{get: function(){
	return this.__type || this.event.type;
}, configurable: true});

Object.defineProperty(Imba.Event.prototype,'name',{get: function(){
	return this.__name || (this.__name = this.type.toLowerCase().replace(/\:/g,''));
}, configurable: true});

// mimc getset
// TODO fix getset form?
Imba.Event.prototype.bubble = function (v){
	if (v != undefined) {
		this.bubble = v;
		return this;
	};
	return this.bubble;
};

Imba.Event.prototype.setBubble = function (v){
	this.bubble = v;
	return this;
};

/*
	Prevents further propagation of the current event.
	@return {self}
	*/

Imba.Event.prototype.stop = function (){
	this.bubble = false;
	return this;
};

Imba.Event.prototype.stopPropagation = function (){
	return this.stop();
};

Imba.Event.prototype.halt = function (){
	return this.stop();
};

// migrate from cancel to prevent
Imba.Event.prototype.prevent = function (){
	if (this.event.preventDefault) {
		this.event.preventDefault();
	} else {
		this.event.defaultPrevented = true;
	};
	this.defaultPrevented = true;
	return this;
};

Imba.Event.prototype.preventDefault = function (){
	console.warn("Event#preventDefault is deprecated - use Event#prevent");
	return this.prevent();
};

/*
	Indicates whether or not event.cancel has been called.

	@return {Boolean}
	*/

Imba.Event.prototype.isPrevented = function (){
	return this.event ? this.event.defaultPrevented : this.defaultPrevented;
};

/*
	Cancel the event (if cancelable). In the case of native events it
	will call `preventDefault` on the wrapped event object.
	@return {self}
	*/

Imba.Event.prototype.cancel = function (){
	console.warn("Event#cancel is deprecated - use Event#prevent");
	return this.prevent();
};

Imba.Event.prototype.silence = function (){
	this.silenced = true;
	return this;
};

Imba.Event.prototype.isSilenced = function (){
	return !!this.silenced;
};

/*
	A reference to the initial target of the event.
	*/

Object.defineProperty(Imba.Event.prototype,'target',{get: function(){
	return Imba.getTagForDom(this.event._target || this.event.target);
}, configurable: true});

/*
	Redirect the event to new target
	*/

Imba.Event.prototype.redirect = function (node){
	this.__redirect = node;
	return this;
};

Imba.Event.prototype.processHandlers = function (node,handlers){
	var state_;
	let i = 1;
	let l = handlers.length;
	let bubble = this.bubble;
	let state = (state_ = handlers.state) || (handlers.state = {});
	let result;
	
	if (bubble) {
		this.bubble = 1;
	};
	
	while (i < l){
		let isMod = false;
		let handler = handlers[i++];
		let params = null;
		let context = node;
		let checkSpecial = false;
		
		if (handler instanceof Array) {
			params = handler.slice(1);
			checkSpecial = true;
			handler = handler[0];
		};
		
		if (typeof handler == 'string') {
			if (keyCodes[handler]) {
				params = [keyCodes[handler]];
				handler = 'key';
			};
			
			let mod = handler + 'Modifier';
			
			if (node[mod]) {
				isMod = true;
				params = (params || []).concat([this,state]);
				handler = node[mod];
			};
		};
		
		// if it is still a string - call getHandler on
		// ancestor of node to see if we get a handler for this name
		if (typeof handler == 'string') {
			let el = node;
			let fn = null;
			let ctx = state.context;
			
			if (ctx) {
				if (ctx.getHandler instanceof Function) {
					ctx = ctx.getHandler(handler,this);
				};
				
				if (ctx[handler] instanceof Function) {
					handler = fn = ctx[handler];
					context = ctx;
				};
			};
			
			if (!fn) {
				console.warn(("event " + this.type + ": could not find '" + handler + "' in context"),ctx);
			};
			
			// while el and (!fn or !(fn isa Function))
			// 	if fn = el.getHandler(handler)
			// 		if fn[handler] isa Function
			// 			handler = fn[handler]
			// 			context = fn
			// 		elif fn isa Function
			// 			handler = fn
			// 			context = el
			// 	else
			// 		el = el.parent
		};
		
		if (handler instanceof Function) {
			// what if we actually call stop inside function?
			// do we still want to continue the chain?
			
			// loop through special variables from params?
			
			if (checkSpecial) {
				// replacing special params
				for (let i = 0, items = iter$(params), len = items.length, param; i < len; i++) {
					param = items[i];
					if (typeof param == 'string' && param[0] == '~' && param[1] == '$') {
						let name = param.slice(2);
						if (name == 'event') {
							params[i] = this;
						} else if (this[name] instanceof Function) {
							params[i] = this[name]();
						} else if (node[name] instanceof Function) {
							params[i] = node[name]();
						} else {
							console.warn(("Missing special handler $" + name));
						};
					};
				};
			};
			
			let res = handler.apply(context,params || [this]);
			
			if (!isMod) {
				this.responder || (this.responder = node);
			};
			
			if (res == false) {
				break;
			};
			
			if (res && !this.silenced && (res.then instanceof Function)) {
				res.then(Imba.commit);
			};
		};
	};
	
	// if we havent stopped or dealt with bubble while handling
	if (this.bubble === 1) {
		this.bubble = bubble;
	};
	
	return null;
};

Imba.Event.prototype.process = function (){
	var name = this.name;
	var meth = ("on" + (this.prefix || '') + name);
	var args = null;
	// FIXME _target and _responder on event
	var domtarget = this.event._target || this.event.target;
	var domnode = domtarget._responder || domtarget;
	// @todo need to stop infinite redirect-rules here
	var result;
	var handlers;
	
	while (domnode){
		this.__redirect = null;
		let node = domnode.dom ? domnode : domnode.tag;
		
		if (node) {
			if (handlers = node._on_) {
				for (let i = 0, items = iter$(handlers), len = items.length, handler; i < len; i++) {
					handler = items[i];
					if (!handler) { continue; };
					let hname = handler[0];
					if (name == handler[0] && this.bubble) {
						this.processHandlers(node,handler);
					};
				};
				if (!this.bubble) { break; };
			};
			
			if (this.bubble && (node[meth] instanceof Function)) {
				this.responder || (this.responder = node);
				this.silenced = false;
				result = args ? node[meth].apply(node,args) : node[meth](this,this.data);
			};
			
			if (node.onevent) {
				node.onevent(this);
			};
		};
		
		// add node.nextEventResponder as a separate method here?
		if (!(this.bubble && (domnode = (this.__redirect || (node ? node.parent : domnode.parentNode))))) {
			break;
		};
	};
	
	this.processed();
	
	// if a handler returns a promise, notify schedulers
	// about this after promise has finished processing
	if (result && (result.then instanceof Function)) {
		result.then(this.processed.bind(this));
	};
	return this;
};


Imba.Event.prototype.processed = function (){
	if (!this.silenced && this.responder) {
		Imba.emit(Imba,'event',[this]);
		Imba.commit(this.event);
	};
	return this;
};

/*
	Return the x/left coordinate of the mouse / pointer for this event
	@return {Number} x coordinate of mouse / pointer for event
	*/

Object.defineProperty(Imba.Event.prototype,'x',{get: function(){
	return this.event.x;
}, configurable: true});

/*
	Return the y/top coordinate of the mouse / pointer for this event
	@return {Number} y coordinate of mouse / pointer for event
	*/

Object.defineProperty(Imba.Event.prototype,'y',{get: function(){
	return this.event.y;
}, configurable: true});

Object.defineProperty(Imba.Event.prototype,'button',{get: function(){
	return this.event.button;
}, configurable: true});

Object.defineProperty(Imba.Event.prototype,'keyCode',{get: function(){
	return this.event.keyCode;
}, configurable: true});

Object.defineProperty(Imba.Event.prototype,'ctrl',{get: function(){
	return this.event.ctrlKey;
}, configurable: true});

Object.defineProperty(Imba.Event.prototype,'alt',{get: function(){
	return this.event.altKey;
}, configurable: true});

Object.defineProperty(Imba.Event.prototype,'shift',{get: function(){
	return this.event.shiftKey;
}, configurable: true});

Object.defineProperty(Imba.Event.prototype,'meta',{get: function(){
	return this.event.metaKey;
}, configurable: true});

Object.defineProperty(Imba.Event.prototype,'key',{get: function(){
	return this.event.key;
}, configurable: true});

/*
	Returns a Number representing a system and implementation
	dependent numeric code identifying the unmodified value of the
	pressed key; this is usually the same as keyCode.

	For mouse-events, the returned value indicates which button was
	pressed on the mouse to trigger the event.

	@return {Number}
	*/

Object.defineProperty(Imba.Event.prototype,'which',{get: function(){
	return this.event.which;
}, configurable: true});
