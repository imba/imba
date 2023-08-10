global css html, body bg:black c:white

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
			<button[c:liloc6 bg:yellow4] @click.log("st")=(count++)>
				"Hello {count} times hello. Name: {import.meta.env.IMBA_MY_NAME}"

imba.mount <App>, document.getElementById "root" unless $node$
