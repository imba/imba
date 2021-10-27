var bool = false

tag app-root
	# the default value of label will be inherited
	# from the closest parent that has a label property

	def render
		<self> <shadow-root>
			<style> 'span {color: red;}'
			<span> "Hello there"
			<input bind=bool type='checkbox'>
			if bool
				<span> "Is checked!"
			<p> "Paragraph here"

let app = <app-root>
imba.mount app

test do
	ok app.shadowRoot isa ShadowRoot
	ok app.shadowRoot.children[0] isa HTMLStyleElement