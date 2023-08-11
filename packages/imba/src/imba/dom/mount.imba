import {renderContext,RenderContext} from './context'
import {scheduler} from '../scheduler'

export def render blk, ctx = {}
	let prev = renderContext.context
	renderContext.context = ctx
	let res = blk(ctx)
	if renderContext.context == ctx
		renderContext.context = prev
	return res

export def mount mountable, into
	if $node$
		console.error "imba.mount not supported on server.\nTo spawn a dev-server for an imba client run:\n  > imba serve my-imba-file.imba"
		# if mountable isa Function
		return String(mountable)

	let parent = into or global.document.body
	let element = mountable
	if mountable isa Function
		let ctx = new RenderContext(parent,null)
		let tick = do
			let prev = renderContext.context
			renderContext.context = ctx
			let res = mountable(ctx)
			if renderContext.context == ctx
				renderContext.context = prev
			return res
		element = tick()
		# TODO Allow unscheduling this?
		scheduler.listen('commit',tick)
	else
		# automatic scheduling of element
		element.__F |= $EL_SCHEDULE$

	element.#insertInto(parent)
	return element

export def unmount el
	if el and el.#removeFrom
		el.#removeFrom(el.parentNode)
	return el

let instance = global.imba ||= {}
instance.mount = mount
instance.unmount = unmount