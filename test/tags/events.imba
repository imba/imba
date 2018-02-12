extern describe, test, ok, eq, it

var value = null
var counter = 0
var emits = []

var store = {
	title: "Something"
	counter: 0
	update: do |val = true| value = val
	inc: do
		this:counter++
		counter++

	reset: do
		emits = []
		store:counter = counter = 0
		value = null
		
	a: do emits.push('a')
	b: do emits.push('b')
	c: do emits.push('c')
	d: do emits.push('d')
	arg: do |*args| emits.push(*args)
	dataAction: do emits.push(this)
}

extend tag element
	prop ref
	
	def click o = {}
		dispatch('click',o)
		
	def on *params
		@on_ ||= []
		@on_[0] = params
		self

	def dispatch name, opts = {}
		emits = [] # reset emits every time
		let type = MouseEvent
		let desc = {
			bubbles: true,
			cancelable: true
		}
		for own k,v of opts
			desc[k] = v
		let event = type.new(name,desc)
		dom.dispatchEvent(event)
		return emits
	
	def mark *params
		if params[0] isa Imba.Event
			emits.push(@ref)
		else
			emits.push(*params)

tag Custom
	def meth
		emits.push('Custom')
	
tag Example
	
	def meth
		emits.push('Example')
		
	def emeth
		emits.push('Example')
		
	def ontap
		emits.push('tapa')
	
	def render
		<self>
			"A"
			<div@b ref='b'>
				"B"
				<Custom@c ref='c'>
					"C"
					<div@d ref='d'> "D"
				
	def tagAction
		emits.push(this)
		self

	def testModifiers
		
		# test self
		@c.on('tap','mark')
		eq @d.click, ['c']
		
		@c.on('tap','self','mark')
		eq @d.click, ['tapa']

		@c.on('tap','emeth')
		eq @d.click, ['Example']
		
		eq @b.on('tap','mark').click, ['b']
		eq @b.on('tap',['mark',1,2]).click, [1,2]
		
		# fall through
		eq @b.on('tap','bubble','mark').click, ['b','tapa']
		
		# alt modifier
		eq @b.on('tap','alt','mark').click, ['tapa']
		eq @b.on('tap','stop','alt','mark').click, []
		eq @b.on('tap','stop','alt',['mark',true]).click(altKey: yes), [true]
		eq @b.on('tap','mark').click, ['b']
		
		self

describe "Tags - Events" do
	var node = <Example[store]>
	document:body.appendChild(node.dom)
	test "modifiers" do node.testModifiers
	# test "arguments" do node.testArguments

	
		
		
	