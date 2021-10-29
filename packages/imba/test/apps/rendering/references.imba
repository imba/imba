
describe "basic references" do
	
	tag App
		<self>
			<div>
				<input$name value="john">
				<button$action @click=($name.value="jane")> "Change"
				<button$other-button @click=($name.value="jean")> "Change"

	let app = imba.mount <App>
	
	test "refence works" do
		app.render!
		eq app.$name.value, "john"
		app.$action.click!
		eq app.$name.value, "jane"
		app.$other-button.click!
		eq app.$name.value, "jean"
		

describe "references before render" do
	tag Button
		prop target
		prop value
		
		<self @click=(target.value = value)> <slot>
	
	tag App
		bool = no
		<self>
			<div>
				<Button$jane target=$name value="jane"> "To jane"
				<Button$jean target=$name value="jean"> "To jean"
				<input$name value="john">
			if bool
				<input$other>

	let app = imba.mount <App>
	
	test "refence works" do
		# app.render!
		eq app.$name.value, "john"
		app.$jane.click!
		eq app.$name.value, "jane"
		app.$jean.click!
		eq app.$name.value, "jean"
		ok app.$other isa HTMLInputElement
		eq app.$other.parentNode, null
		eq app.$jean.textContent, "To jean"