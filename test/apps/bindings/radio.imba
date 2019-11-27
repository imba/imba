
var framework = 'imba'

tag example-app
	def render
		<self>
			<label>
				<input[framework] type='radio' value='react'>
				<span> "React"
			<label>
				<input[framework] type='radio' value='imba'>
				<span> "Imba"
			<label>
				<input[framework] type='radio' value='vue'>
				<span> "Vue"
			<label>
				<input[framework] type='radio' value='svelte'>
				<span> "Svelte"

			# A regular text field bound to the same value
			<input[framework]>

			<p> "Selected framework: {framework}"

imba.mount(<example-app>)

test 'bool' do
	await spec.click('.bool')
	eq state.bool, true
	await spec.click('.bool')
	eq state.bool, false


test 'with value' do
	await spec.click('[value=imba]')
	eq frameworks.join(','), 'imba'
	await spec.click('[value=react]')
	eq frameworks.join(','), 'imba,react'
	await spec.click('[value=imba]')
	eq frameworks.join(','), 'react'