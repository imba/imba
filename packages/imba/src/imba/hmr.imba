class DevTools
	def constructor
		start!
		debug = no
		self

	def log ...params
		# return unless debug
		console.log(...params)

	def refresh manifest
		let dirty = {
			css: []
			js: []
		}

		let urls = Object.values(manifest).map do $1.url
		let regex = /\.[A-Z\d]{8}\./

		for sheet of global.document.styleSheets
			let url = sheet.ownerNode.getAttribute('href')
			let match = urls.find do $1.replace(regex,'') == url.replace(regex,'')
			if match and url != match
				sheet.ownerNode.href = match
		
		let scripts = Object.keys(global.IMBA_LOADED or {})

		for url in scripts
			let match = urls.find do $1.replace(regex,'') == url.replace(regex,'')
			if match and url != match and urls.indexOf(url) == -1
				dirty.js.push([url,match])
		
		console.log "refreshed",manifest,dirty
		if dirty.js.length and false

			global.document.location.reload!
		self

	def start
		return if socket
		console.log "STARTED!"

		socket = new EventSource("/__hmr__")
		socket.onmessage = do(e)
			log 'sse.onmessage',e

		socket.addEventListener("paused") do(e)
			log "server paused"
			yes

		socket.addEventListener("rebuild") do(e)
			let manifest = JSON.parse(e.data)
			refresh(manifest)

		socket.addEventListener("state") do(e)
			let json = JSON.parse(e.data)
			log "server state",json

		socket.addEventListener("errors") do(e)
			let json = JSON.parse(e.data)
			for item in json
				console.error("error in {item.location.file}: {item.location.lineText} ({item.text})")
			return

		socket.addEventListener("reload") do(e)	
			log 'asked to reload by server'
			global.document.location.reload!
		
		socket.onerror = do(e)
			log 'hmr disconnected',e

global.imba_devtools = new DevTools