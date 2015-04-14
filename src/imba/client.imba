`
var Class = function(){}
// Are we sure we even need a baseclass at all?
// No need for the metaclass now
// Class.metaclass = Object.create({});
Class.log = Class.prototype.log = function(){
	var args = [console].concat([].slice.call(arguments));
	Function.prototype.call.apply( console.log, args);
	return this;
}

imba$baseclass = Class;
BaseClass = Class;

global = this;

imba$class = function(obj,sup,body){
	sup = sup || Class;

	// Add static methods from parent
	for (var key in sup) {
		if (sup.hasOwnProperty(key)) obj[key] = sup[key];
	}

	obj.prototype = Object.create(sup.prototype)
	// obj.metaclass = Object.create(sup.metaclass);
	// Add this to the superclass / metaclass?
	obj.prototype.constructor = obj;
	obj.prototype.initialize = obj;
	obj.prototype.__super = sup.prototype;
	obj.superclass = sup;

	if(body instanceof Function) body(obj,obj.prototype);
	return obj;
}

// Creating a new tag-type - not even used?
imba$tag = function(c,sup){
	c.prototype = Object.create((sup || Class).prototype)
	c.prototype.constructor = c;
	return c;
}

idx$ = function(a,b){
	if(b && b.indexOf) return b.indexOf(a);
	return [].indexOf.call(a,b);
}
`
