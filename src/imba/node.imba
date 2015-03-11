`

log$ = function(){ console.log.apply(console,arguments); return this; };
splat$ = iter$ = function(a) { return a.toArray ? a.toArray() : a; }

// Local 
var Class = function(){}


Class.log = Class.prototype.log = log$;
Class.metaclass = Object.create({});
Class.prototype.p = log$

imba$baseclass = Class;

BaseClass = Class;

// imba$require = function (path,module){
// 	console.log('imba$require');
// 	return module.require(path);
// }

imba$class = function(obj,sup){
	var name = obj.name;
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

// Creating a new tag-type -- not here - we have a separate library for this
imba$tag = function(c,sup){
	c.prototype = Object.create((sup || Class).prototype)
	c.prototype.constructor = c;
	c.super = sup;
	return c;
}

union$ = function(a,b){
	if(a && a.__union) return a.__union(b);

	var u = a.slice(0);
	for(var i=0,l=b.length;i<l;i++) if(u.indexOf(b[i]) == -1) u.push(b[i]);
	return u;
}

intersect$ = function(a,b){
	if(a && a.__intersect) return a.__intersect(b);
	var res = [];
	for(var i=0, l=a.length; i<l; i++) {
		var v = a[i];
		if(b.indexOf(v) != -1) res.push(v);
	}
	return res;
}

idx$ = function(a,b){
	if(b && b.indexOf) return b.indexOf(a);
	return [].indexOf.call(a,b);
}

`