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


export def brace str
	var lines = str.match(/\n/)
	# what about indentation?

	if lines
		'{' + str + '\n}'
	else
		'{\n' + str + '\n}'

export def flatten arr
	var out = []
	arr.forEach do |v| v isa Array ? out:push.apply(out,flatten(v)) : out.push(v)
	return out

# NEXT extend class is needed for ast
extend class String
	def color code
		var code = TERMINAL_COLOR_CODES[code]
		var resetStr = "\x1B[0m"
		var resetRegex = /\x1B\[0m/g
		var codeRegex = /\x1B\[\d+m/g
		var tagRegex = /(<\w+>|<A\d+>)|(<\/\w+>|<A\d+>)/i
		var numRegex = /\d+/
		var str = ('' + self).replace resetRegex, "{resetStr}\x1B[{code}m" # allow nesting
		str = "\x1B[{code}m{str}{resetStr}"
		return str

	def red do color('red')
	def green do color('green')
	def yellow do color('yellow')
	def blue do color('blue')
	def magenta do color('magenta')
	def cyan do color('cyan')
	def white do color('white')

	def pascalCase
		this.replace(/(^|[\-\_\s])(\w)/g) do |m,v,l| l.toUpperCase

	def camelCase
		this.replace(/([\-\_\s])(\w)/g) do |m,v,l| l.toUpperCase

	def snakeCase
		var str = this.replace(/([\-\s])(\w)/g,'_')
		str.replace(/()([A-Z])/g,"_$1") do |m,v,l| l.toUpperCase

	def toSymbol
		var sym = self.replace(/(.+)\=$/,"set-$1")
		sym = sym.replace(/(.+)\?$/,"is-$1")
		sym.replace(/([\-\s])(\w)/g) do |m,v,l| l.toUpperCase
		
	def toSetter
		"set-{self}".camelCase

	def brackets
		'{' + toString + '}'

	def wrap typ
		'{' + "\n" + indent + "\n" + '}'
	
	def indent
		# hmm
		self.replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n")

	def c
		"" + self

	# def value
	# 	self

	def quoted
		'"' + self + '"'

	def parenthesize
		'(' + self + ')'
		

	def identifier
		AST.Identifier.new(self)

	def traverse
		# p "string should not be traversed".red
		self

	def region
		self:_region

	def loc
		self:_region		

	def toAST deep = no
		AST.Str.new(JSON.stringify(self))

	def node
		self

# Extensions to make compiler more compact etc
extend class Array

	def flatten
		var a = []
		forEach do |v| v isa Array ? a:push.apply(a,v.flatten) : a.push(v)
		return a

	# def inspect
	# 	map do |v| v && v:inspect ? v.inspect : v

	def compact
		filter do |v| v != undefined && v != nil

	def unique
		var a = []
		forEach do |v| a.push(v) if a.indexOf(v) == -1
		return a

	def last
		self[self:length - 1]

	def c
		map do |v| v.c

	def indent
		c.join("\n")

	def dump key
		map do |v| v && v:dump ? v.dump(key) : v

	def block
		AST.Block.wrap(self)

	def count
		self:length

	def toAST deep = no
		var items = self
		items = self.map(|v| v:toAST ? v.toAST(deep) : v) if deep
		AST.Arr.new(items)
		
extend class Number

	def traverse
		p "string should not be traversed".red
		
	def c
		"" + self

	def toAST
		AST.Num.new(self)

	def loc
		self:_region or [0,0]
		