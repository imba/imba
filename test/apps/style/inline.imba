tag app-root
	
	css button = layout: abs
		&:focus = layout: rel

	def render
		<self>
			<p$a.(font-weight: 600)> "1"
			<p$b.(layout: block rel)> "2"
			<input$input .(fw: 400 fw.focus: 600)>
			<button$button>


imba.mount(var app = <app-root>)

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
	app.$input.focus()
	eq style(app.$input).fontWeight, '600'

test 'button position' do
	eq style(app.$button).position, 'absolute'
	app.$button.focus()
	eq style(app.$button).position, 'relative'
	
	
	