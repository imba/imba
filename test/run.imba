var puppeteer = require "puppeteer"
var path = require "path"
var fs = require "fs"
var helpers = require "../lib/compiler/helpers"
var Imba = {}
var browser


var options = helpers.parseArgs(process.argv.slice(2),{
	alias: {g: 'grep',c: 'console'}
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
		var src =  "http://localhost:8125/index.html#{item}"
		var page = await browser.newPage()

		console.log(helpers.ansi.bold(item) + ' ' + src)

		var handlers =
			'example:loaded': do |e|
				page.evaluate(do await SPEC.run())

			'spec:done': do |e|
				# console.log("spec done", e)
				e.failed == 0 ? resolve(e) : reject(e)

			'spec:test': do |e|
				
				e.file = item
				tests.push(e)
				if e.failed
					console.log helpers.ansi.f(:redBright,"  ✘ {e.name}")
				else
					console.log helpers.ansi.f(:greenBright,"  ✔ {e.name}")

			'spec:warn': do |e|
				console.log helpers.ansi.f(:yellowBright,"    - {e.message}")

			'spec:fail': do |e|
				console.log helpers.ansi.f(:redBright,"    ✘ {e.message}")

			'page:error': do |e|
				console.log helpers.ansi.f(:redBright,"error {e.message}")
				reject(e)
					
				

		page.on 'load' do |msg|
			# console.log("loaded page",item)
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
	browser = await puppeteer.launch()

	var entries = fs.readdirSync(path.resolve(__dirname,"apps"), withFileTypes: true)
	entries = entries.filter do |src|
		return no unless src.name.indexOf('.imba') >= 0
		if options.main
			return no unless src.name.indexOf(options.main) >= 0
		return yes

	var files = entries.map(|v| "apps/{v.name}" )
	# console.log "run examples",entries,tests
	# return

	for item in files
		try
			var res = await run(item)
		catch e
			# console.warn "tests in {item} failed",e.failed
			self
		console.log('')

	var passed = tests.filter do !$1.failed
	var failed = tests.filter do $1.failed

	if passed.length
		console.log helpers.ansi.f(:greenBright,"{passed.length} test{passed.length == 1 ? '' : 's'} passed")

	if failed.length
		console.log helpers.ansi.f(:redBright,"{failed.length} test{failed.length == 1 ? '' : 's'} failed")
		process.exit(1)
	else
		process.exit(0)

main()