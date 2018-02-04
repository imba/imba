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
	
	def click o = {}
		dispatch('click',o)

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

tag Button
	def test handler, params, o = {}
		@on_ ||= []
		@on_[0] = [handler,params]
		click(o)

tag Example
	
	def render
		<self>
			<Button@btn[{a: 1, b: 2}]> "Button"
			<div@a :tap='a'>
				<button@tap :tap='b'> "Increment"
				<button@incbubble :tap.bubble='b'> "Increment"
				<button@stopshift :tap.stop.shift='b'> "Increment"
				<button@shiftbubble :tap.shift.bubble='b'> "Increment"
				<button@stopself :tap.stop.self='b'> <b@stopselfinner> "Increment"
				<button@selfstop :tap.self.stop='b'> <b@selfstopinner> "Increment"
				
	def tagAction
		emits.push(this)
		self

	def testModifiers
		eq @tap.click, ['b']
		eq @incbubble.click, ['b','a']
	
		# event should be stopped - but not triggered because shift is not pressed
		eq @stopshift.click, []
		eq @stopshift.click(shiftKey: true), ['b']
		# will bubble through to parent - but not click
		eq @shiftbubble.click, ['a']
		# handled - and then bubble	
		eq @stopself.click, ['b']
		# click inside
		eq @stopselfinner.click, []
		eq @selfstopinner.click, ['a']
		
		# .data - will include the closest tag-data as the argument
		eq @btn.test('tap.data','arg'), [@btn.data]
	
	def testArguments
		# supply arguments with array
		eq @btn.test('tap',['arg',1,2,3]), [1,2,3]
		
		# no arguments should send the event itself as argument
		ok @btn.test('tap','arg')[0] isa Imba.Event
	
		# the action will be called on the object it is found
		eq @btn.test('tap','dataAction'), [store]
		eq @btn.test('tap','tagAction'), [self]
		# allow arguments inline - experimental
		
		

describe "Tags - Events" do
	
	var node = <Example[store]>
	document:body.appendChild(node.dom)
	test "modifiers" do node.testModifiers
	test "arguments" do node.testArguments

	
		
		
	