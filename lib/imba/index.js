
if (typeof Imba !== 'undefined') {
	console.warn(("Imba v" + (Imba.VERSION) + " is already loaded."));
} else {
	require('./imba');
	
	
	require('./scheduler');
	require('./dom/index');
	
	
	
	
	require('../../register.js');
	
	
};
