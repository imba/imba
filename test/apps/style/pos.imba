tag App
	<self>
		<div$a[pos:rel]> "Relative"
		<div$b[pos:abs]> "Absolute"

imba.mount(let app = <App>)

test do	
	eq app.$a.computedStyleMap!.get('position').value, 'relative'
	eq app.$b.computedStyleMap!.get('position').value, 'absolute'
