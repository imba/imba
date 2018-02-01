var Imba = require("../imba")

require './manager'

Imba.TagManager = Imba.TagManagerClass.new

require './tag'
require './html'
require './svg'
require './pointer'
require './touch'
require './event'
require './event-manager'

if $web$
	require './reconciler'

if $node$
	require './server'