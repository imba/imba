extern describe, test, eq, document

tag el

tag group

	prop long
	prop headed
	prop footed

	def render
		<self>
			if headed
				<el.header>
					<el.title> "Header"
					<el.tools>
					if long
						<el.long>
				<el.ruler>
			<ul>
				<li> "Hello"
				<li> "World"
				if link
					<li> "long"
					<li> "loong"

describe "Tags" do

	var root = <group>
	root.render
	document:body.appendChild(root.dom)

	var a = <el.a>
	var b = <el.b>
	var c = <el.c>
	var d = <el.d>
	var e = <el.e>
	var f = <el.f>
	var g = <el.g>
	var h = <el.h>
	var i = <el.i>
	var j = <el.j>
	var k = <el.k>
	var l = <el.l>
	var m = <el.m>

	# make eq test actual 

	test "something" do
		eq 1, 1
