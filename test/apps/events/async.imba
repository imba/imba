


class PointDirective

# imba.events.register 'point', PointDirective

extend class Event
	
	def wait$mod handler, event, params, index
		Promise.new do |resolve|
			setTimeout(resolve,(params[0] isa Number ? params[0] : 1000))

	def confirm$mod handler, event, params, index
		var res = window.confirm(params[0])
		return res

	def throttle$mod handler, event, params, index
		return false if handler.throttled
		handler.throttled = yes
		let name = params[0]
		unless name isa String
			name = "in-{event.type or 'event'}"
		let cl = event.currentTarget.classList
		cl.add(name)
		handler.once('idle') do
			cl.remove(name)
			handler.throttled = no
		return true

	def debounce$mod handler, event, params, index
		console.log 'debounce'
		let state = handler.state ||= {}
		if state.cooldown
			return false
		else
			console.log('cooldown$modifier',handler,event,params)
			state.cooldown = true
			setTimeout(&,1000) do state.cooldown = false
			return
		self


tag app-root

	def resized item
		console.log 'resized',item

	def log ...params
		console.log(...params)

	def sleep time, param
		Promise.new do |resolve,reject|
			setTimeout(&,time) do
				console.log "done in async method!"
				resolve(param)

	def cancelEventChain
		return false

	def render
		<self>
			# <div :shortcut('cmd+a').prevent>
			<div :point.prevent> "What happens when this resizes?"
			<div :click.cooldown.log($type,'cooldown?')> "Click with throttle?"
			<div :click.throttle.log($type).wait(300)> "Click throotle sleep 300"
			<div :click.sleep(300).log($type,'after await')> "Click with async method"
			<div :click.wait(300).log($type,'after await')> "wait 300"
			<div :click.log($type).stop> "Click log stop"
			<div :click.sleep(300,true).log($type,'after await')> "asyncMethod"
			<div :click.sleep(300,false).log($type,'after await')> "Aborted via asyncMethod"
			<div :click.sleep(300,false).log($type,'after await')> "Aborted via asyncMethod"
			<div.busy> "This div is busy"
			<div :click.confirm('Are you sure?').log('confirmed??')> "Click with confirmation"
			<div :click.confirm('Are you sure?').log('confirmed??')> "Throttled"

			<form :submit.prevent.throttle.log('submitting form!').wait(500).@cancelEventChain>
				<input type='text'>
				<button type='submit'> 'Submit'

			<div :reloading.throttle('busy').log('hello!').wait(2000)>
				<h2> "Larger div here"
				<button :click.trigger(:reloading)> 'Reload!'


imba.mount <app-root>


### css

.busy {
	color: red;
	opacity: 0.5;
}
