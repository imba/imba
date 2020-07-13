tag App
	
	def render
		<self> <div> (null == undefined ? "{'yes'}" : "")

test do
	imba.mount let app = <App>
	ok app.textContent,"yes"