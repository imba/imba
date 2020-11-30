
def imba.mount mountable, into
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

# TBD
def imba.unmount node
	throw "Not implemented"
	yes

def imba.getElementById id
	document.getElementById(id)

def imba.q$ query, ctx
	(ctx isa window.Element ? ctx : document).querySelector(query)

def imba.q$$ query, ctx
	(ctx isa window.Element ? ctx : document).querySelectorAll(query)


###
Imba currently uses top-level functions like imba.createElement 
and imba.createComponent to build the nodes in a dom tree.

The plan is to formalize an interface for all methods used by
the dom builder that creates nodes through parent.createChild('type',...).
In addition to being slightly faster it will make it really easy
to create trees that are not backed by real dom elements.


class NodeInterface

	def #createChild type,key
		let el = document.createElement(type)
		el.#parent = self
		return self[key] = el

	def #insertChild item,itemkey,slotkey
		yes

	def #setContent item
		yes

	def #setText text
		textContent = text
		yes

	def ##setClasses string
		yes
###
	