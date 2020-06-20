var state =
	bool: false
	status: null
	labels: []

var frameworks = []

css button color:blue
css button.checked color:red

tag example-app
	def render
		<self>
			<button.b1 bind=state.status value='one'> 'one'
			<button.b2 bind=state.status value='two'> 'two'
			<button @click> "yes"
			<p> "Status is {state.status}"
			<h2> "labels"
			<button.b3 bind=state.labels value='one'> 'one'
			<button.b4 bind=state.labels value='two'> 'two'
			<button.b5 bind=state.labels value='three'> 'three'
			<button.b4 bind=state.labels value='two'> 'two'
			<p> "Labels {state.labels.join(',')}"
imba.mount(<example-app>)

test 'bool' do
	await spec.click('.b1')
	eq state.status, 'one'
	await spec.click('.b2')
	eq state.status, 'two'
