const puppy = window.puppy

const pup = do(ns,...params)
	if ns.match(/^spec/) and puppy
		puppy(ns,params)
		return

	# return
	if puppy
		await puppy(ns,params)

class PupKeyboard
	def type text, options = {}
		await puppy('keyboard.type',[text,options])
	def down text, options = {}
		await puppy('keyboard.down',[text,options])
	def up text, options = {}
		await puppy('keyboard.up',[text,options])
	def press text, options = {}
		await puppy('keyboard.press',[text,options])

class PupMouse
	def type text, options
		puppy('keyboard.type',[text,options])

const TERMINAL_COLOR_CODES =
	bold: 1
	underline: 4
	reverse: 7
	black: 30
	red: 31
	green: 32
	yellow: 33
	blue: 34
	magenta: 35
	cyan: 36
	white: 37

const fmt = do(code,string)
	return string.toString! if console.group
	code = TERMINAL_COLOR_CODES[code]
	let resetStr = "\x1B[0m"
	let resetRegex = /\x1B\[0m/g
	let codeRegex = /\x1B\[\d+m/g
	let tagRegex = /(<\w+>|<A\d+>)|(<\/\w+>|<A\d+>)/i
	let numRegex = /\d+/
	let str = ('' + string).replace(resetRegex, "{resetStr}\x1B[{code}m") # allow nesting
	str = "\x1B[{code}m{str}{resetStr}"
	return str


class SpecComponent

	def log ...params
		root.console.log(*params)

	def emit ev, pars
		imba.emit(self,ev,pars)

	get root
		parent ? parent.root : self


global class Spec < SpecComponent
	
	get keyboard
		_keyboard ||= new PupKeyboard

	get mouse
		_mouse ||= new PupMouse
	
	def click sel, trusted = yes
		if puppy and trusted
			console.log "click with puppeteer!!",sel
			try
				await puppy('click',[sel])
			catch e
				console.log 'error from pup click!'
		else

			let el = document.querySelector(sel)
			el && el.click!
		await tick!

	def tick commit = true
		imba.commit! if commit
		await imba.scheduler.promise
		observer.takeRecords!

	def wait time = 100
		new Promise(do(resolve) setTimeout(resolve,time))

	def constructor
		super()
		console = console
		blocks = []
		assertions = []
		stack = [context = self]
		tests = []
		warnings = []
		state = {info: [], mutations: [], log: []}

		observer = new MutationObserver do(muts)
			context.state.mutations.push(...muts)

		self

	get fullName
		""

	def eval block, ctx
		stack.push(context = ctx)
		let res = block(context.state)
		let after = do
			stack.pop!
			context = stack[stack.length - 1]
			observer.takeRecords!
			self

		let err = do(e)
			ctx.error = e
			after!

		if res and res.then
			return res.then(after,err)
		else
			after!
			return Promise.resolve(self)

	def describe name, blk
		blocks.push new SpecGroup(name, blk, self)
	
	def test name, blk
		if name isa Function
			blk = name
			name = context.blocks.length + 1
		context.blocks.push new SpecExample(name, blk, context)

	def eq actual, expected, options
		new SpecAssert(context, actual,expected, options)
	
	def step i = 0, &blk
		Spec.CURRENT = self
		let block = blocks[i]
		return self.finish! unless block
		imba.once(block,'done') do self.step(i+1)
		block.run!

	def run
		new Promise do(resolve,reject)
			pup("spec:start",{})
			let prevInfo = console.info
			observer.observe(document.body,{
				attributes: true,
				childList: true,
				characterData: true,
				subtree: true
			})
			console.log 'running spec'
			console.info = do(...params)
				context.state.info.push(params)
				context.state.log.push(params[0])

			imba.once(self,'done') do
				observer.disconnect!
				console.info = prevInfo
				resolve!
			await tick!
			self.step(0)

	def finish
		let ok = []
		let failed = []

		for test in tests
			test.failed ? failed.push(test) : ok.push(test)
		
		let logs = [
			fmt('green',"{ok.length} OK")
			fmt('red',"{failed.length} FAILED")
			"{tests.length} TOTAL"
		]

		console.log logs.join(" | ")

		let exitCode = (failed.length == 0 ? 0 : 1)
		emit('done', [exitCode])
		pup("spec:done",{
			failed: failed.length,
			passed: ok.length,
			warnings: warnings.length
		})

global class SpecGroup < SpecComponent

	def constructor name, blk, parent
		super()
		parent = parent
		name = name
		blocks = []
		SPEC.eval(blk,self) if blk
		self

	get fullName
		"{parent.fullName}{name} > "

	def describe name, blk
		blocks.push new SpecGroup(name, blk, self)
	
	def test name, blk
		blocks.push new SpecExample(name, blk, self)

	def run i = 0
		start! if i == 0
		let block = blocks[i]
		return finish! unless block
		imba.once(block,'done') do run(i+1)
		block.run! # this is where we wan to await?
	
	def start
		emit('start', [self])

		if console.group
			console.group(name)
		else
			console.log "\n-------- {name} --------"
		
	def finish
		console.groupEnd(name) if console.groupEnd
		emit('done', [self])

global class SpecExample < SpecComponent

	def constructor name, block, parent
		super()
		parent = parent
		evaluated = no
		name = name
		block = block
		assertions = []
		root.tests.push(self)
		state = {info: [], mutations: [], log: []}
		self

	get fullName
		"{parent.fullName}{name}"

	def run
		start!
		# does a block really need to run here?
		try
			let promise = (block ? SPEC.eval(block, self) : Promise.resolve({}))
			let res = await promise
		catch e
			console.log "error from run!",e
			error = e
		evaluated = yes
		finish!

	def start
		emit('start')
		console.group(fullName)
	
	def finish
		failed ? fail! : pass!
		let fails = assertions.filter do $1.critical
		pup("spec:test", name: fullName, failed: failed, messages: fails.map(do $1.toString!), error: error && error.message )

		for ass in assertions
			if ass.failed
				if ass.options.warn
					pup("spec:warn",message: ass.toString!)
				else
					pup("spec:fail",message: ass.toString!)
		console.groupEnd(fullName)
		emit('done',[self])

	def fail
		console.log("%c✘ {fullName}", "color:orangered",state)

	def pass
		console.log("%c✔ {fullName}", "color:forestgreen")

	get failed
		error or assertions.some do(ass) ass.critical

	get passed
		!failed!

global class SpecAssert < SpecComponent

	def constructor parent,actual,expected,options = {}
		super()

		parent = parent
		expected = expected
		actual = actual
		options = options
		message = (options.message || options.warn) || "expected %2 - got %1"
		parent.assertions.push(self)
		self.compare(expected,actual) ? pass! : fail!
		self

	def compare a,b
		if a === b
			return true
		if a isa Array and b isa Array
			return false if a.length != b.length
			for item,i in a
				return false unless self.compare(item,b[i])
			return JSON.stringify(a) == JSON.stringify(b)
		return false

	get critical
		failed && !options.warn
	
	def fail
		failed = yes
		if options.warn
			root.warnings.push(self)
		self

	def pass
		passed = yes
		self

	def toString
		if failed and typeof message == 'string'
			let str = message
			str = str.replace('%1',actual)
			str = str.replace('%2',expected)
			return str
		else
			"failed"

window.spec = global.SPEC = new Spec

# global def p do console.log(*arguments)
global def describe name, blk do SPEC.context.describe(name,blk)
global def test name, blk do SPEC.test(name,blk)
global def eq actual, expected, o do  SPEC.eq(actual, expected, o)
global def ok actual, o do SPEC.eq(!!actual, true, o)
	
global def eqcss el, match,sel
	if typeof el == 'string'
		el = document.querySelector(el)
	elif el isa Element and !el.parentNode
		document.body.appendChild(el)
	if typeof sel == 'string'
		el = el.querySelector(sel)	
	elif typeof sel == 'number'
		el = el.children[sel]

	let style = window.getComputedStyle(el)

	if typeof match == 'number'
		match = {fontWeight: String(match)}

	for own k,expected of match
		let real = style[k]
		if expected isa RegExp
			global.ok real.match(expected)
			unless real.match(expected)
				console.log real,'did no match',expected
		else
			global.eq(real,expected)
	return

window.onerror = do(e)
	console.log('page:error',{message: (e.message or e)})

window.onunhandledrejection = do(e)
	console.log('page:error',{message: e.reason.message})