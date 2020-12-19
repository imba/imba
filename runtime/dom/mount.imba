export def mount mountable, into
	let parent = into or document.body
	let element = mountable
	if mountable isa Function
		let ctx = {_: parent}
		let tick = do
			imba.ctx = ctx
			mountable(ctx)
		element = tick()
		imba.scheduler.listen('render',tick)
	else
		# automatic scheduling of element - even before
		# element.__schedule = yes
		element.__F |= $EL_SCHEDULE$

	parent.appendChild(element)