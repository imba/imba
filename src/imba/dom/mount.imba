import {renderContext} from './context'
import {scheduler} from '../scheduler'

export def mount mountable, into
	let parent = into or global.document.body
	let element = mountable
	if mountable isa Function
		let ctx = {_: parent}
		let tick = do
			renderContext.context = ctx
			mountable(ctx)
			# now remove the context?
		element = tick()
		scheduler.listen('render',tick)
	else
		# automatic scheduling of element - even before
		# element.__schedule = yes
		element.__F |= $EL_SCHEDULE$

	parent.appendChild(element)