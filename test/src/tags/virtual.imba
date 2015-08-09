extern describe, test, eq, document, _

tag el

	def flag ref
		@flagged = ref
		super

tag group
	prop ops
	prop opstr

	prop expected
	prop actual
		
	def setStaticChildren nodes
		@ops = []
		@opstr = ""
		expected = _.flatten(nodes).filter do |n| n and n.@dom
		actual = []
		log "setStaticChildren",nodes,expected
		super(nodes)

		for child,i in @dom:childNodes
			actual.push( tag(child) )

		eq actual, expected
		return self

	def appendChild node
		log "appendChild"
		ops.push ["appendChild",node]
		@opstr += "A"
		super

	def removeChild node
		ops.push ["removeChild", node]
		@opstr += "R"
		super

	def insertBefore node, rel
		log "insertBefore"
		ops.push ["insertBefore",node,rel]
		@opstr += "I"
		super

	def render a: no, b: no, c: no, d: no, e: no, list: null
		# no need for nested stuff here - we're testing setStaticChildren
		# if it works on the flat level it should work everywhere
		<self>
			<div> "top"
			<div> "ok"
			if a
				<el.header>
				<el.title> "Header"
				<el.tools>
				if b
					<el.long>
					<el.long>
				else
					<el.short>
				<el.ruler>
			if c
				<div.c1> "long"
				<div.c2> "loong"
			if d and e
				<el.long>
				<el.footer>
				<el.bottom>
			elif e
				<el.footer>
				<el.bottom>
			else
				<el> "!d and !e"
			list
			<div> "very last"


tag manual

	prop ops

	def setStaticChildren nodes
		log "setStaticChildren",nodes
		@ops = []
		super(nodes)

	def insertDomNode domNode, tail
		log "insertDomNode"
		super(domNode, tail)
		

describe "Tags" do

	var grp = <group>
	document:body.appendChild(grp.dom)

	test "group" do
		grp.render
		eq grp.opstr, "AAAA"

	return

	var root = <manual>
	document:body.appendChild(root.dom)

	var a  = <el.a> "a" 
	var b  = <el.b> "b" 
	var c  = <el.c> "c" 
	var d1 = <el.d> "d1"
	var d2 = <el.d> "d2"
	var e  = <el.e> "e" 
	var f  = <el.f> "f" 
	var g  = <el.g> "g" 
	var h  = <el.h> "h" 
	var i  = <el.i> "i" 
	var j  = <el.j> "j" 
	var k  = <el.k> "k" 
	var l  = <el.l> "l" 
	var m  = <el.m> "m"

	var l0  = <el.l0> "l0" 
	var l1  = <el.l1> "l1" 
	var l2  = <el.l2> "l2" 
	var l3  = <el.l3> "l3" 
	var l4  = <el.l4> "l4" 
	var l5  = <el.l5> "l5"
	var l6  = <el.l6> "l6"
	var l7  = <el.l7> "l7"
	var l8  = <el.l8> "l8"

	# make eq test actual



	def render o
		var CARY = 0
		var tree = [
			a
			b
			if o:c
				c
			if o:d
				d1
			else
				d2
			e
			o:list or []
			f
			if o:e
				[
					g
					h
					[i,j] if o:f
				]
			k
		]
		console.log "will render",tree
		var pre = _.compact(_.flatten(tree.slice))
		var actual = []
		console.log "expects",pre
		root.setStaticChildren(tree)
		for child,i in root.dom:children
			actual.push( tag(child) )

		console.log "expects",pre,actual
		eq actual, pre


	test "something" do
		eq 1, 1
		render(d: yes)
		render(c: yes)
		render(list: [l1,l2,l3,l4,l5,l6,l7,l8])
		render(list: [l2,l3,l4,l5,l6,l7,l8,l1])
		render(e: yes)
		render(e: yes, f: yes)

	test "other" do
		eq 1, 1

