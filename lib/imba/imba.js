(function(){
	// externs;
	
	if (typeof window !== 'undefined') {
		global = window;
	};
	
	Imba = {
		VERSION: '0.13.3'
	};
	
	var reg = /-./g;
	
	return Imba.toCamelCase = function (str){
		return str.replace(reg,function(m) { return m.charAt(1).toUpperCase(); });
	};

})()