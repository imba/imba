function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
Imba.TagManagerClass = function TagManagerClass(){
	this._spawns = 0;
	this._inserts = 0;
	this._removes = 0;
	this._mounted = [];
	this._hasMountables = false;
	this;
};

Imba.TagManagerClass.prototype.inserts = function(v){ return this._inserts; }
Imba.TagManagerClass.prototype.setInserts = function(v){ this._inserts = v; return this; };
Imba.TagManagerClass.prototype.spawns = function(v){ return this._spawns; }
Imba.TagManagerClass.prototype.setSpawns = function(v){ this._spawns = v; return this; };
Imba.TagManagerClass.prototype.removes = function(v){ return this._removes; }
Imba.TagManagerClass.prototype.setRemoves = function(v){ this._removes = v; return this; };
Imba.TagManagerClass.prototype.mounted = function(v){ return this._mounted; }
Imba.TagManagerClass.prototype.setMounted = function(v){ this._mounted = v; return this; };

Imba.TagManagerClass.prototype.insert = function (node,parent){
	this._inserts++;
	return;
};

Imba.TagManagerClass.prototype.remove = function (node,parent){
	this._removes++;
	return;
};

Imba.TagManagerClass.prototype.changes = function (){
	return this._inserts + this._removes;
};

Imba.TagManagerClass.prototype.mount = function (node){
	return;
	return this._hasMountables = true;
};

Imba.TagManagerClass.prototype.refresh = function (force){
	if(force === undefined) force = false;
	return;
	// console.time('resolveMounts')
	if (this._inserts && this._hasMountables) {
		this.tryMount();
	};
	
	if ((this._removes || force) && this._mounted.length) {
		this.tryUnmount();
	};
	// console.timeEnd('resolveMounts')
	this._inserts = 0;
	this._removes = 0;
	return this;
};

Imba.TagManagerClass.prototype.unmount = function (node){
	return this;
};

Imba.TagManagerClass.prototype.tryMount = function (){
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
	this._mounted.push(node);
	node.FLAGS |= Imba.TAG_MOUNTED;
	if (node.mount) { node.mount() };
	return;
};

Imba.TagManagerClass.prototype.tryUnmount = function (){
	var count = 0;
	var root = document.body;
	for (var i = 0, ary = iter$(this._mounted), len = ary.length, item; i < len; i++) {
		item = ary[i];
		if (!document.documentElement.contains(item._dom)) {
			item.FLAGS = item.FLAGS & ~Imba.TAG_MOUNTED;
			if (item.unmount && item._dom) {
				item.unmount();
			} else if (item._scheduler) {
				// MAYBE FIX THIS?
				item.unschedule();
			};
			this._mounted[i] = null;
			count++;
		};
	};
	
	if (count) {
		this._mounted = this._mounted.filter(function(item) { return item; });
	};
	return this;
};
