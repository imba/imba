let name = 'hello'

tag app-root
	def render
		<self>
			<input[name]>
			<p> "name is {name}"

imba.mount(<app-root>)