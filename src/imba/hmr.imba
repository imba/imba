console.log 'hmr reloading stuff?'
try
	imba.sse = new EventSource("/__hmr__")
	imba.sse.onmessage = do(e)
		console.log 'event',e
		try
			let origin = window.location.origin
			let data = JSON.parse(e.data)
			console.log 'message from eventsource',data
			
			if data.invalidate
				let urls = data.invalidate.map do new URL($1,origin)	
				for sheet of document.styleSheets
					
					let el = sheet.ownerNode
					let surl = new URL(sheet.href,origin)
					# reload sheet now then!
					console.log 'matching sheet',surl,urls
					let match = urls.find do $1.pathname == surl.pathname
					if match
						console.log "reload!!!!"
						el.href = match.toString!
		catch e
			console.log 'error',e
		return

catch e
	console.log 'error with sse',e