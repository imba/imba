
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
}

var update = do
	store:picked = "One"
	store:title = "New title"
	store:multiple = ["C"]
	store:subtitle = "Subtitle"
	store:name = "Unbound"

var app = Imba.mount <div[store].app ->
	<form>
		<input type='text' model='title'>
		<input type='text' model.trim='name'>
		<input type='text' model.lazy='subtitle'>
		<input type='text' model.number='price'>
		
		<div>
			<input type='range' min=0 max=1000 step=1 model.number.lazy='price'>
			<input type='range' min=0 max=1000 step=1 model.number='price'>

		<select model="selected">
			<option disabled=yes value=""> "Please select one"
			<option> "A"
			<option> "B"
			<option> "C"
			
		<select model="multiple" multiple=yes>
			<option disabled=yes value=""> "Please select one"
			<option> "A"
			<option> "B"
			<option> "C"
			
		<select model.number="quantity">
			<option> "1"
			<option> "2"
			<option> "3"
			<option> "4"
			<option> "5"
			
		<select model.number="numbers" multiple=yes>
			<option> "1"
			<option> "2"
			<option> "3"
			<option> "4"
			<option> "5"
		
		<div>
			<label>
				<input type='checkbox' model='completed'>
				<span> "Completed"
				
		<div>
			<label>
				<input type="radio" value="One" model="picked">
				<span> "One"
			<label>
				<input type="radio" value="Two" model="picked">
				<span> "Two"
			<div> "Picked: {data:picked}"
			
		<div>
			<h2> "Rich radios"
			<label>
				<input type="radio" value=data:choices:one model="choice">
				<span> "One"
			<label>
				<input type="radio" value=data:choices:two model="choice">
				<span> "Two"
			<div> "Picked: {JSON.stringify(data:choice or null)}"

			
		<div>
			for item in [1,2,3,4,5]
				<label>
					<input type='checkbox' value=item model.number='numbers'>
					<span> "{item}"
		<div>
			<label>
				<input type='checkbox' value="Beginner" model='labels'>
				<span> "Beginner"
			<label>
				<input type='checkbox' value="Intermediate" model='labels'>
				<span> "Intermediate"
			<label>
				<input type='checkbox' value="Expert" model='labels'>
				<span> "Expert"
			<label>
				<input type="checkbox" value=data:choices:one model="labels">
				<span> "Rich 1"
			<label>
				<input type="checkbox" value=data:choices:two model="labels">
				<span> "Rich 2"
				
		<div>
			for item in data:multiple
				<label>
					<input type='checkbox' value=item model='multiple'>
					<span> item
			<p> "Remove by unchecking?"
			
		<div>
			<textarea name="stuff" model="description">
			<textarea name="other" value=data:description>
			
		<div>
			<h2> "Select categories"
			<h3> "Main category"
			<select model='mainCategory'>
				for item in categories
					<option value=item> item:name
			<select model='categories' multiple=yes>
				for item in categories
					<option value=item> item:name
			for item in categories
				<label>
					<input type='checkbox' value=item model='categories'>
					<span> item:name
			
		<button type='button' :tap=update> "Update"
	<section>
		<div> "Rendered {data:counter++} times"
		<h3> data:name
		<h1> data:title
		<h2> data:subtitle
		<p> data:description
		<div> "Is completed? {data:completed}"
		<div> JSON.stringify(store)
