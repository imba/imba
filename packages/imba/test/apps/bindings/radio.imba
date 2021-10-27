
var framework = 'imba'

tag example-app
	def render
		<self>
			<label>
				<input.r1 bind=framework type='radio' value='react'>
				<span> "React"
			<label>
				<input.r2 bind=framework type='radio' value='imba'>
				<span> "Imba"
			<label>
				<input.r3 bind=framework type='radio' value='vue'>
				<span> "Vue"
			<label>
				<input.r4 bind=framework type='radio' value='svelte'>
				<span> "Svelte"

			# A regular text field bound to the same value
			<input bind=framework>

			<p> "Selected framework: {framework}"

imba.mount(<example-app>)

test do
	await spec.click('[value=imba]')
	eq framework, 'imba'
	await spec.click('[value=react]')
	eq framework, 'react'