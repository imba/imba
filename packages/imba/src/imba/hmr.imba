class DevTools
	def constructor
		start!
		debug = no
		self

	def log ...params
		# return unless debug
		console.log(...params)

	def refresh manifest
		manifest = manifest

		let dirty = {
			css: []
			js: []
		}

		let urls = Object.values(manifest).map(do $1.url).filter(do $1)
		let regex = /\.[A-Z\d]{8}\./

		for sheet of global.document.styleSheets
			let url = sheet.ownerNode.getAttribute('href') or ''
			let match = urls.find do $1 and $1.replace(regex,'') == url.replace(regex,'')
			if match and url != match
				sheet.ownerNode.href = match

		let scripts = Object.keys(global.IMBA_LOADED or {})

		for url in scripts
			let match = urls.find do $1 and $1.replace(regex,'') == url.replace(regex,'')
			if match and url != match and urls.indexOf(url) == -1
				dirty.js.push([url,match])

		# console.log "refreshed",manifest,dirty
		if dirty.js.length
			global.document.location.reload!
		self

	def start
		return if socket

		socket = new EventSource("/__hmr__")
		socket.onmessage = do(e)
			log 'sse.onmessage',e

		socket.addEventListener("paused") do(e)
			log "server paused"
			yes

		socket.addEventListener("resumed") do(e)
			log "server resumed"
			yes

		socket.addEventListener("reloaded") do(e)
			log "server reloaded"
			setTimeout(&,200) do
				socket.close()
				socket = null
				start!
			yes

		socket.addEventListener("rebuild") do(e)
			let manifest = JSON.parse(e.data)
			refresh(manifest)

		socket.addEventListener("init") do(e)
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