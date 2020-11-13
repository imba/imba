var puppeteer = require "puppeteer"
var path = require "path"
var fs = require "fs"
var compiler = require "../dist/compiler"
var helpers = compiler.helpers
var browser

var args = [
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

def getFiles(dir, o = [])
	fs.readdirSync(dir, withFileTypes: true).filter do |src|
		let fullpath = path.resolve(dir, src.name)
		if fullpath.match(/\.imba$/)
			o.push(fullpath)
		elif src.isDirectory()
			getFiles(fullpath,o)
	return o
	
let options = helpers.parseArgs(process.argv.slice(2),{
	alias: {g: 'grep',c: 'concurrent'}
})

let consoleMapping = {
	startGroup: 'group'
	endGroup: 'groupEnd'
}

let parseRemoteObject = do |obj|
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
	let next = pages.find(do !$1.state)

	if next
		next.state = 'running'
		setTimeout(&,0) do run(next)

	elif pages.every(do $1.state == 'done')
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

		await runner.waitForSelector('test-runner')
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
		let src =  "file://{root}/index.html?{page.nr}#{page.path}"
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
			# await runner.waitFor(0)
		catch e
			console.log 'timed out for',page.path,e
			page.error ||= e

		unless page.error
			runner.evaluate(do SPEC && SPEC.run!)


def main
	let now = Date.now()
	let testFolder = path.resolve(__dirname,"..","test","apps")
	let entries = getFiles(testFolder).filter do |item|
		options.main ? (item.indexOf(options.main) >= 0) : !item.match(/(examples|tmp)\//)

	let files = entries.map(|v| v.replace(testFolder,"apps"))
	
	pages = files.map do(src,i)
		{
			path: src,
			state: null,
			log: []
			tests: []
			failed: []
			nr: i
		}
	
	options.verbose = true if pages.length < 3

	let concurrency = Math.min(options.concurrent ? 3 : 1,pages.length)
	
	while --concurrency >= 0
		startNextTest!
	
	await donePromise
	
	if options.concurrent and options.verbose
		console.log('')
		for page in pages
			for row in page.result.log
				console.log(*row)
			console.log('')

	let passed = tests.filter do !$1.failed
	let failed = tests.filter do $1.failed
	let crashed = pages.filter do $1.error
	console.log('')
	console.log("{tests.length} tests took {Date.now() - now}ms")

	if passed.length
		console.log helpers.ansi.f('greenBright',"{passed.length} test{passed.length == 1 ? '' : 's'} passed")

	if failed.length
		console.log helpers.ansi.f('redBright',"{failed.length} test{failed.length == 1 ? '' : 's'} failed")
		console.log "The following file(s) failed:"
		for page in pages when page.failed.length
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
	
	
	process.exit(failed.length ? 1 : 0)

main()