extern describe, test, ok, eq, it

var a = 0
var b = 0
var c = 0

tag Tester
	def toString
		let html = dom:outerHTML
		html = html.replace(/\<[^\>]+\>/g) do |m|
			m[1] == '/' ? ']' : '['

	def test options
		@o = options
		render(options)
		toString
		
tag cachetest

	tag panel

		def header
			<div@header> <div> 'H'

		def body
			<div>

		def render
			<self>
				<div> 'P'
				header
				body

	tag subpanel < panel

		def header
			<div@header> <div> 'X'

	tag wrapped
		prop content

		def render
			<self>
				<div> 'W'
				@content

	def render o = {}
		<self>
			if o:a
				<div> 'A'
			o:b and <div> 'B'
			if o:c
				<wrapped>
					<div> 'B'
					<div> 'C'

			for item in o:letters
				<div> item

	def toString
		let html = dom:outerHTML
		# strip away all tags
		html = html.replace(/\<[^\>]+\>/g) do |m|
			m[1] == '/' ? ']' : '['
		# html = html.replace(/\[(\w+)\]/g,'$1')

	def test options
		render(options)
		toString
		
let has = do |text,fn|
	ok String(fn).indexOf(text) >= 0
			

describe 'Tags - Cache' do
	var node = <cachetest>
	test "basic" do
		eq node.test, "[]"

	test "wrapped" do
		eq node.test(c: yes), "[[[W][B][C]]]"

	test "with list" do
		eq node.test(letters: ['A','B','C']), "[[A][B][C]]"
		
	test "setText" do
		let has = do |text,fn|
			ok String(fn).indexOf(text) >= 0
		let dyn = 10
		has('setText') do <div> "title"
		has('setText') do <div> "title {dyn}"
		has('setText') do <div> "title" + dyn
			
	test "svg dynamic set" do
		has('set(') do <svg:rect fill='red'>
		
	test "alternate text and dom" do
		return if $node$
		var items = ["A",<div> "B"]
		var flip = do
			items.reverse
			return items[0]
		
		var el = <Tester -> <li> items[@o]
		# items = ["A",<div> "B"]
		eq el.test(0), '[[A]]'
		eq el.test(1), '[[[B]]]'
		eq el.test(0), '[[A]]'
		
		
	$web$ and test "pruning" do
		var counter = 0
		var items = []
		for i in [0..10]
			items.push({id: counter++, name: "Item"})
		
		var node = <div ->
			<ul> for item in items
				<li@{item:id}> item:name
		
		let prevFn = Imba.TagMap:prototype:$prune
		var pruned = no

		Imba.TagMap:prototype:$prune = do |items|
			pruned = yes
			prevFn.call(this,items)
			
		for i in [0..2000]
			items.shift
			items.push({id: counter++, name: "Item"})
			node.render
		
		let map = node:$[1]
		eq pruned, yes
		self
		
		
		
		
		
		