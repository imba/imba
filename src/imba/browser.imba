
if typeof Imba === 'undefined'
	require './imba'
	
	Imba.CLIENT = yes

	require './core.events'
	require './scheduler'
	require './tag'
	require './dom'
	require './dom.client'
	require './dom.html'
	require './dom.legacy'
	require './dom.events'
	require './dom.static'
	require './selector'