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
			console.log 'look for sheet',url,match
			if match and url != match
				sheet.ownerNode.href = match
		
		let scripts = Object.keys(global.IMBA_LOADED or {})

		for script in scripts
			let match = urls.find do $1.replace(regex,'') == script.replace(regex,'')
			if match
				console.log "js has changed!!"
				dirty.js.push([script,match])

		# for el of global.document.querySelectorAll('script[src]')
		# 	if let asset = urls[el.getAttribute('src')]
		# 		if asset.replacedBy
		# 			dirty.js.push(asset)

		if dirty.js.length
			log "js changed - reload?",dirty.js
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
			console.log "rebuild!",e,manifest
			refresh(manifest)


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

		socket.addEventListener("reload") do(e)	
			log 'asked to reload by server'
			global.document.location.reload!
		
		socket.onerror = do(e)
			log 'hmr disconnected',e

global.imba_devtools = new DevTools