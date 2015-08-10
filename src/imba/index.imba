extern window

require './imba'
require './core.events'
require './dom'

if typeof window === 'undefined'
	require './dom.server'
else
	require './dom.events'
	require './dom.static'

require './selector'