(function(){
	// externs;
	
	if (typeof window !== 'undefined') {
		global = window;
	};
	
	Imba = {
		VERSION: '0.13.7'
	};
	
	var reg = /-./g;
	
	
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
	
	Imba.await = function (o){
		if (this.a() instanceof Array) {
			return Promise.all(this.a());
		} else if (this.a() && this.a().then) {
			return this.a();
		} else {
			return Promise.resolve(this.a());
		};
	};
	
	Imba.toCamelCase = function (str){
		return str.replace(reg,function(m) { return m.charAt(1).toUpperCase(); });
	};
	
	return Imba.indexOf = function (a,b){
		return (b && b.indexOf) ? (b.indexOf(a)) : ([].indexOf.call(a,b));
	};

})()