function iter$(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; };
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
	
	async handleEvent(event){
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
		
		for (let val, j = 0, keys = Object.keys(mods), l = keys.length, handler; j < l; j++){
			// let handler = part
			handler = keys[j];val = mods[handler];if (handler.indexOf('~') > 0) {
				handler = handler.split('~')[0];
			};
			
			let args = [event,this];
			let res = undefined;
			let context = null;
			
			// parse the arguments
			if (val instanceof Array) {
				args = val.slice();
				
				for (let i = 0, items = iter$(args), len = items.length, par; i < len; i++) {
					// what about fully nested arrays and objects?
					// ought to redirect this
					par = items[i];
					if (typeof par == 'string' && par[0] == '~' && par[1] == '$') {
						let name = par.slice(2);
						let target = event;
						
						if (name[0] == '$') {
							target = target.detail;
							name = name.slice(1);
						};
						
						if (name == 'el' && target == event) {
							args[i] = element;
						} else if (name == 'value' && target == event) {
							args[i] = state.value;
						} else if (name == '') {
							args[i] = target;
						} else {
							args[i] = target ? target[name] : null;
						};
					};
				};
			};
			
			// console.log "handle part",i,handler,event.currentTarget
			// check if it is an array?
			if (handler == 'stop') {
				event.stopImmediatePropagation();
			} else if (handler == 'prevent') {
				event.preventDefault();
			} else if (handler == 'ctrl') {
				if (!event.ctrlKey) { break; };
			} else if (handler == 'commit') {
				commit = true;
			} else if (handler == 'silence') {
				commit = false;
			} else if (handler == 'alt') {
				if (!event.altKey) { break; };
			} else if (handler == 'shift') {
				if (!event.shiftKey) { break; };
			} else if (handler == 'meta') {
				if (!event.metaKey) { break; };
			} else if (handler == 'self') {
				if (target != element) { break; };
			} else if (handler == 'once') {
				// clean up bound data as well
				element.removeEventListener(event.type,this);
			} else if (keyCodes[handler]) {
				if (keyCodes[handler].indexOf(event.keyCode) < 0) {
					break;
				};
			} else if (handler == 'trigger') {
				let name = args[0];
				let detail = args[1]; // is custom event if not?
				let e = true && new CustomEvent(name,{bubbles: true,detail: detail});
				e.originalEvent = event;
				let customRes = element.dispatchEvent(e);
			} else if (typeof handler == 'string') {
				let mod = handler + '$mod';
				
				if (event[mod] instanceof Function) {
					// console.log "found modifier!",mod
					handler = mod;
					context = event;
					args = [state,args];
				} else if (handler[0] == '_') {
					
					handler = handler.slice(1);
					context = this.closure;
				} else {
					context = this.getHandlerForMethod(element,handler);
				};
			};
			
			
			if (context) {
				res = context[handler].apply(context,args);
			} else if (handler instanceof Function) {
				res = handler.apply(element,args);
			};
			
			if (res && (res.then instanceof Function)) {
				if (commit) { imba.commit() };
				awaited = true;
				// TODO what if await fails?
				res = await res;
			};
			
			if (res === false) {
				break;
			};
			
			state.value = res;
		};
		
		if (commit) { imba.commit() };
		this.currentEvents.delete(event);
		if (this.currentEvents.size == 0) {
			this.emit('idle');
		};
		// what if the result is a promise
		return;
	}
};
