def imba.mount mountable, into
	let parent = into or imba.document.body
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

# TBD
def imba.unmount node
	throw "Not implemented"
	yes
	
def imba.getElementById id
	imba.document.getElementById(id)

def imba.q$ query, ctx
	(ctx isa imba.dom.Element ? ctx : imba.document).querySelector(query)

def imba.q$$ query, ctx
	(ctx isa imba.dom.Element ? ctx : imba.document).querySelectorAll(query)
