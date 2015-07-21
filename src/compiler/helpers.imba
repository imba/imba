
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


export def pascalCase str
	str.replace(/(^|[\-\_\s])(\w)/g) do |m,v,l| l.toUpperCase

export def camelCase str
	str = String(str)
	# should add shortcut out
	str.replace(/([\-\_\s])(\w)/g) do |m,v,l| l.toUpperCase

export def snakeCase str
	var str = str.replace(/([\-\s])(\w)/g,'_')
	str.replace(/()([A-Z])/g,"_$1") do |m,v,l| l.toUpperCase

export def setterSym sym
	camelCase("set-{sym}")

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