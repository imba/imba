let one = 1
let two = 1
let values = [1,2,3,4]

tag app-root
	prop counter = 0
	prop value = null

	prop model = {
		update: do(val) counter = val
	}
	
	def hello
		counter++

	def render
		let three = two

		<self>
			# <div :shortcut('cmd+a').prevent>
			# <div.value @click=(value = [counter,e.type,this == $$.element])> "Advanced"
			<div.click-hello @click=hello()> "Call hello"
			<div.setter @click=(counter=2)> "Set directly"
			<div.incr @click=(counter++)> "Incr"
			<div.add @click=(counter = one + three)> "Incr"
			<div.model @click=model.update(10)> "Model.update"
			for index in values
				<div .index{index} @click=(counter = index)> "Item {index}"

			
let app = <app-root>
imba.mount app

test "click" do
	app.counter = 0
	await spec.click('.click-hello',no)
	eq app.counter,1
	await spec.click('.setter',no)
	eq app.counter,2
	await spec.click('.incr',no)
	eq app.counter,3
	# click will cascade from button.b to div.a
	# await click($1,'.b','b,a')

test "click" do
	app.counter = 0
	one = 1
	two = 1
	await spec.click('.add',no)
	eq app.counter,2
	one = 2
	await spec.click('.add',no)
	eq app.counter,3
	# function should without rerendering
	two = 2
	app.render()
	await spec.click('.add',no)
	eq app.counter,4
	

test "within loop" do
	
	for val in values
		app.counter = 0
		await spec.click(".index{val}",no)
		eq app.counter,val

test "click" do
	app.counter = 0
	await spec.click('.model',no)
	eq app.counter,10
	
test "click" do
	app.counter = 0
	# await spec.click('.value',no)
	# eq app.value, [0,'click',true]

