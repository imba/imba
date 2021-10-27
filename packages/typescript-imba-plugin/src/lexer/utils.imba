import {Range} from './structures'

export class Converter
	def constructor rules, matcher
		self.cache = {}
		self.rules = rules
		self.matcher = matcher

	def convert value
		for rule in rules
			if matcher
				if matcher(rule[0],value)
					return value[1]
			# if type.indexOf(strtest) >= 0 and (modtest == 0 or mods & modtest)
			#	console.log 'found?',strtest
			#	return flags
		return 0

export def matchToken token, match
	let typ = token.type
	if match isa RegExp
		return typ.match(match)
	elif typeof match == 'string'
		return typ.indexOf(match) == 0 and (!typ[match.length] or typ[match.length] == '.')

export def prevToken start, pattern, max = 100000
	let tok = start
	while tok and max > 0
		return tok if tok.match(pattern)
		max--
		tok = tok.prev
	return null

export def pascalCase str
	str.replace(/(^|[\-\_\s])(\w)/g) do $3.toUpperCase!

export def toCustomTagIdentifier str
	'Γ' + toJSIdentifier(str)
	# toPascalCase(str + '-custom-element')
	
export def computeLineOffsets text, isAtLineStart, textOffset
	if textOffset === undefined
		textOffset = 0

	var result = isAtLineStart ? [textOffset] : []
	var i = 0
	while i < text.length
		var ch = text.charCodeAt(i)
		if ch === 13 || ch === 10
			if ch === 13 && (i + 1 < text.length) && text.charCodeAt(i + 1) === 10
				i++
			result.push(textOffset + i + 1)
		i++
	return result

export def getWellformedRange range
	var start = range.start
	var end = range.end
	if start.line > end.line || start.line === end.line && start.character > end.character
		return new Range(end,start) # { start: end, end: start }
	return range isa Range ? range : (new Range(start,end))

export def getWellformedEdit textEdit
	var range = getWellformedRange(textEdit.range)
	if range !== textEdit.range
		return { newText: textEdit.newText, range: range }
	return textEdit

export def mergeSort data, compare
	if data.length <= 1
		return data
	var p = (data.length / 2) | 0
	var left = data.slice(0, p)
	var right = data.slice(p)
	mergeSort(left, compare)
	mergeSort(right, compare)
	var leftIdx = 0
	var rightIdx = 0
	var i = 0
	while leftIdx < left.length && rightIdx < right.length
		var ret = compare(left[leftIdx], right[rightIdx])
		if ret <= 0
			// smaller_equal -> take left to preserve order
			data[i++] = left[leftIdx++]
		else
			// greater -> take right
			data[i++] = right[rightIdx++]

	while (leftIdx < left.length)
		data[i++] = left[leftIdx++]

	while (rightIdx < right.length)
		data[i++] = right[rightIdx++]

	return data

export def editIsFull e
		return e !== undefined && e !== null && typeof e.text === 'string' && e.range === undefined

export def editIsIncremental e
	return !editIsFull(e) && (e.rangeLength === undefined or typeof e.rangeLength === 'number')


export def fastExtractSymbols text
	let lines = text.split(/\n/)
	let symbols = []
	let scope = {indent: -1,children: []}
	let root = scope
	# symbols.root = scope
	let m
	let t0 = Date.now!

	for line,i in lines
		if line.match(/^\s*$/)
			continue

		let indent = line.match(/^\t*/)[0].length

		while scope.indent >= indent
			scope = scope.parent or root 

		m = line.match(/^(\t*((?:export )?(?:static )?(?:extend )?)(class|tag|def|get|set|prop|attr) )(\@?[\w\-\$\:]+(?:\.[\w\-\$]+)?)/)
		# m ||= line.match(/^(.*(def|get|set|prop|attr) )([\w\-\$]+)/)

		if m
			let kind = m[3]
			let name = m[4]
			let ns = scope.name ? scope.name + '.' : ''
			let mods = m[2].trim().split(/\s+/)
			let md = ''

			let span = {
				start: {line: i, character: m[1].length}
				end: {line: i, character: m[0].length}
			}

			let symbol = {
				kind: kind
				ownName: name
				name: ns + name
				span: span
				indent: indent
				modifiers: mods
				children: []
				parent: scope == root ? null : scope
				type: kind
				data: {}
				static: mods.indexOf('static') >= 0
				extends: mods.indexOf('extend') >= 0
			}

			if symbol.static
				symbol.containerName = 'static'
			
			symbol.containerName = m[2] + m[3]
				
			
			if kind == 'tag' and m = line.match(/\<\s+([\w\-\$\:]+(?:\.[\w\-\$]+)?)/)
				symbol.superclass = m[1]

			if scope.type == 'tag'
				md = "```html\n<{scope.name} {name}>\n```\n"
				symbol.description = {kind: 'markdown',value: md}

			scope.children.push(symbol)
			scope = symbol

			symbols.push(symbol)
	
	root.all = symbols
	console.log 'fast outline',text.length,Date.now! - t0
	return root
	
# To avoid collisions etc with symbols we are using
# greek characters to convert special imba identifiers
# to valid js identifiers.
export const ToJSMap = {
	'-': 'Ξ'
	'?': 'Φ'
	'#': 'Ψ'
	'@': 'α'
}

const toJSregex = new RegExp("[\-\?\#\@]","gu")
const toJSreplacer = do(m) ToJSMap[m]

export def toJSIdentifier raw
	raw.replace(toJSregex,toJSreplacer)

export const ToImbaMap = {
	'Ξ': '-'
	'Φ': '?'
	'Ψ': '#'
	'Γ': ''
	'α': '@'
}

const toImbaRegex = new RegExp("[ΞΦΨΓα]","gu")
const toImbaReplacer = do(m) ToImbaMap[m]

export def toImbaIdentifier raw
	raw ? raw.replace(toImbaRegex,toImbaReplacer) : raw
	
export def toImbaString str
	unless typeof str == 'string'
		# log('cannot convert to imba string',str)
		return str

	str = str.replace(toImbaRegex,toImbaReplacer)
	return str
	
export def toImbaMessageText str
	if typeof str == 'string'
		return toImbaString(str)
	if str.messageText
		str.messageText = toImbaMessageText(str.messageText)
	
	return str
	

export def fromJSIdentifier raw
	toImbaIdentifier(raw)
	
export def displayPartsToString parts
	fromJSIdentifier(global.ts.displayPartsToString(parts))