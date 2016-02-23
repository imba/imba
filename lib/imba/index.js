(function(){
	
	if (typeof Imba === 'undefined') {
		require('./imba');
		require('./core.events');
		require('./scheduler');
		require('./tag');
		require('./dom');
		require('./dom.html');
		require('./dom.svg');
		
		if (Imba.SERVER) {
			require('./dom.server');
		};
		
		if (Imba.CLIENT) {
			require('./dom.client');
			require('./dom.events');
			require('./dom.static');
		};
		
		return require('./selector');
	} else {
		return console.warn(("Imba v" + (Imba.VERSION) + " is already loaded"));
	};

})();