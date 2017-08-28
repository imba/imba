
if typeof Imba !== 'undefined'
	console.warn "Imba v{Imba.VERSION} is already loaded."
	module:exports = Imba
else
	var Imba = require './imba'
	module:exports = Imba

	unless $webworker$
		require './scheduler'
		require './dom/index'
		
	if $node$
		unless $webpack$
			require '../../register.js'
