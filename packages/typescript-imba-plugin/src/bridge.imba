import ipc from 'node-ipc'
import * as util from './util'

export default class Client

	constructor id
		self.id = id
		host = null

		ipc.connectTo(id) do
			util.log('ipc','started?')
			host = ipc.of[id]
			host.on('connect') do
				util.log('ipc','connected',arguments)
				emit('pong',Math.random!)

			host.on('message') do handle($1,$2)

	get ils
		global.ils

	def warn message, o = {}
		emit('warn',message: message, options: o)

	def status o = {}
		emit('status',o)

	def emit event, data = {}
		let payload = {
			type: 'event'
			event: event
			ts: Date.now!
			body: data
		}
		host.emit('message',payload)

	def handle e, sock = null
		# util.log('ipc_handle',e)
		if e.type == 'request'
			# util.log('call',e.command,e.arguments)
			let t0 = Date.now!
			let res = null
			if let meth = ils[e.command]
				try
					# util.group("call rpc {e.command}",...e.arguments)
					res = await meth.apply(ils,e.arguments)

					host.emit('message',{
						type: 'response'
						responseRef: e.requestRef
						body: JSON.parse(util.toImbaString(JSON.stringify(res or {})))
						ts: Date.now!
					})
				catch err
					util.log('error','responding',e.command,e.arguments,err)
				finally
					util.warn("called rpc {e.command}",(Date.now! - t0) + 'ms',res)
					# util.groupEnd!

