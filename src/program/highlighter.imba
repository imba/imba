import {M} from './types'

const replacements = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
};

const typenames = {
	'[': 'square open'
	']': 'square close'
	'{': 'curly open'
	'}': 'curly close'
	'(': 'paren open'
	')': 'paren close'
}

def escape str
	str.replace(/[\&\<\>]/g) do(m) replacements[m]

def classify types
	types.join(' ').replace(/[\[\]\{\}\(\)]/g) do(m) typenames[m]

export def highlight tokens, {verbose = no}
	let parts = []
	# console.log(tokens)
	let depth = 0
	let counter = 0
	let ids = []

	# tokens = analyze(tokens)

	for token in tokens
		let value = token.value
		let types = token.type.split('.')
		let [typ,subtyp] = types
		let mods = token.mods

		if token.var
			let id = ids.indexOf(token.var)
			if id == -1
				id = ids.push(token.var) - 1
			types.push('vref')
			types.push('var'+id)
			types.push(token.var.type + '-ref')
			mods |= token.var.mods
			# if token.var.token == token
			#	types.push('decl')

		if mods & M.Declaration
			types.push('decl')

		if mods & M.Root
			types.push('root')

		if mods & M.Local
			types.push('local')

		if subtyp == 'start' or subtyp == 'open'
			parts.push("<b class='{typ}'>")
			continue unless value

		if (subtyp == 'end' or subtyp == 'close') and !value
			parts.push('</b>')
			continue

		if typ == 'push'
			value = String(++depth)
			let kind = subtyp.indexOf('_') >= 0 ? 'group' : 'scope'
			let end = token.scope && token.scope.end
			
			parts.push("<div class='{kind}-{subtyp.split('_').pop!} _{subtyp} l{depth} o{token.offset} e{end && end.offset}'>")
			continue
		elif typ == 'pop'
			value = String(--depth)
			parts.push("</div>")
			continue

		if typ != 'white' and typ != 'line'
			value = "<i class='{classify types} o{token.offset}'>{escape(value or '')}</i>"
		elif typ == 'white' and value != '\n'
			value = "<i raw='{JSON.stringify(value)}'>{escape(value or '')}</i>"

		parts.push(value)

		if subtyp == 'end' or subtyp == 'close'
			parts.push('</b>')

	return parts.join('')