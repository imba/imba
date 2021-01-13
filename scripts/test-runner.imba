const puppeteer = require "puppeteer"
const path = require "path"
const fs = require "fs"
const compiler = require "../dist/node/compiler.js"
const helpers = compiler.helpers
const http = require('http')

const esbuild = require 'esbuild'
const PORT = 8089


const args = [
	'--disable-web-security',
	'--allow-file-access-from-file',
	'--no-sandbox',
	'--disable-setuid-sandbox',
	'--enable-local-file-accesses',
	'--disable-renderer-backgrounding',
	'--full-memory-crash-report',
	'--disable-dev-shm-usage',
	'--single-process'
]

let browser = null
let server = null

def getFiles(dir, o = [])
	fs.readdirSync(dir, withFileTypes: true).filter do |src|
		let fullpath = path.resolve(dir, src.name)
		if fullpath.match(/\.imba$/)
			o.push(fullpath)
		elif src.isDirectory()
			getFiles(fullpath,o)
	return o
	
let options = helpers.parseArgs(process.argv.slice(2),{
	alias: {g: 'grep',c: 'concurrent',d: 'debug'}
})

let consoleMapping = {
	startGroup: 'group'
	endGroup: 'groupEnd'
}

let parseRemoteObject = do(obj)
	let result = obj.value or obj
	if obj.type == 'object'
		# console.log("object",obj,obj.preview)
		if obj.value
			return obj.value
		result = {}
		for item in obj.preview.properties
			result[item.name] = parseRemoteObject(item) 
	elif obj.type == 'number'
		result = parseFloat(obj.value)
	elif obj.type == 'boolean'
		result = obj.value == 'true'
	return result


let tests = []
let runners = []
let queued = []
let pages = []
let counter = 0 

let doneResolve
let donePromise = new Promise do(resolve,reject)
	doneResolve = resolve


def startNextTest
	let next = pages.find(do !$1.state && !$1.skip)

	if next
		next.state = 'running'
		setTimeout(&,0) do run(next)

	elif pages.every(do $1.state == 'done' or $1.skip )
		doneResolve(pages) if doneResolve
		doneResolve = null
	
def releaseRunner runner, page, close
	page.state = 'done'
	
	if runner.page != page
		console.log 'trying to release wrong runner?!'
		return

	runner.HANDLERS = null
	runner.page = null

	if close
		runner.close!
	else
		runners.push(runner)
	startNextTest!

	
def spawnRunner
	if runners[0]
		return runners.shift!
	
	# console.log 'spawning runner'
	let browser = await puppeteer.launch(args: args, headless: true)
	let runner = await browser.newPage!
	runner.setViewport({width: 300, height: 300})
	runner.nr = counter++
	runner.meta = []

	# let t = Date.now!
	runner.exposeFunction('puppy') do(str,params)
		let rpc = runner.HANDLERS
		let receiver = runner
		let path = str.split('.')
		let meth = path.pop()
		
		unless rpc
			return

		if rpc[meth]
			# console.log 'called puppy',meth # ,params
			rpc[meth].apply(runner.page,params)
			return

		while path.length
			receiver = receiver[path.shift()]

		if runner.page
			runner.meta.push('pup')

		# await runner.waitForSelector('test-runner')
		return receiver[meth].apply(receiver,params)

			
	runner.on 'console' do(msg)
		# console.log("page on console",msg._type,msg)
		let params = msg.args().filter(Boolean).map do |x|
			parseRemoteObject(x._remoteObject)

		let str = String(params[0]) # .replace(':','')
		# console.log 'page on console',str
		if runner.HANDLERS and runner.HANDLERS[str]
			runner.HANDLERS[str](*params.slice(1))

		if options.console
			let key = consoleMapping[msg.type()] or msg.type()
			console[key].apply(console, params)

	return runner

def run page
	
	new Promise do(resolve,reject)

		let test = page.result = {
			path: page.path
			log: []
			tests: []
			failed: []
		}
		
		let runner = await spawnRunner!
		runner.page = page
		page.runner = runner

		let print = do(...params)
			test.log.push(params)
			unless options.concurrent
				console.log(*params)

		let progress = do(out)
			if options.concurrent
				process.stdout.write(out or ".")

		let root = path.resolve(__dirname,"..","test")
		let src = "http://localhost:{PORT}/{page.path}.html"
		# let src = "file://{root}/index.html?{page.nr}#{page.path}"
		let state = 'setup'
		let currTest

		let handlers =
			'spec:test': do(e)
				e.file = page.path
				tests.push(e)
				page.tests.push(e)
				if e.failed
					page.failed.push(e)

				let color = e.failed ? 'red' : 'green'
				let prefix = e.failed ? '✘' : '✔'
				e.detail = helpers.ansi.f("{color}Bright","  {prefix} {e.name}")
				print e.detail
				progress(helpers.ansi.f("{color}Bright",prefix))

			'spec:warn': do(e)
				print helpers.ansi.f('yellowBright',"    - {e.message}")

			'spec:fail': do(e)
				print helpers.ansi.f('redBright',"    ✘ {e.message}")

			'spec:start': do(e)
				yes
				# console.log "starting tests!"
			
			'spec:done': do(e)
				# console.log 'spec done'
				test.results = e
				setTimeout(&,0) do releaseRunner(runner,page)
				resolve(test)

			'page:error': do(e)
				print(helpers.ansi.f('redBright',"error {e.message}"))
				test.error = e
				page.error = e
				setTimeout(&,0) do releaseRunner(runner,page)
				resolve(test)
				

		let first = !runner.HANDLERS
		let errored = runner.ERRORED
		runner.HANDLERS = handlers
		print(helpers.ansi.bold(page.path) + ' ' + helpers.ansi.gray(src.replace(/\?\d+/,'')))
		runner.meta.push(page.path)
		try
			await runner.goto(src, waitUntil: 'domcontentloaded', timeout: 5000)
			# console.log 'went to!'
			# await runner.waitFor(0)
		catch e
			console.log 'timed out for',page.path,e
			page.error ||= e

		if page.error
			console.log "evaluate the loading now!"

