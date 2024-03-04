# TODO esmify
const puppeteer = require "puppeteer"
const path = require "path"
const fs = require "fs"
const compiler = require "../dist/compiler.cjs"
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
	return if obj === undefined
	let result = obj.value or obj
	if obj.type == 'object'
		if obj.value
			return obj.value
		result = {}
		if obj.preview
			for item in obj.preview.properties
				result[item.name] = parseRemoteObject(item)

	elif obj.type == 'number'
		result = parseFloat(obj.value)
	elif obj.type == 'boolean'
		result = (obj.value == 'true' or obj.value === true)
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

	if runner.pup.mousedown > 0
		runner.mouse.up!
		runner.pup.mousedown = 0

	if close
		runner.close!
	else
		runners.push(runner)
	startNextTest!

def spawnRunner
	if runners[0]
		return runners.shift!

	let browser = await puppeteer.launch(args: args, headless: true)
	let runner = await browser.newPage!
	runner.setViewport({width: 800, height: 600})
	runner.nr = counter++
	runner.meta = []
	runner.pup = {
		mousedown: 0
	}

	# let t = Date.now!
	await runner.exposeFunction('puppy') do(str,params)
		let rpc = runner.HANDLERS
		let receiver = runner
		let path = str.split('.')
		let meth = path.pop()

		unless rpc
			return

		if rpc[meth]
			rpc[meth].apply(runner.page,params)
			return

		if str == 'mouse.down'
			runner.pup.mousedown++

		if str == 'mouse.up'
			runner.pup.mousedown--

		while path.length
			receiver = receiver[path.shift()]

		if runner.page
			runner.meta.push('pup')

		# await runner.waitForSelector('test-runner')
		return receiver[meth].apply(receiver,params)

	runner.on 'console' do(msg)
		let params = msg.args().map do |x|
			parseRemoteObject(x.remoteObject())

		let str = String(params[0]) # .replace(':','')
		if runner.HANDLERS and runner.HANDLERS[str]
			runner.HANDLERS[str](*params.slice(1))

		if msg.type() == 'debug'
			console.debug.apply(console, params)

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
			'spec:log': do(e)
				print e

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

			'spec:done': do(e)
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
		catch e
			console.log 'timed out for',page.path,e
			page.error ||= e

		if page.error
			console.log "evaluate the loading now!"

def serve
	let statics = {}

	let copts = {
		platform: 'browser'
		raiseErrors: false
	}

	let cmpjs = {body: fs.readFileSync(path.resolve(__dirname,'..','dist','compiler.mjs'),'utf-8')}
	let specraw = import.text('../src/utils/spec.imba')
	let std = import.text('../dist/std.mjs')

	statics["/compiler.js"] = cmpjs.body
	statics["/imba.js"] = import.web('../index.imba').body
	statics["/imba.runtime.js"] = fs.readFileSync(path.resolve(__dirname,'..','src','imba','runtime.mjs'),'utf-8')
	statics["/spec.js"] = compiler.compile(specraw,Object.assign({sourcePath: 'spec'},copts)).js
	statics["/std.js"] = std

	server = http.createServer do(req,res)
		if let file = statics[req.url]
			res.setHeader("Content-Type", "application/javascript")
			res.write(file)
			return res.end!

		let src = path.join(__dirname,"..","test",req.url)
		let name = path.basename(src)
		let ext = src.split('.').pop!
		let barename = name.replace(/(\.(js|html|imba))+$/,'')
		let entry = pages[src.replace(/(\.(js|html|imba))+$/,'.imba')]

		if ext == 'html'
			let importmap = {
				imports: {
					'imba': '/imba.js',
					# 'imba/runtime': '/imba.js',
					'imba/runtime': '/imba.runtime.js',
					'imba/compiler': '/compiler.js',
					'imba/spec': '/spec.js'
					'imba/std': '/std.js'
				}
			}
			let html = """
				<html><head>
				<meta charset='UTF-8'>
				<script type='importmap'>{JSON.stringify(importmap)}</script>
				<script src='/imba.js' type='module'></script>
				<script src='/spec.js' type='module'></script>
				<script src='/std.js' type='module'></script>
				</head><body>
				<script src='./{barename}.imba' type='module'></script>
				<script type='module'>SPEC.run();</script>
				</body></html>
			"""

			res.write(html)
			return res.end!

		let opts = Object.assign({},copts,{sourcePath: src})

		if entry

			let body = entry.body

			# look for expected crashes
			let expect = []
			body.replace(/\# @(error|warn) ([^\s]+)(:? ([^\n]+))?/g) do(m,typ,locs,message)
				expect.push([typ,locs,message])
			let js = ''

			res.writeHead(200, { 'Content-Type': 'application/javascript' })

			let inlineTest = do(name,bool,msg)
				let pars = JSON.stringify(message: msg)
				'globalThis.test("'+name+'",function(){globalThis.ok(' + (bool ? 'true' : 'false') + "," + pars + ')});\n'
			try
				body = body.replace("import 'imba/test/spec'","")
				let output = compiler.compile(body,opts)

				js = output.js

				if output.errors.length
					js = ''

				for [typ,locs,message],i in expect
					let diags = typ == 'warn' ? output.warnings : output.errors
					let hit = null
					let msg = "expect {typ} at {locs}"
					for diag in diags
						let loc = "{diag.range.start}-{diag.range.end}"
						if loc == locs
							diag.#expected = yes
							hit ||= diag
					# let pars = JSON.stringify(message: msg)
					js += inlineTest(message or "{typ}{i}",hit,msg)
					# js += 'globalThis.test(function(){globalThis.ok(' + (hit ? 'true' : 'false') + "," + pars + ')});'

				if output.errors.some(do !$1.#expected)
					js += inlineTest("compile",false,"file did not compile")
					# js += ';\nglobalThis.test(function(){globalThis.ok(' + (hit ? 'true' : 'false') + "," + pars + ')})'

			catch e
				js += inlineTest("compile",false,"file did not compile")

			res.write js
		else
			if fs.existsSync(src) and ext == 'imba'
				let compiled = compiler.compile(fs.readFileSync(src,'utf-8'),opts)
				statics[req.url] = compiled.js
				res.setHeader("Content-Type", "application/javascript")
				res.write(compiled.js)
			else
				# console.warn "NOT HANDLING REQUEST {src}"
				res.write('')
		res.end!

	new Promise do(resolve)
		server.listen(PORT) do resolve(server)

def main

	let now = Date.now()
	let server = await serve!
	let testFolder = path.resolve(__dirname,"..","test","apps")
	let entries = getFiles(testFolder).filter do |item|
		item = item.replace(/\\/g,'/')
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

	console.log "running {entrypoints.length} tests"

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

	if !options.debug
		process.exit(failed.length ? 1 : 0)

main()
