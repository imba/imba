(function(){
	var isClient = (typeof window == 'object' && this == window);
	
	if (isClient) {
		// should not go there
		window.global || (window.global = window);
	};
	
	/*
	Imba is the namespace for all runtime related utilities
	@namespace
	*/
	
	Imba = {
		VERSION: '0.14.3',
		CLIENT: isClient,
		SERVER: !isClient,
		DEBUG: false
	};
	
	var reg = /-./g;
	
	/*
	True if running in client environment.
	@return {bool}
	*/
	
	Imba.isClient = function (){
		return Imba.CLIENT == true;
	};
	
	/*
	True if running in server environment.
	@return {bool}
	*/
	
	Imba.isServer = function (){
		return Imba.SERVER == true;
	};
	
	Imba.subclass = function (obj,sup){
		;
		for (var k in sup){
			if (sup.hasOwnProperty(k)) { obj[k] = sup[k] };
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
		return o ? ((o.toArray ? (o.toArray()) : (o))) : ([]);
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
			return Promise.all(value);
		} else if (value && value.then) {
			return value;
		} else {
			return Promise.resolve(value);
		};
	};
	
	Imba.toCamelCase = function (str){
		return str.replace(reg,function(m) { return m.charAt(1).toUpperCase(); });
	};
	
	Imba.toCamelCase = function (str){
		return str.replace(reg,function(m) { return m.charAt(1).toUpperCase(); });
	};
	
	Imba.indexOf = function (a,b){
		return (b && b.indexOf) ? (b.indexOf(a)) : ([].indexOf.call(a,b));
	};
	
	Imba.prop = function (scope,name,opts){
		if (scope.defineProperty) {
			return scope.defineProperty(name,opts);
		};
		return;
	};
	
	return Imba.attr = function (scope,name,opts){
		if (scope.defineAttribute) {
			return scope.defineAttribute(name,opts);
		};
		
		var getName = Imba.toCamelCase(name);
		var setName = Imba.toCamelCase('set-' + name);
		
		scope.prototype[getName] = function() {
			return this.getAttribute(name);
		};
		
		scope.prototype[setName] = function(value) {
			this.setAttribute(name,value);
			return this;
		};
		
		return;
	};

})()