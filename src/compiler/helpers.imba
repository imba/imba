
export def brace str
	var lines = str.match(/\n/)
	# what about indentation?

	if lines
		'{' + str + '\n}'
	else
		'{\n' + str + '\n}'

export def normalizeIndentation str
	var m
	var reg = /\n+([^\n\S]*)/g
	var ind = null

	while m = reg.exec(str)
		var attempt = m[1]
		if ind is null or 0 < attempt:length < ind:length
			ind = attempt

	str = str.replace(RegExp("\\n{ind}","g"), '\n') if ind
	return str


export def flatten arr
	var out = []
	arr.forEach do |v| v isa Array ? out:push.apply(out,flatten(v)) : out.push(v)
	return out


export def pascalCase str
	str.replace(/(^|[\-\_\s])(\w)/g) do |m,v,l| l.toUpperCase

export def camelCase str
	str = String(str)
	# should add shortcut out
	str.replace(/([\-\_\s])(\w)/g) do |m,v,l| l.toUpperCase

export def dashToCamelCase str
	str = String(str)
	if str.indexOf('-') >= 0
		# should add shortcut out
		str = str.replace(/([\-\s])(\w)/g) do |m,v,l| l.toUpperCase
	return str

export def snakeCase str
	var str = str.replace(/([\-\s])(\w)/g,'_')
	str.replace(/()([A-Z])/g,"_$1") do |m,v,l| l.toUpperCase

export def setterSym sym
	dashToCamelCase("set-{sym}")

export def quote str
	'"' + str + '"'

export def singlequote str
	"'" + str + "'"

export def symbolize str
	str = String(str)
	var end = str.charAt(str:length - 1)

	if end == '='
		str = 'set' + str[0].toUpperCase + str.slice(1,-1)

	if str.indexOf("-") >= 0
		str = str.replace(/([\-\s])(\w)/g) do |m,v,l| l.toUpperCase
			
	return str


export def indent str
	String(str).replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n")

export def bracketize str, ind = yes
	str = "\n" + indent(str) + "\n" if ind
	'{' + str + '}'
	
export def parenthesize str
	'(' + String(str) + ')'

export def unionOfLocations *locs
	var a = Infinity
	var b = -Infinity

	for loc in locs
		if loc and loc.@loc != undefined
			loc = loc.@loc

		if loc and loc:loc isa Function
			loc = loc.loc

		if loc isa Array
			a = loc[0] if a > loc[0]
			b = loc[1] if b < loc[0]
		elif loc isa Number
			a = loc if a > loc
			b = loc if b < loc

	return [a,b]
				


export def locationToLineColMap code
	var lines = code.split(/\n/g)
	var map = []

	var chr
	var loc = 0
	var col = 0
	var line = 0

	while chr = code[loc]
		map[loc] = [line,col]

		if chr == '\n'
			line++
			col = 0
		else
			col++

		loc++

	return map

export def markLineColForTokens tokens, code
	self