import * as fui from '@floating-ui/dom'
import fzi from 'fzi'

let existing-menu = null

extend class Event

	def @select items, opts
		preventDefault!
		stopPropagation!

		# if there is an existing menu, close it
		existing-menu..select-menu.resolve(no)
		delete existing-menu..select-menu

		# if the same button was clicked
		# we don't want to mount a new menu, just exit
		if existing-menu is target
			existing-menu = null
			return

		existing-menu = target

		target.select-menu = new <ui-select anchor=target items=items value=target.data opts=opts>
		imba.mount target.select-menu

		if let res = await target.select-menu
			target.data = res

		# if two instances of this code are running at the same time
		# (because of the await), we only want to close the select menu
		# if it's the one that just resolved
		if target is existing-menu
			existing-menu = null

		delete target.select-menu

tag ui-select

	opts = { searchable:yes }
	selection-index = 0

	@observable query = ''

	@computed get hits
		selection-index = 0
		fzi.search(query,items,opts.cb)

	promise = new Promise do(res)
		resolve = do
			imba.unmount self
			res $1

	def then ...params
		promise.then(...params)

	def mount
		$search-bar..focus!
		move!

	def move
		let fuiOpts =
			placement: opts.pos ?? 'bottom'
			middleware: [
				fui.offset(opts.offset ?? 0)
				fui.flip!
				fui.shift!
			]
		{ x, y } = await fui.computePosition(anchor, self, fuiOpts)
		imba.commit!

	def selection-down
		selection-index = (selection-index + 1) % hits.length

	def selection-up
		selection-index = (selection-index - 1 + hits.length) % hits.length

	<self
		@hotkey('return').force.if(hits.length)=resolve(hits[selection-index])
		@hotkey('esc').force=resolve(no)
		@hotkey('tab').force=selection-down
		@hotkey('shift+tab').force=selection-up
		@hotkey('up')=selection-up
		@hotkey('down')=selection-down
		ease
	>
		css pos:abs w:max-content t:{y}px l:{x}px miw:165px py:1 m:2
			bg:black rd:2 c:white us:none of:hidden zi:10000
			bd:1px solid white/5
			@off o:0 y:-7px

		<global
			@resize=move
			@click.outside=resolve(no)
		>

		if opts.searchable
			<input$search-bar bind=query placeholder=placeholder>
				css ol:none caret-color:blue5 bg:inherit fs:3 p:1 2
					c:white bd:none bdb:1px solid white/5

		for item, index in hits
			<%select-item
				.active=(selection-index is index)
				@click=resolve(item)
				@pointerover=(selection-index = index)
			>
				css fs:3 p:1 2 tween:color 300ms
					@.active c:blue5 bg:white/7

				opts..cb(item) or item
