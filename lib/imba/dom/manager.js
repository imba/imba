(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	Imba.TagManagerClass = function TagManagerClass(){
		this._spawns = 0;
		this._inserts = 0;
		this._removes = 0;
		this._mountable = [];
		this._mounted = [];
	};
	
	Imba.TagManagerClass.prototype.inserts = function(v){ return this._inserts; }
	Imba.TagManagerClass.prototype.setInserts = function(v){ this._inserts = v; return this; };
	Imba.TagManagerClass.prototype.spawns = function(v){ return this._spawns; }
	Imba.TagManagerClass.prototype.setSpawns = function(v){ this._spawns = v; return this; };
	Imba.TagManagerClass.prototype.removes = function(v){ return this._removes; }
	Imba.TagManagerClass.prototype.setRemoves = function(v){ this._removes = v; return this; };
	Imba.TagManagerClass.prototype.mountable = function(v){ return this._mountable; }
	Imba.TagManagerClass.prototype.setMountable = function(v){ this._mountable = v; return this; };
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
	
	Imba.TagManagerClass.prototype.mount = function (node){
		if (!ENV_WEB) { return };
		// is this happening inside the runloop?
		if (this._mountable.indexOf(node) < 0) {
			node._mounted = 2;
			return this._mountable.push(node);
		};
	};
	
	Imba.TagManagerClass.prototype.refresh = function (){
		if (!ENV_WEB) { return };
		
		if (this._inserts && this._mountable.length) {
			this.tryMount();
		};
		
		if (this._removes && this._mounted.length) {
			this.tryUnmount();
		};
		
		this._inserts = 0;
		this._removes = 0;
		return this;
	};
	
	Imba.TagManagerClass.prototype.unmount = function (node){
		return this;
	};
	
	Imba.TagManagerClass.prototype.tryMount = function (){
		var count = 0;
		
		for (var i = 0, ary = iter$(this._mountable), len = ary.length, item; i < len; i++) {
			item = ary[i];
			if (item && document.body.contains(item._dom)) {
				this._mounted.push(item);
				item._mounted = 1;
				item.mount();
				this._mountable[i] = null;
				count++;
			};
		};
		
		if (count) {
			this._mountable = this._mountable.filter(function(item) { return item; });
		};
		
		return this;
	};
	
	Imba.TagManagerClass.prototype.tryUnmount = function (){
		var count = 0;
		var root = document.body;
		for (var i = 0, ary = iter$(this._mounted), len = ary.length, item; i < len; i++) {
			item = ary[i];
			if (!document.contains(item.dom())) {
				item._mounted = 0;
				if (item.unmount) {
					item.unmount();
				} else if (item._scheduler) {
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
	return Imba.TagManagerClass;

})();