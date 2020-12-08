# imba$imbaPath=global
global class ImbaContext

	def constructor parent,state = {}
		#parent = parent
		#state = state
		self

	get state
		#state

	get version
		'2.0.0-alpha.100'

	get window
		#window or global.window

	get document
		#document or global.document

	get dom
		self.window

	get clearInterval
		global.clearInterval
	
	get clearTimeout
		global.clearTimeout

	def setTimeout fn,ms
		setTimeout(&,ms) do
			fn!
			commit!
			return

	def setInterval fn,ms
		setInterval(&,ms) do
			fn!
			commit!
			return

	def run cb
		cb()

	# imba$imbaPath=global
	def mount mountable, into
		let parent = into or document.body
		let element = mountable
		if mountable isa Function
			let ctx = {_: parent}
			let tick = do
				self.ctx = ctx
				mountable(ctx)
			element = tick()
			self.scheduler.listen('render',tick)
		else
			# automatic scheduling of element - even before
			# element.__schedule = yes
			element.__F |= $EL_SCHEDULE$

		parent.appendChild(element)

	# TBD
	def unmount node
		throw "Not implemented"
		yes

	def getElementById id
		document.getElementById(id)

	def q$ query, ctx
		(ctx isa window.Element ? ctx : document).querySelector(query)

	def q$$ query, ctx
		(ctx isa window.Element ? ctx : document).querySelectorAll(query)


global.imba = global.#imba = new ImbaContext