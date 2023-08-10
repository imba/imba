import puppeteer from "puppeteer"
import fs from 'fs'
import np from 'path'

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

let consoleMapping = {
	startGroup: 'group'
	endGroup: 'groupEnd'
}

let parseRemoteObject = do(obj)
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

	if close
		runner.close!
	else
		runners.push(runner)
	startNextTest!

let promise = null

export def start
	promise ||= new Promise do(resolve)
		let browser = await puppeteer.launch(args: args, headless: true)
		resolve(browser)

export default def page url
	let pup = await start!
	let page = await pup.newPage!

	page.setViewport({width: 800, height: 600})
	page.nr = counter++
	page.meta = []
	# let t = Date.now!
	page.exposeFunction('puppy') do(str,params)
		let rpc = page.HANDLERS
		let receiver = page
		let path = str.split('.')
		let meth = path.pop()

		unless rpc
			return

		if rpc[meth]
			rpc[meth].apply(runner.page,params)
			return

		while path.length
			receiver = receiver[path.shift()]

		if page.page
			page.meta.push('pup')

		# await runner.waitForSelector('test-runner')
		return receiver[meth].apply(receiver,params)

	false and page.on 'console' do(msg)
		console.log("page on console",msg._type)
		let params = msg.args().filter(Boolean).map do |x|
			parseRemoteObject(x._remoteObject)

		let str = String(params[0]) # .replace(':','')
		if page.HANDLERS and page.HANDLERS[str]
			page.HANDLERS[str](*params.slice(1))

		if msg._type == 'debug'
			console.debug.apply(console, params)

		# if options.console
		# 	let key = consoleMapping[msg.type()] or msg.type()
		# 	console[key].apply(console, params)

	return page
