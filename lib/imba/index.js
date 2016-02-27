(function(){
	
	if (typeof Imba === 'undefined') {
		require('./imba');
		require('./scheduler');
		return require('./dom/index');
	} else {
		return console.warn(("Imba v" + (Imba.VERSION) + " is already loaded"));
	};

})();