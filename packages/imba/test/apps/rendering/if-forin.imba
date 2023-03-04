import 'imba/test/spec'

let bool = no
let path = 'a'
tag App

	<self>
		<div[fl:1 px:4 fw:600]>
			if bool
				let parts = path.split('/')
				for part in parts
					<div> part
			<span> ']'

test do
	let app = imba.mount <App>
	eq app.textContent,']'
	bool = yes
	app.render!
	eq app.textContent,'a]'
	path = 'a/b'
	app.render!
	eq app.textContent,'ab]'