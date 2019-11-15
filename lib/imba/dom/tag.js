var Imba = require("../imba");

if (true) {
	var serverDom = require('./server');
	var Element = ImbaServerElement;
	var document = new ImbaServerDocument();
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
	
	Element.prototype.on$ = function (){
		console.log("define listener");
		return;
	};


Imba.createElement = function (name,parent,index,flags,text){
	var type = name;
	var el;
	
	if (name instanceof Function) {
		type = name;
	} else {
		el = document.createElement(name);
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
