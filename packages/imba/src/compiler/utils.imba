const pairs = {
	'[':']'
	'{':'}'
	'<':'>'
	'(':')'
	'"':'"'
	"'":'"'
}

export def removeNestedPairs str
	let stack = []
	let i = 0
	let replaces = []
	let out = ""

	while i < str.length
		let chr = str.charAt(i)
		let end = stack[0]
		let instr = end == '"' or end == "'"

		if chr and chr == end
			stack.shift()
			chr = null

		if chr and !end and !pairs[chr]
			out += chr

		elif !end and (chr == ')' or chr == ']' or chr == '}' or chr == '>')
			break

		elif chr == '('
			stack.unshift(')')
		elif chr == '['
			stack.unshift(']')
		elif chr == '{'
			stack.unshift('}')
		elif chr == '<'
			stack.unshift('>')
		elif chr == '"'
			stack.unshift('"')
		elif chr == "'"
			stack.unshift("'")
		elif !end and chr == '>'
			break
		
		i++

	return out

export def extractGenericNames str
	let out = removeNestedPairs(str.slice(1,-1)).split(/\,\s*/g).map(do $1.split(/\W/)[0]).join(',')
	'<' + out + '>'
