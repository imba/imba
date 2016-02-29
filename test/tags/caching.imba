var a = 0
var b = 0
var c = 0

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

			

describe 'Tags - Cache' do
	var node = <cachetest>
	test "basic" do
		eq node.test, "[]"

	test "wrapped" do
		eq node.test(c: yes), "[[[W][B][C]]]"

	test "with list" do
		eq node.test(letters: ['A','B','C']), "[[A][B][C]]"