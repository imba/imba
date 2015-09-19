(function(){
	// externs;
	
	if (typeof window !== 'undefined') {
		global = window;
	};
	
	Imba = {};
	
	var reg = /-./g;
	
	Imba.toCamelCase = function (str){
		return str.replace(reg,function(m) { return m.charAt(1).toUpperCase(); });
	};

})()