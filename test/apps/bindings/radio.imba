
var framework = 'imba'

tag example-app
	def render
		<self>
			<label>
				<input[framework].r1 type='radio' value='react'>
				<span> "React"
			<label>
				<input[framework].r2 type='radio' value='imba'>
				<span> "Imba"
			<label>
				<input[framework].r3 type='radio' value='vue'>
				<span> "Vue"
			<label>
				<input[framework].r4 type='radio' value='svelte'>
				<span> "Svelte"

			# A regular text field bound to the same value
			<input[framework]>

			<p> "Selected framework: {framework}"

imba.mount(<example-app>)

test do
	await spec.click('[value=imba]')
	eq framework, 'imba'
	await spec.click('[value=react]')
	eq framework, 'react'