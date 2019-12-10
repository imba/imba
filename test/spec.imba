var puppy = window.puppy

var pup = do |ns,*params|
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

var TERMINAL_COLOR_CODES =
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

var fmt = do |code,string|
	return string.toString() if console.group
	code = TERMINAL_COLOR_CODES[code]
	var resetStr = "\x1B[0m"
	var resetRegex = /\x1B\[0m/g
	var codeRegex = /\x1B\[\d+m/g
	var tagRegex = /(<\w+>|<A\d+>)|(<\/\w+>|<A\d+>)/i
	var numRegex = /\d+/
	var str = ('' + string).replace resetRegex, "{resetStr}\x1B[{code}m" # allow nesting
	str = "\x1B[{code}m{str}{resetStr}"
	return str



class SpecComponent

	def log *params
		@root.console.log(*params)

	def emit ev, pars
		imba.emit(self,ev,pars)

	get root
		@parent ? @parent.root : self


global class Spec < SpecComponent

	get puppeteer

	
	get keyboard
		#keyboard ||= PupKeyboard.new

	get mouse
		#mouse ||= PupMouse.new
	
	def click sel, trusted = yes
		if puppy and trusted
			# console.log "click with puppeteer!!",sel
			await puppy('click',[sel])
		else

			let el = document.querySelector(sel)
			el && el.click()
		await @tick()

	def tick commit = true
		imba.commit() if commit
		await imba.scheduler.promise
		@observer.takeRecords()

	def initialize
		@console = console
		@blocks = []
		@assertions = []
		@stack = [@context = self]
		@tests = []
		@warnings = []
		@state = {info: [], mutations: [], log: []}

		@observer = MutationObserver.new do |muts|
			@context.state.mutations.push(*muts)

		self

	get fullName
		""

	def eval block, ctx
		@stack.push(@context = ctx)
		var res = block(@context.state)
		var after = do
			@stack.pop()
			@context = @stack[@stack.length - 1]
			@observer.takeRecords()
			self

		var err = do |e|
			ctx.error = e
			after()

		if res and res.then
			return res.then(after,err)
		else
			after()
			return Promise.resolve(self)

	def describe name, blk
		@blocks.push SpecGroup.new(name, blk, self)
	
	def test name, blk
		if name isa Function
			blk = name
			name = @blocks.length + 1
		@blocks.push SpecExample.new(name, blk, self)

	def eq actual, expected, options
		SpecAssert.new(@context, actual,expected, options)
	
	def step i = 0, &blk
		Spec.CURRENT = self
		var block = @blocks[i]
		return self.finish() unless block
		imba.once(block,'done') do step(i+1)
		block.run()

	def run
		Promise.new do |resolve,reject|
			var prevInfo = console.info
			@observer.observe(document.body,{
				attributes: true,
				childList: true,
				characterData: true,
				subtree: true
			})
			console.log 'running spec'
			console.info = do |*params|
				@context.state.info.push(params)
				@context.state.log.push(params[0])

			imba.once(self,'done') do
				@observer.disconnect()
				console.info = prevInfo
				resolve()
			step(0)

	def finish
		var ok = []
		var failed = []

		for test in @tests
			test.failed ? failed.push(test) : ok.push(test)
		
		var logs = [
			fmt(:green,"{ok.length} OK")
			fmt(:red,"{failed.length} FAILED")
			"{@tests.length} TOTAL"
		]

		console.log logs.join(" | ")

		pup("spec:done",{
			failed: failed.length,
			passed: ok.length,
			warnings: @warnings.length
		})
		var exitCode = (failed.length == 0 ? 0 : 1)
		@emit(:done, [exitCode])

global class SpecGroup < SpecComponent

	def initialize name, blk, parent
		@parent = parent
		@name = name
		@blocks = []
		SPEC.eval(blk,self) if blk
		self

	get fullName
		"{@parent.fullName}{@name} > "

	def describe name, blk
		@blocks.push SpecGroup.new(name, blk, self)
	
	def test name, blk
		@blocks.push SpecExample.new(name, blk, self)

	def run i = 0
		@start() if i == 0
		var block = @blocks[i]
		return @finish() unless block
		imba.once(block,'done') do @run(i+1)
		block.run() # this is where we wan to await?
	
	def start
		@emit(:start, [self])

		if console.group
			console.group(@name)
		else
			console.log "\n-------- {@name} --------"
		
	def finish
		# console.groupEnd() if console.groupEnd
		@emit(:done, [self])

global class SpecExample < SpecComponent

	def initialize name, block, parent
		@parent = parent
		@evaluated = no
		@name = name
		@block = block
		@assertions = []
		@root.tests.push(self)
		@state = {info: [], mutations: [], log: []}
		self

	get fullName
		"{@parent.fullName}{@name}"

	def run
		@start()
		# does a block really need to run here?
		var promise = (@block ? SPEC.eval(@block, self) : Promise.resolve({}))
		try
			var res = await promise
		catch e
			console.log "error from run!",e
		@evaluated = yes
		@finish()

	def start
		@emit(:start)
		console.group(@fullName)
	
	def finish
		@failed ? @fail() : @pass()
		pup("spec:test", name: @fullName, failed: @failed)
		for ass in @assertions
			if ass.failed
				if ass.options.warn
					pup("spec:warn",message: ass.toString())
				else
					pup("spec:fail",message: ass.toString())
		console.groupEnd(@fullName)
		@emit(:done,[self])

	def fail
		console.log("%c✘ {@fullName}", "color:orangered",@state)

	def pass
		console.log("%c✔ {@fullName}", "color:forestgreen")
		# @print("✔")

	get failed
		@error or @assertions.some do |ass| ass.critical

	get passed
		!@failed()

global class SpecAssert < SpecComponent

	def initialize parent,actual,expected,options = {}
		@parent = parent
		@expected = expected
		@actual = actual
		@options = options
		@message = (options.message || options.warn) || "expected %2 - got %1"
		parent.assertions.push(self)
		compare(@expected,@actual) ? @pass() : @fail()
		self

	def compare a,b
		if a === b
			return true
		if a isa Array and b isa Array
			return JSON.stringify(a) == JSON.stringify(b)
		return false

	get critical
		@failed && !@options.warn
	
	def fail
		@failed = yes
		if @options.warn
			@root.warnings.push(self)

		# console.log("failed",self,@parent.state)	
		self

	def pass
		@passed = yes
		self

	def toString
		if @failed and @message isa String
			let str = @message
			str = str.replace('%1',@actual)
			str = str.replace('%2',@expected)
			return str
		else
			"failed"

window.spec = SPEC = Spec.new

# global def p do console.log(*arguments)
global def describe name, blk do SPEC.context.describe(name,blk)
global def test name, blk do SPEC.context.test(name,blk)
global def eq actual, expected, o do  SPEC.eq(actual, expected, o)
global def ok actual, o do SPEC.eq(!!actual, true, o)


