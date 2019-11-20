
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
		Imba.emit(self,ev,pars)
		# emitting to some spec

	get root
		@parent ? @parent.root : self

global class Spec < SpecComponent

	def initialize
		@console = console
		@blocks = []
		@assertions = []
		@stack = [@context = self]
		@tests = []
		self

	get fullName
		""

	def eval block, ctx
		@stack.push(@context = ctx)
		var res = block()
		var after = do
			@stack.pop
			@context = @stack[@stack[:length] - 1]
			self

		if res and res:then
			return res.then(after,after)
		else
			after()
			return Promise.resolve(self)

	def describe name, blk
		@blocks.push SpecGroup.new(name, blk, self)
	
	def test name, blk
		@blocks.push SpecExample.new(name, blk, self)
		
	def step i = 0, &blk
		Spec.CURRENT = self
		var block = @blocks[i]
		return @finish() unless block
		Imba.once(block,'done') do step(i+1)
		block.run()

	def run
		Promise.new do |resolve,reject|
			Imba.once(self,'done') do
				resolve([1,2,3,4])
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

		console.log("spec:done",{failed: failed.length, passed: ok.length})

		# for item in failed
		# 	console.log item.fullName
		# 	if item.details
		# 		console.log "    " + item.details

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
		Imba.once(block,'done') do @run(i+1)
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
		self

	get fullName
		"{@parent.fullName}{@name}"

	def emit ev, pars
		Imba.emit(self,ev,pars)
	
	def eq actual, expected, format = null
		assert(actual == expected,["expected",expected,"got",actual])

	def assert expression, *msg		
		SpecAssert.new(self, expression, msg)

	def run
		@start()
		# does a block really need to run here?
		var promise = (@block ? SPEC.eval(@block, self) : Promise.resolve({}))
		try
			var res = await promise
		catch e
			console.log "error from run!"
		@evaluated = yes
		@finish()

	def start
		@emit(:start)
	
	def finish
		@failed ? @fail() : @pass()
		@log("spec:test", name: @fullName, failed: @failed)
		@emit(:done,[self])

	def fail

		@log("%c✘ {@fullName}", "color:red")
		# @print("✘")

	def pass
		@log("%c✔ {@fullName}", "color:green")
		# @print("✔")

	get failed
		@assertions.some do |ass| ass.failed

	get passed
		!@failed()

global class SpecAssert < SpecComponent

	def initialize parent,assertion,message
		@parent = parent
		@assertion = assertion
		@message = message
		parent.assertions.push(self)
		!!@assertion ? @pass() : @fail()
		self

	get failed
		!@assertion

	get passed
		!!@assertion
	
	def fail
		self
		# console.log("%c✘", "color:red")
		# console.assert(@assertion,*@message)
		# @print("✘")

	def pass
		self
		# console.log("%c✔", "color:green")
		# @print("✔")

SPEC = Spec.new

# global def p do console.log(*arguments)
global def describe name, blk do SPEC.context.describe(name,blk)
global def test name, blk do SPEC.context.test(name,blk)
global def eq actual, expected, format do  SPEC.context.eq(actual, expected, format)
global def ok actual, message do SPEC.context.eq(!!actual, true, message)
global def assert expression do SPEC.context.assert(expression)

