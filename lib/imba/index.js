
if (typeof Imba !== 'undefined') {
	console.warn(("Imba v" + (Imba.VERSION) + " is already loaded."));
	module.exports = Imba;
} else {
	var imba = require('./imba');
	module.exports = imba;
	
	
	require('./scheduler');
	require('./dom/index');
	
	
	
	
	require('../../register.js');
	
	
};
