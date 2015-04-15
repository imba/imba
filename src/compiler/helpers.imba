
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
	String(str).replace(/([\-\_\s])(\w)/g) do |m,v,l| l.toUpperCase

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
	var sym = String(str).replace(/(.+)\=$/,"set-$1")
	sym = sym.replace(/(.+)\?$/,"is-$1")
	sym = sym.replace(/([\-\s])(\w)/g) do |m,v,l| l.toUpperCase
	return sym

export def indent str
		# hmm
		String(str).replace(/^/g,"\t").replace(/\n/g,"\n\t").replace(/\n\t$/g,"\n")

export def bracketize str, ind = yes
		str = "\n" + indent(str) + "\n" if ind
		'{' + str + '}'
	
export def parenthesize str
		'(' + String(str) + ')'