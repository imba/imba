(function(){


	// console.log("required imba!");
	
	require('./imba/imba');
	// require './imba/node'
	require('./imba/core.events');
	
	require('./imba/dom');
	require('./imba/dom.server');// hmm -- dont require events?
	// require './imba/dom.events' # hmm -- dont require events?
	require('./imba/selector');
	// should automatically require the stuff
	// yes


}())