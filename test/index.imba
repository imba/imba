require('../src/imba/index.imba')
require('./spec.imba')

var compiler = require('../lib/compiler/compiler')

window.SELF = {
	test: window.test,
	describe: window.describe,
	eq: window.eq,
	ok: window.ok,
	spec: SPEC
}

window.imbac = compiler
# console.log("SELF is",SELF);

window.onerror = do |e|
	console.log('page:error',{message: e.message})

window.onunhandledrejection = do |e|
	console.log('page:error',{message: e.reason.message})

var run = do |js|
	# js = js.replace(/require\(["']imba2?["']\)/g,'window.Imba')
	js = js.replace('self = {}','self = SELF')
	console.log('running',js)
	window.eval(js)

	var exposed = SELF

	if SPEC.blocks.length
		exposed = {test: SPEC.run.bind(SPEC)}

		for block in SPEC.blocks
			exposed[block.name] = block.run.bind(block)

		for own k,v of exposed
			if v isa Function
				var button = document.createElement('button')
				button.textContent = k
				button.onclick = do
					v.call(SELF)
					$render()
				window.appDebugPanel.appendChild(button)
	console.log('example:loaded',10)

var compileAndRun = do |src, body|
	console.log('compiling',src)
	var result = compiler.compile(body)
	var js = result.js
	run(js)

var load = do |src|
	var url = './' + src
	
	if src.indexOf('.js') > 0
		var script = document.createElement('script')
		script.src = url
		document.head.appendChild(script)
	else
		console.log("load",url,src)
		# console.log('page:error',message: url)
		try
			var xhr = XMLHttpRequest.new()
			def xhr.onload
				compileAndRun(src,xhr.responseText)

			def xhr.onerror
				console.log("Failed with xmlhttprequest")

			xhr.open('GET', url)
			xhr.send(null)

			# let req = await window.fetch(url,{mode: 'no-cors'})
			# let body = await req.text()
			# compileAndRun(src,body)
		catch e
			console.log('error?!',e.message)




	
var hash = (document.location.hash || '').slice(1)
load(hash) if hash

