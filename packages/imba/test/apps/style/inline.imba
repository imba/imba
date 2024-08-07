tag App

	css button pos:absolute
		@focus pos:relative

	def render
		<self>
			<p$a[fw:600]> "1"
			<p$b[d:block pos:relative]> "2"
			<input$input[fw:400 fw@focus:600]>
			<button$button>

imba.mount(let app = <App>)

def style el
	if typeof el == 'string'
		el = document.querySelector(el)
	window.getComputedStyle(el)

test do
	eq style(app.$a).fontWeight, '600'

	eq style(app.$b).display, 'block'
	eq style(app.$b).position, 'relative'

test 'input focus' do
	eq style(app.$input).fontWeight, '400'
	# await new Promise do setTimeout($1,500ms)
	await app.$input.focus()
	document.body.offsetWidth
	eq document.visibilityState,'visible'
	eq style(app.$input).fontWeight, '600'

test 'button position' do
	eq style(app.$button).position, 'absolute'
	await app.$button.focus()
	eq style(app.$button).position, 'relative'
