
tag app-root
	def render
		<self>
			<div>
				<input$name value="john">
				<button$action :click.{$name.value="jane"}> "Change"
				<button$other-button :click.{$name.value="jean"}> "Change"

var app = <app-root>
app.render()
imba.mount(app)

test "refence works" do
	eq app.$name.value, "john"
	app.$action.click!
	eq app.$name.value, "jane"
	app.$other-button.click!
	eq app.$name.value, "jean"