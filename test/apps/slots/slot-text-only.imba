
tag checkbox-field
	def render
		<self>
			<input type='checkbox'>
			<slot>

tag app-root
	def render
		<self>
			<div> "This is the app"
			<checkbox-field.checkbox> 'Labeled'

imba.mount <app-root>

test do
	ok $$(.checkbox).textContent == 'Labeled'
	ok $$(.checkbox input).nextSibling isa Text