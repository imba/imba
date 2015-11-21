(function(){
	
	if (typeof Imba === 'undefined') {
		require('./imba');
		
		Imba.CLIENT = true;
		
		require('./core.events');
		require('./scheduler');
		require('./tag');
		require('./dom');
		require('./dom.client');
		require('./dom.html');
		require('./dom.svg');
		require('./dom.legacy');
		require('./dom.events');
		require('./dom.static');
		return require('./selector');
	};

})()