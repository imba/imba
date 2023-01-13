tag ui-modal

	def setup
		self.role = "dialog"
		#promise = new Promise
			#resolver = $1

	def resolve value
		#resolver(value)
		imba.unmount self

	get promise
		unless opened
			opened = yes
			imba.mount self
		#promise

	def then ...params
		promise.then(...params)

	def body
		<div>
			<h2> msg or 'OK?'
			<ui-button.up @click=resolve(no)> 'cancel'
			<ui-button.up @click=resolve(yes)> 'ok'

	<self
		@hotkey('esc').force=resolve(no)
		@hotkey('*').global
		ease
	>
		css zi:9999 h:100vh pos:fixed inset:0 d:box bg:black/20 e:200ms
			@off o:0
			> d:vflex g:3 p:10 bg:black e:200ms eaf:back-out bxs:xl rd:2
				@off y:-50px

		<(body!)>
