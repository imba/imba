# import {deserializeData} from '../imba/utils'
# import {manifest} from '../imba/manifest'
# Improve this
let doc =  global.document

import {deserializeData,patchManifest} from './utils'

class Manifest
	def constructor
		data = {}

	get changes do data.changes or {}
	get inputs do data.inputs
	get outputs do data.outputs
	get urls do data.urls
	get main do data.main

	def init raw
		update(raw)
	
	def update raw
		if typeof raw == 'string'
			raw = deserializeData(raw)

		data = patchManifest(data,raw)
		return data.changes

class DevTools
	def constructor
		start!
		manifest = new Manifest({})
		debug = no
		self

	def log ...params
		return unless debug
		console.log(...params)


	def refresh changes
		let dirty = {
			css: []
			js: []
		}

		for sheet of doc.styleSheets
			let url = sheet.ownerNode.getAttribute('href')
			# console.log 'look for sheet',url,manifest.urls
			if let asset = manifest.urls[url]
				if asset.replacedBy
					sheet.ownerNode.href = asset.replacedBy.url

		for el of doc.querySelectorAll('script[src]')
			if let asset = manifest.urls[el.getAttribute('src')]
				if asset.replacedBy
					dirty.js.push(asset)

		if dirty.js.length
			log "js changed - reload?",dirty.js
			doc.location.reload!
		self

	def start
		return if socket

		socket = new EventSource("/__hmr__")
		socket.onmessage = do(e)
			log 'sse.onmessage',e

		socket.addEventListener("paused") do(e)
			log "server paused"
			yes

		socket.addEventListener("state") do(e)
			let json = JSON.parse(e.data)
			log "server state",json

		socket.addEventListener("init") do(e)
			let json = JSON.parse(e.data)
			manifest.init(json)
			log "hmr init",manifest.data

		socket.addEventListener("errors") do(e)
			let json = JSON.parse(e.data)
			for item in json
				console.error("error in {item.location.file}: {item.location.lineText} ({item.text})")
			return
			# manifest.init(json)

		socket.addEventListener("manifest") do(e)
			# let parsed = deserializeData(JSON.parse(e.data))
			let json = JSON.parse(e.data)
			# console.log "event from manifest",e,e.data,json
			let changes = manifest.update(json)
			# console.log "Changes for manifest",manifest.data,changes
			refresh changes

		socket.addEventListener("reload") do(e)	
			log 'asked to reload by server'
			doc.location.reload!
		
		socket.onerror = do(e)
			log 'hmr disconnected',e

global.imba_devtools = new DevTools