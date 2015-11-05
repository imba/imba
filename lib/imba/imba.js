(function(){
	// externs;
	
	if (typeof window !== 'undefined') {
		global = window;
	};
	
	/*
	Imba is the namespace for all runtime related utilities
	@namespace
	*/
	
	Imba = {
		VERSION: '0.13.9'
	};
	
	var reg = /-./g;
	
	/*
	True if running in client environment.
	@return {bool}
	*/
	
	Imba.isClient = function (){
		return Imba.CLIENT === true;
	};
	
	/*
	True if running in server environment.
	@return {bool}
	*/
	
	Imba.isServer = function (){
		return Imba.SERVER === true;
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
	
	return Imba.indexOf = function (a,b){
		return (b && b.indexOf) ? (b.indexOf(a)) : ([].indexOf.call(a,b));
	};

})()