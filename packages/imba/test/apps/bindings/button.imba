import 'imba/test/spec'

const state =
	bool: false
	id: '1'
	status: null
	labels: []

const frameworks = []

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


tag App2
	
	<self>
		<button$bool bind=state.bool> "No-value {state.bool}"
		<button$yes bind=state.bool value=yes> "yes {state.bool}"
		<button$no bind=state.bool value=no> "no {state.bool}"
		<button$id1 bind=state.id value='1'> "id 1 {state.id}"
		<button$id2 bind=state.id value='2'> "id 2 {state.id}"

let app = imba.mount <App2>

test 'bool' do
	app.$bool.click!
	eq state.bool,yes
	app.$bool.click!
	eq state.bool,no