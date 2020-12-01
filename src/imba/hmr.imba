console.log 'hmr reloading stuff?'

def connect
	imba.sse = new EventSource("/__hmr__")
	imba.sse.onmessage = do(e)
		console.log 'sse.onmessage',e

	imba.sse.addEventListener("invalidate") do(e)	
		console.log 'event',e	
		let origin = window.location.origin
		let data = JSON.parse(e.data).map do new URL($1,origin)
		for sheet of document.styleSheets
			let el = sheet.ownerNode
			let surl = new URL(sheet.href,origin)
			# reload sheet now then!
			console.log 'matching sheet',surl,data
			let match = data.find do $1.pathname == surl.pathname
			if match
				el.href = match.toString!
		return
	
	imba.sse.onerror = do(e)
		console.log 'hmr disconnected',e
try
	connect!
catch e
	console.log 'error with sse',e