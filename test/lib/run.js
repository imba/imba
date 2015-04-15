(function(){


	// really?
	
	require('../../index');
	require('./spec');
	require('./syntax/loop');
	require('./syntax/assignment');
	require('./syntax/class');
	require('./syntax/super');
	require('./syntax/operators');
	require('./syntax/variables');
	require('./syntax/arrays');
	require('./syntax/catch');
	require('./syntax/functions');
	require('./syntax/return');
	require('./syntax/statements');
	require('./syntax/properties');
	require('./syntax/literals');
	require('./syntax/existense');
	require('./syntax/scope');
	require('./syntax/delete');
	require('./syntax/blockparam');
	require('./syntax/modules');
	require('./syntax/switch');
	
	require('./tags/define');
	
	
	SPEC.run();


}())