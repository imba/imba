import './counter'
import './shared'

global css body bgc:cool8
global css @root $about:1

export default tag App
	count = 0
	def mount
		count++
		document.getElementById("dev_ssr_css")..remove()

	def hydrate
		innerHTML = ''
		schedule!
		imba.commit!
	def render
		<self>
			<button[c:green bg:yellow4] @click.log("st")=(count++)> "Hello {count} times hello"
			<my-count>