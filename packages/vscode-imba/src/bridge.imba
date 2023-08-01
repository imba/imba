import ipc from 'node-ipc'

import * as util from './util'

export default class Host
	constructor api, cb
		self.id = "imba-ipc-{String(Math.random!)}"
		self.api = api
		self.reqs = 0
		
		sent = 0
		nextRequestRef = 1
		pendingRequests = {}
		cb = cb
		
		serve!
		self
		
	def serve
		ipc.config.id = id		
		ipc.serve do
			util.log('ipc serving on ' + id)
			ipc.server.on('message') do(data,socket) handle(data,socket)
			ipc.server.on('connect') do(socket)
				util.log('server connected?')
				cb(socket) if cb
			emit('ready')
		ipc.server.start!

	def on ev, cb
		imba.listen(self,ev,cb)
		
	def ping
		emit('ping', ref: reqs++)

	def emit name, body = {}
		send(type: 'event', event: name, body: body)
		
	def handle e, socket = null
		let now = Date.now!
		let elapsed = now - e.ts
		util.log("ipc.onmessage {JSON.stringify(e).slice(0,100)} transferred in {elapsed}ms - ")
		
		if e.type == 'response'
			if let id = e.responseRef
				let request = pendingRequests[id]
				let took = Date.now! - request.ts
				util.log("msg response took {took}ms")
				request.#resolve(e.body)
				delete pendingRequests[id]
		else
			imba.emit(self,e.type,[e])
			if e.type == 'event'
				imba.emit(self,e.event,[e.body,e])
		self
	
	def call method, ...params
		let ev = {
			type: 'request'
			requestRef: nextRequestRef++
			command: method
			arguments: params
			ts: Date.now!
		}
		ev.#promise = new Promise do(resolve) ev.#resolve = resolve
		pendingRequests[ev.requestRef] = ev
		send(ev)
		return ev.#promise
		
	def send msg
		let cfg = {id: id, data: msg}
		self.api.configurePlugin('imba',cfg)