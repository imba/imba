### css
select {
	width: 200px;
}
fieldset {
	margin: 4px;
	padding: 10px;
	border: 1px solid whitesmoke;
	background: white;
}

section {
	padding: 10px;
}
###

var rich = {a: 1, b: 2}

var categories = [
	{name: "Books"}
	{name: "Movies"}
	{name: "Games"}
	{name: "Experiences"}
]

var letters = ['A','B','C','D','E']

var state = {
	name: "Hello"
	number: 1
	features: {}
	bool: true
	category: 'none'
	letter: 'B'
	letters: ['C']
	labels: []
	multiple: []
	categories: []
	choices:
		one: {title: "One"}
		two: {title: "Two"}
}

tag checkbox-field

	def render
		<self> <input type='checkbox' bind:checked=@model[@key]>

tag app-root
	def render
		<self>
			<div>
				<input[state.name] type='text'>
				<input[state.number] type='number'>
				<input[state.number] type='range' min=0 max=10 step=1>
				<input[state.bool] type='checkbox'>
				<input[state.bool] type='checkbox' value=true>
				<input[state.bool] type='checkbox' value='two'>
				<input[state.bool] type='checkbox' value='three'>
				<input[state.bool] type='checkbox' richValue=rich>
				<input[state.number] type='range' min=0 max=10 step=1>
				<hr>
				<section>
					<h2> "Letter"

					<fieldset>
						<select[state.letter]>
							<option disabled=yes value=""> "Please select one"
							<option> "A"
							<option> "B"
							<option> "C"

					<fieldset>
						<select[state.letter]>
							for letter in letters
								<option> letter

					<fieldset> for letter in letters
						<div>
							<input[state.letter] type='radio' value=letter>
							<span> "Radio for {letter}"
				<section>
					<h2> "Letters"
					<fieldset>
						<select[state.letters] multiple=yes>
							for letter in letters
								<option> letter
					<fieldset>
						for letter in letters
							<div>
								<input[state.letters] type='checkbox' value=letter>
								<span> "Checkbox for {letter}"
				<section>
					<h2> "Categories"
					<fieldset>
						<select[state.categories] multiple=yes>
							for item in categories
								<option richValue=item> item.name
					<fieldset>
						for item in categories
							<div>
								<input[state.categories] type='checkbox' richValue=item>
								<span> "{item.name}"


				<div> "state"
				<pre> JSON.stringify(state,null,2)

				# <input[state.name] type='text'>
				# <input[state.number] type='range' min=0 max=10 step=1>
				# <input[state.bool] type='checkbox'>
				# <input[state.category] type='radio' value='one'>
				# <input[state.category] type='radio' value='two'>
				# <checkbox-field key='bool' bind:model=state>

				# <input type='checkbox' value='two' bind:checked=state.category>
				# <input type='checkbox' value='two' bind:checked=state.category>
				# <checkbox type='checkbox' value='two' bind:checked=state.category>


				# <input type='checkbox' bind:checked=state.bool>
				# <checkbox checked >
				# <radio>

				# <input type='checkbox' bind:checked=state.bool>
				# <input model.bind=state.number type='range' min=0 max=10 step=1>
				# <input type='text' model=state.name>
			<div> "Your name is {state.name}"

		console.log state

var app = <app-root[state]>

window.S = state
imba.mount(app)
# document.body.appendChild(app)

var def boundValueHandler e
	console.log "bound value handler!",e
	#value = @value


class ReactiveInput

	prop value get: 'getValue', set: 'setValue'
	
	def bind$ key, target
		let t = []
		Object.defineProperty(self,key,imba.createProxyProperty(t))

		if @nodeName == 'INPUT'
			let m = ReactiveInput.prototype
			# @addEventListener('input',m.oninput.bind(self),capture: yes)
			# @addEventListener('change',m.onchange.bind(self),capture: yes)
			@on$('input',['capture',m.oninput],this)
			@on$('change',['capture',m.onchange],this)
			# <self :input.capture.oninput :change.capture.onchange>
			# for own k,v of m
			# make bound
		return t