def serve
	let statics = {}
	for item in ['imba','spec','compiler']
		try
			let body = fs.readFileSync(path.join(__dirname,'..','dist',"{item}.web.mjs"),'utf8')
			statics["/{item}.js"] = body

	# let speccer = import.worker('../src/utils/spec.imba')
	# would really help if we could use the imba.bundler directly here

	let copts = {
		platform: 'browser'
		runtime: '/imba.js'
		raiseErrors: true
		resolve: {
			'imba': '/imba.js',
			'imba/compiler': '/compiler.js',
			'imba/spec': '/spec.js'
		}
	}

	let rawspec = fs.readFileSync(path.join(__dirname,'..','src','utils','spec.imba'),'utf8')
	let speccer = compiler.compile(rawspec,Object.assign({sourcePath: 'spec.imba'},copts))
	let specjs = statics["/spec.js"] = speccer.js

	server = http.createServer do(req,res)
		if let file = statics[req.url]
			res.setHeader("Content-Type", "application/javascript")
			res.write(file)
			return res.end!

		# let url = new URL(req.url)
		let src = path.join(__dirname,"..","test",req.url)
		let name = path.basename(src)
		let ext = src.split('.').pop!
		let barename = name.replace(/(\.(js|html|imba))+$/,'')
		let entry = pages[src.replace(/(\.(js|html|imba))+$/,'.imba')]

		if ext == 'html'
			let html = """
				<html><head>
				<meta charset='UTF-8'>
				<script src='/imba.js' type='module'></script>
				<script src='/spec.js' type='module'></script>
				</head><body>
				<script src='./{barename}.imba' type='module'></script>
				<script type='module'>SPEC.run();</script>
				</body></html>
			"""

			if entry and entry.body.indexOf('global.imbac') >= 0
				console.log 'need to import the compiler?'
				html = html.replace('</head>',"<script src='/compiler.js' type='text/javascript'></script></head>")
			res.write(html)
			return res.end!

		if entry
			let body = entry.body
			# console.log 'found page'			
			let opts = Object.assign({},copts,{sourcePath: src})
			try
				let output = compiler.compile(body,opts)
				res.writeHead(200, { 'Content-Type': 'application/javascript' })
				let js = output.js
				# console.log 'js here',js
				# js = '(function(){' + js + '})();SPEC.run()'
				# console.log 'write html',output.js
				res.write(js)
			catch e
				# res.write 'console.log("page:error",{message: "error compiling"})'
				res.write 'console.log("hello")'
		else
			console.warn "NOT HANDLING REQUEST {src}"
			res.write('')
		res.end!

	new Promise do(resolve)
		server.listen(PORT) do resolve(server)

def main

	let now = Date.now()
	let server = await serve!
	let testFolder = path.resolve(__dirname,"..","test","apps")
	let entries = getFiles(testFolder).filter do |item|
		options.main ? (item.indexOf(options.main) >= 0) : !item.match(/(examples|tmp)\//)

	# let files = entries.map(|v| )
	
	pages = entries.map do(src,i)
		{
			path: src.replace(testFolder,"apps"),

			sourcePath: src,
			state: null,
			log: []
			tests: []
			failed: []
			nr: i
			body: fs.readFileSync(src,'utf8')
		}

	
	for page in pages
		pages[page.sourcePath] = page
		let bundle = page.body.match(/^(import|export) /gm)
		page.skip = yes if page.body.match(/# SKIP/)

	let entrypoints = pages.filter do !$1.skip


	console.log "starting tests?",entrypoints.length
	
		
	# fetch the actual items to compile first
	options.verbose = true if entrypoints.length < 3

	let concurrency = Math.min(options.concurrent ? 3 : 1,entrypoints.length)
	while --concurrency >= 0
		startNextTest!
	
	await donePromise
	
	if options.concurrent and options.verbose
		console.log('')
		for page in entrypoints
			for row in page.result.log
				console.log(*row)
			console.log('')

	let passed = tests.filter do !$1.failed
	let failed = tests.filter do $1.failed
	let crashed = entrypoints.filter do $1.error
	console.log('')
	console.log("{tests.length} tests took {Date.now() - now}ms")

	if passed.length
		console.log helpers.ansi.f('greenBright',"{passed.length} test{passed.length == 1 ? '' : 's'} passed")

	if failed.length
		console.log helpers.ansi.f('redBright',"{failed.length} test{failed.length == 1 ? '' : 's'} failed")
		console.log "The following file(s) failed:"
		for page in entrypoints when page.failed.length
			console.log "  {page.path}"
			for test in page.failed
				console.log "  " + test.detail
				if test.error
					console.log "      Error: " + test.error
				for message in test.messages
					console.log "      " + message
				# (failed.map do "x {$1.file}").join('\n')
	
	if crashed.length
		console.log "The following file(s) crashed:"
		console.log (crashed.map do " - {$1.path}").join('\n')

	# await new Promise do(resolve) setTimeout(resolve,100000)
	# server.close do
	
	unless options.debug
		process.exit(failed.length ? 1 : 0)

main()