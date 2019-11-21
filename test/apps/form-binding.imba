var state = {
	name: ""
	number: 1
	features: {}
}

tag app-root < component
	def render
		<self>
			<div>
				<input[state.name].text type='text'>
				<input[state.number] type='range' min=0 max=10 step=1>
			<div> "Your name is {state.name}"

var app = <app-root[state]>

document.body.appendChild(app)