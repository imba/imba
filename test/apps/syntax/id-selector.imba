tag App

	<self#header>
		<div> "Hello there"


let app = <App>
imba.mount app

test do
	ok app == #header
	ok #header..id == 'header'
	ok #other..id == undefined