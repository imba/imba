extern eq



<a>
<a.a.b>
<a.b href="">
<a.b .c=yes>

var buildCount = 0

tag custom

	def build
		super
		buildCount++
		
	def hello
		true



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
		# not yet caching with switch
		var el = <div>
			<div.inner>
				switch num
					when 1
						<div.one>
					else
						<div.other>

	test "singleton with reserved names" do
		tag #try
			def hello
				yes
		<#try>


	test "cache for in" do
		buildCount = 0
		var root = <div>
		
		def root.render
			var ary = ['a','b','c','d']
			<self>
				<h1> 'heading'
				for v in ary
					<custom> v

		root.render
		eq buildCount, 4

		root.render
		root.render
		root.render
		eq buildCount, 4




					