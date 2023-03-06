import {emit,listen,once,unlisten} from './utils'

export class Queue < Set
	constructor
		super()
		#idler = Promise.resolve(this)

	def emit name, ...params do emit(self,name,params)
	def on name, ...params do listen(self,name,...params)
	def once name, ...params do once(self,name,...params)
	def un name, ...params do unlisten(self,name,...params)

	def add value
		if value isa Function
			value = value()

		unless has(value)
			value.then do self.delete(value)
			let first = size == 0
			super(value)
			if first
				#idler = #resolve = null
				self.emit('busy',self)
		return value

	def delete value
		if super(value)
			if size == 0
				if #resolve
					#resolve(self)
					#resolve = null
				self.emit('idle',self)
			return true
		return false

	get idle
		#idler ||= new Promise do(resolve)
			#resolve = resolve