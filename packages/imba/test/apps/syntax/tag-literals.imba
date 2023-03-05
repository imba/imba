tag Hi
	<self>
		let parts = ['one','two','three']
		for item in parts
			<span> item
		<div>
			let els = [<h1>,<h2>,<h3>]
			<ul> for item in els
				<li> item

describe "tag literals" do
	test "basic expression" do
		# Tags can be created and assigned
		let el = <div title="div">
		eq el.title, 'div'
		
	test "nested expression" do
		# Tags can be created and assigned
		let el = <div title="div">
			let parts = ['one','two','three']
			for item in parts
				<span> item

		eq el.title, 'div'
		eq el.children.length, 3
		
	test "nested expression with vars" do
		# Tags can be created and assigned
		let el = <div title="div">
			let parts = [<h1>,<h2>,<h3>]
			for item in parts
				<span> item

		eq el.title, 'div'
		eq el.children.length, 3
		eq el.children[0].innerHTML, "<h1></h1>"
		
	test "comment inside literal" do
		let el = <div
			title='div'
			# title='dov'
		>
		eq el.title, 'div'
	
	test "var scoping" do
		let num = 1
		
		let el = <h4>
			<i> num
			<b>
				let num2 = 2
				<i> num2
			let num2 = 3
			<i> num2

		eq el.outerHTML,"<h4><i>1</i><b><i>2</i></b><i>3</i></h4>"