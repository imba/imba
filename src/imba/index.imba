
if typeof Imba === 'undefined'
	require './imba'
	require './scheduler'
	require './dom/index'
else
	console.warn "Imba v{Imba.VERSION} is already loaded"
