let name = 'hello'

tag custom-field
	def render
		<self>
			<input[@value]>
			<p> "name is {@value}"

imba.mount(<custom-field bind:value=name>)