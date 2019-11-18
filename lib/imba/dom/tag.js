function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = require("../imba");

if (true) {
	var serverDom = require('./server');
	var Element = ImbaServerElement;
	var document = new ImbaServerDocument();
};


var keyCodes = {
	esc: [27],
	tab: [9],
	enter: [13],
	space: [32],
	up: [38],
	down: [40],
	del: [8,46]
};

var el = Element.prototype;

// add the modifiers to event instead of Element?

	Event.prototype.stopModifier = function (e){
		return e.stopPropagation() || true;
	};
	Event.prototype.preventModifier = function (e){
		return e.prevent() || true;
	};
	Event.prototype.silenceModifier = function (e){
		return e.silence() || true;
	};
	Event.prototype.bubbleModifier = function (e){
		return e.bubble(true) || true;
	};
	Event.prototype.ctrlModifier = function (e){
		return e.event.ctrlKey == true;
	};
	Event.prototype.altModifier = function (e){
		return e.event.altKey == true;
	};
	Event.prototype.shiftModifier = function (e){
		return e.event.shiftKey == true;
	};
	Event.prototype.metaModifier = function (e){
		return e.event.metaKey == true;
	};
	Event.prototype.keyModifier = function (key,e){
		return e.keyCode ? ((e.keyCode == key)) : true;
	};
	Event.prototype.delModifier = function (e){
		return e.keyCode ? ((e.keyCode == 8 || e.keyCode == 46)) : true;
	};
	Event.prototype.selfModifier = function (e){
		return e.event.target == this.dom;
	};
	Event.prototype.leftModifier = function (e){
		return (e.button != undefined) ? ((e.button === 0)) : el.keyModifier(37,e);
	};
	Event.prototype.rightModifier = function (e){
		return (e.button != undefined) ? ((e.button === 2)) : el.keyModifier(39,e);
	};
	Event.prototype.middleModifier = function (e){
		return (e.button != undefined) ? ((e.button === 1)) : true;
	};


// could cache similar event handlers with the same parts
function EventHandler(params){
	this.params = params;
};

EventHandler.prototype.getHandlerForMethod = function (path,name){
	for (let i = 0, items = iter$(path), len = items.length, item; i < len; i++) {
		item = items[i];
		if (item[name]) {
			console.log("found handler",name,item);
			return item;
		};
	};
	return null;
};

EventHandler.prototype.handleEvent = function (event){
	console.log("handling event!",event,this.params);
	
	var target = event.target;
	var parts = this.params;
	var i = 0;
	
	for (let i = 0, items = iter$(this.params), len = items.length; i < len; i++) {
		let handler = items[i];
		let args = [event];
		let checkSpecial = false;
		
		if (handler instanceof Array) {
			args = handler.slice(1);
			handler = handler[0];
			checkSpecial = true;
			
			for (let i = 0, ary = iter$(args), len = ary.length, param; i < len; i++) {
				// what about fully nested arrays and objects?
				param = ary[i];
				if (typeof param == 'string' && param[0] == '~' && param[1] == '$') {
					let name = param.slice(2);
					if (name == 'event') {
						args[i] = event;
					} else if (name == 'this') {
						args[i] = this.element;
					} else {
						args[i] = event[name];
					};
				};
			};
		};
		
		// check if it is an array?
		if (handler == 'stop') {
			event.stopPropagation();
		} else if (handler == 'prevent') {
			console.log("preventing default!");
			event.preventDefault();
		} else if (handler == 'ctrl') {
			if (!event.ctrlKey) { break; };
		} else if (handler == 'alt') {
			if (!event.altKey) { break; };
		} else if (handler == 'shift') {
			if (!event.shiftKey) { break; };
		} else if (handler == 'meta') {
			if (!event.metaKey) { break; };
		} else if (keyCodes[handler]) {
			if (keyCodes[handler].indexOf(event.keyCode) < 0) {
				break;
			};
		} else if (typeof handler == 'string') {
			let context = this.getHandlerForMethod(event.path,handler);
			if (context) {
				console.log("found context?!");
				let res = context[handler].apply(context,args);
			};
		};
	};
	return;
};




	
	Element.prototype.on$ = function (type,parts){
		console.log("add listener",type,parts);
		var handler = new EventHandler(parts);
		this.addEventListener(type,handler);
		return handler;
	};
	
	Element.prototype.text$ = function (item){
		this.textContent = item;
		return this;
	};
	
	Element.prototype.insert$ = function (item,index,prev){
		let type = typeof item;
		
		if (type !== 'object') {
			let res;
			let txt = (item === undefined || item === null) ? '' : item;
			if (index == -1) {
				this.textContent = txt;
			} else {
				this.appendChild(res = document.createTextNode(txt));
				return res;
			};
		} else if (item instanceof Element) {
			this.appendChild(item);
		};
		return;
	};
	
	Element.prototype.flag$ = function (str){
		this.className = str;
		return;
	};
	
	Element.prototype.flagIf$ = function (flag,bool){
		bool ? this.classList.add(flag) : this.classList.remove(flag);
		return;
	};
	
	Element.prototype.render = function (){
		if (this.template$) {
			this.template$();
		};
		return;
	};
	
	Element.prototype.open$ = function (){
		return this;
	};
	
	Element.prototype.close$ = function (){
		return this;
	};
	
	Element.prototype.end$ = function (){
		this.render();
		return;
	};


