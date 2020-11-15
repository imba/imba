import './core/imba'
if $node$
	import './core/server'
	yes

if $web$
	import './core/browser'
	yes

import './core/dom'
import './core/utils'
import './core/scheduler'
import './core/styles'

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
