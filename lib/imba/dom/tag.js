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

// could cache similar event handlers with the same parts
function EventHandler(params){
	this.params = params;
};

EventHandler.prototype.getHandlerForMethod = function (path,name){
	for (let i = 0, items = iter$(path), len = items.length, item; i < len; i++) {
		item = items[i];
		if (item[name]) {
			return item;
		};
	};
	return null;
};

EventHandler.prototype.handleEvent = function (event){
	// console.log "handling event!",event,@params
	
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
			event.stopPropagation();
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
	return;
};



	
	Element.prototype.on$ = function (type,parts){
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
		
		console.log('insert$',item,prev,type);
		
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
	let prev = this.array[idx];
	
	// console.log("push dom item")
	
	// do nothing
	if (prev === item) {
		// console.log "is at same position",item
		// if @remove.has(item)
		// 	@remove.delete(item)
		true;
	} else {
		let lastIndex = this.array.indexOf(item); // @map.get(item) #  @array.indexOf(item)
		
		if (this.remove.has(item)) {
			this.remove.delete(item);
		};
		
		// this is a new item to be inserted
		if (lastIndex == -1) {
			// console.log 'was not in loop before'
			this.array.splice(idx,0,item);
			this.appendChild(item,idx);
		} else if (lastIndex == idx + 1) {
			// console.log 'was originally one step ahead'
			this.array.splice(idx,1); // just remove the previous slot?
			// mark previous index of previous item?
		} else {
			this.array[idx] = item;
			this.appendChild(item,idx);
			if (prev) { this.remove.add(prev) };
		};
		
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
	if (item.parentNode == this.parent) { this.parent.removeChild(item) };
	return;
};

KeyedTagFragment.prototype.open$ = function (){
	return this;
};

KeyedTagFragment.prototype.close$ = function (index){
	var self = this;
	if (self.remove.size) {
		// console.log('remove items from keyed tag',@remove.entries())
		self.remove.forEach(function(item) { return self.removeChild(item); });
		self.remove.clear();
	};
	
	if (self.array.length > index) {
		// remove the children below
		while (self.array.length > index){
			let item = self.array.pop();
			// console.log("remove child",item.data.id)
			self.removeChild(item);
		};
		// @array.length = index
	};
	return self;
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
