(function(){
	require('./imba');
	
	Imba.SERVER = true;
	
	require('./core.events');
	require('./tag');
	require('./dom');
	require('./dom.html');
	require('./dom.server');
	// should include dom.static for server as well
	return require('./selector');

})()