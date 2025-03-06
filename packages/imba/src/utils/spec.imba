const puppy = global.puppy

const KeyMap = {
	ctrl: 'Control'
	shift: 'Shift'
	meta: 'Meta'
	alt: 'Alt'
	left: 'ArrowLeft'
	right: 'ArrowRight'
	esc: 'Escape'
	enter: 'Enter'
	tab: 'Tab'
	space: 'Space'
	up: 'ArrowUp'
	down: 'ArrowDown'
	del: 'Backspace'

}

const pup = do(ns,...params)
	if ns.match(/^spec/) and puppy
		puppy(ns,params)
		return

	if puppy
		await puppy(ns,params)

class PupKeyboard

	def type text, options = {}
		await puppy('keyboard.type',[text,options])

	def down key, options = {}
		key = KeyMap[key] or key
		await puppy('keyboard.down',[key,options])
	def up key, options = {}
		key = KeyMap[key] or key
		await puppy('keyboard.up',[key,options])

	def press key, options = {}
		key = KeyMap[key] or key
		await puppy('keyboard.press',[key,options])

	def hold key, block
		key = KeyMap[key] or key
		await down(key)
		await block()
		await up(key)

class PupMouse
	def type text, options
		puppy('keyboard.type',[text,options])

	def down x = 0, y = 0, cb = null
		await move(x,y)
		let res = await puppy('mouse.down',[])
		if cb isa Function
			res = await cb()
			await puppy('mouse.up',[])
		return res

	def move x = 0, y = 0
		await puppy('mouse.move',[x,y])

	def up x = 0, y = 0
		await puppy('mouse.up',[])

	def click x = 0, y = 0, o = {}
		await puppy('mouse.click',[x,y,o])

	def touch ...coords
		let first = coords.shift!
		await down(first[0],first[1])
		for item in coords
			await move(item[0],item[1])
		await up!

class PupPage

	def setViewport o = {}
		await puppy('setViewport',[o])

class SpecComponent

	def log ...params
		root.console.log(*params)

	def emit ev, pars
		imba.emit(self,ev,pars)

	get root
		parent ? parent.root : self

def isPlainObject val
	typeof val == 'object' and val and Object.getPrototypeOf(val) == Object.prototype

def createChainable keys,fn
	let create
	create = do(ctx)
		const chain = do(...args) fn.apply(ctx,args)
		Object.assign(chain,fn)
		for key in keys
			Object.defineProperty(chain,key,{
				get: do create({...ctx, [key]: true})
			})
		chain.modifiers = ctx

		return chain
	let chain = create({})
	chain.fn = fn
	return chain

