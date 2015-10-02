extern eq

tag custom

	def hello
		true

<a>
<a.a.b>
<a.b href="">
<a.b .c=yes>

tag cached

	def build
		@ary = ['a','b','c']
		render
		
	def render
		<self>
			for v in @ary
				<div@{v}> "v"
		

describe 'Tags - Define' do

	test "basic" do
		var el = <custom>
		eq el.hello, true
		eq el.toString, "<div class='_custom'></div>"


	test "caching" do
		var el = <cached>
		var els = el.dom:children
		var [a,b,c] = els
		eq els:length, 3
		eq els, [a,b,c]

		el.render
		# children should remain the same after rerender
		eq el.dom:children, [a,b,c]

	# bug
	test "as part of object" do
		var obj =
			name: 'something'
			node: <a href='#'>

	test "with switch" do
		var num = 1
		var el = <div>
			<div.inner>
				switch num
					when 1
						<div.one>
					else
						<div.other>
					