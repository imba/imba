function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = require("../imba");

if (true) {
	var serverDom = require('./server');
	var Element = ImbaServerElement;
	var document = new ImbaServerDocument();
};

Imba.mount = function (element,parent){
	return (parent || document.body).appendChild(element);
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

// could cache similar event handlers with the same parts
function EventHandler(params,closure,file){
	this.params = params;
	this.closure = closure;
	this.file = file;
};

EventHandler.prototype.getHandlerForMethod = function (path,name){
	if (this.closure && this.closure[name]) {
		return this.closure;
	};
	if (this.file && this.file[name]) {
		return this.file;
	};
	for (let i = 0, items = iter$(path), len = items.length, item; i < len; i++) {
		item = items[i];
		if (item[name]) {
			return item;
		};
	};
	return null;
};

EventHandler.prototype.handleEvent = function (event){
	var target = event.target;
	var parts = this.params;
	var i = 0;
	
	for (let i = 0, items = iter$(this.params), len = items.length; i < len; i++) {
		let handler = items[i];
		let args = [event];
		
		if (handler instanceof Array) {
			args = handler.slice(1);
			handler = handler[0];
			
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
			event.stopImmediatePropagation();
		} else if (handler == 'prevent') {
			event.preventDefault();
		} else if (handler == 'ctrl') {
			if (!event.ctrlKey) { break; };
		} else if (handler == 'alt') {
			if (!event.altKey) { break; };
		} else if (handler == 'shift') {
			if (!event.shiftKey) { break; };
		} else if (handler == 'meta') {
			if (!event.metaKey) { break; };
		} else if (handler == 'self') {
			if (target != event.currentTarget) { break; };
		} else if (keyCodes[handler]) {
			if (keyCodes[handler].indexOf(event.keyCode) < 0) {
				break;
			};
		} else if (typeof handler == 'string') {
			let context = this.getHandlerForMethod(event.path,handler);
			if (context) {
				// console.log "found context?!"
				let res = context[handler].apply(context,args);
			};
		};
	};
	
	Imba.commit();
	return;
};



	
	Element.prototype.on$ = function (type,parts,scope,file){
		var handler = new EventHandler(parts,scope,file);
		this.addEventListener(type,handler);
		return handler;
	};
	
	Element.prototype.text$ = function (item){
		this.textContent = item;
		return this;
	};
	
	Element.prototype.schedule = function (){
		return Imba.scheduled.add(this);
	};
	
	Element.prototype.unschedule = function (){
		return Imba.scheduled.remove(this);
	};
	
	Element.prototype.insert$ = function (item,index,prev){
		let type = typeof item;
		
		if (type === 'undefined' || item === null) {
			let el = document.createComment('');
			prev ? this.replaceChild(el,prev) : this.appendChild(el);
			return el;
		} else if (type !== 'object') {
			let res;
			let txt = item;
			
			if (index == -1) {
				this.textContent = txt;
				return;
			};
			
			if (prev) {
				if (prev instanceof Text) {
					prev.textContent = txt;
					return prev;
				} else {
					res = document.createTextNode(txt);
					this.replaceChild(res,prev);
					return res;
				};
			} else {
				this.appendChild(res = document.createTextNode(txt));
				return res;
			};
		} else if (item instanceof Element) {
			// if we are the only child we want to replace it?
			prev ? this.replaceChild(item,prev) : this.appendChild(item);
			return item;
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
	
	Element.prototype.open$ = function (){
		return this;
	};
	
	Element.prototype.close$ = function (){
		return this;
	};
	
	Element.prototype.end$ = function (){
		if (this.render) { this.render() };
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
	this.array = [];
	this.remove = new Set();
	this.map = new WeakMap();
	
	this.$ = {};
};

Imba.subclass(KeyedTagFragment,TagFragment);
exports.KeyedTagFragment = KeyedTagFragment; // export class 
KeyedTagFragment.prototype.push = function (item,idx){
	let toReplace = this.array[idx];
	
	// console.log("push dom item",item,idx,item.innerHTML,toReplace && toReplace.innerHTML,toReplace === item)
	
	// do nothing
	if (toReplace === item) {
		true;
	} else {
		let prevIndex = this.map.get(item);
		
		if (prevIndex === undefined) {
			// this is a new item
			console.log("added item");
			this.array.splice(idx,0,item);
			this.appendChild(item,idx);
		} else if (true) {
			// console.log("moving item?!",idx,prevIndex,item)
			let prev = this.array.indexOf(item);
			if (prev >= 0) { this.array.splice(prev,1) };
			this.array.splice(idx,0,item);
			this.appendChild(item,idx);
		};
		
		// if @remove.has(item)
		// 	@remove.delete(item)
		
		// this is a new item to be inserted
		// if prevIndex == -1
		// 	console.log 'was not in loop before',item,idx
		// 	@array.splice(idx,0,item)
		// 	@appendChild(item,idx)
		
		// elif lastIndex == idx + 1
		// 	# console.log 'was originally one step ahead'
		// 	@array.splice(idx,1) # just remove the previous slot?
		// 	# mark previous index of previous item?
		// else
		// 	@array[idx] = item
		// 	@appendChild(item,idx)
		// 	@remove.add(prev) if prev
		
		// mark previous element as something to remove?
		// if prev is now further ahead - dont care?
	};
	
	return;
};

KeyedTagFragment.prototype.appendChild = function (item,index){
	// we know that these items are dom elements
	// console.log "append child",item,index
	this.map.set(item,index);
	
	if (index > 0) {
		let other = this.array[index - 1];
		other.insertAdjacentElement('afterend',item);
	} else {
		this.parent.insertAdjacentElement('afterbegin',item);
		// if there are no new items?
		// @parent.appendChild(item)
	};
	return;
};

KeyedTagFragment.prototype.removeChild = function (item,index){
	this.map.delete(item);
	if (item.parentNode == this.parent) {
		this.parent.removeChild(item);
	};
	
	return;
};

KeyedTagFragment.prototype.open$ = function (){
	return this;
};

KeyedTagFragment.prototype.close$ = function (index){
	var self2 = this;
	if (self2.remove.size) {
		// console.log('remove items from keyed tag',@remove.entries())
		self2.remove.forEach(function(item) { return self2.removeChild(item); });
		self2.remove.clear();
	};
	
	// there are some items we should remove now
	if (self2.array.length > index) {
		// remove the children below
		while (self2.array.length > index){
			let item = self2.array.pop();
			// console.log("remove child",item.data.id)
			self2.removeChild(item);
		};
		// @array.length = index
	};
	return self2;
};

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

// Create custom tag with support for scheduling and unscheduling etc
var TagComponent = class extends HTMLElement { };

	TagComponent.prototype.connectedCallback = function (){
		return this.mount();
	};
	
	TagComponent.prototype.disconnectedCallback = function (){
		return this.unmount();
	};
	
	TagComponent.prototype.mount = function (){
		return this.schedule();
	};
	
	TagComponent.prototype.unmount = function (){
		return this.unschedule();
	};
	
	TagComponent.prototype.tick = function (){
		return this.render && this.render();
	};


if (false) {};

// TagComponent.prototype.mount = do this.schedule()
// TagComponent.prototype.unmount = do this.unschedule()
// TagComponent.prototype.tick = do this.render && this.render()

function TagScope(ns){
	this.ns = ns;
	this.flags = ns ? ['_' + ns] : [];
};

TagScope.prototype.defineTag = function (name,supr,body){
	var connectedCallback_, disconnectedCallback_;
	var superklass = HTMLElement;
	
	if ((typeof supr=='string'||supr instanceof String)) {
		if (supr == 'component') {
			supr = 'imba-component';
		};
		
		superklass = window.customElements.get(supr);
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
	
	var proto = klass.prototype;
	
	if (proto.mount) {
		(connectedCallback_ = proto.connectedCallback) || (proto.connectedCallback = function() { return this.mount(); });
	};
	
	if (proto.unmount) {
		(disconnectedCallback_ = proto.disconnectedCallback) || (proto.disconnectedCallback = function() { return this.unmount(); });
		// proto.unmount
	};
	
	window.customElements.define(name,klass);
	return klass;
	// return Imba.TAGS.defineTag({scope: self},name,supr,body)
};

TagScope.prototype.extendTag = function (name,body){
	return Imba.TAGS.extendTag({scope: this},name,body);
};
