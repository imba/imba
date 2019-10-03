function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = require("../imba");

Imba.TagManagerClass = function TagManagerClass(){
	this._tryMounting = false;
	this._tryUnmounting = false;
	this._mounted = [];
	this._mountables = 0;
	this._unmountables = 0;
	this._unmounting = 0;
	this;
};

Imba.TagManagerClass.prototype.mounted = function (){
	return this._mounted;
};

Imba.TagManagerClass.prototype.insert = function (node,parent){
	if (node && node.mount) { this._tryMounting = true };
	if (node && node.mount) { this.regMountable(node) };
	// unless node.FLAGS & Imba.TAG_MOUNTABLE
	// 	node.FLAGS |= Imba.TAG_MOUNTABLE
	// 	@mountables++
	return;
};

Imba.TagManagerClass.prototype.remove = function (node,parent){
	if (node && node.mount) { return this._tryUnmounting = true };
};

Imba.TagManagerClass.prototype.changes = function (){
	return this._tryMounting || this._tryUnmounting;
};

Imba.TagManagerClass.prototype.mount = function (node){
	return;
};

Imba.TagManagerClass.prototype.refresh = function (force){
	if(force === undefined) force = false;
	if (true) { return };
	if (!force && this.changes() === false) { return };
	// console.time('resolveMounts')
	if ((this._tryMounting && this._mountables > this._mounted.length) || force) {
		this.tryMount();
	};
	
	if ((this._tryUnmounting || force) && this._mounted.length) {
		this.tryUnmount();
	};
	// console.timeEnd('resolveMounts')
	
	return this;
};

Imba.TagManagerClass.prototype.unmount = function (node){
	return this;
};

Imba.TagManagerClass.prototype.regMountable = function (node){
	if (!(node.FLAGS & Imba.TAG_MOUNTABLE)) {
		node.FLAGS |= Imba.TAG_MOUNTABLE;
		return this._mountables++;
	};
};


Imba.TagManagerClass.prototype.tryMount = function (){
	this._tryMounting = false; // Ensure new unmount Requests are processed on next refresh
	var count = 0;
	var root = document.body;
	var items = root.querySelectorAll('.__mount');
	// what if we end up creating additional mountables by mounting?
	for (var i = 0, ary = iter$(items), len = ary.length, el; i < len; i++) {
		el = ary[i];
		if (el && el._tag) {
			if (this._mounted.indexOf(el._tag) == -1) {
				this.mountNode(el._tag);
			};
		};
	};
	return this;
};

Imba.TagManagerClass.prototype.mountNode = function (node){
	if (this._mounted.indexOf(node) == -1) {
		this.regMountable(node);
		this._mounted.push(node);
		
		node.FLAGS |= Imba.TAG_MOUNTED;
		if (node.mount) { node.mount() };
		// Mark all parents as mountable for faster unmount
		// let el = node.dom:parentNode
		// while el and el.@tag and !el.@tag:mount and !(el.@tag.FLAGS & Imba.TAG_MOUNTABLE)
		// 	el.@tag.FLAGS |= Imba.TAG_MOUNTABLE
		// 	el = el:parentNode
	};
	return;
};

Imba.TagManagerClass.prototype.tryUnmount = function (){
	this._tryUnmounting = false; // Ensure new unmount Requests are processed on next refresh
	this._unmounting++;
	
	var unmount = [];
	var root = document.body;
	for (var i = 0, items = iter$(this._mounted), len = items.length, item; i < len; i++) {
		item = items[i];
		if (!item) { continue; };
		if (!document.documentElement.contains(item._dom)) {
			unmount.push(item);
			this._mounted[i] = null;
		};
	};
	
	this._unmounting--;
	
	if (unmount.length) {
		this._mounted = this._mounted.filter(function(item) { return item && unmount.indexOf(item) == -1; });
		for (var j = 0, len_ = unmount.length, item1; j < len_; j++) {
			item1 = unmount[j];
			item1.FLAGS = item1.FLAGS & ~Imba.TAG_MOUNTED;
			if (item1.unmount && item1._dom) {
				item1.unmount();
			} else if (item1._scheduler) {
				item1.unschedule();
			};
		};
	};
	return this;
};
