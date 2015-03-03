function object$(){
	if(global.ImbaObject) return global.ImbaObject;
	global.ImbaObject = function ImbaObject(){ };
	ImbaObject.prototype = {};
	return ImbaObject;
}

function extend$(a,b){
	for (var k in b) { if (b.hasOwnProperty(key)) a[k] = b[k]; }
	return a;
}

function create$(obj,sup){
	if(sup) extend$(obj,sup);
	function ctor(){ this.initialize = this.constructor = obj; };
	obj.__super__ = ctor.prototype = sup.prototype;
	obj.prototype = new ctor();
	if(sup.inherited instanceof Function) sup.inherited(obj);
	return obj;
}

// __extends = function(child, parent) {
// 	for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
// 	function ctor() { this.constructor = child; }
// 	ctor.prototype = parent.prototype;
// 	child.prototype = new ctor();
// 	child.__super__ = parent.prototype;
// 	return child;
// };