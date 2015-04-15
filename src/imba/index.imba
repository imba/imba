extern window

# console.log("required imba/lib/imba/index")
require './imba'
require './core.events'
require './dom'

if typeof window === 'undefined'
	require './dom.server' # hmm -- dont require events?
else
	require './dom.events'
	require './dom.virtual'

require './selector'