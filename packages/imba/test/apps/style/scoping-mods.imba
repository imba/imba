import './shared.imba'
import 'imba/spec'
global css * bs:solid

tag app-item

tag app-items

	<self>
		<app-item.test eq=eq>

tag App
	<self.app[d:hflex ja:center g:10]>
		<app-items eq={fontWeight:400}>
		<div.bold>
			css >>> app-item
				fw:600 ..bold:700
			<app-items eq={fontWeight:700}>

		<div>
			css div fw:400 @even:2 @odd:3 @first:1 @last:4 # @odd:500 @even:300 @last:350
			<div.test eq={fontWeight:1}>
			<div.test eq={fontWeight:2}>
			<div.test eq={fontWeight:3}>
			<div.test eq={fontWeight:4}>

imba.mount(let app = <App>)

for el in app.querySelectorAll('.test')
	test do eqcss el, el.eq