
# require imba ( ensure local version )
require '../index'
require './spec'

require './syntax/loop'
require './syntax/class'
require './syntax/super'
require './syntax/operators'
require './syntax/variables'
require './syntax/arrays'
require './syntax/catch'
require './syntax/functions'
require './syntax/return'
require './syntax/statements'
require './syntax/properties'
require './syntax/literals'
require './syntax/existense'
require './syntax/scope'
require './syntax/delete'
require './syntax/blockparam'
require './syntax/modules'
require './syntax/switch'
require './syntax/assignment'
require './syntax/conditionals'
require './syntax/await'
require './syntax/tags'
require './syntax/formatting'
require './syntax/defs'
require './syntax/issues'
require './syntax/quirks'

require './tags/define'
require './tags/caching'
require './tags/attributes'
require './tags/svg'

if $web$
	require './tags/virtual'
	require './tags/html'
	require './tags/templates'
	require './tags/events'
	require './tags/mounting'
	
if $node$
	require './tags/escaping'

extern phantom

SPEC.run do |exitCode|
	if typeof phantom == 'object'
		phantom.exit(exitCode)
	elif typeof process == 'object' && process:exit
		process.exit(exitCode)
