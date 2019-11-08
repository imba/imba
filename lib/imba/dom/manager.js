function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = require("../imba");

Imba.TagManagerClass = function TagManagerClass(){
	this.inserts = 0;
	this.removes = 0;
	this.mounted = [];
	this.mountables = 0;
	this.unmountables = 0;
	this.unmounting = 0;
	this;
};

Imba.TagManagerClass.prototype.insert = function (node,parent){
	this.inserts++;
	if (node && node.mount) { this.regMountable(node) };
	// unless node.FLAGS & Imba.TAG_MOUNTABLE
	// 	node.FLAGS |= Imba.TAG_MOUNTABLE
	// 	@mountables++
	return;
};

Imba.TagManagerClass.prototype.remove = function (node,parent){
	return this.removes++;
};

Object.defineProperty(Imba.TagManagerClass.prototype,'changes',{get: function(){
	return this.inserts + this.removes;
}, configurable: true});

Imba.TagManagerClass.prototype.mount = function (node){
	return;
};

Imba.TagManagerClass.prototype.refresh = function (force){
	if(force === undefined) force = false;
	if (true) { return };
	if (!force && this.changes == 0) { return };
	// console.time('resolveMounts')
	if ((this.inserts && this.mountables > this.mounted.length) || force) {
		this.tryMount();
	};
	
	if ((this.removes || force) && this.mounted.length) {
		this.tryUnmount();
	};
	// console.timeEnd('resolveMounts')
	this.inserts = 0;
	this.removes = 0;
	return this;
};

Imba.TagManagerClass.prototype.unmount = function (node){
	return this;
};

Imba.TagManagerClass.prototype.regMountable = function (node){
	if (!(node.FLAGS & Imba.TAG_MOUNTABLE)) {
		node.FLAGS |= Imba.TAG_MOUNTABLE;
		return this.mountables++;
	};
};


Imba.TagManagerClass.prototype.tryMount = function (){
	var count = 0;
	var root = document.body;
	var items = root.querySelectorAll('.__mount');
	// what if we end up creating additional mountables by mounting?
	for (let i = 0, ary = iter$(items), len = ary.length, el; i < len; i++) {
		el = ary[i];
		if (el && el.tag) {
			if (this.mounted.indexOf(el.tag) == -1) {
				this.mountNode(el.tag);
			};
		};
	};
	return this;
};

Imba.TagManagerClass.prototype.mountNode = function (node){
	if (this.mounted.indexOf(node) == -1) {
		this.regMountable(node);
		this.mounted.push(node);
		
		node.FLAGS |= Imba.TAG_MOUNTED;
		if (node.mount) { node.mount() };
		// Mark all parents as mountable for faster unmount
		// let el = node.@dom:parentNode
		// while el and el.@tag and !el.@tag:mount and !(el.@tag.FLAGS & Imba.TAG_MOUNTABLE)
		// 	el.@tag.FLAGS |= Imba.TAG_MOUNTABLE
		// 	el = el:parentNode
	};
	return;
};

Imba.TagManagerClass.prototype.tryUnmount = function (){
	this.unmounting++;
	
	var unmount = [];
	var root = document.body;
	for (let i = 0, items = iter$(this.mounted), len = items.length, item; i < len; i++) {
		item = items[i];
		if (!item) { continue; };
		if (!document.documentElement.contains(item.dom)) {
			unmount.push(item);
			this.mounted[i] = null;
		};
	};
	
	this.unmounting--;
	
	if (unmount.length) {
		this.mounted = this.mounted.filter(function(item) { return item && unmount.indexOf(item) == -1; });
		for (let i = 0, len = unmount.length, item; i < len; i++) {
			item = unmount[i];
			item.FLAGS = item.FLAGS & ~Imba.TAG_MOUNTED;
			if (item.unmount && item.dom) {
				item.unmount();
			} else if (item.scheduler) {
				item.unschedule();
			};
		};
	};
	return this;
};
