class Connection
	def constructor
		if $web$ and global.document.documentElement..getAttribute('data-hmr')
			start!
		self

	def start
		return if socket

		socket = new EventSource("/__hmr__")
		socket.onmessage = do(e)
			console.log 'sse.onmessage',e

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