Imba.createElement = function (name,parent,index,flags,text){
	var type = name;
	var el;
	
	if (name instanceof Function) {
		type = name;
	} else {
		el = document.createElement(name);
		// console.log 'created element',name,el
	};
	
	if (el) {
		if (flags) { el.className = flags };
		if (text !== null) { el.text$(text) };
		
		if (parent && index != null && (parent instanceof Element)) {
			parent.insert$(el,index);
		};
	};
	return el;
};

Imba.createElementFactory = function (ns){
	if (!ns) { return Imba.createElement };
	
	return function(name,ctx,ref,pref) {
		var node = Imba.createElement(name,ctx,ref,pref);
		node.dom.classList.add('_' + ns);
		return node;
	};
};

Imba.createTagScope = function (ns){
	return new TagScope(ns);
};

Imba.createFragment = function (type,parent,slot,options){
	if (type == 2) {
		return new KeyedTagFragment(parent,slot,options);
	} else if (type == 1) {
		return new IndexedTagFragment(parent,slot,options);
	};
};

function TagFragment(){ };

exports.TagFragment = TagFragment; // export class 


function KeyedTagFragment(parent,slot){
	this.parent = parent;
	this.slot = slot;
	this.$ = {}; // this is the map
	this.array = [];
	this.prev = [];
	this.index = 0;
	this.taglen = 0;
	this.starter = Imba.document.createComment('');
	this.reconciled = false;
};

Imba.subclass(KeyedTagFragment,TagFragment);
exports.KeyedTagFragment = KeyedTagFragment; // export class 
KeyedTagFragment.prototype.reset = function (){
	this.index = 0;
	var curr = this.array;
	this.array = this.prev;
	this.prev = curr;
	this.prev.taglen = this.taglen;
	this.index = 0;
	
	return this;
};

KeyedTagFragment.prototype.$iter = function (){
	return this.reset();
};

KeyedTagFragment.prototype.prune = function (items){
	return this;
};

KeyedTagFragment.prototype.push = function (item){
	let prev = this.prev[this.index];
	this.array[this.index] = item;
	this.index++;
	return;
};

KeyedTagFragment.prototype.insertInto = function (parent,index){
	// console.log "inserting into!!",parent,index
	var fragment = Imba.document.createDocumentFragment();
	var i = 0;
	var len = this.index;
	while (i < len){
		let item = this.array[i++];
		fragment.appendChild(item.dom);
	};
	
	parent.dom.appendChild(fragment);
	return this;
};

KeyedTagFragment.prototype.reconcile = function (parent,siblings,index){
	console.log("reconciling fragment!",this);
	// reconcile this now?
	return this;
};

Object.defineProperty(KeyedTagFragment.prototype,'length',{get: function(){
	return this.taglen;
}, configurable: true});

function IndexedTagFragment(parent,slot){
	this.parent = parent;
	this.$ = [];
	this.length = 0;
};

Imba.subclass(IndexedTagFragment,TagFragment);
exports.IndexedTagFragment = IndexedTagFragment; // export class 
IndexedTagFragment.prototype.push = function (item,idx){
	return;
};

IndexedTagFragment.prototype.reconcile = function (len){
	let from = this.length;
	if (from == len) { return };
	let array = this.$;
	
	if (from > len) {
		// items should have been added automatically
		while (from > len){
			var item = array[--from];
			this.removeChild(item,from);
		};
	} else if (len > from) {
		while (len > from){
			let node = array[from++];
			this.appendChild(node,from - 1);
		};
	};
	this.length = len;
	return;
};

IndexedTagFragment.prototype.insertInto = function (parent,slot){
	return this;
};

IndexedTagFragment.prototype.appendChild = function (item,index){
	// we know that these items are dom elements
	this.parent.appendChild(item);
	return;
};

IndexedTagFragment.prototype.removeChild = function (item,index){
	this.parent.removeChild(item);
	return;
};

function TagScope(ns){
	this.ns = ns;
	this.flags = ns ? ['_' + ns] : [];
};

TagScope.prototype.defineTag = function (name,supr,body){
	var superklass = HTMLElement;
	
	if ((typeof supr=='string'||supr instanceof String)) {
		superklass = window.customElements.get(supr);
		console.log("get new superclass",supr,superklass);
	};
	
	var klass = class extends superklass {
	
				constructor(){
					super();
					if(this.initialize) this.initialize();
				}
	
				};
	if (body) {
		body(klass);
	};
	
	if (klass.prototype.$mount) {
		klass.prototype.connectedCallback = klass.prototype.$mount;
	};
	
	if (klass.prototype.$unmount) {
		klass.prototype.disconnectedCallback = klass.prototype.$unmount;
	};
	
	window.customElements.define(name,klass);
	return klass;
	// return Imba.TAGS.defineTag({scope: self},name,supr,body)
};

TagScope.prototype.extendTag = function (name,body){
	return Imba.TAGS.extendTag({scope: this},name,body);
};
