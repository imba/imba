function LoopFragment(parent,slot){
	this.parent = parent;
	this.slot = slot;
	this.array = [];
	this.prev = [];
	this.index = 0;
	this.taglen = 0;
	this.map = {};
};

exports.LoopFragment = LoopFragment; // export class 
LoopFragment.prototype.reset = function (){
	this.index = 0;
	var curr = this.array;
	this.array = this.prev;
	this.prev = curr;
	this.prev.taglen = this.taglen;
	this.index = 0;
	
	return this;
};

LoopFragment.prototype.$iter = function (){
	return this.reset();
};

LoopFragment.prototype.prune = function (items){
	return this;
};

LoopFragment.prototype.push = function (item){
	let prev = this.prev[this.index];
	this.array[this.index] = item;
	this.index++;
	return;
};

Object.defineProperty(LoopFragment.prototype,'length',{get: function(){
	return this.taglen;
}, configurable: true});
