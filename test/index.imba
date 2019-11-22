
var paths = require.context('raw-loader!./', true, /apps\/[\w\-]+\.imba$/)
var examples = {}

for src in paths.keys()
	var example = {
		path: src
		body: paths(src).default
	}
	examples[src] = example

require('../src/imba/index.imba')
require('./spec.imba')

var compiler = window.imbac

window.SELF = {
	test: window.test,
	describe: window.describe,
	eq: window.eq,
	ok: window.ok,
	spec: SPEC
}

window.onerror = do |e|
	console.log('page:error',{message: e.message})

window.onunhandledrejection = do |e|
	console.log('page:error',{message: e.reason.message})

var run = do |js|
	js = js.replace('self = {}','self = SELF')
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
	var result = compiler.compile(body)
	var js = result.js
	run(js)

var load = do |src|
	var url = './' + src

	if var example = examples[url]
		compileAndRun(src,example.body)
		return
	
	elif src.indexOf('.js') > 0
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
		catch e
			console.log('error?!',e.message)

	
var hash = (document.location.hash || '').slice(1)
load(hash) if hash

