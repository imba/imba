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
	# if nothing stops tap before reaching Example
	# ontap will be triggered
	def ontap
		emits.push(0)
		
	def mark *pars
		emits.push(*pars)
	
	def render
		<self>
			"A"
			<div@b ref='b'>
				"B"
				<Custom@c ref='c'>
					"C"
					<div@d ref='d'> "D"

			<div :tap.mark(1)>
				<div@ctrl :tap.stop.ctrl.mark(2)>
				<div@shift :tap.stop.ctrl.mark(2)>
				<div@alt :tap.alt.stop.mark(2)>
				<div@stops :tap.stop.mark(2)>
				<div@bubbles :tap.mark(2)>
				<div@self1 :tap.self.mark(2)> <b@inner1> "Label"
				<div@self2 :tap.stop.self.mark(2)> <b@inner2> "Label"
				<div@redir :tap.stop.trigger(:redir)> "Label"
				<div@zero :tap.stop.zeroHandler> "Checking zero value"

	def zeroHandler
		trigger('zero', 0)

	def onredir
		emits.push('redir')

	def onzero e
		emits.push(e.data)
				
				
	def tagAction
		emits.push(this)
		self

	def testModifiers
		eq @stops.click, [2]
		eq @bubbles.click, [2,1,0]
		eq @ctrl.click,[]
		eq @ctrl.click(ctrlKey: yes),[2]
		
		eq @alt.click, [1,0]
		eq @alt.click(altKey: yes), [2]
		
		# test .self modifier
		eq @self1.click, [2,1,0]
		eq @self2.click, [2]
		eq @inner1.click, [1,0]
		eq @inner2.click, []
		
		eq @redir.click, ['redir']
		eq @zero.click, [0]
		return

describe "Tags - Events" do
	var node = <Example[store]>
	document:body.appendChild(node.dom)
	test "modifiers" do node.testModifiers
	# test "arguments" do node.testArguments

	
		
		
	