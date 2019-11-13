extern describe, test, ok, eq, it

<a>
<a.a.b>
<a.b href="">
<a.b .c=yes>

var buildCount = 0

tag custom

	def setup
		super
		buildCount++
		
	def hello
		true

tag cached

	def setup
		@ary = ['a','b','c']
		render
		
	def render
		<self>
			for v in @ary
				<div@{v}> "v"

class CustomClass < Imba.Tag

	def end
		<self.one.two> "Custom"

tag custom-init

	def initialize dom
		self.dom = dom
		@custom = yes
		log 'custom init'
		self

tag super-init

	def initialize dom
		@custom = yes
		super

var toArray = do |list|
	[]:slice.call(list,0)

describe 'Tags - Define' do

	test "basic" do
		var el = <custom>
		eq el.hello, true
		eq el.toString, '<div class="_custom"></div>'


	test "caching" do
		var el = <cached>
		var els = toArray(el.dom:children)
		var [a,b,c] = els
		eq els:length, 3
		eq els,[a,b,c]

		el.render
		# children should remain the same after rerender
		eq toArray(el.dom:children), [a,b,c]

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
		console.log root.@children
		eq buildCount, 4

	test "cache double for in" do
		buildCount = 0
		var root = <div>
		
		def root.render
			var ary = ['a','b','c','d']
			<self>
				<h1> 'heading'
				for v in ary
					<custom.one> v
					<custom.two> v

		root.render
		eq buildCount, 8

		root.render
		root.render
		root.render
		eq buildCount, 8
		eq root.dom:children:length,9

	test "dynamic flags" do
		let val = 'hello'
		var div = <div>
		def div.render do <self .{val}>

		eq div.render.toString, '<div class="hello"></div>'

		val = 'other'
		eq div.render.toString, '<div class="other"></div>'

	test "void elements" do
		var el = <input>
		eq el.toString, '<input>'

	test "idn attributes" do
		var el = <input type='checkbox' required=yes disabled=no checked=yes value="a">
		var html = el.dom:outerHTML

		eq el.dom:required, yes
		eq el.dom:checked, yes
		eq el.dom:disabled, no

		ok html.indexOf('required') >= 0
		ok html.indexOf('value="a"') >= 0


	test "style attribute" do
		var el = <div css:display='inline'>
		if $web$
			eq el.dom:style:display, 'inline'
		else
			eq el.toString, '<div style="display: inline"></div>'
	
	test "class" do
		var el = <CustomClass>
		if $web$
			eq el.dom:className, 'one two'
			document:body.appendChild(el.dom)
		else
			eq el.toString, '<div class="one two">Custom</div>'

	# test "namespaced attributes" do
	# 	var el = <div cust:title="one">
	# 	eq el.toString, '<div cust:title="one"></div>'


	test "initialize" do
		var a = <custom-init>
		eq a.@custom, yes

		var b = <super-init>
		eq b.@custom, yes

	test "local tag" do
		tag LocalTag < canvas
			def initialize
				@local = yes
				super

		var node = <LocalTag>
		eq node.toString, '<canvas class="LocalTag"></canvas>'
		eq node.@local, yes


		tag SubTag < LocalTag

		var sub = <SubTag>
		eq node.@local, yes

	test "caching event-handlers" do
		tag Cache
			def render
				<self> <@body :tap=(|e| title )>

		var node = <Cache>
		
		var fn = node.@body.@on_[0][1]
		node.render
		eq node.@body.@on_[0][1], fn

		# if the handler references variables outside
		# of its scope we dont cache it on first render
		tag NoCache
			def render arg
				<self> <@body :tap=(|e| arg )>

		var node = <NoCache>
		var fn = node.@body.@on_[0][1]
		node.render
		ok node.@body.@on_[0][1] != fn

	test "parsing correctly" do
		try
			<div data-date=Date.new>
		catch e
			ok false

	test "snake_case properties" do
		tag Custom
			prop my_title

		try
			<Custom my_title="hello">
		catch e
			ok false

	test "forin range" do
		tag Custom
			def render
				<self>
					for v in [1..2]
						<div> v

		var node = <Custom>
		eq node.toString, '<div class="Custom"><div>1</div><div>2</div></div>'

	test "data syntax" do
		var data = {a: 1,b : 2}
		var el = <div[data]>
		eq el.data,data

	test "build order" do
		var order = []
		tag Custom

			def build
				order.push('build')

			def setup
				order.push('setup')

			def setName val
				@name = val
				order.push('name')
				self

		var node = <Custom name="custom">
		eq order, ['build','name','setup']

	test "issue #89" do
		tag Custom
			def render
				@items = ["a","b","c"]
				@k = 0
				<self>
					for item in @items
						<div@{@k++}> item

		var node = <Custom>
		eq node.@k,3
		
	test "setting attributes multiple times" do
		var a = <a href='#'>
		a.href = '#1'
		a.href = '#2'
		eq a.toString, '<a href="#2"></a>'
	
	test "css" do
		tag Custom

			def build
				css opacity: 0
		
		var node = <Custom>
		eq node.dom:style:opacity,0
		ok node.toString.match(/opacity\:\s*0/)
	test "css comment" do
		tag MyCoolButton < button
			### css scoped
			/* Typography */
			button {
			  font-weight: bold;
			  font-size: 2rem;
			}
			
			/* Misc */
			button {
			  background: red;
			  color: white;
			  border-radius: 0.3rem;
			  border-color: yellow;
			  width: 200px;
			  height: 48px;
			}
			###
