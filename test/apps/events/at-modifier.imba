
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

				# if no elements between the context and the event target
				# has an 'open' method, app-root.open will naturally be
				# called 
				<app-item> <div :click.open> 'open?'

				# Including @ before the event handler specifies that it
				# should explicitly call the close method in the current
				# self (which is the self in the current render method)
				<app-item> <div :click.@close> 'close?'


imba.mount <app-root>