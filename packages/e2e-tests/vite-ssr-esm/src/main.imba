export default tag App
	count = 0
	def mount
		count++

	def hydrate
		innerHTML = ''
		schedule!
		imba.commit!
	def render
		<self>
			<button[c:green] @click.log("st")=(count++)> "Hello {count} times"
