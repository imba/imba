import {EventEmitter} from 'events'
import {Logger} from './logger'

export default class Component < EventEmitter

	get log
		#logger ||= new Logger

	def time name = 'default'
		let now = Date.now!
		#timestamps ||= {}
		let prev = #timestamps[name] or now
		let diff = now - prev
		#timestamps[name] = now		
		return diff
	
	def timed name = 'default'
		let str = "time {name}: {time(name)}"