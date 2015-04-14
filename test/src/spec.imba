# $current_describe_block = null
# $current_it_block = null
# SPEC_STACK = []

TERMINAL_COLOR_CODES =
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

extend class String
	def color code
		# return self if we are in client
		return toString if console:group

		code = TERMINAL_COLOR_CODES[code]
		var resetStr = "\x1B[0m"
		var resetRegex = /\x1B\[0m/g
		var codeRegex = /\x1B\[\d+m/g
		var tagRegex = /(<\w+>|<A\d+>)|(<\/\w+>|<A\d+>)/i
		var numRegex = /\d+/
		var str = ('' + self).replace resetRegex, "{resetStr}\x1B[{code}m" # allow nesting
		str = "\x1B[{code}m{str}{resetStr}"
		return str

def fmt color, str
	str.color(color)
	

global class Spec

	prop blocks
	prop context
	prop stack

	def initialize
		@blocks = []
		@stack = [@context = self]
		self

	def eval block, ctx
		@stack.push(@context = ctx)
		block()
		@stack.pop
		@context = @stack[@stack[:length] - 1] # hmm
		self

	def describe name, blk
		if @context == self
			@blocks.push SpecGroup.new(name, blk)
		else
			@context.describe(name,blk)
		
	def run i = 0
		# p "SPEC.run {i}"
		var block = @blocks[i]

		# we need the notifications
		return finish unless block
		Imba.once(block,'done') do run(i+1)
		block.run

	
	def finish
		Imba.emit(self, :done, [self])

	# def describe name, blk do SPEC.context.describe(name,blk)
	def it name, blk do SPEC.context.it(name,blk)
	def test name, blk do SPEC.context.it(name,blk)
	def eq actual, expected, format do  SPEC.context.eq(actual, expected, format)
	def match actual, expected, format do  SPEC.context.match(actual, expected, format)
	def ok actual do SPEC.context.assertion( SpecAssertTruthy.new(SPEC.context, actual) )
	def assert expression do SPEC.context.assert(expression)
	def await do SPEC.context.await(*arguments)

	# def self.call scope, method, *args
	# 	SpecCaller.new(scope,method,args)

#
#	# def self.context
#	# 	@context || instance
#		
#	# def self.stack
#	# 	@stack ||= [instance]
#	# 
#	# def self.run
#	# 	instance.run
#

global class SpecCaller

	def initialize scope, method, args
		@scope = scope
		@method = method
		@args = args

	def run
		@value ?= @scope[@method](*@args)

global class SpecGroup

	def initialize name, blk
		@name = name
		@blocks = []
		SPEC.eval(blk,self) if blk
		self
	
	def blocks
		@blocks

	def describe name, blk
		@blocks.push SpecGroup.new name, blk
	
	def it name, blk
		@blocks.push SpecExample.new name, blk

	def emit ev, pars
		Imba.emit(self,ev,pars)
	
	def run i = 0
		start if i == 0
		var block = @blocks[i]
		return finish unless block
		Imba.once(block,'done') do run(i+1)
		# block.once :done do run(i+1)
		block.run
	
	def start
		emit(:start, [self])

		if console:group
			console.group @name
		else
			console.log "\n-------- {@name} --------"
		
		
	def finish
		console.groupEnd if console:groupEnd
		emit(:done, [self])


global class SpecExample

	def initialize name, block
		@evaluated = no
		@name = name
		@block = block
		@assertions = []
		self

	def emit ev, pars
		Imba.emit(self,ev,pars)
	
	def await
		assertion(SpecAwait.new(self, $0)).callback
	
	def eq actual, expected, format = null
		assertion(SpecAssert.new(self, actual, expected, format))

	def assert expression
		assertion(SpecAssert.new(self, expression))

	def assertion ass
		@assertions.push ass
		Imba.once(ass, :done) do finish if @evaluated && @assertions.every(|a| a.done )
		ass
	
	def run
		SPEC.eval(@block, self) if @block
		@evaluated = yes
		finish if @assertions.every(|a| a.done)
	
	def finish
		var details = []
		var dots = @assertions.map do |v,i|
			if v.success
				fmt(:green,"✔")
			else
				details.push(" - {v.details}")
				fmt(:red,"✘")
				
		var str = "{@name} {dots.join(" ")}"
		console.log(str)
		console.log(details.join("\n")) if details:length > 0
		emit(:done,[self])

global class SpecObject

	def ok actual
		SPEC.ok(actual)

global class SpecCondition

	prop success

	def state
		yes
	
	def failed
		@done = yes
		@success = no
		emit :done, [no]
		yes
	
	def passed
		@done = yes
		@success = yes
		emit :done, [yes]
		yes

	def emit ev, pars
		Imba.emit(self,ev,pars)
	
	def done
		@done

	def details
		"error?"

global class SpecAwait < SpecCondition

	# #initialize
	# 0. example <Object>
	# 1. args <Function>
	def initialize example, args
		@example = example
		@args = args

		# TODO extract options
		# TODO extract times the method should be called

		@timeout = Imba.delay(100) do failed

		@callback = do |*args|
			Imba.clearTimeout(@timeout)
			args.equals(@args[0]) ? passed : failed

		self
	
	def callback
		@callback

global class SpecAssert < SpecCondition
	def initialize example, actual, expected, format = null
		@example = example
		@actual = actual
		@expected = expected
		@format = format
		if expected isa Array
			@format ||= String
		run
		self
	
	def run
		var value = @actual isa SpecCaller ? @actual.run : @actual
		test(@value = value)

	def test value
		if value && value[:equals]
			value.equals(expected) ? passed : failed
		elif @format
			@left = @format(value)
			@right = @format(@expected)
			@left == @right ? passed : failed
		else
			(value == @expected) ? passed : failed
	
	def failed
		if console:group
			console.error("expected",@expected,"got",@actual,self)
		super.failed

	def details
		unless @success
			if @format
				fmt(:red,"expected {@right} got {@left}")
			else
				fmt(:red,"expected {@expected} got {@value}")
		else
			"passed test"

global class SpecAssertTruthy < SpecAssert

	def initialize example, value
		@example = example
		@actual = value
		run

	def test value
		!!(value) ? passed : failed

global class SpecAssertFalsy < SpecAssert

	def initialize example, value
		@example = example
		@actual = value
		run

	def test value
		!(value) ? passed : failed
		
# 
# # extending object?!
# # use extend syntax instead?

# Want to extend root(!)
# class Object

SPEC = Spec.new

# describe 'Syntax - Assignment' do
# 	true
# 	describe "test" do
# 		false
# 
# 		test "one" do
# 			eq(1, 1)
# 			true
# 
# def describe name, blk
# 		if @context == self
# 			@blocks.push SpecGroup.new(name, blk)
# 		else
# 
global def p do console.log(*arguments)
global def describe name, blk do SPEC.context.describe(name,blk)
global def it name, blk do SPEC.context.it(name,blk)
global def test name, blk do SPEC.context.it(name,blk)
global def eq actual, expected, format do  SPEC.context.eq(actual, expected, format)
global def match actual, expected, format do  SPEC.context.match(actual, expected, format)
global def ok actual do SPEC.context.assertion( SpecAssertTruthy.new(SPEC.context, actual) )
global def assert expression do SPEC.context.assert(expression)
global def await do SPEC.context.await(*arguments)


