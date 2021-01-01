import {deserializeData} from './utils'
import {manifest} from './manifest'

# Improve this

class Connection
	def constructor
		if $web$ and global.document.documentElement..getAttribute('data-hmr')
			start!
		self

	def refresh changes
		let dirty = {
			css: []
			js: []
		}

		for sheet of document.styleSheets
			let url = sheet.ownerNode.getAttribute('href')
			console.log 'look for sheet',url,manifest.urls
			if let asset = manifest.urls[url]
				if asset.replacedBy
					sheet.ownerNode.href = asset.replacedBy.url

		for el of document.querySelectorAll('script[src]')
			if let asset = manifest.urls[el.getAttribute('src')]
				if asset.replacedBy
					dirty.js.push(asset)

		if dirty.js.length
			console.log "js changed - reload?",dirty.js
			document.location.reload!
		self

	def start
		return if socket

		socket = new EventSource("/__hmr__")
		socket.onmessage = do(e)
			console.log 'sse.onmessage',e

		socket.addEventListener("paused") do(e)
			console.log "server paused"

		socket.addEventListener("state") do(e)
			let json = JSON.parse(e.data)
			console.log "server state",json

		socket.addEventListener("init") do(e)
			console.log "setting up manifest!!"
			# let parsed = deserializeData(JSON.parse(e.data))
			let json = JSON.parse(e.data)
			# console.log "event from manifest",json
			manifest.init(json)
			# manifest.update(json)
			# console.log manifest.changes

		socket.addEventListener("manifest") do(e)
			# let parsed = deserializeData(JSON.parse(e.data))
			let json = JSON.parse(e.data)
			# console.log "event from manifest",e,e.data,json
			let changes = manifest.update(json)
			console.log "Changes for manifest",changes
			refresh changes


		socket.addEventListener("invalidate") do(e)	
			let origin = window.location.origin
			let data = JSON.parse(e.data).map do new URL($1,origin)
			let dirty = {css: [], js: []}
			for sheet of document.styleSheets
				let url = new URL(sheet.href,origin)
				let match = data.find do $1.pathname == url.pathname
				if match
					console.log "reloading stylesheet {url.pathname}"
					sheet.ownerNode.href = match.toString!
					dirty.css.push([sheet,match])
			
			# check scripts
			for item of document.getElementsByTagName('script')
				continue unless item.src
				let url = new URL(item.src,origin)
				let match = data.find do $1.pathname == url.pathname
				if match
					dirty.js.push([item,match])

			if dirty.js.length
				console.log "js changed - reload?",dirty.js
				document.location.reload!
			return

		socket.addEventListener("reload") do(e)	
			console.log 'asked to reload by server'
			document.location.reload!
		
		socket.onerror = do(e)
			console.log 'hmr disconnected',e

export const hmr = new Connection