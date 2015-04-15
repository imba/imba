(function(){


	function emit__(event,args,cbs){
		var node,prev,cb,ret;
		node = cbs[event];
		
		while((prev = node) && (node = node.next)){
			if(cb = node.callback) {
				ret = cb.apply(node,args);
			};
			
			if(node.times && --(node.times) <= 0) {
				prev.next = node.next;
				node.callback = null;
			};
		};
		return;
	};
	
	// method for registering a listener on object
	Imba.listen = function (obj,event,callback){
		var $1;
		var cbs,list,tail;
		cbs = obj.__callbacks__ || (obj.__callbacks__ = {});
		list = cbs[($1=event)] || (cbs[$1] = {});
		tail = list.tail || (list.tail = (list.next = {}));
		tail.callback = callback;
		list.tail = tail.next = {};
		return tail;
	};
	
	Imba.once = function (obj,event,callback){
		var tail = Imba.listen(obj,event,callback);
		tail.times = 1;
		return tail;
	};
	
	Imba.unlisten = function (obj,event,cb){
		var node,prev;
		var meta = obj.__callbacks__;
		if(!meta) {
			return;
		};
		
		if(node = meta[event]) {
			while((prev = node) && (node = node.next)){
				if(node == cb || node.callback == cb) {
					prev.next = node.next;
					node.callback = null;
					break;
				};
			};
		};
		return;
	};
	
	Imba.emit = function (obj,event,params){
		var cb = obj.__callbacks__;
		if(cb) {
			emit__(event,params,cb);
		};
		if(cb) {
			emit__('all',[event,params],cb);
		};
		return;
	};


}())