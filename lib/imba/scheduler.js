function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba_, scheduled_;
var Imba = require("./imba");

var requestAnimationFrame; // very simple raf polyfill
var cancelAnimationFrame;

if (true) {
	cancelAnimationFrame = function(id) { return clearTimeout(id); };
	requestAnimationFrame = function(blk) { return setTimeout(blk,1000 / 60); };
};

if (false) {};

var scheduled = (scheduled_ = Imba.scheduled) || (Imba.scheduled = new Set());

function Ticker(){
	var self2 = this;
	self2.queue = [];
	self2.stage = -1;
	self2.batch = 0;
	self2.scheduled = false;
	self2.__ticker = function(e) {
		self2.scheduled = false;
		return self2.tick(e);
	};
	self2;
};

Ticker.prototype.add = function (item,force){
	if (force || this.queue.indexOf(item) == -1) {
		this.queue.push(item);
	};
	
	if (!this.scheduled) { return this.schedule() };
};

Object.defineProperty(Ticker.prototype,'promise',{get: function(){
	var self2 = this;
	return new Promise(function(resolve) { return self2.add(resolve); });
}, configurable: true});

Ticker.prototype.tick = function (timestamp){
	var self2 = this;
	var items = self2.queue;
	if (!self2.ts) { self2.ts = timestamp };
	self2.dt = timestamp - self2.ts;
	self2.ts = timestamp;
	self2.queue = [];
	self2.stage = 1;
	self2.before();
	self2.batch++;
	
	if (items.length) {
		for (let i = 0, ary = iter$(items), len = ary.length, item; i < len; i++) {
			item = ary[i];
			if (item == 'commit') {
				Imba.scheduled.forEach(function(item) {
					if (item.tick instanceof Function) {
						return item.tick(self2);
					} else if (item instanceof Function) {
						return item(self2);
					};
				});
			};
			if (item instanceof Function) {
				item(self2.dt,self2);
			} else if (item.tick) {
				item.tick(self2.dt,self2);
			};
		};
	};
	self2.stage = 2;
	self2.after();
	self2.stage = self2.scheduled ? 0 : (-1);
	return self2;
};

Ticker.prototype.schedule = function (){
	if (!this.scheduled) {
		this.scheduled = true;
		if (this.stage == -1) {
			this.stage = 0;
		};
		requestAnimationFrame(this.__ticker);
	};
	return this;
};

Ticker.prototype.before = function (){
	return this;
};

Ticker.prototype.after = function (){
	return this;
};

Imba.ticker = new Ticker();
Imba.SCHEDULERS = [];

Imba.requestAnimationFrame = function (callback){
	return requestAnimationFrame(callback);
};

Imba.cancelAnimationFrame = function (id){
	return cancelAnimationFrame(id);
};

// should add an Imba.run / setImmediate that
// pushes listener onto the tick-queue with times - once

Imba.commit = function (params){
	Imba.ticker.add('commit');
	return;
};
