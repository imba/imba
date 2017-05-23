(function(){
	
	if (typeof Imba !== 'undefined') {
		return console.warn(("Imba v" + (Imba.VERSION) + " is already loaded."));
	} else {
		require('./imba');
		
		
		require('./scheduler');
		require('./dom/index');
		
		
		
		
		return require('../../register.js');
		
		
	};

})();