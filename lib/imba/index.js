(function(){
	
	if (typeof Imba !== 'undefined') {
		console.warn(("Imba v" + (Imba.VERSION) + " is already loaded"));
	};
	
	require('./imba');
	require('./scheduler');
	require('./dom/index');
	
	
		return require('../../register.js');
	

})();