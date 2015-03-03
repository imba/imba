
// Local 
var Class = function(){}
Class.metaclass = Object.create({});
Class.prototype.p = function(){ console.log.apply(console,arguments); }
Class.p = function(){ console.log.apply(console,arguments); }

Class.log = Class.prototype.log = function(){
	// console.log.apply(console,arguments);
	Function.prototype.call.apply( console.log, arguments);
	return this;
}


imba$baseclass = Class;
BaseClass = Class;

global = this;

imba$require = function (path,module){
	return module.require(path);
}

Window.prototype.p = Class.prototype.p;

imba$class = function(obj,sup){
	sup = sup || Class;

	// Add static methods from parent
	for (var key in sup) {
		if (sup.hasOwnProperty(key)) obj[key] = sup[key];
	}

	obj.prototype = Object.create(sup.prototype)
	obj.metaclass = Object.create(sup.metaclass);
	// Add this to the superclass / metaclass?
	obj.prototype.constructor = obj;
	obj.prototype.initialize = obj;
	obj.prototype.__super = sup.prototype;
	obj.superclass = sup;

	// Now set the methods from superclass?
	return obj;
}

// Creating a new tag-type - not even used?
imba$tag = function(c,sup){
	c.prototype = Object.create((sup || Class).prototype)
	c.prototype.constructor = c;
	return c;
}

union$ = function(a,b){
	if(a && a.__union) return a.__union(b);

	// Add support for objects as well (merge) ?

	var res = a.slice(0);
	for(var i = 0, l=b.length; i < l; i++) {
		var v = b[i];
		if(res.indexOf(v) == -1) res.push(v);
	}
	return res;
}

intersect$ = function(a,b){
	if(a && a.__intersect) return a.__intersect(b);
	var res = [];
	for(var i = 0, l=a.length; i < l; i++) {
		var v = a[i];
		if(b.indexOf(v) != -1) res.push(v);
	}
	return res;
}

idx$ = function(a,b){
	if(b && b.indexOf) return b.indexOf(a);
	return [].indexOf.call(a,b);
}

iter$ = function(a) {
	if(a instanceof Array) return a;
	if(a.toArray) return a.toArray();
	// Splat should always return an array, be careful
	return a;
}

splat$ = function(a) {
	// Simply convert the value to an array
	if(a instanceof Array) return a;
	if(a.toArray) return a.toArray();
	// Splat should always return an array, be careful
	return a;
}
