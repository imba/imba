
if typeof Imba === 'undefined'
	require './imba'

	require './core.events'
	require './scheduler'
	require './tag'
	require './dom'
	require './dom.client'
	require './dom.html'
	require './dom.svg'
	require './dom.events'
	require './dom.static'
	require './selector'
else
	console.warn "Imba is already loaded"
