function extend$(target,ext){
	var descriptors = Object.getOwnPropertyDescriptors(ext);
	Object.defineProperties(target.prototype,descriptors);
	// var keys = Object.keys(descriptors);
	// for(const key of keys){ let desc = descriptors[key]; }
	return target;
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

// only for web?
extend$(Event,{
	
	wait$mod(state,params){
		return new Promise(function(resolve) {
			return setTimeout(resolve,(((typeof params[0]=='number'||params[0] instanceof Number)) ? params[0] : 1000));
		});
	},
	
	sel$mod(state,params){
		return state.event.target.closest(params[0]) || false;
	},
	
	throttle$mod({handler,element,event},params){
		if (handler.throttled) { return false };
		handler.throttled = true;
		let name = params[0];
		if (!((typeof name=='string'||name instanceof String))) {
			name = ("in-" + (event.type || 'event'));
		};
		let cl = element.classList;
		cl.add(name);
		handler.once('idle',function() {
			cl.remove(name);
			return handler.throttled = false;
		});
		return true;
	},
});


// could cache similar event handlers with the same parts
export class EventHandler {
	constructor(params,closure){
		this.params = params;
		this.closure = closure;
	}
	
	getHandlerForMethod(el,name){
		if (!el) { return null };
		return el[name] ? el : this.getHandlerForMethod(el.parentNode,name);
	}
	
	emit(name,...params){
		return imba.emit(this,name,params);
	}
	on(name,...params){
		return imba.listen(this,name,...params);
	}
	once(name,...params){
		return imba.once(this,name,...params);
	}
	un(name,...params){
		return imba.unlisten(this,name,...params);
	}
	
	handleEvent(event){
		var target = event.target;
		var element = event.currentTarget;
		var mods = this.params;
		var i = 0;
		let commit = true; // @params.length == 0
		let awaited = false;
		let prevRes = undefined;
		
		// console.log 'handle event',event.type,@params
		this.currentEvents || (this.currentEvents = new Set());
		this.currentEvents.add(event);
		
		let state = {
			element: element,
			event: event,
			modifiers: mods,
			handler: this
		};
		
		let res = [];
		for (let val, j = 0, keys = Object.keys(mods), l = keys.length, handler; j < l; j++){
			
			
			handler = keys[j];val = mods[handler];let args = [event,this];
			let res = undefined;
			let context = null;
		};
		return res;
	}
};
