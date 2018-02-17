
var categories = [
	{name: "Books"}
	{name: "Movies"}
	{name: "Games"}
	{name: "Experiences"}
]

var store = {
	name: "Bindings"
	title: "Blank"
	subtitle: "Subtitle"
	picked: "Two"
	selected: "B"
	completed: yes
	price: 299
	quantity: 2
	numbers: [2,3]
	labels: []
	multiple: []
	counter: 0
	description: "No description"
	choice: null
	categories: [],
	mainCategory: null

	choices:
		one: {title: "One"}
		two: {title: "Two"}
	
	callSomething: do console.log "callSomething"
}

var update = do
	store:picked = "One"
	store:title = "New title"
	store:multiple = ["C"]
	store:subtitle = "Subtitle"
	store:name = "Unbound"
	
module api
	prop counter
	
	@counter = 1
	
	def add
		console.log "added!"

tag App
	prop counter default: 0
	
	def render
		<self>
			<form>
				<input[store:title] type='text' :keydown.esc=store:callSomething :keydown.del=store:callSomething>
				<input[store:name] type='text'>
				<input[store:subtitle] type='text' lazy=yes>
				<input[store:price] type='text'>
				
				<div>
					<input[store:price] type='range' min=0 max=1000 step=1>
					<input[counter] type='range' min=0 max=1000 step=1>
					<input[@counter] type='range' min=0 max=1000 step=1 lazy=true>

				<select[store:selected]>
					<option disabled=yes value=""> "Please select one"
					<option> "A"
					<option> "B"
					<option> "C"
				<button type='button' :tap=update> "Update"
				
				<select value="B">
					<option disabled=yes value=""> "Please select one"
					<option> "A"
					<option> "B"
					<option> "C"
					
				<select[store:multiple] multiple=yes>
					<option disabled=yes value=""> "Please select one"
					<option> "A"
					<option> "B"
					<option> "C"
					
				<select[store:quantity]>
					<option value=1> "1"
					<option value=2> "2"
					<option value=3> "3"
					<option value=4> "4"
					<option value=5> "5"
					
				<select[data:numbers] multiple=yes>
					<option value=1> "1"
					<option value=2> "2"
					<option value=3> "3"
					<option value=4> "4"
					<option value=5> "5"
				
				<div>
					<label>
						<input[data:completed] type='checkbox'>
						<span> "Completed"
						
				<div>
					<label>
						<input[data:picked] type="radio" value="One">
						<span> "One"
					<label>
						<input[data:picked] type="radio" value="Two">
						<span> "Two"
					<div> "Picked: {data:picked}"
					
				<div>
					<h2> "Rich radios"
					<label>
						<input[data:choice] type="radio" value=data:choices:one>
						<span> "One"
					<label>
						<input[data:choice] type="radio" value=data:choices:two>
						<span> "Two"
					<div> "Picked: {JSON.stringify(data:choice or null)}"

					
				<div>
					for item in [1,2,3,4,5]
						<label>
							<input[data:numbers] type='checkbox' value=item>
							<span> "{item}"
				<div>
					<label>
						<input[data:labels] type='checkbox' value="Beginner">
						<span> "Beginner"
					<label>
						<input[data:labels] type='checkbox' value="Intermediate">
						<span> "Intermediate"
					<label>
						<input[data:labels] type='checkbox' value="Expert">
						<span> "Expert"
					<label>
						<input[data:labels] type="checkbox" value=data:choices:one>
						<span> "Rich 1"
					<label>
						<input[data:labels] type="checkbox" value=data:choices:two>
						<span> "Rich 2"
						
				<div>
					for item in data:multiple
						<label>
							<input[data:multiple] type='checkbox' value=item>
							<span> item
					<p> "Remove by unchecking?"
					
				<div>
					<textarea[data:description] name="stuff">
					<textarea[data:description] name="other" lazy=yes>
					
				<div>
					<h2> "Select categories"
					<h3> "Main category"
					<select[data:mainCategory]>
						for item in categories
							<option value=item> item:name
					<select[data:categories] multiple=yes>
						for item in categories
							<option value=item> item:name
					for item in categories
						<label>
							<input[data:categories] type='checkbox' value=item>
							<span> item:name
			<section>
				<div> "Rendered {data:counter++} times"
				<div> "App.counter ({counter})"
				<h3> data:name
				<h1> data:title
				<h2> data:subtitle
				<p> data:description
				<div> "Is completed? {data:completed}"
				<div> JSON.stringify(store,null,2)

Imba.mount(APP = <App[store]>)
