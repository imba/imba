
const o = {}
tag App
	<self>
		<form$form> <input$inp name='text' type='text' value='one'>
		
test do
	let app = <App>
	let data = new FormData(app.$form)
	eq data.get('text'),'one'