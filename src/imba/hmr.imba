# imba$imbaPath=global

# ImbaContext.prototype.hmr = new class
# 	def start
# 		return self if #sse
# 
# 		#sse = new EventSource("/__hmr__")
# 		#sse.onmessage = do(e)
# 			console.log 'sse.onmessage',e
# 
# 		#sse.addEventListener("invalidate") do(e)	
# 			let origin = window.location.origin
# 			let data = JSON.parse(e.data).map do new URL($1,origin)
# 			let dirty = {css: [], js: []}
# 			for sheet of document.styleSheets
# 				let url = new URL(sheet.href,origin)
# 				let match = data.find do $1.pathname == url.pathname
# 				if match
# 					console.log "reloading stylesheet {url.pathname}"
# 					sheet.ownerNode.href = match.toString!
# 					dirty.css.push([sheet,match])
# 			
# 			# check scripts
# 			for item of document.getElementsByTagName('script')
# 				continue unless item.src
# 				let url = new URL(item.src,origin)
# 				let match = data.find do $1.pathname == url.pathname
# 				if match
# 					dirty.js.push([item,match])
# 
# 			if dirty.js.length
# 				console.log "js changed - reload?",dirty.js
# 				document.location.reload!
# 			return
# 
# 		#sse.onerror = do(e)
# 			console.log 'hmr disconnected',e
# 
# 		console.log 'startin!!!'
# 		return self

def connect
	console.log 'connecting to hmr'
	return if global.#hmr
	let hmr = global.#hmr = new EventSource("/__hmr__")
	hmr.onmessage = do(e)
		console.log 'sse.onmessage',e

	hmr.addEventListener("invalidate") do(e)	
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

	hmr.addEventListener("reload") do(e)	
		console.log 'asked to reload by server'
		document.location.reload!
	
	hmr.onerror = do(e)
		console.log 'hmr disconnected',e
try
	if $browser$ and document.documentElement..getAttribute('data-hmr')
		connect!
		# if globalThis.document.documentElement
		# console.log 'automatically connect?', globalThis.document.documentElement
		# connect!
catch e
	console.log 'error with sse',e