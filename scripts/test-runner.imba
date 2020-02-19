var puppeteer = require "puppeteer"
var path = require "path"
var fs = require "fs"
var compiler = require "../dist/compiler"
var helpers = compiler.helpers
var browser

def getFiles(dir, o = [])
	fs.readdirSync(dir, withFileTypes: true).filter do |src|
		let fullpath = path.resolve(dir, src.name)
		if fullpath.match(/\.imba$/)
			o.push(fullpath)
		elif src.isDirectory()
			getFiles(fullpath,o)
	return o
	
var options = helpers.parseArgs(process.argv.slice(2),{
	alias: {g: 'grep',c: 'concurrent'}
})

var consoleMapping = {
	startGroup: 'group'
	endGroup: 'groupEnd'
}

var tests = []

var parseRemoteObject = do |obj|
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

def run item
	Promise.new do |resolve,reject|

		var test = {
			path: item
			log: []
		}

		var print = do |...params|
			test.log.push(params)
			unless options.concurrent
				console.log(*params)

		var progress = do |out|
			if options.concurrent
				process.stdout.write(out or ".")
				# console.log(*params)
		# var src =  "http://localhost:1234/index.html#{item}"
		var root = path.resolve(__dirname,"..","test")
		var src =  "file://{root}/index.html#{item}"
		var page = await browser.newPage()

		var handlers =
			'example:loaded': do |e|
				page.evaluate(do await SPEC.run())

			'spec:done': do |e|
				test.results = e
				resolve(test) #  : reject(test)

			'spec:test': do |e|
				e.file = item
				tests.push(e)
				let color = e.failed ? 'red' : 'green'
				let prefix = e.failed ? '✘' : '✔'
				print helpers.ansi.f("{color}Bright","  {prefix} {e.name}")
				progress(helpers.ansi.f("{color}Bright",prefix))

			'spec:warn': do |e|
				print helpers.ansi.f('yellowBright',"    - {e.message}")

			'spec:fail': do |e|
				print helpers.ansi.f('redBright',"    ✘ {e.message}")

			'page:error': do |e|
				print(helpers.ansi.f('redBright',"error {e.message}"))
				test.error = e
				resolve(test)

		await page.exposeFunction('puppy') do |str,params|
			# console.log('puppy', str,params)
			let receiver = page
			let path = str.split('.')
			let meth = path.pop()

			if handlers[meth]
				return handlers[meth].apply(self,params)

			while path.length
				receiver = receiver[path.shift()]
			# console.log 'calling',meth,params
			return receiver[meth].apply(receiver,params)

		print(helpers.ansi.bold(item) + ' ' + src)

		page.on 'load' do |msg|
			self

		page.on 'console' do |msg|
			# console.log("page on console",msg._type,msg)
			var params = msg.args().filter(Boolean).map do |x|
				parseRemoteObject(x._remoteObject)

			let str = String(params[0]) # .replace(':','')
			if handlers[str]
				handlers[str](*params.slice(1))

			if options.console
				var key = consoleMapping[msg.type()] or msg.type()
				console[key].apply(console, params)

		page.goto(src)


def main
	# console.log('run with options',options)
	# browser = await puppeteer.launch(ignoreDefaultArgs: true,args: ['--disable-web-security'], headless: true)
	var now = Date.now()
	var args = [
		'--disable-web-security',
		'--allow-file-access-from-file',
		'--no-sandbox',
		'--enable-local-file-accesses'
	]

	browser = await puppeteer.launch(args: args, headless: true)

	var testFolder = path.resolve(__dirname,"..","test","apps")
	var entries = getFiles(testFolder).filter do |item|
		options.main ? (item.indexOf(options.main) >= 0) : (item.indexOf('tmp/') == -1)

	var files = entries.map(|v| v.replace(testFolder,"apps"))

	if options.concurrent
		var promises = for item in files
			run(item)

		var results = await Promise.all(promises)

		for result in results
			for row in result.log
				console.log(*row)
			console.log('')
	else
		for item in files
			try
				var res = await run(item)
			catch e
				self
		console.log('')

	var passed = tests.filter do !$1.failed
	var failed = tests.filter do $1.failed

	console.log("{tests.length} tests took {Date.now() - now}ms")

	if passed.length
		console.log helpers.ansi.f('greenBright',"{passed.length} test{passed.length == 1 ? '' : 's'} passed")

	if failed.length
		console.log helpers.ansi.f('redBright',"{failed.length} test{failed.length == 1 ? '' : 's'} failed")
		console.log "The following file(s) failed:\n", (failed.map do "x {$1.file}").join('\n')
		process.exit(1)
	else
		process.exit(0)

main()