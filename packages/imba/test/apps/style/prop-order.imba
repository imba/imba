tag App
	css $preview
		mt:0
		m:0
		mt:1px

	<self> <div$preview> "Hello"

imba.mount(let a = <App>)
let style = a.$preview.computedStyleMap!

test do	
	eq style.get('margin-bottom').value, 0

test do	
	eq style.get('margin-top').value, 1