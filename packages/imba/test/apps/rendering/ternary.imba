tag App

	def render
		<self> <div> (null == undefined ? "{'yes'}" : "")

test do
	imba.mount let app = <App>
	ok app.textContent,"yes"

test do
	tag App
		bool = no
		<self>
			bool ? <b> : <i>

	let app = imba.mount <App>
	eq app.innerHTML,'<i></i>'
	app.bool = yes
	app.render!
	eq app.innerHTML,'<b></b>'