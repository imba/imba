# imba$imbaPath=global
import './common/imba'
if $node$
	import './common/ssr'
	import './common/server'
	yes

if $web$
	import './common/browser'
	yes


import './common/utils'
import './common/scheduler'
import './common/styles'

import './dom/node'
import './dom/comment'
import './dom/element'
import './dom/shadow'
import './dom/svg'
import './dom/fragment'
import './dom/context'
import './dom/component'
import './dom/flags'
import './dom/bind'
import './dom/event'
import './dom/asset'

# specific code for events etc
import './dom/events/pointer'
import './dom/events/intersect'
import './dom/events/resize'
import './dom/events/selection'

if $hmr$
	import './hmr'
	yes
