# imba$stdlib=1
import {renderContext,RenderContext} from './context'
import {scheduler} from '../scheduler'
import {Component} from './component'

import {emit,listen,once} from '../utils'

export def render blk, ctx = {}
	let prev = renderContext.context
	renderContext.context = ctx
	let res = blk(ctx)
	if renderContext.context == ctx
		renderContext.context = prev
	return res

export def mount mountable, into\Element?, o = {}
	if $node$
		console.error "imba.mount not supported on server.\nTo spawn a dev-server for an imba client run:\n  > imba serve my-imba-file.imba"
		# if mountable isa Function
		return String(mountable)

	let parent = into or global.document.body
	let element = mountable
	if mountable isa Function
		let fn = mountable
		# Allow getting hold of that render context?
	
		let tick = o.tick ||= do
			let ctx = o.context ||= new RenderContext(parent,null)
			let prev = renderContext.context
			renderContext.context = ctx

			let res = mountable(ctx,o)

			if renderContext.context == ctx
				renderContext.context = prev
			
			if o.node != res
				if o.node
					global.imba.unmount(o.node)

				if res
					(o.node = res).#insertInto(parent)
					if res.tick == Component.prototype.tick
						# Highly experimental
						res.tick = o.tick
						if res.scheduled?

					# if easing - this is not enough
					once(res,'unmount') do
						if o.node == res
							o.node = null
							# what if it is remounted?
							scheduler.unlisten('commit',o.tick)
				else
					o.node = res
					scheduler.unlisten('commit',o.tick)

			return res

		# element = tick()
		scheduler.listen('commit',tick)
		return tick()
	else
		# automatic scheduling of element
		element.__F |= $EL_SCHEDULE$

	element.#insertInto(parent)
	return element

export def unmount el
	if el and el.#removeFrom and el.parentNode
		el.#removeFrom(el.parentNode)
	return el

let instance = global.imba ||= {}
instance.mount = mount
instance.unmount = unmount