
extend class Event

	def confirm$mod state, params
		var res = window.confirm(params[0])
		return res

extend class Element
	
	def on$point
		console.log 'on$handler'
		# remove / clear some of the options from 

	def on$resize
		console.log 'on$resize'

	def toggleFlag name
		classList.toggle(name)

tag app-root

	def resized item
		console.log 'resized',item

	def log ...params
		console.log(...params)

	def cancelEventChain
		return false

	def multiply a,b
		return a * b

	def dragging ...params
		console.log('dragging',...params)

	def render
		<self>
			# <div :shortcut('cmd+a').prevent>
			<div :point.prevent .{test}> "What happens when this resizes?"
			<div :click.throttle.log($type).wait(300)> "Click throotle sleep 300"
			<div data=test :click.sleep(300).log($type,'after await')> "Click with async method"
			<div :click.wait(300).log($type,'after await')> "wait 300"
			<div :click.log($type).stop> "Click log stop"
			<div :click.sleep(300,true).log($type,'after await')> "asyncMethod"
			<div :click.sleep(300,false).log($type,'after await')> "Aborted via asyncMethod"
			<div :click.sleep(300,false).log($type,'after await')> "Aborted via asyncMethod"
			<div.busy> "This div is busy"
			<div :click.confirm('Are you sure?').log('confirmed??')> "Click with confirmation"
			<div :click.confirm('Are you sure?').log('confirmed??')> "Throttled"

			<div :click.multiply(2,2).log($value)> "Passing value from previous call"

			<form :submit.prevent.throttle.log('submitting form!').wait(500).cancelEventChain>
				<input type='text'>
				<button type='submit'> 'Submit'

			<div :reloading.throttle('busy').log('hello!').wait(2000)>
				<h2> "Larger div here"
				<button :click.trigger('reloading')> 'Reload!'

			# delegation
			<div :click.sel('button.one').log('clicked button one')>
				<h2> "Larger div here"
				<button.one> 'One'
				<button.two> 'Two'

			<div.draggable :pointer.meta.capture.dragging> "Drag with command!"

			<div.resizable
				:pointer.meta.capture.dragging
				:click.toggleFlag('expanded')
			> "Can resize"


imba.mount <app-root>


### css

.busy {
	color: red;
	opacity: 0.5;
}

.resizable {
	border: 1px solid blue;
	padding: 10px;
	width: 200px;
	height: 100px;
}
.expanded {
	width: 400px;
}
