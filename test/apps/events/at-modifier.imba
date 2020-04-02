
tag app-list
	def close
		console.info 'list-close'

tag app-item

tag app-root

	def open
		console.info 'root-open'

	def close
		console.info 'root-close'

	def render
		<self>
			<app-list>
				# this event will by default look for a method
				# named open starting at the element on which
				# the event is bound and traversing up the parents
				<app-item> <div :click.close> 'close?'
				### :click.close is essentially shorthand for:
				addEventListener('click') do
					let el = event.currentTarget
				  	while el and !el.close
				  		el = el.parentNode
					if el
						el.close()
				###

				# if no elements between the context and the event target
				# has an 'open' method, app-root.open will naturally be
				# called 
				<app-item> <div :click.open> 'open?'
				
				# Inlining
				<app-item> <div.at-close :click.{close!}> 'close?'


imba.mount <app-root>

var click = do |state,sel,expect|
	state.log = []
	await spec.click(sel,no)
	eq(state.log.join(','),expect)

test do
	# click will cascade from button.b to div.a
	await click($1,'.at-close','root-close')


