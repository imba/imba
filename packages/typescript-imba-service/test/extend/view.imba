
extend tag element
	get stuff
		123

tag app-view
	def mount
		stuff
		[SomeClass]

	<self>
		<app-button>
		<input$text type='text'>