/*
Imba is the namespace for all runtime related utilities
@namespace
*/

var Imba = {VERSION: '1.3.0-beta.1'};

/*
True if running in client environment.
@return {bool}
*/

Imba.isClient = function (){
	return false;
};

/*
True if running in server environment.
@return {bool}
*/

Imba.isServer = function (){
	return true;
};

/*

Light wrapper around native setTimeout that expects the block / function
as last argument (instead of first). It also triggers an event to Imba
after the timeout to let schedulers update (to rerender etc) afterwards.

*/

Imba.setTimeout = function (delay,block){
	return setTimeout(function() {
		block();
		return Imba.commit();
	},delay);
};

/*

Light wrapper around native setInterval that expects the block / function
as last argument (instead of first). It also triggers an event to Imba
after every interval to let schedulers update (to rerender etc) afterwards.

*/

Imba.setInterval = function (interval,block){
	return setInterval(block,interval);
};

/*
Clear interval with specified id
*/

Imba.clearInterval = function (id){
	return clearInterval(id);
};

/*
Clear timeout with specified id
*/

Imba.clearTimeout = function (id){
	return clearTimeout(id);
};


Imba.subclass = function (obj,sup){
	for (var k in sup){
		var v;
		v = sup[k];if (sup.hasOwnProperty(k)) { obj[k] = v };
	};
	
	obj.prototype = Object.create(sup.prototype);
	obj.__super__ = obj.prototype.__super__ = sup.prototype;
	obj.prototype.initialize = obj.prototype.constructor = obj;
	return obj;
};

/*
Lightweight method for making an object iterable in imbas for/in loops.
If the compiler cannot say for certain that a target in a for loop is an
array, it will cache the iterable version before looping.

```imba
# this is the whole method
def Imba.iterable o
	return o ? (o:toArray ? o.toArray : o) : []

class CustomIterable
	def toArray
		[1,2,3]

# will return [2,4,6]
for x in CustomIterable.new
	x * 2

```
*/

Imba.iterable = function (o){
	return o ? ((o.toArray ? o.toArray() : o)) : [];
};

/*
Coerces a value into a promise. If value is array it will
call `Promise.all(value)`, or if it is not a promise it will
wrap the value in `Promise.resolve(value)`. Used for experimental
await syntax.
@return {Promise}
*/

Imba.await = function (value){
	if (value instanceof Array) {
		console.warn("await (Array) is deprecated - use await Promise.all(Array)");
		return Promise.all(value);
	} else if (value && value.then) {
		return value;
	} else {
		return Promise.resolve(value);
	};
};

var dashRegex = /-./g;

Imba.toCamelCase = function (str){
	if (str.indexOf('-') >= 0) {
		return str.replace(dashRegex,function(m) { return m.charAt(1).toUpperCase(); });
	} else {
		return str;
	};
};

Imba.indexOf = function (a,b){
	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
};

Imba.len = function (a){
	return a && ((a.len instanceof Function) ? a.len.call(a) : a.length) || 0;
};

Imba.prop = function (scope,name,opts){
	if (scope.defineProperty) {
		return scope.defineProperty(name,opts);
	};
	return;
};

Imba.attr = function (scope,name,opts){
	if(opts === undefined) opts = {};
	if (scope.defineAttribute) {
		return scope.defineAttribute(name,opts);
	};
	
	var getName = Imba.toCamelCase(name);
	var setName = Imba.toCamelCase('set-' + name);
	var proto = scope.prototype;
	
	if (opts.dom) {
		proto[getName] = function() { return this.dom()[name]; };
		proto[setName] = function(value) {
			if (value != this[name]()) {
				this.dom()[name] = value;
			};
			return this;
		};
	} else {
		proto[getName] = function() { return this.getAttribute(name); };
		proto[setName] = function(value) {
			this.setAttribute(name,value);
			return this;
		};
	};
	return;
};

Imba.propDidSet = function (object,property,val,prev){
	var fn = property.watch;
	if (fn instanceof Function) {
		fn.call(object,val,prev,property);
	} else if ((typeof fn=='string'||fn instanceof String) && object[fn]) {
		object[fn](val,prev,property);
	};
	return;
};


// Basic events
function emit__(event,args,node){
	// var node = cbs[event]
	var prev,cb,ret;
	
	while ((prev = node) && (node = node.next)){
		if (cb = node.listener) {
			if (node.path && cb[node.path]) {
				ret = args ? cb[node.path].apply(cb,args) : cb[node.path]();
			} else {
				// check if it is a method?
				ret = args ? cb.apply(node,args) : cb.call(node);
			};
		};
		
		if (node.times && --node.times <= 0) {
			prev.next = node.next;
			node.listener = null;
		};
	};
	return;
};

// method for registering a listener on object
Imba.listen = function (obj,event,listener,path){
	var cbs,list,tail;
	cbs = obj.__listeners__ || (obj.__listeners__ = {});
	list = cbs[event] || (cbs[event] = {});
	tail = list.tail || (list.tail = (list.next = {}));
	tail.listener = listener;
	tail.path = path;
	list.tail = tail.next = {};
	return tail;
};

// register a listener once
Imba.once = function (obj,event,listener){
	var tail = Imba.listen(obj,event,listener);
	tail.times = 1;
	return tail;
};

// remove a listener
Imba.unlisten = function (obj,event,cb,meth){
	var node,prev;
	var meta = obj.__listeners__;
	if (!meta) { return };
	
	if (node = meta[event]) {
		while ((prev = node) && (node = node.next)){
			if (node == cb || node.listener == cb) {
				prev.next = node.next;
				// check for correct path as well?
				node.listener = null;
				break;
			};
		};
	};
	return;
};

// emit event
Imba.emit = function (obj,event,params){
	var cb;
	if (cb = obj.__listeners__) {
		if (cb[event]) { emit__(event,params,cb[event]) };
		if (cb.all) { emit__(event,[event,params],cb.all) }; // and event != 'all'
	};
	return;
};

Imba.observeProperty = function (observer,key,trigger,target,prev){
	if (prev && typeof prev == 'object') {
		Imba.unlisten(prev,'all',observer,trigger);
	};
	if (target && typeof target == 'object') {
		Imba.listen(target,'all',observer,trigger);
	};
	return this;
};

module.exports = Imba;
