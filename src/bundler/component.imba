import {EventEmitter} from 'events'

export default class Component < EventEmitter

	def time name = 'default'
		let now = Date.now!
		#timestamps ||= {}
		let prev = #timestamps[name] or now
		let diff = now - prev
		#timestamps[name] = now		
		return diff
	
	def timed name = 'default'
		let str = "time {name}: {time(name)}"