import {renderContext} from './context'
import {scheduler} from '../scheduler'

export def render blk, ctx = {}
	let prev = renderContext.context
	renderContext.context = ctx
	let res = blk(ctx)
	if renderContext.context == ctx
		renderContext.context = prev
	return res

export def mount mountable, into
	let parent = into or global.document.body
	let element = mountable
	if mountable isa Function
		let ctx = {_: parent}
		let tick = do
			let prev = renderContext.context
			renderContext.context = ctx
			let res = mountable(ctx)
			if renderContext.context == ctx
				renderContext.context = prev
			return res
		element = tick()
		scheduler.listen('commit',tick)
	else
		# automatic scheduling of element - even before
		# element.__schedule = yes
		element.__F |= $EL_SCHEDULE$

	parent.appendChild(element)