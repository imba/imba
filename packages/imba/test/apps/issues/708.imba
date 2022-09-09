# SKIP

export default tag App
	count = 1
	def render
		console.log count
		<self>
			<button[c:green] @click.log("st")=(count++)> "Hello {count} times"

console.log String(<App>)