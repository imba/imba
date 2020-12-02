def connect
	imba.sse = new EventSource("/__hmr__")
	imba.sse.onmessage = do(e)
		console.log 'sse.onmessage',e

	imba.sse.addEventListener("invalidate") do(e)	
		# console.log 'event',e	
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
	
	imba.sse.onerror = do(e)
		console.log 'hmr disconnected',e
try
	connect! if $browser$
catch e
	console.log 'error with sse',e