global class Spec < SpecComponent

	get keyboard
		_keyboard ||= new PupKeyboard

	get mouse
		_mouse ||= new PupMouse

	get page
		_page ||= new PupPage

	def click sel, trusted = yes, options = {}
		if typeof trusted == 'object'
			options = trusted
			trusted = yes

		if puppy and trusted
			try
				await puppy('click',[sel,options])
			catch e
				console.log 'error from pup click!'
		else
			let el = document.querySelector(sel)
			el && el.click!
		await tick!

	def tick commit = true
		imba.commit! if commit
		await imba.scheduler.promise
		observer..takeRecords!

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
		state = {info: [], mutations: [], log: [],commits: 0}

		if $web$
			observer = new MutationObserver do(muts)
				context.state.mutations.push(...muts)

		# test = test.bind(self)

		test = createChainable(['skip','todo','only','client','node','web','both','concurrent','fails'],test)
		describe = createChainable(['skip','todo','only','client','node','web','both','concurrent'],describe.bind(self))
		self

	get fullName
		""

	def eval block, ctx
		stack.push(context = ctx)
		let res = block(context.state)
		let after = do
			stack.pop!
			context = stack[stack.length - 1]
			observer..takeRecords! if $web$
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
		let options = this
		let that = SPEC

		that.context.blocks.push new SpecGroup(name, blk, that.context,options)

	def test name, blk
		let options = this
		let that = SPEC
		let inline = that.stack[-1] isa SpecExample

		if name isa Function
			blk = name
			name = inline ? "" : (that.blocks.length + 1)

		if inline
			return blk()

		that.context.blocks.push new SpecExample(name, blk, that.context,options)

	def before name, blk
		if name isa Function
			name = 'setup'
			blk = name
		let blocks = context.blocks[name] ||= []
		blocks.push blk

	def eq actual, expected, options
		new SpecAssert(context, actual,expected, options)

	def step i = 0
		Spec.CURRENT = self
		let block = blocks[i]
		return self.finish! unless block
		imba.once(block,'done') do self.step(i+1)
		block.run!

	def run o = {}
		new Promise do(resolve,reject)
			pup("spec:start",{})
			let prevInfo = console.info
			if typeof o.only == 'string'
				blocks = blocks.filter do $1.name.indexOf(o.only) >= 0

			let fn = do context.state.commits++
			imba.scheduler.on('commit',fn)
			observer..observe(document.body,{
				attributes: true,
				childList: true,
				characterData: true,
				subtree: true
			})

			console.info = do(...params)
				context.state.info.push(params)
				context.state.log.push(params[0])

			imba.once(self,'done') do
				observer..disconnect!
				console.info = prevInfo
				imba.scheduler.un('commit',fn)
				resolve!
			await tick!
			self.step(0)

	def finish
		let ok = []
		let failed = []

		for test in tests
			test.failed ? failed.push(test) : ok.push(test)

		let logs = [
			"{ok.length} OK"
			"{failed.length} FAILED"
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

	def constructor name, blk, parent, options
		super()
		options = options
		parent = parent
		name = name
		blocks = []
		blk = blk

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
		if blocks.setup
			for pre in blocks.setup
				await pre()

		block.run!

	def traverse
		if #traversed =? yes
			SPEC.eval(blk,self) if blk
		self

	def start
		emit('start', [self])
		traverse!
		# SPEC.eval(blk,self) if blk

		if console.group
			console.group(name)
		else
			console.log "\n-------- {name} --------"

	def finish
		console.groupEnd(name) if console.groupEnd
		if parent == SPEC
			cleanup!
		emit('done', [self])

	def cleanup
		if $web$
			document.body.innerHTML = ''
		await imba.commit!

global class SpecExample < SpecComponent

	def constructor name, block, parent, options
		super()
		parent = parent
		evaluated = no
		options = options
		name = name
		block = block
		assertions = []
		root.tests.push(self)
		state = {info: [], mutations: [], log: [], commits: 0}
		self

	get fullName
		"{parent.fullName}{name}"

	def run
		start!
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
		return self

	def toJSON
		{
			failed: failed
			messages: assertions.filter(do $1.critical).map(do $1.toString!)
			error: error && error.message
			#error: error
		}

	def fail
		console.log "✘ {fullName}".red, state, error

	def pass
		console.log "✔ {fullName}".green

	get failed
		error or assertions.some do(ass) ass.critical

	get passed
		!failed!

global class SpecAssert < SpecComponent

	def constructor parent,actual,expected,options = {}
		super()
		if typeof options == 'string'
			options = {message: options}

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

		if (a isa Array and b isa Array) or (a isa Uint8Array and b isa Uint8Array)
			return false if a.length != b.length

			for item,i in a
				return false unless self.compare(item,b[i])
			return true

		if isPlainObject(a) and isPlainObject(b)
			# Not caring about order of keys
			for own k,v of a
				return false unless compare(v,b[k])
			return true

		# deep similar
		return false

	get critical
		failed && !options.warn

	def fail
		failed = yes
		if options.warn
			root.warnings.push(self)
		console.log(toString!.red,[expected,actual])
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
		elif failed
			"failed"
		else
			"ok"

const spec = global.spec = global.SPEC = new Spec

global.describe = spec.describe
global.test = spec.test

global def before name, blk do spec.before(name,blk)
global def eq actual, expected, o\any? do  spec.eq(actual, expected, o)
global def ok actual, o\any? do spec.eq(!!actual, true, o)
global def nok actual, o\any? do spec.eq(!!actual, false, o)

global def eqcss el, match,sel,o = {}
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
			global.ok(real.match(expected),Object.assign(message: "Expected {k} {real} to match {expected}",o))
		else
			global.eq(String(real),String(expected),Object.assign(message: "expected {k} == %2 (was %1)",o))
	return

global.onerror = do(e)
	console.log('page:error',{message: (e.message or e)})

global.onunhandledrejection = do(e)
	console.log('page:error',{message: e.reason.message})
