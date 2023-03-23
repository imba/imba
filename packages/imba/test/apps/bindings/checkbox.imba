var state =
	bool: false
	status: null

var frameworks = []

tag example-app
	def render
		<self>
			<input.bool bind=state.bool type='checkbox'>
			<p> "Boolean is {state.bool}"

			#
			<input.value bind=state.status value='something' type='checkbox'>
			<p> "Status is {state.status}"

			# Multiple checkboxes, bound to the same Array
			<label>
				<input bind=frameworks type='checkbox' value='react'>
				<span> "React"
			<label>
				<input bind=frameworks type='checkbox' value='imba'>
				<span> "Imba"
			<label>
				<input bind=frameworks type='checkbox' value='vue'>
				<span> "Vue"
			<label>
				<input bind=frameworks type='checkbox' value='svelte'>
				<span> "Svelte"

			<p> "Selected frameworks: {frameworks.join(',')}"

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