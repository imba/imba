tag hello-el < form
	def intercept
		self

	def render
		<self :submit.prevent.intercept>
			<header> 'This is the header'
			<slot>
			<footer> <slot name="footer">
				<button type='reset'> "Reset"
				<button type='submit'> "Submit"

tag app-root
	def render
		<self>
			<p> "Hello there!"
			<hello-el>
				<input type='text'>
			<hello-el>
				<input type='text'>
				<button.resubmit slot='footer'> "Resubmit"

imba.mount <app-root>

test do ok $(form)
test do ok $(form footer button.resubmit)